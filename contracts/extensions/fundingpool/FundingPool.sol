pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "../IExtension.sol";
import "../../guards/AdapterGuard.sol";
import "../../helpers/DaoHelper.sol";
import "../bank/Bank.sol";
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

contract FundingPoolExtension is IExtension, ERC165 {
    using Address for address payable;
    using SafeERC20 for IERC20;

    uint8 public maxExternalTokens; // the maximum number of external tokens that can be stored in the bank
    uint256 public minFundsForLP; // minimum funds threshold for LP
    uint256 public minFundsForGP; // minimum funds threshold for GP
    uint256 serviceFeeRatio; //service fee ratio
    bool public initialized = false; // internally tracks deployment under eip-1167 proxy pattern
    DaoRegistry public dao;

    enum AclFlag {
        ADD_TO_BALANCE,
        SUB_FROM_BALANCE,
        INTERNAL_TRANSFER,
        WITHDRAW,
        REGISTER_NEW_TOKEN,
        REGISTER_NEW_INTERNAL_TOKEN,
        UPDATE_TOKEN,
        DISTRIBUTE_FUNDS
    }
    enum GeneralPartnerFlag {
        EXISTS,
        EXITED
    }

    modifier noProposal() {
        require(dao.lockedAt() < block.number, "proposal lock");
        _;
    }

    /// @dev - Events for Bank
    event NewBalance(address member, address tokenAddr, uint160 amount);

    event Withdraw(address account, address tokenAddr, uint160 amount);

    event WithdrawTo(
        address accountFrom,
        address accountTo,
        address tokenAddr,
        uint160 amount
    );

    event DistributeFund(
        address distributeTo,
        address tokenAddr,
        uint256 amount
    );

    /*
     * STRUCTURES
     */

    struct Checkpoint {
        // A checkpoint for marking number of votes from a given block
        uint96 fromBlock;
        uint160 amount;
    }

    struct GeneralPartner {
        // the structure to track all the general partners in the DAO
        uint256 flags; // flags to track the state of the general partners: exists, etc
    }

    /*
     * PUBLIC VARIABLES
     */
    // delegate key => general partner address mapping
    mapping(address => address) public generalPartnerAddressesByDelegatedKey;
    mapping(address => GeneralPartner) public generalPartners; // the map to track all general partners of the DAO
    address[] private _generalPartners;
    address[] public tokens;
    address[] public internalTokens;
    // tokenAddress => availability
    mapping(address => bool) public availableTokens;
    mapping(address => bool) public availableInternalTokens;
    // tokenAddress => memberAddress => checkpointNum => Checkpoint
    mapping(address => mapping(address => mapping(uint32 => Checkpoint)))
        public checkpoints;
    // tokenAddress => memberAddress => numCheckpoints
    mapping(address => mapping(address => uint32)) public numCheckpoints;

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
            "foundingpool::accessDenied:"
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
        require(!initialized, "foundingpool already initialized");
        require(_dao.isMember(creator), "foundingpool::not member");

        dao = _dao;
        initialized = true;

        availableInternalTokens[DaoHelper.UNITS] = true;
        internalTokens.push(DaoHelper.UNITS);

        availableInternalTokens[DaoHelper.MEMBER_COUNT] = true;
        internalTokens.push(DaoHelper.MEMBER_COUNT);
        // uint256 nbMembers = _dao.getNbMembers();

        // for (uint256 i = 0; i < nbMembers; i++) {
        //     //slither-disable-next-line calls-loop
        //     addToBalance(_dao.getMemberAddress(i), DaoHelper.MEMBER_COUNT, 1);
        // }

        // _createNewAmountCheckpoint(creator, DaoHelper.UNITS, 1);
        // _createNewAmountCheckpoint(DaoHelper.TOTAL, DaoHelper.UNITS, 1);
    }

    function withdraw(
        address payable member,
        address tokenAddr,
        uint256 amount
    ) external hasExtensionAccess(AclFlag.WITHDRAW) {
        require(
            balanceOf(member, tokenAddr) >= amount,
            "FundingPool::withdraw::not enough funds"
        );
        subtractFromBalance(member, tokenAddr, amount);
        if (tokenAddr == DaoHelper.ETH_TOKEN) {
            member.sendValue(amount);
        } else {
            IERC20(tokenAddr).safeTransfer(member, amount);
        }

        if (balanceOf(member, tokenAddr) <= minFundsForGP) {
            _removeGneralPartner(member);
        }

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
            balanceOf(memberFrom, tokenAddr) >= amount,
            "bank::withdraw::not enough funds"
        );
        subtractFromBalance(memberFrom, tokenAddr, amount);
        if (tokenAddr == DaoHelper.ETH_TOKEN) {
            memberTo.sendValue(amount);
        } else {
            IERC20(tokenAddr).safeTransfer(memberTo, amount);
        }

        //slither-disable-next-line reentrancy-events
        emit WithdrawTo(memberFrom, memberTo, tokenAddr, uint160(amount));
    }

    function distributeFunds(
        address recipientAddr,
        address tokenAddr,
        uint256 amount
    ) external hasExtensionAccess(AclFlag.DISTRIBUTE_FUNDS) {
        require(amount > 0, "FundingPool::distributeFunds::amount must > 0");
        require(
            IERC20(tokenAddr).balanceOf(address(this)) >= amount,
            "FundingPool::withdraw::not enough funds"
        );
        IERC20(tokenAddr).safeTransfer(recipientAddr, amount);

        emit DistributeFund(recipientAddr, tokenAddr, amount);
    }

    /**
     * @return Whether or not the given token is an available internal token in the bank
     * @param token The address of the token to look up
     */
    function isInternalToken(address token) external view returns (bool) {
        return availableInternalTokens[token];
    }

    /**
     * @return Whether or not the given token is an available token in the bank
     * @param token The address of the token to look up
     */
    function isTokenAllowed(address token) public view returns (bool) {
        return availableTokens[token];
    }

    /**
     * @notice Sets the maximum amount of external tokens allowed in the bank
     * @param maxTokens The maximum amount of token allowed
     */
    function setMaxExternalTokens(uint8 maxTokens) external {
        require(!initialized, "bank already initialized");
        require(
            maxTokens > 0 && maxTokens <= DaoHelper.MAX_TOKENS_GUILD_BANK,
            "max number of external tokens should be (0,200)"
        );
        maxExternalTokens = maxTokens;
    }

    /**
     * @notice Sets the maximum amount of external tokens allowed in the founding pool
     * @param minfunds The maximum amount of token allowed
     */
    function setMinFundsForGP(uint256 minfunds) external {
        require(!initialized, "founding pool already initialized");
        // require(
        //     minfunds > 0 && minfunds <= DaoHelper.MAX_TOKENS_GUILD_BANK,
        //     "max number of external tokens should be (0,200)"
        // );
        require(
            minfunds > 0 && minfunds < 2**256 - 1,
            "max number of external tokens should be (0,2*256-1)"
        );
        minFundsForGP = minfunds;
    }

    /**
     * @notice Sets the service fee ratio
     * @param serviceFee The service fee ratio
     */
    function setServiceFeeRatio(uint256 serviceFee) external {
        require(!initialized, "founding pool already initialized");
        require(
            serviceFee > 0 && serviceFee <= 100,
            "service fee ratio should be (0,100)"
        );
        serviceFeeRatio = serviceFee;
    }

    /**
     * @notice Sets the maximum amount of external tokens allowed in the founding pool
     * @param minfunds The maximum amount of token allowed
     */
    function setMinFundsForLP(uint256 minfunds) external {
        require(!initialized, "founding pool already initialized");
        require(
            minfunds > 0 && minfunds <= DaoHelper.MAX_TOKENS_GUILD_BANK,
            "max number of external tokens should be (0,200)"
        );
        minFundsForLP = minfunds;
    }

    /*
     * BANK
     */

    /**
     * @notice Registers a potential new token in the bank
     * @dev Cannot be a reserved token or an available internal token
     * @param token The address of the token
     */
    function registerPotentialNewToken(address token)
        external
        hasExtensionAccess(AclFlag.REGISTER_NEW_TOKEN)
    {
        require(DaoHelper.isNotReservedAddress(token), "reservedToken");
        require(!availableInternalTokens[token], "internalToken");
        require(
            tokens.length <= maxExternalTokens,
            "exceeds the maximum tokens allowed"
        );

        if (!availableTokens[token]) {
            availableTokens[token] = true;
            tokens.push(token);
        }
    }

    /**
     * @notice Registers a potential new internal token in the bank
     * @dev Can not be a reserved token or an available token
     * @param token The address of the token
     */
    function registerPotentialNewInternalToken(address token)
        external
        hasExtensionAccess(AclFlag.REGISTER_NEW_INTERNAL_TOKEN)
    {
        require(DaoHelper.isNotReservedAddress(token), "reservedToken");
        require(!availableTokens[token], "availableToken");

        if (!availableInternalTokens[token]) {
            availableInternalTokens[token] = true;
            internalTokens.push(token);
        }
    }

    function updateToken(address tokenAddr)
        external
        hasExtensionAccess(AclFlag.UPDATE_TOKEN)
    {
        require(isTokenAllowed(tokenAddr), "token not allowed");
        uint256 totalBalance = balanceOf(DaoHelper.TOTAL, tokenAddr);

        uint256 realBalance;

        if (tokenAddr == DaoHelper.ETH_TOKEN) {
            realBalance = address(this).balance;
        } else {
            IERC20 erc20 = IERC20(tokenAddr);
            realBalance = erc20.balanceOf(address(this));
        }

        if (totalBalance < realBalance) {
            addToBalance(
                DaoHelper.GUILD,
                tokenAddr,
                realBalance - totalBalance
            );
        } else if (totalBalance > realBalance) {
            uint256 tokensToRemove = totalBalance - realBalance;
            uint256 guildBalance = balanceOf(DaoHelper.GUILD, tokenAddr);
            if (guildBalance > tokensToRemove) {
                subtractFromBalance(DaoHelper.GUILD, tokenAddr, tokensToRemove);
            } else {
                subtractFromBalance(DaoHelper.GUILD, tokenAddr, guildBalance);
            }
        }
    }

    /**
     * Public read-only functions
     */

    /**
     * @return Whether or not a flag is set for a given general partner
     * @param generalPartnerAddress The general partner to check against flag
     * @param flag The flag to check in the general partner
     */
    function getGeneralPartnerFlag(
        address generalPartnerAddress,
        GeneralPartnerFlag flag
    ) public view returns (bool) {
        return
            DaoHelper.getFlag(
                generalPartners[generalPartnerAddress].flags,
                uint8(flag)
            );
    }

    /**
     * @return Whether or not a given address is a general partner of the DAO.
     * @dev it will resolve by delegate key, not member address.
     * @param addr The address to look up
     */
    function isGeneralPartner(address addr) external view returns (bool) {
        address generalPartnerAddress = generalPartnerAddressesByDelegatedKey[
            addr
        ];
        return
            getGeneralPartnerFlag(
                generalPartnerAddress,
                GeneralPartnerFlag.EXISTS
            );
    }

    /**
     * Internal bookkeeping
     */

    /**
     * @return The token from the bank of a given index
     * @param index The index to look up in the bank's tokens
     */
    function getToken(uint256 index) external view returns (address) {
        return tokens[index];
    }

    /**
     * @return The amount of token addresses in the bank
     */
    function nbTokens() external view returns (uint256) {
        return tokens.length;
    }

    /**
     * @return All the tokens registered in the bank.
     */
    function getTokens() external view returns (address[] memory) {
        return tokens;
    }

    /**
     * @return The internal token at a given index
     * @param index The index to look up in the bank's array of internal tokens
     */
    function getInternalToken(uint256 index) external view returns (address) {
        return internalTokens[index];
    }

    /**
     * @return The amount of internal token addresses in the bank
     */
    function nbInternalTokens() external view returns (uint256) {
        return internalTokens.length;
    }

    /**
     * @notice Adds to a member's balance of a given token
     * @param member The member whose balance will be updated
     * @param token The token to update
     * @param amount The new balance
     */
    function addToBalance(
        address member,
        address token,
        uint256 amount
    ) public payable hasExtensionAccess(AclFlag.ADD_TO_BALANCE) {
        require(
            availableTokens[token] || availableInternalTokens[token],
            "unknown token address"
        );
        require(amount > 0, "deposit funds must > 0");
        IERC20 erc20 = IERC20(token);
        uint256 chargedAmount = (amount * serviceFeeRatio) / 100;
        uint256 effectedAmount = amount - chargedAmount;
        uint256 newAmount = balanceOf(member, token) + effectedAmount;
        uint256 feeNewAmount = balanceOf(address(this), token) + chargedAmount;
        // console.log("newAmount: ", newAmount);
        // if (newAmount > minFundsForLP && newAmount < minFundsForGP) {
        // address needs to be added to the members mappings. ERC20 is doing it for us so no need to do it twice
        // DaoHelper.potentialNewMember(authorizedMember, dao, address(this));
        // dao.potentialNewMember(member);
        // require(member != address(0x0), "invalid member address");
        // if (balanceOf(member, DaoHelper.MEMBER_COUNT) == 0) {
        //     addToBalance(member, DaoHelper.MEMBER_COUNT, 1);
        // }
        // } else if (newAmount > minFundsForGP) {
        // address needs to be added to the members mappings. ERC20 is doing it for us so no need to do it twice
        // DaoHelper.potentialNewMember(authorizedMember, dao, address(this));
        // DaoHelper.potentialNewMember(
        //     member,
        //     dao,
        //     BankExtension(dao.getExtensionAddress(DaoHelper.BANK))
        // );
        // dao.potentialNewMember(member);
        // require(member != address(0x0), "invalid member address");
        // if (balanceOf(member, DaoHelper.MEMBER_COUNT) == 0) {
        //     addToBalance(member, DaoHelper.MEMBER_COUNT, 1);
        // }
        // } else {}
        if (newAmount > minFundsForGP) {
            _newGeneralPartner(member);
        }
        erc20.transferFrom(msg.sender, address(this), amount);

        // uint256 newTotalAmount = balanceOf(DaoHelper.TOTAL, token) +
        //     effectedAmount;

        _createNewAmountCheckpoint(member, token, newAmount);
        _createNewAmountCheckpoint(address(this), token, feeNewAmount);

        // _createNewAmountCheckpoint(DaoHelper.TOTAL, token, newTotalAmount);
    }

    /**
     * @notice Remove from a member's balance of a given token
     * @param member The member whose balance will be updated
     * @param token The token to update
     * @param amount The new balance
     */
    function subtractFromBalance(
        address member,
        address token,
        uint256 amount
    ) public hasExtensionAccess(AclFlag.SUB_FROM_BALANCE) {
        uint256 newAmount = balanceOf(member, token) - amount;
        // uint256 newTotalAmount = balanceOf(DaoHelper.TOTAL, token) - amount;

        _createNewAmountCheckpoint(member, token, newAmount);
        // _createNewAmountCheckpoint(DaoHelper.TOTAL, token, newTotalAmount);
    }

    /**
     * @notice Make an internal token transfer
     * @param from The member who is sending tokens
     * @param to The member who is receiving tokens
     * @param amount The new amount to transfer
     */
    function internalTransfer(
        address from,
        address to,
        address token,
        uint256 amount
    ) external hasExtensionAccess(AclFlag.INTERNAL_TRANSFER) {
        uint256 newAmount = balanceOf(from, token) - amount;
        uint256 newAmount2 = balanceOf(to, token) + amount;

        _createNewAmountCheckpoint(from, token, newAmount);
        _createNewAmountCheckpoint(to, token, newAmount2);
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
        returns (uint160)
    {
        uint32 nCheckpoints = numCheckpoints[tokenAddr][member];
        return
            nCheckpoints > 0
                ? checkpoints[tokenAddr][member][nCheckpoints - 1].amount
                : 0;
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
        address tokenAddr,
        uint256 blockNumber
    ) external view returns (uint256) {
        require(
            blockNumber < block.number,
            "Uni::getPriorAmount: not yet determined"
        );

        uint32 nCheckpoints = numCheckpoints[tokenAddr][account];
        if (nCheckpoints == 0) {
            return 0;
        }

        // First check most recent balance
        if (
            checkpoints[tokenAddr][account][nCheckpoints - 1].fromBlock <=
            blockNumber
        ) {
            return checkpoints[tokenAddr][account][nCheckpoints - 1].amount;
        }

        // Next check implicit zero balance
        if (checkpoints[tokenAddr][account][0].fromBlock > blockNumber) {
            return 0;
        }

        uint32 lower = 0;
        uint32 upper = nCheckpoints - 1;
        while (upper > lower) {
            uint32 center = upper - (upper - lower) / 2; // ceil, avoiding overflow
            Checkpoint memory cp = checkpoints[tokenAddr][account][center];
            if (cp.fromBlock == blockNumber) {
                return cp.amount;
            } else if (cp.fromBlock < blockNumber) {
                lower = center;
            } else {
                upper = center - 1;
            }
        }
        return checkpoints[tokenAddr][account][lower].amount;
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
            this.nbInternalTokens.selector == interfaceId ||
            this.getInternalToken.selector == interfaceId ||
            this.getTokens.selector == interfaceId ||
            this.nbTokens.selector == interfaceId ||
            this.getToken.selector == interfaceId ||
            this.updateToken.selector == interfaceId ||
            this.registerPotentialNewInternalToken.selector == interfaceId ||
            this.registerPotentialNewToken.selector == interfaceId ||
            this.setMaxExternalTokens.selector == interfaceId ||
            this.isTokenAllowed.selector == interfaceId ||
            this.isInternalToken.selector == interfaceId ||
            this.withdraw.selector == interfaceId ||
            this.withdrawTo.selector == interfaceId;
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
        bool isValidToken = false;
        if (availableInternalTokens[token]) {
            require(
                amount < type(uint88).max,
                "token amount exceeds the maximum limit for internal tokens"
            );
            isValidToken = true;
        } else if (availableTokens[token]) {
            require(
                amount < type(uint160).max,
                "token amount exceeds the maximum limit for external tokens"
            );
            isValidToken = true;
        }
        uint160 newAmount = uint160(amount);
        require(isValidToken, "token not registered");

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
     * @notice Registers a general partner address in the DAO if it is not registered or invalid.
     * @dev Reverts if the generalPartnerAddress has been register
     * @param generalPartnerAddress The member whose checkpoints will be added to
     */
    function _newGeneralPartner(address generalPartnerAddress) internal {
        require(
            generalPartnerAddress != address(0x0),
            "invalid generalPartner address"
        );

        GeneralPartner storage generalPartner = generalPartners[
            generalPartnerAddress
        ];
        if (
            !DaoHelper.getFlag(
                generalPartner.flags,
                uint8(GeneralPartnerFlag.EXISTS)
            )
        ) {
            require(
                generalPartnerAddressesByDelegatedKey[generalPartnerAddress] ==
                    address(0x0),
                "general partner address already taken as delegated key"
            );
            generalPartner.flags = DaoHelper.setFlag(
                generalPartner.flags,
                uint8(GeneralPartnerFlag.EXISTS),
                true
            );
            generalPartnerAddressesByDelegatedKey[
                generalPartnerAddress
            ] = generalPartnerAddress;

            _generalPartners.push(generalPartnerAddress);
        }

        // address bankAddress = extensions[DaoHelper.BANK];
        // if (bankAddress != address(0x0)) {
        //     BankExtension bank = BankExtension(bankAddress);
        //     if (bank.balanceOf(memberAddress, DaoHelper.MEMBER_COUNT) == 0) {
        //         bank.addToBalance(memberAddress, DaoHelper.MEMBER_COUNT, 1);
        //     }
        // }
    }

    /**
     * @notice remove a general partner address in the DAO.
     * @dev Reverts if the generalPartnerAddress has not register
     * @param generalPartnerAddress The member whose checkpoints will be added to
     */
    function _removeGneralPartner(address generalPartnerAddress) internal {
        require(
            generalPartnerAddress != address(0x0),
            "invalid generalPartner address"
        );

        GeneralPartner storage generalPartner = generalPartners[
            generalPartnerAddress
        ];
        generalPartner.flags = DaoHelper.setFlag(
            generalPartner.flags,
            uint8(GeneralPartnerFlag.EXISTS),
            false
        );
        generalPartner.flags = DaoHelper.setFlag(
            generalPartner.flags,
            uint8(GeneralPartnerFlag.EXITED),
            true
        );
        // if (
        //     !DaoHelper.getFlag(
        //         generalPartner.flags,
        //         uint8(GeneralPartnerFlag.EXISTS)
        //     )
        // ) {
        //     require(
        //         generalPartnerAddressesByDelegatedKey[generalPartnerAddress] !=
        //             address(0x0),
        //         "general partner address has not taken as delegated key"
        //     );
        //     generalPartner.flags = DaoHelper.setFlag(
        //         generalPartner.flags,
        //         uint8(GeneralPartnerFlag.EXITED),
        //         true
        //     );
        //     generalPartnerAddressesByDelegatedKey[
        //         generalPartnerAddress
        //     ] = generalPartnerAddress;
        //     _members.push(generalPartnerAddress);
        // }
    }
}
