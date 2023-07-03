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

    //dao => fund round => account => amount
    mapping(address => mapping(uint256 => mapping(address => Checkpoint)))
        public escrowFunds;
    struct Checkpoint {
        // A checkpoint for marking number of votes from a given block
        address token;
        uint128 amount;
    }

    event WithDraw(
        address dao,
        uint256 fundRound,
        address token,
        address account,
        uint256 amount
    );
    event EscrowFund(
        address dao,
        uint256 fundRound,
        address token,
        address account,
        uint256 amount
    );

    function withDraw(
        DaoRegistry dao,
        uint256 fundRound
    ) external reimbursable(dao) {
        Checkpoint storage ck = escrowFunds[address(dao)][fundRound][
            msg.sender
        ];
        require(ck.amount > 0, "no fund to withdraw");
        uint256 exactAmount = ck.amount;
        if (IERC20(ck.token).balanceOf(address(this)) < ck.amount) {
            exactAmount = IERC20(ck.token).balanceOf(address(this));
        }
        IERC20(ck.token).safeTransfer(msg.sender, exactAmount);
        ck.amount = 0;
        emit WithDraw(
            address(dao),
            fundRound,
            ck.token,
            msg.sender,
            exactAmount
        );
    }

    function escrowFundFromFundingPool(
        DaoRegistry dao,
        uint256 fundRound,
        address token,
        address account,
        uint256 amount
    ) external {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_POOL_ADAPT),
            "access deny"
        );
        escrowFunds[address(dao)][fundRound][account].amount += uint128(amount);
        escrowFunds[address(dao)][fundRound][account].token = token;

        emit EscrowFund(address(dao), fundRound, token, account, amount);
    }

    function getEscrowAmount(
        DaoRegistry dao,
        uint256 fundRound,
        address account
    ) public view returns (address, uint256) {
        Checkpoint storage ck = escrowFunds[address(dao)][fundRound][account];
        return (ck.token, ck.amount);
    }
}
