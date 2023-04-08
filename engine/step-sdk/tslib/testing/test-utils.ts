import { ConfigManager, FrontDoor, WorkflowRunner, WorkflowRunner__factory } from '@freemarket/runner'
import merge from 'lodash.merge'
import { expect } from 'chai'
import type { HardhatRuntimeEnvironment } from 'hardhat/types'
import type { BigNumberish, Signer } from 'ethers'
import { getCurveTriCrypto2Address } from './curve'
import { IERC20__factory, ITriCrypto2__factory, Weth__factory } from '../../typechain-types'

export const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

interface BaseTestFixture {
  contracts: {
    frontDoor: FrontDoor
    workflowRunner: WorkflowRunner
    userWorkflowRunner: WorkflowRunner
    configManager: ConfigManager
  }
  users: {
    deployer: string
    otherUser: string
  }
  signers: {
    deployerSigner: Signer
    otherUserSigner: Signer
  }
}

export function getTestFixture<T>(hardhat: HardhatRuntimeEnvironment, localFunc: (baseFixture: BaseTestFixture) => Promise<T>) {
  const { ethers, deployments, getNamedAccounts } = hardhat
  return deployments.createFixture(async () => {
    {
      const [_deployResult, users] = await Promise.all([deployments.fixture('WorkflowRunner'), getNamedAccounts()])
      const [frontDoor, configManager, deployerSigner, otherUserSigner] = await Promise.all([
        <Promise<FrontDoor>>ethers.getContract('FrontDoor'),
        <Promise<ConfigManager>>ethers.getContract('ConfigManager'),
        ethers.getSigner(users.deployer),
        ethers.getSigner(users.otherUser),
      ])
      const workflowRunner = WorkflowRunner__factory.connect(frontDoor.address, deployerSigner)
      const userWorkflowRunner = WorkflowRunner__factory.connect(frontDoor.address, otherUserSigner)

      const baseFixture: BaseTestFixture = {
        signers: { deployerSigner, otherUserSigner },
        contracts: { frontDoor, workflowRunner, userWorkflowRunner, configManager },
        users: { deployer: users.deployer, otherUser: users.otherUser },
      }

      const localResult = await localFunc(baseFixture)
      const rv = merge({}, baseFixture, localResult)
      return rv
    }
  })
}

export async function validateAction(configManager: ConfigManager, stepTypeId: number, stepAddress: string) {
  // should be there when you ask for the address directly
  const registeredAddress = await configManager.getStepAddress(stepTypeId)
  expect(registeredAddress).to.equal(stepAddress)

  // should be present in the enumeration
  let found = false
  const actionCount = (await configManager.getStepCount()).toNumber()
  for (let i = 0; i < actionCount; ++i) {
    const actionInfo = await configManager.getStepInfoAt(i)
    if (Number(actionInfo.stepTypeId) === stepTypeId) {
      expect(actionInfo.whitelist.includes(stepAddress)).to.be.true
      found = true
      break
    }
  }
  expect(found).to.be.true
}

export async function getUsdt(hardhat: HardhatRuntimeEnvironment, wei: BigNumberish, signer: Signer) {
  const [chainId, signerAddr] = await Promise.all([hardhat.getChainId(), signer.getAddress()])
  const triCryptoAddress = getCurveTriCrypto2Address(chainId)
  const triCrypto = ITriCrypto2__factory.connect(triCryptoAddress, signer)
  const usdtAddress = await triCrypto.coins(0)
  await (await triCrypto.exchange(2, 0, wei, 1, true, { value: wei })).wait()
  const usdt = IERC20__factory.connect(usdtAddress, signer)
  const usdtBalance = await usdt.balanceOf(signerAddr)
  return { usdtAddress, usdtBalance, usdt }
}
export async function getWeth(wei: BigNumberish, signer: Signer) {
  const weth = Weth__factory.connect(WETH_ADDRESS, signer)
  await (await weth.deposit({ value: wei })).wait()
}
