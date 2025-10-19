// "use client";
// import { useState } from "react";
// import axios from "axios";

// export default function Home() {
//   const [form, setForm] = useState({
//     name: "",
//     description: "",
//     image: "",
//     attributes: []
//   });

//   const handleMint = async () => {
//     try {
//       const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/mint`, form);
//       alert("Minted! TX Hash: " + res.data.txHash);
//     } catch (err) {
//       alert("Error: " + err.message);
//     }
//   };

//   return (
//     <div className="p-10">
//       <h1 className="text-xl font-bold">Mint Certificate NFT</h1>
//       <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
//       <input placeholder="Description" onChange={e => setForm({ ...form, description: e.target.value })} />
//       <input placeholder="Image URL" onChange={e => setForm({ ...form, image: e.target.value })} />
//       <button onClick={handleMint}>Mint NFT</button>
//     </div>
//   );
// }
// "use client";

// import { useState } from "react";
// import { ethers } from "ethers";
// import contractJson from "../../artifacts/contracts/Certificate.sol/Certificate.json";

// export default function Home() {
//   const [file, setFile] = useState(null);
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [metadataName, setMetadataName] = useState(""); 
//   const [attributes, setAttributes] = useState([{ trait_type: "", value: "" }]);
//   const [status, setStatus] = useState("");
//   const [metadata, setMetadata] = useState(null);
  

//   const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
//   const backendUrl =
//     process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

//   const updateAttribute = (i, key, value) => {
//     const copy = [...attributes];
//     copy[i][key] = value;
//     setAttributes(copy);
//   };

//   const addAttribute = () => {
//     setAttributes([...attributes, { trait_type: "", value: "" }]);
//   };

//   const removeAttribute = (i) => {
//     setAttributes(attributes.filter((_, idx) => idx !== i));
//   };

//   const handleUpload = async () => {
//     if (!file) return alert("Pilih file dulu!");
//     if (!metadataName) return alert("Isi nama metadata (misal: Contoh)");

//     const formData = new FormData();
//     formData.append("image", file);
//     formData.append("name", name);
//     formData.append("description", description);
//     formData.append("attributes", JSON.stringify(attributes));
//     formData.append("metadataName", metadataName);

//     try {
//       setStatus("Uploading...");
//       const res = await fetch(`${backendUrl}/upload`, {
//         method: "POST",
//         body: formData,
//       });
//       const data = await res.json();
//       setMetadata(data);
//       setStatus(
//         `✅ Upload success! Metadata (${data.metadata_name}) siap diminting.`
//       );
//     } catch (err) {
//       console.error(err);
//       setStatus("Upload failed: " + err.message);
//     }
//   };

// const handleMint = async () => {
//   if (!window.ethereum) return alert("Install MetaMask!");
//   if (!metadata) return alert("Upload dulu metadata!");

//   try {
//     let provider = new ethers.BrowserProvider(window.ethereum);

//     // 🔥 Pastikan wallet connect
//     await provider.send("eth_requestAccounts", []);

//     // 🔥 Cek jaringan
//     const network = await provider.getNetwork();
//     if (network.chainId !== 11155111n) { // Sepolia chainId
//       try {
//         await window.ethereum.request({
//           method: "wallet_switchEthereumChain",
//           params: [{ chainId: "0xaa36a7" }], // Sepolia
//         });
//         setStatus("✅ Berhasil switch ke Sepolia, reload provider...");

//         provider = new ethers.BrowserProvider(window.ethereum);
//         await provider.send("eth_requestAccounts", []);
//       } catch (switchError) {
//         if (switchError.code === 4902) {
//           await window.ethereum.request({
//             method: "wallet_addEthereumChain",
//             params: [
//               {
//                 chainId: "0xaa36a7",
//                 chainName: "Sepolia Test Network",
//                 rpcUrls: ["https://sepolia.infura.io/v3/"], // bisa pakai Alchemy juga
//                 nativeCurrency: {
//                   name: "SepoliaETH",
//                   symbol: "ETH",
//                   decimals: 18,
//                 },
//                 blockExplorerUrls: ["https://sepolia.etherscan.io"],
//               },
//             ],
//           });
//         } else {
//           throw switchError;
//         }
//       }
//     }

//     // 🆕 ambil signer setelah switch
//     const signer = await provider.getSigner();
//     const contract = new ethers.Contract(contractAddress, contractJson.abi, signer);

//     // ⚡ convert ipfs:// ke gateway supaya marketplace bisa baca
//     let uri = metadata.metadata_uri;
//     if (uri.startsWith("ipfs://")) {
//       uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
//     }

//     setStatus("Minting...");
//     const tx = await contract.mint(await signer.getAddress(), uri);
//     const receipt = await tx.wait();

//     setStatus(`✅ Minted! TX Hash: https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
//   } catch (err) {
//     console.error(err);
//     setStatus("Mint failed: " + err.message);
//   }
// };



//   return (
//     <div style={{ padding: 12 }}>
//       <h1>Upload Sertifikat NFT</h1>

//       <div>
//         <input type="file" onChange={(e) => setFile(e.target.files[0])} />
//       </div>

//       <div>
//         <input
//           placeholder="Nama NFT"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />
//       </div>

//       <div>
//         <textarea
//           placeholder="Deskripsi NFT"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//         />
//       </div>

//       <div>
//         <input
//           placeholder="Nama file metadata (tanpa .json)"
//           value={metadataName}
//           onChange={(e) => setMetadataName(e.target.value)}
//         />
//       </div>

//       <div>
//         <h3>Attributes</h3>
//         {attributes.map((attr, i) => (
//           <div key={i} style={{ display: "flex", gap: 4 }}>
//             <input
//               placeholder="trait_type"
//               value={attr.trait_type}
//               onChange={(e) => updateAttribute(i, "trait_type", e.target.value)}
//             />
//             <input
//               placeholder="value"
//               value={attr.value}
//               onChange={(e) => updateAttribute(i, "value", e.target.value)}
//             />
//             <button onClick={() => removeAttribute(i)}>Remove</button>
//           </div>
//         ))}
//         <button onClick={addAttribute}>Add attribute</button>
//       </div>

//       <button onClick={handleUpload} style={{ marginTop: 8 }}>
//         Upload ke IPFS
//       </button>

//       <p>{status}</p>

//       {metadata && (
//         <button onClick={handleMint}>Mint NFT ke Sepolia</button>
//       )}
//     </div>
//   );
// }

// "use client";
// import { useState } from "react";
// import { ethers } from "ethers";
// import contractJson from "../../artifacts/contracts/Certificate.sol/Certificate.json";

// export default function Home() {
//   const [thumbnail, setThumbnail] = useState<File | null>(null);
//   const [images, setImages] = useState<File[]>([]);
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [metadataName, setMetadataName] = useState("");
//   const [attributes, setAttributes] = useState([{ trait_type: "", value: "" }]);
//   const [status, setStatus] = useState("");
//   const [metadata, setMetadata] = useState<any>(null);
//   const [contractAddress, setContractAddress] = useState<string | null>(null);
//   const [isDeploying, setIsDeploying] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [isMinting, setIsMinting] = useState(false);

//   const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

//   /* ===========================================================
//      🚀 Deploy Smart Contract
//      =========================================================== */
//   const getContract = async () => {
//     setIsDeploying(true);
//     setStatus("🚀 Deploying contract...");
//     try {
//       const res = await fetch(`${backendUrl}/deploy`);
//       const data = await res.json();
//       if (!data.address) throw new Error("No contract address returned");
//       setContractAddress(data.address);
//       setStatus(`✅ Contract deployed: ${data.address}`);
//     } catch (err: any) {
//       setStatus("❌ Deploy failed: " + err.message);
//     } finally {
//       setIsDeploying(false);
//     }
//   };

//   /* ===========================================================
//      🎨 Attributes
//      =========================================================== */
//   const updateAttribute = (i: number, key: string, value: string) => {
//     const copy = [...attributes];
//     copy[i][key] = value;
//     setAttributes(copy);
//   };
//   const addAttribute = () => setAttributes([...attributes, { trait_type: "", value: "" }]);
//   const removeAttribute = (i: number) => setAttributes(attributes.filter((_, idx) => idx !== i));

//   /* ===========================================================
//      📤 Upload ke Backend (Pinata via Backend)
//      =========================================================== */
//   const handleUpload = async () => {
//     if (!thumbnail && images.length === 0) {
//       return alert("Upload minimal 1 file (thumbnail atau gambar tambahan)");
//     }
//     if (!metadataName) return alert("Isi nama metadata!");

//     const formData = new FormData();
//     if (thumbnail) formData.append("thumbnail", thumbnail);
//     images.forEach((file) => formData.append("images", file));
//     formData.append("name", name);
//     formData.append("description", description);
//     formData.append("attributes", JSON.stringify(attributes));
//     formData.append("metadataName", metadataName);

//     try {
//       setIsUploading(true);
//       setStatus("📤 Uploading to IPFS via backend...");
//       const res = await fetch(`${backendUrl}/upload`, {
//         method: "POST",
//         body: formData,
//       });
//       const data = await res.json();
//       if (!data.success) throw new Error(data.error || "Upload failed");

//       setMetadata(data);
//       setStatus(`✅ Upload success! Metadata URI: ${data.metadata_uri}`);
//     } catch (err: any) {
//       setStatus("❌ Upload failed: " + err.message);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   /* ===========================================================
//      ✨ Mint NFT
//      =========================================================== */
//   const handleMint = async () => {
//     if (!window.ethereum) return alert("Install MetaMask!");
//     if (!metadata) return alert("Upload metadata dulu!");
//     if (!contractAddress) return alert("Deploy contract dulu!");

//     try {
//       setIsMinting(true);
//       setStatus("⛏️ Minting NFT...");

//       let provider = new ethers.BrowserProvider(window.ethereum);
//       await provider.send("eth_requestAccounts", []);

//       const network = await provider.getNetwork();
//       if (network.chainId !== 11155111n) {
//         await window.ethereum.request({
//           method: "wallet_switchEthereumChain",
//           params: [{ chainId: "0xaa36a7" }], // Sepolia
//         });
//         provider = new ethers.BrowserProvider(window.ethereum);
//       }

//       const signer = await provider.getSigner();
//       const contract = new ethers.Contract(contractAddress, contractJson.abi, signer);
//       const uri = metadata.metadata_uri;

//       const tx = await contract.mint(await signer.getAddress(), uri);
//       setStatus(`📤 TX sent: https://sepolia.etherscan.io/tx/${tx.hash}`);
//       await tx.wait();
//       setStatus(`✅ Minted! TX: https://sepolia.etherscan.io/tx/${tx.hash}`);
//     } catch (err: any) {
//       setStatus("❌ Mint failed: " + err.message);
//     } finally {
//       setIsMinting(false);
//     }
//   };

//   /* ===========================================================
//      🧱 UI
//      =========================================================== */
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
//       <div className="bg-white shadow-xl rounded-2xl w-full max-w-2xl p-8 transition-all">
//         <h1 className="text-3xl font-bold mb-2 text-gray-800">NFT Multi-Image Uploader</h1>
//         <p className="text-gray-500 mb-6">
//           Upload thumbnail + multiple images to Pinata/IPFS, deploy smart contract, and mint NFT 🎨
//         </p>

//         {/* Deploy Buttons */}
//         <div className="flex flex-wrap gap-3 mb-6">
//           <button
//             onClick={getContract}
//             disabled={isDeploying}
//             className={`px-4 py-2 rounded-lg text-white font-medium transition-all ${
//               isDeploying
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90"
//             }`}
//           >
//             {isDeploying ? (
//               <span className="flex items-center gap-2">
//                 <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
//                 Deploying...
//               </span>
//             ) : (
//               "🚀 Deploy / Get Contract"
//             )}
//           </button>

//           {contractAddress && (
//             <button
//               onClick={async () => {
//                 setStatus("🔍 Verifying contract...");
//                 try {
//                   const res = await fetch(`${backendUrl}/verify`, {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ address: contractAddress }),
//                   });
//                   const data = await res.json();
//                   setStatus(
//                     data.success
//                       ? "✅ Contract verified!"
//                       : "❌ Verification failed: " + data.error
//                   );
//                 } catch (err: any) {
//                   setStatus("❌ Verification error: " + err.message);
//                 }
//               }}
//               className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200"
//             >
//               Verify Contract
//             </button>
//           )}
//         </div>

//         {contractAddress && (
//           <p className="text-sm text-gray-600 mb-4 break-all">
//             Contract: <span className="font-mono">{contractAddress}</span>
//           </p>
//         )}

//         {/* Upload Form */}
//         <div className="space-y-4">
//           <label className="block text-gray-700 font-medium">Thumbnail (utama)</label>
//           <input
//             type="file"
//             onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
//             className="block w-full border border-gray-300 text-gray-800 rounded-lg px-3 py-2"
//           />

//           <label className="block text-gray-700 font-medium">Extra Images</label>
//           <input
//             type="file"
//             multiple
//             onChange={(e) => setImages(Array.from(e.target.files || []))}
//             className="block w-full border border-gray-300 text-gray-800 rounded-lg px-3 py-2"
//           />

//           <input
//             placeholder="NFT Name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="block w-full border border-gray-300 text-gray-800 rounded-lg px-3 py-2"
//           />
//           <textarea
//             placeholder="NFT Description"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             className="block w-full border border-gray-300 text-gray-800 rounded-lg px-3 py-2"
//           />
//           <input
//             placeholder="Metadata file name (without .json)"
//             value={metadataName}
//             onChange={(e) => setMetadataName(e.target.value)}
//             className="block w-full border border-gray-300 text-gray-800 rounded-lg px-3 py-2"
//           />
//         </div>

//         {/* Attributes */}
//         <h3 className="mt-6 mb-2 font-medium text-gray-800">Attributes</h3>
//         <div className="space-y-2">
//           {attributes.map((attr, i) => (
//             <div key={i} className="flex gap-2">
//               <input
//                 placeholder="trait_type"
//                 value={attr.trait_type}
//                 onChange={(e) => updateAttribute(i, "trait_type", e.target.value)}
//                 className="flex-1 border border-gray-300 text-gray-800 rounded-lg px-3 py-2"
//               />
//               <input
//                 placeholder="value"
//                 value={attr.value}
//                 onChange={(e) => updateAttribute(i, "value", e.target.value)}
//                 className="flex-1 border border-gray-300 text-gray-800 rounded-lg px-3 py-2"
//               />
//               <button
//                 onClick={() => removeAttribute(i)}
//                 className="px-3 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
//               >
//                 ✕
//               </button>
//             </div>
//           ))}
//           <button
//             onClick={addAttribute}
//             className="mt-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
//           >
//             + Add attribute
//           </button>
//         </div>

//         {/* Upload Button */}
//         <button
//           onClick={handleUpload}
//           disabled={isUploading}
//           className={`mt-6 w-full px-4 py-3 rounded-lg text-white font-medium transition-all ${
//             isUploading
//               ? "bg-gray-400 cursor-not-allowed"
//               : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90"
//           }`}
//         >
//           {isUploading ? (
//             <span className="flex items-center justify-center gap-2">
//               <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
//               Uploading...
//             </span>
//           ) : (
//             "📤 Upload to Pinata (via backend)"
//           )}
//         </button>

//         {/* Status */}
//         {status && <p className="mt-4 text-sm text-gray-700 bg-gray-100 p-3 rounded-lg">{status}</p>}

//         {/* Mint Button */}
//         {metadata && (
//           <button
//             onClick={handleMint}
//             disabled={isMinting}
//             className={`mt-4 w-full px-4 py-3 rounded-lg text-white font-medium transition-all ${
//               isMinting ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
//             }`}
//           >
//             {isMinting ? (
//               <span className="flex items-center justify-center gap-2">
//                 <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
//                 Minting...
//               </span>
//             ) : (
//               "✨ Mint NFT to Sepolia"
//             )}
//           </button>
//         )}

//         {/* Partner Logos */}
//         <div className="mt-10 border-t pt-6 flex flex-col items-center">
//           <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
//             <img src="/logos/typescript-seeklogo.svg" className="h-7" />
//             <img src="/logos/ethereum-eth-seeklogo.svg" className="h-7" />
//             <img src="/logos/next-js-seeklogo.svg" className="h-7" />
//             <img src="/logos/solidity-seeklogo.svg" className="h-7" />
//             <img src="/logos/ipfs-seeklogo.png" className="h-7" />
//             <img src="/logos/metamask-seeklogo.svg" className="h-7" />
//             <img src="/logos/ethers.svg" className="h-7" />
//             <img src="/logos/rarible-seeklogo.svg" className="h-7" />
//             <img src="/logos/pinata-nft-seeklogo.svg" className="h-7" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import dynamic from "next/dynamic";
// import { useEffect, useState } from "react";
// import { ethers } from "ethers";
// import contractJson from "../../artifacts/contracts/LocationAreaStorage.sol/LocationAreaStorage.json";

// const Map = dynamic(() => import("./mapComponent"), { ssr: false });

// export default function HomePage() {
//   const [selectedCoords, setSelectedCoords] = useState<[number, number][]>([]);
//   const [secret, setSecret] = useState("");
//   const [contract, setContract] = useState<any>(null);

//   useEffect(() => {
//     const initContract = async () => {
//       if (typeof window.ethereum !== "undefined") {
//         const provider = new ethers.BrowserProvider(window.ethereum);
//         const signer = await provider.getSigner();
//         const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
//         const instance = new ethers.Contract(
//           contractAddress,
//           contractJson.abi,
//           signer
//         );
//         setContract(instance);
//       }
//     };
//     initContract();
//   }, []);

//   const commitArea = async () => {
//     if (!contract || selectedCoords.length !== 4 || !secret) {
//       alert("Pilih 4 titik dan masukkan secret!");
//       return;
//     }
//     try {
//       const latitudes = selectedCoords.map((p) => Math.round(p[0] * 1e6));
//       const longitudes = selectedCoords.map((p) => Math.round(p[1] * 1e6));

//       const tx = await contract.commitArea(latitudes, longitudes, secret);
//       await tx.wait();
//       alert("✅ Area berhasil di-commit!");
//     } catch (err) {
//       console.error(err);
//       alert("❌ Gagal commit area");
//     }
//   };

//   const revealArea = async () => {
//     if (!contract || !secret) {
//       alert("Masukkan secret code untuk reveal!");
//       return;
//     }
//     try {
//       const [lats, longs] = await contract.revealArea(secret);
//       const coords = lats.map((lat: any, i: number) => [
//         Number(lat) / 1e6,
//         Number(longs[i]) / 1e6,
//       ]);
//       setSelectedCoords(coords);
//       alert("🌍 Area berhasil direveal!");
//     } catch (err) {
//       console.error(err);
//       alert("Secret salah atau area belum ada.");
//     }
//   };

//   return (
//     <div className="flex flex-col items-center gap-4 p-4">
//       <h1 className="text-2xl font-bold">🗺️ Secure Area Map (4 titik)</h1>
//       <Map selectedCoords={selectedCoords} setSelectedCoords={setSelectedCoords} />
//       <div className="flex flex-col gap-2 mt-4">
//         <input
//           type="text"
//           placeholder="Secret code"
//           value={secret}
//           onChange={(e) => setSecret(e.target.value)}
//           className="border p-2 rounded"
//         />
//         <button onClick={commitArea} className="bg-green-600 text-white p-2 rounded">
//           🔒 Commit Area
//         </button>
//         <button onClick={revealArea} className="bg-blue-600 text-white p-2 rounded">
//           🌍 Reveal Area
//         </button>
//       </div>
//     </div>
//   );
// }
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Import MapComponent secara dinamis agar tidak dirender di server
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <div className="text-gray-500">🗺️ Loading map...</div>,
});

export default function Page() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string>("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const ABI = [
    "function commitArea(bytes32,string) external",
    "function revealArea(uint256,string) external",
    "function getArea(address,uint256) view returns (bytes32,string,bool)",
    "function getAreaCount(address) view returns (uint256)",
  ];

  // 🔗 Connect ke MetaMask
  async function connectWallet() {
    if (!(window as any).ethereum) {
      alert("Install MetaMask first!");
      return;
    }

    const p = new ethers.BrowserProvider((window as any).ethereum);
    await p.send("eth_requestAccounts", []);
    const s = await p.getSigner();
    const addr = await s.getAddress();

    const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, s);

    setProvider(p);
    setSigner(s);
    setAddress(addr);
    setContract(c);
  }

  // ⚙️ Commit ke blockchain (kirim hash secret)
  async function commitToBlockchain(contract: ethers.Contract, secret: string, name: string) {
    const hash = ethers.keccak256(ethers.toUtf8Bytes(secret));
    const tx = await contract.commitArea(hash, name);
    await tx.wait();
    return hash;
  }

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <main className="p-6 min-h-screen bg-[#0f0f0f] text-white space-y-4">
      <h1 className="text-2xl font-bold flex items-center space-x-2">
        <span>🗺️</span>
        <span>Area Commit & Reveal</span>
      </h1>
      {address && (
        <p className="text-sm text-gray-400">
          Connected wallet: <span className="font-mono">{address}</span>
        </p>
      )}

      <MapComponent
        backendUrl={BACKEND_URL}
        contract={contract}
        signer={signer}
        userAddress={address}
        commitToBlockchain={commitToBlockchain}
      />
    </main>
  );
}

