pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";

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

interface IFundRaise {
    enum ProposalState {
        Voting,
        Executing,
        Done,
        Failed
    }
    struct FundRiaseTimeInfo {
        uint256 fundRaiseStartTime;
        uint256 fundRaiseEndTime;
        uint256 fundTerm;
        uint256 redemptPeriod;
        uint256 redemptDuration;
        uint256 returnDuration;
    }

    struct FundRaiseRewardAndFeeInfo {
        uint256 proposerRewardRatio;
        uint256 managementFeeRatio;
        uint256 redepmtFeeRatio;
        uint256 protocolFeeRatio;
        address managementFeeAddress;
    }
    struct ProposalDetails {
        address acceptTokenAddr;
        uint256 fundRaiseTarget;
        uint256 fundRaiseMaxAmount;
        uint256 lpMinDepositAmount;
        uint256 lpMaxDepositAmount;
        FundRiaseTimeInfo timesInfo;
        FundRaiseRewardAndFeeInfo feeInfo;
        ProposalState state;
        uint256 creationTime;
        uint256 stopVoteTime;
    }
    /*
     * EVENTS
     */
    event ProposalCreated(
        bytes32 proposalId,
        address acceptTokenAddr,
        uint256 fundRaiseTarget,
        uint256 fundRaiseMaxAmount,
        uint256 lpMinDepositAmount,
        uint256 lpMaxDepositAmount,
        uint256 fundRaiseStartTime,
        uint256 fundRaiseEndTime,
        uint256 fundEndTime,
        uint256 redemptPeriod,
        uint256 redemptDuration,
        ProposalState state
    );
    event proposalExecuted(bytes32 proposalId, ProposalState state);

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
        DaoRegistry dao,
        uint256[] calldata _uint256ArgsProposal,
        uint256[] calldata _uint256ArgsTimeInfo,
        uint256[] calldata _uint256ArgsFeeInfo,
        address[] calldata _addressArgs
    ) external;

    function processProposal(DaoRegistry dao, bytes32 proposalId) external;

    error InvalidParamsSetting();
}
