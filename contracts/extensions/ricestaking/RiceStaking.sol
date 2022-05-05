pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "../../core/DaoRegistry.sol";
import "../IExtension.sol";
import "../../guards/AdapterGuard.sol";
import "../../helpers/DaoHelper.sol";
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

contract StakingRiceExtension is IExtension {
    using SafeERC20 for IERC20;

    enum AclFlag {
        ADD_TO_BALANCE,
        SUB_FROM_BALANCE,
        WITHDRAW,
        SET_PROJECT_SNAP_RICE
    }
    /*
     * STRUCTURES
     */

    struct Checkpoint {
        // A checkpoint for marking number of votes from a given block
        uint96 fromBlock;
        uint160 amount;
    }
    /// @dev - Events for FundingPool
    event NewBalance(address member, address tokenAddr, uint160 amount);

    event Withdraw(address account, address tokenAddr, uint160 amount);
    /*
     * PUBLIC VARIABLES
     */
    uint256 private projectSnapRice;
    // tokenAddress => memberAddress => checkpointNum => Checkpoint
    mapping(address => mapping(address => mapping(uint32 => Checkpoint)))
        public checkpoints;
    // tokenAddress => memberAddress => numCheckpoints
    mapping(address => mapping(address => uint32)) public numCheckpoints;
    DaoRegistry public dao;
    bool public initialized = false; // internally tracks deployment under eip-1167 proxy pattern

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
            "ricestaking::accessDenied:"
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
        require(!initialized, "ricestaking already initialized");
        require(_dao.isMember(creator), "ricestaking::not member");

        dao = _dao;
        // initialized = true;
    }

    function withdraw(
        address receipientAddr,
        address tokenAddr,
        uint256 amount
    ) external hasExtensionAccess(AclFlag.WITHDRAW) {
        require(
            balanceOf(receipientAddr, tokenAddr) >= amount,
            "staking::withdraw::not enough funds"
        );
        subtractFromBalance(receipientAddr, tokenAddr, amount);

        IERC20(tokenAddr).safeTransfer(receipientAddr, amount);

        //slither-disable-next-line reentrancy-events
        emit Withdraw(receipientAddr, tokenAddr, uint160(amount));
    }

    function memberWithdraw(
        address receipientAddr,
        address tokenAddr,
        uint256 amount
    ) external hasExtensionAccess(AclFlag.WITHDRAW) {
        require(
            balanceOf(DaoHelper.STAKING_RICE_MEMBER, tokenAddr) >= amount,
            "staking::withdraw::not enough funds"
        );
        subtractFromMemberBalance(tokenAddr, amount);

        IERC20(tokenAddr).safeTransfer(receipientAddr, amount);

        //slither-disable-next-line reentrancy-events
        emit Withdraw(receipientAddr, tokenAddr, uint160(amount));
    }

    function setProjectSnapRice(address tokenAddr) external hasExtensionAccess(AclFlag.SET_PROJECT_SNAP_RICE){
        projectSnapRice = balanceOf(DaoHelper.TOTAL, tokenAddr);
    }

    /**
     * Internal bookkeeping
     */
    /**
     * @notice Adds to a member's balance of a given token
     * @param stakerAddr The staker whose balance will be updated
     * @param token The token to update
     * @param amount The new balance
     */
    function addToBalance(
        address stakerAddr,
        address token,
        uint256 amount
    ) public payable hasExtensionAccess(AclFlag.ADD_TO_BALANCE) {
        uint256 newAmount = balanceOf(stakerAddr, token) + amount;
        uint256 newTotalAmount = balanceOf(DaoHelper.STAKING_RICE_POOL, token) +
            amount;

        _createNewAmountCheckpoint(stakerAddr, token, newAmount);
        _createNewAmountCheckpoint(
            DaoHelper.STAKING_RICE_POOL,
            token,
            newTotalAmount
        );
    }

    /**
     * @notice Adds to a member's balance of a given token
     * @param token The token to update
     * @param amount The new balance
     */
    function addToMemberBalance(address token, uint256 amount)
        public
        payable
        hasExtensionAccess(AclFlag.ADD_TO_BALANCE)
    {
        uint256 newTotalAmount = balanceOf(
            DaoHelper.STAKING_RICE_MEMBER,
            token
        ) + amount;

        _createNewAmountCheckpoint(
            DaoHelper.STAKING_RICE_MEMBER,
            token,
            newTotalAmount
        );
    }

    /**
     * @notice Remove from a staker's balance of a given token
     * @param stakerAddr The member whose balance will be updated
     * @param token The token to update
     * @param amount The new balance
     */
    function subtractFromBalance(
        address stakerAddr,
        address token,
        uint256 amount
    ) public hasExtensionAccess(AclFlag.SUB_FROM_BALANCE) {
        uint256 newAmount = balanceOf(stakerAddr, token) - amount;
        uint256 newTotalAmount = balanceOf(DaoHelper.STAKING_RICE_POOL, token) -
            amount;

        _createNewAmountCheckpoint(stakerAddr, token, newAmount);
        _createNewAmountCheckpoint(
            DaoHelper.STAKING_RICE_POOL,
            token,
            newTotalAmount
        );
    }

    /**
     * @notice Remove from a member's balance of a given token
     * @param token The token to update
     * @param amount The new balance
     */
    function subtractFromMemberBalance(address token, uint256 amount)
        public
        hasExtensionAccess(AclFlag.SUB_FROM_BALANCE)
    {
        uint256 newTotalAmount = balanceOf(
            DaoHelper.STAKING_RICE_MEMBER,
            token
        ) - amount;

        _createNewAmountCheckpoint(
            DaoHelper.STAKING_RICE_MEMBER,
            token,
            newTotalAmount
        );
    }

    /**
     * @notice Creates a new amount checkpoint for a token of a certain member
     * @dev Reverts if the amount is greater than 2**64-1
     * @param member The member whose checkpoints will be added to
     * @param token The token of which the balance will be changed
     * @param amount The amount to be written into the new checkpoint
     */
    function _createNewAmountCheckpoint(
        address member,
        address token,
        uint256 amount
    ) internal {
        require(
            amount < type(uint160).max,
            "token amount exceeds the maximum limit for external tokens"
        );
        uint160 newAmount = uint160(amount);
        uint32 nCheckpoints = numCheckpoints[token][member];
        if (
            // The only condition that we should allow the amount update
            // is when the block.number exactly matches the fromBlock value.
            // Anything different from that should generate a new checkpoint.
            //slither-disable-next-line incorrect-equality
            nCheckpoints > 0 &&
            checkpoints[token][member][nCheckpoints - 1].fromBlock ==
            block.number
        ) {
            checkpoints[token][member][nCheckpoints - 1].amount = newAmount;
        } else {
            checkpoints[token][member][nCheckpoints] = Checkpoint(
                uint96(block.number),
                newAmount
            );
            numCheckpoints[token][member] = nCheckpoints + 1;
        }
        //slither-disable-next-line reentrancy-events
        emit NewBalance(member, token, newAmount);
    }

    /**
     * @notice Returns an member's balance of a given token
     * @param member The address to look up
     * @param tokenAddr The token where the member's balance of which will be returned
     * @return The amount in account's tokenAddr balance
     */
    function balanceOf(address member, address tokenAddr)
        public
        view
        returns (uint256)
    {
        uint32 nCheckpoints = numCheckpoints[tokenAddr][member];
        return
            nCheckpoints > 0
                ? checkpoints[tokenAddr][member][nCheckpoints - 1].amount
                : 0;
    }
}
