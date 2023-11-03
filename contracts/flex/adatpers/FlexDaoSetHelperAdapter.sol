pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../helpers/DaoHelper.sol";
import "../../core/DaoRegistry.sol";
import "./FlexDaoSetAdapter.sol";
import "./StewardManagement.sol";
import "./FlexFundingPoolAdapter.sol";
import "./FlexFunding.sol";
import "./FlexPollingVoting.sol";
import "hardhat/console.sol";

contract FlexDaoSetHelperAdapterContract {
    function setParticipantCap(
        DaoRegistry dao,
        bool enable,
        uint256 cap
    ) external {
        require(
            msg.sender == dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_ADAPTER),
            "!access"
        );
        dao.setConfiguration(
            DaoHelper.MAX_PARTICIPANTS_ENABLE,
            enable == true ? 1 : 0
        );
        dao.setConfiguration(DaoHelper.MAX_PARTICIPANTS, cap);
    }

    function setGovernorMembership(
        DaoRegistry dao,
        bool enable,
        uint256 minAmount,
        address tokenAddress,
        uint256 tokenId,
        uint8 varifyType,
        address[] calldata whitelist
    ) external {
        require(
            msg.sender == dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_ADAPTER),
            "!access"
        );
        dao.setConfiguration(
            DaoHelper.FLEX_STEWARD_MEMBERSHIP_ENABLE,
            enable == true ? 1 : 0
        );

        if (enable) {
            dao.setConfiguration(
                DaoHelper.FLEX_STEWARD_MEMBERSHIP_TYPE,
                varifyType
            );
            dao.setConfiguration(
                DaoHelper.FLEX_STEWARD_MEMBERSHIP_MINI_HOLDING,
                minAmount
            );
            dao.setAddressConfiguration(
                DaoHelper.FLEX_STEWARD_MEMBERSHIP_TOKEN_ADDRESS,
                tokenAddress
            );

            dao.setConfiguration(
                DaoHelper.FLEX_STEWARD_MEMBERSHIP_TOKEN_ID,
                tokenId
            );

            // FlexDaoSetAdapterContract daosetContract = FlexDaoSetAdapterContract(
            //         dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_ADAPTER)
            //     );
            // address[] memory whitelist = daosetContract.getGovernorWhitelist(
            //     proposalId
            // );
            if (whitelist.length > 0) {
                StewardManagementContract stewardContract = StewardManagementContract(
                        dao.getAdapterAddress(DaoHelper.FLEX_STEWARD_MANAGEMENT)
                    );

                stewardContract.clearGovernorWhitelist(dao);
                for (uint8 i = 0; i < whitelist.length; i++) {
                    stewardContract.registerStewardWhiteList(dao, whitelist[i]);
                }
            }
        }
    }

    function setInvestorMembership(
        DaoRegistry dao,
        bool enable,
        uint8 varifyType,
        string calldata name,
        uint256 minAmount,
        address tokenAddress,
        uint256 tokenId,
        address[] calldata whitelist
    ) external {
        require(
            msg.sender == dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_ADAPTER),
            "!access"
        );
        dao.setConfiguration(
            DaoHelper.FLEX_PARTICIPANT_MEMBERSHIP_ENABLE,
            enable == true ? 1 : 0
        );
        if (enable) {
            dao.setConfiguration(
                DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_TYPE,
                varifyType
            );
            //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS

            FlexInvestmentPoolAdapterContract flexFundingPool = FlexInvestmentPoolAdapterContract(
                    dao.getAdapterAddress(DaoHelper.FLEX_INVESTMENT_POOL_ADAPT)
                );
            flexFundingPool.createParticipantMembership(
                dao,
                name,
                varifyType,
                minAmount,
                tokenAddress,
                tokenId
            );

            // FlexDaoSetAdapterContract daosetContract = FlexDaoSetAdapterContract(
            //         dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_ADAPTER)
            //     );
            // address[] memory whitelist = daosetContract.getInvestorWhitelist(
            //     proposalId
            // );

            if (whitelist.length > 0) {
                FlexInvestmentPoolAdapterContract fundingPoolAdapt = FlexInvestmentPoolAdapterContract(
                        dao.getAdapterAddress(DaoHelper.FLEX_INVESTMENT_POOL_ADAPT)
                    );
                fundingPoolAdapt.clearInvestorWhitelist(dao, name);
                for (uint8 i = 0; i < whitelist.length; i++) {
                    flexFundingPool.registerParticipantWhiteList(
                        dao,
                        name,
                        whitelist[i]
                    );
                }
            }
        }
    }

    function setVoting(
        DaoRegistry dao,
        address tokenAddress,
        uint256[8] calldata uint256Args,
        address[] calldata governors,
        uint256[] calldata allocations
    ) external {
        require(
            msg.sender == dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_VOTING_ADAPTER),
            "!access"
        );
        dao.setConfiguration(
            DaoHelper.FLEX_VOTING_ELIGIBILITY_TYPE,
            uint256Args[0] //  eligibilityType
        );
        dao.setAddressConfiguration(
            DaoHelper.FLEX_VOTING_ELIGIBILITY_TOKEN_ADDRESS,
            tokenAddress
        );
        dao.setConfiguration(
            DaoHelper.VINTAGE_VOTING_ELIGIBILITY_TOKEN_ID,
            uint256Args[1] // tokenID
        );
        dao.setConfiguration(
            DaoHelper.FLEX_VOTING_WEIGHTED_TYPE,
            uint256Args[2] //votingWeightedType
        );
        dao.setConfiguration(
            DaoHelper.FLEX_VOTING_SUPPORT_TYPE,
            uint256Args[3]
        ); //supportType
        dao.setConfiguration(DaoHelper.FLEX_VOTING_QUORUM_TYPE, uint256Args[4]); //quorumType
        dao.setConfiguration(DaoHelper.QUORUM, uint256Args[5]); //quorum
        dao.setConfiguration(DaoHelper.SUPER_MAJORITY, uint256Args[6]); //support
        dao.setConfiguration(DaoHelper.VOTING_PERIOD, uint256Args[7]); //votingPeriod

        // FlexDaoSetAdapterContract daosetContract = FlexDaoSetAdapterContract(
        //     dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_ADAPTER)
        // );
        // address[] memory governors;
        // uint256[] memory allocations;
        // (governors, allocations) = daosetContract.getAllocations(proposalId);
        if (governors.length > 0) {
            FlexStewardAllocationAdapter stewardAlloc = FlexStewardAllocationAdapter(
                    dao.getAdapterAddress(
                        DaoHelper.FLEX_STEWARD_ALLOCATION_ADAPT
                    )
                );
            for (uint8 i = 0; i < governors.length; i++) {
                stewardAlloc.setAllocation(dao, governors[i], allocations[i]);
            }
        }
    }

    function setFees(
        DaoRegistry dao,
        uint256 flexDaoManagementfee,
        uint256 flexDaoReturnTokenManagementFee,
        address managementFeeAddress
    ) external {
        require(
            msg.sender == dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_ADAPTER),
            "!access"
        );
        //1config FLEX_MANAGEMENT_FEE_AMOUNT
        dao.setConfiguration(
            DaoHelper.FLEX_MANAGEMENT_FEE_AMOUNT,
            flexDaoManagementfee
        );
        // 2config FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS
        dao.setAddressConfiguration(
            DaoHelper.FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS,
            managementFeeAddress
        );
        //3config FLEX_RETURN_TOKEN_MANAGEMENT_FEE_AMOUNT
        dao.setConfiguration(
            DaoHelper.FLEX_RETURN_TOKEN_MANAGEMENT_FEE_AMOUNT,
            flexDaoReturnTokenManagementFee
        );
    }

    function setProposerMembership(
        DaoRegistry dao,
        uint256 flexDaoProposerMembershipMinHolding,
        uint256 flexDaoProposerMembershipTokenId,
        uint256 flexDaoProposerMembershipVarifyType,
        address flexDaoProposerMembershipTokenAddress,
        address[] calldata _whitelist
    ) external {
        require(
            msg.sender == dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_ADAPTER),
            "!access"
        );
        dao.setConfiguration(
            DaoHelper.FLEX_PROPOSER_MIN_HOLDING,
            flexDaoProposerMembershipMinHolding
        );
        dao.setAddressConfiguration(
            DaoHelper.FLEX_PROPOSER_TOKEN_ADDRESS,
            flexDaoProposerMembershipTokenAddress
        );
        dao.setConfiguration(
            DaoHelper.FLEX_PROPOSER_TOKENID,
            flexDaoProposerMembershipTokenId
        );
        dao.setConfiguration(
            DaoHelper.FLEX_PROPOSER_IDENTIFICATION_TYPE,
            flexDaoProposerMembershipVarifyType
        );
        // FlexDaoSetAdapterContract daosetContract = FlexDaoSetAdapterContract(
        //     dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_ADAPTER)
        // );
        // address[] memory _whitelist = daosetContract
        //     .getProposerMembershipWhitelist(proposalId);
        if (_whitelist.length > 0) {
            FlexFundingAdapterContract flexFunding = FlexFundingAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
            );
            flexFunding.clearProposerWhitelist(dao);
            for (uint8 i = 0; i < _whitelist.length; i++) {
                flexFunding.registerProposerWhiteList(dao, _whitelist[i]);
            }
        }
    }

    function setPollForInvestment(
        DaoRegistry dao,
        uint256[9] calldata uint256Args,
        address[2] calldata addressArgs,
        address[] calldata pollsterMembershipWhitelist
    ) external {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_POLLING_ADAPTER),
            "!access"
        );
        dao.setConfiguration(
            DaoHelper.FLEX_POLLING_VOTING_PERIOD,
            uint256Args[0] // flexDaoPollingVotingPeriod
        );
        dao.setConfiguration(
            DaoHelper.FLEX_POLL_VOTING_WEIGHTED_TYPE,
            uint256Args[1] //flexDaoPollingVotingPower
        );
        dao.setConfiguration(
            DaoHelper.FLEX_POLLING_SUPER_MAJORITY,
            uint256Args[2] //flexDaoPollingSuperMajority
        );
        dao.setConfiguration(
            DaoHelper.FLEX_POLLING_QUORUM,
            uint256Args[3] //flexDaoPollingQuorum
        );
        dao.setConfiguration(
            DaoHelper.FLEX_POLL_VOTING_ELIGIBILITY_TYPE,
            uint256Args[4] //flexDaoPollingEligibilityType
        );
        dao.setConfiguration(
            DaoHelper.FLEX_POLL_VOTING_ELIGIBILITY_TOKEN_ID,
            uint256Args[5] //tokenId
        );
        dao.setAddressConfiguration(
            DaoHelper.FLEX_POLL_VOTING_ELIGIBILITY_TOKEN_ADDRESS,
            addressArgs[0] //tokenAddress
        );

        dao.setConfiguration(
            DaoHelper.FLEX_POLLSTER_MEMBERSHIP_TYPE,
            uint256Args[6] //flexDaoPollsterMembershipVarifyType
        );
        dao.setConfiguration(
            DaoHelper.FLEX_POLLSTER_MEMBERSHIP_MIN_HOLDING,
            uint256Args[7] //flexDaoPollsterMembershipMinHolding
        );
        dao.setAddressConfiguration(
            DaoHelper.FLEX_POLLSTER_MEMBERSHIP_TOKEN_ADDRESS,
            addressArgs[1] //flexDaoPollsterMembershipTokenAddress
        );
        dao.setConfiguration(
            DaoHelper.FLEX_POLLSTER_MEMBERSHIP_TOKENID,
            uint256Args[8] //flexDaoPollsterMembershipTokenId
        );

        if (pollsterMembershipWhitelist.length > 0) {
            FlexPollingVotingContract flexPollingVoting = FlexPollingVotingContract(
                    dao.getAdapterAddress(DaoHelper.FLEX_POLLING_VOTING_ADAPT)
                );
            flexPollingVoting.clearPollsterWhiteList(dao);
            for (uint8 i = 0; i < pollsterMembershipWhitelist.length; i++) {
                flexPollingVoting.registerPollsterWhiteList(
                    dao,
                    pollsterMembershipWhitelist[i]
                );
            }
        }
    }
}
