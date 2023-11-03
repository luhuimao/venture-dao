pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "../../helpers/DaoHelper.sol";
import "hardhat/console.sol";

contract FlexStewardAllocationAdapter {
    mapping(address => mapping(address => uint256)) allocations; // store account allocation

    function setAllocation(
        DaoRegistry dao,
        address account,
        uint256 value
    ) external {
        require(
            dao.isMember(msg.sender) ||
                msg.sender ==
                dao.getAdapterAddress(DaoHelper.FLEX_STEWARD_MANAGEMENT) ||
                msg.sender ==
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER),
            "!Access"
        );
        allocations[address(dao)][account] = value;
    }

    function getAllocation(
        address daoAddr,
        address account
    ) external view returns (uint256) {
        return allocations[daoAddr][account];
    }
}
