// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "../interfaces/IFuroVesting.sol";
import "../../../AllocationAdapterV2.sol";
import "../../../DistributeFundV2.sol";
import "hardhat/console.sol";

// Use the FuroStreamVesting to create Vesting and do not create vesting directly.

contract FuroVesting is
    IFuroVesting,
    // ERC721("Furo Vesting", "FUROVEST"),
    Multicall,
    BoringOwnable
{
    // IBentoBoxMinimal public immutable bentoBox;
    address public immutable wETH;

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
        wETH = address(0x0);
        vestIds = 1;
        // _bentoBox.registerProtocol();
    }

    function setTokenURIFetcher(address _fetcher) external onlyOwner {
        tokenURIFetcher = _fetcher;
    }

    // function tokenURI(uint256 id) public view override returns (string memory) {
    //     return ITokenURIFetcher(tokenURIFetcher).fetchTokenURIData(id);
    // }

    // function setBentoBoxApproval(
    //     address user,
    //     bool approved,
    //     uint8 v,
    //     bytes32 r,
    //     bytes32 s
    // ) external payable override {
    //             IBentoBoxMinimal bentoBox=IBentoBoxMinimal(dao.getAddressConfiguration(DaoHelper.BEN_TO_BOX));

    //     bentoBox.setMasterContractApproval(
    //         user,
    //         address(this),
    //         approved,
    //         v,
    //         r,
    //         s
    //     );
    // }

    struct CreateVestLocalVars {
        uint256 tradingOffTokenAmount;
        uint256 depositedShares;
        uint256 vestId;
        uint128 stepShares;
        uint128 cliffShares;
        uint128 stepPercentage;
        AllocationAdapterContractV2 allocAdapter;
        DistributeFundContractV2 distributeFundAdapter;
        uint256 duration;
        uint256 ratePerSecond;
        uint256 depositAmount;
        address tokenAddress;
        uint256 vestingStartTime;
        uint256 vestingCliffDuration;
        uint256 vestingStepDuration;
        uint256 vestingSteps;
        address allocAdaptAddr;
        IFunding.VestInfo vestInfo;
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
            DaoHelper.ALLOCATION_ADAPTV2
        );
        vars.allocAdapter = AllocationAdapterContractV2(vars.allocAdaptAddr);
        require(
            vars.allocAdapter.ifEligible(dao, recipientAddr, proposalId),
            "Vesting::createVesting::Recipient not eligible of this proposalId"
        );
        require(
            !vars.allocAdapter.isVestCreated(dao, proposalId, recipientAddr),
            "Vesting::createVesting::Already created"
        );

        vars.distributeFundAdapter = DistributeFundContractV2(
            dao.getAdapterAddress(DaoHelper.DISTRIBUTE_FUND_ADAPTV2)
        );
        (vars.depositAmount, ) = vars.allocAdapter.vestingInfos(
            address(dao),
            proposalId,
            recipientAddr
        );
        (
            vars.tokenAddress,
            vars.tradingOffTokenAmount,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            vars.vestInfo
        ) = vars.distributeFundAdapter.distributions(address(dao), proposalId);
        // if (vestParams.start < block.timestamp) revert InvalidStart();
        // vars.stepPercentage=uint128(PERCENTAGE_PRECISION / vars.vestInfo.vestingSteps);
        if (vars.vestInfo.vestingCliffLockAmount > vars.tradingOffTokenAmount)
            revert InvalidStepSetting();
        if (
            vars.vestInfo.vestingStepDuration == 0 ||
            vars.vestInfo.vestingSteps == 0
        ) revert InvalidStepSetting();
        // depositedShares = _depositToken(
        //     address(vestParams.token),
        //     msg.sender,
        //     address(this),
        //     vestParams.amount,
        //     vestParams.fromBentoBox
        // );

        vars.depositedShares = _depositToken(
            dao,
            vars.tokenAddress,
            vars.allocAdaptAddr,
            address(this),
            vars.depositAmount,
            false
        );
        vars.stepShares = uint128(
            ((vars.depositedShares *
                (vars.tradingOffTokenAmount -
                    vars.vestInfo.vestingCliffLockAmount)) /
                vars.tradingOffTokenAmount) / vars.vestInfo.vestingSteps
        );
        vars.cliffShares = uint128(
            vars.depositedShares -
                (vars.stepShares * vars.vestInfo.vestingSteps)
        );

        vars.vestId = vestIds++;
        // _mint(vestParams.recipient, vestId);

        vests[vars.vestId] = Vest({
            proposalId: proposalId,
            owner: msg.sender,
            recipient: recipientAddr,
            // token: address(vestParams.token) == address(0)
            //     ? IERC20(wETH)
            //     : vestParams.token,
            token: vars.tokenAddress,
            start: uint32(vars.vestInfo.vestingStartTime),
            end: uint32(
                vars.vestInfo.vestingStartTime +
                    vars.vestInfo.vestingCliffDuration +
                    vars.vestInfo.vestingStepDuration *
                    vars.vestInfo.vestingSteps
            ),
            cliffDuration: uint32(vars.vestInfo.vestingCliffDuration),
            stepDuration: uint32(vars.vestInfo.vestingStepDuration),
            steps: uint32(vars.vestInfo.vestingSteps),
            cliffShares: vars.cliffShares,
            stepShares: vars.stepShares,
            claimed: 0
        });
        vars.allocAdapter.streamCreated(dao, proposalId, recipientAddr);

        emit CreateVesting(
            vars.vestId,
            vars.tokenAddress,
            recipientAddr,
            uint32(vars.vestInfo.vestingStartTime),
            uint32(vars.vestInfo.vestingCliffDuration),
            uint32(vars.vestInfo.vestingStepDuration),
            uint32(vars.vestInfo.vestingSteps),
            vars.cliffShares,
            vars.stepShares,
            proposalId
        );
    }

    function withdraw(
        DaoRegistry dao,
        uint256 vestId // bytes calldata taskData,
    ) external override // bool toBentoBox
    {
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

    // function stopVesting(uint256 vestId, bool toBentoBox) external override {
    //     Vest memory vest = vests[vestId];

    //     if (vest.owner != msg.sender) revert NotOwner();

    //     uint256 amountVested = _balanceOf(vest);
    //     uint256 canClaim = amountVested - vest.claimed;
    //     uint256 returnShares = (vest.cliffShares +
    //         (vest.steps * vest.stepShares)) - amountVested;

    //     delete vests[vestId];

    //     _transferToken(
    //         address(vest.token),
    //         address(this),
    //         ownerOf[vestId],
    //         canClaim,
    //         toBentoBox
    //     );

    //     _transferToken(
    //         address(vest.token),
    //         address(this),
    //         msg.sender,
    //         returnShares,
    //         toBentoBox
    //     );
    //     emit CancelVesting(
    //         vestId,
    //         returnShares,
    //         canClaim,
    //         vest.token,
    //         toBentoBox
    //     );
    // }

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
