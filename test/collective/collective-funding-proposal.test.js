
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


describe("funding proposal...", () => {
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
                id: '0x4bb6d123745fe9358fe205a70b7a4aae2a445c56d4bc19c9a123a9259ff615a1', // colletiveExpenseProposalContract
                addr: this.collectiveFreeInEscrowFundAdapterContract.address,
                flags: 0
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
            2 //uint256 maxParticipantsAmount;
        ];

        const enable = true;
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
        const CollectiveDaoInfo = [
            name,
            creator,
            currency,
            redemptionFee,
            proposerInvestTokenReward,
            proposerPaybackTokenReward,
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


        const {
            daoAddr,
            daoName
        } = await sommonCollectiveDao(this.summonCollectiveDao, this.daoFactory, collectiveDaoParams);
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        console.log(`
        new dao address ${daoAddr}
        new dao name ${toUtf8(daoName)}
        `)

        this.collectiveDirectdaoAddress = daoAddr;
        this.daoContract = daoContract;
    });

    const sommonCollectiveDao = async (summonDaoContract, daoFactoryContract, collectiveDaoParams) => {
        let tx = await summonDaoContract.summonCollectiveDao(collectiveDaoParams);
        let result = await tx.wait();
        const len = collectiveDaoParams.length;
        const daoAddr = await daoFactoryContract.getDaoAddress(collectiveDaoParams[len - 1][0]);
        const daoName = await daoFactoryContract.daos(daoAddr);

        return {
            daoAddr: daoAddr,
            daoName: daoName
        };
    };

    const submitFundingProposal = async () => {
        let dao = this.collectiveDirectdaoAddress;
        const token = this.testtoken1.address;
        const fundingAmount = hre.ethers.utils.parseEther("1000");
        const totalAmount = hre.ethers.utils.parseEther("0");
        const receiver = this.user1.address;

        const fundingInfo = [token, fundingAmount, totalAmount, receiver];

        const escrow = true;
        const paybackToken = this.testtoken2.address;

        const price = hre.ethers.utils.parseEther("1.2");
        const paybackAmount = fundingAmount.mul(hre.ethers.utils.parseEther("1")).div(price);
        const approver = this.user2.address;

        const escrowInfo = [
            escrow,
            paybackToken,
            price,
            paybackAmount,
            approver
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const startTime = blocktimestamp + 60 * 10;
        const endTime = startTime + 60 * 30;
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
        const tx = await this.colletiveFundingProposalContract.submitProposal(ProposalParams);
        let result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        return proposalId;

    }

    const submitFundRaiseProposal = async () => {
        const dao = this.collectiveDirectdaoAddress;
        const tokenAddress = this.testtoken1.address;
        const miniTarget = hre.ethers.utils.parseEther("1000");
        const maxCap = hre.ethers.utils.parseEther("2000");
        const miniDeposit = hre.ethers.utils.parseEther("10");
        const maxDeposit = hre.ethers.utils.parseEther("1000");

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
        console.log(`fund raise proposal created...`);
        return proposalId;
    }

    it("submit funding proposal...", async () => {
        let dao = this.collectiveDirectdaoAddress;
        let tokenAddress = this.testtoken1.address;
        const fundingpoolextensionAddr = await this.daoContract.getExtensionAddress(sha3("collective-funding-pool-ext"));
        const collectiveFundingPoolExtContract = (await hre.ethers.getContractFactory("CollectiveInvestmentPoolExtension")).attach(fundingpoolextensionAddr);

        let miniTarget = hre.ethers.utils.parseEther("1000");
        let maxCap = hre.ethers.utils.parseEther("2000");
        let miniDeposit = hre.ethers.utils.parseEther("10");
        let maxDeposit = hre.ethers.utils.parseEther("1000");

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

        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        // await this.collectiveVotingContract.connect(this.genesis_steward1).submitVote(this.collectiveDirectdaoAddress,
        //     proposalId,
        //     1
        // );
        // await this.collectiveVotingContract.connect(this.genesis_steward2).submitVote(this.collectiveDirectdaoAddress,
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

        let fundState = await this.colletiveFundingPoolContract.fundState(this.collectiveDirectdaoAddress);
        console.log(`
        executed...
        fund raise proposal state ${proposalDetail.state}
        fundState                 ${fundState}
        deposit...
        `);

        await this.testtoken1.approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));
        await this.testtoken1.connect(this.investor1).approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));
        await this.testtoken1.connect(this.investor2).approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("2000"));
        await this.testtoken1.transfer(this.investor2.address, hre.ethers.utils.parseEther("2000"));

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        console.log(`
        blocktimestamp ${blocktimestamp}
        `);
        await this.colletiveFundingPoolContract.deposit(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("1000"));
        await this.colletiveFundingPoolContract.connect(this.investor1).deposit(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("500"));


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
        const token = this.testtoken1.address;
        const fundingAmount = hre.ethers.utils.parseEther("1000");
        const totalAmount = hre.ethers.utils.parseEther("0");
        const receiver = this.user1.address;

        const fundingInfo = [token, fundingAmount, totalAmount, receiver];

        const escrow = true;
        const paybackToken = this.testtoken2.address;

        const price = hre.ethers.utils.parseEther("1.2");
        const paybackAmount = fundingAmount.mul(hre.ethers.utils.parseEther("1")).div(price);
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
        await expectRevert(this.colletiveFundingProposalContract.connect(this.project_team1).startVotingProcess(dao,
            proposalId), "revert");

        await this.colletiveFundingProposalContract.startVotingProcess(dao,
            proposalId);

        proposalDetail = await this.colletiveFundingProposalContract.proposals(dao, proposalId);
        const escrowedPaybackAmount = await this.colletiveFundingProposalContract.escrowPaybackTokens(
            dao,
            proposalId,
            this.user2.address);
        console.log(`
        proposal state ${proposalDetail.state}
        escrowedPaybackAmount ${hre.ethers.utils.formatEther(escrowedPaybackAmount)}

        voting...
        `);
        await this.collectiveVotingContract.connect(this.owner).submitVote(dao,
            proposalId,
            1
        );
        // await this.collectiveVotingContract.connect(this.genesis_steward1).submitVote(dao,
        //     proposalId,
        //     1
        // );
        // await this.collectiveVotingContract.connect(this.genesis_steward2).submitVote(dao,
        //     proposalId,
        //     1
        // );

        console.log(`
        voted...
        executing...
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalDetail.timeInfo.stopVotingTime + 60) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalDetail.timeInfo.stopVotingTime + 60) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.colletiveFundingProposalContract.processProposal(dao, proposalId);

        proposalDetail = await this.colletiveFundingProposalContract.proposals(dao, proposalId);
        console.log(`
        executed...
        proposal state ${proposalDetail.state}
        `);


        const vi1 = await this.collectiveAllocationAdapterContract.vestingInfos(dao, proposalId, this.owner.address);
        const vi2 = await this.collectiveAllocationAdapterContract.vestingInfos(dao, proposalId, this.investor1.address);
        let priorDepositBal1 = await collectiveFundingPoolExtContract.getPriorAmount(
            this.owner.address,
            this.testtoken1.address,
            currentBlockNum - 1);

        console.log(`
        vi1 ${hre.ethers.utils.formatEther(vi1[0])}
        vi2 ${hre.ethers.utils.formatEther(vi2[0])}
        create vesting....
        `);

        await this.collectiveVestingContract.createVesting(dao,
            this.owner.address,
            proposalId
        );
        await this.collectiveVestingContract.createVesting(dao,
            this.investor1.address,
            proposalId
        );

        let vestInfo1 = await this.collectiveVestingContract.vests(1)
        let vestInfo2 = await this.collectiveVestingContract.vests(2)
        console.log(`
        vesting created...
        paybackAmount ${hre.ethers.utils.formatEther(proposalDetail.escrowInfo.paybackAmount)}
        vest1 total  ${hre.ethers.utils.formatEther(vestInfo1.total)}
        vest2 total  ${hre.ethers.utils.formatEther(vestInfo2.total)}
        `);


        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(cliffEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(cliffEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        let vestBal1 = await this.collectiveVestingContract.vestBalance(1);
        let vestBal2 = await this.collectiveVestingContract.vestBalance(2);
        let paybackTokenBal = await this.testtoken2.balanceOf(this.investor1.address);
        console.log(`
        vestBal1 ${hre.ethers.utils.formatEther(vestBal1)}
        vestBal2 ${hre.ethers.utils.formatEther(vestBal2)}
        paybackTokenBal ${hre.ethers.utils.formatEther(paybackTokenBal)}
        claim...
        `);
        await this.collectiveVestingContract.connect(this.owner).withdraw(dao, 1);
        await this.collectiveVestingContract.connect(this.investor1).withdraw(dao, 2);


        vestInfo1 = await this.collectiveVestingContract.vests(1)
        vestInfo2 = await this.collectiveVestingContract.vests(2)
        vestBal1 = await this.collectiveVestingContract.vestBalance(1);
        vestBal2 = await this.collectiveVestingContract.vestBalance(2);
        paybackTokenBal = await this.testtoken2.balanceOf(this.investor1.address);

        console.log(`
        claimed...
        claimedAmount1 ${hre.ethers.utils.formatEther(vestInfo1.claimed)}
        claimedAmount2 ${hre.ethers.utils.formatEther(vestInfo2.claimed)}
        vestBal1 ${hre.ethers.utils.formatEther(vestBal1)}
        vestBal2 ${hre.ethers.utils.formatEther(vestBal2)}
        paybackTokenBal ${hre.ethers.utils.formatEther(paybackTokenBal)}
        `);

    });

    const submitTopUpProposal = async () => {
        const token = this.testtoken1.address;
        const amount = hre.ethers.utils.parseEther("10000");
        const tx = await this.colletiveTopUpProposalContract.summbitProposal(
            this.collectiveDirectdaoAddress,
            token,
            amount
        );

        const rel = await tx.wait();
        const proposalId = rel.events[rel.events.length - 1].args.proposalId;
        return proposalId;
    }

    const submitGovernorInProposal = async () => {
        const applicant = this.user1.address;
        const depositAmount = hre.ethers.utils.parseEther("0");
        const tx = await this.colletiveGovernorManagementContract.submitGovernorInProposal(
            this.collectiveDirectdaoAddress,
            applicant,
            depositAmount
        );
        const rel = await tx.wait();

        const proposalId = rel.events[rel.events.length - 1].args.proposalId;
        return proposalId;
    }

    const submitGovernorOutProposal = async () => {
        const applicant = this.genesis_steward1.address;
        const tx = await this.colletiveGovernorManagementContract.submitGovernorOutProposal(
            this.collectiveDirectdaoAddress,
            applicant
        );
        const rel = await tx.wait();

        const proposalId = rel.events[rel.events.length - 1].args.proposalId;
        return proposalId;
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

    it("cant submit funding proposal before fund raise executed...", async () => {
        const fundraiseProposalId = await submitFundRaiseProposal();

        let proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(
            this.collectiveDirectdaoAddress, fundraiseProposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress,
            fundraiseProposalId,
            1
        );
        // await this.collectiveVotingContract.connect(this.genesis_steward1).submitVote(this.collectiveDirectdaoAddress,
        //     fundraiseProposalId,
        //     1
        // );
        // await this.collectiveVotingContract.connect(this.genesis_steward2).submitVote(this.collectiveDirectdaoAddress,
        //     fundraiseProposalId,
        //     1
        // );

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.colletiveFundRaiseProposalContract.processProposal(
            this.collectiveDirectdaoAddress, fundraiseProposalId);

        await expectRevert(submitFundingProposal(), "revert");

        const fundRaiseproposalDetail = await this.colletiveFundRaiseProposalContract.proposals(
            this.collectiveDirectdaoAddress,
            fundraiseProposalId);
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(fundRaiseproposalDetail.timeInfo.endTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseproposalDetail.timeInfo.endTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.colletiveFundingPoolContract.processFundRaise(this.collectiveDirectdaoAddress);

        const fundingProposalId = await submitFundingProposal();
        // const proposalDetail = await this.colletiveFundingProposalContract.proposals(dao, fundingProposalId);
        await this.colletiveFundingProposalContract.startVotingProcess(this.collectiveDirectdaoAddress,
            fundingProposalId);
    });

    it("cant submit funding proposal if top up proposal undone...", async () => {
        const topupProposalId = await submitTopUpProposal();

        await expectRevert(submitFundingProposal(), "revert");

        await this.colletiveTopUpProposalContract.startVoting(
            this.collectiveDirectdaoAddress,
            topupProposalId
        );

        const fundingProposalId = await submitFundingProposal();
        await this.colletiveFundingProposalContract.startVotingProcess(this.collectiveDirectdaoAddress,
            fundingProposalId);
    });

    it("cant submit funding proposal if governor in proposal undone...", async () => {
        const governorInProposalId = await submitGovernorInProposal();

        await expectRevert(submitFundingProposal(), "revert");


        await this.colletiveGovernorManagementContract.startVoting(
            this.collectiveDirectdaoAddress,
            governorInProposalId
        );

        let proposalDetail = await this.colletiveGovernorManagementContract.proposals(this.collectiveDirectdaoAddress, governorInProposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        await this.colletiveGovernorManagementContract.processProposal(this.collectiveDirectdaoAddress, governorInProposalId);

        const fundingProposalId = await submitFundingProposal();
        await this.colletiveFundingProposalContract.startVotingProcess(this.collectiveDirectdaoAddress,
            fundingProposalId);
    });

    // it("cant submit funding proposal if governor out proposal undone...", async () => {
    //     const governorOutProposalId = await submitGovernorOutProposal();
    //     await expectRevert(submitFundingProposal(), "revert");

    //     let proposalDetail = await this.colletiveGovernorManagementContract.proposals(this.collectiveDirectdaoAddress, governorOutProposalId);
    //     const stopVoteTime = proposalDetail.stopVoteTime;

    //     let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
    //     if (parseInt(stopVoteTime) > blocktimestamp) {
    //         await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
    //         await hre.network.provider.send("evm_mine");
    //     }
    //     await this.colletiveGovernorManagementContract.processProposal(this.collectiveDirectdaoAddress, governorOutProposalId);

    //     await submitFundingProposal();
    // });
});