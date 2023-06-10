/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from 'chai'
import hre, { ethers, deployments } from 'hardhat'
import { STEP_TYPE_ID_UNISWAP_EXACT_IN, UniswapExactInHelper } from '../tslib/ExactInHelper'
import { AssetReference, createStandardProvider, EncodingContext, IERC20__factory, TEN_BIG } from '@freemarket/core'
import { confirmTx, getTestFixture, getUsdt, MockWorkflowInstance, validateAction, WETH_ADDRESS } from '@freemarket/step-sdk/tslib/testing'
import { Weth__factory } from '@freemarket/step-sdk'
import { UniswapExactIn } from '../tslib/model'
import { UniswapExactInAction } from '../typechain-types'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { ADDRESS_ZERO } from '@uniswap/v3-sdk'
import { WorkflowStruct } from '@freemarket/core/typechain-types/contracts/IWorkflowRunner'

import Big from 'big.js'

const testAmountEth = new Big('1')
const testAmountWei = testAmountEth.mul(TEN_BIG.pow(18)).toFixed(0)
const UsdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const MkrAddress = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2'

const toSymbol = 'MKR'
const toAddress = MkrAddress

const ONE_ETH = ethers.utils.parseEther('1')

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
  const uniswapExactInAction = <UniswapExactInAction>await ethers.getContract('UniswapExactInAction', otherUserSigner)
  const toToken = IERC20__factory.connect(toAddress, otherUserSigner)
  const usdt = IERC20__factory.connect(UsdtAddress, otherUserSigner)
  const mockWorkflowInstance = new MockWorkflowInstance()
  const stdProvider = createStandardProvider(otherUserSigner.provider!, otherUserSigner)
  const helper = new UniswapExactInHelper(mockWorkflowInstance, stdProvider)
  const fromAssetRef: AssetReference = {
    type: 'fungible-token',
    symbol: 'WETH',
  }
  const toAssetRef: AssetReference = {
    type: 'fungible-token',
    symbol: toSymbol,
  }

  return {
    contracts: { uniswapExactInAction, toToken, weth, usdt, userWorkflowRunner, frontDoor },
    mockWorkflowInstance,
    helper,
    fromAssetRef,
    toAssetRef,
    hre,
    otherUser,
    otherUserSigner,
  }
})

describe('Uniswap Exact In', async () => {
  it('deploys', async () => {
    const {
      contracts: { configManager, uniswapExactInAction },
    } = await setup()
    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(configManager, STEP_TYPE_ID_UNISWAP_EXACT_IN, uniswapExactInAction.address)
  })

  it('computes exchange rates with slippage', () => {
    // const { helper } = await setup()
    const fromAmount = '1000'
    const token = new Token(1, ADDRESS_ZERO, 18)
    const toAmount = CurrencyAmount.fromRawAmount(token, 500)
    const slippageTolerance = 1 // 1%
    const worstAllowableSlippage = UniswapExactInHelper.getMinExchangeRate(fromAmount, toAmount, slippageTolerance)
    expect(worstAllowableSlippage).to.eq('0x007eb851eb851eb851eb851eb851eb851f')
  })

  it('computes a route', async () => {
    const { helper, fromAssetRef, toAssetRef } = await setup()
    // await getWeth(fromAmount, otherUserSigner)
    const route = await helper.getRoute(fromAssetRef, toAssetRef, 'exactIn', testAmountWei)
    expect(route).to.not.be.undefined
  })

  // it('encodes a route', async () => {
  //   const {
  //     helper,
  //     users: { otherUser },
  //     signers: { otherUserSigner },
  //     fromAssetRef,
  //     toAssetRef,
  //     contracts: { toToken },
  //   } = await setup()
  //   await getWeth(fromAmount, otherUserSigner)
  //   const route = await helper.getRoute(fromAssetRef, toAssetRef, fromAmount)
  //   expect(route).to.not.be.undefined
  //   const encodedPaths = UniswapExactInHelper.encodeRoute(route!)
  //   const chainId = (await otherUserSigner.provider!.getNetwork()).chainId
  //   // console.log('approving', fromAmount, chainId)
  //   const weth = Weth__factory.connect(WETH_ADDRESS, otherUserSigner)
  //   await (await weth.approve(SWAP_ROUTER_ADDRESS, fromAmount)).wait()
  //   const allowance = await weth.allowance(otherUser, SWAP_ROUTER_ADDRESS)
  //   // console.log('allowance', allowance.toString())
  //   const fromBalance = await weth.balanceOf(otherUser)
  //   // console.log('fromBalance', fromBalance.toString())

  //   const toBalanceBefore = await toToken.balanceOf(otherUser)

  //   const swapRouter: SwapRouter02 = SwapRouter02__factory.connect(SWAP_ROUTER_ADDRESS, otherUserSigner)

  //   // based on code examples from uniswap deadline is unix timestamp in seconds
  //   const deadline = Math.floor(Date.now() / 1000 + 1800)
  //   const promises: Promise<any>[] = []
  //   // console.log(`encodedPaths.length=${encodedPaths.length} encodedPaths=${JSON.stringify(encodedPaths, null, 2)}`)
  //   let pathBalanceBefore = toBalanceBefore
  //   for (const path of encodedPaths) {
  //     const amountIn = Math.floor(parseInt(testAmount) * parseFloat(path.portion))
  //     const args: IV3SwapRouter.ExactInputParamsStruct = {
  //       path: path.encodedPath,
  //       recipient: otherUser,
  //       // deadline,
  //       amountIn: path.portion,
  //       amountOutMinimum: 0,
  //     }
  //     console.log(`submitting path=${path.encodedPath} amountIn=${path.amount}`)
  //     const response = await swapRouter.exactInput(args)
  //     console.log('submit waiting')
  //     const receipt = await response.wait()
  //     const pathBalanceAfter = await toToken.balanceOf(otherUser)
  //     const pathBalanceDiff = pathBalanceAfter.sub(pathBalanceBefore)
  //     console.log(`pathBalanceDiff=${pathBalanceDiff.toString()}`)
  //     pathBalanceBefore = pathBalanceAfter
  //     // console.log(receipt)
  //   }

  //   const toBalanceAfter = await toToken.balanceOf(otherUser)
  //   console.log('toBalanceAfter', toBalanceAfter.toString())
  //   const toBalanceDiff = toBalanceAfter.sub(toBalanceBefore)
  //   console.log('toBalanceDiff', toBalanceDiff.toString())
  //   expect(toBalanceDiff).to.be.gt(0)
  // })

  it('does a transfer using the helper and the integration contract', async () => {
    const {
      users: { otherUser },
      contracts: { uniswapExactInAction, toToken, weth },
      helper,
    } = await setup()

    // wrap eth and give it to the Action
    await (await weth.deposit({ value: testAmountWei })).wait()
    weth.transfer(uniswapExactInAction.address, testAmountWei)

    const stepConfig: UniswapExactIn = {
      type: 'uniswap-exact-in',
      inputAsset: {
        type: 'fungible-token',
        symbol: 'WETH',
      },
      inputAssetSource: 'caller',
      inputAmount: testAmountEth.toFixed(0),
      outputAsset: {
        type: 'fungible-token',
        symbol: toSymbol,
      },
    }

    const context: EncodingContext<UniswapExactIn> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig,
      mapStepIdToIndex: new Map<string, number>(),
    }

    const encoded = await helper.encodeWorkflowStep(context)

    const toBalanceBefore = await toToken.balanceOf(uniswapExactInAction.address)
    const { inputAssets, argData } = encoded
    await (await uniswapExactInAction.execute(inputAssets, argData)).wait()
    // console.log('uniswapExactInAction.address', uniswapExactInAction.address)
    // console.log('toToken.address', toToken.address)
    const toBalanceAfter = await toToken.balanceOf(uniswapExactInAction.address)
    // console.log('toBalanceAfter', toBalanceAfter.toString())
    expect(toBalanceAfter).to.be.greaterThan(toBalanceBefore)
  })

  it.skip('handles a no-op swap where the input and out assets are the same', async () => {
    const {
      users: { otherUser },
      contracts: { uniswapExactInAction, weth },
      helper,
    } = await setup()

    // wrap eth and give it to the Action
    await (await weth.deposit({ value: testAmountWei })).wait()
    weth.transfer(uniswapExactInAction.address, testAmountWei)

    const stepConfig: UniswapExactIn = {
      type: 'uniswap-exact-in',
      inputAsset: {
        type: 'fungible-token',
        symbol: 'WETH',
      },
      inputAssetSource: 'caller',
      inputAmount: testAmountEth.toFixed(0),
      outputAsset: {
        type: 'fungible-token',
        symbol: 'WETH',
      },
    }

    const context: EncodingContext<UniswapExactIn> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig,
      mapStepIdToIndex: new Map<string, number>(),
    }

    const encoded = await helper.encodeWorkflowStep(context)

    const { inputAssets, argData } = encoded
    await expect(uniswapExactInAction.execute(inputAssets, argData))
      .to.changeEtherBalance(otherUser, 0)
      .and.changeTokenBalance(weth, otherUser, 0)
  })

  it('handles a swap where the starting asset is native', async () => {
    const {
      users: { otherUser },
      contracts: { uniswapExactInAction, usdt, userWorkflowRunner },
      helper,
    } = await setup()

    const stepConfig: UniswapExactIn = {
      type: 'uniswap-exact-in',
      inputAsset: {
        type: 'native',
      },
      inputAssetSource: 'caller',
      inputAmount: testAmountEth.toFixed(0),
      outputAsset: {
        type: 'fungible-token',
        symbol: 'USDT',
      },
    }

    const context: EncodingContext<UniswapExactIn> = {
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
    }

    // const { inputAssets, argData } = encoded
    const usdtBefore = await usdt.balanceOf(otherUser)
    console.log('usdtBefore', usdtBefore.toString())
    // await confirmTx(uniswapExactInAction.execute(inputAssets, argData, { value: testAmount }))
    await confirmTx(userWorkflowRunner.executeWorkflow(workflow, { value: testAmountWei }))
    const usdtAfter = await usdt.balanceOf(otherUser)
    expect(usdtAfter).to.be.greaterThan(usdtBefore)
    console.log('usdtAfter', usdtAfter.toString())
  })

  it('handles a swap where the to asset is native', async () => {
    const {
      users: { otherUser },
      contracts: { frontDoor, uniswapExactInAction, usdt, userWorkflowRunner },
      helper,
      otherUserSigner,
    } = await setup()

    const tetherAmount = '1000'

    const stepConfig: UniswapExactIn = {
      type: 'uniswap-exact-in',
      inputAsset: {
        type: 'fungible-token',
        symbol: 'USDT',
      },
      inputAssetSource: 'caller',
      inputAmount: tetherAmount,
      outputAsset: {
        type: 'native',
      },
    }

    const context: EncodingContext<UniswapExactIn> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig,
      mapStepIdToIndex: new Map<string, number>(),
    }

    await getUsdt(hre, ONE_ETH.toString(), otherUserSigner)
    await confirmTx(usdt.approve(frontDoor.address, new Big(tetherAmount).mul(TEN_BIG.pow(6)).toFixed(0)))

    const encoded = await helper.encodeWorkflowStep(context)

    const workflow: WorkflowStruct = {
      workflowRunnerAddress: ADDRESS_ZERO,
      steps: [
        {
          ...encoded,
          nextStepIndex: -1,
        },
      ],
    }

    const provider = uniswapExactInAction.provider
    const ethBefore = await provider.getBalance(otherUser)
    // console.log('ethBefore', ethBefore.toString())

    // const { inputAssets, argData } = encoded
    // await confirmTx(uniswapExactInAction.execute(inputAssets, argData))

    await confirmTx(userWorkflowRunner.executeWorkflow(workflow, { gasLimit: 30000000 }))

    const ethAfter = await provider.getBalance(otherUser)
    expect(ethAfter).to.be.greaterThan(ethBefore)
  })
})
