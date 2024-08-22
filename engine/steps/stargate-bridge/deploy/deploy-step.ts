import { DeployFunction } from 'hardhat-deploy/types'
import { STEP_FLAG_CAN_CONTINUE, STEP_TYPE_ID_STARGATE_BRIDGE } from '../../step-ids'
import { deployStep, getFrontDoorAddress } from '@freemarket/step-sdk/tslib/deploy-step'
import { getStargateComposerAddress } from '../tslib/stargateContractAddresses'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  const frontDoorAddress = await getFrontDoorAddress(hardhatRuntimeEnv)
  const chainId = await hardhatRuntimeEnv.getChainId()
  const sgComposerAddress = getStargateComposerAddress(parseInt(chainId))
  return deployStep('StargateBridgeAction', STEP_TYPE_ID_STARGATE_BRIDGE, hardhatRuntimeEnv, [frontDoorAddress, sgComposerAddress], STEP_FLAG_CAN_CONTINUE)
}

func.tags = ['StargateBridgeAction']
func.dependencies = ['ConfigManager']

export default func
