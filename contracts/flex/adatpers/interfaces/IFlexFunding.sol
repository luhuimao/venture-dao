pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "../../../core/DaoRegistry.sol";
import "../../../helpers/DaoHelper.sol";
import "./IFlexVoting.sol";
import "../../extensions/FlexFundingPool.sol";
import "../FlexFundingPoolAdapter.sol";
import "../FlexAllocation.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IFlexFunding {
    function submitProposal(DaoRegistry dao, ProposalParams calldata params)
        external
        returns (bytes32 proposalId);

    function processProposal(DaoRegistry dao, bytes32 proposalId)
        external
        returns (bool);

    enum FundingType {
        DIRECT,
        POLL
    }
    // The proposal status
    enum ProposalStatus {
        IN_VOTING_PROGRESS,
        IN_FUND_RAISE_PROGRESS,
        IN_EXECUTE_PROGRESS,
        DONE,
        FAILED
    }
    enum FundRaiseType {
        FCSF,
        FREE_IN
    }
    enum BackerIdentificationType {
        ERC20,
        ERC721,
        ERC1155,
        WHITE_LIST
    }
    enum PriorityDepositType {
        ERC20,
        ERC721,
        ERC1155,
        WHITE_LIST
    }
    /*
     * STRUCT
     */
    struct ProcessProposalLocalVars {
        ProposalInfo proposalInfo;
        uint256 minFundingAmount;
        uint256 maxFundingAmount;
        FlexFundingPoolAdapterContract flexFundingPoolAdapt;
        FlexFundingPoolExtension flexFundingPoolExt;
        FlexAllocationAdapterContract flexAllocAdapt;
        IFlexVoting flexVoting;
        IFlexVoting.VotingState voteResult;
        address recipientAddr;
        uint256 fundRaiseEndTime;
        uint160 poolBalance;
        uint256 protocolFee;
        uint256 managementFee;
        uint256 proposerReward;
        address propodalFundingToken;
        address returnToken;
        address proposer;
        uint256 totalSendOutAmount;
        uint256 returnTokenAmount;
    }

    struct SubmitProposalLocalVars {
        uint256 lastFundEndTime;
        IFlexVoting flexVotingContract;
        FlexFundingPoolExtension flexFundingPoolExt;
        address fundRaiseTokenAddr;
        address managementFeeAddress;
        address submittedBy;
        bytes32 proposalId;
        uint256 fundRaiseTarget;
        uint256 fundRaiseMaxAmount;
        uint256 lpMinDepositAmount;
        uint256 lpMaxDepositAmount;
        uint256 fundRaiseStartTime;
        uint256 fundRaiseEndTime;
        uint256 fundTerm;
        uint256 redemptPeriod;
        uint256 redemptDuration;
        uint256 returnDuration;
        uint256 proposerRewardRatio;
        uint256 managementFeeRatio;
        uint256 redepmtFeeRatio;
        uint256 protocolFeeRatio;
    }
    struct ProposalParams {
        FundingInfo fundingInfo;
        VestInfo vestInfo;
        FundRaiseInfo fundRaiseInfo;
        ProposerRewardInfo proposerRewardInfo;
    }
    struct ProposalInfo {
        address proposer;
        FundingInfo fundingInfo;
        VestInfo vestInfo;
        FundRaiseInfo fundRaiseInfo;
        ProposerRewardInfo proposerRewardInfo;
        uint256 startVoteTime;
        uint256 stopVoteTime;
        ProposalStatus state;
    }
    struct FundingInfo {
        address tokenAddress;
        uint256 minFundingAmount;
        uint256 maxFundingAmount;
        bool escrow;
        address returnTokenAddr;
        uint256 returnTokenAmount;
        uint256 price;
        uint256 minReturnAmount;
        uint256 maxReturnAmount;
        address approverAddr;
        address recipientAddr;
    }
    struct VestInfo {
        uint256 vestingStartTime;
        uint256 vestingCliffEndTime;
        uint256 vestingEndTime;
        uint256 vestingInterval;
        uint256 vestingCliffLockAmount;
    }
    struct FundRaiseInfo {
        FundRaiseType fundRaiseType;
        uint256 fundRaiseStartTime;
        uint256 fundRaiseEndTime;
        uint256 minDepositAmount;
        uint256 maxDepositAmount;
        bool backerIdentification;
        BackerIdentificationInfo bakckerIdentificationInfo;
        bool priorityDeposit;
        PriorityDepositInfo priorityDepositInfo;
    }
    struct BackerIdentificationInfo {
        BackerIdentificationType bType;
        uint32 bChainId;
        address bTokanAddr;
        uint256 bTokenId;
        uint256 bMinHoldingAmount;
    }
    struct PriorityDepositInfo {
        uint256 pPeriod;
        uint256 pPeriods;
        PriorityDepositType pType;
        uint256 pChainId;
        address pTokenAddr;
        uint256 pTokenId;
        uint256 pMinHolding;
    }
    struct ProposerRewardInfo {
        uint256 tokenRewardAmount;
        uint256 cashRewardAmount;
    }
    /*
     * EVENTS
     */

    event ProposalCreated(
        address daoAddress,
        bytes32 proposalId,
        address proposer
    );

    event ProposalExecuted(
        address daoAddress,
        bytes32 proposalId,
        ProposalStatus state
    );

    error FundRaiseEndTimeNotUP();
}
