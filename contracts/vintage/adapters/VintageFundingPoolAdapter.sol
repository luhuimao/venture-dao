pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "../../core/DaoRegistry.sol";
import "../extensions/fundingpool/VintageFundingPool.sol";
import "../../helpers/DaoHelper.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "./VintageFundRaise.sol";
import "./VintageEscrowFund.sol";
import "./VintageFreeInFundEscrow.sol";
import "./VintageFundingPoolAdapterHelper.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
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

contract VintageFundingPoolAdapterContract is
    AdapterGuard,
    MemberGuard,
    Reimbursable
{
    using EnumerableSet for EnumerableSet.AddressSet;

    /* ========== STATE VARIABLES ========== */
    // DaoHelper.FundRaiseState public fundRaisingState;
    mapping(address => DaoHelper.FundRaiseState) public daoFundRaisingStates;
    mapping(address => EnumerableSet.AddressSet) investorMembershipWhiteList;
    mapping(address => mapping(uint256 => EnumerableSet.AddressSet)) fundInvestors;
    mapping(address => mapping(bytes32 => uint256))
        public freeINPriorityDeposits; // dao=>new fund proposalid => amount
    mapping(address => mapping(bytes32 => mapping(address => bool)))
        public priorityDepositers;
    mapping(address => mapping(bytes32 => mapping(address => uint256)))
        public depositInFundRaising;
    mapping(address => mapping(bytes32 => uint256))
        public fundRaisingByFundRaisePId;
    uint256 public protocolFee = (3 * 1e18) / 1000; // 0.3%

    error MAX_PATICIPANT_AMOUNT_REACH();
    error ERC20_REQUIRMENT();
    error ERC721_REQUIRMENT();
    error ERC1155_REQUIRMENT();
    error WHITELIST_REQUIRMENT();
    error ACCESS_DENIED();
    error INVALID_AMOUNT();
    error INSUFFICIENT_BALANCE();
    error LESS_THAN_MIN_DEPOSIT_AMOUNT();
    error GREATER_THAN_MAX_DEPOSIT_AMOUNT();
    error NOT_IN_FUND_RAISING_WINDOW();
    error GREATER_THAN_MAX_FUND_RAISING_AMOUNT();
    error INSUFFICIENT_ALLOWANCE();
    error NOT_NOW();

    // event OwnerChanged(address oldOwner, address newOwner);
    event Deposit(address daoAddress, uint256 amount, address account);
    event WithDraw(address daoAddress, uint256 amount, address account);
    event RedeptionFeeCharged(
        address dao,
        address account,
        uint256 redempAmount,
        uint256 redemptionFee
    );
    event ProcessFundRaise(
        address dao,
        uint256 fundRound,
        uint256 fundRaiseState,
        uint256 fundRaisedAmount
    );
    event ClearFund(address dao, uint256 amount, address executor);

    /// @dev Prevents calling a function from anyone except the address returned by owner
    modifier onlyDaoFactoryOwner(DaoRegistry dao) {
        require(msg.sender == DaoHelper.daoFactoryAddress(dao));
        _;
    }
    modifier investorMembershipCheck(DaoRegistry dao, address account) {
        if (
            dao.getConfiguration(
                DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_ENABLE
            ) == 1
        ) {
            uint256 itype = dao.getConfiguration(
                DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_TYPE
            ); //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS
            address token = dao.getAddressConfiguration(
                DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS
            );
            uint256 minHolding = dao.getConfiguration(
                DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_MIN_HOLDING
            );
            // uint256 tokenId = dao.getConfiguration(
            //     DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_TOKENID
            // );
            if (itype == 0 && IERC20(token).balanceOf(account) < minHolding) {
                revert ERC20_REQUIRMENT();
            } else if (
                itype == 1 && IERC721(token).balanceOf(account) < minHolding
            ) {
                revert ERC721_REQUIRMENT();
            } else if (
                itype == 2 &&
                IERC1155(token).balanceOf(
                    account,
                    dao.getConfiguration(
                        DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_TOKENID
                    )
                ) <
                minHolding
            ) {
                revert ERC1155_REQUIRMENT();
            } else if (
                itype == 3 && !ifInvestorMembershipWhiteList(dao, account)
            ) {
                revert WHITELIST_REQUIRMENT();
            }
            // else {}
        }
        _;
    }

    function setProtocolFee(
        DaoRegistry dao,
        uint256 feeProtocol
    ) external reentrancyGuard(dao) onlyDaoFactoryOwner(dao) {
        require(feeProtocol < 1e18 && feeProtocol > 0);
        protocolFee = feeProtocol;
    }

    function registerInvestorWhiteList(
        DaoRegistry dao,
        address account
    ) external {
        if (
            msg.sender !=
            dao.getAdapterAddress(
                DaoHelper.VINTAGE_FUND_RAISE_HELPER_ADAPTER
            ) &&
            !DaoHelper.isInCreationModeAndHasAccess(dao)
        ) revert ACCESS_DENIED();
        if (!investorMembershipWhiteList[address(dao)].contains(account)) {
            investorMembershipWhiteList[address(dao)].add(account);
        }
    }

    function clearInvestorWhitelist(DaoRegistry dao) external {
        if (
            msg.sender !=
            dao.getAdapterAddress(DaoHelper.VINTAGE_DAO_SET_HELPER_ADAPTER)
        ) revert ACCESS_DENIED();

        uint256 len = investorMembershipWhiteList[address(dao)].values().length;
        // address[] memory tem;
        address[] memory tem = investorMembershipWhiteList[address(dao)]
            .values();
        if (len > 0) {
            for (uint8 i = 0; i < len; i++) {
                investorMembershipWhiteList[address(dao)].remove(tem[i]);
            }
        }
    }

    struct withdrawLocalVars {
        DaoHelper.FundRaiseState fundRaiseState;
        uint256 fundRaiseEnd;
        uint256 fundRaiseBegin;
        VintageFundingPoolExtension fundingpool;
        address tokenAddr;
        // uint256 redemptionFee;
        bytes32 fundRaiseProposalId;
        VintageFundRaiseAdapterContract fundRaiseContract;
    }

    /**
     * @notice Allows the member/advisor of the DAO to withdraw the funds from their internal foundingpool account.
     * @notice Only accounts that are not reserved can withdraw the funds.
     * @notice If theres is no available balance in the user's account, the transaction is reverted.
     * @param dao The DAO address.
     * @param amount The amount to withdraw.
     */
    function withdraw(
        DaoRegistry dao,
        uint256 amount
    ) external reimbursable(dao) {
        withdrawLocalVars memory vars;
        processFundRaise(dao);
        //1. during fund raising 2. after fund raising end and failed 3. fund raising succeed and in redempte period
        //4. during refund term
        vars.fundRaiseState = daoFundRaisingStates[address(dao)];
        vars.fundRaiseEnd = dao.getConfiguration(
            DaoHelper.FUND_RAISING_WINDOW_END
        );
        vars.fundRaiseBegin = dao.getConfiguration(
            DaoHelper.FUND_RAISING_WINDOW_BEGIN
        );
        bool ifInRedemptionPeriod = VintageFundingPoolAdapterHelperContract(
            dao.getAdapterAddress(
                DaoHelper.VINTAGE_INVESTMENT_POOL_HELPER_ADAPT
            )
        ).ifInRedemptionPeriod(dao, block.timestamp);
        require(
            (vars.fundRaiseState == DaoHelper.FundRaiseState.IN_PROGRESS &&
                block.timestamp < vars.fundRaiseEnd &&
                block.timestamp > vars.fundRaiseBegin) ||
                vars.fundRaiseState == DaoHelper.FundRaiseState.FAILED ||
                (vars.fundRaiseState == DaoHelper.FundRaiseState.DONE &&
                    ifInRedemptionPeriod) ||
                (vars.fundRaiseState == DaoHelper.FundRaiseState.DONE &&
                    block.timestamp >
                    dao.getConfiguration(DaoHelper.FUND_END_TIME) &&
                    block.timestamp <
                    dao.getConfiguration(DaoHelper.FUND_END_TIME) +
                        dao.getConfiguration(DaoHelper.RETURN_DURATION)),
            "!withdraw"
        );
        vars.fundingpool = VintageFundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_EXT)
        );

        vars.tokenAddr = vars.fundingpool.getFundRaisingTokenAddress();
        // uint256 balance = balanceOf(dao, msg.sender);
        // require(amount > 0, "!amount");
        if (amount <= 0) revert INVALID_AMOUNT();
        // require(amount <= balance, ">balance");
        if (amount > balanceOf(dao, msg.sender)) revert INSUFFICIENT_BALANCE();
        uint256 redemptionFee = 0;
        if (
            vars.fundRaiseState == DaoHelper.FundRaiseState.DONE &&
            ifInRedemptionPeriod
        ) {
            //distribute redemption fee redemption fee receiver
            redemptionFee =
                (dao.getConfiguration(DaoHelper.REDEMPTION_FEE) * amount) /
                1e18;

            if (redemptionFee > 0)
                vars.fundingpool.distributeFunds(
                    address(
                        dao.getAddressConfiguration(
                            DaoHelper.REDEMPTION_FEE_RECEIVER
                        )
                    ),
                    vars.tokenAddr,
                    redemptionFee
                );
            emit RedeptionFeeCharged(
                address(dao),
                msg.sender,
                amount,
                redemptionFee
            );
        }

        vars.fundingpool.withdraw(msg.sender, amount - redemptionFee);

        vars.fundingpool.subtractFromBalance(
            msg.sender,
            vars.tokenAddr,
            amount
        );
        vars.fundRaiseContract = VintageFundRaiseAdapterContract(
            dao.getAdapterAddress(DaoHelper.VINTAGE_FUND_RAISE_ADAPTER)
        );
        vars.fundRaiseProposalId = vars.fundRaiseContract.lastProposalIds(
            address(dao)
        );
        if (
            block.timestamp < vars.fundRaiseEnd &&
            block.timestamp > vars.fundRaiseBegin
        ) {
            depositInFundRaising[address(dao)][vars.fundRaiseProposalId][
                msg.sender
            ] -= amount;

            fundRaisingByFundRaisePId[address(dao)][
                vars.fundRaiseProposalId
            ] -= amount;
        }

        if (balanceOf(dao, msg.sender) <= 0) {
            // uint256 fundRoundCounter = fundRaiseContract.createdFundCounter(
            //     address(dao)
            // );
            _removeFundInvestor(
                dao,
                msg.sender,
                vars.fundRaiseContract.createdFundCounter(address(dao))
            );
        }
        if (
            priorityDepositers[address(dao)][vars.fundRaiseProposalId][
                msg.sender
            ] && block.timestamp < vars.fundRaiseEnd
        )
            freeINPriorityDeposits[address(dao)][
                vars.fundRaiseProposalId
            ] -= amount;

        emit WithDraw(address(dao), amount - redemptionFee, msg.sender);
    }

    function clearFund(DaoRegistry dao) public reimbursable(dao) {
        DaoHelper.FundRaiseState fundRaiseState = daoFundRaisingStates[
            address(dao)
        ];
        require(
            (fundRaiseState == DaoHelper.FundRaiseState.FAILED &&
                block.timestamp >
                dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END)) ||
                // + dao.getConfiguration(DaoHelper.RETURN_DURATION)
                (fundRaiseState == DaoHelper.FundRaiseState.DONE &&
                    block.timestamp >
                    dao.getConfiguration(DaoHelper.FUND_END_TIME) +
                        dao.getConfiguration(DaoHelper.RETURN_DURATION)),
            "!clearFund"
        );
        VintageFundingPoolExtension fundingpool = VintageFundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_EXT)
        );

        address tokenAddr = fundingpool.getFundRaisingTokenAddress();
        address[] memory allInvestors = fundingpool.getInvestors();

        // VintageFundRaiseAdapterContract fundRaiseContract = VintageFundRaiseAdapterContract(
        //         dao.getAdapterAddress(DaoHelper.VINTAGE_FUND_RAISE_ADAPTER)
        //     );
        // uint256 fundRoundCounter = fundRaiseContract.createdFundCounter(
        //     address(dao)
        // );
        if (allInvestors.length > 0) {
            uint256 escrwoAmount = 0;
            for (uint8 i = 0; i < allInvestors.length; i++) {
                uint256 bal = balanceOf(dao, allInvestors[i]);
                if (bal > 0) {
                    VintageEscrowFundAdapterContract escrowFundAdapter = VintageEscrowFundAdapterContract(
                            dao.getAdapterAddress(
                                DaoHelper.VINTAGE_ESCROW_FUND_ADAPTER
                            )
                        );
                    //1. escrow Fund From Liquidation
                    // escrowFundAdapter.escrowFundFromFundingPool(
                    //     dao,
                    //     fundRoundCounter,
                    //     tokenAddr,
                    //     allInvestors[i],
                    //     bal
                    // );
                    if (fundRaiseState == DaoHelper.FundRaiseState.FAILED) {
                        escrowFundAdapter.escrowFundFromFailedFundRaising(
                            dao,
                            dao.getCurrentFundEstablishmentProposalId(),
                            tokenAddr,
                            allInvestors[i],
                            bal
                        );
                    } else {
                        escrowFundAdapter.escrowFundFromLiquidation(
                            dao,
                            dao.getCurrentFundEstablishmentProposalId(),
                            tokenAddr,
                            allInvestors[i],
                            bal
                        );

                        daoFundRaisingStates[address(dao)] = DaoHelper
                            .FundRaiseState
                            .NOT_STARTED;
                    }
                    //2. send fund to escrow fund contract
                    fundingpool.distributeFunds(
                        dao.getAdapterAddress(
                            DaoHelper.VINTAGE_ESCROW_FUND_ADAPTER
                        ),
                        tokenAddr,
                        bal
                    );
                    //3. subtract from funding pool
                    fundingpool.subtractFromBalance(
                        allInvestors[i],
                        tokenAddr,
                        bal
                    );
                    escrwoAmount += bal;
                }
            }

            emit ClearFund(address(dao), escrwoAmount, msg.sender);
        }
    }

    struct DepostLocalVars {
        uint256 maxDepositAmount;
        uint256 minDepositAmount;
        uint256 fundRaiseCap;
        VintageFundingPoolExtension fundingpool;
        VintageFundRaiseAdapterContract fundRaiseContract;
        uint256 fundRounds;
        bytes32 fundRaisePId;
    }

    /**
     * @notice Allows anyone to deposit the funds to foundingpool.
     * @notice Only accounts that are not reserved can withdraw the funds.
     * @notice If theres is no available balance in the user's account, the transaction is reverted.
     * @param dao The DAO address.
     * @param amount The amount user depoist to foundingpool.
     */
    function deposit(
        DaoRegistry dao,
        uint256 amount
    ) external reimbursable(dao) investorMembershipCheck(dao, msg.sender) {
        if (amount <= 0) revert INVALID_AMOUNT();
        DepostLocalVars memory vars;
        vars.maxDepositAmount = dao.getConfiguration(
            DaoHelper.FUND_RAISING_MAX_INVESTMENT_AMOUNT_OF_LP
        );
        vars.minDepositAmount = dao.getConfiguration(
            DaoHelper.FUND_RAISING_MIN_INVESTMENT_AMOUNT_OF_LP
        );
        vars.fundRaiseCap = dao.getConfiguration(DaoHelper.FUND_RAISING_MAX);

        if (
            vars.minDepositAmount > 0 &&
            amount + balanceOf(dao, msg.sender) < vars.minDepositAmount
        ) revert LESS_THAN_MIN_DEPOSIT_AMOUNT();

        if (
            vars.maxDepositAmount > 0 &&
            amount + balanceOf(dao, msg.sender) > vars.maxDepositAmount
        ) revert GREATER_THAN_MAX_DEPOSIT_AMOUNT();

        if (
            dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_BEGIN) >=
            block.timestamp ||
            dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END) <=
            block.timestamp
        ) revert NOT_IN_FUND_RAISING_WINDOW();

        if (
            dao.getConfiguration(DaoHelper.VINTAGE_FUNDRAISE_STYLE) == 0 &&
            vars.fundRaiseCap > 0
        ) {
            //FCFS
            if (poolBalance(dao) + amount > vars.fundRaiseCap)
                revert GREATER_THAN_MAX_FUND_RAISING_AMOUNT();
        }

        vars.fundingpool = VintageFundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_EXT)
        );
        // max investor check
        vars.fundRaiseContract = VintageFundRaiseAdapterContract(
            dao.getAdapterAddress(DaoHelper.VINTAGE_FUND_RAISE_ADAPTER)
        );
        vars.fundRounds = vars.fundRaiseContract.createdFundCounter(
            address(dao)
        );
        // investor cap
        if (
            dao.getConfiguration(DaoHelper.MAX_INVESTORS_ENABLE) == 1 &&
            fundInvestors[address(dao)][vars.fundRounds].length() >=
            dao.getConfiguration(DaoHelper.MAX_INVESTORS) &&
            !fundInvestors[address(dao)][vars.fundRounds].contains(msg.sender)
        ) revert MAX_PATICIPANT_AMOUNT_REACH();
        address token = vars.fundingpool.getFundRaisingTokenAddress();
        if (IERC20(token).balanceOf(msg.sender) < amount)
            revert INSUFFICIENT_BALANCE();

        if (IERC20(token).allowance(msg.sender, address(this)) < amount)
            revert INSUFFICIENT_ALLOWANCE();
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        IERC20(token).approve(
            dao.getExtensionAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_EXT),
            amount
        );
        vars.fundingpool.addToBalance(msg.sender, amount);
        _addFundInvestor(dao, msg.sender, vars.fundRounds);
        vars.fundRaisePId = vars.fundRaiseContract.lastProposalIds(
            address(dao)
        );

        depositInFundRaising[address(dao)][vars.fundRaisePId][
            msg.sender
        ] += amount;

        fundRaisingByFundRaisePId[address(dao)][vars.fundRaisePId] += amount;

        if (
            vars.fundRaiseContract.isPriorityDepositer(
                dao,
                vars.fundRaisePId,
                msg.sender
            )
        ) {
            freeINPriorityDeposits[address(dao)][vars.fundRaisePId] += amount;

            priorityDepositers[address(dao)][vars.fundRaisePId][
                msg.sender
            ] = true;
        }

        emit Deposit(address(dao), amount, msg.sender);
    }

    function processFundRaise(DaoRegistry dao) public returns (bool) {
        // uint256 fundRaiseTarget = dao.getConfiguration(
        //     DaoHelper.FUND_RAISING_TARGET
        // );
        // uint256 fundRaiseEndTime = dao.getConfiguration(
        //     DaoHelper.FUND_RAISING_WINDOW_END
        // );
        VintageFundRaiseAdapterContract fundRaiseContract = VintageFundRaiseAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_FUND_RAISE_ADAPTER)
            );

        // DaoHelper.FundRaiseState fundRaiseState = daoFundRaisingStates[
        //     address(dao)
        // ];
        bool fundRaiseSuceed;
        if (
            block.timestamp >
            dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END) &&
            daoFundRaisingStates[address(dao)] ==
            DaoHelper.FundRaiseState.IN_PROGRESS
        ) {
            if (
                dao.getConfiguration(DaoHelper.VINTAGE_VOTING_ASSET_TYPE) ==
                4 &&
                DaoHelper.getAllGorvernorBalance(dao) <= 0
            ) {
                // daoFundRaisingStates[address(dao)] = DaoHelper
                //     .FundRaiseState
                //     .FAILED;

                // clearFund(dao);

                // fundRaiseContract.setProposalState(
                //     dao,
                //     fundRaiseContract.lastProposalIds(address(dao)),
                //     false
                // );
                fundRaiseSuceed = false;
            } else {
                if (
                    poolBalance(dao) >=
                    dao.getConfiguration(DaoHelper.FUND_RAISING_TARGET)
                ) {
                    dao.setConfiguration(
                        DaoHelper.FUND_START_TIME,
                        block.timestamp
                    );
                    dao.setConfiguration(
                        DaoHelper.FUND_END_TIME,
                        block.timestamp +
                            dao.getConfiguration(DaoHelper.FUND_TERM) //proposalInfo.timesInfo.fundTerm
                    );

                    escorwExtraFreeInFund(dao);

                    // daoFundRaisingStates[address(dao)] = DaoHelper
                    //     .FundRaiseState
                    //     .DONE;

                    // fundRaiseContract.setProposalState(
                    //     dao,
                    //     fundRaiseContract.lastProposalIds(address(dao)),
                    //     true
                    // );
                    fundRaiseSuceed = true;
                } else {
                    // daoFundRaisingStates[address(dao)] = DaoHelper
                    //     .FundRaiseState
                    //     .FAILED;

                    // clearFund(dao);

                    // fundRaiseContract.setProposalState(
                    //     dao,
                    //     fundRaiseContract.lastProposalIds(address(dao)),
                    //     false
                    // );

                    fundRaiseSuceed = false;
                }
            }

            fundRaiseContract.setProposalState(
                dao,
                fundRaiseContract.lastProposalIds(address(dao)),
                fundRaiseSuceed
            );
            if (fundRaiseSuceed == false) {
                daoFundRaisingStates[address(dao)] = DaoHelper
                    .FundRaiseState
                    .FAILED;

                clearFund(dao);
            } else
                daoFundRaisingStates[address(dao)] = DaoHelper
                    .FundRaiseState
                    .DONE;

            emit ProcessFundRaise(
                address(dao),
                fundRaiseContract.createdFundCounter(address(dao)),
                uint256(daoFundRaisingStates[address(dao)]),
                poolBalance(dao)
            );
        }
        return true;
    }

    function resetFundRaiseState(DaoRegistry dao) external {
        if (
            msg.sender !=
            dao.getAdapterAddress(DaoHelper.VINTAGE_FUND_RAISE_ADAPTER)
        ) revert ACCESS_DENIED();

        daoFundRaisingStates[address(dao)] = DaoHelper
            .FundRaiseState
            .IN_PROGRESS;
    }

    struct EscrowFreeInFundLocalVars {
        VintageFundingPoolExtension fundingpool;
        uint256 extraFund;
        address tokenAddr;
        VintageFundRaiseAdapterContract fundRaiseContract;
        uint256 fundRoundCounter;
        VintageFreeInEscrowFundAdapterContract freeInEscrowFundAdapter;
        // VintageEscrowFundAdapterContract escrowFundAdaptContr;
        uint256 maxFund;
        uint256 priorityFunds;
        uint256 poolFunds;
        bytes32 fundRaiseProposalId;
        uint256 bal;
        bool ifpriorityDepositer;
    }

    function escorwExtraFreeInFund(DaoRegistry dao) internal {
        EscrowFreeInFundLocalVars memory vars;
        vars.poolFunds = poolBalance(dao);

        if (
            dao.getConfiguration(DaoHelper.VINTAGE_FUNDRAISE_STYLE) == 1 && //
            vars.poolFunds > dao.getConfiguration(DaoHelper.FUND_RAISING_MAX)
        ) {
            vars.fundingpool = VintageFundingPoolExtension(
                dao.getExtensionAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_EXT)
            );
            address[] memory allInvestors = vars.fundingpool.getInvestors();
            vars.extraFund = 0;
            vars.tokenAddr = vars.fundingpool.getFundRaisingTokenAddress();

            vars.maxFund = dao.getConfiguration(DaoHelper.FUND_RAISING_MAX);
            vars.fundRaiseProposalId = VintageFundRaiseAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_FUND_RAISE_ADAPTER)
            ).lastProposalIds(address(dao));
            vars.priorityFunds = freeINPriorityDeposits[address(dao)][
                vars.fundRaiseProposalId
            ];
            for (uint8 i = 0; i < allInvestors.length; i++) {
                vars.bal = balanceOf(dao, allInvestors[i]);
                vars.ifpriorityDepositer = priorityDepositers[address(dao)][
                    vars.fundRaiseProposalId
                ][allInvestors[i]];

                if (vars.priorityFunds >= vars.maxFund) {
                    if (vars.ifpriorityDepositer) {
                        vars.extraFund =
                            vars.bal -
                            (vars.bal * vars.maxFund) /
                            vars.priorityFunds;
                    } else vars.extraFund = vars.bal;
                } else {
                    if (vars.ifpriorityDepositer) vars.extraFund = 0;
                    else {
                        vars.extraFund =
                            vars.bal -
                            (vars.bal * (vars.maxFund - vars.priorityFunds)) /
                            (vars.poolFunds - vars.priorityFunds);
                    }
                }

                if (vars.extraFund > 0) {
                    //1. escrow Fund From Over Raised
                    VintageEscrowFundAdapterContract(
                        dao.getAdapterAddress(
                            DaoHelper.VINTAGE_ESCROW_FUND_ADAPTER
                        )
                    ).escrowFundFromOverRaised(
                            dao,
                            dao.getCurrentFundEstablishmentProposalId(),
                            vars.tokenAddr,
                            allInvestors[i],
                            vars.extraFund
                        );
                    //2. send fund to free in escrow fund contract
                    vars.fundingpool.distributeFunds(
                        dao.getAdapterAddress(
                            DaoHelper.VINTAGE_ESCROW_FUND_ADAPTER
                        ),
                        vars.tokenAddr,
                        vars.extraFund
                    );
                    vars.fundingpool.subtractFromBalance(
                        allInvestors[i],
                        vars.tokenAddr,
                        vars.extraFund
                    );
                }
            }
        }
    }

    function _addFundInvestor(
        DaoRegistry dao,
        address account,
        uint256 fundRound
    ) internal {
        if (!fundInvestors[address(dao)][fundRound].contains(account))
            fundInvestors[address(dao)][fundRound].add(account);
    }

    function _removeFundInvestor(
        DaoRegistry dao,
        address account,
        uint256 fundRound
    ) internal {
        fundInvestors[address(dao)][fundRound].remove(account);
    }

    function balanceOf(
        DaoRegistry dao,
        address investorAddr
    ) public view returns (uint256) {
        // VintageFundingPoolExtension fundingpool = VintageFundingPoolExtension(
        //     dao.getExtensionAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_EXT)
        // );
        return
            VintageFundingPoolExtension(
                dao.getExtensionAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_EXT)
            ).balanceOf(investorAddr);
    }

    function poolBalance(DaoRegistry dao) public view returns (uint256) {
        // VintageFundingPoolExtension fundingpool = VintageFundingPoolExtension(
        //     dao.getExtensionAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_EXT)
        // );
        return
            VintageFundingPoolExtension(
                dao.getExtensionAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_EXT)
            ).balanceOf(address(DaoHelper.DAOSQUARE_TREASURY));
    }

    function governorBalance(DaoRegistry dao) public view returns (uint256) {
        // VintageFundingPoolExtension fundingpool = VintageFundingPoolExtension(
        //     dao.getExtensionAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_EXT)
        // );
        return
            VintageFundingPoolExtension(
                dao.getExtensionAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_EXT)
            ).balanceOf(address(DaoHelper.GP_POOL));
    }

    function getInvestorMembershipWhiteList(
        DaoRegistry dao
    ) public view returns (address[] memory) {
        return investorMembershipWhiteList[address(dao)].values();
    }

    function ifInvestorMembershipWhiteList(
        DaoRegistry dao,
        address account
    ) public view returns (bool) {
        return investorMembershipWhiteList[address(dao)].contains(account);
    }

    function getFundInvestors(
        DaoRegistry dao,
        uint256 fundRound
    ) external view returns (address[] memory) {
        return fundInvestors[address(dao)][fundRound].values();
    }
}
