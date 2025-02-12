# Raydium Liquidity Pool Creator

Welcome to the Raydium Liquidity Pool Creator! This project allows you to easily create new liquidity pools on the Raydium platform and add liquidity to them.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Usage](#usage)

## Features

- Create new liquidity pools on Raydium.
- Add liquidity to existing pools.
- Configurable environment variables for easy setup.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)
- A Solana wallet with some SOL for transaction fees.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/tobi8068/LPRaydium.git
   ```

2. Navigate to the project directory:

   ```bash
   cd LPRaydium
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

## Environment Variables

Create a `.env` file in the root directory of your project with the following structure:

```env
RPC_URL=
NETWORK=mainnet
PRIVATE_KEY=
# Token Info
BASE_TOKEN= 
QUOTE_TOKEN= 
BASE_TOKEN_AMOUNT= 
QUOTE_TOKEN_AMOUNT= 
BASE_TOKEN_AMOUNT_FOR_ADD_LIQUIDITY=

# LotSize default is 1
LOT_SIZE= 
# TickSize default is 0.01
TICK_SIZE= 
```

### Variable Descriptions

- `RPC_URL`: The RPC URL for connecting to the Solana blockchain.
- `NETWORK`: The network to connect to (e.g., `mainnet` or `devnet`).
- `PRIVATE_KEY`: Your wallet's private key for signing transactions.
- `BASE_TOKEN`: The address of the base token.
- `QUOTE_TOKEN`: The address of the quote token.
- `BASE_TOKEN_AMOUNT`: The amount of base tokens to add.
- `QUOTE_TOKEN_AMOUNT`: The amount of quote tokens to add.
- `BASE_TOKEN_AMOUNT_FOR_ADD_LIQUIDITY`: The amount of base tokens to use when adding liquidity.
- `LOT_SIZE`: The default lot size (default is 1).
- `TICK_SIZE`: The default tick size (default is 0.01).

## Usage

To create a new pool and add liquidity, run the following command:

```bash
npm start
```

Make sure your `.env` file is properly configured before running the command.