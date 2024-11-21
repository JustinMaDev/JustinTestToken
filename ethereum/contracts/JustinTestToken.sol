// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract JustinTestToken is ERC20 {
    constructor() ERC20("JustinTestToken", "JTT") {}

    //This is a test token, so eneryone can mint it
    function mint(address account, uint256 amount)public {
        _mint(account, amount);
    }
}