const abis = require('../build/artifacts/contracts/SummonDao.sol/SummonDao.json');
const daoFactoryABI = require('../build/artifacts/contracts/core/DaoFactory.sol/DaoFactory.json')
const ethers = require('ethers');
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
    ZERO_ADDRESS,
    toUtf8,
    oneDay
} = require("../utils/contract-util");
let provider = ethers.getDefaultProvider('goerli');
const summonDaoContractAddress = "0x15011A10B50f63CC0Ff649F6501383FAF7861471";
const daoFactoryContractAddress = "0xC213d9093e37Aae1A7Ee1502bfa6eaE7809223B6";
const signer = new ethers.Wallet(process.env.GOERLI_TEST_PRIVATE_KEY, provider);

const summonDaoContract = new ethers.Contract(summonDaoContractAddress, abis.abi, provider).connect(signer);
let daoFactoryContract = new ethers.Contract(daoFactoryContractAddress, daoFactoryABI.abi, provider);

const summonFlexDao = async () => {
    const daoFactoriesAddress = [
        "0xC213d9093e37Aae1A7Ee1502bfa6eaE7809223B6",
        "0xB489597a3e9A45c3762f63Aa75A2Bb2F5ECdcCAa"
    ];
    const _daoName = "my_flex_dao022";
    const _creator = "0x540881ECaF34C85EfB352727FC2F9858B19C4b08";
    const enalbeAdapters = [
        {
            id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd',//FlexVesting
            addr: "0x5B2dE848f82638716C9aEf173279F5b54C8aD471",
            flags: 0
        },
        {
            id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35',//FlexERC721
            addr: "0xcd59d08df3eF6687F2a2072FFeA3A786b2189226",
            flags: 0
        },
        {
            id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8',//FlexAllocationAdapterContract
            addr: "0xa22967739a3B388fcA1be4Df04EFC0BBD2e6DA4C",
            flags: 0
        },
        {
            id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c',//FlexFundingPoolAdapterContract
            addr: "0xa9e45844AFfECA5D1e23457677133771628c1DCd",
            flags: 0
        },
        {
            id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7',//FlexVotingContract
            addr: "0x976D6E3a24465715793c40268C0EE68275e5afbB",
            flags: 258
        },
        {
            id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610',//FlexPollingVotingContract
            addr: "0x0b43Ce4F7126212a6d64eB86B141DbDB77b08C69",
            flags: 258
        },
        {
            id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda',//FlexFundingAdapterContract
            addr: "0xade2D6CA47D63faCE468Ae298a2cAD823aA41894",
            flags: 258
        },
        {
            id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
            addr: "0x7226a840199E0AC999a1552600B8bAe4cB6160B7",
            flags: 0
        },
        {
            id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//ManagingContract
            addr: "0x352B3E3426D4A6662655BBFab6CE84F36cC0e9bd",
            flags: 59
        }
    ];
    const adapters1 = [
        {
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: "0xa9e45844AFfECA5D1e23457677133771628c1DCd",//FlexFundingPoolAdapterContract
            flags: 75
        },
        {
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: "0xade2D6CA47D63faCE468Ae298a2cAD823aA41894",//FlexFundingAdapterContract
            flags: 26
        }
    ];

    // let blocktimestamp = (await ethers.provider.getBlock("latest")).timestamp;

    const flexDaoParticipantCapInfo = [
        true,//bool enable;
        5//uint256 maxParticipantsAmount;
    ];

    const flexDaoParticipantMembershipEnalbe = true;

    const flexDaoParticipantsMemberships = [
        "participantmembershipInfo01", // string name;
        0,// uint8 varifyType;
        ethers.utils.parseEther("100"),  // uint256 minHolding;
        "0x0B133Cc91a191d8d83133690019375a362B3886D", // address tokenAddress;
        0,// uint256 tokenId;
        [ZERO_ADDRESS]//whiteList;

    ];

    const flexDaoStewardMembershipInfo = [
        1, // bool enable;
        0, // uint256 varifyType;
        ethers.utils.parseEther("100"), // uint256 minHolding;
        "0x0B133Cc91a191d8d83133690019375a362B3886D",// address tokenAddress;
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
        ethers.utils.parseEther("100"), // uint256 minHolding;
        "0x0B133Cc91a191d8d83133690019375a362B3886D", // address tokenAddress;
        0, // uint256 tokenId;
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
        ethers.utils.parseEther("100"),  // uint256 minHolding;
        "0x0B133Cc91a191d8d83133690019375a362B3886D",  // address tokenAddress;
        0,   // uint256 tokenId;
        []  // address[] whiteList;
    ];
    const flexDaoManagementfee = 2;

    const flexDaoGenesisStewards = [
        "0x9ac9c636404C8d46D9eb966d7179983Ba5a3941A",
        "0xb7a0f269468DA74E4b71569c903cf20ce4a507A8"
    ];

    const fundingPollEnable = false;

    const flexDaoFundriaseStyle = 0// 0 - FCFS 1- Free in
    const flexDaoInfo = {
        name: _daoName,// string name;
        creator: _creator,  // address creator;
        flexDaoManagementfee: flexDaoManagementfee,   // uint256 flexDaoManagementfee;
        flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
        flexDaoFundriaseStyle: flexDaoFundriaseStyle// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
    }

    const flexDaoPriorityDepositEnalbe = true;

    const flexDaoPriorityDepositMembershipInfo = {
        varifyType: 0,    // uint8 varifyType;
        minHolding: ethers.utils.parseEther("1000"), // uint256 minHolding;
        tokenAddress: "0x0B133Cc91a191d8d83133690019375a362B3886D",// address tokenAddress;
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

    console.log(flexDaoParams);
    return;
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

    // let daoAddr = "0xf680B96E88fE0eeA1C797f59a4Ce0bFA647E5112";
    tx = await summonDaoContract.summonFlexDao9(flexDaoParams, daoAddr);
    result = await tx.wait();
    console.log("summonFlexDao9 finished...");

    tx = await summonDaoContract.summonFlexDao10(flexDaoParams, daoAddr);
    result = await tx.wait();
    console.log("summonFlexDao10 finished...");

    tx = await summonDaoContract.summonFlexDao11(flexDaoParams, daoAddr);
    result = await tx.wait();
    console.log("summonFlexDao11 finished...");
}

async function main() {
    await summonFlexDao();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });