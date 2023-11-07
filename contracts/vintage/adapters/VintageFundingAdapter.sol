pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

// import "../guards/AdapterGuard.sol";
// import "../guards/MemberGuard.sol";
import "../../guards/RaiserGuard.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "./VintageAllocationAdapter.sol";
import "./interfaces/IVintageFunding.sol";
import "./VintageVoting.sol";
import "./VintageDistributeAdapter.sol";
import "./VintageFundingReturnTokenAdapter.sol";
import "../../helpers/DaoHelper.sol";
import "../../helpers/GovernanceHelper.sol";
import "../../utils/TypeConver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/DoubleEndedQueue.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

// import "../libraries/fundingLibrary.sol";

/**
MIT License

Copyright (c) 2022 DAOSQUARE

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

contract VintageFundingAdapterContract is
    IVintageInvestment,
    AdapterGuard,
    RaiserGuard,
    Reimbursable
{
    using DoubleEndedQueue for DoubleEndedQueue.Bytes32Deque;
    using InvestmentLibrary for InvestmentLibrary.ProposalInfo;
    // Keeps track of all the proposal executed per DAO.
    // mapping(address => mapping(bytes32 => ProposalInfo)) public proposals;
    mapping(address => mapping(bytes32 => InvestmentLibrary.ProposalInfo))
        public proposals;

    // Keeps track of all the locked token amount per DAO.
    mapping(address => mapping(bytes32 => mapping(address => uint256)))
        public projectTeamLockedTokens;
    // Keeps track of the latest ongoing distribution proposal per DAO to ensure only 1 proposal can be processed at a time.
    mapping(address => bytes32) public ongoingProposal;
    // vote types for proposal
    mapping(address => DoubleEndedQueue.Bytes32Deque) public proposalQueue;

    address public protocolAddress =
        address(0x9ac9c636404C8d46D9eb966d7179983Ba5a3941A);

    modifier onlyDaoFactoryOwner(DaoRegistry dao) {
        require(msg.sender == DaoHelper.daoFactoryAddress(dao));
        _;
    }

    function setProtocolAddress(
        DaoRegistry dao,
        address _protocolAddress
    ) external reentrancyGuard(dao) onlyDaoFactoryOwner(dao) {
        protocolAddress = _protocolAddress;
    }

    /**
     * @notice lock project token
     * @param returnToken The project team address
     * @param returnToken The token address being lock
     * @param lockAmount The token amount to lock
     */
    function _lockProjectTeamToken(
        DaoRegistry dao,
        address approver,
        address returnToken,
        uint256 lockAmount,
        bytes32 proposalId
    ) internal returns (bool) {
        VintageInvestmentPaybackTokenAdapterContract returnTokenAdapt = VintageInvestmentPaybackTokenAdapterContract(
                dao.getAdapterAddress(
                    DaoHelper.VINTAGE_INVESTMENT_PAYBACK_TOKEN_ADAPTER
                )
            );
        return
            returnTokenAdapt.escrowInvestmentPaybackToken(
                lockAmount,
                dao,
                approver,
                returnToken,
                proposalId
            );
    }

    function unLockProjectTeamToken(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        InvestmentLibrary.ProposalInfo storage proposal = proposals[
            address(dao)
        ][proposalId];

        VintageInvestmentPaybackTokenAdapterContract returnTokenAdapt = VintageInvestmentPaybackTokenAdapterContract(
                dao.getAdapterAddress(
                    DaoHelper.VINTAGE_INVESTMENT_PAYBACK_TOKEN_ADAPTER
                )
            );
        returnTokenAdapt.withdrawInvestmentPaybackToken(
            dao,
            proposalId,
            proposal.proposalPaybackTokenInfo.paybackToken,
            msg.sender,
            proposal.status
        );
    }

    /**
     * @notice Creates a distribution proposal for project team, opens it for voting, and sponsors it.
     * @dev Only tokens that are allowed by the Bank are accepted.
     * @dev Proposal ids can not be reused.
     * @dev The amount must be greater than zero.
     * @param dao The dao address.
     * @param params _addressArgs[0]:recipientAddr,_addressArgs[1]:projectTokenAddr, _addressArgs[2]: approveOwnerAddr
     */
    // slither-disable-next-line reentrancy-benign
    function submitProposal(
        DaoRegistry dao,
        InvestmentProposalParams calldata params
    ) external override onlyGovernor(dao) reimbursable(dao) {
        SubmitProposalLocalVars memory vars;
        dao.increaseInvestmentId();
        vars.proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                InvestmentLibrary.PROPOSALID_PREFIX,
                Strings.toString(dao.getCurrentInvestmentProposalId())
            )
        );
        // Create proposal.
        dao.submitProposal(vars.proposalId);

        // Saves the state of the proposal.
        proposals[address(dao)][vars.proposalId] = proposals[address(dao)][
            vars.proposalId
        ].createNewInvestmentProposal(
                dao,
                [
                    params.investmentInfo.investmentAmount,
                    params.paybackTokenInfo.price,
                    block.timestamp,
                    0,
                    0,
                    0,
                    params.vestInfo.vestingStartTime,
                    params.vestInfo.vestingCliffEndTime,
                    params.vestInfo.vetingEndTime,
                    params.vestInfo.vestingCliffLockAmount,
                    params.vestInfo.vestingInterval
                ],
                [
                    params.investmentInfo.investmentToken,
                    params.paybackTokenInfo.approver,
                    params.paybackTokenInfo.paybackToken,
                    msg.sender,
                    params.investmentInfo.receiver,
                    params.paybackTokenInfo.vestingNft
                ],
                params.paybackTokenInfo.escrow,
                params.paybackTokenInfo.nftEnable,
                params.vestInfo.name,
                params.vestInfo.description
            );

        // Sponsors the proposal.
        dao.sponsorProposal(
            vars.proposalId,
            dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );

        //Inserts proposal at the end of the queue.
        proposalQueue[address(dao)].pushBack(vars.proposalId);

        emit ProposalCreated(address(dao), vars.proposalId);
    }

    /**
     * @notice Start voting process when period for project team to approval is end.
     * @dev Only tokens that are allowed by the Bank are accepted.
     * @dev Proposal ids can not be reused.
     * @dev The amount must be greater than zero.
     * @param dao The dao address.
     * @param proposalId The distribution proposal id.
     */
    function startVotingProcess(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) onlyGovernor(dao) {
        //  queue is empty
        require(getQueueLength(dao) > 0, "!ProposalQueue");
        //proposalId must get from begining of the queue
        require(
            proposalId == proposalQueue[address(dao)].front(),
            "!HeadQueueProposalId"
        );
        StartVotingLocalVars memory vars;
        vars.ongongingPrposalId = ongoingProposal[address(dao)];

        InvestmentLibrary.ProposalInfo storage proposal = proposals[
            address(dao)
        ][proposalId];
        // make sure there is no proposal no finalized
        if (vars.ongongingPrposalId != bytes32(0)) {
            require(
                proposals[address(dao)][vars.ongongingPrposalId].status ==
                    InvestmentLibrary.ProposalState.DONE ||
                    proposals[address(dao)][vars.ongongingPrposalId].status ==
                    InvestmentLibrary.ProposalState.FAILED,
                "PrePropsalNotDone"
            );
        }

        vars.investmentPoolAdapt = VintageFundingPoolAdapterContract(
            dao.getAdapterAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_ADAPT)
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
            proposal.status == InvestmentLibrary.ProposalState.IN_QUEUE,
            "ProposalNotInQueue"
        );

        //Removes the proposalId at the beginning of the queue
        proposalQueue[address(dao)].popFront();
        vars.votingContract = IVintageVoting(
            dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );
        //fund inefficient || refund period
        if (
            vars.investmentPoolAdapt.poolBalance(dao) < proposal.totalAmount ||
            (vars._propsalStopVotingTimestamp +
                dao.getConfiguration(DaoHelper.PROPOSAL_EXECUTE_DURATION) >
                dao.getConfiguration(DaoHelper.FUND_END_TIME))
        ) {
            proposal.status = InvestmentLibrary.ProposalState.FAILED;
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
                    proposal.status = InvestmentLibrary.ProposalState.FAILED;
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

                    proposal.status = InvestmentLibrary
                        .ProposalState
                        .IN_VOTING_PROGRESS;
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

    /**
     * @notice Process the distribution proposal, calculates the fair amount of funds to distribute to the project team.
     * @dev A distribution proposal proposal must be in progress.
     * @dev Only one proposal per DAO can be executed at time.
     * @dev Only proposals that passed the voting can be set to In Progress status.
     * @param dao The dao address.
     * @param proposalId The distribution proposal id.
     */
    // The function is protected against reentrancy with the reentrancyGuard
    // Which prevents concurrent modifications in the DAO registry.
    //slither-disable-next-line reentrancy-no-eth
    function processProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external override reimbursable(dao) returns (bool) {
        ProcessProposalLocalVars memory vars;
        vars.ongoingProposalId = ongoingProposal[address(dao)];
        //make sure proposal process in sequence
        if (vars.ongoingProposalId != bytes32(0)) {
            require(proposalId == vars.ongoingProposalId, "Invalid PrposalId");
        }
        InvestmentLibrary.ProposalInfo storage proposal = proposals[
            address(dao)
        ][proposalId];

        require(
            block.timestamp >
                proposal.proposalTimeInfo.proposalStopVotingTimestamp,
            "In Voting Period"
        );

        require(
            proposal.status !=
                InvestmentLibrary.ProposalState.IN_EXECUTE_PROGRESS,
            "In Execute Progress"
        );
        dao.processProposal(proposalId);
        vars.investmentpool = VintageFundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_EXT)
        );

        // Checks if the proposal has passed.
        vars.votingContract = VintageVotingContract(
            dao.votingAdapter(proposalId)
        );
        require(
            address(vars.votingContract) != address(0x0),
            "Adapter Not Found"
        );

        vars.allVotingWeight = GovernanceHelper
            .getVintageAllGovernorVotingWeightByProposalId(dao, proposalId);
        (vars.voteResult, vars.nbYes, vars.nbNo) = vars
            .votingContract
            .voteResult(dao, proposalId);

        if (vars.voteResult == IVintageVoting.VotingState.PASS) {
            proposal.status = InvestmentLibrary
                .ProposalState
                .IN_EXECUTE_PROGRESS;

            ongoingProposal[address(dao)] = proposalId;

            vars.investmentPoolAdapt = VintageFundingPoolAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_ADAPT)
            );
            vars.managementFee =
                (proposal.totalAmount *
                    dao.getConfiguration(DaoHelper.MANAGEMENT_FEE)) /
                InvestmentLibrary.PERCENTAGE_PRECISION;

            vars.protocolFee =
                (proposal.totalAmount *
                    vars.investmentPoolAdapt.protocolFee()) /
                InvestmentLibrary.PERCENTAGE_PRECISION;

            vars.proposerFundReward =
                (proposal.totalAmount *
                    dao.getConfiguration(
                        DaoHelper.VINTAGE_PROPOSER_FUND_REWARD_RADIO
                    )) /
                InvestmentLibrary.PERCENTAGE_PRECISION;

            if (vars.investmentpool.totalSupply() < proposal.totalAmount) {
                //insufficient funds failed the distribution
                proposal.status = InvestmentLibrary.ProposalState.FAILED;
            } else {
                VintageDistributeAdatperContract distributeCont = VintageDistributeAdatperContract(
                        dao.getAdapterAddress(
                            DaoHelper.VINTAGE_DISTRIBUTE_ADAPTER
                        )
                    );

                distributeCont.distributeFundByInvestment(
                    dao,
                    [
                        proposal.recipientAddr,
                        protocolAddress,
                        proposal.proposer
                    ],
                    [
                        proposal.investmentAmount,
                        vars.managementFee,
                        vars.protocolFee,
                        vars.proposerFundReward
                    ]
                );

                if (proposal.proposalPaybackTokenInfo.escrow) {
                    //process5. snap vest info for all eligible investor
                    snapShotVestingInfo(dao, proposalId);

                    //process6. set  projectTeamLockedToken to 0
                    projectTeamLockedTokens[address(dao)][proposalId][
                        proposal.recipientAddr
                    ] = 0;
                }

                //process7. substract from invetment pool
                distributeCont.subFromFundPool(
                    dao,
                    proposal.investmentAmount,
                    vars.protocolFee,
                    vars.managementFee,
                    vars.proposerFundReward
                );
                //process8. set proposal state
                // proposal.status = IVintageInvestment.ProposalState.DONE;
                proposal.status = InvestmentLibrary.ProposalState.DONE;
            }
        } else if (
            vars.voteResult == IVintageVoting.VotingState.NOT_PASS ||
            vars.voteResult == IVintageVoting.VotingState.TIE
        ) {
            proposal.status = InvestmentLibrary.ProposalState.FAILED;
        } else {
            revert INVESTMENT_PROPOSAL_NOT_FINALIZED();
        }
        proposal.proposalTimeInfo.proposalExecuteTimestamp = block.timestamp;
        ongoingProposal[address(dao)] = bytes32(0);

        emit ProposalExecuted(
            address(dao),
            proposalId,
            vars.allVotingWeight,
            vars.nbYes,
            vars.nbNo
        );

        return true;
    }

    function snapShotVestingInfo(DaoRegistry dao, bytes32 proposalId) internal {
        VintageAllocationAdapterContract allocAda = VintageAllocationAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_ALLOCATION_ADAPTER)
            );
        InvestmentLibrary.ProposalInfo storage proposal = proposals[
            address(dao)
        ][proposalId];
        uint256[6] memory uint256Args = [
            proposal.proposalPaybackTokenInfo.paybackTokenAmount,
            proposal.vestInfo.vestingStartTime,
            proposal.vestInfo.vetingEndTime,
            proposal.vestInfo.vestingCliffEndTime,
            proposal.vestInfo.vestingCliffLockAmount,
            proposal.vestInfo.vestingInterval
        ];
        allocAda.allocateProjectToken(
            dao,
            proposal.proposalPaybackTokenInfo.paybackToken,
            proposal.proposer,
            proposalId,
            uint256Args
        );
    }

    /**
     * Public read-only functions
     */

    function getFrontProposalId(DaoRegistry dao) public view returns (bytes32) {
        if (!proposalQueue[address(dao)].empty())
            return proposalQueue[address(dao)].front();
        else return 0x0;
    }

    function getQueueLength(DaoRegistry dao) public view returns (uint256) {
        if (!proposalQueue[address(dao)].empty())
            return proposalQueue[address(dao)].length();
        else return 0;
    }
}
