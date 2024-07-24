/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from 'chai'
import hre, { ethers, deployments } from 'hardhat'
import { MAINNET_STETH_ADDRESS, MAINNET_WSTETH_ADDRESS, encodeDepositEthForStEthParams, encodeWrapParams } from '../../lido/tslib'
import { ADDRESS_ZERO, ASSET_TYPE_ERC20, ASSET_TYPE_NATIVE, IERC20__factory } from '@freemarket/core'
import { getTestFixture, validateAction } from '@freemarket/step-sdk/tslib/testing'
import { DepositEthForStEthAction, IPMarket, IPMarket__factory, IPRouterStatic__factory, PendleSwapToken } from '../typechain-types'
import { getOldestNonexpiredMarket, encodePendleSwapTokenParams, PENDLE_FUNCTION_SWAP_TOKEN_FOR_PT, PENDLE_FUNCTION_SWAP_TOKEN_FOR_YT, MAINNET_PENDLE_ROUTER_STATIC } from '../tslib'
import { STEP_TYPE_ID_LIDO_ETH_TO_STETH, STEP_TYPE_ID_LIDO_STETH_TO_WSTETH, STEP_TYPE_ID_PENDLE_TOKEN_TO_PTYT } from '../../step-ids'
import { WorkflowStepStruct, WorkflowStruct } from '@freemarket/core/build/typechain-types/contracts/IWorkflowRunner'
import { BigNumber, BigNumberish, utils } from 'ethers'

//import { IPMarket } from '@pendle/core-v2/build/artifacts/contracts/interfaces/IPMarket.sol/IPMarket.json';
//import '@pendle/core-v2/contracts/interfaces/IPMarket.sol';

/// Percents have 3 decimals of precision, so:
/// 100% is represented as 100000 (100.000%)
const ALL_AS_PERCENT = 100000

const ethIn = ethers.utils.parseEther("0.01")
const minStEth = ethIn.sub(100)
const minWstEth = minStEth.mul(80).div(100)

const MAINNET_PENDLE_MARKET_STETH = getOldestNonexpiredMarket('stETH')
//const ETHER = BigNumber.from(10).pow(18)

const ethToStEth: WorkflowStepStruct = {
  stepTypeId: STEP_TYPE_ID_LIDO_ETH_TO_STETH,
  stepAddress: ADDRESS_ZERO,
  inputAssets: [
    {
      sourceIsCaller: true,
      amountIsPercent: false,
      asset: {
        assetType: ASSET_TYPE_NATIVE,
        assetAddress: ADDRESS_ZERO,
      },
      amount: ethIn,
    },
  ],
  argData: encodeDepositEthForStEthParams(minStEth),
  nextStepIndex: 1,
}

const stEthToWstEth: WorkflowStepStruct = {
  stepTypeId: STEP_TYPE_ID_LIDO_STETH_TO_WSTETH,
  stepAddress: ADDRESS_ZERO,
  inputAssets: [
    {
      sourceIsCaller: false,
      amountIsPercent: true,
      asset: {
        assetType: ASSET_TYPE_ERC20,
        assetAddress: MAINNET_STETH_ADDRESS,
      },
      amount: ALL_AS_PERCENT,
    },
  ],
  argData: encodeWrapParams(minWstEth),
  nextStepIndex: 2,
}


function pendleStep(pendleSwapFuncton: number, minOut: BigNumberish): WorkflowStepStruct {
  return {
    stepTypeId: STEP_TYPE_ID_PENDLE_TOKEN_TO_PTYT,
    stepAddress: ADDRESS_ZERO,
    inputAssets: [
      {
        sourceIsCaller: false,
        amountIsPercent: true,
        asset: {
          assetType: ASSET_TYPE_ERC20,
          assetAddress: MAINNET_WSTETH_ADDRESS,
        },
        amount: ALL_AS_PERCENT,
      },
    ],
    argData: encodePendleSwapTokenParams(MAINNET_PENDLE_MARKET_STETH, pendleSwapFuncton, minOut),
    nextStepIndex: -1,
  }
}

const setup = getTestFixture(hre, async baseFixture => {
  const {
    signers: { otherUserSigner },
    contracts: { frontDoor, userWorkflowRunner },
    users: { otherUser },
  } = baseFixture

  // deploy the contract
  await deployments.fixture('Pendle')

  // get a reference to the deployed contract with otherUser as the signer
  const pendleSwapToken = <PendleSwapToken>await ethers.getContract('PendleSwapToken', otherUserSigner)
  const depositEthForStEthAction = <DepositEthForStEthAction>await ethers.getContract('DepositEthForStEthAction', otherUserSigner)
  const wstEth = IERC20__factory.connect(MAINNET_WSTETH_ADDRESS, otherUserSigner)
  const stEth = IERC20__factory.connect(MAINNET_STETH_ADDRESS, otherUserSigner)
  const IPMarket = IPMarket__factory.connect(MAINNET_PENDLE_MARKET_STETH, otherUserSigner)
  const routerStatic = IPRouterStatic__factory.connect(MAINNET_PENDLE_ROUTER_STATIC, otherUserSigner)
  const [SY_address, PT_address, YT_address] = await IPMarket.readTokens()
  const SY = IERC20__factory.connect(SY_address, otherUserSigner)
  const PT = IERC20__factory.connect(PT_address, otherUserSigner)
  const YT = IERC20__factory.connect(YT_address, otherUserSigner)

  return {
    contracts: { SY, PT, YT, stEth, wstEth, routerStatic, pendleSwapToken, depositEthForStEthAction, userWorkflowRunner, frontDoor },
    hre,
    otherUser,
    otherUserSigner,
  }
})

//function workflow

describe('Pendle', async () => {
  it('deploys', async () => {
    const {
      contracts: { configManager, pendleSwapToken, depositEthForStEthAction },
    } = await setup()
    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(configManager, STEP_TYPE_ID_PENDLE_TOKEN_TO_PTYT, pendleSwapToken.address)
    await validateAction(configManager, STEP_TYPE_ID_LIDO_ETH_TO_STETH, depositEthForStEthAction.address)

  })
  it('stETH to PT', async () => {
    const {
      contracts: { PT, userWorkflowRunner, routerStatic },
      otherUserSigner
    } = await setup()
    const [expectedPtOut, , ,] = await routerStatic.swapExactTokenForPtStatic(MAINNET_PENDLE_MARKET_STETH, MAINNET_WSTETH_ADDRESS, minWstEth)
    const workflow: WorkflowStruct = {
      workflowRunnerAddress: ADDRESS_ZERO,
      steps: [
        ethToStEth,
        stEthToWstEth,
        pendleStep(PENDLE_FUNCTION_SWAP_TOKEN_FOR_PT, expectedPtOut.mul(2))
      ],
      beforeAll: [],
      afterAll: [],
    }
    const u = await otherUserSigner.getAddress()
    const ptBefore = await PT.balanceOf(u)

    // expect too much
    await expect(userWorkflowRunner.executeWorkflow(workflow, { value: ethIn })).to.throw

    workflow.steps[2] = pendleStep(PENDLE_FUNCTION_SWAP_TOKEN_FOR_PT, expectedPtOut)

    let tx = await userWorkflowRunner.executeWorkflow(workflow, { value: ethIn })
    await tx.wait()
    const ptAfter = await PT.balanceOf(u)
    const received = ptAfter.sub(ptBefore)
    console.log(`received ${received} PT expectedPtOut ${expectedPtOut}`)
    expect(received).gte(expectedPtOut)
  }),
    it('stETH to YT', async () => {
      const {
        contracts: { YT, userWorkflowRunner, routerStatic },
        otherUserSigner
      } = await setup()
      const [expectedYtOut, , ,] = await routerStatic.swapExactTokenForYtStatic(MAINNET_PENDLE_MARKET_STETH, MAINNET_WSTETH_ADDRESS, minWstEth)
      const workflow: WorkflowStruct = {
        workflowRunnerAddress: ADDRESS_ZERO,
        steps: [
          ethToStEth,
          stEthToWstEth,
          pendleStep(PENDLE_FUNCTION_SWAP_TOKEN_FOR_YT, expectedYtOut.mul(2))
        ],
        beforeAll: [],
        afterAll: [],
      }
      const u = await otherUserSigner.getAddress()
      const ytBefore = await YT.balanceOf(u)

      // expect too much
      await expect(userWorkflowRunner.executeWorkflow(workflow, { value: ethIn })).to.throw
      workflow.steps[2] = pendleStep(PENDLE_FUNCTION_SWAP_TOKEN_FOR_YT, expectedYtOut)

      let tx = await userWorkflowRunner.executeWorkflow(workflow, { value: ethIn })
      await tx.wait()
      const ytAfter = await YT.balanceOf(u)
      const received = ytAfter.sub(ytBefore)
      console.log(`received ${received} YT expectedYtOut ${expectedYtOut}`)
      expect(received).gte(expectedYtOut)
    })



})
