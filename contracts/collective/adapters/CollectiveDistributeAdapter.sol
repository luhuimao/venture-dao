pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "../extensions/CollectiveFundingPool.sol";

contract CollectiveDistributeAdatperContract {
    /*
    _addressArgs: project team,protocolfee address, proposer
    fees: requested fund amount, management fee, protocol fee, proposer reward
    **/
    function distributeFundByInvestment(
        DaoRegistry dao,
        address[3] calldata _addressArgs,
        uint256[4] calldata fees
    ) external {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUNDING_ADAPTER),
            "!access"
        );
        CollectiveInvestmentPoolExtension fundingpoolExt = CollectiveInvestmentPoolExtension(
                dao.getExtensionAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT)
            );
        distributeFundToProductTeam(fundingpoolExt, _addressArgs[0], fees[0]);
        if (fees[1] > 0)
            distributeManagementFeeToGP(dao, fundingpoolExt, fees[1]);
        if (fees[2] > 0)
            distributeProtocolFee(
                fundingpoolExt,
                _addressArgs[1],
                fees[2]
            );
        if (fees[3] > 0)
            distributeProposerFundRewardToProposer(
                fundingpoolExt,
                _addressArgs[2],
                fees[3]
            );
    }

    function distributeFundToProductTeam(
        CollectiveInvestmentPoolExtension fundingpoolExt,
        address recipientAddr,
        uint256 fundingAmount
    ) internal {
        fundingpoolExt.distributeFunds(
            recipientAddr,
            fundingpoolExt.getFundRaisingTokenAddress(),
            fundingAmount
        );
    }

    function distributeManagementFeeToGP(
        DaoRegistry dao,
        CollectiveInvestmentPoolExtension fundingpoolExt,
        uint256 managementFee
    ) internal {
        fundingpoolExt.distributeFunds(
            dao.getAddressConfiguration(DaoHelper.GP_ADDRESS),
            fundingpoolExt.getFundRaisingTokenAddress(),
            managementFee
        );
    }

    function distributeProtocolFee(
        CollectiveInvestmentPoolExtension fundingpoolExt,
        address protocolAddress,
        uint256 protocolFee
    ) internal {
        fundingpoolExt.distributeFunds(
            protocolAddress,
            fundingpoolExt.getFundRaisingTokenAddress(),
            protocolFee
        );
    }

    function distributeProposerFundRewardToProposer(
        CollectiveInvestmentPoolExtension fundingpoolExt,
        address proposer,
        uint256 proposerFundReward
    ) internal {
        fundingpoolExt.distributeFunds(
            proposer,
            fundingpoolExt.getFundRaisingTokenAddress(),
            proposerFundReward
        );
    }

    function subFromFundPool(
        DaoRegistry dao,
        uint256 investmentAmount,
        uint256 protocolFee,
        uint256 managementFee,
        uint256 proposerFundReward
    ) external {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUNDING_ADAPTER),
            "!funding adapter"
        );
        CollectiveInvestmentPoolExtension fundingpoolExt = CollectiveInvestmentPoolExtension(
                dao.getExtensionAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT)
            );
        fundingpoolExt.subtractAllFromBalance(
            fundingpoolExt.getFundRaisingTokenAddress(),
            investmentAmount + protocolFee + managementFee + proposerFundReward
        );
    }
}
