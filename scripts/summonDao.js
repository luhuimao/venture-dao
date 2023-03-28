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
const { checkBalance, depositToFundingPool, createDistributeFundsProposal } = require("../utils/test-util");
const summonFlexDaoContractAddress = "0xceeb2b45a74a4d9f8348f09c33f70cedeb0b7878";
const deploySummonContract = async () => {
    const SummonDao = await hre.ethers.getContractFactory("SummonDao");
    const summonDao = await SummonDao.deploy();
    await summonDao.deployed();
    console.log("summonDao deployed address:", summonDao.address);
}

async function main() {
    // await getDaoInfo("0xEd0B0ADE001Dd4C004d3e454e9BE52e3ACc1bA35");
    await deploy();
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
    const summonDaoContractAddress = "0x15011A10B50f63CC0Ff649F6501383FAF7861471";

    const summonDaoContract = await (await hre.ethers.getContractFactory("SummonDao"))
        .attach(summonDaoContractAddress);
    this.daoFactory = await (await hre.ethers.getContractFactory("DaoFactory"))
        .attach("0xC213d9093e37Aae1A7Ee1502bfa6eaE7809223B6");
    this.fundingPoolExtFactory = await (await hre.ethers.getContractFactory("FundingPoolFactory"))
        .attach("0x87Ace7e37571eC0f38FF940B03C5577D705DeD9c");
    this.gpDaoExtFactory = await (await hre.ethers.getContractFactory("GPDaoFactory"))
        .attach("0x729C5D31adB33A0fb196A9345d396bb4DCb5Bf7A");
    const daoFactoriesAddress = [this.daoFactory.address,
    this.fundingPoolExtFactory.address,
    this.gpDaoExtFactory.address
    ];
    const _daoName = "my_vintage_dao_008";
    const creator = "0x540881ECaF34C85EfB352727FC2F9858B19C4b08";
    const enalbeAdapters = [
        {
            id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
            addr: "0x7226a840199E0AC999a1552600B8bAe4cB6160B7",
            flags: 0
        },
        {
            id: '0x552a230dd619d2fa767bf60d9fc3ece302bde1086b9d69a14d6a843b45512ccc',//vesting
            addr: "0x9074DA8642FE0753B358a1898A957B93e45aE450",
            flags: 0
        },
        {
            id: '0x22c3b3d75fb899a52b9cd1992cc735762639e44483f728c4cd25708d873635d7',//fund-raise
            addr: "0xA48981f1c45b3366bAFe15d51fdf72fA2d381D50",
            flags: 10
        },
        {
            id: '0xdb58310e103437f6124e14b8b20969775f28cbf97188fd0c2cb5ba69dcad2c4b',// gp kick
            addr: "0xB3AE32e66EF0e5f13A5EDaeec2fE2681599daddd",
            flags: 258
        },
        {
            id: '0x64fc27b0ff66ecc06f04211511833a21b1c6af3e8efd8dae1412a70557586368',//gp-dao-onboarding
            addr: "0x717cbE5a002164298ece492502f744a9C96dD039",
            flags: 258
        },
        {
            id: '0xf26d4834b4a91110d15379eda333e30be707af3a839ee5dbd668b89e4c6c6f6f',//founding-pool
            addr: "0x691E412baeaC66C30C76b615DbeC288e7Ad1030E",
            flags: 64
        },
        {
            id: '0xf150ecc391a74d51eebe4e31251217b187da568384d2b31171b9915d6f8fdd51',//gp-dao
            addr: "0x8E8be48444171Ca7375CD3f19f33fA2C4bd5ce22",
            flags: 0
        },
        {
            id: '0x2a014d63456a24764c5dba5876cafc75ecbe2d639a1af4060fe13c6f50d4ba20',//distribute-fundv2
            addr: "0xeD550E8aB6Eca75FFcDb4E2D08db1672de2AAa50",
            flags: 266
        },
        {
            id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//managing
            addr: "0x352B3E3426D4A6662655BBFab6CE84F36cC0e9bd",
            flags: 59
        },
        {
            id: '0x60c070b9a72ac4c8e5f956ed17fe8117b5ec87b0ceefa6de23348ec16fc8b9ea',//gp-onboard-voting
            addr: "0xB4fA2F8AFD86cC7Bb151D6544FFD63a56f03FAeD",
            flags: 8
        },
        {
            id: '0x0272405e7a7e2834b06b48bd0de471bbb4d8400020ec22f05b6fc30ffddb34a8',// gp-voting
            addr: "0x96A8681D4699bCd6bFF3C9C61DBeb6AAB642Ff7C",
            flags: 8
        },
        {
            id: '0x71c8887ab5df33af0f26db43a2e569d7268b592b16c505d22229eabd80eb8f36',//allocationv2
            addr: "0x4c4B5BBb3b37423D8DB0320f50F3900FAf3029D8",
            flags: 8
        },
        {
            id: '0x67e84d3ef18b24e32f9a9b2e9bac9e7ea8cde2f146ce512d44b9d6718a1f3ca0',//gp-dao-ext
            addr: "0x98De1cA41EEa56Bce0d6FC495524CAc51C6c7ED0",
            flags: 0
        }
    ];
    const adapters1 = [
        {
            id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4', //FundingPoolExtension
            addr: "0x691E412baeaC66C30C76b615DbeC288e7Ad1030E",//FundingPoolAdapterContract
            flags: 15903
        },
        {
            id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4', //FundingPoolExtension
            addr: "0xeD550E8aB6Eca75FFcDb4E2D08db1672de2AAa50",//DistributeFundContractV2
            flags: 242
        }
    ];
    const adapters2 = [
        {
            id: '0xeadd166fac11c69a9d01b14cdd03f0902ebe2a3d90e6e17ced26382b23bfe1c4',//FundingPoolExtension
            addr: "0x98De1cA41EEa56Bce0d6FC495524CAc51C6c7ED0",//GPDaoExtension
            flags: 16384
        }
    ];
    let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

    const _vintageDaoVotingInfo = [
        600,//config VOTING_PERIOD
        0,//config VOTING Power calculate type
        66,//config SUPER_MAJORITY
        60,//config QUORUM
        600,//config PROPOSAL_EXECUTE_DURATION
    ]

    const _vintageDdaoMembeShipInfo = [
        1,//bool enable;
        4,//uint8 validateType;
        0,//uint256 minHolding;
        "0x0000000000000000000000000000000000000000",//address tokenAddress;
        0,//uint256 tokenId;
        ["0x9ac9c636404C8d46D9eb966d7179983Ba5a3941A", "0xb7a0f269468DA74E4b71569c903cf20ce4a507A8"]
    ];
    const _vintageDaoParticipantCapInfo = [
        1,//bool enable;
        5//uint256 maxParticipants;
    ];
    const _vintageGenesisRaiserList = [
        "0xcea5e66bec5193e5ec0b049a3fe5d7dd896fd480",
        "0xc9Df049CF23F1B4c51b0772e98427f2084760a4E"
    ];

    const vintageDaoParams = [
        daoFactoriesAddress,
        _daoName,
        creator,
        enalbeAdapters,
        adapters1,
        adapters2,
        _vintageDaoVotingInfo,
        _vintageDdaoMembeShipInfo,
        _vintageDaoParticipantCapInfo,
        _vintageGenesisRaiserList
    ];

    let tx = await summonDaoContract.summonVintageDao1(vintageDaoParams);
    let result = await tx.wait();
    const daoAddr = result.events[result.events.length - 1].args.daoAddr;
    // this.NEW_DAO_ADDRESS = daoAddr;
    const daoName = await this.daoFactory.daos(daoAddr);
    console.log(`
    new dao address ${daoAddr}
    new dao name ${daoName}
    `);

    tx = await summonDaoContract.summonVintageDao2(vintageDaoParams, daoAddr);
    result = await tx.wait();
    console.log("summonVintageDao2 finished...");
    tx = await summonDaoContract.summonVintageDao3(vintageDaoParams, daoAddr);
    result = await tx.wait();
    console.log("summonVintageDao3 finished...");

    tx = await summonDaoContract.summonVintageDao4(vintageDaoParams, daoAddr);
    result = await tx.wait();
    console.log("summonVintageDao4 finished...");

    tx = await summonDaoContract.summonVintageDao5(vintageDaoParams, daoAddr);
    result = await tx.wait();
    console.log("summonVintageDao5 finished...");

    tx = await summonDaoContract.summonVintageDao6(vintageDaoParams, daoAddr);
    result = await tx.wait();
    console.log("summonVintageDao6 finished...");

}

const createVintageFundRaiseProposal = async () => {
    const fundRaiseContract = await (await hre.ethers.getContractFactory("FundRaiseAdapterContract"))
        .attach("0xA48981f1c45b3366bAFe15d51fdf72fA2d381D50");
    const votingContract = await (await hre.ethers.getContractFactory("GPVotingContract"))
        .attach("0x96A8681D4699bCd6bFF3C9C61DBeb6AAB642Ff7C");
    const fundingPoolAdaptContract = await (await hre.ethers.getContractFactory("FundingPoolAdapterContract"))
        .attach("0x691E412baeaC66C30C76b615DbeC288e7Ad1030E");
    const daoAddress = "0x9b3d08965c6c9bc4ff0a7ff4dd5af54f012d7ae2";
    console.log(`create fund raise proposal...`);
    const ProposalFundRaiseInfo = [
        hre.ethers.utils.parseEther("10000"), //uint256 fundRaiseTarget;
        hre.ethers.utils.parseEther("100000"),//uint256 fundRaiseMaxAmount;
        hre.ethers.utils.parseEther("1000"),// uint256 lpMinDepositAmount;
        hre.ethers.utils.parseEther("10000")// uint256 lpMaxDepositAmount;
    ]
    let currentblocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

    const ProposalTimeInfo = [
        currentblocktimestamp + 60 * 10,// uint256 fundRaiseStartTime;
        currentblocktimestamp + 60 * 20,// uint256 fundRaiseEndTime;
        60 * 20,// uint256 fundTerm;
        60 * 60,// uint256 redemptPeriod;
        60 * 10,// uint256 redemptDuration;
        60 * 10// uint256 returnDuration;
    ]

    const ProposalFeeInfo = [
        2,// uint256 proposerRewardRatio;
        3,// uint256 managementFeeRatio;
        2// uint256 redepmtFeeRatio;
    ]

    const ProposalAddressInfo = [
        "0x540881ECaF34C85EfB352727FC2F9858B19C4b08",// address managementFeeAddress;
        "0x0B133Cc91a191d8d83133690019375a362B3886D"// address fundRaiseTokenAddress;
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
    const { proposalId } = await createDistributeFundsProposal(
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

    const enalbeAdapters = [
        {
            id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd',//FlexVesting
            addr: MUMBAI_CONTRACTS.FlexVesting,
            flags: 0
        },
        {
            id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35',//FlexERC721
            addr: MUMBAI_CONTRACTS.FlexERC721,
            flags: 0
        },
        {
            id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8',//FlexAllocationAdapterContract
            addr: MUMBAI_CONTRACTS.FlexAllocationAdapterContract,
            flags: 0
        },
        {
            id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c',//FlexFundingPoolAdapterContract
            addr: MUMBAI_CONTRACTS.FlexFundingPoolAdapterContract,
            flags: 0
        },
        {
            id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7',//FlexVotingContract
            addr: MUMBAI_CONTRACTS.FlexVotingContract,
            flags: 258
        },
        {
            id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610',//FlexPollingVotingContract
            addr: MUMBAI_CONTRACTS.FlexPollingVotingContract,
            flags: 258
        },
        {
            id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda',//FlexFundingAdapterContract
            addr: MUMBAI_CONTRACTS.FlexFundingAdapterContract,
            flags: 258
        },
        {
            id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
            addr: MUMBAI_CONTRACTS.BentoBoxV1,
            flags: 0
        },
        {
            id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//ManagingContract
            addr: MUMBAI_CONTRACTS.ManagingContract,
            flags: 59
        },
        {
            id: '0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753',//StewardMangement
            addr: MUMBAI_CONTRACTS.StewardManagementContract,
            flags: 194
        }
    ];

    const adapters1 = [
        {
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: MUMBAI_CONTRACTS.FlexFundingPoolAdapterContract,//FlexFundingPoolAdapterContract
            flags: 75
        },
        {
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: MUMBAI_CONTRACTS.FlexFundingAdapterContract,//FlexFundingAdapterContract
            flags: 26
        }
    ];

    const fundingPollEnable = true;

    const flexDaoParticipantCapInfo = [
        false,//bool enable;
        5//uint256 maxParticipantsAmount;
    ];
    const flexDaoParticipantMembershipEnalbe = false;

    const flexDaoParticipantsMemberships = [
        "", // string name;
        0,// uint8 varifyType;
        "0",  // uint256 minHolding;
        "0x0000000000000000000000000000000000000000", // address tokenAddress;
        0,// uint256 tokenId;
        ['0x0000000000000000000000000000000000000000']//whiteList;

    ];

    const flexDaoPriorityDepositEnalbe = false;

    const flexDaoPriorityDepositMembershipInfo = {
        varifyType: 0,    // uint8 varifyType;
        minHolding: 10000000000000, // uint256 minHolding;
        tokenAddress: "0x0000000000000000000000000000000000000000",// address tokenAddress;
        tokenId: 0,  // uint256 tokenId;
        whiteList: [],   // address[] whiteList;
        priorityPeriod: 0      // uint256 priorityPeriod;
    }

    const flexDaoStewardMembershipInfo = [
        1, // bool enable;
        3, // uint256 varifyType;
        "0", // uint256 minHolding;
        "0x0000000000000000000000000000000000000000",// address tokenAddress;
        0,  // uint256 tokenId;
        [
            "0x540881ECaF34C85EfB352727FC2F9858B19C4b08",
            "0x9ab302974abd84c875343d6beea05309bede2f10"
        ] // address[] whiteList;
    ];

    const flexDaoVotingInfo = [
        60 * 10,// uint256 votingPeriod;
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
        60 * 10,// uint256 votingPeriod;
        0,// uint8 votingPower;
        1, // uint256 superMajority;
        1 // uint256 quorum;
    ];

    const flexDaoProposerMembershipInfo = [
        3,  // uint8 varifyType;
        hre.ethers.utils.parseEther("100"),  // uint256 minHolding;
        "0x0B133Cc91a191d8d83133690019375a362B3886D",  // address tokenAddress;
        0,   // uint256 tokenId;
        [
            '0x0309d2DC027e0843ab2bC72c69149ad1D746db55',
            "0x764e1631B166aB9c05e4bEF355A4AEB52B77f647",
            "0x04A0de3995B91fA6ab1c1037Bb0a6d1040dFDc61",
            "0x5E78937e2cB15c8d96FB66B575cdCBdf0Cfa7935"
        ]  // address[] whiteList;
    ];
    // const flexDaoManagementfee = 2;
    const flexDaoManagementfee = hre.ethers.utils.parseEther("0.002");// 0.2%

    const flexDaoGenesisStewards = [
        '0x0309d2DC027e0843ab2bC72c69149ad1D746db55',
        "0x764e1631B166aB9c05e4bEF355A4AEB52B77f647",
        "0x04A0de3995B91fA6ab1c1037Bb0a6d1040dFDc61",
        "0x5E78937e2cB15c8d96FB66B575cdCBdf0Cfa7935"
    ];


    const flexDaoInfo = {
        name: _daoName,// string name;
        creator: _creator,  // address creator;
        flexDaoManagementfee: flexDaoManagementfee,   // uint256 flexDaoManagementfee;
        managementFeeAddress: "0x0309d2DC027e0843ab2bC72c69149ad1D746db55",
        flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
        flexDaoFundriaseStyle: 0// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
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

    return flexDaoParams;
}

const summonFlexDaoParamsGoerli = (_daoName) => {
    const daoFactoriesAddress = [
        GOERLI_CONTRACTS.DaoFactory,
        GOERLI_CONTRACTS.FlexFundingPoolFactory
    ];
    // const _daoName = "Crypto Labs";
    const _creator = "0xDF9DFA21F47659cf742FE61030aCb0F15f659707";

    const enalbeAdapters = [
        {
            id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd',//FlexVesting
            addr: GOERLI_CONTRACTS.FlexVesting,
            flags: 0
        },
        {
            id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35',//FlexERC721
            addr: GOERLI_CONTRACTS.FlexERC721,
            flags: 0
        },
        {
            id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8',//FlexAllocationAdapterContract
            addr: GOERLI_CONTRACTS.FlexAllocationAdapterContract,
            flags: 0
        },
        {
            id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c',//FlexFundingPoolAdapterContract
            addr: GOERLI_CONTRACTS.FlexFundingPoolAdapterContract,
            flags: 0
        },
        {
            id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7',//FlexVotingContract
            addr: GOERLI_CONTRACTS.FlexVotingContract,
            flags: 258
        },
        {
            id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610',//FlexPollingVotingContract
            addr: GOERLI_CONTRACTS.FlexPollingVotingContract,
            flags: 258
        },
        {
            id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda',//FlexFundingAdapterContract
            addr: GOERLI_CONTRACTS.FlexFundingAdapterContract,
            flags: 258
        },
        {
            id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a',// ben to box
            addr: GOERLI_CONTRACTS.BentoBoxV1,
            flags: 0
        },
        {
            id: '0xb5d1b10526b91c1951e75295138b32c80917c8ba0b96f19926ef2008a82b6511',//ManagingContract
            addr: GOERLI_CONTRACTS.ManagingContract,
            flags: 59
        },
        {
            id: '0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753',//StewardMangement
            addr: GOERLI_CONTRACTS.StewardManagementContract,
            flags: 194
        }
    ];

    const adapters1 = [
        {
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: GOERLI_CONTRACTS.FlexFundingPoolAdapterContract,//FlexFundingPoolAdapterContract
            flags: 75
        },
        {
            id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
            addr: GOERLI_CONTRACTS.FlexFundingAdapterContract,//FlexFundingAdapterContract
            flags: 26
        }
    ];

    const fundingPollEnable = true;

    const flexDaoParticipantCapInfo = [
        false,//bool enable;
        5//uint256 maxParticipantsAmount;
    ];
    const flexDaoParticipantMembershipEnalbe = false;

    const flexDaoParticipantsMemberships = [
        "", // string name;
        0,// uint8 varifyType;
        "0",  // uint256 minHolding;
        "0x0000000000000000000000000000000000000000", // address tokenAddress;
        0,// uint256 tokenId;
        ['0x0000000000000000000000000000000000000000']//whiteList;

    ];

    const flexDaoPriorityDepositEnalbe = false;

    const flexDaoPriorityDepositMembershipInfo = {
        varifyType: 0,    // uint8 varifyType;
        minHolding: 10000000000000, // uint256 minHolding;
        tokenAddress: "0x0000000000000000000000000000000000000000",// address tokenAddress;
        tokenId: 0,  // uint256 tokenId;
        whiteList: [],   // address[] whiteList;
        priorityPeriod: 0      // uint256 priorityPeriod;
    }

    const flexDaoStewardMembershipInfo = [
        1, // bool enable;
        3, // uint256 varifyType;
        "0", // uint256 minHolding;
        "0x0000000000000000000000000000000000000000",// address tokenAddress;
        0,  // uint256 tokenId;
        [
            "0x540881ECaF34C85EfB352727FC2F9858B19C4b08",
            "0x9ab302974abd84c875343d6beea05309bede2f10"
        ] // address[] whiteList;
    ];

    const flexDaoVotingInfo = [
        60 * 10,// uint256 votingPeriod;
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
        60 * 10,// uint256 votingPeriod;
        0,// uint8 votingPower;
        1, // uint256 superMajority;
        1 // uint256 quorum;
    ];

    const flexDaoProposerMembershipInfo = [
        3,  // uint8 varifyType;
        hre.ethers.utils.parseEther("100"),  // uint256 minHolding;
        "0x0B133Cc91a191d8d83133690019375a362B3886D",  // address tokenAddress;
        0,   // uint256 tokenId;
        [
            '0x0309d2DC027e0843ab2bC72c69149ad1D746db55',
            "0x764e1631B166aB9c05e4bEF355A4AEB52B77f647",
            "0x04A0de3995B91fA6ab1c1037Bb0a6d1040dFDc61",
            "0x5E78937e2cB15c8d96FB66B575cdCBdf0Cfa7935"
        ]  // address[] whiteList;
    ];
    // const flexDaoManagementfee = 2;
    const flexDaoManagementfee = hre.ethers.utils.parseEther("0.002");// 0.2%

    const flexDaoGenesisStewards = [
        '0x0309d2DC027e0843ab2bC72c69149ad1D746db55',
        "0x764e1631B166aB9c05e4bEF355A4AEB52B77f647",
        "0x04A0de3995B91fA6ab1c1037Bb0a6d1040dFDc61",
        "0x5E78937e2cB15c8d96FB66B575cdCBdf0Cfa7935"
    ];


    const flexDaoInfo = {
        name: _daoName,// string name;
        creator: _creator,  // address creator;
        flexDaoManagementfee: flexDaoManagementfee,   // uint256 flexDaoManagementfee;
        managementFeeAddress: "0x0309d2DC027e0843ab2bC72c69149ad1D746db55",
        flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
        flexDaoFundriaseStyle: 0// uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
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

    return flexDaoParams;
}

const summonFlexDao = async (_daoName) => {
    console.log(hre.network.name);
    if (hre.network.name == "mumbai") {
        const summonDaoContract = await (await hre.ethers.getContractFactory("SummonDao"))
            .attach(MUMBAI_CONTRACTS.SummonDao);
        const params = summonFlexDaoParamsMumbai(_daoName);

        const tx = await summonDaoContract.summonFlexDao(params);
        const result = await tx.wait();
        console.log("created... ");
    } else if (hre.network.name == "goerli") {
        const summonDaoContract = await (await hre.ethers.getContractFactory("SummonDao"))
            .attach(GOERLI_CONTRACTS.SummonDao);
        const params = summonFlexDaoParamsGoerli(_daoName);

        const tx = await summonDaoContract.summonFlexDao(params);
        const result = await tx.wait();
        console.log("created... ");
    } else { }
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

    let tokenRewardAmount = hre.ethers.utils.parseEther("0.02");// 2%
    let cashRewardAmount = hre.ethers.utils.parseEther("0.003");// 0.3%
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

    let tokenRewardAmount = hre.ethers.utils.parseEther("0.02");// 2%
    let cashRewardAmount = hre.ethers.utils.parseEther("0.003");// 0.3%
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
    const [account1, account2, account3, account4, account5] = await hre.ethers.getSigners();
    if (hre.network.name == "mumbai") {
        const flexFundingContract = await (await hre.ethers.getContractFactory("FlexFundingAdapterContract"))
            .attach(MUMBAI_CONTRACTS.FlexFundingAdapterContract);
        const fundingParams = await flexFundingProposalParams_MUMBAI();
        const tx1 = await flexFundingContract.connect(account2).submitProposal(daoAddr, fundingParams);
        const result1 = await tx1.wait();
        const ProposalId = result1.events[2].args.proposalId;
        console.log(`flex funding ProposalId: ${hre.ethers.utils.toUtf8String(ProposalId)}`);
    } else if (hre.network.name == "goerli") {
        const flexFundingContract = await (await hre.ethers.getContractFactory("FlexFundingAdapterContract"))
            .attach(GOERLI_CONTRACTS.FlexFundingAdapterContract);
        const fundingParams = await flexFundingProposalParams_Goerli();

        const tx1 = await flexFundingContract.connect(account2).submitProposal(daoAddr, fundingParams);
        const result1 = await tx1.wait();
        const ProposalId = result1.events[2].args.proposalId;
        console.log(`flex funding ProposalId: ${hre.ethers.utils.toUtf8String(ProposalId)}`);
    } else { }


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
    const [account1, account2, account3, account4, account5] = await hre.ethers.getSigners();
    const bal = hre.ethers.utils.formatEther((await account5.getBalance()).toString());
    console.log("ETH balance: ", bal);
    // const DistributeFundContractV2 = await hre.ethers.getContractFactory("DistributeFundContractV2");
    // const distributeFundContractV2 = await DistributeFundContractV2.deploy();
    // await distributeFundContractV2.deployed();
    // console.log("distributeFundContractV2 deployed address:", distributeFundContractV2.address);

    // const DaoRegistry = await hre.ethers.getContractFactory("DaoRegistry");
    // const daoRegistry = await DaoRegistry.deploy();
    // await daoRegistry.deployed();
    // console.log("daoRegistry deployed address:", daoRegistry.address);

    // const DaoFactory = await hre.ethers.getContractFactory("DaoFactory");
    // const daoFactory = await DaoFactory.deploy("0x658d94BBaD60EA8A82D160a00eB2E7F486aC2A39");
    // await daoFactory.deployed();
    // console.log("daoFactory deployed address:", daoFactory.address);

    // const FundingPoolAdapterContract = await hre.ethers.getContractFactory("FundingPoolAdapterContract");
    // const fundingPoolAdapterContract = await FundingPoolAdapterContract.deploy();
    // await fundingPoolAdapterContract.deployed();
    // console.log("fundingPoolAdapterContract deployed address:", fundingPoolAdapterContract.address);

    // const GPDaoOnboardingAdapterContract = await hre.ethers.getContractFactory("GPDaoOnboardingAdapterContract");
    // const gPDaoOnboardingAdapterContract = await GPDaoOnboardingAdapterContract.deploy();
    // await gPDaoOnboardingAdapterContract.deployed();
    // console.log("gPDaoOnboardingAdapterContract deployed address:", gPDaoOnboardingAdapterContract.address);


    // const GPKickAdapterContract = await hre.ethers.getContractFactory("GPKickAdapterContract");
    // const gPKickAdapterContract = await GPKickAdapterContract.deploy();
    // await gPKickAdapterContract.deployed();
    // console.log("gPKickAdapterContract deployed address:", gPKickAdapterContract.address);

    // const FundRaiseAdapterContract = await hre.ethers.getContractFactory("FundRaiseAdapterContract");
    // const fundRaiseAdapterContract = await FundRaiseAdapterContract.deploy();
    // await fundRaiseAdapterContract.deployed();
    // console.log("fundRaiseAdapterContract deployed address:", fundRaiseAdapterContract.address);

    // const FlexFundingAdapterContract = await hre.ethers.getContractFactory("FlexFundingAdapterContract");
    // const flexFundingAdapterContract = await FlexFundingAdapterContract.deploy();
    // await flexFundingAdapterContract.deployed();
    // console.log("flexFundingAdapterContract deployed address:", flexFundingAdapterContract.address);

    // const FlexFundingPoolAdapterContract = await hre.ethers.getContractFactory("FlexFundingPoolAdapterContract");
    // const flexFundingPoolAdapterContract = await FlexFundingPoolAdapterContract.deploy();
    // await flexFundingPoolAdapterContract.deployed();
    // console.log("flexFundingPoolAdapterContract deployed address:", flexFundingPoolAdapterContract.address);

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

    const BentoBoxV1 = await hre.ethers.getContractFactory("BentoBoxV1");
    const bentoBoxV1 = await BentoBoxV1.connect(account5).deploy();
    await bentoBoxV1.connect(account5).deployed();
    console.log("bentoBoxV1 deployed address:", bentoBoxV1.address);
}


const getDaoInfo = async (daoAddr) => {
    const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);
    const flexFundingPoolExtAddress = await daoContract.getExtensionAddress(sha3("flex-funding-pool-ext"));//flex-funding-pool-ext
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


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });