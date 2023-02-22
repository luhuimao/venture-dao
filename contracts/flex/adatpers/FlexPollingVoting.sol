pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "../../guards/MemberGuard.sol";
import "../../guards/AdapterGuard.sol";
import "./interfaces/IFlexVoting.sol";
import "../../helpers/DaoHelper.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../../helpers/GovernanceHelper.sol";
import "hardhat/console.sol";

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

contract FlexPollingVotingContract is
    IFlexVoting,
    MemberGuard,
    AdapterGuard,
    Reimbursable
{
    using EnumerableSet for EnumerableSet.AddressSet;

    struct Voting {
        uint256 nbYes;
        uint256 nbNo;
        uint256 startingTime;
        mapping(address => uint256) votes;
    }
    mapping(address => EnumerableSet.AddressSet) pollsterWhiteList;
    mapping(address => mapping(bytes32 => Voting)) public votes;

    string public constant ADAPTER_NAME = "FlexPollingVotingContract";

    function registerPollsterWhiteList(
        DaoRegistry dao,
        address account
    ) external onlyMember(dao) {
        if (!pollsterWhiteList[address(dao)].contains(account)) {
            pollsterWhiteList[address(dao)].add(account);
        }
    }

    /**
     * @notice returns the adapter name. Useful to identify wich voting adapter is actually configurated in the DAO.
     */
    function getAdapterName() external pure override returns (string memory) {
        return ADAPTER_NAME;
    }

    function isPollsterWhiteList(
        DaoRegistry dao,
        address account
    ) external view returns (bool) {
        return pollsterWhiteList[address(dao)].contains(account);
    }

    function voteResult(
        DaoRegistry dao,
        bytes32 proposalId
    ) external view override returns (VotingState state) {}

    function fundingVoteResult(
        DaoRegistry dao,
        bytes32 proposalId
    ) external view override returns (VotingState state) {}

    /**
     * @notice Stats a new voting proposal considering the block time and number.
     * @notice This function is called from an Adapter to compute the voting starting period for a proposal.
     * @param proposalId The proposal id that is being started.
     */
    function startNewVotingForProposal(
        DaoRegistry dao,
        bytes32 proposalId,
        bytes calldata
    ) external override onlyAdapter(dao) {
        Voting storage vote = votes[address(dao)][proposalId];
        vote.startingTime = block.timestamp;
    }

    function startNewVotingForNormalProposal(
        DaoRegistry dao,
        bytes32 proposalId,
        bytes calldata
    ) external override onlyAdapter(dao) {
        Voting storage vote = votes[address(dao)][proposalId];
        vote.startingTime = block.timestamp;
    }

    /**
     * @notice Returns the sender address.
     * @notice This funcion is required by the IVoting, usually offchain voting have different rules to identify the sender, but it is not the case here, so we just return the fallback argument: sender.
     * @param sender The fallback sender address that should be return in case no other is found.
     */
    function getSenderAddress(
        DaoRegistry,
        address,
        bytes memory,
        address sender
    ) external pure override returns (address) {
        return sender;
    }
}
