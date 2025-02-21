pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "../../guards/RaiserGuard.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "../../helpers/DaoHelper.sol";
import "./interfaces/ICollectiveVoting.sol";
import "../../helpers/GovernanceHelper.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract ColletiveRePlaceAdapterProposalAdapterContract is
    GovernorGuard,
    Reimbursable
{
    using EnumerableSet for EnumerableSet.Bytes32Set;

    enum ProposalState {
        Submitted,
        Voting,
        Executing,
        Done,
        Failed
    }

    error VOTE_NOT_START();
    error UNDONE_INVESTMENT_PROPOSAL();
    error UNDONE_DAOSET_PROPOSAL();
    error UNDONE_FUND_RAISE_PROPOSAL();
    error UNDONE_GOV_MANAGEMENT_PROPOSAL();
    error UNDONE_TOP_UP_PROPOSAL();

    struct ProposalDetail {
        address newAdapterAddress;
        bytes32 adapterId;
        uint128 acl;
        uint256 creationTime;
        uint256 stopVoteTime;
        ProposalState state;
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

    mapping(address => mapping(bytes32 => ProposalDetail)) public proposals;
    mapping(address => EnumerableSet.Bytes32Set) unDoneProposals;

    function summbitProposal(
        DaoRegistry dao,
        address newAdapterAddress,
        bytes32 adapterId,
        uint128 acl
    ) external onlyGovernor(dao) reimbursable(dao) {
        if (
            !ColletiveDaoSetProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_DAO_SET_ADAPTER)
            ).isProposalAllDone(dao)
        ) revert UNDONE_DAOSET_PROPOSAL();
        if (
            !ColletiveFundingProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUNDING_ADAPTER)
            ).allDone(dao)
        ) revert UNDONE_INVESTMENT_PROPOSAL();

        if (
            !ColletiveFundRaiseProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUND_RAISE_ADAPTER)
            ).allDone(dao)
        ) revert UNDONE_FUND_RAISE_PROPOSAL();

        if (
            !ColletiveGovernorManagementAdapterContract(
                dao.getAdapterAddress(
                    DaoHelper.COLLECTIVE_GOVERNOR_MANAGEMENT_ADAPTER
                )
            ).allDone(dao)
        ) revert UNDONE_GOV_MANAGEMENT_PROPOSAL();

        if (
            !ColletiveTopUpProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_TOPUP_ADAPTER)
            ).allDone(dao)
        ) revert UNDONE_TOP_UP_PROPOSAL();

        dao.increaseTopupId();
        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "RePAdapt#",
                Strings.toString(dao.getCurrentTopupProposalId())
            )
        );
        proposals[address(dao)][proposalId] = ProposalDetail(
            newAdapterAddress,
            adapterId,
            acl,
            block.timestamp,
            0,
            ProposalState.Submitted
        );

        dao.submitProposal(proposalId);

        dao.sponsorProposal(
            proposalId,
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
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
            dao.replaceAdapter(
                proposal.adapterId,
                proposal.newAdapterAddress,
                proposal.acl,
                new bytes32[](0),
                new uint256[](0)
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
}
