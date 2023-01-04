import { IWorkflowStepInstance, UnwrapEtherInstance, WorkflowRunnerInstance, WrapEtherInstance } from '../types/truffle-contracts'

const WrapEther = artifacts.require('WrapEther')
const UnwrapEther = artifacts.require('UnwrapEther')
const IERC20 = artifacts.require('IERC20')
const IWorkflowStep = artifacts.require('IWorkflowStep')

import { ActionIds } from '../utils/actionIds'
import { AssetType } from '../utils/AssetType'
import { commify, encodeAsset, formatEvent, formatEthereum, getWorkflowRunner, validateAction } from './utilities'
import { EvmNetworkName, getEthConfig } from '../utils/contract-addresses'
import { IERC20Instance } from '../types/truffle-contracts/IERC20'
import BN from 'bn.js'
import { AllEvents } from '../types/truffle-contracts/WorkflowRunner'

const network = process.env['FMP_NETWORK'] || 'mainnet'
const networkConfig = getEthConfig(network as EvmNetworkName)

contract('Wrapped Ether', function (accounts: string[]) {
  let wrapEther: WrapEtherInstance
  let unwrapEther: UnwrapEtherInstance

  before(async () => {
    wrapEther = await WrapEther.deployed()
    unwrapEther = await UnwrapEther.deployed()
  })

  it('deployed correctly during migrate', async () => {
    await validateAction(ActionIds.wrapEther, wrapEther.address)
    await validateAction(ActionIds.unwrapEther, unwrapEther.address)
  })

  // need an instance to extract types
  function dummyTypeExtractor<T1, T2>(arg1: T1, arg2: T2) {
    const x = {} as unknown as WorkflowRunnerInstance
    type ArgTypes = Parameters<typeof x.executeWorkflow>
    type Param0 = ArgTypes[0]
    return {} as unknown as ArgTypes
  }
  type ExecuteWorkflowArgTypes = ReturnType<typeof dummyTypeExtractor>
  type Workflow = ExecuteWorkflowArgTypes[0]
  type WorkflowParams = ExecuteWorkflowArgTypes[1]

  const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
  const ETH_ASSET = {
    assetType: AssetType.Native,
    assetAddress: ADDRESS_ZERO,
  }
  const WETH_ASSET = {
    assetType: AssetType.Token,
    assetAddress: networkConfig.WETH,
  }

  contract('WrapEther', (accounts: string[]) => {
    const userAccount = accounts[1]
    let runner: WorkflowRunnerInstance
    let weth: IERC20Instance

    before(async () => {
      runner = await getWorkflowRunner()
      weth = await IERC20.at(networkConfig.WETH)
    })

    it('wraps and unwraps ETH in a workflow', async () => {
      const testAmount = new BN(10).pow(new BN(16)) // 0.01 ETH
      const wrappedEtherAddress = await runner.getActionAddress(ActionIds.wrapEther)
      console.log(`actionId=${ActionIds.wrapEther} addr=${wrappedEtherAddress}`)

      const beginningBalanceEth = new BN(await web3.eth.getBalance(userAccount))
      const beginningBalanceWeth = await weth.balanceOf(userAccount)

      console.log(`💰 wrapping ${formatEthereum(testAmount.toString())} ETH`)
      console.log(`💰 starting ETH:  ${formatEthereum(beginningBalanceEth.toString())}`)
      console.log(`💰 starting WETH: ${formatEthereum(beginningBalanceWeth.toString())}`)

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
              args: [],
              nextStepIndex: 0,
            },
          ],
        },
        [],
        { value: testAmount, from: userAccount }
      )
      // console.log('back', JSON.stringify(txResponse.logs, null, 2))
      console.log('Events:')
      for (const log of txResponse.logs) {
        console.log('  📌 ' + formatEvent(log))
      }
      const endingBalanceEth = new BN(await web3.eth.getBalance(userAccount))
      const endingBalanceWeth = await weth.balanceOf(userAccount)

      console.log(`💰 ending ETH:  ${formatEthereum(endingBalanceEth.toString())}`)
      console.log(`💰 ending WETH: ${formatEthereum(endingBalanceWeth.toString())}`)
      const gweiPerGasUnit = new BN(txResponse.receipt.effectiveGasPrice)
      const gasUnits = new BN(txResponse.receipt.gasUsed)
      const gasInWei = gweiPerGasUnit.mul(gasUnits)
      const gasInGwei = formatEthereum(gasInWei.toString(), 'gwei')
      console.log(
        `⛽ gas cost: ${gasInGwei} gwei =  ${commify(txResponse.receipt.gasUsed.toString())} gas units @ ${gasInGwei} gwei per unit`
      )

      // verify eth balances
      expect(endingBalanceEth.lt(beginningBalanceEth)).to.be.true
      const ethDelta = beginningBalanceEth.sub(endingBalanceEth)
      const expectedEth = beginningBalanceEth.sub(testAmount).sub(gasInWei)
      expect(endingBalanceEth.toString()).to.equal(expectedEth.toString())

      // verify weth balances
      const wethDelta = endingBalanceWeth.sub(beginningBalanceWeth)
      expect(endingBalanceWeth.gt(beginningBalanceWeth)).to.be.true
      expect(wethDelta.toString()).to.equal(testAmount.toString())
    })
  })
})
