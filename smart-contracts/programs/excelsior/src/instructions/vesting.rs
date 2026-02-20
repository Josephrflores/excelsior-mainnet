use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked};
use crate::state::vesting::*;

#[derive(Accounts)]
pub struct CreateVesting<'info> {
    #[account(mut)]
    pub admin: Signer<'info>, // Payer and Creator

    #[account(
        init,
        payer = admin,
        space = VestingSchedule::LEN,
        seeds = [b"vesting", beneficiary.key().as_ref(), mint.key().as_ref()],
        bump
    )]
    pub vesting_schedule: Account<'info, VestingSchedule>,

    /// CHECK: The user who will receive tokens
    pub beneficiary: UncheckedAccount<'info>,

    #[account(mut)]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = admin,
        token::mint = mint,
        token::authority = vesting_schedule,
        seeds = [b"vesting_vault", vesting_schedule.key().as_ref()],
        bump
    )]
    pub vesting_vault: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub admin_token_account: InterfaceAccount<'info, TokenAccount>, // Source of tokens

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimVesting<'info> {
    #[account(mut)]
    pub beneficiary: Signer<'info>, // Only beneficiary can claim (or anyone? usually beneficiary)

    #[account(
        mut,
        seeds = [b"vesting", beneficiary.key().as_ref(), mint.key().as_ref()],
        bump = vesting_schedule.bump,
        has_one = beneficiary,
        has_one = mint,
        has_one = vault,
    )]
    pub vesting_schedule: Account<'info, VestingSchedule>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub beneficiary_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
}


pub fn create_vesting_handler(
    ctx: Context<CreateVesting>, 
    amount: u64, 
    start_time: i64, 
    cliff_time: i64, 
    end_time: i64,
    tge_percentage: u16, // Basis Points
    is_private_investor: bool,
) -> Result<()> {
    require!(end_time > start_time, crate::ErrorCode::InvalidProof); // Reuse error or make new one
    require!(amount > 0, crate::ErrorCode::InvalidProof);

    let schedule = &mut ctx.accounts.vesting_schedule;
    schedule.beneficiary = ctx.accounts.beneficiary.key();
    schedule.mint = ctx.accounts.mint.key();
    schedule.vault = ctx.accounts.vesting_vault.key();
    schedule.admin = ctx.accounts.admin.key();
    schedule.total_amount = amount;
    schedule.released_amount = 0;
    schedule.start_time = start_time;
    schedule.cliff_time = cliff_time;
    schedule.end_time = end_time;
    schedule.tge_percentage = tge_percentage;
    schedule.is_private_investor = is_private_investor;
    schedule.bump = ctx.bumps.vesting_schedule;

    // Transfer tokens to Vault
    let cpi_accounts = TransferChecked {
        from: ctx.accounts.admin_token_account.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.vesting_vault.to_account_info(),
        authority: ctx.accounts.admin.to_account_info(),
    };
    token_interface::transfer_checked(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
        amount,
        ctx.accounts.mint.decimals,
    )?;

    msg!("Vesting Schedule Created for: {} (Private: {})", ctx.accounts.beneficiary.key(), is_private_investor);
    Ok(())
}

pub fn claim_vested_handler(ctx: Context<ClaimVesting>) -> Result<()> {
    let schedule = &mut ctx.accounts.vesting_schedule;
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;

    // 0. Pre-check: Not started
    if now < schedule.start_time {
        msg!("Vesting has not started.");
        return Ok(());
    }

    // 1. Calculate TGE Amount
    let tge_amount = (schedule.total_amount as u128)
        .checked_mul(schedule.tge_percentage as u128)
        .ok_or(crate::ErrorCode::ArithmeticError)?
        .checked_div(10000)
        .ok_or(crate::ErrorCode::ArithmeticError)? as u64;

    // 2. Calculate Linear Vesting Amount (on the Remainder)
    let linear_total = schedule.total_amount
        .checked_sub(tge_amount)
        .ok_or(crate::ErrorCode::ArithmeticError)?;
    
    let linear_vested = if now >= schedule.end_time {
        linear_total
    } else if now < schedule.cliff_time {
        0 // Before cliff, only TGE is available (if start_time reached)
    } else {
        let time_elapsed = (now - schedule.start_time) as u128;
        let total_duration = (schedule.end_time - schedule.start_time) as u128;
        
        (linear_total as u128)
            .checked_mul(time_elapsed)
            .ok_or(crate::ErrorCode::ArithmeticError)?
            .checked_div(total_duration)
            .ok_or(crate::ErrorCode::ArithmeticError)? as u64
    };

    // 3. Total Vested
    let total_vested = tge_amount
        .checked_add(linear_vested)
        .ok_or(crate::ErrorCode::ArithmeticError)?;

    // 4. Calculate Claimable
    let claimable = total_vested.saturating_sub(schedule.released_amount);

    // 5. Transfer
    let beneficiary_key = schedule.beneficiary;
    let mint_key = schedule.mint;
    
    let signer_seeds = &[
        b"vesting",
        beneficiary_key.as_ref(),
        mint_key.as_ref(),
        &[schedule.bump],
    ];

    let cpi_accounts = TransferChecked {
        from: ctx.accounts.vault.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.beneficiary_token_account.to_account_info(),
        authority: ctx.accounts.vesting_schedule.to_account_info(),
    };

    token_interface::transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(), 
            cpi_accounts,
            &[signer_seeds]
        ),
        claimable,
        ctx.accounts.mint.decimals,
    )?;

    msg!("Claimed {} tokens.", claimable);
    Ok(())
}
