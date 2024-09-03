/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-11-10 22:02:48
 * @LastEditors: huhuimao
 * @LastEditTime: 2022-11-15 02:20:59
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
import {
    Signature
} from '@ethersproject/bytes'

async function main() {
    // await createNewFundPropoasl();
    // await getVintageNewFundProposalInfo();

    await getVintageFundRasieState();
}

const createNewFundPropoasl = async () => {
    const vintageFundRaiseAdapterContract = (await hre.ethers.getContractFactory("VintageFundRaiseAdapterContract")).attach("0x64400d870bD4BF9D6D48e1B5f4888C4B16Bd2b6c");;

    const fundRaiseMinTarget = hre.ethers.utils.parseEther("10000");
    const fundRaiseMaxCap = hre.ethers.utils.parseEther("20000");
    const lpMinDepositAmount = hre.ethers.utils.parseEther("100");
    const lpMaxDepositAmount = hre.ethers.utils.parseEther("200000");
    const fundRaiseType = 1; // 0 FCFS 1 Free In

    //submit fund raise proposal
    const proposalFundRaiseInfo = [
        fundRaiseMinTarget,
        fundRaiseMaxCap,
        lpMinDepositAmount,
        lpMaxDepositAmount,
        fundRaiseType // 0 FCFS 1 Free In
    ];
    let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

    const startTime = blocktimestamp + 60 * 2;
    const endTime = startTime + 60 * 10;
    const fundTerm = 60 * 20;
    const redemptPeriod = 60 * 2;
    const redemptInterval = 60 * 10;
    const returnPeriod = 60 * 10;
    const proposalTimeInfo = [
        startTime,
        endTime,
        fundTerm,
        redemptPeriod,
        redemptInterval,
        returnPeriod
    ];

    const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
    const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.001"); //0.1%

    const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
    const proposalFeeInfo = [
        managementFeeRatio,
        returnTokenmanagementFeeRatio,
        redepmtFeeRatio
    ];

    const managementFeeAddress = "0xDF9DFA21F47659cf742FE61030aCb0F15f659707";
    const fundRaiseTokenAddress = "0xb894560E51dB39c906238b13E84b1822C1e0D604";
    const proposalAddressInfo = [
        managementFeeAddress,
        fundRaiseTokenAddress
    ];

    const fundFromInverstor = hre.ethers.utils.parseEther("0.004");
    const projectTokenFromInvestor = hre.ethers.utils.parseEther("0.004");
    const proposerReward = [
        fundFromInverstor,
        projectTokenFromInvestor
    ];


    const enalbePriorityDeposit = true;
    const vtype = 3; // 0 erc20 1 erc721 2 erc1155 3 whitelist
    const token = ZERO_ADDRESS;
    const tokenId = 0;
    const amount = 0;
    const priorityDepositeWhitelist = [
        "0xDF9DFA21F47659cf742FE61030aCb0F15f659707"
    ];
    const proposalPriorityDepositInfo = [
        enalbePriorityDeposit,
        vtype,
        token,
        tokenId,
        amount,
        priorityDepositeWhitelist
    ];

    const daoAddr = "0x92d3f5b6726a42f4a5f56d7e1e172e0350a6540d";
    const fundRaiseParams = [
        daoAddr,
        proposalFundRaiseInfo,
        proposalTimeInfo,
        proposalFeeInfo,
        proposalAddressInfo,
        proposerReward,
        proposalPriorityDepositInfo
    ];

    const tx = await vintageFundRaiseAdapterContract.submitProposal(fundRaiseParams);
    const result = await tx.wait();
    const proposalId = result.events[result.events.length - 1].args.proposalId;

    console.log(`
    new fund proposal created...
    proposalId ${proposalId}
    `);

}
const voting = async (daoAddr, proposalId) => {
    const vintageVotingContract = (await hre.ethers.getContractFactory("VintageVotingContract")).attach("0xE160C497A4eF48de6022604fD42340E9c2128454");

    await vintageVotingContract.submitVote(daoAddr, proposalId, 1);
    console.log("voted...");
}
const executeNewFundProposal = async () => {}
const deposit = async () => {}
const executeFundRaise = async () => {}
const createFundingProposal = async () => {}
const startVoting = async () => {}
const executeFundingProposal = async () => {}

const getVintageNewFundProposalInfo = async () => {
    const vintageFundRaiseAdapterContract = (await hre.ethers.getContractFactory("VintageFundRaiseAdapterContract")).attach("0x64400d870bD4BF9D6D48e1B5f4888C4B16Bd2b6c");;
    const proposal = await vintageFundRaiseAdapterContract.Proposals(
        "0x7033f3812f9592db5bf63a9202503cd2cda7c720",
        "0x02503CD2CDA7C7204E657746756E642331000000000000000000000000000000");


    console.log(`
        state ${proposal.state}
        `);
}

const getVintageFundRasieState = async () => {
    const vintageFundingPoolAdapterContract = (await hre.ethers.getContractFactory("VintageFundingPoolAdapterContract")).attach("0x992689E660A74CEBd0C033AC636EfC3A3668F7d8");;
    const state = await vintageFundingPoolAdapterContract.daoFundRaisingStates("0x7033f3812f9592db5bf63a9202503cd2cda7c720");

    console.log(`
    state ${state}
    `);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });