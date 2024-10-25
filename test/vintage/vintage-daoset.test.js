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
import { sync } from "mkdirp";
const hre = require("hardhat");


describe("daoset proposal...", () => {

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

        const {
            dao,
            factories,
            adapters,
            extensions,
            utilContracts,
            testContracts
        } = await deployDefaultDao({
            owner: this.owner,
            daoMode: 0, //  Vintage = 0, Flex = 1,   Collective = 2,
            daoName: "init dao"
        });

        this.daoFactory = factories.daoFactory.instance;
        this.flexFundingPoolFactory = factories.flexFundingPoolFactory.instance;
        this.vintageFundingPoolFactory = factories.vintageFundingPoolFactory.instance;

        this.adapters = adapters;
        this.extensions = extensions;
        this.dao = dao;
        this.testContracts = testContracts;
        this.utilContracts = utilContracts;

        this.flexFundingPoolExtension = extensions.flexFundingPoolExt.functions;

        this.vintageRaiserManagementContract = adapters.vintageRaiserManagementContract.instance;
        this.vintageFundRaiseAdapterContract = adapters.vintageFundRaiseAdapter.instance;
        this.vintageFundingPoolAdapterContract = adapters.vintageFundingPoolAdapterContract.instance;
        this.vintageVotingAdapterContract = adapters.vintageVotingContract.instance;
        this.vintageFundingAdapterContract = adapters.vintageFundingAdapterContract.instance;
        this.vintageVesting = adapters.vintageVesting.instance;
        this.vintageAllocationAdapterContract = adapters.vintageAllocationAdapterContract.instance;
        this.vintageEscrowFundAdapterContract = adapters.vintageEscrowFundAdapterContract.instance;
        this.vintageDistributeAdatperContract = adapters.vintageDistributeAdatperContract.instance;
        this.vintageRaiserAllocationAdapterContract = adapters.vintageRaiserAllocationAdapter.instance;
        this.vintageFundingReturnTokenAdapterContract = adapters.vintageFundingReturnTokenAdapterContract.instance;
        this.vintageFreeInEscrowFundAdapterContract = adapters.vintageFreeInEscrowFundAdapterContract.instance;
        this.vintageFundingPoolAdapterHelperContract = adapters.vintageFundingPoolAdapterHelperContract.instance;
        this.vintageDaoSetAdapterContract = adapters.vintageDaoSetAdapterContract.instance;
        this.vintageDaoSetHelperAdapterContract = adapters.vintageDaoSetHelperAdapterContract.instance;
        this.vintageSetRiceReceiverProposalAdapterContract = adapters.vintageSetRiceReceiverProposalAdapterContract.instance;

        this.testtoken1 = testContracts.testToken1.instance;
        this.testtoken2 = testContracts.testRiceToken.instance;
        this.flexVesting = adapters.flexVesting.instance;
        this.flexERC721 = adapters.flexERC721.instance;
        this.flexAllocationAdapterContract = adapters.flexAllocationAdapterContract.instance;
        this.flexFundingPoolAdapterContract = adapters.flexFundingPoolAdapterContract.instance;
        this.flexVotingContract = adapters.flexVotingContract.instance;
        this.flexFundingAdapterContract = adapters.flexFundingAdapterContract.instance;
        this.bentoBoxV1 = adapters.bentoBoxV1.instance;
        this.flexPollingVotingContract = adapters.flexPollingVotingContract.instance;
        this.summonDao = this.adapters.summonVintageDao.instance;
        this.summonVintageDao = this.adapters.summonVintageDao.instance;
        // this.vintageVestingERC721Contract = this.utilContracts.vintageVestingERC721.instance;

        // const VintageVestingERC721Helper = await hre.ethers.getContractFactory("VintageVestingERC721Helper");
        // const vintageVestingERC721Helper = await VintageVestingERC721Helper.deploy();
        // await vintageVestingERC721Helper.deployed();
        // this.vintageVestingERC721Helper = vintageVestingERC721Helper;

        // const VintageVestingERC721 = await hre.ethers.getContractFactory("VintageVestingERC721");
        // const vintageVestingERC721 = await VintageVestingERC721.deploy(
        //     "DAOSquare Investment Receipt",
        //     "DIR",
        //     this.vintageVesting.address,
        //     this.vintageVestingERC721Helper.address
        // );
        // await vintageVestingERC721.deployed();
        // this.vintageVestingERC721Contract = vintageVestingERC721;

        const VestingERC721Helper = await hre.ethers.getContractFactory("VestingERC721Helper");
        const vestingERC721Helper = await VestingERC721Helper.deploy();
        await vestingERC721Helper.deployed();
        this.vestingERC721Helper = vestingERC721Helper;

        const VestingERC721 = await hre.ethers.getContractFactory("VestingERC721");
        const vestingERC721 = await VestingERC721.deploy(
            "DAOSquare Investment Vesting",
            "DIV",
            this.vintageVesting.address,
            this.vintageVesting.address,
            this.vintageVesting.address,
            this.vestingERC721Helper.address
        );
        await vestingERC721.deployed();
        this.vestingERC721 = vestingERC721;

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.vintageFundingPoolFactory.address
        ];

        const _daoName = _daoName1;

        const creator = this.owner.address;

        const enalbeAdapters = [
            {
                id: '0xa837e34a29b67bf52f684a1c93def79b84b9c012732becee4e5df62809df64ed', //fund raise
                addr: this.vintageFundRaiseAdapterContract.address,
                flags: 1034
            },
            {
                id: '0xaaff643bdbd909f604d46ce015336f7e20fee3ac4a55cef3610188dee176c892', //FundingPoolAdapterContract
                addr: this.vintageFundingPoolAdapterContract.address,
                flags: 8
            },
            {
                id: '0xd3999c37f8f35da86f802a74f9bf032c4aeb46e49abd9c861f489ef4cb40d0a8', //vintageVotingAdapterContract
                addr: this.vintageVotingAdapterContract.address,
                flags: 258
            },
            {
                id: '0xd90e10040720d66c9412cb511e3dbb6ba51669248a7495e763d44ab426893efa', //vintageRaiserManagementContract
                addr: this.vintageRaiserManagementContract.address,
                flags: 6346
            },
            {
                id: '0x0fd8cce4ef00a7a8c0c5f91194bc80f122deefe664dd2a2384687da62ab117d1', //VintageFundingAdapterContract
                addr: this.vintageFundingAdapterContract.address,
                flags: 770
            },
            {
                id: '0x99d271900d627893bad1d8649a7d7eb3501c339595ec52be94d222433d755603', //vintageAllocationAdapterContract
                addr: this.vintageAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x8295fbcf0c0d839b7cf11cacb43f22c81604fd9f0e4b295ff1d641ad9dd5786a', //vintageVestingContract
                addr: this.vintageVesting.address,
                flags: 0
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xf03649ccf5cbda635d0464f73bc807b602819fde8d2e1387f87b988bb0e858a3', // vintageEscrowFundAdapterContract
                addr: this.vintageEscrowFundAdapterContract.address,
                flags: 0
            },
            {
                id: '0xe1cf6669e8110c379c9ea0aceed535b5ed15ea1db2447ab3fbda96c746d21a1a', // vintageDistrubteAdapterContract
                addr: this.vintageDistributeAdatperContract.address,
                flags: 0
            },
            {
                id: '0x1fa6846b165d822fff79e37c67625706652fa9380c2aa49fd513ce534cc72ed4', // vintageRaiserAllocation
                addr: this.vintageRaiserAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0xde483f9dde6f6b12a62abdfd75010c5234f3ce7693a592507d331ec725f77257', // vintageFundingReturnTokenAdapterContract
                addr: this.vintageFundingReturnTokenAdapterContract.address,
                flags: 0
            },
            {
                id: '0x6a687e96f72a484e38a32d2ee3b61626294e792821961a90ce9a98d1999252d5', //vintageFreeInEscrowFundAdapterContract
                addr: this.vintageFreeInEscrowFundAdapterContract.address,
                flags: 0
            },
            {
                id: '0xe70101dfebc310a1a68aa271bb3eb593540746781f9eaca3d7f52f31ba60f5d1', //vintageFundingPoolAdapterHelperContract
                addr: this.vintageFundingPoolAdapterHelperContract.address,
                flags: 0
            },
            {
                id: '0x77cdf6056467142a33aa6f753fc1e3907f6850ebf08c7b63b107b0611a69b04e', //vintageDaoSetAdapterContract
                addr: this.vintageDaoSetAdapterContract.address,
                flags: 122890
            },
            {
                id: '0x145d8ebc4d7403f3cd60312331619ffb262c52c22bedf24c0148027dd4be3b01', //vintageDaoSetHelperAdapterContract
                addr: this.vintageDaoSetHelperAdapterContract.address,
                flags: 8
            },
            {
                id: '0x5f7213b2964496b4b5d7c886ee16ffc5ce56a5a54f96166558da81e33d5567cc', //vintageSetRiceReceiverProposalAdapterContract
                addr: this.vintageSetRiceReceiverProposalAdapterContract.address,
                flags: 33554442
            }
        ];

        const adapters1 = [
            {
                id: '0x161fca6912f107b0f13c9c7275de7391b32d2ea1c52ffba65a3c961880a0c60f',
                addr: this.vintageFundingPoolAdapterContract.address, //vintageFundingPoolAdapterContract
                flags: 23
            },
            {
                id: '0x161fca6912f107b0f13c9c7275de7391b32d2ea1c52ffba65a3c961880a0c60f',
                addr: this.vintageFundingAdapterContract.address, //VintageFundingAdapterContract
                flags: 14
            },
            {
                id: '0x161fca6912f107b0f13c9c7275de7391b32d2ea1c52ffba65a3c961880a0c60f',
                addr: this.vintageDistributeAdatperContract.address, // vintageDistrubteAdapterContract
                flags: 22
            }
        ];

        const vintageDaoParticipantCapInfo = [
            true, //bool enable;
            5 //uint256 maxParticipantsAmount;
        ];
        const ERC721 = await hre.ethers.getContractFactory("PixelNFT");
        const erc721 = await ERC721.deploy(4);
        await erc721.deployed();
        this.testERC721 = erc721;
        const vintageDaoBackerMembershipInfo1 = [
            1, // bool enable;
            "vintageDaoBackerMembershipInfo1",
            0, // uint256 varifyType; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];
        const ERC1155 = await hre.ethers.getContractFactory("ERC1155TestToken");
        const erc1155 = await ERC1155.deploy("this is test uri");
        await erc1155.deployed();
        this.testERC1155 = erc1155;

        //erc20
        const vintageDaoRaiserMembershipInfo1 = [
            1, // bool enable;
            "vintageDaoRaiserMembershipInfo1",
            0, // uint256 varifyType;erc20
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];
        //allocation
        const vintageDaoVotingInfo1 = [
            3, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            1, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoGenesisRaisers = [this.genesis_raiser1.address, this.genesis_raiser2.address];
        const allocations = [100, 100, 100];
        const riceRewardReceiver = this.user1.address;

        const vintageDaoParams1 = [
            _daoName1,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            // vintageDaoParticipantCapInfo,
            // vintageDaoBackerMembershipInfo1,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers,
            allocations,
            riceRewardReceiver
        ];


        let obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams1);
        console.log(obj);
        console.log("summon vintage dao1 succeed...", obj.daoAddr);
        this.daoAddr1 = obj.daoAddr;
        const dao1Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr1);
        this.dao1Contract = dao1Contract;
    });

    const sommonVintageDao = async (summonDaoContract, daoFactoryContract, vintageDaoParams) => {
        let tx = await summonDaoContract.summonVintageDao(vintageDaoParams);
        let result = await tx.wait();
        const daoAddr = await daoFactoryContract.getDaoAddress(vintageDaoParams[0]);
        console.log("daoAddr ", daoAddr);
        const daoName = await daoFactoryContract.daos(daoAddr);
        return {
            daoAddr: daoAddr,
            daoName: daoName
        };
    };

    const createFundingProposal = async (vintageFundingAdapterContract, proposer, dao, params) => {
        const tx = await vintageFundingAdapterContract.connect(proposer).submitProposal(dao, params);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        return proposalId;
    };

    const createFundRaiseProposal = async (vintageFundRaiseAdapterContract, account, params) => {
        const tx = await vintageFundRaiseAdapterContract.connect(account).submitProposal(params);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        return proposalId;
    };

    // it("create daoset participant cap proposal...", async () => {
    //     const enable = true;
    //     const cap = 5;
    //     let tx = await this.vintageDaoSetAdapterContract.submitInvestorCapProposal(this.daoAddr1, enable, cap);

    //     let rel = await tx.wait();

    //     let proposalId = rel.events[rel.events.length - 1].args.proposalId
    //     const proposal = await this.vintageDaoSetAdapterContract.investorCapProposals(
    //         this.daoAddr1,
    //         proposalId);

    //     console.log(proposal);
    //     await expectRevert(this.vintageDaoSetAdapterContract.submitInvestorCapProposal(this.daoAddr1, enable, cap), "revert");


    //     const vintageFundingAdapterContract = this.vintageFundingAdapterContract;
    //     const vintageFundingPoolAdapterContract = this.vintageFundingPoolAdapterContract;
    //     const vintageVotingAdapterContract = this.vintageVotingAdapterContract;
    //     const vintageVesting = this.vintageVesting;
    //     const fundRaiseMinTarget = hre.ethers.utils.parseEther("10000");
    //     const fundRaiseMaxCap = hre.ethers.utils.parseEther("20000");
    //     const lpMinDepositAmount = hre.ethers.utils.parseEther("100");
    //     const lpMaxDepositAmount = hre.ethers.utils.parseEther("200000");
    //     const fundRaiseType = 1; // 0 FCFS 1 Free In

    //     //submit fund raise proposal
    //     const proposalFundRaiseInfo = [
    //         fundRaiseMinTarget,
    //         fundRaiseMaxCap,
    //         lpMinDepositAmount,
    //         lpMaxDepositAmount,
    //         fundRaiseType // 0 FCFS 1 Free In
    //     ];
    //     let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

    //     let startTime = blocktimestamp + 60 * 1;
    //     let endTime = startTime + 60 * 60 * 2;
    //     const fundTerm = 60 * 60 * 24 * 30;
    //     const redemptPeriod = 60 * 60 * 1;
    //     const redemptInterval = 60 * 60 * 24 * 7;
    //     const returnPeriod = 60 * 60 * 1;

    //     let proposalTimeInfo = [
    //         startTime,
    //         endTime,
    //         fundTerm,
    //         redemptPeriod,
    //         redemptInterval,
    //         returnPeriod
    //     ];

    //     const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
    //     const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.001"); //0.1%

    //     const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
    //     const proposalFeeInfo = [
    //         managementFeeRatio,
    //         returnTokenmanagementFeeRatio,
    //         redepmtFeeRatio
    //     ];

    //     const managementFeeAddress = this.user1.address;
    //     const redemptionFeeReceiver = this.user2.address, // redemption fee receiver

    //     const fundRaiseTokenAddress = this.testtoken1.address;
    //     const proposalAddressInfo = [
    //         managementFeeAddress,
    //         redemptionFeeReceiver,
    //         fundRaiseTokenAddress
    //     ];

    //     const fundFromInverstor = hre.ethers.utils.parseEther("0.004");
    //     const projectTokenFromInvestor = hre.ethers.utils.parseEther("0.004");
    //     const proposerReward = [
    //         fundFromInverstor,
    //         projectTokenFromInvestor
    //     ];


    //     const enalbePriorityDeposit = true;
    //     const vtype = 3; // 0 erc20 1 erc721 2 erc1155 3 whitelist
    //     const token = ZERO_ADDRESS;
    //     const tokenId = 0;
    //     const amount = 0;
    //     const priorityDepositeWhitelist = [
    //         this.user1.address,
    //         this.user2.address
    //     ];
    //     const proposalPriorityDepositInfo = [
    //         enalbePriorityDeposit,
    //         vtype,
    //         token,
    //         tokenId,
    //         amount,
    //         priorityDepositeWhitelist
    //     ];

    //     let fundRaiseParams = [
    //         this.daoAddr1,
    //         proposalFundRaiseInfo,
    //         proposalTimeInfo,
    //         proposalFeeInfo,
    //         proposalAddressInfo,
    //         proposerReward,
    //         proposalPriorityDepositInfo
    //     ];

    //     await expectRevert(createFundRaiseProposal(this.vintageFundRaiseAdapterContract, this.owner, fundRaiseParams), "revert");

    //     console.log("voting...");
    //     await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, proposalId, 1);
    //     await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, proposalId, 1);
    //     await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, proposalId, 1);

    //     let ProposalInfo = await this.vintageDaoSetAdapterContract.investorCapProposals(this.daoAddr1, proposalId);
    //     let stopVoteTime = ProposalInfo.stopVoteTime;

    //     if (parseInt(stopVoteTime) > blocktimestamp) {
    //         await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
    //         await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
    //     }
    //     let voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, proposalId);
    //     console.log(`
    //     voted. processing...
    //     state ${voteRel.state}  nbYes ${voteRel.nbYes}  nbNo ${voteRel.nbNo}
    //     process proposal...
    //     `);
    //     await this.vintageDaoSetAdapterContract.processInvestorCapProposal(this.daoAddr1, proposalId);

    //     ProposalInfo = await this.vintageDaoSetAdapterContract.investorCapProposals(this.daoAddr1, proposalId);

    //     console.log(`
    //     executed...
    //     proposal state ${ProposalInfo.state}
    //     `);

    //     blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
    //     startTime = blocktimestamp + 60 * 1;
    //     endTime = startTime + 60 * 60 * 2;

    //     proposalTimeInfo = [
    //         startTime,
    //         endTime,
    //         fundTerm,
    //         redemptPeriod,
    //         redemptInterval,
    //         returnPeriod
    //     ];

    //     fundRaiseParams = [
    //         this.daoAddr1,
    //         proposalFundRaiseInfo,
    //         proposalTimeInfo,
    //         proposalFeeInfo,
    //         proposalAddressInfo,
    //         proposerReward,
    //         proposalPriorityDepositInfo
    //     ];

    //     await expectRevert(createFundRaiseProposal(this.vintageFundRaiseAdapterContract, this.user1, fundRaiseParams), "revert");
    //     const newFundProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, this.genesis_raiser1, fundRaiseParams);

    //     console.log(`
    //     new fund proposal created...
    //     proposalId ${newFundProposalId}
    //     vote for new fund proposal...
    //     `);

    //     await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, newFundProposalId, 1);
    //     await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, newFundProposalId, 1);
    //     await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, newFundProposalId, 1);

    //     let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, newFundProposalId);
    //     stopVoteTime = fundRaiseProposalInfo.stopVoteTime;

    //     if (parseInt(stopVoteTime) > blocktimestamp) {
    //         await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
    //         await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
    //     }
    //     voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, newFundProposalId);
    //     console.log(`
    //     voted. processing...
    //     vote result ${voteRel.state}  nbYes ${voteRel.nbYes}  nbNo ${voteRel.nbNo}
    //     process new fund proposal...
    //     `);
    //     await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr1, newFundProposalId);
    //     fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, newFundProposalId);
    //     let fundState = await vintageFundingPoolAdapterContract.daoFundRaisingStates(this.daoAddr1);
    //     expect(fundRaiseProposalInfo.state == 2, true);
    //     expect(fundState == 1, true);

    //     console.log(`
    //     proposal state ${fundRaiseProposalInfo.state}
    //     fund State ${fundState}
    //     submit daoset proposal...
    //     `);
    //     await expectRevert(this.vintageDaoSetAdapterContract.submitInvestorCapProposal(this.daoAddr1, enable, cap), "revert");

    //     blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

    //     if (parseInt(fundRaiseProposalInfo.timesInfo.fundRaiseEndTime) > blocktimestamp) {
    //         await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseProposalInfo.timesInfo.fundRaiseEndTime) + 1])
    //         await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
    //     }

    //     console.log(`
    //     process fund raising...
    //     `);

    //     await vintageFundingPoolAdapterContract.processFundRaise(this.daoAddr1);
    //     fundState = await vintageFundingPoolAdapterContract.daoFundRaisingStates(this.daoAddr1);
    //     expect(fundState == 3, true);
    //     console.log(`
    //     executed...
    //     fund State ${fundState}
    //     `);
    //     const refundEndTime = parseInt(fundRaiseProposalInfo.timesInfo.fundRaiseEndTime) +
    //         + parseInt(fundRaiseProposalInfo.timesInfo.refundDuration);
    //     blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
    //     if (refundEndTime > blocktimestamp) {
    //         await hre.network.provider.send("evm_setNextBlockTimestamp", [refundEndTime + 1]);
    //         await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
    //     }
    //     blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

    //     console.log(`
    //     ${fundRaiseProposalInfo.timesInfo.fundRaiseEndTime}
    //     ${fundRaiseProposalInfo.timesInfo.refundDuration}
    //     refundEndTime ${refundEndTime}
    //     blocktimestamp ${blocktimestamp}
    //     `)

    //     tx = await this.vintageDaoSetAdapterContract.submitInvestorCapProposal(this.daoAddr1, enable, cap);
    //     console.log(`
    //     dao set proposal created...
    //     `);
    //     rel = await tx.wait();
    //     proposalId = rel.events[rel.events.length - 1].args.proposalId;

    //     ProposalInfo = await this.vintageDaoSetAdapterContract.investorCapProposals(this.daoAddr1, proposalId);
    //     stopVoteTime = ProposalInfo.stopVoteTime;
    //     blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
    //     if (parseInt(stopVoteTime) > blocktimestamp) {
    //         await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
    //         await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
    //     }

    //     await this.vintageDaoSetAdapterContract.processInvestorCapProposal(this.daoAddr1, proposalId);

    // });

    it("create daoset governor membership proposal...", async () => {
        const enable = true;
        const name = "governor-memvership001";
        const varifyType = 0; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS 4 DEPOSIT
        const minAmount = hre.ethers.utils.parseEther("10000");
        const tokenAddress = this.testtoken1.address;
        const tokenId = 0;
        const whitelist = [
            this.user1.address,
            this.user2.address
        ]
        const params = [this.daoAddr1,
            name,
            enable,
            varifyType,
            minAmount,
            tokenAddress,
            tokenId,
            whitelist];
        const tx = await this.vintageDaoSetAdapterContract.submitGovernorMembershipProposal(
            params
        );

        await expectRevert(this.vintageDaoSetAdapterContract.submitGovernorMembershipProposal(
            params
        ), "revert");

        const rel = await tx.wait();

        const proposalId = rel.events[rel.events.length - 1].args.proposalId
        const proposal = await this.vintageDaoSetAdapterContract.governorMembershipProposals(
            this.daoAddr1,
            proposalId);

        // let governorMembershipwhitelist = await this.vintageDaoSetAdapterContract.getGovernorMembershipWhitelist(proposalId);

        console.log(proposal);

        console.log("voting...");
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, proposalId, 1);
        await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, proposalId, 1);

        let ProposalInfo = await this.vintageDaoSetAdapterContract.governorMembershipProposals(this.daoAddr1, proposalId);
        let stopVoteTime = ProposalInfo.stopVoteTime;
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        let voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, proposalId);
        console.log(`
        voted. processing...
        state ${voteRel.state}  nbYes ${voteRel.nbYes}  nbNo ${voteRel.nbNo}
        process proposal...
        `);
        await this.vintageDaoSetAdapterContract.processGovernorMembershipProposal(this.daoAddr1, proposalId);
        ProposalInfo = await this.vintageDaoSetAdapterContract.governorMembershipProposals(this.daoAddr1, proposalId);
        const crmenable = await this.dao1Contract.getConfiguration(sha3("VINTAGE_RAISER_MEMBERSHIP_ENABLE"));
        const cvrmtype = await this.dao1Contract.getConfiguration(sha3("VINTAGE_RAISER_MEMBERSHIP_TYPE"));
        const cvrmamount = await this.dao1Contract.getConfiguration(sha3("VINTAGE_RAISER_MEMBERSHIP_MIN_HOLDING"));
        const cvrmtokenaddr = await this.dao1Contract.getAddressConfiguration(sha3("VINTAGE_RAISER_MEMBERSHIP_TOKEN_ADDRESS"));
        const cvrmtokenid = await this.dao1Contract.getConfiguration(sha3("VINTAGE_RAISER_MEMBERSHIP_TOKENID"));
        const cvrmmindeposit = await this.dao1Contract.getConfiguration(sha3("VINTAGE_RAISER_MEMBERSHIP_MIN_DEPOSIT"));

        expect(cvrmtype == varifyType, true);
        expect(minAmount == cvrmamount, true);
        expect(tokenAddress == cvrmtokenaddr, true);
        expect(tokenId == cvrmtokenid, true);
        console.log(`
        processed...
        proposal state ${ProposalInfo.state}
        crmenable ${crmenable}
        cvrmtype ${cvrmtype}
        cvrmamount ${hre.ethers.utils.formatEther(cvrmamount)}
        cvrmtokenid ${cvrmtokenid}
        cvrmtokenaddr ${cvrmtokenaddr}
        cvrmmindeposit ${hre.ethers.utils.formatEther(cvrmmindeposit)}
        `);
        // console.log(governorMembershipwhitelist);

        // await this.vintageDaoSetAdapterContract.clearGovernorMembershipWhitelist(proposalId);

        // governorMembershipwhitelist = await this.vintageDaoSetAdapterContract.getGovernorMembershipWhitelist(proposalId);
        // console.log(governorMembershipwhitelist);

    });

    // it("create daoset investor membership proposal...", async () => {
    //     const name = 'investormembership002';
    //     const enable = true;
    //     const varifyType = 1; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS
    //     const minAmount = 2;
    //     const tokenAddress = this.testtoken1.address;
    //     const tokenId = 1;
    //     const whitelist = [
    //         this.user1.address,
    //         this.user2.address
    //     ];

    //     const params = [
    //         this.daoAddr1,
    //         name,
    //         enable,
    //         varifyType,
    //         minAmount,
    //         tokenAddress,
    //         tokenId,
    //         whitelist
    //     ];

    //     const tx = await this.vintageDaoSetAdapterContract.submitInvestorMembershipProposal(
    //         params
    //     );

    //     await expectRevert(this.vintageDaoSetAdapterContract.submitInvestorMembershipProposal(
    //         params
    //     ), "revert");

    //     const rel = await tx.wait();

    //     const proposalId = rel.events[rel.events.length - 1].args.proposalId
    //     const proposal = await this.vintageDaoSetAdapterContract.investorMembershipProposals(
    //         this.daoAddr1,
    //         proposalId);

    //     const current_VINTAGE_INVESTOR_MEMBERSHIP_NAME = await await this.dao1Contract.getStringConfiguration(sha3("VINTAGE_INVESTOR_MEMBERSHIP_NAME"));

    //     console.log(proposal);
    //     console.log(`
    //     proposalId ${proposal.proposalId}
    //     current_VINTAGE_INVESTOR_MEMBERSHIP_NAME ${current_VINTAGE_INVESTOR_MEMBERSHIP_NAME}
    //     `);

    //     console.log("voting...");
    //     await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, proposalId, 1);
    //     await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, proposalId, 1);
    //     await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, proposalId, 1);

    //     let ProposalInfo = await this.vintageDaoSetAdapterContract.investorMembershipProposals(this.daoAddr1, proposalId);
    //     let stopVoteTime = ProposalInfo.stopVoteTime;
    //     let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

    //     if (parseInt(stopVoteTime) > blocktimestamp) {
    //         await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
    //         await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
    //     }
    //     let voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, proposalId);
    //     console.log(`
    //     voted. processing...
    //     state ${voteRel.state}  nbYes ${voteRel.nbYes}  nbNo ${voteRel.nbNo}
    //     process proposal...
    //     `);
    //     await this.vintageDaoSetAdapterContract.processInvestorMembershipProposal(this.daoAddr1, proposalId);
    //     ProposalInfo = await this.vintageDaoSetAdapterContract.investorMembershipProposals(this.daoAddr1, proposalId);
    //     const crmenable = await this.dao1Contract.getConfiguration(sha3("VINTAGE_INVESTOR_MEMBERSHIP_ENABLE"));
    //     const cvrmtype = await this.dao1Contract.getConfiguration(sha3("VINTAGE_INVESTOR_MEMBERSHIP_TYPE"));
    //     const cvrmamount = await this.dao1Contract.getConfiguration(sha3("VINTAGE_RAISER_MEMBERSHIP_MIN_HOLDING"));
    //     const cvrmtokenaddr = await this.dao1Contract.getAddressConfiguration(sha3("VINTAGE_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS"));
    //     const cvrmtokenid = await this.dao1Contract.getConfiguration(sha3("VINTAGE_INVESTOR_MEMBERSHIP_TOKENID"));
    //     const VINTAGE_INVESTOR_MEMBERSHIP_NAME = await await this.dao1Contract.getStringConfiguration(sha3("VINTAGE_INVESTOR_MEMBERSHIP_NAME"));
    //     expect(cvrmtype == varifyType, true);
    //     expect(minAmount == cvrmamount, true);
    //     expect(tokenAddress == cvrmtokenaddr, true);
    //     expect(tokenId == cvrmtokenid, true);
    //     console.log(`
    //     processed...
    //     proposal state ${ProposalInfo.state}
    //     crmenable ${crmenable}
    //     cvrmtype ${cvrmtype}
    //     cvrmamount ${hre.ethers.utils.formatEther(cvrmamount)}
    //     cvrmtokenid ${cvrmtokenid}
    //     cvrmtokenaddr ${cvrmtokenaddr}
    //     VINTAGE_INVESTOR_MEMBERSHIP_NAME ${VINTAGE_INVESTOR_MEMBERSHIP_NAME}
    //     `);
    // });

    it("create daoset voting proposal...", async () => {
        const eligibilityType = 1; //0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
        const tokenAddress = this.testtoken1.address;
        const tokenID = 0;
        const votingWeightedType = 1; //0. quantity 1. log2 2. 1 voter 1 vote
        const supportType = 1; // 0. - YES / (YES + NO) > X% 1. - YES - NO > X
        const quorumType = 1; // 0. - YES / (YES + NO) > X% 1. - YES - NO > X
        const support = 2;
        const quorum = 4;
        const votingPeriod = 60 * 10;
        const executingPeriod = 60 * 10;
        const governors = [this.owner.address, this.genesis_raiser1.address, this.genesis_raiser2.address];
        const allocations = [1000, 2000, 3000];
        const votingParams = [
            eligibilityType,
            tokenAddress,
            tokenID,
            votingWeightedType,
            supportType,
            quorumType,
            support,
            quorum,
            votingPeriod,
            executingPeriod,
            governors,
            allocations
        ];

        const tx = await this.vintageDaoSetAdapterContract.submitVotingProposal(
            this.daoAddr1,
            votingParams
        );
        await expectRevert(this.vintageDaoSetAdapterContract.submitVotingProposal(
            this.daoAddr1,
            votingParams
        ), "revert");

        const rel = await tx.wait();

        let alloc0 = await this.vintageRaiserAllocationAdapterContract.getAllocation(this.daoAddr1, this.owner.address);
        let alloc1 = await this.vintageRaiserAllocationAdapterContract.getAllocation(this.daoAddr1, this.genesis_raiser1.address);
        let alloc2 = await this.vintageRaiserAllocationAdapterContract.getAllocation(this.daoAddr1, this.genesis_raiser2.address);


        const proposalId = rel.events[rel.events.length - 1].args.proposalId
        let ProposalInfo = await this.vintageDaoSetAdapterContract.votingProposals(
            this.daoAddr1,
            proposalId);

        // const allocs = await this.vintageDaoSetAdapterContract.getAllocation(proposalId);
        console.log(`
        alloc0 ${alloc0} 
        alloc1 ${alloc1} 
        alloc2 ${alloc2}
        allocs ${ProposalInfo.allocs.allocations}
        `);

        console.log("voting...");
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, proposalId, 1);
        await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, proposalId, 1);

        ProposalInfo = await this.vintageDaoSetAdapterContract.votingProposals(this.daoAddr1, proposalId);
        let stopVoteTime = ProposalInfo.timeInfo.stopVoteTime;
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        let voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, proposalId);
        console.log(`
        voted. processing...
        state ${voteRel.state}  nbYes ${voteRel.nbYes}  nbNo ${voteRel.nbNo}
        process proposal...
        `);
        await this.vintageDaoSetAdapterContract.processVotingProposal(this.daoAddr1, proposalId);
        ProposalInfo = await this.vintageDaoSetAdapterContract.votingProposals(this.daoAddr1, proposalId);
        const cvetype = await this.dao1Contract.getConfiguration(sha3("VINTAGE_VOTING_ELIGIBILITY_TYPE"));
        const cvwtype = await this.dao1Contract.getConfiguration(sha3("VINTAGE_VOTING_WEIGHTED_TYPE"));
        const cvstype = await this.dao1Contract.getConfiguration(sha3("VINTAGE_VOTING_SUPPORT_TYPE"));
        const cvrmtokenaddr = await this.dao1Contract.getAddressConfiguration(sha3("VINTAGE_VOTING_ELIGIBILITY_TOKEN_ADDRESS"));
        const cvrmtokenid = await this.dao1Contract.getConfiguration(sha3("VINTAGE_VOTING_ELIGIBILITY_TOKEN_ID"));
        const cvqtype = await this.dao1Contract.getConfiguration(sha3("VINTAGE_VOTING_QUORUM_TYPE"));
        const cvquorum = await this.dao1Contract.getConfiguration(sha3("QUORUM"));
        const cvsupport = await this.dao1Contract.getConfiguration(sha3("SUPER_MAJORITY"));
        const cvperiod = await this.dao1Contract.getConfiguration(sha3("VOTING_PERIOD"));
        const cveperiod = await this.dao1Contract.getConfiguration(sha3("PROPOSAL_EXECUTE_DURATION"));

        alloc0 = await this.vintageRaiserAllocationAdapterContract.getAllocation(this.daoAddr1, this.owner.address);
        alloc1 = await this.vintageRaiserAllocationAdapterContract.getAllocation(this.daoAddr1, this.genesis_raiser1.address);
        alloc2 = await this.vintageRaiserAllocationAdapterContract.getAllocation(this.daoAddr1, this.genesis_raiser2.address);
        expect(eligibilityType == cvetype, true);
        expect(cvwtype == votingWeightedType, true);

        console.log(`
        processed...
        proposal state ${ProposalInfo.state}
        cvetype ${cvetype}
        cvstype ${cvstype}
        cvwtype ${cvwtype}
        cvrmtokenaddr ${cvrmtokenaddr}
        cvrmtokenid ${cvrmtokenid}
        cvqtype ${cvqtype}
        cvquorum ${cvquorum}
        cvsupport ${cvsupport}
        cvperiod ${cvperiod}
        cveperiod ${cveperiod}

        alloc1 ${alloc1} 
        alloc2 ${alloc2}
        `);
    });

    it("cant submit new daoset proposal untill all daoset proposal done...", async () => {

        const daosetPcProposalId = await submitGovernorMembershipProposal();
        console.log(daosetPcProposalId)
        // await expectRevert(submitGovernorMembershipProposal(), "revert");
        // await expectRevert(submitInvestorMembershipProposal(), "revert");
        await expectRevert(submitVotingProposal(), "revert");


        const ProposalInfo = await this.vintageDaoSetAdapterContract.governorMembershipProposals(
            this.daoAddr1,
            daosetPcProposalId);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let stopVoteTime = ProposalInfo.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        await this.vintageDaoSetAdapterContract.processGovernorMembershipProposal(this.daoAddr1, daosetPcProposalId);
    });
    it("cant submit new daoset proposal during operation proposal process...", async () => {
        await submitFundRaiseProposal();

        // await expectRevert(submitInvestorCapProposal(), "revert");
        await expectRevert(submitGovernorMembershipProposal(), "revert");
        // await expectRevert(submitInvestorMembershipProposal(), "revert");
        await expectRevert(submitVotingProposal(), "revert");
    });


    const submitInvestorCapProposal = async () => {
        const enable = true;
        const cap = 5;
        let tx = await this.vintageDaoSetAdapterContract.submitInvestorCapProposal(this.daoAddr1, enable, cap);

        let rel = await tx.wait();

        let proposalId = rel.events[rel.events.length - 1].args.proposalId

        return proposalId;
    }

    const submitGovernorMembershipProposal = async () => {
        const enable = true;
        const name = "governor-memvership001";
        const varifyType = 0; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS 4 DEPOSIT
        const minAmount = hre.ethers.utils.parseEther("10000");
        const tokenAddress = this.testtoken1.address;
        const tokenId = 0;
        const whitelist = [
            this.user1.address,
            this.user2.address
        ]
        const params = [this.daoAddr1,
            name,
            enable,
            varifyType,
            minAmount,
            tokenAddress,
            tokenId,
            whitelist
        ];
        const tx = await this.vintageDaoSetAdapterContract.submitGovernorMembershipProposal(
            params
        );
        let rel = await tx.wait();

        let proposalId = rel.events[rel.events.length - 1].args.proposalId

        return proposalId;
    }

    const submitInvestorMembershipProposal = async () => {
        const name = 'investormembership002';
        const enable = true;
        const varifyType = 1; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS
        const minAmount = 2;
        const tokenAddress = this.testtoken1.address;
        const tokenId = 1;
        const whitelist = [
            this.user1.address,
            this.user2.address
        ];

        const params = [
            this.daoAddr1,
            name,
            enable,
            varifyType,
            minAmount,
            tokenAddress,
            tokenId,
            whitelist
        ];

        const tx = await this.vintageDaoSetAdapterContract.submitInvestorMembershipProposal(
            params
        );
        let rel = await tx.wait();

        let proposalId = rel.events[rel.events.length - 1].args.proposalId

        return proposalId;
    }

    const submitVotingProposal = async () => {
        const eligibilityType = 1; //0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
        const tokenAddress = this.testtoken1.address;
        const tokenID = 0;
        const votingWeightedType = 1; //0. quantity 1. log2 2. 1 voter 1 vote
        const supportType = 1; // 0. - YES / (YES + NO) > X% 1. - YES - NO > X
        const quorumType = 1; // 0. - YES / (YES + NO) > X% 1. - YES - NO > X
        const support = 2;
        const quorum = 4;
        const votingPeriod = 60 * 10;
        const executingPeriod = 60 * 10;
        const governors = [this.owner.address, this.genesis_raiser1.address, this.genesis_raiser2.address];
        const allocations = [1000, 2000, 3000];
        const votingParams = [
            eligibilityType,
            tokenAddress,
            tokenID,
            votingWeightedType,
            supportType,
            quorumType,
            support,
            quorum,
            votingPeriod,
            executingPeriod,
            governors,
            allocations
        ];

        const tx = await this.vintageDaoSetAdapterContract.submitVotingProposal(
            this.daoAddr1,
            votingParams
        );

        let rel = await tx.wait();

        let proposalId = rel.events[rel.events.length - 1].args.proposalId

        return proposalId;
    }

    const submitFundRaiseProposal = async () => {
        const vintageFundingAdapterContract = this.vintageFundingAdapterContract;
        const vintageFundingPoolAdapterContract = this.vintageFundingPoolAdapterContract;
        const vintageVotingAdapterContract = this.vintageVotingAdapterContract;
        const vintageVesting = this.vintageVesting;
        const fundRaiseMinTarget = hre.ethers.utils.parseEther("10000");
        const fundRaiseMaxCap = hre.ethers.utils.parseEther("20000");
        const lpMinDepositAmount = hre.ethers.utils.parseEther("100");
        const lpMaxDepositAmount = hre.ethers.utils.parseEther("200000");
        const fundRaiseType = 1; // 0 FCFS 1 Free In

        //submit fund raise proposal
        const proposalFundRaiseInfo = [
            fundRaiseMinTarget,
            fundRaiseMaxCap,
            lpMinDepositAmount,
            lpMaxDepositAmount,
            fundRaiseType // 0 FCFS 1 Free In
        ];
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let startTime = blocktimestamp + 60 * 1;
        let endTime = startTime + 60 * 60 * 2;
        const fundTerm = 60 * 60 * 24 * 30;
        const redemptPeriod = 60 * 60 * 1;
        const redemptInterval = 60 * 60 * 24 * 7;
        const returnPeriod = 60 * 60 * 1;

        let proposalTimeInfo = [
            startTime,
            endTime,
            fundTerm,
            redemptPeriod,
            redemptInterval,
            returnPeriod
        ];

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.001"); //0.1%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            returnTokenmanagementFeeRatio,
            redepmtFeeRatio
        ];

        const managementFeeAddress = this.user1.address;
        const redemptionFeeReceiver = this.user2.address, // redemption fee receiver

        const fundRaiseTokenAddress = this.testtoken1.address;
        const proposalAddressInfo = [
            managementFeeAddress,
            redemptionFeeReceiver,
            fundRaiseTokenAddress
        ];

        const fundFromInverstor = hre.ethers.utils.parseEther("0.004");
        const projectTokenFromInvestor = hre.ethers.utils.parseEther("0.004");
        const proposerReward = [
            fundFromInverstor,
            projectTokenFromInvestor
        ];


        const enalbePriorityDeposit = true;
        const vtype = 3; // 0 erc20 1 erc721 2 erc1155 3 whitelist
        const token = ZERO_ADDRESS;
        const tokenId = 0;
        const amount = 0;
        const priorityDepositeWhitelist = [
            this.user1.address,
            this.user2.address
        ];
        const proposalPriorityDepositInfo = [
            enalbePriorityDeposit,
            vtype,
            token,
            tokenId,
            amount,
            priorityDepositeWhitelist
        ];

        let fundRaiseParams = [
            this.daoAddr1,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ];

        const newFundProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, this.owner, fundRaiseParams);

        return newFundProposalId;
    }
});