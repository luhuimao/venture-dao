// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@rari-capital/solmate/src/tokens/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../flex/libraries/LibTokenUri.sol";
import "../flex/adatpers/FlexVesting.sol";
import "../flex/adatpers/interfaces/IFlexVesting.sol";
import "../vintage/adapters/VintageVesting.sol";
import "../vintage/adapters/interfaces/IVesting.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract VestingERC721Helper {
    function getSvg(
        uint256 tokenId,
        uint8 flag,
        address vestingNFTAddress,
        address vestingContAdddr
    ) external view returns (string memory) {
        Variable memory vars;
        if (flag == 2) {
            VintageVesting vest = VintageVesting(vestingContAdddr);
            uint256 vestId = vest.getVestIdByTokenId(
                vestingNFTAddress,
                tokenId
            );
            (, , , , , vars.vtimeInfo, , vars.vvestInfo) = vest.vests(vestId);

            vars.claimInterval = vars.vtimeInfo.stepDuration;
            vars.claimStartTime =
                vars.vtimeInfo.start +
                vars.vtimeInfo.cliffDuration;
            vars.claimEndTime = vars.vtimeInfo.end;
            // vars.description = vars.vestInfo.description;
            vars.vestToken = vars.vvestInfo.token;

            (, vars.remaining_, vars.total_) = vest.getRemainingPercentage(
                vestingNFTAddress,
                tokenId
            );
            // console.log("vintage...");
        } else if (flag == 1) {
            FlexVesting vest = FlexVesting(vestingContAdddr);
            uint256 vestId = vest.getVestIdByTokenId(
                vestingNFTAddress,
                tokenId
            );

            (, , , , , vars.timeInfo, , vars.vestInfo) = vest.vests(vestId);

            vars.claimInterval = vars.timeInfo.stepDuration;
            vars.claimStartTime =
                vars.timeInfo.start +
                vars.timeInfo.cliffDuration;
            vars.claimEndTime = vars.timeInfo.end;
            // vars.description = vars.vestInfo.description;
            vars.vestToken = vars.vestInfo.token;

            (, vars.remaining_, vars.total_) = vest.getRemainingPercentage(
                vestingNFTAddress,
                tokenId
            );
        } else {}

        // console.log("vestInfo.token ", vestInfo.token);
        // console.log("remaining_ ", remaining_);
        // console.log("total_ ", total_);
        return
            LibTokenUri.svg(
                ERC20(vars.vestToken).symbol(),
                vars.vestToken,
                [
                    vars.remaining_,
                    vars.total_,
                    vars.claimInterval,
                    vars.claimStartTime,
                    vars.claimEndTime
                ]
            );
    }

    struct Variable {
        uint256 claimInterval;
        uint256 claimStartTime;
        uint256 claimEndTime;
        address daoAddr;
        bytes32 proposalId;
        string description;
        address vestToken;
        uint256 remaining_;
        uint256 total_;
        IFlexVesting.TimeInfo timeInfo;
        IFlexVesting.VestInfo vestInfo;
        IVesting.TimeInfo vtimeInfo;
        IVesting.VestInfo vvestInfo;
    }

    function getTokenURI(
        uint256 _tokenId,
        uint8 flag,
        address vestAddress,
        address vestingNFTAddress
    ) external view returns (string memory) {
        Variable memory vars;

        if (flag == 2) {
            VintageVesting vest = VintageVesting(vestAddress);
            uint256 vestId = vest.getVestIdByTokenId(
                vestingNFTAddress,
                _tokenId
            );
            (
                vars.daoAddr,
                vars.proposalId,
                ,
                ,
                ,
                vars.vtimeInfo,
                ,
                vars.vvestInfo
            ) = vest.vests(vestId);

            vars.claimInterval = vars.vtimeInfo.stepDuration;
            vars.claimStartTime =
                vars.vtimeInfo.start +
                vars.vtimeInfo.cliffDuration;
            vars.claimEndTime = vars.vtimeInfo.end;
            vars.description = vars.vvestInfo.description;
            vars.vestToken = vars.vvestInfo.token;

            (, vars.remaining_, vars.total_) = vest.getRemainingPercentage(
                vestingNFTAddress,
                _tokenId
            );
        } else if (flag == 1) {
            FlexVesting vest = FlexVesting(vestAddress);
            uint256 vestId = vest.getVestIdByTokenId(
                vestingNFTAddress,
                _tokenId
            );

            (
                vars.daoAddr,
                vars.proposalId,
                ,
                ,
                ,
                vars.timeInfo,
                ,
                vars.vestInfo
            ) = vest.vests(vestId);

            vars.claimInterval = vars.timeInfo.stepDuration;
            vars.claimStartTime =
                vars.timeInfo.start +
                vars.timeInfo.cliffDuration;
            vars.claimEndTime = vars.timeInfo.end;
            vars.description = vars.vestInfo.description;
            vars.vestToken = vars.vestInfo.token;

            (, vars.remaining_, vars.total_) = vest.getRemainingPercentage(
                vestingNFTAddress,
                _tokenId
            );
        } else {}

        // console.log("total_", total_);
        string memory proposalLink = string(
            abi.encodePacked(
                "https://graph.phoenix.fi/venturedaos/flex/",
                Strings.toHexString(uint256(uint160(vars.daoAddr)), 20),
                "/proposals/",
                lower(
                    string(
                        abi.encodePacked(
                            "0x",
                            LibTokenUri.toHex16(bytes16(vars.proposalId)),
                            LibTokenUri.toHex16(bytes16(vars.proposalId << 128))
                        )
                    )
                ),
                "/investment"
            )
        );

        return
            LibTokenUri.tokenURI(
                vars.description,
                ERC20(vars.vestToken).symbol(),
                proposalLink,
                vars.vestToken,
                [
                    vars.claimInterval,
                    vars.remaining_,
                    vars.total_,
                    vars.claimStartTime,
                    vars.claimEndTime
                ]
            );
    }

    function lower(string memory _base) internal pure returns (string memory) {
        bytes memory _baseBytes = bytes(_base);
        for (uint i = 0; i < _baseBytes.length; i++) {
            _baseBytes[i] = _lower(_baseBytes[i]);
        }
        return string(_baseBytes);
    }

    function _lower(bytes1 _b1) private pure returns (bytes1) {
        if (_b1 >= 0x41 && _b1 <= 0x5A) {
            return bytes1(uint8(_b1) + 32);
        }

        return _b1;
    }
}
