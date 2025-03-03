pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
MIT License
**/

contract ERC20TokenDecimals is ERC20 {
    uint8 private _decimals;

    constructor(
        uint256 _totalSupply,
        uint8 decimals
    ) ERC20("United States Department of the Treasury", "USDT") {
        _decimals = decimals;
        _mint(msg.sender, _totalSupply * (10 ** uint256(_decimals)));
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }
}
