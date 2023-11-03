pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../helpers/DaoHelper.sol";
import "../core/DaoRegistry.sol";
import "../extensions/bank/Bank.sol";
// import "../extensions/fundingpool/FundingPool.sol";
// import "../extensions/gpdao/GPDao.sol";
import "../extensions/token/erc20/ERC20TokenExtension.sol";
import "../vintage/extensions/fundingpool/VintageFundingPool.sol";
import "../vintage/adapters/VintageFundingAdapter.sol";
import "../vintage/adapters/VintageFundRaise.sol";
import "../vintage/adapters/VintageVoting.sol";
import "../vintage/adapters/VintageRaiserAllocation.sol";
import "../flex/adatpers/FlexVoting.sol";
import "../flex/adatpers/FlexStewardAllocation.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ABDKMath64x64} from "abdk-libraries-solidity/ABDKMath64x64.sol";
import "hardhat/console.sol";

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
library GovernanceHelper {
    string public constant ROLE_PREFIX = "governance.role.";
    bytes32 public constant DEFAULT_GOV_TOKEN_CFG =
        keccak256(abi.encodePacked(ROLE_PREFIX, "default"));

    /*
     * @dev Checks if the member address holds enough funds to be considered a governor.
     * @param dao The DAO Address.
     * @param memberAddr The message sender to be verified as governor.
     * @param proposalId The proposal id to retrieve the governance token address if configured.
     * @param snapshot The snapshot id to check the balance of the governance token for that member configured.
     */
    // function getVotingWeight(
    //     DaoRegistry dao,
    //     address voterAddr,
    //     bytes32 proposalId,
    //     uint256 snapshot
    // ) internal view returns (uint256) {
    //     (address adapterAddress, ) = dao.proposals(proposalId);

    //     // 1st - if there is any governance token configuration
    //     // for the adapter address, then read the voting weight based on that token.
    //     address governanceToken = dao.getAddressConfiguration(
    //         keccak256(abi.encodePacked(ROLE_PREFIX, adapterAddress))
    //     );
    //     if (DaoHelper.isNotZeroAddress(governanceToken)) {
    //         return getVotingWeight(dao, governanceToken, voterAddr, snapshot);
    //     }

    //     // 2nd - if there is no governance token configured for the adapter,
    //     // then check if exists a default governance token.
    //     // If so, then read the voting weight based on that token.
    //     governanceToken = dao.getAddressConfiguration(DEFAULT_GOV_TOKEN_CFG);
    //     if (DaoHelper.isNotZeroAddress(governanceToken)) {
    //         return getVotingWeight(dao, governanceToken, voterAddr, snapshot);
    //     }

    //     // 3rd - if none of the previous options are available, assume the
    //     // governance token is UNITS, then read the voting weight based on that token.
    //     return
    //         BankExtension(dao.getExtensionAddress(DaoHelper.BANK))
    //             .getPriorAmount(voterAddr, DaoHelper.UNITS, snapshot);
    // }

    // function getVotingWeight(
    //     DaoRegistry dao,
    //     address governanceToken,
    //     address voterAddr,
    //     uint256 snapshot
    // ) internal view returns (uint256) {
    //     BankExtension bank = BankExtension(
    //         dao.getExtensionAddress(DaoHelper.BANK)
    //     );
    //     if (bank.isInternalToken(governanceToken)) {
    //         return bank.getPriorAmount(voterAddr, governanceToken, snapshot);
    //     }

    //     // The external token must implement the getPriorAmount function,
    //     // otherwise this call will fail and revert the voting process.
    //     // The actual revert does not show a clear reason, so we catch the error
    //     // and revert with a better error message.
    //     // slither-disable-next-line unused-return
    //     try
    //         ERC20Extension(governanceToken).getPriorAmount(voterAddr, snapshot)
    //     returns (
    //         // slither-disable-next-line uninitialized-local,variable-scope
    //         uint256 votingWeight
    //     ) {
    //         return votingWeight;
    //     } catch {
    //         revert("getPriorAmount not implemented");
    //     }
    // }

    // function getAllGPVotingWeight(
    //     DaoRegistry dao,
    //     address token
    // ) internal view returns (uint128) {
    //     address[] memory gps = GPDaoExtension(
    //         dao.getExtensionAddress(DaoHelper.GPDAO_EXT)
    //     ).getAllGPs();

    //     uint128 allGPweight;
    //     for (uint8 i = 0; i < gps.length; i++) {
    //         allGPweight += getGPVotingWeight(dao, gps[i], token);
    //     }
    //     return allGPweight;
    // }

    // function getGPVotingWeight(
    //     DaoRegistry dao,
    //     address voterAddr,
    //     address token
    // ) internal view returns (uint128) {
    //     FundingPoolExtension fundingpool = FundingPoolExtension(
    //         dao.getExtensionAddress(DaoHelper.FUNDINGPOOL_EXT)
    //     );
    //     uint256 balanceInEther = fundingpool.balanceOf(voterAddr) / 10 ** 18;
    //     //need to fix 2022.6.14
    //     if (balanceInEther <= 0) {
    //         return 0;
    //     }
    //     if (balanceInEther >= 9223372036854775807) {
    //         return 50;
    //     }

    //     uint128 weight;
    //     // if (fundingpool.isTokenAllowed(token)) {
    //     if (
    //         fundingpool.votingWeightRadix() == 1 ||
    //         fundingpool.votingWeightRadix() <= 0
    //     ) {
    //         // weight =
    //         //     fundingpool.balanceOf(voterAddr, token) *
    //         //     fundingpool.votingWeightMultiplier() +
    //         //     fundingpool.votingWeightAddend();
    //     } else {
    //         weight =
    //             ABDKMath64x64.toUInt(
    //                 ABDKMath64x64.log_2(ABDKMath64x64.fromUInt(balanceInEther))
    //             ) *
    //             fundingpool.votingWeightMultiplier() +
    //             fundingpool.votingWeightAddend();
    //     }
    //     // }
    //     return weight;
    // }

    // function getRaiserDepositVotingWeight(
    //     DaoRegistry dao,
    //     address voterAddr
    // ) internal view returns (uint128) {
    //     VintageFundingPoolExtension fundingpool = VintageFundingPoolExtension(
    //         dao.getExtensionAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_EXT)
    //     );
    //     uint256 balanceInEther = fundingpool.balanceOf(voterAddr) / 10 ** 18;
    //     //need to fix 2022.6.14
    //     if (balanceInEther <= 0) {
    //         return 0;
    //     }
    //     if (balanceInEther >= 9223372036854775807) {
    //         return 50;
    //     }

    //     uint128 weight = ABDKMath64x64.toUInt(
    //         ABDKMath64x64.log_2(ABDKMath64x64.fromUInt(balanceInEther))
    //     );
    //     return weight;
    // }

    // function getAllRaiserVotingWeight(
    //     DaoRegistry dao
    // ) internal view returns (uint128) {
    //     address[] memory allRaisers = dao.getAllSteward();
    //     uint128 allRaiserweight;
    //     for (uint8 i = 0; i < allRaisers.length; i++) {
    //         allRaiserweight += getVintageVotingWeight(dao, allRaisers[i]);
    //     }
    //     return allRaiserweight;
    // }

    function getVintageAllRaiserVotingWeightByProposalId(
        DaoRegistry dao,
        bytes32 proposalId
    ) internal view returns (uint128) {
        address[] memory allRaisers = dao.getAllSteward();
        uint128 allRaiserweight;
        VintageVotingContract vintageVotingAdapt = VintageVotingContract(
            dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );
        for (uint8 i = 0; i < allRaisers.length; i++) {
            if (
                vintageVotingAdapt.checkIfVoted(dao, proposalId, allRaisers[i])
            ) {
                allRaiserweight += vintageVotingAdapt.voteWeights(
                    address(dao),
                    proposalId,
                    allRaisers[i]
                );
            } else {
                allRaiserweight += getVintageVotingWeight(dao, allRaisers[i]);
            }
        }
        return allRaiserweight;
    }

    function getAllVintageRaiserVotingWeight(
        DaoRegistry dao
    ) internal view returns (uint128) {
        address[] memory allRaisers = dao.getAllSteward();
        uint128 allStewardweight;
        for (uint8 i = 0; i < allRaisers.length; i++) {
            allStewardweight += getVintageVotingWeight(dao, allRaisers[i]);
        }
        return allStewardweight;
    }

    function getAllStewardVotingWeight(
        DaoRegistry dao
    ) internal view returns (uint128) {
        address[] memory steards = DaoHelper.getAllActiveMember(dao);
        uint128 allStewardweight;
        for (uint8 i = 0; i < steards.length; i++) {
            allStewardweight += getFlexVotingWeight(dao, steards[i]);
        }
        return allStewardweight;
    }

    function getAllStewardVotingWeightByProposalId(
        DaoRegistry dao,
        bytes32 proposalId
    ) internal view returns (uint128) {
        address[] memory steards = DaoHelper.getAllActiveMember(dao);
        uint128 allStewardweight;
        FlexVotingContract flexVoting = FlexVotingContract(
            dao.getAdapterAddress(DaoHelper.FLEX_VOTING_ADAPT)
        );
        for (uint8 i = 0; i < steards.length; i++) {
            if (flexVoting.checkIfVoted(dao, proposalId, steards[i])) {
                allStewardweight += flexVoting.voteWeights(
                    address(dao),
                    proposalId,
                    steards[i]
                );
            } else {
                allStewardweight += getFlexVotingWeight(dao, steards[i]);
            }
        }
        return allStewardweight;
    }

    function getVintageVotingWeight(
        DaoRegistry dao,
        address account
    ) internal view returns (uint128) {
        VintageFundingPoolAdapterContract fundingPoolAdapt = VintageFundingPoolAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_INVESTMENT_POOL_ADAPT)
            );
        VintageFundRaiseAdapterContract newFundAdapt = VintageFundRaiseAdapterContract(
                dao.getAdapterAddress(DaoHelper.VINTAGE_FUND_RAISE_ADAPTER)
            );
        VintageRaiserAllocationAdapter vintageRaiserAllocAdapt = VintageRaiserAllocationAdapter(
                dao.getAdapterAddress(
                    DaoHelper.VINTAGE_RAISER_ALLOCATION_ADAPTER
                )
            );
        uint256 etype = dao.getConfiguration(
            DaoHelper.VINTAGE_VOTING_ELIGIBILITY_TYPE
        ); // 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
        uint256 votingWeightedType = dao.getConfiguration(
            DaoHelper.VINTAGE_VOTING_WEIGHTED_TYPE
        ); // 0. quantity 1. log2 2. 1 voter 1 vote
        if (votingWeightedType == 1) {
            uint256 tokenId = dao.getConfiguration(
                DaoHelper.VINTAGE_VOTING_ELIGIBILITY_TOKEN_ID
            );
            address tokenAddress = dao.getAddressConfiguration(
                DaoHelper.VINTAGE_VOTING_ELIGIBILITY_TOKEN_ADDRESS
            );
            uint256 bal = 0;
            if (etype == 0) {
                //0 ERC20
                bal = IERC20(tokenAddress).balanceOf(account) / 10 ** 18;
            } else if (etype == 1) {
                //ERC721
                bal = IERC721(tokenAddress).balanceOf(account);
            } else if (etype == 2) {
                //ERC1155
                bal = IERC1155(tokenAddress).balanceOf(account, tokenId);
            } else if (etype == 3) {
                //allocation
                bal = vintageRaiserAllocAdapt.getAllocation(
                    address(dao),
                    account
                );
                // return 1;
            } else if (etype == 4) {
                //DEPOSIT

                if (
                    fundingPoolAdapt.daoFundRaisingStates(address(dao)) ==
                    DaoHelper.FundRaiseState.DONE &&
                    block.timestamp <
                    dao.getConfiguration(DaoHelper.FUND_END_TIME) &&
                    newFundAdapt.createdFundCounter(address(dao)) >= 1
                ) {
                    bal = fundingPoolAdapt.balanceOf(dao, account) / 10 ** 18;
                } else {
                    return 1;
                }
            } else {
                return 0;
            }
            if (bal <= 0) return 0;
            if (bal >= 9223372036854775807) return 50;
            uint128 votingWeight = ABDKMath64x64.toUInt(
                ABDKMath64x64.log_2(ABDKMath64x64.fromUInt(bal))
            );
            return votingWeight;
        } else if (votingWeightedType == 2) {
            //1 voter 1 vote
            return 1;
        } else if (votingWeightedType == 0) {
            //quantity
            uint256 tokenId = dao.getConfiguration(
                DaoHelper.VINTAGE_VOTING_ELIGIBILITY_TOKEN_ID
            );
            address tokenAddress = dao.getAddressConfiguration(
                DaoHelper.VINTAGE_VOTING_ELIGIBILITY_TOKEN_ADDRESS
            );
            uint256 bal = 0;
            if (etype == 0) {
                //0 ERC20
                bal = IERC20(tokenAddress).balanceOf(account) / 10 ** 18;
            } else if (etype == 1) {
                //ERC721
                bal = IERC721(tokenAddress).balanceOf(account);
            } else if (etype == 2) {
                //ERC1155
                bal = IERC1155(tokenAddress).balanceOf(account, tokenId);
            } else if (etype == 3) {
                //allocation
                bal = vintageRaiserAllocAdapt.getAllocation(
                    address(dao),
                    account
                );
                // return 1;
            } else if (etype == 4) {
                //DEPOSIT
                if (
                    fundingPoolAdapt.daoFundRaisingStates(address(dao)) ==
                    DaoHelper.FundRaiseState.DONE &&
                    block.timestamp <
                    dao.getConfiguration(DaoHelper.FUND_END_TIME) &&
                    newFundAdapt.createdFundCounter(address(dao)) >= 1
                ) {
                    bal = fundingPoolAdapt.balanceOf(dao, account) / 10 ** 18;
                } else {
                    return 1;
                }
            } else {
                return 0;
            }
            return uint128(bal);
        } else {
            return 0;
        }
    }

    function getFlexVotingWeight(
        DaoRegistry dao,
        address account
    ) internal view returns (uint128) {
        uint256 etype = dao.getConfiguration(
            DaoHelper.FLEX_VOTING_ELIGIBILITY_TYPE
        ); // 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
        uint256 votingWeightedType = dao.getConfiguration(
            DaoHelper.FLEX_VOTING_WEIGHTED_TYPE
        ); // 0. quantity 1. log2 2. 1 voter 1 vote

        FlexStewardAllocationAdapter flexStewardAllocAdapt = FlexStewardAllocationAdapter(
                dao.getAdapterAddress(DaoHelper.FLEX_STEWARD_ALLOCATION_ADAPT)
            );
        if (votingWeightedType == 1) {
            uint256 tokenId = dao.getConfiguration(
                DaoHelper.FLEX_VOTING_ELIGIBILITY_TOKEN_ID
            );
            address tokenAddress = dao.getAddressConfiguration(
                DaoHelper.FLEX_VOTING_ELIGIBILITY_TOKEN_ADDRESS
            );
            uint256 bal = 0;
            if (etype == 0) {
                //0 ERC20
                bal = IERC20(tokenAddress).balanceOf(account) / 10 ** 18;
            } else if (etype == 1) {
                //ERC721
                bal = IERC721(tokenAddress).balanceOf(account);
            } else if (etype == 2) {
                //ERC1155
                bal = IERC1155(tokenAddress).balanceOf(account, tokenId);
            } else if (etype == 3) {
                //allocation
                bal = flexStewardAllocAdapt.getAllocation(
                    address(dao),
                    account
                );
                // return 1;
            } else {
                return 0;
            }
            if (bal <= 0) return 0;
            if (bal >= 9223372036854775807) return 50;
            uint128 votingWeight = ABDKMath64x64.toUInt(
                ABDKMath64x64.log_2(ABDKMath64x64.fromUInt(bal))
            );
            return votingWeight;
        } else if (votingWeightedType == 2) {
            //1 voter 1 vote
            return 1;
        } else if (votingWeightedType == 0) {
            //quantity
            uint256 tokenId = dao.getConfiguration(
                DaoHelper.FLEX_VOTING_ELIGIBILITY_TOKEN_ID
            );
            address tokenAddress = dao.getAddressConfiguration(
                DaoHelper.FLEX_VOTING_ELIGIBILITY_TOKEN_ADDRESS
            );
            uint256 bal = 0;
            if (etype == 0) {
                //0 ERC20
                bal = IERC20(tokenAddress).balanceOf(account) / 10 ** 18;
            } else if (etype == 1) {
                //ERC721
                bal = IERC721(tokenAddress).balanceOf(account);
            } else if (etype == 2) {
                //ERC1155
                bal = IERC1155(tokenAddress).balanceOf(account, tokenId);
            } else if (etype == 3) {
                //allocation
                bal = flexStewardAllocAdapt.getAllocation(
                    address(dao),
                    account
                );
                // return 1;
            } else {
                return 0;
            }
            return uint128(bal);
        } else {
            return 0;
        }
    }

    function getFlexPollVotingWeight(
        DaoRegistry dao,
        address account
    ) internal view returns (uint128) {
        uint256 etype = dao.getConfiguration(
            DaoHelper.FLEX_POLL_VOTING_ELIGIBILITY_TYPE
        ); // 0. ERC20 1. ERC721, 2. ERC1155
        uint256 votingWeightedType = dao.getConfiguration(
            DaoHelper.FLEX_POLL_VOTING_WEIGHTED_TYPE
        ); // 0. quantity 1. log2 2. 1 voter 1 vote
        if (votingWeightedType == 1) {
            uint256 tokenId = dao.getConfiguration(
                DaoHelper.FLEX_POLL_VOTING_ELIGIBILITY_TOKEN_ID
            );
            address tokenAddress = dao.getAddressConfiguration(
                DaoHelper.FLEX_POLL_VOTING_ELIGIBILITY_TOKEN_ADDRESS
            );
            uint256 bal = 0;
            if (tokenAddress == address(0x0)) return 0;
            if (etype == 0) {
                //0 ERC20
                bal = IERC20(tokenAddress).balanceOf(account) / 10 ** 18;
            } else if (etype == 1) {
                //ERC721
                bal = IERC721(tokenAddress).balanceOf(account);
            } else if (etype == 2) {
                //ERC1155
                bal = IERC1155(tokenAddress).balanceOf(account, tokenId);
            } else {
                return 0;
            }
            if (bal <= 0) return 0;
            if (bal >= 9223372036854775807) return 50;
            uint128 votingWeight = ABDKMath64x64.toUInt(
                ABDKMath64x64.log_2(ABDKMath64x64.fromUInt(bal))
            );
            return votingWeight;
        } else if (votingWeightedType == 2) {
            //1 voter 1 vote
            return 1;
        } else if (votingWeightedType == 0) {
            //quantity
            uint256 tokenId = dao.getConfiguration(
                DaoHelper.FLEX_POLL_VOTING_ELIGIBILITY_TOKEN_ID
            );
            address tokenAddress = dao.getAddressConfiguration(
                DaoHelper.FLEX_POLL_VOTING_ELIGIBILITY_TOKEN_ADDRESS
            );
            uint256 bal = 0;
            if (tokenAddress == address(0x0)) return 0;

            if (etype == 0) {
                //0 ERC20
                bal = IERC20(tokenAddress).balanceOf(account) / 10 ** 18;
            } else if (etype == 1) {
                //ERC721
                bal = IERC721(tokenAddress).balanceOf(account);
            } else if (etype == 2) {
                //ERC1155
                bal = IERC1155(tokenAddress).balanceOf(account, tokenId);
            } else {
                return 0;
            }
            return uint128(bal);
        } else {
            return 0;
        }
    }
}
