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

contract FundingPoolExtension is IExtension, ERC165 {
    using Address for address payable;
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    enum AclFlag {
        ADD_TO_BALANCE,
        SUB_FROM_BALANCE,
        WITHDRAW,
        REGISTER_NEW_TOKEN,
        DISTRIBUTE_FUNDS,
        SET_SNAP_FUNDS,
        SET_PROJECT_SNAP_FUNDS,
        SET_PROJECT_SNAP_RICE,
        UNLOCK_PROJECT_TOKEN
    }
    enum InvestorFlag {
        EXISTS,
        EXITED
    }

    modifier noProposal() {
        require(dao.lockedAt() < block.number, "proposal lock");
        _;
    }

    /// @dev - Events for FundingPool
    event NewBalance(address member, address tokenAddr, uint128 amount);

    event Withdraw(address account, address tokenAddr, uint128 amount);

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
        uint128 amount;
    }
    struct Investor {
        // the structure to track all the investor  in the DAO
        uint256 flags; // flags to track the state of the investor: exists, etc
    }
    /*
     * PUBLIC VARIABLES
     */
    uint8 public maxExternalTokens; // the maximum number of external tokens that can be stored in the bank
    uint256 public serviceFeeRatio; //service fee ratio
    uint256 public projectSnapFunds; //
    uint256 public projectSnapRice; //
    uint256 public snapFunds; // the maximum accepting funds during voting
    uint128 public votingWeightRadix; //decimal, default is 1
    uint128 public votingWeightMultiplier; //   decimal, default is 1
    uint128 public votingWeightAddend; //decimal, default is 0
    bool public initialized = false; // internally tracks deployment under eip-1167 proxy pattern

    DaoRegistry public dao;

    address[] public tokens;
    mapping(address => Investor) public investors;
    address[] private _investors;
    // tokenAddress => availability
    mapping(address => bool) public availableTokens;
    // tokenAddress => memberAddress => checkpointNum => Checkpoint
    mapping(address => mapping(address => mapping(uint32 => Checkpoint)))
        public checkpoints;
    // tokenAddress => memberAddress => numCheckpoints
    mapping(address => mapping(address => uint32)) public numCheckpoints;

    // tokenAddress => treasuryAddress => checkpointNum => Checkpoint
    mapping(address => mapping(address => mapping(uint32 => Checkpoint)))
        public feeCheckpoints;

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
        // initialized = true;

        votingWeightMultiplier = 1;
        votingWeightAddend = 0;
        votingWeightRadix = 2;
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
     * @param weightRadix The maximum amount of token allowed
     */
    function setVotingWeightRadix(uint128 weightRadix) external {
        require(!initialized, "founding pool already initialized");

        votingWeightRadix = weightRadix;
    }

    /**
     * @notice Sets the maximum amount of external tokens allowed in the founding pool
     * @param tokenAddr The maximum amount of token allowed
     */
    function setSnapFunds(address tokenAddr)
        external
        hasExtensionAccess(AclFlag.SET_SNAP_FUNDS)
    {
        snapFunds = balanceOf(address(DaoHelper.DAOSQUARE_TREASURY), tokenAddr);
    }

    /**
     * @notice Reset the maximum amount of external tokens allowed in the founding pool
     */
    function resetSnapFunds()
        external
        hasExtensionAccess(AclFlag.SET_SNAP_FUNDS)
    {
        snapFunds = 0;
    }

    /**
     * @notice Sets projectSnapFunds to current total funds
     * @param tokenAddr The maximum amount of token allowed
     */
    function setProjectSnapFunds(address tokenAddr)
        external
        hasExtensionAccess(AclFlag.SET_PROJECT_SNAP_FUNDS)
    {
        require(
            availableTokens[tokenAddr],
            "FundingPool::setProjectSnapRice::unknown deposit token address"
        );

        projectSnapFunds = balanceOf(
            address(DaoHelper.DAOSQUARE_TREASURY),
            tokenAddr
        );
    }

    /**
     * @notice Sets projectSnapRice to current total rice
     * @param riceAddr The rice token address
     */
    function setProjectSnapRice(address riceAddr)
        external
        hasExtensionAccess(AclFlag.SET_PROJECT_SNAP_RICE)
    {
        require(
            availableTokens[riceAddr],
            "FundingPool::setProjectSnapRice::unknown rice token address"
        );

        projectSnapRice = balanceOf(
            address(DaoHelper.DAOSQUARE_TREASURY),
            riceAddr
        );
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
     * Public read-only functions
     */

    /**
     * @return Whether or not a flag is set for a given investor
     * @param investorAddress The investor to check against flag
     * @param flag The flag to check in the investor
     */
    function getInvestorFlag(address investorAddress, InvestorFlag flag)
        public
        view
        returns (bool)
    {
        return DaoHelper.getFlag(investors[investorAddress].flags, uint8(flag));
    }

    /**
     * @return Whether or not a given address is a general partner of the DAO.
     * @dev it will resolve by delegate key, not member address.
     * @param addr The address to look up
     */
    function isValidInvestor(address addr) public view returns (bool) {
        return getInvestorFlag(addr, InvestorFlag.EXISTS);
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
     * @return The amount of internal token addresses in the bank
     */
    function getInvestors() external view returns (address[] memory) {
        return _investors;
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
            availableTokens[token],
            "FundingPool::addToBalance::unknown token address"
        );
        require(
            amount > 0,
            "FundingPool::addToBalance::deposit funds must > 0"
        );
        //While begins a vote, set snapFunds = totalFunds,
        //as an investor, you can still withdraw your balance;
        // by doing that, there’ll be a room made in totalFunds so anyone could deposit funds to fill it until totalFunds reaches snapFunds.
        if (
            snapFunds > 0 &&
            balanceOf(address(DaoHelper.DAOSQUARE_TREASURY), token) >= snapFunds
        ) {
            revert("FundingPool::addToBalance::total funds exceed snap funds");
        }
        _newInvestor(member);
        IERC20 erc20 = IERC20(token);
        uint256 chargedAmount = (amount * serviceFeeRatio) / 100;
        uint256 effectedAmount = amount - chargedAmount;
        uint256 newAmount = balanceOf(member, token) + effectedAmount;
        uint256 feeNewAmount = balanceOf(
            address(DaoHelper.DAOSQUARE_FUNDS),
            token
        ) + chargedAmount;
        uint256 totalFunds = balanceOf(
            address(DaoHelper.DAOSQUARE_TREASURY),
            token
        ) + effectedAmount;

        erc20.transferFrom(msg.sender, address(this), amount);

        _createNewAmountCheckpoint(member, token, newAmount);
        _createNewAmountCheckpoint(
            address(DaoHelper.DAOSQUARE_FUNDS),
            token,
            feeNewAmount
        );

        _createNewAmountCheckpoint(
            address(DaoHelper.DAOSQUARE_TREASURY),
            token,
            totalFunds
        );
    }

    function withdraw(
        address recipientAddr,
        address tokenAddr,
        uint256 amount
    ) external hasExtensionAccess(AclFlag.WITHDRAW) {
        require(
            balanceOf(recipientAddr, tokenAddr) >= amount,
            "FundingPool::withdraw::not enough funds"
        );
        subtractFromBalance(recipientAddr, tokenAddr, amount);

        IERC20(tokenAddr).safeTransfer(recipientAddr, amount);

        //slither-disable-next-line reentrancy-events
        emit Withdraw(recipientAddr, tokenAddr, uint128(amount));
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
        require(
            balanceOf(member, token) >= amount &&
                balanceOf(DaoHelper.DAOSQUARE_TREASURY, token) >= amount,
            "FundingPool::subtractFromBalance::Insufficient Fund"
        );
        uint256 newAmount = balanceOf(member, token) - amount;
        uint256 newTotalFund = balanceOf(DaoHelper.DAOSQUARE_TREASURY, token) -
            amount;
        _createNewAmountCheckpoint(
            DaoHelper.DAOSQUARE_TREASURY,
            token,
            newTotalFund
        );
        if (newAmount <= 0) {
            _removeInvestor(member);
        }
        _createNewAmountCheckpoint(member, token, newAmount);
    }

    /**
     * @notice Remove from a all investor's balance of a given token
     * @param token The token to update
     * @param amount The token amount distribute to a project team
     */
    function subtractAllFromBalance(address token, uint256 amount)
        public
        hasExtensionAccess(AclFlag.SUB_FROM_BALANCE)
    {
        uint256 treasuryBalance = balanceOf(
            address(DaoHelper.DAOSQUARE_TREASURY),
            token
        );
        for (uint8 i = 0; i < _investors.length; i++) {
            address investorAddr = _investors[i];
            if (
                DaoHelper.getFlag(
                    investors[investorAddr].flags,
                    uint8(InvestorFlag.EXISTS)
                ) && balanceOf(investorAddr, token) > 0
            ) {
                subtractFromBalance(
                    investorAddr,
                    token,
                    (amount * balanceOf(investorAddr, token)) / treasuryBalance
                );
            }
        }
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
    ) external view returns (uint128) {
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
        if (availableTokens[token]) {
            require(
                amount < type(uint128).max,
                "token amount exceeds the maximum limit for external tokens"
            );
            isValidToken = true;
        }
        uint128 newAmount = uint128(amount);
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

    function _newInvestor(address investorAddr) internal {
        require(investorAddr != address(0x0), "invalid investor address");

        Investor storage inverstor = investors[investorAddr];
        if (!DaoHelper.getFlag(inverstor.flags, uint8(InvestorFlag.EXISTS))) {
            inverstor.flags = DaoHelper.setFlag(
                inverstor.flags,
                uint8(InvestorFlag.EXISTS),
                true
            );

            _investors.push(investorAddr);
        }
    }

    function _removeInvestor(address investorAddr) internal {
        require(investorAddr != address(0x0), "invalid generalPartner address");

        Investor storage investor = investors[investorAddr];
        investor.flags = DaoHelper.setFlag(
            investor.flags,
            uint8(InvestorFlag.EXISTS),
            false
        );
        investor.flags = DaoHelper.setFlag(
            investor.flags,
            uint8(InvestorFlag.EXITED),
            true
        );
    }
}
