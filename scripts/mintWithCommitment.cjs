// scripts/mintWithCommitment.cjs
const fs = require('fs');
require('dotenv').config();
const hre = require('hardhat');

async function main() {
  const prepared = JSON.parse(fs.readFileSync('prepared.json', 'utf8'));
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    console.error("Set CONTRACT_ADDRESS in .env");
    process.exit(1);
  }

  const [signer] = await hre.ethers.getSigners();
  const Cert = await hre.ethers.getContractFactory("Certificate");
  const contract = Cert.attach(contractAddress).connect(signer);

  const merkleRoot = prepared.merkleRoot;
  const areaTimes2 = prepared.areaTimes2;

  const tx = await contract.safeMintWithCommitment(merkleRoot, areaTimes2);
  console.log('tx sent:', tx.hash);
  await tx.wait();
  console.log('Mint done!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
