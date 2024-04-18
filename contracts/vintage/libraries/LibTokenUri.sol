// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../libraries/VestingNFTSVG.sol";
import "../../libraries/NFTDescriptor.sol";
import "hardhat/console.sol";

library LibTokenUri {
    //         uint256[0] remaining_,
    //         uint256[1] total_,
    //         uint256[2] interval,
    //         uint256[3] cliffTime,
    //         uint256[4] endTime
    function svg(
        string memory symbol,
        address tokenAddr,
        uint256[5] memory uint256Params
    ) internal view returns (string memory output) {
        return VestingNFTSVG.generateSVG(symbol, tokenAddr, uint256Params);
    }

    //    uint256[0] interval,
    //         uint256[1] remaining_,
    //         uint256[2] total_,
    //         uint256[3] cliffTime,
    //         uint256[4] endTime
    function tokenURI(
        string memory description,
        string memory symbol,
        address tokenAddr,
        uint256[5] memory uint256Params
    ) internal view returns (string memory) {
        string memory _svg = svg(
            symbol,
            tokenAddr,
            [
                uint256Params[1],
                uint256Params[2],
                uint256Params[0],
                uint256Params[3],
                uint256Params[4]
            ]
        );
        string memory image = string(
            abi.encodePacked(Base64.encode(bytes(_svg)))
        );
        string memory name = string(abi.encodePacked(symbol, " Vesting"));

        string memory attributes = NFTDescriptor.generateNFTAttributes(
            symbol,
            tokenAddr,
            uint256Params[1],
            uint256Params[2],
            uint256Params[0],
            uint256Params[3],
            uint256Params[4]
        );
        console.log(name);
        console.log(description);
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name,
                                '", "description":"',
                                description,
                                '", "attributes": ',
                                attributes,
                                ', "image": "',
                                "data:image/svg+xml;base64,",
                                image,
                                '"}'
                            )
                        )
                    )
                )
            );
    }
}
