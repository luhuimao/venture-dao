pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "../../guards/MemberGuard.sol";
import "../../guards/AdapterGuard.sol";
import "../../guards/FlexPollsterGuard.sol";
import "./interfaces/IFlexVoting.sol";
import "../../helpers/DaoHelper.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
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

contract FlexPollingVotingContract is
    IFlexVoting,
    MemberGuard,
    AdapterGuard,
    Reimbursable,
    FlexPollsterGuard
{
    using EnumerableSet for EnumerableSet.AddressSet;

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
        uint256 currentSupportf
    );
    struct Voting {
        uint256 nbYes;
        uint256 nbNo;
        uint256 startingTime;
        uint256 stopTime;
        mapping(address => uint256) votes;
    }
    mapping(address => EnumerableSet.AddressSet) pollsterWhiteList;
    mapping(address => mapping(bytes32 => Voting)) public votes;

    string public constant ADAPTER_NAME = "FlexPollingVotingContract";

    function registerPollsterWhiteList(
        DaoRegistry dao,
        address account
    ) external onlyMember(dao) {
        if (!pollsterWhiteList[address(dao)].contains(account)) {
            pollsterWhiteList[address(dao)].add(account);
        }
    }

    /**
     * @notice returns the adapter name. Useful to identify wich voting adapter is actually configurated in the DAO.
     */
    function getAdapterName() external pure override returns (string memory) {
        return ADAPTER_NAME;
    }

    function isPollsterWhiteList(
        DaoRegistry dao,
        address account
    ) external view returns (bool) {
        return pollsterWhiteList[address(dao)].contains(account);
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
    function submitVote(
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
        uint128 votingWeight = GovernanceHelper.getFlexPollVotingWeight(
            dao,
            msg.sender
        );
        vote.votes[memberAddr] = voteValue;

        if (voteValue == 1) {
            vote.nbYes += votingWeight;
        } else if (voteValue == 2) {
            vote.nbNo += votingWeight;
        }
        uint256 currentQuorum = vote.nbYes + vote.nbNo;
        uint256 currentSupport = vote.nbNo > vote.nbYes
            ? 0
            : vote.nbYes - vote.nbNo;
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

        uint256 votes = vote.nbYes + vote.nbNo;
        if (votes <= dao.getConfiguration(DaoHelper.FLEX_POLLING_QUORUM))
            return (VotingState.NOT_PASS, vote.nbYes, vote.nbNo);

        uint256 nbYN = vote.nbYes >= vote.nbNo ? vote.nbYes - vote.nbNo : 0;
        if (nbYN <= dao.getConfiguration(DaoHelper.FLEX_POLLING_SUPER_MAJORITY))
            return (VotingState.NOT_PASS, vote.nbYes, vote.nbNo);

        return (VotingState.PASS, vote.nbYes, vote.nbNo);
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

     function getVotingWeight(
        DaoRegistry dao,
        address account
    ) public view returns (uint128) {
        return GovernanceHelper.getFlexPollVotingWeight(dao, account);
    }
}
