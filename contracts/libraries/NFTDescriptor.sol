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
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
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
        uint8 decimals,
        uint256 amount
    ) internal pure returns (string memory) {
        uint256 tem;
        uint256 tem1;
        uint256 tem2;
        uint256 tem3;
        uint256 tem4;
        // console.log("decimals ", decimals);
        // console.log("amount ", amount);

        // if (amount < 1000 * 10 ** 18) {
        if (amount < 1000 * 10 ** decimals) {
            //< 1000.00000
            //< 1000 100.9914
            //80919048000000000000
            // tem = amount / 10 ** 15;
            // tem1 = tem / 100000;

            // tem1 = amount / (10 ** 18); //integer整数部分
            tem1 = amount / (10 ** decimals); //integer整数部分
            // tem2 = (((amount / 10 ** 17) % 1000) % 100) % 10; //
            tem2 = (((amount / 10 ** (decimals - 1)) % 1000) % 100) % 10; //

            // tem3 = ((((amount / 10 ** 16) % 10000) % 1000) % 100) % 10;
            tem3 =
                ((((amount / 10 ** (decimals - 2)) % 10000) % 1000) % 100) %
                10;

            // tem4 =
            //     (((((amount / 10 ** 15) % 100000) % 10000) % 1000) % 100) %
            //     10;
            tem4 =
                (((((amount / 10 ** (decimals - 3)) % 100000) % 10000) % 1000) %
                    100) %
                10;

            // console.log("tem1 ", tem1);
            // console.log("tem2 ", tem2);
            // console.log("tem3 ", tem3);
            // console.log("tem4 ", tem4);

            if (tem4 >= 5) {
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
            // amount >= 1000 * 10 ** 18 && amount < 10 ** 6 * 10 ** 18 //>= 1K < 1M
            amount >= 1000 * 10 ** decimals && amount < 10 ** 6 * 10 ** decimals //>= 1K < 1M
        ) {
            // 1001 00000000000000000
            // tem = amount / (1000 * 10 ** 18);
            tem = amount / (1000 * 10 ** decimals);
            // tem1 = (amount / 10 ** 18 - tem * 1000) / 100;
            tem1 = (amount / 10 ** decimals - tem * 1000) / 100;
            // tem2 = (amount / 10 ** 18 - tem * 1000 - tem1 * 100) / 10;
            tem2 = (amount / 10 ** decimals - tem * 1000 - tem1 * 100) / 10;
            // tem3 = (amount / 10 ** 18 - tem * 1000 - tem1 * 100 - tem2 * 10);
            tem3 = (amount /
                10 ** decimals -
                tem *
                1000 -
                tem1 *
                100 -
                tem2 *
                10);

            if (tem3 >= 5) {
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
            // amount >= 10 ** 6 * 10 ** 18 && amount < 10 ** 9 * 10 ** 18 // >=1M < 1B
            amount >= 10 ** 6 * 10 ** decimals &&
            amount < 10 ** 9 * 10 ** decimals // >=1M < 1B
        ) {
            // >=1M < 1B
            // tem = amount / 10 ** 18;
            tem = amount / 10 ** decimals;
            // tem1 = amount / 10 ** 18 / 1000000; //integer
            tem1 = amount / 10 ** decimals / 1000000; //integer
            tem2 = (tem % 1000000) / 100000;
            tem3 = (tem % 100000) / 10000;
            tem4 = (tem % 10000) / 1000;
            // console.log("amount ", amount);
            // console.log("tem1 ", tem1);
            // console.log("tem2 ", tem2);
            // console.log("tem3 ", tem3);
            // console.log("tem4 ", tem4);

            if (tem4 >= 5) {
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
            // amount >= 10 ** 9 * 10 ** 18 && amount < 10 ** 12 * 10 ** 18 // >= 1B < 1T
            amount >= 10 ** 9 * 10 ** decimals &&
            amount < 10 ** 12 * 10 ** decimals // >= 1B < 1T
        ) {
            // >= 1B < 1T
            // tem = amount / 10 ** 18;
            tem = amount / 10 ** decimals;
            tem1 = tem / 1000000000; //integer
            tem2 = (tem % 10 ** 9) / 10 ** 8;
            tem3 = (tem % 10 ** 8) / 10 ** 7;
            tem4 = (tem % 10 ** 7) / 10 ** 6;

            // console.log("tem ", tem);
            // console.log("tem1 ", tem1);
            // console.log("tem2 ", tem2);
            // console.log("tem3 ", tem3);
            // console.log("tem4 ", tem4);

            if (tem4 >= 5) {
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
            // tem = amount / 10 ** 18;
            tem = amount / 10 ** decimals;
            tem1 = tem / 10 ** 12;
            tem2 = (tem % 10 ** 12) / 10 ** 11;
            tem3 = (tem % 10 ** 11) / 10 ** 10;
            tem4 = (tem % 10 ** 10) / 10 ** 9;

            // console.log("tem ", tem);
            // console.log("tem1 ", tem1);
            // console.log("tem2 ", tem2);
            // console.log("tem3 ", tem3);
            // console.log("tem4 ", tem4);

            if (tem4 >= 5) {
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
        uint8 decimals = ERC20(tokenAddr).decimals();
        attributes = string(
            abi.encodePacked(
                "[",
                generateNFTAttribute1(symbol, tokenAddr),
                generateNFTAttribute2(decimals, remaining, total),
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
        uint8 decimals,
        uint256 remaining,
        uint256 total
    ) internal pure returns (string memory attribute) {
        attribute = string(
            abi.encodePacked(
                "{",
                '"trait_type":"Remaining","value":"',
                NFTDescriptor.integerToString(decimals, remaining),
                '"},{',
                '"trait_type":"Total","value":"',
                NFTDescriptor.integerToString(decimals, total),
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
        uint8 decimals,
        uint256 myInvestedAmount,
        uint256 totalInvestedAmount
    ) internal pure returns (string memory attributes) {
        attributes = string(
            abi.encodePacked(
                "[",
                generateReceiptAttribute1(projectName, tokenName),
                generateReceiptAttribute2(
                    myInvestedAmount,
                    totalInvestedAmount,
                    decimals
                ),
                generateReceiptAttribute3(
                    totalInvestedAmount,
                    decimals,
                    txHash
                ),
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
        uint256 totalInvestedAmount,
        uint8 decimals
    ) internal pure returns (string memory attribute) {
        string memory percentage = pencentageString(
            myInvestedAmount,
            totalInvestedAmount
        );
        attribute = string(
            abi.encodePacked(
                "{",
                '"trait_type":"Investor Invested","value":"',
                integerToString(decimals, myInvestedAmount),
                '"},{',
                '"trait_type":"% of Total","value":"',
                percentage,
                '"},'
            )
        );
    }

    function generateReceiptAttribute3(
        uint256 totalInvestedAmount,
        uint8 decimals,
        string memory txHash
    ) internal pure returns (string memory attribute) {
        attribute = string(
            abi.encodePacked(
                "{",
                '"trait_type":"Total Invested","value":"',
                integerToString(decimals, totalInvestedAmount),
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
