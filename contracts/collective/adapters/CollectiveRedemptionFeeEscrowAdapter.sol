pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "../extensions/CollectiveFundingPool.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "hardhat/console.sol";

contract CollectiveRedemptionFeeEscrowAdapterContract {
    using EnumerableSet for EnumerableSet.UintSet;
    using SafeERC20 for IERC20;

    mapping(address => mapping(address => uint256))
        public escrowedRedemptionFees;

    mapping(address => mapping(uint256 => uint256))
        public escrowedRedemptionFeeByBlockNum;
    mapping(address => mapping(uint256 => EscrowRedemptionFee)) redemptionFeeInfo;
    mapping(address => mapping(address => mapping(address => uint256)))
        public withdrawAmount;

    mapping(address => mapping(address => EnumerableSet.UintSet)) escorwBlockNums;
    error ACCESS_DENIED();
    error WITHDRAW_ALREADY();
    error NO_FUND_WITHDRAW();

    struct EscrowRedemptionFee {
        address tokenAddr;
        uint256 amount;
    }

    event EscrowFund(address dao, address tokenAddr, uint256 amount);
    event Withdraw(address dao, address tokenAddr, uint256 amount);

    function escrowRedemptionFee(
        DaoRegistry dao,
        uint256 blockNum,
        address tokenAddr,
        uint256 amount
    ) external {
        if (
            msg.sender !=
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER)
        ) revert ACCESS_DENIED();

        redemptionFeeInfo[address(dao)][blockNum] = EscrowRedemptionFee(
            tokenAddr,
            amount
        );
        escrowedRedemptionFeeByBlockNum[address(dao)][blockNum] += amount;
        escrowedRedemptionFees[address(dao)][tokenAddr] += amount;

        if (!escorwBlockNums[address(dao)][tokenAddr].contains(blockNum))
            escorwBlockNums[address(dao)][tokenAddr].add(blockNum);

        emit EscrowFund(address(dao), tokenAddr, amount);
    }

    function withDrawRedemptionFee(
        DaoRegistry dao,
        address tokenAddr
    ) external {
        if (withdrawAmount[address(dao)][tokenAddr][msg.sender] > 0)
            revert WITHDRAW_ALREADY();
        uint256 redemptionFeeAmount = getRedemptionFeeAmount(
            dao,
            tokenAddr,
            msg.sender
        );
        if (redemptionFeeAmount <= 0) revert NO_FUND_WITHDRAW();

        IERC20(tokenAddr).safeTransfer(msg.sender, redemptionFeeAmount);

        escrowedRedemptionFees[address(dao)][tokenAddr] -= redemptionFeeAmount;
        withdrawAmount[address(dao)][tokenAddr][
            msg.sender
        ] = redemptionFeeAmount;

        emit Withdraw(address(dao), tokenAddr, redemptionFeeAmount);
    }

    function getRedemptionFeeAmount(
        DaoRegistry dao,
        address tokenAddr,
        address account
    ) public view returns (uint256) {
        CollectiveInvestmentPoolExtension fundingpool = CollectiveInvestmentPoolExtension(
                dao.getExtensionAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT
                )
            );

        uint256[] memory tem = escorwBlockNums[address(dao)][tokenAddr]
            .values();

        uint256 total = 0;

        if (tem.length > 0) {
            for (uint8 i = 0; i < tem.length; i++) {
                uint256 pa = fundingpool.getPriorAmount(
                    account,
                    tokenAddr,
                    tem[i]
                );
                uint256 paPool = fundingpool.getPriorAmount(
                    address(DaoHelper.DAOSQUARE_TREASURY),
                    tokenAddr,
                    tem[i]
                );
                uint256 redemptionFee;
                if (dao.getAllSteward().length == 1) {
                    redemptionFee = escrowedRedemptionFeeByBlockNum[
                        address(dao)
                    ][tem[i]];
                } else {
                    if (paPool > 0) {
                        redemptionFee =
                            (pa *
                                escrowedRedemptionFeeByBlockNum[address(dao)][
                                    tem[i]
                                ]) /
                            paPool;
                    }
                }
                total += redemptionFee;
            }
        }

        return total - withdrawAmount[address(dao)][tokenAddr][account];
    }

    function getBlockNumByTokenAddr(
        DaoRegistry dao,
        address tokenAddr
    ) external view returns (uint256[] memory) {
        return escorwBlockNums[address(dao)][tokenAddr].values();
    }
}
