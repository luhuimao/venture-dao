pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../../core/DaoRegistry.sol";
import "../../../helpers/DaoHelper.sol";
import "../VintageFundingPoolAdapter.sol";
import "../VintageVoting.sol";
import "./IVintageVoting.sol";
import "../../extensions/fundingpool/VintageFundingPool.sol";
import "../../libraries/fundingLibrary.sol";

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

interface IVintageInvestment {
    function submitProposal(
        DaoRegistry dao,
        InvestmentProposalParams calldata params
    ) external;

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

    struct VestInfo {
        string name;
        string description;
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
        uint256 investmentAmount;
        uint256 returnTokenAmount;
    }

    struct PaybackTokenInfo {
        bool escrow;
        address paybackToken;
        uint256 price;
        uint256 paybackTokenAmount;
        address approver;
        bool nftEnable;
        address vestingNft;
    }

    struct InvestmentInfo {
        uint256 investmentAmount;
        address investmentToken;
        address receiver;
    }
    struct InvestmentProposalParams {
        InvestmentInfo investmentInfo;
        PaybackTokenInfo paybackTokenInfo;
        VestInfo vestInfo;
    }

    struct StartVotingLocalVars {
        bytes32 ongongingPrposalId;
        VintageFundingPoolExtension investmentpoolExt;
        VintageFundingPoolAdapterContract investmentPoolAdapt;
        uint256 _propsalStartVotingTimestamp;
        uint256 _propsalStopVotingTimestamp;
        bool rel;
        IVintageVoting votingContract;
    }

    struct ProcessProposalLocalVars {
        bytes32 ongoingProposalId;
        VintageVotingContract votingContract;
        VintageFundingPoolAdapterContract investmentPoolAdapt;
        VintageFundingPoolExtension investmentpool;
        IVintageVoting.VotingState voteResult;
        uint128 nbYes;
        uint128 nbNo;
        uint128 allVotingWeight;
        uint256 protocolFee;
        uint256 managementFee;
        uint256 proposerFundReward;
        address[] investors;
    }

    event ProposalCreated(address daoAddr, bytes32 proposalId);

    event StartVote(address daoAddr, bytes32 proposalID);

    event ProposalExecuted(
        address daoAddr,
        bytes32 proposalID,
        uint128 allVotingWeight,
        uint128 nbYes,
        uint128 nbNo,
        address[] investors
    );
    // error InvalidStepSetting();
    error INVESTMENT_PROPOSAL_NOT_FINALIZED();
    error DAO_SET_PROPOSAL_UNDONE();
    error PROPOSAL_QUEUE_EMPTY();
    error INVALID_HEAD_QUEUE_PROPOSAL_ID();
    error HIT_REDEMPTION_PERIOD();
    error PROPOSAL_NOT_IN_QUEUE();
    error INVALID_PROPOSAL_ID();
    error IN_VOTING_PERIOD();
    error IN_EXECUTE_PERIOD();
    error ADAPTER_NOT_FOUND();
    error PRE_PROPOSAL_UNDONE();
}
