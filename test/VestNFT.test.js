/*
 * @Descripttion:
 * @version:
 * @Author: huhuimao
 * @Date: 2022-12-19 13:50:51
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-10-18 17:18:33
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
    toWei,
    toBN,
    fromAscii,
    fromUtf8,
    ETH_TOKEN,
    sha3,
    toUtf8,
    hexToBytes,
    toHex,
    parseBytes32String,
    hexStripZeros,
    ZERO_ADDRESS,
    oneDay,
    oneWeek
} = require("../utils/contract-util");
const {
    checkBalance,
    depositToFundingPool,
    createDistributeFundsProposal
} = require("../utils/test-util");

const {
    expectRevert,
    expect,
    DaoFactory,
    DaoRegistry,
    FundingPoolExtension,
    web3,
    accounts
} = require("../utils/oz-util");

import {
    exec
} from "child_process";
import {
    DaoFactory,
    DaoRegistry,
    FundingPoolExtension,
    deployDefaultDao,
    takeChainSnapshot,
    revertChainSnapshot,
    proposalIdGenerator,
    expect,
    expectRevert,
    web3
} from "../utils/hh-util";
import {
    createDao
} from "../utils/deployment-util1";
import {
    zeroPad
} from "ethers/lib/utils";
import {
    boolean
} from "hardhat/internal/core/params/argumentTypes";
import {
    addAbortSignal
} from "stream";
const hre = require("hardhat");


describe("to decimal percentage...", () => {
    it("test", async () => {
        const NFTDescriptorTest = await hre.ethers.getContractFactory("NFTDescriptorTest");
        const nFTDescriptorTest = await NFTDescriptorTest.deploy();
        await nFTDescriptorTest.deployed();
        console.log("deployed...", nFTDescriptorTest.address);
        const amount = hre.ethers.utils.parseEther("232.32423");
        const amount1 = 999999;
        const amount2 = 999999999;
        const amount3 = 999999999999;
        const amount4 = 99999999999999;
        const rel = await nFTDescriptorTest.integerToString(amount);
        // const rel1 = await nFTDescriptorTest.integerToString(amount1);
        // const rel2 = await nFTDescriptorTest.integerToString(amount2);
        // const rel3 = await nFTDescriptorTest.integerToString(amount3);
        // const rel4 = await nFTDescriptorTest.integerToString(amount4);

        console.log(amount, rel);
        // console.log(amount1, rel1);
        // console.log(amount2, rel2);
        // console.log(amount3, rel3);
        // console.log(amount4, rel4);


        //         uint256Params[0] remaining_,
        //         uint256Params[1] total_,
        //         uint256Params[2] interval,
        //         uint256Params[3] cliffTime,
        //         uint256Params[4] endTime
        const svg = await nFTDescriptorTest.generateSVG(
            "SDF",
            ZERO_ADDRESS,
            [
                hre.ethers.utils.parseEther("294.3234"),
                hre.ethers.utils.parseEther("3294.3234"),
                3600,
                1712147224,
                1712154484
            ]
        )

        console.log(svg);

        // const percentage = await nFTDescriptorTest.pencentageString(6, 100000);
        // console.log(percentage);

        // const subS = await nFTDescriptorTest.substring("only support ASCII Strings");
        // console.log(subS);

        // const txHash = "0x999999993332323"
        // const projectName = "ABC Finance"
        // const symbol = "VVD"
        // const totalInvestedAmount = hre.ethers.utils.parseEther("4888.89")
        // const myInvestedAmount = hre.ethers.utils.parseEther("4888.89")
        // const proposalLink = "https://graph.phoenix.fi/venturedaos/vintage/0x5416d82ed5d0a04348c31688acbdd4a1920581d5/proposals/0xacbdd4a1920581d5496e766573746d656e742333000000000000000000000000/investment"
        // const receiptSVG = await nFTDescriptorTest.generateReceiptSVG(txHash,
        //     projectName,
        //     symbol,
        //     totalInvestedAmount,
        //     myInvestedAmount);
        // console.log(receiptSVG);


        // const receiptAttributes = await nFTDescriptorTest.generateReceiptCollectionAttributes(
        //     projectName,
        //     symbol, txHash,
        //     proposalLink,
        //     myInvestedAmount, totalInvestedAmount
        // );
        // console.log(receiptAttributes);
        // const txHash = "0xfjsjfsdfdsfdfjifsdfd";
        // const projectName = "Doge Coin Investment";
        // const symbol = "DOGE";
        // const totalInvestedAmount = 3233423;
        // const myInvestedAmount = 22342;
        // const svg = await nFTDescriptorTest.getInvestmentSVG(txHash, projectName, symbol, totalInvestedAmount, myInvestedAmount);
        // console.log(svg);
    })
})