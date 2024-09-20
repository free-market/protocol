/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from 'chai'
import hre, { ethers, deployments } from 'hardhat'
import { UniswapAddLiquidityHelper } from '../tslib/UniswapAddLiquidityHelper'
import { STEP_TYPE_ID_UNISWAP_ADD_LIQUIDITY } from '@freemarket/core/tslib/step-ids'
import { AssetReference, createStandardProvider, EncodingContext, IERC20__factory, TEN_BIG } from '@freemarket/core'
import { confirmTx, getTestFixture, getUsdt, getWeth, MockWorkflowInstance, validateAction, WETH_ADDRESS } from '@freemarket/step-sdk/tslib/testing'
import { Weth__factory, formatNumber } from '@freemarket/step-sdk'
import { UniswapAddLiquidity } from '../tslib/model'
import { UniswapAddLiquidityAction } from '../typechain-types'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { ADDRESS_ZERO } from '@uniswap/v3-sdk'
import { WorkflowStruct } from '@freemarket/core/typechain-types/contracts/IWorkflowRunner'

import Big from 'big.js'
import { Signer } from '@ethersproject/abstract-signer'
import { IERC20Metadata__factory } from '@freemarket/runner'
import { Provider } from '@ethersproject/providers'
import { BigNumber, utils } from 'ethers'
import { bigint } from 'zod'

const testAmountEth = new Big('1')
const testAmountWei = testAmountEth.mul(TEN_BIG.pow(18)).toFixed(0)
const UsdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const MkrAddress = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2'

const token1Symbol = 'MKR'
const token1Address = MkrAddress
const TTL_ms = 3600000

const ONE_ETH = ethers.utils.parseEther('1')

async function formatAssetAmount(assetAddress: string, amount: string, provider: Provider | Signer) {
  const token = IERC20Metadata__factory.connect(assetAddress, provider)
  const decimals = await token.decimals()
  return formatNumber(amount, decimals, 4, true)
}

const setup = getTestFixture(hre, async baseFixture => {
  const {
    signers: { otherUserSigner },
    contracts: { frontDoor, userWorkflowRunner },
    users: { otherUser },
  } = baseFixture

  const weth = Weth__factory.connect(WETH_ADDRESS, otherUserSigner)

  // deploy the contract
  await deployments.fixture('UniswapAddLiquidityAction')

  // get a reference to the deployed contract with otherUser as the signer
  const uniswapAddLiquidityAction = <UniswapAddLiquidityAction>await ethers.getContract('UniswapAddLiquidityAction', otherUserSigner)
  const token1 = IERC20__factory.connect(token1Address, otherUserSigner)
  const usdt = IERC20__factory.connect(UsdtAddress, otherUserSigner)
  const mockWorkflowInstance = new MockWorkflowInstance()
  const stdProvider = createStandardProvider(otherUserSigner.provider!, otherUserSigner)
  const helper = new UniswapAddLiquidityHelper(mockWorkflowInstance, stdProvider)
  const token0AssetRef: AssetReference = {
    type: 'fungible-token',
    symbol: 'WETH',
  }
  const token1AssetRef: AssetReference = {
    type: 'fungible-token',
    symbol: token1Symbol,
  }

  return {
    contracts: { uniswapExactInAction: uniswapAddLiquidityAction, token1, weth, usdt, userWorkflowRunner, frontDoor },
    mockWorkflowInstance,
    helper,
    token0AssetRef,
    token1AssetRef,
    hre,
    otherUser,
    otherUserSigner,
  }
})

describe('Uniswap Add Liquidity', async () => {
  it('deploys', async () => {
    const {
      contracts: { configManager, uniswapExactInAction },
    } = await setup()
    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(configManager, STEP_TYPE_ID_UNISWAP_ADD_LIQUIDITY, uniswapExactInAction.address)
  })
  it('can add liquidity 2 ERC20s', async () => {
    const {
      users: { otherUser },
      signers: { otherUserSigner },
      contracts: { frontDoor, userWorkflowRunner, weth, usdt },
      helper,
    } = await setup()

    const stepConfig: UniswapAddLiquidity = {
      type: 'uniswap-add-liquidity',
      inputAsset0: {
        type: 'fungible-token',
        symbol: 'USDT',
      },
      inputAsset1: {
        type: 'fungible-token',
        symbol: 'WETH',
      },
      tickLower: -887272,
      tickUpper: 887272,
      amount0Desired: 1,
      amount1Desired: .001,
      amount0Min: 0,
      amount1Min: 0,
      inputAssetSource: 'caller',
      deadline: new Date(new Date().getTime() + TTL_ms)
    }

    const context: EncodingContext<UniswapAddLiquidity> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig,
      mapStepIdToIndex: new Map<string, number>(),
    }
    await getUsdt(hre, utils.parseEther("1"), otherUserSigner)
    await getWeth(utils.parseEther("1"), otherUserSigner)
    let usdtBal = await usdt.balanceOf(otherUser)
    console.log(`got ${usdtBal} USDT`)
    let tx = await usdt.approve(frontDoor.address, usdtBal)
    await tx.wait()
    tx = await weth.approve(frontDoor.address, utils.parseEther("1"))
    await tx.wait()
    
    const encoded = await helper.encodeWorkflowStep(context)
    console.log(`stepTypeId ${encoded.stepTypeId}`)

    
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

    await userWorkflowRunner.executeWorkflow(workflow, { gasLimit: 30000000 })
    usdtBal = await usdt.balanceOf(otherUser)
    console.log(`now ${usdtBal} USDT`)

  })
})
