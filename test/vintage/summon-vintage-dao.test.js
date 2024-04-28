/*
 * @Descripttion:
 * @version:
 * @Author: huhuimao
 * @Date: 2022-12-19 13:50:51
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-10-18 17:18:33
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
    zeroPad
} from "ethers/lib/utils";
import {
    boolean
} from "hardhat/internal/core/params/argumentTypes";
import {
    addAbortSignal
} from "stream";
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

        const {
            dao,
            factories,
            adapters,
            extensions,
            testContracts
        } = await deployDefaultDao({
            owner: this.owner,
            daoMode: 0, //  Vintage = 0, Flex = 1,   Collective = 2,
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


        this.vintageRaiserManagementContract = adapters.vintageRaiserManagementContract.instance;
        this.vintageFundRaiseAdapterContract = adapters.vintageFundRaiseAdapter.instance;
        this.vintageFundingPoolAdapterContract = adapters.vintageFundingPoolAdapterContract.instance;
        this.vintageVotingAdapterContract = adapters.vintageVotingContract.instance;
        this.vintageFundingAdapterContract = adapters.vintageFundingAdapterContract.instance;
        this.vintageVesting = adapters.vintageVesting.instance;
        this.vintageAllocationAdapterContract = adapters.vintageAllocationAdapterContract.instance;
        this.vintageDistributeAdatperContract = adapters.vintageDistributeAdatperContract.instance;
        this.vintageEscrowFundAdapterContract = adapters.vintageEscrowFundAdapterContract.instance;
        this.vintageRaiserAllocationAdapterContract = adapters.vintageRaiserAllocationAdapter.instance;
        this.vintageFundingReturnTokenAdapterContract = adapters.vintageFundingReturnTokenAdapterContract.instance;
        this.vintageFreeInEscrowFundAdapterContract = adapters.vintageFreeInEscrowFundAdapterContract.instance;
        this.vintageFundingPoolAdapterHelperContract = adapters.vintageFundingPoolAdapterHelperContract.instance;
        this.vintageDaoSetAdapterContract = adapters.vintageDaoSetAdapterContract.instance;
        this.vintageDaoSetHelperAdapterContract = adapters.vintageDaoSetHelperAdapterContract.instance;

        this.testtoken1 = testContracts.testToken1.instance;
        this.testtoken2 = testContracts.testRiceToken.instance;
        this.flexVesting = adapters.flexVesting.instance;
        this.flexERC721 = adapters.flexERC721.instance;
        this.flexAllocationAdapterContract = adapters.flexAllocationAdapterContract.instance;
        this.flexFundingPoolAdapterContract = adapters.flexFundingPoolAdapterContract.instance;
        this.flexVotingContract = adapters.flexVotingContract.instance;
        this.flexFundingAdapterContract = adapters.flexFundingAdapterContract.instance;
        this.bentoBoxV1 = adapters.bentoBoxV1.instance;
        // this.managing = this.adapters.managing.instance;
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
        return {
            daoAddr: daoAddr,
            daoName: daoName
        };
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

        const vintageDaoBackerMembershipInfo = [
            1, // bool enable;
            "vintageDaoBackerMembershipInfo",
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const vintageDaoRaiserMembershipInfo = [
            1, // bool enable;
            "vintageDaoRaiserMembershipInfo",
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const vintageDaoVotingInfo = [
            0, //eligibilityType
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            0, // uint8 votingPower;
            0, //  uint256 supportType;
            0, //uint256 quorumType;
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoGenesisRaisers = [this.genesis_steward1.address, this.genesis_steward2.address];
        const allocations = [100, 100, 100];
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
            vintageDaoGenesisRaisers,
            allocations
        ];
        console.log("vintageDaoParams: ", vintageDaoParams);

        const {
            daoAddr,
            daoName
        } = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams);
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
            hre.ethers.utils.parseEther("1000"), // uint256 lpMinDepositAmount;
            hre.ethers.utils.parseEther("10000"), // uint256 lpMaxDepositAmount;
            0 // uint8 fundRaiseType; // 0 FCFS 1 Free In
        ]
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const proposalTimeInfo = [
            blocktimestamp + 60 * 60 * 1, // uint256 startTime;
            blocktimestamp + 60 * 60 * 6, // uint256 endTime;
            60 * 60 * 3, // uint256 fundTerm;
            60 * 60 * 1, // uint256 redemptPeriod;
            60 * 60 * 2, // uint256 redemptInterval;
            60 * 60 * 1, // uint256 returnPeriod;
        ]

        const proposalFeeInfo = [
            hre.ethers.utils.parseEther("0.005"), // uint256 managementFeeRatio;
            hre.ethers.utils.parseEther("0.005"), // uint256 managementFeeRatio;
            hre.ethers.utils.parseEther("0.005") // uint256 redepmtFeeRatio;
        ]
        console.log(this.user1.address);
        console.log(this.testtoken1.address);

        const proposalAddressInfo = [
            this.user1.address, // address managementFeeAddress;
            this.testtoken1.address // address fundRaiseTokenAddress;
        ]

        const proposerReward = [
            hre.ethers.utils.parseEther("0.005"), // uint256 fundFromInverstor;
            hre.ethers.utils.parseEther("0.005"), // uint256 projectTokenFromInvestor;
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
        const participantCapInfo = [false, 0];

        const ProposalParams = [
            this.vintagedaoAddress, // DaoRegistry dao;
            proposalFundRaiseInfo, // ProposalFundRaiseInfo ;
            proposalTimeInfo, // ProposalTimeInfo ;
            proposalFeeInfo, // ProposalFeeInfo ;
            proposalAddressInfo, // ProposalAddressInfo ;
            proposerReward, // ProoserReward ;
            proposalPriorityDepositInfo,
            participantCapInfo
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
         fundRaiseTarget ${hre.ethers.utils.formatEther(detail.amountInfo.fundRaiseTarget)}
         fundRaiseMaxAmount ${hre.ethers.utils.formatEther(detail.amountInfo.fundRaiseMaxAmount)}
         lpMinDepositAmount ${hre.ethers.utils.formatEther(detail.amountInfo.lpMinDepositAmount)}
         lpMaxDepositAmount ${hre.ethers.utils.formatEther(detail.amountInfo.lpMaxDepositAmount)}
        FundRiaseTimeInfo timesInfo
         fundRaiseStartTime; ${detail.timesInfo.fundRaiseStartTime}
         fundRaiseEndTime; ${detail.timesInfo.fundRaiseEndTime}
         fundTerm; ${detail.timesInfo.fundTerm}
         redemptPeriod; ${detail.timesInfo.redemptPeriod}
         redemptDuration; ${detail.timesInfo.redemptDuration}
         returnDuration; ${detail.timesInfo.refundDuration}
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

        const {
            dao,
            factories,
            adapters,
            extensions,
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

        this.flexFundingPoolExtension = extensions.flexFundingPoolExt.functions;

        this.vintageRaiserManagementContract = adapters.vintageRaiserManagementContract.instance;
        this.vintageFundRaiseAdapterContract = adapters.vintageFundRaiseAdapter.instance;
        this.vintageFundingPoolAdapterContract = adapters.vintageFundingPoolAdapterContract.instance;
        this.vintageVotingAdapterContract = adapters.vintageVotingContract.instance;
        this.vintageFundingAdapterContract = adapters.vintageFundingAdapterContract.instance;
        this.vintageVesting = adapters.vintageVesting.instance;
        this.vintageAllocationAdapterContract = adapters.vintageAllocationAdapterContract.instance;
        this.vintageDistributeAdatperContract = adapters.vintageDistributeAdatperContract.instance;
        this.vintageEscrowFundAdapterContract = adapters.vintageEscrowFundAdapterContract.instance;
        this.vintageRaiserAllocationAdapterContract = adapters.vintageRaiserAllocationAdapter.instance;
        this.vintageFundingReturnTokenAdapterContract = adapters.vintageFundingReturnTokenAdapterContract.instance;
        this.vintageFreeInEscrowFundAdapterContract = adapters.vintageFreeInEscrowFundAdapterContract.instance;
        this.vintageFundingPoolAdapterHelperContract = adapters.vintageFundingPoolAdapterHelperContract.instance;
        this.vintageDaoSetAdapterContract = adapters.vintageDaoSetAdapterContract.instance;
        this.vintageDaoSetHelperAdapterContract = adapters.vintageDaoSetHelperAdapterContract.instance;

        this.testtoken1 = testContracts.testToken1.instance;
        this.testtoken2 = testContracts.testRiceToken.instance;
        this.flexVesting = adapters.flexVesting.instance;
        this.flexERC721 = adapters.flexERC721.instance;
        this.flexAllocationAdapterContract = adapters.flexAllocationAdapterContract.instance;
        this.flexFundingPoolAdapterContract = adapters.flexFundingPoolAdapterContract.instance;
        this.flexVotingContract = adapters.flexVotingContract.instance;
        this.flexFundingAdapterContract = adapters.flexFundingAdapterContract.instance;
        this.bentoBoxV1 = adapters.bentoBoxV1.instance;
        // this.managing = this.adapters.managing.instance;
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

        const vintageDaoBackerMembershipInfo = [
            1, // bool enable;
            "vintageDaoBackerMembershipInfo",
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const vintageDaoRaiserMembershipInfo1 = [
            1, // bool enable;
            "vintageDaoRaiserMembershipInfo1",
            0, // uint256 varifyType;erc20
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const ERC721 = await hre.ethers.getContractFactory("PixelNFT");
        const erc721 = await ERC721.deploy(2);
        await erc721.deployed();
        this.testERC721 = erc721;
        const vintageDaoRaiserMembershipInfo2 = [
            1, // bool enable;
            "vintageDaoRaiserMembershipInfo1",
            1, // uint256 varifyType;erc721
            1, // uint256 minHolding;
            erc721.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const ERC1155 = await hre.ethers.getContractFactory("ERC1155TestToken");
        const erc1155 = await ERC1155.deploy("this is test uri");
        await erc1155.deployed();
        this.testERC1155 = erc1155;
        const vintageDaoRaiserMembershipInfo3 = [
            1, // bool enable;
            "vintageDaoRaiserMembershipInfo1",
            2, // uint256 varifyType;erc1155
            2, // uint256 minHolding;
            erc1155.address, // address tokenAddress;
            1, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const vintageDaoRaiserMembershipInfo4 = [
            1, // bool enable;
            "vintageDaoRaiserMembershipInfo1",
            3, // uint256 varifyType;whitelist
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [this.gp1.address] // address[] whiteList;
        ];

        const vintageDaoRaiserMembershipInfo5 = [
            1, // bool enable;
            "vintageDaoRaiserMembershipInfo1",
            4, // uint256 varifyType;deposit
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const vintageDaoVotingInfo = [
            0, //eligibilityType
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            0, // uint8 votingPower;
            0, //  uint256 supportType;
            0, //uint256 quorumType;
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoGenesisRaisers = [this.genesis_raiser1.address, this.genesis_raiser2.address];
        const allocations = [100, 100, 100];

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
            vintageDaoGenesisRaisers,
            allocations
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
            vintageDaoGenesisRaisers,
            allocations
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
            vintageDaoGenesisRaisers,
            allocations
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
            vintageDaoGenesisRaisers,
            allocations
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
            vintageDaoGenesisRaisers,
            allocations
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
        return {
            daoAddr: daoAddr,
            daoName: daoName
        };
    };

    it("verify raiser erc20 memberhsip...", async () => {
        let tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        user1 test erc20token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);
        await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr1, this.user1.address, 0), "revert");

        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("100"));
        tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        user1 test token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);
        await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr1, this.user1.address, 0);
    });

    it("verify raiser erc721 memberhsip...", async () => {
        let gp1NFTBal = await this.testERC721.balanceOf(this.user2.address);
        console.log(`
        user2 NFT balance ${gp1NFTBal}
        `);

        await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr2, this.user2.address, 0), "revert");

        console.log(`mint NFT...`);
        await this.testERC721.mintPixel(this.user2.address, 1, 1);
        console.log(`minted...`);

        gp1NFTBal = await this.testERC721.balanceOf(this.user2.address);
        console.log(`
        user2 NFT balance ${gp1NFTBal}
        `);

        await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr2, this.user2.address, 0);
    });

    it("verify raiser erc1155 memberhsip...", async () => {
        let gp1NFTBal = await this.testERC1155.balanceOf(this.user2.address, 1);

        console.log(`
        user2 ERC1155 balance ${gp1NFTBal}
        `);

        await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr3, this.user2.address, 0), "revert");

        console.log(`mint ERC1155 to user2...`);
        await this.testERC1155.mint(this.user2.address, 1, 2, hexToBytes(toHex(2233)));
        console.log(`minted...`);

        gp1NFTBal = await this.testERC1155.balanceOf(this.user2.address, 1);
        console.log(`
        user2 NFT balance ${gp1NFTBal}
        `);

        await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr3, this.user2.address, 0);
    });

    it("verify raiser whitelist memberhsip...", async () => {
        await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr4, this.gp2.address, 0), "revert");
        await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr4, this.gp1.address, 0);
    });

    it("verify raiser deposit memberhsip...", async () => {
        await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr4, this.gp2.address, 0), "revert");
        await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr4, this.gp1.address, 0);
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
        const _daoName11 = "my_vintage_dao11";
        const _daoName12 = "my_vintage_dao12";
        const _daoName13 = "my_vintage_dao13";
        const _daoName14 = "my_vintage_dao14";
        const _daoName15 = "my_vintage_dao15";
        const _daoName16 = "my_vintage_dao16";
        const _daoName17 = "my_vintage_dao17";
        const _daoName18 = "my_vintage_dao18";
        const _daoName19 = "my_vintage_dao19";
        const _daoName20 = "my_vintage_dao20";
        const _daoName21 = "my_vintage_dao21";
        const _daoName22 = "my_vintage_dao22";
        const _daoName23 = "my_vintage_dao23";
        const _daoName24 = "my_vintage_dao24";
        const _daoName25 = "my_vintage_dao25";
        const _daoName26 = "my_vintage_dao26";
        const _daoName27 = "my_vintage_dao27";
        const _daoName28 = "my_vintage_dao28";
        const _daoName29 = "my_vintage_dao29";
        const _daoName30 = "my_vintage_dao30";

        const {
            dao,
            factories,
            adapters,
            extensions,
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

        this.flexFundingPoolExtension = extensions.flexFundingPoolExt.functions;

        this.vintageRaiserManagementContract = adapters.vintageRaiserManagementContract.instance;
        this.vintageFundRaiseAdapterContract = adapters.vintageFundRaiseAdapter.instance;
        this.vintageFundingPoolAdapterContract = adapters.vintageFundingPoolAdapterContract.instance;
        this.vintageVotingAdapterContract = adapters.vintageVotingContract.instance;
        this.vintageFundingAdapterContract = adapters.vintageFundingAdapterContract.instance;
        this.vintageVesting = adapters.vintageVesting.instance;
        this.vintageAllocationAdapterContract = adapters.vintageAllocationAdapterContract.instance;
        this.vintageDistributeAdatperContract = adapters.vintageDistributeAdatperContract.instance;
        this.vintageEscrowFundAdapterContract = adapters.vintageEscrowFundAdapterContract.instance;
        this.vintageRaiserAllocationAdapterContract = adapters.vintageRaiserAllocationAdapter.instance;
        this.vintageFundingReturnTokenAdapterContract = adapters.vintageFundingReturnTokenAdapterContract.instance;
        this.vintageFreeInEscrowFundAdapterContract = adapters.vintageFreeInEscrowFundAdapterContract.instance;
        this.vintageFundingPoolAdapterHelperContract = adapters.vintageFundingPoolAdapterHelperContract.instance;
        this.vintageDaoSetAdapterContract = adapters.vintageDaoSetAdapterContract.instance;
        this.vintageDaoSetHelperAdapterContract = adapters.vintageDaoSetHelperAdapterContract.instance;

        this.testtoken1 = testContracts.testToken1.instance;
        this.testtoken2 = testContracts.testRiceToken.instance;
        this.flexVesting = adapters.flexVesting.instance;
        this.flexERC721 = adapters.flexERC721.instance;
        this.flexAllocationAdapterContract = adapters.flexAllocationAdapterContract.instance;
        this.flexFundingPoolAdapterContract = adapters.flexFundingPoolAdapterContract.instance;
        this.flexVotingContract = adapters.flexVotingContract.instance;
        this.flexFundingAdapterContract = adapters.flexFundingAdapterContract.instance;
        this.bentoBoxV1 = adapters.bentoBoxV1.instance;
        // this.managing = this.adapters.managing.instance;
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

        const vintageDaoBackerMembershipInfo = [
            1, // bool enable;
            "vintageDaoBackerMembershipInfo",
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

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

        const ERC721 = await hre.ethers.getContractFactory("PixelNFT");
        const erc721 = await ERC721.deploy(4);
        await erc721.deployed();
        this.testERC721 = erc721;
        const vintageDaoRaiserMembershipInfo2 = [
            1, // bool enable;
            "vintageDaoRaiserMembershipInfo1",
            1, // uint256 varifyType;erc721
            1, // uint256 minHolding;
            erc721.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const ERC1155 = await hre.ethers.getContractFactory("ERC1155TestToken");
        const erc1155 = await ERC1155.deploy("this is test uri");
        await erc1155.deployed();
        this.testERC1155 = erc1155;
        const vintageDaoRaiserMembershipInfo3 = [
            1, // bool enable;
            "vintageDaoRaiserMembershipInfo1",
            2, // uint256 varifyType;erc1155
            2, // uint256 minHolding;
            erc1155.address, // address tokenAddress;
            1, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];
        //whitelist
        const vintageDaoRaiserMembershipInfo4 = [
            1, // bool enable;
            3, // uint256 varifyType;whitelist
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [this.gp1.address] // address[] whiteList;
        ];
        //deposit
        const vintageDaoRaiserMembershipInfo5 = [
            1, // bool enable;
            4, // uint256 varifyType;deposit
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        //ERC20 log2 YES / (YES + NO) > X% (YES + NO) / Total > X%
        const vintageDaoVotingInfo1 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
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
        //eligibilityType ERC721; votingPower log2 YES / (YES + NO) > X% (YES + NO) / Total > X%
        const vintageDaoVotingInfo2 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testERC721.address, //tokenAddress
            0, //tokenID
            1, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        //eligibilityType ERC1155; votingPower log2 YES / (YES + NO) > X% (YES + NO) / Total > X%
        const vintageDaoVotingInfo3 = [
            2, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testERC1155.address, //tokenAddress
            1, //tokenID
            1, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        //eligibilityType allocation; votingPower log2 YES / (YES + NO) > X% (YES + NO) / Total > X%
        const vintageDaoVotingInfo4 = [
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
        //eligibilityType deposit; votingPower log2 YES / (YES + NO) > X% (YES + NO) / Total > X%
        const vintageDaoVotingInfo5 = [
            4, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
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
        //eligibilityType ERC20; votingPower log2 YES - NO > X YES + NO > X
        const vintageDaoVotingInfo6 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            1, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            1, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            1, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            2, // uint256 support;
            2, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        //eligibilityType ERC721; votingPower log2 YES - NO > X YES + NO > X
        const vintageDaoVotingInfo7 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testERC721.address, //tokenAddress
            0, //tokenID
            1, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            1, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            1, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            2, // uint256 support;
            2, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        //eligibilityType ERC1155; votingPower log2 YES - NO > X YES + NO > X
        const vintageDaoVotingInfo8 = [
            2, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testERC1155.address, //tokenAddress
            1, //tokenID
            1, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            1, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            1, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            2, // uint256 support;
            2, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        //eligibilityType allocation; votingPower log2 YES - NO > X YES + NO > X
        const vintageDaoVotingInfo9 = [
            3, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            1, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            1, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            1, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            2, // uint256 support;
            2, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        //eligibilityType deposit; votingPower log2 YES - NO > X YES + NO > X
        const vintageDaoVotingInfo10 = [
            4, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            1, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            1, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            1, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            2, // uint256 support;
            2, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        //eligibilityType ERC20; votingPower quantity YES / (YES + NO) > X%  (YES + NO) / Total > X%
        const vintageDaoVotingInfo11 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        //eligibilityType ERC721; votingPower quantity YES / (YES + NO) > X%  (YES + NO) / Total > X%
        const vintageDaoVotingInfo12 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testERC721.address, //tokenAddress
            0, //tokenID
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        //eligibilityType ERC1155; votingPower quantity YES / (YES + NO) > X%  (YES + NO) / Total > X%
        const vintageDaoVotingInfo13 = [
            2, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testERC1155.address, //tokenAddress
            1, //tokenID
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        //eligibilityType allocation; votingPower quantity YES / (YES + NO) > X%  (YES + NO) / Total > X%
        const vintageDaoVotingInfo14 = [
            3, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        //eligibilityType deposit; votingPower quantity YES / (YES + NO) > X%  (YES + NO) / Total > X%
        const vintageDaoVotingInfo15 = [
            4, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        //eligibilityType ERC20; votingPower quantity YES - NO > X; YES + NO > X
        const vintageDaoVotingInfo16 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            1, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            1, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            2, // uint256 support;
            2, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        //eligibilityType ERC721; votingPower quantity YES - NO > X; YES + NO > X
        const vintageDaoVotingInfo17 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testERC721.address, //tokenAddress
            0, //tokenID
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            1, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            1, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            2, // uint256 support;
            2, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        //eligibilityType ERC1155; votingPower quantity YES - NO > X; YES + NO > X
        const vintageDaoVotingInfo18 = [
            2, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testERC1155.address, //tokenAddress
            1, //tokenID
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            1, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            1, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            2, // uint256 support;
            2, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        //eligibilityType allocation; votingPower quantity YES - NO > X; YES + NO > X
        const vintageDaoVotingInfo19 = [
            3, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            1, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            1, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            2, // uint256 support;
            2, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        //eligibilityType deposit; votingPower quantity YES - NO > X; YES + NO > X
        const vintageDaoVotingInfo20 = [
            4, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            1, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            1, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            2, // uint256 support;
            2, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        //eligibilityType ERC20; votingPower 1 voter 1 vote YES - NO > X; YES + NO > X
        const vintageDaoVotingInfo21 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            2, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo22 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testERC721.address, //tokenAddress
            0, //tokenID
            2, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo23 = [
            2, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testERC1155.address, //tokenAddress
            1, //tokenID
            2, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo24 = [
            3, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            2, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo25 = [
            4, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            2, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo26 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            2, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            1, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            1, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            2, // uint256 support;
            2, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo27 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testERC721.address, //tokenAddress
            0, //tokenID
            2, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            1, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            1, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            2, // uint256 support;
            2, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo28 = [
            2, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testERC1155.address, //tokenAddress
            1, //tokenID
            2, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            1, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            1, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            2, // uint256 support;
            2, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo29 = [
            3, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            2, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            1, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            1, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            2, // uint256 support;
            2, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo30 = [
            4, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            2, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            1, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            1, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            2, // uint256 support;
            2, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoGenesisRaisers = [this.genesis_raiser1.address, this.genesis_raiser2.address];
        const allocations = [100, 100, 100];

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
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams2 = [
            _daoName2,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo2,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams3 = [
            _daoName3,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo3,
            vintageDaoGenesisRaisers,
            allocations
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
            vintageDaoVotingInfo4,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams5 = [
            _daoName5,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo5,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams6 = [
            _daoName6,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo6,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams7 = [
            _daoName7,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo7,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams8 = [
            _daoName8,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo8,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams9 = [
            _daoName9,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo9,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams10 = [
            _daoName10,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo10,
            vintageDaoGenesisRaisers,
            allocations
        ];


        const vintageDaoParams11 = [
            _daoName11,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo11,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams12 = [
            _daoName12,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo12,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams13 = [
            _daoName13,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo13,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams14 = [
            _daoName14,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo14,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams15 = [
            _daoName15,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo15,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams16 = [
            _daoName16,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo16,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams17 = [
            _daoName17,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo17,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams18 = [
            _daoName18,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo18,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams19 = [
            _daoName19,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo19,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams20 = [
            _daoName20,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo20,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams21 = [
            _daoName21,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo21,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams22 = [
            _daoName22,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo22,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams23 = [
            _daoName23,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo23,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams24 = [
            _daoName24,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo24,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams25 = [
            _daoName25,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo25,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams26 = [
            _daoName26,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo26,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams27 = [
            _daoName27,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo27,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams28 = [
            _daoName28,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo28,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams29 = [
            _daoName29,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo29,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams30 = [
            _daoName30,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo30,
            vintageDaoGenesisRaisers,
            allocations
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

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams6);
        console.log("summon vintage dao6 succeed...", obj.daoAddr);
        this.daoAddr6 = obj.daoAddr;
        const dao6Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr6);
        this.dao6Contract = dao6Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams7);
        console.log("summon vintage dao7 succeed...", obj.daoAddr);
        this.daoAddr7 = obj.daoAddr;
        const dao7Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr7);
        this.dao7Contract = dao7Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams8);
        console.log("summon vintage dao8 succeed...", obj.daoAddr);
        this.daoAddr8 = obj.daoAddr;
        const dao8Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr8);
        this.dao8Contract = dao8Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams9);
        console.log("summon vintage dao9 succeed...", obj.daoAddr);
        this.daoAddr9 = obj.daoAddr;
        const dao9Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr9);
        this.dao9Contract = dao9Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams10);
        console.log("summon vintage dao10 succeed...", obj.daoAddr);
        this.daoAddr10 = obj.daoAddr;
        const dao10Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr10);
        this.dao10Contract = dao10Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams11);
        console.log("summon vintage dao11 succeed...", obj.daoAddr);
        this.daoAddr11 = obj.daoAddr;
        const dao11Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr11);
        this.dao11Contract = dao11Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams12);
        console.log("summon vintage dao12 succeed...", obj.daoAddr);
        this.daoAddr12 = obj.daoAddr;
        const dao12Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr12);
        this.dao12Contract = dao12Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams13);
        console.log("summon vintage dao13 succeed...", obj.daoAddr);
        this.daoAddr13 = obj.daoAddr;
        const dao13Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr13);
        this.dao13Contract = dao13Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams14);
        console.log("summon vintage dao14 succeed...", obj.daoAddr);
        this.daoAddr14 = obj.daoAddr;
        const dao14Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr14);
        this.dao14Contract = dao14Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams15);
        console.log("summon vintage dao15 succeed...", obj.daoAddr);
        this.daoAddr15 = obj.daoAddr;
        const dao15Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr15);
        this.dao15Contract = dao15Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams16);
        console.log("summon vintage dao16 succeed...", obj.daoAddr);
        this.daoAddr16 = obj.daoAddr;
        const dao16Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr16);
        this.dao16Contract = dao16Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams17);
        console.log("summon vintage dao17 succeed...", obj.daoAddr);
        this.daoAddr17 = obj.daoAddr;
        const dao17Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr17);
        this.dao17Contract = dao17Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams18);
        console.log("summon vintage dao18 succeed...", obj.daoAddr);
        this.daoAddr18 = obj.daoAddr;
        const dao18Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr18);
        this.dao18Contract = dao18Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams19);
        console.log("summon vintage dao19 succeed...", obj.daoAddr);
        this.daoAddr19 = obj.daoAddr;
        const dao19Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr19);
        this.dao19Contract = dao19Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams20);
        console.log("summon vintage dao20 succeed...", obj.daoAddr);
        this.daoAddr20 = obj.daoAddr;
        const dao20Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr20);
        this.dao20Contract = dao20Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams21);
        console.log("summon vintage dao21 succeed...", obj.daoAddr);
        this.daoAddr21 = obj.daoAddr;
        const dao21Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr21);
        this.dao21Contract = dao21Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams22);
        console.log("summon vintage dao22 succeed...", obj.daoAddr);
        this.daoAddr22 = obj.daoAddr;
        const dao22Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr22);
        this.dao22Contract = dao22Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams23);
        console.log("summon vintage dao23 succeed...", obj.daoAddr);
        this.daoAddr23 = obj.daoAddr;
        const dao23Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr23);
        this.dao23Contract = dao23Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams24);
        console.log("summon vintage dao24 succeed...", obj.daoAddr);
        this.daoAddr24 = obj.daoAddr;
        const dao24Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr24);
        this.dao24Contract = dao24Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams25);
        console.log("summon vintage dao25 succeed...", obj.daoAddr);
        this.daoAddr25 = obj.daoAddr;
        const dao25Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr25);
        this.dao25Contract = dao25Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams26);
        console.log("summon vintage dao26 succeed...", obj.daoAddr);
        this.daoAddr26 = obj.daoAddr;
        const dao26Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr26);
        this.dao26Contract = dao26Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams27);
        console.log("summon vintage dao27 succeed...", obj.daoAddr);
        this.daoAddr27 = obj.daoAddr;
        const dao27Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr27);
        this.dao27Contract = dao27Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams28);
        console.log("summon vintage dao28 succeed...", obj.daoAddr);
        this.daoAddr28 = obj.daoAddr;
        const dao28Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr28);
        this.dao28Contract = dao28Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams29);
        console.log("summon vintage dao29 succeed...", obj.daoAddr);
        this.daoAddr29 = obj.daoAddr;
        const dao29Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr29);
        this.dao29Contract = dao29Contract;

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams30);
        console.log("summon vintage dao30 succeed...", obj.daoAddr);
        this.daoAddr30 = obj.daoAddr;
        const dao30Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr30);
        this.dao30Contract = dao30Contract;
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


    it("eligibility erc20, voting power log2, quorum, support percentage...", async () => {
        let tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        user1 test erc20token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);
        await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr1, this.user1.address, 0), "revert");

        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("100"));
        await this.testtoken1.transfer(this.genesis_raiser1.address, hre.ethers.utils.parseEther("100"));
        await this.testtoken1.transfer(this.genesis_raiser2.address, hre.ethers.utils.parseEther("100"));
        let isRaiser = await this.dao1Contract.isMember(this.user1.address);

        tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        user1 test token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        user1 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr1, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr1, proposalId);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr1, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr1, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr1, this.genesis_raiser2.address);
        let allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr1);
        let allWeightsByProposalId = await this.vintageVotingAdapterContract.getAllGovernorWeightByProposalId(this.daoAddr1, proposalId);

        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        ${this.vintageVotingAdapterContract.address}
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        allWeightsByProposalId ${allWeightsByProposalId}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr1, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, proposalId, 1);
        await this.testtoken1.connect(this.genesis_raiser2).transfer(this.user2.address, hre.ethers.utils.parseEther("90"));

        allWeightsByProposalId = await this.vintageVotingAdapterContract.getAllGovernorWeightByProposalId(this.daoAddr1, proposalId);
        allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr1);

        console.log(`
        allWeights ${allWeights}
        allWeightsByProposalId ${allWeightsByProposalId}
        `);
        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3)) * 60 / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, proposalId);
        isRaiser = await this.dao1Contract.isMember(this.user1.address);
        await this.vintageRaiserManagementContract.processProposal(this.daoAddr1, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr1, proposalId);
        console.log(`
        processed...
        proposal ${proposalId} state ${proposalInfo.state}
        user2 is Raiser ${isRaiser}
        vote result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        minVotes ${minVotes}
        minYes ${minYes}
        votes 3
        `);
    });

    it("eligibility erc721, voting power log2, quorum, support percentage...", async () => {
        let tt1user1Bal = await this.testERC721.balanceOf(this.user2.address);
        console.log(`
        user2 test erc721token bal ${tt1user1Bal}
        `);
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr2, this.user1.address), "revert");

        // await this.testERC721.mintPixel(this.user2.address, 0, 0);
        // await this.testERC721.mintPixel(this.user2.address, 0, 1);

        await this.testERC721.mintPixel(this.genesis_raiser1.address, 0, 2);
        await this.testERC721.mintPixel(this.genesis_raiser1.address, 0, 3);

        await this.testERC721.mintPixel(this.genesis_raiser2.address, 1, 0);
        await this.testERC721.mintPixel(this.genesis_raiser2.address, 1, 1);

        let isRaiser = await this.dao2Contract.isMember(this.user1.address);

        tt1user1Bal = await this.testERC721.balanceOf(this.user1.address);
        console.log(`
        user2 test token bal ${tt1user1Bal}
        user2 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr2, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr2, proposalId);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr2, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr2, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr2, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr2);

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
        const minYes = (parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3)) * 60 / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr2, proposalId);

        await this.vintageRaiserManagementContract.processProposal(this.daoAddr2, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr2, proposalId);
        isRaiser = await this.dao2Contract.isMember(this.user1.address);
        console.log(`
        processed...
        
        proposal ${proposalId} state ${proposalInfo.state}
        user2 is Raiser ${isRaiser}
        vote result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        minVotes ${minVotes}
        minYes ${minYes}
        votes 3
        `);
    });

    it("eligibility erc1155, voting power log2, quorum, support percentage...", async () => {
        let tt1user1Bal = await this.testERC1155.balanceOf(this.investor1.address, 1);

        console.log(`
        investor1 test erc20token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr3, this.user1.address), "revert");

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
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr3, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr3, proposalId);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr3, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr3, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr3, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr3);

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
        const minYes = (parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3)) * 60 / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr3, proposalId);

        await this.vintageRaiserManagementContract.processProposal(this.daoAddr3, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr3, proposalId);
        isRaiser = await this.dao3Contract.isMember(this.investor1.address);

        console.log(`
        processed...
        proposal ${proposalId} state ${proposalInfo.state}
        vote result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}

        minVotes ${minVotes}
        minYes ${minYes}
        votes 3
        investor1 is Raiser ${isRaiser}
        `);
    });

    it("eligibility allocation, voting power log2, quorum, support percentage...", async () => {
        let tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        investor2 test erc20token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr4, this.user1.address), "revert");

        // await this.testtoken1.transfer(this.investor2.address, hre.ethers.utils.parseEther("100"));
        // await this.testtoken1.transfer(this.genesis_raiser1.address, hre.ethers.utils.parseEther("100"));
        // await this.testtoken1.transfer(this.genesis_raiser2.address, hre.ethers.utils.parseEther("100"));
        let isRaiser = await this.dao4Contract.isMember(this.user1.address);

        tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        investor2 test token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        investor2 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr4, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr4, proposalId);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr4, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr4, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr4, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr4);
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
        const minVotes = (allWeights * 66) / 100;
        const minYes = (parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3)) * 60 / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr4, proposalId);
        isRaiser = await this.dao4Contract.isMember(this.user1.address);
        await this.vintageRaiserManagementContract.processProposal(this.daoAddr4, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr4, proposalId);
        console.log(`
        processed...
        proposal ${proposalId} state ${proposalInfo.state}
        investor2 is Raiser ${isRaiser}
        vote result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}

        quorum ${minVotes}
        support ${minYes}
        votes 3
        `);
    });

    it("eligibility deposit,voting power log2, quorum, support percentage...", async () => {
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr5, this.gp2.address), "revert");

        let isRaiser = await this.dao5Contract.isMember(this.user1.address);

        console.log(`
        user1 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr5, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr5, proposalId);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr5, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr5, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr5, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr5);
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
        const minVotes = (allWeights * 66) / 100;
        const minYes = (parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3)) * 60 / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr5, proposalId);
        isRaiser = await this.dao5Contract.isMember(this.user1.address);
        await this.vintageRaiserManagementContract.processProposal(this.daoAddr5, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr5, proposalId);
        console.log(`
        processed...
        proposal ${proposalId} state ${proposalInfo.state}
        user1 is Raiser ${isRaiser}
        vote result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}

        quorum ${minVotes}
        support ${minYes}
        votes 3
        `);
    });

    it("eligibility erc20, voting power log2, quorum, support integer...", async () => {
        let tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        user1 test erc20token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr6, this.user1.address), "revert");

        // await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("100"));
        // await this.testtoken1.transfer(this.genesis_raiser1.address, hre.ethers.utils.parseEther("100"));
        // await this.testtoken1.transfer(this.genesis_raiser2.address, hre.ethers.utils.parseEther("100"));
        let isRaiser = await this.dao1Contract.isMember(this.user1.address);

        tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        user1 test token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        user2 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr6, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr6, proposalId);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr6, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr6, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr6, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr6);
        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        ${this.vintageVotingAdapterContract.address}
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr6, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr6, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr6, proposalId, 1);

        const allVoteWeight = parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3);
        const yesnb = parseInt(votingWeight2) + parseInt(votingWeight3) - parseInt(votingWeight1);

        console.log(`
        allVoteWeight ${allVoteWeight}
        yesnb ${yesnb}

        allVoteWeight - quorum ${allVoteWeight - 2}
        yesnb - support ${yesnb - 2}
        `);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = parseInt(votingWeight2) + parseInt(votingWeight3) - parseInt(votingWeight1);
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr6, proposalId);
        isRaiser = await this.dao1Contract.isMember(this.user1.address);
        await this.vintageRaiserManagementContract.processProposal(this.daoAddr6, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr6, proposalId);
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

    it("eligibility erc721, voting power log2, quorum, support integer...", async () => {
        let tt1user1Bal = await this.testERC721.balanceOf(this.user1.address);
        console.log(`
        user1 test erc721token bal ${tt1user1Bal}
        `);
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr7, this.user2.address), "revert");

        // await this.testERC721.mintPixel(this.user2.address, 1, 2);
        // await this.testERC721.mintPixel(this.user2.address, 1, 3);

        await this.testERC721.mintPixel(this.genesis_raiser1.address, 2, 0);
        await this.testERC721.mintPixel(this.genesis_raiser1.address, 2, 1);

        await this.testERC721.mintPixel(this.genesis_raiser2.address, 2, 2);
        await this.testERC721.mintPixel(this.genesis_raiser2.address, 2, 3);

        let isRaiser = await this.dao2Contract.isMember(this.user1.address);

        tt1user1Bal = await this.testERC721.balanceOf(this.user1.address);
        console.log(`
        user2 test token bal ${tt1user1Bal}
        user2 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr7, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr7, proposalId);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr7, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr7, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr7, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr7);

        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        ${this.vintageVotingAdapterContract.address}
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr7, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr7, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr7, proposalId, 1);

        const allVoteWeight = parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3);
        const yesnb = parseInt(votingWeight2) + parseInt(votingWeight3) - parseInt(votingWeight1);

        console.log(`
        allVoteWeight ${allVoteWeight}
        yesnb ${yesnb}

        allVoteWeight - quorum ${allVoteWeight - 2}
        yesnb - support ${yesnb - 2}
        `);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (3 * 60) / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr7, proposalId);

        await this.vintageRaiserManagementContract.processProposal(this.daoAddr7, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr7, proposalId);
        isRaiser = await this.dao2Contract.isMember(this.user1.address);
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

    it("eligibility erc1155, voting power log2, quorum, support integer...", async () => {
        let tt1user1Bal = await this.testERC1155.balanceOf(this.user1.address, 1);

        console.log(`
        user1 test testERC1155 bal ${tt1user1Bal}
        `);
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr8, this.investor1.address), "revert");

        // await this.testERC1155.mint(this.investor1.address, 1, 2, hexToBytes(toHex(2233)));
        await this.testERC1155.mint(this.genesis_raiser1.address, 1, 2, hexToBytes(toHex(2233)));
        await this.testERC1155.mint(this.genesis_raiser2.address, 1, 2, hexToBytes(toHex(2233)));
        await this.testERC1155.mint(this.owner.address, 1, 2, hexToBytes(toHex(2233)));

        let isRaiser = await this.dao3Contract.isMember(this.user1.address);

        tt1user1Bal = await this.testERC1155.balanceOf(this.user1.address, 1);
        console.log(`
        user1 is Raiser ${isRaiser}
        user1 testERC1155 bal ${tt1user1Bal}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr8, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr8, proposalId);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr8, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr8, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr8, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr8);

        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr8, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr8, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr8, proposalId, 1);

        const allVoteWeight = parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3);
        const yesnb = parseInt(votingWeight2) + parseInt(votingWeight3) - parseInt(votingWeight1);

        console.log(`
        allVoteWeight ${allVoteWeight}
        yesnb ${yesnb}

        allVoteWeight - quorum ${allVoteWeight - 2}
        yesnb - support ${yesnb - 2}
        `);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (3 * 60) / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr8, proposalId);

        await this.vintageRaiserManagementContract.processProposal(this.daoAddr8, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr8, proposalId);
        isRaiser = await this.dao3Contract.isMember(this.user1.address);

        console.log(`
        processed...
        vote result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        proposal ${proposalId} state ${proposalInfo.state}
        minVotes ${minVotes}
        minYes ${minYes}
        votes 3
        user1 is Raiser ${isRaiser}
        `);
    });

    it("eligibility allocation, voting power log2, quorum, support integer...", async () => {
        let tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        user1 test erc20token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr9, this.investor2.address), "revert");

        // await this.testtoken1.transfer(this.investor2.address, hre.ethers.utils.parseEther("100"));
        await this.testtoken1.transfer(this.genesis_raiser1.address, hre.ethers.utils.parseEther("100"));
        await this.testtoken1.transfer(this.genesis_raiser2.address, hre.ethers.utils.parseEther("100"));
        let isRaiser = await this.dao4Contract.isMember(this.user1.address);

        tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        user1 test token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        user1 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr9, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr9, proposalId);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr9, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr9, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr9, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr9);
        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        ${this.vintageVotingAdapterContract.address}
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr9, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr9, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr9, proposalId, 1);

        const allVoteWeight = parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3);
        const yesnb = parseInt(votingWeight2) + parseInt(votingWeight3) - parseInt(votingWeight1);

        console.log(`
        allVoteWeight ${allVoteWeight}
        yesnb ${yesnb}

        allVoteWeight - quorum ${allVoteWeight - 2}
        yesnb - support ${yesnb - 2}
        `);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const quorum = 2;
        const support = 2;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr9, proposalId);
        isRaiser = await this.dao4Contract.isMember(this.user1.address);
        await this.vintageRaiserManagementContract.processProposal(this.daoAddr9, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr9, proposalId);
        console.log(`
        processed...
        vote result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        proposal ${proposalId} state ${proposalInfo.state}
        user1 is Raiser ${isRaiser}
        quorum ${quorum}
        support ${support}
        votes 3
        `);
    });

    it("eligibility deposit,voting power log2, quorum, support integer...", async () => {
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr10, this.user1.address), "revert");

        let isRaiser = await this.dao5Contract.isMember(this.user1.address);

        console.log(`
        gp1 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr10, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr10, proposalId);

        const depositBal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr10, this.owner.address);
        const depositBal2 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr10, this.genesis_raiser1.address);
        const depositBal3 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr10, this.genesis_raiser2.address);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr10, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr10, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr10, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr10);
        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        depositBal1 ${hre.ethers.utils.formatEther(depositBal1)}
        depositBal2 ${hre.ethers.utils.formatEther(depositBal2)}
        depositBal3 ${hre.ethers.utils.formatEther(depositBal3)}

        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr10, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr10, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr10, proposalId, 1);

        const allVoteWeight = parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3);
        const yesnb = parseInt(votingWeight1) + parseInt(votingWeight3) - parseInt(votingWeight2);

        console.log(`
        allVoteWeight ${allVoteWeight}
        yesnb ${yesnb}

        allVoteWeight - quorum ${allVoteWeight - 2}
        yesnb - support ${yesnb - 2}
        `);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const quorum = 2;
        const support = 2;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr10, proposalId);
        isRaiser = await this.dao5Contract.isMember(this.user1.address);
        await this.vintageRaiserManagementContract.processProposal(this.daoAddr10, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr10, proposalId);
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

    it("eligibility erc20, voting power quantity, quorum, support percentage...", async () => {
        let tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        user1 test erc20token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);

        // await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("100"));
        await this.testtoken1.transfer(this.genesis_raiser1.address, hre.ethers.utils.parseEther("100"));
        await this.testtoken1.transfer(this.genesis_raiser2.address, hre.ethers.utils.parseEther("100"));
        let isRaiser = await this.dao1Contract.isMember(this.user1.address);

        tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        user1 test token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        user2 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr11, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr11, proposalId);
        const erc20Bal1 = await this.testtoken1.balanceOf(this.owner.address);
        const erc20Bal2 = await this.testtoken1.balanceOf(this.genesis_raiser1.address);
        const erc20Bal3 = await this.testtoken1.balanceOf(this.genesis_raiser2.address);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr11, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr11, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr11, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr11);
        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        ${this.vintageVotingAdapterContract.address}
        erc20Bal1: ${hre.ethers.utils.formatEther(erc20Bal1)}
        erc20Bal2: ${hre.ethers.utils.formatEther(erc20Bal2)}
        erc20Bal3: ${hre.ethers.utils.formatEther(erc20Bal3)}

        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr11, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr11, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr11, proposalId, 1);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3)) * 60 / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr11, proposalId);
        isRaiser = await this.dao1Contract.isMember(this.user1.address);
        await this.vintageRaiserManagementContract.processProposal(this.daoAddr11, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr11, proposalId);
        console.log(`
        processed...
        proposal ${proposalId} state ${proposalInfo.state}
        user2 is Raiser ${isRaiser}
        vote result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}

        minVotes ${minVotes}
        minYes ${minYes}
        votes 3
        `);
    });

    it("eligibility erc721, voting power quantity, quorum, support percentage...", async () => {
        let tt1user1Bal = await this.testERC721.balanceOf(this.user1.address);
        console.log(`
        user1 test erc721token bal ${tt1user1Bal}
        `);
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr12, this.user1.address), "revert");

        // await this.testERC721.mintPixel(this.user2.address, 3, 0);
        // await this.testERC721.mintPixel(this.user2.address, 3, 1);

        // await this.testERC721.mintPixel(this.investor1.address, 3, 2);
        // await this.testERC721.mintPixel(this.investor1.address, 3, 3);

        // await this.testERC721.mintPixel(this.genesis_raiser2.address, 4, 0);
        // await this.testERC721.mintPixel(this.genesis_raiser2.address, 4, 1);

        let isRaiser = await this.dao2Contract.isMember(this.user1.address);

        tt1user1Bal = await this.testERC721.balanceOf(this.user1.address);
        console.log(`
        user2 test token bal ${tt1user1Bal}
        user2 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr12, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr12, proposalId);
        const erc721Bal1 = await this.testERC721.balanceOf(this.owner.address);
        const erc721Bal2 = await this.testERC721.balanceOf(this.genesis_raiser1.address);
        const erc721Bal3 = await this.testERC721.balanceOf(this.genesis_raiser2.address);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr12, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr12, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr12, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr12);

        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        ${this.vintageVotingAdapterContract.address}
        erc721Bal1: ${erc721Bal1}
        erc721Bal2: ${erc721Bal2}
        erc721Bal3: ${erc721Bal3}

        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr12, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr12, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr12, proposalId, 1);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3)) * 60 / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr12, proposalId);

        await this.vintageRaiserManagementContract.processProposal(this.daoAddr12, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr12, proposalId);
        isRaiser = await this.dao2Contract.isMember(this.user1.address);
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

    it("eligibility erc1155, voting power quantity, quorum, support percentage...", async () => {
        let tt1user1Bal = await this.testERC1155.balanceOf(this.user1.address, 1);

        console.log(`
        funding_proposer1 test erc20token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr13, this.user1.address), "revert");

        // await this.testERC1155.mint(this.funding_proposer1.address, 1, 2, hexToBytes(toHex(2233)));
        await this.testERC1155.mint(this.genesis_raiser1.address, 1, 2, hexToBytes(toHex(2233)));
        await this.testERC1155.mint(this.genesis_raiser2.address, 1, 2, hexToBytes(toHex(2233)));
        await this.testERC1155.mint(this.owner.address, 1, 2, hexToBytes(toHex(2233)));

        let isRaiser = await this.dao3Contract.isMember(this.user1.address);

        tt1user1Bal = await this.testERC1155.balanceOf(this.user1.address, 1);
        console.log(`
        funding_proposer1 is Raiser ${isRaiser}
        funding_proposer1 test token bal ${tt1user1Bal}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr13, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr13, proposalId);
        const erc1155Bal1 = await this.testERC1155.balanceOf(this.owner.address, 1);
        const erc1155Bal2 = await this.testERC1155.balanceOf(this.genesis_raiser1.address, 1);
        const erc1155Bal3 = await this.testERC1155.balanceOf(this.genesis_raiser2.address, 1);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr13, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr13, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr13, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr13);

        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        erc1155Bal1: ${erc1155Bal1}
        erc1155Bal2: ${erc1155Bal2}
        erc1155Bal3: ${erc1155Bal3}

        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr13, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr13, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr13, proposalId, 1);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3)) * 60 / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr13, proposalId);

        await this.vintageRaiserManagementContract.processProposal(this.daoAddr13, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr13, proposalId);
        isRaiser = await this.dao3Contract.isMember(this.user1.address);

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

    it("eligibility allocation, voting power quantity, quorum, support percentage...", async () => {
        let tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        funding_proposer2_whitelist test erc20token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr14, this.user1.address), "revert");

        // await this.testtoken1.transfer(this.funding_proposer2_whitelist.address, hre.ethers.utils.parseEther("100"));
        // await this.testtoken1.transfer(this.genesis_raiser1.address, hre.ethers.utils.parseEther("100"));
        // await this.testtoken1.transfer(this.genesis_raiser2.address, hre.ethers.utils.parseEther("100"));
        let isRaiser = await this.dao4Contract.isMember(this.user1.address);

        tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        user1 test token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        user1 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr14, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr14, proposalId);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr14, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr14, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr14, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr14);
        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        ${this.vintageVotingAdapterContract.address}
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr14, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr14, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr14, proposalId, 1);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3)) * 60 / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr14, proposalId);
        isRaiser = await this.dao4Contract.isMember(this.user1.address);
        await this.vintageRaiserManagementContract.processProposal(this.daoAddr14, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr14, proposalId);
        console.log(`
        processed...
        vote result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        proposal ${proposalId} state ${proposalInfo.state}
        investor2 is Raiser ${isRaiser}
        quorum ${minVotes}
        support ${minYes}
        votes 3
        `);
    });

    it("eligibility deposit,voting power quantity, quorum, support percentage...", async () => {
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr15, this.gp2.address), "revert");

        let isRaiser = await this.dao5Contract.isMember(this.user1.address);

        console.log(`
        gp1 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr15, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr15, proposalId);

        const depositBal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr15, this.owner.address);
        const depositBal2 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr15, this.genesis_raiser1.address);
        const depositBal3 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr15, this.genesis_raiser2.address);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr15, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr15, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr15, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr15);
        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        depositBal1 ${hre.ethers.utils.formatEther(depositBal1)}
        depositBal2 ${hre.ethers.utils.formatEther(depositBal2)}
        depositBal3 ${hre.ethers.utils.formatEther(depositBal3)}
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr15, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr15, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr15, proposalId, 1);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3)) * 60 / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr15, proposalId);
        isRaiser = await this.dao5Contract.isMember(this.user1.address);
        await this.vintageRaiserManagementContract.processProposal(this.daoAddr15, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr15, proposalId);
        console.log(`
        processed...
        vote result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        proposal ${proposalId} state ${proposalInfo.state}
        investor2 is Raiser ${isRaiser}
        quorum ${minVotes}
        support ${minYes}
        votes 3
        `);
    });

    it("eligibility erc20, voting power quantity, quorum, support integer...", async () => {
        let tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        user1 test erc20token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr6, this.user1.address), "revert");

        // await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("100"));
        // await this.testtoken1.transfer(this.genesis_raiser1.address, hre.ethers.utils.parseEther("100"));
        // await this.testtoken1.transfer(this.genesis_raiser2.address, hre.ethers.utils.parseEther("100"));
        let isRaiser = await this.dao1Contract.isMember(this.user1.address);

        tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        user1 test token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        user2 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr16, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr16, proposalId);

        const erc20Bal1 = await this.testtoken1.balanceOf(this.owner.address);
        const erc20Bal2 = await this.testtoken1.balanceOf(this.genesis_raiser1.address);
        const erc20Bal3 = await this.testtoken1.balanceOf(this.genesis_raiser2.address);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr16, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr16, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr16, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr16);
        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        ${this.vintageVotingAdapterContract.address}
        erc20Bal1: ${hre.ethers.utils.formatEther(erc20Bal1)}
        erc20Bal2: ${hre.ethers.utils.formatEther(erc20Bal2)}
        erc20Bal3: ${hre.ethers.utils.formatEther(erc20Bal3)}
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr16, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr16, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr16, proposalId, 1);

        const allVoteWeight = parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3);
        const yesnb = parseInt(votingWeight2) + parseInt(votingWeight3) - parseInt(votingWeight1);

        console.log(`
        allVoteWeight ${allVoteWeight}
        yesnb ${yesnb}

        allVoteWeight - quorum ${allVoteWeight - 2}
        yesnb - support ${yesnb - 2}
        `);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (3 * 60) / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr16, proposalId);
        isRaiser = await this.dao1Contract.isMember(this.user1.address);
        await this.vintageRaiserManagementContract.processProposal(this.daoAddr16, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr16, proposalId);
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

    it("eligibility erc721, voting power quantity, quorum, support integer...", async () => {
        let tt1user1Bal = await this.testERC721.balanceOf(this.user1.address);
        console.log(`
        user1 test erc721token bal ${tt1user1Bal}
        `);
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr7, this.user2.address), "revert");

        // await this.testERC721.mintPixel(this.funding_proposer2_whitelist.address, 3, 0);
        // await this.testERC721.mintPixel(this.funding_proposer2_whitelist.address, 3, 1);

        // await this.testERC721.mintPixel(this.genesis_raiser1.address, 2, 0);
        // await this.testERC721.mintPixel(this.genesis_raiser1.address, 2, 1);

        // await this.testERC721.mintPixel(this.genesis_raiser2.address, 2, 2);
        // await this.testERC721.mintPixel(this.genesis_raiser2.address, 2, 3);

        let isRaiser = await this.dao2Contract.isMember(this.user1.address);

        tt1user1Bal = await this.testERC721.balanceOf(this.user1.address);
        console.log(`
        funding_proposer2_whitelist test token bal ${tt1user1Bal}
        funding_proposer2_whitelist is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr17, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr17, proposalId);

        const erc721Bal1 = await this.testERC721.balanceOf(this.owner.address);
        const erc721Bal2 = await this.testERC721.balanceOf(this.genesis_raiser1.address);
        const erc721Bal3 = await this.testERC721.balanceOf(this.genesis_raiser2.address);


        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr17, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr17, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr17, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr17);

        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        ${this.vintageVotingAdapterContract.address}
        erc721Bal1: ${erc721Bal1}
        erc721Bal2: ${erc721Bal2}
        erc721Bal3: ${erc721Bal3}
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr17, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr17, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr17, proposalId, 1);

        const allVoteWeight = parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3);
        const yesnb = parseInt(votingWeight2) + parseInt(votingWeight3) - parseInt(votingWeight1);

        console.log(`
        allVoteWeight ${allVoteWeight}
        yesnb ${yesnb}

        allVoteWeight - quorum ${allVoteWeight - 2}
        yesnb - support ${yesnb - 2}
        `);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (3 * 60) / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr17, proposalId);

        await this.vintageRaiserManagementContract.processProposal(this.daoAddr17, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr17, proposalId);
        isRaiser = await this.dao2Contract.isMember(this.user1.address);
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

    it("eligibility erc1155, voting power quantity, quorum, support integer...", async () => {
        let tt1user1Bal = await this.testERC1155.balanceOf(this.investor1.address, 1);

        console.log(`
        investor1 test testERC1155 bal ${tt1user1Bal}
        `);
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr8, this.investor1.address), "revert");

        // await this.testERC1155.mint(this.investor1.address, 1, 2, hexToBytes(toHex(2233)));
        await this.testERC1155.mint(this.genesis_raiser1.address, 1, 2, hexToBytes(toHex(2233)));
        await this.testERC1155.mint(this.genesis_raiser2.address, 1, 2, hexToBytes(toHex(2233)));
        await this.testERC1155.mint(this.owner.address, 1, 2, hexToBytes(toHex(2233)));

        let isRaiser = await this.dao3Contract.isMember(this.investor1.address);

        tt1user1Bal = await this.testERC1155.balanceOf(this.investor1.address, 1);
        console.log(`
        investor1 is Raiser ${isRaiser}
        investor1 test token bal ${tt1user1Bal}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr18, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr18, proposalId);

        const erc1155Bal1 = await this.testERC1155.balanceOf(this.owner.address, 1);
        const erc1155Bal2 = await this.testERC1155.balanceOf(this.genesis_raiser1.address, 1);
        const erc1155Bal3 = await this.testERC1155.balanceOf(this.genesis_raiser2.address, 1);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr18, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr18, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr18, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr18);

        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        erc1155Bal1: ${erc1155Bal1}
        erc1155Bal2: ${erc1155Bal2}
        erc1155Bal3: ${erc1155Bal3}
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr18, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr18, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr18, proposalId, 1);

        const allVoteWeight = parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3);
        const yesnb = parseInt(votingWeight2) + parseInt(votingWeight3) - parseInt(votingWeight1);

        console.log(`
        allVoteWeight ${allVoteWeight}
        yesnb ${yesnb}

        allVoteWeight - quorum ${allVoteWeight - 2}
        yesnb - support ${yesnb - 2}
        `);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (3 * 60) / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr18, proposalId);

        await this.vintageRaiserManagementContract.processProposal(this.daoAddr18, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr18, proposalId);
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

    it("eligibility allocation, voting power quantity, quorum, support integer...", async () => {
        let tt1user1Bal = await this.testtoken1.balanceOf(this.investor2.address);
        console.log(`
        investor2 test erc20token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr9, this.investor2.address), "revert");

        await this.testtoken1.transfer(this.investor2.address, hre.ethers.utils.parseEther("100"));
        await this.testtoken1.transfer(this.genesis_raiser1.address, hre.ethers.utils.parseEther("100"));
        await this.testtoken1.transfer(this.genesis_raiser2.address, hre.ethers.utils.parseEther("100"));
        let isRaiser = await this.dao4Contract.isMember(this.investor2.address);

        tt1user1Bal = await this.testtoken1.balanceOf(this.investor2.address);
        console.log(`
        investor2 test token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        investor2 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr19, this.investor2.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr19, proposalId);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr19, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr19, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr19, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr19);
        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        ${this.vintageVotingAdapterContract.address}
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr19, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr19, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr19, proposalId, 1);

        const allVoteWeight = parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3);
        const yesnb = parseInt(votingWeight2) + parseInt(votingWeight3) - parseInt(votingWeight1);

        console.log(`
        allVoteWeight ${allVoteWeight}
        yesnb ${yesnb}

        allVoteWeight - quorum ${allVoteWeight - 2}
        yesnb - support ${yesnb - 2}
        `);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const quorum = 2;
        const support = 2;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr19, proposalId);
        isRaiser = await this.dao4Contract.isMember(this.investor2.address);
        await this.vintageRaiserManagementContract.processProposal(this.daoAddr19, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr19, proposalId);
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

    it("eligibility deposit,voting power quantity, quorum, support integer...", async () => {
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr20, this.gp2.address), "revert");

        let isRaiser = await this.dao5Contract.isMember(this.user1.address);

        console.log(`
        gp1 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr20, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr20, proposalId);

        const depositBal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr20, this.owner.address);
        const depositBal2 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr20, this.genesis_raiser1.address);
        const depositBal3 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr20, this.genesis_raiser2.address);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr20, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr20, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr20, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr20);
        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        depositBal1 ${hre.ethers.utils.formatEther(depositBal1)}
        depositBal2 ${hre.ethers.utils.formatEther(depositBal2)}
        depositBal3 ${hre.ethers.utils.formatEther(depositBal3)}

        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr20, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr20, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr20, proposalId, 1);

        const allVoteWeight = parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3);
        const yesnb = parseInt(votingWeight1) + parseInt(votingWeight3) - parseInt(votingWeight2);

        console.log(`
        allVoteWeight ${allVoteWeight}
        yesnb ${yesnb}

        allVoteWeight - quorum ${allVoteWeight - 2}
        yesnb - support ${yesnb - 2}
        `);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const quorum = 2;
        const support = 2;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr20, proposalId);
        isRaiser = await this.dao5Contract.isMember(this.user1.address);
        await this.vintageRaiserManagementContract.processProposal(this.daoAddr20, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr20, proposalId);
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

    it("eligibility erc20, voting power 1 voter 1 vote, quorum, support percentage...", async () => {
        let tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        user1 test erc20token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);

        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("100"));
        await this.testtoken1.transfer(this.genesis_raiser1.address, hre.ethers.utils.parseEther("100"));
        await this.testtoken1.transfer(this.genesis_raiser2.address, hre.ethers.utils.parseEther("100"));
        let isRaiser = await this.dao1Contract.isMember(this.user1.address);

        tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        user1 test token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        user2 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr21, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr21, proposalId);
        const erc20Bal1 = await this.testtoken1.balanceOf(this.owner.address);
        const erc20Bal2 = await this.testtoken1.balanceOf(this.genesis_raiser1.address);
        const erc20Bal3 = await this.testtoken1.balanceOf(this.genesis_raiser2.address);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr21, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr21, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr21, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr21);
        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        ${this.vintageVotingAdapterContract.address}
        erc20Bal1: ${hre.ethers.utils.formatEther(erc20Bal1)}
        erc20Bal2: ${hre.ethers.utils.formatEther(erc20Bal2)}
        erc20Bal3: ${hre.ethers.utils.formatEther(erc20Bal3)}

        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr21, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr21, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr21, proposalId, 1);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3)) * 60 / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr21, proposalId);
        isRaiser = await this.dao1Contract.isMember(this.user1.address);
        await this.vintageRaiserManagementContract.processProposal(this.daoAddr21, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr21, proposalId);
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

    it("eligibility erc721, voting power 1 voter 1 vote, quorum, support percentage...", async () => {
        let tt1user1Bal = await this.testERC721.balanceOf(this.user1.address);
        console.log(`
        user2 test erc721token bal ${tt1user1Bal}
        `);
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr22, this.investor1.address), "revert");

        // await this.testERC721.mintPixel(this.user2.address, 3, 0);
        // await this.testERC721.mintPixel(this.user2.address, 3, 1);

        // await this.testERC721.mintPixel(this.investor1.address, 3, 2);
        // await this.testERC721.mintPixel(this.investor1.address, 3, 3);

        // await this.testERC721.mintPixel(this.genesis_raiser2.address, 4, 0);
        // await this.testERC721.mintPixel(this.genesis_raiser2.address, 4, 1);

        let isRaiser = await this.dao2Contract.isMember(this.user2.address);

        tt1user1Bal = await this.testERC721.balanceOf(this.user2.address);
        console.log(`
        user2 test token bal ${tt1user1Bal}
        user2 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr22, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr22, proposalId);
        const erc721Bal1 = await this.testERC721.balanceOf(this.owner.address);
        const erc721Bal2 = await this.testERC721.balanceOf(this.genesis_raiser1.address);
        const erc721Bal3 = await this.testERC721.balanceOf(this.genesis_raiser2.address);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr22, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr22, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr22, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr22);

        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        ${this.vintageVotingAdapterContract.address}
        erc721Bal1: ${erc721Bal1}
        erc721Bal2: ${erc721Bal2}
        erc721Bal3: ${erc721Bal3}

        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr22, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr22, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr22, proposalId, 1);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3)) * 60 / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr22, proposalId);

        await this.vintageRaiserManagementContract.processProposal(this.daoAddr22, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr22, proposalId);
        isRaiser = await this.dao2Contract.isMember(this.user1.address);
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

    it("eligibility erc1155, voting power 1 voter 1 vote, quorum, support percentage...", async () => {
        let tt1user1Bal = await this.testERC1155.balanceOf(this.user1.address, 1);

        console.log(`
        funding_proposer1 test erc20token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr23, this.funding_proposer1.address), "revert");

        // await this.testERC1155.mint(this.funding_proposer1.address, 1, 2, hexToBytes(toHex(2233)));
        // await this.testERC1155.mint(this.genesis_raiser1.address, 1, 2, hexToBytes(toHex(2233)));
        // await this.testERC1155.mint(this.genesis_raiser2.address, 1, 2, hexToBytes(toHex(2233)));
        // await this.testERC1155.mint(this.owner.address, 1, 2, hexToBytes(toHex(2233)));

        let isRaiser = await this.dao3Contract.isMember(this.user1.address);

        tt1user1Bal = await this.testERC1155.balanceOf(this.user1.address, 1);
        console.log(`
        funding_proposer1 is Raiser ${isRaiser}
        funding_proposer1 test token bal ${tt1user1Bal}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr23, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr23, proposalId);
        const erc1155Bal1 = await this.testERC1155.balanceOf(this.owner.address, 1);
        const erc1155Bal2 = await this.testERC1155.balanceOf(this.genesis_raiser1.address, 1);
        const erc1155Bal3 = await this.testERC1155.balanceOf(this.genesis_raiser2.address, 1);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr23, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr23, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr23, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr23);

        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        erc1155Bal1: ${erc1155Bal1}
        erc1155Bal2: ${erc1155Bal2}
        erc1155Bal3: ${erc1155Bal3}

        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr23, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr23, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr23, proposalId, 1);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3)) * 60 / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr23, proposalId);

        await this.vintageRaiserManagementContract.processProposal(this.daoAddr23, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr23, proposalId);
        isRaiser = await this.dao3Contract.isMember(this.user1.address);

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

    it("eligibility allocation, voting power 1 voter 1 vote, quorum, support percentage...", async () => {
        let tt1user1Bal = await this.testtoken1.balanceOf(this.funding_proposer2_whitelist.address);
        console.log(`
        funding_proposer2_whitelist test erc20token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr4, this.funding_proposer2_whitelist.address), "revert");

        await this.testtoken1.transfer(this.funding_proposer2_whitelist.address, hre.ethers.utils.parseEther("100"));
        await this.testtoken1.transfer(this.genesis_raiser1.address, hre.ethers.utils.parseEther("100"));
        await this.testtoken1.transfer(this.genesis_raiser2.address, hre.ethers.utils.parseEther("100"));
        let isRaiser = await this.dao4Contract.isMember(this.funding_proposer2_whitelist.address);

        tt1user1Bal = await this.testtoken1.balanceOf(this.funding_proposer2_whitelist.address);
        console.log(`
        funding_proposer2_whitelist test token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        funding_proposer2_whitelist is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr24, this.funding_proposer2_whitelist.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr24, proposalId);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr24, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr24, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr24, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr24);
        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        ${this.vintageVotingAdapterContract.address}
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr24, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr24, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr24, proposalId, 1);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3)) * 60 / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr24, proposalId);
        isRaiser = await this.dao4Contract.isMember(this.investor2.address);
        await this.vintageRaiserManagementContract.processProposal(this.daoAddr24, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr24, proposalId);
        console.log(`
        processed...
        vote result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        proposal ${proposalId} state ${proposalInfo.state}
        investor2 is Raiser ${isRaiser}
        quorum ${minVotes}
        support ${minYes}
        votes 3
        `);
    });

    it("eligibility deposit,voting power 1 voter 1 vote, quorum, support percentage...", async () => {
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr5, this.gp2.address), "revert");

        let isRaiser = await this.dao5Contract.isMember(this.user1.address);

        console.log(`
        user1 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr25, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr25, proposalId);

        const depositBal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr25, this.owner.address);
        const depositBal2 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr25, this.genesis_raiser1.address);
        const depositBal3 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr25, this.genesis_raiser2.address);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr25, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr25, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr25, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr25);
        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        depositBal1 ${hre.ethers.utils.formatEther(depositBal1)}
        depositBal2 ${hre.ethers.utils.formatEther(depositBal2)}
        depositBal3 ${hre.ethers.utils.formatEther(depositBal3)}
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr25, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr25, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr25, proposalId, 1);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3)) * 60 / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr25, proposalId);
        isRaiser = await this.dao5Contract.isMember(this.user1.address);
        await this.vintageRaiserManagementContract.processProposal(this.daoAddr25, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr25, proposalId);
        console.log(`
        processed...
        vote result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        proposal ${proposalId} state ${proposalInfo.state}
        investor2 is Raiser ${isRaiser}
        quorum ${minVotes}
        support ${minYes}
        votes 3
        `);
    });

    it("eligibility erc20, voting power  1 voter 1 vote, quorum, support integer...", async () => {
        let tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        user1 test erc20token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr6, this.user1.address), "revert");

        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("100"));
        await this.testtoken1.transfer(this.genesis_raiser1.address, hre.ethers.utils.parseEther("100"));
        await this.testtoken1.transfer(this.genesis_raiser2.address, hre.ethers.utils.parseEther("100"));
        let isRaiser = await this.dao1Contract.isMember(this.user1.address);

        tt1user1Bal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        user1 test token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        user2 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr26, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr26, proposalId);

        const erc20Bal1 = await this.testtoken1.balanceOf(this.owner.address);
        const erc20Bal2 = await this.testtoken1.balanceOf(this.genesis_raiser1.address);
        const erc20Bal3 = await this.testtoken1.balanceOf(this.genesis_raiser2.address);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr26, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr26, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr26, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr26);
        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        ${this.vintageVotingAdapterContract.address}
        erc20Bal1: ${hre.ethers.utils.formatEther(erc20Bal1)}
        erc20Bal2: ${hre.ethers.utils.formatEther(erc20Bal2)}
        erc20Bal3: ${hre.ethers.utils.formatEther(erc20Bal3)}
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr26, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr26, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr26, proposalId, 1);

        const allVoteWeight = parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3);
        const yesnb = parseInt(votingWeight2) + parseInt(votingWeight3) - parseInt(votingWeight1);

        console.log(`
        allVoteWeight ${allVoteWeight}
        yesnb ${yesnb}

        allVoteWeight - quorum ${allVoteWeight - 2}
        yesnb - support ${yesnb - 2}
        `);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (3 * 60) / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr26, proposalId);
        isRaiser = await this.dao1Contract.isMember(this.user1.address);
        await this.vintageRaiserManagementContract.processProposal(this.daoAddr26, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr26, proposalId);
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

    it("eligibility erc721, voting power 1 voter 1 vote, quorum, support integer...", async () => {
        let tt1user1Bal = await this.testERC721.balanceOf(this.funding_proposer2_whitelist.address);
        console.log(`
        funding_proposer2_whitelist test erc721token bal ${tt1user1Bal}
        `);
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr7, this.user2.address), "revert");

        // await this.testERC721.mintPixel(this.funding_proposer2_whitelist.address, 3, 0);
        // await this.testERC721.mintPixel(this.funding_proposer2_whitelist.address, 3, 1);

        // await this.testERC721.mintPixel(this.genesis_raiser1.address, 2, 0);
        // await this.testERC721.mintPixel(this.genesis_raiser1.address, 2, 1);

        // await this.testERC721.mintPixel(this.genesis_raiser2.address, 2, 2);
        // await this.testERC721.mintPixel(this.genesis_raiser2.address, 2, 3);

        let isRaiser = await this.dao2Contract.isMember(this.funding_proposer2_whitelist.address);

        tt1user1Bal = await this.testERC721.balanceOf(this.funding_proposer2_whitelist.address);
        console.log(`
        funding_proposer2_whitelist test token bal ${tt1user1Bal}
        funding_proposer2_whitelist is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr27, this.funding_proposer2_whitelist.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr27, proposalId);

        const erc721Bal1 = await this.testERC721.balanceOf(this.owner.address);
        const erc721Bal2 = await this.testERC721.balanceOf(this.genesis_raiser1.address);
        const erc721Bal3 = await this.testERC721.balanceOf(this.genesis_raiser2.address);


        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr27, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr27, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr27, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr27);

        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        ${this.vintageVotingAdapterContract.address}
        erc721Bal1: ${erc721Bal1}
        erc721Bal2: ${erc721Bal2}
        erc721Bal3: ${erc721Bal3}
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr27, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr27, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr27, proposalId, 1);

        const allVoteWeight = parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3);
        const yesnb = parseInt(votingWeight2) + parseInt(votingWeight3) - parseInt(votingWeight1);

        console.log(`
        allVoteWeight ${allVoteWeight}
        yesnb ${yesnb}

        allVoteWeight - quorum ${allVoteWeight - 2}
        yesnb - support ${yesnb - 2}
        `);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (3 * 60) / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr27, proposalId);

        await this.vintageRaiserManagementContract.processProposal(this.daoAddr27, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr27, proposalId);
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

    it("eligibility erc1155, voting power 1 voter 1 vote, quorum, support integer...", async () => {
        let tt1user1Bal = await this.testERC1155.balanceOf(this.user1.address, 1);

        console.log(`
        investor1 test testERC1155 bal ${tt1user1Bal}
        `);
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr8, this.investor1.address), "revert");

        // await this.testERC1155.mint(this.investor1.address, 1, 2, hexToBytes(toHex(2233)));
        // await this.testERC1155.mint(this.genesis_raiser1.address, 1, 2, hexToBytes(toHex(2233)));
        // await this.testERC1155.mint(this.genesis_raiser2.address, 1, 2, hexToBytes(toHex(2233)));
        // await this.testERC1155.mint(this.owner.address, 1, 2, hexToBytes(toHex(2233)));

        let isRaiser = await this.dao3Contract.isMember(this.user1.address);

        tt1user1Bal = await this.testERC1155.balanceOf(this.user1.address, 1);
        console.log(`
        investor1 is Raiser ${isRaiser}
        investor1 test token bal ${tt1user1Bal}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr28, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr28, proposalId);

        const erc1155Bal1 = await this.testERC1155.balanceOf(this.owner.address, 1);
        const erc1155Bal2 = await this.testERC1155.balanceOf(this.genesis_raiser1.address, 1);
        const erc1155Bal3 = await this.testERC1155.balanceOf(this.genesis_raiser2.address, 1);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr28, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr28, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr28, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr28);

        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        erc1155Bal1: ${erc1155Bal1}
        erc1155Bal2: ${erc1155Bal2}
        erc1155Bal3: ${erc1155Bal3}
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr28, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr28, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr28, proposalId, 1);

        const allVoteWeight = parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3);
        const yesnb = parseInt(votingWeight2) + parseInt(votingWeight3) - parseInt(votingWeight1);

        console.log(`
        allVoteWeight ${allVoteWeight}
        yesnb ${yesnb}

        allVoteWeight - quorum ${allVoteWeight - 2}
        yesnb - support ${yesnb - 2}
        `);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const minVotes = (allWeights * 66) / 100;
        const minYes = (3 * 60) / 100;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr28, proposalId);

        await this.vintageRaiserManagementContract.processProposal(this.daoAddr28, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr28, proposalId);
        isRaiser = await this.dao3Contract.isMember(this.user1.address);

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

    it("eligibility allocation, voting power 1 voter 1 vote, quorum, support integer...", async () => {
        let tt1user1Bal = await this.testtoken1.balanceOf(this.investor2.address);
        console.log(`
        investor2 test erc20token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        `);
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr9, this.investor2.address), "revert");

        await this.testtoken1.transfer(this.investor2.address, hre.ethers.utils.parseEther("100"));
        await this.testtoken1.transfer(this.genesis_raiser1.address, hre.ethers.utils.parseEther("100"));
        await this.testtoken1.transfer(this.genesis_raiser2.address, hre.ethers.utils.parseEther("100"));
        let isRaiser = await this.dao4Contract.isMember(this.investor2.address);

        tt1user1Bal = await this.testtoken1.balanceOf(this.investor2.address);
        console.log(`
        investor2 test token bal ${hre.ethers.utils.formatEther(tt1user1Bal)}
        investor2 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr29, this.investor2.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr29, proposalId);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr29, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr29, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr29, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr29);
        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        ${this.vintageVotingAdapterContract.address}
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr29, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr29, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr29, proposalId, 1);

        const allVoteWeight = parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3);
        const yesnb = parseInt(votingWeight2) + parseInt(votingWeight3) - parseInt(votingWeight1);

        console.log(`
        allVoteWeight ${allVoteWeight}
        yesnb ${yesnb}

        allVoteWeight - quorum ${allVoteWeight - 2}
        yesnb - support ${yesnb - 2}
        `);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const quorum = 2;
        const support = 2;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr29, proposalId);
        isRaiser = await this.dao4Contract.isMember(this.investor2.address);
        await this.vintageRaiserManagementContract.processProposal(this.daoAddr29, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr29, proposalId);
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

    it("eligibility deposit,voting power 1 voter 1 vote, quorum, support integer...", async () => {
        // await expectRevert(this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr30, this.gp2.address), "revert");

        let isRaiser = await this.dao5Contract.isMember(this.user1.address);

        console.log(`
        gp1 is Raiser ${isRaiser}
        `);
        const tx = await this.vintageRaiserManagementContract.submitGovernorInProposal(this.daoAddr30, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr30, proposalId);

        const depositBal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr30, this.owner.address);
        const depositBal2 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr30, this.genesis_raiser1.address);
        const depositBal3 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr30, this.genesis_raiser2.address);

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr30, this.owner.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr30, this.genesis_raiser1.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr30, this.genesis_raiser2.address);
        const allWeights = await this.vintageVotingAdapterContract.getAllGovernorWeight(this.daoAddr30);
        let allWeightsByProposalId = await this.vintageVotingAdapterContract.getAllGovernorWeightByProposalId(this.daoAddr30, proposalId);
        console.log(`
        proposal ${proposalId} state ${proposalInfo.state}
        start voting...
        depositBal1 ${hre.ethers.utils.formatEther(depositBal1)}
        depositBal2 ${hre.ethers.utils.formatEther(depositBal2)}
        depositBal3 ${hre.ethers.utils.formatEther(depositBal3)}

        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        allWeights ${allWeights}
        allWeightsByProposalId ${allWeightsByProposalId}
        `);

        await this.vintageVotingAdapterContract.connect(this.owner).submitVote(this.daoAddr30, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr30, proposalId, 2);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr30, proposalId, 1);

        const allVoteWeight = parseInt(votingWeight1) + parseInt(votingWeight2) + parseInt(votingWeight3);
        const yesnb = parseInt(votingWeight1) + parseInt(votingWeight3) - parseInt(votingWeight2);
        allWeightsByProposalId = await this.vintageVotingAdapterContract.getAllGovernorWeightByProposalId(this.daoAddr30, proposalId);

        console.log(`
        allVoteWeight ${allVoteWeight}
        allWeightsByProposalId ${allWeightsByProposalId}

        yesnb ${yesnb}

        allVoteWeight - quorum ${allVoteWeight - 2}
        yesnb - support ${yesnb - 2}
        `);

        const blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const quorum = 2;
        const support = 2;
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr30, proposalId);
        isRaiser = await this.dao5Contract.isMember(this.user1.address);
        await this.vintageRaiserManagementContract.processProposal(this.daoAddr30, proposalId);
        proposalInfo = await this.vintageRaiserManagementContract.proposals(this.daoAddr30, proposalId);
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

describe("fund term...", () => {
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

        this.flexFundingPoolExtension = extensions.flexFundingPoolExt.functions;

        this.vintageRaiserManagementContract = adapters.vintageRaiserManagementContract.instance;
        this.vintageFundRaiseAdapterContract = adapters.vintageFundRaiseAdapter.instance;
        this.vintageFundingPoolAdapterContract = adapters.vintageFundingPoolAdapterContract.instance;
        this.vintageVotingAdapterContract = adapters.vintageVotingContract.instance;
        this.vintageFundingAdapterContract = adapters.vintageFundingAdapterContract.instance;
        this.vintageVesting = adapters.vintageVesting.instance;
        this.vintageAllocationAdapterContract = adapters.vintageAllocationAdapterContract.instance;
        this.vintageDistributeAdatperContract = adapters.vintageDistributeAdatperContract.instance;
        this.vintageEscrowFundAdapterContract = adapters.vintageEscrowFundAdapterContract.instance;
        this.vintageRaiserAllocationAdapterContract = adapters.vintageRaiserAllocationAdapter.instance;
        this.vintageFundingReturnTokenAdapterContract = adapters.vintageFundingReturnTokenAdapterContract.instance;
        this.vintageFreeInEscrowFundAdapterContract = adapters.vintageFreeInEscrowFundAdapterContract.instance;
        this.vintageFundingPoolAdapterHelperContract = adapters.vintageFundingPoolAdapterHelperContract.instance;
        this.vintageDaoSetAdapterContract = adapters.vintageDaoSetAdapterContract.instance;
        this.vintageDaoSetHelperAdapterContract = adapters.vintageDaoSetHelperAdapterContract.instance;

        this.testtoken1 = testContracts.testToken1.instance;
        this.testtoken2 = testContracts.testRiceToken.instance;
        this.flexVesting = adapters.flexVesting.instance;
        this.flexERC721 = adapters.flexERC721.instance;
        this.flexAllocationAdapterContract = adapters.flexAllocationAdapterContract.instance;
        this.flexFundingPoolAdapterContract = adapters.flexFundingPoolAdapterContract.instance;
        this.flexVotingContract = adapters.flexVotingContract.instance;
        this.flexFundingAdapterContract = adapters.flexFundingAdapterContract.instance;
        this.bentoBoxV1 = adapters.bentoBoxV1.instance;
        // this.managing = this.adapters.managing.instance;
        this.flexPollingVotingContract = adapters.flexPollingVotingContract.instance;
        this.summonDao = this.adapters.summonVintageDao.instance;
        this.summonVintageDao = this.adapters.summonVintageDao.instance;

        const ERC721 = await hre.ethers.getContractFactory("PixelNFT");
        const erc721 = await ERC721.deploy(4);
        await erc721.deployed();
        this.testERC721 = erc721;

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

        const vintageDaoBackerMembershipInfo = [
            1, // bool enable;
            "vintageDaoBackerMembershipInfo",
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

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

        const vintageDaoVotingInfo1 = [
            0, //eligibilityType 0. raiser membership type 1.deposit 2.raiser allocation
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
            vintageDaoGenesisRaisers,
            allocations
        ];

        let obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams1);
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

    const createFundRaiseProposal = async (vintageFundRaiseAdapterContract, params) => {
        const tx = await vintageFundRaiseAdapterContract.submitProposal(params);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        return proposalId;
    }

    it("redemption...", async () => {
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr1);
        const vintageFundingAdapterContract = this.vintageFundingAdapterContract;
        const vintageVesting = this.vintageVesting;
        const vintageFundingPoolAdapterContract = this.vintageFundingPoolAdapterContract;
        const vintageFundingPoolAdapterHelperContract = this.vintageFundingPoolAdapterHelperContract;
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

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.001");
        const proposalFeeInfo = [
            managementFeeRatio,
            returnTokenmanagementFeeRatio,
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
        const enalbePriorityDeposit = true;
        const vtype = 1; // 0 erc20 1 erc721 2 erc1155 3 whitelist
        const token = this.testERC721.address;
        const tokenId = 0;
        const amount = 2;
        const priorityDepositeWhitelist = [];
        const proposalPriorityDepositInfo = [
            enalbePriorityDeposit,
            vtype,
            token,
            tokenId,
            amount,
            priorityDepositeWhitelist
        ];

        const fundRaiseParams = [
            this.daoAddr1,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
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
        //withdraw
        // await expectRevert(vintageFundingPoolAdapterContract.withdraw(this.daoAddr1, hre.ethers.utils.parseEther("1000")), "revert");
        await vintageFundingPoolAdapterContract.withdraw(this.daoAddr1, hre.ethers.utils.parseEther("1000"));

        let bal = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        let bal1 = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);

        console.log(`
        deposited ${hre.ethers.utils.formatEther(bal)}
        deposited ${hre.ethers.utils.formatEther(bal1)}
        process fund raise...
        `);

        await vintageFundingPoolAdapterContract.processFundRaise(this.daoAddr1);
        fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, fundRaiserProposalId);
        console.log(`
        processed...
        state ${fundRaiseProposalInfo.state}
        `);

        const fundStartTime = await vintageFundingPoolAdapterHelperContract.getFundStartTime(this.daoAddr1);
        const fundEndTime = await vintageFundingPoolAdapterHelperContract.getFundEndTime(this.daoAddr1);
        const redemptionEndTime = parseInt(fundStartTime) + parseInt(redemptInterval);
        const redemptionStartTime = parseInt(redemptionEndTime) - parseInt(redemptPeriod);
        const GPAddr = await dao.getAddressConfiguration(sha3("GP_ADDRESS"));


        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(redemptionStartTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(redemptionStartTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const isRedempt = await vintageFundingPoolAdapterContract.ifInRedemptionPeriod(this.daoAddr1, blocktimestamp);
        console.log(`
        fundStartTime ${fundStartTime}
        fundEndTime ${fundEndTime}
        redemptionStartTime ${redemptionStartTime}
        redemptionEndTime ${redemptionEndTime}
        blocktimestamp ${blocktimestamp}
        isRedempt ${isRedempt}
        `);

        const tx = await vintageFundingPoolAdapterContract.connect(this.investor1).withdraw(this.daoAddr1, hre.ethers.utils.parseEther("1000"));
        const txRecipient = await tx.wait();
        console.log("events args ", txRecipient.events[3].args);
        console.log("events eventSignature ", txRecipient.events[3].eventSignature);

        bal1 = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);
        let USDTBal = await this.testtoken1.balanceOf(this.investor1.address);
        let USDTBal2 = await this.testtoken1.balanceOf(GPAddr);
        console.log(`
        withdrawed...
        bal1 ${hre.ethers.utils.formatEther(bal1)}
        USDTBal ${hre.ethers.utils.formatEther(USDTBal)}
        managementFee ${hre.ethers.utils.formatEther(USDTBal2)}
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

        const {
            dao,
            factories,
            adapters,
            extensions,
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

        this.testtoken1 = testContracts.testToken1.instance;
        this.testtoken2 = testContracts.testRiceToken.instance;
        this.flexVesting = adapters.flexVesting.instance;
        this.flexERC721 = adapters.flexERC721.instance;
        this.flexAllocationAdapterContract = adapters.flexAllocationAdapterContract.instance;
        this.flexFundingPoolAdapterContract = adapters.flexFundingPoolAdapterContract.instance;
        this.flexVotingContract = adapters.flexVotingContract.instance;
        this.flexFundingAdapterContract = adapters.flexFundingAdapterContract.instance;
        this.bentoBoxV1 = adapters.bentoBoxV1.instance;
        // this.managing = this.adapters.managing.instance;
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

        const vintageDaoBackerMembershipInfo = [
            1, // bool enable;
            "vintageDaoBackerMembershipInfo",
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

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

        const ERC721 = await hre.ethers.getContractFactory("PixelNFT");
        const erc721 = await ERC721.deploy(4);
        await erc721.deployed();
        this.testERC721 = erc721;
        const vintageDaoRaiserMembershipInfo2 = [
            1, // bool enable;
            "vintageDaoRaiserMembershipInfo1",
            1, // uint256 varifyType;erc721
            1, // uint256 minHolding;
            erc721.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const ERC1155 = await hre.ethers.getContractFactory("ERC1155TestToken");
        const erc1155 = await ERC1155.deploy("this is test uri");
        await erc1155.deployed();
        this.testERC1155 = erc1155;
        const vintageDaoRaiserMembershipInfo3 = [
            1, // bool enable;
            "vintageDaoRaiserMembershipInfo1",
            2, // uint256 varifyType;erc1155
            2, // uint256 minHolding;
            erc1155.address, // address tokenAddress;
            1, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];
        //whitelist
        const vintageDaoRaiserMembershipInfo4 = [
            1, // bool enable;
            "vintageDaoRaiserMembershipInfo1",
            3, // uint256 varifyType;whitelist
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [this.gp1.address] // address[] whiteList;
        ];
        //deposit
        const vintageDaoRaiserMembershipInfo5 = [
            1, // bool enable;
            4, // uint256 varifyType;deposit
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const vintageDaoVotingInfo1 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
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

        const vintageDaoVotingInfo2 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            1, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            1, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            1, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            2, // uint256 support;
            2, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo3 = [
            4, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo4 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo5 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoGenesisRaisers = [this.genesis_raiser1.address, this.genesis_raiser2.address];
        const allocations = [100, 100, 100];

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
            vintageDaoGenesisRaisers,
            allocations
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
            vintageDaoGenesisRaisers,
            allocations
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
            vintageDaoGenesisRaisers,
            allocations
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
            vintageDaoGenesisRaisers,
            allocations
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
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams6 = [
            _daoName6,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo,
            vintageDaoRaiserMembershipInfo4,
            vintageDaoVotingInfo3,
            vintageDaoGenesisRaisers,
            allocations
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

        obj = await sommonVintageDao(this.summonDao, this.daoFactory, vintageDaoParams6);
        console.log("summon vintage dao6 succeed...", obj.daoAddr);
        this.daoAddr6 = obj.daoAddr;
        const dao6Contract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr6);
        this.dao6Contract = dao6Contract;
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

        const proposalTimeInfo2 = [
            startTime,
            endTime,
            fundTerm,
            redemptPeriod,
            redemptInterval,
            returnPeriod
        ];
        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            returnTokenmanagementFeeRatio,
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
        const enalbePriorityDeposit = true;
        const vtype = 1; // 0 erc20 1 erc721 2 erc1155 3 whitelist
        const token = this.testERC721.address;
        const tokenId = 0;
        const amount = 2;
        const priorityDepositeWhitelist = [];
        const proposalPriorityDepositInfo = [
            enalbePriorityDeposit,
            vtype,
            token,
            tokenId,
            amount,
            priorityDepositeWhitelist
        ];


        const fundRaiseParams = [
            this.daoAddr1,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ],

        const fundRaiseParams2 = [
            this.daoAddr6,
            proposalFundRaiseInfo,
            proposalTimeInfo2,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ];


        const fundRaiserProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams);
        const fundRaiserProposalId2 = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams2);

        console.log(`
        fund raise proposal created ${fundRaiserProposalId}
        vote for proposal...
        `);

        await vintageVotingAdapterContract.submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await vintageVotingAdapterContract.submitVote(this.daoAddr6, fundRaiserProposalId2, 1);
        await vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr6, fundRaiserProposalId2, 1);

        let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, fundRaiserProposalId);
        let fundRaiseProposalInfo2 = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr6, fundRaiserProposalId2);

        const stopVoteTime = fundRaiseProposalInfo.stopVoteTime;
        const stopVoteTime2 = fundRaiseProposalInfo2.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        console.log(`
        voted. processing...
        `);
        await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr1, fundRaiserProposalId);
        await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr6, fundRaiserProposalId2);

        fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, fundRaiserProposalId);
        fundRaiseProposalInfo2 = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr6, fundRaiserProposalId2);

        console.log(`
        processed...
        state ${fundRaiseProposalInfo.state}
        state2 ${fundRaiseProposalInfo2.state}
        `);

        //deposit
        await this.testtoken1.approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.connect(this.investor1).approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("10000"));

        await vintageFundingPoolAdapterContract.deposit(this.daoAddr1, hre.ethers.utils.parseEther("10000"));
        await vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("10000"));

        let bal = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        let bal1 = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);

        let fundRound = await this.vintageFundRaiseAdapterContract.createdFundCounter(this.daoAddr1);
        let fundInvestors = await this.vintageFundingPoolAdapterContract.getFundInvestors(this.daoAddr1, fundRound);
        console.log(`
        deposited ${hre.ethers.utils.formatEther(bal)}
        deposited ${hre.ethers.utils.formatEther(bal1)}
        fundInvestors ${fundInvestors}
        process fund raise...
        `);

        await vintageFundingPoolAdapterContract.processFundRaise(this.daoAddr1);
        let fundRaiseState = await vintageFundingPoolAdapterContract.daoFundRaisingStates(this.daoAddr1);

        await this.testtoken1.approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.connect(this.investor1).approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("10000"));

        await vintageFundingPoolAdapterContract.deposit(this.daoAddr6, hre.ethers.utils.parseEther("10000"));
        await vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr6, hre.ethers.utils.parseEther("10000"));
        bal = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr6, this.owner.address);
        bal1 = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr6, this.investor1.address);
        let poolBal1 = await vintageFundingPoolAdapterContract.
            poolBalance(this.daoAddr1);
        let poolBal2 = await vintageFundingPoolAdapterContract.
            poolBalance(this.daoAddr6);
        let vp = await vintageVotingAdapterContract.getVotingWeight(this.daoAddr6, this.investor1.address);
        console.log(`
        deposited ${hre.ethers.utils.formatEther(bal)}
        deposited ${hre.ethers.utils.formatEther(bal1)}
        pool bal1 ${hre.ethers.utils.formatEther(poolBal1)}
        pool bal2 ${hre.ethers.utils.formatEther(poolBal2)}
        investor1 voting power ${vp}
        process fund raise...
        `);
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const fundRaiseEndTime2 = await this.vintageFundingPoolAdapterHelperContract.getFundRaiseWindowCloseTime(this.daoAddr6);

        if (parseInt(fundRaiseEndTime2) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseEndTime2) + 60])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        await vintageFundingPoolAdapterContract.processFundRaise(this.daoAddr6);
        fundRaiseState = await vintageFundingPoolAdapterContract.daoFundRaisingStates(this.daoAddr6);
        console.log(`
        fund raise state ${fundRaiseState}
        `);
        // Submit funding proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("2000");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const vestingStartTime = blocktimestamp + 24;
        const vetingEndTime = vestingStartTime + 60 * 60 * 2;
        const vestingCliffEndTime = vestingStartTime + 60 * 60 * 1;
        const vestingInterval = 60 * 10;

        const vestingCliffLockAmount = hre.ethers.utils.parseEther("0.3");

        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = this.testtoken2.address;
        const GPAddr = await dao.getAddressConfiguration(sha3("GP_ADDRESS"));
        const DaoSquareAddr = await vintageFundingAdapterContract.protocolAddress();

        const fundRaiseEndTime = await this.vintageFundingPoolAdapterHelperContract.getFundRaiseWindowCloseTime(this.daoAddr1);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(fundRaiseEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseEndTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        await vintageFundingPoolAdapterContract.processFundRaise(this.daoAddr1);
        fundRaiseState = await vintageFundingPoolAdapterContract.daoFundRaisingStates(this.daoAddr1);
        expect(fundRaiseState, 2);
        vp = await vintageVotingAdapterContract.getVotingWeight(this.daoAddr6, this.investor1.address);
        console.log(`
        fund raise state ${fundRaiseState}
        investor1 voting power ${vp}
        `);

        const approver = this.owner.address;
        const escrow = true;
        const price = hre.ethers.utils.parseEther("0.3");
        const price2 = hre.ethers.utils.parseEther("0.8");
        const price3 = hre.ethers.utils.parseEther("1.8");
        const price4 = hre.ethers.utils.parseEther("2.8");
        const price5 = hre.ethers.utils.parseEther("3.8");

        const receiver = this.project_team1.address;
        console.log(`
        receiver ${receiver}
        approver ${approver}
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
            approver,
            false,
            ZERO_ADDRESS
        ];

        const returnTokenInfo2 = [
            escrow,
            projectTeamTokenAddr,
            price2,
            "0",
            approver,
            false,
            ZERO_ADDRESS
        ];
        const returnTokenInfo3 = [
            escrow,
            projectTeamTokenAddr,
            price3,
            "0",
            approver,
            false,
            ZERO_ADDRESS
        ];
        const returnTokenInfo4 = [
            escrow,
            projectTeamTokenAddr,
            price4,
            "0",
            approver,
            false,
            ZERO_ADDRESS
        ];
        const returnTokenInfo5 = [
            escrow,
            projectTeamTokenAddr,
            price5,
            "0",
            approver,
            false,
            ZERO_ADDRESS
        ];

        const vestingInfo = [
            "vesting name",
            "vesting description",
            vestingStartTime,
            vetingEndTime,
            vestingCliffEndTime,
            vestingCliffLockAmount,
            vestingInterval
        ]
        const params = [fundingInfo, returnTokenInfo, vestingInfo]
        const params2 = [fundingInfo, returnTokenInfo2, vestingInfo]
        const params3 = [fundingInfo, returnTokenInfo3, vestingInfo]
        const params4 = [fundingInfo, returnTokenInfo4, vestingInfo]
        const params5 = [fundingInfo, returnTokenInfo5, vestingInfo]

        const proposer = this.genesis_raiser1;

        let frontProposaId = await vintageFundingAdapterContract.getFrontProposalId(this.daoAddr1);
        let queueLength = await vintageFundingAdapterContract.getQueueLength(this.daoAddr1);
        console.log(`
        frontProposalId ${frontProposaId}
        queueLen ${queueLength}
        `);
        let proposalId = await createFundingProposal(
            vintageFundingAdapterContract,
            proposer,
            this.daoAddr1,
            params
        );
        let proposalId2 = await createFundingProposal(
            vintageFundingAdapterContract,
            proposer,
            this.daoAddr1,
            params2
        );
        let proposalId3 = await createFundingProposal(
            vintageFundingAdapterContract,
            proposer,
            this.daoAddr1,
            params3
        );
        let proposalId4 = await createFundingProposal(
            vintageFundingAdapterContract,
            proposer,
            this.daoAddr1,
            params4
        );
        let proposalId5 = await createFundingProposal(
            vintageFundingAdapterContract,
            proposer,
            this.daoAddr1,
            params5
        );

        console.log(`
        new funding proposalId: ${proposalId}
        new funding proposalId2: ${proposalId2}
        new funding proposalId3: ${proposalId3}
        new funding proposalId4: ${proposalId4}
        new funding proposalId5: ${proposalId5}

        `);
        this.proposalId = proposalId;
        frontProposaId = await vintageFundingAdapterContract.getFrontProposalId(this.daoAddr1);
        queueLength = await vintageFundingAdapterContract.getQueueLength(this.daoAddr1);
        console.log(`
        queueLength ${queueLength}
        frontProposaId ${frontProposaId}
        approve return token...
        start voting...
        `);

        await this.testtoken2.approve(this.vintageFundingReturnTokenAdapterContract.address, requestedFundAmount.mul(hre.ethers.utils.parseEther("1")).div(price));

        await this.vintageFundingReturnTokenAdapterContract.setFundingApprove(
            this.daoAddr1,
            proposalId,
            this.testtoken2.address,
            requestedFundAmount.mul(hre.ethers.utils.parseEther("1")).div(price)
        );
        let approvalAmount = await this.vintageFundingReturnTokenAdapterContract.approvedInfos(this.daoAddr1, proposalId, approver, this.testtoken2.address);
        let fundingProposalInfo = await vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId);
        let allowance = await this.testtoken2.allowance(this.owner.address, this.vintageFundingReturnTokenAdapterContract.address);
        console.log(`
            approver ${fundingProposalInfo.proposalPaybackTokenInfo.approveOwnerAddr}
            paybackTokenAmount: ${hre.ethers.utils.formatEther(fundingProposalInfo.proposalPaybackTokenInfo.paybackTokenAmount)}
            approvalAmount ${hre.ethers.utils.formatEther(approvalAmount)}
            allowance ${allowance}
            `);

        await vintageFundingAdapterContract.startVotingProcess(this.daoAddr1, proposalId);

        fundingProposalInfo = await vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId);

        console.log(`
        funding proposal state ${fundingProposalInfo.status}
        paybackTokenAmount: ${hre.ethers.utils.formatEther(fundingProposalInfo.proposalPaybackTokenInfo.paybackTokenAmount)}
        escrow ${fundingProposalInfo.proposalPaybackTokenInfo.escrow}
        totalFundAmount ${hre.ethers.utils.formatEther(fundingProposalInfo.totalAmount)}
        approver ${fundingProposalInfo.proposalPaybackTokenInfo.approveOwnerAddr}
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
        let receiverBal = await this.testtoken1.balanceOf(this.project_team1.address);
        console.log(`
        protocolAddressBal ${hre.ethers.utils.formatEther(protocolAddressBal)}
        gpAddressBal ${hre.ethers.utils.formatEther(gpAddressBal)}
        proposerBal ${hre.ethers.utils.formatEther(proposerBal)}
        receiverBal ${hre.ethers.utils.formatEther(receiverBal)}

        `)

        console.log(`
        process funding proposal...
        `);
        await vintageFundingAdapterContract.processProposal(this.daoAddr1, proposalId);

        console.log(`
        process funding proposal2...
        `);
        await this.testtoken2.approve(this.vintageFundingReturnTokenAdapterContract.address, requestedFundAmount.mul(hre.ethers.utils.parseEther("1")).div(price2));

        await this.vintageFundingReturnTokenAdapterContract.setFundingApprove(
            this.daoAddr1,
            proposalId2,
            this.testtoken2.address,
            requestedFundAmount.mul(hre.ethers.utils.parseEther("1")).div(price2)
        );

        await vintageFundingAdapterContract.startVotingProcess(this.daoAddr1, proposalId2);

        await vintageVotingAdapterContract.submitVote(this.daoAddr1, proposalId2, 1);
        fundingProposalInfo = await vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId2);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundingProposalInfo.proposalTimeInfo.proposalStopVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        console.log(`
        execute funding proposal2...
        `);
        await vintageFundingAdapterContract.processProposal(this.daoAddr1, proposalId2);

        console.log(`
        process funding proposal3...
        `);
        await this.testtoken2.approve(this.vintageFundingReturnTokenAdapterContract.address, requestedFundAmount.mul(hre.ethers.utils.parseEther("1")).div(price3));

        await this.vintageFundingReturnTokenAdapterContract.setFundingApprove(
            this.daoAddr1,
            proposalId3,
            this.testtoken2.address,
            requestedFundAmount.mul(hre.ethers.utils.parseEther("1")).div(price3)
        );

        await vintageFundingAdapterContract.startVotingProcess(this.daoAddr1, proposalId3);

        await vintageVotingAdapterContract.submitVote(this.daoAddr1, proposalId3, 1);
        fundingProposalInfo = await vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId3);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundingProposalInfo.proposalTimeInfo.proposalStopVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        console.log(`
        execute funding proposal2...
        `);
        await vintageFundingAdapterContract.processProposal(this.daoAddr1, proposalId3);


        console.log(`
        process funding proposal4...
        `);
        await this.testtoken2.approve(this.vintageFundingReturnTokenAdapterContract.address, requestedFundAmount.mul(hre.ethers.utils.parseEther("1")).div(price4));

        await this.vintageFundingReturnTokenAdapterContract.setFundingApprove(
            this.daoAddr1,
            proposalId4,
            this.testtoken2.address,
            requestedFundAmount.mul(hre.ethers.utils.parseEther("1")).div(price4)
        );

        await vintageFundingAdapterContract.startVotingProcess(this.daoAddr1, proposalId4);

        await vintageVotingAdapterContract.submitVote(this.daoAddr1, proposalId4, 1);
        fundingProposalInfo = await vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId4);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundingProposalInfo.proposalTimeInfo.proposalStopVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        console.log(`
        execute funding proposal4...
        `);
        await vintageFundingAdapterContract.processProposal(this.daoAddr1, proposalId4);



        console.log(`
        process funding proposal5...
        `);
        await this.testtoken2.approve(this.vintageFundingReturnTokenAdapterContract.address, requestedFundAmount.mul(hre.ethers.utils.parseEther("1")).div(price5));

        await this.vintageFundingReturnTokenAdapterContract.setFundingApprove(
            this.daoAddr1,
            proposalId5,
            this.testtoken2.address,
            requestedFundAmount.mul(hre.ethers.utils.parseEther("1")).div(price5)
        );


        await vintageFundingAdapterContract.startVotingProcess(this.daoAddr1, proposalId5);

        await vintageVotingAdapterContract.submitVote(this.daoAddr1, proposalId5, 1);
        fundingProposalInfo = await vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId5);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundingProposalInfo.proposalTimeInfo.proposalStopVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        console.log(`
        execute funding proposal5...
        `);
        await vintageFundingAdapterContract.processProposal(this.daoAddr1, proposalId5);


        protocolAddressBal = await this.testtoken1.balanceOf(DaoSquareAddr);
        gpAddressBal = await this.testtoken1.balanceOf(GPAddr);
        proposerBal = await this.testtoken1.balanceOf(proposer.address);
        receiverBal = await this.testtoken1.balanceOf(this.project_team1.address);

        fundingProposalInfo = await vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId);

        const vestingOwnerEligible = await vintageAllocationAdapterContract.ifEligible(this.daoAddr1, this.owner.address, proposalId);
        const vestinginvestor1Eligible = await vintageAllocationAdapterContract.ifEligible(this.daoAddr1, this.investor1.address, proposalId);


        console.log(`
        processed...
        funding proposal state ${fundingProposalInfo.status}
        protocolAddressBal ${hre.ethers.utils.formatEther(protocolAddressBal)}
        gpAddressBal ${hre.ethers.utils.formatEther(gpAddressBal)}
        proposerBal ${hre.ethers.utils.formatEther(proposerBal)}
        receiverBal ${hre.ethers.utils.formatEther(receiverBal)}
        all ${hre.ethers.utils.formatEther(toBN(protocolAddressBal).add(toBN(gpAddressBal)).add(toBN(proposerBal)).add(toBN(receiverBal)))}

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
        cliff shares ${hre.ethers.utils.formatEther(vestInfo.stepInfo.cliffShares.toString())}
        step shares ${hre.ethers.utils.formatEther(vestInfo.stepInfo.stepShares.toString())}
        steps ${vestInfo.stepInfo.steps}
        recipient of vest ${vestId}: ${vestInfo.vestInfo.recipient}
        claimable balance of vest ${vestId}: ${hre.ethers.utils.formatEther(claimableBal)}
        total ${parseFloat(hre.ethers.utils.formatEther(vestInfo.stepInfo.cliffShares.toString())) + parseFloat(hre.ethers.utils.formatEther(vestInfo.stepInfo.stepShares.toString())) * parseFloat(vestInfo.stepInfo.steps)}

        vest1 cliff shares ${hre.ethers.utils.formatEther(vestInfo1.stepInfo.cliffShares.toString())}
        step shares ${hre.ethers.utils.formatEther(vestInfo1.stepInfo.stepShares.toString())}
        steps ${vestInfo1.stepInfo.steps}
        recipient of vest ${vestId1}: ${vestInfo1.vestInfo.recipient}
        claimable balance of vest ${vestId1}: ${hre.ethers.utils.formatEther(claimableBal1)}
        total ${parseFloat(hre.ethers.utils.formatEther(vestInfo1.stepInfo.cliffShares.toString())) + parseFloat(hre.ethers.utils.formatEther(vestInfo1.stepInfo.stepShares.toString())) * parseFloat(vestInfo1.stepInfo.steps)}

        vest2 cliff shares ${hre.ethers.utils.formatEther(vestInfo2.stepInfo.cliffShares.toString())}
        step shares ${hre.ethers.utils.formatEther(vestInfo2.stepInfo.stepShares.toString())}
        steps ${vestInfo2.stepInfo.steps}
        recipient of vest ${vestId2}: ${vestInfo2.vestInfo.recipient}
        claimable balance of vest ${vestId2}: ${hre.ethers.utils.formatEther(claimableBal2)}
        total ${parseFloat(hre.ethers.utils.formatEther(vestInfo2.stepInfo.cliffShares.toString()))
            + parseFloat(hre.ethers.utils.formatEther(vestInfo2.stepInfo.stepShares.toString()))
            * parseFloat(vestInfo2.stepInfo.steps)}
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

        console.log(`
        create vesting for proposalId2...
        `);
        tx = await vintageVesting.connect(this.investor1).createVesting(dao.address, this.investor1.address, proposalId2);
        result = await tx.wait();
        vestId = result.events[result.events.length - 1].args.vestId;
        console.log(`
        created... vestId ${vestId}
        withdraw...
`);
        await vintageVesting.connect(this.investor1).withdraw(dao.address, vestId);

        console.log(`
        create vesting for proposalId3...
        `);
        tx = await vintageVesting.connect(this.investor1).createVesting(dao.address, this.investor1.address, proposalId3);
        result = await tx.wait();
        vestId = result.events[result.events.length - 1].args.vestId;
        console.log(`
        created... vestId ${vestId}
        withdraw...
        `);
        await vintageVesting.connect(this.investor1).withdraw(dao.address, vestId);

        console.log(`
        create vesting for proposalId4...
        `);
        tx = await vintageVesting.connect(this.investor1).createVesting(dao.address, this.investor1.address, proposalId4);
        result = await tx.wait();
        vestId = result.events[result.events.length - 1].args.vestId;
        console.log(`
        created... vestId ${vestId}
        withdraw...
`);
        await vintageVesting.connect(this.investor1).withdraw(dao.address, vestId);

        console.log(`
        create vesting for proposalId5...
        `);
        tx = await vintageVesting.connect(this.investor1).createVesting(dao.address, this.investor1.address, proposalId5);
        result = await tx.wait();
        vestId = result.events[result.events.length - 1].args.vestId;
        console.log(`
        created... vestId ${vestId}
        withdraw...
`);
        await vintageVesting.connect(this.investor1).withdraw(dao.address, vestId);



        const fundingInfo1 = [
            hre.ethers.utils.parseEther("30000"),
            this.testtoken1.address,
            receiver
        ]
        const params1 = [fundingInfo1, returnTokenInfo, vestingInfo]

        proposalId = await createFundingProposal(
            vintageFundingAdapterContract,
            proposer,
            this.daoAddr1,
            params1
        );
        await vintageFundingAdapterContract.startVotingProcess(this.daoAddr1, proposalId);
        fundingProposalInfo = await vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId);
        console.log(`
        funding proposal state ${fundingProposalInfo.status}
        `);
    });

    it("clear fund...", async () => {
        const vintageFundingPoolAdapterContract = this.vintageFundingPoolAdapterContract;
        const vintageVotingAdapterContract = this.vintageVotingAdapterContract;
        const vintageEscrowFundAdapterContract = this.vintageEscrowFundAdapterContract;
        const vintageFundRaiseAdapterContract = this.vintageFundRaiseAdapterContract;

        const fundEndTime = await this.vintageFundingPoolAdapterHelperContract.getFundEndTime(this.daoAddr1);
        const fundReturnDuration = await this.vintageFundingPoolAdapterHelperContract.getFundReturnDuration(this.daoAddr1);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(fundEndTime + fundReturnDuration) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundEndTime + fundReturnDuration) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

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
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

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

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            returnTokenmanagementFeeRatio,
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
        const enalbePriorityDeposit = true;
        const vtype = 1; // 0 erc20 1 erc721 2 erc1155 3 whitelist
        const token = this.testERC721.address;
        const tokenId = 0;
        const amount = 2;
        const priorityDepositeWhitelist = [];
        const proposalPriorityDepositInfo = [
            enalbePriorityDeposit,
            vtype,
            token,
            tokenId,
            amount,
            priorityDepositeWhitelist
        ];

        const fundRaiseParams = [
            this.daoAddr1,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ];

        await expectRevert(createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams), "revert");

        let allFund = await vintageFundingPoolAdapterContract.poolBalance(this.daoAddr1);
        let bal = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        let bal1 = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);
        let escrowFundContractBal = await this.testtoken1.balanceOf(this.vintageEscrowFundAdapterContract.address);

        console.log(`
        allFund ${hre.ethers.utils.formatEther(allFund)}
        bal ${hre.ethers.utils.formatEther(bal)}
        bal1 ${hre.ethers.utils.formatEther(bal1)}
        escrowFundContractBal ${hre.ethers.utils.formatEther(escrowFundContractBal)}
        clear fund...
        `);

        await vintageFundingPoolAdapterContract.processFundRaise(this.daoAddr6);

        await vintageFundingPoolAdapterContract.clearFund(this.daoAddr1);

        let vp = await vintageVotingAdapterContract.getVotingWeight(this.daoAddr6, this.owner.address)
        console.log(`
        voting power  ${vp}
        `);
        await vintageFundingPoolAdapterContract.clearFund(this.daoAddr6);
        vp = await vintageVotingAdapterContract.getVotingWeight(this.daoAddr6, this.owner.address)

        console.log(`
        clear fund finished...
        voting power after clear fund ${vp}
        `)
        let fundRoundCounter = await vintageFundRaiseAdapterContract.createdFundCounter(this.daoAddr1);
        bal = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        bal1 = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);
        allFund = await vintageFundingPoolAdapterContract.poolBalance(this.daoAddr1);
        escrowFundContractBal = await this.testtoken1.balanceOf(this.vintageEscrowFundAdapterContract.address);
        let escrowBal1 = await this.vintageEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, fundRoundCounter, this.owner.address);
        let escrowBal2 = await this.vintageEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, fundRoundCounter, this.investor1.address);
        console.log(`
        allFund ${hre.ethers.utils.formatEther(allFund)}
        bal ${hre.ethers.utils.formatEther(bal)}
        bal1 ${hre.ethers.utils.formatEther(bal1)}
        escrowFundContractBal ${hre.ethers.utils.formatEther(escrowFundContractBal)}
        escrowBal1 ${hre.ethers.utils.formatEther(escrowBal1[1])}
        escrowBal2 ${hre.ethers.utils.formatEther(escrowBal2[1])}
        testtoken bal1 ${hre.ethers.utils.formatEther(await this.testtoken1.balanceOf(this.owner.address))}
        testtoken bal2 ${hre.ethers.utils.formatEther(await this.testtoken1.balanceOf(this.investor1.address))}
        withdraw...
        `);

        await this.vintageEscrowFundAdapterContract.withdraw(this.daoAddr1, fundRoundCounter);
        await this.vintageEscrowFundAdapterContract.connect(this.investor1).withdraw(this.daoAddr1, fundRoundCounter);
        await expectRevert(this.vintageEscrowFundAdapterContract.connect(this.investor2).withdraw(this.daoAddr1, fundRoundCounter), "revert");
        escrowFundContractBal = await this.testtoken1.balanceOf(this.vintageEscrowFundAdapterContract.address);
        escrowBal1 = await this.vintageEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, fundRoundCounter, this.owner.address);
        escrowBal2 = await this.vintageEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, fundRoundCounter, this.investor1.address);
        console.log(`
        escrowFundContractBal ${hre.ethers.utils.formatEther(escrowFundContractBal)}
        escrowBal1 ${hre.ethers.utils.formatEther(escrowBal1[1])}
        escrowBal2 ${hre.ethers.utils.formatEther(escrowBal2[1])}
        testtoken bal1 ${hre.ethers.utils.formatEther(await this.testtoken1.balanceOf(this.owner.address))}
        testtoken bal2 ${hre.ethers.utils.formatEther(await this.testtoken1.balanceOf(this.investor1.address))}
        create new fund...
        `);

        const newFundProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams);

        console.log(`
        newFundProposalId ${newFundProposalId}
        `);

        await vintageVotingAdapterContract.submitVote(this.daoAddr1, newFundProposalId, 1);
        let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, newFundProposalId);
        const stopVoteTime = fundRaiseProposalInfo.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr1, newFundProposalId);


        //deposit
        await this.testtoken1.approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.connect(this.investor1).approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("10000"));

        await vintageFundingPoolAdapterContract.deposit(this.daoAddr1, hre.ethers.utils.parseEther("1000"));
        await vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("1000"));

        bal = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        bal1 = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);

        console.log(`
              deposited ${hre.ethers.utils.formatEther(bal)}
              deposited ${hre.ethers.utils.formatEther(bal1)}
      
              process fund raise...
              `);


        const fundRaiseEndTime = await this.vintageFundingPoolAdapterHelperContract.getFundRaiseWindowCloseTime(this.daoAddr1);
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(fundRaiseEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseEndTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        await vintageFundingPoolAdapterContract.processFundRaise(this.daoAddr1);

        const fundRaiseState = await vintageFundingPoolAdapterContract.daoFundRaisingStates(this.daoAddr1);
        console.log(`
        fundRaiseState ${fundRaiseState}
        `);

        await expectRevert(vintageFundingPoolAdapterContract.clearFund(this.daoAddr1), "revert");

        if (parseInt(fundRaiseEndTime) + returnPeriod > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseEndTime) + returnPeriod + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        console.log(`
        clear fund...
        `);
        await vintageFundingPoolAdapterContract.clearFund(this.daoAddr1);

        console.log(`
        clear fund finished...
        `);
    });

});

describe("investor membership...", () => {
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

        const {
            dao,
            factories,
            adapters,
            extensions,
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

        this.testtoken1 = testContracts.testToken1.instance;
        this.testtoken2 = testContracts.testRiceToken.instance;
        this.flexVesting = adapters.flexVesting.instance;
        this.flexERC721 = adapters.flexERC721.instance;
        this.flexAllocationAdapterContract = adapters.flexAllocationAdapterContract.instance;
        this.flexFundingPoolAdapterContract = adapters.flexFundingPoolAdapterContract.instance;
        this.flexVotingContract = adapters.flexVotingContract.instance;
        this.flexFundingAdapterContract = adapters.flexFundingAdapterContract.instance;
        this.bentoBoxV1 = adapters.bentoBoxV1.instance;
        // this.managing = this.adapters.managing.instance;
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
        const vintageDaoBackerMembershipInfo2 = [
            1, // bool enable;
            "vintageDaoBackerMembershipInfo1",
            1, // uint256 varifyType; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS
            2, // uint256 minHolding;
            this.testERC721.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];


        const vintageDaoBackerMembershipInfo3 = [
            1, // bool enable;
            "vintageDaoBackerMembershipInfo1",
            2, // uint256 varifyType; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS
            2, // uint256 minHolding;
            this.testERC1155.address, // address tokenAddress;
            1, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];


        const vintageDaoBackerMembershipInfo4 = [
            1, // bool enable;
            "vintageDaoBackerMembershipInfo1",
            3, // uint256 varifyType; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS
            hre.ethers.utils.parseEther("0"), // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0, // uint256 tokenId;
            [this.owner.address, this.investor1.address, this.investor2.address] // address[] whiteList;
        ];

        const vintageDaoBackerMembershipInfo5 = [
            0, // bool enable;
            "vintageDaoBackerMembershipInfo1",
            3, // uint256 varifyType; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS
            hre.ethers.utils.parseEther("0"), // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];


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


        const vintageDaoRaiserMembershipInfo2 = [
            1, // bool enable;
            "vintageDaoRaiserMembershipInfo1",
            1, // uint256 varifyType;erc721
            1, // uint256 minHolding;
            erc721.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];


        const vintageDaoRaiserMembershipInfo3 = [
            1, // bool enable;
            "vintageDaoRaiserMembershipInfo1",
            2, // uint256 varifyType;erc1155
            2, // uint256 minHolding;
            erc1155.address, // address tokenAddress;
            1, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];
        //whitelist
        const vintageDaoRaiserMembershipInfo4 = [
            1, // bool enable;
            "vintageDaoRaiserMembershipInfo1",
            3, // uint256 varifyType;whitelist
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [this.gp1.address] // address[] whiteList;
        ];
        //deposit
        const vintageDaoRaiserMembershipInfo5 = [
            1, // bool enable;
            "vintageDaoRaiserMembershipInfo1",
            4, // uint256 varifyType;deposit
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const vintageDaoVotingInfo1 = [
            0, //eligibilityType 0. raiser membership type 1.deposit 2.raiser allocation
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

        const vintageDaoVotingInfo2 = [
            0, //eligibilityType 0. raiser membership type 1.deposit 2.raiser allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            1, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            1, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            1, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            2, // uint256 support;
            2, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo3 = [
            0, //eligibilityType 0. raiser membership type 1.deposit 2.raiser allocation
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

        const vintageDaoVotingInfo4 = [
            0, //eligibilityType 0. raiser membership type 1.deposit 2.raiser allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo5 = [
            0, //eligibilityType 0. raiser membership type 1.deposit 2.raiser allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        const vintageDaoGenesisRaisers = [this.genesis_raiser1.address, this.genesis_raiser2.address];
        const allocations = [100, 100, 100];
        const vintageDaoParams1 = [
            _daoName1,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo1,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams2 = [
            _daoName2,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo2,
            vintageDaoRaiserMembershipInfo2,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams3 = [
            _daoName3,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo3,
            vintageDaoRaiserMembershipInfo3,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams4 = [
            _daoName4,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo4,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo2,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams5 = [
            _daoName5,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo5,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo2,
            vintageDaoGenesisRaisers,
            allocations
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
        console.log("summon vintage dao4 succeed...", obj.daoAddr);
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

    const createFundRaiseProposal = async (vintageFundRaiseAdapterContract, params) => {
        const tx = await vintageFundRaiseAdapterContract.submitProposal(params);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        return proposalId;
    }


    it("investor membership enable - erc20...", async () => {
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

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            returnTokenmanagementFeeRatio,
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

        const enalbePriorityDeposit = true;
        const vtype = 1; // 0 erc20 1 erc721 2 erc1155 3 whitelist
        const token = this.testERC721.address;
        const tokenId = 0;
        const amount = 2;
        const priorityDepositeWhitelist = [];
        const proposalPriorityDepositInfo = [
            enalbePriorityDeposit,
            vtype,
            token,
            tokenId,
            amount,
            priorityDepositeWhitelist
        ];

        const fundRaiseParams = [
            this.daoAddr1,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
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
        await this.testtoken1.connect(this.investor2).approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.transfer(this.investor2.address, hre.ethers.utils.parseEther("99"));

        await vintageFundingPoolAdapterContract.deposit(this.daoAddr1, hre.ethers.utils.parseEther("10000"));
        await vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("10000"));
        await expectRevert(vintageFundingPoolAdapterContract.connect(this.investor2).deposit(this.daoAddr1, hre.ethers.utils.parseEther("99")), "revert");

        let bal = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        let bal1 = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);

        console.log(`
        deposit bal1 ${hre.ethers.utils.formatEther(bal)}
        deposit bal2 ${hre.ethers.utils.formatEther(bal1)}
        `);
    });

    it("investor membership enable - erc721...", async () => {
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr2);
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

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            returnTokenmanagementFeeRatio,
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

        const enalbePriorityDeposit = true;
        const vtype = 1; // 0 erc20 1 erc721 2 erc1155 3 whitelist
        const token = this.testERC721.address;
        const tokenId = 0;
        const amount = 2;
        const priorityDepositeWhitelist = [];
        const proposalPriorityDepositInfo = [
            enalbePriorityDeposit,
            vtype,
            token,
            tokenId,
            amount,
            priorityDepositeWhitelist
        ];

        const fundRaiseParams = [
            this.daoAddr2,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ],

        const fundRaiserProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams);
        console.log(`
        fund raise proposal created ${fundRaiserProposalId}
        vote for proposal...
        `);

        await vintageVotingAdapterContract.submitVote(this.daoAddr2, fundRaiserProposalId, 1);
        let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr2, fundRaiserProposalId);
        const stopVoteTime = fundRaiseProposalInfo.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        console.log(`
        voted. processing...
        `);
        await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr2, fundRaiserProposalId);
        fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr2, fundRaiserProposalId);
        console.log(`
        processed...
        state ${fundRaiseProposalInfo.state}
        `);

        //deposit

        await this.testtoken1.approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.connect(this.investor1).approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.connect(this.investor2).approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.transfer(this.investor2.address, hre.ethers.utils.parseEther("10000"));


        await expectRevert(vintageFundingPoolAdapterContract.connect(this.owner).deposit(this.daoAddr2, hre.ethers.utils.parseEther("10000")), "revert");
        await expectRevert(vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr2, hre.ethers.utils.parseEther("10000")), "revert");
        await expectRevert(vintageFundingPoolAdapterContract.connect(this.investor2).deposit(this.daoAddr2, hre.ethers.utils.parseEther("10000")), "revert");

        await this.testERC721.mintPixel(this.owner.address, 0, 0);
        await this.testERC721.mintPixel(this.owner.address, 0, 1);

        await this.testERC721.mintPixel(this.investor1.address, 0, 2);
        await this.testERC721.mintPixel(this.investor1.address, 0, 3);

        await this.testERC721.mintPixel(this.investor2.address, 1, 0);
        await this.testERC721.mintPixel(this.investor2.address, 1, 1);

        await vintageFundingPoolAdapterContract.deposit(this.daoAddr2, hre.ethers.utils.parseEther("10000"));
        await vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr2, hre.ethers.utils.parseEther("9000"));
        await vintageFundingPoolAdapterContract.connect(this.investor2).deposit(this.daoAddr2, hre.ethers.utils.parseEther("1000"));

        let bal = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr2, this.owner.address);
        let bal1 = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr2, this.investor1.address);
        let bal2 = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr2, this.investor2.address);

        console.log(`
        deposit bal1 ${hre.ethers.utils.formatEther(bal)}
        deposit bal2 ${hre.ethers.utils.formatEther(bal1)}
        deposit bal3 ${hre.ethers.utils.formatEther(bal2)}

        `);
    });

    it("investor membership enable - erc1155...", async () => {
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr3);
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

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            returnTokenmanagementFeeRatio,
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

        const enalbePriorityDeposit = true;
        const vtype = 1; // 0 erc20 1 erc721 2 erc1155 3 whitelist
        const token = this.testERC721.address;
        const tokenId = 0;
        const amount = 2;
        const priorityDepositeWhitelist = [];
        const proposalPriorityDepositInfo = [
            enalbePriorityDeposit,
            vtype,
            token,
            tokenId,
            amount,
            priorityDepositeWhitelist
        ];

        const fundRaiseParams = [
            this.daoAddr3,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ],

        const fundRaiserProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams);
        console.log(`
        fund raise proposal created ${fundRaiserProposalId}
        vote for proposal...
        `);

        await vintageVotingAdapterContract.submitVote(this.daoAddr3, fundRaiserProposalId, 1);
        let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr3, fundRaiserProposalId);
        const stopVoteTime = fundRaiseProposalInfo.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        console.log(`
        voted. processing...
        `);
        await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr3, fundRaiserProposalId);
        fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr3, fundRaiserProposalId);
        console.log(`
        processed...
        state ${fundRaiseProposalInfo.state}
        `);

        //deposit

        await this.testtoken1.approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.connect(this.investor1).approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.connect(this.investor2).approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.transfer(this.investor2.address, hre.ethers.utils.parseEther("10000"));


        await expectRevert(vintageFundingPoolAdapterContract.connect(this.owner).deposit(this.daoAddr3, hre.ethers.utils.parseEther("10000")), "revert");
        await expectRevert(vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr3, hre.ethers.utils.parseEther("10000")), "revert");
        await expectRevert(vintageFundingPoolAdapterContract.connect(this.investor2).deposit(this.daoAddr3, hre.ethers.utils.parseEther("10000")), "revert");

        await this.testERC1155.mint(this.owner.address, 1, 2, hexToBytes(toHex(2233)));


        await this.testERC1155.mint(this.investor1.address, 1, 2, hexToBytes(toHex(2233)));


        await this.testERC1155.mint(this.investor2.address, 1, 2, hexToBytes(toHex(2233)));


        await vintageFundingPoolAdapterContract.deposit(this.daoAddr3, hre.ethers.utils.parseEther("10000"));
        await vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr3, hre.ethers.utils.parseEther("9000"));
        await vintageFundingPoolAdapterContract.connect(this.investor2).deposit(this.daoAddr3, hre.ethers.utils.parseEther("1000"));

        let bal = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr3, this.owner.address);
        let bal1 = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr3, this.investor1.address);
        let bal2 = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr3, this.investor2.address);

        console.log(`
        deposit bal1 ${hre.ethers.utils.formatEther(bal)}
        deposit bal2 ${hre.ethers.utils.formatEther(bal1)}
        deposit bal3 ${hre.ethers.utils.formatEther(bal2)}

        `);
    });

    it("investor membership enable - whitelist...", async () => {
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr4);
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

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            returnTokenmanagementFeeRatio,
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

        const enalbePriorityDeposit = true;
        const vtype = 1; // 0 erc20 1 erc721 2 erc1155 3 whitelist
        const token = this.testERC721.address;
        const tokenId = 0;
        const amount = 2;
        const priorityDepositeWhitelist = [];
        const proposalPriorityDepositInfo = [
            enalbePriorityDeposit,
            vtype,
            token,
            tokenId,
            amount,
            priorityDepositeWhitelist
        ];

        const fundRaiseParams = [
            this.daoAddr4,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ],

        const fundRaiserProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams);
        console.log(`
        fund raise proposal created ${fundRaiserProposalId}
        vote for proposal...
        `);

        await vintageVotingAdapterContract.submitVote(this.daoAddr4, fundRaiserProposalId, 1);
        let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr4, fundRaiserProposalId);
        const stopVoteTime = fundRaiseProposalInfo.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        console.log(`
        voted. processing...
        `);
        await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr4, fundRaiserProposalId);
        fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr4, fundRaiserProposalId);
        console.log(`
        processed...
        state ${fundRaiseProposalInfo.state}
        `);

        //deposit
        await this.testtoken1.approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.connect(this.investor1).approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.connect(this.investor2).approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));

        await this.testtoken1.connect(this.user1).approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.connect(this.user2).approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.transfer(this.investor2.address, hre.ethers.utils.parseEther("10000"));

        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.transfer(this.user2.address, hre.ethers.utils.parseEther("10000"));

        await expectRevert(vintageFundingPoolAdapterContract.connect(this.user1).deposit(this.daoAddr4, hre.ethers.utils.parseEther("10000")), "revert");
        await expectRevert(vintageFundingPoolAdapterContract.connect(this.user2).deposit(this.daoAddr4, hre.ethers.utils.parseEther("10000")), "revert");

        const whitelists = await vintageFundingPoolAdapterContract.getInvestorMembershipWhiteList(this.daoAddr4);
        console.log(`
        investor whitelist ${whitelists}
        `);
        await vintageFundingPoolAdapterContract.deposit(this.daoAddr4, hre.ethers.utils.parseEther("10000"));
        await vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr4, hre.ethers.utils.parseEther("9000"));
        await vintageFundingPoolAdapterContract.connect(this.investor2).deposit(this.daoAddr4, hre.ethers.utils.parseEther("1000"));

        let bal = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr4, this.owner.address);
        let bal1 = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr4, this.investor1.address);
        let bal2 = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr4, this.investor2.address);

        console.log(`
        deposit bal1 ${hre.ethers.utils.formatEther(bal)}
        deposit bal2 ${hre.ethers.utils.formatEther(bal1)}
        deposit bal3 ${hre.ethers.utils.formatEther(bal2)}

        `);
    });


    it("investor membership disable...", async () => {
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr5);
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

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const rerturnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            rerturnTokenmanagementFeeRatio,
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

        const enalbePriorityDeposit = true;
        const vtype = 1; // 0 erc20 1 erc721 2 erc1155 3 whitelist
        const token = this.testERC721.address;
        const tokenId = 0;
        const amount = 2;
        const priorityDepositeWhitelist = [];
        const proposalPriorityDepositInfo = [
            enalbePriorityDeposit,
            vtype,
            token,
            tokenId,
            amount,
            priorityDepositeWhitelist
        ];

        const fundRaiseParams = [
            this.daoAddr5,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ],

        const fundRaiserProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams);
        console.log(`
        fund raise proposal created ${fundRaiserProposalId}
        vote for proposal...
        `);

        await vintageVotingAdapterContract.submitVote(this.daoAddr5, fundRaiserProposalId, 1);
        let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr5, fundRaiserProposalId);
        const stopVoteTime = fundRaiseProposalInfo.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        console.log(`
        voted. processing...
        `);
        await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr5, fundRaiserProposalId);
        fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr5, fundRaiserProposalId);
        console.log(`
        processed...
        state ${fundRaiseProposalInfo.state}
        `);

        //deposit
        await this.testtoken1.approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.connect(this.investor1).approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.connect(this.investor2).approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));

        await this.testtoken1.connect(this.user1).approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.connect(this.user2).approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.transfer(this.investor2.address, hre.ethers.utils.parseEther("10000"));

        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.transfer(this.user2.address, hre.ethers.utils.parseEther("10000"));



        await vintageFundingPoolAdapterContract.deposit(this.daoAddr5, hre.ethers.utils.parseEther("4000"));
        await vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr5, hre.ethers.utils.parseEther("4000"));
        await vintageFundingPoolAdapterContract.connect(this.investor2).deposit(this.daoAddr5, hre.ethers.utils.parseEther("4000"));
        await vintageFundingPoolAdapterContract.connect(this.user1).deposit(this.daoAddr5, hre.ethers.utils.parseEther("4000"));
        await vintageFundingPoolAdapterContract.connect(this.user2).deposit(this.daoAddr5, hre.ethers.utils.parseEther("4000"));

        let bal = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr5, this.owner.address);
        let bal1 = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr5, this.investor1.address);
        let bal2 = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr5, this.investor2.address);
        let bal3 = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr5, this.user1.address);
        let bal4 = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr5, this.user2.address);

        console.log(`
        deposit bal1 ${hre.ethers.utils.formatEther(bal)}
        deposit bal2 ${hre.ethers.utils.formatEther(bal1)}
        deposit bal3 ${hre.ethers.utils.formatEther(bal2)}
        deposit bal4 ${hre.ethers.utils.formatEther(bal3)}
        deposit bal5 ${hre.ethers.utils.formatEther(bal4)}
        `);
    });
});

describe("eligibility deposit voting...", () => {
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

        const {
            dao,
            factories,
            adapters,
            extensions,
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

        this.testtoken1 = testContracts.testToken1.instance;
        this.testtoken2 = testContracts.testRiceToken.instance;
        this.flexVesting = adapters.flexVesting.instance;
        this.flexERC721 = adapters.flexERC721.instance;
        this.flexAllocationAdapterContract = adapters.flexAllocationAdapterContract.instance;
        this.flexFundingPoolAdapterContract = adapters.flexFundingPoolAdapterContract.instance;
        this.flexVotingContract = adapters.flexVotingContract.instance;
        this.flexFundingAdapterContract = adapters.flexFundingAdapterContract.instance;
        this.bentoBoxV1 = adapters.bentoBoxV1.instance;
        // this.managing = this.adapters.managing.instance;
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
        const vintageDaoBackerMembershipInfo2 = [
            1, // bool enable;
            "vintageDaoBackerMembershipInfo1",
            1, // uint256 varifyType; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS
            2, // uint256 minHolding;
            this.testERC721.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];


        const vintageDaoBackerMembershipInfo3 = [
            1, // bool enable;
            "vintageDaoBackerMembershipInfo1",
            2, // uint256 varifyType; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS
            2, // uint256 minHolding;
            this.testERC1155.address, // address tokenAddress;
            1, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];


        const vintageDaoBackerMembershipInfo4 = [
            1, // bool enable;
            "vintageDaoBackerMembershipInfo1",
            3, // uint256 varifyType; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS
            hre.ethers.utils.parseEther("0"), // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0, // uint256 tokenId;
            [this.owner.address, this.investor1.address, this.investor2.address] // address[] whiteList;
        ];

        const vintageDaoBackerMembershipInfo5 = [
            0, // bool enable;
            "vintageDaoBackerMembershipInfo1",
            3, // uint256 varifyType; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS
            hre.ethers.utils.parseEther("0"), // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];


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


        const vintageDaoRaiserMembershipInfo2 = [
            1, // bool enable;
            "vintageDaoRaiserMembershipInfo1",
            1, // uint256 varifyType;erc721
            1, // uint256 minHolding;
            erc721.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];


        const vintageDaoRaiserMembershipInfo3 = [
            1, // bool enable;
            "vintageDaoRaiserMembershipInfo1",
            2, // uint256 varifyType;erc1155
            2, // uint256 minHolding;
            erc1155.address, // address tokenAddress;
            1, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];
        //whitelist
        const vintageDaoRaiserMembershipInfo4 = [
            1, // bool enable;
            3, // uint256 varifyType;whitelist
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [this.gp1.address] // address[] whiteList;
        ];
        //deposit
        const vintageDaoRaiserMembershipInfo5 = [
            1, // bool enable;
            4, // uint256 varifyType;deposit
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        //deposit
        const vintageDaoVotingInfo1 = [
            4, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
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

        const vintageDaoVotingInfo2 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            1, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            1, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            2, // uint256 support;
            2, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo3 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
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

        const vintageDaoVotingInfo4 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo5 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        const vintageDaoGenesisRaisers = [this.genesis_raiser1.address, this.genesis_raiser2.address];
        const allocations = [100, 100, 100];
        const vintageDaoParams1 = [
            _daoName1,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo1,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams2 = [
            _daoName2,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo1,
            vintageDaoRaiserMembershipInfo2,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams3 = [
            _daoName3,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo3,
            vintageDaoRaiserMembershipInfo3,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams4 = [
            _daoName4,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo4,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo2,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams5 = [
            _daoName5,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo5,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo2,
            vintageDaoGenesisRaisers,
            allocations
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
        console.log("summon vintage dao4 succeed...", obj.daoAddr);
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

    const createFundRaiseProposal = async (vintageFundRaiseAdapterContract, params) => {
        const tx = await vintageFundRaiseAdapterContract.submitProposal(params);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        return proposalId;
    }

    it("eligibility deposit, log2...", async () => {
        const vintageVotingAdapterContract = this.vintageVotingAdapterContract;

        let votingWeight = await vintageVotingAdapterContract.getVotingWeight(this.daoAddr1, this.owner.address);
        let votingWeight2 = await vintageVotingAdapterContract.getVotingWeight(this.daoAddr1, this.genesis_raiser1.address);
        let votingWeight3 = await vintageVotingAdapterContract.getVotingWeight(this.daoAddr1, this.genesis_raiser2.address);

        console.log(`
        votingWeight ${votingWeight}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);


        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr1);
        const vintageFundingAdapterContract = this.vintageFundingAdapterContract;
        const vintageVesting = this.vintageVesting;
        const vintageFundingPoolAdapterContract = this.vintageFundingPoolAdapterContract;
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

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            returnTokenmanagementFeeRatio,
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

        const enalbePriorityDeposit = true;
        const vtype = 1; // 0 erc20 1 erc721 2 erc1155 3 whitelist
        const token = this.testERC721.address;
        const tokenId = 0;
        const amount = 2;
        const priorityDepositeWhitelist = [];
        const proposalPriorityDepositInfo = [
            enalbePriorityDeposit,
            vtype,
            token,
            tokenId,
            amount,
            priorityDepositeWhitelist
        ];

        const fundRaiseParams = [
            this.daoAddr1,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ],

        const fundRaiserProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams);
        console.log(`
        fund raise proposal created ${fundRaiserProposalId}
        vote for proposal...
        `);

        await vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await vintageVotingAdapterContract.submitVote(this.daoAddr1, fundRaiserProposalId, 1);

        let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, fundRaiserProposalId);
        const stopVoteTime = fundRaiseProposalInfo.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        const voteRel = await vintageVotingAdapterContract.voteResult(this.daoAddr1, fundRaiserProposalId);
        console.log(`
        voted. processing...
        state ${voteRel.state}  nbYes ${voteRel.nbYes}  nbNo ${voteRel.nbNo}
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
        let fundState = await vintageFundingPoolAdapterContract.daoFundRaisingStates(this.daoAddr1);
        votingWeight = await vintageVotingAdapterContract.getVotingWeight(this.daoAddr1, this.owner.address);
        votingWeight2 = await vintageVotingAdapterContract.getVotingWeight(this.daoAddr1, this.genesis_raiser1.address);
        votingWeight3 = await vintageVotingAdapterContract.getVotingWeight(this.daoAddr1, this.genesis_raiser2.address);

        console.log(`
        fund raise state ${fundState}
        votingWeight ${votingWeight}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(endTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(endTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        await vintageFundingPoolAdapterContract.processFundRaise(this.daoAddr1);
        fundState = await vintageFundingPoolAdapterContract.daoFundRaisingStates(this.daoAddr1);
        votingWeight = await vintageVotingAdapterContract.getVotingWeight(this.daoAddr1, this.owner.address);
        votingWeight2 = await vintageVotingAdapterContract.getVotingWeight(this.daoAddr1, this.genesis_raiser1.address);
        votingWeight3 = await vintageVotingAdapterContract.getVotingWeight(this.daoAddr1, this.genesis_raiser2.address);

        console.log(`
        fund raise state ${fundState}
        votingWeight ${votingWeight}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);
    });
    it("eligibility deposit, quantity...", async () => {
        const vintageVotingAdapterContract = this.vintageVotingAdapterContract;

        let votingWeight = await vintageVotingAdapterContract.getVotingWeight(this.daoAddr2, this.owner.address);
        let votingWeight2 = await vintageVotingAdapterContract.getVotingWeight(this.daoAddr2, this.owner.address);
        let votingWeight3 = await vintageVotingAdapterContract.getVotingWeight(this.daoAddr2, this.owner.address);

        console.log(`
        votingWeight ${votingWeight}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);


        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.daoAddr2);
        const vintageFundingAdapterContract = this.vintageFundingAdapterContract;
        const vintageVesting = this.vintageVesting;
        const vintageFundingPoolAdapterContract = this.vintageFundingPoolAdapterContract;
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

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            returnTokenmanagementFeeRatio,
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

        const enalbePriorityDeposit = true;
        const vtype = 1; // 0 erc20 1 erc721 2 erc1155 3 whitelist
        const token = this.testERC721.address;
        const tokenId = 0;
        const amount = 2;
        const priorityDepositeWhitelist = [];
        const proposalPriorityDepositInfo = [
            enalbePriorityDeposit,
            vtype,
            token,
            tokenId,
            amount,
            priorityDepositeWhitelist
        ];

        const fundRaiseParams = [
            this.daoAddr2,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ],

        const fundRaiserProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams);
        console.log(`
        fund raise proposal created ${fundRaiserProposalId}
        vote for proposal...
        `);

        await vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr2, fundRaiserProposalId, 1);
        await vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr2, fundRaiserProposalId, 1);
        await vintageVotingAdapterContract.submitVote(this.daoAddr2, fundRaiserProposalId, 1);

        let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr2, fundRaiserProposalId);
        const stopVoteTime = fundRaiseProposalInfo.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        const voteRel = await vintageVotingAdapterContract.voteResult(this.daoAddr2, fundRaiserProposalId);
        console.log(`
        voted. processing...
        state ${voteRel.state}  nbYes ${voteRel.nbYes}  nbNo ${voteRel.nbNo}
        `);
        await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr2, fundRaiserProposalId);
        fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr2, fundRaiserProposalId);
        console.log(`
        processed...
        state ${fundRaiseProposalInfo.state}
        `);

        //deposit
        await this.testtoken1.approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.connect(this.investor1).approve(vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("10000"));

        await vintageFundingPoolAdapterContract.deposit(this.daoAddr2, hre.ethers.utils.parseEther("10000"));
        await vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr2, hre.ethers.utils.parseEther("10000"));

        let bal = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr2, this.owner.address);
        let bal1 = await vintageFundingPoolAdapterContract.balanceOf(this.daoAddr2, this.investor1.address);

        console.log(`
        deposited ${hre.ethers.utils.formatEther(bal)}
        deposited ${hre.ethers.utils.formatEther(bal1)}

        process fund raise...
        `);

        await vintageFundingPoolAdapterContract.processFundRaise(this.daoAddr2);

        votingWeight = await vintageVotingAdapterContract.getVotingWeight(this.daoAddr2, this.owner.address);
        votingWeight2 = await vintageVotingAdapterContract.getVotingWeight(this.daoAddr2, this.genesis_raiser1.address);
        votingWeight3 = await vintageVotingAdapterContract.getVotingWeight(this.daoAddr2, this.genesis_raiser2.address);

        console.log(`
        votingWeight ${votingWeight}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);
    });

});

describe.only("funding NFT", () => {
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

        this.testtoken1 = testContracts.testToken1.instance;
        this.testtoken2 = testContracts.testRiceToken.instance;
        this.flexVesting = adapters.flexVesting.instance;
        this.flexERC721 = adapters.flexERC721.instance;
        this.flexAllocationAdapterContract = adapters.flexAllocationAdapterContract.instance;
        this.flexFundingPoolAdapterContract = adapters.flexFundingPoolAdapterContract.instance;
        this.flexVotingContract = adapters.flexVotingContract.instance;
        this.flexFundingAdapterContract = adapters.flexFundingAdapterContract.instance;
        this.bentoBoxV1 = adapters.bentoBoxV1.instance;
        // this.managing = this.adapters.managing.instance;
        this.flexPollingVotingContract = adapters.flexPollingVotingContract.instance;
        this.summonDao = this.adapters.summonVintageDao.instance;
        this.summonVintageDao = this.adapters.summonVintageDao.instance;
        this.vintageVestingERC721Contract = this.utilContracts.vintageVestingERC721.instance;
        // const VestingERC721 = await hre.ethers.getContractFactory("VestingERC721");
        // const vestingERC721 = await VestingERC721.deploy("DAOSquare Manual Vesting",
        //     "DMV",
        //     "DAOSquare Manual Vesting Collection 是一个为所有在 DAOSquare Vesting APP 上手动创建的 Vesting 项目共用的 NFT Collection。每一个手动创建的Vesting 项目分享 NFT Collection 中的一定 Token ID 区间。由于每一个 手动 Vesting 项目的图片、名称、介绍不同，因此你可以在这个 Collection 中方便地识别它们。如果你拥有任何一张期中的 NFT，你可以访问 DAOSquare Incubator 查看并领取 Token。",
        //     this.vintageVesting.address
        // );
        // await vestingERC721.deployed();
        // this.vintageVestingNFT = vestingERC721;
        // console.log(111);

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
        const vintageDaoBackerMembershipInfo2 = [
            1, // bool enable;
            "vintageDaoBackerMembershipInfo1",
            1, // uint256 varifyType; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS
            2, // uint256 minHolding;
            this.testERC721.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];


        const vintageDaoBackerMembershipInfo3 = [
            1, // bool enable;
            "vintageDaoBackerMembershipInfo1",
            2, // uint256 varifyType; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS
            2, // uint256 minHolding;
            this.testERC1155.address, // address tokenAddress;
            1, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];


        const vintageDaoBackerMembershipInfo4 = [
            1, // bool enable;
            "vintageDaoBackerMembershipInfo1",
            3, // uint256 varifyType; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS
            hre.ethers.utils.parseEther("0"), // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0, // uint256 tokenId;
            [this.owner.address, this.investor1.address, this.investor2.address] // address[] whiteList;
        ];

        const vintageDaoBackerMembershipInfo5 = [
            0, // bool enable;
            "vintageDaoBackerMembershipInfo1",
            3, // uint256 varifyType; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS
            hre.ethers.utils.parseEther("0"), // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];


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


        const vintageDaoRaiserMembershipInfo2 = [
            1, // bool enable;
            "vintageDaoRaiserMembershipInfo1",
            1, // uint256 varifyType;erc721
            1, // uint256 minHolding;
            erc721.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];


        const vintageDaoRaiserMembershipInfo3 = [
            1, // bool enable;
            "vintageDaoRaiserMembershipInfo1",
            2, // uint256 varifyType;erc1155
            2, // uint256 minHolding;
            erc1155.address, // address tokenAddress;
            1, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];
        //whitelist
        const vintageDaoRaiserMembershipInfo4 = [
            1, // bool enable;
            3, // uint256 varifyType;whitelist
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [this.gp1.address] // address[] whiteList;
        ];
        //deposit
        const vintageDaoRaiserMembershipInfo5 = [
            1, // bool enable;
            4, // uint256 varifyType;deposit
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        //deposit
        const vintageDaoVotingInfo1 = [
            4, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
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

        const vintageDaoVotingInfo2 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            1, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            1, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            2, // uint256 support;
            2, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo3 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
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

        const vintageDaoVotingInfo4 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const vintageDaoVotingInfo5 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            0, // uint8 votingPower;  0. quantity 1. log2 2. 1 voter 1 vote
            0, //  uint256 supportType;   // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
            0, //uint256 quorumType;  // 0. - (YES + NO) / Total > X% 1. - YES + NO > X
            60, // uint256 support;
            66, // uint256 quorum;
            60 * 10, // uint256 votingPeriod;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        const vintageDaoGenesisRaisers = [this.genesis_raiser1.address, this.genesis_raiser2.address];
        const allocations = [100, 100, 100];
        const vintageDaoParams1 = [
            _daoName1,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo1,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams2 = [
            _daoName2,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo1,
            vintageDaoRaiserMembershipInfo2,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams3 = [
            _daoName3,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo3,
            vintageDaoRaiserMembershipInfo3,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams4 = [
            _daoName4,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo4,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo2,
            vintageDaoGenesisRaisers,
            allocations
        ];

        const vintageDaoParams5 = [
            _daoName5,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo5,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo2,
            vintageDaoGenesisRaisers,
            allocations
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
        console.log("summon vintage dao4 succeed...", obj.daoAddr);
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

    const createFundRaiseProposal = async (vintageFundRaiseAdapterContract, params) => {
        const tx = await vintageFundRaiseAdapterContract.submitProposal(params);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        return proposalId;
    }

    it.only("nft enable...", async () => {
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

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            returnTokenmanagementFeeRatio,
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

        const enalbePriorityDeposit = true;
        const vtype = 1; // 0 erc20 1 erc721 2 erc1155 3 whitelist
        const token = this.testERC721.address;
        const tokenId = 0;
        const amount = 2;
        const priorityDepositeWhitelist = [];
        const proposalPriorityDepositInfo = [
            enalbePriorityDeposit,
            vtype,
            token,
            tokenId,
            amount,
            priorityDepositeWhitelist
        ];

        const fundRaiseParams = [
            this.daoAddr1,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ],

        const fundRaiserProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams);
        console.log(`
        fund raise proposal created ${fundRaiserProposalId}
        vote for proposal...
        `);

        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, fundRaiserProposalId, 1);

        let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, fundRaiserProposalId);
        const stopVoteTime = fundRaiseProposalInfo.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, fundRaiserProposalId);
        console.log(`
        voted. processing...
        state ${voteRel.state}  nbYes ${voteRel.nbYes}  nbNo ${voteRel.nbNo}
        `);
        await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr1, fundRaiserProposalId);

        //deposit
        await this.testtoken1.approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.connect(this.investor1).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("10000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("10000"));

        await this.vintageFundingPoolAdapterContract.deposit(this.daoAddr1, hre.ethers.utils.parseEther("10000"));
        await this.vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("10000"));

        let bal = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        let bal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);

        console.log(`
         deposited ${hre.ethers.utils.formatEther(bal)}
         deposited ${hre.ethers.utils.formatEther(bal1)}
 
         process fund raise...
         `);


        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(endTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(endTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        await this.vintageFundingPoolAdapterContract.processFundRaise(this.daoAddr1);


        // Submit funding proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("2000");
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const vestingStartTime = blocktimestamp + 24;
        const vetingEndTime = vestingStartTime + 60 * 60 * 2;
        const vestingCliffEndTime = vestingStartTime + 60 * 60 * 1;
        const vestingInterval = 60 * 60 * 1;

        const vestingCliffLockAmount = hre.ethers.utils.parseEther("0.3");

        const projectTeamTokenAddr = this.testtoken2.address;
        // const GPAddr = await dao.getAddressConfiguration(sha3("GP_ADDRESS"));
        const DaoSquareAddr = await this.vintageFundingAdapterContract.protocolAddress();

        const fundRaiseEndTime = await this.vintageFundingPoolAdapterHelperContract.getFundRaiseWindowCloseTime(this.daoAddr1);
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(fundRaiseEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseEndTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        let fundRaiseState = await this.vintageFundingPoolAdapterContract.daoFundRaisingStates(this.daoAddr1);
        console.log(`
        fund raise state ${fundRaiseState}
        `);

        const approver = this.owner.address;
        const escrow = true;
        const price = hre.ethers.utils.parseEther("0.3");
        const enableVestingNFT = true;
        const receiver = this.project_team1.address;
        console.log(`
        receiver ${receiver}
        approver ${approver}
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
            approver,
            enableVestingNFT,
            this.vintageVestingERC721Contract.address
        ];


        const vestingInfo = [
            "vesting name",
            "vesting description",
            vestingStartTime,
            vetingEndTime,
            vestingCliffEndTime,
            vestingCliffLockAmount,
            vestingInterval
        ]
        const params = [fundingInfo, returnTokenInfo, vestingInfo]

        const proposer = this.genesis_raiser1;

        let frontProposaId = await this.vintageFundingAdapterContract.getFrontProposalId(this.daoAddr1);
        let queueLength = await this.vintageFundingAdapterContract.getQueueLength(this.daoAddr1);
        console.log(`
        frontProposalId ${frontProposaId}
        queueLen ${queueLength}
        `);
        let proposalId = await createFundingProposal(
            this.vintageFundingAdapterContract,
            proposer,
            this.daoAddr1,
            params
        );

        console.log(`
        new funding proposalId: ${proposalId}
        `);
        this.proposalId = proposalId;
        frontProposaId = await this.vintageFundingAdapterContract.getFrontProposalId(this.daoAddr1);
        queueLength = await this.vintageFundingAdapterContract.getQueueLength(this.daoAddr1);
        console.log(`
        queueLength ${queueLength}
        frontProposaId ${frontProposaId}
        approve return token...
        start voting...
        `);

        await this.testtoken2.approve(this.vintageFundingReturnTokenAdapterContract.address, requestedFundAmount.mul(hre.ethers.utils.parseEther("1")).div(price));

        await this.vintageFundingReturnTokenAdapterContract.setFundingApprove(
            this.daoAddr1,
            proposalId,
            this.testtoken2.address,
            requestedFundAmount.mul(hre.ethers.utils.parseEther("1")).div(price)
        );

        await this.vintageFundingAdapterContract.startVotingProcess(this.daoAddr1, proposalId);

        let fundingProposalInfo = await this.vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId);

        console.log(`
        funding proposal state ${fundingProposalInfo.status}
        paybackTokenAmount: ${hre.ethers.utils.formatEther(fundingProposalInfo.proposalPaybackTokenInfo.paybackTokenAmount)}
        escrow ${fundingProposalInfo.proposalPaybackTokenInfo.escrow}
        totalFundAmount ${hre.ethers.utils.formatEther(fundingProposalInfo.totalAmount)}
        approver ${fundingProposalInfo.proposalPaybackTokenInfo.approveOwnerAddr}
        voting...
        `);

        await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, proposalId, 1);
        fundingProposalInfo = await this.vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundingProposalInfo.proposalTimeInfo.proposalStopVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        const rel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, proposalId);
        console.log(`voting reuslt ${rel.state}`);

        let protocolAddressBal = await this.testtoken1.balanceOf(DaoSquareAddr);
        // let gpAddressBal = await this.testtoken1.balanceOf(GPAddr);
        let proposerBal = await this.testtoken1.balanceOf(proposer.address);
        let receiverBal = await this.testtoken1.balanceOf(this.project_team1.address);
        console.log(`
        protocolAddressBal ${hre.ethers.utils.formatEther(protocolAddressBal)}
        proposerBal ${hre.ethers.utils.formatEther(proposerBal)}
        receiverBal ${hre.ethers.utils.formatEther(receiverBal)}

        `)

        console.log(`
        process funding proposal...
        `);
        await this.vintageFundingAdapterContract.processProposal(this.daoAddr1, proposalId);

        const vestingEligible1 = await this.vintageAllocationAdapterContract.ifEligible(this.daoAddr1, this.owner.address, proposalId);
        const vestingEligible2 = await this.vintageAllocationAdapterContract.ifEligible(this.daoAddr1, this.investor1.address, proposalId);
        const vestingEligible3 = await this.vintageAllocationAdapterContract.ifEligible(this.daoAddr1, this.investor2.address, proposalId);

        console.log(`
        owner eligible for ${proposalId} : ${vestingEligible1}
        investor1 eligible for ${proposalId} : ${vestingEligible2}
        investor2 eligible for ${proposalId} : ${vestingEligible3}
        `);

        await this.vintageVesting.createVesting(this.daoAddr1, this.owner.address, proposalId);
        await this.vintageVesting.createVesting(this.daoAddr1, this.investor1.address, proposalId);

        let vestInfo1 = await this.vintageVesting.vests(1);
        let vestInfo2 = await this.vintageVesting.vests(2);

        console.log(`
        vest info 1:
            name ${vestInfo1.vestInfo.name}
            description ${vestInfo1.vestInfo.description}
            recipient ${vestInfo1.vestInfo.recipient}
            startTime ${vestInfo1.timeInfo.start}
            cliffEndTime ${parseInt(vestInfo1.timeInfo.start) + parseInt(vestInfo1.timeInfo.cliffDuration)}
            endTime ${vestInfo1.timeInfo.end}
            total ${hre.ethers.utils.formatEther(vestInfo1.total)}
            claimed ${vestInfo1.claimed}
            nftToken  ${vestInfo1.nftInfo.nftToken}
            tokenId  ${vestInfo1.nftInfo.tokenId}
        vest info 2:
            name ${vestInfo2.vestInfo.name}
            description ${vestInfo2.vestInfo.description}
            recipient ${vestInfo2.vestInfo.recipient}
            startTime ${vestInfo2.timeInfo.start}
            cliffEndTime ${parseInt(vestInfo2.timeInfo.start) + parseInt(vestInfo1.timeInfo.cliffDuration)}
            endTime ${vestInfo2.timeInfo.end}
            total ${hre.ethers.utils.formatEther(vestInfo2.total)}
            claimed ${vestInfo2.claimed}
            nftToken  ${vestInfo2.nftInfo.nftToken}
            tokenId  ${vestInfo2.nftInfo.tokenId}
        `);


        let ownerOfTokenID1 = await this.vintageVestingERC721Contract.ownerOf(1);
        let ownerOfTokenID2 = await this.vintageVestingERC721Contract.ownerOf(2);
        console.log(`
            ownerOfTokenID1 ${ownerOfTokenID1}
            ownerOfTokenID2 ${ownerOfTokenID2}
            `);
        await this.vintageVestingERC721Contract.connect(this.investor1).transferFrom(this.investor1.address, this.investor2.address, 2);

        let svg1 = await this.vintageVestingERC721Contract.getSvg(1);
        let tokenURI = await this.vintageVestingERC721Contract.tokenURI(1);
        console.log(`
        svg of tokenid 1 :
        ${svg1}
        tokenURI of tokenId 1:
${tokenURI}
        `);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(vestInfo2.timeInfo.start) + parseInt(vestInfo1.timeInfo.cliffDuration) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        await this.vintageVesting.connect(this.owner).withdraw(this.daoAddr1, 1);
        // await expectRevert(this.vintageVesting.connect(this.investor2).withdraw(this.daoAddr1, 2), "revert");
        await this.vintageVesting.connect(this.investor2).withdraw(this.daoAddr1, 2);


        vestInfo1 = await this.vintageVesting.vests(1);
        vestInfo2 = await this.vintageVesting.vests(2);

        let vestBal1 = await this.vintageVesting.vestBalance(1);
        let vestBal2 = await this.vintageVesting.vestBalance(2);

        console.log(`
        vest info 1:
            claimed ${hre.ethers.utils.formatEther(vestInfo1.claimed)}
            vestBal1 ${hre.ethers.utils.formatEther(vestBal1)}
        vest info 2:
            claimed ${hre.ethers.utils.formatEther(vestInfo2.claimed)}
            vestBal1 ${hre.ethers.utils.formatEther(vestBal2)}
        `);


        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(vestInfo1.timeInfo.end) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        await this.vintageVesting.connect(this.owner).withdraw(this.daoAddr1, 1);
        await this.vintageVesting.connect(this.investor2).withdraw(this.daoAddr1, 2);

        vestInfo1 = await this.vintageVesting.vests(1);
        vestInfo2 = await this.vintageVesting.vests(2);

        let testtokenBal1 = await this.testtoken2.balanceOf(this.investor2.address);

        console.log(`
        vest info 1:
            claimed ${hre.ethers.utils.formatEther(vestInfo1.claimed)}
        vest info 2:
            claimed ${hre.ethers.utils.formatEther(vestInfo2.claimed)}

        testtokenBal1 ${hre.ethers.utils.formatEther(testtokenBal1)}
        `);
    });

    it("escrow, nft disable...", async () => {

        // Submit funding proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("2000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const vestingStartTime = blocktimestamp + 24;
        const vetingEndTime = vestingStartTime + 60 * 60 * 2;
        const vestingCliffEndTime = vestingStartTime + 60 * 60 * 1;
        const vestingInterval = 60 * 10;

        const vestingCliffLockAmount = hre.ethers.utils.parseEther("0.3");

        const projectTeamTokenAddr = this.testtoken2.address;
        // const GPAddr = await dao.getAddressConfiguration(sha3("GP_ADDRESS"));
        const DaoSquareAddr = await this.vintageFundingAdapterContract.protocolAddress();

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const approver = this.owner.address;
        const escrow = true;
        const price = hre.ethers.utils.parseEther("0.3");
        const enableVestingNFT = false;
        const receiver = this.project_team1.address;
        console.log(`
        receiver ${receiver}
        approver ${approver}
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
            approver,
            enableVestingNFT,
            ZERO_ADDRESS
        ];


        const vestingInfo = [
            "",
            "",
            vestingStartTime,
            vetingEndTime,
            vestingCliffEndTime,
            vestingCliffLockAmount,
            vestingInterval
        ]
        const params = [fundingInfo, returnTokenInfo, vestingInfo]

        const proposer = this.genesis_raiser1;

        let frontProposaId = await this.vintageFundingAdapterContract.getFrontProposalId(this.daoAddr1);
        let queueLength = await this.vintageFundingAdapterContract.getQueueLength(this.daoAddr1);
        console.log(`
        frontProposalId ${frontProposaId}
        queueLen ${queueLength}
        `);
        let proposalId = await createFundingProposal(
            this.vintageFundingAdapterContract,
            proposer,
            this.daoAddr1,
            params
        );

        console.log(`
        new funding proposalId: ${proposalId}
        `);
        this.proposalId = proposalId;
        frontProposaId = await this.vintageFundingAdapterContract.getFrontProposalId(this.daoAddr1);
        queueLength = await this.vintageFundingAdapterContract.getQueueLength(this.daoAddr1);
        console.log(`
        queueLength ${queueLength}
        frontProposaId ${frontProposaId}
        approve return token...
        start voting...
        `);

        await this.testtoken2.approve(this.vintageFundingReturnTokenAdapterContract.address, requestedFundAmount.mul(hre.ethers.utils.parseEther("1")).div(price));

        await this.vintageFundingReturnTokenAdapterContract.setFundingApprove(
            this.daoAddr1,
            proposalId,
            this.testtoken2.address,
            requestedFundAmount.mul(hre.ethers.utils.parseEther("1")).div(price)
        );

        await this.vintageFundingAdapterContract.startVotingProcess(this.daoAddr1, proposalId);

        let fundingProposalInfo = await this.vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId);

        console.log(`
        funding proposal state ${fundingProposalInfo.status}
        paybackTokenAmount: ${hre.ethers.utils.formatEther(fundingProposalInfo.proposalPaybackTokenInfo.paybackTokenAmount)}
        escrow ${fundingProposalInfo.proposalPaybackTokenInfo.escrow}
        totalFundAmount ${hre.ethers.utils.formatEther(fundingProposalInfo.totalAmount)}
        approver ${fundingProposalInfo.proposalPaybackTokenInfo.approveOwnerAddr}
        voting...
        `);

        await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, proposalId, 1);
        fundingProposalInfo = await this.vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundingProposalInfo.proposalTimeInfo.proposalStopVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        const rel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, proposalId);
        console.log(`voting reuslt ${rel.state}`);

        let protocolAddressBal = await this.testtoken1.balanceOf(DaoSquareAddr);
        // let gpAddressBal = await this.testtoken1.balanceOf(GPAddr);
        let proposerBal = await this.testtoken1.balanceOf(proposer.address);
        let receiverBal = await this.testtoken1.balanceOf(this.project_team1.address);
        console.log(`
        protocolAddressBal ${hre.ethers.utils.formatEther(protocolAddressBal)}
        proposerBal ${hre.ethers.utils.formatEther(proposerBal)}
        receiverBal ${hre.ethers.utils.formatEther(receiverBal)}
        `)

        console.log(`
        process funding proposal...
        `);
        await this.vintageFundingAdapterContract.processProposal(this.daoAddr1, proposalId);

        const vestingEligible1 = await this.vintageAllocationAdapterContract.ifEligible(this.daoAddr1, this.owner.address, proposalId);
        const vestingEligible2 = await this.vintageAllocationAdapterContract.ifEligible(this.daoAddr1, this.investor1.address, proposalId);
        const vestingEligible3 = await this.vintageAllocationAdapterContract.ifEligible(this.daoAddr1, this.investor2.address, proposalId);

        console.log(`
        owner eligible for ${proposalId} : ${vestingEligible1}
        investor1 eligible for ${proposalId} : ${vestingEligible2}
        investor2 eligible for ${proposalId} : ${vestingEligible3}
        `);

        await this.vintageVesting.createVesting(this.daoAddr1, this.owner.address, proposalId);
        await this.vintageVesting.createVesting(this.daoAddr1, this.investor1.address, proposalId);

        let vestInfo1 = await this.vintageVesting.vests(3);
        let vestInfo2 = await this.vintageVesting.vests(4);

        console.log(`
        vest info 1:
            name ${vestInfo1.vestInfo.name}
            description ${vestInfo1.vestInfo.description}
            recipient ${vestInfo1.vestInfo.recipient}
            startTime ${vestInfo1.timeInfo.start}
            cliffEndTime ${parseInt(vestInfo1.timeInfo.start) + parseInt(vestInfo1.timeInfo.cliffDuration)}
            endTime ${vestInfo1.timeInfo.end}
            total ${hre.ethers.utils.formatEther(vestInfo1.total)}
            claimed ${vestInfo1.claimed}
            nftToken  ${vestInfo1.nftInfo.nftToken}
            tokenId  ${vestInfo1.nftInfo.tokenId}
        vest info 2:
            name ${vestInfo2.vestInfo.name}
            description ${vestInfo2.vestInfo.description}
            recipient ${vestInfo2.vestInfo.recipient}
            startTime ${vestInfo2.timeInfo.start}
            cliffEndTime ${parseInt(vestInfo2.timeInfo.start) + parseInt(vestInfo1.timeInfo.cliffDuration)}
            endTime ${vestInfo2.timeInfo.end}
            total ${hre.ethers.utils.formatEther(vestInfo2.total)}
            claimed ${vestInfo2.claimed}
            nftToken  ${vestInfo2.nftInfo.nftToken}
            tokenId  ${vestInfo2.nftInfo.tokenId}
        `);


        await this.vintageVesting.connect(this.owner).withdraw(this.daoAddr1, 3);
        await expectRevert(this.vintageVesting.connect(this.investor2).withdraw(this.daoAddr1, 4), "revert");
        await this.vintageVesting.connect(this.investor1).withdraw(this.daoAddr1, 4);


        vestInfo1 = await this.vintageVesting.vests(3);
        vestInfo2 = await this.vintageVesting.vests(4);

        let vestBal1 = await this.vintageVesting.vestBalance(3);
        let vestBal2 = await this.vintageVesting.vestBalance(4);

        console.log(`
        vest info 3:
            claimed ${hre.ethers.utils.formatEther(vestInfo1.claimed)}
            vestBal1 ${hre.ethers.utils.formatEther(vestBal1)}
        vest info 4:
            claimed ${hre.ethers.utils.formatEther(vestInfo2.claimed)}
            vestBal1 ${hre.ethers.utils.formatEther(vestBal2)}
        `);


        // await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(vestInfo1.timeInfo.end) + 1])
        // await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        await this.vintageVesting.connect(this.owner).withdraw(this.daoAddr1, 3);
        await this.vintageVesting.connect(this.investor1).withdraw(this.daoAddr1, 4);

        vestInfo1 = await this.vintageVesting.vests(3);
        vestInfo2 = await this.vintageVesting.vests(4);

        let testtokenBal1 = await this.testtoken2.balanceOf(this.investor2.address);

        console.log(`
        vest info 1:
            claimed ${hre.ethers.utils.formatEther(vestInfo1.claimed)}
        vest info 2:
            claimed ${hre.ethers.utils.formatEther(vestInfo2.claimed)}

        testtokenBal1 ${hre.ethers.utils.formatEther(testtokenBal1)}
        `);
    });

    it("non escrow...", async () => {
        // Submit funding proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("2000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const vestingStartTime = 0;
        const vetingEndTime = 0;
        const vestingCliffEndTime = 0;
        const vestingInterval = 0;

        const vestingCliffLockAmount = hre.ethers.utils.parseEther("0.3");

        const projectTeamTokenAddr = this.testtoken2.address;
        // const GPAddr = await dao.getAddressConfiguration(sha3("GP_ADDRESS"));
        const DaoSquareAddr = await this.vintageFundingAdapterContract.protocolAddress();

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const approver = this.owner.address;
        const escrow = false;
        const price = hre.ethers.utils.parseEther("0.3");
        const enableVestingNFT = false;
        const receiver = this.project_team1.address;
        console.log(`
        receiver ${receiver}
        approver ${approver}
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
            approver,
            enableVestingNFT,
            ZERO_ADDRESS
        ];


        const vestingInfo = [
            "",
            "",
            vestingStartTime,
            vetingEndTime,
            vestingCliffEndTime,
            vestingCliffLockAmount,
            vestingInterval
        ]
        const params = [fundingInfo, returnTokenInfo, vestingInfo]

        const proposer = this.genesis_raiser1;

        let frontProposaId = await this.vintageFundingAdapterContract.getFrontProposalId(this.daoAddr1);
        let queueLength = await this.vintageFundingAdapterContract.getQueueLength(this.daoAddr1);
        console.log(`
        frontProposalId ${frontProposaId}
        queueLen ${queueLength}
        `);
        let proposalId = await createFundingProposal(
            this.vintageFundingAdapterContract,
            proposer,
            this.daoAddr1,
            params
        );

        console.log(`
        new funding proposalId: ${proposalId}
        `);
        this.proposalId = proposalId;
        frontProposaId = await this.vintageFundingAdapterContract.getFrontProposalId(this.daoAddr1);
        queueLength = await this.vintageFundingAdapterContract.getQueueLength(this.daoAddr1);
        console.log(`
        queueLength ${queueLength}
        frontProposaId ${frontProposaId}
        start voting...
        `);

        await this.vintageFundingAdapterContract.startVotingProcess(this.daoAddr1, proposalId);

        frontProposaId = await this.vintageFundingAdapterContract.getFrontProposalId(this.daoAddr1);
        queueLength = await this.vintageFundingAdapterContract.getQueueLength(this.daoAddr1);
        console.log(`
        queueLength ${queueLength}
        frontProposaId ${frontProposaId}
        `);

        let fundingProposalInfo = await this.vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId);

        console.log(`
        funding proposal state ${fundingProposalInfo.status}
        paybackTokenAmount: ${hre.ethers.utils.formatEther(fundingProposalInfo.proposalPaybackTokenInfo.paybackTokenAmount)}
        escrow ${fundingProposalInfo.proposalPaybackTokenInfo.escrow}
        totalFundAmount ${hre.ethers.utils.formatEther(fundingProposalInfo.totalAmount)}
        approver ${fundingProposalInfo.proposalPaybackTokenInfo.approveOwnerAddr}
        voting...
        `);

        await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, proposalId, 1);
        fundingProposalInfo = await this.vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundingProposalInfo.proposalTimeInfo.proposalStopVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        const rel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, proposalId);
        console.log(`voting reuslt ${rel.state}`);

        let protocolAddressBal = await this.testtoken1.balanceOf(DaoSquareAddr);
        // let gpAddressBal = await this.testtoken1.balanceOf(GPAddr);
        let proposerBal = await this.testtoken1.balanceOf(proposer.address);
        let receiverBal = await this.testtoken1.balanceOf(this.project_team1.address);
        console.log(`
        protocolAddressBal ${hre.ethers.utils.formatEther(protocolAddressBal)}
        proposerBal ${hre.ethers.utils.formatEther(proposerBal)}
        receiverBal ${hre.ethers.utils.formatEther(receiverBal)}
        `)

        console.log(`
        process funding proposal...
        `);
        await this.vintageFundingAdapterContract.processProposal(this.daoAddr1, proposalId);

        fundingProposalInfo = await this.vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId);
        console.log(`
        funding proposal state ${fundingProposalInfo.status}
        `);

    });
});

describe("raiser allocations...", () => {
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
        this.vintageVestingERC721Contract = this.utilContracts.vintageVestingERC721.instance;

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
        const vintageDaoParams1 = [
            _daoName1,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo1,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers,
            allocations
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

    it("eligibilityType = allocation...", async () => {

        const alloca1 = await this.vintageRaiserAllocationAdapterContract.getAllocation(this.daoAddr1, this.genesis_raiser1.address)
        const alloca2 = await this.vintageRaiserAllocationAdapterContract.getAllocation(this.daoAddr1, this.genesis_raiser2.address)
        const alloca3 = await this.vintageRaiserAllocationAdapterContract.getAllocation(this.daoAddr1, this.owner.address)

        const votingWeight1 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr1, this.genesis_raiser1.address);
        const votingWeight2 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr1, this.genesis_raiser2.address);
        const votingWeight3 = await this.vintageVotingAdapterContract.getVotingWeight(this.daoAddr1, this.owner.address);

        console.log(`
        alloca1 ${alloca1}
        alloca2 ${alloca2}
        alloca3 ${alloca3}

        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);
    });


    it("raiser in proposal...", async () => {
        const vintageVotingContract = this.vintageVotingAdapterContract;
        const vintagealloc = this.vintageRaiserAllocationAdapterContract;
        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("100"));
        const allocation = 100;
        const raiserMangementContract = this.vintageRaiserManagementContract;
        const daoAddr = this.daoAddr1;
        const tx = await raiserMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, allocation);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        console.log(`
        proposalId ${proposalId}
        `);
        let proposalDetail = await raiserMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        console.log("voting...");
        await vintageVotingContract.submitVote(daoAddr, proposalId, 1);
        await vintageVotingContract.connect(this.genesis_raiser1).submitVote(daoAddr, proposalId, 1);
        await vintageVotingContract.connect(this.genesis_raiser2).submitVote(daoAddr, proposalId, 1);
        console.log("voted...");

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        let votingWeight = await vintageVotingContract.getVotingWeight(daoAddr, this.user1.address);
        let alloca = await vintagealloc.getAllocation(daoAddr, this.user1.address);
        let isRaiser = await this.dao1Contract.isMember(this.user1.address);
        console.log(`
        isRaiser ${isRaiser}
        alloca ${alloca}
        votingWeight ${votingWeight}
        `);
        await raiserMangementContract.processProposal(daoAddr, proposalId);

        isRaiser = await this.dao1Contract.isMember(this.user1.address);
        votingWeight = await vintageVotingContract.getVotingWeight(daoAddr, this.user1.address);
        alloca = await vintagealloc.getAllocation(daoAddr, this.user1.address)
        console.log(`
        isRaiser ${isRaiser}
        alloca ${alloca}
        votingWeight ${votingWeight}
        `);
    });
});

describe("Free-In...", () => {
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
        this.vintageVestingERC721Contract = this.utilContracts.vintageVestingERC721.instance;

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
        const vintageDaoParams1 = [
            _daoName1,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo1,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers,
            allocations
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

    const createFundRaiseProposal = async (vintageFundRaiseAdapterContract, params) => {
        const tx = await vintageFundRaiseAdapterContract.submitProposal(params);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        return proposalId;
    }

    it("free-in deposit, withdraw...", async () => {
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

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            returnTokenmanagementFeeRatio,
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

        const fundRaiseParams = [
            this.daoAddr1,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ],

        const fundRaiserProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams);
        const whitelistVal = await this.vintageFundRaiseAdapterContract.getWhiteList(this.daoAddr1, fundRaiserProposalId);
        console.log("whitelistVal ", whitelistVal);
        console.log(`
        fund raise proposal created ${fundRaiserProposalId}
        vote for proposal...
        `);

        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, fundRaiserProposalId, 1);

        let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, fundRaiserProposalId);
        const stopVoteTime = fundRaiseProposalInfo.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, fundRaiserProposalId);
        console.log(`
        voted. processing...
        state ${voteRel.state}  nbYes ${voteRel.nbYes}  nbNo ${voteRel.nbNo}
        process new fund proposal...
        `);
        await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr1, fundRaiserProposalId);

        //deposit
        await this.testtoken1.approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.investor1).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("200000"));

        console.log(`
        deposit...
        `);
        await this.vintageFundingPoolAdapterContract.deposit(this.daoAddr1, hre.ethers.utils.parseEther("26000"));
        await this.vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("20020"));

        let bal = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        let bal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);
        let poolBal = await this.vintageFundingPoolAdapterContract.poolBalance(this.daoAddr1);

        console.log(`
        deposited ${hre.ethers.utils.formatEther(bal)}
        deposited ${hre.ethers.utils.formatEther(bal1)}
        poolBal ${hre.ethers.utils.formatEther(poolBal)}

        withdraw during fund rasing...
        `);

        await this.vintageFundingPoolAdapterContract.withdraw(this.daoAddr1, hre.ethers.utils.parseEther("10000"));
        await this.vintageFundingPoolAdapterContract.connect(this.investor1).withdraw(this.daoAddr1, hre.ethers.utils.parseEther("10000"));
        poolBal = await this.vintageFundingPoolAdapterContract.poolBalance(this.daoAddr1);
        bal = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        bal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);
        const priorityFunds = await this.vintageFundingPoolAdapterContract.freeINPriorityDeposits(this.daoAddr1, fundRaiserProposalId);
        console.log(`
         deposited ${hre.ethers.utils.formatEther(bal)}
         deposited ${hre.ethers.utils.formatEther(bal1)}
         poolBal ${hre.ethers.utils.formatEther(poolBal)}
         priorityFunds ${hre.ethers.utils.formatEther(priorityFunds)}

         process fund raise...
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(endTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(endTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        await this.vintageFundingPoolAdapterContract.processFundRaise(this.daoAddr1);
        const fundRaisingState = await this.vintageFundingPoolAdapterContract.daoFundRaisingStates(this.daoAddr1);
        poolBal = await this.vintageFundingPoolAdapterContract.poolBalance(this.daoAddr1);
        let freeInEscrowFund1 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, 1, this.owner.address);
        let freeInEscrowFund2 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, 1, this.investor1.address);
        bal = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        bal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);
        console.log(`
        fund raising state ${fundRaisingState}
        poolBal ${hre.ethers.utils.formatEther(poolBal)}
        freeInEscrowFund1 ${hre.ethers.utils.formatEther(freeInEscrowFund1[1])}
        freeInEscrowFund2 ${hre.ethers.utils.formatEther(freeInEscrowFund2[1])}
        deposited ${hre.ethers.utils.formatEther(bal)}
        deposited ${hre.ethers.utils.formatEther(bal1)}
        withdraw in redempte period...
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(blocktimestamp) + 60 * 60 * 24 * 7 - 60 * 30])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        await this.vintageFundingPoolAdapterContract.withdraw(this.daoAddr1, bal);
        await this.vintageFundingPoolAdapterContract.connect(this.investor1).withdraw(this.daoAddr1, bal1);

        bal = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        bal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);

        console.log(`
        withdrawed...
        deposited ${hre.ethers.utils.formatEther(bal)}
        deposited ${hre.ethers.utils.formatEther(bal1)}
        `);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(blocktimestamp) + endTime + fundTerm + returnPeriod + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
    });

    it("free in priority deposit funds >= max fund", async () => {
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

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            returnTokenmanagementFeeRatio,
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

        const fundRaiseParams = [
            this.daoAddr1,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ];

        const fundRaiserProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams);
        let whitelistVal = await this.vintageFundRaiseAdapterContract.getWhiteList(this.daoAddr1, fundRaiserProposalId);
        const isPriorityDepositer1 = await this.vintageFundRaiseAdapterContract.isPriorityDepositer(this.daoAddr1, fundRaiserProposalId, this.user1.address);
        const isPriorityDepositer2 = await this.vintageFundRaiseAdapterContract.isPriorityDepositer(this.daoAddr1, fundRaiserProposalId, this.user2.address);

        console.log("whitelistVal ", whitelistVal);
        console.log(`
        fund raise proposal created ${fundRaiserProposalId}
        isPriorityDepositer1 ${isPriorityDepositer1}
        isPriorityDepositer2 ${isPriorityDepositer2}
        vote for proposal...
        `);

        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, fundRaiserProposalId, 1);

        let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, fundRaiserProposalId);
        const stopVoteTime = fundRaiseProposalInfo.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, fundRaiserProposalId);
        console.log(`
        voted. processing...
        state ${voteRel.state}  nbYes ${voteRel.nbYes}  nbNo ${voteRel.nbNo}
        process new fund proposal...
        `);
        await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr1, fundRaiserProposalId);

        //deposit
        await this.testtoken1.approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.investor1).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.user1).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.user2).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.transfer(this.user2.address, hre.ethers.utils.parseEther("200000"));

        console.log(`
        deposit...
        `);
        await this.vintageFundingPoolAdapterContract.deposit(this.daoAddr1, hre.ethers.utils.parseEther("6000"));
        await this.vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("1020"));
        await this.vintageFundingPoolAdapterContract.connect(this.user1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("10020"));
        await this.vintageFundingPoolAdapterContract.connect(this.user2).deposit(this.daoAddr1, hre.ethers.utils.parseEther("20020"));

        let bal = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        let bal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);
        let bal2 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user1.address);
        let bal3 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user2.address);

        let poolBal = await this.vintageFundingPoolAdapterContract.poolBalance(this.daoAddr1);
        let priorityFunds = await this.vintageFundingPoolAdapterContract.freeINPriorityDeposits(this.daoAddr1, fundRaiserProposalId);

        console.log(`
        bal ${hre.ethers.utils.formatEther(bal)}
        bal1 ${hre.ethers.utils.formatEther(bal1)}
        bal2 ${hre.ethers.utils.formatEther(bal2)}
        bal3 ${hre.ethers.utils.formatEther(bal3)}
        poolBal ${hre.ethers.utils.formatEther(poolBal)}
        priorityFunds ${hre.ethers.utils.formatEther(priorityFunds)}
        process fund raise...
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(endTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(endTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        await this.vintageFundingPoolAdapterContract.processFundRaise(this.daoAddr1);
        const fundRaisingState = await this.vintageFundingPoolAdapterContract.daoFundRaisingStates(this.daoAddr1);
        poolBal = await this.vintageFundingPoolAdapterContract.poolBalance(this.daoAddr1);
        priorityFunds = await this.vintageFundingPoolAdapterContract.freeINPriorityDeposits(this.daoAddr1, fundRaiserProposalId);
        const currentFundCounter = await this.vintageFundRaiseAdapterContract.createdFundCounter(this.daoAddr1);
        let freeInEscrowFund1 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.owner.address);
        let freeInEscrowFund2 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.investor1.address);
        let freeInEscrowFund3 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user1.address);
        let freeInEscrowFund4 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user2.address);
        bal = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        bal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);
        bal2 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user1.address);
        bal3 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user2.address);
        console.log(`
        fund raising state ${fundRaisingState}
        poolBal ${hre.ethers.utils.formatEther(poolBal)}
        priorityFunds ${hre.ethers.utils.formatEther(priorityFunds)}
        freeInEscrowFund1 ${hre.ethers.utils.formatEther(freeInEscrowFund1[1])}
        freeInEscrowFund2 ${hre.ethers.utils.formatEther(freeInEscrowFund2[1])}
        freeInEscrowFund3 ${hre.ethers.utils.formatEther(freeInEscrowFund3[1])}
        freeInEscrowFund4 ${hre.ethers.utils.formatEther(freeInEscrowFund4[1])}
        bal ${hre.ethers.utils.formatEther(bal)}
        bal1 ${hre.ethers.utils.formatEther(bal1)}
        bal2 ${hre.ethers.utils.formatEther(bal2)}
        bal3 ${hre.ethers.utils.formatEther(bal3)}

        withdraw from free in fund escrow...
        `);

        await this.vintageFreeInEscrowFundAdapterContract.connect(this.owner).withdraw(this.daoAddr1, currentFundCounter);
        await this.vintageFreeInEscrowFundAdapterContract.connect(this.investor1).withdraw(this.daoAddr1, currentFundCounter);
        await this.vintageFreeInEscrowFundAdapterContract.connect(this.user1).withdraw(this.daoAddr1, currentFundCounter);
        await this.vintageFreeInEscrowFundAdapterContract.connect(this.user2).withdraw(this.daoAddr1, currentFundCounter);

        freeInEscrowFund1 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.owner.address);
        freeInEscrowFund2 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.investor1.address);
        freeInEscrowFund3 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user1.address);
        freeInEscrowFund4 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user2.address);

        console.log(`
        withdrawed...
        freeInEscrowFund1 ${hre.ethers.utils.formatEther(freeInEscrowFund1[1])}
        freeInEscrowFund2 ${hre.ethers.utils.formatEther(freeInEscrowFund2[1])}
        freeInEscrowFund3 ${hre.ethers.utils.formatEther(freeInEscrowFund3[1])}
        freeInEscrowFund4 ${hre.ethers.utils.formatEther(freeInEscrowFund4[1])}
        `);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(blocktimestamp) + endTime + fundTerm + returnPeriod + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has


        await this.vintageFundingPoolAdapterContract.clearFund(this.daoAddr1);
        console.log(`clear fund...`);
    });

    it("free in priority deposit funds < max fund", async () => {
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

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            returnTokenmanagementFeeRatio,
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

        const fundRaiseParams = [
            this.daoAddr1,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ],

        const fundRaiserProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams);
        const whitelistVal = await this.vintageFundRaiseAdapterContract.getWhiteList(this.daoAddr1, fundRaiserProposalId);
        const isPriorityDepositer1 = await this.vintageFundRaiseAdapterContract.isPriorityDepositer(this.daoAddr1, fundRaiserProposalId, this.user1.address);
        const isPriorityDepositer2 = await this.vintageFundRaiseAdapterContract.isPriorityDepositer(this.daoAddr1, fundRaiserProposalId, this.user2.address);

        console.log("whitelistVal ", whitelistVal);
        console.log(`
        fund raise proposal created ${fundRaiserProposalId}
        isPriorityDepositer1 ${isPriorityDepositer1}
        isPriorityDepositer2 ${isPriorityDepositer2}
        vote for proposal...
        `);

        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, fundRaiserProposalId, 1);

        let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, fundRaiserProposalId);
        const stopVoteTime = fundRaiseProposalInfo.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, fundRaiserProposalId);
        console.log(`
        voted. processing...
        state ${voteRel.state}  nbYes ${voteRel.nbYes}  nbNo ${voteRel.nbNo}
        process new fund proposal...
        `);
        await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr1, fundRaiserProposalId);

        //deposit
        await this.testtoken1.approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.investor1).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.user1).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.user2).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.transfer(this.user2.address, hre.ethers.utils.parseEther("200000"));

        console.log(`
        deposit...
        `);
        await this.vintageFundingPoolAdapterContract.deposit(this.daoAddr1, hre.ethers.utils.parseEther("16000"));
        await this.vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("11020"));
        await this.vintageFundingPoolAdapterContract.connect(this.user1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("3020"));
        await this.vintageFundingPoolAdapterContract.connect(this.user2).deposit(this.daoAddr1, hre.ethers.utils.parseEther("7020"));

        let bal = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        let bal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);
        let bal2 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user1.address);
        let bal3 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user2.address);

        let poolBal = await this.vintageFundingPoolAdapterContract.poolBalance(this.daoAddr1);
        let priorityFunds = await this.vintageFundingPoolAdapterContract.freeINPriorityDeposits(this.daoAddr1, fundRaiserProposalId);

        console.log(`
        bal ${hre.ethers.utils.formatEther(bal)}
        bal1 ${hre.ethers.utils.formatEther(bal1)}
        bal2 ${hre.ethers.utils.formatEther(bal2)}
        bal3 ${hre.ethers.utils.formatEther(bal3)}
        poolBal ${hre.ethers.utils.formatEther(poolBal)}
        priorityFunds ${hre.ethers.utils.formatEther(priorityFunds)}
        process fund raise...
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(endTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(endTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        await this.vintageFundingPoolAdapterContract.processFundRaise(this.daoAddr1);
        const fundRaisingState = await this.vintageFundingPoolAdapterContract.daoFundRaisingStates(this.daoAddr1);
        poolBal = await this.vintageFundingPoolAdapterContract.poolBalance(this.daoAddr1);
        priorityFunds = await this.vintageFundingPoolAdapterContract.freeINPriorityDeposits(this.daoAddr1, fundRaiserProposalId);
        const currentFundCounter = await this.vintageFundRaiseAdapterContract.createdFundCounter(this.daoAddr1);
        let freeInEscrowFund1 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.owner.address);
        let freeInEscrowFund2 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.investor1.address);
        let freeInEscrowFund3 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user1.address);
        let freeInEscrowFund4 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user2.address);
        bal = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        bal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);
        bal2 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user1.address);
        bal3 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user2.address);
        console.log(`
        fund raising state ${fundRaisingState}
        poolBal ${hre.ethers.utils.formatEther(poolBal)}
        priorityFunds ${hre.ethers.utils.formatEther(priorityFunds)}
        freeInEscrowFund1 ${hre.ethers.utils.formatEther(freeInEscrowFund1[1])}
        freeInEscrowFund2 ${hre.ethers.utils.formatEther(freeInEscrowFund2[1])}
        freeInEscrowFund3 ${hre.ethers.utils.formatEther(freeInEscrowFund3[1])}
        freeInEscrowFund4 ${hre.ethers.utils.formatEther(freeInEscrowFund4[1])}
        bal ${hre.ethers.utils.formatEther(bal)}
        bal1 ${hre.ethers.utils.formatEther(bal1)}
        bal2 ${hre.ethers.utils.formatEther(bal2)}
        bal3 ${hre.ethers.utils.formatEther(bal3)}

        withdraw from free in fund escrow...
        `);

        await this.vintageFreeInEscrowFundAdapterContract.connect(this.owner).withdraw(this.daoAddr1, currentFundCounter);
        await this.vintageFreeInEscrowFundAdapterContract.connect(this.investor1).withdraw(this.daoAddr1, currentFundCounter);
        // await this.vintageFreeInEscrowFundAdapterContract.connect(this.user1).withdraw(this.daoAddr1, currentFundCounter);
        // await this.vintageFreeInEscrowFundAdapterContract.connect(this.user2).withdraw(this.daoAddr1, currentFundCounter);

        freeInEscrowFund1 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.owner.address);
        freeInEscrowFund2 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.investor1.address);
        freeInEscrowFund3 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user1.address);
        freeInEscrowFund4 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user2.address);

        console.log(`
        withdrawed...
        freeInEscrowFund1 ${hre.ethers.utils.formatEther(freeInEscrowFund1[1])}
        freeInEscrowFund2 ${hre.ethers.utils.formatEther(freeInEscrowFund2[1])}
        freeInEscrowFund3 ${hre.ethers.utils.formatEther(freeInEscrowFund3[1])}
        freeInEscrowFund4 ${hre.ethers.utils.formatEther(freeInEscrowFund4[1])}
        `);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(blocktimestamp) + endTime + fundTerm + returnPeriod + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        await this.vintageFundingPoolAdapterContract.clearFund(this.daoAddr1);
        console.log(`clear fund...`);
    });

    it("free in priority deposit membership - erc20", async () => {
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

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            returnTokenmanagementFeeRatio,
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


        const enalbePriorityDeposit = true;
        const vtype = 0; // 0 erc20 1 erc721 2 erc1155 3 whitelist
        const token = this.testtoken2.address;
        const tokenId = 0;
        const amount = hre.ethers.utils.parseEther("1000");
        const priorityDepositeWhitelist = [];
        const proposalPriorityDepositInfo = [
            enalbePriorityDeposit,
            vtype,
            token,
            tokenId,
            amount,
            priorityDepositeWhitelist
        ];

        const fundRaiseParams = [
            this.daoAddr1,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ],

        const fundRaiserProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams);
        const whitelistVal = await this.vintageFundRaiseAdapterContract.getWhiteList(this.daoAddr1, fundRaiserProposalId);

        await this.testtoken2.transfer(this.user1.address, hre.ethers.utils.parseEther("1000"));
        await this.testtoken2.transfer(this.user2.address, hre.ethers.utils.parseEther("1000"));

        const isPriorityDepositer1 = await this.vintageFundRaiseAdapterContract.isPriorityDepositer(this.daoAddr1, fundRaiserProposalId, this.user1.address);
        const isPriorityDepositer2 = await this.vintageFundRaiseAdapterContract.isPriorityDepositer(this.daoAddr1, fundRaiserProposalId, this.user2.address);

        console.log("whitelistVal ", whitelistVal);
        console.log(`
        fund raise proposal created ${fundRaiserProposalId}
        isPriorityDepositer1 ${isPriorityDepositer1}
        isPriorityDepositer2 ${isPriorityDepositer2}
        vote for proposal...
        `);

        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, fundRaiserProposalId, 1);

        let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, fundRaiserProposalId);
        const stopVoteTime = fundRaiseProposalInfo.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, fundRaiserProposalId);
        console.log(`
        voted. processing...
        state ${voteRel.state}  nbYes ${voteRel.nbYes}  nbNo ${voteRel.nbNo}
        process new fund proposal...
        `);
        await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr1, fundRaiserProposalId);

        //deposit
        await this.testtoken1.approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.investor1).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.user1).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.user2).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.transfer(this.user2.address, hre.ethers.utils.parseEther("200000"));

        console.log(`
        deposit...
        `);
        await this.vintageFundingPoolAdapterContract.deposit(this.daoAddr1, hre.ethers.utils.parseEther("16000"));
        await this.vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("11020"));
        await this.vintageFundingPoolAdapterContract.connect(this.user1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("3020"));
        await this.vintageFundingPoolAdapterContract.connect(this.user2).deposit(this.daoAddr1, hre.ethers.utils.parseEther("7020"));

        let bal = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        let bal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);
        let bal2 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user1.address);
        let bal3 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user2.address);

        let poolBal = await this.vintageFundingPoolAdapterContract.poolBalance(this.daoAddr1);
        let priorityFunds = await this.vintageFundingPoolAdapterContract.freeINPriorityDeposits(this.daoAddr1, fundRaiserProposalId);

        console.log(`
        bal ${hre.ethers.utils.formatEther(bal)}
        bal1 ${hre.ethers.utils.formatEther(bal1)}
        bal2 ${hre.ethers.utils.formatEther(bal2)}
        bal3 ${hre.ethers.utils.formatEther(bal3)}
        poolBal ${hre.ethers.utils.formatEther(poolBal)}
        priorityFunds ${hre.ethers.utils.formatEther(priorityFunds)}
        process fund raise...
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(endTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(endTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        await this.vintageFundingPoolAdapterContract.processFundRaise(this.daoAddr1);
        const fundRaisingState = await this.vintageFundingPoolAdapterContract.daoFundRaisingStates(this.daoAddr1);
        poolBal = await this.vintageFundingPoolAdapterContract.poolBalance(this.daoAddr1);
        priorityFunds = await this.vintageFundingPoolAdapterContract.freeINPriorityDeposits(this.daoAddr1, fundRaiserProposalId);
        const currentFundCounter = await this.vintageFundRaiseAdapterContract.createdFundCounter(this.daoAddr1);
        let freeInEscrowFund1 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.owner.address);
        let freeInEscrowFund2 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.investor1.address);
        let freeInEscrowFund3 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user1.address);
        let freeInEscrowFund4 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user2.address);
        bal = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        bal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);
        bal2 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user1.address);
        bal3 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user2.address);
        console.log(`
        fund raising state ${fundRaisingState}
        poolBal ${hre.ethers.utils.formatEther(poolBal)}
        priorityFunds ${hre.ethers.utils.formatEther(priorityFunds)}
        freeInEscrowFund1 ${hre.ethers.utils.formatEther(freeInEscrowFund1[1])}
        freeInEscrowFund2 ${hre.ethers.utils.formatEther(freeInEscrowFund2[1])}
        freeInEscrowFund3 ${hre.ethers.utils.formatEther(freeInEscrowFund3[1])}
        freeInEscrowFund4 ${hre.ethers.utils.formatEther(freeInEscrowFund4[1])}
        bal ${hre.ethers.utils.formatEther(bal)}
        bal1 ${hre.ethers.utils.formatEther(bal1)}
        bal2 ${hre.ethers.utils.formatEther(bal2)}
        bal3 ${hre.ethers.utils.formatEther(bal3)}

        withdraw from free in fund escrow...
        `);

        await this.vintageFreeInEscrowFundAdapterContract.connect(this.owner).withdraw(this.daoAddr1, currentFundCounter);
        await this.vintageFreeInEscrowFundAdapterContract.connect(this.investor1).withdraw(this.daoAddr1, currentFundCounter);
        // await this.vintageFreeInEscrowFundAdapterContract.connect(this.user1).withdraw(this.daoAddr1, currentFundCounter);
        // await this.vintageFreeInEscrowFundAdapterContract.connect(this.user2).withdraw(this.daoAddr1, currentFundCounter);

        freeInEscrowFund1 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.owner.address);
        freeInEscrowFund2 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.investor1.address);
        freeInEscrowFund3 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user1.address);
        freeInEscrowFund4 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user2.address);

        console.log(`
        withdrawed...
        freeInEscrowFund1 ${hre.ethers.utils.formatEther(freeInEscrowFund1[1])}
        freeInEscrowFund2 ${hre.ethers.utils.formatEther(freeInEscrowFund2[1])}
        freeInEscrowFund3 ${hre.ethers.utils.formatEther(freeInEscrowFund3[1])}
        freeInEscrowFund4 ${hre.ethers.utils.formatEther(freeInEscrowFund4[1])}
        `);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(blocktimestamp) + endTime + fundTerm + returnPeriod + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        await this.vintageFundingPoolAdapterContract.clearFund(this.daoAddr1);
        console.log(`clear fund...`);
    });

    it("free in priority deposit membership - erc721", async () => {
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

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            returnTokenmanagementFeeRatio,
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


        const enalbePriorityDeposit = true;
        const vtype = 1; // 0 erc20 1 erc721 2 erc1155 3 whitelist
        const token = this.testERC721.address;
        const tokenId = 0;
        const amount = 2;
        const priorityDepositeWhitelist = [];
        const proposalPriorityDepositInfo = [
            enalbePriorityDeposit,
            vtype,
            token,
            tokenId,
            amount,
            priorityDepositeWhitelist
        ];

        const fundRaiseParams = [
            this.daoAddr1,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ],

        const fundRaiserProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams);
        const whitelistVal = await this.vintageFundRaiseAdapterContract.getWhiteList(this.daoAddr1, fundRaiserProposalId);

        await this.testERC721.mintPixel(this.user1.address, 0, 0);
        await this.testERC721.mintPixel(this.user1.address, 0, 1);
        await this.testERC721.mintPixel(this.user2.address, 0, 2);
        await this.testERC721.mintPixel(this.user2.address, 0, 3);

        const isPriorityDepositer1 = await this.vintageFundRaiseAdapterContract.isPriorityDepositer(this.daoAddr1, fundRaiserProposalId, this.user1.address);
        const isPriorityDepositer2 = await this.vintageFundRaiseAdapterContract.isPriorityDepositer(this.daoAddr1, fundRaiserProposalId, this.user2.address);

        console.log("whitelistVal ", whitelistVal);
        console.log(`
        fund raise proposal created ${fundRaiserProposalId}
        isPriorityDepositer1 ${isPriorityDepositer1}
        isPriorityDepositer2 ${isPriorityDepositer2}
        vote for proposal...
        `);

        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, fundRaiserProposalId, 1);

        let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, fundRaiserProposalId);
        const stopVoteTime = fundRaiseProposalInfo.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, fundRaiserProposalId);
        console.log(`
        voted. processing...
        state ${voteRel.state}  nbYes ${voteRel.nbYes}  nbNo ${voteRel.nbNo}
        process new fund proposal...
        `);
        await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr1, fundRaiserProposalId);

        //deposit
        await this.testtoken1.approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.investor1).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.user1).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.user2).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.transfer(this.user2.address, hre.ethers.utils.parseEther("200000"));

        console.log(`
        deposit...
        `);
        await this.vintageFundingPoolAdapterContract.deposit(this.daoAddr1, hre.ethers.utils.parseEther("16000"));
        await this.vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("11020"));
        await this.vintageFundingPoolAdapterContract.connect(this.user1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("3020"));
        await this.vintageFundingPoolAdapterContract.connect(this.user2).deposit(this.daoAddr1, hre.ethers.utils.parseEther("7020"));

        let bal = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        let bal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);
        let bal2 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user1.address);
        let bal3 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user2.address);

        let poolBal = await this.vintageFundingPoolAdapterContract.poolBalance(this.daoAddr1);
        let priorityFunds = await this.vintageFundingPoolAdapterContract.freeINPriorityDeposits(this.daoAddr1, fundRaiserProposalId);

        console.log(`
        bal ${hre.ethers.utils.formatEther(bal)}
        bal1 ${hre.ethers.utils.formatEther(bal1)}
        bal2 ${hre.ethers.utils.formatEther(bal2)}
        bal3 ${hre.ethers.utils.formatEther(bal3)}
        poolBal ${hre.ethers.utils.formatEther(poolBal)}
        priorityFunds ${hre.ethers.utils.formatEther(priorityFunds)}
        process fund raise...
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(endTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(endTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        await this.vintageFundingPoolAdapterContract.processFundRaise(this.daoAddr1);
        const fundRaisingState = await this.vintageFundingPoolAdapterContract.daoFundRaisingStates(this.daoAddr1);
        poolBal = await this.vintageFundingPoolAdapterContract.poolBalance(this.daoAddr1);
        priorityFunds = await this.vintageFundingPoolAdapterContract.freeINPriorityDeposits(this.daoAddr1, fundRaiserProposalId);
        const currentFundCounter = await this.vintageFundRaiseAdapterContract.createdFundCounter(this.daoAddr1);
        let freeInEscrowFund1 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.owner.address);
        let freeInEscrowFund2 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.investor1.address);
        let freeInEscrowFund3 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user1.address);
        let freeInEscrowFund4 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user2.address);
        bal = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        bal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);
        bal2 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user1.address);
        bal3 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user2.address);
        console.log(`
        fund raising state ${fundRaisingState}
        poolBal ${hre.ethers.utils.formatEther(poolBal)}
        priorityFunds ${hre.ethers.utils.formatEther(priorityFunds)}
        freeInEscrowFund1 ${hre.ethers.utils.formatEther(freeInEscrowFund1[1])}
        freeInEscrowFund2 ${hre.ethers.utils.formatEther(freeInEscrowFund2[1])}
        freeInEscrowFund3 ${hre.ethers.utils.formatEther(freeInEscrowFund3[1])}
        freeInEscrowFund4 ${hre.ethers.utils.formatEther(freeInEscrowFund4[1])}
        bal ${hre.ethers.utils.formatEther(bal)}
        bal1 ${hre.ethers.utils.formatEther(bal1)}
        bal2 ${hre.ethers.utils.formatEther(bal2)}
        bal3 ${hre.ethers.utils.formatEther(bal3)}

        withdraw from free in fund escrow...
        `);

        await this.vintageFreeInEscrowFundAdapterContract.connect(this.owner).withdraw(this.daoAddr1, currentFundCounter);
        await this.vintageFreeInEscrowFundAdapterContract.connect(this.investor1).withdraw(this.daoAddr1, currentFundCounter);
        // await this.vintageFreeInEscrowFundAdapterContract.connect(this.user1).withdraw(this.daoAddr1, currentFundCounter);
        // await this.vintageFreeInEscrowFundAdapterContract.connect(this.user2).withdraw(this.daoAddr1, currentFundCounter);

        freeInEscrowFund1 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.owner.address);
        freeInEscrowFund2 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.investor1.address);
        freeInEscrowFund3 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user1.address);
        freeInEscrowFund4 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user2.address);

        console.log(`
        withdrawed...
        freeInEscrowFund1 ${hre.ethers.utils.formatEther(freeInEscrowFund1[1])}
        freeInEscrowFund2 ${hre.ethers.utils.formatEther(freeInEscrowFund2[1])}
        freeInEscrowFund3 ${hre.ethers.utils.formatEther(freeInEscrowFund3[1])}
        freeInEscrowFund4 ${hre.ethers.utils.formatEther(freeInEscrowFund4[1])}
        `);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(blocktimestamp) + endTime + fundTerm + returnPeriod + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        await this.vintageFundingPoolAdapterContract.clearFund(this.daoAddr1);
        console.log(`clear fund...`);
    });

    it("free in priority deposit membership - erc1155", async () => {
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

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            returnTokenmanagementFeeRatio,
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


        const enalbePriorityDeposit = true;
        const vtype = 2; // 0 erc20 1 erc721 2 erc1155 3 whitelist
        const token = this.testERC1155.address;
        const tokenId = 1;
        const amount = 2;
        const priorityDepositeWhitelist = [];
        const proposalPriorityDepositInfo = [
            enalbePriorityDeposit,
            vtype,
            token,
            tokenId,
            amount,
            priorityDepositeWhitelist
        ];

        const fundRaiseParams = [
            this.daoAddr1,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ],

        const fundRaiserProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams);
        const whitelistVal = await this.vintageFundRaiseAdapterContract.getWhiteList(this.daoAddr1, fundRaiserProposalId);

        await this.testERC1155.mint(this.user1.address, 1, 2, hexToBytes(toHex(2233)));
        await this.testERC1155.mint(this.user2.address, 1, 2, hexToBytes(toHex(2233)));

        const isPriorityDepositer1 = await this.vintageFundRaiseAdapterContract.isPriorityDepositer(this.daoAddr1, fundRaiserProposalId, this.user1.address);
        const isPriorityDepositer2 = await this.vintageFundRaiseAdapterContract.isPriorityDepositer(this.daoAddr1, fundRaiserProposalId, this.user2.address);

        console.log("whitelistVal ", whitelistVal);
        console.log(`
        fund raise proposal created ${fundRaiserProposalId}
        isPriorityDepositer1 ${isPriorityDepositer1}
        isPriorityDepositer2 ${isPriorityDepositer2}
        vote for proposal...
        `);

        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, fundRaiserProposalId, 1);

        let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, fundRaiserProposalId);
        const stopVoteTime = fundRaiseProposalInfo.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, fundRaiserProposalId);
        console.log(`
        voted. processing...
        state ${voteRel.state}  nbYes ${voteRel.nbYes}  nbNo ${voteRel.nbNo}
        process new fund proposal...
        `);
        await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr1, fundRaiserProposalId);

        //deposit
        await this.testtoken1.approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.investor1).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.user1).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.user2).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.transfer(this.user2.address, hre.ethers.utils.parseEther("200000"));

        console.log(`
        deposit...
        `);
        await this.vintageFundingPoolAdapterContract.deposit(this.daoAddr1, hre.ethers.utils.parseEther("16000"));
        await this.vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("11020"));
        await this.vintageFundingPoolAdapterContract.connect(this.user1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("3020"));
        await this.vintageFundingPoolAdapterContract.connect(this.user2).deposit(this.daoAddr1, hre.ethers.utils.parseEther("7020"));

        let bal = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        let bal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);
        let bal2 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user1.address);
        let bal3 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user2.address);

        let poolBal = await this.vintageFundingPoolAdapterContract.poolBalance(this.daoAddr1);
        let priorityFunds = await this.vintageFundingPoolAdapterContract.freeINPriorityDeposits(this.daoAddr1, fundRaiserProposalId);

        console.log(`
        bal ${hre.ethers.utils.formatEther(bal)}
        bal1 ${hre.ethers.utils.formatEther(bal1)}
        bal2 ${hre.ethers.utils.formatEther(bal2)}
        bal3 ${hre.ethers.utils.formatEther(bal3)}
        poolBal ${hre.ethers.utils.formatEther(poolBal)}
        priorityFunds ${hre.ethers.utils.formatEther(priorityFunds)}
        process fund raise...
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(endTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(endTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        await this.vintageFundingPoolAdapterContract.processFundRaise(this.daoAddr1);
        const fundRaisingState = await this.vintageFundingPoolAdapterContract.daoFundRaisingStates(this.daoAddr1);
        poolBal = await this.vintageFundingPoolAdapterContract.poolBalance(this.daoAddr1);
        priorityFunds = await this.vintageFundingPoolAdapterContract.freeINPriorityDeposits(this.daoAddr1, fundRaiserProposalId);
        const currentFundCounter = await this.vintageFundRaiseAdapterContract.createdFundCounter(this.daoAddr1);
        let freeInEscrowFund1 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.owner.address);
        let freeInEscrowFund2 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.investor1.address);
        let freeInEscrowFund3 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user1.address);
        let freeInEscrowFund4 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user2.address);
        bal = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        bal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);
        bal2 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user1.address);
        bal3 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user2.address);
        console.log(`
        fund raising state ${fundRaisingState}
        poolBal ${hre.ethers.utils.formatEther(poolBal)}
        priorityFunds ${hre.ethers.utils.formatEther(priorityFunds)}
        freeInEscrowFund1 ${hre.ethers.utils.formatEther(freeInEscrowFund1[1])}
        freeInEscrowFund2 ${hre.ethers.utils.formatEther(freeInEscrowFund2[1])}
        freeInEscrowFund3 ${hre.ethers.utils.formatEther(freeInEscrowFund3[1])}
        freeInEscrowFund4 ${hre.ethers.utils.formatEther(freeInEscrowFund4[1])}
        bal ${hre.ethers.utils.formatEther(bal)}
        bal1 ${hre.ethers.utils.formatEther(bal1)}
        bal2 ${hre.ethers.utils.formatEther(bal2)}
        bal3 ${hre.ethers.utils.formatEther(bal3)}

        withdraw from free in fund escrow...
        `);

        await this.vintageFreeInEscrowFundAdapterContract.connect(this.owner).withdraw(this.daoAddr1, currentFundCounter);
        await this.vintageFreeInEscrowFundAdapterContract.connect(this.investor1).withdraw(this.daoAddr1, currentFundCounter);
        // await this.vintageFreeInEscrowFundAdapterContract.connect(this.user1).withdraw(this.daoAddr1, currentFundCounter);
        // await this.vintageFreeInEscrowFundAdapterContract.connect(this.user2).withdraw(this.daoAddr1, currentFundCounter);

        freeInEscrowFund1 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.owner.address);
        freeInEscrowFund2 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.investor1.address);
        freeInEscrowFund3 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user1.address);
        freeInEscrowFund4 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user2.address);

        console.log(`
        withdrawed...
        freeInEscrowFund1 ${hre.ethers.utils.formatEther(freeInEscrowFund1[1])}
        freeInEscrowFund2 ${hre.ethers.utils.formatEther(freeInEscrowFund2[1])}
        freeInEscrowFund3 ${hre.ethers.utils.formatEther(freeInEscrowFund3[1])}
        freeInEscrowFund4 ${hre.ethers.utils.formatEther(freeInEscrowFund4[1])}
        `);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(blocktimestamp) + endTime + fundTerm + returnPeriod + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        await this.vintageFundingPoolAdapterContract.clearFund(this.daoAddr1);
        console.log(`clear fund...`);
    });

    it("free in priority deposit membership - whitelist", async () => {
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

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            returnTokenmanagementFeeRatio,
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

        const fundRaiseParams = [
            this.daoAddr1,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ],

        const fundRaiserProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams);
        const whitelistVal = await this.vintageFundRaiseAdapterContract.getWhiteList(this.daoAddr1, fundRaiserProposalId);

        const isPriorityDepositer1 = await this.vintageFundRaiseAdapterContract.isPriorityDepositer(this.daoAddr1, fundRaiserProposalId, this.user1.address);
        const isPriorityDepositer2 = await this.vintageFundRaiseAdapterContract.isPriorityDepositer(this.daoAddr1, fundRaiserProposalId, this.user2.address);

        console.log("whitelistVal ", whitelistVal);
        console.log(`
        fund raise proposal created ${fundRaiserProposalId}
        isPriorityDepositer1 ${isPriorityDepositer1}
        isPriorityDepositer2 ${isPriorityDepositer2}
        vote for proposal...
        `);

        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, fundRaiserProposalId, 1);

        let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, fundRaiserProposalId);
        const stopVoteTime = fundRaiseProposalInfo.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, fundRaiserProposalId);
        console.log(`
        voted. processing...
        state ${voteRel.state}  nbYes ${voteRel.nbYes}  nbNo ${voteRel.nbNo}
        process new fund proposal...
        `);
        await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr1, fundRaiserProposalId);

        //deposit
        await this.testtoken1.approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.investor1).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.user1).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.user2).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.transfer(this.user2.address, hre.ethers.utils.parseEther("200000"));

        console.log(`
        deposit...
        `);
        await this.vintageFundingPoolAdapterContract.deposit(this.daoAddr1, hre.ethers.utils.parseEther("16000"));
        await this.vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("11020"));
        await this.vintageFundingPoolAdapterContract.connect(this.user1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("3020"));
        await this.vintageFundingPoolAdapterContract.connect(this.user2).deposit(this.daoAddr1, hre.ethers.utils.parseEther("7020"));

        let bal = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        let bal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);
        let bal2 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user1.address);
        let bal3 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user2.address);

        let poolBal = await this.vintageFundingPoolAdapterContract.poolBalance(this.daoAddr1);
        let priorityFunds = await this.vintageFundingPoolAdapterContract.freeINPriorityDeposits(this.daoAddr1, fundRaiserProposalId);

        console.log(`
        bal ${hre.ethers.utils.formatEther(bal)}
        bal1 ${hre.ethers.utils.formatEther(bal1)}
        bal2 ${hre.ethers.utils.formatEther(bal2)}
        bal3 ${hre.ethers.utils.formatEther(bal3)}
        poolBal ${hre.ethers.utils.formatEther(poolBal)}
        priorityFunds ${hre.ethers.utils.formatEther(priorityFunds)}
        process fund raise...
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(endTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(endTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        await this.vintageFundingPoolAdapterContract.processFundRaise(this.daoAddr1);
        const fundRaisingState = await this.vintageFundingPoolAdapterContract.daoFundRaisingStates(this.daoAddr1);
        poolBal = await this.vintageFundingPoolAdapterContract.poolBalance(this.daoAddr1);
        priorityFunds = await this.vintageFundingPoolAdapterContract.freeINPriorityDeposits(this.daoAddr1, fundRaiserProposalId);
        const currentFundCounter = await this.vintageFundRaiseAdapterContract.createdFundCounter(this.daoAddr1);
        let freeInEscrowFund1 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.owner.address);
        let freeInEscrowFund2 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.investor1.address);
        let freeInEscrowFund3 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user1.address);
        let freeInEscrowFund4 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user2.address);
        bal = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        bal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);
        bal2 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user1.address);
        bal3 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user2.address);
        console.log(`
        fund raising state ${fundRaisingState}
        poolBal ${hre.ethers.utils.formatEther(poolBal)}
        priorityFunds ${hre.ethers.utils.formatEther(priorityFunds)}
        freeInEscrowFund1 ${hre.ethers.utils.formatEther(freeInEscrowFund1[1])}
        freeInEscrowFund2 ${hre.ethers.utils.formatEther(freeInEscrowFund2[1])}
        freeInEscrowFund3 ${hre.ethers.utils.formatEther(freeInEscrowFund3[1])}
        freeInEscrowFund4 ${hre.ethers.utils.formatEther(freeInEscrowFund4[1])}
        bal ${hre.ethers.utils.formatEther(bal)}
        bal1 ${hre.ethers.utils.formatEther(bal1)}
        bal2 ${hre.ethers.utils.formatEther(bal2)}
        bal3 ${hre.ethers.utils.formatEther(bal3)}

        withdraw from free in fund escrow...
        `);

        await this.vintageFreeInEscrowFundAdapterContract.connect(this.owner).withdraw(this.daoAddr1, currentFundCounter);
        await this.vintageFreeInEscrowFundAdapterContract.connect(this.investor1).withdraw(this.daoAddr1, currentFundCounter);
        // await this.vintageFreeInEscrowFundAdapterContract.connect(this.user1).withdraw(this.daoAddr1, currentFundCounter);
        // await this.vintageFreeInEscrowFundAdapterContract.connect(this.user2).withdraw(this.daoAddr1, currentFundCounter);

        freeInEscrowFund1 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.owner.address);
        freeInEscrowFund2 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.investor1.address);
        freeInEscrowFund3 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user1.address);
        freeInEscrowFund4 = await this.vintageFreeInEscrowFundAdapterContract.getEscrowAmount(this.daoAddr1, currentFundCounter, this.user2.address);

        console.log(`
        withdrawed...
        freeInEscrowFund1 ${hre.ethers.utils.formatEther(freeInEscrowFund1[1])}
        freeInEscrowFund2 ${hre.ethers.utils.formatEther(freeInEscrowFund2[1])}
        freeInEscrowFund3 ${hre.ethers.utils.formatEther(freeInEscrowFund3[1])}
        freeInEscrowFund4 ${hre.ethers.utils.formatEther(freeInEscrowFund4[1])}
        `);

        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(blocktimestamp) + endTime + fundTerm + returnPeriod + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        await this.vintageFundingPoolAdapterContract.clearFund(this.daoAddr1);
        console.log(`clear fund...`);
    });
});

describe("participant cap...", () => {

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
        this.vintageVestingERC721Contract = this.utilContracts.vintageVestingERC721.instance;

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
        const vintageDaoParams1 = [
            _daoName1,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo1,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers,
            allocations
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

    const createFundRaiseProposal = async (vintageFundRaiseAdapterContract, params) => {
        const tx = await vintageFundRaiseAdapterContract.submitProposal(params);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        return proposalId;
    }

    it("participant cap enable...", async () => {

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

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.001"); //0.4%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            returnTokenmanagementFeeRatio,
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

        const fundRaiseParams = [
            this.daoAddr1,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ],

        const fundRaiserProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams);
        const whitelistVal = await this.vintageFundRaiseAdapterContract.getWhiteList(this.daoAddr1, fundRaiserProposalId);
        console.log("whitelistVal ", whitelistVal);
        console.log(`
        fund raise proposal created ${fundRaiserProposalId}
        vote for proposal...
        `);

        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, fundRaiserProposalId, 1);

        let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, fundRaiserProposalId);
        const stopVoteTime = fundRaiseProposalInfo.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, fundRaiserProposalId);
        console.log(`
        voted. processing...
        state ${voteRel.state}  nbYes ${voteRel.nbYes}  nbNo ${voteRel.nbNo}
        process new fund proposal...
        `);
        await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr1, fundRaiserProposalId);

        //deposit
        await this.testtoken1.approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.investor1).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.user1).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.user2).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.genesis_raiser1).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.connect(this.genesis_raiser2).approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.transfer(this.user2.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.transfer(this.genesis_raiser1.address, hre.ethers.utils.parseEther("200000"));
        await this.testtoken1.transfer(this.genesis_raiser2.address, hre.ethers.utils.parseEther("200000"));

        console.log(`
        deposit...
        `);
        await this.vintageFundingPoolAdapterContract.deposit(this.daoAddr1, hre.ethers.utils.parseEther("26000"));
        await this.vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("20020"));
        await this.vintageFundingPoolAdapterContract.connect(this.investor1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("1000"));
        // await this.vintageFundingPoolAdapterContract.connect(this.investor1).withdraw(this.daoAddr1, hre.ethers.utils.parseEther("21020"));
        await this.vintageFundingPoolAdapterContract.connect(this.user1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("20020"));
        await this.vintageFundingPoolAdapterContract.connect(this.genesis_raiser1).deposit(this.daoAddr1, hre.ethers.utils.parseEther("10000"));
        await this.vintageFundingPoolAdapterContract.connect(this.genesis_raiser2).deposit(this.daoAddr1, hre.ethers.utils.parseEther("10000"));

        await expectRevert(this.vintageFundingPoolAdapterContract.connect(this.user2).deposit(this.daoAddr1, hre.ethers.utils.parseEther("10000")), "revert");


        let isGovernor1 = await this.dao1Contract.isMember(this.owner.address);
        let isGovernor2 = await this.dao1Contract.isMember(this.investor1.address);
        let isGovernor3 = await this.dao1Contract.isMember(this.user1.address);
        let isGovernor6 = await this.dao1Contract.isMember(this.user2.address);
        let isGovernor4 = await this.dao1Contract.isMember(this.genesis_raiser1.address);
        let isGovernor5 = await this.dao1Contract.isMember(this.genesis_raiser2.address);


        const fundCounter = await this.vintageFundRaiseAdapterContract.createdFundCounter(this.daoAddr1);
        let allInvestors = await this.vintageFundingPoolAdapterContract.getFundInvestors(this.daoAddr1, fundCounter);
        console.log(`
        isGovernor1 ${isGovernor1}
        isGovernor2 ${isGovernor2}
        isGovernor3 ${isGovernor3}
        isGovernor4 ${isGovernor4}
        isGovernor5 ${isGovernor5}
        isGovernor6 ${isGovernor6}

        allInvestors ${allInvestors}
        `);
        // await expectRevert(this.vintageFundingPoolAdapterContract.connect(this.user2).deposit(this.daoAddr1, hre.ethers.utils.parseEther("20020")), "revert");

        let bal = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        let bal1 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.investor1.address);
        let bal2 = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.user1.address);

        let poolBal = await this.vintageFundingPoolAdapterContract.poolBalance(this.daoAddr1);

        console.log(`
        deposited ${hre.ethers.utils.formatEther(bal)}
        deposited ${hre.ethers.utils.formatEther(bal1)}
        deposited ${hre.ethers.utils.formatEther(bal2)}

        poolBal ${hre.ethers.utils.formatEther(poolBal)}

        withdraw during fund rasing...
        `);

    });

});

describe("return token management fee...", () => {

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
        this.vintageVestingERC721Contract = this.utilContracts.vintageVestingERC721.instance;

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
        const vintageDaoParams1 = [
            _daoName1,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo1,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers,
            allocations
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

    const createFundRaiseProposal = async (vintageFundRaiseAdapterContract, params) => {
        const tx = await vintageFundRaiseAdapterContract.submitProposal(params);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        return proposalId;
    }

    it("varify return token management fee...", async () => {
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

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.001"); //0.1%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            returnTokenmanagementFeeRatio,
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

        const fundRaiseParams = [
            this.daoAddr1,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ],

        const fundRaiserProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams);
        const whitelistVal = await this.vintageFundRaiseAdapterContract.getWhiteList(this.daoAddr1, fundRaiserProposalId);
        console.log("whitelistVal ", whitelistVal);
        console.log(`
        fund raise proposal created ${fundRaiserProposalId}
        vote for proposal...
        `);

        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, fundRaiserProposalId, 1);

        let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, fundRaiserProposalId);
        const stopVoteTime = fundRaiseProposalInfo.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, fundRaiserProposalId);
        console.log(`
        voted. processing...
        state ${voteRel.state}  nbYes ${voteRel.nbYes}  nbNo ${voteRel.nbNo}
        process new fund proposal...
        `);
        await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr1, fundRaiserProposalId);

        //deposit
        await this.testtoken1.approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));

        console.log(`
        deposit...
        `);
        await this.vintageFundingPoolAdapterContract.deposit(this.daoAddr1, hre.ethers.utils.parseEther("26000"));

        const fundCounter = await this.vintageFundRaiseAdapterContract.createdFundCounter(this.daoAddr1);
        let allInvestors = await this.vintageFundingPoolAdapterContract.getFundInvestors(this.daoAddr1, fundCounter);
        console.log(`
        allInvestors ${allInvestors}
        `);

        let bal = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        let poolBal = await this.vintageFundingPoolAdapterContract.poolBalance(this.daoAddr1);

        console.log(`
        deposited ${hre.ethers.utils.formatEther(bal)}

        poolBal ${hre.ethers.utils.formatEther(poolBal)}
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(endTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(endTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        await this.vintageFundingPoolAdapterContract.processFundRaise(this.daoAddr1);



        // Submit funding proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("2000");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const vestingStartTime = blocktimestamp + 24;
        const vetingEndTime = vestingStartTime + 60 * 60 * 2;
        const vestingCliffEndTime = vestingStartTime + 60 * 60 * 1;
        const vestingInterval = 60 * 10;

        const vestingCliffLockAmount = hre.ethers.utils.parseEther("0.3");

        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = this.testtoken2.address;
        const GPAddr = this.user1.address;
        const DaoSquareAddr = await vintageFundingAdapterContract.protocolAddress();

        const fundRaiseEndTime = await this.vintageFundingPoolAdapterHelperContract.getFundRaiseWindowCloseTime(this.daoAddr1);
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let fundRaiseState = await vintageFundingPoolAdapterContract.daoFundRaisingStates(this.daoAddr1);
        let vp = await vintageVotingAdapterContract.getVotingWeight(this.daoAddr1, this.investor1.address);
        console.log(`
         fund raise state ${fundRaiseState}
         investor1 voting power ${vp}
         `);

        const approver = this.owner.address;
        const escrow = true;
        const price = hre.ethers.utils.parseEther("0.3");

        const receiver = this.project_team1.address;
        console.log(`
         receiver ${receiver}
         approver ${approver}
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
            approver,
            false,
            ZERO_ADDRESS
        ];

        const vestingInfo = [
            "vesting name",
            "vesting description",
            vestingStartTime,
            vetingEndTime,
            vestingCliffEndTime,
            vestingCliffLockAmount,
            vestingInterval
        ];
        const params = [fundingInfo, returnTokenInfo, vestingInfo];

        const proposer = this.genesis_raiser1;

        let frontProposaId = await vintageFundingAdapterContract.getFrontProposalId(this.daoAddr1);
        let queueLength = await vintageFundingAdapterContract.getQueueLength(this.daoAddr1);
        console.log(`
         frontProposalId ${frontProposaId}
         queueLen ${queueLength}
         `);
        let proposalId = await createFundingProposal(
            vintageFundingAdapterContract,
            proposer,
            this.daoAddr1,
            params
        );

        console.log(`
         new funding proposalId: ${proposalId}
         `);
        this.proposalId = proposalId;
        frontProposaId = await vintageFundingAdapterContract.getFrontProposalId(this.daoAddr1);
        queueLength = await vintageFundingAdapterContract.getQueueLength(this.daoAddr1);
        console.log(`
         queueLength ${queueLength}
         frontProposaId ${frontProposaId}
         approve return token...
         start voting...
         `);

        await this.testtoken2.approve(this.vintageFundingReturnTokenAdapterContract.address, requestedFundAmount.mul(hre.ethers.utils.parseEther("1")).div(price));

        await this.vintageFundingReturnTokenAdapterContract.setFundingApprove(
            this.daoAddr1,
            proposalId,
            this.testtoken2.address,
            requestedFundAmount.mul(hre.ethers.utils.parseEther("1")).div(price)
        );
        let approvalAmount = await this.vintageFundingReturnTokenAdapterContract.approvedInfos(this.daoAddr1, proposalId, approver, this.testtoken2.address);
        let fundingProposalInfo = await vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId);
        let allowance = await this.testtoken2.allowance(this.owner.address, this.vintageFundingReturnTokenAdapterContract.address);
        console.log(`
             approver ${fundingProposalInfo.proposalPaybackTokenInfo.approveOwnerAddr}
             paybackTokenAmount: ${hre.ethers.utils.formatEther(fundingProposalInfo.proposalPaybackTokenInfo.paybackTokenAmount)}
             approvalAmount ${hre.ethers.utils.formatEther(approvalAmount)}
             allowance ${allowance}
             `);

        await vintageFundingAdapterContract.startVotingProcess(this.daoAddr1, proposalId);
        fundingProposalInfo = await vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId);

        console.log(`
         funding proposal state ${fundingProposalInfo.status}
         paybackTokenAmount: ${hre.ethers.utils.formatEther(fundingProposalInfo.proposalPaybackTokenInfo.paybackTokenAmount)}
         escrow ${fundingProposalInfo.proposalPaybackTokenInfo.escrow}
         totalFundAmount ${hre.ethers.utils.formatEther(fundingProposalInfo.totalAmount)}
         approver ${fundingProposalInfo.proposalPaybackTokenInfo.approveOwnerAddr}
         voting...
         `);

        await vintageVotingAdapterContract.submitVote(this.daoAddr1, proposalId, 1);
        await vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, proposalId, 1);
        await vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, proposalId, 1);

        fundingProposalInfo = await vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundingProposalInfo.proposalTimeInfo.proposalStopVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        const rel = await vintageVotingAdapterContract.voteResult(this.daoAddr1, proposalId);
        console.log(`voting reuslt ${rel.state}`);

        let protocolAddressBal = await this.testtoken1.balanceOf(DaoSquareAddr);
        let gpAddressBal = await this.testtoken1.balanceOf(GPAddr);
        let gpReturnTokenBal = await this.testtoken2.balanceOf(GPAddr);
        let proposerBal = await this.testtoken1.balanceOf(proposer.address);
        let receiverBal = await this.testtoken1.balanceOf(this.project_team1.address);
        console.log(`
         protocolAddressBal ${hre.ethers.utils.formatEther(protocolAddressBal)}
         gpAddressBal ${hre.ethers.utils.formatEther(gpAddressBal)}
         gpReturnTokenBal ${hre.ethers.utils.formatEther(gpReturnTokenBal)}
         proposerBal ${hre.ethers.utils.formatEther(proposerBal)}
         receiverBal ${hre.ethers.utils.formatEther(receiverBal)}
         `)

        console.log(`
         process funding proposal...
         `);
        await vintageFundingAdapterContract.processProposal(this.daoAddr1, proposalId);

        await vintageVesting.createVesting(this.daoAddr1, this.owner.address, proposalId);
        await vintageVesting.connect(this.user1).createVesting(this.daoAddr1, this.user1.address, proposalId);
        await vintageVesting.connect(this.genesis_raiser1).createVesting(this.daoAddr1, this.genesis_raiser1.address, proposalId);


        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(vetingEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(vetingEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }


        await vintageVesting.withdraw(this.daoAddr1, 1);
        await vintageVesting.connect(this.user1).withdraw(this.daoAddr1, 2);
        await vintageVesting.connect(this.genesis_raiser1).withdraw(this.daoAddr1, 3);

        gpReturnTokenBal = await this.testtoken2.balanceOf(GPAddr);
        let proposerReturnTokenBal = await this.testtoken2.balanceOf(proposer.address);

        console.log(`
        gpReturnTokenBal ${hre.ethers.utils.formatEther(gpReturnTokenBal)}
        proposerReturnTokenBal ${hre.ethers.utils.formatEther(proposerReturnTokenBal)}
        `);
    });

});

describe("funding proposal start voting at refund period...", () => {

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
        this.vintageVestingERC721Contract = this.utilContracts.vintageVestingERC721.instance;

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
        const vintageDaoParams1 = [
            _daoName1,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo1,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers,
            allocations
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

    const createFundRaiseProposal = async (vintageFundRaiseAdapterContract, params) => {
        const tx = await vintageFundRaiseAdapterContract.submitProposal(params);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        return proposalId;
    }

    it("test start voting during refund period...", async () => {
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

        const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
        const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.001"); //0.1%

        const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
        const proposalFeeInfo = [
            managementFeeRatio,
            returnTokenmanagementFeeRatio,
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

        const fundRaiseParams = [
            this.daoAddr1,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ],

        const fundRaiserProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, fundRaiseParams);
        const whitelistVal = await this.vintageFundRaiseAdapterContract.getWhiteList(this.daoAddr1, fundRaiserProposalId);
        console.log("whitelistVal ", whitelistVal);
        console.log(`
        fund raise proposal created ${fundRaiserProposalId}
        vote for proposal...
        `);

        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, fundRaiserProposalId, 1);
        await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, fundRaiserProposalId, 1);

        let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, fundRaiserProposalId);
        const stopVoteTime = fundRaiseProposalInfo.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        const voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, fundRaiserProposalId);
        console.log(`
        voted. processing...
        state ${voteRel.state}  nbYes ${voteRel.nbYes}  nbNo ${voteRel.nbNo}
        process new fund proposal...
        `);
        await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr1, fundRaiserProposalId);
        const fundStartTime = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const refundTime = parseInt(fundStartTime) + parseInt(fundTerm);
        //deposit
        await this.testtoken1.approve(this.vintageFundingPoolAdapterContract.address, hre.ethers.utils.parseEther("200000"));

        console.log(`
        deposit...
        `);
        await this.vintageFundingPoolAdapterContract.deposit(this.daoAddr1, hre.ethers.utils.parseEther("26000"));

        const fundCounter = await this.vintageFundRaiseAdapterContract.createdFundCounter(this.daoAddr1);
        let allInvestors = await this.vintageFundingPoolAdapterContract.getFundInvestors(this.daoAddr1, fundCounter);
        console.log(`
        allInvestors ${allInvestors}
        `);

        let bal = await this.vintageFundingPoolAdapterContract.balanceOf(this.daoAddr1, this.owner.address);
        let poolBal = await this.vintageFundingPoolAdapterContract.poolBalance(this.daoAddr1);

        console.log(`
        deposited ${hre.ethers.utils.formatEther(bal)}

        poolBal ${hre.ethers.utils.formatEther(poolBal)}
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(endTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(endTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        await this.vintageFundingPoolAdapterContract.processFundRaise(this.daoAddr1);



        // Submit funding proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("2000");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const vestingStartTime = blocktimestamp + 24;
        const vetingEndTime = vestingStartTime + 60 * 60 * 2;
        const vestingCliffEndTime = vestingStartTime + 60 * 60 * 1;
        const vestingInterval = 60 * 10;

        const vestingCliffLockAmount = hre.ethers.utils.parseEther("0.3");

        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = this.testtoken2.address;
        const GPAddr = this.user1.address;
        const DaoSquareAddr = await vintageFundingAdapterContract.protocolAddress();

        const fundRaiseEndTime = await this.vintageFundingPoolAdapterHelperContract.getFundRaiseWindowCloseTime(this.daoAddr1);
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let fundRaiseState = await vintageFundingPoolAdapterContract.daoFundRaisingStates(this.daoAddr1);
        let vp = await vintageVotingAdapterContract.getVotingWeight(this.daoAddr1, this.investor1.address);
        console.log(`
         fund raise state ${fundRaiseState}
         investor1 voting power ${vp}
         `);

        const approver = this.owner.address;
        const escrow = true;
        const price = hre.ethers.utils.parseEther("0.3");

        const receiver = this.project_team1.address;
        console.log(`
         receiver ${receiver}
         approver ${approver}
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
            approver,
            false,
            ZERO_ADDRESS
        ];

        const vestingInfo = [
            "vesting name",
            "vesting description",
            vestingStartTime,
            vetingEndTime,
            vestingCliffEndTime,
            vestingCliffLockAmount,
            vestingInterval
        ];
        const params = [fundingInfo, returnTokenInfo, vestingInfo];

        const proposer = this.genesis_raiser1;

        let frontProposaId = await vintageFundingAdapterContract.getFrontProposalId(this.daoAddr1);
        let queueLength = await vintageFundingAdapterContract.getQueueLength(this.daoAddr1);
        console.log(`
         frontProposalId ${frontProposaId}
         queueLen ${queueLength}
         `);
        let proposalId = await createFundingProposal(
            vintageFundingAdapterContract,
            proposer,
            this.daoAddr1,
            params
        );

        console.log(`
         new funding proposalId: ${proposalId}
         `);
        this.proposalId = proposalId;
        frontProposaId = await vintageFundingAdapterContract.getFrontProposalId(this.daoAddr1);
        queueLength = await vintageFundingAdapterContract.getQueueLength(this.daoAddr1);
        console.log(`
         queueLength ${queueLength}
         frontProposaId ${frontProposaId}
         approve return token...
         start voting...
         `);

        await this.testtoken2.approve(this.vintageFundingReturnTokenAdapterContract.address, requestedFundAmount.mul(hre.ethers.utils.parseEther("1")).div(price));

        await this.vintageFundingReturnTokenAdapterContract.setFundingApprove(
            this.daoAddr1,
            proposalId,
            this.testtoken2.address,
            requestedFundAmount.mul(hre.ethers.utils.parseEther("1")).div(price)
        );
        let approvalAmount = await this.vintageFundingReturnTokenAdapterContract.approvedInfos(this.daoAddr1, proposalId, approver, this.testtoken2.address);
        let fundingProposalInfo = await vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId);
        let allowance = await this.testtoken2.allowance(this.owner.address, this.vintageFundingReturnTokenAdapterContract.address);
        console.log(`
             approver ${fundingProposalInfo.proposalPaybackTokenInfo.approveOwnerAddr}
             paybackTokenAmount: ${hre.ethers.utils.formatEther(fundingProposalInfo.proposalPaybackTokenInfo.paybackTokenAmount)}
             approvalAmount ${hre.ethers.utils.formatEther(approvalAmount)}
             allowance ${allowance}
             `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const fundingstopVoteTime = parseInt(blocktimestamp) + 60 * 10;
        const fundEndTime = await this.vintageFundingPoolAdapterHelperContract.getFundEndTime(this.daoAddr1);

        if (fundingstopVoteTime + 60 * 10 < parseInt(fundEndTime)) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundEndTime) - 600 * 2 + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        await vintageFundingAdapterContract.startVotingProcess(this.daoAddr1, proposalId);
        fundingProposalInfo = await vintageFundingAdapterContract.proposals(this.daoAddr1, proposalId);
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        expect(fundingProposalInfo.status == 4, true);
        console.log(`
         blocktimestamp ${blocktimestamp}
         fundEndTime ${fundEndTime}
         funding proposal state ${fundingProposalInfo.status}
         paybackTokenAmount: ${hre.ethers.utils.formatEther(fundingProposalInfo.proposalPaybackTokenInfo.paybackTokenAmount)}
         escrow ${fundingProposalInfo.proposalPaybackTokenInfo.escrow}
         totalFundAmount ${hre.ethers.utils.formatEther(fundingProposalInfo.totalAmount)}
         approver ${fundingProposalInfo.proposalPaybackTokenInfo.approveOwnerAddr}
         voting...
         `);

    });

});

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
        this.vintageVestingERC721Contract = this.utilContracts.vintageVestingERC721.instance;

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
        const vintageDaoParams1 = [
            _daoName1,
            creator,
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            vintageDaoParticipantCapInfo,
            vintageDaoBackerMembershipInfo1,
            vintageDaoRaiserMembershipInfo1,
            vintageDaoVotingInfo1,
            vintageDaoGenesisRaisers,
            allocations
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

    it("create daoset participant cap proposal...", async () => {
        const enable = true;
        const cap = 5;
        const tx = await this.vintageDaoSetAdapterContract.submitInvestorCapProposal(this.daoAddr1, enable, cap);

        const rel = await tx.wait();

        const proposalId = rel.events[rel.events.length - 1].args.proposalId
        const proposal = await this.vintageDaoSetAdapterContract.investorCapProposals(
            this.daoAddr1,
            proposalId);

        console.log(proposal);
        await expectRevert(this.vintageDaoSetAdapterContract.submitInvestorCapProposal(this.daoAddr1, enable, cap), "revert");


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

        await expectRevert(createFundRaiseProposal(this.vintageFundRaiseAdapterContract, this.owner, fundRaiseParams), "revert");

        console.log("voting...");
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, proposalId, 1);
        await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, proposalId, 1);

        let ProposalInfo = await this.vintageDaoSetAdapterContract.investorCapProposals(this.daoAddr1, proposalId);
        let stopVoteTime = ProposalInfo.stopVoteTime;

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
        await this.vintageDaoSetAdapterContract.processInvestorCapProposal(this.daoAddr1, proposalId);

        ProposalInfo = await this.vintageDaoSetAdapterContract.investorCapProposals(this.daoAddr1, proposalId);

        console.log(`
        executed...
        proposal state ${ProposalInfo.state}
        `);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        startTime = blocktimestamp + 60 * 1;
        endTime = startTime + 60 * 60 * 2;

        proposalTimeInfo = [
            startTime,
            endTime,
            fundTerm,
            redemptPeriod,
            redemptInterval,
            returnPeriod
        ];

        fundRaiseParams = [
            this.daoAddr1,
            proposalFundRaiseInfo,
            proposalTimeInfo,
            proposalFeeInfo,
            proposalAddressInfo,
            proposerReward,
            proposalPriorityDepositInfo
        ];

        await expectRevert(createFundRaiseProposal(this.vintageFundRaiseAdapterContract, this.user1, fundRaiseParams), "revert");
        const newFundProposalId = await createFundRaiseProposal(this.vintageFundRaiseAdapterContract, this.genesis_raiser1, fundRaiseParams);

        console.log(`
        new fund proposal created...
        proposalId ${newFundProposalId}
        vote for new fund proposal...
        `);

        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, newFundProposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, newFundProposalId, 1);
        await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, newFundProposalId, 1);

        let fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, newFundProposalId);
        stopVoteTime = fundRaiseProposalInfo.stopVoteTime;

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        voteRel = await this.vintageVotingAdapterContract.voteResult(this.daoAddr1, newFundProposalId);
        console.log(`
        voted. processing...
        vote result ${voteRel.state}  nbYes ${voteRel.nbYes}  nbNo ${voteRel.nbNo}
        process new fund proposal...
        `);
        await this.vintageFundRaiseAdapterContract.processProposal(this.daoAddr1, newFundProposalId);
        fundRaiseProposalInfo = await this.vintageFundRaiseAdapterContract.Proposals(this.daoAddr1, newFundProposalId);
        let fundState = await vintageFundingPoolAdapterContract.daoFundRaisingStates(this.daoAddr1);
        expect(fundRaiseProposalInfo.state == 2, true);
        expect(fundState == 1, true);

        console.log(`
        proposal state ${fundRaiseProposalInfo.state}
        fund State ${fundState}
        submit daoset proposal...
        `);
        await expectRevert(this.vintageDaoSetAdapterContract.submitInvestorCapProposal(this.daoAddr1, enable, cap), "revert");

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(fundRaiseProposalInfo.timesInfo.fundRaiseEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseProposalInfo.timesInfo.fundRaiseEndTime) + 1])
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }

        console.log(`
        process fund raising...
        `);

        await vintageFundingPoolAdapterContract.processFundRaise(this.daoAddr1);
        fundState = await vintageFundingPoolAdapterContract.daoFundRaisingStates(this.daoAddr1);
        expect(fundState == 3, true);
        console.log(`
        executed...
        fund State ${fundState}
        `);
        const refundEndTime = parseInt(fundRaiseProposalInfo.timesInfo.fundRaiseEndTime) +
            + parseInt(fundRaiseProposalInfo.timesInfo.refundDuration);
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (refundEndTime > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [refundEndTime + 1]);
            await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        }
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        console.log(`
        ${fundRaiseProposalInfo.timesInfo.fundRaiseEndTime}
        ${fundRaiseProposalInfo.timesInfo.refundDuration}
        refundEndTime ${refundEndTime}
        blocktimestamp ${blocktimestamp}
        `)

        await this.vintageDaoSetAdapterContract.submitInvestorCapProposal(this.daoAddr1, enable, cap);
        console.log(`
        dao set proposal created...
        `);

    });

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

    it("create daoset investor membership proposal...", async () => {
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

        await expectRevert(this.vintageDaoSetAdapterContract.submitInvestorMembershipProposal(
            params
        ), "revert");

        const rel = await tx.wait();

        const proposalId = rel.events[rel.events.length - 1].args.proposalId
        const proposal = await this.vintageDaoSetAdapterContract.investorMembershipProposals(
            this.daoAddr1,
            proposalId);

        const current_VINTAGE_INVESTOR_MEMBERSHIP_NAME = await await this.dao1Contract.getStringConfiguration(sha3("VINTAGE_INVESTOR_MEMBERSHIP_NAME"));

        console.log(proposal);
        console.log(`
        proposalId ${proposal.proposalId}
        current_VINTAGE_INVESTOR_MEMBERSHIP_NAME ${current_VINTAGE_INVESTOR_MEMBERSHIP_NAME}
        `);

        console.log("voting...");
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser1).submitVote(this.daoAddr1, proposalId, 1);
        await this.vintageVotingAdapterContract.connect(this.genesis_raiser2).submitVote(this.daoAddr1, proposalId, 1);
        await this.vintageVotingAdapterContract.submitVote(this.daoAddr1, proposalId, 1);

        let ProposalInfo = await this.vintageDaoSetAdapterContract.investorMembershipProposals(this.daoAddr1, proposalId);
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
        await this.vintageDaoSetAdapterContract.processInvestorMembershipProposal(this.daoAddr1, proposalId);
        ProposalInfo = await this.vintageDaoSetAdapterContract.investorMembershipProposals(this.daoAddr1, proposalId);
        const crmenable = await this.dao1Contract.getConfiguration(sha3("VINTAGE_INVESTOR_MEMBERSHIP_ENABLE"));
        const cvrmtype = await this.dao1Contract.getConfiguration(sha3("VINTAGE_INVESTOR_MEMBERSHIP_TYPE"));
        const cvrmamount = await this.dao1Contract.getConfiguration(sha3("VINTAGE_RAISER_MEMBERSHIP_MIN_HOLDING"));
        const cvrmtokenaddr = await this.dao1Contract.getAddressConfiguration(sha3("VINTAGE_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS"));
        const cvrmtokenid = await this.dao1Contract.getConfiguration(sha3("VINTAGE_INVESTOR_MEMBERSHIP_TOKENID"));
        const VINTAGE_INVESTOR_MEMBERSHIP_NAME = await await this.dao1Contract.getStringConfiguration(sha3("VINTAGE_INVESTOR_MEMBERSHIP_NAME"));
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
        VINTAGE_INVESTOR_MEMBERSHIP_NAME ${VINTAGE_INVESTOR_MEMBERSHIP_NAME}
        `);
    });

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

});