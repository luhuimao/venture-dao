//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./flex/extensions/FlexFundingPoolFactory.sol";
import "./flex/adatpers/FlexFunding.sol";
import "./flex/adatpers/FlexFundingPoolAdapter.sol";
import "./flex/adatpers/FlexPollingVoting.sol";
import "./flex/adatpers/StewardManagement.sol";
import "./flex/adatpers/FlexStewardAllocation.sol";
import "./helpers/DaoHelper.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract SummonDao {
    event FlexDaoCreated(
        address daoFactoryAddress,
        address daoAddr,
        string name,
        address creator
    );

    constructor() {}

    struct flexDaoInvestorCapInfo {
        bool enable;
        uint256 maxInvestorsAmount;
    }

    struct flexDaoPaticipantMembershipInfo {
        uint8 varifyType;
        string name;
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

    struct flexDaoGovernorMembershipInfo {
        bool enable;
        string name;
        uint256 varifyType;
        uint256 minHolding;
        address tokenAddress;
        uint256 tokenId;
        address[] whiteList;
    }

    struct flexDaoVotingInfo {
        uint256 votingAssetType; //0. erc20 1.erc721 2.erc1155 3.allocation
        address tokenAddress;
        uint256 tokenID;
        uint256 votingPeriod;
        uint8 votingPower; //0. quantity 1. log2 2. 1 voter 1 vote
        uint256 superMajority;
        uint256 quorum;
        uint256 supportType; // 0. - YES / (YES + NO) > X%  1. - YES - NO > X
        uint256 quorumType; // 0. - (YES + NO) / Total > X%  1. - YES + NO > X
    }

    struct flexDaoPollVoterMembershipInfo {
        uint8 varifyType;
        string name;
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
        uint256 votingAssetType; //0. erc20 1.erc721 2.erc1155 3.allocation
        address tokenAddress;
        uint256 tokenID;
        uint256 supportType; // 0. YES - NO > X
        uint256 quorumType; // 0. YES + NO > X
    }

    struct flexDaoProposerMembershipInfo {
        bool proposerMembershipEnable;
        string name;
        uint8 varifyType; //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
        uint256 minHolding;
        address tokenAddress;
        uint256 tokenId;
        address[] whiteList;
    }

    struct flexDaoInfo {
        string name;
        address creator;
        uint256 flexDaoManagementfee;
        uint256 returnTokenManagementFee;
        address managementFeeAddress;
        address[] flexDaoGenesisStewards;
        uint256[] allocations;
        address riceRewardReceiver;
        // uint8 flexDaoFundriaseStyle; // 0 - FCFS 1- Free in
    }

    struct FlexDaoParams {
        address[] daoFactoriesAddress;
        DaoFactory.Adapter[] enalbeAdapters;
        DaoFactory.Adapter[] adapters1;
        bool fundingPollEnable;
        flexDaoInvestorCapInfo _flexDaoInvestorCapInfo;
        bool flexDaoInvestorMembetshipEnable;
        flexDaoPaticipantMembershipInfo _flexDaoPaticipantMembershipInfos;
        bool flexDaoPriorityDepositEnalbe;
        flexDaoPriorityMembershipInfo _flexDaoPriorityMembershipInfo;
        flexDaoGovernorMembershipInfo _flexDaoGovernorMembershipInfo;
        flexDaoVotingInfo _flexDaoVotingInfo;
        flexDaoPollVoterMembershipInfo _flexDaoPollVoterMembershipInfo;
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
        return true;
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
            DaoHelper.FLEX_INVESTMENT_POOL_EXT, // sha3("flex-funding-pool-ext"),
            IExtension(newFlexFundingPoolExtAddr),
            creator
        );

        return true;
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
        return true;
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
        return true;
    }

    //set dao configaration
    // _uint256VoteArgs[0] votingPeriod
    // _uint256VoteArgs[1] superMajority
    // _uint256VoteArgs[2] votingAssetType
    // _uint256VoteArgs[3] quorum
    // _uint256VoteArgs[4] supportType
    // _uint256VoteArgs[5] quorumType
    function summonFlexDao5(
        uint256 flexDaoManagementfee,
        address managementFeeAddress,
        uint256 flexDaoReturnTokenManagementFee,
        address newDaoAddr,
        uint8 votingPower,
        uint256 tokenID,
        address tokenAddress,
        uint256[6] calldata _uint256VoteArgs,
        address riceRewardReceiver
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
            DaoHelper.FLEX_RETURN_TOKEN_MANAGEMENT_FEE_AMOUNT,
            flexDaoReturnTokenManagementFee
        );

        newDao.setAddressConfiguration(
            DaoHelper.RICE_REWARD_RECEIVER,
            riceRewardReceiver
        );

        //4config VOTING_PERIOD
        newDao.setConfiguration(DaoHelper.VOTING_PERIOD, _uint256VoteArgs[0]);

        //5config SUPER_MAJORITY
        newDao.setConfiguration(DaoHelper.SUPER_MAJORITY, _uint256VoteArgs[1]);

        //config voting info
        // 6.config PROPOSAL_EXECUTE_DURATION
        newDao.setConfiguration(
            DaoHelper.FLEX_VOTING_ASSET_TYPE,
            _uint256VoteArgs[2]
        );

        // 7..config FLEX_VOTING_WEIGHTED_TYPE
        newDao.setConfiguration(
            DaoHelper.FLEX_VOTING_WEIGHTED_TYPE,
            votingPower
        );

        if (_uint256VoteArgs[2] == 2) {
            // 8..config FLEX_VOTING_ASSET_TOKEN_ID
            newDao.setConfiguration(
                DaoHelper.FLEX_VOTING_ASSET_TOKEN_ID,
                tokenID
            );
        }

        if (
            _uint256VoteArgs[2] == 0 ||
            _uint256VoteArgs[2] == 1 ||
            _uint256VoteArgs[2] == 2
        ) {
            // 9.config FLEX_VOTING_ASSET_TOKEN_ADDRESS
            newDao.setAddressConfiguration(
                DaoHelper.FLEX_VOTING_ASSET_TOKEN_ADDRESS,
                tokenAddress
            );
        }

        //10.config QUORUM
        newDao.setConfiguration(DaoHelper.QUORUM, _uint256VoteArgs[3]);

        //11.config FLEX_VOTING_SUPPORT_TYPE
        newDao.setConfiguration(
            DaoHelper.FLEX_VOTING_SUPPORT_TYPE,
            _uint256VoteArgs[4]
        );

        //12.config FLEX_VOTING_QUORUM_TYPE
        newDao.setConfiguration(
            DaoHelper.FLEX_VOTING_QUORUM_TYPE,
            _uint256VoteArgs[5]
        );
        return true;
    }

    //registerGenesisStewards
    function summonFlexDao6(
        address[] calldata flexDaoGenesisStewards,
        uint256[] calldata allocations,
        address newDaoAddr,
        uint256 votingAssetType
    ) external returns (bool) {
        DaoRegistry newDao = DaoRegistry(newDaoAddr);
        require(address(this) == msg.sender);

        registerGenesisStewards(
            newDao,
            votingAssetType,
            flexDaoGenesisStewards,
            allocations
        );

        return true;
    }

    // config polling && Investors CAP
    function summonFlexDao7(
        bool[2] memory booleanParams,
        string calldata flexPollVoterMembershipName,
        uint256[10] memory uint256Params,
        address[3] calldata addressParams, //flexDaoPollVoterMembershipTokenAddress,newDaoAddr,flexDaoPollingtokenAddress
        address[] calldata flexDaoPollVoterMembershipWhiteList
    ) external returns (bool) {
        DaoRegistry dao = DaoRegistry(addressParams[1]);
        require(address(this) == msg.sender);

        //1config polling
        if (booleanParams[0]) {
            dao.setConfiguration(DaoHelper.FLEX_INVESTMENT_TYPE, 1);
            configFlexDaoFlexPolling(
                dao,
                uint256Params[0],
                uint256Params[1],
                uint256Params[2],
                uint256Params[3],
                uint256Params[4],
                uint256Params[5],
                addressParams[2]
            );
            configFlexDaoPollVoterMembership(
                dao,
                flexPollVoterMembershipName,
                [uint256Params[6], uint256Params[7], uint256Params[8]],
                addressParams[0],
                flexDaoPollVoterMembershipWhiteList
            );
        }

        //2config InvestorS CAP
        if (booleanParams[1]) {
            dao.setConfiguration(DaoHelper.MAX_INVESTORS_ENABLE, 1);
            dao.setConfiguration(DaoHelper.MAX_INVESTORS, uint256Params[9]);
        }
        return true;
    }

    // config Steward Membership
    function summonFlexDao8(
        bool flexDaoStewardMembershipEnable,
        bool flexDaoProposerMembershipEnable,
        string[2] calldata stringParams, // flexGovernorMembershipName,flexProposerMembershipName
        uint256[6] memory uint256Params,
        address[3] calldata addressParams, //flexDaoStewardMembershipTokenAddress, flexDaoProposerMembershipTokenAddress,newDaoAddr
        // address flexDaoStewardMembershipTokenAddress,
        address[] calldata flexDaoStewardMembershipWhitelist,
        // address flexDaoProposerMembershipTokenAddress,
        address[] calldata flexDaoProposerMembershipWhiteList
    ) external returns (bool) {
        DaoRegistry dao = DaoRegistry(addressParams[2]);
        require(address(this) == msg.sender);

        //3config Steward Membership
        if (flexDaoStewardMembershipEnable) {
            dao.setConfiguration(DaoHelper.FLEX_GOVERNOR_MEMBERSHIP_ENABLE, 1);
            dao.setStringConfiguration(
                DaoHelper.FLEX_GOVERNOR_MEMBERSHIP_NAME,
                stringParams[0]
            );
            dao.setConfiguration(
                DaoHelper.FLEX_GOVERNOR_MEMBERSHIP_TYPE,
                uint256Params[0]
            );
            if (
                uint256Params[0] == 0 ||
                uint256Params[0] == 1 ||
                uint256Params[0] == 2
            ) {
                dao.setConfiguration(
                    DaoHelper.FLEX_GOVERNOR_MEMBERSHIP_MINI_HOLDING,
                    uint256Params[1]
                );
                dao.setAddressConfiguration(
                    DaoHelper.FLEX_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS,
                    addressParams[0]
                );
            }

            if (uint256Params[0] == 2) {
                dao.setConfiguration(
                    DaoHelper.FLEX_GOVERNOR_MEMBERSHIP_TOKEN_ID,
                    uint256Params[2]
                );
            }

            if (
                uint256Params[0] == 3 &&
                flexDaoStewardMembershipWhitelist.length > 0
            ) {
                StewardManagementContract stewardContract = StewardManagementContract(
                        dao.getAdapterAddress(DaoHelper.FLEX_STEWARD_MANAGEMENT)
                    );
                for (
                    uint8 i = 0;
                    i < flexDaoStewardMembershipWhitelist.length;
                    i++
                ) {
                    stewardContract.registerGovernorWhiteList(
                        dao,
                        flexDaoStewardMembershipWhitelist[i]
                    );
                }
            }
        }
        if (flexDaoProposerMembershipEnable) {
            dao.setConfiguration(DaoHelper.FLEX_PROPOSER_ENABLE, 1);
            dao.setStringConfiguration(
                DaoHelper.FLEX_PROPOSER_MEMBERSHIP_NAME,
                stringParams[1]
            );
            //4 config proposer membership
            configFlexDaoProposerMembership(
                dao,
                uint256Params[3],
                uint256Params[5],
                addressParams[1],
                uint256Params[4],
                flexDaoProposerMembershipWhiteList
            );
        }

        return true;
    }

    //config investor membership
    function summonFlexDao9(
        bool flexDaoInvestorMembetshipEnable,
        string calldata name,
        uint256 flexDaoPaticipantMembershipVarifyType,
        uint256 flexDaoPaticipantMembershipMinHolding,
        uint256 flexDaoPaticipantMembershipTokenId,
        address flexDaoPaticipantMembershipTokenAddress,
        address[] calldata flexDaoPaticipantMembershipWhiteList,
        address newDaoAddr
    ) external returns (bool) {
        DaoRegistry dao = DaoRegistry(newDaoAddr);
        require(address(this) == msg.sender);

        //config investor membership
        if (flexDaoInvestorMembetshipEnable) {
            dao.setConfiguration(DaoHelper.FLEX_INVESTOR_MEMBERSHIP_ENABLE, 1);
            registerFlexDaoInvestorMembership(
                dao,
                name,
                flexDaoPaticipantMembershipVarifyType,
                flexDaoPaticipantMembershipMinHolding,
                flexDaoPaticipantMembershipTokenId,
                flexDaoPaticipantMembershipTokenAddress
            );
            if (flexDaoPaticipantMembershipVarifyType == 3) {
                registerFlexDaoInvestorMembershipWhitelist(
                    dao,
                    flexDaoPaticipantMembershipWhiteList
                );
            }
        }

        return true;
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

        //remove summondaoContract && DaoFacConctract from dao member list
        dao.removeMember(dao.daoFactory());
        dao.finalizeDao();
        // dao.removeMember(address(this));
        StewardManagementContract stewardContract = StewardManagementContract(
            dao.getAdapterAddress(DaoHelper.FLEX_STEWARD_MANAGEMENT)
        );
        stewardContract.quit(dao);
        return true;
    }

    function registerGenesisStewards(
        DaoRegistry dao,
        uint256 votingAssetType,
        address[] calldata flexDaoGenesisStewards,
        uint256[] calldata allcationValues
    ) internal {
        FlexStewardAllocationAdapter stewardAlloc = FlexStewardAllocationAdapter(
                dao.getAdapterAddress(DaoHelper.FLEX_STEWARD_ALLOCATION_ADAPT)
            );

        if (votingAssetType == 3)
            setAllocation(
                stewardAlloc,
                dao,
                dao.daoCreator(),
                allcationValues[0]
            );
        if (flexDaoGenesisStewards.length > 0) {
            for (uint8 i = 0; i < flexDaoGenesisStewards.length; i++) {
                dao.potentialNewMember(flexDaoGenesisStewards[i]);
                if (votingAssetType == 3)
                    setAllocation(
                        stewardAlloc,
                        dao,
                        flexDaoGenesisStewards[i],
                        allcationValues[i + 1]
                    );
            }
        }
    }

    function setAllocation(
        FlexStewardAllocationAdapter stewardAlloc,
        DaoRegistry dao,
        address account,
        uint256 value
    ) internal {
        stewardAlloc.setAllocation(dao, account, value);
    }

    function configFlexDaoPollVoterMembership(
        DaoRegistry dao,
        string calldata flexPollVoterMembershipName,
        uint256[3] memory uint256Params, // flexDaoPollVoterMembershipVarifyType,flexDaoPollVoterMembershipMinHolding,flexDaoPollVoterMembershipTokenId
        address flexDaoPollVoterMembershipTokenAddress,
        address[] calldata flexDaoPollVoterMembershipWhiteList
    ) internal {
        // 0- ERC2O
        // 1- ERC721
        // 2- ERC1155
        // 3- Whitelist
        dao.setConfiguration(
            DaoHelper.FLEX_POLLVOTER_MEMBERSHIP_TYPE,
            uint256Params[0]
        );
        dao.setStringConfiguration(
            DaoHelper.FLEX_POLLVOTER_MEMBERSHIP_NAME,
            flexPollVoterMembershipName
        );

        if (
            uint256Params[0] == 0 ||
            uint256Params[0] == 1 ||
            uint256Params[0] == 2
        ) {
            dao.setConfiguration(
                DaoHelper.FLEX_POLLVOTER_MEMBERSHIP_MIN_HOLDING,
                uint256Params[1]
            );
            dao.setAddressConfiguration(
                DaoHelper.FLEX_POLLVOTER_MEMBERSHIP_TOKEN_ADDRESS,
                flexDaoPollVoterMembershipTokenAddress
            );
        }
        if (uint256Params[0] == 2) {
            dao.setConfiguration(
                DaoHelper.FLEX_POLLVOTER_MEMBERSHIP_TOKENID,
                uint256Params[2]
            );
        }
        if (uint256Params[0] == 3) {
            registerFlexDaoPollVoterMembershipWhiteList(
                dao,
                flexDaoPollVoterMembershipWhiteList
            );
        }
    }

    function configFlexDaoFlexPolling(
        DaoRegistry dao,
        uint256 flexDaoPollingVotingPeriod,
        uint256 flexDaoPollingVotingPower,
        uint256 flexDaoPollingSuperMajority,
        uint256 flexDaoPollingQuorum,
        uint256 flexDaoPollingVotingAssetType, // 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
        uint256 tokenId,
        address tokenAddress
    ) internal {
        dao.setConfiguration(
            DaoHelper.FLEX_POLLING_VOTING_PERIOD,
            flexDaoPollingVotingPeriod
        );
        dao.setConfiguration(
            DaoHelper.FLEX_POLL_VOTING_WEIGHTED_TYPE,
            flexDaoPollingVotingPower
        );
        dao.setConfiguration(
            DaoHelper.FLEX_POLLING_SUPER_MAJORITY,
            flexDaoPollingSuperMajority
        );
        dao.setConfiguration(
            DaoHelper.FLEX_POLLING_QUORUM,
            flexDaoPollingQuorum
        );
        dao.setConfiguration(
            DaoHelper.FLEX_POLL_VOTING_ASSET_TYPE,
            flexDaoPollingVotingAssetType
        );
        if (flexDaoPollingVotingAssetType == 2)
            dao.setConfiguration(
                DaoHelper.FLEX_POLL_VOTING_ASSET_TOKEN_ID,
                tokenId
            );
        if (
            flexDaoPollingVotingAssetType == 0 ||
            flexDaoPollingVotingAssetType == 1 ||
            flexDaoPollingVotingAssetType == 2
        )
            dao.setAddressConfiguration(
                DaoHelper.FLEX_POLL_VOTING_ASSET_TOKEN_ADDRESS,
                tokenAddress
            );
    }

    function registerFlexDaoPollVoterMembershipWhiteList(
        DaoRegistry dao,
        address[] calldata flexDaoPollVoterMembershipWhiteList
    ) internal {
        if (flexDaoPollVoterMembershipWhiteList.length > 0) {
            FlexPollingVotingContract flexPollingVoting = FlexPollingVotingContract(
                    dao.getAdapterAddress(DaoHelper.FLEX_POLLING_VOTING_ADAPT)
                );
            for (
                uint8 i = 0;
                i < flexDaoPollVoterMembershipWhiteList.length;
                i++
            ) {
                flexPollingVoting.registerPollVoterWhiteList(
                    dao,
                    flexDaoPollVoterMembershipWhiteList[i]
                );
            }
        }
    }

    function registerFlexDaoInvestorMembership(
        DaoRegistry dao,
        string calldata name,
        uint256 flexDaoPaticipantMembershipVarifyType,
        uint256 flexDaoPaticipantMembershipMinHolding,
        uint256 flexDaoPaticipantMembershipTokenId,
        address flexDaoPaticipantMembershipTokenAddress
    ) internal {
        dao.setStringConfiguration(
            DaoHelper.FLEX_INVESTOR_MEMBERSHIP_NAME,
            name
        );
        dao.setConfiguration(
            DaoHelper.FLEX_INVESTOR_MEMBERSHIP_TYPE,
            flexDaoPaticipantMembershipVarifyType
        );
        dao.setConfiguration(
            DaoHelper.FLEX_INVESTOR_MEMBERSHIP_MIN_HOLDING,
            flexDaoPaticipantMembershipMinHolding
        );
        dao.setConfiguration(
            DaoHelper.FLEX_INVESTOR_MEMBERSHIP_TOKENID,
            flexDaoPaticipantMembershipTokenId
        );
        dao.setAddressConfiguration(
            DaoHelper.FLEX_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS,
            flexDaoPaticipantMembershipTokenAddress
        );
    }

    function registerFlexDaoInvestorMembershipWhitelist(
        DaoRegistry dao,
        address[] calldata _whitelist
    ) internal {
        if (_whitelist.length > 0) {
            FlexInvestmentPoolAdapterContract flexFundingPool = FlexInvestmentPoolAdapterContract(
                    dao.getAdapterAddress(DaoHelper.FLEX_INVESTMENT_POOL_ADAPT)
                );
            for (uint8 i = 0; i < _whitelist.length; i++) {
                flexFundingPool.registerInvestorWhiteList(dao, _whitelist[i]);
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
            FlexInvestmentPoolAdapterContract flexFundingPool = FlexInvestmentPoolAdapterContract(
                    dao.getAdapterAddress(DaoHelper.FLEX_INVESTMENT_POOL_ADAPT)
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
        // console.log("caller:", msg.sender);
        for (uint256 i = 0; i < calls.length; i++) {
            (bool success, ) = calls[i].target.call(calls[i].callData);
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

    modifier ParamCheck(FlexDaoParams calldata params) {
        require(
            params._flexDaoInfo.flexDaoManagementfee >= 0 &&
                params._flexDaoInfo.flexDaoManagementfee <
                DaoHelper.TOKEN_AMOUNT_PRECISION,
            "Summon Flex DAO::Invalid Management Fee Amount"
        );
        _;
    }

    function summonFlexDao(
        FlexDaoParams calldata params
    ) external ParamCheck(params) {
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

        uint256[6] memory uint256VoteParams = [
            params._flexDaoVotingInfo.votingPeriod,
            params._flexDaoVotingInfo.superMajority,
            params._flexDaoVotingInfo.votingAssetType,
            params._flexDaoVotingInfo.quorum,
            params._flexDaoVotingInfo.supportType,
            params._flexDaoVotingInfo.quorumType
        ];
        vars.summonFlexDao5Payload = abi.encodeWithSignature(
            "summonFlexDao5(uint256,address,uint256,address,uint8,uint256,address,uint256[6],address)",
            params._flexDaoInfo.flexDaoManagementfee,
            params._flexDaoInfo.managementFeeAddress,
            params._flexDaoInfo.returnTokenManagementFee,
            vars.newDaoAddr,
            params._flexDaoVotingInfo.votingPower,
            params._flexDaoVotingInfo.tokenID,
            params._flexDaoVotingInfo.tokenAddress,
            uint256VoteParams,
            params._flexDaoInfo.riceRewardReceiver
        );

        vars.summonFlexDao6Payload = abi.encodeWithSignature(
            "summonFlexDao6(address[],uint256[],address,uint256)",
            params._flexDaoInfo.flexDaoGenesisStewards,
            params._flexDaoInfo.allocations,
            vars.newDaoAddr,
            params._flexDaoVotingInfo.votingAssetType
        );

        uint256[10] memory uint256Params = [
            params._flexDaoPollingInfo.votingPeriod,
            params._flexDaoPollingInfo.votingPower,
            params._flexDaoPollingInfo.superMajority,
            params._flexDaoPollingInfo.quorum,
            params._flexDaoPollingInfo.votingAssetType,
            params._flexDaoPollingInfo.tokenID,
            params._flexDaoPollVoterMembershipInfo.varifyType,
            params._flexDaoPollVoterMembershipInfo.minHolding,
            params._flexDaoPollVoterMembershipInfo.tokenId,
            params._flexDaoInvestorCapInfo.maxInvestorsAmount
        ];

        bool[2] memory booleanParams = [
            params.fundingPollEnable,
            params._flexDaoInvestorCapInfo.enable
        ];

        vars.summonFlexDao7Payload = abi.encodeWithSignature(
            "summonFlexDao7(bool[2],string,uint256[10],address[3],address[])",
            booleanParams,
            params._flexDaoPollVoterMembershipInfo.name,
            uint256Params,
            [
                params._flexDaoPollVoterMembershipInfo.tokenAddress,
                vars.newDaoAddr,
                params._flexDaoPollingInfo.tokenAddress
            ],
            params._flexDaoPollVoterMembershipInfo.whiteList
        );

        uint256[6] memory uint256SummonFlexDao8Params = [
            params._flexDaoGovernorMembershipInfo.varifyType,
            params._flexDaoGovernorMembershipInfo.minHolding,
            params._flexDaoGovernorMembershipInfo.tokenId,
            params._flexDaoProposerMembershipInfo.varifyType,
            params._flexDaoProposerMembershipInfo.tokenId,
            params._flexDaoProposerMembershipInfo.minHolding
        ];
        vars.summonFlexDao8Payload = abi.encodeWithSignature(
            "summonFlexDao8(bool,bool,string[2],uint256[6],address[3],address[],address[])",
            params._flexDaoGovernorMembershipInfo.enable,
            params._flexDaoProposerMembershipInfo.proposerMembershipEnable,
            [
                params._flexDaoGovernorMembershipInfo.name,
                params._flexDaoProposerMembershipInfo.name
            ],
            uint256SummonFlexDao8Params,
            [
                params._flexDaoGovernorMembershipInfo.tokenAddress,
                params._flexDaoProposerMembershipInfo.tokenAddress,
                vars.newDaoAddr
            ],
            params._flexDaoGovernorMembershipInfo.whiteList,
            params._flexDaoProposerMembershipInfo.whiteList
        );

        vars.summonFlexDao9Payload = abi.encodeWithSignature(
            "summonFlexDao9(bool,string,uint256,uint256,uint256,address,address[],address)",
            params.flexDaoInvestorMembetshipEnable,
            params._flexDaoPaticipantMembershipInfos.name,
            params._flexDaoPaticipantMembershipInfos.varifyType,
            params._flexDaoPaticipantMembershipInfos.minHolding,
            params._flexDaoPaticipantMembershipInfos.tokenId,
            params._flexDaoPaticipantMembershipInfos.tokenAddress,
            params._flexDaoPaticipantMembershipInfos.whiteList,
            vars.newDaoAddr
        );

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

    function bytesToAddress(
        bytes memory bys
    ) private pure returns (address addr) {
        assembly {
            addr := mload(add(bys, 32))
        }
    }
}
