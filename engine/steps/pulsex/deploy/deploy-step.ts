import { DeployFunction } from 'hardhat-deploy/types'
import { STEP_TYPE_ID_PULSEX_EXACT_IN } from '../tslib/helper'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'
import { getWrappedNativeAddress } from '@freemarket/step-sdk/tslib/getWrappedNativeAddress'
import { ADDRESS_ZERO } from '@freemarket/core'

const SWAP_ROUTER_02_ADDRESS = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  const chainId = await hardhatRuntimeEnv.getChainId()
  const wethAddress = getWrappedNativeAddress(chainId) || ADDRESS_ZERO
  return deployStep('PulsexExactInAction', STEP_TYPE_ID_PULSEX_EXACT_IN, hardhatRuntimeEnv, [SWAP_ROUTER_02_ADDRESS, wethAddress])
}

func.tags = ['PulsexExactInAction']
func.dependencies = ['ConfigManager']

export default func
