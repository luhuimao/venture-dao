pragma solidity ^0.8.0;
import "../extensions/bank/Bank.sol";
import "../extensions/gpdao/GPDao.sol";
import "../core/DaoRegistry.sol";

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
        IN_PROGRESS,
        DONE,
        FAILED
    }
    uint256 internal constant ONE_WEEK = 60 * 60 * 24 * 7;
    uint256 internal constant TWO_WEEK = 60 * 60 * 24 * 14;
    uint256 internal constant ONE_MONTH = 60 * 60 * 24 * 30;
    uint256 internal constant TWO_MONTH = 60 * 60 * 24 * 60;
    uint256 internal constant THREE_MONTH = 60 * 60 * 24 * 90;
    uint256 internal constant ONE_YEAR = 60 * 60 * 24 * 365;

    // flex proposer setting
    bytes32 internal constant FLEX_MANAGEMENT_FEE_TYPE =
        keccak256("FLEX_MANAGEMENT_FEE_TYPE");
    bytes32 internal constant FLEX_MANAGEMENT_FEE_AMOUNT =
        keccak256("FLEX_MANAGEMENT_FEE_AMOUNT");
    bytes32 internal constant FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS =
        keccak256("FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS");
    bytes32 internal constant FLEX_PROTOCOL_FEE =
        keccak256("FLEX_PROTOCOL_FEE");
    bytes32 internal constant FLEX_PROPOSER_TOKEN_ADDRESS =
        keccak256("FLEX_PROPOSER_TOKEN_ADDRESS");
    bytes32 internal constant FLEX_PROPOSER_TOKENID =
        keccak256("FLEX_PROPOSER_TOKENID");
    bytes32 internal constant FLEX_PROPOSER_MIN_HOLDING =
        keccak256("FLEX_PROPOSER_MIN_HOLDING");
    //PPM
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
    bytes32 internal constant FUND_RAISING_LOCKUP_PERIOD =
        keccak256("FUND_RAISING_LOCKUP_PERIOD");
    bytes32 internal constant FUND_RAISING_REDEMPTION =
        keccak256("FUND_RAISING_REDEMPTION");
    bytes32 internal constant FUND_RAISING_REDEMPTION_PERIOD =
        keccak256("FUND_RAISING_REDEMPTION_PERIOD");
    bytes32 internal constant FUND_RAISING_REDEMPTION_DURATION =
        keccak256("FUND_RAISING_REDEMPTION_DURATION");
    bytes32 internal constant FUND_RAISING_TERM =
        keccak256("FUND_RAISING_TERM");
    bytes32 internal constant FUND_START_TIME = keccak256("FUND_START_TIME");
    bytes32 internal constant FUND_END_TIME = keccak256("FUND_END_TIME");
    bytes32 internal constant REWARD_FOR_PROPOSER =
        keccak256("REWARD_FOR_PROPOSER");
    bytes32 internal constant REWARD_FOR_GP = keccak256("REWARD_FOR_GP");
    bytes32 internal constant MANAGEMENT_FEE = keccak256("MANAGEMENT_FEE");
    bytes32 internal constant MANAGEMENT_FEE_PER_YEAR =
        keccak256("MANAGEMENT_FEE_PER_YEAR");
    bytes32 internal constant REDEMPTION_FEE = keccak256("REDEMPTION_FEE");
    bytes32 internal constant PROTOCOL_FEE = keccak256("PROTOCOL_FEE");
    bytes32 internal constant GP_MIN_INVESTMENT_AMOUNT =
        keccak256("GP_MIN_INVESTMENT_AMOUNT");

    //voting
    bytes32 internal constant QUORUM = keccak256("voting.quorum");
    bytes32 internal constant SUPER_MAJORITY =
        keccak256("voting.supermajority");
    bytes32 constant VotingPeriod =
        keccak256("voting.gpOnboardingVotingPeriod");
    bytes32 constant GracePeriod =
        keccak256("voting.gpOnboardingVotingGracePeriod");

    //Token
    //rice
    bytes32 internal constant RICE_TOKEN_ADDRESS =
        keccak256("rice.token.address");

    //funding proposal
    bytes32 internal constant PROPOSAL_DURATION =
        keccak256("distributeFund.proposalDuration");
    bytes32 internal constant PROPOSAL_INTERVAL =
        keccak256("distributeFund.proposalInterval");
    bytes32 internal constant PROPOSAL_EXECUTE_DURATION =
        keccak256("PROPOSAL_EXECUTE_DURATION");

    // Adapters
    bytes32 internal constant FLEX_FUNDING_POOL_ADAPT =
        keccak256("flex-funding-pool-adatper");
    bytes32 internal constant FLEX_FUNDING_ADAPT = keccak256("flex-funding");
    bytes32 internal constant FLEX_VOTING_ADAPT = keccak256("flex-voting");
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

    // Extensions
    bytes32 internal constant FLEX_FUNDING_POOL_EXT =
        keccak256("flex-funding-pool-ext");
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

    function totalTokens(BankExtension bank) internal view returns (uint256) {
        return memberTokens(bank, TOTAL) - memberTokens(bank, GUILD); //GUILD is accounted for twice otherwise
    }

    /**
     * @notice calculates the total number of units.
     */
    function priorTotalTokens(BankExtension bank, uint256 at)
        internal
        view
        returns (uint256)
    {
        return
            priorMemberTokens(bank, TOTAL, at) -
            priorMemberTokens(bank, GUILD, at);
    }

    function memberTokens(BankExtension bank, address member)
        internal
        view
        returns (uint256)
    {
        return
            bank.balanceOf(member, UNITS) +
            bank.balanceOf(member, LOCKED_UNITS) +
            bank.balanceOf(member, LOOT) +
            bank.balanceOf(member, LOCKED_LOOT);
    }

    /**
     * @notice calculates the total number of units.
     */
    function priorMemberTokens(
        BankExtension bank,
        address member,
        uint256 at
    ) internal view returns (uint256) {
        return
            bank.getPriorAmount(member, UNITS, at) +
            bank.getPriorAmount(member, LOCKED_UNITS, at) +
            bank.getPriorAmount(member, LOOT, at) +
            bank.getPriorAmount(member, LOCKED_LOOT, at);
    }

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
                return flags + 2**flag;
            } else {
                return flags - 2**flag;
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

    function potentialNewMember(address memberAddress, DaoRegistry dao)
        internal
    {
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

    function ifGP(address memberAddress, DaoRegistry dao)
        internal
        view
        returns (bool)
    {
        return
            GPDaoExtension(dao.getExtensionAddress(DaoHelper.GPDAO_EXT))
                .isGeneralPartner(memberAddress);
    }

    /**
     * A DAO is in creation mode is the state of the DAO is equals to CREATION and
     * 1. The number of members in the DAO is ZERO or,
     * 2. The sender of the tx is a DAO member (usually the DAO owner) or,
     * 3. The sender is an adapter.
     */
    // slither-disable-next-line calls-loop
    function isInCreationModeAndHasAccess(DaoRegistry dao)
        internal
        view
        returns (bool)
    {
        return
            dao.state() == DaoRegistry.DaoState.CREATION &&
            (dao.getNbMembers() == 0 ||
                dao.isMember(msg.sender) ||
                dao.isAdapter(msg.sender));
    }
}
