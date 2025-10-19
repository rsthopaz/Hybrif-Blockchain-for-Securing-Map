const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const addr = "0xdE8ccc79614fCeE4f2B3090D70Ce325DAD43dcB6"; // alamat deploy
  const contract = await hre.ethers.getContractAt("PolygonGeometry", addr);

  const prepared = JSON.parse(fs.readFileSync("prepared.json", "utf8"));

  // ambil vertex pertama
  const [x, y] = prepared.intCoords[0];
  const proof = prepared.proofs[0];

  const ok = await contract.verifyVertex(x, y, proof);
  console.log("Verify vertex:", [x, y], "=>", ok);
}

main().catch(console.error);
