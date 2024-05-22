pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "./interfaces/IFlexDaoset.sol";

contract FlexDaoSetInvestorCapAdapterContract is
    IFlexDaoset,
    GovernorGuard,
    Reimbursable,
    MemberGuard
{
    mapping(address => bytes32) public ongoingInvestorCapProposal;

    mapping(address => mapping(bytes32 => FlexDaosetLibrary.InvestorCapProposalDetails))
        public investorCapProposals;

    function submitInvestorCapProposal(
        DaoRegistry dao,
        bool enable,
        uint256 cap
    ) external onlyMember(dao) reimbursable(dao) {
        // require(
        //     ongoingInvestorCapProposal[address(dao)] == bytes32(0),
        //     "!submit"
        // );
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
        dao.increaseInvestorCapId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "Invstor Cap #",
                Strings.toString(dao.getCurrentInvestorCapProposalId())
            )
        );

        investorCapProposals[address(dao)][proposalId] = FlexDaosetLibrary
            .InvestorCapProposalDetails(
                enable,
                cap,
                block.timestamp,
                block.timestamp + dao.getConfiguration(DaoHelper.VOTING_PERIOD),
                FlexDaosetLibrary.ProposalState.Voting
            );
        ongoingInvestorCapProposal[address(dao)] = proposalId;

        setProposal(dao, proposalId);
        emit ProposalCreated(
            address(dao),
            proposalId,
            FlexDaosetLibrary.ProposalType.INVESTOR_CAP
        );
    }

    function processInvestorCapProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        FlexDaosetLibrary.InvestorCapProposalDetails
            storage proposal = investorCapProposals[address(dao)][proposalId];

        (IFlexVoting.VotingState voteResult, , ) = processProposal(
            dao,
            proposalId
        );

        if (voteResult == IFlexVoting.VotingState.PASS) {
            setInvestorCap(dao, proposal);
            proposal.state = FlexDaosetLibrary.ProposalState.Done;
        } else if (
            voteResult == IFlexVoting.VotingState.NOT_PASS ||
            voteResult == IFlexVoting.VotingState.TIE
        ) {
            proposal.state = FlexDaosetLibrary.ProposalState.Failed;
        } else {
            revert FlexDaosetLibrary.VOTING_NOT_FINISH();
        }

        ongoingInvestorCapProposal[address(dao)] = bytes32(0);
    }

    function setInvestorCap(
        DaoRegistry dao,
        FlexDaosetLibrary.InvestorCapProposalDetails storage proposal
    ) internal {
        FlexDaoSetHelperAdapterContract daosetHelper = FlexDaoSetHelperAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER)
            );
        daosetHelper.setInvestorCap(dao, proposal.enable, proposal.cap);
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
}
