pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "../../helpers/DaoHelper.sol";
import "../../utils/TypeConver.sol";
import "./VintageVoting.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "../../guards/RaiserGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "hardhat/console.sol";

contract VintageSetRiceReceiverProposalAdapterContract is
    Reimbursable,
    MemberGuard,
    GovernorGuard
{
    using EnumerableSet for EnumerableSet.Bytes32Set;

    enum ProposalState {
        Voting,
        Executing,
        Done,
        Failed
    }

    struct ProposalDetails {
        address proposer;
        address riceReceiver;
        uint256 creationTime;
        uint256 stopVoteTime;
        ProposalState state;
    }

    event ProposalCreated(
        address daoAddr,
        bytes32 proposalId,
        address riceReceiver,
        uint256 creationTime,
        uint256 stopVoteTime
    );
    event ProposalProcessed(
        address daoAddr,
        bytes32 proposalId,
        ProposalState state,
        uint256 voteResult,
        uint128 allVotingWeight,
        uint128 nbYes,
        uint128 nbNo
    );

    error PROPOSAL_ALREADY_PROCESSED();
    error ADAPTER_NOT_FOUND();
    error PROPOSAL_NOT_VOTED_YET();
    // proposals per dao
    mapping(DaoRegistry => mapping(bytes32 => ProposalDetails))
        public proposals;
    mapping(address => EnumerableSet.Bytes32Set) unDoneProposals;

    function submitProposal(
        DaoRegistry dao,
        address riceReceiver
    ) external onlyGovernor(dao) reimbursable(dao) {
        dao.increaseRiceReceiverId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "SetRiceReceiver#",
                Strings.toString(dao.getCurrentRiceReceiverId())
            )
        );

        proposals[dao][proposalId] = ProposalDetails(
            msg.sender,
            riceReceiver,
            block.timestamp,
            block.timestamp + dao.getConfiguration(DaoHelper.VOTING_PERIOD),
            ProposalState.Voting
        );

        dao.submitProposal(proposalId);

        IVintageVoting votingContract = IVintageVoting(
            dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );
        votingContract.startNewVotingForProposal(
            dao,
            proposalId,
            block.timestamp,
            bytes("")
        );

        dao.sponsorProposal(proposalId, address(votingContract));
        unDoneProposals[address(dao)].add(proposalId);

        emit ProposalCreated(
            address(dao),
            proposalId,
            riceReceiver,
            block.timestamp,
            block.timestamp + dao.getConfiguration(DaoHelper.VOTING_PERIOD)
        );
    }

    function processProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        ProposalDetails storage proposal = proposals[dao][proposalId];

        if (dao.getProposalFlag(proposalId, DaoRegistry.ProposalFlag.PROCESSED))
            revert PROPOSAL_ALREADY_PROCESSED();

        IVintageVoting vintageVotingContract = IVintageVoting(
            dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );

        if (address(vintageVotingContract) == address(0))
            revert ADAPTER_NOT_FOUND();

        IVintageVoting.VotingState voteResult;
        uint128 nbYes;
        uint128 nbNo;
        (voteResult, nbYes, nbNo) = vintageVotingContract.voteResult(
            dao,
            proposalId
        );

        dao.processProposal(proposalId);

        uint128 allGPsWeight = GovernanceHelper
            .getVintageAllGovernorVotingWeightByProposalId(dao, proposalId);

        if (voteResult == IVintageVoting.VotingState.PASS) {
            proposal.state = ProposalState.Executing;

            dao.setAddressConfiguration(
                DaoHelper.RICE_REWARD_RECEIVER,
                proposal.riceReceiver
            );

            proposal.state = ProposalState.Done;
        } else if (
            voteResult == IVintageVoting.VotingState.NOT_PASS ||
            voteResult == IVintageVoting.VotingState.TIE
        ) {
            proposal.state = ProposalState.Failed;
        } else {
            revert PROPOSAL_NOT_VOTED_YET();
        }
        if (unDoneProposals[address(dao)].contains(proposalId))
            unDoneProposals[address(dao)].remove(proposalId);

        emit ProposalProcessed(
            address(dao),
            proposalId,
            proposal.state,
            uint256(voteResult),
            allGPsWeight,
            nbYes,
            nbNo
        );
    }

    function allDone(DaoRegistry dao) external view returns (bool) {
        return unDoneProposals[address(dao)].length() > 0 ? false : true;
    }
}
