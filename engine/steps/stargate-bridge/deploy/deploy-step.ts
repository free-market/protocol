import { DeployFunction } from 'hardhat-deploy/types'
import { STEP_TYPE_ID } from '../tslib/helper'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'
import { getRouterAddress } from '../tslib/getRouterAddress'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  const frontDoor = await hardhatRuntimeEnv.ethers.getContract('FrontDoor')
  const chainId = await hardhatRuntimeEnv.getChainId()
  const sgRouterAddress = getRouterAddress(chainId)
  return deployStep('StargateBridgeAction', STEP_TYPE_ID, hardhatRuntimeEnv, [frontDoor.address, sgRouterAddress])
}

func.tags = ['StargateBridgeAction']
func.dependencies = ['WorkflowRunner']

export default func
