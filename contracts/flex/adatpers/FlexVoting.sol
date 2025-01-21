pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "../../guards/MemberGuard.sol";
import "../../guards/AdapterGuard.sol";
import "./interfaces/IFlexVoting.sol";
import "../../helpers/DaoHelper.sol";
import "./FlexFunding.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "../../helpers/GovernanceHelper.sol";
import "hardhat/console.sol";

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

contract FlexVotingContract is
    IFlexVoting,
    MemberGuard,
    AdapterGuard,
    Reimbursable
{
    struct Voting {
        uint256 nbYes;
        uint256 nbNo;
        uint256 startingTime;
        uint256 stopTime;
        mapping(address => uint256) votes;
    }

    event SubmitVote(
        address daoAddr,
        bytes32 proposalId,
        uint256 votingTime,
        uint256 voteStartTime,
        uint256 voteStopTime,
        address voter,
        uint256 voteValue,
        uint256 nbYes,
        uint256 nbNo,
        uint256 currentQuorum,
        uint256 currentSupport
    );

    bytes32 constant VotingPeriod = keccak256("voting.votingPeriod");
    bytes32 constant GracePeriod = keccak256("voting.gracePeriod");
    mapping(address => mapping(bytes32 => mapping(address => uint128)))
        public voteWeights;
    mapping(address => mapping(bytes32 => Voting)) public votes;

    string public constant ADAPTER_NAME = "FlexVotingContract";

    /**
     * @notice returns the adapter name. Useful to identify wich voting adapter is actually configurated in the DAO.
     */
    function getAdapterName() external pure override returns (string memory) {
        return ADAPTER_NAME;
    }

    /**
     * @notice Stats a new voting proposal considering the block time and number.
     * @notice This function is called from an Adapter to compute the voting starting period for a proposal.
     * @param proposalId The proposal id that is being started.
     */
    function startNewVotingForProposal(
        DaoRegistry dao,
        bytes32 proposalId,
        bytes calldata
    ) external override onlyAdapter(dao) {
        Voting storage vote = votes[address(dao)][proposalId];
        vote.startingTime = block.timestamp;
        vote.stopTime =
            block.timestamp +
            dao.getConfiguration(DaoHelper.VOTING_PERIOD);
    }

    /**
     * @notice Returns the sender address.
     * @notice This funcion is required by the IVoting, usually offchain voting have different rules to identify the sender, but it is not the case here, so we just return the fallback argument: sender.
     * @param sender The fallback sender address that should be return in case no other is found.
     */
    function getSenderAddress(
        DaoRegistry,
        address,
        bytes memory,
        address sender
    ) external pure override returns (address) {
        return sender;
    }

    function submitVote(
        DaoRegistry dao,
        bytes32 proposalId,
        uint256 voteValue
    ) external onlyMember(dao) reimbursable(dao) {
        require(
            dao.getProposalFlag(proposalId, DaoRegistry.ProposalFlag.SPONSORED),
            "the proposal has not been sponsored yet"
        );

        require(
            !dao.getProposalFlag(
                proposalId,
                DaoRegistry.ProposalFlag.PROCESSED
            ),
            "the proposal has already been processed"
        );

        require(
            voteValue < 3 && voteValue > 0,
            "only yes (1) and no (2) are possible values"
        );

        Voting storage vote = votes[address(dao)][proposalId];
        // slither-disable-next-line timestamp
        require(
            vote.startingTime > 0,
            "this proposalId has no vote going on at the moment"
        );
        // slither-disable-next-line timestamp
        require(block.timestamp < vote.stopTime, "vote has already ended");

        address memberAddr = dao.getAddressIfDelegated(msg.sender);

        require(vote.votes[memberAddr] == 0, "member has already voted");
        uint128 votingWeight = GovernanceHelper.getFlexVotingWeight(
            dao,
            msg.sender
        );
        voteWeights[address(dao)][proposalId][msg.sender] = votingWeight;
        vote.votes[memberAddr] = voteValue;

        if (voteValue == 1) {
            vote.nbYes += votingWeight;
        } else if (voteValue == 2) {
            vote.nbNo += votingWeight;
        }

        // 0. - YES / (YES + NO) > X%
        // 1. - YES - NO > X
        // uint256 supportType = dao.getConfiguration(
        //     DaoHelper.FLEX_VOTING_SUPPORT_TYPE
        // );
        // 0. - (YES + NO) / Total > X%
        // 1. - YES + NO > X
        // uint256 quorumType = dao.getConfiguration(
        //     DaoHelper.FLEX_VOTING_QUORUM_TYPE
        // );
        // console.log("getAllGovernorWeight(dao) ", getAllGovernorWeight(dao));
        // console.log("vote.nbYes + vote.nbNo ", vote.nbYes + vote.nbNo);
        // console.log("vote.nbYes ", vote.nbYes);
        // console.log("vote.nbNo ", vote.nbNo);

        uint256 currentQuorum = dao.getConfiguration(
            DaoHelper.FLEX_VOTING_QUORUM_TYPE
        ) == 1
            ? (vote.nbYes + vote.nbNo)
            : ((vote.nbYes + vote.nbNo) * 100) /
                (
                    getAllGovernorWeight(dao) == 0
                        ? 1
                        : getAllGovernorWeight(dao)
                );

        uint256 currentSupport = dao.getConfiguration(
            DaoHelper.FLEX_VOTING_SUPPORT_TYPE
        ) == 1
            ? (vote.nbYes < vote.nbNo ? 0 : (vote.nbYes - vote.nbNo))
            : (vote.nbYes * 100) /
                ((vote.nbYes + vote.nbNo) == 0 ? 1 : (vote.nbYes + vote.nbNo));

        // console.log("currentQuorum ", currentQuorum);
        // console.log("currentSupport ", currentSupport);

        emit SubmitVote(
            address(dao),
            proposalId,
            block.timestamp,
            vote.startingTime,
            vote.stopTime,
            msg.sender,
            voteValue,
            vote.nbYes,
            vote.nbNo,
            currentQuorum,
            currentSupport
        );
    }

    /**
     * @notice Computes the voting result based on a proposal.
     * @param dao The DAO address.
     * @param proposalId The proposal that needs to have the votes computed.
     * @return state
     * The possible results are:
     * 0: has not started
     * 1: tie
     * 2: pass
     * 3: not pass
     * 4: in progress
     */
    function voteResult(
        DaoRegistry dao,
        bytes32 proposalId
    )
        external
        view
        override
        returns (VotingState state, uint256 nbYes, uint256 nbNo)
    {
        Voting storage vote = votes[address(dao)][proposalId];

        if (vote.startingTime == 0) {
            return (VotingState.NOT_STARTED, 0, 0);
        }

        if (
            // slither-disable-next-line timestamp
            block.timestamp < vote.stopTime
        ) {
            return (VotingState.IN_PROGRESS, 0, 0);
        }
        // 0. - YES / (YES + NO) > X%
        // 1. - YES - NO > X
        uint256 supportType = dao.getConfiguration(
            DaoHelper.FLEX_VOTING_SUPPORT_TYPE
        );
        // 0. - (YES + NO) / Total > X%
        // 1. - YES + NO > X
        uint256 quorumType = dao.getConfiguration(
            DaoHelper.FLEX_VOTING_QUORUM_TYPE
        );
        uint128 allWeight = getAllGovernorWeight(dao);

        if (quorumType == 0) {
            uint256 minVotes = (allWeight *
                dao.getConfiguration(DaoHelper.QUORUM)) / 100;

            unchecked {
                uint256 totalvotes = vote.nbYes + vote.nbNo;
                if (totalvotes <= minVotes)
                    return (VotingState.NOT_PASS, vote.nbYes, vote.nbNo);
            }
        }
        if (quorumType == 1) {
            uint256 totalvotes = vote.nbYes + vote.nbNo;
            if (totalvotes <= dao.getConfiguration(DaoHelper.QUORUM))
                return (VotingState.NOT_PASS, vote.nbYes, vote.nbNo);
        }

        // supermajority check
        if (supportType == 0) {
            uint256 totalvotes = vote.nbYes + vote.nbNo;
            uint256 minYes = (totalvotes *
                dao.getConfiguration(DaoHelper.SUPER_MAJORITY)) / 100;
            if (minYes == 0 && vote.nbYes == 0) {
                return (VotingState.TIE, vote.nbYes, vote.nbNo);
            }

            if (vote.nbYes <= minYes)
                return (VotingState.NOT_PASS, vote.nbYes, vote.nbNo);
        }
        if (supportType == 1) {
            uint256 nbYN = vote.nbYes >= vote.nbNo ? vote.nbYes - vote.nbNo : 0;
            if (nbYN <= dao.getConfiguration(DaoHelper.SUPER_MAJORITY))
                return (VotingState.NOT_PASS, vote.nbYes, vote.nbNo);
        }

        return (VotingState.PASS, vote.nbYes, vote.nbNo);
    }

    function checkIfVoted(
        DaoRegistry dao,
        bytes32 proposalId,
        address voterAddr
    ) external view returns (bool) {
        Voting storage vote = votes[address(dao)][proposalId];
        if (vote.votes[voterAddr] == 0) {
            return false;
        } else {
            return true;
        }
    }

    function getAllGovernorWeight(
        DaoRegistry dao
    ) public view returns (uint128) {
        uint128 allWeight = GovernanceHelper.getAllFlexGovernorVotingWeight(
            dao
        );
        return allWeight;
    }

    function getAllGovernorWeightByProposalId(
        DaoRegistry dao,
        bytes32 proposalId
    ) public view returns (uint128) {
        uint128 allWeight = GovernanceHelper
            .getAllFlexGovernorVotingWeightByProposalId(dao, proposalId);
        return allWeight;
    }

    function getVotingWeight(
        DaoRegistry dao,
        address account
    ) public view returns (uint128) {
        return GovernanceHelper.getFlexVotingWeight(dao, account);
    }

    function getFlexVotingWeightToBeAllocated(
        DaoRegistry dao,
        uint256 alloc
    ) external view returns (uint128) {
        return GovernanceHelper.getFlexVotingWeightToBeAllocated(dao, alloc);
    }
}
