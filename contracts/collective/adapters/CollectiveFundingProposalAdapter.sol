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
import "./CollectiveDistributeAdapter.sol";
import "./CollectiveAllocationAdapter.sol";
import "./CollectiveExpenseProposalAdapter.sol";

contract ColletiveFundingProposalAdapterContract is
    ICollectiveFunding,
    Reimbursable,
    MemberGuard
{
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using DoubleEndedQueue for DoubleEndedQueue.Bytes32Deque;

    mapping(address => mapping(bytes32 => ProposalDetails)) public proposals;

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
    uint256 constant PERCENTAGE_PRECISION = 1e18;
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
        ColletiveDaoSetProposalAdapterContract daoset = ColletiveDaoSetProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_DAO_SET_ADAPTER)
            );
        return daoset.isProposalAllDone(dao);
    }

    function operationProposalsCheck(DaoRegistry dao) internal view {
        ColletiveExpenseProposalAdapterContract expenseContr = ColletiveExpenseProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_EXPENSE_ADAPTER)
            );

        // ColletiveFundRaiseProposalAdapterContract fundRaiseContrc = ColletiveFundRaiseProposalAdapterContract(
        //         dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUND_RAISE_ADAPTER)
        //     );
        ColletiveGovernorManagementAdapterContract governorContrc = ColletiveGovernorManagementAdapterContract(
                dao.getAdapterAddress(
                    DaoHelper.COLLECTIVE_GOVERNOR_MANAGEMENT_ADAPTER
                )
            );
        ColletiveTopUpProposalAdapterContract topupContrc = ColletiveTopUpProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_TOPUP_ADAPTER)
            );

        if (
            !expenseContr.allDone(dao) ||
            // !fundRaiseContrc.allDone(dao) ||
            !governorContrc.allDone(dao) ||
            !topupContrc.allDone(dao)
        ) revert UNDONE_OPERATION_PROPOSALS();
    }

    function submitProposal(
        ProposalParams calldata params
    ) external reimbursable(params.dao) onlyMember(params.dao) returns (bool) {
        ColletiveFundingPoolAdapterContract investmentPoolAdapt = ColletiveFundingPoolAdapterContract(
                params.dao.getAdapterAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER
                )
            );
        // investmentPoolAdapt.processFundRaise(params.dao);
        if (!daosetProposalCheck(params.dao)) revert DAOSET_PROPOSALS_UNDONE();

        if (
            investmentPoolAdapt.fundState(address(params.dao)) ==
            ColletiveFundingPoolAdapterContract.FundState.IN_PROGRESS
            // &&
            // block.timestamp <
            // params.dao.getConfiguration(DaoHelper.FUND_RAISING_WINDOW_END)
        ) revert FUND_RAISE_UNEXECUTE();

        operationProposalsCheck(params.dao);

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
        uint256 totalFund = (params.fundingInfo.fundingAmount *
            PERCENTAGE_PRECISION) /
            (PERCENTAGE_PRECISION -
                (investmentPoolAdapt.protocolFee() +
                    params.dao.getConfiguration(
                        DaoHelper.COLLECTIVE_PROPOSER_INVEST_TOKEN_REWARD_AMOUNT
                    )));

        proposals[address(params.dao)][vars.proposalId] = ProposalDetails(
            FundingInfo(
                params.fundingInfo.token,
                params.fundingInfo.fundingAmount,
                totalFund,
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
                params.vestingInfo.vestingInterval,
                params.vestingInfo.nftEnable,
                params.vestingInfo.erc721,
                params.vestingInfo.vestName,
                params.vestingInfo.vestDescription
            ),
            TimeInfo(0, 0),
            msg.sender,
            0,
            ProposalState.IN_QUEUE
        );

        // Sponsors the proposal.
        params.dao.sponsorProposal(
            vars.proposalId,
            params.dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
        );

        //Inserts proposal at the end of the queue.
        proposalQueue[address(params.dao)].pushBack(vars.proposalId);

        emit ProposalCreated(address(params.dao), vars.proposalId);
        return true;
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

        vars.investmentPoolAdapt = ColletiveFundingPoolAdapterContract(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER)
        );
        // vars.investmetPoolExt = CollectiveInvestmentPoolExtension(
        //     dao.getExtensionAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT)
        // );
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
        //fund inefficient
        if (
            vars.investmentPoolAdapt.poolBalance(dao) <
            proposal.fundingInfo.totalAmount
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

    function processProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) returns (bool) {
        ProcessProposalLocalVars memory vars;
        vars.ongoingProposalId = ongoingProposal[address(dao)];
        //make sure proposal process in sequence
        if (vars.ongoingProposalId != bytes32(0)) {
            if (proposalId != vars.ongoingProposalId)
                revert INVALID_PROPOSALID();
        }
        ProposalDetails storage proposal = proposals[address(dao)][proposalId];

        if (block.timestamp < proposal.timeInfo.stopVotingTime)
            revert VOTING_PERIOD();

        if (proposal.state == ProposalState.IN_EXECUTE_PROGRESS)
            revert IN_EXECUTE_PROGRESS();

        dao.processProposal(proposalId);
        vars.investmentpool = CollectiveInvestmentPoolExtension(
            dao.getExtensionAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT)
        );

        // Checks if the proposal has passed.
        vars.votingContract = CollectiveVotingAdapterContract(
            dao.votingAdapter(proposalId)
        );

        if (address(vars.votingContract) == address(0x0))
            revert ADAPTER_NOT_FOUND();

        vars.allVotingWeight = GovernanceHelper
            .getCollectiveAllGovernorVotingWeightByProposalId(dao, proposalId);
        (vars.voteResult, vars.nbYes, vars.nbNo) = vars
            .votingContract
            .voteResult(dao, proposalId);

        if (vars.voteResult == ICollectiveVoting.VotingState.PASS) {
            proposal.state = ProposalState.IN_EXECUTE_PROGRESS;

            if (
                block.timestamp > proposal.timeInfo.stopVotingTime &&
                block.timestamp <
                proposal.timeInfo.stopVotingTime +
                    dao.getConfiguration(
                        DaoHelper.COLLECTIVE_VOTING_GRACE_PERIOD
                    )
            ) revert GRACE_PERIOD();

            ongoingProposal[address(dao)] = proposalId;

            vars.investmentPoolAdapt = ColletiveFundingPoolAdapterContract(
                dao.getAdapterAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER
                )
            );
            vars.managementFee =
                (proposal.fundingInfo.totalAmount *
                    dao.getConfiguration(DaoHelper.MANAGEMENT_FEE)) /
                PERCENTAGE_PRECISION;

            vars.protocolFee =
                (proposal.fundingInfo.totalAmount *
                    vars.investmentPoolAdapt.protocolFee()) /
                PERCENTAGE_PRECISION;

            vars.proposerFundReward =
                (proposal.fundingInfo.totalAmount *
                    dao.getConfiguration(
                        DaoHelper.COLLECTIVE_PROPOSER_FUND_REWARD_RADIO
                    )) /
                PERCENTAGE_PRECISION;

            if (
                vars.investmentpool.totalSupply() <
                proposal.fundingInfo.totalAmount
            ) {
                //insufficient funds failed the distribution
                proposal.state = ProposalState.FAILED;
            } else {
                CollectiveDistributeAdatperContract distributeCont = CollectiveDistributeAdatperContract(
                        dao.getAdapterAddress(
                            DaoHelper.COLLECTIVE_DISTRIBUTE_ADAPTER
                        )
                    );

                distributeCont.distributeFundByInvestment(
                    dao,
                    [
                        proposal.fundingInfo.receiver,
                        protocolAddress,
                        proposal.proposer
                    ],
                    [
                        proposal.fundingInfo.fundingAmount,
                        vars.managementFee,
                        vars.protocolFee,
                        vars.proposerFundReward
                    ]
                );

                if (proposal.escrowInfo.escrow) {
                    //process5. snap vest info for all eligible investor
                    snapShotVestingInfo(dao, proposalId);

                    //process6. set  projectTeamLockedToken to 0
                    escrowPaybackTokens[address(dao)][proposalId][
                        proposal.escrowInfo.approver
                    ] = 0;
                }

                //process7. substract from invetment pool
                distributeCont.subFromFundPool(
                    dao,
                    proposal.fundingInfo.fundingAmount,
                    vars.protocolFee,
                    vars.managementFee,
                    vars.proposerFundReward
                );
                //process8. set proposal state
                proposal.state = ProposalState.DONE;
            }
        } else if (
            vars.voteResult == ICollectiveVoting.VotingState.NOT_PASS ||
            vars.voteResult == ICollectiveVoting.VotingState.TIE
        ) {
            proposal.state = ProposalState.FAILED;
        } else {
            revert INVESTMENT_PROPOSAL_NOT_FINALIZED();
        }
        // proposal.proposalTimeInfo.proposalExecuteTimestamp = block.timestamp;
        ongoingProposal[address(dao)] = bytes32(0);

        proposal.executeBlockNum = block.number;
        emit ProposalExecuted(
            address(dao),
            proposalId,
            vars.allVotingWeight,
            vars.nbYes,
            vars.nbNo
        );

        return true;
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
        CollectiveAllocationAdapterContract allocAda = CollectiveAllocationAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_ALLOCATION_ADAPTER)
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

    function isPrposalInGracePeriod(
        DaoRegistry dao
    ) public view returns (bool) {
        if (
            getQueueLength(dao) <= 0 &&
            ongoingProposal[address(dao)] == bytes32(0)
        ) return true;

        ProposalDetails storage proposal = proposals[address(dao)][
            ongoingProposal[address(dao)]
        ];

        (
            ICollectiveVoting.VotingState voteResult,
            ,

        ) = CollectiveVotingAdapterContract(
                dao.votingAdapter(ongoingProposal[address(dao)])
            ).voteResult(dao, ongoingProposal[address(dao)]);

        if (
            voteResult == ICollectiveVoting.VotingState.PASS &&
            block.timestamp > proposal.timeInfo.stopVotingTime &&
            block.timestamp <
            proposal.timeInfo.stopVotingTime +
                dao.getConfiguration(DaoHelper.COLLECTIVE_VOTING_GRACE_PERIOD)
        ) return true;

        return false;
    }

    function allDone(DaoRegistry dao) external view returns (bool) {
        if (
            getQueueLength(dao) > 0 ||
            ongoingProposal[address(dao)] != bytes32(0)
        ) return false;
        return true;
    }
}
