import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import pinataSDK from "@pinata/sdk";
import { execSync } from "child_process";
import path from "path";

// Load environment variables from .env file
dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });

// Middlewares
app.use(cors());
app.use(express.json());

// Init Pinata using JWT
const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

/* ===========================================================
   🚀 Deploy Smart Contract via Hardhat
=========================================================== */

app.get("/deploy", (req, res) => {
  try {
    const output = execSync("npx hardhat run scripts/deploy.cjs --network sepolia", {
      encoding: "utf-8",
      cwd: "../zktp", // 👉 Point to your Hardhat project folder
    });

    const match = output.match(/Contract deployed to: (0x[a-fA-F0-9]{40})/);
    if (!match) throw new Error("Contract address not found");

    const contractAddress = match[1];
    console.log("✅ Contract deployed:", contractAddress);

    res.json({ address: contractAddress });
  } catch (err) {
    console.error("❌ Deploy error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===========================================================
   🔍 Verify Smart Contract
=========================================================== */

app.post("/verify", (req, res) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: "Contract address required" });
  }

  try {
    const output = execSync(`npx hardhat verify --network sepolia ${address}`, {
      encoding: "utf-8",
      cwd: path.resolve("../zktp"),
    });

    res.json({ success: true, output });
  } catch (err) {
    console.error("❌ Verify error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===========================================================
   📤 Upload Multiple Images + Metadata to IPFS (Pinata)
=========================================================== */

app.post(
  "/upload",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 20 },
  ]),
  async (req, res) => {
    try {
      const thumbnailFile = req.files["thumbnail"]?.[0];
      const extraFiles = req.files["images"] || [];

      if (!thumbnailFile && extraFiles.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      console.log(`📸 Uploading ${1 + extraFiles.length} files to Pinata...`);

      // Upload thumbnail (main image)
      let thumbnailCID = null;
      if (thumbnailFile) {
        const stream = fs.createReadStream(thumbnailFile.path);
        const result = await pinata.pinFileToIPFS(stream, {
          pinataMetadata: { name: thumbnailFile.originalname },
        });

        thumbnailCID = `ipfs://${result.IpfsHash}`;
        fs.unlinkSync(thumbnailFile.path);
      }

      // Upload additional images
      const extraImageCIDs = [];
      for (const file of extraFiles) {
        const stream = fs.createReadStream(file.path);
        const result = await pinata.pinFileToIPFS(stream, {
          pinataMetadata: { name: file.originalname },
        });

        extraImageCIDs.push(`ipfs://${result.IpfsHash}`);
        fs.unlinkSync(file.path);
      }

      // Retrieve metadata from the form
      const { name, description, attributes, metadataName } = req.body;
      let parsedAttributes = [];

      try {
        parsedAttributes = JSON.parse(attributes || "[]");
      } catch (e) {
        console.error("Invalid attributes JSON", e);
      }

      // Create metadata JSON according to Rarible's standard
      const metadata = {
        name,
        description,
        image: thumbnailCID, // ✅ main image displayed on Rarible
        extra_images: extraImageCIDs, // additional images
        attributes: parsedAttributes,
      };

      // Upload metadata JSON to IPFS
      const metadataResult = await pinata.pinJSONToIPFS(metadata, {
        pinataMetadata: {
          name: metadataName ? `${metadataName}.json` : "metadata.json",
        },
      });

      console.log("✅ Upload success:", metadataResult.IpfsHash);

      res.json({
        success: true,
        thumbnail_cid: thumbnailCID,
        extra_image_cids: extraImageCIDs,
        metadata_cid: metadataResult.IpfsHash,
        metadata_uri: `ipfs://${metadataResult.IpfsHash}`,
      });
    } catch (err) {
      console.error("❌ Upload error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/* ===========================================================
   🚦 Start Server
=========================================================== */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running at http://localhost:${PORT}`));
