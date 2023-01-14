import {
  IWorkflowStepInstance,
  UnwrapEtherInstance,
  WethInstance,
  WorkflowRunnerInstance,
  WrapEtherInstance,
} from '../types/truffle-contracts'

const MockToken = artifacts.require('MockToken')
const WrapEther = artifacts.require('WrapEther')
const UnwrapEther = artifacts.require('UnwrapEther')
const IWorkflowStep = artifacts.require('IWorkflowStep')
const Weth = artifacts.require('Weth')
const WorkflowRunner = artifacts.require('WorkflowRunner')
const MockStargateRouter = artifacts.require('MockStargateRouter')
const StargateBridgeAction = artifacts.require('StargateBridgeAction')

import { ActionIds } from '../utils/actionIds'
import { AssetType } from '../utils/AssetType'
import { commify, encodeAsset, formatEvent, formatEthereum, getWorkflowRunner, validateAction, ADDRESS_ZERO, ETH_ASSET } from './utilities'
import { getNetworkConfig, NetworkId } from '../utils/contract-addresses'
// import { IERC20Instance } from '../types/truffle-contracts/IERC20'
import BN from 'bn.js'
import { AllEvents } from '../types/truffle-contracts/WorkflowRunner'
import { WorkflowRunner__factory } from '../types/ethers-contracts'
import { hexByteLength, concatHex } from './hexStringUtils'

interface StargateBridgeActionArgs {
  dstActionAddress: string
  dstUserAddress: string
  dstChainId: string
  srcPoolId: string
  dstPoolId: string
  dstGasForCall: string
  dstNativeAmount: string
  minAmountOut: string
  minAmountOutIsPercent: boolean
  dstWorkflow: string
}

// TODO move to SDK
// TODO how to encapsulate client side logic, client side action framework needed
function encodeStargateBridgeParams(params: StargateBridgeActionArgs) {
  const stargateSwapParams = web3.eth.abi.encodeParameters(
    ['address', 'address', 'uint16', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bool'],
    [
      params.dstActionAddress,
      params.dstUserAddress,
      params.dstChainId,
      params.srcPoolId,
      params.dstPoolId,
      params.dstGasForCall,
      params.dstNativeAmount,
      params.minAmountOut,
      params.minAmountOutIsPercent,
    ]
  )

  const lengthPrefix = web3.eth.abi.encodeParameters(['uint256'], [hexByteLength(stargateSwapParams)])
  return concatHex(lengthPrefix, concatHex(stargateSwapParams, params.dstWorkflow))
}

contract('StargateBridgeAction', function (accounts: string[]) {
  let networkId!: number
  let networkConfig!: Record<string, string>
  const userAccount = accounts[1]
  let runner: WorkflowRunnerInstance
  let weth: WethInstance

  before(async () => {
    networkId = await web3.eth.net.getId()
    networkConfig = getNetworkConfig(networkId.toString() as NetworkId)
    runner = await WorkflowRunner.deployed()
    weth = await Weth.at(networkConfig.WETH)
  })

  it.skip('deployed correctly during migrate', async () => {
    // TODO implement me
  })

  it('calls mock stargate', async () => {
    const [mockToken, mockStargateRouter] = await Promise.all([MockToken.new(), MockStargateRouter.new()])
    const stargateBridgeAction = await StargateBridgeAction.new(mockStargateRouter.address)
    await mockToken.mint(userAccount, '1')
    const inputAssetAmount = {
      asset: { assetType: AssetType.ERC20, assetAddress: mockToken.address },
      amount: '1',
    }
    const outputAsset = { assetType: AssetType.Native, assetAddress: ADDRESS_ZERO }
    const sgbParams: StargateBridgeActionArgs = {
      dstActionAddress: accounts[0],
      dstUserAddress: accounts[1],
      dstChainId: '1',
      srcPoolId: '2',
      dstPoolId: '3',
      dstGasForCall: '4',
      dstNativeAmount: '5',
      minAmountOut: '100000',
      minAmountOutIsPercent: true,
      dstWorkflow: '0xdeadbeef',
    }
    const params = encodeStargateBridgeParams(sgbParams)

    const txResponse = await stargateBridgeAction.execute([inputAssetAmount], [outputAsset], params)
    // console.log('tx', txResponse)

    const invos = await mockStargateRouter.getSwapInvocations()
    // console.log('invos', JSON.stringify(invos, null, 4))
    expect(invos.length).to.equal(1)
    expect(invos[0].to).to.equal(sgbParams.dstActionAddress.toLowerCase())
    expect(invos[0].amount).to.equal(inputAssetAmount.amount)
    expect(invos[0].dstChainId).to.equal(sgbParams.dstChainId)
    expect(invos[0].srcPoolId).to.equal(sgbParams.srcPoolId)
    expect(invos[0].dstPoolId).to.equal(sgbParams.dstPoolId)
    expect(invos[0].lzTxParams.dstGasForCall).to.equal(sgbParams.dstGasForCall)
    expect(invos[0].lzTxParams.dstNativeAddr).to.equal(sgbParams.dstUserAddress.toLowerCase())
    expect(invos[0].minAmountOut).to.equal('1')
    expect(invos[0].lzTxParams.dstNativeAmount).to.equal(sgbParams.dstNativeAmount)
    expect(invos[0].payload).to.equal(sgbParams.dstWorkflow)
  })

  it.skip('calls stargate in a workflow', async () => {
    const WETH_ASSET = {
      assetType: AssetType.ERC20,
      assetAddress: networkConfig.WETH,
    }
    const testAmount = new BN(10).pow(new BN(16)) // 0.01 ETH
    const wrappedEtherAddress = await runner.getActionAddress(ActionIds.wrapEther)
    console.log(`actionId=${ActionIds.wrapEther} addr=${wrappedEtherAddress}`)

    const beginningBalanceEth = new BN(await web3.eth.getBalance(userAccount))
    const beginningBalanceWeth = await weth.balanceOf(userAccount)

    console.log(`💰 wrapping ${formatEthereum(testAmount.toString())} ETH`)
    console.log(`💰 starting ETH:  ${formatEthereum(beginningBalanceEth.toString())}`)
    console.log(`💰 starting WETH: ${formatEthereum(beginningBalanceWeth.toString())}`)

    const dstActionAddress = '0x6b175474e89094c44da98b954eedeac495271d0f' //
    const dstUserAddress = '0x6b175474e89094c44da98b954eedeac495271d0f' //
    const dstChainId = '1'
    const srcPoolId = '2'
    const dstPoolId = '3'
    const dstGasForCall = '4'
    const dstNativeAmount = '5'
    const minAmountOut = '6'
    const minAmountOutIsPercent = true
    const destWorkflow = '0xdf3234'

    // const stargateSwapParams = web3.utils.encodePacked(
    //   { type: 'address', value: dstAddress },
    //   { type: 'uint16', value: chainId },
    //   { type: 'uint256', value: srcPoolId },
    //   { type: 'uint256', value: dstPoolId },
    //   { type: 'uint256', value: dstGasForCall },
    //   { type: 'uint256', value: dstNativeAmount },
    //   { type: 'uint256', value: minAmountOut },
    //   { type: 'bool', value: minAmountOutIsPercent.toString() }
    // )!

    const stargateSwapParams = web3.eth.abi.encodeParameters(
      ['address', 'address', 'uint16', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bool'],
      [
        dstActionAddress,
        dstUserAddress,
        dstChainId,
        srcPoolId,
        dstPoolId,
        dstGasForCall,
        dstNativeAmount,
        minAmountOut,
        minAmountOutIsPercent,
      ]
    )

    const lengthPrefix = web3.eth.abi.encodeParameters(['uint256'], [hexByteLength(stargateSwapParams)])
    // const lengthPrefix = web3.utils.encodePacked({ type: 'uint32', value: hexByteLength(stargateSwapParams).toString() })!

    const stargateActionParams = concatHex(lengthPrefix, concatHex(stargateSwapParams, destWorkflow))
    console.log('lengthPrefix', lengthPrefix)
    console.log('cont', stargateActionParams)
    // const args = hexToNumberArray(continuation)
    // console.log(JSON.stringify(args))
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
            args: '0x',
            nextStepIndex: 1,
          },
          {
            actionId: ActionIds.stargateBridge,
            actionAddress: ADDRESS_ZERO,
            inputAssets: [
              {
                asset: WETH_ASSET,
                amount: 100_000,
                amountIsPercent: true,
              },
            ],
            outputAssets: [],
            args: stargateActionParams,
            nextStepIndex: 0,
          },
        ],
      },
      [],
      { value: testAmount, from: userAccount }
    )
    console.log('back', JSON.stringify(txResponse, null, 2))
    let event = txResponse.receipt.rawLogs.some((l: any) => {
      return l.topics[0] == '0x' + web3.utils.keccak256('Stored()')
    })
    assert.ok(event, 'Stored event not emitted')

    console.log('tx', txResponse.tx)
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
      `⛽ gas cost: ${gasInGwei} gwei =  ${commify(txResponse.receipt.gasUsed.toString())} gas units @ ${gweiPerGasUnit} gwei per unit`
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
