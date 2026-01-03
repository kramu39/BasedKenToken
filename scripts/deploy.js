const hre = require("hardhat");
const ethers = hre.ethers;

// Configuration for different networks
const NETWORK_CONFIG = {
  ethereum: {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcUrl: process.env.ETHEREUM_RPC_URL,
    blockExplorer: "https://etherscan.io",
  },
  sepolia: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: process.env.SEPOLIA_RPC_URL,
    blockExplorer: "https://sepolia.etherscan.io",
  },
  base: {
    chainId: 8453,
    name: "Base Chain",
    rpcUrl: process.env.BASE_RPC_URL,
    blockExplorer: "https://basescan.org",
  },
};

// Token configuration
const TOKEN_CONFIG = {
  name: "BasedKenToken",
  symbol: "BKEN",
  initialSupply: ethers.parseEther("1000000"), // 1,000,000 tokens with 18 decimals
  decimals: 18,
};

/**
 * Deploy BasedKenToken ERC-20 contract
 * @param {string} network - Target network (ethereum, sepolia, or base)
 */
async function deployToken(network = "sepolia") {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Deploying BasedKenToken to ${NETWORK_CONFIG[network].name}`);
  console.log(`${"=".repeat(60)}\n`);

  // Get the contract factory
  const BasedKenToken = await hre.ethers.getContractFactory("BasedKenToken");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer Address: ${deployer.address}`);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer Balance: ${ethers.formatEther(balance)} ETH\n`);

  // Deploy contract with initial supply
  console.log("Deploying contract...");
  const basedKenToken = await BasedKenToken.deploy(
    TOKEN_CONFIG.name,
    TOKEN_CONFIG.symbol,
    TOKEN_CONFIG.initialSupply
  );

  await basedKenToken.waitForDeployment();
  const deployedAddress = await basedKenToken.getAddress();

  console.log(`✓ BasedKenToken deployed successfully!`);
  console.log(`\nContract Details:`);
  console.log(`  Address: ${deployedAddress}`);
  console.log(`  Name: ${TOKEN_CONFIG.name}`);
  console.log(`  Symbol: ${TOKEN_CONFIG.symbol}`);
  console.log(`  Initial Supply: ${ethers.formatEther(TOKEN_CONFIG.initialSupply)} ${TOKEN_CONFIG.symbol}`);
  console.log(`  Decimals: ${TOKEN_CONFIG.decimals}`);
  console.log(`  Network: ${NETWORK_CONFIG[network].name}`);
  console.log(`  Chain ID: ${NETWORK_CONFIG[network].chainId}`);

  // Verify contract details on chain
  console.log("\nVerifying contract on-chain...");
  try {
    const name = await basedKenToken.name();
    const symbol = await basedKenToken.symbol();
    const totalSupply = await basedKenToken.totalSupply();
    const decimals = await basedKenToken.decimals();
    const deployerBalance = await basedKenToken.balanceOf(deployer.address);

    console.log(`✓ Name: ${name}`);
    console.log(`✓ Symbol: ${symbol}`);
    console.log(`✓ Total Supply: ${ethers.formatEther(totalSupply)} ${symbol}`);
    console.log(`✓ Decimals: ${decimals}`);
    console.log(`✓ Deployer Balance: ${ethers.formatEther(deployerBalance)} ${symbol}`);
  } catch (error) {
    console.error("Error verifying contract:", error.message);
  }

  // Save deployment info
  const deploymentInfo = {
    network: NETWORK_CONFIG[network].name,
    chainId: NETWORK_CONFIG[network].chainId,
    contractAddress: deployedAddress,
    tokenName: TOKEN_CONFIG.name,
    tokenSymbol: TOKEN_CONFIG.symbol,
    initialSupply: ethers.formatEther(TOKEN_CONFIG.initialSupply),
    decimals: TOKEN_CONFIG.decimals,
    deployerAddress: deployer.address,
    deploymentDate: new Date().toISOString(),
    blockExplorer: `${NETWORK_CONFIG[network].blockExplorer}/address/${deployedAddress}`,
  };

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Deployment Summary`);
  console.log(`${"=".repeat(60)}`);
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to JSON file
  const fs = require("fs");
  const deploymentPath = `./deployments/${network}-deployment.json`;
  const deploymentsDir = "./deployments";

  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n✓ Deployment info saved to: ${deploymentPath}`);

  return deployedAddress;
}

/**
 * Deploy to all networks
 */
async function deployToAllNetworks() {
  const networks = ["sepolia", "ethereum", "base"];
  const deployments = {};

  for (const network of networks) {
    try {
      deployments[network] = await deployToken(network);
    } catch (error) {
      console.error(`Error deploying to ${network}:`, error.message);
    }
  }

  return deployments;
}

/**
 * Main execution
 */
async function main() {
  const networkArg = process.argv[2] || "sepolia";

  if (networkArg === "all") {
    await deployToAllNetworks();
  } else if (NETWORK_CONFIG[networkArg]) {
    await deployToken(networkArg);
  } else {
    console.error(`Invalid network: ${networkArg}`);
    console.log(`Available networks: ${Object.keys(NETWORK_CONFIG).join(", ")}, all`);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

module.exports = { deployToken, deployToAllNetworks, NETWORK_CONFIG, TOKEN_CONFIG };
