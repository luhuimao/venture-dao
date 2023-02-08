pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../core/DaoRegistry.sol";
import "../guards/AdapterGuard.sol";
import "./modifiers/Reimbursable.sol";
import "./interfaces/IGPKick.sol";
import "./interfaces/IGPOnboardingVoting.sol";
import "./voting/GPOnboardingVoting.sol";
import "../helpers/DaoHelper.sol";
import "../extensions/gpdao/GPDao.sol";
import "../utils/TypeConver.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
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

contract GPKickAdapterContract is
    IGPKick,
    AdapterGuard,
    Reimbursable,
    RaiserGuard
{
    enum ProposalState {
        Voting,
        Executing,
        Done,
        Failed
    }
    // State of the gp kick proposal
    struct GPKickProposal {
        // The address of the GP to kick out of the DAO.
        address gpToKick;
        ProposalState state;
        uint256 creationTime;
        uint256 stopVoteTime;
    }

    event ProposalCreated(
        address daoAddr,
        bytes32 proposalId,
        address gpToKick,
        uint256 creationTime,
        uint256 stopVoteTime
    );
    event ProposalProcessed(
        address daoAddr,
        bytes32 proposalId,
        IGPOnboardingVoting.VotingState voteRelsult,
        ProposalState state,
        uint128 allVotingWeight,
        uint128 nbYes,
        uint128 nbNo
    );
    // Keeps track of all the kicks executed per DAO.
    mapping(address => mapping(bytes32 => GPKickProposal)) public kickProposals;
    uint256 public proposalIds = 1;

    /**
     * @notice Creates a gp kick proposal, opens it for voting, and sponsors it.
     * @dev A member can not kick himself.
     * @dev Only one kick per DAO can be executed at time.
     * @dev Only members that have units or loot can be kicked out.
     * @dev Proposal ids can not be reused.
     * @param dao The dao address.
     * @param gpToKick The gp address that should be kicked out of the DAO.
     */
    // slither-disable-next-line reentrancy-benign
    function submitProposal(DaoRegistry dao, address gpToKick)
        external
        override
        reimbursable(dao)
        onlyRaiser(dao)
    {
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
        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked("Raiser-Out#", Strings.toString(proposalIds))
        );

        // Creates a guild kick proposal.
        dao.submitProposal(proposalId);

        uint256 creationTime = block.timestamp;
        uint256 stopVoteTime = creationTime +
            dao.getConfiguration(DaoHelper.VOTING_PERIOD);

        // Saves the state of the gp kick proposal.
        kickProposals[address(dao)][proposalId] = GPKickProposal(
            gpToKick,
            ProposalState.Voting,
            creationTime,
            stopVoteTime
        );

        // Starts the voting process for the gp kick proposal.
        gpVotingContract.startNewVotingForProposal(dao, proposalId, bytes(""));

        // dao.jailMember(kicks[address(dao)][proposalId].memberToKick);

        // Sponsors the guild kick proposal.
        dao.sponsorProposal(proposalId, submittedBy, address(gpVotingContract));
        proposalIds += 1;

        emit ProposalCreated(
            address(dao),
            proposalId,
            gpToKick,
            creationTime,
            stopVoteTime
        );
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
        // IGPOnboardingVoting votingContract = IGPOnboardingVoting(
        //     dao.votingAdapter(proposalId)
        // );
        GPOnboardVotingContract votingContract = GPOnboardVotingContract(
            dao.votingAdapter(proposalId)
        );
        require(address(votingContract) != address(0), "adapter not found");
        IGPOnboardingVoting.VotingState votingState;
        uint128 nbYes;
        uint128 nbNo;
        uint128 allGPWeights = votingContract.getAllGPWeight(dao);

        (votingState, nbYes, nbNo) = votingContract.voteResult(dao, proposalId);
        GPKickProposal storage proposal = kickProposals[address(dao)][
            proposalId
        ];

        if (votingState == IGPOnboardingVoting.VotingState.PASS) {
            proposal.state = ProposalState.Executing;
            GPDaoExtension gpdao = GPDaoExtension(
                dao.getExtensionAddress(DaoHelper.GPDAO_EXT)
            );
            gpdao.removeGneralPartner(
                kickProposals[address(dao)][proposalId].gpToKick
            );
            proposal.state = ProposalState.Done;
            // GuildKickHelper.rageKick(
            //     dao,
            //     kicks[address(dao)][proposalId].memberToKick
            // );
        } else if (
            votingState == IGPOnboardingVoting.VotingState.NOT_PASS ||
            votingState == IGPOnboardingVoting.VotingState.TIE
        ) {
            // dao.unjailMember(kicks[address(dao)][proposalId].memberToKick);
            proposal.state = ProposalState.Failed;
        } else {
            revert("voting is still in progress");
        }

        emit ProposalProcessed(
            address(dao),
            proposalId,
            votingState,
            proposal.state,
            allGPWeights,
            nbYes,
            nbNo
        );
    }
}
