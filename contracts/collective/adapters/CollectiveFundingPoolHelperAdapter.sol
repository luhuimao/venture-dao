pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "../../core/DaoRegistry.sol";
import "../extensions/CollectiveFundingPool.sol";
import "./CollectiveFundingPoolAdapter.sol";
import "./CollectiveEscrowFundAdapter.sol";
import "hardhat/console.sol";

contract ColletiveFundingPoolHelperAdapterContract {
    function poolBalance(DaoRegistry dao) public view returns (uint256) {
        CollectiveInvestmentPoolExtension fundingpool = CollectiveInvestmentPoolExtension(
                dao.getExtensionAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT
                )
            );
        return fundingpool.balanceOf(address(DaoHelper.DAOSQUARE_TREASURY));
    }

    function balanceOfToken(
        DaoRegistry dao,
        address token,
        address account
    ) public view returns (uint256) {
        CollectiveInvestmentPoolExtension fundingpool = CollectiveInvestmentPoolExtension(
                dao.getExtensionAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT
                )
            );
        return fundingpool.balanceOfToken(account, token);
    }

    function balanceOf(
        DaoRegistry dao,
        address account
    ) public view returns (uint256) {
        CollectiveInvestmentPoolExtension fundingpool = CollectiveInvestmentPoolExtension(
                dao.getExtensionAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT
                )
            );
        return fundingpool.balanceOf(account);
    }

    function getGraceWithdrawAmount(
        DaoRegistry dao,
        address account
    ) external view returns (uint256) {
        return
            ColletiveFundingPoolAdapterContract(
                dao.getAdapterAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER
                )
            ).graceWithdrawAmount(address(dao), account);
    }

    error NOT_CLEAR_FUND_TIME();
    error ACCESS_DENIED();

    struct ClearFundLocalVariable {
        CollectiveInvestmentPoolExtension fundingpool;
        ColletiveFundingPoolAdapterContract colletiveFundingPoolAdapterContract;
        ColletiveFundingPoolAdapterContract.FundState fundState;
        address tokenAddr;
        address[] allInvestors;
    }

    function clearFund(
        DaoRegistry dao
    ) external returns (uint256 totalescrwoAmount) {
        if (
            msg.sender !=
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER)
        ) revert ACCESS_DENIED();

        ClearFundLocalVariable memory vars;

        vars.fundingpool = CollectiveInvestmentPoolExtension(
            dao.getExtensionAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT)
        );

        vars
            .colletiveFundingPoolAdapterContract = ColletiveFundingPoolAdapterContract(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER)
        );

        vars.fundState = vars.colletiveFundingPoolAdapterContract.fundState(
            address(dao)
        );
        if (
            block.timestamp <
            dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END) &&
            (vars.fundState ==
                ColletiveFundingPoolAdapterContract.FundState.NOT_STARTED ||
                vars.fundState ==
                ColletiveFundingPoolAdapterContract.FundState.IN_PROGRESS)
        ) revert NOT_CLEAR_FUND_TIME();

        vars.tokenAddr = vars.fundingpool.getFundRaisingTokenAddress();
        vars.allInvestors = vars
            .colletiveFundingPoolAdapterContract
            .getAllInvestors(dao);

        if (vars.allInvestors.length > 0) {
            uint256 escrwoAmount = 0;
            // liquidationId[address(dao)] += 1;
          
            for (uint8 i = 0; i < vars.allInvestors.length; i++) {
                uint256 bal = balanceOf(dao, vars.allInvestors[i]);
                if (bal > 0) {
                    //1. escrow Fund From Funding Pool
                    CollectiveEscrowFundAdapterContract(
                        dao.getAdapterAddress(
                            DaoHelper.COLLECTIVE_ESCROW_FUND_ADAPTER
                        )
                    ).escrowFundFromLiquidation(
                            dao,
                            vars.tokenAddr,
                            vars.allInvestors[i],
                            bal,
                            vars
                                .colletiveFundingPoolAdapterContract
                                .liquidationId(address(dao))
                        );
                    //2. send fund to escrow fund contract
                    vars.fundingpool.distributeFunds(
                        dao.getAdapterAddress(
                            DaoHelper.COLLECTIVE_ESCROW_FUND_ADAPTER
                        ),
                        vars.tokenAddr,
                        bal
                    );
                    //3. subtract from funding pool
                    vars.fundingpool.subtractFromBalance(
                        vars.allInvestors[i],
                        vars.tokenAddr,
                        bal
                    );
                    escrwoAmount += bal;
                }
            }
            return escrwoAmount;
            // fundState[address(dao)] = FundState.NOT_STARTED;
            // emit ClearFund(address(dao), escrwoAmount, msg.sender);
        }
    }
}
