// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@rari-capital/solmate/src/tokens/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./flex/libraries/LibTokenUri.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./flex/adatpers/FlexFunding.sol";
import "./flex/adatpers/interfaces/IFlexFunding.sol";
import "./flex/extensions/FlexFundingPool.sol";
import "./vintage/adapters/VintageFundingAdapter.sol";
import "./vintage/adapters/interfaces/IVintageFunding.sol";
import "./vintage/extensions/fundingpool/VintageFundingPool.sol";
import "./vintage/libraries/fundingLibrary.sol";
import "./collective/adapters/interfaces/ICollectiveFunding.sol";
import "./collective/adapters/CollectiveFundingProposalAdapter.sol";
import "./collective/extensions/CollectiveFundingPool.sol";
import "./helpers/DaoHelper.sol";
import "./helpers/InvestmentReceiptERC721Helper.sol";
import "./flex/adatpers/FlexFreeInEscrowFund.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "hardhat/console.sol";

contract InvestmentReceiptERC721 is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    using EnumerableSet for EnumerableSet.UintSet;

    address public _owner;
    address public receiptERC721HelperContrAddress;
    /// @dev Global max total supply of NFTs.
    uint256 public maxTotalSupply;
    string constant collectionDescription =
        unicode"The NFTs in the DAOSquare Investment Receipt Collection are generated from investments made by Venture DAOs in the DAOSquare Incubator, which activated the NFT function WITHOUT using the Escrow Function. Each NFT represents an investor’s investment record of investing in a Project through a DAO in DAOSquare Incubator, like a receipt. You can view the dynamic data (image) and properties information of each NFT to check whether the NFT is currently valid and the investment records. The Project or DAO may promise to give benefits to NFT holders, regardless of the original investor.  NFTs in this collection are transferable.  The fulfillment of any promise based on the NFT depends on the promiser (Project or DAO), which the NFT itself cannot guarantee technically.";

    /// @dev Emitted when the global max supply of tokens is updated.
    // event MaxTotalSupplyUpdated(uint256 maxTotalSupply);
    // mapping(bytes32 => mapping(address => uint256))
    //     public investmentIdToTokenId;
    mapping(uint256 => bytes32) public tokenIdToInvestmentProposalId;
    mapping(uint256 => InvestmentReceiptInfo)
        public tokenIdToInvestmentProposalInfo;
    mapping(bytes32 => mapping(address => bool)) public mintedAccounts;
    mapping(bytes32 => mapping(address => EnumerableSet.UintSet)) proposalId_tokenIds;

    struct InvestmentReceiptInfo {
        address daoAddress;
        bytes32 investmentProposalId;
        uint256 proposalExecutedBlockNum;
        string executedTxHash;
        uint256 totalInvestedAmount;
        uint256 myInvestedAmount;
        ERC20Info erc20;
        string projectName;
        string description;
        string investmentProposalLink;
    }

    struct ERC20Info {
        address tokenAddress;
        string tokenSymbol;
        string tokenName;
    }

    error ALREADY_MINTED();
    error UN_MINTABLE();

    event Minted(bytes32 proposalId, address minter, uint256 tokenId);

    constructor(
        string memory name,
        string memory symbol,
        // address _flexInvestmentContrAddress,
        // address _vintageInvestmentontrAddress,
        // address _collectiveInvestmentContrAddress,
        address _ercHelperContrAddress
    ) ERC721(name, symbol) {
        _owner = msg.sender;
        // flexInvestmentContrAddress = _flexInvestmentContrAddress;
        // vintageInvestmentContrAddress = _vintageInvestmentontrAddress;
        // collectiveInvestmentContrAddress = _collectiveInvestmentContrAddress;
        receiptERC721HelperContrAddress = _ercHelperContrAddress;
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

    function safeMint(
        address daoAddr,
        bytes32 investmentProposalId,
        uint8 mode,
        string memory executedTxHash,
        string memory projectName,
        string memory description
    ) external returns (uint256 id) {
        if (mintedAccounts[investmentProposalId][msg.sender] == true)
            revert ALREADY_MINTED();

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
            vars.escrow = vars.investmentInfo.escrow;
            vars.nftEnable = vars.flexVestInfo.nftEnable;
            vars.tokenAddress = vars.investmentInfo.tokenAddress;
            (, uint256 esc) = FlexFreeInEscrowFundAdapterContract(
                DaoRegistry(daoAddr).getAdapterAddress(
                    DaoHelper.FLEX_FREE_IN_ESCROW_FUND_ADAPTER
                )
            ).getEscrowAmount(
                    DaoRegistry(daoAddr),
                    investmentProposalId,
                    msg.sender
                );

            vars.myInvestmentAmount =
                FlexInvestmentPoolExtension(
                    DaoRegistry(daoAddr).getExtensionAddress(
                        DaoHelper.FLEX_INVESTMENT_POOL_EXT
                    )
                ).getPriorAmount(
                        investmentProposalId,
                        msg.sender,
                        vars.executeBlockNum - 1
                    ) -
                esc;

            vars.fundingAmount = vars.investmentInfo.investedAmount;
            vars.myInvestmentAmount =
                (vars.myInvestmentAmount * vars.investmentInfo.investedAmount) /
                vars.investmentInfo.finalRaisedAmount;

            vars.finalRaisedAmount = vars.investmentInfo.finalRaisedAmount;
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
            vars.nftEnable = vars.vinpbnfo.nftEnable;
            vars.escrow = vars.vinpbnfo.escrow;
            vars.fundingPoolExt = VintageFundingPoolExtension(
                DaoRegistry(daoAddr).getExtensionAddress(
                    DaoHelper.VINTAGE_INVESTMENT_POOL_EXT
                )
            );
            vars.myInvestmentAmount =
                (vars.fundingPoolExt.getPriorAmount(
                    msg.sender,
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
            vars.finalRaisedAmount = vars.cfundingInfo.totalAmount;
            vars.cFundingPoolExt = CollectiveInvestmentPoolExtension(
                DaoRegistry(daoAddr).getExtensionAddress(
                    DaoHelper.COLLECTIVE_INVESTMENT_POOL_EXT
                )
            );
            vars.nftEnable = vars.colVestingInfo.nftEnable;
            vars.escrow = vars.colEsInfo.escrow;
            vars.tokenAddress = vars.cfundingInfo.token;

            vars.myInvestmentAmount =
                (vars.cFundingPoolExt.getPriorAmount(
                    msg.sender,
                    vars.cfundingInfo.token,
                    vars.executeBlockNum - 1
                ) * vars.fundingAmount) /
                vars.cFundingPoolExt.getPriorAmount(
                    address(DaoHelper.DAOSQUARE_TREASURY),
                    vars.cfundingInfo.token,
                    vars.executeBlockNum - 1
                );
        } else {}

        if (
            vars.myInvestmentAmount <= 0 ||
            !(vars.nftEnable && vars.escrow == false)
        ) revert UN_MINTABLE();

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _safeMint(msg.sender, newItemId);
        mintedAccounts[investmentProposalId][msg.sender] = true;
        // investmentIdToTokenId[investmentProposalId][msg.sender] = newItemId;
        proposalId_tokenIds[investmentProposalId][msg.sender].add(newItemId);
        tokenIdToInvestmentProposalId[newItemId] = investmentProposalId;
        // holderToTokenId[msg.sender] = newItemId;
        maxTotalSupply += 1;
        string memory investmentProposalLink = string(
            abi.encodePacked(
                "https://graph.phoenix.fi/venturedaos/",
                mode == 0 ? "flex" : (mode == 1 ? "vintage" : "collective"),
                "/",
                Strings.toHexString(uint256(uint160(daoAddr)), 20),
                "/proposals/",
                string(
                    abi.encodePacked(
                        "0x",
                        LibTokenUri.toHex16(bytes16(investmentProposalId)),
                        LibTokenUri.toHex16(
                            bytes16(investmentProposalId << 128)
                        )
                    )
                ),
                "/investment"
            )
        );
        tokenIdToInvestmentProposalInfo[newItemId] = InvestmentReceiptInfo(
            daoAddr,
            investmentProposalId,
            vars.executeBlockNum,
            executedTxHash,
            vars.fundingAmount,
            vars.myInvestmentAmount,
            ERC20Info(
                vars.tokenAddress,
                ERC20(vars.tokenAddress).symbol(),
                ERC20(vars.tokenAddress).name()
            ),
            projectName,
            description,
            investmentProposalLink
        );
        emit Minted(investmentProposalId, msg.sender, newItemId);

        return newItemId;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        InvestmentReceiptInfo memory info = tokenIdToInvestmentProposalInfo[
            tokenId
        ];
        return
            InvestmentReceiptERC721Helper(receiptERC721HelperContrAddress)
                .getTokenURI(
                    info.executedTxHash,
                    info.projectName,
                    info.erc20.tokenSymbol,
                    info.investmentProposalLink,
                    info.totalInvestedAmount,
                    info.myInvestedAmount,
                    info.description
                );
    }

    function transferFrom(
        address from,
        address to,
        uint256 id
    ) public override(ERC721) {
        // holderToTokenId[from] = 0;
        // holderToTokenId[to] = id;

        bytes32 investmentProposalId = tokenIdToInvestmentProposalId[id];
        // investmentIdToTokenId[investmentProposalId][from] = 0;
        // investmentIdToTokenId[investmentProposalId][to] = id;

        if (!proposalId_tokenIds[investmentProposalId][to].contains(id))
            proposalId_tokenIds[investmentProposalId][to].add(id);

        if (proposalId_tokenIds[investmentProposalId][from].contains(id))
            proposalId_tokenIds[investmentProposalId][from].remove(id);

        ERC721.transferFrom(from, to, id);
    }

    function contractURI() public pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name": "DAOSquare Investment Receipt","description":"',
                                collectionDescription,
                                '","image":"https://i.ibb.co/JxNcmf4/Collection-Logo.png","external_link":"https://daosquare.fi"}'
                            )
                        )
                    )
                )
            );
    }

    /*///////////////////////////////////////////////////////////////
                        Setter functions
    //////////////////////////////////////////////////////////////*/

    function totalSupply() external view returns (uint256) {
        return maxTotalSupply;
    }

    function getTokenIds(
        bytes32 investmentProposalId,
        address account
    ) external view returns (uint256[] memory) {
        return proposalId_tokenIds[investmentProposalId][account].values();
    }
}
