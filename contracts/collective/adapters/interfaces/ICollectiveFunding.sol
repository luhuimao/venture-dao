pragma solidity ^0.8.0;
import "../../../core/DaoRegistry.sol";
import "../CollectiveVotingAdapter.sol";
import "./ICollectiveVoting.sol";
import "../CollectiveFundingPoolAdapter.sol";
import "../../extensions/CollectiveFundingPool.sol";

// SPDX-License-Identifier: MIT

interface ICollectiveFunding {
    struct ProposalDetails {
        FundingInfo fundingInfo;
        EscrowInfo escrowInfo;
        VestingInfo vestingInfo;
        TimeInfo timeInfo;
        address proposer;
        uint256 executeBlockNum;
        ProposalState state;
    }

    struct TimeInfo {
        uint256 startVotingTime;
        uint256 stopVotingTime;
    }

    struct FundingInfo {
        address token;
        uint256 fundingAmount;
        uint256 totalAmount;
        address receiver;
    }

    struct EscrowInfo {
        bool escrow;
        address paybackToken;
        uint256 price;
        uint256 paybackAmount;
        address approver;
    }

    struct VestingInfo {
        uint256 startTime;
        uint256 endTime;
        uint256 cliffEndTime;
        uint256 cliffVestingAmount; // percentage
        uint256 vestingInterval;
        bool nftEnable;
        address erc721;
        string vestName;
        string vestDescription;
    }

    struct ProposalParams {
        DaoRegistry dao;
        FundingInfo fundingInfo;
        EscrowInfo escrowInfo;
        VestingInfo vestingInfo;
    }

    // The  status
    enum ProposalState {
        IN_QUEUE,
        IN_VOTING_PROGRESS,
        IN_EXECUTE_PROGRESS,
        DONE,
        FAILED
    }

    struct SubmitProposalLocalVars {
        bytes32 proposalId;
    }
    struct StartVotingLocalVars {
        bytes32 ongongingPrposalId;
        uint256 _propsalStopVotingTimestamp;
        ICollectiveVoting votingContract;
        ColletiveFundingPoolAdapterContract investmentPoolAdapt;
        bool escorwPaybackTokenSucceed;
    }

    struct ProcessProposalLocalVars {
        bytes32 ongoingProposalId;
        CollectiveVotingAdapterContract votingContract;
        ColletiveFundingPoolAdapterContract investmentPoolAdapt;
        CollectiveInvestmentPoolExtension investmentpool;
        ICollectiveVoting.VotingState voteResult;
        uint256 nbYes;
        uint256 nbNo;
        uint256 allVotingWeight;
        uint256 protocolFee;
        uint256 managementFee;
        uint256 proposerFundReward;
    }
    event ProposalCreated(address daoAddr, bytes32 proposalId);
    event ProposalExecuted(
        address daoAddr,
        bytes32 proposalId,
        uint256 allVotingWeight,
        uint256 nbYes,
        uint256 nbNo
    );
    event StartVoting(address daoAddr, bytes32 proposalId);

    error INVESTMENT_PROPOSAL_NOT_FINALIZED();
    error GRACE_PERIOD();
    error VOTING_PERIOD();
}
