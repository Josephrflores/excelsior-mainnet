use anchor_lang::prelude::*;

#[account]
pub struct VestingSchedule {
    pub beneficiary: Pubkey, // Who receives the tokens
    pub mint: Pubkey,        // Which token (LXR/XLS)
    pub vault: Pubkey,       // Token Account holding the locked tokens
    pub admin: Pubkey,       // Creator of the schedule
    
    pub total_amount: u64,    // Total locked
    pub released_amount: u64, // Already claimed
    
    pub start_time: i64,      // Unix timestamp start
    pub cliff_time: i64,      // Unix timestamp cliff (0 if none)
    pub end_time: i64,        // Unix timestamp fully unlocked
    
    pub tge_percentage: u16,  // Basis Points (e.g., 1000 = 10%)
    pub is_private_investor: bool, // Registry Flag
    
    pub bump: u8,
}

impl VestingSchedule {
    pub const LEN: usize = 8 + // discriminator
        32 + // beneficiary
        32 + // mint
        32 + // vault
        32 + // admin
        8 +  // total_amount
        8 +  // released_amount
        8 +  // start_time
        8 +  // cliff_time
        8 +  // end_time
        2 +  // tge_percentage (u16)
        1 +  // is_private_investor (bool)
        1;   // bump
}
