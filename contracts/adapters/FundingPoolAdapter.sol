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
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );

        address token = fundingpool.fundRaisingTokenAddress();
        uint256 balance = balanceOf(dao, msg.sender);
        require(amount > 0, "FundingPool::withdraw::invalid amount");
        require(amount <= balance, "FundingPool::withdraw::insufficient fund");

        fundingpool.withdraw(msg.sender, amount);
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
        reimbursable(dao)
    {
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

    function processFundRaise(DaoRegistry dao) external reimbursable(dao) {
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );
        fundingpool.processFundRaising();
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

    function setRiceTokenAddress(DaoRegistry dao, address riceAddr)
        external
        onlyMember(dao)
        reimbursable(dao)
    {
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );
        fundingpool.setRiceTokenAddress(riceAddr);
    }

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
        uint256 fundDuration = fundEndTime - fundStartTime;
        if (
            fundStartTime <= 0 ||
            fundEndTime <= 0 ||
            redemptionPeriod <= 0 ||
            fundDuration <= 0
        ) return (0, 0);
        DaoHelper.RedemptionType redemptionT = DaoHelper.RedemptionType(
            dao.getConfiguration(DaoHelper.FUND_RAISING_REDEMPTION)
        );
        uint256 redemption;
        if (redemptionT == DaoHelper.RedemptionType.WEEKLY) {
            redemption = DaoHelper.ONE_WEEK;
        }
        if (redemptionT == DaoHelper.RedemptionType.BI_WEEKLY) {
            redemption = DaoHelper.TWO_WEEK;
        }
        if (redemptionT == DaoHelper.RedemptionType.MONTHLY) {
            redemption = DaoHelper.ONE_MONTH;
        }
        if (redemptionT == DaoHelper.RedemptionType.QUARTERLY) {
            redemption = DaoHelper.THREE_MONTH;
        }
        uint256 redemptionEndTime = fundStartTime + redemption;
        uint256 redemptionStartTime = redemptionEndTime - redemptionPeriod;
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
        return dao.getConfiguration(DaoHelper.FUND_RAISING_REDEMPTION_PERIOD);
    }

    function getRedemptType(DaoRegistry dao) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_RAISING_REDEMPTION);
    }
}
