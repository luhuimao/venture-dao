pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../core/DaoRegistry.sol";
import "../extensions/gpdao/GPDao.sol";
import "../adapters/interfaces/IGPOnboardingVoting.sol";
import "../adapters/modifiers/Reimbursable.sol";
import "../guards/AdapterGuard.sol";
import "../helpers/DaoHelper.sol";
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

contract GPDaoOnboardingAdapterContract is
    AdapterGuard,
    Reimbursable,
    MemberGuard
{
    enum ProposalState {
        Voting,
        Executing,
        Done,
        Failed
    }
    struct ProposalDetails {
        bytes32 id;
        address applicant;
        uint256 creationTime;
        uint256 stopVoteTime;
        ProposalState state;
    }

    event ProposalCreated(
        bytes32 proposalId,
        address applicant,
        uint256 creationTime,
        uint256 stopVoteTime
    );
    event ProposalProcessed(
        bytes32 proposalId,
        IGPOnboardingVoting.VotingState voteRelsult,
        ProposalState state,
        uint128 nbYes,
        uint128 nbNo
    );

    // proposals per dao
    mapping(DaoRegistry => mapping(bytes32 => ProposalDetails))
        public proposals;
    // vote types for proposal
    // mapping(bytes32 => DaoHelper.VoteType) public proposalVoteTypes;

    // string constant PROPOSALID_PREFIX = "TMP";
    uint256 public proposalIds = 100000;

    /**
     * @notice Updates the DAO registry with the new configurations if valid.
     * @notice Updated the Bank extension with the new potential tokens if valid.
     */
    function configureDao(
        DaoRegistry dao,
        uint32 quorum,
        uint32 superMajority
    ) external onlyAdapter(dao) {
        require(
            quorum <= 100 &&
                quorum >= 1 &&
                superMajority >= 1 &&
                superMajority <= 100,
            "GPDaoOnboarding::configureDao::invalid quorum, superMajority"
        );
        dao.setConfiguration(DaoHelper.QUORUM, quorum);
        dao.setConfiguration(DaoHelper.SUPER_MAJORITY, superMajority);
    }

    /**
     * @notice Submits and sponsors the proposal. Only members can call this function.
     * @param applicant The applicant address.
     */
    // slither-disable-next-line reentrancy-benign
    function submitProposal(DaoRegistry dao, address applicant)
        external
        reimbursable(dao)
        onlyGeneralPartner(dao)
        returns (bytes32 proposalId)
    {
        require(
            DaoHelper.isNotReservedAddress(applicant),
            "applicant is reserved address"
        );
        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked("TMP", Strings.toString(proposalIds))
        );

        uint256 startVoteTime = block.timestamp;
        uint256 stopVoteTime = startVoteTime +
            dao.getConfiguration(DaoHelper.PROPOSAL_DURATION);

        _submitMembershipProposal(
            dao,
            proposalId,
            applicant,
            startVoteTime,
            stopVoteTime
        );

        _sponsorProposal(dao, proposalId, bytes(""));
        proposalIds += 1;

        emit ProposalCreated(
            proposalId,
            applicant,
            startVoteTime,
            stopVoteTime
        );
    }

    /**
     * @notice Once the vote on a proposal is finished, it is time to process it. Anybody can call this function.
     * @param proposalId The proposal id to be processed. It needs to exist in the DAO Registry.
     */
    // slither-disable-next-line reentrancy-benign
    function processProposal(DaoRegistry dao, bytes32 proposalId)
        external
        reimbursable(dao)
    {
        ProposalDetails storage proposal = proposals[dao][proposalId];
        require(proposal.id == proposalId, "proposal does not exist");
        require(
            !dao.getProposalFlag(
                proposalId,
                DaoRegistry.ProposalFlag.PROCESSED
            ),
            "proposal already processed"
        );
        IGPOnboardingVoting votingContract = IGPOnboardingVoting(
            dao.votingAdapter(proposalId)
        );
        // IVoting votingContract = IVoting(dao.votingAdapter(proposalId));
        require(address(votingContract) != address(0), "adapter not found");

        IGPOnboardingVoting.VotingState voteResult;
        uint128 nbYes;
        uint128 nbNo;
        (voteResult, nbYes, nbNo) = votingContract.voteResult(dao, proposalId);

        dao.processProposal(proposalId);

        if (voteResult == IGPOnboardingVoting.VotingState.PASS) {
            proposal.state = ProposalState.Executing;
            address applicant = proposal.applicant;
            GPDaoExtension gpdao = GPDaoExtension(
                dao.getExtensionAddress(DaoHelper.GPDAO_EXT)
            );

            gpdao.registerGeneralPartner(applicant);
            proposal.state = ProposalState.Done;
        } else if (
            voteResult == IGPOnboardingVoting.VotingState.NOT_PASS ||
            voteResult == IGPOnboardingVoting.VotingState.TIE
        ) {
            proposal.state = ProposalState.Failed;
        } else {
            revert("proposal has not been voted on yet");
        }

        emit ProposalProcessed(
            proposalId,
            voteResult,
            proposal.state,
            nbYes,
            nbNo
        );
    }

    /**
     * @notice Starts a vote on the proposal to onboard a new member.
     * @param proposalId The proposal id to be processed. It needs to exist in the DAO Registry.
     */
    function _sponsorProposal(
        DaoRegistry dao,
        bytes32 proposalId,
        bytes memory data
    ) internal {
        IGPOnboardingVoting gpVotingContract = IGPOnboardingVoting(
            dao.getAdapterAddress(DaoHelper.GPONBOARDVOTING_ADAPT)
        );
        address sponsoredBy = gpVotingContract.getSenderAddress(
            dao,
            address(this),
            data,
            msg.sender
        );
        dao.sponsorProposal(proposalId, sponsoredBy, address(gpVotingContract));
        gpVotingContract.startNewVotingForProposal(dao, proposalId, data);
    }

    /**
     * @notice Marks the proposalId as submitted in the DAO and saves the information in the internal adapter state.
     * @notice Updates the total of units issued in the DAO, and checks if it is within the limits.
     */
    function _submitMembershipProposal(
        DaoRegistry dao,
        bytes32 proposalId,
        address applicant,
        uint256 startVoteTime,
        uint256 stopVoteTime
    ) internal {
        GPDaoExtension gpdao = GPDaoExtension(
            dao.getExtensionAddress(DaoHelper.GPDAO_EXT)
        );
        require(
            !gpdao.isGeneralPartner(applicant),
            "GPDaoOnboarding::submitProposal::applicant existed"
        );

        proposals[dao][proposalId] = ProposalDetails(
            proposalId,
            applicant,
            startVoteTime,
            stopVoteTime,
            ProposalState.Voting
        );

        dao.submitProposal(proposalId);
    }
}
