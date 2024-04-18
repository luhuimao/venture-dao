// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@rari-capital/solmate/src/tokens/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./VintageVesting.sol";
import "./interfaces/IVesting.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../../flex/libraries/LibTokenUri.sol";
import "hardhat/console.sol";

contract VintageVestingERC721 is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event MetadataUpdate(uint256 _tokenId);
    event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId);
    // string public baseURI = "https://daosquare.fi";
    address public _owner;
    address public vestAddress;
    string constant collectionDescription =
        "The NFTs in DAOSquare Investment Vesting Collection are generated from investments made by Venture DAOs in DAOSquare Incubator, which have used the Escrow function and activated the NFT function. Each NFT represents the right to claim Payback Tokens for an investment made by an investor. These tokens have been escrowed to the Escrow smart contract and will be automatically released to the NFT holder through the Vesting module of DAOSquare Incubator according to the Vesting Schedule in the smart contract. You can view the dynamic data (image) and properties information of each NFT to check whether the NFT is currently valid and the specific rights information. NFTs in this collection are transferable. NFT holders can use these NFTs to claim Payback Tokens through the DAOSquare Incubators Vesting module, regardless of who the original investor is.";
    uint256 public maxTotalSupply;

    /// @dev Emitted when the global max supply of tokens is updated.
    event MaxTotalSupplyUpdated(uint256 maxTotalSupply);

    constructor(
        string memory name,
        string memory symbol,
        address _vestAddr
    ) ERC721(name, symbol) {
        _owner = msg.sender;
        vestAddress = _vestAddr;
    }

    function safeMint(address to) external returns (uint256 id) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _safeMint(to, newItemId);
        setMaxTotalSupply(maxTotalSupply + 1);
        return newItemId;
    }

    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        require(vestAddress != address(0x0), "invalid vest address");
        VintageVesting vest = VintageVesting(vestAddress);
        uint256 vestId = vest.getVestIdByTokenId(address(this), _tokenId);
        (
            ,
            ,
            ,
            ,
            IVesting.TimeInfo memory timeInfo,
            ,
            IVesting.VestInfo memory vestInfo
        ) = vest.vests(vestId);

        (, uint256 remaining_, uint256 total_) = vest.getRemainingPercentage(
            address(this),
            _tokenId
        );

        return
            LibTokenUri.tokenURI(
                vestInfo.description,
                ERC20(vestInfo.token).symbol(),
                vestInfo.token,
                [
                    timeInfo.stepDuration,
                    remaining_,
                    total_,
                    timeInfo.start + timeInfo.cliffDuration,
                    timeInfo.end
                ]
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

    // function setBaseURI(string memory uri) external {
    //     require(msg.sender == _owner, "access deny");
    //     baseURI = uri;
    // }

    function setVestAddress(address _vestAddress) external {
        require(msg.sender == _owner, "access deny");
        vestAddress = _vestAddress;
    }

    function getSvg(uint256 tokenId) external view returns (string memory) {
        VintageVesting vest = VintageVesting(vestAddress);
        uint256 vestId = vest.getVestIdByTokenId(address(this), tokenId);
        (
            ,
            ,
            ,
            ,
            IVesting.TimeInfo memory timeInfo,
            ,
            IVesting.VestInfo memory vestInfo
        ) = vest.vests(vestId);

        (, uint256 remaining_, uint256 total_) = vest.getRemainingPercentage(
            address(this),
            tokenId
        );

        return
            LibTokenUri.svg(
                ERC20(vestInfo.token).symbol(),
                vestInfo.token,
                [
                    remaining_,
                    total_,
                    timeInfo.stepDuration,
                    timeInfo.start + timeInfo.cliffDuration,
                    timeInfo.end
                ] // uint256[0] remaining_,uint256[1] total_,uint256[2] interval, uint256[3] cliffEndTime,uint256[4] endTime
            );
    }

    function emitRefreshEvent(uint256 tokenId) external {
        emit MetadataUpdate(tokenId);
        emit BatchMetadataUpdate(1, type(uint256).max);
    }

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
    function setMaxTotalSupply(uint256 _maxTotalSupply) internal {
        maxTotalSupply = _maxTotalSupply;
        emit MaxTotalSupplyUpdated(_maxTotalSupply);
    }

    function totalSupply() external view returns (uint256) {
        return maxTotalSupply;
    }
}
