/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-12-19 13:50:51
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-02-03 14:51:58
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
} = require("../utils/contract-util");
const { checkBalance, depositToFundingPool, createDistributeFundsProposal } = require("../utils/test-util");

const {
    expectRevert,
    expect,
    DaoFactory,
    DaoRegistry,
    FundingPoolExtension,
    web3,
    accounts
} = require("../utils/oz-util");

import { exec } from "child_process";
import {
    DaoFactory,
    DaoRegistry,
    FundingPoolExtension,
    deployDefaultDao,
    takeChainSnapshot,
    revertChainSnapshot, proposalIdGenerator, expect, expectRevert, web3
} from "../utils/hh-util";
import { createDao } from "../utils/deployment-util1";
import { zeroPad } from "ethers/lib/utils";
import { boolean } from "hardhat/internal/core/params/argumentTypes";
const hre = require("hardhat");

describe("Summon A Vintage Dao", () => {
    before("initialize...", async () => {
        let [owner,
            user1, user2,
            investor1, investor2, investor3, investor4, investor5, investor6,
            gp1, gp2,
            project_team1, project_team2,
            genesis_raiser1, genesis_raiser2,
            raiser_whitelist1, raiser_whitelist2,
            managementFeeAccount] = await hre.ethers.getSigners();
        this.owner = owner;
        this.user1 = user1;
        this.user2 = user2;
        this.investor1 = investor1;
        this.investor2 = investor2;
        this.investor3 = investor3;
        this.investor4 = investor4;
        this.investor5 = investor5;
        this.investor6 = investor6;
        this.gp1 = gp1;
        this.gp2 = gp2;
        this.project_team1 = project_team1;
        this.project_team2 = project_team2;
        this.genesis_raiser1 = genesis_raiser1;
        this.genesis_raiser2 = genesis_raiser2;
        this.raiser_whitelist1 = raiser_whitelist1;
        this.raiser_whitelist2 = raiser_whitelist2;
        this.managementFeeAccount = managementFeeAccount;
        const _daoName = "1234";

        const { dao, factories, adapters, extensions, testContracts } = await deployDefaultDao({
            owner: this.owner,
            daoMode: 0,//  Vintage = 0, Flex = 1,   Collective = 2,
            daoName: _daoName
        });
        this.adapters = adapters;
        this.extensions = extensions;
        this.dao = dao;
        this.testContracts = testContracts;
        this.testtoken1 = testContracts.testToken1.instance
        this.testtoken2 = testContracts.testToken2.instance
        this.fundingPoolExt = this.extensions.fundingpoolExt.functions;
        this.gpdaoExt = this.extensions.gpDaoExt.functions;
        this.allocationAdapter = this.adapters.allocationv2.instance;
        this.gpvoting = this.adapters.gpVotingAdapter.instance;
        this.distributeFundAdapterv2 = this.adapters.distributeFundAdapterv2.instance;
        this.fundingpoolAdapter = this.adapters.fundingpoolAdapter.instance;
        this.gpdaoAdapter = this.adapters.gpdaoAdapter.instance;
        this.furoVesting = this.adapters.furoVesting.instance;
        this.bentoBoxV1 = this.adapters.bentoBoxV1.instance;
        this.fundRaiseAdapter = this.adapters.fundRaiseAdapter.instance;
        this.gpKickAdapter = this.adapters.gpKickAdapter.instance;
        this.gpDaoOnboardingAdapter = this.adapters.gpDaoOnboardingAdapter.instance;
        this.managing = this.adapters.managing.instance
        this.gpOnboardVotingAdapter = this.adapters.gpOnboardVotingAdapter.instance;
        this.vestingAdapter = this.adapters.furoVesting.instance;

        this.summonDao = this.adapters.summonDao.instance;

        this.snapshotId = await takeChainSnapshot();

        this.daoFactory = factories.daoFactory.instance;
        this.fundingPoolExtFactory = factories.fundingPoolExtFactory.instance;
        // this.flexFundingPoolFactory = factories.flexFundingPoolFactory.instance;
        this.gpDaoExtFactory = factories.gpDaoExtFactory.instance;

    });

    it("summon a vintage dao...", async () => {
        const _daoName = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

        console.log("create dao...")
        const { dao, name } = await createDao(
            {
                daoFactory: this.daoFactory,
                creator: this.owner.address,
                name: _daoName
            });

        const daoName = await this.daoFactory.daos(dao.address);
        console.log(`
        new dao addr ${dao.address}
        new dao name ${toUtf8(daoName)}
        `);

        console.log(`
            create funding pool extension...
        `);
        await this.fundingPoolExtFactory.create(dao.address);
        const fundingPoolExtensionAddress = await this.fundingPoolExtFactory.getExtensionAddress(
            dao.address
        );

        console.log(`
                add funding pool extension to dao...
        `);
        await dao.addExtension(
            sha3("funding-pool-ext"),
            fundingPoolExtensionAddress,
            this.owner.address
        );

        console.log(`
            create gp dao extension...
        `);
        await this.gpDaoExtFactory.create(dao.address);
        const gpDaoExtensionAddress = await this.gpDaoExtFactory.getExtensionAddress(
            dao.address
        );

        console.log(`
                add gp dao extension to dao...
        `);
        await dao.addExtension(
            sha3("gp-dao-ext"),
            gpDaoExtensionAddress,
            this.owner.address
        );


        console.log(`
        configure adapters ...
            add adapters to dao...
        `);
        const contractsWithAccess = [
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0x552a230dd619d2fa767bf60d9fc3ece302bde1086b9d69a14d6a843b45512ccc',//vesting
                addr: this.furoVesting.address,
                flags: 0
            },
            {
                id: '0x22c3b3d75fb899a52b9cd1992cc735762639e44483f728c4cd25708d873635d7',//fund-raise
                addr: this.fundRaiseAdapter.address,
                flags: 10
            },
            {
                id: '0xdb58310e103437f6124e14b8b20969775f28cbf97188fd0c2cb5ba69dcad2c4b',// gp kick
                addr: this.gpKickAdapter.address,
                flags: 258
            },
            {
                id: '0x64fc27b0ff66ecc06f04211511833a21b1c6af3e8efd8dae1412a70557586368',//gp-dao-onboarding
                addr: this.gpDaoOnboardingAdapter.address,
                flags: 258
            },
            {
                id: '0xf26d4834b4a91110d15379eda333e30be707af3a839ee5dbd668b89e4c6c6f6f',//founding-pool
                addr: this.fundingpoolAdapter.address,
                flags: 64
            },
            {
                id: '0xf150ecc391a74d51eebe4e31251217b187da568384d2b31171b9915d6f8fdd51',//gp-dao
                addr: this.gpdaoAdapter.address,
                flags: 0
            },
            {
                id: '0x2a014d63456a24764c5dba5876cafc75ecbe2d639a1af4060fe13c6f50d4ba20',//distribute-fundv2
                addr: this.distributeFundAdapterv2.address,
                flags: 266
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//managing
                addr: this.managing.address,
                flags: 59
            },
            {
                id: '0x60c070b9a72ac4c8e5f956ed17fe8117b5ec87b0ceefa6de23348ec16fc8b9ea',//gp-onboard-voting
                addr: this.gpOnboardVotingAdapter.address,
                flags: 8
            },
            {
                id: '0x0272405e7a7e2834b06b48bd0de471bbb4d8400020ec22f05b6fc30ffddb34a8',// gp-voting
                addr: this.gpvoting.address,
                flags: 8
            },
            {
                id: '0x71c8887ab5df33af0f26db43a2e569d7268b592b16c505d22229eabd80eb8f36',//allocationv2
                addr: this.allocationAdapter.address,
                flags: 8
            },
            {
                id: '0x67e84d3ef18b24e32f9a9b2e9bac9e7ea8cde2f146ce512d44b9d6718a1f3ca0',//gp-dao-ext
                addr: this.extensions.gpDaoExt.address,
                flags: 0
            }
        ]
        await this.daoFactory.addAdapters(dao.address, contractsWithAccess);

        console.log(`
            configure adapters access to extensions ...
        `);
        //FundingPoolExtension
        let withAccess = [
            {
                id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4', //FundingPoolExtension
                addr: this.fundingpoolAdapter.address,//FundingPoolAdapterContract
                flags: 15903
            },
            {
                id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4', //FundingPoolExtension
                addr: this.distributeFundAdapterv2.address,//DistributeFundContractV2
                flags: 242
            }
        ];
        await this.daoFactory.configureExtension(
            dao.address,
            fundingPoolExtensionAddress,//FundingPoolExtension
            withAccess
        );

        //GPDaoExtension
        withAccess = [
            {
                id: '0x67e84d3ef18b24e32f9a9b2e9bac9e7ea8cde2f146ce512d44b9d6718a1f3ca0',//GPDaoExtension
                addr: this.gpKickAdapter.address,//GPKickAdapterContract
                flags: 2
            },
            {
                id: '0x67e84d3ef18b24e32f9a9b2e9bac9e7ea8cde2f146ce512d44b9d6718a1f3ca0',//GPDaoExtension
                addr: this.gpDaoOnboardingAdapter.address,//GPDaoOnboardingAdapterContract
                flags: 1
            },
            {
                id: '0x67e84d3ef18b24e32f9a9b2e9bac9e7ea8cde2f146ce512d44b9d6718a1f3ca0',//GPDaoExtension
                addr: this.gpdaoAdapter.address,//GPDaoAdapterContract
                flags: 2
            }
        ]
        await this.daoFactory.configureExtension(
            dao.address,
            gpDaoExtensionAddress,//GPDaoExtension
            withAccess
        );
        console.log(`
        configure extensions ...
            configure extensions access to extensions ...
        `);

        withAccess = [
            {
                id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4',//FundingPoolExtension
                addr: this.extensions.gpDaoExt.address,//GPDaoExtension
                flags: 16384
            }
        ]
        await this.daoFactory.configureExtension(
            dao.address,
            fundingPoolExtensionAddress,//FundingPoolExtension
            withAccess
        );

    });

    it("summon a vintage dao by summon contract...", async () => {
        const daoFactoriesAddress = [this.daoFactory.address,
        this.fundingPoolExtFactory.address,
        this.gpDaoExtFactory.address
        ];
        const _daoName = "my_vintage_dao002";
        const creator = this.owner.address;
        const enalbeAdapters = [
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0x552a230dd619d2fa767bf60d9fc3ece302bde1086b9d69a14d6a843b45512ccc',//vesting
                addr: this.furoVesting.address,
                flags: 0
            },
            {
                id: '0x22c3b3d75fb899a52b9cd1992cc735762639e44483f728c4cd25708d873635d7',//fund-raise
                addr: this.fundRaiseAdapter.address,
                flags: 10
            },
            {
                id: '0xdb58310e103437f6124e14b8b20969775f28cbf97188fd0c2cb5ba69dcad2c4b',// gp kick
                addr: this.gpKickAdapter.address,
                flags: 258
            },
            {
                id: '0x64fc27b0ff66ecc06f04211511833a21b1c6af3e8efd8dae1412a70557586368',//gp-dao-onboarding
                addr: this.gpDaoOnboardingAdapter.address,
                flags: 258
            },
            {
                id: '0xf26d4834b4a91110d15379eda333e30be707af3a839ee5dbd668b89e4c6c6f6f',//founding-pool
                addr: this.fundingpoolAdapter.address,
                flags: 64
            },
            {
                id: '0xf150ecc391a74d51eebe4e31251217b187da568384d2b31171b9915d6f8fdd51',//gp-dao
                addr: this.gpdaoAdapter.address,
                flags: 0
            },
            {
                id: '0x2a014d63456a24764c5dba5876cafc75ecbe2d639a1af4060fe13c6f50d4ba20',//distribute-fundv2
                addr: this.distributeFundAdapterv2.address,
                flags: 266
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//managing
                addr: this.managing.address,
                flags: 59
            },
            {
                id: '0x60c070b9a72ac4c8e5f956ed17fe8117b5ec87b0ceefa6de23348ec16fc8b9ea',//gp-onboard-voting
                addr: this.gpOnboardVotingAdapter.address,
                flags: 8
            },
            {
                id: '0x0272405e7a7e2834b06b48bd0de471bbb4d8400020ec22f05b6fc30ffddb34a8',// gp-voting
                addr: this.gpvoting.address,
                flags: 8
            },
            {
                id: '0x71c8887ab5df33af0f26db43a2e569d7268b592b16c505d22229eabd80eb8f36',//allocationv2
                addr: this.allocationAdapter.address,
                flags: 8
            },
            {
                id: '0x67e84d3ef18b24e32f9a9b2e9bac9e7ea8cde2f146ce512d44b9d6718a1f3ca0',//gp-dao-ext
                addr: this.extensions.gpDaoExt.address,
                flags: 0
            }
        ];
        const adapters1 = [
            {
                id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4', //FundingPoolExtension
                addr: this.fundingpoolAdapter.address,//FundingPoolAdapterContract
                flags: 15903
            },
            {
                id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4', //FundingPoolExtension
                addr: this.distributeFundAdapterv2.address,//DistributeFundContractV2
                flags: 242
            }
        ];
        const adapters2 = [
            {
                id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4',//FundingPoolExtension
                addr: this.extensions.gpDaoExt.address,//GPDaoExtension
                flags: 16384
            }
        ];
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const _vintageDaoVotingInfo = [
            600,//config VOTING_PERIOD
            0,//config VOTING Power calculate type
            66,//config SUPER_MAJORITY
            60,//config QUORUM
            60,//config PROPOSAL_EXECUTE_DURATION
        ]

        const _vintageDdaoMembeShipInfo = [
            1,//bool enable;
            4,//uint8 validateType;
            hre.ethers.utils.parseEther("10000"),//uint256 minHolding;
            this.testtoken1.address,//address tokenAddress;
            0,//uint256 tokenId;
            [this.raiser_whitelist1.address, this.raiser_whitelist2.address]
        ];
        const _vintageDaoParticipantCapInfo = [
            1,//bool enable;
            5//uint256 maxParticipants;
        ];
        const _vintageGenesisRaiserList = [this.genesis_raiser1.address, this.genesis_raiser2.address];
        const vintageDaoParams = [
            daoFactoriesAddress,
            _daoName,
            this.owner.address,
            enalbeAdapters,
            adapters1,
            adapters2,
            _vintageDaoVotingInfo,
            _vintageDdaoMembeShipInfo,
            _vintageDaoParticipantCapInfo,
            _vintageGenesisRaiserList
        ];


        const tx = await this.summonDao.summonVintageDao(vintageDaoParams);
        const result = await tx.wait();
        const daoAddr = result.events[result.events.length - 1].args.daoAddr;
        this.NEW_DAO_ADDRESS = daoAddr;
        const daoName = await this.daoFactory.daos(daoAddr);

        const gpDaoContractAddress = await this.gpDaoExtFactory.getExtensionAddress(daoAddr);
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);
        const gpDaoContract = (await hre.ethers.getContractFactory("GPDaoExtension")).attach(gpDaoContractAddress);
        const isOwnerGP = await gpDaoContract.isGeneralPartner(this.owner.address);
        const isgenesisraiser1GP = await gpDaoContract.isGeneralPartner(this.genesis_raiser1.address);
        const isgenesisraiser2GP = await gpDaoContract.isGeneralPartner(this.genesis_raiser2.address);

        const israiser_whitelist1 = await gpDaoContract.isWhiteList(this.raiser_whitelist1.address);
        const israiser_whitelist2 = await gpDaoContract.isWhiteList(this.raiser_whitelist2.address);
        const raiserWhiteList = await gpDaoContract.getAllWhiteList();
        console.log(`
        new dao address ${daoAddr}
        new dao name ${toUtf8(daoName)}
        is Owner GP ${isOwnerGP}
        is genesis_raiser1 GP ${isgenesisraiser1GP}
        is genesis_raiser2 GP ${isgenesisraiser2GP}
        is genesis_raiser1 in raiser white list ${israiser_whitelist1}
        is genesis_raiser2 in raiser white list ${israiser_whitelist2}
        raiser white list ${raiserWhiteList}
        `)
    });

    it("varify raiser membership - ERC20 require", async () => {
        console.log(`
        summon a dao...
        `);
        const daoFactoriesAddress = [this.daoFactory.address,
        this.fundingPoolExtFactory.address,
        this.gpDaoExtFactory.address
        ];
        const _daoName = "my_vintage_dao003";
        const creator = this.owner.address;
        const enalbeAdapters = [
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0x552a230dd619d2fa767bf60d9fc3ece302bde1086b9d69a14d6a843b45512ccc',//vesting
                addr: this.furoVesting.address,
                flags: 0
            },
            {
                id: '0x22c3b3d75fb899a52b9cd1992cc735762639e44483f728c4cd25708d873635d7',//fund-raise
                addr: this.fundRaiseAdapter.address,
                flags: 10
            },
            {
                id: '0xdb58310e103437f6124e14b8b20969775f28cbf97188fd0c2cb5ba69dcad2c4b',// gp kick
                addr: this.gpKickAdapter.address,
                flags: 258
            },
            {
                id: '0x64fc27b0ff66ecc06f04211511833a21b1c6af3e8efd8dae1412a70557586368',//gp-dao-onboarding
                addr: this.gpDaoOnboardingAdapter.address,
                flags: 258
            },
            {
                id: '0xf26d4834b4a91110d15379eda333e30be707af3a839ee5dbd668b89e4c6c6f6f',//founding-pool
                addr: this.fundingpoolAdapter.address,
                flags: 64
            },
            {
                id: '0xf150ecc391a74d51eebe4e31251217b187da568384d2b31171b9915d6f8fdd51',//gp-dao
                addr: this.gpdaoAdapter.address,
                flags: 0
            },
            {
                id: '0x2a014d63456a24764c5dba5876cafc75ecbe2d639a1af4060fe13c6f50d4ba20',//distribute-fundv2
                addr: this.distributeFundAdapterv2.address,
                flags: 266
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//managing
                addr: this.managing.address,
                flags: 59
            },
            {
                id: '0x60c070b9a72ac4c8e5f956ed17fe8117b5ec87b0ceefa6de23348ec16fc8b9ea',//gp-onboard-voting
                addr: this.gpOnboardVotingAdapter.address,
                flags: 8
            },
            {
                id: '0x0272405e7a7e2834b06b48bd0de471bbb4d8400020ec22f05b6fc30ffddb34a8',// gp-voting
                addr: this.gpvoting.address,
                flags: 8
            },
            {
                id: '0x71c8887ab5df33af0f26db43a2e569d7268b592b16c505d22229eabd80eb8f36',//allocationv2
                addr: this.allocationAdapter.address,
                flags: 8
            },
            {
                id: '0x67e84d3ef18b24e32f9a9b2e9bac9e7ea8cde2f146ce512d44b9d6718a1f3ca0',//gp-dao-ext
                addr: this.extensions.gpDaoExt.address,
                flags: 0
            }
        ];
        const adapters1 = [
            {
                id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4', //FundingPoolExtension
                addr: this.fundingpoolAdapter.address,//FundingPoolAdapterContract
                flags: 15903
            },
            {
                id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4', //FundingPoolExtension
                addr: this.distributeFundAdapterv2.address,//DistributeFundContractV2
                flags: 242
            }
        ];
        const adapters2 = [
            {
                id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4',//FundingPoolExtension
                addr: this.extensions.gpDaoExt.address,//GPDaoExtension
                flags: 16384
            }
        ];
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const _vintageDaoVotingInfo = [
            600,//config VOTING_PERIOD
            0,//config VOTING Power calculate type
            66,//config SUPER_MAJORITY
            60,//config QUORUM
            60,//config PROPOSAL_EXECUTE_DURATION
        ]

        const _vintageDdaoMembeShipInfo = [
            1,//bool enable;
            0,//uint8 validateType;
            hre.ethers.utils.parseEther("10000"),//uint256 minHolding;
            this.testtoken1.address,//address tokenAddress;
            0,//uint256 tokenId;
            []
        ];
        const _vintageDaoParticipantCapInfo = [
            1,//bool enable;
            5//uint256 maxParticipants;
        ];
        const _vintageGenesisRaiserList = [this.genesis_raiser1.address, this.genesis_raiser2.address];
        const vintageDaoParams = [
            daoFactoriesAddress,
            _daoName,
            this.owner.address,
            enalbeAdapters,
            adapters1,
            adapters2,
            _vintageDaoVotingInfo,
            _vintageDdaoMembeShipInfo,
            _vintageDaoParticipantCapInfo,
            _vintageGenesisRaiserList
        ];


        const tx = await this.summonDao.summonVintageDao(vintageDaoParams);
        const result = await tx.wait();
        const daoAddr = result.events[result.events.length - 1].args.daoAddr;
        this.NEW_DAO_ADDRESS = daoAddr;
        const daoName = await this.daoFactory.daos(daoAddr);

        const gpDaoContractAddress = await this.gpDaoExtFactory.getExtensionAddress(daoAddr);
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);
        const gpDaoContract = (await hre.ethers.getContractFactory("GPDaoExtension")).attach(gpDaoContractAddress);
        const isOwnerGP = await gpDaoContract.isGeneralPartner(this.owner.address);
        const isgenesisraiser1GP = await gpDaoContract.isGeneralPartner(this.genesis_raiser1.address);
        const isgenesisraiser2GP = await gpDaoContract.isGeneralPartner(this.genesis_raiser2.address);

        const raiserWhiteList = await gpDaoContract.getAllWhiteList();
        console.log(`
            new dao address ${daoAddr}
            new dao name ${toUtf8(daoName)}
            is Owner GP ${isOwnerGP}
            is genesis_raiser1 GP ${isgenesisraiser1GP}
            is genesis_raiser2 GP ${isgenesisraiser2GP}
            raiser white list ${raiserWhiteList}
            `)

        const raiserMemberShipContract = this.gpDaoOnboardingAdapter;
        await expectRevert(raiserMemberShipContract.submitProposal(this.NEW_DAO_ADDRESS, this.gp1.address), "revert");
        await this.testtoken1.transfer(this.gp1.address, hre.ethers.utils.parseEther("10001"));
        await raiserMemberShipContract.submitProposal(this.NEW_DAO_ADDRESS, this.gp1.address);
    });
    it("varify raiser membership - ERC721 require", async () => {
        console.log(`
        summon a dao...
        `);
        const daoFactoriesAddress = [this.daoFactory.address,
        this.fundingPoolExtFactory.address,
        this.gpDaoExtFactory.address
        ];
        const _daoName = "my_vintage_dao004";
        const creator = this.owner.address;
        const enalbeAdapters = [
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0x552a230dd619d2fa767bf60d9fc3ece302bde1086b9d69a14d6a843b45512ccc',//vesting
                addr: this.furoVesting.address,
                flags: 0
            },
            {
                id: '0x22c3b3d75fb899a52b9cd1992cc735762639e44483f728c4cd25708d873635d7',//fund-raise
                addr: this.fundRaiseAdapter.address,
                flags: 10
            },
            {
                id: '0xdb58310e103437f6124e14b8b20969775f28cbf97188fd0c2cb5ba69dcad2c4b',// gp kick
                addr: this.gpKickAdapter.address,
                flags: 258
            },
            {
                id: '0x64fc27b0ff66ecc06f04211511833a21b1c6af3e8efd8dae1412a70557586368',//gp-dao-onboarding
                addr: this.gpDaoOnboardingAdapter.address,
                flags: 258
            },
            {
                id: '0xf26d4834b4a91110d15379eda333e30be707af3a839ee5dbd668b89e4c6c6f6f',//founding-pool
                addr: this.fundingpoolAdapter.address,
                flags: 64
            },
            {
                id: '0xf150ecc391a74d51eebe4e31251217b187da568384d2b31171b9915d6f8fdd51',//gp-dao
                addr: this.gpdaoAdapter.address,
                flags: 0
            },
            {
                id: '0x2a014d63456a24764c5dba5876cafc75ecbe2d639a1af4060fe13c6f50d4ba20',//distribute-fundv2
                addr: this.distributeFundAdapterv2.address,
                flags: 266
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//managing
                addr: this.managing.address,
                flags: 59
            },
            {
                id: '0x60c070b9a72ac4c8e5f956ed17fe8117b5ec87b0ceefa6de23348ec16fc8b9ea',//gp-onboard-voting
                addr: this.gpOnboardVotingAdapter.address,
                flags: 8
            },
            {
                id: '0x0272405e7a7e2834b06b48bd0de471bbb4d8400020ec22f05b6fc30ffddb34a8',// gp-voting
                addr: this.gpvoting.address,
                flags: 8
            },
            {
                id: '0x71c8887ab5df33af0f26db43a2e569d7268b592b16c505d22229eabd80eb8f36',//allocationv2
                addr: this.allocationAdapter.address,
                flags: 8
            },
            {
                id: '0x67e84d3ef18b24e32f9a9b2e9bac9e7ea8cde2f146ce512d44b9d6718a1f3ca0',//gp-dao-ext
                addr: this.extensions.gpDaoExt.address,
                flags: 0
            }
        ];
        const adapters1 = [
            {
                id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4', //FundingPoolExtension
                addr: this.fundingpoolAdapter.address,//FundingPoolAdapterContract
                flags: 15903
            },
            {
                id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4', //FundingPoolExtension
                addr: this.distributeFundAdapterv2.address,//DistributeFundContractV2
                flags: 242
            }
        ];
        const adapters2 = [
            {
                id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4',//FundingPoolExtension
                addr: this.extensions.gpDaoExt.address,//GPDaoExtension
                flags: 16384
            }
        ];
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const _vintageDaoVotingInfo = [
            600,//config VOTING_PERIOD
            0,//config VOTING Power calculate type
            66,//config SUPER_MAJORITY
            60,//config QUORUM
            60,//config PROPOSAL_EXECUTE_DURATION
        ]
        const ERC721 = await hre.ethers.getContractFactory("PixelNFT");
        const erc721 = await ERC721.deploy(2);
        await erc721.deployed();
        const _vintageDdaoMembeShipInfo = [
            1,//bool enable;
            1,//uint8 validateType; ERC721
            1,//uint256 minHolding;
            erc721.address,//address tokenAddress;
            0,//uint256 tokenId;
            []
        ];
        const _vintageDaoParticipantCapInfo = [
            1,//bool enable;
            5//uint256 maxParticipants;
        ];
        const _vintageGenesisRaiserList = [this.genesis_raiser1.address, this.genesis_raiser2.address];
        const vintageDaoParams = [
            daoFactoriesAddress,
            _daoName,
            this.owner.address,
            enalbeAdapters,
            adapters1,
            adapters2,
            _vintageDaoVotingInfo,
            _vintageDdaoMembeShipInfo,
            _vintageDaoParticipantCapInfo,
            _vintageGenesisRaiserList
        ];


        const tx = await this.summonDao.summonVintageDao(vintageDaoParams);
        const result = await tx.wait();
        const daoAddr = result.events[result.events.length - 1].args.daoAddr;
        this.NEW_DAO_ADDRESS = daoAddr;
        const daoName = await this.daoFactory.daos(daoAddr);

        const gpDaoContractAddress = await this.gpDaoExtFactory.getExtensionAddress(daoAddr);
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);
        const gpDaoContract = (await hre.ethers.getContractFactory("GPDaoExtension")).attach(gpDaoContractAddress);
        const isOwnerGP = await gpDaoContract.isGeneralPartner(this.owner.address);
        const isgenesisraiser1GP = await gpDaoContract.isGeneralPartner(this.genesis_raiser1.address);
        const isgenesisraiser2GP = await gpDaoContract.isGeneralPartner(this.genesis_raiser2.address);

        const raiserWhiteList = await gpDaoContract.getAllWhiteList();
        console.log(`
            new dao address ${daoAddr}
            new dao name ${toUtf8(daoName)}
            is Owner GP ${isOwnerGP}
            is genesis_raiser1 GP ${isgenesisraiser1GP}
            is genesis_raiser2 GP ${isgenesisraiser2GP}
            raiser white list ${raiserWhiteList}
            `)

        const raiserMemberShipContract = this.gpDaoOnboardingAdapter;
        let gp1NFTBal = await erc721.balanceOf(this.gp1.address);
        console.log(`
        gp1 NFT balance ${gp1NFTBal}
        `);
        await expectRevert(raiserMemberShipContract.submitProposal(this.NEW_DAO_ADDRESS, this.gp1.address), "revert");
        console.log(`mint NFT...`);
        await erc721.mintPixel(this.gp1.address, 1, 1);
        console.log(`minted...`);
        gp1NFTBal = await erc721.balanceOf(this.gp1.address);
        console.log(`
        gp1 NFT balance ${gp1NFTBal}
        `);
        await raiserMemberShipContract.submitProposal(this.NEW_DAO_ADDRESS, this.gp1.address);
    });
    it("varify raiser membership - ERC1155 require", async () => {
        console.log(`
        summon a dao...
        `);
        const daoFactoriesAddress = [this.daoFactory.address,
        this.fundingPoolExtFactory.address,
        this.gpDaoExtFactory.address
        ];
        const _daoName = "my_vintage_dao005";
        const creator = this.owner.address;
        const enalbeAdapters = [
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0x552a230dd619d2fa767bf60d9fc3ece302bde1086b9d69a14d6a843b45512ccc',//vesting
                addr: this.furoVesting.address,
                flags: 0
            },
            {
                id: '0x22c3b3d75fb899a52b9cd1992cc735762639e44483f728c4cd25708d873635d7',//fund-raise
                addr: this.fundRaiseAdapter.address,
                flags: 10
            },
            {
                id: '0xdb58310e103437f6124e14b8b20969775f28cbf97188fd0c2cb5ba69dcad2c4b',// gp kick
                addr: this.gpKickAdapter.address,
                flags: 258
            },
            {
                id: '0x64fc27b0ff66ecc06f04211511833a21b1c6af3e8efd8dae1412a70557586368',//gp-dao-onboarding
                addr: this.gpDaoOnboardingAdapter.address,
                flags: 258
            },
            {
                id: '0xf26d4834b4a91110d15379eda333e30be707af3a839ee5dbd668b89e4c6c6f6f',//founding-pool
                addr: this.fundingpoolAdapter.address,
                flags: 64
            },
            {
                id: '0xf150ecc391a74d51eebe4e31251217b187da568384d2b31171b9915d6f8fdd51',//gp-dao
                addr: this.gpdaoAdapter.address,
                flags: 0
            },
            {
                id: '0x2a014d63456a24764c5dba5876cafc75ecbe2d639a1af4060fe13c6f50d4ba20',//distribute-fundv2
                addr: this.distributeFundAdapterv2.address,
                flags: 266
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//managing
                addr: this.managing.address,
                flags: 59
            },
            {
                id: '0x60c070b9a72ac4c8e5f956ed17fe8117b5ec87b0ceefa6de23348ec16fc8b9ea',//gp-onboard-voting
                addr: this.gpOnboardVotingAdapter.address,
                flags: 8
            },
            {
                id: '0x0272405e7a7e2834b06b48bd0de471bbb4d8400020ec22f05b6fc30ffddb34a8',// gp-voting
                addr: this.gpvoting.address,
                flags: 8
            },
            {
                id: '0x71c8887ab5df33af0f26db43a2e569d7268b592b16c505d22229eabd80eb8f36',//allocationv2
                addr: this.allocationAdapter.address,
                flags: 8
            },
            {
                id: '0x67e84d3ef18b24e32f9a9b2e9bac9e7ea8cde2f146ce512d44b9d6718a1f3ca0',//gp-dao-ext
                addr: this.extensions.gpDaoExt.address,
                flags: 0
            }
        ];
        const adapters1 = [
            {
                id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4', //FundingPoolExtension
                addr: this.fundingpoolAdapter.address,//FundingPoolAdapterContract
                flags: 15903
            },
            {
                id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4', //FundingPoolExtension
                addr: this.distributeFundAdapterv2.address,//DistributeFundContractV2
                flags: 242
            }
        ];
        const adapters2 = [
            {
                id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4',//FundingPoolExtension
                addr: this.extensions.gpDaoExt.address,//GPDaoExtension
                flags: 16384
            }
        ];
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const _vintageDaoVotingInfo = [
            600,//config VOTING_PERIOD
            0,//config VOTING Power calculate type
            66,//config SUPER_MAJORITY
            60,//config QUORUM
            60,//config PROPOSAL_EXECUTE_DURATION
        ]
        const ERC1155 = await hre.ethers.getContractFactory("ERC1155TestToken");
        const erc1155 = await ERC1155.deploy("this is test uri");
        await erc1155.deployed();
        const _vintageDdaoMembeShipInfo = [
            1,//bool enable;
            2,//uint8 validateType; ERC1155
            2,//uint256 minHolding;
            erc1155.address,//address tokenAddress;
            1,//uint256 tokenId;
            []
        ];
        const _vintageDaoParticipantCapInfo = [
            1,//bool enable;
            5//uint256 maxParticipants;
        ];
        const _vintageGenesisRaiserList = [this.genesis_raiser1.address, this.genesis_raiser2.address];
        const vintageDaoParams = [
            daoFactoriesAddress,
            _daoName,
            this.owner.address,
            enalbeAdapters,
            adapters1,
            adapters2,
            _vintageDaoVotingInfo,
            _vintageDdaoMembeShipInfo,
            _vintageDaoParticipantCapInfo,
            _vintageGenesisRaiserList
        ];


        const tx = await this.summonDao.summonVintageDao(vintageDaoParams);
        const result = await tx.wait();
        const daoAddr = result.events[result.events.length - 1].args.daoAddr;
        this.NEW_DAO_ADDRESS = daoAddr;
        const daoName = await this.daoFactory.daos(daoAddr);

        const gpDaoContractAddress = await this.gpDaoExtFactory.getExtensionAddress(daoAddr);
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);
        const gpDaoContract = (await hre.ethers.getContractFactory("GPDaoExtension")).attach(gpDaoContractAddress);
        const isOwnerGP = await gpDaoContract.isGeneralPartner(this.owner.address);
        const isgenesisraiser1GP = await gpDaoContract.isGeneralPartner(this.genesis_raiser1.address);
        const isgenesisraiser2GP = await gpDaoContract.isGeneralPartner(this.genesis_raiser2.address);

        const raiserWhiteList = await gpDaoContract.getAllWhiteList();
        console.log(`
            new dao address ${daoAddr}
            new dao name ${toUtf8(daoName)}
            is Owner GP ${isOwnerGP}
            is genesis_raiser1 GP ${isgenesisraiser1GP}
            is genesis_raiser2 GP ${isgenesisraiser2GP}
            raiser white list ${raiserWhiteList}
            `)

        const raiserMemberShipContract = this.gpDaoOnboardingAdapter;
        let gp1NFTBal = await erc1155.balanceOf(this.gp1.address, 1);
        let gp2NFTBal = await erc1155.balanceOf(this.gp2.address, 1);

        console.log(`
        gp1 ERC1155 balance ${gp1NFTBal}
        gp2 ERC1155 balance ${gp2NFTBal}
        `);
        await expectRevert(raiserMemberShipContract.submitProposal(this.NEW_DAO_ADDRESS, this.gp1.address), "revert");
        console.log(`mint ERC1155 to gp1...`);
        await erc1155.mint(this.gp1.address, 1, 2, hexToBytes(toHex(2233)));
        console.log(`minted...`);
        console.log(`mint ERC1155 to gp2...`);
        await erc1155.mint(this.gp2.address, 1, 2, hexToBytes(toHex(2233)));
        console.log(`minted...`);
        gp1NFTBal = await erc1155.balanceOf(this.gp1.address, 1);
        gp2NFTBal = await erc1155.balanceOf(this.gp2.address, 1);
        console.log(`
        gp1 ERC1155 balance ${gp1NFTBal}
        gp2 ERC1155 balance ${gp2NFTBal}
        `);
        await raiserMemberShipContract.submitProposal(this.NEW_DAO_ADDRESS, this.gp1.address);
        await raiserMemberShipContract.submitProposal(this.NEW_DAO_ADDRESS, this.gp2.address);

    });
    it("varify raiser membership - Deposit require", async () => {
        console.log(`
        summon a dao...
        `);
        const daoFactoriesAddress = [this.daoFactory.address,
        this.fundingPoolExtFactory.address,
        this.gpDaoExtFactory.address
        ];
        const _daoName = "my_vintage_dao006";
        const creator = this.owner.address;
        const enalbeAdapters = [
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0x552a230dd619d2fa767bf60d9fc3ece302bde1086b9d69a14d6a843b45512ccc',//vesting
                addr: this.furoVesting.address,
                flags: 0
            },
            {
                id: '0x22c3b3d75fb899a52b9cd1992cc735762639e44483f728c4cd25708d873635d7',//fund-raise
                addr: this.fundRaiseAdapter.address,
                flags: 10
            },
            {
                id: '0xdb58310e103437f6124e14b8b20969775f28cbf97188fd0c2cb5ba69dcad2c4b',// gp kick
                addr: this.gpKickAdapter.address,
                flags: 258
            },
            {
                id: '0x64fc27b0ff66ecc06f04211511833a21b1c6af3e8efd8dae1412a70557586368',//gp-dao-onboarding
                addr: this.gpDaoOnboardingAdapter.address,
                flags: 258
            },
            {
                id: '0xf26d4834b4a91110d15379eda333e30be707af3a839ee5dbd668b89e4c6c6f6f',//founding-pool
                addr: this.fundingpoolAdapter.address,
                flags: 64
            },
            {
                id: '0xf150ecc391a74d51eebe4e31251217b187da568384d2b31171b9915d6f8fdd51',//gp-dao
                addr: this.gpdaoAdapter.address,
                flags: 0
            },
            {
                id: '0x2a014d63456a24764c5dba5876cafc75ecbe2d639a1af4060fe13c6f50d4ba20',//distribute-fundv2
                addr: this.distributeFundAdapterv2.address,
                flags: 266
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//managing
                addr: this.managing.address,
                flags: 59
            },
            {
                id: '0x60c070b9a72ac4c8e5f956ed17fe8117b5ec87b0ceefa6de23348ec16fc8b9ea',//gp-onboard-voting
                addr: this.gpOnboardVotingAdapter.address,
                flags: 8
            },
            {
                id: '0x0272405e7a7e2834b06b48bd0de471bbb4d8400020ec22f05b6fc30ffddb34a8',// gp-voting
                addr: this.gpvoting.address,
                flags: 8
            },
            {
                id: '0x71c8887ab5df33af0f26db43a2e569d7268b592b16c505d22229eabd80eb8f36',//allocationv2
                addr: this.allocationAdapter.address,
                flags: 8
            },
            {
                id: '0x67e84d3ef18b24e32f9a9b2e9bac9e7ea8cde2f146ce512d44b9d6718a1f3ca0',//gp-dao-ext
                addr: this.extensions.gpDaoExt.address,
                flags: 0
            }
        ];
        const adapters1 = [
            {
                id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4', //FundingPoolExtension
                addr: this.fundingpoolAdapter.address,//FundingPoolAdapterContract
                flags: 15903
            },
            {
                id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4', //FundingPoolExtension
                addr: this.distributeFundAdapterv2.address,//DistributeFundContractV2
                flags: 242
            }
        ];
        const adapters2 = [
            {
                id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4',//FundingPoolExtension
                addr: this.extensions.gpDaoExt.address,//GPDaoExtension
                flags: 16384
            }
        ];
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const _vintageDaoVotingInfo = [
            600,//config VOTING_PERIOD
            0,//config VOTING Power calculate type
            66,//config SUPER_MAJORITY
            60,//config QUORUM
            60,//config PROPOSAL_EXECUTE_DURATION
        ]

        const _vintageDdaoMembeShipInfo = [
            1,//bool enable;
            3,//uint8 validateType; deposit require
            hre.ethers.utils.parseEther("10000"),//uint256 minHolding;
            ZERO_ADDRESS,//address tokenAddress;
            0,//uint256 tokenId;
            []
        ];
        const _vintageDaoParticipantCapInfo = [
            1,//bool enable;
            5//uint256 maxParticipants;
        ];
        const _vintageGenesisRaiserList = [this.genesis_raiser1.address, this.genesis_raiser2.address];
        const vintageDaoParams = [
            daoFactoriesAddress,
            _daoName,
            this.owner.address,
            enalbeAdapters,
            adapters1,
            adapters2,
            _vintageDaoVotingInfo,
            _vintageDdaoMembeShipInfo,
            _vintageDaoParticipantCapInfo,
            _vintageGenesisRaiserList
        ];


        let tx = await this.summonDao.summonVintageDao(vintageDaoParams);
        let result = await tx.wait();
        const daoAddr = result.events[result.events.length - 1].args.daoAddr;
        this.NEW_DAO_ADDRESS = daoAddr;
        const daoName = await this.daoFactory.daos(daoAddr);

        const gpDaoContractAddress = await this.gpDaoExtFactory.getExtensionAddress(daoAddr);
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);
        const gpDaoContract = (await hre.ethers.getContractFactory("GPDaoExtension")).attach(gpDaoContractAddress);
        const isOwnerGP = await gpDaoContract.isGeneralPartner(this.owner.address);
        const isgenesisraiser1GP = await gpDaoContract.isGeneralPartner(this.genesis_raiser1.address);
        const isgenesisraiser2GP = await gpDaoContract.isGeneralPartner(this.genesis_raiser2.address);

        const raiserWhiteList = await gpDaoContract.getAllWhiteList();
        console.log(`
            new dao address ${daoAddr}
            new dao name ${toUtf8(daoName)}
            is Owner GP ${isOwnerGP}
            is genesis_raiser1 GP ${isgenesisraiser1GP}
            is genesis_raiser2 GP ${isgenesisraiser2GP}
            raiser white list ${raiserWhiteList}
        `)


        const fundRaiseContract = this.fundRaiseAdapter;
        const votingContract = this.gpvoting;
        const fundingPoolAdaptContract = this.fundingpoolAdapter;
        console.log(`create fund raise proposal...`);
        const ProposalFundRaiseInfo = [
            hre.ethers.utils.parseEther("100000"), //uint256 fundRaiseTarget;
            hre.ethers.utils.parseEther("10000000"),//uint256 fundRaiseMaxAmount;
            hre.ethers.utils.parseEther("1000"),// uint256 lpMinDepositAmount;
            hre.ethers.utils.parseEther("10000")// uint256 lpMaxDepositAmount;
        ]
        let currentblocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const ProposalTimeInfo = [
            currentblocktimestamp,// uint256 fundRaiseStartTime;
            currentblocktimestamp + 60 * 60,// uint256 fundRaiseEndTime;
            60 * 60,// uint256 fundTerm;
            60 * 10,// uint256 redemptPeriod;
            60,// uint256 redemptDuration;
            60 * 10// uint256 returnDuration;
        ]

        const ProposalFeeInfo = [
            2,// uint256 proposerRewardRatio;
            3,// uint256 managementFeeRatio;
            2// uint256 redepmtFeeRatio;
        ]

        const ProposalAddressInfo = [
            this.managementFeeAccount.address,// address managementFeeAddress;
            this.testtoken1.address// address fundRaiseTokenAddress;
        ]
        const funfRaiseProposalParams = [
            this.NEW_DAO_ADDRESS,
            ProposalFundRaiseInfo,
            ProposalTimeInfo,
            ProposalFeeInfo,
            ProposalAddressInfo
        ];

        tx = await fundRaiseContract.connect(this.genesis_raiser1).submitProposal(funfRaiseProposalParams);
        result = await tx.wait();

        const newFundRaiseProposalId = result.events[result.events.length - 1].args.proposalId;
        console.log(`new Fund Raise ProposalId ${newFundRaiseProposalId}`);

        console.log(`voting...`);
        await votingContract.submitVote(this.NEW_DAO_ADDRESS, newFundRaiseProposalId, 1);
        let fundRaiseProposalInfo = await fundRaiseContract.Proposals(this.NEW_DAO_ADDRESS, newFundRaiseProposalId);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseProposalInfo.stopVoteTime) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        const rel = await votingContract.voteResult(this.NEW_DAO_ADDRESS, newFundRaiseProposalId);
        console.log(`voting reuslt ${rel.state}`);

        console.log(`process fund raise proposal...`);
        await fundRaiseContract.processProposal(this.NEW_DAO_ADDRESS, newFundRaiseProposalId);

        fundRaiseProposalInfo = await fundRaiseContract.Proposals(this.NEW_DAO_ADDRESS, newFundRaiseProposalId);
        console.log(`fund raise proposal state ${fundRaiseProposalInfo.state}`);

        await this.testtoken1.transfer(this.gp1.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.transfer(this.gp2.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.connect(this.gp1).approve(fundingPoolAdaptContract.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.connect(this.gp2).approve(fundingPoolAdaptContract.address, hre.ethers.utils.parseEther("10000"));

        let gp1DepositBal = await fundingPoolAdaptContract.balanceOf(this.NEW_DAO_ADDRESS, this.gp1.address);
        let gp2DepositBal = await fundingPoolAdaptContract.balanceOf(this.NEW_DAO_ADDRESS, this.gp2.address);


        console.log(`
        gp1 deposit balance ${hre.ethers.utils.formatEther(gp1DepositBal)}
        gp2 deposit balance ${hre.ethers.utils.formatEther(gp2DepositBal)}
        `);
        const raiserMemberShipContract = this.gpDaoOnboardingAdapter;
        await expectRevert(raiserMemberShipContract.submitProposal(this.NEW_DAO_ADDRESS, this.gp1.address), "revert");


        console.log(`
        gp1 deposit...
        `);
        await depositToFundingPool(
            fundingPoolAdaptContract,
            this.NEW_DAO_ADDRESS,
            this.gp1,
            hre.ethers.utils.parseEther("10000"),
            this.testtoken1
        );

        console.log(`
        gp2 deposit...
        `);
        await depositToFundingPool(
            fundingPoolAdaptContract,
            this.NEW_DAO_ADDRESS,
            this.gp2,
            hre.ethers.utils.parseEther("10000"),
            this.testtoken1
        );
        gp1DepositBal = await fundingPoolAdaptContract.balanceOf(this.NEW_DAO_ADDRESS, this.gp1.address);
        gp2DepositBal = await fundingPoolAdaptContract.balanceOf(this.NEW_DAO_ADDRESS, this.gp2.address);

        console.log(`
        gp1 deposit balance ${hre.ethers.utils.formatEther(gp1DepositBal)}
        gp2 deposit balance ${hre.ethers.utils.formatEther(gp2DepositBal)}
        `);

        await raiserMemberShipContract.submitProposal(this.NEW_DAO_ADDRESS, this.gp1.address);
        await raiserMemberShipContract.submitProposal(this.NEW_DAO_ADDRESS, this.gp2.address);


    });
    it("varify raiser membership - WhiteList restrict", async () => {

        console.log(`
        summon a dao...
        `);
        const daoFactoriesAddress = [this.daoFactory.address,
        this.fundingPoolExtFactory.address,
        this.gpDaoExtFactory.address
        ];
        const _daoName = "my_vintage_dao007";
        const creator = this.owner.address;
        const enalbeAdapters = [
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0x552a230dd619d2fa767bf60d9fc3ece302bde1086b9d69a14d6a843b45512ccc',//vesting
                addr: this.furoVesting.address,
                flags: 0
            },
            {
                id: '0x22c3b3d75fb899a52b9cd1992cc735762639e44483f728c4cd25708d873635d7',//fund-raise
                addr: this.fundRaiseAdapter.address,
                flags: 10
            },
            {
                id: '0xdb58310e103437f6124e14b8b20969775f28cbf97188fd0c2cb5ba69dcad2c4b',// gp kick
                addr: this.gpKickAdapter.address,
                flags: 258
            },
            {
                id: '0x64fc27b0ff66ecc06f04211511833a21b1c6af3e8efd8dae1412a70557586368',//gp-dao-onboarding
                addr: this.gpDaoOnboardingAdapter.address,
                flags: 258
            },
            {
                id: '0xf26d4834b4a91110d15379eda333e30be707af3a839ee5dbd668b89e4c6c6f6f',//founding-pool
                addr: this.fundingpoolAdapter.address,
                flags: 64
            },
            {
                id: '0xf150ecc391a74d51eebe4e31251217b187da568384d2b31171b9915d6f8fdd51',//gp-dao
                addr: this.gpdaoAdapter.address,
                flags: 0
            },
            {
                id: '0x2a014d63456a24764c5dba5876cafc75ecbe2d639a1af4060fe13c6f50d4ba20',//distribute-fundv2
                addr: this.distributeFundAdapterv2.address,
                flags: 266
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//managing
                addr: this.managing.address,
                flags: 59
            },
            {
                id: '0x60c070b9a72ac4c8e5f956ed17fe8117b5ec87b0ceefa6de23348ec16fc8b9ea',//gp-onboard-voting
                addr: this.gpOnboardVotingAdapter.address,
                flags: 8
            },
            {
                id: '0x0272405e7a7e2834b06b48bd0de471bbb4d8400020ec22f05b6fc30ffddb34a8',// gp-voting
                addr: this.gpvoting.address,
                flags: 8
            },
            {
                id: '0x71c8887ab5df33af0f26db43a2e569d7268b592b16c505d22229eabd80eb8f36',//allocationv2
                addr: this.allocationAdapter.address,
                flags: 8
            },
            {
                id: '0x67e84d3ef18b24e32f9a9b2e9bac9e7ea8cde2f146ce512d44b9d6718a1f3ca0',//gp-dao-ext
                addr: this.extensions.gpDaoExt.address,
                flags: 0
            }
        ];
        const adapters1 = [
            {
                id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4', //FundingPoolExtension
                addr: this.fundingpoolAdapter.address,//FundingPoolAdapterContract
                flags: 15903
            },
            {
                id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4', //FundingPoolExtension
                addr: this.distributeFundAdapterv2.address,//DistributeFundContractV2
                flags: 242
            }
        ];
        const adapters2 = [
            {
                id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4',//FundingPoolExtension
                addr: this.extensions.gpDaoExt.address,//GPDaoExtension
                flags: 16384
            }
        ];
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const _vintageDaoVotingInfo = [
            600,//config VOTING_PERIOD
            0,//config VOTING Power calculate type
            66,//config SUPER_MAJORITY
            60,//config QUORUM
            60,//config PROPOSAL_EXECUTE_DURATION
        ]
        const ERC1155 = await hre.ethers.getContractFactory("ERC1155TestToken");
        const erc1155 = await ERC1155.deploy("this is test uri");
        await erc1155.deployed();
        const _vintageDdaoMembeShipInfo = [
            1,//bool enable;
            4,//uint8 validateType; whitelist
            0,//uint256 minHolding;
            erc1155.address,//address tokenAddress;
            0,//uint256 tokenId;
            [this.raiser_whitelist1.address, this.raiser_whitelist2.address]// whitelist account
        ];
        const _vintageDaoParticipantCapInfo = [
            1,//bool enable;
            5//uint256 maxParticipants;
        ];
        const _vintageGenesisRaiserList = [this.genesis_raiser1.address, this.genesis_raiser2.address];
        const vintageDaoParams = [
            daoFactoriesAddress,
            _daoName,
            this.owner.address,
            enalbeAdapters,
            adapters1,
            adapters2,
            _vintageDaoVotingInfo,
            _vintageDdaoMembeShipInfo,
            _vintageDaoParticipantCapInfo,
            _vintageGenesisRaiserList
        ];


        const tx = await this.summonDao.summonVintageDao(vintageDaoParams);
        const result = await tx.wait();
        const daoAddr = result.events[result.events.length - 1].args.daoAddr;
        this.NEW_DAO_ADDRESS = daoAddr;
        const daoName = await this.daoFactory.daos(daoAddr);

        const gpDaoContractAddress = await this.gpDaoExtFactory.getExtensionAddress(daoAddr);
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);
        const gpDaoContract = (await hre.ethers.getContractFactory("GPDaoExtension")).attach(gpDaoContractAddress);
        const isOwnerGP = await gpDaoContract.isGeneralPartner(this.owner.address);
        const isgenesisraiser1GP = await gpDaoContract.isGeneralPartner(this.genesis_raiser1.address);
        const isgenesisraiser2GP = await gpDaoContract.isGeneralPartner(this.genesis_raiser2.address);

        const raiserWhiteList = await gpDaoContract.getAllWhiteList();
        console.log(`
            new dao address ${daoAddr}
            new dao name ${toUtf8(daoName)}
            is Owner GP ${isOwnerGP}
            is genesis_raiser1 GP ${isgenesisraiser1GP}
            is genesis_raiser2 GP ${isgenesisraiser2GP}
            raiser white list ${raiserWhiteList}
            `)

        const isgp1_whitelist = await gpDaoContract.isWhiteList(this.gp1.address);
        const israiser_whitelist1 = await gpDaoContract.isWhiteList(this.raiser_whitelist1.address);
        const israiser_whitelist2 = await gpDaoContract.isWhiteList(this.raiser_whitelist2.address);
        console.log(`
        isgp1_whitelist ${isgp1_whitelist}
        israiser_whitelist1 ${israiser_whitelist1}
        israiser_whitelist2 ${israiser_whitelist2}
        `);

        const raiserMemberShipContract = this.gpDaoOnboardingAdapter;
        await expectRevert(raiserMemberShipContract.submitProposal(this.NEW_DAO_ADDRESS, this.gp1.address), "revert");

        await raiserMemberShipContract.submitProposal(this.NEW_DAO_ADDRESS, this.raiser_whitelist2.address);
        await raiserMemberShipContract.submitProposal(this.NEW_DAO_ADDRESS, this.raiser_whitelist1.address);
    });

    it("varify participant cap...", async () => {
        const fundRaiseContract = this.fundRaiseAdapter;
        const votingContract = this.gpvoting;
        const fundingPoolAdaptContract = this.fundingpoolAdapter;
        console.log(`create fund raise proposal...`);
        const ProposalFundRaiseInfo = [
            hre.ethers.utils.parseEther("10000"), //uint256 fundRaiseTarget;
            hre.ethers.utils.parseEther("10000000"),//uint256 fundRaiseMaxAmount;
            hre.ethers.utils.parseEther("1000"),// uint256 lpMinDepositAmount;
            hre.ethers.utils.parseEther("10000")// uint256 lpMaxDepositAmount;
        ]
        let currentblocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const ProposalTimeInfo = [
            currentblocktimestamp,// uint256 fundRaiseStartTime;
            currentblocktimestamp + 60 * 60,// uint256 fundRaiseEndTime;
            60 * 60,// uint256 fundTerm;
            60 * 10,// uint256 redemptPeriod;
            60,// uint256 redemptDuration;
            60 * 10// uint256 returnDuration;
        ]

        const ProposalFeeInfo = [
            2,// uint256 proposerRewardRatio;
            3,// uint256 managementFeeRatio;
            2// uint256 redepmtFeeRatio;
        ]

        const ProposalAddressInfo = [
            this.managementFeeAccount.address,// address managementFeeAddress;
            this.testtoken1.address// address fundRaiseTokenAddress;
        ]
        const funfRaiseProposalParams = [
            this.NEW_DAO_ADDRESS,
            ProposalFundRaiseInfo,
            ProposalTimeInfo,
            ProposalFeeInfo,
            ProposalAddressInfo
        ];

        console.log(funfRaiseProposalParams);

        const tx = await fundRaiseContract.connect(this.genesis_raiser1).submitProposal(funfRaiseProposalParams);
        const result = await tx.wait();

        const newFundRaiseProposalId = result.events[result.events.length - 1].args.proposalId;
        console.log(`new Fund Raise ProposalId ${newFundRaiseProposalId}`);

        console.log(`voting...`);
        await votingContract.submitVote(this.NEW_DAO_ADDRESS, newFundRaiseProposalId, 1);
        let fundRaiseProposalInfo = await fundRaiseContract.Proposals(this.NEW_DAO_ADDRESS, newFundRaiseProposalId);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseProposalInfo.stopVoteTime) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        const rel = await votingContract.voteResult(this.NEW_DAO_ADDRESS, newFundRaiseProposalId);
        console.log(`voting reuslt ${rel.state}`);

        console.log(`process fund raise proposal...`);
        await fundRaiseContract.processProposal(this.NEW_DAO_ADDRESS, newFundRaiseProposalId);

        fundRaiseProposalInfo = await fundRaiseContract.Proposals(this.NEW_DAO_ADDRESS, newFundRaiseProposalId);
        console.log(`fund raise proposal state ${fundRaiseProposalInfo.state}`);

        await this.testtoken1.transfer(this.investor1.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.transfer(this.investor2.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.transfer(this.investor3.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.transfer(this.investor4.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.transfer(this.investor5.address, hre.ethers.utils.parseEther("10000"));
        await this.testtoken1.transfer(this.investor6.address, hre.ethers.utils.parseEther("10000"));

        console.log(`
        min deposit amount check...
        `);
        await expectRevert(depositToFundingPool(
            fundingPoolAdaptContract,
            this.NEW_DAO_ADDRESS,
            this.investor1,
            hre.ethers.utils.parseEther("10"),
            this.testtoken1
        ), "revert");
        console.log(`
        max deposit amount check...
        `);
        await expectRevert(depositToFundingPool(
            fundingPoolAdaptContract,
            this.NEW_DAO_ADDRESS,
            this.investor1,
            fundRaiseProposalInfo.lpMaxDepositAmount.add("1"),
            this.testtoken1
        ), "revert");
        console.log(`
        investor1 deposit...
        `);
        await depositToFundingPool(
            fundingPoolAdaptContract,
            this.NEW_DAO_ADDRESS,
            this.investor1,
            hre.ethers.utils.parseEther("2000"),
            this.testtoken1
        );
        console.log(`investor2 deposit...`);
        await depositToFundingPool(
            fundingPoolAdaptContract,
            this.NEW_DAO_ADDRESS,
            this.investor2,
            hre.ethers.utils.parseEther("2000"),
            this.testtoken1
        );
        console.log(`investor3 deposit...`);
        await depositToFundingPool(
            fundingPoolAdaptContract,
            this.NEW_DAO_ADDRESS,
            this.investor3,
            hre.ethers.utils.parseEther("2000"),
            this.testtoken1
        );
        console.log(`investor4 deposit...`);
        await depositToFundingPool(
            fundingPoolAdaptContract,
            this.NEW_DAO_ADDRESS,
            this.investor4,
            hre.ethers.utils.parseEther("2000"),
            this.testtoken1
        );
        console.log(`investor5 deposit...`);
        await depositToFundingPool(
            fundingPoolAdaptContract,
            this.NEW_DAO_ADDRESS,
            this.investor5,
            hre.ethers.utils.parseEther("2000"),
            this.testtoken1
        );
        console.log(`investor6 deposit...`);
        await expectRevert(depositToFundingPool(
            fundingPoolAdaptContract,
            this.NEW_DAO_ADDRESS,
            this.investor6,
            hre.ethers.utils.parseEther("2000"),
            this.testtoken1
        ), "revert");

        const poolBal = await fundingPoolAdaptContract.lpBalance(this.NEW_DAO_ADDRESS);
        console.log(`
        pool balance ${hre.ethers.utils.formatEther(poolBal)}
        `);
    });

    it("varify funding proposal...", async () => {
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.NEW_DAO_ADDRESS);
        const distributeFundContract = this.distributeFundAdapterv2;
        const vestingAdapter = this.vestingAdapter;
        const fundingPoolAdaptContract = this.fundingpoolAdapter;
        const votingContract = this.gpvoting;
        const allocContract = this.allocationAdapter;

        // Submit distribute proposal
        const requestedFundAmount = hre.ethers.utils.parseEther("3000");
        const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const vestingStartTime = blocktimestamp + 24;
        const vestingcliffDuration = oneWeek;
        const stepDuration = oneDay;
        const steps = 7;
        // const stepPercentage=hre.ethers.utils.parseEther("1").div(toBN(steps));
        const vestingCliffLockAmount = hre.ethers.utils.parseEther("1000");

        const projectTeamAddr = this.project_team1.address;
        const projectTeamTokenAddr = this.testtoken2.address;
        const GPAddr = await dao.getAddressConfiguration(sha3("GP_ADDRESS"));
        const DaoSquareAddr = await distributeFundContract.protocolAddress();

        const managementFeeRatio = await dao.getConfiguration(sha3("MANAGEMENT_FEE"))
        const protocolFeeRatio = await dao.getConfiguration(sha3("PROTOCOL_FEE"));
        await this.testtoken2.transfer(this.project_team1.address, tradingOffTokenAmount);
        await this.testtoken2.connect(this.project_team1).approve(distributeFundContract.address, tradingOffTokenAmount);

        const fundRaiseEndTime = await fundingPoolAdaptContract.getFundRaiseWindowCloseTime(this.NEW_DAO_ADDRESS);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseEndTime) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        console.log(`
        create funding proposal...
        `);
        let { proposalId } = await createDistributeFundsProposal(
            dao,
            distributeFundContract,
            requestedFundAmount,
            tradingOffTokenAmount,
            vestingStartTime,
            vestingcliffDuration,
            stepDuration,
            steps,
            vestingCliffLockAmount,
            projectTeamAddr,
            projectTeamTokenAddr,
            projectTeamAddr,
            this.owner
        );
        console.log(`new funding proposalId: ${hre.ethers.utils.toUtf8String(proposalId)}`);
        this.proposalId = proposalId;

        console.log(`
        start voting...
        `);
        await distributeFundContract.startVotingProcess(this.NEW_DAO_ADDRESS, proposalId);

        console.log(`voting...`);
        await votingContract.submitVote(this.NEW_DAO_ADDRESS, proposalId, 1);
        let fundingProposalInfo = await distributeFundContract.distributions(this.NEW_DAO_ADDRESS, proposalId);
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundingProposalInfo.proposalStopVotingTimestamp) + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has

        const rel = await votingContract.voteResult(this.NEW_DAO_ADDRESS, proposalId);
        console.log(`voting reuslt ${rel.state}`);

        let protocolAddressBal = await this.testtoken1.balanceOf(DaoSquareAddr);
        let gpAddressBal = await this.testtoken1.balanceOf(GPAddr);

        console.log(`
        protocolAddressBal ${hre.ethers.utils.formatEther(protocolAddressBal)}
        gpAddressBal ${hre.ethers.utils.formatEther(gpAddressBal)}
        `)

        console.log(`process funding proposal...`);
        await distributeFundContract.processProposal(this.NEW_DAO_ADDRESS, proposalId);

        protocolAddressBal = await this.testtoken1.balanceOf(DaoSquareAddr);
        gpAddressBal = await this.testtoken1.balanceOf(GPAddr);

        fundingProposalInfo = await distributeFundContract.distributions(this.NEW_DAO_ADDRESS, proposalId);

        const vestingOwnerEligible = await allocContract.ifEligible(this.NEW_DAO_ADDRESS, this.owner.address, proposalId);
        const vestinginvestor1Eligible = await allocContract.ifEligible(this.NEW_DAO_ADDRESS, this.investor1.address, proposalId);
        const vestinginvestor2Eligible = await allocContract.ifEligible(this.NEW_DAO_ADDRESS, this.investor2.address, proposalId);
        const vestinginvestor3Eligible = await allocContract.ifEligible(this.NEW_DAO_ADDRESS, this.investor3.address, proposalId);
        const vestinginvestor4Eligible = await allocContract.ifEligible(this.NEW_DAO_ADDRESS, this.investor4.address, proposalId);
        const vestinginvestor5Eligible = await allocContract.ifEligible(this.NEW_DAO_ADDRESS, this.investor5.address, proposalId);
        const vestinginvestor6Eligible = await allocContract.ifEligible(this.NEW_DAO_ADDRESS, this.investor6.address, proposalId);


        console.log(`
        funding proposal state ${fundingProposalInfo.status}
        protocolAddressBal ${hre.ethers.utils.formatEther(protocolAddressBal)}
        gpAddressBal ${hre.ethers.utils.formatEther(gpAddressBal)}
        vestingOwnerEligible ${vestingOwnerEligible}
        vestinginvestor1Eligible ${vestinginvestor1Eligible}
        vestinginvestor2Eligible ${vestinginvestor2Eligible}
        vestinginvestor3Eligible ${vestinginvestor3Eligible}
        vestinginvestor4Eligible ${vestinginvestor4Eligible}
        vestinginvestor5Eligible ${vestinginvestor5Eligible}
        vestinginvestor6Eligible ${vestinginvestor6Eligible}
        `);

        console.log(`
        crate vesting...
        `);
        let tx = await vestingAdapter.connect(this.investor1).createVesting(dao.address, this.investor1.address, this.proposalId);
        let result = await tx.wait();
        let vestId = result.events[result.events.length - 1].args.vestId;
        console.log(`
        created. vestId ${vestId}
        claime token...
        `);
        const vestingStartTimes = fundingProposalInfo.vestInfo.vestingStartTime;
        const vestingCliffDuration = fundingProposalInfo.vestInfo.vestingCliffDuration;
        const vestingStepDuration = fundingProposalInfo.vestInfo.vestingStepDuration;
        const vestingSteps = fundingProposalInfo.vestInfo.vestingSteps;
        await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(vestingStartTimes) +
            parseInt(vestingCliffDuration) +
            parseInt(vestingStepDuration) * vestingSteps
            + 1])
        await hre.network.provider.send("evm_mine") // this one will have 2021-07-01 12:00 AM as its timestamp, no matter what the previous block has
        let vestInfo = await vestingAdapter.vests(vestId);
        let claimableBal = await vestingAdapter.vestBalance(vestId);
        let totalDepositAmount = toBN(vestInfo.cliffShares.toString()).add(toBN(vestInfo.stepShares).mul(vestingSteps));
        console.log(`
        cliff shares ${hre.ethers.utils.formatEther(vestInfo.cliffShares.toString())}
        step shares ${hre.ethers.utils.formatEther(vestInfo.stepShares.toString())}
        recipient of vest ${vestId}: ${vestInfo.recipient}
        depoist amount ${hre.ethers.utils.formatEther(totalDepositAmount)}
        claimable balance of vest ${vestId}: ${hre.ethers.utils.formatEther(claimableBal)}
        `);

        await vestingAdapter.connect(this.investor1).withdraw(dao.address, vestId);
        claimableBal = await vestingAdapter.vestBalance(vestId);
        vestInfo = await vestingAdapter.vests(vestId);

        console.log(`
        claimable balance of vest ${vestId}: ${hre.ethers.utils.formatEther(claimableBal)}
        claimed amount of vest ${vestId}: ${hre.ethers.utils.formatEther(vestInfo.claimed)}
        `);

    });

});

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

        const { dao, factories, adapters, extensions, testContracts } = await deployDefaultDao({
            owner: this.owner,
            daoMode: 1,//  Vintage = 0, Flex = 1,   Collective = 2,
            daoName: _daoName
        });

        this.daoFactory = factories.daoFactory.instance;
        this.flexFundingPoolFactory = factories.flexFundingPoolFactory.instance;

        this.adapters = adapters;
        this.extensions = extensions;
        this.dao = dao;
        this.testContracts = testContracts;

        // this.flexFundingPoolExtension = extensions.flexFundingPoolExtension.functions;

        this.testtoken1 = testContracts.testToken1.instance;
        this.testtoken2 = testContracts.testRiceToken.instance;
        this.flexVesting = adapters.flexVesting.instance;
        this.flexERC721 = adapters.flexERC721.instance;
        this.flexAllocationAdapterContract = adapters.flexAllocationAdapterContract.instance;
        this.flexFundingPoolAdapterContract = adapters.flexFundingPoolAdapterContract.instance;
        this.flexVotingContract = adapters.flexVotingContract.instance;
        this.flexFundingAdapterContract = adapters.flexFundingAdapterContract.instance;
        this.bentoBoxV1 = adapters.bentoBoxV1.instance;
        this.managing = this.adapters.managing.instance;
        this.flexPollingVotingContract = adapters.flexPollingVotingContract.instance;


    });


    const sommonFlexDao = async (summonDaoContract, daoFactoryContract, flexDaoParams) => {
        let tx = await summonDaoContract.summonFlexDao1(flexDaoParams);
        let result = await tx.wait();
        const daoAddr = result.events[result.events.length - 1].args.daoAddr;
        const daoName = await daoFactoryContract.daos(daoAddr);

        console.log(`
        new dao address ${daoAddr}
        new dao name ${toUtf8(daoName)}
        `)
        tx = await summonDaoContract.summonFlexDao2(flexDaoParams, daoAddr);
        result = await tx.wait();

        console.log("summonFlexDao2 finished...");
        tx = await summonDaoContract.summonFlexDao3(flexDaoParams, daoAddr);
        result = await tx.wait();
        console.log("summonFlexDao3 finished...");

        tx = await summonDaoContract.summonFlexDao4(flexDaoParams, daoAddr);
        result = await tx.wait();
        console.log("summonFlexDao4 finished...");

        tx = await summonDaoContract.summonFlexDao5(flexDaoParams, daoAddr);
        result = await tx.wait();
        console.log("summonFlexDao5 finished...");

        tx = await summonDaoContract.summonFlexDao6(flexDaoParams, daoAddr);
        result = await tx.wait();
        console.log("summonFlexDao6 finished...");

        tx = await summonDaoContract.summonFlexDao7(flexDaoParams, daoAddr);
        result = await tx.wait();
        console.log("summonFlexDao7 finished...");

        tx = await summonDaoContract.summonFlexDao8(flexDaoParams, daoAddr);
        result = await tx.wait();
        console.log("summonFlexDao8 finished...");

        tx = await summonDaoContract.summonFlexDao9(flexDaoParams, daoAddr);
        result = await tx.wait();
        console.log("summonFlexDao9 finished...");

        tx = await summonDaoContract.summonFlexDao10(flexDaoParams, daoAddr);
        result = await tx.wait();
        console.log("summonFlexDao10 finished...");

        tx = await summonDaoContract.summonFlexDao11(flexDaoParams, daoAddr);
        result = await tx.wait();
        console.log("summonFlexDao11 finished...");

        return { daoAddr: daoAddr, daoName: daoName };
    };

    it("summon a flex dao...", async () => {

        const _daoName = "my_flex_dao2";

        console.log(`
            1.create dao...
        `)
        const { dao, name } = await createDao(
            {
                daoFactory: this.daoFactory,
                creator: this.owner.address,
                name: _daoName
            });

        const daoName = await this.daoFactory.daos(dao.address);
        console.log(`
            new dao addr ${dao.address}
            new dao name ${toUtf8(daoName)}
        `);

        console.log(`
            2.create flex funding pool extension...
        `);
        await this.flexFundingPoolFactory.create(dao.address);
        const flexFundingPoolExtensionAddress = await this.flexFundingPoolFactory.getExtensionAddress(
            dao.address
        );

        console.log(`
                3.add flex funding pool extension to dao...
        `);
        await dao.addExtension(
            sha3("flex-funding-pool-ext"),
            flexFundingPoolExtensionAddress,
            this.owner.address
        );


        console.log(`
            4.configure adapters ...
                add adapters to dao...
        `);
        const contractsWithAccess = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd',//FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35',//FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8',//FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c',//FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7',//FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610',//FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda',//FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 258
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//ManagingContract
                addr: this.managing.address,
                flags: 59
            }
        ]
        await this.daoFactory.addAdapters(dao.address, contractsWithAccess);

        console.log(`
                configure adapters access to extensions ...
        `);
        //FLexFundingPoolExtension
        let withAccess = [
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingPoolAdapterContract.address,//FlexFundingPoolAdapterContract
                flags: 75
            },
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingAdapterContract.address,//FlexFundingAdapterContract
                flags: 26
            }
        ];
        await this.daoFactory.configureExtension(
            dao.address,
            flexFundingPoolExtensionAddress,//FLexFundingPoolExtension
            withAccess
        );

    });

    it("summom a flex dao by summon contract...", async () => {
        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];
        const _daoName = "my_flex_dao002";

        const creator = this.owner.address;
        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd',//FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35',//FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8',//FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c',//FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7',//FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610',//FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda',//FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 258
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//ManagingContract
                addr: this.managing.address,
                flags: 59
            }
        ];

        const adapters1 = [
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingPoolAdapterContract.address,//FlexFundingPoolAdapterContract
                flags: 75
            },
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingAdapterContract.address,//FlexFundingAdapterContract
                flags: 26
            }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        // struct flexDaoParticipantCapInfo {
        //     bool enable;
        //     uint256 maxParticipantsAmount;
        // }

        const flexDaoParticipantCapInfo = [
            true,//bool enable;
            5//uint256 maxParticipantsAmount;
        ]

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMemberships = [
            "participantmembershipInfo01", // string name;
            0,// uint8 varifyType;
            hre.ethers.utils.parseEther("100"),  // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0,// uint256 tokenId;
            [ZERO_ADDRESS]//whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [ZERO_ADDRESS] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            60 * 10,// uint256 votingPeriod;
            0, // uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10    // uint256 proposalExecutePeriod;
        ];

        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0,  // uint256 tokenId;
            [ZERO_ADDRESS] //address[] whiteList;
        ];
        const flexDaoPollingInfo = [
            60 * 10,// uint256 votingPeriod;
            0,// uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const flexDaoProposerMembershipInfo = [
            0,  // uint8 varifyType;
            hre.ethers.utils.parseEther("100"),  // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,   // uint256 tokenId;
            [ZERO_ADDRESS]  // address[] whiteList;
        ];

        const flexDaoManagementfee = 2;
        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];

        const fundingPollEnable = false;
        const flexDaoFundriaseStyle = 0// 0 - FCFS 1- Free in
        const flexDaoInfo = {
            name: _daoName,// string name;
            creator: this.owner.address,  // address creator;
            flexDaoManagementfee: flexDaoManagementfee,   // uint256 flexDaoManagementfee;
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0,    // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address,// address tokenAddress;
            tokenId: 0,  // uint256 tokenId;
            whiteList: [],   // address[] whiteList;
            priorityPeriod: 60 * 10      // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships,   // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo,// flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo,    //    flexDaoInfo _flexDaoInfo;
        ];

        // console.log("flexDaoParams:", flexDaoParams);
        await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);
    });

    it("varify genesis steward...", async () => {
        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];
        const _daoName = "my_flex_dao003";
        const creator = this.owner.address;
        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd',//FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35',//FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8',//FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c',//FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7',//FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610',//FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda',//FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 258
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//ManagingContract
                addr: this.managing.address,
                flags: 59
            }
        ];
        const adapters1 = [
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingPoolAdapterContract.address,//FlexFundingPoolAdapterContract
                flags: 75
            },
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingAdapterContract.address,//FlexFundingAdapterContract
                flags: 26
            }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const flexDaoParticipantCapInfo = [
            true,//bool enable;
            5//uint256 maxParticipantsAmount;
        ];
        const flexDaoParticipantMembershipEnalbe = false;

        const flexDaoParticipantsMemberships = [
            "", // string name;
            0,// uint8 varifyType;
            hre.ethers.utils.parseEther("0"),  // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0,// uint256 tokenId;
            [ZERO_ADDRESS]//whiteList;
        ];
        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            60 * 10,// uint256 votingPeriod;
            0, // uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10    // uint256 proposalExecutePeriod;
        ];
        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0,// uint256 tokenId;
            [] // address[] whiteList;

        ];

        const flexDaoPollingInfo = [
            60 * 10,// uint256 votingPeriod;
            0,// uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        const flexDaoProposerMembershipInfo = [
            0,  // uint8 varifyType;
            hre.ethers.utils.parseEther("100"),  // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,   // uint256 tokenId;
            []  // address[] whiteList;
        ];
        const flexDaoManagementfee = 2;
        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];
        const fundingPollEnable = false;

        const flexDaoFundriaseStyle = 0// 0 - FCFS 1- Free in
        const flexDaoInfo = {
            name: _daoName,// string name;
            creator: this.owner.address,  // address creator;
            flexDaoManagementfee: flexDaoManagementfee,   // uint256 flexDaoManagementfee;
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0,    // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address,// address tokenAddress;
            tokenId: 0,  // uint256 tokenId;
            whiteList: [],   // address[] whiteList;
            priorityPeriod: 60 * 10      // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMemberships,   // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo,// flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo,    //    flexDaoInfo _flexDaoInfo;
        ];

        const { daoAddr, daoName } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);

        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const is_genesis_steward1 = await daoContract.isMember(this.genesis_steward1.address);
        const is_genesis_steward2 = await daoContract.isMember(this.genesis_steward2.address);

        const flexFundingPoolAdaptAddress = await daoContract.getAdapterAddress(sha3("flex-funding-pool-adatper"));
        console.log(`
        flexFundingPoolAdaptAddress $${flexFundingPoolAdaptAddress}
        `);
        const flexFundingPoolAdapterContract = (await hre.ethers.getContractFactory("FlexFundingPoolAdapterContract")).attach(flexFundingPoolAdaptAddress);

        const result = await flexFundingPoolAdapterContract.isParticipantWhiteList(daoAddr, "participantmembershipInfo01", "0x540881ECaF34C85EfB352727FC2F9858B19C4b08")
        console.log(`
        whitelist: ${result}
        `);

        console.log(`
            new dao address ${daoAddr}
            new dao name ${toUtf8(daoName)}
            is_genesis_steward1 ${is_genesis_steward1}
            is_genesis_steward2 ${is_genesis_steward2}
            `)
    });

    it("varify proposer membership - ERC20", async () => {
        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];
        const _daoName = "my_flex_dao004";
        const creator = this.owner.address;
        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd',//FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35',//FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8',//FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c',//FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7',//FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610',//FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda',//FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 258
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//ManagingContract
                addr: this.managing.address,
                flags: 59
            }
        ];
        const adapters1 = [
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingPoolAdapterContract.address,//FlexFundingPoolAdapterContract
                flags: 75
            },
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingAdapterContract.address,//FlexFundingAdapterContract
                flags: 26
            }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const flexDaoParticipantCapInfo = [
            true,//bool enable;
            5//uint256 maxParticipantsAmount;
        ];
        const flexDaoParticipantMembershipEnalbe = false;
        const flexDaoParticipantsMembershipInfo = [
            "", // string name;
            0,// uint8 varifyType;
            hre.ethers.utils.parseEther("0"),  // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0,// uint256 tokenId;
            [ZERO_ADDRESS]//whiteList;
        ];
        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            60 * 10,// uint256 votingPeriod;
            0, // uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10    // uint256 proposalExecutePeriod;
        ];
        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            []  // address[] whiteList;

        ];
        const fundingPollEnable = false;
        const flexDaoPollingInfo = [
            60 * 10,// uint256 votingPeriod;
            0,// uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        const flexDaoProposerMembershipInfo = [
            0,  // uint8 varifyType;
            hre.ethers.utils.parseEther("100"),  // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,   // uint256 tokenId;
            []  // address[] whiteList;
        ];
        const flexDaoManagementfee = 2;
        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];

        const flexDaoFundriaseStyle = 0// 0 - FCFS 1- Free in
        const flexDaoInfo = {
            name: _daoName,// string name;
            creator: this.owner.address,  // address creator;
            flexDaoManagementfee: flexDaoManagementfee,   // uint256 flexDaoManagementfee;
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0,    // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address,// address tokenAddress;
            tokenId: 0,  // uint256 tokenId;
            whiteList: [],   // address[] whiteList;
            priorityPeriod: 60 * 10      // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMembershipInfo,   // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo,// flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo,    //    flexDaoInfo _flexDaoInfo;
        ];

        const { daoAddr, daoName } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);

        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const is_genesis_steward1 = await daoContract.isMember(this.genesis_steward1.address);
        const is_genesis_steward2 = await daoContract.isMember(this.genesis_steward2.address);

        console.log(`
            new dao address ${daoAddr}
            new dao name ${toUtf8(daoName)}
            is_genesis_steward1 ${is_genesis_steward1}
            is_genesis_steward2 ${is_genesis_steward2}
            `);

        // submit fle funding proposal...
        const flexFundingContract = this.flexFundingAdapterContract;

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

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let vestingStartTime = blocktimestamp + 100000;
        let vestingCliffDuration = 600;
        let vestingStepDuration = 600;
        let vestingSteps = 10;
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("1000");

        let vestInfo = [
            vestingStartTime,
            vestingCliffDuration,
            vestingStepDuration,
            vestingSteps,
            vestingCliffLockAmount
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

        let priorityDeposit = true;

        let pPeriod = 100;
        let pPeriods = 10;
        let pType = 0;
        let pChainId = 1;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;

        let priorityDepositInfo = [
            pPeriod,
            pPeriods,
            pType,
            pChainId,
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
            priorityDeposit,
            priorityDepositInfo
        ];

        let tokenRewardAmount = 2;
        let cashRewardAmount = hre.ethers.utils.parseEther("1000");
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];
        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos
        ];
        await expectRevert(flexFundingContract.connect(this.funding_proposer1).
            submitProposal(daoAddr, fundingParams), "revert");

        await this.testtoken1.transfer(this.funding_proposer1.address, hre.ethers.utils.parseEther("10000"));
        const tx1 = await flexFundingContract.connect(this.funding_proposer1).
            submitProposal(daoAddr, fundingParams);
        const result1 = await tx1.wait();
        const ProposalId = result1.events[2].args.proposalId;
        console.log(`flex funding ProposalId: ${hre.ethers.utils.toUtf8String(ProposalId)}`);
    });

    it("varify proposer membership - ERC721", async () => {
        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];
        const _daoName = "my_flex_dao005";
        const creator = this.owner.address;
        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd',//FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35',//FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8',//FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c',//FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7',//FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610',//FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda',//FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 258
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//ManagingContract
                addr: this.managing.address,
                flags: 59
            }
        ];
        const adapters1 = [
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingPoolAdapterContract.address,//FlexFundingPoolAdapterContract
                flags: 75
            },
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingAdapterContract.address,//FlexFundingAdapterContract
                flags: 26
            }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const flexDaoParticipantCapInfo = [
            true,//bool enable;
            5//uint256 maxParticipantsAmount;
        ];
        const flexDaoParticipantMembershipEnalbe = false;

        const flexDaoParticipantsMembershipInfo = [
            "", // string name;
            0,// uint8 varifyType;
            hre.ethers.utils.parseEther("0"),  // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0,// uint256 tokenId;
            [ZERO_ADDRESS]//whiteList;
        ];
        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            60 * 10,// uint256 votingPeriod;
            0, // uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10    // uint256 proposalExecutePeriod;
        ];
        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [] // address[] whiteList;
        ];

        const flexDaoPollingInfo = [
            60 * 10,// uint256 votingPeriod;
            0,// uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        const ERC721 = await hre.ethers.getContractFactory("PixelNFT");
        const erc721 = await ERC721.deploy(4);
        await erc721.deployed();
        const flexDaoProposerMembershipInfo = [
            1,  // uint8 varifyType;
            2,  // uint256 minHolding;
            erc721.address,  // address tokenAddress;
            0,   // uint256 tokenId;
            []  // address[] whiteList;
        ];
        const flexDaoManagementfee = 2;
        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];
        const fundingPollEnable = false;

        const flexDaoFundriaseStyle = 0// 0 - FCFS 1- Free in
        const flexDaoInfo = {
            name: _daoName,// string name;
            creator: this.owner.address,  // address creator;
            flexDaoManagementfee: flexDaoManagementfee,   // uint256 flexDaoManagementfee;
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0,    // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address,// address tokenAddress;
            tokenId: 0,  // uint256 tokenId;
            whiteList: [],   // address[] whiteList;
            priorityPeriod: 60 * 10      // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMembershipInfo,   // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo,// flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo,    //    flexDaoInfo _flexDaoInfo;
        ];

        const { daoAddr, daoName } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);

        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const is_genesis_steward1 = await daoContract.isMember(this.genesis_steward1.address);
        const is_genesis_steward2 = await daoContract.isMember(this.genesis_steward2.address);

        console.log(`
            new dao address ${daoAddr}
            new dao name ${toUtf8(daoName)}
            is_genesis_steward1 ${is_genesis_steward1}
            is_genesis_steward2 ${is_genesis_steward2}
            `);

        // submit fle funding proposal...
        const flexFundingContract = this.flexFundingAdapterContract;

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

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let vestingStartTime = blocktimestamp + 100000;
        let vestingCliffDuration = 600;
        let vestingStepDuration = 600;
        let vestingSteps = 10;
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("1000");

        let vestInfo = [
            vestingStartTime,
            vestingCliffDuration,
            vestingStepDuration,
            vestingSteps,
            vestingCliffLockAmount
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

        let priorityDeposit = true;

        let pPeriod = 100;
        let pPeriods = 10;
        let pType = 0;
        let pChainId = 1;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;

        let priorityDepositInfo = [
            pPeriod,
            pPeriods,
            pType,
            pChainId,
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
            priorityDeposit,
            priorityDepositInfo
        ];

        let tokenRewardAmount = 2;
        let cashRewardAmount = hre.ethers.utils.parseEther("1000");
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];
        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos
        ];
        await expectRevert(flexFundingContract.connect(this.funding_proposer1).
            submitProposal(daoAddr, fundingParams), "revert");

        console.log(`mint NFT...`);
        await erc721.mintPixel(this.funding_proposer1.address, 1, 1);
        await erc721.mintPixel(this.funding_proposer1.address, 2, 2);
        console.log(`minted...`);
        const tx1 = await flexFundingContract.connect(this.funding_proposer1).
            submitProposal(daoAddr, fundingParams);
        const result1 = await tx1.wait();
        const ProposalId = result1.events[2].args.proposalId;
        console.log(`flex funding ProposalId: ${hre.ethers.utils.toUtf8String(ProposalId)}`);
    });

    it("varify proposer membership - ERC1155", async () => {
        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];
        const _daoName = "my_flex_dao006";
        const creator = this.owner.address;
        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd',//FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35',//FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8',//FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c',//FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7',//FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610',//FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda',//FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 258
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//ManagingContract
                addr: this.managing.address,
                flags: 59
            }
        ];
        const adapters1 = [
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingPoolAdapterContract.address,//FlexFundingPoolAdapterContract
                flags: 75
            },
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingAdapterContract.address,//FlexFundingAdapterContract
                flags: 26
            }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const flexDaoParticipantCapInfo = [
            true,//bool enable;
            5//uint256 maxParticipantsAmount;
        ];
        const flexDaoParticipantMembershipEnalbe = false;

        const flexDaoParticipantsMembershipInfo = [
            "", // string name;
            0,// uint8 varifyType;
            hre.ethers.utils.parseEther("0"),  // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0,// uint256 tokenId;
            [ZERO_ADDRESS]//whiteList;
        ];
        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            60 * 10,// uint256 votingPeriod;
            0, // uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10    // uint256 proposalExecutePeriod;
        ];
        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [] // address[] whiteList;
        ];

        const flexDaoPollingInfo = [
            60 * 10,// uint256 votingPeriod;
            0,// uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10 // uint256 proposalExecutePeriod;
        ];
        const ERC1155 = await hre.ethers.getContractFactory("ERC1155TestToken");
        const erc1155 = await ERC1155.deploy("this is test uri");
        await erc1155.deployed();
        const flexDaoProposerMembershipInfo = [
            2,  // uint8 varifyType;
            2,  // uint256 minHolding;
            erc1155.address,  // address tokenAddress;
            1,   // uint256 tokenId;
            []  // address[] whiteList;
        ];
        const flexDaoManagementfee = 2;
        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];
        const fundingPollEnable = false;

        const flexDaoFundriaseStyle = 0// 0 - FCFS 1- Free in
        const flexDaoInfo = {
            name: _daoName,// string name;
            creator: this.owner.address,  // address creator;
            flexDaoManagementfee: flexDaoManagementfee,   // uint256 flexDaoManagementfee;
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0,    // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address,// address tokenAddress;
            tokenId: 0,  // uint256 tokenId;
            whiteList: [],   // address[] whiteList;
            priorityPeriod: 60 * 10      // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMembershipInfo,   // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo,// flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo,    //    flexDaoInfo _flexDaoInfo;
        ];

        const { daoAddr, daoName } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);

        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const is_genesis_steward1 = await daoContract.isMember(this.genesis_steward1.address);
        const is_genesis_steward2 = await daoContract.isMember(this.genesis_steward2.address);

        console.log(`
            new dao address ${daoAddr}
            new dao name ${toUtf8(daoName)}
            is_genesis_steward1 ${is_genesis_steward1}
            is_genesis_steward2 ${is_genesis_steward2}
            `);

        // submit fle funding proposal...
        const flexFundingContract = this.flexFundingAdapterContract;

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

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let vestingStartTime = blocktimestamp + 100000;
        let vestingCliffDuration = 600;
        let vestingStepDuration = 600;
        let vestingSteps = 10;
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("1000");

        let vestInfo = [
            vestingStartTime,
            vestingCliffDuration,
            vestingStepDuration,
            vestingSteps,
            vestingCliffLockAmount
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

        let priorityDeposit = true;

        let pPeriod = 100;
        let pPeriods = 10;
        let pType = 0;
        let pChainId = 1;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;

        let priorityDepositInfo = [
            pPeriod,
            pPeriods,
            pType,
            pChainId,
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
            priorityDeposit,
            priorityDepositInfo
        ];

        let tokenRewardAmount = 2;
        let cashRewardAmount = hre.ethers.utils.parseEther("1000");
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];
        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos
        ];
        await expectRevert(flexFundingContract.connect(this.funding_proposer1).
            submitProposal(daoAddr, fundingParams), "revert");

        console.log(`mint ERC1155 to funding_proposer1...`);
        await erc1155.mint(this.funding_proposer1.address, 1, 2, hexToBytes(toHex(2233)));
        console.log(`minted...`);
        const tx1 = await flexFundingContract.connect(this.funding_proposer1).
            submitProposal(daoAddr, fundingParams);
        const result1 = await tx1.wait();
        const ProposalId = result1.events[2].args.proposalId;
        console.log(`flex funding ProposalId: ${hre.ethers.utils.toUtf8String(ProposalId)}`);
    });

    it("varify proposer membership - WhiteList", async () => {
        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];
        const _daoName = "my_flex_dao007";
        const creator = this.owner.address;
        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd',//FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35',//FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8',//FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c',//FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7',//FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610',//FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda',//FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 258
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//ManagingContract
                addr: this.managing.address,
                flags: 59
            }
        ];
        const adapters1 = [
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingPoolAdapterContract.address,//FlexFundingPoolAdapterContract
                flags: 75
            },
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingAdapterContract.address,//FlexFundingAdapterContract
                flags: 26
            }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const flexDaoParticipantCapInfo = [
            true,//bool enable;
            5//uint256 maxParticipantsAmount;
        ];
        const flexDaoParticipantMembershipEnalbe = false;

        const flexDaoParticipantsMembershipInfo = [
            "", // string name;
            0,// uint8 varifyType;
            hre.ethers.utils.parseEther("0"),  // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0,// uint256 tokenId;
            [ZERO_ADDRESS]//whiteList;
        ];
        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            60 * 10,// uint256 votingPeriod;
            0, // uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10    // uint256 proposalExecutePeriod;
        ];
        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [] // address[] whiteList;
        ];

        const flexDaoPollingInfo = [
            60 * 10,// uint256 votingPeriod;
            0,// uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const flexDaoProposerMembershipInfo = [
            3,  // uint8 varifyType;
            0,  // uint256 minHolding;
            ZERO_ADDRESS,  // address tokenAddress;
            0,   // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address]  // address[] whiteList;
        ];
        const flexDaoManagementfee = 2;
        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];
        const fundingPollEnable = false;

        const flexDaoFundriaseStyle = 0// 0 - FCFS 1- Free in
        const flexDaoInfo = {
            name: _daoName,// string name;
            creator: this.owner.address,  // address creator;
            flexDaoManagementfee: flexDaoManagementfee,   // uint256 flexDaoManagementfee;
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0,    // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address,// address tokenAddress;
            tokenId: 0,  // uint256 tokenId;
            whiteList: [],   // address[] whiteList;
            priorityPeriod: 60 * 10      // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMembershipInfo,   // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo,// flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo,    //    flexDaoInfo _flexDaoInfo;
        ];

        const { daoAddr, daoName } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);

        this.daoAddress = daoAddr;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const is_genesis_steward1 = await daoContract.isMember(this.genesis_steward1.address);
        const is_genesis_steward2 = await daoContract.isMember(this.genesis_steward2.address);
        const proposerWhitelist = await this.flexFundingAdapterContract.getProposerWhitelist(daoAddr);
        console.log(`
            new dao address ${daoAddr}
            new dao name ${toUtf8(daoName)}
            is_genesis_steward1 ${is_genesis_steward1}
            is_genesis_steward2 ${is_genesis_steward2}
            proposerWhitelist ${proposerWhitelist}
            `);

        // submit fle funding proposal...
        const flexFundingContract = this.flexFundingAdapterContract;

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

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let vestingStartTime = blocktimestamp + 100000;
        let vestingCliffDuration = 600;
        let vestingStepDuration = 600;
        let vestingSteps = 10;
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("1000");

        let vestInfo = [
            vestingStartTime,
            vestingCliffDuration,
            vestingStepDuration,
            vestingSteps,
            vestingCliffLockAmount
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

        let priorityDeposit = true;

        let pPeriod = 100;
        let pPeriods = 10;
        let pType = 0;
        let pChainId = 1;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;

        let priorityDepositInfo = [
            pPeriod,
            pPeriods,
            pType,
            pChainId,
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
            priorityDeposit,
            priorityDepositInfo
        ];

        let tokenRewardAmount = 2;
        let cashRewardAmount = hre.ethers.utils.parseEther("1000");
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];
        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos
        ];
        await expectRevert(flexFundingContract.connect(this.funding_proposer1).
            submitProposal(daoAddr, fundingParams), "revert");


        const tx1 = await flexFundingContract.connect(this.funding_proposer1_whitelist).
            submitProposal(daoAddr, fundingParams);
        const result1 = await tx1.wait();
        const ProposalId = result1.events[2].args.proposalId;
        console.log(`flex funding ProposalId: ${hre.ethers.utils.toUtf8String(ProposalId)}`);
    });

    it("varify participant membership - ERC20", async () => {

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];
        const _daoName = "my_flex_dao008";
        const creator = this.owner.address;
        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd',//FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35',//FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8',//FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c',//FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7',//FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610',//FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda',//FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 258
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//ManagingContract
                addr: this.managing.address,
                flags: 59
            }
        ];
        const adapters1 = [
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingPoolAdapterContract.address,//FlexFundingPoolAdapterContract
                flags: 75
            },
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingAdapterContract.address,//FlexFundingAdapterContract
                flags: 26
            }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const flexDaoParticipantCapInfo = [
            true,//bool enable;
            5//uint256 maxParticipantsAmount;
        ];

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMembershipInfo = [
            "participantmembershipInfo01", // string name;
            0,// uint8 varifyType;
            hre.ethers.utils.parseEther("100"),  // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0,// uint256 tokenId;
            [ZERO_ADDRESS]//whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            60 * 10,// uint256 votingPeriod;
            0, // uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10    // uint256 proposalExecutePeriod;
        ];

        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [] // address[] whiteList;
        ];

        const flexDaoPollingInfo = [
            60 * 10,// uint256 votingPeriod;
            0,// uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const flexDaoProposerMembershipInfo = [
            3,  // uint8 varifyType;
            0,  // uint256 minHolding;
            ZERO_ADDRESS,  // address tokenAddress;
            0,   // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address]  // address[] whiteList;
        ];

        const flexDaoManagementfee = 2;
        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];
        const fundingPollEnable = false;

        const flexDaoFundriaseStyle = 0// 0 - FCFS 1- Free in

        const flexDaoInfo = {
            name: _daoName,// string name;
            creator: this.owner.address,  // address creator;
            flexDaoManagementfee: flexDaoManagementfee,   // uint256 flexDaoManagementfee;
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0,    // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address,// address tokenAddress;
            tokenId: 0,  // uint256 tokenId;
            whiteList: [],   // address[] whiteList;
            priorityPeriod: 60 * 10      // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMembershipInfo,   // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo,// flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo,    //    flexDaoInfo _flexDaoInfo;
        ];

        const { daoAddr, daoName } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);

        this.daoAddress = daoAddr;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const is_genesis_steward1 = await daoContract.isMember(this.genesis_steward1.address);
        const is_genesis_steward2 = await daoContract.isMember(this.genesis_steward2.address);

        const participantMembershipInfo1 = await this.flexFundingPoolAdapterContract.
            getParticipantMembershipInfo(daoAddr, flexDaoParticipantsMembershipInfo[0]);

        expect(participantMembershipInfo1.created, true);

        console.log(`
            new dao address ${daoAddr}
            new dao name ${toUtf8(daoName)}
            is_genesis_steward1 ${is_genesis_steward1}
            is_genesis_steward2 ${is_genesis_steward2}

            participantMembershipInfo1:
             ${participantMembershipInfo1.created}
             ${participantMembershipInfo1.varifyType}
             ${participantMembershipInfo1.minHolding}
             ${participantMembershipInfo1.tokenAddress}
             ${participantMembershipInfo1.tokenId}
            `);
    });

    it("varify participant membership - ERC721", async () => {

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];
        const _daoName = "my_flex_dao009";
        const _creator = this.owner.address;
        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd',//FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35',//FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8',//FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c',//FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7',//FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610',//FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda',//FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 258
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//ManagingContract
                addr: this.managing.address,
                flags: 59
            }
        ];
        const adapters1 = [
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingPoolAdapterContract.address,//FlexFundingPoolAdapterContract
                flags: 75
            },
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingAdapterContract.address,//FlexFundingAdapterContract
                flags: 26
            }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const flexDaoParticipantCapInfo = [
            true,//bool enable;
            5//uint256 maxParticipantsAmount;
        ];

        const flexDaoParticipantMembershipEnalbe = true;

        const ERC721 = await hre.ethers.getContractFactory("PixelNFT");
        const erc721 = await ERC721.deploy(4);
        await erc721.deployed();

        const flexDaoParticipantsMembershipInfo = [
            "participantmembershipInfo01", // string name;
            1,// uint8 varifyType;
            1,  // uint256 minHolding;
            erc721.address, // address tokenAddress;
            0,// uint256 tokenId;
            [ZERO_ADDRESS]//whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            60 * 10,// uint256 votingPeriod;
            0, // uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10    // uint256 proposalExecutePeriod;
        ];

        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [] // address[] whiteList;
        ];

        const flexDaoPollingInfo = [
            60 * 10,// uint256 votingPeriod;
            0,// uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const flexDaoProposerMembershipInfo = [
            3,  // uint8 varifyType;
            0,  // uint256 minHolding;
            ZERO_ADDRESS,  // address tokenAddress;
            0,   // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address]  // address[] whiteList;
        ];

        const flexDaoManagementfee = 2;
        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];
        const fundingPollEnable = false;

        const flexDaoFundriaseStyle = 0// 0 - FCFS 1- Free in

        const flexDaoInfo = {
            name: _daoName,// string name;
            creator: _creator,  // address creator;
            flexDaoManagementfee: flexDaoManagementfee,   // uint256 flexDaoManagementfee;
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0,    // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address,// address tokenAddress;
            tokenId: 0,  // uint256 tokenId;
            whiteList: [],   // address[] whiteList;
            priorityPeriod: 60 * 10      // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMembershipInfo,   // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo,// flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo,    //    flexDaoInfo _flexDaoInfo;
        ];

        const { daoAddr, daoName } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);

        this.daoAddress = daoAddr;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const is_genesis_steward1 = await daoContract.isMember(this.genesis_steward1.address);
        const is_genesis_steward2 = await daoContract.isMember(this.genesis_steward2.address);

        const participantMembershipInfo1 = await this.flexFundingPoolAdapterContract.
            getParticipantMembershipInfo(daoAddr, flexDaoParticipantsMembershipInfo[0]);


        expect(participantMembershipInfo1.created, true);

        console.log(`
            new dao address ${daoAddr}
            new dao name ${toUtf8(daoName)}
            is_genesis_steward1 ${is_genesis_steward1}
            is_genesis_steward2 ${is_genesis_steward2}

            participantMembershipInfo1:
             ${participantMembershipInfo1.created}
             ${participantMembershipInfo1.varifyType}
             ${participantMembershipInfo1.minHolding}
             ${participantMembershipInfo1.tokenAddress}
             ${participantMembershipInfo1.tokenId}
            `);
    });

    it("varify participant membership - WhiteList", async () => {

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];
        const _daoName = "my_flex_dao010";
        const _creator = this.owner.address;
        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd',//FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35',//FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8',//FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c',//FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7',//FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda',//FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 258
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//ManagingContract
                addr: this.managing.address,
                flags: 59
            }
        ];
        const adapters1 = [
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingPoolAdapterContract.address,//FlexFundingPoolAdapterContract
                flags: 75
            },
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingAdapterContract.address,//FlexFundingAdapterContract
                flags: 26
            }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const flexDaoParticipantCapInfo = [
            true,//bool enable;
            5//uint256 maxParticipantsAmount;
        ];

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMembershipInfo = [
            "participantmembershipInfo01", // string name;
            3,// uint8 varifyType;
            1,  // uint256 minHolding;
            ZERO_ADDRESS, // address tokenAddress;
            0,// uint256 tokenId;
            [this.participant_membership_whitelist1.address]//whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            60 * 10,// uint256 votingPeriod;
            0, // uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10    // uint256 proposalExecutePeriod;
        ];

        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [] // address[] whiteList;
        ];

        const flexDaoPollingInfo = [
            60 * 10,// uint256 votingPeriod;
            0,// uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const flexDaoProposerMembershipInfo = [
            3,  // uint8 varifyType;
            0,  // uint256 minHolding;
            ZERO_ADDRESS,  // address tokenAddress;
            0,   // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address]  // address[] whiteList;
        ];

        const flexDaoManagementfee = 2;
        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];
        const fundingPollEnable = false;

        const flexDaoFundriaseStyle = 0// 0 - FCFS 1- Free in

        const flexDaoInfo = {
            name: _daoName,// string name;
            creator: _creator,  // address creator;
            flexDaoManagementfee: flexDaoManagementfee,   // uint256 flexDaoManagementfee;
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0,    // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address,// address tokenAddress;
            tokenId: 0,  // uint256 tokenId;
            whiteList: [],   // address[] whiteList;
            priorityPeriod: 60 * 10      // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMembershipInfo,   // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo,// flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo,    //    flexDaoInfo _flexDaoInfo;
        ];

        const { daoAddr, daoName } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);

        this.daoAddress = daoAddr;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const is_genesis_steward1 = await daoContract.isMember(this.genesis_steward1.address);
        const is_genesis_steward2 = await daoContract.isMember(this.genesis_steward2.address);

        const participantMembershipInfo1 = await this.flexFundingPoolAdapterContract.
            getParticipantMembershipInfo(daoAddr, flexDaoParticipantsMembershipInfo[0]);

        const isParticipantWhitelist1 = await this.flexFundingPoolAdapterContract.
            isParticipantWhiteList(daoAddr,
                flexDaoParticipantsMembershipInfo[0],
                this.participant_membership_whitelist1.address);



        expect(participantMembershipInfo1.created, true);

        expect(isParticipantWhitelist1.created, true);

        const participantWhitelist = await this.flexFundingPoolAdapterContract.getParticipanWhitelist(daoAddr, "participantmembershipInfo01");

        console.log(`
            new dao address ${daoAddr}
            new dao name ${toUtf8(daoName)}
            is_genesis_steward1 ${is_genesis_steward1}
            is_genesis_steward2 ${is_genesis_steward2}

            participantMembershipInfo1:
             ${participantMembershipInfo1.created}
             ${participantMembershipInfo1.varifyType}
             ${participantMembershipInfo1.minHolding}
             ${participantMembershipInfo1.tokenAddress}
             ${participantMembershipInfo1.tokenId}
             participantWhitelist ${participantWhitelist}
            `);
    });

    it("varify priority deposit membership - ERC20", async () => {

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];
        const _daoName = "my_flex_dao011";
        const creator = this.owner.address;

        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd',//FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35',//FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8',//FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c',//FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7',//FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610',//FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda',//FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 258
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//ManagingContract
                addr: this.managing.address,
                flags: 59
            }
        ];

        const adapters1 = [
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingPoolAdapterContract.address,//FlexFundingPoolAdapterContract
                flags: 75
            },
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingAdapterContract.address,//FlexFundingAdapterContract
                flags: 26
            }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const flexDaoParticipantCapInfo = [
            true,//bool enable;
            5//uint256 maxParticipantsAmount;
        ];

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMembershipInfo = [
            "participantmembershipInfo01", // string name;
            0,// uint8 varifyType;
            hre.ethers.utils.parseEther("100"),  // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0,// uint256 tokenId;
            [ZERO_ADDRESS]//whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            60 * 10,// uint256 votingPeriod;
            0, // uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10    // uint256 proposalExecutePeriod;
        ];

        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [] // address[] whiteList;
        ];

        const flexDaoPollingInfo = [
            60 * 10,// uint256 votingPeriod;
            0,// uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const flexDaoProposerMembershipInfo = [
            3,  // uint8 varifyType;
            0,  // uint256 minHolding;
            ZERO_ADDRESS,  // address tokenAddress;
            0,   // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address]  // address[] whiteList;
        ];

        const flexDaoManagementfee = 2;
        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];
        const fundingPollEnable = false;

        const flexDaoFundriaseStyle = 0// 0 - FCFS 1- Free in

        const flexDaoInfo = {
            name: _daoName,// string name;
            creator: this.owner.address,  // address creator;
            flexDaoManagementfee: flexDaoManagementfee,   // uint256 flexDaoManagementfee;
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 0,    // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
            tokenAddress: this.testtoken1.address,// address tokenAddress;
            tokenId: 0,  // uint256 tokenId;
            whiteList: [],   // address[] whiteList;
            priorityPeriod: 60 * 10      // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMembershipInfo,   // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo,// flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo,    //    flexDaoInfo _flexDaoInfo;
        ];

        const { daoAddr, daoName } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);

        this.daoAddress = daoAddr;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const is_genesis_steward1 = await daoContract.isMember(this.genesis_steward1.address);
        const is_genesis_steward2 = await daoContract.isMember(this.genesis_steward2.address);

        const FLEX_PRIORITY_DEPOSIT_ENABLE = await daoContract.getConfiguration(sha3("FLEX_PRIORITY_DEPOSIT_ENABLE"));
        const FLEX_PRIORITY_DEPOSIT_PERIOD = await daoContract.getConfiguration(sha3("FLEX_PRIORITY_DEPOSIT_PERIOD"));
        const FLEX_PRIORITY_DEPOSIT_TOKEN_ADDRESS = await daoContract.getAddressConfiguration(sha3("FLEX_PRIORITY_DEPOSIT_TOKEN_ADDRESS"));
        const FLEX_PRIORITY_DEPOSIT_MIN_HOLDING = await daoContract.getConfiguration(sha3("FLEX_PRIORITY_DEPOSIT_MIN_HOLDING"));
        console.log(`
            new dao address ${daoAddr}
            new dao name ${toUtf8(daoName)}
            is_genesis_steward1 ${is_genesis_steward1}
            is_genesis_steward2 ${is_genesis_steward2}

            priority deposit membership Info:
             ${FLEX_PRIORITY_DEPOSIT_ENABLE}
             ${FLEX_PRIORITY_DEPOSIT_PERIOD}
             ${FLEX_PRIORITY_DEPOSIT_TOKEN_ADDRESS}
             ${hre.ethers.utils.formatEther(FLEX_PRIORITY_DEPOSIT_MIN_HOLDING)}
            `);
    });

    it("varify priority deposit membership - WhiteList", async () => {

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];
        const _daoName = "my_flex_dao012";
        const creator = this.owner.address;

        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd',//FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35',//FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8',//FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c',//FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7',//FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610',//FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda',//FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 258
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//ManagingContract
                addr: this.managing.address,
                flags: 59
            }
        ];

        const adapters1 = [
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingPoolAdapterContract.address,//FlexFundingPoolAdapterContract
                flags: 75
            },
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingAdapterContract.address,//FlexFundingAdapterContract
                flags: 26
            }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const flexDaoParticipantCapInfo = [
            true,//bool enable;
            5//uint256 maxParticipantsAmount;
        ];

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMembershipInfo = [
            "participantmembershipInfo01", // string name;
            0,// uint8 varifyType;
            hre.ethers.utils.parseEther("100"),  // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0,// uint256 tokenId;
            [ZERO_ADDRESS]//whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            60 * 10,// uint256 votingPeriod;
            0, // uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10    // uint256 proposalExecutePeriod;
        ];

        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [] // address[] whiteList;
        ];

        const flexDaoPollingInfo = [
            60 * 10,// uint256 votingPeriod;
            0,// uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const flexDaoProposerMembershipInfo = [
            3,  // uint8 varifyType;
            0,  // uint256 minHolding;
            ZERO_ADDRESS,  // address tokenAddress;
            0,   // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address]  // address[] whiteList;
        ];

        const flexDaoManagementfee = 2;
        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];
        const fundingPollEnable = false;

        const flexDaoFundriaseStyle = 0// 0 - FCFS 1- Free in

        const flexDaoInfo = {
            name: _daoName,// string name;
            creator: this.owner.address,  // address creator;
            flexDaoManagementfee: flexDaoManagementfee,   // uint256 flexDaoManagementfee;
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 3,    // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("0"), // uint256 minHolding;
            tokenAddress: ZERO_ADDRESS,// address tokenAddress;
            tokenId: 0,  // uint256 tokenId;
            whiteList: [
                this.priority_deposit_membership_whitelist1.address,
                this.priority_deposit_membership_whitelist2.address
            ],   // address[] whiteList;
            priorityPeriod: 60 * 10      // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMembershipInfo,   // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo,// flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo,    //    flexDaoInfo _flexDaoInfo;
        ];

        const { daoAddr, daoName } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);

        this.flexDirectdaoAddress = daoAddr;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const is_genesis_steward1 = await daoContract.isMember(this.genesis_steward1.address);
        const is_genesis_steward2 = await daoContract.isMember(this.genesis_steward2.address);


        const isOwnerprioritywhitelist = await this.flexFundingPoolAdapterContract.
            isPriorityDepositWhitelist(daoAddr, this.owner.address);
        const isprioritywhitelist = await this.flexFundingPoolAdapterContract.
            isPriorityDepositWhitelist(daoAddr, this.priority_deposit_membership_whitelist1.address);
        expect(isprioritywhitelist, true);
        const FLEX_PRIORITY_DEPOSIT_ENABLE = await daoContract.getConfiguration(sha3("FLEX_PRIORITY_DEPOSIT_ENABLE"));
        const FLEX_PRIORITY_DEPOSIT_PERIOD = await daoContract.getConfiguration(sha3("FLEX_PRIORITY_DEPOSIT_PERIOD"));
        const FLEX_PRIORITY_DEPOSIT_TYPE = await daoContract.getConfiguration(sha3("FLEX_PRIORITY_DEPOSIT_TYPE"));
        console.log(`
            new dao address ${daoAddr}
            new dao name ${toUtf8(daoName)}
            is_genesis_steward1 ${is_genesis_steward1}
            is_genesis_steward2 ${is_genesis_steward2}

            priority deposit membership Info:
             ${FLEX_PRIORITY_DEPOSIT_ENABLE}
             ${FLEX_PRIORITY_DEPOSIT_PERIOD}
             ${FLEX_PRIORITY_DEPOSIT_TYPE}
            `);
    });

    it("varify pollster membership - ERC20", async () => {

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];
        const _daoName = "my_flex_dao013";
        const creator = this.owner.address;

        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd',//FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35',//FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8',//FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c',//FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7',//FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610',//FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda',//FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 258
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//ManagingContract
                addr: this.managing.address,
                flags: 59
            }
        ];

        const adapters1 = [
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingPoolAdapterContract.address,//FlexFundingPoolAdapterContract
                flags: 75
            },
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingAdapterContract.address,//FlexFundingAdapterContract
                flags: 26
            }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const flexDaoParticipantCapInfo = [
            true,//bool enable;
            5//uint256 maxParticipantsAmount;
        ];

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMembershipInfo = [
            "participantmembershipInfo01", // string name;
            0,// uint8 varifyType;
            hre.ethers.utils.parseEther("100"),  // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0,// uint256 tokenId;
            [ZERO_ADDRESS]//whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            60 * 10,// uint256 votingPeriod;
            0, // uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10    // uint256 proposalExecutePeriod;
        ];

        const flexDaoPollsterMembershipInfo = [
            0, // uint8 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [] // address[] whiteList;
        ];

        const flexDaoPollingInfo = [
            60 * 10,// uint256 votingPeriod;
            0,// uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const flexDaoProposerMembershipInfo = [
            3,  // uint8 varifyType;
            0,  // uint256 minHolding;
            ZERO_ADDRESS,  // address tokenAddress;
            0,   // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address]  // address[] whiteList;
        ];

        const flexDaoManagementfee = 2;
        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];
        const fundingPollEnable = true;

        const flexDaoFundriaseStyle = 0// 0 - FCFS 1- Free in

        const flexDaoInfo = {
            name: _daoName,// string name;
            creator: this.owner.address,  // address creator;
            flexDaoManagementfee: flexDaoManagementfee,   // uint256 flexDaoManagementfee;
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 3,    // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("0"), // uint256 minHolding;
            tokenAddress: ZERO_ADDRESS,// address tokenAddress;
            tokenId: 0,  // uint256 tokenId;
            whiteList: [
                this.priority_deposit_membership_whitelist1.address,
                this.priority_deposit_membership_whitelist2.address
            ],   // address[] whiteList;
            priorityPeriod: 60 * 10      // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMembershipInfo,   // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo,// flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo,    //    flexDaoInfo _flexDaoInfo;
        ];

        const { daoAddr, daoName } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);

        this.daoAddress = daoAddr;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const is_genesis_steward1 = await daoContract.isMember(this.genesis_steward1.address);
        const is_genesis_steward2 = await daoContract.isMember(this.genesis_steward2.address);

        const FLEX_FUNDING_TYPE = await daoContract.getConfiguration(sha3("FLEX_FUNDING_TYPE"));
        const FLEX_POLLING_VOTING_PERIOD = await daoContract.getConfiguration(sha3("FLEX_POLLING_VOTING_PERIOD"));
        const FLEX_POLLING_VOTING_POWER = await daoContract.getConfiguration(sha3("FLEX_POLLING_VOTING_POWER"));
        const FLEX_POLLING_SUPER_MAJORITY = await daoContract.getConfiguration(sha3("FLEX_POLLING_SUPER_MAJORITY"));
        const FLEX_POLLING_QUORUM = await daoContract.getConfiguration(sha3("FLEX_POLLING_QUORUM"));
        const FLEX_POLLING_PROPOSAL_EXECUTIONPEERIOD = await daoContract.getConfiguration(sha3("FLEX_POLLING_PROPOSAL_EXECUTIONPEERIOD"));
        const FLEX_POLLSTER_MEMBERSHIP_TYPE = await daoContract.getConfiguration(sha3("FLEX_POLLSTER_MEMBERSHIP_TYPE"));
        const FLEX_POLLSTER_MEMBERSHIP_MIN_HOLDING = await daoContract.getConfiguration(sha3("FLEX_POLLSTER_MEMBERSHIP_MIN_HOLDING"));
        const FLEX_POLLSTER_MEMBERSHIP_TOKEN_ADDRESS = await daoContract.getAddressConfiguration(sha3("FLEX_POLLSTER_MEMBERSHIP_TOKEN_ADDRESS"));


        console.log(`
            new dao address ${daoAddr}
            new dao name ${toUtf8(daoName)}
            is_genesis_steward1 ${is_genesis_steward1}
            is_genesis_steward2 ${is_genesis_steward2}

            pollster membership Info:
             ${FLEX_FUNDING_TYPE}
             ${FLEX_POLLING_VOTING_PERIOD}
             ${FLEX_POLLING_VOTING_POWER}

             ${FLEX_POLLING_SUPER_MAJORITY}
             ${FLEX_POLLING_QUORUM}
             ${FLEX_POLLING_PROPOSAL_EXECUTIONPEERIOD}
             ${FLEX_POLLSTER_MEMBERSHIP_TYPE}
             ${hre.ethers.utils.formatEther(FLEX_POLLSTER_MEMBERSHIP_MIN_HOLDING)}
             ${FLEX_POLLSTER_MEMBERSHIP_TOKEN_ADDRESS}
            `);
    });

    it("varify pollster membership - WhiteList", async () => {

        const daoFactoriesAddress = [
            this.daoFactory.address,
            this.flexFundingPoolFactory.address
        ];
        const _daoName = "my_flex_dao014";
        const creator = this.owner.address;

        const enalbeAdapters = [
            {
                id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd',//FlexVesting
                addr: this.flexVesting.address,
                flags: 0
            },
            {
                id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35',//FlexERC721
                addr: this.flexERC721.address,
                flags: 0
            },
            {
                id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8',//FlexAllocationAdapterContract
                addr: this.flexAllocationAdapterContract.address,
                flags: 0
            },
            {
                id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c',//FlexFundingPoolAdapterContract
                addr: this.flexFundingPoolAdapterContract.address,
                flags: 0
            },
            {
                id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7',//FlexVotingContract
                addr: this.flexVotingContract.address,
                flags: 258
            },
            {
                id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610',//FlexPollingVotingContract
                addr: this.flexPollingVotingContract.address,
                flags: 258
            },
            {
                id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda',//FlexFundingAdapterContract
                addr: this.flexFundingAdapterContract.address,
                flags: 258
            },
            {
                id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
                addr: this.bentoBoxV1.address,
                flags: 0
            },
            {
                id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//ManagingContract
                addr: this.managing.address,
                flags: 59
            }
        ];

        const adapters1 = [
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingPoolAdapterContract.address,//FlexFundingPoolAdapterContract
                flags: 75
            },
            {
                id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
                addr: this.flexFundingAdapterContract.address,//FlexFundingAdapterContract
                flags: 26
            }
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        const flexDaoParticipantCapInfo = [
            true,//bool enable;
            5//uint256 maxParticipantsAmount;
        ];

        const flexDaoParticipantMembershipEnalbe = true;

        const flexDaoParticipantsMembershipInfo = [
            "participantmembershipInfo01", // string name;
            0,// uint8 varifyType;
            hre.ethers.utils.parseEther("100"),  // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0,// uint256 tokenId;
            [ZERO_ADDRESS]//whiteList;
        ];

        const flexDaoStewardMembershipInfo = [
            1, // bool enable;
            0, // uint256 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address,  // address tokenAddress;
            0,  // uint256 tokenId;
            [] // address[] whiteList;
        ];

        const flexDaoVotingInfo = [
            60 * 10,// uint256 votingPeriod;
            0, // uint8 votingPower;
            1, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10    // uint256 proposalExecutePeriod;
        ];

        const flexDaoPollsterMembershipInfo = [
            3, // uint8 varifyType;
            hre.ethers.utils.parseEther("100"), // uint256 minHolding;
            this.testtoken1.address, // address tokenAddress;
            0, // uint256 tokenId;
            [
                this.pollster_membership_whitelist1.address,
                this.pollster_membership_whitelist2.address
            ] // address[] whiteList;
        ];

        const flexDaoPollingInfo = [
            60 * 10,// uint256 votingPeriod;
            0,// uint8 votingPower;
            60, // uint256 superMajority;
            66, // uint256 quorum;
            60 * 10 // uint256 proposalExecutePeriod;
        ];

        const flexDaoProposerMembershipInfo = [
            3,  // uint8 varifyType;
            0,  // uint256 minHolding;
            ZERO_ADDRESS,  // address tokenAddress;
            0,   // uint256 tokenId;
            [this.funding_proposer1_whitelist.address, this.funding_proposer2_whitelist.address]  // address[] whiteList;
        ];

        const flexDaoManagementfee = 2;
        const flexDaoGenesisStewards = [this.genesis_steward1.address, this.genesis_steward2.address];
        const fundingPollEnable = true;

        const flexDaoFundriaseStyle = 0// 0 - FCFS 1- Free in

        const flexDaoInfo = {
            name: _daoName,// string name;
            creator: this.owner.address,  // address creator;
            flexDaoManagementfee: flexDaoManagementfee,   // uint256 flexDaoManagementfee;
            managementFeeAddress: this.genesis_steward1.address,
            flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
            flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
        }

        const flexDaoPriorityDepositEnalbe = true;

        const flexDaoPriorityDepositMembershipInfo = {
            varifyType: 3,    // uint8 varifyType;
            minHolding: hre.ethers.utils.parseEther("0"), // uint256 minHolding;
            tokenAddress: ZERO_ADDRESS,// address tokenAddress;
            tokenId: 0,  // uint256 tokenId;
            whiteList: [
                this.priority_deposit_membership_whitelist1.address,
                this.priority_deposit_membership_whitelist2.address
            ],   // address[] whiteList;
            priorityPeriod: 60 * 10      // uint256 priorityPeriod;
        }

        const flexDaoParams = [
            daoFactoriesAddress, // address[] daoFactoriesAddress;
            enalbeAdapters, // DaoFactory.Adapter[] enalbeAdapters;
            adapters1, // DaoFactory.Adapter[] adapters1;
            fundingPollEnable, // bool fundingPollEnable;
            flexDaoParticipantCapInfo, // flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
            flexDaoParticipantMembershipEnalbe,
            flexDaoParticipantsMembershipInfo,   // flexDaoParticipantsMemberships _flexDaoParticipantsMemberships;
            flexDaoPriorityDepositEnalbe,
            flexDaoPriorityDepositMembershipInfo,
            flexDaoStewardMembershipInfo, // flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
            flexDaoVotingInfo, // flexDaoVotingInfo _flexDaoVotingInfo;
            flexDaoPollsterMembershipInfo,// flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
            flexDaoPollingInfo, // flexDaoPollingInfo _flexDaoPollingInfo;
            flexDaoProposerMembershipInfo, // flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
            flexDaoInfo,    //    flexDaoInfo _flexDaoInfo;
        ];

        const { daoAddr, daoName } = await sommonFlexDao(this.summonDao, this.daoFactory, flexDaoParams);
        this.FlexPollDaoAddress = daoAddr;
        this.daoAddress = daoAddr;
        const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

        const is_genesis_steward1 = await daoContract.isMember(this.genesis_steward1.address);
        const is_genesis_steward2 = await daoContract.isMember(this.genesis_steward2.address);


        const isOwnerPollingwhitelist = await this.flexPollingVotingContract.
            isPollsterWhiteList(daoAddr, this.owner.address);
        const isPollsterwhitelist1 = await this.flexPollingVotingContract.
            isPollsterWhiteList(daoAddr, this.pollster_membership_whitelist1.address);
        const isPollsterwhitelist2 = await this.flexPollingVotingContract.
            isPollsterWhiteList(daoAddr, this.pollster_membership_whitelist2.address);
        expect(isOwnerPollingwhitelist, true);
        expect(isPollsterwhitelist1, true);
        expect(isPollsterwhitelist2, true);

        const FLEX_FUNDING_TYPE = await daoContract.getConfiguration(sha3("FLEX_FUNDING_TYPE"));
        const FLEX_POLLING_VOTING_PERIOD = await daoContract.getConfiguration(sha3("FLEX_POLLING_VOTING_PERIOD"));
        const FLEX_POLLING_VOTING_POWER = await daoContract.getConfiguration(sha3("FLEX_POLLING_VOTING_POWER"));
        const FLEX_POLLING_SUPER_MAJORITY = await daoContract.getConfiguration(sha3("FLEX_POLLING_SUPER_MAJORITY"));
        const FLEX_POLLING_QUORUM = await daoContract.getConfiguration(sha3("FLEX_POLLING_QUORUM"));
        const FLEX_POLLING_PROPOSAL_EXECUTIONPEERIOD = await daoContract.getConfiguration(sha3("FLEX_POLLING_PROPOSAL_EXECUTIONPEERIOD"));
        const FLEX_POLLSTER_MEMBERSHIP_TYPE = await daoContract.getConfiguration(sha3("FLEX_POLLSTER_MEMBERSHIP_TYPE"));
        const FLEX_POLLSTER_MEMBERSHIP_MIN_HOLDING = await daoContract.getConfiguration(sha3("FLEX_POLLSTER_MEMBERSHIP_MIN_HOLDING"));
        const FLEX_POLLSTER_MEMBERSHIP_TOKEN_ADDRESS = await daoContract.getAddressConfiguration(sha3("FLEX_POLLSTER_MEMBERSHIP_TOKEN_ADDRESS"));

        console.log(`
            new dao address ${daoAddr}
            new dao name ${toUtf8(daoName)}
            is_genesis_steward1 ${is_genesis_steward1}
            is_genesis_steward2 ${is_genesis_steward2}

            pollster membership Info:
            ${FLEX_FUNDING_TYPE}
            ${FLEX_POLLING_VOTING_PERIOD}
            ${FLEX_POLLING_VOTING_POWER}

            ${FLEX_POLLING_SUPER_MAJORITY}
            ${FLEX_POLLING_QUORUM}
            ${FLEX_POLLING_PROPOSAL_EXECUTIONPEERIOD}
            ${FLEX_POLLSTER_MEMBERSHIP_TYPE}
            ${hre.ethers.utils.formatEther(FLEX_POLLSTER_MEMBERSHIP_MIN_HOLDING)}
            ${FLEX_POLLSTER_MEMBERSHIP_TOKEN_ADDRESS}
           `);
    });

    it("varify flex DIRECT mode funding...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.flexDirectdaoAddress);
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
        let vestingCliffDuration = 600;
        let vestingStepDuration = 600;
        let vestingSteps = 10;
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("1000");

        let vestInfo = [
            vestingStartTime,
            vestingCliffDuration,
            vestingStepDuration,
            vestingSteps,
            vestingCliffLockAmount
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

        let priorityDeposit = true;

        let pPeriod = 100;
        let pPeriods = 10;
        let pType = 0;
        let pChainId = 1;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;

        let priorityDepositInfo = [
            pPeriod,
            pPeriods,
            pType,
            pChainId,
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
            priorityDeposit,
            priorityDepositInfo
        ];

        let tokenRewardAmount = 2;
        let cashRewardAmount = hre.ethers.utils.parseEther("1000");
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];
        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos
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
        flex funding ProposalId: ${hre.ethers.utils.toUtf8String(proposalId)}
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
        await expectRevert(flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("10")), "revert");
        await flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("2000000"));
        // const poolBal = await this.testtoken1.balanceOf(this.extensions.flexFundingPoolExt.address);
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
        const protocolFeeAddress = await dao.getAddressConfiguration(sha3("FLEX_PROTOCOL_FEE_RECEIVE_ADDRESS"));
        const managementFeeAddress = await dao.getAddressConfiguration(sha3("FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS"));
        const token = await flexFundingAdapterContract.getTokenByProposalId(dao.address, proposalId);
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
        protocol Fee ${hre.ethers.utils.formatEther(protocolFee)}
        management Fee ${hre.ethers.utils.formatEther(managementFee)}
        proposer reward ${hre.ethers.utils.formatEther(proposerreward)}
        receive Amount ${hre.ethers.utils.formatEther(receiveAmount)}
        total tributed amount ${hre.ethers.utils.formatEther(allTributedAmount)}
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
        let vestingCliffDuration = 600;
        let vestingStepDuration = 600;
        let vestingSteps = 10;
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("1000");

        let vestInfo = [
            vestingStartTime,
            vestingCliffDuration,
            vestingStepDuration,
            vestingSteps,
            vestingCliffLockAmount
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

        let priorityDeposit = true;

        let pPeriod = 100;
        let pPeriods = 10;
        let pType = 0;
        let pChainId = 1;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;

        let priorityDepositInfo = [
            pPeriod,
            pPeriods,
            pType,
            pChainId,
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
            priorityDeposit,
            priorityDepositInfo
        ];

        let tokenRewardAmount = 2;
        let cashRewardAmount = hre.ethers.utils.parseEther("1000");
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];
        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos
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
        flex funding ProposalId: ${hre.ethers.utils.toUtf8String(proposalId)}
        state ${flexFundingProposalInfo.state}
        voting...
        `);

        const flexFundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexVoting = this.flexVotingContract;
        const fundRaiseStartTimes = flexFundingProposalInfo.fundRaiseInfo.fundRaiseStartTime;
        const stopVoteTime = flexFundingProposalInfo.stopVoteTime;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;


        await flexVoting.connect(this.pollster_membership_whitelist1).submitFundingVote(dao.address, proposalId, 1);
        await flexVoting.connect(this.pollster_membership_whitelist2).submitFundingVote(dao.address, proposalId, 1);

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

        await USDT.approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await expectRevert(flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("10")), "revert");
        await flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("2000000"));
        // const poolBal = await this.testtoken1.balanceOf(this.extensions.flexFundingPoolExt.address);
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
        const protocolFeeAddress = await dao.getAddressConfiguration(sha3("FLEX_PROTOCOL_FEE_RECEIVE_ADDRESS"));
        const managementFeeAddress = await dao.getAddressConfiguration(sha3("FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS"));
        const token = await flexFundingAdapterContract.getTokenByProposalId(dao.address, proposalId);
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
        protocol Fee ${hre.ethers.utils.formatEther(protocolFee)}
        management Fee ${hre.ethers.utils.formatEther(managementFee)}
        proposer reward ${hre.ethers.utils.formatEther(proposerreward)}
        receive Amount ${hre.ethers.utils.formatEther(receiveAmount)}
        total tributed amount ${hre.ethers.utils.formatEther(allTributedAmount)}
        `);
    });

    it("varify flex Poll mode escrow funding...", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(this.FlexPollDaoAddress);
        let tokenAddress = this.testtoken1.address;
        let minFundingAmount = hre.ethers.utils.parseEther("1000000");
        let maxFundingAmount = hre.ethers.utils.parseEther("10000000");
        let escrow = true;
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
        let vestingCliffDuration = 600;
        let vestingStepDuration = 600;
        let vestingSteps = 10;
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("1000");

        let vestInfo = [
            vestingStartTime,
            vestingCliffDuration,
            vestingStepDuration,
            vestingSteps,
            vestingCliffLockAmount
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

        let priorityDeposit = true;

        let pPeriod = 100;
        let pPeriods = 10;
        let pType = 0;
        let pChainId = 1;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;

        let priorityDepositInfo = [
            pPeriod,
            pPeriods,
            pType,
            pChainId,
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
            priorityDeposit,
            priorityDepositInfo
        ];

        let tokenRewardAmount = 2;
        let cashRewardAmount = hre.ethers.utils.parseEther("1000");
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];
        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos
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
        flex funding ProposalId: ${hre.ethers.utils.toUtf8String(proposalId)}
        state ${flexFundingProposalInfo.state}
        voting...
        `);

        const flexFundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexVoting = this.flexVotingContract;
        const fundRaiseStartTimes = flexFundingProposalInfo.fundRaiseInfo.fundRaiseStartTime;
        const stopVoteTime = flexFundingProposalInfo.stopVoteTime;
        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;


        await flexVoting.connect(this.pollster_membership_whitelist1).submitFundingVote(dao.address, proposalId, 1);
        await flexVoting.connect(this.pollster_membership_whitelist2).submitFundingVote(dao.address, proposalId, 1);

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
        await USDT.transfer(this.investor1.address, hre.ethers.utils.parseEther("100000"));
        await USDT.transfer(this.investor2.address, hre.ethers.utils.parseEther("100000"));

        await USDT.connect(this.investor1).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.investor2).approve(flexFundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));

        await expectRevert(flexFundingPoolAdapt.deposit(dao.address, proposalId, hre.ethers.utils.parseEther("10")), "revert");
        await flexFundingPoolAdapt.connect(this.investor1).deposit(dao.address, proposalId, hre.ethers.utils.parseEther("100000"));
        await flexFundingPoolAdapt.connect(this.investor2).deposit(dao.address, proposalId, hre.ethers.utils.parseEther("100000"));
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
        protocol Fee ${hre.ethers.utils.formatEther(protocolFee)}
        management Fee ${hre.ethers.utils.formatEther(managementFee)}
        proposer reward ${hre.ethers.utils.formatEther(proposerreward)}
        receive Amount ${hre.ethers.utils.formatEther(receiveAmount)}
        total tributed amount ${hre.ethers.utils.formatEther(allTributedAmount)}
        `);
    });
});
