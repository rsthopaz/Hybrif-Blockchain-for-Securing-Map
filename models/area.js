// models/Area.js
import mongoose from "mongoose";

const AreaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  coordinates: { type: [[Number]], required: true },
  securityLevel: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  commitment: { type: String, required: true }, // ✅ hash dari blockchain
  owner: { type: String, required: true },
  publishedOnChain: { type: Boolean, default: false },
  revealed: { type: Boolean, default: false },
  areaIndex: { type: Number, required: true }, // 🔹 unik ID (sinkron dg chain)

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Area || mongoose.model("Area", AreaSchema);
