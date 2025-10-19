// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// contract Certificate is ERC721URIStorage {
//     using Counters for Counters.Counter;
//     Counters.Counter private _tokenIds;
//     mapping(uint256 => string) public tokenLocation;


//     constructor() ERC721("Certificate", "AKTA") {}

//     // function mint(address to, string memory tokenURI) public returns (uint256) {
//     //     _tokenIds.increment();
//     //     uint256 newItemId = _tokenIds.current();
//     //     _mint(to, newItemId);
//     //     _setTokenURI(newItemId, tokenURI);
//     //     return newItemId;
//     // }
//     function mintWithLocation(address to, string memory tokenURI, string memory location) public returns (uint256) {
//     _tokenIds.increment();
//     uint256 newItemId = _tokenIds.current();
//     _mint(to, newItemId);
//     _setTokenURI(newItemId, tokenURI);
//     tokenLocation[newItemId] = location; // e.g., "lat,lng"
//     return newItemId;
// }

// }

contract LocationStorage {
    struct LocationData {
        address owner;
        string latitude;
        string longitude;
        uint256 timestamp;
    }

    LocationData[] private locations;

    event LocationSaved(address indexed owner, string latitude, string longitude, uint256 timestamp);

    function saveLocation(string memory _latitude, string memory _longitude) public {
        locations.push(LocationData(msg.sender, _latitude, _longitude, block.timestamp));
        emit LocationSaved(msg.sender, _latitude, _longitude, block.timestamp);
    }

    function getLocation(uint256 index) public view returns (address, string memory, string memory, uint256) {
        require(index < locations.length, "Invalid index");
        LocationData memory loc = locations[index];
        return (loc.owner, loc.latitude, loc.longitude, loc.timestamp);
    }

    function getAllLocations() public view returns (LocationData[] memory) {
        return locations;
    }

    function getTotalLocations() public view returns (uint256) {
        return locations.length;
    }
}