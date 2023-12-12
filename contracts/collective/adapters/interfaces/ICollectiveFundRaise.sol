pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT
import "../../../core/DaoRegistry.sol";
import "../CollectiveDaoSetProposalAdapter.sol";
import "../CollectiveVotingAdapter.sol";
import "../CollectiveFundingPoolAdapter.sol";

interface ICollectiveFundRaise {
    struct ProposalDetails {
        FundRaiseTimeInfo timeInfo;
        FundInfo fundInfo;
        PriorityDepositorInfo priorityDepositor;
        ProposalState state;
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
        uint8 valifyType;
        address tokenAddress;
        uint256 tokenId;
        uint256 miniHolding;
        address[] whitelist;
    }

    struct ProposalParams {
        DaoRegistry dao;
        FundInfo fundInfo;
        FundRaiseTimeInfo timeInfo;
        PriorityDepositorInfo priorityDepositor;
    }

    enum ProposalState {
        Voting,
        Executing,
        Done,
        Failed
    }

    struct SubmitProposalLocalVars {
        ColletiveDaoSetProposalContract daosetAdapt;
        bytes32 proposalId;
    }

    struct ProcessProposalLocalVars {
        ColletiveFundingPoolContract investmentPoolAdapt;
        CollectiveVotingContract votingContract;
        ICollectiveVoting.VotingState voteResult;
        uint128 nbYes;
        uint128 nbNo;
        uint128 allVotingWeight;
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
        uint128 allVotingWeight,
        uint128 nbYes,
        uint128 nbNo,
        uint256 voteResult
    );
}
