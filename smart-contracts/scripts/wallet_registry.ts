export const WALLET_REGISTRY = {
    // ==========================================
    // 1. GENESIS & AUTHORITIES (SQUADS MULTISIG)
    // ==========================================
    // Owner of 100% initial supply, Mint Authority, Freeze Authority, Upgrade Authority
    genesis_authority: "HQ8eEKM88MWZ45sKaXoD3jf3fHUYQqYCgYeogRrejRe",

    // ==========================================
    // 2. TOKEN SUPPLY DISTRIBUTION (LXR)
    // ==========================================
    reserve_vault_59: "FR6mPMN9NegBYkMGsZymuNEXxYQjesQDNsetVTFRh5JG",   // 59% Reserve Vault
    liquidity_1: "FEARFtN9VueEFVDCahtoWGu1A8Xdsmr2et3iWqAVo6hg",        // 1% Liquidity (Initial Pool)
    main_holding_vesting_15: "BQEPJzJNpaUhxZiZYuqJG64oHaJykLoxMQGBfERVJCqc", // 15% Main Holding (Vesting)
    main_holding_liquid_5: "CziGTVvL8ZSph4xYsxoox52x1aDEX4UxT7HC2Y2TZCVs",   // 5% Main Holding (Liquid)
    operations_fund_10: "HcYv3HVXi3Qd3B494QUhf7odX6JvABZwao1r7kMLDHXf",      // 10% Operations Fund
    founder_lock_fund_9: "8YtDVK2qC7V8nM1GFqXnic4sANA5FoYBj5dtLePs3zpi",     // 9% Founder Lock Fund
    founder_personal_1: "AcurPgkabibbSNPXCtaVZQZcQcAGptkoMzLBbdMzq76d",      // 1% Founder Personal

    // ==========================================
    // 3. LUXOR FEES DISTRIBUTION
    // ==========================================
    fee_collector_main: "DdWG5ooDR84VfkM7nK5yTx9FnWNMQWk7NzTsTYQzBZmU",      // 100% Fee Collector
    fees_excelsior_vault_30: "7rMZcFmPXoDYqVeWd4v9tRmC99R88EToS7U6aDADzYv8", // 30% Fees Excelsior Vault
    fees_stablecoin_reserve_30: "F9k4xRUrNvb6qrhY2c72ytNuqokVQZUh1VXLNi5XzsAz", // 30% Fees Stablecoin Reserve
    fees_founder_share_40: "ANXx5N1ZbA4FM9WbZsD9m3Cda11SMmxg8zkN85ZvqCbY",    // 40% Fees Founder Share

    // ==========================================
    // 4. EXCELSIOR YIELD / RWA RENTS (12 TARGETS)
    // ==========================================
    enterprise_yield_vault: "CSyF2rMZZiR7Ldxn4ZJk1jjhA4b4Hkpw2h65G5tLzUjz", // 100% Source Vault
    yield_energy_grid: "EQNKAzQSJGosQ1wTezE86oJeUDZzCiihGezkTKx4SwnX",       // 8.33%
    yield_community_fund: "8bazNwCUj5jVTCPykKH8e3HJLVFbpEcZjALSUPUecBok",    // 8.33%
    yield_market_protection: "8zJcBQuUKCSNMJDZTjcWX5zMUcwnCTPK7TWQqBWKPsVu", // 8.33%
    yield_founder_rent: "BWhYYAWiaq6GSbfAYp6Xb9GpUg5Rk2xjkLbLnUvi5FHX",      // 8.33%
    yield_investor: "8GNF5cXba9FfUq8DeSFBoKoY79w9VotjdD3jLgXH5RQm",          // 8.33%
    yield_ops_growth: "6b6ywzWNdvUiFQYbpm31YmJR8MC5JXik1nFoWa9AsFFH",        // 8.33%
    yield_talent_fund: "FRwPjD2neHHcFxPN68Sdxnaa39TWgFJ8V5pREPu72cSw",       // 8.33%
    yield_reinvestment: "9C83rVHGLweqDWW34UeoPwGNmeVpXuxFWJdRgAPrjyY6",      // 8.33%
    yield_data_centers: "FvFTpBZCjTRSYGgbRsXTwBfGnHLjAZBQ6odwgxbavv4J",      // 8.33%
    yield_chips_ai: "4rmK9qjpfPPxeRuQRFQ5qceH4awAVkyE7RpuJZzjgnQt",          // 8.33%
    yield_water_fund: "AGJS7yqhf4PXBzx6J8bHq6mQzhQ5fJxmBCW7tsAASq42",        // 8.33%
    yield_management: "6QqZtNvzixW9vmRtiyQdgV6uh9cFdg3hfyaHP6qKjsjV",        // 8.33%

    // ==========================================
    // 5. SECURITY & BURN TARGETS
    // ==========================================
    lock_tokens_security: "8jxRTukX3DBgF5dM4VHwamAhwAf3PodhkCBd8XhsKJQu", // Security and Audits (Constitutional Locked Vault)
    burn_tokens: "GdGWLfdzSexEBV6j9pNZhAmsqXvMkW9uJ76iWMtPLXqu",          // For future burns
};
