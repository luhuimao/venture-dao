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
import "./CollectiveDaoSetProposalAdapter.sol";
import "./CollectiveFundingProposalAdapter.sol";
import "../extensions/CollectiveFundingPool.sol";

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
    error UNDONE_INVESTMENT_PROPOSAL();

    mapping(address => mapping(bytes32 => ProposalDetail)) public proposals;
    mapping(address => EnumerableSet.Bytes32Set) unDoneProposals;

    function daosetProposalCheck(DaoRegistry dao) internal view returns (bool) {
        ColletiveDaoSetProposalAdapterContract daoset = ColletiveDaoSetProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_DAO_SET_ADAPTER)
            );
        return daoset.isProposalAllDone(dao);
        // return true;
    }

    function summbitProposal(
        DaoRegistry dao,
        address token,
        uint256 amount
    ) external onlyGovernor(dao) reimbursable(dao) {
        require(
            ColletiveDaoSetProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_DAO_SET_ADAPTER)
            ).isProposalAllDone(dao),
            "DaoSet Proposal Undone"
        );
        if (
            !ColletiveFundingProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUNDING_ADAPTER)
            ).allDone(dao)
        ) revert UNDONE_INVESTMENT_PROPOSAL();

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

    function startVoting(
        DaoRegistry dao,
        bytes32 proposalId
    ) external onlyGovernor(dao) {
        ProposalDetail storage proposal = proposals[address(dao)][proposalId];
        require(proposal.state == ProposalState.Submitted, "!Submitted");

        if (
            IERC20(proposal.token).allowance(proposal.account, address(this)) >=
            proposal.amount
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
            proposal.stopVoteTime =
                block.timestamp +
                dao.getConfiguration(DaoHelper.VOTING_PERIOD);
        } else {
            proposal.state = ProposalState.Failed;
            if (unDoneProposals[address(dao)].contains(proposalId))
                unDoneProposals[address(dao)].remove(proposalId);
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
            // ColletiveFundingPoolAdapterContract fundingPoolAdapt = ColletiveFundingPoolAdapterContract(
            //         dao.getAdapterAddress(
            //             DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER
            //         )
            //     );
            if (
                topupFunds(
                    dao,
                    proposal.token,
                    proposal.account,
                    proposal.amount
                )
            ) proposal.state = ProposalState.Done;
            else proposal.state = ProposalState.Failed;
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

    function topupFunds(
        DaoRegistry dao,
        address token,
        address account,
        uint256 amount
    ) internal returns (bool) {
        // if (IERC20(token).balanceOf(account) < amount)
        //     revert INSUFFICIENT_FUND();

        // if (IERC20(token).allowance(account, address(this)) < amount)
        //     revert INSUFFICIENT_ALLOWANCE();

        if (
            IERC20(token).balanceOf(account) < amount ||
            IERC20(token).allowance(account, address(this)) < amount
        ) return false;

        IERC20(token).transferFrom(account, address(this), amount);

        IERC20(token).approve(
            dao.getExtensionAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT),
            amount
        );

        CollectiveInvestmentPoolExtension(
            dao.getExtensionAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT)
        ).addToBalance(account, token, amount);

        return true;
    }

    function allDone(DaoRegistry dao) external view returns (bool) {
        return unDoneProposals[address(dao)].length() > 0 ? false : true;
    }
}
