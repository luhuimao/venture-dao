pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "../../guards/AdapterGuard.sol";
import "hardhat/console.sol";
import "../../helpers/DaoHelper.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract CollectiveEscrowFundAdapterContract is AdapterGuard, Reimbursable {
    using SafeERC20 for IERC20;

    //dao => token => account => amount
    mapping(address => mapping(address => mapping(address => uint256)))
        public escrowFunds;
    // struct Checkpoint {
    //     // A checkpoint for marking number of votes from a given block
    //     address token;
    //     uint128 amount;
    // }

    event WithDraw(address dao, address token, address account, uint256 amount);
    event EscrowFund(
        address dao,
        address token,
        address account,
        uint256 amount
    );

    function withdraw(
        DaoRegistry dao,
        address token
    ) external reimbursable(dao) {
        uint256 escrowedAmount = escrowFunds[address(dao)][token][msg.sender];
        require(escrowedAmount > 0, "no fund to withdraw");
        uint256 exactAmount = escrowedAmount;
        if (IERC20(token).balanceOf(address(this)) < escrowedAmount) {
            exactAmount = IERC20(token).balanceOf(address(this));
        }
        IERC20(token).safeTransfer(msg.sender, exactAmount);
        escrowFunds[address(dao)][token][msg.sender] = 0;
        emit WithDraw(address(dao), token, msg.sender, exactAmount);
    }

    function escrowFundFromFundingPool(
        DaoRegistry dao,
        address token,
        address account,
        uint256 amount
    ) external {
        require(
            msg.sender ==
                dao.getAdapterAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER
                ),
            "access deny"
        );
        escrowFunds[address(dao)][token][account] += amount;

        emit EscrowFund(address(dao), token, account, amount);
    }
}
