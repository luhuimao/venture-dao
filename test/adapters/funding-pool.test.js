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

        console.log(`FUND_RAISING_WINDOW_BEGIN: ${(await dao.getConfiguration(sha3("FUND_RAISING_WINDOW_BEGIN")))}`);
        console.log(`FUND_RAISING_WINDOW_END: ${(await dao.getConfiguration(sha3("FUND_RAISING_WINDOW_END")))}`);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        console.log(`current block timestamp: ${blocktimestamp}`);

        await token.connect(investor).approve(fundingpoolAdapter.address, amount);
        await fundingpoolAdapter.connect(investor).deposit(dao.address, amount);


        console.log(`balance in fund pool: ${hre.ethers.utils.formatEther(await fundingpoolAdapter.balanceOf(
            dao.address, investor.address))}`);
    };

    it("should be possible to deposit funds to the fundingpool during fundraise window", async () => {
        const fundingpoolAdapter = this.fundingpoolAdapter;
        const dao = this.dao;
        const testtoken1 = this.testtoken1;
        const fundingPoolExt = this.extensions.fundingpoolExt.functions;
        const gpdaoExt = this.gpdaoExt;

        await testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("2000"));
        console.log("user1 test token balance: ", hre.ethers.utils.formatEther(await testtoken1.balanceOf(this.user1.address)).toString());
        await depositToFundingPool(fundingpoolAdapter, dao, this.user1, hre.ethers.utils.parseEther("1000"), testtoken1);
        await depositToFundingPool(fundingpoolAdapter, dao, this.user1, hre.ethers.utils.parseEther("1000"), testtoken1);

        console.log(`test usdt bal in fund pool: ${hre.ethers.utils.formatEther((await testtoken1.balanceOf(this.extensions.fundingpoolExt.address)))}`);
        console.log("user1 test token balance: ", hre.ethers.utils.formatEther(await testtoken1.balanceOf(this.user1.address)).toString());
        console.log(`total fund: ${hre.ethers.utils.formatEther((await fundingpoolAdapter.lpBalance(dao.address)))}`);
        expect(parseInt(hre.ethers.utils.formatEther(await fundingpoolAdapter.balanceOf(
            dao.address, this.user1.address)))).equal(2000);
    })

    it("should be impossible to withdraw funds from the fundingpool during fundraise window", async () => {
        const fundingpoolAdapter = this.adapters.fundingpoolAdapter.instance;
        const dao = this.dao;
        const testtoken1 = this.testContracts.testToken1.instance;
        const fundingPoolExt = this.extensions.fundingpoolExt.functions;
        const gpdaoExt = this.extensions.gpDaoExt.functions;

        await expectRevert(fundingpoolAdapter.connect(this.user1).withdraw(dao.address, hre.ethers.utils.parseEther("10")), "revert");
    })

    it("should be impossible total funds greater than Fundraise max amount ", async () => {
        const fundingpoolAdapter = this.fundingpoolAdapter;
        const dao = this.dao;
        const testtoken2 = this.testContracts.testToken2.instance;
        const distributeFundAdapter = this.adapters.distributeFundAdapterv2.instance;
        const fundingPoolExt = this.extensions.fundingpoolExt.functions;
        const testtoken1 = this.testtoken1;

        const fundRaisingMaxAmount = await fundingpoolAdapter.getFundRaisingMaxAmount(dao.address);
        const totalValidFund = await fundingPoolExt.totalSupply();
        console.log(`fundRaisingMaxAmount: ${fundRaisingMaxAmount} totalValidFund: ${totalValidFund}`);
        await expectRevert(depositToFundingPool(fundingpoolAdapter, dao, this.owner, toBN(fundRaisingMaxAmount.toString()).sub(toBN(totalValidFund.toString())), testtoken1), "revert");
    });

    it("should be not allow investor to deposit funds less than min investment amount for lp", async () => {
        const fundingpoolAdapter = this.adapters.fundingpoolAdapter.instance;
        const dao = this.dao;
        const testtoken1 = this.testContracts.testToken1.instance;
        const testtoken2 = this.testContracts.testToken2.instance;
        const distributeFundAdapter = this.adapters.distributeFundAdapterv2.instance;
        const fundingPoolExt = this.extensions.fundingpoolExt.functions;

        const minInvestmentAmountForLP = await fundingpoolAdapter.getMinInvestmentForLP(dao.address);
        console.log(`min Investment Amount For LP: ${hre.ethers.utils.formatEther(minInvestmentAmountForLP.toString())}`);
        await expectRevert(depositToFundingPool(fundingpoolAdapter, dao, this.owner, hre.ethers.utils.parseEther("100"), testtoken1), "revert");

    });
});


describe("Adapter - Fund Raising Failed", () => {
    before("deploy dao", async () => {
        let [owner, user1, user2, project_team1] = await hre.ethers.getSigners();
        this.owner = owner;
        this.user1 = user1;
        this.user2 = user2;
        this.project_team1 = project_team1;

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

        console.log(`FUND_RAISING_WINDOW_BEGIN: ${(await dao.getConfiguration(sha3("FUND_RAISING_WINDOW_BEGIN")))}`);
        console.log(`FUND_RAISING_WINDOW_END: ${(await dao.getConfiguration(sha3("FUND_RAISING_WINDOW_END")))}`);

        await token.connect(investor).approve(fundingpoolAdapter.address, amount);
        await fundingpoolAdapter.connect(investor).deposit(dao.address, amount);

        console.log(`balance in fund pool: ${hre.ethers.utils.formatEther(await fundingpoolAdapter.balanceOf(
            dao.address, investor.address))}`);
    };

    it("fund raise should fail if totoal fund didt meet the target", async () => {
        const fundingpoolAdapter = this.adapters.fundingpoolAdapter.instance;
        const dao = this.dao;
        const testtoken1 = this.testContracts.testToken1.instance;
        const testtoken2 = this.testContracts.testToken2.instance;
        const distributeFundAdapter = this.adapters.distributeFundAdapterv2.instance;
        const fundingPoolExt = this.extensions.fundingpoolExt.functions;

        const fundRaisingTarget = await fundingpoolAdapter.getFundRaisingTarget(dao.address);
        console.log(`fund Raising Target: ${hre.ethers.utils.formatEther(fundRaisingTarget.toString())}`);

        const fundRaisingWindwoEndTime = await dao.getConfiguration(sha3("FUND_RAISING_WINDOW_END"));

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaisingWindwoEndTime) + 1]);
        await hre.network.provider.send("evm_mine");

        await fundingPoolExt.processFundRaising();

        expect((await fundingPoolExt.fundRaisingState())[0]).equal(2);
    });

    it("should be possible to withdraw fund if fund raising failed", async () => {
        const fundingpoolAdapter = this.adapters.fundingpoolAdapter.instance;
        const dao = this.dao;
        const testtoken1 = this.testContracts.testToken1.instance;

        const bal_usdt1 = await testtoken1.balanceOf(this.owner.address);
        const bal_fundPool1 = await fundingpoolAdapter.balanceOf(dao.address, this.owner.address);

        await fundingpoolAdapter.withdraw(dao.address, hre.ethers.utils.parseEther("100"));

        const bal_usdt2 = await testtoken1.balanceOf(this.owner.address);
        const bal_fundPool2 = await fundingpoolAdapter.balanceOf(dao.address, this.owner.address);
        console.log(`USDT balance: ${hre.ethers.utils.formatEther(bal_usdt2.toString())}`);
        console.log(`balance if fund pool: ${hre.ethers.utils.formatEther(bal_fundPool2.toString())}`);

        expect(toBN(bal_usdt2.toString()).sub(toBN(bal_usdt1.toString()))).equal(toBN(bal_fundPool1.toString()).sub(toBN(bal_fundPool2.toString())));
    });

    it("should be impossible to withdraw fund amount exceed your balance in fund pool if fund raising failed", async () => {
        const fundingpoolAdapter = this.adapters.fundingpoolAdapter.instance;
        const dao = this.dao;

        const bal_fundPool1 = await fundingpoolAdapter.balanceOf(dao.address, this.owner.address);

        await expectRevert(fundingpoolAdapter.withdraw(dao.address, toBN(bal_fundPool1.toString()).add(toBN("1"))), "revert");
    });
});


describe("Adapter - Fund Raising Succeed", () => {
    before("deploy dao", async () => {
        let [owner, user1, user2, project_team1, DAOSquare, GP] = await hre.ethers.getSigners();
        this.owner = owner;
        this.user1 = user1;
        this.user2 = user2;
        this.project_team1 = project_team1;
        this.DAOSquare = DAOSquare;
        this.GP = GP;
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

        await token.connect(investor).approve(fundingpoolAdapter.address, amount);
        await fundingpoolAdapter.connect(investor).deposit(dao.address, amount);

        console.log(`balance in fund pool: ${hre.ethers.utils.formatEther(await fundingpoolAdapter.balanceOf(
            dao.address, investor.address))}`);
    };

    it("fund raise should succeed if totoal fund meet the target", async () => {
        const fundingpoolAdapter = this.adapters.fundingpoolAdapter.instance;
        const dao = this.dao;
        const testtoken1 = this.testContracts.testToken1.instance;
        const testtoken2 = this.testContracts.testToken2.instance;
        const distributeFundAdapter = this.adapters.distributeFundAdapterv2.instance;
        const fundingPoolExt = this.extensions.fundingpoolExt.functions;

        const fundRaisingTarget = await fundingpoolAdapter.getFundRaisingTarget(dao.address);
        console.log(`fund Raising Target: ${hre.ethers.utils.formatEther(fundRaisingTarget.toString())}`);

        const fundRaisingWindwoEndTime = await dao.getConfiguration(sha3("FUND_RAISING_WINDOW_END"));

        await depositToFundingPool(fundingpoolAdapter, dao, this.owner, fundRaisingTarget, testtoken1);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaisingWindwoEndTime) + 1]);
        await hre.network.provider.send("evm_mine");

        const balanceOfUSDT1 = await testtoken1.balanceOf(this.owner.address);
        const balanceOfDAOSquare1 = await testtoken1.balanceOf(this.DAOSquare.address);
        const balanceOfGP1 = await testtoken1.balanceOf(this.GP.address);
        const totalFund1 = await fundingPoolExt.totalSupply();

        console.log(`balance Of DAOSquare : ${hre.ethers.utils.formatEther(balanceOfDAOSquare1.toString())}`);
        console.log(`balance Of GP : ${hre.ethers.utils.formatEther(balanceOfGP1.toString())}`);
        console.log(`total Fund1 : ${hre.ethers.utils.formatEther(totalFund1.toString())}`);

        await fundingPoolExt.processFundRaising();

        const balanceOfUSDT2 = await testtoken1.balanceOf(this.owner.address);
        const balanceOfDAOSquare2 = await testtoken1.balanceOf(this.DAOSquare.address);
        const balanceOfGP2 = await testtoken1.balanceOf(this.GP.address);
        const totalFund2 = await fundingPoolExt.totalSupply();
        console.log(`balance Of DAOSquare : ${hre.ethers.utils.formatEther(balanceOfDAOSquare2.toString())}`);
        console.log(`balance Of GP : ${hre.ethers.utils.formatEther(balanceOfGP2.toString())}`);
        console.log(`total Fund2 : ${hre.ethers.utils.formatEther(totalFund2.toString())}`);

        expect(hre.ethers.utils.formatEther(toBN(balanceOfDAOSquare2.toString()).sub(
            toBN(balanceOfDAOSquare1.toString())))).equal(
                hre.ethers.utils.formatEther(toBN(totalFund1.toString()).mul(toBN("3")).div(toBN("100"))));
        expect((await fundingPoolExt.fundRaisingState())[0]).equal(1);

    });

    it("shoule be impossible to process fund raising twice", async () => {
        const fundingpoolAdapter = this.fundingpoolAdapter;
        await expectRevert(fundingpoolAdapter.processFundRaise(this.dao.address), "revert");

    });

    it("should be impossible to withdraw fund if not in redemption or fund expired when fund raise succeed", async () => {
        const fundingpoolAdapter = this.adapters.fundingpoolAdapter.instance;
        const dao = this.dao;
        const testtoken1 = this.testContracts.testToken1.instance;
        const fundingPoolExt = this.extensions.fundingpoolExt.functions;

        const fundState = await fundingPoolExt.fundRaisingState();
        console.log(`fund raising state: ${fundState}`);

        await expectRevert(fundingpoolAdapter.withdraw(dao.address, hre.ethers.utils.parseEther("100")), "revert");
    });

    it("should be possible to withdraw fund during fund redemption", async () => {
        const fundingpoolAdapter = this.adapters.fundingpoolAdapter.instance;
        const dao = this.dao;
        const fundingPoolExt = this.extensions.fundingpoolExt.functions;
        const testtoken1 = this.testContracts.testToken1.instance;

        const bal_fundPool1 = await fundingpoolAdapter.balanceOf(dao.address, this.owner.address);
        const bal1 = await testtoken1.balanceOf(this.owner.address);
        const gpUSDTBal1 = await testtoken1.balanceOf(this.GP.address);
        console.log(`balance in fund pool: ${hre.ethers.utils.formatEther(bal_fundPool1.toString())}`);
        console.log(`owner usdt bal: ${hre.ethers.utils.formatEther(bal1.toString())}`);
        console.log(`GP usdt bal: ${hre.ethers.utils.formatEther(gpUSDTBal1.toString())}`);

        const fundStartTime = await dao.getConfiguration(sha3("FUND_START_TIME"));
        // console.log(`fund start time: ${fundStartTime}`);
        const redemptionType = await dao.getConfiguration(sha3("FUND_RAISING_REDEMPTION"));
        console.log(`redemption type: ${redemptionType}`);
        //first redempt duration
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundStartTime) + 2592000 - 259200 + 1]);
        await hre.network.provider.send("evm_mine");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        console.log(`current block timestamp: ${blocktimestamp}`);

        expect((await fundingPoolExt.ifInRedemptionPeriod(blocktimestamp))[0]).equal(true);

        let redempteAmount = toBN(bal_fundPool1.toString()).div(toBN("2"));
        await fundingpoolAdapter.withdraw(dao.address, redempteAmount);

        const bal_fundPool2 = await fundingpoolAdapter.balanceOf(dao.address, this.owner.address);
        const gpUSDTBal2 = await testtoken1.balanceOf(this.GP.address);
        const bal2 = await testtoken1.balanceOf(this.owner.address);

        console.log(`balance in fund pool: ${hre.ethers.utils.formatEther(bal_fundPool2.toString())}`);
        console.log(`GP usdt bal: ${hre.ethers.utils.formatEther(gpUSDTBal2.toString())}`);
        console.log(`owner usdt bal: ${hre.ethers.utils.formatEther(bal2.toString())}`);

        //actual withdraw amount
        expect(parseFloat(hre.ethers.utils.formatEther(bal2.toString())) - parseFloat(hre.ethers.utils.formatEther(bal1.toString())))
            .equal(parseFloat(hre.ethers.utils.formatEther(redempteAmount.toString())) * (1 - 0.005));

        // redempt fee to GP
        expect(parseFloat(hre.ethers.utils.formatEther(toBN(gpUSDTBal2.toString()).
            sub(toBN(gpUSDTBal1.toString()))))).
            equal(parseFloat(hre.ethers.utils.formatEther(redempteAmount.toString())) * 0.005);

        //second redempt duration
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundStartTime) + 2592000 * 2 - 259200 + 1]);
        await hre.network.provider.send("evm_mine");

        const fundEndTime = await fundingpoolAdapter.getFundEndTime(dao.address);
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (blocktimestamp > fundEndTime) {
            await dao.setConfiguration(sha3("FUND_END_TIME"), blocktimestamp + 100);
        }
        console.log(`fundEndTime: ${fundEndTime}
        current blocktimestamp ${blocktimestamp}  
        `);
        expect((await fundingPoolExt.ifInRedemptionPeriod(blocktimestamp))[0]).equal(true);

        redempteAmount = toBN(bal_fundPool1.toString()).div(toBN("4"));
        await fundingpoolAdapter.withdraw(dao.address, redempteAmount);

        const bal_fundPool3 = await fundingpoolAdapter.balanceOf(dao.address, this.owner.address);
        const gpUSDTBal3 = await testtoken1.balanceOf(this.GP.address);
        const bal3 = await testtoken1.balanceOf(this.owner.address);


        //actual withdraw amount
        expect(parseFloat(hre.ethers.utils.formatEther(bal3.toString())) - parseFloat(hre.ethers.utils.formatEther(bal2.toString())))
            .equal(parseFloat(hre.ethers.utils.formatEther(redempteAmount.toString())) * (1 - 0.005));

        // redempt fee to GP
        expect(parseFloat(hre.ethers.utils.formatEther(toBN(gpUSDTBal3.toString()).
            sub(toBN(gpUSDTBal2.toString()))))).
            equal(parseFloat(hre.ethers.utils.formatEther(redempteAmount.toString())) * 0.005);
    });

    it("should be possible to withdraw fund when fund expired", async () => {
        const fundingpoolAdapter = this.adapters.fundingpoolAdapter.instance;
        const dao = this.dao;
        const fundingPoolExt = this.extensions.fundingpoolExt.functions;
        const testtoken1 = this.testContracts.testToken1.instance;

        const bal_fundPool1 = await fundingpoolAdapter.balanceOf(dao.address, this.owner.address);
        const bal1 = await testtoken1.balanceOf(this.owner.address);
        const chargedManagementFee1 = await fundingPoolExt.lpChargedManagementFees(this.owner.address);

        console.log(`balance in fund pool: ${hre.ethers.utils.formatEther(bal_fundPool1.toString())}`);
        console.log(`owner usdt bal: ${hre.ethers.utils.formatEther(bal1.toString())}`);
        console.log(`charged Management Fee1: ${hre.ethers.utils.formatEther(chargedManagementFee1.toString())}`);
        const fundEndTime = await fundingpoolAdapter.getFundEndTime(dao.address);
        console.log(`fundEndTime: ${fundEndTime}`);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundEndTime) + 1]);
        await hre.network.provider.send("evm_mine");

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        console.log(`current block timestamp: ${blocktimestamp}`);
        expect((await fundingPoolExt.ifInRedemptionPeriod(blocktimestamp))[0]).equal(false);

        await fundingpoolAdapter.withdraw(dao.address, toBN(bal_fundPool1).div(toBN("2")));

        let bal_fundPool2 = await fundingpoolAdapter.balanceOf(dao.address, this.owner.address);
        let bal2 = await testtoken1.balanceOf(this.owner.address);
        console.log(`balance in fund pool: ${hre.ethers.utils.formatEther(bal_fundPool2.toString())}`);
        console.log(`owner usdt bal: ${hre.ethers.utils.formatEther(bal2.toString())}`);

        expect(toBN(bal2.toString()).sub(toBN(bal1.toString()))).
            equal(toBN(bal_fundPool1).sub(toBN(bal_fundPool2)));

        await fundingpoolAdapter.withdraw(dao.address, bal_fundPool2);

        let bal_fundPool3 = await fundingpoolAdapter.balanceOf(dao.address, this.owner.address);
        let bal3 = await testtoken1.balanceOf(this.owner.address);
        console.log(`balance in fund pool: ${hre.ethers.utils.formatEther(bal_fundPool3.toString())}`);
        console.log(`owner usdt bal: ${hre.ethers.utils.formatEther(bal3.toString())}`);

        expect(toBN(bal3.toString()).sub(toBN(bal2.toString()))).
            equal(toBN(bal_fundPool2).sub(toBN(bal_fundPool3)));
    });
});
