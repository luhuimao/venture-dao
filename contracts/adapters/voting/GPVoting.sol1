pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "../../guards/RaiserGuard.sol";
import "../../guards/AdapterGuard.sol";
import "../interfaces/IGPVoting.sol";
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
    RaiserGuard,
    AdapterGuard,
    Reimbursable
{
    struct GPVoting {
        uint128 nbYes;
        uint128 nbNo;
        uint256 startingTime;
        uint256 blockNumber;
        uint256 voters;
        mapping(address => uint256) votes;
    }
    event ConfigureDao(uint256 votingPeriod, uint256 gracePeriod);
    event StartNewVotingForProposal(
        address daoAddr,
        bytes32 proposalId,
        uint256 votestartingTime,
        uint256 voteblockNumber
    );
    event SubmitVote(
        address daoAddr,
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
    bytes32 constant VotingPeriod = keccak256("VOTING_PERIOD");
    bytes32 constant GracePeriod = keccak256("voting.gracePeriod");
    // bytes32 constant ProposalDuration =
    //     keccak256("distributeFund.proposalDuration");

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
        // dao.setConfiguration(VotingPeriod, votingPeriod);
        // dao.setConfiguration(GracePeriod, gracePeriod);
        // emit ConfigureDao(votingPeriod, gracePeriod);
    }

    /**
     * @notice Stats a new voting proposal considering the block time and number.
     * @notice This function is called from an Adapter to compute the voting starting period for a proposal.
     * @param proposalId The proposal id that is being started.
     */
    function startNewVotingForProposal(
        DaoRegistry dao,
        bytes32 proposalId,
        uint256 projectVotingTimestamp,
        bytes calldata
    ) external override onlyAdapter(dao) {
        GPVoting storage vote = votes[address(dao)][proposalId];
        vote.startingTime = projectVotingTimestamp;
        vote.blockNumber = block.number;
        emit StartNewVotingForProposal(
            address(dao),
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
    ) external onlyRaiser(dao) reimbursable(dao) {
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
        require(
            block.timestamp > vote.startingTime && vote.startingTime > 0,
            "GPVoting::submitVote::this proposalId has not start voting"
        );
        // slither-disable-next-line timestamp
        require(
            block.timestamp <
                vote.startingTime +
                    dao.getConfiguration(DaoHelper.VOTING_PERIOD),
            "voting ended"
        );

        require(vote.votes[msg.sender] == 0, "member has already voted");
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );
        address token = fundingpool.fundRaisingTokenAddress();

        //+1 to resolve voting power = 0 when summon a dao fund raise not open balance=0
        uint128 votingWeight = GovernanceHelper.getGPVotingWeight(
            dao,
            msg.sender,
            token
        ) + 1;
        voteWeights[address(dao)][proposalId][msg.sender] = votingWeight;
        vote.votes[msg.sender] = voteValue;
        vote.voters += 1;
        if (voteValue == 1) {
            vote.nbYes = vote.nbYes + votingWeight;
        } else if (voteValue == 2) {
            vote.nbNo = vote.nbNo + votingWeight;
        }
        emit SubmitVote(
            address(dao),
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
        if (block.timestamp <= vote.startingTime) {
            return (VotingState.NOT_STARTED, vote.nbYes, vote.nbNo);
        }

        if (
            // slither-disable-next-line timestamp
            block.timestamp <
            vote.startingTime + dao.getConfiguration(VotingPeriod)
        ) {
            return (VotingState.IN_PROGRESS, vote.nbYes, vote.nbNo);
        }

        DaoHelper.VoteType voteType = DaoHelper.VoteType(
            dao.getProposalVoteType(DaoHelper.ProposalType.FUNDING)
        );

        uint128 allGPsWeight = getAllGPWeight(dao);
        // rule out any failed quorums
        if (
            voteType == DaoHelper.VoteType.SIMPLE_MAJORITY_QUORUM_REQUIRED ||
            voteType == DaoHelper.VoteType.SUPERMAJORITY_QUORUM_REQUIRED
        ) {
            uint256 minVotes = (allGPsWeight *
                dao.getConfiguration(DaoHelper.QUORUM)) / 100;

            unchecked {
                uint256 votes = vote.nbYes + vote.nbNo;
                if (votes < minVotes)
                    return (VotingState.NOT_PASS, vote.nbYes, vote.nbNo);
            }
        }

        // simple majority check
        if (
            voteType == DaoHelper.VoteType.SIMPLE_MAJORITY ||
            voteType == DaoHelper.VoteType.SIMPLE_MAJORITY_QUORUM_REQUIRED
        ) {
            if (vote.nbYes > vote.nbNo)
                return (VotingState.PASS, vote.nbYes, vote.nbNo);
            else if (vote.nbYes < vote.nbNo) {
                return (VotingState.NOT_PASS, vote.nbYes, vote.nbNo);
            } else {
                return (VotingState.TIE, vote.nbYes, vote.nbNo);
            }
            // supermajority check
        } else {
            // example: 7 yes, 2 no, supermajority = 66
            // ((7+2) * 66) / 100 = 5.94; 7 yes will pass
            uint256 minYes = ((vote.nbYes + vote.nbNo) *
                dao.getConfiguration(DaoHelper.SUPER_MAJORITY)) / 100;
            // not one vote or voting power is zero should return tie .20220908
            if (minYes == 0 && vote.nbYes == 0) {
                return (VotingState.TIE, vote.nbYes, vote.nbNo);
            }
            if (vote.nbYes >= minYes)
                return (VotingState.PASS, vote.nbYes, vote.nbNo);
            else return (VotingState.NOT_PASS, vote.nbYes, vote.nbNo);
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

    function getAllGPWeight(DaoRegistry dao) public view returns (uint128) {
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );
        address token = fundingpool.fundRaisingTokenAddress();
        uint128 allGPsWeight = GovernanceHelper.getAllGPVotingWeight(
            dao,
            token
        );
        return allGPsWeight;
    }
}
