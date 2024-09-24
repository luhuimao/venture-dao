pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

// import "../helpers/DaoHelper.sol";
import "hardhat/console.sol";
import "../../guards/AdapterGuard.sol";
import "../extensions/CollectiveFundingPool.sol";
import "./CollectiveFundingProposalAdapter.sol";
import "./CollectiveFundingPoolAdapter.sol";
import "./interfaces/ICollectiveFunding.sol";
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

contract CollectiveAllocationAdapterContract is AdapterGuard {
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

    event AllocateToken(
        address daoAddr,
        bytes32 proposalId,
        address proposer,
        address[] lps
    );

    error ACCESS_DENIED();
    error EXCEED_TOTOAL_PAYBACK_AMOUNT();
    error INSUFFICIENT_ALLOWANCE();

    function getInvestmentRewards(
        DaoRegistry dao,
        address recipient,
        bytes32 proposalId
    ) public view returns (uint256) {
        CollectiveInvestmentPoolExtension fundingpoolExt = CollectiveInvestmentPoolExtension(
                dao.getExtensionAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT
                )
            );
        ColletiveFundingProposalAdapterContract collectiveFundingAdapt = ColletiveFundingProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUNDING_ADAPTER)
            );
        uint256 executedBlockNum;
        ICollectiveFunding.EscrowInfo memory escrowInfo;
        ICollectiveFunding.FundingInfo memory fundingInfo;
        address proposer;
        (
            fundingInfo,
            escrowInfo,
            ,
            ,
            proposer,
            executedBlockNum,

        ) = collectiveFundingAdapt.proposals(address(dao), proposalId);
        if (executedBlockNum <= 0) return 0;

        uint256 totalFund = fundingpoolExt.getPriorAmount(
            DaoHelper.DAOSQUARE_TREASURY,
            fundingInfo.token,
            executedBlockNum - 1
        );
        uint256 fund = fundingpoolExt.getPriorAmount(
            recipient,
            fundingInfo.token,
            executedBlockNum - 1
        );

        uint256 returnTokenManagementFee = (escrowInfo.paybackAmount *
            dao.getConfiguration(
                DaoHelper.COLLECTIVE_PAYBACK_TOKEN_MANAGEMENT_FEE_AMOUNT
            )) / 1e18;
        uint256 proposerBonus = getProposerBonus(
            dao,
            proposer,
            escrowInfo.paybackAmount
        );
        if (
            escrowInfo.paybackAmount < returnTokenManagementFee ||
            ((escrowInfo.paybackAmount - returnTokenManagementFee) <
                proposerBonus)
        ) return 0;

        uint256 paybackTokenAmount = escrowInfo.paybackAmount -
            returnTokenManagementFee -
            proposerBonus;

        if (totalFund <= 0 || fund <= 0 || paybackTokenAmount <= 0) {
            return 0;
        }

        return (fund * paybackTokenAmount) / totalFund;
    }

    function getProposerBonus(
        DaoRegistry dao,
        address proposerAddr,
        uint256 tokenAmount
    ) public view returns (uint256) {
        // if (!dao.isMember(proposerAddr)) {
        //     return 0;
        // }
        uint256 ProposerBonus = (tokenAmount *
            dao.getConfiguration(
                DaoHelper.COLLECTIVE_PROPOSER_PAYBACK_TOKEN_REWARD_AMOUNT
            )) / PERCENTAGE_PRECISION;

        return ProposerBonus;
    }

    struct allocateProjectTokenLocalVars {
        // ISablier streamingPaymentContract;
        // IFuroVesting vestingContract;
        CollectiveInvestmentPoolExtension fundingpool;
        ColletiveFundingPoolAdapterContract fundingPoolAdapt;
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
        if (
            msg.sender !=
            address(dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUNDING_ADAPTER))
        ) revert ACCESS_DENIED();
        allocateProjectTokenLocalVars memory vars;

        vars.tokenAmount = uint256Args[0];
        vars.vestingStartTIme = uint256Args[1];
        vars.vetingEndTime = uint256Args[2];
        vars.vestingCliffEndTime = uint256Args[3];
        vars.vestingCliffLockAmount = uint256Args[4];
        vars.vestingInterval = uint256Args[5];

        vars.fundingpool = CollectiveInvestmentPoolExtension(
            dao.getExtensionAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT)
        );

        if (
            IERC20(tokenAddress).allowance(
                dao.getAdapterAddress(
                    DaoHelper.COLLECTIVE_PAYBACK_TOKEN_ADAPTER
                ),
                address(this)
            ) < vars.tokenAmount
        ) revert INSUFFICIENT_ALLOWANCE();

        IERC20(tokenAddress).transferFrom(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_PAYBACK_TOKEN_ADAPTER),
            address(this),
            vars.tokenAmount
        );

        vars.returnTokenManagementFee =
            (vars.tokenAmount *
                dao.getConfiguration(
                    DaoHelper.COLLECTIVE_PAYBACK_TOKEN_MANAGEMENT_FEE_AMOUNT
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
        vars.fundingPoolAdapt = ColletiveFundingPoolAdapterContract(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER)
        );
        address[] memory allInvestors = vars.fundingPoolAdapt.getAllInvestors(
            dao
        );

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
        if (vars.totalReward > vars.tokenAmount)
            revert EXCEED_TOTOAL_PAYBACK_AMOUNT();

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
        if (
            msg.sender !=
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_VESTING_ADAPTER)
        ) revert ACCESS_DENIED();
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
        CollectiveInvestmentPoolExtension collectiveFundingPoolExt = CollectiveInvestmentPoolExtension(
                dao.getExtensionAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT
                )
            );
        ColletiveFundingProposalAdapterContract collectiveFundingAdapt = ColletiveFundingProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUNDING_ADAPTER)
            );
        uint256 executedBlockNum;
        ICollectiveFunding.FundingInfo memory fundingInfo;

        (fundingInfo, , , , , executedBlockNum, ) = collectiveFundingAdapt
            .proposals(address(dao), proposalId);

        uint256 fund = collectiveFundingPoolExt.getPriorAmount(
            recipient,
            fundingInfo.token,
            executedBlockNum - 1
        );
        if (
            fund > 0 ||
            vestingInfos[address(dao)][proposalId][recipient].tokenAmount > 0
        ) return true;
        else return false;
    }
}
