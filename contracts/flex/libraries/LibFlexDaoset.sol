pragma solidity ^0.8.0;
import "../../helpers/DaoHelper.sol";

// SPDX-License-Identifier: MIT

library FlexDaosetLibrary {
    struct ParticipantCapProposalDetails {
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
        VotingEligibilityInfo eligibilityInfo;
        VotingTimeInfo timeInfo;
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
        uint256 eligibilityType; //0. erc20 1.erc721 2.erc1155 3.allocation
        address tokenAddress;
        uint256 tokenID;
        uint256 supportType; // 0. YES - NO > X
        uint256 quorumType; // 0. YES + NO > X
    }

    struct PollForInvestmentParams {
        DaoRegistry dao;
        flexDaoPollsterMembershipInfo pollsterMembership;
        flexDaoPollingInfo pollingInfo;
    }

    struct flexDaoPollsterMembershipInfo {
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

    struct VotingEligibilityInfo {
        uint256 eligibilityType;
        address tokenAddress;
        uint256 tokenID;
        uint256 votingWeightedType;
    }

    struct VotingParams {
        DaoRegistry dao;
        uint256 eligibilityType;
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
        PARTICIPANT_CAP,
        GOVERNOR_MEMBERSHIP,
        INVESTOR_MEMBERSHIP,
        VOTING,
        FEES,
        PROPOSER_MEMBERHSIP,
        POLL_FOR_INVESTMENT
    }

    error VOTING_NOT_FINISH();

    // event ProposalCreated(
    //     address daoAddr,
    //     bytes32 proposalId,
    //     ProposalType pType
    // );
    // event ProposalProcessed(
    //     address daoAddr,
    //     bytes32 proposalId,
    //     ProposalState state,
    //     uint256 voteResult,
    //     uint128 allVotingWeight,
    //     uint256 nbYes,
    //     uint256 nbNo
    // );

    // function createParticipantCapProposal(
    //     ParticipantCapProposalDetails memory proposal,
    //     DaoRegistry dao,
    //     bool enable,
    //     uint256 cap
    // ) public view returns (ParticipantCapProposalDetails memory) {
    //     proposal.enable = enable;
    //     proposal.cap = cap;
    //     proposal.creationTime = block.timestamp;
    //     proposal.stopVoteTime =
    //         block.timestamp +
    //         dao.getConfiguration(DaoHelper.VOTING_PERIOD);
    //     proposal.state = ProposalState.Voting;

    //     return proposal;
    // }

    // function createGovernorMembershpProposal(
    //     GovernorMembershipProposalDetails memory proposal,
    //     DaoRegistry dao,
    //     bool enable,
    //     uint8 varifyType,
    //     uint256 minAmount,
    //     address tokenAddress,
    //     uint256 tokenId
    // ) public view returns (GovernorMembershipProposalDetails memory) {
    //     proposal.enable = enable;
    //     proposal.varifyType = varifyType;
    //     proposal.minAmount = minAmount;
    //     proposal.tokenAddress = tokenAddress;
    //     proposal.tokenId = tokenId;
    //     proposal.creationTime = block.timestamp;
    //     proposal.stopVoteTime =
    //         block.timestamp +
    //         dao.getConfiguration(DaoHelper.VOTING_PERIOD);
    //     proposal.state = ProposalState.Voting;
    //     return proposal;
    // }

    // function createInvestorMembershipProposal(
    //     InvestorMembershipProposalDetails memory proposal,
    //     DaoRegistry dao,
    //     bool enable,
    //     string calldata name,
    //     uint8 varifyType,
    //     uint256 minAmount,
    //     address tokenAddress,
    //     uint256 tokenId
    // ) public view returns (InvestorMembershipProposalDetails memory) {
    //     proposal.enable = enable;
    //     proposal.name = name;
    //     proposal.varifyType = varifyType;
    //     proposal.minAmount = minAmount;
    //     proposal.tokenAddress = tokenAddress;
    //     proposal.tokenId = tokenId;
    //     proposal.creationTime = block.timestamp;
    //     proposal.stopVoteTime =
    //         block.timestamp +
    //         dao.getConfiguration(DaoHelper.VOTING_PERIOD);
    //     proposal.state = ProposalState.Voting;

    //     return proposal;
    // }

    // function createVotingProposal(
    //     VotingProposalDetails memory proposal,
    //     DaoRegistry dao,
    //     address tokenAddress,
    //     uint256[9] calldata uint256Args
    // ) public view returns (VotingProposalDetails memory) {
    //     proposal.supportInfo.supportType = uint256Args[0];
    //     proposal.supportInfo.quorumType = uint256Args[1];
    //     proposal.supportInfo.support = uint256Args[2];
    //     proposal.supportInfo.quorum = uint256Args[3];
    //     proposal.eligibilityInfo.eligibilityType = uint256Args[4];
    //     proposal.eligibilityInfo.tokenAddress = tokenAddress;
    //     proposal.eligibilityInfo.tokenID = uint256Args[5];
    //     proposal.eligibilityInfo.votingWeightedType = uint256Args[6];
    //     proposal.timeInfo.votingPeriod = uint256Args[7];
    //     proposal.timeInfo.executingPeriod = uint256Args[8];
    //     proposal.timeInfo.creationTime = block.timestamp;
    //     proposal.timeInfo.stopVoteTime =
    //         block.timestamp +
    //         dao.getConfiguration(DaoHelper.VOTING_PERIOD);
    //     proposal.state = ProposalState.Voting;

    //     return proposal;
    // }

    // function createFeesProposal(
    //     FeeProposalDetails memory proposal,
    //     DaoRegistry dao,
    //     uint256 flexDaoManagementfee,
    //     uint256 returnTokenManagementFee,
    //     address managementFeeAddress
    // ) public view returns (FeeProposalDetails memory) {
    //     proposal.flexDaoManagementfee = flexDaoManagementfee;
    //     proposal.returnTokenManagementFee = returnTokenManagementFee;
    //     proposal.managementFeeAddress = managementFeeAddress;
    //     proposal.creationTime = block.timestamp;
    //     proposal.stopVoteTime =
    //         block.timestamp +
    //         dao.getConfiguration(DaoHelper.VOTING_PERIOD);
    //     proposal.state = ProposalState.Voting;
    //     return proposal;
    // }

    // function createProposerMembershipProposal(
    //     ProposerMembershipProposalDetails memory proposal,
    //     DaoRegistry dao,
    //     bool proposerMembershipEnable,
    //     uint8 varifyType, //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
    //     uint256 minHolding,
    //     address tokenAddress,
    //     uint256 tokenId
    // ) public view returns (ProposerMembershipProposalDetails memory) {
    //     proposal.proposerMembershipEnable;
    //     proposal.varifyType = varifyType; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
    //     proposal.minHolding = minHolding;
    //     proposal.tokenAddress = tokenAddress;
    //     proposal.tokenId = tokenId;
    //     proposal.creationTime = block.timestamp;
    //     proposal.stopVoteTime =
    //         block.timestamp +
    //         dao.getConfiguration(DaoHelper.VOTING_PERIOD);
    //     proposal.state = ProposalState.Voting;
    //     return proposal;
    // }

    // function crateNewPollForInvestmentProposal(
    //     PollForInvestmentProposalDetails memory proposal,
    //     DaoRegistry dao,
    //     uint256[9] calldata uint256Args,
    //     uint8[2] calldata uint8Args,
    //     address[2] calldata addressArgs
    // ) public view returns (PollForInvestmentProposalDetails memory) {
    //     proposal.varifyType = uint8Args[0];
    //     proposal.minHolding = uint256Args[0];
    //     proposal.tokenAddress = addressArgs[0];
    //     proposal.tokenId = uint256Args[1];
    //     proposal.pollingInfo.votingPeriod = uint256Args[2];
    //     proposal.pollingInfo.votingPower = uint8Args[1];
    //     proposal.pollingInfo.superMajority = uint256Args[3];
    //     proposal.pollingInfo.quorum = uint256Args[4];
    //     proposal.pollingInfo.eligibilityType = uint256Args[5];
    //     proposal.pollingInfo.tokenAddress = addressArgs[1];
    //     proposal.pollingInfo.tokenID = uint256Args[6];
    //     proposal.pollingInfo.supportType = uint256Args[7];
    //     proposal.pollingInfo.quorumType = uint256Args[8];

    //     proposal.creationTime = block.timestamp;
    //     proposal.stopVoteTime =
    //         block.timestamp +
    //         dao.getConfiguration(DaoHelper.VOTING_PERIOD);
    //     proposal.state = ProposalState.Voting;

    //     return proposal;
    // }
}
