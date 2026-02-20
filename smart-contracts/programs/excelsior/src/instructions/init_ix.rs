use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        init,
        payer = admin,
        seeds = [b"global_config"],
        bump,
        space = GlobalConfig::LEN
    )]
    pub global_config: Account<'info, GlobalConfig>,
    
    /// CHECK: RWA Multisig
    pub rwa_wallet: UncheckedAccount<'info>,
    /// CHECK: Founder Vault (10% Supply / 10% Rent)
    pub founder_wallet: UncheckedAccount<'info>,
    
    // Rent Distribution Targets (10% Each - 100% Total)
    /// CHECK: Water Fund (10%)
    pub water_wallet: UncheckedAccount<'info>,
    /// CHECK: Data Center & Latency Fund (10%)
    pub data_latency_wallet: UncheckedAccount<'info>,
    /// CHECK: Energy Grid Fund (10%)
    pub energy_grid_wallet: UncheckedAccount<'info>,
    /// CHECK: Chips/Hardware Fund (10%)
    pub chips_wallet: UncheckedAccount<'info>,
    /// CHECK: Human Talent Fund (10%)
    pub talent_wallet: UncheckedAccount<'info>,
    /// CHECK: Community Yield (10% Payment to Excelsior Holders)
    pub community_yield_wallet: UncheckedAccount<'info>,
    /// CHECK: Operations Fund (10%)
    pub operations_wallet: UncheckedAccount<'info>,
    /// CHECK: Holding Fund (10%)
    pub holding_wallet: UncheckedAccount<'info>,
    /// CHECK: Reinvestment Fund (10% Property Acquisition)
    pub reinvestment_wallet: UncheckedAccount<'info>,
    /// CHECK: Constitutional Locked Vault (30% XLS Exit Tax)
    pub constitutional_locked_vault: UncheckedAccount<'info>,
    /// CHECK: Market Protection Wallet (10% Rent - Buyback)
    pub market_protection_wallet: UncheckedAccount<'info>,
    /// CHECK: Enterprise Yield Vault (10% Rent - Business Profits)
    pub enterprise_yield_vault: UncheckedAccount<'info>,
    /// CHECK: Presale Vault (5% XLS + 5% LXR - NO Vesting)
    pub presale_vault: UncheckedAccount<'info>,
    /// CHECK: Fee - Excelsior Vault (30%)
    pub fee_excelsior_vault: UncheckedAccount<'info>,
    /// CHECK: Fee - Stablecoin Reserve (30%)
    pub fee_stable_reserve: UncheckedAccount<'info>,
    /// CHECK: Fee - Founder Wallet (40%)
    pub fee_founder_wallet: UncheckedAccount<'info>,
    
    /// CHECK: XLS Mint
    pub xls_mint: UncheckedAccount<'info>,
    /// CHECK: LXR Mint
    pub lxr_mint: UncheckedAccount<'info>,
    
    /// CHECK: RWA Vault (LXR) - 30% Rent / 70% Swap Backing
    pub rwa_vault_lxr: UncheckedAccount<'info>,
    /// CHECK: XLS Supply Vault
    pub xls_vault_supply: UncheckedAccount<'info>,
    /// CHECK: LXR Reward Vault (Luxor Holders Rewards)
    pub lxr_vault_rewards: UncheckedAccount<'info>,
    
    // USDX Module Keys
    /// CHECK: USDX Mint
    pub usdx_mint: UncheckedAccount<'info>,
    /// CHECK: USDX Reserve (Collateral)
    pub usdx_reserve: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitParams {
    pub fee_basis_points: u16,
}

pub fn handler(ctx: Context<Initialize>, params: InitParams) -> Result<()> {
    let config = &mut ctx.accounts.global_config;
    
    config.admin = ctx.accounts.admin.key();
    config.xls_mint = ctx.accounts.xls_mint.key();
    config.lxr_mint = ctx.accounts.lxr_mint.key();
    config.rwa_wallet = ctx.accounts.rwa_wallet.key();
    config.founder_wallet = ctx.accounts.founder_wallet.key();
    
    // Rent Distribution Targets (10% Each)
    config.water_wallet = ctx.accounts.water_wallet.key();
    config.data_latency_wallet = ctx.accounts.data_latency_wallet.key();
    config.energy_grid_wallet = ctx.accounts.energy_grid_wallet.key();
    config.chips_wallet = ctx.accounts.chips_wallet.key();
    config.talent_wallet = ctx.accounts.talent_wallet.key();
    config.community_yield_wallet = ctx.accounts.community_yield_wallet.key();
    config.operations_wallet = ctx.accounts.operations_wallet.key();
    config.holding_wallet = ctx.accounts.holding_wallet.key();
    config.reinvestment_wallet = ctx.accounts.reinvestment_wallet.key();
    config.founder_wallet = ctx.accounts.founder_wallet.key(); // 10%
    
    // Constitutional & Strategic Vaults
    config.constitutional_locked_vault = ctx.accounts.constitutional_locked_vault.key();
    config.market_protection_wallet = ctx.accounts.market_protection_wallet.key();
    config.enterprise_yield_vault = ctx.accounts.enterprise_yield_vault.key();
    
    // Token Distribution Vaults
    config.presale_vault = ctx.accounts.presale_vault.key();
    
    // Fee Split Config (30/30/40)
    config.fee_excelsior_vault = ctx.accounts.fee_excelsior_vault.key();
    config.fee_stable_reserve = ctx.accounts.fee_stable_reserve.key();
    config.fee_founder_wallet = ctx.accounts.fee_founder_wallet.key(); 
    
    // Vaults
    config.rwa_vault_lxr = ctx.accounts.rwa_vault_lxr.key();
    config.xls_vault_supply = ctx.accounts.xls_vault_supply.key();
    config.lxr_vault_rewards = ctx.accounts.lxr_vault_rewards.key();
    
    config.fee_basis_points = params.fee_basis_points;
    config.max_fee_basis_points = 300; // Hard Cap 3%
    config.total_lxr_burned = 0;
    
    // Set Inflation Timer
    let clock = Clock::get()?;
    config.last_inflation_timestamp = clock.unix_timestamp;
    config.inflation_interval = 157788000; // 5 years in seconds
    config.inflation_rate_bps = 250; // 2.5%
    
    // Modular Launch Config (Default: Luxor Only)
    config.module_flags = 0; // Bit 0 (XLS) & Bit 1 (USDX) OFF
    config.usdx_mint = ctx.accounts.usdx_mint.key();
    config.usdx_reserve = ctx.accounts.usdx_reserve.key();
    
    config.bump = ctx.bumps.global_config;
    
    msg!("Excelsior Strategic Global Config Initialized");
    Ok(())
}
