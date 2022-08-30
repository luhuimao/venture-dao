pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "../IExtension.sol";
import "../../guards/AdapterGuard.sol";
import "../../helpers/DaoHelper.sol";
import "../bank/Bank.sol";
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

contract FundingPoolExtension is IExtension, ERC165, ReentrancyGuard {
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
        SET_RICE_ADDRESS
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

    event ManagementFeeCharged(uint256 chargedTime, uint256 amount);
    enum FundRaiseState {
        IN_PROGRESS,
        DONE,
        FAILED
    }
    /*
     * STRUCTURES
     */

    struct FundRaise {
        FundRaiseState state;
    }

    struct Checkpoint {
        // A checkpoint for marking number of votes from a given block
        uint96 fromBlock;
        uint128 amount;
    }
    // struct Investor {
    //     // the structure to track all the investor  in the DAO
    //     uint256 flags; // flags to track the state of the investor: exists, etc
    // }
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
    uint256 public lastManagementFeeChargedTime;
    uint256 public chargedManagementFee;
    FundRaiseState public fundRaisingState;
    DaoRegistry public dao;

    address[] public tokens;
    // mapping(address => Investor) public investors;
    //address[] private _investors;
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

    /// @notice Clonable contract must have an empty constructor
    constructor() {}

    // slither-disable-next-line calls-loop
    /* ========== MODIFIERS ========== */

    // modifier updateReward(address account) {
    //     rewardPerTokenStored = rewardPerToken();
    //     lastUpdateTime = lastTimeRewardApplicable();
    //     if (account != address(0)) {
    //         rewards[account] = earned(account);
    //         userRewardPerTokenPaid[account] = rewardPerTokenStored;
    //     }
    //     _;
    // }
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

    modifier chargeManagedFee() {
        uint256 fundStartTime = dao.getConfiguration(DaoHelper.FUND_START_TIME);
        uint256 fundEndTime = dao.getConfiguration(DaoHelper.FUND_END_TIME);
        address tokenAddr = getFundRaisingTokenAddress();
        uint256 managementFee;
        uint256 yearPassed;
        if (
            block.timestamp > fundStartTime &&
            fundRaisingState == FundRaiseState.DONE
        ) {
            unchecked {
                yearPassed =
                    (block.timestamp - fundStartTime) /
                    DaoHelper.ONE_YEAR;
            }
            if (yearPassed <= 0) {
                // not one year but calculated in one year
                if (block.timestamp > fundEndTime) {
                    unchecked {
                        managementFee =
                            (totalSupply() *
                                dao.getConfiguration(
                                    DaoHelper.MANAGEMENT_FEE
                                )) /
                            100 -
                            chargedManagementFee;
                    }
                }
            } else {
                if (block.timestamp > fundEndTime) {
                    if (
                        fundEndTime -
                            (fundStartTime + yearPassed * DaoHelper.ONE_YEAR) >
                        0
                    ) {
                        unchecked {
                            managementFee =
                                (totalSupply() *
                                    dao.getConfiguration(
                                        DaoHelper.MANAGEMENT_FEE
                                    ) *
                                    (yearPassed + 1)) /
                                100 -
                                chargedManagementFee;
                        }
                    } else {
                        unchecked {
                            managementFee =
                                (totalSupply() *
                                    dao.getConfiguration(
                                        DaoHelper.MANAGEMENT_FEE
                                    ) *
                                    yearPassed +
                                    1) /
                                100 -
                                chargedManagementFee;
                        }
                    }
                } else {
                    unchecked {
                        managementFee =
                            (totalSupply() *
                                dao.getConfiguration(DaoHelper.MANAGEMENT_FEE) *
                                yearPassed) /
                            100 -
                            chargedManagementFee;
                    }
                }
            }
            if (managementFee > 0) {
                subtractAllFromBalance(tokenAddr, managementFee);
                IERC20(tokenAddr).safeTransfer(
                    dao.getAddressConfiguration(DaoHelper.GP_ADDRESS),
                    managementFee
                );
                chargedManagementFee += managementFee;
                emit ManagementFeeCharged(block.timestamp, managementFee);
            }
        }
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
        fundRaisingState = FundRaiseState.IN_PROGRESS;
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

    // function lastTimeRewardApplicable() public view returns (uint256) {
    //     return block.timestamp < periodFinish ? block.timestamp : periodFinish;
    // }

    // function rewardPerToken() public view returns (uint256) {
    //     if (totalSupply() == 0) {
    //         return rewardPerTokenStored;
    //     }
    //     return
    //         rewardPerTokenStored.add(
    //             lastTimeRewardApplicable()
    //                 .sub(lastUpdateTime)
    //                 .mul(rewardRate)
    //                 .mul(1e18)
    //                 .div(totalSupply())
    //         );
    // }

    // function earned(address account) public view returns (uint256) {
    //     return
    //         balanceOf(account, tokens[0])
    //             .mul(rewardPerToken().sub(userRewardPerTokenPaid[account]))
    //             .div(1e18)
    //             .add(rewards[account]);
    // }

    // function getRewardForDuration() external view returns (uint256) {
    //     return rewardRate.mul(rewardsDuration);
    // }

    /**
     * @return Whether or not a given address is a Investor of the DAO.
     * @param addr The address to look up
     */
    function isValidInvestor(address addr) public view returns (bool) {
        return _investors.contains(addr);
        // return getInvestorFlag(addr, InvestorFlag.EXISTS);
    }

    function ifInRedemption() public view returns (bool) {
        uint256 fundStartTime = dao.getConfiguration(DaoHelper.FUND_START_TIME);
        uint256 fundEndTime = dao.getConfiguration(DaoHelper.FUND_END_TIME);
        uint256 redemptionPeriod = dao.getConfiguration(
            DaoHelper.FUND_RAISING_REDEMPTION_PERIOD
        );
        uint256 fundDuration = fundEndTime - fundStartTime;
        DaoHelper.RedemptionType redemptionT = DaoHelper.RedemptionType(
            dao.getConfiguration(DaoHelper.FUND_RAISING_REDEMPTION)
        );
        uint256 steps;
        uint256 redemption;
        if (redemptionT == DaoHelper.RedemptionType.WEEKLY) {
            steps = fundDuration / DaoHelper.ONE_WEEK;
            redemption = DaoHelper.ONE_WEEK;
        }
        if (redemptionT == DaoHelper.RedemptionType.BI_WEEKLY) {
            steps = fundDuration / DaoHelper.TWO_WEEK;
            redemption = DaoHelper.TWO_WEEK;
        }
        if (redemptionT == DaoHelper.RedemptionType.MONTHLY) {
            steps = fundDuration / DaoHelper.ONE_MONTH;
            redemption = DaoHelper.ONE_MONTH;
        }
        if (redemptionT == DaoHelper.RedemptionType.QUARTERLY) {
            steps = fundDuration / DaoHelper.THREE_MONTH;
            steps = fundDuration / DaoHelper.THREE_MONTH;
        }
        uint256 redemptionEndTime;
        uint256 redemptionStartTime;
        uint256 i = 0;
        while (i <= steps) {
            redemptionEndTime = redemptionEndTime == 0
                ? fundStartTime + redemption
                : redemptionEndTime + redemption;
            redemptionStartTime = redemptionEndTime - redemptionPeriod;
            if (
                block.timestamp > redemptionStartTime &&
                block.timestamp < redemptionEndTime &&
                block.timestamp > fundStartTime &&
                block.timestamp < fundEndTime
            ) {
                return true;
            }
            i += 1;
        }
        return false;
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

    function processFundRaising()
        external
        chargeManagedFee
        nonReentrant
        returns (bool)
    {
        if (fundRaisingState != FundRaiseState.IN_PROGRESS) return false;

        if (
            dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_BEGIN) <
            block.timestamp &&
            dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END) >
            block.timestamp
        ) return false;

        if (
            totalSupply() < dao.getConfiguration(DaoHelper.FUND_RAISING_TARGET)
        ) {
            fundRaisingState = FundRaiseState.FAILED;
            return false;
        }
        address fundTokenAddr = getFundRaisingTokenAddress();
        //distribute protocol fee to DAOSquare
        uint256 protocolFee = (totalSupply() *
            dao.getConfiguration(DaoHelper.PROTOCOL_FEE)) / 100;
        // uint256 managedFee = (totalSupply() *
        //     dao.getConfiguration(DaoHelper.MANAGEMENT_FEE)) / 100;

        subtractAllFromBalance(fundTokenAddr, protocolFee);

        IERC20(fundTokenAddr).safeTransfer(
            address(dao.getAddressConfiguration(DaoHelper.DAO_SQUARE_ADDRESS)),
            protocolFee
        );

        // IERC20(fundTokenAddr).safeTransfer(
        //     address(dao.getAddressConfiguration(DaoHelper.GP_ADDRESS)),
        //     managedFee
        // );
        fundRaisingState = FundRaiseState.DONE;
        return true;
    }

    function chargeManagementFee()
        external
        chargeManagedFee
        nonReentrant
        returns (bool)
    {
        return true;
    }

    /**
     * @notice Adds to a member's balance of a given token
     * @param depositer The depositer whose balance will be updated
     * @param amount The new balance
     */
    function addToBalance(address depositer, uint256 amount)
        public
        chargeManagedFee
        nonReentrant
        hasExtensionAccess(AclFlag.ADD_TO_BALANCE)
    {
        require(
            dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_BEGIN) <
                block.timestamp &&
                dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END) >
                block.timestamp,
            "FundingPool::Deposit::not in fundraise window"
        );
        require(
            amount > 0 &&
                amount >=
                dao.getConfiguration(
                    DaoHelper.FUND_RAISING_MIN_INVESTMENT_AMOUNT_OF_LP
                ),
            "FundingPool::Deposit::invalid amount"
        );

        require(
            totalSupply() + amount <
                dao.getConfiguration(DaoHelper.FUND_RAISING_MAX),
            "FundingPool::Deposit::Fundraise max amount reach"
        );
        address fundTokenAddr = getFundRaisingTokenAddress();
        _newInvestor(depositer);
        IERC20 erc20 = IERC20(fundTokenAddr);

        uint256 totalGPFunds = balanceOf(address(DaoHelper.GP_POOL));
        uint256 validTotalFunds = balanceOf(
            address(DaoHelper.DAOSQUARE_TREASURY)
        );
        if (DaoHelper.ifGP(depositer, dao)) {
            _createNewAmountCheckpoint(
                address(DaoHelper.GP_POOL),
                fundTokenAddr,
                totalGPFunds + amount
            );
        }
        _createNewAmountCheckpoint(depositer, fundTokenAddr, amount);

        _createNewAmountCheckpoint(
            address(DaoHelper.DAOSQUARE_TREASURY),
            fundTokenAddr,
            validTotalFunds + amount
        );
        erc20.transferFrom(msg.sender, address(this), amount);
    }

    function withdraw(address recipientAddr, uint256 amount)
        external
        chargeManagedFee
        nonReentrant
        hasExtensionAccess(AclFlag.WITHDRAW)
    {
        require(
            fundRaisingState == FundRaiseState.FAILED ||
                (fundRaisingState == FundRaiseState.DONE && ifInRedemption()) ||
                (fundRaisingState == FundRaiseState.DONE &&
                    block.timestamp >
                    dao.getConfiguration(DaoHelper.FUND_END_TIME)),
            "FundingPool::Withdraw::Cant withdraw at this time"
        );
        address fundTokenAddr = getFundRaisingTokenAddress();
        require(
            balanceOf(recipientAddr) >= amount,
            "FundingPool::withdraw::not enough funds"
        );
        uint256 redemptionFee = 0;
        if (fundRaisingState == FundRaiseState.DONE && ifInRedemption()) {
            //distribute redemption fee to GP
            redemptionFee =
                (dao.getConfiguration(DaoHelper.REDEMPTION_FEE) * amount) /
                1000;
            IERC20(fundTokenAddr).safeTransfer(
                address(dao.getAddressConfiguration(DaoHelper.GP_ADDRESS)),
                redemptionFee
            );
        }

        subtractFromBalance(recipientAddr, fundTokenAddr, amount);

        IERC20(fundTokenAddr).safeTransfer(
            recipientAddr,
            amount - redemptionFee
        );

        //slither-disable-next-line reentrancy-events
        emit Withdraw(recipientAddr, fundTokenAddr, uint128(amount));
    }

    // function getReward(address recipientAddr)
    //     public
    //     nonReentrant
    //     updateReward(recipientAddr)
    //     hasExtensionAccess(AclFlag.GET_REWARDS)
    // {
    //     uint256 reward = rewards[recipientAddr];
    //     require(
    //         riceTokenAddress != address(0x0),
    //         "getReward::invalid rice address"
    //     );
    //     if (reward > 0) {
    //         rewards[recipientAddr] = 0;
    //         IERC20(riceTokenAddress).safeTransfer(recipientAddr, reward);
    //         emit RewardPaid(recipientAddr, reward);
    //     }
    // }

    // function exit(address recipientAddr) external {
    //     withdraw(_balances[recipientAddr]);
    //     getReward(recipientAddr);
    // }

    /* ========== RESTRICTED FUNCTIONS ========== */

    // function notifyRewardAmount(uint256 reward)
    //     external
    //     updateReward(address(0))
    //     hasExtensionAccess(AclFlag.NOTIFY_REWARD_AMOUNT)
    // {
    //     require(
    //         rewardsDuration > 0,
    //         "FundingPool Ext::notifyRewardAmount::rewardsDuration Invalid"
    //     );
    //     if (block.timestamp >= periodFinish) {
    //         rewardRate = reward.div(rewardsDuration);
    //     } else {
    //         uint256 remaining = periodFinish.sub(block.timestamp);
    //         uint256 leftover = remaining.mul(rewardRate);
    //         rewardRate = reward.add(leftover).div(rewardsDuration);
    //     }

    //     // Ensure the provided reward amount is not more than the balance in the contract.
    //     // This keeps the reward rate in the right range, preventing overflows due to
    //     // very high values of rewardRate in the earned and rewardsPerToken functions;
    //     // Reward + leftover must be less than 2^256 / 10^18 to avoid overflow.
    //     require(
    //         riceTokenAddress != address(0x0),
    //         "notifyRewardAmount::invalid rice address"
    //     );
    //     uint256 balance = IERC20(riceTokenAddress).balanceOf(address(this));
    //     require(
    //         rewardRate <= balance.div(rewardsDuration),
    //         "Provided reward too high"
    //     );
    //     lastUpdateTime = block.timestamp;
    //     periodFinish = block.timestamp.add(rewardsDuration);
    //     emit RewardAdded(reward);
    // }

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

    // function setRewardsDuration(uint256 _rewardsDuration)
    //     external
    //     hasExtensionAccess(AclFlag.SET_REWARDS_DURATION)
    // {
    //     require(
    //         block.timestamp > periodFinish,
    //         "Previous rewards period must be complete before changing the duration for the new period"
    //     );
    //     rewardsDuration = _rewardsDuration;
    //     emit RewardsDurationUpdated(rewardsDuration);
    // }

    function setRiceTokenAddress(address riceAddr)
        external
        hasExtensionAccess(AclFlag.SET_RICE_ADDRESS)
    {
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
            balanceOf(member) >= amount &&
                balanceOf(DaoHelper.DAOSQUARE_TREASURY) >= amount,
            "FundingPool::subtractFromBalance::Insufficient Fund"
        );
        uint256 newAmount = balanceOf(member) - amount;
        uint256 newTotalFund = balanceOf(DaoHelper.DAOSQUARE_TREASURY) - amount;
        _createNewAmountCheckpoint(
            DaoHelper.DAOSQUARE_TREASURY,
            token,
            newTotalFund
        );
        if (DaoHelper.ifGP(member, dao)) {
            uint256 totalGPFunds = balanceOf(address(DaoHelper.GP_POOL));
            uint256 newGPFunds;
            unchecked {
                newGPFunds = totalGPFunds - amount;
            }
            _createNewAmountCheckpoint(
                address(DaoHelper.GP_POOL),
                token,
                newGPFunds
            );
        }
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
        require(investorAddr != address(0x0), "invalid investor address");

        // Investor storage inverstor = investors[investorAddr];
        // if (!DaoHelper.getFlag(inverstor.flags, uint8(InvestorFlag.EXISTS))) {
        //     inverstor.flags = DaoHelper.setFlag(
        //         inverstor.flags,
        //         uint8(InvestorFlag.EXISTS),
        //         true
        //     );
        if (!_investors.contains(investorAddr)) {
            _investors.add(investorAddr);
        }
        // }
    }

    function _removeInvestor(address investorAddr) internal {
        require(investorAddr != address(0x0), "invalid generalPartner address");
        _investors.remove(investorAddr);
    }
}
