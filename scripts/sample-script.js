/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-12-14 11:12:22
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-01-09 22:43:52
 */
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


const deposit = async (daoAddr, proposalId, amount) => {
  const FlexFundingPoolAdapterContract = await (await hre.ethers.getContractFactory("FlexFundingPoolAdapterContract"))
    .attach("0x2CffFCc1315e3241367070c8752416eddE93524C");

  const TestToken1 = await (await hre.ethers.getContractFactory("TestToken1"))
    .attach("0x0B133Cc91a191d8d83133690019375a362B3886D");

  let tx = await TestToken1.approve(FlexFundingPoolAdapterContract.address, hre.ethers.utils.parseEther(amount));
  await tx.wait();
  console.log("deposit...");
  tx = await FlexFundingPoolAdapterContract.deposit(daoAddr, proposalId, hre.ethers.utils.parseEther(amount));
  await tx.wait();
  // const bal = await FlexFundingPoolAdapterContract.balanceOf(proposalId, this.owner.address)
}

const submitFlexDirectNoEscrowFundingProposal = async () => {
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

const submitFlexDirectEscrowFundingProposal = async () => {
  const flexFundingAdapterContract = await (await hre.ethers.getContractFactory("FlexFundingAdapterContract"))
    .attach("0xE842eC92d59914E6F45d05737c723Da15db71692");
  const daoAddr = "0xd0a0582A8e82dC63056056188ED4406E45B84692";
  console.log("flexFundingAdapterContract address", flexFundingAdapterContract.address);
  let tokenAddress = "0x0B133Cc91a191d8d83133690019375a362B3886D";
  let minFundingAmount = hre.ethers.utils.parseEther("20000");
  let maxFundingAmount = hre.ethers.utils.parseEther("50000");
  let escrow = true;
  let returnTokenAddr = "0x4fca7dEf684C9eA41729D852F16014fc796b15Bb";
  let returnTokenAmount = hre.ethers.utils.parseEther("1000000");

  let price = hre.ethers.utils.parseEther("0.6");
  let minReturnAmount = minFundingAmount.div(price).mul(hre.ethers.utils.parseEther("1"));
  let maxReturnAmount = maxFundingAmount.div(price).mul(hre.ethers.utils.parseEther("1"));

  let approverAddr = "0x540881ECaF34C85EfB352727FC2F9858B19C4b08";
  let recipientAddr = "0x540881ECaF34C85EfB352727FC2F9858B19C4b08";

  let fundingInfo = [
    tokenAddress,
    minFundingAmount,
    maxFundingAmount,
    escrow,
    returnTokenAddr,
    returnTokenAmount,
    price,
    minReturnAmount,
    maxReturnAmount,
    approverAddr,
    recipientAddr
  ];

  let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

  let vestingStartTime = blocktimestamp;
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
  let maxDepositAmount = hre.ethers.utils.parseEther("10000");
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

  let proposalInfo = await flexFundingAdapterContract.Proposals(daoAddr, ProposalId);

  console.log(`
  proposer ${proposalInfo.proposer}

  FundingInfo:
  tokenAddress ${proposalInfo.fundingInfo.tokenAddress}
  minFundingAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.minFundingAmount)}
  maxFundingAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.maxFundingAmount)}
  escrow ${proposalInfo.fundingInfo.escrow}
  returnTokenAddr ${proposalInfo.fundingInfo.returnTokenAddr}
  returnTokenAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.returnTokenAmount)}
  minReturnAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.minReturnAmount)}
  maxReturnAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.maxReturnAmount)}
  approverAddr ${proposalInfo.fundingInfo.approverAddr}
  recipientAddr ${proposalInfo.fundingInfo.recipientAddr}

  vestInfo:
  vestingStartTime  ${proposalInfo.vestInfo.vestingStartTime};
  vestingCliffDuration ${proposalInfo.vestInfo.vestingCliffDuration};
  vestingStepDuration ${proposalInfo.vestInfo.vestingStepDuration};
  vestingSteps ${proposalInfo.vestInfo.vestingSteps};
  vestingCliffLockAmount ${hre.ethers.utils.formatEther(proposalInfo.vestInfo.vestingCliffLockAmount)};
 
  fundRaiseInfo:
  fundRaiseType  ${proposalInfo.fundRaiseInfo.fundRaiseType};
  fundRaiseStartTime ${proposalInfo.fundRaiseInfo.fundRaiseStartTime};
  fundRaiseEndTime ${proposalInfo.fundRaiseInfo.fundRaiseEndTime};
  minDepositAmount ${hre.ethers.utils.formatEther(proposalInfo.fundRaiseInfo.minDepositAmount)};
  maxDepositAmount ${hre.ethers.utils.formatEther(proposalInfo.fundRaiseInfo.maxDepositAmount)};

  fundRaiseInfo -> backerIdentification:  ${proposalInfo.fundRaiseInfo.backerIdentification};
  bakckerIdentificationInfo:
  bakckerIdentificationInfo bType ${proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bType};
  bakckerIdentificationInfo bChainId ${proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bChainId};
  bakckerIdentificationInfo bTokanAddr ${proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bTokanAddr};
  bakckerIdentificationInfo bTokenId ${proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bTokenId};
  bakckerIdentificationInfo bMinHoldingAmount ${hre.ethers.utils.formatEther(proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bMinHoldingAmount)};

  priorityDeposit ${proposalInfo.fundRaiseInfo.priorityDeposit};

  fundRaiseInfo ->priorityDepositInfo:
  priorityDepositInfo pPeriod ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pPeriod};
  priorityDepositInfo pPeriods ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pPeriods};
  priorityDepositInfo pType ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pType};
  priorityDepositInfo pTokenAddr ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pTokenAddr};
  priorityDepositInfo pTokenId ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pTokenId};
  priorityDepositInfo pMinHolding ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pMinHolding};:

  proposerRewardInfo:
  tokenRewardAmount ${hre.ethers.utils.formatEther(proposalInfo.proposerRewardInfo.tokenRewardAmount)};
  cashRewardAmount ${hre.ethers.utils.formatEther(proposalInfo.proposerRewardInfo.cashRewardAmount)};

  startVoteTime ${proposalInfo.startVoteTime}
  stopVoteTime ${proposalInfo.stopVoteTime}
  state  ${proposalInfo.state}
  `);
}

const transfer = async () => {
  const testtoken1 = await (await hre.ethers.getContractFactory("TestToken1"))
    .attach("0x0B133Cc91a191d8d83133690019375a362B3886D");

  await testtoken1.transfer("0x059A6151bE53dCe46dcA5AA0a290F72729Eb8FdA", hre.ethers.utils.parseEther("1000"));

  const bal = await testtoken1.balanceOf("0x059A6151bE53dCe46dcA5AA0a290F72729Eb8FdA");
  console.log(hre.ethers.utils.formatEther(bal));
}


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



  // const FundingPoolAdapterContract = await hre.ethers.getContractFactory("FundingPoolAdapterContract");
  // const fundingpool = await FundingPoolAdapterContract.deploy();
  // await fundingpool.deployed();

  // console.log(`
  // funding pool adapter deployed address ${fundingpool.address}
  // `);

  await transfer();

  // await deposit("0xd0a0582A8e82dC63056056188ED4406E45B84692", "0x466c657846756e64696e67233900000000000000000000000000000000000000", "10000");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



// submitFlexDirectEscrowFundingProposal()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
