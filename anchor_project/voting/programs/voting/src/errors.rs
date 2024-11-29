use anchor_lang::prelude::*;

#[error_code]
pub enum VoterError {
    #[msg("Cannot vote twice in the same voting period!")]
    AlreadyVoted,
    #[msg("Cannot vote when voting period has close")]
    VotingPeriodClosed,
    #[msg("Cannot change vote when voting period is over")]
    ChangeVoteError,
}


#[error_code]
pub enum AdministratorError {
    #[msg("This candidate has already been initialized")]
    CandidateAlreadyInitialized,
    #[msg("Cannot initialize candidate")]
    CandidateInitializationError,
    #[msg("Cannot close voting until period ends")]
    VotingPeriodNotClosed,
    #[msg("Voting End Must Be Greater Than Voting Start")]
    VotingEndInFutureToVotingStart,
    #[msg("Only Admin Can Initialize Poll")]
    UnauthorizedPollAdministrator,
}