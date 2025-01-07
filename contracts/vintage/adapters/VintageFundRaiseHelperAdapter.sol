pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "../../helpers/DaoHelper.sol";
import "./interfaces/IVintageFundRaise.sol";

contract VintageFundRaiseHelperAdapterContract {
    function setFundRaiseConfiguration(
        DaoRegistry dao,
        IVintageFundRaise.ProposalDetails memory proposalInfo
    ) external {
        if (
            msg.sender !=
            dao.getAdapterAddress(DaoHelper.VINTAGE_FUND_RAISE_ADAPTER)
        ) revert IVintageFundRaise.ACCESS_DENIED();

        setFundAmount(
            dao,
            [
                proposalInfo.amountInfo.fundRaiseTarget,
                proposalInfo.amountInfo.fundRaiseMaxAmount,
                proposalInfo.amountInfo.lpMinDepositAmount,
                proposalInfo.amountInfo.lpMaxDepositAmount
            ]
        );

        setFundTimes(
            dao,
            [
                proposalInfo.timesInfo.fundRaiseStartTime,
                proposalInfo.timesInfo.fundRaiseEndTime,
                proposalInfo.timesInfo.fundTerm,
                proposalInfo.timesInfo.redemptPeriod,
                proposalInfo.timesInfo.redemptDuration,
                proposalInfo.timesInfo.refundDuration
            ]
        );

        setAddresses(
            dao,
            [
                proposalInfo.feeInfo.managementFeeAddress,
                proposalInfo.feeInfo.redemptionFeeReceiver,
                proposalInfo.acceptTokenAddr
            ]
        );

        setFeeAndReward(
            dao,
            [
                proposalInfo.feeInfo.managementFeeRatio,
                proposalInfo.feeInfo.redepmtFeeRatio,
                proposalInfo.proposerReward.fundFromInverstor,
                proposalInfo.proposerReward.projectTokenFromInvestor,
                proposalInfo.feeInfo.paybackTokenManagementFeeRatio
            ]
        );

        // set fundRaiseType
        dao.setConfiguration(
            DaoHelper.VINTAGE_FUNDRAISE_STYLE,
            proposalInfo.fundRaiseType
        );

        // set priority deposit
        if (proposalInfo.priorityDeposite.enable) {
            setPriorityDeposit(
                dao,
                proposalInfo.priorityDeposite.vtype,
                proposalInfo.priorityDeposite.token,
                proposalInfo.priorityDeposite.tokenId,
                proposalInfo.priorityDeposite.amount
            );
        }

        setInvestorCap(
            dao,
            proposalInfo.investorCap.enable,
            proposalInfo.investorCap.cap
        );
        setInvestorEligibility(
            proposalInfo.investorEligibility.enable,
            dao,
            proposalInfo.investorEligibility.name,
            proposalInfo.investorEligibility.varifyType,
            proposalInfo.investorEligibility.minAmount,
            proposalInfo.investorEligibility.tokenId,
            proposalInfo.investorEligibility.tokenAddress,
            proposalInfo.investorEligibility.whiteList
        );
    }

    function setFundAmount(
        DaoRegistry dao,
        uint256[4] memory uint256Args
    ) internal {
        //1 fundRaiseTarget
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_TARGET,
            uint256Args[0] // proposalInfo.fundRaiseTarget
        );
        //2 fundRaiseMaxAmount
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_MAX,
            uint256Args[1] //     proposalInfo.fundRaiseMaxAmount
        );

        //3 lpMinDepositAmount
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_MIN_INVESTMENT_AMOUNT_OF_LP,
            uint256Args[2] // proposalInfo.lpMinDepositAmount
        );
        //4 lpMaxDepositAmount
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_MAX_INVESTMENT_AMOUNT_OF_LP,
            uint256Args[3] //  proposalInfo.lpMaxDepositAmount
        );
    }

    function setFeeAndReward(
        DaoRegistry dao,
        uint256[5] memory uint256Args
    ) internal {
        //1 managementFeeRatio
        dao.setConfiguration(
            DaoHelper.MANAGEMENT_FEE,
            uint256Args[0] //   proposalInfo.feeInfo.managementFeeRatio
        );
        //2 redepmtFeeRatio
        dao.setConfiguration(
            DaoHelper.REDEMPTION_FEE,
            uint256Args[1] //   proposalInfo.feeInfo.redepmtFeeRatio
        );

        //3 proposer reward fund from investors
        dao.setConfiguration(
            DaoHelper.VINTAGE_PROPOSER_FUND_REWARD_RADIO,
            uint256Args[2] //   proposalInfo.proposerReward.fundFromInverstor
        );

        //4 proposer reward project token from investors
        dao.setConfiguration(
            DaoHelper.VINTAGE_PROPOSER_TOKEN_REWARD_RADIO,
            uint256Args[3] //  proposalInfo.proposerReward.projectTokenFromInvestor
        );

        //set paybackTokenManagement fee
        dao.setConfiguration(
            DaoHelper.VINTAGE_RETURN_TOKEN_MANAGEMENT_FEE_AMOUNT,
            uint256Args[4]
        );
    }

    function setAddresses(
        DaoRegistry dao,
        address[3] memory addressArgs
    ) internal {
        //16 management fee address
        dao.setAddressConfiguration(
            DaoHelper.GP_ADDRESS,
            addressArgs[0] //  proposalInfo.feeInfo.managementFeeAddress
        );
        //17 token address
        dao.setAddressConfiguration(
            DaoHelper.FUND_RAISING_CURRENCY_ADDRESS,
            addressArgs[2] //  proposalInfo.acceptTokenAddr
        );
        dao.setAddressConfiguration(
            DaoHelper.REDEMPTION_FEE_RECEIVER,
            addressArgs[1] //  proposalInfo.feeInfo.redemptionFeeReceiver
        );
    }

    function setFundTimes(
        DaoRegistry dao,
        uint256[6] memory uint256Args
    ) internal {
        //1 fundRaiseStartTime
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_WINDOW_BEGIN,
            uint256Args[0] // proposalInfo.timesInfo.fundRaiseStartTime
        );
        //2 fundRaiseEndTime
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_WINDOW_END,
            uint256Args[1] //  proposalInfo.timesInfo.fundRaiseEndTime
        );
        dao.setConfiguration(DaoHelper.FUND_TERM, uint256Args[2]);
        //3 redemptPeriod
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_REDEMPTION_PERIOD,
            uint256Args[3] //  proposalInfo.timesInfo.redemptPeriod
        );
        //6 redemptDuration
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_REDEMPTION_DURATION,
            uint256Args[4] //   proposalInfo.timesInfo.redemptDuration
        );
        //5 refundDuration
        dao.setConfiguration(
            DaoHelper.RETURN_DURATION,
            uint256Args[5] //    proposalInfo.timesInfo.refundDuration
        );
    }

    function setPriorityDeposit(
        DaoRegistry dao,
        uint8 vtype,
        address token,
        uint256 tokenId,
        uint256 amount
    ) internal {
        dao.setConfiguration(DaoHelper.VINTAGE_PRIORITY_DEPOSITE_ENABLE, 1);
        dao.setConfiguration(DaoHelper.VINTAGE_PRIORITY_DEPOSITE_TYPE, vtype);

        dao.setConfiguration(
            DaoHelper.VINTAGE_PRIORITY_DEPOSITE_TOKENID,
            tokenId
        );
        dao.setConfiguration(
            DaoHelper.VINTAGE_PRIORITY_DEPOSITE_AMOUNT,
            amount
        );
        dao.setAddressConfiguration(
            DaoHelper.VINTAGE_PRIORITY_DEPOSITE_TOKEN_ADDRESS,
            token
        );
    }

    // function setPriorityDepositeWhiteList(
    //     address dao,
    //     bytes32 proposalId,
    //     address[] calldata whitelist
    // ) internal {
    //     for (uint8 i = 0; i < whitelist.length; i++) {
    //         // if (!priorityDepositeWhiteList[dao].contains(whitelist[i])) {
    //         priorityDepositeWhiteList[dao][proposalId].add(whitelist[i]);
    //         // }
    //     }
    // }

    // function setProposalState(
    //     DaoRegistry dao,
    //     bytes32 proposalId,
    //     bool state
    // ) external {
    //     if (
    //         msg.sender !=
    //         dao.getAdapterAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_ADAPT)
    //     ) revert IVintageFundRaise.ACCESS_DENIED();

    //     if (state)
    //         Proposals[address(dao)][proposalId].state = IVintageFundRaise.ProposalState.Done;
    //     else Proposals[address(dao)][proposalId].state = IVintageFundRaise.ProposalState.Failed;
    // }

    function setInvestorCap(
        DaoRegistry dao,
        bool enable,
        uint256 cap
    ) internal {
        dao.setConfiguration(
            DaoHelper.MAX_INVESTORS_ENABLE,
            enable == true ? 1 : 0
        );
        dao.setConfiguration(DaoHelper.MAX_INVESTORS, cap);
    }

    function setInvestorEligibility(
        bool enable,
        DaoRegistry dao,
        string memory name,
        uint8 varifyType,
        uint256 minHolding,
        uint256 tokenId,
        address tokenAddress,
        address[] memory vintageDaoInvestorMembershipWhitelist
    ) internal {
        if (enable) {
            dao.setConfiguration(
                DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_ENABLE,
                1
            );
            dao.setStringConfiguration(
                DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_NAME,
                name
            );
            dao.setConfiguration(
                DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_TYPE,
                varifyType
            );
            //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS
            if (varifyType == 0 || varifyType == 1 || varifyType == 2) {
                dao.setConfiguration(
                    DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_MIN_HOLDING,
                    minHolding
                );
                dao.setAddressConfiguration(
                    DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS,
                    tokenAddress
                );
            }

            if (varifyType == 2) {
                dao.setConfiguration(
                    DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_TOKENID,
                    tokenId
                );
            }

            if (
                varifyType == 3 &&
                vintageDaoInvestorMembershipWhitelist.length > 0
            ) {
                VintageFundingPoolAdapterContract fundingPoolAdapt = VintageFundingPoolAdapterContract(
                        dao.getAdapterAddress(
                            DaoHelper.VINTAGE_INVESTMENT_POOL_ADAPT
                        )
                    );
                for (
                    uint8 i = 0;
                    i < vintageDaoInvestorMembershipWhitelist.length;
                    i++
                ) {
                    fundingPoolAdapt.registerInvestorWhiteList(
                        dao,
                        vintageDaoInvestorMembershipWhitelist[i]
                    );
                }
            }
        }
    }
}
