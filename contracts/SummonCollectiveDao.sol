//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./collective/extensions/CollectiveFundingPoolFactory.sol";
import "./collective/adapters/CollectiveGovernorManagementAdapter.sol";
import "./helpers/DaoHelper.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "hardhat/console.sol";

contract SummonCollectiveDao {
    constructor() {}

    event CollectiveDaoCreated(
        address daoFactoryAddress,
        address daoAddr,
        string name,
        address creator
    );

    struct InvestorCapacity {
        bool enable;
        uint256 capacity;
    }

    struct CollectiveGovernorMembershipInfo {
        bool enable;
        uint256 varifyType;
        uint256 minHolding;
        address tokenAddress;
        uint256 tokenId;
        address[] whiteList;
    }

    struct CollectiveDaoVotingInfo {
        uint256 votingAssetType; //0. deposit
        uint8 votingPower; //0. quantity 1. log2 2. 1 voter 1 vote
        uint256 support;
        uint256 quorum;
        uint256 supportType; // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
        uint256 quorumType; // 0. - (YES + NO) / Total > X%  1. - YES + NO > X
        uint256 votingPeriod;
        uint256 gracePeriod;
        uint256 executePeriod;
    }

    struct CollectiveDaoInfo {
        string name;
        address creator;
        address currency;
        uint256 redemptionFee;
        uint256 proposerInvestTokenReward;
        uint256 proposerPaybackTokenReward;
        address riceRewardReceiver;
        // address[] collectiveDaoGenesisGovernor;
    }

    struct CollectiveDaoParams {
        address[] daoFactoriesAddress;
        DaoFactory.Adapter[] enalbeAdapters;
        DaoFactory.Adapter[] adapters1;
        InvestorCapacity investorCapacity;
        CollectiveGovernorMembershipInfo governorMembership;
        CollectiveDaoVotingInfo collectiveDaoVotingInfo;
        CollectiveDaoInfo collectiveDaoInfo;
    }

    //create dao
    function summonCollectiveDao1(
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
            "SummmonDao::summonCollectiveDao::create dao failed"
        );
        emit CollectiveDaoCreated(daoFacAddr, newDaoAddr, daoName, creator);
        return true;
    }

    //create new extension and register to dao
    function summonCollectiveDao2(
        address collectiveFundingPoolFacAddr,
        address newDaoAddr,
        address creator
    ) external returns (bool) {
        require(address(this) == msg.sender);
        //create funding pool extension...
        CollectiveFundingPoolFactory collectiveFundingPoolFac = CollectiveFundingPoolFactory(
                collectiveFundingPoolFacAddr
            );
        collectiveFundingPoolFac.create(newDaoAddr);
        address newCollectiveFundingPoolExtAddr = collectiveFundingPoolFac
            .getExtensionAddress(newDaoAddr);
        //add funding pool extension to dao...
        DaoRegistry newDao = DaoRegistry(newDaoAddr);
        newDao.addExtension(
            DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT, // sha3("collective-funding-pool-ext"),
            IExtension(newCollectiveFundingPoolExtAddr),
            creator
        );

        return true;
    }

    //register adapters to dao
    function summonCollectiveDao3(
        address daoFacAddr,
        DaoFactory.Adapter[] calldata enalbeAdapters,
        address newDaoAddr
    ) external returns (bool) {
        DaoRegistry newDao = DaoRegistry(newDaoAddr);
        require(address(this) == msg.sender);
        DaoFactory daoFac = DaoFactory(daoFacAddr);
        //add adapters to dao...
        if (enalbeAdapters.length > 0)
            daoFac.addAdapters(newDao, enalbeAdapters);
        return true;
    }

    //configure adapters access to extensions
    function summonCollectiveDao4(
        address daoFacAddr,
        address collectiveFundingPoolFacAddr,
        DaoFactory.Adapter[] calldata adapters1,
        address newDaoAddr
    ) external returns (bool) {
        DaoRegistry newDao = DaoRegistry(newDaoAddr);
        require(address(this) == msg.sender);
        DaoFactory daoFac = DaoFactory(daoFacAddr);
        CollectiveFundingPoolFactory collectiveFundingPoolFac = CollectiveFundingPoolFactory(
                collectiveFundingPoolFacAddr
            );
        address newCollectiveFundingPoolExtAddr = collectiveFundingPoolFac
            .getExtensionAddress(newDaoAddr);
        //configure adapters access to extensions ...
        if (adapters1.length > 0) {
            daoFac.configureExtension(
                newDao,
                newCollectiveFundingPoolExtAddr, //FlexFundingPoolExtension
                adapters1
            );
        }
        return true;
    }

    //config voting
    //_uint256VoteArgs[0] VOTING_PERIOD
    //_uint256VoteArgs[1] SUPER_MAJORITY
    //_uint256VoteArgs[2] COLLECTIVE_VOTING_ASSET_TYPE
    //_uint256VoteArgs[3] QUORUM
    //_uint256VoteArgs[4] COLLECTIVE_VOTING_SUPPORT_TYPE
    //_uint256VoteArgs[5] COLLECTIVE_VOTING_QUORUM_TYPE
    //_uint256VoteArgs[6] COLLECTIVE_VOTING_GRACE_PERIOD
    //_uint256VoteArgs[7] COLLECTIVE_VOTING_EXECUTE_PERIOD
    function summonCollectiveDao5(
        address newDaoAddr,
        uint8 votingPower,
        uint256[8] calldata _uint256VoteArgs
    ) external returns (bool) {
        DaoRegistry newDao = DaoRegistry(newDaoAddr);
        require(address(this) == msg.sender);

        //1config VOTING_PERIOD
        newDao.setConfiguration(DaoHelper.VOTING_PERIOD, _uint256VoteArgs[0]);

        //2config SUPER_MAJORITY
        newDao.setConfiguration(DaoHelper.SUPER_MAJORITY, _uint256VoteArgs[1]);
        //config voting info

        // 3.config COLLECTIVE_VOTING_ASSET_TYPE
        newDao.setConfiguration(
            DaoHelper.COLLECTIVE_VOTING_ASSET_TYPE,
            _uint256VoteArgs[2]
        );

        // 4.config COLLECTIVE_VOTING_WEIGHTED_TYPE
        newDao.setConfiguration(
            DaoHelper.COLLECTIVE_VOTING_WEIGHTED_TYPE,
            votingPower
        );

        //5.config QUORUM
        newDao.setConfiguration(DaoHelper.QUORUM, _uint256VoteArgs[3]);

        //6.config COLLECTIVE_VOTING_SUPPORT_TYPE
        newDao.setConfiguration(
            DaoHelper.COLLECTIVE_VOTING_SUPPORT_TYPE,
            _uint256VoteArgs[4]
        );

        //7.config COLLECTIVE_VOTING_QUORUM_TYPE
        newDao.setConfiguration(
            DaoHelper.COLLECTIVE_VOTING_QUORUM_TYPE,
            _uint256VoteArgs[5]
        );

        //8.config COLLECTIVE_VOTING_GRACE_PERIOD
        newDao.setConfiguration(
            DaoHelper.COLLECTIVE_VOTING_GRACE_PERIOD,
            _uint256VoteArgs[6]
        );

        //9.config COLLECTIVE_VOTING_EXECUTE_PERIOD
        newDao.setConfiguration(
            DaoHelper.COLLECTIVE_VOTING_EXECUTE_PERIOD,
            _uint256VoteArgs[7]
        );
        return true;
    }

    //config fees
    function summonCollectiveDao6(
        address newDaoAddr,
        uint256 redemptFee,
        address currencyAddress,
        uint256 proposerInvestTokenReward,
        uint256 proposerPaybackTokenReward,
        address riceRewardReceiver
    )
        external
        returns (
            // address riceRewardReceiver
            bool
        )
    {
        DaoRegistry newDao = DaoRegistry(newDaoAddr);
        require(address(this) == msg.sender);

        newDao.setConfiguration(
            DaoHelper.COLLECTIVE_REDEMPT_FEE_AMOUNT,
            redemptFee
        );
        newDao.setConfiguration(
            DaoHelper.COLLECTIVE_PROPOSER_INVEST_TOKEN_REWARD_AMOUNT,
            proposerInvestTokenReward
        );
        newDao.setConfiguration(
            DaoHelper.COLLECTIVE_PROPOSER_PAYBACK_TOKEN_REWARD_AMOUNT,
            proposerPaybackTokenReward
        );

        newDao.setAddressConfiguration(
            DaoHelper.FUND_RAISING_CURRENCY_ADDRESS,
            currencyAddress
        );
        newDao.setAddressConfiguration(
            DaoHelper.RICE_REWARD_RECEIVER,
            riceRewardReceiver
        );
        return true;
    }

    // config investor capacity
    function summonCollectiveDao7(
        address newDaoAddr,
        bool enable,
        uint256 investorCap
    ) external returns (bool) {
        DaoRegistry dao = DaoRegistry(newDaoAddr);
        require(address(this) == msg.sender);
        if (enable) {
            dao.setConfiguration(DaoHelper.MAX_INVESTORS_ENABLE, 1);
            dao.setConfiguration(DaoHelper.MAX_INVESTORS, investorCap);
        }

        return true;
    }

    //config governor membership
    function summonCollectiveDao8(
        address newDaoAddr,
        uint256 vType,
        uint256 miniHolding,
        uint256 tokenId,
        bool enable,
        address collectiveDaoGovernorMembershipTokenAddress,
        address[] calldata collectiveDaoGovernorMembershipWhitelist
    ) external returns (bool) {
        DaoRegistry dao = DaoRegistry(newDaoAddr);
        require(address(this) == msg.sender);
        if (enable) {
            dao.setConfiguration(
                DaoHelper.COLLECTIVE_GOVERNOR_MEMBERSHIP_ENABLE,
                1
            );
            dao.setConfiguration(
                DaoHelper.COLLECTIVE_GOVERNOR_MEMBERSHIP_TYPE,
                vType
            );
            if (vType == 0 || vType == 1 || vType == 2) {
                dao.setConfiguration(
                    DaoHelper.COLLECTIVE_GOVERNOR_MEMBERSHIP_MINI_HOLDING,
                    miniHolding
                );
                dao.setAddressConfiguration(
                    DaoHelper.COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS,
                    collectiveDaoGovernorMembershipTokenAddress
                );
            }

            if (vType == 2) {
                dao.setConfiguration(
                    DaoHelper.COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ID,
                    tokenId
                );
            }

            if (
                vType == 3 &&
                collectiveDaoGovernorMembershipWhitelist.length > 0
            ) {
                ColletiveGovernorManagementAdapterContract governorContract = ColletiveGovernorManagementAdapterContract(
                        dao.getAdapterAddress(
                            DaoHelper.COLLECTIVE_GOVERNOR_MANAGEMENT_ADAPTER
                        )
                    );
                for (
                    uint8 i = 0;
                    i < collectiveDaoGovernorMembershipWhitelist.length;
                    i++
                ) {
                    governorContract.registerGovernorWhiteList(
                        dao,
                        collectiveDaoGovernorMembershipWhitelist[i]
                    );
                }
            }
        }

        return true;
    }

    function summonCollectiveDao10(address newDaoAddr) external returns (bool) {
        DaoRegistry dao = DaoRegistry(newDaoAddr);

        //remove summondaoContract && DaoFacConctract from dao member list
        dao.removeMember(dao.daoFactory());

        ColletiveGovernorManagementAdapterContract governorContract = ColletiveGovernorManagementAdapterContract(
                dao.getAdapterAddress(
                    DaoHelper.COLLECTIVE_GOVERNOR_MANAGEMENT_ADAPTER
                )
            );

        governorContract.quit(dao);
        dao.finalizeDao();

        return true;
    }

    struct Call {
        address target;
        bytes callData;
    }

    function multiCall(Call[8] memory calls) public {
        // console.log("caller:", msg.sender);
        for (uint256 i = 0; i < calls.length; i++) {
            (bool success, ) = calls[i].target.call(calls[i].callData);
            require(
                success,
                string(
                    abi.encodePacked(
                        "low-level call of summonCollectiveDao",
                        Strings.toString(i + 2),
                        " failed"
                    )
                )
            );
        }
    }

    struct CollectiveDaoCallLocalVars {
        bytes summonCollectiveDao1Payload;
        bytes summonCollectiveDao2Payload;
        bytes summonCollectiveDao3Payload;
        bytes summonCollectiveDao4Payload;
        bytes summonCollectiveDao5Payload;
        bytes summonCollectiveDao6Payload;
        bytes summonCollectiveDao7Payload;
        bytes summonCollectiveDao8Payload;
        // bytes summonCollectiveDao9Payload;
        bytes summonCollectiveDao10Payload;
        bool success;
        bytes ret;
        address newDaoAddr;
        Call[8] calls;
    }

    modifier ParamCheck(CollectiveDaoParams calldata params) {
        require(
            params.collectiveDaoInfo.currency != address(0x0) &&
                params.collectiveDaoInfo.redemptionFee <
                DaoHelper.TOKEN_AMOUNT_PRECISION &&
                params.collectiveDaoInfo.proposerInvestTokenReward <
                DaoHelper.TOKEN_AMOUNT_PRECISION &&
                params.collectiveDaoInfo.proposerPaybackTokenReward <
                DaoHelper.TOKEN_AMOUNT_PRECISION,
            "Summon Flex DAO::Invalid Management Fee Amount"
        );
        _;
    }

    function summonCollectiveDao(
        CollectiveDaoParams calldata params
    ) external ParamCheck(params) returns (bool) {
        CollectiveDaoCallLocalVars memory vars;
        vars.summonCollectiveDao1Payload = abi.encodeWithSignature(
            "summonCollectiveDao1(address,string,address)",
            params.daoFactoriesAddress[0],
            params.collectiveDaoInfo.name,
            params.collectiveDaoInfo.creator
        );

        (vars.success, vars.ret) = address(this).call(
            vars.summonCollectiveDao1Payload
        );
        require(
            vars.success,
            "low-level call of function summonCollectiveDao1 failed"
        );

        bytes memory getDaoAddressPayload = abi.encodeWithSignature(
            "getDaoAddress(string)",
            params.collectiveDaoInfo.name
        );

        (vars.success, vars.ret) = address(params.daoFactoriesAddress[0]).call(
            getDaoAddressPayload
        );
        vars.newDaoAddr = bytesToAddress(vars.ret);
        require(vars.success && vars.newDaoAddr != address(0x0));
        vars.summonCollectiveDao2Payload = abi.encodeWithSignature(
            "summonCollectiveDao2(address,address,address)",
            params.daoFactoriesAddress[1],
            vars.newDaoAddr,
            params.collectiveDaoInfo.creator
        );

        vars.summonCollectiveDao3Payload = abi.encodeWithSignature(
            "summonCollectiveDao3(address,(bytes32,address,uint128)[],address)",
            params.daoFactoriesAddress[0],
            params.enalbeAdapters,
            vars.newDaoAddr
        );

        vars.summonCollectiveDao4Payload = abi.encodeWithSignature(
            "summonCollectiveDao4(address,address,(bytes32,address,uint128)[],address)",
            params.daoFactoriesAddress[0],
            params.daoFactoriesAddress[1],
            params.adapters1,
            vars.newDaoAddr
        );

        uint256[8] memory uint256VoteParams = [
            params.collectiveDaoVotingInfo.votingPeriod,
            params.collectiveDaoVotingInfo.support,
            params.collectiveDaoVotingInfo.votingAssetType,
            params.collectiveDaoVotingInfo.quorum,
            params.collectiveDaoVotingInfo.supportType,
            params.collectiveDaoVotingInfo.quorumType,
            params.collectiveDaoVotingInfo.gracePeriod,
            params.collectiveDaoVotingInfo.executePeriod
        ];
        vars.summonCollectiveDao5Payload = abi.encodeWithSignature(
            "summonCollectiveDao5(address,uint8,uint256[8])",
            vars.newDaoAddr,
            params.collectiveDaoVotingInfo.votingPower,
            uint256VoteParams
        );

        vars.summonCollectiveDao6Payload = abi.encodeWithSignature(
            "summonCollectiveDao6(address,uint256,address,uint256,uint256,address)",
            vars.newDaoAddr,
            params.collectiveDaoInfo.redemptionFee,
            params.collectiveDaoInfo.currency,
            params.collectiveDaoInfo.proposerInvestTokenReward,
            params.collectiveDaoInfo.proposerPaybackTokenReward,
            params.collectiveDaoInfo.riceRewardReceiver
        );

        vars.summonCollectiveDao7Payload = abi.encodeWithSignature(
            "summonCollectiveDao7(address,bool,uint256)",
            vars.newDaoAddr,
            params.investorCapacity.enable,
            params.investorCapacity.capacity
        );

        vars.summonCollectiveDao8Payload = abi.encodeWithSignature(
            "summonCollectiveDao8(address,uint256,uint256,uint256,bool,address,address[])",
            vars.newDaoAddr,
            params.governorMembership.varifyType,
            params.governorMembership.minHolding,
            params.governorMembership.tokenId,
            params.governorMembership.enable,
            params.governorMembership.tokenAddress,
            params.governorMembership.whiteList
        );

        // vars.summonCollectiveDao9Payload = abi.encodeWithSignature(
        //     "summonCollectiveDao9(address,address[])",
        //     vars.newDaoAddr,
        //     params.collectiveDaoInfo.collectiveDaoGenesisGovernor
        // );
        // vars.summonCollectiveDao9Payload = abi.encodeWithSignature(
        //     "summonCollectiveDao9(address)",
        //     vars.newDaoAddr
        // );
        vars.summonCollectiveDao10Payload = abi.encodeWithSignature(
            "summonCollectiveDao10(address)",
            vars.newDaoAddr
        );
        vars.calls[0] = Call(address(this), vars.summonCollectiveDao2Payload);
        vars.calls[1] = Call(address(this), vars.summonCollectiveDao3Payload);
        vars.calls[2] = Call(address(this), vars.summonCollectiveDao4Payload);
        vars.calls[3] = Call(address(this), vars.summonCollectiveDao5Payload);
        vars.calls[4] = Call(address(this), vars.summonCollectiveDao6Payload);
        vars.calls[5] = Call(address(this), vars.summonCollectiveDao7Payload);
        vars.calls[6] = Call(address(this), vars.summonCollectiveDao8Payload);
        // vars.calls[7] = Call(address(this), vars.summonCollectiveDao9Payload);
        vars.calls[7] = Call(address(this), vars.summonCollectiveDao10Payload);

        multiCall(vars.calls);

        return true;
    }

    function bytesToAddress(
        bytes memory bys
    ) private pure returns (address addr) {
        assembly {
            addr := mload(add(bys, 32))
        }
    }

    function registerGenesisGovernors(
        DaoRegistry dao,
        address[] calldata genesisGovernors
    ) internal {
        if (genesisGovernors.length > 0) {
            for (uint8 i = 0; i < genesisGovernors.length; i++) {
                dao.potentialNewMember(genesisGovernors[i]);
            }
        }
    }
}
