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

describe("Adapter - GPDao", () => {
    before("deploy dao", async () => {
        let [owner, gp1, gp2, user1] = await hre.ethers.getSigners();
        this.owner = owner;
        this.gp1 = gp1;
        this.gp2 = gp2;
        this.user1 = user1;
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

        this.snapshotId = await takeChainSnapshot();

        await depositToFundingPool(this.fundingpoolAdapter, dao, this.owner, hre.ethers.utils.parseEther("1000"), this.testtoken1);

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

    it("should be impossible dao summonor quit from gp", async () => {
        const gpdaoAdapter = this.adapters.gpdaoAdapter.instance;
        const gpDaoExt = this.extensions.gpDaoExt.functions;
        const dao = this.dao;
        await expectRevert(gpdaoAdapter.gpQuit(dao.address), "revert");
    })

    it("should be possible dao member quit himself", async () => {
        const gpdaoAdapter = this.adapters.gpdaoAdapter.instance;
        const gpDaoExt = this.extensions.gpDaoExt.functions;
        const dao = this.dao;
        await addNewGP(this.gp1.address, this.gpDaoOnboardingAdapter, this.gpOnboardVotingAdapter, dao, this.gpdaoExt, [this.owner, this.gp1, this.gp2]);
        let isGP = await gpDaoExt.isGeneralPartner(this.gp1.address);
        console.log(`gp1 is a GP: ${isGP}`);
        expect(isGP[0]).equal(true);

        await gpdaoAdapter.connect(this.gp1).gpQuit(dao.address);
        isGP = await gpDaoExt.isGeneralPartner(this.gp1.address);
        console.log(`gp1 is a GP: ${isGP}`);
        expect(isGP[0]).equal(false);
    })
});
