pragma solidity ^0.8.0;
import "../../helpers/DaoHelper.sol";

// SPDX-License-Identifier: MIT

contract VintageFundingPoolAdapterHelperContract {
    function getFundRaisingMaxAmount(
        DaoRegistry dao
    ) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_RAISING_MAX);
    }

    function getMinInvestmentForLP(
        DaoRegistry dao
    ) external view returns (uint256) {
        return
            dao.getConfiguration(
                DaoHelper.FUND_RAISING_MIN_INVESTMENT_AMOUNT_OF_LP
            );
    }

    function getMaxInvestmentForLP(
        DaoRegistry dao
    ) external view returns (uint256) {
        return
            dao.getConfiguration(
                DaoHelper.FUND_RAISING_MAX_INVESTMENT_AMOUNT_OF_LP
            );
    }

    function getFundRaisingTarget(
        DaoRegistry dao
    ) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_RAISING_TARGET);
    }

    function getFundRaiseWindowOpenTime(
        DaoRegistry dao
    ) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_BEGIN);
    }

    function getFundRaiseWindowCloseTime(
        DaoRegistry dao
    ) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END);
    }

    function getFundReturnDuration(
        DaoRegistry dao
    ) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.RETURN_DURATION);
    }

    function latestRedempteTime(
        DaoRegistry dao
    ) public view returns (uint256, uint256) {
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
        // DaoHelper.RedemptionType redemptionT = DaoHelper.RedemptionType(
        //     dao.getConfiguration(DaoHelper.FUND_RAISING_REDEMPTION)
        // );
        uint256 redemptionEndTime = fundStartTime + redemptionPeriod;
        uint256 redemptionStartTime = redemptionEndTime - redemptionDuration;
        if (
            redemptionStartTime > fundEndTime ||
            redemptionEndTime - redemptionStartTime <= 0
        ) return (0, 0);
        return (redemptionStartTime, redemptionEndTime);
    }

    function getRedemptDuration(
        DaoRegistry dao
    ) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_RAISING_REDEMPTION_DURATION);
    }

    function getRedeptPeriod(DaoRegistry dao) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_RAISING_REDEMPTION_PERIOD);
    }

    function getFundStartTime(DaoRegistry dao) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_START_TIME);
    }

    function getFundEndTime(DaoRegistry dao) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_END_TIME);
    }
}
