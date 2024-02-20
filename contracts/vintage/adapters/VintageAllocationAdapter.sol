pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

// import "../helpers/DaoHelper.sol";
import "hardhat/console.sol";
import "../../guards/AdapterGuard.sol";
import "../extensions/fundingpool/VintageFundingPool.sol";
import "./VintageFundingPoolAdapter.sol";
import "./VintageFundingAdapter.sol";
import "../libraries/fundingLibrary.sol";
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

contract VintageAllocationAdapterContract is AdapterGuard {
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
    uint256 public constant PERCENTAGE_PRECISION = 1e18;

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
        address daoAddr,
        bytes32 proposalId,
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

    function getInvestmentRewards(
        DaoRegistry dao,
        address recipient,
        bytes32 proposalId
    ) external view returns (uint256) {
        VintageFundingPoolExtension fundingpoolext = VintageFundingPoolExtension(
                dao.getExtensionAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_EXT)
            );

        VintageFundingAdapterContract fundingAdapt = VintageFundingAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_ADAPTER)
            );
        uint256 blocknum = 0;
        InvestmentLibrary.ProposalPaybackTokenInfo memory paybackTokenInfo;
        address proposer;
        (, , , , , proposer, , , paybackTokenInfo, , blocknum) = fundingAdapt
            .proposals(address(dao), proposalId);
        if (blocknum == 0) return 0;

        uint256 fund = fundingpoolext.getPriorAmount(
            recipient,
            dao.getAddressConfiguration(
                DaoHelper.FUND_RAISING_CURRENCY_ADDRESS
            ),
            blocknum - 1
        );

        uint256 totalFund = fundingpoolext.getPriorAmount(
            address(DaoHelper.DAOSQUARE_TREASURY),
            dao.getAddressConfiguration(
                DaoHelper.FUND_RAISING_CURRENCY_ADDRESS
            ),
            blocknum - 1
        );
        uint256 paybackTokenForInvestors = paybackTokenInfo.paybackTokenAmount -
            (paybackTokenInfo.paybackTokenAmount *
                dao.getConfiguration(
                    DaoHelper.VINTAGE_RETURN_TOKEN_MANAGEMENT_FEE_AMOUNT
                )) /
            1e18 -
            getProposerBonus(
                dao,
                proposer,
                paybackTokenInfo.paybackTokenAmount
            );
        if (totalFund <= 0 || fund <= 0 || paybackTokenForInvestors <= 0) {
            return 0;
        }
        return (fund * paybackTokenForInvestors) / totalFund;
    }

    function getProposerBonus(
        DaoRegistry dao,
        address proposerAddr,
        uint256 tokenAmount
    ) public view returns (uint256) {
        if (!dao.isMember(proposerAddr)) {
            return 0;
        }
        uint256 ProposerBonus = (tokenAmount *
            dao.getConfiguration(
                DaoHelper.VINTAGE_PROPOSER_TOKEN_REWARD_RADIO
            )) / PERCENTAGE_PRECISION;

        return ProposerBonus;
    }

    struct allocateProjectTokenLocalVars {
        // ISablier streamingPaymentContract;
        // IFuroVesting vestingContract;
        VintageFundingPoolExtension fundingpool;
        uint256 totalReward;
        uint256 oldAllowance;
        uint256 newAllowance;
        uint8 i;
        uint256 investmentRewards;
        uint256 proposerBonus;
        uint256 tokenAmount;
        uint256 vestingStartTIme;
        uint256 vetingEndTime;
        uint256 vestingCliffEndTime;
        uint256 vestingCliffLockAmount;
        uint256 vestingInterval;
        uint256 returnTokenManagementFee;
        address managementFeeAddr;
    }

    // uint256Args[0]: tokenAmount
    // uint256Args[1]: vestingStartTIme
    // uint256Args[2]: vetingEndTime
    // uint256Args[3]: vestingCliffEndTime
    // uint256Args[4]: vestingCliffLockAmount
    // uint256Args[5]: vestingInterval
    function allocateProjectToken(
        DaoRegistry dao,
        address tokenAddress,
        address proposerAddr,
        bytes32 proposalId,
        uint256[6] memory uint256Args
    ) external {
        require(
            msg.sender ==
                address(
                    dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_ADAPTER)
                ),
            "allocateProjectToken::access deny"
        );
        allocateProjectTokenLocalVars memory vars;

        vars.tokenAmount = uint256Args[0];
        vars.vestingStartTIme = uint256Args[1];
        vars.vetingEndTime = uint256Args[2];
        vars.vestingCliffEndTime = uint256Args[3];
        vars.vestingCliffLockAmount = uint256Args[4];
        vars.vestingInterval = uint256Args[5];

        vars.fundingpool = VintageFundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_EXT)
        );

        require(
            IERC20(tokenAddress).allowance(
                dao.getAdapterAddress(
                    DaoHelper.VINTAGE_INVESTMENT_PAYBACK_TOKEN_ADAPTER
                ),
                address(this)
            ) >= vars.tokenAmount,
            "AllocationAdapter::allocateProjectToken::insufficient allowance"
        );
        IERC20(tokenAddress).transferFrom(
            dao.getAdapterAddress(
                DaoHelper.VINTAGE_INVESTMENT_PAYBACK_TOKEN_ADAPTER
            ),
            address(this),
            vars.tokenAmount
        );

        vars.returnTokenManagementFee =
            (vars.tokenAmount *
                dao.getConfiguration(
                    DaoHelper.VINTAGE_RETURN_TOKEN_MANAGEMENT_FEE_AMOUNT
                )) /
            1e18;
        vars.proposerBonus = getProposerBonus(
            dao,
            proposerAddr,
            vars.tokenAmount
        );

        if (vars.returnTokenManagementFee > 0) {
            vars.managementFeeAddr = dao.getAddressConfiguration(
                DaoHelper.GP_ADDRESS
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
        address[] memory allInvestors = vars.fundingpool.getInvestors();

        // if (allInvestors.length > 0) {
        //     for (vars.i = 0; vars.i < allInvestors.length; vars.i++) {
        //         vars.investmentRewards = getInvestmentRewards(
        //             dao,
        //             allInvestors[vars.i],
        //             vars.tokenAmount -
        //                 vars.returnTokenManagementFee -
        //                 vars.proposerBonus
        //         );
        //         //bug fixed: fillter investmentRewards > 0 ;20220614
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
            "AllocationAdapter::allocateProjectToken::distribute token amount exceeds return token amount"
        );
        emit AllocateToken(
            address(dao),
            proposalId,
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
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.VINTAGE_VESTING_ADAPTER),
            "AllocationAdapter:streamCreated:Access deny"
        );
        vestingInfos[address(dao)][proposalId][recipient].created = true;

        return true;
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
        address recipient,
        bytes32 proposalId
    ) external view returns (bool) {
        VintageFundingAdapterContract fundingAdapt = VintageFundingAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_ADAPTER)
            );
        uint256 blocknum = 0;
        (, , , , , , , , , , blocknum) = fundingAdapt.proposals(
            address(dao),
            proposalId
        );
        VintageFundingPoolExtension fundingpoolext = VintageFundingPoolExtension(
                dao.getExtensionAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_EXT)
            );
        uint256 bal = fundingpoolext.getPriorAmount(
            recipient,
            dao.getAddressConfiguration(
                DaoHelper.FUND_RAISING_CURRENCY_ADDRESS
            ),
            blocknum - 1
        );
        if (
            vestingInfos[address(dao)][proposalId][recipient].tokenAmount > 0 ||
            bal > 0
        ) return true;
        else return false;
    }
}
