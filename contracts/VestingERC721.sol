// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@rari-capital/solmate/src/tokens/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./flex/libraries/LibTokenUri.sol";
import "./flex/adatpers/FlexVesting.sol";
import "./vintage/adapters/VintageVesting.sol";
import "./collective/adapters/CollectiveVestingAdapter.sol";
import "./flex/adatpers/interfaces/IFlexVesting.sol";
import "./vintage/adapters/interfaces/IVesting.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./helpers/VestingERC721Helper.sol";
import "hardhat/console.sol";

contract VestingERC721 is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // string public baseURI = "https://daosquare.fi";
    address public _owner;
    address public flexVestContrAddress;
    address public vintageVestContrAddress;
    address public collectiveVestContrAddress;
    address public vestingNFTHelper;
    /// @dev Global max total supply of NFTs.
    uint256 public maxTotalSupply;

    // string constant collectionDescription =
    //     "The NFTs in DAOSquare Investment Vesting Collection are generated from investments made by Venture DAOs in DAOSquare Incubator, which have used the Escrow function and activated the NFT function. Each NFT represents the right to claim Payback Tokens for an investment made by an investor. These tokens have been escrowed to the Escrow smart contract and will be automatically released to the NFT holder through the Vesting module of DAOSquare Incubator according to the Vesting Schedule in the smart contract. You can view the dynamic data (image) and properties information of each NFT to check whether the NFT is currently valid and the specific rights information. NFTs in this collection are transferable. NFT holders can use these NFTs to claim Payback Tokens through the DAOSquare Incubators Vesting module, regardless of who the original investor is.";

    constructor(
        string memory name,
        string memory symbol,
        address _flexvestAddr,
        address _vintageVestAddr,
        address _collectiveVestAddr,
        address _vestingNFTHelper
    ) ERC721(name, symbol) {
        _owner = msg.sender;
        flexVestContrAddress = _flexvestAddr;
        vintageVestContrAddress = _vintageVestAddr;
        collectiveVestContrAddress = _collectiveVestAddr;
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
        address vestAddr;
        uint8 vestContrFlag;
        if (
            FlexVesting(flexVestContrAddress).tokenIdToVestId(
                address(this),
                _tokenId
            ) > 0
        ) {
            vestAddr = flexVestContrAddress;
            vestContrFlag = 1;
        } else if (
            VintageVesting(vintageVestContrAddress).tokenIdToVestId(
                address(this),
                _tokenId
            ) > 0
        ) {
            vestAddr = vintageVestContrAddress;
            vestContrFlag = 2;
        } else if (
            CollectiveVestingAdapterContract(collectiveVestContrAddress).tokenIdToVestId(
                address(this),
                _tokenId
            ) > 0
        ) {
            vestAddr = collectiveVestContrAddress;
            vestContrFlag = 3;
        } else {}
        return
            VestingERC721Helper(vestingNFTHelper).getTokenURI(
                _tokenId,
                vestContrFlag,
                vestAddr,
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
        address vestAddr;
        uint8 vestContrFlag;

        if (
            FlexVesting(flexVestContrAddress).tokenIdToVestId(
                address(this),
                tokenId
            ) > 0
        ) {
            vestAddr = flexVestContrAddress;
            vestContrFlag = 1;
        } else if (
            VintageVesting(vintageVestContrAddress).tokenIdToVestId(
                address(this),
                tokenId
            ) > 0
        ) {
            vestAddr = vintageVestContrAddress;
            vestContrFlag = 2;
        } else if (
            CollectiveVestingAdapterContract(collectiveVestContrAddress).tokenIdToVestId(
                address(this),
                tokenId
            ) > 0
        ) {
            vestAddr = collectiveVestContrAddress;
            vestContrFlag = 3;
        } else {}
        return
            VestingERC721Helper(vestingNFTHelper).getSvg(
                tokenId,
                vestContrFlag,
                address(this),
                vestAddr
            );
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

    function totalSupply() external view returns (uint256) {
        return maxTotalSupply;
    }
}
