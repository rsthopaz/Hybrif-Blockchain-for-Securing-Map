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

contract GeoCertificate is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Coordinate {
        int256 lat;
        int256 lng;
    }

    mapping(uint256 => Coordinate) public tokenCoordinates;

    constructor() ERC721("GeoCertificate", "GEO") {}

    function mintWithCoordinate(int256 lat, int256 lng) public returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);
        tokenCoordinates[newItemId] = Coordinate(lat, lng);

        return newItemId;
    }

    function getCoordinate(uint256 tokenId) public view returns (int256, int256) {
        require(_exists(tokenId), "Token does not exist");
        Coordinate memory coord = tokenCoordinates[tokenId];
        return (coord.lat, coord.lng);
    }
}

// contract Certificate is ERC721 {
//     using Counters for Counters.Counter;

//     Counters.Counter private _tokenIds;
//     mapping(address => uint8) private userToTokenAmount;

//       // store commitment + areaTimes2 per tokenId
//     mapping(uint256 => bytes32) public tokenMerkleRoot;
//     mapping(uint256 => uint256) public tokenAreaTimes2;

//     event MintWithCommitment(address indexed owner, uint256 indexed tokenId, bytes32 merkleRoot, uint256 areaTimes2);


//     constructor() ERC721("Certificate", "AKTA") {
//         _tokenIds.increment(); // Start token IDs from 1
//     }

//     function safeMintWithCommitment(bytes32 merkleRoot, uint256 areaTimes2) public {
//         require(userToTokenAmount[msg.sender] < 5, "User already has 5 NFTs");

//         uint256 tokenID = _tokenIds.current();
//         _safeMint(msg.sender, tokenID);
//         userToTokenAmount[msg.sender]++;

//         tokenMerkleRoot[tokenID] = merkleRoot;
//         tokenAreaTimes2[tokenID] = areaTimes2;

//         emit MintWithCommitment(msg.sender, tokenID, merkleRoot, areaTimes2);
        
//         _tokenIds.increment();
//     }

//     function _baseURI() internal pure override returns (string memory) {
//         return "ipfs://bafkreicljjzxq3n2nk7sx6ml7c44vmzolkleiqrtxg4k2tcts2fibzyicu";
//     }

//     function tokenURI(uint256 tokenId) public view override returns (string memory) {
//     require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

//     // Langsung return 1 file JSON di IPFS
//     return "ipfs://bafkreicljjzxq3n2nk7sx6ml7c44vmzolkleiqrtxg4k2tcts2fibzyicu";
//     }
// }
