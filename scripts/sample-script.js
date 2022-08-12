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
  const TestToken1 = await hre.ethers.getContractFactory("TestToken1");
  const testToken1 = await TestToken1.deploy(100000000);

  await testToken1.deployed();

  console.log("TestToken1 deployed to:", testToken1.address);


  const sha3ricestaking = sha3("rice-staking");
  const sha3foundingpool = sha3("founding-pool");

  console.log("sha3 rice-staking: ", sha3ricestaking);
  console.log("sha3 founding-pool: ", sha3foundingpool);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
