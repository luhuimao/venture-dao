pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "../../helpers/DaoHelper.sol";
import "./FlexFunding.sol";
import "./interfaces/IFlexFunding.sol";

contract FlexFundingHelperAdapterContract {
    function getMaxFundingAmount(
        DaoRegistry dao,
        bytes32 proposalId
    ) external view returns (uint256) {
        FlexFundingAdapterContract flexFunding = FlexFundingAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
        );
        (
            ,
            IFlexFunding.ProposalFundingInfo memory fundingInfo,
            ,
            ,
            IFlexFunding.ProposerRewardInfo memory proposerRewardInfo,
            ,
            ,

        ) = flexFunding.Proposals(address(dao), proposalId);
        uint256 maxFundingAmount = 0;
        uint256 maxFundingTargetAmount = fundingInfo.maxFundingAmount;

        if (dao.getConfiguration(DaoHelper.FLEX_MANAGEMENT_FEE_TYPE) == 0)
            maxFundingAmount =
                (maxFundingTargetAmount * 1e18) /
                (1e18 -
                    dao.getConfiguration(DaoHelper.FLEX_MANAGEMENT_FEE_AMOUNT) -
                    flexFunding.protocolFee() -
                    proposerRewardInfo.cashRewardAmount);
        else {
            maxFundingAmount =
                ((maxFundingTargetAmount +
                    dao.getConfiguration(
                        DaoHelper.FLEX_MANAGEMENT_FEE_AMOUNT
                    )) * 1e18) /
                (flexFunding.protocolFee() -
                    proposerRewardInfo.cashRewardAmount);
        }
        return maxFundingAmount;
    }

    function getfundRaiseType(
        DaoRegistry dao,
        bytes32 proposalId
    ) external view returns (IFlexFunding.FundRaiseType) {
        FlexFundingAdapterContract flexFunding = FlexFundingAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
        );
        (
            ,
            ,
            ,
            IFlexFunding.FundRaiseInfo memory fundRaiseInfo,
            ,
            ,
            ,

        ) = flexFunding.Proposals(address(dao), proposalId);
        return fundRaiseInfo.fundRaiseType;
    }

    function getFundingToken(
        DaoRegistry dao,
        bytes32 proposalId
    ) external view returns (address) {
        FlexFundingAdapterContract flexFunding = FlexFundingAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
        );
        (
            ,
            IFlexFunding.ProposalFundingInfo memory fundingInfo,
            ,
            ,
            ,
            ,
            ,

        ) = flexFunding.Proposals(address(dao), proposalId);

        return fundingInfo.tokenAddress;
    }

    function getFundRaiseTimes(
        DaoRegistry dao,
        bytes32 proposalId
    ) external view returns (uint256, uint256) {
        FlexFundingAdapterContract flexFunding = FlexFundingAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
        );
        (
            ,
            ,
            ,
            IFlexFunding.FundRaiseInfo memory fundRaiseInfo,
            ,
            ,
            ,

        ) = flexFunding.Proposals(address(dao), proposalId);

        return (
            fundRaiseInfo.fundRaiseStartTime,
            fundRaiseInfo.fundRaiseEndTime
        );
    }

    function getFundingState(
        DaoRegistry dao,
        bytes32 proposalId
    ) external view returns (IFlexFunding.ProposalStatus) {
        FlexFundingAdapterContract flexFunding = FlexFundingAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
        );
        (, , , , , , , IFlexFunding.ProposalStatus state) = flexFunding
            .Proposals(address(dao), proposalId);

        return state;
    }

    function getDepositAmountLimit(
        DaoRegistry dao,
        bytes32 proposalId
    ) external view returns (uint256, uint256) {
        FlexFundingAdapterContract flexFunding = FlexFundingAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
        );
        (
            ,
            ,
            ,
            IFlexFunding.FundRaiseInfo memory fundRaiseInfo,
            ,
            ,
            ,

        ) = flexFunding.Proposals(address(dao), proposalId);

        return (fundRaiseInfo.minDepositAmount, fundRaiseInfo.maxDepositAmount);
    }
}
