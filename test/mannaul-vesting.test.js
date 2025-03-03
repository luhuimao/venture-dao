/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-12-19 13:50:51
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-02-03 14:51:58
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
const { checkBalance, depositToFundingPool, createDistributeFundsProposal } = require("../utils/test-util");

const {
    expectRevert,
    expect,
    DaoFactory,
    DaoRegistry,
    FundingPoolExtension,
    web3,
    accounts
} = require("../utils/oz-util");

import { exec } from "child_process";
import {
    DaoFactory,
    DaoRegistry,
    FundingPoolExtension,
    deployDefaultDao,
    takeChainSnapshot,
    revertChainSnapshot, proposalIdGenerator, expect, expectRevert, web3
} from "../utils/hh-util";
import { createDao } from "../utils/deployment-util1";
import { zeroPad } from "ethers/lib/utils";
import { boolean } from "hardhat/internal/core/params/argumentTypes";
const hre = require("hardhat");


describe("mannual vesting...", () => {
    before("deploy contracts...", async () => {
        let [
            owner,
            user1, user2,
            investor1, investor2,
            gp1, gp2,
            project_team1, project_team2,
            genesis_steward1, genesis_steward2,
            funding_proposer1,
            funding_proposer1_whitelist, funding_proposer2_whitelist,
            participant_membership_whitelist1, participant_membership_whitelist2,
            priority_deposit_membership_whitelist1, priority_deposit_membership_whitelist2,
            pollster_membership_whitelist1, pollster_membership_whitelist2,
            managementFeeAccount
        ] = await hre.ethers.getSigners();
        this.owner = owner;
        this.user1 = user1;
        this.user2 = user2;
        this.investor1 = investor1;
        this.investor2 = investor2;
        this.gp1 = gp1;
        this.gp2 = gp2;
        this.project_team1 = project_team1;
        this.project_team2 = project_team2;
        this.genesis_steward1 = genesis_steward1;
        this.genesis_steward2 = genesis_steward2;
        this.funding_proposer1 = funding_proposer1;
        this.funding_proposer1_whitelist = funding_proposer1_whitelist;
        this.funding_proposer2_whitelist = funding_proposer2_whitelist;
        this.participant_membership_whitelist1 = participant_membership_whitelist1;
        this.participant_membership_whitelist2 = participant_membership_whitelist2;
        this.priority_deposit_membership_whitelist1 = priority_deposit_membership_whitelist1;
        this.priority_deposit_membership_whitelist2 = priority_deposit_membership_whitelist2;
        this.pollster_membership_whitelist1 = pollster_membership_whitelist1;
        this.pollster_membership_whitelist2 = pollster_membership_whitelist2;
        this.managementFeeAccount = managementFeeAccount;

        let _daoName = "my_collective_dao1";

        const {
            dao,
            factories,
            adapters,
            extensions,
            utilContracts,
            testContracts
        } = await deployDefaultDao({
            owner: this.owner,
            daoMode: 1, //  Vintage = 0, Flex = 1,   Collective = 2,
            daoName: _daoName
        });

        this.daoFactory = factories.daoFactory.instance;
        this.collectiveFundingPoolFactory = factories.collectiveFundingPoolFactory.instance;

        this.adapters = adapters;
        this.extensions = extensions;
        this.dao = dao;
        this.testContracts = testContracts;


        this.bentoBoxV1 = adapters.bentoBoxV1.instance;
        this.testtoken1 = testContracts.testToken1.instance;
        this.testtoken2 = testContracts.testRiceToken.instance;

        const InvestmentReceiptERC721Helper = await hre.ethers.getContractFactory("InvestmentReceiptERC721Helper");
        const investmentReceiptERC721Helper = await InvestmentReceiptERC721Helper.deploy();
        await investmentReceiptERC721Helper.deployed();
        this.investmentReceiptERC721Helper = investmentReceiptERC721Helper;

        console.log("deploying InvestmentReceiptERC721....");
        const InvestmentReceiptERC721 = await hre.ethers.getContractFactory("InvestmentReceiptERC721");
        const investmentReceiptERC721 = await InvestmentReceiptERC721.deploy(
            "DAOSquare Investment Receipt",
            "DIR",
            this.investmentReceiptERC721Helper.address
        );
        await investmentReceiptERC721.deployed();
        this.investmentReceiptERC721 = investmentReceiptERC721;


        const ManualVesting = await hre.ethers.getContractFactory("ManualVesting");
        const manualVesting = await ManualVesting.deploy(
            this.bentoBoxV1.address,
            investmentReceiptERC721.address
        );
        await manualVesting.deployed();
        this.manualVesting = manualVesting;

        console.log("manualVesting ", manualVesting.address);

        const manualVesting2 = await ManualVesting.deploy(
            this.bentoBoxV1.address,
            investmentReceiptERC721.address
        );
        await manualVesting2.deployed();
        this.manualVesting2 = manualVesting2;

        console.log("manualVesting2 ", manualVesting2.address);


        const ManualVestingERC721SVGHelper = await hre.ethers.getContractFactory("ManualVestingERC721SVGHelper");
        const manualVestingERC721SVGHelper = await ManualVestingERC721SVGHelper.deploy();
        await manualVestingERC721SVGHelper.deployed();
        this.manualVestingERC721SVGHelper = manualVestingERC721SVGHelper;
        console.log("manualVestingERC721SVGHelper ", manualVestingERC721SVGHelper.address);

        const ManualVestingERC721TokenUriHelper = await hre.ethers.getContractFactory("ManualVestingERC721TokenURIHelper");
        const manualVestingERC721TokenUriHelper = await ManualVestingERC721TokenUriHelper.deploy();
        await manualVestingERC721TokenUriHelper.deployed();
        this.manualVestingERC721TokenUriHelper = manualVestingERC721TokenUriHelper;
        console.log("manualVestingERC721TokenUriHelper ", manualVestingERC721TokenUriHelper.address);

        const ManualVestingERC721 = await hre.ethers.getContractFactory("ManualVestingERC721");
        const manualVestingERC721 = await ManualVestingERC721.deploy(
            "DAOSquare Vesting Manual",
            "DVM",
            manualVesting.address,
            manualVestingERC721TokenUriHelper.address,
            manualVestingERC721SVGHelper.address
        );
        await manualVestingERC721.deployed();
        this.manualVestingERC721 = manualVestingERC721;
        console.log("manualVestingERC721 ", manualVestingERC721.address);

        const ERC20TokenDecimals = await hre.ethers.getContractFactory("ERC20TokenDecimals");
        const eRC20TokenDecimals = await ERC20TokenDecimals.deploy(100000000, 6);
        await eRC20TokenDecimals.deployed();
        this.erc20TokenDecimals = eRC20TokenDecimals;
    });

    it("nft enable...", async () => {
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const vstartTime = toBN(blocktimestamp).add(toBN(60 * 1));
        const vendTime = toBN(vstartTime).add(toBN(60 * 60 * 500));
        const vcliffEndTime = toBN(vstartTime).add(toBN(60 * 60 * 1));
        const vvestingInterval = 60 * 60 * 1;
        const vpaybackToken = this.erc20TokenDecimals.address;
        const vrecipientAddr = this.user1.address;
        const vdepositAmount = toBN("234543000");
        const vcliffVestingAmount = hre.ethers.utils.parseEther("0.032");
        const vnftEnable = true;
        const verc721 = this.manualVestingERC721.address;
        const vname = "vesting nft disable";
        const vdes = "99932fd";


        const CreateVestingParams = [
            vstartTime,
            vcliffEndTime,
            vendTime,
            vvestingInterval,
            vpaybackToken,
            vrecipientAddr,
            vdepositAmount,
            vcliffVestingAmount,
            vnftEnable,
            verc721,
            vname,
            vdes
        ];


        await this.erc20TokenDecimals.approve(this.bentoBoxV1.address, vdepositAmount);
        console.log("approved...");
        await this.manualVesting.createVesting(CreateVestingParams);

        const vestId = await this.manualVesting.getVestIdByTokenId(verc721, 1);
        console.log(vestId);
        const URI = await this.manualVestingERC721.tokenURI(1);
        const svg = await this.manualVestingERC721.getSvg(1);
        let vestInfo4 = await this.manualVesting.vests(vestId);
        console.log(`
          total  ${vestInfo4.total}
           claimed ${vestInfo4.claimed}
        `)

        await this.erc20TokenDecimals.approve(
            this.bentoBoxV1.address,
            toBN("1692000000"));

        const receivers = [this.user1.address, this.user2.address, this.investor1.address, this.investor2.address];
        const amounts = [
            toBN("423000000"),
            toBN("423000000"),
            toBN("423000000"),
            toBN("423000000")]
        const tx = await this.manualVesting.batchCreate2(receivers, amounts, CreateVestingParams);
        const result = await tx.wait();
        console.log(result.events[result.events.length - 1].args);
        console.log(`
            totalAmount  ${(result.events[result.events.length - 1].args.totalAmount)}
        `)
        const batchId = result.events[result.events.length - 1].args.batchId;
        await this.manualVesting.connect(this.user1).createVesting2(batchId)
        await this.manualVesting.connect(this.user2).createVesting2(batchId)
        await this.manualVesting.connect(this.investor1).createVesting2(batchId)
        await this.manualVesting.connect(this.investor2).createVesting2(batchId)

    });

    it("batch create manual vesting...", async () => {

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const vstartTime = toBN(blocktimestamp).add(toBN(60 * 1));
        const vendTime = toBN(vstartTime).add(toBN(60 * 60 * 500));
        const vcliffEndTime = toBN(vstartTime).add(toBN(60 * 60 * 1));
        const vvestingInterval = 60 * 60 * 1;
        const vpaybackToken = this.testtoken2.address;
        const vrecipientAddr = this.user1.address;
        const vdepositAmount = hre.ethers.utils.parseEther("234.543");
        const vcliffVestingAmount = hre.ethers.utils.parseEther("0.032");
        const vnftEnable = true;
        const verc721 = this.manualVestingERC721.address;
        const vname = "vesting nft disable";
        const vdes = "99932fd";


        const CreateVestingParams = [
            vstartTime,
            vcliffEndTime,
            vendTime,
            vvestingInterval,
            vpaybackToken,
            vrecipientAddr,
            vdepositAmount,
            vcliffVestingAmount,
            vnftEnable,
            verc721,
            vname,
            vdes
        ];

        const oldAllowanceAmount = await this.testtoken2.allowance(this.owner.address, this.bentoBoxV1.address);
        console.log("oldAllowanceAmount ", hre.ethers.utils.formatEther(oldAllowanceAmount));
        const approveAmount = toBN(oldAllowanceAmount).add(hre.ethers.utils.parseEther("4864"));
        await this.testtoken2.approve(this.bentoBoxV1.address, approveAmount);
        console.log("approved...");

        const receivers = [this.user1.address, this.user2.address];
        const amounts = [hre.ethers.utils.parseEther("432"), hre.ethers.utils.parseEther("4432")]
        const tx = await this.manualVesting.batchCreate2(receivers, amounts, CreateVestingParams);
        const rel = await tx.wait();
        const event_receivers = rel.events[rel.events.length - 1].args.receivers;
        const event_totalAmount = rel.events[rel.events.length - 1].args.totalAmount;
        const event_batchId = rel.events[rel.events.length - 1].args.batchId;

        console.log(`
            batch vesting created...
            event_receivers  ${event_receivers}
            event_totalAmount  ${hre.ethers.utils.formatEther(event_totalAmount)}
            event_batchId  ${event_batchId}
        `);

        const batchVestingInfo = await this.manualVesting.batchVestInfo(event_batchId);
        console.log(batchVestingInfo);

        await expectRevert(this.manualVesting.createVesting2(event_batchId), "revert");

        const tx1 = await this.manualVesting.connect(this.user1).createVesting2(event_batchId);
        const re1 = await tx1.wait();
        const event_vestId = re1.events[re1.events.length - 1].args.vestId;
        const event_token = re1.events[re1.events.length - 1].args.token;
        const event_recipient = re1.events[re1.events.length - 1].args.recipient;
        const event_start = re1.events[re1.events.length - 1].args.start;
        const event_cliffDuration = re1.events[re1.events.length - 1].args.cliffDuration;
        const event_stepDuration = re1.events[re1.events.length - 1].args.stepDuration;
        const event_steps = re1.events[re1.events.length - 1].args.steps;
        const event_cliffShares = re1.events[re1.events.length - 1].args.cliffShares;
        const event_stepShares = re1.events[re1.events.length - 1].args.stepShares;

        console.log(`
            event_vestId   ${event_vestId}
            event_token   ${event_token}
            event_recipient   ${event_recipient}
            event_start   ${event_start}
            event_cliffDuration   ${event_cliffDuration}
            event_stepDuration   ${event_stepDuration}
            event_steps   ${event_steps}
            event_cliffShares   ${event_cliffShares}
            event_stepShares   ${event_stepShares}
        `);

        await expectRevert(this.manualVesting.connect(this.user2).createVesting2(4), "revert");
        await expectRevert(this.manualVesting.connect(this.user1).createVesting2(event_batchId), "revert");
        const tx2 = await this.manualVesting.connect(this.user2).createVesting2(event_batchId);
        const re2 = await tx2.wait();
        const event_vestId2 = re2.events[re2.events.length - 1].args.vestId;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(vendTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(vendTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        let vestBal = await this.manualVesting.vestBalance(event_vestId);
        let vestBal2 = await this.manualVesting.vestBalance(event_vestId2);

        await this.manualVesting.connect(this.user1).withdraw(event_vestId);
        await this.manualVesting.connect(this.user2).withdraw(event_vestId2);

        let vestInfo = await this.manualVesting.vests(event_vestId);
        let vestInfo2 = await this.manualVesting.vests(event_vestId2);

        console.log(`
            vestBal     ${hre.ethers.utils.formatEther(vestBal)}
            vestBal2     ${hre.ethers.utils.formatEther(vestBal2)}

            vestInfo.claimed  ${hre.ethers.utils.formatEther(vestInfo.claimed)}
            vestInfo2.claimed  ${hre.ethers.utils.formatEther(vestInfo2.claimed)}

            vestInfo.total  ${hre.ethers.utils.formatEther(vestInfo.total)}
            vestInfo2.total  ${hre.ethers.utils.formatEther(vestInfo2.total)}
        `);
    });


})