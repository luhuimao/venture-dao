// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.6;

import "@openzeppelin/contracts/utils/Strings.sol";
import "base64-sol/base64.sol";
import "./NFTDescriptor.sol";
import "./DateTime.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

library VestingNFTSVG {
    using Strings for uint256;

    //         uint256Params[0] remaining_,
    //         uint256Params[1] total_,
    //         uint256Params[2] interval,
    //         uint256Params[3] cliffTime,
    //         uint256Params[4] endTime
    function generateSVG(
        string memory symbol,
        address tokenAddr,
        uint256[5] memory uint256Params
    ) internal view returns (string memory svg) {
        uint8 decimals = ERC20(tokenAddr).decimals();
        svg = string(
            abi.encodePacked(
                generateSVGTop(decimals),
                generateSVGScroll(symbol, tokenAddr),
                generateSVGHead(symbol, decimals, uint256Params[0]),
                generateSVGStatic(),
                generateSVGVestingInfo(
                    tokenAddr,
                    [
                        uint256Params[3],
                        uint256Params[4],
                        uint256Params[2],
                        uint256Params[1]
                    ]
                ),
                "</svg>"
            )
        );
    }

    function generateSVGTop(uint8 decimals) internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                '<svg width="290" height="500" viewBox="0 0 290 500" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
                generateSVGDefs(),
                generateSVGTopgTag()
            )
        );
    }

    function generateSVGDefs() internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                "<defs>",
                '<clipPath id="corners"><rect width="290" height="500" rx="42" ry="42" /></clipPath>',
                '<path id="text-path-a" d="M40 12 H250 A28 28 0 0 1 278 40 V460 A28 28 0 0 1 250 488 H40 A28 28 0 0 1 12 460 V40 A28 28 0 0 1 40 12 z" />',
                "</defs>"
            )
        );
    }

    function generateSVGTopgTag() internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                '<g clip-path="url(#corners)">',
                '<rect fill="ba7970" x="0px" y="0px" width="290px" height="500px" />',
                '<g style="filter:url(#top-region-blur); transform:scale(1.5); transform-origin:center top;"><rect fill="none" x="0px" y="0px" width="290px" height="500px" /> </g>',
                "</g>"
            )
        );
    }

    function generateSVGScroll(
        string memory tokenName,
        address tokenAddr
    ) internal pure returns (string memory svg) {
        string memory tokenNameAddr = string(
            abi.encodePacked(
                Strings.toHexString(uint256(uint160(tokenAddr)), 20),
                unicode" • ",
                tokenName
            )
        );
        svg = string(
            abi.encodePacked(
                '<text text-rendering="optimizeSpeed">',
                generateSVGScroll1(),
                generateSVGScroll2(tokenNameAddr),
                "</text>"
            )
        );
    }

    function generateSVGScroll1() internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                '<textPath startOffset="-100%" fill="white" font-family="\'Courier New\', monospace" font-size="10px" xlink:href="#text-path-a">DAOSquare Incubator Venture DAO Vesting<animate additive="sum" attributeName="startOffset" from="0%" to="100%" begin="0s" dur="30s" repeatCount="indefinite" /></textPath>',
                '<textPath startOffset="0%" fill="white" font-family="\'Courier New\', monospace" font-size="10px" xlink:href="#text-path-a">DAOSquare Incubator Venture DAO Vesting<animate additive="sum" attributeName="startOffset" from="0%" to="100%" begin="0s" dur="30s" repeatCount="indefinite" /> </textPath>'
            )
        );
    }

    function generateSVGScroll2(
        string memory tokenNameAddr
    ) internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                '<textPath startOffset="50%" fill="white" font-family="\'Courier New\', monospace" font-size="10px" xlink:href="#text-path-a">',
                tokenNameAddr,
                '<animate additive="sum" attributeName="startOffset" from="0%" to="100%" begin="0s" dur="30s" repeatCount="indefinite" /></textPath>',
                '<textPath startOffset="-50%" fill="white" font-family="\'Courier New\', monospace" font-size="10px" xlink:href="#text-path-a">',
                tokenNameAddr,
                '<animate additive="sum" attributeName="startOffset" from="0%" to="100%" begin="0s" dur="30s" repeatCount="indefinite" /></textPath>'
            )
        );
    }

    function generateSVGHead(
        string memory tokenName,
        uint8 decimals,
        uint256 remaining_
    ) internal pure returns (string memory svg) {
        string memory _remaining = NFTDescriptor.integerToString(
            decimals,
            remaining_
        );
        string memory tokenname = string(abi.encodePacked("$", tokenName));

        svg = string(
            abi.encodePacked(
                '<g mask="url(#fade-symbol)">',
                '<text fill="white" xml:space="preserve" style="white-space: pre" font-family="\'Courier New\'" font-size="36" font-weight="70" letter-spacing="0em"><tspan x="32" y="64.0801">',
                tokenname,
                "</tspan></text>",
                '<text fill="white" xml:space="preserve" style="white-space: pre" font-family="\'Courier New\'" font-size="16" font-weight="20" letter-spacing="0em"><tspan x="129" y="58.7578"></tspan></text>',
                '<text fill="#9374FF" xml:space="preserve" style="white-space: pre" font-family="\'Courier New\'" font-size="36" font-weight="30" letter-spacing="0em"><tspan x="32" y="109.08">',
                _remaining,
                "</tspan></text>",
                '<text fill="white" xml:space="preserve" style="white-space: pre" font-family="\'Courier New\'" font-size="16" font-weight="20" letter-spacing="0em"><tspan x="32" y="139.08">Remaining To Be Claimed</tspan></text>'
                "</g>"
            )
        );
    }

    function generateSVGStatic() internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                '<linearGradient id="paint3_linear_17316_39704" x1="65" y1="188" x2="158.399" y2="273.164" gradientUnits="userSpaceOnUse"><stop stop-color="#9374FF" stop-opacity="0.3"/><stop offset="1" stop-color="#9374FF" stop-opacity="0"/></linearGradient>',
                '<rect x="16" y="16" width="258" height="468" rx="26" ry="26" fill="rgba(0,0,0,0)" stroke="rgba(255,255,255,0.2)"/>',
                '<mask id="path-14-inside-1_17316_39704" fill="white"><path d="M65 188H225V316H65V188Z"/></mask>',
                '<path d="M65 188H225V316H65V188Z" fill="url(#paint3_linear_17316_39704)"/>',
                '<path d="M65 188V187H64V188H65ZM65 189H225V187H65V189ZM66 316V188H64V316H66Z" fill="#9374FF" mask="url(#path-14-inside-1_17316_39704)"/>',
                '<path d="M92 192C94.2091 192 96 190.209 96 188C96 185.791 94.2091 184 92 184C89.7909 184 88 185.791 88 188C88 190.209 89.7909 192 92 192Z" fill="#9374FF"/>'
            )
        );
    }

    struct SVGVestingVars {
        string state;
        string totalAmount;
        uint256 year;
        uint256 month;
        uint256 day;
        string endDateTime;
        string startDateTime;
        string intervalStr;
    }

    //         uint256Params[0] cliffEndTime,
    //         uint256Params[1] endTime,
    //         uint256Params[2] interval,
    //         uint256Params[3] total
    function generateSVGVestingInfo(
        address erc20Addr,
        uint256[4] memory uint256Params
    ) internal view returns (string memory svg) {
        SVGVestingVars memory vars;
        vars.state = NFTDescriptor.vestingStateString(
            uint256Params[0],
            uint256Params[1]
        );
        vars.totalAmount = NFTDescriptor.integerToString(
            ERC20(erc20Addr).decimals(),
            uint256Params[3]
        );
        // console.log(" vars.totalAmount ", vars.totalAmount);
        (vars.year, vars.month, vars.day) = DateTime.timestampToDate(
            uint256Params[0]
        );

        vars.startDateTime = string(
            abi.encodePacked(
                NFTDescriptor.uintToString(vars.month),
                "/",
                NFTDescriptor.uintToString(vars.day),
                "/",
                NFTDescriptor.uintToString(vars.year)
            )
        );
        vars.intervalStr = NFTDescriptor.intervalToString(uint256Params[2]);
        svg = string(
            abi.encodePacked(
                generateSVGVestingText1(),
                generateSVGVestingText2(vars.totalAmount),
                generateSVGVestingText3(),
                generateSVGVestingText4(vars.state),
                generateSVGVestingText5(),
                generateSVGVestingText6(vars.startDateTime),
                generateSVGVestingText7(),
                generateSVGVestingText8(vars.intervalStr)
            )
        );
    }

    function generateSVGVestingText1()
        internal
        pure
        returns (string memory svg)
    {
        svg = string(
            abi.encodePacked(
                '<g mask="url(#fade-symbol)"><text fill="white" xml:space="preserve" style="white-space: pre" font-family="Courier New" font-size="12" letter-spacing="0em"><tspan x="32" y="381.193">Total</tspan></text>'
            )
        );
    }

    function generateSVGVestingText2(
        string memory totalAmount
    ) internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                '<text fill="#9374FF" xml:space="preserve" style="white-space: pre" font-family="Courier New" font-size="12" letter-spacing="0em"><tspan x="32" y="399.193">',
                totalAmount,
                "</tspan></text>"
            )
        );
    }

    function generateSVGVestingText3()
        internal
        pure
        returns (string memory svg)
    {
        svg = string(
            abi.encodePacked(
                '<text fill="white" xml:space="preserve" style="white-space: pre" font-family="Courier New" font-size="12" letter-spacing="0em"><tspan x="154" y="381.193">State</tspan></text>'
            )
        );
    }

    function generateSVGVestingText4(
        string memory state
    ) internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                '<text fill="#9374FF" xml:space="preserve" style="white-space: pre" font-family="Courier New" font-size="12" letter-spacing="0em"><tspan x="154" y="399.193">',
                state,
                "</tspan></text>"
            )
        );
    }

    function generateSVGVestingText5()
        internal
        pure
        returns (string memory svg)
    {
        svg = string(
            abi.encodePacked(
                '<text fill="white" xml:space="preserve" style="white-space: pre" font-family="Courier New" font-size="12" letter-spacing="0em"><tspan x="32" y="433.193">Claim Start</tspan></text>'
            )
        );
    }

    function generateSVGVestingText6(
        string memory endDateTime
    ) internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                '<text fill="#9374FF" xml:space="preserve" style="white-space: pre" font-family="Courier New" font-size="12" letter-spacing="0em"><tspan x="32" y="451.193">',
                endDateTime,
                "</tspan></text>"
            )
        );
    }

    function generateSVGVestingText7()
        internal
        pure
        returns (string memory svg)
    {
        svg = string(
            abi.encodePacked(
                '<g clip-path="url(#clip1_17316_39704)"><text fill="white" xml:space="preserve" style="white-space: pre" font-family="Courier New" font-size="12" letter-spacing="0em"><tspan x="154" y="433.193">Interval</tspan></text>'
            )
        );
    }

    function generateSVGVestingText8(
        string memory intervalStr
    ) internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                '<text fill="#9374FF" xml:space="preserve" style="white-space: pre" font-family="Courier New" font-size="12" letter-spacing="0em"><tspan x="154" y="451.193">',
                intervalStr,
                "</tspan></text></g></g>"
            )
        );
    }

    function generateDescription(
        string memory des,
        string memory symbol,
        address tokenAddr,
        uint256 remaining,
        uint256 total,
        uint256 interval,
        uint256 cliffEndTime,
        uint256 endTime
    ) internal view returns (string memory svg) {
        uint8 decimals = ERC20(tokenAddr).decimals();
        svg = string(
            abi.encodePacked(
                des,
                "\\n\\nVesting Token Symbol: ",
                symbol,
                "\\nVesting Token Contract: ",
                addressToString(tokenAddr),
                "\\nRemaining: ",
                NFTDescriptor.integerToString(decimals, remaining),
                "\\nTotal: ",
                NFTDescriptor.integerToString(decimals, total),
                "\\nState: ",
                NFTDescriptor.vestingStateString(cliffEndTime, endTime),
                "\\nInterval: ",
                uintToString(interval)
            )
        );
    }

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

    function addressToString(
        address addr
    ) internal pure returns (string memory) {
        return Strings.toHexString(uint256(uint160(addr)), 20);
    }
}
