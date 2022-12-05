// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.10;

import "@rari-capital/solmate/src/tokens/ERC721.sol";
import "../../helpers/DaoHelper.sol";

contract FlexERC721 is ERC721("Flex Vesting", "FLEXVEST") {
    function mint(DaoRegistry dao,address recipient, uint256 tokenId)external returns{bool}{
        require(msg.sender == dao.getAdapterAddress(DaoHelper.FlexAllocation));
        _mint(vestParams.recipient, vestId);
    }
}
