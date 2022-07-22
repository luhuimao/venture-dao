pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../core/DaoRegistry.sol";
import "../guards/AdapterGuard.sol";
import "./modifiers/Reimbursable.sol";
import "./interfaces/IGPKick.sol";
import "../adapters/interfaces/IGPOnboardingVoting.sol";
import "../helpers/DaoHelper.sol";
import "../extensions/gpdao/GPDao.sol";
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

contract GPKickAdapterContract is IGPKick, AdapterGuard, Reimbursable {
    // State of the gp kick proposal
    struct GPKick {
        // The address of the GP to kick out of the DAO.
        address gpToKick;
    }

    event ProposalCreated(bytes32 proposalId, address gpToKick);
    event ProposalProcessed(
        bytes32 proposalId,
        IGPOnboardingVoting.VotingState voteRelsult
    );
    // Keeps track of all the kicks executed per DAO.
    mapping(address => mapping(bytes32 => GPKick)) public kicks;

    /**
     * @notice Creates a gp kick proposal, opens it for voting, and sponsors it.
     * @dev A member can not kick himself.
     * @dev Only one kick per DAO can be executed at time.
     * @dev Only members that have units or loot can be kicked out.
     * @dev Proposal ids can not be reused.
     * @param dao The dao address.
     * @param proposalId The guild kick proposal id.
     * @param gpToKick The gp address that should be kicked out of the DAO.
     */
    // slither-disable-next-line reentrancy-benign
    function submitProposal(
        DaoRegistry dao,
        bytes32 proposalId,
        address gpToKick,
        DaoHelper.VoteType voteType
    ) external override reimbursable(dao) {
        IGPOnboardingVoting gpVotingContract = IGPOnboardingVoting(
            dao.getAdapterAddress(DaoHelper.GPONBOARDVOTING_ADAPT)
        );
        GPDaoExtension gpdao = GPDaoExtension(
            dao.getExtensionAddress(DaoHelper.GPDAO_EXT)
        );
        require(
            gpToKick != address(0x0) && gpToKick != gpdao.sponsor(),
            "GPKick::submitProposal::gpToKick address invalid"
        );
        address submittedBy = gpVotingContract.getSenderAddress(
            dao,
            address(this),
            bytes(""),
            msg.sender
        );
        // Checks if the sender address is not the same as the member to kick to prevent auto kick.
        require(
            submittedBy != gpToKick,
            "GPKick::submitProposal::use ragequit"
        );
        //set vote type
        dao.setVoteType(proposalId, uint32(voteType));
        // Creates a guild kick proposal.
        dao.submitProposal(proposalId);

        // Saves the state of the gp kick proposal.
        kicks[address(dao)][proposalId] = GPKick(gpToKick);

        // Starts the voting process for the gp kick proposal.
        gpVotingContract.startNewVotingForProposal(dao, proposalId, bytes(""));

        // dao.jailMember(kicks[address(dao)][proposalId].memberToKick);

        // Sponsors the guild kick proposal.
        dao.sponsorProposal(proposalId, submittedBy, address(gpVotingContract));

        emit ProposalCreated(proposalId, gpToKick);
    }

    /**
     * @notice Process the guild kick proposal
     * @dev Only active members can be kicked out.
     * @param dao The dao address.
     * @param proposalId The guild kick proposal id.
     */
    function processProposal(DaoRegistry dao, bytes32 proposalId)
        external
        override
        reimbursable(dao)
    {
        dao.processProposal(proposalId);

        // Checks if the proposal has passed.
        IGPOnboardingVoting votingContract = IGPOnboardingVoting(
            dao.votingAdapter(proposalId)
        );
        require(address(votingContract) != address(0), "adapter not found");
        IGPOnboardingVoting.VotingState votingState = votingContract.voteResult(
            dao,
            proposalId
        );
        if (votingState == IGPOnboardingVoting.VotingState.PASS) {
            GPDaoExtension gpdao = GPDaoExtension(
                dao.getExtensionAddress(DaoHelper.GPDAO_EXT)
            );
            gpdao.removeGneralPartner(kicks[address(dao)][proposalId].gpToKick);
            // GuildKickHelper.rageKick(
            //     dao,
            //     kicks[address(dao)][proposalId].memberToKick
            // );
        } else if (
            votingState == IGPOnboardingVoting.VotingState.NOT_PASS ||
            votingState == IGPOnboardingVoting.VotingState.TIE
        ) {
            // dao.unjailMember(kicks[address(dao)][proposalId].memberToKick);
        } else {
            revert("voting is still in progress");
        }

        emit ProposalProcessed(proposalId, votingState);
    }
}