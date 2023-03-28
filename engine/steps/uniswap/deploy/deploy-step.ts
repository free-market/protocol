import { DeployFunction } from 'hardhat-deploy/types'
import { STEP_TYPE_ID } from '../tslib/helper'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'
import { getCurveTriCrypto2Address } from '@freemarket/step-sdk/tslib/testing'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  const chainId = await hardhatRuntimeEnv.getChainId()
  const poolAddress = getCurveTriCrypto2Address(chainId)
  return deployStep('UniswapExactInAction', STEP_TYPE_ID, hardhatRuntimeEnv, [poolAddress])
}

func.tags = ['UniswapExactInAction']
func.dependencies = ['WorkflowRunner']

export default func
