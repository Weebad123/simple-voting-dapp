use anchor_lang::prelude::*;

use crate::{errors::AdministratorError, state::*};




pub fn initialize_poll(ctx: Context<InitializePoll>, poll_id: u64, description: String, poll_start: u64, poll_end: u64) -> Result<()> {
    let poll_details = &mut ctx.accounts.poll;
    msg!("Expected Poll PDA: {:?}", poll_details.key());

    require!(poll_end > poll_start, AdministratorError::VotingEndInFutureToVotingStart);

    // let's initialize the voting period to point to the current timestamp
    //let clock: Clock = Clock::get()?;
    //poll_details.poll_start = clock.unix_timestamp as u64;
    poll_details.poll_id = poll_id;
    poll_details.poll_description = description;
    // voting period = 1 day;
    msg!("Seed: {:?}", poll_id.to_le_bytes());

    poll_details.poll_start = poll_start;
    poll_details.poll_end = poll_end;
    //poll_details.poll_end = poll_details.poll_start + 86400;
    poll_details.president_votes = 0;
    Ok(())
}




#[derive(Accounts)]
#[instruction(poll_id: u64, poll_start: u64, poll_end: u64)]
pub struct InitializePoll<'info> {
    #[account(
        mut,
        constraint= poll_administrator.key() == expected_admin.key() @ AdministratorError::UnauthorizedPollAdministrator
    )]
    pub poll_administrator: Signer<'info>,
    /// CHECK: This is safe because we explicitly compare this account's key with the poll administrator's key.
    pub expected_admin: AccountInfo<'info>,
    #[account(
        init,
        payer = poll_administrator,
        space = 8 + Poll::INIT_SPACE,
        seeds = [
            poll_id.to_le_bytes().as_ref(),
            //poll_start.to_le_bytes().as_ref(),
            //poll_end.to_le_bytes().as_ref(),
        ],
        bump,
    )]
    pub poll: Account<'info, Poll>,
    pub system_program: Program<'info, System>,
}