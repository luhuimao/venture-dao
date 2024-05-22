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
    deserialize
} from "v8";
import { describe } from "node:test";
const hre = require("hardhat");

describe("dao set proposal...", () => {
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
        // this.flexDaoSetAdapterContract = adapters.flexDaoSetAdapterContract.instance;
        this.flexDaoSetHelperAdapterContract = adapters.flexDaoSetHelperAdapterContract.instance;
        this.flexDaoSetPollingAdapterContract = adapters.flexDaoSetPollingAdapterContract.instance;
        this.flexDaoSetVotingAdapterContract = adapters.flexDaoSetVotingAdapterContract.instance;
        this.flexDaoSetFeesAdapterContract = adapters.flexDaoSetFeesAdapterContract.instance;
        this.flexDaoSetGovernorMembershipAdapterContract = adapters.flexDaoSetGovernorMembershipAdapterContract.instance;
        this.flexDaoSetInvestorCapAdapterContract = adapters.flexDaoSetInvestorCapAdapterContract.instance;
        this.flexDaoSetInvestorMembershipAdapterContract = adapters.flexDaoSetInvestorMembershipAdapterContract.instance;
        this.flexDaoSetProposerMembershipAdapterContract = adapters.flexDaoSetProposerMembershipAdapterContract.instance;

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
            2 //uint256 maxParticipantsAmount;
        ]

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMemberships = [
            0, // uint8 varifyType;
            "flexDaoParticipantsMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            "flexDaoStewardMembershipName",
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
            "flexDaoPollsterMembershipName",
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
        const flexDaoGenesisStewards = [];
        const allocations = [10, 20, 30];

        const fundingPollEnable = false; //DIRECT mode
        const flexDaoFundriaseStyle = 1 // 0 - FCFS 1- Free ink0

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

        let proposalmembershipEnable = await daoContract.getConfiguration("0x2073e6ba5c75026b006fdd165596d94b89cada2e00d8e44a99d422de8ea467e0");

        console.log(`
            new dao address ${daoAddr}
            new dao name ${toUtf8(daoName)}
            pollingToken ${pollingToken}
            flexPollingVoteWeight ${flexPollingVoteWeight}
            proposalmembershipEnable ${proposalmembershipEnable}
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

    it("submit participant cap dao set proposal...", async () => {
        const enableParticipantCap = false;
        const cap = 0;
        const tx = await this.flexDaoSetInvestorCapAdapterContract
            .submitInvestorCapProposal(
                this.flexDirectdaoAddress,
                enableParticipantCap,
                cap);

        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposal = await this.flexDaoSetInvestorCapAdapterContract.
            investorCapProposals(
                this.flexDirectdaoAddress,
                proposalId
            );

        let currentParticipantCap = await this.daoContract
            .getConfiguration("0xaf0b46df030af159303b75690e740674df8434270d3b7248b0280f3d63a2dd8b");
        let currentParticipantEnable = await this.daoContract
            .getConfiguration("0x0a71373d28d4b40b0bb46f8d58468f2e51292d10cf26715a0e3d8624b60c8a42");
        console.log(`
        created...
        proposalId ${proposalId}
        proposalCap ${proposal.cap}
        state ${proposal.state}
        currentParticipantEnable ${currentParticipantEnable}
        currentParticipantCap ${currentParticipantCap}
        voting...
       `);

        let enable = true;
        let name = "daoset-governor-membership-new-name";
        let varifyType = 1;
        let minAmount = 4;
        let tokenAddress = this.testtoken1.address;
        let tokenId = 0;
        let whiteList = [this.user1.address, this.user2.address];
        let params = [
            this.flexDirectdaoAddress,
            enable,
            name,
            varifyType,
            minAmount,
            tokenAddress,
            tokenId,
            whiteList
        ];
        await expectRevert(this.flexDaoSetGovernorMembershipAdapterContract
            .submitGovernorMembershipProposal(
                params
            ), "revert");

        enable = true;
        name = "daoset-investor-membership-name";
        varifyType = 1;
        minAmount = 4;
        tokenAddress = this.testtoken1.address;
        tokenId = 2;
        whiteList = [this.user1.address, this.user2.address];
        params = [
            this.flexDirectdaoAddress,
            enable,
            name,
            varifyType,
            minAmount,
            tokenAddress,
            tokenId,
            whiteList
        ];

        await expectRevert(this.flexDaoSetInvestorMembershipAdapterContract
            .submitInvestorMembershipProposal(
                params
            ),
            "revert");

        let eligibilityType = 0;
        tokenAddress = this.testtoken1.address;
        tokenId = 0;
        let votingWeightedType = 0;
        let supportType = 0;
        let quorumType = 0
        let support = 21;
        let quorum = 2;
        let votingPeriod = 60 * 10;
        let executingPeriod = 60 * 0;
        let governors = [
            // this.owner.address,
            // this.genesis_steward1.address,
            // this.genesis_steward2.address
        ];
        const allocations = [
            // 500, 200, 300
        ];
        params = [
            this.flexDirectdaoAddress,
            eligibilityType,
            tokenAddress,
            tokenId,
            votingWeightedType,
            supportType,
            quorumType,
            support,
            quorum,
            votingPeriod,
            executingPeriod,
            governors,
            allocations,
        ];
        await expectRevert(this.flexDaoSetVotingAdapterContract
            .submitVotingProposal(
                params
            ),
            "revert");

        let managementFeeAmount = hre.ethers.utils.parseEther("0.002");
        let returnTokenManagementFeeAmount = hre.ethers.utils.parseEther("0.003");
        let managementAddress = this.user2.address;
        await expectRevert(this.flexDaoSetFeesAdapterContract
            .submitFeesProposal(
                this.flexDirectdaoAddress,
                managementFeeAmount,
                returnTokenManagementFeeAmount,
                managementAddress
            ),
            "revert");


        await expectRevert(this.flexDaoSetInvestorCapAdapterContract
            .submitInvestorCapProposal(
                this.flexDirectdaoAddress,
                enableParticipantCap,
                cap),
            "revert");

        let proposerMembershipEnable = false;
        name = "daoset-proposer-membership-name";
        varifyType = 3; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
        let minHolding = 12;
        tokenAddress = this.testtoken2.address;
        tokenId = 2;
        whiteList = [
            this.investor1.address,
            this.investor2.address
        ];

        params = [
            this.flexDirectdaoAddress,
            proposerMembershipEnable,
            name,
            varifyType,
            minHolding,
            tokenAddress,
            tokenId,
            whiteList
        ];

        await expectRevert(this.flexDaoSetProposerMembershipAdapterContract
            .submitProposerMembershipProposal(
                params
            ),
            "revert");


        let pollEnable = true;
        name = "daoset-pollvoter-memberhsip-name";
        varifyType = 3; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
        minHolding = 12;
        tokenAddress = this.testtoken2.address;
        tokenId = 2;
        whiteList = [
            this.investor1.address,
            this.investor2.address
        ];

        let pollingvotingPeriod = 60 * 8;
        let pollingvotingPower = 2;
        let pollingsuperMajority = 12;
        let pollingquorum = 22;
        let pollingeligibilityType = 2; //0. erc20 1.erc721 2.erc1155 3.allocation
        let pollingtokenAddress = this.testtoken2.address;
        let pollingtokenID = 44;
        let pollingsupportType = 1; // 0. YES - NO > X
        let pollingquorumType = 0; // 0. YES + NO > X 

        params = [
            this.flexDirectdaoAddress,
            pollEnable,
            [
                name,
                varifyType,
                minHolding,
                tokenAddress,
                tokenId,
                whiteList
            ],
            [
                pollingvotingPeriod,
                pollingvotingPower,
                pollingsuperMajority,
                pollingquorum,
                pollingeligibilityType,
                pollingtokenAddress,
                pollingtokenID,
                pollingsupportType,
                pollingquorumType
            ]
        ];
        await expectRevert(this.flexDaoSetPollingAdapterContract
            .submitPollForInvestmentProposal(
                params
            ), "revert");


        await this.flexVotingContract.submitVote(
            this.flexDirectdaoAddress,
            proposalId,
            1);

        console.log(`
        voted...
        execute...
        `);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(proposal.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposal.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.flexDaoSetInvestorCapAdapterContract.
            processInvestorCapProposal(
                this.flexDirectdaoAddress,
                proposalId
            );

        proposal = await this.flexDaoSetInvestorCapAdapterContract.
            investorCapProposals(
                this.flexDirectdaoAddress,
                proposalId
            );
        currentParticipantEnable = await this.daoContract
            .getConfiguration("0x0a71373d28d4b40b0bb46f8d58468f2e51292d10cf26715a0e3d8624b60c8a42");
        currentParticipantCap = await this.daoContract
            .getConfiguration("0xaf0b46df030af159303b75690e740674df8434270d3b7248b0280f3d63a2dd8b");

        expect(cap == currentParticipantCap, true);
        console.log(`
        executed...
        state ${proposal.state}
        currentParticipantEnable ${currentParticipantEnable}
        currentParticipantCap ${currentParticipantCap}
        `);
    });

    it("submit governor membership dao set proposal...", async () => {
        const enable = true;
        const name = "daoset-governor-membership-new-name";
        const varifyType = 1;
        const minAmount = 4;
        const tokenAddress = this.testtoken1.address;
        const tokenId = 0;
        const whiteList = [this.user1.address, this.user2.address];
        const params = [
            this.flexDirectdaoAddress,
            enable,
            name,
            varifyType,
            minAmount,
            tokenAddress,
            tokenId,
            whiteList
        ];
        const tx = await this.flexDaoSetGovernorMembershipAdapterContract
            .submitGovernorMembershipProposal(
                params
            );

        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposal = await this.flexDaoSetGovernorMembershipAdapterContract.
            governorMembershipProposals(
                this.flexDirectdaoAddress,
                proposalId
            );

        let currentName = await this.daoContract
            .getStringConfiguration("0xe6fc898f462d48724eb27b66193f38e8f83f214469eb3145fe9431a89411e724");
        let currentvarifyType = await this.daoContract
            .getConfiguration("0x84580f9d926113d2c801e908a914b652340b3d8527c171bcea8d1868e92a507c");
        let currentEnable = await this.daoContract
            .getConfiguration("0x71ecc01da16acc23ab0eca549b0aaa7659ae183a220304fe5072243bc984fd79");
        let currentminAmount = await this.daoContract
            .getConfiguration("0x50c40dbbb38d5b02b04e0c6d7be02f4391fc8c14a98860284871ef1834c8390b");
        let currenttokenAddress = await this.daoContract
            .getConfiguration("0x0bfac56541ded449415df8f96f54b002e55665d7fd2fafc884184e8c17f3c772");
        let currenttokenId = await this.daoContract
            .getConfiguration("0x93cc40268a57b3f7e5eb22a016a12d19010736289cceac5742a116fea3491b35");
        let currentGovernorWhitelist = await this.flexStewardMangement
            .getGovernorWhitelist(this.flexDirectdaoAddress);
        console.log(`
        created...
        proposalId ${proposalId}
        enable ${proposal.enable}
        minAmount ${proposal.minAmount}
        tokenAddress  ${proposal.tokenAddress}
        tokenId ${proposal.tokenId}
        varifyType  ${proposal.varifyType}
        state ${proposal.state}
        currentEnable ${currentEnable}
        currentName ${currentName}
        currentvarifyType ${currentvarifyType}
        currentminAmount ${currentminAmount}
        currenttokenAddress ${currenttokenAddress}
        currenttokenId ${currenttokenId}
        currentGovernorWhitelist ${currentGovernorWhitelist}
        voting...
       `);

        await expectRevert(this.flexDaoSetGovernorMembershipAdapterContract
            .submitGovernorMembershipProposal(
                params
            ),
            "revert");

        await this.flexVotingContract.submitVote(
            this.flexDirectdaoAddress,
            proposalId,
            1);

        console.log(`
        voted...
        execute...
        `);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(proposal.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposal.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.flexDaoSetGovernorMembershipAdapterContract.
            processGovernorMembershipProposal(
                this.flexDirectdaoAddress,
                proposalId
            );

        proposal = await this.flexDaoSetGovernorMembershipAdapterContract.
            governorMembershipProposals(
                this.flexDirectdaoAddress,
                proposalId
            );
        currentName = await this.daoContract
            .getStringConfiguration("0xe6fc898f462d48724eb27b66193f38e8f83f214469eb3145fe9431a89411e724");
        currentvarifyType = await this.daoContract
            .getConfiguration("0x84580f9d926113d2c801e908a914b652340b3d8527c171bcea8d1868e92a507c");
        currentEnable = await this.daoContract
            .getConfiguration("0x71ecc01da16acc23ab0eca549b0aaa7659ae183a220304fe5072243bc984fd79");
        currentminAmount = await this.daoContract
            .getConfiguration("0x50c40dbbb38d5b02b04e0c6d7be02f4391fc8c14a98860284871ef1834c8390b");
        currenttokenAddress = await this.daoContract
            .getAddressConfiguration("0x0bfac56541ded449415df8f96f54b002e55665d7fd2fafc884184e8c17f3c772");
        currenttokenId = await this.daoContract
            .getConfiguration("0x93cc40268a57b3f7e5eb22a016a12d19010736289cceac5742a116fea3491b35");
        currentGovernorWhitelist = await this.flexStewardMangement
            .getGovernorWhitelist(this.flexDirectdaoAddress);
        expect(varifyType == currentvarifyType, true);
        expect(minAmount == currentminAmount, true);
        expect(tokenAddress == currenttokenAddress, true);
        expect(tokenId == currenttokenId, true);

        console.log(`
        executed...
        state ${proposal.state}
        currentvarifyType ${currentvarifyType}
        currentEnable ${currentEnable}
        currentName ${currentName}
        currentminAmount ${currentminAmount}
        currenttokenAddress ${currenttokenAddress}
        currenttokenId ${currenttokenId}
        currentGovernorWhitelist ${currentGovernorWhitelist}
        `);
    });

    it("submit investor membership dao set proposal...", async () => {
        const enable = true;
        const name = "daoset-investor-membership-name";
        const varifyType = 1;
        const minAmount = 4;
        const tokenAddress = this.testtoken1.address;
        const tokenId = 2;
        const whiteList = [this.user1.address, this.user2.address];
        const params = [
            this.flexDirectdaoAddress,
            enable,
            name,
            varifyType,
            minAmount,
            tokenAddress,
            tokenId,
            whiteList
        ];

        const tx = await this.flexDaoSetInvestorMembershipAdapterContract
            .submitInvestorMembershipProposal(
                params
            );

        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposal = await this.flexDaoSetInvestorMembershipAdapterContract.
            investorMembershipProposals(
                this.flexDirectdaoAddress,
                proposalId
            );
        let currentvarifyType = await this.daoContract
            .getConfiguration("0x80140cd7e0b1d935bee578a67a41547c82987de8e7d6b3827d411b738110258b");
        let currentEnable = await this.daoContract
            .getConfiguration("0x96b394ec661f77cbb65c26efb1a3308a7405b2ad904ca7bd203e7a1c35737249");
        let currentName = await this.daoContract
            .getStringConfiguration("0xfd9a8d4692ffc545577ff1979a0a918c2b536b6b6a891cf324a93b2c43907f83");

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
        created...
        proposalId ${proposalId}
        enable ${proposal.enable}
        minAmount ${proposal.minAmount}
        tokenAddress  ${proposal.tokenAddress}
        tokenId ${proposal.tokenId}
        varifyType  ${proposal.varifyType}
        state ${proposal.state}
        currentEnable ${currentEnable}
        currentName ${currentName}
        currentvarifyType ${currentvarifyType}
        varifyType  ${investorMembershipDatavarifyType}
        minHolding  ${investorMembershipDataminHolding}
        tokenAddress  ${investorMembershipDatatokenAddress}
        tokenId  ${investorMembershipDatatokenId}     
        investorMemberhsipWhitelistdata ${investorMemberhsipWhitelistdata}
        voting...
       `);

        await expectRevert(this.flexDaoSetInvestorMembershipAdapterContract
            .submitInvestorMembershipProposal(
                params
            ),
            "revert");

        await this.flexVotingContract.submitVote(
            this.flexDirectdaoAddress,
            proposalId,
            1
        );

        console.log(`
        voted...
        execute...
        `);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(proposal.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposal.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.flexDaoSetInvestorMembershipAdapterContract.
            processInvestorMembershipProposal(
                this.flexDirectdaoAddress,
                proposalId
            );

        proposal = await this.flexDaoSetInvestorMembershipAdapterContract.
            investorMembershipProposals(
                this.flexDirectdaoAddress,
                proposalId
            );
        currentvarifyType = await this.daoContract
            .getConfiguration("0x84580f9d926113d2c801e908a914b652340b3d8527c171bcea8d1868e92a507c");
        currentEnable = await this.daoContract
            .getConfiguration("0x71ecc01da16acc23ab0eca549b0aaa7659ae183a220304fe5072243bc984fd79");

        // investorMembershipData = await this.flexFundingPoolAdapterContract
        //     .getInvestorMembershipInfo(
        //         this.flexDirectdaoAddress,
        //         name
        //     );
        investorMemberhsipWhitelistdata =
            await this.flexFundingPoolAdapterContract.getParticipanWhitelist(
                this.flexDirectdaoAddress
            );
        expect(varifyType == currentvarifyType, true);
        currentName = await this.daoContract
            .getStringConfiguration("0xfd9a8d4692ffc545577ff1979a0a918c2b536b6b6a891cf324a93b2c43907f83");
        investorMembershipDatavarifyType = await this.daoContract
            .getConfiguration(sha3("FLEX_INVESTOR_MEMBERSHIP_TYPE"));
        investorMembershipDataminHolding = await this.daoContract
            .getConfiguration(sha3("FLEX_INVESTOR_MEMBERSHIP_MIN_HOLDING"));
        investorMembershipDatatokenId = await this.daoContract
            .getConfiguration(sha3("FLEX_INVESTOR_MEMBERSHIP_TOKENID"));
        investorMembershipDatatokenAddress = await this.daoContract
            .getAddressConfiguration(sha3("FLEX_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS"));
        console.log(`
        executed...
        state ${proposal.state}
        currentvarifyType ${currentvarifyType}
        currentEnable ${currentEnable}
        currentName ${currentName}
        varifyType  ${investorMembershipDatavarifyType}
        minHolding  ${investorMembershipDataminHolding}
        tokenAddress  ${investorMembershipDatatokenAddress}
        tokenId  ${investorMembershipDatatokenId}
        investorMemberhsipWhitelistdata ${investorMemberhsipWhitelistdata}
        `);
    });

    it("submit voting dao set proposal...", async () => {
        const eligibilityType = 0;
        const tokenAddress = this.testtoken1.address;
        const tokenId = 0;
        const votingWeightedType = 0;
        const supportType = 0;
        const quorumType = 0
        const support = 21;
        const quorum = 2;
        const votingPeriod = 60 * 10;
        const executingPeriod = 60 * 0;
        const governors = [
            // this.owner.address,
            // this.genesis_steward1.address,
            // this.genesis_steward2.address
        ];
        const allocations = [
            // 500, 200, 300
        ];
        const params = [
            this.flexDirectdaoAddress,
            eligibilityType,
            tokenAddress,
            tokenId,
            votingWeightedType,
            supportType,
            quorumType,
            support,
            quorum,
            votingPeriod,
            executingPeriod,
            governors,
            allocations,
        ];
        const tx = await this.flexDaoSetVotingAdapterContract
            .submitVotingProposal(
                params
            );

        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposal = await this.flexDaoSetVotingAdapterContract.
            votingProposals(
                this.flexDirectdaoAddress,
                proposalId
            );

        let currenteligibilityType = await this.daoContract
            .getConfiguration("0x5b1db2a99ea07a11cfaecd49105623ca4735b50f1788d96b1bac788d36a5bcb2");
        let currenttokenAddress = await this.daoContract
            .getAddressConfiguration("0xe52ad936f38348d80ee24f7c89aa5f1eef01716e2edef2f9a86657e208816c66");
        let currenttokenId = await this.daoContract
            .getConfiguration("0xf6242d1d39a1b19c05c52b0f7eb55673f7309c8d6b78dd23c2c3854758358048");
        let currentvotingWeightedType = await this.daoContract
            .getConfiguration("0x18ef0b57fe939edb640a200fdf533493bd8f26a274151543a109b64c857e20f3");
        let currentsupportType = await this.daoContract
            .getConfiguration("0xe815a3c082eed7f7f7baab546f11a8718682c0eb3017b099ddc301a92f6673e3");
        let currentquorumType = await this.daoContract
            .getConfiguration("0xe815a3c082eed7f7f7baab546f11a8718682c0eb3017b099ddc301a92f6673e3");
        let currentquorum = await this.daoContract
            .getConfiguration("0x0324de13a5a6e302ddb95a9fdf81cc736fc8acee2abe558970daac27395904e7");
        let currentsupport = await this.daoContract
            .getConfiguration("0xb4c601c38beae7eebb719eda3438f59fcbfd4c6dd7d38c00665b6fd5b432df32");
        let currentvotingPeriod = await this.daoContract
            .getConfiguration("0x9876c0f0505bfb2b1c38d3bbd25ba13159172cd0868972d76927723f5a9480fc");


        let alloc0 = await this.flexStewardAllocation.
            getAllocation(this.flexDirectdaoAddress,
                this.owner.address);
        let alloc1 = await this.flexStewardAllocation.
            getAllocation(this.flexDirectdaoAddress,
                this.genesis_steward1.address);
        let alloc2 = await this.flexStewardAllocation.
            getAllocation(this.flexDirectdaoAddress,
                this.genesis_steward2.address);

        console.log(proposal);

        console.log(`
        created...
        proposalId ${proposalId}
        state ${proposal.state}
        currenteligibilityType ${currenteligibilityType}
        currenttokenAddress ${currenttokenAddress}
        currenttokenId  ${currenttokenId}
        currentvotingWeightedType  ${currentvotingWeightedType}
        currentsupportType  ${currentsupportType}
        currentquorumType  ${currentquorumType}    
        currentquorum ${currentquorum} 
        currentsupport ${currentsupport}
        currentvotingPeriod ${currentvotingPeriod}
        alloc0 ${alloc0}
        alloc1 ${alloc1}
        alloc2 ${alloc2}

        voting...
       `);

        await expectRevert(this.flexDaoSetVotingAdapterContract
            .submitVotingProposal(
                params
            ),
            "revert");

        await this.flexVotingContract.submitVote(
            this.flexDirectdaoAddress,
            proposalId,
            1
        );

        console.log(`
        voted...
        execute...
        `);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(proposal.timeInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposal.timeInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.flexDaoSetVotingAdapterContract.
            processVotingProposal(
                this.flexDirectdaoAddress,
                proposalId
            );

        proposal = await this.flexDaoSetVotingAdapterContract.
            votingProposals(
                this.flexDirectdaoAddress,
                proposalId
            );

        currenteligibilityType = await this.daoContract
            .getConfiguration("0x5b1db2a99ea07a11cfaecd49105623ca4735b50f1788d96b1bac788d36a5bcb2");
        currenttokenAddress = await this.daoContract
            .getAddressConfiguration("0xe52ad936f38348d80ee24f7c89aa5f1eef01716e2edef2f9a86657e208816c66");
        currenttokenId = await this.daoContract
            .getConfiguration("0xf6242d1d39a1b19c05c52b0f7eb55673f7309c8d6b78dd23c2c3854758358048");
        currentvotingWeightedType = await this.daoContract
            .getConfiguration("0x18ef0b57fe939edb640a200fdf533493bd8f26a274151543a109b64c857e20f3");
        currentsupportType = await this.daoContract
            .getConfiguration("0xe815a3c082eed7f7f7baab546f11a8718682c0eb3017b099ddc301a92f6673e3");
        currentquorumType = await this.daoContract
            .getConfiguration("0xe815a3c082eed7f7f7baab546f11a8718682c0eb3017b099ddc301a92f6673e3");
        currentquorum = await this.daoContract
            .getConfiguration("0x0324de13a5a6e302ddb95a9fdf81cc736fc8acee2abe558970daac27395904e7");
        currentsupport = await this.daoContract
            .getConfiguration("0xb4c601c38beae7eebb719eda3438f59fcbfd4c6dd7d38c00665b6fd5b432df32");
        currentvotingPeriod = await this.daoContract
            .getConfiguration("0x9876c0f0505bfb2b1c38d3bbd25ba13159172cd0868972d76927723f5a9480fc");

        alloc0 = await this.flexStewardAllocation.
            getAllocation(this.flexDirectdaoAddress,
                this.owner.address);
        alloc1 = await this.flexStewardAllocation.
            getAllocation(this.flexDirectdaoAddress,
                this.genesis_steward1.address);
        alloc2 = await this.flexStewardAllocation.
            getAllocation(this.flexDirectdaoAddress,
                this.genesis_steward2.address);

        console.log(`
        executed...
        state ${proposal.state}
        currenteligibilityType ${currenteligibilityType}
        currenttokenAddress ${currenttokenAddress}
        currenttokenId  ${currenttokenId}
        currentvotingWeightedType  ${currentvotingWeightedType}
        currentsupportType  ${currentsupportType}
        currentquorumType  ${currentquorumType}    
        currentquorum ${currentquorum} 
        currentsupport ${currentsupport}
        currentvotingPeriod ${currentvotingPeriod}
        alloc0 ${alloc0}
        alloc1 ${alloc1}
        alloc2 ${alloc2}
        `);
    });

    it("submit fees daoset proposal...", async () => {
        const managementFeeAmount = hre.ethers.utils.parseEther("0.002");
        const returnTokenManagementFeeAmount = hre.ethers.utils.parseEther("0.003");
        const managementAddress = this.user2.address;
        const tx = await this.flexDaoSetFeesAdapterContract
            .submitFeesProposal(
                this.flexDirectdaoAddress,
                managementFeeAmount,
                returnTokenManagementFeeAmount,
                managementAddress
            );

        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposal = await this.flexDaoSetFeesAdapterContract.
            feesProposals(
                this.flexDirectdaoAddress,
                proposalId
            );

        let currentManagementFee = await this.daoContract
            .getConfiguration("0x64c49ee5084f4940c312104c41603e43791b03dad28152afd6eadb5b960a8a87");
        let currentReturnTokenManagementFee = await this.daoContract
            .getConfiguration("0xea659d8e1a730b10af1cecb4f8ee391adf80e75302d6aaeb9642dc8a4a5e5dbb");
        let currentManagementFeeAddress = await this.daoContract
            .getAddressConfiguration("0x8987d08c67963e4cacd5e5936c122a968c66853d58299dd822c1942227109839");
        console.log(`
        created...
        proposalId ${proposalId}
        state ${proposal.state}
        currentManagementFee ${currentManagementFee}
        currentReturnTokenManagementFee ${currentReturnTokenManagementFee}
        currentManagementFeeAddress ${currentManagementFeeAddress}
        voting... 
       `);

        await expectRevert(this.flexDaoSetFeesAdapterContract
            .submitFeesProposal(
                this.flexDirectdaoAddress,
                managementFeeAmount,
                returnTokenManagementFeeAmount,
                managementAddress),
            "revert");

        await this.flexVotingContract.submitVote(
            this.flexDirectdaoAddress,
            proposalId,
            1);

        console.log(`
        voted...
        execute...
        `);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(proposal.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposal.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.flexDaoSetFeesAdapterContract.
            processFeesProposal(
                this.flexDirectdaoAddress,
                proposalId
            );
        proposal = await this.flexDaoSetFeesAdapterContract.
            feesProposals(
                this.flexDirectdaoAddress,
                proposalId
            );

        currentManagementFee = await this.daoContract
            .getConfiguration("0x64c49ee5084f4940c312104c41603e43791b03dad28152afd6eadb5b960a8a87");
        currentReturnTokenManagementFee = await this.daoContract
            .getConfiguration("0xea659d8e1a730b10af1cecb4f8ee391adf80e75302d6aaeb9642dc8a4a5e5dbb");
        currentManagementFeeAddress = await this.daoContract
            .getAddressConfiguration("0x8987d08c67963e4cacd5e5936c122a968c66853d58299dd822c1942227109839");

        console.log(`
        executed...
        state ${proposal.state}
        currentManagementFee ${currentManagementFee}
        currentReturnTokenManagementFee ${currentReturnTokenManagementFee}
        currentManagementFeeAddress ${currentManagementFeeAddress}
        `);
    });

    it("submit proposer membership proposal...", async () => {
        const proposerMembershipEnable = false;
        const name = "daoset-proposer-membership-name";
        const varifyType = 3; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
        const minHolding = 12;
        const tokenAddress = this.testtoken2.address;
        const tokenId = 2;
        const whiteList = [
            this.investor1.address,
            this.investor2.address
        ];

        const params = [
            this.flexDirectdaoAddress,
            proposerMembershipEnable,
            name,
            varifyType,
            minHolding,
            tokenAddress,
            tokenId,
            whiteList
        ];

        const tx = await this.flexDaoSetProposerMembershipAdapterContract
            .submitProposerMembershipProposal(
                params
            );

        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposal = await this.flexDaoSetProposerMembershipAdapterContract.
            proposerMembershipProposals(
                this.flexDirectdaoAddress,
                proposalId
            );
        let FLEX_PROPOSER_ENABLE = await this.daoContract
            .getConfiguration("0x2073e6ba5c75026b006fdd165596d94b89cada2e00d8e44a99d422de8ea467e0");
        const pWhitelist = await this.flexDaoSetProposerMembershipAdapterContract.
            getProposerMembershipWhitelist(proposalId);
        let currentName = await this.daoContract.
            getStringConfiguration("0xed2fa238da16f9e9bea8f1aa8dc2f0d04c522f8adbda71cc4ea5c11f5a51f32d");
        let currentProposerMembershipMinHolding = await this.daoContract
            .getConfiguration("0xf6d5f030b79ca78dad001b87a49239ec96be97e62d13501da94c9a392700509e");
        let currentProposerMembershipTokenId = await this.daoContract
            .getConfiguration("0xb34f156369747125f679c86d97f51861a5a2a9f927a1addd4354acbaaa88ae57");
        let currentProposerMembershipVarifyType = await this.daoContract
            .getConfiguration("0x57901982635f8a470a3648422f8f769cf08dc2057489be5bf0099fcb44f7d43c");
        let currentProposerMembershipTokenAddress = await this.daoContract
            .getAddressConfiguration("0x30091caaedd0994beeeeb3b7b5734296263687ae0126aaf79e5e0f8e5c1706b2");
        let currentProposerWhitelist = await
            this.flexFundingAdapterContract.
                getProposerWhitelist(this.flexDirectdaoAddress);

        console.log(`
        created...
        proposalId ${proposalId}
        pWhitelist ${pWhitelist}
        state ${proposal.state}
        FLEX_PROPOSER_ENABLE ${FLEX_PROPOSER_ENABLE}
        currentName ${currentName}
        currentProposerMembershipMinHolding ${currentProposerMembershipMinHolding}
        currentProposerMembershipTokenId ${currentProposerMembershipTokenId}
        currentProposerMembershipVarifyType ${currentProposerMembershipVarifyType}
        currentProposerMembershipTokenAddress ${currentProposerMembershipTokenAddress}
        currentProposerWhitelist ${currentProposerWhitelist}
        voting... 
        `);

        await expectRevert(this.flexDaoSetProposerMembershipAdapterContract
            .submitProposerMembershipProposal(
                params),
            "revert");

        await this.flexVotingContract.submitVote(
            this.flexDirectdaoAddress,
            proposalId,
            1);

        console.log(`
            voted...
            execute...
            `);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(proposal.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposal.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.flexDaoSetProposerMembershipAdapterContract.
            processProposerMembershipProposal(
                this.flexDirectdaoAddress,
                proposalId
            );
        proposal = await this.flexDaoSetProposerMembershipAdapterContract.
            proposerMembershipProposals(
                this.flexDirectdaoAddress,
                proposalId
            );
        FLEX_PROPOSER_ENABLE = await this.daoContract
            .getConfiguration("0x2073e6ba5c75026b006fdd165596d94b89cada2e00d8e44a99d422de8ea467e0");
        currentName = await this.daoContract.
            getStringConfiguration("0xed2fa238da16f9e9bea8f1aa8dc2f0d04c522f8adbda71cc4ea5c11f5a51f32d");
        currentProposerMembershipMinHolding = await this.daoContract
            .getConfiguration("0xf6d5f030b79ca78dad001b87a49239ec96be97e62d13501da94c9a392700509e");
        currentProposerMembershipTokenId = await this.daoContract
            .getConfiguration("0xb34f156369747125f679c86d97f51861a5a2a9f927a1addd4354acbaaa88ae57");
        currentProposerMembershipVarifyType = await this.daoContract
            .getConfiguration("0x57901982635f8a470a3648422f8f769cf08dc2057489be5bf0099fcb44f7d43c");
        currentProposerMembershipTokenAddress = await this.daoContract
            .getAddressConfiguration("0x30091caaedd0994beeeeb3b7b5734296263687ae0126aaf79e5e0f8e5c1706b2");
        currentProposerWhitelist = await
            this.flexFundingAdapterContract.
                getProposerWhitelist(this.flexDirectdaoAddress);

        console.log(`
        executed...
        state ${proposal.state}
        FLEX_PROPOSER_ENABLE ${FLEX_PROPOSER_ENABLE}
        currentName ${currentName}
        currentProposerMembershipMinHolding ${currentProposerMembershipMinHolding}
        currentProposerMembershipTokenId ${currentProposerMembershipTokenId}
        currentProposerMembershipVarifyType ${currentProposerMembershipVarifyType}
        currentProposerMembershipTokenAddress ${currentProposerMembershipTokenAddress}
        currentProposerWhitelist ${currentProposerWhitelist}
        `);
    });

    it("submit poll for investment proposal...", async () => {
        const pollEnable = true;
        const name = "daoset-pollvoter-memberhsip-name";
        const varifyType = 3; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
        const minHolding = 12;
        const tokenAddress = this.testtoken2.address;
        const tokenId = 2;
        const whiteList = [
            this.investor1.address,
            this.investor2.address
        ];

        const pollingvotingPeriod = 60 * 8;
        const pollingvotingPower = 2;
        const pollingsuperMajority = 12;
        const pollingquorum = 22;
        const pollingeligibilityType = 2; //0. erc20 1.erc721 2.erc1155 3.allocation
        const pollingtokenAddress = this.testtoken2.address;
        const pollingtokenID = 44;
        const pollingsupportType = 1; // 0. YES - NO > X
        const pollingquorumType = 0; // 0. YES + NO > X 

        const params = [
            this.flexDirectdaoAddress,
            pollEnable,
            [
                name,
                varifyType,
                minHolding,
                tokenAddress,
                tokenId,
                whiteList
            ],
            [
                pollingvotingPeriod,
                pollingvotingPower,
                pollingsuperMajority,
                pollingquorum,
                pollingeligibilityType,
                pollingtokenAddress,
                pollingtokenID,
                pollingsupportType,
                pollingquorumType
            ]
        ];
        const tx = await this.flexDaoSetPollingAdapterContract
            .submitPollForInvestmentProposal(
                params
            );

        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;

        let proposal = await this.flexDaoSetPollingAdapterContract.
            pollForInvestmentProposals(
                this.flexDirectdaoAddress,
                proposalId
            );

        console.log(proposal);

        const pWhitelist = await this.flexDaoSetPollingAdapterContract.
            getWhitelist(proposalId);
        let currentName = await this.daoContract
            .getStringConfiguration("0x7bd63360ec775df97ced77d73875245296c41d88ebf2b52f8e630b4e9a51b448");
        let currentflexDaoPollingVotingPeriod = await this.daoContract
            .getConfiguration("0xee63cc82ca6990a4cc5fa3ca10d8a5281ae1758a8d8f22892c4badb7cacd111e");
        let currentflexDaoPollingVotingPower = await this.daoContract
            .getConfiguration("0x18ccfaf5deb9f2b0bd666344fa9c46950fbcee85fbfd05c3959876dfe502c209");
        let currentflexDaoPollingSuperMajority = await this.daoContract
            .getConfiguration("0x777270e51451e60c2ce5118fc8e5844441dcc4d102e9052e60fb41312dbb848a");
        let currentflexDaoPollingQuorum = await this.daoContract
            .getConfiguration("0x7789eea44dccd66529026559d1b36215cb5766016b41a8a8f16e08b2ec875837");
        let currentflexDaoPollingEligibilityType = await this.daoContract
            .getConfiguration("0xf873703084a7a9b6b81a595d5038f888fd90f4f9a530d4950a46c89eab021188");
        let currentflexEligibilityTokenId = await this.daoContract
            .getConfiguration("0x656f80c3ee5e8b049b7028f53c3d8f66f585b411116738cd6604ce8e8deb3a92");
        let currentflexEligibilityTokenAddress = await this.daoContract
            .getAddressConfiguration("0xf60c24a553194691fd513f91f28ce90d85b87ab669703faa0b848c72a41c6923");
        let currentflexDaoPollsterMembershipVarifyType = await this.daoContract
            .getConfiguration("0x112aea211656a3cfbf863b85e1ea090785899c30bd783708bb07b5a9049e5c32");
        let currentflexDaoPollsterMembershipMinHolding = await this.daoContract
            .getConfiguration("0x308a2ac7f1fce200f70e879e51cb346dfa5bc50cc3ffd14e12510d1fbaecb352");
        let currentflexPollsterMembershipTokenAddress = await this.daoContract
            .getAddressConfiguration("0x31cf49cb2c53ac34ebe77513f2222803ae1f2e89c781171ca472d273e6593575");
        let currentflexDaoPollsterMembershipTokenId = await this.daoContract
            .getConfiguration("0x5b0d0dc46f84f7703b74bcc9981b23b0ddbcdc040dd1c5c313bc64f7ab01ba88");
        let currentPollsterWhitelist = await
            this.flexPollingVotingContract.
                getWhitelist(this.flexDirectdaoAddress);
        let currentPollEnable = await this.daoContract
            .getConfiguration("0x6e9fd67c3f2ca4e2b4e4b45b33b985dc3a1bffcadea24d12440a5901f72217b5");
        console.log(`
        created...
        proposalId ${proposalId}
        state ${proposal.state}
        pWhitelist ${pWhitelist}
        currentName ${currentName}
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
        currentPollEnable ${currentPollEnable}
        voting... 
        `);

        await expectRevert(this.flexDaoSetPollingAdapterContract
            .submitPollForInvestmentProposal(
                params),
            "revert");

        await this.flexVotingContract.submitVote(
            this.flexDirectdaoAddress,
            proposalId,
            1);

        console.log(`
            voted...
            execute...
            `);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(proposal.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposal.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.flexDaoSetPollingAdapterContract.
            processPollForInvestmentProposal(
                this.flexDirectdaoAddress,
                proposalId
            );
        proposal = await this.flexDaoSetPollingAdapterContract.
            pollForInvestmentProposals(
                this.flexDirectdaoAddress,
                proposalId
            );
        currentName = await this.daoContract
            .getStringConfiguration("0x7bd63360ec775df97ced77d73875245296c41d88ebf2b52f8e630b4e9a51b448");
        currentflexDaoPollingVotingPeriod = await this.daoContract
            .getConfiguration("0xee63cc82ca6990a4cc5fa3ca10d8a5281ae1758a8d8f22892c4badb7cacd111e");
        currentflexDaoPollingVotingPower = await this.daoContract
            .getConfiguration("0x18ccfaf5deb9f2b0bd666344fa9c46950fbcee85fbfd05c3959876dfe502c209");
        currentflexDaoPollingSuperMajority = await this.daoContract
            .getConfiguration("0x777270e51451e60c2ce5118fc8e5844441dcc4d102e9052e60fb41312dbb848a");
        currentflexDaoPollingQuorum = await this.daoContract
            .getConfiguration("0x7789eea44dccd66529026559d1b36215cb5766016b41a8a8f16e08b2ec875837");
        currentflexDaoPollingEligibilityType = await this.daoContract
            .getConfiguration("0xf873703084a7a9b6b81a595d5038f888fd90f4f9a530d4950a46c89eab021188");
        currentflexEligibilityTokenId = await this.daoContract
            .getConfiguration("0x656f80c3ee5e8b049b7028f53c3d8f66f585b411116738cd6604ce8e8deb3a92");
        currentflexEligibilityTokenAddress = await this.daoContract
            .getAddressConfiguration("0xf60c24a553194691fd513f91f28ce90d85b87ab669703faa0b848c72a41c6923");
        currentflexDaoPollsterMembershipVarifyType = await this.daoContract
            .getConfiguration("0x112aea211656a3cfbf863b85e1ea090785899c30bd783708bb07b5a9049e5c32");
        currentflexDaoPollsterMembershipMinHolding = await this.daoContract
            .getConfiguration("0x308a2ac7f1fce200f70e879e51cb346dfa5bc50cc3ffd14e12510d1fbaecb352");
        currentflexPollsterMembershipTokenAddress = await this.daoContract
            .getAddressConfiguration("0x31cf49cb2c53ac34ebe77513f2222803ae1f2e89c781171ca472d273e6593575");
        currentflexDaoPollsterMembershipTokenId = await this.daoContract
            .getConfiguration("0x5b0d0dc46f84f7703b74bcc9981b23b0ddbcdc040dd1c5c313bc64f7ab01ba88");
        currentPollsterWhitelist = await
            this.flexPollingVotingContract.
                getWhitelist(this.flexDirectdaoAddress);
        currentPollEnable = await this.daoContract
            .getConfiguration("0x6e9fd67c3f2ca4e2b4e4b45b33b985dc3a1bffcadea24d12440a5901f72217b5");
        console.log(`
        executed...
        state ${proposal.state}
        currentName ${currentName}
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
        currentPollEnable ${currentPollEnable}
        `);
    });
});

describe("submit daoset proposal during other poposal in progress...", () => {
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
        // this.flexDaoSetAdapterContract = adapters.flexDaoSetAdapterContract.instance;
        this.flexDaoSetHelperAdapterContract = adapters.flexDaoSetHelperAdapterContract.instance;
        this.flexDaoSetPollingAdapterContract = adapters.flexDaoSetPollingAdapterContract.instance;
        this.flexDaoSetVotingAdapterContract = adapters.flexDaoSetVotingAdapterContract.instance;
        this.flexDaoSetFeesAdapterContract = adapters.flexDaoSetFeesAdapterContract.instance;
        this.flexDaoSetGovernorMembershipAdapterContract = adapters.flexDaoSetGovernorMembershipAdapterContract.instance;
        this.flexDaoSetInvestorCapAdapterContract = adapters.flexDaoSetInvestorCapAdapterContract.instance;
        this.flexDaoSetInvestorMembershipAdapterContract = adapters.flexDaoSetInvestorMembershipAdapterContract.instance;
        this.flexDaoSetProposerMembershipAdapterContract = adapters.flexDaoSetProposerMembershipAdapterContract.instance;

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
            2 //uint256 maxParticipantsAmount;
        ]

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMemberships = [
            0, // uint8 varifyType;
            "flexDaoParticipantsMembershipName",
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [ZERO_ADDRESS] //whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            "flexDaoStewardMembershipName",
            3, // uint256 varifyType;0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [
                this.user1.address,
                this.user2.address
            ] // address[] whiteList;
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
            "flexDaoPollsterMembershipName",
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
        const flexDaoGenesisStewards = [];
        const allocations = [10, 20, 30];

        const fundingPollEnable = false; //DIRECT mode
        const flexDaoFundriaseStyle = 1 // 0 - FCFS 1- Free ink0

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
            pollingToken ${pollingToken}
            flexPollingVoteWeight ${flexPollingVoteWeight}

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

    it("varify undone proposal - participant cap...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const daoAddr = this.flexDirectdaoAddress;
        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("100"));
        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        const currentfundingId = await this.daoContract.getCurrentInvestmentProposalId();
        const currentgovenorinId = await this.daoContract.getCurrentGovenorInProposalId();
        const currentgovenoroutId = await this.daoContract.getCurrentGovenorOutProposalId();
        const currentnewfundId = await this.daoContract.getCurrentFundEstablishmentProposalId();
        console.log(`
        stewardInProposalId ${proposalId}
        currentfundingId ${currentfundingId}
        currentgovenorInId ${currentgovenorinId}
        currentgovenoroutId ${currentgovenoroutId} 
        currentnewfundId ${currentnewfundId}
        `);

        const enableParticipantCap = false;
        const cap = 0;
        await expectRevert(this.flexDaoSetInvestorCapAdapterContract
            .submitInvestorCapProposal(
                this.flexDirectdaoAddress,
                enableParticipantCap,
                cap), "revert");
        // const result1 = await tx1.wait();
        // const proposalId1 = result1.events[result.events.length - 1].args.proposalId;

        await this.flexVotingContract.submitVote(
            this.flexDirectdaoAddress,
            proposalId,
            2);

        console.log(`
        voted...
        execute...
        `);

        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await stewardMangementContract.processProposal(daoAddr, proposalId);

        console.log(`
        executed...
        `);

        const tx1 = await this.flexDaoSetInvestorCapAdapterContract
            .submitInvestorCapProposal(
                this.flexDirectdaoAddress,
                enableParticipantCap,
                cap);

        const result1 = await tx1.wait();
        const proposalId1 = result1.events[result.events.length - 1].args.proposalId;

        let proposal = await this.flexDaoSetInvestorCapAdapterContract.
            investorCapProposals(
                this.flexDirectdaoAddress,
                proposalId1
            );

        await this.flexVotingContract.submitVote(
            this.flexDirectdaoAddress,
            proposalId1,
            2);


        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(proposal.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposal.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.flexDaoSetInvestorCapAdapterContract.
            processInvestorCapProposal(
                this.flexDirectdaoAddress,
                proposalId1
            );
    });

    it("varify undone proposal - governor memberhsip...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const daoAddr = this.flexDirectdaoAddress;
        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("100"));
        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        const currentfundingId = await this.daoContract.getCurrentInvestmentProposalId();
        const currentgovenorinId = await this.daoContract.getCurrentGovenorInProposalId();
        const currentgovenoroutId = await this.daoContract.getCurrentGovenorOutProposalId();
        const currentnewfundId = await this.daoContract.getCurrentFundEstablishmentProposalId();
        console.log(`
        stewardInProposalId ${proposalId}
        currentfundingId ${currentfundingId}
        currentgovenorinId ${currentgovenorinId}
        currentgovenoroutId ${currentgovenoroutId} 
        currentnewfundId ${currentnewfundId}
        `);

        const enable = true;
        const name = "daoset-governor-membership-new-name";

        const varifyType = 1;
        const minAmount = 4;
        const tokenAddress = this.testtoken1.address;
        const tokenId = 0;
        const whiteList = [this.user1.address, this.user2.address];
        const params = [
            daoAddr,
            enable,
            name,
            varifyType,
            minAmount,
            tokenAddress,
            tokenId,
            whiteList
        ];

        await expectRevert(this.flexDaoSetGovernorMembershipAdapterContract
            .submitGovernorMembershipProposal(
                params), "revert");

        await this.flexVotingContract.submitVote(
            daoAddr,
            proposalId,
            2);

        console.log(`
        voted...
        execute...
        `);

        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await stewardMangementContract.processProposal(daoAddr, proposalId);

        console.log(`
        executed...
        `);

        const tx1 = await this.flexDaoSetGovernorMembershipAdapterContract
            .submitGovernorMembershipProposal(
                params
            );

        const result1 = await tx1.wait();
        const proposalId1 = result1.events[result.events.length - 1].args.proposalId;

        let proposal = await this.flexDaoSetGovernorMembershipAdapterContract.
            governorMembershipProposals(
                this.flexDirectdaoAddress,
                proposalId1
            );

        await this.flexVotingContract.submitVote(
            this.flexDirectdaoAddress,
            proposalId1,
            2
        );

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(proposal.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposal.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.flexDaoSetGovernorMembershipAdapterContract.
            processGovernorMembershipProposal(
                this.flexDirectdaoAddress,
                proposalId1
            );
    });

    it("varify undone proposal - investor memberhsip...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const daoAddr = this.flexDirectdaoAddress;
        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("100"));
        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        const currentfundingId = await this.daoContract.getCurrentInvestmentProposalId();
        const currentgovenorinId = await this.daoContract.getCurrentGovenorInProposalId();
        const currentgovenoroutId = await this.daoContract.getCurrentGovenorOutProposalId();
        const currentnewfundId = await this.daoContract.getCurrentFundEstablishmentProposalId();
        console.log(`
        stewardInProposalId ${proposalId}
        currentfundingId ${currentfundingId}
        currentgovenorinId ${currentgovenorinId}
        currentgovenoroutId ${currentgovenoroutId} 
        currentnewfundId ${currentnewfundId}
        `);

        const enable = true;
        const name = "daoset-investor-membership-name";
        const varifyType = 1;
        const minAmount = 4;
        const tokenAddress = this.testtoken1.address;
        const tokenId = 2;
        const whiteList = [this.user1.address, this.user2.address];
        const params = [
            this.flexDirectdaoAddress,
            enable,
            name,
            varifyType,
            minAmount,
            tokenAddress,
            tokenId,
            whiteList
        ];

        await expectRevert(this.flexDaoSetInvestorMembershipAdapterContract
            .submitInvestorMembershipProposal(
                params), "revert");

        await this.flexVotingContract.submitVote(
            daoAddr,
            proposalId,
            2);

        console.log(`
        voted...
        execute...
        `);

        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await stewardMangementContract.processProposal(daoAddr, proposalId);

        console.log(`
        executed...
        `);

        const tx1 = await this.flexDaoSetInvestorMembershipAdapterContract
            .submitInvestorMembershipProposal(
                params
            );

        const result1 = await tx1.wait();
        const proposalId1 = result1.events[result.events.length - 1].args.proposalId;

        let proposal = await this.flexDaoSetInvestorMembershipAdapterContract.
            investorMembershipProposals(
                this.flexDirectdaoAddress,
                proposalId1
            );

        await this.flexVotingContract.submitVote(
            this.flexDirectdaoAddress,
            proposalId1,
            2
        );

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(proposal.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposal.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.flexDaoSetInvestorMembershipAdapterContract.
            processInvestorMembershipProposal(
                this.flexDirectdaoAddress,
                proposalId1
            );
    });

    it("varify undone proposal - voting...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const daoAddr = this.flexDirectdaoAddress;
        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("100"));
        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        const currentfundingId = await this.daoContract.getCurrentInvestmentProposalId();
        const currentgovenorinId = await this.daoContract.getCurrentGovenorInProposalId();
        const currentgovenoroutId = await this.daoContract.getCurrentGovenorOutProposalId();
        const currentnewfundId = await this.daoContract.getCurrentFundEstablishmentProposalId();
        console.log(`
        stewardInProposalId ${proposalId}
        currentfundingId ${currentfundingId}
        currentgovenorinId ${currentgovenorinId}
        currentgovenoroutId ${currentgovenoroutId} 
        currentnewfundId ${currentnewfundId}
        `);

        const eligibilityType = 3;
        const tokenAddress = this.testtoken1.address;
        const tokenId = 2;
        const votingWeightedType = 1;
        const supportType = 1;
        const quorumType = 1
        const support = 2;
        const quorum = 2;
        const votingPeriod = 60 * 10;
        const executingPeriod = 60 * 5;
        const governors = [
            this.owner.address,
            this.genesis_steward1.address,
            this.genesis_steward2.address
        ];
        const allocations = [500, 200, 300];
        const params = [
            this.flexDirectdaoAddress,
            eligibilityType,
            tokenAddress,
            tokenId,
            votingWeightedType,
            supportType,
            quorumType,
            support,
            quorum,
            votingPeriod,
            executingPeriod,
            governors,
            allocations,
        ];

        await expectRevert(this.flexDaoSetVotingAdapterContract
            .submitVotingProposal(
                params), "revert");

        await this.flexVotingContract.submitVote(
            daoAddr,
            proposalId,
            2);

        console.log(`
        voted...
        execute...
        `);

        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await stewardMangementContract.processProposal(daoAddr, proposalId);

        console.log(`
        executed...
        `);

        const tx1 = await this.flexDaoSetVotingAdapterContract
            .submitVotingProposal(
                params
            );

        const result1 = await tx1.wait();
        const proposalId1 = result1.events[result.events.length - 1].
            args.proposalId;

        let proposal = await this.flexDaoSetVotingAdapterContract.
            votingProposals(
                this.flexDirectdaoAddress,
                proposalId1
            );
        console.log(proposal);
        await this.flexVotingContract.submitVote(
            this.flexDirectdaoAddress,
            proposalId1,
            2
        );

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(proposal.timeInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposal.timeInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.flexDaoSetVotingAdapterContract.
            processVotingProposal(
                this.flexDirectdaoAddress,
                proposalId1
            );
    });

    it("varify undone proposal - fees...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const daoAddr = this.flexDirectdaoAddress;
        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("100"));
        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        const currentfundingId = await this.daoContract.getCurrentInvestmentProposalId();
        const currentgovenorinId = await this.daoContract.getCurrentGovenorInProposalId();
        const currentgovenoroutId = await this.daoContract.getCurrentGovenorOutProposalId();
        const currentnewfundId = await this.daoContract.getCurrentFundEstablishmentProposalId();
        console.log(`
        stewardInProposalId ${proposalId}
        currentfundingId ${currentfundingId}
        currentgovenorinId ${currentgovenorinId}
        currentgovenoroutId ${currentgovenoroutId} 
        currentnewfundId ${currentnewfundId}
        `);

        const managementFeeAmount = hre.ethers.utils.parseEther("0.002");
        const returnTokenManagementFeeAmount = hre.ethers.utils.parseEther("0.003");
        const managementAddress = this.user2.address;

        await expectRevert(this.flexDaoSetFeesAdapterContract
            .submitFeesProposal(
                this.flexDirectdaoAddress,
                managementFeeAmount,
                returnTokenManagementFeeAmount,
                managementAddress
            ), "revert");

        await this.flexVotingContract.submitVote(
            daoAddr,
            proposalId,
            2);

        console.log(`
        voted...
        execute...
        `);

        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await stewardMangementContract.processProposal(daoAddr, proposalId);

        console.log(`
        executed...
        `);

        const tx1 = await this.flexDaoSetFeesAdapterContract
            .submitFeesProposal(
                this.flexDirectdaoAddress,
                managementFeeAmount,
                returnTokenManagementFeeAmount,
                managementAddress
            );

        const result1 = await tx1.wait();
        const proposalId1 = result1.events[result.events.length - 1].
            args.proposalId;

        let proposal = await this.flexDaoSetFeesAdapterContract.
            feesProposals(
                this.flexDirectdaoAddress,
                proposalId1
            );

        await this.flexVotingContract.submitVote(
            this.flexDirectdaoAddress,
            proposalId1,
            2
        );

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(proposal.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposal.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.flexDaoSetFeesAdapterContract.
            processFeesProposal(
                this.flexDirectdaoAddress,
                proposalId1
            );
    });

    it("varify undone proposal - proposer membership...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const daoAddr = this.flexDirectdaoAddress;
        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("100"));
        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        const currentfundingId = await this.daoContract.getCurrentInvestmentProposalId();
        const currentgovenorinId = await this.daoContract.getCurrentGovenorInProposalId();
        const currentgovenoroutId = await this.daoContract.getCurrentGovenorOutProposalId();
        const currentnewfundId = await this.daoContract.getCurrentFundEstablishmentProposalId();
        console.log(`
        stewardInProposalId ${proposalId}
        currentfundingId ${currentfundingId}
        currentgovenorinId ${currentgovenorinId}
        currentgovenoroutId ${currentgovenoroutId} 
        currentnewfundId ${currentnewfundId}
        `);

        const proposerMembershipEnable = true;
        const name = "daoset-proposer-membership-name";
        const varifyType = 3; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
        const minHolding = 12;
        const tokenAddress = this.testtoken2.address;
        const tokenId = 2;
        const whiteList = [
            this.investor1.address,
            this.investor2.address
        ];

        const params = [
            this.flexDirectdaoAddress,
            proposerMembershipEnable,
            name,
            varifyType,
            minHolding,
            tokenAddress,
            tokenId,
            whiteList
        ];

        await expectRevert(this.flexDaoSetProposerMembershipAdapterContract
            .submitProposerMembershipProposal(
                params
            ), "revert");

        await this.flexVotingContract.submitVote(
            daoAddr,
            proposalId,
            2);

        console.log(`
        voted...
        execute...
        `);

        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await stewardMangementContract.processProposal(daoAddr, proposalId);

        console.log(`
        executed...
        `);

        const tx1 = await this.flexDaoSetProposerMembershipAdapterContract
            .submitProposerMembershipProposal(
                params
            );

        const result1 = await tx1.wait();
        const proposalId1 = result1.events[result.events.length - 1].
            args.proposalId;

        let proposal = await this.flexDaoSetProposerMembershipAdapterContract.
            proposerMembershipProposals(
                this.flexDirectdaoAddress,
                proposalId1
            );

        await this.flexVotingContract.submitVote(
            this.flexDirectdaoAddress,
            proposalId1,
            2
        );

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(proposal.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposal.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.flexDaoSetProposerMembershipAdapterContract.
            processProposerMembershipProposal(
                this.flexDirectdaoAddress,
                proposalId1
            );
    });

    it("varify undone proposal - poll for investment...", async () => {
        const stewardMangementContract = this.flexStewardMangement;
        const daoAddr = this.flexDirectdaoAddress;
        const pollEnable = true;
        await this.testtoken1.transfer(this.user1.address, hre.ethers.utils.parseEther("100"));
        const tx = await stewardMangementContract.submitGovernorInProposal(daoAddr, this.user1.address, 0);
        const result = await tx.wait();
        const proposalId = result.events[result.events.length - 1].args.proposalId;
        this.stewardInProposalId = proposalId;
        const currentfundingId = await this.daoContract.getCurrentInvestmentProposalId();
        const currentgovenorinId = await this.daoContract.getCurrentGovenorInProposalId();
        const currentgovenoroutId = await this.daoContract.getCurrentGovenorOutProposalId();
        const currentnewfundId = await this.daoContract.getCurrentFundEstablishmentProposalId();
        console.log(`
        stewardInProposalId ${proposalId}
        currentfundingId ${currentfundingId}
        currentgovenorinId ${currentgovenorinId}
        currentgovenoroutId ${currentgovenoroutId} 
        currentnewfundId ${currentnewfundId}
        `);
        const name = "daoset-pollvoter-memberhsip-name";
        const varifyType = 3; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
        const minHolding = 12;
        const tokenAddress = this.testtoken2.address;
        const tokenId = 2;
        const whiteList = [
            this.investor1.address,
            this.investor2.address
        ];

        const pollingvotingPeriod = 60 * 8;
        const pollingvotingPower = 1;
        const pollingsuperMajority = 12;
        const pollingquorum = 22;
        const pollingeligibilityType = 1; //0. erc20 1.erc721 2.erc1155 3.allocation
        const pollingtokenAddress = this.testtoken2.address;
        const pollingtokenID = 44;
        const pollingsupportType = 1; // 0. YES - NO > X
        const pollingquorumType = 0; // 0. YES + NO > X 

        const params = [
            this.flexDirectdaoAddress,
            pollEnable,
            [
                name,
                varifyType,
                minHolding,
                tokenAddress,
                tokenId,
                whiteList
            ],
            [
                pollingvotingPeriod,
                pollingvotingPower,
                pollingsuperMajority,
                pollingquorum,
                pollingeligibilityType,
                pollingtokenAddress,
                pollingtokenID,
                pollingsupportType,
                pollingquorumType
            ]

        ];

        await expectRevert(this.flexDaoSetPollingAdapterContract
            .submitPollForInvestmentProposal(
                params
            ), "revert");

        await this.flexVotingContract.submitVote(
            daoAddr,
            proposalId,
            2);

        console.log(`
        voted...
        execute...
        `);

        let proposalDetail = await stewardMangementContract.proposals(daoAddr, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await stewardMangementContract.processProposal(daoAddr, proposalId);

        console.log(`
        executed...
        `);

        const tx1 = await this.flexDaoSetPollingAdapterContract
            .submitPollForInvestmentProposal(
                params
            );

        const result1 = await tx1.wait();
        const proposalId1 = result1.events[result.events.length - 1].
            args.proposalId;

        let proposal = await this.flexDaoSetPollingAdapterContract.
            pollForInvestmentProposals(
                this.flexDirectdaoAddress,
                proposalId1
            );

        await this.flexVotingContract.submitVote(
            this.flexDirectdaoAddress,
            proposalId1,
            2
        );

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        if (parseInt(proposal.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposal.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.flexDaoSetPollingAdapterContract.
            processPollForInvestmentProposal(
                this.flexDirectdaoAddress,
                proposalId1
            );
    });
});

