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
import "../../guards/RaiserGuard.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "hardhat/console.sol";

contract VintageDaoSetAdapterContract is GovernorGuard, Reimbursable {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;

    mapping(address => bytes32) public ongoingInvestorCapProposal;
    mapping(address => bytes32) public ongoingGovernorMembershipProposal;
    mapping(address => bytes32) public ongoingInvstorMembershipProposal;
    mapping(address => bytes32) public ongoingVotingProposal;

    mapping(address => mapping(bytes32 => InvestorCapProposalDetails))
        public investorCapProposals;

    mapping(address => mapping(bytes32 => GovernorMembershipProposalDetails))
        public governorMembershipProposals;

    mapping(address => mapping(bytes32 => InvestorMembershipProposalDetails))
        public investorMembershipProposals;

    mapping(address => mapping(bytes32 => VotingProposalDetails))
        public votingProposals;

    mapping(bytes32 => EnumerableSet.AddressSet) governorMembershipWhitelists;
    mapping(bytes32 => EnumerableSet.AddressSet) investorMembershipWhiteLists;

    // mapping(bytes32 => uint256[]) votingAllocations;
    mapping(bytes32 => EnumerableSet.AddressSet) votingGovernors;
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
        VOTING
    }

    struct InvestorCapProposalDetails {
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
        VotingAssetInfo votingAssetInfo;
        VotingTimeInfo timeInfo;
        VotingAllocs allocs;
        ProposalState state;
    }

    struct VotingAllocs{
        uint256[] allocations;
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

    struct VotingAssetInfo {
        uint256 votingAssetType;
        address tokenAddress;
        uint256 tokenID;
        uint256 votingWeightedType;
    }

    struct VotingParams {
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
                dao.getAdapterAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_ADAPT)
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

    function submitInvestorCapProposal(
        DaoRegistry dao,
        bool enable,
        uint256 cap
    ) external onlyGovernor(dao) reimbursable(dao) {
        fundPeriodCheck(dao);
        require(
            ongoingInvestorCapProposal[address(dao)] == bytes32(0),
            "last cap proposal not finalized"
        );
        dao.increaseInvestorCapId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "Investor-Cap#",
                Strings.toString(dao.getCurrentInvestorCapProposalId())
            )
        );
        investorCapProposals[address(dao)][
            proposalId
        ] = InvestorCapProposalDetails(
            proposalId,
            enable,
            cap,
            block.timestamp,
            block.timestamp + dao.getConfiguration(DaoHelper.VOTING_PERIOD),
            ProposalState.Voting
        );
        ongoingInvestorCapProposal[address(dao)] = proposalId;

        setProposal(dao, proposalId);

        emit ProposalCreated(
            address(dao),
            proposalId,
            ProposalType.INVESTOR_CAP
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
    ) external onlyGovernor(dao) reimbursable(dao) {
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
    ) external onlyGovernor(dao) reimbursable(dao) {
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
    ) external onlyGovernor(dao) reimbursable(dao) {
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
            VotingAssetInfo(
                params.votingAssetType,
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
            VotingAllocs(new uint256[](params.governors.length)),
            ProposalState.Voting
        );
        ongoingVotingProposal[address(dao)] = proposalId;
        if (params.governors.length > 0) {
            // votingProposals[address(dao)][proposalId].allocations=new uint256[](params.governors.length);
            for (uint8 i = 0; i < params.governors.length; i++) {
                votingProposals[address(dao)][proposalId].allocs.allocations[i]= params.allocations[i];
                // votingProposals[address(dao)][proposalId].allocations.push(params.allocations[i]);
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

    function processInvestorCapProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        InvestorCapProposalDetails
            storage proposal = investorCapProposals[address(dao)][
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
            setInvestorCap(dao, proposal);
            proposal.state = ProposalState.Done;
        } else if (
            voteResult == IVintageVoting.VotingState.NOT_PASS ||
            voteResult == IVintageVoting.VotingState.TIE
        ) {
            proposal.state = ProposalState.Failed;
        } else {
            revert VOTING_NOT_FINISH();
        }

        ongoingInvestorCapProposal[address(dao)] = bytes32(0);

        uint128 allGPsWeight = GovernanceHelper
            .getVintageAllGovernorVotingWeightByProposalId(dao, proposalId);
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
            .getVintageAllGovernorVotingWeightByProposalId(dao, proposalId);
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
            .getVintageAllGovernorVotingWeightByProposalId(dao, proposalId);
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
            .getVintageAllGovernorVotingWeightByProposalId(dao, proposalId);
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

    function setInvestorCap(
        DaoRegistry dao,
        InvestorCapProposalDetails storage proposal
    ) internal {
        dao.setConfiguration(
            DaoHelper.MAX_INVESTORS_ENABLE,
            proposal.enable == true ? 1 : 0
        );
        dao.setConfiguration(DaoHelper.MAX_INVESTORS, proposal.cap);
    }

    function setGovernorMembership(
        DaoRegistry dao,
        GovernorMembershipProposalDetails storage proposal
    ) internal {
        dao.setConfiguration(
            DaoHelper.VINTAGE_GOVERNOR_MEMBERSHIP_ENABLE,
            proposal.enable == true ? 1 : 0
        );

        if (proposal.enable) {
            dao.setConfiguration(
                DaoHelper.VINTAGE_GOVERNOR_MEMBERSHIP_TYPE,
                proposal.varifyType
            );
            dao.setConfiguration(
                DaoHelper.VINTAGE_GOVERNOR_MEMBERSHIP_MIN_HOLDING,
                proposal.minAmount
            );
            dao.setAddressConfiguration(
                DaoHelper.VINTAGE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS,
                proposal.tokenAddress
            );

            dao.setConfiguration(
                DaoHelper.VINTAGE_GOVERNOR_MEMBERSHIP_TOKENID,
                proposal.tokenId
            );

            dao.setConfiguration(
                DaoHelper.VINTAGE_GOVERNOR_MEMBERSHIP_MIN_DEPOSIT,
                proposal.minAmount
            );
            uint256 len = governorMembershipWhitelists[proposal.proposalId]
                .values()
                .length;
            if (len > 0) {
                VintageRaiserManagementContract raiserManagementAdapt = VintageRaiserManagementContract(
                        dao.getAdapterAddress(
                            DaoHelper.VINTAGE_GOVERNOR_MANAGEMENT
                        )
                    );

                raiserManagementAdapt.clearGovernorWhitelist(dao);
                for (uint8 i = 0; i < len; i++) {
                    raiserManagementAdapt.registerGovernorWhiteList(
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
                            DaoHelper.VINTAGE_INVESTMENT_POOL_ADAPT
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
            DaoHelper.VINTAGE_VOTING_ASSET_TYPE,
            proposal.votingAssetInfo.votingAssetType
        );
        dao.setAddressConfiguration(
            DaoHelper.VINTAGE_VOTING_ASSET_TOKEN_ADDRESS,
            proposal.votingAssetInfo.tokenAddress
        );
        dao.setConfiguration(
            DaoHelper.VINTAGE_VOTING_ASSET_TOKEN_ID,
            proposal.votingAssetInfo.tokenID
        );
        dao.setConfiguration(
            DaoHelper.VINTAGE_VOTING_WEIGHTED_TYPE,
            proposal.votingAssetInfo.votingWeightedType
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

        uint256 len = votingGovernors[proposal.proposalId].values().length;
        if (len > 0) {
            VintageRaiserAllocationAdapter raiserAlloc = VintageRaiserAllocationAdapter(
                    dao.getAdapterAddress(
                        DaoHelper.VINTAGE_GOVERNOR_ALLOCATION_ADAPTER
                    )
                );
            for (uint8 i = 0; i < len; i++) {
                raiserAlloc.setAllocation(
                    dao,
                    votingGovernors[proposal.proposalId].at(i),
                    proposal.allocs.allocations[i]
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

    // function getAllocation(
    //     bytes32 proposalId
    // ) external view returns (uint256[] memory) {
    //     return votingAllocations[proposalId];
    // }

    function isProposalAllDone(address daoAddr) external view returns (bool) {
        if (
            ongoingInvestorCapProposal[daoAddr] != bytes32(0) ||
            ongoingGovernorMembershipProposal[daoAddr] != bytes32(0) ||
            ongoingInvstorMembershipProposal[daoAddr] != bytes32(0) ||
            ongoingVotingProposal[daoAddr] != bytes32(0)
        ) {
            return false;
        }
        return true;
    }
}
