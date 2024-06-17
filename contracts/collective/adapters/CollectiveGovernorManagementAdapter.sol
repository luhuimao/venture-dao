pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "./interfaces/ICollectiveVoting.sol";
import "./CollectiveDaoSetProposalAdapter.sol";
import "./CollectiveFundingPoolAdapter.sol";
import "./CollectiveFundingProposalAdapter.sol";
import "../../helpers/DaoHelper.sol";
import "../../helpers/GovernanceHelper.sol";
import "../../utils/TypeConver.sol";
import "../../adapters/modifiers/Reimbursable.sol";
// import "../../guards/FlexStewardGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "hardhat/console.sol";

contract ColletiveGovernorManagementAdapterContract is
    Reimbursable,
    MemberGuard
{
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    enum ProposalState {
        Submitted,
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
        uint256 startVoteTime;
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
    event StartVoting(
        address daoAddr,
        bytes32 proposalId,
        ProposalState state,
        uint256 startVoteTime,
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
    event GovernorQuit(address daoAddr, address governor);
    error UNDONE_INVESTMET_PROPOSAL();
    error NOT_GRACE_PERIOD();
    error SUMMONOR_CANT_QUIT();
    // proposals per dao
    mapping(DaoRegistry => mapping(bytes32 => ProposalDetails))
        public proposals;
    mapping(address => EnumerableSet.AddressSet) governorWhiteList;
    mapping(address => EnumerableSet.Bytes32Set) unDoneProposals;
    mapping(address => mapping(bytes32 => mapping(address => mapping(address => uint256))))
        public approvedInfos; // dao => funding proposal => approver => erc20 => amount

    modifier governorMembershipVarify(DaoRegistry dao, address account) {
        if (
            dao.getConfiguration(
                DaoHelper.COLLECTIVE_GOVERNOR_MEMBERSHIP_ENABLE
            ) == 1
        ) {
            uint256 varifyType = dao.getConfiguration(
                DaoHelper.COLLECTIVE_GOVERNOR_MEMBERSHIP_TYPE
            );
            uint256 minHolding = dao.getConfiguration(
                DaoHelper.COLLECTIVE_GOVERNOR_MEMBERSHIP_MINI_HOLDING
            );
            uint256 tokenId = dao.getConfiguration(
                DaoHelper.COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ID
            );
            address tokenAddress = dao.getAddressConfiguration(
                DaoHelper.COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS
            );
            ColletiveFundingPoolAdapterContract fundingpoolAdapt = ColletiveFundingPoolAdapterContract(
                    dao.getAdapterAddress(
                        DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER
                    )
                );
            //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS
            if (varifyType == 0) {
                require(
                    IERC20(tokenAddress).balanceOf(account) >= minHolding,
                    "< erc20 token min holding requirment"
                );
            } else if (varifyType == 1) {
                require(
                    IERC721(tokenAddress).balanceOf(account) >= minHolding,
                    "< erc721 token min holding requirment"
                );
            } else if (varifyType == 2) {
                require(
                    IERC1155(tokenAddress).balanceOf(account, tokenId) >=
                        minHolding,
                    "< erc1155 token min holding requirment"
                );
            } else if (varifyType == 3) {
                require(
                    isGovernorWhiteList(dao, account),
                    "not in governor whitelist"
                );
            } else {
                revert("invalid membership type");
            }
        }
        _;
    }

    function daosetProposalCheck(DaoRegistry dao) internal view returns (bool) {
        ColletiveDaoSetProposalAdapterContract daoset = ColletiveDaoSetProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_DAO_SET_ADAPTER)
            );
        return daoset.isProposalAllDone(dao);
        // return true;
    }

    struct SubmitGovernorInLocalParams {
        bytes32 proposalId;
        uint256 startVoteTime;
        uint256 stopVoteTime;
    }

    function submitGovernorInProposal(
        DaoRegistry dao,
        address applicant,
        uint256 depositAmount
    )
        external
        reimbursable(dao)
        onlyMember(dao)
        governorMembershipVarify(dao, applicant)
        returns (bytes32)
    {
        SubmitGovernorInLocalParams memory vars;
        require(!dao.isMember(applicant), "Is Governor already");

        require(daosetProposalCheck(dao), "UnDone Daoset Proposal");
        ColletiveFundingProposalAdapterContract fundingCont = ColletiveFundingProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUNDING_ADAPTER)
            );
        if (!fundingCont.allDone(dao)) revert UNDONE_INVESTMET_PROPOSAL();
        dao.increaseGovenorInId();
        vars.proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "Governor-In#",
                Strings.toString(dao.getCurrentGovenorInProposalId())
            )
        );

        address tokenAddress = dao.getAddressConfiguration(
            DaoHelper.FUND_RAISING_CURRENCY_ADDRESS
        );
        _submitGovernorInProposal(
            dao,
            vars.proposalId,
            applicant,
            tokenAddress,
            depositAmount,
            vars.startVoteTime,
            vars.stopVoteTime
        );

        _sponsorProposal(dao, vars.proposalId);
        unDoneProposals[address(dao)].add(vars.proposalId);
        emit ProposalCreated(
            address(dao),
            vars.proposalId,
            applicant,
            vars.startVoteTime,
            vars.stopVoteTime,
            ProposalType.GOVERNOR_IN
        );
        return vars.proposalId;
    }

    function setGovernorInApprove(
        address dao,
        bytes32 proposalId,
        address erc20,
        uint256 amount
    ) external returns (bool) {
        approvedInfos[dao][proposalId][msg.sender][erc20] = amount;
        return true;
    }

    function startVoting(
        DaoRegistry dao,
        bytes32 proposalId
    ) external onlyMember(dao) returns (bool) {
        ProposalDetails storage proposal = proposals[dao][proposalId];
        require(proposal.state == ProposalState.Submitted, "!Submitted");

        if (
            IERC20(proposal.tokenAddress).balanceOf(proposal.account) <
            proposal.depositAmount ||
            IERC20(proposal.tokenAddress).allowance(
                proposal.account,
                dao.getAdapterAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER
                )
            ) <
            proposal.depositAmount ||
            approvedInfos[address(dao)][proposalId][proposal.account][
                proposal.tokenAddress
            ] <
            proposal.depositAmount
        ) {
            proposal.state = ProposalState.Failed;
            // return false;
        } else {
            ICollectiveVoting collectiveVotingContract = ICollectiveVoting(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
            );

            collectiveVotingContract.startNewVotingForProposal(
                dao,
                proposalId,
                bytes("")
            );
            proposal.state = ProposalState.Voting;

            proposal.startVoteTime = block.timestamp;
            proposal.stopVoteTime =
                proposal.startVoteTime +
                dao.getConfiguration(DaoHelper.VOTING_PERIOD);
        }

        emit StartVoting(
            address(dao),
            proposalId,
            proposal.state,
            proposal.startVoteTime,
            proposal.stopVoteTime
        );
        return true;
    }

    function submitGovernorOutProposal(
        DaoRegistry dao,
        address applicant
    ) external onlyMember(dao) reimbursable(dao) returns (bytes32) {
        require(dao.isMember(applicant), "Applicant Isnt Governor");
        require(daosetProposalCheck(dao), "UnDone Daoset Proposal");
        ColletiveFundingProposalAdapterContract fundingCont = ColletiveFundingProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUNDING_ADAPTER)
            );
        if (!fundingCont.allDone(dao)) revert UNDONE_INVESTMET_PROPOSAL();
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

        _sponsorProposal(dao, proposalId);
        ICollectiveVoting collectiveVotingContract = ICollectiveVoting(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
        );

        collectiveVotingContract.startNewVotingForProposal(
            dao,
            proposalId,
            bytes("")
        );
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
    function _sponsorProposal(DaoRegistry dao, bytes32 proposalId) internal {
        dao.sponsorProposal(
            proposalId,
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
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
            ProposalState.Submitted,
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
        require(proposal.state == ProposalState.Voting, "already processed");
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
                ColletiveFundingPoolAdapterContract fundingPoolAdapt = ColletiveFundingPoolAdapterContract(
                        dao.getAdapterAddress(
                            DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER
                        )
                    );

                if (
                    fundingPoolAdapt.transferFromNewGovernor(
                        dao,
                        proposal.tokenAddress,
                        proposal.account,
                        proposal.depositAmount
                    )
                ) {
                    dao.potentialNewMember(applicant);
                    proposal.state = ProposalState.Done;
                } else {
                    proposal.state = ProposalState.Failed;
                }

                // fundingPoolAdapt.transferFromNewGovernor(
                //     dao,
                //     proposal.tokenAddress,
                //     proposal.account,
                //     proposal.depositAmount
                // );
            }

            if (proposal.pType == ProposalType.GOVERNOR_OUT) {
                dao.removeMember(applicant);
                ColletiveFundingPoolAdapterContract fundingpoolAdapt = ColletiveFundingPoolAdapterContract(
                        dao.getAdapterAddress(
                            DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER
                        )
                    );
                fundingpoolAdapt.returnFundToQuitGovernor(dao, msg.sender);

                proposal.state = ProposalState.Done;
            }
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
        if (dao.state() == DaoRegistry.DaoState.READY) {
            ColletiveFundingProposalAdapterContract fundingProposalAdapt = ColletiveFundingProposalAdapterContract(
                    dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUNDING_ADAPTER)
                );

            if (!fundingProposalAdapt.isPrposalInGracePeriod(dao))
                revert NOT_GRACE_PERIOD();
            if (dao.daoCreator() == msg.sender) revert SUMMONOR_CANT_QUIT();
            ColletiveFundingPoolAdapterContract fundingpoolAdapt = ColletiveFundingPoolAdapterContract(
                    dao.getAdapterAddress(
                        DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER
                    )
                );
            fundingpoolAdapt.returnFundToQuitGovernor(dao, msg.sender);
        }
        dao.removeMember(msg.sender);

        emit GovernorQuit(address(dao), msg.sender);
    }

    function registerGovernorWhiteList(
        DaoRegistry dao,
        address account
    ) external {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_DAO_SET_ADAPTER) ||
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
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_DAO_SET_ADAPTER),
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

    function isGovernorWhiteList(
        DaoRegistry dao,
        address account
    ) public view returns (bool) {
        return governorWhiteList[address(dao)].contains(account);
    }
}
