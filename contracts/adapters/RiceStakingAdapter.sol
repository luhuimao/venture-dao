pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../core/DaoRegistry.sol";
import "../extensions/ricestaking/RiceStaking.sol";
import "../guards/AdapterGuard.sol";
import "../guards/MemberGuard.sol";
import "../adapters/interfaces/IVoting.sol";
import "../helpers/DaoHelper.sol";
import "./modifiers/Reimbursable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
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

contract RiceStakingAdapterContract is AdapterGuard, MemberGuard, Reimbursable {
    using SafeERC20 for IERC20;
    bytes32 constant RiceTokenAddr = keccak256("rice.token.address");

    /**
     * @notice Allows the member/advisor of the DAO to withdraw the funds from their internal bank account.
     * @notice Only accounts that are not reserved can withdraw the funds.
     * @notice If theres is no available balance in the user's account, the transaction is reverted.
     * @param dao The DAO address.
     * @param account The account to receive the funds.
     * @param amount The token address to receive the funds.
     */
    function withdraw(
        DaoRegistry dao,
        address account,
        uint256 amount,
        address riceAddr
    ) external reimbursable(dao) {
        require(
            DaoHelper.isNotReservedAddress(account),
            "withdraw::reserved address"
        );
        require(amount > 0, "invalid amount");
        StakingRiceExtension riceStaking = StakingRiceExtension(
            dao.getExtensionAddress(DaoHelper.RICE_STAKING_EXT)
        );
        // address riceAddr = dao.getAddressConfiguration(RiceTokenAddr);
        // require(
        //     riceAddr != address(0x0),
        //     "rice staking::withdraw::invalid rice address"
        // );
        uint256 balance = riceStaking.balanceOf(account, riceAddr);
        require(balance > 0, "nothing to withdraw");

        riceStaking.withdraw(account, riceAddr, amount);
    }

    /**
     * @notice Allows the investors to deposit rice token.
     * @param dao The DAO address.
     * @param amount The amount to deposit.
     */
    function deposit(
        DaoRegistry dao,
        uint256 amount,
        address riceAddr
    ) external reimbursable(dao) {
        StakingRiceExtension riceStaking = StakingRiceExtension(
            dao.getExtensionAddress(DaoHelper.RICE_STAKING_EXT)
        );
        require(amount > 0, "nothing to deposit");
        // address riceAddr = dao.getAddressConfiguration(RiceTokenAddr);
        // console.log("riceAddr", riceAddr);
        // require(
        //     riceAddr != address(0x0),
        //     "rice staking::deposit::invalid rice address"
        // );
        riceStaking.addToBalance(msg.sender, riceAddr, amount);
        IERC20 erc20 = IERC20(address(riceAddr));

        erc20.safeTransferFrom(msg.sender, address(this), amount);
        erc20.safeTransfer(address(riceStaking), amount);
    }

    // /**
    //  * @notice  DAOSquare members should deposit RICEs periodically as the mining reward
    //  * @param dao The DAO address.
    //  * @param amount The amount to deposit.
    //  */
    // function memberDeposit(
    //     DaoRegistry dao,
    //     uint256 amount,
    //     address riceAddr
    // ) external onlyMember(dao) reimbursable(dao) {
    //     StakingRiceExtension riceStaking = StakingRiceExtension(
    //         dao.getExtensionAddress(DaoHelper.RICE_STAKING_EXT)
    //     );
    //     require(amount > 0, "nothing to deposit");
    //     // address riceAddr = dao.getAddressConfiguration(RiceTokenAddr);
    //     // require(
    //     //     riceAddr != address(0x0),
    //     //     "rice staking::memberDeposit::invalid rice address"
    //     // );
    //     riceStaking.addToMemberBalance(riceAddr, amount);
    //     IERC20 erc20 = IERC20(riceAddr);
    //     erc20.safeTransferFrom(msg.sender, address(this), amount);
    //     erc20.safeTransfer(address(riceStaking), amount);
    // }

    // function memberWithdraw(
    //     DaoRegistry dao,
    //     uint256 amount,
    //     address riceAddr
    // ) external onlyMember(dao) reimbursable(dao) {
    //     require(amount > 0, "invalid amount");
    //     // address riceAddr = dao.getAddressConfiguration(RiceTokenAddr);
    //     // require(
    //     //     riceAddr != address(0x0),
    //     //     "rice staking::memberWithdraw::invalid rice address"
    //     // );
    //     StakingRiceExtension riceStaking = StakingRiceExtension(
    //         dao.getExtensionAddress(DaoHelper.RICE_STAKING_EXT)
    //     );

    //     uint256 balance = riceStaking.balanceOf(
    //         DaoHelper.STAKING_RICE_MEMBER,
    //         riceAddr
    //     );
    //     require(balance > 0, "nothing to withdraw");

    //     riceStaking.memberWithdraw(msg.sender, riceAddr, amount);
    // }
}
