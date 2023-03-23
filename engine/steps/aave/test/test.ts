// import rootLogger from 'loglevel'
// rootLogger.enableAll()
import { expect } from 'chai'
import hardhat, { ethers, deployments } from 'hardhat'
import { AaveSupplyAction, AaveSupplyAction__factory } from '../typechain-types'
import { AaveSupplyHelper, STEP_TYPE_ID } from '../tslib/helper'
import { createStandardProvider, EncodingContext, WORKFLOW_END_STEP_ID } from '@freemarket/core'
import { IERC20__factory, TestErc20__factory, getTestFixture, MockWorkflowInstance, validateAction } from '@freemarket/step-sdk'
import { AaveSupply, aaveSupplySchema } from '../tslib/model'
import { ITriCrypto2__factory, getTriCrypto2Address } from '@freemarket/curve'
import { BigNumberish, Signer } from 'ethers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
const testAmount = 99

async function getUsdt(hardhat: HardhatRuntimeEnvironment, wei: BigNumberish, signer: Signer) {
  const [chainId, signerAddr] = await Promise.all([hardhat.getChainId(), signer.getAddress()])
  const triCryptoAddress = getTriCrypto2Address(chainId)
  const triCrypto = ITriCrypto2__factory.connect(triCryptoAddress, signer)
  const usdtAddress = await triCrypto.coins(0)
  await (await triCrypto.exchange(2, 0, wei, 1, true, { value: wei })).wait()
  const usdt = IERC20__factory.connect(usdtAddress, signer)
  const usdtBalance = await usdt.balanceOf(signerAddr)
  return { usdtAddress, usdtBalance, usdt }
}

const setup = getTestFixture(hardhat, async baseFixture => {
  const {
    users: { otherUser },
    signers: { otherUserSigner },
    contracts: { frontDoor },
  } = baseFixture

  // deploy the contract
  await deployments.fixture('AaveSupplyAction')

  // get a reference to the deployed contract with otherUser as the signer
  const aaveSupplyAction = <AaveSupplyAction>await ethers.getContract('AaveSupplyAction', otherUserSigner)

  const { usdt, usdtAddress } = await getUsdt(hardhat, '1000000000000000000', otherUserSigner)
  // console.log('usdt balance', usdtBalance.toString())

  // transfer to stargateBridgeAction
  await (await usdt.transfer(aaveSupplyAction.address, testAmount)).wait()

  // create a mock WorkflowInstance and register the test token
  const mockWorkflowInstance = new MockWorkflowInstance()
  mockWorkflowInstance.registerErc20('USDT', usdtAddress)

  return { contracts: { aaveSupplyAction }, mockWorkflowInstance, usdt, usdtAddress }
})

describe('StargateBridge', async () => {
  it('deploys', async () => {
    const {
      contracts: { userWorkflowRunner, aaveSupplyAction },
      mockWorkflowInstance,
    } = await setup()
    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(userWorkflowRunner, STEP_TYPE_ID, aaveSupplyAction.address)
  })

  it('executes', async () => {
    const {
      users: { otherUser },
      contracts: { aaveSupplyAction },
      mockWorkflowInstance,
      usdt,
    } = await setup()
    const stepConfig: AaveSupply = {
      type: 'aave-supply',
      inputAsset: {
        asset: {
          type: 'fungible-token',
          symbol: 'USDT',
        },
        amount: testAmount,
      },
    }
    const helper = new AaveSupplyHelper(mockWorkflowInstance)
    const context: EncodingContext<AaveSupply> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig,
    }
    const encoded = await helper.encodeWorkflowStep(context)
    console.log(JSON.stringify(encoded, null, 4))

    // const ret = await aaveSupplyAction.execute(encoded.inputAssets, encoded.outputAssets, encoded.data)
    // const rec = await ret.wait()

    await expect(aaveSupplyAction.execute(encoded.inputAssets, encoded.outputAssets, encoded.data)).to.changeTokenBalance(
      usdt,
      aaveSupplyAction.address,
      testAmount * -1
    )
  })
})
