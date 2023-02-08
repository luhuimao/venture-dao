//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// import "./core/DaoFactory.sol";
import "./extensions/fundingpool/FundingPoolFactory.sol";
import "./extensions/gpdao/GPDaoFactory.sol";
import "./extensions/gpdao/GPDao.sol";
import "./flex/extensions/FlexFundingPoolFactory.sol";
import "./flex/adatpers/FlexFunding.sol";
import "./flex/adatpers/FlexFundingPoolAdapter.sol";
import "./flex/adatpers/FlexPollingVoting.sol";
import "./helpers/DaoHelper.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "hardhat/console.sol";

contract SummonDao {
    event VintageDaoCreated(
        address daoFactoryAddress,
        address daoAddr,
        string name,
        address creator
    );
    event FlexDaoCreated(
        address daoFactoryAddress,
        address daoAddr,
        string name,
        address creator
    );

    constructor() {}

    struct Adapter {
        bytes32 id;
        address addr;
        uint128 flags;
    }

    // struct SummonVintageDaoLocalVars {
    //     DaoFactory daoFac;
    //     FundingPoolFactory fundingPoolFac;
    //     address newDaoAddr;
    //     address newFundingPoolExtAddr;
    //     DaoRegistry newDao;
    //     GPDaoFactory gpDaoFac;
    //     address newGpDaoExtAddr;
    // }
    // struct VintageDaoVotingInfo {
    //     uint256 votingPeriod;
    //     uint8 votingPower;
    //     uint256 superMajority;
    //     uint256 quorum;
    //     uint256 proposalExecutePeriod;
    // }
    // struct VintageMembershipInfo {
    //     bool enable;
    //     uint8 validateType;
    //     uint256 minHolding;
    //     address tokenAddress;
    //     uint256 tokenId;
    //     address[] whiteLists;
    // }
    // struct VintageParticipantCapInfo {
    //     bool enable;
    //     uint256 maxParticipants;
    // }
    // struct VintageDaoParams {
    //     address[] daoFactoriesAddress;
    //     string name;
    //     address creator;
    //     DaoFactory.Adapter[] enalbeAdapters;
    //     DaoFactory.Adapter[] adapters1;
    //     DaoFactory.Adapter[] adapters2;
    //     VintageDaoVotingInfo votingInfo;
    //     VintageMembershipInfo membershipInfo;
    //     VintageParticipantCapInfo participantCapInfo;
    //     address[] raisers;
    // }

    // function summonVintageDao(VintageDaoParams calldata params)
    //     external
    //     returns (bool)
    // {
    //     require(
    //         params.votingInfo.votingPeriod > 0 &&
    //             params.votingInfo.superMajority > 0 &&
    //             params.votingInfo.quorum > 0 &&
    //             params.votingInfo.proposalExecutePeriod > 0,
    //         "invalid params"
    //     );
    //     // if (params.membershipInfo.enable) {
    //     //     require(params.membershipInfo);
    //     // }
    //     SummonVintageDaoLocalVars memory vars;
    //     //create dao
    //     vars.daoFac = DaoFactory(params.daoFactoriesAddress[0]);
    //     vars.daoFac.createDao(params.name, msg.sender);
    //     vars.newDaoAddr = vars.daoFac.getDaoAddress(params.name);
    //     require(
    //         vars.newDaoAddr != address(0x0),
    //         "SummmonDao::summonVintageDao::create dao failed"
    //     );
    //     //create funding pool extension...
    //     vars.fundingPoolFac = FundingPoolFactory(params.daoFactoriesAddress[1]);
    //     vars.fundingPoolFac.create(vars.newDaoAddr);
    //     vars.newFundingPoolExtAddr = vars.fundingPoolFac.getExtensionAddress(
    //         vars.newDaoAddr
    //     );
    //     require(
    //         vars.newFundingPoolExtAddr != address(0x0),
    //         "SummmonDao::summonVintageDao::create funding pool extension failed"
    //     );
    //     //add funding pool extension to dao...
    //     vars.newDao = DaoRegistry(vars.newDaoAddr);
    //     vars.newDao.addExtension(
    //         DaoHelper.FUNDINGPOOL_EXT, // sha3("funding-pool-ext"),
    //         IExtension(vars.newFundingPoolExtAddr),
    //         msg.sender
    //     );
    //     //create gp dao extension...
    //     vars.gpDaoFac = GPDaoFactory(params.daoFactoriesAddress[2]);
    //     vars.gpDaoFac.create(vars.newDaoAddr);
    //     vars.newGpDaoExtAddr = vars.gpDaoFac.getExtensionAddress(
    //         vars.newDaoAddr
    //     );
    //     require(
    //         vars.newGpDaoExtAddr != address(0x0),
    //         "SummmonDao::summonVintageDao::create gp dao extension failed"
    //     );
    //     //add gp dao extension to dao...
    //     vars.newDao.addExtension(
    //         DaoHelper.GPDAO_EXT, // sha3("gp-dao-ext"),
    //         IExtension(vars.newGpDaoExtAddr),
    //         msg.sender
    //     );
    //     //add adapters to dao...
    //     vars.daoFac.addAdapters(vars.newDao, params.enalbeAdapters);
    //     //configure adapters access to extensions ...
    //     vars.daoFac.configureExtension(
    //         vars.newDao,
    //         vars.newFundingPoolExtAddr, //FundingPoolExtension
    //         params.adapters1
    //     );
    //     //configure extensions access to extensions ...
    //     vars.daoFac.configureExtension(
    //         vars.newDao,
    //         vars.newFundingPoolExtAddr, //FundingPoolExtension
    //         params.adapters2
    //     );
    //     //config dao setting...
    //     setVintageDaoConfiguration(vars.newDao, params);
    //     registerRaiser(vars.newDao, params);
    //     emit VintageDaoCreated(
    //         params.daoFactoriesAddress[0],
    //         vars.newDaoAddr,
    //         params.name,
    //         msg.sender
    //     );
    //     return true;
    // }

    // function summonVintageDao1(VintageDaoParams calldata params)
    //     external
    //     returns (bool)
    // {
    //     require(
    //         params.votingInfo.votingPeriod > 0 &&
    //             params.votingInfo.superMajority > 0 &&
    //             params.votingInfo.quorum > 0 &&
    //             params.votingInfo.proposalExecutePeriod > 0,
    //         "invalid params"
    //     );
    //     // if (params.membershipInfo.enable) {
    //     //     require(params.membershipInfo);
    //     // }
    //     SummonVintageDaoLocalVars memory vars;
    //     //create dao
    //     vars.daoFac = DaoFactory(params.daoFactoriesAddress[0]);
    //     vars.daoFac.createDao(params.name, msg.sender);
    //     vars.newDaoAddr = vars.daoFac.getDaoAddress(params.name);
    //     require(
    //         vars.newDaoAddr != address(0x0),
    //         "SummmonDao::summonVintageDao::create dao failed"
    //     );
    //     emit VintageDaoCreated(
    //         params.daoFactoriesAddress[0],
    //         vars.newDaoAddr,
    //         params.name,
    //         msg.sender
    //     );
    //     return true;
    // }

    // function summonVintageDao2(
    //     VintageDaoParams calldata params,
    //     address newDaoAddr
    // ) external returns (bool) {
    //     //create funding pool extension...
    //     FundingPoolFactory fundingPoolFac = FundingPoolFactory(
    //         params.daoFactoriesAddress[1]
    //     );
    //     fundingPoolFac.create(newDaoAddr);
    //     address newFundingPoolExtAddr = fundingPoolFac.getExtensionAddress(
    //         newDaoAddr
    //     );
    //     require(
    //         newFundingPoolExtAddr != address(0x0),
    //         "SummmonDao::summonVintageDao::create funding pool extension failed"
    //     );
    //     //add funding pool extension to dao...
    //     DaoRegistry newDao = DaoRegistry(newDaoAddr);
    //     newDao.addExtension(
    //         DaoHelper.FUNDINGPOOL_EXT, // sha3("funding-pool-ext"),
    //         IExtension(newFundingPoolExtAddr),
    //         msg.sender
    //     );
    // }

    // function summonVintageDao3(
    //     VintageDaoParams calldata params,
    //     address newDaoAddr
    // ) external returns (bool) {
    //     //create gp dao extension...
    //     GPDaoFactory gpDaoFac = GPDaoFactory(params.daoFactoriesAddress[2]);
    //     gpDaoFac.create(newDaoAddr);
    //     address newGpDaoExtAddr = gpDaoFac.getExtensionAddress(newDaoAddr);
    //     require(
    //         newGpDaoExtAddr != address(0x0),
    //         "SummmonDao::summonVintageDao::create gp dao extension failed"
    //     );
    //     //add gp dao extension to dao...
    //     DaoRegistry newDao = DaoRegistry(newDaoAddr);
    //     newDao.addExtension(
    //         DaoHelper.GPDAO_EXT, // sha3("gp-dao-ext"),
    //         IExtension(newGpDaoExtAddr),
    //         msg.sender
    //     );
    // }

    // function summonVintageDao4(
    //     VintageDaoParams calldata params,
    //     address newDaoAddr
    // ) external returns (bool) {
    //     // //add adapters to dao...
    //     DaoFactory daoFac = DaoFactory(params.daoFactoriesAddress[0]);
    //     DaoRegistry newDao = DaoRegistry(newDaoAddr);

    //     daoFac.addAdapters(newDao, params.enalbeAdapters);
    //     // //configure adapters access to extensions ...
    //     FundingPoolFactory fundingPoolFac = FundingPoolFactory(
    //         params.daoFactoriesAddress[1]
    //     );
    //     address newFundingPoolExtAddr = fundingPoolFac.getExtensionAddress(
    //         newDaoAddr
    //     );
    //     daoFac.configureExtension(
    //         newDao,
    //         newFundingPoolExtAddr, //FundingPoolExtension
    //         params.adapters1
    //     );
    // }

    // function summonVintageDao5(
    //     VintageDaoParams calldata params,
    //     address newDaoAddr
    // ) external returns (bool) {
    //     //config dao setting...
    //     DaoRegistry newDao = DaoRegistry(newDaoAddr);
    //     setVintageDaoConfiguration(newDao, params);
    // }

    // function summonVintageDao6(
    //     VintageDaoParams calldata params,
    //     address newDaoAddr
    // ) external returns (bool) {
    //     DaoRegistry newDao = DaoRegistry(newDaoAddr);
    //     registerRaiser(newDao, params);
    // }

    // function setVintageDaoConfiguration(
    //     DaoRegistry dao,
    //     VintageDaoParams calldata params
    // ) internal {
    //     dao.setConfiguration(
    //         DaoHelper.PROPOSAL_EXECUTE_DURATION,
    //         params.votingInfo.proposalExecutePeriod
    //     ); //config PROPOSAL_EXECUTE_DURATION

    //     dao.setConfiguration(
    //         DaoHelper.VOTING_PERIOD,
    //         params.votingInfo.votingPeriod
    //     ); //config VOTING_PERIOD

    //     dao.setConfiguration(DaoHelper.QUORUM, params.votingInfo.quorum); //config QUORUM

    //     dao.setConfiguration(
    //         DaoHelper.SUPER_MAJORITY,
    //         params.votingInfo.superMajority
    //     ); //config SUPER_MAJORITY

    //     if (params.participantCapInfo.enable) {
    //         dao.setConfiguration(DaoHelper.MAX_PARTICIPANTS_ENABLE, 1); //config MAX_PARTICIPANTS_ENABLE
    //         dao.setConfiguration(
    //             DaoHelper.MAX_PARTICIPANTS,
    //             params.participantCapInfo.maxParticipants
    //         ); //config MAX_PARTICIPANTS
    //     }

    //     if (params.membershipInfo.enable) {
    //         dao.setConfiguration(DaoHelper.VINTAGE_RAISER_MEMBERSHIP_ENABLE, 1);
    //         dao.setConfiguration(
    //             DaoHelper.VINTAGE_RAISER_MEMBERSHIP_TYPE,
    //             uint256(params.membershipInfo.validateType)
    //         );
    //         // 0- ERC2O
    //         // 1- ERC721
    //         // 2- ERC1155
    //         // 3- Deposit
    //         // 4- Whitelist
    //         if (
    //             params.membershipInfo.validateType == 0 ||
    //             params.membershipInfo.validateType == 1 ||
    //             params.membershipInfo.validateType == 2
    //         ) {
    //             dao.setAddressConfiguration(
    //                 DaoHelper.VINTAGE_RAISER_MEMBERSHIP_TOKEN_ADDRESS,
    //                 params.membershipInfo.tokenAddress
    //             );
    //         }
    //         if (params.membershipInfo.validateType == 2) {
    //             dao.setConfiguration(
    //                 DaoHelper.VINTAGE_RAISER_MEMBERSHIP_TOKENID,
    //                 params.membershipInfo.tokenId
    //             );
    //         }
    //         if (
    //             params.membershipInfo.validateType == 0 ||
    //             params.membershipInfo.validateType == 1 ||
    //             params.membershipInfo.validateType == 2 ||
    //             params.membershipInfo.validateType == 3
    //         ) {
    //             dao.setConfiguration(
    //                 DaoHelper.VINTAGE_RAISER_MEMBERSHIP_MIN_HOLDING,
    //                 params.membershipInfo.minHolding
    //             );
    //         }

    //         if (params.membershipInfo.validateType == 4) {
    //             GPDaoExtension gpDaoExt = GPDaoExtension(
    //                 dao.getExtensionAddress(DaoHelper.GPDAO_EXT)
    //             );
    //             gpDaoExt.addWhiteList(params.membershipInfo.whiteLists);
    //         }
    //     }
    // }

    // function registerRaiser(DaoRegistry dao, VintageDaoParams calldata params)
    //     internal
    // {
    //     if (params.raisers.length > 0) {
    //         for (uint8 i = 0; i < params.raisers.length; i++) {
    //             GPDaoExtension(dao.getExtensionAddress(DaoHelper.GPDAO_EXT))
    //                 .registerGeneralPartner(params.raisers[i]);
    //         }
    //     }
    // }

    struct flexDaoParticipantCapInfo {
        bool enable;
        uint256 maxParticipantsAmount;
    }

    struct flexDaoPaticipantMembershipInfo {
        string name;
        uint8 varifyType;
        uint256 minHolding;
        address tokenAddress;
        uint256 tokenId;
        address[] whiteList;
    }

    struct flexDaoPriorityMembershipInfo {
        uint8 varifyType;
        uint256 minHolding;
        address tokenAddress;
        uint256 tokenId;
        address[] whiteList;
        uint256 priorityPeriod;
    }

    struct flexDaoStewardMembershipInfo {
        bool enable;
        uint256 varifyType;
        uint256 minHolding;
        address tokenAddress;
        uint256 tokenId;
        address[] whiteList;
    }

    struct flexDaoVotingInfo {
        uint256 votingPeriod;
        uint8 votingPower;
        uint256 superMajority;
        uint256 quorum;
        // uint256 proposalExecutePeriod;
    }

    struct flexDaoPollsterMembershipInfo {
        uint8 varifyType;
        uint256 minHolding;
        address tokenAddress;
        uint256 tokenId;
        address[] whiteList;
    }

    struct flexDaoPollingInfo {
        uint256 votingPeriod;
        uint8 votingPower;
        uint256 superMajority;
        uint256 quorum;
        // uint256 proposalExecutePeriod;
    }

    struct flexDaoProposerMembershipInfo {
        uint8 varifyType;
        uint256 minHolding;
        address tokenAddress;
        uint256 tokenId;
        address[] whiteList;
    }

    struct flexDaoInfo {
        string name;
        address creator;
        uint256 flexDaoManagementfee;
        address managementFeeAddress;
        address[] flexDaoGenesisStewards;
        uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
    }

    struct FlexDaoParams {
        address[] daoFactoriesAddress;
        DaoFactory.Adapter[] enalbeAdapters;
        DaoFactory.Adapter[] adapters1;
        bool fundingPollEnable;
        flexDaoParticipantCapInfo _flexDaoParticipantCapInfo;
        bool flexDaoParticipantMembetshipEnable;
        flexDaoPaticipantMembershipInfo _flexDaoPaticipantMembershipInfos;
        bool flexDaoPriorityDepositEnalbe;
        flexDaoPriorityMembershipInfo _flexDaoPriorityMembershipInfo;
        flexDaoStewardMembershipInfo _flexDaoStewardMembershipInfo;
        flexDaoVotingInfo _flexDaoVotingInfo;
        flexDaoPollsterMembershipInfo _flexDaoPollsterMembershipInfo;
        flexDaoPollingInfo _flexDaoPollingInfo;
        flexDaoProposerMembershipInfo _flexDaoProposerMembershipInfo;
        flexDaoInfo _flexDaoInfo;
    }

    //create dao
    function summonFlexDao1(
        address daoFacAddr,
        string calldata daoName,
        address creator
    ) external returns (bool) {
        require(address(this) == msg.sender);
        DaoFactory daoFac = DaoFactory(daoFacAddr);
        daoFac.createDao(daoName, creator);
        address newDaoAddr = daoFac.getDaoAddress(daoName);
        require(
            newDaoAddr != address(0x0),
            "SummmonDao::summonFlexDao::create dao failed"
        );
        emit FlexDaoCreated(daoFacAddr, newDaoAddr, daoName, creator);
    }

    //create new extension and register to dao
    function summonFlexDao2(
        address flexFundingPoolFacAddr,
        address newDaoAddr,
        address creator
    ) external returns (bool) {
        // console.log("caller ", msg.sender);
        // console.log("creator ", creator);
        require(address(this) == msg.sender);
        //create funding pool extension...
        FlexFundingPoolFactory flexFundingPoolFac = FlexFundingPoolFactory(
            flexFundingPoolFacAddr
        );
        flexFundingPoolFac.create(newDaoAddr);
        address newFlexFundingPoolExtAddr = flexFundingPoolFac
            .getExtensionAddress(newDaoAddr);
        //add funding pool extension to dao...
        DaoRegistry newDao = DaoRegistry(newDaoAddr);
        newDao.addExtension(
            DaoHelper.FLEX_FUNDING_POOL_EXT, // sha3("flex-funding-pool-ext"),
            IExtension(newFlexFundingPoolExtAddr),
            creator
        );
    }

    //register adapters to dao
    function summonFlexDao3(
        address daoFacAddr,
        DaoFactory.Adapter[] calldata enalbeAdapters,
        address newDaoAddr
    ) external returns (bool) {
        DaoRegistry newDao = DaoRegistry(newDaoAddr);
        require(address(this) == msg.sender);
        DaoFactory daoFac = DaoFactory(daoFacAddr);
        //add adapters to dao...
        daoFac.addAdapters(newDao, enalbeAdapters);
    }

    //configure adapters access to extensions
    function summonFlexDao4(
        address daoFacAddr,
        address flexFundingPoolFacAddr,
        DaoFactory.Adapter[] calldata adapters1,
        address newDaoAddr
    ) external returns (bool) {
        DaoRegistry newDao = DaoRegistry(newDaoAddr);
        require(address(this) == msg.sender);
        DaoFactory daoFac = DaoFactory(daoFacAddr);
        FlexFundingPoolFactory flexFundingPoolFac = FlexFundingPoolFactory(
            flexFundingPoolFacAddr
        );
        address newFlexFundingPoolExtAddr = flexFundingPoolFac
            .getExtensionAddress(newDaoAddr);
        //configure adapters access to extensions ...
        daoFac.configureExtension(
            newDao,
            newFlexFundingPoolExtAddr, //FlexFundingPoolExtension
            adapters1
        );
    }

    //set dao configaration
    function summonFlexDao5(
        uint256 flexDaoManagementfee,
        address managementFeeAddress,
        uint256 flexDaoFundriaseStyle,
        uint256 votingPeriod,
        uint256 superMajority,
        address newDaoAddr
    ) external returns (bool) {
        DaoRegistry newDao = DaoRegistry(newDaoAddr);
        require(address(this) == msg.sender);
        //1config FLEX_MANAGEMENT_FEE_AMOUNT
        newDao.setConfiguration(
            DaoHelper.FLEX_MANAGEMENT_FEE_AMOUNT,
            flexDaoManagementfee
        );
        // 2config FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS
        newDao.setAddressConfiguration(
            DaoHelper.FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS,
            managementFeeAddress
        );
        //3config FLEX_FUNDRAISE_STYLE
        newDao.setConfiguration(
            DaoHelper.FLEX_FUNDRAISE_STYLE,
            flexDaoFundriaseStyle
        );

        //4config VOTING_PERIOD
        newDao.setConfiguration(DaoHelper.VOTING_PERIOD, votingPeriod);

        //5config SUPER_MAJORITY
        newDao.setConfiguration(DaoHelper.SUPER_MAJORITY, superMajority);
    }

    //registerGenesisStewards
    function summonFlexDao6(
        address[] calldata flexDaoGenesisStewards,
        address newDaoAddr
    ) external returns (bool) {
        DaoRegistry newDao = DaoRegistry(newDaoAddr);
        require(address(this) == msg.sender);

        registerGenesisStewards(newDao, flexDaoGenesisStewards);
    }

    // config polling && PARTICIPANTS CAP
    function summonFlexDao7(
        bool[2] memory booleanParams,
        uint256[7] memory uint256Params,
        address flexDaoPollsterMembershipTokenAddress,
        address[] calldata flexDaoPollsterMembershipWhiteList,
        address newDaoAddr
    ) external returns (bool) {
        //  booleanParams[0] fundingPollEnable,
        //  booleanParams[1] participantEnable,
        //  uint256Params[0] maxParticipantsAmount
        //  uint256Params[1] flexDaoPollingVotingPeriod
        //  uint256Params[2] flexDaoPollingVotingPower
        //  uint256Params[3] flexDaoPollingSuperMajority
        //  uint256Params[4] flexDaoPollsterMembershipVarifyType
        //  uint256Params[5] flexDaoPollsterMembershipMinHolding
        //  uint256Params[6] flexDaoPollsterMembershipTokenId
        DaoRegistry dao = DaoRegistry(newDaoAddr);
        require(address(this) == msg.sender);

        //1config polling
        if (booleanParams[0]) {
            dao.setConfiguration(DaoHelper.FLEX_FUNDING_TYPE, 1);
            configFlexDaoFlexPolling(
                dao,
                uint256Params[1],
                uint256Params[2],
                uint256Params[3]
            );
            configFlexDaoPollsterMembership(
                dao,
                uint256Params[4],
                uint256Params[5],
                flexDaoPollsterMembershipTokenAddress,
                uint256Params[6],
                flexDaoPollsterMembershipWhiteList
            );
        }

        //2config PARTICIPANTS CAP
        if (booleanParams[1]) {
            dao.setConfiguration(DaoHelper.MAX_PARTICIPANTS_ENABLE, 1);
            dao.setConfiguration(DaoHelper.MAX_PARTICIPANTS, uint256Params[0]);
        }
    }

    // config Steward Membership
    function summonFlexDao8(
        bool flexDaoStewardMembershipEnable,
        uint256[6] memory uint256Params,
        address flexDaoStewardMembershipTokenAddress,
        address[] calldata flexDaoStewardMembershipWhitelist,
        address flexDaoProposerMembershipTokenAddress,
        address[] calldata flexDaoProposerMembershipWhiteList,
        address newDaoAddr
    ) external returns (bool) {
        // uint256Params[0] flexDaoStewardMembershipVarifyType
        // uint256Params[1] flexDaoStewardMembershipMinHolding
        // uint256Params[2] flexDaoStewardMembershipInfoTokenId
        // uint256Params[3] flexDaoProposerMembershipVarifyType
        // uint256Params[4] flexDaoProposerMembershipTokenId
        // uint256Params[5] flexDaoProposerMembershipMinHolding
        DaoRegistry dao = DaoRegistry(newDaoAddr);
        require(address(this) == msg.sender);

        //3config Steward Membership
        if (flexDaoStewardMembershipEnable) {
            dao.setConfiguration(DaoHelper.FLEX_STEWARD_MEMBERSHIP_ENABLE, 1);
            dao.setConfiguration(
                DaoHelper.FLEX_STEWARD_MEMBERSHIP_TYPE,
                uint256Params[0]
            );
            if (
                uint256Params[0] == 0 ||
                uint256Params[0] == 1 ||
                uint256Params[0] == 2
            ) {
                dao.setConfiguration(
                    DaoHelper.FLEX_STEWARD_MEMBERSHIP_MINI_HOLDING,
                    uint256Params[1]
                );
                dao.setAddressConfiguration(
                    DaoHelper.FLEX_STEWARD_MEMBERSHIP_TOKEN_ADDRESS,
                    flexDaoStewardMembershipTokenAddress
                );
            }

            if (uint256Params[0] == 2) {
                dao.setConfiguration(
                    DaoHelper.FLEX_STEWARD_MEMBERSHIP_TOKEN_ID,
                    uint256Params[2]
                );
            }

            if (
                uint256Params[0] == 3 &&
                flexDaoStewardMembershipWhitelist.length > 0
            ) {
                for (
                    uint8 i = 0;
                    i < flexDaoStewardMembershipWhitelist.length;
                    i++
                ) {}
            }
        }

        //4 config proposer membership
        configFlexDaoProposerMembership(
            dao,
            uint256Params[3],
            uint256Params[5],
            flexDaoProposerMembershipTokenAddress,
            uint256Params[4],
            flexDaoProposerMembershipWhiteList
        );
    }

    //config participant membership
    function summonFlexDao9(
        bool flexDaoParticipantMembetshipEnable,
        string calldata flexDaoPaticipantMembershipName,
        uint256 flexDaoPaticipantMembershipVarifyType,
        uint256 flexDaoPaticipantMembershipMinHolding,
        uint256 flexDaoPaticipantMembershipTokenId,
        address flexDaoPaticipantMembershipTokenAddress,
        address[] calldata flexDaoPaticipantMembershipWhiteList,
        address newDaoAddr
    ) external returns (bool) {
        DaoRegistry dao = DaoRegistry(newDaoAddr);
        require(address(this) == msg.sender);

        //config participant membership
        if (flexDaoParticipantMembetshipEnable) {
            dao.setConfiguration(
                DaoHelper.FLEX_PARTICIPANT_MEMBERSHIP_ENABLE,
                1
            );
            registerFlexDaoParticipantMembership(
                dao,
                flexDaoPaticipantMembershipName,
                flexDaoPaticipantMembershipVarifyType,
                flexDaoPaticipantMembershipMinHolding,
                flexDaoPaticipantMembershipTokenId,
                flexDaoPaticipantMembershipTokenAddress
            );
            if (flexDaoPaticipantMembershipVarifyType == 3) {
                registerFlexDaoParticipantMembershipWhitelist(
                    dao,
                    flexDaoPaticipantMembershipName,
                    flexDaoPaticipantMembershipWhiteList
                );
            }
        }
    }

    //config priority deposit membership
    function summonFlexDao10(
        bool flexDaoPriorityDepositEnalbe,
        uint256 flexDaoPriorityMembershipVarifyType,
        uint256 flexDaoPriorityMembershipPriorityPeriod,
        uint256 flexDaoPriorityMembershipMinHolding,
        uint256 flexDaoPriorityMembershipTokenId,
        address[] calldata flexDaoPriorityMembershipWhiteList,
        address flexDaoPriorityMembershipTokenAddress,
        address newDaoAddr
    ) external returns (bool) {
        DaoRegistry dao = DaoRegistry(newDaoAddr);
        require(address(this) == msg.sender);

        //config priority deposit membership
        if (flexDaoPriorityDepositEnalbe) {
            configFlexDaoPriorityDepositMembership(
                dao,
                flexDaoPriorityMembershipVarifyType,
                flexDaoPriorityMembershipPriorityPeriod,
                flexDaoPriorityMembershipMinHolding,
                flexDaoPriorityMembershipTokenId,
                flexDaoPriorityMembershipWhiteList,
                flexDaoPriorityMembershipTokenAddress
            );
        }
    }

    function setFlexDaoConfiguration(
        DaoRegistry dao,
        FlexDaoParams calldata params
    ) internal {
        //1config FLEX_MANAGEMENT_FEE_AMOUNT
        dao.setConfiguration(
            DaoHelper.FLEX_MANAGEMENT_FEE_AMOUNT,
            params._flexDaoInfo.flexDaoManagementfee
        );
        // 2config FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS
        dao.setAddressConfiguration(
            DaoHelper.FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS,
            params._flexDaoInfo.managementFeeAddress
        );
        //3config FLEX_FUNDRAISE_STYLE
        dao.setConfiguration(
            DaoHelper.FLEX_FUNDRAISE_STYLE,
            params._flexDaoInfo.flexDaoFundriaseStyle
        );

        //config voting info
        //4config PROPOSAL_EXECUTE_DURATION
        // dao.setConfiguration(
        //     DaoHelper.PROPOSAL_EXECUTE_DURATION,
        //     params._flexDaoVotingInfo.proposalExecutePeriod
        // );

        //5config VOTING_PERIOD
        dao.setConfiguration(
            DaoHelper.VOTING_PERIOD,
            params._flexDaoVotingInfo.votingPeriod
        );

        //6config QUORUM
        dao.setConfiguration(
            DaoHelper.QUORUM,
            params._flexDaoVotingInfo.quorum
        );

        //7config SUPER_MAJORITY
        dao.setConfiguration(
            DaoHelper.SUPER_MAJORITY,
            params._flexDaoVotingInfo.superMajority
        );
    }

    function registerGenesisStewards(
        DaoRegistry dao,
        address[] calldata flexDaoGenesisStewards
    ) internal {
        if (flexDaoGenesisStewards.length > 0) {
            for (uint8 i = 0; i < flexDaoGenesisStewards.length; i++) {
                dao.potentialNewMember(flexDaoGenesisStewards[i]);
            }
        }
    }

    function configFlexDaoPollsterMembership(
        DaoRegistry dao,
        uint256 flexDaoPollsterMembershipVarifyType,
        uint256 flexDaoPollsterMembershipMinHolding,
        address flexDaoPollsterMembershipTokenAddress,
        uint256 flexDaoPollsterMembershipTokenId,
        address[] calldata flexDaoPollsterMembershipWhiteList
    ) internal {
        // 0- ERC2O
        // 1- ERC721
        // 2- ERC1155
        // 3- Whitelist
        dao.setConfiguration(
            DaoHelper.FLEX_POLLSTER_MEMBERSHIP_TYPE,
            flexDaoPollsterMembershipVarifyType
        );

        if (
            flexDaoPollsterMembershipVarifyType == 0 ||
            flexDaoPollsterMembershipVarifyType == 1 ||
            flexDaoPollsterMembershipVarifyType == 2
        ) {
            dao.setConfiguration(
                DaoHelper.FLEX_POLLSTER_MEMBERSHIP_MIN_HOLDING,
                flexDaoPollsterMembershipMinHolding
            );
            dao.setAddressConfiguration(
                DaoHelper.FLEX_POLLSTER_MEMBERSHIP_TOKEN_ADDRESS,
                flexDaoPollsterMembershipTokenAddress
            );
        }
        if (flexDaoPollsterMembershipVarifyType == 2) {
            dao.setConfiguration(
                DaoHelper.FLEX_POLLSTER_MEMBERSHIP_TOKENID,
                flexDaoPollsterMembershipTokenId
            );
        }
        if (flexDaoPollsterMembershipVarifyType == 3) {
            registerFlexDaoPollsterMembershipWhiteList(
                dao,
                flexDaoPollsterMembershipWhiteList
            );
        }
    }

    function configFlexDaoFlexPolling(
        DaoRegistry dao,
        uint256 flexDaoPollingVotingPeriod,
        uint256 flexDaoPollingVotingPower,
        uint256 flexDaoPollingSuperMajority
    ) internal {
        dao.setConfiguration(
            DaoHelper.FLEX_POLLING_VOTING_PERIOD,
            flexDaoPollingVotingPeriod
        );
        dao.setConfiguration(
            DaoHelper.FLEX_POLLING_VOTING_POWER,
            flexDaoPollingVotingPower
        );
        dao.setConfiguration(
            DaoHelper.FLEX_POLLING_SUPER_MAJORITY,
            flexDaoPollingSuperMajority
        );
        // dao.setConfiguration(
        //     DaoHelper.FLEX_POLLING_QUORUM,
        //     params._flexDaoPollingInfo.quorum
        // );
        // dao.setConfiguration(
        //     DaoHelper.FLEX_POLLING_PROPOSAL_EXECUTIONPEERIOD,
        //     params._flexDaoPollingInfo.proposalExecutePeriod
        // );
    }

    function registerFlexDaoPollsterMembershipWhiteList(
        DaoRegistry dao,
        address[] calldata flexDaoPollsterMembershipWhiteList
    ) internal {
        if (flexDaoPollsterMembershipWhiteList.length > 0) {
            FlexPollingVotingContract flexPollingVoting = FlexPollingVotingContract(
                    dao.getAdapterAddress(DaoHelper.FLEX_POLLING_VOTING_ADAPT)
                );
            for (
                uint8 i = 0;
                i < flexDaoPollsterMembershipWhiteList.length;
                i++
            ) {
                flexPollingVoting.registerPollsterWhiteList(
                    dao,
                    flexDaoPollsterMembershipWhiteList[i]
                );
            }
        }
    }

    function registerFlexDaoParticipantMembership(
        DaoRegistry dao,
        string calldata flexDaoPaticipantMembershipName,
        uint256 flexDaoPaticipantMembershipVarifyType,
        uint256 flexDaoPaticipantMembershipMinHolding,
        uint256 flexDaoPaticipantMembershipTokenId,
        address flexDaoPaticipantMembershipTokenAddress
    ) internal {
        FlexFundingPoolAdapterContract flexFundingPool = FlexFundingPoolAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_POOL_ADAPT)
            );
        flexFundingPool.createParticipantMembership(
            dao,
            flexDaoPaticipantMembershipName,
            uint8(flexDaoPaticipantMembershipVarifyType),
            flexDaoPaticipantMembershipMinHolding,
            flexDaoPaticipantMembershipTokenAddress,
            flexDaoPaticipantMembershipTokenId
        );
    }

    function registerFlexDaoParticipantMembershipWhitelist(
        DaoRegistry dao,
        string calldata name,
        address[] calldata _whitelist
    ) internal {
        if (_whitelist.length > 0) {
            FlexFundingPoolAdapterContract flexFundingPool = FlexFundingPoolAdapterContract(
                    dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_POOL_ADAPT)
                );
            for (uint8 i = 0; i < _whitelist.length; i++) {
                flexFundingPool.registerParticipantWhiteList(
                    dao,
                    name,
                    _whitelist[i]
                );
            }
        }
    }

    function configFlexDaoPriorityDepositMembership(
        DaoRegistry dao,
        uint256 flexDaoPriorityMembershipVarifyType,
        uint256 flexDaoPriorityMembershipPriorityPeriod,
        uint256 flexDaoPriorityMembershipMinHolding,
        uint256 flexDaoPriorityMembershipTokenId,
        address[] calldata flexDaoPriorityMembershipWhiteList,
        address flexDaoPriorityMembershipTokenAddress
    ) internal {
        dao.setConfiguration(DaoHelper.FLEX_PRIORITY_DEPOSIT_ENABLE, 1);
        dao.setConfiguration(
            DaoHelper.FLEX_PRIORITY_DEPOSIT_TYPE,
            flexDaoPriorityMembershipVarifyType
        );
        dao.setConfiguration(
            DaoHelper.FLEX_PRIORITY_DEPOSIT_PERIOD,
            flexDaoPriorityMembershipPriorityPeriod
        );
        if (
            flexDaoPriorityMembershipVarifyType == 0 ||
            flexDaoPriorityMembershipVarifyType == 1 ||
            flexDaoPriorityMembershipVarifyType == 2
        ) {
            dao.setConfiguration(
                DaoHelper.FLEX_PRIORITY_DEPOSIT_MIN_HOLDING,
                flexDaoPriorityMembershipMinHolding
            );
            dao.setAddressConfiguration(
                DaoHelper.FLEX_PRIORITY_DEPOSIT_TOKEN_ADDRESS,
                flexDaoPriorityMembershipTokenAddress
            );
        }

        if (flexDaoPriorityMembershipVarifyType == 2) {
            dao.setConfiguration(
                DaoHelper.FLEX_PRIORITY_DEPOSIT_TOKENID,
                flexDaoPriorityMembershipTokenId
            );
        }
        if (flexDaoPriorityMembershipVarifyType == 3) {
            registerFlexDaoPriorityDepositWhiteList(
                dao,
                flexDaoPriorityMembershipWhiteList
            );
        }
    }

    function registerFlexDaoPriorityDepositWhiteList(
        DaoRegistry dao,
        address[] calldata _whitelist
    ) internal {
        if (_whitelist.length > 0) {
            FlexFundingPoolAdapterContract flexFundingPool = FlexFundingPoolAdapterContract(
                    dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_POOL_ADAPT)
                );
            for (uint8 i = 0; i < _whitelist.length; i++) {
                flexFundingPool.registerPriorityDepositWhiteList(
                    dao,
                    _whitelist[i]
                );
            }
        }
    }

    function configFlexDaoProposerMembership(
        DaoRegistry dao,
        uint256 flexDaoProposerMembershipVarifyType,
        uint256 flexDaoProposerMembershipMinHolding,
        address flexDaoProposerMembershipTokenAddress,
        uint256 flexDaoProposerMembershipTokenId,
        address[] calldata flexDaoProposerMembershipWhiteList
    ) internal {
        //config proposer membership
        if (
            flexDaoProposerMembershipVarifyType == 0 ||
            flexDaoProposerMembershipVarifyType == 1 ||
            flexDaoProposerMembershipVarifyType == 2
        ) {
            dao.setConfiguration(
                DaoHelper.FLEX_PROPOSER_MIN_HOLDING,
                flexDaoProposerMembershipMinHolding
            );
            dao.setAddressConfiguration(
                DaoHelper.FLEX_PROPOSER_TOKEN_ADDRESS,
                flexDaoProposerMembershipTokenAddress
            );
        }

        if (flexDaoProposerMembershipVarifyType == 2) {
            dao.setConfiguration(
                DaoHelper.FLEX_PROPOSER_TOKENID,
                flexDaoProposerMembershipTokenId
            );
        }
        dao.setConfiguration(
            DaoHelper.FLEX_PROPOSER_IDENTIFICATION_TYPE,
            flexDaoProposerMembershipVarifyType
        );
        if (flexDaoProposerMembershipVarifyType == 3) {
            registerProposerWhiteList(dao, flexDaoProposerMembershipWhiteList);
        }
    }

    function registerProposerWhiteList(
        DaoRegistry dao,
        address[] calldata _whitelist
    ) internal {
        if (_whitelist.length > 0) {
            FlexFundingAdapterContract flexFunding = FlexFundingAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
            );
            for (uint8 i = 0; i < _whitelist.length; i++) {
                flexFunding.registerProposerWhiteList(dao, _whitelist[i]);
            }
        }
    }

    struct Call {
        address target;
        bytes callData;
    }

    function multiCall(Call[9] memory calls) public {
        console.log("caller:", msg.sender);
        for (uint256 i = 0; i < calls.length; i++) {
            (bool success, bytes memory ret) = calls[i].target.call(
                calls[i].callData
            );
            require(
                success,
                string(
                    abi.encodePacked(
                        "low-level call of summonFlexDao",
                        Strings.toString(i + 2),
                        " failed"
                    )
                )
            );
        }
    }

    struct FlexDaoCallLocalVars {
        bytes summonFlexDao1Payload;
        bytes summonFlexDao2Payload;
        bytes summonFlexDao3Payload;
        bytes summonFlexDao4Payload;
        bytes summonFlexDao5Payload;
        bytes summonFlexDao6Payload;
        bytes summonFlexDao7Payload;
        bytes summonFlexDao8Payload;
        bytes summonFlexDao9Payload;
        bytes summonFlexDao10Payload;
        bool success;
        bytes ret;
        address newDaoAddr;
        Call[9] calls;
    }

    function summonFlexDao(FlexDaoParams calldata params) external {
        // console.log("summondaoContract address ", address(this));
        FlexDaoCallLocalVars memory vars;
        vars.summonFlexDao1Payload = abi.encodeWithSignature(
            "summonFlexDao1(address,string,address)",
            params.daoFactoriesAddress[0],
            params._flexDaoInfo.name,
            params._flexDaoInfo.creator
        );

        (vars.success, vars.ret) = address(this).call(
            vars.summonFlexDao1Payload
        );
        require(
            vars.success,
            "low-level call of function summonFlexDao1 failed"
        );

        bytes memory getDaoAddressPayload = abi.encodeWithSignature(
            "getDaoAddress(string)",
            params._flexDaoInfo.name
        );

        (vars.success, vars.ret) = address(params.daoFactoriesAddress[0]).call(
            getDaoAddressPayload
        );
        vars.newDaoAddr = bytesToAddress(vars.ret);
        require(vars.success && vars.newDaoAddr != address(0x0));
        // console.log("new dao address:", vars.newDaoAddr);
        vars.summonFlexDao2Payload = abi.encodeWithSignature(
            "summonFlexDao2(address,address,address)",
            params.daoFactoriesAddress[1],
            vars.newDaoAddr,
            params._flexDaoInfo.creator
        );

        vars.summonFlexDao3Payload = abi.encodeWithSignature(
            "summonFlexDao3(address,(bytes32,address,uint128)[],address)",
            params.daoFactoriesAddress[0],
            params.enalbeAdapters,
            vars.newDaoAddr
        );

        vars.summonFlexDao4Payload = abi.encodeWithSignature(
            "summonFlexDao4(address,address,(bytes32,address,uint128)[],address)",
            params.daoFactoriesAddress[0],
            params.daoFactoriesAddress[1],
            params.adapters1,
            vars.newDaoAddr
        );

        vars.summonFlexDao5Payload = abi.encodeWithSignature(
            "summonFlexDao5(uint256,address,uint256,uint256,uint256,address)",
            params._flexDaoInfo.flexDaoManagementfee,
            params._flexDaoInfo.managementFeeAddress,
            params._flexDaoInfo.flexDaoFundriaseStyle,
            params._flexDaoVotingInfo.votingPeriod,
            params._flexDaoVotingInfo.superMajority,
            vars.newDaoAddr
        );

        vars.summonFlexDao6Payload = abi.encodeWithSignature(
            "summonFlexDao6(address[],address)",
            params._flexDaoInfo.flexDaoGenesisStewards,
            vars.newDaoAddr
        );

        uint256[7] memory uint256Params = [
            params._flexDaoParticipantCapInfo.maxParticipantsAmount,
            params._flexDaoPollingInfo.votingPeriod,
            params._flexDaoPollingInfo.votingPower,
            params._flexDaoPollingInfo.superMajority,
            params._flexDaoPollsterMembershipInfo.varifyType,
            params._flexDaoPollsterMembershipInfo.minHolding,
            params._flexDaoPollsterMembershipInfo.tokenId
        ];
        bool[2] memory booleanParams = [
            params.fundingPollEnable,
            params._flexDaoParticipantCapInfo.enable
        ];

        vars.summonFlexDao7Payload = abi.encodeWithSignature(
            "summonFlexDao7(bool[2],uint256[7],address,address[],address)",
            booleanParams,
            uint256Params,
            params._flexDaoPollsterMembershipInfo.tokenAddress,
            params._flexDaoPollsterMembershipInfo.whiteList,
            vars.newDaoAddr
        );

        uint256[6] memory uint256SummonFlexDao8Params = [
            params._flexDaoStewardMembershipInfo.varifyType,
            params._flexDaoStewardMembershipInfo.minHolding,
            params._flexDaoStewardMembershipInfo.tokenId,
            params._flexDaoProposerMembershipInfo.varifyType,
            params._flexDaoProposerMembershipInfo.tokenId,
            params._flexDaoProposerMembershipInfo.minHolding
        ];
        vars.summonFlexDao8Payload = abi.encodeWithSignature(
            "summonFlexDao8(bool,uint256[6],address,address[],address,address[],address)",
            params._flexDaoStewardMembershipInfo.enable,
            uint256SummonFlexDao8Params,
            params._flexDaoStewardMembershipInfo.tokenAddress,
            params._flexDaoStewardMembershipInfo.whiteList,
            params._flexDaoProposerMembershipInfo.tokenAddress,
            params._flexDaoProposerMembershipInfo.whiteList,
            vars.newDaoAddr
        );

        vars.summonFlexDao9Payload = abi.encodeWithSignature(
            "summonFlexDao9(bool,string,uint256,uint256,uint256,address,address[],address)",
            params.flexDaoParticipantMembetshipEnable,
            params._flexDaoPaticipantMembershipInfos.name,
            params._flexDaoPaticipantMembershipInfos.varifyType,
            params._flexDaoPaticipantMembershipInfos.minHolding,
            params._flexDaoPaticipantMembershipInfos.tokenId,
            params._flexDaoPaticipantMembershipInfos.tokenAddress,
            params._flexDaoPaticipantMembershipInfos.whiteList,
            vars.newDaoAddr
        );

        //  bool flexDaoPriorityDepositEnalbe,
        //         uint256 flexDaoPriorityMembershipVarifyType,
        //         uint256 flexDaoPriorityMembershipPriorityPeriod,
        //         uint256 flexDaoPriorityMembershipMinHolding,
        //         uint256 flexDaoPriorityMembershipTokenId,
        //         address[] calldata flexDaoPriorityMembershipWhiteList,
        //         address flexDaoPriorityMembershipTokenAddress,
        //         address newDaoAddr
        vars.summonFlexDao10Payload = abi.encodeWithSignature(
            "summonFlexDao10(bool,uint256,uint256,uint256,uint256,address[],address,address)",
            params.flexDaoPriorityDepositEnalbe,
            params._flexDaoPriorityMembershipInfo.varifyType,
            params._flexDaoPriorityMembershipInfo.priorityPeriod,
            params._flexDaoPriorityMembershipInfo.minHolding,
            params._flexDaoPriorityMembershipInfo.tokenId,
            params._flexDaoPriorityMembershipInfo.whiteList,
            params._flexDaoPriorityMembershipInfo.tokenAddress,
            vars.newDaoAddr
        );

        vars.calls[0] = Call(address(this), vars.summonFlexDao2Payload);
        vars.calls[1] = Call(address(this), vars.summonFlexDao3Payload);
        vars.calls[2] = Call(address(this), vars.summonFlexDao4Payload);
        vars.calls[3] = Call(address(this), vars.summonFlexDao5Payload);
        vars.calls[4] = Call(address(this), vars.summonFlexDao6Payload);
        vars.calls[5] = Call(address(this), vars.summonFlexDao7Payload);
        vars.calls[6] = Call(address(this), vars.summonFlexDao8Payload);
        vars.calls[7] = Call(address(this), vars.summonFlexDao9Payload);
        vars.calls[8] = Call(address(this), vars.summonFlexDao10Payload);

        multiCall(vars.calls);
    }

    function bytesToAddress(bytes memory bys)
        private
        pure
        returns (address addr)
    {
        assembly {
            addr := mload(add(bys, 32))
        }
    }
}
