pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../guards/RaiserGuard.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../../helpers/DaoHelper.sol";
import "./interfaces/ICollectiveVoting.sol";
import "../../helpers/GovernanceHelper.sol";

contract ColletiveSetRiceReceiverProposalAdapterContract is
    GovernorGuard,
    Reimbursable
{
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct ProposalDetail {
        address riceReceiver;
        address proposer;
        uint256 creationTime;
        uint256 stopVoteTime;
        ProposalState state;
    }

    enum ProposalState {
        Voting,
        Executing,
        Done,
        Failed
    }

    event ProposalCreated(address daoAddr, bytes32 proposalId);
    event ProposalProcessed(
        address daoAddr,
        bytes32 proposalId,
        ProposalState state,
        uint256 voteResult,
        uint256 allVotingWeight,
        uint256 nbYes,
        uint256 nbNo
    );

    error VOTE_NOT_START();

    mapping(address => mapping(bytes32 => ProposalDetail)) public proposals;
    mapping(address => EnumerableSet.Bytes32Set) unDoneProposals;

    function summbitProposal(
        DaoRegistry dao,
        address riceReceiver
    ) external onlyGovernor(dao) reimbursable(dao) {
        // require(
        //     ColletiveDaoSetProposalAdapterContract(
        //         dao.getAdapterAddress(DaoHelper.COLLECTIVE_DAO_SET_ADAPTER)
        //     ).isProposalAllDone(dao),
        //     "DaoSet Proposal Undone"
        // );
        // if (
        //     !ColletiveFundingProposalAdapterContract(
        //         dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUNDING_ADAPTER)
        //     ).allDone(dao)
        // ) revert UNDONE_INVESTMENT_PROPOSAL();

        dao.increaseRiceReceiverId();
        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "SetRiceReceiver#",
                Strings.toString(dao.getCurrentRiceReceiverId())
            )
        );
        proposals[address(dao)][proposalId] = ProposalDetail(
            riceReceiver,
            msg.sender,
            block.timestamp,
            block.timestamp + dao.getConfiguration(DaoHelper.VOTING_PERIOD),
            ProposalState.Voting
        );

        dao.submitProposal(proposalId);

        dao.sponsorProposal(
            proposalId,
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
        );
        ICollectiveVoting collectiveVotingContract = ICollectiveVoting(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
        );
        collectiveVotingContract.startNewVotingForProposal(
            dao,
            proposalId,
            bytes("")
        );

        unDoneProposals[address(dao)].add(proposalId);

        emit ProposalCreated(address(dao), proposalId);
    }

    function processProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) returns (bool) {
        ProposalDetail storage proposal = proposals[address(dao)][proposalId];

        require(
            !dao.getProposalFlag(
                proposalId,
                DaoRegistry.ProposalFlag.PROCESSED
            ),
            "proposal already processed"
        );
        ICollectiveVoting collectiveVotingContract = ICollectiveVoting(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
        );

        require(
            address(collectiveVotingContract) != address(0),
            "adapter not found"
        );

        ICollectiveVoting.VotingState voteResult;
        uint256 nbYes;
        uint256 nbNo;
        (voteResult, nbYes, nbNo) = collectiveVotingContract.voteResult(
            dao,
            proposalId
        );
        uint128 allWeight = GovernanceHelper
            .getAllCollectiveGovernorVotingWeight(dao);

        dao.processProposal(proposalId);

        if (voteResult == ICollectiveVoting.VotingState.PASS) {
            dao.setAddressConfiguration(
                DaoHelper.RICE_REWARD_RECEIVER,
                proposal.riceReceiver
            );
            proposal.state = ProposalState.Done;
        } else if (
            voteResult == ICollectiveVoting.VotingState.NOT_PASS ||
            voteResult == ICollectiveVoting.VotingState.TIE
        ) {
            proposal.state = ProposalState.Failed;
        } else {
            revert VOTE_NOT_START();
        }
        if (unDoneProposals[address(dao)].contains(proposalId))
            unDoneProposals[address(dao)].remove(proposalId);

        emit ProposalProcessed(
            address(dao),
            proposalId,
            proposal.state,
            allWeight,
            nbYes,
            nbNo,
            uint256(voteResult)
        );

        return true;
    }

    function allDone(DaoRegistry dao) external view returns (bool) {
        return unDoneProposals[address(dao)].length() > 0 ? false : true;
    }
}
