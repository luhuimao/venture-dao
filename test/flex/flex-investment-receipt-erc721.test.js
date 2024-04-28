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


describe("flex investment receipt NFT...", () => {
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
        this.flexVestingERC721 = utilContracts.flexVestingERC721.instance;
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

        const FlexInvestmentReceiptERC721Helper = await hre.ethers.getContractFactory("FlexInvestmentReceiptERC721Helper");
        const flexInvestmentReceiptERC721Helper = await FlexInvestmentReceiptERC721Helper.deploy();
        await flexInvestmentReceiptERC721Helper.deployed();
        this.flexInvestmentReceiptERC721Helper = flexInvestmentReceiptERC721Helper;

        const FlexInvestmentReceiptERC721 = await hre.ethers.getContractFactory("FlexInvestmentReceiptERC721");
        const flexInvestmentReceiptERC721 = await FlexInvestmentReceiptERC721.deploy(
            "DAOSquare Investment Receipt",
            "DIR",
            this.flexFundingAdapterContract.address,
            this.flexInvestmentReceiptERC721Helper.address
        );
        await flexInvestmentReceiptERC721.deployed();
        this.flexInvestmentReceiptERC721 = flexInvestmentReceiptERC721;


        this.summonDao = this.adapters.summonDao.instance;

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];
        _daoName = "my_flex_dao002";

        const creator = this.owner.address;
        const enalbeAdapters = [{
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
        // {
        //     id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//ManagingContract
        //     addr: this.managing.address,
        //     flags: 59
        // },
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
        {
            id: '0xe564b2da9fb62dadceed6d94ac5884ac5f464424e7be661d7d6181d49fa87b3f', //flexDaoSetAdapterContract
            addr: this.flexDaoSetAdapterContract.address,
            flags: 778242
        },
        {
            id: '0xff9379b98b93eb3bd1fac62fd2258a7955d70d2d5279c40064145b6c9646df37',
            addr: this.flexDaoSetHelperAdapterContract.address,
            flags: 8
        },
        {
            id: '0x5f0e8d109045653360289a7a02d5dc2a99e382006a42ef93f66de55ecff3176f',
            addr: this.flexDaoSetPollingAdapterContract.address,
            flags: 262146
        },
        {
            id: '0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7',
            addr: this.flexDaoSetVotingAdapterContract.address,
            flags: 65538
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
        const flexDaoFundriaseStyle = 0 // 0 - FCFS 1- Free ink0

        const flexDaoInfo = {
            name: _daoName, // string name;
            creator: this.owner.address, // address creator;
            flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
            returnTokenManagementFee: returnTokenManagementFee,
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            allocations: allocations,
            flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
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

    it("escrow funding...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.flexDirectdaoAddress);
        const fundingpoolextensionAddr = await dao.getExtensionAddress(sha3("flex-funding-pool-ext"));
        const flexFundingPoolExtContract = (await hre.ethers.getContractFactory("FlexInvestmentPoolExtension")).attach(fundingpoolextensionAddr);

        let tokenAddress = this.testtoken1.address;
        let minFundingAmount = hre.ethers.utils.parseEther("100");
        let maxFundingAmount = hre.ethers.utils.parseEther("10000000000000");
        let escrow = true;
        let returnTokenAddr = this.testtoken2.address;
        let price = hre.ethers.utils.parseEther("100000");
        let returnTokenAmount = hre.ethers.utils.parseEther("1000000000");
        // let returnTokenAmount = maxFundingAmount.div(price);
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

        let block_timestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let vestingStartTime = block_timestamp + 100000;
        let vestingCliffEndTime = vestingStartTime + 60 * 60 * 1;
        let vestingEndTime = vestingCliffEndTime + 60 * 60 * 2 + 60;
        let vestingInterval = 60 * 60 * 1;
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%

        const vestNFTEnable = true;
        const nftToken = this.flexVestingERC721.address;
        const vestName = "";
        const vestDescription = "NNN DDD iII";

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
        let fundRaiseStartTime = block_timestamp;
        let fundRaiseEndTime = fundRaiseStartTime + 100000;
        let minDepositAmount = hre.ethers.utils.parseEther("1");
        let maxDepositAmount = hre.ethers.utils.parseEther("2000000000000");
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

        block_timestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(fundRaiseStartTimes) > block_timestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseStartTimes) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        console.log('token1 total supply ', hre.ethers.utils.formatEther(await USDT.balanceOf(this.owner.address)));
        console.log('token2 total supply ', hre.ethers.utils.formatEther(await this.testtoken2.balanceOf(this.owner.address)));


        await this.testtoken2.transfer(this.user1.address, returnTokenAmount)
        await this.testtoken2.connect(this.user1).approve(this.flexFundingReturnTokenAdapterContract.address,
            returnTokenAmount);

        await this.flexFundingReturnTokenAdapterContract.connect(this.user1).setFundingApprove(
            dao.address,
            proposalId,
            this.testtoken2.address,
            returnTokenAmount);



        await USDT.transfer(this.investor1.address, hre.ethers.utils.parseEther("100000"));
        await USDT.approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("10000000000000"));
        await USDT.connect(this.investor1).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("10000000000000"));

        await expectRevert(flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("0.1")), "revert");
        await flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("1990000000000"));
        await flexFundingPoolAdapt.connect(this.investor1).deposit(dao.address, proposalId, hre.ethers.utils.parseEther("240.2324"));

        const investors = await flexFundingPoolExtContract.getInvestorsByProposalId(proposalId);
        console.log("investors: ", investors);
        let depositeBal = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.owner.address);
        console.log(`
            deposit balance   ${hre.ethers.utils.formatEther(depositeBal.toString())}
            whitdraw...
            `);
        // await flexFundingPoolAdapt.withdraw(dao.address, proposalId, hre.ethers.utils.parseEther("10"));
        depositeBal = await flexFundingPoolAdapt.balanceOf(dao.address, proposalId, this.owner.address);
        console.log(`
            deposit balance   ${hre.ethers.utils.formatEther(depositeBal.toString())}
            process proposal...
            `);

        block_timestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(fundRaiseEndTime) > block_timestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        const tx1 = await flexFundingAdapterContract.processProposal(dao.address, proposalId);
        // console.log("tx ", tx1);
        flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(dao.address, proposalId);
        console.log(`
        processed...
        state ${flexFundingProposalInfo.state}`
        );

        const projectName = "ABI Finance";
        const description = "Camelot is an ecosystem-focused and community-driven DEX built on Arbitrum. It has been built as a highly efficient and customizable protocol, allowing both builders and users to leverage our custom infrastructure for deep, sustainable, and adaptable liquidity. Camelot moves beyond the traditional design of DEXs to focus on offering a tailored approach that prioritises composability";
        await this.flexInvestmentReceiptERC721.
            safeMint(
                dao.address,
                proposalId,
                tx1.hash,
                projectName,
                description
            );


        await this.flexInvestmentReceiptERC721.connect(this.investor1).
            safeMint(
                dao.address,
                proposalId,
                tx1.hash,
                projectName,
                description
            );
        const tokenId1 = await this.flexInvestmentReceiptERC721.investmentIdToTokenId(proposalId, this.owner.address);
        const tokenId2 = await this.flexInvestmentReceiptERC721.investmentIdToTokenId(proposalId, this.investor1.address);

        const tokenURI = await this.flexInvestmentReceiptERC721.tokenURI(1);
        const svg = await this.flexInvestmentReceiptERC721Helper.getSvg(1, this.flexInvestmentReceiptERC721.address);
        // const svg2 = await this.flexInvestmentReceiptERC721Helper.getSvg(2, this.flexInvestmentReceiptERC721.address);
        console.log(tokenId1);
        console.log(tokenId2);
        // console.log(tokenURI);
        console.log(svg);

    });

})