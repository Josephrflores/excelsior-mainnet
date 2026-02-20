use anchor_lang::prelude::*;

#[account]
pub struct GlobalConfig {
    pub admin: Pubkey,
    pub xls_mint: Pubkey,
    pub lxr_mint: Pubkey,
    pub rwa_vault_lxr: Pubkey, // Token Account for RWA Vault (LXR)
    pub xls_vault_supply: Pubkey, // Token Account holding the Fixed Supply of XLS to be sold
    pub rwa_wallet: Pubkey, // The actual wallet key that controls the assets (Multisig)
    // Rent Distribution Targets (10% Each = 100%)
    pub water_wallet: Pubkey,       // 10% Water
    pub data_latency_wallet: Pubkey, // 10% Data Centers + Latency
    pub energy_grid_wallet: Pubkey, // 10% Energy
    pub chips_wallet: Pubkey,       // 10% Chips (Hardware/AI)
    pub talent_wallet: Pubkey,      // 10% Talent
    pub community_yield_wallet: Pubkey, // 10% Payment to Excelsior Holders (Yield)
    pub operations_wallet: Pubkey,  // 10% Ops
    pub holding_wallet: Pubkey,     // 10% Holding
    pub founder_wallet: Pubkey,     // 10% Founder (Moved here for grouping)
    pub reinvestment_wallet: Pubkey, // 10% Reinvestment (New Properties/RWA)
    
    // Constitutional & Strategic Vaults
    pub constitutional_locked_vault: Pubkey, // 30% XLS Exit Tax → DAO Burn/Reassign
    pub market_protection_wallet: Pubkey,    // 10% Rent → Buyback/Market Defense
    pub enterprise_yield_vault: Pubkey,      // 10% Rent → Business Profits Redistribution
    
    // Token Distribution Vaults (Initial Supply: 60/15/10/9/5/1)
    pub presale_vault: Pubkey,               // 5% XLS + 5% LXR → Presale (NO Vesting)
    
    // Fee Targets (30/30/40 Transaction Tax Split)
    // Removed single collector, using split logic.
    pub fee_excelsior_vault: Pubkey, // 30%
    pub fee_stable_reserve: Pubkey,  // 30%
    pub fee_founder_wallet: Pubkey,  // 40%
    
    // Fee Config
    pub fee_basis_points: u16, // Current Fee
    pub max_fee_basis_points: u16, // Hard Cap (300)
    
    // Stats
    pub total_lxr_burned: u64,
    pub total_staked_xls: u64,
    pub acc_rewards_per_share: u128, // Precision 1e12
    pub last_inflation_timestamp: i64,
    pub lxr_vault_rewards: Pubkey, // Vault holding LXR for staking rewards (Luxor Holders Rewards)
    
    // Institutional Security (Oracle Fallback)
    pub pyth_oracle: Pubkey,
    pub chainlink_oracle: Pubkey,
    pub oracle_staleness_threshold: i64, // e.g., 60s
    
    // Withdrawal Limits & Circuit Breaker
    pub max_daily_withdrawal_bps: u16, // Default: 100 (1%)
    pub timelock_threshold_bps: u16,  // Default: 50 (0.5%)
    pub timelock_duration: i64,      // Default: 86400 (24h)
    pub daily_withdrawal_amount: u64, // Current accumulated today
    pub last_withdrawal_reset: i64,   // Last reset of daily counter
    
    // Monetary Policy Config
    pub inflation_interval: i64, 
    pub inflation_rate_bps: u16, 
    
    // Modular Launch Flags (Regulatory Firewall)
    // Bitmask: 0=LXR(Always On), 1=XLS, 2=USDX
    pub module_flags: u8, 
    
    // USDX Stablecoin Keys
    pub usdx_mint: Pubkey,
    pub usdx_reserve: Pubkey, // Collateral Vault (USDC/LXR)
 
    pub bump: u8,
}

impl GlobalConfig {
    // Extended for Modular Launch & USDX & Wallets
    pub const LEN: usize = 1200; 
}
