/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-12-19 13:50:51
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-02-13 17:47:08
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

describe("Summon A Flex Dao", () => {
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

        const _daoName = "my_flex_dao1";

        const { dao, factories, adapters, extensions, testContracts } = await deployDefaultDao({
            owner: this.owner,
            daoMode: 1,//  Vintage = 0, Flex = 1,   Collective = 2,
            daoName: _daoName
        });

        this.daoFactory = factories.daoFactory.instance;
        this.flexFundingPoolFactory = factories.flexFundingPoolFactory.instance;

        this.adapters = adapters;
        this.extensions = extensions;
        this.dao = dao;
        this.testContracts = testContracts;

        this.flexFundingPoolExtension = extensions.flexFundingPoolExt.functions;

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

        console.log(`
        owner address ${owner.address}
        `);
    });


    const sommonFlexDao = async (summonDaoContract, daoFactoryContract, flexDaoParams) => {
        let tx = await summonDaoContract.summonFlexDao(flexDaoParams);
        let result = await tx.wait();
        const daoAddr = await daoFactoryContract.getDaoAddress(flexDaoParams[flexDaoParams.length - 1].name);
        const daoName = await daoFactoryContract.daos(daoAddr);


        return { daoAddr: daoAddr, daoName: daoName };
    };

    it("summom a flex DIRECT dao by summon contract...", async () => {

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];
        const _daoName = "my_flex_dao002";

        const creator = this.owner.address;
        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd',//FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35',//FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8',//FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c',//FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7',//FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610',//FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda',//FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 258
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//ManagingContract
                addr: this.managing.address,
                flags: 59
            }
        ];

        const adapters1 = [
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingPoolAdapterContract.address,//FlexFundingPoolAdapterContract
                flags: 75
            },
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingAdapterContract.address,//FlexFundingAdapterContract
                flags: 26
            }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const flexDaoParticipantCapInfo = [
            true,//bool enable;
            5//uint256 maxParticipantsAmount;
        ]

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMemberships = [
            "participantmembershipInfo01", // string name;
            0,// uint8 varifyType;
            hre.ethers.utils.parseEther("100"),  // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0,// uint256 tokenId;
            [ZERO_ADDRESS]//whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            60 * 10,// uint256 votingPeriod;
            0, // uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            // 60 * 10    // uint256 proposalExecutePeriod;
        ];

        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0,  // uint256 tokenId;
            [ZERO_ADDRESS] //address[] whiteList;
        ];
        const flexDaoPollingInfo = [
            60 * 10,// uint256 votingPeriod;
            0,// uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            // 60 * 10 // uint256 proposalExecutePeriod;
        ];

        const flexDaoProposerMembershipInfo = [
            3,  // uint8 varifyType;
            0,  // uint256 minHolding;
            ZERO_ADDRESS,  // address tokenAddress;
            0,   // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address]  // address[] whiteList;
        ];

        const flexDaoManagementfee = 2;
        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];

        const fundingPollEnable = false;//DIRECT mode
        const flexDaoFundriaseStyle = 0// 0 - FCFS 1- Free in
        const flexDaoInfo = {
            name: _daoName,// string name;
            creator: this.owner.address,  // address creator;
            flexDaoManagementfee: flexDaoManagementfee,   // uint256 flexDaoManagementfee;
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0,    // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address,// address tokenAddress;
            tokenId: 0,  // uint256 tokenId;
            whiteList: [],   // address[] whiteList;
            priorityPeriod: 60 * 10      // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships,   // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo,// flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo,    //    flexDaoInfo _flexDaoInfo;
        ];


        const { daoAddr, daoName } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);
        const fundingpoolextensionAddr = await daoContract.getExtensionAddress(sha3("flex-funding-pool-ext"));
        console.log(`
        new dao address ${daoAddr}
        new dao name ${toUtf8(daoName)}
        funding pool extensionAddr ${fundingpoolextensionAddr}
        `)

        this.flexDirectdaoAddress = daoAddr;
    });

    it("summom a flex POLL dao by summon contract...", async () => {

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];
        const _daoName = "my_flex_dao003";

        const creator = this.owner.address;
        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd',//FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35',//FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8',//FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c',//FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7',//FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610',//FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda',//FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 258
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//ManagingContract
                addr: this.managing.address,
                flags: 59
            }
        ];

        const adapters1 = [
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingPoolAdapterContract.address,//FlexFundingPoolAdapterContract
                flags: 75
            },
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingAdapterContract.address,//FlexFundingAdapterContract
                flags: 26
            }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const flexDaoParticipantCapInfo = [
            true,//bool enable;
            5//uint256 maxParticipantsAmount;
        ]

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMemberships = [
            "participantmembershipInfo01", // string name;
            0,// uint8 varifyType;
            hre.ethers.utils.parseEther("100"),  // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0,// uint256 tokenId;
            [ZERO_ADDRESS]//whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            60 * 10,// uint256 votingPeriod;
            0, // uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            // 60 * 10    // uint256 proposalExecutePeriod;
        ];

        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0,  // uint256 tokenId;
            [ZERO_ADDRESS] //address[] whiteList;
        ];
        const flexDaoPollingInfo = [
            60 * 10,// uint256 votingPeriod;
            0,// uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            // 60 * 10 // uint256 proposalExecutePeriod;
        ];

        const flexDaoProposerMembershipInfo = [
            3,  // uint8 varifyType;
            0,  // uint256 minHolding;
            ZERO_ADDRESS,  // address tokenAddress;
            0,   // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address]  // address[] whiteList;
        ];

        const flexDaoManagementfee = 2;
        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];

        const fundingPollEnable = true;//Poll mode
        const flexDaoFundriaseStyle = 0// 0 - FCFS 1- Free in
        const flexDaoInfo = {
            name: _daoName,// string name;
            creator: this.owner.address,  // address creator;
            flexDaoManagementfee: flexDaoManagementfee,   // uint256 flexDaoManagementfee;
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0,    // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address,// address tokenAddress;
            tokenId: 0,  // uint256 tokenId;
            whiteList: [],   // address[] whiteList;
            priorityPeriod: 60 * 10      // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships,   // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo,// flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo,    //    flexDaoInfo _flexDaoInfo;
        ];


        const { daoAddr, daoName } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);
        const fundingpoolextensionAddr = await daoContract.getExtensionAddress(sha3("flex-funding-pool-ext"));
        console.log(`
        new dao address ${daoAddr}
        new dao name ${toUtf8(daoName)}
        funding pool extensionAddr ${fundingpoolextensionAddr}
        `)

        this.FlexPollDaoAddress = daoAddr;
    });

    it("varify flex DIRECT mode non escrow funding ...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.flexDirectdaoAddress);
        let tokenAddress = this.testtoken1.address;
        let minFundingAmount = hre.ethers.utils.parseEther("1000000");
        let maxFundingAmount = hre.ethers.utils.parseEther("10000000");
        let escrow = false;
        let returnTokenAddr = this.testtoken2.address;
        let returnTokenAmount = hre.ethers.utils.parseEther("1000000");
        let price = hre.ethers.utils.parseEther("0.6");
        let minReturnAmount = hre.ethers.utils.parseEther("1000000");
        let maxReturnAmount = hre.ethers.utils.parseEther("1000000");
        let approverAddr = this.user1.address;
        let recipientAddr = this.user1.address;

        let fundingInfo = [
            tokenAddress,
            minFundingAmount,
            maxFundingAmount,
            escrow,
            returnTokenAddr,
            returnTokenAmount,
            price,
            minReturnAmount,
            maxReturnAmount,
            approverAddr,
            recipientAddr
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let vestingStartTime = blocktimestamp + 100000;
        let vestingCliffEndTime = vestingStartTime + 60 * 60 * 1;
        let vestingEndTime = vestingCliffEndTime + 60 * 60 * 2;
        let vestingInterval = 60 * 60 * 1;
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("1000");

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount
        ];

        let fundRaiseType = 1;
        let fundRaiseStartTime = blocktimestamp;
        let fundRaiseEndTime = fundRaiseStartTime + 100000;
        let minDepositAmount = hre.ethers.utils.parseEther("1000");
        let maxDepositAmount = hre.ethers.utils.parseEther("10000000");
        let backerIdentification = false;

        let bType = 0;
        let bChainId = 1;
        let bTokanAddr = this.testtoken1.address;
        let bTokenId = 1;
        let bMinHoldingAmount = 100;
        let bakckerIdentificationInfo = [
            bType,
            bChainId,
            bTokanAddr,
            bTokenId,
            bMinHoldingAmount
        ];

        let priorityDeposit = true;

        let pPeriod = 100;
        let pPeriods = 10;
        let pType = 0;
        let pChainId = 1;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;

        let priorityDepositInfo = [
            pPeriod,
            pPeriods,
            pType,
            pChainId,
            pTokenAddr,
            pTokenId,
            pMinHolding
        ];

        let fundRaiseInfo = [
            fundRaiseType,
            fundRaiseStartTime,
            fundRaiseEndTime,
            minDepositAmount,
            maxDepositAmount,
            backerIdentification,
            bakckerIdentificationInfo,
            priorityDeposit,
            priorityDepositInfo
        ];

        let tokenRewardAmount = 2;
        let cashRewardAmount = hre.ethers.utils.parseEther("1000");
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];
        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos
        ];
        // console.log(fundingParams);
        console.log(`
        create flex funding proposal...
        `)
        const tx = await flexFundingAdapterContract.connect(this.funding_proposer1_whitelist).
            submitProposal(dao.address, fundingParams);
        const result = await tx.wait();
        const proposalId = result.events[2].args.proposalId;
        let flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        created...
        flex funding ProposalId: ${hre.ethers.utils.toUtf8String(proposalId)}
        state ${flexFundingProposalInfo.state}
        deposite fund...
        `);

        const flexFundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;

        const fundRaiseStartTimes = flexFundingProposalInfo.fundRaiseInfo.fundRaiseStartTime;

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(fundRaiseStartTimes) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseStartTimes) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await USDT.approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await expectRevert(flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("10")), "revert");
        await flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("2000000"));
        // const poolBal = await this.testtoken1.balanceOf(this.extensions.flexFundingPoolExt.address);
        let depositeBal = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.owner.address);
        console.log(`
        deposit balance   ${hre.ethers.utils.formatEther(depositeBal.toString())}
        whitdraw...
        `);
        await flexFundingPoolAdapt.withdraw(dao.address, proposalId, hre.ethers.utils.parseEther("10000"));
        depositeBal = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.owner.address);
        console.log(`
        deposit balance   ${hre.ethers.utils.formatEther(depositeBal.toString())}
        process proposal...
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(fundRaiseEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        const protocolFeeAddress = await dao.getAddressConfiguration(sha3("FLEX_PROTOCOL_FEE_RECEIVE_ADDRESS"));
        const managementFeeAddress = await dao.getAddressConfiguration(sha3("FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS"));
        const token = await flexFundingAdapterContract.getTokenByProposalId(dao.address, proposalId);
        const protocolAddress = await flexFundingAdapterContract.protocolAddress();
        const protocolFee = await USDT.balanceOf(protocolAddress);
        const managementFee = await USDT.balanceOf(managementFeeAddress);
        const proposerreward = await USDT.balanceOf(this.funding_proposer1_whitelist.address);
        const receiveAmount = await USDT.balanceOf(recipientAddr);
        const allTributedAmount = toBN(protocolFee.toString()).
            add(toBN(managementFee.toString())).
            add(toBN(proposerreward.toString())).
            add(toBN(receiveAmount.toString()));
        console.log(`
        processed...
        state ${flexFundingProposalInfo.state}
        protocol Fee ${hre.ethers.utils.formatEther(protocolFee)}
        management Fee ${hre.ethers.utils.formatEther(managementFee)}
        proposer reward ${hre.ethers.utils.formatEther(proposerreward)}
        receive Amount ${hre.ethers.utils.formatEther(receiveAmount)}
        total tributed amount ${hre.ethers.utils.formatEther(allTributedAmount)}
        `);
    });

    it("varify flex DIRECT mode escrow funding ...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const flexVestingContract = this.flexVesting;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.flexDirectdaoAddress);
        const fundingpoolextensionAddr = await dao.getExtensionAddress(sha3("flex-funding-pool-ext"));
        const flexFundingPoolExtContract = (await hre.ethers.getContractFactory("FlexFundingPoolExtension")).attach(fundingpoolextensionAddr);

        let tokenAddress = this.testtoken1.address;
        let minFundingAmount = hre.ethers.utils.parseEther("100000");
        let maxFundingAmount = hre.ethers.utils.parseEther("10000000");
        let escrow = true;
        let returnTokenAddr = this.testtoken2.address;
        let returnTokenAmount = hre.ethers.utils.parseEther("10000000");
        let price = hre.ethers.utils.parseEther("0.6");
        let minReturnAmount = hre.ethers.utils.parseEther("1000000");
        let maxReturnAmount = hre.ethers.utils.parseEther("1000000");
        let approverAddr = this.user1.address;
        let recipientAddr = this.user1.address;

        let fundingInfo = [
            tokenAddress,
            minFundingAmount,
            maxFundingAmount,
            escrow,
            returnTokenAddr,
            returnTokenAmount,
            price,
            minReturnAmount,
            maxReturnAmount,
            approverAddr,
            recipientAddr
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let vestingStartTime = blocktimestamp + 100000;
        let vestingCliffEndTime = vestingStartTime + 60 * 60 * 1;
        let vestingEndTime = vestingCliffEndTime + 60 * 60 * 2 + 60;
        let vestingInterval = 60 * 60 * 1;
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("1000");

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount
        ];

        let fundRaiseType = 1;
        let fundRaiseStartTime = blocktimestamp;
        let fundRaiseEndTime = fundRaiseStartTime + 100000;
        let minDepositAmount = hre.ethers.utils.parseEther("1000");
        let maxDepositAmount = hre.ethers.utils.parseEther("10000000");
        let backerIdentification = false;

        let bType = 0;
        let bChainId = 1;
        let bTokanAddr = this.testtoken1.address;
        let bTokenId = 1;
        let bMinHoldingAmount = 100;

        let bakckerIdentificationInfo = [
            bType,
            bChainId,
            bTokanAddr,
            bTokenId,
            bMinHoldingAmount
        ];

        let priorityDeposit = true;

        let pPeriod = 100;
        let pPeriods = 10;
        let pType = 0;
        let pChainId = 1;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;

        let priorityDepositInfo = [
            pPeriod,
            pPeriods,
            pType,
            pChainId,
            pTokenAddr,
            pTokenId,
            pMinHolding
        ];

        let fundRaiseInfo = [
            fundRaiseType,
            fundRaiseStartTime,
            fundRaiseEndTime,
            minDepositAmount,
            maxDepositAmount,
            backerIdentification,
            bakckerIdentificationInfo,
            priorityDeposit,
            priorityDepositInfo
        ];

        let tokenRewardAmount = 2;
        let cashRewardAmount = hre.ethers.utils.parseEther("1000");

        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos
        ];
        // console.log(fundingParams);
        console.log(`
        create flex escrow funding proposal...
        `)
        const tx = await flexFundingAdapterContract.connect(this.funding_proposer1_whitelist).
            submitProposal(dao.address, fundingParams);
        const result = await tx.wait();
        const proposalId = result.events[2].args.proposalId;
        let flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        created...
        flex funding ProposalId: ${hre.ethers.utils.toUtf8String(proposalId)}
        state ${flexFundingProposalInfo.state}
        deposite fund...
        `);

        const flexFundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;

        const fundRaiseStartTimes = flexFundingProposalInfo.fundRaiseInfo.fundRaiseStartTime;

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(fundRaiseStartTimes) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseStartTimes) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.testtoken2.transfer(this.user1.address, returnTokenAmount)
        await this.testtoken2.connect(this.user1).approve(flexFundingAdapterContract.address,
            returnTokenAmount);


        await USDT.approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await expectRevert(flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("10")), "revert");
        await flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("2000000"));

        const investors = await flexFundingPoolExtContract.getInvestorsByProposalId(proposalId);
        console.log("investors: ", investors);
        let depositeBal = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.owner.address);
        console.log(`
        deposit balance   ${hre.ethers.utils.formatEther(depositeBal.toString())}
        whitdraw...
        `);
        await flexFundingPoolAdapt.withdraw(dao.address, proposalId, hre.ethers.utils.parseEther("10000"));
        depositeBal = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.owner.address);
        console.log(`
        deposit balance   ${hre.ethers.utils.formatEther(depositeBal.toString())}
        process proposal...
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(fundRaiseEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        const managementFeeAddress = await dao.getAddressConfiguration(sha3("FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS"));
        const protocolAddress = await flexFundingAdapterContract.protocolAddress();
        const protocolFee = await USDT.balanceOf(protocolAddress);
        const managementFee = await USDT.balanceOf(managementFeeAddress);
        const proposerreward = await USDT.balanceOf(this.funding_proposer1_whitelist.address);
        const receiveAmount = await USDT.balanceOf(recipientAddr);
        const allTributedAmount = toBN(protocolFee.toString()).
            add(toBN(managementFee.toString())).
            add(toBN(proposerreward.toString())).
            add(toBN(receiveAmount.toString()));


        console.log(`
        processed...
        state ${flexFundingProposalInfo.state}
        protocol Fee ${hre.ethers.utils.formatEther(protocolFee)}
        management Fee ${hre.ethers.utils.formatEther(managementFee)}
        proposer reward ${hre.ethers.utils.formatEther(proposerreward)}
        receive Amount ${hre.ethers.utils.formatEther(receiveAmount)}
        total tributed amount ${hre.ethers.utils.formatEther(allTributedAmount)}
        create vesting...
        `);

        await flexVestingContract.createVesting(dao.address, this.owner.address, proposalId);

        let createdVestingInfo = await flexVestingContract.vests(1);
        const vestingBal = await flexVestingContract.vestBalance(1);
        let returnTokenBal = await this.testtoken2.balanceOf(this.owner.address);
        console.log(`
        vesting info ...
        proposalId: ${createdVestingInfo.proposalId},
        owner: ${createdVestingInfo.owner},
        recipient: ${createdVestingInfo.recipient},
        token: ${createdVestingInfo.token},
        start: ${createdVestingInfo.start},
        cliffDuration: ${createdVestingInfo.cliffDuration}
        stepDuration: ${createdVestingInfo.stepDuration}
        steps: ${createdVestingInfo.steps}
        cliffShares: ${hre.ethers.utils.formatEther(createdVestingInfo.cliffShares)}
        stepShares: ${hre.ethers.utils.formatEther(createdVestingInfo.stepShares)}
        claimed: ${createdVestingInfo.claimed}
        claiable: ${hre.ethers.utils.formatEther(vestingBal)}
        return token balance ${hre.ethers.utils.formatEther(returnTokenBal)}
        claiming ...
        `);
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(vestingCliffEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(vestingCliffEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }


        await flexVestingContract.withdraw(dao.address, 1);

        createdVestingInfo = await flexVestingContract.vests(1);
        returnTokenBal = await this.testtoken2.balanceOf(this.owner.address);
        console.log(`
        claimed...
        claimed: ${hre.ethers.utils.formatEther(createdVestingInfo.claimed)}
        return token balance ${hre.ethers.utils.formatEther(returnTokenBal)}
        `);
    });

    it("varify flex Poll mode non escrow funding...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.FlexPollDaoAddress);
        let tokenAddress = this.testtoken1.address;
        let minFundingAmount = hre.ethers.utils.parseEther("1000000");
        let maxFundingAmount = hre.ethers.utils.parseEther("10000000");
        let escrow = false;
        let returnTokenAddr = this.testtoken2.address;
        let returnTokenAmount = hre.ethers.utils.parseEther("1000000");
        let price = hre.ethers.utils.parseEther("0.6");
        let minReturnAmount = hre.ethers.utils.parseEther("1000000");
        let maxReturnAmount = hre.ethers.utils.parseEther("1000000");
        let approverAddr = this.user1.address;
        let recipientAddr = this.user1.address;

        let fundingInfo = [
            tokenAddress,
            minFundingAmount,
            maxFundingAmount,
            escrow,
            returnTokenAddr,
            returnTokenAmount,
            price,
            minReturnAmount,
            maxReturnAmount,
            approverAddr,
            recipientAddr
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let vestingStartTime = blocktimestamp + 100000;
        let vestingCliffDuration = 600;
        let vestingStepDuration = 600;
        let vestingSteps = 10;
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("1000");

        let vestInfo = [
            vestingStartTime,
            vestingCliffDuration,
            vestingStepDuration,
            vestingSteps,
            vestingCliffLockAmount
        ];

        let fundRaiseType = 1;
        let fundRaiseStartTime = blocktimestamp;
        let fundRaiseEndTime = fundRaiseStartTime + 100000;
        let minDepositAmount = hre.ethers.utils.parseEther("1000");
        let maxDepositAmount = hre.ethers.utils.parseEther("10000000");
        let backerIdentification = false;

        let bType = 0;
        let bChainId = 1;
        let bTokanAddr = this.testtoken1.address;
        let bTokenId = 1;
        let bMinHoldingAmount = 100;
        let bakckerIdentificationInfo = [
            bType,
            bChainId,
            bTokanAddr,
            bTokenId,
            bMinHoldingAmount
        ];

        let priorityDeposit = true;

        let pPeriod = 100;
        let pPeriods = 10;
        let pType = 0;
        let pChainId = 1;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;

        let priorityDepositInfo = [
            pPeriod,
            pPeriods,
            pType,
            pChainId,
            pTokenAddr,
            pTokenId,
            pMinHolding
        ];

        let fundRaiseInfo = [
            fundRaiseType,
            fundRaiseStartTime,
            fundRaiseEndTime,
            minDepositAmount,
            maxDepositAmount,
            backerIdentification,
            bakckerIdentificationInfo,
            priorityDeposit,
            priorityDepositInfo
        ];

        let tokenRewardAmount = 2;
        let cashRewardAmount = hre.ethers.utils.parseEther("1000");
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];
        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos
        ];
        // console.log(fundingParams);
        console.log(`
        create flex funding proposal...
        `)
        const tx = await flexFundingAdapterContract.connect(this.funding_proposer1_whitelist).
            submitProposal(dao.address, fundingParams);
        const result = await tx.wait();
        const proposalId = result.events[2].args.proposalId;
        let flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        created...
        flex funding ProposalId: ${hre.ethers.utils.toUtf8String(proposalId)}
        state ${flexFundingProposalInfo.state}
        voting...
        `);

        const flexFundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexVoting = this.flexVotingContract;
        const fundRaiseStartTimes = flexFundingProposalInfo.fundRaiseInfo.fundRaiseStartTime;
        const stopVoteTime = flexFundingProposalInfo.stopVoteTime;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;


        await flexVoting.connect(this.pollster_membership_whitelist1).submitFundingVote(dao.address, proposalId, 1);
        await flexVoting.connect(this.pollster_membership_whitelist2).submitFundingVote(dao.address, proposalId, 1);

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        voted and processed...
        state ${flexFundingProposalInfo.state}
        fund raising...
        `);

        if (parseInt(fundRaiseStartTimes) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseStartTimes) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await USDT.approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await expectRevert(flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("10")), "revert");
        await flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("2000000"));
        // const poolBal = await this.testtoken1.balanceOf(this.extensions.flexFundingPoolExt.address);
        let depositeBal = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.owner.address);
        console.log(`
        deposit balance   ${hre.ethers.utils.formatEther(depositeBal.toString())}
        whitdraw...
        `);
        await flexFundingPoolAdapt.withdraw(dao.address, proposalId, hre.ethers.utils.parseEther("10000"));
        depositeBal = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.owner.address);
        console.log(`
        deposit balance   ${hre.ethers.utils.formatEther(depositeBal.toString())}
        process proposal...
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(fundRaiseEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        const protocolFeeAddress = await dao.getAddressConfiguration(sha3("FLEX_PROTOCOL_FEE_RECEIVE_ADDRESS"));
        const managementFeeAddress = await dao.getAddressConfiguration(sha3("FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS"));
        const token = await flexFundingAdapterContract.getTokenByProposalId(dao.address, proposalId);
        const protocolAddress = await flexFundingAdapterContract.protocolAddress();
        const protocolFee = await USDT.balanceOf(protocolAddress);
        const managementFee = await USDT.balanceOf(managementFeeAddress);
        const proposerreward = await USDT.balanceOf(this.funding_proposer1_whitelist.address);
        const receiveAmount = await USDT.balanceOf(recipientAddr);
        const allTributedAmount = toBN(protocolFee.toString()).
            add(toBN(managementFee.toString())).
            add(toBN(proposerreward.toString())).
            add(toBN(receiveAmount.toString()));
        console.log(`
        processed...
        state ${flexFundingProposalInfo.state}
        protocol Fee ${hre.ethers.utils.formatEther(protocolFee)}
        management Fee ${hre.ethers.utils.formatEther(managementFee)}
        proposer reward ${hre.ethers.utils.formatEther(proposerreward)}
        receive Amount ${hre.ethers.utils.formatEther(receiveAmount)}
        total tributed amount ${hre.ethers.utils.formatEther(allTributedAmount)}
        `);
    });

    it("varify flex Poll mode escrow funding...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.FlexPollDaoAddress);
        let tokenAddress = this.testtoken1.address;
        let minFundingAmount = hre.ethers.utils.parseEther("1000000");
        let maxFundingAmount = hre.ethers.utils.parseEther("10000000");
        let escrow = true;
        let returnTokenAddr = this.testtoken2.address;
        let returnTokenAmount = hre.ethers.utils.parseEther("1000000");
        let price = hre.ethers.utils.parseEther("0.6");
        let minReturnAmount = hre.ethers.utils.parseEther("1000000");
        let maxReturnAmount = hre.ethers.utils.parseEther("1000000");
        let approverAddr = this.user1.address;
        let recipientAddr = this.user1.address;

        let fundingInfo = [
            tokenAddress,
            minFundingAmount,
            maxFundingAmount,
            escrow,
            returnTokenAddr,
            returnTokenAmount,
            price,
            minReturnAmount,
            maxReturnAmount,
            approverAddr,
            recipientAddr
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let vestingStartTime = blocktimestamp + 100000;
        let vestingCliffDuration = 600;
        let vestingStepDuration = 600;
        let vestingSteps = 10;
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("1000");

        let vestInfo = [
            vestingStartTime,
            vestingCliffDuration,
            vestingStepDuration,
            vestingSteps,
            vestingCliffLockAmount
        ];

        let fundRaiseType = 1;
        let fundRaiseStartTime = blocktimestamp;
        let fundRaiseEndTime = fundRaiseStartTime + 100000;
        let minDepositAmount = hre.ethers.utils.parseEther("1000");
        let maxDepositAmount = hre.ethers.utils.parseEther("10000000");
        let backerIdentification = false;

        let bType = 0;
        let bChainId = 1;
        let bTokanAddr = this.testtoken1.address;
        let bTokenId = 1;
        let bMinHoldingAmount = 100;
        let bakckerIdentificationInfo = [
            bType,
            bChainId,
            bTokanAddr,
            bTokenId,
            bMinHoldingAmount
        ];

        let priorityDeposit = true;

        let pPeriod = 100;
        let pPeriods = 10;
        let pType = 0;
        let pChainId = 1;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;

        let priorityDepositInfo = [
            pPeriod,
            pPeriods,
            pType,
            pChainId,
            pTokenAddr,
            pTokenId,
            pMinHolding
        ];

        let fundRaiseInfo = [
            fundRaiseType,
            fundRaiseStartTime,
            fundRaiseEndTime,
            minDepositAmount,
            maxDepositAmount,
            backerIdentification,
            bakckerIdentificationInfo,
            priorityDeposit,
            priorityDepositInfo
        ];

        let tokenRewardAmount = 2;
        let cashRewardAmount = hre.ethers.utils.parseEther("1000");
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];
        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos
        ];
        // console.log(fundingParams);
        console.log(`
        create flex funding proposal...
        `)
        const tx = await flexFundingAdapterContract.connect(this.funding_proposer1_whitelist).
            submitProposal(dao.address, fundingParams);
        const result = await tx.wait();
        const proposalId = result.events[2].args.proposalId;
        let flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        created...
        flex funding ProposalId: ${hre.ethers.utils.toUtf8String(proposalId)}
        state ${flexFundingProposalInfo.state}
        voting...
        `);

        const flexFundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexVoting = this.flexVotingContract;
        const fundRaiseStartTimes = flexFundingProposalInfo.fundRaiseInfo.fundRaiseStartTime;
        const stopVoteTime = flexFundingProposalInfo.stopVoteTime;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;


        await flexVoting.connect(this.pollster_membership_whitelist1).submitFundingVote(dao.address, proposalId, 1);
        await flexVoting.connect(this.pollster_membership_whitelist2).submitFundingVote(dao.address, proposalId, 1);

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        voted and processed...
        state ${flexFundingProposalInfo.state}
        fund raising...
        `);

        if (parseInt(fundRaiseStartTimes) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseStartTimes) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        await USDT.transfer(this.investor1.address, hre.ethers.utils.parseEther("100000"));
        await USDT.transfer(this.investor2.address, hre.ethers.utils.parseEther("100000"));

        await USDT.connect(this.investor1).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.investor2).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));

        await expectRevert(flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("10")), "revert");
        await flexFundingPoolAdapt.connect(this.investor1).deposit(dao.address, proposalId, hre.ethers.utils.parseEther("100000"));
        await flexFundingPoolAdapt.connect(this.investor2).deposit(dao.address, proposalId, hre.ethers.utils.parseEther("100000"));
        let depositeBal1 = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.investor1.address);
        let depositeBal2 = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.investor2.address);

        console.log(`
        investor1 deposit balance   ${hre.ethers.utils.formatEther(depositeBal1.toString())}
        investor2 deposit balance   ${hre.ethers.utils.formatEther(depositeBal2.toString())}
        whitdraw...
        `);
        await flexFundingPoolAdapt.connect(this.investor2).
            withdraw(dao.address, proposalId, hre.ethers.utils.parseEther("10000"));
        depositeBal2 = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.investor2.address);
        console.log(`
        investor2 deposit balance   ${hre.ethers.utils.formatEther(depositeBal2.toString())}
        process proposal...
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(fundRaiseEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        const managementFeeAddress = await dao.getAddressConfiguration(sha3("FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS"));
        const protocolAddress = await flexFundingAdapterContract.protocolAddress();
        const protocolFee = await USDT.balanceOf(protocolAddress);
        const managementFee = await USDT.balanceOf(managementFeeAddress);
        const proposerreward = await USDT.balanceOf(this.funding_proposer1_whitelist.address);
        const receiveAmount = await USDT.balanceOf(recipientAddr);
        const allTributedAmount = toBN(protocolFee.toString()).
            add(toBN(managementFee.toString())).
            add(toBN(proposerreward.toString())).
            add(toBN(receiveAmount.toString()));
        console.log(`
        processed...
        state ${flexFundingProposalInfo.state}
        protocol Fee ${hre.ethers.utils.formatEther(protocolFee)}
        management Fee ${hre.ethers.utils.formatEther(managementFee)}
        proposer reward ${hre.ethers.utils.formatEther(proposerreward)}
        receive Amount ${hre.ethers.utils.formatEther(receiveAmount)}
        total tributed amount ${hre.ethers.utils.formatEther(allTributedAmount)}
        `);
    });

})