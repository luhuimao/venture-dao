// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
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
const {
    checkBalance,
    depositToFundingPool,
    createDistributeFundsProposal
} = require("../utils/test-util");
const {
    syncBuiltinESMExports
} = require("node:module");
const {
    isAsyncFunction
} = require("node:util/types");
const summonFlexDaoContractAddress = "0xceeb2b45a74a4d9f8348f09c33f70cedeb0b7878";
const deploySummonContract = async () => {
    const SummonDao = await hre.ethers.getContractFactory("SummonDao");
    const summonDao = await SummonDao.deploy();
    await summonDao.deployed();
    console.log("summonDao deployed address:", summonDao.address);
}

async function main() {
    // await getCollectiveAdapterAddress();
    await getCollectiveProtocolFeeAndAccount();
    // await getVintageInvestors();
    // await getVintageAdapterAddress();
    // await getFlexDaosetPropsalInfo();
    // await summonFlexDao();
    // await getVintageManagementFee();
    // await getFlexEscrowTokenInfo();
    // await createDaosetProposal();
    // await getAdapterAddress();
    // await getDaoConfig();
    // await getDaoInfo("0xEd0B0ADE001Dd4C004d3e454e9BE52e3ACc1bA35");
    // await deploy();
    // await getFlexdaoInvestorWhitelist();
    // await summonVintageDao();
    // await submitVintageDaosetProposal();
    // await getVintageDaosetProposal();
    // await getVintageNewFundProposalInfo();
    // await getFlexInvestors();
    // await getFlexFundingProposalInfo();
    // await summonFlexDao();
    // await getFlexPollingVotingWeight();
    // await createFlexFundingProposal("0x540431fa5403edd1716b6443c7b0b7ca6ae2def6");
    // await getFlexVestingInfo();
    // await createFlexVesting();
    // await ifFlexVestingElegible();
    // await getVintageSetApproveAmount();
    // await fetchBathETHBalance();
    // await isVintageRedemptPeriod();
    // await getVintageEscrowTokenInfo();
    // await getVintageNewFundProposalInfo();
    // await getvintageFundingReturnTokenApprovedAmount(
    //     "0x82d1f2b12c1b35cf06d5d3f9559c75c3d3a47c89",
    //     "0x559c75c3d3a47c8946756e64696e672331000000000000000000000000000000",
    //     "0x9ac9c636404c8d46d9eb966d7179983ba5a3941a",
    //     "0x47ac6a76383661f64a880f6eab189f9a7e327b59"
    // );

    // await getVintageEscorwFundAmount();

    // await checkStewardWhitelist();
    // await summonFlexDao("202303160944");
    // await submitStewardInProposal("0xffd855c2ec6cefeb9a82f7d14afd28efc5264597", "0x540881ecaf34c85efb352727fc2f9858b19c4b08");
    // await voteForStewarProposal("0xffd855c2ec6cefeb9a82f7d14afd28efc5264597",
    //     "0x476f7665726e6f722d4f75742332000000000000000000000000000000000000", 1);
    // await processStewardProposal("0xffd855c2ec6cefeb9a82f7d14afd28efc5264597",
    //     "0x476f7665726e6f722d4f75742332000000000000000000000000000000000000");

    // await stewardQuit("0xffd855c2ec6cefeb9a82f7d14afd28efc5264597");
    // await submitStewardOutProposal("0xffd855c2ec6cefeb9a82f7d14afd28efc5264597",
    //     "0x540881ecaf34c85efb352727fc2f9858b19c4b08");
    // await getVoteResult("0xffd855c2ec6cefeb9a82f7d14afd28efc5264597",
    //     "0x476f7665726e6f722d496e233200000000000000000000000000000000000000");

    // await createFlexFundingProposal("0xff81fca6050a4dfc654865fcbb2400dc888b74d3");
    // await voteForFundingProposal("0xff81fca6050a4dfc654865fcbb2400dc888b74d3",
    //     "0x46756e64696e6723380000000000000000000000000000000000000000000000",
    //     1);
    // await processFundingProposal("0xff81fca6050a4dfc654865fcbb2400dc888b74d3",
    //     "0x46756e64696e6723380000000000000000000000000000000000000000000000");
    // await deposit("0xff81fca6050a4dfc654865fcbb2400dc888b74d3",
    //     "0x46756e64696e6723380000000000000000000000000000000000000000000000");

    // await createVesting("0xe8f1df25a257bc72c005bb982ccb5cc5a1695095",
    //     "0x46756e64696e6723323700000000000000000000000000000000000000000000");
}

const GOERLI_CONTRACTS = {
    DaoFactory: "0x70050Ae33Ab726bd3Ad89c49532e127ba14E67de",
    FlexFundingPoolFactory: "0xB489597a3e9A45c3762f63Aa75A2Bb2F5ECdcCAa",
    StewardManagementContract: "0x2095ffd55D14D7F0937948f91457bf8A0f30E4e0",
    FlexPollingVotingContract: "0xfbEC02c4b44c80Fb5171826De380f5832D80fEdb",
    SummonDao: "0xceeb2b45a74a4d9f8348f09c33f70cedeb0b7878",
    FlexVesting: "0x5eA8274048fbbCd27bDf1DfF4841Af611f430e1b",
    FlexERC721: "0xcd59d08df3eF6687F2a2072FFeA3A786b2189226",
    FlexAllocationAdapterContract: "0x163b4496c4DA8173f1682BB0950238695cb06a35",
    FlexFundingPoolAdapterContract: "0xf73aC3dea5137BD2a7e7c13fe0Be3e110e4D5B0B",
    FlexVotingContract: "0x6781102e688e403FF89F57093493E6D86dd63Ca4",
    FlexFundingAdapterContract: "0xF08e9f7F821Af8AF9f9E3e9b8b484F2EB5bDE4A8",
    BentoBoxV1: "0x7226a840199E0AC999a1552600B8bAe4cB6160B7",
    ManagingContract: "0x352B3E3426D4A6662655BBFab6CE84F36cC0e9bd",
    TestToken1: "0x44844Cf72EeaB45D305DBD4C08054E3A027c396C",
    TestToken2: "0xE3aC90d9aC6ed9074de8CaabF234E5E0a1c308Bc"
}

const MUMBAI_CONTRACTS = {
    DaoFactory: "0xceEb2b45a74A4d9F8348F09C33f70CEdEB0B7878",
    FlexFundingPoolFactory: "0x6B93AAD680B156D68F90aC62e61058728f071716",
    StewardManagementContract: "0x8906fE795D8e07a60F9962382550Cc8365eBA24d",
    FlexPollingVotingContract: "0xCB718Bb0DB4395Bf5bC6A7Ec3C33C258A398Eca6",
    SummonDao: "0x8ed6b538357889cFddFfF4a26633982eE74EBa73",
    FlexVesting: "0x874320C07A247cD6Ca314C03f1e90e7959E9339b",
    FlexERC721: "0x5025e698c0475a4Dde679B94f74b46d29D753a16",
    FlexAllocationAdapterContract: "0x1770235638d80327f2Df2Ac0848dD817A59b6C27",
    FlexFundingPoolAdapterContract: "0x7e0D554725E239F14bF654D69F6c71358d67F2Ba",
    FlexVotingContract: "0x2BA88e7a66524F2395BcB65f0b3c0D8A9A6B5eA8",
    FlexFundingAdapterContract: "0xB40798f82ae5937b7Ab37E37fF9f6Cdc584008C2",
    BentoBoxV1: "0x207513Ce3bd9E798F817655DaD18E828Cab67623",
    ManagingContract: "0xfEA36Da2805A57216cc610eac89447a79aBeD5c8",
    TestToken1: "0x043572b715D78B22BC1BBCAEA8aB6cd57F050adc",
    TestToken2: "0x043572b715D78B22BC1BBCAEA8aB6cd57F050adc"
}


const deposit = async (daoAddress, proposalId) => {
    const [account1, account2, account3, account4, account5] = await hre.ethers.getSigners();

    const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddress);
    let testUSDT;
    if (hre.network.name == "mumbai") {
        testUSDT = MUMBAI_CONTRACTS.TestToken1;
    } else if (hre.network.name == "goerli") {
        testUSDT = GOERLI_CONTRACTS.TestToken1;
    }
    const TestUSDTContractInstance = (await hre.ethers.getContractFactory("TestToken1")).attach(testUSDT);
    const flexFundingPoolAdaptAddr = await dao.getAdapterAddress("0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c");
    const flexFundingPoolAdaptContractInstance = (await hre.ethers.getContractFactory("FlexFundingPoolAdapterContract"))
        .attach(flexFundingPoolAdaptAddr);
    let tx;
    const amount = hre.ethers.utils.parseEther("5000");
    tx = await TestUSDTContractInstance.connect(account1).
        approve(flexFundingPoolAdaptAddr, hre.ethers.utils.parseEther("5000"));
    await tx.wait();
    console.log("account1 approved...");

    tx = await flexFundingPoolAdaptContractInstance.connect(account1)
        .deposit(daoAddress, proposalId, amount);
    await tx.wait();
    console.log("account1 deposited...");

    tx = await TestUSDTContractInstance.connect(account2).
        approve(flexFundingPoolAdaptAddr, hre.ethers.utils.parseEther("5000"));
    await tx.wait();
    console.log("account2 approved...");

    tx = await flexFundingPoolAdaptContractInstance.connect(account2)
        .deposit(daoAddress, proposalId, amount);
    await tx.wait();
    console.log("account2 deposited...");

    tx = await TestUSDTContractInstance.connect(account3).
        approve(flexFundingPoolAdaptAddr, hre.ethers.utils.parseEther("5000"));
    await tx.wait();
    console.log("account3 approved...");

    tx = await flexFundingPoolAdaptContractInstance.connect(account3)
        .deposit(daoAddress, proposalId, amount);
    await tx.wait();
    console.log("account3 deposited...");


    tx = await TestUSDTContractInstance.connect(account4).
        approve(flexFundingPoolAdaptAddr, hre.ethers.utils.parseEther("5000"));
    await tx.wait();
    console.log("account4 approved...");

    tx = await flexFundingPoolAdaptContractInstance.connect(account4)
        .deposit(daoAddress, proposalId, amount);
    await tx.wait();
    console.log("account4 deposited...");

    tx = await TestUSDTContractInstance.connect(account5).
        approve(flexFundingPoolAdaptAddr, hre.ethers.utils.parseEther("5000"));
    await tx.wait();
    console.log("account5 approved...");

    tx = await flexFundingPoolAdaptContractInstance.connect(account5)
        .deposit(daoAddress, proposalId, amount);
    await tx.wait();
    console.log("account5 deposited...");
}

const summonVintageDao = async () => {
    const summonDaoContractAddress = "0x5444d57Ec537D4504A78DD55d651d3aDCe0509E5";

    const summonDaoContract = await (await hre.ethers.getContractFactory("SummonVintageDao"))
        .attach(summonDaoContractAddress);

    const enableAdapters = [
        {
            id: '0xa837e34a29b67bf52f684a1c93def79b84b9c012732becee4e5df62809df64ed', //fund raise
            addr: '0xC919743CAde9fD517D734a0E82040f1834673425',
            flags: 1034
        },
        {
            id: '0xaaff643bdbd909f604d46ce015336f7e20fee3ac4a55cef3610188dee176c892', //FundingPoolAdapterContract
            addr: '0x77C6838682C492eDFe49bEC363ffa62998d5A542',
            flags: 8
        },
        {
            id: '0xd3999c37f8f35da86f802a74f9bf032c4aeb46e49abd9c861f489ef4cb40d0a8', //vintageVotingAdapterContract
            addr: '0xBEC58Ac4C78C4Fe033bEdd6482568d56688F7ceB',
            flags: 258
        },
        {
            id: '0xd90e10040720d66c9412cb511e3dbb6ba51669248a7495e763d44ab426893efa', //vintageRaiserManagementContract
            addr: '0x6840e1C46B236846996ab8E6A8C669EfA0f263BB',
            flags: 6346
        },
        {
            id: '0x0fd8cce4ef00a7a8c0c5f91194bc80f122deefe664dd2a2384687da62ab117d1', //VintageFundingAdapterContract
            addr: '0xac780bCe030E85BeADDfE5591A138D7Fb6c48a94',
            flags: 770
        },
        {
            id: '0x99d271900d627893bad1d8649a7d7eb3501c339595ec52be94d222433d755603', //vintageAllocationAdapterContract
            addr: '0x030E8331c46191aBF02120dfd1717d5009d31f11',
            flags: 0
        },
        {
            id: '0x8295fbcf0c0d839b7cf11cacb43f22c81604fd9f0e4b295ff1d641ad9dd5786a', //vintageVestingContract
            addr: '0x2e40e9431Dba18817c4FA05e97B61868F6138Ebb',
            flags: 0
        },
        {
            id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
            addr: '0xb1b45A39DB8e8017d2C21c8773bD66e03f68A724',
            flags: 0
        },
        {
            id: '0xf03649ccf5cbda635d0464f73bc807b602819fde8d2e1387f87b988bb0e858a3', // vintageEscrowFundAdapterContract
            addr: '0x208c28b0D98763C60269b52fC6a4438B89C3e114',
            flags: 0
        },
        {
            id: '0xe1cf6669e8110c379c9ea0aceed535b5ed15ea1db2447ab3fbda96c746d21a1a', // vintageDistrubteAdapterContract
            addr: '0x15C67e4Ebf3145c53A763ff046bD1739F150a698',
            flags: 0
        },
        {
            id: '0x1fa6846b165d822fff79e37c67625706652fa9380c2aa49fd513ce534cc72ed4', // vintageRaiserAllocation
            addr: '0xd304806BfF7E3787296eEE7bA3B3eC40f5C6eA2B',
            flags: 0
        },
        {
            id: '0xde483f9dde6f6b12a62abdfd75010c5234f3ce7693a592507d331ec725f77257', // vintageFundingReturnTokenAdapterContract
            addr: '0xd24CF3E7f05Cc5D244D6aa4e85551361Cb046f93',
            flags: 0
        },
        {
            id: '0x6a687e96f72a484e38a32d2ee3b61626294e792821961a90ce9a98d1999252d5', //vintageFreeInEscrowFundAdapterContract
            addr: '0x746E96b56CD73849510f494CC8011206E69f49B6',
            flags: 0
        },
        {
            id: '0xe70101dfebc310a1a68aa271bb3eb593540746781f9eaca3d7f52f31ba60f5d1', //vintageFundingPoolAdapterHelperContract
            addr: '0x26910E5E3a769E3B5575480F7C2b085662F9bABc',
            flags: 0
        },
        {
            id: '0x77cdf6056467142a33aa6f753fc1e3907f6850ebf08c7b63b107b0611a69b04e', //vintageDaoSetAdapterContract
            addr: '0x71a216E657ff4f43131c0a59cda91d9D28458492',
            flags: 122890
        },
        {
            id: '0x145d8ebc4d7403f3cd60312331619ffb262c52c22bedf24c0148027dd4be3b01', //vintageDaoSetHelperAdapterContract
            addr: '0xc8ee0626dCfBA2D61423e974AC236E8B6f23B3Db',
            flags: 8
        }
    ];

    const adapters1 = [
        {
            id: '0x161fca6912f107b0f13c9c7275de7391b32d2ea1c52ffba65a3c961880a0c60f',
            addr: '0x77C6838682C492eDFe49bEC363ffa62998d5A542', //vintageFundingPoolAdapterContract
            flags: 23
        },
        {
            id: '0x161fca6912f107b0f13c9c7275de7391b32d2ea1c52ffba65a3c961880a0c60f',
            addr: '0xac780bCe030E85BeADDfE5591A138D7Fb6c48a94', //VintageFundingAdapterContract
            flags: 14
        },
        {
            id: '0x161fca6912f107b0f13c9c7275de7391b32d2ea1c52ffba65a3c961880a0c60f',
            addr: '0x15C67e4Ebf3145c53A763ff046bD1739F150a698', // vintageDistrubteAdapterContract
            flags: 22
        }
    ];

    const vintageDaoParams = [
        '20240130130',//name
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',//creator
        [
            '0x0f272c0872e3101Cae3F9A6fE6Fa0cC339d662E2',
            '0x0ad893d6992079df87e55a02918396f2a25f5821'
        ],// address[] daoFactoriesAddress;
        enableAdapters,
        adapters1,
        [true, 5],//vintageDaoParticipantCapInfo
        [
            1,
            "vintageDaoBackerMembershipInfo1",
            0,
            toBN("100000000000000000000"),
            '0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154',
            0,
            ['0x0000000000000000000000000000000000000000']
        ],//vintageDaoBackerMembershipInfo1
        [
            1,
            "vintageDaoRaiserMembershipInfo1",
            0,
            toBN("100000000000000000000"),
            '0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154',
            0,
            ['0x0000000000000000000000000000000000000000']
        ],//vintageDaoRaiserMembershipInfo1
        [
            3,
            '0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154',
            0,
            1,
            0,
            0,
            60,
            66,
            600,
            600
        ],//vintageDaoVotingInfo1
        [
            '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
            '0xBcd4042DE499D14e55001CcbB24a551F3b954096'
        ],//vintageDaoGenesisRaisers
        [100, 100, 100]//allocations
    ];

    // let tx = await summonDaoContract.summonVintageDao(vintageDaoParams, { gasLimit: 17000000, fee: 1000000000 });
    let tx = await summonDaoContract.summonVintageDao(vintageDaoParams);

    let result = await tx.wait();
    const daoAddr = result.events[result.events.length - 1].args;
    // this.NEW_DAO_ADDRESS = daoAddr;
    console.log(`
    new dao address ${daoAddr}
    `);
}

const createVintageFundRaiseProposal = async () => {
    const fundRaiseContract = await (await hre.ethers.getContractFactory("FundRaiseAdapterContract"))
        .attach("0x33bF903A9D0A0296c8d51064EC61050659d2862A");
    const votingContract = await (await hre.ethers.getContractFactory("GPVotingContract"))
        .attach("0x96A8681D4699bCd6bFF3C9C61DBeb6AAB642Ff7C");
    const fundingPoolAdaptContract = await (await hre.ethers.getContractFactory("FundingPoolAdapterContract"))
        .attach("0x691E412baeaC66C30C76b615DbeC288e7Ad1030E");
    const daoAddress = "0x9b3d08965c6c9bc4ff0a7ff4dd5af54f012d7ae2";
    console.log(`create fund raise proposal...`);
    const ProposalFundRaiseInfo = [
        hre.ethers.utils.parseEther("10000"), //uint256 fundRaiseTarget;
        hre.ethers.utils.parseEther("100000"), //uint256 fundRaiseMaxAmount;
        hre.ethers.utils.parseEther("1000"), // uint256 lpMinDepositAmount;
        hre.ethers.utils.parseEther("10000") // uint256 lpMaxDepositAmount;
    ]
    let currentblocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

    const ProposalTimeInfo = [
        currentblocktimestamp + 60 * 10, // uint256 fundRaiseStartTime;
        currentblocktimestamp + 60 * 20, // uint256 fundRaiseEndTime;
        60 * 20, // uint256 fundTerm;
        60 * 60, // uint256 redemptPeriod;
        60 * 10, // uint256 redemptDuration;
        60 * 10 // uint256 returnDuration;
    ]

    const ProposalFeeInfo = [
        2, // uint256 proposerRewardRatio;
        3, // uint256 managementFeeRatio;
        2 // uint256 redepmtFeeRatio;
    ]

    const ProposalAddressInfo = [
        "0x540881ECaF34C85EfB352727FC2F9858B19C4b08", // address managementFeeAddress;
        "0x0B133Cc91a191d8d83133690019375a362B3886D" // address fundRaiseTokenAddress;
    ]
    const funfRaiseProposalParams = [
        daoAddress,
        ProposalFundRaiseInfo,
        ProposalTimeInfo,
        ProposalFeeInfo,
        ProposalAddressInfo
    ];

    const tx = await fundRaiseContract.submitProposal(funfRaiseProposalParams);
    const result = await tx.wait();

    const newFundRaiseProposalId = result.events[result.events.length - 1].args.proposalId;
    console.log(`new Fund Raise ProposalId ${newFundRaiseProposalId}`);

}

const createVintageFundingProposal = async () => {
    const dao = (await hre.ethers.getContractFactory("DaoRegistry")).
        attach("0x9b3d08965c6c9bc4ff0a7ff4dd5af54f012d7ae2");
    const distributeFundContract = (await hre.ethers.getContractFactory("DistributeFundContractV2")).
        attach("0xeD550E8aB6Eca75FFcDb4E2D08db1672de2AAa50");
    const projectToken = (await hre.ethers.getContractFactory("TestToken2")).
        attach("0x4fca7dEf684C9eA41729D852F16014fc796b15Bb");
    // const vestingAdapter = this.vestingAdapter;
    // const fundingPoolAdaptContract = this.fundingpoolAdapter;
    // const votingContract = this.gpvoting;
    // const allocContract = this.allocationAdapter;

    // Submit distribute proposal
    const requestedFundAmount = hre.ethers.utils.parseEther("3000");
    const tradingOffTokenAmount = hre.ethers.utils.parseEther("5000");
    let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

    const vestingStartTime = blocktimestamp + 60 * 10;
    const vestingcliffDuration = 60 * 1;
    const stepDuration = 60 * 10;
    const steps = 3;
    const vestingCliffLockAmount = hre.ethers.utils.parseEther("1000");

    const projectTeamAddr = "0x540881ECaF34C85EfB352727FC2F9858B19C4b08";
    const projectTeamTokenAddr = "0x4fca7dEf684C9eA41729D852F16014fc796b15Bb";

    // await projectToken.transfer(this.project_team1.address, tradingOffTokenAmount);
    // await projectToken.approve(distributeFundContract.address, tradingOffTokenAmount);
    let [owner] = await hre.ethers.getSigners();
    const {
        proposalId
    } = await createDistributeFundsProposal(
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
        owner
    );
    console.log(`
    new vintage funding proposalId ${proposalId}
    `);
}

const summonFlexDaoParamsMumbai = (_daoName) => {

    const daoFactoriesAddress = [
        MUMBAI_CONTRACTS.DaoFactory,
        MUMBAI_CONTRACTS.FlexFundingPoolFactory
    ];
    // const _daoName = "Crypto Labs";
    const _creator = "0xDF9DFA21F47659cf742FE61030aCb0F15f659707";

    const enalbeAdapters = [{
        id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd', //FlexVesting
        addr: MUMBAI_CONTRACTS.FlexVesting,
        flags: 0
    },
    {
        id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35', //FlexERC721
        addr: MUMBAI_CONTRACTS.FlexERC721,
        flags: 0
    },
    {
        id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8', //FlexAllocationAdapterContract
        addr: MUMBAI_CONTRACTS.FlexAllocationAdapterContract,
        flags: 0
    },
    {
        id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c', //FlexFundingPoolAdapterContract
        addr: MUMBAI_CONTRACTS.FlexFundingPoolAdapterContract,
        flags: 0
    },
    {
        id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7', //FlexVotingContract
        addr: MUMBAI_CONTRACTS.FlexVotingContract,
        flags: 258
    },
    {
        id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610', //FlexPollingVotingContract
        addr: MUMBAI_CONTRACTS.FlexPollingVotingContract,
        flags: 258
    },
    {
        id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda', //FlexFundingAdapterContract
        addr: MUMBAI_CONTRACTS.FlexFundingAdapterContract,
        flags: 258
    },
    {
        id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
        addr: MUMBAI_CONTRACTS.BentoBoxV1,
        flags: 0
    },
    {
        id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511', //ManagingContract
        addr: MUMBAI_CONTRACTS.ManagingContract,
        flags: 59
    },
    {
        id: '0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753', //StewardMangement
        addr: MUMBAI_CONTRACTS.StewardManagementContract,
        flags: 194
    }
    ];

    const adapters1 = [{
        id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
        addr: MUMBAI_CONTRACTS.FlexFundingPoolAdapterContract, //FlexFundingPoolAdapterContract
        flags: 75
    },
    {
        id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
        addr: MUMBAI_CONTRACTS.FlexFundingAdapterContract, //FlexFundingAdapterContract
        flags: 26
    }
    ];

    const fundingPollEnable = true;

    const flexDaoParticipantCapInfo = [
        false, //bool enable;
        5 //uint256 maxParticipantsAmount;
    ];
    const flexDaoParticipantMembershipEnalbe = false;

    const flexDaoParticipantsMemberships = [
        "", // string name;
        0, // uint8 varifyType;
        "0", // uint256 minHolding;
        "0x0000000000000000000000000000000000000000", // address tokenAddress;
        0, // uint256 tokenId;
        ['0x0000000000000000000000000000000000000000'] //whiteList;

    ];

    const flexDaoPriorityDepositEnalbe = false;

    const flexDaoPriorityDepositMembershipInfo = {
        varifyType: 0, // uint8 varifyType;
        minHolding: 10000000000000, // uint256 minHolding;
        tokenAddress: "0x0000000000000000000000000000000000000000", // address tokenAddress;
        tokenId: 0, // uint256 tokenId;
        whiteList: [], // address[] whiteList;
        priorityPeriod: 0 // uint256 priorityPeriod;
    }

    const flexDaoStewardMembershipInfo = [
        1, // bool enable;
        3, // uint256 varifyType;
        "0", // uint256 minHolding;
        "0x0000000000000000000000000000000000000000", // address tokenAddress;
        0, // uint256 tokenId;
        [
            "0x540881ECaF34C85EfB352727FC2F9858B19C4b08",
            "0x9ab302974abd84c875343d6beea05309bede2f10"
        ] // address[] whiteList;
    ];

    const flexDaoVotingInfo = [
        60 * 10, // uint256 votingPeriod;
        0, // uint8 votingPower;
        60, // uint256 superMajority;
        66, // uint256 quorum;
        // 60 * 10    // uint256 proposalExecutePeriod;
    ];

    const flexDaoPollsterMembershipInfo = [
        3, // uint8 varifyType;
        10000000000000, // uint256 minHolding;
        "0x0000000000000000000000000000000000000000", // address tokenAddress;
        0, // uint256 tokenId;
        [
            '0x0309d2DC027e0843ab2bC72c69149ad1D746db55',
            "0x764e1631B166aB9c05e4bEF355A4AEB52B77f647",
            "0x04A0de3995B91fA6ab1c1037Bb0a6d1040dFDc61",
            "0x5E78937e2cB15c8d96FB66B575cdCBdf0Cfa7935"
        ] //address[] whiteList;

    ];

    const flexDaoPollingInfo = [
        60 * 10, // uint256 votingPeriod;
        0, // uint8 votingPower;
        1, // uint256 superMajority;
        1 // uint256 quorum;
    ];

    const flexDaoProposerMembershipInfo = [
        3, // uint8 varifyType;
        hre.ethers.utils.parseEther("100"), // uint256 minHolding;
        "0x0B133Cc91a191d8d83133690019375a362B3886D", // address tokenAddress;
        0, // uint256 tokenId;
        [
            '0x0309d2DC027e0843ab2bC72c69149ad1D746db55',
            "0x764e1631B166aB9c05e4bEF355A4AEB52B77f647",
            "0x04A0de3995B91fA6ab1c1037Bb0a6d1040dFDc61",
            "0x5E78937e2cB15c8d96FB66B575cdCBdf0Cfa7935"
        ] // address[] whiteList;
    ];
    // const flexDaoManagementfee = 2;
    const flexDaoManagementfee = hre.ethers.utils.parseEther("0.002"); // 0.2%

    const flexDaoGenesisStewards = [
        '0x0309d2DC027e0843ab2bC72c69149ad1D746db55',
        "0x764e1631B166aB9c05e4bEF355A4AEB52B77f647",
        "0x04A0de3995B91fA6ab1c1037Bb0a6d1040dFDc61",
        "0x5E78937e2cB15c8d96FB66B575cdCBdf0Cfa7935"
    ];


    const flexDaoInfo = {
        name: _daoName, // string name;
        creator: _creator, // address creator;
        flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
        managementFeeAddress: "0x0309d2DC027e0843ab2bC72c69149ad1D746db55",
        flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
        flexDaoFundriaseStyle: 0 // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
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

    return flexDaoParams;
}

const summonFlexDaoParamsGoerli = (_daoName) => {
    const daoFactoriesAddress = [
        GOERLI_CONTRACTS.DaoFactory,
        GOERLI_CONTRACTS.FlexFundingPoolFactory
    ];
    // const _daoName = "Crypto Labs";
    const _creator = "0xDF9DFA21F47659cf742FE61030aCb0F15f659707";

    const enalbeAdapters = [{
        id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd', //FlexVesting
        addr: GOERLI_CONTRACTS.FlexVesting,
        flags: 0
    },
    {
        id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35', //FlexERC721
        addr: GOERLI_CONTRACTS.FlexERC721,
        flags: 0
    },
    {
        id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8', //FlexAllocationAdapterContract
        addr: GOERLI_CONTRACTS.FlexAllocationAdapterContract,
        flags: 0
    },
    {
        id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c', //FlexFundingPoolAdapterContract
        addr: GOERLI_CONTRACTS.FlexFundingPoolAdapterContract,
        flags: 0
    },
    {
        id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7', //FlexVotingContract
        addr: GOERLI_CONTRACTS.FlexVotingContract,
        flags: 258
    },
    {
        id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610', //FlexPollingVotingContract
        addr: GOERLI_CONTRACTS.FlexPollingVotingContract,
        flags: 258
    },
    {
        id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda', //FlexFundingAdapterContract
        addr: GOERLI_CONTRACTS.FlexFundingAdapterContract,
        flags: 258
    },
    {
        id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
        addr: GOERLI_CONTRACTS.BentoBoxV1,
        flags: 0
    },
    {
        id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511', //ManagingContract
        addr: GOERLI_CONTRACTS.ManagingContract,
        flags: 59
    },
    {
        id: '0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753', //StewardMangement
        addr: GOERLI_CONTRACTS.StewardManagementContract,
        flags: 194
    }
    ];

    const adapters1 = [{
        id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
        addr: GOERLI_CONTRACTS.FlexFundingPoolAdapterContract, //FlexFundingPoolAdapterContract
        flags: 75
    },
    {
        id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
        addr: GOERLI_CONTRACTS.FlexFundingAdapterContract, //FlexFundingAdapterContract
        flags: 26
    }
    ];

    const fundingPollEnable = true;

    const flexDaoParticipantCapInfo = [
        false, //bool enable;
        5 //uint256 maxParticipantsAmount;
    ];
    const flexDaoParticipantMembershipEnalbe = false;

    const flexDaoParticipantsMemberships = [
        "", // string name;
        0, // uint8 varifyType;
        "0", // uint256 minHolding;
        "0x0000000000000000000000000000000000000000", // address tokenAddress;
        0, // uint256 tokenId;
        ['0x0000000000000000000000000000000000000000'] //whiteList;

    ];

    const flexDaoPriorityDepositEnalbe = false;

    const flexDaoPriorityDepositMembershipInfo = {
        varifyType: 0, // uint8 varifyType;
        minHolding: 10000000000000, // uint256 minHolding;
        tokenAddress: "0x0000000000000000000000000000000000000000", // address tokenAddress;
        tokenId: 0, // uint256 tokenId;
        whiteList: [], // address[] whiteList;
        priorityPeriod: 0 // uint256 priorityPeriod;
    }

    const flexDaoStewardMembershipInfo = [
        1, // bool enable;
        3, // uint256 varifyType;
        "0", // uint256 minHolding;
        "0x0000000000000000000000000000000000000000", // address tokenAddress;
        0, // uint256 tokenId;
        [
            "0x540881ECaF34C85EfB352727FC2F9858B19C4b08",
            "0x9ab302974abd84c875343d6beea05309bede2f10"
        ] // address[] whiteList;
    ];

    const flexDaoVotingInfo = [
        60 * 10, // uint256 votingPeriod;
        0, // uint8 votingPower;
        60, // uint256 superMajority;
        66, // uint256 quorum;
        // 60 * 10    // uint256 proposalExecutePeriod;
    ];

    const flexDaoPollsterMembershipInfo = [
        3, // uint8 varifyType;
        10000000000000, // uint256 minHolding;
        "0x0000000000000000000000000000000000000000", // address tokenAddress;
        0, // uint256 tokenId;
        [
            '0x0309d2DC027e0843ab2bC72c69149ad1D746db55',
            "0x764e1631B166aB9c05e4bEF355A4AEB52B77f647",
            "0x04A0de3995B91fA6ab1c1037Bb0a6d1040dFDc61",
            "0x5E78937e2cB15c8d96FB66B575cdCBdf0Cfa7935"
        ] //address[] whiteList;

    ];

    const flexDaoPollingInfo = [
        60 * 10, // uint256 votingPeriod;
        0, // uint8 votingPower;
        1, // uint256 superMajority;
        1 // uint256 quorum;
    ];

    const flexDaoProposerMembershipInfo = [
        3, // uint8 varifyType;
        hre.ethers.utils.parseEther("100"), // uint256 minHolding;
        "0x0B133Cc91a191d8d83133690019375a362B3886D", // address tokenAddress;
        0, // uint256 tokenId;
        [
            '0x0309d2DC027e0843ab2bC72c69149ad1D746db55',
            "0x764e1631B166aB9c05e4bEF355A4AEB52B77f647",
            "0x04A0de3995B91fA6ab1c1037Bb0a6d1040dFDc61",
            "0x5E78937e2cB15c8d96FB66B575cdCBdf0Cfa7935"
        ] // address[] whiteList;
    ];
    // const flexDaoManagementfee = 2;
    const flexDaoManagementfee = hre.ethers.utils.parseEther("0.002"); // 0.2%

    const flexDaoGenesisStewards = [
        '0x0309d2DC027e0843ab2bC72c69149ad1D746db55',
        "0x764e1631B166aB9c05e4bEF355A4AEB52B77f647",
        "0x04A0de3995B91fA6ab1c1037Bb0a6d1040dFDc61",
        "0x5E78937e2cB15c8d96FB66B575cdCBdf0Cfa7935"
    ];


    const flexDaoInfo = {
        name: _daoName, // string name;
        creator: _creator, // address creator;
        flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
        managementFeeAddress: "0x0309d2DC027e0843ab2bC72c69149ad1D746db55",
        flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
        flexDaoFundriaseStyle: 0 // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
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

    return flexDaoParams;
}

const summonFlexDao = async () => {
    const creator = '0xDF9DFA21F47659cf742FE61030aCb0F15f659707';
    const _daoName = '2024181414';
    const daoFactoriesAddress = [
        '0x0f272c0872e3101Cae3F9A6fE6Fa0cC339d662E2',//this.daoFactory.address,
        '0x5da1dfb5161E6eda9990873a15fC07b7f3A4724E'//this.flexFundingPoolFactory.address
    ];


    const enalbeAdapters = [{
        id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd', //FlexVesting
        addr: '0x3A3bCF67a82FF39816870695D16F5E822923D1c0',
        flags: 0
    },
    {
        id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35', //FlexERC721
        addr: '0xcd59d08df3eF6687F2a2072FFeA3A786b2189226',
        flags: 0
    },
    {
        id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8', //FlexAllocationAdapterContract
        addr: '0xC531b03A442A70a6031366C52827Cd33eD48A54c',
        flags: 0
    },
    {
        id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c', //FlexFundingPoolAdapterContract
        addr: '0x556ae3f9256474Ac77038C794cc2Eb50cB53bD4f',
        flags: 0
    },
    {
        id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7', //FlexVotingContract
        addr: '0x71cD9837113663787B0D9B9cc2b3f1BF5234d265',
        flags: 258
    },
    {
        id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610', //FlexPollingVotingContract
        addr: '0x25A0f7520a0175065b3980fcb5dE6E91BC587D34',
        flags: 258
    },
    {
        id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda', //FlexFundingAdapterContract
        addr: '0x750072024c7B797f02D142298f817B8139b7C4Bc',
        flags: 770
    },
    {
        id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
        addr: '0xb1b45A39DB8e8017d2C21c8773bD66e03f68A724',
        flags: 0
    },

    {
        id: '0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753', //StewardMangement
        addr: '0x26Fd44a7Ea24239b3Cafa555Ba43f5b21F3C498d',
        flags: 6338
    },
    {
        id: '0x37cbe06c1044f98864ea25736326bc1d488e24e5e23781ea2ad64c4069cb9e6e', //flexStewardAllocationAdapter
        addr: '0x174EE8093De4BB0B36b85505DE1955B9Bfd1B962',
        flags: 0
    },
    {
        id: '0x43f8439a5cef099d0d9a92b15a64e34ff49963bb29d65f63204eda6591b810a1', //flexFundingReturnTokenAdapter
        addr: '0xb64Df32CbaF9BF21474E771C0967bF9F3A63c747',
        flags: 0
    },
    {
        id: '0xeae11da953333a83b6467e2193334fb302549e1a42ad5797082aea1ab6be9120', //flexFreeInEscrowFundAdapterContract
        addr: '0x5969e80cDB7B688656544C2eD70d1C5A46c18031',
        flags: 0
    },
    {
        id: '0xc8e81510cbc5ec7970040e233b001587da1ea4484a9f7b8710d3322429c2df23', //flexFundingHelperAdapterContract
        addr: '0x1b3DF0fcd443379cBcbe6Ee38DcDB2D98f5825d8',
        flags: 0
    },
    {
        id: '0xe564b2da9fb62dadceed6d94ac5884ac5f464424e7be661d7d6181d49fa87b3f', //flexDaoSetAdapterContract
        addr: '0xb4B8d11EA007a8b85C36CADBF06F5320a32A3658',
        flags: 778242
    },
    {
        id: '0xff9379b98b93eb3bd1fac62fd2258a7955d70d2d5279c40064145b6c9646df37',
        addr: '0xF3Dcd3007B572335a3ab292CC500c53a8B5B51cc',//flexDaoSetHelperAdapterContract
        flags: 8
    },
    {
        id: '0x5f0e8d109045653360289a7a02d5dc2a99e382006a42ef93f66de55ecff3176f',
        addr: '0x55F9d34d50dea3689D9f7db4252c87E26559f233',//flexDaoSetPollingAdapterContract
        flags: 262146
    },
    {
        id: '0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7',
        addr: '0x215bE78F1E4d7021D7fAD83239c243cD01935978',//flexDaoSetVotingAdapterContract
        flags: 65538
    }

    ];
    const adapters1 = [{
        id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
        addr: '0x556ae3f9256474Ac77038C794cc2Eb50cB53bD4f', //FlexFundingPoolAdapterContract
        flags: 75
    },
    {
        id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
        addr: '0x750072024c7B797f02D142298f817B8139b7C4Bc', //FlexFundingAdapterContract
        flags: 26
    }
    ];

    const flexDaoParticipantCapInfo = [
        true, //bool enable;
        2 //uint256 maxParticipantsAmount;
    ]

    const flexDaoParticipantMembershipEnalbe = true;

    const flexDaoParticipantsMemberships = [
        0, // uint8 varifyType;
        hre.ethers.utils.parseEther("100"), // uint256 minHolding;
        '0xb894560E51dB39c906238b13E84b1822C1e0D604', // address tokenAddress;
        0, // uint256 tokenId;
        [] //whiteList;
    ];

    const flexDaoStewardMembershipInfo = [
        1, // bool enable;
        0, // uint256 varifyType;0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
        hre.ethers.utils.parseEther("100"), // uint256 minHolding;
        '0xb894560E51dB39c906238b13E84b1822C1e0D604', // address tokenAddress;
        0, // uint256 tokenId;
        [] // address[] whiteList;
    ];

    const flexDaoVotingInfo = [
        3, //eligibilityType 0. erc20 1.erc721 2.erc1155 3.allocation
        '0xb894560E51dB39c906238b13E84b1822C1e0D604', //tokenAddress
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
        hre.ethers.utils.parseEther("100"), // uint256 minHolding;
        '0xb894560E51dB39c906238b13E84b1822C1e0D604', // address tokenAddress;
        0, // uint256 tokenId;
        [] //address[] whiteList;
    ];

    const flexDaoPollingInfo = [
        60 * 10, // uint256 votingPeriod;
        0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
        2, // uint256 superMajority;
        2, // uint256 quorum;
        0, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
        '0xb894560E51dB39c906238b13E84b1822C1e0D604', //   address tokenAddress;
        0, //    uint256 tokenID;
        0, //  uint256 supportType; // 0. YES - NO > X
        0 //uint256 quorumType; // 0. YES + NO > X       
    ];

    const flexDaoProposerMembershipInfo = [
        true,
        3, // uint8 varifyType;
        0, // uint256 minHolding;
        ZERO_ADDRESS, // address tokenAddress;
        0, // uint256 tokenId;
        [
            '0x106987818651e996f0efc3EAd8B7c4cd11a5312B',
            '0x543A99263477E8e62DE6cd432bc44D3441799F31'
        ] // address[] whiteList;
    ];

    const flexDaoManagementfee = hre.ethers.utils.parseEther("0.001"); // 0.2%
    const returnTokenManagementFee = hre.ethers.utils.parseEther("0.0024");
    const flexDaoGenesisStewards = [];
    const allocations = [10, 20, 30];

    const fundingPollEnable = false; //DIRECT mode
    const flexDaoFundriaseStyle = 1 // 0 - FCFS 1- Free ink0

    const flexDaoInfo = {
        name: _daoName, // string name;
        creator: creator, // address creator;
        flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
        returnTokenManagementFee: returnTokenManagementFee,
        managementFeeAddress: '0x106987818651e996f0efc3EAd8B7c4cd11a5312B',
        flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
        allocations: allocations,
        flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
    }

    const flexDaoPriorityDepositEnalbe = true;

    const flexDaoPriorityDepositMembershipInfo = {
        varifyType: 0, // uint8 varifyType;
        minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
        tokenAddress: '0xb894560E51dB39c906238b13E84b1822C1e0D604', // address tokenAddress;
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
    console.log(flexDaoParams);

    const summonFlexDaoCont = (await hre.ethers.getContractFactory("SummonDao")).attach('0x4CFB3D11BcC29D3367E8107E844664DF52E5809B');
    let tx = await summonFlexDaoCont.summonFlexDao(flexDaoParams);
    let result = await tx.wait();
    const daoAddr = await daoFactoryContract.getDaoAddress(flexDaoParams[flexDaoParams.length - 1].name);
    console.log('daoAddr: ', daoAddr);
}

const flexDaoParticipantDepositWhitelist = async () => {
    let daoAddr = "0xf680B96E88fE0eeA1C797f59a4Ce0bFA647E5112";
    const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);
    const flexFundingPoolAdaptAddress = await daoContract.getAdapterAddress(sha3("flex-funding-pool-adatper"));
    console.log(`
    flexFundingPoolAdaptAddress $${flexFundingPoolAdaptAddress}
    `);
    const flexFundingPoolAdapterContract = (await hre.ethers.getContractFactory("FlexFundingPoolAdapterContract")).attach(flexFundingPoolAdaptAddress);

    const result = await flexFundingPoolAdapterContract.isParticipantWhiteList(daoAddr, "participantmembershipInfo01", "0x540881ECaF34C85EfB352727FC2F9858B19C4b08")
    console.log(`
    whitelist: ${result}
    `);
}

const flexDaoPriorityDepositWhitelist = async () => {
    let daoAddr = "0xf680B96E88fE0eeA1C797f59a4Ce0bFA647E5112";
    const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);
    const flexFundingPoolAdaptAddress = await daoContract.getAdapterAddress(sha3("flex-funding-pool-adatper"));
    console.log(`
    flexFundingPoolAdaptAddress ${flexFundingPoolAdaptAddress}
    `);
    const flexFundingPoolAdapterContract = (await hre.ethers.getContractFactory("FlexFundingPoolAdapterContract")).attach(flexFundingPoolAdaptAddress);

    const result = await flexFundingPoolAdapterContract.isPriorityDepositWhitelist(daoAddr, "0x540881ECaF34C85EfB352727FC2F9858B19C4b08")
    console.log(`
    whitelist: ${result}
    `);
}

const flexDaoProposerWhitelist = async () => {

    let daoAddr = "0xf680B96E88fE0eeA1C797f59a4Ce0bFA647E5112";
    const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);
    const flexFundingAdaptAddress = await daoContract.getAdapterAddress(sha3("flex-funding"));
    console.log(`
    flexFundingAdaptAddress ${flexFundingAdaptAddress}
    `);
    const flexFundingAdapterContract = (await hre.ethers.getContractFactory("FlexFundingAdapterContract")).attach(flexFundingAdaptAddress);

    const result = await flexFundingAdapterContract.isProposerWhiteList(daoAddr, "0x540881ECaF34C85EfB352727FC2F9858B19C4b08")
    console.log(`
    whitelist: ${result}
    `);
}

const flexFundingProposalParams_MUMBAI = async () => {
    // this.testtoken1 = await(await hre.ethers.getContractFactory("TestToken1"))
    //     .attach(MUMBAI_CONTRACTS.TestToken1);
    // this.testtoken2 = await(await hre.ethers.getContractFactory("TestToken2"))
    //     .attach(MUMBAI_CONTRACTS.TestToken2);
    let tokenAddress = MUMBAI_CONTRACTS.TestToken1;
    let minFundingAmount = hre.ethers.utils.parseEther("10000");
    let maxFundingAmount = hre.ethers.utils.parseEther("10000000");
    let escrow = true;
    let returnTokenAddr = MUMBAI_CONTRACTS.TestToken2;
    let returnTokenAmount = hre.ethers.utils.parseEther("1000000");
    let price = hre.ethers.utils.parseEther("0.6");
    let minReturnAmount = toBN(minFundingAmount).div(toBN(price)).mul(toBN(hre.ethers.utils.parseEther("1")));
    let maxReturnAmount = toBN(maxFundingAmount).div(toBN(price)).mul(toBN(hre.ethers.utils.parseEther("1")));
    let approverAddr = "0xDF9DFA21F47659cf742FE61030aCb0F15f659707";
    let recipientAddr = "0xDF9DFA21F47659cf742FE61030aCb0F15f659707";

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

    let fundRaiseStartTime = blocktimestamp;
    let fundRaiseEndTime = fundRaiseStartTime + 60 * 20;

    let vestingStartTime = fundRaiseEndTime + 60 * 60 * 1;
    let vestingCliffEndTime = vestingStartTime + 60 * 60 * 1;
    let vestingEndTime = vestingCliffEndTime + 60 * 60 * 2 + 60;
    let vestingInterval = 60 * 60 * 1;
    let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%

    let vestInfo = [
        vestingStartTime,
        vestingCliffEndTime,
        vestingEndTime,
        vestingInterval,
        vestingCliffLockAmount
    ];

    let fundRaiseType = 1;

    let minDepositAmount = hre.ethers.utils.parseEther("1000");
    let maxDepositAmount = hre.ethers.utils.parseEther("10000");
    let backerIdentification = false;

    let bType = 0;
    let bChainId = 1;
    let bTokanAddr = "0x4fca7dEf684C9eA41729D852F16014fc796b15Bb";
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
    let pTokenAddr = "0x4fca7dEf684C9eA41729D852F16014fc796b15Bb";
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

    let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
    let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
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

    return fundingParams;
}

const flexFundingProposalParams_Goerli = async () => {
    // this.testtoken1 = await(await hre.ethers.getContractFactory("TestToken1"))
    //     .attach(GOERLI_CONTRACTS.TestToken1);
    // this.testtoken2 = await(await hre.ethers.getContractFactory("TestToken2"))
    //     .attach(GOERLI_CONTRACTS.TestToken2);
    let tokenAddress = GOERLI_CONTRACTS.TestToken1;
    let minFundingAmount = hre.ethers.utils.parseEther("10000");
    let maxFundingAmount = hre.ethers.utils.parseEther("10000000");
    let escrow = true;
    let returnTokenAddr = GOERLI_CONTRACTS.TestToken2;
    let returnTokenAmount = hre.ethers.utils.parseEther("1000000");
    let price = hre.ethers.utils.parseEther("0.6");
    let minReturnAmount = toBN(minFundingAmount).div(toBN(price)).mul(toBN(hre.ethers.utils.parseEther("1")));
    let maxReturnAmount = toBN(maxFundingAmount).div(toBN(price)).mul(toBN(hre.ethers.utils.parseEther("1")));
    // let minReturnAmount = hre.ethers.utils.parseEther("1000000");
    // let maxReturnAmount = hre.ethers.utils.parseEther("1000000");
    let approverAddr = "0xDF9DFA21F47659cf742FE61030aCb0F15f659707";
    let recipientAddr = "0xDF9DFA21F47659cf742FE61030aCb0F15f659707";

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

    let fundRaiseStartTime = blocktimestamp;
    let fundRaiseEndTime = fundRaiseStartTime + 60 * 60 * 1;

    let vestingStartTime = fundRaiseEndTime + 60 * 60 * 1;
    let vestingCliffEndTime = vestingStartTime + 60 * 60 * 1;
    let vestingEndTime = vestingCliffEndTime + 60 * 60 * 2 + 60;
    let vestingInterval = 60 * 60 * 1;
    let vestingCliffLockAmount = hre.ethers.utils.parseEther("0.1"); // 10%

    let vestInfo = [
        vestingStartTime,
        vestingCliffEndTime,
        vestingEndTime,
        vestingInterval,
        vestingCliffLockAmount
    ];

    let fundRaiseType = 1;

    let minDepositAmount = hre.ethers.utils.parseEther("1000");
    let maxDepositAmount = hre.ethers.utils.parseEther("10000");
    let backerIdentification = false;

    let bType = 0;
    let bChainId = 1;
    let bTokanAddr = "0x4fca7dEf684C9eA41729D852F16014fc796b15Bb";
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
    let pTokenAddr = "0x4fca7dEf684C9eA41729D852F16014fc796b15Bb";
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

    let tokenRewardAmount = hre.ethers.utils.parseEther("0.02"); // 2%
    let cashRewardAmount = hre.ethers.utils.parseEther("0.003"); // 0.3%
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

    return fundingParams;
}


const createFlexFundingProposal = async (daoAddr) => {
    const flexFundingAdapterContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach("0x4979a4748EF5ac5d78BE730B06e1eCd9a3617db2");;
    const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

    let tokenAddress = "0xb894560E51dB39c906238b13E84b1822C1e0D604";
    let minFundingAmount = hre.ethers.utils.parseEther("1000");
    let maxFundingAmount = hre.ethers.utils.parseEther("10000");
    let escrow = true;
    let returnTokenAddr = "0xdA844FFE2E922c9B3E6076c308411f748A29a6d1";
    let returnTokenAmount = hre.ethers.utils.parseEther("10000000");
    let price = hre.ethers.utils.parseEther("0.6");
    let minReturnAmount = hre.ethers.utils.parseEther("100");
    let maxReturnAmount = hre.ethers.utils.parseEther("1000");
    let approverAddr = "0xdf9dfa21f47659cf742fe61030acb0f15f659707";
    let recipientAddr = "0xdf9dfa21f47659cf742fe61030acb0f15f659707";

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
    let fundRaiseEndTime = fundRaiseStartTime + 60 * 10;
    let minDepositAmount = hre.ethers.utils.parseEther("100");
    let maxDepositAmount = hre.ethers.utils.parseEther("1000");
    let backerIdentification = false;

    let bType = 0;
    let bChainId = 1;
    let bTokanAddr = tokenAddress;
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
    let pTokenAddr = tokenAddress;
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


    const priorityWhitelist = [ZERO_ADDRESS];

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
    const tx = await flexFundingAdapterContract.
        submitProposal(daoAddr, fundingParams);
    const result = await tx.wait();

    console.log("created...");
    // const proposalId = result.events[result.events.length - 1].args.proposalId;
    // console.log("proposalId ", proposalId);
}

const processFundingProposal = async (daoAddr, proposalId) => {
    const [account1, account2, account3, account4, account5] = await hre.ethers.getSigners();

    if (hre.network.name == "mumbai") {
        const testReturnToken = (await hre.ethers.getContractFactory("TestToken2"))
            .attach(MUMBAI_CONTRACTS.TestToken1);
        const flexFundingContract = await (await hre.ethers.getContractFactory("FlexFundingAdapterContract"))
            .attach(MUMBAI_CONTRACTS.FlexFundingAdapterContract);

        const proposalInfo = await flexFundingContract.Proposals(daoAddr, proposalId);
        const maxReturnAmount = proposalInfo.fundingInfo.maxReturnAmount;
        let tx = await testReturnToken.connect(account1).
            approve(MUMBAI_CONTRACTS.FlexFundingAdapterContract, maxReturnAmount);
        await tx.wait();
        const tx1 = await flexFundingContract.connect(account1).processProposal(daoAddr, proposalId);
        const result1 = await tx1.wait();
        console.log("processed...");
    } else if (hre.network.name == "goerli") {
        const flexFundingContract = await (await hre.ethers.getContractFactory("FlexFundingAdapterContract"))
            .attach(GOERLI_CONTRACTS.FlexFundingAdapterContract);
        const tx1 = await flexFundingContract.connect(account1).processProposal(daoAddr, proposalId);
        const result1 = await tx1.wait();
        console.log("processed...");
    } else { }
}

const deploy = async () => {
    const [
        account1, account2, account3, account4, account5
    ] = await hre.ethers.getSigners();
    const bal = hre.ethers.utils.formatEther((await account1.getBalance()).toString());
    const bal2 = hre.ethers.utils.formatEther((await account2.getBalance()).toString());
    const bal3 = hre.ethers.utils.formatEther((await account3.getBalance()).toString());
    const bal4 = hre.ethers.utils.formatEther((await account4.getBalance()).toString());
    const bal5 = hre.ethers.utils.formatEther((await account5.getBalance()).toString());
    console.log("ETH balance: ", bal);
    console.log("ETH balance: ", bal2);
    console.log("ETH balance: ", bal3);
    console.log("ETH balance: ", bal4);
    console.log("ETH balance: ", bal5);


    // const DaoRegistry = await hre.ethers.getContractFactory("DaoRegistry");
    // const daoRegistry = await DaoRegistry.deploy();
    // await daoRegistry.deployed();
    // console.log("daoRegistry deployed address:", daoRegistry.address);

    // const DaoFactory = await hre.ethers.getContractFactory("DaoFactory");
    // const daoFactory = await DaoFactory.deploy(daoRegistry.address);
    // await daoFactory.deployed();
    // console.log("daoFactory deployed address:", daoFactory.address);

    // const FlexFreeInEscrowFundAdapterContract = await hre.ethers.getContractFactory("FlexFreeInEscrowFundAdapterContract");
    // const flexFreeInEscrowFundAdapterContract = await FlexFreeInEscrowFundAdapterContract.deploy();
    // await flexFreeInEscrowFundAdapterContract.deployed();
    // console.log("flexFreeInEscrowFundAdapterContract deployed address:", flexFreeInEscrowFundAdapterContract.address);

    // const FlexFundingHelperAdapterContract = await hre.ethers.getContractFactory("FlexFundingHelperAdapterContract");
    // const flexFundingHelperAdapterContract = await FlexFundingHelperAdapterContract.deploy();
    // await flexFundingHelperAdapterContract.deployed();
    // console.log("flexFundingHelperAdapterContract deployed address:", flexFundingHelperAdapterContract.address);

    // const FlexFundingAdapterContract = await hre.ethers.getContractFactory("FlexFundingAdapterContract");
    // const flexFundingAdapterContract = await FlexFundingAdapterContract.deploy();
    // await flexFundingAdapterContract.deployed();
    // console.log("flexFundingAdapterContract deployed address:", flexFundingAdapterContract.address);

    // const FlexInvestmentPoolAdapterContract = await hre.ethers.getContractFactory("FlexInvestmentPoolAdapterContract");
    // const flexInvestmentPoolAdapterContract = await FlexInvestmentPoolAdapterContract.deploy();
    // await flexInvestmentPoolAdapterContract.deployed();
    // console.log("flexInvestmentPoolAdapterContract deployed address:", flexInvestmentPoolAdapterContract.address);

    // const FlexPollingVotingContract = await hre.ethers.getContractFactory("FlexPollingVotingContract");
    // const flexPollingVotingContract = await FlexPollingVotingContract.deploy();
    // await flexPollingVotingContract.deployed();
    // console.log("flexPollingVotingContract deployed address:", flexPollingVotingContract.address);


    // const FlexVotingContract = await hre.ethers.getContractFactory("FlexVotingContract");
    // const flexVotingContract = await FlexVotingContract.deploy();
    // await flexVotingContract.deployed();
    // console.log("flexVotingContract deployed address:", flexVotingContract.address);

    // const FlexVesting = await hre.ethers.getContractFactory("FlexVesting");
    // const flexVesting = await FlexVesting.deploy();
    // await flexVesting.deployed();
    // console.log("flexVesting deployed address:", flexVesting.address);


    // const StewardManagementContract = await hre.ethers.getContractFactory("StewardManagementContract");
    // const stewardManagementContract = await StewardManagementContract.deploy();
    // await stewardManagementContract.deployed();
    // console.log("stewardManagementContract deployed address:", stewardManagementContract.address);


    // const FlexAllocationAdapterContract = await hre.ethers.getContractFactory("FlexAllocationAdapterContract");
    // const flexAllocationAdapterContract = await FlexAllocationAdapterContract.deploy();
    // await flexAllocationAdapterContract.deployed();
    // console.log("flexAllocationAdapterContract deployed address:", flexAllocationAdapterContract.address);

    // const FlexStewardAllocationAdapter = await hre.ethers.getContractFactory("FlexStewardAllocationAdapter");
    // const flexStewardAllocationAdapter = await FlexStewardAllocationAdapter.deploy();
    // await flexStewardAllocationAdapter.deployed();
    // console.log("flexStewardAllocationAdapter deployed address:", flexStewardAllocationAdapter.address);

    // const FlexInvestmentPaybackTokenAdapterContract = await hre.ethers.getContractFactory("FlexInvestmentPaybackTokenAdapterContract");
    // const flexInvestmentPaybackTokenAdapterContract = await FlexInvestmentPaybackTokenAdapterContract.deploy();
    // await flexInvestmentPaybackTokenAdapterContract.deployed();
    // console.log("flexInvestmentPaybackTokenAdapterContract deployed address:", flexInvestmentPaybackTokenAdapterContract.address);

    // const FlexInvestmentPoolExtension = await hre.ethers.getContractFactory("FlexInvestmentPoolExtension");
    // const flexInvestmentPoolExtension = await FlexInvestmentPoolExtension.deploy();
    // await flexInvestmentPoolExtension.deployed();
    // console.log("flexInvestmentPoolExtension deployed address:", flexInvestmentPoolExtension.address);

    // const FlexFundingPoolFactory = await hre.ethers.getContractFactory("FlexFundingPoolFactory");
    // const flexFundingPoolFactory = await FlexFundingPoolFactory.deploy(flexInvestmentPoolExtension.address);
    // await flexFundingPoolFactory.deployed();
    // console.log("flexFundingPoolFactory deployed address:", flexFundingPoolFactory.address);

    // const FlexVestingERC721 = await hre.ethers.getContractFactory("FlexVestingERC721");
    // const flexVestingERC721 = await FlexVestingERC721.deploy("DAOSquare Flex Vesting", "DFV", "0x00942F10AFF9481F593bD2ec17e021Ca050Efc86");
    // await flexVestingERC721.deployed();
    // console.log("flexVestingERC721 deployed address:", flexVestingERC721.address);

    // const FlexDaoSetAdapterContract = await hre.ethers.getContractFactory("FlexDaoSetAdapterContract");
    // const flexDaoSetAdapterContract = await FlexDaoSetAdapterContract.deploy();
    // await flexDaoSetAdapterContract.deployed();
    // console.log("flexDaoSetAdapterContract deployed address:", flexDaoSetAdapterContract.address);

    // const FlexDaoSetHelperAdapterContract = await hre.ethers.getContractFactory("FlexDaoSetHelperAdapterContract");
    // const flexDaoSetHelperAdapterContract = await FlexDaoSetHelperAdapterContract.deploy();
    // await flexDaoSetHelperAdapterContract.deployed();
    // console.log("flexDaoSetHelperAdapterContract deployed address:", flexDaoSetHelperAdapterContract.address);

    // const FlexDaoSetPollingAdapterContract = await hre.ethers.getContractFactory("FlexDaoSetPollingAdapterContract");
    // const flexDaoSetPollingAdapterContract = await FlexDaoSetPollingAdapterContract.deploy();
    // await flexDaoSetPollingAdapterContract.deployed();
    // console.log("flexDaoSetPollingAdapterContract deployed address:", flexDaoSetPollingAdapterContract.address);

    // const FlexDaoSetVotingAdapterContract = await hre.ethers.getContractFactory("FlexDaoSetVotingAdapterContract");
    // const flexDaoSetVotingAdapterContract = await FlexDaoSetVotingAdapterContract.deploy();
    // await flexDaoSetVotingAdapterContract.deployed();
    // console.log("flexDaoSetVotingAdapterContract deployed address:", flexDaoSetVotingAdapterContract.address);

    // const SummonDao = await hre.ethers.getContractFactory("SummonDao");
    // const summonDao = await SummonDao.deploy();
    // await summonDao.deployed();
    // console.log("summonDao deployed address:", summonDao.address);

    // const TestToken1 = await hre.ethers.getContractFactory("TestToken1");
    // const testToken1 = await TestToken1.deploy(100000000);
    // await testToken1.deployed();
    // console.log("testToken1 deployed address:", testToken1.address);

    // const TestToken2 = await hre.ethers.getContractFactory("TestToken2");
    // const testToken2 = await TestToken2.deploy(100000000);
    // await testToken2.deployed();
    // console.log("testToken2 deployed address:", testToken2.address);

    // const BentoBoxV1 = await hre.ethers.getContractFactory("BentoBoxV1");
    // const bentoBoxV1 = await BentoBoxV1.deploy();
    // await bentoBoxV1.deployed();
    // console.log("bentoBoxV1 deployed address:", bentoBoxV1.address);

    // const VintageFundRaiseAdapterContract = await hre.ethers.getContractFactory("VintageFundRaiseAdapterContract");
    // const vintageFundRaiseAdapterContract = await VintageFundRaiseAdapterContract.deploy();
    // await vintageFundRaiseAdapterContract.deployed();
    // console.log("vintageFundRaiseAdapterContract deployed address:", vintageFundRaiseAdapterContract.address);

    // const VintageVotingContract = await hre.ethers.getContractFactory("VintageVotingContract");
    // const vintageVotingContract = await VintageVotingContract.deploy();
    // await vintageVotingContract.deployed();
    // console.log("vintageVotingContract deployed address:", vintageVotingContract.address);


    // const VintageFundingPoolAdapterContract = await hre.ethers.getContractFactory("VintageFundingPoolAdapterContract");
    // const vintageFundingPoolAdapterContract = await VintageFundingPoolAdapterContract.deploy();
    // await vintageFundingPoolAdapterContract.deployed();
    // console.log("vintageFundingPoolAdapterContract deployed address:", vintageFundingPoolAdapterContract.address);


    // const VintageRaiserManagementContract = await hre.ethers.getContractFactory("VintageRaiserManagementContract");
    // const vintageRaiserManagementContract = await VintageRaiserManagementContract.deploy();
    // await vintageRaiserManagementContract.deployed();
    // console.log("vintageRaiserManagementContract deployed address:", vintageRaiserManagementContract.address);

    // const InvestmentLibrary = await hre.ethers.getContractFactory("InvestmentLibrary");
    // const investmentLibrary = await InvestmentLibrary.deploy();
    // await investmentLibrary.deployed();
    // console.log("investmentLibrary deployed address:", investmentLibrary.address);

    // const VintageFundingAdapterContract = await hre.ethers.getContractFactory("VintageFundingAdapterContract", {
    //     libraries: {
    //         InvestmentLibrary: investmentLibrary.address,
    //     }
    // });
    // const vintageFundingAdapterContract = await VintageFundingAdapterContract.deploy();
    // await vintageFundingAdapterContract.deployed();
    // console.log("vintageFundingAdapterContract deployed address:", vintageFundingAdapterContract.address);

    // const VintageVestingERC721 = await hre.ethers.getContractFactory("VintageVestingERC721");
    // const vintageVestingERC721 = await VintageVestingERC721.deploy("DAOSquare Vintage Vesting", "DVV", "0x8651A8eaD88b3D225E4bF23D4F3dD61FAee058B5");
    // await vintageVestingERC721.deployed();
    // console.log("vintageVestingERC721 deployed address:", vintageVestingERC721.address);


    // const VintageAllocationAdapterContract = await hre.ethers.getContractFactory("VintageAllocationAdapterContract");
    // const vintageAllocationAdapterContract = await VintageAllocationAdapterContract.deploy();
    // await vintageAllocationAdapterContract.deployed();
    // console.log("vintageAllocationAdapterContract deployed address:", vintageAllocationAdapterContract.address);

    // const VintageVesting = await hre.ethers.getContractFactory("VintageVesting");
    // const vintageVesting = await VintageVesting.deploy();
    // await vintageVesting.deployed();
    // console.log("vintageVesting deployed address:", vintageVesting.address);

    // const VintageFundingPoolExtension = await hre.ethers.getContractFactory("VintageFundingPoolExtension");
    // const vintageFundingPoolExtension = await VintageFundingPoolExtension.deploy();
    // await vintageFundingPoolExtension.deployed();
    // console.log("vintageFundingPoolExtension deployed address:", vintageFundingPoolExtension.address);

    // const VintageFundingPoolFactory = await hre.ethers.getContractFactory("VintageFundingPoolFactory");
    // const vintageFundingPoolFactory = await VintageFundingPoolFactory.deploy(vintageFundingPoolExtension.address);
    // await vintageFundingPoolFactory.deployed();
    // console.log("vintageFundingPoolFactory deployed address:", vintageFundingPoolFactory.address);



    // const SummonVintageDao = await hre.ethers.getContractFactory("SummonVintageDao");
    // const summonVintageDao = await SummonVintageDao.deploy();
    // await summonVintageDao.deployed();
    // console.log("summonVintageDao deployed address:", summonVintageDao.address);

    // const VintageEscrowFundAdapterContract = await hre.ethers.getContractFactory("VintageEscrowFundAdapterContract");
    // const vintageEscrowFundAdapterContract = await VintageEscrowFundAdapterContract.deploy();
    // await vintageEscrowFundAdapterContract.deployed();
    // console.log("vintageEscrowFundAdapterContract deployed address:", vintageEscrowFundAdapterContract.address);

    // const VintageDistributeAdatperContract = await hre.ethers.getContractFactory("VintageDistributeAdatperContract");
    // const vintageDistributeAdatperContract = await VintageDistributeAdatperContract.deploy();
    // await vintageDistributeAdatperContract.deployed();
    // console.log("vintageDistributeAdatperContract deployed address:", vintageDistributeAdatperContract.address);

    // const VintageRaiserAllocationAdapter = await hre.ethers.getContractFactory("VintageRaiserAllocationAdapter");
    // const vintageRaiserAllocationAdapter = await VintageRaiserAllocationAdapter.deploy();
    // await vintageRaiserAllocationAdapter.deployed();
    // console.log("vintageRaiserAllocationAdapter deployed address:", vintageRaiserAllocationAdapter.address);

    // const VintageInvestmentPaybackTokenAdapterContract = await hre.ethers.getContractFactory("VintageInvestmentPaybackTokenAdapterContract");
    // const vintageInvestmentPaybackTokenAdapterContract = await VintageInvestmentPaybackTokenAdapterContract.deploy();
    // await vintageInvestmentPaybackTokenAdapterContract.deployed();
    // console.log("vintageInvestmentPaybackTokenAdapterContract deployed address:", vintageInvestmentPaybackTokenAdapterContract.address);

    // const VintageFreeInEscrowFundAdapterContract = await hre.ethers.getContractFactory("VintageFreeInEscrowFundAdapterContract");
    // const vintageFreeInEscrowFundAdapterContract = await VintageFreeInEscrowFundAdapterContract.deploy();
    // await vintageFreeInEscrowFundAdapterContract.deployed();
    // console.log("vintageFreeInEscrowFundAdapterContract deployed address:", vintageFreeInEscrowFundAdapterContract.address);

    // const VintageFundingPoolAdapterHelperContract = await hre.ethers.getContractFactory("VintageFundingPoolAdapterHelperContract");
    // const vintageFundingPoolAdapterHelperContract = await VintageFundingPoolAdapterHelperContract.deploy();
    // await vintageFundingPoolAdapterHelperContract.deployed();
    // console.log("vintageFundingPoolAdapterHelperContract deployed address:", vintageFundingPoolAdapterHelperContract.address);

    // const VintageDaoSetAdapterContract = await hre.ethers.getContractFactory("VintageDaoSetAdapterContract");
    // const vintageDaoSetAdapterContract = await VintageDaoSetAdapterContract.deploy();
    // await vintageDaoSetAdapterContract.deployed();
    // console.log("vintageDaoSetAdapterContract deployed address:", vintageDaoSetAdapterContract.address);

    // const VintageDaoSetHelperAdapterContract = await hre.ethers.getContractFactory("VintageDaoSetHelperAdapterContract");
    // const vintageDaoSetHelperAdapterContract = await VintageDaoSetHelperAdapterContract.deploy();
    // await vintageDaoSetHelperAdapterContract.deployed();
    // console.log("vintageDaoSetHelperAdapterContract deployed address:", vintageDaoSetHelperAdapterContract.address);

    // const ColletiveGovernorManagementContract = await hre.ethers.getContractFactory("ColletiveGovernorManagementAdapterContract");
    // const colletiveGovernorManagementContract = await ColletiveGovernorManagementContract.deploy();
    // await colletiveGovernorManagementContract.deployed();
    // console.log("colletiveGovernorManagementContract deployed address:", colletiveGovernorManagementContract.address);

    // const ColletiveDaoSetProposalAdapterContract = await hre.ethers.getContractFactory("ColletiveDaoSetProposalAdapterContract");
    // const colletiveDaoSetProposalContract = await ColletiveDaoSetProposalAdapterContract.deploy();
    // await colletiveDaoSetProposalContract.deployed();
    // console.log("colletiveDaoSetProposalContract deployed address:", colletiveDaoSetProposalContract.address);

    // const ColletiveFundingProposalAdapterContract = await hre.ethers.getContractFactory("ColletiveFundingProposalAdapterContract");
    // const colletiveFundingProposalAdapterContract = await ColletiveFundingProposalAdapterContract.deploy();
    // await colletiveFundingProposalAdapterContract.deployed();
    // console.log("colletiveFundingProposalAdapterContract deployed address:", colletiveFundingProposalAdapterContract.address);

    // const CollectiveVotingAdapterContract = await hre.ethers.getContractFactory("CollectiveVotingAdapterContract");
    // const collectiveVotingContract = await CollectiveVotingAdapterContract.deploy();
    // await collectiveVotingContract.deployed();
    // console.log("collectiveVotingContract deployed address:", collectiveVotingContract.address);

    // const ColletiveFundingPoolAdapterContract = await hre.ethers.getContractFactory("ColletiveFundingPoolAdapterContract");
    // const colletiveFundingPoolContract = await ColletiveFundingPoolAdapterContract.deploy();
    // await colletiveFundingPoolContract.deployed();
    // console.log("colletiveFundingPoolContract deployed address:", colletiveFundingPoolContract.address);

    // const ColletiveFundRaiseProposalAdapterContract = await hre.ethers.getContractFactory("ColletiveFundRaiseProposalAdapterContract");
    // const colletiveFundRaiseProposalContract = await ColletiveFundRaiseProposalAdapterContract.deploy();
    // await colletiveFundRaiseProposalContract.deployed();
    // console.log("colletiveFundRaiseProposalContract deployed address:", colletiveFundRaiseProposalContract.address);

    // const BentoBoxV1 = await hre.ethers.getContractFactory("BentoBoxV1");
    // const bentoBoxV1 = await BentoBoxV1.deploy();
    // await bentoBoxV1.deployed();
    // console.log("bentoBoxV1 deployed address:", bentoBoxV1.address);

    // const CollectivePaybackTokenAdapterContract = await hre.ethers.getContractFactory("CollectivePaybackTokenAdapterContract");
    // const collectivePaybackTokenAdapterContract = await CollectivePaybackTokenAdapterContract.deploy();
    // await collectivePaybackTokenAdapterContract.deployed();
    // console.log("collectivePaybackTokenAdapterContract deployed address:", collectivePaybackTokenAdapterContract.address);

    // const CollectiveAllocationAdapterContract = await hre.ethers.getContractFactory("CollectiveAllocationAdapterContract");
    // const collectiveAllocationAdapterContract = await CollectiveAllocationAdapterContract.deploy();
    // await collectiveAllocationAdapterContract.deployed();
    // console.log("collectiveAllocationAdapterContract deployed address:", collectiveAllocationAdapterContract.address);

    // const CollectiveDistributeAdatperContract = await hre.ethers.getContractFactory("CollectiveDistributeAdatperContract");
    // const collectiveDistributeAdatperContract = await CollectiveDistributeAdatperContract.deploy();
    // await collectiveDistributeAdatperContract.deployed();
    // console.log("collectiveDistributeAdatperContract deployed address:", collectiveDistributeAdatperContract.address);

    // const CollectiveVestingAdapterContract = await hre.ethers.getContractFactory("CollectiveVestingAdapterContract");
    // const collectiveVestingContract = await CollectiveVestingAdapterContract.deploy();
    // await collectiveVestingContract.deployed();
    // console.log("collectiveVestingContract deployed address:", collectiveVestingContract.address);

    // const CollectiveEscrowFundAdapterContract = await hre.ethers.getContractFactory("CollectiveEscrowFundAdapterContract");
    // const collectiveEscrowFundAdapterContract = await CollectiveEscrowFundAdapterContract.deploy();
    // await collectiveEscrowFundAdapterContract.deployed();
    // console.log("collectiveEscrowFundAdapterContract deployed address:", collectiveEscrowFundAdapterContract.address);

    // const ColletiveTopUpProposalAdapterContract = await hre.ethers.getContractFactory("ColletiveTopUpProposalAdapterContract");
    // const colletiveTopUpProposalContract = await ColletiveTopUpProposalAdapterContract.deploy();
    // await colletiveTopUpProposalContract.deployed();
    // console.log("colletiveTopUpProposalContract deployed address:", colletiveTopUpProposalContract.address);

    // const ColletiveExpenseProposalAdapterContract = await hre.ethers.getContractFactory("ColletiveExpenseProposalAdapterContract");
    // const colletiveExpenseProposalContract = await ColletiveExpenseProposalAdapterContract.deploy();
    // await colletiveExpenseProposalContract.deployed();
    // console.log("colletiveExpenseProposalContract deployed address:", colletiveExpenseProposalContract.address);


    // const SummonCollectiveDao = await hre.ethers.getContractFactory("SummonCollectiveDao");
    // const summonCollectiveDao = await SummonCollectiveDao.deploy();
    // await summonCollectiveDao.deployed();
    // console.log("summonCollectiveDao deployed address:", summonCollectiveDao.address);

    const CollectiveInvestmentPoolExtension = await hre.ethers.getContractFactory("CollectiveInvestmentPoolExtension");
    const collectiveInvestmentPoolExtension = await CollectiveInvestmentPoolExtension.deploy();
    await collectiveInvestmentPoolExtension.deployed();
    console.log("collectiveInvestmentPoolExtension deployed address:", collectiveInvestmentPoolExtension.address);

    const CollectiveFundingPoolFactory = await hre.ethers.getContractFactory("CollectiveFundingPoolFactory");
    const collectiveFundingPoolFactory = await CollectiveFundingPoolFactory.deploy(collectiveInvestmentPoolExtension.address);
    await collectiveFundingPoolFactory.deployed();
    console.log("collectiveFundingPoolFactory deployed address:", collectiveFundingPoolFactory.address);
}


const getDaoInfo = async (daoAddr) => {
    const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);
    const flexFundingPoolExtAddress = await daoContract.getExtensionAddress(sha3("flex-funding-pool-ext")); //flex-funding-pool-ext
    console.log(`
    flex-funding-pool-ext address ${flexFundingPoolExtAddress}
    `);
}

const checkStewardWhitelist = async (account) => {
    const stewardManagementContract = (await hre.ethers.getContractFactory("StewardManagementContract")).
        attach("0x6B93AAD680B156D68F90aC62e61058728f071716");
    const rel = await stewardManagementContract.
        isStewardWhiteList("0xcfd0a2a42f02a9161f2ae06d527dccabf8e3c3c0", "0x540881ECaF34C85EfB352727FC2F9858B19C4b08");
    console.log(rel);
}

const submitStewardInProposal = async (daoAddr, account) => {
    const stewardManagementContract = (await hre.ethers.getContractFactory("StewardManagementContract")).attach("0x8906fE795D8e07a60F9962382550Cc8365eBA24d");
    await stewardManagementContract.submitSteWardInProposal(daoAddr, account);
}

const submitStewardOutProposal = async (daoAddr, account) => {
    const stewardManagementContract = (await hre.ethers.getContractFactory("StewardManagementContract")).attach("0x8906fE795D8e07a60F9962382550Cc8365eBA24d");
    const tx = await stewardManagementContract.submitSteWardOutProposal(daoAddr, account);
    await tx.wait();
}

const processStewardProposal = async (daoAddress, proposalId) => {
    const stewardManagementContract = (await hre.ethers.getContractFactory("StewardManagementContract")).attach("0x8906fE795D8e07a60F9962382550Cc8365eBA24d");
    const tx = await stewardManagementContract.processProposal(daoAddress, proposalId);
    const result = await tx.wait();
    console.log("processed...");
}

const voteForStewarProposal = async (daoAddr, proposalId, value) => {
    const [account1, account2, account3, account4, account5] = await hre.ethers.getSigners();
    const flexVotingContract = (await hre.ethers.getContractFactory("FlexVotingContract")).attach("0x2BA88e7a66524F2395BcB65f0b3c0D8A9A6B5eA8");
    let tx = await flexVotingContract.connect(account1).submitVote(daoAddr, proposalId, value);
    await tx.wait();
    console.log("account1 voted...");
    // tx = await flexVotingContract.connect(account2).submitVote(daoAddr, proposalId, value);
    // await tx.wait();
    // console.log("account2 voted...");

    // tx = await flexVotingContract.connect(account3).submitVote(daoAddr, proposalId, value);
    // await tx.wait();
    // console.log("account3 voted...");

    tx = await flexVotingContract.connect(account4).submitVote(daoAddr, proposalId, value);
    await tx.wait();
    console.log("account4 voted...");

    tx = await flexVotingContract.connect(account5).submitVote(daoAddr, proposalId, value);
    await tx.wait();
    console.log("account5 voted...");

}


const voteForFundingProposal = async (daoAddr, proposalId, value) => {
    const [account1, account2, account3, account4, account5] = await hre.ethers.getSigners();
    const daoInstance = (await hre.ethers.getContractFactory("DaoRegistry")).
        attach(daoAddr);
    const flexPollVotingContractAddress = await daoInstance.
        getAdapterAddress("0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610");
    const flexPollingVotingContract = (await hre.ethers.getContractFactory("FlexPollingVotingContract")).
        attach(flexPollVotingContractAddress);
    let tx;
    // tx = await flexPollingVotingContract.connect(account1).submitVote(daoAddr, proposalId, value);
    // await tx.wait();
    // console.log("account1 voted...");
    tx = await flexPollingVotingContract.connect(account2).submitVote(daoAddr, proposalId, value);
    await tx.wait();
    console.log("account2 voted...");

    tx = await flexPollingVotingContract.connect(account3).submitVote(daoAddr, proposalId, value);
    await tx.wait();
    console.log("account3 voted...");

    tx = await flexPollingVotingContract.connect(account4).submitVote(daoAddr, proposalId, value);
    await tx.wait();
    console.log("account4 voted...");

    tx = await flexPollingVotingContract.connect(account5).submitVote(daoAddr, proposalId, value);
    await tx.wait();
    console.log("account5 voted...");

}

const createVesting = async (daoAddr, proposalId) => {
    const [account1, account2, account3, account4, account5] = await hre.ethers.getSigners();
    let tx;
    const flexVestingContract = (await hre.ethers.getContractFactory("FlexVesting")).
        attach(GOERLI_CONTRACTS.FlexVesting);
    tx = await flexVestingContract.createVesting(daoAddr, account3.address, proposalId);
    await tx.wait();
    console.log("vesting created...");

}



const stewardQuit = async (daoAddr) => {
    const [account1, account2, account3, account4, account5] = await hre.ethers.getSigners();
    const stewardManagementContract = (await hre.ethers.getContractFactory("StewardManagementContract")).attach("0x8906fE795D8e07a60F9962382550Cc8365eBA24d");
    const tx = await stewardManagementContract.connect(account3).quit(daoAddr);
    await tx.wait();
    console.log("quited...");
}


const getVoteResult = async (daoAddr, proposalId) => {
    const flexVotingContract = (await hre.ethers.getContractFactory("FlexVotingContract")).attach("0x2BA88e7a66524F2395BcB65f0b3c0D8A9A6B5eA8");
    const voteRel = await flexVotingContract.voteResult(daoAddr, proposalId);
    console.log("vote result: ", voteRel);
    return voteRel;
}

const getvintageFundingReturnTokenApprovedAmount = async (daoAddr, proposalId, account, token) => {
    const vintageFundingReturnTokenAdapterContract = (await hre.ethers.getContractFactory("VintageFundingReturnTokenAdapterContract")).
        attach("0xf20D567d860825De0F61695e98F37d389D89b165");
    const rel = await vintageFundingReturnTokenAdapterContract.approvedInfos(daoAddr, proposalId, account, token);
    console.log("approved amount ", rel);

}

const getVintageEscorwFundAmount = async () => {
    const VintageEscrowFundAdapterContract = (await hre.ethers.getContractFactory("VintageEscrowFundAdapterContract")).
        attach("0x278F18A79Cb84f5557C58F536Ce4A59e36970A4f");
    const escrowedAmount = await VintageEscrowFundAdapterContract.getEscrowAmount("0xc120a86460cc29c107af8b005f4e69ff06a4dc22",
        1,
        "0x9ac9c636404c8d46d9eb966d7179983ba5a3941a"
    );
    const erc20 = (await hre.ethers.getContractAt("openzeppelin-solidity-2.3.0/contracts/token/ERC20/IERC20.sol:IERC20",
        "0xEc00bE6Efae15428C3Badbe1a8dD068744098D5c"));
    const escrowContractBal = await erc20.balanceOf("0x278F18A79Cb84f5557C58F536Ce4A59e36970A4f");
    console.log(`
    escrowedAmount  ${hre.ethers.utils.formatEther(escrowedAmount[1])}
    escrowContractBal  ${hre.ethers.utils.formatEther(escrowContractBal)}
    `);
}



const fetchBathETHBalance = async () => {
    const fs = require('node:fs');
    const readline = require('node:readline');
    const fileStream = fs.createReadStream('D:\\new1221.txt');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.

    for await (const line of rl) {
        // Each line in input.txt will be successively available here as `line`.
        let t = line;
        let i = t.indexOf('"');
        let j = t.lastIndexOf('"');

        t = t.substring(i + 1, j);
        console.log(t);
        console.log(`Line from file: ${line}`);

        let acc = new hre.ethers.Wallet(t, hre.ethers.provider);
        let bal = hre.ethers.utils.formatEther((await acc.getBalance()).toString());
        // console.log(`bal : ${bal}`);
        if (parseFloat(bal) > parseFloat("1.0")) {
            console.log(bal);
        }
    }
}


const isVintageRedemptPeriod = async () => {
    const vintageFundingPoolAdapterContract = (await hre.ethers.getContractFactory("VintageFundingPoolAdapterContract")).
        attach("0x6F0643bc2Fc62103f24DF49876d35Fab5FfE7208");

    const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).
        attach("0x60408e7a5f578261a492a70115502d5160f18cb5");
    const isRedemptPeriod = await vintageFundingPoolAdapterContract.ifInRedemptionPeriod("0x60408e7a5f578261a492a70115502d5160f18cb5", 1699936876);
    const fundRaiseState = await vintageFundingPoolAdapterContract.daoFundRaisingStates("0x60408e7a5f578261a492a70115502d5160f18cb5");
    const managementFee = await daoContract.getConfiguration("0x6f5ff8cd0c079fce916efdce457af51f719825bd5f50c63a2fe9b019a67939b8");
    console.log(isRedemptPeriod);
    console.log(fundRaiseState);
    console.log(managementFee.toString());
}

const getVintageSetApproveAmount = async () => {
    const vintageFundingPoolAdapterContract = (await hre.ethers.getContractFactory("VintageFundingReturnTokenAdapterContract")).
        attach("0x7dd8e41164C2eEAC7E2BdAbb53ed10816e240f6C");

    const approvedAmount = await vintageFundingPoolAdapterContract.approvedInfos(
        "0x66b66c9945959f527c627b51505ca53ecb443046",
        "0x505ca53ecb44304646756e64696e672331000000000000000000000000000000",
        "0x9ac9c636404c8d46d9eb966d7179983ba5a3941a",
        "0x47ac6a76383661f64a880f6eab189f9a7e327b59"
    );

    console.log(`
    approvedAmount    ${hre.ethers.utils.formatEther(approvedAmount)}
    `);

}

const getFlexVestingInfo = async () => {
    const flexAllocationAdapterContract = (await hre.ethers.getContractFactory("FlexAllocationAdapterContract")).
        attach("0x8D0d0f3FDC281Ab1172406015F7306E15f1930e2");

    const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).
        attach("0x4eB43d54e2a93B32De7Fe491f005244a11CFb847");


    const managementFee = await daoContract.getConfiguration("0xea659d8e1a730b10af1cecb4f8ee391adf80e75302d6aaeb9642dc8a4a5e5dbb");
    const managementFeeAddress = await daoContract.getAddressConfiguration("0x8987d08c67963e4cacd5e5936c122a968c66853d58299dd822c1942227109839");
    const shares = await flexAllocationAdapterContract.vestingInfos("0x4eB43d54e2a93B32De7Fe491f005244a11CFb847",
        "0xf005244a11cfb84746756e64696e672332000000000000000000000000000000",
        managementFeeAddress);
    console.log(`
    managementFee ${managementFee}
    managementFeeAddress ${managementFeeAddress}
    shares ${shares[0]}
    created ${shares[1]}
    `);
}


const ifFlexVestingElegible = async () => {
    const flexAllocationAdapterContract = (await hre.ethers.getContractFactory("FlexAllocationAdapterContract")).
        attach("0x8D0d0f3FDC281Ab1172406015F7306E15f1930e2");

    const rel = await flexAllocationAdapterContract.ifEligible("0x4eb43d54e2a93b32de7fe491f005244a11cfb847",
        "0xf005244a11cfb84746756e64696e672332000000000000000000000000000000", "0xd9f04ec9a0ac241edc631cb0b44f11d17cd13bbe");

    console.log(rel);
}

const createFlexVesting = async () => {
    const flexVesting = (await hre.ethers.getContractFactory("FlexVesting")).
        attach("0x00942F10AFF9481F593bD2ec17e021Ca050Efc86");

    const tx = await flexVesting.createVesting("0x4eb43d54e2a93b32de7fe491f005244a11cfb847",
        "0xd9f04ec9a0ac241edc631cb0b44f11d17cd13bbe",
        "0xf005244a11cfb84746756e64696e672332000000000000000000000000000000");
    const rel = await tx.wait();
    console.log("vestId ", rel.events[result.events.length - 1].args.vestId);
}

const summonFlexDao1 = async () => {
    const _daoName = "202309281406";
    const testtoken1Addr = "0xb894560E51dB39c906238b13E84b1822C1e0D604";
    const creator = "0xDF9DFA21F47659cf742FE61030aCb0F15f659707";

    const daoFactoriesAddress = [
        '0x6833c48C079492cD05B07af51D1A3C994b792603', //daoFactoriesAddress
        '0xA4c563d99aE97A56E54104d1de161FB7f8AB278a' //flexFundingPoolFactoryAddress
    ];
    const enalbeAdapters = [{
        id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd', //FlexVesting
        addr: '0x75365D2eCCc87939411A7a45c54A2fA70234565F',
        flags: 0
    },
    {
        id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35', //FlexERC721
        addr: '0xcd59d08df3eF6687F2a2072FFeA3A786b2189226',
        flags: 0
    },
    {
        id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8', //FlexAllocationAdapterContract
        addr: '0x8D0d0f3FDC281Ab1172406015F7306E15f1930e2',
        flags: 0
    },
    {
        id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c', //FlexFundingPoolAdapterContract
        addr: '0xa1A4e79431717dFef26F91D518BAD33F60c46C39',
        flags: 0
    },
    {
        id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7', //FlexVotingContract
        addr: '0xe8228E826f5f59Baef67bB42f2996ad1B7E16EA2',
        flags: 258
    },
    {
        id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610', //FlexPollingVotingContract
        addr: '0x819d88Bf08d54A06962FD1E153F4B05baBCeBC5f',
        flags: 258
    },
    {
        id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda', //FlexFundingAdapterContract
        addr: '0x4979a4748EF5ac5d78BE730B06e1eCd9a3617db2',
        flags: 770
    },
    {
        id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
        addr: '0x8c3827Fd47320940ed234f45C53344c970AEB4F1',
        flags: 0
    },
    {
        id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511', //ManagingContract
        addr: '0x352B3E3426D4A6662655BBFab6CE84F36cC0e9bd',
        flags: 59
    },
    {
        id: '0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753', //StewardMangement
        addr: '0xa2C4bF6934e2bCc9913253Ff6749365cD35e6816',
        flags: 2242
    },
    {
        id: '0x37cbe06c1044f98864ea25736326bc1d488e24e5e23781ea2ad64c4069cb9e6e', //flexStewardAllocationAdapter
        addr: '0xbF15Ce7b531B8CD6881644334E708c7b18a447D9',
        flags: 0
    },
    {
        id: '0x43f8439a5cef099d0d9a92b15a64e34ff49963bb29d65f63204eda6591b810a1', //flexFundingReturnTokenAdapter
        addr: '0x8dE1e6Ddec9Bf5f04CBdAb7225821a0A84280e09',
        flags: 0
    },
    {
        id: '0xeae11da953333a83b6467e2193334fb302549e1a42ad5797082aea1ab6be9120', //flexFreeInEscrowFundAdapterContract
        addr: '0x90d04E839A15015e4db72BACBe787902383B74ae',
        flags: 0
    },
    {
        id: '0xc8e81510cbc5ec7970040e233b001587da1ea4484a9f7b8710d3322429c2df23', //flexFundingHelperAdapterContract
        addr: '0xDFbDb30CcE5ACff605949bd1CBcCE389309264E5',
        flags: 0
    }
    ];

    const adapters1 = [{
        id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
        addr: '0xa1A4e79431717dFef26F91D518BAD33F60c46C39', //FlexFundingPoolAdapterContract
        flags: 75
    },
    {
        id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
        addr: '0x4979a4748EF5ac5d78BE730B06e1eCd9a3617db2', //FlexFundingAdapterContract
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
        "participantmembershipInfo01", // string name;
        0, // uint8 varifyType;
        hre.ethers.utils.parseEther("100"), // uint256 minHolding;
        testtoken1Addr, // address tokenAddress;
        0, // uint256 tokenId;
        [ZERO_ADDRESS] //whiteList;
    ];

    const flexDaoStewardMembershipInfo = [
        1, // bool enable;
        0, // uint256 varifyType;0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
        hre.ethers.utils.parseEther("100"), // uint256 minHolding;
        testtoken1Addr, // address tokenAddress;
        0, // uint256 tokenId;
        [ZERO_ADDRESS] // address[] whiteList;
    ];

    const flexDaoVotingInfo = [
        3, //eligibilityType 0. erc20 1.erc721 2.erc1155 3.allocation
        testtoken1Addr, //tokenAddress
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
        hre.ethers.utils.parseEther("100"), // uint256 minHolding;
        testtoken1Addr, // address tokenAddress;
        0, // uint256 tokenId;
        [ZERO_ADDRESS] //address[] whiteList;
    ];

    const flexDaoPollingInfo = [
        60 * 10, // uint256 votingPeriod;
        0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
        2, // uint256 superMajority;
        2, // uint256 quorum;
        0, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
        testtoken1Addr, //   address tokenAddress;
        0, //    uint256 tokenID;
        0, //  uint256 supportType; // 0. YES - NO > X
        0 //uint256 quorumType; // 0. YES + NO > X       
    ];

    const flexDaoProposerMembershipInfo = [
        false,
        3, // uint8 varifyType;
        0, // uint256 minHolding;
        ZERO_ADDRESS, // address tokenAddress;
        0, // uint256 tokenId;
        [] // address[] whiteList;
    ];

    const flexDaoManagementfee = hre.ethers.utils.parseEther("0.001"); // 0.2%
    const returnTokenManagementFee = hre.ethers.utils.parseEther("0.0024");
    const flexDaoGenesisStewards = [];
    const allocations = [10, 20, 30];

    const fundingPollEnable = false; //DIRECT mode
    const flexDaoFundriaseStyle = 1 // 0 - FCFS 1- Free ink0

    const managementFeeAddr = "0x0309d2DC027e0843ab2bC72c69149ad1D746db55";
    const flexDaoInfo = {
        name: _daoName, // string name;
        creator: creator, // address creator;
        flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
        returnTokenManagementFee: returnTokenManagementFee,
        managementFeeAddress: managementFeeAddr,
        flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
        allocations: allocations,
        flexDaoFundriaseStyle: flexDaoFundriaseStyle // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
    }

    const flexDaoPriorityDepositEnalbe = true;

    const flexDaoPriorityDepositMembershipInfo = {
        varifyType: 0, // uint8 varifyType;
        minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
        tokenAddress: testtoken1Addr, // address tokenAddress;
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

    const summonDaoContract = await (await hre.ethers.getContractFactory("SummonDao"))
        .attach("0xe3771a9b4fa019f37ac1E098339B0151F047D983");
    const daoFactoryContract = await (await hre.ethers.getContractFactory("DaoFactory"))
        .attach("0x6833c48C079492cD05B07af51D1A3C994b792603");
    await sommonFlexDao(summonDaoContract, daoFactoryContract, flexDaoParams);


}

const sommonFlexDao = async (summonDaoContract, daoFactoryContract, flexDaoParams) => {
    let tx = await summonDaoContract.summonFlexDao(flexDaoParams);
    let result = await tx.wait();
    const daoAddr = await daoFactoryContract.getDaoAddress(flexDaoParams[flexDaoParams.length - 1].name);
    const daoName = await daoFactoryContract.daos(daoAddr);
    console.log("daoAddr ", daoAddr);
    return {
        daoAddr: daoAddr,
        daoName: daoName
    };
};

const getFlexPollingVotingWeight = async () => {
    const flexPollingVotingContract = (await hre.ethers.getContractFactory("FlexPollingVotingContract")).
        attach("0x819d88Bf08d54A06962FD1E153F4B05baBCeBC5f");

    const voteWeight = await flexPollingVotingContract.getVotingWeight(
        "0x97b3cdd51c2f4cda1ed165d3f134dc86f38f5711",
        "0xDF9DFA21F47659cf742FE61030aCb0F15f659707");
    console.log(voteWeight);
}

const getFlexFundingProposalInfo = async () => {
    const flexFundingAdapterContract = (await hre.ethers.getContractFactory("FlexFundingAdapterContract"))
        .attach("0x61aF1deD43DF38DbCAd71734309F57c16135247a");;

    const proposal = await flexFundingAdapterContract.Proposals("0x54Be3efea03A5F539675E24E74A771b291C367ff",
        "0x74a771b291c367ff496e766573746d656e742334000000000000000000000000");


    console.log(proposal);
    // console.log(`
    // state ${proposal}
    // `);
}

const getFlexInvestors = async () => {
    const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach("0xfae7352ad55bb6b3096b4cc3c8b36104187d21c0");;
    const flexFundingPoolExtAddr = await dao.getExtensionAddress("0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c")
    const flexFundingPoolExt = (await hre.ethers.getContractFactory("FlexFundingPoolExtension")).attach(flexFundingPoolExtAddr);

    const investors = await flexFundingPoolExt.getInvestorsByProposalId("0xc8b36104187d21c046756e64696e672331000000000000000000000000000000");
    console.log(investors);
}


const getVintageNewFundProposalInfo = async () => {
    const vintageFundRaiseContract = (await hre.ethers.getContractFactory("VintageFundRaiseAdapterContract")).attach("0x33bF903A9D0A0296c8d51064EC61050659d2862A");;
    const proposalInfo = await vintageFundRaiseContract.Proposals("0xb665094f76872f196c7bb2e6e574322d57b2f1f2",
        "0xE574322D57B2F1F24E657746756E642331000000000000000000000000000000");

    console.log(
        `
        acceptTokenAddr ${proposalInfo[0]}
        fundRaiseTarget ${proposalInfo.amountInfo.fundRaiseTarget}
        fundRaiseMaxAmount ${proposalInfo.amountInfo.fundRaiseMaxAmount}
        lpMinDepositAmount ${proposalInfo.amountInfo.lpMinDepositAmount}
        lpMaxDepositAmount ${proposalInfo.amountInfo.lpMaxDepositAmount}

        fundRaiseStartTime ${proposalInfo.timesInfo.fundRaiseStartTime}
        fundRaiseEndTime ${proposalInfo.timesInfo.fundRaiseEndTime}
        fundTerm ${proposalInfo.timesInfo.fundTerm}
        redemptPeriod ${proposalInfo.timesInfo.redemptPeriod}
        redemptDuration ${proposalInfo.timesInfo.redemptDuration}
        returnDuration ${proposalInfo.timesInfo.returnDuration}

        managementFeeRatio ${proposalInfo.feeInfo.managementFeeRatio}
        returnTokenManagementFeeRatio ${proposalInfo.feeInfo.returnTokenManagementFeeRatio}
        redepmtFeeRatio ${proposalInfo.feeInfo.redepmtFeeRatio}
        protocolFeeRatio ${proposalInfo.feeInfo.protocolFeeRatio}
        managementFeeAddress ${proposalInfo.feeInfo.managementFeeAddress}

        fundFromInverstor ${proposalInfo.proposerReward.fundFromInverstor}
        projectTokenFromInvestor ${proposalInfo.proposerReward.projectTokenFromInvestor}

        state ${proposalInfo.state}

        creationTime ${proposalInfo.creationTime}
        stopVoteTime ${proposalInfo.stopVoteTime}

        `
    );
}

const submitVintageDaosetProposal = async () => {
    const vintageDaoSetAdapterContract = (await hre.ethers.getContractFactory("VintageDaoSetAdapterContract")).attach("0x83C09Fc577FfF2f5D0De1dd2C27cA04949747b5C");;

    const tx = await vintageDaoSetAdapterContract.
        submitParticipantCapProposal(
            "0x92d3f5b6726a42f4a5f56d7e1e172e0350a6540d",
            true,
            10
        );

    const result = await tx.wait();

    const newDaosetProposalId = result.events[result.events.length - 1].args.proposalId;
    console.log(`new daoset ProposalId ${newDaosetProposalId}`);
}

const getVintageDaosetProposal = async () => {
    const dao = "0xd4303fd87aa21cb6f5ba0a5d410343b18449f929";
    const proposalId = "0x410343b18449f929496e766573746f722d4d656d626572736869702331000000";
    const vintageDaoSetAdapterContract = (await hre.ethers.getContractFactory("VintageDaoSetAdapterContract")).attach("0x6670cd0857B6CD3381DAc490DB1205b4823061dC");;
    const proposal = await vintageDaoSetAdapterContract.investorMembershipProposals(
        dao,
        proposalId
    );

    console.log(proposal);
}

const getVintageGovernorAllocation = async () => {
    const vintageDaoSetAdapterContract = (await hre.ethers.getContractFactory("VintageRaiserAllocationAdapter")).attach("0x8be919827A25ed95072e7364161206e458D034D3");;

}

const getFlexAllGovernor = async () => {
    const stewardManagementContract = (await hre.ethers.getContractFactory("StewardManagementContract")).attach("0xa04013491650f8777af094379A884F4327C99554");;
    const governors = await stewardManagementContract.getAllSteward("0xde9486e6a30cab42972b5bf561c00139ed138012");
    console.log(governors);
}


const getFlexDaosetVotingProposalInfo = async () => {
    const flexDaoSetVotingAdapterContract = (await hre.ethers.
        getContractFactory("FlexDaoSetVotingAdapterContract")).attach("0x29c54c97e894ffaf5773c57A9a49108FAC34802f");;
    const proposal = await flexDaoSetVotingAdapterContract.votingProposals(
        "0xc21ba671b7b97ab7dFAd8Ea46b5E493De5e67355",
        "0x6b5e493de5e67355566f74696e67202331000000000000000000000000000000"
    );

    console.log(proposal);
}


const getVintageEscrowTokenInfo = async () => {
    const vintageInvestmentPaybackTokenAdapterContract = (await hre.ethers.
        getContractFactory("VintageInvestmentPaybackTokenAdapterContract")).attach("0x6e1Dd516Df25DF3FedD4a796757D7E3d626F9626");
    const approvedAmount = await vintageInvestmentPaybackTokenAdapterContract.approvedInfos(
        "0x2ad7541f64f06d7d54f7c4f70bdb3d7322737935",
        "0x0bdb3d7322737935496e766573746d656e742332000000000000000000000000",
        "0x06bc456535ec14669c1b116d339226faba08b429",
        "0x11b1cec8d386d4e2ff4bc178775d98ba3e7247ba"
    );

    console.log(`
        approvedAmount ${approvedAmount}
        `);
}

const getVintageVestAmount = async () => {
    const VintageAllocationAdapterContract = (await hre.ethers.
        getContractFactory("VintageAllocationAdapterContract")).attach("0x030E8331c46191aBF02120dfd1717d5009d31f11");

    const vestAmount = await VintageAllocationAdapterContract.vestingInfos(
        "0x807d3f5f0cbae3daa5282348f9b3591ab74be2a2",
        "0xf9b3591ab74be2a2496e766573746d656e742331000000000000000000000000",
        "0xefc7e20104239d1e59291c49b0604fe8a6cba2ff")
    console.log(`
    vestAmount ${hre.ethers.utils.formatEther(vestAmount[0])}
    `);
}

const getDaoNameByDaoAddress = async () => {
    const daoFactory = (await hre.ethers.
        getContractFactory("DaoFactory")).attach("0x83AFB5D6551aEbaD11030021e2fa5fD8A78FC7Fa");
    const name = await daoFactory.daos("0x240a08ed3639f7109cbd9ec689a8f76546497e8a")
    console.log(name);
}

const getDaoConfig = async () => {
    const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach("0xe7e2cb8d29cc2a438a532c8c62769ca7d510de96");;

    const fundingType = await daoContract.getConfiguration("0x6e9fd67c3f2ca4e2b4e4b45b33b985dc3a1bffcadea24d12440a5901f72217b5");
    const tokenId = await daoContract.getConfiguration("0xf2b332c307ef460e99eb866928b78eca9f8af0da0626b4b48a13f9b52842fa6a");
    const type = await daoContract.getConfiguration("0x249486eeae30287051f65673dfa390711fd4587950c33b4150a633763f869724");
    const tokenAddress = await daoContract.getAddressConfiguration("0x770ef80745dba2953f780c8b963701e76fd3ac982923200f9214126e80f5f032");
    const miniHoldingAmount = await daoContract.getConfiguration("0x6839e94cab6f83f7a12a5a3d1d6f3bbcaf0185a49b20b86e6f47b8c78494ac3d");

    const FLEX_MANAGEMENT_FEE_AMOUNT = await daoContract.getConfiguration("0x64c49ee5084f4940c312104c41603e43791b03dad28152afd6eadb5b960a8a87");

    const managementFee = await daoContract.getConfiguration("0x64c49ee5084f4940c312104c41603e43791b03dad28152afd6eadb5b960a8a87");
    const FLEX_MANAGEMENT_FEE_TYPE = await daoContract.getConfiguration("0xda34ff95e06cbf2c9c32a559cd8aadd1a10104596417d62c03db2c1258df83d3");
    const FUND_END_TIME = await daoContract.getConfiguration("0x9ce69cf04065e3c7823cc5540c0598d8a694bd7a9a5a2a786d8bccf14ed6e2ea")
    const PROPOSAL_EXECUTE_DURATION = await daoContract.getConfiguration("0x02a3530cbb6e7c084516c86f68bd62c3e3fcd783c6c5d7e138616207f7a32250")
    const VOTING_PERIOD = await daoContract.getConfiguration("0x9876c0f0505bfb2b1c38d3bbd25ba13159172cd0868972d76927723f5a9480fc")
    const QUORUM = await daoContract.getConfiguration("0x0324de13a5a6e302ddb95a9fdf81cc736fc8acee2abe558970daac27395904e7")
    const SUPPORT = await daoContract.getConfiguration("0xb4c601c38beae7eebb719eda3438f59fcbfd4c6dd7d38c00665b6fd5b432df32")

    console.log(`
    QUORUM   ${QUORUM}
    SUPPORT  ${SUPPORT}
    `);

    console.log("FLEX_MANAGEMENT_FEE_TYPE: ", FLEX_MANAGEMENT_FEE_TYPE);
    console.log("managementFee:", hre.ethers.utils.formatEther(managementFee));
    console.log(`
    FUND_END_TIME ${FUND_END_TIME}
    PROPOSAL_EXECUTE_DURATION ${PROPOSAL_EXECUTE_DURATION}
    VOTING_PERIOD ${VOTING_PERIOD}
    `);

    console.log(fundingType);
    console.log(tokenId);
    console.log(type);
    console.log(tokenAddress);
    console.log(miniHoldingAmount);
    console.log(FLEX_MANAGEMENT_FEE_TYPE);
    console.log(FLEX_MANAGEMENT_FEE_AMOUNT);
}
const getVintageManagementFee = async () => {
    const daoContrct = (await hre.ethers.
        getContractFactory("DaoRegistry")).attach("0x807d3f5f0cbae3daa5282348f9b3591ab74be2a2");
    const vintageAllocContrct = (await hre.ethers.
        getContractFactory("VintageAllocationAdapterContract")).attach("0x030E8331c46191aBF02120dfd1717d5009d31f11");
    const managementFeeAddr = await daoContrct.getAddressConfiguration("0x5460409b9aa4688f80c10b29c3d7ad16025f050f472a6882a45fa7bb9bd12fb1");
    const amount = await vintageAllocContrct.vestingInfos("0x807d3f5f0cbae3daa5282348f9b3591ab74be2a2",
        "0xf9b3591ab74be2a2496e766573746d656e742331000000000000000000000000",
        managementFeeAddr);

    console.log(`
     ${managementFeeAddr} amount :${hre.ethers.utils.formatEther(amount[0].toString())}
    `);
}

const getAdapterAddress = async () => {
    const daoContrct = (await hre.ethers.
        getContractFactory("DaoRegistry")).attach("0x7ab04203d1586247966c1ec223e2ac63a889dee8");


    const FlexVesting = await daoContrct.getAdapterAddress("0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd");
    const FlexERC721 = await daoContrct.getAdapterAddress("0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35");
    const FlexAllocationAdapterContract = await daoContrct.getAdapterAddress("0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8");
    const FlexFundingPoolAdapterContract = await daoContrct.getAdapterAddress("0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c");
    const FlexVotingContract = await daoContrct.getAdapterAddress("0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7");
    const FlexPollingVotingContract = await daoContrct.getAdapterAddress("0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610");
    const FlexFundingAdapterContract = await daoContrct.getAdapterAddress("0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda");
    const bentoBoxV1 = await daoContrct.getAdapterAddress("0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a");
    const ManagingContract = await daoContrct.getAdapterAddress("0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511");
    const StewardMangement = await daoContrct.getAdapterAddress("0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753");
    const flexStewardAllocationAdapter = await daoContrct.getAdapterAddress("0x37cbe06c1044f98864ea25736326bc1d488e24e5e23781ea2ad64c4069cb9e6e");
    const flexFundingReturnTokenAdapter = await daoContrct.getAdapterAddress("0x43f8439a5cef099d0d9a92b15a64e34ff49963bb29d65f63204eda6591b810a1");
    const flexFreeInEscrowFundAdapterContract = await daoContrct.getAdapterAddress("0xeae11da953333a83b6467e2193334fb302549e1a42ad5797082aea1ab6be9120");
    const flexFundingHelperAdapterContract = await daoContrct.getAdapterAddress("0xc8e81510cbc5ec7970040e233b001587da1ea4484a9f7b8710d3322429c2df23");
    const flexDaoSetAdapterContract = await daoContrct.getAdapterAddress("0xe564b2da9fb62dadceed6d94ac5884ac5f464424e7be661d7d6181d49fa87b3f");
    const flexDaoSetHelperAdapterContract = await daoContrct.getAdapterAddress("0xff9379b98b93eb3bd1fac62fd2258a7955d70d2d5279c40064145b6c9646df37");
    const flexDaoSetPollingAdapterContract = await daoContrct.getAdapterAddress("0x5f0e8d109045653360289a7a02d5dc2a99e382006a42ef93f66de55ecff3176f");
    const flexDaoSetVotingAdapterContract = await daoContrct.getAdapterAddress("0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7");

    const flexFundingPoolFactory = await daoContrct.getExtensionAddress("0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c");

    console.log("FlexVesting: ", FlexVesting);
    console.log("FlexERC721: ", FlexERC721);
    console.log("FlexAllocationAdapterContract: ", FlexAllocationAdapterContract);
    console.log("FlexFundingPoolAdapterContract: ", FlexFundingPoolAdapterContract);
    console.log("FlexVotingContract: ", FlexVotingContract);
    console.log("FlexPollingVotingContract: ", FlexPollingVotingContract);
    console.log("FlexFundingAdapterContract: ", FlexFundingAdapterContract);
    console.log("bentoBoxV1: ", bentoBoxV1);
    console.log("ManagingContract: ", ManagingContract);
    console.log("StewardMangement: ", StewardMangement);
    console.log("flexStewardAllocationAdapter: ", flexStewardAllocationAdapter);
    console.log("flexFundingReturnTokenAdapter: ", flexFundingReturnTokenAdapter);
    console.log("flexFreeInEscrowFundAdapterContract: ", flexFreeInEscrowFundAdapterContract);
    console.log("flexFundingHelperAdapterContract: ", flexFundingHelperAdapterContract);
    console.log("flexDaoSetAdapterContract: ", flexDaoSetAdapterContract);
    console.log("flexDaoSetHelperAdapterContract: ", flexDaoSetHelperAdapterContract);
    console.log("flexDaoSetPollingAdapterContract: ", flexDaoSetPollingAdapterContract);
    console.log("flexDaoSetVotingAdapterContract: ", flexDaoSetVotingAdapterContract);
    console.log("flexFundingPoolFactory: ", flexFundingPoolFactory);


}

const getVintageAdapterAddress = async () => {
    const daoContrct = (await hre.ethers.
        getContractFactory("DaoRegistry")).attach("0xdecc79e48f3bfdd201b22937a8bfd0bff9c9a8d8");
    let vintageFundRaiseAdapterContract = await daoContrct.getAdapterAddress("0xa837e34a29b67bf52f684a1c93def79b84b9c012732becee4e5df62809df64ed");
    let FundingPoolAdapterContract = await daoContrct.getAdapterAddress("0xaaff643bdbd909f604d46ce015336f7e20fee3ac4a55cef3610188dee176c892");
    let vintageVotingAdapterContract = await daoContrct.getAdapterAddress("0xd3999c37f8f35da86f802a74f9bf032c4aeb46e49abd9c861f489ef4cb40d0a8");
    let vintageRaiserManagementContract = await daoContrct.getAdapterAddress("0xd90e10040720d66c9412cb511e3dbb6ba51669248a7495e763d44ab426893efa");
    let VintageFundingAdapterContract = await daoContrct.getAdapterAddress("0x0fd8cce4ef00a7a8c0c5f91194bc80f122deefe664dd2a2384687da62ab117d1");
    let vintageAllocationAdapterContract = await daoContrct.getAdapterAddress("0x99d271900d627893bad1d8649a7d7eb3501c339595ec52be94d222433d755603");
    let vintageVestingContract = await daoContrct.getAdapterAddress("0x8295fbcf0c0d839b7cf11cacb43f22c81604fd9f0e4b295ff1d641ad9dd5786a");
    let bentoBoxV1 = await daoContrct.getAdapterAddress("0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a");
    let vintageEscrowFundAdapterContract = await daoContrct.getAdapterAddress("0xf03649ccf5cbda635d0464f73bc807b602819fde8d2e1387f87b988bb0e858a3");
    let vintageDistrubteAdapterContract = await daoContrct.getAdapterAddress("0xe1cf6669e8110c379c9ea0aceed535b5ed15ea1db2447ab3fbda96c746d21a1a");
    let vintageRaiserAllocation = await daoContrct.getAdapterAddress("0x1fa6846b165d822fff79e37c67625706652fa9380c2aa49fd513ce534cc72ed4");
    let vintageFundingReturnTokenAdapterContract = await daoContrct.getAdapterAddress("0xde483f9dde6f6b12a62abdfd75010c5234f3ce7693a592507d331ec725f77257");
    let vintageFreeInEscrowFundAdapterContract = await daoContrct.getAdapterAddress("0x6a687e96f72a484e38a32d2ee3b61626294e792821961a90ce9a98d1999252d5");
    let vintageFundingPoolAdapterHelperContract = await daoContrct.getAdapterAddress("0xe70101dfebc310a1a68aa271bb3eb593540746781f9eaca3d7f52f31ba60f5d1");
    let vintageDaoSetAdapterContract = await daoContrct.getAdapterAddress("0x77cdf6056467142a33aa6f753fc1e3907f6850ebf08c7b63b107b0611a69b04e");
    let vintageDaoSetHelperAdapterContract = await daoContrct.getAdapterAddress("0x145d8ebc4d7403f3cd60312331619ffb262c52c22bedf24c0148027dd4be3b01");

    const vintageFundingPoolFactory = await daoContrct.getExtensionAddress("0x161fca6912f107b0f13c9c7275de7391b32d2ea1c52ffba65a3c961880a0c60f");


    console.log(`
    vintageFundRaiseAdapterContract         ${vintageFundRaiseAdapterContract}
    FundingPoolAdapterContract              ${FundingPoolAdapterContract}
    vintageVotingAdapterContract            ${vintageVotingAdapterContract}
    vintageRaiserManagementContract         ${vintageRaiserManagementContract}
    VintageFundingAdapterContract           ${VintageFundingAdapterContract}
    vintageAllocationAdapterContract        ${vintageAllocationAdapterContract}
    vintageVestingContract                  ${vintageVestingContract}
    bentoBoxV1                              ${bentoBoxV1}
    vintageEscrowFundAdapterContract        ${vintageEscrowFundAdapterContract}
    vintageDistrubteAdapterContract         ${vintageDistrubteAdapterContract}
    vintageRaiserAllocation                 ${vintageRaiserAllocation}
    vintageFundingReturnTokenAdapterContract ${vintageFundingReturnTokenAdapterContract}
    vintageFreeInEscrowFundAdapterContract  ${vintageFreeInEscrowFundAdapterContract}
    vintageFundingPoolAdapterHelperContract ${vintageFundingPoolAdapterHelperContract}
    vintageDaoSetAdapterContract            ${vintageDaoSetAdapterContract}
    vintageDaoSetHelperAdapterContract      ${vintageDaoSetHelperAdapterContract}
    vintageFundingPoolFactory               ${vintageFundingPoolFactory}
   `);
}

const getCollectiveAdapterAddress = async () => {
    const daoContrct = (await hre.ethers.
        getContractFactory("DaoRegistry")).attach("0x10961e5eec16ed5db73889fcc44bfab9ac65bff9");
    let collectiveGovernorManagmentAdapterContractAddr = await daoContrct.getAdapterAddress("0x1a4f1390baec30049008138e650571a3c4374eba88116bc89dc192f2f9295efe");

    console.log(collectiveGovernorManagmentAdapterContractAddr);
}

const getFlexdaoInvestorWhitelist = async () => {
    const flexInvestomentPoolContrct = (await hre.ethers.
        getContractFactory("FlexInvestmentPoolAdapterContract")).attach("0x2b4897ce0a178bf100bb1510b699850e3c46fdab");
    const rel = await flexInvestomentPoolContrct.getParticipanWhitelist("0x2b4897ce0a178bf100bb1510b699850e3c46fdab");
    console.log(rel);
}
const getFlexEscrowTokenInfo = async () => {
    const daoAddr = "0x94360044e0d58fc8eee54e8bbc142cfcaf9d4efb";
    const proposalId = "0xbc142cfcaf9d4efb496e766573746d656e742337000000000000000000000000";
    const paybackTokenAddr = "0x32bf9e40e6b94419f2e49dd112231bfaecac3b6c";
    const approver = "0x9ab302974abd84c875343d6beea05309bede2f10"
    const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).
        attach(daoAddr);

    const flexFundingAdapterContract = (await hre.ethers.getContractFactory("FlexFundingAdapterContract")).
        attach("0x4c30AA413304ff440783a80663e64852DAec5D3E");
    const erc20 = (await hre.ethers.getContractAt("openzeppelin-solidity-2.3.0/contracts/token/ERC20/IERC20.sol:IERC20",
        paybackTokenAddr));
    const escorwContrct = (await hre.ethers.
        getContractFactory("FlexInvestmentPaybackTokenAdapterContract")).attach("0x883B0218F3D2A74f6904bD281077E122952cB409");
    const approvedAmount = await escorwContrct.approvedInfos(
        daoAddr,
        proposalId,
        approver,
        paybackTokenAddr)
    const escrowContractBal = await erc20.balanceOf("0x9ab302974abd84c875343d6beea05309bede2f10");
    const allowance = await erc20.allowance(
        approver,
        "0x883B0218F3D2A74f6904bD281077E122952cB409");

    // const maxFundAmount = hre.ethers.utils.parseEther("100").mul(hre.ethers.utils.parseEther("1"))
    //     .div(hre.ethers.utils.parseEther("1")
    //         .sub(hre.ethers.utils.parseEther("0.003"))
    //         .sub(hre.ethers.utils.parseEther("0.01"))
    //         .sub(hre.ethers.utils.parseEther("0.02"))
    //     );
    // const protocolFee = maxFundAmount.mul(hre.ethers.utils.parseEther("0.003")).div(hre.ethers.utils.parseEther("1"));
    // const managementFee = maxFundAmount.mul(hre.ethers.utils.parseEther("0.01")).div(hre.ethers.utils.parseEther("1"));
    // const cashReward = maxFundAmount.mul(hre.ethers.utils.parseEther("0.02")).div(hre.ethers.utils.parseEther("1"));

    // const paybackAmount = (
    //     maxFundAmount
    //         .sub(protocolFee)
    //         .sub(managementFee)
    //         .sub(cashReward)
    // )
    //     .mul(hre.ethers.utils.parseEther("1"))
    //     .div(hre.ethers.utils.parseEther("2"));
    // console.log("maxFundAmount: ", maxFundAmount);
    // console.log("paybackAmount: ", paybackAmount);
    const proposalInfo = await flexFundingAdapterContract.Proposals(daoAddr,
        proposalId);
    const managementFee = await daoContract.getConfiguration("0xda34ff95e06cbf2c9c32a559cd8aadd1a10104596417d62c03db2c1258df83d3");
    const flexInvestmentPoolAdapterContract = (await hre.ethers.
        getContractFactory("FlexInvestmentPoolAdapterContract")).attach("0xceEb2b45a74A4d9F8348F09C33f70CEdEB0B7878");
    const poolbal = await flexInvestmentPoolAdapterContract.getTotalFundByProposalId(daoAddr,
        proposalId);
    const protocolFee = toBN("100000000000000000000").mul(hre.ethers.utils.parseEther("0.003")).div(hre.ethers.utils.parseEther("1"));
    console.log("escrowContractBal ", escrowContractBal);
    console.log("allowance ", allowance);
    console.log("approvedAmount ", approvedAmount);
    console.log("poolbal ", poolbal);
    console.log("protocolFee ", protocolFee);
    console.log(toBN("100000000000000000000").mul(hre.ethers.utils.parseEther("1")).div(hre.ethers.utils.parseEther("0.097")))
    console.log(managementFee);
    console.log("cashRewardAmount ", proposalInfo.proposerRewardInfo.cashRewardAmount);
    console.log("paybackTokenAmount ", proposalInfo.investmentInfo.paybackTokenAmount);
    console.log(hre.ethers.utils.parseEther("100").mul(hre.ethers.utils.parseEther("1")).div(toBN("3000000000000000000")));
}

const createDaosetProposal = async () => {
    const daoaddr = "0xEbAf32f711E90B058d73fBC705099CBD3B28ef2B";
    const daosetContrct = (await hre.ethers.
        getContractFactory("FlexDaoSetAdapterContract")).attach("0xeb80a06aecb79f6e9be20ec5ea99a4257abaff39");

    const tx = await daosetContrct.submitInvestorCapProposal(daoaddr, false, 5, { gasLimit: 5000000 });
    const rel = tx.wait();
    const proposalId = rel.events[rel.events.length - 1].args.proposalId;
    console.log(proposalId);
}

const getFlexDaosetPropsalInfo = async () => {
    const daoaddr = "0x9edd98c22f2ed014dacc35a06e5621a77af379d1";
    const proposalId = "0x6e5621a77af379d1566f74696e67202334000000000000000000000000000000";
    const daosetVoingContrct = (await hre.ethers.
        getContractFactory("FlexDaoSetVotingAdapterContract")).attach("0x7d11d76034CeC66A4D94A1e9A0681e0601cd4F96");
    const daosetContrct = (await hre.ethers.
        getContractFactory("FlexDaoSetAdapterContract")).attach("0x2eDE37eBBF9a7EA2ADc3387523915f2D9606B539");
    const FlexDaoSetPollingAdapterContract = (await hre.ethers.
        getContractFactory("FlexDaoSetPollingAdapterContract")).attach("0xd275a276AA0A6ED8bd68A20e83823a66915f7378");
    const proposalInfo = await daosetVoingContrct.votingProposals(daoaddr, proposalId);
    const allc = await daosetVoingContrct.getAllocations(daoaddr, proposalId);
    console.log(proposalInfo);
    console.log(allc);

    // const tx = await daosetContrct.processVotingProposal(daoaddr, proposalId);
    // await tx.wait();
}

const getVintageInvestors = async () => {
    const daoAddress = "0x5e3572f17b64fb676d22a35efa34c29fe070a745";
    const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddress);
    const vintageFundingPoolAdaptAddr = await dao.getAdapterAddress("0xaaff643bdbd909f604d46ce015336f7e20fee3ac4a55cef3610188dee176c892")
    // const VintageFundingAdapterContractAddr = await dao.getAdapterAddress("0x0fd8cce4ef00a7a8c0c5f91194bc80f122deefe664dd2a2384687da62ab117d1");
    const vintageFundingpoolExtAddress = await dao.getExtensionAddress("0x161fca6912f107b0f13c9c7275de7391b32d2ea1c52ffba65a3c961880a0c60f")
    // const vintageFundingAdapt = (await hre.ethers.getContractFactory("VintageFundingAdapterContract"))
    //     .attach(VintageFundingAdapterContractAddr);
    const vintageFundingPoolAdaptContractInstance = (await hre.ethers.getContractFactory("VintageFundingPoolAdapterContract"))
        .attach(vintageFundingPoolAdaptAddr);

    const vintageFundingPoolExtInstance = (await hre.ethers.getContractFactory("VintageFundingPoolExtension"))
        .attach(vintageFundingpoolExtAddress);


    const investors = await vintageFundingPoolAdaptContractInstance.getFundInvestors(daoAddress, 2);
    const currentBal = await vintageFundingPoolAdaptContractInstance.balanceOf(daoAddress, investors[0]);
    const bal1 = await vintageFundingPoolExtInstance.getPriorAmount(investors[0],
        "0x32bf9e40e6b94419f2e49dd112231bfaecac3b6c",
        6571600);

    const bal2 = await vintageFundingPoolExtInstance.getPriorAmount(investors[0],
        "0x32bf9e40e6b94419f2e49dd112231bfaecac3b6c",
        6571599);
    console.log("investors: ", investors);

    console.log(`
    bal1 ${hre.ethers.utils.formatEther(bal1)}
    bal2 ${hre.ethers.utils.formatEther(bal2)}
    currentBal ${hre.ethers.utils.formatEther(currentBal)}
    `);



}

const getCollectiveProtocolFeeAndAccount = async () => {
    const daoContr = (await hre.ethers.getContractFactory("DaoRegistry"))
        .attach("0x7517e0504b6a8c92469fef86f6c7a6d41539ffcd");

    const fundingPoolAdaptAddr = await daoContr.getAdapterAddress("0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea");
    const fundingAdaptAddr = await daoContr.getAdapterAddress("0x72894213a5c7f56b36b2947fa6ea18963d6bb1a68746b46d7f552cca76e1a7a8");

    const colletiveFundingPoolAdapterContract = (await hre.ethers.getContractFactory("ColletiveFundingPoolAdapterContract"))
        .attach(fundingPoolAdaptAddr);

    const colletiveFundingProposalAdapterContract = (await hre.ethers.getContractFactory("ColletiveFundingProposalAdapterContract"))
        .attach(fundingAdaptAddr);

    const protocolf = await colletiveFundingPoolAdapterContract.protocolFee();
    const protooclAccount = await colletiveFundingProposalAdapterContract.protocolAddress();

    console.log(`
        protocolf        ${protocolf}
        protooclAccount  ${protooclAccount}
        `);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });