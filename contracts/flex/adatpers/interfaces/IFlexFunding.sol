pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

// import "../../../core/DaoRegistry.sol";
// import "../../../helpers/DaoHelper.sol";
import "./IFlexVoting.sol";
import "../../extensions/FlexFundingPool.sol";
import "../FlexFundingPoolAdapter.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../FlexAllocation.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

interface IFlexFunding {
    function submitProposal(
        DaoRegistry dao,
        ProposalParams calldata params
    ) external;

    function processProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external returns (bool);

    enum InvestmentType {
        DIRECT,
        POLL
    }
    // The proposal status
    enum ProposalStatus {
        IN_VOTING_PROGRESS,
        IN_FUND_RAISE_PROGRESS,
        IN_EXECUTE_PROGRESS,
        DONE,
        FAILED
    }
    enum FundRaiseType {
        FCSF,
        FREE_IN
    }
    enum InvestorIdentificationType {
        ERC20,
        ERC721,
        ERC1155,
        WHITE_LIST
    }
    enum PriorityDepositType {
        ERC20,
        ERC721,
        ERC1155,
        WHITE_LIST
    }
    /*
     * STRUCT
     */
    struct ProcessProposalLocalVars {
        ProposalInfo proposalInfo;
        uint256 minInvestmentAmount;
        uint256 maxInvestmentAmount;
        FlexInvestmentPoolAdapterContract flexInvestmentPoolAdapt;
        FlexInvestmentPoolExtension flexInvestmentPoolExt;
        FlexAllocationAdapterContract flexAllocAdapt;
        IFlexVoting flexVoting;
        IFlexVoting.VotingState voteResult;
        address recipientAddr;
        uint256 fundRaiseEndTime;
        uint160 poolBalance;
        uint256 protocolFee;
        uint256 managementFee;
        uint256 paybackTokenManagementFee;
        uint256 proposerReward;
        address propodalInvestmentToken;
        address paybackToken;
        address proposer;
        uint256 totalSendOutAmount;
        uint256 paybackTokenAmount;
        address[] investors;
        uint8 decimals1;
        uint8 decimals2;
        uint8 decimalsChanged;
    }

    struct SubmitProposalLocalVars {
        uint256 lastFundEndTime;
        IFlexVoting flexVotingContract;
        FlexInvestmentPoolExtension flexInvestmentPoolExt;
        address fundRaiseTokenAddr;
        address managementFeeAddress;
        address submittedBy;
        bytes32 proposalId;
        uint256 fundRaiseTarget;
        uint256 fundRaiseMaxAmount;
        uint256 lpMinDepositAmount;
        uint256 lpMaxDepositAmount;
        uint256 fundRaiseStartTime;
        uint256 fundRaiseEndTime;
        uint256 fundTerm;
        uint256 redemptPeriod;
        uint256 redemptDuration;
        uint256 returnDuration;
        uint256 proposerRewardRatio;
        uint256 managementFeeRatio;
        uint256 redepmtFeeRatio;
        uint256 protocolFeeRatio;
    }

    struct ProposalParams {
        InvestmentInfo investmentInfo;
        VestInfo vestInfo;
        FundRaiseInfo fundRaiseInfo;
        ProposerRewardInfo proposerRewardInfo;
        address[] priorityDepositWhitelist;
    }

    struct InvestmentInfo {
        address tokenAddress;
        uint256 minInvestmentAmount;
        uint256 maxInvestmentAmount;
        bool escrow;
        address paybackTokenAddr;
        uint256 paybackTokenAmount;
        uint256 price;
        uint256 minReturnAmount;
        uint256 maxReturnAmount;
        address approverAddr;
        address recipientAddr;
    }

    struct ProposalInfo {
        address proposer;
        ProposalInvestmentInfo investmentInfo;
        VestInfo vestInfo;
        FundRaiseInfo fundRaiseInfo;
        ProposerRewardInfo proposerRewardInfo;
        uint256 startVoteTime;
        uint256 stopVoteTime;
        ProposalStatus state;
        uint256 executeBlockNum;
    }

    struct ProposalInvestmentInfo {
        address tokenAddress;
        uint256 minInvestmentAmount;
        uint256 maxInvestmentAmount;
        uint256 investedAmount;
        uint256 finalRaisedAmount;
        bool escrow;
        address paybackTokenAddr;
        uint256 paybackTokenAmount;
        uint256 price;
        uint256 minReturnAmount;
        uint256 maxReturnAmount;
        address approverAddr;
        address recipientAddr;
    }
    struct VestInfo {
        uint256 vestingStartTime;
        uint256 vestingCliffEndTime;
        uint256 vestingEndTime;
        uint256 vestingInterval;
        uint256 vestingCliffLockAmount; // percentage
        bool nftEnable;
        address erc721;
        string vestName;
        string vestDescription;
    }

    struct FundRaiseInfo {
        FundRaiseType fundRaiseType;
        uint256 fundRaiseStartTime;
        uint256 fundRaiseEndTime;
        uint256 minDepositAmount;
        uint256 maxDepositAmount;
        bool investorIdentification;
        InvestorIdentificationInfo investorIdentificationInfo;
        PriorityDepositInfo priorityDepositInfo;
    }
    struct InvestorIdentificationInfo {
        InvestorIdentificationType bType;
        uint32 bChainId;
        address bTokanAddr;
        uint256 bTokenId;
        uint256 bMinHoldingAmount;
    }
    struct PriorityDepositInfo {
        bool enable;
        PriorityDepositType pType;
        address token;
        uint256 tokenId;
        uint256 amount;
    }
    struct ProposerRewardInfo {
        uint256 tokenRewardAmount; //percentage
        uint256 cashRewardAmount; //percentage
    }
    /*
     * EVENTS
     */

    event ProposalCreated(
        address daoAddress,
        bytes32 proposalId,
        address proposer
    );

    event ProposalExecuted(
        address daoAddress,
        bytes32 proposalId,
        ProposalStatus state,
        address[] investors
    );

    error FundRaiseEndTimeNotUP();
    error InvalidInvestorPriorityDepositParams();
    error InvalidInvestorIdentificationParams();
    error InvalidInvestmentInfoParams();
    error InvalidReturnFundParams();
    error InvalidVestingParams();
    error InvalidTokenRewardAmount();
    error NotInExecuteState();
    error ACCESS_DENIED();
    error NOT_MEET_ERC20_REQUIREMENT();
    error NOT_MEET_ERC721_REQUIREMENT();
    error NOT_MEET_ERC1155_REQUIRMENT();
    error NOT_IN_WHITELIST();
    error UNDONE_DAO_SET_PROPOSAL();
    error PROPOSAL_IN_VOTING_PERIOD();
    error ADAPTER_NOT_FOUND();
}
