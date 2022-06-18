// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8;

import "../token/ONFT721/ONFT721Upgradeable.sol";

contract ONFT721UpgradeableMock is ONFT721Upgradeable {

    function initialize(string memory _name, string memory _symbol, address _lzEndpoint) public initializer {
        __ONFT721UpgradeableMock_init(_name, _symbol, _lzEndpoint);
    }

    function __ONFT721UpgradeableMock_init(string memory _name, string memory _symbol, address _lzEndpoint) public onlyInitializing {
        __ONFT721Upgradeable_init_unchained(_name, _symbol, _lzEndpoint);
        __ONFT721UpgradeableMock_init_unchained(_name, _symbol, _lzEndpoint);
    }

    function __ONFT721UpgradeableMock_init_unchained(string memory _name, string memory _symbol, address _lzEndpoint) public onlyInitializing {
    }

    function mint(address _tokenOwner, uint _newId) external payable {
        _safeMint(_tokenOwner, _newId);
    }
}
