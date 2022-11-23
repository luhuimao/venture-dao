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
import { isAwaitExpression } from "typescript";
import { RiceStakingAdapterContract_GOERLI } from "../../.config";
// const { getConfig } = require("../../migrations/configs/contracts.config");

import { deployDefaultDao, takeChainSnapshot, revertChainSnapshot, proposalIdGenerator, expect, expectRevert, web3 } from "../../utils/hh-util";
const { checkBalance, depositToFundingPool ,createDistributeFundsProposal} = require("../../utils/test-util");

const proposalCounter = proposalIdGenerator().generator;


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
        this.vestingAdapter=this.adapters.furoVesting.instance;
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
        // await this.fundingpoolAdapter.processFundRaise(dao.address);
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

    it("should be not possible to submit a funding proposal by non gp member", async () => {
        const dao = this.dao;
        const distributeFundContract = this.distributefund
        const amountToDistribute = 10;
        const project_team1 = this.project_team1.address;


        const requestedFundAmount = hre.ethers.utils.parseEther("10000");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("50000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const currentBlockTime = blocktimestamp;
        const vestingStartTime = currentBlockTime ;
        const vestingcliffDuration= currentBlockTime + 1000;
        const stepDuration=oneDay;
        const steps=7;
        const stepPercentage=hre.ethers.utils.parseEther("1").div(toBN(steps));

        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = this.testtoken2.address;

        await expectRevert(
            createDistributeFundsProposal(
                dao,
                distributeFundContract,
                requestedFundAmount,
                tradingOffTokenAmount,
                vestingStartTime,
                vestingcliffDuration,
                stepDuration,
                steps,
                stepPercentage,
                projectTeamAddr,
                projectTeamTokenAddr,
                projectTeamAddr,
                this.user2
            ),
            "revert"
        );
    });

    it("should be impossible to submit a funding proposal if step setting invalid",async()=>{
        const dao = this.dao;
        const distributeFundContract = this.distributefund


        const requestedFundAmount = hre.ethers.utils.parseEther("10000");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("50000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const currentBlockTime = blocktimestamp;
        const vestingStartTime = currentBlockTime ;
        const vestingcliffDuration= currentBlockTime + 1000;
        const stepDuration=oneDay;
        const steps=7;
        let stepPercentage=hre.ethers.utils.parseEther("1").div(toBN(steps-1));

        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = this.testtoken2.address;

        await expectRevert(
            createDistributeFundsProposal(
                dao,
                distributeFundContract,
                requestedFundAmount,
                tradingOffTokenAmount,
                vestingStartTime,
                vestingcliffDuration,
                stepDuration,
                steps,
                stepPercentage,
                projectTeamAddr,
                projectTeamTokenAddr,
                projectTeamAddr,
                this.user2
            ),
            "revert"
        );

    });

    it("should be possible to distribute funds to project team", async () => {
        const project_team1 = this.project_team1.address;
        const dao = this.dao;
        const fundingpoolAdapter = this.fundingpoolAdapter;
        const fundingPoolExt = this.fundingPoolExt;
        const gpdaoExt = this.gpdaoExt;
        const distributeFundContract = this.distributefund;
        const vestingAdapter=this.vestingAdapter;
        // Submit distribute proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("30000");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("50000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const vestingStartTime = blocktimestamp + 24 ;
        const vestingcliffDuration=  oneWeek;
        const stepDuration=oneDay;
        const steps=7;
        const stepPercentage=hre.ethers.utils.parseEther("1").div(toBN(steps));

        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = this.testtoken2.address;
        const GPAddr= await dao.getAddressConfiguration(sha3("GP_ADDRESS"));
        const DaoSquareAddr= await dao.getAddressConfiguration(sha3("DAO_SQUARE_ADDRESS"));

        const managementFeeRatio= await dao.getConfiguration(sha3("MANAGEMENT_FEE"))
        const protocolFeeRatio=await dao.getConfiguration(sha3("PROTOCOL_FEE"));
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
            stepPercentage,
            projectTeamAddr,
            projectTeamTokenAddr,
            projectTeamAddr,
            this.owner
        );
        console.log(`proposalId: ${hre.ethers.utils.toUtf8String(proposalId)}`);
        this.proposalId = proposalId;

        let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);

        //start Voting Process
        // only GP allow to start voting
        await expectRevert(distributeFundContract.connect(this.user1).startVotingProcess(dao.address, this.proposalId),"revert");
        await distributeFundContract.startVotingProcess(dao.address, this.proposalId);
        distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        console.log(`proposal state: ${distriInfo.status}`);

        let projectTeamLockedTokenAmount = await distributeFundContract.projectTeamLockedTokens(dao.address, proposalId, projectTeamAddr);
        console.log(`projectTeam Locked Token Amount ${hre.ethers.utils.formatEther(projectTeamLockedTokenAmount)}`);

        // owner Vote YES on the proposal
        await this.gpvoting.submitVote(dao.address, proposalId, 1);
        // gp1 Vote YES on the proposal
        await this.gpvoting.connect(this.gp1).submitVote(dao.address, proposalId, 1);
        // gp2 Vote YES on the proposal
        await this.gpvoting.connect(this.gp2).submitVote(dao.address, proposalId, 1);
        //get gp voting result
        console.log(`distributions status: ${(await distributeFundContract.distributions(dao.address, proposalId)).status}`);
        console.log("project_team1 USDT balance: ", hre.ethers.utils.formatEther((await this.testtoken1.balanceOf(project_team1)).toString()));

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStopVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        //allocation calculate
        //1. funding rewards
        const investor1fundingRewards=await this.allocationAdapterv2.getFundingRewards(dao.address,
            this.investor1.address,
            (await distributeFundContract.distributions(dao.address, proposalId)).tradingOffTokenAmount
        );
        console.log(`investor1 funding Rewards ${hre.ethers.utils.formatEther(investor1fundingRewards.toString())}`);
        const investor2fundingRewards=await this.allocationAdapterv2.getFundingRewards(dao.address,
            this.investor2.address,
            (await distributeFundContract.distributions(dao.address, proposalId)).tradingOffTokenAmount
        );
        console.log(`investor2 funding Rewards ${hre.ethers.utils.formatEther(investor2fundingRewards.toString())}`);
        const ownerfundingRewards = await this.allocationAdapterv2.getFundingRewards(dao.address,
            this.owner.address,
            (await distributeFundContract.distributions(dao.address, proposalId)).tradingOffTokenAmount
        );
        console.log(`owner funding Rewards ${hre.ethers.utils.formatEther(ownerfundingRewards.toString())}`);
        const gp1fundingRewards = await this.allocationAdapterv2.getFundingRewards(dao.address,
            this.gp1.address,
            (await distributeFundContract.distributions(dao.address, proposalId)).tradingOffTokenAmount
        );
        console.log(`gp1 funding Rewards ${hre.ethers.utils.formatEther(gp1fundingRewards.toString())}`);
        const gp2fundingRewards = await this.allocationAdapterv2.getFundingRewards(dao.address,
            this.gp2.address,
            (await distributeFundContract.distributions(dao.address, proposalId)).tradingOffTokenAmount
        );
        console.log(`gp2 funding Rewards ${hre.ethers.utils.formatEther(gp2fundingRewards.toString())}`);

        // proposerBonus
        const proposerBonus = await this.allocationAdapterv2.getProposerBonus(dao.address, distriInfo.proposer, tradingOffTokenAmount);
        console.log(`proposer Bonus ${hre.ethers.utils.formatEther(proposerBonus.toString())}`);

        const allAllocations= toBN(investor1fundingRewards.toString()).add(toBN(investor2fundingRewards.toString())).
            add(toBN(ownerfundingRewards.toString())).add(toBN(gp1fundingRewards.toString())).add(toBN(gp2fundingRewards.toString())).
            add(toBN(proposerBonus.toString()));
        console.log(`all Allocations ${hre.ethers.utils.formatEther(allAllocations)}`);

        const GPBal1 = await this.testtoken1.balanceOf(GPAddr);
        const DaoSquareBal1= await this.testtoken1.balanceOf(DaoSquareAddr);

        // const lps=await fundingPoolExt.getInvestors();
        // console.log(`all lps ${lps}`);

        // Starts to process the proposal
       let tx= await distributeFundContract.processProposal(dao.address, this.proposalId);
      let rel=   await tx.wait();
      console.log("$$$$$$$$$$$$$$$$$$$$$$$ gas used: ", rel.gasUsed.toString());
     
        //create stream
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
            for(var i=0;i<lps.length;i++){
               let eligible= await this.allocationAdapterv2.ifEligible(dao.address, lps[i].address, this.proposalId);
                if(eligible){
                 tx=   await vestingAdapter.connect(lps[i]).createVesting(dao.address, lps[i].address,this.proposalId );
                 rel=await tx.wait();
                 console.log("$$$$$$$$$$$$$$$$$$$$$$$ gas used: ", rel.gasUsed.toString());
                }
            }
            // await streamingPaymentContract.connect(lps[0]).createStream(dao.address, lps[0].address,this.proposalId );
            // cant create twice
            // await expectRevert(streamingPaymentContract.connect(lps[0]).createStream(dao.address, lps[0].address,this.proposalId ),"revert");

        const GPBal2 = await this.testtoken1.balanceOf(GPAddr);
        const DaoSquareBal2= await this.testtoken1.balanceOf(DaoSquareAddr);
        //management fee
        expect(toBN(GPBal2).sub(toBN(GPBal1))).equal(toBN(requestedFundAmount).mul(
            toBN(managementFeeRatio)).div(toBN("100")));
        
        //protocol fee
        expect(toBN(DaoSquareBal2).sub(toBN(DaoSquareBal1))).equal(
            toBN(requestedFundAmount).mul(
                toBN(protocolFeeRatio)).div(toBN("100")));

        console.log(`distributions status: ${(await distributeFundContract.distributions(dao.address, proposalId)).status}`);
        const voteResults = await this.gpvoting.voteResult(dao.address, proposalId);
        console.log(`voteResults: ${voteResults}`);
    
        console.log(`total supply ${hre.ethers.utils.formatEther((await fundingPoolExt.totalSupply()).toString())}`);
        console.log(`fundingpoolExt USDT bal: ${hre.ethers.utils.formatEther((await this.testtoken1.balanceOf(this.extensions.fundingpoolExt.address)).toString())}`);
        projectTeamLockedTokenAmount = await distributeFundContract.projectTeamLockedTokens(dao.address, proposalId, projectTeamAddr);
        console.log(`projectTeam Locked Token Amount ${hre.ethers.utils.formatEther(projectTeamLockedTokenAmount)}`);
        console.log("project_team1 USDT balance: ", hre.ethers.utils.formatEther((await this.testtoken1.balanceOf(project_team1)).toString()));
        expect((await this.testtoken1.balanceOf(project_team1))).equal(requestedFundAmount);

        let nextVestId = await vestingAdapter.vestIds();
        nextVestId = parseInt(nextVestId.toString());
        console.log("nextVestId: ", nextVestId);
    
        let totalDepositAmount=0;
        for (var i = 1; i < nextVestId; i++) {
            let vestInfo = await vestingAdapter.vests(i);
            const claimableBal = await vestingAdapter.vestBalance(i);
            totalDepositAmount = toBN(totalDepositAmount.toString()).add(toBN(vestInfo.cliffShares.toString())).add(vestInfo.stepShares.toString());
            console.log(`recipient of vest ${i}: ${vestInfo.recipient}`);
            console.log(`depoist amount ${hre.ethers.utils.formatEther((toBN(vestInfo.cliffShares.toString())).add(toBN(vestInfo.stepShares.toString())))}`);
            console.log(`claimable balance of vest ${i}: ${hre.ethers.utils.formatEther(claimableBal)}`);

            //withdraw from streaming payment
          
            for (var j = 0; j < lps.length; j++) {
                if (lps[j].address == vestInfo.recipient) {
                    await vestingAdapter.connect(lps[j]).withdraw(dao.address,i);
                }
            }

        }
        console.log(`total deposit amount: ${hre.ethers.utils.formatEther(totalDepositAmount)}`);
        // expect(totalDepositAmount).equal(allAllocations);
    });

    it("should be impossible to un-lock project tokens if voting passed and distribution done", async () => {
        const dao = this.dao;
        const distributeFundContract = this.distributefund;
        const voteResult = await this.gpvoting.voteResult(dao.address, this.proposalId);
        console.log("vote result: ", voteResult.state);
        expect(voteResult.state).equal(2)//voting passed
        let distributeStatus = (await distributeFundContract.distributions(dao.address, this.proposalId)).status;
        console.log("distributeStatus: ", distributeStatus);
        expect(distributeStatus).equal(3)//distribution done
        const projectTeamLockedTokenAmount = await distributeFundContract.projectTeamLockedTokens(dao.address, this.proposalId, this.project_team1.address);
        console.log(`projectTeamLockedTokenAmount: ${hre.ethers.utils.formatEther(projectTeamLockedTokenAmount)}`);
        await this.testtoken2.transfer(distributeFundContract.address, projectTeamLockedTokenAmount);
        await expectRevert(distributeFundContract.unLockProjectTeamToken(dao.address, this.proposalId), "revert");
    });

    it("should be impossible to distribute funds to project team if total funds smaller than requrested funds + management fee", async () => {
        const project_team2 = this.project_team2.address;
        const dao = this.dao;
        const fundingpoolAdapter = this.fundingpoolAdapter;
        const riceStakingAdapter = this.riceStakingAdapter;
        const fundingPoolExt = this.fundingPoolExt;
        // const riceStakingExt = this.riceStakingExt;
        const gpdaoExt = this.gpdaoExt;
        const distributeFundContract = this.distributefund;
        // const streamingPaymentContract = this.streamingPayment;
        //gp deposit funds
        await this.testtoken1.connect(this.owner).transfer(this.gp1.address, hre.ethers.utils.parseEther("2000"));
        await this.testtoken1.connect(this.owner).transfer(this.gp2.address, hre.ethers.utils.parseEther("2000"));
        console.log("gp1 tt1 bal: ", hre.ethers.utils.formatEther(await this.testtoken1.balanceOf(this.gp1.address)));
        console.log("gp2 tt1 bal:", hre.ethers.utils.formatEther(await this.testtoken1.balanceOf(this.gp2.address)));


        console.log(`gp1 balance in funding pool: ${hre.ethers.utils.formatEther(
            (await fundingpoolAdapter.balanceOf(dao.address, this.gp1.address)).toString()
        )
            }`);
        console.log(`gp2 balance in funding pool: ${hre.ethers.utils.formatEther((await fundingpoolAdapter.balanceOf(dao.address, this.gp2.address)).toString())
            }`);


        // Submit distribute proposal
        const totalFund = await fundingPoolExt.totalSupply();
        console.log(`totalFund: ${hre.ethers.utils.formatEther(totalFund.toString())}`);

        const requestedFundAmount = toBN(totalFund.toString()).add(toBN("1"));
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        
        const vestingStartTime = blocktimestamp + 24 ;
        const vestingcliffDuration=  oneWeek;
        const stepDuration=oneDay;
        const steps=7;
        const stepPercentage=hre.ethers.utils.parseEther("1").div(toBN(steps));

        const projectTeamAddr = this.project_team2.address;
        const projectTeamTokenAddr = this.testtoken2.address;

        await this.testtoken2.transfer(this.project_team2.address, tradingOffTokenAmount);
        console.log(`project token balance of project_team2:  ${hre.ethers.utils.formatEther(await this.testtoken2.balanceOf(this.project_team2.address))}`);
        await this.testtoken2.connect(this.project_team2).approve(distributeFundContract.address, tradingOffTokenAmount);
        console.log(`project token allowance of distributeFundContract : ${hre.ethers.utils.formatEther(await this.testtoken2.allowance(this.project_team2.address, distributeFundContract.address))}`);

        let { proposalId } = await createDistributeFundsProposal(
            dao,
            distributeFundContract,
            requestedFundAmount,
            tradingOffTokenAmount,
            vestingStartTime,
            vestingcliffDuration,
            stepDuration,
            steps,
            stepPercentage,
            projectTeamAddr,
            projectTeamTokenAddr,
            projectTeamAddr,
            this.owner
        );
        console.log(`proposalId: ${hre.ethers.utils.toUtf8String(proposalId)}`);
        this.proposalId = proposalId;


        let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        console.log(`distributions status: ${distriInfo.status}`);
        console.log(`distriInfo -> proposalStartVotingTimestamp:  ${distriInfo.proposalStartVotingTimestamp}`);
        console.log(`distriInfo -> proposalStopVotingTimestamp:  ${distriInfo.proposalStopVotingTimestamp}`);
        console.log(`current blcok timestamp ->: ${(await hre.ethers.provider.getBlock("latest")).timestamp}`);

        const lpBal = await fundingpoolAdapter.lpBalance(dao.address);
        console.log(`lp balance: ${hre.ethers.utils.formatEther(lpBal)}`);

        //start Voting Process
        await distributeFundContract.startVotingProcess(dao.address, proposalId);
        distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        console.log(`distribution state ${distriInfo.status}`);
        // await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStopVotingTimestamp) + 1])
        // await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        await distributeFundContract.processProposal(dao.address, proposalId);
        distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        console.log(`distributions status: ${distriInfo.status}`);
        expect(distriInfo.status).equal(4);// failed
    });

    it("should be possible to un-lock project tokens if distribution failed", async () => {
        const dao = this.dao;
        const distributeFundContract = this.distributefund;
        const fundingpoolAdapter = this.fundingpoolAdapter;

        //submite distribute proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("1000");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
      
        const vestingStartTime = blocktimestamp + 24 ;
        const vestingcliffDuration=  oneWeek;
        const stepDuration=oneDay;
        const steps=7;
        const stepPercentage=hre.ethers.utils.parseEther("1").div(toBN(steps));

        const projectTeamAddr = this.project_team3.address;
        const projectTeamTokenAddr = this.testtoken2.address;

        await this.testtoken2.transfer(projectTeamAddr, tradingOffTokenAmount);
        await this.testtoken2.connect(this.project_team3).approve(this.distributefund.address, tradingOffTokenAmount);
        console.log(`project team project token amount: ${hre.ethers.utils.formatEther(await this.testtoken2.balanceOf(projectTeamAddr))}`);

        let { proposalId } = await createDistributeFundsProposal(
            dao,
            this.distributefund,
            requestedFundAmount,
            tradingOffTokenAmount,
            vestingStartTime,
            vestingcliffDuration,
            stepDuration,
            steps,
            stepPercentage,
            projectTeamAddr,
            projectTeamTokenAddr,
            projectTeamAddr,
            this.owner
        );
        console.log(`new proposalID ${hre.ethers.utils.toUtf8String(proposalId)}`);

        let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);

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
        expect(voteResults[0]).equal(3);// vote not pass
        distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        console.log("Distribution Status: ", distriInfo.status);
        expect(distriInfo.status).equal(4);//distribution failed
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
        // const riceStakingExt = this.riceStakingExt;
        const gpdaoExt = this.gpdaoExt;
        const distributeFundContract = this.distributefund;
        // const streamingPaymentContract = this.streamingPayment;
        //gp deposit funds
        await this.testtoken1.connect(this.owner).transfer(this.gp1.address, hre.ethers.utils.parseEther("2000"));
        await this.testtoken1.connect(this.owner).transfer(this.gp2.address, hre.ethers.utils.parseEther("2000"));

        // Submit distribute proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("6000");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
      
        const vestingStartTime = blocktimestamp + 24 ;
        const vestingcliffDuration=  oneWeek;
        const stepDuration=oneDay;
        const steps=7;
        const stepPercentage=hre.ethers.utils.parseEther("1").div(toBN(steps));

        const projectTeamAddr = this.project_team2.address;
        const projectTeamTokenAddr = this.testtoken2.address;

        await this.testtoken2.transfer(this.project_team2.address, tradingOffTokenAmount);
        console.log(`project token balance of project_team2:  ${hre.ethers.utils.formatEther(await this.testtoken2.balanceOf(this.project_team2.address))}`);
        await this.testtoken2.connect(this.project_team2).approve(distributeFundContract.address, hre.ethers.utils.parseEther("4000"));
        console.log(`project token allowance of distributeFundContract : ${hre.ethers.utils.formatEther(await this.testtoken2.allowance(this.project_team2.address, distributeFundContract.address))}`);

        let { proposalId } = await createDistributeFundsProposal(
            dao,
            distributeFundContract,
            requestedFundAmount,
            tradingOffTokenAmount,
            vestingStartTime,
            vestingcliffDuration,
            stepDuration,
            steps,
            stepPercentage,
            projectTeamAddr,
            projectTeamTokenAddr,
            projectTeamAddr,
            this.owner
        );
        console.log(`proposalId: ${hre.ethers.utils.toUtf8String(proposalId)}`);
        this.proposalId = proposalId;


        let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        console.log(`distributions status: ${distriInfo.status}`);
        console.log(`distriInfo -> proposalStartVotingTimestamp:  ${distriInfo.proposalStartVotingTimestamp}`);
        console.log(`distriInfo -> proposalStopVotingTimestamp:  ${distriInfo.proposalStopVotingTimestamp}`);
        console.log(`current blcok timestamp ->: ${(await hre.ethers.provider.getBlock("latest")).timestamp}`);

        const lpBal = await fundingpoolAdapter.lpBalance(dao.address);
        console.log(`lp balance: ${hre.ethers.utils.formatEther(lpBal)}`);
        //start Voting Process
        await distributeFundContract.startVotingProcess(dao.address, proposalId);

        distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        console.log(`distributions status: ${distriInfo.status}`);
        expect(distriInfo.status).equal(4);// failed
    });

    it("should be impossble to vote for proposal if proposal start voting failed",async()=>{
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

        await expectRevert(this.gpvoting.submitVote(dao.address, this.proposalId, 1),"revert") ;

    });

    it("should be impossible to start voting fund raise proposal if previous one not finalized",async()=>{
        const project_team2 = this.project_team2.address;
        const project_team1 = this.project_team1.address;
        const dao = this.dao;
        const fundingpoolAdapter = this.fundingpoolAdapter;
        const riceStakingAdapter = this.riceStakingAdapter;
        const fundingPoolExt = this.fundingPoolExt;
        const gpdaoExt = this.gpdaoExt;
        const distributeFundContract = this.distributefund;
        // const streamingPaymentContract = this.streamingPayment;
        
        // Submit distribute proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("3000");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
   
        const vestingStartTime = blocktimestamp + 24 ;
        const vestingcliffDuration=  oneWeek;
        const stepDuration=oneDay;
        const steps=7;
        const stepPercentage=hre.ethers.utils.parseEther("1").div(toBN(steps));

        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = this.testtoken2.address;

        await this.testtoken2.transfer(this.project_team1.address, toBN(tradingOffTokenAmount).mul(toBN("2")));
        await this.testtoken2.connect(this.project_team1).approve(distributeFundContract.address, toBN(tradingOffTokenAmount).mul(toBN("2")));

        let  proposalId  = await createDistributeFundsProposal(
            dao,
            distributeFundContract,
            requestedFundAmount,
            tradingOffTokenAmount,
            vestingStartTime,
            vestingcliffDuration,
            stepDuration,
            steps,
            stepPercentage,
            projectTeamAddr,
            projectTeamTokenAddr,
            projectTeamAddr,
            this.owner
        );
        console.log(`proposalId1: ${hre.ethers.utils.toUtf8String(proposalId.proposalId)}`);
        this.proposalId1 = proposalId.proposalId;

        proposalId  = await createDistributeFundsProposal(
            dao,
            distributeFundContract,
            requestedFundAmount,
            tradingOffTokenAmount,
            vestingStartTime,
            vestingcliffDuration,
            stepDuration,
            steps,
            stepPercentage,
            projectTeamAddr,
            projectTeamTokenAddr,
            projectTeamAddr,
            this.owner
        );
        console.log(`proposalId2: ${hre.ethers.utils.toUtf8String(proposalId.proposalId)}`);
        this.proposalId2 = proposalId.proposalId;

        let distriInfo1 = await distributeFundContract.distributions(dao.address, this.proposalId1);
        let distriInfo2 = await distributeFundContract.distributions(dao.address, this.proposalId2 );

        //start Voting Process
        await distributeFundContract.startVotingProcess(dao.address, this.proposalId1);
        distriInfo1 = await distributeFundContract.distributions(dao.address, this.proposalId1);
        console.log(`proposal state: ${distriInfo1.status}`);
        let projectTeamLockedTokenAmount = await distributeFundContract.projectTeamLockedTokens(dao.address,   this.proposalId1, projectTeamAddr);
        console.log(`projectTeam Locked Token Amount ${hre.ethers.utils.formatEther(projectTeamLockedTokenAmount)}`);
        // owner Vote YES on the proposal
        await this.gpvoting.submitVote(dao.address, this.proposalId1, 1);
        // gp1 Vote YES on the proposal
        await this.gpvoting.connect(this.gp1).submitVote(dao.address, this.proposalId1, 1);
        // gp2 Vote YES on the proposal
        await this.gpvoting.connect(this.gp2).submitVote(dao.address, this.proposalId1, 1);
         //start Voting Process
        await expectRevert( distributeFundContract.startVotingProcess(dao.address, this.proposalId2),"revert");
    });

    it("should be impossible to process proposal not in sequence", async()=>{
        const project_team2 = this.project_team2.address;
        const project_team1 = this.project_team1.address;
        const dao = this.dao;
        const fundingpoolAdapter = this.fundingpoolAdapter;
        const riceStakingAdapter = this.riceStakingAdapter;
        const fundingPoolExt = this.fundingPoolExt;
        const gpdaoExt = this.gpdaoExt;
        const distributeFundContract = this.distributefund;
        // const streamingPaymentContract = this.streamingPayment;
        
        await expectRevert(distributeFundContract.processProposal(dao.address, this.proposalId2), "revert");
    });

    it("cant start voting proposal if hit redempt duration", async()=>{
        const project_team1 = this.project_team1.address;
        const dao = this.dao;
        const fundingpoolAdapter = this.fundingpoolAdapter;
        const riceStakingAdapter = this.riceStakingAdapter;
        const fundingPoolExt = this.fundingPoolExt;
        // const riceStakingExt = this.riceStakingExt;
        const gpdaoExt = this.gpdaoExt;
        const distributeFundContract = this.distributefund;
        // const streamingPaymentContract = this.streamingPayment;
        
        // Submit distribute proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("300");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("500");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
       
        
        const vestingStartTime = blocktimestamp + 24 ;
        const vestingcliffDuration=  oneWeek;
        const stepDuration=oneDay;
        const steps=7;
        const stepPercentage=hre.ethers.utils.parseEther("1").div(toBN(steps));

        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = this.testtoken2.address;
        const GPAddr= await dao.getAddressConfiguration(sha3("GP_ADDRESS"));
        const managementFeeRatio= await dao.getConfiguration(sha3("MANAGEMENT_FEE"))
        const proposalExecuteDuration= await dao.getConfiguration(sha3("PROPOSAL_EXECUTE_DURATION"))

        let distriInfo1 = await distributeFundContract.distributions(dao.address, this.proposalId1);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo1.proposalStopVotingTimestamp)]);
        await hre.network.provider.send("evm_mine");
        await distributeFundContract.processProposal(dao.address, this.proposalId1);
        await distributeFundContract.startVotingProcess(dao.address, this.proposalId2);
        let distriInfo2 = await distributeFundContract.distributions(dao.address, this.proposalId2);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo2.proposalStopVotingTimestamp)]);
        await hre.network.provider.send("evm_mine");
        await distributeFundContract.processProposal(dao.address, this.proposalId2);


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
            stepPercentage,
            projectTeamAddr,
            projectTeamTokenAddr,
            projectTeamAddr,
            this.owner
        );
        console.log(`proposalId: ${hre.ethers.utils.toUtf8String(proposalId)}`);
        this.proposalId = proposalId;

        const rel = await fundingpoolAdapter.latestRedempteTime(dao.address);
        console.log(` ${rel}
                    latest redempt start time :${rel[0]}, 
                    latest redempt end time :${rel[1]}
        `);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(rel[0])]);
        await hre.network.provider.send("evm_mine");
        //start Voting Process
        await expectRevert(distributeFundContract.startVotingProcess(dao.address, this.proposalId),"revert");
    });

    it("should be possible start voting proposal if not hit redempt duration", async()=>{
        const project_team1 = this.project_team1.address;
        const dao = this.dao;
        const fundingpoolAdapter = this.fundingpoolAdapter;
        const riceStakingAdapter = this.riceStakingAdapter;
        const fundingPoolExt = this.fundingPoolExt;
        // const riceStakingExt = this.riceStakingExt;
        const gpdaoExt = this.gpdaoExt;
        const distributeFundContract = this.distributefund;
        // const streamingPaymentContract = this.streamingPayment;
        
        // Submit distribute proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("300");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("500");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const lockupDate = blocktimestamp + 24;
        const fullyReleasedDate = lockupDate + 1000;
        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = this.testtoken2.address;
        const GPAddr= await dao.getAddressConfiguration(sha3("GP_ADDRESS"));
        const managementFeeRatio= await dao.getConfiguration(sha3("MANAGEMENT_FEE"))
        const proposalExecuteDuration= await dao.getConfiguration(sha3("PROPOSAL_EXECUTE_DURATION"))

        const rel = await fundingpoolAdapter.latestRedempteTime(dao.address);
        console.log(` ${rel}
                    latest redempt start time :${rel[0]}, 
                    latest redempt end time :${rel[1]}
        `);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(rel[1])]);
        await hre.network.provider.send("evm_mine");

        let distriInfo = await distributeFundContract.distributions(dao.address, this.proposalId);
        expect(distriInfo.status).equal(0);//in queue state
        //start Voting Process
        await distributeFundContract.startVotingProcess(dao.address, this.proposalId);
        distriInfo = await distributeFundContract.distributions(dao.address, this.proposalId);
        expect(distriInfo.status).equal(1);// in voting state


        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStopVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        await distributeFundContract.processProposal(dao.address, this.proposalId);
    });

    it("cant in voting process if project token not approved",async()=>{
        const dao = this.dao;
        const distributeFundContract = this.distributefund;

        // Submit distribute proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("300");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("500");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
 
        const vestingStartTime = blocktimestamp + 24 ;
        const vestingcliffDuration=  oneWeek;
        const stepDuration=oneDay;
        const steps=7;
        const stepPercentage=hre.ethers.utils.parseEther("1").div(toBN(steps));

        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = this.testtoken2.address;
        const GPAddr= await dao.getAddressConfiguration(sha3("GP_ADDRESS"));
        const managementFeeRatio= await dao.getConfiguration(sha3("MANAGEMENT_FEE"))
        const proposalExecuteDuration= await dao.getConfiguration(sha3("PROPOSAL_EXECUTE_DURATION"))

        await this.testtoken2.transfer(this.project_team1.address, tradingOffTokenAmount);
        // await this.testtoken2.connect(this.project_team1).approve(distributeFundContract.address, tradingOffTokenAmount);

        let { proposalId } = await createDistributeFundsProposal(
            dao,
            distributeFundContract,
            requestedFundAmount,
            tradingOffTokenAmount,
            vestingStartTime,
            vestingcliffDuration,
            stepDuration,
            steps,
            stepPercentage,
            projectTeamAddr,
            projectTeamTokenAddr,
            projectTeamAddr,
            this.owner
        );

        this.proposalId=proposalId;

        await distributeFundContract.startVotingProcess(dao.address, this.proposalId);
        let distriInfo = await distributeFundContract.distributions(dao.address, this.proposalId);
        expect(distriInfo.status).equal(4);// failed.

    });

    it("cant in voting process if project token not enough",async()=>{
        const dao = this.dao;
        const distributeFundContract = this.distributefund;

        // Submit distribute proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("300");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const vestingStartTime = blocktimestamp + 24 ;
        const vestingcliffDuration=  oneWeek;
        const stepDuration=oneDay;
        const steps=7;
        const stepPercentage=hre.ethers.utils.parseEther("1").div(toBN(steps));

        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = this.testtoken2.address;
        const GPAddr= await dao.getAddressConfiguration(sha3("GP_ADDRESS"));
        const managementFeeRatio= await dao.getConfiguration(sha3("MANAGEMENT_FEE"))
        const proposalExecuteDuration= await dao.getConfiguration(sha3("PROPOSAL_EXECUTE_DURATION"))

        // await this.testtoken2.transfer(this.project_team1.address, tradingOffTokenAmount);
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
            stepPercentage,
            projectTeamAddr,
            projectTeamTokenAddr,
            projectTeamAddr,
            this.owner
        );

        this.proposalId=proposalId;

        await distributeFundContract.startVotingProcess(dao.address, this.proposalId);
        let  distriInfo = await distributeFundContract.distributions(dao.address, this.proposalId);
        expect(distriInfo.status).equal(4);// failed.
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
        // this.stakingRiceAdapter = this.adapters.ricestakingAdapter.instance;
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

        //gp deposit funds
        await depositToFundingPool(this.fundingpoolAdapter, dao, this.owner, hre.ethers.utils.parseEther("1000"), this.testtoken1);

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

        // const fundRaisingWindwoEndTime = await dao.getConfiguration(sha3("FUND_RAISING_WINDOW_END"));
        // await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaisingWindwoEndTime) + 1]);
        // await hre.network.provider.send("evm_mine");
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
        // const riceStakingExt = this.riceStakingExt;
        const gpdaoExt = this.gpdaoExt;
        const distributeFundContract = this.distributefund;
        // const streamingPaymentContract = this.streamingPayment;

        // Submit distribute proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("3800");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const vestingStartTime = blocktimestamp + 24 ;
        const vestingcliffDuration=  oneWeek;
        const stepDuration=oneDay;
        const steps=7;
        const stepPercentage=hre.ethers.utils.parseEther("1").div(toBN(steps));

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
            stepPercentage,
            projectTeamAddr,
            projectTeamTokenAddr,
            projectTeamAddr,
            this.owner
        );
        console.log(`new proposalID ${hre.ethers.utils.toUtf8String(proposalId)}`);
        this.proposalId = proposalId;

        let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        // await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStartVotingTimestamp) + 1])
        // await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        //start Voting Process
        await distributeFundContract.startVotingProcess(dao.address, this.proposalId);
        distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
        console.log(`distributions status: ${distriInfo.status}`);

        const voteInfo = await this.gpvoting.votes(dao.address, this.proposalId);
        console.log(`start voting time of proposal ${hre.ethers.utils.toUtf8String(this.proposalId)} : ${voteInfo.startingTime}`);

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
        expect(distirbuteStatus).equal(4);
    });

    it("Vote in SUPERMAJORITY_QUORUM_REQUIRED model - yes votes greater than supermajority && voters less than quorum", async () => {
        const project_team1 = this.project_team1.address;
        const dao = this.dao;
        const fundingpoolAdapter = this.fundingpoolAdapter;
        const riceStakingAdapter = this.riceStakingAdapter;
        const fundingPoolExt = this.fundingPoolExt;
        // const riceStakingExt = this.riceStakingExt;
        const gpdaoExt = this.gpdaoExt;
        const distributeFundContract = this.distributefund;
        // const streamingPaymentContract = this.streamingPayment;

        // Submit distribute proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("3800");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const vestingStartTime = blocktimestamp + 24 ;
        const vestingcliffDuration=  oneWeek;
        const stepDuration=oneDay;
        const steps=7;
        const stepPercentage=hre.ethers.utils.parseEther("1").div(toBN(steps));


        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = this.testtoken2.address;

        // await this.testtoken1.transfer(this.gp1.address, hre.ethers.utils.parseEther("200000"));
        // await depositToFundingPool(this.fundingpoolAdapter, dao, this.gp1, hre.ethers.utils.parseEther("200000"), this.testtoken1);
        // await fundingpoolAdapter.connect(this.gp2).withdraw(dao.address, hre.ethers.utils.parseEther("10000"));
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
            stepPercentage,
            projectTeamAddr,
            projectTeamTokenAddr,
            projectTeamAddr,
            this.owner
        );
        console.log(`new proposalID ${hre.ethers.utils.toUtf8String(proposalId)}`);

        this.proposalId = proposalId;

       
        // await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStartVotingTimestamp) + 1])
        // await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        //start Voting Process
        await distributeFundContract.startVotingProcess(dao.address, this.proposalId);
        const voteInfo = await this.gpvoting.votes(dao.address, this.proposalId);
        console.log(`start voting time of proposal ${this.proposalId} : ${voteInfo.startingTime}`);
        let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
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
        expect(distirbuteStatus).equal(4);
    });

    it("Vote in SUPERMAJORITY_QUORUM_REQUIRED model - yes votes less than supermajority && voters greater than quorum", async () => {
        const project_team1 = this.project_team1.address;
        const dao = this.dao;
        const fundingpoolAdapter = this.fundingpoolAdapter;
        const riceStakingAdapter = this.riceStakingAdapter;
        const fundingPoolExt = this.fundingPoolExt;
        // const riceStakingExt = this.riceStakingExt;
        const gpdaoExt = this.gpdaoExt;
        const distributeFundContract = this.distributefund;
        // const streamingPaymentContract = this.streamingPayment;

        // Submit distribute proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("3800");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const vestingStartTime = blocktimestamp + 24 ;
        const vestingcliffDuration=  oneWeek;
        const stepDuration=oneDay;
        const steps=7;
        const stepPercentage=hre.ethers.utils.parseEther("1").div(toBN(steps));

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
            stepPercentage,
            projectTeamAddr,
            projectTeamTokenAddr,
            projectTeamAddr,
            this.owner
        );
        console.log(`new proposalID ${hre.ethers.utils.toUtf8String(proposalId)}`);

        this.proposalId = proposalId;
        // await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(distriInfo.proposalStartVotingTimestamp) + 1])
        // await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        //start Voting Process
        await distributeFundContract.startVotingProcess(dao.address, this.proposalId);
        const voteInfo = await this.gpvoting.votes(dao.address, this.proposalId);
        console.log(`start voting time of proposal ${this.proposalId} : ${voteInfo.startingTime}`);
        let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);
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
        expect(distirbuteStatus).equal(4);
    });

    it("Vote in SUPERMAJORITY_QUORUM_REQUIRED model - yes votes greater than supermajority && voters greater than quorum", async () => {
        const project_team1 = this.project_team1.address;
        const dao = this.dao;
        const fundingpoolAdapter = this.fundingpoolAdapter;
        const riceStakingAdapter = this.riceStakingAdapter;
        const fundingPoolExt = this.fundingPoolExt;
        // const riceStakingExt = this.riceStakingExt;
        const gpdaoExt = this.gpdaoExt;
        const distributeFundContract = this.distributefund;
        // const streamingPaymentContract = this.streamingPayment;

        // Submit distribute proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("3800");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
 
        const vestingStartTime = blocktimestamp + 24 ;
        const vestingcliffDuration=  oneWeek;
        const stepDuration=oneDay;
        const steps=7;
        const stepPercentage=hre.ethers.utils.parseEther("1").div(toBN(steps));

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
            stepPercentage,
            projectTeamAddr,
            projectTeamTokenAddr,
            projectTeamAddr,
            this.owner
        );
        console.log(`new proposalID ${hre.ethers.utils.toUtf8String(proposalId)}`);

        this.proposalId = proposalId;

        //start Voting Process
        await distributeFundContract.startVotingProcess(dao.address, this.proposalId);
        const voteInfo = await this.gpvoting.votes(dao.address, this.proposalId);
        console.log(`start voting time of proposal ${this.proposalId} : ${voteInfo.startingTime}`);
        let distriInfo = await distributeFundContract.distributions(dao.address, proposalId);

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
        expect(distirbuteStatus).equal(3);
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