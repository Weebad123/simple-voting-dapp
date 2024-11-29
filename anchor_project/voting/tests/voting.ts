import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voting } from "../target/types/voting";
import { SystemProgram, Keypair, PublicKey } from "@solana/web3.js";
import { assert, expect } from "chai";

describe("voting", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Voting as Program<Voting>;
  const pollAdministrator = provider.wallet;
  const votingAddress = new PublicKey("Dt64PuiGagpdDn6ZftwE6yEQuUUQcN9NTThKJWNrjVQF");

  it("Initialize Poll By Administrator", async () => {
    // Add your test here.
    
   
    const airdropSig = await provider.connection.requestAirdrop(
      pollAdministrator.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);


    await program.methods
      .initialize(new anchor.BN(1), "Who is your favorite president?!", new anchor.BN(2000), new anchor.BN(10000))
      .accounts({
        pollAdministrator: pollAdministrator.publicKey,
        expectedAdmin: provider.wallet.publicKey,
      })
      .signers([])
      .rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      votingAddress
    );

    const pollAccount = await program.account.poll.fetch(pollAddress);
    console.log(pollAccount);

    expect(pollAccount.pollId.toNumber()).to.equal(1);
    expect(pollAccount.pollDescription).to.equal("Who is your favorite president?!");
    expect(pollAccount.presidentVotes.toNumber()).to.equal(0);
    expect(pollAccount.pollStart.toNumber()).to.be.lessThan(pollAccount.pollEnd.toNumber());


  });

  
  it("Fails to initialize poll by unauthorized user", async () => {
    // Generate a random user who is not the poll administrator
    const anyUser = Keypair.generate();
  
    // Airdrop SOL to the unauthorized user for transaction fees
    const airdropSigUser = await provider.connection.requestAirdrop(
      anyUser.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSigUser);
  
    // Test the unauthorized attempt
    try {
      const pollId = new anchor.BN(10);
      const pollStart = new anchor.BN(2000);
      const pollEnd = new anchor.BN(10000);
  
      await program.methods
        .initialize(pollId, "Who is your favorite president?!", pollStart, pollEnd)
        .accounts({
          pollAdministrator: anyUser.publicKey,
          expectedAdmin: provider.wallet.publicKey,
        })
        .signers([anyUser]) // Include `anyUser` as a signer
        .rpc();
  
      
    } catch (_err) {
  
      const err = anchor.AnchorError.parse(_err.logs);
      assert.strictEqual(err.error.errorCode.code, "UnauthorizedPollAdministrator");
    }
  });
  

  

  it("Initialize Candidate!", async () => {
    await program.methods.candidateInitialize(
      "Donald Trump",
      new anchor.BN(1),
    ).rpc();

    await program.methods.candidateInitialize(
      "Kamala Harris",
      new anchor.BN(1),
    ).rpc();

    const [trumpAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Donald Trump")],
      votingAddress
    );
    const trumpCandidate = await program.account.candidate.fetch(trumpAddress);
    console.log(trumpCandidate);

    const [harrisAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Kamala Harris")],
      votingAddress
    );
    const harrisCandidate = await program.account.candidate.fetch(harrisAddress);
    console.log(harrisCandidate);

    // let's write some assertions for the testing Donald Trump
    expect(trumpCandidate.candidateVotes.toNumber()).to.equal(0);
    // let's write some assertions for testing Kamala Harris 
    expect(harrisCandidate.candidateVotes.toNumber()).to.equal(0);
  });


  it("Fails to initialize a candidate in an uninitialized poll", async () => {
    const pollId = new anchor.BN(2);
  
    try {
      // Attempt to initialize a candidate in an uninitialized poll
      await program.methods
        .candidateInitialize("Kamala Harris", pollId)
        .rpc();
  
      // If no error is thrown, fail the test
      assert.fail("Unexpected success: Candidate initialization should fail for an uninitialized poll.");
    } catch (_err) {
      if (_err.logs) {
        // Parse and assert the error code
        const err = anchor.AnchorError.parse(_err.logs);
        assert.strictEqual(err.error.errorCode.code, "AccountNotInitialized");
      } else {
        assert.fail("Error does not contain logs. Unable to verify error code.");
      }
    }
  });
  
  
  
  

  it("Vote For Preferred Candidate!", async () => {
    await program.methods
      .vote(
        "Donald Trump",
        new anchor.BN(1),
      )
      .rpc();
    
    const [trumpAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Donald Trump")],
      votingAddress
    );
    const trumpCandidate = await program.account.candidate.fetch(trumpAddress);
    console.log(trumpCandidate);
    expect(trumpCandidate.candidateVotes.toNumber()).to.equal(1);
  });


  it("Fails to cast a vote in an uninitialized poll", async () => {
    const pollId = new anchor.BN(3);
  
    try {
      // Attempt to cast a vote in an uninitialized poll
      await program.methods
        .vote("Kamala Harris", pollId) // Example method for voting
        .rpc();
  
      // If no error is thrown, fail the test
      assert.fail("Unexpected success: Voting should fail in an uninitialized poll.");
    } catch (_err) {
      if (_err.logs) {
        // Parse and assert the error code
        const err = anchor.AnchorError.parse(_err.logs);
        assert.strictEqual(err.error.errorCode.code, "AccountNotInitialized");
      } else {
        assert.fail("Error does not contain logs. Unable to verify error code.");
      }
    }
  });
});
