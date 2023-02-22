pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
// import "../../extensions/bank/Bank.sol";
import "../../guards/MemberGuard.sol";
import "../../guards/AdapterGuard.sol";
import "../../guards/FlexPollsterGuard.sol";
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
    FlexPollsterGuard,
    Reimbursable
{
    struct Voting {
        uint256 nbYes;
        uint256 nbNo;
        uint256 startingTime;
        uint256 stopTime;
        mapping(address => uint256) votes;
    }

    bytes32 constant VotingPeriod = keccak256("voting.votingPeriod");
    bytes32 constant GracePeriod = keccak256("voting.gracePeriod");

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
            dao.getConfiguration(DaoHelper.FLEX_POLLING_VOTING_PERIOD);
    }

    function startNewVotingForNormalProposal(
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

    /**
     * @notice Submits a vote to the DAO Registry.
     * @notice Vote has to be submitted after the starting time defined in startNewVotingForProposal.
     * @notice The vote needs to be submitted within the voting period.
     * @notice A member can not vote twice or more.
     * @param dao The DAO address.
     * @param proposalId The proposal needs to be sponsored, and not processed.
     * @param voteValue Only Yes (1) and No (2) votes are allowed.
     */
    // The function is protected against reentrancy with the reimbursable modifier
    //slither-disable-next-line reentrancy-no-eth,reentrancy-benign
    function submitFundingVote(
        DaoRegistry dao,
        bytes32 proposalId,
        uint256 voteValue
    ) external onlyPollster(dao) reimbursable(dao) {
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

        vote.votes[memberAddr] = voteValue;

        if (voteValue == 1) {
            vote.nbYes += 1;
        } else if (voteValue == 2) {
            vote.nbNo += 1;
        }
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

        vote.votes[memberAddr] = voteValue;

        if (voteValue == 1) {
            vote.nbYes += 1;
        } else if (voteValue == 2) {
            vote.nbNo += 1;
        }
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
    function fundingVoteResult(
        DaoRegistry dao,
        bytes32 proposalId
    ) external view override returns (VotingState state) {
        Voting storage vote = votes[address(dao)][proposalId];

        if (vote.startingTime == 0) {
            return VotingState.NOT_STARTED;
        }

        if (
            // slither-disable-next-line timestamp
            block.timestamp < vote.stopTime
        ) {
            return VotingState.IN_PROGRESS;
        }

        if (
            vote.nbYes - vote.nbNo >
            dao.getConfiguration(DaoHelper.FLEX_POLLING_SUPER_MAJORITY)
        ) {
            return VotingState.PASS;
        } else {
            return VotingState.NOT_PASS;
        }
    }

    function voteResult(
        DaoRegistry dao,
        bytes32 proposalId
    ) external view override returns (VotingState state) {
        Voting storage vote = votes[address(dao)][proposalId];

        if (vote.startingTime == 0) {
            return VotingState.NOT_STARTED;
        }

        if (
            // slither-disable-next-line timestamp
            block.timestamp < vote.stopTime
        ) {
            return VotingState.IN_PROGRESS;
        }
        // stewards amount * quorum
        uint256 minVotes = ((dao.getNbMembers() - 2) *
            dao.getConfiguration(DaoHelper.QUORUM)) / 100;

        unchecked {
            uint256 votes = vote.nbYes + vote.nbNo;
            if (votes < minVotes) return VotingState.NOT_PASS;
        }

        // example: 7 yes, 2 no, supermajority = 66
        // ((7+2) * 66) / 100 = 5.94; 7 yes will pass
        uint256 minYes = ((vote.nbYes + vote.nbNo) *
            dao.getConfiguration(DaoHelper.SUPER_MAJORITY)) / 100;
        // not one vote or voting power is zero should return tie .20220908
        if (minYes == 0 && vote.nbYes == 0) {
            return VotingState.TIE;
        }
        if (vote.nbYes >= minYes) return VotingState.PASS;
        else return VotingState.NOT_PASS;
    }
}
