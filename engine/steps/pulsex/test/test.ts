/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import hre, { ethers, deployments } from 'hardhat'
import { STEP_TYPE_ID_PULSEX_EXACT_IN, PulsexExactInHelper } from '../tslib/helper'
import { AssetReference, createStandardProvider, IERC20__factory } from '@freemarket/core'
import { getTestFixture, MockWorkflowInstance, validateAction, WETH_ADDRESS } from '@freemarket/step-sdk/tslib/testing'
import { Weth__factory } from '@freemarket/step-sdk'
import { PulsexExactInAction } from '../typechain-types'

//                   12345678901234567890
const UsdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const MkrAddress = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2'

const toSymbol = 'MKR'
const toAddress = MkrAddress

const setup = getTestFixture(hre, async baseFixture => {
  const {
    signers: { otherUserSigner },
    contracts: { frontDoor, userWorkflowRunner },
    users: { otherUser },
  } = baseFixture

  const weth = Weth__factory.connect(WETH_ADDRESS, otherUserSigner)

  // deploy the contract
  await deployments.fixture('CurveTriCrypto2SwapAction')

  // get a reference to the deployed contract with otherUser as the signer
  const pulsexExactInAction = <PulsexExactInAction>await ethers.getContract('PulsexExactInAction', otherUserSigner)
  const toToken = IERC20__factory.connect(toAddress, otherUserSigner)
  const usdt = IERC20__factory.connect(UsdtAddress, otherUserSigner)
  const mockWorkflowInstance = new MockWorkflowInstance()
  const stdProvider = createStandardProvider(otherUserSigner.provider!, otherUserSigner)
  const helper = new PulsexExactInHelper(mockWorkflowInstance, stdProvider)
  const fromAssetRef: AssetReference = {
    type: 'fungible-token',
    symbol: 'WETH',
  }
  const toAssetRef: AssetReference = {
    type: 'fungible-token',
    symbol: toSymbol,
  }

  return {
    contracts: { pulsexExactInAction, toToken, weth, usdt, userWorkflowRunner, frontDoor },
    mockWorkflowInstance,
    helper,
    fromAssetRef,
    toAssetRef,
    hre,
    otherUser,
    otherUserSigner,
  }
})

describe('Pulsex Exact In', async () => {
  it('deploys', async () => {
    const {
      contracts: { configManager, pulsexExactInAction },
    } = await setup()
    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(configManager, STEP_TYPE_ID_PULSEX_EXACT_IN, pulsexExactInAction.address)
  })
})
