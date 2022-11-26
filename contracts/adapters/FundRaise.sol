pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../core/DaoRegistry.sol";
import "../guards/AdapterGuard.sol";
import "../guards/MemberGuard.sol";
import "./modifiers/Reimbursable.sol";
import "./interfaces/IGPVoting.sol";
// import "./AllocationAdapterV2.sol";
import "./interfaces/IFundRaise.sol";
import "./voting/GPVoting.sol";
import "../helpers/FairShareHelper.sol";
import "../helpers/DaoHelper.sol";
import "../extensions/bank/Bank.sol";
import "./FundingPoolAdapter.sol";
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

contract FundRaiseAdapterContract is
    IFundRaise,
    AdapterGuard,
    MemberGuard,
    Reimbursable
{
    /*
     * PUBLIC VARIABLES
     */
    // Keeps track of all the Proposals executed per DAO.
    mapping(address => mapping(bytes32 => ProposalDetails)) public Proposals;
    uint256 public proposalIds = 100020;
    bytes32 public latestProposalId;
    bytes32 public previousProposalId;
    /*
     * STRUCTURES
     */
    struct SubmitProposalLocalVars {
        uint256 lastFundEndTime;
        IGPVoting gpVotingContract;
        address fundRaiseTokenAddr;
        address managementFeeAddress;
        address submittedBy;
        bytes32 proposalId;
        uint256 fundRaiseTarget;
        uint256 fundRaiseMaxAmount;
        uint256 lpMinDepositAmount;
        uint256 lpMaxDepositAmount;
        uint256 fundRaiseStartTime;
        uint256 fundRaiseEndTime;
        uint256 fundTerm;
        uint256 redemptPeriod;
        uint256 redemptDuration;
        uint256 returnDuration;
        uint256 proposerRewardRatio;
        uint256 managementFeeRatio;
        uint256 redepmtFeeRatio;
        uint256 protocolFeeRatio;
        FundingPoolAdapterContract fundingPoolAdapt;
    }

    /** 
    _uint256ArgsProposal[0]:fundRaiseTarget
    _uint256ArgsProposal[1]:fundRaiseMaxAmount
    _uint256ArgsProposal[2]:lpMinDepositAmount
    _uint256ArgsProposal[3]:lpMaxDepositAmount
    _uint256ArgsTimeInfo[0]:fundRaiseStartTime
    _uint256ArgsTimeInfo[1]:fundRaiseEndTime
    _uint256ArgsTimeInfo[2]:fundTerm
    _uint256ArgsTimeInfo[3]:redemptPeriod
    _uint256ArgsTimeInfo[4]:redemptDuration
    _uint256ArgsTimeInfo[5]:returnDuration
    _uint256ArgsFeeInfo[0]:proposerRewardRatio
    _uint256ArgsFeeInfo[1]:managementFeeRatio
    _uint256ArgsFeeInfo[2]:redepmtFeeRatio
    _uint256ArgsFeeInfo[3]:protocolFeeRatio
    _addressArgs[0]:managementFeeAddress
    _addressArgs[1]:fundRaiseTokenAddress
    */
    function submitProposal(
        DaoRegistry dao,
        uint256[] calldata _uint256ArgsProposal,
        uint256[] calldata _uint256ArgsTimeInfo,
        uint256[] calldata _uint256ArgsFeeInfo,
        address[] calldata _addressArgs
    ) external override reimbursable(dao) onlyGeneralPartner(dao) {
        SubmitProposalLocalVars memory vars;

        vars.lastFundEndTime = dao.getConfiguration(DaoHelper.FUND_END_TIME);
        vars.returnDuration = dao.getConfiguration(DaoHelper.RETURN_DURATION);
        vars.fundingPoolAdapt = FundingPoolAdapterContract(
            dao.getAdapterAddress(DaoHelper.FUNDING_POOL_ADAPT)
        );
        require(
            vars.fundingPoolAdapt.fundRaisingState() ==
                DaoHelper.FundRaiseState.FAILED ||
                (vars.fundingPoolAdapt.fundRaisingState() ==
                    DaoHelper.FundRaiseState.DONE &&
                    block.timestamp >
                    vars.lastFundEndTime + vars.returnDuration),
            "FundRaise::submitProposal::cant submit fund raise proposal now"
        );
        require(
            _uint256ArgsProposal.length == 4 &&
                _uint256ArgsTimeInfo.length == 6 &&
                _uint256ArgsFeeInfo.length == 4 &&
                _addressArgs.length == 2,
            "FundRaise::submitProposal::invalid parameter number"
        );

        // vars.fundRaiseTokenAddr = dao.getAddressConfiguration(
        //     DaoHelper.FUND_RAISING_CURRENCY_ADDRESS
        // );
        vars.managementFeeAddress = _addressArgs[0];
        vars.fundRaiseTokenAddr = _addressArgs[1];

        vars.fundRaiseTarget = _uint256ArgsProposal[0];
        vars.fundRaiseMaxAmount = _uint256ArgsProposal[1];
        vars.lpMinDepositAmount = _uint256ArgsProposal[2];
        vars.lpMaxDepositAmount = _uint256ArgsProposal[3];

        vars.fundRaiseStartTime = _uint256ArgsTimeInfo[0];
        vars.fundRaiseEndTime = _uint256ArgsTimeInfo[1];
        vars.fundTerm = _uint256ArgsTimeInfo[2];
        vars.redemptPeriod = _uint256ArgsTimeInfo[3];
        vars.redemptDuration = _uint256ArgsTimeInfo[4];
        vars.returnDuration = _uint256ArgsTimeInfo[5];

        vars.proposerRewardRatio = _uint256ArgsFeeInfo[0];
        vars.managementFeeRatio = _uint256ArgsFeeInfo[1];
        vars.redepmtFeeRatio = _uint256ArgsFeeInfo[2];
        vars.protocolFeeRatio = _uint256ArgsFeeInfo[3];
        require(
            vars.fundRaiseTarget > 0 && //fundRaiseTarget must > 0
                vars.fundRaiseMaxAmount > vars.fundRaiseTarget && // max amount > target
                vars.lpMinDepositAmount > 0 && // minimal deposit amount > 0
                vars.lpMaxDepositAmount > vars.lpMinDepositAmount && // max deposit amount > min deposit amount
                vars.fundRaiseStartTime > 0 && //fundRaiseStartTime must > 0
                vars.fundRaiseEndTime > vars.fundRaiseStartTime && //fundRaiseEndTime must > fundRaiseStartTime
                vars.fundTerm > 0 && //fundTerm must > 0
                vars.redemptPeriod > 0 && //redemptPeriod must > 0
                vars.redemptDuration > 0 && //redemptDuration must > 0
                vars.proposerRewardRatio < 100 &&
                vars.proposerRewardRatio >= 0 &&
                vars.managementFeeRatio < 100 &&
                vars.managementFeeRatio >= 0 &&
                vars.redepmtFeeRatio < 100 &&
                vars.redepmtFeeRatio >= 0 &&
                vars.protocolFeeRatio < 100 &&
                vars.protocolFeeRatio >= 0,
            "FundRaise::submitProposal::invalid parameter"
        );
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
            abi.encodePacked("TFRP#", Strings.toString(proposalIds))
        );

        dao.submitProposal(vars.proposalId);

        // Saves the state of the proposal.
        Proposals[address(dao)][vars.proposalId] = ProposalDetails(
            vars.fundRaiseTokenAddr,
            vars.fundRaiseTarget,
            vars.fundRaiseMaxAmount,
            vars.lpMinDepositAmount,
            vars.lpMaxDepositAmount,
            FundRiaseTimeInfo(
                vars.fundRaiseStartTime,
                vars.fundRaiseEndTime,
                vars.fundTerm,
                vars.redemptPeriod,
                vars.redemptDuration,
                vars.returnDuration
            ),
            FundRaiseRewardAndFeeInfo(
                vars.proposerRewardRatio,
                vars.managementFeeRatio,
                vars.redepmtFeeRatio,
                vars.protocolFeeRatio,
                vars.managementFeeAddress
            ),
            ProposalState.Voting
        );

        // Starts the voting process for the gp kick proposal.
        vars.gpVotingContract.startNewVotingForProposal(
            dao,
            vars.proposalId,
            block.timestamp,
            bytes("")
        );

        // Sponsors the guild kick proposal.
        dao.sponsorProposal(
            vars.proposalId,
            vars.submittedBy,
            address(vars.gpVotingContract)
        );
        proposalIds += 1;

        previousProposalId = latestProposalId;
        latestProposalId = vars.proposalId;
        emit ProposalCreated(
            vars.proposalId,
            vars.fundRaiseTokenAddr,
            vars.fundRaiseTarget,
            vars.fundRaiseMaxAmount,
            vars.lpMinDepositAmount,
            vars.lpMaxDepositAmount,
            vars.fundRaiseStartTime,
            vars.fundRaiseEndTime,
            vars.fundRaiseEndTime + vars.fundTerm,
            vars.redemptPeriod,
            vars.redemptDuration,
            ProposalState.Voting
        );
    }

    struct ProcessProposalLocalVars {
        bytes32 ongoingProposalId;
        GPVotingContract votingContract;
        StakingRiceExtension stakingrice;
        FundingPoolExtension fundingpool;
        FundingPoolAdapterContract fundingPoolAdapt;
        IGPVoting.VotingState voteResult;
        // AllocationAdapterContractV2 allocAda;
        uint128 nbYes;
        uint128 nbNo;
        uint128 allVotingWeight;
        ProposalDetails proposalInfo;
    }

    function processProposal(DaoRegistry dao, bytes32 proposalId)
        external
        override
        reimbursable(dao)
    {
        ProcessProposalLocalVars memory vars;

        vars.proposalInfo = Proposals[address(dao)][proposalId];

        dao.processProposal(proposalId);
        vars.fundingPoolAdapt = FundingPoolAdapterContract(
            dao.getAdapterAddress(DaoHelper.FUNDING_POOL_ADAPT)
        );
        vars.votingContract = GPVotingContract(dao.votingAdapter(proposalId));
        require(
            address(vars.votingContract) != address(0x0),
            "FundRaise::processProposal::voting adapter not found"
        );

        (vars.voteResult, vars.nbYes, vars.nbNo) = vars
            .votingContract
            .voteResult(dao, proposalId);

        if (vars.voteResult == IGPVoting.VotingState.PASS) {
            vars.proposalInfo.state = ProposalState.Executing;
            // set dao configuration
            setFundRaiseConfiguration(dao, vars.proposalInfo);

            //reset fund raise state
            vars.fundingPoolAdapt.resetFundRaiseState(dao);
            vars.proposalInfo.state = ProposalState.Done;
        } else if (
            vars.voteResult == IGPVoting.VotingState.NOT_PASS ||
            vars.voteResult == IGPVoting.VotingState.TIE
        ) {
            vars.proposalInfo.state = ProposalState.Failed;
        } else {
            revert("FundRaise::processProposal::voting not finalized");
        }

        emit proposalExecuted(proposalId, vars.proposalInfo.state);
    }

    function setFundRaiseConfiguration(
        DaoRegistry dao,
        ProposalDetails memory proposalInfo
    ) internal {
        //1 fundRaiseTarget
        FundingPoolAdapterContract fundingPoolAdapt = FundingPoolAdapterContract(
                dao.getAdapterAddress(DaoHelper.FUNDING_POOL_ADAPT)
            );
        uint256 currentBalance = fundingPoolAdapt.lpBalance(dao);
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_TARGET,
            proposalInfo.fundRaiseTarget + currentBalance
        );
        //2 fundRaiseMaxAmount
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_MAX,
            proposalInfo.fundRaiseMaxAmount + currentBalance
        );
        //3 lpMinDepositAmount
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_MIN_INVESTMENT_AMOUNT_OF_LP,
            proposalInfo.lpMinDepositAmount
        );
        //4 lpMaxDepositAmount
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_MAX_INVESTMENT_AMOUNT_OF_LP,
            proposalInfo.lpMaxDepositAmount
        );
        //5 fundRaiseStartTime
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_WINDOW_BEGIN,
            proposalInfo.timesInfo.fundRaiseStartTime
        );
        //6 fundRaiseEndTime
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_WINDOW_END,
            proposalInfo.timesInfo.fundRaiseEndTime
        );
        //7 fundStartTime
        dao.setConfiguration(
            DaoHelper.FUND_START_TIME,
            proposalInfo.timesInfo.fundRaiseEndTime
        );
        //8 fundEndTime
        dao.setConfiguration(
            DaoHelper.FUND_END_TIME,
            proposalInfo.timesInfo.fundRaiseEndTime +
                proposalInfo.timesInfo.fundTerm
        );
        //9 redemptPeriod
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_REDEMPTION_PERIOD,
            proposalInfo.timesInfo.redemptPeriod
        );
        //10 redemptDuration
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_REDEMPTION_DURATION,
            proposalInfo.timesInfo.redemptDuration
        );
        //11 returnDuration
        dao.setConfiguration(
            DaoHelper.RETURN_DURATION,
            proposalInfo.timesInfo.returnDuration
        );
        //12 proposerRewardRatio
        dao.setConfiguration(
            DaoHelper.REWARD_FOR_PROPOSER,
            proposalInfo.feeInfo.proposerRewardRatio
        );
        //13 managementFeeRatio
        dao.setConfiguration(
            DaoHelper.MANAGEMENT_FEE,
            proposalInfo.feeInfo.managementFeeRatio
        );
        //14 redepmtFeeRatio
        dao.setConfiguration(
            DaoHelper.REDEMPTION_FEE,
            proposalInfo.feeInfo.redepmtFeeRatio
        );
        //15 protocolFeeRatio
        dao.setConfiguration(
            DaoHelper.PROTOCOL_FEE,
            proposalInfo.feeInfo.protocolFeeRatio
        );
        //16 management fee address
        dao.setAddressConfiguration(
            DaoHelper.GP_ADDRESS,
            proposalInfo.feeInfo.managementFeeAddress
        );
        //17 token address
        dao.setAddressConfiguration(
            DaoHelper.FUND_RAISING_CURRENCY_ADDRESS,
            proposalInfo.acceptTokenAddr
        );
    }
}
