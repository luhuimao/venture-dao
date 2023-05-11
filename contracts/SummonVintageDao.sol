//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// import "./core/DaoFactory.sol";
import "./extensions/fundingpool/FundingPoolFactory.sol";
import "./extensions/gpdao/GPDaoFactory.sol";
import "./extensions/gpdao/GPDao.sol";
import "./vintage/extensions/fundingpool/VintageFundingPoolFactory.sol";
import "./helpers/DaoHelper.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./vintage/extensions/fundingpool/VintageFundingPoolFactory.sol";
import "./vintage/adapters/VintageRaiserManagement.sol";
import "hardhat/console.sol";

contract SummonVintageDao {
    event VintageDaoCreated(
        address daoFactoryAddress,
        address daoAddr,
        string name,
        address creator
    );
    struct VintageParticipantCapInfo {
        bool enable;
        uint256 cap;
    }

    struct VintageBackerMembership {
        bool enable;
        uint8 varifyType;
        uint256 minAmount;
        address tokenAddress;
        uint256 tokenId;
        address[] whiteList;
    }

    struct VintageRaiserMembership {
        bool enable;
        uint8 varifyType;
        uint256 minAmount;
        address tokenAddress;
        uint256 tokenId;
        address[] whiteList;
    }

    struct VintageVotingInfo {
        uint256 eligibilityType;
        uint256 votingWeightedType;
        uint256 supportType;
        uint256 quorumType;
        uint256 support;
        uint256 quorum;
        uint256 votingPeriod;
        uint256 executingPeriod;
    }

    struct VintageDaoParams {
        string daoName;
        address creator;
        address[] daoFactoriesAddress;
        DaoFactory.Adapter[] enalbeAdapters;
        DaoFactory.Adapter[] adapters1;
        VintageParticipantCapInfo participantCap;
        VintageBackerMembership backerMembership;
        VintageRaiserMembership raiserMembership;
        VintageVotingInfo votingInfo;
        address[] genesisRaisers;
    }

    //create dao
    function summonVintageDao1(
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
            "SummmonDao::summonVintageDao::create dao failed"
        );
        emit VintageDaoCreated(daoFacAddr, newDaoAddr, daoName, creator);
    }

    //create new extension and register to dao
    function summonVintageDao2(
        address vintageFundingPoolFacAddr,
        address newDaoAddr,
        address creator
    ) external returns (bool) {
        require(address(this) == msg.sender);
        //create funding pool extension...
        VintageFundingPoolFactory vintageFundingPoolFac = VintageFundingPoolFactory(
                vintageFundingPoolFacAddr
            );
        vintageFundingPoolFac.create(newDaoAddr);
        address newVintageFundingPoolExtAddr = vintageFundingPoolFac
            .getExtensionAddress(newDaoAddr);
        //add funding pool extension to dao...
        DaoRegistry newDao = DaoRegistry(newDaoAddr);
        newDao.addExtension(
            DaoHelper.VINTAGE_FUNDING_POOL_EXT, // sha3("vintage-funding-pool-ext"),
            IExtension(newVintageFundingPoolExtAddr),
            creator
        );
    }

    //register adapters to dao
    function summonVintageDao3(
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
    function summonVintageDao4(
        address daoFacAddr,
        address vintageFundingPoolFacAddr,
        DaoFactory.Adapter[] calldata adapters1,
        address newDaoAddr
    ) external returns (bool) {
        DaoRegistry newDao = DaoRegistry(newDaoAddr);
        require(address(this) == msg.sender);
        DaoFactory daoFac = DaoFactory(daoFacAddr);
        VintageFundingPoolFactory vintageFundingPoolFac = VintageFundingPoolFactory(
                vintageFundingPoolFacAddr
            );
        address newVintageFundingPoolExtAddr = vintageFundingPoolFac
            .getExtensionAddress(newDaoAddr);
        //configure adapters access to extensions ...
        daoFac.configureExtension(
            newDao,
            newVintageFundingPoolExtAddr, //vintageFundingPoolExtension
            adapters1
        );
    }

    // config raiser Membership
    function summonVintageDao5(
        bool vintageDaoStewardMembershipEnable,
        uint256[3] memory uint256Params,
        address vintageDaoStewardMembershipTokenAddress,
        address[] calldata vintageDaoRaiserMembershipWhitelist,
        address newDaoAddr
    ) external returns (bool) {
        // uint256Params[0] vintageDaoStewardMembershipVarifyType
        // uint256Params[1] vintageDaoStewardMembershipMinHolding
        // uint256Params[2] vintageDaoStewardMembershipInfoTokenId
        DaoRegistry dao = DaoRegistry(newDaoAddr);
        require(address(this) == msg.sender);

        //config raiser Membership
        if (vintageDaoStewardMembershipEnable) {
            dao.setConfiguration(DaoHelper.VINTAGE_RAISER_MEMBERSHIP_ENABLE, 1);
            dao.setConfiguration(
                DaoHelper.VINTAGE_RAISER_MEMBERSHIP_TYPE,
                uint256Params[0]
            );
            //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS 4 DEPOSIT
            if (
                uint256Params[0] == 0 ||
                uint256Params[0] == 1 ||
                uint256Params[0] == 2
            ) {
                dao.setConfiguration(
                    DaoHelper.VINTAGE_RAISER_MEMBERSHIP_MIN_HOLDING,
                    uint256Params[1]
                );
                dao.setAddressConfiguration(
                    DaoHelper.VINTAGE_RAISER_MEMBERSHIP_TOKEN_ADDRESS,
                    vintageDaoStewardMembershipTokenAddress
                );
            }

            if (uint256Params[0] == 2) {
                dao.setConfiguration(
                    DaoHelper.VINTAGE_RAISER_MEMBERSHIP_TOKENID,
                    uint256Params[2]
                );
            }

            if (uint256Params[0] == 4) {
                dao.setConfiguration(
                    DaoHelper.VINTAGE_RAISER_MEMBERSHIP_MIN_DEPOSIT,
                    uint256Params[1]
                );
            }

            if (
                uint256Params[0] == 3 &&
                vintageDaoRaiserMembershipWhitelist.length > 0
            ) {
                VintageRaiserManagementContract raiserManagementAdapt = VintageRaiserManagementContract(
                        dao.getAdapterAddress(
                            DaoHelper.VINTAGE_RAISER_MANAGEMENT
                        )
                    );
                for (
                    uint8 i = 0;
                    i < vintageDaoRaiserMembershipWhitelist.length;
                    i++
                ) {
                    raiserManagementAdapt.registerRaiserWhiteList(
                        dao,
                        vintageDaoRaiserMembershipWhitelist[i]
                    );
                }
            }
        }
    }

    function summonVintageDao6(
        address newDaoAddr,
        uint256[8] calldata votingInfo
    ) external returns (bool) {
        DaoRegistry newDao = DaoRegistry(newDaoAddr);

        newDao.setConfiguration(
            DaoHelper.VINTAGE_VOTING_ELIGIBILITY_TYPE,
            votingInfo[0]
        );
        newDao.setConfiguration(
            DaoHelper.VINTAGE_VOTING_WEIGHTED_TYPE,
            votingInfo[1]
        );
        newDao.setConfiguration(
            DaoHelper.VINTAGE_VOTING_SUPPORT_TYPE,
            votingInfo[2]
        );
        newDao.setConfiguration(
            DaoHelper.VINTAGE_VOTING_QUORUM_TYPE,
            votingInfo[3]
        );
        newDao.setConfiguration(DaoHelper.QUORUM, votingInfo[4]);
        newDao.setConfiguration(DaoHelper.SUPER_MAJORITY, votingInfo[5]);
        newDao.setConfiguration(DaoHelper.VOTING_PERIOD, votingInfo[6]);
        newDao.setConfiguration(
            DaoHelper.PROPOSAL_EXECUTE_DURATION,
            votingInfo[7]
        );
    }

    function summonVintageDao7(
        address newDaoAddr,
        address[] calldata genesisRaisers
    ) external returns (bool) {
        if (genesisRaisers.length > 0) {
            DaoRegistry newDao = DaoRegistry(newDaoAddr);
            for (uint8 i = 0; i < genesisRaisers.length; i++) {
                newDao.potentialNewMember(genesisRaisers[i]);
            }
        }
    }

    struct VintageCall {
        address target;
        bytes callData;
    }

    struct VintageDaoCallLocalVars {
        bytes summonVintageDao1Payload;
        bytes summonVintageDao2Payload;
        bytes summonVintageDao3Payload;
        bytes summonVintageDao4Payload;
        bytes summonVintageDao5Payload;
        bytes summonVintageDao6Payload;
        bytes summonVintageDao7Payload;
        bool success;
        bytes ret;
        address newDaoAddr;
        VintageCall[6] calls;
    }

    function multiVintageCall(VintageCall[6] memory calls) public {
        // console.log("caller:", msg.sender);
        for (uint256 i = 0; i < calls.length; i++) {
            (bool success, bytes memory ret) = calls[i].target.call(
                calls[i].callData
            );
            require(
                success,
                string(
                    abi.encodePacked(
                        "low-level call of summonVintageDao",
                        Strings.toString(i + 2),
                        " failed"
                    )
                )
            );
        }
    }

    function summonVintageDao(VintageDaoParams calldata params) external {
        VintageDaoCallLocalVars memory vars;
        vars.summonVintageDao1Payload = abi.encodeWithSignature(
            "summonVintageDao1(address,string,address)",
            params.daoFactoriesAddress[0],
            params.daoName,
            params.creator
        );

        (vars.success, vars.ret) = address(this).call(
            vars.summonVintageDao1Payload
        );
        require(
            vars.success,
            "low-level call of function summonVintageDao1 failed"
        );

        bytes memory getDaoAddressPayload = abi.encodeWithSignature(
            "getDaoAddress(string)",
            params.daoName
        );

        (vars.success, vars.ret) = address(params.daoFactoriesAddress[0]).call(
            getDaoAddressPayload
        );
        vars.newDaoAddr = bytesToAddress(vars.ret);
        require(vars.success && vars.newDaoAddr != address(0x0));
        vars.summonVintageDao2Payload = abi.encodeWithSignature(
            "summonVintageDao2(address,address,address)",
            params.daoFactoriesAddress[1],
            vars.newDaoAddr,
            params.creator
        );
        vars.summonVintageDao3Payload = abi.encodeWithSignature(
            "summonVintageDao3(address,(bytes32,address,uint128)[],address)",
            params.daoFactoriesAddress[0],
            params.enalbeAdapters,
            vars.newDaoAddr
        );

        vars.summonVintageDao4Payload = abi.encodeWithSignature(
            "summonVintageDao4(address,address,(bytes32,address,uint128)[],address)",
            params.daoFactoriesAddress[0],
            params.daoFactoriesAddress[1],
            params.adapters1,
            vars.newDaoAddr
        );

        uint256[3] memory uint256SummonVintageDao5Params = [
            params.raiserMembership.varifyType,
            params.raiserMembership.minAmount,
            params.raiserMembership.tokenId
        ];
        vars.summonVintageDao5Payload = abi.encodeWithSignature(
            "summonVintageDao5(bool,uint256[3],address,address[],address)",
            params.raiserMembership.enable,
            uint256SummonVintageDao5Params,
            params.raiserMembership.tokenAddress,
            params.raiserMembership.whiteList,
            vars.newDaoAddr
        );

        uint256[8] memory uint256SummonVintageDao6Params = [
            params.votingInfo.eligibilityType,
            params.votingInfo.votingWeightedType,
            params.votingInfo.supportType,
            params.votingInfo.quorumType,
            params.votingInfo.quorum,
            params.votingInfo.support,
            params.votingInfo.votingPeriod,
            params.votingInfo.executingPeriod
        ];
        vars.summonVintageDao6Payload = abi.encodeWithSignature(
            "summonVintageDao6(address,uint256[8])",
            vars.newDaoAddr,
            uint256SummonVintageDao6Params
        );

        vars.summonVintageDao7Payload = abi.encodeWithSignature(
            "summonVintageDao7(address,address[])",
            vars.newDaoAddr,
            params.genesisRaisers
        );

        vars.calls[0] = VintageCall(
            address(this),
            vars.summonVintageDao2Payload
        );
        vars.calls[1] = VintageCall(
            address(this),
            vars.summonVintageDao3Payload
        );
        vars.calls[2] = VintageCall(
            address(this),
            vars.summonVintageDao4Payload
        );
        vars.calls[3] = VintageCall(
            address(this),
            vars.summonVintageDao5Payload
        );
        vars.calls[4] = VintageCall(
            address(this),
            vars.summonVintageDao6Payload
        );
        vars.calls[5] = VintageCall(
            address(this),
            vars.summonVintageDao7Payload
        );

        multiVintageCall(vars.calls);

        //remove summondaoContract && DaoFacConctract from dao member list
        DaoRegistry newDao = DaoRegistry(vars.newDaoAddr);
        newDao.removeMember(newDao.daoFactory());
        newDao.removeMember(address(this));
    }

    function bytesToAddress(
        bytes memory bys
    ) private pure returns (address addr) {
        assembly {
            addr := mload(add(bys, 32))
        }
    }
}
