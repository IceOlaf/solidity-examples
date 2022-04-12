// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.4;

import "../token/oft/extension/BasedOFT.sol";

/// @title A LayerZero OmnichainFungibleToken example
/// @notice You can use this to mint OFT and transfer across chain
contract OmnichainFungibleToken is BasedOFT {
    constructor(address _layerZeroEndpoint, uint _initialSupply) BasedOFT("LZOmnichainFungibleToken", "LZOFT", _layerZeroEndpoint, _initialSupply) {}
}
