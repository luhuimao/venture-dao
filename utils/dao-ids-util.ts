/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-11-10 19:00:47
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-10-11 13:43:14
 */
/**
 * @notice the ids defined in this file must match the ids added to DaoHelper.sol.
 */

/** Adapters */
export const adaptersIdsMap: Record<string, string> = {
  /*******************collective**********************/
  SUMMON_COLLECTIVE_DAO: "summon-collecgtive-dao",
  COLLECTIVE_GOVERNOR_MANAGEMENT: "collective-governor-management-adapter",
  COLLECTIVE_DAO_SET_ADAPTER: "collective-daoset-adapter",
  COLLECTIVE_FUNDING_ADAPTER: "collective-funding-adapter",
  COLLECTIVE_VOTING_ADAPTER: "collective-voting-adapter",
  COLLECTIVE_FUNDING_POOL_ADAPTER: "collective-funding-pool-adapter",
  COLLECTIVE_FUND_RAISE_ADAPTER: "collective-fund-raise-adapter",
  COLLECTIVE_PAYBACK_TOKEN_ADAPTER: "collective-payback-token-adapter",
  COLLECTIVE_ALLOCATION_ADAPTER: "collective-allocation-adapter",
  COLLECTIVE_DISTRIBUTE_ADAPTER: "collective-distribute-adapter",
  COLLECTIVE_TOP_UP_ADAPTER: "collective-topup-adapter",
  COLLECTIVE_EXPENSE_ADAPTER: "collective-expense-adapter",
  COLLECTIVE_VESTING_ADAPTER: "collective-vesting-adapter",
  COLLECTIVE_ESCROW_FUND_ADAPTER: "collective-escrow-fund-adapter",
  COLLECTIVE_ENPENSE_ADAPTER: "collective-expense-adapter",
  COLLECTIVE_TOP_UP_ADAPTER: "collective-topup-adapter",
  COLLECTIVE_FREE_IN_ESCROW_FUND_ADAPTER: "collective-free-in-escrow-fund-adapter",
  COLLECTIVE_CLEAR_FUND_ADAPTER: "collective-clear-fund-adapter",
  COLLECTIVE_REDEMPTION_FEE_ESCROW_ADAPTER: "collective-redemption-fee-escrow-adapter",
  /*******************collective end**********************/

  /*******************vintage**********************/
  SUMMON_VINTAGE_DAO: "summon-vintage-dao",
  VINTAGE_FUNDING_POOL_ADAPTER: "vintage-funding-pool-adatper",
  VINTAGE_FUNDING_POOL_ADAPTER_HELPER: "vintage-funding-pool-adatper-helper",
  VINTAGE_VOTING: "vintage-voting",
  VINTAGE_FUND_RAISE: "vintage-fund-raise",
  VINTAGE_RAISER_MANAGEMENT: "vintage-raiser-management",
  VINTAGE_FUNDING_ADAPTER: "vintage-funding-adapter",
  VINTAGE_ALLOCATION_ADAPTER: "vintage-allocation-adapter",
  VINTAGE_VESTING_ADAPTER: "vintage-vesting-adapter",
  VINTAGE_SUMMON_DAO: "vintage-summon-dao",
  VINTAGE_ESCROW_FUND_ADAPTER: "vintage-escrow-fund",
  VINTAGE_VESTING_ERC721_ADAPTER: "vintage-vesting-erc721",
  VINTAGE_VESTING_ERC721_HELPER_ADAPTER: "vintage-vesting-erc721-helper",
  VINTAGE_RAISER_ALLOCATION: "vintage-raiser-allocation",
  VINTAGE_DISTRIBUTE_ADAPTER: "vintage-distribute-adapter",
  VINTAGE_FUNDING_RETURN_TOKEN_ADAPTER: "vintage-funding-return-token-adapter",
  VINTAGE_FREE_IN_ESCORW_FUND_ADAPTER: "vintage-free-in-escrow-fund-adapter",
  VINTAGE_DAOSET_ADAPTER: "vintage-daoset-adapter",
  VINTAGE_DAOSET_HELPER_ADAPTER: "vintage-daoset-helper-adapter",
  /*******************vintage end******************/


  /*******************flex**********************/
  FLEX_VESTING_ERC721_HELPER_ADAPTER: "flex-vesting-erc721-helper",
  FLEX_VESTING_ERC721_ADAPTER: "flex-vesting-erc721",
  FLEX_STEWARD_MANAGEMENT: "flex-steward-management",
  FLEX_POLLING_VOTING: "flex-polling-voting",
  SUMMON_DAO: "summon-dao",
  FLEX_VESTING: "flex-vesting",
  FLEX_ERC721_ADAPT: "flex-erc721-adatper",
  FLEX_ALLOCATION_ADAPT: "flex-allocation-adatper",
  FLEX_FUNDING_POOL_ADAPTER: "flex-funding-pool-adatper",
  FLEX_VOTING: "flex-voting",
  FLEX_FUNDING: "flex-funding",
  FLEX_STEWARD_ALLOCATION_ADAPT: "flex-steward-allocation",
  FLEX_FUNDING_RETURN_TOKEN_ADAPT: "flex-funding-return-token-adapter",
  FLEX_FREE_IN_ESCROW_FUND_ADAPTER: "flex-free-in-escrow-fund-adapter",
  FLEX_FUNDING_HELPER_ADAPTER: "flex-funding-helper-adapter",
  FLEX_DAO_SET_ADAPTER: "flex-daoset-adapter",
  FLEX_DAO_SET_FEES_ADAPTER: "flex-daoset-fees-adapter",
  FLEX_DAO_SET_GOVERNOR_MEMBERSHIP_ADAPTER: "flex-daoset-governor-membership-adapter",
  FLEX_DAO_SET_INVESTOR_CAP_ADAPTER: "flex-daoset-investor-cap-adapter",
  FLEX_DAO_SET_INVESTOR_MEMBERSHIP_ADAPTER: "flex-daoset-investor-membership-adapter",
  FLEX_DAO_SET_HELPER_ADAPTER: "flex-daoset-helper-adapter",
  FLEX_DAO_SET_POLLING_ADAPTER: "flex-daoset-polling-adapter",
  FLEX_DAO_SET_PROPOSER_MEMBERSHIP_ADAPTER: "flex-daoset-proposer-membership-adapter",
  FLEX_DAO_SET_VOTING_ADAPTER: "flex-daoset-voting-adapter",
  FLEX_GOV_VOT_ASSET_ALLOC_ADAPTER:"flex-gov-vot-asset-alloc-adapter",
  /*******************flex end******************/
  FUND_RAISE: "fund-raise",
  VESTING: "vesting",
  BEN_TO_BOX: "ben-to-box",
  GP_KICK_ADAPTER: "gp-kick",
  GP_DAO_ONBOARDING_ADAPTER: "gp-dao-onboarding",
  GP_DAO_ADAPTER: "gp-dao",
  STREAMING_PAYMENT_ADAPTER: "streaming-payment",
  MANAGE_MEMBER_ADAPTER: "manage-member",
  ALLOCATION_ADAPTER: "allocation",
  ALLOCATION_ADAPTERV2: "allocationv2",
  VOTING_ADAPTER: "voting",
  GPVOTING_ADAPTER: "gp-voting",
  GP_ONBOARD_VOTING_ADAPTER: "gp-onboard-voting",
  DISTRIBUTE_FUND_ADAPTER: "distribute-fund",
  DISTRIBUTE_FUND_ADAPTERV2: "distribute-fundv2",
  FOUNDING_POOL_ADAPTER: "founding-pool",
  RICE_STAKING_ADAPTER: "rice-staking",
  ONBOARDING_ADAPTER: "onboarding",
  NONVOTING_ONBOARDING_ADAPTER: "nonvoting-onboarding",
  TRIBUTE_ADAPTER: "tribute",
  FINANCING_ADAPTER: "financing",
  MANAGING_ADAPTER: "managing",
  RAGEQUIT_ADAPTER: "ragequit",
  GUILDKICK_ADAPTER: "guildkick",
  CONFIGURATION_ADAPTER: "configuration",
  TRIBUTE_NFT_ADAPTER: "tribute-nft",
  TRANSFER_STRATEGY_ADAPTER: "erc20-transfer-strategy",
  DAO_REGISTRY_ADAPTER: "daoRegistry",
  BANK_ADAPTER: "bank",
  ERC721_ADAPTER: "nft",
  ERC1155_ADAPTER: "erc1155-adpt",
  ERC1271_ADAPTER: "signatures",
  SNAPSHOT_PROPOSAL_ADAPTER: "snapshot-proposal-adpt",
  VOTING_HASH_ADAPTER: "voting-hash-adpt",
  KICK_BAD_REPORTER_ADAPTER: "kick-bad-reporter-adpt",
  COUPON_ONBOARDING_ADAPTER: "coupon-onboarding",
  KYC_ONBOARDING_ADAPTER: "kyc-onboarding",
  LEND_NFT_ADAPTER: "lend-nft",
  ERC20_TRANSFER_STRATEGY_ADAPTER: "erc20-transfer-strategy",
  REIMBURSEMENT_ADAPTER: "reimbursement"
};

/** Extensions */
export const extensionsIdsMap: Record<string, string> = {
  COLLECTIVE_FUNDING_POOL_EXT: "collective-funding-pool-ext",
  FLEX_FUNDING_POOL_EXT: "flex-funding-pool-ext",
  VINTAGE_FUNDING_POOL_EXT: "vintage-funding-pool-ext",
  BANK_EXT: "bank",
  FUNDING_POOL_EXT: "funding-pool-ext",
  RICE_STAKING_EXT: "rice-staking-ext",
  ERC1271_EXT: "erc1271",
  ERC721_EXT: "nft",
  EXECUTOR_EXT: "executor-ext",
  VESTING_EXT: "internal-token-vesting-ext",
  ERC1155_EXT: "erc1155-ext",
  ERC20_EXT: "erc20-ext",
  GP_DAO_EXT: "gp-dao-ext"
};