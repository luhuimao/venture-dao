pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "../../guards/AdapterGuard.sol";
import "../../guards/MemberGuard.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "./interfaces/IFlexFunding.sol";
import "../../adapters/interfaces/IGPVoting.sol";
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

    function submitProposal(DaoRegistry dao, ProposalParams calldata params)
        external
        override
        reimbursable(dao)
        onlyProposer(dao)
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

        vars.proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked("Flex Funding # ", Strings.toString(proposalIds))
        );

        dao.submitProposal(vars.proposalId);

        Proposals[address(dao)][vars.proposalId] = ProposalInfo(
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
            )
        );
    }

    function processProposal(DaoRegistry dao, bytes32 proposalId)
        external
        override
        returns (bool)
    {
        return true;
    }
}
