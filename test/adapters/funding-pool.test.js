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
import { deployDefaultDao, takeChainSnapshot, revertChainSnapshot, proposalIdGenerator, expect, expectRevert, web3 } from "../../utils/hh-util";

const {
    unitPrice,
    numberOfUnits,
    maximumChunks,
    maxAmount,
    maxUnits,
    ETH_TOKEN,
    UNITS,
    toBN,
    toWei,
    fromUtf8,
    fromAscii,
    sha3,
    GUILD,
    DAOSQUARE_TREASURY
} = require("../../utils/contract-util");

const { checkBalance } = require("../../utils/test-util");
// const { getConfig } = require("../../migrations/configs/contracts.config");
const hre = require("hardhat");

const remaining = unitPrice.sub(toBN("50000000000000"));
const expectedGuildBalance = toBN("1200000000000000000");
const proposalCounter = proposalIdGenerator().generator;

function getProposalCounter() {
    return proposalCounter().next().value;
}

const getDefaultOptions = (options) => {
    return {
        serviceFeeRatio: 5,
        minFundsForLP: 100,
        minFundsForGP: 1000,
        serviceFeeRatio: 5,
        unitPrice: unitPrice,
        nbUnits: numberOfUnits,
        votingPeriod: 5,
        gracePeriod: 1,
        tokenAddr: ETH_TOKEN,
        maxChunks: maximumChunks,
        maxAmount,
        maxUnits,
        chainId: 1,
        maxExternalTokens: 100,
        couponCreatorAddress: "0x7D8cad0bbD68deb352C33e80fccd4D8e88b4aBb8",
        kycMaxMembers: 1000,
        kycSignerAddress: "0x7D8cad0bbD68deb352C33e80fccd4D8e88b4aBb8",
        kycFundTargetAddress: "0x823A19521A76f80EC49670BE32950900E8Cd0ED3",
        deployTestTokens: true,
        erc20TokenName: "Test Token",
        erc20TokenSymbol: "TTK",
        erc20TokenDecimals: Number(0),
        erc20TokenAddress: UNITS,
        supplyTestToken1: 1000000,
        supplyTestToken2: 1000000,
        supplyPixelNFT: 100,
        supplyOLToken: toBN("1000000000000000000000000"),
        erc1155TestTokenUri: "1155 test token",
        maintainerTokenAddress: UNITS,
        // finalize: options.finalize === undefined || !!options.finalize,
        ...options, // to make sure the options from the tests override the default ones
        gasPriceLimit: "2000000000000",
        spendLimitPeriod: "259200",
        spendLimitEth: "2000000000000000000000",
        feePercent: "110",
        gasFixed: "50000",
        gelato: "0x1000000000000000000000000000000000000000",
    };
};

const distributeFundsProposal = async (
    dao,
    distributeFundContract,
    requestedFundAmount,
    tradingOffTokenAmount,
    fullyReleasedDate,
    lockupDate,
    projectTeamAddr,
    projectTeamTokenAddr,
    sender
) => {
    // const newProposalId = proposalId ? proposalId : getProposalCounter();
    const tx = await distributeFundContract.connect(sender).submitProposal(
        dao.address,
        [projectTeamAddr, projectTeamTokenAddr],
        [requestedFundAmount, tradingOffTokenAmount, fullyReleasedDate, lockupDate],
    );
    const result = await tx.wait();
    const newProposalId = result.events[2].args.proposalId;
    return { proposalId: newProposalId };
};
async function advanceTime(addr1, addr2, token) {
    for (var i = 0; i < 10; i++) {
        await token.transfer(addr2.address, 1);
        await token.connect(addr2).transfer(addr1.address, 1);
    }
}

describe("Adapter - FundingPool", () => {
    before("deploy dao", async () => {
        let [owner, user1, user2, project_team1] = await hre.ethers.getSigners();
        this.owner = owner;
        this.user1 = user1;
        this.user2 = user2;
        this.project_team1 = project_team1;


        // console.log(`owner address ${owner.address}; user1 address ${user1.address}; user2 address ${user2.address}`);

        const { dao, adapters, extensions, testContracts } = await deployDefaultDao({
            owner: owner,
        });



        this.adapters = adapters;
        this.extensions = extensions;
        this.dao = dao;
        this.testContracts = testContracts;
        this.snapshotId = await takeChainSnapshot();

        this.gpDaoOnboardingAdapter = adapters.gpDaoOnboardingAdapter.instance;
        this.gpOnboardVotingAdapter = adapters.gpOnboardVotingAdapter.instance;
        this.fundingpoolAdapter = adapters.fundingpoolAdapter.instance;
        this.gpdaoExt = extensions.gpDaoExt.functions;
        this.testtoken1 = testContracts.testToken1.instance
        this.gpvoting = this.adapters.gpVotingAdapter.instance;

        //add new GP
        await depositToFundingPool(this.fundingpoolAdapter, dao, this.owner, hre.ethers.utils.parseEther("1000"), this.testtoken1)
        await addNewGP(this.user1.address, this.gpDaoOnboardingAdapter, this.gpOnboardVotingAdapter, dao, this.gpdaoExt, [this.user1]);

    });

    beforeEach(async () => {
        await revertChainSnapshot(this.snapshotId);
        this.snapshotId = await takeChainSnapshot();
    });

    const addNewGP = async (applicant, gpDaoOnboardingAdapter, gpOnboardVotingAdatper, dao, gpDaoExe, gpList) => {
        let tx = await gpDaoOnboardingAdapter.submitProposal(dao.address, applicant);
        const result = await tx.wait();
        const newOnboardingProposalId = result.events[2].args.proposalId;
        console.log(`newOnboardingProposalId: ${hre.ethers.utils.toUtf8String(newOnboardingProposalId)}`);

        const proposalInfo = await gpDaoOnboardingAdapter.proposals(dao.address, newOnboardingProposalId);
        let allGPs = await gpDaoExe.getAllGPs();
        let arrayGPs = allGPs.toString().split(',');
        console.log(`arrayGPs: ${arrayGPs}`);
        tx = await gpOnboardVotingAdatper.submitVote(dao.address, newOnboardingProposalId, 1);
        await tx.wait();
        console.log(`GP amount: ${arrayGPs.length}`);
        if (arrayGPs.length > 1) {
            for (var i = 0; i < arrayGPs.length - 1; i++) {
                tx = await gpOnboardVotingAdatper.connect(gpList[i]).submitVote(dao.address, newOnboardingProposalId, 1);
                await tx.wait();
            }
        }
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        tx = await gpDaoOnboardingAdapter.processProposal(dao.address, newOnboardingProposalId);
        await tx.wait();

        const isGP = await gpDaoExe.isGeneralPartner(applicant);
        console.log(`${applicant} is a GP?: ${isGP}`);
    }

    const depositToFundingPool = async (
        fundingpoolAdapter,
        dao,
        investor,
        amount,
        token) => {
        await token.connect(investor).approve(fundingpoolAdapter.address, amount);
        await fundingpoolAdapter.connect(investor).deposit(dao.address, amount);
    };

    it("should be possible to deposit funds to the fundingpool", async () => {
        const fundingpoolAdapter = this.fundingpoolAdapter;
        const dao = this.dao;
        const testtoken1 = this.testtoken1;
        const fundingPoolExt = this.extensions.fundingpoolExt.functions;
        const gpdaoExt = this.gpdaoExt;

        // await fundingpoolAdapter.registerPotentialNewToken(dao.address, testtoken1.address);
        await testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("2000"));
        await testtoken1.transfer(this.user2.address, hre.ethers.utils.parseEther("1000"));

        console.log("user1 test token balance: ", hre.ethers.utils.formatEther(await testtoken1.balanceOf(this.user1.address)).toString());
        await testtoken1.connect(this.user1).approve(fundingpoolAdapter.address, hre.ethers.utils.parseEther("2000"));
        await fundingpoolAdapter.connect(this.user1).deposit(dao.address, hre.ethers.utils.parseEther("100"));

        console.log("user1 test token balance: ", hre.ethers.utils.formatEther(await testtoken1.balanceOf(this.user1.address)).toString());

        expect(parseInt(hre.ethers.utils.formatEther(await fundingpoolAdapter.balanceOf(
            dao.address, this.user1.address)))).equal(100 * (100 - getDefaultOptions().serviceFeeRatio) / 100);

        await fundingpoolAdapter.connect(this.user1).deposit(dao.address, hre.ethers.utils.parseEther("1000"));

        expect(parseInt(hre.ethers.utils.formatEther(await fundingpoolAdapter.balanceOf(
            dao.address, this.user1.address)))).equal(1100 * (100 - getDefaultOptions().serviceFeeRatio) / 100);
    })

    it("should be possible to withdraw funds from the fundingpool", async () => {
        const fundingpoolAdapter = this.adapters.fundingpoolAdapter.instance;
        const dao = this.dao;
        const testtoken1 = this.testContracts.testToken1.instance;
        const fundingPoolExt = this.extensions.fundingpoolExt.functions;
        const gpdaoExt = this.extensions.gpDaoExt.functions;

        await fundingpoolAdapter.connect(this.user1).withdraw(dao.address, hre.ethers.utils.parseEther("10"));
        expect(parseInt(hre.ethers.utils.formatEther(await fundingpoolAdapter.balanceOf(dao.address, this.user1.address)))).equal(
            1100 * (100 - getDefaultOptions().serviceFeeRatio) / 100 - 10);

        expect(parseInt(hre.ethers.utils.formatEther(await testtoken1.balanceOf(this.user1.address)))).equal(2000 - 100 - 1000 + 10);

        await fundingpoolAdapter.connect(this.user1).withdraw(dao.address, hre.ethers.utils.parseEther("100"));
        expect((await gpdaoExt.isGeneralPartner(this.user1.address))[0]).equal(true);
    })

    it("should be no allow to let total funds greater than snap fund during GP voting", async () => {
        const fundingpoolAdapter = this.fundingpoolAdapter;
        const dao = this.dao;
        const testtoken2 = this.testContracts.testToken2.instance;
        const distributeFundAdapter = this.adapters.distributeFundAdapterv2.instance;
        const fundingPoolExt = this.extensions.fundingpoolExt.functions;

        //create distribute fund proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("100");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("50000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const lockupDate = blocktimestamp;
        const fullyReleasedDate = lockupDate + 1000;
        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = testtoken2.address;

        console.log(`dao owner projectTeamToken balance ${hre.ethers.utils.formatEther(await testtoken2.balanceOf(this.owner.address))}`);
        await testtoken2.transfer(projectTeamAddr, tradingOffTokenAmount);
        console.log(`projectTeam projectTeamToken balance ${hre.ethers.utils.formatEther(await testtoken2.balanceOf(projectTeamAddr))}`);

        await testtoken2.connect(this.project_team1).approve(distributeFundAdapter.address, tradingOffTokenAmount);
        // create proposal and snapshot the total fund

        let { proposalId } = await distributeFundsProposal(
            dao,
            distributeFundAdapter,
            requestedFundAmount,
            tradingOffTokenAmount,
            fullyReleasedDate,
            lockupDate,
            projectTeamAddr,
            projectTeamTokenAddr,
            this.owner
        );
        console.log(`proposalId: ${hre.ethers.utils.toUtf8String(proposalId)}`);
        this.proposalId = proposalId;
        console.log(`snap funds: ${hre.ethers.utils.formatEther((await fundingPoolExt.snapFunds()).toString())}`);
        console.log(`totalSupply: ${hre.ethers.utils.formatEther((await fundingPoolExt.totalSupply()).toString())}`);

        let distriInfo = await distributeFundAdapter.distributions(dao.address, proposalId);
        console.log(`distriInfo -> proposalStartVotingTimestamp:  ${distriInfo.proposalStartVotingTimestamp}`);
        console.log(`current blcok timestamp ->: ${(await hre.ethers.provider.getBlock("latest")).timestamp}`);

        //start fill funds process
        await distributeFundAdapter.startFillFundsProcess(dao.address, this.proposalId);
        distriInfo = await distributeFundAdapter.distributions(dao.address, proposalId);
        console.log(`proposal state: ${distriInfo.status}`);
        let currentProposalId = await distributeFundAdapter.ongoingDistributions(dao.address);
        console.log(`current proposalId: ${hre.ethers.utils.toUtf8String(currentProposalId)}`);


        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStartVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        //start Voting Process
        await distributeFundAdapter.startVotingProcess(dao.address, this.proposalId);
        const voteInfo = await this.gpvoting.votes(dao.address, this.proposalId);
        console.log(`start voting time of proposal ${this.proposalId} : ${voteInfo.startingTime}`);
        //vote for proposal
        // await this.adapters.gpVotingAdapter.instance.connect(this.user1).submitVote(dao.address, proposalId.proposalId, 1);

        await expectRevert(fundingpoolAdapter.connect(this.user1).deposit(dao.address, hre.ethers.utils.parseEther("900")), "revert");
    });

    // it("should be possible to deposit fund when someone withdraw fund during GP voting", async () => {
    //     const fundingpoolAdapter = this.adapters.fundingpoolAdapter.instance;
    //     const dao = this.dao;
    //     const testtoken1 = this.testContracts.testToken1.instance;
    //     const testtoken2 = this.testContracts.testToken2.instance;
    //     const distributeFundAdapter = this.adapters.distributeFundAdapterv2.instance;
    //     const fundingPoolExt = this.extensions.fundingpoolExt.functions;


    //     //user1 withdraw fund
    //     const user1FundBalance1 = hre.ethers.utils.formatEther(await testtoken1.balanceOf(this.user1.address));
    //     await fundingpoolAdapter.connect(this.user1).withdraw(dao.address, hre.ethers.utils.parseEther("10"));
    //     const user1FundBalance2 = hre.ethers.utils.formatEther(await testtoken1.balanceOf(this.user1.address));
    //     expect(parseInt(user1FundBalance2)).equal(parseInt(user1FundBalance1) + 10);

    //     console.log(`snap funds: ${hre.ethers.utils.formatEther((await fundingPoolExt.snapFunds()).toString())}`);
    //     console.log(`totalSupply: ${hre.ethers.utils.formatEther((await fundingPoolExt.totalSupply()).toString())}`);

    //     //user2 deposit fund
    //     await testtoken1.connect(this.user2).approve(fundingpoolAdapter.address, hre.ethers.utils.parseEther("1000"));
    //     await fundingpoolAdapter.connect(this.user2).deposit(dao.address, hre.ethers.utils.parseEther("20"));
    //     console.log(`user2 bal: ${hre.ethers.utils.formatEther((await fundingpoolAdapter.balanceOf(dao.address, this.user2.address)).toString())}`);
    //     console.log(`snap funds: ${hre.ethers.utils.formatEther((await fundingPoolExt.snapFunds()).toString())}`);
    //     console.log(`totalSupply: ${hre.ethers.utils.formatEther((await fundingPoolExt.totalSupply()).toString())}`);
    // });

    it("should be possible to deposit arbitrary funds when proposal processed", async () => {
        const fundingpoolAdapter = this.adapters.fundingpoolAdapter.instance;
        const dao = this.dao;
        const testtoken1 = this.testContracts.testToken1.instance;
        const testtoken2 = this.testContracts.testToken2.instance;
        const distributeFundAdapter = this.adapters.distributeFundAdapterv2.instance;
        const fundingPoolExt = this.extensions.fundingpoolExt.functions;


        //processProposal
        let distriInfo = await distributeFundAdapter.distributions(dao.address, this.proposalId);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStopVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        await distributeFundAdapter.processProposal(dao.address, this.proposalId);


        console.log(`snap funds: ${hre.ethers.utils.formatEther((await fundingPoolExt.snapFunds()).toString())}`);
        console.log(`totalSupply: ${hre.ethers.utils.formatEther((await fundingPoolExt.totalSupply()).toString())}`);

        //user2 deposit fund
        const tt1User2Bal = await testtoken1.balanceOf(this.user2.address);
        await testtoken1.connect(this.user2).approve(fundingpoolAdapter.address, tt1User2Bal);
        await fundingpoolAdapter.connect(this.user2).deposit(dao.address, tt1User2Bal);
        console.log(`user2 bal: ${hre.ethers.utils.formatEther((await fundingpoolAdapter.balanceOf(dao.address, this.user2.address)).toString())}`);
        console.log(`snap funds: ${hre.ethers.utils.formatEther((await fundingPoolExt.snapFunds()).toString())}`);
        console.log(`totalSupply: ${hre.ethers.utils.formatEther((await fundingPoolExt.totalSupply()).toString())}`);
    });

});
