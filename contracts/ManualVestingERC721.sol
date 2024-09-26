// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@rari-capital/solmate/src/tokens/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "./libraries/LibTokenUri.sol";
// import "./interfaces/IVesting.sol";
import "./ManualVesting.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./helpers/ManualVestingERC721SVGHelper.sol";
import "./helpers/ManualVestingERC721TokenURIHelper.sol";
import "hardhat/console.sol";

// import "./libraries/LibTokenUri.sol";

contract ManualVestingERC721 is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // string public baseURI = "https://daosquare.fi";
    address public _owner;
    address public vestContrAddress;
    address public vestingERC721TokenURIHelper;
    address public vestingERC721SVGHelper;

    /// @dev Global max total supply of NFTs.
    uint256 public maxTotalSupply;
    error INVALID_TOKEN_ID();

    constructor(
        string memory name,
        string memory symbol,
        address _vestAddr,
        address _vestingERC721TokenURIHelper,
        address _vestingERC721SVGHelper
    ) ERC721(name, symbol) {
        _owner = msg.sender;
        vestContrAddress = _vestAddr;

        vestingERC721TokenURIHelper = _vestingERC721TokenURIHelper;
        vestingERC721SVGHelper = _vestingERC721SVGHelper;
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
        if (
            ManualVesting(vestContrAddress).tokenIdToVestId(
                address(this),
                _tokenId
            ) <= 0
        ) revert INVALID_TOKEN_ID();

        return
            ManualVestingERC721TokenURIHelper(vestingERC721TokenURIHelper)
                .getTokenURI(_tokenId, vestContrAddress, address(this));
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overridden in child contracts.
     */
    // function _baseURI() internal view virtual returns (string memory) {
    //     return baseURI;
    // }

    function getSvg(uint256 tokenId) external view returns (string memory svg) {
        if (
            ManualVesting(vestContrAddress).tokenIdToVestId(
                address(this),
                tokenId
            ) > 0
        ) {
            return
                ManualVestingERC721SVGHelper(vestingERC721SVGHelper).getSvg(
                    tokenId,
                    address(this),
                    vestContrAddress
                );
        }
    }

    function contractURI() public pure returns (string memory) {
        string
            memory json = unicode'{"name": "DAOSquare Vesting Manual","description":"当用户在创建 Vesting 时开启了 NFT 功能, DAOSquare Vesting Manual collection 中的 NFT 是用户通过 DAOSquare Incubator 提供的 Vesting APP 手动创建的 Vesting 产生 。这意味着该 Vesting 的受益人是 NFT 持有人，如果 NFT 被转让，则相关的 Vesting 权益也将被转让。When the user enabled the NFT component when creating the vesting, the NFTs in the DAOSquare Vesting Manual collection are generated manually through the Vesting APP provided by DAOSquare Incubator .The beneficiary of the vesting is the holder of the NFT, which means if the NFT is transferred, the related vesting rights will also be transferred.","image":"","external_link":"https://daosquare.fi"}';

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

    function totalSupply() external view returns (uint256) {
        return maxTotalSupply;
    }
}
