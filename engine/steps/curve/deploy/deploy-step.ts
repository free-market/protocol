import { DeployFunction } from 'hardhat-deploy/types'
import { STEP_TYPE_ID } from '../tslib/helper'
import { deployStep } from '@freemarket/step-sdk'
import { getTriCrypto2Address } from '../tslib/tryCrypto2'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  const frontDoor = await hardhatRuntimeEnv.ethers.getContract('FrontDoor')
  const chainId = await hardhatRuntimeEnv.getChainId()
  const poolAddress = getTriCrypto2Address(chainId)
  return deployStep('CurveTriCrypto2SwapAction', STEP_TYPE_ID, hardhatRuntimeEnv, [poolAddress])
}

func.tags = ['AaveSupplyAction']
func.dependencies = ['WorkflowRunner']

export default func
