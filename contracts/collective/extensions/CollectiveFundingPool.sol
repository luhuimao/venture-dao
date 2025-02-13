pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../adapters/CollectiveFundingPoolAdapter.sol";
import "../../extensions/IExtension.sol";
import "../../guards/AdapterGuard.sol";
import "../../guards/MemberGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
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

    /// @dev - Events for Bank
    // event NewBalance(address member, uint160 amount);

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

    event RewardAdded(uint256 reward);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardsDurationUpdated(uint256 newDuration);
    event Recovered(address token, uint256 amount);
    event NewBalance(address member, address tokenAddr, uint128 amount);

    // event Withdraw(address account, address tokenAddr, uint128 amount);

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
        require(!initialized, "collective funding pool already initialized");
        require(_dao.isMember(creator), "collective funding pool::not member");
        dao = _dao;
        initialized = true;
    }

    function withdraw(
        address account,
        address tokenAddr,
        uint256 amount
    ) external hasExtensionAccess(AclFlag.WITHDRAW) {
        require(
            balanceOf(account) >= amount,
            "flex funding pool::withdraw::not enough funds"
        );
        // subtractFromBalance(account, tokenAddr, amount);

        IERC20(tokenAddr).safeTransfer(account, amount);

        //slither-disable-next-line reentrancy-events
        emit Withdraw(account, tokenAddr, uint160(amount));
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
        subtractFromBalance(memberFrom, tokenAddr, amount);
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
     * @param depositer The member whose balance will be updated
     * @param amount The token to update
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

    function addToBalance(
        address depositer,
        address fundTokenAddr,
        uint256 amount
    ) public hasExtensionAccess(AclFlag.ADD_TO_BALANCE) {
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

    /**
     * @notice Remove from a member's balance of a given token
     * @param member The member whose balance will be updated
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

        if (newAmount <= 9 && newAmount > 0) {
            newAmount = 0;
            newTotalFund =
                balanceOf(DaoHelper.DAOSQUARE_TREASURY) -
                balanceOf(member);
        }

        _createNewAmountCheckpoint(
            DaoHelper.DAOSQUARE_TREASURY,
            token,
            newTotalFund
        );
        _createNewAmountCheckpoint(member, token, newAmount);

        if (balanceOf(member) <= 0) {
            ColletiveFundingPoolAdapterContract(
                dao.getAdapterAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER
                )
            ).removeFundInvestorFromExtension(dao, member);
        }
    }

    function subtractAllFromBalance(
        address token,
        uint256 amount
    ) public hasExtensionAccess(AclFlag.SUB_FROM_BALANCE) {
        uint256 treasuryBalance = balanceOf(
            address(DaoHelper.DAOSQUARE_TREASURY)
        );
        address[] memory tem = investors.values();

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

    function balanceOfToken(
        address investorAddr,
        address token
    ) public view returns (uint256) {
        uint32 nCheckpoints = numCheckpoints[token][investorAddr];
        return
            nCheckpoints > 0
                ? checkpoints[token][investorAddr][nCheckpoints - 1].amount
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

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            super.supportsInterface(interfaceId) ||
            this.subtractFromBalance.selector == interfaceId ||
            // this.addToBalance.selector == interfaceId ||
            this.getPriorAmount.selector == interfaceId ||
            this.balanceOf.selector == interfaceId ||
            // this.internalTransfer.selector == interfaceId ||
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

    function isInvestor(address investorAddr) external view returns (bool) {
        return investors.contains(investorAddr);
    }

    function getInvestors() external view returns (address[] memory) {
        return investors.values();
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

    function getFundRaisingTokenAddress() public view returns (address) {
        return
            dao.getAddressConfiguration(
                DaoHelper.FUND_RAISING_CURRENCY_ADDRESS
            );
    }

    function totalSupply() public view returns (uint256) {
        return balanceOf(address(DaoHelper.DAOSQUARE_TREASURY));
    }
}
