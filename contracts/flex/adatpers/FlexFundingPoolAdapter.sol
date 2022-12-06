pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "./interfaces/IFlexFunding.sol";
import "./FlexFunding.sol";
import "../../core/DaoRegistry.sol";
import "../extensions/FlexFundingPool.sol";
import "../../guards/AdapterGuard.sol";
import "../../adapters/interfaces/IVoting.sol";
import "../../helpers/DaoHelper.sol";
import "../../adapters/modifiers/Reimbursable.sol";
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

contract FlexFundingPoolAdapterContract is AdapterGuard, Reimbursable {
    using SafeERC20 for IERC20;

    error FundingProposalNotFinalize();
    error NotInFundRaise();
    error ExceedMaxDepositAmount();
    error LessMinDepositAmount();
    error ExceedMaxFundingAmount();

    /**
     * @notice Allows the member/advisor of the DAO to withdraw the funds from their internal bank account.
     * @notice Only accounts that are not reserved can withdraw the funds.
     * @notice If theres is no available balance in the user's account, the transaction is reverted.
     * @param dao The DAO address.
     * @param proposalId The account to receive the funds.
     * @param amount The account to receive the funds.
     */
    function withdraw(
        DaoRegistry dao,
        bytes32 proposalId,
        uint160 amount
    ) external reimbursable(dao) {
        // require(
        //     DaoHelper.isNotReservedAddress(account),
        //     "withdraw::reserved address"
        // );

        // We do not need to check if the token is supported by the bank,
        // because if it is not, the balance will always be zero.
        FlexFundingPoolExtension flexFundingPool = FlexFundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FLEX_FUNDING_POOL_EXT)
        );
        uint256 balance = flexFundingPool.balanceOf(proposalId, msg.sender);
        require(balance > 0 && amount <= balance, "nothing to withdraw");
        FlexFundingAdapterContract flexFunding = FlexFundingAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
        );

        uint256 fundRaiseStartTime;
        uint256 fundRaiseEndTime;
        (fundRaiseStartTime, fundRaiseEndTime) = flexFunding.getFundRaiseTimes(
            dao,
            proposalId
        );
        // uint256 redemptionFee = 0;
        if (
            fundRaiseEndTime > block.timestamp ||
            ((fundRaiseEndTime < block.timestamp) &&
                flexFunding.getProposalState(dao, proposalId) ==
                IFlexFunding.ProposalStatus.FUND_RAISE_FAILED)
        ) {
            address token = flexFunding.getTokenByProposalId(dao, proposalId);
            flexFundingPool.withdraw(proposalId, msg.sender, token, amount);
        }
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

    struct DepositLocalVars {
        FlexFundingAdapterContract flexFunding;
        FlexFundingPoolExtension flexFungdingPoolExt;
        uint256 fundRaiseStartTime;
        uint256 fundRaiseEndTime;
        IFlexFunding.FundRaiseType fundRaiseType;
        uint256 minDepositAmount;
        uint256 maxDepositAmount;
        address token;
        uint256 maxFundingAmount;
    }

    function deposit(
        DaoRegistry dao,
        bytes32 proposalId,
        uint256 amount
    ) external reimbursable(dao) {
        DepositLocalVars memory vars;
        vars.flexFunding = FlexFundingAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
        );

        vars.flexFungdingPoolExt = FlexFundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FLEX_FUNDING_POOL_EXT)
        );

        if (
            vars.flexFunding.getProposalState(dao, proposalId) !=
            IFlexFunding.ProposalStatus.IN_FUND_RAISE_PROGRESS
        ) revert FundingProposalNotFinalize();

        (vars.fundRaiseStartTime, vars.fundRaiseEndTime) = vars
            .flexFunding
            .getFundRaiseTimes(dao, proposalId);
        if (
            block.timestamp < vars.fundRaiseStartTime ||
            block.timestamp > vars.fundRaiseEndTime
        ) revert NotInFundRaise();

        require(amount > 0, "no token sent!");

        vars.fundRaiseType = vars.flexFunding.getFundRaiseType(dao, proposalId);

        (vars.minDepositAmount, vars.maxDepositAmount) = vars
            .flexFunding
            .getDepositAmountLimit(dao, proposalId);
        vars.maxFundingAmount = vars.flexFunding.getMaxFundingAmount(
            dao,
            proposalId
        );
        if (vars.minDepositAmount > 0 && amount < vars.minDepositAmount)
            revert LessMinDepositAmount();
        if (
            vars.maxDepositAmount > 0 &&
            vars.flexFungdingPoolExt.balanceOf(proposalId, msg.sender) +
                amount >
            vars.maxDepositAmount
        ) revert ExceedMaxDepositAmount();
        if (
            vars.fundRaiseType == IFlexFunding.FundRaiseType.FCSF &&
            vars.maxFundingAmount > 0
        ) {
            if (
                vars.flexFungdingPoolExt.balanceOf(
                    proposalId,
                    DaoHelper.TOTAL
                ) +
                    amount >
                vars.maxFundingAmount
            ) revert ExceedMaxFundingAmount();
        }

        vars.token = vars.flexFunding.getTokenByProposalId(dao, proposalId);
        IERC20(vars.token).transferFrom(msg.sender, address(this), amount);
        IERC20(vars.token).safeTransfer(
            dao.getExtensionAddress(DaoHelper.FLEX_FUNDING_POOL_EXT),
            amount
        );

        vars.flexFungdingPoolExt.addToBalance(proposalId, msg.sender, amount);

        // IERC20(token).approve(
        //     dao.getExtensionAddress(DaoHelper.FLEX_FUNDING_POOL_EXT),
        //     amount
        // );
    }

    function balanceOf(
        DaoRegistry dao,
        bytes32 proposalId,
        address account
    ) public view returns (uint160) {
        FlexFundingPoolExtension flexFungdingPoolExt = FlexFundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FLEX_FUNDING_POOL_EXT)
        );
        return flexFungdingPoolExt.balanceOf(proposalId, msg.sender);
    }

    function getTotalFundByProposalId(DaoRegistry dao, bytes32 proposalId)
        external
        view
        returns (uint160)
    {
        FlexFundingPoolExtension flexFungdingPoolExt = FlexFundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FLEX_FUNDING_POOL_EXT)
        );
        return flexFungdingPoolExt.balanceOf(proposalId, DaoHelper.TOTAL);
    }

    function ifInRedemptionPeriod(DaoRegistry dao, uint256 timeStamp)
        public
        view
        returns (bool)
    {
        uint256 fundStartTime = dao.getConfiguration(DaoHelper.FUND_START_TIME);
        uint256 fundEndTime = dao.getConfiguration(DaoHelper.FUND_END_TIME);
        uint256 redemptionPeriod = dao.getConfiguration(
            DaoHelper.FUND_RAISING_REDEMPTION_PERIOD
        );
        uint256 redemptionDuration = dao.getConfiguration(
            DaoHelper.FUND_RAISING_REDEMPTION_DURATION
        );
        uint256 fundDuration = fundEndTime - fundStartTime;
        if (
            redemptionPeriod <= 0 ||
            redemptionDuration <= 0 ||
            fundDuration <= 0
        ) {
            return false;
        }

        uint256 steps;
        steps = fundDuration / redemptionPeriod;

        uint256 redemptionEndTime;
        uint256 redemptionStartTime;
        uint256 i = 0;
        while (i <= steps) {
            redemptionEndTime = redemptionEndTime == 0
                ? fundStartTime + redemptionPeriod
                : redemptionEndTime + redemptionPeriod;
            redemptionStartTime = redemptionEndTime - redemptionDuration;
            if (
                timeStamp > redemptionStartTime &&
                timeStamp < redemptionEndTime &&
                timeStamp > fundStartTime &&
                timeStamp < fundEndTime
            ) {
                return true;
            }
            i += 1;
        }
        return false;
    }
}
