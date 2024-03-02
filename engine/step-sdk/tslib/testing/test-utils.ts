import type { ConfigManager, FrontDoor, WorkflowRunner} from '@freemarket/runner';
import { WorkflowRunner__factory } from '@freemarket/runner'
import merge from 'lodash.merge'
import { expect } from 'chai'
import type { HardhatRuntimeEnvironment } from 'hardhat/types'
import { type BigNumberish, type Signer } from 'ethers'
import { getCurve3PoolAddress, getCurveTriCrypto2Address } from './curve'
import { I3Pool__factory, IERC20__factory, ITriCrypto2__factory, Weth__factory } from '../../typechain-types'
import type { TransactionReceipt } from '@ethersproject/providers'
import type { ContractTransaction } from '@ethersproject/contracts'
export const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
import { assert, getLogger } from '@freemarket/core'

const logger = getLogger('testing')

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
      assert(otherUserSigner.provider)
      const blockNumber = await otherUserSigner.provider.getBlockNumber()
      const block = await otherUserSigner.provider.getBlock(blockNumber)
      const timestamp = new Date(block.timestamp * 1000)
      logger.debug(`blockNumber=${blockNumber} timestamp=${timestamp.toLocaleString()}`)

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
  const usdt = IERC20__factory.connect(usdtAddress, signer)
  const usdtBalanceBefore = await usdt.balanceOf(signerAddr)
  await (await triCrypto.exchange(2, 0, wei, 1, true, { value: wei })).wait()
  const usdtBalanceAfter = await usdt.balanceOf(signerAddr)
  const usdtBalance = usdtBalanceAfter.sub(usdtBalanceBefore)
  return { usdtAddress, usdtBalance, usdt }
}

export async function getWeth(wei: BigNumberish, signer: Signer) {
  const weth = Weth__factory.connect(WETH_ADDRESS, signer)
  await (await weth.deposit({ value: wei })).wait()
}

// coin 0 address=0x6B175474E89094C44Da98b954EedeAC495271d0F dai
// coin 1 address=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 usdc
// coin 2 address = 0xdAC17F958D2ee523a2206206994597C13D831ec7 usdt

export async function getUsdc(hardhat: HardhatRuntimeEnvironment, wei: BigNumberish, signer: Signer) {
  const [chainId, signerAddr] = await Promise.all([hardhat.getChainId(), signer.getAddress()])
  const { usdtBalance, usdt } = await getUsdt(hardhat, wei, signer)
  // console.log('usdtAddress', usdtAddress)
  // console.log('usdtBalance', usdtBalance.toString())
  const threePoolAddress = getCurve3PoolAddress(chainId)
  // console.log('threePoolAddress', threePoolAddress)
  const threePool = I3Pool__factory.connect(threePoolAddress, signer)
  // for (let i = 0; i < 3; ++i) {
  //   const addr = await threePool.coins(i)
  //   console.log(`coin ${i} address=${addr}`)
  // }
  const usdcAddress = await threePool.coins(1)
  // console.log('usdcAddress', usdcAddress)
  await (await usdt.approve(threePoolAddress, usdtBalance)).wait()
  // console.log('approved usdt')
  await (await threePool.exchange(2, 1, usdtBalance, 1, { gasLimit: 30_000_000 })).wait()
  // console.log('exchanged usdt')
  const usdc = IERC20__factory.connect(usdcAddress, signer)
  const usdcBalance = await usdc.balanceOf(signerAddr)
  // console.log('usdcBalance', usdcBalance.toString())
  return { usdcAddress, usdcBalance, usdc }
}

export async function confirmTx(ctPromise: Promise<ContractTransaction>): Promise<TransactionReceipt> {
  const ct = await ctPromise
  return ct.wait()
}
