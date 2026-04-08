# Task 4: Private Blockchain Implementation (Ethereum + Hardhat)

This project sets up a **private Ethereum blockchain** using Hardhat and deploys a sample smart contract with a working dApp frontend.

## Deliverables Included

- Blockchain configuration files:
  - `hardhat.config.js`
  - `contracts/SimpleStorage.sol`
  - `scripts/deploy.js`
- Deployment steps:
  - documented below and executable via npm scripts
- Working dApp:
  - `frontend/index.html`
  - `frontend/app.js`

## Prerequisites

- Node.js 18 or 20 LTS (recommended)
- npm
- MetaMask browser extension

If you are using Node.js 23+ (for example Node.js 24), Hardhat may throw runtime assertion errors on Windows.

## 1) Install dependencies

```bash
npm install
```

## 2) Start private blockchain node

```bash
npm run node
```

This starts a local private chain at `http://127.0.0.1:8545` with chain ID `31337`.

## 3) Deploy the sample contract

Open a second terminal in the same project and run:

```bash
npm run deploy:local
```

After deployment:
- contract address is printed in terminal
- `frontend/contract-info.json` is auto-updated with deployed address and ABI

## 4) Configure MetaMask for local chain

Add a custom network in MetaMask:

- Network Name: Hardhat Local
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency Symbol: `ETH`

Import one of the Hardhat test accounts (private keys are printed in `npm run node` output).

## 5) Run the dApp

In a third terminal:

```bash
npm run serve:dapp
```

Open:

- `http://127.0.0.1:3000`

Use the dApp to:
- connect wallet
- read current on-chain message
- update message by sending a transaction

## Useful Commands

```bash
npm run compile
npm run clean
npm run deploy:hardhat
```

## Notes

- This is a private development blockchain setup for learning and assignment use.
- For production-grade private networks, consider enterprise tooling and secure key management.
- If deployment ends with a Windows assertion while using newer Node.js versions, switch to Node.js 20 LTS and rerun install/compile/deploy.
