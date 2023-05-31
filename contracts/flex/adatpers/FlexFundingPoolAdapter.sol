pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "./interfaces/IFlexFunding.sol";
import "./FlexFunding.sol";
import "../../core/DaoRegistry.sol";
import "../extensions/FlexFundingPool.sol";
import "../../guards/AdapterGuard.sol";
import "../../guards/MemberGuard.sol";
import "../../guards/FlexParticipantGuard.sol";
import "../../adapters/interfaces/IVoting.sol";
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

contract FlexFundingPoolAdapterContract is
    AdapterGuard,
    MemberGuard,
    FlexParticipantGuard,
    Reimbursable
{
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    error FundingProposalNotFinalize();
    error NotInFundRaise();
    error ExceedMaxDepositAmount();
    error LessMinDepositAmount();
    error ExceedMaxFundingAmount();
    error MaxParticipantReach();

    mapping(address => mapping(bytes32 => EnumerableSet.AddressSet)) participantWhiteList;
    mapping(address => mapping(bytes32 => ParticipantMembershipInfo))
        public participantMemberShips;
    mapping(address => EnumerableSet.AddressSet) priorityDepositWhitelist;

    struct ParticipantMembershipInfo {
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
        require(
            fundRaiseEndTime > block.timestamp ||
                ((fundRaiseEndTime < block.timestamp) &&
                    flexFunding.getProposalState(dao, proposalId) ==
                    IFlexFunding.ProposalStatus.FAILED),
            "FlexFundingPool::Withdraw::cant withdraw now"
        );
        address token = flexFunding.getTokenByProposalId(dao, proposalId);
        flexFundingPool.withdraw(proposalId, msg.sender, token, amount);
        // if (
        //     fundRaiseEndTime > block.timestamp ||
        //     ((fundRaiseEndTime < block.timestamp) &&
        //         flexFunding.getProposalState(dao, proposalId) ==
        //         IFlexFunding.ProposalStatus.FAILED)
        // ) {
        //     address token = flexFunding.getTokenByProposalId(dao, proposalId);
        //     flexFundingPool.withdraw(proposalId, msg.sender, token, amount);
        // }
        emit WithDraw(address(dao), proposalId, amount, msg.sender);
    }

    function createParticipantMembership(
        DaoRegistry dao,
        string calldata name,
        uint8 varifyType,
        uint256 minHolding,
        address tokenAddress,
        uint256 tokenId
    ) external onlyMember(dao) {
        bytes32 hashedName = TypeConver.bytesToBytes32(abi.encodePacked(name));
        require(
            !participantMemberShips[address(dao)][hashedName].created,
            string(
                abi.encodePacked(
                    "name ",
                    name,
                    " Participant Membership name already taken"
                )
            )
        );
        participantMemberShips[address(dao)][
            hashedName
        ] = ParticipantMembershipInfo(
            true,
            varifyType,
            minHolding,
            tokenAddress,
            tokenId
        );
    }

    function registerParticipantWhiteList(
        DaoRegistry dao,
        string calldata name,
        address account
    ) external onlyMember(dao) {
        bytes32 hashedName = TypeConver.bytesToBytes32(abi.encodePacked(name));
        if (!participantWhiteList[address(dao)][hashedName].contains(account)) {
            participantWhiteList[address(dao)][hashedName].add(account);
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
        FlexFundingPoolExtension flexFungdingPoolExt;
        uint256 fundRaiseStartTime;
        uint256 fundRaiseEndTime;
        IFlexFunding.FundRaiseType fundRaiseType;
        uint256 minDepositAmount;
        uint256 maxDepositAmount;
        address token;
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

        vars.flexFungdingPoolExt = FlexFundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FLEX_FUNDING_POOL_EXT)
        );
        vars.investorsAmount = vars
            .flexFungdingPoolExt
            .getInvestorsByProposalId(proposalId)
            .length;

        if (
            dao.getConfiguration(DaoHelper.MAX_PARTICIPANTS_ENABLE) == 1 &&
            dao.getConfiguration(DaoHelper.MAX_PARTICIPANTS) > 0 &&
            (vars.investorsAmount >=
                dao.getConfiguration(DaoHelper.MAX_PARTICIPANTS) ||
                (vars.investorsAmount <
                    dao.getConfiguration(DaoHelper.MAX_PARTICIPANTS) &&
                    ((
                        vars.investorsAmount >=
                            DaoHelper.getStewardInvestorNB(dao, proposalId)
                            ? vars.investorsAmount -
                                DaoHelper.getStewardInvestorNB(dao, proposalId)
                            : 0
                    ) >=
                        (
                            dao.getConfiguration(DaoHelper.MAX_PARTICIPANTS) >=
                                DaoHelper.getActiveMemberNb(dao)
                                ? dao.getConfiguration(
                                    DaoHelper.MAX_PARTICIPANTS
                                ) - DaoHelper.getActiveMemberNb(dao)
                                : 0
                        )) &&
                    !dao.isMember(msg.sender))) &&
            !vars.flexFungdingPoolExt.isInvestor(proposalId, msg.sender)
        ) revert("Participant Cap Reach");

        if (
            vars.flexFunding.getProposalState(dao, proposalId) !=
            IFlexFunding.ProposalStatus.IN_FUND_RAISE_PROGRESS
        ) revert("Funding Proposal Not In Fund Raie");

        (vars.fundRaiseStartTime, vars.fundRaiseEndTime) = vars
            .flexFunding
            .getFundRaiseTimes(dao, proposalId);
        if (
            block.timestamp < vars.fundRaiseStartTime ||
            block.timestamp > vars.fundRaiseEndTime
        ) revert("Not In Fund Raise");

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
            revert("Less Min Deposit Amount");
        if (
            vars.maxDepositAmount > 0 &&
            vars.flexFungdingPoolExt.balanceOf(proposalId, msg.sender) +
                amount >
            vars.maxDepositAmount
        ) revert("Exceed Max Deposit Amount");
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
            ) revert("Exceed Max Funding Amount");
        }

        vars.token = vars.flexFunding.getTokenByProposalId(dao, proposalId);
        IERC20(vars.token).transferFrom(msg.sender, address(this), amount);
        IERC20(vars.token).safeTransfer(
            dao.getExtensionAddress(DaoHelper.FLEX_FUNDING_POOL_EXT),
            amount
        );

        vars.flexFungdingPoolExt.addToBalance(proposalId, msg.sender, amount);
        emit Deposit(address(dao), proposalId, amount, msg.sender);
    }

    function balanceOf(
        DaoRegistry dao,
        bytes32 proposalId,
        address account
    ) public view returns (uint160) {
        FlexFundingPoolExtension flexFungdingPoolExt = FlexFundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FLEX_FUNDING_POOL_EXT)
        );
        return flexFungdingPoolExt.balanceOf(proposalId, account);
    }

    function getTotalFundByProposalId(
        DaoRegistry dao,
        bytes32 proposalId
    ) external view returns (uint160) {
        FlexFundingPoolExtension flexFungdingPoolExt = FlexFundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FLEX_FUNDING_POOL_EXT)
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

    function isParticipantWhiteList(
        DaoRegistry dao,
        string calldata name,
        address account
    ) external view returns (bool) {
        bytes32 hashedName = TypeConver.bytesToBytes32(abi.encodePacked(name));

        return participantWhiteList[address(dao)][hashedName].contains(account);
    }

    function getParticipantMembershipInfo(
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

        created = participantMemberShips[address(dao)][hashedName].created;
        varifyType = participantMemberShips[address(dao)][hashedName]
            .varifyType;
        minHolding = participantMemberShips[address(dao)][hashedName]
            .minHolding;
        tokenAddress = participantMemberShips[address(dao)][hashedName]
            .tokenAddress;
        tokenId = participantMemberShips[address(dao)][hashedName].tokenId;
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

        return participantWhiteList[address(dao)][hashedName].values();
    }
}
