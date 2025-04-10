pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../../core/DaoRegistry.sol";
import "../../../extensions/IExtension.sol";
import "../../../guards/AdapterGuard.sol";
import "../../../helpers/DaoHelper.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
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

contract VintageFundingPoolExtension is IExtension, ERC165, ReentrancyGuard {
    using Address for address payable;
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

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
        UNLOCK_PROJECT_TOKEN,
        GET_REWARDS,
        NOTIFY_REWARD_AMOUNT,
        RECOVER_ERC20,
        SET_REWARDS_DURATION,
        SET_RICE_ADDRESS,
        UPDATE_GP_BALANCE
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
    /* ========== EVENTS ========== */

    event RewardAdded(uint256 reward);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardsDurationUpdated(uint256 newDuration);
    event Recovered(address token, uint256 amount);
    event NewBalance(address member, address tokenAddr, uint128 amount);

    event Withdraw(address account, address tokenAddr, uint128 amount);

    event DistributeFund(
        address distributeTo,
        address tokenAddr,
        uint256 amount
    );

    event ManagementFeeCharged(
        uint256 chargedTime,
        address lpAddress,
        uint256 amount
    );

    event RedeptionFeeCharged(
        uint256 chargedTime,
        address lpAddress,
        uint256 amount
    );

    /*
     * STRUCTURES
     */

    struct FundRaise {
        DaoHelper.FundRaiseState state;
    }

    struct Checkpoint {
        // A checkpoint for marking number of votes from a given block
        uint96 fromBlock;
        uint128 amount;
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
    address public riceTokenAddress; // rice token contract address
    address public fundRaisingTokenAddress;
    /* ========== STATE VARIABLES ========== */
    uint256 public periodFinish = 0;
    uint256 public rewardRate = 0;
    uint256 public rewardsDuration = 604800; //7 days;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    // uint256 public lastManagementFeeChargedTime;
    // uint256 public chargedManagementFee;
    // DaoHelper.FundRaiseState public fundRaisingState;
    DaoRegistry public dao;

    address[] public tokens;
    EnumerableSet.AddressSet private _investors;
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

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    mapping(address => FundRaise) public fundRaises;
    // lpAddress => chargedManagementFee
    mapping(address => uint256) public lpChargedManagementFees;
    mapping(address => uint256) public lastLPChargedManagentFeeTime;

    /// @notice Clonable contract must have an empty constructor
    constructor() {}

    // slither-disable-next-line calls-loop
    /* ========== MODIFIERS ========== */
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
        votingWeightMultiplier = 1;
        votingWeightAddend = 0;
        votingWeightRadix = 2;
        initialized = true;
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

    /*
     * BANK
     */

    /**
     * Public read-only functions
     */

    function getFundRaisingTokenAddress() public view returns (address) {
        return
            dao.getAddressConfiguration(
                DaoHelper.FUND_RAISING_CURRENCY_ADDRESS
            );
    }

    function totalSupply() public view returns (uint256) {
        return balanceOf(address(DaoHelper.DAOSQUARE_TREASURY));
    }

    /**
     * @return Whether or not a given address is a Investor of the DAO.
     * @param addr The address to look up
     */
    function isValidInvestor(address addr) public view returns (bool) {
        return _investors.contains(addr);
        // return getInvestorFlag(addr, InvestorFlag.EXISTS);
    }

    /**
     * Internal bookkeeping
     */

    /**
     * @return The amount of internal token addresses in the bank
     */
    function getInvestors() external view returns (address[] memory) {
        return _investors.values();
    }

    /**
     * @notice Adds to a member's balance of a given token
     * @param depositer The depositer whose balance will be updated
     * @param amount The new balance
     */
    function addToBalance(
        address depositer,
        uint256 amount
    ) public hasExtensionAccess(AclFlag.ADD_TO_BALANCE) {
        address fundTokenAddr = getFundRaisingTokenAddress();
        _newInvestor(depositer);
        IERC20 erc20 = IERC20(fundTokenAddr);
        uint256 oldBal = balanceOf(depositer);
        uint256 totalGPFunds = balanceOf(address(DaoHelper.GP_POOL));
        uint256 validTotalFunds = balanceOf(
            address(DaoHelper.DAOSQUARE_TREASURY)
        );
        if (dao.isMember(depositer)) {
            _createNewAmountCheckpoint(
                address(DaoHelper.GP_POOL),
                fundTokenAddr,
                totalGPFunds + amount
            );
        }
        _createNewAmountCheckpoint(depositer, fundTokenAddr, oldBal + amount);

        _createNewAmountCheckpoint(
            address(DaoHelper.DAOSQUARE_TREASURY),
            fundTokenAddr,
            validTotalFunds + amount
        );
        erc20.transferFrom(msg.sender, address(this), amount);
    }

    function withdraw(
        address recipientAddr,
        uint256 amount
    ) external hasExtensionAccess(AclFlag.WITHDRAW) {
        address fundTokenAddr = getFundRaisingTokenAddress();
        uint256 actualWithdrawAmount = amount;
        if (balanceOf(recipientAddr) < amount) {
            actualWithdrawAmount = balanceOf(recipientAddr);
        }

        IERC20(fundTokenAddr).safeTransfer(recipientAddr, actualWithdrawAmount);

        //slither-disable-next-line reentrancy-events
        emit Withdraw(
            recipientAddr,
            fundTokenAddr,
            uint128(actualWithdrawAmount)
        );
    }

    /* ========== RESTRICTED FUNCTIONS ========== */
    // Added to support recovering LP Rewards from other systems such as BAL to be distributed to holders
    function recoverERC20(
        address tokenAddress,
        uint256 tokenAmount,
        address recipientAddress
    ) external hasExtensionAccess(AclFlag.RECOVER_ERC20) {
        require(tokenAddress != tokens[0], "Cannot withdraw the staking token");
        IERC20(tokenAddress).safeTransfer(recipientAddress, tokenAmount);
        emit Recovered(tokenAddress, tokenAmount);
    }

    function setRiceTokenAddress(
        address riceAddr
    ) external hasExtensionAccess(AclFlag.SET_RICE_ADDRESS) {
        require(
            riceAddr != address(0x0),
            "FundingPoolExt::setRiceTokenAddress::invalid rice address"
        );
        riceTokenAddress = riceAddr;
    }

    function distributeFunds(
        address recipientAddr,
        address tokenAddr,
        uint256 amount
    ) external hasExtensionAccess(AclFlag.DISTRIBUTE_FUNDS) {
        require(amount > 0, "FundingPool::distributeFunds::amount must > 0");
        uint256 exactAmount = amount;
        // require(
        //     IERC20(tokenAddr).balanceOf(address(this)) >= amount,
        //     "FundingPool::distributeFunds::insufficient fund"
        // );
        if (amount > IERC20(tokenAddr).balanceOf(address(this))) {
            exactAmount = IERC20(tokenAddr).balanceOf(address(this));
        }
        IERC20(tokenAddr).safeTransfer(recipientAddr, exactAmount);

        emit DistributeFund(recipientAddr, tokenAddr, exactAmount);
    }

    function distributeProtocolFee(
        address target,
        address tokenAddr,
        uint256 amount
    ) external hasExtensionAccess(AclFlag.DISTRIBUTE_FUNDS) returns (bool) {
        require(amount > 0, "FundingPool::distributeFunds::amount must > 0");
        uint256 exactAmount = amount;

        if (amount > IERC20(tokenAddr).balanceOf(address(this))) {
            exactAmount = IERC20(tokenAddr).balanceOf(address(this));
        }
        IERC20(tokenAddr).approve(target, exactAmount);

        (bool success, ) = target.call(
            abi.encodeWithSignature(
                "receiveProtocolFee(address,uint256,address,address)",
                tokenAddr,
                exactAmount,
                address(dao),
                dao.getAddressConfiguration(DaoHelper.RICE_REWARD_RECEIVER)
            )
        );
        emit DistributeFund(target, tokenAddr, exactAmount);

        return success;
    }

    function updateTotalGPsBalance(
        address token,
        uint256 amount,
        uint8 updateType
    ) external hasExtensionAccess(AclFlag.UPDATE_GP_BALANCE) {
        uint256 oldGPsBalance = balanceOf(address(DaoHelper.GP_POOL));
        uint256 newGPsBalance;
        // 1: sub 2: add
        if (updateType == 1) {
            newGPsBalance = oldGPsBalance - amount;
        }
        if (updateType == 2) {
            newGPsBalance = oldGPsBalance + amount;
        }
        _createNewAmountCheckpoint(DaoHelper.GP_POOL, token, newGPsBalance);
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
            balanceOf(member) >= amount &&
                balanceOf(DaoHelper.DAOSQUARE_TREASURY) >= balanceOf(member),
            "FundingPool::subtractFromBalance::Insufficient Fund"
        );
        uint256 newAmount = balanceOf(member) - amount;
        uint256 newTotalFund = balanceOf(DaoHelper.DAOSQUARE_TREASURY) - amount;
        uint256 totalGPFunds = balanceOf(address(DaoHelper.GP_POOL));

        if (newAmount <= 9 && newAmount > 0) {
            newAmount = 0;
            newTotalFund =
                balanceOf(DaoHelper.DAOSQUARE_TREASURY) -
                balanceOf(member);
        }

        if (dao.isMember(member)) {
            // uint256 totalGPFunds = balanceOf(address(DaoHelper.GP_POOL));
            uint256 newGPFunds = totalGPFunds;
            if (totalGPFunds >= amount) {
                newGPFunds = totalGPFunds - amount;
                if (
                    balanceOf(member) - amount <= 9 &&
                    balanceOf(member) - amount > 0 &&
                    totalGPFunds >= balanceOf(member)
                ) {
                    newGPFunds = totalGPFunds - balanceOf(member);
                }
            }

            // unchecked {
            //     newGPFunds = totalGPFunds - amount;
            // }
            _createNewAmountCheckpoint(
                address(DaoHelper.GP_POOL),
                token,
                newGPFunds
            );
        }
        if (newAmount <= 0) {
            _removeInvestor(member);
        }
        _createNewAmountCheckpoint(
            DaoHelper.DAOSQUARE_TREASURY,
            token,
            newTotalFund
        );
        _createNewAmountCheckpoint(member, token, newAmount);
    }

    /**
     * @notice Remove from a all investor's balance of a given token
     * @param token The token to update
     * @param amount The token amount distribute to a project team
     */
    function subtractAllFromBalance(
        address token,
        uint256 amount
    )
        public
        hasExtensionAccess(AclFlag.SUB_FROM_BALANCE)
        returns (address[] memory)
    {
        uint256 treasuryBalance = balanceOf(
            address(DaoHelper.DAOSQUARE_TREASURY)
        );
        address[] memory tem = _investors.values();
        for (uint8 i = 0; i < tem.length; i++) {
            address investorAddr = tem[i];
            if (balanceOf(investorAddr) > 0) {
                subtractFromBalance(
                    investorAddr,
                    token,
                    (amount * balanceOf(investorAddr)) / treasuryBalance
                );
            }
        }

        return tem;
    }

    /**
     * @notice Returns an member's balance of a given token
     * @param investorAddr The address to look up
     * @return The amount in account's tokenAddr balance
     */
    function balanceOf(address investorAddr) public view returns (uint256) {
        address fundTokenaddr = getFundRaisingTokenAddress();
        uint32 nCheckpoints = numCheckpoints[fundTokenaddr][investorAddr];
        return
            nCheckpoints > 0
                ? checkpoints[fundTokenaddr][investorAddr][nCheckpoints - 1]
                    .amount
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
        // bool isValidToken = false;
        // if (token != address(0x0)) {
        //     require(
        //         amount < type(uint128).max,
        //         "token amount exceeds the maximum limit for external tokens"
        //     );
        //     isValidToken = true;
        // }
        uint128 newAmount = uint128(amount);
        // require(isValidToken, "token not registered");

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
        require(
            investorAddr != address(0x0),
            "FundingPool::_newInvestor::invalid investor address"
        );
        if (!_investors.contains(investorAddr)) {
            _investors.add(investorAddr);
        }
    }

    function _removeInvestor(address investorAddr) internal {
        require(
            investorAddr != address(0x0),
            "FundingPool::_removeInvestor::invalid investorAddr address"
        );
        _investors.remove(investorAddr);
    }

    function investorAmount() external view returns (uint256) {
        return _investors.length();
    }

    function isInvestor(address account) external view returns (bool) {
        return _investors.contains(account);
    }
}
