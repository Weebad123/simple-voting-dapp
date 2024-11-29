use anchor_lang::prelude::*;

use crate::{errors::VoterError, state::*};



pub fn cast_vote(ctx: Context<Vote>, _candidate_name: String, _poll_id: u64) -> Result<()> {
    let preferred_candidate = &mut ctx.accounts.candidate;
    let vote_pda = &mut ctx.accounts.vote_pda;


    if vote_pda.is_initialized {
        return Err(VoterError::AlreadyVoted.into());
    }

    preferred_candidate.candidate_votes += 1;

    msg!("Voted for candidate: {}", preferred_candidate.candidate_name);
    msg!("Votes: {}", preferred_candidate.candidate_votes);

    vote_pda.is_initialized = true;
    Ok(())
}




#[derive(Accounts)]
#[instruction(candidate_name: String, poll_id: u64)]
pub struct Vote<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,

    #[account(
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub poll_pda: Account<'info, Poll>,
    
    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],
        bump
    )]
    pub candidate: Account<'info, Candidate>,

    #[account(
        init,
        payer = voter,
        space = 8 + VotePDA::INIT_SPACE,
        seeds = [voter.key.as_ref(), poll_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub vote_pda: Account<'info, VotePDA>,
    pub system_program: Program<'info, System>,
}



