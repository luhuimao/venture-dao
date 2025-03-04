// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VestingNFTSVG.sol";
import "./NFTDescriptor.sol";
import "./VestingReceiptNFTSVG.sol";
import "hardhat/console.sol";

library LibManualVestingTokenUri {
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

    function receiptSVG(
        string memory txHash,
        string memory projectName,
        string memory symbol,
        uint8 decimals,
        uint256 totalInvestedAmount,
        uint256 myInvestedAmount
    ) internal pure returns (string memory output) {
        return
            VestingReceiptNFTSVG.generateSVG(
                txHash,
                projectName,
                symbol,
                decimals,
                totalInvestedAmount,
                myInvestedAmount
            );
    }

    function receiptSVGBase64(
        string memory txHash,
        string memory projectName,
        string memory symbol,
        uint8 decimals,
        uint256 totalInvestedAmount,
        uint256 myInvestedAmount
    ) internal pure returns (string memory) {
        string memory _svg = receiptSVG(
            txHash,
            projectName,
            symbol,
            decimals,
            totalInvestedAmount,
            myInvestedAmount
        );
        string memory image = string(
            abi.encodePacked(Base64.encode(bytes(_svg)))
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"image": "',
                                "data:image/svg+xml;base64,",
                                image,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function receiptTokenURI(
        string memory txHash,
        string memory projectName,
        string memory symbol,
        uint8 decimals,
        uint256 totalInvestedAmount,
        uint256 myInvestedAmount,
        string memory description,
        string memory proposalLink
    ) internal pure returns (string memory) {
        string memory _svg = receiptSVG(
            txHash,
            projectName,
            symbol,
            decimals,
            totalInvestedAmount,
            myInvestedAmount
        );
        string memory image = string(
            abi.encodePacked(Base64.encode(bytes(_svg)))
        );
        string memory attributes = NFTDescriptor
            .generateReceiptCollectionAttributes(
                projectName,
                symbol,
                txHash,
                decimals,
                myInvestedAmount,
                totalInvestedAmount
            );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                projectName,
                                '", "description":"',
                                description,
                                "\\nProposal link: ",
                                proposalLink,
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

    function toHex16(bytes16 data) internal pure returns (bytes32 result) {
        result =
            (bytes32(data) &
                0xFFFFFFFFFFFFFFFF000000000000000000000000000000000000000000000000) |
            ((bytes32(data) &
                0x0000000000000000FFFFFFFFFFFFFFFF00000000000000000000000000000000) >>
                64);
        result =
            (result &
                0xFFFFFFFF000000000000000000000000FFFFFFFF000000000000000000000000) |
            ((result &
                0x00000000FFFFFFFF000000000000000000000000FFFFFFFF0000000000000000) >>
                32);
        result =
            (result &
                0xFFFF000000000000FFFF000000000000FFFF000000000000FFFF000000000000) |
            ((result &
                0x0000FFFF000000000000FFFF000000000000FFFF000000000000FFFF00000000) >>
                16);
        result =
            (result &
                0xFF000000FF000000FF000000FF000000FF000000FF000000FF000000FF000000) |
            ((result &
                0x00FF000000FF000000FF000000FF000000FF000000FF000000FF000000FF0000) >>
                8);
        result =
            ((result &
                0xF000F000F000F000F000F000F000F000F000F000F000F000F000F000F000F000) >>
                4) |
            ((result &
                0x0F000F000F000F000F000F000F000F000F000F000F000F000F000F000F000F00) >>
                8);
        result = bytes32(
            0x3030303030303030303030303030303030303030303030303030303030303030 +
                uint256(result) +
                (((uint256(result) +
                    0x0606060606060606060606060606060606060606060606060606060606060606) >>
                    4) &
                    0x0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F) *
                7
        );
    }
}
