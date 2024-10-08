pragma solidity ^0.8.0;
import "../../../helpers/DaoHelper.sol";
// SPDX-License-Identifier: MIT

/**
 * @title ISablier
 * @author Sablier
 */
interface ISablier {
    /**
     * @notice Emits when a stream is successfully created.
     */
    event CreateStream(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        bytes32 proposalId,
        uint256 deposit,
        address tokenAddress,
        uint256 startTime,
        uint256 stopTime
    );

    /**
     * @notice Emits when the recipient of a stream withdraws a portion or all their pro rata share of the stream.
     */
    event WithdrawFromStream(
        uint256 indexed streamId,
        address indexed recipient,
        uint256 amount
    );

    /**
     * @notice Emits when a stream is successfully cancelled and tokens are transferred back on a pro rata basis.
     */
    // event CancelStream(
    //     uint256 indexed streamId,
    //     address indexed sender,
    //     address indexed recipient,
    //     uint256 senderBalance,
    //     uint256 recipientBalance
    // );

    function balanceOf(uint256 streamId, address who)
        external
        view
        returns (uint256 balance);

    function getStream(uint256 streamId)
        external
        view
        returns (
            address sender,
            address recipient,
            uint256 deposit,
            address token,
            uint256 startTime,
            uint256 stopTime,
            uint256 remainingBalance,
            uint256 ratePerSecond,
            bytes32 proposalId
        );

    function createStream(
        DaoRegistry dao,
        address recipient,
        // uint256 deposit,
        // address tokenAddress,
        // uint256 startTime,
        // uint256 stopTime,
        bytes32 proposalId
    ) external returns (uint256 streamId);

    function withdrawFromStream(
        uint256 streamId,
        uint256 funds
    ) external returns (bool);

    // function cancelStream(uint256 streamId) external returns (bool);
}
