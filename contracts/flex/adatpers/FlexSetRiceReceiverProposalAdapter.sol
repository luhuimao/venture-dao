pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IFlexFunding.sol";
import "../../helpers/DaoHelper.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "../../guards/FlexStewardGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../../helpers/DaoHelper.sol";
import "../../helpers/GovernanceHelper.sol";
import "hardhat/console.sol";

contract FlexSetRiceReceiverProposalAdapterContract is
    Reimbursable,
    MemberGuard,
    FlexStewardGuard
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

    struct ProposalDetail {
        address proposer;
        address riceReceiver;
        uint256 creationTime;
        uint256 stopVoteTime;
        ProposalState state;
    }

    error PROPOSAL_HAS_NOT_BEEN_VOTED_ON_YET();
    error ADAPTER_NOT_FUND();
    error PROPOSAL_ALREADY_PROCESSED();
    error INVALID_GOVERNOR();

    mapping(DaoRegistry => mapping(bytes32 => ProposalDetail)) public proposals;
    mapping(DaoRegistry => bytes32) public ongoingProposal;

    function submitProposal(
        DaoRegistry dao,
        address riceReceiver
    ) external reimbursable(dao) onlyMember(dao) {
        dao.increaseRiceReceiverId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "SetRiceReceiver#",
                Strings.toString(dao.getCurrentRiceReceiverId())
            )
        );

        uint256 stopVoteTime = block.timestamp +
            dao.getConfiguration(DaoHelper.VOTING_PERIOD);
        proposals[dao][proposalId] = ProposalDetail(
            msg.sender,
            riceReceiver,
            block.timestamp,
            stopVoteTime,
            ProposalState.Voting
        );

        ongoingProposal[dao] = proposalId;

        IFlexVoting flexVotingContract = IFlexVoting(
            dao.getAdapterAddress(DaoHelper.FLEX_VOTING_ADAPT)
        );
        dao.submitProposal(proposalId);

        dao.sponsorProposal(
            proposalId,
            dao.getAdapterAddress(DaoHelper.FLEX_VOTING_ADAPT)
        );
        flexVotingContract.startNewVotingForProposal(
            dao,
            proposalId,
            bytes("")
        );

        emit ProposalCreated(address(dao), proposalId, stopVoteTime);
    }

    function processProposal(DaoRegistry dao, bytes32 proposalId) external {
        ProposalDetail storage proposal = proposals[dao][proposalId];

        if (dao.getProposalFlag(proposalId, DaoRegistry.ProposalFlag.PROCESSED))
            revert PROPOSAL_ALREADY_PROCESSED();
        IFlexVoting flexVotingContract = IFlexVoting(
            dao.getAdapterAddress(DaoHelper.FLEX_VOTING_ADAPT)
        );

        if (address(flexVotingContract) == address(0))
            revert ADAPTER_NOT_FUND();

        IFlexVoting.VotingState voteResult;
        uint256 nbYes;
        uint256 nbNo;
        (voteResult, nbYes, nbNo) = flexVotingContract.voteResult(
            dao,
            proposalId
        );
        uint128 allWeight = GovernanceHelper
            .getAllFlexGovernorVotingWeightByProposalId(dao, proposalId);

        dao.processProposal(proposalId);

        if (voteResult == IFlexVoting.VotingState.PASS) {
            proposal.state = ProposalState.Executing;

            dao.setAddressConfiguration(
                DaoHelper.RICE_REWARD_RECEIVER,
                proposal.riceReceiver
            );
            proposal.state = ProposalState.Done;
        } else if (
            voteResult == IFlexVoting.VotingState.NOT_PASS ||
            voteResult == IFlexVoting.VotingState.TIE
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
}
