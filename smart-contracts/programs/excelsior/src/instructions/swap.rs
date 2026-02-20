use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked, Burn};
use crate::state::*;
use crate::instructions::oracle_utils;
use crate::ErrorCode;

#[derive(Accounts)]
pub struct BuyXls<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"global_config"],
        bump = global_config.bump,
    )]
    pub global_config: Box<Account<'info, GlobalConfig>>,

    #[account(
        seeds = [b"access_control"],
        bump = access_control.bump,
    )]
    pub access_control: Box<Account<'info, AccessControl>>,
    
    // User Accounts
    #[account(mut)]
    pub user_lxr_account: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut)]
    pub user_xls_account: Box<InterfaceAccount<'info, TokenAccount>>,
    
    // Vaults
    #[account(mut)] // Contract Vault holding XLS for sale
    pub xls_vault_supply: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut)] // RWA Vault receiving 70% LXR
    pub rwa_vault_lxr: Box<InterfaceAccount<'info, TokenAccount>>,
    
    // Mints
    #[account(address = global_config.xls_mint)]
    pub xls_mint: InterfaceAccount<'info, Mint>,
    #[account(mut, address = global_config.lxr_mint)]
    pub lxr_mint: InterfaceAccount<'info, Mint>,
    
    pub token_program: Interface<'info, TokenInterface>, // Must be Token-2022
}

#[derive(Accounts)]
pub struct RedeemXls<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"global_config"],
        bump = global_config.bump,
    )]
    pub global_config: Box<Account<'info, GlobalConfig>>,

    #[account(
        seeds = [b"access_control"],
        bump = access_control.bump,
    )]
    pub access_control: Box<Account<'info, AccessControl>>,
    
    #[account(mut)]
    pub user_lxr_account: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut)]
    pub user_xls_account: Box<InterfaceAccount<'info, TokenAccount>>,
    
    #[account(mut)]
    pub xls_vault_supply: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut)]
    pub rwa_vault_lxr: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: Constitutional Locked Vault (30% Exit Tax → DAO Burn/Reassign)
    #[account(mut, address = global_config.constitutional_locked_vault)]
    pub constitutional_locked_vault: Box<InterfaceAccount<'info, TokenAccount>>,
    
    #[account(mut, address = global_config.xls_mint)]
    pub xls_mint: InterfaceAccount<'info, Mint>,
    #[account(address = global_config.lxr_mint)]
    pub lxr_mint: InterfaceAccount<'info, Mint>,

    /// CHECK: Pyth Oracle Account for RWA Valuation
    pub pyth_rwa_account: UncheckedAccount<'info>,
    /// CHECK: Chainlink Fallback for RWA
    pub chainlink_rwa_account: UncheckedAccount<'info>,

    /// CHECK: Pyth Oracle Account for LXR Market Price
    pub pyth_lxr_account: UncheckedAccount<'info>,
    /// CHECK: Chainlink Fallback for LXR
    pub chainlink_lxr_account: UncheckedAccount<'info>,
    
    pub token_program: Interface<'info, TokenInterface>,
}

pub fn buy_handler(ctx: Context<BuyXls>, amount_xls: u64) -> Result<()> {
    require!(!ctx.accounts.access_control.paused, ErrorCode::Paused);
    
    // REGULATORY FIREWALL: Check if Excelsior (RWA) Module is Active (Bit 0)
    // If Flag 1 is OFF, buying XLS is strictly prohibited.
    require!(ctx.accounts.global_config.module_flags & 1 != 0, crate::ErrorCode::ModulePaused);

    // 1 XLS = 1,000,000 LXR (Atomic Units)
    let lxr_needed = amount_xls.checked_mul(1_000_000).ok_or(ProgramError::ArithmeticOverflow)?;
    
    // "Mint-by-Lock" Mechanic:
    // User Requirement: "Debe emitir 1 XLS solo cuando reciba 1,000,000 de LXR. Esos LXR... deben quedar BLOQUEADOS."
    // Instead of burning, we lock 100% of the LXR in the RWA Vault (Reserve).
    
    // 1. Transfer LXR to RWA Vault (Reserve)
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.user_lxr_account.to_account_info(),
            mint: ctx.accounts.lxr_mint.to_account_info(),
            to: ctx.accounts.rwa_vault_lxr.to_account_info(), // Destination: Reserve
            authority: ctx.accounts.user.to_account_info(),
        }
    );
    token_interface::transfer_checked(transfer_ctx, lxr_needed, ctx.accounts.lxr_mint.decimals)?;
    
    // Update Stats
    // We do NOT increment total_lxr_burned because they are locked, not burned.
    // We track staked XLS.
    ctx.accounts.global_config.total_staked_xls += amount_xls;
    
    // 2. Transfer XLS from Supply Vault to User
    // Use PDA Signer
    let seeds = &[b"global_config".as_ref(), &[ctx.accounts.global_config.bump]];
    let signer = &[&seeds[..]];
    
    let transfer_xls = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.xls_vault_supply.to_account_info(),
            mint: ctx.accounts.xls_mint.to_account_info(),
            to: ctx.accounts.user_xls_account.to_account_info(),
            authority: ctx.accounts.global_config.to_account_info(),
        },
        signer
    );
    token_interface::transfer_checked(transfer_xls, amount_xls, ctx.accounts.xls_mint.decimals)?;
    
    msg!("Mint-by-Lock Successful: Locked {} LXR in Reserve, Issued {} XLS", lxr_needed, amount_xls);
    Ok(())
}

pub fn redeem_handler(ctx: Context<RedeemXls>, amount_xls: u64) -> Result<()> {
    require!(!ctx.accounts.access_control.paused, ErrorCode::Paused);

    // 1. Return XLS to Supply Vault (Recycle instead of Burn)
    // User Requirement: "Never burn Excelsior" -> It must go back to the vault to be bought again.
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.user_xls_account.to_account_info(),
            mint: ctx.accounts.xls_mint.to_account_info(),
            to: ctx.accounts.xls_vault_supply.to_account_info(), // Return to supply
            authority: ctx.accounts.user.to_account_info(),
        }
    );
    token_interface::transfer_checked(transfer_ctx, amount_xls, ctx.accounts.xls_mint.decimals)?;
    
    // 2. Calculate LXR to return
    // Redemption rate may vary, for now let's assume 1:1 backing value or fixed rate?
    // User Spec said: "Redemption: If user returns 1 XLS, contract gives proportional value... from Reserve"
    // For V1, let's assume we return the 70% that was put in initially (Guaranteed Floor).
    // Or do we calculate based on Total Reserve / Total XLS?
    // Let's implement Dynamic Redemption: Share = (Amount XLS / Total XLS Supply) * RWA Vault Balance
    // NOTE: Simpler for now -> Return fixed ratio 700,000 LXR per XLS (The "Book Value").
    
    // 2. Calculate LXR to return (Dynamic Floor Price)
    // Formula: Max(700,000 LXR, (RWA_Value / LXR_Price))
    
    // Default Floor: 700,000 LXR per XLS
    let fixed_floor_lxr = amount_xls
        .checked_mul(700_000)
        .ok_or(crate::ErrorCode::ArithmeticError)?;

    // Dynamic Oracle Calculation
    let oracle_floor_lxr = (|| -> Result<u64> {
        let rwa_valuation = oracle_utils::get_secure_price(
             &ctx.accounts.global_config, 
             &ctx.accounts.pyth_rwa_account, 
             &ctx.accounts.chainlink_rwa_account
        )?;

        let lxr_price = oracle_utils::get_secure_price(
             &ctx.accounts.global_config, 
             &ctx.accounts.pyth_lxr_account, 
             &ctx.accounts.chainlink_lxr_account
        )?;

        let xls_supply = ctx.accounts.xls_mint.supply;
        if xls_supply == 0 { return Ok(0); } // Avoid div by zero

        // Math: (RWA_Valuation * 1e9) / (XLS_Supply * LXR_Price) * Amount_Redeemed
        // All inputs are roughly 9 decimals.
        // Derived from: (RWA / XLS_Supply) / LXR_Price  -> X LXR per 1 XLS
        
        // 1. Value of 1 XLS in USD
        // val_per_xls = (rwa_valuation * 1e9) / xls_supply
        let val_per_xls_usd = (rwa_valuation as u128)
            .checked_mul(1_000_000_000).ok_or(ErrorCode::ArithmeticError)?
            .checked_div(xls_supply as u128).ok_or(ErrorCode::ArithmeticError)?;

        // 2. Amount of LXR per 1 XLS
        // lxr_per_xls = (val_per_xls_usd * 1e9) / lxr_price
        let lxr_per_xls = val_per_xls_usd
            .checked_mul(1_000_000_000).ok_or(ErrorCode::ArithmeticError)?
            .checked_div(lxr_price as u128).ok_or(ErrorCode::ArithmeticError)?;

        // 3. Total LXR for this redemption
        let total_lxr = (amount_xls as u128)
            .checked_mul(lxr_per_xls).ok_or(ErrorCode::ArithmeticError)?
            .checked_div(1_000_000_000).ok_or(ErrorCode::ArithmeticError)?; // Remove scaling

        Ok(total_lxr as u64)
    })().unwrap_or(0); // If oracle fails, 0 (so max takes fixed floor)

    // Final decision: Max(Fixed, Oracle)
    let lxr_to_return = std::cmp::max(fixed_floor_lxr, oracle_floor_lxr);
    
    // Safety check: Ensure Vault has enough funds
    if ctx.accounts.rwa_vault_lxr.amount < lxr_to_return {
         return Err(ErrorCode::InsufficientFunds.into());
    }
    
    // 3. APPLY 70/30 SPLIT (Exit Tax)
    // Rule: User gets 70%, 30% goes to Community Governance (Blocked)
    let tax_amount = lxr_to_return
        .checked_mul(30)
        .ok_or(crate::ErrorCode::ArithmeticError)?
        .checked_div(100)
        .ok_or(crate::ErrorCode::ArithmeticError)?;
    
    let user_amount = lxr_to_return
        .checked_sub(tax_amount)
        .ok_or(crate::ErrorCode::ArithmeticError)?;
    
    // Safety check: Ensure Vault has enough logic
    // (Already checked total amount above)

    let seeds = &[b"global_config".as_ref(), &[ctx.accounts.global_config.bump]];
    let signer = &[&seeds[..]];

    // Transfer 70% to User
    if user_amount > 0 {
        let transfer_user = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.rwa_vault_lxr.to_account_info(),
                mint: ctx.accounts.lxr_mint.to_account_info(),
                to: ctx.accounts.user_lxr_account.to_account_info(),
                authority: ctx.accounts.global_config.to_account_info(),
            },
            signer
        );
        token_interface::transfer_checked(transfer_user, user_amount, ctx.accounts.lxr_mint.decimals)?;
    }

    // Transfer 30% to Governance Vault (Blocked)
    if tax_amount > 0 {
        let transfer_gov = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.rwa_vault_lxr.to_account_info(),
                mint: ctx.accounts.lxr_mint.to_account_info(),
                to: ctx.accounts.constitutional_locked_vault.to_account_info(), // Constitutional Vault
                authority: ctx.accounts.global_config.to_account_info(),
            },
            signer
        );
        token_interface::transfer_checked(transfer_gov, tax_amount, ctx.accounts.lxr_mint.decimals)?;
    }
    
    msg!("Redemption Split: User received {} LXR (70%), Governance Vault received {} LXR (30%)", user_amount, tax_amount);
    Ok(())
}
