pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "../../helpers/DaoHelper.sol";
import "./FlexFunding.sol";
import "./interfaces/IFlexFunding.sol";

contract FlexFundingHelperAdapterContract {
    function getMaxInvestmentAmount(
        DaoRegistry dao,
        bytes32 proposalId
    ) external view returns (uint256) {
        FlexFundingAdapterContract flexInvestment = FlexFundingAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
        );
        (
            ,
            IFlexFunding.ProposalInvestmentInfo memory investmentInfo,
            ,
            ,
            IFlexFunding.ProposerRewardInfo memory proposerRewardInfo,
            ,
            ,
            ,

        ) = flexInvestment.Proposals(address(dao), proposalId);
        uint256 maxInvestmentAmount = 0;
        uint256 maxInvestmentTargetAmount = investmentInfo.maxInvestmentAmount;

        if (dao.getConfiguration(DaoHelper.FLEX_MANAGEMENT_FEE_TYPE) == 0)
            maxInvestmentAmount =
                (maxInvestmentTargetAmount * 1e18) /
                (1e18 -
                    dao.getConfiguration(DaoHelper.FLEX_MANAGEMENT_FEE_AMOUNT) -
                    flexInvestment.protocolFee() -
                    proposerRewardInfo.cashRewardAmount);
        else {
            maxInvestmentAmount =
                ((maxInvestmentTargetAmount +
                    dao.getConfiguration(
                        DaoHelper.FLEX_MANAGEMENT_FEE_AMOUNT
                    )) * 1e18) /
                (flexInvestment.protocolFee() -
                    proposerRewardInfo.cashRewardAmount);
        }
        return maxInvestmentAmount;
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
            ,

        ) = flexFunding.Proposals(address(dao), proposalId);
        return fundRaiseInfo.fundRaiseType;
    }

    function getInvestmentToken(
        DaoRegistry dao,
        bytes32 proposalId
    ) external view returns (address) {
        FlexFundingAdapterContract flexInvestment = FlexFundingAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
        );
        (
            ,
            IFlexFunding.ProposalInvestmentInfo memory investmentInfo,
            ,
            ,
            ,
            ,
            ,
            ,

        ) = flexInvestment.Proposals(address(dao), proposalId);

        return investmentInfo.tokenAddress;
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
            ,

        ) = flexFunding.Proposals(address(dao), proposalId);

        return (
            fundRaiseInfo.fundRaiseStartTime,
            fundRaiseInfo.fundRaiseEndTime
        );
    }

    function getInvestmentState(
        DaoRegistry dao,
        bytes32 proposalId
    ) external view returns (IFlexFunding.ProposalStatus) {
        FlexFundingAdapterContract flexFunding = FlexFundingAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
        );
        (, , , , , , , IFlexFunding.ProposalStatus state, ) = flexFunding
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
            ,

        ) = flexFunding.Proposals(address(dao), proposalId);

        return (fundRaiseInfo.minDepositAmount, fundRaiseInfo.maxDepositAmount);
    }

    function isPriorityDepositer(
        DaoRegistry dao,
        bytes32 proposalId,
        address account
    ) public view returns (bool) {
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
            ,

        ) = flexFunding.Proposals(address(dao), proposalId);
        if (fundRaiseInfo.priorityDepositInfo.enable == true) {
            IFlexFunding.PriorityDepositType ptype = fundRaiseInfo
                .priorityDepositInfo
                .pType;
            address token = fundRaiseInfo.priorityDepositInfo.token;
            uint256 tokenAmount = fundRaiseInfo.priorityDepositInfo.amount;
            uint256 tokenId = fundRaiseInfo.priorityDepositInfo.tokenId;
            if (
                ptype == IFlexFunding.PriorityDepositType.ERC20 &&
                IERC20(token).balanceOf(account) >= tokenAmount
            ) return true;
            else if (
                ptype == IFlexFunding.PriorityDepositType.ERC721 &&
                IERC721(token).balanceOf(account) >= tokenAmount
            ) return true;
            else if (
                ptype == IFlexFunding.PriorityDepositType.ERC1155 &&
                IERC1155(token).balanceOf(account, tokenId) >= tokenAmount
            ) return true;
            else if (
                ptype == IFlexFunding.PriorityDepositType.WHITE_LIST &&
                flexFunding.isPriorityDepositedWhitelist(
                    dao,
                    proposalId,
                    account
                )
            ) return true;
            else {
                return false;
            }
        }
        return false;
    }

    error NOT_MEET_ERC20_REQUIREMENT();
    error NOT_MEET_ERC721_REQUIREMENT();
    error NOT_MEET_ERC1155_REQUIREMENT();
    error NOT_IN_WHITELIST();

    function IsProposer(
        DaoRegistry dao,
        address account
    ) external view returns (bool) {
        if (dao.getConfiguration(DaoHelper.FLEX_PROPOSER_ENABLE) == 1) {
            //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
            if (
                dao.getConfiguration(
                    DaoHelper.FLEX_PROPOSER_IDENTIFICATION_TYPE
                ) == 0
            ) {
                if (
                    IERC20(
                        dao.getAddressConfiguration(
                            DaoHelper.FLEX_PROPOSER_TOKEN_ADDRESS
                        )
                    ).balanceOf(account) <
                    dao.getConfiguration(DaoHelper.FLEX_PROPOSER_MIN_HOLDING)
                ) revert NOT_MEET_ERC20_REQUIREMENT();
            }
            if (
                dao.getConfiguration(
                    DaoHelper.FLEX_PROPOSER_IDENTIFICATION_TYPE
                ) == 1
            ) {
                if (
                    IERC721(
                        dao.getAddressConfiguration(
                            DaoHelper.FLEX_PROPOSER_TOKEN_ADDRESS
                        )
                    ).balanceOf(account) <
                    dao.getConfiguration(DaoHelper.FLEX_PROPOSER_MIN_HOLDING)
                ) revert NOT_MEET_ERC721_REQUIREMENT();
            }
            if (
                dao.getConfiguration(
                    DaoHelper.FLEX_PROPOSER_IDENTIFICATION_TYPE
                ) == 2
            ) {
                if (
                    IERC1155(
                        dao.getAddressConfiguration(
                            DaoHelper.FLEX_PROPOSER_TOKEN_ADDRESS
                        )
                    ).balanceOf(
                            account,
                            dao.getConfiguration(
                                DaoHelper.FLEX_PROPOSER_TOKENID
                            )
                        ) <
                    dao.getConfiguration(DaoHelper.FLEX_PROPOSER_MIN_HOLDING)
                ) revert NOT_MEET_ERC1155_REQUIREMENT();
            }
            if (
                dao.getConfiguration(
                    DaoHelper.FLEX_PROPOSER_IDENTIFICATION_TYPE
                ) == 3
            ) {
                if (
                    !FlexFundingAdapterContract(
                        dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
                    ).isProposerWhiteList(dao, account)
                ) revert NOT_IN_WHITELIST();
            }
        }
        return true;
    }
}
