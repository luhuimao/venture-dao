pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "./interfaces/IFlexDaoset.sol";

contract FlexDaoSetInvestorMembershipAdapterContract is
    IFlexDaoset,
    // GovernorGuard,
    Reimbursable,
    MemberGuard
{
    using EnumerableSet for EnumerableSet.AddressSet;
    mapping(address => mapping(bytes32 => FlexDaosetLibrary.InvestorMembershipProposalDetails))
        public investorMembershipProposals;
    mapping(address => bytes32) public ongoingInvstorMembershipProposal;
    mapping(bytes32 => EnumerableSet.AddressSet) investorMembershipWhiteLists;

    function submitInvestorMembershipProposal(
        FlexDaosetLibrary.InvestorMembershipParams calldata params
    ) external onlyMember(params.dao) returns (bytes32) {
        // require(
        //     ongoingInvstorMembershipProposal[address(params.dao)] == bytes32(0),
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
        params.dao.increaseInvstorMembershipId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(params.dao)))),
                "Investor Membership #",
                Strings.toString(
                    params.dao.getCurrentInvestorMembershipProposalId()
                )
            )
        );

        investorMembershipProposals[address(params.dao)][
            proposalId
        ] = FlexDaosetLibrary.InvestorMembershipProposalDetails(
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
                investorMembershipWhiteLists[proposalId].add(
                    params.whiteList[i]
                );
            }
        }

        ongoingInvstorMembershipProposal[address(params.dao)] = proposalId;

        setProposal(params.dao, proposalId);
        emit ProposalCreated(
            address(params.dao),
            proposalId,
            FlexDaosetLibrary.ProposalType.INVESTOR_CAP
        );
        return proposalId;
    }

    function processInvestorMembershipProposal(
        DaoRegistry dao,
        bytes32 proposalId
    )
        external
        reimbursable(dao)
    // returns (IFlexVoting.VotingState, uint256, uint256, uint128)
    {
        FlexDaosetLibrary.InvestorMembershipProposalDetails
            storage proposal = investorMembershipProposals[address(dao)][
                proposalId
            ];

        (
            IFlexVoting.VotingState voteResult,
            uint256 nYes,
            uint256 nNo,
            uint128 allWeight
        ) = processProposal(dao, proposalId);

        if (voteResult == IFlexVoting.VotingState.PASS) {
            setInvestorMembership(dao, proposalId, proposal);
            proposal.state = FlexDaosetLibrary.ProposalState.Done;
        } else if (
            voteResult == IFlexVoting.VotingState.NOT_PASS ||
            voteResult == IFlexVoting.VotingState.TIE
        ) {
            proposal.state = FlexDaosetLibrary.ProposalState.Failed;
        } else {
            revert FlexDaosetLibrary.VOTING_NOT_FINISH();
        }

        ongoingInvstorMembershipProposal[address(dao)] = bytes32(0);

        emit ProposalProcessed(
            address(dao),
            proposalId,
            uint256(voteResult),
            allWeight,
            nYes,
            nNo
        );
        // return (voteResult, nYes, nNo, allWeight);
    }

    function setInvestorMembership(
        DaoRegistry dao,
        bytes32 proposalId,
        FlexDaosetLibrary.InvestorMembershipProposalDetails storage proposal
    ) internal {
        FlexDaoSetHelperAdapterContract daosetHelper = FlexDaoSetHelperAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER)
            );
        daosetHelper.setInvestorMembership(
            dao,
            proposal.enable,
            proposal.name,
            proposal.varifyType,
            proposal.minAmount,
            proposal.tokenAddress,
            proposal.tokenId,
            investorMembershipWhiteLists[proposalId].values()
        );
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

    function getInvestorWhitelist(
        bytes32 proposalId
    ) external view returns (address[] memory) {
        return investorMembershipWhiteLists[proposalId].values();
    }
}
