pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "./interfaces/IFlexFunding.sol";
import "./FlexFunding.sol";
import "./FlexFundingHelper.sol";
import "./FlexFreeInEscrowFund.sol";
import "../../core/DaoRegistry.sol";
import "../extensions/FlexFundingPool.sol";
import "../../guards/AdapterGuard.sol";
import "../../guards/MemberGuard.sol";
import "../../guards/FlexParticipantGuard.sol";
import "../../helpers/DaoHelper.sol";
import "../../utils/TypeConver.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

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

contract FlexInvestmentPoolAdapterContract is
    AdapterGuard,
    MemberGuard,
    FlexInvestorGuard,
    Reimbursable
{
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    error FundingProposalNotFinalize();
    error NotInFundRaise();
    error ExceedMaxDepositAmount();
    error LessMinDepositAmount();
    error ExceedMaxFundingAmount();
    error MaxInvestorReach();

    mapping(address => mapping(bytes32 => EnumerableSet.AddressSet)) investorWhiteList;
    mapping(address => mapping(bytes32 => InvestorMembershipInfo))
        public investorMemberShips;
    mapping(address => EnumerableSet.AddressSet) priorityDepositWhitelist;
    mapping(address => mapping(bytes32 => uint256))
        public freeINPriorityDeposits;
    struct InvestorMembershipInfo {
        bool created;
        uint8 varifyType;
        uint256 minHolding;
        address tokenAddress;
        uint256 tokenId;
    }

    event Deposit(
        address daoAddress,
        bytes32 proposalId,
        uint256 amount,
        address account
    );
    event WithDraw(
        address daoAddress,
        bytes32 proposalId,
        uint256 amount,
        address account
    );

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
        // We do not need to check if the token is supported by the bank,
        // because if it is not, the balance will always be zero.
        FlexInvestmentPoolExtension flexInvestmentPool = FlexInvestmentPoolExtension(
            dao.getExtensionAddress(DaoHelper.FLEX_INVESTMENT_POOL_EXT)
        );
        uint256 balance = flexInvestmentPool.balanceOf(proposalId, msg.sender);
        require(balance > 0 && amount <= balance, "!amount");
        FlexFundingAdapterContract flexInvestment = FlexFundingAdapterContract(
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
            IFlexFunding.ProposalStatus state
        ) = flexInvestment.Proposals(address(dao), proposalId);
        require(
            fundRaiseInfo.fundRaiseEndTime > block.timestamp ||
                ((fundRaiseInfo.fundRaiseEndTime < block.timestamp) &&
                    state == IFlexFunding.ProposalStatus.FAILED),
            "!withdraw"
        );
        (
            ,
            IFlexFunding.ProposalInvestmentInfo memory investmentInfo,
            ,
            ,
            ,
            ,
            ,

        ) = flexInvestment.Proposals(address(dao), proposalId);
        flexInvestmentPool.withdraw(
            proposalId,
            msg.sender,
            investmentInfo.tokenAddress,
            amount
        );

        if (flexInvestment.isPriorityDepositer(dao, proposalId, msg.sender))
            freeINPriorityDeposits[address(dao)][proposalId] -= amount;

        emit WithDraw(address(dao), proposalId, amount, msg.sender);
    }

    function createInvestorMembership(
        DaoRegistry dao,
        string calldata name,
        uint8 varifyType,
        uint256 minHolding,
        address tokenAddress,
        uint256 tokenId
    ) external {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER) ||
                dao.isMember(msg.sender),
            "!access"
        );
        bytes32 hashedName = TypeConver.bytesToBytes32(abi.encodePacked(name));
        require(
            !investorMemberShips[address(dao)][hashedName].created,
            string(
                abi.encodePacked(
                    "name ",
                    name,
                    " Investor Membership name already taken"
                )
            )
        );
        investorMemberShips[address(dao)][
            hashedName
        ] = InvestorMembershipInfo(
            true,
            varifyType,
            minHolding,
            tokenAddress,
            tokenId
        );
    }

    function registerInvestorWhiteList(
        DaoRegistry dao,
        string calldata name,
        address account
    ) external {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER) ||
                dao.isMember(msg.sender),
            "!access"
        );
        bytes32 hashedName = TypeConver.bytesToBytes32(abi.encodePacked(name));
        if (!investorWhiteList[address(dao)][hashedName].contains(account)) {
            investorWhiteList[address(dao)][hashedName].add(account);
        }
    }

    function clearInvestorWhitelist(
        DaoRegistry dao,
        string calldata name
    ) external {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER),
            "!access"
        );
        bytes32 hashedName = TypeConver.bytesToBytes32(abi.encodePacked(name));
        address[] memory tem;
        tem = investorWhiteList[address(dao)][hashedName].values();
        uint256 len = tem.length;
        if (len > 0) {
            for (uint8 i = 0; i < len; i++) {
                investorWhiteList[address(dao)][hashedName].remove(tem[i]);
            }
        }
    }

    function registerPriorityDepositWhiteList(
        DaoRegistry dao,
        address account
    ) external onlyMember(dao) {
        if (!priorityDepositWhitelist[address(dao)].contains(account)) {
            priorityDepositWhitelist[address(dao)].add(account);
        }
    }

    struct DepositLocalVars {
        FlexFundingAdapterContract flexFunding;
        FlexInvestmentPoolExtension flexFungdingPoolExt;
        FlexFundingHelperAdapterContract flexFundingHelper;
        IFlexFunding.FundRaiseType fundRaiseType;
        uint256 fundRaiseStartTime;
        uint256 fundRaiseEndTime;
        uint256 minDepositAmount;
        uint256 maxDepositAmount;
        address token;
        address fundingToken;
        uint256 maxFundingAmount;
        uint256 investorsAmount;
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

        vars.flexFungdingPoolExt = FlexInvestmentPoolExtension(
            dao.getExtensionAddress(DaoHelper.FLEX_INVESTMENT_POOL_EXT)
        );
        vars.flexFundingHelper = FlexFundingHelperAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_HELPER_ADAPTER)
        );
        vars.investorsAmount = vars
            .flexFungdingPoolExt
            .getInvestorsByProposalId(proposalId)
            .length;
        // investor cap
        if (
            dao.getConfiguration(DaoHelper.MAX_INVESTORS_ENABLE) == 1 &&
            vars.investorsAmount >=
            dao.getConfiguration(DaoHelper.MAX_INVESTORS) &&
            !vars.flexFungdingPoolExt.isInvestor(proposalId, msg.sender)
        ) revert MaxInvestorReach();

        IFlexFunding.ProposalStatus state = vars
            .flexFundingHelper
            .getFundingState(dao, proposalId);

        if (state != IFlexFunding.ProposalStatus.IN_FUND_RAISE_PROGRESS)
            revert NotInFundRaise();

        (vars.fundRaiseStartTime, vars.fundRaiseEndTime) = vars
            .flexFundingHelper
            .getFundRaiseTimes(dao, proposalId);
        if (
            block.timestamp < vars.fundRaiseStartTime ||
            block.timestamp > vars.fundRaiseEndTime
        ) revert NotInFundRaise();

        require(amount > 0, "!amount");

        vars.fundRaiseType = vars.flexFundingHelper.getfundRaiseType(
            dao,
            proposalId
        );
        vars.maxFundingAmount = vars.flexFundingHelper.getMaxFundingAmount(
            dao,
            proposalId
        );

        (vars.minDepositAmount, vars.maxDepositAmount) = vars
            .flexFundingHelper
            .getDepositAmountLimit(dao, proposalId);
        if (vars.minDepositAmount > 0 && amount < vars.minDepositAmount)
            revert LessMinDepositAmount();

        if (
            vars.maxDepositAmount > 0 &&
            balanceOf(dao, proposalId, msg.sender) + amount >
            vars.maxDepositAmount
        ) revert ExceedMaxDepositAmount();

        if (
            vars.fundRaiseType == IFlexFunding.FundRaiseType.FCSF &&
            vars.maxFundingAmount > 0
        ) {
            if (
                balanceOf(dao, proposalId, DaoHelper.TOTAL) + amount >
                vars.maxFundingAmount
            ) revert ExceedMaxFundingAmount();
        }
        vars.fundingToken = vars.flexFundingHelper.getFundingToken(
            dao,
            proposalId
        );
        IERC20(vars.fundingToken).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        IERC20(vars.fundingToken).safeTransfer(
            dao.getExtensionAddress(DaoHelper.FLEX_INVESTMENT_POOL_EXT),
            amount
        );

        if (vars.flexFunding.isPriorityDepositer(dao, proposalId, msg.sender))
            freeINPriorityDeposits[address(dao)][proposalId] += amount;
        vars.flexFungdingPoolExt.addToBalance(proposalId, msg.sender, amount);
        emit Deposit(address(dao), proposalId, amount, msg.sender);
    }

    struct EscrowFundLocalVars {
        FlexFundingHelperAdapterContract flexFundingHelper;
        FlexInvestmentPoolExtension fundingpool;
        FlexFreeInEscrowFundAdapterContract freeInEscrowFundAdapter;
        FlexFundingAdapterContract flexFunding;
        uint256 maxFund;
        uint256 poolFunds;
        uint256 priorityFunds;
        uint256 extraFund;
        address tokenAddr;
    }

    function escorwExtraFreeInFund(
        DaoRegistry dao,
        bytes32 proposalId
    ) external {
        require(
            msg.sender == dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT),
            "!access"
        );
        EscrowFundLocalVars memory vars;
        vars.flexFundingHelper = FlexFundingHelperAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_HELPER_ADAPTER)
        );
        vars.flexFunding = FlexFundingAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
        );
        vars.maxFund = vars.flexFundingHelper.getMaxFundingAmount(
            dao,
            proposalId
        );
        vars.poolFunds = balanceOf(dao, proposalId, DaoHelper.TOTAL);
        if (
            vars.flexFundingHelper.getfundRaiseType(dao, proposalId) ==
            IFlexFunding.FundRaiseType.FREE_IN &&
            vars.poolFunds > vars.maxFund
        ) {
            vars.fundingpool = FlexInvestmentPoolExtension(
                dao.getExtensionAddress(DaoHelper.FLEX_INVESTMENT_POOL_EXT)
            );
            address[] memory allInvestors = vars
                .fundingpool
                .getInvestorsByProposalId(proposalId);
            vars.extraFund = 0;
            vars.tokenAddr = vars.flexFundingHelper.getFundingToken(
                dao,
                proposalId
            );

            vars.freeInEscrowFundAdapter = FlexFreeInEscrowFundAdapterContract(
                dao.getAdapterAddress(
                    DaoHelper.FLEX_FREE_IN_ESCROW_FUND_ADAPTER
                )
            );
            vars.priorityFunds = freeINPriorityDeposits[address(dao)][
                proposalId
            ];
            for (uint8 i = 0; i < allInvestors.length; i++) {
                if (vars.priorityFunds >= vars.maxFund) {
                    if (
                        vars.flexFunding.isPriorityDepositer(
                            dao,
                            proposalId,
                            allInvestors[i]
                        )
                    ) {
                        vars.extraFund =
                            balanceOf(dao, proposalId, allInvestors[i]) -
                            (balanceOf(dao, proposalId, allInvestors[i]) *
                                vars.maxFund) /
                            vars.priorityFunds;
                    } else
                        vars.extraFund = balanceOf(
                            dao,
                            proposalId,
                            allInvestors[i]
                        );
                } else {
                    if (
                        vars.flexFunding.isPriorityDepositer(
                            dao,
                            proposalId,
                            allInvestors[i]
                        )
                    ) vars.extraFund = 0;
                    else {
                        vars.extraFund =
                            balanceOf(dao, proposalId, allInvestors[i]) -
                            (balanceOf(dao, proposalId, allInvestors[i]) *
                                (vars.maxFund - vars.priorityFunds)) /
                            (vars.poolFunds - vars.priorityFunds);
                    }
                }

                if (vars.extraFund > 0) {
                    console.log("extraFund ", vars.extraFund);
                    //1. escrow Fund From Funding Pool
                    vars.freeInEscrowFundAdapter.escrowFundFromFundingPool(
                        dao,
                        proposalId,
                        vars.tokenAddr,
                        allInvestors[i],
                        vars.extraFund
                    );
                    //2. send fund to free in escrow fund contract
                    vars.fundingpool.withdrawTo(
                        proposalId,
                        allInvestors[i],
                        payable(
                            dao.getAdapterAddress(
                                DaoHelper.FLEX_FREE_IN_ESCROW_FUND_ADAPTER
                            )
                        ),
                        vars.tokenAddr,
                        vars.extraFund
                    );
                }
            }
        }
    }

    function balanceOf(
        DaoRegistry dao,
        bytes32 proposalId,
        address account
    ) public view returns (uint160) {
        FlexInvestmentPoolExtension flexFungdingPoolExt = FlexInvestmentPoolExtension(
            dao.getExtensionAddress(DaoHelper.FLEX_INVESTMENT_POOL_EXT)
        );
        return flexFungdingPoolExt.balanceOf(proposalId, account);
    }

    function getTotalFundByProposalId(
        DaoRegistry dao,
        bytes32 proposalId
    ) external view returns (uint160) {
        FlexInvestmentPoolExtension flexFungdingPoolExt = FlexInvestmentPoolExtension(
            dao.getExtensionAddress(DaoHelper.FLEX_INVESTMENT_POOL_EXT)
        );
        return flexFungdingPoolExt.balanceOf(proposalId, DaoHelper.TOTAL);
    }

    function ifInRedemptionPeriod(
        DaoRegistry dao,
        uint256 timeStamp
    ) public view returns (bool) {
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

    function isInvestorWhiteList(
        DaoRegistry dao,
        string calldata name,
        address account
    ) external view returns (bool) {
        bytes32 hashedName = TypeConver.bytesToBytes32(abi.encodePacked(name));

        return investorWhiteList[address(dao)][hashedName].contains(account);
    }

    function getInvestorMembershipInfo(
        DaoRegistry dao,
        string calldata name
    )
        external
        view
        returns (
            bool created,
            uint8 varifyType,
            uint256 minHolding,
            address tokenAddress,
            uint256 tokenId
        )
    {
        bytes32 hashedName = TypeConver.bytesToBytes32(abi.encodePacked(name));

        created = investorMemberShips[address(dao)][hashedName].created;
        varifyType = investorMemberShips[address(dao)][hashedName]
            .varifyType;
        minHolding = investorMemberShips[address(dao)][hashedName]
            .minHolding;
        tokenAddress = investorMemberShips[address(dao)][hashedName]
            .tokenAddress;
        tokenId = investorMemberShips[address(dao)][hashedName].tokenId;
    }

    function isPriorityDepositWhitelist(
        DaoRegistry dao,
        address account
    ) external view returns (bool) {
        return priorityDepositWhitelist[address(dao)].contains(account);
    }

    function getPriorityDepositWhitelist(
        DaoRegistry dao
    ) external view returns (address[] memory) {
        return priorityDepositWhitelist[address(dao)].values();
    }

    function getParticipanWhitelist(
        DaoRegistry dao,
        string calldata name
    ) external view returns (address[] memory) {
        bytes32 hashedName = TypeConver.bytesToBytes32(abi.encodePacked(name));

        return investorWhiteList[address(dao)][hashedName].values();
    }
}
