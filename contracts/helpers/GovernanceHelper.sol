pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../helpers/DaoHelper.sol";
import "../core/DaoRegistry.sol";
// import "../extensions/bank/Bank.sol";
// import "../extensions/fundingpool/FundingPool.sol";
// import "../extensions/gpdao/GPDao.sol";
// import "../extensions/token/erc20/ERC20TokenExtension.sol";
import "../vintage/extensions/fundingpool/VintageFundingPool.sol";
import "../vintage/adapters/VintageFundingAdapter.sol";
import "../vintage/adapters/VintageFundRaise.sol";
import "../vintage/adapters/VintageVoting.sol";
import "../vintage/adapters/VintageRaiserAllocation.sol";
import "../flex/adatpers/FlexVoting.sol";
import "../flex/adatpers/FlexStewardAllocation.sol";
import "../collective/adapters/CollectiveVotingAdapter.sol";
import "../collective/adapters/CollectiveFundingPoolAdapter.sol";
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

    function getVintageAllGovernorVotingWeightByProposalId(
        DaoRegistry dao,
        bytes32 proposalId
    ) internal view returns (uint128) {
        address[] memory allGovernors = dao.getAllSteward();
        uint128 allGovernorweight;
        VintageVotingContract vintageVotingAdapt = VintageVotingContract(
            dao.getAdapterAddress(DaoHelper.VINTAGE_VOTING_ADAPT)
        );
        for (uint8 i = 0; i < allGovernors.length; i++) {
            if (
                vintageVotingAdapt.checkIfVoted(
                    dao,
                    proposalId,
                    allGovernors[i]
                )
            ) {
                allGovernorweight += vintageVotingAdapt.voteWeights(
                    address(dao),
                    proposalId,
                    allGovernors[i]
                );
            } else {
                allGovernorweight += getVintageVotingWeight(
                    dao,
                    allGovernors[i]
                );
            }
        }
        return allGovernorweight;
    }

    function getAllVintageGovernorVotingWeight(
        DaoRegistry dao
    ) internal view returns (uint128) {
        address[] memory allGovernors = dao.getAllSteward();
        uint128 allStewardweight;
        for (uint8 i = 0; i < allGovernors.length; i++) {
            allStewardweight += getVintageVotingWeight(dao, allGovernors[i]);
        }
        return allStewardweight;
    }

    function getAllFlexGovernorVotingWeight(
        DaoRegistry dao
    ) internal view returns (uint128) {
        address[] memory steards = DaoHelper.getAllActiveMember(dao);
        uint128 allStewardweight;
        for (uint8 i = 0; i < steards.length; i++) {
            allStewardweight += getFlexVotingWeight(dao, steards[i]);
        }
        return allStewardweight;
    }

    function getAllFlexGovernorVotingWeightByProposalId(
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
                    DaoHelper.VINTAGE_GOVERNOR_ALLOCATION_ADAPTER
                )
            );
        uint256 etype = dao.getConfiguration(
            DaoHelper.VINTAGE_VOTING_ASSET_TYPE
        ); // 0. ERC20 1. ERC721, 2. ERC1155 3.allocation 4.deposit
        uint256 votingWeightedType = dao.getConfiguration(
            DaoHelper.VINTAGE_VOTING_WEIGHTED_TYPE
        ); // 0. quantity 1. log2 2. 1 voter 1 vote

        uint256 tokenId = dao.getConfiguration(
            DaoHelper.VINTAGE_VOTING_ASSET_TOKEN_ID
        );
        address tokenAddress = dao.getAddressConfiguration(
            DaoHelper.VINTAGE_VOTING_ASSET_TOKEN_ADDRESS
        );
        if (votingWeightedType == 1) {
            //quantity
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
            uint128 votingWeight = 0;
            if (etype == 0) {
                //0 ERC20
                votingWeight = IERC20(tokenAddress).balanceOf(account) > 0
                    ? 1
                    : 0;
            } else if (etype == 1) {
                //ERC721
                votingWeight = IERC721(tokenAddress).balanceOf(account) > 0
                    ? 1
                    : 0;
            } else if (etype == 2) {
                //ERC1155
                votingWeight = IERC1155(tokenAddress).balanceOf(
                    account,
                    tokenId
                ) > 0
                    ? 1
                    : 0;
            } else if (etype == 3) {
                //allocation
                votingWeight = vintageRaiserAllocAdapt.getAllocation(
                    address(dao),
                    account
                ) > 0
                    ? 1
                    : 0;
                // return 1;
            } else if (etype == 4) {
                //DEPOSIT
                // if (
                //     fundingPoolAdapt.daoFundRaisingStates(address(dao)) ==
                //     DaoHelper.FundRaiseState.DONE &&
                //     block.timestamp <
                //     dao.getConfiguration(DaoHelper.FUND_END_TIME) &&
                //     newFundAdapt.createdFundCounter(address(dao)) >= 1
                // ) {
                //     votingWeight = fundingPoolAdapt.balanceOf(dao, account) > 0
                //         ? 1
                //         : 0;
                // } else {
                //     return 1;
                // }
                return 1;
            } else {
                return 0;
            }
            return votingWeight;
        } else if (votingWeightedType == 0) {
            //quantity
            // uint256 tokenId = dao.getConfiguration(
            //     DaoHelper.VINTAGE_VOTING_ASSET_TOKEN_ID
            // );
            // address tokenAddress = dao.getAddressConfiguration(
            //     DaoHelper.VINTAGE_VOTING_ASSET_TOKEN_ADDRESS
            // );
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
        uint256 etype = dao.getConfiguration(DaoHelper.FLEX_VOTING_ASSET_TYPE); // 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
        uint256 votingWeightedType = dao.getConfiguration(
            DaoHelper.FLEX_VOTING_WEIGHTED_TYPE
        ); // 0. quantity 1. log2 2. 1 voter 1 vote

        FlexStewardAllocationAdapter flexStewardAllocAdapt = FlexStewardAllocationAdapter(
                dao.getAdapterAddress(DaoHelper.FLEX_STEWARD_ALLOCATION_ADAPT)
            );

        uint256 tokenId = dao.getConfiguration(
            DaoHelper.FLEX_VOTING_ASSET_TOKEN_ID
        );
        address tokenAddress = dao.getAddressConfiguration(
            DaoHelper.FLEX_VOTING_ASSET_TOKEN_ADDRESS
        );
        if (votingWeightedType == 1) {
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
            uint128 votingWeight = 0;
            if (etype == 0) {
                //0 ERC20
                votingWeight = IERC20(tokenAddress).balanceOf(account) > 0
                    ? 1
                    : 0;
            } else if (etype == 1) {
                //ERC721
                votingWeight = IERC721(tokenAddress).balanceOf(account) > 0
                    ? 1
                    : 0;
            } else if (etype == 2) {
                //ERC1155
                votingWeight = IERC1155(tokenAddress).balanceOf(
                    account,
                    tokenId
                ) > 0
                    ? 1
                    : 0;
            } else if (etype == 3) {
                //allocation
                votingWeight = flexStewardAllocAdapt.getAllocation(
                    address(dao),
                    account
                ) > 0
                    ? 1
                    : 0;
                // return 1;
            } else {
                return 0;
            }
            return votingWeight;
        } else if (votingWeightedType == 0) {
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
            DaoHelper.FLEX_POLL_VOTING_ASSET_TYPE
        ); // 0. ERC20 1. ERC721, 2. ERC1155
        uint256 votingWeightedType = dao.getConfiguration(
            DaoHelper.FLEX_POLL_VOTING_WEIGHTED_TYPE
        ); // 0. quantity 1. log2 2. 1 voter 1 vote

        uint256 tokenId = dao.getConfiguration(
            DaoHelper.FLEX_POLL_VOTING_ASSET_TOKEN_ID
        );
        address tokenAddress = dao.getAddressConfiguration(
            DaoHelper.FLEX_POLL_VOTING_ASSET_TOKEN_ADDRESS
        );
        if (votingWeightedType == 1) {
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
            uint128 votingWeight = 0;
            if (etype == 0) {
                //0 ERC20
                votingWeight = IERC20(tokenAddress).balanceOf(account) > 0
                    ? 1
                    : 0;
            } else if (etype == 1) {
                //ERC721
                votingWeight = IERC721(tokenAddress).balanceOf(account) > 0
                    ? 1
                    : 0;
            } else if (etype == 2) {
                //ERC1155
                votingWeight = IERC1155(tokenAddress).balanceOf(
                    account,
                    tokenId
                ) > 0
                    ? 1
                    : 0;
            } else {
                return 0;
            }
            return votingWeight;
        } else if (votingWeightedType == 0) {
            //quantity
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

    function getAllCollectiveGovernorVotingWeight(
        DaoRegistry dao
    ) internal view returns (uint128) {
        address[] memory governors = dao.getAllSteward();

        uint128 allStewardweight;
        for (uint8 i = 0; i < governors.length; i++) {
            allStewardweight += getCollectiveVotingWeight(dao, governors[i]);
        }
        return allStewardweight;
    }

    function getCollectiveAllGovernorVotingWeightByProposalId(
        DaoRegistry dao,
        bytes32 proposalId
    ) internal view returns (uint128) {
        address[] memory allGovernors = dao.getAllSteward();
        uint128 allGovernorweight;
        CollectiveVotingAdapterContract collectiveVotingAdapt = CollectiveVotingAdapterContract(
                dao.getAdapterAddress(DaoHelper.COLLECTIVE_VOTING_ADAPTER)
            );
        for (uint8 i = 0; i < allGovernors.length; i++) {
            if (
                collectiveVotingAdapt.checkIfVoted(
                    dao,
                    proposalId,
                    allGovernors[i]
                )
            ) {
                allGovernorweight += collectiveVotingAdapt.voteWeights(
                    address(dao),
                    proposalId,
                    allGovernors[i]
                );
            } else {
                allGovernorweight += getCollectiveVotingWeight(
                    dao,
                    allGovernors[i]
                );
            }
        }
        return allGovernorweight;
    }

    function getCollectiveVotingWeight(
        DaoRegistry dao,
        address account
    ) internal view returns (uint128) {
        uint256 etype = dao.getConfiguration(
            DaoHelper.COLLECTIVE_VOTING_ASSET_TYPE
        ); // 0. deposit
        uint256 votingWeightedType = dao.getConfiguration(
            DaoHelper.COLLECTIVE_VOTING_WEIGHTED_TYPE
        ); // 0. quantity 1. log2 2. 1 voter 1 vote
        ColletiveFundingPoolAdapterContract fundingiPoolAdapt = ColletiveFundingPoolAdapterContract(
                dao.getAdapterAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_ADAPTER
                )
            );

        if (
            CollectiveInvestmentPoolExtension(
                dao.getExtensionAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT
                )
            ).balanceOf(address(DaoHelper.DAOSQUARE_TREASURY)) <=
            0 &&
            dao.isMember(account)
        ) {
            return 1;
        }

        if (votingWeightedType == 1) {
            uint256 bal = 0;
            if (etype == 0) {
                //0 deposit
                bal =
                    (fundingiPoolAdapt.balanceOf(dao, account) +
                        fundingiPoolAdapt.getGraceWithdrawAmount(
                            dao,
                            account
                        )) /
                    10 ** 18;
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
            uint128 votingWeight = 0;
            if (etype == 0) {
                //0 deposit
                votingWeight = fundingiPoolAdapt.balanceOf(dao, account) +
                    fundingiPoolAdapt.getGraceWithdrawAmount(dao, account) >
                    0
                    ? 1
                    : 0;
            } else {
                return 0;
            }
            return votingWeight;
        } else if (votingWeightedType == 0) {
            //quantity
            uint256 bal = 0;
            if (etype == 0) {
                //0 deposit
                bal =
                    (fundingiPoolAdapt.balanceOf(dao, account) +
                        fundingiPoolAdapt.getGraceWithdrawAmount(
                            dao,
                            account
                        )) /
                    10 ** 18;
            } else {
                return 0;
            }
            return uint128(bal);
        } else {
            return 0;
        }
    }

    function getVotingWeightByDepositAmount(
        DaoRegistry dao,
        uint256 amount
    ) internal view returns (uint128) {
        uint256 etype = dao.getConfiguration(
            DaoHelper.COLLECTIVE_VOTING_ASSET_TYPE
        ); // 0. deposit
        uint256 votingWeightedType = dao.getConfiguration(
            DaoHelper.COLLECTIVE_VOTING_WEIGHTED_TYPE
        ); // 0. quantity 1. log2 2. 1 voter 1 vote

        if (votingWeightedType == 1) {
            uint256 bal = 0;
            if (etype == 0) {
                //0 deposit
                bal = amount / 10 ** 18;
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
            uint128 votingWeight = 0;
            if (etype == 0) {
                //0 deposit
                votingWeight = amount > 0 ? 1 : 0;
            } else {
                return 0;
            }
            return votingWeight;
        } else if (votingWeightedType == 0) {
            //quantity
            uint256 bal = 0;
            if (etype == 0) {
                //0 deposit
                bal = amount / 10 ** 18;
            } else {
                return 0;
            }
            return uint128(bal);
        } else {
            return 0;
        }
    }
}
