
pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

interface ICollectiveVoting {
    struct FundRaiseProposalInfo{
      FundRaiseTimeInfo timeInfo;
      FundInfo fundInfo;
      PriorityDepositor priorityDepositor;
    }

    struct FundRaiseTimeInfo{
        uint256 startTime;
        uint256 endTime;
    }

    struct FundInfo{
        address tokenAddress;
        uint256 miniTarget;
        uint256 maxCap;
        uint256 miniDeposit;
        uint256 maxDeposit;
    }

    struct PriorityDepositor{
        uint8 valifyType;
        address tokenAddress;
        uint256 tokenId;
        uint256 miniHolding;
    }
}
