pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "../../guards/AdapterGuard.sol";
import "../../guards/MemberGuard.sol";
import "../../adapters/modifiers/Reimbursable.sol";
import "./interfaces/IFlexFunding.sol";
import "../../utils/TypeConver.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract FlexFundingAdapterContract is
    IFlexFunding,
    AdapterGuard,
    MemberGuard,
    Reimbursable
{
    /*
     * PUBLIC VARIABLES
     */
    uint256 public proposalIds = 100000;

    function submitProposal(
        DaoRegistry dao,
        address[] calldata _addressArgs,
        uint256[] calldata _uint256ArgsProposal
    ) external override returns (bytes32 proposalId) {
        bytes32 propsoalId = TypeConver.bytesToBytes32(
            abi.encodePacked("TFRP", Strings.toString(proposalIds))
        );
    }

    function processProposal(DaoRegistry dao, bytes32 proposalId)
        external
        override
        returns (bool)
    {
        return true;
    }
}
