import { DeployFunction } from 'hardhat-deploy/types'
import { STEP_TYPE_ID_WRAP_NATIVE } from '../tslib/wrap-native-helper'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'
import { getWrappedNativeAddress } from '@freemarket/step-sdk/tslib/getWrappedNativeAddress'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  const chainId = await hardhatRuntimeEnv.getChainId()
  const wethAddress = getWrappedNativeAddress(chainId)
  await deployStep('WrapNativeAction', STEP_TYPE_ID_WRAP_NATIVE, hardhatRuntimeEnv, [wethAddress])
}

func.tags = ['WrapNativeAction']
func.dependencies = ['ConfigManager']

export default func
