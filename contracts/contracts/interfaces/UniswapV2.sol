// SPDX-License-Identifier: MIT
pragma solidity >=0.4.25 <0.9.0;

interface IUniswap {
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts);
    function WETH() external pure returns (address);
}
