// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@rari-capital/solmate/src/tokens/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../libraries/LibTokenUri.sol";
import "./FlexVesting.sol";
import "./interfaces/IFlexVesting.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

// import {Base64} from "../libraries/LibBase64.sol";

contract FlexVestingERC721Helper {
    function getSvg(
        uint256 tokenId,
        address vestingNFTAddress,
        address vestingContAdddr
    ) external view returns (string memory) {
        FlexVesting vest = FlexVesting(vestingContAdddr);
        uint256 vestId = vest.getVestIdByTokenId(vestingNFTAddress, tokenId);
        (
            ,
            ,
            ,
            ,
            ,
            IFlexVesting.TimeInfo memory timeInfo,
            ,
            IFlexVesting.VestInfo memory vestInfo
        ) = vest.vests(vestId);

        (, uint256 remaining_, uint256 total_) = vest.getRemainingPercentage(
            vestingNFTAddress,
            tokenId
        );
        // console.log("vestInfo.token ", vestInfo.token);
        // console.log("remaining_ ", remaining_);
        // console.log("total_ ", total_);
        return
            LibTokenUri.svg(
                ERC20(vestInfo.token).symbol(),
                vestInfo.token,
                [
                    remaining_,
                    total_,
                    timeInfo.stepDuration,
                    timeInfo.start + timeInfo.cliffDuration,
                    timeInfo.end
                ]
            );
    }

    function getTokenURI(
        uint256 _tokenId,
        address vestAddress,
        address vestingNFTAddress
    ) external view returns (string memory) {
        FlexVesting vest = FlexVesting(vestAddress);
        uint256 vestId = vest.getVestIdByTokenId(vestingNFTAddress, _tokenId);

        (
            address daoAddr,
            bytes32 proposalId,
            ,
            ,
            ,
            IFlexVesting.TimeInfo memory timeInfo,
            ,
            IFlexVesting.VestInfo memory vestInfo
        ) = vest.vests(vestId);

        (, uint256 remaining_, uint256 total_) = vest.getRemainingPercentage(
            vestingNFTAddress,
            _tokenId
        );

        console.log("total_", total_);
        string memory proposalLink = string(
            abi.encodePacked(
                "https://graph.phoenix.fi/venturedaos/flex/",
                Strings.toHexString(uint256(uint160(daoAddr)), 20),
                "/proposals/",
                string(
                    abi.encodePacked(
                        "0x",
                        LibTokenUri.toHex16(bytes16(proposalId)),
                        LibTokenUri.toHex16(bytes16(proposalId << 128))
                    )
                ),
                "/investment"
            )
        );

        return
            LibTokenUri.tokenURI(
                vestInfo.description,
                ERC20(vestInfo.token).symbol(),
                proposalLink,
                vestInfo.token,
                [
                    timeInfo.stepDuration,
                    remaining_,
                    total_,
                    timeInfo.start + timeInfo.cliffDuration,
                    timeInfo.end
                ]
            );
    }
}
