pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../helpers/DaoHelper.sol";
import "hardhat/console.sol";
import "../../guards/AdapterGuard.sol";
// import "../../extensions/gpdao/GPDao.sol";
import "./FlexFundingPoolAdapter.sol";
import "../extensions/FlexFundingPool.sol";
import "./FlexFunding.sol";
import "./FlexFreeInEscrowFund.sol";
import "./FlexERC721.sol";
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

contract FlexAllocationAdapterContract is AdapterGuard {
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private tem;

    /*
     * STRUCTURES
     */
    struct VestingInfo {
        uint256 tokenAmount;
        bool created;
    }
    /*
     * PUBLIC VARIABLES
     */

    mapping(address => mapping(bytes32 => mapping(address => VestingInfo)))
        public vestingInfos;

    /*
     *EVENTS
     */
    event ConfigureDao(
        uint256 gpAllocationBonusRadio,
        uint256 riceStakeAllocationRadio
    );
    event AllocateToken(
        bytes32 proposalId,
        address daoAddr,
        address proposer,
        address[] lps
    );

    // event NoEscrow(bytes32 proposalId, address daoAddr, address[] lps);

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

    struct InvestmentRewardLocalVars {
        FlexInvestmentPoolExtension investmentpoolExt;
        FlexFundingAdapterContract flexFunding;
        FlexFreeInEscrowFundAdapterContract freeInCont;
        FlexInvestmentPoolAdapterContract fundingPoolCont;
        IFlexFunding.ProposalInvestmentInfo investmentInfo;
        uint256 totalFund;
        uint256 escrowAmount;
        uint256 fund;
        uint256 paybackTokenAmount;
        uint256 returnTokenManagementFee;
        uint256 proposerBonus;
    }

    function getInvestmentRewards(
        DaoRegistry dao,
        bytes32 proposalId,
        address investor
    ) external view returns (uint256) {
        InvestmentRewardLocalVars memory vars;
        vars.investmentpoolExt = FlexInvestmentPoolExtension(
            dao.getExtensionAddress(DaoHelper.FLEX_INVESTMENT_POOL_EXT)
        );
        vars.flexFunding = FlexFundingAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
        );
        vars.freeInCont = FlexFreeInEscrowFundAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FREE_IN_ESCROW_FUND_ADAPTER)
        );
        vars.fundingPoolCont = FlexInvestmentPoolAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_INVESTMENT_POOL_ADAPT)
        );
        uint256 executedBlockNum;
        vars.investmentInfo;

        (, vars.investmentInfo, , , , , , , executedBlockNum) = vars
            .flexFunding
            .Proposals(address(dao), proposalId);
        uint256 totalFund = vars.investmentpoolExt.getPriorAmount(
            proposalId,
            DaoHelper.TOTAL,
            executedBlockNum - 1
        ) - vars.fundingPoolCont.freeInExtraAmount(address(dao), proposalId);
        (, uint256 escrowAmount) = vars.freeInCont.getEscrowAmount(
            dao,
            proposalId,
            investor
        );
        uint256 fund = vars.investmentpoolExt.getPriorAmount(
            proposalId,
            investor,
            executedBlockNum - 1
        ) - escrowAmount;

        uint256 paybackTokenAmount = vars.investmentInfo.paybackTokenAmount;
        uint256 returnTokenManagementFee = (paybackTokenAmount *
            dao.getConfiguration(
                DaoHelper.FLEX_RETURN_TOKEN_MANAGEMENT_FEE_AMOUNT
            )) / 1e18;
        uint256 proposerBonus = getProposerBonus(
            dao,
            proposalId,
            paybackTokenAmount
        );
        paybackTokenAmount =
            paybackTokenAmount -
            returnTokenManagementFee -
            proposerBonus;
        if (totalFund <= 0 || fund <= 0 || paybackTokenAmount <= 0) {
            return 0;
        }
        return (fund * paybackTokenAmount) / totalFund;
    }

    function getProposerBonus(
        DaoRegistry dao,
        bytes32 proposalId,
        uint256 tokenAmount
    ) public view returns (uint256) {
        FlexFundingAdapterContract flexFunding = FlexFundingAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
        );

        IFlexFunding.ProposerRewardInfo memory proposerRewardInfo;
        (, , , , proposerRewardInfo, , , , ) = flexFunding.Proposals(
            address(dao),
            proposalId
        );

        uint256 ProposerBonus = (tokenAmount *
            proposerRewardInfo.tokenRewardAmount) / 1e18;

        return ProposerBonus;
    }

    struct allocateProjectTokenLocalVars {
        FlexInvestmentPoolExtension investmentpool;
        FlexERC721 flexErc721;
        uint256 totalReward;
        uint256 oldAllowance;
        uint256 newAllowance;
        uint8 i;
        uint256 investmentRewards;
        uint256 proposerBonus;
        uint256 tokenAmount;
        uint256 vestingStartTIme;
        uint256 vestingCliffDuration;
        uint256 vestingStepDuration;
        uint256 vestingSteps;
        address proposerAddr;
        address managementFeeAddr;
        uint256 bal;
        uint256 shares;
        uint256 totalFund;
        uint256 returnTokenManagementFee;
    }

    function getNoEscrowInvestmentShare(
        DaoRegistry dao,
        bytes32 proposalId,
        address account
    ) external view returns (uint256) {
        FlexFundingAdapterContract flexInvestment = FlexFundingAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
        );
        FlexInvestmentPoolExtension investmentpoolExt = FlexInvestmentPoolExtension(
                dao.getExtensionAddress(DaoHelper.FLEX_INVESTMENT_POOL_EXT)
            );
        uint256 fundingProposalExecutedBlockNum;
        (, , , , , , , , fundingProposalExecutedBlockNum) = flexInvestment
            .Proposals(address(dao), proposalId);

        uint256 fund = investmentpoolExt.getPriorAmount(
            proposalId,
            account,
            fundingProposalExecutedBlockNum - 1
        );
        uint256 totalFund = investmentpoolExt.getPriorAmount(
            proposalId,
            DaoHelper.TOTAL,
            fundingProposalExecutedBlockNum - 1
        );

        if (totalFund > 0) return ((fund * 1e18) / totalFund);
        return 0;
    }

    // uint256Args[0]: tokenAmount
    // uint256Args[0]: vestingStartTIme
    // uint256Args[0]: vestingCliffDuration
    // uint256Args[0]: vestingStepDuration
    // uint256Args[0]: vestingSteps
    function allocateProjectToken(
        DaoRegistry dao,
        address tokenAddress,
        address proposerAddr,
        bytes32 proposalId,
        uint256[5] memory uint256Args
    ) external {
        require(
            msg.sender ==
                address(dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)),
            "allocateProjectToken::access deny"
        );
        allocateProjectTokenLocalVars memory vars;

        vars.tokenAmount = uint256Args[0];
        vars.vestingStartTIme = uint256Args[1];
        vars.vestingCliffDuration = uint256Args[2];
        vars.vestingStepDuration = uint256Args[3];
        vars.vestingSteps = uint256Args[4];

        vars.investmentpool = FlexInvestmentPoolExtension(
            dao.getExtensionAddress(DaoHelper.FLEX_INVESTMENT_POOL_EXT)
        );

        require(
            IERC20(tokenAddress).allowance(
                dao.getAdapterAddress(
                    DaoHelper.FLEX_INVESTMENT_PAYBACI_TOKEN_ADAPT
                ),
                address(this)
            ) >= vars.tokenAmount,
            "AllocationAdapter::allocateProjectToken::insufficient allowance"
        );
        IERC20(tokenAddress).transferFrom(
            dao.getAdapterAddress(
                DaoHelper.FLEX_INVESTMENT_PAYBACI_TOKEN_ADAPT
            ),
            address(this),
            vars.tokenAmount
        );

        vars.returnTokenManagementFee =
            (vars.tokenAmount *
                dao.getConfiguration(
                    DaoHelper.FLEX_RETURN_TOKEN_MANAGEMENT_FEE_AMOUNT
                )) /
            1e18;
        vars.proposerBonus = getProposerBonus(
            dao,
            proposalId,
            vars.tokenAmount
        );

        if (vars.returnTokenManagementFee > 0) {
            vars.managementFeeAddr = dao.getAddressConfiguration(
                DaoHelper.FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS
            );
            vestingInfos[address(dao)][proposalId][
                vars.managementFeeAddr
            ] = VestingInfo(
                vestingInfos[address(dao)][proposalId][vars.managementFeeAddr]
                    .tokenAmount + vars.returnTokenManagementFee,
                false
            );
            vars.totalReward += vars.returnTokenManagementFee;
        }

        address[] memory allInvestors = vars
            .investmentpool
            .getInvestorsByProposalId(proposalId);
        // vars.totalReward = 0;
        // console.log("investor amount: ", allInvestors.length);
        // if (allInvestors.length > 0) {
        //     for (vars.i = 0; vars.i < allInvestors.length; vars.i++) {
        //         vars.investmentRewards = getInvestmentRewards(
        //             dao,
        //             proposalId,
        //             allInvestors[vars.i],
        //             vars.tokenAmount -
        //                 vars.returnTokenManagementFee -
        //                 vars.proposerBonus
        //         );
        //         //bug fixed: fillter fundingRewards > 0 ;20220614
        //         if (vars.investmentRewards > 0) {
        //             vestingInfos[address(dao)][proposalId][
        //                 allInvestors[vars.i]
        //             ] = VestingInfo(vars.investmentRewards, false);
        //             vars.totalReward += vars.investmentRewards;
        //         }
        //     }
        // }

        if (proposerAddr != address(0x0)) {
            if (vars.proposerBonus > 0) {
                vestingInfos[address(dao)][proposalId][
                    proposerAddr
                ] = VestingInfo(
                    vestingInfos[address(dao)][proposalId][proposerAddr]
                        .tokenAmount + vars.proposerBonus,
                    false
                );
                vars.totalReward += vars.proposerBonus;
            }
        }

        require(
            vars.totalReward <= vars.tokenAmount,
            "AllocationAdapter::allocateProjectToken::distribute token amount exceeds tranding off amount"
        );

        // approve from Allocation adapter contract to vesting contract
        vars.oldAllowance = IERC20(tokenAddress).allowance(
            address(this),
            dao.getAdapterAddress(DaoHelper.BEN_TO_BOX)
        );
        vars.newAllowance = vars.oldAllowance + vars.tokenAmount;
        IERC20(tokenAddress).approve(
            dao.getAdapterAddress(DaoHelper.BEN_TO_BOX),
            vars.newAllowance
        );

        emit AllocateToken(
            proposalId,
            address(dao),
            proposerAddr,
            allInvestors
        );
    }

    function vestCreated(
        DaoRegistry dao,
        bytes32 proposalId,
        address recipient
    ) external returns (bool) {
        require(
            msg.sender == dao.getAdapterAddress(DaoHelper.FLEX_VESTING),
            "AllocationAdapter:streamCreated:Access deny"
        );
        vestingInfos[address(dao)][proposalId][recipient].created = true;

        return true;
    }

    function nftMinted(
        DaoRegistry dao,
        bytes32 proposalId,
        address recipient
    ) external returns (bool) {
        require(
            msg.sender == dao.getAdapterAddress(DaoHelper.FLEX_ERC721_ADAPT),
            "AllocationAdapter:nftMinted:Access deny"
        );
        vestingInfos[address(dao)][proposalId][recipient].created = true;
        return true;
    }

    function isNFTMinted(
        DaoRegistry dao,
        bytes32 proposalId,
        address recepient
    ) external view returns (bool) {
        return vestingInfos[address(dao)][proposalId][recepient].created;
    }

    function isVestCreated(
        DaoRegistry dao,
        bytes32 proposalId,
        address recepient
    ) external view returns (bool) {
        return vestingInfos[address(dao)][proposalId][recepient].created;
    }

    function ifEligible(
        DaoRegistry dao,
        bytes32 proposalId,
        address recipient
    ) external view returns (bool) {
        FlexInvestmentPoolExtension investmentpoolExt = FlexInvestmentPoolExtension(
                dao.getExtensionAddress(DaoHelper.FLEX_INVESTMENT_POOL_EXT)
            );
        FlexFundingAdapterContract flexFunding = FlexFundingAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
        );
        FlexFreeInEscrowFundAdapterContract freeInCont = FlexFreeInEscrowFundAdapterContract(
                dao.getAdapterAddress(
                    DaoHelper.FLEX_FREE_IN_ESCROW_FUND_ADAPTER
                )
            );
        // uint256 executedBlockNum;

        (
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            IFlexFunding.ProposalStatus state,
            uint256 executeBlockNum
        ) = flexFunding.Proposals(address(dao), proposalId);
        // console.log("executeBlockNum ", executeBlockNum);
        (, uint256 escrowAmount) = freeInCont.getEscrowAmount(
            dao,
            proposalId,
            recipient
        );
        // console.log("escrowAmount ", escrowAmount);
        uint256 fund = investmentpoolExt.getPriorAmount(
            proposalId,
            recipient,
            executeBlockNum - 1
        ) - escrowAmount;
        if (
            state == IFlexFunding.ProposalStatus.DONE &&
            (fund > 0 ||
                vestingInfos[address(dao)][proposalId][recipient].tokenAmount >
                0)
        ) return true;
        else return false;
    }
}
