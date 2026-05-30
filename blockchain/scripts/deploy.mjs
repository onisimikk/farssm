import hre from "hardhat";
import fs from 'fs';

async function main() {
  console.log("🚀 Deploying ScoreBoard contract to Base mainnet...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy the contract
  console.log("\n⏳ Deploying contract...");
  const ScoreBoard = await hre.ethers.getContractFactory("ScoreBoard");
  const scoreBoard = await ScoreBoard.deploy();

  await scoreBoard.waitForDeployment();

  const contractAddress = await scoreBoard.getAddress();

  console.log("\n✅ ScoreBoard deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("\n🔗 View on Base Blockscout:");
  console.log(`   https://base.blockscout.com/address/${contractAddress}`);

  console.log("\n📋 Next steps:");
  console.log(`   1. Update src/hooks/useScoreContract.ts with address: ${contractAddress}`);
  console.log("   2. Test the contract on Base Blockscout");
  console.log("   3. Start using it in your game!");

  // Save the address to a file for reference
  const deploymentInfo = {
    network: "base-mainnet",
    contractAddress: contractAddress,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address
  };

  fs.writeFileSync(
    'deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n💾 Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
