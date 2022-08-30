// Whole-script strict mode syntax
"use strict";

/**
MIT License

Copyright (c) 2022 

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


describe("Adapter - StakingRice", () => {
    before("deploy dao", async () => {
        let [owner, user1, user2, project_team1] = await hre.ethers.getSigners();
        this.owner = owner;
        this.user1 = user1;
        this.user2 = user2;
        this.project_team1 = project_team1;
        // console.log(`owner address ${owner.address}; user1 address ${user1.address}; user2 address ${user2.address}`);

        const { dao, adapters, extensions, testContracts } = await deployDefaultDao({
            owner: owner,
        });

        this.adapters = adapters;
        this.extensions = extensions;
        this.dao = dao;
        this.testContracts = testContracts;
        this.snapshotId = await takeChainSnapshot();
    });

    beforeEach(async () => {
        await revertChainSnapshot(this.snapshotId);
        this.snapshotId = await takeChainSnapshot();
    });

    it("should be possible to deposit rice token to the pool", async () => {
        const ricestakingAdapter = this.adapters.ricestakingAdapter.instance;
        const dao = this.dao;
        const ricetoken = this.testContracts.testRiceToken.instance;
        const ricestakingExt = this.extensions.ricestakingExt.functions;
        await ricetoken.transfer(this.user1.address, hre.ethers.utils.parseEther("1000"));

        console.log("user1 rice token balance: ", hre.ethers.utils.formatEther(await ricetoken.balanceOf(this.user1.address)).toString());
        console.log(`user1 address: ${this.user1.address}`);
        await ricetoken.connect(this.user1).approve(ricestakingAdapter.address, hre.ethers.utils.parseEther("1000"));
        await ricestakingAdapter.connect(this.user1).deposit(dao.address, hre.ethers.utils.parseEther("1000"));

        console.log("user1 rice token balance: ", hre.ethers.utils.formatEther(await ricetoken.balanceOf(this.user1.address)).toString());

        const stakedBalance = hre.ethers.utils.formatEther((await ricestakingExt.balanceOf(
            this.user1.address, ricetoken.address))[0]);
        console.log("stakedBalance:", stakedBalance);
        expect(parseInt(stakedBalance)).equal(1000);
    })

    it("should be possible to withdraw funds from the rice staking pool", async () => {
        const ricestakingAdapter = this.adapters.ricestakingAdapter.instance;
        const dao = this.dao;
        const ricetoken = this.testContracts.testRiceToken.instance;
        const ricestakingExt = this.extensions.ricestakingExt.functions;

        await ricestakingAdapter.connect(this.user1).withdraw(dao.address, hre.ethers.utils.parseEther("1000"));
        expect(parseInt(hre.ethers.utils.formatEther((await ricestakingExt.balanceOf(this.user1.address, ricetoken.address))[0]))).equal(
            0);

        expect(parseInt(hre.ethers.utils.formatEther(await ricetoken.balanceOf(this.user1.address)))).equal(1000);
    })

    it("should be impossible to unstake funds exceeds balance", async () => {
        const ricestakingAdapter = this.adapters.ricestakingAdapter.instance;
        const dao = this.dao;
        const ricetoken = this.testContracts.testRiceToken.instance;
        const ricestakingExt = this.extensions.ricestakingExt.functions;

        const stakedBalance = hre.ethers.utils.formatEther((await ricestakingAdapter.balanceOf(
            dao.address, this.user1.address)));
        console.log("stakedBalance:", stakedBalance);
        await expectRevert(ricestakingAdapter.connect(this.user1).withdraw(
            dao.address, hre.ethers.utils.parseEther("1000")), "revert");

    })

    // it("should be possible to deposit rice token to the pool by member", async () => {
    //     const ricestakingAdapter = this.adapters.ricestakingAdapter.instance;
    //     const dao = this.dao;
    //     const ricetoken = this.testContracts.testRiceToken.instance;
    //     const ricestakingExt = this.extensions.ricestakingExt.functions;

    //     console.log("owenr rice token balance: ", hre.ethers.utils.formatEther(await ricetoken.balanceOf(this.owner.address)).toString());

    //     await ricetoken.connect(this.owner).approve(ricestakingAdapter.address, hre.ethers.utils.parseEther("1000"));
    //     await ricestakingAdapter.connect(this.owner).memberDeposit(dao.address, hre.ethers.utils.parseEther("1000"), ricetoken.address);

    //     console.log("owenr rice token balance: ", hre.ethers.utils.formatEther(await ricetoken.balanceOf(this.owner.address)).toString());

    //     const stakedBalance = hre.ethers.utils.formatEther((await ricestakingExt.balanceOf(
    //         '0x0000000000000000000000000000000012345678', ricetoken.address))[0]);
    //     console.log("stakedBalance:", stakedBalance);
    //     expect(parseInt(stakedBalance)).equal(1000);
    // })

    // it("should be impossible to deposit rice token to the pool by non member", async () => {
    //     const ricestakingAdapter = this.adapters.ricestakingAdapter.instance;
    //     const dao = this.dao;
    //     const ricetoken = this.testContracts.testRiceToken.instance;
    //     const ricestakingExt = this.extensions.ricestakingExt.functions;

    //     console.log("user1 rice token balance: ", hre.ethers.utils.formatEther(await ricetoken.balanceOf(this.user1.address)).toString());

    //     await ricetoken.connect(this.user1).approve(ricestakingAdapter.address, hre.ethers.utils.parseEther("1000"));
    //     await expectRevert(ricestakingAdapter.connect(this.user1).memberDeposit(dao.address, hre.ethers.utils.parseEther("1000"), ricetoken.address), "revert");
    // })

    // it("should be possible to withdraw funds from the rice staking pool by member", async () => {
    //     const ricestakingAdapter = this.adapters.ricestakingAdapter.instance;
    //     const dao = this.dao;
    //     const ricetoken = this.testContracts.testRiceToken.instance;
    //     const ricestakingExt = this.extensions.ricestakingExt.functions;

    //     await ricestakingAdapter.connect(this.owner).memberWithdraw(dao.address, hre.ethers.utils.parseEther("1000"), ricetoken.address);
    //     expect(parseInt(hre.ethers.utils.formatEther((await ricestakingExt.balanceOf('0x0000000000000000000000000000000012345678', ricetoken.address))[0]))).equal(
    //         0);

    //     expect(parseInt(hre.ethers.utils.formatEther(await ricetoken.balanceOf(this.owner.address)))).equal(999000);
    // })

    // it("should be impossible to withdraw funds exceeds balance", async () => {
    //     const ricestakingAdapter = this.adapters.ricestakingAdapter.instance;
    //     const dao = this.dao;
    //     const ricetoken = this.testContracts.testRiceToken.instance;
    //     const ricestakingExt = this.extensions.ricestakingExt.functions;
    //     console.log(`Mining Pool Balance: ${hre.ethers.utils.formatEther((await ricestakingExt.balanceOf('0x0000000000000000000000000000000012345678', ricetoken.address))[0])}`);
    //     await expectRevert(ricestakingAdapter.connect(this.owner).memberWithdraw(dao.address, hre.ethers.utils.parseEther("1000"), ricetoken.address), "revert");
    // })
});
