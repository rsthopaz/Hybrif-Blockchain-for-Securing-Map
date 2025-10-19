import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Area from "./models/Area.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGODB_URI;

// ===============================
// 🔗 CONNECT TO MONGODB
// ===============================
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===============================
// 🧩 API ROUTES
// ===============================

// 📦 Store area metadata (setelah commit ke blockchain)
app.post("/areas/store", async (req, res) => {
  try {
    const {
      coordinates,
      securityLevel,
      name,
      commitment,
      owner,
      areaIndex,
      publishedOnChain,
    } = req.body;

    // Validasi dasar
    if (!coordinates || coordinates.length < 3)
      return res.status(400).json({ error: "Need at least 3 coordinates" });
    if (!commitment || !owner)
      return res.status(400).json({ error: "Missing commitment or owner" });

    // Pastikan tidak duplikat berdasarkan areaIndex atau commitment
    const existing = await Area.findOne({ $or: [{ areaIndex }, { commitment }] });
    if (existing)
      return res.status(400).json({ error: "Area already exists" });

    const area = new Area({
      coordinates,
      securityLevel,
      name,
      areaIndex,
      commitment,
      owner,
      revealed: false,
      publishedOnChain: publishedOnChain ?? true,
    });

    await area.save();

    res.json({ success: true, area });
  } catch (err) {
    console.error("❌ Error saving area:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔓 Update status reveal (setelah user reveal di blockchain)
// 🔓 Update status reveal (setelah user reveal di blockchain)
// app.patch("/areas/reveal/:index", async (req, res) => {
//   try {
//     const { index } = req.params;
//     const { revealed } = req.body;

//     // Kalau index bukan angka (hash atau string), cari pakai commitment
//     let filter = {};
//     if (/^[0-9]+$/.test(index)) {
//       filter = { areaIndex: Number(index) };
//     } else {
//       filter = { commitment: index }; // pakai hash commit sebagai ID unik
//     }

//     const area = await Area.findOneAndUpdate(
//       filter,
//       { $set: { revealed } },
//       { new: true }
//     );

//     if (!area) return res.status(404).json({ error: "Area not found" });

//     res.json({ success: true, area });
//   } catch (err) {
//     console.error("❌ Error updating reveal:", err);
//     res.status(500).json({ error: err.message });
//   }
// });
app.patch("/areas/reveal/:commitment", async (req, res) => {
  try {
    let { commitment } = req.params;
    const { revealed } = req.body;

    commitment = commitment.trim().toLowerCase();

    console.log("🟡 Incoming reveal for:", commitment);

    const area = await Area.findOne({
      commitment: { $regex: new RegExp(`^${commitment}$`, "i") },
    });

    if (!area) {
      console.log("❌ Area not found for commitment:", commitment);
      return res.status(404).json({ error: "Area not found" });
    }

    console.log("🔍 Found area:", area.name);

    area.revealed = revealed;
    await area.save();

    res.json({ success: true, area });
  } catch (err) {
    console.error("❌ Error updating reveal:", err);
    res.status(500).json({ error: err.message });
  }
});




// 🧾 Ambil semua area
app.get("/areas", async (req, res) => {
  try {
    const areas = await Area.find().sort({ createdAt: -1 });
    res.json(areas);
  } catch (err) {
    console.error("❌ Error fetching areas:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🧭 Cek area milik wallet tertentu
app.get("/areas/owner/:wallet", async (req, res) => {
  try {
    const { wallet } = req.params;
    const areas = await Area.find({ owner: wallet }).sort({ createdAt: -1 });
    res.json(areas);
  } catch (err) {
    console.error("❌ Error fetching areas by owner:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// 🚀 START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
