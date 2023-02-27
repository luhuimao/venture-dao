// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "../../adapters/vesting/contracts/interfaces/IFuroVesting.sol";
import "./FlexAllocation.sol";
import "./FlexFunding.sol";
import "./interfaces/IFlexFunding.sol";
import "hardhat/console.sol";

// Use the FuroStreamVesting to create Vesting and do not create vesting directly.

contract FlexVesting is IFuroVesting, Multicall, BoringOwnable {
    // IBentoBoxMinimal public immutable bentoBox;

    address public tokenURIFetcher;

    mapping(uint256 => Vest) public vests;

    uint256 public vestIds;

    uint256 public constant PERCENTAGE_PRECISION = 1e18;

    // custom errors
    error InvalidStart();
    error NotOwner();
    error NotVestReceiver();
    error InvalidStepSetting();

    // constructor(IBentoBoxMinimal _bentoBox) {
    constructor() {
        // bentoBox = _bentoBox;
        vestIds = 1;
        // _bentoBox.registerProtocol();
    }

    function setTokenURIFetcher(address _fetcher) external onlyOwner {
        tokenURIFetcher = _fetcher;
    }

    struct CreateVestLocalVars {
        uint256 returnTokenAmount;
        uint256 depositedShares;
        uint256 vestId;
        uint128 stepShares;
        uint128 cliffShares;
        uint128 stepPercentage;
        FlexAllocationAdapterContract allocAdapter;
        FlexFundingAdapterContract flexFundingAdapt;
        uint256 duration;
        uint256 ratePerSecond;
        uint256 depositAmount;
        address tokenAddress;
        uint256 vestingStartTime;
        uint256 vestingCliffDuration;
        uint256 vestingStepDuration;
        uint256 vestingSteps;
        address allocAdaptAddr;
        IFlexFunding.VestInfo vestInfo;
        IFlexFunding.FundingInfo fundingInfo;
    }

    function createVesting(
        DaoRegistry dao,
        address recipientAddr,
        bytes32 proposalId
    )
        external
        payable
        override
        returns (
            uint256 depositedShares,
            uint256 vestId,
            uint128 stepShares,
            uint128 cliffShares
        )
    {
        CreateVestLocalVars memory vars;
        vars.allocAdaptAddr = dao.getAdapterAddress(
            DaoHelper.FLEX_ALLOCATION_ADAPT
        );
        vars.allocAdapter = FlexAllocationAdapterContract(vars.allocAdaptAddr);
        require(
            vars.allocAdapter.ifEligible(dao, proposalId, recipientAddr),
            "Vesting::createVesting::Recipient not eligible of this proposalId"
        );
        require(
            !vars.allocAdapter.isVestCreated(dao, proposalId, recipientAddr),
            "Vesting::createVesting::Already created"
        );

        vars.flexFundingAdapt = FlexFundingAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_FUNDING_ADAPT)
        );
        (vars.depositAmount, ) = vars.allocAdapter.vestingInfos(
            address(dao),
            proposalId,
            recipientAddr
        );

        (, vars.fundingInfo, vars.vestInfo, , , , , ) = vars
            .flexFundingAdapt
            .Proposals(address(dao), proposalId);
        if (
            vars.vestInfo.vestingCliffLockAmount >
            vars.fundingInfo.returnTokenAmount
        ) revert("Invalid Vesting Amount Setting");
        if (
            vars.vestInfo.vestingStartTime == 0 ||
            vars.vestInfo.vestingCliffEndTime == 0 ||
            vars.vestInfo.vestingEndTime == 0 ||
            vars.vestInfo.vestingInterval == 0
        ) revert("Invalid Vesting Time Setting");

        vars.depositedShares = _depositToken(
            dao,
            vars.fundingInfo.returnTokenAddr,
            vars.allocAdaptAddr,
            address(this),
            vars.depositAmount,
            false
        );
        vars.duration =
            vars.vestInfo.vestingEndTime -
            vars.vestInfo.vestingCliffEndTime;

        vars.vestingSteps = vars.duration / vars.vestInfo.vestingInterval;

        if (vars.duration <= vars.vestInfo.vestingInterval)
            vars.vestingSteps = 1;

        if (vars.duration > vars.vestInfo.vestingInterval) {
            if (vars.vestInfo.vestingInterval % vars.duration == 0)
                vars.vestingSteps =
                    vars.duration /
                    vars.vestInfo.vestingInterval;

            if (
                vars.vestingSteps * vars.vestInfo.vestingInterval <
                vars.duration
            )
                vars.vestingSteps =
                    vars.duration /
                    vars.vestInfo.vestingInterval +
                    1;
        }
        vars.cliffShares = uint128(
            (vars.depositAmount * vars.vestInfo.vestingCliffLockAmount) /
                PERCENTAGE_PRECISION
        );

        vars.stepShares = uint128(
            (vars.depositedShares - vars.cliffShares) / vars.vestingSteps
        );

        vars.vestId = vestIds++;

        vests[vars.vestId] = Vest({
            proposalId: proposalId,
            owner: msg.sender,
            recipient: recipientAddr,
            token: vars.fundingInfo.returnTokenAddr,
            start: uint32(vars.vestInfo.vestingStartTime),
            end: uint32(vars.vestInfo.vestingEndTime),
            cliffDuration: uint32(
                vars.vestInfo.vestingCliffEndTime -
                    vars.vestInfo.vestingStartTime
            ),
            stepDuration: uint32(vars.vestInfo.vestingInterval),
            steps: uint32(vars.vestingSteps),
            cliffShares: vars.cliffShares,
            stepShares: vars.stepShares,
            claimed: 0
        });
        vars.allocAdapter.vestCreated(dao, proposalId, recipientAddr);

        emit CreateVesting(
            vars.vestId,
            vars.fundingInfo.returnTokenAddr,
            recipientAddr,
            uint32(vars.vestInfo.vestingStartTime),
            uint32(
                vars.vestInfo.vestingCliffEndTime -
                    vars.vestInfo.vestingStartTime
            ),
            uint32(vars.vestInfo.vestingInterval),
            uint32(vars.vestingSteps),
            vars.cliffShares,
            vars.stepShares,
            proposalId
        );
    }

    function withdraw(
        DaoRegistry dao,
        uint256 vestId // bytes calldata taskData, // bool toBentoBox
    ) external override {
        Vest storage vest = vests[vestId];
        address recipient = vest.recipient;
        if (recipient != msg.sender) revert NotVestReceiver();
        uint256 canClaim = _balanceOf(vest) - vest.claimed;

        if (canClaim == 0) return;

        vest.claimed += uint128(canClaim);

        _transferToken(
            dao,
            address(vest.token),
            address(this),
            recipient,
            canClaim,
            false
        );

        // if (taskData.length != 0) ITasker(recipient).onTaskReceived(taskData);

        emit Withdraw(vestId, vest.token, canClaim, false);
    }

    function vestBalance(
        uint256 vestId
    ) external view override returns (uint256) {
        Vest memory vest = vests[vestId];
        return _balanceOf(vest) - vest.claimed;
    }

    function _balanceOf(
        Vest memory vest
    ) internal view returns (uint256 claimable) {
        uint256 timeAfterCliff = vest.start + vest.cliffDuration;

        if (block.timestamp < timeAfterCliff) {
            return claimable;
        }

        uint256 passedSinceCliff = block.timestamp - timeAfterCliff;
        uint256 stepPassed = Math.min(
            vest.steps,
            passedSinceCliff / vest.stepDuration
        );
        if (
            vest.start + vest.cliffDuration + vest.steps * vest.stepDuration >
            vest.end &&
            block.timestamp > vest.end
        ) stepPassed = vest.steps;

        claimable = vest.cliffShares + (vest.stepShares * stepPassed);
    }

    function updateOwner(uint256 vestId, address newOwner) external override {
        Vest storage vest = vests[vestId];
        if (vest.owner != msg.sender) revert NotOwner();
        vest.owner = newOwner;
        emit LogUpdateOwner(vestId, newOwner);
    }

    function _depositToken(
        DaoRegistry dao,
        address token,
        address from,
        address to,
        uint256 amount,
        bool fromBentoBox
    ) internal returns (uint256 depositedShares) {
        IBentoBoxMinimal bentoBox = IBentoBoxMinimal(
            dao.getAdapterAddress(DaoHelper.BEN_TO_BOX)
        );
        if (fromBentoBox) {
            depositedShares = bentoBox.toShare(token, amount, false);
            bentoBox.transfer(token, from, to, depositedShares);
        } else {
            (, depositedShares) = bentoBox.deposit{
                value: token == address(0) ? amount : 0
            }(token, from, to, amount, 0);
        }
    }

    function _transferToken(
        DaoRegistry dao,
        address token,
        address from,
        address to,
        uint256 shares,
        bool toBentoBox
    ) internal {
        IBentoBoxMinimal bentoBox = IBentoBoxMinimal(
            dao.getAdapterAddress(DaoHelper.BEN_TO_BOX)
        );
        if (toBentoBox) {
            bentoBox.transfer(token, from, to, shares);
        } else {
            bentoBox.withdraw(token, from, to, 0, shares);
        }
    }
}
