# TODO
# Anchor Voting Program

This Anchor program is a Solana smart contract that facilitates a decentralized voting system. Users can create polls, initialize candidates for each poll, cast votes, and retrieve results.

---

## Features

- **Initialize Polls:** Create polls with a unique ID, description, start time, and end time.
- **Initialize Candidates:** Add candidates to a specific poll.
- **Cast Votes:** Vote for candidates within an active poll.

---

## Prerequisites

Before using this program, ensure you have the following installed:

- [Rust](https://www.rust-lang.org/) (with the Solana toolchain)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor Framework](https://project-serum.github.io/anchor/getting-started/introduction.html)

---

## Getting Started

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd anchor-voting-program
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Build the Program

```bash
anchor build
```

### 4. Deploy the Program

Update your `Anchor.toml` file with the correct Solana cluster RPC URL (e.g., `devnet`) and deploy the program:

```bash
anchor deploy
```

Take note of the program ID displayed after deployment.

---

## Key Instructions

### Initialize a Poll

1. Derive a **poll PDA** using the poll ID.
2. Call the `initialize_poll` instruction with the required details:
   - Poll ID
   - Description
   - Start Time
   - End Time

### Initialize a Candidate

1. Derive a **candidate PDA** using the poll ID and candidate name.
2. Call the `initialize_candidate` instruction with the required details:
   - Poll ID
   - Candidate Name

### Cast a Vote

1. Derive a **vote PDA** using the voter's public key and poll ID.
2. Call the `cast_vote` instruction with:
   - Poll ID
   - Candidate Name

### Reset State (Optional)

1. Call the `reset_state` instruction to delete all polls, candidates, and votes.

---

## Testing the Program

### 1. Run Anchor Tests

```bash
anchor test
```

Ensure your local validator is running for the tests to execute correctly.

### 2. Manual Testing

Use the [Solana Explorer](https://explorer.solana.com/) or your preferred Solana wallet to manually test the deployed program by interacting with the instructions.

---

## Integration with Frontend

To use the program with your frontend application:

1. Update the frontend code with the deployed **program ID**.
2. Ensure the PDA derivation logic matches the backend program.
3. Use the program's instructions (e.g., `initialize_poll`, `cast_vote`) within the frontend using the Anchor client.

---

## Program Structure

- **Programs Directory:** Contains the Anchor program code.
- **Tests Directory:** Includes test cases written in TypeScript.
- **IDL File:** The program's interface definition, generated after building the program.

---

## Troubleshooting

1. **Unable to Deploy:** Ensure Solana CLI and Anchor versions are compatible.
2. **Instruction Errors:** Verify that the PDA derivation logic and accounts passed match the program's requirements.
3. **Cluster Issues:** Check the status of the Solana cluster being used (e.g., devnet or testnet).

---

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

---

## Acknowledgments

- [Anchor Framework Documentation](https://project-serum.github.io/anchor/)
- [Solana Documentation](https://docs.solana.com/)
