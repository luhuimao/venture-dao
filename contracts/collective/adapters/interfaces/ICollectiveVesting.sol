// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "../../../adapters/vesting/contracts/interfaces/IBentoBoxMinimal.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@rari-capital/solmate/src/tokens/ERC721.sol";
import "../../../helpers/DaoHelper.sol";
import "../CollectiveAllocationAdapter.sol";
import "../CollectiveFundingProposalAdapter.sol";
import "./ICollectiveFunding.sol";
import "../../../VestingERC721.sol";
// import "../VintageVestingERC721.sol";

interface ICollectiveVesting {
    function createVesting(
        DaoRegistry dao,
        address recipientAddr,
        bytes32 proposalId
    ) external payable;

    function withdraw(DaoRegistry dao, uint256 vestId) external;

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
        address daoAddr;
        bytes32 proposalId;
        uint128 claimed;
        uint256 total;
        StepInfo stepInfo;
        TimeInfo timeInfo;
        VestNFTInfo nftInfo;
        VestInfo vestInfo;
    }

    struct StepInfo {
        uint32 steps;
        uint128 cliffShares;
        uint128 stepShares;
    }

    struct TimeInfo {
        uint32 start;
        uint32 end;
        uint32 cliffDuration;
        uint32 stepDuration;
    }

    struct VestNFTInfo {
        address nftToken;
        uint256 tokenId;
    }

    struct VestInfo {
        string name;
        string description;
        address owner;
        address recipient;
        address token;
    }

    struct CreateVestLocalVars {
        uint256 depositedShares;
        uint256 vestId;
        uint128 stepShares;
        uint128 cliffShares;
        CollectiveAllocationAdapterContract allocAdapter;
        ColletiveFundingProposalAdapterContract collectiveFundingAdapt;
        uint256 duration;
        uint256 depositAmount;
        uint256 vestingStartTime;
        uint256 vestingSteps;
        address allocAdaptAddr;
        ICollectiveFunding.VestingInfo vestInfo;
        ICollectiveFunding.EscrowInfo paybackTokenInfo;
        uint256 newTokenId;
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

    error NotOwner();
    error NotVestReceiver();
    error InValidVestingTimeParam();
    error ALREADY_CREATED();
    error UN_ELIGIBLE_FOR_THIS_PROPOSAL();
}
