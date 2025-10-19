// scripts/deployGeometry.cjs
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const Factory = await hre.ethers.getContractFactory("PolygonGeometry");

  // Baca prepared.json
  const prepared = JSON.parse(fs.readFileSync("prepared.json", "utf8"));
  const root = prepared.merkleRoot;
  const areaTimes2 = prepared.areaTimes2;

  console.log("📦 Deploying PolygonGeometry with:");
  console.log("  Merkle Root:", root);
  console.log("  Area x2:", areaTimes2);

  // Deploy kontrak
  const contract = await Factory.deploy(root, areaTimes2);
  await contract.waitForDeployment();

  const addr = await contract.getAddress();
  console.log("✅ PolygonGeometry deployed at:", addr);
}

main().catch((err) => {
  console.error("❌ Deployment error:", err);
  process.exit(1);
});
