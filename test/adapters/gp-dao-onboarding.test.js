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
const proposalCounter = proposalIdGenerator().generator;

const { checkBalance } = require("../../utils/test-util");
const hre = require("hardhat");

function getProposalCounter() {
    return proposalCounter().next().value;
}

async function advanceTime(addr1, addr2, token) {

    for (var i = 0; i < 10; i++) {
        await token.transfer(addr2.address, 1);

        await token.connect(addr2).transfer(addr1.address, 1);

    }
}


describe("Adapter - GPDaoOnboarding", () => {
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
        this.snapshotId = await takeChainSnapshot();
        this.testtoken1 = testContracts.testToken1.instance

        const isGP = await extensions.gpDaoExt.functions.isGeneralPartner(owner.address);
        console.log(`owner is a GP: ${isGP}`);
    });

    beforeEach(async () => {
        await revertChainSnapshot(this.snapshotId);
        this.snapshotId = await takeChainSnapshot();
    });

    it("should be impossible submit an onboarding proposal by non GP", async () => {
        const gpDaoOnboardingAdapter = this.adapters.gpDaoOnboardingAdapter.instance;
        const dao = this.dao;
        await expectRevert(gpDaoOnboardingAdapter.connect(this.user1).submitProposal(dao.address, this.gp1.address), "revert");
    })

    it("should be possible GP to submit an onboarding proposal", async () => {
        const gpDaoOnboardingAdapter = this.adapters.gpDaoOnboardingAdapter.instance;
        const gpOnboardVotingAdatper = this.adapters.gpOnboardVotingAdapter.instance;
        const gpDaoExt = this.extensions.gpDaoExt.functions;
        const dao = this.dao;
        console.log("this.gp1 addr: ", this.gp1.address);
        let tx = await gpDaoOnboardingAdapter.submitProposal(dao.address, this.gp1.address);
        const result = await tx.wait();
        const newOnboardingProposalId = result.events[2].args.proposalId;
        console.log(`newOnboardingProposalId: ${hre.ethers.utils.toUtf8String(newOnboardingProposalId)}`);

        const proposalInfo = await gpDaoOnboardingAdapter.proposals(dao.address, newOnboardingProposalId);


        const ProposalDetails = await gpDaoOnboardingAdapter.proposals(dao.address, newOnboardingProposalId);
        console.log(`new onboarding proposal proposalID: ${ProposalDetails.id}, applicant:${ProposalDetails.applicant}`);

        let isGP = await this.extensions.gpDaoExt.functions.isGeneralPartner(this.gp1.address);
        console.log(`gp1 is a GP: ${isGP}`);

        //vote for proposal
        await gpOnboardVotingAdatper.submitVote(dao.address, newOnboardingProposalId, 1);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        const voteRel = await gpOnboardVotingAdatper.voteResult(dao.address, newOnboardingProposalId);
        console.log(`gp onborading voting result: ${voteRel}`);
        await gpDaoOnboardingAdapter.processProposal(dao.address, newOnboardingProposalId);

        isGP = await this.extensions.gpDaoExt.functions.isGeneralPartner(this.gp1.address);
        console.log(`gp1 is a GP: ${isGP}`);
    })
});
