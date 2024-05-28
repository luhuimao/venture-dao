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
const hre = require("hardhat");

describe("governor management...", () => {
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
        this.governor1 = gp1;
        this.governor2 = gp2;
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
        this.colletiveFundRaiseProposalContract = adapters.colletiveFundRaiseProposalContract.instance;
        this.bentoBoxV1 = adapters.bentoBoxV1.instance;
        this.collectivePaybackTokenAdapterContract = this.adapters.collectivePaybackTokenAdapterContract.instance;
        this.collectiveAllocationAdapterContract = this.adapters.collectiveAllocationAdapterContract.instance;
        this.collectiveDistributeAdatperContract = this.adapters.collectiveDistributeAdatperContract.instance;
        this.collectiveVestingContract = this.adapters.collectiveVestingContract.instance;
        this.collectiveEscrowFundAdapterContract = this.adapters.collectiveEscrowFundAdapterContract.instance;
        this.summonCollectiveDao = this.adapters.summonCollectiveDao.instance;
        const ERC721 = await hre.ethers.getContractFactory("PixelNFT");
        const erc721 = await ERC721.deploy(2);
        await erc721.deployed();
        this.testERC721 = erc721;

        const ERC1155 = await hre.ethers.getContractFactory("ERC1155TestToken");
        const erc1155 = await ERC1155.deploy("this is test uri");
        await erc1155.deployed();
        this.testERC1155 = erc1155;

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.collectiveFundingPoolFactory.address
        ];
        _daoName = "my_collective_dao002";
        const daoName1 = "memberhsip-erc20";
        const daoName2 = "memberhsip-erc721";
        const daoName3 = "memberhsip-erc1155";
        const daoName4 = "emberhsip-whitelist";

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
        ];

        const adapters1 = [
            {
                id: '0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab',
                addr: this.colletiveFundingPoolContract.address, //collectiveFundingPoolAdapterContract
                flags: 23
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
            }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const collectiveDaoIvestorCapInfo = [
            true, //bool enable;
            5 //uint256 maxParticipantsAmount;
        ];

        const enable = true;
        const varifyType1 = 0;//erc20
        const varifyType2 = 1;//erc721
        const varifyType3 = 2;//erc1155
        const varifyType4 = 3;//whitelist

        const erc20MinHolding = hre.ethers.utils.parseEther("100");
        const erc721MinHolding = 2;
        const erc1155MinHolding = 3;

        const erc20tokenAddress = this.testtoken1.address;
        const erc721tokenAddress = this.testERC721.address;
        const erc1155TokenAddress = this.testERC1155.address;

        const tokenId = 2;
        const whiteList = [
            this.governor2.address,
        ];


        const collectiveGovernorMembershipInfo1 = [
            enable,
            varifyType1,
            erc20MinHolding,
            erc20tokenAddress,
            0,
            []
        ];


        const collectiveGovernorMembershipInfo2 = [
            enable,
            varifyType2,
            erc721MinHolding,
            erc721tokenAddress,
            0,
            []
        ];


        const collectiveGovernorMembershipInfo3 = [
            enable,
            varifyType3,
            erc1155MinHolding,
            erc1155TokenAddress,
            tokenId,
            []
        ];


        const collectiveGovernorMembershipInfo4 = [
            enable,
            varifyType4,
            0,
            ZERO_ADDRESS,
            tokenId,
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
        const executePeriod = 60;

        const CollectiveDaoVotingInfo = [
            votingAssetType, //0. deposit
            votingPower,//0. quantity 1. log2 2. 1 voter 1 vote
            support,
            quorum,
            supportType, // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            quorumType, // 0. - (YES + NO) / Total > X%  1. - YES + NO > X
            votingPeriod,
            gracePeriod,
            executePeriod
        ]

        const redemptionFee = hre.ethers.utils.parseEther("0.001"); // 0.2%;
        const managementFeeAddress = this.governor1.address;
        const proposerInvestTokenReward = hre.ethers.utils.parseEther("0.001"); // 0.2%;
        const proposerPaybackTokenReward = hre.ethers.utils.parseEther("0.001"); // 0.2%;
        const collectiveDaoGenesisGovernor = [
            this.genesis_steward1.address,
            this.genesis_steward2.address
        ];
        const currency = this.testtoken1.address;
        const CollectiveDaoInfo1 = [
            daoName1,
            creator,
            currency,
            redemptionFee,
            proposerInvestTokenReward,
            proposerPaybackTokenReward,
            collectiveDaoGenesisGovernor
        ];
        const CollectiveDaoInfo2 = [
            daoName2,
            creator,
            currency,
            redemptionFee,
            proposerInvestTokenReward,
            proposerPaybackTokenReward,
            collectiveDaoGenesisGovernor
        ];
        const CollectiveDaoInfo3 = [
            daoName3,
            creator,
            currency,
            redemptionFee,
            proposerInvestTokenReward,
            proposerPaybackTokenReward,
            collectiveDaoGenesisGovernor
        ];
        const CollectiveDaoInfo4 = [
            daoName4,
            creator,
            currency,
            redemptionFee,
            proposerInvestTokenReward,
            proposerPaybackTokenReward,
            collectiveDaoGenesisGovernor
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

        const daoinfo1 = await sommonCollectiveDao(this.summonCollectiveDao, this.daoFactory, collectiveDaoParams1);
        const daoinfo2 = await sommonCollectiveDao(this.summonCollectiveDao, this.daoFactory, collectiveDaoParams2);
        const daoinfo3 = await sommonCollectiveDao(this.summonCollectiveDao, this.daoFactory, collectiveDaoParams3);
        const daoinfo4 = await sommonCollectiveDao(this.summonCollectiveDao, this.daoFactory, collectiveDaoParams4);

        const daoContract1 = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoinfo1.daoAddr);
        const daoContract2 = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoinfo2.daoAddr);
        const daoContract3 = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoinfo3.daoAddr);
        const daoContract4 = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoinfo4.daoAddr);
        // console.log(`
        // new dao address ${daoAddr4}
        // new dao name ${toUtf8(newDaoName4)}
        // `)

        this.collectiveDirectdaoAddress1 = daoinfo1.daoAddr;
        this.daoContract1 = daoContract1;

        this.collectiveDirectdaoAddress2 = daoinfo2.daoAddr;
        this.daoContract2 = daoContract2;

        this.collectiveDirectdaoAddress3 = daoinfo3.daoAddr;
        this.daoContract3 = daoContract3;

        this.collectiveDirectdaoAddress4 = daoinfo4.daoAddr;
        this.daoContract4 = daoContract4;
        // let allGovernros = await this.colletiveGovernorManagementContract.getAllGovernor(this.collectiveDirectdaoAddress);
        // console.log("owner addr", this.owner.address);
        // console.log("genesis1 addr", this.genesis_steward1.address);
        // console.log("genesis2 addr", this.genesis_steward2.address);

        // console.log(allGovernros);
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
        return {
            daoAddr: daoAddr,
            daoName: daoName
        };
    };

    it("governor memberhsip - erc20...", async () => {
        const applicant = this.user1.address;
        const tokenAddress = this.testtoken1.address;
        const depositAmount = hre.ethers.utils.parseEther("200");
        let newGovernorBal = await this.testtoken1.balanceOf(applicant);
        console.log(`
        newGovernorBal ${hre.ethers.utils.formatEther(newGovernorBal)}
        `);
        await expectRevert(this.colletiveGovernorManagementContract.submitGovernorInProposal(
            this.collectiveDirectdaoAddress1,
            applicant,
            depositAmount
        ), "revert");
        await this.testtoken1.transfer(applicant, hre.ethers.utils.parseEther("200"))
        const tx = await this.colletiveGovernorManagementContract.submitGovernorInProposal(
            this.collectiveDirectdaoAddress1,
            applicant,
            depositAmount
        );
        const rel = await tx.wait();

        const proposalId = rel.events[rel.events.length - 1].args.proposalId;
        let allGovernros = await this.colletiveGovernorManagementContract.getAllGovernor(this.collectiveDirectdaoAddress1);

        console.log(`
        allGovernros ${allGovernros}
        created, proposalId: ", ${proposalId}
        `);

        console.log(`
        new governor approval...
        `);
        await this.testtoken1.transfer(applicant, depositAmount);
        await this.testtoken1.connect(this.user1).approve(this.colletiveFundingPoolContract.address, depositAmount);

        await this.colletiveGovernorManagementContract.connect(this.user1).setGovernorInApprove(
            this.collectiveDirectdaoAddress1,
            proposalId,
            this.testtoken1.address,
            depositAmount)
            ;

        await this.colletiveGovernorManagementContract.startVoting(
            this.collectiveDirectdaoAddress1,
            proposalId
        );
        let proposalDetail = await this.colletiveGovernorManagementContract.proposals(this.collectiveDirectdaoAddress1, proposalId);
        console.log(
            `
        depositAmount ${proposalDetail.depositAmount}
        state ${proposalDetail.state}
        `);
        console.log(`
        approved...
        voting...
        `);
        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress1,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward1).submitVote(this.collectiveDirectdaoAddress1,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward2).submitVote(this.collectiveDirectdaoAddress1,
            proposalId,
            1
        );

        const allWeights = await this.collectiveVotingContract.getAllGovernorWeight(this.collectiveDirectdaoAddress1
        );

        const allWeightsByProposalId = await this.collectiveVotingContract.getAllGovernorWeightByProposalId(
            this.collectiveDirectdaoAddress1,
            proposalId
        );

        console.log(
            `
        voted, execute...
        allWeights              ${allWeights}
        allWeightsByProposalId  ${allWeightsByProposalId}
        `
        );
        proposalDetail = await this.colletiveGovernorManagementContract.proposals(this.collectiveDirectdaoAddress1, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const votingRel = await this.collectiveVotingContract.voteResult(this.collectiveDirectdaoAddress1, proposalId);

        await this.colletiveGovernorManagementContract.processProposal(this.collectiveDirectdaoAddress1, proposalId);

        allGovernros = await this.colletiveGovernorManagementContract.getAllGovernor(this.collectiveDirectdaoAddress1);
        const newGovernorDepositedAmount = await this.colletiveFundingPoolContract.balanceOfToken(
            this.collectiveDirectdaoAddress1,
            this.testtoken1.address,
            this.user1.address
        );
        proposalDetail = await this.colletiveGovernorManagementContract.proposals(this.collectiveDirectdaoAddress1, proposalId);
        console.log(`
        executed...
        newGovernorDepositedAmount ${hre.ethers.utils.formatEther(newGovernorDepositedAmount)}
        votingRel ${votingRel}
        proposal state ${proposalDetail.state}
        allGovernros ${allGovernros}
        `);
    });

    it("governor memberhsip - erc721...", async () => {
        const applicant = this.user2.address;
        const tokenAddress = this.testtoken1.address;
        const depositAmount = hre.ethers.utils.parseEther("200");
        let newGovernorErc721Bal = await this.testERC721.balanceOf(applicant);
        console.log(`
        newGovernorBal ${newGovernorErc721Bal}
        `);
        await expectRevert(this.colletiveGovernorManagementContract.submitGovernorInProposal(
            this.collectiveDirectdaoAddress2,
            applicant,
            depositAmount
        ), "revert");
        await this.testERC721.mintPixel(applicant, 0, 0);
        await this.testERC721.mintPixel(applicant, 0, 1);
        newGovernorErc721Bal = await this.testERC721.balanceOf(applicant);
        console.log(`
        newGovernorBal ${newGovernorErc721Bal}
        `);
        const tx = await this.colletiveGovernorManagementContract.submitGovernorInProposal(
            this.collectiveDirectdaoAddress2,
            applicant,
            depositAmount
        );
        const rel = await tx.wait();

        const proposalId = rel.events[rel.events.length - 1].args.proposalId;
        let allGovernros = await this.colletiveGovernorManagementContract.getAllGovernor(this.collectiveDirectdaoAddress2);

        console.log(`
        allGovernros ${allGovernros}
        created, proposalId: ", ${proposalId}
        `);

        console.log(`
        new governor approval...
        `);
        await this.testtoken1.transfer(applicant, depositAmount);
        await this.testtoken1.connect(this.user2).approve(this.colletiveFundingPoolContract.address, depositAmount);

        await this.colletiveGovernorManagementContract.connect(this.user2).setGovernorInApprove(
            this.collectiveDirectdaoAddress2,
            proposalId,
            this.testtoken1.address,
            depositAmount
        );


        console.log(`
        approved...
        start voting...
        `);

        let proposalDetail = await this.colletiveGovernorManagementContract.proposals(this.collectiveDirectdaoAddress2, proposalId);
        console.log(`
        state ${proposalDetail.state}
        `);

        await this.colletiveGovernorManagementContract.startVoting(
            this.collectiveDirectdaoAddress2,
            proposalId
        );

        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress2,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward1).submitVote(this.collectiveDirectdaoAddress2,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward2).submitVote(this.collectiveDirectdaoAddress2,
            proposalId,
            1
        );


        console.log(`
        approved...
        voted, execute...`);
        proposalDetail = await this.colletiveGovernorManagementContract.proposals(this.collectiveDirectdaoAddress2, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const votingRel = await this.collectiveVotingContract.voteResult(this.collectiveDirectdaoAddress2, proposalId);
        await this.colletiveGovernorManagementContract.processProposal(this.collectiveDirectdaoAddress2, proposalId);
        allGovernros = await this.colletiveGovernorManagementContract.getAllGovernor(this.collectiveDirectdaoAddress2);
        const newGovernorDepositedAmount = await this.colletiveFundingPoolContract.balanceOfToken(
            this.collectiveDirectdaoAddress2,
            this.testtoken1.address,
            applicant
        );
        proposalDetail = await this.colletiveGovernorManagementContract.proposals(this.collectiveDirectdaoAddress2, proposalId);
        console.log(`
        executed...
        newGovernorDepositedAmount ${hre.ethers.utils.formatEther(newGovernorDepositedAmount)}
        votingRel ${votingRel}
        proposal state ${proposalDetail.state}
        allGovernros ${allGovernros}
        `);
    });

    it("governor memberhsip - erc1155...", async () => {
        const applicant = this.governor1.address;
        const tokenAddress = this.testtoken1.address;
        const depositAmount = hre.ethers.utils.parseEther("200");
        let newGovernorErc1155Bal = await this.testERC1155.balanceOf(applicant, 2);
        console.log(`
        newGovernorErc1155Bal ${newGovernorErc1155Bal}
        `);
        await expectRevert(this.colletiveGovernorManagementContract.submitGovernorInProposal(
            this.collectiveDirectdaoAddress3,
            applicant,
            depositAmount
        ), "revert");
        await this.testERC1155.mint(applicant, 2, 3, hexToBytes(toHex(2233)));

        newGovernorErc1155Bal = await this.testERC1155.balanceOf(applicant, 2);
        console.log(`
        newGovernorErc1155Bal ${newGovernorErc1155Bal}
        `);
        const tx = await this.colletiveGovernorManagementContract.submitGovernorInProposal(
            this.collectiveDirectdaoAddress3,
            applicant,
            depositAmount
        );
        const rel = await tx.wait();

        const proposalId = rel.events[rel.events.length - 1].args.proposalId;
        let allGovernros = await this.colletiveGovernorManagementContract.getAllGovernor(this.collectiveDirectdaoAddress3);

        console.log(`
        allGovernros ${allGovernros}
        created, proposalId: ", ${proposalId}
        `);

        console.log(`
        new governor approval...
        `);
        await this.testtoken1.transfer(applicant, depositAmount);
        await this.testtoken1.connect(this.governor1).approve(this.colletiveFundingPoolContract.address, depositAmount);

        await this.colletiveGovernorManagementContract.connect(this.governor1).setGovernorInApprove(
            this.collectiveDirectdaoAddress3,
            proposalId,
            this.testtoken1.address,
            depositAmount
        );


        await this.colletiveGovernorManagementContract.startVoting(
            this.collectiveDirectdaoAddress3,
            proposalId
        );

        let proposalDetail = await this.colletiveGovernorManagementContract.proposals(this.collectiveDirectdaoAddress3, proposalId);
        console.log(`
        state ${proposalDetail.state}
        `);

        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress3,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward1).submitVote(this.collectiveDirectdaoAddress3,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward2).submitVote(this.collectiveDirectdaoAddress3,
            proposalId,
            1
        );

        console.log(`
        new governor approval...
        `);
        await this.testtoken1.transfer(applicant, depositAmount);
        this.testtoken1.connect(this.governor1).approve(this.colletiveFundingPoolContract.address, depositAmount);
        console.log(`
        approved...
        voted, execute...`);
        proposalDetail = await this.colletiveGovernorManagementContract.proposals(this.collectiveDirectdaoAddress3, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const votingRel = await this.collectiveVotingContract.voteResult(this.collectiveDirectdaoAddress3, proposalId);
        await this.colletiveGovernorManagementContract.processProposal(this.collectiveDirectdaoAddress3, proposalId);
        allGovernros = await this.colletiveGovernorManagementContract.getAllGovernor(this.collectiveDirectdaoAddress3);
        const newGovernorDepositedAmount = await this.colletiveFundingPoolContract.balanceOfToken(
            this.collectiveDirectdaoAddress3,
            this.testtoken1.address,
            applicant
        );
        proposalDetail = await this.colletiveGovernorManagementContract.proposals(this.collectiveDirectdaoAddress3, proposalId);
        console.log(`
        executed...
        newGovernorDepositedAmount ${hre.ethers.utils.formatEther(newGovernorDepositedAmount)}
        votingRel ${votingRel}
        proposal state ${proposalDetail.state}
        allGovernros ${allGovernros}
        `);
    });

    it("governor memberhsip - whitelist...", async () => {
        let applicant = this.investor1.address;
        const tokenAddress = this.testtoken1.address;
        const depositAmount = hre.ethers.utils.parseEther("200");

        await expectRevert(this.colletiveGovernorManagementContract.submitGovernorInProposal(
            this.collectiveDirectdaoAddress4,
            applicant,
            depositAmount
        ), "revert");

        applicant = this.governor2.address;
        const tx = await this.colletiveGovernorManagementContract.submitGovernorInProposal(
            this.collectiveDirectdaoAddress4,
            applicant,
            depositAmount
        );
        const rel = await tx.wait();

        const proposalId = rel.events[rel.events.length - 1].args.proposalId;
        let allGovernros = await this.colletiveGovernorManagementContract.getAllGovernor(this.collectiveDirectdaoAddress4);

        console.log(`
        allGovernros ${allGovernros}
        created, proposalId: ", ${proposalId}
        voting...
        `);

        console.log(`
        new governor approval...
        `);
        await this.testtoken1.transfer(applicant, depositAmount);
        await this.testtoken1.connect(this.governor2).approve(this.colletiveFundingPoolContract.address, depositAmount);

        await this.colletiveGovernorManagementContract.connect(this.governor2).setGovernorInApprove(
            this.collectiveDirectdaoAddress4,
            proposalId,
            this.testtoken1.address,
            depositAmount
        );

        await this.colletiveGovernorManagementContract.startVoting(
            this.collectiveDirectdaoAddress4,
            proposalId
        );
        let proposalDetail = await this.colletiveGovernorManagementContract.proposals(this.collectiveDirectdaoAddress4, proposalId);
        console.log(`
        state ${proposalDetail.state}
        `);
        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress4,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward1).submitVote(this.collectiveDirectdaoAddress4,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward2).submitVote(this.collectiveDirectdaoAddress4,
            proposalId,
            1
        );

        console.log(`
        approved...
        voted, execute...`);
        proposalDetail = await this.colletiveGovernorManagementContract.proposals(this.collectiveDirectdaoAddress4, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const votingRel = await this.collectiveVotingContract.voteResult(this.collectiveDirectdaoAddress4, proposalId);
        await this.colletiveGovernorManagementContract.processProposal(this.collectiveDirectdaoAddress4, proposalId);
        allGovernros = await this.colletiveGovernorManagementContract.getAllGovernor(this.collectiveDirectdaoAddress4);
        const newGovernorDepositedAmount = await this.colletiveFundingPoolContract.balanceOfToken(
            this.collectiveDirectdaoAddress4,
            this.testtoken1.address,
            applicant
        );
        proposalDetail = await this.colletiveGovernorManagementContract.proposals(this.collectiveDirectdaoAddress4, proposalId);
        console.log(`
        executed...
        newGovernorDepositedAmount ${hre.ethers.utils.formatEther(newGovernorDepositedAmount)}
        votingRel ${votingRel}
        proposal state ${proposalDetail.state}
        allGovernros ${allGovernros}
        `);
    });

    it("governor out...", async () => {
        const applicant = this.user1.address;
        const tx = await this.colletiveGovernorManagementContract.submitGovernorOutProposal(
            this.collectiveDirectdaoAddress1,
            applicant
        );
        const rel = await tx.wait();

        const proposalId = rel.events[rel.events.length - 1].args.proposalId;

        console.log("created, proposalId: ", proposalId);

        let allGovernros = await this.colletiveGovernorManagementContract.getAllGovernor(this.collectiveDirectdaoAddress1);

        console.log(`
        allGovernros ${allGovernros}
        created, proposalId: ", ${proposalId}
        voting...
        `);

        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress1,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward1).submitVote(this.collectiveDirectdaoAddress1,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward2).submitVote(this.collectiveDirectdaoAddress1,
            proposalId,
            1
        );

        await this.collectiveVotingContract.connect(this.user1).submitVote(this.collectiveDirectdaoAddress1,
            proposalId,
            1
        );

        let proposalDetail = await this.colletiveGovernorManagementContract.proposals(this.collectiveDirectdaoAddress1, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        let oldDepositBal = await this.testtoken1.balanceOf(applicant);

        await this.colletiveGovernorManagementContract.processProposal(this.collectiveDirectdaoAddress1, proposalId);
        allGovernros = await this.colletiveGovernorManagementContract.getAllGovernor(this.collectiveDirectdaoAddress1);
        proposalDetail = await this.colletiveGovernorManagementContract.proposals(this.collectiveDirectdaoAddress1, proposalId);
        let newDepositBal = await this.testtoken1.balanceOf(applicant);
        console.log(`
        executed...
        oldDepositBal ${hre.ethers.utils.formatEther(oldDepositBal)}
        newDepositBal ${hre.ethers.utils.formatEther(newDepositBal)}
        proposal state ${proposalDetail.state}
        allGovernros ${allGovernros}
        `);

    });

    it("governor quit...", async () => {
        let allGovernros = await this.colletiveGovernorManagementContract.getAllGovernor(this.collectiveDirectdaoAddress4);
        console.log(allGovernros);
        for (var i = 0; i < allGovernros.length; i++) {
            const depositbal = await this.colletiveFundingPoolContract.balanceOf(this.collectiveDirectdaoAddress4, allGovernros[i]);
            const TT1Bal = await this.testtoken1.balanceOf(allGovernros[i]);
            console.log(`
            governor${i + 1} ${allGovernros[i]} deposite bal ${hre.ethers.utils.formatEther(depositbal)}
            governor${i + 1} ${allGovernros[i]} tt1 bal ${TT1Bal}
            `);
        }
        await this.colletiveGovernorManagementContract.connect(this.governor2).quit(this.collectiveDirectdaoAddress4);
        allGovernros = await this.colletiveGovernorManagementContract.getAllGovernor(this.collectiveDirectdaoAddress4);
        for (var i = 0; i < allGovernros.length; i++) {
            const bal = await this.colletiveFundingPoolContract.balanceOf(this.collectiveDirectdaoAddress4, allGovernros[i]);
            const TT1Bal = await this.testtoken1.balanceOf(allGovernros[i]);
            console.log(`
            governor${i + 1} ${allGovernros[i]} deposite bal ${hre.ethers.utils.formatEther(bal)}
            governor${i + 1} ${allGovernros[i]} tt1 bal ${TT1Bal}
            `);
        }
        const bal = await this.colletiveFundingPoolContract.balanceOf(this.collectiveDirectdaoAddress4, this.governor2.address);
        const TT1Bal = await this.testtoken1.balanceOf(this.governor2.address);
        console.log(`
        deposite bal ${hre.ethers.utils.formatEther(bal)}
        tt1 bal ${hre.ethers.utils.formatEther(TT1Bal)}
        `);
    });
});

