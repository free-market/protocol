import { DeployFunction } from 'hardhat-deploy/types'
import { getWrappedNativeAddress } from '@freemarket/step-sdk'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'
import { ADDRESS_ZERO } from '@freemarket/core'
import { MAINNET_PENDLE_ROUTER, MAINNET_PENDLE_ROUTER_STATIC } from '../tslib'
import { STEP_TYPE_ID_PENDLE_TOKEN_TO_PTYT } from '../../step-ids'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  const chainId = await hardhatRuntimeEnv.getChainId()
  const wethAddress = getWrappedNativeAddress(chainId) || ADDRESS_ZERO
  return deployStep('PendleSwapToken', STEP_TYPE_ID_PENDLE_TOKEN_TO_PTYT, hardhatRuntimeEnv, [MAINNET_PENDLE_ROUTER, MAINNET_PENDLE_ROUTER_STATIC])
}

func.tags = ['PendleSwapToken']
func.dependencies = ['ConfigManager', 'DepositEthForStEthAction']

export default func
