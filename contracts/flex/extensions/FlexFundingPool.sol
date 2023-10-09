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

contract FlexFundingPoolExtension is IExtension, MemberGuard, ERC165 {
    using Address for address payable;
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

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
    event WithdrawToFromAll(
        bytes32 proposalId,
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

    struct ParticipantMembership {
        string name;
        uint8 varifyType;
        uint256 minHolding;
        address tokenAddress;
        uint256 tokenId;
        address[] whiteList;
    }
    /*
     * PUBLIC VARIABLES
     */
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
    mapping(string => ParticipantMembership) public participantMemberships;
    /*
     * PRIVATE VARIABLES
     */
    mapping(bytes32 => EnumerableSet.AddressSet) private investors;

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
        address member,
        address tokenAddr,
        uint256 amount
    ) external hasExtensionAccess(AclFlag.WITHDRAW) {
        require(
            balanceOf(proposalId, member) >= amount,
            "flex funding pool::withdraw::not enough funds"
        );
        subtractFromBalance(proposalId, member, amount);

        IERC20(tokenAddr).safeTransfer(member, amount);

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
            "flex funding pool::withdraw::not enough funds"
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

    function withdrawFromAll(
        bytes32 proposalId,
        address toAddress,
        address tokenAddr,
        uint256 amount
    ) external hasExtensionAccess(AclFlag.WITHDRAW) {
        require(
            balanceOf(proposalId, DaoHelper.TOTAL) >= amount,
            "flex funding pool::withdraw::not enough funds"
        );
        // address[] memory tem = investors[proposalId].values();

        IERC20(tokenAddr).safeTransfer(toAddress, amount);

        //slither-disable-next-line reentrancy-events
        emit WithdrawToFromAll(
            proposalId,
            toAddress,
            tokenAddr,
            uint160(amount)
        );
    }

    /*
     * BANK
     */

    /**
     * @notice Registers a potential new token in the bank
     * @dev Cannot be a reserved token or an available internal token
     * @param proposalId The address of the token
     */
    function registerPotentialNewFundingProposal(
        bytes32 proposalId
    ) external hasExtensionAccess(AclFlag.REGISTER_NEW_TOKEN) {
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
     * Public read-only functions
     */

    /**
     * Internal bookkeeping
     */

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

        _newInvestor(proposalId, member);
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
        if (balanceOf(proposalId, member) <= 0)
            _removeInvestor(proposalId, member);
        _createNewAmountCheckpoint(proposalId, DaoHelper.TOTAL, newTotalAmount);
    }

    function substractFromAll(
        bytes32 proposalId,
        uint256 amount
    ) external hasExtensionAccess(AclFlag.SUB_FROM_BALANCE) {
        address[] memory tem = investors[proposalId].values();
        uint256 poolBalance = balanceOf(proposalId, DaoHelper.TOTAL);
        for (uint8 i = 0; i < tem.length; i++) {
            address investorAddr = tem[i];
            if (balanceOf(proposalId, investorAddr) > 0) {
                subtractFromBalance(
                    proposalId,
                    investorAddr,
                    (amount * balanceOf(proposalId, investorAddr)) / poolBalance
                );
            }
        }
    }

    function createParticipantMembership(
        string calldata name,
        uint8 varifyType,
        uint256 miniHolding,
        address token,
        uint256 tokenId,
        address[] calldata whiteList
    ) external onlyMember(dao) {
        if (
            keccak256(bytes(name)) ==
            keccak256(bytes(participantMemberships[name].name))
        ) revert("name already token");

        participantMemberships[name] = ParticipantMembership(
            name,
            varifyType,
            miniHolding,
            token,
            tokenId,
            whiteList
        );
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
    function balanceOf(
        bytes32 proposalId,
        address member
    ) public view returns (uint160) {
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

    function isInvestor(
        bytes32 proposalId,
        address investorAddr
    ) external view returns (bool) {
        return investors[proposalId].contains(investorAddr);
    }

    function _newInvestor(bytes32 proposalId, address investorAddr) internal {
        require(
            investorAddr != address(0x0),
            "FundingPool::_newInvestor::invalid investor address"
        );
        if (!investors[proposalId].contains(investorAddr)) {
            investors[proposalId].add(investorAddr);
        }
    }

    function _removeInvestor(
        bytes32 proposalId,
        address investorAddr
    ) internal {
        require(
            investorAddr != address(0x0),
            "FundingPool::_removeInvestor::invalid investorAddr address"
        );
        investors[proposalId].remove(investorAddr);
    }

    function getInvestorsByProposalId(
        bytes32 proposalId
    ) external view returns (address[] memory) {
        return investors[proposalId].values();
    }
}
