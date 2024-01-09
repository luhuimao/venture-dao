pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT
import "../../helpers/DaoHelper.sol";

contract ColletiveExpenseProposalAdapterContract {
    function allDone(DaoRegistry dao) external view returns (bool) {
        return true;
    }
}
