pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../core/DaoRegistry.sol";
import "../extensions/fundingpool/FundingPool.sol";
import "../extensions/gpdao/GPDao.sol";
import "../extensions/bank/Bank.sol";
import "../guards/AdapterGuard.sol";
import "../guards/MemberGuard.sol";
import "../adapters/interfaces/IVoting.sol";
import "../helpers/DaoHelper.sol";
import "./modifiers/Reimbursable.sol";
import "./voting/GPVoting.sol";
import "./DistributeFund.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
MIT License

Copyright (c) 2020 Openlaw

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

contract FundingPoolAdapterContract is AdapterGuard, MemberGuard, Reimbursable {
    /**
     * @notice Allows the member/advisor of the DAO to withdraw the funds from their internal foundingpool account.
     * @notice Only accounts that are not reserved can withdraw the funds.
     * @notice If theres is no available balance in the user's account, the transaction is reverted.
     * @param dao The DAO address.
     * @param amount The amount to withdraw.
     */
    function withdraw(DaoRegistry dao, uint256 amount)
        external
        reimbursable(dao)
    {
        // require(
        //     DaoHelper.isNotReservedAddress(account),
        //     "withdraw::reserved address"
        // );

        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );
        address token = fundingpool.getToken(0);
        uint256 balance = fundingpool.balanceOf(msg.sender, token);
        require(balance > 0, "insufficient balance");
        require(
            amount > 0 && amount <= balance,
            "withdraw amount insufficient"
        );

        fundingpool.withdraw(msg.sender, token, amount);

        GPDaoExtension gpdaoExt = GPDaoExtension(
            dao.getExtensionAddress(DaoHelper.GPDAO_EXT)
        );
        DistributeFundContract distributeFundAda = DistributeFundContract(
            dao.getAdapterAddress(DaoHelper.DISTRIBUTE_FUND_ADAPT)
        );
        GPVotingContract gpVotingAda = GPVotingContract(
            dao.getAdapterAddress(DaoHelper.GPVOTING_ADAPT)
        );
        //check if gp
        if (gpdaoExt.isGeneralPartner(msg.sender)) {
            //update voting weight
            gpVotingAda.updateVoteWeight(
                dao,
                distributeFundAda.ongoingDistributions(address(dao)),
                msg.sender
            );
        }
    }

    /**
     * @notice Allows anyone to deposit the funds to foundingpool.
     * @notice Only accounts that are not reserved can withdraw the funds.
     * @notice If theres is no available balance in the user's account, the transaction is reverted.
     * @param dao The DAO address.
     * @param amount The amount user depoist to foundingpool.
     */
    function deposit(DaoRegistry dao, uint256 amount)
        external
        reimbursable(dao)
    {
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );
        address token = fundingpool.getToken(0);
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        IERC20(token).approve(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT),
            amount
        );
        fundingpool.addToBalance(msg.sender, token, amount);

        GPDaoExtension gpdaoExt = GPDaoExtension(
            dao.getExtensionAddress(DaoHelper.GPDAO_EXT)
        );
        DistributeFundContract distributeAda = DistributeFundContract(
            dao.getAdapterAddress(DaoHelper.DISTRIBUTE_FUND_ADAPT)
        );
        GPVotingContract gpVotingAda = GPVotingContract(
            dao.getAdapterAddress(DaoHelper.GPVOTING_ADAPT)
        );
        //check if gp
        if (
            gpdaoExt.isGeneralPartner(msg.sender) &&
            distributeAda.ongoingDistributions(address(dao)) != bytes32(0) &&
            gpVotingAda.checkIfVoted(
                dao,
                distributeAda.ongoingDistributions(address(dao)),
                msg.sender
            )
        ) {
            //update voting weight
            gpVotingAda.updateVoteWeight(
                dao,
                distributeAda.ongoingDistributions(address(dao)),
                msg.sender
            );
        }
    }

    function registerPotentialNewToken(DaoRegistry dao, address _tokenAddr)
        external
        onlyMember(dao)
        reimbursable(dao)
    {
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );
        fundingpool.registerPotentialNewToken(_tokenAddr);
    }

    // /*
    //  * @notice Allows anyone to send eth to the bank extension
    //  * @param dao The DAO address.
    //  */
    // function sendEth(DaoRegistry dao) external payable reimbursable(dao) {
    //     require(msg.value > 0, "no eth sent!");
    //     FundingPoolExtension(dao.getExtensionAddress(DaoHelper.FUNDINGPOOL))
    //         .addToBalance{value: msg.value}(
    //         DaoHelper.GUILD,
    //         DaoHelper.ETH_TOKEN,
    //         msg.value
    //     );
    // }

    function balanceOf(DaoRegistry dao, address member)
        public
        view
        returns (uint160)
    {
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );
        address tokenAddr = fundingpool.getToken(0);
        return fundingpool.balanceOf(member, tokenAddr);
    }
}
