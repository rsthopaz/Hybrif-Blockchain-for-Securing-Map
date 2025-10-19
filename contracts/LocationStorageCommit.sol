// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract LocationStorageCommit {
    struct LocationCommit {
        address owner;
        bytes32 commit;
        bool revealed;
        string latitude;
        string longitude;
    }

    mapping(address => LocationCommit) public commits;

    event LocationCommitted(address indexed owner, bytes32 commit);
    event LocationRevealed(address indexed owner, string latitude, string longitude);

    // --- Step 1: commit hashed lokasi
    function commitLocation(bytes32 _commit) public {
        commits[msg.sender] = LocationCommit({
            owner: msg.sender,
            commit: _commit,
            revealed: false,
            latitude: "",
            longitude: ""
        });
        emit LocationCommitted(msg.sender, _commit);
    }

    // --- Step 2: reveal lokasi jika hash cocok
    function revealLocation(
        string memory _secret,
        string memory _latitude,
        string memory _longitude
    ) public {
        LocationCommit storage loc = commits[msg.sender];
        require(!loc.revealed, "Already revealed");

        bytes32 computedHash = keccak256(abi.encodePacked(_secret, _latitude, _longitude));
        require(computedHash == loc.commit, "Invalid secret or coordinates");

        loc.revealed = true;
        loc.latitude = _latitude;
        loc.longitude = _longitude;

        emit LocationRevealed(msg.sender, _latitude, _longitude);
    }

    // --- Get data jika sudah reveal
    function getLocation(address user) public view returns (string memory, string memory) {
        LocationCommit storage loc = commits[user];
        require(loc.revealed, "Location not revealed yet");
        return (loc.latitude, loc.longitude);
    }
}