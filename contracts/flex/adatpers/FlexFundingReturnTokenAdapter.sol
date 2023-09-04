pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IFlexFunding.sol";
import "../../helpers/DaoHelper.sol";
import "hardhat/console.sol";

contract FlexFundingReturnTokenAdapterContract {
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
        approvedInfos[dao][proposalId][msg.sender][erc20] += amount;

        return true;
    }

    function escrowFundingReturnToken(
        uint256 escrowAmount,
        DaoRegistry dao,
        address approver,
        address erc20,
        bytes32 proposalId
    ) external returns (bool) {
        require(
            msg.sender == dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT),
            "!access"
        );
        // require(
        //     approvedInfos[address(dao)][proposalId][approver][erc20] >=
        //         escrowAmount &&
        //         IERC20(erc20).allowance(approver, address(this)) >=
        //         escrowAmount,
        //     "!approve"
        // );

        if (
            IERC20(erc20).balanceOf(approver) < escrowAmount ||
            IERC20(erc20).allowance(approver, address(this)) < escrowAmount ||
            approvedInfos[address(dao)][proposalId][approver][erc20] <
            escrowAmount
        ) {
            return false;
        }

        IERC20(erc20).transferFrom(approver, address(this), escrowAmount);
        approvedInfos[address(dao)][proposalId][approver][
            erc20
        ] -= escrowAmount;
        escrowedReturnTokens[address(dao)][proposalId][
            approver
        ] += escrowAmount;
        //approve to AllocationAdapter contract
        uint256 newAllowance = IERC20(erc20).allowance(
            address(this),
            dao.getAdapterAddress(DaoHelper.FLEX_ALLOCATION_ADAPT)
        ) + escrowAmount;
        IERC20(erc20).approve(
            dao.getAdapterAddress(DaoHelper.FLEX_ALLOCATION_ADAPT),
            newAllowance
        );
        return true;
    }

    function withdrawFundingReturnToken(
        DaoRegistry dao,
        bytes32 proposalId,
        address erc20,
        address approver,
        IFlexFunding.ProposalStatus state
    ) external returns (bool) {
        require(
            msg.sender == dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT),
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

        require(state == IFlexFunding.ProposalStatus.FAILED, "!satisfied");
        escrowedReturnTokens[address(dao)][proposalId][approver] = 0;
        IERC20(erc20).transfer(approver, lockedTokenAmount);
    }
}
