import BN from 'bn.js'
import { AddAssetActionArgs } from '../tslib/AddAssetAction'
import { AddAssetActionInstance, WethInstance, WorkflowRunnerInstance } from '../types/truffle-contracts'
import { ActionIds } from '../utils/actionIds'
import { AssetType } from '../tslib/AssetType'
import { getNetworkConfig, NetworkId } from '../utils/contract-addresses'
import {
  ADDRESS_ZERO,
  expectRejection,
  formatEthereum,
  formatEvent,
  getWorkflowRunner,
  logEvents,
  toBN,
  validateAction,
  verbose,
} from './test-utilities'

const AddAssetAction = artifacts.require('AddAssetAction')
const Weth = artifacts.require('Weth')

contract('AddAssetAction', function (accounts: string[]) {
  let addAssetAction!: AddAssetActionInstance
  let networkConfig!: Record<string, string>
  const userAddress = accounts[1]
  let runner: WorkflowRunnerInstance
  let weth!: WethInstance
  const inputAmount = new BN(10).pow(new BN(16)) // 0.01 ETH

  function getWethAsset() {
    return {
      assetType: AssetType.ERC20,
      assetAddress: networkConfig.WETH,
    }
  }

  async function ensureWethBalance(inputAmount: BN) {
    let userWethBalanceBefore = await weth.balanceOf(userAddress)
    if (userWethBalanceBefore.lt(inputAmount)) {
      const defecit = inputAmount.sub(userWethBalanceBefore)
      await weth.deposit({ value: defecit, from: userAddress })
      userWethBalanceBefore = await weth.balanceOf(userAddress)
      expect(userWethBalanceBefore.toString()).is.equal(inputAmount.toString())
    }
    return userWethBalanceBefore
  }

  function getAddAssetArgs(address: string, amount: BN | string | number) {
    const args: AddAssetActionArgs = {
      fromAddress: userAddress,
      amount: inputAmount,
    }
    return web3.eth.abi.encodeParameters(['address', 'uint256'], [args.fromAddress, toBN(args.amount)])
  }

  before(async () => {
    const networkId = await web3.eth.net.getId()
    networkConfig = getNetworkConfig(networkId.toString() as NetworkId)
    addAssetAction = await AddAssetAction.deployed()
    weth = await Weth.at(networkConfig.WETH)
    runner = await getWorkflowRunner()
  })

  it('deployed correctly during migrate', async () => {
    await validateAction(ActionIds.addAsset, addAssetAction.address)
  })

  async function unitTestCommon() {
    const actionWethBalanceBefore = await weth.balanceOf(runner.address)
    const userWethBalanceBefore = await ensureWethBalance(inputAmount)
    await weth.approve(addAssetAction.address, inputAmount, { from: userAddress })
    const data = getAddAssetArgs(userAddress, inputAmount)
    return { actionWethBalanceBefore, userWethBalanceBefore, data }
  }

  it('transfers an ERC20 when invoked directly', async () => {
    const { actionWethBalanceBefore, userWethBalanceBefore, data } = await unitTestCommon()
    await addAssetAction.execute([], [getWethAsset()], data)
    const actionWethBalanceAfter = await weth.balanceOf(addAssetAction.address)
    const userWethBalanceAfter = await weth.balanceOf(userAddress)
    expect(userWethBalanceAfter.toString()).to.equal(userWethBalanceBefore.sub(inputAmount).toString())
    // when invoked directly, the action contract having an increased balance
    expect(actionWethBalanceAfter.toString()).to.equal(actionWethBalanceBefore.add(inputAmount).toString())
  })

  it('reverts when any input assets are given', async () => {
    const { data } = await unitTestCommon()
    await expectRejection(
      addAssetAction.execute(
        [
          {
            asset: getWethAsset(),
            amount: 1,
          },
        ],
        [getWethAsset()],
        data
      )
    )
  })

  it('reverts when anything but 1 output asset is given', async () => {
    const { data } = await unitTestCommon()
    const wethAsset = getWethAsset()
    await expectRejection(addAssetAction.execute([], [], data))
    await expectRejection(addAssetAction.execute([], [wethAsset, wethAsset], data))
  })

  it('reverts when a non ERC20 asset  is given', async () => {
    const { data } = await unitTestCommon()
    const bogusAsset = getWethAsset()
    bogusAsset.assetType = AssetType.ERC721
    await expectRejection(addAssetAction.execute([], [bogusAsset], data))
  })

  it('transfers an ERC20 in a workflow', async () => {
    // ensure WETH balance
    const userWethBalanceBefore = await ensureWethBalance(inputAmount)
    // runner's balance should be zero but check anyway
    const runnerWethBalanceBefore = await weth.balanceOf(runner.address)

    // approve WETH transfer
    await weth.approve(runner.address, inputAmount, { from: userAddress })

    // invoke workflow
    const args: AddAssetActionArgs = {
      fromAddress: userAddress,
      amount: inputAmount,
    }

    const addAssetArgs = web3.eth.abi.encodeParameters(['address', 'uint256'], [args.fromAddress, args.amount])
    const txResponse = await runner.executeWorkflow(
      {
        steps: [
          {
            actionId: ActionIds.addAsset,
            actionAddress: ADDRESS_ZERO,
            inputAssets: [], // no input assets
            outputAssets: [getWethAsset()],
            data: addAssetArgs,
            nextStepIndex: 0,
          },
        ],
        trustSettings: {
          allowUnknown: false,
          allowBlacklisted: false,
        },
      },
      { from: userAddress }
    )

    logEvents(txResponse)

    // not much to assert here:
    // the asset gets transferred to runner in the one and only step of the workflow
    // and then refunded to the user after the workflow completes
    // resulting in no net change do anything's balances
    const runnerWethBalanceAfter = await weth.balanceOf(runner.address)
    const userWethBalanceAfter = await weth.balanceOf(userAddress)
    expect(runnerWethBalanceAfter.toString()).to.equal(runnerWethBalanceBefore.toString())
    expect(userWethBalanceAfter.toString()).to.equal(userWethBalanceBefore.toString())
  })
})
