pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "../extensions/fundingpool/VintageFundingPool.sol";

contract VintageDistributeAdatperContract {
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
                dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_ADAPTER),
            "!access"
        );
        VintageFundingPoolExtension fundingpoolExt = VintageFundingPoolExtension(
                dao.getExtensionAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_EXT)
            );
        distributeFundToProductTeam(fundingpoolExt, _addressArgs[0], fees[0]);
        if (fees[1] > 0)
            distributeManagementFeeToGP(dao, fundingpoolExt, fees[1]);
        if (fees[2] > 0)
            distributeProtocolFeeToDaoSquare(
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
        VintageFundingPoolExtension fundingpoolExt,
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
        VintageFundingPoolExtension fundingpoolExt,
        uint256 managementFee
    ) internal {
        fundingpoolExt.distributeFunds(
            dao.getAddressConfiguration(DaoHelper.GP_ADDRESS),
            fundingpoolExt.getFundRaisingTokenAddress(),
            managementFee
        );
    }

    function distributeProtocolFeeToDaoSquare(
        VintageFundingPoolExtension fundingpoolExt,
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
        VintageFundingPoolExtension fundingpoolExt,
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
    ) external returns (address[] memory) {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_ADAPTER),
            "!funding adapter"
        );
        VintageFundingPoolExtension fundingpoolExt = VintageFundingPoolExtension(
                dao.getExtensionAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_EXT)
            );
        return
            fundingpoolExt.subtractAllFromBalance(
                fundingpoolExt.getFundRaisingTokenAddress(),
                investmentAmount +
                    protocolFee +
                    managementFee +
                    proposerFundReward
            );
    }
}
