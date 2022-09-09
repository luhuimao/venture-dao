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
const hre = require("hardhat");

describe("Adapter - StreamPay", () => {
    before("deploy dao", async () => {
        let [owner, gp1, gp2, user1, user2, user3] = await hre.ethers.getSigners();
        this.owner = owner;
        this.gp1 = gp1;
        this.gp2 = gp2;
        this.user1 = user1;
        this.user2 = user2;
        this.user3 = user3;
        const { dao, adapters, extensions, testContracts } = await deployDefaultDao({
            owner: owner,
        });

        this.adapters = adapters;
        this.extensions = extensions;
        this.dao = dao;
        this.testContracts = testContracts;
        this.gpdaoExt = this.extensions.gpDaoExt.functions;
        this.fundingpoolAdapter = this.adapters.fundingpoolAdapter.instance;
        this.gpDaoOnboardingAdapter = this.adapters.gpDaoOnboardingAdapter.instance;
        this.gpOnboardVotingAdapter = this.adapters.gpOnboardVotingAdapter.instance;
        this.testtoken1 = testContracts.testToken1.instance
        this.streamPay = adapters.sablierAdapter.instance;
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
        console.log(`FUND_RAISING_WINDOW_BEGIN: ${(await dao.getConfiguration(sha3("FUND_RAISING_WINDOW_BEGIN")))}`);
        console.log(`FUND_RAISING_WINDOW_END: ${(await dao.getConfiguration(sha3("FUND_RAISING_WINDOW_END")))}`);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        console.log(`current blocktimestamp: ${blocktimestamp}`);

        await token.connect(investor).approve(fundingpoolAdapter.address, amount);
        await fundingpoolAdapter.connect(investor).deposit(dao.address, amount);
    };

    beforeEach(async () => {
        await revertChainSnapshot(this.snapshotId);
        this.snapshotId = await takeChainSnapshot();
    });

    it("should be possible to create a stream pay", async () => {
        const streamPay = this.streamPay;
        const gpDaoExt = this.extensions.gpDaoExt.functions;
        const dao = this.dao;

        this.testtoken1.approve(streamPay.address, hre.ethers.utils.parseEther("1000"));
        const recipientAddr = this.user1.address;
        const depositAmount = hre.ethers.utils.parseEther("1000");
        const streamTokenAddr = this.testtoken1.address;
        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const streamStartTime = blocktimestamp + 10;
        const streamStopTime = streamStartTime + 100;
        const proposalId = sha3("0000");

        const tx = await streamPay.createStream(recipientAddr, depositAmount, streamTokenAddr, blocktimestamp, streamStopTime, proposalId);
        const result = await tx.wait();
        const streamId = result.events[2].args.streamId;
        this.streamId = streamId;
        console.log(`streamId: ${streamId.toString()}`);

        const streamInfo = await streamPay.getStream(streamId);

        console.log(`
        sender: ${streamInfo.sender}
        recipient: ${streamInfo.recipient}
        deposit: ${hre.ethers.utils.formatEther(streamInfo.deposit.toString())}
        tokenAddress: ${streamInfo.tokenAddress}
        startTime: ${streamInfo.startTime}
        stopTime: ${streamInfo.stopTime}
        remainingBalance: ${hre.ethers.utils.formatEther(streamInfo.remainingBalance.toString())}
        ratePerSecond: ${hre.ethers.utils.formatEther(streamInfo.ratePerSecond.toString())}
        proposalId: ${streamInfo.proposalId.toString()}
        `);
    })

    it("should be possible to recipient withdraw from stream", async () => {
        const streamPay = this.streamPay;
        const availableBal = await streamPay.balanceOf(this.streamId, this.user1.address);
        console.log(`
        availableBal:  ${hre.ethers.utils.formatEther(availableBal.toString())}
        `);
        let streamTokenBal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        streamTokenBal:  ${hre.ethers.utils.formatEther(streamTokenBal.toString())}
        `);
        await streamPay.connect(this.user1).withdrawFromStream(this.streamId, availableBal);
        streamTokenBal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        streamTokenBal:  ${hre.ethers.utils.formatEther(streamTokenBal.toString())}
        `);
    })


    it("should be impossible to create a stream pay with zero deposit amount ", async () => {
        const streamPay = this.streamPay;
        const gpDaoExt = this.extensions.gpDaoExt.functions;
        const dao = this.dao;

        this.testtoken1.approve(streamPay.address, hre.ethers.utils.parseEther("1000"));
        const recipientAddr = this.user1.address;
        const depositAmount = hre.ethers.utils.parseEther("0");
        const streamTokenAddr = this.testtoken1.address;
        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const streamStartTime = blocktimestamp + 10;
        const streamStopTime = streamStartTime + 100;
        const proposalId = sha3("0000");
        await expectRevert(streamPay.createStream(recipientAddr, depositAmount, streamTokenAddr, blocktimestamp, streamStopTime, proposalId), "revert");
    })


    it("should be possible to create a stream pay deposit amount less that stream duration", async () => {
        const streamPay = this.streamPay;
        const gpDaoExt = this.extensions.gpDaoExt.functions;
        const dao = this.dao;

        this.testtoken1.approve(streamPay.address, hre.ethers.utils.parseEther("0.000000000000000001"));
        const recipientAddr = this.user1.address;
        const depositAmount = hre.ethers.utils.parseEther("0.000000000000000001");
        const streamTokenAddr = this.testtoken1.address;
        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const streamStartTime = blocktimestamp + 10;
        const streamStopTime = streamStartTime + 100000;
        const proposalId = sha3("0000");

        const tx = await streamPay.createStream(recipientAddr, depositAmount, streamTokenAddr, blocktimestamp, streamStopTime, proposalId);
        const result = await tx.wait();
        const streamId = result.events[2].args.streamId;
        this.streamId = streamId;
        console.log(`streamId: ${streamId.toString()}`);

        const streamInfo = await streamPay.getStream(streamId);

        console.log(`
        sender: ${streamInfo.sender}
        recipient: ${streamInfo.recipient}
        deposit: ${hre.ethers.utils.formatEther(streamInfo.deposit.toString())}
        tokenAddress: ${streamInfo.tokenAddress}
        startTime: ${streamInfo.startTime}
        stopTime: ${streamInfo.stopTime}
        remainingBalance: ${hre.ethers.utils.formatEther(streamInfo.remainingBalance.toString())}
        ratePerSecond: ${hre.ethers.utils.formatEther(streamInfo.ratePerSecond.toString())}
        proposalId: ${streamInfo.proposalId.toString()}
        `);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(streamInfo.stopTime) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        const bal = await streamPay.balanceOf(streamId, recipientAddr);
        console.log(`balance : ${hre.ethers.utils.formatEther(bal.toString())}`);

        let USDTBal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`USDT balance: ${hre.ethers.utils.formatEther(USDTBal.toString())}`);

        await streamPay.connect(this.user1).withdrawFromStream(streamId, bal);

        USDTBal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`USDT balance: ${hre.ethers.utils.formatEther(USDTBal.toString())}`);
    })

});
