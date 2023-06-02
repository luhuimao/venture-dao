pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../../core/DaoRegistry.sol";
import "../../../helpers/DaoHelper.sol";
import "../VintageFundingPoolAdapter.sol";
import "../VintageVoting.sol";
import "./IVintageVoting.sol";
import "../../extensions/fundingpool/VintageFundingPool.sol";

/**
MIT License

Copyright (c) 2020 Openlaw

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

interface IVintageFunding {
    function submitProposal(
        DaoRegistry dao,
        FundingProposalParams calldata params
    ) external returns (bytes32 proposalId);

    function processProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external returns (bool);

    // The  status
    enum ProposalState {
        IN_QUEUE,
        IN_VOTING_PROGRESS,
        IN_EXECUTE_PROGRESS,
        DONE,
        FAILED
    }
    // State of the Funding proposal
    struct ProposalInfo {
        address fundingToken; // The token in which the project team to trade off.
        uint256 fundingAmount; // The amount project team requested.
        uint256 totalAmount;
        uint256 price;
        address recipientAddr; // The receiver address that will receive the funds.
        address proposer;
        ProposalState status; // The distribution status.
        VestInfo vestInfo;
        ProposalReturnTokenInfo proposalReturnTokenInfo;
        ProposalTimeInfo proposalTimeInfo;
    }

    struct ProposalReturnTokenInfo {
        bool escrow;
        address returnToken;
        uint256 returnTokenAmount; //project token amount for trading off
        address approveOwnerAddr; // owner address when approve
    }

    struct ProposalTimeInfo {
        uint256 inQueueTimestamp;
        uint256 proposalStartVotingTimestamp; //project start voting timestamp
        uint256 proposalStopVotingTimestamp;
        uint256 proposalExecuteTimestamp;
    }

    struct VestInfo {
        uint256 vestingStartTime;
        uint256 vetingEndTime;
        uint256 vestingCliffEndTime;
        uint256 vestingCliffLockAmount;
        uint256 vestingInterval;
    }

    struct SubmitProposalLocalVars {
        bytes32 ongoingProposalId;
        IVintageVoting votingContract;
        VintageFundingPoolAdapterContract fundingPoolAdapt;
        address submittedBy;
        bytes32 proposalId;
        uint256 proposalInQueueTimestamp;
        uint256 projectDisplayTimestamp;
        uint256 proposalStartVotingTimestamp;
        uint256 proposalEndVotingTimestamp;
        uint256 proposalExecuteTimestamp;
        // uint256 vestingStartTime;
        // uint256 vetingEndTime;
        // uint256 vestingCliffEndTime;
        // uint256 vestingCliffLockAmount;
        // uint256 vestingInterval;
        uint256 fundingAmount;
        uint256 returnTokenAmount;
    }

    struct ReturnTokenInfo {
        bool escrow;
        address returnToken;
        uint256 price;
        uint256 returnTokenAmount;
        address approver;
    }

    struct FundingInfo {
        uint256 fundingAmount;
        address fundingToken;
        address receiver;
    }
    struct FundingProposalParams {
        FundingInfo fundingInfo;
        ReturnTokenInfo returnTokenInfo;
        VestInfo vestInfo;
    }

    struct StartVotingLocalVars {
        bytes32 ongongingPrposalId;
        VintageFundingPoolExtension fundingpoolExt;
        VintageFundingPoolAdapterContract fundingPoolAdapt;
        uint256 _propsalStartVotingTimestamp;
        uint256 _propsalStopVotingTimestamp;
        bool rel;
        IVintageVoting votingContract;
        uint256 totalFund;
    }

    struct ProcessProposalLocalVars {
        bytes32 ongoingProposalId;
        VintageVotingContract votingContract;
        VintageFundingPoolAdapterContract fundingPoolAdapt;
        VintageFundingPoolExtension fundingpool;
        IVintageVoting.VotingState voteResult;
        uint128 nbYes;
        uint128 nbNo;
        uint128 allVotingWeight;
        address fundRaiseTokenAddr;
        uint256 protocolFee;
        uint256 managementFee;
        uint256 proposerFundReward;
        uint256 proposerTokenReward;
    }

    event ProposalCreated(
        address daoAddr,
        bytes32 proposalId,
        uint256 vestingStartTime,
        uint256 vetingEndTime,
        uint256 vestingCliffEndTime,
        uint256 vestingCliffLockAmount,
        uint256 vestingInterval,
        uint256 proposalInQueueTimestamp
    );

    event StartVote(
        address daoAddr,
        bytes32 proposalID,
        uint256 startVoteTime,
        uint256 stopVoteTime,
        ProposalState state
    );

    event ProposalExecuted(
        address daoAddr,
        bytes32 proposalID,
        uint256 state,
        uint128 allVotingWeight,
        uint128 nbYes,
        uint128 nbNo,
        uint256 distributeState
    );
    error InvalidStepSetting();

    // function distribute(DaoRegistry dao, uint256 toIndex) external;
}
