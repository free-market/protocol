import { DeployFunction } from 'hardhat-deploy/types'
import { STEP_TYPE_ID } from '../tslib/helper'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'
import { getCurveTriCrypto2Address } from '@freemarket/step-sdk/tslib/testing'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  const chainId = await hardhatRuntimeEnv.getChainId()
  const contractAddress = getCurveTriCrypto2Address(chainId)
  return deployStep('CurveTriCrypto2SwapAction', STEP_TYPE_ID, hardhatRuntimeEnv, [contractAddress])
}

func.tags = ['AaveSupplyAction']
func.dependencies = ['WorkflowRunner']

export default func
