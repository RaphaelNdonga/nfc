//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFC is ERC721URIStorage {
    uint256 public counter = 1;

    constructor(
        string memory name,
        string memory symbol,
        address[] memory owners,
        string[] memory data
    ) ERC721(name, symbol) {
        for (uint256 i = 0; i < data.length; i++) {
            mint(owners[i], counter, data[i]);
        }
    }

    function mint(
        address _to,
        uint256 _tokenId,
        string memory data
    ) internal {
        _safeMint(_to, _tokenId);
        _setTokenURI(counter, data);
        counter++;
    }
}
