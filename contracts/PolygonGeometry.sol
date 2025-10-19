// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract PolygonGeometry {
    bytes32 public merkleRoot;
    uint256 public areaTimes2; // hasil shoelace (dari prepared.json)

    constructor(bytes32 _root, uint256 _areaTimes2) {
        merkleRoot = _root;
        areaTimes2 = _areaTimes2;
    }

    /// @notice Update Merkle root (opsional, bisa dibuat onlyOwner)
    function setMerkleRoot(bytes32 _root) external {
        merkleRoot = _root;
    }

    /// @notice Update area (opsional, bisa dibuat onlyOwner)
    function setArea(uint256 _areaTimes2) external {
        areaTimes2 = _areaTimes2;
    }

    /// @notice Verifikasi apakah koordinat (x,y) adalah vertex sah
    /// @param x koordinat X integer (sesuai scale di prepared.json)
    /// @param y koordinat Y integer (sesuai scale di prepared.json)
    /// @param proof array bukti Merkle
    function verifyVertex(
        int256 x,
        int256 y,
        bytes32[] calldata proof
    ) external view returns (bool) {
        // encoding sama dengan di prepareGeometry.js (solidityPacked(["int256","int256"], [x,y]))
        bytes32 leaf = keccak256(abi.encodePacked(x, y));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }
}
