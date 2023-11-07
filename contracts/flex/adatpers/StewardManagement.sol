pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "../../helpers/DaoHelper.sol";
import "../../helpers/GovernanceHelper.sol";
import "../../utils/TypeConver.sol";
import "./FlexVoting.sol";
import "./interfaces/IFlexVoting.sol";
import "./FlexStewardAllocation.sol";
import "./FlexDaoSetAdapter.sol";
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
        uint256 allocation;
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

    function registerGovernorWhiteList(
        DaoRegistry dao,
        address account
    ) external {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER) ||
                dao.isMember(msg.sender),
            "!access"
        );
        if (!governorWhiteList[address(dao)].contains(account)) {
            governorWhiteList[address(dao)].add(account);
        }
    }

    function clearGovernorWhitelist(DaoRegistry dao) external {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER),
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

    function daosetProposalCheck(DaoRegistry dao) internal view returns (bool) {
        FlexDaoSetAdapterContract daoset = FlexDaoSetAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_ADAPTER)
        );
        return daoset.isProposalAllDone(dao);
    }

    function submitGovernorInProposal(
        DaoRegistry dao,
        address applicant,
        uint256 allocation
    )
        external
        reimbursable(dao)
        onlyMember(dao)
        onlySteward(dao, applicant)
        returns (bytes32)
    {
        require(!dao.isMember(applicant), "applicant is strward already");
        require(
            DaoHelper.isNotReservedAddress(applicant),
            "applicant is reserved address"
        );
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
            allocation,
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
        require(dao.isMember(applicant), "applicant isnt governor");
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
        IFlexVoting flexVotingContract = IFlexVoting(
            dao.getAdapterAddress(DaoHelper.FLEX_VOTING_ADAPT)
        );
        // address sponsoredBy = flexVotingContract.getSenderAddress(
        //     dao,
        //     address(this),
        //     data,
        //     msg.sender
        // );
        dao.sponsorProposal(
            proposalId,
            dao.getAdapterAddress(DaoHelper.FLEX_VOTING_ADAPT)
        );
        flexVotingContract.startNewVotingForProposal(dao, proposalId, data);
    }

    /**
     * @notice Marks the proposalId as submitted in the DAO and saves the information in the internal adapter state.
     * @notice Updates the total of units issued in the DAO, and checks if it is within the limits.
     */
    function _submitGovernorInProposal(
        DaoRegistry dao,
        bytes32 proposalId,
        address applicant,
        uint256 allocation,
        uint256 startVoteTime,
        uint256 stopVoteTime
    ) internal {
        require(!dao.isMember(applicant), "governor existed");

        proposals[dao][proposalId] = ProposalDetails(
            proposalId,
            applicant,
            allocation,
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
        uint128 allWeight = GovernanceHelper
            .getAllFlexGovernorVotingWeightByProposalId(dao, proposalId);

        dao.processProposal(proposalId);

        if (voteResult == IFlexVoting.VotingState.PASS) {
            proposal.state = ProposalState.Executing;
            address applicant = proposal.account;

            if (proposal.pType == ProposalType.GOVERNOR_IN) {
                dao.potentialNewMember(applicant);
                if (
                    dao.getConfiguration(
                        DaoHelper.FLEX_VOTING_ELIGIBILITY_TYPE
                    ) == 3
                ) {
                    FlexStewardAllocationAdapter stewardAlloc = FlexStewardAllocationAdapter(
                            dao.getAdapterAddress(
                                DaoHelper.FLEX_STEWARD_ALLOCATION_ADAPT
                            )
                        );
                    stewardAlloc.setAllocation(
                        dao,
                        proposal.account,
                        proposal.allocation
                    );
                }
            }

            if (proposal.pType == ProposalType.GOVERNOR_OUT) {
                dao.removeMember(applicant);
                FlexStewardAllocationAdapter stewardAlloc = FlexStewardAllocationAdapter(
                        dao.getAdapterAddress(
                            DaoHelper.FLEX_STEWARD_ALLOCATION_ADAPT
                        )
                    );
                // remove governor set allocation to 0
                stewardAlloc.setAllocation(dao, proposal.account, 0);
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
        FlexStewardAllocationAdapter stewardAlloc = FlexStewardAllocationAdapter(
                dao.getAdapterAddress(DaoHelper.FLEX_STEWARD_ALLOCATION_ADAPT)
            );
        // remove governor set allocation to 0
        stewardAlloc.setAllocation(dao, msg.sender, 0);
    }

    function isGovernorWhiteList(
        DaoRegistry dao,
        address account
    ) external view returns (bool) {
        return governorWhiteList[address(dao)].contains(account);
    }

    function getGovernorWhitelist(
        DaoRegistry dao
    ) external view returns (address[] memory) {
        return governorWhiteList[address(dao)].values();
    }

    function getGovernorAmount(DaoRegistry dao) external view returns (uint256) {
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
}
