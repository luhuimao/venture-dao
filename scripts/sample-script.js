// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const {
  toBN,
  toWei,
  fromUtf8,
  fromAscii,
  unitPrice,
  UNITS,
  ETH_TOKEN,
  sha3,
  numberOfUnits,
  maximumChunks,
  maxAmount,
  maxUnits,
  ZERO_ADDRESS
} = require("../utils/contract-util");
async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  // const TestToken1 = await hre.ethers.getContractFactory("TestToken1");
  // const testToken1 = await TestToken1.deploy(100000000);

  // await testToken1.deployed();

  // console.log("TestToken1 deployed to:", testToken1.address);


  // const sha3ricestaking = sha3("rice-staking");
  // const sha3foundingpool = sha3("founding-pool");

  // console.log("sha3 rice-staking: ", sha3ricestaking);
  // console.log("sha3 founding-pool: ", sha3foundingpool);



  const FundingPoolAdapterContract = await hre.ethers.getContractFactory("FundingPoolAdapterContract");
  const fundingpool = await FundingPoolAdapterContract.deploy();
  await fundingpool.deployed();

  console.log(`
  funding pool adapter deployed address ${fundingpool.address}
  `);


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });


const submitFlexFundingProposal = async () => {
  const flexFundingAdapterContract = await (await hre.ethers.getContractFactory("FlexFundingAdapterContract")).attach("0x9E22eAa53E65514CAC8954641e8d1358655CB5f9");
  const daoAddr = "0xd0a0582A8e82dC63056056188ED4406E45B84692";
  console.log("flexFundingAdapterContract address", flexFundingAdapterContract.address);
  let tokenAddress = "0x0B133Cc91a191d8d83133690019375a362B3886D";
  let minFundingAmount = hre.ethers.utils.parseEther("50000");
  let maxFundingAmount = hre.ethers.utils.parseEther("100000");
  let escrow = false;
  let returnTokenAddr = "0x4fca7dEf684C9eA41729D852F16014fc796b15Bb";
  let returnTokenAmount = hre.ethers.utils.parseEther("1000000");
  let minReturnAmount = hre.ethers.utils.parseEther("1000000");
  let maxReturnAmount = hre.ethers.utils.parseEther("1000000");
  let approverAddr = "0x540881ECaF34C85EfB352727FC2F9858B19C4b08";
  let recipientAddr = "0x540881ECaF34C85EfB352727FC2F9858B19C4b08";

  let fundingInfo = [
    tokenAddress,
    minFundingAmount,
    maxFundingAmount,
    escrow,
    returnTokenAddr,
    returnTokenAmount,
    minReturnAmount,
    maxReturnAmount,
    approverAddr,
    recipientAddr
  ];

  let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

  let vestingStartTime = blocktimestamp + 100000;
  let vestingCliffDuration = 600;
  let vestingStepDuration = 600;
  let vestingSteps = 10;
  let vestingCliffLockAmount = hre.ethers.utils.parseEther("1000");

  let vestInfo = [
    vestingStartTime,
    vestingCliffDuration,
    vestingStepDuration,
    vestingSteps,
    vestingCliffLockAmount
  ];

  let fundRaiseType = 0;
  let fundRaiseStartTime = blocktimestamp;
  let fundRaiseEndTime = fundRaiseStartTime + 60 * 10;
  let minDepositAmount = hre.ethers.utils.parseEther("1000");
  let maxDepositAmount = hre.ethers.utils.parseEther("100000");
  let backerIdentification = false;

  let bType = 0;
  let bChainId = 1;
  let bTokanAddr = "0x0B133Cc91a191d8d83133690019375a362B3886D";
  let bTokenId = 1;
  let bMinHoldingAmount = 100;
  let bakckerIdentificationInfo = [
    bType,
    bChainId,
    bTokanAddr,
    bTokenId,
    bMinHoldingAmount
  ];

  let priorityDeposit = true;

  let pPeriod = 100;
  let pPeriods = 10;
  let pType = 0;
  let pChainId = 1;
  let pTokenAddr = "0x0B133Cc91a191d8d83133690019375a362B3886D";
  let pTokenId = 1;
  let pMinHolding = 10;

  let priorityDepositInfo = [
    pPeriod,
    pPeriods,
    pType,
    pChainId,
    pTokenAddr,
    pTokenId,
    pMinHolding
  ];

  let fundRaiseInfo = [
    fundRaiseType,
    fundRaiseStartTime,
    fundRaiseEndTime,
    minDepositAmount,
    maxDepositAmount,
    backerIdentification,
    bakckerIdentificationInfo,
    priorityDeposit,
    priorityDepositInfo
  ];

  let tokenRewardAmount = 2;
  let cashRewardAmount = hre.ethers.utils.parseEther("100");
  let proposerRewardInfos = [
    tokenRewardAmount,
    cashRewardAmount
  ];
  const fundingParams = [
    fundingInfo,
    vestInfo,
    fundRaiseInfo,
    proposerRewardInfos
  ];
  console.log("fundingParams", fundingParams);
  const tx = await flexFundingAdapterContract.submitProposal(daoAddr, fundingParams);
  const result = await tx.wait();

  const ProposalId = result.events[2].args.proposalId;
  console.log(`ProposalId: ${hre.ethers.utils.toUtf8String(ProposalId)}`);

}

submitFlexFundingProposal()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
