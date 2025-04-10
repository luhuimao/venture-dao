pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT
// import "hardhat/console.sol";
import "./interfaces/IFlexFunding.sol";
import "../../guards/AdapterGuard.sol";
import "../../guards/MemberGuard.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "./FlexFundingReturnTokenAdapter.sol";
import "./FlexDaoSetAdapter.sol";
import "./FlexFundingHelper.sol";
import "./FlexPollingVoting.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../utils/TypeConver.sol";

contract FlexFundingAdapterContract is
    IFlexFunding,
    AdapterGuard,
    MemberGuard,
    Reimbursable
{
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    /*
     * PUBLIC VARIABLES
     */
    // Keeps track of all the Proposals executed per DAO.
    mapping(address => mapping(bytes32 => ProposalInfo)) public Proposals;
    mapping(address => mapping(bytes32 => EnumerableSet.AddressSet)) priorityDepositWhitelist;
    mapping(address => EnumerableSet.AddressSet) proposerWhiteList;
    mapping(address => EnumerableSet.Bytes32Set) unDoneProposals;

    uint256 public constant RETRUN_TOKEN_AMOUNT_PRECISION = 1e18;
    uint256 public protocolFee = (3 * RETRUN_TOKEN_AMOUNT_PRECISION) / 1000; // 0.3%
    address public protocolAddress =
        address(0x9ac9c636404C8d46D9eb966d7179983Ba5a3941A);

    modifier onlyDaoFactoryOwner(DaoRegistry dao) {
        if (msg.sender != DaoHelper.daoFactoryAddress(dao))
            revert ACCESS_DENIED();
        _;
    }

    // modifier onlyProposer(DaoRegistry dao) {
    //     if (dao.getConfiguration(DaoHelper.FLEX_PROPOSER_ENABLE) == 1) {
    //         //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
    //         if (
    //             dao.getConfiguration(
    //                 DaoHelper.FLEX_PROPOSER_IDENTIFICATION_TYPE
    //             ) == 0
    //         ) {
    //             if (
    //                 IERC20(
    //                     dao.getAddressConfiguration(
    //                         DaoHelper.FLEX_PROPOSER_TOKEN_ADDRESS
    //                     )
    //                 ).balanceOf(msg.sender) <
    //                 dao.getConfiguration(DaoHelper.FLEX_PROPOSER_MIN_HOLDING)
    //             ) revert NOT_MEET_ERC20_REQUIREMENT();
    //         }
    //         if (
    //             dao.getConfiguration(
    //                 DaoHelper.FLEX_PROPOSER_IDENTIFICATION_TYPE
    //             ) == 1
    //         ) {
    //             if (
    //                 IERC721(
    //                     dao.getAddressConfiguration(
    //                         DaoHelper.FLEX_PROPOSER_TOKEN_ADDRESS
    //                     )
    //                 ).balanceOf(msg.sender) <
    //                 dao.getConfiguration(DaoHelper.FLEX_PROPOSER_MIN_HOLDING)
    //             ) revert NOT_MEET_ERC721_REQUIREMENT();
    //         }
    //         if (
    //             dao.getConfiguration(
    //                 DaoHelper.FLEX_PROPOSER_IDENTIFICATION_TYPE
    //             ) == 2
    //         ) {
    //             if (
    //                 IERC1155(
    //                     dao.getAddressConfiguration(
    //                         DaoHelper.FLEX_PROPOSER_TOKEN_ADDRESS
    //                     )
    //                 ).balanceOf(
    //                         msg.sender,
    //                         dao.getConfiguration(
    //                             DaoHelper.FLEX_PROPOSER_TOKENID
    //                         )
    //                     ) <
    //                 dao.getConfiguration(DaoHelper.FLEX_PROPOSER_MIN_HOLDING)
    //             ) revert NOT_MEET_ERC1155_REQUIRMENT();
    //         }
    //         if (
    //             dao.getConfiguration(
    //                 DaoHelper.FLEX_PROPOSER_IDENTIFICATION_TYPE
    //             ) == 3
    //         ) {
    //             if (!isProposerWhiteList(dao, msg.sender))
    //                 revert NOT_IN_WHITELIST();
    //         }
    //     }
    //     _;
    // }

    function setProtocolAddress(
        DaoRegistry dao,
        address _protocolAddress
    ) external reentrancyGuard(dao) onlyDaoFactoryOwner(dao) {
        protocolAddress = _protocolAddress;
    }

    function setProtocolFee(
        DaoRegistry dao,
        uint256 _protocolFee
    ) external reentrancyGuard(dao) onlyDaoFactoryOwner(dao) {
        require(
            _protocolFee < RETRUN_TOKEN_AMOUNT_PRECISION && _protocolFee > 0
        );
        protocolFee = _protocolFee;
    }

    modifier OnlyDaosetAccess(DaoRegistry dao) {
        // require(
        //     msg.sender ==
        //         dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER) ||
        //         DaoHelper.isInCreationModeAndHasAccess(dao),
        //     "!access"
        // );
        if (
            msg.sender !=
            dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER) &&
            !DaoHelper.isInCreationModeAndHasAccess(dao)
        ) revert ACCESS_DENIED();
        _;
    }

    function clearProposerWhitelist(
        DaoRegistry dao
    ) external OnlyDaosetAccess(dao) {
        // require(
        //     msg.sender ==
        //         dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER),
        //     "!access"
        // );

        address[] memory tem;
        tem = proposerWhiteList[address(dao)].values();
        uint256 len = tem.length;
        if (len > 0) {
            for (uint8 i = 0; i < len; i++) {
                proposerWhiteList[address(dao)].remove(tem[i]);
            }
        }
    }

    function registerProposerWhiteList(
        DaoRegistry dao,
        address account
    ) external OnlyDaosetAccess(dao) {
        // require(
        //     msg.sender ==
        //         dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER) ||
        //         dao.isMember(msg.sender),
        //     "!access"
        // );
        if (!proposerWhiteList[address(dao)].contains(account)) {
            proposerWhiteList[address(dao)].add(account);
        }
    }

    function submitProposal(
        DaoRegistry dao,
        ProposalParams calldata params
    ) external override reimbursable(dao) {
        FlexFundingHelperAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_HELPER_ADAPTER)
        ).IsProposer(dao, msg.sender);

        // FlexDaoSetHelperAdapterContract daosethelper = FlexDaoSetHelperAdapterContract(
        //         dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER)
        //     );
        // require(daosethelper.isProposalAllDone(dao), "UnDone Daoset Proposal");
        if (
            !FlexDaoSetHelperAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_DAO_SET_HELPER_ADAPTER)
            ).isProposalAllDone(dao)
        ) revert UNDONE_DAO_SET_PROPOSAL();
        if (
            (params.investmentInfo.maxInvestmentAmount > 0 &&
                params.investmentInfo.maxInvestmentAmount <
                params.investmentInfo.minInvestmentAmount) ||
            params.proposerRewardInfo.cashRewardAmount >
            RETRUN_TOKEN_AMOUNT_PRECISION
        ) revert InvalidInvestmentInfoParams();
        if (
            params.fundRaiseInfo.investorIdentification == true &&
            params.fundRaiseInfo.investorIdentificationInfo.bType !=
            InvestorIdentificationType.WHITE_LIST &&
            (params.fundRaiseInfo.investorIdentificationInfo.bTokanAddr ==
                address(0x0) ||
                params
                    .fundRaiseInfo
                    .investorIdentificationInfo
                    .bMinHoldingAmount <=
                0)
        ) revert InvalidInvestorIdentificationParams();

        if (
            params.fundRaiseInfo.priorityDepositInfo.enable == true &&
            params.fundRaiseInfo.priorityDepositInfo.pType !=
            PriorityDepositType.WHITE_LIST &&
            (params.fundRaiseInfo.priorityDepositInfo.token == address(0x0) ||
                params.fundRaiseInfo.priorityDepositInfo.amount <= 0)
        ) revert InvalidInvestorPriorityDepositParams();

        SubmitProposalLocalVars memory vars;

        // vars.flexVotingContract = IFlexVoting(
        //     dao.getAdapterAddress(DaoHelper.FLEX_POLLING_VOTING_ADAPT)
        // );
        dao.increaseInvestmentId();
        vars.proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "Investment#",
                Strings.toString(dao.getCurrentInvestmentProposalId())
            )
        );
        if (params.investmentInfo.escrow) {
            if (
                params.investmentInfo.paybackTokenAddr == address(0x0) ||
                params.investmentInfo.approverAddr == address(0x0) ||
                params.investmentInfo.minReturnAmount <= 0
            ) revert InvalidReturnFundParams();
            if (
                params.vestInfo.vestingCliffLockAmount >
                RETRUN_TOKEN_AMOUNT_PRECISION ||
                params.vestInfo.vestingCliffEndTime <
                params.vestInfo.vestingStartTime ||
                params.vestInfo.vestingEndTime <
                params.vestInfo.vestingCliffEndTime
            ) revert InvalidVestingParams();
            if (
                params.proposerRewardInfo.tokenRewardAmount >
                RETRUN_TOKEN_AMOUNT_PRECISION
            ) revert InvalidTokenRewardAmount();
        }

        dao.submitProposal(vars.proposalId);
        InvestmentType _investmentType = dao.getConfiguration(
            DaoHelper.FLEX_INVESTMENT_TYPE
        ) == 0
            ? InvestmentType.DIRECT
            : InvestmentType.POLL;

        Proposals[address(dao)][vars.proposalId] = ProposalInfo(
            msg.sender,
            ProposalInvestmentInfo(
                params.investmentInfo.tokenAddress,
                params.investmentInfo.minInvestmentAmount,
                params.investmentInfo.maxInvestmentAmount,
                0,
                0,
                params.investmentInfo.escrow,
                params.investmentInfo.paybackTokenAddr,
                params.investmentInfo.paybackTokenAmount,
                params.investmentInfo.price,
                params.investmentInfo.minReturnAmount,
                params.investmentInfo.maxReturnAmount,
                params.investmentInfo.approverAddr,
                params.investmentInfo.recipientAddr
            ),
            VestInfo(
                params.vestInfo.vestingStartTime,
                params.vestInfo.vestingCliffEndTime,
                params.vestInfo.vestingEndTime,
                params.vestInfo.vestingInterval,
                params.vestInfo.vestingCliffLockAmount,
                params.vestInfo.nftEnable,
                params.vestInfo.erc721,
                params.vestInfo.vestName,
                params.vestInfo.vestDescription
            ),
            FundRaiseInfo(
                params.fundRaiseInfo.fundRaiseType,
                params.fundRaiseInfo.fundRaiseStartTime,
                params.fundRaiseInfo.fundRaiseEndTime,
                params.fundRaiseInfo.minDepositAmount,
                params.fundRaiseInfo.maxDepositAmount,
                params.fundRaiseInfo.investorIdentification,
                params.fundRaiseInfo.investorIdentificationInfo,
                params.fundRaiseInfo.priorityDepositInfo
            ),
            ProposerRewardInfo(
                params.proposerRewardInfo.tokenRewardAmount,
                params.proposerRewardInfo.cashRewardAmount
            ),
            _investmentType == InvestmentType.POLL ? block.timestamp : 0,
            _investmentType == InvestmentType.POLL
                ? block.timestamp +
                    dao.getConfiguration(DaoHelper.FLEX_POLLING_VOTING_PERIOD)
                : 0,
            _investmentType == InvestmentType.POLL
                ? ProposalStatus.IN_VOTING_PROGRESS
                : ProposalStatus.IN_FUND_RAISE_PROGRESS,
            0
        );

        if (
            params.fundRaiseInfo.priorityDepositInfo.pType ==
            PriorityDepositType.WHITE_LIST
        )
            registerPriorityDepositWhitelist(
                address(dao),
                vars.proposalId,
                params.priorityDepositWhitelist
            );

        // Starts the voting process for the proposal.
        IFlexVoting(dao.getAdapterAddress(DaoHelper.FLEX_POLLING_VOTING_ADAPT))
            .startNewVotingForProposal(dao, vars.proposalId, bytes(""));

        // Sponsors the guild kick proposal.
        dao.sponsorProposal(
            vars.proposalId,
            dao.getAdapterAddress(DaoHelper.FLEX_POLLING_VOTING_ADAPT)
        );
        // register proposalId into investment pool
        // vars.flexInvestmentPoolExt = FlexInvestmentPoolExtension(
        //     dao.getExtensionAddress(DaoHelper.FLEX_INVESTMENT_POOL_EXT)
        // );
        if (_investmentType == InvestmentType.DIRECT) {
            FlexInvestmentPoolExtension(
                dao.getExtensionAddress(DaoHelper.FLEX_INVESTMENT_POOL_EXT)
            ).registerPotentialNewInvestmentProposal(vars.proposalId);
        }
        unDoneProposals[address(dao)].add(vars.proposalId);
        emit ProposalCreated(address(dao), vars.proposalId, msg.sender);
    }

    function processProposal(
        DaoRegistry dao,
        bytes32 proposalId,
        address target
    ) external override reimbursable(dao) returns (bool) {
        ProcessProposalLocalVars memory vars;
        ProposalInfo storage proposal = Proposals[address(dao)][proposalId];

        vars.flexInvestmentPoolAdapt = FlexInvestmentPoolAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_INVESTMENT_POOL_ADAPT)
        );
        vars.flexInvestmentPoolExt = FlexInvestmentPoolExtension(
            dao.getExtensionAddress(DaoHelper.FLEX_INVESTMENT_POOL_EXT)
        );

        if (proposal.state == ProposalStatus.IN_VOTING_PROGRESS) {
            if (block.timestamp <= proposal.stopVoteTime)
                revert PROPOSAL_IN_VOTING_PERIOD();
            // Checks if the proposal has passed.
            vars.flexVoting = FlexPollingVotingContract(
                dao.votingAdapter(proposalId)
            );

            if (address(vars.flexVoting) == address(0x0))
                revert ADAPTER_NOT_FOUND();

            (vars.voteResult, , ) = vars.flexVoting.voteResult(dao, proposalId);
            if (vars.voteResult == IFlexVoting.VotingState.PASS) {
                proposal.state = ProposalStatus.IN_FUND_RAISE_PROGRESS;
                vars
                    .flexInvestmentPoolExt
                    .registerPotentialNewInvestmentProposal(proposalId);
            } else {
                proposal.state = ProposalStatus.FAILED;
            }
        } else if (proposal.state == ProposalStatus.IN_FUND_RAISE_PROGRESS) {
            vars.flexInvestmentPoolAdapt.escorwExtraFreeInFund(dao, proposalId);
            vars.poolBalance = vars
                .flexInvestmentPoolAdapt
                .getTotalFundByProposalId(dao, proposalId);
            vars.propodalInvestmentToken = proposal.investmentInfo.tokenAddress;
            if (proposal.fundRaiseInfo.fundRaiseEndTime > block.timestamp)
                revert FundRaiseEndTimeNotUP();
            dao.processProposal(proposalId);
            vars.protocolFee =
                (vars.poolBalance * protocolFee) /
                RETRUN_TOKEN_AMOUNT_PRECISION;
            vars.managementFee = dao.getConfiguration(
                DaoHelper.FLEX_MANAGEMENT_FEE_TYPE
            ) == 0
                ? (vars.poolBalance *
                    dao.getConfiguration(
                        DaoHelper.FLEX_MANAGEMENT_FEE_AMOUNT
                    )) / RETRUN_TOKEN_AMOUNT_PRECISION
                : dao.getConfiguration(DaoHelper.FLEX_MANAGEMENT_FEE_AMOUNT); // type 0:percentage of fund pool  type 1: fixed amount
            vars.proposerReward =
                (vars.poolBalance *
                    proposal.proposerRewardInfo.cashRewardAmount) /
                RETRUN_TOKEN_AMOUNT_PRECISION;
            if (
                vars.poolBalance >=
                proposal.investmentInfo.minInvestmentAmount +
                    vars.protocolFee +
                    vars.managementFee +
                    vars.proposerReward
            ) {
                proposal.investmentInfo.finalRaisedAmount = vars.poolBalance;
                proposal.investmentInfo.investedAmount =
                    vars.poolBalance -
                    vars.protocolFee -
                    vars.managementFee -
                    vars.proposerReward;

                if (proposal.investmentInfo.escrow) {
                    // calculate && update payback token amount
                    vars.decimals1 = ERC20(proposal.investmentInfo.tokenAddress)
                        .decimals();
                    vars.decimals2 = ERC20(
                        proposal.investmentInfo.paybackTokenAddr
                    ).decimals();

                    vars.paybackTokenAmount = ((proposal
                        .investmentInfo
                        .investedAmount * RETRUN_TOKEN_AMOUNT_PRECISION) /
                        proposal.investmentInfo.price);

                    if (
                        vars.paybackTokenAmount >
                        (proposal.investmentInfo.maxInvestmentAmount *
                            RETRUN_TOKEN_AMOUNT_PRECISION) /
                            proposal.investmentInfo.price
                    )
                        vars.paybackTokenAmount =
                            (proposal.investmentInfo.maxInvestmentAmount *
                                RETRUN_TOKEN_AMOUNT_PRECISION) /
                            proposal.investmentInfo.price;

                    if (vars.decimals1 > vars.decimals2) {
                        vars.decimalsChanged = vars.decimals1 - vars.decimals2;
                        vars.paybackTokenAmount =
                            vars.paybackTokenAmount /
                            10 ** vars.decimalsChanged;
                    }
                    if (vars.decimals1 < vars.decimals2) {
                        vars.decimalsChanged = vars.decimals2 - vars.decimals1;
                        vars.paybackTokenAmount =
                            vars.paybackTokenAmount *
                            10 ** vars.decimalsChanged;
                    }

                    proposal.investmentInfo.paybackTokenAmount = vars
                        .paybackTokenAmount;

                    if (
                        !_escrowToken(
                            dao,
                            proposal.investmentInfo.approverAddr,
                            proposal.investmentInfo.paybackTokenAddr,
                            vars.paybackTokenAmount,
                            proposalId
                        )
                    ) {
                        proposal.state = ProposalStatus.FAILED;
                        proposal.executeBlockNum = block.number;
                        if (unDoneProposals[address(dao)].contains(proposalId))
                            unDoneProposals[address(dao)].remove(proposalId);
                        emit ProposalExecuted(
                            address(dao),
                            proposalId,
                            proposal.state,
                            vars.investors
                        );
                        return false;
                    }

                    vars.flexAllocAdapt = FlexAllocationAdapterContract(
                        dao.getAdapterAddress(DaoHelper.FLEX_ALLOCATION_ADAPT)
                    );
                    // console.log("allocateProjectToken");
                    vars.flexAllocAdapt.allocateProjectToken(
                        dao,
                        proposal.investmentInfo.paybackTokenAddr,
                        proposal.proposer,
                        proposalId,
                        [
                            vars.paybackTokenAmount,
                            proposal.vestInfo.vestingStartTime,
                            proposal.vestInfo.vestingCliffEndTime -
                                proposal.vestInfo.vestingStartTime,
                            proposal.vestInfo.vestingInterval,
                            proposal.vestInfo.vestingInterval
                        ]
                    );
                }

                //1
                proposal.state = ProposalStatus.IN_EXECUTE_PROGRESS;

                //2 protocol fee
                if (vars.protocolFee > 0) {
                    // vars.flexInvestmentPoolExt.withdrawFromAll(
                    //     proposalId,
                    //     protocolAddress,
                    //     vars.propodalInvestmentToken,
                    //     vars.protocolFee
                    // );
                    vars.flexInvestmentPoolExt.distributeProtocolFee(
                        proposalId,
                        vars.propodalInvestmentToken,
                        vars.protocolFee,
                        target
                    );
                }

                //3 management fee
                if (vars.managementFee > 0) {
                    vars.flexInvestmentPoolExt.withdrawFromAll(
                        proposalId,
                        dao.getAddressConfiguration(
                            DaoHelper.FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS
                        ),
                        vars.propodalInvestmentToken,
                        vars.managementFee
                    );
                }

                //4 proposer reward
                if (vars.proposerReward > 0) {
                    vars.flexInvestmentPoolExt.withdrawFromAll(
                        proposalId,
                        proposal.proposer,
                        vars.propodalInvestmentToken,
                        vars.proposerReward
                    );
                }

                // 5 send investment token to recipient
                vars.flexInvestmentPoolExt.withdrawFromAll(
                    proposalId,
                    proposal.investmentInfo.recipientAddr,
                    vars.propodalInvestmentToken,
                    vars.poolBalance -
                        vars.protocolFee -
                        vars.managementFee -
                        vars.proposerReward
                );

                //7 substract
                vars.investors = vars.flexInvestmentPoolExt.substractFromAll(
                    proposalId,
                    vars.poolBalance
                );

                proposal.state = ProposalStatus.DONE;
            } else {
                // didt meet the min investment amount
                proposal.state = ProposalStatus.FAILED;
                proposal.executeBlockNum = block.number;

                if (unDoneProposals[address(dao)].contains(proposalId))
                    unDoneProposals[address(dao)].remove(proposalId);
                emit ProposalExecuted(
                    address(dao),
                    proposalId,
                    proposal.state,
                    vars.investors
                );
                return false;
            }
        } else {
            revert NotInExecuteState();
        }
        if (unDoneProposals[address(dao)].contains(proposalId))
            unDoneProposals[address(dao)].remove(proposalId);

        proposal.executeBlockNum = block.number;
        emit ProposalExecuted(
            address(dao),
            proposalId,
            proposal.state,
            vars.investors
        );
        return true;
    }

    function retrunTokenToApprover(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        ProposalInfo storage proposal = Proposals[address(dao)][proposalId];
        FlexInvestmentPaybackTokenAdapterContract flexInvestmentPaybackTokenAdapt = FlexInvestmentPaybackTokenAdapterContract(
                dao.getAdapterAddress(
                    DaoHelper.FLEX_INVESTMENT_PAYBACI_TOKEN_ADAPT
                )
            );
        flexInvestmentPaybackTokenAdapt.withdrawInvestmentPaybackToken(
            dao,
            proposalId,
            proposal.investmentInfo.paybackTokenAddr,
            msg.sender,
            proposal.state
        );
    }

    function isProposerWhiteList(
        DaoRegistry dao,
        address account
    ) public view returns (bool) {
        return proposerWhiteList[address(dao)].contains(account);
    }

    function getProposerWhitelist(
        DaoRegistry dao
    ) public view returns (address[] memory) {
        return proposerWhiteList[address(dao)].values();
    }

    /*
     * INTERNAL
     */

    function _escrowToken(
        DaoRegistry dao,
        address approver,
        address paybackToken,
        uint256 escrowAmount,
        bytes32 proposalId
    ) internal returns (bool) {
        FlexInvestmentPaybackTokenAdapterContract flexInvestmentPaybackTokenAdapt = FlexInvestmentPaybackTokenAdapterContract(
                dao.getAdapterAddress(
                    DaoHelper.FLEX_INVESTMENT_PAYBACI_TOKEN_ADAPT
                )
            );
        return
            flexInvestmentPaybackTokenAdapt.escrowInvestmentPaybackToken(
                escrowAmount,
                dao,
                approver,
                paybackToken,
                proposalId
            );
    }

    function registerPriorityDepositWhitelist(
        address dao,
        bytes32 proposalId,
        address[] memory whitelist
    ) internal {
        for (uint8 i = 0; i < whitelist.length; i++) {
            if (
                !priorityDepositWhitelist[dao][proposalId].contains(
                    whitelist[i]
                )
            ) priorityDepositWhitelist[dao][proposalId].add(whitelist[i]);
        }
    }

    function getPriorityDepositedWhitelist(
        DaoRegistry dao,
        bytes32 proposalId
    ) external view returns (address[] memory) {
        return priorityDepositWhitelist[address(dao)][proposalId].values();
    }

    function isPriorityDepositedWhitelist(
        DaoRegistry dao,
        bytes32 proposalId,
        address account
    ) external view returns (bool) {
        return
            priorityDepositWhitelist[address(dao)][proposalId].contains(
                account
            );
    }

    function allDone(DaoRegistry dao) external view returns (bool) {
        return unDoneProposals[address(dao)].length() > 0 ? false : true;
    }
}
