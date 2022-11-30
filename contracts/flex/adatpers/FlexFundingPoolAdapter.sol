pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "./FlexFunding.sol";
import "../../core/DaoRegistry.sol";
import "../extensions/FlexFundingPool.sol";
import "../../guards/AdapterGuard.sol";
import "../../adapters/interfaces/IVoting.sol";
import "../../helpers/DaoHelper.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

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

contract FlexFundingPoolAdapterContract is AdapterGuard, Reimbursable {
    /**
     * @notice Allows the member/advisor of the DAO to withdraw the funds from their internal bank account.
     * @notice Only accounts that are not reserved can withdraw the funds.
     * @notice If theres is no available balance in the user's account, the transaction is reverted.
     * @param dao The DAO address.
     * @param proposalId The account to receive the funds.
     * @param account The account to receive the funds.
     */
    function withdraw(
        DaoRegistry dao,
        bytes32 proposalId,
        address payable account
    ) external reimbursable(dao) {
        require(
            DaoHelper.isNotReservedAddress(account),
            "withdraw::reserved address"
        );

        // We do not need to check if the token is supported by the bank,
        // because if it is not, the balance will always be zero.
        FlexFundingPoolExtension flexFundingPool = FlexFundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FLEX_FUNDING_POOL_EXT)
        );
        uint256 balance = flexFundingPool.balanceOf(proposalId, account);
        require(balance > 0, "nothing to withdraw");
        FlexFundingAdapterContract flexFunding = FlexFundingAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
        );
        address token = flexFunding.getTokenByProposalId(dao, proposalId);
        flexFundingPool.withdraw(proposalId, account, token, balance);
    }

    // /**
    //  * @notice Allows anyone to update the token balance in the bank extension
    //  * @notice If theres is no available balance in the user's account, the transaction is reverted.
    //  * @param dao The DAO address.
    //  * @param token The token address to update.
    //  */
    // function updateToken(DaoRegistry dao, address token)
    //     external
    //     reentrancyGuard(dao)
    // {
    //     // We do not need to check if the token is supported by the bank,
    //     // because if it is not, the balance will always be zero.
    //     BankExtension(dao.getExtensionAddress(DaoHelper.BANK)).updateToken(
    //         token
    //     );
    // }

    /*
     * @notice Allows anyone to send eth to the bank extension
     * @param dao The DAO address.
     */
    // function sendEth(DaoRegistry dao) external payable reimbursable(dao) {
    //     require(msg.value > 0, "no eth sent!");
    //     BankExtension(dao.getExtensionAddress(DaoHelper.BANK)).addToBalance{
    //         value: msg.value
    //     }(DaoHelper.GUILD, DaoHelper.ETH_TOKEN, msg.value);
    // }

    function deposit(
        DaoRegistry dao,
        bytes32 proposalId,
        uint256 amount
    ) external reimbursable(dao) {
        require(amount > 0, "no token sent!");
        FlexFundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FLEX_FUNDING_POOL_EXT)
        ).addToBalance(proposalId, msg.sender, amount);

        FlexFundingAdapterContract flexFunding = FlexFundingAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
        );
        address token = flexFunding.getTokenByProposalId(dao, proposalId);
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        IERC20(token).transferFrom(
            address(this),
            dao.getExtensionAddress(DaoHelper.FLEX_FUNDING_POOL_EXT),
            amount
        );

        // IERC20(token).approve(
        //     dao.getExtensionAddress(DaoHelper.FLEX_FUNDING_POOL_EXT),
        //     amount
        // );
    }
}
