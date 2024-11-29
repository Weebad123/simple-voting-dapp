pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;
use anchor_lang::prelude::*;

declare_id!("Catigr18jazoB9fNMHTys8kgaexWjACvRL34uQ8a86Lq");

#[program]
pub mod voting {
    use super::*;

    pub fn initialize(ctx: Context<InitializePoll>, poll_id: u64, description: String, poll_start: u64, poll_end: u64) -> Result<()> {
        initialize_poll(ctx, poll_id, description, poll_start, poll_end)?;
        Ok(())
    }

    pub fn candidate_initialize(ctx: Context<InitializeCandidate>, candidate_name: String, poll_id: u64) -> Result<()> {
        initialize_candidate(ctx, candidate_name, poll_id)?;
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, candidate_name: String, poll_id: u64) -> Result<()> {
        cast_vote(ctx, candidate_name, poll_id)?;
        Ok(())
    }
}

