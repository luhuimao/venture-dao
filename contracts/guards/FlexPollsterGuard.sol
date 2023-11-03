pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../core/DaoRegistry.sol";
import "../helpers/DaoHelper.sol";
import "../flex/adatpers/FlexPollingVoting.sol";
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
abstract contract FlexPollsterGuard {
    modifier onlyPollster(DaoRegistry dao) {
        if (dao.getConfiguration(DaoHelper.FLEX_INVESTMENT_TYPE) == 1) {
            //0 ERC20 1 ERC721 2 ERC1155 3 WHITELIST
            if (
                dao.getConfiguration(DaoHelper.FLEX_POLLSTER_MEMBERSHIP_TYPE) ==
                0
            ) {
                require(
                    IERC20(
                        dao.getAddressConfiguration(
                            DaoHelper.FLEX_POLLSTER_MEMBERSHIP_TOKEN_ADDRESS
                        )
                    ).balanceOf(msg.sender) >=
                        dao.getConfiguration(
                            DaoHelper.FLEX_POLLSTER_MEMBERSHIP_MIN_HOLDING
                        ),
                    "dont meet min erc20 token holding requirment"
                );
            }
            if (
                dao.getConfiguration(DaoHelper.FLEX_POLLSTER_MEMBERSHIP_TYPE) ==
                1
            ) {
                require(
                    IERC721(
                        dao.getAddressConfiguration(
                            DaoHelper.FLEX_POLLSTER_MEMBERSHIP_TOKEN_ADDRESS
                        )
                    ).balanceOf(msg.sender) >=
                        dao.getConfiguration(
                            DaoHelper.FLEX_POLLSTER_MEMBERSHIP_MIN_HOLDING
                        ),
                    "dont meet min erc721 token holding requirment"
                );
            }
            if (
                dao.getConfiguration(DaoHelper.FLEX_POLLSTER_MEMBERSHIP_TYPE) ==
                2
            ) {
                require(
                    IERC1155(
                        dao.getAddressConfiguration(
                            DaoHelper.FLEX_POLLSTER_MEMBERSHIP_TOKEN_ADDRESS
                        )
                    ).balanceOf(
                            msg.sender,
                            dao.getConfiguration(
                                DaoHelper.FLEX_PROPOSER_TOKENID
                            )
                        ) >=
                        dao.getConfiguration(
                            DaoHelper.FLEX_POLLSTER_MEMBERSHIP_MIN_HOLDING
                        ),
                    "dont meet min erc1155 token holding requirment"
                );
            }
            if (
                dao.getConfiguration(DaoHelper.FLEX_POLLSTER_MEMBERSHIP_TYPE) ==
                3
            ) {
                FlexPollingVotingContract flexPollingVoting = FlexPollingVotingContract(
                        dao.getAdapterAddress(DaoHelper.FLEX_POLLING_VOTING_ADAPT)
                    );
                require(
                    flexPollingVoting.isPollsterWhiteList(dao, msg.sender),
                    "not in pollster whitelist"
                );
            }
        }
        _;
    }
}
