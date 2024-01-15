pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "../../helpers/DaoHelper.sol";
import "../../guards/RaiserGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/ICollectiveVoting.sol";
import "../../helpers/GovernanceHelper.sol";
import "./CollectiveFundingPoolAdapter.sol";

contract ColletiveTopUpProposalAdapterContract is GovernorGuard, Reimbursable {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct ProposalDetail {
        address account;
        address token;
        uint256 amount;
        uint256 creationTime;
        uint256 stopVoteTime;
        ProposalState state;
    }

    enum ProposalState {
        Submitted,
        Voting,
        Executing,
        Done,
        Failed
    }

    event ProposalCreated(address daoAddr, bytes32 proposalId);
    event StartVoting(address daoAddr, bytes32 proposalId, ProposalState state);
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
        address token,
        uint256 amount
    ) external onlyGovernor(dao) reimbursable(dao) {
        dao.increaseTopupId();
        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "TopUp#",
                Strings.toString(dao.getCurrentTopupProposalId())
            )
        );
        proposals[address(dao)][proposalId] = ProposalDetail(
            msg.sender,
            token,
            amount,
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

    function startVoting(DaoRegistry dao, bytes32 proposalId) external {
        ProposalDetail storage proposal = proposals[address(dao)][proposalId];
        require(proposal.state == ProposalState.Submitted, "!Submitted");

        if (
            IERC20(proposal.token).allowance(
                proposal.account,
                dao.getAdapterAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER
                )
            ) >= proposal.amount
        ) {
            ICollectiveVoting votingContract = ICollectiveVoting(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
            );
            votingContract.startNewVotingForProposal(
                dao,
                proposalId,
                bytes("")
            );
            proposal.state = ProposalState.Voting;
        } else {
            proposal.state = ProposalState.Failed;
        }

        emit StartVoting(address(dao), proposalId, proposal.state);
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
            ColletiveFundingPoolAdapterContract fundingPoolAdapt = ColletiveFundingPoolAdapterContract(
                    dao.getAdapterAddress(
                        DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER
                    )
                );
            fundingPoolAdapt.topupFunds(
                dao,
                proposal.token,
                proposal.account,
                proposal.amount
            );
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
        return true;
    }
}
