pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "../../guards/AdapterGuard.sol";
import "../../guards/RaiserGuard.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "./interfaces/IFundRaise.sol";
import "./interfaces/IVintageVoting.sol";
import "./VintageVoting.sol";
import "../../helpers/FairShareHelper.sol";
import "../../helpers/DaoHelper.sol";
import "../extensions/fundingpool/VintageFundingPool.sol";
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

contract VintageFundRaiseAdapterContract is
    IFundRaise,
    AdapterGuard,
    RaiserGuard,
    Reimbursable
{
    /*
     * PUBLIC VARIABLES
     */
    // Keeps track of all the Proposals executed per DAO.
    mapping(address => mapping(bytes32 => ProposalDetails)) public Proposals;
    uint256 public proposalIds = 1;
    mapping(address => uint256) public createdFundCounter;
    mapping(address => bytes32) public lastProposalIds;

    /*
     * STRUCTURES
     */

    function submitProposal(
        ProposalParams calldata params
    ) external override reimbursable(params.dao) {
        if (
            lastProposalIds[address(params.dao)] != bytes32(0x0) &&
            (Proposals[address(params.dao)][
                lastProposalIds[address(params.dao)]
            ].state ==
                ProposalState.Voting ||
                Proposals[address(params.dao)][
                    lastProposalIds[address(params.dao)]
                ].state ==
                ProposalState.Executing)
        ) revert("last fund raise proposal not closed");
        SubmitProposalLocalVars memory vars;

        vars.lastFundEndTime = params.dao.getConfiguration(
            DaoHelper.FUND_END_TIME
        );
        vars.returnDuration = params.dao.getConfiguration(
            DaoHelper.RETURN_DURATION
        );
        vars.fundingPoolAdapt = VintageFundingPoolAdapterContract(
            params.dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_POOL_ADAPT)
        );
        require(
            vars.fundingPoolAdapt.poolBalance(params.dao) <= 0,
            "FundRaise::submitProposal::pool balance must = 0"
        );
        require(
            vars.fundingPoolAdapt.daoFundRaisingStates(address(params.dao)) ==
                DaoHelper.FundRaiseState.NOT_STARTED ||
                vars.fundingPoolAdapt.daoFundRaisingStates(
                    address(params.dao)
                ) ==
                DaoHelper.FundRaiseState.FAILED ||
                (vars.fundingPoolAdapt.daoFundRaisingStates(
                    address(params.dao)
                ) ==
                    DaoHelper.FundRaiseState.DONE &&
                    block.timestamp >
                    vars.lastFundEndTime + vars.returnDuration),
            "FundRaise::submitProposal::cant submit fund raise proposal now"
        );

        vars.protocolFeeRatio = vars.fundingPoolAdapt.protocolFee();
        if (
            params.proposalFundRaiseInfo.fundRaiseMinTarget <= 0 ||
            (params.proposalFundRaiseInfo.fundRaiseMaxCap > 0 &&
                params.proposalFundRaiseInfo.fundRaiseMaxCap <
                params.proposalFundRaiseInfo.fundRaiseMinTarget) ||
            params.proposalFundRaiseInfo.lpMinDepositAmount < 0 ||
            (params.proposalFundRaiseInfo.lpMaxDepositAmount > 0 &&
                params.proposalFundRaiseInfo.lpMaxDepositAmount <=
                params.proposalFundRaiseInfo.lpMinDepositAmount) ||
            params.proposalTimeInfo.startTime < block.timestamp ||
            params.proposalTimeInfo.endTime <
            params.proposalTimeInfo.startTime ||
            params.proposalTimeInfo.fundTerm <= 0 ||
            params.proposalTimeInfo.redemptPeriod >
            params.proposalTimeInfo.redemptInterval ||
            params.proposalTimeInfo.redemptInterval >
            params.proposalTimeInfo.fundTerm ||
            params.proposalTimeInfo.returnPeriod >=
            params.proposalTimeInfo.fundTerm ||
            params.proposalFeeInfo.managementFeeRatio >= 10 ** 18 ||
            params.proposalFeeInfo.managementFeeRatio < 0 ||
            params.proposalFeeInfo.redepmtFeeRatio >= 10 ** 18 ||
            params.proposalFeeInfo.redepmtFeeRatio < 0 ||
            params.proposerReward.fundFromInverstor < 0 ||
            params.proposerReward.fundFromInverstor >= 10 ** 18 ||
            params.proposerReward.projectTokenFromInvestor < 0 ||
            params.proposerReward.projectTokenFromInvestor >= 10 ** 18
        ) {
            revert("Invalid Params");
        }

        vars.votingContract = IVintageVoting(
            params.dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );

        vars.submittedBy = vars.votingContract.getSenderAddress(
            params.dao,
            address(this),
            bytes(""),
            msg.sender
        );

        vars.proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked("Fundraise#", Strings.toString(proposalIds))
        );

        params.dao.submitProposal(vars.proposalId);

        // Saves the state of the proposal.
        Proposals[address(params.dao)][vars.proposalId] = ProposalDetails(
            params.proposalAddressInfo.fundRaiseTokenAddress,
            params.proposalFundRaiseInfo.fundRaiseMinTarget,
            params.proposalFundRaiseInfo.fundRaiseMaxCap,
            params.proposalFundRaiseInfo.lpMinDepositAmount,
            params.proposalFundRaiseInfo.lpMaxDepositAmount,
            FundRiaseTimeInfo(
                params.proposalTimeInfo.startTime,
                params.proposalTimeInfo.endTime,
                params.proposalTimeInfo.fundTerm,
                params.proposalTimeInfo.redemptPeriod,
                params.proposalTimeInfo.redemptInterval,
                params.proposalTimeInfo.returnPeriod
            ),
            FundRaiseRewardAndFeeInfo(
                params.proposalFeeInfo.managementFeeRatio,
                params.proposalFeeInfo.redepmtFeeRatio,
                vars.protocolFeeRatio,
                params.proposalAddressInfo.managementFeeAddress
            ),
            ProoserReward(
                params.proposerReward.fundFromInverstor,
                params.proposerReward.projectTokenFromInvestor
            ),
            ProposalState.Voting,
            block.timestamp,
            block.timestamp +
                params.dao.getConfiguration(DaoHelper.VOTING_PERIOD)
        );

        // Starts the voting process for the gp kick proposal.
        vars.votingContract.startNewVotingForProposal(
            params.dao,
            vars.proposalId,
            block.timestamp,
            bytes("")
        );

        // Sponsors the guild kick proposal.
        params.dao.sponsorProposal(
            vars.proposalId,
            vars.submittedBy,
            address(vars.votingContract)
        );
        proposalIds += 1;

        lastProposalIds[address(params.dao)] = vars.proposalId;
        emit ProposalCreated(address(params.dao), vars.proposalId);
    }

    struct ProcessProposalLocalVars {
        bytes32 ongoingProposalId;
        VintageVotingContract votingContract;
        FundingPoolExtension fundingpool;
        VintageFundingPoolAdapterContract fundingPoolAdapt;
        IVintageVoting.VotingState voteResult;
        uint128 nbYes;
        uint128 nbNo;
        uint128 allVotingWeight;
        ProposalDetails proposalInfo;
    }

    function processProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external override reimbursable(dao) {
        ProcessProposalLocalVars memory vars;

        // vars.proposalInfo = Proposals[address(dao)][proposalId];
        ProposalDetails storage proposalDetails = Proposals[address(dao)][
            proposalId
        ];
        dao.processProposal(proposalId);
        vars.fundingPoolAdapt = VintageFundingPoolAdapterContract(
            dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_POOL_ADAPT)
        );
        vars.votingContract = VintageVotingContract(
            dao.votingAdapter(proposalId)
        );
        require(
            address(vars.votingContract) != address(0x0),
            "FundRaise::processProposal::voting adapter not found"
        );

        (vars.voteResult, vars.nbYes, vars.nbNo) = vars
            .votingContract
            .voteResult(dao, proposalId);

        if (vars.voteResult == IVintageVoting.VotingState.PASS) {
            proposalDetails.state = ProposalState.Executing;
            // set dao configuration
            setFundRaiseConfiguration(dao, proposalDetails);

            //reset fund raise state
            vars.fundingPoolAdapt.resetFundRaiseState(dao);
            proposalDetails.state = ProposalState.Done;

            // fundsCounter += 1;
            createdFundCounter[address(dao)] += 1;
        } else if (
            vars.voteResult == IVintageVoting.VotingState.NOT_PASS ||
            vars.voteResult == IVintageVoting.VotingState.TIE
        ) {
            proposalDetails.state = ProposalState.Failed;
        } else {
            revert("FundRaise::processProposal::voting not finalized");
        }
        emit proposalExecuted(address(dao), proposalId, proposalDetails.state);
    }

    function setFundRaiseConfiguration(
        DaoRegistry dao,
        ProposalDetails memory proposalInfo
    ) internal {
        //1 fundRaiseTarget
        VintageFundingPoolAdapterContract fundingPoolAdapt = VintageFundingPoolAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_POOL_ADAPT)
            );
        //fundRaiseTarget
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_TARGET,
            proposalInfo.fundRaiseTarget
        );
        //2 fundRaiseMaxAmount
        if (proposalInfo.fundRaiseMaxAmount > 0) {
            dao.setConfiguration(
                DaoHelper.FUND_RAISING_MAX,
                proposalInfo.fundRaiseMaxAmount
            );
        } else {
            dao.setConfiguration(DaoHelper.FUND_RAISING_MAX, 0);
        }

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
        dao.setConfiguration(DaoHelper.FUND_START_TIME, block.timestamp);
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
        // dao.setConfiguration(
        //     DaoHelper.REWARD_FOR_PROPOSER,
        //     proposalInfo.feeInfo.proposerRewardRatio
        // );
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
        // //15 protocolFeeRatio
        // dao.setConfiguration(
        //     DaoHelper.PROTOCOL_FEE,
        //     proposalInfo.feeInfo.protocolFeeRatio
        // );
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

        //18 proposer reward fund from investors
        dao.setConfiguration(
            DaoHelper.VINTAGE_PROPOSER_FUND_REWARD_RADIO,
            proposalInfo.proposerReward.fundFromInverstor
        );

        //19 proposer reward project token from investors
        dao.setConfiguration(
            DaoHelper.VINTAGE_PROPOSER_TOKEN_REWARD_RADIO,
            proposalInfo.proposerReward.projectTokenFromInvestor
        );
    }
}
