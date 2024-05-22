pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "./interfaces/IFlexDaoset.sol";

contract FlexDaoSetGovernorMembershipAdapterContract is
    IFlexDaoset,
    GovernorGuard,
    Reimbursable,
    MemberGuard
{
    using EnumerableSet for EnumerableSet.AddressSet;

    mapping(bytes32 => EnumerableSet.AddressSet) governorMembershipWhitelists;
    mapping(address => bytes32) public ongoingGovernorMembershipProposal;
    mapping(address => mapping(bytes32 => FlexDaosetLibrary.GovernorMembershipProposalDetails))
        public governorMembershipProposals;

    function submitGovernorMembershipProposal(
        FlexDaosetLibrary.GovernorMembershipParams calldata params
    ) external onlyMember(params.dao) reimbursable(params.dao) {
        // require(
        //     ongoingGovernorMembershipProposal[address(params.dao)] ==
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
                params.dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER)
            ).isProposalAllDone(params.dao),
            "unDone Daoset Proposal"
        );
        params.dao.increaseGovernorMembershipId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(params.dao)))),
                "Governor Membership #",
                Strings.toString(
                    params.dao.getCurrentGovernorMembershipProposalId()
                )
            )
        );

        governorMembershipProposals[address(params.dao)][
            proposalId
        ] = FlexDaosetLibrary.GovernorMembershipProposalDetails(
            params.enable,
            params.name,
            params.varifyType,
            params.minAmount,
            params.tokenAddress,
            params.tokenId,
            block.timestamp,
            block.timestamp +
                params.dao.getConfiguration(DaoHelper.VOTING_PERIOD),
            FlexDaosetLibrary.ProposalState.Voting
        );

        if (params.whiteList.length > 0) {
            for (uint8 i = 0; i < params.whiteList.length; i++) {
                governorMembershipWhitelists[proposalId].add(
                    params.whiteList[i]
                );
            }
        }

        ongoingGovernorMembershipProposal[address(params.dao)] = proposalId;

        setProposal(params.dao, proposalId);

        emit ProposalCreated(
            address(params.dao),
            proposalId,
            FlexDaosetLibrary.ProposalType.GOVERNOR_MEMBERSHIP
        );
    }

    function processGovernorMembershipProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        FlexDaosetLibrary.GovernorMembershipProposalDetails
            storage proposal = governorMembershipProposals[address(dao)][
                proposalId
            ];

        (IFlexVoting.VotingState voteResult, , ) = processProposal(
            dao,
            proposalId
        );

        if (voteResult == IFlexVoting.VotingState.PASS) {
            setGovernorMembership(dao, proposalId, proposal);
            proposal.state = FlexDaosetLibrary.ProposalState.Done;
        } else if (
            voteResult == IFlexVoting.VotingState.NOT_PASS ||
            voteResult == IFlexVoting.VotingState.TIE
        ) {
            proposal.state = FlexDaosetLibrary.ProposalState.Failed;
        } else {
            revert FlexDaosetLibrary.VOTING_NOT_FINISH();
        }

        ongoingGovernorMembershipProposal[address(dao)] = bytes32(0);
    }

    function setProposal(DaoRegistry dao, bytes32 proposalId) internal {
        dao.submitProposal(proposalId);

        IFlexVoting votingContract = IFlexVoting(
            dao.getAdapterAddress(DaoHelper.FLEX_VOTING_ADAPT)
        );
        votingContract.startNewVotingForProposal(dao, proposalId, bytes(""));

        dao.sponsorProposal(proposalId, address(votingContract));
    }

    function processProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) internal returns (IFlexVoting.VotingState, uint256, uint256) {
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
        emit ProposalProcessed(
            address(dao),
            proposalId,
            uint256(vs),
            allWeight,
            nbYes,
            nbNo
        );

        return (vs, nbYes, nbNo);
    }

    function setGovernorMembership(
        DaoRegistry dao,
        bytes32 proposalId,
        FlexDaosetLibrary.GovernorMembershipProposalDetails storage proposal
    ) internal {
        FlexDaoSetHelperAdapterContract daosetHelper = FlexDaoSetHelperAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER)
            );
        daosetHelper.setGovernorMembership(
            dao,
            proposal.enable,
            proposal.name,
            proposal.minAmount,
            proposal.tokenAddress,
            proposal.tokenId,
            proposal.varifyType,
            governorMembershipWhitelists[proposalId].values()
        );
    }

    function getGovernorWhitelist(
        bytes32 proposalId
    ) external view returns (address[] memory) {
        return governorMembershipWhitelists[proposalId].values();
    }
}
