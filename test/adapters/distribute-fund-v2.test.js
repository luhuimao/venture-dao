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
    maxUnits
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
import { RiceStakingAdapterContract_GOERLI } from "../../.config";
// const { getConfig } = require("../../migrations/configs/contracts.config");

import { deployDefaultDao, takeChainSnapshot, revertChainSnapshot, proposalIdGenerator, expect, expectRevert, web3 } from "../../utils/hh-util";

const proposalCounter = proposalIdGenerator().generator;



// async function advanceTime(addr1, addr2, token) {

//     for (var i = 0; i < 10; i++) {
//         await token.transfer(addr2.address, 1);

//         await token.connect(addr2).transfer(addr1.address, 1);

//     }
// }

function getProposalCounter() {
    return proposalCounter().next().value;
}


describe("Adapter - DistributeFundsV2", () => {
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
        this.riceStakingExt = this.extensions.ricestakingExt.functions;
        //adapters
        this.streamingPayment = this.adapters.sablierAdapter.instance;
        // this.manageMember = this.adapters.manageMemberAdapter.instance;
        this.allocationAdapter = this.adapters.allocation.instance;
        this.allocationAdapterv2 = this.adapters.allocationv2.instance;
        this.gpvoting = this.adapters.gpVotingAdapter.instance;
        this.distributefund = this.adapters.distributeFundAdapterv2.instance;
        this.fundingpoolAdapter = this.adapters.fundingpoolAdapter.instance;
        this.gpdaoAdapter = this.adapters.gpdaoAdapter.instance;
        this.gpDaoOnboardingAdapter = this.adapters.gpDaoOnboardingAdapter.instance;
        this.gpOnboardVotingAdapter = this.adapters.gpOnboardVotingAdapter.instance;
        this.stakingRiceAdapter = this.adapters.ricestakingAdapter.instance;
        this.snapshotId = await takeChainSnapshot();

        await this.testtoken1.transfer(investor1.address, hre.ethers.utils.parseEther("1000"));
        await this.testtoken1.transfer(investor2.address, hre.ethers.utils.parseEther("1000"));

        await this.testtoken1.transfer(gp1.address, hre.ethers.utils.parseEther("21000"));
        await this.testtoken1.transfer(gp2.address, hre.ethers.utils.parseEther("21000"));

        console.log(`investor1 testtoken1 balance: ${await this.testtoken1.balanceOf(investor1.address)}`);
        console.log(`investor2 testtoken1 balance: ${await this.testtoken1.balanceOf(investor2.address)}`);
        console.log(`gp1 testtoken1 balance: ${await this.testtoken1.balanceOf(gp1.address)}`);
        console.log(`gp2 testtoken1 balance: ${await this.testtoken1.balanceOf(gp2.address)}`);

        await this.testRiceToken.transfer(rice_staker.address, hre.ethers.utils.parseEther("20000"));
        console.log(`rice_staker rice balance: ${await this.testRiceToken.balanceOf(rice_staker.address)}`);

        console.log("dao member 1 addr: ", (await dao.getMemberAddress(0)));
        console.log("dao member 2 addr: ", (await dao.getMemberAddress(1)));

        //add new GP
        await depositToFundingPool(this.fundingpoolAdapter, dao, this.owner, hre.ethers.utils.parseEther("1000"), this.testtoken1);
        await addNewGP(this.gp1.address, this.gpDaoOnboardingAdapter, this.gpOnboardVotingAdapter, dao, this.gpdaoExt, [this.gp1, this.gp2]);
        await depositToFundingPool(this.fundingpoolAdapter, dao, this.gp1, hre.ethers.utils.parseEther("1000"), this.testtoken1);
        await addNewGP(this.gp2.address, this.gpDaoOnboardingAdapter, this.gpOnboardVotingAdapter, dao, this.gpdaoExt, [this.gp1, this.gp2]);

        // await this.fundingpoolAdapter.registerPotentialNewToken(dao.address, this.testtoken1.address);
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

    const stakingRice = async (stakingRiceAdapter,
        dao,
        investor,
        amount,
        token) => {
        await token.connect(investor).approve(stakingRiceAdapter.address, amount);
        await stakingRiceAdapter.connect(investor).deposit(dao.address, amount);
    }

    const distributeFundsProposal = async (
        dao,
        distributeFundContract,
        requestedFundAmount,
        tradingOffTokenAmount,
        fullyReleasedDate,
        lockupDate,
        projectTeamAddr,
        projectTokenAddr,
        sender
    ) => {
        const tx = await distributeFundContract.connect(sender).submitProposal(
            dao.address,
            [projectTeamAddr, projectTokenAddr],
            [requestedFundAmount, tradingOffTokenAmount, fullyReleasedDate, lockupDate],
        );
        const result = await tx.wait();
        const newProposalId = result.events[2].args.proposalId;
        return { proposalId: newProposalId };
    };


    it("should be not possible to submit a funding proposal by non gp member", async () => {
        const dao = this.dao;
        const distributeFundContract = this.distributefund
        const amountToDistribute = 10;
        const project_team1 = this.project_team1.address;


        const requestedFundAmount = hre.ethers.utils.parseEther("10000");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("50000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const lockupDate = blocktimestamp;
        const fullyReleasedDate = lockupDate + 1000;
        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = this.testtoken2.address;

        await expectRevert(
            distributeFundsProposal(
                dao,
                distributeFundContract,
                requestedFundAmount,
                tradingOffTokenAmount,
                fullyReleasedDate,
                lockupDate,
                projectTeamAddr,
                projectTeamTokenAddr,
                this.user2
            ),
            "revert"
        );
    });

    it("should be possible to distribute funds to project team", async () => {
        const project_team1 = this.project_team1.address;
        const dao = this.dao;
        const fundingpoolAdapter = this.fundingpoolAdapter;
        const riceStakingAdapter = this.riceStakingAdapter;
        const fundingPoolExt = this.fundingPoolExt;
        const riceStakingExt = this.riceStakingExt;
        const gpdaoExt = this.gpdaoExt;
        const distributeFundContract = this.distributefund;
        const streamingPaymentContract = this.streamingPayment;
        //gp deposit funds
        await depositToFundingPool(this.fundingpoolAdapter, dao, this.gp1, hre.ethers.utils.parseEther("20000"), this.testtoken1);
        await depositToFundingPool(this.fundingpoolAdapter, dao, this.gp2, hre.ethers.utils.parseEther("20000"), this.testtoken1);
        //staking rice
        await stakingRice(this.stakingRiceAdapter, dao, this.rice_staker, hre.ethers.utils.parseEther("20000"), this.testRiceToken);

        console.log(`gp1 balance in funding pool: ${hre.ethers.utils.formatEther(
            (await fundingpoolAdapter.balanceOf(dao.address, this.gp1.address)).toString()
        )
            }`);
        console.log(`gp2 balance in funding pool: ${hre.ethers.utils.formatEther((await fundingpoolAdapter.balanceOf(dao.address, this.gp2.address)).toString())
            }`);

        console.log(`total supply ${hre.ethers.utils.formatEther((await fundingPoolExt.totalSupply()).toString())}`);
        console.log(`rice_staker balance: ${hre.ethers.utils.formatEther(
            (await riceStakingExt.balanceOf(this.rice_staker.address, this.testRiceToken.address)).toString())}`);

        expect((await gpdaoExt.isGeneralPartner(this.gp1.address))[0]).equal(true);
        expect((await gpdaoExt.isGeneralPartner(this.gp2.address))[0]).equal(true);
        console.log(`fundingpoolExt tt1 bal: ${hre.ethers.utils.formatEther((await this.testtoken1.balanceOf(this.extensions.fundingpoolExt.address)).toString())}`);

        // Submit distribute proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("30000");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("50000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const lockupDate = blocktimestamp + 24;
        console.log(`lockupDate: ${lockupDate}`);
        const fullyReleasedDate = lockupDate + 1000;
        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = this.testtoken2.address;

        await this.testtoken2.transfer(this.project_team1.address, tradingOffTokenAmount);
        console.log(`project token balance of project_team1:  ${hre.ethers.utils.formatEther(await this.testtoken2.balanceOf(this.project_team1.address))}`);
        await this.testtoken2.connect(this.project_team1).approve(distributeFundContract.address, tradingOffTokenAmount);
        console.log(`project token allowance of distributeFundContract : ${hre.ethers.utils.formatEther(await this.testtoken2.allowance(this.project_team1.address, distributeFundContract.address))}`);

        let { proposalId } = await distributeFundsProposal(
            dao,
            distributeFundContract,
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

        let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        console.log(`distriInfo -> proposalStartVotingTimestamp:  ${distriInfo.proposalStartVotingTimestamp}`);
        console.log(`current blcok timestamp ->: ${(await hre.ethers.provider.getBlock("latest")).timestamp}`);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStartVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        //start Voting Process
        await distributeFundContract.startVotingProcess(dao.address, this.proposalId);
        distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        console.log(`proposal state: ${distriInfo.status}`);
        const voteInfo = await this.gpvoting.votes(dao.address, this.proposalId);
        console.log(`start voting time of proposal ${this.proposalId} : ${voteInfo.startingTime}`);

        let projectTeamLockedTokenAmount = await distributeFundContract.projectTeamLockedTokens(dao.address, proposalId, projectTeamAddr);
        console.log(`projectTeam Locked Token Amount ${hre.ethers.utils.formatEther(projectTeamLockedTokenAmount)}`);
        // console.log(`snap funds: ${hre.ethers.utils.formatEther((await fundingPoolExt.snapFunds()).toString())}`);
        console.log(`current blcok timestamp ->: ${(await hre.ethers.provider.getBlock("latest")).timestamp}`);

        // owner Vote YES on the proposal
        await this.gpvoting.submitVote(dao.address, proposalId, 1);
        // gp1 Vote YES on the proposal
        await this.gpvoting.connect(this.gp1).submitVote(dao.address, proposalId, 1);
        // gp2 Vote YES on the proposal
        await this.gpvoting.connect(this.gp2).submitVote(dao.address, proposalId, 1);
        //get gp voting result
        console.log(`distributions status: ${(await distributeFundContract.distributions(dao.address, proposalId)).status}`);


        // console.log(`voting.gracePeriod: ${await this.dao.getConfiguration(sha3("voting.gracePeriod"))}`);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStopVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        console.log(`current blcok timestamp ->: ${(await hre.ethers.provider.getBlock("latest")).timestamp}`);

        // Starts to process the proposal
        await distributeFundContract.processProposal(dao.address, this.proposalId);
        console.log(`distributions status: ${(await distributeFundContract.distributions(dao.address, proposalId)).status}`);
        const voteResults = await this.gpvoting.voteResult(dao.address, proposalId);
        console.log(`voteResults: ${voteResults}`);

        console.log(`total supply ${hre.ethers.utils.formatEther((await fundingPoolExt.totalSupply()).toString())}`);
        console.log(`fundingpoolExt USDT bal: ${hre.ethers.utils.formatEther((await this.testtoken1.balanceOf(this.extensions.fundingpoolExt.address)).toString())}`);
        projectTeamLockedTokenAmount = await distributeFundContract.projectTeamLockedTokens(dao.address, proposalId, projectTeamAddr);
        console.log(`projectTeam Locked Token Amount ${hre.ethers.utils.formatEther(projectTeamLockedTokenAmount)}`);
        console.log("project_team1 TestToken1 balance: ", hre.ethers.utils.formatEther((await this.testtoken1.balanceOf(project_team1)).toString()));
        expect((await this.testtoken1.balanceOf(project_team1))).equal(requestedFundAmount);

        let gp1BalanceInFundingPool = hre.ethers.utils.formatEther((await fundingPoolExt.balanceOf(this.gp1.address)).toString());
        let gp2BalanceInFundingPool = hre.ethers.utils.formatEther((await fundingPoolExt.balanceOf(this.gp2.address)).toString());

        console.log(`gp1 balance in funding pool:   ${gp1BalanceInFundingPool}`);
        console.log(`gp2 balance in funding pool: ${gp2BalanceInFundingPool}`);
        // expect(parseInt(gp1BalanceInFundingPool)).equal(19000 - 30000 / 2);
        // expect(parseInt(gp2BalanceInFundingPool)).equal(19000 - 30000 / 2);

        //allocation calculate
        //1. funding rewards
        const gp1fundingRewards = await this.allocationAdapterv2.getFundingRewards(dao.address,
            this.gp1.address,
            (await distributeFundContract.distributions(dao.address, proposalId)).tradingOffTokenAmount
        );
        const gp2fundingRewards = await this.allocationAdapterv2.getFundingRewards(dao.address,
            this.gp2.address,
            (await distributeFundContract.distributions(dao.address, proposalId)).tradingOffTokenAmount
        );
        const rice_staker_fundingRewards = await this.allocationAdapterv2.getFundingRewards(dao.address,
            this.rice_staker.address,
            (await distributeFundContract.distributions(dao.address, proposalId)).tradingOffTokenAmount
        );

        //2. gp bonus
        const gp1Bonus = await this.allocationAdapterv2.getGPBonus(dao.address,
            this.gp1.address,
            (await distributeFundContract.distributions(dao.address, proposalId)).tradingOffTokenAmount
        );
        const gp2Bonus = await this.allocationAdapterv2.getGPBonus(dao.address,
            this.gp2.address,
            (await distributeFundContract.distributions(dao.address, proposalId)).tradingOffTokenAmount
        );
        const rice_staker_Bonus = await this.allocationAdapterv2.getGPBonus(dao.address,
            this.rice_staker.address,
            (await distributeFundContract.distributions(dao.address, proposalId)).tradingOffTokenAmount
        );
        // proposerBonus
        const proposerBonus = await this.allocationAdapterv2.getProposerBonus(dao.address, distriInfo.proposer, tradingOffTokenAmount);
        //3. rice staking rewards
        // const gp1RiceStakingRewards = await this.allocationAdapter.getRiceRewards(
        //     dao.address,
        //     this.gp1.address,
        //     (await distributeFundContract.distributions(dao.address, proposalId)).tradingOffTokenAmount
        // );
        // const gp2RiceStakingRewards = await this.allocationAdapter.getRiceRewards(
        //     dao.address,
        //     this.gp2.address,
        //     (await distributeFundContract.distributions(dao.address, proposalId)).tradingOffTokenAmount
        // );
        // const riceStakingRewards = await this.allocationAdapter.getRiceRewards(
        //     dao.address,
        //     this.rice_staker.address,
        //     (await distributeFundContract.distributions(dao.address, proposalId)).tradingOffTokenAmount
        // );

        let nextStreamId = await streamingPaymentContract.nextStreamId();
        nextStreamId = parseInt(nextStreamId.toString());
        console.log("nextStreamId: ", nextStreamId);
        for (var i = 100000; i < nextStreamId; i++) {
            let streamInfo = await streamingPaymentContract.getStream(i);
            const claimableBal = await streamingPaymentContract.balanceOf(i, streamInfo.recipient);
            console.log(`recipient of stream ${i}: ${streamInfo.recipient}`);
            console.log(`claimable balance of stream ${i}: ${hre.ethers.utils.formatEther(claimableBal)}`);

            //withdraw from streaming payment
            const lps = [this.owner,
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
            for (var j = 0; j < lps.length; j++) {
                if (lps[j].address == streamInfo.recipient) {
                    await streamingPaymentContract.connect(lps[j]).withdrawFromStream(i, claimableBal);
                }
            }

        }
        // let streamInfo = await streamingPaymentContract.getStream(100000);
        // blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        // console.log(`stream 100000 stopTime ${streamInfo.stopTime}, current block time: ${blocktimestamp}`);
        // console.log(`recipient of stream 100000: ${streamInfo.recipient}`);
        // streamInfo = await streamingPaymentContract.getStream(100001);
        // console.log(`recipient of stream 100001: ${streamInfo.recipient}`);
        // streamInfo = await streamingPaymentContract.getStream(100002);
        // console.log(`recipient of stream 100002: ${streamInfo.recipient}`);
        // streamInfo = await streamingPaymentContract.getStream(100003);
        // console.log(`recipient of stream 100003: ${streamInfo.recipient}`);
        // streamInfo = await streamingPaymentContract.getStream(100004);
        // console.log(`recipient of stream 100004: ${streamInfo.recipient}`);

        //check streaming payment balance
        // const ownerfundingRewardsBal = await streamingPaymentContract.balanceOf(100000, this.owner.address);
        // const gp1fundingRewardsBal = await streamingPaymentContract.balanceOf(100001, this.gp1.address);
        // const gp2fundingRewardsBal = await streamingPaymentContract.balanceOf(100002, this.gp2.address);
        // const ownerGPBonusBal = await streamingPaymentContract.balanceOf(100003, this.owner.address);
        // const gp1GPBonusBal = await streamingPaymentContract.balanceOf(100004, this.gp1.address);
        // const gp2GPBonusBal = await streamingPaymentContract.balanceOf(100005, this.gp2.address);
        // const stakingRewardsBal = await streamingPaymentContract.balanceOf(100006, this.rice_staker.address);

        // console.log(`owner fundingRewards balance: ${hre.ethers.utils.formatEther(ownerfundingRewardsBal)}`);
        // console.log(`gp1 fundingRewards balance: ${hre.ethers.utils.formatEther(gp1fundingRewardsBal)}`);
        // console.log(`gp2 fundingRewards balance: ${hre.ethers.utils.formatEther(gp2fundingRewardsBal)}`);
        // console.log(`owner GPBonus balance: ${hre.ethers.utils.formatEther(ownerGPBonusBal)}`);
        // console.log(`gp1 GPBonus balance: ${hre.ethers.utils.formatEther(gp1GPBonusBal)}`);
        // console.log(`gp2 GPBonus balance: ${hre.ethers.utils.formatEther(gp2GPBonusBal)}`);
        // console.log(`staking Rewards balance: ${hre.ethers.utils.formatEther(stakingRewardsBal)}`);

        //withdraw from streaming payment
        // await streamingPaymentContract.connect(this.owner).withdrawFromStream(100000, ownerfundingRewardsBal);
        // await streamingPaymentContract.connect(this.gp1).withdrawFromStream(100001, gp1fundingRewardsBal);
        // await streamingPaymentContract.connect(this.gp2).withdrawFromStream(100002, gp2fundingRewardsBal);
        // await streamingPaymentContract.connect(this.owner).withdrawFromStream(100003, ownerGPBonusBal);
        // await streamingPaymentContract.connect(this.gp1).withdrawFromStream(100004, gp1GPBonusBal);
        // await streamingPaymentContract.connect(this.gp2).withdrawFromStream(100005, gp2GPBonusBal);
        // await streamingPaymentContract.connect(this.rice_staker).withdrawFromStream(100006, stakingRewardsBal);

        //check project token balance

        console.log(`project token balance for gp1: ${hre.ethers.utils.formatEther((await this.testtoken2.balanceOf(this.gp1.address)).toString())}`);
        console.log(`project token balance for gp2: ${hre.ethers.utils.formatEther((await this.testtoken2.balanceOf(this.gp2.address)).toString())}`);
        // console.log(`project token balance for rice_staker: ${hre.ethers.utils.formatEther((await this.testtoken2.balanceOf(this.rice_staker.address)).toString())}`);

    });

    it("should be impossible to un-lock project tokens if voting passed and distribution done", async () => {
        const dao = this.dao;
        const distributeFundContract = this.distributefund;
        const voteResult = await this.gpvoting.voteResult(dao.address, this.proposalId);
        console.log("vote result: ", voteResult.state);
        expect(voteResult.state).equal(2)//voting passed
        let distributeStatus = (await distributeFundContract.distributions(dao.address, this.proposalId)).status;
        console.log("distributeStatus: ", distributeStatus);
        expect(distributeStatus).equal(4)//distribution done
        const projectTeamLockedTokenAmount = await distributeFundContract.projectTeamLockedTokens(dao.address, this.proposalId, this.project_team1.address);
        console.log(`projectTeamLockedTokenAmount: ${hre.ethers.utils.formatEther(projectTeamLockedTokenAmount)}`);
        await this.testtoken2.transfer(distributeFundContract.address, projectTeamLockedTokenAmount);
        await expectRevert(distributeFundContract.unLockProjectTeamToken(dao.address, this.proposalId), "revert");
    });

    it("should be impossible to distribute funds to project team if total funds smaller than requrested funds", async () => {
        const project_team2 = this.project_team2.address;
        const dao = this.dao;
        const fundingpoolAdapter = this.fundingpoolAdapter;
        const riceStakingAdapter = this.riceStakingAdapter;
        const fundingPoolExt = this.fundingPoolExt;
        const riceStakingExt = this.riceStakingExt;
        const gpdaoExt = this.gpdaoExt;
        const distributeFundContract = this.distributefund;
        const streamingPaymentContract = this.streamingPayment;
        //gp deposit funds
        await this.testtoken1.connect(this.owner).transfer(this.gp1.address, hre.ethers.utils.parseEther("2000"));
        await this.testtoken1.connect(this.owner).transfer(this.gp2.address, hre.ethers.utils.parseEther("2000"));
        console.log("gp1 tt1 bal: ", hre.ethers.utils.formatEther(await this.testtoken1.balanceOf(this.gp1.address)));
        console.log("gp2 tt1 bal:", hre.ethers.utils.formatEther(await this.testtoken1.balanceOf(this.gp2.address)));

        await depositToFundingPool(this.fundingpoolAdapter, dao, this.gp1, hre.ethers.utils.parseEther("2000"), this.testtoken1);
        await depositToFundingPool(this.fundingpoolAdapter, dao, this.gp2, hre.ethers.utils.parseEther("2000"), this.testtoken1);

        console.log(`gp1 balance in funding pool: ${hre.ethers.utils.formatEther(
            (await fundingpoolAdapter.balanceOf(dao.address, this.gp1.address)).toString()
        )
            }`);
        console.log(`gp2 balance in funding pool: ${hre.ethers.utils.formatEther((await fundingpoolAdapter.balanceOf(dao.address, this.gp2.address)).toString())
            }`);

        // expect((await gpdaoExt.isGeneralPartner(this.gp1.address))[0]).equal(true);
        // expect((await gpdaoExt.isGeneralPartner(this.gp2.address))[0]).equal(true);

        // Submit distribute proposal
        const totalFund = await fundingPoolExt.totalSupply();
        console.log(`totalFund: ${hre.ethers.utils.formatEther(totalFund.toString())}`);

        const requestedFundAmount = toBN(totalFund.toString()).add(toBN("1"));
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const lockupDate = blocktimestamp + 24;
        console.log(`lockupDate: ${lockupDate}`);
        const fullyReleasedDate = lockupDate + 1000;
        const projectTeamAddr = this.project_team2.address;
        const projectTeamTokenAddr = this.testtoken2.address;

        await this.testtoken2.transfer(this.project_team2.address, tradingOffTokenAmount);
        console.log(`project token balance of project_team2:  ${hre.ethers.utils.formatEther(await this.testtoken2.balanceOf(this.project_team2.address))}`);
        await this.testtoken2.connect(this.project_team2).approve(distributeFundContract.address, tradingOffTokenAmount);
        console.log(`project token allowance of distributeFundContract : ${hre.ethers.utils.formatEther(await this.testtoken2.allowance(this.project_team2.address, distributeFundContract.address))}`);

        let { proposalId } = await distributeFundsProposal(
            dao,
            distributeFundContract,
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


        let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        console.log(`distributions status: ${distriInfo.status}`);
        console.log(`distriInfo -> proposalStartVotingTimestamp:  ${distriInfo.proposalStartVotingTimestamp}`);
        console.log(`distriInfo -> proposalStopVotingTimestamp:  ${distriInfo.proposalStopVotingTimestamp}`);
        console.log(`current blcok timestamp ->: ${(await hre.ethers.provider.getBlock("latest")).timestamp}`);


        //start fill funds process
        // await distributeFundContract.startFillFundsProcess(dao.address, this.proposalId);
        // distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        // console.log(`proposal state: ${distriInfo.status}`);
        // let currentProposalId = await distributeFundContract.ongoingDistributions(dao.address);
        // console.log(`current proposalId: ${hre.ethers.utils.toUtf8String(currentProposalId)}`);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStartVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        // console.log(`snap funds: ${hre.ethers.utils.formatEther((await fundingPoolExt.snapFunds()).toString())}`);

        const lpBal = await fundingpoolAdapter.lpBalance(dao.address);
        console.log(`lp balance: ${hre.ethers.utils.formatEther(lpBal)}`);

        //start Voting Process
        await distributeFundContract.startVotingProcess(dao.address, proposalId);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStopVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        await distributeFundContract.processProposal(dao.address, proposalId);
        distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        console.log(`distributions status: ${distriInfo.status}`);
        expect(distriInfo.status).equal(5);// failed


    });

    it("should be possible to un-lock project tokens if voting failed or tie", async () => {
        const dao = this.dao;
        const distributeFundContract = this.distributefund;
        const fundingpoolAdapter = this.fundingpoolAdapter;

        //submite distribute proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("1000");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const lockupDate = blocktimestamp + 24;
        const fullyReleasedDate = lockupDate + 1000;
        const projectTeamAddr = this.project_team3.address;
        const projectTeamTokenAddr = this.testtoken2.address;

        await this.testtoken2.transfer(projectTeamAddr, tradingOffTokenAmount);
        await this.testtoken2.connect(this.project_team3).approve(this.distributefund.address, tradingOffTokenAmount);
        console.log(`project team project token amount: ${hre.ethers.utils.formatEther(await this.testtoken2.balanceOf(projectTeamAddr))}`);

        let { proposalId } = await distributeFundsProposal(
            dao,
            this.distributefund,
            requestedFundAmount,
            tradingOffTokenAmount,
            fullyReleasedDate,
            lockupDate,
            projectTeamAddr,
            projectTeamTokenAddr,
            this.owner
        );
        console.log(`new proposalID ${hre.ethers.utils.toUtf8String(proposalId)}`);

        let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStartVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        //start Voting Process
        await distributeFundContract.startVotingProcess(dao.address, proposalId);
        distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        console.log("Distribution Status: ", distriInfo.status);


        const balGP1 = await fundingpoolAdapter.balanceOf(dao.address, this.gp1.address);
        console.log(`gp1 deposited bal: ${hre.ethers.utils.formatEther(balGP1.toString())}`);
        await this.gpvoting.connect(this.gp1).submitVote(dao.address, proposalId, 2);

        let projectTeamLockedTokenAmount = await distributeFundContract.projectTeamLockedTokens(dao.address, proposalId, projectTeamAddr);
        console.log(`projectTeamLockedTokenAmount: ${hre.ethers.utils.formatEther(projectTeamLockedTokenAmount)}`);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStopVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        await distributeFundContract.processProposal(dao.address, proposalId);
        const voteResults = await this.gpvoting.voteResult(dao.address, proposalId);
        console.log(`voteResults: ${voteResults}`);

        distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        console.log("Distribution Status: ", distriInfo.status);

        await distributeFundContract.connect(this.project_team3).unLockProjectTeamToken(dao.address, proposalId);

        projectTeamLockedTokenAmount = await distributeFundContract.projectTeamLockedTokens(dao.address, proposalId, projectTeamAddr);
        console.log(`projectTeamLockedTokenAmount: ${hre.ethers.utils.formatEther(projectTeamLockedTokenAmount)}`);

        const projectTeamProjectTokenBal = await this.testtoken2.balanceOf(projectTeamAddr);
        console.log(`projectTeam ProjectToken Bal: ${hre.ethers.utils.formatEther(projectTeamProjectTokenBal)}`);
        expect(projectTeamProjectTokenBal).equal(tradingOffTokenAmount)
    });

    it("should be impossible to distribute funds to project team if trading off token not enough", async () => {
        const project_team2 = this.project_team2.address;
        const dao = this.dao;
        const fundingpoolAdapter = this.fundingpoolAdapter;
        const riceStakingAdapter = this.riceStakingAdapter;
        const fundingPoolExt = this.fundingPoolExt;
        const riceStakingExt = this.riceStakingExt;
        const gpdaoExt = this.gpdaoExt;
        const distributeFundContract = this.distributefund;
        const streamingPaymentContract = this.streamingPayment;
        //gp deposit funds
        await this.testtoken1.connect(this.owner).transfer(this.gp1.address, hre.ethers.utils.parseEther("2000"));
        await this.testtoken1.connect(this.owner).transfer(this.gp2.address, hre.ethers.utils.parseEther("2000"));
        console.log("gp1 USDT bal: ", hre.ethers.utils.formatEther(await this.testtoken1.balanceOf(this.gp1.address)));
        console.log("gp2 USDT bal:", hre.ethers.utils.formatEther(await this.testtoken1.balanceOf(this.gp2.address)));

        console.log(`gp1 balance in funding pool: ${hre.ethers.utils.formatEther(
            (await fundingpoolAdapter.balanceOf(dao.address, this.gp1.address)).toString()
        )
            }`);
        console.log(`gp2 balance in funding pool: ${hre.ethers.utils.formatEther((await fundingpoolAdapter.balanceOf(dao.address, this.gp2.address)).toString())
            }`);

        // Submit distribute proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("6000");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const lockupDate = blocktimestamp + 24;
        console.log(`lockupDate: ${lockupDate}`);
        const fullyReleasedDate = lockupDate + 1000;
        const projectTeamAddr = this.project_team2.address;
        const projectTeamTokenAddr = this.testtoken2.address;

        await this.testtoken2.transfer(this.project_team2.address, tradingOffTokenAmount);
        console.log(`project token balance of project_team2:  ${hre.ethers.utils.formatEther(await this.testtoken2.balanceOf(this.project_team2.address))}`);
        await this.testtoken2.connect(this.project_team2).approve(distributeFundContract.address, hre.ethers.utils.parseEther("4000"));
        console.log(`project token allowance of distributeFundContract : ${hre.ethers.utils.formatEther(await this.testtoken2.allowance(this.project_team2.address, distributeFundContract.address))}`);

        let { proposalId } = await distributeFundsProposal(
            dao,
            distributeFundContract,
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


        let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        console.log(`distributions status: ${distriInfo.status}`);
        console.log(`distriInfo -> proposalStartVotingTimestamp:  ${distriInfo.proposalStartVotingTimestamp}`);
        console.log(`distriInfo -> proposalStopVotingTimestamp:  ${distriInfo.proposalStopVotingTimestamp}`);
        console.log(`current blcok timestamp ->: ${(await hre.ethers.provider.getBlock("latest")).timestamp}`);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStartVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        const lpBal = await fundingpoolAdapter.lpBalance(dao.address);
        console.log(`lp balance: ${hre.ethers.utils.formatEther(lpBal)}`);
        //start Voting Process
        await distributeFundContract.startVotingProcess(dao.address, proposalId);

        distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        console.log(`distributions status: ${distriInfo.status}`);
        expect(distriInfo.status).equal(5);// failed


    });
});


describe("Voting for distribute proposal", () => {
    before("deploy dao", async () => {
        let [owner, user1, user2, investor1, investor2, gp1, gp2, gp3, gp4, gp5, gp6, project_team1, project_team2, project_team3, rice_staker] = await hre.ethers.getSigners();
        this.owner = owner;
        this.user1 = user1;
        this.user2 = user2;
        this.investor1 = investor1;
        this.investor2 = investor2;
        this.gp1 = gp1;
        this.gp2 = gp2;
        this.gp3 = gp3;
        this.gp4 = gp4;
        this.gp5 = gp5;
        this.gp6 = gp6;
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
        this.riceStakingExt = this.extensions.ricestakingExt.functions;
        //adapters
        this.streamingPayment = this.adapters.sablierAdapter.instance;
        // this.manageMember = this.adapters.manageMemberAdapter.instance;
        this.allocationAdapter = this.adapters.allocation.instance;
        this.allocationAdapterv2 = this.adapters.allocationv2.instance;
        this.gpvoting = this.adapters.gpVotingAdapter.instance;
        this.distributefund = this.adapters.distributeFundAdapterv2.instance;
        this.fundingpoolAdapter = this.adapters.fundingpoolAdapter.instance;
        this.gpdaoAdapter = this.adapters.gpdaoAdapter.instance;
        this.stakingRiceAdapter = this.adapters.ricestakingAdapter.instance;
        this.gpDaoOnboardingAdapter = this.adapters.gpDaoOnboardingAdapter.instance;
        this.gpOnboardVotingAdapter = this.adapters.gpOnboardVotingAdapter.instance;
        this.snapshotId = await takeChainSnapshot();

        await this.testtoken1.transfer(investor1.address, hre.ethers.utils.parseEther("1000"));
        await this.testtoken1.transfer(investor2.address, hre.ethers.utils.parseEther("1000"));

        await this.testtoken1.transfer(gp1.address, hre.ethers.utils.parseEther("20000"));
        await this.testtoken1.transfer(gp2.address, hre.ethers.utils.parseEther("20000"));
        await this.testtoken1.transfer(gp3.address, hre.ethers.utils.parseEther("20000"));
        await this.testtoken1.transfer(gp4.address, hre.ethers.utils.parseEther("20000"));
        await this.testtoken1.transfer(gp5.address, hre.ethers.utils.parseEther("20000"));
        await this.testtoken1.transfer(gp6.address, hre.ethers.utils.parseEther("20000"));

        console.log(`investor1 testtoken1 balance: ${await this.testtoken1.balanceOf(investor1.address)}`);
        console.log(`investor2 testtoken1 balance: ${await this.testtoken1.balanceOf(investor2.address)}`);
        console.log(`gp1 testtoken1 balance: ${await this.testtoken1.balanceOf(gp1.address)}`);
        console.log(`gp2 testtoken1 balance: ${await this.testtoken1.balanceOf(gp2.address)}`);

        await this.testRiceToken.transfer(rice_staker.address, hre.ethers.utils.parseEther("20000"));
        console.log(`rice_staker rice balance: ${await this.testRiceToken.balanceOf(rice_staker.address)}`);

        console.log("dao member 1 addr: ", (await dao.getMemberAddress(0)));
        console.log("dao member 2 addr: ", (await dao.getMemberAddress(1)));

        //gp deposit funds
        await depositToFundingPool(this.fundingpoolAdapter, dao, this.gp1, hre.ethers.utils.parseEther("20000"), this.testtoken1);
        await depositToFundingPool(this.fundingpoolAdapter, dao, this.gp2, hre.ethers.utils.parseEther("20000"), this.testtoken1);
        await depositToFundingPool(this.fundingpoolAdapter, dao, this.gp3, hre.ethers.utils.parseEther("20000"), this.testtoken1);
        await depositToFundingPool(this.fundingpoolAdapter, dao, this.gp4, hre.ethers.utils.parseEther("20000"), this.testtoken1);
        await depositToFundingPool(this.fundingpoolAdapter, dao, this.gp5, hre.ethers.utils.parseEther("20000"), this.testtoken1);
        await depositToFundingPool(this.fundingpoolAdapter, dao, this.gp6, hre.ethers.utils.parseEther("20000"), this.testtoken1);

        //add new GP
        await addNewGP(this.gp1.address, this.gpDaoOnboardingAdapter, this.gpOnboardVotingAdapter, dao, this.gpdaoExt, [this.gp1, this.gp2, this.gp3, this.gp4, this.gp5, this.gp6]);
        await addNewGP(this.gp2.address, this.gpDaoOnboardingAdapter, this.gpOnboardVotingAdapter, dao, this.gpdaoExt, [this.gp1, this.gp2, this.gp3, this.gp4, this.gp5, this.gp6]);
        await addNewGP(this.gp3.address, this.gpDaoOnboardingAdapter, this.gpOnboardVotingAdapter, dao, this.gpdaoExt, [this.gp1, this.gp2, this.gp3, this.gp4, this.gp5, this.gp6]);
        await addNewGP(this.gp4.address, this.gpDaoOnboardingAdapter, this.gpOnboardVotingAdapter, dao, this.gpdaoExt, [this.gp1, this.gp2, this.gp3, this.gp4, this.gp5, this.gp6]);
        await addNewGP(this.gp5.address, this.gpDaoOnboardingAdapter, this.gpOnboardVotingAdapter, dao, this.gpdaoExt, [this.gp1, this.gp2, this.gp3, this.gp4, this.gp5, this.gp6]);
        await addNewGP(this.gp6.address, this.gpDaoOnboardingAdapter, this.gpOnboardVotingAdapter, dao, this.gpdaoExt, [this.gp1, this.gp2, this.gp3, this.gp4, this.gp5, this.gp6]);


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
        console.log(`FUND_RAISING_WINDOW_BEGIN: ${(await dao.getConfiguration(sha3("FUND_RAISING_WINDOW_BEGIN")))}`);
        console.log(`FUND_RAISING_WINDOW_END: ${(await dao.getConfiguration(sha3("FUND_RAISING_WINDOW_END")))}`);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        console.log(`current blocktimestamp: ${blocktimestamp}`);

        await token.connect(investor).approve(fundingpoolAdapter.address, amount);
        await fundingpoolAdapter.connect(investor).deposit(dao.address, amount);

        console.log(`deposited balace ${hre.ethers.utils.formatEther((await fundingpoolAdapter.balanceOf(dao.address, investor.address)).toString())}`);
    };


    // const stakingRice = async (stakingRiceAdapter,
    //     dao,
    //     investor,
    //     amount,
    //     token) => {
    //     await token.connect(investor).approve(stakingRiceAdapter.address, amount);
    //     await stakingRiceAdapter.connect(investor).deposit(dao.address, amount);
    // }

    const distributeFundsProposal = async (
        dao,
        distributeFundContract,
        requestedFundAmount,
        tradingOffTokenAmount,
        fullyReleasedDate,
        lockupDate,
        projectTeamAddr,
        projectTokenAddr,
        sender
    ) => {
        const tx = await distributeFundContract.connect(sender).submitProposal(
            dao.address,
            [projectTeamAddr, projectTokenAddr],
            [requestedFundAmount, tradingOffTokenAmount, fullyReleasedDate, lockupDate]
        );
        const result = await tx.wait();
        const newProposalId = result.events[2].args.proposalId;
        return { proposalId: newProposalId };
    };

    // it("Vote in SIMPLE_MAJORITY model", async () => {
    //     const project_team1 = this.project_team1.address;
    //     const dao = this.dao;
    //     const fundingpoolAdapter = this.fundingpoolAdapter;
    //     const riceStakingAdapter = this.riceStakingAdapter;
    //     const fundingPoolExt = this.fundingPoolExt;
    //     const riceStakingExt = this.riceStakingExt;
    //     const gpdaoExt = this.gpdaoExt;
    //     const distributeFundContract = this.distributefund;
    //     const streamingPaymentContract = this.streamingPayment;
    //     //gp deposit funds
    //     await depositToFundingPool(this.fundingpoolAdapter, dao, this.gp1, hre.ethers.utils.parseEther("20000"), this.testtoken1);
    //     await depositToFundingPool(this.fundingpoolAdapter, dao, this.gp2, hre.ethers.utils.parseEther("20000"), this.testtoken1);
    //     await depositToFundingPool(this.fundingpoolAdapter, dao, this.gp3, hre.ethers.utils.parseEther("20000"), this.testtoken1);
    //     await depositToFundingPool(this.fundingpoolAdapter, dao, this.gp4, hre.ethers.utils.parseEther("20000"), this.testtoken1);
    //     await depositToFundingPool(this.fundingpoolAdapter, dao, this.gp5, hre.ethers.utils.parseEther("20000"), this.testtoken1);
    //     await depositToFundingPool(this.fundingpoolAdapter, dao, this.gp6, hre.ethers.utils.parseEther("20000"), this.testtoken1);
    //     //staking rice
    //     await stakingRice(this.stakingRiceAdapter, dao, this.rice_staker, hre.ethers.utils.parseEther("20000"), this.testRiceToken);

    //     // Submit distribute proposal
    //     const requestedFundAmount = hre.ethers.utils.parseEther("38000");
    //     const tradingOffTokenAmount = hre.ethers.utils.parseEther("50000");
    //     let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
    //     const lockupDate = blocktimestamp + 24;
    //     const fullyReleasedDate = lockupDate + 1000;
    //     const projectTeamAddr = this.project_team1.address;
    //     const projectTeamTokenAddr = this.testtoken2.address;

    //     await this.testtoken2.transfer(this.project_team1.address, tradingOffTokenAmount);
    //     await this.testtoken2.connect(this.project_team1).approve(distributeFundContract.address, tradingOffTokenAmount);

    //     let { proposalId } = await distributeFundsProposal(
    //         dao,
    //         distributeFundContract,
    //         requestedFundAmount,
    //         tradingOffTokenAmount,
    //         fullyReleasedDate,
    //         lockupDate,
    //         projectTeamAddr,
    //         projectTeamTokenAddr,
    //         this.owner
    //     );
    //     console.log(`new proposalID ${hre.ethers.utils.toUtf8String(proposalId)}`);

    //     this.proposalId = proposalId;

    //     let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);

    //     //start fill funds process
    //     await distributeFundContract.startFillFundsProcess(dao.address, this.proposalId);
    //     distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
    //     console.log(`proposal state: ${distriInfo.status}`);
    //     let currentProposalId = await distributeFundContract.ongoingDistributions(dao.address);
    //     console.log(`current proposalId: ${hre.ethers.utils.toUtf8String(currentProposalId)}`);

    //     await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStartVotingTimestamp) + 1])
    //     await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

    //     //start Voting Process
    //     await distributeFundContract.startVotingProcess(dao.address, this.proposalId);
    //     const voteInfo = await this.gpvoting.votes(dao.address, this.proposalId);
    //     console.log(`start voting time of proposal ${this.proposalId} : ${voteInfo.startingTime}`);

    //     let projectTeamLockedTokenAmount = await distributeFundContract.projectTeamLockedTokens(dao.address, proposalId, projectTeamAddr);

    //     // gp1 Vote YES on the proposal
    //     await this.gpvoting.connect(this.gp1).submitVote(dao.address, proposalId, 1);
    //     // gp2 Vote YES on the proposal
    //     await this.gpvoting.connect(this.gp2).submitVote(dao.address, proposalId, 1);
    //     // gp3 Vote YES on the proposal
    //     await this.gpvoting.connect(this.gp3).submitVote(dao.address, proposalId, 1);
    //     // gp4 Vote YES on the proposal
    //     await this.gpvoting.connect(this.gp4).submitVote(dao.address, proposalId, 1);
    //     // gp5 Vote NO on the proposal
    //     await this.gpvoting.connect(this.gp5).submitVote(dao.address, proposalId, 2);
    //     // gp6 Vote NO on the proposal
    //     await this.gpvoting.connect(this.gp6).submitVote(dao.address, proposalId, 2);
    //     //get gp voting result
    //     let voteResults = await this.gpvoting.voteResult(dao.address, proposalId);
    //     await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStopVotingTimestamp) + 1])
    //     await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

    //     // Starts to process the proposal
    //     await distributeFundContract.processProposal(dao.address, this.proposalId);
    //     let distirbuteStatus = (await distributeFundContract.distributions(dao.address, proposalId)).status;
    //     console.log(`distributions status: ${distirbuteStatus}`);
    //     voteResults = await this.gpvoting.voteResult(dao.address, proposalId);
    //     console.log(`voteResults: ${voteResults.state}`);
    //     expect(voteResults.state).equal(2);
    //     expect(distirbuteStatus).equal(4);
    // });

    // it("Vote in SIMPLE_MAJORITY_QUORUM_REQUIRED model - voters less than quorum", async () => {
    //     const project_team1 = this.project_team1.address;
    //     const dao = this.dao;
    //     const fundingpoolAdapter = this.fundingpoolAdapter;
    //     const riceStakingAdapter = this.riceStakingAdapter;
    //     const fundingPoolExt = this.fundingPoolExt;
    //     const riceStakingExt = this.riceStakingExt;
    //     const gpdaoExt = this.gpdaoExt;
    //     const distributeFundContract = this.distributefund;
    //     const streamingPaymentContract = this.streamingPayment;

    //     // Submit distribute proposal
    //     const requestedFundAmount = hre.ethers.utils.parseEther("3800");
    //     const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
    //     let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
    //     const lockupDate = blocktimestamp + 24;
    //     const fullyReleasedDate = lockupDate + 1000;
    //     const projectTeamAddr = this.project_team1.address;
    //     const projectTeamTokenAddr = this.testtoken2.address;

    //     await this.testtoken2.transfer(this.project_team1.address, tradingOffTokenAmount);
    //     await this.testtoken2.connect(this.project_team1).approve(distributeFundContract.address, tradingOffTokenAmount);

    //     let { proposalId } = await distributeFundsProposal(
    //         dao,
    //         distributeFundContract,
    //         requestedFundAmount,
    //         tradingOffTokenAmount,
    //         fullyReleasedDate,
    //         lockupDate,
    //         projectTeamAddr,
    //         projectTeamTokenAddr,
    //         this.owner
    //     );
    //     console.log(`new proposalID ${hre.ethers.utils.toUtf8String(proposalId)}`);

    //     this.proposalId = proposalId;

    //     let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);

    //     //start fill funds process
    //     await distributeFundContract.startFillFundsProcess(dao.address, this.proposalId);
    //     distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
    //     console.log(`proposal state: ${distriInfo.status}`);
    //     let currentProposalId = await distributeFundContract.ongoingDistributions(dao.address);
    //     console.log(`current proposalId: ${hre.ethers.utils.toUtf8String(currentProposalId)}`);

    //     await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStartVotingTimestamp) + 1])
    //     await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

    //     //start Voting Process
    //     await distributeFundContract.startVotingProcess(dao.address, this.proposalId);
    //     const voteInfo = await this.gpvoting.votes(dao.address, this.proposalId);
    //     console.log(`start voting time of proposal ${this.proposalId} : ${voteInfo.startingTime}`);

    //     let projectTeamLockedTokenAmount = await distributeFundContract.projectTeamLockedTokens(dao.address, proposalId, projectTeamAddr);

    //     // gp1 Vote YES on the proposal
    //     await this.gpvoting.connect(this.gp1).submitVote(dao.address, proposalId, 1);
    //     // gp2 Vote YES on the proposal
    //     await this.gpvoting.connect(this.gp2).submitVote(dao.address, proposalId, 1);

    //     //get gp voting result
    //     let voteResults = await this.gpvoting.voteResult(dao.address, proposalId);
    //     await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStopVotingTimestamp) + 1])
    //     await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

    //     // Starts to process the proposal
    //     await distributeFundContract.processProposal(dao.address, this.proposalId);
    //     let distirbuteStatus = (await distributeFundContract.distributions(dao.address, proposalId)).status;
    //     console.log(`distributions status: ${distirbuteStatus}`);
    //     voteResults = await this.gpvoting.voteResult(dao.address, proposalId);
    //     console.log(`voteResults: ${voteResults.state}`);
    //     expect(voteResults.state).equal(3);
    //     expect(distirbuteStatus).equal(5);
    // });

    // it("Vote in SIMPLE_MAJORITY_QUORUM_REQUIRED model - voters greater than quorum", async () => {
    //     const project_team1 = this.project_team1.address;
    //     const dao = this.dao;
    //     const fundingpoolAdapter = this.fundingpoolAdapter;
    //     const riceStakingAdapter = this.riceStakingAdapter;
    //     const fundingPoolExt = this.fundingPoolExt;
    //     const riceStakingExt = this.riceStakingExt;
    //     const gpdaoExt = this.gpdaoExt;
    //     const distributeFundContract = this.distributefund;
    //     const streamingPaymentContract = this.streamingPayment;

    //     // Submit distribute proposal
    //     const requestedFundAmount = hre.ethers.utils.parseEther("3800");
    //     const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
    //     let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
    //     const lockupDate = blocktimestamp + 24;
    //     const fullyReleasedDate = lockupDate + 1000;
    //     const projectTeamAddr = this.project_team1.address;
    //     const projectTeamTokenAddr = this.testtoken2.address;

    //     await this.testtoken2.transfer(this.project_team1.address, tradingOffTokenAmount);
    //     await this.testtoken2.connect(this.project_team1).approve(distributeFundContract.address, tradingOffTokenAmount);

    //     let { proposalId } = await distributeFundsProposal(
    //         dao,
    //         distributeFundContract,
    //         requestedFundAmount,
    //         tradingOffTokenAmount,
    //         fullyReleasedDate,
    //         lockupDate,
    //         projectTeamAddr,
    //         projectTeamTokenAddr,
    //         this.owner
    //     );
    //     console.log(`new proposalID ${hre.ethers.utils.toUtf8String(proposalId)}`);

    //     this.proposalId = proposalId;

    //     let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);

    //     //start fill funds process
    //     await distributeFundContract.startFillFundsProcess(dao.address, this.proposalId);
    //     distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
    //     console.log(`proposal state: ${distriInfo.status}`);
    //     let currentProposalId = await distributeFundContract.ongoingDistributions(dao.address);
    //     console.log(`current proposalId: ${hre.ethers.utils.toUtf8String(currentProposalId)}`);

    //     await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStartVotingTimestamp) + 1])
    //     await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

    //     //start Voting Process
    //     await distributeFundContract.startVotingProcess(dao.address, this.proposalId);
    //     const voteInfo = await this.gpvoting.votes(dao.address, this.proposalId);
    //     console.log(`start voting time of proposal ${this.proposalId} : ${voteInfo.startingTime}`);

    //     let projectTeamLockedTokenAmount = await distributeFundContract.projectTeamLockedTokens(dao.address, proposalId, projectTeamAddr);

    //     // gp1 Vote YES on the proposal
    //     await this.gpvoting.connect(this.gp1).submitVote(dao.address, proposalId, 1);
    //     // gp2 Vote YES on the proposal
    //     await this.gpvoting.connect(this.gp2).submitVote(dao.address, proposalId, 1);
    //     // gp3 Vote YES on the proposal
    //     await this.gpvoting.connect(this.gp3).submitVote(dao.address, proposalId, 1);
    //     // gp4 Vote YES on the proposal
    //     await this.gpvoting.connect(this.gp4).submitVote(dao.address, proposalId, 1);
    //     // gp5 Vote NO on the proposal
    //     await this.gpvoting.connect(this.gp5).submitVote(dao.address, proposalId, 2);
    //     // gp6 Vote NO on the proposal
    //     await this.gpvoting.connect(this.gp6).submitVote(dao.address, proposalId, 2);
    //     //get gp voting result
    //     let voteResults = await this.gpvoting.voteResult(dao.address, proposalId);
    //     await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStopVotingTimestamp) + 1])
    //     await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

    //     // Starts to process the proposal
    //     await distributeFundContract.processProposal(dao.address, this.proposalId);
    //     let distirbuteStatus = (await distributeFundContract.distributions(dao.address, proposalId)).status;
    //     console.log(`distributions status: ${distirbuteStatus}`);
    //     voteResults = await this.gpvoting.voteResult(dao.address, proposalId);
    //     console.log(`voteResults: ${voteResults.state}`);
    //     expect(voteResults.state).equal(2);
    //     expect(distirbuteStatus).equal(4);
    // });

    // it("Vote in SUPERMAJORITY model - yes votes less than supermajority", async () => {
    //     const project_team1 = this.project_team1.address;
    //     const dao = this.dao;
    //     const fundingpoolAdapter = this.fundingpoolAdapter;
    //     const riceStakingAdapter = this.riceStakingAdapter;
    //     const fundingPoolExt = this.fundingPoolExt;
    //     const riceStakingExt = this.riceStakingExt;
    //     const gpdaoExt = this.gpdaoExt;
    //     const distributeFundContract = this.distributefund;
    //     const streamingPaymentContract = this.streamingPayment;

    //     // Submit distribute proposal
    //     const requestedFundAmount = hre.ethers.utils.parseEther("3800");
    //     const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
    //     let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
    //     const lockupDate = blocktimestamp + 24;
    //     const fullyReleasedDate = lockupDate + 1000;
    //     const projectTeamAddr = this.project_team1.address;
    //     const projectTeamTokenAddr = this.testtoken2.address;

    //     await this.testtoken2.transfer(this.project_team1.address, tradingOffTokenAmount);
    //     await this.testtoken2.connect(this.project_team1).approve(distributeFundContract.address, tradingOffTokenAmount);

    //     let { proposalId } = await distributeFundsProposal(
    //         dao,
    //         distributeFundContract,
    //         requestedFundAmount,
    //         tradingOffTokenAmount,
    //         fullyReleasedDate,
    //         lockupDate,
    //         projectTeamAddr,
    //         projectTeamTokenAddr,
    //         this.owner
    //     );
    //     console.log(`new proposalID ${hre.ethers.utils.toUtf8String(proposalId)}`);

    //     this.proposalId = proposalId;

    //     let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);

    //     //start fill funds process
    //     await distributeFundContract.startFillFundsProcess(dao.address, this.proposalId);
    //     distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
    //     console.log(`proposal state: ${distriInfo.status}`);
    //     let currentProposalId = await distributeFundContract.ongoingDistributions(dao.address);
    //     console.log(`current proposalId: ${hre.ethers.utils.toUtf8String(currentProposalId)}`);

    //     await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStartVotingTimestamp) + 1])
    //     await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

    //     //start Voting Process
    //     await distributeFundContract.startVotingProcess(dao.address, this.proposalId);
    //     const voteInfo = await this.gpvoting.votes(dao.address, this.proposalId);
    //     console.log(`start voting time of proposal ${this.proposalId} : ${voteInfo.startingTime}`);

    //     let projectTeamLockedTokenAmount = await distributeFundContract.projectTeamLockedTokens(dao.address, proposalId, projectTeamAddr);

    //     // gp1 Vote YES on the proposal
    //     await this.gpvoting.connect(this.gp1).submitVote(dao.address, proposalId, 1);
    //     // gp2 Vote YES on the proposal
    //     await this.gpvoting.connect(this.gp2).submitVote(dao.address, proposalId, 1);
    //     // gp3 Vote YES on the proposal
    //     await this.gpvoting.connect(this.gp3).submitVote(dao.address, proposalId, 1);
    //     // gp4 Vote YES on the proposal
    //     await this.gpvoting.connect(this.gp4).submitVote(dao.address, proposalId, 2);
    //     // gp5 Vote NO on the proposal
    //     await this.gpvoting.connect(this.gp5).submitVote(dao.address, proposalId, 2);
    //     // gp6 Vote NO on the proposal
    //     await this.gpvoting.connect(this.gp6).submitVote(dao.address, proposalId, 2);
    //     //get gp voting result
    //     let voteResults = await this.gpvoting.voteResult(dao.address, proposalId);
    //     await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStopVotingTimestamp) + 1])
    //     await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

    //     // Starts to process the proposal
    //     await distributeFundContract.processProposal(dao.address, this.proposalId);
    //     let distirbuteStatus = (await distributeFundContract.distributions(dao.address, proposalId)).status;
    //     console.log(`distributions status: ${distirbuteStatus}`);
    //     voteResults = await this.gpvoting.voteResult(dao.address, proposalId);
    //     console.log(`voteResults: ${voteResults}`);
    //     expect(voteResults.state).equal(3);
    //     expect(distirbuteStatus).equal(5);
    // });

    // it("Vote in SUPERMAJORITY model - yes votes greater than supermajority", async () => {
    //     const project_team1 = this.project_team1.address;
    //     const dao = this.dao;
    //     const fundingpoolAdapter = this.fundingpoolAdapter;
    //     const riceStakingAdapter = this.riceStakingAdapter;
    //     const fundingPoolExt = this.fundingPoolExt;
    //     const riceStakingExt = this.riceStakingExt;
    //     const gpdaoExt = this.gpdaoExt;
    //     const distributeFundContract = this.distributefund;
    //     const streamingPaymentContract = this.streamingPayment;

    //     // Submit distribute proposal
    //     const requestedFundAmount = hre.ethers.utils.parseEther("3800");
    //     const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
    //     let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
    //     const lockupDate = blocktimestamp + 24;
    //     const fullyReleasedDate = lockupDate + 1000;
    //     const projectTeamAddr = this.project_team1.address;
    //     const projectTeamTokenAddr = this.testtoken2.address;

    //     await this.testtoken2.transfer(this.project_team1.address, tradingOffTokenAmount);
    //     await this.testtoken2.connect(this.project_team1).approve(distributeFundContract.address, tradingOffTokenAmount);

    //     let { proposalId } = await distributeFundsProposal(
    //         dao,
    //         distributeFundContract,
    //         requestedFundAmount,
    //         tradingOffTokenAmount,
    //         fullyReleasedDate,
    //         lockupDate,
    //         projectTeamAddr,
    //         projectTeamTokenAddr,
    //         this.owner
    //     );
    //     console.log(`new proposalID ${hre.ethers.utils.toUtf8String(proposalId)}`);

    //     this.proposalId = proposalId;

    //     let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
    //     //start fill funds process
    //     await distributeFundContract.startFillFundsProcess(dao.address, this.proposalId);
    //     distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
    //     console.log(`proposal state: ${distriInfo.status}`);
    //     let currentProposalId = await distributeFundContract.ongoingDistributions(dao.address);
    //     console.log(`current proposalId: ${hre.ethers.utils.toUtf8String(currentProposalId)}`);

    //     await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStartVotingTimestamp) + 1])
    //     await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

    //     //start Voting Process
    //     await distributeFundContract.startVotingProcess(dao.address, this.proposalId);
    //     const voteInfo = await this.gpvoting.votes(dao.address, this.proposalId);
    //     console.log(`start voting time of proposal ${this.proposalId} : ${voteInfo.startingTime}`);

    //     let projectTeamLockedTokenAmount = await distributeFundContract.projectTeamLockedTokens(dao.address, proposalId, projectTeamAddr);

    //     // gp1 Vote YES on the proposal
    //     await this.gpvoting.connect(this.gp1).submitVote(dao.address, proposalId, 1);
    //     // gp2 Vote YES on the proposal
    //     await this.gpvoting.connect(this.gp2).submitVote(dao.address, proposalId, 1);
    //     // gp3 Vote YES on the proposal
    //     await this.gpvoting.connect(this.gp3).submitVote(dao.address, proposalId, 1);
    //     // gp4 Vote YES on the proposal
    //     await this.gpvoting.connect(this.gp4).submitVote(dao.address, proposalId, 1);
    //     // gp5 Vote NO on the proposal
    //     await this.gpvoting.connect(this.gp5).submitVote(dao.address, proposalId, 2);
    //     // gp6 Vote NO on the proposal
    //     await this.gpvoting.connect(this.gp6).submitVote(dao.address, proposalId, 2);
    //     //get gp voting result
    //     let voteResults = await this.gpvoting.voteResult(dao.address, proposalId);
    //     await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStopVotingTimestamp) + 1])
    //     await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

    //     // Starts to process the proposal
    //     await distributeFundContract.processProposal(dao.address, this.proposalId);
    //     let distirbuteStatus = (await distributeFundContract.distributions(dao.address, proposalId)).status;
    //     console.log(`distributions status: ${distirbuteStatus}`);
    //     voteResults = await this.gpvoting.voteResult(dao.address, proposalId);
    //     console.log(`voteResults: ${voteResults}`);
    //     expect(voteResults.state).equal(2);
    //     expect(distirbuteStatus).equal(4);
    // });

    it("Vote in SUPERMAJORITY_QUORUM_REQUIRED model - yes votes less than supermajority && voters less than quorum", async () => {
        const project_team1 = this.project_team1.address;
        const dao = this.dao;
        const fundingpoolAdapter = this.fundingpoolAdapter;
        const riceStakingAdapter = this.riceStakingAdapter;
        const fundingPoolExt = this.fundingPoolExt;
        const riceStakingExt = this.riceStakingExt;
        const gpdaoExt = this.gpdaoExt;
        const distributeFundContract = this.distributefund;
        const streamingPaymentContract = this.streamingPayment;

        // Submit distribute proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("3800");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const lockupDate = blocktimestamp + 24;
        const fullyReleasedDate = lockupDate + 1000;
        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = this.testtoken2.address;

        await this.testtoken2.transfer(this.project_team1.address, tradingOffTokenAmount);
        await this.testtoken2.connect(this.project_team1).approve(distributeFundContract.address, tradingOffTokenAmount);

        let { proposalId } = await distributeFundsProposal(
            dao,
            distributeFundContract,
            requestedFundAmount,
            tradingOffTokenAmount,
            fullyReleasedDate,
            lockupDate,
            projectTeamAddr,
            projectTeamTokenAddr,
            this.owner
        );
        console.log(`new proposalID ${hre.ethers.utils.toUtf8String(proposalId)}`);
        this.proposalId = proposalId;

        let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStartVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        //start Voting Process
        await distributeFundContract.startVotingProcess(dao.address, this.proposalId);
        distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        console.log(`distributions status: ${distriInfo.status}`);

        const voteInfo = await this.gpvoting.votes(dao.address, this.proposalId);
        console.log(`start voting time of proposal ${hre.ethers.utils.toUtf8String(this.proposalId)} : ${voteInfo.startingTime}`);

        let projectTeamLockedTokenAmount = await distributeFundContract.projectTeamLockedTokens(dao.address, proposalId, projectTeamAddr);

        // gp1 Vote YES on the proposal
        await this.gpvoting.connect(this.gp1).submitVote(dao.address, proposalId, 1);
        // gp2 Vote YES on the proposal
        await this.gpvoting.connect(this.gp2).submitVote(dao.address, proposalId, 2);
        //get gp voting result
        let voteResults = await this.gpvoting.voteResult(dao.address, proposalId);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStopVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        // Starts to process the proposal
        await distributeFundContract.processProposal(dao.address, this.proposalId);
        let distirbuteStatus = (await distributeFundContract.distributions(dao.address, proposalId)).status;
        console.log(`distributions status: ${distirbuteStatus}`);
        voteResults = await this.gpvoting.voteResult(dao.address, proposalId);
        console.log(`voteResults: ${voteResults}`);
        expect(voteResults.state).equal(3);
        expect(distirbuteStatus).equal(5);
    });

    it("Vote in SUPERMAJORITY_QUORUM_REQUIRED model - yes votes greater than supermajority && voters less than quorum", async () => {
        const project_team1 = this.project_team1.address;
        const dao = this.dao;
        const fundingpoolAdapter = this.fundingpoolAdapter;
        const riceStakingAdapter = this.riceStakingAdapter;
        const fundingPoolExt = this.fundingPoolExt;
        const riceStakingExt = this.riceStakingExt;
        const gpdaoExt = this.gpdaoExt;
        const distributeFundContract = this.distributefund;
        const streamingPaymentContract = this.streamingPayment;

        // Submit distribute proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("3800");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const lockupDate = blocktimestamp + 24;
        const fullyReleasedDate = lockupDate + 1000;
        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = this.testtoken2.address;

        // await this.testtoken1.transfer(this.gp1.address, hre.ethers.utils.parseEther("200000"));
        // await depositToFundingPool(this.fundingpoolAdapter, dao, this.gp1, hre.ethers.utils.parseEther("200000"), this.testtoken1);
        // await fundingpoolAdapter.connect(this.gp2).withdraw(dao.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken2.transfer(this.project_team1.address, tradingOffTokenAmount);
        await this.testtoken2.connect(this.project_team1).approve(distributeFundContract.address, tradingOffTokenAmount);

        let { proposalId } = await distributeFundsProposal(
            dao,
            distributeFundContract,
            requestedFundAmount,
            tradingOffTokenAmount,
            fullyReleasedDate,
            lockupDate,
            projectTeamAddr,
            projectTeamTokenAddr,
            this.owner
        );
        console.log(`new proposalID ${hre.ethers.utils.toUtf8String(proposalId)}`);

        this.proposalId = proposalId;

        let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStartVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        //start Voting Process
        await distributeFundContract.startVotingProcess(dao.address, this.proposalId);
        const voteInfo = await this.gpvoting.votes(dao.address, this.proposalId);
        console.log(`start voting time of proposal ${this.proposalId} : ${voteInfo.startingTime}`);

        let projectTeamLockedTokenAmount = await distributeFundContract.projectTeamLockedTokens(dao.address, proposalId, projectTeamAddr);

        // gp1 Vote YES on the proposal
        await this.gpvoting.connect(this.gp1).submitVote(dao.address, proposalId, 1);
        // gp2 Vote YES on the proposal
        await this.gpvoting.connect(this.gp2).submitVote(dao.address, proposalId, 2);

        //get gp voting result
        let voteResults = await this.gpvoting.voteResult(dao.address, proposalId);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStopVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        // Starts to process the proposal
        await distributeFundContract.processProposal(dao.address, this.proposalId);
        let distirbuteStatus = (await distributeFundContract.distributions(dao.address, proposalId)).status;
        console.log(`distributions status: ${distirbuteStatus}`);
        voteResults = await this.gpvoting.voteResult(dao.address, proposalId);
        console.log(`voteResults: ${voteResults}`);
        expect(voteResults.state).equal(3);
        expect(distirbuteStatus).equal(5);
    });

    it("Vote in SUPERMAJORITY_QUORUM_REQUIRED model - yes votes less than supermajority && voters greater than quorum", async () => {
        const project_team1 = this.project_team1.address;
        const dao = this.dao;
        const fundingpoolAdapter = this.fundingpoolAdapter;
        const riceStakingAdapter = this.riceStakingAdapter;
        const fundingPoolExt = this.fundingPoolExt;
        const riceStakingExt = this.riceStakingExt;
        const gpdaoExt = this.gpdaoExt;
        const distributeFundContract = this.distributefund;
        const streamingPaymentContract = this.streamingPayment;

        // Submit distribute proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("3800");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const lockupDate = blocktimestamp + 24;
        const fullyReleasedDate = lockupDate + 1000;
        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = this.testtoken2.address;

        await this.testtoken2.transfer(this.project_team1.address, tradingOffTokenAmount);
        await this.testtoken2.connect(this.project_team1).approve(distributeFundContract.address, tradingOffTokenAmount);

        let { proposalId } = await distributeFundsProposal(
            dao,
            distributeFundContract,
            requestedFundAmount,
            tradingOffTokenAmount,
            fullyReleasedDate,
            lockupDate,
            projectTeamAddr,
            projectTeamTokenAddr,
            this.owner
        );
        console.log(`new proposalID ${hre.ethers.utils.toUtf8String(proposalId)}`);

        this.proposalId = proposalId;

        let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);

        //start fill funds process
        // await distributeFundContract.startFillFundsProcess(dao.address, this.proposalId);
        // distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        // console.log(`proposal state: ${distriInfo.status}`);
        // let currentProposalId = await distributeFundContract.ongoingDistributions(dao.address);
        // console.log(`current proposalId: ${hre.ethers.utils.toUtf8String(currentProposalId)}`);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStartVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        //start Voting Process
        await distributeFundContract.startVotingProcess(dao.address, this.proposalId);
        const voteInfo = await this.gpvoting.votes(dao.address, this.proposalId);
        console.log(`start voting time of proposal ${this.proposalId} : ${voteInfo.startingTime}`);

        // gp1 Vote YES on the proposal
        await this.gpvoting.connect(this.gp1).submitVote(dao.address, proposalId, 1);
        // gp2 Vote YES on the proposal
        await this.gpvoting.connect(this.gp2).submitVote(dao.address, proposalId, 2);
        // gp3 Vote YES on the proposal
        await this.gpvoting.connect(this.gp3).submitVote(dao.address, proposalId, 2);
        // gp4 Vote YES on the proposal
        await this.gpvoting.connect(this.gp4).submitVote(dao.address, proposalId, 2);

        //get gp voting result
        let voteResults = await this.gpvoting.voteResult(dao.address, proposalId);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStopVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        // Starts to process the proposal
        await distributeFundContract.processProposal(dao.address, this.proposalId);
        let distirbuteStatus = (await distributeFundContract.distributions(dao.address, proposalId)).status;
        console.log(`distributions status: ${distirbuteStatus}`);
        voteResults = await this.gpvoting.voteResult(dao.address, proposalId);
        console.log(`voteResults: ${voteResults}`);
        expect(voteResults.state).equal(3);
        expect(distirbuteStatus).equal(5);
    });

    it("Vote in SUPERMAJORITY_QUORUM_REQUIRED model - yes votes greater than supermajority && voters greater than quorum", async () => {
        const project_team1 = this.project_team1.address;
        const dao = this.dao;
        const fundingpoolAdapter = this.fundingpoolAdapter;
        const riceStakingAdapter = this.riceStakingAdapter;
        const fundingPoolExt = this.fundingPoolExt;
        const riceStakingExt = this.riceStakingExt;
        const gpdaoExt = this.gpdaoExt;
        const distributeFundContract = this.distributefund;
        const streamingPaymentContract = this.streamingPayment;

        // Submit distribute proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("3800");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const lockupDate = blocktimestamp + 24;
        const fullyReleasedDate = lockupDate + 1000;
        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = this.testtoken2.address;

        await this.testtoken2.transfer(this.project_team1.address, tradingOffTokenAmount);
        await this.testtoken2.connect(this.project_team1).approve(distributeFundContract.address, tradingOffTokenAmount);

        let { proposalId } = await distributeFundsProposal(
            dao,
            distributeFundContract,
            requestedFundAmount,
            tradingOffTokenAmount,
            fullyReleasedDate,
            lockupDate,
            projectTeamAddr,
            projectTeamTokenAddr,
            this.owner
        );
        console.log(`new proposalID ${hre.ethers.utils.toUtf8String(proposalId)}`);

        this.proposalId = proposalId;

        let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStartVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        //start Voting Process
        await distributeFundContract.startVotingProcess(dao.address, this.proposalId);
        const voteInfo = await this.gpvoting.votes(dao.address, this.proposalId);
        console.log(`start voting time of proposal ${this.proposalId} : ${voteInfo.startingTime}`);

        // gp1 Vote YES on the proposal
        await this.gpvoting.connect(this.gp1).submitVote(dao.address, proposalId, 1);
        // gp2 Vote YES on the proposal
        await this.gpvoting.connect(this.gp2).submitVote(dao.address, proposalId, 1);
        // gp3 Vote YES on the proposal
        await this.gpvoting.connect(this.gp3).submitVote(dao.address, proposalId, 1);
        // gp4 Vote YES on the proposal
        await this.gpvoting.connect(this.gp4).submitVote(dao.address, proposalId, 1);
        // gp5 Vote NO on the proposal
        await this.gpvoting.connect(this.gp5).submitVote(dao.address, proposalId, 2);
        // gp6 Vote NO on the proposal
        await this.gpvoting.connect(this.gp6).submitVote(dao.address, proposalId, 2);
        //get gp voting result
        let voteResults = await this.gpvoting.voteResult(dao.address, proposalId);
        console.log("voteResults: ",voteResults);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStopVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        // Starts to process the proposal
        await distributeFundContract.processProposal(dao.address, this.proposalId);
        let distirbuteStatus = (await distributeFundContract.distributions(dao.address, proposalId)).status;
        console.log(`distributions status: ${distirbuteStatus}`);
        voteResults = await this.gpvoting.voteResult(dao.address, proposalId);
        console.log(`voteResults: ${voteResults}`);
        expect(voteResults.state).equal(2);
        expect(distirbuteStatus).equal(4);
    });
});


// describe("deposit && withdraw", () => {
//     before("deploy dao", async () => {
//         let [owner, user1, user2, investor1, investor2, gp1, gp2, gp3, gp4, gp5, gp6, project_team1, project_team2, project_team3, rice_staker] = await hre.ethers.getSigners();
//         this.owner = owner;
//         this.user1 = user1;
//         this.user2 = user2;
//         this.investor1 = investor1;
//         this.investor2 = investor2;
//         this.gp1 = gp1;
//         this.gp2 = gp2;
//         this.gp3 = gp3;
//         this.gp4 = gp4;
//         this.gp5 = gp5;
//         this.gp6 = gp6;
//         this.project_team1 = project_team1;
//         this.project_team2 = project_team2;
//         this.project_team3 = project_team3;

//         this.rice_staker = rice_staker;

//         const { dao, adapters, extensions, testContracts } = await deployDefaultDao({
//             owner: owner,
//         });
//         this.adapters = adapters;
//         this.extensions = extensions;
//         this.dao = dao;
//         this.testContracts = testContracts;
//         //test contract
//         this.testtoken1 = testContracts.testToken1.instance
//         this.testtoken2 = testContracts.testToken2.instance
//         this.testRiceToken = testContracts.testRiceToken.instance
//         //ext
//         this.fundingPoolExt = this.extensions.fundingpoolExt.functions;
//         this.gpdaoExt = this.extensions.gpDaoExt.functions;
//         this.riceStakingExt = this.extensions.ricestakingExt.functions;
//         //adapters
//         this.streamingPayment = this.adapters.sablierAdapter.instance;
//         // this.manageMember = this.adapters.manageMemberAdapter.instance;
//         this.allocationAdapter = this.adapters.allocation.instance;
//         this.allocationAdapterv2 = this.adapters.allocationv2.instance;
//         this.gpvoting = this.adapters.gpVotingAdapter.instance;
//         this.distributefund = this.adapters.distributeFundAdapterv2.instance;
//         this.fundingpoolAdapter = this.adapters.fundingpoolAdapter.instance;
//         this.gpdaoAdapter = this.adapters.gpdaoAdapter.instance;
//         this.stakingRiceAdapter = this.adapters.ricestakingAdapter.instance;
//         this.gpDaoOnboardingAdapter = this.adapters.gpDaoOnboardingAdapter.instance;
//         this.gpOnboardVotingAdapter = this.adapters.gpOnboardVotingAdapter.instance;
//         this.snapshotId = await takeChainSnapshot();

//         await this.testtoken1.transfer(investor1.address, hre.ethers.utils.parseEther("1000"));
//         await this.testtoken1.transfer(investor2.address, hre.ethers.utils.parseEther("1000"));

//         await this.testtoken1.transfer(gp1.address, hre.ethers.utils.parseEther("20000"));
//         await this.testtoken1.transfer(gp2.address, hre.ethers.utils.parseEther("20000"));
//         await this.testtoken1.transfer(gp3.address, hre.ethers.utils.parseEther("20000"));
//         await this.testtoken1.transfer(gp4.address, hre.ethers.utils.parseEther("20000"));
//         await this.testtoken1.transfer(gp5.address, hre.ethers.utils.parseEther("20000"));
//         await this.testtoken1.transfer(gp6.address, hre.ethers.utils.parseEther("20000"));

//         await this.testRiceToken.transfer(rice_staker.address, hre.ethers.utils.parseEther("20000"));

//         //register new GP
//         await addNewGP(this.gp1.address, this.gpDaoOnboardingAdapter, this.gpOnboardVotingAdapter, dao);
//         await addNewGP(this.gp2.address, this.gpDaoOnboardingAdapter, this.gpOnboardVotingAdapter, dao);
//         await addNewGP(this.gp3.address, this.gpDaoOnboardingAdapter, this.gpOnboardVotingAdapter, dao);
//         await addNewGP(this.gp4.address, this.gpDaoOnboardingAdapter, this.gpOnboardVotingAdapter, dao);
//         await addNewGP(this.gp5.address, this.gpDaoOnboardingAdapter, this.gpOnboardVotingAdapter, dao);
//         await addNewGP(this.gp6.address, this.gpDaoOnboardingAdapter, this.gpOnboardVotingAdapter, dao);
//     });

//     beforeEach(async () => {
//         await revertChainSnapshot(this.snapshotId);
//         this.snapshotId = await takeChainSnapshot();
//     });

//     const addNewGP = async (applicant, gpDaoOnboardingAdapter, gpOnboardVotingAdatper, dao) => {
//         const tx = await gpDaoOnboardingAdapter.submitProposal(dao.address, applicant);
//         const result = await tx.wait();
//         const newOnboardingProposalId = result.events[2].args.proposalId;
//         console.log(`newOnboardingProposalId: ${hre.ethers.utils.toUtf8String(newOnboardingProposalId)}`);

//         const proposalInfo = await gpDaoOnboardingAdapter.proposals(dao.address, newOnboardingProposalId);
//         await gpOnboardVotingAdatper.submitVote(dao.address, newOnboardingProposalId, 1);

//         await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1])
//         await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

//         await gpDaoOnboardingAdapter.processProposal(dao.address, newOnboardingProposalId);
//     }

//     const depositToFundingPool = async (
//         fundingpoolAdapter,
//         dao,
//         investor,
//         amount,
//         token) => {
//         console.log(`FUND_RAISING_WINDOW_BEGIN: ${(await dao.getConfiguration(sha3("FUND_RAISING_WINDOW_BEGIN")))}`);
//         console.log(`FUND_RAISING_WINDOW_END: ${(await dao.getConfiguration(sha3("FUND_RAISING_WINDOW_END")))}`);

//         let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
//         console.log(`current blocktimestamp: ${blocktimestamp}`);

//         await token.connect(investor).approve(fundingpoolAdapter.address, amount);
//         await fundingpoolAdapter.connect(investor).deposit(dao.address, amount);
//     };


//     const stakingRice = async (stakingRiceAdapter,
//         dao,
//         investor,
//         amount,
//         token) => {
//         await token.connect(investor).approve(stakingRiceAdapter.address, amount);
//         await stakingRiceAdapter.connect(investor).deposit(dao.address, amount);
//     }

//     const distributeFundsProposal = async (
//         dao,
//         distributeFundContract,
//         requestedFundAmount,
//         tradingOffTokenAmount,
//         fullyReleasedDate,
//         lockupDate,
//         projectTeamAddr,
//         projectTokenAddr,
//         sender
//     ) => {
//         const tx = await distributeFundContract.connect(sender).submitProposal(
//             dao.address,
//             [projectTeamAddr, projectTokenAddr],
//             [requestedFundAmount, tradingOffTokenAmount, fullyReleasedDate, lockupDate]
//         );
//         const result = await tx.wait();
//         const newProposalId = result.events[2].args.proposalId;
//         return { proposalId: newProposalId };
//     };

//     it("it's possible to let lps to deposit/withdraw token when proposal in fill funds duration", async () => {
//         const project_team1 = this.project_team1.address;
//         const dao = this.dao;
//         const fundingpoolAdapter = this.fundingpoolAdapter;
//         const riceStakingAdapter = this.riceStakingAdapter;
//         const fundingPoolExt = this.fundingPoolExt;
//         const riceStakingExt = this.riceStakingExt;
//         const gpdaoExt = this.gpdaoExt;
//         const distributeFundContract = this.distributefund;
//         const streamingPaymentContract = this.streamingPayment;
        
//         // Submit distribute proposal
//         const requestedFundAmount = hre.ethers.utils.parseEther("38000");
//         const tradingOffTokenAmount = hre.ethers.utils.parseEther("50000");
//         let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
//         const lockupDate = blocktimestamp + 24;
//         const fullyReleasedDate = lockupDate + 1000;
//         const projectTeamAddr = project_team1;
//         const projectTeamTokenAddr = this.testtoken2.address;

//         await this.testtoken2.transfer(projectTeamAddr, tradingOffTokenAmount);
//         await this.testtoken2.connect(this.project_team1).approve(distributeFundContract.address, tradingOffTokenAmount);
//         let { proposalId } = await distributeFundsProposal(
//             dao,
//             distributeFundContract,
//             requestedFundAmount,
//             tradingOffTokenAmount,
//             fullyReleasedDate,
//             lockupDate,
//             projectTeamAddr,
//             projectTeamTokenAddr,
//             this.owner
//         );
//         console.log(`proposalId: ${hre.ethers.utils.toUtf8String(proposalId)}`);
//         this.proposalId = proposalId;

//         let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
//         console.log(`distriInfo -> proposalStartVotingTimestamp:  ${distriInfo.proposalStartVotingTimestamp}`);
//         console.log(`distriInfo -> proposalStopVotingTimestamp:  ${distriInfo.proposalStopVotingTimestamp}`);
//         console.log(`distriInfo -> proposalExecuteTimestamp:  ${distriInfo.proposalExecuteTimestamp}`);
//         console.log(`current blcok timestamp ->: ${(await hre.ethers.provider.getBlock("latest")).timestamp}`);

//         let baloflp = await fundingpoolAdapter.balanceOf(dao.address, this.investor1.address);
//         let balofGP = await fundingpoolAdapter.gpBalance(dao.address);
//         let totalFund = await fundingpoolAdapter.lpBalance(dao.address);

//         console.log(`investor1 balance in funding pool: ${hre.ethers.utils.formatEther(baloflp.toString())}`);
//         console.log(`all GPs balance in funding pool: ${hre.ethers.utils.formatEther(balofGP.toString())}`);
//         console.log(`total fund in funding pool: ${hre.ethers.utils.formatEther(totalFund.toString())}`);

//         await fundingpoolAdapter.connect(this.investor1).withdraw(dao.address, hre.ethers.utils.parseEther("95"));

//         baloflp = await fundingpoolAdapter.balanceOf(dao.address, this.investor1.address);
//         balofGP = await fundingpoolAdapter.gpBalance(dao.address);
//         totalFund = await fundingpoolAdapter.lpBalance(dao.address);
//         console.log(`investor1 balance in funding pool: ${hre.ethers.utils.formatEther(baloflp.toString())}`);
//         console.log(`all GPs balance in funding pool: ${hre.ethers.utils.formatEther(balofGP.toString())}`);
//         console.log(`total fund in funding pool: ${hre.ethers.utils.formatEther(totalFund.toString())}`);
//     });

//     it("it's impossible to let lps to deposit/withdraw token when proposal in voting duration and process duration", async () => {
//         const dao = this.dao;
//         const fundingpoolAdapter = this.fundingpoolAdapter;
//         const distributeFundContract = this.distributefund;

//         let distriInfo = await distributeFundContract.distributions(dao.address, this.proposalId);

//         await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStartVotingTimestamp) + 1])
//         await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

//         await distributeFundContract.startVotingProcess(dao.address, this.proposalId);

//         await expectRevert(depositToFundingPool(fundingpoolAdapter, dao, this.investor1, hre.ethers.utils.parseEther("100"), this.testtoken1), "revert");

//         await expectRevert(fundingpoolAdapter.connect(this.investor1).withdraw(dao.address, hre.ethers.utils.parseEther("95")), "revert");

//         await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStopVotingTimestamp) + 1])
//         await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

//         await expectRevert(depositToFundingPool(fundingpoolAdapter, dao, this.investor1, hre.ethers.utils.parseEther("100"), this.testtoken1), "revert");

//         await expectRevert(fundingpoolAdapter.connect(this.investor1).withdraw(dao.address, hre.ethers.utils.parseEther("95")), "revert");
//     });

//     it("it's possible to let lps to deposit/withdraw token when proposal processed", async () => {
//         const dao = this.dao;
//         const fundingpoolAdapter = this.fundingpoolAdapter;
//         const distributeFundContract = this.distributefund;
//         const distriInfo = await distributeFundContract.distributions(dao.address, this.proposalId);

//         await distributeFundContract.processProposal(dao.address, this.proposalId);

//         await depositToFundingPool(fundingpoolAdapter, dao, this.investor1, hre.ethers.utils.parseEther("100"), this.testtoken1);

//         let baloflp = await fundingpoolAdapter.balanceOf(dao.address, this.investor1.address);
//         let balofGP = await fundingpoolAdapter.gpBalance(dao.address);
//         let totalFund = await fundingpoolAdapter.lpBalance(dao.address);
//         console.log(`investor1 balance in funding pool: ${hre.ethers.utils.formatEther(baloflp.toString())}`);
//         console.log(`all GPs balance in funding pool: ${hre.ethers.utils.formatEther(balofGP.toString())}`);
//         console.log(`total fund in funding pool: ${hre.ethers.utils.formatEther(totalFund.toString())}`);

//         await fundingpoolAdapter.connect(this.investor1).withdraw(dao.address, hre.ethers.utils.parseEther("95"));
//         baloflp = await fundingpoolAdapter.balanceOf(dao.address, this.investor1.address);
//         balofGP = await fundingpoolAdapter.gpBalance(dao.address);
//         totalFund = await fundingpoolAdapter.lpBalance(dao.address);
//         console.log(`investor1 balance in funding pool: ${hre.ethers.utils.formatEther(baloflp.toString())}`);
//         console.log(`all GPs balance in funding pool: ${hre.ethers.utils.formatEther(balofGP.toString())}`);
//         console.log(`total fund in funding pool: ${hre.ethers.utils.formatEther(totalFund.toString())}`);

//         await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalExecuteTimestamp) + 1])
//         await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

//         await depositToFundingPool(fundingpoolAdapter, dao, this.investor1, hre.ethers.utils.parseEther("100"), this.testtoken1);

//         baloflp = await fundingpoolAdapter.balanceOf(dao.address, this.investor1.address);
//         balofGP = await fundingpoolAdapter.gpBalance(dao.address);
//         totalFund = await fundingpoolAdapter.lpBalance(dao.address);
//         console.log(`investor1 balance in funding pool: ${hre.ethers.utils.formatEther(baloflp.toString())}`);
//         console.log(`all GPs balance in funding pool: ${hre.ethers.utils.formatEther(balofGP.toString())}`);
//         console.log(`total fund in funding pool: ${hre.ethers.utils.formatEther(totalFund.toString())}`);

//         await fundingpoolAdapter.connect(this.investor1).withdraw(dao.address, hre.ethers.utils.parseEther("95"));
//         baloflp = await fundingpoolAdapter.balanceOf(dao.address, this.investor1.address);
//         balofGP = await fundingpoolAdapter.gpBalance(dao.address);
//         totalFund = await fundingpoolAdapter.lpBalance(dao.address);
//         console.log(`investor1 balance in funding pool: ${hre.ethers.utils.formatEther(baloflp.toString())}`);
//         console.log(`all GPs balance in funding pool: ${hre.ethers.utils.formatEther(balofGP.toString())}`);
//         console.log(`total fund in funding pool: ${hre.ethers.utils.formatEther(totalFund.toString())}`);
//     });
// });