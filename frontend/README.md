# Frontend Application for Voting System

This repository contains the frontend for a decentralized voting application built on the Solana blockchain. The application allows users to:

1. Initialize polls.
2. Initialize candidates for polls.
3. Vote for their preferred candidate.
4. View all initialized polls and candidates and the corresponding number of votes associated with candidates

## Features

- **Initialize Polls**: Create polls with unique IDs, descriptions, start times, and end times.
- **Initialize Candidates**: Add candidates to a specific poll.
- **Vote**: Cast votes for candidates in a particular poll.
- **View Polls and Candidates**: Fetch and display details of all initialized polls and candidates with their corresponding number of votes.

## Prerequisites

Before running the application, ensure you have the following installed:

1. [Node.js](https://nodejs.org/) (v16.x or later recommended)
2. [Yarn](https://yarnpkg.com/) for dependency management
3. A compatible web browser with a Solana wallet extension like [Phantom](https://phantom.app/).

## Setup and Installation

Follow these steps to set up and run the frontend application:

1. Clone the repository:

   ```bash
   git clone <repository_url>
   cd <repository_folder>
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Configure Your Solana Wallet:
  - Ensure your solana wallet at phantom is in devnet mode. ( After creating a new wallet, navigate to settings. Click on Developer Settings, and toggle the testnet mode ON)
  - copy your devnet public key address and airdrop some free SOLs for paying the transaction fees from `faucet.solana.com`.


4. Start the application:

   ```bash
   yarn dev run
   ```

5. Open the application in your browser at `http://localhost:3000`.

## Usage

### Initialize Polls
1. Enter the following details in the "Initialize Poll" section:
   - Poll ID
   - Poll Question
   - Poll Start Time (UNIX timestamp)
   - Poll End Time (UNIX timestamp)
2. Click the "Initialize Poll" button.

### Get Initialized Polls
- Click the "Get Initialized Polls" button to fetch and display all initialized polls.

### Initialize Candidates
1. Enter the following details in the "Initialize Candidate" section:
   - Poll ID
   - Candidate Name
2. Click the "Initialize Candidate" button.

### Get Initialized Candidates
- Click the "Get Initialized Candidates" button to fetch and display all initialized candidates.

### Cast Your Vote
1. Enter the following details in the "Cast Your Vote" section:
   - Poll ID
   - Candidate Name
2. Click the "Vote" button.


## Technologies Used

- **React**: Frontend library for building user interfaces.
- **TailwindCSS**: Styling framework for designing the UI.
- **Solana Web3.js**: JavaScript SDK for interacting with the Solana blockchain.
- **Phantom Wallet**: Browser wallet for signing transactions.

## Troubleshooting

- Ensure your Solana wallet is connected, and you are in devnet mode and funded with sufficient airdropped SOL to pay for transaction fees.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- Solana documentation and developer tools
- Anchor framework for smart contract development

Feel free to open issues or contribute to the project!

