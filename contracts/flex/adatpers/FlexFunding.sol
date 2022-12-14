pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "../../guards/AdapterGuard.sol";
import "../../guards/MemberGuard.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "./interfaces/IFlexFunding.sol";
import "./FlexAllocation.sol";
import "./interfaces/IFlexVoting.sol";
import "../../utils/TypeConver.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract FlexFundingAdapterContract is
    IFlexFunding,
    AdapterGuard,
    MemberGuard,
    Reimbursable
{
    /*
     * PUBLIC VARIABLES
     */
    // Keeps track of all the Proposals executed per DAO.
    mapping(address => mapping(bytes32 => ProposalInfo)) public Proposals;

    // Keeps track of all the locked token amount per DAO.
    mapping(address => mapping(bytes32 => mapping(address => uint256)))
        public escrowedTokens;

    uint256 public proposalIds = 1;
    FundingType public fundingType;
    uint256 public constant RETRUN_TOKEN_AMOUNT_PRECISION = 1e18;

    error invalidParam();
    error InvalidReturnFundParams();
    error InvalidVestingParams();
    error EscrowTokenFailed();

    /**
     * @notice Configures the DAO with the Voting and Gracing periods.
     * @param dao The gp Allocation Bonus Radio.
     * @param flexFundingType The rice Stake Allocation Radio.
     */
    function configureDao(DaoRegistry dao, FundingType flexFundingType)
        external
        onlyAdapter(dao)
    {
        fundingType = flexFundingType;
        // emit ConfigureDao(gpAllocationBonusRadio, riceStakeAllocationRadio);
    }

    function submitProposal(DaoRegistry dao, ProposalParams calldata params)
        external
        override
        reimbursable(dao)
        onlyProposer(dao)
        returns (bytes32 proposalId)
    {
        if (
            params.fundingInfo.maxFundingAmount > 0 &&
            params.fundingInfo.maxFundingAmount <
            params.fundRaiseInfo.maxDepositAmount
        ) revert invalidParam();
        SubmitProposalLocalVars memory vars;

        vars.flexVotingContract = IFlexVoting(
            dao.getAdapterAddress(DaoHelper.FLEX_VOTING_ADAPT)
        );

        vars.submittedBy = vars.flexVotingContract.getSenderAddress(
            dao,
            address(this),
            bytes(""),
            msg.sender
        );

        vars.proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked("FlexFunding#", Strings.toString(proposalIds))
        );

        if (params.fundingInfo.escrow) {
            if (
                params.fundingInfo.returnTokenAddr == address(0x0) ||
                params.fundingInfo.returnTokenAmount <= 0 ||
                params.fundingInfo.approverAddr == address(0x0) ||
                params.fundingInfo.minReturnAmount <= 0
            ) revert InvalidReturnFundParams();
            if (
                params.vestInfo.vestingSteps <= 0 ||
                params.vestInfo.vestingCliffLockAmount >
                params.fundingInfo.returnTokenAmount
            ) revert InvalidVestingParams();

            // if (
            //     !_escrowToken(
            //         dao,
            //         params.fundingInfo.approverAddr,
            //         params.fundingInfo.returnTokenAddr,
            //         params.fundingInfo.minReturnAmount
            //     )
            // ) {
            //     revert EscrowTokenFailed();
            // } else {
            //     escrowedTokens[address(dao)][ vars.proposalId][
            //         params.fundingInfo.approverAddr
            //     ] = params.fundingInfo.minReturnAmount;
            // }
        }

        dao.submitProposal(vars.proposalId);

        Proposals[address(dao)][vars.proposalId] = ProposalInfo(
            msg.sender,
            FundingInfo(
                params.fundingInfo.tokenAddress,
                params.fundingInfo.minFundingAmount,
                params.fundingInfo.maxFundingAmount,
                params.fundingInfo.escrow,
                params.fundingInfo.returnTokenAddr,
                params.fundingInfo.returnTokenAmount,
                params.fundingInfo.price,
                params.fundingInfo.minReturnAmount,
                params.fundingInfo.maxReturnAmount,
                params.fundingInfo.approverAddr,
                params.fundingInfo.recipientAddr
            ),
            VestInfo(
                params.vestInfo.vestingStartTime,
                params.vestInfo.vestingCliffDuration,
                params.vestInfo.vestingStepDuration,
                params.vestInfo.vestingSteps,
                params.vestInfo.vestingCliffLockAmount
            ),
            FundRaiseInfo(
                params.fundRaiseInfo.fundRaiseType,
                params.fundRaiseInfo.fundRaiseStartTime,
                params.fundRaiseInfo.fundRaiseEndTime,
                params.fundRaiseInfo.minDepositAmount,
                params.fundRaiseInfo.maxDepositAmount,
                params.fundRaiseInfo.backerIdentification,
                params.fundRaiseInfo.bakckerIdentificationInfo,
                params.fundRaiseInfo.priorityDeposit,
                params.fundRaiseInfo.priorityDepositInfo
            ),
            ProposerRewardInfo(
                params.proposerRewardInfo.tokenRewardAmount,
                params.proposerRewardInfo.cashRewardAmount
            ),
            fundingType == FundingType.POLL ? block.timestamp : 0,
            fundingType == FundingType.POLL
                ? block.timestamp +
                    dao.getConfiguration(DaoHelper.PROPOSAL_DURATION)
                : 0,
            fundingType == FundingType.POLL
                ? ProposalStatus.IN_VOTING_PROGRESS
                : ProposalStatus.IN_FUND_RAISE_PROGRESS
        );

        // Starts the voting process for the proposal.
        vars.flexVotingContract.startNewVotingForProposal(
            dao,
            vars.proposalId,
            bytes("")
        );

        // Sponsors the guild kick proposal.
        dao.sponsorProposal(
            vars.proposalId,
            vars.submittedBy,
            dao.getAdapterAddress(DaoHelper.FLEX_VOTING_ADAPT)
        );
        proposalIds += 1;
        // register proposalId into funding pool
        vars.flexFundingPoolExt = FlexFundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FLEX_FUNDING_POOL_EXT)
        );
        if (fundingType == FundingType.DIRECT) {
            vars.flexFundingPoolExt.registerPotentialNewFundingProposal(
                vars.proposalId
            );
        }
        emit ProposalCreated(vars.proposalId, msg.sender);
    }

    function processProposal(DaoRegistry dao, bytes32 proposalId)
        external
        override
        returns (bool)
    {
        // require(fundingType == FundingType.POLL, "no need execute");
        ProcessProposalLocalVars memory vars;

        ProposalInfo storage proposal = Proposals[address(dao)][proposalId];

        if (fundingType == FundingType.POLL) {} else {
            vars.fundRaiseEndTime = proposal.fundRaiseInfo.fundRaiseEndTime;
            vars.minFundingAmount = proposal.fundingInfo.minFundingAmount;
            vars.flexFundingPoolAdapt = FlexFundingPoolAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_POOL_ADAPT)
            );
            vars.flexFundingPoolExt = FlexFundingPoolExtension(
                dao.getExtensionAddress(DaoHelper.FLEX_FUNDING_POOL_EXT)
            );
            vars.recipientAddr = proposal.fundingInfo.recipientAddr;
            vars.poolBalance = vars
                .flexFundingPoolAdapt
                .getTotalFundByProposalId(dao, proposalId);
            vars.propodalFundingToken = getTokenByProposalId(dao, proposalId);
            if (vars.fundRaiseEndTime > block.timestamp)
                revert FundRaiseEndTimeNotUP();
            dao.processProposal(proposalId);
            vars.protocolFee =
                (vars.poolBalance *
                    dao.getConfiguration(DaoHelper.FLEX_PROTOCOL_FEE)) /
                100;
            vars.managementFee = dao.getConfiguration(
                DaoHelper.FLEX_MANAGEMENT_FEE_TYPE
            ) == 0
                ? (vars.poolBalance *
                    dao.getConfiguration(
                        DaoHelper.FLEX_MANAGEMENT_FEE_AMOUNT
                    )) / 100
                : dao.getConfiguration(DaoHelper.FLEX_MANAGEMENT_FEE_AMOUNT);
            vars.proposerReward = proposal.proposerRewardInfo.cashRewardAmount;
            if (
                vars.poolBalance >=
                vars.minFundingAmount +
                    vars.protocolFee +
                    vars.managementFee +
                    vars.proposerReward
            ) {
                //1
                proposal.state = ProposalStatus.IN_EXECUTE_PROGRESS;
                //2 protocol fee
                vars.flexFundingPoolExt.withdrawFromAll(
                    proposalId,
                    dao.getAddressConfiguration(
                        DaoHelper.FLEX_PROTOCOL_FEE_RECEIVE_ADDRESS
                    ),
                    vars.propodalFundingToken,
                    vars.protocolFee
                );
                //3 management fee
                vars.flexFundingPoolExt.withdrawFromAll(
                    proposalId,
                    dao.getAddressConfiguration(
                        DaoHelper.FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS
                    ),
                    vars.propodalFundingToken,
                    vars.managementFee
                );
                //4 proposer reward
                vars.flexFundingPoolExt.withdrawFromAll(
                    proposalId,
                    proposal.proposer,
                    vars.propodalFundingToken,
                    vars.proposerReward
                );
                // 5 send funding token to recipient
                vars.flexFundingPoolExt.withdrawFromAll(
                    proposalId,
                    vars.recipientAddr,
                    vars.propodalFundingToken,
                    vars.poolBalance -
                        vars.protocolFee -
                        vars.managementFee -
                        vars.proposerReward
                );

                if (proposal.fundingInfo.escrow) {
                    // 6 calculate && update return token amount
                    proposal.fundingInfo.returnTokenAmount =
                        (vars.poolBalance / proposal.fundingInfo.price) *
                        RETRUN_TOKEN_AMOUNT_PRECISION;

                    if (
                        !_escrowToken(
                            dao,
                            proposal.fundingInfo.approverAddr,
                            proposal.fundingInfo.returnTokenAddr,
                            proposal.fundingInfo.returnTokenAmount
                        )
                    ) {
                        // revert EscrowTokenFailed();
                        proposal.state = ProposalStatus.FUND_RAISE_FAILED;
                        return false;
                    } else {
                        escrowedTokens[address(dao)][proposalId][
                            proposal.fundingInfo.approverAddr
                        ] = proposal.fundingInfo.returnTokenAmount;
                    }

                    vars.flexAllocAdapt = FlexAllocationAdapterContract(
                        dao.getAdapterAddress(DaoHelper.FLEX_ALLOCATION_ADAPT)
                    );
                    vars.returnToken = proposal.fundingInfo.returnTokenAddr;
                    vars.proposer = proposal.proposer;
                    vars.returnTokenAmount = proposal
                        .fundingInfo
                        .minReturnAmount;
                    IERC20(proposal.fundingInfo.returnTokenAddr).approve(
                        dao.getAdapterAddress(DaoHelper.FLEX_ALLOCATION_ADAPT),
                        vars.returnTokenAmount
                    );
                    vars.flexAllocAdapt.allocateProjectToken(
                        dao,
                        vars.returnToken,
                        vars.proposer,
                        proposalId,
                        [
                            vars.returnTokenAmount,
                            proposal.vestInfo.vestingStartTime,
                            proposal.vestInfo.vestingCliffDuration,
                            proposal.vestInfo.vestingStepDuration,
                            proposal.vestInfo.vestingSteps
                        ]
                    );
                } else {
                    vars.flexAllocAdapt = FlexAllocationAdapterContract(
                        dao.getAdapterAddress(DaoHelper.FLEX_ALLOCATION_ADAPT)
                    );
                    vars.flexAllocAdapt.noEscrow(dao, proposalId);
                }

                //7 substract
                vars.flexFundingPoolExt.substractFromAll(
                    proposalId,
                    vars.poolBalance
                );

                proposal.state = ProposalStatus.DONE;
            } else {
                // didt meet the min funding amount
                proposal.state = ProposalStatus.FUND_RAISE_FAILED;
                return false;
            }
        }

        return true;
    }

    function retrunTokenToApprover(DaoRegistry dao, bytes32 proposalId)
        external
        reimbursable(dao)
    {
        uint256 escrowedTokenAmount = escrowedTokens[address(dao)][proposalId][
            msg.sender
        ];
        require(
            escrowedTokenAmount > 0,
            "Flex Funding::retrunTokenToApprover::no fund to return"
        );
        ProposalInfo storage proposal = Proposals[address(dao)][proposalId];
        IERC20 erc20 = IERC20(proposal.fundingInfo.returnTokenAddr);
        require(
            erc20.balanceOf(address(this)) >= escrowedTokenAmount,
            "Flex Funding::retrunTokenToApprover::Insufficient Funds"
        );

        require(
            proposal.state == ProposalStatus.FUND_RAISE_FAILED,
            "Flex Funding::retrunTokenToApprover::cant return"
        );
        escrowedTokens[address(dao)][proposalId][msg.sender] = 0;
        erc20.transfer(msg.sender, escrowedTokenAmount);
    }

    function getTokenByProposalId(DaoRegistry dao, bytes32 proposalId)
        public
        view
        returns (address)
    {
        return Proposals[address(dao)][proposalId].fundingInfo.tokenAddress;
    }

    function getFundRaiseTimes(DaoRegistry dao, bytes32 proposalId)
        external
        view
        returns (uint256 fundRaiseStartTime, uint256 fundRaiseEndTime)
    {
        fundRaiseStartTime = Proposals[address(dao)][proposalId]
            .fundRaiseInfo
            .fundRaiseStartTime;
        fundRaiseEndTime = Proposals[address(dao)][proposalId]
            .fundRaiseInfo
            .fundRaiseEndTime;
    }

    function getFundRaiseType(DaoRegistry dao, bytes32 proposalId)
        external
        view
        returns (FundRaiseType)
    {
        return Proposals[address(dao)][proposalId].fundRaiseInfo.fundRaiseType;
    }

    function getMaxFundingAmount(DaoRegistry dao, bytes32 proposalId)
        external
        view
        returns (uint256)
    {
        return Proposals[address(dao)][proposalId].fundingInfo.maxFundingAmount;
    }

    function getMinFundingAmount(DaoRegistry dao, bytes32 proposalId)
        external
        view
        returns (uint256)
    {
        return Proposals[address(dao)][proposalId].fundingInfo.minFundingAmount;
    }

    function getProposalState(DaoRegistry dao, bytes32 proposalId)
        external
        view
        returns (ProposalStatus)
    {
        return Proposals[address(dao)][proposalId].state;
    }

    function getDepositAmountLimit(DaoRegistry dao, bytes32 proposalId)
        external
        view
        returns (uint256 minDepositAmount, uint256 maxDepositAmount)
    {
        minDepositAmount = Proposals[address(dao)][proposalId]
            .fundRaiseInfo
            .minDepositAmount;
        maxDepositAmount = Proposals[address(dao)][proposalId]
            .fundRaiseInfo
            .maxDepositAmount;
    }

    /*
     * INTERNAL
     */

    function _escrowToken(
        DaoRegistry dao,
        address approver,
        address returnToken,
        uint256 escorwAmount
    ) internal returns (bool) {
        IERC20 erc20 = IERC20(returnToken);
        if (
            erc20.balanceOf(approver) < escorwAmount ||
            erc20.allowance(approver, address(this)) < escorwAmount
        ) {
            return false;
        }

        //20220916 fix potential bugs
        uint256 oldAllowance = erc20.allowance(
            address(this),
            dao.getAdapterAddress(DaoHelper.ALLOCATION_ADAPTV2)
        );
        uint256 newAllowance = oldAllowance + escorwAmount;
        //approve to AllocationAdapter contract
        erc20.approve(
            dao.getAdapterAddress(DaoHelper.ALLOCATION_ADAPTV2),
            newAllowance
        );
        erc20.transferFrom(approver, address(this), escorwAmount);
        return true;
    }
}
