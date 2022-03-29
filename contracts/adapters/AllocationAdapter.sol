pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../helpers/DaoHelper.sol";
import "hardhat/console.sol";
import "../extensions/fundingpool/FundingPool.sol";

/**
MIT License

Copyright (c) 2020 DaoSquare

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

contract AllocationAdapterContract {
    /*
     * STRUCTURES
     */

    /*
     * PUBLIC VARIABLES
     */
    uint8 public gpAllocationBonusRadio = 3;
    uint8 public riceStakeAllocationRadio = 10;

    function getFundingRewards(
        DaoRegistry dao,
        address recipient,
        uint256 tokenAmount
    ) external view returns (uint256) {
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL)
        );
        uint256 fundingRewards = (tokenAmount *
            (100 - gpAllocationBonusRadio - riceStakeAllocationRadio)) / 100;
        uint256 projectSanpFunds = fundingpool.projectSnapFunds();
        if (projectSanpFunds == 0) {
            return 0;
        }
        uint256 fund = fundingpool.balanceOf(
            recipient,
            fundingpool.getToken(0)
        );
        return (fund * fundingRewards) / projectSanpFunds;
    }

    function getGPBonus(
        DaoRegistry dao,
        address recipient,
        uint256 tokenAmount
    ) external view returns (uint256) {
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL)
        );
        if (!fundingpool.isGeneralPartner(recipient)) {
            return 0;
        }
        uint256 GPBonus = (tokenAmount * gpAllocationBonusRadio) / 100;
        uint256 myFund = fundingpool.balanceOf(
            recipient,
            fundingpool.getToken(0)
        );
        uint256 allGPFunds = fundingpool.getAllGPFunds(fundingpool.getToken(0));
        return (GPBonus * myFund) / allGPFunds;
    }

    function getRiceRewards(address recipient)
        external
        view
        returns (uint128)
    {}
}
