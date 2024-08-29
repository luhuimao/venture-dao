pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IVintageFunding.sol";
import "../../helpers/DaoHelper.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "../../guards/RaiserGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../../helpers/DaoHelper.sol";
import "../../helpers/GovernanceHelper.sol";
import "hardhat/console.sol";

contract VintageGovernorVotingAssetAllocationProposalAdapterContract is
    Reimbursable,
    GovernorGuard
{
    enum ProposalState {
        Voting,
        Executing,
        Done,
        Failed
    }

    event ProposalCreated(
        address daoAddr,
        bytes32 proposalId,
        address[] governors,
        uint256[] allocations,
        uint256 stopVoteTime
    );
    event ProposalProcessed(
        address daoAddr,
        bytes32 proposalId,
        ProposalState state,
        uint128 allVotingWeight,
        uint256 nbYes,
        uint256 nbNo,
        uint256 voteResult
    );

    struct VotingAllocation {
        uint256[] allocs;
    }

    struct VotingGovernor {
        address[] governors;
    }

    struct ProposalDetail {
        address proposer;
        VotingAllocation allocs;
        VotingGovernor govs;
        uint256 creationTime;
        uint256 stopVoteTime;
        ProposalState state;
    }

    error INVALID_PARAMS();
    error PROPOSAL_HAS_NOT_BEEN_VOTED_ON_YET();
    error ADAPTER_NOT_FUND();
    error PROPOSAL_ALREADY_PROCESSED();
    error INVALID_GOVERNOR();

    mapping(DaoRegistry => mapping(bytes32 => ProposalDetail)) public proposals;
    mapping(DaoRegistry => bytes32) public ongoingProposal;

    function varifyGovernor(
        DaoRegistry dao,
        address[] calldata govs
    ) internal view {
        if (govs.length > 0) {
            for (uint8 i = 0; i < govs.length; i++) {
                if (!dao.isMember(govs[i])) revert INVALID_GOVERNOR();
            }
        }
    }

    function submitProposal(
        DaoRegistry dao,
        address[] calldata govs,
        uint256[] calldata allocs
    ) external reimbursable(dao) onlyGovernor(dao) {
        if (govs.length != allocs.length) revert INVALID_PARAMS();
        varifyGovernor(dao, govs);
        dao.increaseVinGovernorVotingAssetAllocationId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "Vintage Governor Allocation #",
                Strings.toString(
                    dao.getCurrentVinGovernorVotingAssetAllocationId()
                )
            )
        );

        uint256 stopVoteTime = block.timestamp +
            dao.getConfiguration(DaoHelper.VOTING_PERIOD);
        proposals[dao][proposalId] = ProposalDetail(
            msg.sender,
            VotingAllocation(new uint256[](govs.length)),
            VotingGovernor(new address[](govs.length)),
            block.timestamp,
            stopVoteTime,
            ProposalState.Voting
        );

        for (uint8 i = 0; i < govs.length; i++) {
            proposals[dao][proposalId].allocs.allocs[i] = allocs[i];
            proposals[dao][proposalId].govs.governors[i] = govs[i];
        }

        ongoingProposal[dao] = proposalId;

        IVintageVoting flexVotingContract = IVintageVoting(
            dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );
        dao.submitProposal(proposalId);

        dao.sponsorProposal(
            proposalId,
            dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );
        flexVotingContract.startNewVotingForProposal(
            dao,
            proposalId,
            block.timestamp,
            bytes("")
        );

        emit ProposalCreated(
            address(dao),
            proposalId,
            govs,
            allocs,
            stopVoteTime
        );
    }

    function processProposal(DaoRegistry dao, bytes32 proposalId) external {
        ProposalDetail storage proposal = proposals[dao][proposalId];

        if (dao.getProposalFlag(proposalId, DaoRegistry.ProposalFlag.PROCESSED))
            revert PROPOSAL_ALREADY_PROCESSED();
        IVintageVoting flexVotingContract = IVintageVoting(
            dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );

        if (address(flexVotingContract) == address(0))
            revert ADAPTER_NOT_FUND();

        IVintageVoting.VotingState voteResult;
        uint256 nbYes;
        uint256 nbNo;
        (voteResult, nbYes, nbNo) = flexVotingContract.voteResult(
            dao,
            proposalId
        );
        uint128 allWeight = GovernanceHelper
            .getVintageAllGovernorVotingWeightByProposalId(dao, proposalId);

        dao.processProposal(proposalId);

        if (voteResult == IVintageVoting.VotingState.PASS) {
            proposal.state = ProposalState.Executing;

            updateVotingAssetAllocation(dao, proposalId);

            proposal.state = ProposalState.Done;
        } else if (
            voteResult == IVintageVoting.VotingState.NOT_PASS ||
            voteResult == IVintageVoting.VotingState.TIE
        ) {
            proposal.state = ProposalState.Failed;
        } else {
            revert PROPOSAL_HAS_NOT_BEEN_VOTED_ON_YET();
        }

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

    function updateVotingAssetAllocation(
        DaoRegistry dao,
        bytes32 proposalId
    ) internal {
        ProposalDetail storage proposal = proposals[dao][proposalId];

        if (proposal.govs.governors.length > 0) {
            VintageRaiserAllocationAdapter governorAlloc = VintageRaiserAllocationAdapter(
                    dao.getAdapterAddress(
                        DaoHelper.VINTAGE_GOVERNOR_ALLOCATION_ADAPTER
                    )
                );
            for (uint8 i = 0; i < proposal.govs.governors.length; i++) {
                governorAlloc.setAllocation(
                    dao,
                    proposal.govs.governors[i],
                    proposal.allocs.allocs[i]
                );
            }
        }
    }
}
