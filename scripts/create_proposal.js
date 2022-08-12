// import { ethers, network, artifacts } from 'hardhat';
import { deployDefaultDao, takeChainSnapshot, revertChainSnapshot, proposalIdGenerator, expect, expectRevert, web3 } from "../utils/hh-util";
import { getOwnerPrivateKey } from '../.privatekey';
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

const daoAddress = "0x87019b68FaeE5eA09f00D72655693D0A498CA97D";
const DistributeFundContractAddress = "0x78bFc65B60ACae071C877C62BaF30411A3c3251c";
const FundingPoolAdapterAddress = "0xFa4480d8C2a8B926a42e25a80bB88850be448DeB";
const StakingRiceAdapterAddress = "0x35C9Af5755A2545897fe539Aa7E5c0230F86E74a";
const testDepositTokenAddress = "0x0217de583aa6041CCe2d3B75C6b292D381D9f376";
const testProjectTokenAddress = "0xB3Aa0A0aDE817be264da34B1596Bdb144f9F0c10";
const testRiceTokenAddress = "0x452c9EF2a6d3A94cFb6699292D951c2ba4ED1493";

const proposalCounter = proposalIdGenerator().generator;


const depositToFundingPool = async (
    fundingpoolAdapter,
    daoAddress,
    investor,
    amount,
    token) => {
    await token.connect(investor).approve(fundingpoolAdapter.address, amount);
    await fundingpoolAdapter.connect(investor).deposit(daoAddress, amount);
};

const stakingRice = async (stakingRiceAdapter,
    dao,
    investor,
    amount,
    token) => {
    await token.connect(investor).approve(stakingRiceAdapter.address, amount);
    await stakingRiceAdapter.connect(investor).deposit(dao.address, amount, token.address);
}
function getProposalCounter() {
    return proposalCounter().next().value;
}
const distributeFundsProposal = async (
    daoAddress,
    distributeFundContract,
    requestedFundAmount,
    tradingOffTokenAmount,
    fullyReleasedDate,
    lockupDate,
    projectTeamAddr,
    projectTeamTokenAddr,
    sender,
    proposalId = null
) => {
    const newProposalId = proposalId ? proposalId : getProposalCounter();
    await distributeFundContract.connect(sender).submitProposal(
        daoAddress,
        newProposalId,
        [projectTeamAddr, projectTeamTokenAddr],
        [requestedFundAmount, tradingOffTokenAmount, fullyReleasedDate, lockupDate],
        fromUtf8("paying dividends")
    );
    return { proposalId: newProposalId };
};


(async () => {
    const daoOwner = new ethers.Wallet(await getOwnerPrivateKey(hre.network.name), hre.ethers.provider);
    const DistributeFundContract = (await hre.ethers.getContractFactory('DistributeFundContract')).connect(daoOwner).attach(DistributeFundContractAddress)
    const FundingPoolAdapterContract = (await hre.ethers.getContractFactory("FundingPoolAdapterContract")).connect(daoOwner).attach(FundingPoolAdapterAddress);
    const RiceStakingAdapterContract = (await hre.ethers.getContractFactory("RiceStakingAdapterContract")).connect(daoOwner).attach(StakingRiceAdapterAddress);
    const TestDepositTokenContract = (await hre.ethers.getContractFactory("TestToken1")).connect(daoOwner).attach(testDepositTokenAddress);
    const TestProjectTokenContract = (await hre.ethers.getContractFactory("TestToken2")).connect(daoOwner).attach(testProjectTokenAddress);
    const TestRiceTokenContract = (await hre.ethers.getContractFactory("TestRiceToken")).connect(daoOwner).attach(testRiceTokenAddress);

    await depositToFundingPool(FundingPoolAdapterContract, daoAddress, daoOwner, hre.ethers.utils.parseEther("1000"), TestDepositTokenContract);

    const requestedFundAmount = hre.ethers.utils.parseEther("1000");
    const tradingOffTokenAmount = hre.ethers.utils.parseEther("1000");
    let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
    const lockupDate = blocktimestamp + 60 * 1;
    console.log(`lockupDate: ${lockupDate}`);
    const fullyReleasedDate = lockupDate + 30 * 60;
    console.log(`fullyReleasedDate: ${fullyReleasedDate}`);

    const projectTeamAddr = daoOwner.address;
    const projectTeamTokenAddr = TestProjectTokenContract.address;

    // await TestProjectTokenContract.transfer(this.project_team1.address, tradingOffTokenAmount);
    // console.log(`project token balance of project_team1:  ${hre.ethers.utils.formatEther(await TestProjectTokenContract.balanceOf(this.project_team1.address))}`);
    await TestProjectTokenContract.approve(DistributeFundContract.address, tradingOffTokenAmount);
    console.log(`project token allowance of distributeFundContract :
     ${hre.ethers.utils.formatEther(await TestProjectTokenContract.allowance(daoOwner.address, DistributeFundContract.address))}`
    );

    const proposalID = await distributeFundsProposal(daoAddress,
        DistributeFundContract,
        requestedFundAmount,
        tradingOffTokenAmount,
        fullyReleasedDate,
        lockupDate,
        projectTeamAddr,
        projectTeamTokenAddr,
        daoOwner,
        "0x0000000000000000000000000000000000000000000000000000000000000002"
    );
    console.log("proposalID:", proposalID);
})()