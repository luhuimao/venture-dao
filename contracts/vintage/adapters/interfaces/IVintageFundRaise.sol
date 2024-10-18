pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../../core/DaoRegistry.sol";
import "./IVintageVoting.sol";
import "../VintageFundingPoolAdapter.sol";
import "../VintageDaoSetAdapter.sol";
import "../VintageFundingAdapter.sol";

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

interface IVintageFundRaise {
    enum ProposalState {
        Voting,
        Executing,
        FundRaising,
        Done,
        Failed
    }
    struct FundRiaseTimeInfo {
        uint256 fundRaiseStartTime;
        uint256 fundRaiseEndTime;
        uint256 fundTerm;
        uint256 redemptPeriod;
        uint256 redemptDuration;
        uint256 refundDuration;
    }

    struct PriorityDeposite {
        bool enable;
        uint8 vtype;
        address token;
        uint256 tokenId;
        uint256 amount;
    }

    struct FundRaiseRewardAndFeeInfo {
        uint256 managementFeeRatio;
        uint256 paybackTokenManagementFeeRatio;
        uint256 redepmtFeeRatio;
        uint256 protocolFeeRatio;
        address managementFeeAddress;
        address redemptionFeeReceiver;
    }

    struct FundRaiseAmountInfo {
        uint256 fundRaiseTarget;
        uint256 fundRaiseMaxAmount;
        uint256 lpMinDepositAmount;
        uint256 lpMaxDepositAmount;
    }
    struct ProposalDetails {
        address acceptTokenAddr;
        FundRaiseAmountInfo amountInfo;
        FundRiaseTimeInfo timesInfo;
        FundRaiseRewardAndFeeInfo feeInfo;
        ProoserReward proposerReward;
        PriorityDeposite priorityDeposite;
        uint8 fundRaiseType;
        ProposalState state;
        uint256 creationTime;
        uint256 stopVoteTime;
    }

    struct SubmitProposalLocalVars {
        uint256 lastFundEndTime;
        IVintageVoting votingContract;
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
        uint256 refundDuration;
        uint256 proposerRewardRatio;
        uint256 managementFeeRatio;
        uint256 redepmtFeeRatio;
        uint256 protocolFeeRatio;
        VintageFundingPoolAdapterContract investmentPoolAdapt;
        VintageDaoSetAdapterContract daosetAdapt;
        VintageFundingAdapterContract investmentContract;
    }

    struct ProposalParams {
        DaoRegistry dao;
        ProposalFundRaiseInfo proposalFundRaiseInfo;
        ProposalTimeInfo proposalTimeInfo;
        ProposalFeeInfo proposalFeeInfo;
        ProposalAddressInfo proposalAddressInfo;
        ProoserReward proposerReward;
        ProposalPriorityDepositInfo priorityDeposite;
    }

    struct ProposalPriorityDepositInfo {
        bool enable;
        uint8 vtype;
        address token;
        uint256 tokenId;
        uint256 amount;
        address[] whitelist;
    }
    struct ProposalFundRaiseInfo {
        uint256 fundRaiseMinTarget;
        uint256 fundRaiseMaxCap;
        uint256 lpMinDepositAmount;
        uint256 lpMaxDepositAmount;
        uint8 fundRaiseType; // 0 FCFS 1 Free In
    }
    struct ProoserReward {
        uint256 fundFromInverstor;
        uint256 projectTokenFromInvestor;
    }
    struct ProposalAddressInfo {
        address managementFeeAddress;
        address redemptionFeeReceiver;
        address fundRaiseTokenAddress;
    }
    struct ProposalFeeInfo {
        uint256 managementFeeRatio;
        uint256 paybackTokenManagementFeeRatio;
        uint256 redepmtFeeRatio;
    }

    struct ProposalTimeInfo {
        uint256 startTime;
        uint256 endTime;
        uint256 fundTerm;
        uint256 redemptPeriod;
        uint256 redemptInterval;
        uint256 refundPeriod;
    }
    /*
     * EVENTS
     */
    event ProposalCreated(
        address daoAddr,
        bytes32 proposalId
        // address acceptTokenAddr,
        // uint256 fundRaiseTarget,
        // uint256 fundRaiseMaxAmount,
        // uint256 lpMinDepositAmount,
        // uint256 lpMaxDepositAmount,
        // uint256 fundRaiseStartTime,
        // uint256 fundRaiseEndTime,
        // uint256 fundEndTime,
        // uint256 redemptPeriod,
        // uint256 redemptDuration,
        // ProposalState state
    );
    event proposalExecuted(
        address daoAddr,
        bytes32 proposalId,
        ProposalState state,
        uint128 allVotingWeight,
        uint128 nbYes,
        uint128 nbNo,
        uint256 voteResult
    );

    /*
    _uint256ArgsProposal[0]:fundRaiseTarget
    _uint256ArgsProposal[1]:fundRaiseMaxAmount
    _uint256ArgsProposal[2]:lpMinDepositAmount
    _uint256ArgsProposal[3]:lpMaxDepositAmount
    _uint256ArgsTimeInfo[0]:fundRaiseStartTime
    _uint256ArgsTimeInfo[1]:fundRaiseEndTime
    _uint256ArgsTimeInfo[2]:fundTerm
    _uint256ArgsTimeInfo[3]:redemptPeriod
    _uint256ArgsTimeInfo[4]:redemptDuration
    _uint256ArgsTimeInfo[5]:returnDuration
    _uint256ArgsFeeInfo[0]:proposerRewardRatio
    _uint256ArgsFeeInfo[1]:managementFeeRatio
    _uint256ArgsFeeInfo[2]:redepmtFeeRatio
    _uint256ArgsFeeInfo[3]:protocolFeeRatio
    _addressArgs[0]:managementFeeAddress
    _addressArgs[1]:fundRaiseTokenAddress
    */
    function submitProposal(
        // DaoRegistry dao,
        // uint256[] calldata _uint256ArgsProposal,
        // uint256[] calldata _uint256ArgsTimeInfo,
        // uint256[] calldata _uint256ArgsFeeInfo,
        // address[] calldata _addressArgs
        ProposalParams calldata params
    ) external;

    function processProposal(DaoRegistry dao, bytes32 proposalId) external;

    error LAST_NEW_FUND_PROPOSAL_NOT_FINISH();
    error INVALID_PARAM();
    error VOTING_NOT_FINISH();
    error DAOSET_PROPOSAL_UNDONE();
    error UNDONE_INVESTMENT_PROPOSAL();
    error NOT_CLEAR_FUND();
    error VOTING_ADAPTER_NOT_FOUND();
    error ACCESS_DENIED();
}
