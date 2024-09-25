import { DeployFunction } from 'hardhat-deploy/types'
import { STEP_TYPE_ID_UNISWAP_ADD_LIQUIDITY } from '@freemarket/core/tslib/step-ids'
import { getWrappedNativeAddress } from '@freemarket/step-sdk'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'
import { ADDRESS_ZERO } from '@freemarket/core'
import { SWAP_ROUTER_02_ADDRESS } from '../tslib'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  const chainId = await hardhatRuntimeEnv.getChainId()
  const wethAddress = getWrappedNativeAddress(chainId) || ADDRESS_ZERO
  return deployStep('UniswapAddLiquidityAction', STEP_TYPE_ID_UNISWAP_ADD_LIQUIDITY, hardhatRuntimeEnv, [SWAP_ROUTER_02_ADDRESS, wethAddress])
}

func.tags = ['UniswapAddLiquidityAction']
func.dependencies = ['ConfigManager']

export default func
