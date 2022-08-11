pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../core/DaoRegistry.sol";
import "../guards/AdapterGuard.sol";
import "../guards/MemberGuard.sol";
import "./modifiers/Reimbursable.sol";
import "../adapters/interfaces/IGPVoting.sol";
import "./AllocationAdapterV2.sol";
import "../adapters/interfaces/IFunding.sol";
import "../helpers/FairShareHelper.sol";
import "../helpers/DaoHelper.sol";
import "../extensions/bank/Bank.sol";
import "../extensions/fundingpool/FundingPool.sol";
import "../extensions/ricestaking/RiceStaking.sol";
import "../utils/TypeConver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/DoubleEndedQueue.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

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

contract DistributeFundContractV2 is
    IFunding,
    AdapterGuard,
    MemberGuard,
    Reimbursable
{
    using DoubleEndedQueue for DoubleEndedQueue.Bytes32Deque;
    // Event to indicate the distribution process has been completed
    // if the unitHolder address is 0x0, then the amount were distributed to all members of the DAO.
    // event Distributed(
    //     address daoAddress,
    //     address token,
    //     uint256 amount,
    //     address receiver
    // );

    event ProposalCreated(
        bytes32 proposalId,
        address projectTokenAddress,
        address projectTeamAddress,
        uint256 tradingOffTokenAmount,
        uint256 requestedFundAmount,
        uint256 fullyReleasedDate,
        uint256 lockupDate,
        uint256 inQueueTimestamp,
        uint256 voteStartingTimestamp,
        uint256 voteEndTimestamp,
        uint256 proposalExecuteTimestamp
    );
    event ProposalExecuted(
        bytes32 proposalID,
        uint256 state,
        uint128 nbYes,
        uint128 nbNo,
        uint256 distributeState
    );
    // The distribution status
    enum DistributionStatus {
        IN_QUEUE,
        IN_FILL_FUNDS_PROGRESS,
        IN_VOTING_PROGRESS,
        IN_EXECUTE_PROGRESS,
        DONE,
        FAILED
    }

    // State of the distribution proposal
    struct Distribution {
        address tokenAddr; // The token in which the project team to trade off.
        uint256 tradingOffTokenAmount; //project token amount for trading off
        uint256 requestedFundAmount; // The amount project team requested.
        uint256 fullyReleasedDate; //  tokens will be fully released due to this time linearly. Must be equal or later than Tokens lock-up date
        uint256 lockupDate; //tokens will be locked untill this specific time.
        address recipientAddr; // The receiver address that will receive the funds.
        DistributionStatus status; // The distribution status.
        uint256 inQueueTimestamp;
        uint256 proposalStartVotingTimestamp; //project start voting timestamp
        uint256 proposalStopVotingTimestamp;
        uint256 proposalExecuteTimestamp;
        //project display timestamp
    }
    // bytes32 constant RiceTokenAddr = keccak256("rice.token.address");
    // bytes32 constant ProposalDuration =
    //     keccak256("distributeFund.proposalDuration");
    // bytes32 constant ProposalInterval =
    //     keccak256("distributeFund.proposalInterval");
    // Keeps track of all the distributions executed per DAO.
    mapping(address => mapping(bytes32 => Distribution)) public distributions;
    // Keeps track of all the locked token amount per DAO.
    mapping(address => mapping(bytes32 => mapping(address => uint256)))
        public projectTeamLockedTokens;
    // Keeps track of the latest ongoing distribution proposal per DAO to ensure only 1 proposal can be processed at a time.
    mapping(address => bytes32) public ongoingDistributions;
    // vote types for proposal
    mapping(bytes32 => DaoHelper.VoteType) public proposalVoteTypes;

    DoubleEndedQueue.Bytes32Deque public proposalQueue;

    string constant PROPOSALID_PREFIX = "TFP";
    uint256 public proposalIds = 200000;

    /**
     * @notice Configures the DAO with the Voting and Gracing periods.
     * @param proposalDuration The proposal duration in seconds.
     * @param proposalInterval The proposal duration in seconds.
     * @param proposalExecuteDurantion The proposal duration in seconds.
     */
    function configureDao(
        DaoRegistry dao,
        uint256 proposalDuration,
        uint256 proposalInterval,
        uint256 proposalExecuteDurantion
    ) external onlyAdapter(dao) {
        dao.setConfiguration(DaoHelper.PROPOSAL_DURATION, proposalDuration);
        dao.setConfiguration(DaoHelper.PROPOSAL_INTERVAL, proposalInterval);
        dao.setConfiguration(
            DaoHelper.PROPOSAL_EXECUTE_DURATION,
            proposalExecuteDurantion
        );

        // emit ConfigureDao(votingPeriod, gracePeriod);
    }

    /**
     * @notice lock project token
     * @param projectTeamAddr The project team address
     * @param projectTokenAddr The token address being lock
     * @param lockAmount The token amount to lock
     */
    function _lockProjectTeamToken(
        DaoRegistry dao,
        address projectTeamAddr,
        address projectTokenAddr,
        uint256 lockAmount
    ) internal returns (bool) {
        IERC20 erc20 = IERC20(projectTokenAddr);
        if (erc20.allowance(projectTeamAddr, address(this)) < lockAmount) {
            return false;
        }
        //approve to AllocationAdapter contract
        erc20.approve(
            dao.getAdapterAddress(DaoHelper.ALLOCATION_ADAPTV2),
            lockAmount
        );
        erc20.transferFrom(projectTeamAddr, address(this), lockAmount);
        return true;
    }

    function unLockProjectTeamToken(DaoRegistry dao, bytes32 proposalId)
        external
    {
        uint256 lockedTokenAmount = projectTeamLockedTokens[address(dao)][
            proposalId
        ][msg.sender];
        require(
            lockedTokenAmount > 0,
            "unLockProjectTeamToken::no fund to unlock"
        );

        Distribution storage distribution = distributions[address(dao)][
            proposalId
        ];
        IERC20 erc20 = IERC20(distribution.tokenAddr);
        require(
            erc20.balanceOf(address(this)) >= lockedTokenAmount,
            "DistributeFund::unLockProjectTeamToken::Insufficient Fund"
        );
        IGPVoting votingContract = IGPVoting(dao.votingAdapter(proposalId));
        (IGPVoting.VotingState voteResult, , ) = votingContract.voteResult(
            dao,
            proposalId
        );

        require(
            distribution.status == DistributionStatus.FAILED &&
                (voteResult == IGPVoting.VotingState.NOT_PASS ||
                    voteResult == IGPVoting.VotingState.TIE ||
                    voteResult == IGPVoting.VotingState.PASS),
            "unLockProjectTeamToken::not satisfied"
        );
        projectTeamLockedTokens[address(dao)][proposalId][msg.sender] = 0;
        erc20.transfer(msg.sender, lockedTokenAmount);
    }

    struct SubmitProposalLocalVars {
        bytes32 ongoingProposalId;
        IGPVoting gpVotingContract;
        FundingPoolExtension fundingpool;
        address submittedBy;
        bytes32 proposalId;
        uint256 proposalInQueueTimestamp;
        uint256 projectDisplayTimestamp;
        uint256 proposalStartVotingTimestamp;
        uint256 proposalEndVotingTimestamp;
        uint256 proposalExecuteTimestamp;
    }

    /**
     * @notice Creates a distribution proposal for project team, opens it for voting, and sponsors it.
     * @dev Only tokens that are allowed by the Bank are accepted.
     * @dev Proposal ids can not be reused.
     * @dev The amount must be greater than zero.
     * @param dao The dao address.
     * @param _addressArgs _addressArgs[0]:recipientAddr,_addressArgs[1]:tokenAddr
     * @param _uint256ArgsProposal _uint256ArgsProposal[0]:requestedFundAmount,
                                    _uint256ArgsProposal[1]:tradingOffTokenAmount,
                                    _uint256ArgsProposal[2]:fullyReleasedDate,
                                    _uint256ArgsProposal[3]:lockupDate
     */
    // slither-disable-next-line reentrancy-benign
    function submitProposal(
        DaoRegistry dao,
        address[] calldata _addressArgs,
        uint256[] calldata _uint256ArgsProposal
    )
        external
        override
        onlyGeneralPartner(dao)
        reimbursable(dao)
        returns (bytes32 proposalId)
    {
        SubmitProposalLocalVars memory vars;

        vars.gpVotingContract = IGPVoting(
            dao.getAdapterAddress(DaoHelper.GPVOTING_ADAPT)
        );

        vars.submittedBy = vars.gpVotingContract.getSenderAddress(
            dao,
            address(this),
            bytes(""),
            msg.sender
        );
        require(
            _uint256ArgsProposal[2] >= _uint256ArgsProposal[3],
            "DistributeFund::submitProposal::fully released date must >= lock-up date"
        );
        require(
            _uint256ArgsProposal[1] > 0,
            "DistributeFund::submitProposal::invalid trading-Off Token Amount"
        );
        require(
            _uint256ArgsProposal[0] > 0,
            "DistributeFund::submitProposal::invalid requested Fund Amount"
        );
        require(
            _addressArgs[0] != address(0x0),
            "DistributeFund::submitProposal::invalid receiver address"
        );

        vars.proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked("TFP", Strings.toString(proposalIds))
        );
        // Creates the distribution proposal.
        dao.submitProposal(vars.proposalId);

        // Saves the state of the proposal.
        createNewDistribution(
            dao,
            vars.proposalId,
            _addressArgs,
            _uint256ArgsProposal
        );

        vars.proposalInQueueTimestamp = block.timestamp;
        vars.proposalStartVotingTimestamp = distributions[address(dao)][
            vars.proposalId
        ].proposalStartVotingTimestamp;
        vars.proposalEndVotingTimestamp =
            vars.proposalStartVotingTimestamp +
            dao.getConfiguration(DaoHelper.PROPOSAL_DURATION);
        vars.proposalExecuteTimestamp =
            vars.proposalEndVotingTimestamp +
            dao.getConfiguration(DaoHelper.PROPOSAL_EXECUTE_DURATION);

        // Sponsors the proposal.
        dao.sponsorProposal(
            vars.proposalId,
            vars.submittedBy,
            address(vars.gpVotingContract)
        );

        //Inserts proposal at the end of the queue.
        proposalQueue.pushBack(vars.proposalId);
        distributions[address(dao)][vars.proposalId].status = DistributionStatus
            .IN_QUEUE;

        proposalIds += 1;
        emit ProposalCreated(
            vars.proposalId,
            _addressArgs[1],
            _addressArgs[0],
            _uint256ArgsProposal[1],
            _uint256ArgsProposal[0],
            _uint256ArgsProposal[2],
            _uint256ArgsProposal[3],
            vars.proposalInQueueTimestamp,
            vars.proposalStartVotingTimestamp,
            vars.proposalEndVotingTimestamp,
            vars.proposalExecuteTimestamp
        );
    }

    function createNewDistribution(
        DaoRegistry dao,
        bytes32 proposalId,
        address[] calldata _addressArgs,
        uint256[] calldata _uint256ArgsProposal
    ) internal {
        uint256 _propsalStartVotingTimestamp = computeProjectVotingTimestamp(
            dao
        );
        uint256 _propsalStopVotingTimestamp = _propsalStartVotingTimestamp +
            dao.getConfiguration(DaoHelper.PROPOSAL_DURATION);
        uint256 _proposalExecuteTimestamp = _propsalStopVotingTimestamp +
            dao.getConfiguration(DaoHelper.PROPOSAL_EXECUTE_DURATION);
        distributions[address(dao)][proposalId] = Distribution(
            _addressArgs[1],
            _uint256ArgsProposal[1],
            _uint256ArgsProposal[0],
            _uint256ArgsProposal[2],
            _uint256ArgsProposal[3],
            _addressArgs[0],
            DistributionStatus.IN_QUEUE,
            block.timestamp,
            _propsalStartVotingTimestamp,
            _propsalStopVotingTimestamp,
            _proposalExecuteTimestamp
        );
    }

    function startFillFundsProcess(DaoRegistry dao, bytes32 proposalId)
        external
        reimbursable(dao)
        returns (bool)
    {
        //queue is empty
        if (proposalQueue.length() <= 0) {
            return false;
        }
        //proposalId must get from begining of the queue
        require(
            proposalId == proposalQueue.front(),
            "DistributeFund::startVotingProcess::Invalid ProposalId"
        );

        Distribution storage distribution = distributions[address(dao)][
            proposalId
        ];
        // require(
        //     block.timestamp < distribution.proposalStartVotingTimestamp,
        //     "DistributeFund::startFillFundsProcess::fill funds time is end"
        // );

        // Checks if there is proposal in voting process, only one proposal can be in voting process.
        bytes32 ongoingProposalId = ongoingDistributions[address(dao)];
        require(
            ongoingProposalId == bytes32(0) ||
                distributions[address(dao)][ongoingProposalId].status ==
                DistributionStatus.DONE ||
                distributions[address(dao)][ongoingProposalId].status ==
                DistributionStatus.FAILED,
            "DistributeFund::submitProposal::there is proposal not finished"
        );
        ongoingDistributions[address(dao)] = proposalId;
        // set to fill funds state;
        distributions[address(dao)][proposalId].status = DistributionStatus
            .IN_FILL_FUNDS_PROGRESS;
        //Removes the proposalId at the beginning of the queue
        proposalQueue.popFront();
        return true;
    }

    /**
     * @notice Start voting process when period for project team to approval is end.
     * @dev Only tokens that are allowed by the Bank are accepted.
     * @dev Proposal ids can not be reused.
     * @dev The amount must be greater than zero.
     * @param dao The dao address.
     * @param proposalId The distribution proposal id.
     */
    function startVotingProcess(DaoRegistry dao, bytes32 proposalId)
        external
        reimbursable(dao)
        returns (bool)
    {
        bytes32 ongoingProposalId = ongoingDistributions[address(dao)];

        //proposalId must get from begining of the queue
        require(
            proposalId == ongoingProposalId,
            "DistributeFund::startVotingProcess::Invalid ProposalId"
        );
        Distribution storage distribution = distributions[address(dao)][
            proposalId
        ];
        // require(
        //     block.timestamp > distribution.proposalStartVotingTimestamp &&
        //         block.timestamp < distribution.proposalStopVotingTimestamp,
        //     "DistributeFund::startVotingProcess::not in voting duration"
        // );

        // Checks if there is proposal in voting process, only one proposal can be in voting process.
        require(
            distributions[address(dao)][ongoingProposalId].status ==
                DistributionStatus.IN_FILL_FUNDS_PROGRESS,
            "DistributeFund::startVotingProcess::proposal not in fill funds state"
        );
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );
        // didn't meet the requested fund requirement
        if (
            fundingpool.totalSupply() <
            distributions[address(dao)][proposalId].requestedFundAmount
        ) {
            distributions[address(dao)][proposalId].status = DistributionStatus
                .FAILED;
            return false;
        }

        //lock project token
        bool rel = _lockProjectTeamToken(
            dao,
            distribution.recipientAddr,
            distribution.tokenAddr,
            distribution.tradingOffTokenAmount
        );
        // lock project token failed
        if (!rel) {
            distribution.status = DistributionStatus.FAILED;
            return false;
        }
        projectTeamLockedTokens[address(dao)][proposalId][
            distribution.recipientAddr
        ] = distribution.tradingOffTokenAmount;

        IGPVoting gpVotingContract = IGPVoting(
            dao.getAdapterAddress(DaoHelper.GPVOTING_ADAPT)
        );

        // Starts the voting process for the proposal. setting voting start time
        gpVotingContract.startNewVotingForProposal(
            dao,
            proposalId,
            distribution.proposalStartVotingTimestamp,
            bytes("")
        );
        // snap funds
        fundingpool.setSnapFunds(fundingpool.getToken(0));

        // ongoingDistributions[address(dao)] = proposalId;
        distribution.status = DistributionStatus.IN_VOTING_PROGRESS;
        return true;
    }

    struct ProcessProposalLocalVars {
        bytes32 ongoingProposalId;
        IGPVoting votingContract;
        StakingRiceExtension stakingrice;
        FundingPoolExtension fundingpool;
        IGPVoting.VotingState voteResult;
        AllocationAdapterContractV2 allocAda;
        uint128 nbYes;
        uint128 nbNo;
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
    function processProposal(DaoRegistry dao, bytes32 proposalId)
        external
        override
        reimbursable(dao)
    {
        ProcessProposalLocalVars memory vars;
        vars.ongoingProposalId = ongoingDistributions[address(dao)];
        require(
            vars.ongoingProposalId == proposalId,
            "DistributeFund::processProposal::invalid proposalId"
        );
        dao.processProposal(proposalId);
        vars.fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );
        vars.stakingrice = StakingRiceExtension(
            dao.getExtensionAddress(DaoHelper.RICE_STAKING_EXT)
        );
        // Checks if the proposal exists or is not in progress yet.
        Distribution storage distribution = distributions[address(dao)][
            proposalId
        ];
        require(
            distribution.status == DistributionStatus.IN_VOTING_PROGRESS,
            "proposal already completed or in progress"
        );

        require(
            distributions[address(dao)][vars.ongoingProposalId].status !=
                DistributionStatus.IN_EXECUTE_PROGRESS,
            "proposal already in execute progress"
        );

        // Checks if the proposal has passed.
        vars.votingContract = IGPVoting(dao.votingAdapter(proposalId));
        require(
            address(vars.votingContract) != address(0),
            "adapter not found"
        );

        (vars.voteResult, vars.nbYes, vars.nbNo) = vars
            .votingContract
            .voteResult(dao, proposalId);

        if (vars.voteResult == IGPVoting.VotingState.PASS) {
            distribution.status = DistributionStatus.IN_EXECUTE_PROGRESS;
            ongoingDistributions[address(dao)] = proposalId;

            //set project sanp funds/rice to total funds/rice
            address token = vars.fundingpool.getToken(0);
            vars.fundingpool.setProjectSnapFunds(token);
            vars.stakingrice.setProjectSnapRice(
                dao.getAddressConfiguration(DaoHelper.RICE_TOKEN_ADDRESS)
            );

            //insufficient funds failed the distribution
            if (
                vars.fundingpool.totalSupply() <
                distribution.requestedFundAmount
            ) {
                distribution.status = DistributionStatus.FAILED;
            } else {
                //process1. distribute fund to project team address
                vars.fundingpool.distributeFunds(
                    distribution.recipientAddr,
                    token,
                    distribution.requestedFundAmount
                );

                //process2. streaming pay for all eligible investor
                vars.allocAda = AllocationAdapterContractV2(
                    dao.getAdapterAddress(DaoHelper.ALLOCATION_ADAPTV2)
                );
                vars.allocAda.allocateProjectToken(
                    dao,
                    distribution.tradingOffTokenAmount,
                    distribution.tokenAddr,
                    distribution.lockupDate,
                    distribution.fullyReleasedDate
                );
                //process3. substract from funding pool
                vars.fundingpool.subtractAllFromBalance(
                    token,
                    distribution.requestedFundAmount
                );
                //process4. set  projectTeamLockedToken to 0
                projectTeamLockedTokens[address(dao)][proposalId][
                    distribution.recipientAddr
                ] = 0;

                distribution.status = DistributionStatus.DONE;
            }
        } else if (
            vars.voteResult == IGPVoting.VotingState.NOT_PASS ||
            vars.voteResult == IGPVoting.VotingState.TIE
        ) {
            distribution.status = DistributionStatus.FAILED;
        } else {
            revert("voting not finalized");
        }

        ongoingDistributions[address(dao)] = bytes32(0);
        //vote finished reset snapfunds to 0
        vars.fundingpool.resetSnapFunds();

        emit ProposalExecuted(
            proposalId,
            uint256(vars.voteResult),
            vars.nbYes,
            vars.nbNo,
            uint256(distribution.status)
        );
    }

    //compute project voting timestamp
    function computeProjectVotingTimestamp(DaoRegistry dao)
        internal
        returns (uint256)
    {
        if (proposalQueue.length() > 0) {
            bytes32 lastProposalId = proposalQueue.back();
            uint256 timestamp = distributions[address(dao)][lastProposalId]
                .proposalExecuteTimestamp +
                dao.getConfiguration(DaoHelper.PROPOSAL_INTERVAL);
            return timestamp;
        }
        return
            block.timestamp + dao.getConfiguration(DaoHelper.PROPOSAL_INTERVAL);
    }

    /**
     * Public read-only functions
     */
}
