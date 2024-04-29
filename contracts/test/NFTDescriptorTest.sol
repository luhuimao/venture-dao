// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import "../libraries/NFTDescriptor.sol";
import "../libraries/NFTSVG.sol";
import "../libraries/HexStrings.sol";
import "../libraries/VestingNFTSVG.sol";
import "../libraries/VestingReceiptNFTSVG.sol";

contract NFTDescriptorTest {
    using HexStrings for uint256;

    // function pencentageString(
    //     uint256 a,
    //     uint256 b
    // ) public pure returns (string memory pencentage) {
    //     pencentage = VestingReceiptNFTSVG.pencentageString(a, b);
    // }

    function generateReceiptCollectionAttributes(
        string memory projectName,
        string memory tokenName,
        string memory txHash,
        uint256 myInvestedAmount,
        uint256 totalInvestedAmount
    ) public view returns (string memory attrs) {
        attrs = NFTDescriptor.generateReceiptCollectionAttributes(
            projectName,
            tokenName,
            txHash,
            myInvestedAmount,
            totalInvestedAmount
        );
    }

    function generateReceiptSVG(
        string memory txHash,
        string memory projectName,
        string memory symbol,
        uint256 totalInvestedAmount,
        uint256 myInvestedAmount
    ) public view returns (string memory svg) {
        svg = VestingReceiptNFTSVG.generateSVG(
            txHash,
            projectName,
            symbol,
            totalInvestedAmount,
            myInvestedAmount
        );
    }

    // function substring(
    //     string memory str
    // ) public pure returns (string memory _str) {
    //     _str = VestingReceiptNFTSVG.substring(str, 0, 10);
    // }

    // function getInvestmentSVG(
    //     string memory txHash,
    //     string memory projectName,
    //     string memory symbol,
    //     uint256 totalInvestedAmount,
    //     uint256 myInvestedAmount
    // ) public view returns (string memory svg) {
    //     svg = VestingReceiptNFTSVG.generateSVG(
    //         txHash,
    //         projectName,
    //         symbol,
    //         totalInvestedAmount,
    //         myInvestedAmount
    //     );
    // }

    // function generateSVG(
    //     string memory tokenName,
    //     address tokenAddr,
    //     uint256[5] memory uint256Params
    // ) public view returns (string memory svg) {
    //     return VestingNFTSVG.generateSVG(tokenName, tokenAddr, uint256Params);
    //     // return VestingNFTSVG.generateSVG();
    // }

    // function constructTokenURI(NFTDescriptor.ConstructTokenURIParams calldata params)
    //     public
    //     pure
    //     returns (string memory)
    // {
    //     return NFTDescriptor.constructTokenURI(params);
    // }

    // function getGasCostOfConstructTokenURI(NFTDescriptor.ConstructTokenURIParams calldata params)
    //     public
    //     view
    //     returns (uint256)
    // {
    //     uint256 gasBefore = gasleft();
    //     NFTDescriptor.constructTokenURI(params);
    //     return gasBefore - gasleft();
    // }

    // function tickToDecimalString(
    //     int24 tick,
    //     int24 tickSpacing,
    //     uint8 token0Decimals,
    //     uint8 token1Decimals,
    //     bool flipRatio
    // ) public pure returns (string memory) {
    //     return NFTDescriptor.tickToDecimalString(tick, tickSpacing, token0Decimals, token1Decimals, flipRatio);
    // }

    // function fixedPointToDecimalString(
    //     uint160 sqrtRatioX96,
    //     uint8 token0Decimals,
    //     uint8 token1Decimals
    // ) public pure returns (string memory) {
    //     return NFTDescriptor.fixedPointToDecimalString(sqrtRatioX96, token0Decimals, token1Decimals);
    // }

    // function feeToPercentString(
    //     uint24 fee
    // ) public pure returns (string memory) {
    //     return NFTDescriptor.feeToPercentString(fee);
    // }

    // function integerToString(
    //     uint256 amount
    // ) public pure returns (string memory) {
    //     return NFTDescriptor.integerToString(amount);
    // }

    // function addressToString(address _address) public pure returns (string memory) {
    //     return NFTDescriptor.addressToString(_address);
    // }

    // function generateSVGImage(NFTDescriptor.ConstructTokenURIParams memory params) public pure returns (string memory) {
    //     return NFTDescriptor.generateSVGImage(params);
    // }

    // function tokenToColorHex(address token, uint256 offset) public pure returns (string memory) {
    //     return NFTDescriptor.tokenToColorHex(uint256(token), offset);
    // }

    // function sliceTokenHex(address token, uint256 offset) public pure returns (uint256) {
    //     return NFTDescriptor.sliceTokenHex(uint256(token), offset);
    // }

    // function rangeLocation(
    //     int24 tickLower,
    //     int24 tickUpper
    // ) public pure returns (string memory, string memory) {
    //     return NFTSVG.rangeLocation(tickLower, tickUpper);
    // }

    // function isRare(
    //     uint256 tokenId,
    //     address poolAddress
    // ) public pure returns (bool) {
    //     return NFTSVG.isRare(tokenId, poolAddress);
    // }
}
