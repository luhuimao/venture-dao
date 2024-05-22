pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "./interfaces/IFlexDaoset.sol";

contract FlexDaoSetPollingAdapterContract is
    IFlexDaoset,
    GovernorGuard,
    Reimbursable,
    MemberGuard
{
    using EnumerableSet for EnumerableSet.AddressSet;

    mapping(address => bytes32) public ongoingPollForInvestmentProposal;
    mapping(address => mapping(bytes32 => FlexDaosetLibrary.PollForInvestmentProposalDetails))
        public pollForInvestmentProposals;

    mapping(bytes32 => EnumerableSet.AddressSet) pollvoterMembershipWhiteLists;

    function submitPollForInvestmentProposal(
        FlexDaosetLibrary.PollForInvestmentParams calldata params
    )
        external
        onlyMember(params.dao)
        reimbursable(params.dao)
        returns (bytes32)
    {
        // require(
        //     ongoingPollForInvestmentProposal[address(params.dao)] == bytes32(0),
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

        params.dao.increasePollForInvestmentId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(params.dao)))),
                "Poll For Investment #",
                Strings.toString(
                    params.dao.getCurrentPollForInvestorProposalId()
                )
            )
        );

        pollForInvestmentProposals[address(params.dao)][
            proposalId
        ] = FlexDaosetLibrary.PollForInvestmentProposalDetails(
            params.pollEnable,
            params.pollvoterMembership.name,
            params.pollvoterMembership.varifyType,
            params.pollvoterMembership.minHolding,
            params.pollvoterMembership.tokenAddress,
            params.pollvoterMembership.tokenId,
            FlexDaosetLibrary.flexDaoPollingInfo(
                params.pollingInfo.votingPeriod,
                params.pollingInfo.votingPower,
                params.pollingInfo.superMajority,
                params.pollingInfo.quorum,
                params.pollingInfo.votingAssetType,
                params.pollingInfo.tokenAddress,
                params.pollingInfo.tokenID,
                params.pollingInfo.supportType,
                params.pollingInfo.quorumType
            ),
            block.timestamp,
            block.timestamp +
                params.dao.getConfiguration(DaoHelper.VOTING_PERIOD),
            FlexDaosetLibrary.ProposalState.Voting
        );

        if (params.pollvoterMembership.whiteList.length > 0) {
            for (
                uint8 i = 0;
                i < params.pollvoterMembership.whiteList.length;
                i++
            ) {
                pollvoterMembershipWhiteLists[proposalId].add(
                    params.pollvoterMembership.whiteList[i]
                );
            }
        }
        ongoingPollForInvestmentProposal[address(params.dao)] = proposalId;

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

    function processPollForInvestmentProposal(
        DaoRegistry dao,
        bytes32 proposalId // returns (IFlexVoting.VotingState, uint256, uint256, uint128)
    ) external reimbursable(dao) {
        FlexDaosetLibrary.PollForInvestmentProposalDetails
            storage proposal = pollForInvestmentProposals[address(dao)][
                proposalId
            ];

        (
            IFlexVoting.VotingState voteResult,
            uint256 nYes,
            uint256 nNo,
            uint128 allWeight
        ) = processProposal(dao, proposalId);

        if (voteResult == IFlexVoting.VotingState.PASS) {
            setPollForInvestment(dao, proposalId, proposal);
            proposal.state = FlexDaosetLibrary.ProposalState.Done;
        } else if (
            voteResult == IFlexVoting.VotingState.NOT_PASS ||
            voteResult == IFlexVoting.VotingState.TIE
        ) {
            proposal.state = FlexDaosetLibrary.ProposalState.Failed;
        } else {
            revert FlexDaosetLibrary.VOTING_NOT_FINISH();
        }

        ongoingPollForInvestmentProposal[address(dao)] = bytes32(0);
        // return (voteResult, nYes, nNo, allWeight);

        emit ProposalProcessed(
            address(dao),
            proposalId,
            uint256(voteResult),
            allWeight,
            nYes,
            nNo
        );
    }

    function setPollForInvestment(
        DaoRegistry dao,
        bytes32 proposalId,
        FlexDaosetLibrary.PollForInvestmentProposalDetails storage proposal
    ) internal {
        FlexDaoSetHelperAdapterContract daosetHelper = FlexDaoSetHelperAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER)
            );

        daosetHelper.setPollForInvestment(
            dao,
            [
                proposal.pollingInfo.votingPeriod,
                proposal.pollingInfo.votingPower,
                proposal.pollingInfo.superMajority,
                proposal.pollingInfo.quorum,
                proposal.pollingInfo.votingAssetType,
                proposal.pollingInfo.tokenID,
                proposal.varifyType,
                proposal.minHolding,
                proposal.tokenId
            ],
            [proposal.pollingInfo.tokenAddress, proposal.tokenAddress],
            pollvoterMembershipWhiteLists[proposalId].values(),
            proposal.pollEnable,
            proposal.name
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

    function getWhitelist(
        bytes32 proposalId
    ) external view returns (address[] memory) {
        return pollvoterMembershipWhiteLists[proposalId].values();
    }
}
