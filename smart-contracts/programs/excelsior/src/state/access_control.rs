use anchor_lang::prelude::*;

#[account]
pub struct AccessControl {
    pub authority: Pubkey, // The SuperAdmin (can assign roles)
    pub paused: bool,      // Circuit Breaker status
    
    // Roles specifically assigned to public keys
    pub operators: Vec<Pubkey>, // Can trigger inflation, update config
    pub minters: Vec<Pubkey>,   // Can mint tokens (if not burned)
    
    pub bump: u8,
}

impl AccessControl {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        1 +  // paused
        4 + (32 * 10) + // operators (max 10)
        4 + (32 * 5) +  // minters (max 5)
        1;   // bump
}
