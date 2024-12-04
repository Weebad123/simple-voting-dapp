// TODO: SignMessageimport { verify } from '@noble/ed25519';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { FC, useCallback, useState, useEffect} from 'react';
import { notify } from "../utils/notifications";
import React from 'react';

//import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, web3, utils, BN, setProvider } from "@coral-xyz/anchor";
import idl from "./voting.json";
import { voting } from "./voting";// This might BE A BIG PROBLEM DUE TO THE CHANGES I MADE IN THE TYPESCRIPT TYPE FILE
import { PublicKey } from '@solana/web3.js';
//import { program } from '@coral-xyz/anchor/dist/cjs/native/system';

const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);
const programID = new PublicKey(idl.address);

export const Voting: FC = () => {
    const ourWallet = useWallet();
    const { connection } = useConnection();
    const [polls, setPolls] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const getProvider  = () => {
        const provider = new AnchorProvider(connection, ourWallet, AnchorProvider.defaultOptions());
        setProvider(provider);
        return provider;
    }

    // State for Poll below       
    const [pollId, setPollId] = useState<string>("");
    const [pollIdCandidate, setPollIdCandidate] = useState<string>("");
    const [candidateName, setCandidateName] = useState<string>("");
    const [pollStart, setPollStart] = useState<string>("");
    const [pollEnd, setPollEnd] = useState<string>("");
    const [pollDescription, setPollDescription] = useState<string>("");

    // State for candidate below
    const [candidates, setCandidates] = useState([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);

    // State for voting below
    const [pollIdVote, setPollIdVote] = useState("");
    const [candidateNameVote, setCandidateNameVote] = useState("");
    const [voterKeypair, setVoterKeypair] = useState("");



    //   ||||||||||||||||||                    POLL      INITIALIZATION         LOGIC           ||||||||||||||||

    const initializePoll = async () => {
        try {
            const anchProvider = getProvider();
            const program = new Program<voting>(idl_object, anchProvider);
            if (!pollId || !pollDescription || !pollStart || !pollEnd) {
                alert("All fields are required!");
                return;
            }

            await program.methods.initialize(
                new BN(Number(pollId)),
                pollDescription,
                new BN(Number(pollStart)),
                new BN(Number(pollEnd))
            ).accounts({
                pollAdministrator: anchProvider.wallet.publicKey,
                expectedAdmin: anchProvider.wallet.publicKey,
        }).rpc();

            console.log("New Poll has been initialized!");
            notify({ type: "success", message: "Poll Initialized Successfully!"});
        } catch (error) {
            console.error("Error While Initializing Poll!", error);
            notify({ type: "error", message: "Failed to Initialize Poll", description: error.message});
        }
    };

    //       |||||||             POLLS             GETTER                 ||||||||||

    const getInitializedPolls = async () => {
        setLoading(true);
        try {
            const anchProvider = getProvider();
            const program = new Program<voting>(idl_object, anchProvider);
    
            // Fetch all Poll accounts
            const pollsData = await program.account.poll.all();
    
            // Log each poll's account to inspect its data
            pollsData.forEach(({ account }) => {
                console.log("Poll Account Data:", account);
            });
    
            const formattedPolls = pollsData.map(({ publicKey, account }) => {
                // Debugging: Log each field of the poll
                console.log('Poll Account Fields:', {
                    pollId: account.pollId?.toNumber(),
                    pollDescription: account.pollDescription,
                    pollStart: account.pollStart?.toNumber(),
                    pollEnd: account.pollEnd?.toNumber(),
                });
    
                return {
                    publicKey: publicKey.toString(),
                    pollId: account.pollId?.toNumber(),
                    pollDescription: account.pollDescription || 'No description available',
                    pollStart: account.pollStart?.toNumber(),
                    pollEnd: account.pollEnd?.toNumber(),
                };
            });
    
            setPolls(formattedPolls);
    
        } catch (error) {
            console.error("Error fetching polls:", error);
        } finally {
            setLoading(false);
        }
    };

//  ||||||||||||||||                CANDIDATE INITIALIZATION LOGIC                |||||||||||||||||||

    const initializeCandidate = async () => {
        try {
            const anchProvider = getProvider();
            const program = new Program<voting>(idl_object, anchProvider);

            const pollIdBN = new BN(Number(pollIdCandidate));
            
            await program.methods.candidateInitialize(candidateName, pollIdBN)
                .accounts({
                    pollAdministrator: anchProvider.wallet.publicKey,
                })
                .rpc();

            console.log("Candidate Initialized Successfully!");
        } catch (error) {
            console.error("Error Initializing Candidate!", error);
        }
    };

//          ||||||||||||                  CANDIDATE           GETTER                |||||||||

    const getInitializedCandidatesAndVotes = async () => {
    try {

        const anchProvider = getProvider();
        const program = new Program<voting>(idl_object, anchProvider);
        setLoadingCandidates(true); // Optional: Indicate loading state
        const candidateAccounts = await program.account.candidate.all();

        const candidates = candidateAccounts.map((account) => ({
            //pollId: account.account.pollId.toNumber(),
            candidateName: account.account.candidateName,
            votes: account.account.candidateVotes.toNumber(),
            publicKey: account.publicKey.toBase58(),
        }));

        console.log("Fetched Candidates:", candidates);
        setCandidates(candidates); // Save the candidates in state for display
    } catch (error) {
        console.error("Error fetching candidates:", error);
    } finally {
        setLoadingCandidates(false);
    }
};



//      |||||||||||||||                        VOTING                          |||||||||||||||

    const voteForPreferredCandidate = async (pollId, candidateName) => {
        try {
            const anchProvider = getProvider();
            const program = new Program<voting>(idl_object, anchProvider);
            // Ensure pollId and candidateName are provided
            if (!pollId || !candidateName) {
                throw new Error("Poll ID and Candidate Name are required.");
            }
    
            // Derive the poll PDA
            const [pollPda] = await PublicKey.findProgramAddress(
                [new BN(pollId).toArrayLike(Buffer, "le", 8)],
                program.programId
            );
    
            // Derive the candidate PDA
            const [candidatePda] = await PublicKey.findProgramAddress(
                [
                    new BN(pollId).toArrayLike(Buffer, "le", 8),
                    Buffer.from(candidateName),
                ],
                program.programId
            );
    
            // Derive the vote PDA (specific to the voter)
            const [votePda] = await PublicKey.findProgramAddress(
                [
                    ourWallet.publicKey.toBuffer(),
                    new BN(pollId).toArrayLike(Buffer, "le", 8),
                ],
                program.programId
            );
    
            console.log("Poll PDA:", pollPda.toString());
            console.log("Candidate PDA:", candidatePda.toString());
            console.log("Vote PDA:", votePda.toString());
    
            // Call the Anchor program's `cast_vote` method
            const tx = await program.methods
                .vote(candidateName, new BN(pollId)) // Arguments in the same order as the backend
                .accounts({
                    voter: ourWallet.publicKey,
                    // @ts-ignore
                    pollPda: pollPda,
                    candidate: candidatePda,
                    votePda: votePda,
                    systemProgram: web3.SystemProgram.programId,
                })
                .signers([])
                .rpc();
    
            console.log("Vote transaction signature:", tx);
            alert(`Successfully voted for ${candidateName}!`);
        } catch (error) {
            console.error("Error while casting vote:", error);
            alert(`Failed to cast vote: ${error.message}`);
        }
    };
 



    //   |||||||||               RENDERING          LOGIC                    ||||||||||||

    return (
        <div className="flex flex-row justify-between">
          {/* Initialize Poll Section */}
          <div className="flex flex-col items-start space-y-20">
            <div className="flex flex-col">
              <h1 className="text-lg font-bold mb-4">INITIALIZE POLL</h1>
              <form className="flex flex-col space-y-4 w-1/2">
                <input
                  type="number"
                  placeholder="Poll ID!"
                  value={pollId}
                  onChange={(e) => setPollId(e.target.value)}
                  className="p-2 border rounded"
                  style={{ color: "black" }}
                />
                <input
                  type="text"
                  placeholder="Poll Question!"
                  value={pollDescription}
                  onChange={(e) => setPollDescription(e.target.value)}
                  className="p-2 border rounded"
                  style={{ color: "black" }}
                />
                <input
                  type="number"
                  placeholder="Poll Start Time!"
                  value={pollStart}
                  onChange={(e) => setPollStart(e.target.value)}
                  className="p-2 border rounded"
                  style={{ color: "black" }}
                />
                <input
                  type="number"
                  placeholder="Poll End Time!"
                  value={pollEnd}
                  onChange={(e) => setPollEnd(e.target.value)}
                  className="p-2 border rounded"
                  style={{ color: "black" }}
                />
                <button
                  type="button"
                  onClick={initializePoll}
                  className="btn bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Initialize Poll
                </button>
              </form>
            </div>
            <div>
              <button
                type="button"
                onClick={getInitializedPolls}
                className="btn bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                {loading ? 'Loading Polls...' : 'Get Initialized Polls'}
              </button>
              {polls.length > 0 && (
                <div className="mt-4">
                  <h2>Initialized Polls</h2>
                  <ul>
                    {polls.map((poll, index) => (
                      <li key={index}>
                        <p><strong>Poll ID:</strong> {poll.pollId}</p>
                        <p><strong>Question:</strong> {poll.pollDescription}</p>
                        <p><strong>Start Time:</strong> {poll.pollStart}</p>
                        <p><strong>End Time:</strong> {poll.pollEnd}</p>
                        <p><strong>Address:</strong> {poll.publicKey}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
      
          {/* Initialize Candidate Section */}
          <div className="flex flex-col items-center">
            <div className="form-container">
              <h1 className="text-lg font-bold mb-4">INITIALIZE CANDIDATE</h1>
              <input
                type="number"
                placeholder="Enter Poll ID"
                value={pollIdCandidate}
                onChange={(e) => setPollIdCandidate(e.target.value)}
                className="p-2 border rounded"
                style={{ color: "black" }}
              />
              <input
                type="text"
                placeholder="Enter Candidate Name"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="p-2 border rounded"
                style={{ color: "black" }}
              />
              <button
                onClick={initializeCandidate}
                className="btn bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Initialize Candidate
              </button>
            </div>
            <div className="mt-20">
              <button
                type="button"
                onClick={getInitializedCandidatesAndVotes}
                className="btn bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded"
              >
                {loadingCandidates ? 'Loading Candidates...' : 'Get Initialized Candidates'}
              </button>
              {candidates.length > 0 && (
                <div className="mt-4">
                  <h2>Initialized Candidates</h2>
                  <ul>
                    {candidates.map((candidate, index) => (
                      <li key={index} className="mb-2">
                        <p><strong>Candidate Name:</strong> {candidate.candidateName}</p>
                        <p><strong>Votes:</strong> {candidate.votes}</p>
                        <p><strong>Address:</strong> {candidate.publicKey}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
      
          {/* Vote Section */}
          <div className="flex flex-col items-end">
            <h2 className="text-lg font-bold mb-4">CAST YOUR VOTE!</h2>
            <form className="flex flex-col space-y-4 w-1/2">
              <input
                type="number"
                placeholder="Enter Poll ID"
                onChange={(e) => setPollIdVote(e.target.value)}
                className="p-2 border rounded"
                style={{ color: "black" }}
              />
              <input
                type="text"
                placeholder="Enter Candidate Name"
                onChange={(e) => setCandidateNameVote(e.target.value)}
                className="p-2 border rounded"
                style={{ color: "black" }}
              />
              <button
                type="button"
                onClick={() => voteForPreferredCandidate(pollIdVote, candidateNameVote)}
                className="btn bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Vote
              </button>
            </form>
          </div>
        </div>
      );
      
};
