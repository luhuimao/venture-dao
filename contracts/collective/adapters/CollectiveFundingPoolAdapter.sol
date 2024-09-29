pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "../../core/DaoRegistry.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "../extensions/CollectiveFundingPool.sol";
import "./CollectiveFundingProposalAdapter.sol";
import "./CollectiveEscrowFundAdapter.sol";
import "./CollectiveFreeInFundEscrowAdapter.sol";
import "./CollectiveFundRaiseProposalAdapter.sol";
import "./CollectiveRedemptionFeeEscrowAdapter.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract ColletiveFundingPoolAdapterContract is Reimbursable {
    using EnumerableSet for EnumerableSet.AddressSet;

    event Deposit(address daoAddress, uint256 amount, address account);
    event WithDraw(address daoAddress, uint256 amount, address account);

    event DistributeRedemptionFee(
        address daoAddress,
        address account,
        uint256 receivedAmount
    );
    event ProcessFundRaise(
        address daoAddress,
        FundState state,
        uint256 totalRaised
    );
    event ClearFund(address daoAddress, uint256 escrowAmount, address executer);

    error MAX_PATICIPANT_AMOUNT_REACH();
    error INVESTMENT_GRACE_PERIOD();
    error FUNDRAISE_ENDTIME_NOT_UP();
    error EXECUTED_ALREADY();
    error NOT_CLEAR_FUND_TIME();
    error ACCESS_DENIED();
    error INSUFFICIENT_FUND();
    error INSUFFICIENT_ALLOWANCE();
    error LESS_MIN_DEPOSIT_AMOUNT();
    error GREATER_MAX_DEPOSIT_AMOUNT();
    error GREATER_MAX_FUND_RAISE_AMOUNT();
    error NOT_IN_FUND_RAISE_WINDOW();
    error INVALID_AMOUNT();
    error AMOUNT_EXCEED_FUND_RAISING_DEPOSIT();

    mapping(address => EnumerableSet.AddressSet) fundInvestors;
    mapping(address => mapping(bytes32 => EnumerableSet.AddressSet)) investorsByFundRaise;
    mapping(address => mapping(bytes32 => mapping(address => uint256)))
        public investorsDepositAmountByFundRaise;
    mapping(address => FundState) public fundState;
    mapping(address => uint256) public accumulateRaiseAmount;
    mapping(address => uint256) public resetFundStateBlockNum;
    mapping(address => mapping(bytes32 => uint256))
        public freeINPriorityDeposits; // dao=>new fund proposalid => amount
    mapping(address => mapping(bytes32 => uint256))
        public fundRaisedByProposalId;
    mapping(address => mapping(bytes32 => mapping(address => bool)))
        public priorityDepositers;
    mapping(address => uint256) public liquidationId;
    mapping(bytes32 => mapping(address => uint256)) public graceWithdrawAmount;

    uint256 public protocolFee = (3 * 1e18) / 1000; // 0.3%

    enum FundState {
        NOT_STARTED,
        IN_PROGRESS,
        DONE,
        FAILED
    }
    modifier onlyDaoFactoryOwner(DaoRegistry dao) {
        require(msg.sender == DaoHelper.daoFactoryAddress(dao));
        _;
    }

    function setProtocolFee(
        DaoRegistry dao,
        uint256 feeProtocol
    ) external reimbursable(dao) onlyDaoFactoryOwner(dao) {
        require(feeProtocol < 1e18 && feeProtocol > 0);
        protocolFee = feeProtocol;
    }

    function withdraw(
        DaoRegistry dao,
        uint256 amount
    ) external reimbursable(dao) {
        //investment grace period

        if (
            !ColletiveFundingProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUNDING_ADAPTER)
            ).isPrposalInGracePeriod(dao)
        ) {
            revert INVESTMENT_GRACE_PERIOD();
        } else {
            bytes32 investmentProposalId = ColletiveFundingProposalAdapterContract(
                    dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUNDING_ADAPTER)
                ).ongoingProposal(address(dao));
            graceWithdrawAmount[investmentProposalId][msg.sender] += amount;
        }

        CollectiveInvestmentPoolExtension fundingpool = CollectiveInvestmentPoolExtension(
                dao.getExtensionAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT
                )
            );

        ColletiveFundRaiseProposalAdapterContract fundRaiseContract = ColletiveFundRaiseProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUND_RAISE_ADAPTER)
            );

        bytes32 lastFundRaiseProposalId = fundRaiseContract.lastProposalIds(
            address(dao)
        );

        address tokenAddr = fundingpool.getFundRaisingTokenAddress();
        if (amount <= 0) revert INVALID_AMOUNT();
        if (amount > balanceOf(dao, msg.sender)) revert INSUFFICIENT_FUND();

        if (
            block.timestamp >
            dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_BEGIN) &&
            block.timestamp <
            dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END)
        ) {
            if (
                investorsDepositAmountByFundRaise[address(dao)][
                    lastFundRaiseProposalId
                ][msg.sender] < amount
            ) revert AMOUNT_EXCEED_FUND_RAISING_DEPOSIT();
            else {
                investorsDepositAmountByFundRaise[address(dao)][
                    lastFundRaiseProposalId
                ][msg.sender] -= amount;

                fundRaisedByProposalId[address(dao)][
                    lastFundRaiseProposalId
                ] -= amount;
            }
        }

        uint256 redemptionFee;

        if (
            block.timestamp >
            dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END)
        ) {
            redemptionFee =
                (amount *
                    dao.getConfiguration(
                        DaoHelper.COLLECTIVE_REDEMPT_FEE_AMOUNT
                    )) /
                1e18;
        }

        fundingpool.withdraw(msg.sender, tokenAddr, amount - redemptionFee);
        fundingpool.subtractFromBalance(msg.sender, tokenAddr, amount);
        if (balanceOf(dao, msg.sender) <= 0) {
            _removeFundInvestor(dao, msg.sender);
            investorsByFundRaise[address(dao)][lastFundRaiseProposalId].remove(
                msg.sender
            );
        }
        if (redemptionFee > 0)
            escrowRedemptionFee(dao, tokenAddr, redemptionFee); //  distributeRedemptionFee(dao, tokenAddr, redemptionFee);

        if (
            priorityDepositers[address(dao)][lastFundRaiseProposalId][
                msg.sender
            ] &&
            block.timestamp <
            dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END)
        )
            freeINPriorityDeposits[address(dao)][
                lastFundRaiseProposalId
            ] -= amount;

        emit WithDraw(address(dao), amount - redemptionFee, msg.sender);
    }

    struct DepostLocalVars {
        uint256 maxDepositAmount;
        uint256 minDepositAmount;
        uint256 fundRaiseCap;
        // uint256 fundRounds;
        CollectiveInvestmentPoolExtension fundingpool;
        ColletiveFundRaiseProposalAdapterContract fundRaiseContract;
    }

    function deposit(
        DaoRegistry dao,
        uint256 amount
    ) external reimbursable(dao) {
        if (amount <= 0) revert INVALID_AMOUNT();

        DepostLocalVars memory vars;
        vars.fundRaiseContract = ColletiveFundRaiseProposalAdapterContract(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUND_RAISE_ADAPTER)
        );

        vars.maxDepositAmount = dao.getConfiguration(
            DaoHelper.FUND_RAISING_MAX_INVESTMENT_AMOUNT_OF_LP
        );
        vars.minDepositAmount = dao.getConfiguration(
            DaoHelper.FUND_RAISING_MIN_INVESTMENT_AMOUNT_OF_LP
        );

        bytes32 fundRaiseProposalId = vars.fundRaiseContract.lastProposalIds(
            address(dao)
        );

        vars.fundRaiseCap = dao.getConfiguration(DaoHelper.FUND_RAISING_MAX);
        if (vars.minDepositAmount > 0) {
            if (amount < vars.minDepositAmount)
                revert LESS_MIN_DEPOSIT_AMOUNT();
        }
        if (vars.maxDepositAmount > 0) {
            if (
                amount +
                    investorsDepositAmountByFundRaise[address(dao)][
                        fundRaiseProposalId
                    ][msg.sender] >
                vars.maxDepositAmount
            ) revert GREATER_MAX_DEPOSIT_AMOUNT();
        }

        if (
            dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_BEGIN) >
            block.timestamp ||
            dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END) <
            block.timestamp
        ) revert NOT_IN_FUND_RAISE_WINDOW();

        if (
            dao.getConfiguration(DaoHelper.COLLECTIVE_FUNDRAISE_STYLE) == 0 &&
            vars.fundRaiseCap > 0
        ) {
            //FCFS
            if (
                fundRaisedByProposalId[address(dao)][fundRaiseProposalId] +
                    amount >
                vars.fundRaiseCap
            ) revert GREATER_MAX_FUND_RAISE_AMOUNT();
        }

        vars.fundingpool = CollectiveInvestmentPoolExtension(
            dao.getExtensionAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT)
        );
        // investor cap
        if (memberCapCheck(dao, fundRaiseProposalId, msg.sender))
            revert MAX_PATICIPANT_AMOUNT_REACH();

        address token = vars.fundingpool.getFundRaisingTokenAddress();
        if (IERC20(token).balanceOf(msg.sender) < amount)
            revert INSUFFICIENT_FUND();

        if (IERC20(token).allowance(msg.sender, address(this)) < amount)
            revert INSUFFICIENT_ALLOWANCE();

        IERC20(token).transferFrom(msg.sender, address(this), amount);
        IERC20(token).approve(
            dao.getExtensionAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT),
            amount
        );
        vars.fundingpool.addToBalance(msg.sender, amount);
        _addFundInvestor(dao, msg.sender);

        if (
            !investorsByFundRaise[address(dao)][fundRaiseProposalId].contains(
                msg.sender
            )
        )
            investorsByFundRaise[address(dao)][fundRaiseProposalId].add(
                msg.sender
            );

        if (
            vars.fundRaiseContract.isPriorityDepositer(
                dao,
                fundRaiseProposalId,
                msg.sender
            )
        ) {
            freeINPriorityDeposits[address(dao)][fundRaiseProposalId] += amount;
            priorityDepositers[address(dao)][fundRaiseProposalId][
                msg.sender
            ] = true;
        }

        investorsDepositAmountByFundRaise[address(dao)][fundRaiseProposalId][
            msg.sender
        ] += amount;

        fundRaisedByProposalId[address(dao)][fundRaiseProposalId] += amount;
        emit Deposit(address(dao), amount, msg.sender);
    }

    function memberCapCheck(
        DaoRegistry dao,
        bytes32 fundRaiseProposalId,
        address account
    ) internal view returns (bool) {
        uint256 count = dao.getAllSteward().length +
            investorsByFundRaise[address(dao)][fundRaiseProposalId]
                .values()
                .length;
        address[] memory newMem = investorsByFundRaise[address(dao)][
            fundRaiseProposalId
        ].values();
        if (newMem.length > 0) {
            for (uint8 i = 0; i < newMem.length; i++) {
                if (dao.isMember(newMem[i])) count -= 1;
            }
        }

        if (
            dao.getConfiguration(DaoHelper.MAX_INVESTORS_ENABLE) == 1 &&
            count >= dao.getConfiguration(DaoHelper.MAX_INVESTORS) &&
            !dao.isMember(account) &&
            !investorsByFundRaise[address(dao)][fundRaiseProposalId].contains(
                account
            )
        ) return true;

        return false;
    }

    function returnFundToQuitGovernor(
        DaoRegistry dao,
        address account,
        bool redempitonFee
    ) external returns (bool) {
        if (balanceOf(dao, account) <= 0) return false;

        if (
            msg.sender !=
            dao.getAdapterAddress(
                DaoHelper.COLLECTIVE_GOVERNOR_MANAGEMENT_ADAPTER
            )
        ) revert ACCESS_DENIED();

        uint256 depositedBal = balanceOf(dao, account);
        uint256 redemptionFeeAmount;
        if (redempitonFee) {
            redemptionFeeAmount =
                (depositedBal *
                    dao.getConfiguration(
                        DaoHelper.COLLECTIVE_REDEMPT_FEE_AMOUNT
                    )) /
                1e18;
        }

        CollectiveInvestmentPoolExtension fundingpoolExt = CollectiveInvestmentPoolExtension(
                dao.getExtensionAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT
                )
            );
        address tokenAddr = fundingpoolExt.getFundRaisingTokenAddress();
        fundingpoolExt.withdraw(
            account,
            tokenAddr,
            depositedBal - redemptionFeeAmount
        );
        fundingpoolExt.subtractFromBalance(account, tokenAddr, depositedBal);
        _removeFundInvestor(dao, account);

        if (redemptionFeeAmount > 0)
            escrowRedemptionFee(dao, tokenAddr, redemptionFeeAmount); //  distributeRedemptionFee(dao, tokenAddr, redemptionFee);

        return true;
    }

    function clearFund(DaoRegistry dao) public {
        if (
            msg.sender !=
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_CLEAR_FUND_ADAPTER)
        ) revert ACCESS_DENIED();

        if (
            block.timestamp <
            dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END) &&
            (fundState[address(dao)] == FundState.NOT_STARTED ||
                fundState[address(dao)] == FundState.IN_PROGRESS)
        ) revert NOT_CLEAR_FUND_TIME();

        CollectiveInvestmentPoolExtension fundingpool = CollectiveInvestmentPoolExtension(
                dao.getExtensionAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT
                )
            );

        address tokenAddr = fundingpool.getFundRaisingTokenAddress();
        address[] memory allInvestors = fundInvestors[address(dao)].values();

        if (allInvestors.length > 0) {
            uint256 escrwoAmount = 0;
            liquidationId[address(dao)] += 1;

            for (uint8 i = 0; i < allInvestors.length; i++) {
                uint256 bal = balanceOf(dao, allInvestors[i]);
                if (bal > 0) {
                    CollectiveEscrowFundAdapterContract escrowFundAdapter = CollectiveEscrowFundAdapterContract(
                            dao.getAdapterAddress(
                                DaoHelper.COLLECTIVE_ESCROW_FUND_ADAPTER
                            )
                        );
                    //1. escrow Fund From Funding Pool
                    escrowFundAdapter.escrowFundFromLiquidation(
                        dao,
                        tokenAddr,
                        allInvestors[i],
                        bal,
                        liquidationId[address(dao)]
                    );
                    //2. send fund to escrow fund contract
                    fundingpool.distributeFunds(
                        dao.getAdapterAddress(
                            DaoHelper.COLLECTIVE_ESCROW_FUND_ADAPTER
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

                _removeFundInvestor(dao, allInvestors[i]);
            }

            fundState[address(dao)] = FundState.NOT_STARTED;
            emit ClearFund(address(dao), escrwoAmount, msg.sender);
        }
    }

    function _addFundInvestor(DaoRegistry dao, address account) internal {
        if (!fundInvestors[address(dao)].contains(account))
            fundInvestors[address(dao)].add(account);
    }

    function _removeFundInvestor(DaoRegistry dao, address account) internal {
        fundInvestors[address(dao)].remove(account);

        if (dao.isMember(account) && dao.daoCreator() != account)
            dao.removeMember(account);
    }

    function _addNewMembers(
        DaoRegistry dao,
        bytes32 fundRaiseProposalId
    ) internal {
        address[] memory allInvestors = investorsByFundRaise[address(dao)][
            fundRaiseProposalId
        ].values();

        if (allInvestors.length > 0) {
            for (uint8 i = 0; i < allInvestors.length; i++) {
                if (!dao.isMember(allInvestors[i]))
                    dao.potentialNewMember(allInvestors[i]);
            }
        }
    }

    function escrowRedemptionFee(
        DaoRegistry dao,
        address tokenAddr,
        uint256 amount
    ) internal {
        address contAddr = dao.getAdapterAddress(
            DaoHelper.COLLECTIVE_REDEMPTION_FEE_ESCROW_ADAPTER
        );
        CollectiveRedemptionFeeEscrowAdapterContract contr = CollectiveRedemptionFeeEscrowAdapterContract(
                contAddr
            );

        CollectiveInvestmentPoolExtension fundingpool = CollectiveInvestmentPoolExtension(
                dao.getExtensionAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT
                )
            );

        contr.escrowRedemptionFee(dao, block.number, tokenAddr, amount);

        fundingpool.distributeFunds(contAddr, tokenAddr, amount);
    }

    function resetFundRaiseState(DaoRegistry dao) external {
        if (
            msg.sender !=
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUND_RAISE_ADAPTER)
        ) revert ACCESS_DENIED();

        fundState[address(dao)] = FundState.IN_PROGRESS;

        accumulateRaiseAmount[address(dao)] += poolBalance(dao);
        // accumulateRaiseAmount[
        //     address(dao)
        // ] += CollectiveInvestmentPoolExtension(
        //     dao.getExtensionAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT)
        // ).balanceOf(address(DaoHelper.DAOSQUARE_TREASURY));

        resetFundStateBlockNum[address(dao)] = block.number;
    }

    struct EscrowFreeInFundLocalVars {
        CollectiveInvestmentPoolExtension fundingpool;
        uint256 extraFund;
        address tokenAddr;
        ColletiveFundRaiseProposalAdapterContract fundRaiseContract;
        // uint256 fundRoundCounter;
        // CollectiveFreeInEscrowFundAdapterContract freeInEscrowFundAdapter;
        uint256 maxFund;
        uint256 priorityFunds;
        uint256 poolFunds;
        bytes32 fundRaiseProposalId;
        uint256 fundRaiseBal;
        CollectiveEscrowFundAdapterContract escrowFundAdapter;
    }

    function escorwExtraFreeInFund(DaoRegistry dao) internal {
        EscrowFreeInFundLocalVars memory vars;
        vars.escrowFundAdapter = CollectiveEscrowFundAdapterContract(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_ESCROW_FUND_ADAPTER)
        );
        vars.fundRaiseContract = ColletiveFundRaiseProposalAdapterContract(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUND_RAISE_ADAPTER)
        );
        vars.fundRaiseProposalId = vars.fundRaiseContract.lastProposalIds(
            address(dao)
        );
        if (
            dao.getConfiguration(DaoHelper.COLLECTIVE_FUNDRAISE_STYLE) == 1 &&
            fundRaisedByProposalId[address(dao)][vars.fundRaiseProposalId] >
            dao.getConfiguration(DaoHelper.FUND_RAISING_MAX)
        ) {
            vars.fundingpool = CollectiveInvestmentPoolExtension(
                dao.getExtensionAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT
                )
            );

            address[] memory allInvestors = investorsByFundRaise[address(dao)][
                vars.fundRaiseProposalId
            ].values();
            vars.extraFund = 0;
            vars.tokenAddr = vars.fundingpool.getFundRaisingTokenAddress();

            // vars
            //     .freeInEscrowFundAdapter = CollectiveFreeInEscrowFundAdapterContract(
            //     dao.getAdapterAddress(
            //         DaoHelper.COLLECTIVE_FREE_IN_ESCROW_FUND_ADAPTER
            //     )
            // );
            vars.maxFund = dao.getConfiguration(DaoHelper.FUND_RAISING_MAX);
            vars.priorityFunds = freeINPriorityDeposits[address(dao)][
                vars.fundRaiseProposalId
            ];
            vars.poolFunds = fundRaisedByProposalId[address(dao)][
                vars.fundRaiseProposalId
            ];
            for (uint8 i = 0; i < allInvestors.length; i++) {
                vars.fundRaiseBal = investorsDepositAmountByFundRaise[
                    address(dao)
                ][vars.fundRaiseProposalId][allInvestors[i]];
                if (vars.priorityFunds >= vars.maxFund) {
                    if (
                        priorityDepositers[address(dao)][
                            vars.fundRaiseProposalId
                        ][allInvestors[i]]
                    ) {
                        vars.extraFund =
                            vars.fundRaiseBal -
                            (vars.fundRaiseBal * vars.maxFund) /
                            vars.priorityFunds;
                    } else vars.extraFund = vars.fundRaiseBal;
                } else {
                    if (
                        priorityDepositers[address(dao)][
                            vars.fundRaiseProposalId
                        ][allInvestors[i]]
                    ) vars.extraFund = 0;
                    else {
                        vars.extraFund =
                            vars.fundRaiseBal -
                            (vars.fundRaiseBal *
                                (vars.maxFund - vars.priorityFunds)) /
                            (vars.poolFunds - vars.priorityFunds);
                    }
                }

                if (vars.extraFund > 0) {
                    //1. escrow Fund From Funding Pool
                    vars.escrowFundAdapter.escrowFundFromOverRaised(
                        dao,
                        vars.tokenAddr,
                        allInvestors[i],
                        vars.extraFund,
                        vars.fundRaiseContract.fundRaisingId(address(dao))
                    );
                    // vars.freeInEscrowFundAdapter.escrowFundFromFundingPool(
                    //     dao,
                    //     vars.fundRaiseProposalId,
                    //     vars.tokenAddr,
                    //     allInvestors[i],
                    //     vars.extraFund
                    // );
                    //2. send fund to free in escrow fund contract
                    // vars.fundingpool.distributeFunds(
                    //     dao.getAdapterAddress(
                    //         DaoHelper.COLLECTIVE_FREE_IN_ESCROW_FUND_ADAPTER
                    //     ),
                    //     vars.tokenAddr,
                    //     vars.extraFund
                    // );

                    vars.fundingpool.distributeFunds(
                        dao.getAdapterAddress(
                            DaoHelper.COLLECTIVE_ESCROW_FUND_ADAPTER
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

    struct EscrowFailedFundRaiseFund {
        CollectiveInvestmentPoolExtension fundingpool;
        ColletiveFundRaiseProposalAdapterContract fundRaiseContract;
        CollectiveEscrowFundAdapterContract escrowFundAdapter;
        bytes32 fundRaiseProposalId;
        address tokenAddr;
        address[] allInvestors;
        uint256 bal;
    }

    function escrowFundForFundRaiseFailed(DaoRegistry dao) internal {
        EscrowFailedFundRaiseFund memory vars;
        vars.fundingpool = CollectiveInvestmentPoolExtension(
            dao.getExtensionAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT)
        );

        vars.fundRaiseContract = ColletiveFundRaiseProposalAdapterContract(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUND_RAISE_ADAPTER)
        );
        vars.fundRaiseProposalId = vars.fundRaiseContract.lastProposalIds(
            address(dao)
        );

        vars.tokenAddr = vars.fundingpool.getFundRaisingTokenAddress();
        vars.allInvestors = investorsByFundRaise[address(dao)][
            vars.fundRaiseProposalId
        ].values();

        if (vars.allInvestors.length > 0) {
            for (uint8 i = 0; i < vars.allInvestors.length; i++) {
                vars.bal = investorsDepositAmountByFundRaise[address(dao)][
                    vars.fundRaiseProposalId
                ][vars.allInvestors[i]];
                if (vars.bal > 0) {
                    vars
                        .escrowFundAdapter = CollectiveEscrowFundAdapterContract(
                        dao.getAdapterAddress(
                            DaoHelper.COLLECTIVE_ESCROW_FUND_ADAPTER
                        )
                    );
                    //1. escrow Fund From Funding Pool
                    vars.escrowFundAdapter.escrowFundFromFailedFundRaising(
                        dao,
                        vars.tokenAddr,
                        vars.allInvestors[i],
                        vars.bal,
                        vars.fundRaiseContract.fundRaisingId(address(dao))
                    );
                    //2. send fund to escrow fund contract
                    vars.fundingpool.distributeFunds(
                        dao.getAdapterAddress(
                            DaoHelper.COLLECTIVE_ESCROW_FUND_ADAPTER
                        ),
                        vars.tokenAddr,
                        vars.bal
                    );
                    //3. subtract from funding pool
                    vars.fundingpool.subtractFromBalance(
                        vars.allInvestors[i],
                        vars.tokenAddr,
                        vars.bal
                    );
                }

                investorsDepositAmountByFundRaise[address(dao)][
                    vars.fundRaiseProposalId
                ][vars.allInvestors[i]] = 0;
                investorsByFundRaise[address(dao)][vars.fundRaiseProposalId]
                    .remove(vars.allInvestors[i]);
            }
        }
    }

    function processFundRaise(DaoRegistry dao) external returns (bool) {
        if (
            block.timestamp <=
            dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END)
        ) revert FUNDRAISE_ENDTIME_NOT_UP();

        bytes32 fundRaiseProposalId = ColletiveFundRaiseProposalAdapterContract(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUND_RAISE_ADAPTER)
        ).lastProposalIds(address(dao));

        if (fundState[address(dao)] == FundState.IN_PROGRESS) {
            uint256 raisedAmount = fundRaisedByProposalId[address(dao)][
                fundRaiseProposalId
            ];
            if (
                raisedAmount >=
                dao.getConfiguration(DaoHelper.FUND_RAISING_TARGET)
            ) {
                escorwExtraFreeInFund(dao);

                _addNewMembers(dao, fundRaiseProposalId);

                fundState[address(dao)] = FundState.DONE;
            } else {
                fundState[address(dao)] = FundState.FAILED;

                if (poolBalance(dao) > 0) escrowFundForFundRaiseFailed(dao);

                // if (
                //     CollectiveInvestmentPoolExtension(
                //         dao.getExtensionAddress(
                //             DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT
                //         )
                //     ).balanceOf(address(DaoHelper.DAOSQUARE_TREASURY)) > 0
                // ) escrowFundForFundRaiseFailed(dao);
            }

            emit ProcessFundRaise(
                address(dao),
                fundState[address(dao)],
                raisedAmount
            );
        } else revert EXECUTED_ALREADY();
        return true;
    }

    function balanceOf(
        DaoRegistry dao,
        address investorAddr
    ) public view returns (uint256) {
        CollectiveInvestmentPoolExtension fundingpool = CollectiveInvestmentPoolExtension(
                dao.getExtensionAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT
                )
            );
        return fundingpool.balanceOf(investorAddr);
    }

    function poolBalance(DaoRegistry dao) public view returns (uint256) {
        CollectiveInvestmentPoolExtension fundingpool = CollectiveInvestmentPoolExtension(
                dao.getExtensionAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT
                )
            );
        return fundingpool.balanceOf(address(DaoHelper.DAOSQUARE_TREASURY));
    }

    function getAllInvestors(
        DaoRegistry dao
    ) external view returns (address[] memory) {
        return fundInvestors[address(dao)].values();
    }

    function getGraceWithdrawAmount(
        DaoRegistry dao,
        address account
    ) public view returns (uint256) {
        bytes32 investmentProposalId = ColletiveFundingProposalAdapterContract(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUNDING_ADAPTER)
        ).ongoingProposal(address(dao));

        return graceWithdrawAmount[investmentProposalId][account];
    }
}
