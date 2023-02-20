import { IWorkflowStepInstance, UnwrapEtherInstance, WorkflowRunnerInstance, WrapEtherInstance } from '../types/truffle-contracts'

const WrapEther = artifacts.require('WrapEther')
const UnwrapEther = artifacts.require('UnwrapEther')
const IERC20 = artifacts.require('IERC20')
const IWorkflowStep = artifacts.require('IWorkflowStep')

import { ActionIds } from '../tslib/actionIds'
import { AssetType } from '../tslib/AssetType'
import {
  commify,
  encodeAsset,
  formatEvent,
  formatEthereum,
  getWorkflowRunner,
  validateAction,
  ADDRESS_ZERO,
  ETH_ASSET,
  verbose,
} from './test-utilities'
import { getNetworkConfig, NetworkId } from '../tslib/contract-addresses'
import { IERC20Instance } from '../types/truffle-contracts/IERC20'
import BN from 'bn.js'
import { AllEvents } from '../types/truffle-contracts/WorkflowRunner'

contract('Wrap/UnwrapEtherAction', function (accounts: string[]) {
  let wrapEther: WrapEtherInstance
  let unwrapEther: UnwrapEtherInstance
  let networkConfig!: Record<string, string>
  const userAccount = accounts[1]
  let runner: WorkflowRunnerInstance
  let weth: IERC20Instance

  before(async () => {
    wrapEther = await WrapEther.deployed()
    unwrapEther = await UnwrapEther.deployed()
    const networkId = await web3.eth.net.getId()
    networkConfig = getNetworkConfig(networkId.toString() as NetworkId)
    verbose('networkConfig', JSON.stringify(networkConfig))
    runner = await getWorkflowRunner()
    weth = await IERC20.at(networkConfig.WETH)
  })

  it('deployed correctly during migrate', async () => {
    await validateAction(ActionIds.wrapEther, wrapEther.address)
    await validateAction(ActionIds.unwrapEther, unwrapEther.address)
  })

  it('wraps and unwraps ETH in a workflow', async () => {
    const WETH_ASSET = {
      assetType: AssetType.ERC20,
      assetAddress: networkConfig.WETH,
    }
    const testAmount = new BN(10).pow(new BN(16)) // 0.01 ETH
    const wrappedEtherAddress = await runner.getActionAddress(ActionIds.wrapEther)
    verbose(`actionId=${ActionIds.wrapEther} addr=${wrappedEtherAddress}`)

    const beginningBalanceEth = new BN(await web3.eth.getBalance(userAccount))
    const beginningBalanceWeth = await weth.balanceOf(userAccount)

    verbose(`💰 wrapping ${formatEthereum(testAmount.toString())} ETH`)
    verbose(`💰 starting ETH:  ${formatEthereum(beginningBalanceEth.toString())}`)
    verbose(`💰 starting WETH: ${formatEthereum(beginningBalanceWeth.toString())}`)

    const txResponse = await runner.executeWorkflow(
      {
        steps: [
          {
            actionId: ActionIds.wrapEther,
            actionAddress: ADDRESS_ZERO,
            inputAssets: [
              {
                asset: ETH_ASSET,
                amount: testAmount.toString(),
                amountIsPercent: false,
              },
            ],
            outputAssets: [WETH_ASSET],
            data: '0x',
            nextStepIndex: -1,
          },
        ],
      },
      { value: testAmount, from: userAccount }
    )
    // verbose('back', JSON.stringify(txResponse.logs, null, 2))
    verbose('Events:')
    for (const log of txResponse.logs) {
      verbose('  📌 ' + formatEvent(log))
    }
    const endingBalanceEth = new BN(await web3.eth.getBalance(userAccount))
    const endingBalanceWeth = await weth.balanceOf(userAccount)

    verbose(`💰 ending ETH:  ${formatEthereum(endingBalanceEth.toString())}`)
    verbose(`💰 ending WETH: ${formatEthereum(endingBalanceWeth.toString())}`)
    const gweiPerGasUnit = new BN(txResponse.receipt.effectiveGasPrice)
    const gasUnits = new BN(txResponse.receipt.gasUsed)
    const gasInWei = gweiPerGasUnit.mul(gasUnits)
    const gasInGwei = formatEthereum(gasInWei.toString(), 'gwei')
    verbose(
      `⛽ gas cost: ${gasInGwei} gwei =  ${commify(txResponse.receipt.gasUsed.toString())} gas units @ ${gweiPerGasUnit} gwei per unit`
    )

    // verify eth balances
    expect(endingBalanceEth.lt(beginningBalanceEth)).to.be.true
    const feePercent = new BN('300')
    const fee = testAmount.mul(feePercent).div(new BN(1000000))
    const ethDelta = beginningBalanceEth.sub(endingBalanceEth).sub(fee)
    const expectedEth = beginningBalanceEth.sub(testAmount).sub(gasInWei)

    expect(endingBalanceEth.toString()).to.equal(expectedEth.toString())

    // verify weth balances
    const wethDeltaActual = endingBalanceWeth.sub(beginningBalanceWeth)
    expect(endingBalanceWeth.gt(beginningBalanceWeth)).to.be.true
    expect(wethDeltaActual.toString()).to.equal(testAmount.sub(fee).toString())
  })
})
