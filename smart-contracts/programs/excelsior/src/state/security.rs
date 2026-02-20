use anchor_lang::prelude::*;

#[account]
pub struct WithdrawalRequest {
    pub admin: Pubkey,
    pub beneficiary: Pubkey,
    pub amount: u64,
    pub unlock_at: i64,
    pub status: u8, // 0: Pending, 1: Executed, 2: Cancelled
    pub bump: u8,
}

impl WithdrawalRequest {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 1 + 1;
}
