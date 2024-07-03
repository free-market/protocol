import { DeployFunction } from 'hardhat-deploy/types'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'
import { STEP_TYPE_ID_LIDO_WSTETH_TO_STETH, MAINNET_STETH_ADDRESS, MAINNET_WSTETH_ADDRESS } from '../tslib'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  return deployStep('LidoUnwrapAction', STEP_TYPE_ID_LIDO_WSTETH_TO_STETH, hardhatRuntimeEnv, [MAINNET_STETH_ADDRESS, MAINNET_WSTETH_ADDRESS])
}

func.tags = ['LidoUnwrapAction']
func.dependencies = ['ConfigManager']

export default func
