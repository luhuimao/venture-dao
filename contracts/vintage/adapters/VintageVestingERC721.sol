// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@rari-capital/solmate/src/tokens/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../libraries/LibTokenUri.sol";
import "./VintageVesting.sol";
import "./interfaces/IVesting.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "../libraries/LibBase64.sol";

contract VintageVestingERC721 is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event MetadataUpdate(uint256 _tokenId);
    event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId);
    string public baseURI = "https://daosquare.fi";
    address public _owner;
    address public vestAddress;

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
        return newItemId;
    }

    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        require(vestAddress != address(0x0), "invalid vest address");
        VintageVesting vest = VintageVesting(vestAddress);
        uint256 vestId = vest.getVestIdByTokenId(address(this), _tokenId);
        (, , , , , , IVesting.VestInfo memory vestInfo) = vest.vests(vestId);

        (uint256 percent_, uint256 remaining_, uint256 total_) = vest
            .getRemainingPercentage(address(this), _tokenId);

        return
            LibTokenUri.tokenURI(
                vestInfo.description,
                ERC20(vestInfo.token).symbol(),
                percent_,
                remaining_,
                total_
            );
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overridden in child contracts.
     */
    function _baseURI() internal view virtual returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory uri) external {
        require(msg.sender == _owner, "access deny");
        baseURI = uri;
    }

    function setVestAddress(address _vestAddress) external {
        require(msg.sender == _owner, "access deny");
        vestAddress = _vestAddress;
    }

    function getSvg(uint256 tokenId) external view returns (string memory) {
        VintageVesting vest = VintageVesting(vestAddress);
        uint256 vestId = vest.getVestIdByTokenId(address(this), tokenId);
        (, , , , , , IVesting.VestInfo memory vestInfo) = vest.vests(vestId);

        (uint256 percent_, uint256 remaining_, uint256 total_) = vest
            .getRemainingPercentage(address(this), tokenId);
        return
            LibTokenUri.svg(
                ERC20(vestInfo.token).symbol(),
                percent_,
                remaining_,
                total_
            );
    }

    function emitRefreshEvent(uint256 tokenId) external {
        emit MetadataUpdate(tokenId);
        emit BatchMetadataUpdate(1, type(uint256).max);
    }

    function contractURI() public pure returns (string memory) {
        string
            memory json = unicode'{"name": "DAOSquare Manual Vesting","description":"DAOSquare Manual Vesting Collection 是一个为所有在 DAOSquare Vesting APP 上手动创建的 Vesting 项目共用的 NFT Collection。每一个手动创建的Vesting 项目分享 NFT Collection 中的一定 Token ID 区间。由于每一个 手动 Vesting 项目的图片、名称、介绍不同，因此你可以在这个 Collection 中方便地识别它们。如果你拥有任何一张期中的 NFT,你可以访问 DAOSquare Incubator 查看并领取 Token。","image":"ipfs://bafybeihbspwd7hqmkabq5xpjnaaqql7midp24wlmsqf3gt7i4lbalbjs7m","external_link":"https://daosquare.fi"}';

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(bytes(json))
                )
            );
    }
}
