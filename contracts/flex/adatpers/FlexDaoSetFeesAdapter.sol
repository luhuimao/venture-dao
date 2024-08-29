pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "./interfaces/IFlexDaoset.sol";

contract FlexDaoSetFeesAdapterContract is
    IFlexDaoset,
    // GovernorGuard,
    Reimbursable,
    MemberGuard
{
    mapping(address => bytes32) public ongoingFeesProposal;
    mapping(address => mapping(bytes32 => FlexDaosetLibrary.FeeProposalDetails))
        public feesProposals;

    function submitFeesProposal(
        DaoRegistry dao,
        uint256 flexDaoManagementfee,
        uint256 returnTokenManagementFee,
        address managementFeeAddress
    ) external onlyMember(dao) reimbursable(dao) {
        // require(ongoingFeesProposal[address(dao)] == bytes32(0), "!submit");
        require(
            FlexDaoSetHelperAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER)
            ).unDoneProposalsCheck(dao),
            "unDone Proposals"
        );
        require(
            FlexDaoSetHelperAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER)
            ).isProposalAllDone(dao),
            "unDone Daoset Proposal"
        );
        dao.increaseFeesId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "Fees #",
                Strings.toString(dao.getCurrentFeeProposalId())
            )
        );

        feesProposals[address(dao)][proposalId] = FlexDaosetLibrary
            .FeeProposalDetails(
                flexDaoManagementfee,
                returnTokenManagementFee,
                managementFeeAddress,
                block.timestamp,
                block.timestamp + dao.getConfiguration(DaoHelper.VOTING_PERIOD),
                FlexDaosetLibrary.ProposalState.Voting
            );
        ongoingFeesProposal[address(dao)] = proposalId;

        setProposal(dao, proposalId);
        emit ProposalCreated(
            address(dao),
            proposalId,
            FlexDaosetLibrary.ProposalType.FEES
        );
    }

    function processFeesProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        FlexDaosetLibrary.FeeProposalDetails storage proposal = feesProposals[
            address(dao)
        ][proposalId];

        (IFlexVoting.VotingState voteResult, , ) = processProposal(
            dao,
            proposalId
        );

        if (voteResult == IFlexVoting.VotingState.PASS) {
            setFees(dao, proposal);
            proposal.state = FlexDaosetLibrary.ProposalState.Done;
        } else if (
            voteResult == IFlexVoting.VotingState.NOT_PASS ||
            voteResult == IFlexVoting.VotingState.TIE
        ) {
            proposal.state = FlexDaosetLibrary.ProposalState.Failed;
        } else {
            revert FlexDaosetLibrary.VOTING_NOT_FINISH();
        }

        ongoingFeesProposal[address(dao)] = bytes32(0);
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

    function setFees(
        DaoRegistry dao,
        FlexDaosetLibrary.FeeProposalDetails storage proposal
    ) internal {
        FlexDaoSetHelperAdapterContract daosetHelper = FlexDaoSetHelperAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER)
            );
        daosetHelper.setFees(
            dao,
            proposal.flexDaoManagementfee,
            proposal.returnTokenManagementFee,
            proposal.managementFeeAddress
        );
    }
}
