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

// import {
//     exec
// } from "child_process";
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
// import {
//     createDao
// } from "../utils/deployment-util1";
// import {
//     zeroPad
// } from "ethers/lib/utils";
// import {
//     boolean
// } from "hardhat/internal/core/params/argumentTypes";
// import {
//     deserialize
// } from "v8";
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
        this.flexDaoSetFeesAdapterContract = adapters.flexDaoSetFeesAdapterContract.instance;
        this.flexDaoSetGovernorMembershipAdapterContract = adapters.flexDaoSetGovernorMembershipAdapterContract.instance;
        this.flexDaoSetInvestorCapAdapterContract = adapters.flexDaoSetInvestorCapAdapterContract.instance;
        this.flexDaoSetInvestorMembershipAdapterContract = adapters.flexDaoSetInvestorMembershipAdapterContract.instance;
        this.flexDaoSetProposerMembershipAdapterContract = adapters.flexDaoSetProposerMembershipAdapterContract.instance;
        this.flexSetRiceReceiverProposalAdapterContract = adapters.flexSetRiceReceiverProposalAdapterContract.instance;

        // const FlexVestingERC721Helper = await hre.ethers.getContractFactory("FlexVestingERC721Helper");
        // const flexVestingERC721Helper = await FlexVestingERC721Helper.deploy();
        // await flexVestingERC721Helper.deployed();
        // this.flexVestingERC721Helper = flexVestingERC721Helper;

        // const FlexVestingERC721 = await hre.ethers.getContractFactory("FlexVestingERC721");
        // const flexVestingERC721 = await FlexVestingERC721.deploy(
        //     "DAOSquare Investment Receipt",
        //     "DIR",
        //     this.flexVesting.address,
        //     this.flexVestingERC721Helper.address
        // );
        // await flexVestingERC721.deployed();
        // this.flexVestingERC721 = flexVestingERC721;

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
            this.flexVesting.address,
            this.vestingERC721Helper.address
        );
        await vestingERC721.deployed();
        this.vestingERC721 = vestingERC721;


        this.bentoBoxV1 = adapters.bentoBoxV1.instance;
        // this.managing = this.adapters.managing.instance;
        this.summonDao = this.adapters.summonDao.instance;

        console.log(`
        owner address ${owner.address}
        ${this.flexStewardAllocation.address}
        `);
    });

    const sommonFlexDao = async (summonDaoContract, daoFactoryContract, flexDaoParams) => {
        let tx = await summonDaoContract.summonFlexDao(flexDaoParams);
        let result = await tx.wait();
        const daoAddr = await daoFactoryContract.getDaoAddress(flexDaoParams[flexDaoParams.length - 1].name);
        const daoName = await daoFactoryContract.daos(daoAddr);


        return {
            daoAddr: daoAddr,
            daoName: daoName
        };
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
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd', //FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35', //FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8', //FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c', //FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7', //FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610', //FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda', //FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 770
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753', //StewardMangement
                addr: this.flexStewardMangement.address,
                flags: 6338
            },
            {
                id: '0x37cbe06c1044f98864ea25736326bc1d488e24e5e23781ea2ad64c4069cb9e6e', //flexStewardAllocationAdapter
                addr: this.flexStewardAllocation.address,
                flags: 0
            },
            {
                id: '0x43f8439a5cef099d0d9a92b15a64e34ff49963bb29d65f63204eda6591b810a1', //flexFundingReturnTokenAdapter
                addr: this.flexFundingReturnTokenAdapterContract.address,
                flags: 0
            },
            {
                id: '0xeae11da953333a83b6467e2193334fb302549e1a42ad5797082aea1ab6be9120', //flexFreeInEscrowFundAdapterContract
                addr: this.flexFreeInEscrowFundAdapterContract.address,
                flags: 0
            },
            {
                id: '0xc8e81510cbc5ec7970040e233b001587da1ea4484a9f7b8710d3322429c2df23', //flexFundingHelperAdapterContract
                addr: this.flexFundingHelperAdapterContract.address,
                flags: 0
            },
            // {
            //     id: '0xe564b2da9fb62dadceed6d94ac5884ac5f464424e7be661d7d6181d49fa87b3f', //flexDaoSetAdapterContract
            //     addr: this.flexDaoSetAdapterContract.address,
            //     flags: 778242
            // },
            {
                id: '0xff9379b98b93eb3bd1fac62fd2258a7955d70d2d5279c40064145b6c9646df37', //flexDaoSetHelperAdapterContract
                addr: this.flexDaoSetHelperAdapterContract.address,
                flags: 8
            },
            {
                id: '0x5f0e8d109045653360289a7a02d5dc2a99e382006a42ef93f66de55ecff3176f',// flexDaoSetPollingAdapterContract
                addr: this.flexDaoSetPollingAdapterContract.address,
                flags: 262146
            },
            {
                id: '0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7',//flexDaoSetVotingAdapterContract
                addr: this.flexDaoSetVotingAdapterContract.address,
                flags: 65538
            },
            {
                id: '0xc6bb47f9566baa74b5032b5c10e5bf4a1e2382ca337c2de674732f6401d52cc0',//flexDaoSetFeesAdapterContract
                addr: this.flexDaoSetFeesAdapterContract.address,
                flags: 131074
            },
            {
                id: '0x869e5d18913d4e9bb387c730a04b58d11e95102194f7217a4b684f6e61dff920',//flexDaoSetGovernorMembershipAdapterContract
                addr: this.flexDaoSetGovernorMembershipAdapterContract.address,
                flags: 16386
            },
            {
                id: '0x08f2d2eeda0c9072cdba8b58d442503b4cf9eb6c2f74d75e91dc719111c3189c',//flexDaoSetInvestorCapAdapterContract
                addr: this.flexDaoSetInvestorCapAdapterContract.address,
                flags: 8194
            },
            {
                id: '0xe6121cbf77e02f965a1829c382f701ad4cec84fbda84c45378db0768d2e40871',//flexDaoSetInvestorMembershipAdapterContract
                addr: this.flexDaoSetInvestorMembershipAdapterContract.address,
                flags: 32770
            },
            {
                id: '0xf3ce48289b9021e92bc5661ccf481e756dcb8de846c2eb9620bb83917cab5237',//flexDaoSetProposerMembershipAdapterContract
                addr: this.flexDaoSetProposerMembershipAdapterContract.address,
                flags: 524290
            },
            {
                id: '0xcdb9c6d5700c127f2c99a75e51af1f56590e1b02f8f6ceee2d51d67dd0e91cad',//flexSetRiceReceiverProposalAdapterContract
                addr: this.flexSetRiceReceiverProposalAdapterContract.address,
                flags: 33554442
            }

        ];


        const adapters1 = [{
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: this.flexFundingPoolAdapterContract.address, //FlexFundingPoolAdapterContract
            flags: 75
        },
        {
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: this.flexFundingAdapterContract.address, //FlexFundingAdapterContract
            flags: 26
        }
        ];
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const flexDaoParticipantCapInfo = [
            true, //bool enable;
            5 //uint256 maxParticipantsAmount;
        ]

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMemberships = [
            0, // uint8 varifyType;
            "flexDaoIvestorsMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            "flexDaoGovernorMembershipName",
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            0, //eligibilityType 0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];

        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            "flexDaoPollVoterMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //address[] whiteList;
        ];

        const flexDaoPollingInfo = [
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            0, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];

        const flexDaoProposerMembershipInfo = [
            true,
            "flexDaoProposerMembershipName",
            3, // uint8 varifyType;
            0, // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0, // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address] // address[] whiteList;
        ];

        const flexDaoManagementfee = hre.ethers.utils.parseEther("0.001"); // 0.2%
        const returnTokenManagementFee = hre.ethers.utils.parseEther("0.0024");

        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];
        const allocations = [10, 20, 30];
        const fundingPollEnable = false; //DIRECT mode
        const flexDaoFundriaseStyle = 0 // 0 - FCFS 1- Free in
        const riceRewardReceiver = this.user1.address;

        const flexDaoInfo = {
            name: _daoName, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0, // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address, // address tokenAddress;
            tokenId: 0, // uint256 tokenId;
            whiteList: [], // address[] whiteList;
            priorityPeriod: 60 * 10 // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo, //    flexDaoInfo _flexDaoInfo;
        ];

        const {
            daoAddr,
            daoName
        } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);
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
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd', //FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35', //FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8', //FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c', //FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7', //FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610', //FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda', //FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 770
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753', //StewardMangement
                addr: this.flexStewardMangement.address,
                flags: 6338
            },
            {
                id: '0x37cbe06c1044f98864ea25736326bc1d488e24e5e23781ea2ad64c4069cb9e6e', //flexStewardAllocationAdapter
                addr: this.flexStewardAllocation.address,
                flags: 0
            },
            {
                id: '0x43f8439a5cef099d0d9a92b15a64e34ff49963bb29d65f63204eda6591b810a1', //flexFundingReturnTokenAdapter
                addr: this.flexFundingReturnTokenAdapterContract.address,
                flags: 0
            },
            {
                id: '0xeae11da953333a83b6467e2193334fb302549e1a42ad5797082aea1ab6be9120', //flexFreeInEscrowFundAdapterContract
                addr: this.flexFreeInEscrowFundAdapterContract.address,
                flags: 0
            },
            {
                id: '0xc8e81510cbc5ec7970040e233b001587da1ea4484a9f7b8710d3322429c2df23', //flexFundingHelperAdapterContract
                addr: this.flexFundingHelperAdapterContract.address,
                flags: 0
            },
            // {
            //     id: '0xe564b2da9fb62dadceed6d94ac5884ac5f464424e7be661d7d6181d49fa87b3f', //flexDaoSetAdapterContract
            //     addr: this.flexDaoSetAdapterContract.address,
            //     flags: 778242
            // },
            {
                id: '0xff9379b98b93eb3bd1fac62fd2258a7955d70d2d5279c40064145b6c9646df37', //flexDaoSetHelperAdapterContract
                addr: this.flexDaoSetHelperAdapterContract.address,
                flags: 8
            },
            {
                id: '0x5f0e8d109045653360289a7a02d5dc2a99e382006a42ef93f66de55ecff3176f',// flexDaoSetPollingAdapterContract
                addr: this.flexDaoSetPollingAdapterContract.address,
                flags: 262146
            },
            {
                id: '0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7',//flexDaoSetVotingAdapterContract
                addr: this.flexDaoSetVotingAdapterContract.address,
                flags: 65538
            },
            {
                id: '0xc6bb47f9566baa74b5032b5c10e5bf4a1e2382ca337c2de674732f6401d52cc0',//flexDaoSetFeesAdapterContract
                addr: this.flexDaoSetFeesAdapterContract.address,
                flags: 131074
            },
            {
                id: '0x869e5d18913d4e9bb387c730a04b58d11e95102194f7217a4b684f6e61dff920',//flexDaoSetGovernorMembershipAdapterContract
                addr: this.flexDaoSetGovernorMembershipAdapterContract.address,
                flags: 16386
            },
            {
                id: '0x08f2d2eeda0c9072cdba8b58d442503b4cf9eb6c2f74d75e91dc719111c3189c',//flexDaoSetInvestorCapAdapterContract
                addr: this.flexDaoSetInvestorCapAdapterContract.address,
                flags: 8194
            },
            {
                id: '0xe6121cbf77e02f965a1829c382f701ad4cec84fbda84c45378db0768d2e40871',//flexDaoSetInvestorMembershipAdapterContract
                addr: this.flexDaoSetInvestorMembershipAdapterContract.address,
                flags: 32770
            },
            {
                id: '0xf3ce48289b9021e92bc5661ccf481e756dcb8de846c2eb9620bb83917cab5237',//flexDaoSetProposerMembershipAdapterContract
                addr: this.flexDaoSetProposerMembershipAdapterContract.address,
                flags: 524290
            },
            {
                id: '0xcdb9c6d5700c127f2c99a75e51af1f56590e1b02f8f6ceee2d51d67dd0e91cad',//flexSetRiceReceiverProposalAdapterContract
                addr: this.flexSetRiceReceiverProposalAdapterContract.address,
                flags: 33554442
            }

        ];


        const adapters1 = [{
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: this.flexFundingPoolAdapterContract.address, //FlexFundingPoolAdapterContract
            flags: 75
        },
        {
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: this.flexFundingAdapterContract.address, //FlexFundingAdapterContract
            flags: 26
        }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const flexDaoParticipantCapInfo = [
            true, //bool enable;
            5 //uint256 maxParticipantsAmount;
        ]

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMemberships = [
            0, // uint8 varifyType;
            "flexDaoIvestorsMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            "flexDaoGovernorMembershipName",
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            0, //eligibilityType 0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];


        const flexDaoPollsterMembershipInfo = [
            3, // uint8 varifyType;   //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
            "flexDaoPollVoterMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [
                this.pollster_membership_whitelist1.address,
                this.pollster_membership_whitelist2.address
            ] // address[] whiteList;
        ];

        const flexDaoPollingInfo = [
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            0, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];

        const flexDaoProposerMembershipInfo = [
            true,
            "flexDaoProposerMembershipName",
            3, // uint8 varifyType;
            0, // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0, // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address] // address[] whiteList;
        ];

        const flexDaoManagementfee = hre.ethers.utils.parseEther("0.002"); // 0.2%
        const returnTokenManagementFee = hre.ethers.utils.parseEther("0.0024");

        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];
        const allocations = [10, 20, 30];
        const fundingPollEnable = true; //Poll mode
        // const flexDaoFundriaseStyle = 0// 0 - FCFS 1- Free in
        const riceRewardReceiver = this.user1.address;

        const flexDaoInfo = {
            name: _daoName, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0, // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address, // address tokenAddress;
            tokenId: 0, // uint256 tokenId;
            whiteList: [], // address[] whiteList;
            priorityPeriod: 60 * 10 // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo, //    flexDaoInfo _flexDaoInfo;
        ];


        const {
            daoAddr,
            daoName
        } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);
        const fundingpoolextensionAddr = await daoContract.getExtensionAddress(sha3("flex-funding-pool-ext"));
        let currentflexDaoPollingVotingPeriod = await daoContract
            .getConfiguration("0xee63cc82ca6990a4cc5fa3ca10d8a5281ae1758a8d8f22892c4badb7cacd111e");
        let currentflexDaoPollingVotingPower = await daoContract
            .getConfiguration("0x18ccfaf5deb9f2b0bd666344fa9c46950fbcee85fbfd05c3959876dfe502c209");
        let currentflexDaoPollingSuperMajority = await daoContract
            .getConfiguration("0x777270e51451e60c2ce5118fc8e5844441dcc4d102e9052e60fb41312dbb848a");
        let currentflexDaoPollingQuorum = await daoContract
            .getConfiguration("0x7789eea44dccd66529026559d1b36215cb5766016b41a8a8f16e08b2ec875837");
        let currentflexDaoPollingEligibilityType = await daoContract
            .getConfiguration("0xd0dad4aff06879b1b839b3b8b56f7ec287c8ccfaf9a1461575d34b45effb2ca3");
        let currentflexEligibilityTokenId = await daoContract
            .getConfiguration("0x656f80c3ee5e8b049b7028f53c3d8f66f585b411116738cd6604ce8e8deb3a92");
        let currentflexEligibilityTokenAddress = await daoContract
            .getAddressConfiguration("0xf60c24a553194691fd513f91f28ce90d85b87ab669703faa0b848c72a41c6923");
        let currentflexDaoPollsterMembershipVarifyType = await daoContract
            .getConfiguration("0x112aea211656a3cfbf863b85e1ea090785899c30bd783708bb07b5a9049e5c32");
        let currentflexDaoPollsterMembershipMinHolding = await daoContract
            .getConfiguration("0x308a2ac7f1fce200f70e879e51cb346dfa5bc50cc3ffd14e12510d1fbaecb352");
        let currentflexPollsterMembershipTokenAddress = await daoContract
            .getAddressConfiguration("0x31cf49cb2c53ac34ebe77513f2222803ae1f2e89c781171ca472d273e6593575");
        let currentflexDaoPollsterMembershipTokenId = await daoContract
            .getConfiguration("0x5b0d0dc46f84f7703b74bcc9981b23b0ddbcdc040dd1c5c313bc64f7ab01ba88");
        let currentPollsterWhitelist = await
            this.flexPollingVotingContract.
                getWhitelist(daoAddr);
        console.log(`
        new dao address ${daoAddr}
        new dao name ${toUtf8(daoName)}
        funding pool extensionAddr ${fundingpoolextensionAddr}

        currentflexDaoPollingVotingPeriod ${currentflexDaoPollingVotingPeriod}
        currentflexDaoPollingVotingPower ${currentflexDaoPollingVotingPower}
        currentflexDaoPollingSuperMajority ${currentflexDaoPollingSuperMajority}
        currentflexDaoPollingQuorum ${currentflexDaoPollingQuorum}
        currentflexDaoPollingEligibilityType ${currentflexDaoPollingEligibilityType}
        currentflexEligibilityTokenId ${currentflexEligibilityTokenId}
        currentflexEligibilityTokenAddress ${currentflexEligibilityTokenAddress}
        currentflexDaoPollsterMembershipVarifyType ${currentflexDaoPollsterMembershipVarifyType}
        currentflexDaoPollsterMembershipMinHolding ${currentflexDaoPollsterMembershipMinHolding}
        currentflexPollsterMembershipTokenAddress ${currentflexPollsterMembershipTokenAddress}
        currentflexDaoPollsterMembershipTokenId ${currentflexDaoPollsterMembershipTokenId}
        currentPollsterWhitelist ${currentPollsterWhitelist}
        `)

        this.FlexPollDaoAddress = daoAddr;
    });

    it("varify flex DIRECT mode non escrow funding ...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.flexDirectdaoAddress);
        let tokenAddress = this.testtoken1.address;
        let minFundingAmount = hre.ethers.utils.parseEther("1000");
        let maxFundingAmount = hre.ethers.utils.parseEther("1000");
        let escrow = false;
        let returnTokenAddr = this.testtoken2.address;
        let returnTokenAmount = hre.ethers.utils.parseEther("1000000");
        let price = hre.ethers.utils.parseEther("0");
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%

        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
        ];

        let fundRaiseType = 0; //  0 FCSF, 1 FREE_IN
        let fundRaiseStartTime = blocktimestamp;
        let fundRaiseEndTime = fundRaiseStartTime + 100000;
        let minDepositAmount = hre.ethers.utils.parseEther("1");
        let maxDepositAmount = hre.ethers.utils.parseEther("1000");
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


        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.001"); // 0.1%

        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];

        const priorityWhitelist = [];
        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            // participantCapacity,
            priorityWhitelist
        ];
        console.log(fundingParams);

        console.log(`
        create flex funding proposal...
        ${dao.address}
        `)
        const tx = await flexFundingAdapterContract.connect(this.funding_proposer1_whitelist).
            submitProposal(dao.address, fundingParams);
        const result = await tx.wait();
        const proposalId = result.events[2].args.proposalId;
        let flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        created...
        flex funding ProposalId: ${proposalId}
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
        await USDT.connect(this.investor1).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));

        await USDT.transfer(this.investor1.address, hre.ethers.utils.parseEther("100000"));
        // await expectRevert(flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("10")), "revert");

        const exactmaxFundingAmount = await this.flexFundingHelperAdapterContract.getMaxInvestmentAmount(dao.address, proposalId);
        console.log(`
        maxFundingAmount $${hre.ethers.utils.formatEther(exactmaxFundingAmount)}
        `);

        await expectRevert(flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("2000000")), "revert");


        await expectRevert(flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("1000001")), "revert");
        await flexFundingPoolAdapt.deposit(dao.address, proposalId, maxDepositAmount);

        await expectRevert(flexFundingPoolAdapt.deposit(dao.address, proposalId, toBN(minDepositAmount).sub(toBN("1"))), "revert");
        // await flexFundingPoolAdapt.connect(this.investor1).deposit(dao.address, proposalId, toBN(exactmaxFundingAmount).sub(toBN(maxDepositAmount)));

        // const poolBal = await this.testtoken1.balanceOf(this.extensions.flexFundingPoolExt.address);
        let depositeBal = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.owner.address);
        let depositeBal1 = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.investor1.address);

        console.log(`
        deposit balance1   ${hre.ethers.utils.formatEther(depositeBal.toString())}
        deposit balance2  ${hre.ethers.utils.formatEther(depositeBal1.toString())}

        whitdraw...
        `);
        await flexFundingPoolAdapt.withdraw(dao.address, proposalId, hre.ethers.utils.parseEther("100"));
        depositeBal = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.owner.address);
        let totalFund = await flexFundingPoolAdapt.getTotalFundByProposalId(dao.address, proposalId);

        console.log(`
        total fund ${hre.ethers.utils.formatEther(totalFund)}
        deposit balance   ${hre.ethers.utils.formatEther(depositeBal.toString())}
        process proposal...
        `);
        await flexFundingPoolAdapt.connect(this.investor1).deposit(dao.address, proposalId, toBN(exactmaxFundingAmount).sub(toBN(totalFund)));
        totalFund = await flexFundingPoolAdapt.getTotalFundByProposalId(dao.address, proposalId);
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(fundRaiseEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        // await flexFundingPoolAdapt.withdraw(dao.address, proposalId, hre.ethers.utils.parseEther("100"));

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

        const share1 = (await this.flexAllocationAdapterContract.vestingInfos(dao.address, proposalId, this.owner.address)).tokenAmount;
        const share2 = (await this.flexAllocationAdapterContract.vestingInfos(dao.address, proposalId, this.investor1.address)).tokenAmount;
        const allShare = toBN(share1).add(toBN(share2));
        console.log(`
        total fund ${hre.ethers.utils.formatEther(totalFund)}
        processed...
        state ${flexFundingProposalInfo.state}
        finalRaiseAmount ${hre.ethers.utils.formatEther(flexFundingProposalInfo.investmentInfo.finalRaisedAmount)}
        returnAmount ${hre.ethers.utils.formatEther(flexFundingProposalInfo.investmentInfo.paybackTokenAmount)}
        protocol Fee ${hre.ethers.utils.formatEther(protocolFee)}
        management Fee ${hre.ethers.utils.formatEther(managementFee)}
        proposer reward ${hre.ethers.utils.formatEther(proposerreward)}
        receive Amount ${hre.ethers.utils.formatEther(receiveAmount)}
        total tributed amount ${hre.ethers.utils.formatEther(allTributedAmount)}

        share1 ${hre.ethers.utils.formatEther(share1)}
        share2 ${hre.ethers.utils.formatEther(share2)}
        allShare ${hre.ethers.utils.formatEther(allShare)}
        `);
    });

    it("varify flex DIRECT mode escrow funding ...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const flexVestingContract = this.flexVesting;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.flexDirectdaoAddress);
        const fundingpoolextensionAddr = await dao.getExtensionAddress(sha3("flex-funding-pool-ext"));
        const flexFundingPoolExtContract = (await hre.ethers.getContractFactory("FlexInvestmentPoolExtension")).attach(fundingpoolextensionAddr);

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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%

        const vestNFTEnable = false;
        // const nftToken = this.flexVestingERC721.address;
        const nftToken = this.vestingERC721.address;

        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%

        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];


        const priorityWhitelist = [];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
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
        flex funding ProposalId: ${proposalId}
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
        await this.testtoken2.connect(this.user1).approve(this.flexFundingReturnTokenAdapterContract.address,
            returnTokenAmount);

        await this.flexFundingReturnTokenAdapterContract.connect(this.user1).setFundingApprove(
            dao.address,
            proposalId,
            this.testtoken2.address,
            returnTokenAmount
        );

        const approvedAmount = await this.flexFundingReturnTokenAdapterContract.approvedInfos(dao.address, proposalId, this.user1.address, this.testtoken2.address);
        console.log(`
            approved amount ${hre.ethers.utils.formatEther(approvedAmount)}
        `);

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
        price ${hre.ethers.utils.formatEther(flexFundingProposalInfo.investmentInfo.price)}
        finalRaiseAmount ${hre.ethers.utils.formatEther(flexFundingProposalInfo.investmentInfo.finalRaisedAmount)}
        returnAmount ${hre.ethers.utils.formatEther(flexFundingProposalInfo.investmentInfo.paybackTokenAmount)}
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
        vest name ${createdVestingInfo.vestInfo.name}
        vest description ${createdVestingInfo.vestInfo.description}
        nft address ${createdVestingInfo.nftInfo.nftToken}
        tokenId ${createdVestingInfo.nftInfo.tokenId}
        proposalId: ${createdVestingInfo.proposalId},
        owner: ${createdVestingInfo.vestInfo.owner},
        recipient: ${createdVestingInfo.vestInfo.recipient},
        token: ${createdVestingInfo.vestInfotoken},
        start: ${createdVestingInfo.timeInfo.start},
        cliffDuration: ${createdVestingInfo.timeInfo.cliffDuration}
        stepDuration: ${createdVestingInfo.timeInfo.stepDuration}
        steps: ${createdVestingInfo.stepInfo.steps}
        cliffShares: ${hre.ethers.utils.formatEther(createdVestingInfo.stepInfo.cliffShares)}
        stepShares: ${hre.ethers.utils.formatEther(createdVestingInfo.stepInfo.stepShares)}
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

        let vestBal1 = await flexVestingContract.vestBalance(1)

        if (vestBal1 > 0) await flexVestingContract.withdraw(dao.address, 1);

        createdVestingInfo = await flexVestingContract.vests(1);
        returnTokenBal = await this.testtoken2.balanceOf(this.owner.address);
        const nextVestId = await flexVestingContract.vestIds()
        console.log(`
        claimed...
        claimed: ${hre.ethers.utils.formatEther(createdVestingInfo.claimed)}
        return token balance ${hre.ethers.utils.formatEther(returnTokenBal)}
        next Vest Id ${nextVestId}
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
        let vestingCliffEndTime = vestingStartTime + 60 * 60 * 1;
        let vestingEndTime = vestingCliffEndTime + 60 * 60 * 2 + 60;
        let vestingInterval = 60 * 60 * 1;
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%

        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];


        const priorityWhitelist = [];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
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
        flex funding ProposalId: ${proposalId}
        state ${flexFundingProposalInfo.state}
        voting...
        `);

        const flexFundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexPollingVoting = this.flexPollingVotingContract;
        const fundRaiseStartTimes = flexFundingProposalInfo.fundRaiseInfo.fundRaiseStartTime;
        const stopVoteTime = flexFundingProposalInfo.stopVoteTime;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        await this.testtoken1.transfer(this.pollster_membership_whitelist1.address, hre.ethers.utils.parseEther("100"));
        await this.testtoken1.transfer(this.pollster_membership_whitelist2.address, hre.ethers.utils.parseEther("100"));

        await flexPollingVoting.connect(this.pollster_membership_whitelist1).submitVote(dao.address, proposalId, 1);
        await flexPollingVoting.connect(this.pollster_membership_whitelist2).submitVote(dao.address, proposalId, 1);

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const voteRel = await flexPollingVoting.voteResult(dao.address, proposalId);
        console.log(`
        voting result ${voteRel}
        processing proposal...
        `);
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

        const managementFeeAddress = await dao.getAddressConfiguration(sha3("FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS"));
        const protocolAddress = await flexFundingAdapterContract.protocolAddress();
        const protocolFee1 = await USDT.balanceOf(protocolAddress);
        const managementFee1 = await USDT.balanceOf(managementFeeAddress);
        const proposerreward1 = await USDT.balanceOf(this.funding_proposer1_whitelist.address);
        const receiveAmount1 = await USDT.balanceOf(recipientAddr);

        await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);

        const protocolFee2 = await USDT.balanceOf(protocolAddress);
        const managementFee2 = await USDT.balanceOf(managementFeeAddress);
        const proposerreward2 = await USDT.balanceOf(this.funding_proposer1_whitelist.address);
        const receiveAmount2 = await USDT.balanceOf(recipientAddr);

        const protocolFee3 = toBN(protocolFee2).sub(toBN(protocolFee1));
        const managementFee3 = toBN(managementFee2).sub(toBN(managementFee1));
        const proposerreward3 = toBN(proposerreward2).sub(toBN(proposerreward1));
        const receiveAmount3 = toBN(receiveAmount2).sub(toBN(receiveAmount1));

        const allTributedAmount = toBN(protocolFee3.toString()).
            add(toBN(managementFee3.toString())).
            add(toBN(proposerreward3.toString())).
            add(toBN(receiveAmount3.toString()));

        console.log(`
        processed...
        state ${flexFundingProposalInfo.state}
        finalRaiseAmount ${hre.ethers.utils.formatEther(flexFundingProposalInfo.investmentInfo.finalRaisedAmount)}
        returnAmount ${hre.ethers.utils.formatEther(flexFundingProposalInfo.investmentInfo.paybackTokenAmount)}
        protocol Fee ${hre.ethers.utils.formatEther(protocolFee3)}
        management Fee ${hre.ethers.utils.formatEther(managementFee3)}
        proposer reward ${hre.ethers.utils.formatEther(proposerreward3)}
        project team receive Amount ${hre.ethers.utils.formatEther(receiveAmount3)}
        total tributed amount ${hre.ethers.utils.formatEther(allTributedAmount)}
        `);
    });

    it("varify flex Poll mode escrow funding...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const flexVestingContract = this.flexVesting;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.FlexPollDaoAddress);
        let tokenAddress = this.testtoken1.address;
        let minFundingAmount = hre.ethers.utils.parseEther("150000");
        let maxFundingAmount = hre.ethers.utils.parseEther("10000000");
        let escrow = true;
        let returnTokenAddr = this.testtoken2.address;
        let returnTokenAmount = hre.ethers.utils.parseEther("1000000");
        let price = hre.ethers.utils.parseEther("0.6");
        let minReturnAmount = toBN(minFundingAmount).div(toBN(price)).mul(toBN(hre.ethers.utils.parseEther("1")));
        let maxReturnAmount = toBN(maxFundingAmount).div(toBN(price)).mul(toBN(hre.ethers.utils.parseEther("1")));
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%


        const vestNFTEnable = false;
        // const nftToken = this.flexVestingERC721.address;
        const nftToken = this.vestingERC721.address;

        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];


        const priorityWhitelist = [];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
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
        flex funding ProposalId: ${proposalId}
        state ${flexFundingProposalInfo.state}
        voting...
        `);

        const flexFundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexVoting = this.flexPollingVotingContract;
        const fundRaiseStartTimes = flexFundingProposalInfo.fundRaiseInfo.fundRaiseStartTime;
        const stopVoteTime = flexFundingProposalInfo.stopVoteTime;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let voted = await flexVoting.checkIfVoted(dao.address, proposalId, this.pollster_membership_whitelist1.address);
        console.log("pollster_membership_whitelist1 voted: ", voted);

        await flexVoting.connect(this.pollster_membership_whitelist1).submitVote(dao.address, proposalId, 1);
        await flexVoting.connect(this.pollster_membership_whitelist2).submitVote(dao.address, proposalId, 1);

        voted = await flexVoting.checkIfVoted(dao.address, proposalId, this.pollster_membership_whitelist1.address);
        console.log("pollster_membership_whitelist1 voted: ", voted);

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

        await this.testtoken2.transfer(this.user1.address, maxReturnAmount)
        await this.testtoken2.connect(this.user1).approve(this.flexFundingReturnTokenAdapterContract.address,
            maxReturnAmount);

        await this.flexFundingReturnTokenAdapterContract.connect(this.user1).setFundingApprove(
            dao.address,
            proposalId,
            this.testtoken2.address,
            maxReturnAmount);

        await USDT.transfer(this.investor1.address, hre.ethers.utils.parseEther("100000"));
        await USDT.transfer(this.investor2.address, hre.ethers.utils.parseEther("100000"));

        await USDT.connect(this.investor1).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.investor2).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));

        await expectRevert(flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("10")), "revert");
        await flexFundingPoolAdapt.connect(this.investor1).
            deposit(dao.address, proposalId, hre.ethers.utils.parseEther("100000"));
        await flexFundingPoolAdapt.connect(this.investor2).
            deposit(dao.address, proposalId, hre.ethers.utils.parseEther("100000"));
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

        const managementFeeAddress = await dao.getAddressConfiguration(sha3("FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS"));
        const protocolAddress = await flexFundingAdapterContract.protocolAddress();
        const protocolFee1 = await USDT.balanceOf(protocolAddress);
        const managementFee1 = await USDT.balanceOf(managementFeeAddress);
        const proposerreward1 = await USDT.balanceOf(this.funding_proposer1_whitelist.address);
        const receiveAmount1 = await USDT.balanceOf(recipientAddr);

        await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);

        const protocolFee2 = await USDT.balanceOf(protocolAddress);
        const managementFee2 = await USDT.balanceOf(managementFeeAddress);
        const proposerreward2 = await USDT.balanceOf(this.funding_proposer1_whitelist.address);
        const receiveAmount2 = await USDT.balanceOf(recipientAddr);

        const protocolFee3 = toBN(protocolFee2).sub(toBN(protocolFee1));
        const managementFee3 = toBN(managementFee2).sub(toBN(managementFee1));
        const proposerreward3 = toBN(proposerreward2).sub(toBN(proposerreward1));
        const receiveAmount3 = toBN(receiveAmount2).sub(toBN(receiveAmount1));

        const allTributedAmount = toBN(protocolFee3.toString()).
            add(toBN(managementFee3.toString())).
            add(toBN(proposerreward3.toString())).
            add(toBN(receiveAmount3.toString()));

        console.log(`
        processed...
        state ${flexFundingProposalInfo.state}
        finalRaiseAmount ${hre.ethers.utils.formatEther(flexFundingProposalInfo.investmentInfo.finalRaisedAmount)}
        returnAmount ${hre.ethers.utils.formatEther(flexFundingProposalInfo.investmentInfo.paybackTokenAmount)}
        protocol Fee ${hre.ethers.utils.formatEther(protocolFee3)}
        management Fee ${hre.ethers.utils.formatEther(managementFee3)}
        proposer reward ${hre.ethers.utils.formatEther(proposerreward3)}
        receive Amount ${hre.ethers.utils.formatEther(receiveAmount3)}
        total tributed amount ${hre.ethers.utils.formatEther(allTributedAmount)}
        return token amount ${hre.ethers.utils.formatEther(flexFundingProposalInfo.investmentInfo.paybackTokenAmount)}
        create vesting...
        `);

        await flexVestingContract.createVesting(dao.address, this.investor1.address, proposalId);
        await flexVestingContract.createVesting(dao.address, this.investor2.address, proposalId);
        await flexVestingContract.createVesting(dao.address, this.funding_proposer1_whitelist.address, proposalId);


        let createdVestingInfo = await flexVestingContract.vests(2);
        let createdVestingInfo2 = await flexVestingContract.vests(3);
        let createdVestingInfo3 = await flexVestingContract.vests(4);

        const vestingBal = await flexVestingContract.vestBalance(2);
        const vestingBal2 = await flexVestingContract.vestBalance(3);
        const vestingBal3 = await flexVestingContract.vestBalance(4);

        let returnTokenBal = await this.testtoken2.balanceOf(this.investor1.address);
        let returnTokenBal2 = await this.testtoken2.balanceOf(this.investor2.address);
        let returnTokenBal3 = await this.testtoken2.balanceOf(this.funding_proposer1_whitelist.address);

        console.log(`
        vesting info1 ...
        proposalId: ${createdVestingInfo.proposalId},
        owner: ${createdVestingInfo.vestInfo.owner},
        recipient: ${createdVestingInfo.vestInfo.recipient},
        token: ${createdVestingInfo.vestInfo.token},
        start: ${createdVestingInfo.timeInfo.start},
        cliffDuration: ${createdVestingInfo.timeInfo.cliffDuration}
        stepDuration: ${createdVestingInfo.timeInfo.stepDuration}
        steps: ${createdVestingInfo.stepInfo.steps}
        cliffShares: ${hre.ethers.utils.formatEther(createdVestingInfo.stepInfo.cliffShares)}
        stepShares: ${hre.ethers.utils.formatEther(createdVestingInfo.stepInfo.stepShares)}
        claimed: ${createdVestingInfo.claimed}
        claiable: ${hre.ethers.utils.formatEther(vestingBal)}
        return token balance ${hre.ethers.utils.formatEther(returnTokenBal)}

        vesting info2 ...
        proposalId: ${createdVestingInfo2.proposalId},
        owner: ${createdVestingInfo2.vestInfo.owner},
        recipient: ${createdVestingInfo2.vestInfo.recipient},
        token: ${createdVestingInfo2.vestInfo.token},
        start: ${createdVestingInfo2.timeInfo.start},
        cliffDuration: ${createdVestingInfo2.timeInfo.cliffDuration}
        stepDuration: ${createdVestingInfo2.timeInfo.stepDuration}
        steps: ${createdVestingInfo2.stepInfo.steps}
        cliffShares: ${hre.ethers.utils.formatEther(createdVestingInfo2.stepInfo.cliffShares)}
        stepShares: ${hre.ethers.utils.formatEther(createdVestingInfo2.stepInfo.stepShares)}
        claimed: ${createdVestingInfo2.claimed}
        claiable: ${hre.ethers.utils.formatEther(vestingBal2)}
        return token balance ${hre.ethers.utils.formatEther(returnTokenBal2)}


        vesting info3 ...
        proposalId: ${createdVestingInfo3.proposalId},
        owner: ${createdVestingInfo3.vestInfo.owner},
        recipient: ${createdVestingInfo3.vestInfo.recipient},
        token: ${createdVestingInfo3.vestInfo.token},
        start: ${createdVestingInfo3.timeInfo.start},
        cliffDuration: ${createdVestingInfo3.timeInfo.cliffDuration}
        stepDuration: ${createdVestingInfo3.timeInfo.stepDuration}
        steps: ${createdVestingInfo3.stepInfo.steps}
        cliffShares: ${hre.ethers.utils.formatEther(createdVestingInfo3.stepInfo.cliffShares)}
        stepShares: ${hre.ethers.utils.formatEther(createdVestingInfo3.stepInfo.stepShares)}
        claimed: ${createdVestingInfo3.claimed}
        claiable: ${hre.ethers.utils.formatEther(vestingBal3)}
        return token balance ${hre.ethers.utils.formatEther(returnTokenBal3)}

        claiming ...
        `);
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(vestingCliffEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(vestingCliffEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        let vestBal2 = await flexVestingContract.vestBalance(2)
        if (vestBal2 > 0) await flexVestingContract.connect(this.investor1).withdraw(dao.address, 2);

        createdVestingInfo = await flexVestingContract.vests(2);
        returnTokenBal = await this.testtoken2.balanceOf(this.investor1.address);
        console.log(`
        claimed...
        claimed: ${hre.ethers.utils.formatEther(createdVestingInfo.claimed)}
        return token balance ${hre.ethers.utils.formatEther(returnTokenBal)}
        `);


        if (parseInt(vestingEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(vestingEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        vestBal2 = await flexVestingContract.vestBalance(2)
        let vestBal3 = await flexVestingContract.vestBalance(3)
        let vestBal4 = await flexVestingContract.vestBalance(4)

        if (vestBal2 > 0) await flexVestingContract.connect(this.investor1).withdraw(dao.address, 2);
        if (vestBal3 > 0) await flexVestingContract.connect(this.investor2).withdraw(dao.address, 3);
        if (vestBal4 > 0) await flexVestingContract.connect(this.funding_proposer1_whitelist).withdraw(dao.address, 4);

        returnTokenBal = await this.testtoken2.balanceOf(this.investor1.address);
        returnTokenBal2 = await this.testtoken2.balanceOf(this.investor2.address);
        returnTokenBal3 = await this.testtoken2.balanceOf(this.funding_proposer1_whitelist.address);

        createdVestingInfo = await flexVestingContract.vests(2);
        createdVestingInfo2 = await flexVestingContract.vests(3);
        createdVestingInfo3 = await flexVestingContract.vests(4);

        console.log(`
        claimed...
        claimed1: ${hre.ethers.utils.formatEther(createdVestingInfo.claimed)}
        claimed2: ${hre.ethers.utils.formatEther(createdVestingInfo2.claimed)}
        claimed3: ${hre.ethers.utils.formatEther(createdVestingInfo3.claimed)}

        return token balance ${hre.ethers.utils.formatEther(returnTokenBal)}
        return token balance2 ${hre.ethers.utils.formatEther(returnTokenBal2)}
        return token balance3 ${hre.ethers.utils.formatEther(returnTokenBal3)}
        `);
    });
})

describe("Steward-In Management", () => {
    before("summon a flex dao...", async () => {
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
            managementFeeAccount,
            steward_whitelist1, steward_whitelist2
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
        this.steward_whitelist1 = steward_whitelist1;
        this.steward_whitelist2 = steward_whitelist2;
        this.managementFeeAccount = managementFeeAccount;

        let _daoName = "my_flex_dao1";
        const {
            dao,
            factories,
            adapters,
            extensions,
            testContracts
        } = await deployDefaultDao({
            owner: this.owner,
            daoMode: 1, //  Vintage = 0, Flex = 1,   Collective = 2,
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
        // this.managing = this.adapters.managing.instance;
        this.flexPollingVotingContract = adapters.flexPollingVotingContract.instance;
        this.summonDao = this.adapters.summonDao.instance;
        this.flexStewardMangement = this.adapters.stewardManagementContract.instance;
        this.flexStewardAllocation = adapters.flexStewardAllocation.instance;
        this.flexFundingReturnTokenAdapterContract = adapters.flexFundingReturnTokenAdapterContract.instance;
        this.flexFreeInEscrowFundAdapterContract = adapters.flexFreeInEscrowFundAdapterContract.instance;
        this.flexFundingHelperAdapterContract = adapters.flexFundingHelperAdapterContract.instance;
        this.flexDaoSetAdapterContract = adapters.flexDaoSetAdapterContract.instance;
        this.flexDaoSetHelperAdapterContract = adapters.flexDaoSetHelperAdapterContract.instance;
        this.flexDaoSetPollingAdapterContract = adapters.flexDaoSetPollingAdapterContract.instance;
        this.flexDaoSetVotingAdapterContract = adapters.flexDaoSetVotingAdapterContract.instance;
        this.flexDaoSetFeesAdapterContract = adapters.flexDaoSetFeesAdapterContract.instance;
        this.flexDaoSetGovernorMembershipAdapterContract = adapters.flexDaoSetGovernorMembershipAdapterContract.instance;
        this.flexDaoSetInvestorCapAdapterContract = adapters.flexDaoSetInvestorCapAdapterContract.instance;
        this.flexDaoSetInvestorMembershipAdapterContract = adapters.flexDaoSetInvestorMembershipAdapterContract.instance;
        this.flexDaoSetProposerMembershipAdapterContract = adapters.flexDaoSetProposerMembershipAdapterContract.instance;
        this.flexSetRiceReceiverProposalAdapterContract = adapters.flexSetRiceReceiverProposalAdapterContract.instance;

        console.log("flexStewardMangement addr ", this.flexStewardMangement.address);

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];

        const creator = this.owner.address;

        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd', //FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35', //FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8', //FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c', //FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7', //FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610', //FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda', //FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 770
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753', //StewardMangement
                addr: this.flexStewardMangement.address,
                flags: 6338
            },
            {
                id: '0x37cbe06c1044f98864ea25736326bc1d488e24e5e23781ea2ad64c4069cb9e6e', //flexStewardAllocationAdapter
                addr: this.flexStewardAllocation.address,
                flags: 0
            },
            {
                id: '0x43f8439a5cef099d0d9a92b15a64e34ff49963bb29d65f63204eda6591b810a1', //flexFundingReturnTokenAdapter
                addr: this.flexFundingReturnTokenAdapterContract.address,
                flags: 0
            },
            {
                id: '0xeae11da953333a83b6467e2193334fb302549e1a42ad5797082aea1ab6be9120', //flexFreeInEscrowFundAdapterContract
                addr: this.flexFreeInEscrowFundAdapterContract.address,
                flags: 0
            },
            {
                id: '0xc8e81510cbc5ec7970040e233b001587da1ea4484a9f7b8710d3322429c2df23', //flexFundingHelperAdapterContract
                addr: this.flexFundingHelperAdapterContract.address,
                flags: 0
            },
            // {
            //     id: '0xe564b2da9fb62dadceed6d94ac5884ac5f464424e7be661d7d6181d49fa87b3f', //flexDaoSetAdapterContract
            //     addr: this.flexDaoSetAdapterContract.address,
            //     flags: 778242
            // },
            {
                id: '0xff9379b98b93eb3bd1fac62fd2258a7955d70d2d5279c40064145b6c9646df37', //flexDaoSetHelperAdapterContract
                addr: this.flexDaoSetHelperAdapterContract.address,
                flags: 8
            },
            {
                id: '0x5f0e8d109045653360289a7a02d5dc2a99e382006a42ef93f66de55ecff3176f',// flexDaoSetPollingAdapterContract
                addr: this.flexDaoSetPollingAdapterContract.address,
                flags: 262146
            },
            {
                id: '0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7',//flexDaoSetVotingAdapterContract
                addr: this.flexDaoSetVotingAdapterContract.address,
                flags: 65538
            },
            {
                id: '0xc6bb47f9566baa74b5032b5c10e5bf4a1e2382ca337c2de674732f6401d52cc0',//flexDaoSetFeesAdapterContract
                addr: this.flexDaoSetFeesAdapterContract.address,
                flags: 131074
            },
            {
                id: '0x869e5d18913d4e9bb387c730a04b58d11e95102194f7217a4b684f6e61dff920',//flexDaoSetGovernorMembershipAdapterContract
                addr: this.flexDaoSetGovernorMembershipAdapterContract.address,
                flags: 16386
            },
            {
                id: '0x08f2d2eeda0c9072cdba8b58d442503b4cf9eb6c2f74d75e91dc719111c3189c',//flexDaoSetInvestorCapAdapterContract
                addr: this.flexDaoSetInvestorCapAdapterContract.address,
                flags: 8194
            },
            {
                id: '0xe6121cbf77e02f965a1829c382f701ad4cec84fbda84c45378db0768d2e40871',//flexDaoSetInvestorMembershipAdapterContract
                addr: this.flexDaoSetInvestorMembershipAdapterContract.address,
                flags: 32770
            },
            {
                id: '0xf3ce48289b9021e92bc5661ccf481e756dcb8de846c2eb9620bb83917cab5237',//flexDaoSetProposerMembershipAdapterContract
                addr: this.flexDaoSetProposerMembershipAdapterContract.address,
                flags: 524290
            },
            {
                id: '0xcdb9c6d5700c127f2c99a75e51af1f56590e1b02f8f6ceee2d51d67dd0e91cad',//flexSetRiceReceiverProposalAdapterContract
                addr: this.flexSetRiceReceiverProposalAdapterContract.address,
                flags: 33554442
            }

        ];


        const adapters1 = [{
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: this.flexFundingPoolAdapterContract.address, //FlexFundingPoolAdapterContract
            flags: 75
        },
        {
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: this.flexFundingAdapterContract.address, //FlexFundingAdapterContract
            flags: 26
        }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const flexDaoParticipantCapInfo = [
            true, //bool enable;
            5 //uint256 maxParticipantsAmount;
        ]

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMemberships = [
            0, // uint8 varifyType;
            "flexDaoIvestorsMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            "flexDaoGovernorMembershipName",
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];

        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            "flexDaoPollVoterMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //address[] whiteList;
        ];
        const flexDaoPollingInfo = [
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            0, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];

        const flexDaoProposerMembershipInfo = [
            true,
            "flexDaoProposerMembershipName",
            3, // uint8 varifyType;
            0, // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0, // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address] // address[] whiteList;
        ];

        const flexDaoManagementfee = hre.ethers.utils.parseEther("0.002"); // 0.2%
        const returnTokenManagementFee = hre.ethers.utils.parseEther("0.0024");

        const flexDaoGenesisStewards = [
            this.genesis_steward1.address,
            this.genesis_steward2.address
        ];
        const allocations = [10, 20, 30];
        const fundingPollEnable = false; //DIRECT mode
        // const flexDaoFundriaseStyle = 0// 0 - FCFS 1- Free in
        const riceRewardReceiver = this.user1.address;

        _daoName = "my_flex_dao2";
        const flexDaoInfo = {
            name: _daoName, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0, // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address, // address tokenAddress;
            tokenId: 0, // uint256 tokenId;
            whiteList: [], // address[] whiteList;
            priorityPeriod: 60 * 10 // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo, //    flexDaoInfo _flexDaoInfo;
        ];

        // console.log(flexDaoParams)


        const {
            daoAddr,
            daoName
        } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);
        const fundingpoolextensionAddr = await daoContract.getExtensionAddress(sha3("flex-funding-pool-ext"));

        const currentfundingId = await daoContract.getCurrentInvestmentProposalId();
        const currentgovenorinId = await daoContract.getCurrentGovenorInProposalId();
        const currentgovenoroutId = await daoContract.getCurrentGovenorOutProposalId();
        const currentnewfundId = await daoContract.getCurrentFundEstablishmentProposalId();
        console.log(`
        new dao address ${daoAddr}
        new dao name ${toUtf8(daoName)}
        funding pool extensionAddr ${fundingpoolextensionAddr}
        currentfundingId ${currentfundingId}
        currentgovenorinId ${currentgovenorinId}
        currentgovenoroutId ${currentgovenoroutId} 
        currentnewfundId ${currentnewfundId}
        `);

        // await daoContract.removeMember(this.daoFactory.address);
        // await daoContract.removeMember(this.summonDao.address);
        this.flexDirectdaoAddress = daoAddr;
        this.flexDirectdao = daoContract;
    });

    const sommonFlexDao = async (summonDaoContract, daoFactoryContract, flexDaoParams) => {
        let tx = await summonDaoContract.summonFlexDao(flexDaoParams);
        let result = await tx.wait();
        const daoAddr = await daoFactoryContract.getDaoAddress(flexDaoParams[flexDaoParams.length - 1].name);
        const daoName = await daoFactoryContract.daos(daoAddr);


        return {
            daoAddr: daoAddr,
            daoName: daoName
        };
    };

    it("submit a steward-in proposal by steward applicant not qualified...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const daoAddr = this.flexDirectdaoAddress;
        await expectRevert(stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0), "revert");
    });

    it("submit a steward-in proposal by steward applicant qualified...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const daoAddr = this.flexDirectdaoAddress;
        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("100"));
        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        const currentfundingId = await this.flexDirectdao.getCurrentInvestmentProposalId();
        const currentgovenorinId = await this.flexDirectdao.getCurrentGovenorInProposalId();
        const currentgovenoroutId = await this.flexDirectdao.getCurrentGovenorOutProposalId();
        const currentnewfundId = await this.flexDirectdao.getCurrentFundEstablishmentProposalId();
        console.log(`
        stewardInProposalId ${proposalId}
        currentfundingId ${currentfundingId}
        currentgovenorinId ${currentgovenorinId}
        currentgovenoroutId ${currentgovenoroutId} 
        currentnewfundId ${currentnewfundId}
        `);
    });

    it("submit a steward-in proposal by not steward applicant not qualified...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const daoAddr = this.flexDirectdaoAddress;
        await expectRevert(stewardMangementContract.connect(this.user1).submitGovernorInProposal(daoAddr, this.user2.address, 0), "revert");
    });

    it("submit a steward-in proposal by not steward applicant qualified...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const daoAddr = this.flexDirectdaoAddress;
        await this.testtoken1.transfer(this.user2.address, hre.ethers.utils.parseEther("100"));
        await expectRevert(stewardMangementContract.connect(this.user1).submitGovernorInProposal(daoAddr, this.user2.address, 0), "revert");
    });

    it("vote for steward in proposal by not steward", async () => {
        const flexVotingContract = this.flexVotingContract;
        const proposalId = this.stewardInProposalId;
        const daoAddr = this.flexDirectdaoAddress;

        await expectRevert(flexVotingContract.connect(this.user2).submitVote(daoAddr, proposalId, 1), "revert");

    });

    it("vote for proposal and process...", async () => {
        const flexVotingContract = this.flexVotingContract;
        const stewardMangementContract = this.flexStewardMangement;

        const daoAddr = this.flexDirectdaoAddress;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const proposalId = this.stewardInProposalId;

        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const creationTime = proposalDetail.creationTime;
        const stopVoteTime = proposalDetail.stopVoteTime;
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const bal1 = await this.testtoken1.balanceOf(this.owner.address);

        const votingWeight1 = await flexVotingContract.getVotingWeight(daoAddr, this.owner.address);
        const votingWeight2 = await flexVotingContract.getVotingWeight(daoAddr, this.user1.address);

        console.log(`
        stop vote time ${stopVoteTime}
        current block time ${blocktimestamp}
        owner vote weight ${votingWeight1}
        user1 vote weight ${votingWeight2}
        `);
        await flexVotingContract.submitVote(daoAddr, proposalId, 1);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        const voteRel = await flexVotingContract.voteResult(daoAddr, proposalId);
        const tx = await stewardMangementContract.processProposal(daoAddr, proposalId);
        const recipient = await tx.wait();

        const allVotingWeight = recipient.events[recipient.events.length - 1].args.allVotingWeight;
        console.log(`
        allVotingWeight ${allVotingWeight}
        `);
        proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const isSteward = await daoContract.isMember(this.user1.address);
        console.log(`
        voteRel ${voteRel.state} ${voteRel.nbYes}  ${voteRel.nbNo} 
        state ${proposalDetail.state}
        isSteward ${isSteward}
        `);
    });

    it("submit a steward-out proposal by not steward...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const daoAddr = this.flexDirectdaoAddress;

        await expectRevert(stewardMangementContract.connect(this.user2).submitGovernorOutProposal(daoAddr, this.user1.address), "revert");
    });

    it("submit a steward-out proposal by steward applicant not steward...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const daoAddr = this.flexDirectdaoAddress;

        await expectRevert(stewardMangementContract.submitGovernorOutProposal(daoAddr, this.user2.address), "revert");
    });

    it("submit a steward-out proposal by steward...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const daoAddr = this.flexDirectdaoAddress;

        const tx = await stewardMangementContract.
            submitGovernorOutProposal(daoAddr, this.user1.address);

        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardOutProposalId = proposalId;
    });

    it("vote for steward-out proposal and process...", async () => {

        const flexVotingContract = this.flexVotingContract;
        const stewardMangementContract = this.flexStewardMangement;

        const daoAddr = this.flexDirectdaoAddress;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const proposalId = this.stewardOutProposalId;

        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        console.log(`
        stop vote time ${stopVoteTime}
        current block time ${blocktimestamp}
        `);
        let voted = await flexVotingContract.checkIfVoted(daoAddr, proposalId, this.owner.address);
        console.log("voted: ", voted);
        await flexVotingContract.submitVote(daoAddr, proposalId, 1);
        voted = await flexVotingContract.checkIfVoted(daoAddr, proposalId, this.owner.address);
        console.log("voted: ", voted);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }


        await stewardMangementContract.processProposal(daoAddr, proposalId);
        proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const isSteward = await daoContract.isMember(this.user1.address);
        console.log(`
        state ${proposalDetail.state}
        isSteward ${isSteward}
        `);
    });

    it("dao summonor cant quit himself...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const daoAddr = this.flexDirectdaoAddress;

        await expectRevert(stewardMangementContract.quit(daoAddr), "revert");

    });

    it("steward quit himself...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const flexVotingContract = this.flexVotingContract;

        const daoAddr = this.flexDirectdaoAddress;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        await flexVotingContract.submitVote(daoAddr, proposalId, 1);
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await stewardMangementContract.processProposal(daoAddr, proposalId);

        let isSteward = await daoContract.isMember(this.user1.address);
        console.log(`
        isSteward ${isSteward}
        quit...
        `);
        await stewardMangementContract.connect(this.user1).quit(daoAddr);
        isSteward = await daoContract.isMember(this.user1.address);
        console.log(`
        isSteward ${isSteward}
        `);
        isSteward = await daoContract.isMember(this.genesis_steward1.address);
        console.log(`
        is genesis_steward1 Steward ${isSteward}
        genesis_steward1 quit...
        `);
        await stewardMangementContract.connect(this.genesis_steward1).quit(daoAddr);
        isSteward = await daoContract.isMember(this.genesis_steward1.address);
        const allStewards = await stewardMangementContract.getAllGovernor(daoAddr);
        console.log(allStewards);
        console.log(`
        is genesis_steward1 Steward ${isSteward}
        allStewards ${allStewards}
        `);

    });

    it("steward whitelist in proposal", async () => {
        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];

        const creator = this.owner.address;

        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd', //FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35', //FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8', //FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c', //FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7', //FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610', //FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda', //FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 770
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753', //StewardMangement
                addr: this.flexStewardMangement.address,
                flags: 6338
            },
            {
                id: '0x37cbe06c1044f98864ea25736326bc1d488e24e5e23781ea2ad64c4069cb9e6e', //flexStewardAllocationAdapter
                addr: this.flexStewardAllocation.address,
                flags: 0
            },
            {
                id: '0x43f8439a5cef099d0d9a92b15a64e34ff49963bb29d65f63204eda6591b810a1', //flexFundingReturnTokenAdapter
                addr: this.flexFundingReturnTokenAdapterContract.address,
                flags: 0
            },
            {
                id: '0xeae11da953333a83b6467e2193334fb302549e1a42ad5797082aea1ab6be9120', //flexFreeInEscrowFundAdapterContract
                addr: this.flexFreeInEscrowFundAdapterContract.address,
                flags: 0
            },
            {
                id: '0xc8e81510cbc5ec7970040e233b001587da1ea4484a9f7b8710d3322429c2df23', //flexFundingHelperAdapterContract
                addr: this.flexFundingHelperAdapterContract.address,
                flags: 0
            },
            // {
            //     id: '0xe564b2da9fb62dadceed6d94ac5884ac5f464424e7be661d7d6181d49fa87b3f', //flexDaoSetAdapterContract
            //     addr: this.flexDaoSetAdapterContract.address,
            //     flags: 778242
            // },
            {
                id: '0xff9379b98b93eb3bd1fac62fd2258a7955d70d2d5279c40064145b6c9646df37', //flexDaoSetHelperAdapterContract
                addr: this.flexDaoSetHelperAdapterContract.address,
                flags: 8
            },
            {
                id: '0x5f0e8d109045653360289a7a02d5dc2a99e382006a42ef93f66de55ecff3176f',// flexDaoSetPollingAdapterContract
                addr: this.flexDaoSetPollingAdapterContract.address,
                flags: 262146
            },
            {
                id: '0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7',//flexDaoSetVotingAdapterContract
                addr: this.flexDaoSetVotingAdapterContract.address,
                flags: 65538
            },
            {
                id: '0xc6bb47f9566baa74b5032b5c10e5bf4a1e2382ca337c2de674732f6401d52cc0',//flexDaoSetFeesAdapterContract
                addr: this.flexDaoSetFeesAdapterContract.address,
                flags: 131074
            },
            {
                id: '0x869e5d18913d4e9bb387c730a04b58d11e95102194f7217a4b684f6e61dff920',//flexDaoSetGovernorMembershipAdapterContract
                addr: this.flexDaoSetGovernorMembershipAdapterContract.address,
                flags: 16386
            },
            {
                id: '0x08f2d2eeda0c9072cdba8b58d442503b4cf9eb6c2f74d75e91dc719111c3189c',//flexDaoSetInvestorCapAdapterContract
                addr: this.flexDaoSetInvestorCapAdapterContract.address,
                flags: 8194
            },
            {
                id: '0xe6121cbf77e02f965a1829c382f701ad4cec84fbda84c45378db0768d2e40871',//flexDaoSetInvestorMembershipAdapterContract
                addr: this.flexDaoSetInvestorMembershipAdapterContract.address,
                flags: 32770
            },
            {
                id: '0xf3ce48289b9021e92bc5661ccf481e756dcb8de846c2eb9620bb83917cab5237',//flexDaoSetProposerMembershipAdapterContract
                addr: this.flexDaoSetProposerMembershipAdapterContract.address,
                flags: 524290
            }

        ];

        const adapters1 = [{
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: this.flexFundingPoolAdapterContract.address, //FlexFundingPoolAdapterContract
            flags: 75
        },
        {
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: this.flexFundingAdapterContract.address, //FlexFundingAdapterContract
            flags: 26
        }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const flexDaoParticipantCapInfo = [
            true, //bool enable;
            5 //uint256 maxParticipantsAmount;
        ]

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMemberships = [
            0, // uint8 varifyType;
            "flexDaoIvestorsMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //whiteList;
        ];
        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            "flexDaoGovernorMembershipName",
            3, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [this.user1.address, this.user2.address] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            0, //eligibilityType 0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 60 * 2, // uint256 votingPeriod;
            0, // uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];

        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            "flexDaoPollVoterMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //address[] whiteList;
        ];
        const flexDaoPollingInfo = [
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            0, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];

        const flexDaoProposerMembershipInfo = [
            true,
            "flexDaoProposerMembershipName",
            3, // uint8 varifyType;
            0, // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0, // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address] // address[] whiteList;
        ];

        const flexDaoManagementfee = hre.ethers.utils.parseEther("0.002"); // 0.2%
        const returnTokenManagementFee = hre.ethers.utils.parseEther("0.0024");

        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];
        const allocations = [10, 20, 30];
        const fundingPollEnable = false; //DIRECT mode
        // const flexDaoFundriaseStyle = 0// 0 - FCFS 1- Free in
        const riceRewardReceiver = this.user1.address;

        let _daoName = "my_flex_dao3";
        const flexDaoInfo = {
            name: _daoName, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0, // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address, // address tokenAddress;
            tokenId: 0, // uint256 tokenId;
            whiteList: [], // address[] whiteList;
            priorityPeriod: 60 * 10 // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo, //    flexDaoInfo _flexDaoInfo;
        ];


        const {
            daoAddr,
            daoName
        } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);
        const fundingpoolextensionAddr = await daoContract.getExtensionAddress(sha3("flex-funding-pool-ext"));
        console.log(`
        new dao address ${daoAddr}
        new dao name ${toUtf8(daoName)}
        funding pool extensionAddr ${fundingpoolextensionAddr}
        `);

        const stewardMangementContract = this.flexStewardMangement;
        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        console.log(`
        succeed...
        proposalID ${proposalId}
        `);
    });
})

describe("voting...", () => {
    before("summon a flex dao...", async () => {
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
            managementFeeAccount,
            steward_whitelist1, steward_whitelist2
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
        this.steward_whitelist1 = steward_whitelist1;
        this.steward_whitelist2 = steward_whitelist2;
        this.managementFeeAccount = managementFeeAccount;

        let _daoName = "my_flex_dao1";
        const {
            dao,
            factories,
            adapters,
            extensions,
            testContracts
        } = await deployDefaultDao({
            owner: this.owner,
            daoMode: 1, //  Vintage = 0, Flex = 1,   Collective = 2,
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
        // this.managing = this.adapters.managing.instance;
        this.flexPollingVotingContract = adapters.flexPollingVotingContract.instance;
        this.summonDao = this.adapters.summonDao.instance;
        this.flexStewardMangement = this.adapters.stewardManagementContract.instance;
        this.flexStewardAllocation = adapters.flexStewardAllocation.instance;
        this.flexFundingReturnTokenAdapterContract = adapters.flexFundingReturnTokenAdapterContract.instance;
        this.flexFreeInEscrowFundAdapterContract = adapters.flexFreeInEscrowFundAdapterContract.instance;
        this.flexFundingHelperAdapterContract = adapters.flexFundingHelperAdapterContract.instance;
        this.flexDaoSetAdapterContract = adapters.flexDaoSetAdapterContract.instance;
        this.flexDaoSetHelperAdapterContract = adapters.flexDaoSetHelperAdapterContract.instance;
        this.flexDaoSetPollingAdapterContract = adapters.flexDaoSetPollingAdapterContract.instance;
        this.flexDaoSetVotingAdapterContract = adapters.flexDaoSetVotingAdapterContract.instance;
        this.flexDaoSetFeesAdapterContract = adapters.flexDaoSetFeesAdapterContract.instance;
        this.flexDaoSetGovernorMembershipAdapterContract = adapters.flexDaoSetGovernorMembershipAdapterContract.instance;
        this.flexDaoSetInvestorCapAdapterContract = adapters.flexDaoSetInvestorCapAdapterContract.instance;
        this.flexDaoSetInvestorMembershipAdapterContract = adapters.flexDaoSetInvestorMembershipAdapterContract.instance;
        this.flexDaoSetProposerMembershipAdapterContract = adapters.flexDaoSetProposerMembershipAdapterContract.instance;
        this.flexSetRiceReceiverProposalAdapterContract = adapters.flexSetRiceReceiverProposalAdapterContract.instance;

        console.log("flexStewardMangement addr ", this.flexStewardMangement.address);

        const ERC721 = await hre.ethers.getContractFactory("PixelNFT");
        const erc721 = await ERC721.deploy(4);
        await erc721.deployed();
        this.testERC721 = erc721;

        const ERC1155 = await hre.ethers.getContractFactory("ERC1155TestToken");
        const erc1155 = await ERC1155.deploy("this is test uri");
        await erc1155.deployed();
        this.testERC1155 = erc1155;

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];

        const creator = this.owner.address;

        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd', //FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35', //FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8', //FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c', //FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7', //FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610', //FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda', //FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 770
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753', //StewardMangement
                addr: this.flexStewardMangement.address,
                flags: 6338
            },
            {
                id: '0x37cbe06c1044f98864ea25736326bc1d488e24e5e23781ea2ad64c4069cb9e6e', //flexStewardAllocationAdapter
                addr: this.flexStewardAllocation.address,
                flags: 0
            },
            {
                id: '0x43f8439a5cef099d0d9a92b15a64e34ff49963bb29d65f63204eda6591b810a1', //flexFundingReturnTokenAdapter
                addr: this.flexFundingReturnTokenAdapterContract.address,
                flags: 0
            },
            {
                id: '0xeae11da953333a83b6467e2193334fb302549e1a42ad5797082aea1ab6be9120', //flexFreeInEscrowFundAdapterContract
                addr: this.flexFreeInEscrowFundAdapterContract.address,
                flags: 0
            },
            {
                id: '0xc8e81510cbc5ec7970040e233b001587da1ea4484a9f7b8710d3322429c2df23', //flexFundingHelperAdapterContract
                addr: this.flexFundingHelperAdapterContract.address,
                flags: 0
            },
            // {
            //     id: '0xe564b2da9fb62dadceed6d94ac5884ac5f464424e7be661d7d6181d49fa87b3f', //flexDaoSetAdapterContract
            //     addr: this.flexDaoSetAdapterContract.address,
            //     flags: 778242
            // },
            {
                id: '0xff9379b98b93eb3bd1fac62fd2258a7955d70d2d5279c40064145b6c9646df37', //flexDaoSetHelperAdapterContract
                addr: this.flexDaoSetHelperAdapterContract.address,
                flags: 8
            },
            {
                id: '0x5f0e8d109045653360289a7a02d5dc2a99e382006a42ef93f66de55ecff3176f',// flexDaoSetPollingAdapterContract
                addr: this.flexDaoSetPollingAdapterContract.address,
                flags: 262146
            },
            {
                id: '0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7',//flexDaoSetVotingAdapterContract
                addr: this.flexDaoSetVotingAdapterContract.address,
                flags: 65538
            },
            {
                id: '0xc6bb47f9566baa74b5032b5c10e5bf4a1e2382ca337c2de674732f6401d52cc0',//flexDaoSetFeesAdapterContract
                addr: this.flexDaoSetFeesAdapterContract.address,
                flags: 131074
            },
            {
                id: '0x869e5d18913d4e9bb387c730a04b58d11e95102194f7217a4b684f6e61dff920',//flexDaoSetGovernorMembershipAdapterContract
                addr: this.flexDaoSetGovernorMembershipAdapterContract.address,
                flags: 16386
            },
            {
                id: '0x08f2d2eeda0c9072cdba8b58d442503b4cf9eb6c2f74d75e91dc719111c3189c',//flexDaoSetInvestorCapAdapterContract
                addr: this.flexDaoSetInvestorCapAdapterContract.address,
                flags: 8194
            },
            {
                id: '0xe6121cbf77e02f965a1829c382f701ad4cec84fbda84c45378db0768d2e40871',//flexDaoSetInvestorMembershipAdapterContract
                addr: this.flexDaoSetInvestorMembershipAdapterContract.address,
                flags: 32770
            },
            {
                id: '0xf3ce48289b9021e92bc5661ccf481e756dcb8de846c2eb9620bb83917cab5237',//flexDaoSetProposerMembershipAdapterContract
                addr: this.flexDaoSetProposerMembershipAdapterContract.address,
                flags: 524290
            },
            {
                id: '0xcdb9c6d5700c127f2c99a75e51af1f56590e1b02f8f6ceee2d51d67dd0e91cad',//flexSetRiceReceiverProposalAdapterContract
                addr: this.flexSetRiceReceiverProposalAdapterContract.address,
                flags: 33554442
            }

        ];


        const adapters1 = [{
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: this.flexFundingPoolAdapterContract.address, //FlexFundingPoolAdapterContract
            flags: 75
        },
        {
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: this.flexFundingAdapterContract.address, //FlexFundingAdapterContract
            flags: 26
        }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const flexDaoParticipantCapInfo = [
            true, //bool enable;
            5 //uint256 maxParticipantsAmount;
        ]

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMemberships = [
            0, // uint8 varifyType;
            "flexDaoIvestorsMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            "flexDaoGovernorMembershipName",
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        //erc20, quantity, support type percentage, quorum type percentage
        const flexDaoVotingInfo1_1 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];
        //erc20, log2, support type percentage, quorum type percentage
        const flexDaoVotingInfo1_2 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            1, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];
        //erc20, voter 1 vote, support type percentage, quorum type percentage
        const flexDaoVotingInfo1_3 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            2, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];

        //erc20, voter 1 vote, support type integer, quorum type integer
        const flexDaoVotingInfo1_4 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            2, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            1, //supportType
            1 //quorumType
        ];

        //ERC721, quantity, support type percentage, quorum type percentage
        const flexDaoVotingInfo2_1 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testERC721.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];
        //ERC721, quantity, support type integer, quorum type integer
        const flexDaoVotingInfo2_2 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testERC721.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];
        //ERC721, log2, support type percentage, quorum type percentage
        const flexDaoVotingInfo2_3 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testERC721.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            1, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];
        //ERC721, log2, support type integer, quorum type integer
        const flexDaoVotingInfo2_4 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testERC721.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            1, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            1, //supportType
            1 //quorumType
        ];
        //ERC721, 1 voter 1 vote, support type percentage, quorum type percentage
        const flexDaoVotingInfo2_5 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testERC721.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            2, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];
        //ERC721, 1 voter 1 vote, support type integer, quorum type integer
        const flexDaoVotingInfo2_6 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testERC721.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            2, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            1, //supportType
            1 //quorumType
        ];

        //erc1155, quantity, support type percentage, quorum type percentage
        const flexDaoVotingInfo3 = [
            2, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testERC1155.address, //tokenAddress
            1, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];
        //allocation, quantity, support type percentage, quorum type percentage
        const flexDaoVotingInfo4 = [
            3, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];

        //allocation, log2, support type percentage, quorum type percentage
        const flexDaoVotingInfo4_1 = [
            3, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            1, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];

        //allocation, log2, support type percentage, quorum type percentage
        const flexDaoVotingInfo4_2 = [
            3, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            2, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];


        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            "flexDaoPollVoterMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //address[] whiteList;
        ];
        const flexDaoPollingInfo = [
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            0, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];

        const flexDaoProposerMembershipInfo = [
            true,
            "flexDaoProposerMembershipName",
            3, // uint8 varifyType;
            0, // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0, // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address] // address[] whiteList;
        ];

        const flexDaoManagementfee = hre.ethers.utils.parseEther("0.002"); // 0.2%
        const returnTokenManagementFee = hre.ethers.utils.parseEther("0.0024");

        const flexDaoGenesisStewards = [
            this.genesis_steward1.address,
            this.genesis_steward2.address
        ];
        const allocations = [10, 20, 30];
        const fundingPollEnable = false; //DIRECT mode
        const flexDaoFundriaseStyle = 0 // 0 - FCFS 1- Free in

        _daoName = "my_flex_dao2";
        let _daoName1_1 = "my_flex_dao1-1";
        let _daoName1_2 = "my_flex_dao1-2";
        let _daoName1_3 = "my_flex_dao1-3";
        let _daoName1_4 = "my_flex_dao1-4";
        let _daoName2_1 = "my_flex_dao2-1";
        let _daoName2_2 = "my_flex_dao2-2";
        let _daoName2_3 = "my_flex_dao2-3";
        let _daoName2_4 = "my_flex_dao2-4";
        let _daoName2_5 = "my_flex_dao2-5";
        let _daoName2_6 = "my_flex_dao2-6";
        let _daoName3 = "my_flex_dao3";
        let _daoName4 = "my_flex_dao4";
        let _daoName4_1 = "my_flex_dao4_1";
        let _daoName4_2 = "my_flex_dao4_2";

        const riceRewardReceiver = this.user1.address;

        const flexDaoInfo1_1 = {
            name: _daoName1_1, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }
        const flexDaoInfo1_2 = {
            name: _daoName1_2, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        };
        const flexDaoInfo1_3 = {
            name: _daoName1_3, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        };
        const flexDaoInfo1_4 = {
            name: _daoName1_4, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        };
        const flexDaoInfo2_1 = {
            name: _daoName2_1, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        };
        const flexDaoInfo2_2 = {
            name: _daoName2_2, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }
        const flexDaoInfo2_3 = {
            name: _daoName2_3, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        };
        const flexDaoInfo2_4 = {
            name: _daoName2_4, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }
        const flexDaoInfo2_5 = {
            name: _daoName2_5, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        };
        const flexDaoInfo2_6 = {
            name: _daoName2_6, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }
        const flexDaoInfo3 = {
            name: _daoName3, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        };
        const flexDaoInfo4 = {
            name: _daoName4, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }

        const flexDaoInfo4_1 = {
            name: _daoName4_1, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }

        const flexDaoInfo4_2 = {
            name: _daoName4_2, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }
        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0, // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address, // address tokenAddress;
            tokenId: 0, // uint256 tokenId;
            whiteList: [], // address[] whiteList;
            priorityPeriod: 60 * 10 // uint256 priorityPeriod;
        }

        const flexDaoParams1_1 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo1_1, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo1_1, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams1_2 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo1_2, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo1_2, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams1_3 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo1_3, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo1_3, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams1_4 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo1_4, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo1_4, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams2_1 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo2_1, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo2_1, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams2_2 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo2_2, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo2_2, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams2_3 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo2_3, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo2_3, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams2_4 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo2_4, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo2_4, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams2_5 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo2_5, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo2_5, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams2_6 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo2_6, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo2_6, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams3 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo3, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo3, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams4 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo4, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo4, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams4_1 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo4_1, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo4_1, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams4_2 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo4_2, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo4_2, //    flexDaoInfo _flexDaoInfo;
        ];

        let obj1_1 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams1_1);
        console.log(`
        new dao address ${obj1_1.daoAddr}
        new dao name ${toUtf8(obj1_1.daoName)}
        `);

        let obj1_2 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams1_2);
        let obj1_3 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams1_3);
        let obj1_4 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams1_4);
        let obj2_1 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams2_1);
        let obj2_2 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams2_2);
        let obj2_3 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams2_3);
        let obj2_4 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams2_4);
        let obj2_5 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams2_5);
        let obj2_6 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams2_6);
        let obj3 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams3);
        let obj4 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams4);
        let obj4_1 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams4_1);
        let obj4_2 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams4_2);
        this.dao1_1 = obj1_1.daoAddr;
        this.dao1_2 = obj1_2.daoAddr;
        this.dao1_3 = obj1_3.daoAddr;
        this.dao1_4 = obj1_4.daoAddr;
        this.dao2_1 = obj2_1.daoAddr;
        this.dao2_2 = obj2_2.daoAddr;
        this.dao2_3 = obj2_3.daoAddr;
        this.dao2_4 = obj2_4.daoAddr;
        this.dao2_5 = obj2_5.daoAddr;
        this.dao2_6 = obj2_6.daoAddr;
        this.dao3 = obj3.daoAddr;
        this.dao4 = obj4.daoAddr;
        this.dao4_1 = obj4_1.daoAddr;
        this.dao4_2 = obj4_2.daoAddr;
    });

    const sommonFlexDao = async (summonDaoContract, daoFactoryContract, flexDaoParams) => {
        let tx = await summonDaoContract.summonFlexDao(flexDaoParams);
        let result = await tx.wait();
        const daoAddr = await daoFactoryContract.getDaoAddress(flexDaoParams[flexDaoParams.length - 1].name);
        const daoName = await daoFactoryContract.daos(daoAddr);


        return {
            daoAddr: daoAddr,
            daoName: daoName
        };
    };

    it("erc20, quantity, support type percentage, quorum type percentage...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const flexVotingContract = this.flexVotingContract;

        const daoAddr = this.dao1_1;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("100"));
        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;
        let votingWeight1 = await flexVotingContract.getVotingWeight(daoAddr, this.owner.address);
        let votingWeight2 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward1.address);
        let votingWeight3 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}

        `);

        await this.testtoken1.transfer(this.genesis_steward1.address, hre.ethers.utils.parseEther("1000"));
        await this.testtoken1.transfer(this.genesis_steward2.address, hre.ethers.utils.parseEther("1000"));
        votingWeight1 = await flexVotingContract.getVotingWeight(daoAddr, this.owner.address);
        votingWeight2 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward1.address);
        votingWeight3 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        vote for steward proposal...
        `);

        await flexVotingContract.submitVote(daoAddr, proposalId, 2);
        await flexVotingContract.connect(this.genesis_steward1).submitVote(daoAddr, proposalId, 1);
        await flexVotingContract.connect(this.genesis_steward2).submitVote(daoAddr, proposalId, 1);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        const voteRel = await flexVotingContract.voteResult(daoAddr, proposalId);
        await stewardMangementContract.processProposal(daoAddr, proposalId);
        const allWeight = await flexVotingContract.getAllGovernorWeight(daoAddr);
        proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const isSteward = await daoContract.isMember(this.user1.address);
        console.log(`
        voteRel ${voteRel.state} ${voteRel.nbYes}  ${voteRel.nbNo} 
        quorum ${allWeight * 66 / 100}
        state ${proposalDetail.state}
        isSteward ${isSteward}
        `);
    });

    it("erc20, log2, support type percentage, quorum type percentage...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const flexVotingContract = this.flexVotingContract;

        const daoAddr = this.dao1_2;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;
        let votingWeight1 = await flexVotingContract.getVotingWeight(daoAddr, this.owner.address);
        let votingWeight2 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward1.address);
        let votingWeight3 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}

        `);

        await this.testtoken1.transfer(this.genesis_steward1.address, hre.ethers.utils.parseEther("1000"));
        await this.testtoken1.transfer(this.genesis_steward2.address, hre.ethers.utils.parseEther("1000"));
        votingWeight1 = await flexVotingContract.getVotingWeight(daoAddr, this.owner.address);
        votingWeight2 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward1.address);
        votingWeight3 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        vote for steward proposal...
        `);

        await flexVotingContract.submitVote(daoAddr, proposalId, 2);
        await flexVotingContract.connect(this.genesis_steward1).submitVote(daoAddr, proposalId, 1);
        await flexVotingContract.connect(this.genesis_steward2).submitVote(daoAddr, proposalId, 1);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        const voteRel = await flexVotingContract.voteResult(daoAddr, proposalId);
        await stewardMangementContract.processProposal(daoAddr, proposalId);
        const allWeight = await flexVotingContract.getAllGovernorWeight(daoAddr);
        proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const isSteward = await daoContract.isMember(this.user1.address);
        console.log(`
        voteRel ${voteRel.state} ${voteRel.nbYes}  ${voteRel.nbNo} 
        quorum ${allWeight * 66 / 100}
        state ${proposalDetail.state}
        isSteward ${isSteward}
        `);
    });

    it("erc20, voter 1 vote, support type percentage, quorum type percentage...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const flexVotingContract = this.flexVotingContract;

        const daoAddr = this.dao1_3;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;
        let votingWeight1 = await flexVotingContract.getVotingWeight(daoAddr, this.owner.address);
        let votingWeight2 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward1.address);
        let votingWeight3 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}

        `);

        await this.testtoken1.transfer(this.genesis_steward1.address, hre.ethers.utils.parseEther("1000"));
        await this.testtoken1.transfer(this.genesis_steward2.address, hre.ethers.utils.parseEther("1000"));
        votingWeight1 = await flexVotingContract.getVotingWeight(daoAddr, this.owner.address);
        votingWeight2 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward1.address);
        votingWeight3 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        vote for steward proposal...
        `);

        await flexVotingContract.submitVote(daoAddr, proposalId, 2);
        await flexVotingContract.connect(this.genesis_steward1).submitVote(daoAddr, proposalId, 1);
        await flexVotingContract.connect(this.genesis_steward2).submitVote(daoAddr, proposalId, 1);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        const voteRel = await flexVotingContract.voteResult(daoAddr, proposalId);
        await stewardMangementContract.processProposal(daoAddr, proposalId);
        const allWeight = await flexVotingContract.getAllGovernorWeight(daoAddr);

        proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const isSteward = await daoContract.isMember(this.user1.address);
        console.log(`
        voteRel ${voteRel.state} ${voteRel.nbYes}  ${voteRel.nbNo} 
        quorum ${allWeight * 66 / 100}

        state ${proposalDetail.state}
        isSteward ${isSteward}
        `);
    });

    it("erc20, voter 1 vote, support type integer, quorum type integer...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const flexVotingContract = this.flexVotingContract;

        const daoAddr = this.dao1_4;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;
        let votingWeight1 = await flexVotingContract.getVotingWeight(daoAddr, this.owner.address);
        let votingWeight2 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward1.address);
        let votingWeight3 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}

        `);

        await this.testtoken1.transfer(this.genesis_steward1.address, hre.ethers.utils.parseEther("1000"));
        await this.testtoken1.transfer(this.genesis_steward2.address, hre.ethers.utils.parseEther("1000"));
        votingWeight1 = await flexVotingContract.getVotingWeight(daoAddr, this.owner.address);
        votingWeight2 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward1.address);
        votingWeight3 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        vote for steward proposal...
        `);

        await flexVotingContract.submitVote(daoAddr, proposalId, 2);
        await flexVotingContract.connect(this.genesis_steward1).submitVote(daoAddr, proposalId, 1);
        await flexVotingContract.connect(this.genesis_steward2).submitVote(daoAddr, proposalId, 1);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        const voteRel = await flexVotingContract.voteResult(daoAddr, proposalId);
        await stewardMangementContract.processProposal(daoAddr, proposalId);
        proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const isSteward = await daoContract.isMember(this.user1.address);
        console.log(`
        voteRel ${voteRel.state} ${voteRel.nbYes}  ${voteRel.nbNo} 
        state ${proposalDetail.state}
        isSteward ${isSteward}
        `);
    });

    it("ERC721, quantity, support type percentage, quorum type percentage...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const flexVotingContract = this.flexVotingContract;

        const daoAddr = this.dao2_1;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;
        let votingWeight1 = await flexVotingContract.getVotingWeight(daoAddr, this.owner.address);
        let votingWeight2 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward1.address);
        let votingWeight3 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}

        `);
        await this.testERC721.mintPixel(this.owner.address, 0, 0);
        await this.testERC721.mintPixel(this.owner.address, 0, 1);

        await this.testERC721.mintPixel(this.genesis_steward1.address, 0, 2);
        await this.testERC721.mintPixel(this.genesis_steward1.address, 0, 3);

        await this.testERC721.mintPixel(this.genesis_steward2.address, 1, 0);
        await this.testERC721.mintPixel(this.genesis_steward2.address, 1, 1);

        votingWeight1 = await flexVotingContract.getVotingWeight(daoAddr, this.owner.address);
        votingWeight2 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward1.address);
        votingWeight3 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        vote for steward proposal...
        `);

        await flexVotingContract.submitVote(daoAddr, proposalId, 2);
        await flexVotingContract.connect(this.genesis_steward1).submitVote(daoAddr, proposalId, 1);
        await flexVotingContract.connect(this.genesis_steward2).submitVote(daoAddr, proposalId, 1);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        const voteRel = await flexVotingContract.voteResult(daoAddr, proposalId);
        await stewardMangementContract.processProposal(daoAddr, proposalId);
        const allWeight = await flexVotingContract.getAllGovernorWeight(daoAddr);

        proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const isSteward = await daoContract.isMember(this.user1.address);
        console.log(`
        voteRel ${voteRel.state} ${voteRel.nbYes}  ${voteRel.nbNo} 
        quorum ${allWeight * 66 / 100}

        state ${proposalDetail.state}
        isSteward ${isSteward}
        `);
    });

    it("ERC721, quantity, support type percentage, quorum type percentage...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const flexVotingContract = this.flexVotingContract;

        const daoAddr = this.dao2_2;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;
        let votingWeight1 = await flexVotingContract.getVotingWeight(daoAddr, this.owner.address);
        let votingWeight2 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward1.address);
        let votingWeight3 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);


        console.log(`
        vote for steward proposal...
        `);

        await flexVotingContract.submitVote(daoAddr, proposalId, 2);
        await flexVotingContract.connect(this.genesis_steward1).submitVote(daoAddr, proposalId, 1);
        await flexVotingContract.connect(this.genesis_steward2).submitVote(daoAddr, proposalId, 1);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        const voteRel = await flexVotingContract.voteResult(daoAddr, proposalId);
        await stewardMangementContract.processProposal(daoAddr, proposalId);
        const allWeight = await flexVotingContract.getAllGovernorWeight(daoAddr);

        proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const isSteward = await daoContract.isMember(this.user1.address);
        console.log(`
        voteRel ${voteRel.state} ${voteRel.nbYes}  ${voteRel.nbNo} 
        quorum ${allWeight * 66 / 100}

        state ${proposalDetail.state}
        isSteward ${isSteward}
        `);
    });

    it("ERC721, log2, support type percentage, quorum type percentage...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const flexVotingContract = this.flexVotingContract;

        const daoAddr = this.dao2_3;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;
        let votingWeight1 = await flexVotingContract.getVotingWeight(daoAddr, this.owner.address);
        let votingWeight2 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward1.address);
        let votingWeight3 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);


        console.log(`
        vote for steward proposal...
        `);

        await flexVotingContract.submitVote(daoAddr, proposalId, 2);
        await flexVotingContract.connect(this.genesis_steward1).submitVote(daoAddr, proposalId, 1);
        await flexVotingContract.connect(this.genesis_steward2).submitVote(daoAddr, proposalId, 1);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        const voteRel = await flexVotingContract.voteResult(daoAddr, proposalId);
        await stewardMangementContract.processProposal(daoAddr, proposalId);
        const allWeight = await flexVotingContract.getAllGovernorWeight(daoAddr);

        proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const isSteward = await daoContract.isMember(this.user1.address);
        console.log(`
        voteRel ${voteRel.state} ${voteRel.nbYes}  ${voteRel.nbNo} 
        quorum ${allWeight * 66 / 100}

        state ${proposalDetail.state}
        isSteward ${isSteward}
        `);
    });

    it("ERC721, log2, support type integer, quorum type integer...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const flexVotingContract = this.flexVotingContract;

        const daoAddr = this.dao2_4;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;
        let votingWeight1 = await flexVotingContract.getVotingWeight(daoAddr, this.owner.address);
        let votingWeight2 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward1.address);
        let votingWeight3 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);

        console.log(`

        vote for steward proposal...
        `);

        await flexVotingContract.submitVote(daoAddr, proposalId, 2);
        await flexVotingContract.connect(this.genesis_steward1).submitVote(daoAddr, proposalId, 1);
        await flexVotingContract.connect(this.genesis_steward2).submitVote(daoAddr, proposalId, 1);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        const voteRel = await flexVotingContract.voteResult(daoAddr, proposalId);
        await stewardMangementContract.processProposal(daoAddr, proposalId);
        proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const isSteward = await daoContract.isMember(this.user1.address);
        console.log(`
        voteRel ${voteRel.state} ${voteRel.nbYes}  ${voteRel.nbNo} 
        state ${proposalDetail.state}
        isSteward ${isSteward}
        `);
    });

    it("ERC721, 1 voter 1 vote, support type percentage, quorum type percentage...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const flexVotingContract = this.flexVotingContract;

        const daoAddr = this.dao2_5;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;
        let votingWeight1 = await flexVotingContract.getVotingWeight(daoAddr, this.owner.address);
        let votingWeight2 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward1.address);
        let votingWeight3 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);


        console.log(`
        vote for steward proposal...
        `);

        await flexVotingContract.submitVote(daoAddr, proposalId, 2);
        await flexVotingContract.connect(this.genesis_steward1).submitVote(daoAddr, proposalId, 1);
        await flexVotingContract.connect(this.genesis_steward2).submitVote(daoAddr, proposalId, 1);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        const voteRel = await flexVotingContract.voteResult(daoAddr, proposalId);
        await stewardMangementContract.processProposal(daoAddr, proposalId);
        const allWeight = await flexVotingContract.getAllGovernorWeight(daoAddr);

        proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const isSteward = await daoContract.isMember(this.user1.address);
        console.log(`
        voteRel ${voteRel.state} ${voteRel.nbYes}  ${voteRel.nbNo} 
        quorum ${allWeight * 66 / 100}

        state ${proposalDetail.state}
        isSteward ${isSteward}
        `);
    });

    it("ERC721, 1 voter 1 vote, support type integer, quorum type integer...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const flexVotingContract = this.flexVotingContract;

        const daoAddr = this.dao2_6;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;
        let votingWeight1 = await flexVotingContract.getVotingWeight(daoAddr, this.owner.address);
        let votingWeight2 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward1.address);
        let votingWeight3 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);

        console.log(`
        vote for steward proposal...
        `);

        await flexVotingContract.submitVote(daoAddr, proposalId, 2);
        await flexVotingContract.connect(this.genesis_steward1).submitVote(daoAddr, proposalId, 1);
        await flexVotingContract.connect(this.genesis_steward2).submitVote(daoAddr, proposalId, 1);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        const voteRel = await flexVotingContract.voteResult(daoAddr, proposalId);
        await stewardMangementContract.processProposal(daoAddr, proposalId);
        proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const isSteward = await daoContract.isMember(this.user1.address);
        console.log(`
        voteRel ${voteRel.state} ${voteRel.nbYes}  ${voteRel.nbNo} 
        state ${proposalDetail.state}
        isSteward ${isSteward}
        `);
    });

    it("erc1155, quantity, support type percentage, quorum type percentage...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const flexVotingContract = this.flexVotingContract;

        const daoAddr = this.dao3;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;
        let votingWeight1 = await flexVotingContract.getVotingWeight(daoAddr, this.owner.address);
        let votingWeight2 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward1.address);
        let votingWeight3 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);

        await this.testERC1155.mint(this.owner.address, 1, 2, hexToBytes(toHex(2233)));
        await this.testERC1155.mint(this.genesis_steward1.address, 1, 2, hexToBytes(toHex(2233)));
        await this.testERC1155.mint(this.genesis_steward2.address, 1, 2, hexToBytes(toHex(2233)));
        votingWeight1 = await flexVotingContract.getVotingWeight(daoAddr, this.owner.address);
        votingWeight2 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward1.address);
        votingWeight3 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward2.address);
        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        vote for steward proposal...
        `);

        await flexVotingContract.submitVote(daoAddr, proposalId, 2);
        await flexVotingContract.connect(this.genesis_steward1).submitVote(daoAddr, proposalId, 1);
        await flexVotingContract.connect(this.genesis_steward2).submitVote(daoAddr, proposalId, 1);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        const voteRel = await flexVotingContract.voteResult(daoAddr, proposalId);
        await stewardMangementContract.processProposal(daoAddr, proposalId);
        const allWeight = await flexVotingContract.getAllGovernorWeight(daoAddr);

        proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const isSteward = await daoContract.isMember(this.user1.address);
        console.log(`
        voteRel ${voteRel.state} ${voteRel.nbYes}  ${voteRel.nbNo} 
        quorum ${allWeight * 66 / 100}

        state ${proposalDetail.state}
        isSteward ${isSteward}
        `);
    });

    it("allocation, quantity, support type percentage, quorum type percentage...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const flexVotingContract = this.flexVotingContract;

        const daoAddr = this.dao4;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;
        let votingWeight1 = await flexVotingContract.getVotingWeight(daoAddr, this.owner.address);
        let votingWeight2 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward1.address);
        let votingWeight3 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);

        console.log(`
        vote for steward proposal...
        `);

        await flexVotingContract.submitVote(daoAddr, proposalId, 2);
        await flexVotingContract.connect(this.genesis_steward1).submitVote(daoAddr, proposalId, 1);
        await flexVotingContract.connect(this.genesis_steward2).submitVote(daoAddr, proposalId, 1);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        const voteRel = await flexVotingContract.voteResult(daoAddr, proposalId);
        await stewardMangementContract.processProposal(daoAddr, proposalId);
        const allWeight = await flexVotingContract.getAllGovernorWeight(daoAddr);

        proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const isSteward = await daoContract.isMember(this.user1.address);
        console.log(`
        voteRel ${voteRel.state} ${voteRel.nbYes}  ${voteRel.nbNo} 
        quorum ${allWeight * 66 / 100}

        state ${proposalDetail.state}
        isSteward ${isSteward}
        `);
    });

    it("allocation log2...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const flexVotingContract = this.flexVotingContract;

        const daoAddr = this.dao4_1;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;
        let votingWeight1 = await flexVotingContract.getVotingWeight(daoAddr, this.owner.address);
        let votingWeight2 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward1.address);
        let votingWeight3 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);

        console.log(`
        vote for steward proposal...
        `);

        await flexVotingContract.submitVote(daoAddr, proposalId, 2);
        await flexVotingContract.connect(this.genesis_steward1).submitVote(daoAddr, proposalId, 1);
        await flexVotingContract.connect(this.genesis_steward2).submitVote(daoAddr, proposalId, 1);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        const voteRel = await flexVotingContract.voteResult(daoAddr, proposalId);
        await stewardMangementContract.processProposal(daoAddr, proposalId);
        const allWeight = await flexVotingContract.getAllGovernorWeight(daoAddr);

        proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const isSteward = await daoContract.isMember(this.user1.address);
        console.log(`
        voteRel ${voteRel.state} ${voteRel.nbYes}  ${voteRel.nbNo} 
        quorum ${allWeight * 66 / 100}

        state ${proposalDetail.state}
        isSteward ${isSteward}
        `);
    });

    it("allocation 1 voter 1 vote", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const flexVotingContract = this.flexVotingContract;

        const daoAddr = this.dao4_2;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;
        let votingWeight1 = await flexVotingContract.getVotingWeight(daoAddr, this.owner.address);
        let votingWeight2 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward1.address);
        let votingWeight3 = await flexVotingContract.getVotingWeight(daoAddr, this.genesis_steward2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);

        console.log(`
        vote for steward proposal...
        `);

        await flexVotingContract.submitVote(daoAddr, proposalId, 2);
        await flexVotingContract.connect(this.genesis_steward1).submitVote(daoAddr, proposalId, 1);
        await flexVotingContract.connect(this.genesis_steward2).submitVote(daoAddr, proposalId, 1);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        const voteRel = await flexVotingContract.voteResult(daoAddr, proposalId);
        await stewardMangementContract.processProposal(daoAddr, proposalId);
        const allWeight = await flexVotingContract.getAllGovernorWeight(daoAddr);

        proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const isSteward = await daoContract.isMember(this.user1.address);
        console.log(`
        voteRel ${voteRel.state} ${voteRel.nbYes}  ${voteRel.nbNo} 
        quorum ${allWeight * 66 / 100}

        state ${proposalDetail.state}
        isSteward ${isSteward}
        `);
    });
})

describe("polling voting...", () => {
    before("summon a flex dao...", async () => {
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
            managementFeeAccount,
            steward_whitelist1, steward_whitelist2
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
        this.steward_whitelist1 = steward_whitelist1;
        this.steward_whitelist2 = steward_whitelist2;
        this.managementFeeAccount = managementFeeAccount;

        let _daoName = "my_flex_dao1";
        const {
            dao,
            factories,
            adapters,
            extensions,
            testContracts
        } = await deployDefaultDao({
            owner: this.owner,
            daoMode: 1, //  Vintage = 0, Flex = 1,   Collective = 2,
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
        // this.managing = this.adapters.managing.instance;
        this.flexPollingVotingContract = adapters.flexPollingVotingContract.instance;
        this.summonDao = this.adapters.summonDao.instance;
        this.flexStewardMangement = this.adapters.stewardManagementContract.instance;
        this.flexStewardAllocation = adapters.flexStewardAllocation.instance;
        this.flexFundingReturnTokenAdapterContract = adapters.flexFundingReturnTokenAdapterContract.instance;
        this.flexFreeInEscrowFundAdapterContract = adapters.flexFreeInEscrowFundAdapterContract.instance;
        this.flexFundingHelperAdapterContract = adapters.flexFundingHelperAdapterContract.instance;
        this.flexDaoSetAdapterContract = adapters.flexDaoSetAdapterContract.instance;
        this.flexDaoSetHelperAdapterContract = adapters.flexDaoSetHelperAdapterContract.instance;
        this.flexDaoSetPollingAdapterContract = adapters.flexDaoSetPollingAdapterContract.instance;
        this.flexDaoSetVotingAdapterContract = adapters.flexDaoSetVotingAdapterContract.instance;
        this.flexDaoSetFeesAdapterContract = adapters.flexDaoSetFeesAdapterContract.instance;
        this.flexDaoSetGovernorMembershipAdapterContract = adapters.flexDaoSetGovernorMembershipAdapterContract.instance;
        this.flexDaoSetInvestorCapAdapterContract = adapters.flexDaoSetInvestorCapAdapterContract.instance;
        this.flexDaoSetInvestorMembershipAdapterContract = adapters.flexDaoSetInvestorMembershipAdapterContract.instance;
        this.flexDaoSetProposerMembershipAdapterContract = adapters.flexDaoSetProposerMembershipAdapterContract.instance;
        this.flexSetRiceReceiverProposalAdapterContract = adapters.flexSetRiceReceiverProposalAdapterContract.instance;

        console.log("flexStewardMangement addr ", this.flexStewardMangement.address);

        const ERC721 = await hre.ethers.getContractFactory("PixelNFT");
        const erc721 = await ERC721.deploy(4);
        await erc721.deployed();
        this.testERC721 = erc721;

        const ERC1155 = await hre.ethers.getContractFactory("ERC1155TestToken");
        const erc1155 = await ERC1155.deploy("this is test uri");
        await erc1155.deployed();
        this.testERC1155 = erc1155;

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];

        const creator = this.owner.address;

        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd', //FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35', //FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8', //FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c', //FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7', //FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610', //FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda', //FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 770
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753', //StewardMangement
                addr: this.flexStewardMangement.address,
                flags: 6338
            },
            {
                id: '0x37cbe06c1044f98864ea25736326bc1d488e24e5e23781ea2ad64c4069cb9e6e', //flexStewardAllocationAdapter
                addr: this.flexStewardAllocation.address,
                flags: 0
            },
            {
                id: '0x43f8439a5cef099d0d9a92b15a64e34ff49963bb29d65f63204eda6591b810a1', //flexFundingReturnTokenAdapter
                addr: this.flexFundingReturnTokenAdapterContract.address,
                flags: 0
            },
            {
                id: '0xeae11da953333a83b6467e2193334fb302549e1a42ad5797082aea1ab6be9120', //flexFreeInEscrowFundAdapterContract
                addr: this.flexFreeInEscrowFundAdapterContract.address,
                flags: 0
            },
            {
                id: '0xc8e81510cbc5ec7970040e233b001587da1ea4484a9f7b8710d3322429c2df23', //flexFundingHelperAdapterContract
                addr: this.flexFundingHelperAdapterContract.address,
                flags: 0
            },
            // {
            //     id: '0xe564b2da9fb62dadceed6d94ac5884ac5f464424e7be661d7d6181d49fa87b3f', //flexDaoSetAdapterContract
            //     addr: this.flexDaoSetAdapterContract.address,
            //     flags: 778242
            // },
            {
                id: '0xff9379b98b93eb3bd1fac62fd2258a7955d70d2d5279c40064145b6c9646df37', //flexDaoSetHelperAdapterContract
                addr: this.flexDaoSetHelperAdapterContract.address,
                flags: 8
            },
            {
                id: '0x5f0e8d109045653360289a7a02d5dc2a99e382006a42ef93f66de55ecff3176f',// flexDaoSetPollingAdapterContract
                addr: this.flexDaoSetPollingAdapterContract.address,
                flags: 262146
            },
            {
                id: '0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7',//flexDaoSetVotingAdapterContract
                addr: this.flexDaoSetVotingAdapterContract.address,
                flags: 65538
            },
            {
                id: '0xc6bb47f9566baa74b5032b5c10e5bf4a1e2382ca337c2de674732f6401d52cc0',//flexDaoSetFeesAdapterContract
                addr: this.flexDaoSetFeesAdapterContract.address,
                flags: 131074
            },
            {
                id: '0x869e5d18913d4e9bb387c730a04b58d11e95102194f7217a4b684f6e61dff920',//flexDaoSetGovernorMembershipAdapterContract
                addr: this.flexDaoSetGovernorMembershipAdapterContract.address,
                flags: 16386
            },
            {
                id: '0x08f2d2eeda0c9072cdba8b58d442503b4cf9eb6c2f74d75e91dc719111c3189c',//flexDaoSetInvestorCapAdapterContract
                addr: this.flexDaoSetInvestorCapAdapterContract.address,
                flags: 8194
            },
            {
                id: '0xe6121cbf77e02f965a1829c382f701ad4cec84fbda84c45378db0768d2e40871',//flexDaoSetInvestorMembershipAdapterContract
                addr: this.flexDaoSetInvestorMembershipAdapterContract.address,
                flags: 32770
            },
            {
                id: '0xf3ce48289b9021e92bc5661ccf481e756dcb8de846c2eb9620bb83917cab5237',//flexDaoSetProposerMembershipAdapterContract
                addr: this.flexDaoSetProposerMembershipAdapterContract.address,
                flags: 524290
            },
            {
                id: '0xcdb9c6d5700c127f2c99a75e51af1f56590e1b02f8f6ceee2d51d67dd0e91cad',//flexSetRiceReceiverProposalAdapterContract
                addr: this.flexSetRiceReceiverProposalAdapterContract.address,
                flags: 33554442
            }

        ];


        const adapters1 = [{
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: this.flexFundingPoolAdapterContract.address, //FlexFundingPoolAdapterContract
            flags: 75
        },
        {
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: this.flexFundingAdapterContract.address, //FlexFundingAdapterContract
            flags: 26
        }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const flexDaoParticipantCapInfo = [
            true, //bool enable;
            5 //uint256 maxParticipantsAmount;
        ]

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMemberships = [
            0, // uint8 varifyType;
            "flexDaoIvestorsMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            "flexDaoGovernorMembershipName",
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        //erc20, quantity, support type percentage, quorum type percentage
        const flexDaoVotingInfo1_1 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];
        //erc20, log2, support type percentage, quorum type percentage
        const flexDaoVotingInfo1_2 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            1, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];
        //erc20, voter 1 vote, support type percentage, quorum type percentage
        const flexDaoVotingInfo1_3 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            2, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];

        //erc20, voter 1 vote, support type integer, quorum type integer
        const flexDaoVotingInfo1_4 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            2, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            1, //supportType
            1 //quorumType
        ];

        //ERC721, quantity, support type percentage, quorum type percentage
        const flexDaoVotingInfo2_1 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testERC721.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];
        //ERC721, quantity, support type integer, quorum type integer
        const flexDaoVotingInfo2_2 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testERC721.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];
        //ERC721, log2, support type percentage, quorum type percentage
        const flexDaoVotingInfo2_3 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testERC721.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            1, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];
        //ERC721, log2, support type integer, quorum type integer
        const flexDaoVotingInfo2_4 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testERC721.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            1, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            1, //supportType
            1 //quorumType
        ];
        //ERC721, 1 voter 1 vote, support type percentage, quorum type percentage
        const flexDaoVotingInfo2_5 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testERC721.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            2, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];
        //ERC721, 1 voter 1 vote, support type integer, quorum type integer
        const flexDaoVotingInfo2_6 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testERC721.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            2, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            1, //supportType
            1 //quorumType
        ];

        //erc1155, quantity, support type percentage, quorum type percentage
        const flexDaoVotingInfo3 = [
            2, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testERC1155.address, //tokenAddress
            1, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];
        //allocation, quantity, support type percentage, quorum type percentage
        const flexDaoVotingInfo4 = [
            3, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];

        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            "flexDaoPollVoterMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //address[] whiteList;
        ];

        //erc20 , quantity
        const flexDaoPollingInfo1_1 = [
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            0, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];
        //erc20 , log2
        const flexDaoPollingInfo1_2 = [
            60 * 10, // uint256 votingPeriod;
            1, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            0, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];
        //erc20 , 1 voter 1 vote
        const flexDaoPollingInfo1_3 = [
            60 * 10, // uint256 votingPeriod;
            2, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            0, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];

        //erc721 , quantity
        const flexDaoPollingInfo2_1 = [
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            1, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testERC721.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];
        //erc721 , log2
        const flexDaoPollingInfo2_2 = [
            60 * 10, // uint256 votingPeriod;
            1, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            1, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testERC721.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];
        //erc721 , 1 voter 1 vote
        const flexDaoPollingInfo2_3 = [
            60 * 10, // uint256 votingPeriod;
            2, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            1, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testERC721.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];

        //erc1155 , quantity
        const flexDaoPollingInfo3_1 = [
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            2, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testERC1155.address, //   address tokenAddress;
            1, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];
        //erc1155 , log2
        const flexDaoPollingInfo3_2 = [
            60 * 10, // uint256 votingPeriod;
            1, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            2, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testERC1155.address, //   address tokenAddress;
            1, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];
        //erc1155 , 1 voter 1 vote
        const flexDaoPollingInfo3_3 = [
            60 * 10, // uint256 votingPeriod;
            2, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            2, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testERC1155.address, //   address tokenAddress;
            1, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];

        //allocation , quantity
        const flexDaoPollingInfo4_1 = [
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            3, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testERC1155.address, //   address tokenAddress;
            1, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];
        //allocation , log2
        const flexDaoPollingInfo4_2 = [
            60 * 10, // uint256 votingPeriod;
            1, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            3, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testERC1155.address, //   address tokenAddress;
            1, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];
        //allocation , 1 voter 1 vote
        const flexDaoPollingInfo4_3 = [
            60 * 10, // uint256 votingPeriod;
            2, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            3, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testERC1155.address, //   address tokenAddress;
            1, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];

        const flexDaoProposerMembershipInfo = [
            true,
            "flexDaoProposerMembershipName",
            3, // uint8 varifyType;
            0, // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0, // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address] // address[] whiteList;
        ];

        const flexDaoManagementfee = hre.ethers.utils.parseEther("0.002"); // 0.2%
        const returnTokenManagementFee = hre.ethers.utils.parseEther("0.0012");
        const flexDaoGenesisStewards = [
            this.genesis_steward1.address,
            this.genesis_steward2.address
        ];
        const allocations = [10, 20, 30];
        const fundingPollEnable = true; //poll mode
        const flexDaoFundriaseStyle = 0 // 0 - FCFS 1- Free in
        const riceRewardReceiver = this.user1.address;

        _daoName = "my_flex_dao2";
        let _daoName1_1 = "my_flex_dao1-1";
        let _daoName1_2 = "my_flex_dao1-2";
        let _daoName1_3 = "my_flex_dao1-3";
        let _daoName2_1 = "my_flex_dao2-1";
        let _daoName2_2 = "my_flex_dao2-2";
        let _daoName2_3 = "my_flex_dao2-3";
        let _daoName3_1 = "my_flex_dao3-1";
        let _daoName3_2 = "my_flex_dao3-2";
        let _daoName3_3 = "my_flex_dao3-3";
        let _daoName4_1 = "my_flex_dao4-1";
        let _daoName4_2 = "my_flex_dao4-2";
        let _daoName4_3 = "my_flex_dao4-3";

        const flexDaoInfo1_1 = {
            name: _daoName1_1, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }
        const flexDaoInfo1_2 = {
            name: _daoName1_2, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        };
        const flexDaoInfo1_3 = {
            name: _daoName1_3, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        };
        const flexDaoInfo2_1 = {
            name: _daoName2_1, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        };
        const flexDaoInfo2_2 = {
            name: _daoName2_2, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        };
        const flexDaoInfo2_3 = {
            name: _daoName2_3, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }
        const flexDaoInfo3_1 = {
            name: _daoName3_1, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        };
        const flexDaoInfo3_2 = {
            name: _daoName3_2, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }
        const flexDaoInfo3_3 = {
            name: _daoName3_3, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        };
        const flexDaoInfo4_1 = {
            name: _daoName4_1, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }
        const flexDaoInfo4_2 = {
            name: _daoName4_2, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        };
        const flexDaoInfo4_3 = {
            name: _daoName4_3, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }
        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0, // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address, // address tokenAddress;
            tokenId: 0, // uint256 tokenId;
            whiteList: [], // address[] whiteList;
            priorityPeriod: 60 * 10 // uint256 priorityPeriod;
        }

        const flexDaoParams1_1 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo1_1, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo1_1, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo1_1, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams1_2 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo1_2, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo1_2, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo1_2, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams1_3 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo1_3, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo1_3, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo1_3, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams2_1 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo1_4, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo2_1, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo2_1, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams2_2 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo2_1, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo2_2, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo2_2, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams2_3 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo2_2, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo2_3, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo2_3, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams3_1 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo2_3, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo3_1, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo3_1, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams3_2 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo2_4, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo3_2, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo3_2, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams3_3 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo2_5, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo3_3, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo3_3, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams4_1 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo2_6, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo4_1, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo4_1, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams4_2 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo3, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo4_2, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo4_2, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams4_3 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo4, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo4_3, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo4_3, //    flexDaoInfo _flexDaoInfo;
        ];
        let obj1_1 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams1_1);
        console.log(`
        new dao address ${obj1_1.daoAddr}
        new dao name ${toUtf8(obj1_1.daoName)}
        `);

        let obj1_2 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams1_2);
        console.log("dao1_2 created...");
        let obj1_3 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams1_3);
        console.log("dao1_3 created...");

        let obj2_1 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams2_1);
        console.log("dao2_1 created...");

        let obj2_2 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams2_2);
        console.log("dao2_2 created...");

        let obj2_3 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams2_3);
        console.log("dao2_3 created...");

        let obj3_1 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams3_1);
        console.log("dao3_1 created...");

        let obj3_2 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams3_2);
        console.log("dao3_2 created...");

        let obj3_3 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams3_3);
        console.log("dao3_3 created...");

        let obj4_1 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams4_1);
        console.log("dao4_1 created...");

        let obj4_2 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams4_2);
        console.log("dao4_2 created...");

        let obj4_3 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams4_3);
        console.log("dao4_3 created...");

        this.dao1_1 = obj1_1.daoAddr;
        this.dao1_2 = obj1_2.daoAddr;
        this.dao1_3 = obj1_3.daoAddr;
        this.dao2_1 = obj2_1.daoAddr;
        this.dao2_2 = obj2_2.daoAddr;
        this.dao2_3 = obj2_3.daoAddr;
        this.dao3_1 = obj3_1.daoAddr;
        this.dao3_2 = obj3_2.daoAddr;
        this.dao3_3 = obj3_3.daoAddr;
        this.dao4_1 = obj4_1.daoAddr;
        this.dao4_2 = obj4_2.daoAddr;
        this.dao4_3 = obj4_3.daoAddr;
    });

    const sommonFlexDao = async (summonDaoContract, daoFactoryContract, flexDaoParams) => {
        let tx = await summonDaoContract.summonFlexDao(flexDaoParams);
        let result = await tx.wait();
        const daoAddr = await daoFactoryContract.getDaoAddress(flexDaoParams[flexDaoParams.length - 1].name);
        const daoName = await daoFactoryContract.daos(daoAddr);


        return {
            daoAddr: daoAddr,
            daoName: daoName
        };
    };

    it("erc20 , quantity...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.dao1_1);
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%


        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];

        const priorityWhitelist = [];
        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
        ];
        console.log(fundingParams);
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
        flex funding ProposalId: ${proposalId}
        state ${flexFundingProposalInfo.state}
        voting...
        `);

        const flexFundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexPollingVoting = this.flexPollingVotingContract;
        const fundRaiseStartTimes = flexFundingProposalInfo.fundRaiseInfo.fundRaiseStartTime;
        const stopVoteTime = flexFundingProposalInfo.stopVoteTime;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let votingWeight1 = await flexPollingVoting.getVotingWeight(this.dao1_1, this.owner.address);
        let votingWeight2 = await flexPollingVoting.getVotingWeight(this.dao1_1, this.pollster_membership_whitelist1.address);
        let votingWeight3 = await flexPollingVoting.getVotingWeight(this.dao1_1, this.pollster_membership_whitelist2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);

        await this.testtoken1.transfer(this.pollster_membership_whitelist1.address, hre.ethers.utils.parseEther("1000"));
        await this.testtoken1.transfer(this.pollster_membership_whitelist2.address, hre.ethers.utils.parseEther("1000"));


        votingWeight1 = await flexPollingVoting.getVotingWeight(this.dao1_1, this.owner.address);
        votingWeight2 = await flexPollingVoting.getVotingWeight(this.dao1_1, this.pollster_membership_whitelist1.address);
        votingWeight3 = await flexPollingVoting.getVotingWeight(this.dao1_1, this.pollster_membership_whitelist2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);
        await flexPollingVoting.connect(this.owner).submitVote(dao.address, proposalId, 1);
        await flexPollingVoting.connect(this.pollster_membership_whitelist1).submitVote(dao.address, proposalId, 1);
        await flexPollingVoting.connect(this.pollster_membership_whitelist2).submitVote(dao.address, proposalId, 1);

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const voteRel = await flexPollingVoting.voteResult(dao.address, proposalId);
        console.log(`
        voting result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        processing proposal...
        `);
        await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        voted and processed...
        state ${flexFundingProposalInfo.state}
        `);
    });

    it("erc20 , log2...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.dao1_2);
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%


        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];


        const priorityWhitelist = [];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
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
        flex funding ProposalId: ${proposalId}
        state ${flexFundingProposalInfo.state}
        voting...
        `);

        const flexFundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexPollingVoting = this.flexPollingVotingContract;
        const fundRaiseStartTimes = flexFundingProposalInfo.fundRaiseInfo.fundRaiseStartTime;
        const stopVoteTime = flexFundingProposalInfo.stopVoteTime;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let votingWeight1 = await flexPollingVoting.getVotingWeight(this.dao1_2, this.owner.address);
        let votingWeight2 = await flexPollingVoting.getVotingWeight(this.dao1_2, this.pollster_membership_whitelist1.address);
        let votingWeight3 = await flexPollingVoting.getVotingWeight(this.dao1_2, this.pollster_membership_whitelist2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);

        await flexPollingVoting.connect(this.owner).submitVote(dao.address, proposalId, 1);
        await flexPollingVoting.connect(this.pollster_membership_whitelist1).submitVote(dao.address, proposalId, 2);
        await flexPollingVoting.connect(this.pollster_membership_whitelist2).submitVote(dao.address, proposalId, 1);

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const voteRel = await flexPollingVoting.voteResult(dao.address, proposalId);
        console.log(`
        voting result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        processing proposal...
        `);
        await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        voted and processed...
        state ${flexFundingProposalInfo.state}
        `);
    })

    it("erc20 , 1 voter 1 vote...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.dao1_3);
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%


        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];


        const priorityWhitelist = [];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
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
        flex funding ProposalId: ${proposalId}
        state ${flexFundingProposalInfo.state}
        voting...
        `);

        const flexFundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexPollingVoting = this.flexPollingVotingContract;
        const fundRaiseStartTimes = flexFundingProposalInfo.fundRaiseInfo.fundRaiseStartTime;
        const stopVoteTime = flexFundingProposalInfo.stopVoteTime;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let votingWeight1 = await flexPollingVoting.getVotingWeight(this.dao1_3, this.owner.address);
        let votingWeight2 = await flexPollingVoting.getVotingWeight(this.dao1_3, this.pollster_membership_whitelist1.address);
        let votingWeight3 = await flexPollingVoting.getVotingWeight(this.dao1_3, this.pollster_membership_whitelist2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);

        await flexPollingVoting.connect(this.owner).submitVote(dao.address, proposalId, 1);
        await flexPollingVoting.connect(this.pollster_membership_whitelist1).submitVote(dao.address, proposalId, 2);
        await flexPollingVoting.connect(this.pollster_membership_whitelist2).submitVote(dao.address, proposalId, 1);

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const voteRel = await flexPollingVoting.voteResult(dao.address, proposalId);
        console.log(`
        voting result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        processing proposal...
        `);
        await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        voted and processed...
        state ${flexFundingProposalInfo.state}
        `);
    })

    it("erc721 , quantity...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.dao2_1);
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%


        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];

        const priorityWhitelist = [];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
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
        flex funding ProposalId: ${proposalId}
        state ${flexFundingProposalInfo.state}
        voting...
        `);

        const flexFundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexPollingVoting = this.flexPollingVotingContract;
        const fundRaiseStartTimes = flexFundingProposalInfo.fundRaiseInfo.fundRaiseStartTime;
        const stopVoteTime = flexFundingProposalInfo.stopVoteTime;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let votingWeight1 = await flexPollingVoting.getVotingWeight(this.dao2_1, this.owner.address);
        let votingWeight2 = await flexPollingVoting.getVotingWeight(this.dao2_1, this.pollster_membership_whitelist1.address);
        let votingWeight3 = await flexPollingVoting.getVotingWeight(this.dao2_1, this.pollster_membership_whitelist2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);

        await this.testERC721.mintPixel(this.owner.address, 0, 0);
        await this.testERC721.mintPixel(this.owner.address, 0, 1);

        await this.testERC721.mintPixel(this.pollster_membership_whitelist1.address, 0, 2);
        await this.testERC721.mintPixel(this.pollster_membership_whitelist1.address, 0, 3);

        await this.testERC721.mintPixel(this.pollster_membership_whitelist2.address, 1, 0);
        await this.testERC721.mintPixel(this.pollster_membership_whitelist2.address, 1, 1);


        votingWeight1 = await flexPollingVoting.getVotingWeight(this.dao2_1, this.owner.address);
        votingWeight2 = await flexPollingVoting.getVotingWeight(this.dao2_1, this.pollster_membership_whitelist1.address);
        votingWeight3 = await flexPollingVoting.getVotingWeight(this.dao2_1, this.pollster_membership_whitelist2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);
        await flexPollingVoting.connect(this.owner).submitVote(dao.address, proposalId, 1);
        await flexPollingVoting.connect(this.pollster_membership_whitelist1).submitVote(dao.address, proposalId, 1);
        await flexPollingVoting.connect(this.pollster_membership_whitelist2).submitVote(dao.address, proposalId, 1);

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const voteRel = await flexPollingVoting.voteResult(dao.address, proposalId);
        console.log(`
        voting result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        processing proposal...
        `);
        await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        voted and processed...
        state ${flexFundingProposalInfo.state}
        `);
    });

    it("erc721 , log2...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.dao2_2);
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%


        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];


        const priorityWhitelist = [];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
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
        flex funding ProposalId: ${proposalId}
        state ${flexFundingProposalInfo.state}
        voting...
        `);

        const flexFundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexPollingVoting = this.flexPollingVotingContract;
        const fundRaiseStartTimes = flexFundingProposalInfo.fundRaiseInfo.fundRaiseStartTime;
        const stopVoteTime = flexFundingProposalInfo.stopVoteTime;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let votingWeight1 = await flexPollingVoting.getVotingWeight(this.dao2_2, this.owner.address);
        let votingWeight2 = await flexPollingVoting.getVotingWeight(this.dao2_2, this.pollster_membership_whitelist1.address);
        let votingWeight3 = await flexPollingVoting.getVotingWeight(this.dao2_2, this.pollster_membership_whitelist2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);

        await flexPollingVoting.connect(this.owner).submitVote(dao.address, proposalId, 1);
        await flexPollingVoting.connect(this.pollster_membership_whitelist1).submitVote(dao.address, proposalId, 2);
        await flexPollingVoting.connect(this.pollster_membership_whitelist2).submitVote(dao.address, proposalId, 1);

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const voteRel = await flexPollingVoting.voteResult(dao.address, proposalId);
        console.log(`
        voting result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        processing proposal...
        `);
        await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        voted and processed...
        state ${flexFundingProposalInfo.state}
        `);
    })

    it("erc721 , 1 voter 1 vote...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.dao2_3);
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%


        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];

        const priorityWhitelist = [];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
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
        flex funding ProposalId: ${proposalId}
        state ${flexFundingProposalInfo.state}
        voting...
        `);

        const flexFundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexPollingVoting = this.flexPollingVotingContract;
        const fundRaiseStartTimes = flexFundingProposalInfo.fundRaiseInfo.fundRaiseStartTime;
        const stopVoteTime = flexFundingProposalInfo.stopVoteTime;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let votingWeight1 = await flexPollingVoting.getVotingWeight(this.dao2_3, this.owner.address);
        let votingWeight2 = await flexPollingVoting.getVotingWeight(this.dao2_3, this.pollster_membership_whitelist1.address);
        let votingWeight3 = await flexPollingVoting.getVotingWeight(this.dao2_3, this.pollster_membership_whitelist2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);

        await flexPollingVoting.connect(this.owner).submitVote(dao.address, proposalId, 1);
        await flexPollingVoting.connect(this.pollster_membership_whitelist1).submitVote(dao.address, proposalId, 2);
        await flexPollingVoting.connect(this.pollster_membership_whitelist2).submitVote(dao.address, proposalId, 1);

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const voteRel = await flexPollingVoting.voteResult(dao.address, proposalId);
        console.log(`
        voting result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        processing proposal...
        `);
        await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        voted and processed...
        state ${flexFundingProposalInfo.state}
        `);
    })

    it("erc1155 , quantity...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.dao3_1);
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%


        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];


        const priorityWhitelist = [];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
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
        flex funding ProposalId: ${proposalId}
        state ${flexFundingProposalInfo.state}
        voting...
        `);

        const flexFundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexPollingVoting = this.flexPollingVotingContract;
        const fundRaiseStartTimes = flexFundingProposalInfo.fundRaiseInfo.fundRaiseStartTime;
        const stopVoteTime = flexFundingProposalInfo.stopVoteTime;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let votingWeight1 = await flexPollingVoting.getVotingWeight(this.dao3_1, this.owner.address);
        let votingWeight2 = await flexPollingVoting.getVotingWeight(this.dao3_1, this.pollster_membership_whitelist1.address);
        let votingWeight3 = await flexPollingVoting.getVotingWeight(this.dao3_1, this.pollster_membership_whitelist2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);

        await this.testERC1155.mint(this.owner.address, 1, 2, hexToBytes(toHex(2233)));
        await this.testERC1155.mint(this.pollster_membership_whitelist1.address, 1, 2, hexToBytes(toHex(2233)));
        await this.testERC1155.mint(this.pollster_membership_whitelist2.address, 1, 2, hexToBytes(toHex(2233)));


        votingWeight1 = await flexPollingVoting.getVotingWeight(this.dao3_1, this.owner.address);
        votingWeight2 = await flexPollingVoting.getVotingWeight(this.dao3_1, this.pollster_membership_whitelist1.address);
        votingWeight3 = await flexPollingVoting.getVotingWeight(this.dao3_1, this.pollster_membership_whitelist2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);
        await flexPollingVoting.connect(this.owner).submitVote(dao.address, proposalId, 1);
        await flexPollingVoting.connect(this.pollster_membership_whitelist1).submitVote(dao.address, proposalId, 1);
        await flexPollingVoting.connect(this.pollster_membership_whitelist2).submitVote(dao.address, proposalId, 1);

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const voteRel = await flexPollingVoting.voteResult(dao.address, proposalId);
        console.log(`
        voting result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        processing proposal...
        `);
        await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        voted and processed...
        state ${flexFundingProposalInfo.state}
        `);
    });

    it("erc1155 , log2...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.dao3_2);
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%


        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];


        const priorityWhitelist = [];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
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
        flex funding ProposalId: ${proposalId}
        state ${flexFundingProposalInfo.state}
        voting...
        `);

        const flexFundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexPollingVoting = this.flexPollingVotingContract;
        const fundRaiseStartTimes = flexFundingProposalInfo.fundRaiseInfo.fundRaiseStartTime;
        const stopVoteTime = flexFundingProposalInfo.stopVoteTime;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let votingWeight1 = await flexPollingVoting.getVotingWeight(this.dao3_2, this.owner.address);
        let votingWeight2 = await flexPollingVoting.getVotingWeight(this.dao3_2, this.pollster_membership_whitelist1.address);
        let votingWeight3 = await flexPollingVoting.getVotingWeight(this.dao3_2, this.pollster_membership_whitelist2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);

        await flexPollingVoting.connect(this.owner).submitVote(dao.address, proposalId, 1);
        await flexPollingVoting.connect(this.pollster_membership_whitelist1).submitVote(dao.address, proposalId, 2);
        await flexPollingVoting.connect(this.pollster_membership_whitelist2).submitVote(dao.address, proposalId, 1);

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const voteRel = await flexPollingVoting.voteResult(dao.address, proposalId);
        console.log(`
        voting result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        processing proposal...
        `);
        await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        voted and processed...
        state ${flexFundingProposalInfo.state}
        `);
    })

    it("erc1155 , 1 voter 1 vote...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.dao3_3);
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%


        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];


        const priorityWhitelist = [];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
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
        flex funding ProposalId: ${proposalId}
        state ${flexFundingProposalInfo.state}
        voting...
        `);

        const flexFundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexPollingVoting = this.flexPollingVotingContract;
        const fundRaiseStartTimes = flexFundingProposalInfo.fundRaiseInfo.fundRaiseStartTime;
        const stopVoteTime = flexFundingProposalInfo.stopVoteTime;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let votingWeight1 = await flexPollingVoting.getVotingWeight(this.dao3_3, this.owner.address);
        let votingWeight2 = await flexPollingVoting.getVotingWeight(this.dao3_3, this.pollster_membership_whitelist1.address);
        let votingWeight3 = await flexPollingVoting.getVotingWeight(this.dao3_3, this.pollster_membership_whitelist2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);

        await flexPollingVoting.connect(this.owner).submitVote(dao.address, proposalId, 1);
        await flexPollingVoting.connect(this.pollster_membership_whitelist1).submitVote(dao.address, proposalId, 2);
        await flexPollingVoting.connect(this.pollster_membership_whitelist2).submitVote(dao.address, proposalId, 1);

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const voteRel = await flexPollingVoting.voteResult(dao.address, proposalId);
        console.log(`
        voting result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        processing proposal...
        `);
        await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        voted and processed...
        state ${flexFundingProposalInfo.state}
        `);
    })

    it("allocation , quantity...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.dao4_1);
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%


        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];


        const priorityWhitelist = [];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
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
        flex funding ProposalId: ${proposalId}
        state ${flexFundingProposalInfo.state}
        voting...
        `);

        const flexFundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexPollingVoting = this.flexPollingVotingContract;
        const fundRaiseStartTimes = flexFundingProposalInfo.fundRaiseInfo.fundRaiseStartTime;
        const stopVoteTime = flexFundingProposalInfo.stopVoteTime;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let votingWeight1 = await flexPollingVoting.getVotingWeight(this.dao4_1, this.owner.address);
        let votingWeight2 = await flexPollingVoting.getVotingWeight(this.dao4_1, this.pollster_membership_whitelist1.address);
        let votingWeight3 = await flexPollingVoting.getVotingWeight(this.dao4_1, this.pollster_membership_whitelist2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);

        await flexPollingVoting.connect(this.owner).submitVote(dao.address, proposalId, 1);
        await flexPollingVoting.connect(this.pollster_membership_whitelist1).submitVote(dao.address, proposalId, 1);
        await flexPollingVoting.connect(this.pollster_membership_whitelist2).submitVote(dao.address, proposalId, 1);

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const voteRel = await flexPollingVoting.voteResult(dao.address, proposalId);
        console.log(`
        voting result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        processing proposal...
        `);
        await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        voted and processed...
        state ${flexFundingProposalInfo.state}
        `);
    });

    it("allocation , log2...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.dao4_2);
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%


        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];


        const priorityWhitelist = [];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
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
        flex funding ProposalId: ${proposalId}
        state ${flexFundingProposalInfo.state}
        voting...
        `);

        const flexFundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexPollingVoting = this.flexPollingVotingContract;
        const fundRaiseStartTimes = flexFundingProposalInfo.fundRaiseInfo.fundRaiseStartTime;
        const stopVoteTime = flexFundingProposalInfo.stopVoteTime;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let votingWeight1 = await flexPollingVoting.getVotingWeight(this.dao4_2, this.owner.address);
        let votingWeight2 = await flexPollingVoting.getVotingWeight(this.dao4_2, this.pollster_membership_whitelist1.address);
        let votingWeight3 = await flexPollingVoting.getVotingWeight(this.dao4_2, this.pollster_membership_whitelist2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);

        await flexPollingVoting.connect(this.owner).submitVote(dao.address, proposalId, 1);
        await flexPollingVoting.connect(this.pollster_membership_whitelist1).submitVote(dao.address, proposalId, 2);
        await flexPollingVoting.connect(this.pollster_membership_whitelist2).submitVote(dao.address, proposalId, 1);

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const voteRel = await flexPollingVoting.voteResult(dao.address, proposalId);
        console.log(`
        voting result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        processing proposal...
        `);
        await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        voted and processed...
        state ${flexFundingProposalInfo.state}
        `);
    })

    it("allocation , 1 voter 1 vote...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.dao4_3);
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%


        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];


        const priorityWhitelist = [];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
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
        flex funding ProposalId: ${proposalId}
        state ${flexFundingProposalInfo.state}
        voting...
        `);

        const flexFundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexPollingVoting = this.flexPollingVotingContract;
        const fundRaiseStartTimes = flexFundingProposalInfo.fundRaiseInfo.fundRaiseStartTime;
        const stopVoteTime = flexFundingProposalInfo.stopVoteTime;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let votingWeight1 = await flexPollingVoting.getVotingWeight(this.dao4_3, this.owner.address);
        let votingWeight2 = await flexPollingVoting.getVotingWeight(this.dao4_3, this.pollster_membership_whitelist1.address);
        let votingWeight3 = await flexPollingVoting.getVotingWeight(this.dao4_3, this.pollster_membership_whitelist2.address);

        console.log(`
        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}
        `);

        await flexPollingVoting.connect(this.owner).submitVote(dao.address, proposalId, 1);
        await flexPollingVoting.connect(this.pollster_membership_whitelist1).submitVote(dao.address, proposalId, 2);
        await flexPollingVoting.connect(this.pollster_membership_whitelist2).submitVote(dao.address, proposalId, 1);

        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        const voteRel = await flexPollingVoting.voteResult(dao.address, proposalId);
        console.log(`
        voting result ${voteRel.state} nbYes ${voteRel.nbYes} nbNo ${voteRel.nbNo}
        processing proposal...
        `);
        await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        voted and processed...
        state ${flexFundingProposalInfo.state}
        `);
    })

});

describe("verify proposer membership...", () => {
    before("summon a flex dao...", async () => {
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
            managementFeeAccount,
            steward_whitelist1, steward_whitelist2
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
        this.steward_whitelist1 = steward_whitelist1;
        this.steward_whitelist2 = steward_whitelist2;
        this.managementFeeAccount = managementFeeAccount;
        console.log("pollster_membership_whitelist2 ", pollster_membership_whitelist2.address);
        let _daoName = "my_flex_dao1";
        const {
            dao,
            factories,
            adapters,
            extensions,
            testContracts
        } = await deployDefaultDao({
            owner: this.owner,
            daoMode: 1, //  Vintage = 0, Flex = 1,   Collective = 2,
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
        // this.managing = this.adapters.managing.instance;
        this.flexPollingVotingContract = adapters.flexPollingVotingContract.instance;
        this.summonDao = this.adapters.summonDao.instance;
        this.flexStewardMangement = this.adapters.stewardManagementContract.instance;
        this.flexStewardAllocation = adapters.flexStewardAllocation.instance;
        this.flexFundingReturnTokenAdapterContract = adapters.flexFundingReturnTokenAdapterContract.instance;
        this.flexFreeInEscrowFundAdapterContract = adapters.flexFreeInEscrowFundAdapterContract.instance;
        this.flexFundingHelperAdapterContract = adapters.flexFundingHelperAdapterContract.instance;
        this.flexDaoSetAdapterContract = adapters.flexDaoSetAdapterContract.instance;
        this.flexDaoSetHelperAdapterContract = adapters.flexDaoSetHelperAdapterContract.instance;
        this.flexDaoSetPollingAdapterContract = adapters.flexDaoSetPollingAdapterContract.instance;
        this.flexDaoSetVotingAdapterContract = adapters.flexDaoSetVotingAdapterContract.instance;
        this.flexDaoSetFeesAdapterContract = adapters.flexDaoSetFeesAdapterContract.instance;
        this.flexDaoSetGovernorMembershipAdapterContract = adapters.flexDaoSetGovernorMembershipAdapterContract.instance;
        this.flexDaoSetInvestorCapAdapterContract = adapters.flexDaoSetInvestorCapAdapterContract.instance;
        this.flexDaoSetInvestorMembershipAdapterContract = adapters.flexDaoSetInvestorMembershipAdapterContract.instance;
        this.flexDaoSetProposerMembershipAdapterContract = adapters.flexDaoSetProposerMembershipAdapterContract.instance;
        this.flexSetRiceReceiverProposalAdapterContract = adapters.flexSetRiceReceiverProposalAdapterContract.instance;

        console.log("flexStewardMangement addr ", this.flexStewardMangement.address);

        const ERC721 = await hre.ethers.getContractFactory("PixelNFT");
        const erc721 = await ERC721.deploy(4);
        await erc721.deployed();
        this.testERC721 = erc721;

        const ERC1155 = await hre.ethers.getContractFactory("ERC1155TestToken");
        const erc1155 = await ERC1155.deploy("this is test uri");
        await erc1155.deployed();
        this.testERC1155 = erc1155;

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];

        const creator = this.owner.address;

        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd', //FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35', //FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8', //FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c', //FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7', //FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610', //FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda', //FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 770
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753', //StewardMangement
                addr: this.flexStewardMangement.address,
                flags: 6338
            },
            {
                id: '0x37cbe06c1044f98864ea25736326bc1d488e24e5e23781ea2ad64c4069cb9e6e', //flexStewardAllocationAdapter
                addr: this.flexStewardAllocation.address,
                flags: 0
            },
            {
                id: '0x43f8439a5cef099d0d9a92b15a64e34ff49963bb29d65f63204eda6591b810a1', //flexFundingReturnTokenAdapter
                addr: this.flexFundingReturnTokenAdapterContract.address,
                flags: 0
            },
            {
                id: '0xeae11da953333a83b6467e2193334fb302549e1a42ad5797082aea1ab6be9120', //flexFreeInEscrowFundAdapterContract
                addr: this.flexFreeInEscrowFundAdapterContract.address,
                flags: 0
            },
            {
                id: '0xc8e81510cbc5ec7970040e233b001587da1ea4484a9f7b8710d3322429c2df23', //flexFundingHelperAdapterContract
                addr: this.flexFundingHelperAdapterContract.address,
                flags: 0
            },
            // {
            //     id: '0xe564b2da9fb62dadceed6d94ac5884ac5f464424e7be661d7d6181d49fa87b3f', //flexDaoSetAdapterContract
            //     addr: this.flexDaoSetAdapterContract.address,
            //     flags: 778242
            // },
            {
                id: '0xff9379b98b93eb3bd1fac62fd2258a7955d70d2d5279c40064145b6c9646df37', //flexDaoSetHelperAdapterContract
                addr: this.flexDaoSetHelperAdapterContract.address,
                flags: 8
            },
            {
                id: '0x5f0e8d109045653360289a7a02d5dc2a99e382006a42ef93f66de55ecff3176f',// flexDaoSetPollingAdapterContract
                addr: this.flexDaoSetPollingAdapterContract.address,
                flags: 262146
            },
            {
                id: '0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7',//flexDaoSetVotingAdapterContract
                addr: this.flexDaoSetVotingAdapterContract.address,
                flags: 65538
            },
            {
                id: '0xc6bb47f9566baa74b5032b5c10e5bf4a1e2382ca337c2de674732f6401d52cc0',//flexDaoSetFeesAdapterContract
                addr: this.flexDaoSetFeesAdapterContract.address,
                flags: 131074
            },
            {
                id: '0x869e5d18913d4e9bb387c730a04b58d11e95102194f7217a4b684f6e61dff920',//flexDaoSetGovernorMembershipAdapterContract
                addr: this.flexDaoSetGovernorMembershipAdapterContract.address,
                flags: 16386
            },
            {
                id: '0x08f2d2eeda0c9072cdba8b58d442503b4cf9eb6c2f74d75e91dc719111c3189c',//flexDaoSetInvestorCapAdapterContract
                addr: this.flexDaoSetInvestorCapAdapterContract.address,
                flags: 8194
            },
            {
                id: '0xe6121cbf77e02f965a1829c382f701ad4cec84fbda84c45378db0768d2e40871',//flexDaoSetInvestorMembershipAdapterContract
                addr: this.flexDaoSetInvestorMembershipAdapterContract.address,
                flags: 32770
            },
            {
                id: '0xf3ce48289b9021e92bc5661ccf481e756dcb8de846c2eb9620bb83917cab5237',//flexDaoSetProposerMembershipAdapterContract
                addr: this.flexDaoSetProposerMembershipAdapterContract.address,
                flags: 524290
            },
            {
                id: '0xcdb9c6d5700c127f2c99a75e51af1f56590e1b02f8f6ceee2d51d67dd0e91cad',//flexSetRiceReceiverProposalAdapterContract
                addr: this.flexSetRiceReceiverProposalAdapterContract.address,
                flags: 33554442
            }

        ];


        const adapters1 = [
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingPoolAdapterContract.address, //FlexFundingPoolAdapterContract
                flags: 75
            },
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingAdapterContract.address, //FlexFundingAdapterContract
                flags: 26
            }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const flexDaoParticipantCapInfo = [
            true, //bool enable;
            5 //uint256 maxParticipantsAmount;
        ]

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMemberships = [
            0, // uint8 varifyType;
            "flexDaoIvestorsMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            "flexDaoGovernorMembershipName",
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        //erc20, quantity, support type percentage, quorum type percentage
        const flexDaoVotingInfo1_1 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];
        //erc20, log2, support type percentage, quorum type percentage
        const flexDaoVotingInfo1_2 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            1, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];
        //erc20, voter 1 vote, support type percentage, quorum type percentage
        const flexDaoVotingInfo1_3 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            2, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];

        //erc20, voter 1 vote, support type integer, quorum type integer
        const flexDaoVotingInfo1_4 = [
            0, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            2, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            1, //supportType
            1 //quorumType
        ];

        //ERC721, quantity, support type percentage, quorum type percentage
        const flexDaoVotingInfo2_1 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testERC721.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];
        //ERC721, quantity, support type integer, quorum type integer
        const flexDaoVotingInfo2_2 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testERC721.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];
        //ERC721, log2, support type percentage, quorum type percentage
        const flexDaoVotingInfo2_3 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testERC721.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            1, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];
        //ERC721, log2, support type integer, quorum type integer
        const flexDaoVotingInfo2_4 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testERC721.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            1, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            1, //supportType
            1 //quorumType
        ];
        //ERC721, 1 voter 1 vote, support type percentage, quorum type percentage
        const flexDaoVotingInfo2_5 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testERC721.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            2, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];
        //ERC721, 1 voter 1 vote, support type integer, quorum type integer
        const flexDaoVotingInfo2_6 = [
            1, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testERC721.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            2, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            1, //supportType
            1 //quorumType
        ];

        //erc1155, quantity, support type percentage, quorum type percentage
        const flexDaoVotingInfo3 = [
            2, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testERC1155.address, //tokenAddress
            1, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];
        //allocation, quantity, support type percentage, quorum type percentage
        const flexDaoVotingInfo4 = [
            3, //eligibilityType 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];

        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            "flexDaoPollVoterMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //address[] whiteList;
        ];

        //erc20 , quantity
        const flexDaoPollingInfo1_1 = [
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            0, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];
        //erc20 , log2
        const flexDaoPollingInfo1_2 = [
            60 * 10, // uint256 votingPeriod;
            1, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            0, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];
        //erc20 , 1 voter 1 vote
        const flexDaoPollingInfo1_3 = [
            60 * 10, // uint256 votingPeriod;
            2, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            0, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];

        //erc721 , quantity
        const flexDaoPollingInfo2_1 = [
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            1, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testERC721.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];
        //erc721 , log2
        const flexDaoPollingInfo2_2 = [
            60 * 10, // uint256 votingPeriod;
            1, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            1, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testERC721.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];
        //erc721 , 1 voter 1 vote
        const flexDaoPollingInfo2_3 = [
            60 * 10, // uint256 votingPeriod;
            2, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            1, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testERC721.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];

        //erc1155 , quantity
        const flexDaoPollingInfo3_1 = [
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            2, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testERC1155.address, //   address tokenAddress;
            1, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];
        //erc1155 , log2
        const flexDaoPollingInfo3_2 = [
            60 * 10, // uint256 votingPeriod;
            1, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            2, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testERC1155.address, //   address tokenAddress;
            1, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];
        //erc1155 , 1 voter 1 vote
        const flexDaoPollingInfo3_3 = [
            60 * 10, // uint256 votingPeriod;
            2, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            2, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testERC1155.address, //   address tokenAddress;
            1, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];

        //allocation , quantity
        const flexDaoPollingInfo4_1 = [
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            3, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testERC1155.address, //   address tokenAddress;
            1, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];
        //allocation , log2
        const flexDaoPollingInfo4_2 = [
            60 * 10, // uint256 votingPeriod;
            1, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            3, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testERC1155.address, //   address tokenAddress;
            1, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];
        //allocation , 1 voter 1 vote
        const flexDaoPollingInfo4_3 = [
            60 * 10, // uint256 votingPeriod;
            2, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            3, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testERC1155.address, //   address tokenAddress;
            1, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];

        const flexDaoProposerMembershipInfo1 = [
            false,
            "flexDaoProposerMembershipName",
            3, // uint8 varifyType;
            0, // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0, // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address] // address[] whiteList;
        ];

        const flexDaoProposerMembershipInfo2 = [
            true,
            "flexDaoProposerMembershipName",
            0, // uint8 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const flexDaoProposerMembershipInfo3 = [
            true,
            "flexDaoProposerMembershipName",
            1, // uint8 varifyType;
            1, // uint256 minHolding;
            this.testERC721.address, // address tokenAddress;
            1, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];


        const flexDaoProposerMembershipInfo4 = [
            true,
            "flexDaoProposerMembershipName",
            2, // uint8 varifyType;
            1, // uint256 minHolding;
            this.testERC1155.address, // address tokenAddress;
            1, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const flexDaoProposerMembershipInfo5 = [
            true,
            "flexDaoProposerMembershipName",
            3, // uint8 varifyType;
            0, // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0, // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address] // address[] whiteList;
        ];

        const flexDaoManagementfee = hre.ethers.utils.parseEther("0.002"); // 0.2%
        const returnTokenManagementFee = hre.ethers.utils.parseEther("0.0018");
        const flexDaoGenesisStewards = [
            this.genesis_steward1.address,
            this.genesis_steward2.address
        ];
        const allocations = [10, 20, 30];
        const fundingPollEnable = true; //poll mode
        const flexDaoFundriaseStyle = 0 // 0 - FCFS 1- Free in
        const riceRewardReceiver = this.user1.address;

        _daoName = "my_flex_dao2";
        let _daoName1_1 = "my_flex_dao1-1";
        let _daoName1_2 = "my_flex_dao1-2";
        let _daoName1_3 = "my_flex_dao1-3";
        let _daoName2_1 = "my_flex_dao2-1";
        let _daoName2_2 = "my_flex_dao2-2";
        let _daoName2_3 = "my_flex_dao2-3";
        let _daoName3_1 = "my_flex_dao3-1";
        let _daoName3_2 = "my_flex_dao3-2";
        let _daoName3_3 = "my_flex_dao3-3";
        let _daoName4_1 = "my_flex_dao4-1";
        let _daoName4_2 = "my_flex_dao4-2";
        let _daoName4_3 = "my_flex_dao4-3";

        const flexDaoInfo1_1 = {
            name: _daoName1_1, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }
        const flexDaoInfo1_2 = {
            name: _daoName1_2, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        };
        const flexDaoInfo1_3 = {
            name: _daoName1_3, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        };
        const flexDaoInfo2_1 = {
            name: _daoName2_1, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        };
        const flexDaoInfo2_2 = {
            name: _daoName2_2, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        };
        const flexDaoInfo2_3 = {
            name: _daoName2_3, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }
        const flexDaoInfo3_1 = {
            name: _daoName3_1, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        };
        const flexDaoInfo3_2 = {
            name: _daoName3_2, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }
        const flexDaoInfo3_3 = {
            name: _daoName3_3, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        };
        const flexDaoInfo4_1 = {
            name: _daoName4_1, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }
        const flexDaoInfo4_2 = {
            name: _daoName4_2, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        };
        const flexDaoInfo4_3 = {
            name: _daoName4_3, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            riceRewardReceiver: riceRewardReceiver
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }
        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0, // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address, // address tokenAddress;
            tokenId: 0, // uint256 tokenId;
            whiteList: [], // address[] whiteList;
            priorityPeriod: 60 * 10 // uint256 priorityPeriod;
        }

        const flexDaoParams1_1 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo1_1, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo1_1, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo1, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo1_1, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams1_2 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo1_2, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo1_2, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo2, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo1_2, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams1_3 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo1_3, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo1_3, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo3, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo1_3, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams2_1 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo1_4, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo2_1, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo4, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo2_1, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams2_2 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo2_1, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo2_2, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo5, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo2_2, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams2_3 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo2_2, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo2_3, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo1, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo2_3, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams3_1 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo2_3, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo3_1, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo1, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo3_1, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams3_2 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo2_4, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo3_2, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo1, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo3_2, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams3_3 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo2_5, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo3_3, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo1, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo3_3, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams4_1 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo2_6, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo4_1, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo1, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo4_1, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams4_2 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo3, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo4_2, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo1, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo4_2, //    flexDaoInfo _flexDaoInfo;
        ];

        const flexDaoParams4_3 = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo4, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo4_3, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo1, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo4_3, //    flexDaoInfo _flexDaoInfo;
        ];
        let obj1_1 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams1_1);
        console.log(`
        new dao address ${obj1_1.daoAddr}
        new dao name ${toUtf8(obj1_1.daoName)}
        `);

        let obj1_2 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams1_2);
        console.log("dao1_2 created...");
        let obj1_3 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams1_3);
        console.log("dao1_3 created...");

        let obj2_1 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams2_1);
        console.log("dao2_1 created...");

        let obj2_2 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams2_2);
        console.log("dao2_2 created...");

        let obj2_3 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams2_3);
        console.log("dao2_3 created...");

        let obj3_1 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams3_1);
        console.log("dao3_1 created...");

        let obj3_2 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams3_2);
        console.log("dao3_2 created...");

        let obj3_3 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams3_3);
        console.log("dao3_3 created...");

        let obj4_1 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams4_1);
        console.log("dao4_1 created...");

        let obj4_2 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams4_2);
        console.log("dao4_2 created...");

        let obj4_3 = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams4_3);
        console.log("dao4_3 created...");

        this.dao1_1 = obj1_1.daoAddr;
        this.dao1_2 = obj1_2.daoAddr;
        this.dao1_3 = obj1_3.daoAddr;
        this.dao2_1 = obj2_1.daoAddr;
        this.dao2_2 = obj2_2.daoAddr;
        this.dao2_3 = obj2_3.daoAddr;
        this.dao3_1 = obj3_1.daoAddr;
        this.dao3_2 = obj3_2.daoAddr;
        this.dao3_3 = obj3_3.daoAddr;
        this.dao4_1 = obj4_1.daoAddr;
        this.dao4_2 = obj4_2.daoAddr;
        this.dao4_3 = obj4_3.daoAddr;
    });

    const sommonFlexDao = async (summonDaoContract, daoFactoryContract, flexDaoParams) => {
        let tx = await summonDaoContract.summonFlexDao(flexDaoParams);
        let result = await tx.wait();
        const daoAddr = await daoFactoryContract.getDaoAddress(flexDaoParams[flexDaoParams.length - 1].name);
        const daoName = await daoFactoryContract.daos(daoAddr);


        return {
            daoAddr: daoAddr,
            daoName: daoName
        };
    };

    it("disable proposer membership...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.dao1_1);
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%


        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];


        const priorityWhitelist = [];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
        ];
        console.log(fundingParams);
        console.log(`
        create flex funding proposal...
        `)
        const tx = await flexFundingAdapterContract.connect(this.pollster_membership_whitelist2).
            submitProposal(dao.address, fundingParams);
        const result = await tx.wait();
        const proposalId = result.events[2].args.proposalId;
        let flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        created...
        flex funding ProposalId: ${proposalId}
        state ${flexFundingProposalInfo.state}
        voting...
        `);
    });

    it("enable proposer membership with erc20...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.dao1_2);
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%


        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];


        const priorityWhitelist = [];


        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
        ];
        console.log(fundingParams);
        console.log(`
        create flex funding proposal...
        `)

        await expectRevert(flexFundingAdapterContract.connect(this.pollster_membership_whitelist2).submitProposal(dao.address, fundingParams), "revert");
        const tx = await flexFundingAdapterContract.connect(this.owner).
            submitProposal(dao.address, fundingParams);
        const result = await tx.wait();
        const proposalId = result.events[2].args.proposalId;
        let flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        created...
        flex funding ProposalId: ${proposalId}
        state ${flexFundingProposalInfo.state}
        voting...
        `);
    });

    it("enable proposer membership with erc721...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.dao1_3);
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%


        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];


        const priorityWhitelist = [];


        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
        ];
        console.log(fundingParams);
        console.log(`
        create flex funding proposal...
        `)

        await expectRevert(flexFundingAdapterContract.connect(this.pollster_membership_whitelist2).submitProposal(dao.address, fundingParams), "revert");
        await this.testERC721.mintPixel(this.owner.address, 0, 0);

        const tx = await flexFundingAdapterContract.connect(this.owner).
            submitProposal(dao.address, fundingParams);
        const result = await tx.wait();
        const proposalId = result.events[2].args.proposalId;
        let flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        created...
        flex funding ProposalId: ${proposalId}
        state ${flexFundingProposalInfo.state}
        voting...
        `);
    });

    it("enable proposer membership with erc1155...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.dao2_1);
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%


        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];


        const priorityWhitelist = [];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
        ];
        console.log(fundingParams);
        console.log(`
        create flex funding proposal...
        `)

        await expectRevert(flexFundingAdapterContract.connect(this.pollster_membership_whitelist2).submitProposal(dao.address, fundingParams), "revert");
        await this.testERC1155.mint(this.owner.address, 1, 2, hexToBytes(toHex(2233)));

        const tx = await flexFundingAdapterContract.connect(this.owner).
            submitProposal(dao.address, fundingParams);
        const result = await tx.wait();
        const proposalId = result.events[2].args.proposalId;
        let flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        created...
        flex funding ProposalId: ${proposalId}
        state ${flexFundingProposalInfo.state}
        voting...
        `);
    });

    it("enable proposer membership with whitelist...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.dao2_2);
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%


        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];


        const priorityWhitelist = [];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
        ];
        console.log(fundingParams);
        console.log(`
        create flex funding proposal...
        `)

        await expectRevert(flexFundingAdapterContract.connect(this.pollster_membership_whitelist2).submitProposal(dao.address, fundingParams), "revert");
        const tx = await flexFundingAdapterContract.connect(this.funding_proposer1_whitelist).
            submitProposal(dao.address, fundingParams);
        const result = await tx.wait();
        const proposalId = result.events[2].args.proposalId;
        let flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        created...
        flex funding ProposalId: ${proposalId}
        state ${flexFundingProposalInfo.state}
        voting...
        `);
    });
});

describe("vesting nft...", () => {
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

        let _daoName = "my_flex_dao1";

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
        // this.flexVestingERC721 = utilContracts.flexVestingERC721.instance;
        this.flexAllocationAdapterContract = adapters.flexAllocationAdapterContract.instance;
        this.flexFundingPoolAdapterContract = adapters.flexFundingPoolAdapterContract.instance;
        this.flexVotingContract = adapters.flexVotingContract.instance;
        this.flexFundingAdapterContract = adapters.flexFundingAdapterContract.instance;
        this.bentoBoxV1 = adapters.bentoBoxV1.instance;
        // this.managing = this.adapters.managing.instance;
        this.flexPollingVotingContract = adapters.flexPollingVotingContract.instance;
        this.flexStewardAllocation = adapters.flexStewardAllocation.instance;
        this.flexStewardMangement = this.adapters.stewardManagementContract.instance;
        this.flexFundingReturnTokenAdapterContract = adapters.flexFundingReturnTokenAdapterContract.instance;
        this.flexFreeInEscrowFundAdapterContract = adapters.flexFreeInEscrowFundAdapterContract.instance;
        this.flexFundingHelperAdapterContract = adapters.flexFundingHelperAdapterContract.instance;
        this.flexDaoSetAdapterContract = adapters.flexDaoSetAdapterContract.instance;
        this.flexDaoSetHelperAdapterContract = adapters.flexDaoSetHelperAdapterContract.instance;
        this.flexDaoSetPollingAdapterContract = adapters.flexDaoSetPollingAdapterContract.instance;
        this.flexDaoSetFeesAdapterContract = adapters.flexDaoSetFeesAdapterContract.instance;
        this.flexDaoSetGovernorMembershipAdapterContract = adapters.flexDaoSetGovernorMembershipAdapterContract.instance;
        this.flexDaoSetInvestorCapAdapterContract = adapters.flexDaoSetInvestorCapAdapterContract.instance;
        this.flexDaoSetInvestorMembershipAdapterContract = adapters.flexDaoSetInvestorMembershipAdapterContract.instance;
        this.flexDaoSetProposerMembershipAdapterContract = adapters.flexDaoSetProposerMembershipAdapterContract.instance;
        this.flexSetRiceReceiverProposalAdapterContract = adapters.flexSetRiceReceiverProposalAdapterContract.instance;

        // const FlexVestingERC721Helper = await hre.ethers.getContractFactory("FlexVestingERC721Helper");
        // const flexVestingERC721Helper = await FlexVestingERC721Helper.deploy();
        // await flexVestingERC721Helper.deployed();
        // this.flexVestingERC721Helper = flexVestingERC721Helper;

        // const FlexVestingERC721 = await hre.ethers.getContractFactory("FlexVestingERC721");
        // const flexVestingERC721 = await FlexVestingERC721.deploy(
        //     "DAOSquare Investment Receipt",
        //     "DIR",
        //     this.flexVesting.address,
        //     this.flexVestingERC721Helper.address
        // );
        // await flexVestingERC721.deployed();
        // this.flexVestingERC721 = flexVestingERC721;

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
            this.flexVesting.address,
            this.vestingERC721Helper.address
        );
        await vestingERC721.deployed();
        this.vestingERC721 = vestingERC721;

        this.summonDao = this.adapters.summonDao.instance;
        this.flexDaoSetVotingAdapterContract = adapters.flexDaoSetVotingAdapterContract.instance;

        console.log(`
        owner address ${owner.address}
        `);


        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];
        _daoName = "my_flex_dao002";

        const creator = this.owner.address;

        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd', //FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35', //FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8', //FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c', //FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7', //FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610', //FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda', //FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 770
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753', //StewardMangement
                addr: this.flexStewardMangement.address,
                flags: 6338
            },
            {
                id: '0x37cbe06c1044f98864ea25736326bc1d488e24e5e23781ea2ad64c4069cb9e6e', //flexStewardAllocationAdapter
                addr: this.flexStewardAllocation.address,
                flags: 0
            },
            {
                id: '0x43f8439a5cef099d0d9a92b15a64e34ff49963bb29d65f63204eda6591b810a1', //flexFundingReturnTokenAdapter
                addr: this.flexFundingReturnTokenAdapterContract.address,
                flags: 0
            },
            {
                id: '0xeae11da953333a83b6467e2193334fb302549e1a42ad5797082aea1ab6be9120', //flexFreeInEscrowFundAdapterContract
                addr: this.flexFreeInEscrowFundAdapterContract.address,
                flags: 0
            },
            {
                id: '0xc8e81510cbc5ec7970040e233b001587da1ea4484a9f7b8710d3322429c2df23', //flexFundingHelperAdapterContract
                addr: this.flexFundingHelperAdapterContract.address,
                flags: 0
            },
            // {
            //     id: '0xe564b2da9fb62dadceed6d94ac5884ac5f464424e7be661d7d6181d49fa87b3f', //flexDaoSetAdapterContract
            //     addr: this.flexDaoSetAdapterContract.address,
            //     flags: 778242
            // },
            {
                id: '0xff9379b98b93eb3bd1fac62fd2258a7955d70d2d5279c40064145b6c9646df37', //flexDaoSetHelperAdapterContract
                addr: this.flexDaoSetHelperAdapterContract.address,
                flags: 8
            },
            {
                id: '0x5f0e8d109045653360289a7a02d5dc2a99e382006a42ef93f66de55ecff3176f',// flexDaoSetPollingAdapterContract
                addr: this.flexDaoSetPollingAdapterContract.address,
                flags: 262146
            },
            {
                id: '0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7',//flexDaoSetVotingAdapterContract
                addr: this.flexDaoSetVotingAdapterContract.address,
                flags: 65538
            },
            {
                id: '0xc6bb47f9566baa74b5032b5c10e5bf4a1e2382ca337c2de674732f6401d52cc0',//flexDaoSetFeesAdapterContract
                addr: this.flexDaoSetFeesAdapterContract.address,
                flags: 131074
            },
            {
                id: '0x869e5d18913d4e9bb387c730a04b58d11e95102194f7217a4b684f6e61dff920',//flexDaoSetGovernorMembershipAdapterContract
                addr: this.flexDaoSetGovernorMembershipAdapterContract.address,
                flags: 16386
            },
            {
                id: '0x08f2d2eeda0c9072cdba8b58d442503b4cf9eb6c2f74d75e91dc719111c3189c',//flexDaoSetInvestorCapAdapterContract
                addr: this.flexDaoSetInvestorCapAdapterContract.address,
                flags: 8194
            },
            {
                id: '0xe6121cbf77e02f965a1829c382f701ad4cec84fbda84c45378db0768d2e40871',//flexDaoSetInvestorMembershipAdapterContract
                addr: this.flexDaoSetInvestorMembershipAdapterContract.address,
                flags: 32770
            },
            {
                id: '0xf3ce48289b9021e92bc5661ccf481e756dcb8de846c2eb9620bb83917cab5237',//flexDaoSetProposerMembershipAdapterContract
                addr: this.flexDaoSetProposerMembershipAdapterContract.address,
                flags: 524290
            },
            {
                id: '0xcdb9c6d5700c127f2c99a75e51af1f56590e1b02f8f6ceee2d51d67dd0e91cad',//flexSetRiceReceiverProposalAdapterContract
                addr: this.flexSetRiceReceiverProposalAdapterContract.address,
                flags: 33554442
            }

        ];


        const adapters1 = [
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingPoolAdapterContract.address, //FlexFundingPoolAdapterContract
                flags: 75
            },
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingAdapterContract.address, //FlexFundingAdapterContract
                flags: 26
            }
        ];
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const flexDaoParticipantCapInfo = [
            true, //bool enable;
            5 //uint256 maxParticipantsAmount;
        ]

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMemberships = [
            0, // uint8 varifyType;
            "flexDaoIvestorsMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            "flexDaoGovernorMembershipName",
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            0, //eligibilityType 0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];

        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            "flexDaoPollVoterMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //address[] whiteList;
        ];

        const flexDaoPollingInfo = [
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            0, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];

        const flexDaoProposerMembershipInfo = [
            true,
            "flexDaoProposerMembershipName",
            3, // uint8 varifyType;
            0, // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0, // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address] // address[] whiteList;
        ];

        const flexDaoManagementfee = hre.ethers.utils.parseEther("0.001"); // 0.2%
        const returnTokenManagementFee = hre.ethers.utils.parseEther("0.0024");

        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];
        const allocations = [10, 20, 30];
        const fundingPollEnable = false; //DIRECT mode
        const flexDaoFundriaseStyle = 0 // 0 - FCFS 1- Free in
        const riceRewardReceiver = this.user1.address;

        const flexDaoInfo = {
            name: _daoName, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle, // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
            riceRewardReceiver: riceRewardReceiver

        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0, // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address, // address tokenAddress;
            tokenId: 0, // uint256 tokenId;
            whiteList: [], // address[] whiteList;
            priorityPeriod: 60 * 10 // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo, //    flexDaoInfo _flexDaoInfo;
        ];

        const {
            daoAddr,
            daoName
        } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        console.log(`
        new dao address ${daoAddr}
        new dao name ${toUtf8(daoName)}
        `)

        this.flexDirectdaoAddress = daoAddr;
    });

    const sommonFlexDao = async (summonDaoContract, daoFactoryContract, flexDaoParams) => {
        let tx = await summonDaoContract.summonFlexDao(flexDaoParams);
        let result = await tx.wait();
        const daoAddr = await daoFactoryContract.getDaoAddress(flexDaoParams[flexDaoParams.length - 1].name);
        const daoName = await daoFactoryContract.daos(daoAddr);
        return {
            daoAddr: daoAddr,
            daoName: daoName
        };
    };

    it("enable vesting nft...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const flexVestingContract = this.flexVesting;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.flexDirectdaoAddress);
        const fundingpoolextensionAddr = await dao.getExtensionAddress(sha3("flex-funding-pool-ext"));
        const flexFundingPoolExtContract = (await hre.ethers.getContractFactory("FlexInvestmentPoolExtension")).attach(fundingpoolextensionAddr);

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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%

        const vestNFTEnable = true;
        // const nftToken = this.flexVestingERC721.address;
        const nftToken = this.vestingERC721.address;

        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%

        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];


        const priorityWhitelist = [];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
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
            flex funding ProposalId: ${proposalId}
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
        await this.testtoken2.connect(this.user1).approve(this.flexFundingReturnTokenAdapterContract.address,
            returnTokenAmount);

        await this.flexFundingReturnTokenAdapterContract.connect(this.user1).setFundingApprove(
            dao.address,
            proposalId,
            this.testtoken2.address,
            returnTokenAmount
        );

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
            price ${hre.ethers.utils.formatEther(flexFundingProposalInfo.investmentInfo.price)}
            finalRaiseAmount ${hre.ethers.utils.formatEther(flexFundingProposalInfo.investmentInfo.finalRaisedAmount)}
            paybackTokenAmount ${hre.ethers.utils.formatEther(flexFundingProposalInfo.investmentInfo.paybackTokenAmount)}
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
            vest name ${createdVestingInfo.vestInfo.name}
            vest description ${createdVestingInfo.vestInfo.description}
            nft address ${createdVestingInfo.nftInfo.nftToken}
            tokenId ${createdVestingInfo.nftInfo.tokenId}
            proposalId: ${createdVestingInfo.proposalId},
            owner: ${createdVestingInfo.vestInfo.owner},
            recipient: ${createdVestingInfo.vestInfo.recipient},
            token: ${createdVestingInfo.vestInfo.token},
            start: ${createdVestingInfo.timeInfo.start},
            cliffDuration: ${createdVestingInfo.timeInfo.cliffDuration}
            stepDuration: ${createdVestingInfo.timeInfo.stepDuration}
            steps: ${createdVestingInfo.stepInfo.steps}
            cliffShares: ${hre.ethers.utils.formatEther(createdVestingInfo.stepInfo.cliffShares)}
            stepShares: ${hre.ethers.utils.formatEther(createdVestingInfo.stepInfo.stepShares)}
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
        // let svg1 = await this.flexVestingERC721.getSvg(1);
        let svg1 = await this.vestingERC721.getSvg(1);

        // let tokenURI = await this.flexVestingERC721.tokenURI(1);
        let tokenURI = await this.vestingERC721.tokenURI(1);

        console.log(`
        svg of tokenid 1 ${svg1}
        tokenURI of tokenId 1 ${tokenURI}
        `);

        let vestBal1 = await flexVestingContract.vestBalance(1)
        if (vestBal1 > 0) await flexVestingContract.withdraw(dao.address, 1);

        createdVestingInfo = await flexVestingContract.vests(1);
        returnTokenBal = await this.testtoken2.balanceOf(this.owner.address);
        const nextVestId = await flexVestingContract.vestIds()
        console.log(`
            claimed...
            claimed: ${hre.ethers.utils.formatEther(createdVestingInfo.claimed)}
            return token balance ${hre.ethers.utils.formatEther(returnTokenBal)}
            next Vest Id ${nextVestId}
            `);

        if (parseInt(vestingEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(vestingEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        // await this.flexVestingERC721.transferFrom(this.owner.address, this.investor2.address, 1);
        await this.vestingERC721.transferFrom(this.owner.address, this.investor2.address, 1);

        await expectRevert(flexVestingContract.withdraw(dao.address, 1), "revert");
        vestBal1 = await flexVestingContract.vestBalance(1)
        if (vestBal1 > 0) await flexVestingContract.connect(this.investor2).withdraw(dao.address, 1);
        returnTokenBal = await this.testtoken2.balanceOf(this.investor2.address);
        createdVestingInfo = await flexVestingContract.vests(1);
        console.log(`
        claimed...
        claimed: ${hre.ethers.utils.formatEther(createdVestingInfo.claimed)}
        return token balance of investor2 ${hre.ethers.utils.formatEther(returnTokenBal)}
        `);
    });

    it("disable vesting nft...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const flexVestingContract = this.flexVesting;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.flexDirectdaoAddress);
        const fundingpoolextensionAddr = await dao.getExtensionAddress(sha3("flex-funding-pool-ext"));
        const flexFundingPoolExtContract = (await hre.ethers.getContractFactory("FlexInvestmentPoolExtension")).attach(fundingpoolextensionAddr);

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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%

        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "";
        const vestDescription = "";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%

        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];


        const priorityWhitelist = [];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
        ];
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
            flex funding ProposalId: ${proposalId}
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
        await this.testtoken2.connect(this.user1).approve(this.flexFundingReturnTokenAdapterContract.address,
            returnTokenAmount);

        await this.flexFundingReturnTokenAdapterContract.connect(this.user1).setFundingApprove(
            dao.address,
            proposalId,
            this.testtoken2.address,
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
            price ${hre.ethers.utils.formatEther(flexFundingProposalInfo.investmentInfo.price)}
            finalRaiseAmount ${hre.ethers.utils.formatEther(flexFundingProposalInfo.investmentInfo.finalRaisedAmount)}
            returnAmount ${hre.ethers.utils.formatEther(flexFundingProposalInfo.investmentInfo.paybackTokenAmount)}
            protocol Fee ${hre.ethers.utils.formatEther(protocolFee)}
            management Fee ${hre.ethers.utils.formatEther(managementFee)}
            proposer reward ${hre.ethers.utils.formatEther(proposerreward)}
            receive Amount ${hre.ethers.utils.formatEther(receiveAmount)}
            total tributed amount ${hre.ethers.utils.formatEther(allTributedAmount)}
            create vesting...
            `);

        await flexVestingContract.createVesting(dao.address, this.owner.address, proposalId);

        let createdVestingInfo = await flexVestingContract.vests(2);
        const vestingBal = await flexVestingContract.vestBalance(2);
        let returnTokenBal = await this.testtoken2.balanceOf(this.owner.address);
        console.log(`
            vesting info ...
            vest name ${createdVestingInfo.vestInfo.name}
            vest description ${createdVestingInfo.vestInfo.description}
            nft address ${createdVestingInfo.nftInfo.nftToken}
            tokenId ${createdVestingInfo.nftInfo.tokenId}
            proposalId: ${createdVestingInfo.proposalId},
            owner: ${createdVestingInfo.vestInfo.owner},
            recipient: ${createdVestingInfo.vestInfo.recipient},
            token: ${createdVestingInfo.vestInfo.token},
            start: ${createdVestingInfo.timeInfo.start},
            cliffDuration: ${createdVestingInfo.timeInfo.cliffDuration}
            stepDuration: ${createdVestingInfo.timeInfo.stepDuration}
            steps: ${createdVestingInfo.stepInfo.steps}
            cliffShares: ${hre.ethers.utils.formatEther(createdVestingInfo.stepInfo.cliffShares)}
            stepShares: ${hre.ethers.utils.formatEther(createdVestingInfo.stepInfo.stepShares)}
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

        let vestBal2 = await flexVestingContract.vestBalance(2)
        if (vestBal2 > 0) await flexVestingContract.withdraw(dao.address, 2);

        createdVestingInfo = await flexVestingContract.vests(2);
        returnTokenBal = await this.testtoken2.balanceOf(this.owner.address);
        const nextVestId = await flexVestingContract.vestIds()
        console.log(`
            claimed...
            claimed: ${hre.ethers.utils.formatEther(createdVestingInfo.claimed)}
            return token balance ${hre.ethers.utils.formatEther(returnTokenBal)}
            next Vest Id ${nextVestId}
            `);

        if (parseInt(vestingEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(vestingEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await expectRevert(flexVestingContract.connect(this.investor2).withdraw(dao.address, 2), "revert");
        vestBal2 = await flexVestingContract.vestBalance(2)
        if (vestBal2 > 0) await flexVestingContract.withdraw(dao.address, 2);

        returnTokenBal = await this.testtoken2.balanceOf(this.owner.address);
        createdVestingInfo = await flexVestingContract.vests(2);
        console.log(`
        claimed...
        claimed: ${hre.ethers.utils.formatEther(createdVestingInfo.claimed)}
        return token balance of investor2 ${hre.ethers.utils.formatEther(returnTokenBal)}
        `);
    });


});

describe("steward allocations...", () => {
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

        let _daoName = "my_flex_dao1";

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
        // this.flexVestingERC721 = utilContracts.flexVestingERC721.instance;
        this.flexAllocationAdapterContract = adapters.flexAllocationAdapterContract.instance;
        this.flexFundingPoolAdapterContract = adapters.flexFundingPoolAdapterContract.instance;
        this.flexVotingContract = adapters.flexVotingContract.instance;
        this.flexFundingAdapterContract = adapters.flexFundingAdapterContract.instance;
        this.bentoBoxV1 = adapters.bentoBoxV1.instance;
        // this.managing = this.adapters.managing.instance;
        this.flexPollingVotingContract = adapters.flexPollingVotingContract.instance;
        this.flexStewardAllocation = adapters.flexStewardAllocation.instance;
        this.flexStewardMangement = this.adapters.stewardManagementContract.instance;
        this.flexFundingReturnTokenAdapterContract = adapters.flexFundingReturnTokenAdapterContract.instance;
        this.flexFreeInEscrowFundAdapterContract = adapters.flexFreeInEscrowFundAdapterContract.instance;
        this.flexFundingHelperAdapterContract = adapters.flexFundingHelperAdapterContract.instance;
        this.flexDaoSetAdapterContract = adapters.flexDaoSetAdapterContract.instance;
        this.flexDaoSetHelperAdapterContract = adapters.flexDaoSetHelperAdapterContract.instance;
        this.flexDaoSetPollingAdapterContract = adapters.flexDaoSetPollingAdapterContract.instance;
        this.flexDaoSetVotingAdapterContract = adapters.flexDaoSetVotingAdapterContract.instance;
        this.flexDaoSetFeesAdapterContract = adapters.flexDaoSetFeesAdapterContract.instance;
        this.flexDaoSetGovernorMembershipAdapterContract = adapters.flexDaoSetGovernorMembershipAdapterContract.instance;
        this.flexDaoSetInvestorCapAdapterContract = adapters.flexDaoSetInvestorCapAdapterContract.instance;
        this.flexDaoSetInvestorMembershipAdapterContract = adapters.flexDaoSetInvestorMembershipAdapterContract.instance;
        this.flexDaoSetProposerMembershipAdapterContract = adapters.flexDaoSetProposerMembershipAdapterContract.instance;
        this.flexSetRiceReceiverProposalAdapterContract = adapters.flexSetRiceReceiverProposalAdapterContract.instance;

        // const FlexVestingERC721Helper = await hre.ethers.getContractFactory("FlexVestingERC721Helper");
        // const flexVestingERC721Helper = await FlexVestingERC721Helper.deploy();
        // await flexVestingERC721Helper.deployed();
        // this.flexVestingERC721Helper = flexVestingERC721Helper;

        // const FlexVestingERC721 = await hre.ethers.getContractFactory("FlexVestingERC721");
        // const flexVestingERC721 = await FlexVestingERC721.deploy(
        //     "DAOSquare Investment Receipt",
        //     "DIR",
        //     this.flexVesting.address,
        //     this.flexVestingERC721Helper.address
        // );
        // await flexVestingERC721.deployed();
        // this.flexVestingERC721 = flexVestingERC721;

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
            this.flexVesting.address,
            this.vestingERC721Helper.address
        );
        await vestingERC721.deployed();
        this.vestingERC721 = vestingERC721;

        this.summonDao = this.adapters.summonDao.instance;

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];
        _daoName = "my_flex_dao002";

        const creator = this.owner.address;

        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd', //FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35', //FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8', //FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c', //FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7', //FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610', //FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda', //FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 770
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753', //StewardMangement
                addr: this.flexStewardMangement.address,
                flags: 6338
            },
            {
                id: '0x37cbe06c1044f98864ea25736326bc1d488e24e5e23781ea2ad64c4069cb9e6e', //flexStewardAllocationAdapter
                addr: this.flexStewardAllocation.address,
                flags: 0
            },
            {
                id: '0x43f8439a5cef099d0d9a92b15a64e34ff49963bb29d65f63204eda6591b810a1', //flexFundingReturnTokenAdapter
                addr: this.flexFundingReturnTokenAdapterContract.address,
                flags: 0
            },
            {
                id: '0xeae11da953333a83b6467e2193334fb302549e1a42ad5797082aea1ab6be9120', //flexFreeInEscrowFundAdapterContract
                addr: this.flexFreeInEscrowFundAdapterContract.address,
                flags: 0
            },
            {
                id: '0xc8e81510cbc5ec7970040e233b001587da1ea4484a9f7b8710d3322429c2df23', //flexFundingHelperAdapterContract
                addr: this.flexFundingHelperAdapterContract.address,
                flags: 0
            },
            // {
            //     id: '0xe564b2da9fb62dadceed6d94ac5884ac5f464424e7be661d7d6181d49fa87b3f', //flexDaoSetAdapterContract
            //     addr: this.flexDaoSetAdapterContract.address,
            //     flags: 778242
            // },
            {
                id: '0xff9379b98b93eb3bd1fac62fd2258a7955d70d2d5279c40064145b6c9646df37', //flexDaoSetHelperAdapterContract
                addr: this.flexDaoSetHelperAdapterContract.address,
                flags: 8
            },
            {
                id: '0x5f0e8d109045653360289a7a02d5dc2a99e382006a42ef93f66de55ecff3176f',// flexDaoSetPollingAdapterContract
                addr: this.flexDaoSetPollingAdapterContract.address,
                flags: 262146
            },
            {
                id: '0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7',//flexDaoSetVotingAdapterContract
                addr: this.flexDaoSetVotingAdapterContract.address,
                flags: 65538
            },
            {
                id: '0xc6bb47f9566baa74b5032b5c10e5bf4a1e2382ca337c2de674732f6401d52cc0',//flexDaoSetFeesAdapterContract
                addr: this.flexDaoSetFeesAdapterContract.address,
                flags: 131074
            },
            {
                id: '0x869e5d18913d4e9bb387c730a04b58d11e95102194f7217a4b684f6e61dff920',//flexDaoSetGovernorMembershipAdapterContract
                addr: this.flexDaoSetGovernorMembershipAdapterContract.address,
                flags: 16386
            },
            {
                id: '0x08f2d2eeda0c9072cdba8b58d442503b4cf9eb6c2f74d75e91dc719111c3189c',//flexDaoSetInvestorCapAdapterContract
                addr: this.flexDaoSetInvestorCapAdapterContract.address,
                flags: 8194
            },
            {
                id: '0xe6121cbf77e02f965a1829c382f701ad4cec84fbda84c45378db0768d2e40871',//flexDaoSetInvestorMembershipAdapterContract
                addr: this.flexDaoSetInvestorMembershipAdapterContract.address,
                flags: 32770
            },
            {
                id: '0xf3ce48289b9021e92bc5661ccf481e756dcb8de846c2eb9620bb83917cab5237',//flexDaoSetProposerMembershipAdapterContract
                addr: this.flexDaoSetProposerMembershipAdapterContract.address,
                flags: 524290
            },
            {
                id: '0xcdb9c6d5700c127f2c99a75e51af1f56590e1b02f8f6ceee2d51d67dd0e91cad',//flexSetRiceReceiverProposalAdapterContract
                addr: this.flexSetRiceReceiverProposalAdapterContract.address,
                flags: 33554442
            }

        ];


        const adapters1 = [{
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: this.flexFundingPoolAdapterContract.address, //FlexFundingPoolAdapterContract
            flags: 75
        },
        {
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: this.flexFundingAdapterContract.address, //FlexFundingAdapterContract
            flags: 26
        }
        ];
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const flexDaoParticipantCapInfo = [
            true, //bool enable;
            5 //uint256 maxParticipantsAmount;
        ]

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMemberships = [
            0, // uint8 varifyType;
            "flexDaoIvestorsMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            "flexDaoGovernorMembershipName",
            0, // uint256 varifyType;0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            3, //eligibilityType 0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];

        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            "flexDaoPollVoterMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //address[] whiteList;
        ];

        const flexDaoPollingInfo = [
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            0, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];

        const flexDaoProposerMembershipInfo = [
            true,
            "flexDaoProposerMembershipName",
            3, // uint8 varifyType;
            0, // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0, // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address] // address[] whiteList;
        ];

        const flexDaoManagementfee = hre.ethers.utils.parseEther("0.001"); // 0.2%
        const returnTokenManagementFee = hre.ethers.utils.parseEther("0.0024");

        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];
        const allocations = [10, 20, 30];

        const fundingPollEnable = false; //DIRECT mode
        const flexDaoFundriaseStyle = 0 // 0 - FCFS 1- Free in
        const riceRewardReceiver = this.user1.address;

        const flexDaoInfo = {
            name: _daoName, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle,// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
            riceRewardReceiver: riceRewardReceiver
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0, // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address, // address tokenAddress;
            tokenId: 0, // uint256 tokenId;
            whiteList: [], // address[] whiteList;
            priorityPeriod: 60 * 10 // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo, //    flexDaoInfo _flexDaoInfo;
        ];

        const {
            daoAddr,
            daoName
        } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        console.log(`
        new dao address ${daoAddr}
        new dao name ${toUtf8(daoName)}
        `)

        this.flexDirectdaoAddress = daoAddr;
        this.daoContract = daoContract;
    });

    const sommonFlexDao = async (summonDaoContract, daoFactoryContract, flexDaoParams) => {
        let tx = await summonDaoContract.summonFlexDao(flexDaoParams);
        let result = await tx.wait();
        const daoAddr = await daoFactoryContract.getDaoAddress(flexDaoParams[flexDaoParams.length - 1].name);
        const daoName = await daoFactoryContract.daos(daoAddr);
        return {
            daoAddr: daoAddr,
            daoName: daoName
        };
    };

    it("eligibilityType = allocation...", async () => {

        const alloca1 = await this.flexStewardAllocation.getAllocation(this.flexDirectdaoAddress, this.genesis_steward1.address)
        const alloca2 = await this.flexStewardAllocation.getAllocation(this.flexDirectdaoAddress, this.genesis_steward2.address)
        const alloca3 = await this.flexStewardAllocation.getAllocation(this.flexDirectdaoAddress, this.owner.address)

        const votingWeight1 = await this.flexVotingContract.getVotingWeight(this.flexDirectdaoAddress, this.genesis_steward1.address);
        const votingWeight2 = await this.flexVotingContract.getVotingWeight(this.flexDirectdaoAddress, this.genesis_steward2.address);
        const votingWeight3 = await this.flexVotingContract.getVotingWeight(this.flexDirectdaoAddress, this.owner.address);

        console.log(`
        alloca1 ${alloca1}
        alloca2 ${alloca2}
        alloca3 ${alloca3}

        votingWeight1 ${votingWeight1}
        votingWeight2 ${votingWeight2}
        votingWeight3 ${votingWeight3}

        `);
    });

    it("steward in proposal...", async () => {
        const flexVotingContract = this.flexVotingContract;

        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("100"));
        const allocation = 100;
        const stewardMangementContract = this.flexStewardMangement;
        const daoAddr = this.flexDirectdaoAddress;
        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, allocation);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        await flexVotingContract.submitVote(daoAddr, proposalId, 1);
        await flexVotingContract.connect(this.genesis_steward1).submitVote(daoAddr, proposalId, 1);
        await flexVotingContract.connect(this.genesis_steward2).submitVote(daoAddr, proposalId, 1);


        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await stewardMangementContract.processProposal(daoAddr, proposalId);

        const isSteward = await this.daoContract.isMember(this.user1.address);
        const votingWeight = await this.flexVotingContract.getVotingWeight(this.flexDirectdaoAddress, this.user1.address);
        const alloca = await this.flexStewardAllocation.getAllocation(this.flexDirectdaoAddress, this.user1.address)
        console.log(`
        isSteward ${isSteward}
        alloca ${alloca}
        votingWeight ${votingWeight}
        `);
    });
});

describe("free in...", () => {
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

        let _daoName = "my_flex_dao1";

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
        // this.flexVestingERC721 = utilContracts.flexVestingERC721.instance;
        this.flexAllocationAdapterContract = adapters.flexAllocationAdapterContract.instance;
        this.flexFundingPoolAdapterContract = adapters.flexFundingPoolAdapterContract.instance;
        this.flexVotingContract = adapters.flexVotingContract.instance;
        this.flexFundingAdapterContract = adapters.flexFundingAdapterContract.instance;
        this.bentoBoxV1 = adapters.bentoBoxV1.instance;
        // this.managing = this.adapters.managing.instance;
        this.flexPollingVotingContract = adapters.flexPollingVotingContract.instance;
        this.flexStewardAllocation = adapters.flexStewardAllocation.instance;
        this.flexStewardMangement = this.adapters.stewardManagementContract.instance;
        this.flexFundingReturnTokenAdapterContract = adapters.flexFundingReturnTokenAdapterContract.instance;
        this.flexFreeInEscrowFundAdapterContract = adapters.flexFreeInEscrowFundAdapterContract.instance;
        this.flexFundingHelperAdapterContract = adapters.flexFundingHelperAdapterContract.instance;
        this.summonDao = this.adapters.summonDao.instance;
        this.flexDaoSetAdapterContract = adapters.flexDaoSetAdapterContract.instance;
        this.flexDaoSetHelperAdapterContract = adapters.flexDaoSetHelperAdapterContract.instance;
        this.flexDaoSetPollingAdapterContract = adapters.flexDaoSetPollingAdapterContract.instance;
        this.flexDaoSetVotingAdapterContract = adapters.flexDaoSetVotingAdapterContract.instance;
        this.flexDaoSetFeesAdapterContract = adapters.flexDaoSetFeesAdapterContract.instance;
        this.flexDaoSetGovernorMembershipAdapterContract = adapters.flexDaoSetGovernorMembershipAdapterContract.instance;
        this.flexDaoSetInvestorCapAdapterContract = adapters.flexDaoSetInvestorCapAdapterContract.instance;
        this.flexDaoSetInvestorMembershipAdapterContract = adapters.flexDaoSetInvestorMembershipAdapterContract.instance;
        this.flexDaoSetProposerMembershipAdapterContract = adapters.flexDaoSetProposerMembershipAdapterContract.instance;
        this.flexSetRiceReceiverProposalAdapterContract = adapters.flexSetRiceReceiverProposalAdapterContract.instance;

        // const FlexVestingERC721Helper = await hre.ethers.getContractFactory("FlexVestingERC721Helper");
        // const flexVestingERC721Helper = await FlexVestingERC721Helper.deploy();
        // await flexVestingERC721Helper.deployed();
        // this.flexVestingERC721Helper = flexVestingERC721Helper;

        // const FlexVestingERC721 = await hre.ethers.getContractFactory("FlexVestingERC721");
        // const flexVestingERC721 = await FlexVestingERC721.deploy(
        //     "DAOSquare Investment Receipt",
        //     "DIR",
        //     this.flexVesting.address,
        //     this.flexVestingERC721Helper.address
        // );
        // await flexVestingERC721.deployed();
        // this.flexVestingERC721 = flexVestingERC721;

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
            this.flexVesting.address,
            this.vestingERC721Helper.address
        );
        await vestingERC721.deployed();
        this.vestingERC721 = vestingERC721;

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];
        _daoName = "my_flex_dao002";

        const creator = this.owner.address;

        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd', //FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35', //FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8', //FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c', //FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7', //FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610', //FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda', //FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 770
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753', //StewardMangement
                addr: this.flexStewardMangement.address,
                flags: 6338
            },
            {
                id: '0x37cbe06c1044f98864ea25736326bc1d488e24e5e23781ea2ad64c4069cb9e6e', //flexStewardAllocationAdapter
                addr: this.flexStewardAllocation.address,
                flags: 0
            },
            {
                id: '0x43f8439a5cef099d0d9a92b15a64e34ff49963bb29d65f63204eda6591b810a1', //flexFundingReturnTokenAdapter
                addr: this.flexFundingReturnTokenAdapterContract.address,
                flags: 0
            },
            {
                id: '0xeae11da953333a83b6467e2193334fb302549e1a42ad5797082aea1ab6be9120', //flexFreeInEscrowFundAdapterContract
                addr: this.flexFreeInEscrowFundAdapterContract.address,
                flags: 0
            },
            {
                id: '0xc8e81510cbc5ec7970040e233b001587da1ea4484a9f7b8710d3322429c2df23', //flexFundingHelperAdapterContract
                addr: this.flexFundingHelperAdapterContract.address,
                flags: 0
            },
            // {
            //     id: '0xe564b2da9fb62dadceed6d94ac5884ac5f464424e7be661d7d6181d49fa87b3f', //flexDaoSetAdapterContract
            //     addr: this.flexDaoSetAdapterContract.address,
            //     flags: 778242
            // },
            {
                id: '0xff9379b98b93eb3bd1fac62fd2258a7955d70d2d5279c40064145b6c9646df37', //flexDaoSetHelperAdapterContract
                addr: this.flexDaoSetHelperAdapterContract.address,
                flags: 8
            },
            {
                id: '0x5f0e8d109045653360289a7a02d5dc2a99e382006a42ef93f66de55ecff3176f',// flexDaoSetPollingAdapterContract
                addr: this.flexDaoSetPollingAdapterContract.address,
                flags: 262146
            },
            {
                id: '0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7',//flexDaoSetVotingAdapterContract
                addr: this.flexDaoSetVotingAdapterContract.address,
                flags: 65538
            },
            {
                id: '0xc6bb47f9566baa74b5032b5c10e5bf4a1e2382ca337c2de674732f6401d52cc0',//flexDaoSetFeesAdapterContract
                addr: this.flexDaoSetFeesAdapterContract.address,
                flags: 131074
            },
            {
                id: '0x869e5d18913d4e9bb387c730a04b58d11e95102194f7217a4b684f6e61dff920',//flexDaoSetGovernorMembershipAdapterContract
                addr: this.flexDaoSetGovernorMembershipAdapterContract.address,
                flags: 16386
            },
            {
                id: '0x08f2d2eeda0c9072cdba8b58d442503b4cf9eb6c2f74d75e91dc719111c3189c',//flexDaoSetInvestorCapAdapterContract
                addr: this.flexDaoSetInvestorCapAdapterContract.address,
                flags: 8194
            },
            {
                id: '0xe6121cbf77e02f965a1829c382f701ad4cec84fbda84c45378db0768d2e40871',//flexDaoSetInvestorMembershipAdapterContract
                addr: this.flexDaoSetInvestorMembershipAdapterContract.address,
                flags: 32770
            },
            {
                id: '0xf3ce48289b9021e92bc5661ccf481e756dcb8de846c2eb9620bb83917cab5237',//flexDaoSetProposerMembershipAdapterContract
                addr: this.flexDaoSetProposerMembershipAdapterContract.address,
                flags: 524290
            },
            {
                id: '0xcdb9c6d5700c127f2c99a75e51af1f56590e1b02f8f6ceee2d51d67dd0e91cad',//flexSetRiceReceiverProposalAdapterContract
                addr: this.flexSetRiceReceiverProposalAdapterContract.address,
                flags: 33554442
            }

        ];


        const adapters1 = [{
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: this.flexFundingPoolAdapterContract.address, //FlexFundingPoolAdapterContract
            flags: 75
        },
        {
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: this.flexFundingAdapterContract.address, //FlexFundingAdapterContract
            flags: 26
        }
        ];
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const flexDaoParticipantCapInfo = [
            true, //bool enable;
            5 //uint256 maxParticipantsAmount;
        ]

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMemberships = [
            0, // uint8 varifyType;
            "flexDaoIvestorsMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            "flexDaoGovernorMembershipName",
            0, // uint256 varifyType;0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            3, //eligibilityType 0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];

        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            "flexDaoPollVoterMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //address[] whiteList;
        ];

        const flexDaoPollingInfo = [
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            0, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];

        const flexDaoProposerMembershipInfo = [
            true,
            "flexDaoProposerMembershipName",
            3, // uint8 varifyType;
            0, // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0, // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address] // address[] whiteList;
        ];

        const flexDaoManagementfee = hre.ethers.utils.parseEther("0.001"); // 0.2%
        const returnTokenManagementFee = hre.ethers.utils.parseEther("0.0024");

        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];
        const allocations = [10, 20, 30];

        const fundingPollEnable = false; //DIRECT mode
        const flexDaoFundriaseStyle = 1 // 0 - FCFS 1- Free in
        const riceRewardReceiver = this.user1.address;

        const flexDaoInfo = {
            name: _daoName, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle, // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
            riceRewardReceiver: riceRewardReceiver
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0, // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address, // address tokenAddress;
            tokenId: 0, // uint256 tokenId;
            whiteList: [], // address[] whiteList;
            priorityPeriod: 60 * 10 // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo, //    flexDaoInfo _flexDaoInfo;
        ];

        const {
            daoAddr,
            daoName
        } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        console.log(`
        new dao address ${daoAddr}
        new dao name ${toUtf8(daoName)}
        `)

        this.flexDirectdaoAddress = daoAddr;
        this.daoContract = daoContract;
    });

    const sommonFlexDao = async (summonDaoContract, daoFactoryContract, flexDaoParams) => {
        let tx = await summonDaoContract.summonFlexDao(flexDaoParams);
        let result = await tx.wait();
        const daoAddr = await daoFactoryContract.getDaoAddress(flexDaoParams[flexDaoParams.length - 1].name);
        const daoName = await daoFactoryContract.daos(daoAddr);
        return {
            daoAddr: daoAddr,
            daoName: daoName
        };
    };


    it("priority deposit...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = this.daoContract;
        let tokenAddress = this.testtoken1.address;
        let minFundingAmount = hre.ethers.utils.parseEther("100000");
        let maxFundingAmount = hre.ethers.utils.parseEther("200000");
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%


        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 3; // 0. erc20 1.erc721 2. erc1155 3. whitelist
        let pTokenAddr = ZERO_ADDRESS;
        let pTokenId = 0;
        let pMinHolding = hre.ethers.utils.parseEther("0");
        const enablePriorityDeposit = true;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];


        const priorityWhitelist = [this.investor1.address, this.investor2.address];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
        ];
        console.log(fundingParams);
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
        flex funding ProposalId: ${proposalId}
        state ${flexFundingProposalInfo.state}
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
        await USDT.connect(this.investor1).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.investor2).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.genesis_steward1).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.genesis_steward2).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));

        await USDT.transfer(this.investor1.address, hre.ethers.utils.parseEther("100000"));
        await USDT.transfer(this.investor2.address, hre.ethers.utils.parseEther("100000"));
        await USDT.transfer(this.genesis_steward1.address, hre.ethers.utils.parseEther("100000"));
        await USDT.transfer(this.genesis_steward2.address, hre.ethers.utils.parseEther("100000"));

        const exactmaxFundingAmount = await this.flexFundingHelperAdapterContract.getMaxInvestmentAmount(dao.address, proposalId);
        console.log(`
        maxFundingAmount $${hre.ethers.utils.formatEther(exactmaxFundingAmount)}
        `);

        await flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("100000"));
        await flexFundingPoolAdapt.connect(this.investor1).deposit(dao.address, proposalId, hre.ethers.utils.parseEther("100000"));
        await flexFundingPoolAdapt.connect(this.investor2).deposit(dao.address, proposalId, hre.ethers.utils.parseEther("100000"));
        await flexFundingPoolAdapt.connect(this.genesis_steward1).deposit(dao.address, proposalId, hre.ethers.utils.parseEther("100000"));
        await flexFundingPoolAdapt.connect(this.genesis_steward2).deposit(dao.address, proposalId, hre.ethers.utils.parseEther("100000"));

        let depositeBal = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.owner.address);
        let depositeBal1 = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.investor1.address);
        let depositeBal2 = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.investor2.address);
        let depositeBal3 = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.genesis_steward1.address);
        let depositeBal4 = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.genesis_steward2.address);

        const priorityFunds = await flexFundingPoolAdapt.freeINPriorityDeposits(dao.address, proposalId);

        console.log(`
        deposit balance1   ${hre.ethers.utils.formatEther(depositeBal.toString())}
        deposit balance2  ${hre.ethers.utils.formatEther(depositeBal1.toString())}
        deposit balance3  ${hre.ethers.utils.formatEther(depositeBal2.toString())}
        deposit balance4  ${hre.ethers.utils.formatEther(depositeBal3.toString())}
        deposit balance5  ${hre.ethers.utils.formatEther(depositeBal4.toString())}

        priorityFunds ${hre.ethers.utils.formatEther(priorityFunds)}
        whitdraw...
        `);
        await flexFundingPoolAdapt.withdraw(dao.address, proposalId, hre.ethers.utils.parseEther("100"));
        depositeBal = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.owner.address);
        let totalFund = await flexFundingPoolAdapt.getTotalFundByProposalId(dao.address, proposalId);

        console.log(`
        total fund ${hre.ethers.utils.formatEther(totalFund)}
        deposit balance   ${hre.ethers.utils.formatEther(depositeBal.toString())}
        process proposal...
        `);
        // await flexFundingPoolAdapt.connect(this.investor1).deposit(dao.address, proposalId, toBN(exactmaxFundingAmount).sub(toBN(totalFund)));
        totalFund = await flexFundingPoolAdapt.getTotalFundByProposalId(dao.address, proposalId);
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(fundRaiseEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);

        let escrowed1 = await this.flexFreeInEscrowFundAdapterContract.getEscrowAmount(dao.address, proposalId, this.owner.address);
        let escrowed2 = await this.flexFreeInEscrowFundAdapterContract.getEscrowAmount(dao.address, proposalId, this.investor1.address);
        let escrowed3 = await this.flexFreeInEscrowFundAdapterContract.getEscrowAmount(dao.address, proposalId, this.investor2.address);
        let escrowed4 = await this.flexFreeInEscrowFundAdapterContract.getEscrowAmount(dao.address, proposalId, this.genesis_steward1.address);
        let escrowed5 = await this.flexFreeInEscrowFundAdapterContract.getEscrowAmount(dao.address, proposalId, this.genesis_steward2.address);


        depositeBal = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.owner.address);
        depositeBal1 = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.investor1.address);
        depositeBal2 = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.investor2.address);
        depositeBal3 = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.genesis_steward1.address);
        depositeBal4 = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.genesis_steward2.address);
        totalFund = await flexFundingPoolAdapt.getTotalFundByProposalId(dao.address, proposalId);

        const share1 = await this.flexAllocationAdapterContract.vestingInfos(dao.address, proposalId, this.owner.address);
        const share2 = await this.flexAllocationAdapterContract.vestingInfos(dao.address, proposalId, this.investor1.address);
        const share3 = await this.flexAllocationAdapterContract.vestingInfos(dao.address, proposalId, this.investor2.address);
        const share4 = await this.flexAllocationAdapterContract.vestingInfos(dao.address, proposalId, this.genesis_steward1.address);
        const share5 = await this.flexAllocationAdapterContract.vestingInfos(dao.address, proposalId, this.genesis_steward2.address);

        let usdtBal1 = await USDT.balanceOf(this.owner.address);
        let usdtBal2 = await USDT.balanceOf(this.investor1.address);
        let usdtBal3 = await USDT.balanceOf(this.investor2.address);
        let usdtBal4 = await USDT.balanceOf(this.genesis_steward1.address);
        let usdtBal5 = await USDT.balanceOf(this.genesis_steward2.address);


        console.log(`
        state ${flexFundingProposalInfo.state}
        total fund ${hre.ethers.utils.formatEther(totalFund)}
        escrowed amount1 ${hre.ethers.utils.formatEther(escrowed1[1])}
        escrowed amount2 ${hre.ethers.utils.formatEther(escrowed2[1])}
        escrowed amount3 ${hre.ethers.utils.formatEther(escrowed3[1])}
        escrowed amount4 ${hre.ethers.utils.formatEther(escrowed4[1])}
        escrowed amount5 ${hre.ethers.utils.formatEther(escrowed5[1])}

        deposit balance1   ${hre.ethers.utils.formatEther(depositeBal.toString())}
        deposit balance2  ${hre.ethers.utils.formatEther(depositeBal1.toString())}
        deposit balance3  ${hre.ethers.utils.formatEther(depositeBal2.toString())}
        deposit balance4  ${hre.ethers.utils.formatEther(depositeBal3.toString())}
        deposit balance5  ${hre.ethers.utils.formatEther(depositeBal4.toString())}

        share1  ${hre.ethers.utils.formatEther(share1.tokenAmount.toString())}
        share2  ${hre.ethers.utils.formatEther(share2.tokenAmount.toString())}
        share3  ${hre.ethers.utils.formatEther(share3.tokenAmount.toString())}
        share4  ${hre.ethers.utils.formatEther(share4.tokenAmount.toString())}
        share5  ${hre.ethers.utils.formatEther(share5.tokenAmount.toString())}

        usdtBal1  ${hre.ethers.utils.formatEther(usdtBal1.toString())}
        usdtBal2  ${hre.ethers.utils.formatEther(usdtBal2.toString())}
        usdtBal3  ${hre.ethers.utils.formatEther(usdtBal3.toString())}
        usdtBal4  ${hre.ethers.utils.formatEther(usdtBal4.toString())}
        usdtBal5  ${hre.ethers.utils.formatEther(usdtBal5.toString())}

        escrow refund...
        `);

        await this.flexFreeInEscrowFundAdapterContract.withdraw(dao.address, proposalId);
        await this.flexFreeInEscrowFundAdapterContract.connect(this.genesis_steward1).withdraw(dao.address, proposalId);
        await this.flexFreeInEscrowFundAdapterContract.connect(this.genesis_steward2).withdraw(dao.address, proposalId);

        escrowed1 = await this.flexFreeInEscrowFundAdapterContract.getEscrowAmount(dao.address, proposalId, this.owner.address);
        escrowed2 = await this.flexFreeInEscrowFundAdapterContract.getEscrowAmount(dao.address, proposalId, this.investor1.address);
        escrowed3 = await this.flexFreeInEscrowFundAdapterContract.getEscrowAmount(dao.address, proposalId, this.investor2.address);
        escrowed4 = await this.flexFreeInEscrowFundAdapterContract.getEscrowAmount(dao.address, proposalId, this.genesis_steward1.address);
        escrowed5 = await this.flexFreeInEscrowFundAdapterContract.getEscrowAmount(dao.address, proposalId, this.genesis_steward2.address);

        usdtBal1 = await USDT.balanceOf(this.owner.address);
        usdtBal2 = await USDT.balanceOf(this.investor1.address);
        usdtBal3 = await USDT.balanceOf(this.investor2.address);
        usdtBal4 = await USDT.balanceOf(this.genesis_steward1.address);
        usdtBal5 = await USDT.balanceOf(this.genesis_steward2.address);

        console.log(`
        escrowed amount1 ${hre.ethers.utils.formatEther(escrowed1[1])}
        escrowed amount2 ${hre.ethers.utils.formatEther(escrowed2[1])}
        escrowed amount3 ${hre.ethers.utils.formatEther(escrowed3[1])}
        escrowed amount4 ${hre.ethers.utils.formatEther(escrowed4[1])}
        escrowed amount5 ${hre.ethers.utils.formatEther(escrowed5[1])}

        usdtBal1  ${hre.ethers.utils.formatEther(usdtBal1.toString())}
        usdtBal2  ${hre.ethers.utils.formatEther(usdtBal2.toString())}
        usdtBal3  ${hre.ethers.utils.formatEther(usdtBal3.toString())}
        usdtBal4  ${hre.ethers.utils.formatEther(usdtBal4.toString())}
        usdtBal5  ${hre.ethers.utils.formatEther(usdtBal5.toString())}

        `)

    });
});

describe("participant cap...", () => {
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

        let _daoName = "my_flex_dao1";

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
        // this.flexVestingERC721 = utilContracts.flexVestingERC721.instance;
        this.flexAllocationAdapterContract = adapters.flexAllocationAdapterContract.instance;
        this.flexFundingPoolAdapterContract = adapters.flexFundingPoolAdapterContract.instance;
        this.flexVotingContract = adapters.flexVotingContract.instance;
        this.flexFundingAdapterContract = adapters.flexFundingAdapterContract.instance;
        this.bentoBoxV1 = adapters.bentoBoxV1.instance;
        // this.managing = this.adapters.managing.instance;
        this.flexPollingVotingContract = adapters.flexPollingVotingContract.instance;
        this.flexStewardAllocation = adapters.flexStewardAllocation.instance;
        this.flexStewardMangement = this.adapters.stewardManagementContract.instance;
        this.flexFundingReturnTokenAdapterContract = adapters.flexFundingReturnTokenAdapterContract.instance;
        this.flexFreeInEscrowFundAdapterContract = adapters.flexFreeInEscrowFundAdapterContract.instance;
        this.flexFundingHelperAdapterContract = adapters.flexFundingHelperAdapterContract.instance;
        this.flexDaoSetAdapterContract = adapters.flexDaoSetAdapterContract.instance;
        this.flexDaoSetHelperAdapterContract = adapters.flexDaoSetHelperAdapterContract.instance;
        this.flexDaoSetPollingAdapterContract = adapters.flexDaoSetPollingAdapterContract.instance;
        this.flexDaoSetVotingAdapterContract = adapters.flexDaoSetVotingAdapterContract.instance;
        this.flexDaoSetFeesAdapterContract = adapters.flexDaoSetFeesAdapterContract.instance;
        this.flexDaoSetGovernorMembershipAdapterContract = adapters.flexDaoSetGovernorMembershipAdapterContract.instance;
        this.flexDaoSetInvestorCapAdapterContract = adapters.flexDaoSetInvestorCapAdapterContract.instance;
        this.flexDaoSetInvestorMembershipAdapterContract = adapters.flexDaoSetInvestorMembershipAdapterContract.instance;
        this.flexDaoSetProposerMembershipAdapterContract = adapters.flexDaoSetProposerMembershipAdapterContract.instance;
        this.flexSetRiceReceiverProposalAdapterContract = adapters.flexSetRiceReceiverProposalAdapterContract.instance;

        // const FlexVestingERC721Helper = await hre.ethers.getContractFactory("FlexVestingERC721Helper");
        // const flexVestingERC721Helper = await FlexVestingERC721Helper.deploy();
        // await flexVestingERC721Helper.deployed();
        // this.flexVestingERC721Helper = flexVestingERC721Helper;

        // const FlexVestingERC721 = await hre.ethers.getContractFactory("FlexVestingERC721");
        // const flexVestingERC721 = await FlexVestingERC721.deploy(
        //     "DAOSquare Investment Receipt",
        //     "DIR",
        //     this.flexVesting.address,
        //     this.flexVestingERC721Helper.address
        // );
        // await flexVestingERC721.deployed();
        // this.flexVestingERC721 = flexVestingERC721;

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
            this.flexVesting.address,
            this.vestingERC721Helper.address
        );
        await vestingERC721.deployed();
        this.vestingERC721 = vestingERC721;

        this.summonDao = this.adapters.summonDao.instance;

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];
        _daoName = "my_flex_dao002";

        const creator = this.owner.address;

        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd', //FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35', //FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8', //FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c', //FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7', //FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610', //FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda', //FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 770
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753', //StewardMangement
                addr: this.flexStewardMangement.address,
                flags: 6338
            },
            {
                id: '0x37cbe06c1044f98864ea25736326bc1d488e24e5e23781ea2ad64c4069cb9e6e', //flexStewardAllocationAdapter
                addr: this.flexStewardAllocation.address,
                flags: 0
            },
            {
                id: '0x43f8439a5cef099d0d9a92b15a64e34ff49963bb29d65f63204eda6591b810a1', //flexFundingReturnTokenAdapter
                addr: this.flexFundingReturnTokenAdapterContract.address,
                flags: 0
            },
            {
                id: '0xeae11da953333a83b6467e2193334fb302549e1a42ad5797082aea1ab6be9120', //flexFreeInEscrowFundAdapterContract
                addr: this.flexFreeInEscrowFundAdapterContract.address,
                flags: 0
            },
            {
                id: '0xc8e81510cbc5ec7970040e233b001587da1ea4484a9f7b8710d3322429c2df23', //flexFundingHelperAdapterContract
                addr: this.flexFundingHelperAdapterContract.address,
                flags: 0
            },
            // {
            //     id: '0xe564b2da9fb62dadceed6d94ac5884ac5f464424e7be661d7d6181d49fa87b3f', //flexDaoSetAdapterContract
            //     addr: this.flexDaoSetAdapterContract.address,
            //     flags: 778242
            // },
            {
                id: '0xff9379b98b93eb3bd1fac62fd2258a7955d70d2d5279c40064145b6c9646df37', //flexDaoSetHelperAdapterContract
                addr: this.flexDaoSetHelperAdapterContract.address,
                flags: 8
            },
            {
                id: '0x5f0e8d109045653360289a7a02d5dc2a99e382006a42ef93f66de55ecff3176f',// flexDaoSetPollingAdapterContract
                addr: this.flexDaoSetPollingAdapterContract.address,
                flags: 262146
            },
            {
                id: '0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7',//flexDaoSetVotingAdapterContract
                addr: this.flexDaoSetVotingAdapterContract.address,
                flags: 65538
            },
            {
                id: '0xc6bb47f9566baa74b5032b5c10e5bf4a1e2382ca337c2de674732f6401d52cc0',//flexDaoSetFeesAdapterContract
                addr: this.flexDaoSetFeesAdapterContract.address,
                flags: 131074
            },
            {
                id: '0x869e5d18913d4e9bb387c730a04b58d11e95102194f7217a4b684f6e61dff920',//flexDaoSetGovernorMembershipAdapterContract
                addr: this.flexDaoSetGovernorMembershipAdapterContract.address,
                flags: 16386
            },
            {
                id: '0x08f2d2eeda0c9072cdba8b58d442503b4cf9eb6c2f74d75e91dc719111c3189c',//flexDaoSetInvestorCapAdapterContract
                addr: this.flexDaoSetInvestorCapAdapterContract.address,
                flags: 8194
            },
            {
                id: '0xe6121cbf77e02f965a1829c382f701ad4cec84fbda84c45378db0768d2e40871',//flexDaoSetInvestorMembershipAdapterContract
                addr: this.flexDaoSetInvestorMembershipAdapterContract.address,
                flags: 32770
            },
            {
                id: '0xf3ce48289b9021e92bc5661ccf481e756dcb8de846c2eb9620bb83917cab5237',//flexDaoSetProposerMembershipAdapterContract
                addr: this.flexDaoSetProposerMembershipAdapterContract.address,
                flags: 524290
            },
            {
                id: '0xcdb9c6d5700c127f2c99a75e51af1f56590e1b02f8f6ceee2d51d67dd0e91cad',//flexSetRiceReceiverProposalAdapterContract
                addr: this.flexSetRiceReceiverProposalAdapterContract.address,
                flags: 33554442
            }

        ];
        const adapters1 = [{
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: this.flexFundingPoolAdapterContract.address, //FlexFundingPoolAdapterContract
            flags: 75
        },
        {
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: this.flexFundingAdapterContract.address, //FlexFundingAdapterContract
            flags: 26
        }
        ];
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const flexDaoParticipantCapInfo = [
            true, //bool enable;
            5 //uint256 maxParticipantsAmount;
        ]

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMemberships = [
            0, // uint8 varifyType;
            "flexDaoIvestorsMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            "flexDaoGovernorMembershipName",
            0, // uint256 varifyType;0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            3, //eligibilityType 0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];

        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            "flexDaoPollVoterMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //address[] whiteList;
        ];

        const flexDaoPollingInfo = [
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            0, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];

        const flexDaoProposerMembershipInfo = [
            true,
            "flexDaoProposerMembershipName",
            3, // uint8 varifyType;
            0, // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0, // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address] // address[] whiteList;
        ];

        const flexDaoManagementfee = hre.ethers.utils.parseEther("0.001"); // 0.2%
        const returnTokenManagementFee = hre.ethers.utils.parseEther("0.0024");
        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];
        const allocations = [10, 20, 30];

        const fundingPollEnable = false; //DIRECT mode
        const flexDaoFundriaseStyle = 1 // 0 - FCFS 1- Free ink0
        const riceRewardReceiver = this.user1.address;

        const flexDaoInfo = {
            name: _daoName, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            // flexDaoFundriaseStyle: flexDaoFundriaseStyle,// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
            riceRewardReceiver: riceRewardReceiver
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0, // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address, // address tokenAddress;
            tokenId: 0, // uint256 tokenId;
            whiteList: [], // address[] whiteList;
            priorityPeriod: 60 * 10 // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo, //    flexDaoInfo _flexDaoInfo;
        ];

        const {
            daoAddr,
            daoName
        } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        console.log(`
        new dao address ${daoAddr}
        new dao name ${toUtf8(daoName)}
            `)

        this.flexDirectdaoAddress = daoAddr;
        this.daoContract = daoContract;
    });

    const sommonFlexDao = async (summonDaoContract, daoFactoryContract, flexDaoParams) => {
        let tx = await summonDaoContract.summonFlexDao(flexDaoParams);
        let result = await tx.wait();
        const daoAddr = await daoFactoryContract.getDaoAddress(flexDaoParams[flexDaoParams.length - 1].name);
        const daoName = await daoFactoryContract.daos(daoAddr);
        return {
            daoAddr: daoAddr,
            daoName: daoName
        };
    };

    it("test...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = this.daoContract;
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%


        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "flex vesting";
        const vestDescription = "a flex vesting";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 0;
        let pMinHolding = hre.ethers.utils.parseEther("100");
        const enablePriorityDeposit = true;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];
        const priorityWhitelist = [];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
        ];
        console.log(fundingParams);
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
        flex funding ProposalId: ${proposalId}
        state ${flexFundingProposalInfo.state}
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
        await USDT.connect(this.investor1).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.investor2).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.genesis_steward1).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.genesis_steward2).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.user1).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));

        await USDT.transfer(this.investor1.address, hre.ethers.utils.parseEther("100000"));
        await USDT.transfer(this.investor2.address, hre.ethers.utils.parseEther("100000"));
        await USDT.transfer(this.genesis_steward1.address, hre.ethers.utils.parseEther("100000"));
        await USDT.transfer(this.genesis_steward2.address, hre.ethers.utils.parseEther("100000"));
        await USDT.transfer(this.user1.address, hre.ethers.utils.parseEther("100000"));

        const exactmaxFundingAmount = await this.flexFundingHelperAdapterContract.getMaxInvestmentAmount(dao.address, proposalId);
        console.log(`
        maxFundingAmount ${hre.ethers.utils.formatEther(exactmaxFundingAmount)}
            `);

        await flexFundingPoolAdapt.deposit(dao.address, proposalId, minDepositAmount);
        await flexFundingPoolAdapt.connect(this.investor1).deposit(dao.address, proposalId, minDepositAmount);
        await flexFundingPoolAdapt.connect(this.investor2).deposit(dao.address, proposalId, minDepositAmount);
        await flexFundingPoolAdapt.connect(this.genesis_steward1).deposit(dao.address, proposalId, minDepositAmount);
        await flexFundingPoolAdapt.connect(this.genesis_steward2).deposit(dao.address, proposalId, minDepositAmount);
        await expectRevert(flexFundingPoolAdapt.connect(this.user1).deposit(dao.address, proposalId, minDepositAmount), "revert");

        let depositeBal = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.owner.address);
        let depositeBal1 = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.investor1.address);
        let depositeBal2 = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.investor2.address);
        let depositeBal3 = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.genesis_steward1.address);
        let depositeBal4 = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.genesis_steward2.address);

        const flexFundingPoolExtAddr = await dao.getExtensionAddress("0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c")
        const flexFundingPoolExt = (await hre.ethers.getContractFactory("FlexInvestmentPoolExtension")).attach(flexFundingPoolExtAddr);
        let investors = await flexFundingPoolExt.getInvestorsByProposalId(proposalId);


        console.log(`
        deposit balance1   ${hre.ethers.utils.formatEther(depositeBal.toString())}
        deposit balance2  ${hre.ethers.utils.formatEther(depositeBal1.toString())}
        deposit balance3  ${hre.ethers.utils.formatEther(depositeBal2.toString())}
        deposit balance4  ${hre.ethers.utils.formatEther(depositeBal3.toString())}
        deposit balance5  ${hre.ethers.utils.formatEther(depositeBal4.toString())}
        all investors ${investors}
        whitdraw...
        `);
        await flexFundingPoolAdapt.withdraw(dao.address, proposalId, minDepositAmount);
        depositeBal = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.owner.address);
        let totalFund = await flexFundingPoolAdapt.getTotalFundByProposalId(dao.address, proposalId);
        investors = await flexFundingPoolExt.getInvestorsByProposalId(proposalId);

        console.log(`
        all investors ${investors}
        total fund ${hre.ethers.utils.formatEther(totalFund)}
        deposit balance   ${hre.ethers.utils.formatEther(depositeBal.toString())}
        `);

        await flexFundingPoolAdapt.connect(this.user1).deposit(dao.address, proposalId, minDepositAmount);
        investors = await flexFundingPoolExt.getInvestorsByProposalId(proposalId);
        totalFund = await flexFundingPoolAdapt.getTotalFundByProposalId(dao.address, proposalId);
        depositeBal = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.user1.address);

        console.log(`
        all investors ${investors}
        total fund ${hre.ethers.utils.formatEther(totalFund)}
        deposit balance   ${hre.ethers.utils.formatEther(depositeBal.toString())}
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

        let _daoName = "my_flex_dao1";

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
        // this.flexVestingERC721 = utilContracts.flexVestingERC721.instance;
        this.flexAllocationAdapterContract = adapters.flexAllocationAdapterContract.instance;
        this.flexFundingPoolAdapterContract = adapters.flexFundingPoolAdapterContract.instance;
        this.flexVotingContract = adapters.flexVotingContract.instance;
        this.flexFundingAdapterContract = adapters.flexFundingAdapterContract.instance;
        this.bentoBoxV1 = adapters.bentoBoxV1.instance;
        // this.managing = this.adapters.managing.instance;
        this.flexPollingVotingContract = adapters.flexPollingVotingContract.instance;
        this.flexStewardAllocation = adapters.flexStewardAllocation.instance;
        this.flexStewardMangement = this.adapters.stewardManagementContract.instance;
        this.flexFundingReturnTokenAdapterContract = adapters.flexFundingReturnTokenAdapterContract.instance;
        this.flexFreeInEscrowFundAdapterContract = adapters.flexFreeInEscrowFundAdapterContract.instance;
        this.flexFundingHelperAdapterContract = adapters.flexFundingHelperAdapterContract.instance;
        this.flexDaoSetAdapterContract = adapters.flexDaoSetAdapterContract.instance;
        this.flexDaoSetHelperAdapterContract = adapters.flexDaoSetHelperAdapterContract.instance;
        this.flexDaoSetPollingAdapterContract = adapters.flexDaoSetPollingAdapterContract.instance;
        this.flexDaoSetVotingAdapterContract = adapters.flexDaoSetVotingAdapterContract.instance;
        this.flexDaoSetFeesAdapterContract = adapters.flexDaoSetFeesAdapterContract.instance;
        this.flexDaoSetGovernorMembershipAdapterContract = adapters.flexDaoSetGovernorMembershipAdapterContract.instance;
        this.flexDaoSetInvestorCapAdapterContract = adapters.flexDaoSetInvestorCapAdapterContract.instance;
        this.flexDaoSetInvestorMembershipAdapterContract = adapters.flexDaoSetInvestorMembershipAdapterContract.instance;
        this.flexDaoSetProposerMembershipAdapterContract = adapters.flexDaoSetProposerMembershipAdapterContract.instance;
        this.flexSetRiceReceiverProposalAdapterContract = adapters.flexSetRiceReceiverProposalAdapterContract.instance;

        // const FlexVestingERC721Helper = await hre.ethers.getContractFactory("FlexVestingERC721Helper");
        // const flexVestingERC721Helper = await FlexVestingERC721Helper.deploy();
        // await flexVestingERC721Helper.deployed();
        // this.flexVestingERC721Helper = flexVestingERC721Helper;

        // const FlexVestingERC721 = await hre.ethers.getContractFactory("FlexVestingERC721");
        // const flexVestingERC721 = await FlexVestingERC721.deploy(
        //     "DAOSquare Investment Receipt",
        //     "DIR",
        //     this.flexVesting.address,
        //     this.flexVestingERC721Helper.address
        // );
        // await flexVestingERC721.deployed();
        // this.flexVestingERC721 = flexVestingERC721;

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
            this.flexVesting.address,
            this.vestingERC721Helper.address
        );
        await vestingERC721.deployed();
        this.vestingERC721 = vestingERC721;

        this.summonDao = this.adapters.summonDao.instance;

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];
        _daoName = "my_flex_dao002";

        const creator = this.owner.address;

        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd', //FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35', //FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8', //FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c', //FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7', //FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610', //FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda', //FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 770
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753', //StewardMangement
                addr: this.flexStewardMangement.address,
                flags: 6338
            },
            {
                id: '0x37cbe06c1044f98864ea25736326bc1d488e24e5e23781ea2ad64c4069cb9e6e', //flexStewardAllocationAdapter
                addr: this.flexStewardAllocation.address,
                flags: 0
            },
            {
                id: '0x43f8439a5cef099d0d9a92b15a64e34ff49963bb29d65f63204eda6591b810a1', //flexFundingReturnTokenAdapter
                addr: this.flexFundingReturnTokenAdapterContract.address,
                flags: 0
            },
            {
                id: '0xeae11da953333a83b6467e2193334fb302549e1a42ad5797082aea1ab6be9120', //flexFreeInEscrowFundAdapterContract
                addr: this.flexFreeInEscrowFundAdapterContract.address,
                flags: 0
            },
            {
                id: '0xc8e81510cbc5ec7970040e233b001587da1ea4484a9f7b8710d3322429c2df23', //flexFundingHelperAdapterContract
                addr: this.flexFundingHelperAdapterContract.address,
                flags: 0
            },
            // {
            //     id: '0xe564b2da9fb62dadceed6d94ac5884ac5f464424e7be661d7d6181d49fa87b3f', //flexDaoSetAdapterContract
            //     addr: this.flexDaoSetAdapterContract.address,
            //     flags: 778242
            // },
            {
                id: '0xff9379b98b93eb3bd1fac62fd2258a7955d70d2d5279c40064145b6c9646df37', //flexDaoSetHelperAdapterContract
                addr: this.flexDaoSetHelperAdapterContract.address,
                flags: 8
            },
            {
                id: '0x5f0e8d109045653360289a7a02d5dc2a99e382006a42ef93f66de55ecff3176f',// flexDaoSetPollingAdapterContract
                addr: this.flexDaoSetPollingAdapterContract.address,
                flags: 262146
            },
            {
                id: '0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7',//flexDaoSetVotingAdapterContract
                addr: this.flexDaoSetVotingAdapterContract.address,
                flags: 65538
            },
            {
                id: '0xc6bb47f9566baa74b5032b5c10e5bf4a1e2382ca337c2de674732f6401d52cc0',//flexDaoSetFeesAdapterContract
                addr: this.flexDaoSetFeesAdapterContract.address,
                flags: 131074
            },
            {
                id: '0x869e5d18913d4e9bb387c730a04b58d11e95102194f7217a4b684f6e61dff920',//flexDaoSetGovernorMembershipAdapterContract
                addr: this.flexDaoSetGovernorMembershipAdapterContract.address,
                flags: 16386
            },
            {
                id: '0x08f2d2eeda0c9072cdba8b58d442503b4cf9eb6c2f74d75e91dc719111c3189c',//flexDaoSetInvestorCapAdapterContract
                addr: this.flexDaoSetInvestorCapAdapterContract.address,
                flags: 8194
            },
            {
                id: '0xe6121cbf77e02f965a1829c382f701ad4cec84fbda84c45378db0768d2e40871',//flexDaoSetInvestorMembershipAdapterContract
                addr: this.flexDaoSetInvestorMembershipAdapterContract.address,
                flags: 32770
            },
            {
                id: '0xf3ce48289b9021e92bc5661ccf481e756dcb8de846c2eb9620bb83917cab5237',//flexDaoSetProposerMembershipAdapterContract
                addr: this.flexDaoSetProposerMembershipAdapterContract.address,
                flags: 524290
            },
            {
                id: '0xcdb9c6d5700c127f2c99a75e51af1f56590e1b02f8f6ceee2d51d67dd0e91cad',//flexSetRiceReceiverProposalAdapterContract
                addr: this.flexSetRiceReceiverProposalAdapterContract.address,
                flags: 33554442
            }

        ];

        const adapters1 = [{
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: this.flexFundingPoolAdapterContract.address, //FlexFundingPoolAdapterContract
            flags: 75
        },
        {
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: this.flexFundingAdapterContract.address, //FlexFundingAdapterContract
            flags: 26
        }
        ];
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const flexDaoParticipantCapInfo = [
            true, //bool enable;
            2 //uint256 maxParticipantsAmount;
        ]

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMemberships = [
            0, // uint8 varifyType;
            "flexDaoIvestorsMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            "flexDaoGovernorMembershipName",
            0, // uint256 varifyType;0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            3, //eligibilityType 0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //tokenAddress
            0, //tokenID
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            60, // uint256 superMajority;
            66, // uint256 quorum;
            0, //supportType
            0 //quorumType
        ];

        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            "flexDaoPollVoterMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //address[] whiteList;
        ];

        const flexDaoPollingInfo = [
            60 * 10, // uint256 votingPeriod;
            0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
            2, // uint256 superMajority;
            2, // uint256 quorum;
            0, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
            this.testtoken1.address, //   address tokenAddress;
            0, //    uint256 tokenID;
            0, //  uint256 supportType; // 0. YES - NO > X
            0 //uint256 quorumType; // 0. YES + NO > X       
        ];

        const flexDaoProposerMembershipInfo = [
            true,
            "flexDaoProposerMembershipName",
            3, // uint8 varifyType;
            0, // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0, // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address] // address[] whiteList;
        ];

        const flexDaoManagementfee = hre.ethers.utils.parseEther("0.01"); // 0.2%
        const returnTokenManagementFee = hre.ethers.utils.parseEther("0.05");
        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];
        const allocations = [10, 20, 30];

        const fundingPollEnable = false; //DIRECT mode
        const flexDaoFundriaseStyle = 1 // 0 - FCFS 1- Free ink0
        const riceRewardReceiver = this.user1.address;

        const flexDaoInfo = {
            name: _daoName, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            flexDaoFundriaseStyle: flexDaoFundriaseStyle, // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
            riceRewardReceiver: riceRewardReceiver
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0, // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address, // address tokenAddress;
            tokenId: 0, // uint256 tokenId;
            whiteList: [], // address[] whiteList;
            priorityPeriod: 60 * 10 // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships, // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo, // flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo, //    flexDaoInfo _flexDaoInfo;
        ];

        const {
            daoAddr,
            daoName
        } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);
        const pollingToken = await daoContract.getAddressConfiguration("0xf60c24a553194691fd513f91f28ce90d85b87ab669703faa0b848c72a41c6923");
        const flexPollingVoteWeight = await this.flexPollingVotingContract.getVotingWeight(daoAddr, this.owner.address);
        console.log(`
        new dao address ${daoAddr}
        new dao name ${toUtf8(daoName)}
        pollingToken ${pollingToken}
        flexPollingVoteWeight ${flexPollingVoteWeight}
            `)

        this.flexDirectdaoAddress = daoAddr;
        this.daoContract = daoContract;
    });

    const sommonFlexDao = async (summonDaoContract, daoFactoryContract, flexDaoParams) => {
        let tx = await summonDaoContract.summonFlexDao(flexDaoParams);
        let result = await tx.wait();
        const daoAddr = await daoFactoryContract.getDaoAddress(flexDaoParams[flexDaoParams.length - 1].name);
        const daoName = await daoFactoryContract.daos(daoAddr);
        return {
            daoAddr: daoAddr,
            daoName: daoName
        };
    };

    it("varify return token management fee...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const flexVestingContract = this.flexVesting;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.flexDirectdaoAddress);
        const fundingpoolextensionAddr = await dao.getExtensionAddress(sha3("flex-funding-pool-ext"));
        const flexFundingPoolExtContract = (await hre.ethers.getContractFactory("FlexInvestmentPoolExtension")).attach(fundingpoolextensionAddr);

        let tokenAddress = this.testtoken1.address;
        let minFundingAmount = hre.ethers.utils.parseEther("100");
        let maxFundingAmount = hre.ethers.utils.parseEther("200");
        let escrow = true;
        let returnTokenAddr = this.testtoken2.address;
        let returnTokenAmount = hre.ethers.utils.parseEther("10000000");
        let price = hre.ethers.utils.parseEther("2");
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
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%

        const vestNFTEnable = false;
        const nftToken = ZERO_ADDRESS;
        const vestName = "";
        const vestDescription = "";

        let vestInfo = [
            vestingStartTime,
            vestingCliffEndTime,
            vestingEndTime,
            vestingInterval,
            vestingCliffLockAmount,
            vestNFTEnable,
            nftToken,
            vestName,
            vestDescription
        ];

        let fundRaiseType = 1;
        let fundRaiseStartTime = blocktimestamp;
        let fundRaiseEndTime = fundRaiseStartTime + 100000;
        let minDepositAmount = hre.ethers.utils.parseEther("1");
        let maxDepositAmount = hre.ethers.utils.parseEther("200");
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

        let pType = 0;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;
        const enablePriorityDeposit = false;
        let priorityDepositInfo = [
            enablePriorityDeposit,
            pType,
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
            priorityDepositInfo
        ];

        let tokenRewardAmount = hre.ethers.utils.parseEther("0.05"); // 2%
        let cashRewardAmount = hre.ethers.utils.parseEther("0.01"); // 0.3%

        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];


        const priorityWhitelist = [];

        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos,
            priorityWhitelist
        ];
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
            flex funding ProposalId: ${proposalId}
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
        await this.testtoken2.connect(this.user1).approve(this.flexFundingReturnTokenAdapterContract.address,
            returnTokenAmount);

        await this.flexFundingReturnTokenAdapterContract.connect(this.user1).setFundingApprove(
            dao.address,
            proposalId,
            this.testtoken2.address,
            returnTokenAmount);


        await USDT.transfer(this.investor1.address, hre.ethers.utils.parseEther("100000"));
        await USDT.approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.investor1).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));

        await expectRevert(flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("0.1")), "revert");
        await flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("160"));
        await flexFundingPoolAdapt.connect(this.investor1).deposit(dao.address, proposalId, hre.ethers.utils.parseEther("15"));

        const investors = await flexFundingPoolExtContract.getInvestorsByProposalId(proposalId);
        console.log("investors: ", investors);
        let depositeBal = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.owner.address);
        console.log(`
            deposit balance   ${hre.ethers.utils.formatEther(depositeBal.toString())}
            whitdraw...
            `);
        await flexFundingPoolAdapt.withdraw(dao.address, proposalId, hre.ethers.utils.parseEther("10"));
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
        const paybacktokenamount = flexFundingProposalInfo.investmentInfo.paybackTokenAmount;
        const managementFeeAddress = await dao.getAddressConfiguration(sha3("FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS"));

        const returnTokenManagementFeeAmount = toBN(paybacktokenamount).
            mul(toBN(hre.ethers.utils.parseEther("0.0024"))).
            div(hre.ethers.utils.parseEther("1"));
        const receivedReturnTokenManangementFeeAmount = await this.testtoken2.balanceOf(managementFeeAddress);
        const protocolAddress = await flexFundingAdapterContract.protocolAddress();
        const protocolFee = await USDT.balanceOf(protocolAddress);
        const managementFee = await USDT.balanceOf(managementFeeAddress);
        const proposerReturnTokenRewardAmount = toBN(paybacktokenamount)
            .mul(tokenRewardAmount)
            .div(hre.ethers.utils.parseEther("1"));
        const proposerReceivedReturnTokenAmount = await this.testtoken2.balanceOf(this.funding_proposer1_whitelist.address);
        const proposerreward = await USDT.balanceOf(this.funding_proposer1_whitelist.address);
        const receiveAmount = await USDT.balanceOf(recipientAddr);
        const allTributedAmount = toBN(protocolFee.toString()).
            add(toBN(managementFee.toString())).
            add(toBN(proposerreward.toString())).
            add(toBN(receiveAmount.toString()));


        const totalFunding = toBN(flexFundingProposalInfo.investmentInfo.finalRaisedAmount.toString())
            .sub(
                toBN(protocolFee.toString()))
            .sub(
                toBN(managementFee.toString()))
            .sub(
                toBN(proposerreward.toString())
            );

        const totalPayback = totalFunding.mul(toBN(hre.ethers.utils.parseEther("1"))).div(toBN(price));

        console.log(`
            processed...
            state ${flexFundingProposalInfo.state}
            price ${hre.ethers.utils.formatEther(flexFundingProposalInfo.investmentInfo.price)}
            finalRaiseAmount ${hre.ethers.utils.formatEther(flexFundingProposalInfo.investmentInfo.finalRaisedAmount)}
            paybackTokenAmount ${hre.ethers.utils.formatEther(flexFundingProposalInfo.investmentInfo.paybackTokenAmount)}
            protocol Fee ${hre.ethers.utils.formatEther(protocolFee)}
            management Fee ${hre.ethers.utils.formatEther(managementFee)}
            totalFunding ${hre.ethers.utils.formatEther(totalFunding)}
            totalPayback ${hre.ethers.utils.formatEther(totalPayback)}
            proposerReturnTokenRewardAmount ${hre.ethers.utils.formatEther(proposerReturnTokenRewardAmount)}
            proposerReceivedReturnTokenAmount ${hre.ethers.utils.formatEther(proposerReceivedReturnTokenAmount)}
            proposer reward ${hre.ethers.utils.formatEther(proposerreward)}
            receive Amount ${hre.ethers.utils.formatEther(receiveAmount)}
            returnTokenManagementFeeAmount ${hre.ethers.utils.formatEther(returnTokenManagementFeeAmount)}
            receivedReturnTokenManangementFeeAmount ${hre.ethers.utils.formatEther(receivedReturnTokenManangementFeeAmount)}
            total tributed amount ${hre.ethers.utils.formatEther(allTributedAmount)}
            create vesting...
            `);


        await flexVestingContract.createVesting(dao.address, this.owner.address, proposalId);
        await flexVestingContract.connect(this.genesis_steward1).createVesting(dao.address, this.genesis_steward1.address, proposalId);
        await flexVestingContract.connect(this.funding_proposer1_whitelist).createVesting(dao.address, this.funding_proposer1_whitelist.address, proposalId);
        await flexVestingContract.connect(this.investor1).createVesting(dao.address, this.investor1.address, proposalId);

        let createdVestingInfo = await flexVestingContract.vests(1);
        let createdVestingInfo2 = await flexVestingContract.vests(2);
        let createdVestingInfo3 = await flexVestingContract.vests(3);
        let createdVestingInfo4 = await flexVestingContract.vests(4);

        const vestingBal = await flexVestingContract.vestBalance(1);
        const vestingBal2 = await flexVestingContract.vestBalance(2);
        const vestingBal3 = await flexVestingContract.vestBalance(3);
        const vestingBal4 = await flexVestingContract.vestBalance(4);

        let returnTokenBal = await this.testtoken2.balanceOf(this.owner.address);
        let returnTokenBal2 = await this.testtoken2.balanceOf(this.genesis_steward1.address);
        let returnTokenBal3 = await this.testtoken2.balanceOf(this.funding_proposer1_whitelist.address);
        let returnTokenBal4 = await this.testtoken2.balanceOf(this.investor1.address);

        console.log(`
            vesting info ...
            vest name ${createdVestingInfo.vestInfo.name}
            vest description ${createdVestingInfo.vestInfo.description}
            nft address ${createdVestingInfo.nftInfo.nftToken}
            tokenId ${createdVestingInfo.nftInfo.tokenId}
            proposalId: ${createdVestingInfo.proposalId},
            owner: ${createdVestingInfo.vestInfo.owner},
            recipient: ${createdVestingInfo.vestInfo.recipient},
            token: ${createdVestingInfo.vestInfotoken},
            start: ${createdVestingInfo.timeInfo.start},
            cliffDuration: ${createdVestingInfo.timeInfo.cliffDuration}
            stepDuration: ${createdVestingInfo.timeInfo.stepDuration}
            steps: ${createdVestingInfo.stepInfo.steps}
            cliffShares: ${hre.ethers.utils.formatEther(createdVestingInfo.stepInfo.cliffShares)}
            stepShares: ${hre.ethers.utils.formatEther(createdVestingInfo.stepInfo.stepShares)}
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

        let vestBal1 = await flexVestingContract.vestBalance(1)
        let vestBal2 = await flexVestingContract.vestBalance(2)
        let vestBal3 = await flexVestingContract.vestBalance(3)
        let vestBal4 = await flexVestingContract.vestBalance(4)

        if (vestBal1 > 0) await flexVestingContract.withdraw(dao.address, 1);
        if (vestBal2 > 0) await flexVestingContract.connect(this.genesis_steward1).withdraw(dao.address, 2);
        if (vestBal3 > 0) await flexVestingContract.connect(this.funding_proposer1_whitelist).withdraw(dao.address, 3);
        if (vestBal4 > 0) await flexVestingContract.connect(this.investor1).withdraw(dao.address, 4);

        createdVestingInfo = await flexVestingContract.vests(1);
        createdVestingInfo2 = await flexVestingContract.vests(2);
        createdVestingInfo3 = await flexVestingContract.vests(3);
        createdVestingInfo4 = await flexVestingContract.vests(4);

        returnTokenBal = await this.testtoken2.balanceOf(this.owner.address);
        returnTokenBal2 = await this.testtoken2.balanceOf(this.genesis_steward1.address);
        returnTokenBal3 = await this.testtoken2.balanceOf(this.funding_proposer1_whitelist.address);
        returnTokenBal4 = await this.testtoken2.balanceOf(this.investor1.address);

        const nextVestId = await flexVestingContract.vestIds()
        console.log(`
            claimed...
            claimed: ${hre.ethers.utils.formatEther(createdVestingInfo.claimed)}
            claimed2: ${hre.ethers.utils.formatEther(createdVestingInfo2.claimed)}
            claimed3: ${hre.ethers.utils.formatEther(createdVestingInfo3.claimed)}
            claimed4: ${hre.ethers.utils.formatEther(createdVestingInfo4.claimed)}

            return token balance ${hre.ethers.utils.formatEther(returnTokenBal)}
            returnTokenBal2 ${hre.ethers.utils.formatEther(returnTokenBal2)}
            returnTokenBal3 ${hre.ethers.utils.formatEther(returnTokenBal3)}
            returnTokenBal4 ${hre.ethers.utils.formatEther(returnTokenBal4)}

            next Vest Id ${nextVestId}
            `);


        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(vestingEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(vestingEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        vestBal1 = await flexVestingContract.vestBalance(1)
        vestBal2 = await flexVestingContract.vestBalance(2)
        vestBal3 = await flexVestingContract.vestBalance(3)
        vestBal4 = await flexVestingContract.vestBalance(4)

        if (vestBal1 > 0) await flexVestingContract.withdraw(dao.address, 1);
        if (vestBal2 > 0) await flexVestingContract.connect(this.genesis_steward1).withdraw(dao.address, 2);
        if (vestBal3 > 0) await flexVestingContract.connect(this.funding_proposer1_whitelist).withdraw(dao.address, 3);
        if (vestBal4 > 0) await flexVestingContract.connect(this.investor1).withdraw(dao.address, 4);


        createdVestingInfo = await flexVestingContract.vests(1);
        createdVestingInfo2 = await flexVestingContract.vests(2);
        createdVestingInfo3 = await flexVestingContract.vests(3);
        createdVestingInfo3 = await flexVestingContract.vests(4);

        returnTokenBal = await this.testtoken2.balanceOf(this.owner.address);
        returnTokenBal2 = await this.testtoken2.balanceOf(this.genesis_steward1.address);
        returnTokenBal3 = await this.testtoken2.balanceOf(this.funding_proposer1_whitelist.address);
        returnTokenBal4 = await this.testtoken2.balanceOf(this.investor1.address);

        console.log(`
            claimed...
            claimed: ${createdVestingInfo.claimed}
            total1: ${createdVestingInfo.total}

            claimed2: ${createdVestingInfo2.claimed}
            total2: ${createdVestingInfo2.total}

            claimed3: ${hre.ethers.utils.formatEther(createdVestingInfo3.claimed)}
            total3: ${hre.ethers.utils.formatEther(createdVestingInfo3.total)}

            claimed4: ${hre.ethers.utils.formatEther(createdVestingInfo4.claimed)}
            total4: ${hre.ethers.utils.formatEther(createdVestingInfo4.total)}

            return token balance ${hre.ethers.utils.formatEther(returnTokenBal)}
            returnTokenBal2 ${hre.ethers.utils.formatEther(returnTokenBal2)}
            returnTokenBal3 ${hre.ethers.utils.formatEther(returnTokenBal3)}
            returnTokenBal4 ${hre.ethers.utils.formatEther(returnTokenBal4)}
            `);
    });
});