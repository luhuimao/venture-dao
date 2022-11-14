/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-11-10 22:02:48
 * @LastEditors: huhuimao
 * @LastEditTime: 2022-11-14 16:23:40
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
    ZERO_ADDRESS,
    oneDay,
    oneWeek,
    twoWeeks,
    oneMonth,
    threeMonthes,
    toHex,
    toBytes32,
    hexToBytes
} = require("../utils/contract-util");
import { Signature } from '@ethersproject/bytes'

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the contract to deploy

    let [owner, user1, user2, investor1, investor2, gp1, gp2, project_team1, project_team2, project_team3, rice_staker] = await hre.ethers.getSigners();

    const TestToken1 = await hre.ethers.getContractFactory("TestToken1");
    const testToken1 = await TestToken1.deploy(100000000);
    await testToken1.deployed();
    console.log("TestToken1 deployed to:", testToken1.address);

    const BentoBoxV1 = await ethers.getContractFactory("BentoBoxV1");
    const bentobox = await BentoBoxV1.deploy();
    await bentobox.deployed();
    console.log("bentobox deployed to:", bentobox.address);


    const FuroVesting = await ethers.getContractFactory("FuroVesting");
    const vesting = await FuroVesting.deploy(bentobox.address);
    await vesting.deployed();
    console.log("vesting deployed to:", vesting.address);

    await bentobox.whitelistMasterContract(vesting.address, true);


    // const FuroVestingRouter = await ethers.getContractFactory("FuroVestingRouter");
    // const vestingrouter = await FuroVestingRouter.deploy(bentobox.address, vesting.address, ETH_TOKEN);
    // await vestingrouter.deployed();
    // console.log("vestingrouter deployed to:", vestingrouter.address);

    // console.log(toBytes32("0"));
    // await bentobox.setMasterContractApproval(owner.address, vesting.address, true, 0, "0x0000000000000000000000000000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000000000000000000000000000");
    // await vesting.setBentoBoxApproval(owner.address, true, 0, "0x0000000000000000000000000000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000000000000000000000000000");
    let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

    let tokenAddr = testToken1.address;
    let recipient = user1.address;
    let start = blocktimestamp + 100;
    let cliffDuration = oneWeek;
    let stepDuration = oneMonth;
    let steps = 6;
    let stepPercentage = hre.ethers.utils.parseEther("1").div(toBN(steps));
    let amount = hre.ethers.utils.parseEther("100000");
    let fromBentoBox = false;
    let proposalId = sha3("0000");

    var VestParams = [
        tokenAddr,
        proposalId,
        recipient,
        start,
        cliffDuration,
        stepDuration,
        steps,
        stepPercentage,
        amount,
        fromBentoBox
    ];

    await testToken1.connect(owner).approve(bentobox.address, hre.ethers.utils.parseEther("100000"));
    let tx = await vesting.connect(owner).createVesting(VestParams);
    let result = await tx.wait();
    const vestId = result.events[3].args.vestId;
    console.log(`
    vesting created
    vestId ${vestId.toString()}
    `);


    let vestInfo = await vesting.vests(vestId);
    console.log(`
     owner ${vestInfo.owner}
     recipient ${vestInfo.recipient}
     token ${vestInfo.token}
     start ${vestInfo.start}
     cliffDuration ${vestInfo.cliffDuration}
     stepDuration ${vestInfo.stepDuration}
     steps ${vestInfo.steps}
     cliffShares ${vestInfo.cliffShares}
     stepShares ${vestInfo.stepShares}
     claimed ${vestInfo.claimed}
    `);

    let vestBal = await vesting.vestBalance(vestId);
    console.log(`
    vest balance ${hre.ethers.utils.formatEther(vestBal.toString())}
    `);


    // const nextBlockTime = parseInt(vestInfo.start)
    //     + parseInt(vestInfo.cliffDuration) +
    //     parseInt(vestInfo.stepDuration) *
    //     parseInt(vestInfo.steps) - 2
    let nextBlockTime = parseInt(vestInfo.start)
        + parseInt(vestInfo.cliffDuration) +
        parseInt(vestInfo.stepDuration) *
        1 +
        0;
    //claime token 
    await hre.network.provider.send("evm_setNextBlockTimestamp", [nextBlockTime])
    await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has


    let bal = await testToken1.balanceOf(user1.address);
    console.log(`
    balance 1 ${hre.ethers.utils.formatEther(bal.toString())}    
    `);

    await vesting.connect(user1).withdraw(1);

    bal = await testToken1.balanceOf(user1.address);
    console.log(`
    balance 2 ${hre.ethers.utils.formatEther(bal.toString())}    
    `);

    vestBal = await vesting.vestBalance(vestId);
    console.log(`
    vest balance ${hre.ethers.utils.formatEther(vestBal.toString())}
    `);

    vestInfo = await vesting.vests(vestId);
    console.log(`
    claimed ${hre.ethers.utils.formatEther(vestInfo.claimed.toString())}
    `);

    nextBlockTime = parseInt(vestInfo.start)
        + parseInt(vestInfo.cliffDuration) +
        parseInt(vestInfo.stepDuration) *
        2 +
        0;

    await hre.network.provider.send("evm_setNextBlockTimestamp", [nextBlockTime])
    await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

    await vesting.connect(user1).withdraw(1);
    bal = await testToken1.balanceOf(user1.address);
    console.log(`
    balance 3 ${hre.ethers.utils.formatEther(bal.toString())}    
    `);
    vestInfo = await vesting.vests(vestId);
    console.log(`
    claimed ${hre.ethers.utils.formatEther(vestInfo.claimed.toString())}
    `);


    nextBlockTime = parseInt(vestInfo.start)
        + parseInt(vestInfo.cliffDuration) +
        parseInt(vestInfo.stepDuration) *
        6 +
        0;

    await hre.network.provider.send("evm_setNextBlockTimestamp", [nextBlockTime])
    await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

    await vesting.connect(user1).withdraw(1);
    bal = await testToken1.balanceOf(user1.address);
    console.log(`
    balance 4 ${hre.ethers.utils.formatEther(bal.toString())}    
    `);
    vestInfo = await vesting.vests(vestId);
    console.log(`
    claimed ${hre.ethers.utils.formatEther(vestInfo.claimed.toString())}
    `);

    nextBlockTime = parseInt(vestInfo.start)
        + parseInt(vestInfo.cliffDuration) +
        parseInt(vestInfo.stepDuration) *
        7 +
        0;

    await hre.network.provider.send("evm_setNextBlockTimestamp", [nextBlockTime])
    await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

    await vesting.connect(user1).withdraw(1);
    bal = await testToken1.balanceOf(user1.address);
    console.log(`
    balance 5 ${hre.ethers.utils.formatEther(bal.toString())}    
    `);
    vestInfo = await vesting.vests(vestId);
    console.log(`
    claimed ${hre.ethers.utils.formatEther(vestInfo.claimed.toString())}
    `);

    // const sha3ricestaking = sha3("rice-staking");
    // const sha3foundingpool = sha3("founding-pool");

    // console.log("sha3 rice-staking: ", sha3ricestaking);
    // console.log("sha3 founding-pool: ", sha3foundingpool);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
