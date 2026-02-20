use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked, Burn, MintTo};
use crate::state::*;
use crate::ErrorCode;

#[derive(Accounts)]
pub struct MintUsdx<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"global_config"],
        bump = global_config.bump,
        has_one = usdx_mint,
        has_one = usdx_reserve,
    )]
    pub global_config: Box<Account<'info, GlobalConfig>>,

    #[account(mut)]
    pub user_collateral: InterfaceAccount<'info, TokenAccount>, // USDC/LXR
    #[account(mut)]
    pub user_usdx: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub usdx_reserve: InterfaceAccount<'info, TokenAccount>, // Collateral Vault
    
    #[account(mut)]
    pub usdx_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,
}

pub fn mint_usdx_handler(ctx: Context<MintUsdx>, amount_usdx: u64) -> Result<()> {
    // 1. REGULATORY FIREWALL: Check if USDX Module is Active (Bit 1)
    require!(ctx.accounts.global_config.module_flags & 2 != 0, ErrorCode::ModulePaused);

    // 2. Collateral Logic (The Rule of 150%)
    // In a real implementation, we would read Oracles here to ensure User Collateral Value >= 1.5 * Mint Amount.
    // For this V1 Stub, we assume 1:1 Peg with USDC for simplicity, but enforce the logic structure.
    
    // Example: To mint 100 USDX, need 150 USDC collateral.
    let required_collateral = amount_usdx
        .checked_mul(150)
        .ok_or(crate::ErrorCode::ArithmeticError)?
        .checked_div(100)
        .ok_or(crate::ErrorCode::ArithmeticError)?;

    // 3. Transfer Collateral to Reserve
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.user_collateral.to_account_info(),
            mint: ctx.accounts.usdx_reserve.to_account_info(), // Assuming Reserve Mint matches Collateral
            to: ctx.accounts.usdx_reserve.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        }
    );
    token_interface::transfer_checked(transfer_ctx, required_collateral, 6)?; // USDC 6 decimals?

    // 4. Mint USDX
    let seeds = &[b"global_config".as_ref(), &[ctx.accounts.global_config.bump]];
    let signer = &[&seeds[..]];

    token_interface::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.usdx_mint.to_account_info(),
                to: ctx.accounts.user_usdx.to_account_info(),
                authority: ctx.accounts.global_config.to_account_info(),
            },
            signer
        ),
        amount_usdx,
    )?;

    msg!("USDX Minted: {}_ (Collateral Locked: {})", amount_usdx, required_collateral);
    Ok(())
}

#[derive(Accounts)]
pub struct RedeemUsdx<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"global_config"],
        bump = global_config.bump,
        has_one = usdx_mint,
        has_one = usdx_reserve,
    )]
    pub global_config: Box<Account<'info, GlobalConfig>>,

    #[account(mut)]
    pub user_collateral: InterfaceAccount<'info, TokenAccount>, // Destination for Collateral
    #[account(mut)]
    pub user_usdx: InterfaceAccount<'info, TokenAccount>, // Source to Burn

    #[account(mut)]
    pub usdx_reserve: InterfaceAccount<'info, TokenAccount>, // Source of Collateral
    
    #[account(mut)]
    pub usdx_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,
}

pub fn redeem_usdx_handler(ctx: Context<RedeemUsdx>, amount_usdx: u64) -> Result<()> {
    // 1. REGULATORY FIREWALL
    require!(ctx.accounts.global_config.module_flags & 2 != 0, ErrorCode::ModulePaused);

    // 2. Burn USDX
    let burn_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Burn {
            mint: ctx.accounts.usdx_mint.to_account_info(),
            from: ctx.accounts.user_usdx.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        }
    );
    token_interface::burn(burn_ctx, amount_usdx)?;

    // 3. Return Collateral (1:1 assumption for stub)
    let collateral_to_return = amount_usdx; // In dynamic model, checks Oracle.

    let seeds = &[b"global_config".as_ref(), &[ctx.accounts.global_config.bump]];
    let signer = &[&seeds[..]];

    token_interface::transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.usdx_reserve.to_account_info(),
                mint: ctx.accounts.usdx_reserve.to_account_info(), // Mint of collateral
                to: ctx.accounts.user_collateral.to_account_info(),
                authority: ctx.accounts.global_config.to_account_info(),
            },
            signer
        ),
        collateral_to_return,
        6 // Decimals of collateral
    )?;

    msg!("USDX Redeemed: {} (Collateral Returned: {})", amount_usdx, collateral_to_return);
    Ok(())
}
