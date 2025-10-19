// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AreaCommit {
    struct Area {
        bytes32 commitment;
        string name;
        bool revealed;
        address owner;
    }

    mapping(address => Area[]) public userAreas;

    event AreaCommitted(address indexed owner, uint256 indexed index, bytes32 commitment, string name);
    event AreaRevealed(address indexed owner, uint256 indexed index, string secret);

    function commitArea(bytes32 _commitment, string memory _name) external {
        Area memory newArea = Area({
            commitment: _commitment,
            name: _name,
            revealed: false,
            owner: msg.sender
        });

        userAreas[msg.sender].push(newArea);
        emit AreaCommitted(msg.sender, userAreas[msg.sender].length - 1, _commitment, _name);
    }

    function revealArea(uint256 _index, string memory _secret) external {
        require(_index < userAreas[msg.sender].length, "Invalid index");
        Area storage area = userAreas[msg.sender][_index];

        require(!area.revealed, "Already revealed");
        require(area.owner == msg.sender, "Not your area");
        require(area.commitment == keccak256(abi.encodePacked(_secret)), "Invalid secret");

        area.revealed = true;
        emit AreaRevealed(msg.sender, _index, _secret);
    }

    function getAreaCount(address _user) external view returns (uint256) {
        return userAreas[_user].length;
    }

    function getArea(address _user, uint256 _index)
        external
        view
        returns (bytes32 commitment, string memory name, bool revealed)
    {
        require(_index < userAreas[_user].length, "Invalid index");
        Area memory a = userAreas[_user][_index];
        return (a.commitment, a.name, a.revealed);
    }
}
