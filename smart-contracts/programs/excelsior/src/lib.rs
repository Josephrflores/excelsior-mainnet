use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;

use instructions::init_ix::*;
use instructions::swap::*;
use instructions::stake::*;
use instructions::fees::*;
use instructions::rewards::*;
use instructions::config_management::*;
use instructions::distribution::*;
use instructions::inflation::*;
use instructions::withdrawals::*;
pub use instructions::access_control::*;
pub use instructions::vesting::*;
pub use instructions::usdx_ops::*;

declare_id!("9d7SeR8Njzh32piG1HBxNR33VJJYVroubsQKKjkBjmfv");

#[program]
pub mod excelsior {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, params: InitParams) -> Result<()> {
        instructions::init_ix::handler(ctx, params)
    }

    pub fn buy_xls(ctx: Context<BuyXls>, amount_xls: u64) -> Result<()> {
        instructions::swap::buy_handler(ctx, amount_xls)
    }

    pub fn redeem_xls(ctx: Context<RedeemXls>, amount_xls: u64) -> Result<()> {
        instructions::swap::redeem_handler(ctx, amount_xls)
    }

    pub fn init_user(ctx: Context<InitUser>) -> Result<()> {
        instructions::stake::init_user_handler(ctx)
    }

    pub fn stake_xls(ctx: Context<StakeXls>, amount: u64) -> Result<()> {
        instructions::stake::stake_handler(ctx, amount)
    }

    pub fn unstake_xls(ctx: Context<UnstakeXls>, amount: u64) -> Result<()> {
        instructions::stake::unstake_handler(ctx, amount)
    }

    pub fn harvest_fees(ctx: Context<HarvestFees>) -> Result<()> {
        instructions::fees::harvest_handler(ctx)
    }

    pub fn init_distributor(ctx: Context<InitDistributor>, root: [u8; 32]) -> Result<()> {
        instructions::rewards::init_distributor_handler(ctx, root)
    }

    pub fn claim_reward(ctx: Context<ClaimReward>, index: u64, amount: u64, proof: Vec<[u8; 32]>) -> Result<()> {
        instructions::rewards::claim_handler(ctx, index, amount, proof)
    }

    pub fn distribute_rent(ctx: Context<DistributeRent>, amount: u64) -> Result<()> {
        instructions::distribution::distribute_rent_handler(ctx, amount)
    }

    pub fn trigger_inflation(ctx: Context<TriggerInflation>) -> Result<()> {
        instructions::inflation::trigger_inflation_handler(ctx)
    }

    pub fn manual_burn(ctx: Context<ManualBurn>, amount: u64) -> Result<()> {
        instructions::inflation::manual_burn_handler(ctx, amount)
    }

    pub fn upgrade_config(
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
        instructions::config_management::upgrade_config_handler(
            ctx, 
            new_interval, 
            new_rate_bps,
            pyth_oracle,
            chainlink_oracle,
            staleness,
            daily_limit,
            timelock_limit,
            timelock_duration,
            new_module_flags
        )
    }

    pub fn request_withdrawal(ctx: Context<RequestWithdrawal>, amount: u64, beneficiary: Pubkey) -> Result<()> {
        instructions::withdrawals::request_withdrawal_handler(ctx, amount, beneficiary)
    }

    pub fn execute_withdrawal(ctx: Context<ExecuteWithdrawal>) -> Result<()> {
        instructions::withdrawals::execute_withdrawal_handler(ctx)
    }

    pub fn update_fee(ctx: Context<UpdateFeeConfig>, new_fee_bps: u16) -> Result<()> {
        instructions::config_management::update_fee_handler(ctx, new_fee_bps)
    }

    // Access Control Instructions
    pub fn init_access_control(ctx: Context<InitAccessControl>) -> Result<()> {
        instructions::access_control::init_handler(ctx)
    }

    pub fn grant_operator(ctx: Context<UpdateRole>, new_operator: Pubkey) -> Result<()> {
        instructions::access_control::grant_operator_handler(ctx, new_operator)
    }

    pub fn revoke_operator(ctx: Context<UpdateRole>, operator_to_remove: Pubkey) -> Result<()> {
        instructions::access_control::revoke_operator_handler(ctx, operator_to_remove)
    }

    pub fn emergency_pause(ctx: Context<EmergencyPause>, pause: bool) -> Result<()> {
        instructions::access_control::set_pause_handler(ctx, pause)
    }

    // Vesting Instructions
    pub fn create_vesting(
        ctx: Context<CreateVesting>, 
        amount: u64, 
        start: i64, 
        cliff: i64, 
        end: i64,
        tge_percentage: u16,
        is_private_investor: bool
    ) -> Result<()> {
        instructions::vesting::create_vesting_handler(ctx, amount, start, cliff, end, tge_percentage, is_private_investor)
    }

    pub fn claim_vested(ctx: Context<ClaimVesting>) -> Result<()> {
        instructions::vesting::claim_vested_handler(ctx)
    }

    pub fn reset_protocol_stats(ctx: Context<ResetStats>) -> Result<()> {
        instructions::config_management::reset_stats_handler(ctx)
    }

    pub fn toggle_module(ctx: Context<ToggleModule>, flag_id: u8, enable: bool) -> Result<()> {
        instructions::config_management::toggle_module_handler(ctx, flag_id, enable)
    }


    pub fn mint_usdx(ctx: Context<MintUsdx>, amount: u64) -> Result<()> {
        instructions::usdx_ops::mint_usdx_handler(ctx, amount)
    }

    pub fn redeem_usdx(ctx: Context<RedeemUsdx>, amount: u64) -> Result<()> {
        instructions::usdx_ops::redeem_usdx_handler(ctx, amount)
    }

    pub fn update_distribution_wallets(ctx: Context<UpdateDistributionWallets>) -> Result<()> {
        instructions::distribution::update_distribution_wallets_handler(ctx)
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds.")]
    InsufficientFunds,
    #[msg("Invalid Merkle proof.")]
    InvalidProof,
    #[msg("Inflation trigger not yet ready.")]
    InflationNotReady,
    #[msg("Unauthorized access.")]
    Unauthorized,
    #[msg("Protocol is paused.")]
    Paused,
    #[msg("Invalid Vesting Parameters.")]
    InvalidVestingParams,
    #[msg("Daily withdrawal limit reached.")]
    DailyLimitReached,
    #[msg("Withdrawal amount exceeds timelock threshold. Request submitted.")]
    TimelockRequired,
    #[msg("Withdrawal request is still locked.")]
    WithdrawalLocked,
    #[msg("Invalid withdrawal request status.")]
    InvalidRequestStatus,
    #[msg("Module is paused via Regulatory Firewall.")]
    ModulePaused,
    #[msg("RWA Oracle Data is Invalid or Stale.")]
    RwaOracleInvalid,
    #[msg("Arithmetic Error (Overflow/Underflow).")]
    ArithmeticError,
    #[msg("Daily withdrawal limit exceeded.")]
    DailyLimitExceeded,
}
