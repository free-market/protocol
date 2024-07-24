import { DeployFunction } from 'hardhat-deploy/types'
import { getWrappedNativeAddress } from '@freemarket/step-sdk'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'
import { ADDRESS_ZERO } from '@freemarket/core'
import { MAINNET_STETH_ADDRESS, MAINNET_WSTETH_ADDRESS } from '../tslib'
import { STEP_TYPE_ID_LIDO_STETH_TO_WSTETH } from '../../step-ids'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  return deployStep('LidoWrapAction', STEP_TYPE_ID_LIDO_STETH_TO_WSTETH, hardhatRuntimeEnv, [MAINNET_STETH_ADDRESS, MAINNET_WSTETH_ADDRESS])
}

func.tags = ['LidoWrapAction']
func.dependencies = ['ConfigManager']

export default func
