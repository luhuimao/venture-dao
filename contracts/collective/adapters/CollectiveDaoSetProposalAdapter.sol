pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT
import "../../core/DaoRegistry.sol";
import "../../helpers/GovernanceHelper.sol";
import "../../helpers/DaoHelper.sol";
import "../../utils/TypeConver.sol";
import "./CollectiveVotingAdapter.sol";
import "./interfaces/ICollectiveVoting.sol";
import "./CollectiveGovernorManagementAdapter.sol";
import "./CollectiveFundingPoolAdapter.sol";
import "./CollectiveExpenseProposalAdapter.sol";
import "./CollectiveFundingProposalAdapter.sol";
import "./CollectiveFundRaiseProposalAdapter.sol";
import "./CollectiveTopUpProposalAdapter.sol";
import "../../guards/RaiserGuard.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "hardhat/console.sol";

contract ColletiveDaoSetProposalAdapterContract is GovernorGuard, Reimbursable {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;

    mapping(address => bytes32) public ongoingInvestorCapProposal;
    mapping(address => bytes32) public ongoingGovernorMembershipProposal;
    mapping(address => bytes32) public ongoingProposerRewardProposal;
    mapping(address => bytes32) public ongoingVotingProposal;
    mapping(address => bytes32) public ongoingFeesProposal;

    mapping(address => mapping(bytes32 => InvestorCapProposalDetails))
        public investorCapProposals;
    mapping(address => mapping(bytes32 => GovernorMembershipProposalDetails))
        public governorMembershipProposals;
    mapping(address => mapping(bytes32 => FeesProposalDetails))
        public feesProposals;
    mapping(address => mapping(bytes32 => VotingProposalDetails))
        public votingProposals;
    mapping(address => mapping(bytes32 => ProposerRewardProposalDetails))
        public proposerRewardProposals;
    mapping(bytes32 => EnumerableSet.AddressSet) governorMembershipWhitelists;
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
        PROPOSER_REWARD,
        VOTING,
        FEES
    }

    struct FeesProposalDetails {
        bytes32 proposalId;
        uint256 redemptionFeeAmount;
        uint256 creationTime;
        uint256 stopVoteTime;
        ProposalState state;
    }

    struct ProposerRewardProposalDetails {
        bytes32 proposalId;
        uint256 fundFromInvestorAmount;
        uint256 paybackTokenFromInvestorAmount;
        uint256 creationTime;
        uint256 stopVoteTime;
        ProposalState state;
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
        VotingAssetInfo votingAssetInfo;
        VotingTimeInfo timeInfo;
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
        uint256 gracePeriod;
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
        uint256 gracePeriod;
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
        uint256 nbYes,
        uint256 nbNo
    );

    error VOTING_NOT_FINISH();
    error UNDONE_OPERATION_PROPOSALS();

    function fundPeriodCheck(DaoRegistry dao) internal view {
        ColletiveFundingPoolAdapterContract fundingPoolAdapt = ColletiveFundingPoolAdapterContract(
                dao.getAdapterAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER
                )
            );

        ColletiveFundingPoolAdapterContract.FundState state = fundingPoolAdapt
            .fundState(address(dao));
        uint256 returnDuration = dao.getConfiguration(
            DaoHelper.RETURN_DURATION
        );
        require(
            (state ==
                ColletiveFundingPoolAdapterContract.FundState.NOT_STARTED) ||
                (state ==
                    ColletiveFundingPoolAdapterContract.FundState.FAILED &&
                    block.timestamp >
                    dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END) +
                        returnDuration),
            //      ||  (state == ColletiveFundingPoolAdapterContract.FundState.DONE &&
            // block.timestamp >
            // dao.getConfiguration(DaoHelper.FUND_END_TIME) +
            //     returnDuration)
            "FUND_PERIOD"
        );
    }

    function undoneProposalsCheck(DaoRegistry dao) internal view {
        ColletiveExpenseProposalAdapterContract expenseContr = ColletiveExpenseProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_EXPENSE_ADAPTER)
            );
        ColletiveFundingProposalAdapterContract fundingContr = ColletiveFundingProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUNDING_ADAPTER)
            );
        ColletiveFundRaiseProposalAdapterContract fundRaiseContrc = ColletiveFundRaiseProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUND_RAISE_ADAPTER)
            );
        ColletiveGovernorManagementAdapterContract governorContrc = ColletiveGovernorManagementAdapterContract(
                dao.getAdapterAddress(
                    DaoHelper.COLLECTIVE_GOVERNOR_MANAGEMENT_ADAPTER
                )
            );
        ColletiveTopUpProposalAdapterContract topupContrc = ColletiveTopUpProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_TOPUP_ADAPTER)
            );

        if (
            !expenseContr.allDone(dao) ||
            !fundingContr.allDone(dao) ||
            !fundRaiseContrc.allDone(dao) ||
            !governorContrc.allDone(dao) ||
            !topupContrc.allDone(dao)
        ) revert UNDONE_OPERATION_PROPOSALS();
    }

    function submitInvestorCapProposal(
        DaoRegistry dao,
        bool enable,
        uint256 cap
    ) external onlyGovernor(dao) reimbursable(dao) {
        undoneProposalsCheck(dao);

        require(isProposalAllDone(dao), "daoset proposals undone");
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
        string memory name,
        uint8 varifyType,
        uint256 minAmount,
        address tokenAddress,
        uint256 tokenId,
        address[] calldata whiteList
    ) external onlyGovernor(dao) reimbursable(dao) {
        // require(
        //     ongoingGovernorMembershipProposal[address(dao)] == bytes32(0),
        //     "last GovernorMembership proposal not finalized"
        // );
        require(isProposalAllDone(dao), "daoset proposals undone");

        undoneProposalsCheck(dao);

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
            name,
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

    function submitVotingProposal(
        DaoRegistry dao,
        VotingParams calldata params
    ) external onlyGovernor(dao) reimbursable(dao) {
        // require(
        //     ongoingVotingProposal[address(dao)] == bytes32(0),
        //     "last voting proposal not finalized"
        // );
        require(isProposalAllDone(dao), "daoset proposals undone");

        undoneProposalsCheck(dao);
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
                params.gracePeriod,
                block.timestamp,
                block.timestamp + dao.getConfiguration(DaoHelper.VOTING_PERIOD)
            ),
            ProposalState.Voting
        );
        ongoingVotingProposal[address(dao)] = proposalId;
        setProposal(dao, proposalId);
        emit ProposalCreated(address(dao), proposalId, ProposalType.VOTING);
    }

    function submitFeesProposal(
        DaoRegistry dao,
        uint256 redemtionFee
    ) external onlyGovernor(dao) reimbursable(dao) {
        undoneProposalsCheck(dao);
        // require(
        //     ongoingFeesProposal[address(dao)] == bytes32(0),
        //     "last cap proposal not finalized"
        // );
        require(isProposalAllDone(dao), "daoset proposals undone");

        dao.increaseFeesId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "Fees#",
                Strings.toString(dao.getCurrentFeeProposalId())
            )
        );
        feesProposals[address(dao)][proposalId] = FeesProposalDetails(
            proposalId,
            redemtionFee,
            block.timestamp,
            block.timestamp + dao.getConfiguration(DaoHelper.VOTING_PERIOD),
            ProposalState.Voting
        );
        ongoingFeesProposal[address(dao)] = proposalId;

        setProposal(dao, proposalId);

        emit ProposalCreated(address(dao), proposalId, ProposalType.FEES);
    }

    function submitProposerRewardProposal(
        DaoRegistry dao,
        uint256 fundFromInvestorAmount,
        uint256 paybackTokenFromInvestorAmount
    ) external onlyGovernor(dao) reimbursable(dao) {
        undoneProposalsCheck(dao);
        // require(
        //     ongoingProposerRewardProposal[address(dao)] == bytes32(0),
        //     "last cap proposal not finalized"
        // );
        require(isProposalAllDone(dao), "daoset proposals undone");

        dao.increaseProposerRewardId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "Proposer-Reward#",
                Strings.toString(dao.getCurrentProposerRewardProposalId())
            )
        );
        proposerRewardProposals[address(dao)][
            proposalId
        ] = ProposerRewardProposalDetails(
            proposalId,
            fundFromInvestorAmount,
            paybackTokenFromInvestorAmount,
            block.timestamp,
            block.timestamp + dao.getConfiguration(DaoHelper.VOTING_PERIOD),
            ProposalState.Voting
        );
        ongoingProposerRewardProposal[address(dao)] = proposalId;

        setProposal(dao, proposalId);

        emit ProposalCreated(
            address(dao),
            proposalId,
            ProposalType.PROPOSER_REWARD
        );
    }

    function setProposal(DaoRegistry dao, bytes32 proposalId) internal {
        dao.submitProposal(proposalId);

        ICollectiveVoting votingContract = ICollectiveVoting(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
        );
        votingContract.startNewVotingForProposal(dao, proposalId, bytes(""));

        dao.sponsorProposal(proposalId, address(votingContract));
    }

    function processInvestorCapProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        InvestorCapProposalDetails storage proposal = investorCapProposals[
            address(dao)
        ][proposalId];

        dao.processProposal(proposalId);

        ICollectiveVoting votingContract = ICollectiveVoting(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
        );

        ICollectiveVoting.VotingState voteResult;
        uint256 nbYes;
        uint256 nbNo;

        (voteResult, nbYes, nbNo) = votingContract.voteResult(dao, proposalId);

        if (voteResult == ICollectiveVoting.VotingState.PASS) {
            setInvestorCap(dao, proposal);
            proposal.state = ProposalState.Done;
        } else if (
            voteResult == ICollectiveVoting.VotingState.NOT_PASS ||
            voteResult == ICollectiveVoting.VotingState.TIE
        ) {
            proposal.state = ProposalState.Failed;
        } else {
            revert VOTING_NOT_FINISH();
        }

        ongoingInvestorCapProposal[address(dao)] = bytes32(0);

        uint128 allGPsWeight = GovernanceHelper
            .getCollectiveAllGovernorVotingWeightByProposalId(dao, proposalId);
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

        ICollectiveVoting votingContract = ICollectiveVoting(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
        );

        ICollectiveVoting.VotingState voteResult;
        uint256 nbYes;
        uint256 nbNo;

        (voteResult, nbYes, nbNo) = votingContract.voteResult(dao, proposalId);

        if (voteResult == ICollectiveVoting.VotingState.PASS) {
            setGovernorMembership(dao, proposal);
            proposal.state = ProposalState.Done;
        } else if (
            voteResult == ICollectiveVoting.VotingState.NOT_PASS ||
            voteResult == ICollectiveVoting.VotingState.TIE
        ) {
            proposal.state = ProposalState.Failed;
        } else {
            revert VOTING_NOT_FINISH();
        }

        ongoingGovernorMembershipProposal[address(dao)] = bytes32(0);

        uint128 allGPsWeight = GovernanceHelper
            .getCollectiveAllGovernorVotingWeightByProposalId(dao, proposalId);
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

        ICollectiveVoting votingContract = ICollectiveVoting(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
        );

        ICollectiveVoting.VotingState voteResult;
        uint256 nbYes;
        uint256 nbNo;

        (voteResult, nbYes, nbNo) = votingContract.voteResult(dao, proposalId);

        if (voteResult == ICollectiveVoting.VotingState.PASS) {
            setVoting(dao, proposal);
            proposal.state = ProposalState.Done;
        } else if (
            voteResult == ICollectiveVoting.VotingState.NOT_PASS ||
            voteResult == ICollectiveVoting.VotingState.TIE
        ) {
            proposal.state = ProposalState.Failed;
        } else {
            revert VOTING_NOT_FINISH();
        }

        ongoingVotingProposal[address(dao)] = bytes32(0);

        uint128 allGPsWeight = GovernanceHelper
            .getCollectiveAllGovernorVotingWeightByProposalId(dao, proposalId);
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

    function processFeesProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        FeesProposalDetails storage proposal = feesProposals[address(dao)][
            proposalId
        ];

        dao.processProposal(proposalId);

        ICollectiveVoting votingContract = ICollectiveVoting(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
        );

        ICollectiveVoting.VotingState voteResult;
        uint256 nbYes;
        uint256 nbNo;

        (voteResult, nbYes, nbNo) = votingContract.voteResult(dao, proposalId);

        if (voteResult == ICollectiveVoting.VotingState.PASS) {
            dao.setConfiguration(
                DaoHelper.COLLECTIVE_REDEMPT_FEE_AMOUNT,
                proposal.redemptionFeeAmount
            );
            proposal.state = ProposalState.Done;
        } else if (
            voteResult == ICollectiveVoting.VotingState.NOT_PASS ||
            voteResult == ICollectiveVoting.VotingState.TIE
        ) {
            proposal.state = ProposalState.Failed;
        } else {
            revert VOTING_NOT_FINISH();
        }

        ongoingFeesProposal[address(dao)] = bytes32(0);

        uint128 allGPsWeight = GovernanceHelper
            .getCollectiveAllGovernorVotingWeightByProposalId(dao, proposalId);
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

    function processProposerRewardProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        ProposerRewardProposalDetails
            storage proposal = proposerRewardProposals[address(dao)][
                proposalId
            ];

        dao.processProposal(proposalId);

        ICollectiveVoting votingContract = ICollectiveVoting(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
        );

        ICollectiveVoting.VotingState voteResult;
        uint256 nbYes;
        uint256 nbNo;

        (voteResult, nbYes, nbNo) = votingContract.voteResult(dao, proposalId);

        if (voteResult == ICollectiveVoting.VotingState.PASS) {
            dao.setConfiguration(
                DaoHelper.COLLECTIVE_PROPOSER_INVEST_TOKEN_REWARD_AMOUNT,
                proposal.fundFromInvestorAmount
            );
            dao.setConfiguration(
                DaoHelper.COLLECTIVE_PROPOSER_PAYBACK_TOKEN_REWARD_AMOUNT,
                proposal.paybackTokenFromInvestorAmount
            );

            proposal.state = ProposalState.Done;
        } else if (
            voteResult == ICollectiveVoting.VotingState.NOT_PASS ||
            voteResult == ICollectiveVoting.VotingState.TIE
        ) {
            proposal.state = ProposalState.Failed;
        } else {
            revert VOTING_NOT_FINISH();
        }

        ongoingProposerRewardProposal[address(dao)] = bytes32(0);

        uint128 allGPsWeight = GovernanceHelper
            .getCollectiveAllGovernorVotingWeightByProposalId(dao, proposalId);
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
            DaoHelper.COLLECTIVE_GOVERNOR_MEMBERSHIP_ENABLE,
            proposal.enable == true ? 1 : 0
        );

        if (proposal.enable) {
            dao.setConfiguration(
                DaoHelper.COLLECTIVE_GOVERNOR_MEMBERSHIP_TYPE,
                proposal.varifyType
            );
            dao.setConfiguration(
                DaoHelper.COLLECTIVE_GOVERNOR_MEMBERSHIP_MINI_HOLDING,
                proposal.minAmount
            );
            dao.setAddressConfiguration(
                DaoHelper.COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS,
                proposal.tokenAddress
            );

            dao.setConfiguration(
                DaoHelper.COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ID,
                proposal.tokenId
            );

            // dao.setConfiguration(
            //     DaoHelper.COLLECTIVE_GOVERNOR_MEMBERSHIP_MIN_DEPOSIT,
            //     proposal.minAmount
            // );
            uint256 len = governorMembershipWhitelists[proposal.proposalId]
                .values()
                .length;
            if (len > 0 && proposal.varifyType == 3) {
                ColletiveGovernorManagementAdapterContract governorManagementAdapt = ColletiveGovernorManagementAdapterContract(
                        dao.getAdapterAddress(
                            DaoHelper.COLLECTIVE_GOVERNOR_MANAGEMENT_ADAPTER
                        )
                    );

                governorManagementAdapt.clearGovernorWhitelist(dao);
                for (uint8 i = 0; i < len; i++) {
                    governorManagementAdapt.registerGovernorWhiteList(
                        dao,
                        governorMembershipWhitelists[proposal.proposalId].at(i)
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
            DaoHelper.COLLECTIVE_VOTING_ASSET_TYPE,
            proposal.votingAssetInfo.votingAssetType
        );
        // dao.setAddressConfiguration(
        //     DaoHelper.COLLECTIVE_VOTING_ASSET_TOKEN_ADDRESS,
        //     proposal.votingAssetInfo.tokenAddress
        // );
        // dao.setConfiguration(
        //     DaoHelper.COLLECTIVE_VOTING_ASSET_TOKEN_ID,
        //     proposal.votingAssetInfo.tokenID
        // );
        dao.setConfiguration(
            DaoHelper.COLLECTIVE_VOTING_WEIGHTED_TYPE,
            proposal.votingAssetInfo.votingWeightedType
        );
        dao.setConfiguration(
            DaoHelper.COLLECTIVE_VOTING_SUPPORT_TYPE,
            proposal.supportInfo.supportType
        );
        dao.setConfiguration(
            DaoHelper.COLLECTIVE_VOTING_QUORUM_TYPE,
            proposal.supportInfo.quorumType
        );
        dao.setConfiguration(DaoHelper.QUORUM, proposal.supportInfo.quorum);
        dao.setConfiguration(
            DaoHelper.SUPER_MAJORITY,
            proposal.supportInfo.support
        );

        dao.setConfiguration(
            DaoHelper.COLLECTIVE_VOTING_GRACE_PERIOD,
            proposal.timeInfo.gracePeriod
        );
        dao.setConfiguration(
            DaoHelper.VOTING_PERIOD,
            proposal.timeInfo.votingPeriod
        );
        dao.setConfiguration(
            DaoHelper.PROPOSAL_EXECUTE_DURATION,
            proposal.timeInfo.executingPeriod
        );
    }

    function getGovernorMembershipWhitelist(
        bytes32 proposalId
    ) external view returns (address[] memory) {
        return governorMembershipWhitelists[proposalId].values();
    }

    function isProposalAllDone(DaoRegistry dao) public view returns (bool) {
        if (
            ongoingInvestorCapProposal[address(dao)] != bytes32(0) ||
            ongoingGovernorMembershipProposal[address(dao)] != bytes32(0) ||
            ongoingFeesProposal[address(dao)] != bytes32(0) ||
            ongoingVotingProposal[address(dao)] != bytes32(0) ||
            ongoingProposerRewardProposal[address(dao)] != bytes32(0)
        ) {
            return false;
        }
        return true;
    }
}
