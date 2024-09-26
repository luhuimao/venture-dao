// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

// import "./interfaces/IVesting.sol";
import "./ManualVestingERC721.sol";
import "hardhat/console.sol";
import "./core/DaoRegistry.sol";
import "./flex/adatpers/FlexFunding.sol";
import "./helpers/DaoHelper.sol";
import "./flex/extensions/FlexFundingPool.sol";
import "./flex/adatpers/FlexFreeInEscrowFund.sol";
import "./flex/adatpers/interfaces/IFlexFunding.sol";
import "./vintage/adapters/interfaces/IVintageFunding.sol";
import "./vintage/extensions/fundingpool/VintageFundingPool.sol";
import "./vintage/libraries/fundingLibrary.sol";
import "./collective/adapters/interfaces/ICollectiveFunding.sol";
import "./collective/adapters/CollectiveFundingProposalAdapter.sol";
import "./collective/extensions/CollectiveFundingPool.sol";
import "./InvestmentReceiptERC721.sol";
import "./adapters/vesting/contracts/interfaces/IBentoBoxMinimal.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract ManualVesting {
    struct VestParams {
        address token;
        bytes32 proposalId;
        address recipient;
        uint32 start;
        uint32 cliffDuration;
        uint32 stepDuration;
        uint32 steps;
        uint128 stepPercentage;
        uint128 amount;
        bool fromBentoBox;
    }

    struct Vest {
        uint128 claimed;
        uint256 total;
        StepInfo stepInfo;
        TimeInfo timeInfo;
        VestNFTInfo nftInfo;
        VestInfo vestInfo;
    }

    struct StepInfo {
        uint32 steps;
        uint128 cliffShares;
        uint128 stepShares;
    }

    struct TimeInfo {
        uint32 start;
        uint32 end;
        uint32 cliffDuration;
        uint32 stepDuration;
    }

    struct VestNFTInfo {
        address nftToken;
        uint256 tokenId;
    }

    struct VestInfo {
        string name;
        string description;
        address owner;
        address recipient;
        address token;
    }

    struct CreateVestLocalVars {
        uint256 depositedShares;
        uint256 vestId;
        uint128 stepShares;
        uint128 cliffShares;
        uint256 duration;
        uint256 depositAmount;
        uint256 vestingStartTime;
        uint256 vestingSteps;
        address allocAdaptAddr;
        uint256 newTokenId;
    }

    struct CreateVestingParams {
        uint256 startTime;
        uint256 cliffEndTime;
        uint256 endTime;
        uint256 vestingInterval;
        address paybackToken;
        address recipientAddr;
        uint256 depositAmount;
        uint256 cliffVestingAmount;
        bool nftEnable;
        address erc721;
        string name;
        string description;
    }

    event CreateVesting(
        uint256 indexed vestId,
        address token,
        address indexed recipient,
        uint32 start,
        uint32 cliffDuration,
        uint32 stepDuration,
        uint32 steps,
        uint128 cliffShares,
        uint128 stepShares
    );

    event Withdraw(
        uint256 indexed vestId,
        address indexed token,
        uint256 indexed amount,
        bool toBentoBox
    );

    event CancelVesting(
        uint256 indexed vestId,
        uint256 indexed ownerAmount,
        uint256 indexed recipientAmount,
        address token,
        bool toBentoBox
    );

    event LogUpdateOwner(uint256 indexed vestId, address indexed newOwner);

    error NotOwner();
    error NotVestReceiver();
    error InValidVestingTimeParam();
    error InValidBatchVesting2Param();

    mapping(uint256 => Vest) public vests;
    mapping(address => mapping(uint256 => uint256)) public tokenIdToVestId; //erc721 address => tokenId => vestId

    uint256 public vestIds;

    uint256 public constant PERCENTAGE_PRECISION = 1e18;

    address bentoBoxAddr;
    address receiptNFTAddr;

    constructor(address _bentoBoxAddr, address _receiptNFTAddr) {
        vestIds = 1;
        bentoBoxAddr = _bentoBoxAddr;
        receiptNFTAddr = _receiptNFTAddr;
    }

    function createVesting(CreateVestingParams memory params) public payable {
        CreateVestLocalVars memory vars;

        if (
            params.startTime == 0 ||
            params.cliffEndTime == 0 ||
            params.endTime == 0 ||
            params.vestingInterval == 0
        ) revert InValidVestingTimeParam();
        vars.depositedShares = _depositToken(
            params.paybackToken,
            msg.sender,
            address(this),
            params.depositAmount,
            false
        );
        vars.duration = params.endTime - params.cliffEndTime;

        vars.vestingSteps = vars.duration / params.vestingInterval;

        if (vars.duration <= params.vestingInterval) vars.vestingSteps = 1;

        if (vars.duration > params.vestingInterval) {
            if (params.vestingInterval % vars.duration == 0)
                vars.vestingSteps = vars.duration / params.vestingInterval;

            if (vars.vestingSteps * params.vestingInterval < vars.duration)
                vars.vestingSteps = vars.duration / params.vestingInterval + 1;
        }
        vars.cliffShares = uint128(
            (params.depositAmount * params.cliffVestingAmount) /
                PERCENTAGE_PRECISION
        );

        vars.stepShares = uint128(
            (vars.depositedShares - vars.cliffShares) / vars.vestingSteps
        );

        vars.vestId = vestIds++;

        if (params.nftEnable) {
            vars.newTokenId = ManualVestingERC721(params.erc721).safeMint(
                params.recipientAddr
            );
            tokenIdToVestId[params.erc721][vars.newTokenId] = vars.vestId;
        }
        createNewVest(
            vars.vestId,
            [
                msg.sender,
                params.recipientAddr,
                params.paybackToken,
                params.erc721
            ],
            [
                vars.vestingSteps,
                vars.cliffShares,
                vars.stepShares,
                params.depositAmount,
                params.startTime,
                params.endTime,
                params.cliffEndTime,
                params.vestingInterval,
                vars.newTokenId
            ],
            params.nftEnable,
            params.name,
            params.description
        );

        emit CreateVesting(
            vars.vestId,
            params.paybackToken,
            params.recipientAddr,
            uint32(params.startTime),
            uint32(params.cliffEndTime - params.startTime),
            uint32(params.vestingInterval),
            uint32(vars.vestingSteps),
            vars.cliffShares,
            vars.stepShares
        );
    }

    function createNewVest(
        uint256 vestId,
        address[4] memory _addressArgs,
        uint256[9] memory _uint256Args,
        bool nftEnable,
        string memory vestName,
        string memory vestDescription
    ) internal {
        vests[vestId] = Vest(
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
                nftEnable == true ? _addressArgs[3] : address(0x0),
                _uint256Args[8]
            ),
            VestInfo(
                vestName,
                vestDescription,
                _addressArgs[0],
                _addressArgs[1],
                _addressArgs[2]
            )
        );
    }

    function withdraw(uint256 vestId) external {
        Vest storage vest = vests[vestId];
        address recipient = vest.vestInfo.recipient;

        if (vest.nftInfo.nftToken != address(0x0)) {
            if (
                ManualVestingERC721(vest.nftInfo.nftToken).ownerOf(
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
            address(vest.vestInfo.token),
            address(this),
            recipient,
            canClaim,
            false
        );
        emit Withdraw(vestId, vest.vestInfo.token, canClaim, false);
    }

    function vestBalance(uint256 vestId) external view returns (uint256) {
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

    function _depositToken(
        address token,
        address from,
        address to,
        uint256 amount,
        bool fromBentoBox
    ) internal returns (uint256 depositedShares) {
        IBentoBoxMinimal bentoBox = IBentoBoxMinimal(bentoBoxAddr);
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
        address token,
        address from,
        address to,
        uint256 shares,
        bool toBentoBox
    ) internal {
        IBentoBoxMinimal bentoBox = IBentoBoxMinimal(bentoBoxAddr);
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

    struct BatchVestingVars {
        uint256 investedAmount;
        uint256 totalAmount;
        uint256 depositAmount;
        InvestmentReceiptERC721 receiptCon;
    }

    function batchCreate(
        address[] calldata investors,
        address[] calldata holders,
        CreateVestingParams calldata params,
        uint256 total,
        uint8 mode,
        address daoAddr,
        bytes32 proposalId
    ) external {
        BatchVestingVars memory vars;
        vars.receiptCon = InvestmentReceiptERC721(receiptNFTAddr);
        if (investors.length > 0) {
            for (uint8 i = 0; i < investors.length; i++) {
                (vars.investedAmount, vars.totalAmount) = getInvestedAmount(
                    daoAddr,
                    proposalId,
                    investors[i],
                    mode
                );

                vars.depositAmount =
                    (total * vars.investedAmount) /
                    vars.totalAmount;

                createVesting(
                    CreateVestingParams(
                        params.startTime,
                        params.cliffEndTime,
                        params.endTime,
                        params.vestingInterval,
                        params.paybackToken,
                        investors[i],
                        vars.depositAmount,
                        params.cliffVestingAmount,
                        params.nftEnable,
                        params.erc721,
                        params.name,
                        params.description
                    )
                );
            }
        }

        if (holders.length > 0) {
            for (uint8 i = 0; i < holders.length; i++) {
                (, , , , vars.totalAmount, vars.investedAmount, , , , ) = vars
                    .receiptCon
                    .tokenIdToInvestmentProposalInfo(
                        vars.receiptCon.holderToTokenId(holders[i])
                    );

                vars.depositAmount =
                    (total * vars.investedAmount) /
                    vars.totalAmount;

                createVesting(
                    CreateVestingParams(
                        params.startTime,
                        params.cliffEndTime,
                        params.endTime,
                        params.vestingInterval,
                        params.paybackToken,
                        holders[i],
                        vars.depositAmount,
                        params.cliffVestingAmount,
                        params.nftEnable,
                        params.erc721,
                        params.name,
                        params.description
                    )
                );
            }
        }
    }

    function batchCreate2(
        address[] calldata receivers,
        uint256[] calldata amounts,
        CreateVestingParams calldata params
    ) external {
        if (receivers.length != amounts.length)
            revert InValidBatchVesting2Param();

        if (
            params.startTime == 0 ||
            params.cliffEndTime == 0 ||
            params.endTime == 0 ||
            params.vestingInterval == 0
        ) revert InValidBatchVesting2Param();

        if (receivers.length > 0) {
            BatchVestingVars memory vars;

            for (uint8 i = 0; i < receivers.length; i++) {
                vars.depositAmount = amounts[i];

                createVesting(
                    CreateVestingParams(
                        params.startTime,
                        params.cliffEndTime,
                        params.endTime,
                        params.vestingInterval,
                        params.paybackToken,
                        receivers[i],
                        vars.depositAmount,
                        params.cliffVestingAmount,
                        params.nftEnable,
                        params.erc721,
                        params.name,
                        params.description
                    )
                );
            }
        }
    }

    struct MintLocalVars {
        uint256 myInvestmentAmount;
        uint256 finalRaisedAmount;
        uint256 fundingAmount;
        uint256 executeBlockNum;
        IFlexFunding.ProposalInvestmentInfo investmentInfo;
        IFlexFunding.VestInfo flexVestInfo;
        InvestmentLibrary.ProposalPaybackTokenInfo vinpbnfo;
        address tokenAddress;
        uint256 vinvestmentAmount;
        VintageFundingPoolExtension fundingPoolExt;
        ICollectiveFunding.FundingInfo cfundingInfo;
        ICollectiveFunding.VestingInfo colVestingInfo;
        ICollectiveFunding.EscrowInfo colEsInfo;
        CollectiveInvestmentPoolExtension cFundingPoolExt;
        bool nftEnable;
        bool escrow;
    }

    function getInvestedAmount(
        address daoAddr,
        bytes32 investmentProposalId,
        address account,
        uint8 mode
    ) internal view returns (uint256, uint256) {
        MintLocalVars memory vars;
        if (mode == 0) {
            (
                ,
                vars.investmentInfo,
                vars.flexVestInfo,
                ,
                ,
                ,
                ,
                ,
                vars.executeBlockNum
            ) = FlexFundingAdapterContract(
                DaoRegistry(daoAddr).getAdapterAddress(
                    DaoHelper.FLEX_FUNDING_ADAPT
                )
            ).Proposals(daoAddr, investmentProposalId);
            // vars.escrow = vars.investmentInfo.escrow;
            // vars.nftEnable = vars.flexVestInfo.nftEnable;
            // vars.tokenAddress = vars.investmentInfo.tokenAddress;
            (, uint256 esc) = FlexFreeInEscrowFundAdapterContract(
                DaoRegistry(daoAddr).getAdapterAddress(
                    DaoHelper.FLEX_FREE_IN_ESCROW_FUND_ADAPTER
                )
            ).getEscrowAmount(
                    DaoRegistry(daoAddr),
                    investmentProposalId,
                    account
                );

            vars.myInvestmentAmount =
                FlexInvestmentPoolExtension(
                    DaoRegistry(daoAddr).getExtensionAddress(
                        DaoHelper.FLEX_INVESTMENT_POOL_EXT
                    )
                ).getPriorAmount(
                        investmentProposalId,
                        account,
                        vars.executeBlockNum - 1
                    ) -
                esc;

            vars.fundingAmount = vars.investmentInfo.investedAmount;
            vars.myInvestmentAmount =
                (vars.myInvestmentAmount * vars.investmentInfo.investedAmount) /
                vars.investmentInfo.finalRaisedAmount;

            // vars.finalRaisedAmount = vars.investmentInfo.finalRaisedAmount;
        } else if (mode == 1) {
            (
                vars.tokenAddress,
                vars.fundingAmount,
                ,
                ,
                ,
                ,
                ,
                ,
                vars.vinpbnfo,
                ,
                vars.executeBlockNum
            ) = VintageFundingAdapterContract(
                DaoRegistry(daoAddr).getAdapterAddress(
                    DaoHelper.VINTAGE_FUNDING_ADAPTER
                )
            ).proposals(daoAddr, investmentProposalId);
            // vars.nftEnable = vars.vinpbnfo.nftEnable;
            // vars.escrow = vars.vinpbnfo.escrow;
            vars.fundingPoolExt = VintageFundingPoolExtension(
                DaoRegistry(daoAddr).getExtensionAddress(
                    DaoHelper.VINTAGE_INVESTMENT_POOL_EXT
                )
            );
            vars.myInvestmentAmount =
                (vars.fundingPoolExt.getPriorAmount(
                    account,
                    vars.tokenAddress,
                    vars.executeBlockNum - 1
                ) * vars.fundingAmount) /
                vars.fundingPoolExt.getPriorAmount(
                    address(DaoHelper.DAOSQUARE_TREASURY),
                    vars.tokenAddress,
                    vars.executeBlockNum - 1
                );
        } else if (mode == 2) {
            (
                vars.cfundingInfo,
                vars.colEsInfo,
                vars.colVestingInfo,
                ,
                ,
                vars.executeBlockNum,

            ) = ColletiveFundingProposalAdapterContract(
                DaoRegistry(daoAddr).getAdapterAddress(
                    DaoHelper.COLLECTIVE_FUNDING_ADAPTER
                )
            ).proposals(daoAddr, investmentProposalId);

            vars.fundingAmount = vars.cfundingInfo.fundingAmount;
            // vars.finalRaisedAmount = vars.cfundingInfo.totalAmount;
            vars.cFundingPoolExt = CollectiveInvestmentPoolExtension(
                DaoRegistry(daoAddr).getExtensionAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT
                )
            );
            // vars.nftEnable = vars.colVestingInfo.nftEnable;
            // vars.escrow = vars.colEsInfo.escrow;
            // vars.tokenAddress = vars.cfundingInfo.token;

            vars.myInvestmentAmount =
                (vars.cFundingPoolExt.getPriorAmount(
                    account,
                    vars.cfundingInfo.token,
                    vars.executeBlockNum - 1
                ) * vars.fundingAmount) /
                vars.cFundingPoolExt.getPriorAmount(
                    address(DaoHelper.DAOSQUARE_TREASURY),
                    vars.cfundingInfo.token,
                    vars.executeBlockNum - 1
                );
        }

        return (vars.myInvestmentAmount, vars.fundingAmount);
    }
}
