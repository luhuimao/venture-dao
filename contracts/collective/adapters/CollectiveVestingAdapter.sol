// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "./interfaces/ICollectiveVesting.sol";
import "hardhat/console.sol";

contract CollectiveVestingAdapterContract is ICollectiveVesting {
    mapping(uint256 => Vest) public vests;
    mapping(address => mapping(uint256 => uint256)) public tokenIdToVestId; //erc721 address => tokenId => vestId

    uint256 public vestIds;

    uint256 public constant PERCENTAGE_PRECISION = 1e18;

    constructor() {
        vestIds = 1;
    }

    function createVesting(
        DaoRegistry dao,
        address recipientAddr,
        bytes32 proposalId
    ) external payable override {
        CreateVestLocalVars memory vars;
        vars.allocAdaptAddr = dao.getAdapterAddress(
            DaoHelper.COLLECTIVE_ALLOCATION_ADAPTER
        );
        vars.allocAdapter = CollectiveAllocationAdapterContract(
            vars.allocAdaptAddr
        );
        require(
            vars.allocAdapter.ifEligible(dao, recipientAddr, proposalId),
            "uneligible of this proposalId"
        );
        if (!vars.allocAdapter.ifEligible(dao, recipientAddr, proposalId))
            revert UN_ELIGIBLE_FOR_THIS_PROPOSAL();

        if (vars.allocAdapter.isVestCreated(dao, proposalId, recipientAddr))
            revert ALREADY_CREATED();

        vars.collectiveFundingAdapt = ColletiveFundingProposalAdapterContract(
            dao.getAdapterAddress(DaoHelper.COLLECTIVE_FUNDING_ADAPTER)
        );
        (vars.depositAmount, ) = vars.allocAdapter.vestingInfos(
            address(dao),
            proposalId,
            recipientAddr
        );
        vars.depositAmount += vars.allocAdapter.getInvestmentRewards(
            dao,
            recipientAddr,
            proposalId
        );

        (, vars.paybackTokenInfo, vars.vestInfo, , , , ) = vars
            .collectiveFundingAdapt
            .proposals(address(dao), proposalId);

        if (
            vars.vestInfo.startTime == 0 ||
            vars.vestInfo.cliffEndTime == 0 ||
            vars.vestInfo.endTime == 0 ||
            vars.vestInfo.vestingInterval == 0
        ) revert InValidVestingTimeParam();

        vars.depositedShares = _depositToken(
            dao,
            vars.paybackTokenInfo.paybackToken,
            vars.allocAdaptAddr,
            address(this),
            vars.depositAmount,
            false
        );
        vars.duration = vars.vestInfo.endTime - vars.vestInfo.cliffEndTime;

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
            (vars.depositAmount * vars.vestInfo.cliffVestingAmount) /
                PERCENTAGE_PRECISION
        );

        vars.stepShares = uint128(
            (vars.depositedShares - vars.cliffShares) / vars.vestingSteps
        );

        vars.vestId = vestIds++;

        if (vars.vestInfo.nftEnable) {
            vars.newTokenId = VestingERC721(vars.vestInfo.erc721).safeMint(
                recipientAddr
            );

            tokenIdToVestId[vars.vestInfo.erc721][vars.newTokenId] = vars
                .vestId;
        }

        createNewVest(
            vars.vestId,
            proposalId,
            [
                address(dao),
                msg.sender,
                recipientAddr,
                vars.paybackTokenInfo.paybackToken,
                vars.vestInfo.nftEnable == true
                    ? vars.vestInfo.erc721
                    : address(0x0)
            ],
            [
                vars.vestingSteps,
                vars.cliffShares,
                vars.stepShares,
                vars.depositAmount,
                vars.vestInfo.startTime,
                vars.vestInfo.endTime,
                vars.vestInfo.cliffEndTime,
                vars.vestInfo.vestingInterval,
                vars.newTokenId
            ],
            vars.vestInfo.nftEnable,
            "",
            ""
        );
        vars.allocAdapter.vestCreated(dao, proposalId, recipientAddr);

        emit CreateVesting(
            vars.vestId,
            vars.paybackTokenInfo.paybackToken,
            recipientAddr,
            uint32(vars.vestInfo.startTime),
            uint32(vars.vestInfo.cliffEndTime - vars.vestInfo.startTime),
            uint32(vars.vestInfo.vestingInterval),
            uint32(vars.vestingSteps),
            vars.cliffShares,
            vars.stepShares,
            proposalId
        );
    }

    function createNewVest(
        uint256 vestId,
        bytes32 proposalId,
        address[5] memory _addressArgs,
        uint256[9] memory _uint256Args,
        bool nftEnable,
        string memory vestName,
        string memory vestDescription
    ) internal {
        vests[vestId] = Vest(
            _addressArgs[0],
            proposalId,
            0,
            _uint256Args[3],
            StepInfo(
                uint32(_uint256Args[0]),
                uint128(_uint256Args[1]),
                uint128(_uint256Args[2])
            ),
            TimeInfo(
                uint32(_uint256Args[4]),
                uint32(_uint256Args[5]),
                uint32(_uint256Args[6] - _uint256Args[4]),
                uint32(_uint256Args[7])
            ),
            VestNFTInfo(
                nftEnable == true ? _addressArgs[4] : address(0x0),
                _uint256Args[8]
            ),
            VestInfo(
                vestName,
                vestDescription,
                _addressArgs[1],
                _addressArgs[2],
                _addressArgs[3]
            )
        );
    }

    function withdraw(DaoRegistry dao, uint256 vestId) external override {
        Vest storage vest = vests[vestId];
        address recipient = vest.vestInfo.recipient;

        if (vest.nftInfo.nftToken != address(0x0)) {
            if (
                VestingERC721(vest.nftInfo.nftToken).ownerOf(
                    vest.nftInfo.tokenId
                ) != msg.sender
            ) revert NotVestReceiver();
        } else {
            if (recipient != msg.sender) revert NotVestReceiver();
        }

        uint256 canClaim = _balanceOf(vest) - vest.claimed;

        if (canClaim == 0) return;

        vest.claimed += uint128(canClaim);

        _transferToken(
            dao,
            address(vest.vestInfo.token),
            address(this),
            recipient,
            canClaim,
            false
        );
        emit Withdraw(vestId, vest.vestInfo.token, canClaim, false);
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
        uint256 timeAfterCliff = vest.timeInfo.start +
            vest.timeInfo.cliffDuration;

        if (block.timestamp < timeAfterCliff) {
            return claimable;
        }

        uint256 passedSinceCliff = block.timestamp - timeAfterCliff;
        uint256 stepPassed = Math.min(
            vest.stepInfo.steps,
            passedSinceCliff / vest.timeInfo.stepDuration
        );
        if (
            vest.timeInfo.start +
                vest.timeInfo.cliffDuration +
                vest.stepInfo.steps *
                vest.timeInfo.stepDuration >
            vest.timeInfo.end &&
            block.timestamp > vest.timeInfo.end
        ) stepPassed = vest.stepInfo.steps;

        claimable =
            vest.stepInfo.cliffShares +
            (vest.stepInfo.stepShares * stepPassed);
    }

    function updateOwner(uint256 vestId, address newOwner) external override {
        Vest storage vest = vests[vestId];
        if (vest.vestInfo.owner != msg.sender) revert NotOwner();
        vest.vestInfo.owner = newOwner;
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

    function getVestIdByTokenId(
        address token,
        uint256 tokenId
    ) public view returns (uint256) {
        return tokenIdToVestId[token][tokenId];
    }

    function getRemainingPercentage(
        address token,
        uint256 tokenId
    ) external view returns (uint256, uint256, uint256) {
        uint256 percentOfRemaining_Total = 0;
        uint256 remaining = 0;
        uint256 total = 0;
        uint256 vestId = getVestIdByTokenId(token, tokenId);
        if (vestId > 0) {
            remaining = (vests[vestId].total - vests[vestId].claimed);
            total = vests[vestId].total;
            percentOfRemaining_Total =
                ((vests[vestId].total - vests[vestId].claimed) * 100) /
                vests[vestId].total;
        }
        return (percentOfRemaining_Total, remaining, total);
    }
}
