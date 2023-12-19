pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "../../core/DaoRegistry.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "../extensions/CollectiveFundingPool.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract ColletiveFundingPoolContract is Reimbursable {
    using EnumerableSet for EnumerableSet.AddressSet;

    event Deposit(address daoAddress, uint256 amount, address account);
    event WithDraw(address daoAddress, uint256 amount, address account);
    event RedeptionFeeCharged(
        address daoAddress,
        address account,
        uint256 amount,
        uint256 redemptionFee
    );
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
    error MAX_PATICIPANT_AMOUNT_REACH();

    mapping(address => EnumerableSet.AddressSet) fundInvestors;
    mapping(address => FundState) fundState;

    struct DepostLocalVars {
        uint256 maxDepositAmount;
        uint256 minDepositAmount;
        uint256 fundRaiseCap;
        uint256 fundRounds;
        CollectiveInvestmentPoolExtension fundingpool;
    }

    enum FundState {
        NOT_STARTED,
        IN_PROGRESS,
        DONE,
        FAILED
    }

    function withdraw(
        DaoRegistry dao,
        uint256 amount
    ) external reimbursable(dao) {
        //1. during fund raising 2. after fund raising end and failed 3. fund raising succeed and in redempte period
        //4. after fund end
        // require(
        //     (block.timestamp <
        //         dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END) &&
        //         block.timestamp >
        //         dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_BEGIN)) ||
        //         ifInRedemptionPeriod(dao, block.timestamp) ||
        //         block.timestamp > dao.getConfiguration(DaoHelper.FUND_END_TIME),
        //     "!withdraw"
        // );
        CollectiveInvestmentPoolExtension fundingpool = CollectiveInvestmentPoolExtension(
                dao.getExtensionAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT
                )
            );

        address tokenAddr = fundingpool.getFundRaisingTokenAddress();
        uint256 balance = balanceOf(dao, msg.sender);
        require(amount > 0, "!amount");
        require(amount <= balance, ">balance");
        uint256 redemptionFee = (amount *
            dao.getConfiguration(DaoHelper.COLLECTIVE_REDEMPT_FEE_AMOUNT)) /
            1e18;
        // if (ifInRedemptionPeriod(dao, block.timestamp)) {
        //     //distribute redemption fee to governor
        //     redemptionFee =
        //         (dao.getConfiguration(DaoHelper.REDEMPTION_FEE) * amount) /
        //         1e18;

        //     if (redemptionFee > 0)
        //         fundingpool.distributeFunds(
        //             address(dao.getAddressConfiguration(DaoHelper.GP_ADDRESS)),
        //             tokenAddr,
        //             redemptionFee
        //         );
        //     emit RedeptionFeeCharged(
        //         address(dao),
        //         msg.sender,
        //         amount,
        //         redemptionFee
        //     );
        // }
        fundingpool.withdraw(msg.sender, tokenAddr, amount - redemptionFee);
        fundingpool.subtractFromBalance(msg.sender, tokenAddr, amount);
        if (balanceOf(dao, msg.sender) <= 0) {
            _removeFundInvestor(dao, msg.sender);
        }
        distributeRedemptionFee(dao, tokenAddr, redemptionFee);
        emit WithDraw(address(dao), amount - redemptionFee, msg.sender);
    }

    function deposit(
        DaoRegistry dao,
        uint256 amount
    ) external reimbursable(dao) {
        require(amount > 0, "!amount");
        DepostLocalVars memory vars;
        vars.maxDepositAmount = dao.getConfiguration(
            DaoHelper.FUND_RAISING_MAX_INVESTMENT_AMOUNT_OF_LP
        );
        vars.minDepositAmount = dao.getConfiguration(
            DaoHelper.FUND_RAISING_MIN_INVESTMENT_AMOUNT_OF_LP
        );
        vars.fundRaiseCap = dao.getConfiguration(DaoHelper.FUND_RAISING_MAX);
        if (vars.minDepositAmount > 0) {
            require(amount >= vars.minDepositAmount, "< min deposit amount");
        }
        if (vars.maxDepositAmount > 0) {
            require(
                amount + balanceOf(dao, msg.sender) <= vars.maxDepositAmount,
                "> max deposit amount"
            );
        }

        require(
            dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_BEGIN) <
                block.timestamp &&
                dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END) >
                block.timestamp,
            "!fundraising window"
        );
        if (
            dao.getConfiguration(DaoHelper.COLLECTIVE_FUNDRAISE_STYLE) == 0 &&
            vars.fundRaiseCap > 0
        ) {
            //FCFS
            require(
                poolBalance(dao) + amount <= vars.fundRaiseCap,
                "> Fundraise max amount"
            );
        }

        vars.fundingpool = CollectiveInvestmentPoolExtension(
            dao.getExtensionAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT)
        );
        // vars.fundRounds += 1;
        // investor cap
        if (
            dao.getConfiguration(DaoHelper.MAX_INVESTORS_ENABLE) == 1 &&
            fundInvestors[address(dao)].length() >=
            dao.getConfiguration(DaoHelper.MAX_INVESTORS) &&
            !fundInvestors[address(dao)].contains(msg.sender)
        ) revert MAX_PATICIPANT_AMOUNT_REACH();
        address token = vars.fundingpool.getFundRaisingTokenAddress();
        require(IERC20(token).balanceOf(msg.sender) >= amount, "!fund");
        require(
            IERC20(token).allowance(msg.sender, address(this)) >= amount,
            "!allowance"
        );
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        IERC20(token).approve(
            dao.getExtensionAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT),
            amount
        );
        vars.fundingpool.addToBalance(msg.sender, amount);
        _addFundInvestor(dao, msg.sender);
        emit Deposit(address(dao), amount, msg.sender);
    }

    function clearFund(DaoRegistry dao) external reimbursable(dao) {}

    function _addFundInvestor(DaoRegistry dao, address account) internal {
        if (!fundInvestors[address(dao)].contains(account))
            fundInvestors[address(dao)].add(account);
    }

    function _removeFundInvestor(DaoRegistry dao, address account) internal {
        fundInvestors[address(dao)].remove(account);
    }

    function processFundRaise(DaoRegistry dao) public returns (bool) {
        uint256 fundRaiseTarget = dao.getConfiguration(
            DaoHelper.FUND_RAISING_TARGET
        );
        uint256 fundRaiseEndTime = dao.getConfiguration(
            DaoHelper.FUND_RAISING_WINDOW_END
        );
        if (
            block.timestamp > fundRaiseEndTime &&
            fundState[address(dao)] == FundState.IN_PROGRESS
        ) {
            if (poolBalance(dao) >= fundRaiseTarget) {
                // dao.setConfiguration(
                //     DaoHelper.FUND_START_TIME,
                //     block.timestamp
                // );
                // dao.setConfiguration(
                //     DaoHelper.FUND_END_TIME,
                //     block.timestamp + dao.getConfiguration(DaoHelper.FUND_TERM) //proposalInfo.timesInfo.fundTerm
                // );

                // escorwExtraFreeInFund(dao);

                fundState[address(dao)] = FundState.DONE;
            } else fundState[address(dao)] = FundState.FAILED;

            emit ProcessFundRaise(
                address(dao),
                fundState[address(dao)],
                poolBalance(dao)
            );
        }
        return true;
    }

    function resetFundRaiseState(DaoRegistry dao) external {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUND_RAISE_ADAPTER),
            "FundingPoolAdapter::resetFundRaiseState::Access deny"
        );
        fundState[address(dao)] = FundState.IN_PROGRESS;
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

    function ifInRedemptionPeriod(
        DaoRegistry dao,
        uint256 timestamp
    ) public view returns (bool) {}

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

    function distributeRedemptionFee(
        DaoRegistry dao,
        address token,
        uint256 totalRedemptionFee
    ) internal {
        for (uint8 i = 0; i < fundInvestors[address(dao)].length(); i++) {
            uint256 redemptionFee = (balanceOf(
                dao,
                fundInvestors[address(dao)].values()[i]
            ) * totalRedemptionFee) / poolBalance(dao);

            CollectiveInvestmentPoolExtension fundingpool = CollectiveInvestmentPoolExtension(
                    dao.getExtensionAddress(
                        DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT
                    )
                );
            fundingpool.distributeFunds(
                fundInvestors[address(dao)].values()[i],
                token,
                redemptionFee
            );

            emit DistributeRedemptionFee(
                address(dao),
                fundInvestors[address(dao)].values()[i],
                redemptionFee
            );
        }
    }
}
