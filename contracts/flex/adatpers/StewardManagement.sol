pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "../../helpers/DaoHelper.sol";
import "../../utils/TypeConver.sol";
import "./FlexVoting.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "../../guards/FlexStewardGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "hardhat/console.sol";

contract StewardManagementContract is
    Reimbursable,
    MemberGuard,
    FlexStewardGuard
{
    using EnumerableSet for EnumerableSet.AddressSet;

    enum ProposalState {
        Voting,
        Executing,
        Done,
        Failed
    }

    enum ProposalType {
        STEWARD_IN,
        STEWARD_OUT
    }

    struct ProposalDetails {
        bytes32 id;
        address account;
        uint256 creationTime;
        uint256 stopVoteTime;
        ProposalState state;
        ProposalType pType;
    }

    event ProposalCreated(
        address daoAddr,
        bytes32 proposalId,
        address account,
        uint256 creationTime,
        uint256 stopVoteTime,
        ProposalType pType
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

    // proposals per dao
    mapping(DaoRegistry => mapping(bytes32 => ProposalDetails))
        public proposals;
    mapping(address => EnumerableSet.AddressSet) stewardWhiteList;

    uint256 public stewardInProposalIds = 1;
    uint256 public stewardOutProposalIds = 1;

    function registerStewardWhiteList(
        DaoRegistry dao,
        address account
    ) external onlyMember(dao) {
        if (!stewardWhiteList[address(dao)].contains(account)) {
            stewardWhiteList[address(dao)].add(account);
        }
    }

    function submitSteWardInProposal(
        DaoRegistry dao,
        address applicant
    )
        external
        reimbursable(dao)
        onlyMember(dao)
        onlySteward(dao, applicant)
        returns (bytes32 proposalId)
    {
        require(!dao.isMember(applicant), "applicant is strward already");
        require(
            DaoHelper.isNotReservedAddress(applicant),
            "applicant is reserved address"
        );
        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                "Governor-In#",
                Strings.toString(stewardInProposalIds)
            )
        );

        uint256 startVoteTime = block.timestamp;
        uint256 stopVoteTime = startVoteTime +
            dao.getConfiguration(DaoHelper.VOTING_PERIOD);

        _submitStewardInProposal(
            dao,
            proposalId,
            applicant,
            startVoteTime,
            stopVoteTime
        );

        _sponsorProposal(dao, proposalId, startVoteTime, bytes(""));
        stewardInProposalIds += 1;

        emit ProposalCreated(
            address(dao),
            proposalId,
            applicant,
            startVoteTime,
            stopVoteTime,
            ProposalType.STEWARD_IN
        );
    }

    function submitSteWardOutProposal(
        DaoRegistry dao,
        address applicant
    ) external onlyMember(dao) reimbursable(dao) returns (bytes32 proposalId) {
        require(dao.isMember(applicant), "applicant isnt steward");

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                "Governor-Out#",
                Strings.toString(stewardOutProposalIds)
            )
        );

        uint256 startVoteTime = block.timestamp;
        uint256 stopVoteTime = startVoteTime +
            dao.getConfiguration(DaoHelper.VOTING_PERIOD);

        _submitStewardOutProposal(
            dao,
            proposalId,
            applicant,
            startVoteTime,
            stopVoteTime
        );

        _sponsorProposal(dao, proposalId, startVoteTime, bytes(""));
        stewardOutProposalIds += 1;

        emit ProposalCreated(
            address(dao),
            proposalId,
            applicant,
            startVoteTime,
            stopVoteTime,
            ProposalType.STEWARD_OUT
        );
    }

    /**
     * @notice Starts a vote on the proposal to onboard a new member.
     * @param proposalId The proposal id to be processed. It needs to exist in the DAO Registry.
     */
    function _sponsorProposal(
        DaoRegistry dao,
        bytes32 proposalId,
        uint256 startVotingTime,
        bytes memory data
    ) internal {
        IFlexVoting flexVotingContract = IFlexVoting(
            dao.getAdapterAddress(DaoHelper.FLEX_VOTING_ADAPT)
        );
        address sponsoredBy = flexVotingContract.getSenderAddress(
            dao,
            address(this),
            data,
            msg.sender
        );
        dao.sponsorProposal(
            proposalId,
            sponsoredBy,
            dao.getAdapterAddress(DaoHelper.FLEX_VOTING_ADAPT)
        );
        flexVotingContract.startNewVotingForProposal(dao, proposalId, data);
    }

    /**
     * @notice Marks the proposalId as submitted in the DAO and saves the information in the internal adapter state.
     * @notice Updates the total of units issued in the DAO, and checks if it is within the limits.
     */
    function _submitStewardInProposal(
        DaoRegistry dao,
        bytes32 proposalId,
        address applicant,
        uint256 startVoteTime,
        uint256 stopVoteTime
    ) internal {
        require(!dao.isMember(applicant), "steward existed");

        proposals[dao][proposalId] = ProposalDetails(
            proposalId,
            applicant,
            startVoteTime,
            stopVoteTime,
            ProposalState.Voting,
            ProposalType.STEWARD_IN
        );

        dao.submitProposal(proposalId);
    }

    function _submitStewardOutProposal(
        DaoRegistry dao,
        bytes32 proposalId,
        address applicant,
        uint256 startVoteTime,
        uint256 stopVoteTime
    ) internal {
        require(dao.isMember(applicant), "isnt steward");

        proposals[dao][proposalId] = ProposalDetails(
            proposalId,
            applicant,
            startVoteTime,
            stopVoteTime,
            ProposalState.Voting,
            ProposalType.STEWARD_OUT
        );

        dao.submitProposal(proposalId);
    }

    function processProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        ProposalDetails storage proposal = proposals[dao][proposalId];
        require(proposal.id == proposalId, "proposal does not exist");
        require(
            !dao.getProposalFlag(
                proposalId,
                DaoRegistry.ProposalFlag.PROCESSED
            ),
            "proposal already processed"
        );
        IFlexVoting flexVotingContract = IFlexVoting(
            dao.getAdapterAddress(DaoHelper.FLEX_VOTING_ADAPT)
        );

        require(address(flexVotingContract) != address(0), "adapter not found");

        IFlexVoting.VotingState voteResult;
        uint256 nbYes;
        uint256 nbNo;
        (voteResult, nbYes, nbNo) = flexVotingContract.voteResult(
            dao,
            proposalId
        );

        dao.processProposal(proposalId);

        if (voteResult == IFlexVoting.VotingState.PASS) {
            proposal.state = ProposalState.Executing;
            address applicant = proposal.account;

            if (proposal.pType == ProposalType.STEWARD_IN) {
                dao.potentialNewMember(applicant);
            }

            if (proposal.pType == ProposalType.STEWARD_OUT) {
                dao.removeMember(applicant);
            }

            proposal.state = ProposalState.Done;
        } else if (
            voteResult == IFlexVoting.VotingState.NOT_PASS ||
            voteResult == IFlexVoting.VotingState.TIE
        ) {
            proposal.state = ProposalState.Failed;
        } else {
            revert("proposal has not been voted on yet");
        }
        uint128 allWeight = GovernanceHelper.getAllStewardVotingWeight(dao);
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

    function quit(DaoRegistry dao) external onlyMember(dao) {
        require(dao.daoCreator() != msg.sender, "dao summonor cant quit");
        dao.removeMember(msg.sender);
    }

    function isStewardWhiteList(
        DaoRegistry dao,
        address account
    ) external view returns (bool) {
        return stewardWhiteList[address(dao)].contains(account);
    }

    function getStewardWhitelist(
        DaoRegistry dao
    ) external view returns (address[] memory) {
        return stewardWhiteList[address(dao)].values();
    }

    function getStewardAmount(DaoRegistry dao) external view returns (uint256) {
        return DaoHelper.getActiveMemberNb(dao);
    }

    function getAllSteward(
        DaoRegistry dao
    ) external view returns (address[] memory) {
        return DaoHelper.getAllActiveMember(dao);
    }
}
