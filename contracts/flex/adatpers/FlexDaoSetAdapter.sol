pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "../../helpers/GovernanceHelper.sol";
import "../../helpers/DaoHelper.sol";
import "../../utils/TypeConver.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "../../guards/RaiserGuard.sol";
import "./FlexFundingPoolAdapter.sol";
import "./FlexStewardAllocation.sol";
import "./StewardManagement.sol";
import "./FlexFunding.sol";
import "./FlexDaoSetHelperAdapter.sol";
import "./FlexDaoSetPollingAdapter.sol";
import "./FlexDaoSetVotingAdapter.sol";
import "./interfaces/IFlexVoting.sol";
import "../libraries/LibFlexDaoset.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "hardhat/console.sol";

contract FlexDaoSetAdapterContract is GovernorGuard, Reimbursable, MemberGuard {
    using EnumerableSet for EnumerableSet.AddressSet;
    // using EnumerableSet for EnumerableSet.UintSet;

    mapping(address => bytes32) public ongoingInvestorCapProposal;
    mapping(address => bytes32) public ongoingGovernorMembershipProposal;
    mapping(address => bytes32) public ongoingInvstorMembershipProposal;
    mapping(address => bytes32) public ongoingFeesProposal;
    mapping(address => bytes32) public ongoingProposerMembershipProposal;

    mapping(address => mapping(bytes32 => FlexDaosetLibrary.InvestorCapProposalDetails))
        public investorCapProposals;

    mapping(address => mapping(bytes32 => FlexDaosetLibrary.GovernorMembershipProposalDetails))
        public governorMembershipProposals;

    mapping(address => mapping(bytes32 => FlexDaosetLibrary.InvestorMembershipProposalDetails))
        public investorMembershipProposals;

    mapping(address => mapping(bytes32 => FlexDaosetLibrary.FeeProposalDetails))
        public feesProposals;
    mapping(address => mapping(bytes32 => FlexDaosetLibrary.ProposerMembershipProposalDetails))
        public proposerMembershipProposals;

    mapping(bytes32 => EnumerableSet.AddressSet) governorMembershipWhitelists;
    mapping(bytes32 => EnumerableSet.AddressSet) investorMembershipWhiteLists;
    mapping(bytes32 => EnumerableSet.AddressSet) proposerMembershipWhiteLists;
    mapping(bytes32 => EnumerableSet.AddressSet) pollvoterMembershipWhiteLists;

    event ProposalCreated(
        address daoAddr,
        bytes32 proposalId,
        FlexDaosetLibrary.ProposalType pType
    );
    event ProposalProcessed(
        address daoAddr,
        bytes32 proposalId,
        uint256 voteResult,
        uint128 allVotingWeight,
        uint256 nbYes,
        uint256 nbNo
    );

    function unDoneProposalsCheck(
        DaoRegistry dao
    ) internal view returns (bool) {
        FlexFundingAdapterContract funding = FlexFundingAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
        );
        StewardManagementContract governor = StewardManagementContract(
            dao.getAdapterAddress(DaoHelper.FLEX_STEWARD_MANAGEMENT)
        );

        if (funding.allDone(dao) && governor.allDone(dao)) return true;
        return false;
    }

    function submitInvestorCapProposal(
        DaoRegistry dao,
        bool enable,
        uint256 cap
    ) external onlyMember(dao) reimbursable(dao) {
        require(
            ongoingInvestorCapProposal[address(dao)] == bytes32(0),
            "!submit"
        );
        require(
            FlexDaoSetHelperAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER)
            ).unDoneProposalsCheck(dao),
            "unDone Proposals"
        );

        dao.increaseInvestorCapId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "Invstor Cap #",
                Strings.toString(dao.getCurrentInvestorCapProposalId())
            )
        );

        investorCapProposals[address(dao)][proposalId] = FlexDaosetLibrary
            .InvestorCapProposalDetails(
                enable,
                cap,
                block.timestamp,
                block.timestamp + dao.getConfiguration(DaoHelper.VOTING_PERIOD),
                FlexDaosetLibrary.ProposalState.Voting
            );
        ongoingInvestorCapProposal[address(dao)] = proposalId;

        setProposal(dao, proposalId);
        emit ProposalCreated(
            address(dao),
            proposalId,
            FlexDaosetLibrary.ProposalType.INVESTOR_CAP
        );
    }

    function submitGovernorMembershipProposal(
        FlexDaosetLibrary.GovernorMembershipParams calldata params
    ) external onlyMember(params.dao) reimbursable(params.dao) {
        require(
            ongoingGovernorMembershipProposal[address(params.dao)] ==
                bytes32(0),
            "!submit"
        );
        require(unDoneProposalsCheck(params.dao), "unDone Proposals");

        params.dao.increaseGovernorMembershipId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(params.dao)))),
                "Governor Membership #",
                Strings.toString(
                    params.dao.getCurrentGovernorMembershipProposalId()
                )
            )
        );

        governorMembershipProposals[address(params.dao)][
            proposalId
        ] = FlexDaosetLibrary.GovernorMembershipProposalDetails(
            params.enable,
            params.name,
            params.varifyType,
            params.minAmount,
            params.tokenAddress,
            params.tokenId,
            block.timestamp,
            block.timestamp +
                params.dao.getConfiguration(DaoHelper.VOTING_PERIOD),
            FlexDaosetLibrary.ProposalState.Voting
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
            FlexDaosetLibrary.ProposalType.GOVERNOR_MEMBERSHIP
        );
    }

    function submitInvestorMembershipProposal(
        FlexDaosetLibrary.InvestorMembershipParams calldata params
    ) external onlyMember(params.dao) reimbursable(params.dao) {
        require(
            ongoingInvstorMembershipProposal[address(params.dao)] == bytes32(0),
            "!submit"
        );
        require(unDoneProposalsCheck(params.dao), "unDone Proposals");

        params.dao.increaseInvstorMembershipId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(params.dao)))),
                "Investor Membership #",
                Strings.toString(
                    params.dao.getCurrentInvestorMembershipProposalId()
                )
            )
        );

        investorMembershipProposals[address(params.dao)][
            proposalId
        ] = FlexDaosetLibrary.InvestorMembershipProposalDetails(
            params.enable,
            params.name,
            params.varifyType,
            params.minAmount,
            params.tokenAddress,
            params.tokenId,
            block.timestamp,
            block.timestamp +
                params.dao.getConfiguration(DaoHelper.VOTING_PERIOD),
            FlexDaosetLibrary.ProposalState.Voting
        );

        if (params.whiteList.length > 0) {
            for (uint8 i = 0; i < params.whiteList.length; i++) {
                investorMembershipWhiteLists[proposalId].add(
                    params.whiteList[i]
                );
            }
        }

        ongoingInvstorMembershipProposal[address(params.dao)] = proposalId;

        setProposal(params.dao, proposalId);

        emit ProposalCreated(
            address(params.dao),
            proposalId,
            FlexDaosetLibrary.ProposalType.INVESTOR_MEMBERSHIP
        );
    }

    function submitVotingProposal(
        FlexDaosetLibrary.VotingParams calldata params
    ) external onlyMember(params.dao) reimbursable(params.dao) {
        require(unDoneProposalsCheck(params.dao), "unDone Proposals");

        FlexDaoSetVotingAdapterContract votingDaoset = FlexDaoSetVotingAdapterContract(
                params.dao.getAdapterAddress(
                    DaoHelper.FLEX_DAO_SET_VOTING_ADAPTER
                )
            );
        bytes32 proposalId = votingDaoset.submitVotingProposal(params);

        emit ProposalCreated(
            address(params.dao),
            proposalId,
            FlexDaosetLibrary.ProposalType.VOTING
        );
    }

    function submitFeesProposal(
        DaoRegistry dao,
        uint256 flexDaoManagementfee,
        uint256 returnTokenManagementFee,
        address managementFeeAddress
    ) external onlyMember(dao) reimbursable(dao) {
        require(ongoingFeesProposal[address(dao)] == bytes32(0), "!submit");
        require(unDoneProposalsCheck(dao), "unDone Proposals");

        dao.increaseFeesId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "Fees #",
                Strings.toString(dao.getCurrentFeeProposalId())
            )
        );

        feesProposals[address(dao)][proposalId] = FlexDaosetLibrary
            .FeeProposalDetails(
                flexDaoManagementfee,
                returnTokenManagementFee,
                managementFeeAddress,
                block.timestamp,
                block.timestamp + dao.getConfiguration(DaoHelper.VOTING_PERIOD),
                FlexDaosetLibrary.ProposalState.Voting
            );
        ongoingFeesProposal[address(dao)] = proposalId;

        setProposal(dao, proposalId);
        emit ProposalCreated(
            address(dao),
            proposalId,
            FlexDaosetLibrary.ProposalType.FEES
        );
    }

    function submitProposerMembershipProposal(
        FlexDaosetLibrary.ProposerMembershipParams calldata params
    ) external onlyMember(params.dao) reimbursable(params.dao) {
        require(
            ongoingProposerMembershipProposal[address(params.dao)] ==
                bytes32(0),
            "!submit"
        );
        require(unDoneProposalsCheck(params.dao), "unDone Proposals");

        params.dao.increaseProposerMembershipId();

        bytes32 proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(params.dao)))),
                "Proposer Membership #",
                Strings.toString(
                    params.dao.getCurrentProposerMembershipProposalId()
                )
            )
        );

        proposerMembershipProposals[address(params.dao)][
            proposalId
        ] = FlexDaosetLibrary.ProposerMembershipProposalDetails(
            params.proposerMembershipEnable,
            params.name,
            params.varifyType, //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
            params.minHolding,
            params.tokenAddress,
            params.tokenId,
            block.timestamp,
            block.timestamp +
                params.dao.getConfiguration(DaoHelper.VOTING_PERIOD),
            FlexDaosetLibrary.ProposalState.Voting
        );

        if (params.whiteList.length > 0) {
            for (uint8 i = 0; i < params.whiteList.length; i++) {
                proposerMembershipWhiteLists[proposalId].add(
                    params.whiteList[i]
                );
            }
        }
        ongoingProposerMembershipProposal[address(params.dao)] = proposalId;

        setProposal(params.dao, proposalId);
        emit ProposalCreated(
            address(params.dao),
            proposalId,
            FlexDaosetLibrary.ProposalType.PROPOSER_MEMBERHSIP
        );
    }

    function submitPollForInvestmentProposal(
        FlexDaosetLibrary.PollForInvestmentParams calldata params
    ) external onlyMember(params.dao) reimbursable(params.dao) {
        require(unDoneProposalsCheck(params.dao), "unDone Proposals");

        FlexDaoSetPollingAdapterContract pollingDaoset = FlexDaoSetPollingAdapterContract(
                params.dao.getAdapterAddress(
                    DaoHelper.FLEX_DAO_SET_POLLING_ADAPTER
                )
            );
        bytes32 proposalId = pollingDaoset.submitPollForInvestmentProposal(
            params
        );
        emit ProposalCreated(
            address(params.dao),
            proposalId,
            FlexDaosetLibrary.ProposalType.POLL_FOR_INVESTMENT
        );
    }

    function setProposal(DaoRegistry dao, bytes32 proposalId) internal {
        dao.submitProposal(proposalId);

        IFlexVoting votingContract = IFlexVoting(
            dao.getAdapterAddress(DaoHelper.FLEX_VOTING_ADAPT)
        );
        votingContract.startNewVotingForProposal(dao, proposalId, bytes(""));

        dao.sponsorProposal(proposalId, address(votingContract));

        // emit ProposalCreated(
        //     address(dao),
        //     proposalId,
        //     FlexDaosetLibrary.ProposalType.VOTING
        // );
    }

    function processInvestorCapProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        FlexDaosetLibrary.InvestorCapProposalDetails
            storage proposal = investorCapProposals[address(dao)][proposalId];

        (IFlexVoting.VotingState voteResult, , ) = processProposal(
            dao,
            proposalId
        );

        if (voteResult == IFlexVoting.VotingState.PASS) {
            setInvestorCap(dao, proposal);
            proposal.state = FlexDaosetLibrary.ProposalState.Done;
        } else if (
            voteResult == IFlexVoting.VotingState.NOT_PASS ||
            voteResult == IFlexVoting.VotingState.TIE
        ) {
            proposal.state = FlexDaosetLibrary.ProposalState.Failed;
        } else {
            revert FlexDaosetLibrary.VOTING_NOT_FINISH();
        }

        ongoingInvestorCapProposal[address(dao)] = bytes32(0);
    }

    function processGovernorMembershipProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        FlexDaosetLibrary.GovernorMembershipProposalDetails
            storage proposal = governorMembershipProposals[address(dao)][
                proposalId
            ];

        (IFlexVoting.VotingState voteResult, , ) = processProposal(
            dao,
            proposalId
        );

        if (voteResult == IFlexVoting.VotingState.PASS) {
            setGovernorMembership(dao, proposalId, proposal);
            proposal.state = FlexDaosetLibrary.ProposalState.Done;
        } else if (
            voteResult == IFlexVoting.VotingState.NOT_PASS ||
            voteResult == IFlexVoting.VotingState.TIE
        ) {
            proposal.state = FlexDaosetLibrary.ProposalState.Failed;
        } else {
            revert FlexDaosetLibrary.VOTING_NOT_FINISH();
        }

        ongoingGovernorMembershipProposal[address(dao)] = bytes32(0);
    }

    // function processInvestorMembershipProposal(
    //     DaoRegistry dao,
    //     bytes32 proposalId
    // ) external reimbursable(dao) {
    //     FlexDaosetLibrary.InvestorMembershipProposalDetails
    //         storage proposal = investorMembershipProposals[address(dao)][
    //             proposalId
    //         ];

    //     (IFlexVoting.VotingState voteResult, , ) = processProposal(
    //         dao,
    //         proposalId
    //     );

    //     if (voteResult == IFlexVoting.VotingState.PASS) {
    //         setInvestorMembership(dao, proposalId, proposal);
    //         proposal.state = FlexDaosetLibrary.ProposalState.Done;
    //     } else if (
    //         voteResult == IFlexVoting.VotingState.NOT_PASS ||
    //         voteResult == IFlexVoting.VotingState.TIE
    //     ) {
    //         proposal.state = FlexDaosetLibrary.ProposalState.Failed;
    //     } else {
    //         revert FlexDaosetLibrary.VOTING_NOT_FINISH();
    //     }

    //     ongoingInvstorMembershipProposal[address(dao)] = bytes32(0);
    // }

    function processVotingProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        FlexDaoSetVotingAdapterContract votingDaoset = FlexDaoSetVotingAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_VOTING_ADAPTER)
            );
        (
            IFlexVoting.VotingState vs,
            uint256 nbYes,
            uint256 nbNo,
            uint128 allWeight
        ) = votingDaoset.processVotingProposal(dao, proposalId);
        emit ProposalProcessed(
            address(dao),
            proposalId,
            uint256(vs),
            allWeight,
            nbYes,
            nbNo
        );
    }

    function processFeesProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        FlexDaosetLibrary.FeeProposalDetails storage proposal = feesProposals[
            address(dao)
        ][proposalId];

        (IFlexVoting.VotingState voteResult, , ) = processProposal(
            dao,
            proposalId
        );

        if (voteResult == IFlexVoting.VotingState.PASS) {
            setFees(dao, proposal);
            proposal.state = FlexDaosetLibrary.ProposalState.Done;
        } else if (
            voteResult == IFlexVoting.VotingState.NOT_PASS ||
            voteResult == IFlexVoting.VotingState.TIE
        ) {
            proposal.state = FlexDaosetLibrary.ProposalState.Failed;
        } else {
            revert FlexDaosetLibrary.VOTING_NOT_FINISH();
        }

        ongoingFeesProposal[address(dao)] = bytes32(0);
    }

    function processProposerMembershipProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        FlexDaosetLibrary.ProposerMembershipProposalDetails
            storage proposal = proposerMembershipProposals[address(dao)][
                proposalId
            ];

        (IFlexVoting.VotingState voteResult, , ) = processProposal(
            dao,
            proposalId
        );

        if (voteResult == IFlexVoting.VotingState.PASS) {
            setProposerMembership(dao, proposalId, proposal);
            proposal.state = FlexDaosetLibrary.ProposalState.Done;
        } else if (
            voteResult == IFlexVoting.VotingState.NOT_PASS ||
            voteResult == IFlexVoting.VotingState.TIE
        ) {
            proposal.state = FlexDaosetLibrary.ProposalState.Failed;
        } else {
            revert FlexDaosetLibrary.VOTING_NOT_FINISH();
        }

        ongoingProposerMembershipProposal[address(dao)] = bytes32(0);
    }

    // function processPollForInvestmentProposal(
    //     DaoRegistry dao,
    //     bytes32 proposalId
    // ) external reimbursable(dao) {
    //     FlexDaoSetPollingAdapterContract pollingDaoset = FlexDaoSetPollingAdapterContract(
    //             dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_POLLING_ADAPTER)
    //         );
    //     (
    //         IFlexVoting.VotingState vs,
    //         uint256 nbYes,
    //         uint256 nbNo,
    //         uint128 allWeight
    //     ) = pollingDaoset.processPollForInvestmentProposal(dao, proposalId);
    //     emit ProposalProcessed(
    //         address(dao),
    //         proposalId,
    //         uint256(vs),
    //         allWeight,
    //         nbYes,
    //         nbNo
    //     );
    // }

    function processProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) internal returns (IFlexVoting.VotingState, uint256, uint256) {
        dao.processProposal(proposalId);

        IFlexVoting votingContract = IFlexVoting(
            dao.getAdapterAddress(DaoHelper.FLEX_VOTING_ADAPT)
        );

        require(address(votingContract) != address(0x0), "!votingContract");

        (
            IFlexVoting.VotingState vs,
            uint256 nbYes,
            uint256 nbNo
        ) = votingContract.voteResult(dao, proposalId);
        uint128 allWeight = GovernanceHelper
            .getAllFlexGovernorVotingWeightByProposalId(dao, proposalId);
        emit ProposalProcessed(
            address(dao),
            proposalId,
            uint256(vs),
            allWeight,
            nbYes,
            nbNo
        );

        return (vs, nbYes, nbNo);
    }

    function setInvestorCap(
        DaoRegistry dao,
        FlexDaosetLibrary.InvestorCapProposalDetails storage proposal
    ) internal {
        FlexDaoSetHelperAdapterContract daosetHelper = FlexDaoSetHelperAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER)
            );
        daosetHelper.setInvestorCap(dao, proposal.enable, proposal.cap);
    }

    function setGovernorMembership(
        DaoRegistry dao,
        bytes32 proposalId,
        FlexDaosetLibrary.GovernorMembershipProposalDetails storage proposal
    ) internal {
        FlexDaoSetHelperAdapterContract daosetHelper = FlexDaoSetHelperAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER)
            );
        daosetHelper.setGovernorMembership(
            dao,
            proposal.enable,
            proposal.name,
            proposal.minAmount,
            proposal.tokenAddress,
            proposal.tokenId,
            proposal.varifyType,
            governorMembershipWhitelists[proposalId].values()
        );
    }

    function setInvestorMembership(
        DaoRegistry dao,
        bytes32 proposalId,
        FlexDaosetLibrary.InvestorMembershipProposalDetails storage proposal
    ) internal {
        FlexDaoSetHelperAdapterContract daosetHelper = FlexDaoSetHelperAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER)
            );
        daosetHelper.setInvestorMembership(
            dao,
            proposal.enable,
            proposal.name,
            proposal.varifyType,
            proposal.minAmount,
            proposal.tokenAddress,
            proposal.tokenId,
            investorMembershipWhiteLists[proposalId].values()
        );
    }

    function setFees(
        DaoRegistry dao,
        FlexDaosetLibrary.FeeProposalDetails storage proposal
    ) internal {
        FlexDaoSetHelperAdapterContract daosetHelper = FlexDaoSetHelperAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER)
            );
        daosetHelper.setFees(
            dao,
            proposal.flexDaoManagementfee,
            proposal.returnTokenManagementFee,
            proposal.managementFeeAddress
        );
    }

    function setProposerMembership(
        DaoRegistry dao,
        bytes32 proposalId,
        FlexDaosetLibrary.ProposerMembershipProposalDetails storage proposal
    ) internal {
        FlexDaoSetHelperAdapterContract daosetHelper = FlexDaoSetHelperAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER)
            );

        daosetHelper.setProposerMembership(
            dao,
            proposal.proposerMembershipEnable,
            proposal.name,
            proposal.minHolding,
            proposal.tokenId,
            proposal.varifyType,
            proposal.tokenAddress,
            proposerMembershipWhiteLists[proposalId].values()
        );
    }

    function isProposalAllDone(DaoRegistry dao) external view returns (bool) {
        FlexDaoSetPollingAdapterContract pollingDaoset = FlexDaoSetPollingAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_POLLING_ADAPTER)
            );

        FlexDaoSetVotingAdapterContract votingDaoset = FlexDaoSetVotingAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_VOTING_ADAPTER)
            );
        if (
            ongoingInvestorCapProposal[address(dao)] != bytes32(0) ||
            ongoingGovernorMembershipProposal[address(dao)] != bytes32(0) ||
            ongoingInvstorMembershipProposal[address(dao)] != bytes32(0) ||
            votingDaoset.ongoingVotingProposal(address(dao)) != bytes32(0) ||
            ongoingFeesProposal[address(dao)] != bytes32(0) ||
            ongoingProposerMembershipProposal[address(dao)] != bytes32(0) ||
            pollingDaoset.ongoingPollForInvestmentProposal(address(dao)) !=
            bytes32(0)
        ) {
            return false;
        }
        return true;
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

    function getGovernorWhitelist(
        bytes32 proposalId
    ) external view returns (address[] memory) {
        return governorMembershipWhitelists[proposalId].values();
    }

    function getInvestorWhitelist(
        bytes32 proposalId
    ) external view returns (address[] memory) {
        return investorMembershipWhiteLists[proposalId].values();
    }

    // function getAllocations(
    //     bytes32 proposalId
    // ) external view returns (address[] memory, uint256[] memory) {
    //     return (
    //         votingGovernors[proposalId].values(),
    //         votingAllocations[proposalId].values()
    //     );
    // }

    function getProposerMembershipWhitelist(
        bytes32 proposalId
    ) external view returns (address[] memory) {
        return proposerMembershipWhiteLists[proposalId].values();
    }
}
