// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

interface IFeeTransmutation {
    function receiveProtocolFee(
        address token,
        uint amount,
        address contributor,
        address claimer
    ) external;

    function transmutation() external returns (bool swapSuccess);

    function claim() external;
}
