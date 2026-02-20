use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, MintTo};
use crate::state::*;

#[derive(Accounts)]
pub struct TriggerInflation<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"global_config"],
        bump = global_config.bump,
        has_one = admin,
        has_one = lxr_mint,
        has_one = lxr_vault_rewards,
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(mut)]
    pub lxr_mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub lxr_vault_rewards: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
pub struct ManualBurn<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"global_config"],
        bump = global_config.bump,
        has_one = admin,
        has_one = lxr_mint,
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(mut)]
    pub lxr_mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub burn_from_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
}

pub fn trigger_inflation_handler(ctx: Context<TriggerInflation>) -> Result<()> {
    let clock = Clock::get()?;
    let current_time = clock.unix_timestamp;
    
    // Time-Lock: Inflation starts Jan 1, 2030
    require!(current_time >= 1_893_456_000, crate::ErrorCode::InflationNotReady);
    
    let last_time = ctx.accounts.global_config.last_inflation_timestamp;
    let interval = if ctx.accounts.global_config.inflation_interval == 0 {
        157_680_000 
    } else {
        ctx.accounts.global_config.inflation_interval
    };

    require!(current_time >= last_time + interval, crate::ErrorCode::InflationNotReady);

    let rate = if ctx.accounts.global_config.inflation_rate_bps == 0 {
        250 
    } else {
        ctx.accounts.global_config.inflation_rate_bps
    };

    let current_supply = ctx.accounts.lxr_mint.supply;
    let mint_amount = current_supply
        .checked_mul(rate as u64)
        .ok_or(crate::ErrorCode::ArithmeticError)?
        .checked_div(10000)
        .ok_or(crate::ErrorCode::ArithmeticError)?;

    token_interface::mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.lxr_mint.to_account_info(),
                to: ctx.accounts.lxr_vault_rewards.to_account_info(),
                authority: ctx.accounts.admin.to_account_info(),
            }
        ),
        mint_amount,
    )?;

    ctx.accounts.global_config.last_inflation_timestamp = current_time;

    msg!("Inflation Triggered: {} LXR minted to Luxor Rewards Vault.", mint_amount);
    Ok(())
}

pub fn manual_burn_handler(ctx: Context<ManualBurn>, amount: u64) -> Result<()> {
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        anchor_spl::token_interface::Burn {
            mint: ctx.accounts.lxr_mint.to_account_info(),
            from: ctx.accounts.burn_from_account.to_account_info(),
            authority: ctx.accounts.admin.to_account_info(),
        },
    );
    token_interface::burn(cpi_ctx, amount)?;
    
    ctx.accounts.global_config.total_lxr_burned += amount;
    
    msg!("Manual Burn: Removed {} LXR from circulation.", amount);
    Ok(())
}
