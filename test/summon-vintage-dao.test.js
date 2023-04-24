/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-12-19 13:50:51
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-04-24 16:32:24
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
        this.vintageRaiserManagementContract = adapters.vintageRaiserManagementContract.instance;
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
        this.summonDao = this.adapters.summonVintageDao.instance;
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

        const _daoName = "my_vintage_dao006";

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
            },
            {
                id: '0xd90e10040720d66c9412cb511e3dbb6ba51669248a7495e763d44ab426893efa',//vintageRaiserManagementContract
                addr: this.vintageRaiserManagementContract.address,
                flags: 138
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
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
            0,//  uint256 supportType;
            0,//uint256 quorumType;
            60, // uint256 support;  
            66, // uint256 quorum;
            60 * 10,// uint256 votingPeriod;
            60 * 10  // uint256 proposalExecutePeriod;
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
});

describe("verify raiser membership...", () => {
    before("deploy contracts...", async () => {
        let [owner,
            user1, user2,
            investor1, investor2,
            gp1, gp2,
            project_team1, project_team2,
            genesis_raiser1, genesis_raiser2,
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
        this.genesis_raiser1 = genesis_raiser1;
        this.genesis_raiser2 = genesis_raiser2;
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

        const _daoName1 = "my_vintage_dao1";
        const _daoName2 = "my_vintage_dao2";
        const _daoName3 = "my_vintage_dao3";
        const _daoName4 = "my_vintage_dao4";
        const _daoName5 = "my_vintage_dao5";

        const { dao, factories, adapters, extensions, testContracts } = await deployDefaultDao({
            owner: this.owner,
            daoMode: 0,//  Vintage = 0, Flex = 1,   Collective = 2,
            daoName: "init dao"
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
        this.summonDao = this.adapters.summonVintageDao.instance;
        this.summonVintageDao = this.adapters.summonVintageDao.instance;

        console.log(`
        owner address ${owner.address}
        `);


        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.vintageFundingPoolFactory.address
        ];

        const _daoName = _daoName1;

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
            },
            {
                id: '0xd90e10040720d66c9412cb511e3dbb6ba51669248a7495e763d44ab426893efa',//vintageRaiserManagementContract
                addr: this.vintageRaiserManagementContract.address,
                flags: 138
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
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

        const vintageDaoRaiserMembershipInfo1 = [
            1, // bool enable;
            0, // uint256 varifyType;erc20
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const ERC721 = await hre.ethers.getContractFactory("PixelNFT");
        const erc721 = await ERC721.deploy(2);
        await erc721.deployed();
        this.testERC721 = erc721;
        const vintageDaoRaiserMembershipInfo2 = [
            1, // bool enable;
            1, // uint256 varifyType;erc721
            1, // uint256 minHolding;
            erc721.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const ERC1155 = await hre.ethers.getContractFactory("ERC1155TestToken");
        const erc1155 = await ERC1155.deploy("this is test uri");
        await erc1155.deployed();
        this.testERC1155 = erc1155;
        const vintageDaoRaiserMembershipInfo3 = [
            1, // bool enable;
            2, // uint256 varifyType;erc1155
            2, // uint256 minHolding;
            erc1155.address,  // address tokenAddress;
            1,  // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const vintageDaoRaiserMembershipInfo4 = [
            1, // bool enable;
            3, // uint256 varifyType;whitelist
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [this.gp1.address] // address[] whiteList;
        ];

        const vintageDaoRaiserMembershipInfo5 = [
            1, // bool enable;
            4, // uint256 varifyType;deposit
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const vintageDaoVotingInfo = [
            0,//eligibilityType 
            0, // uint8 votingPower; 
            0,//  uint256 supportType;
            0,//uint256 quorumType;
            60, // uint256 support;  
            66, // uint256 quorum;
            60 * 10,// uint256 votingPeriod;
            60 * 10  // uint256 proposalExecutePeriod;
        ];

        const vintageDaoGenesisRaisers = [this.genesis_raiser1.address, this.genesis_raiser2.address];

        const vintageDaoParams1 = [
            _daoName1,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo,
            vintageDaoGenesisRaisers
        ];

        const vintageDaoParams2 = [
            _daoName2,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo2,
            vintageDaoVotingInfo,
            vintageDaoGenesisRaisers
        ];

        const vintageDaoParams3 = [
            _daoName3,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo3,
            vintageDaoVotingInfo,
            vintageDaoGenesisRaisers
        ];

        const vintageDaoParams4 = [
            _daoName4,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo4,
            vintageDaoVotingInfo,
            vintageDaoGenesisRaisers
        ];

        const vintageDaoParams5 = [
            _daoName5,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo5,
            vintageDaoVotingInfo,
            vintageDaoGenesisRaisers
        ];


        let obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams1);
        console.log(obj);
        console.log("summon vintage dao1 succeed...", obj.daoAddr);
        this.daoAddr1 = obj.daoAddr;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams2);
        console.log("summon vintage dao2 succeed...", obj.daoAddr);
        this.daoAddr2 = obj.daoAddr;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams3);
        console.log("summon vintage dao3 succeed...", obj.daoAddr);
        this.daoAddr3 = obj.daoAddr;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams4);
        console.log("summon vintage dao4 succeed...", obj.daoAddr);
        this.daoAddr4 = obj.daoAddr;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams5);
        console.log("summon vintage dao5 succeed...", obj.daoAddr);
        this.daoAddr5 = obj.daoAddr;
    });

    const sommonVintageDao = async (summonDaoContract, daoFactoryContract, vintageDaoParams) => {
        let tx = await summonDaoContract.summonVintageDao(vintageDaoParams);
        let result = await tx.wait();
        const daoAddr = await daoFactoryContract.getDaoAddress(vintageDaoParams[0]);
        console.log("daoAddr ", daoAddr);
        const daoName = await daoFactoryContract.daos(daoAddr);
        return { daoAddr: daoAddr, daoName: daoName };
    };

    it("verify raiser erc20 memberhsip...", async () => {
        let tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        user1 test erc20token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);
        await expectRevert(this.vintageRaiserManagementContract.submitRaiserInProposal(this.daoAddr1, this.user1.address), "revert");

        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("100"));
        tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        user1 test token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);
        await this.vintageRaiserManagementContract.submitRaiserInProposal(this.daoAddr1, this.user1.address);
    });

    it("verify raiser erc721 memberhsip...", async () => {
        let gp1NFTBal = await this.testERC721.balanceOf(this.user2.address);
        console.log(`
        user2 NFT balance ${gp1NFTBal}
        `);

        await expectRevert(this.vintageRaiserManagementContract.submitRaiserInProposal(this.daoAddr2, this.user2.address), "revert");

        console.log(`mint NFT...`);
        await this.testERC721.mintPixel(this.user2.address, 1, 1);
        console.log(`minted...`);

        gp1NFTBal = await this.testERC721.balanceOf(this.user2.address);
        console.log(`
        user2 NFT balance ${gp1NFTBal}
        `);

        await this.vintageRaiserManagementContract.submitRaiserInProposal(this.daoAddr2, this.user2.address);
    });

    it("verify raiser erc1155 memberhsip...", async () => {
        let gp1NFTBal = await this.testERC1155.balanceOf(this.user2.address, 1);

        console.log(`
        user2 ERC1155 balance ${gp1NFTBal}
        `);

        await expectRevert(this.vintageRaiserManagementContract.submitRaiserInProposal(this.daoAddr3, this.user2.address), "revert");

        console.log(`mint ERC1155 to user2...`);
        await this.testERC1155.mint(this.user2.address, 1, 2, hexToBytes(toHex(2233)));
        console.log(`minted...`);

        gp1NFTBal = await this.testERC1155.balanceOf(this.user2.address, 1);
        console.log(`
        user2 NFT balance ${gp1NFTBal}
        `);

        await this.vintageRaiserManagementContract.submitRaiserInProposal(this.daoAddr3, this.user2.address);
    });

    it("verify raiser whitelist memberhsip...", async () => {
        await expectRevert(this.vintageRaiserManagementContract.submitRaiserInProposal(this.daoAddr4, this.gp2.address), "revert");
        await this.vintageRaiserManagementContract.submitRaiserInProposal(this.daoAddr4, this.gp1.address);
    });

    it("verify raiser deposit memberhsip...", async () => {
        await expectRevert(this.vintageRaiserManagementContract.submitRaiserInProposal(this.daoAddr4, this.gp2.address), "revert");
        await this.vintageRaiserManagementContract.submitRaiserInProposal(this.daoAddr4, this.gp1.address);
    });
});

describe("voting....", () => {

    before("deploy contracts...", async () => {
        let [owner,
            user1, user2,
            investor1, investor2,
            gp1, gp2,
            project_team1, project_team2,
            genesis_raiser1, genesis_raiser2,
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
        this.genesis_raiser1 = genesis_raiser1;
        this.genesis_raiser2 = genesis_raiser2;
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

        const _daoName1 = "my_vintage_dao1";
        const _daoName2 = "my_vintage_dao2";
        const _daoName3 = "my_vintage_dao3";
        const _daoName4 = "my_vintage_dao4";
        const _daoName5 = "my_vintage_dao5";
        const _daoName6 = "my_vintage_dao6";
        const _daoName7 = "my_vintage_dao7";
        const _daoName8 = "my_vintage_dao8";
        const _daoName9 = "my_vintage_dao9";
        const _daoName10 = "my_vintage_dao10";

        const { dao, factories, adapters, extensions, testContracts } = await deployDefaultDao({
            owner: this.owner,
            daoMode: 0,//  Vintage = 0, Flex = 1,   Collective = 2,
            daoName: "init dao"
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
        this.summonDao = this.adapters.summonVintageDao.instance;
        this.summonVintageDao = this.adapters.summonVintageDao.instance;

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.vintageFundingPoolFactory.address
        ];

        const _daoName = _daoName1;

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
            },
            {
                id: '0xd90e10040720d66c9412cb511e3dbb6ba51669248a7495e763d44ab426893efa',//vintageRaiserManagementContract
                addr: this.vintageRaiserManagementContract.address,
                flags: 138
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
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

        //erc20
        const vintageDaoRaiserMembershipInfo1 = [
            1, // bool enable;
            0, // uint256 varifyType;erc20
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const ERC721 = await hre.ethers.getContractFactory("PixelNFT");
        const erc721 = await ERC721.deploy(4);
        await erc721.deployed();
        this.testERC721 = erc721;
        const vintageDaoRaiserMembershipInfo2 = [
            1, // bool enable;
            1, // uint256 varifyType;erc721
            1, // uint256 minHolding;
            erc721.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const ERC1155 = await hre.ethers.getContractFactory("ERC1155TestToken");
        const erc1155 = await ERC1155.deploy("this is test uri");
        await erc1155.deployed();
        this.testERC1155 = erc1155;
        const vintageDaoRaiserMembershipInfo3 = [
            1, // bool enable;
            2, // uint256 varifyType;erc1155
            2, // uint256 minHolding;
            erc1155.address,  // address tokenAddress;
            1,  // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];
        //whitelist
        const vintageDaoRaiserMembershipInfo4 = [
            1, // bool enable;
            3, // uint256 varifyType;whitelist
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [this.gp1.address] // address[] whiteList;
        ];
        //deposit
        const vintageDaoRaiserMembershipInfo5 = [
            1, // bool enable;
            4, // uint256 varifyType;deposit
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const vintageDaoVotingInfo1 = [
            0,//eligibilityType 0. raiser membership type 1.deposit 2.raiser allocation
            1, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0,//  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0,//uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;  
            66, // uint256 quorum;
            60 * 10,// uint256 votingPeriod;
            60 * 10  // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo2 = [
            0,//eligibilityType 0. raiser membership type 1.deposit 2.raiser allocation
            1, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            1,//  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            1,//uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            2, // uint256 support;  
            2, // uint256 quorum;
            60 * 10,// uint256 votingPeriod;
            60 * 10  // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo3 = [
            0,//eligibilityType 0. raiser membership type 1.deposit 2.raiser allocation
            1, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0,//  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0,//uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;  
            66, // uint256 quorum;
            60 * 10,// uint256 votingPeriod;
            60 * 10  // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo4 = [
            0,//eligibilityType 0. raiser membership type 1.deposit 2.raiser allocation
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0,//  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0,//uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;  
            66, // uint256 quorum;
            60 * 10,// uint256 votingPeriod;
            60 * 10  // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo5 = [
            0,//eligibilityType 0. raiser membership type 1.deposit 2.raiser allocation
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0,//  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0,//uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;  
            66, // uint256 quorum;
            60 * 10,// uint256 votingPeriod;
            60 * 10  // uint256 proposalExecutePeriod;
        ];

        const vintageDaoGenesisRaisers = [this.genesis_raiser1.address, this.genesis_raiser2.address];

        const vintageDaoParams1 = [
            _daoName1,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers
        ];

        const vintageDaoParams2 = [
            _daoName2,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo2,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers
        ];

        const vintageDaoParams3 = [
            _daoName3,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo3,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers
        ];

        const vintageDaoParams4 = [
            _daoName4,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo2,
            vintageDaoGenesisRaisers
        ];

        const vintageDaoParams5 = [
            _daoName5,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo4,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers
        ];


        let obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams1);
        console.log(obj);
        console.log("summon vintage dao1 succeed...", obj.daoAddr);
        this.daoAddr1 = obj.daoAddr;
        const dao1Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr1);
        this.dao1Contract = dao1Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams2);
        console.log("summon vintage dao2 succeed...", obj.daoAddr);
        this.daoAddr2 = obj.daoAddr;
        const dao2Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr2);
        this.dao2Contract = dao2Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams3);
        console.log("summon vintage dao3 succeed...", obj.daoAddr);
        this.daoAddr3 = obj.daoAddr;
        const dao3Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr3);
        this.dao3Contract = dao3Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams4);
        console.log("summon vintage dao4 succeed...", obj.daoAddr);
        this.daoAddr4 = obj.daoAddr;
        const dao4Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr4);
        this.dao4Contract = dao4Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams5);
        console.log("summon vintage dao5 succeed...", obj.daoAddr);
        this.daoAddr5 = obj.daoAddr;
        const dao5Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr5);
        this.dao5Contract = dao5Contract;
    });

    const sommonVintageDao = async (summonDaoContract, daoFactoryContract, vintageDaoParams) => {
        let tx = await summonDaoContract.summonVintageDao(vintageDaoParams);
        let result = await tx.wait();
        const daoAddr = await daoFactoryContract.getDaoAddress(vintageDaoParams[0]);
        console.log("daoAddr ", daoAddr);
        const daoName = await daoFactoryContract.daos(daoAddr);
        return { daoAddr: daoAddr, daoName: daoName };
    };


    it("raiser membership erc20, voting power log2, quorum, support percentage...", async () => {
        let tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        user1 test erc20token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);
        await expectRevert(this.vintageRaiserManagementContract.submitRaiserInProposal(this.daoAddr1, this.user1.address), "revert");

        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("100"));
        await this.testtoken1.transfer(this.genesis_raiser1.address, hre.ethers.utils.parseEther("100"));
        await this.testtoken1.transfer(this.genesis_raiser2.address, hre.ethers.utils.parseEther("100"));
        let isRaiser = await this.dao1Contract.isMember(this.user1.address);

        tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        user1 test token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        user2 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitRaiserInProposal(this.daoAddr1, this.user1.address);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr1, proposalId);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr1, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr1, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr1, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllRaiserWeight(this.daoAddr1);
        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        ${this.vintageVotingAdapterContract.address}
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr1, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, proposalId, 1);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (3 * 60) / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, proposalId);
        isRaiser = await this.dao1Contract.isMember(this.user1.address);
        await this.vintageRaiserManagementContract.processProposal(this.daoAddr1, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr1, proposalId);
        console.log(`
        processed...
        vote result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        proposal ${proposalId} state ${proposalInfo.state}
        user2 is Raiser ${isRaiser}
        minVotes ${minVotes}
        minYes ${minYes}
        votes 3
        `);
    });

    it("raiser membership erc721, voting power log2, quorum, support percentage...", async () => {
        let tt1user1Bal = await this.testERC721.balanceOf(this.user2.address);
        console.log(`
        user2 test erc721token bal ${tt1user1Bal}
        `);
        await expectRevert(this.vintageRaiserManagementContract.submitRaiserInProposal(this.daoAddr2, this.user2.address), "revert");

        await this.testERC721.mintPixel(this.user2.address, 0, 0);
        await this.testERC721.mintPixel(this.user2.address, 0, 1);

        await this.testERC721.mintPixel(this.genesis_raiser1.address, 0, 2);
        await this.testERC721.mintPixel(this.genesis_raiser1.address, 0, 3);

        await this.testERC721.mintPixel(this.genesis_raiser2.address, 1, 0);
        await this.testERC721.mintPixel(this.genesis_raiser2.address, 1, 1);

        let isRaiser = await this.dao2Contract.isMember(this.user2.address);

        tt1user1Bal = await this.testERC721.balanceOf(this.user2.address);
        console.log(`
        user2 test token bal ${tt1user1Bal}
        user2 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitRaiserInProposal(this.daoAddr2, this.user2.address);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr2, proposalId);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr2, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr2, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr2, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllRaiserWeight(this.daoAddr2);

        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        ${this.vintageVotingAdapterContract.address}
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr2, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr2, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr2, proposalId, 1);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (3 * 60) / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr2, proposalId);

        await this.vintageRaiserManagementContract.processProposal(this.daoAddr2, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr2, proposalId);
        isRaiser = await this.dao2Contract.isMember(this.user2.address);
        console.log(`
        processed...
        vote result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        proposal ${proposalId} state ${proposalInfo.state}
        user2 is Raiser ${isRaiser}
        minVotes ${minVotes}
        minYes ${minYes}
        votes 3
        `);
    });

    it("raiser membership erc1155, voting power log2, quorum, support percentage...", async () => {
        let tt1user1Bal = await this.testERC1155.balanceOf(this.investor1.address, 1);

        console.log(`
        investor1 test erc20token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);
        await expectRevert(this.vintageRaiserManagementContract.submitRaiserInProposal(this.daoAddr3, this.investor1.address), "revert");

        await this.testERC1155.mint(this.investor1.address, 1, 2, hexToBytes(toHex(2233)));
        await this.testERC1155.mint(this.genesis_raiser1.address, 1, 2, hexToBytes(toHex(2233)));
        await this.testERC1155.mint(this.genesis_raiser2.address, 1, 2, hexToBytes(toHex(2233)));
        await this.testERC1155.mint(this.owner.address, 1, 2, hexToBytes(toHex(2233)));

        let isRaiser = await this.dao3Contract.isMember(this.investor1.address);

        tt1user1Bal = await this.testERC1155.balanceOf(this.investor1.address, 1);
        console.log(`
        investor1 is Raiser ${isRaiser}
        investor1 test token bal ${tt1user1Bal}
        `);
        const tx = await this.vintageRaiserManagementContract.submitRaiserInProposal(this.daoAddr3, this.investor1.address);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr3, proposalId);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr3, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr3, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr3, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllRaiserWeight(this.daoAddr2);

        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr3, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr3, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr3, proposalId, 1);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (3 * 60) / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr3, proposalId);

        await this.vintageRaiserManagementContract.processProposal(this.daoAddr3, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr3, proposalId);
        isRaiser = await this.dao3Contract.isMember(this.investor1.address);

        console.log(`
        processed...
        vote result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        proposal ${proposalId} state ${proposalInfo.state}
        minVotes ${minVotes}
        minYes ${minYes}
        votes 3
        investor1 is Raiser ${isRaiser}
        `);
    });

    it("raiser membership erc20, voting power log2, quorum, support integer...", async () => {
        let tt1user1Bal = await this.testtoken1.balanceOf(this.investor2.address);
        console.log(`
        investor2 test erc20token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);
        await expectRevert(this.vintageRaiserManagementContract.submitRaiserInProposal(this.daoAddr4, this.investor2.address), "revert");

        await this.testtoken1.transfer(this.investor2.address, hre.ethers.utils.parseEther("100"));
        await this.testtoken1.transfer(this.genesis_raiser1.address, hre.ethers.utils.parseEther("100"));
        await this.testtoken1.transfer(this.genesis_raiser2.address, hre.ethers.utils.parseEther("100"));
        let isRaiser = await this.dao4Contract.isMember(this.investor2.address);

        tt1user1Bal = await this.testtoken1.balanceOf(this.investor2.address);
        console.log(`
        investor2 test token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        investor2 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitRaiserInProposal(this.daoAddr4, this.investor2.address);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr4, proposalId);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr4, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr4, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr4, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllRaiserWeight(this.daoAddr4);
        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        ${this.vintageVotingAdapterContract.address}
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr4, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr4, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr4, proposalId, 1);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const quorum = 2;
        const support = 2;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr4, proposalId);
        isRaiser = await this.dao4Contract.isMember(this.investor2.address);
        await this.vintageRaiserManagementContract.processProposal(this.daoAddr4, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr4, proposalId);
        console.log(`
        processed...
        vote result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        proposal ${proposalId} state ${proposalInfo.state}
        investor2 is Raiser ${isRaiser}
        quorum ${quorum}
        support ${support}
        votes 3
        `);
    });

    it("raiser membership whitelist, quorum, support integer...", async () => {
        await expectRevert(this.vintageRaiserManagementContract.submitRaiserInProposal(this.daoAddr5, this.gp2.address), "revert");

        let isRaiser = await this.dao5Contract.isMember(this.gp1.address);

        console.log(`
        gp1 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitRaiserInProposal(this.daoAddr5, this.gp1.address);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr5, proposalId);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr5, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr5, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr5, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllRaiserWeight(this.daoAddr5);
        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr5, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr5, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr5, proposalId, 1);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const quorum = 2;
        const support = 2;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr5, proposalId);
        isRaiser = await this.dao5Contract.isMember(this.gp1.address);
        await this.vintageRaiserManagementContract.processProposal(this.daoAddr5, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr5, proposalId);
        console.log(`
        processed...
        vote result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        proposal ${proposalId} state ${proposalInfo.state}
        investor2 is Raiser ${isRaiser}
        quorum ${quorum}
        support ${support}
        votes 3
        `);
    });
});

describe("funding...", () => {
    before("deploy contracts...", async () => {
        let [owner,
            user1, user2,
            investor1, investor2,
            gp1, gp2,
            project_team1, project_team2,
            genesis_raiser1, genesis_raiser2,
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
        this.genesis_raiser1 = genesis_raiser1;
        this.genesis_raiser2 = genesis_raiser2;
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

        const _daoName1 = "my_vintage_dao1";
        const _daoName2 = "my_vintage_dao2";
        const _daoName3 = "my_vintage_dao3";
        const _daoName4 = "my_vintage_dao4";
        const _daoName5 = "my_vintage_dao5";
        const _daoName6 = "my_vintage_dao6";
        const _daoName7 = "my_vintage_dao7";
        const _daoName8 = "my_vintage_dao8";
        const _daoName9 = "my_vintage_dao9";
        const _daoName10 = "my_vintage_dao10";

        const { dao, factories, adapters, extensions, testContracts } = await deployDefaultDao({
            owner: this.owner,
            daoMode: 0,//  Vintage = 0, Flex = 1,   Collective = 2,
            daoName: "init dao"
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
        this.vintageFundingAdapterContract = adapters.vintageFundingAdapterContract.instance;
        this.vintageVesting = adapters.vintageVesting.instance;
        this.vintageAllocationAdapterContract = adapters.vintageAllocationAdapterContract.instance;

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
        this.summonDao = this.adapters.summonVintageDao.instance;
        this.summonVintageDao = this.adapters.summonVintageDao.instance;

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.vintageFundingPoolFactory.address
        ];

        const _daoName = _daoName1;

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
            },
            {
                id: '0xd90e10040720d66c9412cb511e3dbb6ba51669248a7495e763d44ab426893efa',//vintageRaiserManagementContract
                addr: this.vintageRaiserManagementContract.address,
                flags: 138
            },
            {
                id: '0x0fd8cce4ef00a7a8c0c5f91194bc80f122deefe664dd2a2384687da62ab117d1',//VintageFundingAdapterContract
                addr: this.vintageFundingAdapterContract.address,
                flags: 258
            },
            {
                id: '0x99d271900d627893bad1d8649a7d7eb3501c339595ec52be94d222433d755603',//vintageAllocationAdapterContract
                addr: this.vintageAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x8295fbcf0c0d839b7cf11cacb43f22c81604fd9f0e4b295ff1d641ad9dd5786a',//vintageVestingContract
                addr: this.vintageVesting.address,
                flags: 0
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
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

        //erc20
        const vintageDaoRaiserMembershipInfo1 = [
            1, // bool enable;
            0, // uint256 varifyType;erc20
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const ERC721 = await hre.ethers.getContractFactory("PixelNFT");
        const erc721 = await ERC721.deploy(4);
        await erc721.deployed();
        this.testERC721 = erc721;
        const vintageDaoRaiserMembershipInfo2 = [
            1, // bool enable;
            1, // uint256 varifyType;erc721
            1, // uint256 minHolding;
            erc721.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const ERC1155 = await hre.ethers.getContractFactory("ERC1155TestToken");
        const erc1155 = await ERC1155.deploy("this is test uri");
        await erc1155.deployed();
        this.testERC1155 = erc1155;
        const vintageDaoRaiserMembershipInfo3 = [
            1, // bool enable;
            2, // uint256 varifyType;erc1155
            2, // uint256 minHolding;
            erc1155.address,  // address tokenAddress;
            1,  // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];
        //whitelist
        const vintageDaoRaiserMembershipInfo4 = [
            1, // bool enable;
            3, // uint256 varifyType;whitelist
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [this.gp1.address] // address[] whiteList;
        ];
        //deposit
        const vintageDaoRaiserMembershipInfo5 = [
            1, // bool enable;
            4, // uint256 varifyType;deposit
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const vintageDaoVotingInfo1 = [
            0,//eligibilityType 0. raiser membership type 1.deposit 2.raiser allocation
            1, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0,//  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0,//uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;  
            66, // uint256 quorum;
            60 * 10,// uint256 votingPeriod;
            60 * 10  // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo2 = [
            0,//eligibilityType 0. raiser membership type 1.deposit 2.raiser allocation
            1, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            1,//  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            1,//uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            2, // uint256 support;  
            2, // uint256 quorum;
            60 * 10,// uint256 votingPeriod;
            60 * 10  // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo3 = [
            0,//eligibilityType 0. raiser membership type 1.deposit 2.raiser allocation
            1, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0,//  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0,//uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;  
            66, // uint256 quorum;
            60 * 10,// uint256 votingPeriod;
            60 * 10  // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo4 = [
            0,//eligibilityType 0. raiser membership type 1.deposit 2.raiser allocation
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0,//  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0,//uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;  
            66, // uint256 quorum;
            60 * 10,// uint256 votingPeriod;
            60 * 10  // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo5 = [
            0,//eligibilityType 0. raiser membership type 1.deposit 2.raiser allocation
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0,//  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0,//uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;  
            66, // uint256 quorum;
            60 * 10,// uint256 votingPeriod;
            60 * 10  // uint256 proposalExecutePeriod;
        ];

        const vintageDaoGenesisRaisers = [this.genesis_raiser1.address, this.genesis_raiser2.address];

        const vintageDaoParams1 = [
            _daoName1,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers
        ];

        const vintageDaoParams2 = [
            _daoName2,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo2,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers
        ];

        const vintageDaoParams3 = [
            _daoName3,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo3,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers
        ];

        const vintageDaoParams4 = [
            _daoName4,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo2,
            vintageDaoGenesisRaisers
        ];

        const vintageDaoParams5 = [
            _daoName5,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo4,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers
        ];


        let obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams1);
        console.log(obj);
        console.log("summon vintage dao1 succeed...", obj.daoAddr);
        this.daoAddr1 = obj.daoAddr;
        const dao1Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr1);
        this.dao1Contract = dao1Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams2);
        console.log("summon vintage dao2 succeed...", obj.daoAddr);
        this.daoAddr2 = obj.daoAddr;
        const dao2Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr2);
        this.dao2Contract = dao2Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams3);
        console.log("summon vintage dao3 succeed...", obj.daoAddr);
        this.daoAddr3 = obj.daoAddr;
        const dao3Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr3);
        this.dao3Contract = dao3Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams4);
        console.log("summon vintage dao4 succeed...", obj.daoAddr);
        this.daoAddr4 = obj.daoAddr;
        const dao4Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr4);
        this.dao4Contract = dao4Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams5);
        console.log("summon vintage dao5 succeed...", obj.daoAddr);
        this.daoAddr5 = obj.daoAddr;
        const dao5Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr5);
        this.dao5Contract = dao5Contract;
    });

    const sommonVintageDao = async (summonDaoContract, daoFactoryContract, vintageDaoParams) => {
        let tx = await summonDaoContract.summonVintageDao(vintageDaoParams);
        let result = await tx.wait();
        const daoAddr = await daoFactoryContract.getDaoAddress(vintageDaoParams[0]);
        console.log("daoAddr ", daoAddr);
        const daoName = await daoFactoryContract.daos(daoAddr);
        return { daoAddr: daoAddr, daoName: daoName };
    };

    const createFundingProposal = async (vintageFundingAdapterContract, proposer, dao, params) => {
        const tx = await vintageFundingAdapterContract.connect(proposer).submitProposal(dao, params);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        return proposalId;
    };

    const createFundRaiseProposal = async (vintageFundRaiseAdapterContract, params) => {
        const tx = await vintageFundRaiseAdapterContract.submitProposal(params);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        return proposalId;
    }

    it("varify funding proposal...", async () => {
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr1);
        const vintageFundingAdapterContract = this.vintageFundingAdapterContract;
        const vintageVesting = this.vintageVesting;
        const vintageFundingPoolAdapterContract = this.vintageFundingPoolAdapterContract;
        const vintageVotingAdapterContract = this.vintageVotingAdapterContract;
        const vintageAllocationAdapterContract = this.vintageAllocationAdapterContract;

        const fundRaiseMinTarget = hre.ethers.utils.parseEther("10000");
        const fundRaiseMaxCap = hre.ethers.utils.parseEther("20000");
        const lpMinDepositAmount = hre.ethers.utils.parseEther("100");
        const lpMaxDepositAmount = hre.ethers.utils.parseEther("10000");
        const fundRaiseType = 0; // 0 FCFS 1 Free In

        //submit fund raise proposal
        const proposalFundRaiseInfo = [
            fundRaiseMinTarget,
            fundRaiseMaxCap,
            lpMinDepositAmount,
            lpMaxDepositAmount,
            fundRaiseType // 0 FCFS 1 Free In
        ];
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const startTime = blocktimestamp + 60 * 1;
        const endTime = startTime + 60 * 60 * 2;
        const fundTerm = 60 * 60 * 24 * 30;
        const redemptPeriod = 60 * 60 * 1;
        const redemptInterval = 60 * 60 * 24 * 7;
        const returnPeriod = 60 * 60 * 1;
        const proposalTimeInfo = [
            startTime,
            endTime,
            fundTerm,
            redemptPeriod,
            redemptInterval,
            returnPeriod
        ];

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004");//0.4%
        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            redepmtFeeRatio
        ];


        const managementFeeAddress = this.user1.address;
        const fundRaiseTokenAddress = this.testtoken1.address;
        const proposalAddressInfo = [
            managementFeeAddress,
            fundRaiseTokenAddress
        ];

        const fundFromInverstor = hre.ethers.utils.parseEther("0.004");
        const projectTokenFromInvestor = hre.ethers.utils.parseEther("0.004");
        const proposerReward = [
            fundFromInverstor,
            projectTokenFromInvestor
        ];

        const fundRaiseParams = [
            this.daoAddr1,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward
        ],

        const fundRaiserProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams);
        console.log(`
        fund raise proposal created ${fundRaiserProposalId}
        vote for proposal...
        `);

        await vintageVotingAdapterContract.submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, fundRaiserProposalId);
        const stopVoteTime = fundRaiseProposalInfo.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        console.log(`
        voted. processing...
        `);
        await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr1, fundRaiserProposalId);
        fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, fundRaiserProposalId);
        console.log(`
        processed...
        state ${fundRaiseProposalInfo.state}
        `);

        //deposit
        await this.testtoken1.approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.connect(this.investor1).approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("10000"));

        await vintageFundingPoolAdapterContract.deposit(this.daoAddr1, hre.ethers.utils.parseEther("10000"));
        await vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("10000"));

        let bal = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        let bal1 = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);

        console.log(`
        deposited ${hre.ethers.utils.formatEther(bal)}
        deposited ${hre.ethers.utils.formatEther(bal1)}

        process fund raise...
        `);

        await vintageFundingPoolAdapterContract.processFundRaise(this.daoAddr1);

        // Submit funding proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("3000");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const vestingStartTime = blocktimestamp + 24;
        const vetingEndTime = vestingStartTime + 60 * 60 * 2;
        const vestingCliffEndTime = vestingStartTime + 60 * 60 * 1;
        const vestingInterval = 60 * 10;

        // const stepPercentage=hre.ethers.utils.parseEther("1").div(toBN(steps));
        const vestingCliffLockAmount = hre.ethers.utils.parseEther("0.3");

        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = this.testtoken2.address;
        const GPAddr = await dao.getAddressConfiguration(sha3("GP_ADDRESS"));
        const DaoSquareAddr = await vintageFundingAdapterContract.protocolAddress();

        // managementFeeRatio = await dao.getConfiguration(sha3("MANAGEMENT_FEE"))
        // const protocolFeeRatio = await dao.getConfiguration(sha3("PROTOCOL_FEE"));
        await this.testtoken2.transfer(this.project_team1.address, tradingOffTokenAmount);
        await this.testtoken2.connect(this.project_team1).approve(vintageFundingAdapterContract.address, tradingOffTokenAmount);

        const fundRaiseEndTime = await vintageFundingPoolAdapterContract.getFundRaiseWindowCloseTime(this.daoAddr1);
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(fundRaiseEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseEndTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        const approver = this.owner.address;
        const escrow = true;
        const price = hre.ethers.utils.parseEther("0.3");
        const receiver = this.project_team1.address;
        console.log(`
        create funding proposal...
        `);

        const fundingInfo = [
            requestedFundAmount,
            this.testtoken1.address,
            receiver
        ]

        const returnTokenInfo = [
            escrow,
            projectTeamTokenAddr,
            price,
            "0",
            approver
        ]

        const vestingInfo = [
            vestingStartTime,
            vetingEndTime,
            vestingCliffEndTime,
            vestingCliffLockAmount,
            vestingInterval
        ]
        const params = [fundingInfo, returnTokenInfo, vestingInfo]

        const proposer = this.genesis_raiser1;

        let proposalId = await createFundingProposal(
            vintageFundingAdapterContract,
            proposer,
            this.daoAddr1,
            params
        );
        console.log(`new funding proposalId: ${hre.ethers.utils.toUtf8String(proposalId)}`);
        this.proposalId = proposalId;

        console.log(`
        approve return token...
        start voting...
        `);

        await this.testtoken2.approve(vintageFundingAdapterContract.address, requestedFundAmount.
            div(price).
            mul(hre.ethers.utils.parseEther("1")));

        await vintageFundingAdapterContract.startVotingProcess(this.daoAddr1, proposalId);

        let fundingProposalInfo = await vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId);

        console.log(`
        funding proposal state ${fundingProposalInfo.status}
        voting...
        `);

        await vintageVotingAdapterContract.submitVote(this.daoAddr1, proposalId, 1);
        fundingProposalInfo = await vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundingProposalInfo.proposalTimeInfo.proposalStopVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        const rel = await vintageVotingAdapterContract.voteResult(this.daoAddr1, proposalId);
        console.log(`voting reuslt ${rel.state}`);

        let protocolAddressBal = await this.testtoken1.balanceOf(DaoSquareAddr);
        let gpAddressBal = await this.testtoken1.balanceOf(GPAddr);
        let proposerBal = await this.testtoken1.balanceOf(proposer.address);
        console.log(`
        protocolAddressBal ${hre.ethers.utils.formatEther(protocolAddressBal)}
        gpAddressBal ${hre.ethers.utils.formatEther(gpAddressBal)}
        proposerBal ${hre.ethers.utils.formatEther(proposerBal)}
        `)

        console.log(`
        process funding proposal...
        `);
        await vintageFundingAdapterContract.processProposal(this.daoAddr1, proposalId);

        protocolAddressBal = await this.testtoken1.balanceOf(DaoSquareAddr);
        gpAddressBal = await this.testtoken1.balanceOf(GPAddr);
        proposerBal = await this.testtoken1.balanceOf(proposer.address);

        fundingProposalInfo = await vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId);

        const vestingOwnerEligible = await vintageAllocationAdapterContract.ifEligible(this.daoAddr1, this.owner.address, proposalId);
        const vestinginvestor1Eligible = await vintageAllocationAdapterContract.ifEligible(this.daoAddr1, this.investor1.address, proposalId);


        console.log(`
        processed...
        funding proposal state ${fundingProposalInfo.status}
        protocolAddressBal ${hre.ethers.utils.formatEther(protocolAddressBal)}
        gpAddressBal ${hre.ethers.utils.formatEther(gpAddressBal)}
        proposerBal ${hre.ethers.utils.formatEther(proposerBal)}
        vestingOwnerEligible ${vestingOwnerEligible}
        vestinginvestor1Eligible ${vestinginvestor1Eligible}
        `);

        console.log(`
        crate vesting...
        `);
        let tx = await vintageVesting.connect(this.investor1).createVesting(dao.address, this.investor1.address, this.proposalId);
        let result = await tx.wait();
        let vestId = result.events[result.events.length - 1].args.vestId;

        tx = await vintageVesting.connect(this.owner).createVesting(dao.address, this.owner.address, this.proposalId);
        result = await tx.wait();
        let vestId1 = result.events[result.events.length - 1].args.vestId;

        tx = await vintageVesting.connect(proposer).createVesting(dao.address, proposer.address, this.proposalId);
        result = await tx.wait();
        let vestId2 = result.events[result.events.length - 1].args.vestId;

        console.log(`
        created. vestId ${vestId}
        created. vestId1 ${vestId1}
        created. vestId2 ${vestId2}

        claime token...
        `);
        // const vestingStartTime = fundingProposalInfo.vestInfo.vestingStartTime;
        const vetingEndTime1 = fundingProposalInfo.vestInfo.vetingEndTime;
        const vestingCliffEndTime1 = fundingProposalInfo.vestInfo.vestingCliffEndTime;
        const vestingCliffLockAmount1 = fundingProposalInfo.vestInfo.vestingCliffLockAmount;
        const vestingInterval1 = fundingProposalInfo.vestInfo.vestingInterval;

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(vetingEndTime1) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(vetingEndTime1) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        let vestInfo = await vintageVesting.vests(vestId);
        let vestInfo1 = await vintageVesting.vests(vestId1);
        let vestInfo2 = await vintageVesting.vests(vestId2);

        let claimableBal = await vintageVesting.vestBalance(vestId);
        let claimableBal1 = await vintageVesting.vestBalance(vestId1);
        let claimableBal2 = await vintageVesting.vestBalance(vestId2);

        // let totalDepositAmount = toBN(vestInfo.cliffShares.toString()).add(toBN(vestInfo.stepShares).mul(vestingSteps));
        console.log(`
        cliff shares ${hre.ethers.utils.formatEther(vestInfo.cliffShares.toString())}
        step shares ${hre.ethers.utils.formatEther(vestInfo.stepShares.toString())}
        steps ${vestInfo.steps}
        recipient of vest ${vestId}: ${vestInfo.recipient}
        claimable balance of vest ${vestId}: ${hre.ethers.utils.formatEther(claimableBal)}
        total ${parseFloat(hre.ethers.utils.formatEther(vestInfo.cliffShares.toString())) + parseFloat(hre.ethers.utils.formatEther(vestInfo.stepShares.toString())) * parseFloat(vestInfo.steps)}

        vest1 cliff shares ${hre.ethers.utils.formatEther(vestInfo1.cliffShares.toString())}
        step shares ${hre.ethers.utils.formatEther(vestInfo1.stepShares.toString())}
        steps ${vestInfo1.steps}
        recipient of vest ${vestId1}: ${vestInfo1.recipient}
        claimable balance of vest ${vestId1}: ${hre.ethers.utils.formatEther(claimableBal1)}
        total ${parseFloat(hre.ethers.utils.formatEther(vestInfo1.cliffShares.toString())) + parseFloat(hre.ethers.utils.formatEther(vestInfo1.stepShares.toString())) * parseFloat(vestInfo1.steps)}
      
        vest2 cliff shares ${hre.ethers.utils.formatEther(vestInfo2.cliffShares.toString())}
        step shares ${hre.ethers.utils.formatEther(vestInfo2.stepShares.toString())}
        steps ${vestInfo2.steps}
        recipient of vest ${vestId2}: ${vestInfo2.recipient}
        claimable balance of vest ${vestId2}: ${hre.ethers.utils.formatEther(claimableBal2)}
        total ${parseFloat(hre.ethers.utils.formatEther(vestInfo2.cliffShares.toString()))
            + parseFloat(hre.ethers.utils.formatEther(vestInfo2.stepShares.toString()))
            * parseFloat(vestInfo2.steps)}
        `);

        await vintageVesting.connect(this.investor1).withdraw(dao.address, vestId);
        await vintageVesting.connect(this.owner).withdraw(dao.address, vestId1);
        await vintageVesting.connect(proposer).withdraw(dao.address, vestId2);

        claimableBal = await vintageVesting.vestBalance(vestId);
        claimableBal1 = await vintageVesting.vestBalance(vestId1);
        claimableBal2 = await vintageVesting.vestBalance(vestId2);

        vestInfo = await vintageVesting.vests(vestId);
        vestInfo1 = await vintageVesting.vests(vestId1);
        vestInfo2 = await vintageVesting.vests(vestId2);

        console.log(`
        claimable balance of vest ${vestId}: ${hre.ethers.utils.formatEther(claimableBal)}
        claimed amount of vest ${vestId}: ${hre.ethers.utils.formatEther(vestInfo.claimed)}

        claimable balance of vest1 ${vestId1}: ${hre.ethers.utils.formatEther(claimableBal1)}
        claimed amount of vest1 ${vestId1}: ${hre.ethers.utils.formatEther(vestInfo1.claimed)}

        claimable balance of vest2 ${vestId2}: ${hre.ethers.utils.formatEther(claimableBal2)}
        claimed amount of vest2 ${vestId2}: ${hre.ethers.utils.formatEther(vestInfo2.claimed)}
        `);

    });
});