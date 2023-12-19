pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "./interfaces/ICollectiveFunding.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "../../guards/MemberGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./CollectiveDaoSetProposalAdapter.sol";
import "@openzeppelin/contracts/utils/structs/DoubleEndedQueue.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ColletiveFundingProposalContract is
    ICollectiveFunding,
    Reimbursable,
    MemberGuard
{
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using DoubleEndedQueue for DoubleEndedQueue.Bytes32Deque;

    mapping(DaoRegistry => mapping(bytes32 => ProposalDetails))
        public proposals;

    mapping(address => EnumerableSet.Bytes32Set) unDoneProposals;
    mapping(address => DoubleEndedQueue.Bytes32Deque) public proposalQueue;
    // Keeps track of all the locked token amount per DAO.
    mapping(address => mapping(bytes32 => mapping(address => uint256)))
        public escrowedPaybackToken;
    // Keeps track of the latest ongoing distribution proposal per DAO to ensure only 1 proposal can be processed at a time.
    mapping(address => bytes32) public ongoingProposal;

    function daosetProposalCheck(DaoRegistry dao) internal view returns (bool) {
        ColletiveDaoSetProposalContract daoset = ColletiveDaoSetProposalContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_DAO_SET_ADAPTER)
            );
        return daoset.isProposalAllDone(dao);
    }

    function submitProposal(
        ProposalParams calldata params
    ) external reimbursable(params.dao) onlyMember(params.dao) returns (bool) {
        params.dao.increaseInvestmentId();
        SubmitProposalLocalVars memory vars;
        vars.proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(params.dao)))),
                "Investment#",
                Strings.toString(params.dao.getCurrentInvestmentProposalId())
            )
        );
        // Create proposal.
        params.dao.submitProposal(vars.proposalId);

        // Saves the state of the proposal.

        proposals[params.dao][vars.proposalId] = ProposalDetails(
            FundingInfo(
                params.fundingInfo.token,
                params.fundingInfo.fundingAmount,
                params.fundingInfo.receiver
            ),
            EscrowInfo(
                params.escrowInfo.escrow,
                params.escrowInfo.paybackToken,
                params.escrowInfo.price,
                params.escrowInfo.paybackAmount,
                params.escrowInfo.approver
            ),
            VestingInfo(
                params.vestingInfo.startTime,
                params.vestingInfo.endTime,
                params.vestingInfo.cliffEndTime,
                params.vestingInfo.cliffVestingAmount,
                params.vestingInfo.vestingInterval
            )
        );

        // Sponsors the proposal.
        params.dao.sponsorProposal(
            vars.proposalId,
            params.dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );

        //Inserts proposal at the end of the queue.
        proposalQueue[address(params.dao)].pushBack(vars.proposalId);

        emit ProposalCreated(address(params.dao), vars.proposalId);
    }

    function startVotingProcess(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) onlyMember(dao) {
        //  queue is empty
        require(getQueueLength(dao) > 0, "!ProposalQueue");
        //proposalId must get from begining of the queue
        require(
            proposalId == proposalQueue[address(dao)].front(),
            "!HeadQueueProposalId"
        );
        StartVotingLocalVars memory vars;
        vars.ongongingPrposalId = ongoingProposal[address(dao)];

        ProposalDetails storage proposal = proposals[address(dao)][proposalId];
        // make sure there is no proposal no finalized
        if (vars.ongongingPrposalId != bytes32(0)) {
            require(
                proposals[address(dao)][vars.ongongingPrposalId].status ==
                    ProposalState.DONE ||
                    proposals[address(dao)][vars.ongongingPrposalId].status ==
                    ProposalState.FAILED,
                "PrePropsalNotDone"
            );
        }

        vars.investmentPoolAdapt = VintageFundingPoolAdapterContract(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER)
        );
        vars._propsalStopVotingTimestamp =
            block.timestamp +
            dao.getConfiguration(DaoHelper.VOTING_PERIOD);
        // make sure there is no proposal in progress during redempt duration
        require(
            !vars.investmentPoolAdapt.ifInRedemptionPeriod(
                dao,
                vars._propsalStopVotingTimestamp +
                    dao.getConfiguration(DaoHelper.PROPOSAL_EXECUTE_DURATION)
            ),
            "HitRedemptePeriod"
        );

        require(
            proposal.status == ProposalState.IN_QUEUE,
            "ProposalNotInQueue"
        );

        //Removes the proposalId at the beginning of the queue
        proposalQueue[address(dao)].popFront();
        vars.votingContract = IVintageVoting(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
        );
        //fund inefficient || refund period
        if (
            vars.investmentPoolAdapt.poolBalance(dao) < proposal.totalAmount ||
            (vars._propsalStopVotingTimestamp +
                dao.getConfiguration(DaoHelper.PROPOSAL_EXECUTE_DURATION) >
                dao.getConfiguration(DaoHelper.FUND_END_TIME))
        ) {
            proposal.state = ProposalState.FAILED;
        } else {
            if (proposal.proposalPaybackTokenInfo.escrow) {
                //lock project token
                vars.rel = _lockProjectTeamToken(
                    dao,
                    proposal.proposalPaybackTokenInfo.approveOwnerAddr,
                    proposal.proposalPaybackTokenInfo.paybackToken,
                    proposal.proposalPaybackTokenInfo.paybackTokenAmount,
                    proposalId
                );
                // lock project token failed
                if (!vars.rel) {
                    proposal.status = ProposalState.FAILED;
                } else {
                    projectTeamLockedTokens[address(dao)][proposalId][
                        proposal.proposalPaybackTokenInfo.approveOwnerAddr
                    ] = proposal.proposalPaybackTokenInfo.paybackTokenAmount;

                    // Starts the voting process for the proposal. setting voting start time
                    vars.votingContract.startNewVotingForProposal(
                        dao,
                        proposalId,
                        block.timestamp,
                        bytes("")
                    );

                    proposal
                        .proposalTimeInfo
                        .proposalStartVotingTimestamp = block.timestamp;
                    proposal.proposalTimeInfo.proposalStopVotingTimestamp = vars
                        ._propsalStopVotingTimestamp;

                    ongoingProposal[address(dao)] = proposalId;

                    proposal.status = ProposalState.IN_VOTING_PROGRESS;
                }
            } else {
                // Starts the voting process for the proposal. setting voting start time
                vars.votingContract.startNewVotingForProposal(
                    dao,
                    proposalId,
                    block.timestamp,
                    bytes("")
                );

                proposal.proposalTimeInfo.proposalStartVotingTimestamp = block
                    .timestamp;
                proposal.proposalTimeInfo.proposalStopVotingTimestamp = vars
                    ._propsalStopVotingTimestamp;

                ongoingProposal[address(dao)] = proposalId;

                proposal.status = InvestmentLibrary
                    .ProposalState
                    .IN_VOTING_PROGRESS;
            }
        }

        emit StartVote(address(dao), proposalId);
    }
}
