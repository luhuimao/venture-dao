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
} = require("../../utils/contract-util");
const {
    checkBalance,
    depositToFundingPool,
    createDistributeFundsProposal
} = require("../../utils/test-util");

const {
    expectRevert,
    expect,
    DaoFactory,
    DaoRegistry,
    FundingPoolExtension,
    web3,
    accounts
} = require("../../utils/oz-util");

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
} from "../../utils/hh-util";
import {
    createDao
} from "../../utils/deployment-util1";
import {
    LogDescription,
    zeroPad
} from "ethers/lib/utils";
import {
    boolean
} from "hardhat/internal/core/params/argumentTypes";
import {
    deserialize
} from "v8";
import { isAsyncFunction } from "util/types";
import { accessSync } from "fs";
const hre = require("hardhat");

describe("clear fund proposal...", () => {
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

        this.flexFundingPoolExtension = extensions.flexFundingPoolExt.functions;

        this.testtoken1 = testContracts.testToken1.instance;
        this.testtoken2 = testContracts.testRiceToken.instance;
        this.flexVesting = adapters.flexVesting.instance;
        this.flexERC721 = adapters.flexERC721.instance;
        // this.flexVestingERC721 = utilContracts.flexVestingERC721.instance;
        this.flexAllocationAdapterContract = adapters.flexAllocationAdapterContract.instance;
        this.flexFundingPoolAdapterContract = adapters.flexFundingPoolAdapterContract.instance;
        this.flexVotingContract = adapters.flexVotingContract.instance;
        this.flexFundingAdapterContract = adapters.flexFundingAdapterContract.instance;
        this.flexStewardAllocation = adapters.flexStewardAllocation.instance;
        this.flexStewardMangement = this.adapters.stewardManagementContract.instance;
        this.flexPollingVotingContract = adapters.flexPollingVotingContract.instance;
        this.flexFundingReturnTokenAdapterContract = adapters.flexFundingReturnTokenAdapterContract.instance;
        this.flexFreeInEscrowFundAdapterContract = adapters.flexFreeInEscrowFundAdapterContract.instance;
        this.flexFundingHelperAdapterContract = adapters.flexFundingHelperAdapterContract.instance;
        this.flexDaoSetAdapterContract = adapters.flexDaoSetAdapterContract.instance;
        this.flexDaoSetHelperAdapterContract = adapters.flexDaoSetHelperAdapterContract.instance;
        this.flexDaoSetPollingAdapterContract = adapters.flexDaoSetPollingAdapterContract.instance;
        this.flexDaoSetVotingAdapterContract = adapters.flexDaoSetVotingAdapterContract.instance;

        this.colletiveGovernorManagementContract = adapters.colletiveGovernorManagementContract.instance;
        this.colletiveDaoSetProposalContract = adapters.colletiveDaoSetProposalContract.instance;
        this.colletiveFundingProposalContract = adapters.colletiveFundingProposalContract.instance;
        this.collectiveVotingContract = adapters.collectiveVotingContract.instance;
        this.colletiveFundingPoolContract = adapters.colletiveFundingPoolContract.instance;
        this.collectiveFundingPoolHelperContract = adapters.collectiveFundingPoolHelperAdapterContract.instance;
        this.colletiveFundRaiseProposalContract = adapters.colletiveFundRaiseProposalContract.instance;
        this.bentoBoxV1 = adapters.bentoBoxV1.instance;
        this.collectivePaybackTokenAdapterContract = this.adapters.collectivePaybackTokenAdapterContract.instance;
        this.collectiveAllocationAdapterContract = this.adapters.collectiveAllocationAdapterContract.instance;
        this.collectiveDistributeAdatperContract = this.adapters.collectiveDistributeAdatperContract.instance;
        this.collectiveVestingContract = this.adapters.collectiveVestingContract.instance;
        this.collectiveEscrowFundAdapterContract = this.adapters.collectiveEscrowFundAdapterContract.instance;
        this.colletiveTopUpProposalContract = this.adapters.colletiveTopUpProposalContract.instance;
        this.colletiveExpenseProposalContract = this.adapters.colletiveExpenseProposalContract.instance;
        this.collectiveFreeInEscrowFundAdapterContract = this.adapters.collectiveFreeInEscrowFundAdapterContract.instance;
        this.colletiveClearFundProposalAdapterContract = this.adapters.colletiveClearFundProposalAdapterContract.instance;
        this.collectiveRedemptionFeeEscrowAdapterContract = this.adapters.collectiveRedemptionFeeEscrowAdapterContract.instance;
        this.colletiveSetRiceReceiverProposalAdapterContract = this.adapters.colletiveSetRiceReceiverProposalAdapterContract.instance;

        this.summonCollectiveDao = this.adapters.summonCollectiveDao.instance;


        const VestingERC721Helper = await hre.ethers.getContractFactory("VestingERC721Helper");
        const vestingERC721Helper = await VestingERC721Helper.deploy();
        await vestingERC721Helper.deployed();
        this.vestingERC721Helper = vestingERC721Helper;

        const VestingERC721 = await hre.ethers.getContractFactory("VestingERC721");
        const vestingERC721 = await VestingERC721.deploy(
            "DAOSquare Investment Vesting",
            "DIV",
            this.flexVesting.address,
            this.flexVesting.address,
            this.collectiveVestingContract.address,
            this.vestingERC721Helper.address
        );
        await vestingERC721.deployed();
        this.vestingERC721 = vestingERC721;

        const ERC20TokenDecimals = await hre.ethers.getContractFactory("ERC20TokenDecimals");
        const eRC20TokenDecimals = await ERC20TokenDecimals.deploy(100000000, 6);
        await eRC20TokenDecimals.deployed();
        this.erc20TokenDecimals = eRC20TokenDecimals;
        const decimals = await eRC20TokenDecimals.decimals();
        const bal = await eRC20TokenDecimals.balanceOf(this.owner.address);
        console.log("ERC20TokenDecimals deployed...");
        console.log("decimals ", decimals);
        console.log("bal ", bal);

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.collectiveFundingPoolFactory.address
        ];
        _daoName = "my_collective_dao002";

        const creator = this.owner.address;

        const enalbeAdapters = [
            {
                id: '0xdac6d9ce728ebc92a61253866b4e5a4c73b76ba0aa11e7297a633f6232f54237', //colletiveDaoSetProposalContract
                addr: this.colletiveDaoSetProposalContract.address,
                flags: 1794058
            },
            {
                id: '0x1a4f1390baec30049008138e650571a3c4374eba88116bc89dc192f2f9295efe', //colletiveGovernorManagementContract
                addr: this.colletiveGovernorManagementContract.address,
                flags: 6338
            },
            {
                id: '0x907642cbfe4e58ddd14eaa320923fbe4c29721dd0950ae4cb3b2626e292791ae',//collectiveVotingContract
                addr: this.collectiveVotingContract.address,
                flags: 258
            },
            {
                id: '0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea', //colletiveFundingPoolContract
                addr: this.colletiveFundingPoolContract.address,
                flags: 200
            },
            {
                id: '0xabfafd6b613afcca7174c893807d7a2eb4271cd9c3bbe5ae051c2c378863d745', //collectiveFundingPoolHelperContract
                addr: this.collectiveFundingPoolHelperContract.address,
                flags: 0
            },
            {
                id: '0x3a06648a49edffe95b8384794dfe9cf3ab34782fab0130b4c91bfd53f3407e6b', //colletiveFundRaiseProposalContract
                addr: this.colletiveFundRaiseProposalContract.address,
                flags: 1034
            },
            {
                id: '0x3b8222b84816150ff171ef9b3356ce3d250b8e7c01c09c0208949acc0880db34', //collectivePaybackTokenAdapterContract
                addr: this.collectivePaybackTokenAdapterContract.address,
                flags: 0
            },
            {
                id: '0xbba99fd05ef530e2ad5cae360774c7ec6b1f135b279ab165354152f7dc991c10', //collectiveAllocationAdapterContract
                addr: this.collectiveAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x72894213a5c7f56b36b2947fa6ea18963d6bb1a68746b46d7f552cca76e1a7a8', //colletiveFundingProposalContract
                addr: this.colletiveFundingProposalContract.address,
                flags: 770
            },
            {
                id: '0x183027a84d1b84d3cbf7b351110205fd057b5701a490be772ea6489292256ee3', //collectiveDistributeAdatperContract
                addr: this.collectiveDistributeAdatperContract.address,
                flags: 0
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0x15c9835cf5910308466ec9cbdb6a0be1b9ea161943cc4caf2457bc33d880f197', // collectiveVestingContract
                addr: this.collectiveVestingContract.address,
                flags: 0
            },
            {
                id: '0x372fda66f626a705d3a459960a1457403a7c3564acccedc00092ea70262b7083', // collectiveEscrowFundAdapterContract
                addr: this.collectiveEscrowFundAdapterContract.address,
                flags: 0
            },
            {
                id: '0x3b4de3360220463b2e1b681516ac7919070009f0544e8465d80dc511828dae5b', // colletiveTopUpProposalContract
                addr: this.colletiveTopUpProposalContract.address,
                flags: 4194306
            }, {
                id: '0xd0e09561b13ad01191fc8f65f6fc85651e4f495d3f9ab93d95010ea58382434b', // colletiveExpenseProposalContract
                addr: this.colletiveExpenseProposalContract.address,
                flags: 2097162
            },
            {
                id: '0x4bb6d123745fe9358fe205a70b7a4aae2a445c56d4bc19c9a123a9259ff615a1', // collectiveFreeInEscrowFundAdapterContract
                addr: this.collectiveFreeInEscrowFundAdapterContract.address,
                flags: 0
            },
            {
                id: '0x851d65965a45a40b902ee7de04ff05b19ff7fde56dd486fd3108dc5cd9249f06',//colletiveClearFundProposalAdapterContract
                addr: this.colletiveClearFundProposalAdapterContract.address,
                flags: 8388618
            },
            {
                id: '0x1ec3ab9b73a5166bb51de3096776c3fb06df7dc0a5e2df3038eb0588fad3adbc', // collectiveRedemptionFeeEscrowAdapterContract
                addr: this.collectiveRedemptionFeeEscrowAdapterContract.address,
                flags: 0
            },
            {
                id: '0x9e82e8ea7f567cfdc187328108cbbacfa60391a3b15920f636c4185ecdce21a5', // colletiveSetRiceReceiverProposalAdapterContract
                addr: this.colletiveSetRiceReceiverProposalAdapterContract.address,
                flags: 33554442
            }
        ];

        const adapters1 = [
            {
                id: '0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab',
                addr: this.colletiveFundingPoolContract.address, //collectiveFundingPoolAdapterContract
                flags: 23
            },
            {
                id: '0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab',
                addr: this.collectiveFundingPoolHelperContract.address, //collectiveFundingPoolHelperContract
                flags: 18
            },
            {
                id: '0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab',
                addr: this.colletiveFundingProposalContract.address, //colletiveFundingProposalContract
                flags: 14
            },
            {
                id: '0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab',
                addr: this.collectiveDistributeAdatperContract.address, // vintageDistrubteAdapterContract
                flags: 22
            },
            {
                id: '0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab',
                addr: this.colletiveGovernorManagementContract.address, // colletiveGovernorManagementContract
                flags: 1
            }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const collectiveDaoIvestorCapInfo = [
            true, //bool enable;
            3 //uint256 maxParticipantsAmount;
        ];

        const enable = true;
        const memberEligibilityName = "test name";
        const varifyType = 3;
        const minHolding = 1;
        const tokenAddress = this.testtoken1.address;
        const tokenId = 2;
        const whiteList = [
            this.user1.address,
            this.user2.address,
            this.owner.address,
            this.investor1.address
        ];


        const collectiveGovernorMembershipInfo = [
            enable,
            varifyType,
            minHolding,
            tokenAddress,
            tokenId,
            memberEligibilityName,
            whiteList
        ];

        const votingAssetType = 0; //0. deposit
        const votingPower = 0; //0. quantity 1. log2 2. 1 voter 1 vote
        const support = 23;
        const quorum = 34;
        const supportType = 0; // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
        const quorumType = 0; // 0. - (YES + NO) / Total > X%  1. - YES + NO > X
        const votingPeriod = 60;
        const gracePeriod = 60;
        // const executePeriod = 60;

        const CollectiveDaoVotingInfo = [
            votingAssetType, //0. deposit
            votingPower,//0. quantity 1. log2 2. 1 voter 1 vote
            support,
            quorum,
            supportType, // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            quorumType, // 0. - (YES + NO) / Total > X%  1. - YES + NO > X
            votingPeriod,
            gracePeriod
            // executePeriod
        ]

        const name = _daoName;
        const redemptionFee = hre.ethers.utils.parseEther("0.001"); // 0.2%;
        // const collectiveDaoManagementfee = hre.ethers.utils.parseEther("0.001"); // 0.2%
        const managementFeeAddress = this.gp1.address;
        const proposerInvestTokenReward = hre.ethers.utils.parseEther("0.001"); // 0.2%;
        const proposerPaybackTokenReward = hre.ethers.utils.parseEther("0.001"); // 0.2%;
        const collectiveDaoGenesisGovernor = [
            this.genesis_steward1.address,
            this.genesis_steward2.address
        ];
        const currency = this.erc20TokenDecimals.address;
        const riceRewardReceiver = this.user1.address;

        const CollectiveDaoInfo = [
            name,
            creator,
            currency,
            redemptionFee,
            proposerInvestTokenReward,
            proposerPaybackTokenReward,
            riceRewardReceiver
        ];



        const collectiveDaoParams = [
            daoFactoriesAddress,
            enalbeAdapters,
            adapters1,
            collectiveDaoIvestorCapInfo,
            collectiveGovernorMembershipInfo,
            CollectiveDaoVotingInfo,
            CollectiveDaoInfo
        ];
        // const collectiveDaoParams = [
        //     daoFactoriesAddress,
        //     enalbeAdapters,
        //     adapters1,
        //     [true, 3],
        //     [false, 3, 1, '0x0000000000000000000000000000000000000000', 2, []],
        //     [
        //         0, 0, 23, 34, 0,
        //         0, 120, 60, 60
        //     ],
        //     [
        //         'collective-script0915',
        //         '0xDF9DFA21F47659cf742FE61030aCb0F15f659707',
        //         '0x32Bf9E40E6b94419f2E49DD112231BFAEcAC3B6C',
        //         0,
        //         0,
        //         0,
        //         '0xDF9DFA21F47659cf742FE61030aCb0F15f659707'
        //     ]
        // ];


        const {
            daoAddr,
            daoName
        } = await sommonCollectiveDao(this.summonCollectiveDao, this.daoFactory, collectiveDaoParams);
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        // console.log(`
        // new dao address ${daoAddr}
        // new dao name ${toUtf8(daoName)}
        // `)

        this.collectiveDirectdaoAddress = daoAddr;
        this.daoContract = daoContract;

        const riceReceiver = await daoContract.getAddressConfiguration("0xc77068975ba2254bd67080aa196783f213ee682a15d902d03f33782130cf737d");
        console.log("riceReceiver ", riceReceiver);


        this.collectiveFundingPoolExtContract = (await hre.ethers.getContractFactory("CollectiveInvestmentPoolExtension")).attach((await this.daoContract.getExtensionAddress("0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab")))
    });

    const sommonCollectiveDao = async (summonDaoContract, daoFactoryContract, collectiveDaoParams) => {
        let tx = await summonDaoContract.summonCollectiveDao(collectiveDaoParams);
        let result = await tx.wait();
        const len = collectiveDaoParams.length;
        const daoAddr = await daoFactoryContract.getDaoAddress(collectiveDaoParams[len - 1][0]);
        const daoName = await daoFactoryContract.daos(daoAddr);
        console.log(`
        new dao address ${daoAddr}
        new dao name ${toUtf8(daoName)}
        `)
        return {
            daoAddr: daoAddr,
            daoName: daoName
        };
    };

    it("submitClearFundProposal", async () => {
        await submitGovernorInProposal_GovernorMembershipWhitelist();

        const proposalId = await submitClearFundProposal();
        console.log("created...");
        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );

        await this.collectiveVotingContract.connect(this.user1).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        let clearFundProposalDetail = await this.colletiveClearFundProposalAdapterContract.proposals(
            this.collectiveDirectdaoAddress
            , proposalId);

        if (parseInt(clearFundProposalDetail.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(clearFundProposalDetail.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        let investors = await this.colletiveFundingPoolContract.getAllInvestors(this.collectiveDirectdaoAddress)
        let poolbal = await this.colletiveFundingPoolContract.poolBalance(this.collectiveDirectdaoAddress);
        let members = await this.daoContract.getAllSteward();
        console.log(`
            members   ${members}    
        `);
        await this.colletiveClearFundProposalAdapterContract.processClearFundProposal(
            this.collectiveDirectdaoAddress
            , proposalId);

        members = await this.daoContract.getAllSteward();

        clearFundProposalDetail = await this.colletiveClearFundProposalAdapterContract.proposals(
            this.collectiveDirectdaoAddress
            , proposalId);
        const depositBal = await this.colletiveFundingPoolContract.balanceOf(
            this.collectiveDirectdaoAddress,
            members[0]
        );
        poolbal = await this.colletiveFundingPoolContract.poolBalance(this.collectiveDirectdaoAddress);
        console.log(`
            poolbal   ${poolbal}
            investors  ${investors}
            members   ${members}

            depositBal  ${depositBal}
            proposal state ${clearFundProposalDetail.state}
            poolbal   ${poolbal}
        `);

    });

    it("cant submit new clear fund proposal if operation proposals not finished...", async () => {
        await submitFundingProposal();

        // await this.colletiveClearFundProposalAdapterContract.submitClearFundProposal(
        //     this.collectiveDirectdaoAddress
        // );
        await expectRevert(this.colletiveClearFundProposalAdapterContract.submitClearFundProposal(
            this.collectiveDirectdaoAddress
        ), "revert");


        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        let proposalDetail = await this.colletiveFundingProposalContract.proposals(
            this.collectiveDirectdaoAddress,
            this.fundingProposalId);


        if (parseInt(proposalDetail.timeInfo.stopVotingTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalDetail.timeInfo.stopVotingTime) + 60 * 10]);
            await hre.network.provider.send("evm_mine");
        }

        await this.colletiveFundingProposalContract.processProposal(
            this.collectiveDirectdaoAddress,
            this.fundingProposalId
        );

        const members = await this.daoContract.getAllSteward();
        const depositBal1 = await this.colletiveFundingPoolContract.balanceOf(
            this.collectiveDirectdaoAddress,
            members[0]
        );
        const depositBal2 = await this.colletiveFundingPoolContract.balanceOf(
            this.collectiveDirectdaoAddress,
            members[1]
        );
        console.log(`
            executed funding proposal...
            members  ${members}
            depositBal1   ${depositBal1}
            depositBal2   ${depositBal2}
        `);
    });

    it("cant submit new clear fund proposal if daoset proposals not finished...", async () => {
        this.daosetProposalId = await submitDaoSetInvestorCapProposal();

        // await this.colletiveClearFundProposalAdapterContract.submitClearFundProposal(
        //     this.collectiveDirectdaoAddress
        // );

        await expectRevert(this.colletiveClearFundProposalAdapterContract.submitClearFundProposal(
            this.collectiveDirectdaoAddress
        ), "revert");

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        let proposalDetail = await this.colletiveDaoSetProposalContract.investorCapProposals(this.collectiveDirectdaoAddress,
            this.daosetProposalId);

        if (parseInt(proposalDetail.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalDetail.stopVoteTime) + 60 * 10]);
            await hre.network.provider.send("evm_mine");
        }

        await this.colletiveDaoSetProposalContract.processInvestorCapProposal(
            this.collectiveDirectdaoAddress
            ,
            this.daosetProposalId);
    });

    it("clear fund proposal...", async () => {
        let poolBal = await this.colletiveFundingPoolContract.poolBalance(this.collectiveDirectdaoAddress);
        console.log(`
            poolBal     ${poolBal}
        `)
        const proposalId = await submitFundRaiseProposal();
        const decimals = await this.erc20TokenDecimals.decimals();
        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );

        // await this.collectiveVotingContract.connect(this.user1).submitVote(this.collectiveDirectdaoAddress,
        //     proposalId,
        //     1
        // );

        console.log("voted, execute...");


        let proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(this.collectiveDirectdaoAddress, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.colletiveFundRaiseProposalContract.processProposal(this.collectiveDirectdaoAddress, proposalId);
        let governors = await this.daoContract.getAllSteward();
        proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(this.collectiveDirectdaoAddress, proposalId);

        console.log(`
        proposal state ${proposalDetail.state}
        members ${governors}
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalDetail.timeInfo.startTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalDetail.timeInfo.startTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        await this.testtoken1.approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));
        await this.erc20TokenDecimals.approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        console.log(`
        blocktimestamp                     ${blocktimestamp}
        proposalDetail.timeInfo.endTime  ${proposalDetail.timeInfo.endTime}
        `);
        await this.colletiveFundingPoolContract.deposit(this.collectiveDirectdaoAddress, toBN(1000 * 10 ** 6));

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalDetail.timeInfo.endTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalDetail.timeInfo.endTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        poolBal = await this.colletiveFundingPoolContract.poolBalance(this.collectiveDirectdaoAddress);
        let investors = await this.colletiveFundingPoolContract.getAllInvestors(this.collectiveDirectdaoAddress);

        governors = await this.daoContract.getAllSteward();
        let depbal1 = await this.colletiveFundingPoolContract.balanceOf(this.collectiveDirectdaoAddress,
            governors[0]
        );
        let depbal2 = await this.colletiveFundingPoolContract.balanceOf(this.collectiveDirectdaoAddress,
            governors[1]
        );

        console.log(`
            governors  ${governors}
            depbal1   ${depbal1}
            depbal2   ${depbal2}

            poolBal     ${poolBal}
            investors   ${investors}
            
        `);

        await this.colletiveFundingPoolContract.processFundRaise(this.collectiveDirectdaoAddress);
        const fundState = await this.colletiveFundingPoolContract.fundState(this.collectiveDirectdaoAddress);
        poolBal = await this.colletiveFundingPoolContract.poolBalance(this.collectiveDirectdaoAddress);

        governors = await this.daoContract.getAllSteward();
        depbal1 = await this.colletiveFundingPoolContract.balanceOf(this.collectiveDirectdaoAddress,
            governors[0]
        );
        depbal2 = await this.colletiveFundingPoolContract.balanceOf(this.collectiveDirectdaoAddress,
            governors[1]
        );
        console.log(`
            executed fundraise...
            fundState   ${fundState}
            poolBal     ${poolBal}
         
            members ${governors}

                    ${this.owner.address}
                    ${this.user1.address}
                    ${this.investor1.address}

            depbal1   ${depbal1}
            depbal2   ${depbal2}
        `);
        const clearFundProposalId = await submitClearFundProposal();

        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress,
            clearFundProposalId,
            1
        );
        // await this.collectiveVotingContract.connect(this.user1).submitVote(this.collectiveDirectdaoAddress,
        //     clearFundProposalId,
        //     1
        // );
        // await this.collectiveVotingContract.connect(this.investor1).submitVote(this.collectiveDirectdaoAddress,
        //     clearFundProposalId,
        //     1
        // );

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        let clearFundProposalDetail = await this.colletiveClearFundProposalAdapterContract.proposals(
            this.collectiveDirectdaoAddress
            , clearFundProposalId);

        if (parseInt(clearFundProposalDetail.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(clearFundProposalDetail.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        let liquidationId = await this.colletiveFundingPoolContract.liquidationId(this.collectiveDirectdaoAddress);

        poolBal = await this.colletiveFundingPoolContract.poolBalance(this.collectiveDirectdaoAddress);
        let escrowedFund = await this.collectiveEscrowFundAdapterContract.escrowFundsFromLiquidation(this.collectiveDirectdaoAddress,
            this.erc20TokenDecimals.address,
            this.owner.address,
            liquidationId);
        investors = await this.colletiveFundingPoolContract.getAllInvestors(this.collectiveDirectdaoAddress);
        depbal1 = await this.colletiveFundingPoolContract.balanceOf(this.collectiveDirectdaoAddress,
            investors[0]
        );
        depbal2 = await this.colletiveFundingPoolContract.balanceOf(this.collectiveDirectdaoAddress,
            investors[1]
        );
        let escrowedFund1 = await this.collectiveEscrowFundAdapterContract.escrowFundsFromLiquidation(this.collectiveDirectdaoAddress,
            this.erc20TokenDecimals.address,
            this.investor1.address, liquidationId);
        const FundRaisingTokenAddress = await this.collectiveFundingPoolExtContract.getFundRaisingTokenAddress();
        governors = await this.daoContract.getAllSteward();

        console.log(`
        poolBal        ${poolBal}
        investors    ${investors}
        depbal1   ${depbal1}
        depbal2   ${depbal2}
        liquidationId   ${liquidationId}
        FundRaisingTokenAddress   ${FundRaisingTokenAddress}
        erc20TokenDecimal         ${this.erc20TokenDecimals.address}
        escrowedFund   ${escrowedFund}
        escrowedFund1  ${escrowedFund1}
        members     ${governors}
        execute clear fund proposal...
        `);

        await this.colletiveClearFundProposalAdapterContract.processClearFundProposal(
            this.collectiveDirectdaoAddress,
            clearFundProposalId
        );

        clearFundProposalDetail = await this.colletiveClearFundProposalAdapterContract.proposals(
            this.collectiveDirectdaoAddress
            , clearFundProposalId);

        liquidationId = await this.colletiveFundingPoolContract.liquidationId(
            this.collectiveDirectdaoAddress);

        poolBal = await this.colletiveFundingPoolContract.poolBalance(this.collectiveDirectdaoAddress);
        escrowedFund = await this.collectiveEscrowFundAdapterContract.escrowFundsFromLiquidation(
            this.collectiveDirectdaoAddress,
            this.erc20TokenDecimals.address,
            this.owner.address,
            liquidationId
        );
        escrowedFund1 = await this.collectiveEscrowFundAdapterContract.escrowFundsFromLiquidation(
            this.collectiveDirectdaoAddress,
            this.erc20TokenDecimals.address,
            this.investor1.address,
            liquidationId
        );
        let bal1 = await this.erc20TokenDecimals.balanceOf(this.owner.address);
        let bal2 = await this.erc20TokenDecimals.balanceOf(this.investor1.address);

        depbal1 = await this.colletiveFundingPoolContract.balanceOf(this.collectiveDirectdaoAddress,
            investors[0]
        );
        depbal2 = await this.colletiveFundingPoolContract.balanceOf(this.collectiveDirectdaoAddress,
            investors[1]
        );
        const daoCreator = await this.daoContract.daoCreator();
        governors = await this.daoContract.getAllSteward();

        console.log(`
            governors  ${governors}
            `);
        const mem1 = await this.daoContract.isMember(governors[0]);

        console.log(`
            executed clear fund proposal...
            clear fund proposal state ${clearFundProposalDetail.state}
            poolBal        ${poolBal}
            escrowedFund   ${escrowedFund}
            escrowedFund1  ${escrowedFund1}
            bal1           ${bal1}
            bal2           ${bal2}

            depbal1   ${depbal1}
            depbal2   ${depbal2}
            daoCreator   ${daoCreator}
            governors    ${governors}
            mem1   ${mem1}
            withdraw escrow fund...
        `);


        await this.collectiveEscrowFundAdapterContract.withdrawFromLiquidation(
            this.collectiveDirectdaoAddress,
            this.erc20TokenDecimals.address,
            liquidationId
        );

        // await this.collectiveEscrowFundAdapterContract.connect(this.investor1).withdrawFromLiquidation(
        //     this.collectiveDirectdaoAddress,
        //     this.erc20TokenDecimals.address,
        //     liquidationId
        // );

        escrowedFund = await this.collectiveEscrowFundAdapterContract.escrowFunds(
            this.collectiveDirectdaoAddress,
            this.erc20TokenDecimals.address,
            this.owner.address);
        escrowedFund1 = await this.collectiveEscrowFundAdapterContract.escrowFunds(
            this.collectiveDirectdaoAddress,
            this.erc20TokenDecimals.address,
            this.investor1.address);

        bal1 = await this.erc20TokenDecimals.balanceOf(this.owner.address);
        bal2 = await this.erc20TokenDecimals.balanceOf(this.investor1.address);

        console.log(`
            escrowedFund   ${escrowedFund}
            escrowedFund1  ${escrowedFund1}
            bal1           ${bal1}
            bal2           ${bal2}
            `);


        const proposalId1 = await submitFundRaiseProposal();

        const mems = await this.daoContract.getAllSteward();
        console.log(`
        mems   ${mems}
        `);
        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress,
            proposalId1,
            1
        );

        // await this.collectiveVotingContract.connect(this.user1).submitVote(this.collectiveDirectdaoAddress,
        //     proposalId1,
        //     1
        // );

        // await this.collectiveVotingContract.connect(this.investor1).submitVote(this.collectiveDirectdaoAddress,
        //     proposalId1,
        //     1
        // );

        console.log("voted, execute...");


        proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(this.collectiveDirectdaoAddress,
            proposalId1);
        const stopVoteTime1 = proposalDetail.stopVoteTime;

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime1) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime1) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.colletiveFundRaiseProposalContract.processProposal(this.collectiveDirectdaoAddress, proposalId1);

        proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(this.collectiveDirectdaoAddress,
            proposalId1);

        console.log(`
        fund raise proposal state ${proposalDetail.state}
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalDetail.timeInfo.startTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalDetail.timeInfo.startTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.testtoken1.approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));
        await this.erc20TokenDecimals.approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        console.log(`
        blocktimestamp                    ${blocktimestamp}
        proposalDetail.timeInfo.startTime ${proposalDetail.timeInfo.startTime}
        proposalDetail.timeInfo.endTime   ${proposalDetail.timeInfo.endTime}
        `);

        await this.colletiveFundingPoolContract.deposit(this.collectiveDirectdaoAddress, toBN(1000 * 10 ** 6));

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalDetail.timeInfo.endTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalDetail.timeInfo.endTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        await this.colletiveFundingPoolContract.processFundRaise(this.collectiveDirectdaoAddress);
        governors = await this.daoContract.getAllSteward();
        console.log(`
            executed fund raise...
            members ${governors}
        `);
    });

    it("new member clear fund proposal", async () => {
        // await submitGovernorInProposal_GovernorMembershipWhitelist();


        const proposalId = await submitClearFundProposal();

        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );

        let votingweight1 = await this.collectiveVotingContract.getVotingWeight(this.collectiveDirectdaoAddress, this.owner.address);
        let votingweight2 = await this.collectiveVotingContract.getVotingWeightByDepositAmount(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("100000"));

        console.log(`
        votingweight1    ${votingweight1}
        votingweight2    ${votingweight2}

        `);
        // await this.collectiveVotingContract.connect(this.user1).submitVote(this.collectiveDirectdaoAddress,
        //     proposalId,
        //     1
        // );

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        let clearFundProposalDetail = await this.colletiveClearFundProposalAdapterContract.proposals(
            this.collectiveDirectdaoAddress
            , proposalId);

        if (parseInt(clearFundProposalDetail.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(clearFundProposalDetail.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        const fundState = await this.colletiveFundingPoolContract.fundState(this.collectiveDirectdaoAddress);
        let members = await this.daoContract.getAllSteward();
        console.log(`
            members  ${members}
        `);
        let bal1 = await this.colletiveFundingPoolContract.balanceOf(this.collectiveDirectdaoAddress,
            members[0]
        );
        console.log(`
        members   ${members}
        fundState   ${fundState}
        bal1  ${bal1}
        `);
        await this.colletiveClearFundProposalAdapterContract.processClearFundProposal(
            this.collectiveDirectdaoAddress
            , proposalId);
        clearFundProposalDetail = await this.colletiveClearFundProposalAdapterContract.proposals(
            this.collectiveDirectdaoAddress
            , proposalId);
        votingweight1 = await this.collectiveVotingContract.getVotingWeight(this.collectiveDirectdaoAddress, this.owner.address);
        votingweight2 = await this.collectiveVotingContract.getVotingWeightByDepositAmount(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("100000"));
        bal1 = await this.colletiveFundingPoolContract.balanceOf(this.collectiveDirectdaoAddress,
            members[0]
        );
      
        members = await this.daoContract.getAllSteward();
        console.log(`
            propsal state  ${clearFundProposalDetail.state}
            votingweight1    ${votingweight1}
            votingweight2    ${votingweight2}
            bal1  ${bal1}
            members   ${members}
        `);
    });

    const submitFundingProposal = async () => {
        let dao = this.collectiveDirectdaoAddress;
        let tokenAddress = this.erc20TokenDecimals.address;
        const fundingpoolextensionAddr = await this.daoContract.getExtensionAddress(sha3("collective-funding-pool-ext"));
        const collectiveFundingPoolExtContract = (await hre.ethers.getContractFactory("CollectiveInvestmentPoolExtension")).attach(fundingpoolextensionAddr);

        let miniTarget = toBN("1000000000");
        let maxCap = toBN("2000000000");
        let miniDeposit = toBN("10000000");
        let maxDeposit = toBN("1000000000");

        const fundInfo = [
            tokenAddress,
            miniTarget,
            maxCap,
            miniDeposit,
            maxDeposit
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;


        let startTime = toBN(blocktimestamp).add(toBN(60 * 1));
        let endTime = toBN(startTime).add(toBN(60 * 60 * 500));
        console.log(`
        current time ${blocktimestamp}
        fund raise startTime ${startTime}
        fund raise endTime ${endTime}
        `);
        let timeInfo = [startTime, endTime];

        let enable = true;
        let valifyType = 0;
        let priorityTokenAddress = this.testtoken2.address;
        let tokenId = 0;
        let miniHolding = hre.ethers.utils.parseEther("100");
        let whitelist = [];

        const priorityDepositor = [
            enable,
            valifyType,
            priorityTokenAddress,
            tokenId,
            miniHolding,
            whitelist
        ];

        let fundRaiseType = 0;
        let params = [
            dao,
            fundRaiseType,
            fundInfo,
            timeInfo,
            priorityDepositor
        ];

        let tx = await this.colletiveFundRaiseProposalContract.submitProposal(params);
        let rel = await tx.wait();

        let proposalId = rel.events[rel.events.length - 1].args.proposalId;
        let proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(this.collectiveDirectdaoAddress, proposalId);
        console.log(`
            startTime   ${proposalDetail.timeInfo.startTime}
            endTime   ${proposalDetail.timeInfo.endTime}
            fund raise proposal created...
            proposalId ${proposalId}
            vote for fund raise proposal...
        `);

        const members = await this.daoContract.getAllSteward();
        console.log(members);
        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        // await this.collectiveVotingContract.connect(this.user1).submitVote(this.collectiveDirectdaoAddress,
        //     proposalId,
        //     1
        // );

        console.log("voted, execute...");
        const stopVoteTime = proposalDetail.stopVoteTime;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.colletiveFundRaiseProposalContract.processProposal(this.collectiveDirectdaoAddress, proposalId);
        proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(this.collectiveDirectdaoAddress, proposalId);

        console.log(`
        executed...
        fund raise proposal state ${proposalDetail.state}
        deposit...
        `);

        await this.testtoken1.approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));
        await this.testtoken1.connect(this.investor1).approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));
        await this.testtoken1.connect(this.investor2).approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));

        await this.erc20TokenDecimals.approve(this.colletiveFundingPoolContract.address, toBN("2000000000"));
        await this.erc20TokenDecimals.connect(this.investor1).approve(this.colletiveFundingPoolContract.address, toBN("2000000000"));
        await this.erc20TokenDecimals.connect(this.investor2).approve(this.colletiveFundingPoolContract.address, toBN("2000000000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("2000"));
        await this.testtoken1.transfer(this.investor2.address, hre.ethers.utils.parseEther("2000"));
        await this.erc20TokenDecimals.transfer(this.investor1.address, toBN("2000000000"));
        await this.erc20TokenDecimals.transfer(this.investor2.address, toBN("2000000000"));

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        console.log(`
        blocktimestamp ${blocktimestamp}
        `);

        if (parseInt(startTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(startTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        console.log(`
        blocktimestamp                     ${blocktimestamp}
        proposalDetail.timeInfo.endTime  ${proposalDetail.timeInfo.endTime}
        `);

        await this.colletiveFundingPoolContract.deposit(this.collectiveDirectdaoAddress, toBN("1000000000"));
        await this.colletiveFundingPoolContract.connect(this.investor1).deposit(this.collectiveDirectdaoAddress, toBN("500000000"));

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(endTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(endTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.colletiveFundingPoolContract.processFundRaise(this.collectiveDirectdaoAddress);

        let currentBlockNum = (await hre.ethers.provider.getBlock("latest")).number;

        let depositBal1 = await collectiveFundingPoolExtContract.getPriorAmount(
            this.owner.address,
            this.testtoken1.address,
            currentBlockNum - 1
        );

        let depositBal2 = await collectiveFundingPoolExtContract.getPriorAmount(
            this.investor1.address,
            this.testtoken1.address,
            currentBlockNum - 1
        );

        console.log(`
        depositBal1 ${hre.ethers.utils.formatEther(depositBal1)}
        depositBal2 ${hre.ethers.utils.formatEther(depositBal2)}
        `);

        //funding proposal
        const token = this.erc20TokenDecimals.address;
        const fundingAmount = toBN("1000000000");
        const totalAmount = hre.ethers.utils.parseEther("0");
        const receiver = this.user1.address;
        const fundingInfo = [token, fundingAmount, totalAmount, receiver];

        const escrow = true;
        const paybackToken = this.testtoken2.address;
        const price = hre.ethers.utils.parseEther("1.2");
        const paybackAmount = fundingAmount.mul(hre.ethers.utils.parseEther("1")).div(price).mul(toBN(10 ** 12));
        const approver = this.user2.address;
        const escrowInfo = [
            escrow,
            paybackToken,
            price,
            paybackAmount,
            approver
        ];

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        startTime = blocktimestamp + 60 * 10;
        endTime = startTime + 60 * 30;
        const cliffEndTime = startTime + 60 * 1;
        const cliffVestingAmount = hre.ethers.utils.parseEther("0.02");
        const vestingInterval = 60 * 20;
        const nftEnable = true;
        const erc721 = this.vestingERC721.address;
        const vestName = "LO";
        const vestDescription = "layer zero vesting";
        const vestingInfo = [
            startTime,
            endTime,
            cliffEndTime,
            cliffVestingAmount,
            vestingInterval,
            nftEnable,
            erc721,
            vestName,
            vestDescription
        ];

        const ProposalParams = [
            dao,
            fundingInfo,
            escrowInfo,
            vestingInfo
        ];

        tx = await this.colletiveFundingProposalContract.submitProposal(ProposalParams);
        let result = await tx.wait();
        proposalId = result.events[result.events.length - 1].args.proposalId;
        proposalDetail = await this.colletiveFundingProposalContract.proposals(dao, proposalId);
        console.log(`
        funding proposal submitted...
        proposalId ${proposalId}
        proposalDetail ${proposalDetail}
        `);
        await this.testtoken2.connect(this.user2).approve(this.collectivePaybackTokenAdapterContract.address, paybackAmount);
        await this.testtoken2.transfer(approver, paybackAmount);
        await this.collectivePaybackTokenAdapterContract.connect(this.user2).setFundingApprove(
            dao,
            proposalId,
            this.testtoken2.address,
            paybackAmount
        );
        const paybackBal = await this.testtoken2.balanceOf(approver);
        const allowanceAmount = await this.testtoken2.allowance(approver, this.collectivePaybackTokenAdapterContract.address);
        const approvalAmount = await this.collectivePaybackTokenAdapterContract.approvedInfos(dao, proposalId, approver, this.testtoken2.address)
        console.log(`
        paybackBal ${paybackBal}
        allowanceAmount ${allowanceAmount}
        approvalAmount ${approvalAmount}
        paybackAmount ${paybackAmount}
        start voting...
        `);
        await this.colletiveFundingProposalContract.startVotingProcess(dao,
            proposalId);

        this.fundingProposalId = proposalId;
    }

    const submitDaoSetInvestorCapProposal = async () => {
        const enable = true;
        const cap = 10;
        const tx = await this.colletiveDaoSetProposalContract.submitInvestorCapProposal(
            this.collectiveDirectdaoAddress,
            enable,
            cap);
        const rel = await tx.wait();

        const proposalId = rel.events[rel.events.length - 1].args.proposalId;
        return proposalId;
    }

    const submitFundRaiseProposal = async () => {
        const dao = this.collectiveDirectdaoAddress;
        // const tokenAddress = this.testtoken1.address;
        const tokenAddress = this.erc20TokenDecimals.address;
        const decimals = await this.erc20TokenDecimals.decimals();
        // const miniTarget = hre.ethers.utils.parseEther("1000");
        const miniTarget = toBN(1000 * 10 ** decimals);
        // const maxCap = hre.ethers.utils.parseEther("2000");
        const maxCap = toBN(2000 * 10 ** decimals);
        // const miniDeposit = hre.ethers.utils.parseEther("10");
        const miniDeposit = toBN(10 * 10 ** decimals);
        // const maxDeposit = hre.ethers.utils.parseEther("20000");
        const maxDeposit = toBN(20000 * 10 ** decimals);

        const fundInfo = [
            tokenAddress,
            miniTarget,
            maxCap,
            miniDeposit,
            maxDeposit
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const startTime = blocktimestamp + 60 * 10;
        const endTime = startTime + 60 * 30;
        const timeInfo = [startTime, endTime];

        const enable = true;
        const valifyType = 0;
        const priorityTokenAddress = this.testtoken2.address;
        const tokenId = 0;
        const miniHolding = hre.ethers.utils.parseEther("100");
        const whitelist = [];

        const priorityDepositor = [
            enable,
            valifyType,
            priorityTokenAddress,
            tokenId,
            miniHolding,
            whitelist
        ];

        const fundRaiseType = 0;
        const params = [
            dao,
            fundRaiseType,
            fundInfo,
            timeInfo,
            priorityDepositor
        ];

        const tx = await this.colletiveFundRaiseProposalContract.submitProposal(params);
        const rel = await tx.wait();

        const proposalId = rel.events[rel.events.length - 1].args.proposalId;
        return proposalId;
    }

    const submitClearFundProposal = async () => {
        const tx = await this.colletiveClearFundProposalAdapterContract.submitClearFundProposal(
            this.collectiveDirectdaoAddress
        );
        const rel = await tx.wait();
        const proposalId = rel.events[rel.events.length - 1].args.proposalId;
        return proposalId;
    }

    const submitGovernorInProposal_GovernorMembershipWhitelist = async () => {
        let applicant = this.user1.address;
        const tokenAddress = this.erc20TokenDecimals.address;
        const depositAmount = toBN("100000000");
        const tx = await this.colletiveGovernorManagementContract.submitGovernorInProposal(
            this.collectiveDirectdaoAddress,
            applicant,
            depositAmount
        );
        const rel = await tx.wait();
        const proposalId = rel.events[rel.events.length - 1].args.proposalId;
        let allGovernros = await this.colletiveGovernorManagementContract.getAllGovernor(this.collectiveDirectdaoAddress);

        console.log(`
        allGovernros ${allGovernros}
        created, proposalId: ", ${proposalId}
        voting...
        `);

        console.log(`
        new governor approval...
        `);
        await this.erc20TokenDecimals.transfer(applicant, depositAmount);
        await this.erc20TokenDecimals.connect(this.user1).approve(
            this.colletiveGovernorManagementContract.address,
            depositAmount
        );

        await this.colletiveGovernorManagementContract.connect(this.user1).setGovernorInApprove(
            this.collectiveDirectdaoAddress,
            proposalId,
            this.erc20TokenDecimals.address,
            depositAmount
        );

        await this.colletiveGovernorManagementContract.startVoting(
            this.collectiveDirectdaoAddress,
            proposalId
        );

        let proposalDetail = await this.colletiveGovernorManagementContract.proposals(this.collectiveDirectdaoAddress, proposalId);
        console.log(`
        state ${proposalDetail.state}
        `);
        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );

        console.log(`
        approved...
        voted, execute...`);
        proposalDetail = await this.colletiveGovernorManagementContract.proposals(this.collectiveDirectdaoAddress, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const votingRel = await this.collectiveVotingContract.voteResult(this.collectiveDirectdaoAddress, proposalId);
        await this.colletiveGovernorManagementContract.processProposal(this.collectiveDirectdaoAddress, proposalId);
        allGovernros = await this.colletiveGovernorManagementContract.getAllGovernor(this.collectiveDirectdaoAddress);
        // const newGovernorDepositedAmount = await this.colletiveFundingPoolContract.balanceOfToken(
        //     this.collectiveDirectdaoAddress,
        //     this.testtoken1.address,
        //     applicant
        // );
        const newGovernorDepositedAmount = await this.collectiveFundingPoolExtContract.balanceOfToken(
            this.testtoken1.address,
            applicant);
        proposalDetail = await this.colletiveGovernorManagementContract.proposals(this.collectiveDirectdaoAddress, proposalId);
        console.log(`
        executed...
        newGovernorDepositedAmount ${hre.ethers.utils.formatEther(newGovernorDepositedAmount)}

        votingRel ${votingRel}
        proposal state ${proposalDetail.state}
        allGovernros ${allGovernros}
        `);
    }

    const submitTopUpPrposal = async () => {

    }
});