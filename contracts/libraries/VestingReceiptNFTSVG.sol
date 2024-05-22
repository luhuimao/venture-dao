// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.6;

import "@openzeppelin/contracts/utils/Strings.sol";
import "base64-sol/base64.sol";
import "./NFTDescriptor.sol";
import "./DateTime.sol";
import "hardhat/console.sol";

library VestingReceiptNFTSVG {
    using Strings for uint256;

    function generateSVG(
        string memory txHash,
        string memory projectName,
        string memory symbol,
        uint256 totalInvestedAmount,
        uint256 myInvestedAmount
    ) internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                generateSVGTop(symbol, myInvestedAmount),
                generateSVGScroll(txHash),
                generateAngleImage(),
                generateInvestmentAttributes(
                    projectName,
                    totalInvestedAmount,
                    myInvestedAmount
                ),
                generateSVGStatic(),
                "</svg>"
            )
        );
    }

    function generateSVGTop(
        string memory symbol,
        uint256 myInvestedAmount
    ) internal pure returns (string memory svg) {
        string memory _myInvestedAmount = NFTDescriptor.integerToString(
            myInvestedAmount
        );
        svg = string(
            abi.encodePacked(
                '<svg width="290" height="500" viewBox="0 0 290 500" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
                generateSVGDefs(),
                generateSVGTopgTag1(symbol),
                generateSVGTopgTag2(_myInvestedAmount)
            )
        );
    }

    function generateSVGDefs() internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                '<g clip-path="url(#clip0_17316_39637)">',
                '<mask id="mask0_17316_39637" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="290" height="500">',
                '<path d="M248 0H42C18.804 0 0 18.804 0 42V458C0 481.196 18.804 500 42 500H248C271.196 500 290 481.196 290 458V42C290 18.804 271.196 0 248 0Z" fill="white"/>',
                "</mask>",
                '<g mask="url(#mask0_17316_39637)">',
                '<path d="M290 0H0V500H290V0Z" fill="url(#paint0_linear_17316_39637)"/>',
                '<g filter="url(#filter0_f_17316_39637)">',
                '<path d="M290 0H0V500H290V0Z" fill="url(#paint1_linear_17316_39637)"/>',
                "</g>"
            )
        );
    }

    function generateSVGTopgTag1(
        string memory projectName
    ) internal pure returns (string memory svg) {
        string memory s = substring(projectName, 0, 10);

        svg = string(
            abi.encodePacked(
                '<g filter="url(#filter1_f_17316_39637)">',
                '<path opacity="0.85" d="M145 120C244.411 120 325 66.2742 325 0C325 -66.2742 244.411 -120 145 -120C45.5887 -120 -35 -66.2742 -35 0C-35 66.2742 45.5887 120 145 120Z" fill="url(#paint2_linear_17316_39637)"/>',
                "</g>",
                '<path d="M248 0H42C18.804 0 0 18.804 0 42V458C0 481.196 18.804 500 42 500H248C271.196 500 290 481.196 290 458V42C290 18.804 271.196 0 248 0Z" stroke="white" stroke-opacity="0.2"/>',
                '<text fill="white" xml:space="preserve" style="white-space: pre" font-family="Courier New" font-size="12" letter-spacing="0em"><tspan x="34" y="130.193">Investor Invested</tspan></text>',
                "</g>",
                '<text fill="white" xml:space="preserve" style="white-space: pre" font-family="Courier New" font-size="36" letter-spacing="0em"><tspan x="32" y="64.0801">$',
                s,
                "</tspan></text>"
            )
        );
    }

    function generateSVGTopgTag2(
        string memory myInvestedAmount
    ) internal pure returns (string memory svg) {
        // svg = string(
        //     abi.encodePacked(
        //         '<text fill="#9374FF" xml:space="preserve" style="white-space: pre" font-family="Courier New" font-size="36" letter-spacing="0em"><tspan x="32" y="109.08">',
        //         myInvestedAmount,
        //         "</tspan></text>",
        //         '<text fill="white" xml:space="preserve" style="white-space: pre" font-family="Courier New" font-size="16" letter-spacing="0em"><tspan x="192" y="103.758">',
        //         symbol,
        //         "</tspan></text>",
        //         '<path d="M248 16H42C27.6406 16 16 27.6406 16 42V458C16 472.359 27.6406 484 42 484H248C262.359 484 274 472.359 274 458V42C274 27.6406 262.359 16 248 16Z" stroke="white" stroke-opacity="0.2"/>',
        //         " <defs>",
        //         '<clipPath id="corners"><rect width="290" height="500" rx="42" ry="42" /></clipPath><path id="text-path-a" d="M40 12 H250 A28 28 0 0 1 278 40 V460 A28 28 0 0 1 250 488 H40 A28 28 0 0 1 12 460 V40 A28 28 0 0 1 40 12 z" />',
        //         "</defs>"
        //     )
        // );

        svg = string(
            abi.encodePacked(
                '<text fill="#9374FF" xml:space="preserve" style="white-space: pre" font-family="Courier New" font-size="36" letter-spacing="0em"><tspan x="32" y="109.08">',
                myInvestedAmount,
                "</tspan></text>",
                '<path d="M248 16H42C27.6406 16 16 27.6406 16 42V458C16 472.359 27.6406 484 42 484H248C262.359 484 274 472.359 274 458V42C274 27.6406 262.359 16 248 16Z" stroke="white" stroke-opacity="0.2"/>',
                " <defs>",
                '<clipPath id="corners"><rect width="290" height="500" rx="42" ry="42" /></clipPath><path id="text-path-a" d="M40 12 H250 A28 28 0 0 1 278 40 V460 A28 28 0 0 1 250 488 H40 A28 28 0 0 1 12 460 V40 A28 28 0 0 1 40 12 z" />',
                "</defs>"
            )
        );
    }

    function generateSVGScroll(
        string memory txHash
    ) internal pure returns (string memory svg) {
        string memory tranHash = string(
            abi.encodePacked(txHash, unicode" • ", "HASH")
        );
        svg = string(
            abi.encodePacked(
                '<text text-rendering="optimizeSpeed">',
                generateSVGScroll1(),
                generateSVGScroll2(tranHash),
                "</text>"
            )
        );
    }

    function generateSVGScroll1() internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                '<textPath startOffset="-100%" fill="white" font-family="\'Courier New\', monospace" font-size="10px" xlink:href="#text-path-a">DAOSquare Incubator Venture DAO Receipt<animate additive="sum" attributeName="startOffset" from="0%" to="100%" begin="0s" dur="30s" repeatCount="indefinite" /></textPath>',
                '<textPath startOffset="0%" fill="white" font-family="\'Courier New\', monospace" font-size="10px" xlink:href="#text-path-a">DAOSquare Incubator Venture DAO Receipt<animate additive="sum" attributeName="startOffset" from="0%" to="100%" begin="0s" dur="30s" repeatCount="indefinite" /> </textPath>'
            )
        );
    }

    function generateSVGScroll2(
        string memory txHash
    ) internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                '<textPath startOffset="50%" fill="white" font-family="\'Courier New\', monospace" font-size="10px" xlink:href="#text-path-a">',
                txHash,
                '<animate additive="sum" attributeName="startOffset" from="0%" to="100%" begin="0s" dur="30s" repeatCount="indefinite" /></textPath>',
                '<textPath startOffset="-50%" fill="white" font-family="\'Courier New\', monospace" font-size="10px" xlink:href="#text-path-a">',
                txHash,
                '<animate additive="sum" attributeName="startOffset" from="0%" to="100%" begin="0s" dur="30s" repeatCount="indefinite" /></textPath>'
            )
        );
    }

    function generateAngleImage() internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                generateAngleImage1(),
                generateAngleImage2(),
                generateAngleImage3()
            )
        );
    }

    function generateAngleImage1() internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                '<path d="M157.018 224.923C159.358 223.572 161.954 221.98 164.704 220.143C165.749 219.446 167.21 218.718 168.377 218.21C177.126 214.405 188.074 217.731 188.074 217.731C188.628 222.576 175.93 224.044 175.93 224.044L186.437 225.571C185.577 229.939 176.353 229.497 176.353 229.497L184.027 233.199C182.462 236.763 174.942 233.993 174.942 233.993L178.612 238.59C175.323 240.547 170.425 236.815 170.425 236.815L172.143 241.627C168.944 243.096 165.561 239.315 165.561 239.315L166.364 243.719C164.679 243.713 163.426 243.102 162.514 242.324" stroke="#9374FF" stroke-linecap="round" stroke-linejoin="round"/>',
                '<path d="M132.517 224.717C130.27 223.411 127.796 221.887 125.184 220.143C124.142 219.446 122.681 218.718 121.514 218.21C112.763 214.405 101.818 217.731 101.818 217.731C101.263 222.576 113.959 224.044 113.959 224.044L103.452 225.571C104.311 229.939 113.536 229.497 113.536 229.497L105.862 233.199C107.429 236.763 114.947 233.993 114.947 233.993L111.28 238.59C114.566 240.547 119.467 236.815 119.467 236.815L117.745 241.627C120.947 243.096 124.33 239.315 124.33 239.315L123.528 243.719C125.125 243.714 126.333 243.164 127.232 242.444" stroke="#9374FF" stroke-linecap="round" stroke-linejoin="round"/>',
                '<path fill-rule="evenodd" clip-rule="evenodd" d="M144.262 220.346C148.97 220.346 152.786 216.454 152.786 211.653C152.786 206.852 148.97 202.96 144.262 202.96C139.557 202.96 135.741 206.852 135.741 211.653C135.741 216.454 139.557 220.346 144.262 220.346Z" stroke="#9374FF" stroke-linecap="round" stroke-linejoin="round"/>'
            )
        );
    }

    function generateAngleImage2() internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                '<path d="M145.396 292.146C145.396 294.849 143.242 297.04 140.582 297.04C137.923 297.04 135.766 294.849 135.766 292.146L135.37 260.087C134.624 261.165 133.242 261.904 131.264 261.904C128.926 261.904 127.46 260.24 127.438 258.146L127.2 233.542C127.146 227.988 131.658 223.362 137.861 223.231L138.009 223.228C138.037 223.228 138.064 223.228 138.091 223.228L150.73 223.283C150.777 223.283 150.824 223.283 150.872 223.283C157.464 223.228 162.109 227.954 162.315 232.635L162.478 258.264C162.491 260.357 160.586 262.064 158.221 262.076C158.214 262.076 158.206 262.076 158.197 262.076C156.936 262.076 155.802 261.589 155.019 260.817M145.386 292.146C145.386 294.849 147.543 297.04 150.203 297.04C152.862 297.04 155.019 294.849 155.019 292.146V275.472" stroke="#9374FF" stroke-linecap="round" stroke-linejoin="round"/>',
                '<path d="M135.399 235.507L135.37 260.087" stroke="#9374FF" stroke-linecap="round" stroke-linejoin="round"/>',
                '<path d="M155.019 235.507V260.817" stroke="#9374FF" stroke-linecap="round" stroke-linejoin="round"/>'
            )
        );
    }

    function generateAngleImage3() internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                '<path d="M145.396 259.698V292.259" stroke="#9374FF" stroke-linecap="round" stroke-linejoin="round"/>',
                '<path fill-rule="evenodd" clip-rule="evenodd" d="M168.181 275.453H149.789C149.358 275.453 149.009 275.104 149.009 274.674V260.639C149.009 260.209 149.358 259.86 149.789 259.86H168.181C168.61 259.86 168.959 260.209 168.959 260.639V274.674C168.959 275.104 168.61 275.453 168.181 275.453Z" stroke="#9374FF" stroke-linecap="round" stroke-linejoin="round"/>',
                '<path d="M168.959 262.65L166.906 266.027L166.505 267.245C165.903 269.084 164.618 270.277 163.191 270.277H154.779C153.36 270.277 152.08 269.096 151.473 267.272L151.055 266L149.009 262.65" stroke="#9374FF" stroke-linecap="round" stroke-linejoin="round"/>'
            )
        );
    }

    function generateInvestmentAttributes(
        string memory projectName,
        uint256 totalInvestedAmount,
        uint256 myInvestedAmount
    ) internal pure returns (string memory svg) {
        string memory _totalInvested = NFTDescriptor.integerToString(
            totalInvestedAmount
        );
        string memory percentage = NFTDescriptor.pencentageString(
            myInvestedAmount,
            totalInvestedAmount
        );

        svg = string(
            abi.encodePacked(
                generateInvestmentAttribute1(percentage),
                generateInvestmentAttribute2(_totalInvested),
                generateInvestmentAttribute3(projectName)
            )
        );
    }

    function generateInvestmentAttribute1(
        string memory percentage
    ) internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                '<path fill-rule="evenodd" clip-rule="evenodd" d="M155.227 259.86H162.528V255.736H155.227V259.86Z" stroke="#9374FF" stroke-linecap="round" stroke-linejoin="round"/>',
                '<text fill="white" xml:space="preserve" style="white-space: pre" font-family="Courier New" font-size="12" letter-spacing="0em"><tspan x="32" y="381.193">% of total</tspan></text>',
                '<text fill="#9374FF" xml:space="preserve" style="white-space: pre" font-family="Courier New" font-size="12" letter-spacing="0em"><tspan x="32" y="399.193">',
                percentage,
                "</tspan></text>"
            )
        );
    }

    function generateInvestmentAttribute2(
        string memory _totalInvested
    ) internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                '<g clip-path="url(#clip1_17316_39637)">',
                '<text fill="white" xml:space="preserve" style="white-space: pre" font-family="Courier New" font-size="12" letter-spacing="0em"><tspan x="154" y="381.193">Total Invested</tspan></text>',
                '<text fill="#9374FF" xml:space="preserve" style="white-space: pre" font-family="Courier New" font-size="12" letter-spacing="0em"><tspan x="154" y="399.193">',
                _totalInvested,
                "</tspan></text>",
                "</g>"
            )
        );
    }

    function generateInvestmentAttribute3(
        string memory projectName
    ) internal pure returns (string memory svg) {
        string memory s = substring(projectName, 0, 30);
        svg = string(
            abi.encodePacked(
                '<g clip-path="url(#clip2_17316_39637)">',
                '<path fill-rule="evenodd" clip-rule="evenodd" d="M155.227 259.86H162.528V255.736H155.227V259.86Z" stroke="#9374FF" stroke-linecap="round" stroke-linejoin="round"/>',
                '<text fill="white" xml:space="preserve" style="white-space: pre" font-family="Courier New" font-size="12" letter-spacing="0em"><tspan x="32" y="433.193">Project Name</tspan></text>',
                '<text fill="#9374FF" xml:space="preserve" style="white-space: pre" font-family="Courier New" font-size="12" letter-spacing="0em"><tspan x="32" y="451.193">',
                s,
                "</tspan></text>",
                "</g></g>"
            )
        );
    }

    function generateSVGStatic() internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                "<defs>",
                generateSVGStatic1(),
                generateSVGStatic2(),
                generateSVGStatic3(),
                "</defs>"
            )
        );
    }

    function generateSVGStatic1() internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                '<filter id="filter0_f_17316_39637" x="-84" y="-84" width="458" height="668" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">',
                '<feFlood flood-opacity="0" result="BackgroundImageFix"/>',
                '<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>',
                '<feGaussianBlur stdDeviation="42" result="effect1_foregroundBlur_17316_39637"/>',
                "</filter>",
                '<filter id="filter1_f_17316_39637" x="-83" y="-168" width="456" height="336" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">',
                '<feFlood flood-opacity="0" result="BackgroundImageFix"/>',
                '<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>',
                '<feGaussianBlur stdDeviation="24" result="effect1_foregroundBlur_17316_39637"/>',
                "</filter>"
            )
        );
    }

    function generateSVGStatic2() internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                '<linearGradient id="paint0_linear_17316_39637" x1="145" y1="0" x2="145" y2="500" gradientUnits="userSpaceOnUse">',
                '<stop stop-color="#303030"/>',
                '<stop offset="1" stop-color="#1A1A1A"/>',
                "</linearGradient>",
                '<linearGradient id="paint1_linear_17316_39637" x1="145" y1="0" x2="145" y2="500" gradientUnits="userSpaceOnUse">',
                '<stop stop-color="#303030"/>',
                '<stop offset="1" stop-color="#1A1A1A"/>',
                "</linearGradient>",
                '<linearGradient id="paint2_linear_17316_39637" x1="145" y1="-120" x2="145" y2="120" gradientUnits="userSpaceOnUse">',
                '<stop stop-color="#303030"/>',
                '<stop offset="1" stop-color="#1A1A1A"/>',
                "</linearGradient>"
            )
        );
    }

    function generateSVGStatic3() internal pure returns (string memory svg) {
        svg = string(
            abi.encodePacked(
                '<clipPath id="clip0_17316_39637">',
                '<rect width="290" height="500" fill="white"/>',
                "</clipPath>",
                '<clipPath id="clip1_17316_39637">',
                '<rect width="100" height="32" fill="white" transform="translate(154 371)"/>',
                "</clipPath>",
                '<clipPath id="clip2_17316_39637">',
                '<rect width="222" height="32" fill="white" transform="translate(32 423)"/>',
                "</clipPath>"
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
        svg = string(
            abi.encodePacked(
                des,
                "\\n\\nVesting Token Symbol: ",
                symbol,
                "\\nVesting Token Contract: ",
                addressToString(tokenAddr),
                "\\nRemaining: ",
                NFTDescriptor.integerToString(remaining),
                "\\nTotal: ",
                NFTDescriptor.integerToString(total),
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

    function substring(
        string memory str,
        uint startIndex,
        uint endIndex
    ) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        if (strBytes.length <= endIndex) return str;
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }
}
