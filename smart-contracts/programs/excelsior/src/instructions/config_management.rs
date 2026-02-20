use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct ToggleModule<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds = [b"global_config"],
        bump = global_config.bump,
        has_one = admin,
    )]
    pub global_config: Account<'info, GlobalConfig>,
}

#[derive(Accounts)]
pub struct UpgradeConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"global_config"],
        bump = global_config.bump,
        has_one = admin,
        realloc = GlobalConfig::LEN,
        realloc::payer = admin,
        realloc::zero = false,
    )]
    pub global_config: Account<'info, GlobalConfig>,

    // New Fields to Set
    /// CHECK: RWA Vault (LXR) - Optional update, keep same if unneeded
    pub rwa_vault_lxr: UncheckedAccount<'info>,
    /// CHECK: XLS Supply Vault
    pub xls_vault_supply: UncheckedAccount<'info>,
    /// CHECK: LXR Reward Vault
    pub lxr_vault_rewards: UncheckedAccount<'info>,

    /// CHECK: New XLS Mint
    pub new_xls_mint: UncheckedAccount<'info>,
    /// CHECK: New LXR Mint
    pub new_lxr_mint: UncheckedAccount<'info>,

    // New Modular Fields
    /// CHECK: New USDX Mint (Optional)
    pub usdx_mint: UncheckedAccount<'info>,
    /// CHECK: New USDX Reserve (Optional)
    pub usdx_reserve: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateFeeConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"global_config"],
        bump = global_config.bump,
        has_one = admin,
    )]
    pub global_config: Account<'info, GlobalConfig>,
}

#[derive(Accounts)]
pub struct ResetStats<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"global_config"],
        bump = global_config.bump,
        has_one = admin,
    )]
    pub global_config: Account<'info, GlobalConfig>,
}

pub fn toggle_module_handler(ctx: Context<ToggleModule>, flag_id: u8, enable: bool) -> Result<()> {
    // flag_id: 1 = XLS, 2 = USDX
    let config = &mut ctx.accounts.global_config;
    
    if enable {
        config.module_flags |= flag_id;
        msg!("Module {} ACTIVATED via Admin Override.", flag_id);
    } else {
        config.module_flags &= !flag_id;
        msg!("Module {} PAUSED via Admin Override.", flag_id);
    }
    
    Ok(())
}

pub fn upgrade_config_handler(
    ctx: Context<UpgradeConfig>, 
    new_interval: i64, 
    new_rate_bps: u16,
    pyth_oracle: Pubkey,
    chainlink_oracle: Pubkey,
    staleness: i64,
    daily_limit: u16,
    timelock_limit: u16,
    timelock_duration: i64,
    new_module_flags: u8,
) -> Result<()> {
    let config = &mut ctx.accounts.global_config;
    
    config.rwa_vault_lxr = ctx.accounts.rwa_vault_lxr.key();
    config.xls_vault_supply = ctx.accounts.xls_vault_supply.key();
    config.lxr_vault_rewards = ctx.accounts.lxr_vault_rewards.key();
    
    // Monetary Policy Update
    config.inflation_interval = new_interval;
    config.inflation_rate_bps = new_rate_bps;

    // Security Update
    config.pyth_oracle = pyth_oracle;
    config.chainlink_oracle = chainlink_oracle;
    config.oracle_staleness_threshold = staleness;
    config.max_daily_withdrawal_bps = daily_limit;
    config.timelock_threshold_bps = timelock_limit;
    config.timelock_duration = timelock_duration;

    // Modular Update
    config.module_flags = new_module_flags;
    config.usdx_mint = ctx.accounts.usdx_mint.key();
    config.usdx_reserve = ctx.accounts.usdx_reserve.key();

    // Mint Redirection (For recovery/normalization)
    config.xls_mint = ctx.accounts.new_xls_mint.key();
    config.lxr_mint = ctx.accounts.new_lxr_mint.key();

    msg!("Global Config Upgraded V5: Security & Oracles set.");
    Ok(())
}

pub fn update_fee_handler(ctx: Context<UpdateFeeConfig>, new_fee_bps: u16) -> Result<()> {
    let config = &mut ctx.accounts.global_config;
    
    // Safety check against hard-cap (max 5%)
    require!(new_fee_bps <= config.max_fee_basis_points, crate::ErrorCode::Unauthorized);
    
    config.fee_basis_points = new_fee_bps;
    
    msg!("Protocol Fee Updated: {} bps", new_fee_bps);
    Ok(())
}

pub fn reset_stats_handler(ctx: Context<ResetStats>) -> Result<()> {
    let config = &mut ctx.accounts.global_config;
    config.total_lxr_burned = 0;
    config.total_staked_xls = 0;
    config.acc_rewards_per_share = 0;
    
    msg!("Protocol Stats Reset to Zero by Admin");
    Ok(())
}
