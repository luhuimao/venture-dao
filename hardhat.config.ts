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
            // enabled: !(process.env.SOLC_OPTIMIZER === "false"),
            enabled: true,
            runs: 2000,
          },
        }
      },
      { version: "0.5.17" },
      {
        version: '0.6.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
    ],
    settings: {
      optimizer: {
        // enabled: !(process.env.SOLC_OPTIMIZER === "false"),
        enabled: true,
        runs: 2000,
      },
    },
  },
  networks: {
    hardhat: {
      // allowUnlimitedContractSize: false,
      // blockGasLimit: 0x1ffffffff,
    },
    // rinkeby: {
    //   url: process.env.RINKEBY_NODE_URL,
    //   network_id: 4,
    //   chainId: 4,
    //   skipDryRun: true,
    //   gas: 2100000,
    //   // gasPrice: 4000000000,
    //   accounts: [process.env.RINKEBY_TEST_PRIVATE_KEY],
    //   signerId: process.env.SIGNER || undefined,
    // },
    goerli: {
      url: 'https://eth-goerli.g.alchemy.com/v2/aXCPHCYy28ef5-dwglTqPWsdLW-aJIuu',
      accounts: [
        process.env.TEST_PRIVATE_KEY1,
        process.env.TEST_PRIVATE_KEY2,
        process.env.TEST_PRIVATE_KEY3,
        process.env.TEST_PRIVATE_KEY4,
        process.env.TEST_PRIVATE_KEY5
      ],
    },
    // xDaiTestNet: {
    //   url: 'https://xdai.poanetwork.dev/',
    //   accounts: [
    //     process.env.GOERLI_TEST_PRIVATE_KEY,
    //     process.env.TEST_PRIVATE_KEY1,
    //     process.env.TEST_PRIVATE_KEY2,
    //     process.env.TEST_PRIVATE_KEY3,
    //     process.env.TEST_PRIVATE_KEY4
    //   ],
    // },
    xdai: {
      url: 'https://rpc.gnosischain.com',
      accounts: [
        process.env.TEST_PRIVATE_KEY1,
        process.env.TEST_PRIVATE_KEY2,
        process.env.TEST_PRIVATE_KEY3,
        process.env.TEST_PRIVATE_KEY4,
        process.env.TEST_PRIVATE_KEY5
      ],
    },
    sepolia: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/vtLHpaRYAqgDeXApP2F7fSA3fAmB0Dk1',
      accounts: [
        process.env.TEST_PRIVATE_KEY1,
        process.env.TEST_PRIVATE_KEY2,
        process.env.TEST_PRIVATE_KEY3,
        process.env.TEST_PRIVATE_KEY4,
        process.env.TEST_PRIVATE_KEY5
      ],
    },
    base_sepolia: {
      url: 'https://base-sepolia-rpc.publicnode.com',
      chainId: 84532,
      gasPrice: 100000000,
      accounts: [
        process.env.TEST_PRIVATE_KEY1,
        process.env.TEST_PRIVATE_KEY2,
        process.env.TEST_PRIVATE_KEY3,
        process.env.TEST_PRIVATE_KEY4,
        process.env.TEST_PRIVATE_KEY5
      ],
    }
    // polygon: {
    //   url: 'https://polygon.llamarpc.com',
    //   accounts: [
    //     process.env.GOERLI_TEST_PRIVATE_KEY,
    //     process.env.TEST_PRIVATE_KEY1,
    //     process.env.TEST_PRIVATE_KEY2,
    //     process.env.TEST_PRIVATE_KEY3,
    //     process.env.TEST_PRIVATE_KEY4
    //   ],
    // }
    // mumbai: {
    //   url: process.env.MUMBAI_NODE_URL,
    //   accounts: [
    //     process.env.GOERLI_TEST_PRIVATE_KEY,
    //     process.env.TEST_PRIVATE_KEY1,
    //     process.env.TEST_PRIVATE_KEY2,
    //     process.env.TEST_PRIVATE_KEY3,
    //     process.env.TEST_PRIVATE_KEY4
    //   ]
    // }
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
