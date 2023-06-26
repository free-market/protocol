import { DeployFunction } from 'hardhat-deploy/types'
import { STEP_TYPE_ID_AAVE_BORROW } from '../tslib/borrow-helper'
import { deployStep, getWrappedNativeAddress } from '@freemarket/step-sdk'
import { ADDRESS_ZERO, assert } from '@freemarket/core'
import { getPoolAddressProviderAddress } from '../tslib/getPoolAddressProviderAddress'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  const chainId = await hardhatRuntimeEnv.getChainId()
  let poolAddressProviderAddress = getPoolAddressProviderAddress(chainId)
  assert(poolAddressProviderAddress)
  // const signer = await hardhatRuntimeEnv.ethers.getNamedSigner('deployer')
  //   console.log(`deploying mock AavePool for chainId: ${chainId}`)
  //   const mockPool = await new MockAavePool__factory(signer).deploy()
  //   console.log(`mockPool deployed to ${mockPool.address}`)
  //   const mockAToken = await mockPool.mockAToken()
  //   console.log(`mockAToken deployed to ${mockAToken}`)
  //   poolAddress = mockPool.address
  // } else {
  //   console.log(`using existing AavePool at ${poolAddress}`)
  // }
  const wethAddress = getWrappedNativeAddress(chainId) || ADDRESS_ZERO
  await deployStep('AaveBorrowAction', STEP_TYPE_ID_AAVE_BORROW, hardhatRuntimeEnv, [poolAddressProviderAddress, wethAddress])
}

func.tags = ['AaveBorrowAction']
func.dependencies = ['ConfigManager']

export default func
