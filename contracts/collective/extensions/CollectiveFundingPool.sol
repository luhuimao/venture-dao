pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

// import "../../core/DaoRegistry.sol";
import "../../extensions/IExtension.sol";
import "../../guards/AdapterGuard.sol";
import "../../guards/MemberGuard.sol";
// import "../../helpers/DaoHelper.sol";
import "@openzeppelin/contracts/utils/Address.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
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

contract CollectiveInvestmentPoolExtension is IExtension, MemberGuard, ERC165 {
    using Address for address payable;
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    bool public initialized = false; // internally tracks deployment under eip-1167 proxy pattern
    DaoRegistry public dao;

    enum AclFlag {
        ADD_TO_BALANCE,
        SUB_FROM_BALANCE,
        INTERNAL_TRANSFER,
        WITHDRAW,
        REGISTER_NEW_TOKEN,
        REGISTER_NEW_INTERNAL_TOKEN,
        UPDATE_TOKEN
    }

    // modifier noProposal() {
    //     require(dao.lockedAt() < block.number, "proposal lock");
    //     _;
    // }

    /// @dev - Events for Bank
    event NewBalance(address member, uint160 amount);

    event Withdraw(address account, address tokenAddr, uint160 amount);

    event WithdrawTo(
        address accountFrom,
        address accountTo,
        address tokenAddr,
        uint160 amount
    );
    event WithdrawToFromAll(
        address accountTo,
        address tokenAddr,
        uint160 amount
    );

    /*
     * STRUCTURES
     */

    struct Checkpoint {
        // A checkpoint for marking number of votes from a given block
        uint96 fromBlock;
        uint160 amount;
    }

    // struct InvestorMembership {
    //     string name;
    //     uint8 varifyType;
    //     uint256 minHolding;
    //     address tokenAddress;
    //     uint256 tokenId;
    //     address[] whiteList;
    // }
    /*
     * PUBLIC VARIABLES
     */
    // bytes32[] public investmentProposals;
    // tokenAddress => availability
    // memberAddress => checkpointNum => Checkpoint
    mapping(address => mapping(uint32 => Checkpoint)) public checkpoints;
    //memberAddress => numCheckpoints
    mapping(address => uint32) public numCheckpoints;
    // mapping(string => InvestorMembership) public investorMemberships;
    /*
     * PRIVATE VARIABLES
     */
    EnumerableSet.AddressSet investors;

    /// @notice Clonable contract must have an empty constructor
    constructor() {}

    // slither-disable-next-line calls-loop
    modifier hasExtensionAccess(AclFlag flag) {
        require(
            address(this) == msg.sender ||
                address(dao) == msg.sender ||
                DaoHelper.isInCreationModeAndHasAccess(dao) ||
                dao.hasAdapterAccessToExtension(
                    msg.sender,
                    address(this),
                    uint8(flag)
                ),
            "flex funding pool::accessDenied:"
        );
        _;
    }

    /**
     * @notice Initialises the DAO
     * @dev Involves initialising available tokens, checkpoints, and membership of creator
     * @dev Can only be called once
     * @param creator The DAO's creator, who will be an initial member
     */
    function initialize(DaoRegistry _dao, address creator) external override {
        require(!initialized, "flex funding pool already initialized");
        require(_dao.isMember(creator), "flex funding pool::not member");
        dao = _dao;
        initialized = true;

        // availableInternalTokens[DaoHelper.UNITS] = true;
        // internalTokens.push(DaoHelper.UNITS);

        // availableInternalTokens[DaoHelper.MEMBER_COUNT] = true;
        // internalTokens.push(DaoHelper.MEMBER_COUNT);
        // uint256 nbMembers = _dao.getNbMembers();
        // for (uint256 i = 0; i < nbMembers; i++) {
        //     //slither-disable-next-line calls-loop
        //     addToBalance(_dao.getMemberAddress(i), DaoHelper.MEMBER_COUNT, 1);
        // }

        // _createNewAmountCheckpoint(creator, DaoHelper.UNITS, 1);
        // _createNewAmountCheckpoint(DaoHelper.TOTAL, DaoHelper.UNITS, 1);
    }

    function withdraw(
        address member,
        address tokenAddr,
        uint256 amount
    ) external hasExtensionAccess(AclFlag.WITHDRAW) {
        require(
            balanceOf(member) >= amount,
            "flex funding pool::withdraw::not enough funds"
        );
        subtractFromBalance(member, amount);

        IERC20(tokenAddr).safeTransfer(member, amount);

        //slither-disable-next-line reentrancy-events
        emit Withdraw(member, tokenAddr, uint160(amount));
    }

    function withdrawTo(
        address memberFrom,
        address payable memberTo,
        address tokenAddr,
        uint256 amount
    ) external hasExtensionAccess(AclFlag.WITHDRAW) {
        require(
            balanceOf(memberFrom) >= amount,
            "flex funding pool::withdraw::not enough funds"
        );
        subtractFromBalance(memberFrom, amount);
        if (tokenAddr == DaoHelper.ETH_TOKEN) {
            memberTo.sendValue(amount);
        } else {
            IERC20(tokenAddr).safeTransfer(memberTo, amount);
        }

        //slither-disable-next-line reentrancy-events
        emit WithdrawTo(memberFrom, memberTo, tokenAddr, uint160(amount));
    }

    function withdrawFromAll(
        address toAddress,
        address tokenAddr,
        uint256 amount
    ) external hasExtensionAccess(AclFlag.WITHDRAW) {
        require(
            balanceOf(DaoHelper.TOTAL) >= amount,
            "flex funding pool::withdraw::not enough funds"
        );
        // address[] memory tem = investors[proposalId].values();

        IERC20(tokenAddr).safeTransfer(toAddress, amount);

        //slither-disable-next-line reentrancy-events
        emit WithdrawToFromAll(toAddress, tokenAddr, uint160(amount));
    }

    /*
     * BANK
     */

    /**
     * Public read-only functions
     */

    /**
     * Internal bookkeeping
     */

    /**
     * @notice Adds to a member's balance of a given token
     * @param member The member whose balance will be updated
     * @param amount The token to update
     */
    function addToBalance(
        address member,
        uint256 amount
    ) public payable hasExtensionAccess(AclFlag.ADD_TO_BALANCE) {
        uint256 newAmount = balanceOf(member) + amount;
        uint256 newTotalAmount = balanceOf(DaoHelper.TOTAL) + amount;

        _createNewAmountCheckpoint(member, newAmount);
        _createNewAmountCheckpoint(DaoHelper.TOTAL, newTotalAmount);

        _newInvestor(member);
    }

    /**
     * @notice Remove from a member's balance of a given token
     * @param member The member whose balance will be updated
     * @param amount The new balance
     */
    function subtractFromBalance(
        address member,
        uint256 amount
    ) public hasExtensionAccess(AclFlag.SUB_FROM_BALANCE) {
        uint256 newAmount = balanceOf(member) - amount;
        uint256 newTotalAmount = balanceOf(DaoHelper.TOTAL) - amount;

        _createNewAmountCheckpoint(member, newAmount);
        if (balanceOf(member) <= 0) _removeInvestor(member);
        _createNewAmountCheckpoint(DaoHelper.TOTAL, newTotalAmount);
    }

    function substractFromAll(
        uint256 amount
    ) external hasExtensionAccess(AclFlag.SUB_FROM_BALANCE) {
        address[] memory tem = investors.values();
        uint256 poolBalance = balanceOf(DaoHelper.TOTAL);
        for (uint8 i = 0; i < tem.length; i++) {
            address investorAddr = tem[i];
            if (balanceOf(investorAddr) > 0) {
                subtractFromBalance(
                    investorAddr,
                    (amount * balanceOf(investorAddr)) / poolBalance
                );
            }
        }
    }

    // function createInvestorMembership(
    //     string calldata name,
    //     uint8 varifyType,
    //     uint256 miniHolding,
    //     address token,
    //     uint256 tokenId,
    //     address[] calldata whiteList
    // ) external onlyMember(dao) {
    //     if (
    //         keccak256(bytes(name)) ==
    //         keccak256(bytes(investorMemberships[name].name))
    //     ) revert("name already token");

    //     investorMemberships[name] = InvestorMembership(
    //         name,
    //         varifyType,
    //         miniHolding,
    //         token,
    //         tokenId,
    //         whiteList
    //     );
    // }

    /**
     * @notice Make an internal token transfer
     * @param from The member who is sending tokens
     * @param to The member who is receiving tokens
     * @param amount The new amount to transfer
     */
    function internalTransfer(
        address from,
        address to,
        uint256 amount
    ) external hasExtensionAccess(AclFlag.INTERNAL_TRANSFER) {
        uint256 newAmount = balanceOf(from) - amount;
        uint256 newAmount2 = balanceOf(to) + amount;

        _createNewAmountCheckpoint(from, newAmount);
        _createNewAmountCheckpoint(to, newAmount2);
    }

    /**
     * @notice Returns an member's balance of a given token
     * @param member The address to look up
     * @return The amount in account's tokenAddr balance
     */
    function balanceOf(address member) public view returns (uint160) {
        uint32 nCheckpoints = numCheckpoints[member];
        return
            nCheckpoints > 0 ? checkpoints[member][nCheckpoints - 1].amount : 0;
    }

    /**
     * @notice Determine the prior number of votes for an account as of a block number
     * @dev Block number must be a finalized block or else this function will revert to prevent misinformation.
     * @param account The address of the account to check
     * @param blockNumber The block number to get the vote balance at
     * @return The number of votes the account had as of the given block
     */
    function getPriorAmount(
        address account,
        uint256 blockNumber
    ) external view returns (uint256) {
        require(
            blockNumber < block.number,
            "Uni::getPriorAmount: not yet determined"
        );

        uint32 nCheckpoints = numCheckpoints[account];
        if (nCheckpoints == 0) {
            return 0;
        }

        // First check most recent balance
        if (checkpoints[account][nCheckpoints - 1].fromBlock <= blockNumber) {
            return checkpoints[account][nCheckpoints - 1].amount;
        }

        // Next check implicit zero balance
        if (checkpoints[account][0].fromBlock > blockNumber) {
            return 0;
        }

        uint32 lower = 0;
        uint32 upper = nCheckpoints - 1;
        while (upper > lower) {
            uint32 center = upper - (upper - lower) / 2; // ceil, avoiding overflow
            Checkpoint memory cp = checkpoints[account][center];
            if (cp.fromBlock == blockNumber) {
                return cp.amount;
            } else if (cp.fromBlock < blockNumber) {
                lower = center;
            } else {
                upper = center - 1;
            }
        }
        return checkpoints[account][lower].amount;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            super.supportsInterface(interfaceId) ||
            this.subtractFromBalance.selector == interfaceId ||
            this.addToBalance.selector == interfaceId ||
            this.getPriorAmount.selector == interfaceId ||
            this.balanceOf.selector == interfaceId ||
            this.internalTransfer.selector == interfaceId ||
            // this.nbInternalTokens.selector == interfaceId ||
            // this.getInternalToken.selector == interfaceId ||
            // this.getTokens.selector == interfaceId ||
            // this.nbTokens.selector == interfaceId ||
            // this.getToken.selector == interfaceId ||
            // this.updateToken.selector == interfaceId ||
            // this.registerPotentialNewInternalToken.selector == interfaceId ||
            // this.registerPotentialNewToken.selector == interfaceId ||
            // this.setMaxExternalTokens.selector == interfaceId ||
            // this.isTokenAllowed.selector == interfaceId ||
            // this.isInternalToken.selector == interfaceId ||
            this.withdraw.selector == interfaceId ||
            this.withdrawTo.selector == interfaceId;
    }

    /**
     * @notice Creates a new amount checkpoint for a token of a certain member
     * @dev Reverts if the amount is greater than 2**64-1
     * @param member The member whose checkpoints will be added to
     * @param amount The amount to be written into the new checkpoint
     */
    function _createNewAmountCheckpoint(
        address member,
        uint256 amount
    ) internal {
        require(
            amount < type(uint160).max,
            "token amount exceeds the maximum limit"
        );

        uint160 newAmount = uint160(amount);

        uint32 nCheckpoints = numCheckpoints[member];
        if (
            // The only condition that we should allow the amount update
            // is when the block.number exactly matches the fromBlock value.
            // Anything different from that should generate a new checkpoint.
            //slither-disable-next-line incorrect-equality
            nCheckpoints > 0 &&
            checkpoints[member][nCheckpoints - 1].fromBlock == block.number
        ) {
            checkpoints[member][nCheckpoints - 1].amount = newAmount;
        } else {
            checkpoints[member][nCheckpoints] = Checkpoint(
                uint96(block.number),
                newAmount
            );
            numCheckpoints[member] = nCheckpoints + 1;
        }
        //slither-disable-next-line reentrancy-events
        emit NewBalance(member, newAmount);
    }

    function isInvestor(address investorAddr) external view returns (bool) {
        return investors.contains(investorAddr);
    }

    function _newInvestor(address investorAddr) internal {
        require(
            investorAddr != address(0x0),
            "FundingPool::_newInvestor::invalid investor address"
        );
        if (!investors.contains(investorAddr)) {
            investors.add(investorAddr);
        }
    }

    function _removeInvestor(address investorAddr) internal {
        require(
            investorAddr != address(0x0),
            "FundingPool::_removeInvestor::invalid investorAddr address"
        );
        investors.remove(investorAddr);
    }

    // function getInvestorsByProposalId(
    //     bytes32 proposalId
    // ) external view returns (address[] memory) {
    //     return investors[proposalId].values();
    // }
}
