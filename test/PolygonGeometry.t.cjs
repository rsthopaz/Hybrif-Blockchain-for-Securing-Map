const { expect } = require("chai");
const fs = require("fs");

describe("PolygonGeometry", function () {
  it("should verify prepared vertices correctly", async function () {
    const [deployer] = await ethers.getSigners();

    // Load prepared data
    const prepared = JSON.parse(fs.readFileSync("prepared.json", "utf8"));

    // Deploy fresh contract for testing
    const PolygonGeometry = await ethers.getContractFactory("PolygonGeometry");
    const contract = await PolygonGeometry.deploy(
      prepared.merkleRoot,
      prepared.areaTimes2
    );
    await contract.waitForDeployment();

    // Test all vertices
    for (let i = 0; i < prepared.intCoords.length; i++) {
      const [x, y] = prepared.intCoords[i];
      const proof = prepared.proofs[i];

      const ok = await contract.verifyVertex(x, y, proof);
      expect(ok).to.equal(true);
    }
  });
});
