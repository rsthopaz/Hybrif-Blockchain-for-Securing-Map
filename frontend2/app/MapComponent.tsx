"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { ethers } from "ethers";

const MapContainer = dynamic(async () => (await import("react-leaflet")).MapContainer, { ssr: false });
const TileLayer = dynamic(async () => (await import("react-leaflet")).TileLayer, { ssr: false });
const Polygon = dynamic(async () => (await import("react-leaflet")).Polygon, { ssr: false });
const MapEventsHandler = dynamic(() => import("./MapEventsHandler"), { ssr: false });

interface Area {
  _id?: string;
  name: string;
  coordinates: [number, number][];
  secret?: string;
  securityLevel: string;
  visible: boolean;
  commitment?: string;
  owner?: string;
  publishedOnChain?: boolean;
  revealed?: boolean;
}

interface MapComponentProps {
  backendUrl: string;
  contract: ethers.Contract | null;
  signer: ethers.Signer | null;
  userAddress: string;
}

export default function MapComponent({ backendUrl, contract, signer, userAddress }: MapComponentProps) {
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);
  const [secret, setSecret] = useState("");
  const [securityLevel, setSecurityLevel] = useState("Medium");
  const [areas, setAreas] = useState<Area[]>([]);
  const [isDrawing, setIsDrawing] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAreas();
  }, []);

  async function fetchAreas() {
    try {
      const res = await axios.get(`${backendUrl}/areas`);
      const loadedAreas = res.data.map((a: Area) => ({ ...a, visible: true }));
      setAreas(loadedAreas);
    } catch (err) {
      console.error("❌ Failed to fetch areas:", err);
    }
  }

  if (!mounted) return <div>🗺️ Loading map...</div>;

  function getOpacity(level: string) {
    switch (level) {
      case "High":
        return 1;
      case "Medium":
        return 0.8;
      case "Low":
        return 0.5;
      default:
        return 0.8;
    }
  }

  // ✅ COMMIT HASH LANGSUNG
  async function handleSave() {
    if (coordinates.length < 4) return alert("Please draw at least 4 points!");
    if (!secret || !contract) return alert("Please enter secret and connect wallet!");

    try {
      const name = `Area-${Date.now()}`;
      const commitment = ethers.keccak256(ethers.toUtf8Bytes(secret));
      const areaIndex = Date.now();

      // 🔗 Kirim ke blockchain
      const tx = await contract.commitArea(commitment, name);
      await tx.wait();
      console.log("✅ Committed on blockchain:", tx.hash);

      // 🧾 Simpan metadata ke backend
      const newArea = {
        name,
        coordinates,
        securityLevel,
        commitment,
        owner: userAddress,
        areaIndex,
        publishedOnChain: true,
        revealed: false,
      };

      const res = await axios.post(`${backendUrl}/areas/store`, newArea);
      const savedArea = { ...res.data.area, visible: true };

      setAreas([...areas, savedArea]);
      setCoordinates([]);
      alert("✅ Area committed and saved!");
    } catch (err) {
      console.error("❌ Error committing area:", err);
      alert("Failed to commit area.");
    }
  }

  // ✅ REVEAL (tampilkan area di blockchain)
  async function handleReveal() {
    if (!secret || !contract) return alert("Please enter secret and connect wallet!");

    try {
      const commitment = ethers.keccak256(ethers.toUtf8Bytes(secret));
      console.log("🔍 Searching commitment:", commitment);

      const count = await contract.getAreaCount(userAddress);
      console.log("Total areas:", count.toString());

      let foundIndex = -1;

      for (let i = 0; i < Number(count); i++) {
        const area = await contract.getArea(userAddress, i);
        const areaCommit = Array.isArray(area) ? area[0] : area.commitment;

        if (areaCommit?.toLowerCase() === commitment.toLowerCase()) {
          foundIndex = i;
          console.log(`✅ Match found at index ${i}`);
          break;
        }
      }

      if (foundIndex === -1) {
        alert("❌ Area not found with this secret in blockchain!");
        return;
      }

      // 🔗 (Opsional) Reveal di blockchain
      // const tx = await contract.revealArea(foundIndex, commitment);
      // await tx.wait();
      // console.log("🔓 Reveal confirmed on chain");

      // ✅ Update backend
      const target = areas.find((a) => a.commitment === commitment);
      if (target?._id) {
        await axios.patch(`${backendUrl}/areas/reveal/${target.commitment}`, { revealed: true });
      }

      // ✅ Update tampilan
      const updated = areas.map((a) =>
        a.commitment === commitment ? { ...a, visible: false, revealed: true } : a
      );
      setAreas(updated);

      alert("🔓 Area revealed!");
    } catch (err) {
      console.error("❌ Reveal error:", err);
      alert("Reveal failed. Check hash or blockchain state.");
    }
  }

  // ✅ UNREVEAL (sembunyikan kembali area)
  async function handleUnreveal() {
    if (!secret || !contract) return alert("Please enter secret and connect wallet!");

    try {
      const commitment = ethers.keccak256(ethers.toUtf8Bytes(secret));
      console.log("🔍 Searching commitment for unreveal:", commitment);

      const target = areas.find((a) => a.commitment === commitment);
      if (!target?._id) {
        alert("❌ Area not found in local list!");
        return;
      }

      // 🔗 Update backend
      await axios.patch(`${backendUrl}/areas/reveal/${target.commitment}`, { revealed: false });

      // ✅ Update tampilan
      const updated = areas.map((a) =>
        a.commitment === commitment ? { ...a, visible: true, revealed: false } : a
      );
      setAreas(updated);

      alert("🙈 Area hidden (unrevealed)!");
    } catch (err) {
      console.error("❌ Unreveal error:", err);
      alert("Failed to unreveal area.");
    }
  }

  // 🧱 UI render
  return (
    <div className="space-y-3">
      <div className="flex flex-col space-y-2">
        <input
          className="border p-2 rounded bg-[#1c1c1c] text-white"
          placeholder="Enter secret key"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
        />

        <select
          className="border p-2 rounded bg-[#1c1c1c] text-white"
          value={securityLevel}
          onChange={(e) => setSecurityLevel(e.target.value)}
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <div className="flex space-x-2 flex-wrap">
          <button
            className={`px-4 py-2 rounded ${isDrawing ? "bg-blue-600" : "bg-gray-600"} text-white`}
            onClick={() => setIsDrawing(!isDrawing)}
          >
            {isDrawing ? "🖋️ Drawing Mode" : "🖐️ Non-Commit Mode"}
          </button>

          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSave}>
            Commit Area
          </button>

          {areas.some((a) => a.revealed) ? (
            
            <button className="bg-yellow-600 text-white px-4 py-2 rounded" onClick={handleUnreveal}>
              Hide (Unreveal)
            </button>
          ) : (
            <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleReveal}>
              Reveal
            </button>
          )}
        </div>
      </div>

      <div className="h-[500px] w-full rounded-xl overflow-hidden border border-gray-700">
        <MapContainer
          center={[-6.2, 106.8]}
          zoom={13}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {isDrawing && <MapEventsHandler setCoordinates={setCoordinates} />}

          {areas.map((area) => (
            <Polygon
              key={area._id || area.name}
              positions={area.coordinates}
              pathOptions={{
                color: area.visible ? "blue" : "red",
                fillOpacity: area.visible ? getOpacity(area.securityLevel) : 0,
              }}
            />
          ))}

          {coordinates.length > 0 && isDrawing && <Polygon positions={coordinates} color="orange" />}
        </MapContainer>
      </div>
    </div>
  );
}
