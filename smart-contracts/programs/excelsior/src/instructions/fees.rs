use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked};
use crate::state::*;

#[derive(Accounts)]
pub struct HarvestFees<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"global_config"],
        bump = global_config.bump,
        has_one = admin,
        has_one = lxr_mint,
        has_one = rwa_vault_lxr,
    )]
    pub global_config: Account<'info, GlobalConfig>,
    
    #[account(mut)]
    pub lxr_mint: InterfaceAccount<'info, Mint>,
    
    #[account(mut)]
    pub rwa_vault_lxr: InterfaceAccount<'info, TokenAccount>,
    
    // Fee Targets (30/30/40 Split - Boxed to reduce stack size)
    #[account(mut, address = global_config.fee_excelsior_vault)]
    pub fee_excelsior_vault: Box<InterfaceAccount<'info, TokenAccount>>, // 30%
    #[account(mut, address = global_config.fee_stable_reserve)]
    pub fee_stable_reserve: Box<InterfaceAccount<'info, TokenAccount>>, // 30%
    #[account(mut, address = global_config.fee_founder_wallet)]
    pub fee_founder_wallet: Box<InterfaceAccount<'info, TokenAccount>>, // 40%
    
    pub token_program: Interface<'info, TokenInterface>,
}

pub fn harvest_handler(ctx: Context<HarvestFees>) -> Result<()> {
    let pre_balance = ctx.accounts.rwa_vault_lxr.amount;
    
    // NOTE: Manual harvest required via CLI for Token-2022 withheld tokens.
    // This handler splits the harvested LXR already in the RWA Vault.
    
    ctx.accounts.rwa_vault_lxr.reload()?;
    let post_balance = ctx.accounts.rwa_vault_lxr.amount;
    
    let harvested_amount = post_balance.saturating_sub(pre_balance);
    
    if harvested_amount == 0 {
        msg!("No fees to harvest.");
        return Ok(());
    }
    
    // 3. 30/30/40 Split Distribution
    let founder_share = harvested_amount
        .checked_mul(40)
        .ok_or(crate::ErrorCode::ArithmeticError)?
        .checked_div(100)
        .ok_or(crate::ErrorCode::ArithmeticError)?;
    
    let stable_share = harvested_amount
        .checked_mul(30)
        .ok_or(crate::ErrorCode::ArithmeticError)?
        .checked_div(100)
        .ok_or(crate::ErrorCode::ArithmeticError)?;
    
    // Remainder to Excelsior Vault to avoid dust loss
    let excelsior_share = harvested_amount
        .checked_sub(founder_share)
        .ok_or(crate::ErrorCode::ArithmeticError)?
        .checked_sub(stable_share)
        .ok_or(crate::ErrorCode::ArithmeticError)?;

    let seeds = &[b"global_config".as_ref(), &[ctx.accounts.global_config.bump]];
    let signer = &[&seeds[..]];

    // A. Founder (40%)
    if founder_share > 0 {
        token_interface::transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.rwa_vault_lxr.to_account_info(),
                    mint: ctx.accounts.lxr_mint.to_account_info(),
                    to: ctx.accounts.fee_founder_wallet.to_account_info(),
                    authority: ctx.accounts.global_config.to_account_info(),
                },
                signer
            ),
            founder_share,
            ctx.accounts.lxr_mint.decimals
        )?;
    }

    // B. Stablecoin Reserve (30%)
    if stable_share > 0 {
        token_interface::transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.rwa_vault_lxr.to_account_info(),
                    mint: ctx.accounts.lxr_mint.to_account_info(),
                    to: ctx.accounts.fee_stable_reserve.to_account_info(),
                    authority: ctx.accounts.global_config.to_account_info(),
                },
                signer
            ),
            stable_share,
            ctx.accounts.lxr_mint.decimals
        )?;
    }

    // C. Excelsior Vault (30% + dust)
    if excelsior_share > 0 {
        token_interface::transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.rwa_vault_lxr.to_account_info(),
                    mint: ctx.accounts.lxr_mint.to_account_info(),
                    to: ctx.accounts.fee_excelsior_vault.to_account_info(),
                    authority: ctx.accounts.global_config.to_account_info(),
                },
                signer
            ),
            excelsior_share,
            ctx.accounts.lxr_mint.decimals
        )?;
    }

    msg!("Harvested {} LXR. Split: 40% Founder, 30% Stablecoin Reserve, 30% Excelsior Vault.", harvested_amount);
    Ok(())
}
