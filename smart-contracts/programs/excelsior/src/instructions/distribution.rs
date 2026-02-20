use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked};
use crate::state::*;

#[derive(Accounts)]
pub struct DistributeRent<'info> {
    #[account(mut)]
    pub admin: Signer<'info>, 

    #[account(
        mut,
        seeds = [b"global_config"],
        bump = global_config.bump,
        has_one = admin,
    )]
    pub global_config: Box<Account<'info, GlobalConfig>>,

    #[account(
        mut,
        token::mint = usdx_mint,
        token::authority = admin
    )]
    pub admin_usdx_account: Box<InterfaceAccount<'info, TokenAccount>>, 

    // Rent Targets (12 Wallets - Boxed to reduce stack size)
    #[account(mut, address = global_config.water_wallet)]
    pub water_wallet: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, address = global_config.data_latency_wallet)]
    pub data_latency_wallet: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, address = global_config.energy_grid_wallet)]
    pub energy_grid_wallet: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, address = global_config.chips_wallet)]
    pub chips_wallet: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, address = global_config.talent_wallet)]
    pub talent_wallet: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, address = global_config.community_yield_wallet)]
    pub community_yield_wallet: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, address = global_config.operations_wallet)]
    pub operations_wallet: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, address = global_config.holding_wallet)]
    pub holding_wallet: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, address = global_config.founder_wallet)]
    pub founder_wallet: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, address = global_config.reinvestment_wallet)]
    pub reinvestment_wallet: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, address = global_config.market_protection_wallet)]
    pub market_protection_wallet: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, address = global_config.enterprise_yield_vault)]
    pub enterprise_yield_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: Validated against Global Config
    #[account(address = global_config.usdx_mint)] // Must match Config
    pub usdx_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
pub struct UpdateDistributionWallets<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"global_config"],
        bump = global_config.bump,
        has_one = admin,
    )]
    pub global_config: Account<'info, GlobalConfig>,
    
    // Rent Wallets (10)
    /// CHECK: Water
    pub water_wallet: UncheckedAccount<'info>,
    /// CHECK: Data
    pub data_latency_wallet: UncheckedAccount<'info>,
    /// CHECK: Energy
    pub energy_grid_wallet: UncheckedAccount<'info>,
    /// CHECK: Chips
    pub chips_wallet: UncheckedAccount<'info>,
    /// CHECK: Talent
    pub talent_wallet: UncheckedAccount<'info>,
    /// CHECK: Community
    pub community_yield_wallet: UncheckedAccount<'info>,
    /// CHECK: Ops
    pub operations_wallet: UncheckedAccount<'info>,
    /// CHECK: Holding
    pub holding_wallet: UncheckedAccount<'info>,
    /// CHECK: Founder
    pub founder_wallet: UncheckedAccount<'info>,
    /// CHECK: Reinvestment
    pub reinvestment_wallet: UncheckedAccount<'info>,
    /// CHECK: Market Protection
    pub market_protection_wallet: UncheckedAccount<'info>,
    /// CHECK: Enterprise Yield
    pub enterprise_yield_vault: UncheckedAccount<'info>,
    
    // Fee Wallets (3)
    /// CHECK: Fee - Excelsior
    pub fee_excelsior_vault: UncheckedAccount<'info>,
    /// CHECK: Fee - Stable
    pub fee_stable_reserve: UncheckedAccount<'info>,
    /// CHECK: Fee - Founder
    pub fee_founder_wallet: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn distribute_rent_handler(ctx: Context<DistributeRent>, amount: u64) -> Result<()> {
    // REGULATORY FIREWALL: Check if Excelsior (RWA) Module is Active (Bit 0)
    require!(ctx.accounts.global_config.module_flags & 1 != 0, crate::ErrorCode::ModulePaused);

    let twelve_percent = amount
        .checked_div(12)
        .ok_or(crate::ErrorCode::ArithmeticError)?;
    
    let remainder = amount
        .checked_sub(
            twelve_percent
                .checked_mul(12)
                .ok_or(crate::ErrorCode::ArithmeticError)?
        )
        .ok_or(crate::ErrorCode::ArithmeticError)?;
    
    let targets = [
        (&ctx.accounts.water_wallet, twelve_percent),
        (&ctx.accounts.data_latency_wallet, twelve_percent),
        (&ctx.accounts.energy_grid_wallet, twelve_percent),
        (&ctx.accounts.chips_wallet, twelve_percent),
        (&ctx.accounts.talent_wallet, twelve_percent),
        (&ctx.accounts.community_yield_wallet, twelve_percent),
        (&ctx.accounts.operations_wallet, twelve_percent),
        (&ctx.accounts.holding_wallet, twelve_percent),
        (&ctx.accounts.founder_wallet, twelve_percent),
        (&ctx.accounts.reinvestment_wallet, twelve_percent),
        (&ctx.accounts.market_protection_wallet, twelve_percent),
        (&ctx.accounts.enterprise_yield_vault, twelve_percent + remainder),
    ];

    for (target_acc, share) in targets.iter() {
        if *share > 0 {
            token_interface::transfer_checked(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    TransferChecked {
                        from: ctx.accounts.admin_usdx_account.to_account_info(),
                        mint: ctx.accounts.usdx_mint.to_account_info(),
                        to: target_acc.to_account_info(),
                        authority: ctx.accounts.admin.to_account_info(),
                    }
                ),
                *share,
                ctx.accounts.usdx_mint.decimals,
            )?;
        }
    }

    msg!("Rent Distributed: 8.333% to each of 12 strategic wallets.");
    Ok(())
}

pub fn update_distribution_wallets_handler(ctx: Context<UpdateDistributionWallets>) -> Result<()> {
    let config = &mut ctx.accounts.global_config;
    
    // Rent
    config.water_wallet = ctx.accounts.water_wallet.key();
    config.data_latency_wallet = ctx.accounts.data_latency_wallet.key();
    config.energy_grid_wallet = ctx.accounts.energy_grid_wallet.key();
    config.chips_wallet = ctx.accounts.chips_wallet.key();
    config.talent_wallet = ctx.accounts.talent_wallet.key();
    config.community_yield_wallet = ctx.accounts.community_yield_wallet.key();
    config.operations_wallet = ctx.accounts.operations_wallet.key();
    config.holding_wallet = ctx.accounts.holding_wallet.key();
    config.founder_wallet = ctx.accounts.founder_wallet.key();
    config.reinvestment_wallet = ctx.accounts.reinvestment_wallet.key();
    
    // Constitutional & Strategic Vaults
    config.market_protection_wallet = ctx.accounts.market_protection_wallet.key();
    config.enterprise_yield_vault = ctx.accounts.enterprise_yield_vault.key();
    
    // Fees
    config.fee_excelsior_vault = ctx.accounts.fee_excelsior_vault.key();
    config.fee_stable_reserve = ctx.accounts.fee_stable_reserve.key();
    config.fee_founder_wallet = ctx.accounts.fee_founder_wallet.key();
    
    msg!("Distribution Wallets Updated Successfully.");
    Ok(())
}
