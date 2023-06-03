import { DeployFunction } from 'hardhat-deploy/types'
import { STEP_TYPE_ID } from '../tslib/helper'
import { deployStep, getWrappedNativeAddress } from '@freemarket/step-sdk'
import { getPoolAddress } from '../tslib/getPoolAddress'
import { MockAavePool__factory } from '../typechain-types'
import { ADDRESS_ZERO } from '@freemarket/core'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  const chainId = await hardhatRuntimeEnv.getChainId()
  let poolAddress = getPoolAddress(chainId)
  if (!poolAddress) {
    console.log(`deploying mock AavePool for chainId: ${chainId}`)
    const signer = await hardhatRuntimeEnv.ethers.getNamedSigner('deployer')
    const mockPool = await new MockAavePool__factory(signer).deploy()
    console.log(`mockPool deployed to ${mockPool.address}`)
    const mockAToken = await mockPool.mockAToken()
    console.log(`mockAToken deployed to ${mockAToken}`)
    poolAddress = mockPool.address
  } else {
    console.log(`using existing AavePool at ${poolAddress}`)
  }
  const wethAddress = getWrappedNativeAddress(chainId) || ADDRESS_ZERO
  await deployStep('AaveSupplyAction', STEP_TYPE_ID, hardhatRuntimeEnv, [poolAddress, wethAddress])
}

func.tags = ['AaveSupplyAction']
func.dependencies = ['ConfigManager']

export default func
