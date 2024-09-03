import { ethers, network, artifacts } from 'hardhat';
import { addSyntheticLeadingComment } from 'typescript';
const {
    toBN,
    toWei,
    fromUtf8,
    fromAscii,
    unitPrice,
    UNITS,
    ETH_TOKEN,
    sha3,
    numberOfUnits,
    maximumChunks,
    maxAmount,
    maxUnits,
    ZERO_ADDRESS
} = require("../utils/contract-util");

const {
    bankExtensionAclFlagsMap,
    daoAccessFlagsMap,
    entryDao,
    entryBank,
} = require("../utils/access-control-util");

import { extensionsIdsMap, adaptersIdsMap } from "../utils/dao-ids-util";


import { takeChainSnapshot, revertChainSnapshot, proposalIdGenerator, expect, expectRevert, web3 } from "../utils/hh-util";

const DaoFactoryAddr = "0x224a5eCD05e2f403d4a87D9cA65Be179E00c4cbc"
const DaoRegistryAddr = "0xdcB19280D7fA277B7a7BaFa7D72f16C246DDff36"
const FundingPoolFactoryAddr = "0x50F51B1b0CC153Bf4c53F6D490bCeB113963081D"
const GPDaoFactoryAddr = "0xCa9345b12A63399bd7CdfdE3b694cbb500E36055"
//Extensions
const FundingPoolExtensionAddr = "0x561FFE3F621b664d3248956C350694226d51B79C"
const GPDaoExtensionAddr = "0xb9A9f2dF2698262B5a00c6A6f379cd85c3135950"
//Adapters
const FundingPoolAdapterContractAddr = "0xFa41dc1215e7a0c792280Fc3F6d367C249da0d45"
const GPDaoAdapterContractAddr = "0x326C7e70bd5227e7a2b6D63B63a8224be6496983"
const SablierAddr = "0xe654dF1b9A896C7E7ea5015FFeE2eba619E7ab04"
const ManageMemberAdapterContractAddr = "0xeF1CCe86e0CDc7ca5f6d15cea5528cb3583ca949"
const DistributeFundContractAddr = "0xbDB1D4af3b1D6814e897E7f49d3eBfE8892ecF94"
const GPVotingContractAddr = "0x9C1667c82CD8DcCA1404218c35E4f5a4160d9816"
const AllocationAdapterContractAddr = "0x6FCbDc03826e673A8041B807179af1bA81CD9256"
const ManagingAdapterContractAddr = "0xFd889F58CEEC708c12fec78380f56354AEb4A90f"
//Test
const TestToken1Addr = "0x20373A9C45adf8Bc85463D0D5696e2549a5f6d7b"
const TestToken2Addr = "0xCA7b43534bD6f9F0A7B288F3307D88545dB058fb"

let instanceDaoFactory;
let instanceDaoRegistry;
let instanceFundingPoolExt;
let iinstanceGPDaoExt;
let instanceFundingPoolAda;
let instanceGPDaoAda;
let instanceSablierAda;
let instancemanageMemberAda;
let instanceManagingAda;
let instanceDistributeFundAda;
let instanceGpVotingAda;
let instanceAllocAda;
let instanceTestToken1;
let instanceTestToken2;

let owner;
const proposalCounter = proposalIdGenerator().generator;

function getProposalCounter() {
    return proposalCounter().next().value;
}

(async () => {
    owner = new ethers.Wallet(process.env.RINKEBY_TEST_PRIVATE_KEY, ethers.provider);

    instanceDaoFactory = (await ethers.getContractFactory('DaoFactory')).connect(owner).attach(DaoFactoryAddr);
    instanceDaoRegistry = (await ethers.getContractFactory('DaoRegistry')).connect(owner).attach(DaoRegistryAddr);
    instanceFundingPoolExt = (await ethers.getContractFactory('FundingPoolExtension')).connect(owner).attach(FundingPoolExtensionAddr);
    iinstanceGPDaoExt = (await ethers.getContractFactory('GPDaoExtension')).connect(owner).attach(GPDaoExtensionAddr);
    instanceFundingPoolAda = (await ethers.getContractFactory('FundingPoolAdapterContract')).connect(owner).attach(FundingPoolAdapterContractAddr);
    instanceGPDaoAda = (await ethers.getContractFactory('GPDaoAdapterContract')).connect(owner).attach(GPDaoAdapterContractAddr);
    instanceSablierAda = (await ethers.getContractFactory('Sablier')).connect(owner).attach(SablierAddr);
    instancemanageMemberAda = (await ethers.getContractFactory('ManageMemberAdapterContract')).connect(owner).attach(ManageMemberAdapterContractAddr);
    instanceManagingAda = (await ethers.getContractFactory('ManagingContract')).connect(owner).attach(ManagingAdapterContractAddr);
    instanceDistributeFundAda = (await ethers.getContractFactory('DistributeFundContract')).connect(owner).attach(DistributeFundContractAddr);
    instanceGpVotingAda = (await ethers.getContractFactory('GPVotingContract')).connect(owner).attach(GPVotingContractAddr);
    instanceAllocAda = (await ethers.getContractFactory('AllocationAdapterContract')).connect(owner).attach(AllocationAdapterContractAddr);
    instanceTestToken1 = (await ethers.getContractFactory('TestToken1')).connect(owner).attach(TestToken1Addr);
    instanceTestToken2 = (await ethers.getContractFactory('TestToken2')).connect(owner).attach(TestToken2Addr);


    // const daoAddr = await getDaoAddrByName(owner, "test-dao");
    // await createNewFundingPoolExt(owner, daoAddr);
    // await getFundingPoolExtensionAddr(owner, daoAddr);
    // await createNewGPExt(owner, daoAddr);
    // await getGPDaoExtensionAddr(owner, daoAddr);
    // console.log(fromUtf8("paying dividends"));
    // await submitDistributeProposal(DaoRegistryAddr, owner.address, TestToken2Addr);
    // await gpVoting();
    // await getConfigValue();
    // await setConfig();
    // await getAllDaoMembers();
    await getAdapterAddrByName();
    // await depositFund();

    // await deployVotingAdapter();
})();


async function getDaoAddrByName(owner, daoName) {
    const daoAddr = await instanceDaoFactory.getDaoAddress(daoName);
    console.log(`test dao addr ${daoAddr}`);
    return daoAddr;
}

async function getFundingPoolExtensionAddr(owner, daoAddr) {
    let instanceFundingPoolFactory = (await ethers.getContractFactory('FundingPoolFactory')).connect(owner).attach("0x2E932813eE61692a53DF3E95B3a6ABedf663D074");
    const fundingPoolExtensionAddr = await instanceFundingPoolFactory.getExtensionAddress(daoAddr);
    console.log(`funding Pool Extension addr ${fundingPoolExtensionAddr}`);
}

async function getGPDaoExtensionAddr(owner, daoAddr) {
    let instanceGPDaoFactory = (await ethers.getContractFactory('GPDaoFactory')).connect(owner).attach("0xE2597A60134695D08DE1D7ED9Eb1396a88Fdf413");
    const GPDaoExtensionAddr = await instanceGPDaoFactory.getExtensionAddress(daoAddr);
    console.log(`GPDao Extension Addr addr ${GPDaoExtensionAddr}`);
}

async function createNewFundingPoolExt(owner, daoAddr) {
    let instanceFundingPoolFactory = (await ethers.getContractFactory('FundingPoolFactory')).connect(owner).attach("0x2E932813eE61692a53DF3E95B3a6ABedf663D074");
    await instanceFundingPoolFactory.create(daoAddr, 10, 5);
}

async function createNewGPExt(owner, daoAddr) {
    let instanceGPDaoFactory = (await ethers.getContractFactory('GPDaoFactory')).connect(owner).attach("0xE2597A60134695D08DE1D7ED9Eb1396a88Fdf413");
    await instanceGPDaoFactory.create(daoAddr);
}

async function submitDistributeProposal(daoAddr, projectTeamAddr, projectTeamTokenAddr, proposalId = null
) {
    const newProposalId = proposalId ? proposalId : getProposalCounter();
    console.log(`newProposalId:${newProposalId}`);

    const requestedFundAmount = ethers.utils.parseEther("100");
    const tradingOffTokenAmount = ethers.utils.parseEther("5000");
    let blocktimestamp = (await ethers.provider.getBlock("latest")).timestamp;
    const lockupDate = blocktimestamp + 24;
    console.log(`lockupDate: ${lockupDate}`);
    const fullyReleasedDate = lockupDate + 10000;

    await instanceTestToken2.connect(owner).approve(DistributeFundContractAddr, tradingOffTokenAmount);

    console.log(newProposalId, [projectTeamAddr, projectTeamTokenAddr], [requestedFundAmount, tradingOffTokenAmount, fullyReleasedDate, lockupDate], fromUtf8("paying dividends"));
    await instanceDistributeFundAda.submitProposal(
        daoAddr,
        newProposalId,
        [projectTeamAddr, projectTeamTokenAddr],
        [requestedFundAmount, tradingOffTokenAmount, fullyReleasedDate, lockupDate],
        fromUtf8("paying dividends")
    );

}

async function depositFund() {
    await instanceTestToken1.connect(owner).approve(FundingPoolAdapterContractAddr, ethers.utils.parseEther("1000"));
    await instanceFundingPoolAda.connect(owner).deposit(DaoRegistryAddr, owner.address, ethers.utils.parseEther("1000"));
}

async function getAllDaoMembers() {
    const nbMembers = await instanceDaoRegistry.getNbMembers();
    let members = [];
    if (nbMembers > 0) {
        for (var i = 0; i < nbMembers; i++) {
            const addr = await instanceDaoRegistry.getMemberAddress(i);
            members.push(addr);
        }
    }
    console.log(`All Dao Members ${members}`);
    return members;
}

async function gpVoting() {
    //gp1 Vote YES on the proposal
    await instanceGpVotingAda.connect(owner).submitVote(DaoRegistryAddr, "0x0000000000000000000000000000000000000000000000000000000000000001",
        TestToken1Addr,
        1);

}

async function getConfigValue() {
    const votingPeriod = await instanceDaoRegistry.getConfiguration(sha3("voting.votingPeriod"));
    const gracePeriod = await instanceDaoRegistry.getConfiguration(sha3("voting.gracePeriod"));

    console.log(`voting.votingPeriod: ${votingPeriod}`);
    console.log(`voting.gracePeriod: ${gracePeriod}`);

}

async function setConfig() {
    await instanceDaoRegistry.setConfigurationByMember(sha3("voting.votingPeriod"), 60 * 15);
    await getConfigValue();
}

async function submitConfigureProposal() {
    const newProposalId = proposalId ? proposalId : getProposalCounter();
    console.log(`newProposalId:${newProposalId}`);
    const newAdapterId = sha3("invalid-id");

    await instanceManagingAda.submitProposal(
        DaoRegistryAddr,
        newProposalId,
        {
            adapterOrExtensionId: newAdapterId,
            adapterOrExtensionAddr: ZERO_ADDRESS, //any sample address
            updateType: 2,
            flags: 0,
            keys: [],
            values: [],
            extensionAddresses: [],
            extensionAclFlags: [],
        },
        [], //configs
        [], //data
        {
            from: daoOwner,
            gasPrice: toBN("0"),
        }
    );
}

async function deployVotingAdapter() {
    // const VotingAda = await ethers.getContractFactory("VotingContract");
    // const votingAda = await VotingAda.connect(owner).deploy();
    // await votingAda.deployed();
    // console.log(`votingAda deployed address: ${votingAda.address}`);
    //add to dao registry
    let votingAda = (await ethers.getContractFactory('VotingContract')).connect(owner).attach("0xc9E86D68591B49C1B41D3db7e084fAd0398CE6c3");
    const contractsWithAccess = entryDao(adaptersIdsMap.VOTING_ADAPTER, "0xc9E86D68591B49C1B41D3db7e084fAd0398CE6c3", {
        dao: [
            daoAccessFlagsMap.SET_CONFIGURATION]
    });

    console.log(contractsWithAccess.id);
    console.log(contractsWithAccess.addr);
    console.log(contractsWithAccess.flags);

    await instanceDaoFactory.addAdapters(DaoRegistryAddr, [contractsWithAccess]);

    //config dao
    const votingPeriod = 60 * 10;
    const gracePeriod = 60 * 5;
    await votingAda.configureDao(DaoRegistryAddr, votingPeriod, gracePeriod);
}

async function getAdapterAddrByName() {
    const gpdaoAdaAddr = await instanceDaoRegistry.getAdapterAddress(sha3(adaptersIdsMap.GP_DAO_ADAPTER));
    const streamingpaymentAdaAddr = await instanceDaoRegistry.getAdapterAddress(sha3(adaptersIdsMap.STREAMING_PAYMENT_ADAPTER));
    const managememberAdaAddr = await instanceDaoRegistry.getAdapterAddress(sha3(adaptersIdsMap.MANAGE_MEMBER_ADAPTER));
    const allocAdaAddr = await instanceDaoRegistry.getAdapterAddress(sha3(adaptersIdsMap.ALLOCATION_ADAPTER));
    const gpvotingAdaAddr = await instanceDaoRegistry.getAdapterAddress(sha3(adaptersIdsMap.GPVOTING_ADAPTER));
    const distributefundAdaAddr = await instanceDaoRegistry.getAdapterAddress(sha3(adaptersIdsMap.DISTRIBUTE_FUND_ADAPTER));
    const fundingpoolAdaAddr = await instanceDaoRegistry.getAdapterAddress(sha3(adaptersIdsMap.FOUNDING_POOL_ADAPTER));

    console.log(`${adaptersIdsMap.GP_DAO_ADAPTER} Adapter address ${gpdaoAdaAddr}`);
    console.log(`${adaptersIdsMap.STREAMING_PAYMENT_ADAPTER} Adapter address ${streamingpaymentAdaAddr}`);
    console.log(`${adaptersIdsMap.MANAGE_MEMBER_ADAPTER} Adapter address ${managememberAdaAddr}`);
    console.log(`${adaptersIdsMap.ALLOCATION_ADAPTER} Adapter address ${allocAdaAddr}`);
    console.log(`${adaptersIdsMap.GPVOTING_ADAPTER} Adapter address ${gpvotingAdaAddr}`);
    console.log(`${adaptersIdsMap.DISTRIBUTE_FUND_ADAPTER} Adapter address ${distributefundAdaAddr}`);
    console.log(`${adaptersIdsMap.FOUNDING_POOL_ADAPTER} Adapter address ${fundingpoolAdaAddr}`);
}