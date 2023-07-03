pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "../../core/DaoRegistry.sol";
import "../extensions/fundingpool/VintageFundingPool.sol";
import "../../helpers/DaoHelper.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "./VintageFundRaise.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "hardhat/console.sol";
import "./VintageEscrowFund.sol";

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
    uint256 public protocolFee = (3 * 1e18) / 1000; // 0.3%
    mapping(address => EnumerableSet.AddressSet) investorMembershipWhiteList;

    mapping(address => mapping(uint256 => EnumerableSet.AddressSet)) fundParticipants;
    event OwnerChanged(address oldOwner, address newOwner);

    event Deposit(address daoAddress, uint256 amount, address account);
    event WithDraw(address daoAddress, uint256 amount, address account);

    event RedeptionFeeCharged(
        uint256 timestamp,
        address account,
        uint256 redemptionFee
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
            uint256 tokenId = dao.getConfiguration(
                DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_TOKENID
            );
            if (itype == 0) {
                require(
                    IERC20(token).balanceOf(account) >= minHolding,
                    "Vintage Deposit::dont meet min erc20 token holding requirment"
                );
            } else if (itype == 1) {
                require(
                    IERC721(token).balanceOf(account) >= minHolding,
                    "Vintage Deposit:dont meet min erc721 token holding requirment"
                );
            } else if (itype == 2) {
                require(
                    IERC1155(token).balanceOf(account, tokenId) >= minHolding,
                    "Vintage Deposit:dont meet min erc1155 token holding requirment"
                );
            } else if (itype == 3) {
                require(
                    ifInvestorMembershipWhiteList(dao, account),
                    "Vintage Deposit:: not in whitelist"
                );
            } else {}
        }
        _;
    }

    /**
     * @notice Updates the DAO registry with the new configurations if valid.
     * @notice Updated the Bank extension with the new potential tokens if valid.
     */
    function configureDao(
        DaoRegistry dao,
        uint32 quorum,
        uint32 superMajority
    ) external onlyAdapter(dao) {}

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
    ) external onlyMember(dao) {
        if (!investorMembershipWhiteList[address(dao)].contains(account)) {
            investorMembershipWhiteList[address(dao)].add(account);
        }
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
        processFundRaise(dao);
        require(
            (daoFundRaisingStates[address(dao)] ==
                DaoHelper.FundRaiseState.IN_PROGRESS &&
                block.timestamp <
                dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END) &&
                block.timestamp >
                dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_BEGIN)) ||
                daoFundRaisingStates[address(dao)] ==
                DaoHelper.FundRaiseState.FAILED ||
                (daoFundRaisingStates[address(dao)] ==
                    DaoHelper.FundRaiseState.DONE &&
                    ifInRedemptionPeriod(dao, block.timestamp)) ||
                (daoFundRaisingStates[address(dao)] ==
                    DaoHelper.FundRaiseState.DONE &&
                    block.timestamp >
                    dao.getConfiguration(DaoHelper.FUND_END_TIME)),
            "FundingPoolAdapter::Withdraw::Cant withdraw at this time"
        );
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.VINTAGE_FUNDING_POOL_EXT)
        );

        address tokenAddr = fundingpool.getFundRaisingTokenAddress();
        uint256 balance = balanceOf(dao, msg.sender);
        require(amount > 0, "FundingPoolAdapter::withdraw::invalid amount");
        require(
            amount <= balance,
            "FundingPoolAdapter::withdraw::insufficient fund"
        );

        uint256 redemptionFee = 0;
        if (
            daoFundRaisingStates[address(dao)] ==
            DaoHelper.FundRaiseState.DONE &&
            ifInRedemptionPeriod(dao, block.timestamp)
        ) {
            //distribute redemption fee to GP
            redemptionFee =
                (dao.getConfiguration(DaoHelper.REDEMPTION_FEE) * amount) /
                1e18;
            if (redemptionFee > 0) {
                fundingpool.distributeFunds(
                    address(dao.getAddressConfiguration(DaoHelper.GP_ADDRESS)),
                    tokenAddr,
                    redemptionFee
                );
                emit RedeptionFeeCharged(
                    block.timestamp,
                    msg.sender,
                    redemptionFee
                );
            }
        }

        fundingpool.withdraw(msg.sender, amount - redemptionFee);

        fundingpool.subtractFromBalance(msg.sender, tokenAddr, amount);

        if (balanceOf(dao, msg.sender) <= 0) {
            VintageFundRaiseAdapterContract fundRaiseContract = VintageFundRaiseAdapterContract(
                    dao.getAdapterAddress(DaoHelper.VINTAGE_FUND_RAISE_ADAPTER)
                );
            uint256 fundRoundCounter = fundRaiseContract.createdFundCounter(
                address(dao)
            );
            _removeFundParticipant(dao, msg.sender, fundRoundCounter);
        }

        emit WithDraw(address(dao), amount - redemptionFee, msg.sender);
    }

    function clearFund(DaoRegistry dao) external reimbursable(dao) {
        require(
            (daoFundRaisingStates[address(dao)] ==
                DaoHelper.FundRaiseState.FAILED &&
                block.timestamp >
                dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END) +
                    dao.getConfiguration(DaoHelper.RETURN_DURATION)) ||
                (daoFundRaisingStates[address(dao)] ==
                    DaoHelper.FundRaiseState.DONE &&
                    block.timestamp >
                    dao.getConfiguration(DaoHelper.FUND_END_TIME) +
                        dao.getConfiguration(DaoHelper.RETURN_DURATION)),
            "FundingPoolAdapter::clearFund::Cant clearFund at this time"
        );
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.VINTAGE_FUNDING_POOL_EXT)
        );

        address tokenAddr = fundingpool.getFundRaisingTokenAddress();
        address[] memory allInvestors = fundingpool.getInvestors();

        VintageFundRaiseAdapterContract fundRaiseContract = VintageFundRaiseAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_FUND_RAISE_ADAPTER)
            );
        uint256 fundRoundCounter = fundRaiseContract.createdFundCounter(
            address(dao)
        );
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
                    //1. escrow Fund From Funding Pool
                    escrowFundAdapter.escrowFundFromFundingPool(
                        dao,
                        fundRoundCounter,
                        tokenAddr,
                        allInvestors[i],
                        bal
                    );
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
        require(
            amount > 0,
            "FundingPoolAdapter::Deposit:: invalid deposit amount"
        );
        uint256 maxDepositAmount = dao.getConfiguration(
            DaoHelper.FUND_RAISING_MAX_INVESTMENT_AMOUNT_OF_LP
        );
        uint256 minDepositAmount = dao.getConfiguration(
            DaoHelper.FUND_RAISING_MIN_INVESTMENT_AMOUNT_OF_LP
        );
        uint256 fundRaiseCap = dao.getConfiguration(DaoHelper.FUND_RAISING_MAX);
        if (minDepositAmount > 0) {
            require(
                amount >= minDepositAmount,
                "FundingPoolAdapter::Deposit::deposit amount cant less than min deposit amount"
            );
        }
        if (maxDepositAmount > 0) {
            require(
                amount + balanceOf(dao, msg.sender) <= maxDepositAmount,
                "FundingPoolAdapter::Deposit::deposit amount cant greater than max deposit amount"
            );
        }

        require(
            dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_BEGIN) <
                block.timestamp &&
                dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END) >
                block.timestamp,
            "FundingPoolAdapter::Deposit::not in fundraise window"
        );
        if (fundRaiseCap > 0) {
            require(
                poolBalance(dao) + amount <= fundRaiseCap,
                "FundingPoolAdapter::Deposit::Fundraise max amount reach"
            );
        }

        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.VINTAGE_FUNDING_POOL_EXT)
        );
        // max participant check
        VintageFundRaiseAdapterContract fundRaiseContract = VintageFundRaiseAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_FUND_RAISE_ADAPTER)
            );
        uint256 fundRounds = fundRaiseContract.createdFundCounter(address(dao));
        if (
            dao.getConfiguration(DaoHelper.MAX_PARTICIPANTS_ENABLE) == 1 &&
            fundParticipants[address(dao)][fundRounds].length() >=
            dao.getConfiguration(DaoHelper.MAX_PARTICIPANTS) &&
            !fundParticipants[address(dao)][fundRounds].contains(msg.sender)
        ) revert("exceed max participants amount");
        address token = fundingpool.getFundRaisingTokenAddress();
        require(
            IERC20(token).balanceOf(msg.sender) >= amount,
            "Deposit::not enough fund"
        );
        require(
            IERC20(token).allowance(msg.sender, address(this)) >= amount,
            "Deposit::not enough allowance"
        );
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        IERC20(token).approve(
            dao.getExtensionAddress(DaoHelper.VINTAGE_FUNDING_POOL_EXT),
            amount
        );
        fundingpool.addToBalance(msg.sender, amount);
        _addFundParticipant(dao, msg.sender, fundRounds);

        emit Deposit(address(dao), amount, msg.sender);
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
            daoFundRaisingStates[address(dao)] ==
            DaoHelper.FundRaiseState.IN_PROGRESS
        ) {
            if (poolBalance(dao) >= fundRaiseTarget)
                daoFundRaisingStates[address(dao)] = DaoHelper
                    .FundRaiseState
                    .DONE;
            else
                daoFundRaisingStates[address(dao)] = DaoHelper
                    .FundRaiseState
                    .FAILED;
        }
    }

    function resetFundRaiseState(DaoRegistry dao) external {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.VINTAGE_FUND_RAISE_ADAPTER),
            "FundingPoolAdapter::resetFundRaiseState::Access deny"
        );
        daoFundRaisingStates[address(dao)] = DaoHelper
            .FundRaiseState
            .IN_PROGRESS;
    }

    function _addFundParticipant(
        DaoRegistry dao,
        address account,
        uint256 fundRound
    ) internal {
        if (!fundParticipants[address(dao)][fundRound].contains(account))
            fundParticipants[address(dao)][fundRound].add(account);
    }

    function _removeFundParticipant(
        DaoRegistry dao,
        address account,
        uint256 fundRound
    ) internal {
        fundParticipants[address(dao)][fundRound].remove(account);
    }

    function balanceOf(
        DaoRegistry dao,
        address investorAddr
    ) public view returns (uint256) {
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.VINTAGE_FUNDING_POOL_EXT)
        );
        return fundingpool.balanceOf(investorAddr);
    }

    function poolBalance(DaoRegistry dao) public view returns (uint256) {
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.VINTAGE_FUNDING_POOL_EXT)
        );
        return fundingpool.balanceOf(address(DaoHelper.DAOSQUARE_TREASURY));
    }

    function raiserBalance(DaoRegistry dao) public view returns (uint256) {
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.VINTAGE_FUNDING_POOL_EXT)
        );
        return fundingpool.balanceOf(address(DaoHelper.GP_POOL));
    }

    function getFundRaisingMaxAmount(
        DaoRegistry dao
    ) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_RAISING_MAX);
    }

    function getMinInvestmentForLP(
        DaoRegistry dao
    ) external view returns (uint256) {
        return
            dao.getConfiguration(
                DaoHelper.FUND_RAISING_MIN_INVESTMENT_AMOUNT_OF_LP
            );
    }

    function getMaxInvestmentForLP(
        DaoRegistry dao
    ) external view returns (uint256) {
        return
            dao.getConfiguration(
                DaoHelper.FUND_RAISING_MAX_INVESTMENT_AMOUNT_OF_LP
            );
    }

    function getFundRaisingTarget(
        DaoRegistry dao
    ) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_RAISING_TARGET);
    }

    function getFundRaiseWindowOpenTime(
        DaoRegistry dao
    ) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_BEGIN);
    }

    function getFundRaiseWindowCloseTime(
        DaoRegistry dao
    ) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END);
    }

    function getFundStartTime(DaoRegistry dao) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_START_TIME);
    }

    function getFundEndTime(DaoRegistry dao) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_END_TIME);
    }

    function getFundReturnDuration(
        DaoRegistry dao
    ) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.RETURN_DURATION);
    }

    function latestRedempteTime(
        DaoRegistry dao
    ) public view returns (uint256, uint256) {
        uint256 fundStartTime = dao.getConfiguration(DaoHelper.FUND_START_TIME);
        uint256 fundEndTime = dao.getConfiguration(DaoHelper.FUND_END_TIME);
        uint256 redemptionPeriod = dao.getConfiguration(
            DaoHelper.FUND_RAISING_REDEMPTION_PERIOD
        );
        uint256 redemptionDuration = dao.getConfiguration(
            DaoHelper.FUND_RAISING_REDEMPTION_DURATION
        );
        uint256 fundDuration = fundEndTime - fundStartTime;
        if (
            fundStartTime <= 0 ||
            fundEndTime <= 0 ||
            redemptionPeriod <= 0 ||
            redemptionDuration <= 0 ||
            fundDuration <= 0
        ) return (0, 0);
        // DaoHelper.RedemptionType redemptionT = DaoHelper.RedemptionType(
        //     dao.getConfiguration(DaoHelper.FUND_RAISING_REDEMPTION)
        // );

        uint256 redemptionEndTime = fundStartTime + redemptionPeriod;
        uint256 redemptionStartTime = redemptionEndTime - redemptionDuration;
        if (
            redemptionStartTime > fundEndTime ||
            redemptionEndTime - redemptionStartTime <= 0
        ) return (0, 0);

        return (redemptionStartTime, redemptionEndTime);
    }

    function getRedemptDuration(
        DaoRegistry dao
    ) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_RAISING_REDEMPTION_DURATION);
    }

    function getRedeptPeriod(DaoRegistry dao) external view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_RAISING_REDEMPTION_PERIOD);
    }

    function ifInRedemptionPeriod(
        DaoRegistry dao,
        uint256 timeStamp
    ) public view returns (bool) {
        uint256 fundStartTime = dao.getConfiguration(DaoHelper.FUND_START_TIME);
        uint256 fundEndTime = dao.getConfiguration(DaoHelper.FUND_END_TIME);
        uint256 redemptionPeriod = dao.getConfiguration(
            DaoHelper.FUND_RAISING_REDEMPTION_PERIOD
        );
        uint256 redemptionDuration = dao.getConfiguration(
            DaoHelper.FUND_RAISING_REDEMPTION_DURATION
        );
        uint256 fundDuration = fundEndTime - fundStartTime;
        if (
            redemptionPeriod <= 0 ||
            redemptionDuration <= 0 ||
            fundDuration <= 0
        ) {
            return false;
        }

        uint256 steps;
        steps = fundDuration / redemptionDuration;

        uint256 redemptionEndTime;
        uint256 redemptionStartTime;
        uint256 i = 0;

        while (i <= steps) {
            redemptionEndTime = redemptionEndTime == 0
                ? fundStartTime + redemptionDuration
                : redemptionEndTime + redemptionDuration;
            redemptionStartTime = redemptionEndTime - redemptionPeriod;
            if (
                timeStamp > redemptionStartTime &&
                timeStamp < redemptionEndTime &&
                timeStamp > fundStartTime &&
                timeStamp < fundEndTime
            ) {
                return true;
            }
            i += 1;
        }
        return false;
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
}
