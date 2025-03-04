// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@rari-capital/solmate/src/tokens/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../flex/libraries/LibTokenUri.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./VintageFundingAdapter.sol";
import "./interfaces/IVintageFunding.sol";
import "../extensions/fundingpool/VintageFundingPool.sol";
import "../../helpers/DaoHelper.sol";
import "./VintageInvestmentReceiptERC721Helper.sol";
import "../libraries/fundingLibrary.sol";
// import "./FlexFreeInEscrowFund.sol";
import "hardhat/console.sol";

contract VintageInvestmentReceiptERC721 is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address public _owner;
    address public investmentContrAddress;
    address public ercHelperContrAddress;
    /// @dev Global max total supply of NFTs.
    uint256 public maxTotalSupply;
    string constant collectionDescription =
        unicode"The NFTs in the DAOSquare Investment Receipt Collection are generated from investments made by Venture DAOs in the DAOSquare Incubator, which activated the NFT function WITHOUT using the Escrow Function. Each NFT represents an investor’s investment record of investing in a Project through a DAO in DAOSquare Incubator, like a receipt. You can view the dynamic data (image) and properties information of each NFT to check whether the NFT is currently valid and the investment records. The Project or DAO may promise to give benefits to NFT holders, regardless of the original investor.  NFTs in this collection are transferable.  The fulfillment of any promise based on the NFT depends on the promiser (Project or DAO), which the NFT itself cannot guarantee technically.";

    /// @dev Emitted when the global max supply of tokens is updated.
    mapping(bytes32 => mapping(address => uint256))
        public investmentIdToTokenId;
    mapping(uint256 => InvestmentReceiptInfo)
        public tokenIdToInvestmentProposalInfo;

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
        string proposalLink;
    }

    struct ERC20Info {
        address tokenAddress;
        string tokenSymbol;
        string tokenName;
    }

    constructor(
        string memory name,
        string memory symbol,
        address _investmentContrAddress,
        address _ercHelperContrAddress
    ) ERC721(name, symbol) {
        _owner = msg.sender;
        investmentContrAddress = _investmentContrAddress;
        ercHelperContrAddress = _ercHelperContrAddress;
    }

    function safeMint(
        address daoAddr,
        bytes32 investmentProposalId,
        string memory executedTxHash,
        string memory projectName,
        string memory description
    ) external returns (uint256 id) {
        require(
            investmentIdToTokenId[investmentProposalId][msg.sender] == 0,
            "alreday minted"
        );

        (
            address investmentToken,
            uint256 investmentAmount,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            uint256 executeBlockNum
        ) = VintageFundingAdapterContract(investmentContrAddress).proposals(
                daoAddr,
                investmentProposalId
            );

        VintageFundingPoolExtension fundingPoolExt = VintageFundingPoolExtension(
                DaoRegistry(daoAddr).getExtensionAddress(
                    DaoHelper.VINTAGE_INVESTMENT_POOL_EXT
                )
            );
        uint256 myInvestmentAmount = (fundingPoolExt.getPriorAmount(
            msg.sender,
            investmentToken,
            executeBlockNum - 1
        ) * investmentAmount) /
            fundingPoolExt.getPriorAmount(
                address(DaoHelper.DAOSQUARE_TREASURY),
                investmentToken,
                executeBlockNum - 1
            );

        require(myInvestmentAmount > 0, "unmintable");

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _safeMint(msg.sender, newItemId);
        investmentIdToTokenId[investmentProposalId][msg.sender] = newItemId;
        maxTotalSupply += 1;

        string memory investmentProposalLink = string(
            abi.encodePacked(
                "https://graph.phoenix.fi/venturedaos/vintage/",
                Strings.toHexString(uint256(uint160(daoAddr)), 20),
                "/proposals/",
                string(
                    abi.encodePacked(
                        "0x",
                        toHex16(bytes16(investmentProposalId)),
                        toHex16(bytes16(investmentProposalId << 128))
                    )
                ),
                "/investment"
            )
        );
        // console.log(Strings.toHexString(uint256(uint160(daoAddr)), 20));
        // console.log(investmentProposalId);
        tokenIdToInvestmentProposalInfo[newItemId] = InvestmentReceiptInfo(
            daoAddr,
            investmentProposalId,
            executeBlockNum,
            executedTxHash,
            investmentAmount,
            myInvestmentAmount,
            ERC20Info(
                investmentToken,
                ERC20(investmentToken).symbol(),
                ERC20(investmentToken).name()
            ),
            projectName,
            description,
            investmentProposalLink
        );
        return newItemId;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        InvestmentReceiptInfo memory info = tokenIdToInvestmentProposalInfo[
            tokenId
        ];

        return
            VintageInvestmentReceiptERC721Helper(ercHelperContrAddress)
                .getTokenURI(
                    info.executedTxHash,
                    info.projectName,
                    info.erc20.tokenSymbol,
                    info.proposalLink,
                    ERC20(info.erc20.tokenAddress).decimals(),
                    info.totalInvestedAmount,
                    info.myInvestedAmount,
                    info.description
                );
    }

    function toHex16(bytes16 data) internal pure returns (bytes32 result) {
        result =
            (bytes32(data) &
                0xFFFFFFFFFFFFFFFF000000000000000000000000000000000000000000000000) |
            ((bytes32(data) &
                0x0000000000000000FFFFFFFFFFFFFFFF00000000000000000000000000000000) >>
                64);
        result =
            (result &
                0xFFFFFFFF000000000000000000000000FFFFFFFF000000000000000000000000) |
            ((result &
                0x00000000FFFFFFFF000000000000000000000000FFFFFFFF0000000000000000) >>
                32);
        result =
            (result &
                0xFFFF000000000000FFFF000000000000FFFF000000000000FFFF000000000000) |
            ((result &
                0x0000FFFF000000000000FFFF000000000000FFFF000000000000FFFF00000000) >>
                16);
        result =
            (result &
                0xFF000000FF000000FF000000FF000000FF000000FF000000FF000000FF000000) |
            ((result &
                0x00FF000000FF000000FF000000FF000000FF000000FF000000FF000000FF0000) >>
                8);
        result =
            ((result &
                0xF000F000F000F000F000F000F000F000F000F000F000F000F000F000F000F000) >>
                4) |
            ((result &
                0x0F000F000F000F000F000F000F000F000F000F000F000F000F000F000F000F00) >>
                8);
        result = bytes32(
            0x3030303030303030303030303030303030303030303030303030303030303030 +
                uint256(result) +
                (((uint256(result) +
                    0x0606060606060606060606060606060606060606060606060606060606060606) >>
                    4) &
                    0x0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F) *
                7
        );
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

    function totalSupply() external view returns (uint256) {
        return maxTotalSupply;
    }
}
