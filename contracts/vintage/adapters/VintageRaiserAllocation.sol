pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "../../helpers/DaoHelper.sol";
import "hardhat/console.sol";

contract VintageRaiserAllocationAdapter {
    mapping(address => mapping(address => uint256)) allocations; // store account allocation
    error ACCESS_DENIED();

    function setAllocation(
        DaoRegistry dao,
        address account,
        uint256 value
    ) external {
        if (
            !(DaoHelper.isInCreationModeAndHasAccess(dao) ||
                msg.sender ==
                dao.getAdapterAddress(
                    DaoHelper.VINTAGE_DAO_SET_HELPER_ADAPTER
                ) ||
                msg.sender ==
                dao.getAdapterAddress(DaoHelper.VINTAGE_GOVERNOR_MANAGEMENT) ||
                msg.sender ==
                dao.getAdapterAddress(
                    DaoHelper.VINTAGE_GOV_VOT_ASSET_ALLOC_ADAPTER
                ))
        ) revert ACCESS_DENIED();
        allocations[address(dao)][account] = value;
    }

    function getAllocation(
        address daoAddr,
        address account
    ) external view returns (uint256) {
        return allocations[daoAddr][account];
    }
}
