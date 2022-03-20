pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../core/DaoRegistry.sol";
import "../extensions/fundingpool/FundingPool.sol";
import "../extensions/bank/Bank.sol";
import "../guards/AdapterGuard.sol";
import "../adapters/interfaces/IVoting.sol";
import "../helpers/DaoHelper.sol";
import "./modifiers/Reimbursable.sol";
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

contract FundingPoolAdapterContract is AdapterGuard, Reimbursable {
    /**
     * @notice Allows the member/advisor of the DAO to withdraw the funds from their internal foundingpool account.
     * @notice Only accounts that are not reserved can withdraw the funds.
     * @notice If theres is no available balance in the user's account, the transaction is reverted.
     * @param dao The DAO address.
     * @param account The account to receive the funds.
     * @param token The token address to receive the funds.
     */
    function withdraw(
        DaoRegistry dao,
        address payable account,
        address token,
        uint256 amount
    ) external reimbursable(dao) {
        require(
            DaoHelper.isNotReservedAddress(account),
            "withdraw::reserved address"
        );

        // We do not need to check if the token is supported by the bank,
        // because if it is not, the balance will always be zero.
        // BankExtension bank = BankExtension(
        //     dao.getExtensionAddress(DaoHelper.BANK)
        // );
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL)
        );
        uint256 balance = fundingpool.balanceOf(account, token);
        require(balance > 0, "nothing to withdraw");
        require(
            amount > 0 && amount <= balance,
            "withdraw amount insufficient"
        );

        fundingpool.withdraw(account, token, amount);
    }

    /**
     * @notice Allows anyone to deposit the funds to foundingpool.
     * @notice Only accounts that are not reserved can withdraw the funds.
     * @notice If theres is no available balance in the user's account, the transaction is reverted.
     * @param dao The DAO address.
     * @param amount The amount user depoist to foundingpool.
     * @param token The token address to depoist the funds.
     */
    function deposit(
        DaoRegistry dao,
        address investor,
        uint256 amount,
        address token
    ) external reimbursable(dao) {
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL)
        );
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        IERC20(token).approve(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL),
            amount
        );
        fundingpool.addToBalance(investor, token, amount);

        // if (
        //     fundingpool.balanceOf(investor, token) > fundingpool.minFundsForGP()
        // ) {
        //     DaoHelper.potentialNewMember(
        //         investor,
        //         dao,
        //         BankExtension(address(0x0))
        //     );
        // }
    }

    /**
     * @notice Allows anyone to update the token balance in the bank extension
     * @notice If theres is no available balance in the user's account, the transaction is reverted.
     * @param dao The DAO address.
     * @param token The token address to update.
     */
    function updateToken(DaoRegistry dao, address token)
        external
        reentrancyGuard(dao)
    {
        // We do not need to check if the token is supported by the bank,
        // because if it is not, the balance will always be zero.
        FundingPoolExtension(dao.getExtensionAddress(DaoHelper.FUNDINGPOOL))
            .updateToken(token);
    }

    /*
     * @notice Allows anyone to send eth to the bank extension
     * @param dao The DAO address.
     */
    function sendEth(DaoRegistry dao) external payable reimbursable(dao) {
        require(msg.value > 0, "no eth sent!");
        FundingPoolExtension(dao.getExtensionAddress(DaoHelper.FUNDINGPOOL))
            .addToBalance{value: msg.value}(
            DaoHelper.GUILD,
            DaoHelper.ETH_TOKEN,
            msg.value
        );
    }

    function balanceOf(
        DaoRegistry dao,
        address member,
        address tokenAddr
    ) public view returns (uint160) {
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL)
        );

        return fundingpool.balanceOf(member, tokenAddr);
    }
}
