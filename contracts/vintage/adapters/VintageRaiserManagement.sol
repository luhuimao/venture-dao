pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "../../helpers/DaoHelper.sol";
import "../../utils/TypeConver.sol";
import "./VintageVoting.sol";
import "./VintageFundingPoolAdapter.sol";
import "./VintageRaiserAllocation.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "hardhat/console.sol";

contract VintageRaiserManagementContract is Reimbursable, MemberGuard {
    using EnumerableSet for EnumerableSet.AddressSet;

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
        uint256 voteResult,
        uint128 allVotingWeight,
        uint128 nbYes,
        uint128 nbNo
    );

    // proposals per dao
    mapping(DaoRegistry => mapping(bytes32 => ProposalDetails))
        public proposals;
    mapping(address => EnumerableSet.AddressSet) governorWhiteList;

    modifier onlyGovernor(DaoRegistry dao, address account) {
        if (
            dao.getConfiguration(DaoHelper.VINTAGE_GOVERNOR_MEMBERSHIP_ENABLE) ==
            1
        ) {
            uint256 varifyType = dao.getConfiguration(
                DaoHelper.VINTAGE_GOVERNOR_MEMBERSHIP_TYPE
            );
            uint256 minHolding = dao.getConfiguration(
                DaoHelper.VINTAGE_GOVERNOR_MEMBERSHIP_MIN_HOLDING
            );
            uint256 minDeposit = dao.getConfiguration(
                DaoHelper.VINTAGE_GOVERNOR_MEMBERSHIP_MIN_DEPOSIT
            );
            uint256 tokenId = dao.getConfiguration(
                DaoHelper.VINTAGE_GOVERNOR_MEMBERSHIP_TOKENID
            );
            address tokenAddress = dao.getAddressConfiguration(
                DaoHelper.VINTAGE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS
            );
            VintageFundingPoolAdapterContract fundingpoolAdapt = VintageFundingPoolAdapterContract(
                    dao.getAdapterAddress(
                        DaoHelper.VINTAGE_INVESTMENT_POOL_ADAPT
                    )
                );
            //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS 4 DEPOSIT
            if (varifyType == 0) {
                require(
                    IERC20(tokenAddress).balanceOf(account) >= minHolding,
                    "dont meet min erc20 token holding requirment"
                );
            } else if (varifyType == 1) {
                require(
                    IERC721(tokenAddress).balanceOf(account) >= minHolding,
                    "dont meet min erc721 token holding requirment"
                );
            } else if (varifyType == 2) {
                require(
                    IERC1155(tokenAddress).balanceOf(account, tokenId) >=
                        minHolding,
                    "dont meet min erc1155 token holding requirment"
                );
            } else if (varifyType == 3) {
                require(
                    isGovernorWhiteList(dao, account),
                    "not in governor whitelist"
                );
            } else if (varifyType == 4) {
                require(
                    fundingpoolAdapt.balanceOf(dao, account) >= minDeposit,
                    "dont meet min depoist requirment"
                );
            } else {
                revert("invalid membership type");
            }
        }
        _;
    }

    function registerGovernorWhiteList(
        DaoRegistry dao,
        address account
    ) external {
        require(
            dao.isMember(msg.sender) ||
                msg.sender ==
                dao.getAdapterAddress(DaoHelper.VINTAGE_DAO_SET_ADAPTER),
            "!access"
        );
        if (!governorWhiteList[address(dao)].contains(account)) {
            governorWhiteList[address(dao)].add(account);
        }
    }

    function clearGovernorWhitelist(DaoRegistry dao) external {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.VINTAGE_DAO_SET_ADAPTER),
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

    function submitGovernorInProposal(
        DaoRegistry dao,
        address applicant,
        uint256 allocation
    )
        external
        reimbursable(dao)
        onlyMember(dao)
        onlyGovernor(dao, applicant)
        returns (bytes32)
    {
        require(!dao.isMember(applicant), "applicant is governor already");
        require(
            DaoHelper.isNotReservedAddress(applicant),
            "applicant is reserved address"
        );
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

        _submitStewardOutProposal(
            dao,
            proposalId,
            applicant,
            startVoteTime,
            stopVoteTime
        );

        _sponsorProposal(dao, proposalId, bytes(""));

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
        IVintageVoting vintageVotingContract = IVintageVoting(
            dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );
        
        dao.sponsorProposal(
            proposalId,
            dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );
        vintageVotingContract.startNewVotingForProposal(
            dao,
            proposalId,
            block.timestamp,
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

    function _submitStewardOutProposal(
        DaoRegistry dao,
        bytes32 proposalId,
        address applicant,
        uint256 startVoteTime,
        uint256 stopVoteTime
    ) internal {
        require(dao.isMember(applicant), "!governor");

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
        IVintageVoting vintageVotingContract = IVintageVoting(
            dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );

        require(
            address(vintageVotingContract) != address(0),
            "adapter not found"
        );

        IVintageVoting.VotingState voteResult;
        uint128 nbYes;
        uint128 nbNo;
        (voteResult, nbYes, nbNo) = vintageVotingContract.voteResult(
            dao,
            proposalId
        );

        dao.processProposal(proposalId);

        uint128 allGPsWeight = GovernanceHelper
            .getVintageAllGovernorVotingWeightByProposalId(dao, proposalId);

        if (voteResult == IVintageVoting.VotingState.PASS) {
            proposal.state = ProposalState.Executing;
            address applicant = proposal.account;

            if (proposal.pType == ProposalType.GOVERNOR_IN) {
                dao.potentialNewMember(applicant);
                if (
                    dao.getConfiguration(
                        DaoHelper.VINTAGE_VOTING_ASSET_TYPE
                    ) == 3
                ) {
                    VintageRaiserAllocationAdapter governorAlloc = VintageRaiserAllocationAdapter(
                            dao.getAdapterAddress(
                                DaoHelper.VINTAGE_GOVERNOR_ALLOCATION_ADAPTER
                            )
                        );
                    governorAlloc.setAllocation(
                        dao,
                        proposal.account,
                        proposal.allocation
                    );
                }
            }

            if (proposal.pType == ProposalType.GOVERNOR_OUT) {
                dao.removeMember(applicant);
                // reset allocation to 0
                VintageRaiserAllocationAdapter governorAlloc = VintageRaiserAllocationAdapter(
                        dao.getAdapterAddress(
                            DaoHelper.VINTAGE_GOVERNOR_ALLOCATION_ADAPTER
                        )
                    );
                governorAlloc.setAllocation(dao, proposal.account, 0);
            }

            proposal.state = ProposalState.Done;
        } else if (
            voteResult == IVintageVoting.VotingState.NOT_PASS ||
            voteResult == IVintageVoting.VotingState.TIE
        ) {
            proposal.state = ProposalState.Failed;
        } else {
            revert("proposal has not been voted on yet");
        }

        emit ProposalProcessed(
            address(dao),
            proposalId,
            proposal.state,
            uint256(voteResult),
            allGPsWeight,
            nbYes,
            nbNo
        );
    }

    function quit(DaoRegistry dao) external onlyMember(dao) {
        require(dao.daoCreator() != msg.sender, "dao summonor cant quit");
        dao.removeMember(msg.sender);
        // reset allocation to 0
        VintageRaiserAllocationAdapter governorAlloc = VintageRaiserAllocationAdapter(
                dao.getAdapterAddress(
                    DaoHelper.VINTAGE_GOVERNOR_ALLOCATION_ADAPTER
                )
            );
        governorAlloc.setAllocation(dao, msg.sender, 0);
    }

    function isGovernorWhiteList(
        DaoRegistry dao,
        address account
    ) public view returns (bool) {
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
}
