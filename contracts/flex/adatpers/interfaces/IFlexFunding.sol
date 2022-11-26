pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "../../../core/DaoRegistry.sol";
import "../../../helpers/DaoHelper.sol";

interface IFlexFunding {
    function submitProposal(
        DaoRegistry dao,
        address[] calldata _addressArgs,
        uint256[] calldata _uint256ArgsProposal
    ) external returns (bytes32 proposalId);

    function processProposal(DaoRegistry dao, bytes32 proposalId)
        external
        returns (bool);

    // The proposal status
    enum ProposalStatus {
        IN_VOTING_PROGRESS,
        IN_EXECUTE_PROGRESS,
        DONE,
        FAILED
    }
    enum FundRaiseType {
        FCSF,
        FREE_IN
    }
    /*
     * STRUCT
     */
    struct ProposalInfo {
        FundingInfo fundingInfo;
        VestInfo vestInfo;
        FundRaiseInfo fundRaiseInfo;
        ProposerRewardInfo proposerRewardInfo;
    }
    struct FundingInfo {
        address tokenAddress;
        uint256 minFundingAmount;
        uint256 maxFundingAmount;
        bool escrow;
        address returnTokenAddr;
        uint256 returnTokenAmount;
        uint256 minReturnAmount;
        uint256 maxReturnAmount;
        address approverAddr;
        address recipientAddr;
    }
    struct VestInfo {
        uint256 vestingStartTime;
        uint256 vestingCliffDuration;
        uint256 vestingStepDuration;
        uint256 vestingSteps;
        uint256 vestingCliffLockAmount;
    }
    struct FundRaiseInfo {
        FundRaiseType fundRaiseType;
        uint256 fundRaiseStartTime;
        uint256 fundRaiseEndTime;
        uint256 minDepositAmount;
        uint256 maxDepositAmount;
        bool backerIdentification;
    }
    struct ProposerRewardInfo {
        uint256 tokenRewardAmount;
        uint256 cashRewardAmount;
    }
    /*
     * EVENTS
     */

    event ProposalCreated(bytes32 proposalId);

    event ProposalExecuted(bytes32 proposalId);
}
