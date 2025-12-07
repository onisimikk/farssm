import solc from 'solc';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔨 Compiling and Deploying ScoreBoard Contract\n");

// Read the contract source
const contractPath = path.join(__dirname, 'src/contracts/ScoreBoard.sol');
const source = fs.readFileSync(contractPath, 'utf8');

// Prepare input for solc
const input = {
  language: 'Solidity',
  sources: {
    'ScoreBoard.sol': {
      content: source
    }
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode']
      }
    }
  }
};

console.log("⏳ Compiling contract with Solidity 0.8.20...");

// Compile the contract
const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Check for errors
if (output.errors) {
  const errors = output.errors.filter(err => err.severity === 'error');
  if (errors.length > 0) {
    console.error("❌ Compilation errors:");
    errors.forEach(err => console.error(err.formattedMessage));
    process.exit(1);
  }

  // Show warnings
  const warnings = output.errors.filter(err => err.severity === 'warning');
  if (warnings.length > 0) {
    console.log("⚠️  Warnings:");
    warnings.forEach(warn => console.log(warn.formattedMessage));
  }
}

const contract = output.contracts['ScoreBoard.sol']['ScoreBoard'];
const abi = contract.abi;
const bytecode = contract.evm.bytecode.object;

console.log("✅ Contract compiled successfully!\n");

// Deploy
async function deploy() {
  try {
    const RPC_URL = "https://mainnet.base.org";
    const PRIVATE_KEY = process.env.PRIVATE_KEY;

    if (!PRIVATE_KEY) {
      console.error("❌ Private key not found in .env file");
      process.exit(1);
    }

    console.log("🚀 Deploying to Base mainnet...");

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log("📝 Deployer address:", wallet.address);

    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

    if (balance === 0n) {
      console.error("❌ Account has zero balance");
      process.exit(1);
    }

    // Create contract factory
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    console.log("\n⏳ Sending deployment transaction...");

    // Deploy with gas estimation
    const contract = await factory.deploy({
      gasLimit: 2000000 // Set a reasonable gas limit
    });

    console.log("📤 Transaction sent! Hash:", contract.deploymentTransaction().hash);
    console.log("⏳ Waiting for confirmation...");

    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();

    console.log("\n🎉 Contract deployed successfully!");
    console.log("📍 Contract address:", contractAddress);
    console.log("🔗 View on BaseScan: https://basescan.org/address/" + contractAddress);

    // Save deployment info
    const deploymentInfo = {
      network: "base-mainnet",
      chainId: 8453,
      contractAddress: contractAddress,
      deployedAt: new Date().toISOString(),
      deployer: wallet.address,
      transactionHash: contract.deploymentTransaction().hash
    };

    fs.writeFileSync(
      'deployment.json',
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n💾 Deployment info saved to deployment.json");
    console.log("\n📋 Next step:");
    console.log(`   Update src/hooks/useScoreContract.ts with address: ${contractAddress}`);

    return contractAddress;

  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error.message);
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.error("\n💡 You need more ETH. Current balance is too low for deployment.");
    }
    process.exit(1);
  }
}

deploy();
