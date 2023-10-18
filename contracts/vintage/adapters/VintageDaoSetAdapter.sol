pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "../../helpers/GovernanceHelper.sol";
import "../../helpers/DaoHelper.sol";
import "../../utils/TypeConver.sol";
import "./VintageVoting.sol";
import "./interfaces/IVintageVoting.sol";
import "./VintageRaiserManagement.sol";
import "./VintageFundingPoolAdapter.sol";
import "./VintageRaiserAllocation.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "hardhat/console.sol";

contract VintageDaoSetAdapterContract is RaiserGuard, Reimbursable {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;

    mapping(address => bytes32) public ongoingParticipantCapProposal;
    mapping(address => bytes32) public ongoingGovernorMembershipProposal;
    mapping(address => bytes32) public ongoingInvstorMembershipProposal;
    mapping(address => bytes32) public ongoingVotingProposal;

    mapping(address => mapping(bytes32 => ParticipantCapProposalDetails))
        public participantCapProposals;

    mapping(address => mapping(bytes32 => GovernorMembershipProposalDetails))
        public governorMembershipProposals;

    mapping(address => mapping(bytes32 => InvestorMembershipProposalDetails))
        public investorMembershipProposals;

    mapping(address => mapping(bytes32 => VotingProposalDetails))
        public votingProposals;

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
        VintageFundingPoolAdapterContract fundingPoolAdapt = VintageFundingPoolAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_POOL_ADAPT)
            );
        // if (
        //     block.timestamp >=
        //     dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_BEGIN) &&
        //     block.timestamp <=
        //     dao.getConfiguration(DaoHelper.FUND_END_TIME) +
        //         dao.getConfiguration(DaoHelper.RETURN_DURATION)
        // ) {
        //     revert FUND_PERIOD();
        // }
        DaoHelper.FundRaiseState state = fundingPoolAdapt.daoFundRaisingStates(
            address(dao)
        );
        uint256 returnDuration = dao.getConfiguration(
            DaoHelper.RETURN_DURATION
        );
        require(
            (state == DaoHelper.FundRaiseState.NOT_STARTED) ||
                (state == DaoHelper.FundRaiseState.FAILED &&
                    block.timestamp >
                    dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END) +
                        returnDuration) ||
                (state == DaoHelper.FundRaiseState.DONE &&
                    block.timestamp >
                    dao.getConfiguration(DaoHelper.FUND_END_TIME) +
                        returnDuration),
            "FUND_PERIOD"
        );
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

        // dao.submitProposal(proposalId);

        // IVintageVoting votingContract = IVintageVoting(
        //     dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        // );
        // votingContract.startNewVotingForProposal(
        //     dao,
        //     proposalId,
        //     block.timestamp,
        //     bytes("")
        // );

        // dao.sponsorProposal(proposalId, address(votingContract));
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
        DaoRegistry dao,
        bool enable,
        uint8 varifyType,
        uint256 minAmount,
        address tokenAddress,
        uint256 tokenId,
        address[] calldata whiteList
    ) external onlyRaiser(dao) reimbursable(dao) {
        require(
            ongoingInvstorMembershipProposal[address(dao)] == bytes32(0),
            "last InvestorMembership proposal not finalized"
        );
        fundPeriodCheck(dao);

        dao.increaseInvstorMembershipId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "Investor-Membership#",
                Strings.toString(dao.getCurrentInvestorMembershipProposalId())
            )
        );
        investorMembershipProposals[address(dao)][
            proposalId
        ] = InvestorMembershipProposalDetails(
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
                investorMembershipWhiteLists[proposalId].add(whiteList[i]);
            }
        }

        ongoingInvstorMembershipProposal[address(dao)] = proposalId;

        setProposal(dao, proposalId);

        emit ProposalCreated(
            address(dao),
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

    // function processProposal(
    //     DaoRegistry dao,
    //     bytes32 proposalId,
    //     ProposalType ptype
    // ) external reimbursable(dao) {
    //     dao.processProposal(proposalId);

    //     IVintageVoting votingContract = IVintageVoting(
    //         dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
    //     );

    //     IVintageVoting.VotingState voteResult;
    //     uint128 nbYes;
    //     uint128 nbNo;

    //     (voteResult, nbYes, nbNo) = votingContract.voteResult(dao, proposalId);

    //     if (voteResult == IVintageVoting.VotingState.PASS) {
    //         if (ptype == ProposalType.PARTICIPANT_CAP) {
    //             setParticipantCap(
    //                 dao,
    //                 participantCapProposals[address(dao)][proposalId]
    //             );
    //             participantCapProposals[address(dao)][proposalId]
    //                 .state = ProposalState.Done;
    //         } else if (ptype == ProposalType.GOVERNOR_MEMBERSHIP) {
    //             setGovernorMembership(
    //                 dao,
    //                 governorMembershipProposals[address(dao)][proposalId]
    //             );
    //             governorMembershipProposals[address(dao)][proposalId]
    //                 .state = ProposalState.Done;
    //         } else if (ptype == ProposalType.INVESTOR_MEMBERSHIP) {
    //             setInvestorMembership(
    //                 dao,
    //                 investorMembershipProposals[address(dao)][proposalId]
    //             );
    //             investorMembershipProposals[address(dao)][proposalId]
    //                 .state = ProposalState.Done;
    //         } else if (ptype == ProposalType.VOTING) {
    //             setVoting(dao, votingProposals[address(dao)][proposalId]);
    //             votingProposals[address(dao)][proposalId].state = ProposalState
    //                 .Done;
    //         } else {}
    //     } else if (
    //         voteResult == IVintageVoting.VotingState.NOT_PASS ||
    //         voteResult == IVintageVoting.VotingState.TIE
    //     ) {
    //         proposal.state = ProposalState.Failed;
    //     } else {
    //         revert VOTING_NOT_FINISH();
    //     }
    // }

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
            DaoHelper.VINTAGE_RAISER_MEMBERSHIP_ENABLE,
            proposal.enable == true ? 1 : 0
        );

        if (proposal.enable) {
            dao.setConfiguration(
                DaoHelper.VINTAGE_RAISER_MEMBERSHIP_TYPE,
                proposal.varifyType
            );
            dao.setConfiguration(
                DaoHelper.VINTAGE_RAISER_MEMBERSHIP_MIN_HOLDING,
                proposal.minAmount
            );
            dao.setAddressConfiguration(
                DaoHelper.VINTAGE_RAISER_MEMBERSHIP_TOKEN_ADDRESS,
                proposal.tokenAddress
            );

            dao.setConfiguration(
                DaoHelper.VINTAGE_RAISER_MEMBERSHIP_TOKENID,
                proposal.tokenId
            );

            dao.setConfiguration(
                DaoHelper.VINTAGE_RAISER_MEMBERSHIP_MIN_DEPOSIT,
                proposal.minAmount
            );
            uint256 len = governorMembershipWhitelists[proposal.proposalId]
                .values()
                .length;
            if (len > 0) {
                VintageRaiserManagementContract raiserManagementAdapt = VintageRaiserManagementContract(
                        dao.getAdapterAddress(
                            DaoHelper.VINTAGE_RAISER_MANAGEMENT
                        )
                    );

                raiserManagementAdapt.clearGovernorWhitelist(dao);
                for (uint8 i = 0; i < len; i++) {
                    raiserManagementAdapt.registerRaiserWhiteList(
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
            DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_ENABLE,
            proposal.enable == true ? 1 : 0
        );
        if (proposal.enable) {
            dao.setConfiguration(
                DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_TYPE,
                proposal.varifyType
            );
            //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS
            dao.setConfiguration(
                DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_MIN_HOLDING,
                proposal.minAmount
            );
            dao.setAddressConfiguration(
                DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS,
                proposal.tokenAddress
            );

            dao.setConfiguration(
                DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_TOKENID,
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
                    fundingPoolAdapt.registerInvestorWhiteList(
                        dao,
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
            DaoHelper.VINTAGE_VOTING_ELIGIBILITY_TYPE,
            proposal.eligibilityInfo.eligibilityType
        );
        dao.setAddressConfiguration(
            DaoHelper.VINTAGE_VOTING_ELIGIBILITY_TOKEN_ADDRESS,
            proposal.eligibilityInfo.tokenAddress
        );
        dao.setConfiguration(
            DaoHelper.VINTAGE_VOTING_ELIGIBILITY_TOKEN_ID,
            proposal.eligibilityInfo.tokenID
        );
        dao.setConfiguration(
            DaoHelper.VINTAGE_VOTING_WEIGHTED_TYPE,
            proposal.eligibilityInfo.votingWeightedType
        );
        dao.setConfiguration(
            DaoHelper.VINTAGE_VOTING_SUPPORT_TYPE,
            proposal.supportInfo.supportType
        );
        dao.setConfiguration(
            DaoHelper.VINTAGE_VOTING_QUORUM_TYPE,
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
        dao.setConfiguration(
            DaoHelper.PROPOSAL_EXECUTE_DURATION,
            proposal.timeInfo.executingPeriod
        );

        uint256 len = votingAllocations[proposal.proposalId].values().length;
        if (len > 0) {
            VintageRaiserAllocationAdapter raiserAlloc = VintageRaiserAllocationAdapter(
                    dao.getAdapterAddress(
                        DaoHelper.VINTAGE_RAISER_ALLOCATION_ADAPTER
                    )
                );
            for (uint8 i = 0; i < len; i++) {
                raiserAlloc.setAllocation(
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
