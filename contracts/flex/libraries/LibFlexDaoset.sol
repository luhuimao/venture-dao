pragma solidity ^0.8.0;
import "../../helpers/DaoHelper.sol";

// SPDX-License-Identifier: MIT

library FlexDaosetLibrary {
    struct InvestorCapProposalDetails {
        bool enable;
        uint256 cap;
        uint256 creationTime;
        uint256 stopVoteTime;
        ProposalState state;
    }

    struct GovernorMembershipProposalDetails {
        bool enable;
        uint8 varifyType;
        uint256 minAmount;
        address tokenAddress;
        uint256 tokenId;
        uint256 creationTime;
        uint256 stopVoteTime;
        ProposalState state;
    }

    struct InvestorMembershipProposalDetails {
        bool enable;
        string name;
        uint8 varifyType;
        uint256 minAmount;
        address tokenAddress;
        uint256 tokenId;
        uint256 creationTime;
        uint256 stopVoteTime;
        ProposalState state;
    }

    struct VotingProposalDetails {
        VotingSupportInfo supportInfo;
        VotingAssetInfo votingAssetInfo;
        VotingTimeInfo timeInfo;
        VotingAllocation allocations;
        ProposalState state;
    }

    struct FeeProposalDetails {
        uint256 flexDaoManagementfee;
        uint256 returnTokenManagementFee;
        address managementFeeAddress;
        uint256 creationTime;
        uint256 stopVoteTime;
        ProposalState state;
    }

    struct ProposerMembershipProposalDetails {
        bool proposerMembershipEnable;
        uint8 varifyType; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
        uint256 minHolding;
        address tokenAddress;
        uint256 tokenId;
        uint256 creationTime;
        uint256 stopVoteTime;
        ProposalState state;
    }

    struct PollForInvestmentProposalDetails {
        uint8 varifyType;
        uint256 minHolding;
        address tokenAddress;
        uint256 tokenId;
        flexDaoPollingInfo pollingInfo;
        uint256 creationTime;
        uint256 stopVoteTime;
        ProposalState state;
    }

    struct flexDaoPollingInfo {
        uint256 votingPeriod;
        uint8 votingPower;
        uint256 superMajority;
        uint256 quorum;
        uint256 votingAssetType; //0. erc20 1.erc721 2.erc1155 3.allocation
        address tokenAddress;
        uint256 tokenID;
        uint256 supportType; // 0. YES - NO > X
        uint256 quorumType; // 0. YES + NO > X
    }

    struct PollForInvestmentParams {
        DaoRegistry dao;
        FlexDaoPollVoterMembershipInfo pollvoterMembership;
        flexDaoPollingInfo pollingInfo;
    }

    struct FlexDaoPollVoterMembershipInfo {
        uint8 varifyType;
        uint256 minHolding;
        address tokenAddress;
        uint256 tokenId;
        address[] whiteList;
    }

    struct VotingSupportInfo {
        uint256 supportType;
        uint256 quorumType;
        uint256 support;
        uint256 quorum;
    }

    struct VotingTimeInfo {
        uint256 votingPeriod;
        uint256 executingPeriod;
        uint256 creationTime;
        uint256 stopVoteTime;
    }

    struct VotingAllocation{
        uint256[] allocs;
    }

    struct VotingAssetInfo {
        uint256 votingAssetType;
        address tokenAddress;
        uint256 tokenID;
        uint256 votingWeightedType;
    }

    struct VotingParams {
        DaoRegistry dao;
        uint256 votingAssetType;
        address tokenAddress;
        uint256 tokenID;
        uint256 votingWeightedType;
        uint256 supportType;
        uint256 quorumType;
        uint256 support;
        uint256 quorum;
        uint256 votingPeriod;
        uint256 executingPeriod;
        address[] governors;
        uint256[] allocations;
    }

    struct ProposerMembershipParams {
        DaoRegistry dao;
        bool proposerMembershipEnable;
        uint8 varifyType; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
        uint256 minHolding;
        address tokenAddress;
        uint256 tokenId;
        address[] whiteList;
    }

    struct InvestorMembershipParams {
        DaoRegistry dao;
        bool enable;
        string name;
        uint8 varifyType;
        uint256 minAmount;
        address tokenAddress;
        uint256 tokenId;
        address[] whiteList;
    }

    struct GovernorMembershipParams {
        DaoRegistry dao;
        bool enable;
        uint8 varifyType;
        uint256 minAmount;
        address tokenAddress;
        uint256 tokenId;
        address[] whiteList;
    }

    enum ProposalState {
        Voting,
        Executing,
        Done,
        Failed
    }

    enum ProposalType {
        INVESTOR_CAP,
        GOVERNOR_MEMBERSHIP,
        INVESTOR_MEMBERSHIP,
        VOTING,
        FEES,
        PROPOSER_MEMBERHSIP,
        POLL_FOR_INVESTMENT
    }

    error VOTING_NOT_FINISH();
}
