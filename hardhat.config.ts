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
    xDaiTestNet: {
      url: 'https://xdai.poanetwork.dev/',
      accounts: [
        process.env.TEST_PRIVATE_KEY1,
        process.env.TEST_PRIVATE_KEY2,
        process.env.TEST_PRIVATE_KEY3,
        process.env.TEST_PRIVATE_KEY4,
        process.env.TEST_PRIVATE_KEY5
      ],
    },
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
      // url: 'https://base-sepolia-rpc.publicnode.com',
      // url: 'https://public.stackup.sh/api/v1/node/base-sepolia',
      // url: 'https://sepolia.base.org',
      // url: 'https://base-sepolia.blockpi.network/v1/rpc/public',	
      // url: 'https://base-sepolia.g.alchemy.com/v2/TXiR4i-hDsd2Rgoi6TSsc6U5csSMF2b-',
      url: 'https://base-sepolia.infura.io/v3/c7cfed82be5b4142b8ef98e7bdd504cd',
      chainId: 84532,
      // gasPrice: 300000000,
      accounts: [
        process.env.TEST_PRIVATE_KEY1,
        process.env.TEST_PRIVATE_KEY2,
        process.env.TEST_PRIVATE_KEY3,
        process.env.TEST_PRIVATE_KEY4,
        process.env.TEST_PRIVATE_KEY5
      ],
    },
    base: {
      url: 'https://base-mainnet.infura.io/v3/04dd3493f83c48de9735b4b29f108b84',
      chainId: 8453,
      // gasPrice: 300000000,
      accounts: [
        process.env.TEST_PRIVATE_KEY0,
        process.env.TEST_PRIVATE_KEY1,
        process.env.TEST_PRIVATE_KEY2,
        process.env.TEST_PRIVATE_KEY3,
        process.env.TEST_PRIVATE_KEY4,
        process.env.TEST_PRIVATE_KEY5
      ],
    },
    optimism: {
      url: 'https://optimism.blockpi.network/v1/rpc/public',
      chainId: 10,
      accounts: [
        process.env.TEST_PRIVATE_KEY1,
        process.env.TEST_PRIVATE_KEY2,
        process.env.TEST_PRIVATE_KEY3,
        process.env.TEST_PRIVATE_KEY4,
        process.env.TEST_PRIVATE_KEY5
      ],
    },
    polygon: {
      url: 'https://polygon-mainnet.g.alchemy.com/v2/vtLHpaRYAqgDeXApP2F7fSA3fAmB0Dk1',
      accounts: [
        process.env.TEST_PRIVATE_KEY1,
        process.env.TEST_PRIVATE_KEY2,
        process.env.TEST_PRIVATE_KEY3,
        process.env.TEST_PRIVATE_KEY4,
        process.env.TEST_PRIVATE_KEY5
      ],
    },
    mumbai: {
      url: 'https://polygon-amoy.g.alchemy.com/v2/vtLHpaRYAqgDeXApP2F7fSA3fAmB0Dk1',
      accounts: [
        process.env.TEST_PRIVATE_KEY1,
        process.env.TEST_PRIVATE_KEY2,
        process.env.TEST_PRIVATE_KEY3,
        process.env.TEST_PRIVATE_KEY4,
        process.env.TEST_PRIVATE_KEY5
      ]
    }
  },
  etherscan: {
    apiKey: {
      'base-sepolia': 'empty'
    },
    customChains: [
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://base-sepolia.blockscout.com/api",
          browserURL: "https://base-sepolia.blockscout.com"
        }
      }
    ]
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
  etherscan: {
    apiKey: {
      'base_sepolia': 'empty'
    },
    customChains: [
      {
        network: "base_sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://base-sepolia.blockscout.com/api",
          browserURL: "https://base-sepolia.blockscout.com"
        }
      }
    ]
  }
};
