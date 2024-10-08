// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "./ITasker.sol";
// import "./IERC20.sol";
import "./ITokenURIFetcher.sol";
import "./IBentoBoxMinimal.sol";
import "../utils/Multicall.sol";
import "../utils/BoringOwnable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@rari-capital/solmate/src/tokens/ERC721.sol";
import "../../../../helpers/DaoHelper.sol";

interface IFuroVesting {
    // function setBentoBoxApproval(
    //     address user,
    //     bool approved,
    //     uint8 v,
    //     bytes32 r,
    //     bytes32 s
    // ) external payable;

    function createVesting(
        DaoRegistry dao,
        address recipientAddr,
        bytes32 proposalId
    )
        external
        payable
        returns (
            uint256 depositedShares,
            uint256 vestId,
            uint128 stepShares,
            uint128 cliffShares
        );

    function withdraw(
        DaoRegistry dao,
        uint256 vestId
        // bytes memory taskData,
        // bool toBentoBox
    ) external;

    // function stopVesting(uint256 vestId, bool toBentoBox) external;

    function vestBalance(uint256 vestId) external view returns (uint256);

    function updateOwner(uint256 vestId, address newOwner) external;

    struct VestParams {
        address token;
        bytes32 proposalId;
        address recipient;
        uint32 start;
        uint32 cliffDuration;
        uint32 stepDuration;
        uint32 steps;
        uint128 stepPercentage;
        uint128 amount;
        bool fromBentoBox;
    }

    struct Vest {
        bytes32 proposalId;
        address owner;
        address recipient;
        address token;
        uint32 start;
        uint32 end;
        uint32 cliffDuration;
        uint32 stepDuration;
        uint32 steps;
        uint128 cliffShares;
        uint128 stepShares;
        uint128 claimed;
    }

    event CreateVesting(
        uint256 indexed vestId,
        address token,
        address indexed recipient,
        uint32 start,
        uint32 cliffDuration,
        uint32 stepDuration,
        uint32 steps,
        uint128 cliffShares,
        uint128 stepShares,
        bytes32 proposalId
    );

    event Withdraw(
        uint256 indexed vestId,
        address indexed token,
        uint256 indexed amount,
        bool toBentoBox
    );

    event CancelVesting(
        uint256 indexed vestId,
        uint256 indexed ownerAmount,
        uint256 indexed recipientAmount,
        address token,
        bool toBentoBox
    );

    event LogUpdateOwner(uint256 indexed vestId, address indexed newOwner);
}
