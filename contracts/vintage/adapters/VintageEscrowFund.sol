pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "../../guards/AdapterGuard.sol";
import "hardhat/console.sol";
import "../../helpers/DaoHelper.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract VintageEscrowFundAdapterContract is AdapterGuard, Reimbursable {
    using SafeERC20 for IERC20;

    //dao => token => account => amount
    mapping(address => mapping(address => mapping(address => Checkpoint)))
        public escrowFunds;

    // struct EscorwAmount {
    //     address token;
    //     uint256 amount;
    // }

    struct Checkpoint {
        // A checkpoint for marking number of votes from a given block
        uint96 fromBlock;
        uint128 amount;
    }

    event WithDraw(address dao, address token, address account, uint256 amount);
    event EscrowFund(
        address dao,
        address token,
        address account,
        uint256 amount
    );

    function withDraw(
        DaoRegistry dao,
        address token
    ) external reimbursable(dao) {
        uint256 amount = escrowFunds[address(dao)][token][msg.sender].amount;
        require(amount > 0, "no fund to withdraw");
        uint256 exactAmount = amount;
        if (IERC20(token).balanceOf(address(this)) < amount) {
            exactAmount = IERC20(token).balanceOf(address(this));
        }
        IERC20(token).safeTransfer(msg.sender, exactAmount);
        escrowFunds[address(dao)][token][msg.sender].amount = 0;
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
                dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_POOL_ADAPT),
            "access deny"
        );
        escrowFunds[address(dao)][token][account].amount += uint128(amount);
        emit EscrowFund(address(dao), token, account, amount);
    }

    function getEscrowAmount(
        DaoRegistry dao,
        address token,
        address account
    ) public view returns (uint256) {
        uint256 escrowFund = escrowFunds[address(dao)][token][account].amount;
        return escrowFund;
    }
}
