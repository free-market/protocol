// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.13;

// from https://raw.githubusercontent.com/Renzo-Protocol/contracts-public/master/contracts/IRestakeManager.sol

//import "./Delegation/IOperatorDelegator.sol";
//import "./Deposits/IDepositQueue.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IRestakeManager {
    /*
    function stakeEthInOperatorDelegator(
        IOperatorDelegator operatorDelegator,
        bytes calldata pubkey,
        bytes calldata signature,
        bytes32 depositDataRoot
    ) external payable;
    */
    function depositTokenRewardsFromProtocol(IERC20 _token, uint256 _amount) external;
    //function depositQueue() external view returns (IDepositQueue);

    function calculateTVLs() external view returns (uint256[][] memory, uint256[] memory, uint256);

    function depositETH() external payable;
}