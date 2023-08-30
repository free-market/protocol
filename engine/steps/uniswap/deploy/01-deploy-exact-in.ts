import { DeployFunction } from 'hardhat-deploy/types'
import { STEP_TYPE_ID_UNISWAP_EXACT_IN } from '../tslib/UniswapExactInHelper'
import { getWrappedNativeAddress } from '@freemarket/step-sdk'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'
import { ADDRESS_ZERO } from '@freemarket/core'
import { SWAP_ROUTER_02_ADDRESS } from '../tslib'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  const chainId = await hardhatRuntimeEnv.getChainId()
  const wethAddress = getWrappedNativeAddress(chainId) || ADDRESS_ZERO
  return deployStep('UniswapExactInAction', STEP_TYPE_ID_UNISWAP_EXACT_IN, hardhatRuntimeEnv, [SWAP_ROUTER_02_ADDRESS, wethAddress])
}

func.tags = ['UniswapExactInAction']
func.dependencies = ['ConfigManager']

export default func
