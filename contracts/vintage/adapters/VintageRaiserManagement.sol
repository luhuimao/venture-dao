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
        RAISER_IN,
        RAISER_OUT
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
    mapping(address => EnumerableSet.AddressSet) raiserWhiteList;

    // uint256 public raiserInProposalIds = 1;
    // uint256 public raiserdOutProposalIds = 1;

    modifier onlyRaiser(DaoRegistry dao, address account) {
        if (
            dao.getConfiguration(DaoHelper.VINTAGE_RAISER_MEMBERSHIP_ENABLE) ==
            1
        ) {
            uint256 varifyType = dao.getConfiguration(
                DaoHelper.VINTAGE_RAISER_MEMBERSHIP_TYPE
            );
            uint256 minHolding = dao.getConfiguration(
                DaoHelper.VINTAGE_RAISER_MEMBERSHIP_MIN_HOLDING
            );
            uint256 minDeposit = dao.getConfiguration(
                DaoHelper.VINTAGE_RAISER_MEMBERSHIP_MIN_DEPOSIT
            );
            uint256 tokenId = dao.getConfiguration(
                DaoHelper.VINTAGE_RAISER_MEMBERSHIP_TOKENID
            );
            address tokenAddress = dao.getAddressConfiguration(
                DaoHelper.VINTAGE_RAISER_MEMBERSHIP_TOKEN_ADDRESS
            );
            VintageFundingPoolAdapterContract fundingpoolAdapt = VintageFundingPoolAdapterContract(
                    dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_POOL_ADAPT)
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
                    isRaiserWhiteList(dao, account),
                    "not in raiser whitelist"
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

    function registerRaiserWhiteList(
        DaoRegistry dao,
        address account
    ) external {
        require(
            dao.isMember(msg.sender) ||
                msg.sender ==
                dao.getAdapterAddress(DaoHelper.VINTAGE_DAO_SET_ADAPTER),
            "!access"
        );
        if (!raiserWhiteList[address(dao)].contains(account)) {
            raiserWhiteList[address(dao)].add(account);
        }
    }

    function clearGovernorWhitelist(DaoRegistry dao) external {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.VINTAGE_DAO_SET_ADAPTER),
            "!access"
        );
        uint256 len = raiserWhiteList[address(dao)].values().length;
        address[] memory tem;
        tem = raiserWhiteList[address(dao)].values();
        if (len > 0) {
            for (uint8 i = 0; i < len; i++) {
                raiserWhiteList[address(dao)].remove(tem[i]);
            }
        }
    }

    function submitRaiserInProposal(
        DaoRegistry dao,
        address applicant,
        uint256 allocation
    )
        external
        reimbursable(dao)
        onlyMember(dao)
        onlyRaiser(dao, applicant)
        returns (bytes32)
    {
        require(!dao.isMember(applicant), "applicant is raiser already");
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

        _submitRaiserInProposal(
            dao,
            proposalId,
            applicant,
            allocation,
            startVoteTime,
            stopVoteTime
        );

        _sponsorProposal(dao, proposalId, bytes(""));
        // raiserInProposalIds += 1;

        emit ProposalCreated(
            address(dao),
            proposalId,
            applicant,
            startVoteTime,
            stopVoteTime,
            ProposalType.RAISER_IN
        );
        return proposalId;
    }

    function submitSteWardOutProposal(
        DaoRegistry dao,
        address applicant
    ) external onlyMember(dao) reimbursable(dao) returns (bytes32) {
        require(dao.isMember(applicant), "applicant isnt raiser");
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
        // raiserdOutProposalIds += 1;

        emit ProposalCreated(
            address(dao),
            proposalId,
            applicant,
            startVoteTime,
            stopVoteTime,
            ProposalType.RAISER_OUT
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
        // address sponsoredBy = vintageVotingContract.getSenderAddress(
        //     dao,
        //     address(this),
        //     data,
        //     msg.sender
        // );
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
    function _submitRaiserInProposal(
        DaoRegistry dao,
        bytes32 proposalId,
        address applicant,
        uint256 allocation,
        uint256 startVoteTime,
        uint256 stopVoteTime
    ) internal {
        require(!dao.isMember(applicant), "raiser existed");

        proposals[dao][proposalId] = ProposalDetails(
            proposalId,
            applicant,
            allocation,
            startVoteTime,
            stopVoteTime,
            ProposalState.Voting,
            ProposalType.RAISER_IN
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
        require(dao.isMember(applicant), "isnt raiser");

        proposals[dao][proposalId] = ProposalDetails(
            proposalId,
            applicant,
            0,
            startVoteTime,
            stopVoteTime,
            ProposalState.Voting,
            ProposalType.RAISER_OUT
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
            .getVintageAllRaiserVotingWeightByProposalId(dao, proposalId);

        if (voteResult == IVintageVoting.VotingState.PASS) {
            proposal.state = ProposalState.Executing;
            address applicant = proposal.account;

            if (proposal.pType == ProposalType.RAISER_IN) {
                dao.potentialNewMember(applicant);
                if (
                    dao.getConfiguration(
                        DaoHelper.VINTAGE_VOTING_ELIGIBILITY_TYPE
                    ) == 3
                ) {
                    VintageRaiserAllocationAdapter raiserAlloc = VintageRaiserAllocationAdapter(
                            dao.getAdapterAddress(
                                DaoHelper.VINTAGE_RAISER_ALLOCATION_ADAPTER
                            )
                        );
                    raiserAlloc.setAllocation(
                        dao,
                        proposal.account,
                        proposal.allocation
                    );
                }
            }

            if (proposal.pType == ProposalType.RAISER_OUT) {
                dao.removeMember(applicant);
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
    }

    function isRaiserWhiteList(
        DaoRegistry dao,
        address account
    ) public view returns (bool) {
        return raiserWhiteList[address(dao)].contains(account);
    }

    function getRaiserWhitelist(
        DaoRegistry dao
    ) external view returns (address[] memory) {
        return raiserWhiteList[address(dao)].values();
    }

    function getRaiserAmount(DaoRegistry dao) external view returns (uint256) {
        return DaoHelper.getActiveMemberNb(dao);
    }

    function getAllRaiser(
        DaoRegistry dao
    ) external view returns (address[] memory) {
        return DaoHelper.getAllActiveMember(dao);
    }
}
