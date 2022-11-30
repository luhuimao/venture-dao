pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "../../guards/AdapterGuard.sol";
import "../../guards/MemberGuard.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "./interfaces/IFlexFunding.sol";
import "./interfaces/IFlexVoting.sol";
import "../../utils/TypeConver.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

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
     * @param _fundingType The rice Stake Allocation Radio.
     */
    function configureDao(DaoRegistry dao, FundingType _fundingType)
        external
        onlyAdapter(dao)
    {
        fundingType = _fundingType;
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
                : ProposalStatus.DONE
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
        if (fundingType == FundingType.POLL) {
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
        require(fundingType == FundingType.POLL, "no need execute");
        
        return true;
    }

    function getTokenByProposalId(DaoRegistry dao, bytes32 proposalId)
        external
        view
        returns (address)
    {
        return Proposals[address(dao)][proposalId].fundingInfo.tokenAddress;
    }
}
