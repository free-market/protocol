/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from 'chai'
import hre, { ethers } from 'hardhat'
import {
  ADDRESS_ZERO,
  AssetReference,
  createStandardProvider,
  EncodingContext,
  IERC20__factory,
  IStepHelper,
  TEN_BIG,
} from '@freemarket/core'
import { confirmTx, getTestFixture, MockWorkflowInstance, validateAction, WETH_ADDRESS } from '@freemarket/step-sdk/tslib/testing'
import { Weth__factory } from '@freemarket/step-sdk'
import { UniswapExactIn, UniswapExactOut } from '../tslib/model'
import { IERC20, UniswapExactOutAction } from '../typechain-types'

import Big from 'big.js'
import { STEP_TYPE_ID_UNISWAP_EXACT_OUT, UniswapExactOutHelper } from '../tslib/UniswapExactOutHelper'
import { WorkflowStruct } from '@freemarket/core/typechain-types/contracts/IWorkflowRunner'
import { Signer } from '@ethersproject/abstract-signer'
import { IWorkflowRunner } from '@freemarket/runner'

const testAmountOut = new Big('1')
const testAmountOutRaw = testAmountOut.mul(TEN_BIG.pow(18)).toFixed(0)
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
  // await deployments.fixture('CurveTriCrypto2SwapAction')

  // get a reference to the deployed contract with otherUser as the signer
  const uniswapExactOutAction = <UniswapExactOutAction>await ethers.getContract('UniswapExactOutAction', otherUserSigner)
  const toToken = IERC20__factory.connect(toAddress, otherUserSigner)
  const usdt = IERC20__factory.connect(UsdtAddress, otherUserSigner)
  const mockWorkflowInstance = new MockWorkflowInstance()
  const stdProvider = createStandardProvider(otherUserSigner.provider!, otherUserSigner)
  const helper = new UniswapExactOutHelper(mockWorkflowInstance, stdProvider)
  const fromAssetRef: AssetReference = {
    type: 'fungible-token',
    symbol: 'WETH',
  }
  const toAssetRef: AssetReference = {
    type: 'fungible-token',
    symbol: toSymbol,
  }

  return {
    contracts: { uniswapExactOutAction, toToken, weth, usdt, userWorkflowRunner, frontDoor },
    mockWorkflowInstance,
    helper,
    fromAssetRef,
    toAssetRef,
    hre,
    otherUser,
    otherUserSigner,
  }
})

describe('Uniswap Exact Out', async () => {
  it('deploys', async () => {
    const {
      contracts: { configManager, uniswapExactOutAction },
    } = await setup()
    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(configManager, STEP_TYPE_ID_UNISWAP_EXACT_OUT, uniswapExactOutAction.address)
  })

  it('computes a route', async () => {
    const { helper, fromAssetRef, toAssetRef } = await setup()
    // await getWeth(fromAmount, otherUserSigner)
    const route = await helper.getRoute(fromAssetRef, toAssetRef, 'exactOut', testAmountOut.toFixed())
    expect(route).to.not.be.undefined
    const quote = route!.route!.quote
    const nBig = new Big(quote.numerator.toString())
    const dBig = new Big(quote.denominator.toString())
    const decimal = nBig.div(dBig)
    // prettier-ignore
    console.log(`quote numerator=${quote.numerator.toString()} denominator=${quote.denominator.toString()} decimalScale=${quote.decimalScale.toString()} decimal=${decimal.toFixed(5)} toFixed=${quote.toFixed(5)}`)
  })

  it('does a swap using the helper and the integration contract', async () => {
    const {
      users: { otherUser },
      contracts: { uniswapExactOutAction, toToken, weth },
      helper,
    } = await setup()

    // wrap eth and give it to the Action
    const oneHundredEthInWei = ethers.utils.parseEther('100')
    await (await weth.deposit({ value: oneHundredEthInWei })).wait()
    weth.transfer(uniswapExactOutAction.address, oneHundredEthInWei)

    const stepConfig: UniswapExactOut = {
      type: 'uniswap-exact-out',
      inputAsset: {
        type: 'fungible-token',
        symbol: 'WETH',
      },
      outputAmount: testAmountOut.toFixed(0),
      outputAsset: {
        type: 'fungible-token',
        symbol: toSymbol,
      },
      slippageTolerance: '1',
    }

    const context: EncodingContext<UniswapExactOut> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig,
      mapStepIdToIndex: new Map<string, number>(),
    }

    const encoded = await helper.encodeWorkflowStep(context)

    const toBalanceBefore = await toToken.balanceOf(uniswapExactOutAction.address)
    const { inputAssets, argData } = encoded
    await (await uniswapExactOutAction.execute(inputAssets, argData, otherUser)).wait()
    const toBalanceAfter = await toToken.balanceOf(uniswapExactOutAction.address)
    const expectedBalanceAfter = toBalanceBefore.add(testAmountOutRaw)
    expect(toBalanceAfter).to.eq(expectedBalanceAfter)
  })

  async function doNativeToUsdt(
    otherUser: string,
    helper: IStepHelper<any>,
    usdt: IERC20,
    userWorkflowRunner: IWorkflowRunner,
    amount: string
  ) {
    const stepConfig: UniswapExactOut = {
      type: 'uniswap-exact-out',
      inputAsset: {
        type: 'native',
      },
      outputAmount: amount,
      outputAsset: {
        type: 'fungible-token',
        symbol: 'USDT',
      },
    }

    const context: EncodingContext<UniswapExactOut> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig,
      mapStepIdToIndex: new Map<string, number>(),
    }

    const encoded = await helper.encodeWorkflowStep(context)

    const workflow: WorkflowStruct = {
      workflowRunnerAddress: ADDRESS_ZERO,
      steps: [
        {
          ...encoded,
          nextStepIndex: -1,
        },
      ],
      beforeAll: [],
      afterAll: [],
    }

    const oneHundredEthInWei = ethers.utils.parseEther('100')
    console.log('submitting workflow', userWorkflowRunner.address, workflow)
    await confirmTx(userWorkflowRunner.executeWorkflow(workflow, { value: oneHundredEthInWei, gasLimit: 30_000_000 }))
  }

  it('handles a swap where the starting asset is native', async () => {
    const {
      users: { otherUser },
      contracts: { usdt, userWorkflowRunner },
      helper,
    } = await setup()

    const usdtBefore = await usdt.balanceOf(otherUser)
    console.log('usdtBefore', usdtBefore.toString())
    await doNativeToUsdt(otherUser, helper, usdt, userWorkflowRunner, testAmountOut.toFixed(0))
    const usdtAfter = await usdt.balanceOf(otherUser)
    console.log('usdtAfter', usdtAfter.toString())
    expect(usdtAfter.toString()).to.eq('1000000')
  })

  // it.only('handles a swap where the starting asset is native', async () => {
  //   const {
  //     users: { otherUser },
  //     contracts: { usdt, userWorkflowRunner },
  //     helper,
  //     otherUserSigner,
  //   } = await setup()

  //   await confirmTx(usdt.transfer(userWorkflowRunner.address, usdtAfter))

  //   const ethAmount = '0.01'

  //   const stepConfigFromNative: UniswapExactOut = {
  //     type: 'uniswap-exact-out',
  //     inputAsset: {
  //       type: 'native',
  //     },
  //     outputAmount: '1',
  //     outputAsset: {
  //       type: 'fungible-token',
  //       symbol: 'USDT',
  //     },
  //   }

  //   const stepConfigToNative: UniswapExactOut = {
  //     type: 'uniswap-exact-out',
  //     inputAsset: {
  //       type: 'fungible-token',
  //       symbol: 'USDT',
  //     },
  //     outputAmount: ethAmount,
  //     outputAsset: {
  //       type: 'native',
  //     },
  //   }

  //   const context: EncodingContext<UniswapExactOut> = {
  //     userAddress: otherUser,
  //     chain: 'ethereum',
  //     stepConfig: stepConfigFromNative,
  //     mapStepIdToIndex: new Map<string, number>(),
  //   }

  //   const encodedFromNative = await helper.encodeWorkflowStep(context)
  //   context.stepConfig = stepConfigToNative
  //   const encodedToNative = await helper.encodeWorkflowStep(context)

  //   const workflow: WorkflowStruct = {
  //     workflowRunnerAddress: ADDRESS_ZERO,
  //     steps: [
  //       {
  //         ...encodedFromNative,
  //         nextStepIndex: 1,
  //       },
  //       {
  //         ...encodedToNative,
  //         nextStepIndex: -1,
  //       },
  //     ],
  //   }

  //   console.log('submitting workflow, target is native', userWorkflowRunner.address, workflow)
  //   const ethBefore = await otherUserSigner.getBalance()
  //   const tx = await confirmTx(userWorkflowRunner.executeWorkflow(workflow, { gasLimit: 30_000_000 }))
  //   console.log('tx', JSON.stringify(tx, null, 2))
  //   const ethAfter = await otherUserSigner.getBalance()
  //   console.log('ethBefore', ethBefore.toString())
  //   console.log('ethAfter', ethAfter.toString())
  //   const ethDiff = ethAfter.sub(ethBefore)
  //   console.log('ethDiff', ethDiff.toString())
  //   console.log(tx.gasUsed.toString())
  //   console.log(tx.effectiveGasPrice.toString())
  //   const gasPaid = tx.effectiveGasPrice.mul(tx.gasUsed).toString()
  //   console.log(tx.effectiveGasPrice.mul(tx.gasUsed).toString())
  // })
})
