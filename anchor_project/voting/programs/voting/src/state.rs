use anchor_lang::prelude::*;



pub const MAXIMUM_VOTES_PER_VOTER: usize = 1;

// each voting period is 1 day
//pub const VOTING_PERIOD: usize = 86400;

// Voter's Seed
pub const VOTER_SEED: &str = "VOTER_SEED";

// Candidate Seed
pub const CANDIDATE_SEED: &str = "CANDIDATE_SEED";





#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub poll_id: u64,
    #[max_len(100)]
    pub poll_description: String,
    pub president_votes: u64,
    pub poll_start: u64,
    pub poll_end: u64,
   // pub bump: u8,
}



#[account]
#[derive(InitSpace)]
pub struct Candidate {
    #[max_len(32)]
    pub candidate_name: String,
    pub candidate_votes: u64,
}


#[account]
#[derive(InitSpace)]
pub struct VotePDA {
    pub is_initialized: bool,
}



impl VotePDA {
    // This could be a function to return the space needed for initialization
    pub const INIT_SPACE: usize = 8 + 32 + 64 + 8; // Adjust based on your struct fields
}
