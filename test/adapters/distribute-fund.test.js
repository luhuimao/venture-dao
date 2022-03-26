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

// Whole-script strict mode syntax
"use strict";

const {
    toBN,
    toWei,
    fromUtf8,
    fromAscii,
    unitPrice,
    UNITS,
    GUILD,
    ETH_TOKEN,
    LOOT,
    ESCROW,
    sha3,
    numberOfUnits,
    maximumChunks,
    maxAmount,
    maxUnits
} = require("../../utils/contract-util");

const {
    fundingpoolExtensionAclFlagsMap,
    bankExtensionAclFlagsMap,
    daoAccessFlagsMap,
    entryDao,
    entryFundingPool,
    calculateFlagValue
} = require("../../utils/access-control-util");

const {
    deployDefaultDao,
    takeChainSnapshot,
    revertChainSnapshot,
    proposalIdGenerator,
    // advanceTime,
    accounts,
    expectRevert,
    expect,
    web3,
} = require("../../utils/oz-util");

// const { onboardingNewMember } = require("../../utils/test-util");
const { extensionsIdsMap, adaptersIdsMap } = require("../../utils/dao-ids-util");
const hre = require("hardhat");
const { getConfig } = require("../../migrations/configs/contracts.config");

// const daoOwner = accounts[2];
const daoCreator = accounts[9];

const proposalCounter = proposalIdGenerator().generator;

const getDefaultOptions = (options) => {
    return {
        minFundsForLP: 100,
        minFundsForGP: 1000,
        serviceFeeRatio: 5,
        unitPrice: unitPrice,
        nbUnits: numberOfUnits,
        votingPeriod: 5,
        gracePeriod: 1,
        tokenAddr: ETH_TOKEN,
        maxChunks: maximumChunks,
        maxAmount,
        maxUnits,
        chainId: 1,
        maxExternalTokens: 100,
        couponCreatorAddress: "0x7D8cad0bbD68deb352C33e80fccd4D8e88b4aBb8",
        kycMaxMembers: 1000,
        kycSignerAddress: "0x7D8cad0bbD68deb352C33e80fccd4D8e88b4aBb8",
        kycFundTargetAddress: "0x823A19521A76f80EC49670BE32950900E8Cd0ED3",
        deployTestTokens: true,
        erc20TokenName: "Test Token",
        erc20TokenSymbol: "TTK",
        erc20TokenDecimals: Number(0),
        erc20TokenAddress: UNITS,
        supplyTestToken1: 1000000,
        supplyTestToken2: 1000000,
        supplyPixelNFT: 100,
        supplyOLToken: toBN("1000000000000000000000000"),
        erc1155TestTokenUri: "1155 test token",
        maintainerTokenAddress: UNITS,
        // finalize: options.finalize === undefined || !!options.finalize,
        ...options, // to make sure the options from the tests override the default ones
        gasPriceLimit: "2000000000000",
        spendLimitPeriod: "259200",
        spendLimitEth: "2000000000000000000000",
        feePercent: "110",
        gasFixed: "50000",
        gelato: "0x1000000000000000000000000000000000000000",
    };
};

async function advanceTime(addr1, addr2, token) {

    for (var i = 0; i < 10; i++) {
        await token.transfer(addr2.address, 1);

        await token.connect(addr2).transfer(addr1.address, 1);

    }

    // await new Promise((resolve, reject) => {
    //     web3.currentProvider.send(
    //         {
    //             jsonrpc: "2.0",
    //             method: "evm_increaseTime",
    //             params: [time],
    //             id: new Date().getTime(),
    //         },
    //         (err, result) => {
    //             if (err) {
    //                 return reject(err);
    //             }
    //             return resolve(result);
    //         }
    //     );
    // });
}

function getProposalCounter() {
    return proposalCounter().next().value;
}

async function onboardingNewMember(
    proposalId,
    dao,
    onboarding,
    voting,
    newMember,
    sponsor,
    unitPrice,
    token,
    walletOwner,
    walletUser1,
    testTokenInstance,
    desiredUnits = toBN(10)
) {
    await submitNewMemberProposal(
        proposalId,
        sponsor,
        onboarding,
        dao,
        newMember,
        unitPrice,
        token,
        desiredUnits
    );
    console.log("voting.submitVote");
    //vote and process it
    await voting.submitVote(dao.address, proposalId, 1);

    await advanceTime(walletOwner,
        walletUser1,
        testTokenInstance);

    console.log("onboarding.processProposal");
    await onboarding.processProposal(dao.address, proposalId
    );
};

async function submitNewMemberProposal(
    proposalId,
    member,
    onboarding,
    dao,
    newMember,
    unitPrice,
    token,
    desiredUnits = toBN(10)
) {
    // console.log(unitPrice.mul(desiredUnits));
    await onboarding.submitProposal(
        dao.address,
        proposalId,
        newMember,
        token,
        unitPrice * desiredUnits,
        []
    );
};

describe("Adapter - DistributeFunds", () => {
    before("deploy dao", async () => {
        this.web3 = web3;
        // console.log("web3.currentProvider:", web3.currentProvider);
        let [owner, user1, user2] = await hre.ethers.getSigners();
        this.owner = owner;
        this.user1 = user1;
        this.user2 = user2;
        console.log(`owner address ${owner.address}; user1 address ${user1.address}; user2 address ${user2.address}`);

        const TestToken1 = await hre.ethers.getContractFactory("TestToken1");
        const testToken1 = await TestToken1.deploy(10000000);
        await testToken1.deployed();
        console.log("new testToken1 address: ", testToken1.address);
        this.testToken1 = testToken1;

        const TestToken2 = await hre.ethers.getContractFactory("TestToken2");
        const testToken2 = await TestToken1.deploy(10000000);
        await testToken2.deployed();
        console.log("new testToken2 address: ", testToken2.address);
        this.testToken2 = testToken2;

        const DaoRegistry = await hre.ethers.getContractFactory("DaoRegistry");
        const daoRegistry = await DaoRegistry.deploy();
        await daoRegistry.deployed();
        console.log("new IdentityDao address: ", daoRegistry.address);

        //deploy DaoFactory
        const DaoFactory = await hre.ethers.getContractFactory("DaoFactory");
        const daoFactory = await DaoFactory.deploy(daoRegistry.address);
        await daoFactory.deployed();
        console.log("new DaoFactory address: ", daoFactory.address);


        //create test dao
        await daoFactory.createDao("testdao", owner.address);
        const _address = await daoFactory.getDaoAddress("testdao");
        console.log("new testdao address: ", _address);

        const daoInstance = (await hre.ethers.getContractFactory('DaoRegistry')).connect(owner).attach(_address)
        console.log("dao member 1 addr: ", (await daoInstance.getMemberAddress(0)));
        console.log("dao member 2 addr: ", (await daoInstance.getMemberAddress(1)));

        //set configure
        const VotingPeriod = sha3("voting.votingPeriod");
        const GracePeriod = sha3("voting.gracePeriod");
        await daoInstance.setConfiguration(VotingPeriod, getDefaultOptions().votingPeriod);
        await daoInstance.setConfiguration(GracePeriod, getDefaultOptions().gracePeriod);


        //deploy  FundingPoolExtension
        const FundingPool = await hre.ethers.getContractFactory("FundingPoolExtension");
        const fundingPool = await FundingPool.deploy();
        await fundingPool.deployed();

        const FundingPoolFactory = await hre.ethers.getContractFactory("FundingPoolFactory");
        const fundingPoolFactory = await FundingPoolFactory.deploy(fundingPool.address);
        await fundingPoolFactory.deployed();

        await fundingPoolFactory.create(
            daoInstance.address,
            getDefaultOptions().maxExternalTokens,
            getDefaultOptions().minFundsForLP, getDefaultOptions().minFundsForGP,
            getDefaultOptions().serviceFeeRatio

        );
        const _addressFundingPoolExt = await fundingPoolFactory.getExtensionAddress(daoInstance.address);
        const fundingPoolExtInstance = (await hre.ethers.getContractFactory('FundingPoolExtension')).connect(owner).attach(_addressFundingPoolExt)
        this.fundingPoolExt = fundingPoolExtInstance;
        console.log("new fundingPoolExt address: ", fundingPoolExtInstance.address);

        //deploy  FundingPoolExtension
        const BankExtension = await hre.ethers.getContractFactory("BankExtension");
        const bankExtension = await BankExtension.deploy();
        await bankExtension.deployed();

        const BankFactory = await hre.ethers.getContractFactory("BankFactory");
        const bankFactory = await BankFactory.deploy(fundingPool.address);
        await bankFactory.deployed();

        await bankFactory.create(
            daoInstance.address,
            getDefaultOptions().maxExternalTokens
        );
        const _addressBankExt = await bankFactory.getExtensionAddress(daoInstance.address);
        const bankExtInstance = (await hre.ethers.getContractFactory('FundingPoolExtension')).connect(owner).attach(_addressBankExt)
        this.bankExt = bankExtInstance;
        console.log("new bankExt address: ", bankExtInstance.address);

        await daoInstance.addExtension(
            sha3("bank"),
            bankExtInstance.address,
            owner.address);


        await daoInstance.addExtension(
            sha3("funding-pool"),
            fundingPoolExtInstance.address,
            owner.address);

        //deploy OnboardingContract
        const OnboardingContract = await hre.ethers.getContractFactory("OnboardingContract");
        const onboardingContract = await OnboardingContract.deploy();
        await onboardingContract.deployed();
        console.log("new onboardingContract address: ", onboardingContract.address);

        // const chunkSize = sha3("onboarding.chunkSize");
        // const unitsPerChunk = sha3("onboarding.unitsPerChunk");
        // const tokenAddr = sha3("onboarding.tokenAddr");
        // const maximumChunks = sha3("onboarding.maximumChunks");
        // await daoInstance.setConfiguration(chunkSize, 10);
        // await daoInstance.setConfiguration(unitsPerChunk, 10);
        // await daoInstance.setConfiguration(tokenAddr, testToken1.address);
        // await daoInstance.setConfiguration(maximumChunks, 11);

        //deploy VotingContract
        const VotingContract = await hre.ethers.getContractFactory("VotingContract");
        const votingContract = await VotingContract.deploy();
        await votingContract.deployed();
        console.log("new votingContract address: ", votingContract.address);

        //deploy VotingContract
        const DistributeFundContract = await hre.ethers.getContractFactory("DistributeFundContract");
        const distributeFundContract = await DistributeFundContract.deploy();
        await distributeFundContract.deployed();
        console.log("new DistributeFundContract address: ", distributeFundContract.address);


        await daoFactory.addAdapters(daoInstance.address,
            [
                // entryDao(
                //     adaptersIdsMap.FOUNDING_POOL_ADAPTER,
                //     fundingPoolAdapterContract.address,
                //     {
                //         dao: [],
                //         extensions: {
                //             [extensionsIdsMap.FUNDING_POOL_EXT]: [
                //                 bankExtensionAclFlagsMap.WITHDRAW,
                //                 bankExtensionAclFlagsMap.SUB_FROM_BALANCE,
                //                 bankExtensionAclFlagsMap.ADD_TO_BALANCE,
                //                 bankExtensionAclFlagsMap.UPDATE_TOKEN,
                //             ],
                //         },
                //     }
                // ),
                entryDao(
                    adaptersIdsMap.VOTING_ADAPTER,
                    votingContract.address,
                    {
                        dao: [],
                        extensions: {},
                    }
                ),
                // entryDao(
                //     adaptersIdsMap.FINANCING_ADAPTER,
                //     financingContract.address,
                //     {
                //         dao: [daoAccessFlagsMap.SUBMIT_PROPOSAL],
                //         extensions: {
                //             [extensionsIdsMap.BANK_EXT]: [
                //                 bankExtensionAclFlagsMap.INTERNAL_TRANSFER,
                //                 bankExtensionAclFlagsMap.SUB_FROM_BALANCE,
                //                 bankExtensionAclFlagsMap.ADD_TO_BALANCE,
                //             ],
                //         },
                //     }
                // ),
                entryDao(
                    adaptersIdsMap.ONBOARDING_ADAPTER,
                    onboardingContract.address,
                    {
                        dao: [
                            daoAccessFlagsMap.SUBMIT_PROPOSAL,
                            daoAccessFlagsMap.UPDATE_DELEGATE_KEY,
                            daoAccessFlagsMap.NEW_MEMBER,
                            daoAccessFlagsMap.SET_CONFIGURATION
                        ],
                        extensions: {
                            [extensionsIdsMap.BANK_EXT]: [
                                bankExtensionAclFlagsMap.ADD_TO_BALANCE,
                                bankExtensionAclFlagsMap.INTERNAL_TRANSFER,
                            ],
                        },
                    }
                ),
                // entryDao(
                //     adaptersIdsMap.MANAGING_ADAPTER,
                //     managingContract.address,
                //     {
                //         dao: [
                //             daoAccessFlagsMap.SUBMIT_PROPOSAL,
                //             daoAccessFlagsMap.REPLACE_ADAPTER,
                //             daoAccessFlagsMap.ADD_EXTENSION,
                //             daoAccessFlagsMap.REMOVE_EXTENSION,
                //             daoAccessFlagsMap.SET_CONFIGURATION,
                //         ],
                //         extensions: {},
                //     }
                // )
            ]);

        await onboardingContract.configureDao(daoInstance.address, testToken2.address, 10, 10, 100000000001, testToken1.address);

        await bankExtInstance.registerPotentialNewToken(testToken1.address);
        await bankExtInstance.registerPotentialNewInternalToken(testToken2.address);

        // const AclFlag = getConfig("FundingPoolExtension").buildAclFlag(
        //     fundingPoolAdapterContract.address,
        //     getConfig("FundingPoolAdapterContract").acls
        // );
        // await daoFactory.configureExtension(
        //     daoInstance.address,
        //     fundingPoolExtInstance.address,
        //     [AclFlag]
        // );

        this.dao = daoInstance;
        //extensions
        this.fundingPoolExt = fundingPoolExtInstance;

        //adapters
        this.onboarding = onboardingContract;
        this.voting = votingContract;
        this.distributefund = distributeFundContract;
        this.snapshotId = await takeChainSnapshot();
    });

    beforeEach(async () => {
        await revertChainSnapshot(this.snapshotId);
        this.snapshotId = await takeChainSnapshot();
    });

    const distributeFundsProposal = async (
        dao,
        distributeFundContract,
        token,
        amount,
        unitHolderArr,
        sender,
        proposalId = null
    ) => {
        const newProposalId = proposalId ? proposalId : getProposalCounter();
        await distributeFundContract.submitProposal(
            dao.address,
            newProposalId,
            unitHolderArr,
            token,
            amount,
            fromUtf8("paying dividends")
        );

        return { proposalId: newProposalId };
    };

    it("should be possible to distribute funds to only 1 member of the DAO", async () => {
        const daoMember = this.user2.address;
        const dao = this.dao;
        const fundingPoolExt = this.fundingPoolExt;
        const bank = this.bankExt;
        const onboarding = this.onboarding;
        const voting = this.voting;
        // const distributeContract = this.distribute;
        const distributeFundContract = this.distributefund
        await onboardingNewMember(
            getProposalCounter(),
            dao,
            onboarding,
            voting,
            daoMember,
            this.owner.address,
            100000000000,
            this.testToken2.address, this.owner, this.user1, this.testToken1
        );
        console.Console.log(124);
        // Checks the Guild Bank Balance
        let guildBalance = await bank.balanceOf(GUILD, ETH_TOKEN);
        expect(toBN(guildBalance).toString()).equal("1200000000000000000");

        // Checks the member units (to make sure it was created)
        let units = await bank.balanceOf(daoMember, UNITS);
        expect(units.toString()).equal("10000000000000000");

        // Submit distribute proposal
        const amountToDistribute = 10;
        let { proposalId } = await distributeFundsProposal(
            dao,
            distributeFundContract,
            ETH_TOKEN,
            amountToDistribute,
            daoMember,
            daoOwner
        );

        // Vote YES on the proposal
        await voting.submitVote(dao.address, proposalId, 1, {
            from: this.owner.address,
            gasPrice: toBN("0"),
        });
        await advanceTime(this.owner, this, this.user2, this.testToken1);

        // Starts to process the proposal
        await distributeFundContract.processProposal(dao.address, proposalId, {
            from: this.owner.address,
            gasPrice: toBN("0"),
        });

        const escrowBalance = await bank.balanceOf(ESCROW, ETH_TOKEN);
        expect(toBN(escrowBalance).toString()).equal(amountToDistribute.toString());

        // Checks the member's internal balance before sending the funds
        let memberBalance = await bank.balanceOf(daoMember, ETH_TOKEN);
        expect(toBN(memberBalance).toString()).equal("0");

        // Distribute the funds to the DAO member
        // We can use 0 index here because the distribution happens for only 1 member
        await distributeFundContract.distribute(dao.address, 0, {
            from: daoMember,
            gasPrice: toBN("0"),
        });

        memberBalance = await bank.balanceOf(daoMember, ETH_TOKEN);
        expect(memberBalance.toString()).equal(amountToDistribute.toString());

        const newEscrowBalance = await bank.balanceOf(ESCROW, ETH_TOKEN);
        expect(newEscrowBalance.toString()).equal("0");
    });
    /*
        it("should be possible to distribute funds to all active members of the DAO", async () => {
            const daoMemberA = accounts[3];
            const daoMemberB = accounts[4];
            const dao = this.dao;
            const bank = this.extensions.bankExt;
            const onboarding = this.adapters.onboarding;
            const voting = this.adapters.voting;
            const distributeContract = this.adapters.distribute;
    
            await onboardingNewMember(
                getProposalCounter(),
                dao,
                onboarding,
                voting,
                daoMemberA,
                daoOwner,
                unitPrice,
                UNITS,
                toBN(5) // asking for 5 units
            );
    
            await onboardingNewMember(
                getProposalCounter(),
                dao,
                onboarding,
                voting,
                daoMemberB,
                daoOwner,
                unitPrice,
                UNITS
            );
    
            // Checks the Guild Bank Balance
            let guildBalance = await bank.balanceOf(GUILD, ETH_TOKEN);
            expect(toBN(guildBalance).toString()).equal("1800000000000000000");
    
            // Checks the member units (to make sure it was created)
            let unitsMemberA = await bank.balanceOf(daoMemberA, UNITS);
            expect(unitsMemberA.toString()).equal("5000000000000000");
            // Checks the member units (to make sure it was created)
            let unitsMemberB = await bank.balanceOf(daoMemberB, UNITS);
            expect(unitsMemberB.toString()).equal("10000000000000000");
    
            // Submit distribute proposal
            const amountToDistribute = 15;
            let { proposalId } = await distributeFundsProposal(
                dao,
                distributeContract,
                ETH_TOKEN,
                amountToDistribute,
                "0x0000000000000000000000000000000000000000", //indicates the funds should be distributed to all active members
                daoOwner
            );
    
            // Vote YES on the proposal
            await voting.submitVote(dao.address, proposalId, 1, {
                from: daoOwner,
                gasPrice: toBN("0"),
            });
            await advanceTime(10000);
    
            // Starts to process the proposal
            await distributeContract.processProposal(dao.address, proposalId, {
                from: daoOwner,
                gasPrice: toBN("0"),
            });
    
            // Checks the member's internal balance before sending the funds
            let memberABalance = await bank.balanceOf(daoMemberA, ETH_TOKEN);
            expect(toBN(memberABalance).toString()).equal("0");
            let memberBBalance = await bank.balanceOf(daoMemberB, ETH_TOKEN);
            expect(toBN(memberBBalance).toString()).equal("0");
    
            let numberOfMembers = toBN(await dao.getNbMembers()).toNumber();
            // It is expected to get 5 members:
            // 1 - dao owner
            // 1 - dao factory
            // 1 - dao payer (who paid to create the dao)
            // 2 - dao members
            // But the dao owner and the factory addresses are not active members
            // so they will not receive funds.
            expect(numberOfMembers).equal(5);
    
            // Distribute the funds to the DAO member
            // toIndex = number of members to process and distribute the funds to all members
            await distributeContract.distribute(dao.address, numberOfMembers, {
                from: daoOwner,
                gasPrice: toBN("0"),
            });
    
            memberABalance = await bank.balanceOf(daoMemberA, ETH_TOKEN);
            expect(memberABalance.toString()).equal("4"); //4.9999... rounded to 4
            memberBBalance = await bank.balanceOf(daoMemberB, ETH_TOKEN);
            expect(memberBBalance.toString()).equal("9"); //9.9999... rounded to 9
            let ownerBalance = await bank.balanceOf(daoOwner, ETH_TOKEN);
            expect(ownerBalance.toString()).equal("0");
        });
    
        it("should not be possible to create a proposal with the amount.toEquals to 0", async () => {
            const dao = this.dao;
            const distributeContract = this.adapters.distribute;
    
            // Submit distribute proposal with invalid amount
            const amountToDistribute = 0;
            await expectRevert(
                distributeContract.submitProposal(
                    dao.address,
                    getProposalCounter(),
                    daoOwner,
                    ETH_TOKEN,
                    amountToDistribute,
                    fromUtf8("paying dividends"),
                    {
                        from: daoOwner,
                        gasPrice: toBN("0"),
                    }
                ),
                "invalid amount"
            );
        });
    
        it("should not be possible to create a proposal with an invalid token", async () => {
            const dao = this.dao;
            const distributeContract = this.adapters.distribute;
    
            // Submit distribute proposal with invalid token
            const invalidToken = "0x0000000000000000000000000000000000000123";
            await expectRevert(
                distributeContract.submitProposal(
                    dao.address,
                    getProposalCounter(),
                    daoOwner,
                    invalidToken,
                    10,
                    fromUtf8("paying dividends"),
                    {
                        from: daoOwner,
                        gasPrice: toBN("0"),
                    }
                ),
                "token not allowed"
            );
        });
    
        it("should not be possible to create a proposal if the sender is not a member", async () => {
            const nonMember = accounts[5];
            const dao = this.dao;
            const distributeContract = this.adapters.distribute;
    
            await expectRevert(
                distributeContract.submitProposal(
                    dao.address,
                    getProposalCounter(),
                    daoOwner,
                    ETH_TOKEN,
                    10,
                    fromUtf8("paying dividends"),
                    {
                        from: nonMember, // The sender is not a member
                        gasPrice: toBN("0"),
                    }
                ),
                "onlyMember"
            );
        });
    
        it("should not be possible to create a proposal if the target member does not have units (advisor)", async () => {
            const advisor = accounts[3];
            const dao = this.dao;
            const onboarding = this.adapters.onboarding;
            const voting = this.adapters.voting;
            const distributeContract = this.adapters.distribute;
    
            // New member joins as an Advisor (only receives LOOT)
            await onboardingNewMember(
                getProposalCounter(),
                dao,
                onboarding,
                voting,
                advisor,
                daoOwner,
                unitPrice,
                LOOT
            );
    
            // Submit distribute proposal with a non active member
            await expectRevert(
                distributeContract.submitProposal(
                    dao.address,
                    getProposalCounter(),
                    advisor,
                    ETH_TOKEN,
                    10,
                    fromUtf8("paying dividends"),
                    {
                        from: daoOwner,
                        gasPrice: toBN("0"),
                    }
                ),
                "not enough units"
            );
        });
    
        it("should not be possible to create a proposal if the a non member is indicated to receive the funds", async () => {
            const nonMember = accounts[3];
            const dao = this.dao;
            const distributeContract = this.adapters.distribute;
    
            // Submit distribute proposal with a non member
            await expectRevert(
                distributeContract.submitProposal(
                    dao.address,
                    getProposalCounter(),
                    nonMember,
                    ETH_TOKEN,
                    10,
                    fromUtf8("paying dividends"),
                    {
                        from: daoOwner,
                        gasPrice: toBN("0"),
                    }
                ),
                "not enough units"
            );
        });
    
        it("should not be possible to create more than one proposal using the same proposal id", async () => {
            const daoMember = accounts[3];
            const dao = this.dao;
            const onboarding = this.adapters.onboarding;
            const voting = this.adapters.voting;
            const distributeContract = this.adapters.distribute;
    
            await onboardingNewMember(
                getProposalCounter(),
                dao,
                onboarding,
                voting,
                daoMember,
                daoOwner,
                unitPrice,
                UNITS
            );
    
            // Submit distribute proposal for the 1st time
            let { proposalId } = await distributeFundsProposal(
                dao,
                distributeContract,
                ETH_TOKEN,
                10,
                daoMember,
                daoOwner
            );
    
            // Submit distribute proposal using the same id
            await expectRevert(
                distributeContract.submitProposal(
                    dao.address,
                    proposalId,
                    daoMember,
                    ETH_TOKEN,
                    10,
                    fromUtf8("paying dividends"),
                    {
                        from: daoOwner,
                        gasPrice: toBN("0"),
                    }
                ),
                "proposalId must be unique"
            );
        });
    
        it("should not be possible to process a proposal that was not voted on", async () => {
            const daoMemberA = accounts[3];
            const dao = this.dao;
            const onboarding = this.adapters.onboarding;
            const voting = this.adapters.voting;
            const distributeContract = this.adapters.distribute;
    
            await onboardingNewMember(
                getProposalCounter(),
                dao,
                onboarding,
                voting,
                daoMemberA,
                daoOwner,
                unitPrice,
                UNITS
            );
    
            // Submit distribute proposal for the 1st time
            let { proposalId } = await distributeFundsProposal(
                dao,
                distributeContract,
                ETH_TOKEN,
                5,
                daoMemberA,
                daoOwner
            );
    
            // Starts to process the proposal
            await expectRevert(
                distributeContract.processProposal(dao.address, proposalId, {
                    from: daoOwner,
                    gasPrice: toBN("0"),
                }),
                "proposal has not been voted on"
            );
        });
    
        it("should not be possible to distribute if proposal vote result is TIE", async () => {
            const daoMemberA = accounts[3];
            const dao = this.dao;
            const onboarding = this.adapters.onboarding;
            const voting = this.adapters.voting;
            const distributeContract = this.adapters.distribute;
    
            await onboardingNewMember(
                getProposalCounter(),
                dao,
                onboarding,
                voting,
                daoMemberA,
                daoOwner,
                unitPrice,
                UNITS
            );
    
            // Submit distribute proposal for the 1st time
            let { proposalId } = await distributeFundsProposal(
                dao,
                distributeContract,
                ETH_TOKEN,
                5,
                daoMemberA,
                daoOwner
            );
    
            // Vote YES on the proposal
            await voting.submitVote(dao.address, proposalId, 1, {
                from: daoOwner,
                gasPrice: toBN("0"),
            });
    
            // Vote NO on the proposal
            await voting.submitVote(dao.address, proposalId, 2, {
                from: daoMemberA,
                gasPrice: toBN("0"),
            });
            await advanceTime(10000);
    
            // Starts to process the proposal
            await distributeContract.processProposal(dao.address, proposalId, {
                from: daoOwner,
                gasPrice: toBN("0"),
            });
    
            // Try to distribute funds when the proposal is not in progress
            await expectRevert(
                distributeContract.distribute(dao.address, 0, {
                    from: daoOwner,
                    gasPrice: toBN("0"),
                }),
                "distrib completed or not exist"
            );
        });
    
        it("should not be possible to distribute if proposal vote result is NOT_PASS", async () => {
            const daoMemberA = accounts[3];
    
            const dao = this.dao;
            const onboarding = this.adapters.onboarding;
            const voting = this.adapters.voting;
            const distributeContract = this.adapters.distribute;
    
            await onboardingNewMember(
                getProposalCounter(),
                dao,
                onboarding,
                voting,
                daoMemberA,
                daoOwner,
                unitPrice,
                UNITS
            );
    
            // Submit distribute proposal for the 1st time
            let { proposalId } = await distributeFundsProposal(
                dao,
                distributeContract,
                ETH_TOKEN,
                5,
                daoMemberA,
                daoOwner
            );
    
            // Vote NO on the proposal
            await voting.submitVote(dao.address, proposalId, 2, {
                from: daoOwner,
                gasPrice: toBN("0"),
            });
    
            // Vote NO on the proposal
            await voting.submitVote(dao.address, proposalId, 2, {
                from: daoMemberA,
                gasPrice: toBN("0"),
            });
            await advanceTime(10000);
    
            // Starts to process the proposal
            await distributeContract.processProposal(dao.address, proposalId, {
                from: daoOwner,
                gasPrice: toBN("0"),
            });
    
            // Try to distribute funds when the proposal is not in progress
            await expectRevert(
                distributeContract.distribute(dao.address, 0, {
                    from: daoOwner,
                    gasPrice: toBN("0"),
                }),
                "distrib completed or not exist"
            );
        });
    
        it("should not be possible to process a proposal that was already processed", async () => {
            const daoMemberA = accounts[3];
            const dao = this.dao;
            const onboarding = this.adapters.onboarding;
            const voting = this.adapters.voting;
            const distributeContract = this.adapters.distribute;
    
            await onboardingNewMember(
                getProposalCounter(),
                dao,
                onboarding,
                voting,
                daoMemberA,
                daoOwner,
                unitPrice,
                UNITS
            );
    
            // Submit distribute proposal for the 1st time
            let { proposalId } = await distributeFundsProposal(
                dao,
                distributeContract,
                ETH_TOKEN,
                5,
                daoMemberA,
                daoOwner
            );
    
            // Vote YES on the proposal
            await voting.submitVote(dao.address, proposalId, 1, {
                from: daoOwner,
                gasPrice: toBN("0"),
            });
            await advanceTime(10000);
    
            // Starts to process the proposal
            await distributeContract.processProposal(dao.address, proposalId, {
                from: daoOwner,
                gasPrice: toBN("0"),
            });
    
            // Attempt to process the same proposal that is already in progress
            await expectRevert(
                distributeContract.processProposal(dao.address, proposalId, {
                    from: daoOwner,
                    gasPrice: toBN("0"),
                }),
                "flag already set"
            );
        });
    
        it("should not be possible to process a new proposal if there is another in progress", async () => {
            const daoMemberA = accounts[3];
            const dao = this.dao;
            const onboarding = this.adapters.onboarding;
            const voting = this.adapters.voting;
            const distributeContract = this.adapters.distribute;
    
            await onboardingNewMember(
                getProposalCounter(),
                dao,
                onboarding,
                voting,
                daoMemberA,
                daoOwner,
                unitPrice,
                UNITS
            );
    
            // Submit distribute proposal for the 1st time
            let { proposalId } = await distributeFundsProposal(
                dao,
                distributeContract,
                ETH_TOKEN,
                5,
                daoMemberA,
                daoOwner
            );
    
            // Vote YES on the proposal
            await voting.submitVote(dao.address, proposalId, 1, {
                from: daoOwner,
                gasPrice: toBN("0"),
            });
            await advanceTime(10000);
    
            // Starts to process the proposal
            await distributeContract.processProposal(dao.address, proposalId, {
                from: daoOwner,
                gasPrice: toBN("0"),
            });
    
            // Creates a new distribution proposal
            let result = await distributeFundsProposal(
                dao,
                distributeContract,
                ETH_TOKEN,
                5,
                daoMemberA,
                daoOwner
            );
    
            // Vote YES on the proposal
            await voting.submitVote(dao.address, result.proposalId, 1, {
                from: daoOwner,
                gasPrice: toBN("0"),
            });
            await advanceTime(10000);
    
            // Attempt to process the new proposal but there is one in progress already
            await expectRevert(
                distributeContract.processProposal(dao.address, result.proposalId, {
                    from: daoOwner,
                    gasPrice: toBN("0"),
                }),
                "another proposal already in progress"
            );
        });
    
        it("should not be possible to distribute the funds if the proposal is not in progress", async () => {
            const daoMemberA = accounts[3];
            const dao = this.dao;
            const onboarding = this.adapters.onboarding;
            const voting = this.adapters.voting;
            const distributeContract = this.adapters.distribute;
    
            await onboardingNewMember(
                getProposalCounter(),
                dao,
                onboarding,
                voting,
                daoMemberA,
                daoOwner,
                unitPrice,
                UNITS
            );
    
            // Submit distribute proposal for the 1st time
            await distributeFundsProposal(
                dao,
                distributeContract,
                ETH_TOKEN,
                5,
                daoMemberA,
                daoOwner
            );
    
            // Try to distribute funds when the proposal is not in progress
            await expectRevert(
                distributeContract.distribute(dao.address, 1, {
                    from: daoOwner,
                    gasPrice: toBN("0"),
                }),
                "distrib completed or not exist"
            );
        });
    
        it("should not be possible to send ETH to the adapter via receive function", async () => {
            const adapter = this.adapters.distribute;
            await expectRevert(
                web3.eth.sendTransaction({
                    to: adapter.address,
                    from: daoOwner,
                    gasPrice: toBN("0"),
                    value: toWei(toBN("1"), "ether"),
                }),
                "revert"
            );
        });
    
        it("should not be possible to send ETH to the adapter via fallback function", async () => {
            const adapter = this.adapters.distribute;
            await expectRevert(
                web3.eth.sendTransaction({
                    to: adapter.address,
                    from: daoOwner,
                    gasPrice: toBN("0"),
                    value: toWei(toBN("1"), "ether"),
                    data: fromAscii("should go to fallback func"),
                }),
                "revert"
            );
        });
        */
});
