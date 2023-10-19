pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "../../helpers/GovernanceHelper.sol";
import "../../helpers/DaoHelper.sol";
import "../../utils/TypeConver.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "./FlexVoting.sol";
import "./FlexFundingPoolAdapter.sol";
import "./FlexStewardAllocation.sol";
import "./StewardManagement.sol";
import "./interfaces/IFlexVoting.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "hardhat/console.sol";

contract FlexDaoSetAdapterContract is RaiserGuard, Reimbursable {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;

    mapping(address => bytes32) public ongoingParticipantCapProposal;
    mapping(address => bytes32) public ongoingGovernorMembershipProposal;
    mapping(address => bytes32) public ongoingInvstorMembershipProposal;
    mapping(address => bytes32) public ongoingVotingProposal;
    // mapping(address => bytes32) public ongoingFeeProposal;

    mapping(address => mapping(bytes32 => ParticipantCapProposalDetails))
        public participantCapProposals;

    mapping(address => mapping(bytes32 => GovernorMembershipProposalDetails))
        public governorMembershipProposals;

    mapping(address => mapping(bytes32 => InvestorMembershipProposalDetails))
        public investorMembershipProposals;

    mapping(address => mapping(bytes32 => VotingProposalDetails))
        public votingProposals;

    // mapping(address => mapping(bytes32 => FeeProposalDetails))
    //     public feeProposals;

    mapping(bytes32 => EnumerableSet.AddressSet) governorMembershipWhitelists;
    mapping(bytes32 => EnumerableSet.AddressSet) investorMembershipWhiteLists;

    mapping(bytes32 => EnumerableSet.UintSet) votingAllocations;
    mapping(bytes32 => EnumerableSet.AddressSet) votingGovernors;
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
        VOTING
    }

    struct ParticipantCapProposalDetails {
        bytes32 proposalId;
        bool enable;
        uint256 cap;
        uint256 creationTime;
        uint256 stopVoteTime;
        ProposalState state;
    }

    struct GovernorMembershipProposalDetails {
        bytes32 proposalId;
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
        bytes32 proposalId;
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
        bytes32 proposalId;
        VotingSupportInfo supportInfo;
        VotingEligibilityInfo eligibilityInfo;
        VotingTimeInfo timeInfo;
        ProposalState state;
    }

    // struct FeeProposalDetails {
    //     bytes32 proposalId;
    //     uint256 managementFee;
    //     address managementFeeAddress;
    //     uint256 creationTime;
    //     uint256 stopVoteTime;
    //     ProposalState state;
    // }

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

    struct InvestorMembershipParams{
        DaoRegistry dao;
        bool enable;
        string name;
        uint8 varifyType;
        uint256 minAmount;
        address tokenAddress;
        uint256 tokenId;
        address[] whiteList;
    }

    event ProposalCreated(
        address daoAddr,
        bytes32 proposalId,
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

    error VOTING_NOT_FINISH();

    // error FUND_PERIOD();

    function fundPeriodCheck(DaoRegistry dao) internal view {
        // VintageFundingPoolAdapterContract fundingPoolAdapt = VintageFundingPoolAdapterContract(
        //         dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_POOL_ADAPT)
        //     );
        // DaoHelper.FundRaiseState state = fundingPoolAdapt.daoFundRaisingStates(
        //     address(dao)
        // );
        // uint256 returnDuration = dao.getConfiguration(
        //     DaoHelper.RETURN_DURATION
        // );
        // require(
        //     (state == DaoHelper.FundRaiseState.NOT_STARTED) ||
        //         (state == DaoHelper.FundRaiseState.FAILED &&
        //             block.timestamp >
        //             dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END) +
        //                 returnDuration) ||
        //         (state == DaoHelper.FundRaiseState.DONE &&
        //             block.timestamp >
        //             dao.getConfiguration(DaoHelper.FUND_END_TIME) +
        //                 returnDuration),
        //     "FUND_PERIOD"
        // );
    }

    function submitParticipantCapProposal(
        DaoRegistry dao,
        bool enable,
        uint256 cap
    ) external onlyRaiser(dao) reimbursable(dao) {
        fundPeriodCheck(dao);
        require(
            ongoingParticipantCapProposal[address(dao)] == bytes32(0),
            "last cap proposal not finalized"
        );
        dao.increaseParticipantCapId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "Participant-Cap#",
                Strings.toString(dao.getCurrentParticipantCapProposalId())
            )
        );
        participantCapProposals[address(dao)][
            proposalId
        ] = ParticipantCapProposalDetails(
            proposalId,
            enable,
            cap,
            block.timestamp,
            block.timestamp + dao.getConfiguration(DaoHelper.VOTING_PERIOD),
            ProposalState.Voting
        );
        ongoingParticipantCapProposal[address(dao)] = proposalId;

        setProposal(dao, proposalId);

        emit ProposalCreated(
            address(dao),
            proposalId,
            ProposalType.PARTICIPANT_CAP
        );
    }

    function submitGovernorMembershpProposal(
        DaoRegistry dao,
        bool enable,
        uint8 varifyType,
        uint256 minAmount,
        address tokenAddress,
        uint256 tokenId,
        address[] calldata whiteList
    ) external onlyRaiser(dao) reimbursable(dao) {
        require(
            ongoingGovernorMembershipProposal[address(dao)] == bytes32(0),
            "last GovernorMembership proposal not finalized"
        );
        fundPeriodCheck(dao);

        dao.increaseGovernorMembershipId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "Governor-Membership#",
                Strings.toString(dao.getCurrentGovernorMembershipProposalId())
            )
        );
        governorMembershipProposals[address(dao)][
            proposalId
        ] = GovernorMembershipProposalDetails(
            proposalId,
            enable,
            varifyType,
            minAmount,
            tokenAddress,
            tokenId,
            block.timestamp,
            block.timestamp + dao.getConfiguration(DaoHelper.VOTING_PERIOD),
            ProposalState.Voting
        );

        if (whiteList.length > 0) {
            for (uint8 i = 0; i < whiteList.length; i++) {
                governorMembershipWhitelists[proposalId].add(whiteList[i]);
            }
        }

        ongoingGovernorMembershipProposal[address(dao)] = proposalId;

        setProposal(dao, proposalId);

        emit ProposalCreated(
            address(dao),
            proposalId,
            ProposalType.GOVERNOR_MEMBERSHIP
        );
    }

    function submitInvestorMembershipProposal(
       InvestorMembershipParams calldata params
    ) external onlyRaiser(params.dao) reimbursable(params.dao) {
        require(
            ongoingInvstorMembershipProposal[address(params.dao)] == bytes32(0),
            "last InvestorMembership proposal not finalized"
        );
        fundPeriodCheck(params.dao);

        params.dao.increaseInvstorMembershipId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(params.dao)))),
                "Investor-Membership#",
                Strings.toString(params.dao.getCurrentInvestorMembershipProposalId())
            )
        );
        investorMembershipProposals[address(params.dao)][
            proposalId
        ] = InvestorMembershipProposalDetails(
            proposalId,
            params.enable,
            params.name,
            params.varifyType,
            params.minAmount,
            params.tokenAddress,
            params.tokenId,
            block.timestamp,
            block.timestamp + params.dao.getConfiguration(DaoHelper.VOTING_PERIOD),
            ProposalState.Voting
        );

        if (params.whiteList.length > 0) {
            for (uint8 i = 0; i < params.whiteList.length; i++) {
                investorMembershipWhiteLists[proposalId].add(params.whiteList[i]);
            }
        }

        ongoingInvstorMembershipProposal[address(params.dao)] = proposalId;

        setProposal(params.dao, proposalId);

        emit ProposalCreated(
            address(params.dao),
            proposalId,
            ProposalType.INVESTOR_MEMBERSHIP
        );
    }

    function submitVotingProposal(
        DaoRegistry dao,
        VotingParams calldata params
    ) external onlyRaiser(dao) reimbursable(dao) {
        require(
            ongoingVotingProposal[address(dao)] == bytes32(0),
            "last voting proposal not finalized"
        );
        require(
            params.governors.length == params.allocations.length,
            "!allocation params"
        );
        fundPeriodCheck(dao);

        dao.increaseVotingId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "voting#",
                Strings.toString(dao.getCurrentVotingProposalId())
            )
        );
        votingProposals[address(dao)][proposalId] = VotingProposalDetails(
            proposalId,
            VotingSupportInfo(
                params.supportType,
                params.quorumType,
                params.support,
                params.quorum
            ),
            VotingEligibilityInfo(
                params.eligibilityType,
                params.tokenAddress,
                params.tokenID,
                params.votingWeightedType
            ),
            VotingTimeInfo(
                params.votingPeriod,
                params.executingPeriod,
                block.timestamp,
                block.timestamp + dao.getConfiguration(DaoHelper.VOTING_PERIOD)
            ),
            ProposalState.Voting
        );
        ongoingVotingProposal[address(dao)] = proposalId;

        if (params.governors.length > 0) {
            for (uint8 i = 0; i < params.governors.length; i++) {
                votingAllocations[proposalId].add(params.allocations[i]);
                votingGovernors[proposalId].add(params.governors[i]);
            }
        }
        setProposal(dao, proposalId);
        emit ProposalCreated(address(dao), proposalId, ProposalType.VOTING);
    }

    // function submitFeeProposal(
    //     DaoRegistry dao,
    //     address managementFeeAddress,
    //     uint256 managementFeeAmount
    // ) external onlyRaiser(dao) reimbursable(dao) {
    //     fundPeriodCheck(dao);
    //     require(
    //         ongoingFeeProposal[address(dao)] == bytes32(0),
    //         "last fee proposal not finalized"
    //     );
    //     dao.increaseParticipantCapId();

    //     bytes32 proposalId = TypeConver.bytesToBytes32(
    //         abi.encodePacked(
    //             bytes8(uint64(uint160(address(dao)))),
    //             "Fees#",
    //             Strings.toString(dao.getCurrentParticipantCapProposalId())
    //         )
    //     );
    //     feeProposals[address(dao)][proposalId] = FeeProposalDetails(
    //         proposalId,
    //         managementFeeAmount,
    //         managementFeeAddress,
    //         block.timestamp,
    //         block.timestamp + dao.getConfiguration(DaoHelper.VOTING_PERIOD),
    //         ProposalState.Voting
    //     );
    //     ongoingFeeProposal[address(dao)] = proposalId;

    //     setProposal(dao, proposalId);

    //     emit ProposalCreated(
    //         address(dao),
    //         proposalId,
    //         ProposalType.PARTICIPANT_CAP
    //     );
    // }

    function setProposal(DaoRegistry dao, bytes32 proposalId) internal {
        dao.submitProposal(proposalId);

        IVintageVoting votingContract = IVintageVoting(
            dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );
        votingContract.startNewVotingForProposal(
            dao,
            proposalId,
            block.timestamp,
            bytes("")
        );

        dao.sponsorProposal(proposalId, address(votingContract));
    }

    function processParticipantCapProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        ParticipantCapProposalDetails
            storage proposal = participantCapProposals[address(dao)][
                proposalId
            ];

        dao.processProposal(proposalId);

        IVintageVoting votingContract = IVintageVoting(
            dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );

        // require(address(votingContract) != address(0x0), "!votingContract");
        IVintageVoting.VotingState voteResult;
        uint128 nbYes;
        uint128 nbNo;

        (voteResult, nbYes, nbNo) = votingContract.voteResult(dao, proposalId);

        if (voteResult == IVintageVoting.VotingState.PASS) {
            setParticipantCap(dao, proposal);
            proposal.state = ProposalState.Done;
        } else if (
            voteResult == IVintageVoting.VotingState.NOT_PASS ||
            voteResult == IVintageVoting.VotingState.TIE
        ) {
            proposal.state = ProposalState.Failed;
        } else {
            revert VOTING_NOT_FINISH();
        }

        ongoingParticipantCapProposal[address(dao)] = bytes32(0);

        uint128 allGPsWeight = GovernanceHelper
            .getVintageAllRaiserVotingWeightByProposalId(dao, proposalId);
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

    function processGovernorMembershipProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        GovernorMembershipProposalDetails
            storage proposal = governorMembershipProposals[address(dao)][
                proposalId
            ];

        dao.processProposal(proposalId);

        IVintageVoting votingContract = IVintageVoting(
            dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );

        // require(address(votingContract) != address(0x0), "!votingContract");
        IVintageVoting.VotingState voteResult;
        uint128 nbYes;
        uint128 nbNo;

        (voteResult, nbYes, nbNo) = votingContract.voteResult(dao, proposalId);

        if (voteResult == IVintageVoting.VotingState.PASS) {
            setGovernorMembership(dao, proposal);
            proposal.state = ProposalState.Done;
        } else if (
            voteResult == IVintageVoting.VotingState.NOT_PASS ||
            voteResult == IVintageVoting.VotingState.TIE
        ) {
            proposal.state = ProposalState.Failed;
        } else {
            revert VOTING_NOT_FINISH();
        }

        ongoingGovernorMembershipProposal[address(dao)] = bytes32(0);

        uint128 allGPsWeight = GovernanceHelper
            .getVintageAllRaiserVotingWeightByProposalId(dao, proposalId);
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

    function processInvestorMembershipProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        InvestorMembershipProposalDetails
            storage proposal = investorMembershipProposals[address(dao)][
                proposalId
            ];

        dao.processProposal(proposalId);

        IVintageVoting votingContract = IVintageVoting(
            dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );

        // require(address(votingContract) != address(0x0), "!votingContract");
        IVintageVoting.VotingState voteResult;
        uint128 nbYes;
        uint128 nbNo;

        (voteResult, nbYes, nbNo) = votingContract.voteResult(dao, proposalId);

        if (voteResult == IVintageVoting.VotingState.PASS) {
            setInvestorMembership(dao, proposal);
            proposal.state = ProposalState.Done;
        } else if (
            voteResult == IVintageVoting.VotingState.NOT_PASS ||
            voteResult == IVintageVoting.VotingState.TIE
        ) {
            proposal.state = ProposalState.Failed;
        } else {
            revert VOTING_NOT_FINISH();
        }

        ongoingInvstorMembershipProposal[address(dao)] = bytes32(0);

        uint128 allGPsWeight = GovernanceHelper
            .getVintageAllRaiserVotingWeightByProposalId(dao, proposalId);
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

    function processVotingProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        VotingProposalDetails storage proposal = votingProposals[address(dao)][
            proposalId
        ];

        dao.processProposal(proposalId);

        IVintageVoting votingContract = IVintageVoting(
            dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );

        // require(address(votingContract) != address(0x0), "!votingContract");
        IVintageVoting.VotingState voteResult;
        uint128 nbYes;
        uint128 nbNo;

        (voteResult, nbYes, nbNo) = votingContract.voteResult(dao, proposalId);

        if (voteResult == IVintageVoting.VotingState.PASS) {
            setVoting(dao, proposal);
            proposal.state = ProposalState.Done;
        } else if (
            voteResult == IVintageVoting.VotingState.NOT_PASS ||
            voteResult == IVintageVoting.VotingState.TIE
        ) {
            proposal.state = ProposalState.Failed;
        } else {
            revert VOTING_NOT_FINISH();
        }

        ongoingVotingProposal[address(dao)] = bytes32(0);

        uint128 allGPsWeight = GovernanceHelper
            .getVintageAllRaiserVotingWeightByProposalId(dao, proposalId);
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

    function setParticipantCap(
        DaoRegistry dao,
        ParticipantCapProposalDetails storage proposal
    ) internal {
        dao.setConfiguration(
            DaoHelper.MAX_PARTICIPANTS_ENABLE,
            proposal.enable == true ? 1 : 0
        );
        dao.setConfiguration(DaoHelper.MAX_PARTICIPANTS, proposal.cap);
    }

    function setGovernorMembership(
        DaoRegistry dao,
        GovernorMembershipProposalDetails storage proposal
    ) internal {
        dao.setConfiguration(
            DaoHelper.FLEX_STEWARD_MEMBERSHIP_ENABLE,
            proposal.enable == true ? 1 : 0
        );

        if (proposal.enable) {
            dao.setConfiguration(
                DaoHelper.FLEX_STEWARD_MEMBERSHIP_TYPE,
                proposal.varifyType
            );
            dao.setConfiguration(
                DaoHelper.FLEX_STEWARD_MEMBERSHIP_MINI_HOLDING,
                proposal.minAmount
            );
            dao.setAddressConfiguration(
                DaoHelper.FLEX_STEWARD_MEMBERSHIP_TOKEN_ADDRESS,
                proposal.tokenAddress
            );

            dao.setConfiguration(
                DaoHelper.FLEX_STEWARD_MEMBERSHIP_TOKEN_ID,
                proposal.tokenId
            );

            uint256 len = governorMembershipWhitelists[proposal.proposalId]
                .values()
                .length;
            if (len > 0) {
                StewardManagementContract stewardContract = StewardManagementContract(
                        dao.getAdapterAddress(DaoHelper.FLEX_STEWARD_MANAGEMENT)
                    );

                stewardContract.clearGovernorWhitelist(dao);
                for (uint8 i = 0; i < len; i++) {
                    stewardContract.registerStewardWhiteList(
                        dao,
                        governorMembershipWhitelists[proposal.proposalId].at(i)
                    );
                }
            }
        }
    }

    function setInvestorMembership(
        DaoRegistry dao,
        InvestorMembershipProposalDetails storage proposal
    ) internal {
        dao.setConfiguration(
            DaoHelper.FLEX_PARTICIPANT_MEMBERSHIP_ENABLE,
            proposal.enable == true ? 1 : 0
        );
        if (proposal.enable) {
            dao.setConfiguration(
                DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_TYPE,
                proposal.varifyType
            );
            //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS

            FlexFundingPoolAdapterContract flexFundingPool = FlexFundingPoolAdapterContract(
                    dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_POOL_ADAPT)
                );
            flexFundingPool.createParticipantMembership(
                dao,
                proposal.name,
                uint8(proposal.varifyType),
                proposal.minAmount,
                proposal.tokenAddress,
                proposal.tokenId
            );

            uint256 len = investorMembershipWhiteLists[proposal.proposalId]
                .values()
                .length;
            if (len > 0) {
                VintageFundingPoolAdapterContract fundingPoolAdapt = VintageFundingPoolAdapterContract(
                        dao.getAdapterAddress(
                            DaoHelper.VINTAGE_FUNDING_POOL_ADAPT
                        )
                    );
                fundingPoolAdapt.clearInvestorWhitelist(dao);
                for (uint8 i = 0; i < len; i++) {
                    flexFundingPool.registerParticipantWhiteList(
                        dao,
                        proposal.name,
                        investorMembershipWhiteLists[proposal.proposalId].at(i)
                    );
                }
            }
        }
    }

    function setVoting(
        DaoRegistry dao,
        VotingProposalDetails storage proposal
    ) internal {
        dao.setConfiguration(
            DaoHelper.FLEX_VOTING_ELIGIBILITY_TYPE,
            proposal.eligibilityInfo.eligibilityType
        );
        dao.setAddressConfiguration(
            DaoHelper.FLEX_VOTING_ELIGIBILITY_TOKEN_ADDRESS,
            proposal.eligibilityInfo.tokenAddress
        );
        dao.setConfiguration(
            DaoHelper.VINTAGE_VOTING_ELIGIBILITY_TOKEN_ID,
            proposal.eligibilityInfo.tokenID
        );
        dao.setConfiguration(
            DaoHelper.FLEX_VOTING_WEIGHTED_TYPE,
            proposal.eligibilityInfo.votingWeightedType
        );
        dao.setConfiguration(
            DaoHelper.FLEX_VOTING_SUPPORT_TYPE,
            proposal.supportInfo.supportType
        );
        dao.setConfiguration(
            DaoHelper.FLEX_VOTING_QUORUM_TYPE,
            proposal.supportInfo.quorumType
        );
        dao.setConfiguration(DaoHelper.QUORUM, proposal.supportInfo.quorum);
        dao.setConfiguration(
            DaoHelper.SUPER_MAJORITY,
            proposal.supportInfo.support
        );
        dao.setConfiguration(
            DaoHelper.VOTING_PERIOD,
            proposal.timeInfo.votingPeriod
        );
        // dao.setConfiguration(
        //     DaoHelper.PROPOSAL_EXECUTE_DURATION,
        //     proposal.timeInfo.executingPeriod
        // );

        uint256 len = votingAllocations[proposal.proposalId].values().length;
        if (len > 0) {
            FlexStewardAllocationAdapter stewardAlloc = FlexStewardAllocationAdapter(
                    dao.getAdapterAddress(
                        DaoHelper.VINTAGE_RAISER_ALLOCATION_ADAPTER
                    )
                );
            for (uint8 i = 0; i < len; i++) {
                stewardAlloc.setAllocation(
                    dao,
                    votingGovernors[proposal.proposalId].at(i),
                    votingAllocations[proposal.proposalId].at(i)
                );
            }
        }
    }

    // function getInvestorMembershipWhitelist(
    //     bytes32 proposalId
    // ) external view returns (address[] memory) {
    //     return investorMembershipWhiteLists[proposalId].values();
    // }

    // function getGovernorMembershipWhitelist(
    //     bytes32 proposalId
    // ) external view returns (address[] memory) {
    //     return governorMembershipWhitelists[proposalId].values();
    // }

    // function clearGovernorMembershipWhitelist(bytes32 proposalId) external {
    //     uint256 len = governorMembershipWhitelists[proposalId].values().length;
    //     address[] memory tem;
    //     tem = governorMembershipWhitelists[proposalId].values();
    //     if (len > 0) {
    //         for (uint8 i = 0; i < len; i++) {
    //             governorMembershipWhitelists[proposalId].remove(tem[i]);
    //         }
    //     }
    // }

    function isProposalAllDone(address daoAddr) external view returns (bool) {
        if (
            ongoingParticipantCapProposal[daoAddr] != bytes32(0) ||
            ongoingGovernorMembershipProposal[daoAddr] != bytes32(0) ||
            ongoingInvstorMembershipProposal[daoAddr] != bytes32(0) ||
            ongoingVotingProposal[daoAddr] != bytes32(0)
        ) {
            return false;
        }
        return true;
    }
}
