import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.13.4/+esm";

const connectBtn = document.getElementById("connectBtn");
const refreshBtn = document.getElementById("refreshBtn");
const updateBtn = document.getElementById("updateBtn");
const messageInput = document.getElementById("messageInput");
const messageView = document.getElementById("messageView");
const statusText = document.getElementById("statusText");
const metaText = document.getElementById("metaText");

let provider;
let signer;
let contract;
let readContract;
let rpcProvider;
let contractInfo;
let isConnecting = false;

const LOCAL_RPC_URL = "http://127.0.0.1:8545";
const LOCAL_CHAIN_ID_DEC = 31337;
const LOCAL_CHAIN_ID_HEX = "0x7a69";

async function loadContractInfo() {
  if (contractInfo) {
    return;
  }

  const response = await fetch("./contract-info.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("contract-info.json not found. Run deployment first.");
  }
  contractInfo = await response.json();
}

function setStatus(message) {
  statusText.textContent = `Status: ${message}`;
}

function formatError(error) {
  const message = error?.message || String(error);
  if (message.includes("RPC endpoint returned too many errors")) {
    return "Wallet RPC is temporarily throttled. In MetaMask, switch network away and back to Hardhat Local, then retry.";
  }
  if (message.includes("-32002") || message.includes("Already processing eth_requestAccounts")) {
    return "A wallet request is already pending. Open MetaMask and finish it, then retry.";
  }
  return message;
}

async function assertLocalRpcIsUp() {
  const payload = {
    jsonrpc: "2.0",
    method: "eth_chainId",
    params: [],
    id: 1
  };

  const response = await fetch(LOCAL_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Local blockchain RPC is down. Run npm run node and retry.");
  }

  const json = await response.json();
  if (!json.result || json.result.toLowerCase() !== LOCAL_CHAIN_ID_HEX) {
    throw new Error("Unexpected local chain ID. Expected 31337 on http://127.0.0.1:8545.");
  }
}

async function ensureWalletOnLocalChain() {
  const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
  if (currentChainId === LOCAL_CHAIN_ID_HEX) {
    return;
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: LOCAL_CHAIN_ID_HEX }]
    });
  } catch (switchError) {
    if (switchError?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: LOCAL_CHAIN_ID_HEX,
            chainName: "Hardhat Local",
            rpcUrls: [LOCAL_RPC_URL],
            nativeCurrency: {
              name: "Ether",
              symbol: "ETH",
              decimals: 18
            }
          }
        ]
      });

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: LOCAL_CHAIN_ID_HEX }]
      });
      return;
    }

    throw switchError;
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }

  await assertLocalRpcIsUp();
  await ensureWalletOnLocalChain();

  provider = new ethers.BrowserProvider(window.ethereum);
  provider.pollingInterval = 10000;
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();

  const walletChainId = await window.ethereum.request({ method: "eth_chainId" });
  if (walletChainId !== LOCAL_CHAIN_ID_HEX) {
    throw new Error("Wrong wallet network. Switch to Hardhat Local (31337) and retry.");
  }

  contract = new ethers.Contract(contractInfo.address, contractInfo.abi, signer);
  rpcProvider = new ethers.JsonRpcProvider(LOCAL_RPC_URL, LOCAL_CHAIN_ID_DEC);
  readContract = new ethers.Contract(contractInfo.address, contractInfo.abi, rpcProvider);
  metaText.textContent = `Network: ${contractInfo.network} (chainId ${contractInfo.chainId}) | Contract: ${contractInfo.address}`;
}

async function readMessage() {
  if (!readContract) {
    throw new Error("Connect wallet first.");
  }
  const message = await readContract.getMessage();
  messageView.textContent = `Current message: ${message}`;
}

async function updateMessage() {
  if (!contract || !rpcProvider) {
    throw new Error("Connect wallet first.");
  }

  const newMessage = messageInput.value.trim();
  if (!newMessage) {
    throw new Error("Enter a message before updating.");
  }

  setStatus("sending transaction...");
  const tx = await contract.setMessage(newMessage);
  setStatus("waiting for confirmation...");
  await rpcProvider.waitForTransaction(tx.hash, 1, 60000);
  await readMessage();
  setStatus("message updated successfully");
}

connectBtn.addEventListener("click", async () => {
  if (isConnecting) {
    setStatus("connection already in progress");
    return;
  }

  try {
    isConnecting = true;
    connectBtn.disabled = true;
    setStatus("connecting wallet...");
    await loadContractInfo();
    await connectWallet();
    await readMessage();
    setStatus("wallet connected");
  } catch (error) {
    setStatus(formatError(error));
  } finally {
    isConnecting = false;
    connectBtn.disabled = false;
  }
});

refreshBtn.addEventListener("click", async () => {
  try {
    await readMessage();
    setStatus("message refreshed");
  } catch (error) {
    setStatus(formatError(error));
  }
});

updateBtn.addEventListener("click", async () => {
  try {
    await updateMessage();
  } catch (error) {
    setStatus(formatError(error));
  }
});
