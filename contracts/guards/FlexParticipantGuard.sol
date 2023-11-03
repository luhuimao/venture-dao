pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../core/DaoRegistry.sol";
import "../helpers/DaoHelper.sol";
import "../flex/adatpers/FlexFundingPoolAdapter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

/**
MIT License

Copyright (c) 2020 Openlaw

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
abstract contract FlexParticipantGuard {
    modifier onlyParticipant(DaoRegistry dao, string calldata name) {
        if (
            dao.getConfiguration(
                DaoHelper.FLEX_PARTICIPANT_MEMBERSHIP_ENABLE
            ) == 1
        ) {
            FlexInvestmentPoolAdapterContract flexFundingPoolAdapt = FlexInvestmentPoolAdapterContract(
                    dao.getAdapterAddress(DaoHelper.FLEX_INVESTMENT_POOL_ADAPT)
                );
            (
                bool created,
                uint8 varifyType,
                uint256 minHolding,
                address tokenAddress,
                uint256 tokenId
            ) = flexFundingPoolAdapt.getParticipantMembershipInfo(dao, name);
            //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
            if (varifyType == 0 && created == true) {
                require(
                    IERC20(tokenAddress).balanceOf(msg.sender) >= minHolding,
                    "dont meet min erc20 token holding requirment"
                );
            }
            if (varifyType == 1 && created == true) {
                require(
                    IERC721(tokenAddress).balanceOf(msg.sender) >= minHolding,
                    "dont meet min erc721 token holding requirment"
                );
            }
            if (varifyType == 2 && created == true) {
                require(
                    IERC1155(tokenAddress).balanceOf(msg.sender, tokenId) >=
                        minHolding,
                    "dont meet min erc1155 token holding requirment"
                );
            }
            if (varifyType == 3 && created == true) {
                require(
                    flexFundingPoolAdapt.isParticipantWhiteList(
                        dao,
                        name,
                        msg.sender
                    ),
                    "not in participant whitelist"
                );
            }
        }
        _;
    }
}
