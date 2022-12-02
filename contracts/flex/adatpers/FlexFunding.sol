pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "../../guards/AdapterGuard.sol";
import "../../guards/MemberGuard.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "./interfaces/IFlexFunding.sol";
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
    /*
     * PUBLIC VARIABLES
     */
    // Keeps track of all the Proposals executed per DAO.
    mapping(address => mapping(bytes32 => ProposalInfo)) public Proposals;
    uint256 public proposalIds = 1;
    FundingType public fundingType;

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
                params.proposerRewardInfo.cashRewardAmount,
                params.proposerRewardInfo.cashRewardAmount
            ),
            block.timestamp,
            block.timestamp + dao.getConfiguration(DaoHelper.PROPOSAL_DURATION),
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

            if (vars.poolBalance >= vars.minFundingAmount) {
                //1
                proposal.state = ProposalStatus.IN_EXECUTE_PROGRESS;
                //2 protocol fee
                vars.protocolFee =
                    (vars.poolBalance *
                        dao.getConfiguration(DaoHelper.FLEX_PROTOCOL_FEE)) /
                    100;
                vars.flexFundingPoolExt.withdrawFromAll(
                    proposalId,
                    dao.getAddressConfiguration(
                        DaoHelper.FLEX_PROTOCOL_FEE_RECEIVE_ADDRESS
                    ),
                    vars.propodalFundingToken,
                    vars.protocolFee
                );
                //3 management fee
                vars.managementFee = dao.getConfiguration(
                    DaoHelper.FLEX_MANAGEMENT_FEE_TYPE
                ) == 0
                    ? (vars.poolBalance *
                        dao.getConfiguration(
                            DaoHelper.FLEX_MANAGEMENT_FEE_AMOUNT
                        )) / 100
                    : dao.getConfiguration(
                        DaoHelper.FLEX_MANAGEMENT_FEE_AMOUNT
                    );
                vars.flexFundingPoolExt.withdrawFromAll(
                    proposalId,
                    dao.getAddressConfiguration(
                        DaoHelper.FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS
                    ),
                    vars.propodalFundingToken,
                    vars.managementFee
                );
                //4 proposer reward

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

                //6 substract
                vars.flexFundingPoolExt.substractFromAll(
                    proposalId,
                    vars.poolBalance
                );

                if (proposal.fundingInfo.escrow) {}
                proposal.state = ProposalStatus.DONE;
            } else {
                // didt meet the min funding amount
                proposal.state = ProposalStatus.FAILED;
            }
        }
        dao.processProposal(proposalId);

        return true;
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
}
