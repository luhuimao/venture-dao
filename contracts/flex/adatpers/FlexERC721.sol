// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@rari-capital/solmate/src/tokens/ERC721.sol";
import "../../helpers/DaoHelper.sol";
import "./FlexAllocation.sol";

contract FlexERC721 is ERC721("Flex Vesting", "FLEXVEST") {
    uint256 public tokenId = 1;
    address public tokenURIFetcher;
    address public owner;
    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function mint(DaoRegistry dao, bytes32 proposalId) external returns (bool) {
        FlexAllocationAdapterContract flexAlloc = FlexAllocationAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_ALLOCATION_ADAPT)
        );

        require(
            flexAlloc.ifEligible(dao, proposalId, msg.sender),
            "not eligible"
        );
        require(
            !flexAlloc.isNFTMinted(dao, proposalId, msg.sender),
            "already minted"
        );
        _mint(msg.sender, tokenId);
        tokenId += 1;

        flexAlloc.nftMinted(dao, proposalId, msg.sender);
        return true;
    }

    function setTokenURIFetcher(address _fetcher) external onlyOwner {
        tokenURIFetcher = _fetcher;
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        // return ITokenURIFetcher(tokenURIFetcher).fetchTokenURIData(id);
    }

    function getTokenAmountByTokenId(
        DaoRegistry dao,
        bytes32 proposalId,
        uint256 _tokenId
    ) external view returns (uint256) {
        FlexAllocationAdapterContract flexAlloc = FlexAllocationAdapterContract(
            dao.getAdapterAddress(DaoHelper.FLEX_ALLOCATION_ADAPT)
        );
        address tokenowner = ownerOf(_tokenId);
        uint256 tokenAmount;
        (tokenAmount, ) = flexAlloc.vestingInfos(
            address(dao),
            proposalId,
            tokenowner
        );
        return tokenAmount;
    }
}
