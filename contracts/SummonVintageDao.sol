//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// import "./core/DaoFactory.sol";
import "./extensions/fundingpool/FundingPoolFactory.sol";
import "./extensions/gpdao/GPDaoFactory.sol";
import "./extensions/gpdao/GPDao.sol";
import "./vintage/extensions/fundingpool/VintageFundingPoolFactory.sol";
import "./helpers/DaoHelper.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

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

    struct VintageRaiserMembership {
        bool enable;
        uint8 varifyType;
        uint256 minAmount;
        address tokenAddress;
        uint256 tokenId;
    }

    struct VintageVotingInfo {
        uint8 eligibilityType;
        uint8 votingWeightedType;
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
        VintageFundingPoolFactory flexFundingPoolFac = VintageFundingPoolFactory(
                vintageFundingPoolFacAddr
            );
        flexFundingPoolFac.create(newDaoAddr);
        address newVintageFundingPoolExtAddr = flexFundingPoolFac
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

    struct VintageCall {
        address target;
        bytes callData;
    }

    struct VintageDaoCallLocalVars {
        bytes summonVintageDao1Payload;
        bytes summonVintageDao2Payload;
        bytes summonVintageDao3Payload;
        bool success;
        bytes ret;
        address newDaoAddr;
        VintageCall[2] calls;
    }

    function multiVintageCall(VintageCall[2] memory calls) public {
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
        console.log("new dao address:", vars.newDaoAddr);
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

        vars.calls[0] = VintageCall(
            address(this),
            vars.summonVintageDao2Payload
        );
        vars.calls[1] = VintageCall(
            address(this),
            vars.summonVintageDao3Payload
        );

        multiVintageCall(vars.calls);
    }

    function bytesToAddress(
        bytes memory bys
    ) private pure returns (address addr) {
        assembly {
            addr := mload(add(bys, 32))
        }
    }
}
