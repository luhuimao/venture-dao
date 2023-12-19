pragma solidity ^0.8.0;
import "../../../core/DaoRegistry.sol";

// SPDX-License-Identifier: MIT

interface ICollectiveFunding {
    struct ProposalDetails {
        FundingInfo fundingInfo;
        EscrowInfo escrowInfo;
        VestingInfo vestingInfo;
        ProposalState state;
    }

    struct FundingInfo {
        address token;
        uint256 fundingAmount;
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
        uint256 cliffVestingAmount;
        uint256 vestingInterval;
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
    }
    event ProposalCreated(address daoAddr, bytes32 proposalId);
    event ProposalExecuted(address daoAddr, bytes32 proposalId);
}
