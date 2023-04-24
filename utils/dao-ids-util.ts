/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-11-10 19:00:47
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-04-21 11:28:39
 */
/**
 * @notice the ids defined in this file must match the ids added to DaoHelper.sol.
 */

/** Adapters */
export const adaptersIdsMap: Record<string, string> = {
  //vintage
  SUMMON_VINTAGE_DAO: "summon-vintage-dao",
  VINTAGE_FUNDING_POOL_ADAPTER: "vintage-funding-pool-adatper",
  VINTAGE_VOTING: "vintage-voting",
  VINTAGE_FUND_RAISE: "vintage-fund-raise",
  VINTAGE_RAISER_MANAGEMENT:"vintage-raiser-management",
  VINTAGE_FUNDING_ADAPTER:"vintage-funding-adapter",
  VINTAGE_ALLOCATION_ADAPTER:"vintage-allocation-adapter",
  VINTAGE_VESTING_ADAPTER:"vintage-vesting-adapter",
  VINTAGE_SUMMON_DAO:"vintage-summon-dao",
  //flex
  FLEX_STEWARD_MANAGEMENT: "flex-steward-management",
  FLEX_POLLING_VOTING: "flex-polling-voting",
  SUMMON_DAO: "summon-dao",
  FLEX_VESTING: "flex-vesting",
  FLEX_ERC721_ADAPT: "flex-erc721-adatper",
  FLEX_ALLOCATION_ADAPT: "flex-allocation-adatper",
  FLEX_FUNDING_POOL_ADAPTER: "flex-funding-pool-adatper",
  FLEX_VOTING: "flex-voting",
  FLEX_FUNDING: "flex-funding",
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