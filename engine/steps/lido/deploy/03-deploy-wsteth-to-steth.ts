import { DeployFunction } from 'hardhat-deploy/types'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'
import { MAINNET_STETH_ADDRESS, MAINNET_WSTETH_ADDRESS } from '../tslib'
import { STEP_TYPE_ID_LIDO_WSTETH_TO_STETH } from '@freemarket/core/tslib/step-ids'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  return deployStep('LidoUnwrapAction', STEP_TYPE_ID_LIDO_WSTETH_TO_STETH, hardhatRuntimeEnv, [MAINNET_STETH_ADDRESS, MAINNET_WSTETH_ADDRESS])
}

func.tags = ['LidoUnwrapAction']
func.dependencies = ['ConfigManager']

export default func
