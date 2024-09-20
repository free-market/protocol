import { DeployFunction } from 'hardhat-deploy/types'
import { STEP_TYPE_ID_AAVE_REPAY } from '@freemarket/core/tslib/step-ids'
import { getWrappedNativeAddress } from '@freemarket/step-sdk'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'
import { ADDRESS_ZERO, assert } from '@freemarket/core'
import { getPoolAddressProviderAddress } from '../tslib/getPoolAddressProviderAddress'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  const chainId = await hardhatRuntimeEnv.getChainId()
  let poolAddressProviderAddress = getPoolAddressProviderAddress(chainId)
  assert(poolAddressProviderAddress)
  const wethAddress = getWrappedNativeAddress(chainId) || ADDRESS_ZERO
  await deployStep('AaveRepayAction', STEP_TYPE_ID_AAVE_REPAY, hardhatRuntimeEnv, [poolAddressProviderAddress, wethAddress])
}

func.tags = ['AaveRepayAction']
func.dependencies = ['ConfigManager']

export default func
