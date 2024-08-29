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

describe("funding...", () => {
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
        const flexDaoFundriaseStyle = 0 // 0 - FCFS 1- Free ink0
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
        const flexVestingContract = this.flexVesting;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.flexDirectdaoAddress);
        const fundingpoolextensionAddr = await dao.getExtensionAddress(sha3("flex-funding-pool-ext"));
        const flexFundingPoolExtContract = (await hre.ethers.getContractFactory("FlexInvestmentPoolExtension")).attach(fundingpoolextensionAddr);

        let tokenAddress = this.testtoken1.address;
        let minFundingAmount = hre.ethers.utils.parseEther("100");
        let maxFundingAmount = hre.ethers.utils.parseEther("1000");
        let escrow = true;
        let returnTokenAddr = this.testtoken2.address;
        let returnTokenAmount = hre.ethers.utils.parseEther("100000");
        let price = hre.ethers.utils.parseEther("0.01");
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
        const nftToken = this.vestingERC721.address;
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

        let fundRaiseType = 0;
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
        await flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("160.243459"));
        await flexFundingPoolAdapt.connect(this.investor1).deposit(dao.address, proposalId, hre.ethers.utils.parseEther("15.843545"));

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

        const vestId = await flexVestingContract.getVestIdByTokenId(nftToken, 1)
        console.log("vestId ", vestId);
        let createdVestingInfo = await flexVestingContract.vests(1);
        let createdVestingInfo2 = await flexVestingContract.vests(2);

        console.log(" createdVestingInfo", createdVestingInfo2);

        const vestId1 = await flexVestingContract.tokenIdToVestId(this.vestingERC721.address, 1);
        const vestId2 = await flexVestingContract.tokenIdToVestId(this.vestingERC721.address, 2);
        const vestId3 = await flexVestingContract.tokenIdToVestId(this.vestingERC721.address, 3);
        const vestId4 = await flexVestingContract.tokenIdToVestId(this.vestingERC721.address, 4);

        const totalSupply = await this.vestingERC721.totalSupply();
        console.log(`
        tokenId  ${vestId1}
        vestId2  ${vestId2}
        vestId3  ${vestId3}
        vestId4  ${vestId4}

        totalSupply ${totalSupply}
        `);

        // const maxTotalSupply = await this.flexVestingERC721.maxTotalSupply();
        // console.log("maxTotalSupply ", maxTotalSupply);
        // const rel = await flexVestingContract.getRemainingPercentage(nftToken, 1);
        // console.log(rel);
        const uri = await this.vestingERC721.tokenURI(2);
        console.log(uri);
        const svg = await this.vestingERC721.getSvg(1);
        const svg2 = await this.vestingERC721.getSvg(2);

        // const svg = await this.flexVestingERC721Helper.getSvg(1, this.flexVesting.address);
        console.log(`
        svg 
        ${svg2}
        `
        );

        // let createdVestingInfo = await flexVestingContract.vests(1);
        createdVestingInfo2 = await flexVestingContract.vests(2);
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

        let vestBal1 = flexVestingContract.vestBalance(1)
        let vestBal2 = flexVestingContract.vestBalance(2)
        let vestBal3 = flexVestingContract.vestBalance(3)
        let vestBal4 = flexVestingContract.vestBalance(4)

        if (vestBal1 > 0) await flexVestingContract.withdraw(dao.address, 1);
        console.log("vest #1 withdraw...");

        if (vestBal2 > 0) await flexVestingContract.connect(this.genesis_steward1).withdraw(dao.address, 2);
        console.log("vest #2 withdraw...");

        if (vestBal3 > 0) await flexVestingContract.connect(this.funding_proposer1_whitelist).withdraw(dao.address, 3);
        console.log("vest #3 withdraw...");

        if (vestBal4 > 0) await flexVestingContract.connect(this.investor1).withdraw(dao.address, 4);
        console.log("vest #4 withdraw...");


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
            total: ${hre.ethers.utils.formatEther(createdVestingInfo.total)}

            claimed2: ${hre.ethers.utils.formatEther(createdVestingInfo2.claimed)}
            total2: ${hre.ethers.utils.formatEther(createdVestingInfo2.total)}

            claimed3: ${hre.ethers.utils.formatEther(createdVestingInfo3.claimed)}
            total3: ${hre.ethers.utils.formatEther(createdVestingInfo3.total)}

            claimed4: ${hre.ethers.utils.formatEther(createdVestingInfo4.claimed)}
            total4: ${hre.ethers.utils.formatEther(createdVestingInfo4.total)}


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

        // await flexVestingContract.withdraw(dao.address, 1);
        // console.log("vest #1 withdraw...");
        // await flexVestingContract.connect(this.genesis_steward1).withdraw(dao.address, 2);
        // console.log("vest #2 withdraw...");
        // await flexVestingContract.connect(this.funding_proposer1_whitelist).withdraw(dao.address, 3);
        // console.log("vest #3 withdraw...");
        // await flexVestingContract.connect(this.investor1).withdraw(dao.address, 4);
        // console.log("vest #4 withdraw...");


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