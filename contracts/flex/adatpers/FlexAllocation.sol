pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../helpers/DaoHelper.sol";
import "hardhat/console.sol";
import "../../guards/AdapterGuard.sol";
// import "../../extensions/gpdao/GPDao.sol";
import "./FlexFundingPoolAdapter.sol";
import "../extensions/FlexFundingPool.sol";
import "./FlexFunding.sol";
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

    // bytes32 constant GPAllocationBonusRadio =
    //     keccak256("allocation.gpAllocationBonusRadio");
    // bytes32 constant RiceStakeAllocationRadio =
    //     keccak256("allocation.riceStakeAllocationRadio");

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
        bytes32 proposalId,
        address investor,
        uint256 tokenAmount
    ) public view returns (uint256) {
        FlexInvestmentPoolAdapterContract fundingpool = FlexInvestmentPoolAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_INVESTMENT_POOL_ADAPT)
            );

        uint256 totalFund = fundingpool.getTotalFundByProposalId(
            dao,
            proposalId
        );
        uint256 fund = fundingpool.balanceOf(dao, proposalId, investor);

        if (totalFund <= 0 || fund <= 0 || tokenAmount <= 0) {
            return 0;
        }
        return (fund * tokenAmount) / totalFund;
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
        (, , , , proposerRewardInfo, , , ) = flexFunding.Proposals(
            address(dao),
            proposalId
        );

        uint256 ProposerBonus = (tokenAmount *
            proposerRewardInfo.tokenRewardAmount) / 1e18;

        return ProposerBonus;
    }

    struct allocateProjectTokenLocalVars {
        // ISablier streamingPaymentContract;
        // IFuroVesting vestingContract;
        FlexInvestmentPoolExtension investmentpool;
        FlexERC721 flexErc721;
        uint256 totalReward;
        uint256 oldAllowance;
        uint256 newAllowance;
        uint8 i;
        uint256 fundingRewards;
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

    function noEscrow(
        DaoRegistry dao,
        bytes32 proposalId
    ) external returns (bool) {
        require(
            msg.sender ==
                address(dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)),
            "access deny"
        );
        allocateProjectTokenLocalVars memory vars;
        FlexFundingAdapterContract flexInvestment = FlexFundingAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
        );
        vars.investmentpool = FlexInvestmentPoolExtension(
            dao.getExtensionAddress(DaoHelper.FLEX_INVESTMENT_POOL_EXT)
        );
        IFlexFunding.ProposalInvestmentInfo memory investmentInfo;
        (, investmentInfo, , , , , , ) = flexInvestment.Proposals(
            address(dao),
            proposalId
        );
        vars.tokenAmount = investmentInfo.paybackTokenAmount;

        address[] memory allInvestors = vars
            .investmentpool
            .getInvestorsByProposalId(proposalId);
        vars.totalReward = 0;
        vars.totalFund = vars.investmentpool.balanceOf(
            proposalId,
            DaoHelper.TOTAL
        );
        if (allInvestors.length > 0) {
            for (vars.i = 0; vars.i < allInvestors.length; vars.i++) {
                vars.bal = vars.investmentpool.balanceOf(
                    proposalId,
                    allInvestors[vars.i]
                );
                if (vars.bal > 0) {
                    vars.shares = ((vars.bal * 1e18) / vars.totalFund);
                    vestingInfos[address(dao)][proposalId][
                        allInvestors[vars.i]
                    ] = VestingInfo(vars.shares, false);
                }
            }
        }
        return true;
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
            dao.getAdapterAddress(DaoHelper.FLEX_INVESTMENT_PAYBACI_TOKEN_ADAPT),
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
        if (allInvestors.length > 0) {
            for (vars.i = 0; vars.i < allInvestors.length; vars.i++) {
                vars.fundingRewards = getFundingRewards(
                    dao,
                    proposalId,
                    allInvestors[vars.i],
                    vars.tokenAmount -
                        vars.returnTokenManagementFee -
                        vars.proposerBonus
                );
                //bug fixed: fillter fundingRewards > 0 ;20220614
                if (vars.fundingRewards > 0) {
                    vestingInfos[address(dao)][proposalId][
                        allInvestors[vars.i]
                    ] = VestingInfo(vars.fundingRewards, false);
                    vars.totalReward += vars.fundingRewards;
                }
            }
        }

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
        if (vestingInfos[address(dao)][proposalId][recipient].tokenAmount > 0)
            return true;
        else return false;
    }
}
