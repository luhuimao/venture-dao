pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "../../extensions/IExtension.sol";
import "../../guards/AdapterGuard.sol";
import "../../helpers/DaoHelper.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
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

contract FlexFundingPoolExtension is IExtension, ERC165 {
    using Address for address payable;
    using SafeERC20 for IERC20;

    // uint8 public maxExternalTokens; // the maximum number of external tokens that can be stored in the bank

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

    modifier noProposal() {
        require(dao.lockedAt() < block.number, "proposal lock");
        _;
    }

    /// @dev - Events for Bank
    event NewBalance(bytes32 proposalId, address member, uint160 amount);

    event Withdraw(
        bytes32 proposalId,
        address account,
        address tokenAddr,
        uint160 amount
    );

    event WithdrawTo(
        bytes32 proposalId,
        address accountFrom,
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

    bytes32[] public fundingProposals;
    // address[] public internalTokens;
    // tokenAddress => availability
    mapping(bytes32 => bool) public availableFundingProposals;
    // mapping(address => bool) public availableInternalTokens;
    // proposalId => memberAddress => checkpointNum => Checkpoint
    mapping(bytes32 => mapping(address => mapping(uint32 => Checkpoint)))
        public checkpoints;
    // proposalId => memberAddress => numCheckpoints
    mapping(bytes32 => mapping(address => uint32)) public numCheckpoints;

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
        bytes32 proposalId,
        address payable member,
        address tokenAddr,
        uint256 amount
    ) external hasExtensionAccess(AclFlag.WITHDRAW) {
        require(
            balanceOf(proposalId, member) >= amount,
            "flex funding pool::withdraw::not enough funds"
        );
        subtractFromBalance(proposalId, member, amount);
        if (tokenAddr == DaoHelper.ETH_TOKEN) {
            member.sendValue(amount);
        } else {
            IERC20(tokenAddr).safeTransfer(member, amount);
        }

        //slither-disable-next-line reentrancy-events
        emit Withdraw(proposalId, member, tokenAddr, uint160(amount));
    }

    function withdrawTo(
        bytes32 proposalId,
        address memberFrom,
        address payable memberTo,
        address tokenAddr,
        uint256 amount
    ) external hasExtensionAccess(AclFlag.WITHDRAW) {
        require(
            balanceOf(proposalId, memberFrom) >= amount,
            "bank::withdraw::not enough funds"
        );
        subtractFromBalance(proposalId, memberFrom, amount);
        if (tokenAddr == DaoHelper.ETH_TOKEN) {
            memberTo.sendValue(amount);
        } else {
            IERC20(tokenAddr).safeTransfer(memberTo, amount);
        }

        //slither-disable-next-line reentrancy-events
        emit WithdrawTo(
            proposalId,
            memberFrom,
            memberTo,
            tokenAddr,
            uint160(amount)
        );
    }

    /**
     * @return Whether or not the given token is an available internal token in the bank
     * @param token The address of the token to look up
     */
    // function isInternalToken(address token) external view returns (bool) {
    //     return availableInternalTokens[token];
    // }

    /**
     * @return Whether or not the given token is an available token in the bank
     * @param token The address of the token to look up
     */
    // function isTokenAllowed(address token) public view returns (bool) {
    //     return availableTokens[token];
    // }

    /**
     * @notice Sets the maximum amount of external tokens allowed in the bank
     * @param maxTokens The maximum amount of token allowed
     */
    // function setMaxExternalTokens(uint8 maxTokens) external {
    //     require(!initialized, "bank already initialized");
    //     require(
    //         maxTokens > 0 && maxTokens <= DaoHelper.MAX_TOKENS_GUILD_BANK,
    //         "max number of external tokens should be (0,200)"
    //     );
    //     maxExternalTokens = maxTokens;
    // }

    /*
     * BANK
     */

    /**
     * @notice Registers a potential new token in the bank
     * @dev Cannot be a reserved token or an available internal token
     * @param proposalId The address of the token
     */
    function registerPotentialNewFundingProposal(bytes32 proposalId)
        external
        hasExtensionAccess(AclFlag.REGISTER_NEW_TOKEN)
    {
        // require(DaoHelper.isNotReservedAddress(token), "reservedToken");
        // require(!availableInternalTokens[token], "internalToken");
        // require(
        //     fundingProposals.length <= maxExternalTokens,
        //     "exceeds the maximum tokens allowed"
        // );

        if (!availableFundingProposals[proposalId]) {
            availableFundingProposals[proposalId] = true;
            fundingProposals.push(proposalId);
        }
    }

    /**
     * @notice Registers a potential new internal token in the bank
     * @dev Can not be a reserved token or an available token
     * @param token The address of the token
     */
    // function registerPotentialNewInternalToken(address token)
    //     external
    //     hasExtensionAccess(AclFlag.REGISTER_NEW_INTERNAL_TOKEN)
    // {
    //     require(DaoHelper.isNotReservedAddress(token), "reservedToken");
    //     require(!availableTokens[token], "availableToken");

    //     if (!availableInternalTokens[token]) {
    //         availableInternalTokens[token] = true;
    //         internalTokens.push(token);
    //     }
    // }

    // function updateToken(address tokenAddr)
    //     external
    //     hasExtensionAccess(AclFlag.UPDATE_TOKEN)
    // {
    //     require(isTokenAllowed(tokenAddr), "token not allowed");
    //     uint256 totalBalance = balanceOf(DaoHelper.TOTAL, tokenAddr);

    //     uint256 realBalance;

    //     if (tokenAddr == DaoHelper.ETH_TOKEN) {
    //         realBalance = address(this).balance;
    //     } else {
    //         IERC20 erc20 = IERC20(tokenAddr);
    //         realBalance = erc20.balanceOf(address(this));
    //     }

    //     if (totalBalance < realBalance) {
    //         addToBalance(
    //             DaoHelper.GUILD,
    //             tokenAddr,
    //             realBalance - totalBalance
    //         );
    //     } else if (totalBalance > realBalance) {
    //         uint256 tokensToRemove = totalBalance - realBalance;
    //         uint256 guildBalance = balanceOf(DaoHelper.GUILD, tokenAddr);
    //         if (guildBalance > tokensToRemove) {
    //             subtractFromBalance(DaoHelper.GUILD, tokenAddr, tokensToRemove);
    //         } else {
    //             subtractFromBalance(DaoHelper.GUILD, tokenAddr, guildBalance);
    //         }
    //     }
    // }

    /**
     * Public read-only functions
     */

    /**
     * Internal bookkeeping
     */

    /**
     * @return The token from the bank of a given index
     * @param index The index to look up in the bank's tokens
     */
    // function getToken(uint256 index) external view returns (address) {
    //     return tokens[index];
    // }

    /**
     * @return The amount of token addresses in the bank
     */
    // function nbTokens() external view returns (uint256) {
    //     return tokens.length;
    // }

    /**
     * @return All the tokens registered in the bank.
     */
    // function getTokens() external view returns (address[] memory) {
    //     return tokens;
    // }

    /**
     * @return The internal token at a given index
     * @param index The index to look up in the bank's array of internal tokens
     */
    // function getInternalToken(uint256 index) external view returns (address) {
    //     return internalTokens[index];
    // }

    /**
     * @return The amount of internal token addresses in the bank
     */
    // function nbInternalTokens() external view returns (uint256) {
    //     return internalTokens.length;
    // }

    /**
     * @notice Adds to a member's balance of a given token
     * @param proposalId The new balance
     * @param member The member whose balance will be updated
     * @param amount The token to update
     */
    function addToBalance(
        bytes32 proposalId,
        address member,
        uint256 amount
    ) public payable hasExtensionAccess(AclFlag.ADD_TO_BALANCE) {
        require(availableFundingProposals[proposalId], "unknown proposalId");
        uint256 newAmount = balanceOf(proposalId, member) + amount;
        uint256 newTotalAmount = balanceOf(proposalId, DaoHelper.TOTAL) +
            amount;

        _createNewAmountCheckpoint(proposalId, member, newAmount);
        _createNewAmountCheckpoint(proposalId, DaoHelper.TOTAL, newTotalAmount);
    }

    /**
     * @notice Remove from a member's balance of a given token
     * @param member The member whose balance will be updated
     * @param proposalId The token to update
     * @param amount The new balance
     */
    function subtractFromBalance(
        bytes32 proposalId,
        address member,
        uint256 amount
    ) public hasExtensionAccess(AclFlag.SUB_FROM_BALANCE) {
        uint256 newAmount = balanceOf(proposalId, member) - amount;
        uint256 newTotalAmount = balanceOf(proposalId, DaoHelper.TOTAL) -
            amount;

        _createNewAmountCheckpoint(proposalId, member, newAmount);
        _createNewAmountCheckpoint(proposalId, DaoHelper.TOTAL, newTotalAmount);
    }

    /**
     * @notice Make an internal token transfer
     * @param from The member who is sending tokens
     * @param to The member who is receiving tokens
     * @param amount The new amount to transfer
     */
    function internalTransfer(
        bytes32 proposalId,
        address from,
        address to,
        address token,
        uint256 amount
    ) external hasExtensionAccess(AclFlag.INTERNAL_TRANSFER) {
        uint256 newAmount = balanceOf(proposalId, from) - amount;
        uint256 newAmount2 = balanceOf(proposalId, to) + amount;

        _createNewAmountCheckpoint(proposalId, from, newAmount);
        _createNewAmountCheckpoint(proposalId, to, newAmount2);
    }

    /**
     * @notice Returns an member's balance of a given token
     * @param proposalId The proposalId to look up
     * @param member The address to look up
     * @return The amount in account's tokenAddr balance
     */
    function balanceOf(bytes32 proposalId, address member)
        public
        view
        returns (uint160)
    {
        uint32 nCheckpoints = numCheckpoints[proposalId][member];
        return
            nCheckpoints > 0
                ? checkpoints[proposalId][member][nCheckpoints - 1].amount
                : 0;
    }

    /**
     * @notice Determine the prior number of votes for an account as of a block number
     * @dev Block number must be a finalized block or else this function will revert to prevent misinformation.
     * @param proposalId The proposalId of the account to check
     * @param account The address of the account to check
     * @param blockNumber The block number to get the vote balance at
     * @return The number of votes the account had as of the given block
     */
    function getPriorAmount(
        bytes32 proposalId,
        address account,
        uint256 blockNumber
    ) external view returns (uint256) {
        require(
            blockNumber < block.number,
            "Uni::getPriorAmount: not yet determined"
        );

        uint32 nCheckpoints = numCheckpoints[proposalId][account];
        if (nCheckpoints == 0) {
            return 0;
        }

        // First check most recent balance
        if (
            checkpoints[proposalId][account][nCheckpoints - 1].fromBlock <=
            blockNumber
        ) {
            return checkpoints[proposalId][account][nCheckpoints - 1].amount;
        }

        // Next check implicit zero balance
        if (checkpoints[proposalId][account][0].fromBlock > blockNumber) {
            return 0;
        }

        uint32 lower = 0;
        uint32 upper = nCheckpoints - 1;
        while (upper > lower) {
            uint32 center = upper - (upper - lower) / 2; // ceil, avoiding overflow
            Checkpoint memory cp = checkpoints[proposalId][account][center];
            if (cp.fromBlock == blockNumber) {
                return cp.amount;
            } else if (cp.fromBlock < blockNumber) {
                lower = center;
            } else {
                upper = center - 1;
            }
        }
        return checkpoints[proposalId][account][lower].amount;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override
        returns (bool)
    {
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
     * @param proposalId The member whose checkpoints will be added to
     * @param member The member whose checkpoints will be added to
     * @param amount The amount to be written into the new checkpoint
     */
    function _createNewAmountCheckpoint(
        bytes32 proposalId,
        address member,
        uint256 amount
    ) internal {
        bool isValidProposalId = false;
        if (availableFundingProposals[proposalId]) {
            require(
                amount < type(uint160).max,
                "token amount exceeds the maximum limit"
            );
            isValidProposalId = true;
        }
        uint160 newAmount = uint160(amount);

        require(isValidProposalId, "proposalId not registered");

        uint32 nCheckpoints = numCheckpoints[proposalId][member];
        if (
            // The only condition that we should allow the amount update
            // is when the block.number exactly matches the fromBlock value.
            // Anything different from that should generate a new checkpoint.
            //slither-disable-next-line incorrect-equality
            nCheckpoints > 0 &&
            checkpoints[proposalId][member][nCheckpoints - 1].fromBlock ==
            block.number
        ) {
            checkpoints[proposalId][member][nCheckpoints - 1]
                .amount = newAmount;
        } else {
            checkpoints[proposalId][member][nCheckpoints] = Checkpoint(
                uint96(block.number),
                newAmount
            );
            numCheckpoints[proposalId][member] = nCheckpoints + 1;
        }
        //slither-disable-next-line reentrancy-events
        emit NewBalance(proposalId, member, newAmount);
    }
}
