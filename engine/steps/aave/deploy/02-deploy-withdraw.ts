/* eslint-disable no-console */
import { DeployFunction } from 'hardhat-deploy/types'
import { STEP_TYPE_ID_AAVE_WITHDRAW } from '../tslib/withdraw-helper'
import { getWrappedNativeAddress } from '@freemarket/step-sdk'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'
import { getPoolAddress } from '../tslib/getPoolAddress'
import { MockAavePool__factory } from '../typechain-types'
import { ADDRESS_ZERO } from '@freemarket/core'

const func: DeployFunction = async function (hre) {
  const chainId = await hre.getChainId()
  let poolAddress = getPoolAddress(chainId)
  if (!poolAddress) {
    console.log(`deploying mock AavePool for chainId: ${chainId}`)
    const signer = await hre.ethers.getNamedSigner('deployer')
    const mockPool = await new MockAavePool__factory(signer).deploy()
    console.log(`mockPool deployed to ${mockPool.address}`)
    const mockAToken = await mockPool.mockAToken()
    console.log(`mockAToken deployed to ${mockAToken}`)
    poolAddress = mockPool.address
  } else {
    console.log(`using existing AavePool at ${poolAddress}`)
  }
  const wethAddress = getWrappedNativeAddress(chainId) || ADDRESS_ZERO
  await deployStep('AaveWithdrawAction', STEP_TYPE_ID_AAVE_WITHDRAW, hre, [poolAddress, wethAddress])
}

func.tags = ['AaveWithdrawAction']
func.dependencies = ['ConfigManager']

export default func
