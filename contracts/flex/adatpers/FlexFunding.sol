pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT
// import "hardhat/console.sol";
import "./interfaces/IFlexFunding.sol";
import "../../guards/AdapterGuard.sol";
import "../../guards/MemberGuard.sol";
// import "../../guards/FlexProposerGuard.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "./FlexFundingReturnTokenAdapter.sol";

contract FlexFundingAdapterContract is
    IFlexFunding,
    AdapterGuard,
    MemberGuard,
    Reimbursable
{
    using EnumerableSet for EnumerableSet.AddressSet;

    /*
     * PUBLIC VARIABLES
     */
    // Keeps track of all the Proposals executed per DAO.
    mapping(address => mapping(bytes32 => ProposalInfo)) public Proposals;

    // Keeps track of all the locked token amount per DAO.
    // mapping(address => mapping(bytes32 => mapping(address => uint256)))
    //     public escrowedTokens;
    mapping(address => EnumerableSet.AddressSet) proposerWhiteList;
    // uint256 public proposalIds = 1;
    uint256 public constant RETRUN_TOKEN_AMOUNT_PRECISION = 1e18;
    uint256 public protocolFee = (3 * RETRUN_TOKEN_AMOUNT_PRECISION) / 1000; // 0.3%
    address public protocolAddress =
        address(0x9ac9c636404C8d46D9eb966d7179983Ba5a3941A);

    modifier onlyDaoFactoryOwner(DaoRegistry dao) {
        require(msg.sender == DaoHelper.daoFactoryAddress(dao), "Access Deny");
        _;
    }

    modifier onlyProposer(DaoRegistry dao) {
        if (dao.getConfiguration(DaoHelper.FLEX_PROPOSER_ENABLE) == 1) {
            //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
            if (
                dao.getConfiguration(
                    DaoHelper.FLEX_PROPOSER_IDENTIFICATION_TYPE
                ) == 0
            ) {
                require(
                    IERC20(
                        dao.getAddressConfiguration(
                            DaoHelper.FLEX_PROPOSER_TOKEN_ADDRESS
                        )
                    ).balanceOf(msg.sender) >=
                        dao.getConfiguration(
                            DaoHelper.FLEX_PROPOSER_MIN_HOLDING
                        ),
                    "dont meet min erc20 token holding requirment"
                );
            }
            if (
                dao.getConfiguration(
                    DaoHelper.FLEX_PROPOSER_IDENTIFICATION_TYPE
                ) == 1
            ) {
                require(
                    IERC721(
                        dao.getAddressConfiguration(
                            DaoHelper.FLEX_PROPOSER_TOKEN_ADDRESS
                        )
                    ).balanceOf(msg.sender) >=
                        dao.getConfiguration(
                            DaoHelper.FLEX_PROPOSER_MIN_HOLDING
                        ),
                    "dont meet min erc721 token holding requirment"
                );
            }
            if (
                dao.getConfiguration(
                    DaoHelper.FLEX_PROPOSER_IDENTIFICATION_TYPE
                ) == 2
            ) {
                require(
                    IERC1155(
                        dao.getAddressConfiguration(
                            DaoHelper.FLEX_PROPOSER_TOKEN_ADDRESS
                        )
                    ).balanceOf(
                            msg.sender,
                            dao.getConfiguration(
                                DaoHelper.FLEX_PROPOSER_TOKENID
                            )
                        ) >=
                        dao.getConfiguration(
                            DaoHelper.FLEX_PROPOSER_MIN_HOLDING
                        ),
                    "dont meet min erc1155 token holding requirment"
                );
            }
            if (
                dao.getConfiguration(
                    DaoHelper.FLEX_PROPOSER_IDENTIFICATION_TYPE
                ) == 3
            ) {
                require(
                    isProposerWhiteList(dao, msg.sender),
                    "not in whitelist"
                );
            }
        }
        _;
    }

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

    function registerProposerWhiteList(
        DaoRegistry dao,
        address account
    ) external onlyMember(dao) {
        if (!proposerWhiteList[address(dao)].contains(account)) {
            proposerWhiteList[address(dao)].add(account);
        }
    }

    function submitProposal(
        DaoRegistry dao,
        ProposalParams calldata params
    )
        external
        override
        reimbursable(dao)
        onlyProposer(dao)
        returns (bytes32 proposalId)
    {
        if (
            (params.fundingInfo.maxFundingAmount > 0 &&
                params.fundingInfo.maxFundingAmount <
                params.fundingInfo.minFundingAmount) ||
            params.proposerRewardInfo.cashRewardAmount >
            RETRUN_TOKEN_AMOUNT_PRECISION
        ) revert InvalidFundingInfoParams();
        if (
            params.fundRaiseInfo.backerIdentification == true &&
            params.fundRaiseInfo.bakckerIdentificationInfo.bType !=
            BackerIdentificationType.WHITE_LIST &&
            (params.fundRaiseInfo.bakckerIdentificationInfo.bTokanAddr ==
                address(0x0) ||
                params
                    .fundRaiseInfo
                    .bakckerIdentificationInfo
                    .bMinHoldingAmount <=
                0)
        ) revert InvalidBackerIdentificationParams();

        if (
            params.fundRaiseInfo.priorityDeposit == true &&
            params.fundRaiseInfo.priorityDepositInfo.pType !=
            PriorityDepositType.WHITE_LIST &&
            (params.fundRaiseInfo.priorityDepositInfo.pTokenAddr ==
                address(0x0) ||
                params.fundRaiseInfo.priorityDepositInfo.pMinHolding <= 0 ||
                params.fundRaiseInfo.priorityDepositInfo.pPeriod <= 0 ||
                params.fundRaiseInfo.priorityDepositInfo.pPeriods <= 0 ||
                params.fundRaiseInfo.priorityDepositInfo.pPeriod *
                    params.fundRaiseInfo.priorityDepositInfo.pPeriods >
                params.fundRaiseInfo.fundRaiseEndTime -
                    params.fundRaiseInfo.fundRaiseStartTime)
        ) revert InvalidBackerPriorityDepositParams();

        SubmitProposalLocalVars memory vars;

        vars.flexVotingContract = IFlexVoting(
            dao.getAdapterAddress(DaoHelper.FLEX_POLLING_VOTING_ADAPT)
        );
        dao.increaseFundingId();
        vars.proposalId = TypeConver.bytesToBytes32(
            abi.encodePacked(
                bytes8(uint64(uint160(address(dao)))),
                "Funding#",
                Strings.toString(dao.getCurrentFundingProposalId())
            )
        );
        if (params.fundingInfo.escrow) {
            if (
                params.fundingInfo.returnTokenAddr == address(0x0) ||
                params.fundingInfo.approverAddr == address(0x0) ||
                params.fundingInfo.minReturnAmount <= 0
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
        FundingType _fundingType = dao.getConfiguration(
            DaoHelper.FLEX_FUNDING_TYPE
        ) == 0
            ? FundingType.DIRECT
            : FundingType.POLL;

        Proposals[address(dao)][vars.proposalId] = ProposalInfo(
            msg.sender,
            ProposalFundingInfo(
                params.fundingInfo.tokenAddress,
                params.fundingInfo.minFundingAmount,
                params.fundingInfo.maxFundingAmount,
                0,
                params.fundingInfo.escrow,
                params.fundingInfo.returnTokenAddr,
                params.fundingInfo.returnTokenAmount,
                params.fundingInfo.price,
                params.fundingInfo.minReturnAmount,
                params.fundingInfo.maxReturnAmount,
                params.fundingInfo.approverAddr,
                params.fundingInfo.recipientAddr
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
                params.fundRaiseInfo.backerIdentification,
                params.fundRaiseInfo.bakckerIdentificationInfo,
                params.fundRaiseInfo.priorityDeposit,
                params.fundRaiseInfo.priorityDepositInfo
            ),
            ProposerRewardInfo(
                params.proposerRewardInfo.tokenRewardAmount,
                params.proposerRewardInfo.cashRewardAmount
            ),
            _fundingType == FundingType.POLL ? block.timestamp : 0,
            _fundingType == FundingType.POLL
                ? block.timestamp +
                    dao.getConfiguration(DaoHelper.FLEX_POLLING_VOTING_PERIOD)
                : 0,
            _fundingType == FundingType.POLL
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
            msg.sender,
            dao.getAdapterAddress(DaoHelper.FLEX_POLLING_VOTING_ADAPT)
        );
        // proposalIds += 1;
        // register proposalId into funding pool
        vars.flexFundingPoolExt = FlexFundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FLEX_FUNDING_POOL_EXT)
        );
        if (_fundingType == FundingType.DIRECT) {
            vars.flexFundingPoolExt.registerPotentialNewFundingProposal(
                vars.proposalId
            );
        }
        emit ProposalCreated(address(dao), vars.proposalId, msg.sender);
    }

    function processProposal(
        DaoRegistry dao,
        bytes32 proposalId
    ) external override reimbursable(dao) returns (bool) {
        ProcessProposalLocalVars memory vars;
        ProposalInfo storage proposal = Proposals[address(dao)][proposalId];

        // vars.fundRaiseEndTime = proposal.fundRaiseInfo.fundRaiseEndTime;
        // vars.minFundingAmount = proposal.fundingInfo.minFundingAmount;
        vars.flexFundingPoolAdapt = FlexFundingPoolAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_POOL_ADAPT)
        );
        vars.flexFundingPoolExt = FlexFundingPoolExtension(
            dao.getExtensionAddress(DaoHelper.FLEX_FUNDING_POOL_EXT)
        );
        // vars.recipientAddr = proposal.fundingInfo.recipientAddr;

        if (proposal.state == ProposalStatus.IN_VOTING_PROGRESS) {
            require(
                block.timestamp > proposal.stopVoteTime,
                "FlexFunding::processProposal::proposal in voting period"
            );
            // Checks if the proposal has passed.
            vars.flexVoting = FlexPollingVotingContract(
                dao.votingAdapter(proposalId)
            );
            require(
                address(vars.flexVoting) != address(0x0),
                "FlexFunding::processProposal::adapter not found"
            );

            (vars.voteResult, , ) = vars.flexVoting.voteResult(dao, proposalId);
            if (vars.voteResult == IFlexVoting.VotingState.PASS) {
                proposal.state = ProposalStatus.IN_FUND_RAISE_PROGRESS;
                vars.flexFundingPoolExt.registerPotentialNewFundingProposal(
                    proposalId
                );
            } else {
                proposal.state = ProposalStatus.FAILED;
            }
        } else if (proposal.state == ProposalStatus.IN_FUND_RAISE_PROGRESS) {
            vars.poolBalance = vars
                .flexFundingPoolAdapt
                .getTotalFundByProposalId(dao, proposalId);
            // vars.propodalFundingToken = getTokenByProposalId(dao, proposalId);
            vars.propodalFundingToken = proposal.fundingInfo.tokenAddress;
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
                proposal.fundingInfo.minFundingAmount +
                    vars.protocolFee +
                    vars.managementFee +
                    vars.proposerReward
            ) {
                proposal.fundingInfo.finalRaisedAmount = vars.poolBalance;

                if (proposal.fundingInfo.escrow) {
                    // calculate && update return token amount
                    proposal.fundingInfo.returnTokenAmount =
                        ((vars.poolBalance -
                            vars.protocolFee -
                            vars.managementFee -
                            vars.proposerReward) / proposal.fundingInfo.price) *
                        RETRUN_TOKEN_AMOUNT_PRECISION;
                    vars.returnTokenAmount = proposal
                        .fundingInfo
                        .returnTokenAmount;
                    if (
                        !_escrowToken(
                            dao,
                            proposal.fundingInfo.approverAddr,
                            proposal.fundingInfo.returnTokenAddr,
                            vars.returnTokenAmount,
                            proposalId
                        )
                    ) {
                        proposal.state = ProposalStatus.FAILED;
                        emit ProposalExecuted(
                            address(dao),
                            proposalId,
                            proposal.state
                        );
                        return false;
                    }
                    // else {
                    //     escrowedTokens[address(dao)][proposalId][
                    //         proposal.fundingInfo.approverAddr
                    //     ] = vars.returnTokenAmount;
                    // }
                    vars.flexAllocAdapt = FlexAllocationAdapterContract(
                        dao.getAdapterAddress(DaoHelper.FLEX_ALLOCATION_ADAPT)
                    );
                    // vars.returnToken = proposal.fundingInfo.returnTokenAddr;
                    // vars.proposer = proposal.proposer;

                    // IERC20(proposal.fundingInfo.returnTokenAddr).approve(
                    //     dao.getAdapterAddress(DaoHelper.FLEX_ALLOCATION_ADAPT),
                    //     vars.returnTokenAmount
                    // );
                    vars.flexAllocAdapt.allocateProjectToken(
                        dao,
                        proposal.fundingInfo.returnTokenAddr,
                        proposal.proposer,
                        proposalId,
                        [
                            vars.returnTokenAmount,
                            proposal.vestInfo.vestingStartTime,
                            proposal.vestInfo.vestingCliffEndTime -
                                proposal.vestInfo.vestingStartTime,
                            proposal.vestInfo.vestingInterval,
                            proposal.vestInfo.vestingInterval
                        ]
                    );
                } else {
                    vars.flexAllocAdapt = FlexAllocationAdapterContract(
                        dao.getAdapterAddress(DaoHelper.FLEX_ALLOCATION_ADAPT)
                    );
                    vars.flexAllocAdapt.noEscrow(dao, proposalId);
                }
                //1
                proposal.state = ProposalStatus.IN_EXECUTE_PROGRESS;

                //2 protocol fee
                if (vars.protocolFee > 0) {
                    vars.flexFundingPoolExt.withdrawFromAll(
                        proposalId,
                        protocolAddress,
                        vars.propodalFundingToken,
                        vars.protocolFee
                    );
                }

                //3 management fee
                if (vars.managementFee > 0) {
                    vars.flexFundingPoolExt.withdrawFromAll(
                        proposalId,
                        dao.getAddressConfiguration(
                            DaoHelper.FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS
                        ),
                        vars.propodalFundingToken,
                        vars.managementFee
                    );
                }

                //4 proposer reward
                if (vars.proposerReward > 0) {
                    vars.flexFundingPoolExt.withdrawFromAll(
                        proposalId,
                        proposal.proposer,
                        vars.propodalFundingToken,
                        vars.proposerReward
                    );
                }

                // 5 send funding token to recipient
                vars.flexFundingPoolExt.withdrawFromAll(
                    proposalId,
                    proposal.fundingInfo.recipientAddr,
                    vars.propodalFundingToken,
                    vars.poolBalance -
                        vars.protocolFee -
                        vars.managementFee -
                        vars.proposerReward
                );

                //7 substract
                vars.flexFundingPoolExt.substractFromAll(
                    proposalId,
                    vars.poolBalance
                );

                proposal.state = ProposalStatus.DONE;
            } else {
                // didt meet the min funding amount
                proposal.state = ProposalStatus.FAILED;
                emit ProposalExecuted(address(dao), proposalId, proposal.state);
                return false;
            }
        } else {
            revert NotInExecuteState();
        }
        emit ProposalExecuted(address(dao), proposalId, proposal.state);
        return true;
    }

    function retrunTokenToApprover(
        DaoRegistry dao,
        bytes32 proposalId
    ) external reimbursable(dao) {
        // uint256 escrowedTokenAmount = escrowedTokens[address(dao)][proposalId][
        //     msg.sender
        // ];
        // require(
        //     escrowedTokenAmount > 0,
        //     "Flex Funding::retrunTokenToApprover::no fund to return"
        // );
        ProposalInfo storage proposal = Proposals[address(dao)][proposalId];
        // IERC20 erc20 = IERC20(proposal.fundingInfo.returnTokenAddr);
        // require(
        //     erc20.balanceOf(address(this)) >= escrowedTokenAmount,
        //     "Flex Funding::retrunTokenToApprover::Insufficient Funds"
        // );

        // require(
        //     proposal.state == ProposalStatus.FAILED,
        //     "Flex Funding::retrunTokenToApprover::cant return"
        // );
        // escrowedTokens[address(dao)][proposalId][msg.sender] = 0;
        // erc20.transfer(msg.sender, escrowedTokenAmount);
        FlexFundingReturnTokenAdapterContract flexFundingReturnTokenAdapt = FlexFundingReturnTokenAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_RETURN_TOKEN_ADAPT)
            );
        flexFundingReturnTokenAdapt.withdrawFundingReturnToken(
            dao,
            proposalId,
            proposal.fundingInfo.returnTokenAddr,
            msg.sender,
            proposal.state
        );
    }

    function getMaxFundingAmount(
        DaoRegistry dao,
        bytes32 proposalId
    ) external view returns (uint256) {
        ProposalInfo storage proposal = Proposals[address(dao)][proposalId];
        uint256 maxFundingAmount = 0;
        uint256 maxFundingTargetAmount = Proposals[address(dao)][proposalId]
            .fundingInfo
            .maxFundingAmount;

        if (dao.getConfiguration(DaoHelper.FLEX_MANAGEMENT_FEE_TYPE) == 0)
            maxFundingAmount =
                (maxFundingTargetAmount * RETRUN_TOKEN_AMOUNT_PRECISION) /
                (RETRUN_TOKEN_AMOUNT_PRECISION -
                    dao.getConfiguration(DaoHelper.FLEX_MANAGEMENT_FEE_AMOUNT) -
                    protocolFee -
                    proposal.proposerRewardInfo.cashRewardAmount);
        else {
            maxFundingAmount =
                ((maxFundingTargetAmount +
                    dao.getConfiguration(
                        DaoHelper.FLEX_MANAGEMENT_FEE_AMOUNT
                    )) * RETRUN_TOKEN_AMOUNT_PRECISION) /
                (protocolFee - proposal.proposerRewardInfo.cashRewardAmount);
        }
        return maxFundingAmount;
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
        address returnToken,
        uint256 escrowAmount,
        bytes32 proposalId
    ) internal returns (bool) {
        // IERC20 erc20 = IERC20(returnToken);
        // if (
        //     erc20.balanceOf(approver) < escorwAmount ||
        //     erc20.allowance(approver, address(this)) < escorwAmount
        // ) {
        //     return false;
        // }

        // //20220916 fix potential bugs
        // uint256 oldAllowance = erc20.allowance(
        //     address(this),
        //     dao.getAdapterAddress(DaoHelper.FLEX_ALLOCATION_ADAPT)
        // );
        // uint256 newAllowance = oldAllowance + escorwAmount;
        // //approve to AllocationAdapter contract
        // erc20.approve(
        //     dao.getAdapterAddress(DaoHelper.FLEX_ALLOCATION_ADAPT),
        //     newAllowance
        // );
        // erc20.transferFrom(approver, address(this), escorwAmount);
        // return true;
        FlexFundingReturnTokenAdapterContract flexFundingReturnTokenAdapt = FlexFundingReturnTokenAdapterContract(
                dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_RETURN_TOKEN_ADAPT)
            );
        return
            flexFundingReturnTokenAdapt.escrowFundingReturnToken(
                escrowAmount,
                dao,
                approver,
                returnToken,
                proposalId
            );
    }
}
