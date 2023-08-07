// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@freemarket/core/contracts/model/WorkflowStep.sol';
import 'hardhat/console.sol';

struct ChainBranchParams {
  uint256 chainId;
  int16 ifYes;
}

library ChainBranch {
  function getNextStepIndex(WorkflowStep memory currentStep) internal view returns (int16) {
    ChainBranchParams memory args = abi.decode(currentStep.argData, (ChainBranchParams));
    if (args.chainId == block.chainid) {
      console.log('returing ifYes');
      console.logInt(args.ifYes);
      return args.ifYes;
    }
    console.log('returing nextStepIndex');
    console.logInt(currentStep.nextStepIndex);
    return currentStep.nextStepIndex;
  }
}
