pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT
import "../../helpers/DaoHelper.sol";
import "../../core/DaoRegistry.sol";
import "../../helpers/DaoHelper.sol";
import "../../utils/TypeConver.sol";
import "./CollectiveVotingAdapter.sol";
import "../extensions/CollectiveFundingPool.sol";
import "./interfaces/ICollectiveVoting.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";
import "../../guards/RaiserGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract ColletiveExpenseProposalAdapterContract is
    GovernorGuard,
    Reimbursable
{
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct ProposalDetail {
        address tokenAddress;
        uint256 amount;
        address receiver;
        uint256 creationTime;
        uint256 stopVoteTime;
        ProposalState state;
    }

    mapping(address => mapping(bytes32 => ProposalDetail)) public proposals;
    mapping(address => EnumerableSet.Bytes32Set) unDoneProposals;

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

    error INSUFFICIENT_FUND();

    function summbitProposal(
        DaoRegistry dao,
        address token,
        address receiver,
        uint256 amount
    ) external onlyGovernor(dao) reimbursable(dao) {
        CollectiveInvestmentPoolExtension poolExt = CollectiveInvestmentPoolExtension(
                dao.getExtensionAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT
                )
            );

        if (
            poolExt.balanceOfToken(
                address(DaoHelper.DAOSQUARE_TREASURY),
                token
            ) < amount
        ) revert INSUFFICIENT_FUND();

        dao.increaseExpenseId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "Expense#",
                Strings.toString(dao.getCurrentExpenseProposalId())
            )
        );
        proposals[address(dao)][proposalId] = ProposalDetail(
            token,
            amount,
            receiver,
            block.timestamp,
            block.timestamp + dao.getConfiguration(DaoHelper.VOTING_PERIOD),
            ProposalState.Voting
        );

        dao.submitProposal(proposalId);

        ICollectiveVoting votingContract = ICollectiveVoting(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
        );
        votingContract.startNewVotingForProposal(dao, proposalId, bytes(""));

        dao.sponsorProposal(proposalId, address(votingContract));
        unDoneProposals[address(dao)].add(proposalId);

        emit ProposalCreated(address(dao), proposalId);
    }

    function processProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
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
            proposal.state = ProposalState.Executing;

            proposal.state = ProposalState.Done;
        } else if (
            voteResult == ICollectiveVoting.VotingState.NOT_PASS ||
            voteResult == ICollectiveVoting.VotingState.TIE
        ) {
            proposal.state = ProposalState.Failed;
        } else {
            revert("proposal has not been voted on yet");
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
    }

    function allDone(DaoRegistry dao) external view returns (bool) {
        return unDoneProposals[address(dao)].length() > 0 ? false : true;
    }
}
