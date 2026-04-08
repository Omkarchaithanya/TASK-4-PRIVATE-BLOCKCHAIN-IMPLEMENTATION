const fs = require("node:fs");
const path = require("node:path");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");
  const contract = await SimpleStorage.deploy("Hello from private blockchain");
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const artifact = await hre.artifacts.readArtifact("SimpleStorage");

  console.log("SimpleStorage deployed to:", contractAddress);

  const contractInfo = {
    address: contractAddress,
    chainId: hre.network.config.chainId,
    network: hre.network.name,
    abi: artifact.abi
  };

  const outputPath = path.join(__dirname, "..", "frontend", "contract-info.json");
  fs.writeFileSync(outputPath, JSON.stringify(contractInfo, null, 2), "utf8");

  console.log("Contract info written to:", outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
