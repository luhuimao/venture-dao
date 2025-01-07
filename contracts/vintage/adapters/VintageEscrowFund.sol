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
    // daoaddress => tokenAddress => account => fund round => amount
    mapping(address => mapping(address => mapping(address => mapping(uint256 => uint256))))
        public escrowFundsFromLiquidation;

    // daoaddress => tokenAddress => account => fund round => amount
    mapping(address => mapping(address => mapping(address => mapping(uint256 => uint256))))
        public escrowFundsFromFailedFundRaise;

    // daoaddress => tokenAddress => account => fund round => amount
    mapping(address => mapping(address => mapping(address => mapping(uint256 => uint256))))
        public escrowFundsFromOverRaised;

    event WithdrawFromLiquidation(
        address dao,
        address token,
        address account,
        uint256 amount,
        uint256 fundRound
    );

    event WithdrawFromFailedFundRaising(
        address dao,
        address token,
        address account,
        uint256 amount,
        uint256 fundRound
    );

    event WithdrawFromOverRaised(
        address dao,
        address token,
        address account,
        uint256 amount,
        uint256 fundRound
    );

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

    event EscrowFundFromLiquidation(
        address dao,
        address token,
        address account,
        uint256 amount,
        uint256 fundRound
    );

    event EscrowFundFromFailedFundRaising(
        address dao,
        address token,
        address account,
        uint256 amount,
        uint256 fundRound
    );

    event EscrowFundFromOverRaised(
        address dao,
        address token,
        address account,
        uint256 amount,
        uint256 fundRound
    );

    error ACCESS_DENIED();
    error NO_FUND_TO_WITHDRAW();

    function withdraw(
        DaoRegistry dao,
        uint256 fundRound
    ) external reimbursable(dao) {
        Checkpoint storage ck = escrowFunds[address(dao)][fundRound][
            msg.sender
        ];
        if (ck.amount <= 0) revert NO_FUND_TO_WITHDRAW();
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

    function withdrawFromLiquidation(
        DaoRegistry dao,
        address token,
        uint256 fundRound
    ) external reimbursable(dao) {
        uint256 escrowedAmount = escrowFundsFromLiquidation[address(dao)][
            token
        ][msg.sender][fundRound];

        if (escrowedAmount <= 0) revert NO_FUND_TO_WITHDRAW();
        uint256 exactAmount = escrowedAmount;
        if (IERC20(token).balanceOf(address(this)) < escrowedAmount) {
            exactAmount = IERC20(token).balanceOf(address(this));
        }
        IERC20(token).safeTransfer(msg.sender, exactAmount);
        escrowFundsFromLiquidation[address(dao)][token][msg.sender][
            fundRound
        ] = 0;
        emit WithdrawFromLiquidation(
            address(dao),
            token,
            msg.sender,
            exactAmount,
            fundRound
        );
    }

    function withdrawFromFailedFundRaising(
        DaoRegistry dao,
        address token,
        uint256 fundRound
    ) external reimbursable(dao) {
        uint256 escrowedAmount = escrowFundsFromFailedFundRaise[address(dao)][
            token
        ][msg.sender][fundRound];

        if (escrowedAmount <= 0) revert NO_FUND_TO_WITHDRAW();
        uint256 exactAmount = escrowedAmount;

        if (IERC20(token).balanceOf(address(this)) < escrowedAmount) {
            exactAmount = IERC20(token).balanceOf(address(this));
        }
        IERC20(token).safeTransfer(msg.sender, exactAmount);
        escrowFundsFromFailedFundRaise[address(dao)][token][msg.sender][
            fundRound
        ] = 0;

        emit WithdrawFromFailedFundRaising(
            address(dao),
            token,
            msg.sender,
            exactAmount,
            fundRound
        );
    }

    function withdrawFromOverRaised(
        DaoRegistry dao,
        address token,
        uint256 fundRound
    ) external reimbursable(dao) {
        uint256 escrowedAmount = escrowFundsFromOverRaised[address(dao)][token][
            msg.sender
        ][fundRound];

        if (escrowedAmount <= 0) revert NO_FUND_TO_WITHDRAW();
        uint256 exactAmount = escrowedAmount;

        if (IERC20(token).balanceOf(address(this)) < escrowedAmount) {
            exactAmount = IERC20(token).balanceOf(address(this));
        }
        IERC20(token).safeTransfer(msg.sender, exactAmount);
        escrowFundsFromOverRaised[address(dao)][token][msg.sender][
            fundRound
        ] = 0;

        emit WithdrawFromOverRaised(
            address(dao),
            token,
            msg.sender,
            exactAmount,
            fundRound
        );
    }

    function escrowFundFromFundingPool(
        DaoRegistry dao,
        uint256 fundRound,
        address token,
        address account,
        uint256 amount
    ) external {
        if (
            msg.sender !=
            dao.getAdapterAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_ADAPT)
        ) revert ACCESS_DENIED();

        escrowFunds[address(dao)][fundRound][account].amount += uint128(amount);
        escrowFunds[address(dao)][fundRound][account].token = token;

        emit EscrowFund(address(dao), fundRound, token, account, amount);
    }

    function escrowFundFromLiquidation(
        DaoRegistry dao,
        uint256 fundRound,
        address token,
        address account,
        uint256 amount
    ) external {
        if (
            msg.sender !=
            dao.getAdapterAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_ADAPT)
        ) revert ACCESS_DENIED();

        escrowFundsFromLiquidation[address(dao)][token][account][
            fundRound
        ] += amount;

        emit EscrowFundFromLiquidation(
            address(dao),
            token,
            account,
            amount,
            fundRound
        );
    }

    function escrowFundFromFailedFundRaising(
        DaoRegistry dao,
        uint256 fundRound,
        address token,
        address account,
        uint256 amount
    ) external {
        if (
            msg.sender !=
            dao.getAdapterAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_ADAPT)
        ) revert ACCESS_DENIED();

        escrowFundsFromFailedFundRaise[address(dao)][token][account][
            fundRound
        ] += amount;

        emit EscrowFundFromFailedFundRaising(
            address(dao),
            token,
            account,
            amount,
            fundRound
        );
    }

    function escrowFundFromOverRaised(
        DaoRegistry dao,
        uint256 fundRound,
        address token,
        address account,
        uint256 amount
    ) external {
        if (
            msg.sender !=
            dao.getAdapterAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_ADAPT)
        ) revert ACCESS_DENIED();

        escrowFundsFromOverRaised[address(dao)][token][account][
            fundRound
        ] += amount;

        emit EscrowFundFromOverRaised(
            address(dao),
            token,
            account,
            amount,
            fundRound
        );
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
