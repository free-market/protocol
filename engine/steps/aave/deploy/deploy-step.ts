import { DeployFunction } from 'hardhat-deploy/types'
import { STEP_TYPE_ID } from '../tslib/helper'
import { deployStep } from '@freemarket/step-sdk'
import { getPoolAddress } from '../tslib/getPoolAddress'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  const frontDoor = await hardhatRuntimeEnv.ethers.getContract('FrontDoor')
  const chainId = await hardhatRuntimeEnv.getChainId()
  const poolAddress = getPoolAddress(chainId)
  return deployStep('AaveSupplyAction', STEP_TYPE_ID, hardhatRuntimeEnv, [poolAddress])
}

func.tags = ['AaveSupplyAction']
func.dependencies = ['WorkflowRunner']

export default func
