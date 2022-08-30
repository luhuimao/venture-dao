pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../helpers/DaoHelper.sol";
import "hardhat/console.sol";
import "../guards/AdapterGuard.sol";
import "../extensions/fundingpool/FundingPool.sol";
import "../extensions/ricestaking/RiceStaking.sol";
import "../extensions/gpdao/GPDao.sol";
import "./streaming_payment/interfaces/ISablier.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
MIT License

Copyright (c) 2022 DaoSquare

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

contract AllocationAdapterContract is AdapterGuard {
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private tem;

    /*
     * STRUCTURES
     */

    /*
     * PUBLIC VARIABLES
     */
    // uint8 public gpAllocationBonusRadio = 3;
    // uint8 public riceStakeAllocationRadio = 10;

    bytes32 constant GPAllocationBonusRadio =
        keccak256("allocation.gpAllocationBonusRadio");
    bytes32 constant RiceStakeAllocationRadio =
        keccak256("allocation.riceStakeAllocationRadio");

    event ConfigureDao(
        uint256 gpAllocationBonusRadio,
        uint256 riceStakeAllocationRadio
    );

    /**
     * @notice Configures the DAO with the Voting and Gracing periods.
     * @param gpAllocationBonusRadio The gp Allocation Bonus Radio.
     * @param riceStakeAllocationRadio The rice Stake Allocation Radio.
     */
    function configureDao(
        DaoRegistry dao,
        uint256 gpAllocationBonusRadio,
        uint256 riceStakeAllocationRadio
    ) external onlyAdapter(dao) {
        dao.setConfiguration(GPAllocationBonusRadio, gpAllocationBonusRadio);
        dao.setConfiguration(
            RiceStakeAllocationRadio,
            riceStakeAllocationRadio
        );
        emit ConfigureDao(gpAllocationBonusRadio, riceStakeAllocationRadio);
    }

    function getFundingRewards(
        DaoRegistry dao,
        address recipient,
        uint256 tokenAmount
    ) public view returns (uint256) {
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );
        uint256 fundingRewards = (tokenAmount *
            (100 -
                dao.getConfiguration(GPAllocationBonusRadio) -
                dao.getConfiguration(RiceStakeAllocationRadio))) / 100;
        uint256 projectSanpFunds = fundingpool.projectSnapFunds();
        uint256 fund = fundingpool.balanceOf(recipient);
        if (projectSanpFunds <= 0 || fund <= 0 || fundingRewards <= 0) {
            return 0;
        }
        return (fund * fundingRewards) / projectSanpFunds;
    }

    function getGPBonus(
        DaoRegistry dao,
        address recipient,
        uint256 tokenAmount
    ) public view returns (uint256) {
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );

        GPDaoExtension gpdao = GPDaoExtension(
            dao.getExtensionAddress(DaoHelper.GPDAO_EXT)
        );
        if (!gpdao.isGeneralPartner(recipient)) {
            return 0;
        }
        uint256 GPBonus = (tokenAmount *
            dao.getConfiguration(GPAllocationBonusRadio)) / 100;
        uint256 myFund = fundingpool.balanceOf(recipient);
        uint256 allGPFunds;
        for (uint8 i = 0; i < gpdao.getAllGPs().length; i++) {
            if (gpdao.isGeneralPartner(gpdao.getAllGPs()[i])) {
                allGPFunds += fundingpool.balanceOf(gpdao.getAllGPs()[i]);
            }
        }
        if (GPBonus <= 0 || myFund <= 0 || allGPFunds <= 0) {
            return 0;
        }
        return (GPBonus * myFund) / allGPFunds;
    }

    function getRiceRewards(
        DaoRegistry dao,
        address recipient,
        uint256 tokenAmount
    ) public view returns (uint256) {
        StakingRiceExtension stakingRice = StakingRiceExtension(
            dao.getExtensionAddress(DaoHelper.RICE_STAKING_EXT)
        );
        uint256 riceStakingRewards = (tokenAmount *
            dao.getConfiguration(RiceStakeAllocationRadio)) / 100;
        uint256 projectSanpRice = stakingRice.getProjectSnapRice();

        address riceAddr = dao.getAddressConfiguration(
            DaoHelper.RICE_TOKEN_ADDRESS
        );
        uint256 riceBalance = stakingRice.balanceOf(recipient, riceAddr);
        if (
            projectSanpRice <= 0 || riceBalance <= 0 || riceStakingRewards <= 0
        ) {
            return 0;
        }
        return (riceBalance * riceStakingRewards) / projectSanpRice;
    }

    struct allocateProjectTokenLocalVars {
        ISablier streamingPaymentContract;
        FundingPoolExtension fundingpool;
        StakingRiceExtension ricestaking;
        GPDaoExtension gpdao;
        address[] allInvestors;
        address[] riceStakeres;
        address[] gps;
        uint256 totalReward;
        // uint256 k;
        // uint256 l;
        // uint256 m;
        // bool contained;
        // uint256 allRewards;
    }

    function allocateProjectToken(
        DaoRegistry dao,
        uint256 tokenAmount,
        address tokenAddress,
        uint256 startTime,
        uint256 stopTime
    ) external {
        require(
            msg.sender ==
                address(dao.getAdapterAddress(DaoHelper.DISTRIBUTE_FUND_ADAPT)),
            "allocateProjectToken::access deny"
        );
        allocateProjectTokenLocalVars memory vars;

        vars.streamingPaymentContract = ISablier(
            dao.getAdapterAddress(DaoHelper.STREAMING_PAYMENT_ADAPT)
        );
        vars.fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );
        vars.ricestaking = StakingRiceExtension(
            dao.getExtensionAddress(DaoHelper.RICE_STAKING_EXT)
        );
        GPDaoExtension gpdao = GPDaoExtension(
            dao.getExtensionAddress(DaoHelper.GPDAO_EXT)
        );
        require(
            IERC20(tokenAddress).transferFrom(
                dao.getAdapterAddress(DaoHelper.DISTRIBUTE_FUND_ADAPT),
                dao.getAdapterAddress(DaoHelper.ALLOCATION_ADAPT),
                tokenAmount
            ),
            "allocAdapt::allocateProjectToken::transfer failed"
        );

        // approve from Allocation adapter contract to streaming payment contract
        IERC20(tokenAddress).approve(
            dao.getAdapterAddress(DaoHelper.STREAMING_PAYMENT_ADAPT),
            tokenAmount
        );
        address[] memory allInvestors = vars.fundingpool.getInvestors();
        address[] memory riceStakeres = vars.ricestaking.getAllRiceStakers();
        address[] memory gps = gpdao.getAllGPs();
        address[] memory targetAddressArr = new address[](
            allInvestors.length + riceStakeres.length + gps.length
        );
        //Concatenate allInvestors, riceStakeres, gps Arrays
        // vars.k = 0;
        // vars.l = 0;
        // vars.m = 0;
        // for (; vars.k < allInvestors.length; vars.k++) {
        //     targetAddressArr[vars.k] = allInvestors[vars.k];
        // }

        // while (vars.l < riceStakeres.length) {
        //     vars.contained = false;
        //     for (uint8 i = 0; i < targetAddressArr.length; i++) {
        //         if (targetAddressArr[i] == riceStakeres[vars.l]) {
        //             vars.contained = true;
        //             break;
        //         }
        //     }
        //     if (!vars.contained) targetAddressArr[vars.k++] = riceStakeres[vars.l++];
        // }

        // while (vars.m < gps.length) {
        //     vars.contained = false;
        //     for (uint8 i = 0; i < targetAddressArr.length; i++) {
        //         if (targetAddressArr[i] == gps[vars.m]) {
        //             vars.contained = true;
        //             break;
        //         }
        //     }
        //     if (!vars.contained) targetAddressArr[vars.k++] = riceStakeres[vars.m++];
        // }
        vars.totalReward = 0;
        // for (uint8 i = 0; i < targetAddressArr.length; i++) {
        //     if (targetAddressArr[i] != address(0x0)) {
        //         vars.allRewards =
        //             getFundingRewards(dao, allInvestors[i], tokenAmount) +
        //             getGPBonus(dao, gps[i], tokenAmount) +
        //             getRiceRewards(dao, riceStakeres[i], tokenAmount);
        //         vars.totalReward += vars.allRewards;
        //         vars.streamingPaymentContract.createStream(
        //             targetAddressArr[i],
        //             vars.allRewards,
        //             tokenAddress,
        //             startTime,
        //             stopTime
        //         );
        //     }
        // }
        if (allInvestors.length > 0) {
            for (uint8 i = 0; i < allInvestors.length; i++) {
                uint256 fundingRewards = getFundingRewards(
                    dao,
                    allInvestors[i],
                    tokenAmount
                );
                vars.totalReward += fundingRewards;
                //bug fixed: fillter fundingRewards > 0 ;20220614
                if (fundingRewards > 0) {
                    vars.streamingPaymentContract.createStream(
                        allInvestors[i],
                        fundingRewards,
                        tokenAddress,
                        startTime,
                        stopTime
                    );
                }
            }
        }
        if (gps.length > 0) {
            for (uint8 i = 0; i < gps.length; i++) {
                uint256 gpBonus = getGPBonus(dao, gps[i], tokenAmount);
                vars.totalReward += gpBonus;
                //bug  fixed: fillter gpBonus >0;20220614
                if (gpBonus > 0) {
                    vars.streamingPaymentContract.createStream(
                        gps[i],
                        gpBonus,
                        tokenAddress,
                        startTime,
                        stopTime
                    );
                }
            }
        }
        if (riceStakeres.length > 0) {
            for (uint8 i = 0; i < riceStakeres.length; i++) {
                uint256 riceStakingRewards = getRiceRewards(
                    dao,
                    riceStakeres[i],
                    tokenAmount
                );
                vars.totalReward += riceStakingRewards;
                //bug fixed: fillter riceStakingRewards >0;20220614
                if (riceStakingRewards > 0) {
                    vars.streamingPaymentContract.createStream(
                        riceStakeres[i],
                        riceStakingRewards,
                        tokenAddress,
                        startTime,
                        stopTime
                    );
                }
            }
        }
        require(
            vars.totalReward <= tokenAmount,
            "allocateProjectToken::distribute token amount exceeds tranding off amount"
        );
    }
}
