pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "./interfaces/ICollectiveVoting.sol";
import "./CollectiveDaoSetProposalAdapter.sol";
import "../../helpers/DaoHelper.sol";
import "../../helpers/GovernanceHelper.sol";
import "../../utils/TypeConver.sol";
import "../../adapters/modifiers/Reimbursable.sol";
// import "../../guards/FlexStewardGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "hardhat/console.sol";

contract ColletiveGovernorManagementContract is Reimbursable, MemberGuard {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    enum ProposalState {
        Voting,
        Executing,
        Done,
        Failed
    }

    enum ProposalType {
        GOVERNOR_IN,
        GOVERNOR_OUT
    }

    struct ProposalDetails {
        bytes32 id;
        address account;
        address tokenAddress;
        uint256 depositAmount;
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
    mapping(address => EnumerableSet.AddressSet) governorWhiteList;
    mapping(address => EnumerableSet.Bytes32Set) unDoneProposals;

    function daosetProposalCheck(DaoRegistry dao) internal view returns (bool) {
        ColletiveDaoSetProposalContract daoset = ColletiveDaoSetProposalContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_DAO_SET_ADAPTER)
            );
        return daoset.isProposalAllDone(dao);
        // return true;
    }

    function submitGovernorInProposal(
        DaoRegistry dao,
        address applicant,
        address tokenAddress,
        uint256 depositAmount
    ) external reimbursable(dao) onlyMember(dao) returns (bytes32) {
        require(!dao.isMember(applicant), "Is Governor already");

        require(daosetProposalCheck(dao), "UnDone Daoset Proposal");
        dao.increaseGovenorInId();
        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "Governor-In#",
                Strings.toString(dao.getCurrentGovenorInProposalId())
            )
        );

        uint256 startVoteTime = block.timestamp;
        uint256 stopVoteTime = startVoteTime +
            dao.getConfiguration(DaoHelper.VOTING_PERIOD);

        _submitGovernorInProposal(
            dao,
            proposalId,
            applicant,
            tokenAddress,
            depositAmount,
            startVoteTime,
            stopVoteTime
        );

        _sponsorProposal(dao, proposalId, bytes(""));
        unDoneProposals[address(dao)].add(proposalId);
        emit ProposalCreated(
            address(dao),
            proposalId,
            applicant,
            startVoteTime,
            stopVoteTime,
            ProposalType.GOVERNOR_IN
        );
        return proposalId;
    }

    function submitGovernorOutProposal(
        DaoRegistry dao,
        address applicant
    ) external onlyMember(dao) reimbursable(dao) returns (bytes32) {
        require(dao.isMember(applicant), "Applicant Isnt Governor");
        dao.increaseGovenorOutId();
        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "Governor-Out#",
                Strings.toString(dao.getCurrentGovenorOutProposalId())
            )
        );

        uint256 startVoteTime = block.timestamp;
        uint256 stopVoteTime = startVoteTime +
            dao.getConfiguration(DaoHelper.VOTING_PERIOD);

        _submitGovernorOutProposal(
            dao,
            proposalId,
            applicant,
            startVoteTime,
            stopVoteTime
        );

        _sponsorProposal(dao, proposalId, bytes(""));
        unDoneProposals[address(dao)].add(proposalId);

        emit ProposalCreated(
            address(dao),
            proposalId,
            applicant,
            startVoteTime,
            stopVoteTime,
            ProposalType.GOVERNOR_OUT
        );
        return proposalId;
    }

    /**
     * @notice Starts a vote on the proposal to onboard a new member.
     * @param proposalId The proposal id to be processed. It needs to exist in the DAO Registry.
     */
    function _sponsorProposal(
        DaoRegistry dao,
        bytes32 proposalId,
        bytes memory data
    ) internal {
        ICollectiveVoting collectiveVotingContract = ICollectiveVoting(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
        );

        dao.sponsorProposal(
            proposalId,
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
        );
        collectiveVotingContract.startNewVotingForProposal(
            dao,
            proposalId,
            data
        );
    }

    /**
     * @notice Marks the proposalId as submitted in the DAO and saves the information in the internal adapter state.
     * @notice Updates the total of units issued in the DAO, and checks if it is within the limits.
     */
    function _submitGovernorInProposal(
        DaoRegistry dao,
        bytes32 proposalId,
        address applicant,
        address tokenAddress,
        uint256 depositAmount,
        uint256 startVoteTime,
        uint256 stopVoteTime
    ) internal {
        require(!dao.isMember(applicant), "governor existed");

        proposals[dao][proposalId] = ProposalDetails(
            proposalId,
            applicant,
            tokenAddress,
            depositAmount,
            startVoteTime,
            stopVoteTime,
            ProposalState.Voting,
            ProposalType.GOVERNOR_IN
        );

        dao.submitProposal(proposalId);
    }

    function _submitGovernorOutProposal(
        DaoRegistry dao,
        bytes32 proposalId,
        address applicant,
        uint256 startVoteTime,
        uint256 stopVoteTime
    ) internal {
        require(dao.isMember(applicant), "isnt governor");

        proposals[dao][proposalId] = ProposalDetails(
            proposalId,
            applicant,
            address(0x0),
            0,
            startVoteTime,
            stopVoteTime,
            ProposalState.Voting,
            ProposalType.GOVERNOR_OUT
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
        ICollectiveVoting collectiveVotingContract = ICollectiveVoting(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
        );

        require(
            address(collectiveVotingContract) != address(0),
            "adapter not found"
        );

        ICollectiveVoting.VotingState voteResult;
        uint256 nbYes;
        uint256 nbNo;
        (voteResult, nbYes, nbNo) = collectiveVotingContract.voteResult(
            dao,
            proposalId
        );
        uint128 allWeight = GovernanceHelper
            .getAllCollectiveGovernorVotingWeight(dao);

        dao.processProposal(proposalId);

        if (voteResult == ICollectiveVoting.VotingState.PASS) {
            proposal.state = ProposalState.Executing;
            address applicant = proposal.account;

            if (proposal.pType == ProposalType.GOVERNOR_IN) {
                dao.potentialNewMember(applicant);
            }

            if (proposal.pType == ProposalType.GOVERNOR_OUT) {
                dao.removeMember(applicant);
            }

            proposal.state = ProposalState.Done;
        } else if (
            voteResult == ICollectiveVoting.VotingState.NOT_PASS ||
            voteResult == ICollectiveVoting.VotingState.TIE
        ) {
            proposal.state = ProposalState.Failed;
        } else {
            revert("proposal has not been voted on yet");
        }
        if (unDoneProposals[address(dao)].contains(proposalId))
            unDoneProposals[address(dao)].remove(proposalId);

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

    function registerGovernorWhiteList(
        DaoRegistry dao,
        address account
    ) external {
        require(
            // msg.sender ==
            //     dao.getAdapterAddress(
            //         DaoHelper.COLLECTIVE_DAO_SET_HELPER_ADAPTER
            //     ) ||
            DaoHelper.isInCreationModeAndHasAccess(dao),
            "!access"
        );
        if (!governorWhiteList[address(dao)].contains(account)) {
            governorWhiteList[address(dao)].add(account);
        }
    }

    function clearGovernorWhitelist(DaoRegistry dao) external {
        require(
            msg.sender ==
                dao.getAdapterAddress(
                    DaoHelper.COLLECTIVE_DAO_SET_HELPER_ADAPTER
                ),
            "!access"
        );
        uint256 len = governorWhiteList[address(dao)].values().length;
        address[] memory tem;
        tem = governorWhiteList[address(dao)].values();
        if (len > 0) {
            for (uint8 i = 0; i < len; i++) {
                governorWhiteList[address(dao)].remove(tem[i]);
            }
        }
    }

    function getGovernorAmount(
        DaoRegistry dao
    ) external view returns (uint256) {
        return DaoHelper.getActiveMemberNb(dao);
    }

    function getAllGovernor(
        DaoRegistry dao
    ) external view returns (address[] memory) {
        return DaoHelper.getAllActiveMember(dao);
    }

    function allDone(DaoRegistry dao) external view returns (bool) {
        return unDoneProposals[address(dao)].length() > 0 ? false : true;
    }

    function getGovernorWhitelist(
        address daoAddr
    ) external view returns (address[] memory) {
        return governorWhiteList[daoAddr].values();
    }
}
