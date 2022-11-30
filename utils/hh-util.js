// Whole-script strict mode syntax
"use strict";

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

const {
  provider,
} = require("@openzeppelin/test-environment");
const log = console.log;
require("dotenv").config();

const {
  unitPrice,
  numberOfUnits,
  maximumChunks,
  maxAmount,
  maxUnits,
  ETH_TOKEN,
  UNITS,
  toBN,
  sha3,
  fromAscii,
  waitTx,
  ZERO_ADDRESS
} = require("./contract-util.js");

const { expect } = require("chai");
const { expectRevert } = require("@openzeppelin/test-helpers");
const { deployDao } = require("./deployment-util1.js");
const {
  contracts: allContractConfigs,
} = require("../migrations/configs/test.config");
const { ContractType } = require("../migrations/configs/contracts.config");
const hre = require("hardhat");
// import * as boutils from './boutils';
import * as config from '../.config';
const { exec } = require('node:child_process');

const ReplaceLine = (filename, srcStr, dstStr) => {
  let cmdStr = "sed -i -e   's/" + srcStr + '/' + dstStr + "/g' " + filename;
  console.log(cmdStr);
  exec(cmdStr, function (err, stdout, stderr) { });
}

const getOrCreateDaoArtifacts = async (from) => {
  let daoArtifacts;
  const factory = await hre.ethers.getContractFactory(
    "DaoArtifacts"
  );
  if (process.env.DAO_ARTIFACTS_CONTRACT_ADDR) {
    log("Attach to existing DaoArtifacts contract");
    daoArtifacts = await factory.attach(
      process.env.DAO_ARTIFACTS_CONTRACT_ADDR
    );
  } else {
    log("Creating new DaoArtifacts contract");
    const daoArtifact = await factory.connect(from).deploy();
    daoArtifacts = await daoArtifact.deployed();
  }
  log(`DaoArtifacts: ${daoArtifacts.address}`);
  return daoArtifacts;
};


const deployFunction = async (contractInterface, args, from) => {
  if (!contractInterface) throw Error("undefined contract interface");
  const contractConfig = allContractConfigs.find(
    (c) => c.name === contractInterface.contractName
  );

  // const f = from ? from : accounts[0];
  let instance;

  // Attempt to load the contract from the DaoArtifacts to save deploy gas
  // const daoArtifacts = await getOrCreateDaoArtifacts(from);

  // const artifactsOwner = process.env.DAO_ARTIFACTS_OWNER_ADDR
  //   ? process.env.DAO_ARTIFACTS_OWNER_ADDR
  //   : process.env.DAO_OWNER_ADDR;

  // const contractAddress = await daoArtifacts.getArtifactAddress(
  //   sha3(contractConfig.name),
  //   from.address,
  //   fromAscii(contractConfig.version).padEnd(66, "0"),
  //   contractConfig.type
  // );
  // if (contractAddress && contractAddress !== ZERO_ADDRESS) {
  //   log(`
  //   Contract attached '${contractConfig.name}'
  //   -------------------------------------------------
  //   contract address: ${contractAddress}`);
  //   instance = await attach(contractInterface, contractAddress);
  // }
  // else {
  if (contractConfig.type === ContractType.Factory) {
    const factoryAddress = config.getFactoryAddressByName(contractConfig.name, hre.network.name);
    if (factoryAddress) {
      console.log(`reuse ${contractConfig.name} address: ${factoryAddress}`);
      instance = (await hre.ethers.getContractFactory(contractConfig.name)).connect(from).attach(factoryAddress);
    } else {
      const identity = await (await args[0]).deploy();
      await identity.deployed();
      instance = await (await contractInterface).connect(from).deploy(...[identity.address].concat(args.slice(1)));
      await instance.deployed();

      console.log(`new ${contractConfig.name} address:`, instance.address);

      // let flag = '\\/\\/REPLACE_FLAG';
      // let key = contractConfig.name + '_' + hre.network.name.toUpperCase();
      // ReplaceLine('.config.ts', key + '.*' + flag, key + ' = "' + instance.address + '"; ' + flag);
    }
  } else {
    const adapterAddress = config.getContractAddressByName(contractInterface.contractName, hre.network.name);
    if (adapterAddress) {
      console.log(`reuse ${contractInterface.contractName} address: ${adapterAddress}`);
      instance = (await hre.ethers.getContractFactory(contractInterface.contractName)).connect(from).attach(adapterAddress);
    } else {
      if (args) {
        instance = await (await contractInterface).connect(from).deploy(...args);
        await instance.deployed();
      } else {
        instance = await (await contractInterface).connect(from).deploy();
        await instance.deployed();
      }
    }

  }
  log(`${contractInterface.contractName} deployed address ${instance.address}`);
  // if (
  //   // Add the new contract to DaoArtifacts, should not store Core, Extension & Test contracts
  //   contractConfig.type === ContractType.Factory ||
  //   contractConfig.type === ContractType.Adapter ||
  //   contractConfig.type === ContractType.Util
  // ) {
  //   await waitTx(
  //     daoArtifacts.connect(from).addArtifact(
  //       sha3(contractConfig.name),
  //       fromAscii(contractConfig.version).padEnd(66, "0"),
  //       instance.address,
  //       contractConfig.type
  //     )
  //   );
  // }
  // }

  return { instance, configs: contractConfig };
};

const getContractFromHardhat = (c) => {
  return hre.ethers.getContractFactory(c.substring(c.lastIndexOf("/") + 1))
};

const getHardhatContracts = (contracts) => {
  return contracts
    .filter((c) => c.enabled)
    .reduce((previousValue, contract) => {
      previousValue[contract.name] = getContractFromHardhat(contract.path);
      previousValue[contract.name].contractName = contract.name;
      return previousValue;
    }, {});
};

const getDefaultOptions = async (options) => {
  const currentTimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
  let [owner, user1, user2, project_team1, , , , , , DAOSquare, GP] = await hre.ethers.getSigners();
  return {
    flexFundingType: options.flexFundingType === undefined ? 0 : options.flexFundingType,
    daoSquareAddress: options.daoSquareAddress === undefined ? DAOSquare.address : options.daoSquareAddress,
    gpAddress: options.gpAddress === undefined ? GP.address : options.gpAddress,
    quorum: options.quorum === undefined ? 60 : options.quorum,
    sumperMajority: options.superMajority === undefined ? 66 : options.superMajority,
    gpAllocationBonusRadio: options.gpAllocationBonusRadio === undefined ? 3 : options.gpAllocationBonusRadio,
    riceStakeAllocationRadio: options.riceStakerAllocationRadio === undefined ? 10 : options.riceStakerAllocationRadio,
    votingPeriod: options.votingPeriod === undefined ? 600 : options.votingPeriod,
    gracePeriod: options.gracePeriod === undefined ? 1 : options.gracePeriod,
    proposalDuration: options.proposalDuration === undefined ? 600 : options.proposalDuration,
    proposalInterval: options.proposalInterval === undefined ? 600 : options.proposalInterval,
    proposalExecuteDurantion: options.proposalExecuteDurantion === undefined ? 600 : options.proposalExecuteDurantion,
    // fundRaisingCurrencyAddress: options.fundRaisingCurrencyAddress === undefined ? "0x7570263Be9A6D430F2ca19f8afbe28BA760618F2" : options.fundRaisingCurrencyAddress,
    fundRaisingTarget: options.fundRaisingTarget === undefined ? hre.ethers.utils.parseEther("10000") : options.fundRaisingTarget,
    fundRaisingMax: options.fundRaisingMax === undefined ? hre.ethers.utils.parseEther("1000000") : options.fundRaisingMax,
    fundRaisingMinInvestmentAmountOfLP: options.fundRaisingMinInvestmentAmountOfLP === undefined ? hre.ethers.utils.parseEther("1000") : options.fundRaisingMinInvestmentAmountOfLP,
    fundRaisingMaxInvestmentAmountOfLP: options.fundRaisingMaxInvestmentAmountOfLP === undefined ? hre.ethers.utils.parseEther("1000000") : options.fundRaisingMaxInvestmentAmountOfLP,
    fundRaisingWindowBegin: options.fundRaisingWindowBegin === undefined ? currentTimestamp + 40 : options.fundRaisingWindowBegin,
    fundRaisingWindowEnd: options.fundRaisingWindowEnd === undefined ? currentTimestamp + 2000 : options.fundRaisingWindowEnd,
    fundRaisingLockupPeriod: options.fundRaisingLockupPeriod === undefined ? 7776000 : options.fundRaisingLockupPeriod,
    fundRaisingRedemption: options.fundRaisingRedemption === undefined ? 0 : options.fundRaisingRedemption,
    fundRaisingRedemptionPeriod: options.fundRaisingRedemptionPeriod === undefined ? 86400 : options.fundRaisingRedemptionPeriod,
    fundRaisingRedemptionDuration: options.fundRaisingRedemptionPeriod === undefined ? 3600 : options.fundRaisingRedemptionPeriod,
    fundRaisingTerm: options.fundRaisingTerm === undefined ? 209952000 : options.fundRaisingTerm,
    fundStartTime: options.fundStartTime === undefined ? currentTimestamp + 2010 : options.fundStartTime,
    fundEndTime: options.fundEndTime === undefined ? currentTimestamp + 2510000 : options.fundEndTime,
    rewardForProposer: options.rewardForProposer === undefined ? 5 : options.rewardForProposer,
    rewardForGP: options.rewardForGP === undefined ? 1 : options.rewardForGP,
    managementFee: options.managementFee === undefined ? 2 : options.managementFee,
    managementFeePerYear: options.managementFeePerYear === undefined ? 2 : options.managementFeePerYear,
    protocolFee: options.protocolFee === undefined ? 3 : options.protocolFee,
    redemptionFee: options.redemptionFee === undefined ? 5 : options.redemptionFee,
    serviceFeeRatio: 5,
    unitPrice: unitPrice,
    nbUnits: numberOfUnits,
    tokenAddr: ETH_TOKEN,
    maxChunks: maximumChunks,
    maxAmount,
    maxUnits,
    chainId: 1,
    maxExternalTokens: 100,
    minFundsForLP: 100,
    minFundsForGP: hre.ethers.utils.parseEther("1000"),
    couponCreatorAddress: "0x7D8cad0bbD68deb352C33e80fccd4D8e88b4aBb8",
    kycMaxMembers: 1000,
    kycSignerAddress: "0x7D8cad0bbD68deb352C33e80fccd4D8e88b4aBb8",
    kycFundTargetAddress: "0x823A19521A76f80EC49670BE32950900E8Cd0ED3",
    deployTestTokens: true,
    erc20TokenName: "Test Token",
    erc20TokenSymbol: "TTK",
    erc20TokenDecimals: Number(0),
    erc20TokenAddress: UNITS,
    supplyTestToken1: 10000000000,
    supplyTestToken2: 10000000000,
    supplyTestRiceToken: 10000000000,
    supplyPixelNFT: 100,
    supplyOLToken: toBN("1000000000000000000000000"),
    erc1155TestTokenUri: "1155 test token",
    maintainerTokenAddress: UNITS,
    finalize: options.finalize === undefined || !!options.finalize,
    ...options, // to make sure the options from the tests override the default ones
    gasPriceLimit: "2000000000000",
    spendLimitPeriod: "259200",
    spendLimitEth: "2000000000000000000000",
    feePercent: "110",
    gasFixed: "50000",
    gelato: "0x1000000000000000000000000000000000000000",
  };
};
// const advanceTime = async (time) => {
//   await new Promise((resolve, reject) => {
//     web3.currentProvider.send(
//       {
//         jsonrpc: "2.0",
//         method: "evm_increaseTime",
//         params: [time],
//         id: new Date().getTime(),
//       },
//       (err, result) => {
//         if (err) {
//           return reject(err);
//         }
//         return resolve(result);
//       }
//     );
//   });

//   await new Promise((resolve, reject) => {
//     web3.currentProvider.send(
//       {
//         jsonrpc: "2.0",
//         method: "evm_mine",
//         id: new Date().getTime(),
//       },
//       (err, result) => {
//         if (err) {
//           return reject(err);
//         }
//         return resolve(result);
//       }
//     );
//   });

//   return true;
// };

const takeChainSnapshot = async () => {
  return await new Promise((resolve, reject) =>
    provider.send(
      {
        jsonrpc: "2.0",
        method: "evm_snapshot",
        id: new Date().getTime(),
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        let snapshotId = result.result; // {"id":X,"jsonrpc":"2.0","result":"0x..."}
        return resolve(snapshotId);
      }
    )
  );
};

const revertChainSnapshot = async (snapshotId) => {
  return await new Promise((resolve, reject) =>
    provider.send(
      {
        jsonrpc: "2.0",
        method: "evm_revert",
        params: [snapshotId],
        id: new Date().getTime(),
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    )
  ).catch((e) => console.error(e));
};

const proposalIdGenerator = () => {
  var idCounter = 0;
  return {
    *generator() {
      idCounter++;
      const str = "" + idCounter;

      return `0x${str.padStart(64, "0")}`;
    },
  };
};


const hhContracts = getHardhatContracts(allContractConfigs);
const deployDefaultDao = async (options) => {
  const newOpts = await getDefaultOptions(options);
  const result = await deployDao({
    ...newOpts,
    ...hhContracts,
    deployFunction,
    contractConfigs: allContractConfigs
  });
  return { ...result };
};

module.exports = {
  deployDefaultDao,
  ...hhContracts,
  expect,
  expectRevert,
  takeChainSnapshot,
  revertChainSnapshot,
  proposalIdGenerator,
  getDefaultOptions,
  getHardhatContracts,
  deployFunction
}
// module.exports = (async () => {
//   const hhContracts = getHardhatContracts(allContractConfigs);
//   const deployDefaultDao = async (options) => {
//     console.log("deployDefaultDao");
//     const { WETH } = hhContracts;
//     const weth = await (await WETH).deploy();
//     await weth.deployed();

//     const result = await deployDao({
//       ...getDefaultOptions(options),
//       ...hhContracts,
//       deployFunction,
//       contractConfigs: allContractConfigs,
//       weth: weth.address,
//     });
//     return { wethContract: weth, ...result };
//   };
//   // let [daoOwner] = await hre.ethers.getSigners();
//   // const rel = await deployDefaultDao({ owner: daoOwner.address });

//   // const deployDefaultNFTDao = async ({ owner }) => {
//   //   const { WETH } = ozContracts;
//   //   const weth = await WETH.new();
//   //   const { dao, adapters, extensions, testContracts, utilContracts } =
//   //     await deployDao({
//   //       ...getDefaultOptions({ owner }),
//   //       ...ozContracts,
//   //       deployFunction,
//   //       finalize: false,
//   //       contractConfigs: allContractConfigs,
//   //       weth: weth.address,
//   //       wethContract: weth,
//   //     });

//   //   await dao.finalizeDao({ from: owner });

//   //   return {
//   //     dao: dao,
//   //     adapters: adapters,
//   //     extensions: extensions,
//   //     testContracts: testContracts,
//   //     utilContracts: utilContracts,
//   //     wethContract: weth,
//   //   };
//   // };

//   // const deployDaoWithOffchainVoting = async (options) => {
//   //   const owner = options.owner;
//   //   const newMember = options.newMember;
//   //   const { WETH } = ozContracts;
//   //   const weth = await WETH.new();
//   //   const { dao, adapters, extensions, testContracts, votingHelpers } =
//   //     await deployDao({
//   //       ...getDefaultOptions(options),
//   //       ...ozContracts,
//   //       deployFunction,
//   //       finalize: false,
//   //       offchainVoting: true,
//   //       offchainAdmin: owner,
//   //       contractConfigs: allContractConfigs,
//   //       weth: weth.address,
//   //     });

//   //   if (newMember) {
//   //     await dao.potentialNewMember(newMember, {
//   //       from: owner,
//   //     });

//   //     await extensions.bankExt.addToBalance(newMember, UNITS, 1, {
//   //       from: owner,
//   //     });
//   //   }

//   //   await dao.finalizeDao({ from: owner });

//   //   return {
//   //     dao: dao,
//   //     adapters: adapters,
//   //     extensions: extensions,
//   //     testContracts: testContracts,
//   //     votingHelpers: votingHelpers,
//   //     wethContract: weth,
//   //   };
//   // };

//   // const generateMembers = (amount) => {
//   //   let newAccounts = [];
//   //   for (let i = 0; i < amount; i++) {
//   //     const account = web3.eth.accounts.create();
//   //     newAccounts.push(account);
//   //   }
//   //   return newAccounts;
//   // };

//   // const encodeProposalData = (dao, proposalId) =>
//   //   web3.eth.abi.encodeParameter(
//   //     {
//   //       ProcessProposal: {
//   //         dao: "address",
//   //         proposalId: "bytes32",
//   //       },
//   //     },
//   //     {
//   //       dao: dao.address,
//   //       proposalId,
//   //     }
//   //   );

//   return {
//     // generateMembers,
//     deployDefaultDao,
//     // deployDefaultNFTDao,
//     // deployDaoWithOffchainVoting,
//     // encodeProposalData,
//     takeChainSnapshot,
//     revertChainSnapshot,
//     // proposalIdGenerator,
//     // advanceTime,
//     // web3,
//     // provider,
//     // accounts,
//     expect,
//     expectRevert,
//     deployFunction,
//     getContractFromHardhat,
//     ...hhContracts,
//   };
// })();
