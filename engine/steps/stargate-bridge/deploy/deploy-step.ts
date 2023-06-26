import { DeployFunction } from 'hardhat-deploy/types'
import { STEP_TYPE_ID_STARGATE_BRIDGE } from '../tslib/helper'
import { deployStep, getFrontDoorAddress } from '@freemarket/step-sdk/tslib/deploy-step'
import { getRouterAddress } from '../tslib/getRouterAddress'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  const frontDoorAddress = await getFrontDoorAddress(hardhatRuntimeEnv)
  const chainId = await hardhatRuntimeEnv.getChainId()
  const sgRouterAddress = getRouterAddress(chainId)
  return deployStep('StargateBridgeAction', STEP_TYPE_ID_STARGATE_BRIDGE, hardhatRuntimeEnv, [frontDoorAddress, sgRouterAddress])
}

func.tags = ['StargateBridgeAction']
func.dependencies = ['ConfigManager']

export default func
