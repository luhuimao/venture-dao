/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-12-19 13:50:51
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-10-07 15:05:33
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

const hre = require("hardhat");


describe("redemption fee...", () => {
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
        this.vintageFundingAdapterContract = adapters.vintageFundingAdapterContract.instance;


        this.colletiveGovernorManagementContract = adapters.colletiveGovernorManagementContract.instance;
        this.colletiveDaoSetProposalContract = adapters.colletiveDaoSetProposalContract.instance;
        this.colletiveFundingProposalContract = adapters.colletiveFundingProposalContract.instance;
        this.collectiveVotingContract = adapters.collectiveVotingContract.instance;
        this.colletiveFundingPoolContract = adapters.colletiveFundingPoolContract.instance;
        this.collectiveFundingPoolHelperContract = adapters.collectiveFundingPoolHelperAdapterContract.instance; this.colletiveFundRaiseProposalContract = adapters.colletiveFundRaiseProposalContract.instance;
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


        const InvestmentReceiptERC721Helper = await hre.ethers.getContractFactory("InvestmentReceiptERC721Helper");
        const investmentReceiptERC721Helper = await InvestmentReceiptERC721Helper.deploy();
        await investmentReceiptERC721Helper.deployed();
        this.investmentReceiptERC721Helper = investmentReceiptERC721Helper;

        const InvestmentReceiptERC721 = await hre.ethers.getContractFactory("InvestmentReceiptERC721");
        const investmentReceiptERC721 = await InvestmentReceiptERC721.deploy(
            "DAOSquare Investment Receipt",
            "DIR",
            // this.flexFundingAdapterContract.address,
            // this.vintageFundingAdapterContract.address,
            // this.colletiveFundingProposalContract.address,
            this.investmentReceiptERC721Helper.address
        );
        await investmentReceiptERC721.deployed();
        this.investmentReceiptERC721 = investmentReceiptERC721;


        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.collectiveFundingPoolFactory.address
        ];
        _daoName = "my_collective_dao002";
        const _daoName2 = "my_collective_dao003";

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
            }, {
                id: '0x4bb6d123745fe9358fe205a70b7a4aae2a445c56d4bc19c9a123a9259ff615a1', // colletiveExpenseProposalContract
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
            2 //uint256 maxParticipantsAmount;
        ];

        const enable = false;
        const memberEligibilityName = "test name";
        const varifyType = 3;
        const minHolding = 1;
        const tokenAddress = this.testtoken1.address;
        const tokenId = 2;
        const whiteList = [
            this.user1.address,
            this.user2.address
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
        const currency = this.testtoken1.address;
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

        const CollectiveDaoInfo2 = [
            _daoName2,
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

        const collectiveDaoParams2 = [
            daoFactoriesAddress,
            enalbeAdapters,
            adapters1,
            collectiveDaoIvestorCapInfo,
            collectiveGovernorMembershipInfo,
            CollectiveDaoVotingInfo,
            CollectiveDaoInfo2
        ];


        let rel = await sommonCollectiveDao(this.summonCollectiveDao, this.daoFactory, collectiveDaoParams);
        console.log(rel);
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(rel.daoAddr);

        console.log(`
        new dao address ${rel.daoAddr}
        new dao name ${toUtf8(rel.daoName)}
        `)

        this.collectiveDirectdaoAddress = rel.daoAddr;
        this.daoContract = daoContract;

        rel = await sommonCollectiveDao(this.summonCollectiveDao, this.daoFactory, collectiveDaoParams2);
        this.collectiveDirectdaoAddress2 = rel.daoAddr;
        console.log(this.collectiveDirectdaoAddress2);

    });

    const sommonCollectiveDao = async (summonDaoContract, daoFactoryContract, collectiveDaoParams) => {
        let tx = await summonDaoContract.summonCollectiveDao(collectiveDaoParams);
        let result = await tx.wait();
        const len = collectiveDaoParams.length;
        const daoAddr = await daoFactoryContract.getDaoAddress(collectiveDaoParams[len - 1][0]);
        const daoName = await daoFactoryContract.daos(daoAddr);
        console.log(`
        summoned...
        daoAddr ${daoAddr}
        new dao name ${toUtf8(daoName)}
        `);
        return { daoAddr, daoName };
    };

    it("", async () => {
        const proposalId = await submitFundRaiseProposal();

        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );

        console.log("voted, execute...");
        let proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(this.collectiveDirectdaoAddress, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.colletiveFundRaiseProposalContract.processProposal(this.collectiveDirectdaoAddress, proposalId);
        proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(this.collectiveDirectdaoAddress, proposalId);

        console.log(`
        executed...
        state ${proposalDetail.state}
        `);

        await this.testtoken1.approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));
        await this.testtoken1.connect(this.investor1).approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));
        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("1000"));

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalDetail.timeInfo.startTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalDetail.timeInfo.startTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        await this.colletiveFundingPoolContract.deposit(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("1000"));
        await this.colletiveFundingPoolContract.connect(this.investor1).deposit(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("500"));

        let escrowFeeAmount = await this.collectiveRedemptionFeeEscrowAdapterContract.escrowedRedemptionFees(this.collectiveDirectdaoAddress, this.testtoken1.address);
        console.log(`
        escrowFeeAmount    ${hre.ethers.utils.formatEther(escrowFeeAmount)}
        withdraw1...
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalDetail.timeInfo.endTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalDetail.timeInfo.endTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        await this.colletiveFundingPoolContract.processFundRaise(this.collectiveDirectdaoAddress);

        let tx = await this.colletiveFundingPoolContract.withdraw(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("200"));
        escrowFeeAmount = await this.collectiveRedemptionFeeEscrowAdapterContract.escrowedRedemptionFees(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address
        );
        let escrowFeeAmountByBlockNum = await this.collectiveRedemptionFeeEscrowAdapterContract.escrowedRedemptionFeeByBlockNum(
            this.collectiveDirectdaoAddress,
            tx.blockNumber
        );
        console.log(`
        escrowFeeAmount            ${hre.ethers.utils.formatEther(escrowFeeAmount)}
        escrowFeeAmountByBlockNum  ${hre.ethers.utils.formatEther(escrowFeeAmountByBlockNum)}
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        // if (parseInt(proposalDetail.timeInfo.endTime) > blocktimestamp) {
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(blocktimestamp) + 1]);
        await hre.network.provider.send("evm_mine");
        // }

        let am = await this.collectiveRedemptionFeeEscrowAdapterContract.getRedemptionFeeAmount(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.owner.address);
        let am2 = await this.collectiveRedemptionFeeEscrowAdapterContract.getRedemptionFeeAmount(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.investor1.address);
        let am3 = await this.collectiveRedemptionFeeEscrowAdapterContract.getRedemptionFeeAmount(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.user2.address
        );
        let UBal = await this.testtoken1.balanceOf(this.owner.address);
        let UBal2 = await this.testtoken1.balanceOf(this.investor1.address);

        let claimedFeeAmount1 = await this.collectiveRedemptionFeeEscrowAdapterContract.withdrawAmount(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.owner.address);
        let claimedFeeAmount2 = await this.collectiveRedemptionFeeEscrowAdapterContract.withdrawAmount(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.investor1.address);

        console.log(`
        redemptionFeeReward   ${hre.ethers.utils.formatEther(am)}
        redemptionFeeReward2   ${hre.ethers.utils.formatEther(am2)}
        redemptionFeeReward3   ${hre.ethers.utils.formatEther(am3)}

        UBal   ${hre.ethers.utils.formatEther(UBal)}
        UBal2   ${hre.ethers.utils.formatEther(UBal2)}

        claimedFeeAmount1   ${hre.ethers.utils.formatEther(claimedFeeAmount1)}
        claimedFeeAmount2   ${hre.ethers.utils.formatEther(claimedFeeAmount2)}

        claim redemption fee 1...
        `);

        if (am > 0)
            await this.collectiveRedemptionFeeEscrowAdapterContract.withDrawRedemptionFee(this.collectiveDirectdaoAddress,
                this.testtoken1.address);

        UBal = await this.testtoken1.balanceOf(this.owner.address);
        UBal2 = await this.testtoken1.balanceOf(this.investor1.address);

        am = await this.collectiveRedemptionFeeEscrowAdapterContract.getRedemptionFeeAmount(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.owner.address);
        am2 = await this.collectiveRedemptionFeeEscrowAdapterContract.getRedemptionFeeAmount(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.investor1.address);

        tx = await this.colletiveFundingPoolContract.withdraw(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("100"));

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        // if (parseInt(proposalDetail.timeInfo.endTime) > blocktimestamp) {
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(blocktimestamp) + 1]);
        await hre.network.provider.send("evm_mine");
        // }

        escrowFeeAmountByBlockNum = await this.collectiveRedemptionFeeEscrowAdapterContract.escrowedRedemptionFeeByBlockNum(this.collectiveDirectdaoAddress, tx.blockNumber);
        escrowFeeAmount = await this.collectiveRedemptionFeeEscrowAdapterContract.escrowedRedemptionFees(this.collectiveDirectdaoAddress, this.testtoken1.address);
        console.log(`
        redemptionFeeReward   ${hre.ethers.utils.formatEther(am)}
        redemptionFeeReward2   ${hre.ethers.utils.formatEther(am2)}

        UBal   ${hre.ethers.utils.formatEther(UBal)}
        UBal2   ${hre.ethers.utils.formatEther(UBal2)}

        withdraw2...

        escrowFeeAmount    ${hre.ethers.utils.formatEther(escrowFeeAmount)}
        escrowFeeAmountByBlockNum  ${hre.ethers.utils.formatEther(escrowFeeAmountByBlockNum)}
        claim redemption fee 2...
        `);

        am = await this.collectiveRedemptionFeeEscrowAdapterContract.getRedemptionFeeAmount(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.owner.address);

        if (am > 0)
            await this.collectiveRedemptionFeeEscrowAdapterContract.withDrawRedemptionFee(this.collectiveDirectdaoAddress,
                this.testtoken1.address);

        UBal2 = await this.testtoken1.balanceOf(this.investor1.address);

        am = await this.collectiveRedemptionFeeEscrowAdapterContract.getRedemptionFeeAmount(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.owner.address);
        am2 = await this.collectiveRedemptionFeeEscrowAdapterContract.getRedemptionFeeAmount(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.investor1.address);


        const blocks = await this.collectiveRedemptionFeeEscrowAdapterContract.getBlockNumByTokenAddr(this.collectiveDirectdaoAddress,
            this.testtoken1.address);

        let blockNum = (await hre.ethers.provider.getBlock("latest")).number;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        console.log(`
        redemptionFeeReward   ${hre.ethers.utils.formatEther(am)}
        redemptionFeeReward2   ${hre.ethers.utils.formatEther(am2)}

        UBal   ${hre.ethers.utils.formatEther(UBal)}
        UBal2   ${hre.ethers.utils.formatEther(UBal2)}

        blocks    ${blocks}
        blocktimestamp  ${blockNum}
        `)

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(blocktimestamp) + 1]);
        await hre.network.provider.send("evm_mine");



        if (am2 > 0)
            await this.collectiveRedemptionFeeEscrowAdapterContract.connect(this.investor1).withDrawRedemptionFee(this.collectiveDirectdaoAddress,
                this.testtoken1.address);

        UBal = await this.testtoken1.balanceOf(this.owner.address);
        UBal2 = await this.testtoken1.balanceOf(this.investor1.address);

        am = await this.collectiveRedemptionFeeEscrowAdapterContract.getRedemptionFeeAmount(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.owner.address);
        am2 = await this.collectiveRedemptionFeeEscrowAdapterContract.getRedemptionFeeAmount(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.investor1.address);
        console.log(`
        redemptionFeeReward   ${hre.ethers.utils.formatEther(am)}
        redemptionFeeReward2   ${hre.ethers.utils.formatEther(am2)}

        UBal   ${hre.ethers.utils.formatEther(UBal)}
        UBal2   ${hre.ethers.utils.formatEther(UBal2)}

        `);

        tx = await this.colletiveFundingPoolContract.connect(this.investor1).withdraw(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("100"));

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        // if (parseInt(proposalDetail.timeInfo.endTime) > blocktimestamp) {
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(blocktimestamp) + 1]);
        await hre.network.provider.send("evm_mine");
        // }

        am = await this.collectiveRedemptionFeeEscrowAdapterContract.getRedemptionFeeAmount(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.owner.address);
        am2 = await this.collectiveRedemptionFeeEscrowAdapterContract.getRedemptionFeeAmount(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.investor1.address);

        if (am2 > 0)
            await this.collectiveRedemptionFeeEscrowAdapterContract.connect(this.investor1).withDrawRedemptionFee(this.collectiveDirectdaoAddress,
                this.testtoken1.address);

        if (am > 0)
            await this.collectiveRedemptionFeeEscrowAdapterContract.withDrawRedemptionFee(this.collectiveDirectdaoAddress,
                this.testtoken1.address);

        am = await this.collectiveRedemptionFeeEscrowAdapterContract.getRedemptionFeeAmount(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.owner.address);
        am2 = await this.collectiveRedemptionFeeEscrowAdapterContract.getRedemptionFeeAmount(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.investor1.address);

        UBal = await this.testtoken1.balanceOf(this.owner.address);
        UBal2 = await this.testtoken1.balanceOf(this.investor1.address);

        claimedFeeAmount1 = await this.collectiveRedemptionFeeEscrowAdapterContract.withdrawAmount(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.owner.address);
        claimedFeeAmount2 = await this.collectiveRedemptionFeeEscrowAdapterContract.withdrawAmount(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.investor1.address);

        console.log(`
        redemptionFeeReward   ${hre.ethers.utils.formatEther(am)}
        redemptionFeeReward2   ${hre.ethers.utils.formatEther(am2)}

        UBal   ${hre.ethers.utils.formatEther(UBal)}
        UBal2   ${hre.ethers.utils.formatEther(UBal2)}


        claimedFeeAmount1   ${hre.ethers.utils.formatEther(claimedFeeAmount1)}
        claimedFeeAmount2   ${hre.ethers.utils.formatEther(claimedFeeAmount2)}
        totalClaimedAmount ${hre.ethers.utils.formatEther(claimedFeeAmount1.add(claimedFeeAmount2))}
        `);
    });

    it("one member...", async () => {
        const dao = this.collectiveDirectdaoAddress2;
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

        let tx = await this.colletiveFundRaiseProposalContract.submitProposal(params);
        let rel = await tx.wait();

        const proposalId = rel.events[rel.events.length - 1].args.proposalId;

        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress2,
            proposalId,
            1
        );

        console.log("voted, execute...");
        let proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(
            this.collectiveDirectdaoAddress2, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.colletiveFundRaiseProposalContract.processProposal(
            this.collectiveDirectdaoAddress2, proposalId);
        proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(
            this.collectiveDirectdaoAddress2, proposalId);

        console.log(`
        executed...
        state ${proposalDetail.state}
        `);

        await this.testtoken1.approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalDetail.timeInfo.startTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalDetail.timeInfo.startTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        await this.colletiveFundingPoolContract.deposit(
            this.collectiveDirectdaoAddress2, hre.ethers.utils.parseEther("1000"));

        let escrowFeeAmount = await this.collectiveRedemptionFeeEscrowAdapterContract.escrowedRedemptionFees(
            this.collectiveDirectdaoAddress2,
            this.testtoken1.address);
        console.log(`
        escrowFeeAmount    ${hre.ethers.utils.formatEther(escrowFeeAmount)}
        withdraw1...
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalDetail.timeInfo.endTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalDetail.timeInfo.endTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        await this.colletiveFundingPoolContract.processFundRaise(this.collectiveDirectdaoAddress2);

        tx = await this.colletiveFundingPoolContract.withdraw(
            this.collectiveDirectdaoAddress2, hre.ethers.utils.parseEther("200"));
        escrowFeeAmount = await this.collectiveRedemptionFeeEscrowAdapterContract.escrowedRedemptionFees(
            this.collectiveDirectdaoAddress2,
            this.testtoken1.address
        );
        let escrowFeeAmountByBlockNum = await this.collectiveRedemptionFeeEscrowAdapterContract.escrowedRedemptionFeeByBlockNum(
            this.collectiveDirectdaoAddress2,
            tx.blockNumber
        );
        console.log(`
        escrowFeeAmount            ${hre.ethers.utils.formatEther(escrowFeeAmount)}
        escrowFeeAmountByBlockNum  ${hre.ethers.utils.formatEther(escrowFeeAmountByBlockNum)}
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        // if (parseInt(proposalDetail.timeInfo.endTime) > blocktimestamp) {
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(blocktimestamp) + 1]);
        await hre.network.provider.send("evm_mine");
        // }

        let am = await this.collectiveRedemptionFeeEscrowAdapterContract.getRedemptionFeeAmount(
            this.collectiveDirectdaoAddress2,
            this.testtoken1.address,
            this.owner.address);
        let am2 = await this.collectiveRedemptionFeeEscrowAdapterContract.getRedemptionFeeAmount(
            this.collectiveDirectdaoAddress2,
            this.testtoken1.address,
            this.investor1.address);
        let am3 = await this.collectiveRedemptionFeeEscrowAdapterContract.getRedemptionFeeAmount(
            this.collectiveDirectdaoAddress2,
            this.testtoken1.address,
            this.user2.address
        );
        let UBal = await this.testtoken1.balanceOf(this.owner.address);
        let UBal2 = await this.testtoken1.balanceOf(this.investor1.address);

        let claimedFeeAmount1 = await this.collectiveRedemptionFeeEscrowAdapterContract.withdrawAmount(
            this.collectiveDirectdaoAddress2,
            this.testtoken1.address,
            this.owner.address);

        let claimedFeeAmount2 = await this.collectiveRedemptionFeeEscrowAdapterContract.withdrawAmount(
            this.collectiveDirectdaoAddress2,
            this.testtoken1.address,
            this.investor1.address);

        let claimedFeeAmount3 = await this.collectiveRedemptionFeeEscrowAdapterContract.withdrawAmount(
            this.collectiveDirectdaoAddress2,
            this.testtoken1.address,
            this.user1.address);

        console.log(`
        redemptionFeeReward   ${hre.ethers.utils.formatEther(am)}
        redemptionFeeReward2   ${hre.ethers.utils.formatEther(am2)}
        redemptionFeeReward3   ${hre.ethers.utils.formatEther(am3)}

        UBal   ${hre.ethers.utils.formatEther(UBal)}
        UBal2   ${hre.ethers.utils.formatEther(UBal2)}

        claimedFeeAmount1   ${hre.ethers.utils.formatEther(claimedFeeAmount1)}
        claimedFeeAmount2   ${hre.ethers.utils.formatEther(claimedFeeAmount2)}

        claim redemption fee 1...
        `);

        await this.collectiveRedemptionFeeEscrowAdapterContract.connect(this.owner).withDrawRedemptionFee(
            this.collectiveDirectdaoAddress2,
            this.testtoken1.address);


        claimedFeeAmount1 = await this.collectiveRedemptionFeeEscrowAdapterContract.withdrawAmount(
            this.collectiveDirectdaoAddress2,
            this.testtoken1.address,
            this.owner.address);

        claimedFeeAmount2 = await this.collectiveRedemptionFeeEscrowAdapterContract.withdrawAmount(
            this.collectiveDirectdaoAddress2,
            this.testtoken1.address,
            this.investor1.address);

        claimedFeeAmount3 = await this.collectiveRedemptionFeeEscrowAdapterContract.withdrawAmount(
            this.collectiveDirectdaoAddress2,
            this.testtoken1.address,
            this.user1.address);

        console.log(`
            claimed...
            claimedFeeAmount1   ${hre.ethers.utils.formatEther(claimedFeeAmount1)}
            claimedFeeAmount2   ${hre.ethers.utils.formatEther(claimedFeeAmount2)}

            claimedFeeAmount3   ${hre.ethers.utils.formatEther(claimedFeeAmount3)}
        `);
    });

    const submitFundRaiseProposal = async () => {
        const dao = this.collectiveDirectdaoAddress;
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

});