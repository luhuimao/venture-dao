pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "../../helpers/DaoHelper.sol";

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

interface IFunding {
    function submitProposal(
        DaoRegistry dao,
        address[] calldata _addressArgs,
        uint256[] calldata _uint256ArgsProposal
    ) external returns (bytes32 proposalId);

    function processProposal(DaoRegistry dao, bytes32 proposalId)
        external
        returns (bool);

    // The distribution status
    enum DistributionStatus {
        IN_QUEUE,
        IN_VOTING_PROGRESS,
        IN_EXECUTE_PROGRESS,
        DONE,
        FAILED
    }
    // State of the distribution proposal
    struct Distribution {
        address tokenAddr; // The token in which the project team to trade off.
        uint256 tradingOffTokenAmount; //project token amount for trading off
        uint256 requestedFundAmount; // The amount project team requested.
        address recipientAddr; // The receiver address that will receive the funds.
        address proposer;
        DistributionStatus status; // The distribution status.
        uint256 inQueueTimestamp;
        uint256 proposalStartVotingTimestamp; //project start voting timestamp
        uint256 proposalStopVotingTimestamp;
        uint256 proposalExecuteTimestamp;
        VestInfo vestInfo;
    }

    struct VestInfo {
        uint256 vestingStartTime;
        uint256 vestingCliffDuration;
        uint256 vestingStepDuration;
        uint256 vestingSteps;
    }

    event ProposalCreated(
        bytes32 proposalId,
        address projectTokenAddress,
        address projectTeamAddress,
        uint256 tradingOffTokenAmount,
        uint256 requestedFundAmount,
        uint256 fullyReleasedDate,
        uint256 lockupDate,
        uint256 inQueueTimestamp,
        uint256 voteStartingTimestamp,
        uint256 voteEndTimestamp,
        uint256 proposalExecuteTimestamp
    );
    event ProposalExecuted(
        bytes32 proposalID,
        uint256 state,
        uint128 allVotingWeight,
        uint128 nbYes,
        uint128 nbNo,
        uint256 distributeState
    );

    // function distribute(DaoRegistry dao, uint256 toIndex) external;
}
