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
    using EnumerableSet for EnumerableSet.AddressSet;
    enum AclFlag {
        REGISTER_NEW_GP,
        REMOVE_GP
    }

    bool public initialized = false; // internally tracks deployment under eip-1167 proxy pattern

    DaoRegistry public dao;

    EnumerableSet.AddressSet private _generalPartners;

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
     * @param newGeneralPartnerAddress The member whose checkpoints will be added to
     */
    function registerGeneralPartner(address newGeneralPartnerAddress)
        external
        hasExtensionAccess(AclFlag.REGISTER_NEW_GP)
    {
        require(
            newGeneralPartnerAddress != address(0x0),
            "invalid generalPartner address"
        );

        if (!_generalPartners.contains(newGeneralPartnerAddress)) {
            _generalPartners.add(newGeneralPartnerAddress);
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

        _generalPartners.remove(generalPartnerAddress);
    }

    /**
     * Public read-only functions
     */

    /**
     * @return Whether or not a given address is a general partner of the DAO.
     * @dev it will resolve by delegate key, not member address.
     * @param addr The address to look up
     */
    function isGeneralPartner(address addr) external view returns (bool) {
        return _generalPartners.contains(addr);
    }

    function getAllGPs() external view returns (address[] memory) {
        return _generalPartners.values();
    }
}
