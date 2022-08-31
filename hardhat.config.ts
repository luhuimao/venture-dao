import "@typechain/hardhat";
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
// import '@nomiclabs/hardhat-etherscan';
// import 'hardhat-gas-reporter';
import 'solidity-coverage';
import { task } from "hardhat/config";
require("./tasks/deploy");

require("dotenv").config();
require("ts-node").register({
  files: true,
});
require("solidity-coverage");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-web3");
require("hardhat-contract-sizer");
// if (!process.env.TEST === "true") {
//   require("hardhat-gas-reporter");
// }
require("hardhat-gas-reporter");
require("./tasks/deploy");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.5.5",
      },
      {
        version: "0.6.7",
      },
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: !(process.env.SOLC_OPTIMIZER === "false"),
            runs: 200,
          },
        }
      },
      { version: "0.5.17" }
    ],
    settings: {
      optimizer: {
        enabled: !(process.env.SOLC_OPTIMIZER === "false"),
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      // allowUnlimitedContractSize: false,
      // blockGasLimit: 0x1ffffffff,
    },
    rinkeby: {
      url: process.env.ETH_NODE_URL,
      network_id: 4,
      chainId: 4,
      skipDryRun: true,
      gas: 2100000,
      // gasPrice: 4000000000,
      accounts: [process.env.RINKEBY_TEST_PRIVATE_KEY],
      signerId: process.env.SIGNER || undefined,
    },
    goerli: {
      url: process.env.GOERLI_NODE_URL,
      network_id: 5,
      chainId: 5,
      skipDryRun: true,
      gas: 2100000,
      // gasPrice: 4000000000,
      accounts: [process.env.GOERLI_TEST_PRIVATE_KEY],
      signerId: process.env.SIGNER || undefined,
    },
    xDaiTestNet: {
      url: 'https://xdai.poanetwork.dev/'
    },
    xdai: {
      url: 'https://rpc.xdaichain.com'
    }
  },
  // Project Settings
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: !(process.env.SOLC_OPTIMIZER === "false"),
    strict: true,
  },
  gasReporter: {
    enabled: true,
  },
  paths: {
    tests: "./test",
    sources: "./contracts",
    cache: "./build/cache",
    artifacts: "./build/artifacts",
  },
};
