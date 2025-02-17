pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "../../guards/AdapterGuard.sol";
import "../../guards/RaiserGuard.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "./interfaces/IVintageFundRaise.sol";
import "./interfaces/IVintageVoting.sol";
import "./VintageVoting.sol";
import "../../helpers/FairShareHelper.sol";
import "../../helpers/DaoHelper.sol";
import "../../helpers/GovernanceHelper.sol";
import "../extensions/fundingpool/VintageFundingPool.sol";
import "../../utils/TypeConver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/structs/DoubleEndedQueue.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./VintageFundRaiseHelperAdapter.sol";
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
    IVintageFundRaise,
    AdapterGuard,
    GovernorGuard,
    Reimbursable
{
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    /*
     * PUBLIC VARIABLES
     */
    // Keeps track of all the Proposals executed per DAO.
    mapping(address => mapping(bytes32 => ProposalDetails)) public Proposals;
    mapping(address => uint256) public createdFundCounter;
    mapping(address => bytes32) public lastProposalIds;
    mapping(address => mapping(bytes32 => EnumerableSet.AddressSet)) priorityDepositeWhiteList;
    mapping(address => EnumerableSet.Bytes32Set) unDoneProposals;

    /*
     * STRUCTURES
     */

    function submitProposal(
        ProposalParams calldata params
    ) external override onlyGovernor(params.dao) reimbursable(params.dao) {
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
        ) revert LAST_NEW_FUND_PROPOSAL_NOT_FINISH();
        SubmitProposalLocalVars memory vars;
        vars.daosetAdapt = VintageDaoSetAdapterContract(
            params.dao.getAdapterAddress(DaoHelper.VINTAGE_DAO_SET_ADAPTER)
        );

        if (!vars.daosetAdapt.isProposalAllDone(address(params.dao)))
            revert DAOSET_PROPOSAL_UNDONE();
        vars.investmentContract = VintageFundingAdapterContract(
            params.dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_ADAPTER)
        );

        if (
            vars.investmentContract.getQueueLength(params.dao) > 0 ||
            vars.investmentContract.ongoingProposal(address(params.dao)) !=
            bytes32(0)
        ) revert UNDONE_INVESTMENT_PROPOSAL();

        vars.lastFundEndTime = params.dao.getConfiguration(
            DaoHelper.FUND_END_TIME
        );
        vars.refundDuration = params.dao.getConfiguration(
            DaoHelper.RETURN_DURATION
        );
        vars.investmentPoolAdapt = VintageFundingPoolAdapterContract(
            params.dao.getAdapterAddress(
                DaoHelper.VINTAGE_INVESTMENT_POOL_ADAPT
            )
        );

        if (vars.investmentPoolAdapt.poolBalance(params.dao) > 0)
            revert NOT_CLEAR_FUND();
        // console.log(vars.lastFundEndTime + vars.refundDuration);
        require(
            vars.investmentPoolAdapt.daoFundRaisingStates(
                address(params.dao)
            ) ==
                DaoHelper.FundRaiseState.NOT_STARTED ||
                vars.investmentPoolAdapt.daoFundRaisingStates(
                    address(params.dao)
                ) ==
                DaoHelper.FundRaiseState.FAILED ||
                (vars.investmentPoolAdapt.daoFundRaisingStates(
                    address(params.dao)
                ) ==
                    DaoHelper.FundRaiseState.DONE &&
                    block.timestamp >
                    vars.lastFundEndTime + vars.refundDuration),
            "not now"
        );

        vars.protocolFeeRatio = vars.investmentPoolAdapt.protocolFee();
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
            params.proposalFeeInfo.managementFeeRatio >= 10 ** 18 ||
            params.proposalFeeInfo.managementFeeRatio < 0 ||
            params.proposalFeeInfo.redepmtFeeRatio >= 10 ** 18 ||
            params.proposalFeeInfo.redepmtFeeRatio < 0 ||
            params.proposerReward.fundFromInverstor < 0 ||
            params.proposerReward.fundFromInverstor >= 10 ** 18 ||
            params.proposerReward.projectTokenFromInvestor < 0 ||
            params.proposerReward.projectTokenFromInvestor >= 10 ** 18
        ) {
            revert INVALID_PARAM();
        }

        vars.votingContract = IVintageVoting(
            params.dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );

        params.dao.increaseFundEstablishmentId();
        vars.proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(params.dao)))),
                "FundEstablishment#",
                Strings.toString(
                    params.dao.getCurrentFundEstablishmentProposalId()
                )
            )
        );

        params.dao.submitProposal(vars.proposalId);

        // Saves the state of the proposal.
        Proposals[address(params.dao)][vars.proposalId] = ProposalDetails(
            params.proposalAddressInfo.fundRaiseTokenAddress,
            FundRaiseAmountInfo(
                params.proposalFundRaiseInfo.fundRaiseMinTarget,
                params.proposalFundRaiseInfo.fundRaiseMaxCap,
                params.proposalFundRaiseInfo.lpMinDepositAmount,
                params.proposalFundRaiseInfo.lpMaxDepositAmount
            ),
            FundRiaseTimeInfo(
                params.proposalTimeInfo.startTime,
                params.proposalTimeInfo.endTime,
                params.proposalTimeInfo.fundTerm,
                params.proposalTimeInfo.redemptPeriod,
                params.proposalTimeInfo.redemptInterval,
                params.proposalTimeInfo.refundPeriod
            ),
            FundRaiseRewardAndFeeInfo(
                params.proposalFeeInfo.managementFeeRatio,
                params.proposalFeeInfo.paybackTokenManagementFeeRatio,
                params.proposalFeeInfo.redepmtFeeRatio,
                vars.protocolFeeRatio,
                params.proposalAddressInfo.managementFeeAddress,
                params.proposalAddressInfo.redemptionFeeReceiver
            ),
            ProoserReward(
                params.proposerReward.fundFromInverstor,
                params.proposerReward.projectTokenFromInvestor
            ),
            PriorityDeposite(
                params.priorityDeposite.enable,
                params.priorityDeposite.vtype,
                params.priorityDeposite.token,
                params.priorityDeposite.tokenId,
                params.priorityDeposite.amount
            ),
            params.proposalFundRaiseInfo.fundRaiseType,
            ProposalState.Voting,
            block.timestamp,
            block.timestamp +
                params.dao.getConfiguration(DaoHelper.VOTING_PERIOD),
            VintageInvestorCapInfo(
                params.investorCap.enable,
                params.investorCap.cap
            ),
            VintageInvestorEligibility(
                params.investorEligibility.enable,
                params.investorEligibility.name,
                params.investorEligibility.varifyType,
                params.investorEligibility.minAmount,
                params.investorEligibility.tokenAddress,
                params.investorEligibility.tokenId,
                params.investorEligibility.whiteList
            )
        );

        if (
            params.priorityDeposite.enable &&
            params.priorityDeposite.vtype == 3 &&
            params.priorityDeposite.whitelist.length > 0
        ) {
            // delete priorityDepositeWhiteList[address(params.dao)];
            setPriorityDepositeWhiteList(
                address(params.dao),
                vars.proposalId,
                params.priorityDeposite.whitelist
            );
        }
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
            address(vars.votingContract)
        );
        unDoneProposals[address(params.dao)].add(vars.proposalId);

        lastProposalIds[address(params.dao)] = vars.proposalId;
        emit ProposalCreated(address(params.dao), vars.proposalId);
    }

    struct ProcessProposalLocalVars {
        bytes32 ongoingProposalId;
        VintageVotingContract votingContract;
        VintageFundingPoolExtension investmentpool;
        VintageFundingPoolAdapterContract investmentPoolAdapt;
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

        ProposalDetails storage proposalDetails = Proposals[address(dao)][
            proposalId
        ];
        dao.processProposal(proposalId);
        vars.investmentPoolAdapt = VintageFundingPoolAdapterContract(
            dao.getAdapterAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_ADAPT)
        );
        vars.votingContract = VintageVotingContract(
            dao.votingAdapter(proposalId)
        );

        if (address(vars.votingContract) == address(0x0))
            revert VOTING_ADAPTER_NOT_FOUND();

        (vars.voteResult, vars.nbYes, vars.nbNo) = vars
            .votingContract
            .voteResult(dao, proposalId);

        if (vars.voteResult == IVintageVoting.VotingState.PASS) {
            proposalDetails.state = ProposalState.Executing;
            // set dao configuration
            // setFundRaiseConfiguration(dao, proposalDetails);
            VintageFundRaiseHelperAdapterContract(
                dao.getAdapterAddress(
                    DaoHelper.VINTAGE_FUND_RAISE_HELPER_ADAPTER
                )
            ).setFundRaiseConfiguration(dao, proposalDetails);
            //reset fund raise state
            vars.investmentPoolAdapt.resetFundRaiseState(dao);
            proposalDetails.state = ProposalState.FundRaising;

            // fundsCounter += 1;
            createdFundCounter[address(dao)] += 1;
        } else if (
            vars.voteResult == IVintageVoting.VotingState.NOT_PASS ||
            vars.voteResult == IVintageVoting.VotingState.TIE
        ) {
            proposalDetails.state = ProposalState.Failed;
        } else {
            revert VOTING_NOT_FINISH();
        }
        if (unDoneProposals[address(dao)].contains(proposalId))
            unDoneProposals[address(dao)].remove(proposalId);

        uint128 allGPsWeight = GovernanceHelper
            .getVintageAllGovernorVotingWeightByProposalId(dao, proposalId);

        emit proposalExecuted(
            address(dao),
            proposalId,
            proposalDetails.state,
            allGPsWeight,
            vars.nbYes,
            vars.nbNo,
            uint256(vars.voteResult)
        );
    }

    // function setFundRaiseConfiguration(
    //     DaoRegistry dao,
    //     ProposalDetails memory proposalInfo
    // ) internal {
    //     setFundAmount(
    //         dao,
    //         [
    //             proposalInfo.amountInfo.fundRaiseTarget,
    //             proposalInfo.amountInfo.fundRaiseMaxAmount,
    //             proposalInfo.amountInfo.lpMinDepositAmount,
    //             proposalInfo.amountInfo.lpMaxDepositAmount
    //         ]
    //     );

    //     setFundTimes(
    //         dao,
    //         [
    //             proposalInfo.timesInfo.fundRaiseStartTime,
    //             proposalInfo.timesInfo.fundRaiseEndTime,
    //             proposalInfo.timesInfo.fundTerm,
    //             proposalInfo.timesInfo.redemptPeriod,
    //             proposalInfo.timesInfo.redemptDuration,
    //             proposalInfo.timesInfo.refundDuration
    //         ]
    //     );

    //     setAddresses(
    //         dao,
    //         [
    //             proposalInfo.feeInfo.managementFeeAddress,
    //             proposalInfo.feeInfo.redemptionFeeReceiver,
    //             proposalInfo.acceptTokenAddr
    //         ]
    //     );

    //     setFeeAndReward(
    //         dao,
    //         [
    //             proposalInfo.feeInfo.managementFeeRatio,
    //             proposalInfo.feeInfo.redepmtFeeRatio,
    //             proposalInfo.proposerReward.fundFromInverstor,
    //             proposalInfo.proposerReward.projectTokenFromInvestor,
    //             proposalInfo.feeInfo.paybackTokenManagementFeeRatio
    //         ]
    //     );

    //     // set fundRaiseType
    //     dao.setConfiguration(
    //         DaoHelper.VINTAGE_FUNDRAISE_STYLE,
    //         proposalInfo.fundRaiseType
    //     );

    //     // set priority deposit
    //     if (proposalInfo.priorityDeposite.enable) {
    //         setPriorityDeposit(
    //             dao,
    //             proposalInfo.priorityDeposite.vtype,
    //             proposalInfo.priorityDeposite.token,
    //             proposalInfo.priorityDeposite.tokenId,
    //             proposalInfo.priorityDeposite.amount
    //         );
    //     }

    //     setInvestorCap(
    //         dao,
    //         proposalInfo.investorCap.enable,
    //         proposalInfo.investorCap.cap
    //     );
    //     setInvestorEligibility(
    //         proposalInfo.investorEligibility.enable,
    //         dao,
    //         proposalInfo.investorEligibility.name,
    //         proposalInfo.investorEligibility.varifyType,
    //         proposalInfo.investorEligibility.minAmount,
    //         proposalInfo.investorEligibility.tokenId,
    //         proposalInfo.investorEligibility.tokenAddress,
    //         proposalInfo.investorEligibility.whiteList
    //     );
    // }

    // function setFundAmount(
    //     DaoRegistry dao,
    //     uint256[4] memory uint256Args
    // ) internal {
    //     //1 fundRaiseTarget
    //     dao.setConfiguration(
    //         DaoHelper.FUND_RAISING_TARGET,
    //         uint256Args[0] // proposalInfo.fundRaiseTarget
    //     );
    //     //2 fundRaiseMaxAmount
    //     dao.setConfiguration(
    //         DaoHelper.FUND_RAISING_MAX,
    //         uint256Args[1] //     proposalInfo.fundRaiseMaxAmount
    //     );

    //     //3 lpMinDepositAmount
    //     dao.setConfiguration(
    //         DaoHelper.FUND_RAISING_MIN_INVESTMENT_AMOUNT_OF_LP,
    //         uint256Args[2] // proposalInfo.lpMinDepositAmount
    //     );
    //     //4 lpMaxDepositAmount
    //     dao.setConfiguration(
    //         DaoHelper.FUND_RAISING_MAX_INVESTMENT_AMOUNT_OF_LP,
    //         uint256Args[3] //  proposalInfo.lpMaxDepositAmount
    //     );
    // }

    // function setFeeAndReward(
    //     DaoRegistry dao,
    //     uint256[5] memory uint256Args
    // ) internal {
    //     //1 managementFeeRatio
    //     dao.setConfiguration(
    //         DaoHelper.MANAGEMENT_FEE,
    //         uint256Args[0] //   proposalInfo.feeInfo.managementFeeRatio
    //     );
    //     //2 redepmtFeeRatio
    //     dao.setConfiguration(
    //         DaoHelper.REDEMPTION_FEE,
    //         uint256Args[1] //   proposalInfo.feeInfo.redepmtFeeRatio
    //     );

    //     //3 proposer reward fund from investors
    //     dao.setConfiguration(
    //         DaoHelper.VINTAGE_PROPOSER_FUND_REWARD_RADIO,
    //         uint256Args[2] //   proposalInfo.proposerReward.fundFromInverstor
    //     );

    //     //4 proposer reward project token from investors
    //     dao.setConfiguration(
    //         DaoHelper.VINTAGE_PROPOSER_TOKEN_REWARD_RADIO,
    //         uint256Args[3] //  proposalInfo.proposerReward.projectTokenFromInvestor
    //     );

    //     //set paybackTokenManagement fee
    //     dao.setConfiguration(
    //         DaoHelper.VINTAGE_RETURN_TOKEN_MANAGEMENT_FEE_AMOUNT,
    //         uint256Args[4]
    //     );
    // }

    // function setAddresses(
    //     DaoRegistry dao,
    //     address[3] memory addressArgs
    // ) internal {
    //     //16 management fee address
    //     dao.setAddressConfiguration(
    //         DaoHelper.GP_ADDRESS,
    //         addressArgs[0] //  proposalInfo.feeInfo.managementFeeAddress
    //     );
    //     //17 token address
    //     dao.setAddressConfiguration(
    //         DaoHelper.FUND_RAISING_CURRENCY_ADDRESS,
    //         addressArgs[2] //  proposalInfo.acceptTokenAddr
    //     );
    //     dao.setAddressConfiguration(
    //         DaoHelper.REDEMPTION_FEE_RECEIVER,
    //         addressArgs[1] //  proposalInfo.feeInfo.redemptionFeeReceiver
    //     );
    // }

    // function setFundTimes(
    //     DaoRegistry dao,
    //     uint256[6] memory uint256Args
    // ) internal {
    //     //1 fundRaiseStartTime
    //     dao.setConfiguration(
    //         DaoHelper.FUND_RAISING_WINDOW_BEGIN,
    //         uint256Args[0] // proposalInfo.timesInfo.fundRaiseStartTime
    //     );
    //     //2 fundRaiseEndTime
    //     dao.setConfiguration(
    //         DaoHelper.FUND_RAISING_WINDOW_END,
    //         uint256Args[1] //  proposalInfo.timesInfo.fundRaiseEndTime
    //     );
    //     dao.setConfiguration(DaoHelper.FUND_TERM, uint256Args[2]);
    //     //3 redemptPeriod
    //     dao.setConfiguration(
    //         DaoHelper.FUND_RAISING_REDEMPTION_PERIOD,
    //         uint256Args[3] //  proposalInfo.timesInfo.redemptPeriod
    //     );
    //     //6 redemptDuration
    //     dao.setConfiguration(
    //         DaoHelper.FUND_RAISING_REDEMPTION_DURATION,
    //         uint256Args[4] //   proposalInfo.timesInfo.redemptDuration
    //     );
    //     //5 refundDuration
    //     dao.setConfiguration(
    //         DaoHelper.RETURN_DURATION,
    //         uint256Args[5] //    proposalInfo.timesInfo.refundDuration
    //     );
    // }

    // function setPriorityDeposit(
    //     DaoRegistry dao,
    //     uint8 vtype,
    //     address token,
    //     uint256 tokenId,
    //     uint256 amount
    // ) internal {
    //     dao.setConfiguration(DaoHelper.VINTAGE_PRIORITY_DEPOSITE_ENABLE, 1);
    //     dao.setConfiguration(DaoHelper.VINTAGE_PRIORITY_DEPOSITE_TYPE, vtype);

    //     dao.setConfiguration(
    //         DaoHelper.VINTAGE_PRIORITY_DEPOSITE_TOKENID,
    //         tokenId
    //     );
    //     dao.setConfiguration(
    //         DaoHelper.VINTAGE_PRIORITY_DEPOSITE_AMOUNT,
    //         amount
    //     );
    //     dao.setAddressConfiguration(
    //         DaoHelper.VINTAGE_PRIORITY_DEPOSITE_TOKEN_ADDRESS,
    //         token
    //     );
    // }

    function setPriorityDepositeWhiteList(
        address dao,
        bytes32 proposalId,
        address[] calldata whitelist
    ) internal {
        for (uint8 i = 0; i < whitelist.length; i++) {
            // if (!priorityDepositeWhiteList[dao].contains(whitelist[i])) {
            priorityDepositeWhiteList[dao][proposalId].add(whitelist[i]);
            // }
        }
    }

    function setProposalState(
        DaoRegistry dao,
        bytes32 proposalId,
        bool state
    ) external {
        if (
            msg.sender !=
            dao.getAdapterAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_ADAPT)
        ) revert ACCESS_DENIED();

        if (state)
            Proposals[address(dao)][proposalId].state = ProposalState.Done;
        else Proposals[address(dao)][proposalId].state = ProposalState.Failed;
    }

    // function setInvestorCap(
    //     DaoRegistry dao,
    //     bool enable,
    //     uint256 cap
    // ) internal {
    //     dao.setConfiguration(
    //         DaoHelper.MAX_INVESTORS_ENABLE,
    //         enable == true ? 1 : 0
    //     );
    //     dao.setConfiguration(DaoHelper.MAX_INVESTORS, cap);
    // }

    // function setInvestorEligibility(
    //     bool enable,
    //     DaoRegistry dao,
    //     string memory name,
    //     uint8 varifyType,
    //     uint256 minHolding,
    //     uint256 tokenId,
    //     address tokenAddress,
    //     address[] memory vintageDaoInvestorMembershipWhitelist
    // ) internal {
    //     if (enable) {
    //         dao.setConfiguration(
    //             DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_ENABLE,
    //             1
    //         );
    //         dao.setStringConfiguration(
    //             DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_NAME,
    //             name
    //         );
    //         dao.setConfiguration(
    //             DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_TYPE,
    //             varifyType
    //         );
    //         //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIS
    //         if (varifyType == 0 || varifyType == 1 || varifyType == 2) {
    //             dao.setConfiguration(
    //                 DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_MIN_HOLDING,
    //                 minHolding
    //             );
    //             dao.setAddressConfiguration(
    //                 DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS,
    //                 tokenAddress
    //             );
    //         }

    //         if (varifyType == 2) {
    //             dao.setConfiguration(
    //                 DaoHelper.VINTAGE_INVESTOR_MEMBERSHIP_TOKENID,
    //                 tokenId
    //             );
    //         }

    //         if (
    //             varifyType == 3 &&
    //             vintageDaoInvestorMembershipWhitelist.length > 0
    //         ) {
    //             VintageFundingPoolAdapterContract fundingPoolAdapt = VintageFundingPoolAdapterContract(
    //                     dao.getAdapterAddress(
    //                         DaoHelper.VINTAGE_INVESTMENT_POOL_ADAPT
    //                     )
    //                 );
    //             for (
    //                 uint8 i = 0;
    //                 i < vintageDaoInvestorMembershipWhitelist.length;
    //                 i++
    //             ) {
    //                 fundingPoolAdapt.registerInvestorWhiteList(
    //                     dao,
    //                     vintageDaoInvestorMembershipWhitelist[i]
    //                 );
    //             }
    //         }
    //     }
    // }

    function getWhiteList(
        address dao,
        bytes32 proposalId
    ) public view returns (address[] memory) {
        return priorityDepositeWhiteList[dao][proposalId].values();
    }

    function isPriorityDepositer(
        DaoRegistry dao,
        bytes32 proposalId,
        address account
    ) public view returns (bool) {
        if (
            dao.getConfiguration(DaoHelper.VINTAGE_PRIORITY_DEPOSITE_ENABLE) ==
            1
        ) {
            uint256 vtype = dao.getConfiguration(
                DaoHelper.VINTAGE_PRIORITY_DEPOSITE_TYPE
            );
            address token = dao.getAddressConfiguration(
                DaoHelper.VINTAGE_PRIORITY_DEPOSITE_TOKEN_ADDRESS
            );
            uint256 tokenAmount = dao.getConfiguration(
                DaoHelper.VINTAGE_PRIORITY_DEPOSITE_AMOUNT
            );
            uint256 tokenId = dao.getConfiguration(
                DaoHelper.VINTAGE_PRIORITY_DEPOSITE_TOKENID
            );
            if (vtype == 0 && IERC20(token).balanceOf(account) >= tokenAmount)
                return true;
            else if (
                vtype == 1 && IERC721(token).balanceOf(account) >= tokenAmount
            ) return true;
            else if (
                vtype == 2 &&
                IERC1155(token).balanceOf(account, tokenId) >= tokenAmount
            ) return true;
            else if (
                vtype == 3 &&
                priorityDepositeWhiteList[address(dao)][proposalId].contains(
                    account
                )
            ) return true;
            else {
                return false;
            }
        }
        return false;
    }

    function allDone(DaoRegistry dao) external view returns (bool) {
        return unDoneProposals[address(dao)].length() > 0 ? false : true;
    }

    function getProposalState(
        DaoRegistry dao,
        bytes32 proposalId
    ) external view returns (IVintageFundRaise.ProposalState) {
        return Proposals[address(dao)][proposalId].state;
    }
}
