pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../helpers/DaoHelper.sol";
import "hardhat/console.sol";
import "../guards/AdapterGuard.sol";
import "../extensions/fundingpool/FundingPool.sol";
// import "../extensions/ricestaking/RiceStaking.sol";
import "../extensions/gpdao/GPDao.sol";
import "./streaming_payment/interfaces/ISablier.sol";
import "./FundingPoolAdapter.sol";
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

contract AllocationAdapterContractV2 is AdapterGuard {
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private tem;

    /*
     * STRUCTURES
     */
    struct StreamInfo {
        uint256 tokenAmount;
        bool created;
    }
    /*
     * PUBLIC VARIABLES
     */

    // bytes32 constant GPAllocationBonusRadio =
    //     keccak256("allocation.gpAllocationBonusRadio");
    // bytes32 constant RiceStakeAllocationRadio =
    //     keccak256("allocation.riceStakeAllocationRadio");

    mapping(address => mapping(bytes32 => mapping(address => StreamInfo)))
        public streamInfos;

    /*
     *EVENTS
     */
    event ConfigureDao(
        uint256 gpAllocationBonusRadio,
        uint256 riceStakeAllocationRadio
    );
    event AllocateToken(bytes32 proposalId, address proposer, address[] lps);

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
        // dao.setConfiguration(GPAllocationBonusRadio, gpAllocationBonusRadio);
        // dao.setConfiguration(
        //     RiceStakeAllocationRadio,
        //     riceStakeAllocationRadio
        // );
        // emit ConfigureDao(gpAllocationBonusRadio, riceStakeAllocationRadio);
    }

    function getFundingRewards(
        DaoRegistry dao,
        address recipient,
        uint256 tokenAmount
    ) public view returns (uint256) {
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );
        // uint256 fundingRewards = (tokenAmount *
        //     (100 -
        //         dao.getConfiguration(DaoHelper.REWARD_FOR_PROPOSER) -
        //         dao.getConfiguration(DaoHelper.REWARD_FOR_GP))) / 100;
        uint256 fundingRewards = (tokenAmount *
            (100 - dao.getConfiguration(DaoHelper.REWARD_FOR_PROPOSER))) / 100;
        uint256 totalFund = fundingpool.totalSupply();
        uint256 fund = fundingpool.balanceOf(recipient);
        if (totalFund <= 0 || fund <= 0 || fundingRewards <= 0) {
            return 0;
        }
        return (fund * fundingRewards) / totalFund;
    }

    // function getGPBonus(
    //     DaoRegistry dao,
    //     address recipient,
    //     uint256 tokenAmount
    // ) public view returns (uint256) {
    //     FundingPoolAdapterContract fundpoolAdapt = FundingPoolAdapterContract(
    //         dao.getAdapterAddress(DaoHelper.FUNDING_POOL_ADAPT)
    //     );
    //     GPDaoExtension gpdao = GPDaoExtension(
    //         dao.getExtensionAddress(DaoHelper.GPDAO_EXT)
    //     );
    //     if (!gpdao.isGeneralPartner(recipient)) {
    //         return 0;
    //     }
    //     uint256 GPBonus = (tokenAmount *
    //         dao.getConfiguration(DaoHelper.REWARD_FOR_GP)) / 100;
    //     uint256 myFund = fundpoolAdapt.balanceOf(dao, recipient);
    //     uint256 allGPFunds = fundpoolAdapt.gpBalance(dao);
    //     if (GPBonus <= 0 || myFund <= 0 || allGPFunds <= 0) {
    //         return 0;
    //     }
    //     return (GPBonus * myFund) / allGPFunds;
    // }

    function getProposerBonus(
        DaoRegistry dao,
        address proposerAddr,
        uint256 tokenAmount
    ) public view returns (uint256) {
        GPDaoExtension gpdao = GPDaoExtension(
            dao.getExtensionAddress(DaoHelper.GPDAO_EXT)
        );
        if (!gpdao.isGeneralPartner(proposerAddr)) {
            return 0;
        }
        uint256 ProposerBonus = (tokenAmount *
            dao.getConfiguration(DaoHelper.REWARD_FOR_PROPOSER)) / 100;

        return ProposerBonus;
    }

    struct allocateProjectTokenLocalVars {
        // ISablier streamingPaymentContract;
        FundingPoolExtension fundingpool;
        uint256 totalReward;
        uint256 oldAllowance;
        uint256 newAllowance;
    }

    function allocateProjectToken(
        DaoRegistry dao,
        uint256 tokenAmount,
        address tokenAddress,
        address proposerAddr,
        uint256 startTime,
        uint256 stopTime,
        bytes32 proposalId
    ) external {
        require(
            msg.sender ==
                address(
                    dao.getAdapterAddress(DaoHelper.DISTRIBUTE_FUND_ADAPTV2)
                ),
            "allocateProjectToken::access deny"
        );
        allocateProjectTokenLocalVars memory vars;

        // vars.streamingPaymentContract = ISablier(
        //     dao.getAdapterAddress(DaoHelper.STREAMING_PAYMENT_ADAPT)
        // );
        vars.fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );

        require(
            IERC20(tokenAddress).allowance(
                dao.getAdapterAddress(DaoHelper.DISTRIBUTE_FUND_ADAPTV2),
                address(this)
            ) >= tokenAmount,
            "AllocationAdapter::allocateProjectToken::insufficient allowance"
        );
        IERC20(tokenAddress).transferFrom(
            dao.getAdapterAddress(DaoHelper.DISTRIBUTE_FUND_ADAPTV2),
            address(this),
            tokenAmount
        );

        // approve from Allocation adapter contract to streaming payment contract
        vars.oldAllowance = IERC20(tokenAddress).allowance(
            address(this),
            dao.getAdapterAddress(DaoHelper.STREAMING_PAYMENT_ADAPT)
        );
        vars.newAllowance = vars.oldAllowance + tokenAmount;
        IERC20(tokenAddress).approve(
            dao.getAdapterAddress(DaoHelper.STREAMING_PAYMENT_ADAPT),
            vars.newAllowance
        );
        address[] memory allInvestors = vars.fundingpool.getInvestors();
        vars.totalReward = 0;

        if (allInvestors.length > 0) {
            for (uint8 i = 0; i < allInvestors.length; i++) {
                uint256 fundingRewards = getFundingRewards(
                    dao,
                    allInvestors[i],
                    tokenAmount
                );
                //bug fixed: fillter fundingRewards > 0 ;20220614
                if (fundingRewards > 0) {
                    // vars.streamingPaymentContract.createStream(
                    //     allInvestors[i],
                    //     fundingRewards,
                    //     tokenAddress,
                    //     startTime,
                    //     stopTime,
                    //     proposalId
                    // );
                    streamInfos[address(dao)][proposalId][
                        allInvestors[i]
                    ] = StreamInfo(fundingRewards, false);
                    vars.totalReward += fundingRewards;
                }
            }
        }

        if (proposerAddr != address(0x0)) {
            uint256 proposerBonus = getProposerBonus(
                dao,
                proposerAddr,
                tokenAmount
            );
            if (proposerBonus > 0) {
                // vars.streamingPaymentContract.createStream(
                //     proposerAddr,
                //     proposerBonus,
                //     tokenAddress,
                //     startTime,
                //     stopTime,
                //     proposalId
                // );
                streamInfos[address(dao)][proposalId][
                    proposerAddr
                ] = StreamInfo(
                    streamInfos[address(dao)][proposalId][proposerAddr]
                        .tokenAmount + proposerBonus,
                    false
                );
                vars.totalReward += proposerBonus;
            }
        }
        require(
            vars.totalReward <= tokenAmount,
            "AllocationAdapter::allocateProjectToken::distribute token amount exceeds tranding off amount"
        );
        emit AllocateToken(proposalId, proposerAddr, allInvestors);
    }

    function streamCreated(
        DaoRegistry dao,
        bytes32 proposalId,
        address recipient
    ) external returns (bool) {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.STREAMING_PAYMENT_ADAPT),
            "AllocationAdapter:streamCreated:Access deny"
        );
        streamInfos[address(dao)][proposalId][recipient].created = true;
    }

    function isStreamCreated(
        DaoRegistry dao,
        bytes32 proposalId,
        address recepient
    ) external view returns (bool) {
        return streamInfos[address(dao)][proposalId][recepient].created;
    }

    function ifEligible(
        DaoRegistry dao,
        address recipient,
        bytes32 proposalId
    ) external view returns (bool) {
        if (streamInfos[address(dao)][proposalId][recipient].tokenAmount > 0)
            return true;
        else return false;
    }
}
