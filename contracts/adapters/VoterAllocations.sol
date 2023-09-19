pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "../guards/MemberGuard.sol";
import "hardhat/console.sol";

contract VoterAllocationAdapter is MemberGuard {
    mapping(address => mapping(address => uint256)) allocations; // store account allocation

    function setAllocation(
        DaoRegistry dao,
        address account,
        uint256 value
    ) external onlyMember(dao) {
        allocations[address(dao)][account] = value;
    }

    function getAllocation(
        address daoAddr,
        address account
    ) external view returns (uint256) {
        return allocations[daoAddr][account];
    }
}
