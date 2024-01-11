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
    function setInvestorCap(
        DaoRegistry dao,
        bool enable,
        uint256 cap
    ) external {
        require(
            msg.sender == dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_ADAPTER),
            "!access"
        );
        dao.setConfiguration(
            DaoHelper.MAX_INVESTORS_ENABLE,
            enable == true ? 1 : 0
        );
        dao.setConfiguration(DaoHelper.MAX_INVESTORS, cap);
    }

    function setGovernorMembership(
        DaoRegistry dao,
        bool enable,
        string calldata name,
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
            DaoHelper.FLEX_GOVERNOR_MEMBERSHIP_ENABLE,
            enable == true ? 1 : 0
        );

        if (enable) {
            dao.setStringConfiguration(
                DaoHelper.FLEX_GOVERNOR_MEMBERSHIP_NAME,
                name
            );
            dao.setConfiguration(
                DaoHelper.FLEX_GOVERNOR_MEMBERSHIP_TYPE,
                varifyType
            );
            dao.setConfiguration(
                DaoHelper.FLEX_GOVERNOR_MEMBERSHIP_MINI_HOLDING,
                minAmount
            );
            dao.setAddressConfiguration(
                DaoHelper.FLEX_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS,
                tokenAddress
            );

            dao.setConfiguration(
                DaoHelper.FLEX_GOVERNOR_MEMBERSHIP_TOKEN_ID,
                tokenId
            );

            if (whitelist.length > 0) {
                StewardManagementContract governorContract = StewardManagementContract(
                        dao.getAdapterAddress(DaoHelper.FLEX_STEWARD_MANAGEMENT)
                    );

                governorContract.clearGovernorWhitelist(dao);
                for (uint8 i = 0; i < whitelist.length; i++) {
                    governorContract.registerGovernorWhiteList(
                        dao,
                        whitelist[i]
                    );
                }
            }
        }
    }

    function setInvestorMembership(
        DaoRegistry dao,
        bool enable,
        string calldata name,
        uint8 varifyType,
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
            DaoHelper.FLEX_INVESTOR_MEMBERSHIP_ENABLE,
            enable == true ? 1 : 0
        );
        if (enable) {
            dao.setStringConfiguration(
                DaoHelper.FLEX_INVESTOR_MEMBERSHIP_NAME,
                name
            );
            dao.setConfiguration(
                DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_TYPE,
                varifyType
            );
            //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS

            FlexInvestmentPoolAdapterContract flexFundingPool = FlexInvestmentPoolAdapterContract(
                    dao.getAdapterAddress(DaoHelper.FLEX_INVESTMENT_POOL_ADAPT)
                );
            // flexFundingPool.createInvestorMembership(
            //     dao,
            //     varifyType,
            //     minAmount,
            //     tokenAddress,
            //     tokenId
            // );

            dao.setConfiguration(
                DaoHelper.FLEX_INVESTOR_MEMBERSHIP_TYPE,
                varifyType
            );
            dao.setConfiguration(
                DaoHelper.FLEX_INVESTOR_MEMBERSHIP_MIN_HOLDING,
                minAmount
            );
            dao.setConfiguration(
                DaoHelper.FLEX_INVESTOR_MEMBERSHIP_TOKENID,
                tokenId
            );
            dao.setAddressConfiguration(
                DaoHelper.FLEX_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS,
                tokenAddress
            );

            if (whitelist.length > 0) {
                FlexInvestmentPoolAdapterContract fundingPoolAdapt = FlexInvestmentPoolAdapterContract(
                        dao.getAdapterAddress(
                            DaoHelper.FLEX_INVESTMENT_POOL_ADAPT
                        )
                    );
                fundingPoolAdapt.clearInvestorWhitelist(dao);
                for (uint8 i = 0; i < whitelist.length; i++) {
                    flexFundingPool.registerInvestorWhiteList(
                        dao,
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
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_VOTING_ADAPTER),
            "!access"
        );
        dao.setConfiguration(
            DaoHelper.FLEX_VOTING_ASSET_TYPE,
            uint256Args[0] //  votingAssetType
        );
        dao.setAddressConfiguration(
            DaoHelper.FLEX_VOTING_ASSET_TOKEN_ADDRESS,
            tokenAddress
        );
        dao.setConfiguration(
            DaoHelper.VINTAGE_VOTING_ASSET_TOKEN_ID,
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

        if (governors.length > 0) {
            FlexStewardAllocationAdapter governorAlloc = FlexStewardAllocationAdapter(
                    dao.getAdapterAddress(
                        DaoHelper.FLEX_STEWARD_ALLOCATION_ADAPT
                    )
                );
            for (uint8 i = 0; i < governors.length; i++) {
                governorAlloc.setAllocation(dao, governors[i], allocations[i]);
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
        bool enable,
        string calldata name,
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
        enable == false
            ? dao.setConfiguration(DaoHelper.FLEX_PROPOSER_ENABLE, 0)
            : dao.setConfiguration(DaoHelper.FLEX_PROPOSER_ENABLE, 1);
        if (enable) {
            dao.setConfiguration(DaoHelper.FLEX_PROPOSER_ENABLE, 1);
            dao.setStringConfiguration(
                DaoHelper.FLEX_PROPOSER_MEMBERSHIP_NAME,
                name
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
    }

    function setPollForInvestment(
        DaoRegistry dao,
        uint256[9] calldata uint256Args,
        address[2] calldata addressArgs,
        address[] calldata pollvoterMembershipWhitelist,
        string calldata name
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
            DaoHelper.FLEX_POLL_VOTING_ASSET_TYPE,
            uint256Args[4] //flexDaoPollingVotingAssetType
        );
        dao.setConfiguration(
            DaoHelper.FLEX_POLL_VOTING_ASSET_TOKEN_ID,
            uint256Args[5] //tokenId
        );
        dao.setAddressConfiguration(
            DaoHelper.FLEX_POLL_VOTING_ASSET_TOKEN_ADDRESS,
            addressArgs[0] //tokenAddress
        );

        dao.setStringConfiguration(
            DaoHelper.FLEX_POLLVOTER_MEMBERSHIP_NAME,
            name
        );
        dao.setConfiguration(
            DaoHelper.FLEX_POLLVOTER_MEMBERSHIP_TYPE,
            uint256Args[6] //flexDaoPollvoterMembershipVarifyType
        );
        dao.setConfiguration(
            DaoHelper.FLEX_POLLVOTER_MEMBERSHIP_MIN_HOLDING,
            uint256Args[7] //flexDaoPollvoterMembershipMinHolding
        );
        dao.setAddressConfiguration(
            DaoHelper.FLEX_POLLVOTER_MEMBERSHIP_TOKEN_ADDRESS,
            addressArgs[1] //flexDaoPollvoterMembershipTokenAddress
        );
        dao.setConfiguration(
            DaoHelper.FLEX_POLLVOTER_MEMBERSHIP_TOKENID,
            uint256Args[8] //flexDaoPollvoterMembershipTokenId
        );

        if (pollvoterMembershipWhitelist.length > 0) {
            FlexPollingVotingContract flexPollingVoting = FlexPollingVotingContract(
                    dao.getAdapterAddress(DaoHelper.FLEX_POLLING_VOTING_ADAPT)
                );
            flexPollingVoting.clearPollVoterWhiteList(dao);
            for (uint8 i = 0; i < pollvoterMembershipWhitelist.length; i++) {
                flexPollingVoting.registerPollVoterWhiteList(
                    dao,
                    pollvoterMembershipWhitelist[i]
                );
            }
        }
    }
}
