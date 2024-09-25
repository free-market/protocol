import { DeployFunction } from 'hardhat-deploy/types'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'
import { MAINNET_STETH_ADDRESS, MAINNET_WSTETH_ADDRESS } from '../../lido/tslib'
import { STEP_TYPE_ID_LIDO_STETH_TO_WSTETH } from '@freemarket/core/tslib/step-ids'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  return deployStep('LidoWrapAction', STEP_TYPE_ID_LIDO_STETH_TO_WSTETH, hardhatRuntimeEnv, [MAINNET_STETH_ADDRESS, MAINNET_WSTETH_ADDRESS])
}

func.tags = ['LidoWrapAction']
func.dependencies = ['ConfigManager']

export default func
