import { DeployFunction } from 'hardhat-deploy/types'
import { STEP_TYPE_ID_PHIAT_SUPPLY } from '../tslib/helper'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'
import { getPoolAddress } from '../tslib/getPoolAddress'
import { MockPhiatPool__factory } from '../typechain-types'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  const chainId = await hardhatRuntimeEnv.getChainId()
  let poolAddress = getPoolAddress(chainId)
  if (!poolAddress) {
    console.log(`deploying mock PhiatPool for chainId: ${chainId}`)
    const signer = await hardhatRuntimeEnv.ethers.getNamedSigner('deployer')
    const mockPool = await new MockPhiatPool__factory(signer).deploy()
    console.log(`mockPool deployed to ${mockPool.address}`)
    const mockAToken = await mockPool.mockAToken()
    console.log(`mockAToken deployed to ${mockAToken}`)
    poolAddress = mockPool.address
  }
  await deployStep('PhiatSupplyAction', STEP_TYPE_ID_PHIAT_SUPPLY, hardhatRuntimeEnv, [poolAddress])
}

func.tags = ['PhiatSupplyAction']
func.dependencies = ['ConfigManager']

export default func
