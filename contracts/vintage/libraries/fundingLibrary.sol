pragma solidity ^0.8.0;
import "../adapters/VintageFundingPoolAdapter.sol";
import "../../helpers/DaoHelper.sol";

// SPDX-License-Identifier: MIT

library InvestmentLibrary {
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
        address investmentToken; // The token in which the project team to trade off.
        uint256 investmentAmount; // The amount project team requested.
        uint256 totalAmount;
        uint256 price;
        address recipientAddr; // The receiver address that will receive the funds.
        address proposer;
        ProposalState status; // The distribution status.
        VestInfo vestInfo;
        ProposalPaybackTokenInfo proposalPaybackTokenInfo;
        ProposalTimeInfo proposalTimeInfo;
        uint256 executeBlockNum;
    }

    struct ProposalPaybackTokenInfo {
        bool escrow;
        address paybackToken;
        uint256 paybackTokenAmount; //project token amount for trading off
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

    function createNewInvestmentProposal(
        ProposalInfo memory proposal,
        DaoRegistry dao,
        uint256[11] calldata _uint256Args,
        address[6] calldata _addressArgs,
        bool escrow,
        bool nft,
        string memory vestName,
        string memory vestDest
    ) public returns (ProposalInfo memory) {
        VintageFundingPoolAdapterContract investmentPoolAdapt = VintageFundingPoolAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_ADAPT)
            );
        investmentPoolAdapt.processFundRaise(dao);
        require(
            investmentPoolAdapt.daoFundRaisingStates(address(dao)) ==
                DaoHelper.FundRaiseState.DONE &&
                block.timestamp > DaoHelper.getVintageFundStartTime(dao) &&
                block.timestamp < DaoHelper.getVintageFundEndTime(dao),
            "Only can submit proposal in investing period"
        );

        proposal.investmentAmount = _uint256Args[0];
        proposal.price = _uint256Args[1];
        // proposal.totalAmount = _uint256Args[2];
        uint256 totalFund = (proposal.investmentAmount * PERCENTAGE_PRECISION) /
            (PERCENTAGE_PRECISION -
                (investmentPoolAdapt.protocolFee() +
                    dao.getConfiguration(DaoHelper.MANAGEMENT_FEE) +
                    dao.getConfiguration(
                        DaoHelper.VINTAGE_PROPOSER_TOKEN_REWARD_RADIO
                    )));
        proposal.totalAmount = totalFund;

        proposal.proposalTimeInfo.inQueueTimestamp = _uint256Args[2];
        proposal.proposalTimeInfo.proposalStartVotingTimestamp = _uint256Args[
            3
        ];
        proposal.proposalTimeInfo.proposalStopVotingTimestamp = _uint256Args[4];
        proposal.proposalTimeInfo.proposalExecuteTimestamp = _uint256Args[5];

        proposal.investmentToken = _addressArgs[0];
        proposal.proposalPaybackTokenInfo.approveOwnerAddr = _addressArgs[1];
        proposal.proposalPaybackTokenInfo.paybackToken = _addressArgs[2];

        proposal.proposer = _addressArgs[3];
        proposal.recipientAddr = _addressArgs[4];

        proposal.vestInfo.name = vestName;
        proposal.vestInfo.description = vestDest;
        proposal.vestInfo.vestingStartTime = _uint256Args[6];
        proposal.vestInfo.vestingCliffEndTime = _uint256Args[7];
        proposal.vestInfo.vetingEndTime = _uint256Args[8];
        proposal.vestInfo.vestingCliffLockAmount = _uint256Args[9];
        proposal.vestInfo.vestingInterval = _uint256Args[10];

        proposal.proposalPaybackTokenInfo.escrow = escrow;
        proposal.proposalPaybackTokenInfo.nftEnable = nft;
        proposal.proposalPaybackTokenInfo.erc721 = _addressArgs[5];
        if (proposal.proposalPaybackTokenInfo.escrow) {
            require(
                proposal.vestInfo.vestingStartTime > 0 &&
                    proposal.vestInfo.vetingEndTime >=
                    proposal.vestInfo.vestingStartTime &&
                    proposal.vestInfo.vestingCliffEndTime >=
                    proposal.vestInfo.vestingStartTime &&
                    proposal.vestInfo.vestingCliffEndTime <=
                    proposal.vestInfo.vetingEndTime &&
                    proposal.vestInfo.vestingInterval > 0,
                "vesting time invalid"
            );
            require(proposal.price > 0, "price must > 0");
            uint256 paybackTokenAmount = (proposal.investmentAmount *
                PERCENTAGE_PRECISION) / proposal.price;

            require(
                proposal.vestInfo.vestingCliffLockAmount <=
                    PERCENTAGE_PRECISION,
                "invalid vesting cliff amount"
            );

            require(
                paybackTokenAmount > 0,
                "invalid return token token Amount"
            );
            proposal
                .proposalPaybackTokenInfo
                .paybackTokenAmount = paybackTokenAmount;
        }

        if (proposal.proposalPaybackTokenInfo.nftEnable) {}

        require(
            proposal.investmentAmount > 0,
            "Invalid Investment Token Amount"
        );

        require(
            proposal.recipientAddr != address(0x0),
            "Invalid Receiver Address"
        );

        proposal.status = ProposalState.IN_QUEUE;

        return proposal;
    }
}
