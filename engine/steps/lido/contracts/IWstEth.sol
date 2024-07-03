pragma solidity ^0.8.13;

// from https://raw.githubusercontent.com/Renzo-Protocol/contracts-public/master/contracts/IRestakeManager.sol
// removed unused methods for import simplicity

//import "./Delegation/IOperatorDelegator.sol";
//import "./Deposits/IDepositQueue.sol";
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

interface IWstEth is IERC20 {
  function wrap(uint256 _stETHAmount) external returns (uint256);
  function unwrap(uint256 _wstETHAmount) external returns (uint256);
}
