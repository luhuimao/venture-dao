pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "../../guards/AdapterGuard.sol";
import "hardhat/console.sol";
import "../../helpers/DaoHelper.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CollectiveEscrowFundAdapterContract is AdapterGuard, Reimbursable {
    using SafeERC20 for IERC20;
    using Counters for Counters.Counter;

    //dao => token => account => amount
    mapping(address => mapping(address => mapping(address => uint256)))
        public escrowFunds;

    mapping(address => mapping(address => mapping(address => mapping(uint256 => uint256))))
        public escrowFundsFromLiquidation;

    mapping(address => mapping(address => mapping(address => mapping(uint256 => uint256))))
        public escrowFundsFromFailedFundRaise;

    mapping(address => mapping(address => mapping(address => mapping(uint256 => uint256))))
        public escrowFundsFromOverRaised;
    // struct Checkpoint {
    //     // A checkpoint for marking number of votes from a given block
    //     address token;
    //     uint128 amount;
    // }

    event WithdrawFromLiquidation(
        address dao,
        address token,
        address account,
        uint256 amount,
        uint256 liquidationId
    );

    event WithdrawFromFailedFundRaising(
        address dao,
        address token,
        address account,
        uint256 amount,
        uint256 fundRaisingId
    );

    event WithdrawFromOverRaised(
        address dao,
        address token,
        address account,
        uint256 amount,
        uint256 fundRaisingId
    );

    event EscrowFund(
        address dao,
        address token,
        address account,
        uint256 amount
    );

    event EscrowFundFromLiquidation(
        address dao,
        address token,
        address account,
        uint256 amount,
        uint256 liquidationId
    );

    event EscrowFundFromFailedFundRaising(
        address dao,
        address token,
        address account,
        uint256 amount,
        uint256 fundRaisingId
    );

    event EscrowFundFromOverRaised(
        address dao,
        address token,
        address account,
        uint256 amount,
        uint256 fundRaisingId
    );

    error ACCESS_DENIED();
    error NO_FUND_TO_WITHDRAW();

    function withdrawFromLiquidation(
        DaoRegistry dao,
        address token,
        uint256 liquidationId
    ) external reimbursable(dao) {
        uint256 escrowedAmount = escrowFundsFromLiquidation[address(dao)][
            token
        ][msg.sender][liquidationId];

        if (escrowedAmount <= 0) revert NO_FUND_TO_WITHDRAW();
        uint256 exactAmount = escrowedAmount;
        if (IERC20(token).balanceOf(address(this)) < escrowedAmount) {
            exactAmount = IERC20(token).balanceOf(address(this));
        }
        IERC20(token).safeTransfer(msg.sender, exactAmount);
        escrowFundsFromLiquidation[address(dao)][token][msg.sender][
            liquidationId
        ] = 0;
        emit WithdrawFromLiquidation(
            address(dao),
            token,
            msg.sender,
            exactAmount,
            liquidationId
        );
    }

    function withdrawFromFailedFundRaising(
        DaoRegistry dao,
        address token,
        uint256 fundRaisingId
    ) external reimbursable(dao) {
        uint256 escrowedAmount = escrowFundsFromFailedFundRaise[address(dao)][
            token
        ][msg.sender][fundRaisingId];

        if (escrowedAmount <= 0) revert NO_FUND_TO_WITHDRAW();
        uint256 exactAmount = escrowedAmount;

        if (IERC20(token).balanceOf(address(this)) < escrowedAmount) {
            exactAmount = IERC20(token).balanceOf(address(this));
        }
        IERC20(token).safeTransfer(msg.sender, exactAmount);
        escrowFundsFromFailedFundRaise[address(dao)][token][msg.sender][
            fundRaisingId
        ] = 0;

        emit WithdrawFromFailedFundRaising(
            address(dao),
            token,
            msg.sender,
            exactAmount,
            fundRaisingId
        );
    }

    function withdrawFromOverRaised(
        DaoRegistry dao,
        address token,
        uint256 fundRaisingId
    ) external reimbursable(dao) {
        uint256 escrowedAmount = escrowFundsFromOverRaised[address(dao)][token][
            msg.sender
        ][fundRaisingId];

        if (escrowedAmount <= 0) revert NO_FUND_TO_WITHDRAW();
        uint256 exactAmount = escrowedAmount;

        if (IERC20(token).balanceOf(address(this)) < escrowedAmount) {
            exactAmount = IERC20(token).balanceOf(address(this));
        }
        IERC20(token).safeTransfer(msg.sender, exactAmount);
        escrowFundsFromOverRaised[address(dao)][token][msg.sender][
            fundRaisingId
        ] = 0;

        emit WithdrawFromOverRaised(
            address(dao),
            token,
            msg.sender,
            exactAmount,
            fundRaisingId
        );
    }

    function escrowFundFromLiquidation(
        DaoRegistry dao,
        address token,
        address account,
        uint256 amount,
        uint256 liquidationId
    ) external {
        if (
            msg.sender !=
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER)
        ) revert ACCESS_DENIED();

        escrowFundsFromLiquidation[address(dao)][token][account][
            liquidationId
        ] += amount;

        emit EscrowFundFromLiquidation(
            address(dao),
            token,
            account,
            amount,
            liquidationId
        );
    }

    function escrowFundFromFailedFundRaising(
        DaoRegistry dao,
        address token,
        address account,
        uint256 amount,
        uint256 fundRaisingId
    ) external {
        if (
            msg.sender !=
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER)
        ) revert ACCESS_DENIED();

        escrowFundsFromFailedFundRaise[address(dao)][token][account][
            fundRaisingId
        ] += amount;

        emit EscrowFundFromFailedFundRaising(
            address(dao),
            token,
            account,
            amount,
            fundRaisingId
        );
    }

    function escrowFundFromOverRaised(
        DaoRegistry dao,
        address token,
        address account,
        uint256 amount,
        uint256 fundRaisingId
    ) external {
        if (
            msg.sender !=
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER)
        ) revert ACCESS_DENIED();

        escrowFundsFromOverRaised[address(dao)][token][account][
            fundRaisingId
        ] += amount;

        emit EscrowFundFromOverRaised(
            address(dao),
            token,
            account,
            amount,
            fundRaisingId
        );
    }
}
