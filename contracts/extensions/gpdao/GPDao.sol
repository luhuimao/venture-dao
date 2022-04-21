pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

import "../../core/DaoRegistry.sol";
import "../IExtension.sol";
import "../../guards/AdapterGuard.sol";
import "../../helpers/DaoHelper.sol";
// import "@openzeppelin/contracts/utils/Address.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
// import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "hardhat/console.sol";

/**
MIT License

Copyright (c) 2020 Openlaw

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

contract GPDaoExtension is IExtension {
    enum AclFlag {
        REGISTER_NEW_GP,
        REMOVE_GP
    }

    enum GeneralPartnerFlag {
        EXISTS,
        EXITED
    }

    struct GeneralPartner {
        // the structure to track all the general partners in the DAO
        uint256 flags; // flags to track the state of the general partners: exists, etc
    }

    bool public initialized = false; // internally tracks deployment under eip-1167 proxy pattern

    DaoRegistry public dao;

    // delegate key => general partner address mapping
    mapping(address => address) public generalPartnerAddressesByDelegatedKey;
    mapping(address => GeneralPartner) public generalPartners; // the map to track all general partners of the DAO
    address[] private _generalPartners;

    /// @notice Clonable contract must have an empty constructor
    constructor() {}

    // slither-disable-next-line calls-loop
    modifier hasExtensionAccess(AclFlag flag) {
        require(
            address(this) == msg.sender ||
                address(dao) == msg.sender ||
                DaoHelper.isInCreationModeAndHasAccess(dao) ||
                dao.hasAdapterAccessToExtension(
                    msg.sender,
                    address(this),
                    uint8(flag)
                ),
            "gpdao::accessDenied:"
        );
        _;
    }

    /**
     * @notice Initialises the DAO
     * @dev Involves initialising available tokens, checkpoints, and membership of creator
     * @dev Can only be called once
     * @param creator The DAO's creator, who will be an initial member
     */
    function initialize(DaoRegistry _dao, address creator) external override {
        require(!initialized, "gpdao already initialized");
        require(_dao.isMember(creator), "gpdao::not member");

        dao = _dao;
        initialized = true;
    }

    /**
     * @notice Registers a general partner address in the DAO if it is not registered or invalid.
     * @dev Reverts if the generalPartnerAddress has been register
     * @param generalPartnerAddress The member whose checkpoints will be added to
     */
    function registerGeneralPartner(address generalPartnerAddress)
        external
        hasExtensionAccess(AclFlag.REGISTER_NEW_GP)
    {
        require(
            generalPartnerAddress != address(0x0),
            "invalid generalPartner address"
        );

        GeneralPartner storage generalPartner = generalPartners[
            generalPartnerAddress
        ];
        if (
            !DaoHelper.getFlag(
                generalPartner.flags,
                uint8(GeneralPartnerFlag.EXISTS)
            )
        ) {
            require(
                generalPartnerAddressesByDelegatedKey[generalPartnerAddress] ==
                    address(0x0),
                "general partner address already taken as delegated key"
            );
            generalPartner.flags = DaoHelper.setFlag(
                generalPartner.flags,
                uint8(GeneralPartnerFlag.EXISTS),
                true
            );
            generalPartnerAddressesByDelegatedKey[
                generalPartnerAddress
            ] = generalPartnerAddress;

            _generalPartners.push(generalPartnerAddress);
        }
    }

    /**
     * @notice remove a general partner address in the DAO.
     * @dev Reverts if the generalPartnerAddress has not register
     * @param generalPartnerAddress The member whose checkpoints will be added to
     */
    function removeGneralPartner(address generalPartnerAddress)
        external
        hasExtensionAccess(AclFlag.REMOVE_GP)
    {
        require(
            generalPartnerAddress != address(0x0),
            "invalid generalPartner address"
        );

        GeneralPartner storage generalPartner = generalPartners[
            generalPartnerAddress
        ];
        generalPartner.flags = DaoHelper.setFlag(
            generalPartner.flags,
            uint8(GeneralPartnerFlag.EXISTS),
            false
        );
        generalPartner.flags = DaoHelper.setFlag(
            generalPartner.flags,
            uint8(GeneralPartnerFlag.EXITED),
            true
        );
    }

    /**
     * Public read-only functions
     */
    /**
     * @return Whether or not a flag is set for a given general partner
     * @param generalPartnerAddress The general partner to check against flag
     * @param flag The flag to check in the general partner
     */
    function getGeneralPartnerFlag(
        address generalPartnerAddress,
        GeneralPartnerFlag flag
    ) public view returns (bool) {
        return
            DaoHelper.getFlag(
                generalPartners[generalPartnerAddress].flags,
                uint8(flag)
            );
    }

    /**
     * @return Whether or not a given address is a general partner of the DAO.
     * @dev it will resolve by delegate key, not member address.
     * @param addr The address to look up
     */
    function isGeneralPartner(address addr) external view returns (bool) {
        address generalPartnerAddress = generalPartnerAddressesByDelegatedKey[
            addr
        ];
        if (generalPartnerAddress == address(0x0)) {
            return false;
        } else {
            return
                getGeneralPartnerFlag(
                    generalPartnerAddress,
                    GeneralPartnerFlag.EXISTS
                );
        }
    }

    function getAllGPs() external view returns (address[] memory) {
        return _generalPartners;
    }
}
