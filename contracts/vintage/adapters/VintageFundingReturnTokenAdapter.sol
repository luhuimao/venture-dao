pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../helpers/DaoHelper.sol";
import "../libraries/fundingLibrary.sol";
import "hardhat/console.sol";

contract VintageInvestmentPaybackTokenAdapterContract {
    mapping(address => mapping(bytes32 => mapping(address => mapping(address => uint256))))
        public approvedInfos; // dao => funding proposal => approver => erc20 => amount

    mapping(address => mapping(bytes32 => mapping(address => uint256)))
        public escrowedReturnTokens; //dao => proposalId => approver => amount

    function setFundingApprove(
        address dao,
        bytes32 proposalId,
        address erc20,
        uint256 amount
    ) external returns (bool) {
        approvedInfos[dao][proposalId][msg.sender][erc20] = amount;
        return true;
    }

    function escrowInvestmentPaybackToken(
        uint256 escrowAmount,
        DaoRegistry dao,
        address approver,
        address erc20,
        bytes32 proposalId
    ) external returns (bool) {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_ADAPTER),
            "!access"
        );

        if (
            approvedInfos[address(dao)][proposalId][approver][erc20] <
            escrowAmount ||
            IERC20(erc20).allowance(approver, address(this)) < escrowAmount ||
            IERC20(erc20).balanceOf(approver) < escrowAmount
        ) return false;

        IERC20(erc20).transferFrom(approver, address(this), escrowAmount);
        approvedInfos[address(dao)][proposalId][approver][
            erc20
        ] -= escrowAmount;
        escrowedReturnTokens[address(dao)][proposalId][approver] = escrowAmount;
        //approve to AllocationAdapter contract
        uint256 newAllowance = IERC20(erc20).allowance(
            address(this),
            dao.getAdapterAddress(DaoHelper.VINTAGE_ALLOCATION_ADAPTER)
        ) + escrowAmount;
        IERC20(erc20).approve(
            dao.getAdapterAddress(DaoHelper.VINTAGE_ALLOCATION_ADAPTER),
            newAllowance
        );
        return true;
    }

    function withdrawInvestmentPaybackToken(
        DaoRegistry dao,
        bytes32 proposalId,
        address erc20,
        address approver,
        InvestmentLibrary.ProposalState state
    ) external returns (bool) {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.VINTAGE_FUNDING_ADAPTER),
            "!access"
        );
        uint256 lockedTokenAmount = escrowedReturnTokens[address(dao)][
            proposalId
        ][approver];
        require(lockedTokenAmount > 0, "!escrowed");

        require(
            IERC20(erc20).balanceOf(address(this)) >= lockedTokenAmount,
            "!fund"
        );

        require(
            state == InvestmentLibrary.ProposalState.FAILED,
            "VintageFunding::unLockProjectTeamToken::not satisfied"
        );
        escrowedReturnTokens[address(dao)][proposalId][approver] = 0;
        IERC20(erc20).transfer(approver, lockedTokenAmount);

        return true;
    }
}
