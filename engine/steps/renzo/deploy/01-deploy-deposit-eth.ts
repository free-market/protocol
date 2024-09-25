import { DeployFunction } from 'hardhat-deploy/types'
import { getWrappedNativeAddress } from '@freemarket/step-sdk'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'
import { ADDRESS_ZERO } from '@freemarket/core'
import { MAINNET_EZETH_ADDRESS, MAINNET_RESTAKING_MANAGER_ADDRESS } from '../tslib'
import { STEP_TYPE_ID_RENZO_ETH_TO_EZETH } from '@freemarket/core/tslib/step-ids'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  const chainId = await hardhatRuntimeEnv.getChainId()
  const wethAddress = getWrappedNativeAddress(chainId) || ADDRESS_ZERO
  return deployStep('DepositEthForEZEthAction', STEP_TYPE_ID_RENZO_ETH_TO_EZETH, hardhatRuntimeEnv, [MAINNET_RESTAKING_MANAGER_ADDRESS, MAINNET_EZETH_ADDRESS])
}

func.tags = ['DepositEthForEZEthAction']
func.dependencies = ['ConfigManager']

export default func
