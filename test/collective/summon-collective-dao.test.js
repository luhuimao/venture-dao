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


describe("Summon A Collective Dao", () => {
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

        const _daoName = "my_collective_dao1";

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
        this.flexVestingERC721 = utilContracts.flexVestingERC721.instance;
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

        this.bentoBoxV1 = adapters.bentoBoxV1.instance;
        // this.managing = this.adapters.managing.instance;
        this.summonCollectiveDao = this.adapters.summonCollectiveDao.instance;

        console.log(`
        owner address ${owner.address}
        `);
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

    it("summom a collective dao by summon contract...", async () => {

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.collectiveFundingPoolFactory.address
        ];
        const _daoName = "my_collective_dao002";

        const creator = this.owner.address;
        const enalbeAdapters = [
            {
                id: '0xdac6d9ce728ebc92a61253866b4e5a4c73b76ba0aa11e7297a633f6232f54237', //collective-daoset-adapter
                addr: this.colletiveDaoSetProposalContract.address,
                flags: 1794058
            },
            {
                id: '0x1a4f1390baec30049008138e650571a3c4374eba88116bc89dc192f2f9295efe', //collective-governor-management-adapter
                addr: this.colletiveGovernorManagementContract.address,
                flags: 6338
            }
        ];

        const adapters1 = [
            // {
            //     id: '', //collective-governor-management-adapter
            //     addr: '',
            //     flags: 0
            // }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const collectiveDaoIvestorCapInfo = [
            true, //bool enable;
            5 //uint256 maxParticipantsAmount;
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
            collectiveDaoGenesisGovernor
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

        const vp = await daoContract.getConfiguration(sha3("VOTING_PERIOD"));
        const sm = await daoContract.getConfiguration(sha3("SUPER_MAJORITY"));
        const cvat = await daoContract.getConfiguration(sha3("COLLECTIVE_VOTING_ASSET_TYPE"));
        const cvwt = await daoContract.getConfiguration(sha3("COLLECTIVE_VOTING_WEIGHTED_TYPE"));
        const q = await daoContract.getConfiguration(sha3("QUORUM"));
        const cvst = await daoContract.getConfiguration(sha3("COLLECTIVE_VOTING_SUPPORT_TYPE"));
        const cvqt = await daoContract.getConfiguration(sha3("COLLECTIVE_VOTING_QUORUM_TYPE"));
        const cvgp = await daoContract.getConfiguration(sha3("COLLECTIVE_VOTING_GRACE_PERIOD"));
        const cvep = await daoContract.getConfiguration(sha3("COLLECTIVE_VOTING_EXECUTE_PERIOD"));


        const cmfa = await daoContract.getConfiguration(sha3("COLLECTIVE_MANAGEMENT_FEE_AMOUNT"));
        const crfa = await daoContract.getConfiguration(sha3("COLLECTIVE_REDEMPT_FEE_AMOUNT"));
        const cpitra = await daoContract.getConfiguration(sha3("COLLECTIVE_PROPOSER_INVEST_TOKEN_REWARD_AMOUNT"));
        const cpptra = await daoContract.getConfiguration(sha3("COLLECTIVE_PROPOSER_PAYBACK_TOKEN_REWARD_AMOUNT"));
        const cmfra = await daoContract.getAddressConfiguration(sha3("COLLECTIVE_MANAGEMENT_FEE_RECEIVE_ADDRESS"));

        const mie = await daoContract.getConfiguration(sha3("MAX_INVESTORS_ENABLE"));
        const mi = await daoContract.getConfiguration(sha3("MAX_INVESTORS"));

        const cgme = await daoContract.getConfiguration(sha3("COLLECTIVE_GOVERNOR_MEMBERSHIP_ENABLE"));
        const cgmt = await daoContract.getConfiguration(sha3("COLLECTIVE_GOVERNOR_MEMBERSHIP_TYPE"));
        const cgmmh = await daoContract.getConfiguration(sha3("COLLECTIVE_GOVERNOR_MEMBERSHIP_MINI_HOLDING"));
        const cgmta = await daoContract.getAddressConfiguration(sha3("COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS"));
        const cgmti = await daoContract.getConfiguration(sha3("COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ID"));

        const wl = await this.colletiveGovernorManagementContract.getGovernorWhitelist(daoAddr);

        console.log(`
        VOTING_PERIOD ${vp}
        SUPER_MAJORITY ${sm}
        COLLECTIVE_VOTING_ASSET_TYPE ${cvat}
        COLLECTIVE_VOTING_WEIGHTED_TYPE ${cvwt}
        QUORUM ${q}
        COLLECTIVE_VOTING_SUPPORT_TYPE ${cvst}
        COLLECTIVE_VOTING_QUORUM_TYPE ${cvqt}
        COLLECTIVE_VOTING_GRACE_PERIOD ${cvgp}
        COLLECTIVE_VOTING_EXECUTE_PERIOD ${cvep}

        COLLECTIVE_MANAGEMENT_FEE_AMOUNT ${hre.ethers.utils.formatEther(cmfa)}
        COLLECTIVE_REDEMPT_FEE_AMOUNT ${hre.ethers.utils.formatEther(crfa)}
        COLLECTIVE_PROPOSER_INVEST_TOKEN_REWARD_AMOUNT ${hre.ethers.utils.formatEther(cpitra)}
        COLLECTIVE_PROPOSER_PAYBACK_TOKEN_REWARD_AMOUNT ${hre.ethers.utils.formatEther(cpptra)}
        COLLECTIVE_MANAGEMENT_FEE_RECEIVE_ADDRESS ${cmfra}

        MAX_INVESTORS_ENABLE ${mie}
        MAX_INVESTORS ${mi}

        COLLECTIVE_GOVERNOR_MEMBERSHIP_ENABLE ${cgme}
        COLLECTIVE_GOVERNOR_MEMBERSHIP_TYPE ${cgmt}
        COLLECTIVE_GOVERNOR_MEMBERSHIP_MINI_HOLDING ${cgmmh}
        COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS ${cgmta}
        COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ID ${cgmti}

        governor whitelist ${wl}
        `);

    });
});

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
        this.flexVestingERC721 = utilContracts.flexVestingERC721.instance;
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

        console.log(`
        voted, execute...`);
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

describe("fund raise proposal...", () => {
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
        this.flexVestingERC721 = utilContracts.flexVestingERC721.instance;
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
            collectiveDaoGenesisGovernor
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

        return {
            daoAddr: daoAddr,
            daoName: daoName
        };
    };

    it("create fund raise proposal...", async () => {
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
        console.log(`
            created...
            proposalId ${proposalId}
        `);

        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward1).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward2).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        console.log("voted, execute...");
        let proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(this.collectiveDirectdaoAddress, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
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
    });

});

describe("deposit, withdraw...", () => {
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
        this.flexVestingERC721 = utilContracts.flexVestingERC721.instance;
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
            collectiveDaoGenesisGovernor
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

        return {
            daoAddr: daoAddr,
            daoName: daoName
        };
    };

    it("deposit...", async () => {
        const dao = this.collectiveDirectdaoAddress;
        const tokenAddress = this.testtoken1.address;
        const miniTarget = hre.ethers.utils.parseEther("1000");
        const maxCap = hre.ethers.utils.parseEther("1500");
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

        const startTime = blocktimestamp + 60 * 1;
        const endTime = startTime + 60 * 60 * 2;
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
        console.log(`
            created...
            proposalId ${proposalId}
        `);

        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward1).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward2).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        console.log("voted, execute...");
        let proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(this.collectiveDirectdaoAddress, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.colletiveFundRaiseProposalContract.processProposal(this.collectiveDirectdaoAddress, proposalId);
        proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(this.collectiveDirectdaoAddress, proposalId);
        let governors = await this.colletiveGovernorManagementContract.getAllGovernor(this.collectiveDirectdaoAddress);

        console.log(`
        executed...
        state ${proposalDetail.state}
        governors ${governors}
        `);


        await this.testtoken1.approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));
        await this.testtoken1.connect(this.investor1).approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));
        await this.testtoken1.connect(this.investor2).approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("2000"));
        await this.testtoken1.transfer(this.investor2.address, hre.ethers.utils.parseEther("2000"));

        await expectRevert(this.colletiveFundingPoolContract.deposit(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("1")), "revert");
        await expectRevert(this.colletiveFundingPoolContract.deposit(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("1001")), "revert");

        await this.colletiveFundingPoolContract.deposit(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("1000"));
        await expectRevert(this.colletiveFundingPoolContract.connect(this.investor1).deposit(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("600")), "revert");
        await this.colletiveFundingPoolContract.connect(this.investor1).deposit(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("500"));

        await expectRevert(this.colletiveFundingPoolContract.connect(this.investor2).deposit(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("100")), "revert");

        let depositBal1 = await this.colletiveFundingPoolContract.balanceOf(this.collectiveDirectdaoAddress, this.owner.address);
        let depositBal2 = await this.colletiveFundingPoolContract.balanceOf(this.collectiveDirectdaoAddress, this.investor1.address);
        let poolBal = await this.colletiveFundingPoolContract.poolBalance(this.collectiveDirectdaoAddress);
        governors = await this.colletiveGovernorManagementContract.getAllGovernor(this.collectiveDirectdaoAddress);
        console.log(`
        depositBal1 ${hre.ethers.utils.formatEther(depositBal1)}
        depositBal2 ${hre.ethers.utils.formatEther(depositBal2)}
        poolBal ${hre.ethers.utils.formatEther(poolBal)}
        governors ${governors}
        `);
    });

    it("withdraw...", async () => {
        let depositBal1 = await this.colletiveFundingPoolContract.balanceOf(this.collectiveDirectdaoAddress, this.owner.address);
        let depositBal2 = await this.colletiveFundingPoolContract.balanceOf(this.collectiveDirectdaoAddress, this.investor1.address);
        let poolBal = await this.colletiveFundingPoolContract.poolBalance(this.collectiveDirectdaoAddress);
        let allInvestors = await this.colletiveFundingPoolContract.getAllInvestors(this.collectiveDirectdaoAddress);
        let usdtBal1 = await this.testtoken1.balanceOf(this.owner.address);
        let usdtBal2 = await this.testtoken1.balanceOf(this.investor1.address);

        console.log(`
        depositBal1 ${hre.ethers.utils.formatEther(depositBal1)}
        depositBal2 ${hre.ethers.utils.formatEther(depositBal2)}
        poolBal ${hre.ethers.utils.formatEther(poolBal)}
        allInvestors ${allInvestors}
        usdtBal1 ${hre.ethers.utils.formatEther(usdtBal1)}
        usdtBal2 ${hre.ethers.utils.formatEther(usdtBal2)}
        `);

        await this.colletiveFundingPoolContract.connect(this.owner).withdraw(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("1000"));
        await this.colletiveFundingPoolContract.connect(this.investor1).withdraw(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("500"));
        // await this.colletiveFundingPoolContract.connect(this.investor1).withdraw(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("100"));

        let governors = await this.colletiveGovernorManagementContract.getAllGovernor(this.collectiveDirectdaoAddress);

        depositBal1 = await this.colletiveFundingPoolContract.balanceOf(this.collectiveDirectdaoAddress, this.owner.address);
        depositBal2 = await this.colletiveFundingPoolContract.balanceOf(this.collectiveDirectdaoAddress, this.investor1.address);
        poolBal = await this.colletiveFundingPoolContract.poolBalance(this.collectiveDirectdaoAddress);
        allInvestors = await this.colletiveFundingPoolContract.getAllInvestors(this.collectiveDirectdaoAddress);
        usdtBal1 = await this.testtoken1.balanceOf(this.owner.address);
        usdtBal2 = await this.testtoken1.balanceOf(this.investor1.address);

        console.log(`
        depositBal1 ${hre.ethers.utils.formatEther(depositBal1)}
        depositBal2 ${hre.ethers.utils.formatEther(depositBal2)}
        poolBal ${hre.ethers.utils.formatEther(poolBal)}
        allInvestors ${allInvestors}
        usdtBal1 ${hre.ethers.utils.formatEther(usdtBal1)}
        usdtBal2 ${hre.ethers.utils.formatEther(usdtBal2)}
        governors ${governors}
        `);
    });
});

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
        this.flexVestingERC721 = utilContracts.flexVestingERC721.instance;
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
        this.summonCollectiveDao = this.adapters.summonCollectiveDao.instance;

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
            collectiveDaoGenesisGovernor
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
        await this.collectiveVotingContract.connect(this.genesis_steward1).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward2).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        console.log("voted, execute...");
        const stopVoteTime = proposalDetail.stopVoteTime;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.colletiveFundRaiseProposalContract.processProposal(this.collectiveDirectdaoAddress, proposalId);
        proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(this.collectiveDirectdaoAddress, proposalId);

        console.log(`
        executed...
        fund raise proposal state ${proposalDetail.state}
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
        const vestingInfo = [
            startTime,
            endTime,
            cliffEndTime,
            cliffVestingAmount,
            vestingInterval
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
        await this.collectiveVotingContract.connect(this.genesis_steward1).submitVote(dao,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward2).submitVote(dao,
            proposalId,
            1
        );

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
});

describe("clear fund...", () => {

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
        this.flexVestingERC721 = utilContracts.flexVestingERC721.instance;
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
            collectiveDaoGenesisGovernor
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

    it("clear fund && withdraw....", async () => {
        let dao = this.collectiveDirectdaoAddress;
        let tokenAddress = this.testtoken1.address;
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

        let startTime = blocktimestamp + 60 * 1;
        let endTime = startTime + 60 * 60 * 2;
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
        console.log(`
            fund raise proposal created...
            proposalId ${proposalId}
            vote for fund raise proposal...
        `);

        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward1).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward2).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        console.log("voted, execute...");
        let proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(this.collectiveDirectdaoAddress, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.colletiveFundRaiseProposalContract.processProposal(this.collectiveDirectdaoAddress, proposalId);
        proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(this.collectiveDirectdaoAddress, proposalId);

        console.log(`
        executed...
        fund raise proposal state ${proposalDetail.state}
        deposit...
        `);

        await this.testtoken1.approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));
        await this.testtoken1.connect(this.investor1).approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));
        await this.testtoken1.connect(this.investor2).approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("2000"));
        await this.testtoken1.transfer(this.investor2.address, hre.ethers.utils.parseEther("2000"));

        await this.colletiveFundingPoolContract.deposit(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("1000"));
        await this.colletiveFundingPoolContract.connect(this.investor1).deposit(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("500"));

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(endTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(endTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        await this.colletiveFundingPoolContract.processFundRaise(this.collectiveDirectdaoAddress);
        const fundState = await this.colletiveFundingPoolContract.fundState(this.collectiveDirectdaoAddress);
        console.log(`
        fund state ${fundState}
        clear fund...
        `);

        await this.colletiveFundingPoolContract.clearFund(this.collectiveDirectdaoAddress);

        let escrowedAmount1 = await this.collectiveEscrowFundAdapterContract.escrowFunds(
            this.collectiveDirectdaoAddress,
            tokenAddress,
            this.owner.address
        );
        let escrowedAmount2 = await this.collectiveEscrowFundAdapterContract.escrowFunds(
            this.collectiveDirectdaoAddress,
            tokenAddress,
            this.investor1.address
        );

        let USDTBal1 = await this.testtoken1.balanceOf(this.owner.address);
        let USDTBal2 = await this.testtoken1.balanceOf(this.investor1.address);

        console.log(`
        USDTBal1 ${hre.ethers.utils.formatEther(USDTBal1)}
        USDTBal2 ${hre.ethers.utils.formatEther(USDTBal2)}

        escrowedAmount1 ${hre.ethers.utils.formatEther(escrowedAmount1)}
        escrowedAmount2 ${hre.ethers.utils.formatEther(escrowedAmount2)}
        claime...
        `);

        await this.collectiveEscrowFundAdapterContract.connect(this.owner).withdraw(this.collectiveDirectdaoAddress, tokenAddress);
        await this.collectiveEscrowFundAdapterContract.connect(this.investor1).withdraw(this.collectiveDirectdaoAddress, tokenAddress);


        USDTBal1 = await this.testtoken1.balanceOf(this.owner.address);
        USDTBal2 = await this.testtoken1.balanceOf(this.investor1.address);
        escrowedAmount1 = await this.collectiveEscrowFundAdapterContract.escrowFunds(
            this.collectiveDirectdaoAddress,
            tokenAddress,
            this.owner.address
        );
        escrowedAmount2 = await this.collectiveEscrowFundAdapterContract.escrowFunds(
            this.collectiveDirectdaoAddress,
            tokenAddress,
            this.investor1.address
        );

        console.log(`
        USDTBal1 ${hre.ethers.utils.formatEther(USDTBal1)}
        USDTBal2 ${hre.ethers.utils.formatEther(USDTBal2)}
        escrowedAmount1 ${hre.ethers.utils.formatEther(escrowedAmount1)}
        escrowedAmount2 ${hre.ethers.utils.formatEther(escrowedAmount2)}
        `);

    });
});

describe("daoset...", () => {
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
        this.flexVestingERC721 = utilContracts.flexVestingERC721.instance;
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
        this.summonCollectiveDao = this.adapters.summonCollectiveDao.instance;

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
            collectiveDaoGenesisGovernor
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

    it("governor membership proposal...", async () => {
        const enable = true;
        const varifyType = 3;
        const minAmount = 2;
        const tokenAddress = this.testtoken2.address;
        const tokenId = 2;
        const whiteList = [
            this.user1.address
        ];

        let COLLECTIVE_GOVERNOR_MEMBERSHIP_ENABLE = await this.daoContract.getConfiguration(sha3("COLLECTIVE_GOVERNOR_MEMBERSHIP_ENABLE"));
        let COLLECTIVE_GOVERNOR_MEMBERSHIP_TYPE = await this.daoContract.getConfiguration(sha3("COLLECTIVE_GOVERNOR_MEMBERSHIP_TYPE"));
        let COLLECTIVE_GOVERNOR_MEMBERSHIP_MINI_HOLDING = await this.daoContract.getConfiguration(sha3("COLLECTIVE_GOVERNOR_MEMBERSHIP_MINI_HOLDING"));
        let COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS = await this.daoContract.getAddressConfiguration(sha3("COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS"));
        let COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ID = await this.daoContract.getConfiguration(sha3("COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ID"));
        let COLLECTIVE_GOVERNOR_MEMBERSHIP_WHITELIST = await this.colletiveGovernorManagementContract.getGovernorWhitelist(this.collectiveDirectdaoAddress);
        console.log(`
        COLLECTIVE_GOVERNOR_MEMBERSHIP_ENABLE ${COLLECTIVE_GOVERNOR_MEMBERSHIP_ENABLE}
        COLLECTIVE_GOVERNOR_MEMBERSHIP_TYPE ${COLLECTIVE_GOVERNOR_MEMBERSHIP_TYPE}
        COLLECTIVE_GOVERNOR_MEMBERSHIP_MINI_HOLDING ${COLLECTIVE_GOVERNOR_MEMBERSHIP_MINI_HOLDING}
        COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS ${COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS}
        COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ID ${COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ID}
        COLLECTIVE_GOVERNOR_MEMBERSHIP_WHITELIST ${COLLECTIVE_GOVERNOR_MEMBERSHIP_WHITELIST}
        `);

        const tx = await this.colletiveDaoSetProposalContract.submitGovernorMembershpProposal(
            this.collectiveDirectdaoAddress,
            enable,
            varifyType,
            minAmount,
            tokenAddress,
            tokenId,
            whiteList
        );
        const rel = await tx.wait();

        const proposalId = rel.events[rel.events.length - 1].args.proposalId;
        console.log(`
        created... ${proposalId}
        voting...
        `);
        let proposalDetail = await this.colletiveDaoSetProposalContract.governorMembershipProposals(
            this.collectiveDirectdaoAddress,
            proposalId
        );

        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward1).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward2).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalDetail.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalDetail.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        console.log(`
        voted...
        execute...
        `);

        await this.colletiveDaoSetProposalContract.processGovernorMembershipProposal(
            this.collectiveDirectdaoAddress,
            proposalId
        );

        proposalDetail = await this.colletiveDaoSetProposalContract.governorMembershipProposals(
            this.collectiveDirectdaoAddress,
            proposalId
        );

        COLLECTIVE_GOVERNOR_MEMBERSHIP_ENABLE = await this.daoContract.getConfiguration(sha3("COLLECTIVE_GOVERNOR_MEMBERSHIP_ENABLE"));
        COLLECTIVE_GOVERNOR_MEMBERSHIP_TYPE = await this.daoContract.getConfiguration(sha3("COLLECTIVE_GOVERNOR_MEMBERSHIP_TYPE"));
        COLLECTIVE_GOVERNOR_MEMBERSHIP_MINI_HOLDING = await this.daoContract.getConfiguration(sha3("COLLECTIVE_GOVERNOR_MEMBERSHIP_MINI_HOLDING"));
        COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS = await this.daoContract.getAddressConfiguration(sha3("COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS"));
        COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ID = await this.daoContract.getConfiguration(sha3("COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ID"));
        COLLECTIVE_GOVERNOR_MEMBERSHIP_WHITELIST = await this.colletiveGovernorManagementContract.getGovernorWhitelist(this.collectiveDirectdaoAddress);

        console.log(`
        executed...
        state ${proposalDetail.state}
        COLLECTIVE_GOVERNOR_MEMBERSHIP_ENABLE ${COLLECTIVE_GOVERNOR_MEMBERSHIP_ENABLE}
        COLLECTIVE_GOVERNOR_MEMBERSHIP_TYPE ${COLLECTIVE_GOVERNOR_MEMBERSHIP_TYPE}
        COLLECTIVE_GOVERNOR_MEMBERSHIP_MINI_HOLDING ${COLLECTIVE_GOVERNOR_MEMBERSHIP_MINI_HOLDING}
        COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS ${COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS}
        COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ID ${COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ID}
        COLLECTIVE_GOVERNOR_MEMBERSHIP_WHITELIST ${COLLECTIVE_GOVERNOR_MEMBERSHIP_WHITELIST}
        `);
    });
    it("voting proposal...", async () => {
        const votingAssetType = 0;
        const tokenAddress = ZERO_ADDRESS;
        const tokenID = 1;
        const votingWeightedType = 0;
        const supportType = 1;
        const quorumType = 1;
        const support = 43;
        const quorum = 33;
        const votingPeriod = 60 * 100;
        const executingPeriod = 60 * 2;

        const params = [votingAssetType,
            tokenAddress,
            tokenID,
            votingWeightedType,
            supportType,
            quorumType,
            support,
            quorum,
            votingPeriod,
            executingPeriod
        ];

        const tx = await this.colletiveDaoSetProposalContract.submitVotingProposal(
            this.collectiveDirectdaoAddress,
            params
        );
        const rel = await tx.wait();
        const proposalId = rel.events[rel.events.length - 1].args.proposalId;


        let COLLECTIVE_VOTING_ASSET_TYPE = await this.daoContract.getConfiguration(sha3("COLLECTIVE_VOTING_ASSET_TYPE"));
        let COLLECTIVE_VOTING_WEIGHTED_TYPE = await this.daoContract.getConfiguration(sha3("COLLECTIVE_VOTING_WEIGHTED_TYPE"));
        let COLLECTIVE_VOTING_SUPPORT_TYPE = await this.daoContract.getConfiguration(sha3("COLLECTIVE_VOTING_SUPPORT_TYPE"));
        let COLLECTIVE_VOTING_QUORUM_TYPE = await this.daoContract.getConfiguration(sha3("COLLECTIVE_VOTING_QUORUM_TYPE"));
        let QUORUM = await this.daoContract.getConfiguration(sha3("QUORUM"));
        let VOTING_PERIOD = await this.daoContract.getConfiguration(sha3("VOTING_PERIOD"));
        let PROPOSAL_EXECUTE_DURATION = await this.daoContract.getConfiguration(sha3("PROPOSAL_EXECUTE_DURATION"));

        console.log(`
        COLLECTIVE_VOTING_ASSET_TYPE ${COLLECTIVE_VOTING_ASSET_TYPE}
        COLLECTIVE_VOTING_WEIGHTED_TYPE ${COLLECTIVE_VOTING_WEIGHTED_TYPE}
        COLLECTIVE_VOTING_SUPPORT_TYPE ${COLLECTIVE_VOTING_SUPPORT_TYPE}
        COLLECTIVE_VOTING_QUORUM_TYPE ${COLLECTIVE_VOTING_QUORUM_TYPE}
        QUORUM ${QUORUM}
        VOTING_PERIOD ${VOTING_PERIOD}
        PROPOSAL_EXECUTE_DURATION ${PROPOSAL_EXECUTE_DURATION}

        created... ${proposalId}
        voting...
        `);

        let proposalDetail = await this.colletiveDaoSetProposalContract.votingProposals(
            this.collectiveDirectdaoAddress,
            proposalId
        );

        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward1).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward2).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalDetail.timeInfo.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalDetail.timeInfo.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        console.log(`
        voted...
        execute...
        `);

        await this.colletiveDaoSetProposalContract.processVotingProposal(
            this.collectiveDirectdaoAddress,
            proposalId
        );

        proposalDetail = await this.colletiveDaoSetProposalContract.votingProposals(
            this.collectiveDirectdaoAddress,
            proposalId
        );

        COLLECTIVE_VOTING_ASSET_TYPE = await this.daoContract.getConfiguration(sha3("COLLECTIVE_VOTING_ASSET_TYPE"));
        COLLECTIVE_VOTING_WEIGHTED_TYPE = await this.daoContract.getConfiguration(sha3("COLLECTIVE_VOTING_WEIGHTED_TYPE"));
        COLLECTIVE_VOTING_SUPPORT_TYPE = await this.daoContract.getConfiguration(sha3("COLLECTIVE_VOTING_SUPPORT_TYPE"));
        COLLECTIVE_VOTING_QUORUM_TYPE = await this.daoContract.getConfiguration(sha3("COLLECTIVE_VOTING_QUORUM_TYPE"));
        QUORUM = await this.daoContract.getConfiguration(sha3("QUORUM"));
        VOTING_PERIOD = await this.daoContract.getConfiguration(sha3("VOTING_PERIOD"));
        PROPOSAL_EXECUTE_DURATION = await this.daoContract.getConfiguration(sha3("PROPOSAL_EXECUTE_DURATION"));

        console.log(`
        executed...
        state ${proposalDetail.state}
        COLLECTIVE_VOTING_ASSET_TYPE ${COLLECTIVE_VOTING_ASSET_TYPE}
        COLLECTIVE_VOTING_WEIGHTED_TYPE ${COLLECTIVE_VOTING_WEIGHTED_TYPE}
        COLLECTIVE_VOTING_SUPPORT_TYPE ${COLLECTIVE_VOTING_SUPPORT_TYPE}
        COLLECTIVE_VOTING_QUORUM_TYPE ${COLLECTIVE_VOTING_QUORUM_TYPE}
        QUORUM ${QUORUM}
        VOTING_PERIOD ${VOTING_PERIOD}
        PROPOSAL_EXECUTE_DURATION ${PROPOSAL_EXECUTE_DURATION}
        `);
    });
    it("member cap proposal...", async () => {
        const enable = true;
        const cap = 10;
        const tx = await this.colletiveDaoSetProposalContract.submitInvestorCapProposal(
            this.collectiveDirectdaoAddress,
            enable,
            cap);
        const rel = await tx.wait();

        const proposalId = rel.events[rel.events.length - 1].args.proposalId;

        let MAX_INVESTORS_ENABLE = await this.daoContract.getConfiguration(sha3("MAX_INVESTORS_ENABLE"));
        let MAX_INVESTORS = await this.daoContract.getConfiguration(sha3("MAX_INVESTORS"));

        console.log(`
        created... ${proposalId}
        MAX_INVESTORS_ENABLE ${MAX_INVESTORS_ENABLE}
        MAX_INVESTORS ${MAX_INVESTORS}

        voting...
        `);
        let proposalDetail = await this.colletiveDaoSetProposalContract.investorCapProposals(this.collectiveDirectdaoAddress,
            proposalId);

        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward1).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward2).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalDetail.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalDetail.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        console.log(`
            voted...
            execute...
            `);

        await this.colletiveDaoSetProposalContract.processInvestorCapProposal(
            this.collectiveDirectdaoAddress,
            proposalId);
        proposalDetail = await this.colletiveDaoSetProposalContract.investorCapProposals(this.collectiveDirectdaoAddress,
            proposalId);

        MAX_INVESTORS_ENABLE = await this.daoContract.getConfiguration(sha3("MAX_INVESTORS_ENABLE"));
        MAX_INVESTORS = await this.daoContract.getConfiguration(sha3("MAX_INVESTORS"));

        console.log(`
        state ${proposalDetail.state}
        MAX_INVESTORS_ENABLE ${MAX_INVESTORS_ENABLE}
        MAX_INVESTORS ${MAX_INVESTORS}
        `);
    });
    it("fees proposal...", async () => {
        const redemptionFee = hre.ethers.utils.parseEther("0.0002")
        const tx = await this.colletiveDaoSetProposalContract.submitFeesProposal(
            this.collectiveDirectdaoAddress,
            redemptionFee
        );

        const rel = await tx.wait();

        const proposalId = rel.events[rel.events.length - 1].args.proposalId;
        let COLLECTIVE_REDEMPT_FEE_AMOUNT = await this.daoContract.getConfiguration(sha3("COLLECTIVE_REDEMPT_FEE_AMOUNT"));

        console.log(`
        created... ${proposalId}
        COLLECTIVE_REDEMPT_FEE_AMOUNT ${COLLECTIVE_REDEMPT_FEE_AMOUNT}
        voting...
        `);

        let proposalDetail = await this.colletiveDaoSetProposalContract.feesProposals(this.collectiveDirectdaoAddress,
            proposalId);

        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward1).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward2).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalDetail.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalDetail.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        console.log(`
            voted...
            execute...
            `);

        await this.colletiveDaoSetProposalContract.processFeesProposal(
            this.collectiveDirectdaoAddress,
            proposalId
        );

        COLLECTIVE_REDEMPT_FEE_AMOUNT = await this.daoContract.getConfiguration(sha3("COLLECTIVE_REDEMPT_FEE_AMOUNT"));
        proposalDetail = await this.colletiveDaoSetProposalContract.feesProposals(this.collectiveDirectdaoAddress,
            proposalId);

        console.log(`
        executed...
        state ${proposalDetail.state}
        COLLECTIVE_REDEMPT_FEE_AMOUNT ${COLLECTIVE_REDEMPT_FEE_AMOUNT}
        `);

    });
    it("proposer reward proposal...", async () => {
        const fundFromInvestorAmount = hre.ethers.utils.parseEther("0.0002");
        const paybackTokenFromInvestorAmount = hre.ethers.utils.parseEther("0.0003");
        const tx = await this.colletiveDaoSetProposalContract.submitProposerRewardProposal(
            this.collectiveDirectdaoAddress,
            fundFromInvestorAmount,
            paybackTokenFromInvestorAmount
        );

        const rel = await tx.wait();

        const proposalId = rel.events[rel.events.length - 1].args.proposalId;
        let COLLECTIVE_PROPOSER_INVEST_TOKEN_REWARD_AMOUNT = await this.daoContract.getConfiguration(sha3("COLLECTIVE_PROPOSER_INVEST_TOKEN_REWARD_AMOUNT"));
        let COLLECTIVE_PROPOSER_PAYBACK_TOKEN_REWARD_AMOUNT = await this.daoContract.getConfiguration(sha3("COLLECTIVE_PROPOSER_PAYBACK_TOKEN_REWARD_AMOUNT"));

        console.log(
            `
        created... ${proposalId}
        COLLECTIVE_PROPOSER_INVEST_TOKEN_REWARD_AMOUNT ${COLLECTIVE_PROPOSER_INVEST_TOKEN_REWARD_AMOUNT}
        COLLECTIVE_PROPOSER_PAYBACK_TOKEN_REWARD_AMOUNT ${COLLECTIVE_PROPOSER_PAYBACK_TOKEN_REWARD_AMOUNT}
        voting...
        `);

        let proposalDetail = await this.colletiveDaoSetProposalContract.proposerRewardProposals(this.collectiveDirectdaoAddress,
            proposalId);

        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward1).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward2).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(proposalDetail.stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(proposalDetail.stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        console.log(`
            voted...
            execute...
            `);


        await this.colletiveDaoSetProposalContract.processProposerRewardProposal(
            this.collectiveDirectdaoAddress,
            proposalId
        );

        COLLECTIVE_PROPOSER_INVEST_TOKEN_REWARD_AMOUNT = await this.daoContract.getConfiguration(sha3("COLLECTIVE_PROPOSER_INVEST_TOKEN_REWARD_AMOUNT"));
        COLLECTIVE_PROPOSER_PAYBACK_TOKEN_REWARD_AMOUNT = await this.daoContract.getConfiguration(sha3("COLLECTIVE_PROPOSER_PAYBACK_TOKEN_REWARD_AMOUNT"));
        proposalDetail = await this.colletiveDaoSetProposalContract.proposerRewardProposals(
            this.collectiveDirectdaoAddress,
            proposalId
        );

        console.log(`
            executed...
            state ${proposalDetail.state}
            COLLECTIVE_PROPOSER_INVEST_TOKEN_REWARD_AMOUNT ${COLLECTIVE_PROPOSER_INVEST_TOKEN_REWARD_AMOUNT}
            COLLECTIVE_PROPOSER_PAYBACK_TOKEN_REWARD_AMOUNT ${COLLECTIVE_PROPOSER_PAYBACK_TOKEN_REWARD_AMOUNT}
        `);

    });

});

describe("expense...", () => {
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
        this.flexVestingERC721 = utilContracts.flexVestingERC721.instance;
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
        this.summonCollectiveDao = this.adapters.summonCollectiveDao.instance;

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
                flags: 22
            },
            {
                id: '0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab',
                addr: this.collectiveDistributeAdatperContract.address, // vintageDistrubteAdapterContract
                flags: 18
            },
            {
                id: '0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab',
                addr: this.colletiveExpenseProposalContract.address, // colletiveExpenseProposalContract
                flags: 18
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
            collectiveDaoGenesisGovernor
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

    it("submit expense proposal...", async () => {
        const dao = this.collectiveDirectdaoAddress;
        const tokenAddress = this.testtoken1.address;
        const miniTarget = hre.ethers.utils.parseEther("1000");
        const maxCap = hre.ethers.utils.parseEther("1500");
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

        const startTime = blocktimestamp + 60 * 1;
        const endTime = startTime + 60 * 60 * 2;
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
        console.log(`
            created...
            proposalId ${proposalId}
        `);

        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward1).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward2).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        console.log("voted, execute...");
        let proposalDetail = await this.colletiveFundRaiseProposalContract.proposals(this.collectiveDirectdaoAddress, proposalId);
        const stopVoteTime = proposalDetail.stopVoteTime;

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
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
        await this.testtoken1.connect(this.investor2).approve(this.colletiveFundingPoolContract.address, hre.ethers.utils.parseEther("2000"));

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("2000"));
        await this.testtoken1.transfer(this.investor2.address, hre.ethers.utils.parseEther("2000"));

        await this.colletiveFundingPoolContract.deposit(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("1000"));
        await this.colletiveFundingPoolContract.connect(this.investor1).deposit(this.collectiveDirectdaoAddress, hre.ethers.utils.parseEther("500"));

        const token = this.testtoken1.address;
        const receiver = this.user1.address;
        const amount = hre.ethers.utils.parseEther("100");

        const tx1 = await this.colletiveExpenseProposalContract.summbitProposal(
            this.collectiveDirectdaoAddress,
            token,
            receiver,
            amount
        );

        const rel1 = await tx1.wait();

        const proposalId1 = rel1.events[rel.events.length - 1].args.proposalId;
        let proposalDetail1 = await this.colletiveExpenseProposalContract.proposals(
            this.collectiveDirectdaoAddress,
            proposalId1
        );
        let receiverUSDBal = await this.testtoken1.balanceOf(receiver);
        let depositBal1 = await this.colletiveFundingPoolContract.balanceOfToken(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.owner.address
        );
        let depositBal2 = await this.colletiveFundingPoolContract.balanceOfToken(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.investor1.address
        );
        let poolBal = await this.colletiveFundingPoolContract.poolBalance(this.collectiveDirectdaoAddress);

        console.log(`
        created...
        proposalId ${proposalId1}
        proposalDetail ${proposalDetail1}
        receiverUSDBal ${hre.ethers.utils.formatEther(receiverUSDBal)}
        depositBal1 ${hre.ethers.utils.formatEther(depositBal1)}
        depositBal2 ${hre.ethers.utils.formatEther(depositBal2)}
        poolBal ${hre.ethers.utils.formatEther(poolBal)}

        voting...
        `);

        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress,
            proposalId1,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward1).submitVote(this.collectiveDirectdaoAddress,
            proposalId1,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward2).submitVote(this.collectiveDirectdaoAddress,
            proposalId1,
            1
        );
        console.log("voted, execute...");

        const stopVoteTime1 = proposalDetail1.stopVoteTime;

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime1) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime1) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await this.colletiveExpenseProposalContract.processProposal(
            this.collectiveDirectdaoAddress,
            proposalId1);
        receiverUSDBal = await this.testtoken1.balanceOf(receiver);
        depositBal1 = await this.colletiveFundingPoolContract.balanceOfToken(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.owner.address
        );
        depositBal2 = await this.colletiveFundingPoolContract.balanceOfToken(
            this.collectiveDirectdaoAddress,
            this.testtoken1.address,
            this.investor1.address
        );
        poolBal = await this.colletiveFundingPoolContract.poolBalance(this.collectiveDirectdaoAddress);
        console.log(`
        executed...
        receiverUSDBal ${hre.ethers.utils.formatEther(receiverUSDBal)}
        depositBal1 ${hre.ethers.utils.formatEther(depositBal1)}
        depositBal2 ${hre.ethers.utils.formatEther(depositBal2)}
        poolBal ${hre.ethers.utils.formatEther(poolBal)}
        `);



    });
});

describe("topup proposal...", () => {
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
        this.flexVestingERC721 = utilContracts.flexVestingERC721.instance;
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
        this.summonCollectiveDao = this.adapters.summonCollectiveDao.instance;

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
                flags: 22
            },
            {
                id: '0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab',
                addr: this.collectiveDistributeAdatperContract.address, // vintageDistrubteAdapterContract
                flags: 18
            },
            {
                id: '0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab',
                addr: this.colletiveExpenseProposalContract.address, // colletiveExpenseProposalContract
                flags: 18
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
            collectiveDaoGenesisGovernor
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

    it("submit topup proposal...", async () => {
        const token = this.testtoken1.address;
        const amount = hre.ethers.utils.parseEther("10000");
        const tx = await this.colletiveTopUpProposalContract.summbitProposal(
            this.collectiveDirectdaoAddress,
            token,
            amount
        );

        const rel = await tx.wait();
        const proposalId = rel.events[rel.events.length - 1].args.proposalId;
        console.log(`
            submitted. proposalId ${proposalId}
            approve...
        `);

        await this.testtoken1.approve(this.colletiveFundingPoolContract.address, amount);

        console.log(`
            approved...
            start voting...
        `);

        await this.colletiveTopUpProposalContract.startVoting(this.collectiveDirectdaoAddress,
            proposalId
        );

        let proposalInfo = await this.colletiveTopUpProposalContract.proposals(this.collectiveDirectdaoAddress,
            proposalId
        );

        console.log(`
            state ${proposalInfo.state}
            voting...
        `);

        await this.collectiveVotingContract.connect(this.owner).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward1).submitVote(this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        await this.collectiveVotingContract.connect(this.genesis_steward2).submitVote(
            this.collectiveDirectdaoAddress,
            proposalId,
            1
        );
        let depositAmount = await this.colletiveFundingPoolContract.balanceOf(this.collectiveDirectdaoAddress, this.owner.address);

        console.log("voted, execute...");

        const stopVoteTime = proposalInfo.stopVoteTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(stopVoteTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(stopVoteTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        const voteRel = await this.collectiveVotingContract.voteResult(
            this.collectiveDirectdaoAddress,
            proposalId
        );

        console.log(`
        depositAmount ${hre.ethers.utils.formatEther(depositAmount)}
        voteRel ${voteRel}
        `);

        await this.colletiveTopUpProposalContract.processProposal(this.collectiveDirectdaoAddress,
            proposalId);


        proposalInfo = await this.colletiveTopUpProposalContract.proposals(this.collectiveDirectdaoAddress,
            proposalId
        );

        depositAmount = await this.colletiveFundingPoolContract.balanceOf(this.collectiveDirectdaoAddress, this.owner.address);

        console.log(`
            executed...
            state ${proposalInfo.state}
            depositAmount ${hre.ethers.utils.formatEther(depositAmount)}
        `);


    });
});