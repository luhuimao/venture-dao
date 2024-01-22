pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "../../helpers/DaoHelper.sol";
import "./VintageRaiserManagement.sol";

contract VintageDaoSetHelperAdapterContract {
    modifier OnlyDaoSet(DaoRegistry dao) {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.VINTAGE_DAO_SET_ADAPTER),
            "Access Denied"
        );
        _;
    }

    function setInvestorCap(
        DaoRegistry dao,
        bool enable,
        uint256 cap
    ) external OnlyDaoSet(dao) {
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
        uint256 varifyType,
        uint256 minAmount,
        uint256 tokenId,
        address tokenAddress,
        address[] calldata whitelist
    ) external OnlyDaoSet(dao) {
        dao.setConfiguration(
            DaoHelper.VINTAGE_GOVERNOR_MEMBERSHIP_ENABLE,
            enable == true ? 1 : 0
        );

        if (enable) {
            dao.setStringConfiguration(
                DaoHelper.VINTAGE_GOVERNOR_MEMBERSHIP_NAME,
                name
            );
            dao.setConfiguration(
                DaoHelper.VINTAGE_GOVERNOR_MEMBERSHIP_TYPE,
                varifyType
            );
            dao.setConfiguration(
                DaoHelper.VINTAGE_GOVERNOR_MEMBERSHIP_MIN_HOLDING,
                minAmount
            );
            dao.setAddressConfiguration(
                DaoHelper.VINTAGE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS,
                tokenAddress
            );

            dao.setConfiguration(
                DaoHelper.VINTAGE_GOVERNOR_MEMBERSHIP_TOKENID,
                tokenId
            );

            dao.setConfiguration(
                DaoHelper.VINTAGE_GOVERNOR_MEMBERSHIP_MIN_DEPOSIT,
                minAmount
            );
            uint256 len = whitelist.length;
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
        uint256 varifyType,
        uint256 minAmount,
        uint256 tokenId,
        address tokenAddress,
        address[] calldata whitelist
    ) external OnlyDaoSet(dao) {
        dao.setConfiguration(
            DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_ENABLE,
            enable == true ? 1 : 0
        );
        if (enable) {
            dao.setStringConfiguration(
                DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_NAME,
                name
            );
            dao.setConfiguration(
                DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_TYPE,
                varifyType
            );
            //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS
            dao.setConfiguration(
                DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_MIN_HOLDING,
                minAmount
            );
            dao.setAddressConfiguration(
                DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS,
                tokenAddress
            );

            dao.setConfiguration(
                DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_TOKENID,
                tokenId
            );

            uint256 len = whitelist.length;
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
                        whitelist[i]
                    );
                }
            }
        }
    }

    function setVoting(
        DaoRegistry dao,
        // uint256 votingAssetType,
        // uint256 tokenID,
        // uint256 votingWeightedType,
        // uint256 supportType,
        // uint256 quorumType,
        // uint256 quorum,
        // uint256 support,
        // uint256 votingPeriod,
        // uint256 executingPeriod,
        uint256[9] calldata uint256Params,
        address tokenAddress,
        uint256[] calldata allocs,
        address[] calldata governors
    ) external OnlyDaoSet(dao) {
        dao.setConfiguration(
            DaoHelper.VINTAGE_VOTING_ASSET_TYPE,
            uint256Params[0]
        );
        dao.setAddressConfiguration(
            DaoHelper.VINTAGE_VOTING_ASSET_TOKEN_ADDRESS,
            tokenAddress
        );
        dao.setConfiguration(
            DaoHelper.VINTAGE_VOTING_ASSET_TOKEN_ID,
            uint256Params[1]
        );
        dao.setConfiguration(
            DaoHelper.VINTAGE_VOTING_WEIGHTED_TYPE,
            uint256Params[2] // votingWeightedType
        );
        dao.setConfiguration(
            DaoHelper.VINTAGE_VOTING_SUPPORT_TYPE,
            uint256Params[3] // supportType
        );
        dao.setConfiguration(
            DaoHelper.VINTAGE_VOTING_QUORUM_TYPE,
            uint256Params[4] //quorumType
        );
        dao.setConfiguration(
            DaoHelper.QUORUM,
            uint256Params[5] //quorum
        );
        dao.setConfiguration(
            DaoHelper.SUPER_MAJORITY,
            uint256Params[6] //support
        );
        dao.setConfiguration(
            DaoHelper.VOTING_PERIOD,
            uint256Params[7] //votingPeriod
        );
        dao.setConfiguration(
            DaoHelper.PROPOSAL_EXECUTE_DURATION,
            uint256Params[8] //executingPeriod
        );

        uint256 len = governors.length;
        if (len > 0) {
            VintageRaiserAllocationAdapter raiserAlloc = VintageRaiserAllocationAdapter(
                    dao.getAdapterAddress(
                        DaoHelper.VINTAGE_GOVERNOR_ALLOCATION_ADAPTER
                    )
                );
            for (uint8 i = 0; i < len; i++) {
                raiserAlloc.setAllocation(dao, governors[i], allocs[i]);
            }
        }
    }
}
