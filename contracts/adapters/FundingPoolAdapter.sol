pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../core/DaoRegistry.sol";
import "../extensions/fundingpool/FundingPool.sol";
import "../extensions/gpdao/GPDao.sol";
import "../extensions/bank/Bank.sol";
import "../guards/AdapterGuard.sol";
import "../guards/MemberGuard.sol";
import "../adapters/interfaces/IGPVoting.sol";
import "../helpers/DaoHelper.sol";
import "./modifiers/Reimbursable.sol";
import "./voting/GPVoting.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

/**
MIT License

Copyright (c) 2020 Openlaw

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

contract FundingPoolAdapterContract is AdapterGuard, MemberGuard, Reimbursable {
    /* ========== STATE VARIABLES ========== */
    DaoHelper.FundRaiseState public fundRaisingState;

    /* ========== MODIFIER ========== */
    // modifier processFundRaise(DaoRegistry dao) {
    //     uint256 fundRaiseTarget = dao.getConfiguration(
    //         DaoHelper.FUND_RAISING_TARGET
    //     );
    //     uint256 fundRaiseEndTime = dao.getConfiguration(
    //         DaoHelper.FUND_RAISING_WINDOW_END
    //     );
    //     if (
    //         block.timestamp > fundRaiseEndTime &&
    //         fundRaisingState == DaoHelper.FundRaiseState.IN_PROGRESS
    //     ) {
    //         if (lpBalance(dao) >= fundRaiseTarget)
    //             fundRaisingState = DaoHelper.FundRaiseState.DONE;
    //         else fundRaisingState = DaoHelper.FundRaiseState.FAILED;
    //     }
    //     _;
    // }

    /**
     * @notice Updates the DAO registry with the new configurations if valid.
     * @notice Updated the Bank extension with the new potential tokens if valid.
     */
    function configureDao(
        DaoRegistry dao,
        uint32 quorum,
        uint32 superMajority
    ) external onlyAdapter(dao) {
        require(
            quorum <= 100 &&
                quorum >= 1 &&
                superMajority >= 1 &&
                superMajority <= 100,
            "GPDaoOnboarding::configureDao::invalid quorum, superMajority"
        );
        dao.setConfiguration(DaoHelper.QUORUM, quorum);
        dao.setConfiguration(DaoHelper.SUPER_MAJORITY, superMajority);
    }

    /**
     * @notice Allows the member/advisor of the DAO to withdraw the funds from their internal foundingpool account.
     * @notice Only accounts that are not reserved can withdraw the funds.
     * @notice If theres is no available balance in the user's account, the transaction is reverted.
     * @param dao The DAO address.
     * @param amount The amount to withdraw.
     */
    function withdraw(DaoRegistry dao, uint256 amount)
        external
        reimbursable(dao)
    {
        processFundRaise(dao);
        require(
            fundRaisingState == DaoHelper.FundRaiseState.FAILED ||
                (fundRaisingState == DaoHelper.FundRaiseState.DONE &&
                    ifInRedemptionPeriod(dao, block.timestamp)) ||
                (fundRaisingState == DaoHelper.FundRaiseState.DONE &&
                    block.timestamp >
                    dao.getConfiguration(DaoHelper.FUND_END_TIME)),
            "FundingPoolAdapter::Withdraw::Cant withdraw at this time"
        );
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );

        address tokenAddr = fundingpool.getFundRaisingTokenAddress();
        uint256 balance = balanceOf(dao, msg.sender);
        require(amount > 0, "FundingPoolAdapter::withdraw::invalid amount");
        require(
            amount <= balance,
            "FundingPoolAdapter::withdraw::insufficient fund"
        );

        uint256 redemptionFee = 0;
        if (
            fundRaisingState == DaoHelper.FundRaiseState.DONE &&
            ifInRedemptionPeriod(dao, block.timestamp)
        ) {
            //distribute redemption fee to GP
            redemptionFee =
                (dao.getConfiguration(DaoHelper.REDEMPTION_FEE) * amount) /
                1000;
            if (redemptionFee > 0) {
                fundingpool.distributeFunds(
                    address(dao.getAddressConfiguration(DaoHelper.GP_ADDRESS)),
                    tokenAddr,
                    redemptionFee
                );
                // emit RedeptionFeeCharged(
                //     block.timestamp,
                //     recipientAddr,
                //     redemptionFee
                // );
            }
        }

        fundingpool.withdraw(msg.sender, amount - redemptionFee);

        fundingpool.subtractFromBalance(msg.sender, tokenAddr, amount);
    }

    /**
     * @notice Allows anyone to deposit the funds to foundingpool.
     * @notice Only accounts that are not reserved can withdraw the funds.
     * @notice If theres is no available balance in the user's account, the transaction is reverted.
     * @param dao The DAO address.
     * @param amount The amount user depoist to foundingpool.
     */
    function deposit(DaoRegistry dao, uint256 amount)
        external
        // reentrancyGuard(dao)
        reimbursable(dao)
    {
        require(
            amount > 0,
            "FundingPoolAdapter::Deposit:: invalid deposit amount"
        );
        require(
            dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_BEGIN) <
                block.timestamp &&
                dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END) >
                block.timestamp,
            "FundingPoolAdapter::Deposit::not in fundraise window"
        );
        uint256 maxDepositAmount = dao.getConfiguration(
            DaoHelper.FUND_RAISING_MAX_INVESTMENT_AMOUNT_OF_LP
        );
        uint256 minDepositAmount = dao.getConfiguration(
            DaoHelper.FUND_RAISING_MIN_INVESTMENT_AMOUNT_OF_LP
        );
        console.log();
        if (minDepositAmount > 0) {
            require(
                amount >= minDepositAmount,
                "FundingPoolAdapter::Deposit::deposit amount cant less than min deposit amount"
            );
        }
        if (maxDepositAmount > 0) {
            require(
                amount <= maxDepositAmount,
                "FundingPoolAdapter::Deposit::deposit amount cant greater than max deposit amount"
            );
        }
        require(
            lpBalance(dao) + amount <=
                dao.getConfiguration(DaoHelper.FUND_RAISING_MAX),
            "FundingPoolAdapter::Deposit::Fundraise max amount reach"
        );
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );
        address token = fundingpool.getFundRaisingTokenAddress();
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        IERC20(token).approve(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT),
            amount
        );
        fundingpool.addToBalance(msg.sender, amount);
    }

    function processFundRaise(DaoRegistry dao) public returns (bool) {
        uint256 fundRaiseTarget = dao.getConfiguration(
            DaoHelper.FUND_RAISING_TARGET
        );
        uint256 fundRaiseEndTime = dao.getConfiguration(
            DaoHelper.FUND_RAISING_WINDOW_END
        );
        if (
            block.timestamp > fundRaiseEndTime &&
            fundRaisingState == DaoHelper.FundRaiseState.IN_PROGRESS
        ) {
            if (lpBalance(dao) >= fundRaiseTarget)
                fundRaisingState = DaoHelper.FundRaiseState.DONE;
            else fundRaisingState = DaoHelper.FundRaiseState.FAILED;
        }
    }

    // function recoverERC20(
    //     DaoRegistry dao,
    //     address tokenAddress,
    //     uint256 tokenAmount
    // ) external onlyMember(dao) reimbursable(dao) {
    //     FundingPoolExtension fundingpool = FundingPoolExtension(
    //         dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
    //     );
    //     fundingpool.recoverERC20(tokenAddress, tokenAmount, msg.sender);
    // }

    // function setRiceTokenAddress(DaoRegistry dao, address riceAddr)
    //     external
    //     onlyMember(dao)
    //     reimbursable(dao)
    // {
    //     FundingPoolExtension fundingpool = FundingPoolExtension(
    //         dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
    //     );
    //     fundingpool.setRiceTokenAddress(riceAddr);
    // }

    function balanceOf(DaoRegistry dao, address investorAddr)
        public
        view
        returns (uint256)
    {
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );
        return fundingpool.balanceOf(investorAddr);
    }

    function lpBalance(DaoRegistry dao) public view returns (uint256) {
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );
        return fundingpool.balanceOf(address(DaoHelper.DAOSQUARE_TREASURY));
    }

    function gpBalance(DaoRegistry dao) public view returns (uint256) {
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );
        return fundingpool.balanceOf(address(DaoHelper.GP_POOL));
    }

    function getFundRaisingMaxAmount(DaoRegistry dao)
        external
        view
        returns (uint256)
    {
        return dao.getConfiguration(DaoHelper.FUND_RAISING_MAX);
    }

    function getMinInvestmentForLP(DaoRegistry dao)
        external
        view
        returns (uint256)
    {
        return
            dao.getConfiguration(
                DaoHelper.FUND_RAISING_MIN_INVESTMENT_AMOUNT_OF_LP
            );
    }

    function getMaxInvestmentForLP(DaoRegistry dao)
        external
        view
        returns (uint256)
    {
        return
            dao.getConfiguration(
                DaoHelper.FUND_RAISING_MAX_INVESTMENT_AMOUNT_OF_LP
            );
    }

    function getFundRaisingTarget(DaoRegistry dao)
        external
        view
        returns (uint256)
    {
        return dao.getConfiguration(DaoHelper.FUND_RAISING_TARGET);
    }

    function getFundRaiseWindowOpenTime(DaoRegistry dao)
        external
        view
        returns (uint256)
    {
        return dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_BEGIN);
    }

    function getFundRaiseWindowCloseTime(DaoRegistry dao)
        external
        view
        returns (uint256)
    {
        return dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END);
    }

    function getFundStartTime(DaoRegistry dao) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_START_TIME);
    }

    function getFundEndTime(DaoRegistry dao) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_END_TIME);
    }

    function latestRedempteTime(DaoRegistry dao)
        public
        view
        returns (uint256, uint256)
    {
        uint256 fundStartTime = dao.getConfiguration(DaoHelper.FUND_START_TIME);
        uint256 fundEndTime = dao.getConfiguration(DaoHelper.FUND_END_TIME);
        uint256 redemptionPeriod = dao.getConfiguration(
            DaoHelper.FUND_RAISING_REDEMPTION_PERIOD
        );
        uint256 redemptionDuration = dao.getConfiguration(
            DaoHelper.FUND_RAISING_REDEMPTION_DURATION
        );
        uint256 fundDuration = fundEndTime - fundStartTime;
        if (
            fundStartTime <= 0 ||
            fundEndTime <= 0 ||
            redemptionPeriod <= 0 ||
            redemptionDuration <= 0 ||
            fundDuration <= 0
        ) return (0, 0);
        DaoHelper.RedemptionType redemptionT = DaoHelper.RedemptionType(
            dao.getConfiguration(DaoHelper.FUND_RAISING_REDEMPTION)
        );

        uint256 redemptionEndTime = fundStartTime + redemptionPeriod;
        uint256 redemptionStartTime = redemptionEndTime - redemptionDuration;
        if (
            redemptionStartTime > fundEndTime ||
            redemptionEndTime - redemptionStartTime <= 0
        ) return (0, 0);

        return (redemptionStartTime, redemptionEndTime);
    }

    function getRedemptDuration(DaoRegistry dao)
        external
        view
        returns (uint256)
    {
        return dao.getConfiguration(DaoHelper.FUND_RAISING_REDEMPTION_DURATION);
    }

    function getRedeptPeriod(DaoRegistry dao) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_RAISING_REDEMPTION_PERIOD);
    }

    function ifInRedemptionPeriod(DaoRegistry dao, uint256 timeStamp)
        public
        view
        returns (bool)
    {
        uint256 fundStartTime = dao.getConfiguration(DaoHelper.FUND_START_TIME);
        uint256 fundEndTime = dao.getConfiguration(DaoHelper.FUND_END_TIME);
        uint256 redemptionPeriod = dao.getConfiguration(
            DaoHelper.FUND_RAISING_REDEMPTION_PERIOD
        );
        uint256 redemptionDuration = dao.getConfiguration(
            DaoHelper.FUND_RAISING_REDEMPTION_DURATION
        );
        uint256 fundDuration = fundEndTime - fundStartTime;
        if (
            redemptionPeriod <= 0 ||
            redemptionDuration <= 0 ||
            fundDuration <= 0
        ) {
            return false;
        }

        uint256 steps;
        steps = fundDuration / redemptionPeriod;

        uint256 redemptionEndTime;
        uint256 redemptionStartTime;
        uint256 i = 0;
        while (i <= steps) {
            redemptionEndTime = redemptionEndTime == 0
                ? fundStartTime + redemptionPeriod
                : redemptionEndTime + redemptionPeriod;
            redemptionStartTime = redemptionEndTime - redemptionDuration;
            if (
                timeStamp > redemptionStartTime &&
                timeStamp < redemptionEndTime &&
                timeStamp > fundStartTime &&
                timeStamp < fundEndTime
            ) {
                return true;
            }
            i += 1;
        }
        return false;
    }
}
