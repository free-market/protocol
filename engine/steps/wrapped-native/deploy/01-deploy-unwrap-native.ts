import { DeployFunction } from 'hardhat-deploy/types'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'
import { getWrappedNativeAddress } from '../tslib/getWrappedNativeAddress'
import { STEP_TYPE_ID_UNWRAP_NATIVE } from '../tslib/unwrap-native-helper'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  const chainId = await hardhatRuntimeEnv.getChainId()
  const wethAddress = getWrappedNativeAddress(chainId)
  console.log('deploying UnwrapNativeAction, wethAddress:', wethAddress)
  await deployStep('UnwrapNativeAction', STEP_TYPE_ID_UNWRAP_NATIVE, hardhatRuntimeEnv, [wethAddress])
}

func.tags = ['UnwrapNativeAction']
func.dependencies = ['ConfigManager']

export default func
