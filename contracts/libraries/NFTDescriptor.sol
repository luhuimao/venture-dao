// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@uniswap/v3-core-optimism/contracts/interfaces/IUniswapV3Pool.sol";
// import '@uniswap/v3-core-optimism/contracts/libraries/TickMath.sol';
import "@uniswap/v3-core-optimism/contracts/libraries/BitMath.sol";
// import '@uniswap/v3-core-optimism/contracts/libraries/FullMath.sol';
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/SignedSafeMath.sol";
import "base64-sol/base64.sol";
import "./HexStrings.sol";
import "./NFTSVG.sol";
import "hardhat/console.sol";

library NFTDescriptor {
    // using TickMath for int24;
    using Strings for uint256;
    using SafeMath for uint256;
    using SafeMath for uint160;
    using SafeMath for uint8;
    using SignedSafeMath for int256;
    using HexStrings for uint256;

    uint256 constant sqrt10X128 = 1076067327063303206878105757264492625226;

    // struct ConstructTokenURIParams {
    //     uint256 tokenId;
    //     address quoteTokenAddress;
    //     address baseTokenAddress;
    //     string quoteTokenSymbol;
    //     string baseTokenSymbol;
    //     uint8 quoteTokenDecimals;
    //     uint8 baseTokenDecimals;
    //     bool flipRatio;
    //     int24 tickLower;
    //     int24 tickUpper;
    //     int24 tickCurrent;
    //     int24 tickSpacing;
    //     uint24 fee;
    //     address poolAddress;
    // }

    // function constructTokenURI(ConstructTokenURIParams memory params) public pure returns (string memory) {
    //     string memory name = generateName(params, feeToPercentString(params.fee));
    //     string memory descriptionPartOne =
    //         generateDescriptionPartOne(
    //             escapeQuotes(params.quoteTokenSymbol),
    //             escapeQuotes(params.baseTokenSymbol),
    //             addressToString(params.poolAddress)
    //         );
    //     string memory descriptionPartTwo =
    //         generateDescriptionPartTwo(
    //             params.tokenId.toString(),
    //             escapeQuotes(params.baseTokenSymbol),
    //             addressToString(params.quoteTokenAddress),
    //             addressToString(params.baseTokenAddress),
    //             feeToPercentString(params.fee)
    //         );
    //     string memory image = Base64.encode(bytes(generateSVGImage(params)));

    //     return
    //         string(
    //             abi.encodePacked(
    //                 'data:application/json;base64,',
    //                 Base64.encode(
    //                     bytes(
    //                         abi.encodePacked(
    //                             '{"name":"',
    //                             name,
    //                             '", "description":"',
    //                             descriptionPartOne,
    //                             descriptionPartTwo,
    //                             '", "image": "',
    //                             'data:image/svg+xml;base64,',
    //                             image,
    //                             '"}'
    //                         )
    //                     )
    //                 )
    //             )
    //         );
    // }

    // function escapeQuotes(
    //     string memory symbol
    // ) internal pure returns (string memory) {
    //     bytes memory symbolBytes = bytes(symbol);
    //     uint8 quotesCount = 0;
    //     for (uint8 i = 0; i < symbolBytes.length; i++) {
    //         if (symbolBytes[i] == '"') {
    //             quotesCount++;
    //         }
    //     }
    //     if (quotesCount > 0) {
    //         bytes memory escapedBytes = new bytes(
    //             symbolBytes.length + (quotesCount)
    //         );
    //         uint256 index;
    //         for (uint8 i = 0; i < symbolBytes.length; i++) {
    //             if (symbolBytes[i] == '"') {
    //                 escapedBytes[index++] = "\\";
    //             }
    //             escapedBytes[index++] = symbolBytes[i];
    //         }
    //         return string(escapedBytes);
    //     }
    //     return symbol;
    // }

    // function generateDescriptionPartOne(
    //     string memory quoteTokenSymbol,
    //     string memory baseTokenSymbol,
    //     string memory poolAddress
    // ) private pure returns (string memory) {
    //     return
    //         string(
    //             abi.encodePacked(
    //                 "This NFT represents a liquidity position in a Uniswap V3 ",
    //                 quoteTokenSymbol,
    //                 "-",
    //                 baseTokenSymbol,
    //                 " pool. ",
    //                 "The owner of this NFT can modify or redeem the position.\\n",
    //                 "\\nPool Address: ",
    //                 poolAddress,
    //                 "\\n",
    //                 quoteTokenSymbol
    //             )
    //         );
    // }

    // function generateDescriptionPartTwo(
    //     string memory tokenId,
    //     string memory baseTokenSymbol,
    //     string memory quoteTokenAddress,
    //     string memory baseTokenAddress,
    //     string memory feeTier
    // ) private pure returns (string memory) {
    //     return
    //         string(
    //             abi.encodePacked(
    //                 " Address: ",
    //                 quoteTokenAddress,
    //                 "\\n",
    //                 baseTokenSymbol,
    //                 " Address: ",
    //                 baseTokenAddress,
    //                 "\\nFee Tier: ",
    //                 feeTier,
    //                 "\\nToken ID: ",
    //                 tokenId,
    //                 "\\n\\n",
    //                 unicode"⚠️ DISCLAIMER: Due diligence is imperative when assessing this NFT. Make sure token addresses match the expected tokens, as token symbols may be imitated."
    //             )
    //         );
    // }

    // function generateName(ConstructTokenURIParams memory params, string memory feeTier)
    //     private
    //     pure
    //     returns (string memory)
    // {
    //     return
    //         string(
    //             abi.encodePacked(
    //                 'Uniswap - ',
    //                 feeTier,
    //                 ' - ',
    //                 escapeQuotes(params.quoteTokenSymbol),
    //                 '/',
    //                 escapeQuotes(params.baseTokenSymbol),
    //                 ' - ',
    //                 tickToDecimalString(
    //                     !params.flipRatio ? params.tickLower : params.tickUpper,
    //                     params.tickSpacing,
    //                     params.baseTokenDecimals,
    //                     params.quoteTokenDecimals,
    //                     params.flipRatio
    //                 ),
    //                 '<>',
    //                 tickToDecimalString(
    //                     !params.flipRatio ? params.tickUpper : params.tickLower,
    //                     params.tickSpacing,
    //                     params.baseTokenDecimals,
    //                     params.quoteTokenDecimals,
    //                     params.flipRatio
    //                 )
    //             )
    //         );
    // }

    // struct DecimalStringParams {
    //     // significant figures of decimal
    //     uint256 sigfigs;
    //     // length of decimal string
    //     uint8 bufferLength;
    //     // ending index for significant figures (funtion works backwards when copying sigfigs)
    //     uint8 sigfigIndex;
    //     // index of decimal place (0 if no decimal)
    //     uint8 decimalIndex;
    //     // start index for trailing/leading 0's for very small/large numbers
    //     uint8 zerosStartIndex;
    //     // end index for trailing/leading 0's for very small/large numbers
    //     uint8 zerosEndIndex;
    //     // true if decimal number is less than one
    //     bool isLessThanOne;
    //     // true if string should include "%"
    //     bool isPercent;
    // }

    // function generateDecimalString(
    //     DecimalStringParams memory params
    // ) private pure returns (string memory) {
    //     bytes memory buffer = new bytes(params.bufferLength);
    //     if (params.isPercent) {
    //         buffer[buffer.length - 1] = "%";
    //     }
    //     if (params.isLessThanOne) {
    //         buffer[0] = "0";
    //         buffer[1] = ".";
    //     }

    //     // add leading/trailing 0's
    //     for (
    //         uint256 zerosCursor = params.zerosStartIndex;
    //         zerosCursor < params.zerosEndIndex.add(1);
    //         zerosCursor++
    //     ) {
    //         buffer[zerosCursor] = bytes1(uint8(48));
    //     }
    //     console.log("bufferLength ", params.bufferLength);
    //     console.log("params.sigfigIndex ", params.sigfigIndex);

    //     // add sigfigs
    //     while (params.sigfigs > 0) {
    //         if (
    //             params.decimalIndex > 0 &&
    //             params.sigfigIndex == params.decimalIndex
    //         ) {
    //             buffer[params.sigfigIndex--] = ".";
    //         }
    //         buffer[params.sigfigIndex--] = bytes1(
    //             uint8(uint256(48).add(params.sigfigs % 10))
    //         );
    //         console.log("params.sigfigs ", params.sigfigs);

    //         params.sigfigs /= 10;
    //     }
    //     return string(buffer);
    // }

    // function tickToDecimalString(
    //     int24 tick,
    //     int24 tickSpacing,
    //     uint8 baseTokenDecimals,
    //     uint8 quoteTokenDecimals,
    //     bool flipRatio
    // ) internal pure returns (string memory) {
    //     if (tick == (TickMath.MIN_TICK / tickSpacing) * tickSpacing) {
    //         return !flipRatio ? 'MIN' : 'MAX';
    //     } else if (tick == (TickMath.MAX_TICK / tickSpacing) * tickSpacing) {
    //         return !flipRatio ? 'MAX' : 'MIN';
    //     } else {
    //         uint160 sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick);
    //         if (flipRatio) {
    //             sqrtRatioX96 = uint160(uint256(1 << 192).div(sqrtRatioX96));
    //         }
    //         return fixedPointToDecimalString(sqrtRatioX96, baseTokenDecimals, quoteTokenDecimals);
    //     }
    // }

    // function sigfigsRounded(
    //     uint256 value,
    //     uint8 digits
    // ) private pure returns (uint256, bool) {
    //     bool extraDigit;
    //     if (digits > 5) {
    //         value = value.div((10 ** (digits - 5)));
    //     }
    //     bool roundUp = value % 10 > 4;
    //     value = value.div(10);
    //     if (roundUp) {
    //         value = value + 1;
    //     }
    //     // 99999 -> 100000 gives an extra sigfig
    //     if (value == 100000) {
    //         value /= 10;
    //         extraDigit = true;
    //     }
    //     return (value, extraDigit);
    // }

    // function adjustForDecimalPrecision(
    //     uint160 sqrtRatioX96,
    //     uint8 baseTokenDecimals,
    //     uint8 quoteTokenDecimals
    // ) private pure returns (uint256 adjustedSqrtRatioX96) {
    //     uint256 difference = abs(int256(baseTokenDecimals).sub(int256(quoteTokenDecimals)));
    //     if (difference > 0 && difference <= 18) {
    //         if (baseTokenDecimals > quoteTokenDecimals) {
    //             adjustedSqrtRatioX96 = sqrtRatioX96.mul(10**(difference.div(2)));
    //             if (difference % 2 == 1) {
    //                 adjustedSqrtRatioX96 = FullMath.mulDiv(adjustedSqrtRatioX96, sqrt10X128, 1 << 128);
    //             }
    //         } else {
    //             adjustedSqrtRatioX96 = sqrtRatioX96.div(10**(difference.div(2)));
    //             if (difference % 2 == 1) {
    //                 adjustedSqrtRatioX96 = FullMath.mulDiv(adjustedSqrtRatioX96, 1 << 128, sqrt10X128);
    //             }
    //         }
    //     } else {
    //         adjustedSqrtRatioX96 = uint256(sqrtRatioX96);
    //     }
    // }

    // function abs(int256 x) private pure returns (uint256) {
    //     return uint256(x >= 0 ? x : -x);
    // }

    // @notice Returns string that includes first 5 significant figures of a decimal number
    // @param sqrtRatioX96 a sqrt price
    // function fixedPointToDecimalString(
    //     uint160 sqrtRatioX96,
    //     uint8 baseTokenDecimals,
    //     uint8 quoteTokenDecimals
    // ) internal pure returns (string memory) {
    //     uint256 adjustedSqrtRatioX96 = adjustForDecimalPrecision(sqrtRatioX96, baseTokenDecimals, quoteTokenDecimals);
    //     uint256 value = FullMath.mulDiv(adjustedSqrtRatioX96, adjustedSqrtRatioX96, 1 << 64);

    //     bool priceBelow1 = adjustedSqrtRatioX96 < 2**96;
    //     if (priceBelow1) {
    //         // 10 ** 43 is precision needed to retreive 5 sigfigs of smallest possible price + 1 for rounding
    //         value = FullMath.mulDiv(value, 10**44, 1 << 128);
    //     } else {
    //         // leave precision for 4 decimal places + 1 place for rounding
    //         value = FullMath.mulDiv(value, 10**5, 1 << 128);
    //     }

    //     // get digit count
    //     uint256 temp = value;
    //     uint8 digits;
    //     while (temp != 0) {
    //         digits++;
    //         temp /= 10;
    //     }
    //     // don't count extra digit kept for rounding
    //     digits = digits - 1;

    //     // address rounding
    //     (uint256 sigfigs, bool extraDigit) = sigfigsRounded(value, digits);
    //     if (extraDigit) {
    //         digits++;
    //     }

    //     DecimalStringParams memory params;
    //     if (priceBelow1) {
    //         // 7 bytes ( "0." and 5 sigfigs) + leading 0's bytes
    //         params.bufferLength = uint8(uint8(7).add(uint8(43).sub(digits)));
    //         params.zerosStartIndex = 2;
    //         params.zerosEndIndex = uint8(uint256(43).sub(digits).add(1));
    //         params.sigfigIndex = uint8(params.bufferLength.sub(1));
    //     } else if (digits >= 9) {
    //         // no decimal in price string
    //         params.bufferLength = uint8(digits.sub(4));
    //         params.zerosStartIndex = 5;
    //         params.zerosEndIndex = uint8(params.bufferLength.sub(1));
    //         params.sigfigIndex = 4;
    //     } else {
    //         // 5 sigfigs surround decimal
    //         params.bufferLength = 6;
    //         params.sigfigIndex = 5;
    //         params.decimalIndex = uint8(digits.sub(5).add(1));
    //     }
    //     params.sigfigs = sigfigs;
    //     params.isLessThanOne = priceBelow1;
    //     params.isPercent = false;

    //     return generateDecimalString(params);
    // }

    // @notice Returns string as decimal percentage of fee amount.
    // @param fee fee amount
    // function feeToPercentString(
    //     uint24 fee
    // ) internal pure returns (string memory) {
    //     if (fee == 0) {
    //         return "0%";
    //     }
    //     uint24 temp = fee;
    //     uint256 digits;
    //     uint8 numSigfigs;
    //     while (temp != 0) {
    //         if (numSigfigs > 0) {
    //             // count all digits preceding least significant figure
    //             numSigfigs++;
    //         } else if (temp % 10 != 0) {
    //             numSigfigs++;
    //         }
    //         digits++;
    //         temp /= 10;
    //     }
    //     console.log("digits ", digits);
    //     console.log("numSigfigs ", numSigfigs);

    //     DecimalStringParams memory params;
    //     uint256 nZeros;
    //     if (digits >= 5) {
    //         // if decimal > 1 (5th digit is the ones place)
    //         uint256 decimalPlace = digits.sub(numSigfigs) >= 4 ? 0 : 1;
    //         console.log("decimalPlace ", decimalPlace);
    //         nZeros = digits.sub(5) < (numSigfigs.sub(1))
    //             ? 0
    //             : digits.sub(5).sub(numSigfigs.sub(1));
    //         console.log("nZeros ", nZeros);
    //         params.zerosStartIndex = numSigfigs;
    //         params.zerosEndIndex = uint8(
    //             params.zerosStartIndex.add(nZeros).sub(1)
    //         );
    //         params.sigfigIndex = uint8(
    //             params.zerosStartIndex.sub(1).add(decimalPlace)
    //         );
    //         params.bufferLength = uint8(
    //             nZeros.add(numSigfigs.add(1)).add(decimalPlace)
    //         );
    //     } else {
    //         // else if decimal < 1
    //         nZeros = uint256(5).sub(digits);
    //         params.zerosStartIndex = 2;
    //         params.zerosEndIndex = uint8(
    //             nZeros.add(params.zerosStartIndex).sub(1)
    //         );
    //         params.bufferLength = uint8(nZeros.add(numSigfigs.add(2)));
    //         params.sigfigIndex = uint8((params.bufferLength).sub(2));
    //         params.isLessThanOne = true;
    //     }
    //     params.sigfigs = uint256(fee).div(10 ** (digits.sub(numSigfigs)));
    //     params.isPercent = true;
    //     params.decimalIndex = digits > 4 ? uint8(digits.sub(4)) : 0;
    //     console.log("decimalIndex ", params.decimalIndex);

    //     return generateDecimalString(params);
    // }

    function uintToString(uint256 value) internal pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT license
        // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function integerToString(
        uint256 amount
    ) internal pure returns (string memory) {
        uint256 tem;
        uint256 tem1;
        uint256 tem2;
        uint256 tem3;
        uint256 tem4;

        if (amount < 1000 * 10 ** 18) {
            //< 1000 100.9914 100111 000000000000000
            tem = amount / 10 ** 15;
            tem1 = tem / 100000;

            tem1 = amount / (10 ** 18); //integer
            tem2 = (((amount / 10 ** 17) % 1000) % 100) % 10; //
            tem3 = ((((amount / 10 ** 16) % 10000) % 1000) % 100) % 10;
            tem4 =
                (((((amount / 10 ** 15) % 100000) % 10000) % 1000) % 100) %
                10;

            if (tem4 >= 1) {
                if (tem3 < 9) tem3 += 1;
                else {
                    tem3 = 0;
                    if (tem2 < 9) tem2 += 1;
                    else {
                        tem2 = 0;
                        if (tem1 >= 999)
                            return string(abi.encodePacked("1.00K"));
                        else {
                            tem1 += 1;
                        }
                    }
                }
            }

            return
                string(
                    abi.encodePacked(
                        uintToString(tem1),
                        ".",
                        uintToString(tem2),
                        uintToString(tem3)
                    )
                );
        } else if (
            //1999.991400000000000000
            amount >= 1000 * 10 ** 18 && amount < 10 ** 6 * 10 ** 18 //>= 1K < 1M
        ) {
            // 1001 00000000000000000
            tem = amount / (1000 * 10 ** 18);
            tem1 = (amount / 10 ** 18 - tem * 1000) / 100;
            tem2 = (amount / 10 ** 18 - tem * 1000 - tem1 * 100) / 10;
            tem3 = (amount / 10 ** 18 - tem * 1000 - tem1 * 100 - tem2 * 10);
            if (tem3 >= 1) {
                if (tem2 < 9) tem2 += 1;
                else {
                    tem2 = 0;
                    if (tem1 < 9) tem1 += 1;
                    else {
                        tem1 = 0;
                        if (tem < 999) tem += 1;
                        else return string(abi.encodePacked("1.00M"));
                    }
                }
            }
            return
                string(
                    abi.encodePacked(
                        uintToString(tem),
                        ".",
                        uintToString(tem1),
                        uintToString(tem2),
                        "K"
                    )
                );
        } else if (
            amount >= 10 ** 6 * 10 ** 18 && amount < 10 ** 9 * 10 ** 18 // >=1M < 1B
        ) {
            // >=1M < 1B
            tem = amount / 10 ** 18;
            tem1 = amount / 10 ** 18 / 1000000; //integer
            tem2 = (tem % 1000000) / 100000;
            tem3 = (tem % 100000) / 10000;
            tem4 = (tem % 10000) / 1000;
            // console.log("amount ", amount);
            // console.log("tem1 ", tem1);
            // console.log("tem2 ", tem2);
            // console.log("tem3 ", tem3);
            // console.log("tem4 ", tem4);

            if (tem4 >= 1) {
                if (tem3 < 9) tem3 += 1;
                else {
                    tem3 = 0;
                    if (tem2 < 9) tem2 += 1;
                    else {
                        tem2 = 0;
                        if (tem1 < 999) tem += 1;
                        else return string(abi.encodePacked("1.00B"));
                    }
                }
            }
            return
                string(
                    abi.encodePacked(
                        uintToString(tem1),
                        ".",
                        uintToString(tem2),
                        uintToString(tem3),
                        "M"
                    )
                );
        } else if (
            amount >= 10 ** 9 * 10 ** 18 && amount < 10 ** 12 * 10 ** 18 // >= 1B < 1T
        ) {
            // >= 1B < 1T
            tem = amount / 10 ** 18;
            tem1 = tem / 1000000000; //integer
            tem2 = (tem % 10 ** 9) / 10 ** 8;
            tem3 = (tem % 10 ** 8) / 10 ** 7;
            tem4 = (tem % 10 ** 7) / 10 ** 6;

            // console.log("tem ", tem);
            // console.log("tem1 ", tem1);
            // console.log("tem2 ", tem2);
            // console.log("tem3 ", tem3);
            // console.log("tem4 ", tem4);

            if (tem4 >= 1) {
                if (tem3 < 9) tem3 += 1;
                else {
                    tem3 = 0;
                    if (tem2 < 9) tem2 += 1;
                    else {
                        tem2 = 0;
                        if (tem1 < 999) tem1 += 1;
                        else return string(abi.encodePacked("1.00T"));
                    }
                }
            }
            return
                string(
                    abi.encodePacked(
                        uintToString(tem1),
                        ".",
                        uintToString(tem2),
                        uintToString(tem3),
                        "B"
                    )
                );
        } else {
            // >=1T
            tem = amount / 10 ** 18;
            tem1 = tem / 10 ** 12;
            tem2 = (tem % 10 ** 12) / 10 ** 11;
            tem3 = (tem % 10 ** 11) / 10 ** 10;
            tem4 = (tem % 10 ** 10) / 10 ** 9;

            // console.log("tem ", tem);
            // console.log("tem1 ", tem1);
            // console.log("tem2 ", tem2);
            // console.log("tem3 ", tem3);
            // console.log("tem4 ", tem4);

            if (tem4 >= 1) {
                if (tem3 < 9) tem3 += 1;
                else {
                    tem3 = 0;
                    if (tem2 < 9) tem2 += 1;
                    else {
                        tem2 = 0;
                        tem1 += 1;
                    }
                }
            }

            return
                string(
                    abi.encodePacked(
                        uintToString(tem1),
                        ".",
                        uintToString(tem2),
                        uintToString(tem3),
                        "T"
                    )
                );
        }
    }

    // function addressToString(address addr) internal pure returns (string memory) {
    //     return (uint256(addr)).toHexString(20);
    // }

    // function generateSVGImage(ConstructTokenURIParams memory params) internal pure returns (string memory svg) {
    //     NFTSVG.SVGParams memory svgParams =
    //         NFTSVG.SVGParams({
    //             quoteToken: addressToString(params.quoteTokenAddress),
    //             baseToken: addressToString(params.baseTokenAddress),
    //             poolAddress: params.poolAddress,
    //             quoteTokenSymbol: params.quoteTokenSymbol,
    //             baseTokenSymbol: params.baseTokenSymbol,
    //             feeTier: feeToPercentString(params.fee),
    //             tickLower: params.tickLower,
    //             tickUpper: params.tickUpper,
    //             tickSpacing: params.tickSpacing,
    //             overRange: overRange(params.tickLower, params.tickUpper, params.tickCurrent),
    //             tokenId: params.tokenId,
    //             color0: tokenToColorHex(uint256(params.quoteTokenAddress), 136),
    //             color1: tokenToColorHex(uint256(params.baseTokenAddress), 136),
    //             color2: tokenToColorHex(uint256(params.quoteTokenAddress), 0),
    //             color3: tokenToColorHex(uint256(params.baseTokenAddress), 0),
    //             x1: scale(getCircleCoord(uint256(params.quoteTokenAddress), 16, params.tokenId), 0, 255, 16, 274),
    //             y1: scale(getCircleCoord(uint256(params.baseTokenAddress), 16, params.tokenId), 0, 255, 100, 484),
    //             x2: scale(getCircleCoord(uint256(params.quoteTokenAddress), 32, params.tokenId), 0, 255, 16, 274),
    //             y2: scale(getCircleCoord(uint256(params.baseTokenAddress), 32, params.tokenId), 0, 255, 100, 484),
    //             x3: scale(getCircleCoord(uint256(params.quoteTokenAddress), 48, params.tokenId), 0, 255, 16, 274),
    //             y3: scale(getCircleCoord(uint256(params.baseTokenAddress), 48, params.tokenId), 0, 255, 100, 484)
    //         });

    //     return NFTSVG.generateSVG(svgParams);
    // }

    // function overRange(
    //     int24 tickLower,
    //     int24 tickUpper,
    //     int24 tickCurrent
    // ) private pure returns (int8) {
    //     if (tickCurrent < tickLower) {
    //         return -1;
    //     } else if (tickCurrent > tickUpper) {
    //         return 1;
    //     } else {
    //         return 0;
    //     }
    // }

    // function scale(
    //     uint256 n,
    //     uint256 inMn,
    //     uint256 inMx,
    //     uint256 outMn,
    //     uint256 outMx
    // ) private pure returns (string memory) {
    //     return
    //         (n.sub(inMn).mul(outMx.sub(outMn)).div(inMx.sub(inMn)).add(outMn))
    //             .toString();
    // }

    // function tokenToColorHex(
    //     uint256 token,
    //     uint256 offset
    // ) internal pure returns (string memory str) {
    //     return string((token >> offset).toHexStringNoPrefix(3));
    // }

    // function getCircleCoord(
    //     uint256 tokenAddress,
    //     uint256 offset,
    //     uint256 tokenId
    // ) internal pure returns (uint256) {
    //     return (sliceTokenHex(tokenAddress, offset) * tokenId) % 255;
    // }

    // function sliceTokenHex(
    //     uint256 token,
    //     uint256 offset
    // ) internal pure returns (uint256) {
    //     return uint256(uint8(token >> offset));
    // }

    function intervalToString(
        uint256 interval
    ) internal pure returns (string memory) {
        if (interval == 60 * 60 * 1) {
            return string(abi.encodePacked("Hours"));
        } else if (interval == 60 * 60 * 24) {
            return string(abi.encodePacked("Days"));
        } else if (interval == 60 * 60 * 24 * 7) {
            return string(abi.encodePacked("Weeks"));
        } else if (interval == 60 * 60 * 24 * 30) {
            return string(abi.encodePacked("Months"));
        } else if (interval == 60 * 60 * 24 * 365) {
            return string(abi.encodePacked("Years"));
        } else if (interval == 60) {
            return string(abi.encodePacked("Minutes"));
        } else if (interval == 1) {
            return string(abi.encodePacked("Seconds"));
        } else {
            return string(abi.encodePacked("Unknow"));
        }
    }

    function vestingStateString(
        uint256 cliffEndTime,
        uint256 endTime
    ) internal view returns (string memory) {
        if (cliffEndTime > 0 && block.timestamp < cliffEndTime) {
            return string(abi.encodePacked("Lockup"));
        }
        if (block.timestamp > cliffEndTime && block.timestamp < endTime) {
            return string(abi.encodePacked("Releasing"));
        }

        if (block.timestamp > endTime && endTime > 0) {
            return string(abi.encodePacked("End"));
        }

        return string(abi.encodePacked("Unknow"));
    }

    function generateNFTAttributes(
        string memory symbol,
        address tokenAddr,
        uint256 remaining,
        uint256 total,
        uint256 interval,
        uint256 cliffEndTime,
        uint256 endTime
    ) internal view returns (string memory attributes) {
        attributes = string(
            abi.encodePacked(
                "[",
                generateNFTAttribute1(symbol, tokenAddr),
                generateNFTAttribute2(remaining, total),
                generateNFTAttribute3(interval, cliffEndTime, endTime),
                "]"
            )
        );
    }

    // function generateCollctionArributes()
    //     internal
    //     pure
    //     returns (string memory attributes)
    // {
    //     attributes = string(abi.encodePacked("[", "]"));
    // }

    function generateNFTAttribute1(
        string memory symbol,
        address tokenAddr
    ) internal pure returns (string memory attribute) {
        attribute = string(
            abi.encodePacked(
                "{",
                '"trait_type":"Vesting Token Symbol","value":"',
                symbol,
                '"},{',
                '"trait_type":"Vesting Token Contract","value":"',
                addressToString(tokenAddr),
                '"},'
            )
        );
    }

    function generateNFTAttribute2(
        uint256 remaining,
        uint256 total
    ) internal pure returns (string memory attribute) {
        attribute = string(
            abi.encodePacked(
                "{",
                '"trait_type":"Remaining","value":"',
                NFTDescriptor.integerToString(remaining),
                '"},{',
                '"trait_type":"Total","value":"',
                NFTDescriptor.integerToString(total),
                '"},'
            )
        );
    }

    function generateNFTAttribute3(
        uint256 interval,
        uint256 cliffEndTime,
        uint256 endTime
    ) internal view returns (string memory attribute) {
        attribute = string(
            abi.encodePacked(
                "{",
                '"trait_type":"State","value":"',
                NFTDescriptor.vestingStateString(cliffEndTime, endTime),
                '"},{',
                '"trait_type":"Interval","value":"',
                intervalToString(interval),
                '"}'
            )
        );
    }

    function generateReceiptCollectionAttributes(
        string memory projectName,
        string memory tokenName,
        string memory txHash,
        uint256 myInvestedAmount,
        uint256 totalInvestedAmount
    ) internal pure returns (string memory attributes) {
        attributes = string(
            abi.encodePacked(
                "[",
                generateReceiptAttribute1(projectName, tokenName),
                generateReceiptAttribute2(
                    myInvestedAmount,
                    totalInvestedAmount
                ),
                generateReceiptAttribute3(totalInvestedAmount, txHash),
                "]"
            )
        );
    }

    function generateReceiptAttribute1(
        string memory projectName,
        string memory tokenName
    ) internal pure returns (string memory attribute) {
        attribute = string(
            abi.encodePacked(
                "{",
                '"trait_type":"Project Name","value":"',
                projectName,
                '"},{',
                '"trait_type":"Investment Currency","value":"',
                tokenName,
                '"},'
            )
        );
    }

    function generateReceiptAttribute2(
        uint256 myInvestedAmount,
        uint256 totalInvestedAmount
    ) internal pure returns (string memory attribute) {
        string memory percentage = pencentageString(
            myInvestedAmount,
            totalInvestedAmount
        );
        attribute = string(
            abi.encodePacked(
                "{",
                '"trait_type":"Investor Invested","value":"',
                integerToString(myInvestedAmount),
                '"},{',
                '"trait_type":"% of Total","value":"',
                percentage,
                '"},'
            )
        );
    }

    function generateReceiptAttribute3(
        uint256 totalInvestedAmount,
        string memory txHash
    ) internal pure returns (string memory attribute) {
        attribute = string(
            abi.encodePacked(
                "{",
                '"trait_type":"Total Invested","value":"',
                integerToString(totalInvestedAmount),
                '"},{',
                '"trait_type":"Investment Hash","value":"',
                txHash,
                '"}'
            )
        );
    }

    function addressToString(
        address addr
    ) internal pure returns (string memory) {
        return Strings.toHexString(uint256(uint160(addr)), 20);
    }

    function pencentageString(
        uint256 divisor,
        uint256 dividend
    ) internal pure returns (string memory) {
        uint256 rel = (divisor * 100000) / dividend;
        uint256 digit1 = rel / 10000;
        uint256 digit2 = (rel - digit1 * 10000) / 1000;
        uint256 digit3 = (rel - digit1 * 10000 - digit2 * 1000) / 100;
        uint256 digit4 = (rel -
            (digit1 * 10000 + digit2 * 1000 + digit3 * 100)) / 10;
        uint256 digit5 = rel -
            (digit1 * 10000 + digit2 * 1000 + digit3 * 100 + digit4 * 10);
        // console.log(rel);
        // console.log(digit5);
        // console.log(digit4);
        // console.log(digit3);
        // console.log(digit2);
        // console.log(digit1);

        if (digit5 > 5) {
            if (digit4 < 9) digit4 += 1;
            else {
                digit4 = 0;
                if (digit3 < 9) digit3 += 1;
                else {
                    digit3 = 0;
                    if (digit2 < 9) digit2 += 1;
                    else {
                        digit2 = 0;
                        if (digit1 < 9) digit1 += 1;
                        else {
                            return
                                string(
                                    abi.encodePacked(
                                        uintToString(100),
                                        unicode".00%"
                                    )
                                );
                        }
                    }
                }
            }
        }

        string memory percentage = digit1 == 0
            ? string(
                abi.encodePacked(
                    uintToString(digit2),
                    unicode".",
                    uintToString(digit3),
                    uintToString(digit4),
                    unicode"%"
                )
            )
            : string(
                abi.encodePacked(
                    uintToString(digit1),
                    uintToString(digit2),
                    unicode".",
                    uintToString(digit3),
                    uintToString(digit4),
                    unicode"%"
                )
            );
        return percentage;
    }
}
