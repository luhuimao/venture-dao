/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-12-19 13:50:51
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-04-07 10:55:41
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

describe("Summon A Vintage Dao", () => {
    before("deploy contracts...", async () => {
        let [owner,
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

        const _daoName = "my_vintage_dao1";

        const { dao, factories, adapters, extensions, testContracts } = await deployDefaultDao({
            owner: this.owner,
            daoMode: 0,//  Vintage = 0, Flex = 1,   Collective = 2,
            daoName: _daoName
        });

        this.daoFactory = factories.daoFactory.instance;
        this.flexFundingPoolFactory = factories.flexFundingPoolFactory.instance;
        this.vintageFundingPoolFactory = factories.vintageFundingPoolFactory.instance;

        this.adapters = adapters;
        this.extensions = extensions;
        this.dao = dao;
        this.testContracts = testContracts;

        this.flexFundingPoolExtension = extensions.flexFundingPoolExt.functions;

        this.vintageFundRaiseAdapterContract = adapters.vintageFundRaiseAdapter.instance;
        this.vintageFundingPoolAdapterContract = adapters.vintageFundingPoolAdapterContract.instance;
        this.vintageVotingAdapterContract = adapters.vintageVotingContract.instance;

        this.testtoken1 = testContracts.testToken1.instance;
        this.testtoken2 = testContracts.testRiceToken.instance;
        this.flexVesting = adapters.flexVesting.instance;
        this.flexERC721 = adapters.flexERC721.instance;
        this.flexAllocationAdapterContract = adapters.flexAllocationAdapterContract.instance;
        this.flexFundingPoolAdapterContract = adapters.flexFundingPoolAdapterContract.instance;
        this.flexVotingContract = adapters.flexVotingContract.instance;
        this.flexFundingAdapterContract = adapters.flexFundingAdapterContract.instance;
        this.bentoBoxV1 = adapters.bentoBoxV1.instance;
        this.managing = this.adapters.managing.instance;
        this.flexPollingVotingContract = adapters.flexPollingVotingContract.instance;
        this.summonDao = this.adapters.summonDao.instance;
        this.summonVintageDao = this.adapters.summonVintageDao.instance;

        console.log(`
        owner address ${owner.address}
        `);
    });

    const sommonVintageDao = async (summonDaoContract, daoFactoryContract, vintageDaoParams) => {
        let tx = await summonDaoContract.summonVintageDao(vintageDaoParams);
        let result = await tx.wait();
        const daoAddr = await daoFactoryContract.getDaoAddress(vintageDaoParams[0]);
        const daoName = await daoFactoryContract.daos(daoAddr);
        return { daoAddr: daoAddr, daoName: daoName };
    };

    it("summom a vintage dao by summon contract...", async () => {
        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.vintageFundingPoolFactory.address
        ];

        const _daoName = "my_vintage_dao002";

        const creator = this.owner.address;

        const enalbeAdapters = [
            {
                id: '0xa837e34a29b67bf52f684a1c93def79b84b9c012732becee4e5df62809df64ed',//fund raise
                addr: this.vintageFundRaiseAdapterContract.address,
                flags: 10
            },
            {
                id: '0xaaff643bdbd909f604d46ce015336f7e20fee3ac4a55cef3610188dee176c892',//FundingPoolAdapterContract
                addr: this.vintageFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0xd3999c37f8f35da86f802a74f9bf032c4aeb46e49abd9c861f489ef4cb40d0a8',//vintageVotingAdapterContract
                addr: this.vintageVotingAdapterContract.address,
                flags: 258
            }
        ];

        const adapters1 = [
            {
                id: '0x161fca6912f107b0f13c9c7275de7391b32d2ea1c52ffba65a3c961880a0c60f',
                addr: this.vintageFundingPoolAdapterContract.address,//vintageFundingPoolAdapterContract
                flags: 75
            }
        ];


        const vintageDaoParticipantCapInfo = [
            true,//bool enable;
            5//uint256 maxParticipantsAmount;
        ];

        const vintageDaoBackerMembershipInfo = [
            1, // bool enable;
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const vintageDaoRaiserMembershipInfo = [
            1, // bool enable;
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const vintageDaoVotingInfo = [
            0,//eligibilityType 
            0, // uint8 votingPower; 
            60, // uint256 superMajority;  
            66, // uint256 quorum;
            60 * 10,// uint256 votingPeriod;
            60 * 10    // uint256 proposalExecutePeriod;
        ];

        const vintageDaoGenesisRaisers = [this.genesis_steward1.address, this.genesis_steward2.address];

        const vintageDaoParams = [
            _daoName,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo,
            vintageDaoVotingInfo,
            vintageDaoGenesisRaisers
        ];
        console.log("vintageDaoParams: ", vintageDaoParams);

        const { daoAddr, daoName } = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams);
        console.log("summon succeed...");
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);
        const fundingpoolextensionAddr = await daoContract.getExtensionAddress(sha3("vintage-funding-pool-ext"));
        console.log(`
        new dao address ${daoAddr}
        new dao name ${toUtf8(daoName)}
        funding pool extensionAddr ${fundingpoolextensionAddr}
        `)

        this.vintagedaoAddress = daoAddr;
    });

    it("create a new fund...", async () => {
        const proposalFundRaiseInfo = [
            hre.ethers.utils.parseEther("10000"), // uint256 fundRaiseMinTarget;
            hre.ethers.utils.parseEther("20000"), // uint256 fundRaiseMaxCap;
            hre.ethers.utils.parseEther("1000"),   // uint256 lpMinDepositAmount;
            hre.ethers.utils.parseEther("10000"),    // uint256 lpMaxDepositAmount;
            0    // uint8 fundRaiseType; // 0 FCFS 1 Free In
        ]
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const proposalTimeInfo = [
            blocktimestamp + 60 * 60 * 1,  // uint256 startTime;
            blocktimestamp + 60 * 60 * 6,    // uint256 endTime;
            60 * 60 * 3,   // uint256 fundTerm;
            60 * 60 * 1,   // uint256 redemptPeriod;
            60 * 60 * 2,   // uint256 redemptInterval;
            60 * 60 * 1,  // uint256 returnPeriod;
        ]

        const proposalFeeInfo = [
            hre.ethers.utils.parseEther("0.005"),     // uint256 managementFeeRatio;
            hre.ethers.utils.parseEther("0.005") // uint256 redepmtFeeRatio;
        ]
        console.log(this.user1.address);
        console.log(this.testtoken1.address);

        const proposalAddressInfo = [
            this.user1.address,  // address managementFeeAddress;
            this.testtoken1.address  // address fundRaiseTokenAddress;
        ]

        const proposerReward = [
            hre.ethers.utils.parseEther("0.005"),   // uint256 fundFromInverstor;
            hre.ethers.utils.parseEther("0.005"),  // uint256 projectTokenFromInvestor;
        ]
        const ProposalParams = [
            this.vintagedaoAddress, // DaoRegistry dao;
            proposalFundRaiseInfo, // ProposalFundRaiseInfo ;
            proposalTimeInfo,   // ProposalTimeInfo ;
            proposalFeeInfo,    // ProposalFeeInfo ;
            proposalAddressInfo,      // ProposalAddressInfo ;
            proposerReward  // ProoserReward ;
        ];
        console.log("ProposalParams: ", ProposalParams);
        const tx = await this.vintageFundRaiseAdapterContract.submitProposal(ProposalParams);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        console.log("proposalId ", proposalId);

        const detail = await this.vintageFundRaiseAdapterContract.Proposals(this.vintagedaoAddress, proposalId);
        console.log(`
    proposal detail:
         acceptTokenAddr ${detail.acceptTokenAddr}
         fundRaiseTarget ${hre.ethers.utils.formatEther(detail.fundRaiseTarget)}
         fundRaiseMaxAmount ${hre.ethers.utils.formatEther(detail.fundRaiseMaxAmount)}
         lpMinDepositAmount ${hre.ethers.utils.formatEther(detail.lpMinDepositAmount)}
         lpMaxDepositAmount ${hre.ethers.utils.formatEther(detail.lpMaxDepositAmount)}
        FundRiaseTimeInfo timesInfo
         fundRaiseStartTime; ${detail.timesInfo.fundRaiseStartTime}
         fundRaiseEndTime; ${detail.timesInfo.fundRaiseEndTime}
         fundTerm; ${detail.timesInfo.fundTerm}
         redemptPeriod; ${detail.timesInfo.redemptPeriod}
         redemptDuration; ${detail.timesInfo.redemptDuration}
         returnDuration; ${detail.timesInfo.returnDuration}
        FundRaiseRewardAndFeeInfo feeInfo
         managementFeeRatio; ${hre.ethers.utils.formatEther(detail.feeInfo.managementFeeRatio)}
         redepmtFeeRatio; ${hre.ethers.utils.formatEther(detail.feeInfo.redepmtFeeRatio)}
         state; ${detail.state}
         creationTime; ${detail.creationTime}
         stopVoteTime; ${detail.stopVoteTime}
        `);
    });

})