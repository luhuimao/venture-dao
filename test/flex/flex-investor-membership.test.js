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
    deserialize
} from "v8";
const hre = require("hardhat");

describe("investor membership...", () => {
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
        this.flexGovernorVotingAssetAllocationProposalAdapterContract = adapters.flexGovernorVotingAssetAllocationProposalAdapterContract.instance;
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
                id: '0xa34105560351082ce6b5540bff167edddf0aae5c59e0db3cd4ab748b5ae9b1c9',//flexGovernorVotingAssetAllocationProposalAdapterContract
                addr: this.flexGovernorVotingAssetAllocationProposalAdapterContract.address,
                flags: 16777226
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

        const flexDaoManagementfee = hre.ethers.utils.parseEther("0.001"); // 0.2%
        const returnTokenManagementFee = hre.ethers.utils.parseEther("0.0024");
        const flexDaoGenesisStewards = [
            this.genesis_steward1.address,
            this.genesis_steward2.address
        ];
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
        this.flexDirectdaoAddress = daoAddr;
        this.daoContract = daoContract;
        console.log(`
        new dao address ${daoAddr}
        new dao name ${toUtf8(daoName)}
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

    it("erc20...", async () => {
        let investorMemberhsipWhitelistdata =
            await this.flexFundingPoolAdapterContract.getParticipanWhitelist(
                this.flexDirectdaoAddress
            );
        let investorMembershipDatavarifyType = await this.daoContract
            .getConfiguration(sha3("FLEX_INVESTOR_MEMBERSHIP_TYPE"));
        let investorMembershipDataminHolding = await this.daoContract
            .getConfiguration(sha3("FLEX_INVESTOR_MEMBERSHIP_MIN_HOLDING"));
        let investorMembershipDatatokenId = await this.daoContract
            .getConfiguration(sha3("FLEX_INVESTOR_MEMBERSHIP_TOKENID"));
        let investorMembershipDatatokenAddress = await this.daoContract
            .getAddressConfiguration(sha3("FLEX_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS"));

        console.log(`
            varifyType  ${investorMembershipDatavarifyType}
            minHolding  ${investorMembershipDataminHolding}
            tokenAddress  ${investorMembershipDatatokenAddress}
            tokenId  ${investorMembershipDatatokenId}     
            investorMemberhsipWhitelistdata ${investorMemberhsipWhitelistdata}
           `);

        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const flexVestingContract = this.flexVesting;
        const fundingpoolextensionAddr = await this.daoContract.getExtensionAddress(sha3("flex-funding-pool-ext"));
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
            submitProposal(this.flexDirectdaoAddress, fundingParams);
        const result = await tx.wait();
        const proposalId = result.events[2].args.proposalId;
        let flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(this.flexDirectdaoAddress, proposalId);
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
            this.flexDirectdaoAddress,
            proposalId,
            this.testtoken2.address,
            returnTokenAmount
        );


        await USDT.transfer(this.investor1.address, hre.ethers.utils.parseEther("100"));
        await USDT.transfer(this.investor2.address, hre.ethers.utils.parseEther("10"));

        await USDT.approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.investor1).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.investor2).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));

        await expectRevert(flexFundingPoolAdapt.deposit(this.flexDirectdaoAddress, proposalId, hre.ethers.utils.parseEther("0.1")), "revert");
        await flexFundingPoolAdapt.deposit(this.flexDirectdaoAddress, proposalId, hre.ethers.utils.parseEther("160"));
        await flexFundingPoolAdapt.connect(this.investor1).deposit(this.flexDirectdaoAddress, proposalId, hre.ethers.utils.parseEther("15"));
        await expectRevert(flexFundingPoolAdapt.connect(this.investor2).deposit(this.flexDirectdaoAddress, proposalId, hre.ethers.utils.parseEther("2")), "revert");

        const investors = await flexFundingPoolExtContract.getInvestorsByProposalId(proposalId);
        console.log("investors: ", investors);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(fundRaiseEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await flexFundingAdapterContract.processProposal(this.flexDirectdaoAddress, proposalId);
    });

    it("erc721...", async () => {
        const enable = true;
        const name = "invester-membership-erc721-name";
        const varifyType = 1;//erc721
        const minAmount = 4;
        const erc721tokenAddress = this.testERC721.address;
        const tokenId = 0;
        const whiteList = [];
        const params = [
            this.flexDirectdaoAddress,
            enable,
            name,
            varifyType,
            minAmount,
            erc721tokenAddress,
            tokenId,
            whiteList
        ];

        const tx = await this.flexDaoSetInvestorMembershipAdapterContract
            .submitInvestorMembershipProposal(
                params
            );

        const result = await tx.wait();
        let proposalId = result.events[result.events.length - 1].args.proposalId;

        await this.flexVotingContract.submitVote(
            this.flexDirectdaoAddress,
            proposalId,
            1
        );
        await this.flexVotingContract.connect(this.genesis_steward1).submitVote(
            this.flexDirectdaoAddress,
            proposalId,
            1
        );
        await this.flexVotingContract.connect(this.genesis_steward2).submitVote(
            this.flexDirectdaoAddress,
            proposalId,
            1
        );

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        let proposal = await this.flexDaoSetInvestorMembershipAdapterContract.
            investorMembershipProposals(
                this.flexDirectdaoAddress,
                proposalId
            );
        if (parseInt(proposal.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposal.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.flexDaoSetInvestorMembershipAdapterContract.
            processInvestorMembershipProposal(
                this.flexDirectdaoAddress,
                proposalId
            );

        let investorMembershipDatavarifyType = await this.daoContract
            .getConfiguration(sha3("FLEX_INVESTOR_MEMBERSHIP_TYPE"));
        let investorMembershipDataminHolding = await this.daoContract
            .getConfiguration(sha3("FLEX_INVESTOR_MEMBERSHIP_MIN_HOLDING"));
        let investorMembershipDatatokenId = await this.daoContract
            .getConfiguration(sha3("FLEX_INVESTOR_MEMBERSHIP_TOKENID"));
        let investorMembershipDatatokenAddress = await this.daoContract
            .getAddressConfiguration(sha3("FLEX_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS"));
        let investorMemberhsipWhitelistdata =
            await this.flexFundingPoolAdapterContract.getParticipanWhitelist(
                this.flexDirectdaoAddress
            );

        console.log(`
            varifyType  ${investorMembershipDatavarifyType}
            minHolding  ${investorMembershipDataminHolding}
            tokenAddress  ${investorMembershipDatatokenAddress}
            tokenId  ${investorMembershipDatatokenId}     
            investorMemberhsipWhitelistdata ${investorMemberhsipWhitelistdata}
           `);


        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const flexVestingContract = this.flexVesting;
        const fundingpoolextensionAddr = await this.daoContract.getExtensionAddress(sha3("flex-funding-pool-ext"));
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

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

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
        const tx1 = await flexFundingAdapterContract.connect(this.funding_proposer1_whitelist).
            submitProposal(this.flexDirectdaoAddress, fundingParams);
        const result1 = await tx1.wait();
        proposalId = result1.events[2].args.proposalId;
        let flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(this.flexDirectdaoAddress, proposalId);
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
            this.flexDirectdaoAddress,
            proposalId,
            this.testtoken2.address,
            returnTokenAmount
        );
        await this.testERC721.mintPixel(this.owner.address, 0, 0);
        await this.testERC721.mintPixel(this.owner.address, 0, 1);
        await this.testERC721.mintPixel(this.owner.address, 0, 2);
        await this.testERC721.mintPixel(this.owner.address, 0, 3);

        await this.testERC721.mintPixel(this.investor1.address, 1, 0);
        await this.testERC721.mintPixel(this.investor1.address, 1, 1);
        await this.testERC721.mintPixel(this.investor1.address, 1, 2);
        await this.testERC721.mintPixel(this.investor1.address, 1, 3);


        await USDT.transfer(this.investor1.address, hre.ethers.utils.parseEther("100"));
        await USDT.transfer(this.investor2.address, hre.ethers.utils.parseEther("10"));

        await USDT.approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.investor1).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.investor2).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));

        await expectRevert(flexFundingPoolAdapt.deposit(this.flexDirectdaoAddress, proposalId, hre.ethers.utils.parseEther("0.1")), "revert");
        await flexFundingPoolAdapt.deposit(this.flexDirectdaoAddress, proposalId, hre.ethers.utils.parseEther("160"));
        await flexFundingPoolAdapt.connect(this.investor1).deposit(this.flexDirectdaoAddress, proposalId, hre.ethers.utils.parseEther("15"));
        await expectRevert(flexFundingPoolAdapt.connect(this.investor2).deposit(this.flexDirectdaoAddress, proposalId, hre.ethers.utils.parseEther("2")), "revert");

        const investors = await flexFundingPoolExtContract.getInvestorsByProposalId(proposalId);
        console.log("investors: ", investors);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(fundRaiseEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await flexFundingAdapterContract.processProposal(this.flexDirectdaoAddress, proposalId);

    });

    it("erc1155...", async () => {
        const enable = true;
        const name = "invester-membeership-erc1155-name";
        const varifyType = 2;//erc1155
        const minAmount = 4;
        const erc1155tokenAddress = this.testERC1155.address;
        const tokenId = 1;
        const whiteList = [];
        const params = [
            this.flexDirectdaoAddress,
            enable,
            name,
            varifyType,
            minAmount,
            erc1155tokenAddress,
            tokenId,
            whiteList
        ];

        const tx = await this.flexDaoSetInvestorMembershipAdapterContract
            .submitInvestorMembershipProposal(
                params
            );

        const result = await tx.wait();
        let proposalId = result.events[result.events.length - 1].args.proposalId;

        await this.flexVotingContract.submitVote(
            this.flexDirectdaoAddress,
            proposalId,
            1
        );
        await this.flexVotingContract.connect(this.genesis_steward1).submitVote(
            this.flexDirectdaoAddress,
            proposalId,
            1
        );
        await this.flexVotingContract.connect(this.genesis_steward2).submitVote(
            this.flexDirectdaoAddress,
            proposalId,
            1
        );

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        let proposal = await this.flexDaoSetInvestorMembershipAdapterContract.
            investorMembershipProposals(
                this.flexDirectdaoAddress,
                proposalId
            );
        if (parseInt(proposal.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposal.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.flexDaoSetInvestorMembershipAdapterContract.
            processInvestorMembershipProposal(
                this.flexDirectdaoAddress,
                proposalId
            );

        let investorMembershipDatavarifyType = await this.daoContract
            .getConfiguration(sha3("FLEX_INVESTOR_MEMBERSHIP_TYPE"));
        let investorMembershipDataminHolding = await this.daoContract
            .getConfiguration(sha3("FLEX_INVESTOR_MEMBERSHIP_MIN_HOLDING"));
        let investorMembershipDatatokenId = await this.daoContract
            .getConfiguration(sha3("FLEX_INVESTOR_MEMBERSHIP_TOKENID"));
        let investorMembershipDatatokenAddress = await this.daoContract
            .getAddressConfiguration(sha3("FLEX_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS"));
        let investorMemberhsipWhitelistdata =
            await this.flexFundingPoolAdapterContract.getParticipanWhitelist(
                this.flexDirectdaoAddress
            );

        console.log(`
            varifyType  ${investorMembershipDatavarifyType}
            minHolding  ${investorMembershipDataminHolding}
            tokenAddress  ${investorMembershipDatatokenAddress}
            tokenId  ${investorMembershipDatatokenId}     
            investorMemberhsipWhitelistdata ${investorMemberhsipWhitelistdata}
           `);


        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const flexVestingContract = this.flexVesting;
        const fundingpoolextensionAddr = await this.daoContract.getExtensionAddress(sha3("flex-funding-pool-ext"));
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

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

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
        const tx1 = await flexFundingAdapterContract.connect(this.funding_proposer1_whitelist).
            submitProposal(this.flexDirectdaoAddress, fundingParams);
        const result1 = await tx1.wait();
        proposalId = result1.events[2].args.proposalId;
        let flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(this.flexDirectdaoAddress, proposalId);
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
            this.flexDirectdaoAddress,
            proposalId,
            this.testtoken2.address,
            returnTokenAmount
        );

        await this.testERC1155.mint(this.owner.address, 1, 4, hexToBytes(toHex(2233)));
        await this.testERC1155.mint(this.investor1.address, 1, 4, hexToBytes(toHex(2233)));

        await USDT.transfer(this.investor1.address, hre.ethers.utils.parseEther("100"));
        await USDT.transfer(this.investor2.address, hre.ethers.utils.parseEther("10"));

        await USDT.approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.investor1).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.investor2).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));

        await expectRevert(flexFundingPoolAdapt.deposit(this.flexDirectdaoAddress, proposalId, hre.ethers.utils.parseEther("0.1")), "revert");
        await flexFundingPoolAdapt.deposit(this.flexDirectdaoAddress, proposalId, hre.ethers.utils.parseEther("160"));
        await flexFundingPoolAdapt.connect(this.investor1).deposit(this.flexDirectdaoAddress, proposalId, hre.ethers.utils.parseEther("15"));
        await expectRevert(flexFundingPoolAdapt.connect(this.investor2).deposit(this.flexDirectdaoAddress, proposalId, hre.ethers.utils.parseEther("2")), "revert");

        const investors = await flexFundingPoolExtContract.getInvestorsByProposalId(proposalId);
        console.log("investors: ", investors);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(fundRaiseEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await flexFundingAdapterContract.processProposal(this.flexDirectdaoAddress, proposalId);

    });

    it("whitelist...", async () => {
        const enable = true;
        const name = "invester-membership-whitelist-name";
        const varifyType = 3;//whitelist
        const minAmount = 0;
        const erc1155tokenAddress = ZERO_ADDRESS;
        const tokenId = 0;
        const whiteList = [
            this.user1.address,
            this.user2.address
        ];
        const params = [
            this.flexDirectdaoAddress,
            enable,
            name,
            varifyType,
            minAmount,
            erc1155tokenAddress,
            tokenId,
            whiteList
        ];

        const tx = await this.flexDaoSetInvestorMembershipAdapterContract
            .submitInvestorMembershipProposal(
                params
            );

        const result = await tx.wait();
        let proposalId = result.events[result.events.length - 1].args.proposalId;

        await this.flexVotingContract.submitVote(
            this.flexDirectdaoAddress,
            proposalId,
            1
        );
        await this.flexVotingContract.connect(this.genesis_steward1).submitVote(
            this.flexDirectdaoAddress,
            proposalId,
            1
        );
        await this.flexVotingContract.connect(this.genesis_steward2).submitVote(
            this.flexDirectdaoAddress,
            proposalId,
            1
        );

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        let proposal = await this.flexDaoSetInvestorMembershipAdapterContract.
            investorMembershipProposals(
                this.flexDirectdaoAddress,
                proposalId
            );
        if (parseInt(proposal.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposal.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.flexDaoSetInvestorMembershipAdapterContract.
            processInvestorMembershipProposal(
                this.flexDirectdaoAddress,
                proposalId
            );

        let investorMembershipDatavarifyType = await this.daoContract
            .getConfiguration(sha3("FLEX_INVESTOR_MEMBERSHIP_TYPE"));
        let investorMembershipDataminHolding = await this.daoContract
            .getConfiguration(sha3("FLEX_INVESTOR_MEMBERSHIP_MIN_HOLDING"));
        let investorMembershipDatatokenId = await this.daoContract
            .getConfiguration(sha3("FLEX_INVESTOR_MEMBERSHIP_TOKENID"));
        let investorMembershipDatatokenAddress = await this.daoContract
            .getAddressConfiguration(sha3("FLEX_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS"));
        let investorMemberhsipWhitelistdata =
            await this.flexFundingPoolAdapterContract.getParticipanWhitelist(
                this.flexDirectdaoAddress
            );

        console.log(`
            varifyType  ${investorMembershipDatavarifyType}
            minHolding  ${investorMembershipDataminHolding}
            tokenAddress  ${investorMembershipDatatokenAddress}
            tokenId  ${investorMembershipDatatokenId}     
            investorMemberhsipWhitelistdata ${investorMemberhsipWhitelistdata}
           `);

        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const flexVestingContract = this.flexVesting;
        const fundingpoolextensionAddr = await this.daoContract.getExtensionAddress(sha3("flex-funding-pool-ext"));
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

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

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
        const tx1 = await flexFundingAdapterContract.connect(this.funding_proposer1_whitelist).
            submitProposal(this.flexDirectdaoAddress, fundingParams);
        const result1 = await tx1.wait();
        proposalId = result1.events[2].args.proposalId;
        let flexFundingProposalInfo = await flexFundingAdapterContract.Proposals(this.flexDirectdaoAddress, proposalId);
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
            this.flexDirectdaoAddress,
            proposalId,
            this.testtoken2.address,
            returnTokenAmount
        );

        await USDT.transfer(this.user1.address, hre.ethers.utils.parseEther("100"));
        await USDT.transfer(this.user2.address, hre.ethers.utils.parseEther("10"));

        await USDT.approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.user1).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.user2).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));

        await expectRevert(flexFundingPoolAdapt.deposit(this.flexDirectdaoAddress, proposalId, hre.ethers.utils.parseEther("0.1")), "revert");
        await flexFundingPoolAdapt.connect(this.user1).deposit(this.flexDirectdaoAddress, proposalId, hre.ethers.utils.parseEther("15"));
        await flexFundingPoolAdapt.connect(this.user2).deposit(this.flexDirectdaoAddress, proposalId, hre.ethers.utils.parseEther("1"));
        await expectRevert(flexFundingPoolAdapt.connect(this.owner).deposit(this.flexDirectdaoAddress, proposalId, hre.ethers.utils.parseEther("2")), "revert");

        const investors = await flexFundingPoolExtContract.getInvestorsByProposalId(proposalId);
        console.log("investors: ", investors);

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(fundRaiseEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await flexFundingAdapterContract.processProposal(this.flexDirectdaoAddress, proposalId);
    });

});