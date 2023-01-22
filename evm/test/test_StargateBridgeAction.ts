import { WethInstance, WorkflowRunnerInstance } from '../types/truffle-contracts'

const MockToken = artifacts.require('MockToken')
const WrapEther = artifacts.require('WrapEther')
const UnwrapEther = artifacts.require('UnwrapEther')
const IWorkflowStep = artifacts.require('IWorkflowStep')
const Weth = artifacts.require('Weth')
const WorkflowRunner = artifacts.require('WorkflowRunner')
const MockStargateRouter = artifacts.require('MockStargateRouter')
const StargateBridgeAction = artifacts.require('StargateBridgeAction')
const FrontDoor = artifacts.require('FrontDoor')

import { AssetType } from '../utils/AssetType'
import { ADDRESS_ZERO } from './utilities'
import { getNetworkConfig, NetworkId } from '../utils/contract-addresses'
import { hexByteLength, concatHex } from './hexStringUtils'
import { ActionIds } from '../utils/actionIds'

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

  it('deployed correctly during migrate', async () => {
    const frontDoor = await FrontDoor.deployed()
    const upstream = await frontDoor.getUpstream()
    const workflowRunner = await WorkflowRunner.deployed()
    expect(workflowRunner.address).to.equal(upstream)

    const fmp = await WorkflowRunner.at(frontDoor.address)
    // const actionCount = (await fmp.getActionCount()).toNumber()
    // expect(actionCount).to.be.greaterThan(0)
    // t.log(`${actionCount} actions are registered`)
    // for (let i = 0; i < actionCount; ++i) {
    //   const ai = await fmp.getActionInfoAt(i)
    //   t.log(formatStep(ai))
    // }
    const stargateBridgeActionAddress = await fmp.getActionAddress(ActionIds.stargateBridge)
    const stargateBridgeAction = await StargateBridgeAction.deployed()
    expect(stargateBridgeAction.address).to.equal(stargateBridgeActionAddress)

    const srcContractAddresses = getNetworkConfig(networkId as any)

    const stargateRouterAddress = await stargateBridgeAction.stargateContractAddress()
    expect(srcContractAddresses.stargateRouter, stargateRouterAddress)
  })

  const srcChain = 'ethereumGoerli'
  const dstChain = 'arbitrumGoerli'

  it('calls mock stargate', async () => {
    // const srcProvider = truffleConfig.networks[srcChain].provider() as HDWalletProvider
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
})
