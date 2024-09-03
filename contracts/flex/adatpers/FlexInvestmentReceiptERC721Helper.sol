// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "./FlexFunding.sol";
import "./interfaces/IFlexFunding.sol";
import "../../helpers/DaoHelper.sol";
import "../libraries/LibTokenUri.sol";
import "./FlexInvestmentReceiptERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FlexInvestmentReceiptERC721Helper {
    string public constant collectionDescription =
        unicode"The NFTs in the DAOSquare Investment Receipt Collection are generated from investments made by Venture DAOs in the DAOSquare Incubator, which activated the NFT function WITHOUT using the Escrow Function. Each NFT represents an investor’s investment record of investing in a Project through a DAO in DAOSquare Incubator, like a receipt. You can view the dynamic data (image) and properties information of each NFT to check whether the NFT is currently valid and the investment records. The Project or DAO may promise to give benefits to NFT holders, regardless of the original investor.  NFTs in this collection are transferable.  The fulfillment of any promise based on the NFT depends on the promiser (Project or DAO), which the NFT itself cannot guarantee technically.";

    function getSvg(
        uint256 tokenId,
        address receiptNFTContrAddress
    ) external view returns (string memory) {
        (
            ,
            ,
            ,
            string memory executedTxHash,
            uint256 totalInvestedAmount,
            uint256 myInvestedAmount,
            FlexInvestmentReceiptERC721.ERC20Info memory erc20,
            string memory projectName,
            ,

        ) = FlexInvestmentReceiptERC721(receiptNFTContrAddress)
                .tokenIdToInvestmentProposalInfo(tokenId);

        return
            LibTokenUri.receiptSVG(
                executedTxHash,
                projectName,
                erc20.tokenSymbol,
                totalInvestedAmount,
                myInvestedAmount
            );
    }

    function getTokenURI(
        string memory executedTxHash,
        string memory projectName,
        string memory tokenSymbol,
        string memory investmentProposalLink,
        uint256 totalInvestedAmount,
        uint256 myInvestedAmount,
        string memory _collectionDescription
    ) external pure returns (string memory) {
        return
            LibTokenUri.receiptTokenURI(
                executedTxHash,
                projectName,
                tokenSymbol,
                totalInvestedAmount,
                myInvestedAmount,
                _collectionDescription,
                investmentProposalLink
            );
    }
}
