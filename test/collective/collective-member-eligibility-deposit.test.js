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

describe("member eligibility...", () => {
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

        const ERC721 = await hre.ethers.getContractFactory("PixelNFT");
        const erc721 = await ERC721.deploy(4);
        await erc721.deployed();
        this.testERC721 = erc721;

        const ERC1155 = await hre.ethers.getContractFactory("ERC1155TestToken");
        const erc1155 = await ERC1155.deploy("this is test uri");
        await erc1155.deployed();
        this.testERC1155 = erc1155;

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
            this.investor1.address,
            this.investor2.address
        ];

        const collectiveGovernorMembershipInfo1 = [
            enable,
            0,//erc20
            hre.ethers.utils.parseEther("100"),//
            tokenAddress,
            tokenId,
            memberEligibilityName,
            []
        ];

        const collectiveGovernorMembershipInfo2 = [
            enable,
            1,//erc721
            minHolding,
            this.testERC721.address,
            tokenId,
            memberEligibilityName,
            []
        ];

        const collectiveGovernorMembershipInfo3 = [
            enable,
            2,//erc1155
            minHolding,
            this.testERC1155.address,
            tokenId,
            memberEligibilityName,
            whiteList
        ];

        const collectiveGovernorMembershipInfo4 = [
            enable,
            3,//whitelist
            0,
            ZERO_ADDRESS,
            0,
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
        const currency = this.testtoken1.address;
        const riceRewardReceiver = this.user1.address;

        const CollectiveDaoInfo1 = [
            "collective-dao1",
            creator,
            currency,
            redemptionFee,
            proposerInvestTokenReward,
            proposerPaybackTokenReward,
            riceRewardReceiver
        ];

        const CollectiveDaoInfo2 = [
            "collective-dao2",
            creator,
            currency,
            redemptionFee,
            proposerInvestTokenReward,
            proposerPaybackTokenReward,
            riceRewardReceiver
        ];

        const CollectiveDaoInfo3 = [
            "collective-dao3",
            creator,
            currency,
            redemptionFee,
            proposerInvestTokenReward,
            proposerPaybackTokenReward,
            riceRewardReceiver
        ];

        const CollectiveDaoInfo4 = [
            "collective-dao4",
            creator,
            currency,
            redemptionFee,
            proposerInvestTokenReward,
            proposerPaybackTokenReward,
            riceRewardReceiver
        ];



        const collectiveDaoParams1 = [
            daoFactoriesAddress,
            enalbeAdapters,
            adapters1,
            collectiveDaoIvestorCapInfo,
            collectiveGovernorMembershipInfo1,
            CollectiveDaoVotingInfo,
            CollectiveDaoInfo1
        ];

        const collectiveDaoParams2 = [
            daoFactoriesAddress,
            enalbeAdapters,
            adapters1,
            collectiveDaoIvestorCapInfo,
            collectiveGovernorMembershipInfo2,
            CollectiveDaoVotingInfo,
            CollectiveDaoInfo2
        ];

        const collectiveDaoParams3 = [
            daoFactoriesAddress,
            enalbeAdapters,
            adapters1,
            collectiveDaoIvestorCapInfo,
            collectiveGovernorMembershipInfo3,
            CollectiveDaoVotingInfo,
            CollectiveDaoInfo3
        ];

        const collectiveDaoParams4 = [
            daoFactoriesAddress,
            enalbeAdapters,
            adapters1,
            collectiveDaoIvestorCapInfo,
            collectiveGovernorMembershipInfo4,
            CollectiveDaoVotingInfo,
            CollectiveDaoInfo4
        ];


        const
            daoAddr1
                = await sommonCollectiveDao(this.summonCollectiveDao, this.daoFactory, collectiveDaoParams1);
        const daoContract1 = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr1);

        const
            daoAddr2
                = await sommonCollectiveDao(this.summonCollectiveDao, this.daoFactory, collectiveDaoParams2);
        const daoContract2 = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr2);


        const
            daoAddr3
                = await sommonCollectiveDao(this.summonCollectiveDao, this.daoFactory, collectiveDaoParams3);
        const daoContract3 = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr3);


        const
            daoAddr4
                = await sommonCollectiveDao(this.summonCollectiveDao, this.daoFactory, collectiveDaoParams4);
        const daoContract4 = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr4);

        this.collectiveDirectdaoAddress1 = daoAddr1;
        this.daoContract1 = daoContract1;

        this.collectiveDirectdaoAddress2 = daoAddr2;
        this.daoContract2 = daoContract2;

        this.collectiveDirectdaoAddress3 = daoAddr3;
        this.daoContract3 = daoContract3;

        this.collectiveDirectdaoAddress4 = daoAddr4;
        this.daoContract4 = daoContract4;

        // const riceReceiver = await daoContract.getAddressConfiguration("0xc77068975ba2254bd67080aa196783f213ee682a15d902d03f33782130cf737d");
        // console.log("riceReceiver ", riceReceiver);


        // this.collectiveFundingPoolExtContract = (await hre.ethers.getContractFactory("CollectiveInvestmentPoolExtension")).attach((await this.daoContract.getExtensionAddress("0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab")))
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
        return daoAddr;
    };

    const submitFundRaiseProposal = async (daoAddr) => {
        const dao = daoAddr;
        const tokenAddress = this.testtoken1.address;
        const miniTarget = hre.ethers.utils.parseEther("1000");
        const maxCap = hre.ethers.utils.parseEther("2000");
        const miniDeposit = hre.ethers.utils.parseEther("10");
        const maxDeposit = hre.ethers.utils.parseEther("20000");

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

    it("member eligibility - erc20", async () => {

        const proposalId = await submitFundRaiseProposal(this.collectiveDirectdaoAddress1);
        await this.collectiveVotingContract.connect(this.owner).submitVote(
            this.collectiveDirectdaoAddress1,
            proposalId,
            1
        );

        console.log("voted, execute...");

        let proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(
            this.collectiveDirectdaoAddress1,
            proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.colletiveFundRaiseProposalContract.processProposal(
            this.collectiveDirectdaoAddress1,
            proposalId);

        proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(
            this.collectiveDirectdaoAddress1,
            proposalId);

        console.log(`
        proposal state ${proposalDetail.state}
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalDetail.timeInfo.startTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalDetail.timeInfo.startTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        await this.testtoken1.approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        console.log(`
        blocktimestamp                     ${blocktimestamp}
        proposalDetail.timeInfo.endTime  ${proposalDetail.timeInfo.endTime}
        `);
        await expectRevert(
            this.colletiveFundingPoolContract.connect(this.user1).deposit(this.collectiveDirectdaoAddress1, hre.ethers.utils.parseEther("1000")),
            "revert");

        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("1000"));
        await this.testtoken1.connect(this.user1).approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));
        await this.colletiveFundingPoolContract.connect(this.user1).deposit(this.collectiveDirectdaoAddress1, hre.ethers.utils.parseEther("1000"));

    });

    it("member eligibility - erc721", async () => {
        const proposalId = await submitFundRaiseProposal(this.collectiveDirectdaoAddress2);
        await this.collectiveVotingContract.connect(this.owner).submitVote(
            this.collectiveDirectdaoAddress2,
            proposalId,
            1
        );

        console.log("voted, execute...");

        let proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(
            this.collectiveDirectdaoAddress2,
            proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.colletiveFundRaiseProposalContract.processProposal(
            this.collectiveDirectdaoAddress2,
            proposalId);

        proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(
            this.collectiveDirectdaoAddress2,
            proposalId);

        console.log(`
        proposal state ${proposalDetail.state}
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalDetail.timeInfo.startTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalDetail.timeInfo.startTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        await this.testtoken1.approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        console.log(`
        blocktimestamp                     ${blocktimestamp}
        proposalDetail.timeInfo.endTime  ${proposalDetail.timeInfo.endTime}
        `);
        await expectRevert(
            this.colletiveFundingPoolContract.connect(this.user2).deposit(
                this.collectiveDirectdaoAddress2, hre.ethers.utils.parseEther("1000")),
            "revert");

        await this.testERC721.connect(this.user2).mintPixel(this.user2.address, 0, 0);

        await this.testtoken1.transfer(this.user2.address, hre.ethers.utils.parseEther("1000"));
        await this.testtoken1.connect(this.user2).approve(
            this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));
        await this.colletiveFundingPoolContract.connect(this.user2).deposit(
            this.collectiveDirectdaoAddress2, hre.ethers.utils.parseEther("1000"));
    });

    it("member eligibility - erc1155", async () => {
        const proposalId = await submitFundRaiseProposal(this.collectiveDirectdaoAddress3);
        await this.collectiveVotingContract.connect(this.owner).submitVote(
            this.collectiveDirectdaoAddress3,
            proposalId,
            1
        );

        console.log("voted, execute...");

        let proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(
            this.collectiveDirectdaoAddress3,
            proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.colletiveFundRaiseProposalContract.processProposal(
            this.collectiveDirectdaoAddress3,
            proposalId);

        proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(
            this.collectiveDirectdaoAddress3,
            proposalId);

        console.log(`
        proposal state ${proposalDetail.state}
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalDetail.timeInfo.startTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalDetail.timeInfo.startTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        await this.testtoken1.approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        console.log(`
        blocktimestamp                     ${blocktimestamp}
        proposalDetail.timeInfo.endTime  ${proposalDetail.timeInfo.endTime}
        `);
        await expectRevert(
            this.colletiveFundingPoolContract.connect(this.investor1).deposit(
                this.collectiveDirectdaoAddress3, hre.ethers.utils.parseEther("1000")),
            "revert");

        await this.testERC1155.mint(this.investor1.address, 2, 3, hexToBytes(toHex(2233)));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("1000"));
        await this.testtoken1.connect(this.investor1).approve(
            this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));
        await this.colletiveFundingPoolContract.connect(this.investor1).deposit(
            this.collectiveDirectdaoAddress3, hre.ethers.utils.parseEther("1000"));
    });

    it("member eligibility - whitelist", async () => {
        const proposalId = await submitFundRaiseProposal(this.collectiveDirectdaoAddress4);
        await this.collectiveVotingContract.connect(this.owner).submitVote(
            this.collectiveDirectdaoAddress4,
            proposalId,
            1
        );

        console.log("voted, execute...");

        let proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(
            this.collectiveDirectdaoAddress4,
            proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.colletiveFundRaiseProposalContract.processProposal(
            this.collectiveDirectdaoAddress4,
            proposalId);

        proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(
            this.collectiveDirectdaoAddress4,
            proposalId);

        console.log(`
        proposal state ${proposalDetail.state}
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalDetail.timeInfo.startTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalDetail.timeInfo.startTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        await this.testtoken1.approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        console.log(`
        blocktimestamp                     ${blocktimestamp}
        proposalDetail.timeInfo.endTime  ${proposalDetail.timeInfo.endTime}
        `);
        await expectRevert(
            this.colletiveFundingPoolContract.connect(this.investor2).deposit(
                this.collectiveDirectdaoAddress4, hre.ethers.utils.parseEther("1000")),
            "revert");

        await this.testtoken1.transfer(this.investor2.address, hre.ethers.utils.parseEther("1000"));
        await this.testtoken1.connect(this.investor2).approve(
            this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));
        await this.colletiveFundingPoolContract.connect(this.investor2).deposit(
            this.collectiveDirectdaoAddress4, hre.ethers.utils.parseEther("1000"));
    });
});