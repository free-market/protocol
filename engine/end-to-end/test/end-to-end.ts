import { expect } from 'chai'
import hardhat from 'hardhat'
import { IERC20__factory, WorkflowRunner, WorkflowRunner__factory } from '@freemarket/runner'
import { createStandardProvider, Workflow, WorkflowInstance } from '@freemarket/client-sdk'
const { ethers, deployments, getNamedAccounts } = hardhat
import { AaveSupplyAction__factory, IAaveV3Pool__factory } from '@freemarket/aave'
import frontDoorAddressesJson from '@freemarket/runner/deployments/front-doors.json'
const frontDoorAddresses: Record<string, string> = frontDoorAddressesJson

const shouldRunE2e = () => {
  const e2e = process.env.E2E?.toLowerCase()
  if (!e2e) {
    return false
  }
  return ['true', 't', 'yes', 'y', '1'].includes(e2e)
}

const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

const setup = deployments.createFixture(async () => {
  const { otherUser } = await getNamedAccounts()
  const otherUserSigner = await ethers.getNamedSigner('otherUser')
  const workflowRunner = WorkflowRunner__factory.connect(frontDoorAddresses['local'], otherUserSigner)
  const aaveSupplyActionAddress = await workflowRunner.getStepAddress(102)
  const aaveSupplyAction = AaveSupplyAction__factory.connect(aaveSupplyActionAddress, otherUserSigner)
  const poolAddress = await aaveSupplyAction.poolAddress()
  const pool = IAaveV3Pool__factory.connect(poolAddress, otherUserSigner)
  const reserveData = await pool.getReserveData(usdtAddress)
  const aTokenAddress = reserveData.aTokenAddress
  const aToken = IERC20__factory.connect(aTokenAddress, otherUserSigner)

  return {
    workflowRunner,
    otherUser,
    otherUserSigner,
    aTokenAddress,
    aToken,
  }
})

if (shouldRunE2e()) {
  describe('End To End', async () => {
    it('runs a basic single chain workflow', async () => {
      const { otherUser, workflowRunner, otherUserSigner, aToken } = await setup()

      const workflow: Workflow = {
        steps: [
          {
            type: 'wrap-native',
            amount: '1000000000000000000',
            source: 'caller',
          },
          {
            type: 'curve-tricrypto2-swap',
            inputAsset: {
              type: 'fungible-token',
              symbol: 'WETH',
            },
            source: 'workflow',
            inputAmount: '100%',
            outputAsset: {
              type: 'fungible-token',
              symbol: 'USDT',
            },
          },
          {
            type: 'aave-supply',
            asset: {
              type: 'fungible-token',
              symbol: 'USDT',
            },
            source: 'workflow',
            amount: '100%',
          },
        ],
      }
      const stdProvider = createStandardProvider(otherUserSigner.provider!, otherUserSigner)
      const instance = new WorkflowInstance(workflow)
      instance.setProvider('start-chain', stdProvider)
      const runner = await instance.getRunner(otherUser)

      const aTokenBalanceBefore = await aToken.balanceOf(otherUser)
      await runner.execute()
      const aTokenBalanceAfter = await aToken.balanceOf(otherUser)
      const delta = aTokenBalanceAfter.sub(aTokenBalanceBefore)
      console.log('delta', delta.toString())
      expect(delta).to.be.greaterThan(0)
    })
  })
}
