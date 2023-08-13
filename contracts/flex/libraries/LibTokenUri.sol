// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Base64} from "./LibBase64.sol";

library LibTokenUri {
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

    function svg(
        string memory tokenName,
        uint256 percent_,
        uint256 remaining_,
        uint256 total_
    ) internal pure returns (string memory output) {
        string memory _remaining = uintToString(remaining_);
        string memory remaining = string(
            abi.encodePacked("REMAINING: ", _remaining, " ", tokenName)
        );

        string memory percent = string(
            abi.encodePacked(uintToString(percent_), "%")
        );

        string memory _total = uintToString(total_);
        string memory total = string(
            abi.encodePacked("TOTAL: ", _total, " ", tokenName)
        );

        string memory name = string(abi.encodePacked(tokenName, " VESTING"));

        output = '<svg width="500" height="500" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="500" height="500" fill="url(#paint0_linear_10683_221186)"/><text fill="#1E2230" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="16" letter-spacing="0em"><tspan x="40" y="228.318">';
        output = string(
            abi.encodePacked(
                output,
                remaining,
                '</tspan></text><text fill="#1E2230" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="64" font-weight="bold" letter-spacing="0em"><tspan x="40" y="181.773">'
            )
        );
        output = string(
            abi.encodePacked(
                output,
                percent,
                '</tspan></text><text fill="#1E2230" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="12" font-style="italic" font-weight="500" letter-spacing="0em"><tspan x="289.609" y="446.364">POWERED&#10;</tspan><tspan x="332.934" y="458.364">BY</tspan></text><text fill="#1E2230" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="16" letter-spacing="0em"><tspan x="40" y="255.318">'
            )
        );

        output = string(
            abi.encodePacked(
                output,
                total,
                '</tspan></text><text fill="#1E2230" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="32" font-weight="bold" letter-spacing="0em"><tspan x="40" y="310.636">'
            )
        );

        output = string(
            abi.encodePacked(
                output,
                name,
                '</tspan></text><image x="360" y="399" href="https://daosquare-incubator.s3.ap-southeast-1.amazonaws.com/incubator-logo.svg" height="100" width="100"/><image href="https://daosquare-incubator.s3.ap-southeast-1.amazonaws.com/vesting-logo.svg" height="58" widht="58" x="38" y="40" /><defs><linearGradient id="paint0_linear_10683_221186" x1="250.444" y1="-104.701" x2="-66.9517" y2="500.685" gradientUnits="userSpaceOnUse"><stop stop-color="#FDAE8F"/><stop offset="1" stop-color="#FD1C68"/></linearGradient><clipPath id="clip0_10683_221186"><rect width="56" height="56" fill="white" transform="translate(40 40)"/></clipPath></defs></svg>'
            )
        );
    }

    function tokenURI(
        string memory description,
        string memory tokenName,
        uint256 percent_,
        uint256 remaining_,
        uint256 total_
    ) internal pure returns (string memory) {
        string memory _svg = svg(tokenName, percent_, remaining_, total_);
        string memory image = string(
            abi.encodePacked(
                "data:image/svg+xml;base64,",
                Base64.encode(bytes(_svg))
            )
        );
        string memory name = string(abi.encodePacked(tokenName, " Vesting"));

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name,
                                '", "description":"',
                                description,
                                '", "image": "',
                                "data:image/svg+xml;base64,",
                                image,
                                '"}'
                            )
                        )
                    )
                )
            );
    }
}
