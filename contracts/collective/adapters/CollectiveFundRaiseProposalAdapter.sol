pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/ICollectiveFundRaise.sol";
import "./CollectiveDaoSetProposalAdapter.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "../../guards/MemberGuard.sol";

contract ColletiveFundRaiseProposalContract is
    ICollectiveFundRaise,
    Reimbursable,
    MemberGuard
{
    using EnumerableSet for EnumerableSet.AddressSet;

    mapping(DaoRegistry => mapping(bytes32 => EnumerableSet.AddressSet)) priorityDepositorWhitelist;
    mapping(DaoRegistry => mapping(bytes32 => ProposalDetails))
        public proposals;

    mapping(address => EnumerableSet.Bytes32Set) unDoneProposals;

    function daosetProposalCheck(DaoRegistry dao) internal view returns (bool) {
        ColletiveDaoSetProposalContract daoset = ColletiveDaoSetProposalContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_DAO_SET_ADAPTER)
            );
        return daoset.isProposalAllDone(dao);
    }

    function submitProposal(
        ProposalParams calldata params
    ) external reimbursable(params.dao) onlyMember(params.dao) returns (bool) {
        SubmitProposalLocalVars memory vars;
        vars.daosetAdapt = ColletiveDaoSetProposalContract(
            params.dao.getAdapterAddress(DaoHelper.COLLECTIVE_DAO_SET_ADAPTER)
        );
        require(
            vars.daosetAdapt.isProposalAllDone(params.dao),
            "DaoSet Proposal Undone"
        );
        params.dao.increaseFundEstablishmentId();
        vars.proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(params.dao)))),
                "FundEstablishment#",
                Strings.toString(
                    params.dao.getCurrentFundEstablishmentProposalId()
                )
            )
        );
        proposals[params.dao][vars.proposalId] = ProposalDetails(
            FundRaiseTimeInfo(
                params.timeInfo.startTime,
                params.timeInfo.endTime
            ),
            FundInfo(
                params.fundInfo.tokenAddress,
                params.fundInfo.miniTarget,
                params.fundInfo.maxCap,
                params.fundInfo.miniDeposit,
                params.fundInfo.maxDeposit
            ),
            PriorityDepositorInfo(
                params.priorityDepositor.valifyType,
                params.priorityDepositor.tokenAddress,
                params.priorityDepositor.tokenId,
                params.priorityDepositor.miniHolding,
                params.priorityDepositor.whitelist
            ),
            ProposalState.Voting
        );

        if (params.priorityDepositor.whitelist.length > 0) {
            for (
                uint8 i = 0;
                i < params.priorityDepositor.whitelist.length;
                i++
            )
                priorityDepositorWhitelist[params.dao][vars.proposalId].add(
                    params.priorityDepositor.whitelist[i]
                );
        }
        return true;
    }

    function processProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        ProcessProposalLocalVars memory vars;

        ProposalDetails storage proposalDetails = proposals[address(dao)][
            proposalId
        ];
        dao.processProposal(proposalId);
        vars.investmentPoolAdapt = ColletiveFundingPoolContract(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER)
        );
        vars.votingContract = CollectiveVotingContract(
            dao.votingAdapter(proposalId)
        );
        require(
            address(vars.votingContract) != address(0x0),
            "voting adapter not found"
        );

        (vars.voteResult, vars.nbYes, vars.nbNo) = vars
            .votingContract
            .voteResult(dao, proposalId);

        if (vars.voteResult == ICollectiveVoting.VotingState.PASS) {
            proposalDetails.state = ProposalState.Executing;
            // set dao configuration
            // setFundRaiseConfiguration(dao, proposalDetails);

            //reset fund raise state
            // vars.investmentPoolAdapt.resetFundRaiseState(dao);
            proposalDetails.state = ProposalState.Done;

            // fundsCounter += 1;
            // createdFundCounter[address(dao)] += 1;
        } else if (
            vars.voteResult == ICollectiveVoting.VotingState.NOT_PASS ||
            vars.voteResult == ICollectiveVoting.VotingState.TIE
        ) {
            proposalDetails.state = ProposalState.Failed;
        } else {
            revert VOTING_NOT_FINISH();
        }

        uint128 allGPsWeight = GovernanceHelper
            .getAllCollectiveGovernorVotingWeight(dao);

        emit proposalExecuted(
            address(dao),
            proposalId,
            proposalDetails.state,
            allGPsWeight,
            vars.nbYes,
            vars.nbNo,
            uint256(vars.voteResult)
        );
    }
}
