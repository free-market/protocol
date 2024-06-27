import { DeployFunction } from 'hardhat-deploy/types'
import { getWrappedNativeAddress } from '@freemarket/step-sdk'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'
import { ADDRESS_ZERO } from '@freemarket/core'
import { STEP_TYPE_ID_LIDO_ETH_TO_STETH, MAINNET_STETH_ADDRESS } from '../tslib'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  const chainId = await hardhatRuntimeEnv.getChainId()
  const wethAddress = getWrappedNativeAddress(chainId) || ADDRESS_ZERO
  return deployStep('DepositEthForStEthAction', STEP_TYPE_ID_LIDO_ETH_TO_STETH, hardhatRuntimeEnv, [MAINNET_STETH_ADDRESS])
}

func.tags = ['DepositEthForStEthAction']
func.dependencies = ['ConfigManager']

export default func
