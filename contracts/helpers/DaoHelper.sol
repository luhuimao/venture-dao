pragma solidity ^0.8.0;
// import "../extensions/bank/Bank.sol";
// import "../extensions/gpdao/GPDao.sol";
import "../flex/extensions/FlexFundingPool.sol";
import "../vintage/extensions/fundingpool/VintageFundingPool.sol";
import "../core/DaoRegistry.sol";
import "../core/DaoFactory.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

// SPDX-License-Identifier: MIT

/**
MIT License

Copyright (c) 2021 Openlaw

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
library DaoHelper {
    enum VoteType {
        SIMPLE_MAJORITY,
        SIMPLE_MAJORITY_QUORUM_REQUIRED,
        SUPERMAJORITY,
        SUPERMAJORITY_QUORUM_REQUIRED
    }
    enum ProposalType {
        FUNDING, // funding proposal
        MEMBERSHIP, // add membership
        KICK, // revoke membership
        CALL, // call contracts
        VPERIOD, // set `votingPeriod`
        GPERIOD, // set `gracePeriod`
        QUORUM, // set `quorum`
        SUPERMAJORITY, // set `supermajority`
        TYPE, // set `VoteType` to `ProposalType`
        PAUSE, // flip membership transferability
        EXTENSION, // flip `extensions` whitelisting
        ESCAPE, // delete pending proposal in case of revert
        DOCS // amend org docs
    }

    enum RedemptionType {
        WEEKLY,
        BI_WEEKLY,
        MONTHLY,
        QUARTERLY,
        YEARLY
    }
    enum FundRaiseState {
        NOT_STARTED,
        IN_PROGRESS,
        DONE,
        FAILED
    }
    uint256 internal constant TOKEN_AMOUNT_PRECISION = 1e18;

    uint256 internal constant ONE_WEEK = 60 * 60 * 24 * 7;
    uint256 internal constant TWO_WEEK = 60 * 60 * 24 * 14;
    uint256 internal constant ONE_MONTH = 60 * 60 * 24 * 30;
    uint256 internal constant TWO_MONTH = 60 * 60 * 24 * 60;
    uint256 internal constant THREE_MONTH = 60 * 60 * 24 * 90;
    uint256 internal constant ONE_YEAR = 60 * 60 * 24 * 365;

    /* ********************************
    VINTAGE SETTING 
    *********************************/
    //investor membership
    bytes32 internal constant VINTAGE_INVESTOR_MEMBERSHIP_ENABLE =
        keccak256("VINTAGE_INVESTOR_MEMBERSHIP_ENABLE");
    bytes32 internal constant VINTAGE_INVESTOR_MEMBERSHIP_NAME =
        keccak256("VINTAGE_INVESTOR_MEMBERSHIP_NAME");
    bytes32 internal constant VINTAGE_INVESTOR_MEMBERSHIP_TYPE =
        keccak256("VINTAGE_INVESTOR_MEMBERSHIP_TYPE");

    bytes32 internal constant VINTAGE_INVESTOR_MEMBERSHIP_MIN_HOLDING =
        keccak256("VINTAGE_INVESTOR_MEMBERSHIP_MIN_HOLDING");

    bytes32 internal constant VINTAGE_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS =
        keccak256("VINTAGE_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS");

    bytes32 internal constant VINTAGE_INVESTOR_MEMBERSHIP_TOKENID =
        keccak256("VINTAGE_INVESTOR_MEMBERSHIP_TOKENID");

    //Vintage dao governor mambership
    bytes32 internal constant VINTAGE_GOVERNOR_MEMBERSHIP_ENABLE =
        keccak256("VINTAGE_GOVERNOR_MEMBERSHIP_ENABLE");
    bytes32 internal constant VINTAGE_GOVERNOR_MEMBERSHIP_TYPE =
        keccak256("VINTAGE_GOVERNOR_MEMBERSHIP_TYPE");
    bytes32 internal constant VINTAGE_GOVERNOR_MEMBERSHIP_NAME =
        keccak256("VINTAGE_GOVERNOR_MEMBERSHIP_NAME");
    bytes32 internal constant VINTAGE_GOVERNOR_MEMBERSHIP_MIN_HOLDING =
        keccak256("VINTAGE_GOVERNOR_MEMBERSHIP_MIN_HOLDING");
    bytes32 internal constant VINTAGE_GOVERNOR_MEMBERSHIP_MIN_DEPOSIT =
        keccak256("VINTAGE_GOVERNOR_MEMBERSHIP_MIN_DEPOSIT");
    bytes32 internal constant VINTAGE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS =
        keccak256("VINTAGE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS");
    bytes32 internal constant VINTAGE_GOVERNOR_MEMBERSHIP_TOKENID =
        keccak256("VINTAGE_GOVERNOR_MEMBERSHIP_TOKENID");

    // vintage dao voting config
    bytes32 internal constant VINTAGE_VOTING_ASSET_TYPE =
        keccak256("VINTAGE_VOTING_ASSET_TYPE");
    bytes32 internal constant VINTAGE_VOTING_ASSET_TOKEN_ADDRESS =
        keccak256("VINTAGE_VOTING_ASSET_TOKEN_ADDRESS");
    bytes32 internal constant VINTAGE_VOTING_ASSET_TOKEN_ID =
        keccak256("VINTAGE_VOTING_ASSET_TOKEN_ID");
    bytes32 internal constant VINTAGE_VOTING_WEIGHTED_TYPE =
        keccak256("VINTAGE_VOTING_WEIGHTED_TYPE");
    bytes32 internal constant VINTAGE_VOTING_SUPPORT_TYPE =
        keccak256("VINTAGE_VOTING_SUPPORT_TYPE");
    bytes32 internal constant VINTAGE_VOTING_QUORUM_TYPE =
        keccak256("VINTAGE_VOTING_QUORUM_TYPE");

    bytes32 internal constant VINTAGE_EXECUTION_PERIOD =
        keccak256("VINTAGE_EXECUTION_PERIOD");

    bytes32 internal constant VINTAGE_PROPOSER_FUND_REWARD_RADIO =
        keccak256("VINTAGE_PROPOSER_FUND_REWARD_RADIO");
    bytes32 internal constant VINTAGE_PROPOSER_TOKEN_REWARD_RADIO =
        keccak256("VINTAGE_PROPOSER_TOKEN_REWARD_RADIO");

    bytes32 internal constant VINTAGE_FUNDRAISE_STYLE =
        keccak256("VINTAGE_FUNDRAISE_STYLE");

    bytes32 internal constant VINTAGE_PRIORITY_DEPOSITE_ENABLE =
        keccak256("VINTAGE_PRIORITY_DEPOSITE_ENABLE");
    bytes32 internal constant VINTAGE_PRIORITY_DEPOSITE_TYPE =
        keccak256("VINTAGE_PRIORITY_DEPOSITE_TYPE");
    bytes32 internal constant VINTAGE_PRIORITY_DEPOSITE_TOKEN_ADDRESS =
        keccak256("VINTAGE_PRIORITY_DEPOSITE_TOKEN_ADDRESS");
    bytes32 internal constant VINTAGE_PRIORITY_DEPOSITE_TOKENID =
        keccak256("VINTAGE_PRIORITY_DEPOSITE_TOKENID");
    bytes32 internal constant VINTAGE_PRIORITY_DEPOSITE_AMOUNT =
        keccak256("VINTAGE_PRIORITY_DEPOSITE_AMOUNT");

    bytes32 internal constant VINTAGE_RETURN_TOKEN_MANAGEMENT_FEE_AMOUNT =
        keccak256("VINTAGE_RETURN_TOKEN_MANAGEMENT_FEE_AMOUNT");
    /* ********************************
    VINTAGE SETTING 
    *********************************/

    /* ********************************
    FLEX SETTING 
    *********************************/
    // flex setting
    bytes32 internal constant FLEX_VOTING_ASSET_TYPE =
        keccak256("FLEX_VOTING_ASSET_TYPE");

    bytes32 internal constant FLEX_VOTING_ASSET_TOKEN_ID =
        keccak256("FLEX_VOTING_ASSET_TOKEN_ID");

    bytes32 internal constant FLEX_VOTING_ASSET_TOKEN_ADDRESS =
        keccak256("FLEX_VOTING_ASSET_TOKEN_ADDRESS");

    bytes32 internal constant FLEX_VOTING_WEIGHTED_TYPE =
        keccak256("FLEX_VOTING_WEIGHTED_TYPE");

    bytes32 internal constant FLEX_POLL_VOTING_ASSET_TYPE =
        keccak256("FLEX_POLL_VOTING_ASSET_TYPE");

    bytes32 internal constant FLEX_POLL_VOTING_ASSET_TOKEN_ID =
        keccak256("FLEX_POLL_VOTING_ASSET_TOKEN_ID");

    bytes32 internal constant FLEX_POLL_VOTING_ASSET_TOKEN_ADDRESS =
        keccak256("FLEX_POLL_VOTING_ASSET_TOKEN_ADDRESS");

    bytes32 internal constant FLEX_POLL_VOTING_WEIGHTED_TYPE =
        keccak256("FLEX_POLL_VOTING_WEIGHTED_TYPE");

    bytes32 internal constant FLEX_VOTING_SUPPORT_TYPE =
        keccak256("FLEX_VOTING_SUPPORT_TYPE");

    bytes32 internal constant FLEX_VOTING_QUORUM_TYPE =
        keccak256("FLEX_VOTING_QUORUM_TYPE");

    bytes32 internal constant FLEX_FUNDRAISE_STYLE =
        keccak256("FLEX_FUNDRAISE_STYLE");
    // ---- flex dao priority deposit membersip
    bytes32 internal constant FLEX_PRIORITY_DEPOSIT_ENABLE =
        keccak256("FLEX_PRIORITY_DEPOSIT_ENABLE");
    bytes32 internal constant FLEX_PRIORITY_DEPOSIT_TYPE =
        keccak256("FLEX_PRIORITY_DEPOSIT_TYPE");
    bytes32 internal constant FLEX_PRIORITY_DEPOSIT_MIN_HOLDING =
        keccak256("FLEX_PRIORITY_DEPOSIT_MIN_HOLDING");
    bytes32 internal constant FLEX_PRIORITY_DEPOSIT_TOKEN_ADDRESS =
        keccak256("FLEX_PRIORITY_DEPOSIT_TOKEN_ADDRESS");
    bytes32 internal constant FLEX_PRIORITY_DEPOSIT_TOKENID =
        keccak256("FLEX_PRIORITY_DEPOSIT_TOKENID");
    bytes32 internal constant FLEX_PRIORITY_DEPOSIT_PERIOD =
        keccak256("FLEX_PRIORITY_DEPOSIT_PERIOD");
    // ---investor membership
    bytes32 internal constant FLEX_INVESTOR_MEMBERSHIP_ENABLE =
        keccak256("FLEX_INVESTOR_MEMBERSHIP_ENABLE");
    bytes32 internal constant FLEX_INVESTOR_MEMBERSHIP_TYPE =
        keccak256("FLEX_INVESTOR_MEMBERSHIP_TYPE");
    bytes32 internal constant FLEX_INVESTOR_MEMBERSHIP_NAME =
        keccak256("FLEX_INVESTOR_MEMBERSHIP_NAME");
    bytes32 internal constant FLEX_INVESTOR_MEMBERSHIP_MIN_HOLDING =
        keccak256("FLEX_INVESTOR_MEMBERSHIP_MIN_HOLDING");
    bytes32 internal constant FLEX_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS =
        keccak256("FLEX_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS");
    bytes32 internal constant FLEX_INVESTOR_MEMBERSHIP_TOKENID =
        keccak256("FLEX_INVESTOR_MEMBERSHIP_TOKENID");
    // -----polling
    bytes32 internal constant FLEX_POLLING_VOTING_PERIOD =
        keccak256("FLEX_POLLING_VOTING_PERIOD");
    bytes32 internal constant FLEX_POLLING_VOTING_POWER =
        keccak256("FLEX_POLLING_VOTING_POWER");
    bytes32 internal constant FLEX_POLLING_SUPER_MAJORITY =
        keccak256("FLEX_POLLING_SUPER_MAJORITY");
    bytes32 internal constant FLEX_POLLING_QUORUM =
        keccak256("FLEX_POLLING_QUORUM");
    bytes32 internal constant FLEX_POLLING_PROPOSAL_EXECUTIONPEERIOD =
        keccak256("FLEX_POLLING_PROPOSAL_EXECUTIONPEERIOD");
    //-----pollvoter membership
    bytes32 internal constant FLEX_POLLVOTER_MEMBERSHIP_TYPE =
        keccak256("FLEX_POLLVOTER_MEMBERSHIP_TYPE");
    bytes32 internal constant FLEX_POLLVOTER_MEMBERSHIP_NAME =
        keccak256("FLEX_POLLVOTER_MEMBERSHIP_NAME");
    bytes32 internal constant FLEX_POLLVOTER_MEMBERSHIP_MIN_HOLDING =
        keccak256("FLEX_POLLVOTER_MEMBERSHIP_MIN_HOLDING");
    bytes32 internal constant FLEX_POLLVOTER_MEMBERSHIP_TOKEN_ADDRESS =
        keccak256("FLEX_POLLVOTER_MEMBERSHIP_TOKEN_ADDRESS");
    bytes32 internal constant FLEX_POLLVOTER_MEMBERSHIP_TOKENID =
        keccak256("FLEX_POLLVOTER_MEMBERSHIP_TOKENID");

    bytes32 internal constant FLEX_INVESTMENT_TYPE =
        keccak256("FLEX_FUNDING_TYPE");
    // -----flex steward membership setting
    bytes32 internal constant FLEX_GOVERNOR_MEMBERSHIP_ENABLE =
        keccak256("FLEX_STEWARD_MEMBERSHIP_ENABLE");
    bytes32 internal constant FLEX_GOVERNOR_MEMBERSHIP_NAME =
        keccak256("FLEX_GOVERNOR_MEMBERSHIP_NAME");
    bytes32 internal constant FLEX_GOVERNOR_MEMBERSHIP_TYPE =
        keccak256("FLEX_STEWARD_MEMBERSHIP_TYPE");
    bytes32 internal constant FLEX_GOVERNOR_MEMBERSHIP_MINI_HOLDING =
        keccak256("FLEX_STEWARD_MEMBERSHIP_MINI_HOLDING");
    bytes32 internal constant FLEX_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS =
        keccak256("FLEX_STEWARD_MEMBERSHIP_TOKEN_ADDRESS");
    bytes32 internal constant FLEX_GOVERNOR_MEMBERSHIP_TOKEN_ID =
        keccak256("FLEX_STEWARD_MEMBERSHIP_TOKEN_ID");

    bytes32 internal constant FLEX_MANAGEMENT_FEE_TYPE =
        keccak256("FLEX_MANAGEMENT_FEE_TYPE");
    bytes32 internal constant FLEX_MANAGEMENT_FEE_AMOUNT =
        keccak256("FLEX_MANAGEMENT_FEE_AMOUNT");
    bytes32 internal constant FLEX_RETURN_TOKEN_MANAGEMENT_FEE_AMOUNT =
        keccak256("FLEX_RETURN_TOKEN_MANAGEMENT_FEE_AMOUNT");
    bytes32 internal constant FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS =
        keccak256("FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS");
    bytes32 internal constant FLEX_PROTOCOL_FEE =
        keccak256("FLEX_PROTOCOL_FEE");
    bytes32 internal constant FLEX_PROTOCOL_FEE_RECEIVE_ADDRESS =
        keccak256("FLEX_PROTOCOL_FEE_RECEIVE_ADDRESS");
    // -----flex proposer requirment setting
    bytes32 internal constant FLEX_PROPOSER_ENABLE =
        keccak256("FLEX_PROPOSER_ENABLE");
    bytes32 internal constant FLEX_PROPOSER_MEMBERSHIP_NAME =
        keccak256("FLEX_PROPOSER_MEMBERSHIP_NAME");
    bytes32 internal constant FLEX_PROPOSER_IDENTIFICATION_TYPE =
        keccak256("FLEX_PROPOSER_IDENTIFICATION_TYPE");
    bytes32 internal constant FLEX_PROPOSER_TOKEN_ADDRESS =
        keccak256("FLEX_PROPOSER_TOKEN_ADDRESS");
    bytes32 internal constant FLEX_PROPOSER_TOKENID =
        keccak256("FLEX_PROPOSER_TOKENID");
    bytes32 internal constant FLEX_PROPOSER_MIN_HOLDING =
        keccak256("FLEX_PROPOSER_MIN_HOLDING");
    /* ********************************
    FLEX SETTING 
    *********************************/

    /*********************************
    COLLECTIVE SETTING 
    *********************************/
    bytes32 internal constant COLLECTIVE_VOTING_ASSET_TYPE =
        keccak256("COLLECTIVE_VOTING_ASSET_TYPE");
    bytes32 internal constant COLLECTIVE_VOTING_WEIGHTED_TYPE =
        keccak256("COLLECTIVE_VOTING_WEIGHTED_TYPE");
    bytes32 internal constant COLLECTIVE_VOTING_SUPPORT_TYPE =
        keccak256("COLLECTIVE_VOTING_SUPPORT_TYPE");
    bytes32 internal constant COLLECTIVE_VOTING_QUORUM_TYPE =
        keccak256("COLLECTIVE_VOTING_QUORUM_TYPE");
    bytes32 internal constant COLLECTIVE_PROPOSER_PAYBACK_TOKEN_REWARD_AMOUNT =
        keccak256("COLLECTIVE_PROPOSER_PAYBACK_TOKEN_REWARD_AMOUNT");
    bytes32 internal constant COLLECTIVE_PROPOSER_INVEST_TOKEN_REWARD_AMOUNT =
        keccak256("COLLECTIVE_PROPOSER_INVEST_TOKEN_REWARD_AMOUNT");
    bytes32 internal constant COLLECTIVE_MANAGEMENT_FEE_AMOUNT =
        keccak256("COLLECTIVE_MANAGEMENT_FEE_AMOUNT");
    bytes32 internal constant COLLECTIVE_VOTING_EXECUTE_PERIOD =
        keccak256("COLLECTIVE_VOTING_EXECUTE_PERIOD");
    bytes32 internal constant COLLECTIVE_VOTING_GRACE_PERIOD =
        keccak256("COLLECTIVE_VOTING_GRACE_PERIOD");
    bytes32 internal constant COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ID =
        keccak256("COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ID");
    bytes32 internal constant COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS =
        keccak256("COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS");
    bytes32 internal constant COLLECTIVE_GOVERNOR_MEMBERSHIP_ENABLE =
        keccak256("COLLECTIVE_GOVERNOR_MEMBERSHIP_ENABLE");
    bytes32 internal constant COLLECTIVE_GOVERNOR_MEMBERSHIP_NAME =
        keccak256("COLLECTIVE_GOVERNOR_MEMBERSHIP_NAME");
    bytes32 internal constant COLLECTIVE_GOVERNOR_MEMBERSHIP_MINI_HOLDING =
        keccak256("COLLECTIVE_GOVERNOR_MEMBERSHIP_MINI_HOLDING");
    bytes32 internal constant COLLECTIVE_GOVERNOR_MEMBERSHIP_TYPE =
        keccak256("COLLECTIVE_GOVERNOR_MEMBERSHIP_TYPE");
    bytes32 internal constant COLLECTIVE_MANAGEMENT_FEE_RECEIVE_ADDRESS =
        keccak256("COLLECTIVE_MANAGEMENT_FEE_RECEIVE_ADDRESS");
    bytes32 internal constant COLLECTIVE_REDEMPT_FEE_AMOUNT =
        keccak256("COLLECTIVE_REDEMPT_FEE_AMOUNT");
    bytes32 internal constant COLLECTIVE_PRIORITY_DEPOSITE_ENABLE =
        keccak256("COLLECTIVE_PRIORITY_DEPOSITE_ENABLE");
    bytes32 internal constant COLLECTIVE_PRIORITY_DEPOSITE_TYPE =
        keccak256("COLLECTIVE_PRIORITY_DEPOSITE_TYPE");
    bytes32 internal constant COLLECTIVE_PRIORITY_DEPOSITE_TOKEN_ADDRESS =
        keccak256("COLLECTIVE_PRIORITY_DEPOSITE_TOKEN_ADDRESS");
    bytes32 internal constant COLLECTIVE_PRIORITY_DEPOSITE_TOKENID =
        keccak256("COLLECTIVE_PRIORITY_DEPOSITE_TOKENID");
    bytes32 internal constant COLLECTIVE_PRIORITY_DEPOSITE_AMOUNT =
        keccak256("COLLECTIVE_PRIORITY_DEPOSITE_AMOUNT");
    bytes32 internal constant COLLECTIVE_FUNDRAISE_STYLE =
        keccak256("COLLECTIVE_FUNDRAISE_STYLE");
    // bytes32 internal constant COLLECTIVE_PROPOSER_TOKEN_REWARD_RADIO =
    //     keccak256("COLLECTIVE_PROPOSER_TOKEN_REWARD_RADIO");
    bytes32 internal constant COLLECTIVE_PAYBACK_TOKEN_MANAGEMENT_FEE_AMOUNT =
        keccak256("COLLECTIVE_PAYBACK_TOKEN_MANAGEMENT_FEE_AMOUNT");
    // bytes32 internal constant COLLECTIVE_PROPOSER_FUND_REWARD_RADIO =
    //     keccak256("COLLECTIVE_PROPOSER_FUND_REWARD_RADIO");

    /*********************************
    COLLECTIVE SETTING 
    *********************************/

    //PPM
    bytes32 internal constant MAX_INVESTORS_ENABLE =
        keccak256("MAX_INVESTORS_ENABLE");
    bytes32 internal constant MAX_INVESTORS = keccak256("MAX_INVESTORS");
    bytes32 internal constant RETURN_DURATION = keccak256("RETURN_DURATION");
    bytes32 internal constant DAO_SQUARE_ADDRESS =
        keccak256("DAO_SQUARE_ADDRESS");
    bytes32 internal constant GP_ADDRESS = keccak256("GP_ADDRESS");
    bytes32 internal constant FUND_RAISING_CURRENCY_ADDRESS =
        keccak256("FUND_RAISING_CURRENCY_ADDRESS");
    bytes32 internal constant FUND_RAISING_TARGET =
        keccak256("FUND_RAISING_TARGET");
    bytes32 internal constant FUND_RAISING_MAX = keccak256("FUND_RAISING_MAX");
    bytes32 internal constant FUND_RAISING_MIN_INVESTMENT_AMOUNT_OF_LP =
        keccak256("FUND_RAISING_MIN_INVESTMENT_AMOUNT_OF_LP");
    bytes32 internal constant FUND_RAISING_MAX_INVESTMENT_AMOUNT_OF_LP =
        keccak256("FUND_RAISING_MAX_INVESTMENT_AMOUNT_OF_LP");
    bytes32 internal constant FUND_RAISING_WINDOW_BEGIN =
        keccak256("FUND_RAISING_WINDOW_BEGIN");
    bytes32 internal constant FUND_RAISING_WINDOW_END =
        keccak256("FUND_RAISING_WINDOW_END");

    bytes32 internal constant FUND_RAISING_REDEMPTION_PERIOD =
        keccak256("FUND_RAISING_REDEMPTION_PERIOD");
    bytes32 internal constant FUND_RAISING_REDEMPTION_DURATION =
        keccak256("FUND_RAISING_REDEMPTION_DURATION");
    bytes32 internal constant FUND_RAISING_TERM =
        keccak256("FUND_RAISING_TERM");
    bytes32 internal constant FUND_START_TIME = keccak256("FUND_START_TIME");
    bytes32 internal constant FUND_END_TIME = keccak256("FUND_END_TIME");
    bytes32 internal constant FUND_TERM = keccak256("FUND_TERM");
    bytes32 internal constant REWARD_FOR_PROPOSER =
        keccak256("REWARD_FOR_PROPOSER");
    bytes32 internal constant REWARD_FOR_GP = keccak256("REWARD_FOR_GP");
    bytes32 internal constant MANAGEMENT_FEE = keccak256("MANAGEMENT_FEE");

    bytes32 internal constant REDEMPTION_FEE = keccak256("REDEMPTION_FEE");
    bytes32 internal constant PROTOCOL_FEE = keccak256("PROTOCOL_FEE");
    bytes32 internal constant GP_MIN_INVESTMENT_AMOUNT =
        keccak256("GP_MIN_INVESTMENT_AMOUNT");

    bytes32 internal constant REDEMPTION_FEE_RECEIVER =
        keccak256("REDEMPTION_FEE_RECEIVER");

    //voting
    bytes32 internal constant QUORUM = keccak256("QUORUM");
    bytes32 internal constant SUPER_MAJORITY = keccak256("SUPER_MAJORITY");
    bytes32 constant VOTING_PERIOD = keccak256("VOTING_PERIOD");
    bytes32 internal constant PROPOSAL_EXECUTE_DURATION =
        keccak256("PROPOSAL_EXECUTE_DURATION");
    //Token
    //rice
    bytes32 internal constant RICE_TOKEN_ADDRESS =
        keccak256("rice.token.address");

    /* 
    vintage Adapters **************************************************************************************************
     */
    bytes32 internal constant VINTAGE_INVESTMENT_POOL_ADAPT =
        keccak256("vintage-funding-pool-adatper");
    bytes32 internal constant VINTAGE_INVESTMENT_POOL_HELPER_ADAPT =
        keccak256("vintage-funding-pool-adatper-helper");
    bytes32 internal constant VINTAGE_VOTING_ADAPT =
        keccak256("vintage-voting");
    bytes32 internal constant VINTAGE_GOVERNOR_MANAGEMENT =
        keccak256("vintage-raiser-management");

    bytes32 internal constant VINTAGE_FUNDING_ADAPTER =
        keccak256("vintage-funding-adapter");

    bytes32 internal constant VINTAGE_ALLOCATION_ADAPTER =
        keccak256("vintage-allocation-adapter");

    bytes32 internal constant VINTAGE_VESTING_ADAPTER =
        keccak256("vintage-vesting-adapter");

    bytes32 internal constant VINTAGE_FUND_RAISE_ADAPTER =
        keccak256("vintage-fund-raise");

    bytes32 internal constant VINTAGE_FUND_RAISE_HELPER_ADAPTER =
        keccak256("vintage-fund-raise-helper");

    bytes32 internal constant VINTAGE_ESCROW_FUND_ADAPTER =
        keccak256("vintage-escrow-fund");
    bytes32 internal constant VINTAGE_GOVERNOR_ALLOCATION_ADAPTER =
        keccak256("vintage-raiser-allocation");
    bytes32 internal constant VINTAGE_DISTRIBUTE_ADAPTER =
        keccak256("vintage-distribute-adapter");
    bytes32 internal constant VINTAGE_INVESTMENT_PAYBACK_TOKEN_ADAPTER =
        keccak256("vintage-funding-return-token-adapter");
    bytes32 internal constant VINTAGE_FREE_IN_ESCROW_FUND_ADAPTER =
        keccak256("vintage-free-in-escrow-fund-adapter");
    bytes32 internal constant VINTAGE_DAO_SET_ADAPTER =
        keccak256("vintage-daoset-adapter");
    bytes32 internal constant VINTAGE_DAO_SET_HELPER_ADAPTER =
        keccak256("vintage-daoset-helper-adapter");
    bytes32 internal constant VINTAGE_GOV_VOT_ASSET_ALLOC_ADAPTER =
        keccak256("vin-gov-vot-asset-alloc-adapter");
    /* 
    vintage Adapters **************************************************************************************************
     */

    //---------------------------------flex---------------------------------
    bytes32 internal constant FLEX_STEWARD_MANAGEMENT =
        keccak256("flex-steward-management");
    bytes32 internal constant FLEX_VESTING = keccak256("flex-vesting");
    bytes32 internal constant FLEX_ERC721_ADAPT =
        keccak256("flex-erc721-adatper");
    bytes32 internal constant FLEX_ALLOCATION_ADAPT =
        keccak256("flex-allocation-adatper");
    bytes32 internal constant FLEX_INVESTMENT_POOL_ADAPT =
        keccak256("flex-funding-pool-adatper");
    bytes32 internal constant FLEX_FUNDING_ADAPT = keccak256("flex-funding");
    bytes32 internal constant FLEX_VOTING_ADAPT = keccak256("flex-voting");
    bytes32 internal constant FLEX_POLLING_VOTING_ADAPT =
        keccak256("flex-polling-voting");
    bytes32 internal constant FLEX_STEWARD_ALLOCATION_ADAPT =
        keccak256("flex-steward-allocation");
    bytes32 internal constant FLEX_INVESTMENT_PAYBACI_TOKEN_ADAPT =
        keccak256("flex-funding-return-token-adapter");
    bytes32 internal constant FLEX_FREE_IN_ESCROW_FUND_ADAPTER =
        keccak256("flex-free-in-escrow-fund-adapter");
    bytes32 internal constant FLEX_FUNDING_HELPER_ADAPTER =
        keccak256("flex-funding-helper-adapter");
    bytes32 internal constant FLEX_DAO_SET_ADAPTER =
        keccak256("flex-daoset-adapter");
    bytes32 internal constant FLEX_DAO_SET_HELPER_ADAPTER =
        keccak256("flex-daoset-helper-adapter");
    bytes32 internal constant FLEX_DAO_SET_POLLING_ADAPTER =
        keccak256("flex-daoset-polling-adapter");
    bytes32 internal constant FLEX_DAO_SET_VOTING_ADAPTER =
        keccak256("flex-daoset-voting-adapter");
    bytes32 internal constant FLEX_DAO_SET_PROPOSER_MEMBERSHIP_ADAPTER =
        keccak256("flex-daoset-proposer-membership-adapter");
    bytes32 internal constant FLEX_DAO_SET_INVESTOR_MEMBERSHIP_ADAPTER =
        keccak256("flex-daoset-investor-membership-adapter");
    bytes32 internal constant FLEX_DAO_SET_FEES_ADAPTER =
        keccak256("flex-daoset-fees-adapter");
    bytes32 internal constant FLEX_DAO_SET_GOVERNOR_MEMBERSHIP_ADAPTER =
        keccak256("flex-daoset-governor-membership-adapter");
    bytes32 internal constant FLEX_DAO_SET_INVESTOR_CAP_ADAPTER =
        keccak256("flex-daoset-investor-cap-adapter");
    bytes32 internal constant FLEX_GOV_VOT_ASSET_ALLOC_ADAPTER =
        keccak256("flex-gov-vot-asset-alloc-adapter");
    //---------------------------------flex---------------------------------

    //---------------------------------collective---------------------------------
    bytes32 internal constant COLLECTIVE_VOTING_ADAPTER =
        keccak256("collective-voting-adapter");
    bytes32 internal constant COLLECTIVE_DAO_SET_ADAPTER =
        keccak256("collective-daoset-adapter");
    bytes32 internal constant COLLECTIVE_INVESTMENT_POOL_ADAPTER =
        keccak256("collective-funding-pool-adapter");
    bytes32 internal constant COLLECTIVE_INVESTMENT_POOL_HELPER_ADAPTER =
        keccak256("collective-funding-pool-helper-adapter");
    bytes32 internal constant COLLECTIVE_GOVERNOR_MANAGEMENT_ADAPTER =
        keccak256("collective-governor-management-adapter");
    bytes32 internal constant COLLECTIVE_DAO_SET_HELPER_ADAPTER =
        keccak256("collective-daoset-helper-adapter");
    bytes32 internal constant COLLECTIVE_FUND_RAISE_ADAPTER =
        keccak256("collective-fund-raise-adapter");
    bytes32 internal constant COLLECTIVE_FUNDING_ADAPTER =
        keccak256("collective-funding-adapter");
    bytes32 internal constant COLLECTIVE_ALLOCATION_ADAPTER =
        keccak256("collective-allocation-adapter");
    bytes32 internal constant COLLECTIVE_PAYBACK_TOKEN_ADAPTER =
        keccak256("collective-payback-token-adapter");
    bytes32 internal constant COLLECTIVE_VESTING_ADAPTER =
        keccak256("collective-vesting-adapter");
    bytes32 internal constant COLLECTIVE_DISTRIBUTE_ADAPTER =
        keccak256("collective-distribute-adapter");
    bytes32 internal constant COLLECTIVE_TOPUP_ADAPTER =
        keccak256("collective-topup-adapter");
    bytes32 internal constant COLLECTIVE_EXPENSE_ADAPTER =
        keccak256("collective-expense-adapter");
    bytes32 internal constant COLLECTIVE_ESCROW_FUND_ADAPTER =
        keccak256("collective-escrow-fund-adapter");
    bytes32 internal constant COLLECTIVE_FREE_IN_ESCROW_FUND_ADAPTER =
        keccak256("collective-free-in-escrow-fund-adapter");
    bytes32 internal constant COLLECTIVE_CLEAR_FUND_ADAPTER =
        keccak256("collective-clear-fund-adapter");
    bytes32 internal constant COLLECTIVE_REDEMPTION_FEE_ESCROW_ADAPTER =
        keccak256("collective-redemption-fee-escrow-adapter");
    //---------------------------------collective---------------------------------
    bytes32 internal constant FUND_RAISE = keccak256("fund-raise");
    bytes32 internal constant VESTWING = keccak256("vesting");
    bytes32 internal constant BEN_TO_BOX = keccak256("ben-to-box");
    bytes32 internal constant GP_ONBOARDING_ADAPT =
        keccak256("gp-dao-onboarding");
    bytes32 internal constant FUNDING_POOL_ADAPT = keccak256("founding-pool");
    bytes32 internal constant ALLOCATION_ADAPT = keccak256("allocation");
    bytes32 internal constant ALLOCATION_ADAPTV2 = keccak256("allocationv2");
    bytes32 internal constant STREAMING_PAYMENT_ADAPT =
        keccak256("streaming-payment");
    bytes32 internal constant VOTING_ADAPT = keccak256("voting");
    bytes32 internal constant GPVOTING_ADAPT = keccak256("gp-voting");
    bytes32 internal constant GPONBOARDVOTING_ADAPT =
        keccak256("gp-onboard-voting");
    bytes32 internal constant DISTRIBUTE_FUND_ADAPT =
        keccak256("distribute-fund");
    bytes32 internal constant DISTRIBUTE_FUND_ADAPTV2 =
        keccak256("distribute-fundv2");
    bytes32 internal constant ONBOARDING = keccak256("onboarding");
    bytes32 internal constant NONVOTING_ONBOARDING =
        keccak256("nonvoting-onboarding");
    bytes32 internal constant TRIBUTE = keccak256("tribute");
    bytes32 internal constant FINANCING = keccak256("financing");
    bytes32 internal constant MANAGING = keccak256("managing");
    bytes32 internal constant RAGEQUIT = keccak256("ragequit");
    bytes32 internal constant GUILDKICK = keccak256("guildkick");
    bytes32 internal constant CONFIGURATION = keccak256("configuration");
    bytes32 internal constant DISTRIBUTE = keccak256("distribute");
    bytes32 internal constant TRIBUTE_NFT = keccak256("tribute-nft");
    bytes32 internal constant REIMBURSEMENT = keccak256("reimbursement");
    bytes32 internal constant TRANSFER_STRATEGY =
        keccak256("erc20-transfer-strategy");
    bytes32 internal constant DAO_REGISTRY_ADAPT = keccak256("daoRegistry");
    bytes32 internal constant BANK_ADAPT = keccak256("bank");
    bytes32 internal constant ERC721_ADAPT = keccak256("nft");
    bytes32 internal constant ERC1155_ADAPT = keccak256("erc1155-adpt");
    bytes32 internal constant ERC1271_ADAPT = keccak256("signatures");
    bytes32 internal constant SNAPSHOT_PROPOSAL_ADPT =
        keccak256("snapshot-proposal-adpt");
    bytes32 internal constant VOTING_HASH_ADPT = keccak256("voting-hash-adpt");
    bytes32 internal constant KICK_BAD_REPORTER_ADPT =
        keccak256("kick-bad-reporter-adpt");
    bytes32 internal constant COUPON_ONBOARDING_ADPT =
        keccak256("coupon-onboarding");
    bytes32 internal constant LEND_NFT_ADPT = keccak256("lend-nft");
    bytes32 internal constant ERC20_TRANSFER_STRATEGY_ADPT =
        keccak256("erc20-transfer-strategy");

    bytes32 internal constant RICE_REWARD_RECEIVER =
        keccak256("RICE-REWARD-RECEIVER");

    // Extensions

    /* 
    vintage extensions **************************************************************************************************
     */
    bytes32 internal constant VINTAGE_INVESTMENT_POOL_EXT =
        keccak256("vintage-funding-pool-ext");
    /* 
    vintage extensions **************************************************************************************************
     */

    /* 
    flex extensions **************************************************************************************************
     */
    bytes32 internal constant FLEX_INVESTMENT_POOL_EXT =
        keccak256("flex-funding-pool-ext");
    /* 
    flex extensions **************************************************************************************************
     */

    /*
    collective extensions **************************************************************************************************
    */
    bytes32 internal constant COLLECTIVE_INVESTMENT_POOL_EXT =
        keccak256("collective-funding-pool-ext");
    /*
    collective extensions **************************************************************************************************
    */

    bytes32 internal constant BANK = keccak256("bank");
    bytes32 internal constant RICE_STAKING_EXT = keccak256("rice-staking-ext");
    bytes32 internal constant FUNDINGPOOL_EXT = keccak256("funding-pool-ext");
    bytes32 internal constant GPDAO_EXT = keccak256("gp-dao-ext");
    bytes32 internal constant ERC1271 = keccak256("erc1271");
    bytes32 internal constant NFT = keccak256("nft");
    bytes32 internal constant EXECUTOR_EXT = keccak256("executor-ext");
    bytes32 internal constant INTERNAL_TOKEN_VESTING_EXT =
        keccak256("internal-token-vesting-ext");
    bytes32 internal constant ERC1155_EXT = keccak256("erc1155-ext");
    bytes32 internal constant ERC20_EXT = keccak256("erc20-ext");

    // Reserved Addresses
    address internal constant STAKING_RICE_POOL = address(0xDCEAC);
    address internal constant STAKING_RICE_MEMBER = address(0x12345678);
    address internal constant GUILD = address(0xdead);
    address internal constant FUNDING_POOL = address(0xFFFF);
    address internal constant DAOSQUARE_FUNDS = address(0xDDDD);
    address internal constant DAOSQUARE_TREASURY = address(0xDECD);
    address internal constant GP_POOL = address(0x1111);
    address internal constant ESCROW = address(0x4bec);
    address internal constant TOTAL = address(0xbabe);
    address internal constant UNITS = address(0xFF1CE);
    address internal constant LOCKED_UNITS = address(0xFFF1CE);
    address internal constant LOOT = address(0xB105F00D);
    address internal constant LOCKED_LOOT = address(0xBB105F00D);
    address internal constant ETH_TOKEN = address(0x0);
    address internal constant MEMBER_COUNT = address(0xDECAFBAD);

    uint8 internal constant MAX_TOKENS_GUILD_BANK = 200;

    function getActiveMemberNb(
        DaoRegistry dao
    ) internal view returns (uint256) {
        uint256 memberNb = dao.getNbMembers();
        uint256 activeMemberAmount = 0;
        for (uint8 i = 0; i < memberNb; i++) {
            if (dao.isMember(dao.getMemberAddress(i))) activeMemberAmount += 1;
        }
        return activeMemberAmount;
    }

    function getAllActiveMember(
        DaoRegistry dao
    ) internal view returns (address[] memory) {
        return dao.getAllSteward();
    }

    function getAllGorvernorBalance(
        DaoRegistry dao
    ) internal view returns (uint256) {
        address[] memory govs = getAllActiveMember(dao);
        uint256 bal;
        VintageFundingPoolExtension fundingpool = VintageFundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_EXT)
        );
        if (govs.length > 0) {
            for (uint8 i = 0; i < govs.length; i++) {
                bal += fundingpool.balanceOf(govs[i]);
            }
        }
        return bal;
    }

    // function totalTokens(BankExtension bank) internal view returns (uint256) {
    //     return memberTokens(bank, TOTAL) - memberTokens(bank, GUILD); //GUILD is accounted for twice otherwise
    // }

    /**
     * @notice calculates the total number of units.
     */
    // function priorTotalTokens(
    //     BankExtension bank,
    //     uint256 at
    // ) internal view returns (uint256) {
    //     return
    //         priorMemberTokens(bank, TOTAL, at) -
    //         priorMemberTokens(bank, GUILD, at);
    // }

    // function memberTokens(
    //     BankExtension bank,
    //     address member
    // ) internal view returns (uint256) {
    //     return
    //         bank.balanceOf(member, UNITS) +
    //         bank.balanceOf(member, LOCKED_UNITS) +
    //         bank.balanceOf(member, LOOT) +
    //         bank.balanceOf(member, LOCKED_LOOT);
    // }

    /**
     * @notice calculates the total number of units.
     */
    // function priorMemberTokens(
    //     BankExtension bank,
    //     address member,
    //     uint256 at
    // ) internal view returns (uint256) {
    //     return
    //         bank.getPriorAmount(member, UNITS, at) +
    //         bank.getPriorAmount(member, LOCKED_UNITS, at) +
    //         bank.getPriorAmount(member, LOOT, at) +
    //         bank.getPriorAmount(member, LOCKED_LOOT, at);
    // }

    //helper
    function getFlag(uint256 flags, uint256 flag) internal pure returns (bool) {
        return (flags >> uint8(flag)) % 2 == 1;
    }

    function setFlag(
        uint256 flags,
        uint256 flag,
        bool value
    ) internal pure returns (uint256) {
        if (getFlag(flags, flag) != value) {
            if (value) {
                return flags + 2 ** flag;
            } else {
                return flags - 2 ** flag;
            }
        } else {
            return flags;
        }
    }

    /**
     * @notice Checks if a given address is reserved.
     */
    function isNotReservedAddress(address addr) internal pure returns (bool) {
        return addr != GUILD && addr != TOTAL && addr != ESCROW;
    }

    /**
     * @notice Checks if a given address is zeroed.
     */
    function isNotZeroAddress(address addr) internal pure returns (bool) {
        return addr != address(0x0);
    }

    function potentialNewMember(
        address memberAddress,
        DaoRegistry dao
    ) internal {
        require(memberAddress != address(0x0), "invalid member address");
        dao.potentialNewMember(memberAddress);
        // if (address(bank) != address(0x0)) {
        //     if (bank.balanceOf(memberAddress, MEMBER_COUNT) == 0) {
        //         bank.addToBalance(memberAddress, MEMBER_COUNT, 1);
        //     }
        // }
    }

    function removeMember(address memberAddress, DaoRegistry dao) internal {
        require(memberAddress != address(0x0), "invalid member address");
        dao.removeMember(memberAddress);
    }

    // function ifGP(
    //     address memberAddress,
    //     DaoRegistry dao
    // ) internal view returns (bool) {
    //     return
    //         GPDaoExtension(dao.getExtensionAddress(DaoHelper.GPDAO_EXT))
    //             .isGeneralPartner(memberAddress);
    // }

    /**
     * A DAO is in creation mode is the state of the DAO is equals to CREATION and
     * 1. The number of members in the DAO is ZERO or,
     * 2. The sender of the tx is a DAO member (usually the DAO owner) or,
     * 3. The sender is an adapter.
     */
    // slither-disable-next-line calls-loop
    function isInCreationModeAndHasAccess(
        DaoRegistry dao
    ) internal view returns (bool) {
        return
            dao.state() == DaoRegistry.DaoState.CREATION &&
            (dao.getNbMembers() == 0 ||
                dao.isMember(msg.sender) ||
                dao.isAdapter(msg.sender));
    }

    function daoFactoryAddress(
        DaoRegistry dao
    ) internal view returns (address) {
        return DaoFactory(dao.daoFactory()).owner();
    }

    function getERC20Balance(
        address token,
        address account
    ) internal view returns (uint256) {
        return IERC20(token).balanceOf(account);
    }

    function getERC721Balance(
        address token,
        address account
    ) internal view returns (uint256) {
        return IERC721(token).balanceOf(account);
    }

    function getERC1155Balance(
        address token,
        uint256 tokenId,
        address account
    ) internal view returns (uint256) {
        return IERC1155(token).balanceOf(account, tokenId);
    }

    function getStewardInvestorNB(
        DaoRegistry dao,
        bytes32 proposalId
    ) internal view returns (uint256) {
        FlexInvestmentPoolExtension flexFungdingPoolExt = FlexInvestmentPoolExtension(
                dao.getExtensionAddress(DaoHelper.FLEX_INVESTMENT_POOL_EXT)
            );
        address[] memory investors = flexFungdingPoolExt
            .getInvestorsByProposalId(proposalId);

        uint256 nb = 0;
        for (uint8 i = 0; i < investors.length; i++) {
            if (dao.isMember(investors[i])) nb += 1;
        }
        return nb;
    }

    function getVintageFundStartTime(
        DaoRegistry dao
    ) internal view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_START_TIME);
    }

    function getVintageFundEndTime(
        DaoRegistry dao
    ) internal view returns (uint256) {
        return dao.getConfiguration(DaoHelper.FUND_END_TIME);
    }
}
