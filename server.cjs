require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Load ABI
const contractPath = path.resolve("./artifacts/contracts/Certificate.sol/Certificate.json");
const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));

// Provider & Wallet
const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_PRIVATE_KEY_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Connect ke kontrak yang sudah di-deploy (alamat dari .env)
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, contractJson.abi, wallet);

// Endpoint test
app.get("/test", async (req, res) => {
  try {
    const name = await contract.name(); // ERC721 punya name()
    const symbol = await contract.symbol();
    res.json({ contractAddress, name, symbol });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint mint NFT
app.post("/mint", async (req, res) => {
  try {
    const { image, name, description, attributes } = req.body;

    // Metadata (biasanya diupload ke IPFS, disini kita simpan lokal)
    const metadata = { image, name, description, attributes };
    fs.writeFileSync("./metadata.json", JSON.stringify(metadata, null, 2));

    // Panggil kontrak untuk mint (sementara pakai dummy data)
    const tx = await contract.safeMintWithCommitment(
      ethers.ZeroHash, // dummy
      1234             // dummy
    );
    await tx.wait();

    res.json({ txHash: tx.hash, metadata });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log("Backend running on port 3001, connected to contract:", contractAddress);
});
