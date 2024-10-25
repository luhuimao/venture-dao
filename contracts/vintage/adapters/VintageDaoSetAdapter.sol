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
import "./VintageDaoSetHelperAdapter.sol";
import "../../guards/RaiserGuard.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "hardhat/console.sol";

contract VintageDaoSetAdapterContract is GovernorGuard, Reimbursable {
    using EnumerableSet for EnumerableSet.AddressSet;
    // using EnumerableSet for EnumerableSet.UintSet;

    // mapping(address => bytes32) public ongoingInvestorCapProposal;
    mapping(address => bytes32) public ongoingGovernorMembershipProposal;
    // mapping(address => bytes32) public ongoingInvstorMembershipProposal;
    mapping(address => bytes32) public ongoingVotingProposal;

    // mapping(address => mapping(bytes32 => InvestorCapProposalDetails))
    //     public investorCapProposals;

    mapping(address => mapping(bytes32 => GovernorMembershipProposalDetails))
        public governorMembershipProposals;

    // mapping(address => mapping(bytes32 => InvestorMembershipProposalDetails))
    //     public investorMembershipProposals;

    mapping(address => mapping(bytes32 => VotingProposalDetails))
        public votingProposals;

    mapping(bytes32 => EnumerableSet.AddressSet) governorMembershipWhitelists;
    mapping(bytes32 => EnumerableSet.AddressSet) investorMembershipWhiteLists;

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
        // bytes32 proposalId;
        bool enable;
        uint256 cap;
        uint256 creationTime;
        uint256 stopVoteTime;
        ProposalState state;
    }

    struct GovernorMembershipProposalDetails {
        bytes32 proposalId;
        string name;
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
        string name;
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

    struct VotingAllocs {
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
    error INVALID_ALLOC_PARAMS();
    error DAO_SET_PROPOSAL_NOT_FINALIZED();
    error OPERATION_PROPOSALS_NOT_DONE();
    modifier undonePrposalCheck(DaoRegistry dao) {
        if (
            // ongoingInvestorCapProposal[address(dao)] != bytes32(0) ||
            ongoingGovernorMembershipProposal[address(dao)] != bytes32(0) ||
            // ongoingInvstorMembershipProposal[address(dao)] != bytes32(0) ||
            ongoingVotingProposal[address(dao)] != bytes32(0)
        ) revert DAO_SET_PROPOSAL_NOT_FINALIZED();
        _;
    }

    function fundPeriodCheck(DaoRegistry dao) internal view {
        VintageFundingPoolAdapterContract fundingPoolAdapt = VintageFundingPoolAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_ADAPT)
            );

        DaoHelper.FundRaiseState state = fundingPoolAdapt.daoFundRaisingStates(
            address(dao)
        );
        uint256 returnDuration = dao.getConfiguration(
            DaoHelper.RETURN_DURATION
        );

        require(
            (state == DaoHelper.FundRaiseState.NOT_STARTED) ||
                state == DaoHelper.FundRaiseState.FAILED ||
                (state == DaoHelper.FundRaiseState.DONE &&
                    block.timestamp >
                    dao.getConfiguration(DaoHelper.FUND_END_TIME) +
                        returnDuration),
            "FUND_PERIOD"
        );
        require(fundingPoolAdapt.poolBalance(dao) <= 0, "!clear fund");
    }

    // function submitInvestorCapProposal(
    //     DaoRegistry dao,
    //     bool enable,
    //     uint256 cap
    // ) external onlyGovernor(dao) undonePrposalCheck(dao) reimbursable(dao) {
    //     fundPeriodCheck(dao);
    //     if (
    //         !VintageDaoSetHelperAdapterContract(
    //             dao.getAdapterAddress(DaoHelper.VINTAGE_DAO_SET_HELPER_ADAPTER)
    //         ).unDoneOperationProposalsCheck(dao)
    //     ) revert OPERATION_PROPOSALS_NOT_DONE();

    //     dao.increaseInvestorCapId();

    //     bytes32 proposalId = TypeConver.bytesToBytes32(
    //         abi.encodePacked(
    //             bytes8(uint64(uint160(address(dao)))),
    //             "Investor-Cap#",
    //             Strings.toString(dao.getCurrentInvestorCapProposalId())
    //         )
    //     );
    //     investorCapProposals[address(dao)][
    //         proposalId
    //     ] = InvestorCapProposalDetails(
    //         enable,
    //         cap,
    //         block.timestamp,
    //         block.timestamp + dao.getConfiguration(DaoHelper.VOTING_PERIOD),
    //         ProposalState.Voting
    //     );
    //     ongoingInvestorCapProposal[address(dao)] = proposalId;

    //     setProposal(dao, proposalId);

    //     emit ProposalCreated(
    //         address(dao),
    //         proposalId,
    //         ProposalType.INVESTOR_CAP
    //     );
    // }

    struct GovernorMembershipParams {
        DaoRegistry dao;
        string name;
        bool enable;
        uint8 varifyType;
        uint256 minAmount;
        address tokenAddress;
        uint256 tokenId;
        address[] whiteList;
    }

    function submitGovernorMembershipProposal(
        GovernorMembershipParams calldata params
    )
        external
        onlyGovernor(params.dao)
        undonePrposalCheck(params.dao)
        reimbursable(params.dao)
    {
        fundPeriodCheck(params.dao);
        if (
            !VintageDaoSetHelperAdapterContract(
                params.dao.getAdapterAddress(
                    DaoHelper.VINTAGE_DAO_SET_HELPER_ADAPTER
                )
            ).unDoneOperationProposalsCheck(params.dao)
        ) revert OPERATION_PROPOSALS_NOT_DONE();
        params.dao.increaseGovernorMembershipId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(params.dao)))),
                "Governor-Membership#",
                Strings.toString(
                    params.dao.getCurrentGovernorMembershipProposalId()
                )
            )
        );
        governorMembershipProposals[address(params.dao)][
            proposalId
        ] = GovernorMembershipProposalDetails(
            proposalId,
            params.name,
            params.enable,
            params.varifyType,
            params.minAmount,
            params.tokenAddress,
            params.tokenId,
            block.timestamp,
            block.timestamp +
                params.dao.getConfiguration(DaoHelper.VOTING_PERIOD),
            ProposalState.Voting
        );

        if (params.whiteList.length > 0) {
            for (uint8 i = 0; i < params.whiteList.length; i++) {
                governorMembershipWhitelists[proposalId].add(
                    params.whiteList[i]
                );
            }
        }

        ongoingGovernorMembershipProposal[address(params.dao)] = proposalId;

        setProposal(params.dao, proposalId);

        emit ProposalCreated(
            address(params.dao),
            proposalId,
            ProposalType.GOVERNOR_MEMBERSHIP
        );
    }

    struct InvesotrMembershipParams {
        DaoRegistry dao;
        string name;
        bool enable;
        uint8 varifyType;
        uint256 minAmount;
        address tokenAddress;
        uint256 tokenId;
        address[] whiteList;
    }

    // function submitInvestorMembershipProposal(
    //     InvesotrMembershipParams calldata params
    // )
    //     external
    //     onlyGovernor(params.dao)
    //     undonePrposalCheck(params.dao)
    //     reimbursable(params.dao)
    // {
    //     if (
    //         !VintageDaoSetHelperAdapterContract(
    //             params.dao.getAdapterAddress(
    //                 DaoHelper.VINTAGE_DAO_SET_HELPER_ADAPTER
    //             )
    //         ).unDoneOperationProposalsCheck(params.dao)
    //     ) revert OPERATION_PROPOSALS_NOT_DONE();
    //     fundPeriodCheck(params.dao);

    //     params.dao.increaseInvstorMembershipId();

    //     bytes32 proposalId = TypeConver.bytesToBytes32(
    //         abi.encodePacked(
    //             bytes8(uint64(uint160(address(params.dao)))),
    //             "Investor-Membership#",
    //             Strings.toString(
    //                 params.dao.getCurrentInvestorMembershipProposalId()
    //             )
    //         )
    //     );
    //     investorMembershipProposals[address(params.dao)][
    //         proposalId
    //     ] = InvestorMembershipProposalDetails(
    //         proposalId,
    //         params.name,
    //         params.enable,
    //         params.varifyType,
    //         params.minAmount,
    //         params.tokenAddress,
    //         params.tokenId,
    //         block.timestamp,
    //         block.timestamp +
    //             params.dao.getConfiguration(DaoHelper.VOTING_PERIOD),
    //         ProposalState.Voting
    //     );

    //     if (params.whiteList.length > 0) {
    //         for (uint8 i = 0; i < params.whiteList.length; i++) {
    //             investorMembershipWhiteLists[proposalId].add(
    //                 params.whiteList[i]
    //             );
    //         }
    //     }

    //     ongoingInvstorMembershipProposal[address(params.dao)] = proposalId;

    //     setProposal(params.dao, proposalId);

    //     emit ProposalCreated(
    //         address(params.dao),
    //         proposalId,
    //         ProposalType.INVESTOR_MEMBERSHIP
    //     );
    // }

    function submitVotingProposal(
        DaoRegistry dao,
        VotingParams calldata params
    ) external onlyGovernor(dao) undonePrposalCheck(dao) reimbursable(dao) {
        if (
            !VintageDaoSetHelperAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_DAO_SET_HELPER_ADAPTER)
            ).unDoneOperationProposalsCheck(dao)
        ) revert OPERATION_PROPOSALS_NOT_DONE();

        if (params.governors.length != params.allocations.length)
            revert INVALID_ALLOC_PARAMS();
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
                votingProposals[address(dao)][proposalId].allocs.allocations[
                        i
                    ] = params.allocations[i];
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

    // function processInvestorCapProposal(
    //     DaoRegistry dao,
    //     bytes32 proposalId
    // ) external reimbursable(dao) {
    //     InvestorCapProposalDetails storage proposal = investorCapProposals[
    //         address(dao)
    //     ][proposalId];

    //     dao.processProposal(proposalId);

    //     IVintageVoting votingContract = IVintageVoting(
    //         dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
    //     );

    //     // require(address(votingContract) != address(0x0), "!votingContract");
    //     IVintageVoting.VotingState voteResult;
    //     uint128 nbYes;
    //     uint128 nbNo;

    //     (voteResult, nbYes, nbNo) = votingContract.voteResult(dao, proposalId);

    //     if (voteResult == IVintageVoting.VotingState.PASS) {
    //         setInvestorCap(dao, proposal);
    //         proposal.state = ProposalState.Done;
    //     } else if (
    //         voteResult == IVintageVoting.VotingState.NOT_PASS ||
    //         voteResult == IVintageVoting.VotingState.TIE
    //     ) {
    //         proposal.state = ProposalState.Failed;
    //     } else {
    //         revert VOTING_NOT_FINISH();
    //     }

    //     ongoingInvestorCapProposal[address(dao)] = bytes32(0);

    //     uint128 allGPsWeight = GovernanceHelper
    //         .getVintageAllGovernorVotingWeightByProposalId(dao, proposalId);
    //     emit ProposalProcessed(
    //         address(dao),
    //         proposalId,
    //         proposal.state,
    //         uint256(voteResult),
    //         allGPsWeight,
    //         nbYes,
    //         nbNo
    //     );
    // }

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

    // function processInvestorMembershipProposal(
    //     DaoRegistry dao,
    //     bytes32 proposalId
    // ) external reimbursable(dao) {
    //     InvestorMembershipProposalDetails
    //         storage proposal = investorMembershipProposals[address(dao)][
    //             proposalId
    //         ];

    //     dao.processProposal(proposalId);

    //     IVintageVoting votingContract = IVintageVoting(
    //         dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
    //     );

    //     // require(address(votingContract) != address(0x0), "!votingContract");
    //     IVintageVoting.VotingState voteResult;
    //     uint128 nbYes;
    //     uint128 nbNo;

    //     (voteResult, nbYes, nbNo) = votingContract.voteResult(dao, proposalId);

    //     if (voteResult == IVintageVoting.VotingState.PASS) {
    //         setInvestorMembership(dao, proposal);
    //         proposal.state = ProposalState.Done;
    //     } else if (
    //         voteResult == IVintageVoting.VotingState.NOT_PASS ||
    //         voteResult == IVintageVoting.VotingState.TIE
    //     ) {
    //         proposal.state = ProposalState.Failed;
    //     } else {
    //         revert VOTING_NOT_FINISH();
    //     }

    //     ongoingInvstorMembershipProposal[address(dao)] = bytes32(0);

    //     uint128 allGPsWeight = GovernanceHelper
    //         .getVintageAllGovernorVotingWeightByProposalId(dao, proposalId);
    //     emit ProposalProcessed(
    //         address(dao),
    //         proposalId,
    //         proposal.state,
    //         uint256(voteResult),
    //         allGPsWeight,
    //         nbYes,
    //         nbNo
    //     );
    // }

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
        VintageDaoSetHelperAdapterContract helper = VintageDaoSetHelperAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_DAO_SET_HELPER_ADAPTER)
            );
        helper.setInvestorCap(dao, proposal.enable, proposal.cap);
    }

    function setGovernorMembership(
        DaoRegistry dao,
        GovernorMembershipProposalDetails storage proposal
    ) internal {
        VintageDaoSetHelperAdapterContract helper = VintageDaoSetHelperAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_DAO_SET_HELPER_ADAPTER)
            );

        helper.setGovernorMembership(
            dao,
            proposal.enable,
            proposal.name,
            proposal.varifyType,
            proposal.minAmount,
            proposal.tokenId,
            proposal.tokenAddress,
            governorMembershipWhitelists[proposal.proposalId].values()
        );
    }

    // function setInvestorMembership(
    //     DaoRegistry dao,
    //     InvestorMembershipProposalDetails storage proposal
    // ) internal {
    //     VintageDaoSetHelperAdapterContract helper = VintageDaoSetHelperAdapterContract(
    //             dao.getAdapterAddress(DaoHelper.VINTAGE_DAO_SET_HELPER_ADAPTER)
    //         );

    //     helper.setInvestorMembership(
    //         dao,
    //         proposal.enable,
    //         proposal.name,
    //         proposal.varifyType,
    //         proposal.minAmount,
    //         proposal.tokenId,
    //         proposal.tokenAddress,
    //         investorMembershipWhiteLists[proposal.proposalId].values()
    //     );
    // }

    function setVoting(
        DaoRegistry dao,
        VotingProposalDetails storage proposal
    ) internal {
        VintageDaoSetHelperAdapterContract helper = VintageDaoSetHelperAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_DAO_SET_HELPER_ADAPTER)
            );
        helper.setVoting(
            dao,
            [
                proposal.votingAssetInfo.votingAssetType,
                proposal.votingAssetInfo.tokenID,
                proposal.votingAssetInfo.votingWeightedType,
                proposal.supportInfo.supportType,
                proposal.supportInfo.quorumType,
                proposal.supportInfo.quorum,
                proposal.supportInfo.support,
                proposal.timeInfo.votingPeriod,
                proposal.timeInfo.executingPeriod
            ],
            proposal.votingAssetInfo.tokenAddress,
            proposal.allocs.allocations,
            votingGovernors[proposal.proposalId].values()
        );
    }

    function isProposalAllDone(address daoAddr) external view returns (bool) {
        if (
            // ongoingInvestorCapProposal[daoAddr] != bytes32(0) ||
            ongoingGovernorMembershipProposal[daoAddr] != bytes32(0) ||
            // ongoingInvstorMembershipProposal[daoAddr] != bytes32(0) ||
            ongoingVotingProposal[daoAddr] != bytes32(0)
        ) {
            return false;
        }
        return true;
    }

    function getinvestorMembershipWhiteLists(
        bytes32 proposalId
    ) external view returns (address[] memory) {
        return investorMembershipWhiteLists[proposalId].values();
    }
}
