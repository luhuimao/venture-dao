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



describe("Adapter - GPKick", () => {
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

    it("should be impossible to submit proposal by non GP member", async () => {
        const gpKickAdapter = this.adapters.gpKickAdapter.instance;
        const dao = this.dao;

        await expectRevert(gpKickAdapter.connect(this.gp1).submitProposal(dao.address, this.gp1.address), "revert");
    })

    it("should be possible to submit a GP Kick proposal by GP member", async () => {
        const gpDaoOnboardingAdapter = this.adapters.gpDaoOnboardingAdapter.instance;
        const gpKickAdapter = this.adapters.gpKickAdapter.instance;

        const gpOnboardVotingAdatper = this.adapters.gpOnboardVotingAdapter.instance;
        const gpDaoExt = this.extensions.gpDaoExt.functions;
        const dao = this.dao;

        await addNewGP(this.gp1.address, gpDaoOnboardingAdapter, gpOnboardVotingAdatper, dao, this.extensions.gpDaoExt.functions, [this.gp1, this.gp2])

        //create gp kick proposal
        const tx = await gpKickAdapter.submitProposal(dao.address, this.gp1.address);
        const result = await tx.wait();
        const newKickProposalId = result.events[2].args.proposalId;
        console.log(`newKickProposalId: ${hre.ethers.utils.toUtf8String(newKickProposalId)}`);
        const kickProposalInfo = await gpKickAdapter.kickProposals(dao.address, newKickProposalId);
        //vote and process proposal
        await gpOnboardVotingAdatper.submitVote(dao.address, newKickProposalId, 1);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(kickProposalInfo.stopVoteTime) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        const voteRel = await gpOnboardVotingAdatper.voteResult(dao.address, newKickProposalId);
        console.log("voteRel:", voteRel);
        await gpKickAdapter.processProposal(dao.address, newKickProposalId);
        const isGP = await this.extensions.gpDaoExt.functions.isGeneralPartner(this.gp1.address);
        expect(isGP[0]).equal(false);
    })

    it("should be possible to submit a GP Kick proposal by GP member", async () => {
        const gpDaoOnboardingAdapter = this.adapters.gpDaoOnboardingAdapter.instance;
        const gpKickAdapter = this.adapters.gpKickAdapter.instance;

        const gpOnboardVotingAdatper = this.adapters.gpOnboardVotingAdapter.instance;
        const gpDaoExt = this.extensions.gpDaoExt.functions;
        const dao = this.dao;

        await addNewGP(this.gp1.address, gpDaoOnboardingAdapter, gpOnboardVotingAdatper, dao, this.extensions.gpDaoExt.functions, [this.gp1, this.gp2])

        //create gp kick proposal
        const tx = await gpKickAdapter.submitProposal(dao.address, this.gp1.address);
        const result = await tx.wait();
        const newKickProposalId = result.events[2].args.proposalId;
        console.log(`newKickProposalId: ${hre.ethers.utils.toUtf8String(newKickProposalId)}`);
        const kickProposalInfo = await gpKickAdapter.kickProposals(dao.address, newKickProposalId);
        //vote and process proposal
        await gpOnboardVotingAdatper.submitVote(dao.address, newKickProposalId, 1);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(kickProposalInfo.stopVoteTime) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        const voteRel = await gpOnboardVotingAdatper.voteResult(dao.address, newKickProposalId);
        console.log("voteRel:", voteRel);
        await gpKickAdapter.processProposal(dao.address, newKickProposalId);
        const isGP = await this.extensions.gpDaoExt.functions.isGeneralPartner(this.gp1.address);
        expect(isGP[0]).equal(false);
    })

    it("should be impossible to submit an GP Kick proposal to kick dao summonor", async () => {
        const gpDaoOnboardingAdapter = this.adapters.gpDaoOnboardingAdapter.instance;
        const gpKickAdapter = this.adapters.gpKickAdapter.instance;

        const gpOnboardVotingAdatper = this.adapters.gpOnboardVotingAdapter.instance;
        const gpDaoExt = this.extensions.gpDaoExt.functions;
        const dao = this.dao;

        await expectRevert(gpDaoOnboardingAdapter.submitProposal(dao.address, this.owner.address), "revert");
    })
});
