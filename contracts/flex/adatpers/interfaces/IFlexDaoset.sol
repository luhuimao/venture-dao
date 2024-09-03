pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "../../libraries/LibFlexDaoset.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "hardhat/console.sol";
import "./IFlexVoting.sol";
import "../../../helpers/DaoHelper.sol";
import "../FlexDaoSetHelperAdapter.sol";
import "../StewardManagement.sol";
import "../../../helpers/GovernanceHelper.sol";
import "../../../adapters/modifiers/Reimbursable.sol";

interface IFlexDaoset {
    event ProposalCreated(
        address daoAddr,
        bytes32 proposalId,
        FlexDaosetLibrary.ProposalType pType
    );
    event ProposalProcessed(
        address daoAddr,
        bytes32 proposalId,
        uint256 voteResult,
        uint128 allVotingWeight,
        uint256 nbYes,
        uint256 nbNo
    );
}
