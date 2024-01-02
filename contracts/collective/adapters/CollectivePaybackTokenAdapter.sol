pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../helpers/DaoHelper.sol";
import "hardhat/console.sol";
import "./interfaces/ICollectiveFunding.sol";

contract CollectivePaybackTokenAdapterContract {
    mapping(address => mapping(bytes32 => mapping(address => mapping(address => uint256))))
        public approvedInfos; // dao => funding proposal => approver => erc20 => amount

    mapping(address => mapping(bytes32 => mapping(address => uint256)))
        public escrowedPaybackTokens; //dao => proposalId => approver => amount

    function setFundingApprove(
        address dao,
        bytes32 proposalId,
        address erc20,
        uint256 amount
    ) external returns (bool) {
        approvedInfos[dao][proposalId][msg.sender][erc20] = amount;
        return true;
    }

    function escrowPaybackToken(
        uint256 escrowAmount,
        DaoRegistry dao,
        address approver,
        address erc20,
        bytes32 proposalId
    ) external returns (bool) {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUNDING_ADAPTER),
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
        escrowedPaybackTokens[address(dao)][proposalId][approver] = escrowAmount;
        //approve to AllocationAdapter contract
        uint256 newAllowance = IERC20(erc20).allowance(
            address(this),
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_ALLOCATION_ADAPTER)
        ) + escrowAmount;
        IERC20(erc20).approve(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_ALLOCATION_ADAPTER),
            newAllowance
        );
        return true;
    }

    function withdrawPaybackToken(
        DaoRegistry dao,
        bytes32 proposalId,
        address erc20,
        address approver,
        ICollectiveFunding.ProposalState state
    ) external returns (bool) {
        require(
            msg.sender ==
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUNDING_ADAPTER),
            "!access"
        );
        uint256 lockedTokenAmount = escrowedPaybackTokens[address(dao)][
            proposalId
        ][approver];
        require(lockedTokenAmount > 0, "!escrowed");

        require(
            IERC20(erc20).balanceOf(address(this)) >= lockedTokenAmount,
            "!fund"
        );

        require(
            state == ICollectiveFunding.ProposalState.FAILED,
            "!funding state"
        );
        escrowedPaybackTokens[address(dao)][proposalId][approver] = 0;
        IERC20(erc20).transfer(approver, lockedTokenAmount);

        return true;
    }
}
