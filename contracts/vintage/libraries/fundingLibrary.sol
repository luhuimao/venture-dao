pragma solidity ^0.8.0;
import "../adapters/VintageFundingPoolAdapter.sol";
import "../../helpers/DaoHelper.sol";

// SPDX-License-Identifier: MIT

library FundingLibrary {
    // proposal  status
    enum ProposalState {
        IN_QUEUE,
        IN_VOTING_PROGRESS,
        IN_EXECUTE_PROGRESS,
        DONE,
        FAILED
    }

    uint256 public constant PERCENTAGE_PRECISION = 1e18;
    string public constant PROPOSALID_PREFIX = "Investment#";

    struct ProposalInfo {
        address fundingToken; // The token in which the project team to trade off.
        uint256 fundingAmount; // The amount project team requested.
        uint256 totalAmount;
        uint256 price;
        address recipientAddr; // The receiver address that will receive the funds.
        address proposer;
        ProposalState status; // The distribution status.
        VestInfo vestInfo;
        ProposalReturnTokenInfo proposalReturnTokenInfo;
        ProposalTimeInfo proposalTimeInfo;
    }

    struct ProposalReturnTokenInfo {
        bool escrow;
        address returnToken;
        uint256 returnTokenAmount; //project token amount for trading off
        address approveOwnerAddr; // owner address when approve
        bool nftEnable;
        address erc721;
    }

    struct ProposalTimeInfo {
        uint256 inQueueTimestamp;
        uint256 proposalStartVotingTimestamp; //project start voting timestamp
        uint256 proposalStopVotingTimestamp;
        uint256 proposalExecuteTimestamp;
    }

    struct VestInfo {
        string name;
        string description;
        uint256 vestingStartTime;
        uint256 vetingEndTime;
        uint256 vestingCliffEndTime;
        uint256 vestingCliffLockAmount;
        uint256 vestingInterval;
    }

    // struct ReturnTokenInfo {
    //     bool escrow;
    //     address returnToken;
    //     uint256 price;
    //     uint256 returnTokenAmount;
    //     address approver;
    // }

    // struct FundingInfo {
    //     uint256 fundingAmount;
    //     address fundingToken;
    //     address receiver;
    // }
    // struct FundingProposalParams {
    //     FundingInfo fundingInfo;
    //     ReturnTokenInfo returnTokenInfo;
    //     VestInfo vestInfo;
    // }

    function createNewFundingProposal(
        ProposalInfo memory proposal,
        DaoRegistry dao,
        uint256[11] calldata _uint256Args,
        address[6] calldata _addressArgs,
        bool escrow,
        bool nft,
        string memory vestName,
        string memory vestDest
    ) public returns (ProposalInfo memory) {
        VintageFundingPoolAdapterContract fundingPoolAdapt = VintageFundingPoolAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_POOL_ADAPT)
            );
        fundingPoolAdapt.processFundRaise(dao);
        require(
            fundingPoolAdapt.daoFundRaisingStates(address(dao)) ==
                DaoHelper.FundRaiseState.DONE &&
                block.timestamp > DaoHelper.getVintageFundStartTime(dao) &&
                block.timestamp < DaoHelper.getVintageFundEndTime(dao),
            "Funding::submitProposal::only can submit proposal in investing period"
        );

        proposal.fundingAmount = _uint256Args[0];
        proposal.price = _uint256Args[1];
        // proposal.totalAmount = _uint256Args[2];
        uint256 totalFund = (proposal.fundingAmount * PERCENTAGE_PRECISION) /
            (PERCENTAGE_PRECISION -
                (fundingPoolAdapt.protocolFee() +
                    dao.getConfiguration(DaoHelper.MANAGEMENT_FEE) +
                    dao.getConfiguration(
                        DaoHelper.VINTAGE_PROPOSER_TOKEN_REWARD_RADIO
                    )));
        proposal.totalAmount = totalFund;
        // proposal.proposalReturnTokenInfo.returnTokenAmount = _uint256Args[2];

        proposal.proposalTimeInfo.inQueueTimestamp = _uint256Args[2];
        proposal.proposalTimeInfo.proposalStartVotingTimestamp = _uint256Args[
            3
        ];
        proposal.proposalTimeInfo.proposalStopVotingTimestamp = _uint256Args[4];
        proposal.proposalTimeInfo.proposalExecuteTimestamp = _uint256Args[5];

        proposal.fundingToken = _addressArgs[0];
        proposal.proposalReturnTokenInfo.approveOwnerAddr = _addressArgs[1];
        proposal.proposalReturnTokenInfo.returnToken = _addressArgs[2];

        proposal.proposer = _addressArgs[3];
        proposal.recipientAddr = _addressArgs[4];

        proposal.vestInfo.name = vestName;
        proposal.vestInfo.description = vestDest;
        proposal.vestInfo.vestingStartTime = _uint256Args[6];
        proposal.vestInfo.vestingCliffEndTime = _uint256Args[7];
        proposal.vestInfo.vetingEndTime = _uint256Args[8];
        proposal.vestInfo.vestingCliffLockAmount = _uint256Args[9];
        proposal.vestInfo.vestingInterval = _uint256Args[10];

        proposal.proposalReturnTokenInfo.escrow = escrow;
        proposal.proposalReturnTokenInfo.nftEnable = nft;
        proposal.proposalReturnTokenInfo.erc721 = _addressArgs[5];
        if (proposal.proposalReturnTokenInfo.escrow) {
            require(
                proposal.vestInfo.vestingStartTime > 0 &&
                    proposal.vestInfo.vetingEndTime >=
                    proposal.vestInfo.vestingStartTime &&
                    proposal.vestInfo.vestingCliffEndTime >=
                    proposal.vestInfo.vestingStartTime &&
                    proposal.vestInfo.vestingCliffEndTime <=
                    proposal.vestInfo.vetingEndTime &&
                    proposal.vestInfo.vestingInterval > 0,
                "Funding::submitProposal::vesting time invalid"
            );
            require(
                proposal.price > 0,
                "Funding::submitProposal::price must > 0"
            );
            uint256 returnTokenAmount = (proposal.fundingAmount *
                PERCENTAGE_PRECISION) / proposal.price;

            require(
                proposal.vestInfo.vestingCliffLockAmount <=
                    PERCENTAGE_PRECISION,
                "invalid vesting cliff amount"
            );

            require(
                returnTokenAmount > 0,
                "Funding::submitProposal::invalid return token token Amount"
            );
            proposal
                .proposalReturnTokenInfo
                .returnTokenAmount = returnTokenAmount;
        }

        if (proposal.proposalReturnTokenInfo.nftEnable) {}

        require(
            proposal.fundingAmount > 0,
            "Funding::submitProposal::invalid funding token Amount"
        );

        require(
            proposal.recipientAddr != address(0x0),
            "Funding::submitProposal::invalid receiver address"
        );

        proposal.status = ProposalState.IN_QUEUE;

        return proposal;
    }

    // function startVotingCheck(
    //     ProposalInfo memory proposal,
    //     DaoRegistry dao
    // ) public view{
    //     VintageFundingPoolAdapterContract fundingPoolAdapt = VintageFundingPoolAdapterContract(
    //             dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_POOL_ADAPT)
    //         );

    //     // make sure there is no proposal in progress during redempt duration
    //     require(
    //         !fundingPoolAdapt.ifInRedemptionPeriod(
    //             dao,
    //             block.timestamp +
    //                 dao.getConfiguration(DaoHelper.VOTING_PERIOD) +
    //                 dao.getConfiguration(DaoHelper.PROPOSAL_EXECUTE_DURATION)
    //         ),
    //         "Funding::startVotingProcess::meet redempte period"
    //     );

    //     require(
    //         proposal.status == FundingLibrary.ProposalState.IN_QUEUE,
    //         "Funding::startVotingProcess::proposal state not satisfied"
    //     );
    // }

    // function setInVotingProcess(
    //     ProposalInfo memory proposal,
    //     DaoRegistry dao,
    //     bytes32 proposalId
    // ) public {
    //     IVintageVoting votingContract = IVintageVoting(
    //         dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
    //     );
    //     // Starts the voting process for the proposal. setting voting start time
    //     votingContract.startNewVotingForProposal(
    //         dao,
    //         proposalId,
    //         block.timestamp,
    //         bytes("")
    //     );

    //     proposal.proposalTimeInfo.proposalStartVotingTimestamp = block
    //         .timestamp;
    //     proposal.proposalTimeInfo.proposalStopVotingTimestamp =
    //         block.timestamp +
    //         dao.getConfiguration(DaoHelper.VOTING_PERIOD);

    //     proposal.status = FundingLibrary.ProposalState.IN_VOTING_PROGRESS;
    // }

    // function startVotingForProposal(
    //     ProposalInfo memory proposal,
    //     DaoRegistry dao
    // ) public view {
    //     VintageFundingPoolAdapterContract fundingPoolAdapt = VintageFundingPoolAdapterContract(
    //             dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_POOL_ADAPT)
    //         );
    //     uint256 _propsalStartVotingTimestamp = block.timestamp;
    //     uint256 _propsalStopVotingTimestamp = _propsalStartVotingTimestamp +
    //         dao.getConfiguration(DaoHelper.VOTING_PERIOD);
    //     //make sure there is no proposal in progress during redempt duration
    //     require(
    //         fundingPoolAdapt.ifInRedemptionPeriod(
    //             dao,
    //             _propsalStopVotingTimestamp +
    //                 dao.getConfiguration(DaoHelper.PROPOSAL_EXECUTE_DURATION)
    //         ),
    //         "Funding::startVotingProcess::meet redempte period"
    //     );

    //     require(
    //         proposal.status == ProposalState.IN_QUEUE,
    //         "Funding::startVotingProcess::proposal state not satisfied"
    //     );
    // }

    function executeFundingProposal(
        ProposalInfo memory proposal
    ) public view returns (ProposalInfo memory) {
        require(
            block.timestamp >
                proposal.proposalTimeInfo.proposalStopVotingTimestamp,
            "Funding::processProposal::proposal in voting period"
        );

        require(
            proposal.status != ProposalState.IN_EXECUTE_PROGRESS,
            "Funding::processProposal::proposal already in execute progress"
        );
        return proposal;
    }
}
