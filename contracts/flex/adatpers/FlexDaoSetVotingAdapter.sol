pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "./interfaces/IFlexDaoset.sol";

contract FlexDaoSetVotingAdapterContract is
    IFlexDaoset,
    // GovernorGuard,
    Reimbursable,
    MemberGuard
{
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;

    mapping(address => bytes32) public ongoingVotingProposal;
    mapping(address => mapping(bytes32 => FlexDaosetLibrary.VotingProposalDetails))
        public votingProposals;

    function submitVotingProposal(
        FlexDaosetLibrary.VotingParams calldata params
    )
        external
        onlyMember(params.dao)
        reimbursable(params.dao)
        returns (bytes32)
    {
        // require(
        //     ongoingVotingProposal[address(params.dao)] == bytes32(0),
        //     "!submit"
        // );
        require(
            params.governors.length == params.allocations.length,
            "!allocation params"
        );
        require(
            FlexDaoSetHelperAdapterContract(
                params.dao.getAdapterAddress(
                    DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER
                )
            ).unDoneProposalsCheck(params.dao),
            "unDone Proposals"
        );

        require(
            FlexDaoSetHelperAdapterContract(
                params.dao.getAdapterAddress(
                    DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER
                )
            ).isProposalAllDone(params.dao),
            "unDone Daoset Proposal"
        );

        params.dao.increaseVotingId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(params.dao)))),
                "Voting #",
                Strings.toString(params.dao.getCurrentVotingProposalId())
            )
        );

        votingProposals[address(params.dao)][proposalId] = FlexDaosetLibrary
            .VotingProposalDetails(
                FlexDaosetLibrary.VotingSupportInfo(
                    params.supportType,
                    params.quorumType,
                    params.support,
                    params.quorum
                ),
                FlexDaosetLibrary.VotingAssetInfo(
                    params.votingAssetType,
                    params.tokenAddress,
                    params.tokenID,
                    params.votingWeightedType
                ),
                FlexDaosetLibrary.VotingTimeInfo(
                    params.votingPeriod,
                    params.executingPeriod,
                    block.timestamp,
                    block.timestamp +
                        params.dao.getConfiguration(DaoHelper.VOTING_PERIOD)
                ),
                FlexDaosetLibrary.VotingAllocation(
                    new uint256[](params.allocations.length)
                ),
                FlexDaosetLibrary.VotingGovernor(
                    new address[](params.governors.length)
                ),
                FlexDaosetLibrary.ProposalState.Voting
            );

        for (uint8 i = 0; i < params.allocations.length; i++) {
            // votingGovernors[proposalId].add(params.governors[i]);
            votingProposals[address(params.dao)][proposalId].allocations.allocs[
                    i
                ] = params.allocations[i];
            votingProposals[address(params.dao)][proposalId]
                .governors
                .governors[i] = params.governors[i];
        }

        ongoingVotingProposal[address(params.dao)] = proposalId;

        setProposal(params.dao, proposalId);

        emit ProposalCreated(
            address(params.dao),
            proposalId,
            FlexDaosetLibrary.ProposalType.POLL_FOR_INVESTMENT
        );

        return proposalId;
    }

    function setProposal(DaoRegistry dao, bytes32 proposalId) internal {
        dao.submitProposal(proposalId);

        IFlexVoting votingContract = IFlexVoting(
            dao.getAdapterAddress(DaoHelper.FLEX_VOTING_ADAPT)
        );
        votingContract.startNewVotingForProposal(dao, proposalId, bytes(""));

        dao.sponsorProposal(proposalId, address(votingContract));
    }

    function processVotingProposal(
        DaoRegistry dao,
        bytes32 proposalId
    )
        external
        reimbursable(dao)
        returns (IFlexVoting.VotingState, uint256, uint256, uint128)
    {
        FlexDaosetLibrary.VotingProposalDetails
            storage proposal = votingProposals[address(dao)][proposalId];

        (
            IFlexVoting.VotingState voteResult,
            uint256 nYes,
            uint256 nNo,
            uint128 allWeight
        ) = processProposal(dao, proposalId);

        if (voteResult == IFlexVoting.VotingState.PASS) {
            setVoting(dao, proposal);
            proposal.state = FlexDaosetLibrary.ProposalState.Done;
        } else if (
            voteResult == IFlexVoting.VotingState.NOT_PASS ||
            voteResult == IFlexVoting.VotingState.TIE
        ) {
            proposal.state = FlexDaosetLibrary.ProposalState.Failed;
        } else {
            revert FlexDaosetLibrary.VOTING_NOT_FINISH();
        }

        ongoingVotingProposal[address(dao)] = bytes32(0);

        emit ProposalProcessed(
            address(dao),
            proposalId,
            uint256(voteResult),
            allWeight,
            nYes,
            nNo
        );
        return (voteResult, nYes, nNo, allWeight);
    }

    function setVoting(
        DaoRegistry dao,
        // bytes32 proposalId,
        FlexDaosetLibrary.VotingProposalDetails storage proposal
    ) internal {
        FlexDaoSetHelperAdapterContract daosetHelper = FlexDaoSetHelperAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER)
            );
        daosetHelper.setVoting(
            dao,
            proposal.votingAssetInfo.tokenAddress,
            [
                proposal.votingAssetInfo.votingAssetType,
                proposal.votingAssetInfo.tokenID,
                proposal.votingAssetInfo.votingWeightedType,
                proposal.supportInfo.supportType,
                proposal.supportInfo.quorumType,
                proposal.supportInfo.quorum,
                proposal.supportInfo.support,
                proposal.timeInfo.votingPeriod
            ],
            // votingGovernors[proposalId].values(),
            proposal.governors.governors,
            proposal.allocations.allocs
        );
    }

    function processProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) internal returns (IFlexVoting.VotingState, uint256, uint256, uint128) {
        dao.processProposal(proposalId);

        IFlexVoting votingContract = IFlexVoting(
            dao.getAdapterAddress(DaoHelper.FLEX_VOTING_ADAPT)
        );

        require(address(votingContract) != address(0x0), "!votingContract");

        (
            IFlexVoting.VotingState vs,
            uint256 nbYes,
            uint256 nbNo
        ) = votingContract.voteResult(dao, proposalId);
        uint128 allWeight = GovernanceHelper
            .getAllFlexGovernorVotingWeightByProposalId(dao, proposalId);

        return (vs, nbYes, nbNo, allWeight);
    }

    function getAllocations(
        address daoAddr,
        bytes32 proposalId
    ) external view returns (address[] memory, uint256[] memory) {
        return (
            // votingGovernors[proposalId].values(),
            votingProposals[daoAddr][proposalId].governors.governors,
            votingProposals[daoAddr][proposalId].allocations.allocs
        );
    }
}
