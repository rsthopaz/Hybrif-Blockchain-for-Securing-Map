const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
  console.log("🚀 Deploying AreaCommit contract...");

  const AreaFactory = await ethers.getContractFactory("AreaCommit");
  const area = await AreaFactory.deploy();

  await area.waitForDeployment();

  // ✅ FIX: get address properly
  const address = await area.getAddress();
  console.log("✅ Contract deployed to:", address);

  // Update .env file in the root folder
  const envPaths = [
    ".env",                      // File .env (default)
    "../zktp/frontend2/.env.local",  // File .env.local di frontend
    "../nft-backend/.env"     // File .env di nft-backend
  ];

  envPaths.forEach(envPath => {
    try {
      let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";

      if (envContent.match(/CONTRACT_ADDRESS=.*/)) {
        envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS="${address}"`);
      } else {
        envContent += `\nCONTRACT_ADDRESS="${address}"\n`;
      }

      fs.writeFileSync(envPath, envContent);
      console.log(`💾 CONTRACT_ADDRESS updated in ${envPath}`);
    } catch (error) {
      console.error(`❌ Failed to update ${envPath}:`, error);
    }
  });
}

main().catch((error) => {
  console.error("❌ Deployment error:", error);
  process.exitCode = 1;
});
