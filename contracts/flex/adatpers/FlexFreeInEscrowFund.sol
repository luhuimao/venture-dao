pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "hardhat/console.sol";
import "../../helpers/DaoHelper.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract FlexFreeInEscrowFundAdapterContract is Reimbursable {
    using SafeERC20 for IERC20;

    //dao => proposalId => account => amount
    mapping(address => mapping(bytes32 => mapping(address => Checkpoint)))
        public escrowFunds;
    struct Checkpoint {
        // A checkpoint for marking number of votes from a given block
        address token;
        uint128 amount;
    }

    event WithDraw(
        address dao,
        bytes32 proposalId,
        address token,
        address account,
        uint256 amount
    );
    event EscrowFund(
        address dao,
        bytes32 proposalId,
        address token,
        address account,
        uint256 amount
    );

    function withdraw(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        Checkpoint storage ck = escrowFunds[address(dao)][proposalId][
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
            proposalId,
            ck.token,
            msg.sender,
            exactAmount
        );
    }

    function escrowFundFromFundingPool(
        DaoRegistry dao,
        bytes32 proposalId,
        address token,
        address account,
        uint256 amount
    ) external {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_POOL_ADAPT),
            "!access"
        );
        escrowFunds[address(dao)][proposalId][account].amount += uint128(
            amount
        );
        escrowFunds[address(dao)][proposalId][account].token = token;

        emit EscrowFund(address(dao), proposalId, token, account, amount);
    }

    function getEscrowAmount(
        DaoRegistry dao,
        bytes32 proposalId,
        address account
    ) public view returns (address, uint256) {
        Checkpoint storage ck = escrowFunds[address(dao)][proposalId][account];
        return (ck.token, ck.amount);
    }
}
