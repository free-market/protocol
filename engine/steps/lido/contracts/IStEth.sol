// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.13;

// from https://raw.githubusercontent.com/Renzo-Protocol/contracts-public/master/contracts/IRestakeManager.sol
// removed unused methods for import simplicity

//import "./Delegation/IOperatorDelegator.sol";
//import "./Deposits/IDepositQueue.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IStEth is IERC20 {
    /**
     * @notice Send funds to the pool with optional _referral parameter
     * @dev This function is alternative way to submit funds. Supports optional referral address.
     * @return Amount of StETH shares generated
     */
    function submit(address _referral) external payable returns (uint256);
}