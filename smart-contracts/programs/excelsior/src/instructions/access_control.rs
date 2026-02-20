use anchor_lang::prelude::*;
use crate::state::access_control::AccessControl;
use crate::ErrorCode;

#[derive(Accounts)]
pub struct InitAccessControl<'info> {
    #[account(
        init,
        payer = authority,
        seeds = [b"access_control"],
        bump,
        space = AccessControl::LEN
    )]
    pub access_control: Account<'info, AccessControl>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateRole<'info> {
    #[account(
        mut,
        seeds = [b"access_control"],
        bump = access_control.bump,
        has_one = authority @ ErrorCode::Unauthorized // Only SuperAdmin can change roles
    )]
    pub access_control: Account<'info, AccessControl>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct EmergencyPause<'info> {
    #[account(
        mut,
        seeds = [b"access_control"],
        bump = access_control.bump,
        // Constraint: Signer must be Authority OR an Operator
        constraint = access_control.authority == signer.key() || access_control.operators.contains(&signer.key()) @ ErrorCode::Unauthorized
    )]
    pub access_control: Account<'info, AccessControl>,
    
    pub signer: Signer<'info>,
}

pub fn init_handler(ctx: Context<InitAccessControl>) -> Result<()> {
    let ac = &mut ctx.accounts.access_control;
    ac.authority = ctx.accounts.authority.key();
    ac.paused = false;
    ac.operators = vec![];
    ac.minters = vec![];
    ac.bump = ctx.bumps.access_control;
    Ok(())
}

pub fn grant_operator_handler(ctx: Context<UpdateRole>, new_operator: Pubkey) -> Result<()> {
    let ac = &mut ctx.accounts.access_control;
    if !ac.operators.contains(&new_operator) {
        ac.operators.push(new_operator);
    }
    Ok(())
}

pub fn revoke_operator_handler(ctx: Context<UpdateRole>, operator_to_remove: Pubkey) -> Result<()> {
    let ac = &mut ctx.accounts.access_control;
    if let Some(pos) = ac.operators.iter().position(|x| *x == operator_to_remove) {
        ac.operators.remove(pos);
    }
    Ok(())
}

pub fn set_pause_handler(ctx: Context<EmergencyPause>, pause: bool) -> Result<()> {
    let ac = &mut ctx.accounts.access_control;
    ac.paused = pause;
    msg!("Emergency Pause State: {}", pause);
    Ok(())
}
