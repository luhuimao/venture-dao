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
    // await getManualNFTURI();
    // await mintInvestmentReceiptNFT();
    // await crateBatchVesting();
    // await getInvestmentEscrowNFTSvg();
    // await getCollectiveVestingInfo(4);
    // await summonCollectiveDao();
    // await summonVintageDao();
    // await getReceiptNFTInfo();
    // await collectiveVotingPower("0x3528011ed1181af68f33f1ef110fdff5ed7cece6");
    // await submitFlexDaosetVotingProposal("0xc6390890243296e83000822ffc77e2375af9b9c1");
    // await flexDaosetProposal("0xe2b5a93863310d61be803f36cc02006c932c4f9c", "0xcc02006c932c4f9c566f74696e67202331000000000000000000000000000000");
    // await collectiveClearFundProposal("0xc2e10c4a27cb9d3abf1416c9b6eef61becc32516");
    // await getCollectiveAdapterAddress("0xdbaec61afe929a419cfcd6f0adf0a3db47606ca1");
    // await collectiveRedemptionFee("0x72a789cc0c1a438d6c3bd165832057bd3428ba39");
    // await collectiveEscrowFund("0xb4df914f21757dd024f5a7182af78a6640e86dea");
    // await collectiveOperationProposals("0x97d555cac557c5c0395f858fa1544253edea1bd8");
    // await collectiveFundRaise("0x8912ae0abdb6ac0198341678d56dff2b3b2df4b2");
    // await collectiveExpenseProposal("0x82a5ee461cec0f6284e424db56bde6d980251088",
    //     "0x56bde6d980251088457870656e73652331000000000000000000000000000000");
    // await getCollectiveInvestmentProposalInfo(
    //     "0x2b27796e44c389d5089de5a33cb15416021443ae",
    //     "0x3cb15416021443ae496e766573746d656e742334000000000000000000000000"
    // );
    // await getCollectivePaybackTokenApprovedInfo(
    //     "0x6ea94d1c284328068a193707bba9ffece7ac4ab5",
    //     "0xbba9ffece7ac4ab5496e766573746d656e742334000000000000000000000000",
    //     "0x9ab302974abd84c875343d6beea05309bede2f10",
    //     "0x32bf9e40e6b94419f2e49dd112231bfaecac3b6c"
    // );
    // await mintVintageReceiptNFT();
    // await getFlexReceiptNFTSVG();
    // await getFlexReceiptNFTInfo();
    // await mintReceiptNFT();
    // await getVintageCreatedVestinginfo();
    // await getVintageVestNFTSVG();
    // await transferVestNFT();
    // await getVestNFTSVG();
    // await getFlexCreatedVestinginfo();
    // await mintFlexVestingNFT();
    // await debug();
    // await getVintageVestingInfo();
    // await vintageFundingProposalDebug(
    //     "0x3cc5809781b98695ad31c5fbfc98869ccd1c7f8a",
    //     "0xfc98869ccd1c7f8a496e766573746d656e742331000000000000000000000000");
    // await getVintageInvestors();
    // await getFlexAdapterAddress("0x8fdeec8aba878eef0afa8d554aeb7590d46d31be");
    // await getFlexDaosetPropsalInfo();
    // await summonFlexDao();
    // await getVintageManagementFee();
    // await getFlexEscrowTokenInfo(
    //     "0xB31EA2c11EF41993d62bB2e05EEA97244236b78c",
    //     "0x5eea97244236b78c496e766573746d656e742333000000000000000000000000",
    //     "0xDF9DFA21F47659cf742FE61030aCb0F15f659707",
    //     "0xFCe5FdEbF0fe1ff0674A1294D5Cd8018A0e30cD6"
    // );
    // await createDaosetProposal();
    // await getDaoConfig("0x3cc5809781b98695ad31c5fbfc98869ccd1c7f8a");
    // await getDaoInfo("0xEd0B0ADE001Dd4C004d3e454e9BE52e3ACc1bA35");
    await deploy();
    // await getFlexdaoInvestorWhitelist();
    // await submitVintageDaosetProposal();
    // await getVintageDaosetProposal();
    // await getVintageNewFundProposalInfo(
    //     "0x3cc5809781b98695ad31c5fbfc98869ccd1c7f8a",
    //     "0xfc98869ccd1c7f8a46756e6445737461626c6973686d656e7423310000000000"
    // );
    // await getFlexInvestors(
    //     "0x3cff918ded693a59c6bef2870448db924fa3a234",
    //     "0x0448db924fa3a234496e766573746d656e742331000000000000000000000000"
    // );
    // await getFlexFundingProposalInfo(
    //     "0xfe77cFBe313bd3CacbdC5d4dd5c084438F863e3F",
    //     "0xd5c084438f863e3f496e766573746d656e742331000000000000000000000000");
    // await getFlexPollingVotingWeight();
    // await createFlexFundingProposal("0x184880303fb84e4b7b0514986d5ee8324041d8d0");
    // await createVintageFundRaiseProposal("0x6e4cb966280ffdaa3b6ebdc18bcf4d8815ab8979");
    // await createVintageFundingProposal("0xd19e4460b6252acecf593a15271855087b8ec324");
    // await getFlexVestingInfo("0x3da2bba64ff896ab9883537652439dadbfd602bc", "0x52439dadbfd602bc496e766573746d656e742333000000000000000000000000");
    // await ifFlexVestingElegible();
    // await getVintageSetApproveAmount();
    // await fetchBathETHBalance();
    // await isVintageRedemptPeriod("0xf58f10d311b5fbaa73ef021ce891b3c3dd98858d");
    // await getVintageEscrowTokenInfo();
    // await getvintageFundingReturnTokenApprovedAmount(
    //     "0x82d1f2b12c1b35cf06d5d3f9559c75c3d3a47c89",
    //     "0x559c75c3d3a47c8946756e64696e672331000000000000000000000000000000",
    //     "0x9ac9c636404c8d46d9eb966d7179983ba5a3941a",
    //     "0x47ac6a76383661f64a880f6eab189f9a7e327b59"
    // );

    // await getVintageEscorwFundAmount();

    // await checkStewardWhitelist();
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

    // await voteForFundingProposal("0xff81fca6050a4dfc654865fcbb2400dc888b74d3",
    //     "0x46756e64696e6723380000000000000000000000000000000000000000000000",
    //     1);
    // await processFundingProposal("0xff81fca6050a4dfc654865fcbb2400dc888b74d3",
    //     "0x46756e64696e6723380000000000000000000000000000000000000000000000");
    // await deposit("0xff81fca6050a4dfc654865fcbb2400dc888b74d3",
    //     "0x46756e64696e6723380000000000000000000000000000000000000000000000");

    // await createVesting("0xe8f1df25a257bc72c005bb982ccb5cc5a1695095",
    //     "0x46756e64696e6723323700000000000000000000000000000000000000000000");

    // await submitCollectiveInvestorCapDaosetProposal("0xb5f7af74f8429f36153d28281fa2bf9476450189");
    // await getCollectiveGovernorManagementProposalInfo(
    //     "0x2f5f521d00de170ef77a0a16302893fd7ad3eaf3",
    //     "0x302893fd7ad3eaf3476f7665726e6f722d496e23310000000000000000000000"
    // );
    // await getCollectiveProtocolFeeAndAccount();
    // await getVintageInvestors();
    // await getVintageAdapterAddress("0xa2ed0c515d7fec2a0269a56790926b0314673f75");
    // await getFlexDaosetPropsalInfo();
    // await getVintageManagementFee();
    // await createDaosetProposal();
    // await getAdapterAddress("0xfe362eb2f01fdbacea61e5102e9a4eb14ca748ba");
    // await getDaoInfo("0xEd0B0ADE001Dd4C004d3e454e9BE52e3ACc1bA35");
    // await getFlexdaoInvestorWhitelist();
    // await submitVintageDaosetProposal();
    // await getVintageDaosetProposal();
    // await getFlexPollingVotingWeight();
    // await createFlexVesting(
    //     "0x184880303fb84e4b7b0514986d5ee8324041d8d0",
    //     "0x6d5ee8324041d8d0496e766573746d656e742331000000000000000000000000",
    //     "0xDF9DFA21F47659cf742FE61030aCb0F15f659707"
    // );
    // await ifFlexVestingElegible();
    // await getVintageSetApproveAmount();
    // await fetchBathETHBalance();
    // await getVintageEscrowTokenInfo();
    // await getvintageFundingReturnTokenApprovedAmount(
    //     "0x82d1f2b12c1b35cf06d5d3f9559c75c3d3a47c89",
    //     "0x559c75c3d3a47c8946756e64696e672331000000000000000000000000000000",
    //     "0x9ac9c636404c8d46d9eb966d7179983ba5a3941a",
    //     "0x47ac6a76383661f64a880f6eab189f9a7e327b59"
    // );

    // await getVintageEscorwFundAmount();

    // await checkStewardWhitelist();
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

    // await voteForFundingProposal("0xff81fca6050a4dfc654865fcbb2400dc888b74d3",
    //     "0x46756e64696e6723380000000000000000000000000000000000000000000000",
    //     1);
    // await processFundingProposal("0xff81fca6050a4dfc654865fcbb2400dc888b74d3",
    //     "0x46756e64696e6723380000000000000000000000000000000000000000000000");
    // await deposit("0xff81fca6050a4dfc654865fcbb2400dc888b74d3",
    //     "0x46756e64696e6723380000000000000000000000000000000000000000000000");

    // await createVesting("0xe8f1df25a257bc72c005bb982ccb5cc5a1695095",
    //     "0x46756e64696e6723323700000000000000000000000000000000000000000000");

    // await collectiveVestInfo("0xd8d1c59de10b73402ab3b785892c27f302300c86",
    //     "0x892c27f302300c86496e766573746d656e742331000000000000000000000000");
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
    const summonDaoContractAddress = "0x8a3F90dcd9726f014064106cCdaF86741111C99f";

    const summonDaoContract = await (await hre.ethers.getContractFactory("SummonVintageDao"))
        .attach(summonDaoContractAddress);


    const vintageFundRaiseAdapterContract = "0xE0cF64d485BC72Fd2Ce537Ec850c2F1950EF9f5D"
    const vintageFundingPoolAdapterContract = "0x33AcD69378D11DB6dFEF4Af2f80E3223F5C7D58f"
    const vintageVotingAdapterContract = "0x5025e698c0475a4Dde679B94f74b46d29D753a16"
    const vintageRaiserManagementContract = "0x45d7C1d0b0B0ec75Ccb642150803A7D0a6d48D8D"
    const VintageFundingAdapterContract = "0xC64c77dF7faa16c51E581B3461c77C2Cfd3106F6"
    const vintageAllocationAdapterContract = "0x0deE409D5A21CcAD056D3ad51E0200e671c22b4D"
    const vintageVestingContract = "0x7dd8e41164C2eEAC7E2BdAbb53ed10816e240f6C"
    const bentoBoxV1 = "0x8ed6b538357889cFddFfF4a26633982eE74EBa73"
    const vintageEscrowFundAdapterContract = "0xd6ba2029fa0DD5C55B79cE2dB27E9e08e09A1b5f"
    const vintageDistrubteAdapterContract = "0xd49e068c77F2b5eE53F014554e493313d59A7E9E"
    const vintageRaiserAllocation = "0xfEA36Da2805A57216cc610eac89447a79aBeD5c8"
    const vintageFundingReturnTokenAdapterContract = "0x6e1Dd516Df25DF3FedD4a796757D7E3d626F9626"
    const vintageFreeInEscrowFundAdapterContract = "0xDAEaaF1FA8f073C8052cc7f97714549D888C4818"
    const vintageFundingPoolAdapterHelperContract = "0x992689E660A74CEBd0C033AC636EfC3A3668F7d8"
    const vintageDaoSetAdapterContract = "0x11b619094E9c54934938EEa6763baF52866E9e3e"
    const vintageDaoSetHelperAdapterContract = "0x276B8E87b54f2a15Ccad861704D3f27bfd9a32Db"
    const vintageFundingPoolFactory = "0x1D18ebD31799A3716d6be27f5df9794DEDE627Ad"

    const enableAdapters = [
        {
            id: '0xa837e34a29b67bf52f684a1c93def79b84b9c012732becee4e5df62809df64ed', //fund raise
            addr: vintageFundRaiseAdapterContract,
            flags: 1034
        },
        {
            id: '0xaaff643bdbd909f604d46ce015336f7e20fee3ac4a55cef3610188dee176c892', //vintageFundingPoolAdapterContract
            addr: vintageFundingPoolAdapterContract,
            flags: 8
        },
        {
            id: '0xd3999c37f8f35da86f802a74f9bf032c4aeb46e49abd9c861f489ef4cb40d0a8', //vintageVotingAdapterContract
            addr: vintageVotingAdapterContract,
            flags: 258
        },
        {
            id: '0xd90e10040720d66c9412cb511e3dbb6ba51669248a7495e763d44ab426893efa', //vintageRaiserManagementContract
            addr: vintageRaiserManagementContract,
            flags: 6346
        },
        {
            id: '0x0fd8cce4ef00a7a8c0c5f91194bc80f122deefe664dd2a2384687da62ab117d1', //VintageFundingAdapterContract
            addr: VintageFundingAdapterContract,
            flags: 770
        },
        {
            id: '0x99d271900d627893bad1d8649a7d7eb3501c339595ec52be94d222433d755603', //vintageAllocationAdapterContract
            addr: vintageAllocationAdapterContract,
            flags: 0
        },
        {
            id: '0x8295fbcf0c0d839b7cf11cacb43f22c81604fd9f0e4b295ff1d641ad9dd5786a', //vintageVestingContract
            addr: vintageVestingContract,
            flags: 0
        },
        {
            id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
            addr: bentoBoxV1,
            flags: 0
        },
        {
            id: '0xf03649ccf5cbda635d0464f73bc807b602819fde8d2e1387f87b988bb0e858a3', // vintageEscrowFundAdapterContract
            addr: vintageEscrowFundAdapterContract,
            flags: 0
        },
        {
            id: '0xe1cf6669e8110c379c9ea0aceed535b5ed15ea1db2447ab3fbda96c746d21a1a', // vintageDistrubteAdapterContract
            addr: vintageDistrubteAdapterContract,
            flags: 0
        },
        {
            id: '0x1fa6846b165d822fff79e37c67625706652fa9380c2aa49fd513ce534cc72ed4', // vintageRaiserAllocation
            addr: vintageRaiserAllocation,
            flags: 0
        },
        {
            id: '0xde483f9dde6f6b12a62abdfd75010c5234f3ce7693a592507d331ec725f77257', // vintageFundingReturnTokenAdapterContract
            addr: vintageFundingReturnTokenAdapterContract,
            flags: 0
        },
        {
            id: '0x6a687e96f72a484e38a32d2ee3b61626294e792821961a90ce9a98d1999252d5', //vintageFreeInEscrowFundAdapterContract
            addr: vintageFreeInEscrowFundAdapterContract,
            flags: 0
        },
        {
            id: '0xe70101dfebc310a1a68aa271bb3eb593540746781f9eaca3d7f52f31ba60f5d1', //vintageFundingPoolAdapterHelperContract
            addr: vintageFundingPoolAdapterHelperContract,
            flags: 0
        },
        {
            id: '0x77cdf6056467142a33aa6f753fc1e3907f6850ebf08c7b63b107b0611a69b04e', //vintageDaoSetAdapterContract
            addr: vintageDaoSetAdapterContract,
            flags: 122890
        },
        {
            id: '0x145d8ebc4d7403f3cd60312331619ffb262c52c22bedf24c0148027dd4be3b01', //vintageDaoSetHelperAdapterContract
            addr: vintageDaoSetHelperAdapterContract,
            flags: 8
        }
    ];

    const adapters1 = [
        {
            id: '0x161fca6912f107b0f13c9c7275de7391b32d2ea1c52ffba65a3c961880a0c60f',
            addr: vintageFundingPoolAdapterContract, //vintageFundingPoolAdapterContract
            flags: 23
        },
        {
            id: '0x161fca6912f107b0f13c9c7275de7391b32d2ea1c52ffba65a3c961880a0c60f',
            addr: VintageFundingAdapterContract, //VintageFundingAdapterContract
            flags: 14
        },
        {
            id: '0x161fca6912f107b0f13c9c7275de7391b32d2ea1c52ffba65a3c961880a0c60f',
            addr: vintageDistrubteAdapterContract, // vintageDistrubteAdapterContract
            flags: 22
        }
    ];

    const vintageDaoParams = [
        '20240920-create-from-script',//name
        '0xDF9DFA21F47659cf742FE61030aCb0F15f659707',//creator
        [
            '0x6F0643bc2Fc62103f24DF49876d35Fab5FfE7208',
            '0x37ADB008B1EeE489Cdcd1e753a68E2f133771DA3'
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
        [100, 100, 100],//allocations
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
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

const createVintageFundRaiseProposal = async (daoAddress) => {
    const daoCont = await (await hre.ethers.getContractFactory("DaoRegistry"))
        .attach(daoAddress);
    const fundRaiseContractAddr = await daoCont.getAdapterAddress("0xa837e34a29b67bf52f684a1c93def79b84b9c012732becee4e5df62809df64ed");
    const fundRaiseContract = await (await hre.ethers.getContractFactory("VintageFundRaiseAdapterContract"))
        .attach(fundRaiseContractAddr);


    // if (
    //     params.proposalFundRaiseInfo.fundRaiseMinTarget <= 0 ||
    //     (params.proposalFundRaiseInfo.fundRaiseMaxCap > 0 &&
    //         params.proposalFundRaiseInfo.fundRaiseMaxCap <
    //         params.proposalFundRaiseInfo.fundRaiseMinTarget) ||
    //     params.proposalFundRaiseInfo.lpMinDepositAmount < 0 ||
    //     (params.proposalFundRaiseInfo.lpMaxDepositAmount > 0 &&
    //         params.proposalFundRaiseInfo.lpMaxDepositAmount <=
    //         params.proposalFundRaiseInfo.lpMinDepositAmount) ||
    //     params.proposalTimeInfo.startTime < block.timestamp ||
    //     params.proposalTimeInfo.endTime <
    //     params.proposalTimeInfo.startTime ||
    //     params.proposalTimeInfo.fundTerm <= 0 ||
    //     params.proposalTimeInfo.redemptPeriod >
    //     params.proposalTimeInfo.redemptInterval ||
    //     params.proposalTimeInfo.redemptInterval >
    //     params.proposalTimeInfo.fundTerm ||
    //     params.proposalTimeInfo.refundPeriod >=
    //     params.proposalTimeInfo.fundTerm ||
    //     params.proposalFeeInfo.managementFeeRatio >= 10 ** 18 ||
    //     params.proposalFeeInfo.managementFeeRatio < 0 ||
    //     params.proposalFeeInfo.redepmtFeeRatio >= 10 ** 18 ||
    //     params.proposalFeeInfo.redepmtFeeRatio < 0 ||
    //     params.proposerReward.fundFromInverstor < 0 ||
    //     params.proposerReward.fundFromInverstor >= 10 ** 18 ||
    //     params.proposerReward.projectTokenFromInvestor < 0 ||
    //     params.proposerReward.projectTokenFromInvestor >= 10 ** 18
    // ) {
    //         revert INVALID_PARAM();
    // }

    const fundRaiseMinTarget = hre.ethers.utils.parseEther("1000");
    const fundRaiseMaxCap = hre.ethers.utils.parseEther("20000");
    const lpMinDepositAmount = hre.ethers.utils.parseEther("100");
    const lpMaxDepositAmount = hre.ethers.utils.parseEther("100000");
    const fundRaiseType = 0; // 0 FCFS 1 Free In

    //submit fund raise proposal
    const proposalFundRaiseInfo = [
        fundRaiseMinTarget,
        fundRaiseMaxCap,
        lpMinDepositAmount,
        lpMaxDepositAmount,
        fundRaiseType // 0 FCFS 1 Free In
    ];
    let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

    const startTime = blocktimestamp + 60 * 1;
    const endTime = startTime + 60 * 8;
    const fundTerm = 60 * 60 * 24;
    const redemptPeriod = 60 * 5;
    const redemptInterval = 60 * 60 * 2;
    const returnPeriod = 60 * 60 * 1;
    const proposalTimeInfo = [
        startTime,
        endTime,
        fundTerm,
        redemptPeriod,
        redemptInterval,
        returnPeriod
    ];

    const managementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%
    const returnTokenmanagementFeeRatio = hre.ethers.utils.parseEther("0.004"); //0.4%

    const redepmtFeeRatio = hre.ethers.utils.parseEther("0.002");
    const proposalFeeInfo = [
        managementFeeRatio,
        returnTokenmanagementFeeRatio,
        redepmtFeeRatio
    ];


    const managementFeeAddress = "0xDF9DFA21F47659cf742FE61030aCb0F15f659707";
    const fundRaiseTokenAddress = "0xFCe5FdEbF0fe1ff0674A1294D5Cd8018A0e30cD6";
    const proposalAddressInfo = [
        managementFeeAddress,
        fundRaiseTokenAddress
    ];

    const fundFromInverstor = hre.ethers.utils.parseEther("0.004");
    const projectTokenFromInvestor = hre.ethers.utils.parseEther("0.004");
    const proposerReward = [
        fundFromInverstor,
        projectTokenFromInvestor
    ];

    const enalbePriorityDeposit = false;
    const vtype = 1; // 0 erc20 1 erc721 2 erc1155 3 whitelist
    const token = ZERO_ADDRESS;
    const tokenId = 0;
    const amount = 2;
    const priorityDepositeWhitelist = [];
    const proposalPriorityDepositInfo = [
        enalbePriorityDeposit,
        vtype,
        token,
        tokenId,
        amount,
        priorityDepositeWhitelist
    ];

    const fundRaiseParams = [
        daoAddress,
        proposalFundRaiseInfo,
        proposalTimeInfo,
        proposalFeeInfo,
        proposalAddressInfo,
        proposerReward,
        proposalPriorityDepositInfo
    ],

    const tx = await fundRaiseContract.submitProposal(fundRaiseParams, { gasLimit: 2100000 });
    const result = await tx.wait();

    const newFundRaiseProposalId = result.events[result.events.length - 1].args.proposalId;
    console.log(`new Fund Raise ProposalId ${newFundRaiseProposalId}`);
}

const createVintageFundingProposal = async (daoAddr) => {

    const daoCont = await (await hre.ethers.getContractFactory("DaoRegistry"))
        .attach(daoAddr);
    const fundingContraAddr = await daoCont.getAdapterAddress(
        "0x0fd8cce4ef00a7a8c0c5f91194bc80f122deefe664dd2a2384687da62ab117d1");
    const VintageFundingAdapterContract = (await hre.ethers.getContractFactory("VintageFundingAdapterContract"
        , {
            libraries: {
                InvestmentLibrary: "0x17D77f85FE592A5f2E3a6BF473A20Ed01E19B8Da",
            }
        })).attach(fundingContraAddr);

    // const p = await daoCont.proposals("0x0b4613b8bebaa3b2496e766573746d656e742331000000000000000000000000");
    const proposalInfo = await VintageFundingAdapterContract.proposals(daoAddr,
        "0x271855087b8ec324496e766573746d656e742331000000000000000000000000");
    console.log(proposalInfo);

    return;
    const requestedFundAmount = hre.ethers.utils.parseEther("200.39");

    let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

    const vestingStartTime = blocktimestamp + 60 * 1;
    const vetingEndTime = vestingStartTime + 60 * 60 * 2;
    const vestingCliffEndTime = vestingStartTime + 60 * 10;
    const vestingInterval = 60 * 10;

    const vestingCliffLockAmount = hre.ethers.utils.parseEther("0.3");

    const projectTeamTokenAddr = "0x32Bf9E40E6b94419f2E49DD112231BFAEcAC3B6C";
    const fundingTokenAddr = "0xFCe5FdEbF0fe1ff0674A1294D5Cd8018A0e30cD6";
    const vestingNFTAddr = "0xB55f014b7248992774A344C674bA056c9854cD5b";
    blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

    const approver = "0xDF9DFA21F47659cf742FE61030aCb0F15f659707";
    const escrow = true;
    const price = hre.ethers.utils.parseEther("0.3");
    const enableVestingNFT = true;
    const receiver = "0xDF9DFA21F47659cf742FE61030aCb0F15f659707";

    const fundingInfo = [
        requestedFundAmount,
        fundingTokenAddr,
        receiver
    ]

    const returnTokenInfo = [
        escrow,
        projectTeamTokenAddr,
        price,
        "0",
        approver,
        enableVestingNFT,
        vestingNFTAddr
    ];


    const vestingInfo = [
        "Mantle Staked ETH",
        "A permissionless, non-custodial ETH liquid staking protocol deployed on Ethereum L1 and governed by Mantle.        ",
        vestingStartTime,
        vetingEndTime,
        vestingCliffEndTime,
        vestingCliffLockAmount,
        vestingInterval
    ]
    const params = [fundingInfo, returnTokenInfo, vestingInfo]

    const tx = await VintageFundingAdapterContract.submitProposal(daoAddr, params);
    const result = await tx.wait();
    const proposalId = result.events[result.events.length - 1].args.proposalId;

    console.log("investment proposalId ", proposalId);
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
    const _daoName = 'test-flex-script0920-01';

    // const FlexVesting = '0x0b371C3c1E21Ad2b1E164d99265843fc41a201Be'
    const FlexVesting = '0x7a5D2ccEE130baa35Da1F66EEb4a0c15F563FdA3'
    const FlexERC721 = '0x68E7A22f132FE314E49feEc4640d574119184D37'
    const FlexAllocationAdapterContract = '0x619c4619c82B3d9817113AEF1d66e461d0146b03'
    const FlexFundingPoolAdapterContract = '0x5641A5dbD7Af74Ac9A2A4105F017696b0ef3a980'
    const FlexVotingContract = '0x77105d55C3D2Ad0C06D0757833484043C273b48A'
    const FlexPollingVotingContract = '0x022D72904015115e332eD10d8Bc76505634b18d4'
    const FlexFundingAdapterContract = '0x6E8acc8ecE34B4be998b225510D4c1b53496E36a'
    const bentoBoxV1 = '0x8ed6b538357889cFddFfF4a26633982eE74EBa73'
    const StewardMangement = '0xDe613208A2391c1c0BCD24A1354ACbE0057E5169'
    const flexStewardAllocationAdapter = '0x2233a976E362c380549852073f404c7835162C3f'
    const flexFundingReturnTokenAdapter = '0x883B0218F3D2A74f6904bD281077E122952cB409'
    const flexFreeInEscrowFundAdapterContract = '0x4eb495209dD39bCCf6B5f916971d28B33072FFe6'
    const flexFundingHelperAdapterContract = '0x54D6773F5CE1431647E95da0f11BE1755624FC26'
    const flexDaoSetHelperAdapterContract = '0x8be919827A25ed95072e7364161206e458D034D3'
    const flexDaoSetPollingAdapterContract = '0xC6EC4D4A1c51018F0a1Fb566ee6cEdFf7344fa47'
    const flexDaoSetVotingAdapterContract = '0xb3B93589c2CF07f6714Ad48C4Da367f830758D65'
    const flexDaoSetFeesAdapterContract = '0x473EE4F1b3a3C3B6C3625062AEa3E0176A0f59ad'
    const flexDaoSetGovernorMembershipAdapterContract = '0x783383d339099ec3c6237774B1458E21c4C8Afa4'
    const flexDaoSetInvestorCapAdapterContract = '0xDE25B3A519c0527555f4fe9C5f84fB0eAda6091F'
    const flexDaoSetInvestorMembershipAdapterContract = '0x5F009752f3e776af80f395f2124c6f665edda7b4'
    const flexDaoSetProposerMembershipAdapterContract = '0x030E8331c46191aBF02120dfd1717d5009d31f11'
    const flexGovernorVotingAssetAllocationProposalAdapterContract = '0x1fb975084EC7B14E7EAc4D114fD179F3a06C0174'
    const flexSetRiceReceiverProposalAdapterContract = '0x67db7c011Af1c2a9A919b1A28fF99F65B5eFbD30'

    // const flexFundingPoolFactory = "0xd6cFCF1F4B097c9FBF6A2A619E05c40fA6e4419a";
    const flexFundingPoolFactory = "0x4b57c1e8f1C9B314BECe1b9A178cEE22e431f5be";

    const daoFactory = "0x6F0643bc2Fc62103f24DF49876d35Fab5FfE7208";

    const summonFlexContractAddr = "0x58804cfa15228F36a5bF14ecf04608fa23214ce1";
    const daoFactoriesAddress = [
        daoFactory,//this.daoFactory.address,
        flexFundingPoolFactory//this.flexFundingPoolFactory.address
    ];

    const enalbeAdapters = [
        {
            id: '0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd', //FlexVesting
            addr: FlexVesting,
            flags: 0
        },
        {
            id: '0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35', //FlexERC721
            addr: FlexERC721,
            flags: 0
        },
        {
            id: '0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8', //FlexAllocationAdapterContract
            addr: FlexAllocationAdapterContract,
            flags: 0
        },
        {
            id: '0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c', //FlexFundingPoolAdapterContract
            addr: FlexFundingPoolAdapterContract,
            flags: 0
        },
        {
            id: '0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7', //FlexVotingContract
            addr: FlexVotingContract,
            flags: 258
        },
        {
            id: '0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610', //FlexPollingVotingContract
            addr: FlexPollingVotingContract,
            flags: 258
        },
        {
            id: '0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda', //FlexFundingAdapterContract
            addr: FlexFundingAdapterContract,
            flags: 770
        },
        {
            id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
            addr: bentoBoxV1,
            flags: 0
        },
        {
            id: '0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753', //StewardMangement
            addr: StewardMangement,
            flags: 6338
        },
        {
            id: '0x37cbe06c1044f98864ea25736326bc1d488e24e5e23781ea2ad64c4069cb9e6e', //flexStewardAllocationAdapter
            addr: flexStewardAllocationAdapter,
            flags: 0
        },
        {
            id: '0x43f8439a5cef099d0d9a92b15a64e34ff49963bb29d65f63204eda6591b810a1', //flexFundingReturnTokenAdapter
            addr: flexFundingReturnTokenAdapter,
            flags: 0
        },
        {
            id: '0xeae11da953333a83b6467e2193334fb302549e1a42ad5797082aea1ab6be9120', //flexFreeInEscrowFundAdapterContract
            addr: flexFreeInEscrowFundAdapterContract,
            flags: 0
        },
        {
            id: '0xc8e81510cbc5ec7970040e233b001587da1ea4484a9f7b8710d3322429c2df23', //flexFundingHelperAdapterContract
            addr: flexFundingHelperAdapterContract,
            flags: 0
        },
        {
            id: '0xff9379b98b93eb3bd1fac62fd2258a7955d70d2d5279c40064145b6c9646df37', //flexDaoSetHelperAdapterContract
            addr: flexDaoSetHelperAdapterContract,
            flags: 8
        },
        {
            id: '0x5f0e8d109045653360289a7a02d5dc2a99e382006a42ef93f66de55ecff3176f',// flexDaoSetPollingAdapterContract
            addr: flexDaoSetPollingAdapterContract,
            flags: 262146
        },
        {
            id: '0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7',//flexDaoSetVotingAdapterContract
            addr: flexDaoSetVotingAdapterContract,
            flags: 65538
        },
        {
            id: '0xc6bb47f9566baa74b5032b5c10e5bf4a1e2382ca337c2de674732f6401d52cc0',//flexDaoSetFeesAdapterContract
            addr: flexDaoSetFeesAdapterContract,
            flags: 131074
        },
        {
            id: '0x869e5d18913d4e9bb387c730a04b58d11e95102194f7217a4b684f6e61dff920',//flexDaoSetGovernorMembershipAdapterContract
            addr: flexDaoSetGovernorMembershipAdapterContract,
            flags: 16386
        },
        {
            id: '0x08f2d2eeda0c9072cdba8b58d442503b4cf9eb6c2f74d75e91dc719111c3189c',//flexDaoSetInvestorCapAdapterContract
            addr: flexDaoSetInvestorCapAdapterContract,
            flags: 8194
        },
        {
            id: '0xe6121cbf77e02f965a1829c382f701ad4cec84fbda84c45378db0768d2e40871',//flexDaoSetInvestorMembershipAdapterContract
            addr: flexDaoSetInvestorMembershipAdapterContract,
            flags: 32770
        },
        {
            id: '0xf3ce48289b9021e92bc5661ccf481e756dcb8de846c2eb9620bb83917cab5237',//flexDaoSetProposerMembershipAdapterContract
            addr: flexDaoSetProposerMembershipAdapterContract,
            flags: 524290
        },
        {
            id: '0xa34105560351082ce6b5540bff167edddf0aae5c59e0db3cd4ab748b5ae9b1c9',//flexGovernorVotingAssetAllocationProposalAdapterContract
            addr: flexGovernorVotingAssetAllocationProposalAdapterContract,
            flags: 16777226
        },
        {
            id: '0xcdb9c6d5700c127f2c99a75e51af1f56590e1b02f8f6ceee2d51d67dd0e91cad',//flexSetRiceReceiverProposalAdapterContract
            addr: flexSetRiceReceiverProposalAdapterContract,
            flags: 33554442
        }

    ];

    const adapters1 = [{
        id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
        addr: FlexFundingPoolAdapterContract, //FlexFundingPoolAdapterContract
        flags: 75
    },
    {
        id: '0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c',
        addr: FlexFundingAdapterContract, //FlexFundingAdapterContract
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
        "0x32Bf9E40E6b94419f2E49DD112231BFAEcAC3B6C", // address tokenAddress;
        0, // uint256 tokenId;
        [ZERO_ADDRESS] //whiteList;
    ];

    const flexDaoStewardMembershipInfo = [
        1, // bool enable;
        "flexDaoGovernorMembershipName",
        0, // uint256 varifyType;0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
        hre.ethers.utils.parseEther("100"), // uint256 minHolding;
        "0x32Bf9E40E6b94419f2E49DD112231BFAEcAC3B6C", // address tokenAddress;
        0, // uint256 tokenId;
        [ZERO_ADDRESS] // address[] whiteList;
    ];

    const flexDaoVotingInfo = [
        3, //eligibilityType 0. erc20 1.erc721 2.erc1155 3.allocation
        "0x32Bf9E40E6b94419f2E49DD112231BFAEcAC3B6C", //tokenAddress
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
        "0x32Bf9E40E6b94419f2E49DD112231BFAEcAC3B6C", // address tokenAddress;
        0, // uint256 tokenId;
        [ZERO_ADDRESS] //address[] whiteList;
    ];

    const flexDaoPollingInfo = [
        60 * 10, // uint256 votingPeriod;
        0, // uint8 votingPower; 0. quantity 1. log2 2. 1 voter 1 vote
        2, // uint256 superMajority;
        2, // uint256 quorum;
        0, //  uint256 eligibilityType;0. erc20 1.erc721 2.erc1155 3.allocation
        "0x32Bf9E40E6b94419f2E49DD112231BFAEcAC3B6C", //   address tokenAddress;
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
        ["0xDF9DFA21F47659cf742FE61030aCb0F15f659707"] // address[] whiteList;
    ];

    const flexDaoManagementfee = hre.ethers.utils.parseEther("0.01"); // 0.2%
    const returnTokenManagementFee = hre.ethers.utils.parseEther("0.05");
    const flexDaoGenesisStewards = ["0x6f6F8B3b1f9ee48E315A1b7cfdb03e5550E94106"];
    const allocations = [10, 20];

    const fundingPollEnable = false; //DIRECT mode
    const riceRewardReceiver = "0x6f6F8B3b1f9ee48E315A1b7cfdb03e5550E94106";

    const flexDaoInfo = {
        name: _daoName, // string name;
        creator: creator, // address creator;
        flexDaoManagementfee: flexDaoManagementfee, // uint256 flexDaoManagementfee;
        returnTokenManagementFee: returnTokenManagementFee,
        managementFeeAddress: "0x6f6F8B3b1f9ee48E315A1b7cfdb03e5550E94106",
        flexDaoGenesisStewards: flexDaoGenesisStewards, // address[] flexDaoGenesisStewards;
        allocations: allocations,
        riceRewardReceiver: riceRewardReceiver
    }

    const flexDaoPriorityDepositEnalbe = false;

    const flexDaoPriorityDepositMembershipInfo = {
        varifyType: 0, // uint8 varifyType;
        minHolding: hre.ethers.utils.parseEther("1000"), // uint256 minHolding;
        tokenAddress: "0x32Bf9E40E6b94419f2E49DD112231BFAEcAC3B6C", // address tokenAddress;
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

    // console.log(flexDaoParams);

    const summonFlexDaoCont = (await hre.ethers.getContractFactory("SummonDao")).attach(summonFlexContractAddr);
    let tx = await summonFlexDaoCont.summonFlexDao(flexDaoParams);
    let result = await tx.wait();

    const daoFactoryContract = (await hre.ethers.getContractFactory("DaoFactory")).attach(daoFactory);

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
    const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);
    const flexFundingAdapterContAddr = await dao.getAdapterAddress("0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda");
    const flexFundingAdapterContract = (await hre.ethers.getContractFactory("FlexFundingAdapterContract")).attach(flexFundingAdapterContAddr);;


    // await flexFundingAdapterContract.processProposal(daoAddr, "0x5eea97244236b78c496e766573746d656e742333000000000000000000000000");

    // return;
    let tokenAddress = "0x32Bf9E40E6b94419f2E49DD112231BFAEcAC3B6C";
    let minFundingAmount = hre.ethers.utils.parseEther("100");
    let maxFundingAmount = hre.ethers.utils.parseEther("200");
    let escrow = true;
    let returnTokenAddr = "0xFCe5FdEbF0fe1ff0674A1294D5Cd8018A0e30cD6";
    let returnTokenAmount = hre.ethers.utils.parseEther("50");
    let price = hre.ethers.utils.parseEther("1");
    let minReturnAmount = hre.ethers.utils.parseEther("100");
    let maxReturnAmount = hre.ethers.utils.parseEther("200");
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

    let vestingStartTime = blocktimestamp + 60 * 60;
    let vestingCliffEndTime = vestingStartTime + 60 * 5;
    let vestingEndTime = vestingCliffEndTime + 60 * 60 * 1;
    let vestingInterval = 60 * 1;
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

    let fundRaiseType = 0;
    let fundRaiseStartTime = blocktimestamp + 60 * 1;
    let fundRaiseEndTime = fundRaiseStartTime + 60 * 2;
    let minDepositAmount = hre.ethers.utils.parseEther("0");
    let maxDepositAmount = hre.ethers.utils.parseEther("0");
    let backerIdentification = false;

    let bType = 0;
    let bChainId = 1;
    let bTokanAddr = ZERO_ADDRESS;
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
    let pTokenAddr = ZERO_ADDRESS;
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
    const tx = await flexFundingAdapterContract.
        submitProposal(daoAddr, fundingParams);
    const result = await tx.wait();

    // console.log("created...");
    const proposalId = result.events[result.events.length - 1].args.proposalId;
    console.log("created, proposalId ", proposalId);

    console.log("approve...");
    const paybackToken = (await hre.ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
        returnTokenAddr));


    const flexInvestmentPaybackTokenAdapterContractAddr = await dao.getAdapterAddress("0x43f8439a5cef099d0d9a92b15a64e34ff49963bb29d65f63204eda6591b810a1");
    const flexInvestmentPaybackTokenAdapterContract = (await hre.ethers.getContractFactory("FlexInvestmentPaybackTokenAdapterContract")).attach(flexInvestmentPaybackTokenAdapterContractAddr);;


    await paybackToken.approve(
        flexInvestmentPaybackTokenAdapterContractAddr,
        hre.ethers.utils.parseEther("200"));

    await flexInvestmentPaybackTokenAdapterContract.setFundingApprove(
        daoAddr,
        proposalId,
        returnTokenAddr,
        hre.ethers.utils.parseEther("200"));

    console.log("approved..");

}

const getFlexVestingInfo = async (daoAddr, investmentProposalId) => {
    const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).
        attach(daoAddr);

    const flexAllocContrAddr = await daoContract.getAdapterAddress("0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8");

    const flexAllocationAdapterContract = (await hre.ethers.getContractFactory("FlexAllocationAdapterContract")).
        attach(flexAllocContrAddr);

    const managementFee = await daoContract.getConfiguration("0xea659d8e1a730b10af1cecb4f8ee391adf80e75302d6aaeb9642dc8a4a5e5dbb");
    const managementFeeAddress = await daoContract.getAddressConfiguration("0x8987d08c67963e4cacd5e5936c122a968c66853d58299dd822c1942227109839");
    const managementPaybackReward = await flexAllocationAdapterContract.vestingInfos(
        daoAddr,
        investmentProposalId,
        managementFeeAddress
    );

    const proposerPaybackReward = await flexAllocationAdapterContract.vestingInfos(
        daoAddr,
        investmentProposalId,
        "0x06bc456535ec14669c1b116d339226faba08b429"
    );

    const investorPaybackReward = await flexAllocationAdapterContract.getInvestmentRewards(
        daoAddr,
        investmentProposalId,
        "0x06bc456535ec14669c1b116d339226faba08b429"
    )

    const flexVestContrAddr = await daoContract.getAdapterAddress("0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd");
    const flexVestContr = (await hre.ethers.getContractFactory("FlexVesting")).
        attach(flexVestContrAddr);

    const vestClaimableBal = await flexVestContr.vestBalance(9);

    console.log(`
    managementFeeAddress        ${managementFeeAddress}
    managementshares            ${managementPaybackReward[0]}
    managementcreated           ${managementPaybackReward[1]}

    proposerPaybackRewardAmount ${proposerPaybackReward[0]}

    investorPaybackRewardAmount ${investorPaybackReward}

    vestClaimableBal            ${vestClaimableBal}
    `);
}


const ifFlexVestingElegible = async () => {
    const flexAllocationAdapterContract = (await hre.ethers.getContractFactory("FlexAllocationAdapterContract")).
        attach("0x8D0d0f3FDC281Ab1172406015F7306E15f1930e2");

    const rel = await flexAllocationAdapterContract.ifEligible("0x4eb43d54e2a93b32de7fe491f005244a11cfb847",
        "0xf005244a11cfb84746756e64696e672332000000000000000000000000000000", "0xd9f04ec9a0ac241edc631cb0b44f11d17cd13bbe");

    console.log(rel);
}

const createFlexVesting = async (daoAddr, fundingProposalId, receiver) => {
    const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).
        attach(daoAddr);
    const flexVestingContrAddr = await daoContract.getAdapterAddress("0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd");
    const flexVesting = (await hre.ethers.getContractFactory("FlexVesting")).
        attach(flexVestingContrAddr);

    const tx = await flexVesting.createVesting(
        daoAddr,
        receiver,
        fundingProposalId
    );
    const rel = await tx.wait();
    console.log("vestId ", rel.events[rel.events.length - 1].args.vestId);
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


const getFlexPollingVotingWeight = async () => {
    const flexPollingVotingContract = (await hre.ethers.getContractFactory("FlexPollingVotingContract")).
        attach("0x819d88Bf08d54A06962FD1E153F4B05baBCeBC5f");

    const voteWeight = await flexPollingVotingContract.getVotingWeight(
        "0x97b3cdd51c2f4cda1ed165d3f134dc86f38f5711",
        "0xDF9DFA21F47659cf742FE61030aCb0F15f659707");
    console.log(voteWeight);
}

const getFlexFundingProposalInfo = async (daoAddr, proposalId) => {
    const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);

    const flexFundingAdapterContractAddr = await daoContract.getAdapterAddress("0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda");

    const flexFundingAdapterContract = (await hre.ethers.getContractFactory("FlexFundingAdapterContract")).attach(flexFundingAdapterContractAddr);
    let allDone = await flexFundingAdapterContract.allDone(daoAddr);
    let proposal = await flexFundingAdapterContract.Proposals(daoAddr,
        proposalId);
    const FLEX_INVESTMENT_TYPE = await daoContract.getConfiguration("0x16560c56ab40c59c6ee21567e40e89d9059e8d1c5df75d3b95b38ff375501823");
    proposal.fundRaiseInfo.fundRaiseEndTime
    console.log(`
    FLEX_INVESTMENT_TYPE   ${FLEX_INVESTMENT_TYPE}
    state ${proposal.state}
    fundRaiseEndTime  ${proposal.fundRaiseInfo.fundRaiseEndTime}
    allDone  ${allDone}
    `);

    await flexFundingAdapterContract.processProposal(daoAddr, proposalId);

    proposal = await flexFundingAdapterContract.Proposals(
        daoAddr,
        proposalId
    );

    console.log(`
    state ${proposal.state}
    `);

}

const getFlexInvestors = async (daoAddr, fundingProposalId) => {
    const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);;
    const flexFundingPoolExtAddr = await dao.getExtensionAddress("0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c")
    const flexFundingPoolExt = (await hre.ethers.getContractFactory("FlexInvestmentPoolExtension")).attach(flexFundingPoolExtAddr);

    const investors = await flexFundingPoolExt.getInvestorsByProposalId(fundingProposalId);
    console.log(investors);
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

const getFlexDaosetVotingProposalInfo = async () => {
    const flexDaoSetVotingAdapterContract = (await hre.ethers.
        getContractFactory("FlexDaoSetVotingAdapterContract")).attach("0x29c54c97e894ffaf5773c57A9a49108FAC34802f");;
    const proposal = await flexDaoSetVotingAdapterContract.votingProposals(
        "0xc21ba671b7b97ab7dFAd8Ea46b5E493De5e67355",
        "0x6b5e493de5e67355566f74696e67202331000000000000000000000000000000"
    );

    console.log(proposal);
}

const getFlexAllGovernor = async () => {
    const stewardManagementContract = (await hre.ethers.getContractFactory("StewardManagementContract")).attach("0xa04013491650f8777af094379A884F4327C99554");;
    const governors = await stewardManagementContract.getAllSteward("0xde9486e6a30cab42972b5bf561c00139ed138012");
    console.log(governors);
}

const getFlexdaoInvestorWhitelist = async () => {
    const flexInvestomentPoolContrct = (await hre.ethers.
        getContractFactory("FlexInvestmentPoolAdapterContract")).attach("0x2b4897ce0a178bf100bb1510b699850e3c46fdab");
    const rel = await flexInvestomentPoolContrct.getParticipanWhitelist("0x2b4897ce0a178bf100bb1510b699850e3c46fdab");
    console.log(rel);
}
const getFlexEscrowTokenInfo = async (daoAddr, proposalId, approver, paybackTokenAddr) => {
    const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).
        attach(daoAddr);
    const flexFundingAdapterContractAddr = await daoContract.getAdapterAddress("0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda");
    const FlexInvestmentPaybackTokenAdapterContractAddr = await daoContract.getAdapterAddress("0x43f8439a5cef099d0d9a92b15a64e34ff49963bb29d65f63204eda6591b810a1");
    const flexFundingPoolAdptAddr = await daoContract.getAdapterAddress("0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c");


    const FlexVotingContract = await daoContract.getAdapterAddress("0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7");
    const FlexPollingVotingContractAddr = await daoContract.getAdapterAddress("0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610");

    const flexPollingVotingContract = (await hre.ethers.getContractFactory("FlexPollingVotingContract")).
        attach(FlexPollingVotingContractAddr);
    const voteRel = await flexPollingVotingContract.voteResult(daoAddr, proposalId);
    console.log(voteRel);

    const flexFundingAdapterContract = (await hre.ethers.getContractFactory("FlexFundingAdapterContract")).
        attach(flexFundingAdapterContractAddr);
    const erc20 = (await hre.ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
        paybackTokenAddr));
    const escorwContrct = (await hre.ethers.
        getContractFactory("FlexInvestmentPaybackTokenAdapterContract")).attach(FlexInvestmentPaybackTokenAdapterContractAddr);

    const allDone = await flexFundingAdapterContract.allDone(daoAddr);

    const approvedAmount = await escorwContrct.approvedInfos(
        daoAddr,
        proposalId,
        approver,
        paybackTokenAddr);

    const escrowContractBal = await erc20.balanceOf(approver);

    const allowance = await erc20.allowance(
        approver,
        FlexInvestmentPaybackTokenAdapterContractAddr);

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
        getContractFactory("FlexInvestmentPoolAdapterContract")).attach(flexFundingPoolAdptAddr);
    const poolbal = await flexInvestmentPoolAdapterContract.getTotalFundByProposalId(daoAddr,
        proposalId);
    const protocolFee = toBN("100000000000000000000").mul(hre.ethers.utils.parseEther("0.003")).div(hre.ethers.utils.parseEther("1"));

    console.log(toBN("100000000000000000000").mul(hre.ethers.utils.parseEther("1")).div(hre.ethers.utils.parseEther("0.097")))
    console.log(hre.ethers.utils.parseEther("100").mul(hre.ethers.utils.parseEther("1")).div(toBN("3000000000000000000")));

    const FLEX_POLLVOTER_MEMBERSHIP_TYPE = await daoContract.getConfiguration("0x249486eeae30287051f65673dfa390711fd4587950c33b4150a633763f869724");
    const FLEX_POLLVOTER_MEMBERSHIP_TOKEN_ADDRESS = await daoContract.getAddressConfiguration("0x770ef80745dba2953f780c8b963701e76fd3ac982923200f9214126e80f5f032");
    const FLEX_POLLVOTER_MEMBERSHIP_MIN_HOLDING = await daoContract.getConfiguration("0x6839e94cab6f83f7a12a5a3d1d6f3bbcaf0185a49b20b86e6f47b8c78494ac3d");
    const FLEX_POLL_VOTING_ASSET_TYPE = await daoContract.getConfiguration("0xf873703084a7a9b6b81a595d5038f888fd90f4f9a530d4950a46c89eab021188");
    const FLEX_POLL_VOTING_WEIGHTED_TYPE = await daoContract.getConfiguration("0x18ccfaf5deb9f2b0bd666344fa9c46950fbcee85fbfd05c3959876dfe502c209");
    const FLEX_POLL_VOTING_ASSET_TOKEN_ID = await daoContract.getConfiguration("0x4e640b0dd9bf7618f23df95b8d516df2ff38868970d2d109c5b4b0455980659f");
    const FLEX_POLL_VOTING_ASSET_TOKEN_ADDRESS = await daoContract.getAddressConfiguration("0xa23a2786abcf8c551ce7fba1966ec456144d9caa0db070879d03a4ea4fd9b2fd");
    const FLEX_MANAGEMENT_FEE_TYPE = await daoContract.getConfiguration("0xda34ff95e06cbf2c9c32a559cd8aadd1a10104596417d62c03db2c1258df83d3");
    const FLEX_INVESTMENT_TYPE = await daoContract.getConfiguration("0x16560c56ab40c59c6ee21567e40e89d9059e8d1c5df75d3b95b38ff375501823");
    console.log(`
        FLEX_POLLVOTER_MEMBERSHIP_TYPE           ${FLEX_POLLVOTER_MEMBERSHIP_TYPE}
        FLEX_POLLVOTER_MEMBERSHIP_TOKEN_ADDRESS  ${FLEX_POLLVOTER_MEMBERSHIP_TOKEN_ADDRESS}
        FLEX_POLLVOTER_MEMBERSHIP_MIN_HOLDING    ${FLEX_POLLVOTER_MEMBERSHIP_MIN_HOLDING}
        FLEX_POLL_VOTING_ASSET_TYPE              ${FLEX_POLL_VOTING_ASSET_TYPE}
        FLEX_POLL_VOTING_WEIGHTED_TYPE           ${FLEX_POLL_VOTING_WEIGHTED_TYPE}
        FLEX_POLL_VOTING_ASSET_TOKEN_ID          ${FLEX_POLL_VOTING_ASSET_TOKEN_ID}
        FLEX_POLL_VOTING_ASSET_TOKEN_ADDRESS     ${FLEX_POLL_VOTING_ASSET_TOKEN_ADDRESS}
        FLEX_MANAGEMENT_FEE_TYPE                 ${FLEX_MANAGEMENT_FEE_TYPE}
        FLEX_INVESTMENT_TYPE                     ${FLEX_INVESTMENT_TYPE}

        escrowContractBal ${hre.ethers.utils.formatEther(escrowContractBal)}
        managementFee    ${hre.ethers.utils.formatEther(managementFee)}
        poolbal          ${hre.ethers.utils.formatEther(poolbal)}
        protocolFee      ${hre.ethers.utils.formatEther(protocolFee)}
        allowance        ${hre.ethers.utils.formatEther(allowance)}
        approvedAmount   ${hre.ethers.utils.formatEther(approvedAmount)}
        cashRewardAmount ${hre.ethers.utils.formatEther(proposalInfo.proposerRewardInfo.cashRewardAmount)}
        paybackTokenAmount  ${hre.ethers.utils.formatEther(proposalInfo.investmentInfo.paybackTokenAmount)}
        paybackPrice     ${hre.ethers.utils.formatEther(proposalInfo.investmentInfo.price)}
        fundRaiseType    ${proposalInfo.fundRaiseInfo.fundRaiseType}
        minInvestmentAmount ${hre.ethers.utils.formatEther(proposalInfo.investmentInfo.minInvestmentAmount)}
        allDone          ${allDone}
    `);

    // await flexFundingAdapterContract.processProposal(daoAddr, proposalId);
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


const getFlexCreatedVestinginfo = async () => {
    const daoAddr = "0x451fA357DC545cE6A852Cc23De845BE2322F2551";
    const FlexVestingERC721Addr = "0xC7d41833823E68AeEb6A1FD91a110f19C3040473";
    const daoContrct = (await hre.ethers.
        getContractFactory("DaoRegistry")).attach(daoAddr);
    const flexVestingNFTContrct = (await hre.ethers.
        getContractFactory("FlexVestingERC721")).attach(FlexVestingERC721Addr);

    // const FlexVestingAddr = await daoContrct.getAdapterAddress("0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd");
    const FlexVestingAddr = "0x641eaf535c531bB9aCD468c399e604c28675737B"
    // console.log("FlexVestingAddr ", FlexVestingAddr);
    const flexVestingCont = (await hre.ethers.
        getContractFactory("FlexVesting")).attach(FlexVestingAddr);

    const vestAddr = await flexVestingNFTContrct.vestAddress();
    console.log("vestAddr ", vestAddr);
    console.log("FlexVestingAddr ", FlexVestingAddr);

    const vestId = await flexVestingCont.getVestIdByTokenId(FlexVestingERC721Addr, 1)
    console.log("vestId ", vestId);
    let vestInfo = await flexVestingCont.vests(2);
    const rel = await flexVestingCont.getRemainingPercentage(FlexVestingERC721Addr, 1);
    console.log(vestInfo.vestInfo);
    console.log(vestInfo.timeInfo);

    console.log(rel);

    const netVestId = await flexVestingCont.vestIds();
    console.log("netVestId ", netVestId);

    vestInfo = await flexVestingCont.vests(18);
    console.log(vestInfo);
}

const mintInvestmentReceiptNFT = async () => {
    const investmentReceiptERC721 = (await hre.ethers.
        getContractFactory("InvestmentReceiptERC721")).attach("0xD359D1021478C0a71Ab6F98D4726DDeB5E084876");

    const daoAddr = "0x2b27796e44c389d5089de5a33cb15416021443ae"
    const investmentProposalId = "0x3cb15416021443ae496e766573746d656e742337000000000000000000000000";
    const mode = 2;
    const executedTxHash = "0xa6b242b8c1a8a626ef1b3d6bf308d128637363d60802c5a834308e8fd1cf1feb"
    const projectName = "ABC Finance"
    const description = "ABI Finance is an ecosystem-focused and community-driven DEX built on Arbitrum. It has been built as a highly efficient and customizable protocol, allowing both builders and users to leverage our custom infrastructure for deep, sustainable, and adaptable liquidity. Camelot moves beyond the traditional design of DEXs to focus on offering a tailored approach that prioritises composability."

    await investmentReceiptERC721.safeMint(
        daoAddr,
        investmentProposalId,
        mode,
        executedTxHash,
        projectName,
        description
    );

    console.log("minted..");
}


const getFlexReceiptNFTInfo = async () => {
    const nftContr = (await hre.ethers.
        getContractFactory("FlexInvestmentReceiptERC721")).attach("0xDdB30320A34647b0BC5a172C193C4Cb2931d009E");

    const info = await nftContr.tokenIdToInvestmentProposalInfo(1);

    console.log(info);

}

const getFlexReceiptNFTSVG = async () => {
    const flexInvestmentReceiptERC721Helper = (await hre.ethers.
        getContractFactory("FlexInvestmentReceiptERC721Helper")).attach("0xaD2542263D8ff182B058A059E86160E43Ca32E61");

    const flexInvestmentReceiptERC721 = (await hre.ethers.
        getContractFactory("FlexInvestmentReceiptERC721")).attach("0xa2C4bF6934e2bCc9913253Ff6749365cD35e6816");


    const svg = await flexInvestmentReceiptERC721Helper.getSvg(2, "0xa2C4bF6934e2bCc9913253Ff6749365cD35e6816");
    console.log(svg);

    const tokenURI = await flexInvestmentReceiptERC721.tokenURI(2);
    console.log(tokenURI);
}

const flexDaosetProposal = async (daoAddr, proposalId) => {
    const daoContrct = (await hre.ethers.
        getContractFactory("DaoRegistry")).attach(daoAddr);

    const flexDaoSetVotingAdapterContractAddr = await daoContrct.getAdapterAddress("0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7");

    const daosetVotingContrct = (await hre.ethers.
        getContractFactory("FlexDaoSetVotingAdapterContract")).attach(flexDaoSetVotingAdapterContractAddr);


    const proposal = await daosetVotingContrct.votingProposals(daoAddr, proposalId);
    console.log(proposal);
    // await daosetVotingContrct.processVotingProposal(daoAddr, proposalId);
}

const mintFlexVestingNFT = async () => {
    const flexVestingNFTContrct = (await hre.ethers.
        getContractFactory("FlexVestingERC721")).attach('0x9014876E92D409b7e2822B7A3CF9A4c8a229BB27');

    await flexVestingNFTContrct.safeMint("0xDF9DFA21F47659cf742FE61030aCb0F15f659707");
    console.log("minted...");

    // const svg = await flexVestingNFTContrct.vestAddress()
    // console.log(svg);
}

const submitFlexDaosetVotingProposal = async (daoAddr) => {
    const eligibilityType = 0;
    const tokenAddress = "0x32Bf9E40E6b94419f2E49DD112231BFAEcAC3B6C";
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
        daoAddr,
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


    const daoContrct = (await hre.ethers.
        getContractFactory("DaoRegistry")).attach(daoAddr);

    const flexDaoSetVotingAdapterContractAddr = await daoContrct.getAdapterAddress("0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7");

    const daosetVotingContrct = (await hre.ethers.
        getContractFactory("FlexDaoSetVotingAdapterContract")).attach(flexDaoSetVotingAdapterContractAddr);

    const tx = await daosetVotingContrct
        .submitVotingProposal(
            params
        );

    const result = await tx.wait();
    console.log(result);
    const proposalId = result.events[result.events.length - 1].args.proposalId;

    console.log(proposalId);
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

    // const SummonDao = await hre.ethers.getContractFactory("SummonDao");
    // const summonDao = await SummonDao.deploy();
    // await summonDao.deployed();
    // console.log("summonDao deployed address:", summonDao.address);

    // const SummonVintageDao = await hre.ethers.getContractFactory("SummonVintageDao");
    // const summonVintageDao = await SummonVintageDao.deploy();
    // await summonVintageDao.deployed();
    // console.log("summonVintageDao deployed address:", summonVintageDao.address);

    // const SummonCollectiveDao = await hre.ethers.getContractFactory("SummonCollectiveDao");
    // const summonCollectiveDao = await SummonCollectiveDao.deploy();
    // await summonCollectiveDao.deployed();
    // console.log("summonCollectiveDao deployed address:", summonCollectiveDao.address);


    // const VestingERC721Helper = await hre.ethers.getContractFactory("VestingERC721Helper");
    // const vestingERC721Helper = await VestingERC721Helper.deploy(
    // );
    // await vestingERC721Helper.deployed();
    // console.log("vestingERC721Helper deployed address:", vestingERC721Helper.address);


    // const VestingERC721 = await hre.ethers.getContractFactory("VestingERC721");
    // const vestingERC721 = await VestingERC721.deploy(
    //     "DAOSquare Investment Vesting",
    //     "DIV",
    //     "0x7a5D2ccEE130baa35Da1F66EEb4a0c15F563FdA3",//flexVestingAddr
    //     "0x7dd8e41164C2eEAC7E2BdAbb53ed10816e240f6C",//VintageVestingAddr
    //     "0x39BFE50805dfa290d5911D1d8d703F0e36F1A58D",//CollectiveVestingAddr
    //     vestingERC721Helper.address
    // );
    // await vestingERC721.deployed();
    // console.log("VestingERC721 deployed address:", vestingERC721.address);

    // const InvestmentReceiptERC721Helper = await hre.ethers.getContractFactory("InvestmentReceiptERC721Helper");
    // const investmentReceiptERC721Helper = await InvestmentReceiptERC721Helper.deploy(
    // );
    // await investmentReceiptERC721Helper.deployed();
    // console.log("investmentReceiptERC721Helper deployed address:", investmentReceiptERC721Helper.address);


    // const InvestmentReceiptERC721 = await hre.ethers.getContractFactory("InvestmentReceiptERC721");
    // const investmentReceiptERC721 = await InvestmentReceiptERC721.deploy(
    //     "DAOSquare Investment Receipt",
    //     "DIR",
    //     investmentReceiptERC721Helper.address
    // );
    // await investmentReceiptERC721.deployed();
    // console.log("investmentReceiptERC721 deployed address:", investmentReceiptERC721.address);

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

    // const FlexVestingERC721Helper = await hre.ethers.getContractFactory("FlexVestingERC721Helper");
    // const flexVestingERC721Helper = await FlexVestingERC721Helper.deploy();
    // await flexVestingERC721Helper.deployed();
    // this.flexVestingERC721Helper = flexVestingERC721Helper;
    // console.log("flexVestingERC721Helper deployed address:", flexVestingERC721Helper.address);


    // const FlexVestingERC721 = await hre.ethers.getContractFactory("FlexVestingERC721");
    // const flexVestingERC721 = await FlexVestingERC721.deploy(
    //     "DAOSquare Investment Vesting",
    //     "DIV",
    //     flexVesting.address,
    //     flexVestingERC721Helper.address
    // );
    // await flexVestingERC721.deployed();
    // console.log("flexVestingERC721 deployed address:", flexVestingERC721.address);

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

    // const FlexDaoSetFeesAdapterContract = await hre.ethers.getContractFactory("FlexDaoSetFeesAdapterContract");
    // const flexDaoSetFeesAdapterContract = await FlexDaoSetFeesAdapterContract.deploy();
    // await flexDaoSetFeesAdapterContract.deployed();
    // console.log("flexDaoSetFeesAdapterContract deployed address:", flexDaoSetFeesAdapterContract.address);

    // const FlexDaoSetGovernorMembershipAdapterContract = await hre.ethers.getContractFactory("FlexDaoSetGovernorMembershipAdapterContract");
    // const flexDaoSetGovernorMembershipAdapterContract = await FlexDaoSetGovernorMembershipAdapterContract.deploy();
    // await flexDaoSetGovernorMembershipAdapterContract.deployed();
    // console.log("flexDaoSetGovernorMembershipAdapterContract deployed address:", flexDaoSetGovernorMembershipAdapterContract.address);

    // const FlexDaoSetInvestorCapAdapterContract = await hre.ethers.getContractFactory("FlexDaoSetInvestorCapAdapterContract");
    // const flexDaoSetInvestorCapAdapterContract = await FlexDaoSetInvestorCapAdapterContract.deploy();
    // await flexDaoSetInvestorCapAdapterContract.deployed();
    // console.log("flexDaoSetInvestorCapAdapterContract deployed address:", flexDaoSetInvestorCapAdapterContract.address);

    // const FlexDaoSetInvestorMembershipAdapterContract = await hre.ethers.getContractFactory("FlexDaoSetInvestorMembershipAdapterContract");
    // const flexDaoSetInvestorMembershipAdapterContract = await FlexDaoSetInvestorMembershipAdapterContract.deploy();
    // await flexDaoSetInvestorMembershipAdapterContract.deployed();
    // console.log("flexDaoSetInvestorMembershipAdapterContract deployed address:", flexDaoSetInvestorMembershipAdapterContract.address);

    // const FlexDaoSetProposerMembershipAdapterContract = await hre.ethers.getContractFactory("FlexDaoSetProposerMembershipAdapterContract");
    // const flexDaoSetProposerMembershipAdapterContract = await FlexDaoSetProposerMembershipAdapterContract.deploy();
    // await flexDaoSetProposerMembershipAdapterContract.deployed();
    // console.log("flexDaoSetProposerMembershipAdapterContract deployed address:", flexDaoSetProposerMembershipAdapterContract.address);

    // const FlexGovernorVotingAssetAllocationProposalAdapterContract = await hre.ethers.getContractFactory("FlexGovernorVotingAssetAllocationProposalAdapterContract");
    // const flexGovernorVotingAssetAllocationProposalAdapterContract = await FlexGovernorVotingAssetAllocationProposalAdapterContract.deploy();
    // await flexGovernorVotingAssetAllocationProposalAdapterContract.deployed();
    // console.log("flexGovernorVotingAssetAllocationProposalAdapterContract deployed address:", flexGovernorVotingAssetAllocationProposalAdapterContract.address);

    // const FlexSetRiceReceiverProposalAdapterContract = await hre.ethers.getContractFactory("FlexSetRiceReceiverProposalAdapterContract");
    // const flexSetRiceReceiverProposalAdapterContract = await FlexSetRiceReceiverProposalAdapterContract.deploy();
    // await flexSetRiceReceiverProposalAdapterContract.deployed();
    // console.log("flexSetRiceReceiverProposalAdapterContract deployed address:", flexSetRiceReceiverProposalAdapterContract.address);

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

    // const VintageFundRaiseHelperAdapterContract = await hre.ethers.getContractFactory("VintageFundRaiseHelperAdapterContract");
    // const vintageFundRaiseHelperAdapterContract = await VintageFundRaiseHelperAdapterContract.deploy();
    // await vintageFundRaiseHelperAdapterContract.deployed();
    // console.log("vintageFundRaiseHelperAdapterContract deployed address:", vintageFundRaiseHelperAdapterContract.address);

    // const VintageVotingContract = await hre.ethers.getContractFactory("VintageVotingContract");
    // const vintageVotingContract = await VintageVotingContract.deploy();
    // await vintageVotingContract.deployed();
    // console.log("vintageVotingContract deployed address:", vintageVotingContract.address);


    // const VintageFundingPoolAdapterContract = await hre.ethers.getContractFactory("VintageFundingPoolAdapterContract");
    // const vintageFundingPoolAdapterContract = await VintageFundingPoolAdapterContract.deploy();
    // await vintageFundingPoolAdapterContract.deployed();
    // console.log("vintageFundingPoolAdapterContract deployed address:", vintageFundingPoolAdapterContract.address);


    // const VintageFundingPoolAdapterHelperContract = await hre.ethers.getContractFactory("VintageFundingPoolAdapterHelperContract");
    // const vintageFundingPoolAdapterHelperContract = await VintageFundingPoolAdapterHelperContract.deploy();
    // await vintageFundingPoolAdapterHelperContract.deployed();
    // console.log("vintageFundingPoolAdapterHelperContract deployed address:", vintageFundingPoolAdapterHelperContract.address);

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

    // const VintageVesting = await hre.ethers.getContractFactory("VintageVesting");
    // const vintageVesting = await VintageVesting.deploy();
    // await vintageVesting.deployed();
    // console.log("vintageVesting deployed address:", vintageVesting.address);

    // const VintageVestingERC721Helper = await hre.ethers.getContractFactory("VintageVestingERC721Helper");
    // const vintageVestingERC721Helper = await VintageVestingERC721Helper.deploy();
    // await vintageVestingERC721Helper.deployed();
    // console.log("vintageVestingERC721Helper deployed address:", vintageVestingERC721Helper.address);


    // const VintageVestingERC721 = await hre.ethers.getContractFactory("VintageVestingERC721");
    // const vintageVestingERC721 = await VintageVestingERC721.deploy(
    //     "DAOSquare Investment Vesting",
    //     "DIV",
    //     "0xBFBaaE98b7c4b16bbF1ca950E5B725993c12D2ed",
    //     vintageVestingERC721Helper.address
    // );
    // await vintageVestingERC721.deployed();
    // console.log("vintageVestingERC721 deployed address:", vintageVestingERC721.address);

    // const VintageInvestmentReceiptERC721Helper = await hre.ethers.getContractFactory("VintageInvestmentReceiptERC721Helper");
    // const vintageInvestmentReceiptERC721Helper = await VintageInvestmentReceiptERC721Helper.deploy(
    // );
    // await vintageInvestmentReceiptERC721Helper.deployed();
    // console.log("vintageInvestmentReceiptERC721Helper deployed address:", vintageInvestmentReceiptERC721Helper.address);


    // const VintageInvestmentReceiptERC721 = await hre.ethers.getContractFactory("VintageInvestmentReceiptERC721");
    // const vintageInvestmentReceiptERC721 = await VintageInvestmentReceiptERC721.deploy(
    //     "DAOSquare Investment Receipt",
    //     "DIR",
    //     "0xB40798f82ae5937b7Ab37E37fF9f6Cdc584008C2",
    //     vintageInvestmentReceiptERC721Helper.address
    // );
    // await vintageInvestmentReceiptERC721.deployed();
    // console.log("vintageInvestmentReceiptERC721 deployed address:", vintageInvestmentReceiptERC721.address);


    // const VintageAllocationAdapterContract = await hre.ethers.getContractFactory("VintageAllocationAdapterContract");
    // const vintageAllocationAdapterContract = await VintageAllocationAdapterContract.deploy();
    // await vintageAllocationAdapterContract.deployed();
    // console.log("vintageAllocationAdapterContract deployed address:", vintageAllocationAdapterContract.address);

    // const VintageFundingPoolExtension = await hre.ethers.getContractFactory("VintageFundingPoolExtension");
    // const vintageFundingPoolExtension = await VintageFundingPoolExtension.deploy();
    // await vintageFundingPoolExtension.deployed();
    // console.log("vintageFundingPoolExtension deployed address:", vintageFundingPoolExtension.address);

    // const VintageFundingPoolFactory = await hre.ethers.getContractFactory("VintageFundingPoolFactory");
    // const vintageFundingPoolFactory = await VintageFundingPoolFactory.deploy(vintageFundingPoolExtension.address);
    // await vintageFundingPoolFactory.deployed();
    // console.log("vintageFundingPoolFactory deployed address:", vintageFundingPoolFactory.address);

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

    const VintageDaoSetAdapterContract = await hre.ethers.getContractFactory("VintageDaoSetAdapterContract");
    const vintageDaoSetAdapterContract = await VintageDaoSetAdapterContract.deploy();
    await vintageDaoSetAdapterContract.deployed();
    console.log("vintageDaoSetAdapterContract deployed address:", vintageDaoSetAdapterContract.address);

    // const VintageDaoSetHelperAdapterContract = await hre.ethers.getContractFactory("VintageDaoSetHelperAdapterContract");
    // const vintageDaoSetHelperAdapterContract = await VintageDaoSetHelperAdapterContract.deploy();
    // await vintageDaoSetHelperAdapterContract.deployed();
    // console.log("vintageDaoSetHelperAdapterContract deployed address:", vintageDaoSetHelperAdapterContract.address);

    // const VintageGovernorVotingAssetAllocationProposalAdapterContract = await hre.ethers.getContractFactory("VintageGovernorVotingAssetAllocationProposalAdapterContract");
    // const vintageGovernorVotingAssetAllocationProposalAdapterContract = await VintageGovernorVotingAssetAllocationProposalAdapterContract.deploy();
    // await vintageGovernorVotingAssetAllocationProposalAdapterContract.deployed();
    // console.log("vintageGovernorVotingAssetAllocationProposalAdapterContract deployed address:", vintageGovernorVotingAssetAllocationProposalAdapterContract.address);

    // const VintageSetRiceReceiverProposalAdapterContract = await hre.ethers.getContractFactory("VintageSetRiceReceiverProposalAdapterContract");
    // const vintageSetRiceReceiverProposalAdapterContract = await VintageSetRiceReceiverProposalAdapterContract.deploy();
    // await vintageSetRiceReceiverProposalAdapterContract.deployed();
    // console.log("vintageSetRiceReceiverProposalAdapterContract deployed address:", vintageSetRiceReceiverProposalAdapterContract.address);

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
    // await collectivePa˚ybackTokenAdapterContract.deployed();
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


    // const CollectiveInvestmentPoolExtension = await hre.ethers.getContractFactory("CollectiveInvestmentPoolExtension");
    // const collectiveInvestmentPoolExtension = await CollectiveInvestmentPoolExtension.deploy();
    // await collectiveInvestmentPoolExtension.deployed();
    // console.log("collectiveInvestmentPoolExtension deployed address:", collectiveInvestmentPoolExtension.address);

    // const CollectiveFundingPoolFactory = await hre.ethers.getContractFactory("CollectiveFundingPoolFactory");
    // const collectiveFundingPoolFactory = await CollectiveFundingPoolFactory.deploy(collectiveInvestmentPoolExtension.address);
    // await collectiveFundingPoolFactory.deployed();
    // console.log("collectiveFundingPoolFactory deployed address:", collectiveFundingPoolFactory.address);

    // const CollectiveFreeInEscrowFundAdapterContract = await hre.ethers.getContractFactory("CollectiveFreeInEscrowFundAdapterContract");
    // const collectiveFreeInEscrowFundAdapterContract = await CollectiveFreeInEscrowFundAdapterContract.deploy();
    // await collectiveFreeInEscrowFundAdapterContract.deployed();
    // console.log("collectiveFreeInEscrowFundAdapterContract deployed address:", collectiveFreeInEscrowFundAdapterContract.address);

    // const ColletiveClearFundProposalAdapterContract = await hre.ethers.getContractFactory("ColletiveClearFundProposalAdapterContract");
    // const colletiveClearFundProposalAdapterContract = await ColletiveClearFundProposalAdapterContract.deploy();
    // await colletiveClearFundProposalAdapterContract.deployed();
    // console.log("colletiveClearFundProposalAdapterContract deployed address:", colletiveClearFundProposalAdapterContract.address);

    // const CollectiveRedemptionFeeEscrowAdapterContract = await hre.ethers.getContractFactory("CollectiveRedemptionFeeEscrowAdapterContract");
    // const collectiveRedemptionFeeEscrowAdapterContract = await CollectiveRedemptionFeeEscrowAdapterContract.deploy();
    // await collectiveRedemptionFeeEscrowAdapterContract.deployed();
    // console.log("collectiveRedemptionFeeEscrowAdapterContract deployed address:", collectiveRedemptionFeeEscrowAdapterContract.address);

    // const ColletiveSetRiceReceiverProposalAdapterContract = await hre.ethers.getContractFactory("ColletiveSetRiceReceiverProposalAdapterContract");
    // const colletiveSetRiceReceiverProposalAdapterContract = await ColletiveSetRiceReceiverProposalAdapterContract.deploy();
    // await colletiveSetRiceReceiverProposalAdapterContract.deployed();
    // console.log("colletiveSetRiceReceiverProposalAdapterContract deployed address:", colletiveSetRiceReceiverProposalAdapterContract.address);


    // const ManualVesting = await hre.ethers.getContractFactory("ManualVesting");
    // const manualVesting = await ManualVesting.deploy(
    //     "0x78CfFd8A45bc890a14f8F29029F87dBeE3577fA0",
    //     "0xD359D1021478C0a71Ab6F98D4726DDeB5E084876"
    // );
    // await manualVesting.deployed();
    // console.log("manualVesting deployed address:", manualVesting.address);


    // const ManualVestingERC721SVGHelper = await hre.ethers.getContractFactory("ManualVestingERC721SVGHelper");
    // const manualVestingERC721SVGHelper = await ManualVestingERC721SVGHelper.deploy();
    // await manualVestingERC721SVGHelper.deployed();
    // this.manualVestingERC721SVGHelper = manualVestingERC721SVGHelper;
    // console.log("manualVestingERC721SVGHelper deployed address: ", manualVestingERC721SVGHelper.address);

    // const ManualVestingERC721TokenUriHelper = await hre.ethers.getContractFactory("ManualVestingERC721TokenURIHelper");
    // const manualVestingERC721TokenUriHelper = await ManualVestingERC721TokenUriHelper.deploy();
    // await manualVestingERC721TokenUriHelper.deployed();
    // this.manualVestingERC721TokenUriHelper = manualVestingERC721TokenUriHelper;
    // console.log("manualVestingERC721TokenUriHelper deployed address: ", manualVestingERC721TokenUriHelper.address);

    // const ManualVestingERC721 = await hre.ethers.getContractFactory("ManualVestingERC721");
    // const manualVestingERC721 = await ManualVestingERC721.deploy(
    //     "DAOSquare Vesting Manual",
    //     "DVM",
    //     "0x5Ec3A0aB6286F2199352AA2dbdB8474faE34EFfA",
    //     manualVestingERC721TokenUriHelper.address,
    //     manualVestingERC721SVGHelper.address
    // );
    // await manualVestingERC721.deployed();
    // this.manualVestingERC721 = manualVestingERC721;
    // console.log("manualVestingERC721 deployed address: ", manualVestingERC721.address);
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


const isVintageRedemptPeriod = async (daoAddr) => {
    const daoContract = (await hre.ethers.getContractFactory("DaoRegistry")).
        attach(daoAddr);

    const govs = await daoContract.getAllSteward();
    console.log(govs);
    fundRaiseTarget = await daoContract.getConfiguration(
        "0x31af571e53636dddd77f772cce9d30b42075760f2da731636acc6962da2fbef8"
    );
    const FUND_RAISING_MAX = await daoContract.getConfiguration(
        "0x7e07fb4530796d057ca1d76d83f47aa8629dbb7e942ac28f30ad6f5e9e8d4189"
    );

    const FUND_RAISING_TARGET = await daoContract.getConfiguration(
        "0x31af571e53636dddd77f772cce9d30b42075760f2da731636acc6962da2fbef8"
    );
    const VINTAGE_VOTING_ASSET_TYPE = await daoContract.getConfiguration(
        "0x686efe7bd1699b408d306db6bbee658ed667971c52d48d6912d7ee496e36e627"
    );

    const VINTAGE_PRIORITY_DEPOSITE_TYPE = await daoContract.getConfiguration(
        "0x1710acff43ba8f339e18305d5d5116602e0cf6b226983bae821884b877626aa6"
    );

    const VINTAGE_PRIORITY_DEPOSITE_AMOUNT = await daoContract.getConfiguration(
        "0x20d88b77300b4133cc1f146fdec45d5266086bc18b256e8e607ef37ec1d047b2"
    );

    const VINTAGE_PRIORITY_DEPOSITE_TOKEN_ADDRESS = await daoContract.getAddressConfiguration(
        "0x3b45967f728449b4fbffd6027f6b8d86035e572016480c7bc2a55edeec4f3ca5"
    );


    const vintageFundingPoolAdapterContractAddr = await daoContract.getAdapterAddress("0xaaff643bdbd909f604d46ce015336f7e20fee3ac4a55cef3610188dee176c892");
    const vintageFundingPoolAdapterContract = (await hre.ethers.getContractFactory("VintageFundingPoolAdapterContract")).
        attach(vintageFundingPoolAdapterContractAddr);

    let df1 = await vintageFundingPoolAdapterContract.balanceOf(daoAddr, govs[0])
    // let df2 = await vintageFundingPoolAdapterContract.balanceOf(daoAddr, govs[1])
    const poolbal = await vintageFundingPoolAdapterContract.poolBalance(daoAddr)

    console.log(`
    FUND_RAISING_TARGET  ${FUND_RAISING_TARGET}
    FUND_RAISING_MAX   ${FUND_RAISING_MAX}
    VINTAGE_VOTING_ASSET_TYPE   ${VINTAGE_VOTING_ASSET_TYPE}
    VINTAGE_PRIORITY_DEPOSITE_TYPE   ${VINTAGE_PRIORITY_DEPOSITE_TYPE}
    VINTAGE_PRIORITY_DEPOSITE_AMOUNT   ${VINTAGE_PRIORITY_DEPOSITE_AMOUNT}
    VINTAGE_PRIORITY_DEPOSITE_TOKEN_ADDRESS   ${VINTAGE_PRIORITY_DEPOSITE_TOKEN_ADDRESS}

    df1  ${df1}   
    poolbal   ${poolbal}
    `)


    // const erc20 = (await hre.ethers.getContractFactory("ERC20")).
    //     attach(VINTAGE_PRIORITY_DEPOSITE_TOKEN_ADDRESS);

    // const erc20Bal1 = await erc20.balanceOf("0x8043d4576b9f35acefbc913029684285037cf473");
    // const erc20Bal2 = await erc20.balanceOf("0xefc7e20104239d1e59291c49b0604fe8a6cba2ff");
    // const erc20Bal3 = await erc20.balanceOf("0xdbacb3aba5500a2ac99966f3c8dfd8206efda268");



    let vintageFreeInEscrowFundAdapterContractAddr = await daoContract.getAdapterAddress("0x6a687e96f72a484e38a32d2ee3b61626294e792821961a90ce9a98d1999252d5");
    const vintageFreeInEscrowFundAdapterContract = (await hre.ethers.getContractFactory("VintageFreeInEscrowFundAdapterContract")).
        attach(vintageFreeInEscrowFundAdapterContractAddr);

    const vintageFundRaiseAdapterContractAddr = await daoContract.getAdapterAddress("0xa837e34a29b67bf52f684a1c93def79b84b9c012732becee4e5df62809df64ed");
    const vintageFundRaiseAdapterContract = (await hre.ethers.getContractFactory("VintageFundRaiseAdapterContract")).
        attach(vintageFundRaiseAdapterContractAddr);

    // const poolbal = await vintageFundingPoolAdapterContract.poolBalance(daoAddr)
    const govBal = await vintageFundingPoolAdapterContract.balanceOf(daoAddr, "0xD9f04EC9A0Ac241eDC631cB0b44f11D17CD13bBE");
    const depositBal1 = await vintageFundingPoolAdapterContract.balanceOf(daoAddr, "0x8043d4576b9f35acefbc913029684285037cf473");
    const depositBal2 = await vintageFundingPoolAdapterContract.balanceOf(daoAddr, "0xefc7e20104239d1e59291c49b0604fe8a6cba2ff");
    const depositBal3 = await vintageFundingPoolAdapterContract.balanceOf(daoAddr, "0xdbacb3aba5500a2ac99966f3c8dfd8206efda268");
    const freeINPriorityDepositsAmount = await vintageFundingPoolAdapterContract.freeINPriorityDeposits(daoAddr,
        "0xacaed7f260ca581746756e6445737461626c6973686d656e7423320000000000");
    const isRedemptPeriod = await vintageFundingPoolAdapterContract.ifInRedemptionPeriod(daoAddr, 1699936876);
    const fundRaiseState = await vintageFundingPoolAdapterContract.daoFundRaisingStates(daoAddr);
    const managementFee = await daoContract.getConfiguration("0x6f5ff8cd0c079fce916efdce457af51f719825bd5f50c63a2fe9b019a67939b8");
    console.log(govs);

    const pDepositer1 = await vintageFundRaiseAdapterContract.isPriorityDepositer(
        daoAddr,
        "0xacaed7f260ca581746756e6445737461626c6973686d656e7423320000000000",
        "0x8043d4576b9f35acefbc913029684285037cf473"
    );
    const pDepositer2 = await vintageFundRaiseAdapterContract.isPriorityDepositer(
        daoAddr,
        "0xacaed7f260ca581746756e6445737461626c6973686d656e7423320000000000",
        "0xefc7e20104239d1e59291c49b0604fe8a6cba2ff"
    );
    const pDepositer3 = await vintageFundRaiseAdapterContract.isPriorityDepositer(
        daoAddr,
        "0xacaed7f260ca581746756e6445737461626c6973686d656e7423320000000000",
        "0xdbacb3aba5500a2ac99966f3c8dfd8206efda268"
    );

    const freeInExcrowAmount1 = await vintageFreeInEscrowFundAdapterContract.escrowFunds(
        daoAddr,
        1,
        "0x8043d4576b9f35acefbc913029684285037cf473"
    );
    const freeInExcrowAmount2 = await vintageFreeInEscrowFundAdapterContract.escrowFunds(
        daoAddr,
        1,
        "0xefc7e20104239d1e59291c49b0604fe8a6cba2ff"
    );
    const freeInExcrowAmount3 = await vintageFreeInEscrowFundAdapterContract.escrowFunds(
        daoAddr,
        1,
        "0xdbacb3aba5500a2ac99966f3c8dfd8206efda268"
    );


    console.log("VINTAGE_PRIORITY_DEPOSITE_TYPE ", VINTAGE_PRIORITY_DEPOSITE_TYPE);
    console.log("VINTAGE_VOTING_ASSET_TYPE ", VINTAGE_VOTING_ASSET_TYPE);
    console.log("govBal ", hre.ethers.utils.formatEther(govBal));
    console.log("depositBal1 ", hre.ethers.utils.formatEther(depositBal1));
    console.log("depositBal2 ", hre.ethers.utils.formatEther(depositBal2));
    console.log("depositBal3 ", hre.ethers.utils.formatEther(depositBal3));

    console.log(`
    VINTAGE_PRIORITY_DEPOSITE_AMOUNT  ${hre.ethers.utils.formatEther(VINTAGE_PRIORITY_DEPOSITE_AMOUNT)}
    erc20Bal1             , ${hre.ethers.utils.formatEther(erc20Bal1)}
    erc20Bal2             , ${hre.ethers.utils.formatEther(erc20Bal2)}
    erc20Bal3             , ${hre.ethers.utils.formatEther(erc20Bal3)}

    "freeInExcrowAmount1 ", ${hre.ethers.utils.formatEther(freeInExcrowAmount1.amount)}
    "freeInExcrowAmount2 ", ${hre.ethers.utils.formatEther(freeInExcrowAmount2.amount)}
    "freeInExcrowAmount3 ", ${hre.ethers.utils.formatEther(freeInExcrowAmount3.amount)}

    pDepositer1           , ${pDepositer1}
    pDepositer2           , ${pDepositer2}
    pDepositer3           , ${pDepositer3}

    `);
    console.log("freeINPriorityDepositsAmount ", hre.ethers.utils.formatEther(freeINPriorityDepositsAmount));
    console.log("fundRaiseTarget ", hre.ethers.utils.formatEther(FUND_RAISING_MAX));
    console.log("fundRaiseTarget ", hre.ethers.utils.formatEther(fundRaiseTarget));
    console.log("poolbal ", hre.ethers.utils.formatEther(poolbal));
    console.log(isRedemptPeriod);
    console.log("fundRaiseState ", fundRaiseState);
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

const getVintageNewFundProposalInfo = async (daoAddr, proposalId) => {
    const daoContrct = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddr);;

    let vintageFundRaiseAdapterContractAddr = await daoContrct.getAdapterAddress("0xa837e34a29b67bf52f684a1c93def79b84b9c012732becee4e5df62809df64ed");
    const vintageFundRaiseContract = (await hre.ethers.getContractFactory("VintageFundRaiseAdapterContract")).attach(vintageFundRaiseAdapterContractAddr);;
    const proposalInfo = await vintageFundRaiseContract.Proposals(daoAddr,
        proposalId);


    console.log(proposalInfo);
    // console.log(
    //     `
    //     acceptTokenAddr ${proposalInfo[0]}
    //     fundRaiseTarget ${proposalInfo.amountInfo.fundRaiseTarget}
    //     fundRaiseMaxAmount ${proposalInfo.amountInfo.fundRaiseMaxAmount}
    //     lpMinDepositAmount ${proposalInfo.amountInfo.lpMinDepositAmount}
    //     lpMaxDepositAmount ${proposalInfo.amountInfo.lpMaxDepositAmount}

    //     fundRaiseStartTime ${proposalInfo.timesInfo.fundRaiseStartTime}
    //     fundRaiseEndTime ${proposalInfo.timesInfo.fundRaiseEndTime}
    //     fundTerm ${proposalInfo.timesInfo.fundTerm}
    //     redemptPeriod ${proposalInfo.timesInfo.redemptPeriod}
    //     redemptDuration ${proposalInfo.timesInfo.redemptDuration}
    //     returnDuration ${proposalInfo.timesInfo.returnDuration}

    //     managementFeeRatio ${proposalInfo.feeInfo.managementFeeRatio}
    //     returnTokenManagementFeeRatio ${proposalInfo.feeInfo.returnTokenManagementFeeRatio}
    //     redepmtFeeRatio ${proposalInfo.feeInfo.redepmtFeeRatio}
    //     protocolFeeRatio ${proposalInfo.feeInfo.protocolFeeRatio}
    //     managementFeeAddress ${proposalInfo.feeInfo.managementFeeAddress}

    //     fundFromInverstor ${proposalInfo.proposerReward.fundFromInverstor}
    //     projectTokenFromInvestor ${proposalInfo.proposerReward.projectTokenFromInvestor}

    //     state ${proposalInfo.state}

    //     creationTime ${proposalInfo.creationTime}
    //     stopVoteTime ${proposalInfo.stopVoteTime}

    //     `
    // );
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


const getVintageEscrowTokenInfo = async () => {
    const daoAddr = "0x5416d82ed5d0a04348c31688acbdd4a1920581d5";
    const fundingProposalId = "0xacbdd4a1920581d5496e766573746d656e742331000000000000000000000000";
    const approver = "0xDF9DFA21F47659cf742FE61030aCb0F15f659707";
    const paybackTokenAddr = "0xF08e9f7F821Af8AF9f9E3e9b8b484F2EB5bDE4A8";
    const daoContrct = (await hre.ethers.
        getContractFactory("DaoRegistry")).attach(daoAddr);
    const erc20 = (await hre.ethers.getContractAt("openzeppelin-solidity-2.3.0/contracts/token/ERC20/IERC20.sol:IERC20",
        paybackTokenAddr));
    const vintageInvestmentPaybackTokenAdapterContractaddr = await daoContrct.getAdapterAddress("0xde483f9dde6f6b12a62abdfd75010c5234f3ce7693a592507d331ec725f77257");
    const vintageInvestmentPaybackTokenAdapterContract = (await hre.ethers.
        getContractFactory("VintageInvestmentPaybackTokenAdapterContract")).attach(vintageInvestmentPaybackTokenAdapterContractaddr);
    const approvedAmount = await vintageInvestmentPaybackTokenAdapterContract.approvedInfos(
        daoAddr,
        fundingProposalId,
        approver,
        paybackTokenAddr
    );
    const approvePaybackTokenBal = await erc20.balanceOf(approver);
    console.log(
        `
        approvePaybackTokenBal ${approvePaybackTokenBal}
        approvedAmount         ${approvedAmount}
    `);
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

const getFlexAdapterAddress = async (daoAddr) => {
    const daoContrct = (await hre.ethers.
        getContractFactory("DaoRegistry")).attach(daoAddr);


    const FlexVesting = await daoContrct.getAdapterAddress("0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd");
    const FlexERC721 = await daoContrct.getAdapterAddress("0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35");
    const FlexAllocationAdapterContract = await daoContrct.getAdapterAddress("0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8");
    const FlexFundingPoolAdapterContract = await daoContrct.getAdapterAddress("0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c");
    const FlexVotingContract = await daoContrct.getAdapterAddress("0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7");
    const FlexPollingVotingContract = await daoContrct.getAdapterAddress("0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610");
    const FlexFundingAdapterContract = await daoContrct.getAdapterAddress("0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda");
    const bentoBoxV1 = await daoContrct.getAdapterAddress("0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a");
    const StewardMangement = await daoContrct.getAdapterAddress("0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753");
    const flexStewardAllocationAdapter = await daoContrct.getAdapterAddress("0x37cbe06c1044f98864ea25736326bc1d488e24e5e23781ea2ad64c4069cb9e6e");
    const flexFundingReturnTokenAdapter = await daoContrct.getAdapterAddress("0x43f8439a5cef099d0d9a92b15a64e34ff49963bb29d65f63204eda6591b810a1");
    const flexFreeInEscrowFundAdapterContract = await daoContrct.getAdapterAddress("0xeae11da953333a83b6467e2193334fb302549e1a42ad5797082aea1ab6be9120");
    const flexFundingHelperAdapterContract = await daoContrct.getAdapterAddress("0xc8e81510cbc5ec7970040e233b001587da1ea4484a9f7b8710d3322429c2df23");
    const flexDaoSetHelperAdapterContract = await daoContrct.getAdapterAddress("0xff9379b98b93eb3bd1fac62fd2258a7955d70d2d5279c40064145b6c9646df37");
    const flexDaoSetPollingAdapterContract = await daoContrct.getAdapterAddress("0x5f0e8d109045653360289a7a02d5dc2a99e382006a42ef93f66de55ecff3176f");
    const flexDaoSetVotingAdapterContract = await daoContrct.getAdapterAddress("0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7");
    const flexDaoSetFeesAdapterContract = await daoContrct.getAdapterAddress("0xc6bb47f9566baa74b5032b5c10e5bf4a1e2382ca337c2de674732f6401d52cc0");
    const flexDaoSetGovernorMembershipAdapterContract = await daoContrct.getAdapterAddress("0x869e5d18913d4e9bb387c730a04b58d11e95102194f7217a4b684f6e61dff920");
    const flexDaoSetInvestorCapAdapterContract = await daoContrct.getAdapterAddress("0x08f2d2eeda0c9072cdba8b58d442503b4cf9eb6c2f74d75e91dc719111c3189c");
    const flexDaoSetInvestorMembershipAdapterContract = await daoContrct.getAdapterAddress("0xe6121cbf77e02f965a1829c382f701ad4cec84fbda84c45378db0768d2e40871");
    const flexDaoSetProposerMembershipAdapterContract = await daoContrct.getAdapterAddress("0xf3ce48289b9021e92bc5661ccf481e756dcb8de846c2eb9620bb83917cab5237");
    const flexSetRiceReceiverProposalAdapterContract = await daoContrct.getAdapterAddress("0xcdb9c6d5700c127f2c99a75e51af1f56590e1b02f8f6ceee2d51d67dd0e91cad");
    const flexGovernorVotingAssetAllocationProposalAdapterContract = await daoContrct.getAdapterAddress("0xa34105560351082ce6b5540bff167edddf0aae5c59e0db3cd4ab748b5ae9b1c9");
    // const flexFundingPoolFactory = await daoContrct.getExtensionAddress("0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c");

    console.log(`
        const FlexVesting='${FlexVesting}'
        const FlexERC721='${FlexERC721}'
        const FlexAllocationAdapterContract='${FlexAllocationAdapterContract}'
        const FlexFundingPoolAdapterContract='${FlexFundingPoolAdapterContract}'
        const FlexVotingContract='${FlexVotingContract}'
        const FlexPollingVotingContract='${FlexPollingVotingContract}'
        const FlexFundingAdapterContract='${FlexFundingAdapterContract}'
        const bentoBoxV1='${bentoBoxV1}'
        const StewardMangement='${StewardMangement}'
        const flexStewardAllocationAdapter='${flexStewardAllocationAdapter}'
        const flexFundingReturnTokenAdapter='${flexFundingReturnTokenAdapter}'
        const flexFreeInEscrowFundAdapterContract='${flexFreeInEscrowFundAdapterContract}'
        const flexFundingHelperAdapterContract='${flexFundingHelperAdapterContract}'
        const flexDaoSetHelperAdapterContract='${flexDaoSetHelperAdapterContract}'
        const flexDaoSetPollingAdapterContract='${flexDaoSetPollingAdapterContract}'
        const flexDaoSetVotingAdapterContract='${flexDaoSetVotingAdapterContract}'
        const flexDaoSetFeesAdapterContract='${flexDaoSetFeesAdapterContract}'
        const flexDaoSetGovernorMembershipAdapterContract='${flexDaoSetGovernorMembershipAdapterContract}'
        const flexDaoSetInvestorCapAdapterContract='${flexDaoSetInvestorCapAdapterContract}'
        const flexDaoSetInvestorMembershipAdapterContract='${flexDaoSetInvestorMembershipAdapterContract}'
        const flexDaoSetProposerMembershipAdapterContract='${flexDaoSetProposerMembershipAdapterContract}'
        const flexGovernorVotingAssetAllocationProposalAdapterContract='${flexGovernorVotingAssetAllocationProposalAdapterContract}'
        const flexSetRiceReceiverProposalAdapterContract='${flexSetRiceReceiverProposalAdapterContract}'
    `);

}

const getVintageAdapterAddress = async (daoaddr) => {
    const daoContrct = (await hre.ethers.
        getContractFactory("DaoRegistry")).attach(daoaddr);
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
    const vintageFundRaiseAdapterContract="${vintageFundRaiseAdapterContract}"
    const FundingPoolAdapterContract="${FundingPoolAdapterContract}"
    const vintageVotingAdapterContract="${vintageVotingAdapterContract}"
    const vintageRaiserManagementContract="${vintageRaiserManagementContract}"
    const VintageFundingAdapterContract="${VintageFundingAdapterContract}"
    const vintageAllocationAdapterContract="${vintageAllocationAdapterContract}"
    const vintageVestingContract="${vintageVestingContract}"
    const bentoBoxV1="${bentoBoxV1}"
    const vintageEscrowFundAdapterContract="${vintageEscrowFundAdapterContract}"
    const vintageDistrubteAdapterContract="${vintageDistrubteAdapterContract}"
    const vintageRaiserAllocation="${vintageRaiserAllocation}"
    const vintageFundingReturnTokenAdapterContract="${vintageFundingReturnTokenAdapterContract}"
    const vintageFreeInEscrowFundAdapterContract="${vintageFreeInEscrowFundAdapterContract}"
    const vintageFundingPoolAdapterHelperContract="${vintageFundingPoolAdapterHelperContract}"
    const vintageDaoSetAdapterContract="${vintageDaoSetAdapterContract}"
    const vintageDaoSetHelperAdapterContract="${vintageDaoSetHelperAdapterContract}"
    const vintageFundingPoolFactory="${vintageFundingPoolFactory}"
   `);
}

const getDaoConfig = async (daoaddr) => {
    // const daoaddr = "0xc235ded871bc0e04945b17dfa1a21b7ac004d7d2";
    const daoContrct = (await hre.ethers.
        getContractFactory("DaoRegistry")).attach(daoaddr);
    const FundingPoolAdapterContractAddr = await daoContrct.getAdapterAddress("0xaaff643bdbd909f604d46ce015336f7e20fee3ac4a55cef3610188dee176c892");

    const vintageFundingPoolAdapterContract = (await hre.ethers.
        getContractFactory("VintageFundingPoolAdapterContract")).attach(FundingPoolAdapterContractAddr);
    const fundRaiseState = await vintageFundingPoolAdapterContract.daoFundRaisingStates(daoaddr);
    console.log("fundRaiseState ", fundRaiseState)
    const FUND_RAISING_WINDOW_END = await daoContrct.getConfiguration("0x533afc15b6312917b5e28e2272ea69d44e5ea8e00d3bd57cada1275c2f14c9e8");
    const managementFee = await daoContrct.getConfiguration("0x64c49ee5084f4940c312104c41603e43791b03dad28152afd6eadb5b960a8a87");
    const FLEX_MANAGEMENT_FEE_TYPE = await daoContrct.getConfiguration("0xda34ff95e06cbf2c9c32a559cd8aadd1a10104596417d62c03db2c1258df83d3");
    const FUND_END_TIME = await daoContrct.getConfiguration("0x9ce69cf04065e3c7823cc5540c0598d8a694bd7a9a5a2a786d8bccf14ed6e2ea")
    const PROPOSAL_EXECUTE_DURATION = await daoContrct.getConfiguration("0x02a3530cbb6e7c084516c86f68bd62c3e3fcd783c6c5d7e138616207f7a32250")
    const VOTING_PERIOD = await daoContrct.getConfiguration("0x9876c0f0505bfb2b1c38d3bbd25ba13159172cd0868972d76927723f5a9480fc")
    const RETURN_DURATION = await daoContrct.getConfiguration("0xb0d4178853a5320a41f8c55fa6d58af06637e392beff71e66dba4e8f32c39bb8");
    const FLEX_VOTING_SUPPORT_TYPE = await daoContrct.getConfiguration("0xe815a3c082eed7f7f7baab546f11a8718682c0eb3017b099ddc301a92f6673e3");
    const FLEX_VOTING_QUORUM_TYPE = await daoContrct.getConfiguration("0x730faccfe82f70711a34ce5202c6e1b1f79f421c16fcef745a9d92d06a7c0d4c");
    const QUORUM = await daoContrct.getConfiguration("0x0324de13a5a6e302ddb95a9fdf81cc736fc8acee2abe558970daac27395904e7");
    const SUPER_MAJORITY = await daoContrct.getConfiguration("0xb4c601c38beae7eebb719eda3438f59fcbfd4c6dd7d38c00665b6fd5b432df32");
    const FLEX_VOTING_ASSET_TYPE = await daoContrct.getConfiguration("0x75b7d343967750d1f6c15979b7559cea8be22ff1a06a51681b9cbef0d2fff4fe");
    const FLEX_VOTING_WEIGHTED_TYPE = await daoContrct.getConfiguration("0x18ef0b57fe939edb640a200fdf533493bd8f26a274151543a109b64c857e20f3");
    const FLEX_VOTING_ASSET_TOKEN_ADDRESS = await daoContrct.getAddressConfiguration("0xb5a1ad3f04728d7c38547e3d43006a1ec090a02fce04bbb1d0ee4519a1921e57");
    const erc20 = (await hre.ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
        FLEX_VOTING_ASSET_TOKEN_ADDRESS));

    const VINTAGE_PROPOSER_TOKEN_REWARD_RADIO = await daoContrct.getConfiguration("0x23bba46e5025fb6d2325c93cad4f861289d697c0913f7e18dab6bb065e2bdc28");
    const MANAGEMENT_FEE = await daoContrct.getConfiguration("0x11618fa890234170104debf73b2563b667bd200bac1d7d8dd024e2f3fadaefd2");
    // const bal = await erc20.balanceOf(
    //     "0x06bc456535ec14669c1b116d339226faba08b429"
    // )
    console.log(`
    VINTAGE_PROPOSER_TOKEN_REWARD_RADIO ${hre.ethers.utils.formatEther(VINTAGE_PROPOSER_TOKEN_REWARD_RADIO)}
    MANAGEMENT_FEE   ${hre.ethers.utils.formatEther(MANAGEMENT_FEE)}
    FLEX_MANAGEMENT_FEE_TYPE: ${FLEX_MANAGEMENT_FEE_TYPE}
    managementFee             ${hre.ethers.utils.formatEther(managementFee)}
    FUND_END_TIME             ${FUND_END_TIME}
    FUND_RAISING_WINDOW_END   ${FUND_RAISING_WINDOW_END}
    RETURN_DURATION           ${RETURN_DURATION}
    PROPOSAL_EXECUTE_DURATION ${PROPOSAL_EXECUTE_DURATION}
    VOTING_PERIOD             ${VOTING_PERIOD}
    FLEX_VOTING_SUPPORT_TYPE  ${FLEX_VOTING_SUPPORT_TYPE}
    FLEX_VOTING_QUORUM_TYPE   ${FLEX_VOTING_QUORUM_TYPE}
    QUORUM                    ${QUORUM}
    SUPER_MAJORITY            ${SUPER_MAJORITY}
    FLEX_VOTING_ASSET_TYPE    ${FLEX_VOTING_ASSET_TYPE}
    FLEX_VOTING_WEIGHTED_TYPE ${FLEX_VOTING_WEIGHTED_TYPE}
    FLEX_VOTING_ASSET_TOKEN_ADDRESS ${FLEX_VOTING_ASSET_TOKEN_ADDRESS}
    `);
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


const getVintageInvestors = async () => {
    const daoAddress = "0xb5cbd56f927dcb5659f4bb7f5d7fcc6d6f3ca0de";
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

const getVintageFundingApproveInfo = async () => {
    const vintageInvestmentPaybackTokenAdapterContract = (await hre.ethers.getContractFactory("VintageInvestmentPaybackTokenAdapterContract"))
        .attach(vintageFundingPoolAdaptAddr);
}

const vintageFundingProposalDebug = async (daoAddress, fundingProposalId) => {
    // const daoAddress = "0x5416d82ed5d0a04348c31688acbdd4a1920581d5";
    const dao = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddress);
    // const fundingProposalId = "0xacbdd4a1920581d546756e6445737461626c6973686d656e7423320000000000";
    const vintageFundingPoolAdaptAddr = await dao.getAdapterAddress("0xaaff643bdbd909f604d46ce015336f7e20fee3ac4a55cef3610188dee176c892")
    const vintageFundingpoolExtAddress = await dao.getExtensionAddress("0x161fca6912f107b0f13c9c7275de7391b32d2ea1c52ffba65a3c961880a0c60f")

    const vintageFundingPoolAdaptContractInstance = (await hre.ethers.getContractFactory("VintageFundingPoolAdapterContract"))
        .attach(vintageFundingPoolAdaptAddr);

    const voteAdaptAddr = await dao.getAdapterAddress("0xd3999c37f8f35da86f802a74f9bf032c4aeb46e49abd9c861f489ef4cb40d0a8");
    const vintageVotingAdapterContract = (await hre.ethers.getContractFactory("VintageVotingContract"))
        .attach(voteAdaptAddr);

    const vintageFundingPoolExtInstance = (await hre.ethers.getContractFactory("VintageFundingPoolExtension"))
        .attach(vintageFundingpoolExtAddress);

    const currentBal = await vintageFundingPoolAdaptContractInstance.balanceOf(daoAddress, '0x693f4838abef3fe8479033a893c36d1072c9b6a8');
    const voteRel = await vintageVotingAdapterContract.voteResult(daoAddress, fundingProposalId)
    console.log("voteRel ", voteRel);
    console.log(`
    currentBal ${currentBal}
    `);
}

const getVintageVestingInfo = async () => {

    const VintageFundingAdapterContract = await hre.ethers.getContractFactory("VintageFundingAdapterContract"
        , {
            libraries: {
                InvestmentLibrary: "0x92D73A6CCE32906b4B950eCfFc2B32e94Bf6Df90",
            }
        });

    VintageFundingAdapterContract.attach("0x401B687099F71C5ed477E7e613F57ee51eC8E12f");


    const daoAddress = "0x3bf3ee0a12896a64ba5def1573fabe7f6b787784";
    const daoContrct = (await hre.ethers.getContractFactory("DaoRegistry")).attach(daoAddress);
    let vintageVestingContractAddr = await daoContrct.getAdapterAddress("0x8295fbcf0c0d839b7cf11cacb43f22c81604fd9f0e4b295ff1d641ad9dd5786a");

    const vestingCont = (await hre.ethers.getContractFactory("VintageVesting")).attach(vintageVestingContractAddr);

    const vestInfo = await vestingCont.vests(2);

    console.log(vestInfo);
}

const debug = async () => {
    // const vesting = (await hre.ethers.getContractFactory("VintageVesting")).attach('0xc8a7a42a0618322971554e2f4a15bafeea8f7219');
    // const bal = await vesting.vestBalance(46);
    // console.log(hre.ethers.utils.formatEther(bal))
    const daoAddr = "0x1f08d3e56299687a497026a997400857e2fd9e26";
    const proposalId = "0x97400857e2fd9e26496e766573746d656e742331000000000000000000000000";
    const account1 = "0xd9f04ec9a0ac241edc631cb0b44f11d17cd13bbe";
    const account2 = "0xdbacb3aba5500a2ac99966f3c8dfd8206efda268";

    const daoContrct = (await hre.ethers.
        getContractFactory("DaoRegistry")).attach(daoAddr);


    // const FlexVesting = await daoContrct.getAdapterAddress("0x3c11b775c25636cc8a8e9190d176c127f201e732c93f4d80e9e1d8e36c9d7ecd");
    // const FlexERC721 = await daoContrct.getAdapterAddress("0xfacef1ff9551e6c96f09b108d715442c90dfae3b4f77a7691c0ddff9cef28d35");
    const FlexAllocationAdapterContractAddr = await daoContrct.getAdapterAddress("0xb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8");
    const FlexAllocationAdapterContract = (await hre.ethers.
        getContractFactory("FlexAllocationAdapterContract")).attach(FlexAllocationAdapterContractAddr);
    const investmentResward1 = await FlexAllocationAdapterContract.getInvestmentRewards(daoAddr, proposalId, account1);
    const investmentResward2 = await FlexAllocationAdapterContract.getInvestmentRewards(daoAddr, proposalId, account2);

    console.log(`
    investmentResward1 ${investmentResward1}
    investmentResward2 ${investmentResward2}
    `);
}


const transferVestNFT = async () => {
    const flexVestingNFTContrct = (await hre.ethers.
        getContractFactory("FlexVestingERC721")).attach('0x70050Ae33Ab726bd3Ad89c49532e127ba14E67de');

    const fromAddr = "0xDF9DFA21F47659cf742FE61030aCb0F15f659707";
    const toAddr = "0xdbacb3aba5500a2ac99966f3c8dfd8206efda268";
    const tokenId = 1;
    await flexVestingNFTContrct.transferFrom(fromAddr, toAddr, tokenId);

}

const getVestNFTSVG = async () => {
    const flexVestingNFTContrct = (await hre.ethers.
        getContractFactory("FlexVestingERC721")).attach('0xB99ad1b4dfdb95477Fd69dd86F65797463200567');

    // const bal = await flexVestingNFTContrct.balanceOf('0xDF9DFA21F47659cf742FE61030aCb0F15f659707')
    const svg = await flexVestingNFTContrct.getSvg(1);
    // console.log(svg);

    const uri = await flexVestingNFTContrct.tokenURI(1);
    console.log(uri);

    // const maxTotalSupply = await flexVestingNFTContrct.maxTotalSupply();
    // console.log("maxTotalSupply ", maxTotalSupply);

}

const getVintageVestNFTSVG = async () => {
    const flexVesting = (await hre.ethers.
        getContractFactory("FlexVesting")).attach('0x0b371C3c1E21Ad2b1E164d99265843fc41a201Be');
    const vintageVesting = (await hre.ethers.
        getContractFactory("VintageVesting")).attach('0x7dd8e41164C2eEAC7E2BdAbb53ed10816e240f6C');

    const vestingERC721 = (await hre.ethers.
        getContractFactory("VestingERC721")).attach('0x68E7A22f132FE314E49feEc4640d574119184D37');
    const vestingERC721Helper = (await hre.ethers.
        getContractFactory("VestingERC721Helper")).attach('0xaAfb9a2F574e5c7B3b457DaF416ce7A17992DAe7');
    // const bal = await flexVestingNFTContrct.balanceOf('0xDF9DFA21F47659cf742FE61030aCb0F15f659707')
    // const svg = await vestingERC721.getSvg(1);
    // console.log(svg);

    const vID1 = await flexVesting.tokenIdToVestId("0x68E7A22f132FE314E49feEc4640d574119184D37", 1);
    const vID2 = await vintageVesting.tokenIdToVestId("0x68E7A22f132FE314E49feEc4640d574119184D37", 1);
    console.log(`
    vID1 ${vID1}
    vID2 ${vID2}
    `);

    const vestInfo = await vintageVesting.vests(vID2);
    const rel = await vintageVesting.getRemainingPercentage("0x68E7A22f132FE314E49feEc4640d574119184D37", vID2);

    // ERC20(vars.vestToken).symbol(),
    // vars.vestToken,
    // [
    //     vars.remaining_,
    //     vars.total_,
    //     vars.claimInterval,
    //     vars.claimStartTime,
    //     vars.claimEndTime
    // ]
    // console.log(vestInfo);

    // vars.claimInterval = vars.timeInfo.stepDuration;
    // vars.claimStartTime =
    //     vars.timeInfo.start +
    //     vars.timeInfo.cliffDuration;
    // vars.claimEndTime = vars.timeInfo.end;
    const currentId = await vintageVesting.vestIds();
    console.log(
        `
    remaining_ ${rel[1]}
    total_     ${rel[2]}
    claimInterval  ${vestInfo.timeInfo.stepDuration}
    claimStartTime  ${vestInfo.timeInfo.start + vestInfo.timeInfo.cliffDuration}
    claimEndTime    ${vestInfo.timeInfo.end}
    `
    );
    console.log("currentId ", currentId);

    const svg = await vestingERC721Helper.getSvg(
        1,
        2,
        "0x68E7A22f132FE314E49feEc4640d574119184D37",
        "0x7dd8e41164C2eEAC7E2BdAbb53ed10816e240f6C"
    )
    console.log(svg);

    const uri = await vestingERC721.tokenURI(1);
    console.log(uri);

    // const maxTotalSupply = await flexVestingNFTContrct.maxTotalSupply();
    // console.log("maxTotalSupply ", maxTotalSupply);

}

const getVintageCreatedVestinginfo = async () => {
    const daoAddr = "0x34adbd32e20104fff898b56378c658088c9d0875";
    const VestingERC721Addr = "0xDFbDb30CcE5ACff605949bd1CBcCE389309264E5";
    const daoContrct = (await hre.ethers.
        getContractFactory("DaoRegistry")).attach(daoAddr);
    const VestingNFTContrct = (await hre.ethers.
        getContractFactory("VintageVestingERC721")).attach(VestingERC721Addr);
    const VestingAddr = await daoContrct.getAdapterAddress("0x8295fbcf0c0d839b7cf11cacb43f22c81604fd9f0e4b295ff1d641ad9dd5786a");
    console.log("VestingAddr ", VestingAddr);


    const vestAddr = await VestingNFTContrct.vestAddress();
    console.log("vestAddr ", vestAddr);
    const VestingCont = (await hre.ethers.
        getContractFactory("VintageVesting")).attach(vestAddr);

    const vestId = await VestingCont.getVestIdByTokenId(VestingERC721Addr, 1)
    console.log("vestId ", vestId);
    const vestInfo = await VestingCont.vests(vestId);
    const rel = await VestingCont.getRemainingPercentage(VestingERC721Addr, vestId);
    console.log(vestInfo.vestInfo);
    console.log(vestInfo.timeInfo);
    const currentId = await VestingCont.vestIds();
    console.log(rel);
    console.log("currentId ", currentId);

    // const a = await VestingCont.vests(10)

    // console.log(a);
}

const mintVintageReceiptNFT = async () => {
    const VintageInvestmentReceiptERC721 = (await hre.ethers.
        getContractFactory("VintageInvestmentReceiptERC721")).attach("0x863436b3dB3f7681C2948b6A62786Ec96a63932b");

    const daoAddr = "0xa9b8334c5393299ce74b48a6b987d605314f1de1"
    const investmentProposalId = "0xb987d605314f1de1496e766573746d656e742332000000000000000000000000"
    const executedTxHash = "0x3eb8766b976d49aa3b45dfc31b5de2e55f9c1ce1880171f59f564c1b02c9716e"
    const projectName = "ABC Finance"
    const description = "ABI Finance is an ecosystem-focused and community-driven DEX built on Arbitrum. It has been built as a highly efficient and customizable protocol, allowing both builders and users to leverage our custom infrastructure for deep, sustainable, and adaptable liquidity. Camelot moves beyond the traditional design of DEXs to focus on offering a tailored approach that prioritises composability."

    await VintageInvestmentReceiptERC721.safeMint(
        daoAddr,
        investmentProposalId,
        executedTxHash,
        projectName,
        description
    );

    console.log("minted..");
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

const getCollectiveAdapterAddress = async (daoAddr) => {
    const daoContrct = (await hre.ethers.
        getContractFactory("DaoRegistry")).attach(daoAddr);

    let collectiveGovernorManagmentAdapterContractAddr = await daoContrct.getAdapterAddress("0x1a4f1390baec30049008138e650571a3c4374eba88116bc89dc192f2f9295efe");
    let collectivePaybackTokenAdapterContractAddr = await daoContrct.getAdapterAddress("0x3b8222b84816150ff171ef9b3356ce3d250b8e7c01c09c0208949acc0880db34");
    let collectiveFundingPoolAdapterContractAddr = await daoContrct.getAdapterAddress("0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea");
    let collectiveEscrowFundAdapterContractAddr = await daoContrct.getAdapterAddress("0x372fda66f626a705d3a459960a1457403a7c3564acccedc00092ea70262b7083")
    let collectiveTopUPAdaptContrAddr = await daoContrct.getAdapterAddress("0x3b4de3360220463b2e1b681516ac7919070009f0544e8465d80dc511828dae5b");
    const collectiveDaosetAdaptContAddr = await daoContrct.getAdapterAddress("0xdac6d9ce728ebc92a61253866b4e5a4c73b76ba0aa11e7297a633f6232f54237");
    const collectiveVotingContractAddr = await daoContrct.getAdapterAddress("0x907642cbfe4e58ddd14eaa320923fbe4c29721dd0950ae4cb3b2626e292791ae");
    const colletiveFundRaiseProposalContractAddr = await daoContrct.getAdapterAddress("0x3a06648a49edffe95b8384794dfe9cf3ab34782fab0130b4c91bfd53f3407e6b");
    const collectiveAllocationAdapterContractAddr = await daoContrct.getAdapterAddress("0xbba99fd05ef530e2ad5cae360774c7ec6b1f135b279ab165354152f7dc991c10");
    const colletiveFundingProposalContractAddr = await daoContrct.getAdapterAddress("0x72894213a5c7f56b36b2947fa6ea18963d6bb1a68746b46d7f552cca76e1a7a8");
    const collectiveDistributeAdatperContractAddr = await daoContrct.getAdapterAddress("0x183027a84d1b84d3cbf7b351110205fd057b5701a490be772ea6489292256ee3");
    const collectiveVestingContractAddr = await daoContrct.getAdapterAddress("0x15c9835cf5910308466ec9cbdb6a0be1b9ea161943cc4caf2457bc33d880f197");
    const colletiveExpenseProposalContractAddr = await daoContrct.getAdapterAddress("0xd0e09561b13ad01191fc8f65f6fc85651e4f495d3f9ab93d95010ea58382434b");
    const collectiveRedemptionFeeEscrowAdapterContractAddr = await daoContrct.getAdapterAddress("0x1ec3ab9b73a5166bb51de3096776c3fb06df7dc0a5e2df3038eb0588fad3adbc");
    const bentoBoxV1Addr = await daoContrct.getAdapterAddress("0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a");
    const collectiveFreeInEscrowFundAdapterContractAddr = await daoContrct.getAdapterAddress("0x4bb6d123745fe9358fe205a70b7a4aae2a445c56d4bc19c9a123a9259ff615a1");
    const colletiveClearFundProposalAdapterContractAddr = await daoContrct.getAdapterAddress("0x851d65965a45a40b902ee7de04ff05b19ff7fde56dd486fd3108dc5cd9249f06");
    const colletiveSetRiceReceiverProposalAdapterContracAddr = await daoContrct.getAdapterAddress("0x9e82e8ea7f567cfdc187328108cbbacfa60391a3b15920f636c4185ecdce21a5");


    const colectiveFundingpoolExtAddress = await daoContrct.getExtensionAddress("0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab")

    console.log(`
        const collectiveDaosetAdaptContAddr="${collectiveDaosetAdaptContAddr}"
        const collectiveGovernorManagmentAdapterContractAddr="${collectiveGovernorManagmentAdapterContractAddr}"
        const collectiveVotingContractAddr="${collectiveVotingContractAddr}"
        const collectiveFundingPoolAdapterContractAddr="${collectiveFundingPoolAdapterContractAddr}"
        const colletiveFundRaiseProposalContractAddr="${colletiveFundRaiseProposalContractAddr}"
        const collectivePaybackTokenAdapterContractAddr="${collectivePaybackTokenAdapterContractAddr}"
        const collectiveAllocationAdapterContractAddr="${collectiveAllocationAdapterContractAddr}"
        const colletiveFundingProposalContractAddr="${colletiveFundingProposalContractAddr}"
        const collectiveDistributeAdatperContractAddr="${collectiveDistributeAdatperContractAddr}"
        const bentoBoxV1Addr="${bentoBoxV1Addr}"
        const collectiveVestingContractAddr="${collectiveVestingContractAddr}"
        const collectiveEscrowFundAdapterContractAddr="${collectiveEscrowFundAdapterContractAddr}"
        const collectiveTopUPAdaptContrAddr="${collectiveTopUPAdaptContrAddr}"
        const colletiveExpenseProposalContractAddr="${colletiveExpenseProposalContractAddr}"
        const collectiveFreeInEscrowFundAdapterContractAddr="${collectiveFreeInEscrowFundAdapterContractAddr}"
        const colletiveClearFundProposalAdapterContractAddr="${colletiveClearFundProposalAdapterContractAddr}"
        const collectiveRedemptionFeeEscrowAdapterContractAddr="${collectiveRedemptionFeeEscrowAdapterContractAddr}"
        const colletiveSetRiceReceiverProposalAdapterContracAddr="${colletiveSetRiceReceiverProposalAdapterContracAddr}"
    `)
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

const getCollectiveGovernorManagementProposalInfo = async (daoAddr, proposalId) => {
    const daoContr = (await hre.ethers.getContractFactory("DaoRegistry"))
        .attach(daoAddr);

    const governorMangementContrAddr = await daoContr.getAdapterAddress("0x1a4f1390baec30049008138e650571a3c4374eba88116bc89dc192f2f9295efe");
    const governorMangementContr = (await hre.ethers.getContractFactory("ColletiveGovernorManagementAdapterContract"))
        .attach(governorMangementContrAddr);

    const proposal = await governorMangementContr.proposals(daoAddr, proposalId);
    const approvedAmount = await governorMangementContr.approvedInfos(
        daoAddr,
        proposalId,
        "0xf7ddfcaa05ad06a0d0e64061851f33978ef6730a",
        "0xfce5fdebf0fe1ff0674a1294d5cd8018a0e30cd6");
    console.log(proposal);
    console.log(approvedAmount);
}

const submitCollectiveInvestorCapDaosetProposal = async (daoAddr) => {

    const daoContr = (await hre.ethers.getContractFactory("DaoRegistry"))
        .attach(daoAddr);

    const governorMangementContrAddr = await daoContr.getAdapterAddress("0xdac6d9ce728ebc92a61253866b4e5a4c73b76ba0aa11e7297a633f6232f54237");

    const colletiveDaoSetProposalAdapterContract = (await hre.ethers.getContractFactory("ColletiveDaoSetProposalAdapterContract"))
        .attach(governorMangementContrAddr);

    const enable = true;
    const cap = 4;
    const tx = await colletiveDaoSetProposalAdapterContract.submitInvestorCapProposal(
        daoAddr,
        enable,
        cap
    );

    const rel = await tx.wait();

    const proposalId = rel.events[rel.events.length - 1].args.proposalId;

    console.log(
        `proposalId  ${proposalId}`
    );

}

const getCollectivePaybackTokenApprovedInfo = async (daoAddr, proposalId, approver, token) => {
    const daoContr = (await hre.ethers.getContractFactory("DaoRegistry"))
        .attach(daoAddr);

    const collectivePaybackTokenAdapterContractAddr = await daoContr.getAdapterAddress("0x3b8222b84816150ff171ef9b3356ce3d250b8e7c01c09c0208949acc0880db34");

    const collectivePaybackTokenAdapterContract = (await hre.ethers.getContractFactory("CollectivePaybackTokenAdapterContract"))
        .attach(collectivePaybackTokenAdapterContractAddr);

    const approvedAmount = await collectivePaybackTokenAdapterContract.approvedInfos(
        daoAddr,
        proposalId,
        approver,
        token
    );

    console.log(`
    approvedAmount ${approvedAmount}
    `);
}

const getCollectiveInvestmentProposalInfo = async (daoAddr, proposalId) => {
    const daoContr = (await hre.ethers.getContractFactory("DaoRegistry"))
        .attach(daoAddr);

    const colletiveFundingProposalAdapterContractAddr = await daoContr.getAdapterAddress("0x72894213a5c7f56b36b2947fa6ea18963d6bb1a68746b46d7f552cca76e1a7a8");
    let collectiveFundingPoolAdapterContractAddr = await daoContr.getAdapterAddress("0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea");
    let collectivePaybackTokenAdapterContractAddr = await daoContr.getAdapterAddress("0x3b8222b84816150ff171ef9b3356ce3d250b8e7c01c09c0208949acc0880db34");

    const colletiveFundingProposalAdapterContract = (await hre.ethers.getContractFactory("ColletiveFundingProposalAdapterContract"))
        .attach(colletiveFundingProposalAdapterContractAddr);

    const colletiveFundingPoolAdapterContract = (await hre.ethers.getContractFactory("ColletiveFundingPoolAdapterContract"))
        .attach(collectiveFundingPoolAdapterContractAddr);

    const collectivePaybackTokenAdapterContract = (await hre.ethers.getContractFactory("CollectivePaybackTokenAdapterContract"))
        .attach(collectivePaybackTokenAdapterContractAddr);



    const proposalInfo = await colletiveFundingProposalAdapterContract.proposals(daoAddr, proposalId);

    console.log(proposalInfo);

    const erc20 = (await hre.ethers.getContractAt(
        "openzeppelin-solidity-2.3.0/contracts/token/ERC20/IERC20.sol:IERC20",
        proposalInfo.escrowInfo.paybackToken)
    );

    const poolBal = await colletiveFundingPoolAdapterContract.poolBalance(daoAddr);

    const approvedAmount = await collectivePaybackTokenAdapterContract.approvedInfos(daoAddr,
        proposalId,
        proposalInfo.escrowInfo.approver,
        proposalInfo.escrowInfo.paybackToken);

    const allowanceAmount = await erc20.allowance(
        proposalInfo.escrowInfo.approver,
        collectivePaybackTokenAdapterContractAddr
    );

    const packBakcBal = await erc20.balanceOf(proposalInfo.escrowInfo.approver);
    // approvedInfos[address(dao)][proposalId][approver][erc20] <
    //     escrowAmount ||
    //     IERC20(erc20).allowance(approver, address(this)) < escrowAmount ||
    //     IERC20(erc20).balanceOf(approver) < escrowAmount

    console.log(`
    poolBal          ${poolBal}
    totalAmount      ${proposalInfo.fundingInfo.totalAmount}
    approvedAmount   ${approvedAmount}
    allowanceAmount  ${allowanceAmount}
    packBakcBal      ${packBakcBal}
    paybackAmount    ${proposalInfo.escrowInfo.paybackAmount}

    `);

}

const collectiveExpenseProposal = async (daoAddr, proposalId) => {
    const daoContr = (await hre.ethers.getContractFactory("DaoRegistry"))
        .attach(daoAddr);

    const colletiveExpenseProposalAdapterContractAddr = await daoContr.getAdapterAddress("0xd0e09561b13ad01191fc8f65f6fc85651e4f495d3f9ab93d95010ea58382434b");
    const colletiveExpenseProposalAdapterContract = (await hre.ethers.getContractFactory("ColletiveExpenseProposalAdapterContract"))
        .attach(colletiveExpenseProposalAdapterContractAddr);

    await colletiveExpenseProposalAdapterContract.processProposal(daoAddr, proposalId);
}

const collectiveFundRaise = async (daoAddr) => {
    const daoContr = (await hre.ethers.getContractFactory("DaoRegistry"))
        .attach(daoAddr);

    const colletiveFundingPoolAdapterContractAddr = await daoContr.getAdapterAddress("0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea");
    const colletiveFundingPoolAdapterContract = (await hre.ethers.getContractFactory("ColletiveFundingPoolAdapterContract"))
        .attach(colletiveFundingPoolAdapterContractAddr);

    const poolBal = await colletiveFundingPoolAdapterContract.poolBalance(daoAddr);
    const fundState = await colletiveFundingPoolAdapterContract.fundState(daoAddr)

    const colletiveFundRaiseProposalContractAddr = await daoContr.getAdapterAddress("0x3a06648a49edffe95b8384794dfe9cf3ab34782fab0130b4c91bfd53f3407e6b");
    const fundRaiseContract = (await hre.ethers.getContractFactory("ColletiveFundRaiseProposalAdapterContract"))
        .attach(colletiveFundRaiseProposalContractAddr);

    const fundRaiseProposalInfo = await fundRaiseContract.proposals(daoAddr, "0xd56dff2b3b2df4b246756e6445737461626c6973686d656e7423310000000000")

    
    const fundRaiseProposalId = fundRaiseContract.lastProposalIds(
        daoAddr
    );
    const fundRaisedByProposalId = await colletiveFundingPoolAdapterContract.fundRaisedByProposalId(daoAddr, fundRaiseProposalId);
    console.log(
        `poolBal   ${hre.ethers.utils.formatEther(poolBal)}
        fundState  ${fundState}
        fundRaisedByProposalId  ${fundRaisedByProposalId}
        fund raise state ${fundRaiseProposalInfo.state}
        `
    );

}

const collectiveOperationProposals = async (daoAddr) => {
    const daoContrct = (await hre.ethers.getContractFactory("DaoRegistry"))
        .attach(daoAddr);
    const collectiveGovernorManagmentAdapterContractAddr = await daoContrct.getAdapterAddress("0x1a4f1390baec30049008138e650571a3c4374eba88116bc89dc192f2f9295efe");
    const collectiveTopUPAdaptContrAddr = await daoContrct.getAdapterAddress("0x3b4de3360220463b2e1b681516ac7919070009f0544e8465d80dc511828dae5b");
    const collectiveDaosetAdaptContAddr = await daoContrct.getAdapterAddress("0xdac6d9ce728ebc92a61253866b4e5a4c73b76ba0aa11e7297a633f6232f54237");
    const colletiveFundRaiseProposalContractAddr = await daoContrct.getAdapterAddress("0x3a06648a49edffe95b8384794dfe9cf3ab34782fab0130b4c91bfd53f3407e6b");
    const colletiveFundingProposalContractAddr = await daoContrct.getAdapterAddress("0x72894213a5c7f56b36b2947fa6ea18963d6bb1a68746b46d7f552cca76e1a7a8");
    const colletiveExpenseProposalContractAddr = await daoContrct.getAdapterAddress("0xd0e09561b13ad01191fc8f65f6fc85651e4f495d3f9ab93d95010ea58382434b");

    const collectiveGovernorManagmentAdapterContract = (await hre.ethers.getContractFactory("ColletiveGovernorManagementAdapterContract"))
        .attach(collectiveGovernorManagmentAdapterContractAddr);

    const collectiveTopUPAdaptContr = (await hre.ethers.getContractFactory("ColletiveTopUpProposalAdapterContract"))
        .attach(collectiveTopUPAdaptContrAddr);

    const collectiveDaosetAdaptCont = (await hre.ethers.getContractFactory("ColletiveDaoSetProposalAdapterContract"))
        .attach(collectiveDaosetAdaptContAddr);

    const colletiveFundRaiseProposalContract = (await hre.ethers.getContractFactory("ColletiveFundRaiseProposalAdapterContract"))
        .attach(colletiveFundRaiseProposalContractAddr);

    const colletiveFundingProposalContract = (await hre.ethers.getContractFactory("ColletiveFundingProposalAdapterContract"))
        .attach(colletiveFundingProposalContractAddr);

    const colletiveExpenseProposalContract = (await hre.ethers.getContractFactory("ColletiveExpenseProposalAdapterContract"))
        .attach(colletiveExpenseProposalContractAddr);

    const rel1 = await collectiveGovernorManagmentAdapterContract.allDone(daoAddr);
    const rel2 = await collectiveTopUPAdaptContr.allDone(daoAddr);
    const rel3 = await colletiveExpenseProposalContract.allDone(daoAddr);
    const rel4 = await collectiveDaosetAdaptCont.isProposalAllDone(daoAddr);
    // const ss = await collectiveGovernorManagmentAdapterContract.proposals(daoAddr, "0x163cc5c8236f2482476f7665726e6f722d496e23310000000000000000000000");
    // const d = await collectiveGovernorManagmentAdapterContract.unDoneProposals(daoAddr);
    console.log(`
    rel1 ${rel1}
    rel2 ${rel2}
    rel3 ${rel3}
    rel4 ${rel4}
    `);
}

const collectiveEscrowFund = async (daoAddr) => {

    const daoContrct = (await hre.ethers.getContractFactory("DaoRegistry"))
        .attach(daoAddr);

    const redempitonFee = await daoContrct.getConfiguration("0x51cc27e85946200c558b984a0c15cad2122655d647f9c02ebe9529f2a0b25a2f");
    console.log(redempitonFee);

    let collectiveEscrowFundAdapterContractAddr = await daoContrct.getAdapterAddress("0x372fda66f626a705d3a459960a1457403a7c3564acccedc00092ea70262b7083")
    const collectiveEscrowFundAdapterContract = (await hre.ethers.getContractFactory("CollectiveEscrowFundAdapterContract"))
        .attach(collectiveEscrowFundAdapterContractAddr);

    let collectivePaybackTokenAdapterContractAddr = await daoContrct.getAdapterAddress("0x3b8222b84816150ff171ef9b3356ce3d250b8e7c01c09c0208949acc0880db34");
    const collectivePaybackTokenAdapterContract = (await hre.ethers.getContractFactory("CollectivePaybackTokenAdapterContract"))
        .attach(collectivePaybackTokenAdapterContractAddr);

    const escrowedPaybackTokensAmount = await collectivePaybackTokenAdapterContract.escrowedPaybackTokens(daoAddr, "0x2af78a6640e86dea496e766573746d656e742331000000000000000000000000",
        "0x9ab302974abd84c875343d6beea05309bede2f10");

    console.log(`
    escrowedPaybackTokensAmount   ${hre.ethers.utils.formatEther(escrowedPaybackTokensAmount)}
    `);

    const tokenAddr = "0xfce5fdebf0fe1ff0674a1294d5cd8018a0e30cd6"
    const account = "0x8043d4576b9f35acefbc913029684285037cf473";
    const escrowedAmount = await collectiveEscrowFundAdapterContract.escrowFunds(daoAddr, tokenAddr, account);


    const collectiveFundingPoolAdapterContractAddr = await daoContrct.getAdapterAddress("0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea");
    const collectiveFundingPoolAdapterContract = (await hre.ethers.getContractFactory("ColletiveFundingPoolAdapterContract")).attach(collectiveFundingPoolAdapterContractAddr);

    const allMembers = await collectiveFundingPoolAdapterContract.getAllInvestors(daoAddr);
    const governorContAddr = await daoContrct.getAdapterAddress("0x1a4f1390baec30049008138e650571a3c4374eba88116bc89dc192f2f9295efe");
    const governorContr = (await hre.ethers.getContractFactory("ColletiveGovernorManagementAdapterContract")).attach(governorContAddr);
    const allMembers1 = await governorContr.getAllGovernor(daoAddr);

    const collectiveRedemptionFeeEscrowAdapterContractAddr = await daoContrct.getAdapterAddress("0x1ec3ab9b73a5166bb51de3096776c3fb06df7dc0a5e2df3038eb0588fad3adbc");
    const collectiveRedemptionFeeEscrowAdapterContract = (await hre.ethers.getContractFactory("CollectiveRedemptionFeeEscrowAdapterContract")).attach(collectiveRedemptionFeeEscrowAdapterContractAddr);
    const feeAmount = await collectiveRedemptionFeeEscrowAdapterContract.getRedemptionFeeAmount(daoAddr, tokenAddr, "0x9Ab302974aBd84C875343D6BeeA05309BEDE2f10")



    const blocknums = await collectiveRedemptionFeeEscrowAdapterContract.getBlockNumByTokenAddr(daoAddr, tokenAddr);

    const colectiveFundingpoolExtAddress = await daoContrct.getExtensionAddress("0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab")
    const collectiveInvestmentPoolExtension = (await hre.ethers.getContractFactory("CollectiveInvestmentPoolExtension")).attach(colectiveFundingpoolExtAddress);
    const a1 = await collectiveInvestmentPoolExtension.getPriorAmount(
        "0x9Ab302974aBd84C875343D6BeeA05309BEDE2f10",
        tokenAddr,
        blocknums[0] - 1
    );
    const a2 = await collectiveInvestmentPoolExtension.getPriorAmount(
        "0x000000000000000000000000000000000000decd",
        tokenAddr,
        blocknums[0] - 1
    );
    console.log(`
    escrowedAmount   ${hre.ethers.utils.formatEther(escrowedAmount)}
    feeAmount      ${hre.ethers.utils.formatEther(feeAmount)}
    redempitonFee  ${redempitonFee}
    allMembers       ${allMembers}
    allMembers1      ${allMembers1}
    blocknums       ${blocknums}
    a1             ${hre.ethers.utils.formatEther(a1)}
    a2             ${hre.ethers.utils.formatEther(a2)}

    `);
}

const collectiveRedemptionFee = async (daoAddr) => {
    const daoContrct = (await hre.ethers.getContractFactory("DaoRegistry"))
        .attach(daoAddr);
    const redempitonFee = await daoContrct.getConfiguration("0x51cc27e85946200c558b984a0c15cad2122655d647f9c02ebe9529f2a0b25a2f");
    console.log(redempitonFee);

    const governorContAddr = await daoContrct.getAdapterAddress("0x1a4f1390baec30049008138e650571a3c4374eba88116bc89dc192f2f9295efe");
    const governorContr = (await hre.ethers.getContractFactory("ColletiveGovernorManagementAdapterContract")).attach(governorContAddr);
    const allMembers1 = await governorContr.getAllGovernor(daoAddr);
    console.log(allMembers1);

    const collectiveRedemptionFeeEscrowAdapterContractAddr = await daoContrct.getAdapterAddress("0x1ec3ab9b73a5166bb51de3096776c3fb06df7dc0a5e2df3038eb0588fad3adbc");
    const collectiveRedemptionFeeEscrowAdapterContract = (await hre.ethers.getContractFactory("CollectiveRedemptionFeeEscrowAdapterContract")).attach(collectiveRedemptionFeeEscrowAdapterContractAddr);

    const tokenAddr = "0xfce5fdebf0fe1ff0674a1294d5cd8018a0e30cd6"
    const blockNums = await collectiveRedemptionFeeEscrowAdapterContract.getBlockNumByTokenAddr(daoAddr, tokenAddr);
    const feeAmount = await collectiveRedemptionFeeEscrowAdapterContract.escrowedRedemptionFeeByBlockNum(daoAddr, blockNums[0]);




    const feeAmount1 = await collectiveRedemptionFeeEscrowAdapterContract.getRedemptionFeeAmount(daoAddr, tokenAddr, "0x9Ab302974aBd84C875343D6BeeA05309BEDE2f10")
    const feeAmount2 = await collectiveRedemptionFeeEscrowAdapterContract.getRedemptionFeeAmount(daoAddr, tokenAddr, "0xf7DDFcAa05ad06A0d0E64061851F33978EF6730A")


    const withdrawAmount = await collectiveRedemptionFeeEscrowAdapterContract.withdrawAmount(daoAddr, tokenAddr, "0xf7DDFcAa05ad06A0d0E64061851F33978EF6730A")
    console.log(`
    blockNums    ${blockNums}
    feeAmount    ${hre.ethers.utils.formatEther(feeAmount)}    
    feeAmount1    ${hre.ethers.utils.formatEther(feeAmount1)}    
    feeAmount2    ${hre.ethers.utils.formatEther(feeAmount2)}    
    withdrawAmount    ${hre.ethers.utils.formatEther(withdrawAmount)}    

    allMembers1  ${allMembers1}
    `);
}

const collectiveClearFundProposal = async (daoAddr) => {
    const daoContrct = (await hre.ethers.getContractFactory("DaoRegistry"))
        .attach(daoAddr);

    const colletiveClearFundProposalAdapterContractAddr = await daoContrct.getAdapterAddress("0x851d65965a45a40b902ee7de04ff05b19ff7fde56dd486fd3108dc5cd9249f06");
    const colletiveVotingAdapterContractAddr = await daoContrct.getAdapterAddress("0x907642cbfe4e58ddd14eaa320923fbe4c29721dd0950ae4cb3b2626e292791ae");

    const collectiveFundingPoolAdapterContractAddr = await daoContrct.getAdapterAddress("0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea");
    const collectiveFundingPoolAdapterContract = (await hre.ethers.getContractFactory("ColletiveFundingPoolAdapterContract")).attach(collectiveFundingPoolAdapterContractAddr);

    const collectiveVotingAdapterContract = (await hre.ethers.getContractFactory("CollectiveVotingAdapterContract")).attach(colletiveVotingAdapterContractAddr);


    const Contrct = (await hre.ethers.getContractFactory("ColletiveClearFundProposalAdapterContract"))
        .attach(colletiveClearFundProposalAdapterContractAddr);

    const proposal = await Contrct.proposals(daoAddr, "0xb6eef61becc32516436c65617246756e64233100000000000000000000000000");
    console.log(proposal);

    const allwaei = await collectiveVotingAdapterContract.getAllGovernorWeightByProposalId(daoAddr, "0xb6eef61becc32516436c65617246756e64233100000000000000000000000000");
    console.log(allwaei);
    // const sd = await daoContrct.getCurrentCleaerFundProposalId();

    const poolb = await collectiveFundingPoolAdapterContract.poolBalance(daoAddr);
    const invsts = await collectiveFundingPoolAdapterContract.getAllInvestors(daoAddr)
    const depAmount = await collectiveFundingPoolAdapterContract.balanceOf(daoAddr, invsts[0])
    console.log(`
    poolb   ${hre.ethers.utils.formatEther(poolb)}
    invsts  ${invsts}
    depAmount   ${hre.ethers.utils.formatEther(depAmount)}

    `);
    // await Contrct.submitClearFundProposal(daoAddr);
}

const collectiveVotingPower = async (daoAddr) => {
    const daoContrct = (await hre.ethers.getContractFactory("DaoRegistry"))
        .attach(daoAddr);

    const colletiveVotingAdapterContractAddr = await daoContrct.getAdapterAddress("0x907642cbfe4e58ddd14eaa320923fbe4c29721dd0950ae4cb3b2626e292791ae");

    const collectiveVotingAdapterContract = (await hre.ethers.getContractFactory("CollectiveVotingAdapterContract")).attach(colletiveVotingAdapterContractAddr);

    const votingWeightedType = await daoContrct.getConfiguration(
        "0xd093d4a34a12a221b19c0a6689d5449f1346aa769d15cca4e9782c36fda9339a"
    )
    console.log(votingWeightedType);
    const rel = await collectiveVotingAdapterContract.getVotingWeightByDepositAmount(
        daoAddr,
        hre.ethers.utils.parseEther("8"));

    console.log(rel);
}

const collectiveVestInfo = async (daoAddr, proposalId) => {
    const daoContrct = (await hre.ethers.getContractFactory("DaoRegistry"))
        .attach(daoAddr);
    const GP_ADDRESS = await daoContrct.getAddressConfiguration("0x5460409b9aa4688f80c10b29c3d7ad16025f050f472a6882a45fa7bb9bd12fb1")
    const collectiveAllocationAdapterContractAddr = await daoContrct.getAdapterAddress("0xbba99fd05ef530e2ad5cae360774c7ec6b1f135b279ab165354152f7dc991c10");
    const collectiveAllocationAdapterContract = (await hre.ethers.getContractFactory("CollectiveAllocationAdapterContract"))
        .attach(collectiveAllocationAdapterContractAddr);
    const colletiveFundingProposalAdapterContractAddr = await daoContrct.getAdapterAddress("0x72894213a5c7f56b36b2947fa6ea18963d6bb1a68746b46d7f552cca76e1a7a8");
    const colletiveFundingProposalAdapterContract = (await hre.ethers.getContractFactory("ColletiveFundingProposalAdapterContract"))
        .attach(colletiveFundingProposalAdapterContractAddr);

    let collectiveFundingPoolAdapterContractAddr = await daoContrct.getAdapterAddress("0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea");
    const colletiveFundingPoolAdapterContract = (await hre.ethers.getContractFactory("ColletiveFundingPoolAdapterContract"))
        .attach(collectiveFundingPoolAdapterContractAddr);

    // const veinfo = await collectiveAllocationAdapterContract.vestingInfos(
    //     daoAddr,
    //     proposalId,
    //     GP_ADDRESS
    // );
    // console.log(veinfo);

    const pn = await collectiveAllocationAdapterContract.getProposerBonus(daoAddr, "0x06bc456535ec14669c1b116d339226faba08b429",
        hre.ethers.utils.parseEther("100000")
    );
    console.log("ProposerBonus", pn);

    const COLLECTIVE_PAYBACK_TOKEN_MANAGEMENT_FEE_AMOUNT = await daoContrct.getConfiguration("0x8b16fcc7f28e07601cf35dbe966264f4e6dba6686614b06b65a1cbacdd6721b5");
    console.log("manage fee", COLLECTIVE_PAYBACK_TOKEN_MANAGEMENT_FEE_AMOUNT);

    // const lps = await colletiveFundingPoolAdapterContract.getAllInvestors(daoAddr);
    // console.log(lps);

    const mems = await daoContrct.getAllSteward();
    console.log("members ", mems);

    const colectiveFundingpoolExtAddress = await daoContrct.getExtensionAddress("0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab")
    const collectiveInvestmentPoolExtension = (await hre.ethers.getContractFactory("CollectiveInvestmentPoolExtension")).attach(colectiveFundingpoolExtAddress);
    const a1 = await collectiveInvestmentPoolExtension.getPriorAmount(
        "0x06bc456535ec14669c1b116d339226faba08b429",
        "0xfce5fdebf0fe1ff0674a1294d5cd8018a0e30cd6",
        15221116
    );
    console.log("balance ", a1);

    const proposal = await colletiveFundingProposalAdapterContract.proposals(daoAddr, proposalId);
    console.log("token ", proposal.fundingInfo.token);
    console.log("executedBlockNum ", proposal.executeBlockNum);
    console.log("paybackAmount ", proposal.escrowInfo.paybackAmount);
    console.log("proposer ", proposal.proposer);

    const COLLECTIVE_PROPOSER_TOKEN_REWARD_RADIO = await daoContrct.getConfiguration("0x5336359c44e86b23d844644c110b45f50decf679c37f24a46bd2b39999632875");
    console.log("COLLECTIVE_PROPOSER_TOKEN_REWARD_RADIO ", COLLECTIVE_PROPOSER_TOKEN_REWARD_RADIO)

    const ismember = await daoContrct.isMember(proposal.proposer);
    console.log("ismember ", ismember);
    const totalFund = await collectiveInvestmentPoolExtension.getPriorAmount(
        "0x000000000000000000000000000000000000decd",
        "0xfce5fdebf0fe1ff0674a1294d5cd8018a0e30cd6",
        15221116
    );
    console.log("totalFund ", totalFund);

    const paybackTokenAmount = toBN(a1).mul(toBN(proposal.escrowInfo.paybackAmount)).div(toBN(totalFund));
    console.log("paybackTokenAmount ", paybackTokenAmount);

    const ire = await collectiveAllocationAdapterContract.getInvestmentRewards(
        daoAddr,
        "0x06bc456535ec14669c1b116d339226faba08b429",
        proposalId
    );

    console.log(ire);
}

const getCollectiveVestingInfo = async (vestId) => {
    // const daoContrct = (await hre.ethers.getContractFactory("DaoRegistry"))
    //     .attach(daoAddr);

    // const collectiveVestingContractAddr = await daoContrct.getAdapterAddress("0x15c9835cf5910308466ec9cbdb6a0be1b9ea161943cc4caf2457bc33d880f197");
    const collectiveVestingAdapterContract = (await hre.ethers.getContractFactory("CollectiveVestingAdapterContract"))
        .attach("0x39BFE50805dfa290d5911D1d8d703F0e36F1A58D");

    const vestingInfo = await collectiveVestingAdapterContract.vests(vestId);
    console.log(vestingInfo);
}

const summonCollectiveDao = async () => {
    console.log("summon collective dao...");
    const daoFactory = "0x6F0643bc2Fc62103f24DF49876d35Fab5FfE7208";
    const collectiveFundingPoolFactory = "0xCC1da35298434F923f05582C7Ed00Cae5b8571Fc";

    const daoFactoriesAddress = [
        daoFactory,
        collectiveFundingPoolFactory
    ];
    _daoName = "collective-script-0920";

    const creator = "0xDF9DFA21F47659cf742FE61030aCb0F15f659707";

    const collectiveDaosetAdaptContAddr = "0x60cE3210Bb7BBf06E539DD855f679215aA5bc83B"
    const collectiveGovernorManagmentAdapterContractAddr = "0x6cf668Cb88703b264747144cD208dD6730862F10"
    const collectiveVotingContractAddr = "0x781eA647bFa527Ef4B179042E16cFffa27F1957A"
    const collectiveFundingPoolAdapterContractAddr = "0x208c28b0D98763C60269b52fC6a4438B89C3e114"
    const colletiveFundRaiseProposalContractAddr = "0x17Ed4674826d5cE207012E185993c12E914aCe21"
    const collectivePaybackTokenAdapterContractAddr = "0x95794FF0b9ce2C511b569FdD29C77EAd501c3762"
    const collectiveAllocationAdapterContractAddr = "0xE9cc2F7FB1DF9d4D4ca400235133F1F61D002Af8"
    const colletiveFundingProposalContractAddr = "0x946E0b398C2d50Cf992704A8f61Bba98f8069613"
    const collectiveDistributeAdatperContractAddr = "0x43773B522Cc07E6cEBD4Ecd149013162d25D9B7a"
    const bentoBoxV1Addr = "0x5247bA0B5790c05277D6470Fa01BB7EBc34B61c9"
    const collectiveVestingContractAddr = "0x39BFE50805dfa290d5911D1d8d703F0e36F1A58D"
    const collectiveEscrowFundAdapterContractAddr = "0x63571BCbfC67Fb73D6878Fd431670B943F8A1F8E"
    const collectiveTopUPAdaptContrAddr = "0xCcB0a4450b21407A9e03E142C4b344c1B2657463"
    const colletiveExpenseProposalContractAddr = "0x9a32C5F1008AFe478a28cE2b488Ae18b1cb08BFc"
    const collectiveFreeInEscrowFundAdapterContractAddr = "0xb57CbfB2b8b1255070D624f1E9408f4E21bee12D"
    const colletiveClearFundProposalAdapterContractAddr = "0xe5747c8Bb8b1dac4E9852c7e084706ee20E6c6A6"
    const collectiveRedemptionFeeEscrowAdapterContractAddr = "0x780330E019F443DF64C7055Eee36AE0646302EDa"
    const colletiveSetRiceReceiverProposalAdapterContracAddr = "0xd24CF3E7f05Cc5D244D6aa4e85551361Cb046f93"

    const enableAdapters = [
        {
            id: '0xdac6d9ce728ebc92a61253866b4e5a4c73b76ba0aa11e7297a633f6232f54237', //colletiveDaoSetProposalContract
            addr: collectiveDaosetAdaptContAddr,
            flags: 1794058
        },
        {
            id: '0x1a4f1390baec30049008138e650571a3c4374eba88116bc89dc192f2f9295efe', //colletiveGovernorManagementContract
            addr: collectiveGovernorManagmentAdapterContractAddr,
            flags: 6338
        },
        {
            id: '0x907642cbfe4e58ddd14eaa320923fbe4c29721dd0950ae4cb3b2626e292791ae',//collectiveVotingContract
            addr: collectiveVotingContractAddr,
            flags: 258
        },
        {
            id: '0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea', //colletiveFundingPoolContract
            addr: collectiveFundingPoolAdapterContractAddr,
            flags: 200
        },
        {
            id: '0x3a06648a49edffe95b8384794dfe9cf3ab34782fab0130b4c91bfd53f3407e6b', //colletiveFundRaiseProposalContract
            addr: colletiveFundRaiseProposalContractAddr,
            flags: 1034
        },
        {
            id: '0x3b8222b84816150ff171ef9b3356ce3d250b8e7c01c09c0208949acc0880db34', //collectivePaybackTokenAdapterContract
            addr: collectivePaybackTokenAdapterContractAddr,
            flags: 0
        },
        {
            id: '0xbba99fd05ef530e2ad5cae360774c7ec6b1f135b279ab165354152f7dc991c10', //collectiveAllocationAdapterContract
            addr: collectiveAllocationAdapterContractAddr,
            flags: 0
        },
        {
            id: '0x72894213a5c7f56b36b2947fa6ea18963d6bb1a68746b46d7f552cca76e1a7a8', //colletiveFundingProposalContract
            addr: colletiveFundingProposalContractAddr,
            flags: 770
        },
        {
            id: '0x183027a84d1b84d3cbf7b351110205fd057b5701a490be772ea6489292256ee3', //collectiveDistributeAdatperContract
            addr: collectiveDistributeAdatperContractAddr,
            flags: 0
        },
        {
            id: '0xdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a', // ben to box
            addr: bentoBoxV1Addr,
            flags: 0
        },
        {
            id: '0x15c9835cf5910308466ec9cbdb6a0be1b9ea161943cc4caf2457bc33d880f197', // collectiveVestingContract
            addr: collectiveVestingContractAddr,
            flags: 0
        },
        {
            id: '0x372fda66f626a705d3a459960a1457403a7c3564acccedc00092ea70262b7083', // collectiveEscrowFundAdapterContract
            addr: collectiveEscrowFundAdapterContractAddr,
            flags: 0
        },
        {
            id: '0x3b4de3360220463b2e1b681516ac7919070009f0544e8465d80dc511828dae5b', // colletiveTopUpProposalContract
            addr: collectiveTopUPAdaptContrAddr,
            flags: 4194306
        }, {
            id: '0xd0e09561b13ad01191fc8f65f6fc85651e4f495d3f9ab93d95010ea58382434b', // colletiveExpenseProposalContract
            addr: colletiveExpenseProposalContractAddr,
            flags: 2097162
        },
        {
            id: '0x4bb6d123745fe9358fe205a70b7a4aae2a445c56d4bc19c9a123a9259ff615a1', // colletiveExpenseProposalContract
            addr: collectiveFreeInEscrowFundAdapterContractAddr,
            flags: 0
        },
        {
            id: '0x851d65965a45a40b902ee7de04ff05b19ff7fde56dd486fd3108dc5cd9249f06',//colletiveClearFundProposalAdapterContract
            addr: colletiveClearFundProposalAdapterContractAddr,
            flags: 8388618
        },
        {
            id: '0x1ec3ab9b73a5166bb51de3096776c3fb06df7dc0a5e2df3038eb0588fad3adbc', // collectiveRedemptionFeeEscrowAdapterContract
            addr: collectiveRedemptionFeeEscrowAdapterContractAddr,
            flags: 0
        },
        {
            id: '0x9e82e8ea7f567cfdc187328108cbbacfa60391a3b15920f636c4185ecdce21a5', // colletiveSetRiceReceiverProposalAdapterContract
            addr: colletiveSetRiceReceiverProposalAdapterContracAddr,
            flags: 33554442
        }
    ];

    const adapters1 = [
        {
            id: '0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab',
            addr: collectiveFundingPoolAdapterContractAddr, //collectiveFundingPoolAdapterContract
            flags: 23
        },
        {
            id: '0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab',
            addr: colletiveFundingProposalContractAddr, //colletiveFundingProposalContract
            flags: 14
        },
        {
            id: '0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab',
            addr: collectiveDistributeAdatperContractAddr, // collectiveDistributeAdatperContract
            flags: 22
        },
        {
            id: '0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab',
            addr: collectiveGovernorManagmentAdapterContractAddr, // colletiveGovernorManagementContract
            flags: 1
        }
    ];

    let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

    const collectiveDaoIvestorCapInfo = [
        false, //bool enable;
        3 //uint256 maxParticipantsAmount;
    ];

    const enable = false;
    const varifyType = 3;
    const minHolding = 1;
    const tokenAddress = ZERO_ADDRESS;
    const tokenId = 2;
    const whiteList = [
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

    const proposerInvestTokenReward = hre.ethers.utils.parseEther("0.001"); // 0.2%;
    const proposerPaybackTokenReward = hre.ethers.utils.parseEther("0.001"); // 0.2%;

    const currency = "0xFCe5FdEbF0fe1ff0674A1294D5Cd8018A0e30cD6";
    const riceRewardReceiver = "0xDF9DFA21F47659cf742FE61030aCb0F15f659707";

    const CollectiveDaoInfo = [
        name,
        creator,
        currency,
        redemptionFee,
        proposerInvestTokenReward,
        proposerPaybackTokenReward,
        riceRewardReceiver
    ];

    const collectiveDaoParams = [
        daoFactoriesAddress,
        enableAdapters,
        adapters1,
        collectiveDaoIvestorCapInfo,
        collectiveGovernorMembershipInfo,
        CollectiveDaoVotingInfo,
        CollectiveDaoInfo
    ];

    // console.log(collectiveDaoParams);

    const summonCollectiveDaoContAddr = "0x0aD893d6992079DF87E55A02918396F2a25f5821";

    const summonCollectiveDaoCont = (await hre.ethers.getContractFactory("SummonCollectiveDao")).attach(summonCollectiveDaoContAddr);
    let tx = await summonCollectiveDaoCont.summonCollectiveDao(collectiveDaoParams);
    let result = await tx.wait();

    const daoFactoryContract = (await hre.ethers.getContractFactory("DaoFactory")).attach(daoFactory);

    const daoAddr = await daoFactoryContract.getDaoAddress(_daoName);
    console.log('daoAddr: ', daoAddr);
}

const getReceiptNFTInfo = async () => {
    const investmentReceiptERC721 = (await hre.ethers.getContractFactory("InvestmentReceiptERC721"))
        .attach("0x053d02bBdE4Cd3596d0f4368a51f77dCB099F365");

    const flexInvestmentContrAddress = await investmentReceiptERC721.flexInvestmentContrAddress();
    const vintageInvestmentContrAddress = await investmentReceiptERC721.vintageInvestmentContrAddress();
    const collectiveInvestmentContrAddress = await investmentReceiptERC721.collectiveInvestmentContrAddress();
    const receiptERC721HelperContrAddress = await investmentReceiptERC721.receiptERC721HelperContrAddress();


    console.log(`
        flexInvestmentContrAddress      ${flexInvestmentContrAddress}
        vintageInvestmentContrAddress    ${vintageInvestmentContrAddress}
        collectiveInvestmentContrAddress  ${collectiveInvestmentContrAddress}
        receiptERC721HelperContrAddress  ${receiptERC721HelperContrAddress}

        `);
}

const getInvestmentEscrowNFTSvg = async () => {
    const vestingNFT = (await hre.ethers.getContractFactory("VestingERC721"))
        .attach("0xf369eDA894d1a95120e6957144d45ea050524178");

    const rel = await vestingNFT.getSvg(1);
    console.log(rel);
}


const crateBatchVesting = async () => {
    const manualVestingContr = (await hre.ethers.getContractFactory("ManualVesting"))
        .attach("0x5Ec3A0aB6286F2199352AA2dbdB8474faE34EFfA");

    const currentID = await manualVestingContr.vestIds();
    console.log(currentID);

    const apprAddr = "0x78CfFd8A45bc890a14f8F29029F87dBeE3577fA0"

    const erc20 = (await hre.ethers.getContractAt(
        "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
        "0x32Bf9E40E6b94419f2E49DD112231BFAEcAC3B6C")
    );

    await erc20.approve(apprAddr, hre.ethers.utils.parseEther("200"));
    console.log("approved...");
    let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

    const vstartTime = toBN(blocktimestamp).add(toBN(60 * 1));
    const vendTime = toBN(vstartTime).add(toBN(60 * 60 * 500));
    const vcliffEndTime = toBN(vstartTime).add(toBN(60 * 60 * 1));
    const vvestingInterval = 60 * 60 * 1;
    const vpaybackToken = "0x32Bf9E40E6b94419f2E49DD112231BFAEcAC3B6C";
    const vrecipientAddr = ZERO_ADDRESS;
    const vdepositAmount = hre.ethers.utils.parseEther("0");
    const vcliffVestingAmount = hre.ethers.utils.parseEther("0.032");
    const vnftEnable = true;
    const verc721 = "0x0Eac1c6eF15B5e44920945CF3787855Ce7a52bc5";
    const vname = "vesting nft disable";
    const vdes = "99932fd";


    const CreateVestingParams = [
        vstartTime,
        vcliffEndTime,
        vendTime,
        vvestingInterval,
        vpaybackToken,
        vrecipientAddr,
        vdepositAmount,
        vcliffVestingAmount,
        vnftEnable,
        verc721,
        vname,
        vdes
    ];

    await manualVestingContr.batchCreate2(
        [
            "0xDF9DFA21F47659cf742FE61030aCb0F15f659707",
            "0x06bc456535ec14669c1b116d339226faba08b429",
            "0xef72177cb6ce54f17a75c174c7032bf7703689b4"
        ]
        ,
        [
            hre.ethers.utils.parseEther("30"),
            hre.ethers.utils.parseEther("50"),
            hre.ethers.utils.parseEther("33")
        ],
        CreateVestingParams
    );

    console.log("created...");

}

const getManualNFTURI = async () => {
    const manualVestingERC721 = (await hre.ethers.getContractFactory("ManualVestingERC721"))
        .attach("0x097311e1a4FCf0DEB1266d3445D44D297f7929fE");


    const uri = await manualVestingERC721.tokenURI(1);
    const svg = await manualVestingERC721.getSvg(1)
    console.log(svg);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });