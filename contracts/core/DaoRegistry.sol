pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../guards/AdapterGuard.sol";
import "../guards/MemberGuard.sol";
import "../extensions/IExtension.sol";
import "../helpers/DaoHelper.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
MIT License

Copyright (c) 2020 Openlaw

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

contract DaoRegistry is MemberGuard, AdapterGuard {
    bool public initialized = false; // internally tracks deployment under eip-1167 proxy pattern
    using EnumerableSet for EnumerableSet.AddressSet;
    using Counters for Counters.Counter;

    enum DaoState {
        CREATION,
        READY
    }

    /*
     * EVENTS
     */
    /// @dev - Events for Proposals
    event SubmittedProposal(bytes32 proposalId, uint256 flags);
    event SponsoredProposal(
        bytes32 proposalId,
        uint256 flags,
        address votingAdapter
    );
    event ProcessedProposal(bytes32 proposalId, uint256 flags);
    event AdapterAdded(
        bytes32 adapterId,
        address adapterAddress,
        uint256 flags
    );
    event AdapterRemoved(bytes32 adapterId);

    event ExtensionAdded(bytes32 extensionId, address extensionAddress);
    event ExtensionRemoved(bytes32 extensionId);

    /// @dev - Events for Members
    event UpdateDelegateKey(address memberAddress, address newDelegateKey);
    event ConfigurationUpdated(bytes32 key, uint256 value);
    event AddressConfigurationUpdated(bytes32 key, address value);

    enum MemberFlag {
        EXISTS
    }

    enum ProposalFlag {
        EXISTS,
        SPONSORED,
        PROCESSED
    }

    enum AclFlag {
        REPLACE_ADAPTER, //1
        SUBMIT_PROPOSAL, //2
        UPDATE_DELEGATE_KEY, //3
        SET_CONFIGURATION, //4
        ADD_EXTENSION, //5
        REMOVE_EXTENSION, //6
        NEW_MEMBER, //7
        REMOVE_MEMBER, //8
        SET_VOTE_TYPE, //9
        INCREASE_FUNDING_ID, //10
        INCREASE_NEW_FUND_ID, //11
        INCREASE_GOVENOR_IN_ID, //12
        INCREASE_GOVENOR_OUT_ID, //13
        INCREASE_INVESTOR_CAP_ID, //14
        INCREASE_GOVERNOR_MEMBERSHIP_ID, //15
        INCREASE_INVESTOR_MEMBERSHIP_ID, //16
        INCREASE_VOTING_ID, //17
        INCREASE_FEE_ID, //18
        INCREASE_POLL_FOR_INVESTMENT_ID, //19
        INCREASE_PROPOSER_MEMBERSHIP_ID, //20
        INCREASE_PROPOSER_REWARD_ID, //21
        INCREASE_EXPENSE_ID, //22
        INCREASE_TOPUP_ID, //23
        INCREASE_CLEAR_FUND_ID, //24
        INCREASE_Gov_Vot_ASSET_ALLOC_ID, //25
        INCREASE_SET_RICE_RECEIVER_ID //26
    }
    enum VoteType {
        SIMPLE_MAJORITY,
        SIMPLE_MAJORITY_QUORUM_REQUIRED,
        SUPERMAJORITY,
        SUPERMAJORITY_QUORUM_REQUIRED
    }
    enum ProposalType {
        FUNDING, // funding proposal
        MINT, // add membership
        BURN, // revoke membership
        CALL, // call contracts
        VPERIOD, // set `votingPeriod`
        GPERIOD, // set `gracePeriod`
        QUORUM, // set `quorum`
        SUPERMAJORITY, // set `supermajority`
        TYPE, // set `VoteType` to `ProposalType`
        PAUSE, // flip membership transferability
        EXTENSION, // flip `extensions` whitelisting
        ESCAPE, // delete pending proposal in case of revert
        DOCS // amend org docs
    }
    /*
     * STRUCTURES
     */
    struct Proposal {
        // the structure to track all the proposals in the DAO
        address adapterAddress; // the adapter address that called the functions to change the DAO state
        uint256 flags; // flags to track the state of the proposal: exist, sponsored, processed, canceled, etc.
    }

    struct Member {
        // the structure to track all the members in the DAO
        uint256 flags; // flags to track the state of the member: exists, etc
    }

    struct Checkpoint {
        // A checkpoint for marking number of votes from a given block
        uint96 fromBlock;
        uint160 amount;
    }

    struct DelegateCheckpoint {
        // A checkpoint for marking the delegate key for a member from a given block
        uint96 fromBlock;
        address delegateKey;
    }

    struct AdapterEntry {
        bytes32 id;
        uint256 acl;
    }

    struct ExtensionEntry {
        bytes32 id;
        mapping(address => uint256) acl;
        bool deleted;
    }

    /*
     * PUBLIC VARIABLES
     */
    mapping(address => Member) public members; // the map to track all members of the DAO
    address[] private _members;
    mapping(DaoHelper.ProposalType => DaoHelper.VoteType)
        public proposalVoteTypes;

    // delegate key => member address mapping
    mapping(address => address) public memberAddressesByDelegatedKey;
    EnumerableSet.AddressSet stewards;

    // memberAddress => checkpointNum => DelegateCheckpoint
    mapping(address => mapping(uint32 => DelegateCheckpoint)) checkpoints;
    // memberAddress => numDelegateCheckpoints
    mapping(address => uint32) numCheckpoints;

    DaoState public state;
    address public daoFactory;
    address public daoCreator;
    Counters.Counter private _fundingProposalIds;
    Counters.Counter private _newFundProposalIds;
    Counters.Counter private _govenorInIds;
    Counters.Counter private _govenorOutIds;
    Counters.Counter private _InvestorCapProposalIds;
    Counters.Counter private _governorMembershipProposalIds;
    Counters.Counter private _investorMembershipProposalIds;
    Counters.Counter private _votingProposalIds;
    Counters.Counter private _feesProposalIds;
    Counters.Counter private _pollForInvestmentProposalIds;
    Counters.Counter private _proposerMembershipPropossalIds;
    Counters.Counter private _proposerRewardPropossalIds;
    Counters.Counter private _expenseProposalIds;
    Counters.Counter private _topupProposalIds;
    Counters.Counter private _clearFundProposalIds;
    Counters.Counter private _governorVotingAssetAllocationProposalIds;
    Counters.Counter private _vinGovernorVotingAssetAllocationProposalIds;
    Counters.Counter private _riceReceiverProposalIds;

    /// @notice The map that keeps track of all proposasls submitted to the DAO
    mapping(bytes32 => Proposal) public proposals;
    /// @notice The map that tracks the voting adapter address per proposalId
    mapping(bytes32 => address) public votingAdapter;
    /// @notice The map that keeps track of all adapters registered in the DAO
    mapping(bytes32 => address) public adapters;
    /// @notice The inverse map to get the adapter id based on its address
    mapping(address => AdapterEntry) public inverseAdapters;
    /// @notice The map that keeps track of all extensions registered in the DAO
    mapping(bytes32 => address) public extensions;
    /// @notice The inverse map to get the extension id based on its address
    mapping(address => ExtensionEntry) public inverseExtensions;
    /// @notice The map that keeps track of configuration parameters for the DAO and adapters
    mapping(bytes32 => uint256) public mainConfiguration;
    mapping(bytes32 => address) public addressConfiguration;
    mapping(bytes32 => string) public stringConfiguration;
    // vote types for proposal
    // mapping(bytes32 => VoteType) public proposalVoteTypes;
    uint256 public lockedAt;

    /// @notice Clonable contract must have an empty constructor
    constructor() {}

    /**
     * @notice Initialises the DAO
     * @dev Involves initialising available tokens, checkpoints, and membership of creator
     * @dev Can only be called once
     * @param creator The DAO's creator, who will be an initial member
     * @param payer The account which paid for the transaction to create the DAO, who will be an initial member
     */
    //slither-disable-next-line reentrancy-no-eth
    function initialize(
        address creator,
        address payer,
        address _daoFactory
    ) external {
        require(!initialized, "dao already initialized");
        initialized = true;
        potentialNewMember(msg.sender);
        potentialNewMember(payer);
        potentialNewMember(creator);
        daoCreator = creator;
        proposalVoteTypes[DaoHelper.ProposalType.FUNDING] = DaoHelper
            .VoteType
            .SUPERMAJORITY_QUORUM_REQUIRED;
        proposalVoteTypes[DaoHelper.ProposalType.MEMBERSHIP] = DaoHelper
            .VoteType
            .SUPERMAJORITY_QUORUM_REQUIRED;
        proposalVoteTypes[DaoHelper.ProposalType.KICK] = DaoHelper
            .VoteType
            .SUPERMAJORITY_QUORUM_REQUIRED;
        daoFactory = _daoFactory;
        state = DaoState.CREATION;
    }

    /**
     * @dev Sets the state of the dao to READY
     */
    function finalizeDao() external {
        // require(
        //     isActiveMember(this, msg.sender) || isAdapter(msg.sender),
        //     "not allowed to finalize"
        // );
        state = DaoState.READY;
    }

    /**
     * @notice Contract lock strategy to lock only the caller is an adapter or extension.
     */
    function lockSession() external {
        if (isAdapter(msg.sender) || isExtension(msg.sender)) {
            lockedAt = block.number;
        }
    }

    /**
     * @notice Contract lock strategy to release the lock only the caller is an adapter or extension.
     */
    function unlockSession() external {
        if (isAdapter(msg.sender) || isExtension(msg.sender)) {
            lockedAt = 0;
        }
    }

    /**
     * @notice Sets a configuration value
     * @dev Changes the value of a key in the configuration mapping
     * @param key The configuration key for which the value will be set
     * @param value The value to set the key
     */
    function setConfiguration(
        bytes32 key,
        uint256 value
    ) external hasAccess(this, AclFlag.SET_CONFIGURATION) {
        mainConfiguration[key] = value;
        emit ConfigurationUpdated(key, value);
    }

    function setStringConfiguration(
        bytes32 key,
        string calldata value
    ) external hasAccess(this, AclFlag.SET_CONFIGURATION) {
        stringConfiguration[key] = value;
        // emit ConfigurationUpdated(key, value);
    }

    /**
     * @notice Sets a configuration value
     * @dev Changes the value of a key in the configuration mapping
     * @param key The configuration key for which the value will be set
     * @param value The value to set the key
     */
    // function setConfigurationByMember(bytes32 key, uint256 value)
    //     external
    //     onlyMember(this)
    // {
    //     mainConfiguration[key] = value;
    //     emit ConfigurationUpdated(key, value);
    // }

    /**
     * @notice Registers a member address in the DAO if it is not registered or invalid.
     * @notice A potential new member is a member that holds no shares, and its registration still needs to be voted on.
     */
    function potentialNewMember(
        address memberAddress
    ) public hasAccess(this, AclFlag.NEW_MEMBER) {
        require(memberAddress != address(0x0), "invalid member address");
        if (!stewards.contains(memberAddress)) {
            stewards.add(memberAddress);
        }
        stewards.add(memberAddress);
        Member storage member = members[memberAddress];
        if (!DaoHelper.getFlag(member.flags, uint8(MemberFlag.EXISTS))) {
            require(
                memberAddressesByDelegatedKey[memberAddress] == address(0x0),
                "member address already taken as delegated key"
            );
            member.flags = DaoHelper.setFlag(
                member.flags,
                uint8(MemberFlag.EXISTS),
                true
            );
            memberAddressesByDelegatedKey[memberAddress] = memberAddress;
            _members.push(memberAddress);
        }
    }

    /**
     * @notice unRegisters a member address in the DAO if it is  registered .
     */
    function removeMember(
        address memberAddress
    ) public hasAccess(this, AclFlag.REMOVE_MEMBER) {
        require(memberAddress != address(0x0), "invalid member address");
        if (stewards.contains(memberAddress)) {
            stewards.remove(memberAddress);
        }
        Member storage member = members[memberAddress];
        if (DaoHelper.getFlag(member.flags, uint8(MemberFlag.EXISTS))) {
            require(
                memberAddressesByDelegatedKey[memberAddress] != address(0x0),
                "member address has not taken as delegated key"
            );
            member.flags = DaoHelper.setFlag(
                member.flags,
                uint8(MemberFlag.EXISTS),
                false
            );
            memberAddressesByDelegatedKey[memberAddress] = address(0x0);
        }
    }

    /**
     * @notice Sets an configuration value
     * @dev Changes the value of a key in the configuration mapping
     * @param key The configuration key for which the value will be set
     * @param value The value to set the key
     */
    function setAddressConfiguration(
        bytes32 key,
        address value
    ) external hasAccess(this, AclFlag.SET_CONFIGURATION) {
        addressConfiguration[key] = value;
        emit AddressConfigurationUpdated(key, value);
    }

    /**
     * @return The configuration value of a particular key
     * @param _proposalType The key to look up in the configuration mapping
     */
    function getProposalVoteType(
        DaoHelper.ProposalType _proposalType
    ) external view returns (uint32) {
        return uint32(proposalVoteTypes[_proposalType]);
    }

    /**
     * @return The configuration value of a particular key
     * @param key The key to look up in the configuration mapping
     */
    function getConfiguration(bytes32 key) external view returns (uint256) {
        return mainConfiguration[key];
    }

    /**
     * @return The configuration value of a particular key
     * @param key The key to look up in the configuration mapping
     */
    function getAddressConfiguration(
        bytes32 key
    ) external view returns (address) {
        return addressConfiguration[key];
    }

    function getStringConfiguration(
        bytes32 key
    ) external view returns (string memory) {
        return stringConfiguration[key];
    }

    /**
     * @notice It sets the ACL flags to an Adapter to make it possible to access specific functions of an Extension.
     */
    function setAclToExtensionForAdapter(
        address extensionAddress,
        address adapterAddress,
        uint256 acl
    ) external hasAccess(this, AclFlag.ADD_EXTENSION) {
        require(isAdapter(adapterAddress), "not an adapter");
        require(isExtension(extensionAddress), "not an extension");
        inverseExtensions[extensionAddress].acl[adapterAddress] = acl;
    }

    /**
     * @notice Replaces an adapter in the registry in a single step.
     * @notice It handles addition and removal of adapters as special cases.
     * @dev It removes the current adapter if the adapterId maps to an existing adapter address.
     * @dev It adds an adapter if the adapterAddress parameter is not zeroed.
     * @param adapterId The unique identifier of the adapter
     * @param adapterAddress The address of the new adapter or zero if it is a removal operation
     * @param acl The flags indicating the access control layer or permissions of the new adapter
     * @param keys The keys indicating the adapter configuration names.
     * @param values The values indicating the adapter configuration values.
     */
    function replaceAdapter(
        bytes32 adapterId,
        address adapterAddress,
        uint128 acl,
        bytes32[] calldata keys,
        uint256[] calldata values
    ) external hasAccess(this, AclFlag.REPLACE_ADAPTER) {
        require(adapterId != bytes32(0), "adapterId must not be empty");

        address currentAdapterAddr = adapters[adapterId];
        if (currentAdapterAddr != address(0x0)) {
            delete inverseAdapters[currentAdapterAddr];
            delete adapters[adapterId];
            emit AdapterRemoved(adapterId);
        }

        for (uint256 i = 0; i < keys.length; i++) {
            bytes32 key = keys[i];
            uint256 value = values[i];
            mainConfiguration[key] = value;
            emit ConfigurationUpdated(key, value);
        }

        if (adapterAddress != address(0x0)) {
            require(
                inverseAdapters[adapterAddress].id == bytes32(0),
                "adapterAddress already in use"
            );
            adapters[adapterId] = adapterAddress;
            inverseAdapters[adapterAddress].id = adapterId;
            inverseAdapters[adapterAddress].acl = acl;
            emit AdapterAdded(adapterId, adapterAddress, acl);
        }
    }

    /**
     * @notice Adds a new extension to the registry
     * @param extensionId The unique identifier of the new extension
     * @param extension The address of the extension
     * @param creator The DAO's creator, who will be an initial member
     */
    // slither-disable-next-line reentrancy-events
    function addExtension(
        bytes32 extensionId,
        IExtension extension,
        address creator
    ) external hasAccess(this, AclFlag.ADD_EXTENSION) {
        // console.log("addExtension");
        require(extensionId != bytes32(0), "extension id must not be empty");
        require(
            extensions[extensionId] == address(0x0),
            "extension Id already in use"
        );
        require(
            !inverseExtensions[address(extension)].deleted,
            "extension can not be re-added"
        );
        extensions[extensionId] = address(extension);
        inverseExtensions[address(extension)].id = extensionId;

        extension.initialize(this, creator);
        // console.log("extension added");
        emit ExtensionAdded(extensionId, address(extension));
    }

    /**
     * @notice Removes an adapter from the registry
     * @param extensionId The unique identifier of the extension
     */
    function removeExtension(
        bytes32 extensionId
    ) external hasAccess(this, AclFlag.REMOVE_EXTENSION) {
        require(extensionId != bytes32(0), "extensionId must not be empty");
        address extensionAddress = extensions[extensionId];
        require(extensionAddress != address(0x0), "extensionId not registered");
        ExtensionEntry storage extEntry = inverseExtensions[extensionAddress];
        extEntry.deleted = true;
        //slither-disable-next-line mapping-deletion
        delete inverseExtensions[extensionAddress];
        delete extensions[extensionId];
        emit ExtensionRemoved(extensionId);
    }

    function increaseInvestmentId()
        external
        hasAccess(this, AclFlag.INCREASE_FUNDING_ID)
    {
        _fundingProposalIds.increment();
    }

    function increaseFundEstablishmentId()
        external
        hasAccess(this, AclFlag.INCREASE_NEW_FUND_ID)
    {
        _newFundProposalIds.increment();
    }

    function increaseGovenorInId()
        external
        hasAccess(this, AclFlag.INCREASE_GOVENOR_IN_ID)
    {
        _govenorInIds.increment();
    }

    function increaseGovenorOutId()
        external
        hasAccess(this, AclFlag.INCREASE_GOVENOR_IN_ID)
    {
        _govenorOutIds.increment();
    }

    function increaseInvestorCapId()
        external
        hasAccess(this, AclFlag.INCREASE_INVESTOR_CAP_ID)
    {
        _InvestorCapProposalIds.increment();
    }

    function increaseGovernorMembershipId()
        external
        hasAccess(this, AclFlag.INCREASE_GOVERNOR_MEMBERSHIP_ID)
    {
        _governorMembershipProposalIds.increment();
    }

    function increaseInvstorMembershipId()
        external
        hasAccess(this, AclFlag.INCREASE_INVESTOR_MEMBERSHIP_ID)
    {
        _investorMembershipProposalIds.increment();
    }

    function increaseVotingId()
        external
        hasAccess(this, AclFlag.INCREASE_VOTING_ID)
    {
        _votingProposalIds.increment();
    }

    function increaseFeesId()
        external
        hasAccess(this, AclFlag.INCREASE_FEE_ID)
    {
        _feesProposalIds.increment();
    }

    function increasePollForInvestmentId()
        external
        hasAccess(this, AclFlag.INCREASE_POLL_FOR_INVESTMENT_ID)
    {
        _pollForInvestmentProposalIds.increment();
    }

    function increaseProposerMembershipId()
        external
        hasAccess(this, AclFlag.INCREASE_PROPOSER_MEMBERSHIP_ID)
    {
        _proposerMembershipPropossalIds.increment();
    }

    function increaseProposerRewardId()
        external
        hasAccess(this, AclFlag.INCREASE_PROPOSER_REWARD_ID)
    {
        _proposerRewardPropossalIds.increment();
    }

    function increaseExpenseId()
        external
        hasAccess(this, AclFlag.INCREASE_EXPENSE_ID)
    {
        _expenseProposalIds.increment();
    }

    function increaseTopupId()
        external
        hasAccess(this, AclFlag.INCREASE_TOPUP_ID)
    {
        _topupProposalIds.increment();
    }

    function increaseClearFundId()
        external
        hasAccess(this, AclFlag.INCREASE_CLEAR_FUND_ID)
    {
        _clearFundProposalIds.increment();
    }

    function increaseGovernorVotingAssetAllocationId()
        external
        hasAccess(this, AclFlag.INCREASE_Gov_Vot_ASSET_ALLOC_ID)
    {
        _governorVotingAssetAllocationProposalIds.increment();
    }

    function increaseVinGovernorVotingAssetAllocationId()
        external
        hasAccess(this, AclFlag.INCREASE_Gov_Vot_ASSET_ALLOC_ID)
    {
        _vinGovernorVotingAssetAllocationProposalIds.increment();
    }

    function increaseRiceReceiverId()
        external
        hasAccess(this, AclFlag.INCREASE_SET_RICE_RECEIVER_ID)
    {
        _riceReceiverProposalIds.increment();
    }

    /**
     * @notice Looks up if there is an extension of a given address
     * @return Whether or not the address is an extension
     * @param extensionAddr The address to look up
     */
    function isExtension(address extensionAddr) public view returns (bool) {
        return inverseExtensions[extensionAddr].id != bytes32(0);
    }

    /**
     * @notice Looks up if there is an adapter of a given address
     * @return Whether or not the address is an adapter
     * @param adapterAddress The address to look up
     */
    function isAdapter(address adapterAddress) public view returns (bool) {
        return inverseAdapters[adapterAddress].id != bytes32(0);
    }

    /**
     * @notice Checks if an adapter has a given ACL flag
     * @return Whether or not the given adapter has the given flag set
     * @param adapterAddress The address to look up
     * @param flag The ACL flag to check against the given address
     */
    function hasAdapterAccess(
        address adapterAddress,
        AclFlag flag
    ) external view returns (bool) {
        return
            DaoHelper.getFlag(inverseAdapters[adapterAddress].acl, uint8(flag));
    }

    /**
     * @notice Checks if an adapter has a given ACL flag
     * @return Whether or not the given adapter has the given flag set
     * @param adapterAddress The address to look up
     * @param flag The ACL flag to check against the given address
     */
    function hasAdapterAccessToExtension(
        address adapterAddress,
        address extensionAddress,
        uint8 flag
    ) external view returns (bool) {
        return
            isAdapter(adapterAddress) &&
            DaoHelper.getFlag(
                inverseExtensions[extensionAddress].acl[adapterAddress],
                uint8(flag)
            );
    }

    /**
     * @return The address of a given adapter ID
     * @param adapterId The ID to look up
     */
    function getAdapterAddress(
        bytes32 adapterId
    ) external view returns (address) {
        require(adapters[adapterId] != address(0), "adapter not found");
        return adapters[adapterId];
    }

    /**
     * @return The address of a given extension Id
     * @param extensionId The ID to look up
     */
    function getExtensionAddress(
        bytes32 extensionId
    ) external view returns (address) {
        require(extensions[extensionId] != address(0), "extension not found");
        return extensions[extensionId];
    }

    /**
     * PROPOSALS
     */
    /**
     * @notice Submit proposals to the DAO registry
     */
    function submitProposal(
        bytes32 proposalId
    ) external hasAccess(this, AclFlag.SUBMIT_PROPOSAL) {
        require(proposalId != bytes32(0), "invalid proposalId");
        require(
            !getProposalFlag(proposalId, ProposalFlag.EXISTS),
            "proposalId must be unique"
        );
        proposals[proposalId] = Proposal(msg.sender, 1); // 1 means that only the first flag is being set i.e. EXISTS
        emit SubmittedProposal(proposalId, 1);
    }

    /**
     * @notice Sponsor proposals that were submitted to the DAO registry
     * @dev adds SPONSORED to the proposal flag
     * @param proposalId The ID of the proposal to sponsor
     */
    function sponsorProposal(
        bytes32 proposalId,
        address votingAdapterAddr
    ) external {
        // also checks if the flag was already set
        Proposal storage proposal = _setProposalFlag(
            proposalId,
            ProposalFlag.SPONSORED
        );

        uint256 flags = proposal.flags;

        require(
            proposal.adapterAddress == msg.sender,
            "only the adapter that submitted the proposal can process it"
        );

        require(
            !DaoHelper.getFlag(flags, uint8(ProposalFlag.PROCESSED)),
            "proposal already processed"
        );
        votingAdapter[proposalId] = votingAdapterAddr;
        emit SponsoredProposal(proposalId, flags, votingAdapterAddr);
    }

    /**
     * @notice Mark a proposal as processed in the DAO registry
     * @param proposalId The ID of the proposal that is being processed
     */
    function processProposal(bytes32 proposalId) external {
        Proposal storage proposal = _setProposalFlag(
            proposalId,
            ProposalFlag.PROCESSED
        );

        require(proposal.adapterAddress == msg.sender, "err::adapter mismatch");
        uint256 flags = proposal.flags;

        emit ProcessedProposal(proposalId, flags);
    }

    /**
     * @notice Sets a flag of a proposal
     * @dev Reverts if the proposal is already processed
     * @param proposalId The ID of the proposal to be changed
     * @param flag The flag that will be set on the proposal
     */
    function _setProposalFlag(
        bytes32 proposalId,
        ProposalFlag flag
    ) internal returns (Proposal storage) {
        Proposal storage proposal = proposals[proposalId];

        uint256 flags = proposal.flags;
        require(
            DaoHelper.getFlag(flags, uint8(ProposalFlag.EXISTS)),
            "proposal does not exist for this dao"
        );

        require(
            proposal.adapterAddress == msg.sender,
            "only the adapter that submitted the proposal can set its flag"
        );

        require(!DaoHelper.getFlag(flags, uint8(flag)), "flag already set");

        flags = DaoHelper.setFlag(flags, uint8(flag), true);
        proposals[proposalId].flags = flags;

        return proposals[proposalId];
    }

    /*
     * MEMBERS
     */

    /**
     * @return Whether or not a given address is a member of the DAO.
     * @dev it will resolve by delegate key, not member address.
     * @param addr The address to look up
     */
    function isMember(address addr) external view returns (bool) {
        address memberAddress = memberAddressesByDelegatedKey[addr];
        return getMemberFlag(memberAddress, MemberFlag.EXISTS);
    }

    /**
     * @return Whether or not a flag is set for a given proposal
     * @param proposalId The proposal to check against flag
     * @param flag The flag to check in the proposal
     */
    function getProposalFlag(
        bytes32 proposalId,
        ProposalFlag flag
    ) public view returns (bool) {
        return DaoHelper.getFlag(proposals[proposalId].flags, uint8(flag));
    }

    /**
     * @return Whether or not a flag is set for a given member
     * @param memberAddress The member to check against flag
     * @param flag The flag to check in the member
     */
    function getMemberFlag(
        address memberAddress,
        MemberFlag flag
    ) public view returns (bool) {
        return DaoHelper.getFlag(members[memberAddress].flags, uint8(flag));
    }

    function getNbMembers() external view returns (uint256) {
        return _members.length;
    }

    function getMemberAddress(uint256 index) external view returns (address) {
        return _members[index];
    }

    /**
     * @notice Updates the delegate key of a member
     * @param memberAddr The member doing the delegation
     * @param newDelegateKey The member who is being delegated to
     */
    function updateDelegateKey(
        address memberAddr,
        address newDelegateKey
    ) external hasAccess(this, AclFlag.UPDATE_DELEGATE_KEY) {
        require(newDelegateKey != address(0x0), "newDelegateKey cannot be 0");

        // skip checks if member is setting the delegate key to their member address
        if (newDelegateKey != memberAddr) {
            require(
                // newDelegate must not be delegated to
                memberAddressesByDelegatedKey[newDelegateKey] == address(0x0),
                "cannot overwrite existing delegated keys"
            );
        } else {
            require(
                memberAddressesByDelegatedKey[memberAddr] == address(0x0),
                "address already taken as delegated key"
            );
        }

        Member storage member = members[memberAddr];
        require(
            DaoHelper.getFlag(member.flags, uint8(MemberFlag.EXISTS)),
            "member does not exist"
        );

        // Reset the delegation of the previous delegate
        memberAddressesByDelegatedKey[
            getCurrentDelegateKey(memberAddr)
        ] = address(0x0);

        memberAddressesByDelegatedKey[newDelegateKey] = memberAddr;

        _createNewDelegateCheckpoint(memberAddr, newDelegateKey);
        emit UpdateDelegateKey(memberAddr, newDelegateKey);
    }

    /**
     * Public read-only functions
     */

    /**
     * @param checkAddr The address to check for a delegate
     * @return the delegated address or the checked address if it is not a delegate
     */
    function getAddressIfDelegated(
        address checkAddr
    ) external view returns (address) {
        address delegatedKey = memberAddressesByDelegatedKey[checkAddr];
        return delegatedKey == address(0x0) ? checkAddr : delegatedKey;
    }

    /**
     * @param memberAddr The member whose delegate will be returned
     * @return the delegate key at the current time for a member
     */
    function getCurrentDelegateKey(
        address memberAddr
    ) public view returns (address) {
        uint32 nCheckpoints = numCheckpoints[memberAddr];
        return
            nCheckpoints > 0
                ? checkpoints[memberAddr][nCheckpoints - 1].delegateKey
                : memberAddr;
    }

    /**
     * @param memberAddr The member address to look up
     * @return The delegate key address for memberAddr at the second last checkpoint number
     */
    function getPreviousDelegateKey(
        address memberAddr
    ) external view returns (address) {
        uint32 nCheckpoints = numCheckpoints[memberAddr];
        return
            nCheckpoints > 1
                ? checkpoints[memberAddr][nCheckpoints - 2].delegateKey
                : memberAddr;
    }

    /**
     * @notice Determine the prior number of votes for an account as of a block number
     * @dev Block number must be a finalized block or else this function will revert to prevent misinformation.
     * @param memberAddr The address of the account to check
     * @param blockNumber The block number to get the vote balance at
     * @return The number of votes the account had as of the given block
     */
    function getPriorDelegateKey(
        address memberAddr,
        uint256 blockNumber
    ) external view returns (address) {
        require(
            blockNumber < block.number,
            "Uni::getPriorDelegateKey: not yet determined"
        );

        uint32 nCheckpoints = numCheckpoints[memberAddr];
        if (nCheckpoints == 0) {
            return memberAddr;
        }

        // First check most recent balance
        if (
            checkpoints[memberAddr][nCheckpoints - 1].fromBlock <= blockNumber
        ) {
            return checkpoints[memberAddr][nCheckpoints - 1].delegateKey;
        }

        // Next check implicit zero balance
        if (checkpoints[memberAddr][0].fromBlock > blockNumber) {
            return memberAddr;
        }

        uint32 lower = 0;
        uint32 upper = nCheckpoints - 1;
        while (upper > lower) {
            uint32 center = upper - (upper - lower) / 2; // ceil, avoiding overflow
            DelegateCheckpoint memory cp = checkpoints[memberAddr][center];
            if (cp.fromBlock == blockNumber) {
                return cp.delegateKey;
            } else if (cp.fromBlock < blockNumber) {
                lower = center;
            } else {
                upper = center - 1;
            }
        }
        return checkpoints[memberAddr][lower].delegateKey;
    }

    function getAllSteward() external view returns (address[] memory) {
        return stewards.values();
    }

    function getCurrentInvestmentProposalId() external view returns (uint256) {
        return _fundingProposalIds.current();
    }

    function getCurrentGovenorInProposalId() external view returns (uint256) {
        return _govenorInIds.current();
    }

    function getCurrentGovenorOutProposalId() external view returns (uint256) {
        return _govenorOutIds.current();
    }

    function getCurrentFundEstablishmentProposalId()
        external
        view
        returns (uint256)
    {
        return _newFundProposalIds.current();
    }

    function getCurrentInvestorCapProposalId() external view returns (uint256) {
        return _InvestorCapProposalIds.current();
    }

    function getCurrentGovernorMembershipProposalId()
        external
        view
        returns (uint256)
    {
        return _governorMembershipProposalIds.current();
    }

    function getCurrentInvestorMembershipProposalId()
        external
        view
        returns (uint256)
    {
        return _investorMembershipProposalIds.current();
    }

    function getCurrentVotingProposalId() external view returns (uint256) {
        return _votingProposalIds.current();
    }

    function getCurrentFeeProposalId() external view returns (uint256) {
        return _feesProposalIds.current();
    }

    function getCurrentPollForInvestorProposalId()
        external
        view
        returns (uint256)
    {
        return _pollForInvestmentProposalIds.current();
    }

    function getCurrentProposerMembershipProposalId()
        external
        view
        returns (uint256)
    {
        return _proposerMembershipPropossalIds.current();
    }

    function getCurrentProposerRewardProposalId()
        external
        view
        returns (uint256)
    {
        return _proposerRewardPropossalIds.current();
    }

    function getCurrentExpenseProposalId() external view returns (uint256) {
        return _expenseProposalIds.current();
    }

    function getCurrentTopupProposalId() external view returns (uint256) {
        return _topupProposalIds.current();
    }

    function getCurrentCleaerFundProposalId() external view returns (uint256) {
        return _clearFundProposalIds.current();
    }

    function getCurrentGovernorVotingAssetAllocationId()
        external
        view
        returns (uint256)
    {
        return _governorVotingAssetAllocationProposalIds.current();
    }

    function getCurrentVinGovernorVotingAssetAllocationId()
        external
        view
        returns (uint256)
    {
        return _vinGovernorVotingAssetAllocationProposalIds.current();
    }

    function getCurrentRiceReceiverId() external view returns (uint256) {
        return _riceReceiverProposalIds.current();
    }

    /**
     * @notice Creates a new delegate checkpoint of a certain member
     * @param member The member whose delegate checkpoints will be added to
     * @param newDelegateKey The delegate key that will be written into the new checkpoint
     */
    function _createNewDelegateCheckpoint(
        address member,
        address newDelegateKey
    ) internal {
        uint32 nCheckpoints = numCheckpoints[member];
        // The only condition that we should allow the deletegaKey upgrade
        // is when the block.number exactly matches the fromBlock value.
        // Anything different from that should generate a new checkpoint.
        if (
            //slither-disable-next-line incorrect-equality
            nCheckpoints > 0 &&
            checkpoints[member][nCheckpoints - 1].fromBlock == block.number
        ) {
            checkpoints[member][nCheckpoints - 1].delegateKey = newDelegateKey;
        } else {
            checkpoints[member][nCheckpoints] = DelegateCheckpoint(
                uint96(block.number),
                newDelegateKey
            );
            numCheckpoints[member] = nCheckpoints + 1;
        }
    }
}
