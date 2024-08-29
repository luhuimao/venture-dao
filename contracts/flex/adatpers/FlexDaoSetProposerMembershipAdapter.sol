pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "./interfaces/IFlexDaoset.sol";

contract FlexDaoSetProposerMembershipAdapterContract is
    IFlexDaoset,
    // GovernorGuard,
    Reimbursable,
    MemberGuard
{
    using EnumerableSet for EnumerableSet.AddressSet;

    mapping(address => bytes32) public ongoingProposerMembershipProposal;

    mapping(address => mapping(bytes32 => FlexDaosetLibrary.ProposerMembershipProposalDetails))
        public proposerMembershipProposals;

    mapping(bytes32 => EnumerableSet.AddressSet) proposerMembershipWhiteLists;

    function submitProposerMembershipProposal(
        FlexDaosetLibrary.ProposerMembershipParams calldata params
    )
        external
        onlyMember(params.dao)
        reimbursable(params.dao)
        returns (bytes32)
    {
        // require(
        //     ongoingProposerMembershipProposal[address(params.dao)] ==
        //         bytes32(0),
        //     "!submit"
        // );
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
        params.dao.increaseProposerMembershipId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(params.dao)))),
                "Proposer Membership #",
                Strings.toString(
                    params.dao.getCurrentProposerMembershipProposalId()
                )
            )
        );

        proposerMembershipProposals[address(params.dao)][
            proposalId
        ] = FlexDaosetLibrary.ProposerMembershipProposalDetails(
            params.proposerMembershipEnable,
            params.name,
            params.varifyType, //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
            params.minHolding,
            params.tokenAddress,
            params.tokenId,
            block.timestamp,
            block.timestamp +
                params.dao.getConfiguration(DaoHelper.VOTING_PERIOD),
            FlexDaosetLibrary.ProposalState.Voting
        );

        if (params.whiteList.length > 0) {
            for (uint8 i = 0; i < params.whiteList.length; i++) {
                proposerMembershipWhiteLists[proposalId].add(
                    params.whiteList[i]
                );
            }
        }
        ongoingProposerMembershipProposal[address(params.dao)] = proposalId;

        setProposal(params.dao, proposalId);

        emit ProposalCreated(
            address(params.dao),
            proposalId,
            FlexDaosetLibrary.ProposalType.PROPOSER_MEMBERHSIP
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

    function processProposerMembershipProposal(
        DaoRegistry dao,
        bytes32 proposalId
    )
        external
        reimbursable(dao)
        returns (IFlexVoting.VotingState, uint256, uint256, uint128)
    {
        FlexDaosetLibrary.ProposerMembershipProposalDetails
            storage proposal = proposerMembershipProposals[address(dao)][
                proposalId
            ];
        (
            IFlexVoting.VotingState voteResult,
            uint256 nYes,
            uint256 nNo,
            uint128 allWeight
        ) = processProposal(dao, proposalId);

        if (voteResult == IFlexVoting.VotingState.PASS) {
            setProposerMembership(dao, proposalId, proposal);
            proposal.state = FlexDaosetLibrary.ProposalState.Done;
        } else if (
            voteResult == IFlexVoting.VotingState.NOT_PASS ||
            voteResult == IFlexVoting.VotingState.TIE
        ) {
            proposal.state = FlexDaosetLibrary.ProposalState.Failed;
        } else {
            revert FlexDaosetLibrary.VOTING_NOT_FINISH();
        }

        ongoingProposerMembershipProposal[address(dao)] = bytes32(0);

        return (voteResult, nYes, nNo, allWeight);
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

    function setProposerMembership(
        DaoRegistry dao,
        bytes32 proposalId,
        FlexDaosetLibrary.ProposerMembershipProposalDetails storage proposal
    ) internal {
        FlexDaoSetHelperAdapterContract daosetHelper = FlexDaoSetHelperAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER)
            );

        daosetHelper.setProposerMembership(
            dao,
            proposal.proposerMembershipEnable,
            proposal.name,
            proposal.minHolding,
            proposal.tokenId,
            proposal.varifyType,
            proposal.tokenAddress,
            proposerMembershipWhiteLists[proposalId].values()
        );
    }

    function getProposerMembershipWhitelist(
        bytes32 proposalId
    ) external view returns (address[] memory) {
        return proposerMembershipWhiteLists[proposalId].values();
    }
}
