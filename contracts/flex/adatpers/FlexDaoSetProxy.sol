pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/proxy/Proxy.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../libraries/LibFlexDaoset.sol";
import "hardhat/console.sol";

contract FlexDaoSetProxyContract is Proxy {
    using EnumerableSet for EnumerableSet.AddressSet;
    // using EnumerableSet for EnumerableSet.UintSet;

    mapping(address => bytes32) public ongoingInvestorCapProposal;
    mapping(address => bytes32) public ongoingGovernorMembershipProposal;
    mapping(address => bytes32) public ongoingInvstorMembershipProposal;
    mapping(address => bytes32) public ongoingFeesProposal;
    mapping(address => bytes32) public ongoingProposerMembershipProposal;

    mapping(address => mapping(bytes32 => FlexDaosetLibrary.InvestorCapProposalDetails))
        public investorCapProposals;

    mapping(address => mapping(bytes32 => FlexDaosetLibrary.GovernorMembershipProposalDetails))
        public governorMembershipProposals;

    mapping(address => mapping(bytes32 => FlexDaosetLibrary.InvestorMembershipProposalDetails))
        public investorMembershipProposals;

    mapping(address => mapping(bytes32 => FlexDaosetLibrary.FeeProposalDetails))
        public feesProposals;
    mapping(address => mapping(bytes32 => FlexDaosetLibrary.ProposerMembershipProposalDetails))
        public proposerMembershipProposals;

    mapping(bytes32 => EnumerableSet.AddressSet) governorMembershipWhitelists;
    mapping(bytes32 => EnumerableSet.AddressSet) investorMembershipWhiteLists;
    mapping(bytes32 => EnumerableSet.AddressSet) proposerMembershipWhiteLists;
    mapping(bytes32 => EnumerableSet.AddressSet) pollvoterMembershipWhiteLists;

    address public daosetImplContrAddr;

    event ProposalCreated(bytes proposalId);

    constructor(address _daosetImplContrAddr) {
        daosetImplContrAddr = _daosetImplContrAddr;
    }

    function _implementation() internal view override returns (address) {
        return daosetImplContrAddr;
    }

    // function _delegate(address impl) internal virtual {
    //     assembly {
    //         let ptr := mload(0x40)
    //         calldatacopy(ptr, 0, calldatasize())
    //         let result := delegatecall(gas(), impl, ptr, calldatasize(), 0, 0)
    //         let size := returndatasize()
    //         returndatacopy(ptr, 0, size)
    //         switch result
    //         case 0 {
    //             revert(ptr, size)
    //         }
    //         default {
    //             return(ptr, size)
    //         }
    //     }
    // }

    // fallback() external payable {
    //     _delegate(_implementation());
    // }

    function submitInvestorCapProposal(
        DaoRegistry dao,
        bool enable,
        uint256 cap
    ) external {
        // A's storage is set, B is not modified.
        // (bool success, bytes memory data) = _implementation().delegatecall(
        //     abi.encodeWithSignature(
        //         "submitInvestorCapProposal(DaoRegistry,bool,uint256)",
        //         dao,
        //         enable,
        //         cap
        //     )
        // );
        // console.log(success);
        // emit ProposalCreated(data);
    }
}
