pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "./interfaces/ICollectiveFunding.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "../../guards/MemberGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./CollectiveDaoSetProposalAdapter.sol";
import "@openzeppelin/contracts/utils/structs/DoubleEndedQueue.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./CollectivePaybackTokenAdapter.sol";

contract ColletiveFundingProposalContract is
    ICollectiveFunding,
    Reimbursable,
    MemberGuard
{
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using DoubleEndedQueue for DoubleEndedQueue.Bytes32Deque;

    mapping(address => mapping(bytes32 => ProposalDetails)) public proposals;

    mapping(address => EnumerableSet.Bytes32Set) unDoneProposals;
    mapping(address => DoubleEndedQueue.Bytes32Deque) public proposalQueue;
    // Keeps track of all the locked token amount per DAO.
    mapping(address => mapping(bytes32 => mapping(address => uint256)))
        public escrowedPaybackToken;
    // Keeps track of the latest ongoing distribution proposal per DAO to ensure only 1 proposal can be processed at a time.
    mapping(address => bytes32) public ongoingProposal;
    mapping(address => mapping(bytes32 => mapping(address => uint256)))
        public escrowPaybackTokens;

    address public protocolAddress =
        address(0x9ac9c636404C8d46D9eb966d7179983Ba5a3941A);

    modifier onlyDaoFactoryOwner(DaoRegistry dao) {
        require(msg.sender == DaoHelper.daoFactoryAddress(dao));
        _;
    }

    function setProtocolAddress(
        DaoRegistry dao,
        address _protocolAddress
    ) external reimbursable(dao) onlyDaoFactoryOwner(dao) {
        protocolAddress = _protocolAddress;
    }

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

        proposals[address(params.dao)][vars.proposalId] = ProposalDetails(
            FundingInfo(
                params.fundingInfo.token,
                params.fundingInfo.fundingAmount,
                0,
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
            ),
            TimeInfo(0, 0),
            msg.sender,
            ProposalState.IN_QUEUE
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
                proposals[address(dao)][vars.ongongingPrposalId].state ==
                    ProposalState.DONE ||
                    proposals[address(dao)][vars.ongongingPrposalId].state ==
                    ProposalState.FAILED,
                "PrePropsalNotDone"
            );
        }

        vars.investmentPoolAdapt = ColletiveFundingPoolContract(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER)
        );
        vars._propsalStopVotingTimestamp =
            block.timestamp +
            dao.getConfiguration(DaoHelper.VOTING_PERIOD);
        // make sure there is no proposal in progress during redempt duration
        // require(
        //     !vars.investmentPoolAdapt.ifInRedemptionPeriod(
        //         dao,
        //         vars._propsalStopVotingTimestamp +
        //             dao.getConfiguration(DaoHelper.PROPOSAL_EXECUTE_DURATION)
        //     ),
        //     "HitRedemptePeriod"
        // );

        require(proposal.state == ProposalState.IN_QUEUE, "ProposalNotInQueue");

        //Removes the proposalId at the beginning of the queue
        proposalQueue[address(dao)].popFront();
        vars.votingContract = ICollectiveVoting(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
        );
        //fund inefficient || refund period
        if (
            vars.investmentPoolAdapt.poolBalance(dao) <
            proposal.fundingInfo.totalAmount ||
            (vars._propsalStopVotingTimestamp +
                dao.getConfiguration(DaoHelper.PROPOSAL_EXECUTE_DURATION) >
                dao.getConfiguration(DaoHelper.FUND_END_TIME))
        ) {
            proposal.state = ProposalState.FAILED;
        } else {
            if (proposal.escrowInfo.escrow) {
                vars.escorwPaybackTokenSucceed = escrowPaybackToken(
                    dao,
                    proposal.escrowInfo.approver,
                    proposal.escrowInfo.paybackToken,
                    proposal.escrowInfo.paybackAmount,
                    proposalId
                );
                // lock project token failed
                if (!vars.escorwPaybackTokenSucceed) {
                    proposal.state = ProposalState.FAILED;
                } else {
                    escrowPaybackTokens[address(dao)][proposalId][
                        proposal.escrowInfo.approver
                    ] = proposal.escrowInfo.paybackAmount;

                    // Starts the voting process for the proposal. setting voting start time
                    vars.votingContract.startNewVotingForProposal(
                        dao,
                        proposalId,
                        bytes("")
                    );

                    proposal.timeInfo.startVotingTime = block.timestamp;
                    proposal.timeInfo.stopVotingTime = vars
                        ._propsalStopVotingTimestamp;

                    ongoingProposal[address(dao)] = proposalId;

                    proposal.state = ProposalState.IN_VOTING_PROGRESS;
                }
            } else {
                // Starts the voting process for the proposal. setting voting start time
                vars.votingContract.startNewVotingForProposal(
                    dao,
                    proposalId,
                    bytes("")
                );

                proposal.timeInfo.startVotingTime = block.timestamp;
                proposal.timeInfo.stopVotingTime = vars
                    ._propsalStopVotingTimestamp;

                ongoingProposal[address(dao)] = proposalId;

                proposal.state = ProposalState.IN_VOTING_PROGRESS;
            }
        }

        emit StartVoting(address(dao), proposalId);
    }

    function escrowPaybackToken(
        DaoRegistry dao,
        address approver,
        address paybackToken,
        uint256 paybackTokenAmount,
        bytes32 proposalId
    ) internal returns (bool) {
        CollectivePaybackTokenAdapterContract paybackTokenAdapt = CollectivePaybackTokenAdapterContract(
                dao.getAdapterAddress(
                    DaoHelper.COLLECTIVE_PAYBACK_TOKEN_ADAPTER
                )
            );
        return
            paybackTokenAdapt.escrowPaybackToken(
                paybackTokenAmount,
                dao,
                approver,
                paybackToken,
                proposalId
            );
    }

    function withdrawPaybakcToken(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        ProposalDetails storage proposal = proposals[address(dao)][proposalId];

        CollectivePaybackTokenAdapterContract paybackTokenAdapt = CollectivePaybackTokenAdapterContract(
                dao.getAdapterAddress(
                    DaoHelper.COLLECTIVE_PAYBACK_TOKEN_ADAPTER
                )
            );
        paybackTokenAdapt.withdrawPaybackToken(
            dao,
            proposalId,
            proposal.escrowInfo.paybackToken,
            msg.sender,
            proposal.state
        );
    }

    function snapShotVestingInfo(DaoRegistry dao, bytes32 proposalId) internal {
        VintageAllocationAdapterContract allocAda = VintageAllocationAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_ALLOCATION_ADAPTER)
            );
        ProposalDetails storage proposal = proposals[address(dao)][proposalId];
        uint256[6] memory uint256Args = [
            proposal.escrowInfo.paybackAmount,
            proposal.vestingInfo.startTime,
            proposal.vestingInfo.endTime,
            proposal.vestingInfo.cliffEndTime,
            proposal.vestingInfo.cliffVestingAmount,
            proposal.vestingInfo.vestingInterval
        ];
        allocAda.allocateProjectToken(
            dao,
            proposal.escrowInfo.paybackToken,
            proposal.proposer,
            proposalId,
            uint256Args
        );
    }

    function getQueueLength(DaoRegistry dao) public view returns (uint256) {
        if (!proposalQueue[address(dao)].empty())
            return proposalQueue[address(dao)].length();
        else return 0;
    }
}
