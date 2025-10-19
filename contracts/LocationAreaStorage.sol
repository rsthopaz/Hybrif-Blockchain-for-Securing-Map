// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract LocationAreaStorage {
    struct AreaCommit {
        address owner;
        bytes32 commitment;
        bool revealed;
        string[4] latitudes;
        string[4] longitudes;
        string securityLevel;
    }

    mapping(address => AreaCommit[]) public userAreas;

    event AreaCommitted(address indexed owner, bytes32 commitment, uint256 index, string securityLevel);
    event AreaRevealed(address indexed owner, uint256 index);

    function commitArea(bytes32 _commitment, string calldata _securityLevel) external {
        uint256 idx = userAreas[msg.sender].length;
        AreaCommit memory newArea = AreaCommit({
            owner: msg.sender,
            commitment: _commitment,
            revealed: false,
            latitudes: ["", "", "", ""],
            longitudes: ["", "", "", ""],
            securityLevel: _securityLevel
        });
        userAreas[msg.sender].push(newArea);
        emit AreaCommitted(msg.sender, _commitment, idx, _securityLevel);
    }

    function revealArea(
        uint256 areaIndex,
        string[4] calldata _latitudes,
        string[4] calldata _longitudes,
        string calldata _secret
    ) external {
        require(areaIndex < userAreas[msg.sender].length, "Invalid index");
        AreaCommit storage area = userAreas[msg.sender][areaIndex];
        require(!area.revealed, "Already revealed");

        bytes32 check = keccak256(abi.encode(_secret, _latitudes, _longitudes));
        require(check == area.commitment, "Invalid secret or coordinates");

        area.revealed = true;
        for (uint256 i = 0; i < 4; i++) {
            area.latitudes[i] = _latitudes[i];
            area.longitudes[i] = _longitudes[i];
        }

        emit AreaRevealed(msg.sender, areaIndex);
    }

    function getArea(address user, uint256 index)
        external
        view
        returns (
            address owner,
            bytes32 commitment,
            bool revealed,
            string[4] memory latitudes,
            string[4] memory longitudes,
            string memory securityLevel
        )
    {
        require(index < userAreas[user].length, "Invalid index");
        AreaCommit storage a = userAreas[user][index];
        return (a.owner, a.commitment, a.revealed, a.latitudes, a.longitudes, a.securityLevel);
    }

    function getAreaCount(address user) external view returns (uint256) {
        return userAreas[user].length;
    }
}