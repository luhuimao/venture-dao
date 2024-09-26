// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../libraries/LibManualVestingTokenURI.sol";
// import "./interfaces/IVesting.sol";
import "../ManualVesting.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract ManualVestingERC721TokenURIHelper {
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
        ManualVesting.TimeInfo timeInfo;
        ManualVesting.VestInfo vestInfo;
    }

    function getTokenURI(
        uint256 _tokenId,
        address vestAddress,
        address vestingNFTAddress
    ) external view returns (string memory) {
        Variable memory vars;

        ManualVesting vest = ManualVesting(vestAddress);
        uint256 vestId = vest.getVestIdByTokenId(vestingNFTAddress, _tokenId);
        (, , , vars.timeInfo, , vars.vestInfo) = vest.vests(vestId);

        vars.claimInterval = vars.timeInfo.stepDuration;
        vars.claimStartTime = vars.timeInfo.start + vars.timeInfo.cliffDuration;
        vars.claimEndTime = vars.timeInfo.end;
        vars.description = vars.vestInfo.description;
        vars.vestToken = vars.vestInfo.token;


        (, vars.remaining_, vars.total_) = vest.getRemainingPercentage(
            vestingNFTAddress,
            _tokenId
        );

        return
            LibManualVestingTokenUri.tokenURI(
                vars.description,
                ERC20(vars.vestToken).symbol(),
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
}
