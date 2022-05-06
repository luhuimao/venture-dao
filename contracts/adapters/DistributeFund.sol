pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../core/DaoRegistry.sol";
import "../guards/AdapterGuard.sol";
import "../guards/MemberGuard.sol";
import "./modifiers/Reimbursable.sol";
import "../adapters/interfaces/IGPVoting.sol";
import "./AllocationAdapter.sol";
import "../adapters/interfaces/IFunding.sol";
import "../helpers/FairShareHelper.sol";
import "../helpers/DaoHelper.sol";
import "../extensions/bank/Bank.sol";
import "../extensions/fundingpool/FundingPool.sol";
import "../extensions/ricestaking/RiceStaking.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
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

contract DistributeFundContract is
    IFunding,
    AdapterGuard,
    MemberGuard,
    Reimbursable
{
    // Event to indicate the distribution process has been completed
    // if the unitHolder address is 0x0, then the amount were distributed to all members of the DAO.
    event Distributed(
        address daoAddress,
        address token,
        uint256 amount,
        address receiver
    );

    event ProposalCreated(
        bytes32 proposalId,
        address projectTokenAddress,
        address projectTeamAddress,
        uint256 tradingOffTokenAmount,
        uint256 requestedFundAmount,
        uint256 fullyReleasedDate,
        uint256 lockupDate,
        uint256 voteStartingTime
    );
    event VoteResult(
        bytes32 proposalID,
        IGPVoting.VotingState state,
        uint128 nbYes,
        uint128 nbNo
    );
    // The distribution status
    enum DistributionStatus {
        NOT_STARTED,
        IN_PROGRESS,
        DONE,
        FAILED
    }

    // State of the distribution proposal
    struct Distribution {
        // The token in which the project team to trade off.
        address tokenAddr;
        //project token amount for trading off
        uint256 tradingOffTokenAmount;
        // The amount project team requested.
        uint256 requestedFundAmount;
        //  tokens will be fully released due to this time linearly. Must be equal or later than Tokens lock-up date
        uint256 fullyReleasedDate;
        //tokens will be locked untill this specific time.
        uint256 lockupDate;
        // The receiver address that will receive the funds.
        address recipientAddr;
        // The distribution status.
        DistributionStatus status;
        // Current iteration index to control the cached for-loop.
        uint256 currentIndex;
        // The block number in which the proposal has been created.
        uint256 blockNumber;
    }
    bytes32 constant RiceTokenAddr = keccak256("rice.token.address");

    // Keeps track of all the distributions executed per DAO.
    mapping(address => mapping(bytes32 => Distribution)) public distributions;
    // Keeps track of all the locked token amount per DAO.
    mapping(address => mapping(bytes32 => mapping(address => uint256)))
        public projectTeamLockedTokens;
    // Keeps track of the latest ongoing distribution proposal per DAO to ensure only 1 proposal can be processed at a time.
    mapping(address => bytes32) public ongoingDistributions;

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
    ) internal {
        IERC20 erc20 = IERC20(projectTokenAddr);
        erc20.transferFrom(projectTeamAddr, address(this), lockAmount);

        //approve to AllocationAdapter contract
        erc20.approve(
            dao.getAdapterAddress(DaoHelper.ALLOCATION_ADAPT),
            lockAmount
        );
    }

    function unLockProjectTeamToken(DaoRegistry dao, bytes32 proposalId)
        external
    {
        uint256 lockedTokenAmount = projectTeamLockedTokens[address(dao)][
            proposalId
        ][msg.sender];
        require(lockedTokenAmount > 0, "no fund to unlock");

        Distribution storage distribution = distributions[address(dao)][
            proposalId
        ];
        IERC20 erc20 = IERC20(distribution.tokenAddr);
        require(
            erc20.balanceOf(address(this)) >= lockedTokenAmount,
            "Insufficient Fund"
        );
        IGPVoting votingContract = IGPVoting(dao.votingAdapter(proposalId));
        (IGPVoting.VotingState voteResult, , ) = votingContract.voteResult(
            dao,
            proposalId
        );
        require(
            voteResult == IGPVoting.VotingState.NOT_PASS ||
                voteResult == IGPVoting.VotingState.TIE,
            "voting result must be not pass or tie"
        );
        erc20.transfer(msg.sender, lockedTokenAmount);
    }

    struct SubmitProposalLocalVars {
        bytes32 ongoingProposalId;
        IGPVoting gpVotingContract;
        FundingPoolExtension fundingpool;
        address submittedBy;
    }

    /**
     * @notice Creates a distribution proposal for project team, opens it for voting, and sponsors it.
     * @dev Only tokens that are allowed by the Bank are accepted.
     * @dev Proposal ids can not be reused.
     * @dev The amount must be greater than zero.
     * @param dao The dao address.
     * @param proposalId The distribution proposal id.
     * @param _addressArgs _addressArgs[0]:recipientAddr,_addressArgs[1]:tokenAddr
     * @param _uint256ArgsProposal _uint256ArgsProposal[0]:requestedFundAmount,
                                    _uint256ArgsProposal[1]:tradingOffTokenAmount,
                                    _uint256ArgsProposal[2]:fullyReleasedDate, 
                                    _uint256ArgsProposal[3]:lockupDate
     * @param data Additional information related to the distribution proposal.
     */
    // slither-disable-next-line reentrancy-benign
    function submitProposal(
        DaoRegistry dao,
        bytes32 proposalId,
        address[] calldata _addressArgs,
        uint256[] calldata _uint256ArgsProposal,
        bytes calldata data
    ) external override onlyMember(dao) reimbursable(dao) {
        require(
            proposalId != bytes32(0),
            "DistributeFund::submitProposal::invalid proposalId"
        );
        SubmitProposalLocalVars memory vars;

        // Checks if there is an ongoing proposal, only one proposal can be submited at time.
        vars.ongoingProposalId = ongoingDistributions[address(dao)];

        require(
            vars.ongoingProposalId == bytes32(0) ||
                distributions[address(dao)][vars.ongoingProposalId].status ==
                DistributionStatus.DONE ||
                distributions[address(dao)][vars.ongoingProposalId].status ==
                DistributionStatus.FAILED,
            "DistributeFund::submitProposal::another proposal already in progress"
        );

        vars.gpVotingContract = IGPVoting(
            dao.getAdapterAddress(DaoHelper.GPVOTING_ADAPT)
        );
        vars.fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );
        require(
            vars.fundingpool.balanceOf(
                DaoHelper.DAOSQUARE_TREASURY,
                vars.fundingpool.getToken(0)
            ) > _uint256ArgsProposal[0],
            "DistributeFund::submitProposal::requested fund amount > total fund"
        );
        vars.submittedBy = vars.gpVotingContract.getSenderAddress(
            dao,
            address(this),
            data,
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

        //lock project token
        _lockProjectTeamToken(
            dao,
            _addressArgs[0],
            _addressArgs[1],
            _uint256ArgsProposal[1]
        );
        projectTeamLockedTokens[address(dao)][proposalId][
            _addressArgs[0]
        ] = _uint256ArgsProposal[1];

        // Creates the distribution proposal.
        dao.submitProposal(proposalId);

        // Saves the state of the proposal.
        createNewDistribution(
            dao,
            proposalId,
            _addressArgs,
            _uint256ArgsProposal
        );

        // Starts the voting process for the proposal.
        vars.gpVotingContract.startNewVotingForProposal(dao, proposalId, data);
        // snap funds
        vars.fundingpool.setSnapFunds(vars.fundingpool.getToken(0));
        // Sponsors the proposal.
        dao.sponsorProposal(
            proposalId,
            vars.submittedBy,
            address(vars.gpVotingContract)
        );

        ongoingDistributions[address(dao)] = proposalId;
        emit ProposalCreated(
            proposalId,
            _addressArgs[1],
            _addressArgs[0],
            _uint256ArgsProposal[1],
            _uint256ArgsProposal[0],
            _uint256ArgsProposal[2],
            _uint256ArgsProposal[3],
            block.timestamp
        );
    }

    function createNewDistribution(
        DaoRegistry dao,
        bytes32 proposalId,
        address[] calldata _addressArgs,
        uint256[] calldata _uint256ArgsProposal
    ) internal {
        distributions[address(dao)][proposalId] = Distribution(
            _addressArgs[1],
            _uint256ArgsProposal[1],
            _uint256ArgsProposal[0],
            _uint256ArgsProposal[2],
            _uint256ArgsProposal[3],
            _addressArgs[0],
            DistributionStatus.NOT_STARTED,
            0,
            block.number
        );
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
        dao.processProposal(proposalId);
        FundingPoolExtension fundingpool = FundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
        );
        StakingRiceExtension stakingrice = StakingRiceExtension(
            dao.getExtensionAddress(DaoHelper.RICE_STAKING_EXT)
        );
        // Checks if the proposal exists or is not in progress yet.
        Distribution storage distribution = distributions[address(dao)][
            proposalId
        ];
        require(
            distribution.status == DistributionStatus.NOT_STARTED,
            "proposal already completed or in progress"
        );

        // Checks if there is an ongoing proposal, only one proposal can be executed at time.
        bytes32 ongoingProposalId = ongoingDistributions[address(dao)];
        require(
            ongoingProposalId == bytes32(0) ||
                distributions[address(dao)][ongoingProposalId].status !=
                DistributionStatus.IN_PROGRESS,
            "another proposal already in progress"
        );

        // Checks if the proposal has passed.
        IGPVoting votingContract = IGPVoting(dao.votingAdapter(proposalId));
        require(address(votingContract) != address(0), "adapter not found");

        (
            IGPVoting.VotingState voteResult,
            uint128 nbYes,
            uint128 nbNo
        ) = votingContract.voteResult(dao, proposalId);
        if (voteResult == IGPVoting.VotingState.PASS) {
            distribution.status = DistributionStatus.IN_PROGRESS;
            distribution.blockNumber = block.number;
            ongoingDistributions[address(dao)] = proposalId;

            //set project sanp funds/rice to total funds/rice
            address token = fundingpool.getToken(0);
            fundingpool.setProjectSnapFunds(token);
            stakingrice.setProjectSnapRice(
                dao.getAddressConfiguration(RiceTokenAddr)
            );

            //process1. distribute fund to project team address
            fundingpool.distributeFunds(
                distribution.recipientAddr,
                token,
                distribution.requestedFundAmount
            );

            //process2. streaming pay for all valid investor
            AllocationAdapterContract allocAda = AllocationAdapterContract(
                dao.getAdapterAddress(DaoHelper.ALLOCATION_ADAPT)
            );
            allocAda.allocateProjectToken(
                dao,
                distribution.tradingOffTokenAmount,
                distribution.tokenAddr,
                distribution.lockupDate,
                distribution.fullyReleasedDate
            );
            //process3. substract from funding pool
            fundingpool.subtractAllFromBalance(
                token,
                distribution.requestedFundAmount
            );
            distribution.status = DistributionStatus.DONE;
        } else if (
            voteResult == IGPVoting.VotingState.NOT_PASS ||
            voteResult == IGPVoting.VotingState.TIE
        ) {
            distribution.status = DistributionStatus.FAILED;
        } else {
            revert("proposal has not been voted on");
        }
        ongoingDistributions[address(dao)] = bytes32(0);
        //vote finished reset snapfunds to 0
        fundingpool.resetSnapFunds();

        emit VoteResult(proposalId, voteResult, nbYes, nbNo);
    }

    /**
     * @notice Transfers the funds from the Guild account to the member's internal accounts.
     * @notice The amount of funds is caculated using the historical number of units of each member.
     * @dev A distribution proposal must be in progress.
     * @dev Only proposals that have passed the voting can be completed.
     * @dev Only active members can receive funds.
     * @param dao The dao address.
     * @param toIndex The index to control the cached for-loop.
     */
    // slither-disable-next-line reentrancy-benign
    // function distribute(DaoRegistry dao, uint256 toIndex)
    //     external
    //     override
    //     reimbursable(dao)
    // {
    //     // Checks if the proposal does not exist or is not completed yet
    //     bytes32 ongoingProposalId = ongoingDistributions[address(dao)];
    //     Distribution storage distribution = distributions[address(dao)][
    //         ongoingProposalId
    //     ];
    //     uint256 blockNumber = distribution.blockNumber;
    //     require(
    //         distribution.status == DistributionStatus.IN_PROGRESS,
    //         "distrib completed or not exist"
    //     );

    //     // Check if the given index was already processed
    //     uint256 currentIndex = distribution.currentIndex;
    //     require(currentIndex <= toIndex, "toIndex too low");

    //     address token = distribution.token;
    //     uint256 amount = distribution.amount;

    //     // Get the total number of units when the proposal was processed.
    //     BankExtension bank = BankExtension(
    //         dao.getExtensionAddress(DaoHelper.BANK)
    //     );

    //     address recipientAddr = distribution.recipientAddr;
    //     if (recipientAddr != address(0x0)) {
    //         distribution.status = DistributionStatus.DONE;
    //         _distributeOne(bank, recipientAddr, blockNumber, token, amount);
    //         //slither-disable-next-line reentrancy-events
    //         emit Distributed(address(dao), token, amount, recipientAddr);
    //     }
    // }

    /**
     * @notice Updates the holder account with the amount based on the token parameter.
     * @notice It is an internal transfer only that happens in the Bank extension.
     */
    // function _distributeOne(
    //     BankExtension bank,
    //     address unitHolderAddr,
    //     uint256 blockNumber,
    //     address token,
    //     uint256 amount
    // ) internal {
    //     uint256 memberTokens = DaoHelper.priorMemberTokens(
    //         bank,
    //         unitHolderAddr,
    //         blockNumber
    //     );
    //     require(memberTokens != 0, "not enough tokens");
    //     // Distributes the funds to 1 unit holder only
    //     bank.internalTransfer(DaoHelper.ESCROW, unitHolderAddr, token, amount);
    // }

    /**
     * @notice Updates all the holder accounts with the amount based on the token parameter.
     * @notice It is an internal transfer only that happens in the Bank extension.
     */
    // function _distributeAll(
    //     DaoRegistry dao,
    //     BankExtension bank,
    //     uint256 currentIndex,
    //     uint256 maxIndex,
    //     uint256 blockNumber,
    //     address token,
    //     uint256 amount
    // ) internal {
    //     uint256 totalTokens = DaoHelper.priorTotalTokens(bank, blockNumber);
    //     // Distributes the funds to all unit holders of the DAO and ignores non-active members.
    //     for (uint256 i = currentIndex; i < maxIndex; i++) {
    //         //slither-disable-next-line calls-loop
    //         address memberAddr = dao.getMemberAddress(i);
    //         //slither-disable-next-line calls-loop
    //         uint256 memberUnits = bank.getPriorAmount(
    //             memberAddr,
    //             DaoHelper.UNITS,
    //             blockNumber
    //         );
    //         if (memberUnits > 0) {
    //             //slither-disable-next-line calls-loop
    //             uint256 amountToDistribute = FairShareHelper.calc(
    //                 amount,
    //                 memberUnits,
    //                 totalTokens
    //             );

    //             if (amountToDistribute > 0) {
    //                 //slither-disable-next-line calls-loop
    //                 bank.internalTransfer(
    //                     DaoHelper.ESCROW,
    //                     memberAddr,
    //                     token,
    //                     amountToDistribute
    //                 );
    //             }
    //         }
    //     }
    // }
}
