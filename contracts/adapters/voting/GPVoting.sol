pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "../../extensions/bank/Bank.sol";
import "../../guards/MemberGuard.sol";
import "../../guards/AdapterGuard.sol";
import "../interfaces/IGPVoting.sol";
import "../../helpers/DaoHelper.sol";
import "../modifiers/Reimbursable.sol";
import "../../helpers/GovernanceHelper.sol";
import "../../extensions/fundingpool/FundingPool.sol";
import "../../helpers/DaoHelper.sol";
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

contract GPVotingContract is
    IGPVoting,
    MemberGuard,
    AdapterGuard,
    Reimbursable
{
    struct GPVoting {
        uint128 nbYes;
        uint128 nbNo;
        uint256 startingTime;
        uint256 blockNumber;
        mapping(address => uint256) votes;
    }
    event ConfigureDao(uint256 votingPeriod, uint256 gracePeriod);
    event StartNewVotingForProposal(
        bytes32 proposalId,
        uint256 votestartingTime,
        uint256 voteblockNumber
    );
    event SubmitVote(
        bytes32 proposalId,
        uint256 blocktime,
        address voter,
        uint256 voteValue,
        uint128 votingWeight,
        uint128 nbYes,
        uint128 nbNo
    );
    event UpdateVoteWeight(
        bytes32 proposalId,
        uint256 blocktime,
        address voter,
        uint128 oldVotingWeight,
        uint128 newVotingWeight,
        uint128 nbYes,
        uint128 nbNo
    );
    event RevokeVote(
        bytes32 proposalId,
        uint256 blocktime,
        address voter,
        uint128 origenalVotingWeight,
        uint256 origenalVoteValue
    );
    bytes32 constant VotingPeriod = keccak256("voting.votingPeriod");
    bytes32 constant GracePeriod = keccak256("voting.gracePeriod");

    mapping(address => mapping(bytes32 => mapping(address => uint128)))
        public voteWeights;
    mapping(address => mapping(bytes32 => GPVoting)) public votes;

    string public constant ADAPTER_NAME = "GPVotingContract";

    /**
     * @notice returns the adapter name. Useful to identify wich voting adapter is actually configurated in the DAO.
     */
    function getAdapterName() external pure override returns (string memory) {
        return ADAPTER_NAME;
    }

    /**
     * @notice Configures the DAO with the Voting and Gracing periods.
     * @param votingPeriod The voting period in seconds.
     * @param gracePeriod The grace period in seconds.
     */
    function configureDao(
        DaoRegistry dao,
        uint256 votingPeriod,
        uint256 gracePeriod
    ) external onlyAdapter(dao) {
        dao.setConfiguration(VotingPeriod, votingPeriod);
        dao.setConfiguration(GracePeriod, gracePeriod);
        emit ConfigureDao(votingPeriod, gracePeriod);
    }

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
        GPVoting storage vote = votes[address(dao)][proposalId];
        vote.startingTime = block.timestamp;
        vote.blockNumber = block.number;
        emit StartNewVotingForProposal(
            proposalId,
            block.timestamp,
            block.number
        );
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

    /**
     * @notice Submits a vote to the DAO Registry.
     * @notice Vote has to be submitted after the starting time defined in startNewVotingForProposal.
     * @notice The vote needs to be submitted within the voting period.
     * @notice A member can not vote twice or more.
     * @param dao The DAO address.
     * @param proposalId The proposal needs to be sponsored, and not processed.
     * @param voteValue Only Yes (1) and No (2) votes are allowed.
     */
    // The function is protected against reentrancy with the reimbursable modifier
    //slither-disable-next-line reentrancy-no-eth,reentrancy-benign
    function submitVote(
        DaoRegistry dao,
        bytes32 proposalId,
        uint256 voteValue
    ) external onlyGeneralPartner(dao) reimbursable(dao) {
        require(
            dao.getProposalFlag(proposalId, DaoRegistry.ProposalFlag.SPONSORED),
            "the proposal has not been sponsored yet"
        );

        require(
            !dao.getProposalFlag(
                proposalId,
                DaoRegistry.ProposalFlag.PROCESSED
            ),
            "the proposal has already been processed"
        );

        require(
            voteValue < 3 && voteValue > 0,
            "only yes (1) and no (2) are possible values"
        );

        GPVoting storage vote = votes[address(dao)][proposalId];
        // slither-disable-next-line timestamp
        require(
            vote.startingTime > 0,
            "this proposalId has no vote going on at the moment"
        );
        // slither-disable-next-line timestamp
        require(
            block.timestamp <
                vote.startingTime + dao.getConfiguration(VotingPeriod),
            "vote has already ended"
        );

        // address GPAddr = dao.getAddressIfDelegated(msg.sender);

        require(vote.votes[msg.sender] == 0, "member has already voted");
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );
        address token = fundingpool.getToken(0);

        uint128 votingWeight = GovernanceHelper.getGPVotingWeight(
            dao,
            msg.sender,
            token
        );
        // if (votingWeight == 0) revert("vote not allowed");

        voteWeights[address(dao)][proposalId][msg.sender] = votingWeight;
        vote.votes[msg.sender] = voteValue;

        if (voteValue == 1) {
            vote.nbYes = vote.nbYes + votingWeight;
            // vote.nbYes += 1;
        } else if (voteValue == 2) {
            vote.nbNo = vote.nbNo + votingWeight;
            // vote.nbNo += 1;
        }
        emit SubmitVote(
            proposalId,
            block.timestamp,
            msg.sender,
            voteValue,
            votingWeight,
            vote.nbYes,
            vote.nbNo
        );
    }

    /**
     * @notice Update voter's voting weight when he's balance changing.
     * @notice Vote has to be submitted after the starting time defined in startNewVotingForProposal.
     * @notice The vote needs to be submitted within the voting period.
     * @notice A member can not vote twice or more.
     * @param dao The DAO address.
     * @param proposalId The proposal needs to be sponsored, and not processed.
     * @param voter The voter address whose voting weight being update.
     */
    // The function is protected against reentrancy with the reimbursable modifier
    //slither-disable-next-line reentrancy-no-eth,reentrancy-benign
    function updateVoteWeight(
        DaoRegistry dao,
        bytes32 proposalId,
        address voter
    ) external {
        require(
            msg.sender == dao.getAdapterAddress(DaoHelper.FUNDING_POOL_ADAPT),
            "GPVoting::updateVoteWeight::only call from FUNDING_POOL_ADAPT"
        );
        require(
            dao.getProposalFlag(proposalId, DaoRegistry.ProposalFlag.SPONSORED),
            "GPVoting::updateVoteWeight::the proposal has not been sponsored yet"
        );

        require(
            !dao.getProposalFlag(
                proposalId,
                DaoRegistry.ProposalFlag.PROCESSED
            ),
            "GPVoting::updateVoteWeight::the proposal has already been processed"
        );
        GPVoting storage vote = votes[address(dao)][proposalId];
        // slither-disable-next-line timestamp
        require(
            vote.startingTime > 0,
            "this proposalId has no vote going on at the moment"
        );
        // slither-disable-next-line timestamp
        require(
            block.timestamp <
                vote.startingTime + dao.getConfiguration(VotingPeriod),
            "GPVoting::updateVoteWeight::vote has already ended"
        );

        // address GPAddr = dao.getAddressIfDelegated(voter);
        require(
            vote.votes[voter] != 0,
            "GPVoting::updateVoteWeight::voter has not voted"
        );
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );
        address token = fundingpool.getToken(0);
        uint128 newVotingWeight = GovernanceHelper.getGPVotingWeight(
            dao,
            voter,
            token
        );
        //old voting weight
        uint128 oldVotingWeight = voteWeights[address(dao)][proposalId][voter];
        //record new voting weight
        voteWeights[address(dao)][proposalId][voter] = newVotingWeight;

        uint256 voteValue = vote.votes[voter];
        if (voteValue == 1) {
            vote.nbYes -= oldVotingWeight;
            vote.nbYes += newVotingWeight;
        } else if (voteValue == 2) {
            vote.nbNo -= oldVotingWeight;
            vote.nbNo += newVotingWeight;
        }

        emit UpdateVoteWeight(
            proposalId,
            block.timestamp,
            voter,
            oldVotingWeight,
            newVotingWeight,
            vote.nbYes,
            vote.nbNo
        );
    }

    /**
     * @notice Revoke a vote.
     * @notice Vote has to be submitted after the starting time defined in startNewVotingForProposal.
     * @notice The vote needs to be submitted within the voting period.
     * @notice A member can not vote twice or more.
     * @param dao The DAO address.
     * @param proposalId The proposal needs to be sponsored, and not processed.
     */
    // The function is protected against reentrancy with the reimbursable modifier
    //slither-disable-next-line reentrancy-no-eth,reentrancy-benign
    function revokeVote(DaoRegistry dao, bytes32 proposalId)
        external
        onlyGeneralPartner(dao)
        reimbursable(dao)
    {
        require(
            dao.getProposalFlag(proposalId, DaoRegistry.ProposalFlag.SPONSORED),
            "GPVoting::revokeVote::the proposal has not been sponsored yet"
        );

        GPVoting storage vote = votes[address(dao)][proposalId];

        // slither-disable-next-line timestamp
        require(
            block.timestamp <
                vote.startingTime + dao.getConfiguration(VotingPeriod),
            "GPVoting::revokeVote::vote has already ended"
        );

        // address GPAddr = dao.getAddressIfDelegated(msg.sender);

        require(
            vote.votes[msg.sender] != 0,
            "GPVoting::revokeVote::member has not voted"
        );
        uint128 votingWeight = voteWeights[address(dao)][proposalId][
            msg.sender
        ];
        if (votingWeight == 0)
            revert("GPVoting::revokeVote::voting weight is 0");

        uint256 voteValue = vote.votes[msg.sender];

        //substract voting weight according to vote value
        if (voteValue == 1) {
            vote.nbYes -= votingWeight;
        } else if (voteValue == 2) {
            vote.nbNo -= votingWeight;
        }
        //reset vote value to 0;
        vote.votes[msg.sender] = 0;

        emit RevokeVote(
            proposalId,
            block.timestamp,
            msg.sender,
            votingWeight,
            voteValue
        );
    }

    /**
     * @notice Computes the voting result based on a proposal.
     * @param dao The DAO address.
     * @param proposalId The proposal that needs to have the votes computed.
     * @return state
     * The possible results are:
     * 0: has not started
     * 1: tie
     * 2: pass
     * 3: not pass
     * 4: in progress
     */
    function voteResult(DaoRegistry dao, bytes32 proposalId)
        external
        view
        override
        returns (
            VotingState state,
            uint128 nbYes,
            uint128 nbNo
        )
    {
        GPVoting storage vote = votes[address(dao)][proposalId];
        if (vote.startingTime == 0) {
            return (VotingState.NOT_STARTED, vote.nbYes, vote.nbNo);
        }

        if (
            // slither-disable-next-line timestamp
            block.timestamp <
            vote.startingTime + dao.getConfiguration(VotingPeriod)
        ) {
            return (VotingState.IN_PROGRESS, vote.nbYes, vote.nbNo);
        }

        if (
            // slither-disable-next-line timestamp
            block.timestamp <
            vote.startingTime +
                dao.getConfiguration(VotingPeriod) +
                dao.getConfiguration(GracePeriod)
        ) {
            return (VotingState.GRACE_PERIOD, vote.nbYes, vote.nbNo);
        }

        if (vote.nbYes > vote.nbNo) {
            return (VotingState.PASS, vote.nbYes, vote.nbNo);
        } else if (vote.nbYes < vote.nbNo) {
            return (VotingState.NOT_PASS, vote.nbYes, vote.nbNo);
        } else {
            return (VotingState.TIE, vote.nbYes, vote.nbNo);
        }
    }

    function checkIfVoted(
        DaoRegistry dao,
        bytes32 proposalId,
        address voterAddr
    ) external view returns (bool) {
        GPVoting storage vote = votes[address(dao)][proposalId];
        if (vote.votes[voterAddr] == 0) {
            return false;
        } else {
            return true;
        }
    }
}
