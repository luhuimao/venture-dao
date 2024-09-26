// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../flex/libraries/LibTokenUri.sol";
// import "./interfaces/IVesting.sol";
import "../ManualVesting.sol";
import "hardhat/console.sol";

contract ManualVestingERC721SVGHelper {
    function getSvg(
        uint256 tokenId,
        address vestingNFTAddress,
        address vestingContAdddr
    ) external view returns (string memory) {
        Variable memory vars;

        ManualVesting vest = ManualVesting(vestingContAdddr);
        uint256 vestId = vest.getVestIdByTokenId(vestingNFTAddress, tokenId);
        (, , , vars.timeInfo, , vars.vestInfo) = vest.vests(vestId);

        vars.claimInterval = vars.timeInfo.stepDuration;
        vars.claimStartTime = vars.timeInfo.start + vars.timeInfo.cliffDuration;
        vars.claimEndTime = vars.timeInfo.end;
        vars.vestToken = vars.vestInfo.token;

        (, vars.remaining_, vars.total_) = vest.getRemainingPercentage(
            vestingNFTAddress,
            tokenId
        );

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
        ManualVesting.TimeInfo timeInfo;
        ManualVesting.VestInfo vestInfo;
    }
}
