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

        await depositToFundingPool(this.fundingpoolAdapter, dao, owner, hre.ethers.utils.parseEther("20000"), this.testtoken1);
    });

    beforeEach(async () => {
        await revertChainSnapshot(this.snapshotId);
        this.snapshotId = await takeChainSnapshot();
    });


    const depositToFundingPool = async (
        fundingpoolAdapter,
        dao,
        investor,
        amount,
        token) => {
        // console.log(`FUND_RAISING_WINDOW_BEGIN: ${(await dao.getConfiguration(sha3("FUND_RAISING_WINDOW_BEGIN")))}`);
        // console.log(`FUND_RAISING_WINDOW_END: ${(await dao.getConfiguration(sha3("FUND_RAISING_WINDOW_END")))}`);

        // let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        // console.log(`current blocktimestamp: ${blocktimestamp}`);

        await token.connect(investor).approve(fundingpoolAdapter.address, amount);
        await fundingpoolAdapter.connect(investor).deposit(dao.address, amount);
        console.log(`
            ${investor.address} deposit ${amount.toString()}
        `);
    };

    it("should be impossible submit a fund raise proposal by non GP", async () => {
        const fundRaiseAdapter = this.adapters.fundRaiseAdapter.instance;
        const dao = this.dao;
        await expectRevert(fundRaiseAdapter.connect(this.user1).submitProposal(dao.address, [0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0]), "revert");
    })

    it("should be possible GP to submit a fund raise proposal", async () => {
        const fundRaiseAdapter = this.adapters.fundRaiseAdapter.instance;
        const gpOnboardVotingAdatper = this.adapters.gpOnboardVotingAdapter.instance;
        const gpDaoExt = this.extensions.gpDaoExt.functions;
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
            2600000
        ];
        const _uint256ArgsFeeInfo = [
            5,
            2,
            5,
            3
        ];

        const lastFundEndTime = await dao.getConfiguration(sha3("FUND_END_TIME"));
        if (parseInt(lastFundEndTime) > currentblocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(lastFundEndTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }


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
        console.log(newFundEndTime);
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
