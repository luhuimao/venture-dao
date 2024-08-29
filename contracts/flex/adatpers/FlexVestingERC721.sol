// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@rari-capital/solmate/src/tokens/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../libraries/LibTokenUri.sol";
import "./FlexVesting.sol";
import "./interfaces/IFlexVesting.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./FlexVestingERC721Helper.sol";
import "hardhat/console.sol";

// import {Base64} from "../libraries/LibBase64.sol";

contract FlexVestingERC721 is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // event MetadataUpdate(uint256 _tokenId);
    // event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId);
    // string public baseURI = "https://daosquare.fi";
    address public _owner;
    address public vestAddress;
    address public vestingNFTHelper;
    /// @dev Global max total supply of NFTs.
    uint256 public maxTotalSupply;

    // string constant collectionDescription =
    //     "The NFTs in DAOSquare Investment Vesting Collection are generated from investments made by Venture DAOs in DAOSquare Incubator, which have used the Escrow function and activated the NFT function. Each NFT represents the right to claim Payback Tokens for an investment made by an investor. These tokens have been escrowed to the Escrow smart contract and will be automatically released to the NFT holder through the Vesting module of DAOSquare Incubator according to the Vesting Schedule in the smart contract. You can view the dynamic data (image) and properties information of each NFT to check whether the NFT is currently valid and the specific rights information. NFTs in this collection are transferable. NFT holders can use these NFTs to claim Payback Tokens through the DAOSquare Incubators Vesting module, regardless of who the original investor is.";

    /// @dev Emitted when the global max supply of tokens is updated.
    // event MaxTotalSupplyUpdated(uint256 maxTotalSupply);

    constructor(
        string memory name,
        string memory symbol,
        address _vestAddr,
        address _vestingNFTHelper
    ) ERC721(name, symbol) {
        _owner = msg.sender;
        vestAddress = _vestAddr;
        vestingNFTHelper = _vestingNFTHelper;
    }

    function safeMint(address to) external returns (uint256 id) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _safeMint(to, newItemId);
        maxTotalSupply += 1;
        return newItemId;
    }

    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        // require(vestAddress != address(0x0), "invalid vest address");
        // FlexVesting vest = FlexVesting(vestAddress);
        // uint256 vestId = vest.getVestIdByTokenId(address(this), _tokenId);
        // (
        //     address daoAddr,
        //     bytes32 proposalId,
        //     ,
        //     ,
        //     ,
        //     IFlexVesting.TimeInfo memory timeInfo,
        //     ,
        //     IFlexVesting.VestInfo memory vestInfo
        // ) = vest.vests(vestId);

        // (, uint256 remaining_, uint256 total_) = vest.getRemainingPercentage(
        //     address(this),
        //     _tokenId
        // );

        // string memory proposalLink = string(
        //     abi.encodePacked(
        //         "https://graph.phoenix.fi/venturedaos/flex/",
        //         Strings.toHexString(uint256(uint160(daoAddr)), 20),
        //         "/proposals/",
        //         string(
        //             abi.encodePacked(
        //                 "0x",
        //                 LibTokenUri.toHex16(bytes16(proposalId)),
        //                 LibTokenUri.toHex16(bytes16(proposalId << 128))
        //             )
        //         ),
        //         "/investment"
        //     )
        // );

        // return
        //     LibTokenUri.tokenURI(
        //         vestInfo.description,
        //         ERC20(vestInfo.token).symbol(),
        //         proposalLink,
        //         vestInfo.token,
        //         [
        //             timeInfo.stepDuration,
        //             remaining_ * 10 ** 18,
        //             total_ * 10 ** 18,
        //             timeInfo.start + timeInfo.cliffDuration,
        //             timeInfo.end
        //         ]
        //     );

        return
            FlexVestingERC721Helper(vestingNFTHelper).getTokenURI(
                _tokenId,
                vestAddress,
                address(this)
            );
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overridden in child contracts.
     */
    // function _baseURI() internal view virtual returns (string memory) {
    //     return baseURI;
    // }

    function getSvg(uint256 tokenId) external view returns (string memory) {
        return
            FlexVestingERC721Helper(vestingNFTHelper).getSvg(
                tokenId,
                address(this),
                vestAddress
            );
    }

    // function emitRefreshEvent() external {
    //     // emit MetadataUpdate(tokenId);
    //     emit BatchMetadataUpdate(1, type(uint256).max);
    // }

    function contractURI() public pure returns (string memory) {
        string
            memory json = unicode'{"name": "DAOSquare Investment Vesting","description":"The NFTs in DAOSquare Investment Vesting Collection are generated from investments made by Venture DAOs in DAOSquare Incubator, which have used the Escrow function and activated the NFT function. Each NFT represents the right to claim Payback Tokens for an investment made by an investor. These tokens have been escrowed to the Escrow smart contract and will be automatically released to the NFT holder through the Vesting module of DAOSquare Incubator according to the Vesting Schedule in the smart contract. You can view the dynamic data (image) and properties information of each NFT to check whether the NFT is currently valid and the specific rights information. NFTs in this collection are transferable. NFT holders can use these NFTs to claim Payback Tokens through the DAOSquare Incubators Vesting module, regardless of who the original investor is.","image":"https://i.ibb.co/JxNcmf4/Collection-Logo.png","external_link":"https://daosquare.fi"}';

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(bytes(json))
                )
            );
    }

    /*///////////////////////////////////////////////////////////////
                        Setter functions
    //////////////////////////////////////////////////////////////*/

    /// @dev Lets a contract admin set the global maximum supply for collection's NFTs.
    // function setMaxTotalSupply(uint256 _maxTotalSupply) internal {
    //     maxTotalSupply = _maxTotalSupply;
    //     emit MaxTotalSupplyUpdated(_maxTotalSupply);
    // }

    function totalSupply() external view returns (uint256) {
        return maxTotalSupply;
    }
}
