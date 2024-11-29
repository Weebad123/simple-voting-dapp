use anchor_lang::prelude::*;

use crate::state::*;

/* 

pub fn initialize_candidate(ctx: Context<InitializeCandidate>,
                            candidate_name: String,
                            _poll_id: u64
                        ) -> Result<()> {
                            let candidate_details = &mut ctx.accounts.candidate;

                            let poll_details = &mut ctx.accounts.poll;
                            poll_details.president_votes += 1;

                            candidate_details.candidate_name = candidate_name;
                            candidate_details.candidate_votes = 0;
                            Ok(())
                        }


*/

//use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_error::ProgramError;
//use crate::state::*;

pub fn initialize_candidate(
    ctx: Context<InitializeCandidate>,
    candidate_name: String,
    _poll_id: u64,
) -> Result<()> {
    let poll_details = &mut ctx.accounts.poll;

    // Ensure the poll is initialized
    if poll_details.to_account_info().data_is_empty() {
        msg!("Poll account is not initialized.");
        return Err(ProgramError::UninitializedAccount.into());
    }

    let candidate_details = &mut ctx.accounts.candidate;

    // Increment votes and initialize candidate details
    poll_details.president_votes += 1;
    candidate_details.candidate_name = candidate_name;
    candidate_details.candidate_votes = 0;

    Ok(())
}


#[derive(Accounts)]
#[instruction(candidate_name: String, poll_id: u64)]
pub struct InitializeCandidate<'info> {
    #[account(mut)]
    pub poll_administrator: Signer<'info>,
    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        init,
        payer = poll_administrator,
        space = 8 + Candidate::INIT_SPACE,
        seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],
        bump,
    )]
    pub candidate: Account<'info, Candidate>,

    pub system_program: Program<'info, System>,
}