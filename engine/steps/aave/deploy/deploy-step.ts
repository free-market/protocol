import { DeployFunction } from 'hardhat-deploy/types'
import { STEP_TYPE_ID } from '../tslib/helper'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'
import { getPoolAddress } from '../tslib/getPoolAddress'
import { MockAavePool__factory } from '../typechain-types'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  const chainId = await hardhatRuntimeEnv.getChainId()
  let poolAddress = getPoolAddress(chainId)
  if (!poolAddress) {
    console.log(`deploying mock AavePool for chainId: ${chainId}`)
    const signer = await hardhatRuntimeEnv.ethers.getNamedSigner('deployer')
    const mockPool = await (await new MockAavePool__factory(signer).deploy()).deployed()
    poolAddress = mockPool.address
  }
  return deployStep('AaveSupplyAction', STEP_TYPE_ID, hardhatRuntimeEnv, [poolAddress])
}

func.tags = ['AaveSupplyAction']
func.dependencies = ['ConfigManager']

export default func
