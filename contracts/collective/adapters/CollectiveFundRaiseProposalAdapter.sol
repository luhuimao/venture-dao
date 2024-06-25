pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/ICollectiveFundRaise.sol";
import "./CollectiveDaoSetProposalAdapter.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "../../guards/MemberGuard.sol";

contract ColletiveFundRaiseProposalAdapterContract is
    ICollectiveFundRaise,
    Reimbursable,
    MemberGuard
{
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    mapping(DaoRegistry => mapping(bytes32 => EnumerableSet.AddressSet)) priorityDepositorWhitelist;
    mapping(DaoRegistry => mapping(bytes32 => ProposalDetails))
        public proposals;
    mapping(address => EnumerableSet.Bytes32Set) unDoneProposals;
    mapping(address => bytes32) public lastProposalIds;

    function daosetProposalCheck(DaoRegistry dao) internal view returns (bool) {
        ColletiveDaoSetProposalAdapterContract daoset = ColletiveDaoSetProposalAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_DAO_SET_ADAPTER)
            );
        return daoset.isProposalAllDone(dao);
    }

    function submitProposal(
        ProposalParams calldata params
    ) external reimbursable(params.dao) onlyMember(params.dao) returns (bool) {
        SubmitProposalLocalVars memory vars;

        if (
            lastProposalIds[address(params.dao)] != bytes32(0x0) &&
            (proposals[params.dao][lastProposalIds[address(params.dao)]]
                .state ==
                ProposalState.Voting ||
                proposals[params.dao][lastProposalIds[address(params.dao)]]
                    .state ==
                ProposalState.Executing)
        ) revert LAST_NEW_FUND_PROPOSAL_NOT_FINISH();

        vars.daosetAdapt = ColletiveDaoSetProposalAdapterContract(
            params.dao.getAdapterAddress(DaoHelper.COLLECTIVE_DAO_SET_ADAPTER)
        );
        require(
            vars.daosetAdapt.isProposalAllDone(params.dao),
            "DaoSet Proposal Undone"
        );

        vars.investmentContract = ColletiveFundingProposalAdapterContract(
            params.dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUNDING_ADAPTER)
        );
        require(
            vars.investmentContract.getQueueLength(params.dao) <= 0 &&
                vars.investmentContract.ongoingProposal(address(params.dao)) ==
                bytes32(0),
            "Undone Investment Proposal"
        );

        vars.investmentPoolAdapt = ColletiveFundingPoolAdapterContract(
            params.dao.getAdapterAddress(
                DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER
            )
        );

        //fund state check
        if (
            vars.investmentPoolAdapt.fundState(address(params.dao)) ==
            ColletiveFundingPoolAdapterContract.FundState.IN_PROGRESS
        ) revert UNEXECUTE();

        // params check
        vars.protocolFeeRatio = vars.investmentPoolAdapt.protocolFee();
        if (
            params.fundInfo.miniTarget <= 0 ||
            (params.fundInfo.maxCap > 0 &&
                params.fundInfo.maxCap < params.fundInfo.miniTarget) ||
            params.fundInfo.miniDeposit < 0 ||
            (params.fundInfo.maxDeposit > 0 &&
                params.fundInfo.maxDeposit <= params.fundInfo.miniDeposit) ||
            params.timeInfo.startTime < block.timestamp ||
            params.timeInfo.endTime < params.timeInfo.startTime
        ) {
            revert INVALID_PARAM();
        }
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
        proposals[params.dao][vars.proposalId] = ProposalDetails(
            FundRaiseTimeInfo(
                params.timeInfo.startTime,
                params.timeInfo.endTime
            ),
            FundInfo(
                params.fundInfo.tokenAddress,
                params.fundInfo.miniTarget,
                params.fundInfo.maxCap,
                params.fundInfo.miniDeposit,
                params.fundInfo.maxDeposit
            ),
            PriorityDepositorInfo(
                params.priorityDepositor.enable,
                params.priorityDepositor.valifyType,
                params.priorityDepositor.tokenAddress,
                params.priorityDepositor.tokenId,
                params.priorityDepositor.miniHolding,
                params.priorityDepositor.whitelist
            ),
            params.fundRaiseType,
            ProposalState.Voting,
            block.timestamp,
            block.timestamp +
                params.dao.getConfiguration(DaoHelper.VOTING_PERIOD)
        );

        if (params.priorityDepositor.whitelist.length > 0) {
            for (
                uint8 i = 0;
                i < params.priorityDepositor.whitelist.length;
                i++
            )
                priorityDepositorWhitelist[params.dao][vars.proposalId].add(
                    params.priorityDepositor.whitelist[i]
                );
        }
        params.dao.submitProposal(vars.proposalId);

        params.dao.sponsorProposal(
            vars.proposalId,
            params.dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
        );
        ICollectiveVoting collectiveVotingContract = ICollectiveVoting(
            params.dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
        );
        collectiveVotingContract.startNewVotingForProposal(
            params.dao,
            vars.proposalId,
            bytes("")
        );
        unDoneProposals[address(params.dao)].add(vars.proposalId);
        lastProposalIds[address(params.dao)] = vars.proposalId;
        emit ProposalCreated(address(params.dao), vars.proposalId);
        return true;
    }

    function processProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        ProcessProposalLocalVars memory vars;

        ProposalDetails storage proposalDetails = proposals[dao][proposalId];
        dao.processProposal(proposalId);
        vars.investmentPoolAdapt = ColletiveFundingPoolAdapterContract(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER)
        );
        vars.votingContract = CollectiveVotingAdapterContract(
            dao.votingAdapter(proposalId)
        );
        require(
            address(vars.votingContract) != address(0x0),
            "voting adapter not found"
        );

        (vars.voteResult, vars.nbYes, vars.nbNo) = vars
            .votingContract
            .voteResult(dao, proposalId);

        if (vars.voteResult == ICollectiveVoting.VotingState.PASS) {
            proposalDetails.state = ProposalState.Executing;
            // set dao configuration
            setFundRaiseConfiguration(dao, proposalDetails);

            //reset fund raise state
            vars.investmentPoolAdapt.resetFundRaiseState(dao);
            proposalDetails.state = ProposalState.Done;
        } else if (
            vars.voteResult == ICollectiveVoting.VotingState.NOT_PASS ||
            vars.voteResult == ICollectiveVoting.VotingState.TIE
        ) {
            proposalDetails.state = ProposalState.Failed;
        } else {
            revert VOTING_NOT_FINISH();
        }
        if (unDoneProposals[address(dao)].contains(proposalId))
            unDoneProposals[address(dao)].remove(proposalId);

        uint128 allGPsWeight = GovernanceHelper
            .getAllCollectiveGovernorVotingWeight(dao);

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

    function setFundRaiseConfiguration(
        DaoRegistry dao,
        ProposalDetails memory proposalInfo
    ) internal {
        dao.setConfiguration(
            DaoHelper.COLLECTIVE_FUNDRAISE_STYLE,
            proposalInfo.fundRaiseType
        );
        setFundAmount(
            dao,
            [
                proposalInfo.fundInfo.miniTarget,
                proposalInfo.fundInfo.maxCap,
                proposalInfo.fundInfo.miniDeposit,
                proposalInfo.fundInfo.maxDeposit
            ]
        );

        setFundTimes(
            dao,
            [proposalInfo.timeInfo.startTime, proposalInfo.timeInfo.endTime]
        );

        dao.setAddressConfiguration(
            DaoHelper.FUND_RAISING_CURRENCY_ADDRESS,
            proposalInfo.fundInfo.tokenAddress //  proposalInfo.acceptTokenAddr
        );

        //20 set priority deposit
        if (proposalInfo.priorityDepositor.enable) {
            setPriorityDeposit(
                dao,
                proposalInfo.priorityDepositor.valifyType,
                proposalInfo.priorityDepositor.tokenAddress,
                proposalInfo.priorityDepositor.tokenId,
                proposalInfo.priorityDepositor.miniHolding
            );
        }
    }

    function setFundAmount(
        DaoRegistry dao,
        uint256[4] memory uint256Args
    ) internal {
        //1 fundRaiseTarget
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_TARGET,
            uint256Args[0] // proposalInfo.fundRaiseTarget
        );
        //2 fundRaiseMaxAmount
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_MAX,
            uint256Args[1] //     proposalInfo.fundRaiseMaxAmount
        );

        //3 lpMinDepositAmount
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_MIN_INVESTMENT_AMOUNT_OF_LP,
            uint256Args[2] // proposalInfo.lpMinDepositAmount
        );
        //4 lpMaxDepositAmount
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_MAX_INVESTMENT_AMOUNT_OF_LP,
            uint256Args[3] //  proposalInfo.lpMaxDepositAmount
        );
    }

    function setFundTimes(
        DaoRegistry dao,
        uint256[2] memory uint256Args
    ) internal {
        //1 fundRaiseStartTime
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_WINDOW_BEGIN,
            uint256Args[0] // proposalInfo.timesInfo.fundRaiseStartTime
        );
        //2 fundRaiseEndTime
        dao.setConfiguration(
            DaoHelper.FUND_RAISING_WINDOW_END,
            uint256Args[1] //  proposalInfo.timesInfo.fundRaiseEndTime
        );
    }

    function setPriorityDeposit(
        DaoRegistry dao,
        uint8 vtype,
        address token,
        uint256 tokenId,
        uint256 amount
    ) internal {
        dao.setConfiguration(DaoHelper.COLLECTIVE_PRIORITY_DEPOSITE_ENABLE, 1);

        dao.setConfiguration(
            DaoHelper.COLLECTIVE_PRIORITY_DEPOSITE_TYPE,
            vtype
        );

        dao.setConfiguration(
            DaoHelper.COLLECTIVE_PRIORITY_DEPOSITE_TOKENID,
            tokenId
        );
        dao.setConfiguration(
            DaoHelper.COLLECTIVE_PRIORITY_DEPOSITE_AMOUNT,
            amount
        );
        dao.setAddressConfiguration(
            DaoHelper.COLLECTIVE_PRIORITY_DEPOSITE_TOKEN_ADDRESS,
            token
        );
    }

    function setPriorityDepositeWhiteList(
        DaoRegistry dao,
        bytes32 proposalId,
        address[] calldata whitelist
    ) internal {
        for (uint8 i = 0; i < whitelist.length; i++) {
            priorityDepositorWhitelist[dao][proposalId].add(whitelist[i]);
        }
    }

    function getPriorityDepositeWhiteList(
        DaoRegistry dao,
        bytes32 proposalId
    ) external view returns (address[] memory) {
        return priorityDepositorWhitelist[dao][proposalId].values();
    }

    function allDone(DaoRegistry dao) external view returns (bool) {
        return unDoneProposals[address(dao)].length() > 0 ? false : true;
    }

    function isPriorityDepositer(
        DaoRegistry dao,
        bytes32 proposalId,
        address account
    ) public view returns (bool) {
        if (
            dao.getConfiguration(
                DaoHelper.COLLECTIVE_PRIORITY_DEPOSITE_ENABLE
            ) == 1
        ) {
            uint256 vtype = dao.getConfiguration(
                DaoHelper.COLLECTIVE_PRIORITY_DEPOSITE_TYPE
            );
            address token = dao.getAddressConfiguration(
                DaoHelper.COLLECTIVE_PRIORITY_DEPOSITE_TOKEN_ADDRESS
            );
            uint256 tokenAmount = dao.getConfiguration(
                DaoHelper.COLLECTIVE_PRIORITY_DEPOSITE_AMOUNT
            );
            uint256 tokenId = dao.getConfiguration(
                DaoHelper.COLLECTIVE_PRIORITY_DEPOSITE_TOKENID
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
                priorityDepositorWhitelist[dao][proposalId].contains(account)
            ) return true;
            else {
                return false;
            }
        }
        return false;
    }
}
