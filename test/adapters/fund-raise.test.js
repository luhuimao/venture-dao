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
    DAOSQUARE_TREASURY,
    oneDay,
    oneWeek,
    twoWeeks,
    oneMonth,
    threeMonthes,
} = require("../../utils/contract-util");
const proposalCounter = proposalIdGenerator().generator;

const { checkBalance, depositToFundingPool, createDistributeFundsProposal } = require("../../utils/test-util");
const hre = require("hardhat");


describe("Adapter - FundRaise", () => {
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
        this.fundingpoolAdapter = this.adapters.fundingpoolAdapter.instance;
        this.gpvoting = this.adapters.gpVotingAdapter.instance;
        this.distributefund = this.adapters.distributeFundAdapterv2.instance;
        this.fundingPoolExt = this.extensions.fundingpoolExt.functions;

        this.testtoken2 = testContracts.testToken2.instance
        await depositToFundingPool(this.fundingpoolAdapter, dao, owner, hre.ethers.utils.parseEther("20000"), this.testtoken1);
    });

    beforeEach(async () => {
        await revertChainSnapshot(this.snapshotId);
        this.snapshotId = await takeChainSnapshot();
    });

    it("should be impossible submit a fund raise proposal by non GP", async () => {
        const fundRaiseAdapter = this.adapters.fundRaiseAdapter.instance;
        const dao = this.dao;
        await expectRevert(fundRaiseAdapter.connect(this.user1).submitProposal(dao.address, [0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0]), "revert");
    })

    it("should be possible for GP to submit a fund raise proposal if previous fund finished", async () => {
        const fundRaiseAdapter = this.adapters.fundRaiseAdapter.instance;
        const gpOnboardVotingAdatper = this.adapters.gpOnboardVotingAdapter.instance;
        const gpDaoExt = this.extensions.gpDaoExt.functions;
        const dao = this.dao;
        const fundingPoolAdapter = this.fundingpoolAdapter;

        let fundRaiseTarget = hre.ethers.utils.parseEther("10000");
        let fundRaiseMaxAmount = hre.ethers.utils.parseEther("10000000");
        let lpMinDepositAmount = hre.ethers.utils.parseEther("100");
        let lpMaxDepositAmount = hre.ethers.utils.parseEther("100000");
        const _uint256ArgsProposal = [
            fundRaiseTarget,
            fundRaiseMaxAmount,
            lpMinDepositAmount,
            lpMaxDepositAmount
        ];
        let currentblocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        let fundRaiseStartTime = currentblocktimestamp;
        let fundRaiseEndTime = currentblocktimestamp + oneMonth;
        let fundTerm = 60 * 60;
        let redemptPeriod = 60 * 10;
        let redemptDuration = 60;
        let returnDuration = threeMonthes;
        const _uint256ArgsTimeInfo = [
            fundRaiseStartTime,
            fundRaiseEndTime,
            fundTerm,
            redemptPeriod,
            redemptDuration,
            returnDuration
        ];
        let proposerRewardRatio = 5;
        let managementFeeRatio = 2;
        let redepmtFeeRatio = 5;
        let protocolFeeRatio = 3;
        const _uint256ArgsFeeInfo = [
            proposerRewardRatio,
            managementFeeRatio,
            redepmtFeeRatio,
            protocolFeeRatio
        ];

        const lastFundEndTime = await fundingPoolAdapter.getFundEndTime(dao.address);
        const lastreturnDuration = await fundingPoolAdapter.getFundReturnDuration(dao.address);
        let fundRaiseState = await fundingPoolAdapter.fundRaisingState();
        const lastfundRaiseTarget = await fundingPoolAdapter.getFundRaisingTarget(dao.address);
        const lastfundRaiseCloseTime = await fundingPoolAdapter.getFundRaiseWindowCloseTime(dao.address);
        const totalFund = await fundingPoolAdapter.lpBalance(dao.address);
        console.log(`
        fund raise state ${fundRaiseState}
        fund raise target ${hre.ethers.utils.formatEther(lastfundRaiseTarget.toString())}
        total fund ${hre.ethers.utils.formatEther(totalFund.toString())}
        fund raise close time ${lastfundRaiseCloseTime}
        current block time ${currentblocktimestamp}
        `);

        if (parseInt(lastFundEndTime) > currentblocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(lastFundEndTime) + parseInt(lastreturnDuration) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        await fundingPoolAdapter.processFundRaise(dao.address);

        let tx = await fundRaiseAdapter.submitProposal(dao.address, _uint256ArgsProposal, _uint256ArgsTimeInfo, _uint256ArgsFeeInfo);
        const result = await tx.wait();
        const newProposalId = result.events[result.events.length - 1].args.proposalId;
        console.log(`newProposalId: ${hre.ethers.utils.toUtf8String(newProposalId)}`);

        const proposalInfo = await fundRaiseAdapter.Proposals(dao.address, newProposalId);


        console.log(`
        acceptTokenAddr ${proposalInfo.acceptTokenAddr}
        fundRaiseTarget ${hre.ethers.utils.formatEther(proposalInfo.fundRaiseTarget.toString())}
        fundRaiseMaxAmount ${hre.ethers.utils.formatEther(proposalInfo.fundRaiseMaxAmount.toString())}
        lpMinDepositAmount ${hre.ethers.utils.formatEther(proposalInfo.lpMinDepositAmount.toString())}
        lpMaxDepositAmount ${hre.ethers.utils.formatEther(proposalInfo.lpMaxDepositAmount.toString())}

        fundRaiseStartTime ${proposalInfo.timesInfo.fundRaiseStartTime}
        fundRaiseEndTime ${proposalInfo.timesInfo.fundRaiseEndTime}
        fundTerm ${proposalInfo.timesInfo.fundTerm}
        redemptPeriod ${proposalInfo.timesInfo.redemptPeriod}
        redemptDuration ${proposalInfo.timesInfo.redemptDuration}
        returnDuration ${proposalInfo.timesInfo.returnDuration}


        proposerRewardRatio ${proposalInfo.feeInfo.proposerRewardRatio}
        managementFeeRatio ${proposalInfo.feeInfo.managementFeeRatio}
        redepmtFeeRatio ${proposalInfo.feeInfo.redepmtFeeRatio}
        protocolFeeRatio ${proposalInfo.feeInfo.protocolFeeRatio}
        `);


        await this.gpvoting.submitVote(dao.address, newProposalId, 1);

        const voteDuration = await dao.getConfiguration(sha3("distributeFund.proposalDuration"));
        const voteInfo = await this.gpvoting.votes(dao.address, newProposalId);
        console.log(voteDuration.toString());
        console.log(voteInfo.startingTime.toString());

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(voteInfo.startingTime) + parseInt(voteDuration) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        await fundRaiseAdapter.processProposal(dao.address, newProposalId);
        const newFundEndTime = await dao.getConfiguration(sha3("FUND_END_TIME"));
        let maxAmount = await fundingPoolAdapter.getFundRaisingMaxAmount(dao.address);
        console.log(`
        fund end time ${newFundEndTime}
        fund raise max amount ${hre.ethers.utils.formatEther(maxAmount.toString())}
        `);
        console.log(newFundEndTime);



        await depositToFundingPool(fundingPoolAdapter, dao, this.owner, hre.ethers.utils.parseEther("20000"), this.testtoken1);
    })

    it("should be possible to submit a funding proposal in investing period", async () => {
        const dao = this.dao;
        const distributeFundContract = this.distributefund;
        const fundingPoolAdaptContract = this.fundingpoolAdapter;
        const requestedFundAmount = hre.ethers.utils.parseEther("30000");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("50000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        // const lockupDate = blocktimestamp + 24;
        // const fullyReleasedDate = lockupDate + 1000;

        const vestingStartTime = blocktimestamp + 24;
        const vestingcliffDuration = oneWeek;
        const stepDuration = oneDay;
        const steps = 7;
        const stepPercentage = hre.ethers.utils.parseEther("1").div(toBN(steps));

        const projectTeamAddr = this.user1.address;
        const projectTeamTokenAddr = this.testtoken2.address;

        const fundStartTime = await fundingPoolAdaptContract.getFundStartTime(dao.address);
        const fundStopTime = await fundingPoolAdaptContract.getFundEndTime(dao.address);

        await this.testtoken2.transfer(this.user1.address, tradingOffTokenAmount);
        await this.testtoken2.connect(this.user1).approve(distributeFundContract.address, tradingOffTokenAmount);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundStartTime) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const fundRaiseTarget = await fundingPoolAdaptContract.getFundRaisingTarget(dao.address);
        const totalFund = await fundingPoolAdaptContract.lpBalance(dao.address);
        console.log(`
        fund start time ${fundStartTime.toString()}
        fund end time ${fundStopTime.toString()}
        current time ${blocktimestamp}
        fund raise target ${hre.ethers.utils.formatEther(fundRaiseTarget.toString())}
        total fund ${hre.ethers.utils.formatEther(totalFund.toString())}
        `);
        let { proposalId } = await createDistributeFundsProposal(dao,
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
            this.owner);

    })



    it("should be impossible to summit a fund raise proposal if pre-fund not finish", async () => {
        const fundRaiseAdapter = this.adapters.fundRaiseAdapter.instance;
        const dao = this.dao;

        const _uint256ArgsProposal = [
            hre.ethers.utils.parseEther("10000"),
            0,
            hre.ethers.utils.parseEther("100"),
            0
        ];
        let currentblocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const _uint256ArgsTimeInfo = [
            currentblocktimestamp,
            currentblocktimestamp + 600,
            60 * 60,
            60 * 10,
            60,
            6000
        ];
        const _uint256ArgsFeeInfo = [
            5,
            2,
            5,
            3
        ];

        const lastFundEndTime = await dao.getConfiguration(sha3("FUND_END_TIME"));
        console.log(lastFundEndTime);
        const lastFundReturnDuration = await dao.getConfiguration(sha3("RETURN_DURATION"));
        console.log(lastFundReturnDuration);

        console.log(`pre fund return time ${parseInt(lastFundEndTime) + parseInt(lastFundReturnDuration)}
        current block time ${currentblocktimestamp}
        `);
        // if (parseInt(lastFundEndTime) > currentblocktimestamp) {
        //     await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(lastFundEndTime) + 1])
        //     await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        // }

        await expectRevert(fundRaiseAdapter.submitProposal(dao.address, _uint256ArgsProposal, _uint256ArgsTimeInfo, _uint256ArgsFeeInfo), "revert");

        // let tx = await fundRaiseAdapter.submitProposal(dao.address, _uint256ArgsProposal, _uint256ArgsTimeInfo, _uint256ArgsFeeInfo);
        // const result = await tx.wait();
    })

});
