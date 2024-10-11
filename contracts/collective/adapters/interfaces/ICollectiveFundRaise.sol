pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT
import "../../../core/DaoRegistry.sol";
import "../CollectiveDaoSetProposalAdapter.sol";
import "../CollectiveVotingAdapter.sol";
import "../CollectiveFundingPoolAdapter.sol";
import "../CollectiveFundingProposalAdapter.sol";

interface ICollectiveFundRaise {
    struct ProposalDetails {
        FundRaiseTimeInfo timeInfo;
        FundInfo fundInfo;
        PriorityDepositorInfo priorityDepositor;
        uint8 fundRaiseType;
        ProposalState state;
        uint256 creationTime;
        uint256 stopVoteTime;
    }

    struct FundRaiseTimeInfo {
        uint256 startTime;
        uint256 endTime;
    }

    struct FundInfo {
        address tokenAddress;
        uint256 miniTarget;
        uint256 maxCap;
        uint256 miniDeposit;
        uint256 maxDeposit;
    }

    struct PriorityDepositorInfo {
        bool enable;
        uint8 valifyType;
        address tokenAddress;
        uint256 tokenId;
        uint256 miniHolding;
        address[] whitelist;
    }

    struct ProposalParams {
        DaoRegistry dao;
        uint8 fundRaiseType; // 0 FCFS 1 Free In
        FundInfo fundInfo;
        FundRaiseTimeInfo timeInfo;
        PriorityDepositorInfo priorityDepositor;
    }

    enum ProposalState {
        Voting,
        Executing,
        FundRaising,
        Done,
        Failed
    }

    struct SubmitProposalLocalVars {
        ColletiveDaoSetProposalAdapterContract daosetAdapt;
        bytes32 proposalId;
        ColletiveFundingProposalAdapterContract investmentContract;
        ColletiveFundingPoolAdapterContract investmentPoolAdapt;
        uint256 lastFundEndTime;
        uint256 refundDuration;
        uint256 protocolFeeRatio;
    }

    struct ProcessProposalLocalVars {
        ColletiveFundingPoolAdapterContract investmentPoolAdapt;
        CollectiveVotingAdapterContract votingContract;
        ICollectiveVoting.VotingState voteResult;
        uint256 nbYes;
        uint256 nbNo;
        uint256 allVotingWeight;
        ProposalDetails proposalInfo;
    }

    error VOTING_NOT_FINISH();

    /*
     * EVENTS
     */
    event ProposalCreated(address daoAddr, bytes32 proposalId);
    event proposalExecuted(
        address daoAddr,
        bytes32 proposalId,
        ProposalState state,
        uint256 allVotingWeight,
        uint256 nbYes,
        uint256 nbNo,
        uint256 voteResult
    );

    error LAST_NEW_FUND_PROPOSAL_NOT_FINISH();
    error INVALID_PARAM();
    error UNEXECUTE();
    error DAOSET_PROPOSAL_UNDONE();
    error VOTING_ADAPTER_NOT_FOUND();
    error ACCESS_DENIED();
}
