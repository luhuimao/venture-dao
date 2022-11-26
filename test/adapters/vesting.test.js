/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-11-10 21:57:41
 * @LastEditors: huhuimao
 * @LastEditTime: 2022-11-26 17:15:39
 */


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
    oneDay,
    oneWeek
} = require("../../utils/contract-util");

const {
    fundingpoolExtensionAclFlagsMap,
    bankExtensionAclFlagsMap,
    daoAccessFlagsMap,
    entryDao,
    entryFundingPool,
    calculateFlagValue
} = require("../../utils/access-control-util");

const { extensionsIdsMap, adaptersIdsMap } = require("../../utils/dao-ids-util");
const hre = require("hardhat");
import { create } from "ts-node";
import { isAwaitExpression } from "typescript";
import { RiceStakingAdapterContract_GOERLI } from "../../.config";
// const { getConfig } = require("../../migrations/configs/contracts.config");

import { deployDefaultDao, takeChainSnapshot, revertChainSnapshot, proposalIdGenerator, expect, expectRevert, web3 } from "../../utils/hh-util";
const { checkBalance, depositToFundingPool, createDistributeFundsProposal } = require("../../utils/test-util");

describe("Adapter - Vesting", () => {
    before("deploy dao", async () => {
        let [owner, user1, user2, investor1, investor2, gp1, gp2, project_team1, project_team2, project_team3, rice_staker] = await hre.ethers.getSigners();
        this.owner = owner;
        this.user1 = user1;
        this.user2 = user2;
        this.investor1 = investor1;
        this.investor2 = investor2;
        this.gp1 = gp1;
        this.gp2 = gp2;
        this.project_team1 = project_team1;
        this.project_team2 = project_team2;
        this.project_team3 = project_team3;

        this.rice_staker = rice_staker;

        const { dao, adapters, extensions, testContracts } = await deployDefaultDao({
            owner: owner,
        });
        this.adapters = adapters;
        this.extensions = extensions;
        this.dao = dao;
        this.testContracts = testContracts;
        //test contract
        this.testtoken1 = testContracts.testToken1.instance
        this.testtoken2 = testContracts.testToken2.instance
        this.testRiceToken = testContracts.testRiceToken.instance
        //ext
        this.fundingPoolExt = this.extensions.fundingpoolExt.functions;
        this.gpdaoExt = this.extensions.gpDaoExt.functions;
        // this.riceStakingExt = this.extensions.ricestakingExt.functions;
        //adapters
        // this.streamingPayment = this.adapters.sablierAdapter.instance;
        // this.manageMember = this.adapters.manageMemberAdapter.instance;
        // this.allocationAdapter = this.adapters.allocation.instance;
        this.allocationAdapterv2 = this.adapters.allocationv2.instance;
        this.gpvoting = this.adapters.gpVotingAdapter.instance;
        this.distributefund = this.adapters.distributeFundAdapterv2.instance;
        this.fundingpoolAdapter = this.adapters.fundingpoolAdapter.instance;
        this.gpdaoAdapter = this.adapters.gpdaoAdapter.instance;
        this.gpDaoOnboardingAdapter = this.adapters.gpDaoOnboardingAdapter.instance;
        this.gpOnboardVotingAdapter = this.adapters.gpOnboardVotingAdapter.instance;
        this.vestingAdapter = this.adapters.furoVesting.instance;
        // this.benToBoxAdapter= this.adapters.bentoBoxV1.instance;
        this.snapshotId = await takeChainSnapshot();

        // console.log(`bentobox address ${this.benToBoxAdapter.address}`);

        await this.testtoken1.transfer(investor1.address, hre.ethers.utils.parseEther("2000"));
        await this.testtoken1.transfer(investor2.address, hre.ethers.utils.parseEther("2000"));
        await this.testtoken1.transfer(gp1.address, hre.ethers.utils.parseEther("21000"));
        await this.testtoken1.transfer(gp2.address, hre.ethers.utils.parseEther("21000"));

        await this.testRiceToken.transfer(rice_staker.address, hre.ethers.utils.parseEther("20000"));

        //add new GP
        await depositToFundingPool(this.fundingpoolAdapter, dao, this.owner, hre.ethers.utils.parseEther("20000"), this.testtoken1);
        await addNewGP(this.gp1.address, this.gpDaoOnboardingAdapter, this.gpOnboardVotingAdapter, dao, this.gpdaoExt, [this.gp1, this.gp2]);
        await depositToFundingPool(this.fundingpoolAdapter, dao, this.gp1, hre.ethers.utils.parseEther("20000"), this.testtoken1);
        await addNewGP(this.gp2.address, this.gpDaoOnboardingAdapter, this.gpOnboardVotingAdapter, dao, this.gpdaoExt, [this.gp1, this.gp2]);
        await depositToFundingPool(this.fundingpoolAdapter, dao, this.gp2, hre.ethers.utils.parseEther("20000"), this.testtoken1);
        await depositToFundingPool(this.fundingpoolAdapter, dao, this.investor1, hre.ethers.utils.parseEther("2000"), this.testtoken1);
        await depositToFundingPool(this.fundingpoolAdapter, dao, this.investor2, hre.ethers.utils.parseEther("2000"), this.testtoken1);

        const fundRaisingWindwoEndTime = await dao.getConfiguration(sha3("FUND_RAISING_WINDOW_END"));
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaisingWindwoEndTime) + 1]);
        await hre.network.provider.send("evm_mine");
        await this.fundingpoolAdapter.processFundRaise(dao.address);
        console.log(`fund raise status: ${await this.fundingpoolAdapter.fundRaisingState()}`);
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
        console.log(`proposalDuration: ${await dao.getConfiguration(sha3("distributeFund.proposalDuration"))}`);
        console.log(`creationTime: ${proposalInfo.creationTime}`);
        console.log(`stopVoteTime: ${proposalInfo.stopVoteTime}`);
        let allGPs = await gpDaoExe.getAllGPs();
        let arrayGPs = allGPs.toString().split(',');
        console.log(`arrayGPs: ${arrayGPs}`);
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        console.log(`current blocktimestamp ${blocktimestamp}`);
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



    it("should be impossible to create a vest if recipient is not eligible", async () => {
        const dao = this.dao;
        const distributeFundContract = this.distributefund
        const amountToDistribute = 10;
        const project_team1 = this.project_team1.address;
        const vestingAdapter = this.vestingAdapter;

        const requestedFundAmount = hre.ethers.utils.parseEther("10000");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("50000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        let currentBlockTime = blocktimestamp;
        const vestingStartTime = currentBlockTime;
        const vestingcliffDuration = currentBlockTime + 1000;
        const stepDuration = oneDay;
        const steps = 7;
        // const stepPercentage=hre.ethers.utils.parseEther("1").div(toBN(steps));
        const vestingCliffLockAmount = hre.ethers.utils.parseEther("10000");

        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = this.testtoken2.address;

        await this.testtoken2.transfer(this.project_team1.address, tradingOffTokenAmount);
        await this.testtoken2.connect(this.project_team1).approve(distributeFundContract.address, tradingOffTokenAmount);

        let { proposalId } = await createDistributeFundsProposal(
            dao,
            distributeFundContract,
            requestedFundAmount,
            tradingOffTokenAmount,
            vestingStartTime,
            vestingcliffDuration,
            stepDuration,
            steps,
            vestingCliffLockAmount,
            projectTeamAddr,
            projectTeamTokenAddr,
            projectTeamAddr,
            this.owner
        );
        console.log(`proposalId: ${hre.ethers.utils.toUtf8String(proposalId)}`);
        this.proposalId = proposalId;

        let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        await distributeFundContract.startVotingProcess(dao.address, this.proposalId);
        distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        console.log(`proposal state: ${distriInfo.status}`);

        // owner Vote YES on the proposal
        await this.gpvoting.submitVote(dao.address, proposalId, 1);
        // gp1 Vote YES on the proposal
        await this.gpvoting.connect(this.gp1).submitVote(dao.address, proposalId, 1);
        // gp2 Vote YES on the proposal
        await this.gpvoting.connect(this.gp2).submitVote(dao.address, proposalId, 1);

        currentBlockTime = (await hre.ethers.provider.getBlock("latest")).timestamp;
        console.log(`
        current block time ${currentBlockTime}
        proposal stop vote time ${distriInfo.proposalStopVotingTimestamp.toString()}
        `);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStopVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        let tx = await distributeFundContract.processProposal(dao.address, this.proposalId);
        let rel = await tx.wait();

        let eligible = await this.allocationAdapterv2.ifEligible(dao.address, this.user1.address, this.proposalId);
        console.log(`
            user ${this.user1.address} if eligible to create vest for proposal ${this.proposalId}? ${eligible}
        `);

        await expectRevert(
            vestingAdapter.connect(this.user1).createVesting(dao.address, this.user1.address, this.proposalId),
            "revert"
        );
    });

    it("should be possible to craete vest if user eligible", async () => {
        const project_team1 = this.project_team1.address;
        const dao = this.dao;
        const fundingpoolAdapter = this.fundingpoolAdapter;
        const fundingPoolExt = this.fundingPoolExt;
        const gpdaoExt = this.gpdaoExt;
        const distributeFundContract = this.distributefund;
        const vestingAdapter = this.vestingAdapter;

        //create vest
        const users = [this.owner,
        this.user1,
        this.user2,
        this.investor1,
        this.investor2,
        this.gp1,
        this.gp2,
        this.project_team1,
        this.project_team2,
        this.project_team3
        ];
        let lps = await fundingPoolExt.getInvestors();
        lps = lps[0];
        console.log(`
        all lps ${lps}
        `);
        for (var i = 0; i < lps.length; i++) {
            let eligible = await this.allocationAdapterv2.ifEligible(dao.address, lps[i], this.proposalId);
            if (eligible) {
                for (var j = 0; j < users.length; j++) {
                    if (lps[i] == users[j].address) {
                        let tx = await vestingAdapter.connect(users[j]).createVesting(dao.address, lps[i], this.proposalId);
                        let rel = await tx.wait();
                        console.log("$$$$$$$$$$$$$$$$$$$$$$$ gas used: ", rel.gasUsed.toString());
                    }
                }
            }
        }

        let nextVestId = await vestingAdapter.vestIds();
        nextVestId = parseInt(nextVestId.toString());
        console.log("nextVestId: ", nextVestId);

        await expectRevert(vestingAdapter.withdraw(dao.address, 2), "revert");

        let distriInfo = await distributeFundContract.distributions(dao.address, this.proposalId);
        const vestingStartTime = distriInfo.vestInfo.vestingStartTime;
        const vestingCliffDuration = distriInfo.vestInfo.vestingCliffDuration;
        const vestingStepDuration = distriInfo.vestInfo.vestingStepDuration;
        const vestingSteps = distriInfo.vestInfo.vestingSteps;
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(vestingStartTime) +
            parseInt(vestingCliffDuration) +
            parseInt(vestingStepDuration) * vestingSteps
            + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        let total = 0
        let cliffTotal = 0;
        let stepTotal = 0;
        for (var i = 1; i < nextVestId; i++) {
            let vestInfo = await vestingAdapter.vests(i);
            const claimableBal = await vestingAdapter.vestBalance(i);
            let totalDepositAmount = toBN(vestInfo.cliffShares.toString()).add(toBN(vestInfo.stepShares).mul(vestingSteps));
            total += toBN(total).add(toBN(totalDepositAmount));
            cliffTotal += toBN(cliffTotal).add(toBN(vestInfo.cliffShares));
            stepTotal += toBN(stepTotal).add(toBN(vestInfo.stepShares).mul(vestingSteps));
            console.log(`
            cliff shares ${hre.ethers.utils.formatEther(vestInfo.cliffShares.toString())}
            step shares ${hre.ethers.utils.formatEther(vestInfo.stepShares.toString())}
            recipient of vest ${i}: ${vestInfo.recipient}
            depoist amount ${hre.ethers.utils.formatEther(totalDepositAmount)}
            claimable balance of vest ${i}: ${hre.ethers.utils.formatEther(claimableBal)}
            `);

            //withdraw 
            for (var j = 0; j < users.length; j++) {
                if (users[j].address == vestInfo.recipient) {
                    console.log(`
                    withdraw from vest ${i} ...
                    `);
                    await vestingAdapter.connect(users[j]).withdraw(dao.address, i);
                    const claimableBal = await vestingAdapter.vestBalance(i);
                    vestInfo = await vestingAdapter.vests(i);

                    console.log(`
                    claimable balance of vest ${i}: ${hre.ethers.utils.formatEther(claimableBal)}
                    claimed amount of vest ${i}: ${hre.ethers.utils.formatEther(vestInfo.claimed)}
                    `);
                }
            }

        }
        console.log(`
        total cliff amount ${hre.ethers.utils.formatEther(cliffTotal.toString())}
        total step amount ${hre.ethers.utils.formatEther(stepTotal.toString())}
        total amount ${hre.ethers.utils.formatEther(total.toString())}
        `);
    });

    it("should be impossible to create a vest twice", async () => {
        const dao = this.dao;
        const vestingAdapter = this.vestingAdapter;
        const created = await this.allocationAdapterv2.isVestCreated(dao.address, this.proposalId, this.owner.address);
        console.log(`
        user ${this.owner.address} create vest for proposal ${this.proposalId} ? ${created}
        `);
        expect(created).equal(true);
        await expectRevert(vestingAdapter.createVesting(dao.address, this.owner.address, this.proposalId), "revert");
    });

    // it("vesting step shares > deposit amount", async () => {
    //     const dao = this.dao;
    //     const distributeFundContract = this.distributefund
    //     const amountToDistribute = 10;
    //     const project_team1 = this.project_team1.address;
    //     const vestingAdapter = this.vestingAdapter;

    //     const requestedFundAmount = hre.ethers.utils.parseEther("10000");
    //     const tradingOffTokenAmount = hre.ethers.utils.parseEther("50000");
    //     let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
    //     let currentBlockTime = blocktimestamp;
    //     const vestingStartTime = currentBlockTime;
    //     const vestingCliffDuration = currentBlockTime + 1000;
    //     const stepDuration = oneDay;
    //     const steps = 7;
    //     // const stepPercentage=hre.ethers.utils.parseEther("1").div(toBN(steps));
    //     const vestingCliffLockAmount = hre.ethers.utils.parseEther("10000");

    //     const projectTeamAddr = this.project_team1.address;
    //     const projectTeamTokenAddr = this.testtoken2.address;

    //     await this.testtoken2.transfer(this.project_team1.address, tradingOffTokenAmount);
    //     await this.testtoken2.connect(this.project_team1).approve(distributeFundContract.address, tradingOffTokenAmount);

    //     await dao.setConfiguration(sha3("FUND_END_TIME"), currentBlockTime + 60000000);

    //     await expectRevert(createDistributeFundsProposal(
    //         dao,
    //         distributeFundContract,
    //         requestedFundAmount,
    //         tradingOffTokenAmount,
    //         vestingStartTime,
    //         vestingCliffDuration,
    //         stepDuration,
    //         steps,
    //         stepPercentage,
    //         projectTeamAddr,
    //         projectTeamTokenAddr,
    //         projectTeamAddr,
    //         this.owner
    //     ), "revert");
    // let { proposalId } = await createDistributeFundsProposal(
    //     dao,
    //     distributeFundContract,
    //     requestedFundAmount,
    //     tradingOffTokenAmount,
    //     vestingStartTime,
    //     vestingCliffDuration,
    //     stepDuration,
    //     steps,
    //     stepPercentage,
    //     projectTeamAddr,
    //     projectTeamTokenAddr,
    //     projectTeamAddr,
    //     this.owner
    // );
    // console.log(`proposalId: ${hre.ethers.utils.toUtf8String(proposalId)}`);
    // this.proposalId = proposalId;

    // let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
    // await distributeFundContract.startVotingProcess(dao.address, this.proposalId);
    // distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
    // console.log(`proposal state: ${distriInfo.status}`);

    // // owner Vote YES on the proposal
    // await this.gpvoting.submitVote(dao.address, proposalId, 1);
    // // gp1 Vote YES on the proposal
    // await this.gpvoting.connect(this.gp1).submitVote(dao.address, proposalId, 1);
    // // gp2 Vote YES on the proposal
    // await this.gpvoting.connect(this.gp2).submitVote(dao.address, proposalId, 1);

    // currentBlockTime = (await hre.ethers.provider.getBlock("latest")).timestamp;
    // console.log(`
    // current block time ${currentBlockTime}
    // proposal stop vote time ${distriInfo.proposalStopVotingTimestamp.toString()}
    // `);
    // await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStopVotingTimestamp) + 1])
    // await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

    // let tx = await distributeFundContract.processProposal(dao.address, this.proposalId);
    // let rel = await tx.wait();


    // distriInfo = await distributeFundContract.distributions(dao.address, this.proposalId);
    // const vestingStepDuration = distriInfo.vestInfo.vestingStepDuration;
    // const vestingSteps = distriInfo.vestInfo.vestingSteps;
    // await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(vestingStartTime) +
    //     parseInt(vestingCliffDuration) +
    //     parseInt(vestingStepDuration) * vestingSteps
    //     + 1])
    // await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

    // let nextVestId = await vestingAdapter.vestIds();
    // console.log(`
    // nextVestId ${nextVestId.toString()}
    // `);
    // tx = await vestingAdapter.createVesting(dao.address, this.owner.address, this.proposalId);

    // let vestInfo = await vestingAdapter.vests(nextVestId);
    // let claimableBal = await vestingAdapter.vestBalance(nextVestId);
    // let totalDepositAmount = toBN(vestInfo.cliffShares.toString()).add(toBN(vestInfo.stepShares).mul(vestingSteps));
    // console.log(`
    // cliff shares ${hre.ethers.utils.formatEther(vestInfo.cliffShares.toString())}
    // step shares ${hre.ethers.utils.formatEther(vestInfo.stepShares.toString())}
    // recipient of vest ${nextVestId}: ${vestInfo.recipient}
    // depoist amount ${hre.ethers.utils.formatEther(totalDepositAmount)}
    // claimable balance of vest ${nextVestId}: ${hre.ethers.utils.formatEther(claimableBal)}
    // claimed amount: ${hre.ethers.utils.formatEther(vestInfo.claimed.toString())}
    // `)

    // await vestingAdapter.withdraw(dao.address, nextVestId);

    // vestInfo = await vestingAdapter.vests(nextVestId);
    // claimableBal = await vestingAdapter.vestBalance(nextVestId);
    // console.log(`
    // claimable balance of vest ${i}: ${hre.ethers.utils.formatEther(claimableBal)}
    // claimed amount: ${hre.ethers.utils.formatEther(vestInfo.claimed.toString())}
    // `)
    // });

});