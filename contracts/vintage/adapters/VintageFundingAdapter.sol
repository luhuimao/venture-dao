pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

// import "../guards/AdapterGuard.sol";
// import "../guards/MemberGuard.sol";
import "../../guards/RaiserGuard.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "./VintageAllocationAdapter.sol";
import "./interfaces/IVintageFunding.sol";
import "./VintageVoting.sol";
import "../../helpers/DaoHelper.sol";
import "../../helpers/GovernanceHelper.sol";
import "../../utils/TypeConver.sol";
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

contract VintageFundingAdapterContract is
    IVintageFunding,
    AdapterGuard,
    RaiserGuard,
    Reimbursable
{
    using DoubleEndedQueue for DoubleEndedQueue.Bytes32Deque;

    // Keeps track of all the proposal executed per DAO.
    mapping(address => mapping(bytes32 => ProposalInfo)) public proposals;

    // Keeps track of all the locked token amount per DAO.
    mapping(address => mapping(bytes32 => mapping(address => uint256)))
        public projectTeamLockedTokens;
    // Keeps track of the latest ongoing distribution proposal per DAO to ensure only 1 proposal can be processed at a time.
    mapping(address => bytes32) public ongoingProposal;
    // vote types for proposal
    // mapping(bytes32 => DaoHelper.VoteType) public proposalVoteTypes;
    mapping(address => DoubleEndedQueue.Bytes32Deque) public proposalQueue;
    // DoubleEndedQueue.Bytes32Deque public proposalQueue;

    string constant PROPOSALID_PREFIX = "Funding#";
    uint256 public proposalIds = 1;
    uint256 public constant PERCENTAGE_PRECISION = 1e18;

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
        uint256 lockAmount
    ) internal returns (bool) {
        IERC20 erc20 = IERC20(returnToken);

        if (
            erc20.balanceOf(approver) < lockAmount ||
            erc20.allowance(approver, address(this)) < lockAmount
        ) {
            return false;
        }

        //20220916 fix potential bugs
        uint256 oldAllowance = erc20.allowance(
            address(this),
            dao.getAdapterAddress(DaoHelper.VINTAGE_ALLOCATION_ADAPTER)
        );
        uint256 newAllowance = oldAllowance + lockAmount;
        //approve to AllocationAdapter contract
        erc20.approve(
            dao.getAdapterAddress(DaoHelper.VINTAGE_ALLOCATION_ADAPTER),
            newAllowance
        );
        erc20.transferFrom(approver, address(this), lockAmount);
        return true;
    }

    function unLockProjectTeamToken(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        uint256 lockedTokenAmount = projectTeamLockedTokens[address(dao)][
            proposalId
        ][msg.sender];
        require(
            lockedTokenAmount > 0,
            "VintageFunding::unLockProjectTeamToken::no fund to unlock"
        );

        ProposalInfo storage proposal = proposals[address(dao)][proposalId];
        IERC20 erc20 = IERC20(proposal.proposalReturnTokenInfo.returnToken);
        require(
            erc20.balanceOf(address(this)) >= lockedTokenAmount,
            "VintageFunding::unLockProjectTeamToken::Insufficient Fund"
        );

        require(
            proposal.status == IVintageFunding.ProposalState.FAILED,
            "VintageFunding::unLockProjectTeamToken::not satisfied"
        );
        projectTeamLockedTokens[address(dao)][proposalId][msg.sender] = 0;
        erc20.transfer(msg.sender, lockedTokenAmount);
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
        FundingProposalParams calldata params
    )
        external
        override
        onlyRaiser(dao)
        reimbursable(dao)
        returns (bytes32 proposalId)
    {
        SubmitProposalLocalVars memory vars;

        vars.fundingPoolAdapt = VintageFundingPoolAdapterContract(
            dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_POOL_ADAPT)
        );
        vars.fundingPoolAdapt.processFundRaise(dao);
        require(
            vars.fundingPoolAdapt.daoFundRaisingStates(address(dao)) ==
                DaoHelper.FundRaiseState.DONE &&
                block.timestamp > vars.fundingPoolAdapt.getFundStartTime(dao) &&
                block.timestamp < vars.fundingPoolAdapt.getFundEndTime(dao),
            "Funding::submitProposal::only can submit proposal in investing period"
        );

        vars.votingContract = IVintageVoting(
            dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );

        vars.submittedBy = vars.votingContract.getSenderAddress(
            dao,
            address(this),
            bytes(""),
            msg.sender
        );

        vars.fundingAmount = params.fundingInfo.fundingAmount;

        if (params.returnTokenInfo.escrow) {
            require(
                params.vestInfo.vestingStartTime > 0 &&
                    params.vestInfo.vetingEndTime >=
                    params.vestInfo.vestingStartTime &&
                    params.vestInfo.vestingCliffEndTime >=
                    params.vestInfo.vestingStartTime &&
                    params.vestInfo.vestingCliffEndTime <=
                    params.vestInfo.vetingEndTime &&
                    params.vestInfo.vestingInterval > 0,
                "Funding::submitProposal::vesting time invalid"
            );
            require(
                params.returnTokenInfo.price > 0,
                "Funding::submitProposal::price must > 0"
            );
            vars.returnTokenAmount =
                (vars.fundingAmount * DaoHelper.TOKEN_AMOUNT_PRECISION) /
                params.returnTokenInfo.price;
            if (
                params.vestInfo.vestingCliffLockAmount >
                DaoHelper.TOKEN_AMOUNT_PRECISION
            ) revert("invalid vesting cliff amount");
            require(
                vars.returnTokenAmount > 0,
                "Funding::submitProposal::invalid return token token Amount"
            );
        }

        require(
            vars.fundingAmount > 0,
            "Funding::submitProposal::invalid funding token Amount"
        );

        require(
            params.fundingInfo.receiver != address(0x0),
            "Funding::submitProposal::invalid receiver address"
        );

        vars.proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(PROPOSALID_PREFIX, Strings.toString(proposalIds))
        );
        // Creates the distribution proposal.
        dao.submitProposal(vars.proposalId);

        // Saves the state of the proposal.
        createProposal(
            dao,
            vars.proposalId,
            params,
            vars.returnTokenAmount,
            msg.sender
        );

        vars.proposalInQueueTimestamp = block.timestamp;

        // Sponsors the proposal.
        dao.sponsorProposal(
            vars.proposalId,
            vars.submittedBy,
            address(vars.votingContract)
        );

        //Inserts proposal at the end of the queue.
        proposalQueue[address(dao)].pushBack(vars.proposalId);

        proposalIds += 1;
        emit ProposalCreated(
            address(dao),
            vars.proposalId,
            params.vestInfo.vestingStartTime,
            params.vestInfo.vetingEndTime,
            params.vestInfo.vestingCliffEndTime,
            params.vestInfo.vestingCliffLockAmount,
            params.vestInfo.vestingInterval,
            vars.proposalInQueueTimestamp
        );
    }

    function createProposal(
        DaoRegistry dao,
        bytes32 proposalId,
        FundingProposalParams calldata params,
        uint256 returnTokenAmount,
        address proposer
    ) internal {
        VintageFundingPoolAdapterContract fundingPoolAdapt = VintageFundingPoolAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_POOL_ADAPT)
            );
        uint256 totalFund = (params.fundingInfo.fundingAmount *
            PERCENTAGE_PRECISION) /
            (PERCENTAGE_PRECISION -
                (fundingPoolAdapt.protocolFee() +
                    dao.getConfiguration(DaoHelper.MANAGEMENT_FEE) +
                    dao.getConfiguration(
                        DaoHelper.VINTAGE_PROPOSER_TOKEN_REWARD_RADIO
                    )));
        proposals[address(dao)][proposalId] = ProposalInfo(
            params.fundingInfo.fundingToken,
            params.fundingInfo.fundingAmount,
            totalFund,
            params.returnTokenInfo.price,
            params.fundingInfo.receiver,
            proposer,
            IVintageFunding.ProposalState.IN_QUEUE,
            IVintageFunding.VestInfo(
                params.vestInfo.vestingStartTime,
                params.vestInfo.vetingEndTime,
                params.vestInfo.vestingCliffEndTime,
                params.vestInfo.vestingCliffLockAmount,
                params.vestInfo.vestingInterval
            ),
            ProposalReturnTokenInfo(
                params.returnTokenInfo.escrow,
                params.returnTokenInfo.returnToken,
                returnTokenAmount,
                params.returnTokenInfo.approver
            ),
            ProposalTimeInfo(block.timestamp, 0, 0, 0)
        );
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
    ) external reimbursable(dao) onlyRaiser(dao) returns (bool) {
        //  queue is empty
        if (proposalQueue[address(dao)].length() <= 0) {
            return false;
        }

        //proposalId must get from begining of the queue
        require(
            proposalId == proposalQueue[address(dao)].front(),
            "Funding::startVotingProcess::Invalid ProposalId"
        );
        StartVotingLocalVars memory vars;
        vars.ongongingPrposalId = ongoingProposal[address(dao)];
        // make sure there is no proposal no finalized
        if (vars.ongongingPrposalId != bytes32(0)) {
            require(
                proposals[address(dao)][vars.ongongingPrposalId].status ==
                    IVintageFunding.ProposalState.DONE ||
                    proposals[address(dao)][vars.ongongingPrposalId].status ==
                    IVintageFunding.ProposalState.FAILED,
                "Funding::startVotingProcess::there is other proposal not finalized"
            );
        }

        vars.fundingpoolExt = VintageFundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.VINTAGE_FUNDING_POOL_EXT)
        );
        vars.fundingPoolAdapt = VintageFundingPoolAdapterContract(
            dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_POOL_ADAPT)
        );
        vars._propsalStartVotingTimestamp = block.timestamp;
        vars._propsalStopVotingTimestamp =
            vars._propsalStartVotingTimestamp +
            dao.getConfiguration(DaoHelper.VOTING_PERIOD);
        //make sure there is no proposal in progress during redempt duration
        require(
            !vars.fundingPoolAdapt.ifInRedemptionPeriod(
                dao,
                vars._propsalStopVotingTimestamp +
                    dao.getConfiguration(DaoHelper.PROPOSAL_EXECUTE_DURATION)
            ),
            "Funding::startVotingProcess::cant start vote now"
        );

        ProposalInfo storage proposal = proposals[address(dao)][proposalId];

        if (proposal.status != IVintageFunding.ProposalState.IN_QUEUE)
            return false;

        //Removes the proposalId at the beginning of the queue
        proposalQueue[address(dao)].popFront();

        if (vars.fundingpoolExt.totalSupply() < proposal.totalAmount) {
            proposal.status = IVintageFunding.ProposalState.FAILED;
            emit StartVote(
                address(dao),
                proposalId,
                0,
                0,
                IVintageFunding.ProposalState.FAILED
            );
            return false;
        }
        // proposal.totalAmount = vars.totalFund;
        if (proposal.proposalReturnTokenInfo.escrow) {
            //lock project token
            vars.rel = _lockProjectTeamToken(
                dao,
                proposal.proposalReturnTokenInfo.approveOwnerAddr,
                proposal.proposalReturnTokenInfo.returnToken,
                proposal.proposalReturnTokenInfo.returnTokenAmount
            );
            // lock project token failed
            if (!vars.rel) {
                proposal.status = IVintageFunding.ProposalState.FAILED;
                emit StartVote(
                    address(dao),
                    proposalId,
                    0,
                    0,
                    IVintageFunding.ProposalState.FAILED
                );
                return false;
            }
            projectTeamLockedTokens[address(dao)][proposalId][
                proposal.proposalReturnTokenInfo.approveOwnerAddr
            ] = proposal.proposalReturnTokenInfo.returnTokenAmount;
        }

        vars.votingContract = IVintageVoting(
            dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );
        proposal.proposalTimeInfo.proposalStartVotingTimestamp = vars
            ._propsalStartVotingTimestamp;
        proposal.proposalTimeInfo.proposalStopVotingTimestamp = vars
            ._propsalStopVotingTimestamp;

        // Starts the voting process for the proposal. setting voting start time
        vars.votingContract.startNewVotingForProposal(
            dao,
            proposalId,
            block.timestamp,
            bytes("")
        );

        ongoingProposal[address(dao)] = proposalId;

        proposal.status = IVintageFunding.ProposalState.IN_VOTING_PROGRESS;
        emit StartVote(
            address(dao),
            proposalId,
            vars._propsalStartVotingTimestamp,
            vars._propsalStopVotingTimestamp,
            IVintageFunding.ProposalState.IN_VOTING_PROGRESS
        );
        return true;
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
            require(
                proposalId == vars.ongoingProposalId,
                "Funding::processProposal::invalid prposalId"
            );
        }
        ProposalInfo storage proposal = proposals[address(dao)][proposalId];

        require(
            block.timestamp >
                proposal.proposalTimeInfo.proposalStopVotingTimestamp,
            "Funding::processProposal::proposal in voting period"
        );
        require(
            proposal.status !=
                IVintageFunding.ProposalState.IN_EXECUTE_PROGRESS,
            "Funding::processProposal::proposal already in execute progress"
        );

        dao.processProposal(proposalId);
        vars.fundingpool = VintageFundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.VINTAGE_FUNDING_POOL_EXT)
        );

        // Checks if the proposal has passed.
        vars.votingContract = VintageVotingContract(
            dao.votingAdapter(proposalId)
        );
        require(
            address(vars.votingContract) != address(0x0),
            "Funding::processProposal::adapter not found"
        );

        vars.allVotingWeight = GovernanceHelper.getAllRaiserVotingWeight(dao);
        (vars.voteResult, vars.nbYes, vars.nbNo) = vars
            .votingContract
            .voteResult(dao, proposalId);

        if (vars.voteResult == IVintageVoting.VotingState.PASS) {
            proposal.status = IVintageFunding.ProposalState.IN_EXECUTE_PROGRESS;
            ongoingProposal[address(dao)] = proposalId;
            vars.fundRaiseTokenAddr = vars
                .fundingpool
                .getFundRaisingTokenAddress();
            vars.fundingPoolAdapt = VintageFundingPoolAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_POOL_ADAPT)
            );
            //insufficient funds failed the distribution
            vars.managementFee =
                (proposal.totalAmount *
                    dao.getConfiguration(DaoHelper.MANAGEMENT_FEE)) /
                PERCENTAGE_PRECISION;

            vars.protocolFee =
                (proposal.totalAmount * vars.fundingPoolAdapt.protocolFee()) /
                PERCENTAGE_PRECISION;

            vars.proposerFundReward =
                (proposal.totalAmount *
                    dao.getConfiguration(
                        DaoHelper.VINTAGE_PROPOSER_FUND_REWARD_RADIO
                    )) /
                PERCENTAGE_PRECISION;

            if (vars.fundingpool.totalSupply() < proposal.totalAmount) {
                proposal.status = IVintageFunding.ProposalState.FAILED;
            } else {
                //process1. distribute fund to project team address
                distributeFundToProductTeam(
                    dao,
                    proposal.recipientAddr,
                    proposal.fundingAmount
                );

                if (vars.managementFee > 0) {
                    //process2. distribute management fee to GP
                    distributeManagementFeeToGP(dao, vars.managementFee);
                }

                //process3. distribute protocol fee to DaoSquare
                distributeProtocolFeeToDaoSquare(dao, vars.protocolFee);

                if (vars.proposerFundReward > 0) {
                    //process4. distribute proposer fund reward to proposer
                    distributeProposerFundRewardToProposer(
                        dao,
                        proposal.proposer,
                        vars.proposerFundReward
                    );
                }
                if (proposal.proposalReturnTokenInfo.escrow) {
                    //process5. snap vest info for all eligible investor
                    snapShotVestingInfo(dao, proposalId);

                    //process6. set  projectTeamLockedToken to 0
                    projectTeamLockedTokens[address(dao)][proposalId][
                        proposal.recipientAddr
                    ] = 0;
                }

                //process7. substract from funding pool
                subFromFundPool(
                    dao,
                    proposal.fundingAmount,
                    vars.protocolFee,
                    vars.managementFee,
                    vars.proposerFundReward
                );

                //process8. set proposal state
                proposal.status = IVintageFunding.ProposalState.DONE;
            }
        } else if (
            vars.voteResult == IVintageVoting.VotingState.NOT_PASS ||
            vars.voteResult == IVintageVoting.VotingState.TIE
        ) {
            proposal.status = IVintageFunding.ProposalState.FAILED;
        } else {
            revert("Funding::processProposal::voting not finalized");
        }
        proposal.proposalTimeInfo.proposalExecuteTimestamp = block.timestamp;
        ongoingProposal[address(dao)] = bytes32(0);

        emit ProposalExecuted(
            address(dao),
            proposalId,
            uint256(vars.voteResult),
            vars.allVotingWeight,
            vars.nbYes,
            vars.nbNo,
            uint256(proposal.status)
        );

        return true;
    }

    function distributeFundToProductTeam(
        DaoRegistry dao,
        address recipientAddr,
        uint256 fundingAmount
    ) internal {
        VintageFundingPoolExtension fundingpoolExt = VintageFundingPoolExtension(
                dao.getExtensionAddress(DaoHelper.VINTAGE_FUNDING_POOL_EXT)
            );
        // address fundRaiseTokenAddr = fundingpoolExt
        //     .getFundRaisingTokenAddress();
        fundingpoolExt.distributeFunds(
            recipientAddr,
            fundingpoolExt.getFundRaisingTokenAddress(),
            fundingAmount
        );
    }

    function distributeManagementFeeToGP(
        DaoRegistry dao,
        uint256 managementFee
    ) internal {
        VintageFundingPoolExtension fundingpoolExt = VintageFundingPoolExtension(
                dao.getExtensionAddress(DaoHelper.VINTAGE_FUNDING_POOL_EXT)
            );
        // address fundRaiseTokenAddr = fundingpoolExt
        //     .getFundRaisingTokenAddress();

        fundingpoolExt.distributeFunds(
            dao.getAddressConfiguration(DaoHelper.GP_ADDRESS),
            fundingpoolExt.getFundRaisingTokenAddress(),
            managementFee
        );
    }

    function distributeProtocolFeeToDaoSquare(
        DaoRegistry dao,
        uint256 protocolFee
    ) internal {
        VintageFundingPoolExtension fundingpoolExt = VintageFundingPoolExtension(
                dao.getExtensionAddress(DaoHelper.VINTAGE_FUNDING_POOL_EXT)
            );

        // address fundRaiseTokenAddr = fundingpoolExt
        //     .getFundRaisingTokenAddress();
        fundingpoolExt.distributeFunds(
            protocolAddress,
            fundingpoolExt.getFundRaisingTokenAddress(),
            protocolFee
        );
    }

    function distributeProposerFundRewardToProposer(
        DaoRegistry dao,
        address proposer,
        uint256 proposerFundReward
    ) internal {
        VintageFundingPoolExtension fundingpoolExt = VintageFundingPoolExtension(
                dao.getExtensionAddress(DaoHelper.VINTAGE_FUNDING_POOL_EXT)
            );

        // address fundRaiseTokenAddr = fundingpoolExt
        //     .getFundRaisingTokenAddress();

        fundingpoolExt.distributeFunds(
            proposer,
            fundingpoolExt.getFundRaisingTokenAddress(),
            proposerFundReward
        );
    }

    function subFromFundPool(
        DaoRegistry dao,
        uint256 fundingAmount,
        uint256 protocolFee,
        uint256 managementFee,
        uint256 proposerFundReward
    ) internal {
        VintageFundingPoolExtension fundingpoolExt = VintageFundingPoolExtension(
                dao.getExtensionAddress(DaoHelper.VINTAGE_FUNDING_POOL_EXT)
            );
        VintageFundingPoolAdapterContract fundingPoolAdapt = VintageFundingPoolAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_POOL_ADAPT)
            );
        // address fundRaiseTokenAddr = fundingpoolExt
        //     .getFundRaisingTokenAddress();

        fundingpoolExt.subtractAllFromBalance(
            fundingpoolExt.getFundRaisingTokenAddress(),
            fundingAmount + protocolFee + managementFee + proposerFundReward
        );
    }

    function snapShotVestingInfo(DaoRegistry dao, bytes32 proposalId) internal {
        VintageAllocationAdapterContract allocAda = VintageAllocationAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_ALLOCATION_ADAPTER)
            );
        ProposalInfo storage proposal = proposals[address(dao)][proposalId];

        uint256[6] memory uint256Args = [
            proposal.proposalReturnTokenInfo.returnTokenAmount,
            proposal.vestInfo.vestingStartTime,
            proposal.vestInfo.vetingEndTime,
            proposal.vestInfo.vestingCliffEndTime,
            proposal.vestInfo.vestingCliffLockAmount,
            proposal.vestInfo.vestingInterval
        ];
        allocAda.allocateProjectToken(
            dao,
            proposal.proposalReturnTokenInfo.returnToken,
            proposal.proposer,
            proposalId,
            uint256Args
        );
    }

    /**
     * Public read-only functions
     */

    function getFrontProposalId(
        DaoRegistry dao
    ) external view returns (bytes32) {
        return proposalQueue[address(dao)].front();
    }

    function getQueueLength(DaoRegistry dao) external view returns (uint256) {
        return proposalQueue[address(dao)].length();
    }
}
