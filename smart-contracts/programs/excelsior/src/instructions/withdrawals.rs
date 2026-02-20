use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked};
use crate::state::*;

#[derive(Accounts)]
pub struct RequestWithdrawal<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"global_config"],
        bump = global_config.bump,
        has_one = admin,
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        init,
        payer = admin,
        space = WithdrawalRequest::LEN,
        seeds = [b"withdrawal", admin.key().as_ref(), global_config.daily_withdrawal_amount.to_le_bytes().as_ref()],
        bump
    )]
    pub withdrawal_request: Account<'info, WithdrawalRequest>,

    #[account(address = global_config.lxr_mint)]
    pub lxr_mint: Box<InterfaceAccount<'info, Mint>>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteWithdrawal<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"global_config"],
        bump = global_config.bump,
        has_one = admin,
        has_one = pyth_oracle,
        has_one = chainlink_oracle,
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        mut,
        has_one = admin,
        constraint = withdrawal_request.status == 0 @ crate::ErrorCode::InvalidRequestStatus
    )]
    pub withdrawal_request: Account<'info, WithdrawalRequest>,

    #[account(mut)]
    pub source_vault: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub destination: InterfaceAccount<'info, TokenAccount>,
    pub lxr_mint: InterfaceAccount<'info, Mint>,

    /// CHECK: Validated via GlobalConfig has_one
    pub pyth_oracle: UncheckedAccount<'info>,
    /// CHECK: Validated via GlobalConfig has_one
    pub chainlink_oracle: UncheckedAccount<'info>,

    pub token_program: Interface<'info, TokenInterface>,
}

pub fn request_withdrawal_handler(ctx: Context<RequestWithdrawal>, amount: u64, beneficiary: Pubkey) -> Result<()> {
    let clock = Clock::get()?;
    let config = &mut ctx.accounts.global_config;

    if clock.unix_timestamp > config.last_withdrawal_reset + 86400 {
        config.daily_withdrawal_amount = 0;
        config.last_withdrawal_reset = clock.unix_timestamp;
    }

    let total_supply = ctx.accounts.lxr_mint.supply;
    let limit = total_supply
        .checked_mul(config.max_daily_withdrawal_bps as u64)
        .ok_or(crate::ErrorCode::ArithmeticError)?
        .checked_div(10000)
        .ok_or(crate::ErrorCode::ArithmeticError)?;

    require!(config.daily_withdrawal_amount + amount <= limit, crate::ErrorCode::DailyLimitExceeded);

    config.daily_withdrawal_amount += amount;
    
    let request = &mut ctx.accounts.withdrawal_request;
    request.admin = ctx.accounts.admin.key();
    request.beneficiary = beneficiary;
    request.amount = amount;
    request.unlock_at = clock.unix_timestamp + config.timelock_duration;
    request.status = 0;
    request.bump = ctx.bumps.withdrawal_request;

    msg!("Withdrawal Requested: {} units. Locked until {}.", amount, request.unlock_at);
    Ok(())
}

pub fn execute_withdrawal_handler(ctx: Context<ExecuteWithdrawal>) -> Result<()> {
    let clock = Clock::get()?;
    let request = &mut ctx.accounts.withdrawal_request;
    
    require!(clock.unix_timestamp >= request.unlock_at, crate::ErrorCode::WithdrawalLocked);

    if ctx.accounts.source_vault.key() == ctx.accounts.global_config.rwa_vault_lxr {
        let pyth_info = ctx.accounts.pyth_oracle.to_account_info();
        let chainlink_info = ctx.accounts.chainlink_oracle.to_account_info();
        
        let price = crate::instructions::oracle_utils::get_secure_price(
            &ctx.accounts.global_config,
            &pyth_info,
            &chainlink_info,
        )?;
        
        require!(price > 0, crate::ErrorCode::RwaOracleInvalid);
        msg!("RWA Backing Verified via Oracle: ${}", price);
    }

    let bump = ctx.accounts.global_config.bump;
    let seeds: &[&[u8]] = &[
        b"global_config",
        &[bump]
    ];
    let signer = &[&seeds[..]];

    token_interface::transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.source_vault.to_account_info(),
                mint: ctx.accounts.lxr_mint.to_account_info(),
                to: ctx.accounts.destination.to_account_info(),
                authority: ctx.accounts.global_config.to_account_info(),
            },
            signer
        ),
        request.amount,
        ctx.accounts.lxr_mint.decimals,
    )?;

    request.status = 1; // Executed
    msg!("Withdrawal Executed: {} successfully transferred.", request.amount);
    Ok(())
}
