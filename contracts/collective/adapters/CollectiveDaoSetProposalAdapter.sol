pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT
import "../../core/DaoRegistry.sol";

contract ColletiveDaoSetProposalContract {
    function isProposalAllDone(DaoRegistry dao) external view returns (bool) {
        return true;
    }
}