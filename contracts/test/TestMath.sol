pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import {ABDKMath64x64} from "abdk-libraries-solidity/ABDKMath64x64.sol";
import "hardhat/console.sol";

/**
MIT License

Copyright (c) 2022 Benjamin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */
contract TestMath {
    function log_2(uint256 x) external view returns (uint128) {
        return
            ABDKMath64x64.toUInt(
                ABDKMath64x64.log_2(ABDKMath64x64.fromUInt(x))
            );
    }

    function ln(uint256 x) external pure returns (int128) {
        return ABDKMath64x64.ln(ABDKMath64x64.fromUInt(x));
    }

    function fromUInt(uint256 x) external returns (int128) {
        console.log(0x7FFFFFFFFFFFFFFF);
        return ABDKMath64x64.fromUInt(x);
    }
}
