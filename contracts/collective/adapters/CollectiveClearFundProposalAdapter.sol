pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../../guards/RaiserGuard.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "./interfaces/ICollectiveVoting.sol";
import "./CollectiveFundingPoolAdapter.sol";
import "./CollectiveDaoSetProposalAdapter.sol";
import "./CollectiveExpenseProposalAdapter.sol";
import "./CollectiveFundingProposalAdapter.sol";
import "./CollectiveFundRaiseProposalAdapter.sol";
import "./CollectiveGovernorManagementAdapter.sol";
import "./CollectiveTopUpProposalAdapter.sol";
import "./CollectiveVotingAdapter.sol";

// SPDX-License-Identifier: MIT

contract ColletiveClearFundProposalAdapterContract is
    GovernorGuard,
    Reimbursable
{
    using EnumerableSet for EnumerableSet.Bytes32Set;
    error VOTE_NOT_START();
    error UNDONE_OPERATION_PROPOSALS();
    error UNDONE_DAOSETTING_PROPOSALS();
    error UNDONE_PRE_CLEAR_FUND_PROPOSAL();
    enum ProposalState {
        Voting,
        Executing,
        Done,
        Failed
    }

    struct ClearFundProposalDatail {
        bytes32 proposalId;
        address proposor;
        uint256 creationTime;
        uint256 stopVoteTime;
        ProposalState state;
    }

    mapping(address => bytes32) public ongoingClearFundProposal;
    mapping(address => EnumerableSet.Bytes32Set) unDoneProposals;
    mapping(address => mapping(bytes32 => ClearFundProposalDatail))
        public proposals;

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

    function undoneOperationProposalsCheck(DaoRegistry dao) internal view {
        ColletiveExpenseProposalAdapterContract expenseContr = ColletiveExpenseProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_EXPENSE_ADAPTER)
            );
        ColletiveFundingProposalAdapterContract fundingContr = ColletiveFundingProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUNDING_ADAPTER)
            );
        ColletiveFundRaiseProposalAdapterContract fundRaiseContrc = ColletiveFundRaiseProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUND_RAISE_ADAPTER)
            );
        ColletiveGovernorManagementAdapterContract governorContrc = ColletiveGovernorManagementAdapterContract(
                dao.getAdapterAddress(
                    DaoHelper.COLLECTIVE_GOVERNOR_MANAGEMENT_ADAPTER
                )
            );
        ColletiveTopUpProposalAdapterContract topupContrc = ColletiveTopUpProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_TOPUP_ADAPTER)
            );

        if (
            !expenseContr.allDone(dao) ||
            !fundingContr.allDone(dao) ||
            !fundRaiseContrc.allDone(dao) ||
            !governorContrc.allDone(dao) ||
            !topupContrc.allDone(dao)
        ) revert UNDONE_OPERATION_PROPOSALS();
    }

    function daosetProposalCheck(DaoRegistry dao) internal view {
        ColletiveDaoSetProposalAdapterContract daoset = ColletiveDaoSetProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_DAO_SET_ADAPTER)
            );
        if (!daoset.isProposalAllDone(dao))
            revert UNDONE_DAOSETTING_PROPOSALS();
    }

    function submitClearFundProposal(
        DaoRegistry dao
    ) external onlyGovernor(dao) reimbursable(dao) {
        undoneOperationProposalsCheck(dao);
        daosetProposalCheck(dao);
        if (unDoneProposals[address(dao)].values().length > 0)
            revert UNDONE_PRE_CLEAR_FUND_PROPOSAL();
        dao.increaseClearFundId();
        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "ClearFund#",
                Strings.toString(dao.getCurrentCleaerFundProposalId())
            )
        );
        proposals[address(dao)][proposalId] = ClearFundProposalDatail(
            proposalId,
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

    function processClearFundProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        ClearFundProposalDatail storage proposal = proposals[address(dao)][
            proposalId
        ];

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
            fundingPoolAdapt.clearFund(dao);
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
    }
}
