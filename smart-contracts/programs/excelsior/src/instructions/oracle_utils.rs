use anchor_lang::prelude::*;
use pyth_sdk_solana::state::SolanaPriceAccount;
use chainlink_solana as chainlink;
use crate::state::GlobalConfig;
use crate::ErrorCode;

pub fn get_secure_price(
    global_config: &GlobalConfig,
    pyth_account: &AccountInfo,
    _chainlink_account: &AccountInfo,
) -> Result<u64> {
    let clock = Clock::get()?;
    let current_time = clock.unix_timestamp;

    // 1. Try Pyth (Primary)
    let price_data = pyth_account.try_borrow_data()?;
    let price_feed = SolanaPriceAccount::account_info_to_feed(pyth_account).map_err(|_| ErrorCode::Unauthorized)?;
    
    if let Some(price) = price_feed.get_price_no_older_than(current_time, global_config.oracle_staleness_threshold as u64) {
        return Ok(price.price as u64);
    }

    // 2. Chainlink Fallback (Secondary)
    // DISABLED for V1 due to dependency version mismatch.
    /*
    msg!("WARNING: Pyth Oracle stale or unavailable. Attempting Chainlink Fallback.");

    if _chainlink_account.key() == Pubkey::default() {
         return Err(ErrorCode::Paused.into());
    }

    let round = chainlink::latest_round_data(
        _chainlink_account.to_account_info(),
    ).map_err(|_| ErrorCode::Paused)?;

    let timestamp = round.timestamp;
    if current_time > timestamp + global_config.oracle_staleness_threshold as i64 {
        msg!("CRITICAL: Chainlink Oracle also stale.");
        return Err(ErrorCode::Paused.into());
    }

    let price = round.answer;
    let decimals = round.decimals;

    if price <= 0 {
        msg!("CRITICAL: Chainlink Oracle returned non-positive price: {}", price);
        return Err(ErrorCode::RwaOracleInvalid.into());
    }

    let normalized_price = if decimals < 9 {
        (price as u64).checked_mul(10u64.pow(9 - decimals as u32)).unwrap()
    } else {
        (price as u64).checked_div(10u64.pow(decimals as u32 - 9)).unwrap()
    };

    Ok(normalized_price)
    */
    msg!("CRITICAL: Pyth Oracle stale and Chainlink Fallback Disabled.");
    Err(ErrorCode::Paused.into())
}
