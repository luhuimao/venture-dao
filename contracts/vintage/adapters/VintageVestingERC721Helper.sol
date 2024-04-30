// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

// import "@rari-capital/solmate/src/tokens/ERC721.sol";
// import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./VintageVesting.sol";
import "./interfaces/IVesting.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../../flex/libraries/LibTokenUri.sol";
import "hardhat/console.sol";

contract VintageVestingERC721Helper {
    function getSvg(
        uint256 tokenId,
        address vestingNFTAddr,
        address vestContrAddress
    ) external view returns (string memory) {
        VintageVesting vest = VintageVesting(vestContrAddress);
        uint256 vestId = vest.getVestIdByTokenId(vestingNFTAddr, tokenId);
        (
            ,
            ,
            ,
            ,
            ,
            IVesting.TimeInfo memory timeInfo,
            ,
            IVesting.VestInfo memory vestInfo
        ) = vest.vests(vestId);

        (, uint256 remaining_, uint256 total_) = vest.getRemainingPercentage(
            vestingNFTAddr,
            tokenId
        );

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
        address vestingNFTAddr,
        address vestAddress
    ) external view returns (string memory) {
        require(vestAddress != address(0x0), "invalid vest address");
        VintageVesting vest = VintageVesting(vestAddress);
        uint256 vestId = vest.getVestIdByTokenId(vestingNFTAddr, _tokenId);
        (
            address daoAddr,
            bytes32 proposalId,
            ,
            ,
            ,
            IVesting.TimeInfo memory timeInfo,
            ,
            IVesting.VestInfo memory vestInfo
        ) = vest.vests(vestId);

        (, uint256 remaining_, uint256 total_) = vest.getRemainingPercentage(
            vestingNFTAddr,
            _tokenId
        );

        string memory proposalLink = string(
            abi.encodePacked(
                "https://graph.phoenix.fi/venturedaos/vintage/",
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
                    remaining_ * 10 ** 18,
                    total_ * 10 ** 18,
                    timeInfo.start + timeInfo.cliffDuration,
                    timeInfo.end
                ]
            );
    }
}
