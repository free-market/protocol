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
const MockWorkflowRunner = artifacts.require('MockWorkflowRunner')

import { AssetType } from '../tslib/AssetType'
import { ADDRESS_ZERO, toChecksumAddress } from './test-utilities'
import { getNetworkConfig, NetworkId } from '../tslib/contract-addresses'

import { ActionIds } from '../tslib/actionIds'
import { encodeStargateBridgeArgs, StargateBridgeActionArgs } from '../tslib/StargateBridgeAction'
import { EvmWorkflow } from '../tslib/EvmWorkflow'
import { getBridgePayload } from '../tslib/encode-workflow'

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

    const stargateRouterAddress = await stargateBridgeAction.stargateRouterAddress()
    expect(srcContractAddresses.stargateRouter, stargateRouterAddress)
  })

  const srcChain = 'ethereumGoerli'
  const dstChain = 'arbitrumGoerli'

  it('calls mock stargate', async () => {
    const [mockToken, mockStargateRouter] = await Promise.all([MockToken.new(), MockStargateRouter.new()])
    const dummyFrontDoorAddr = toChecksumAddress(1)
    const stargateBridgeAction = await StargateBridgeAction.new(dummyFrontDoorAddr, mockStargateRouter.address)
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
      continuationWorkflow: '0xdeadbeef',
    }
    const params = encodeStargateBridgeArgs(sgbParams)

    const txResponse = await stargateBridgeAction.execute(
      [inputAssetAmount, { asset: { assetType: AssetType.Native, assetAddress: ADDRESS_ZERO }, amount: '1' }],
      [outputAsset],
      params,
      { value: '1' }
    )
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
    expect(invos[0].payload).to.equal(sgbParams.continuationWorkflow)
  })

  it('can be invoked by stargate', async () => {
    const mockWorkflowRunner = await MockWorkflowRunner.new()
    const dummyStargateRouterAddr = accounts[0] // use the default account as the router so the require won't fail
    const dummyStargateRemoteBridgeAddr = toChecksumAddress(2)
    const dummyDstTokenAddr = toChecksumAddress(3)
    const stargateBridgeAction = await StargateBridgeAction.new(mockWorkflowRunner.address, dummyStargateRouterAddr)

    // give some token to the
    const inputAmount = 100_000
    const inputAsset = await MockToken.new()
    await inputAsset.mint(stargateBridgeAction.address, inputAmount)

    const dummyWorkflow: EvmWorkflow = {
      steps: [
        {
          actionId: 1,
          actionAddress: ADDRESS_ZERO,
          inputAssets: [
            { asset: { assetType: AssetType.ERC20, assetAddress: inputAsset.address }, amount: inputAmount, amountIsPercent: true },
          ],
          outputAssets: [],
          data: '0xdeadbeef',
          nextStepIndex: -1,
        },
      ],
    }
    const { encodedWorkflow, nonce } = getBridgePayload(accounts[0], dummyWorkflow)

    const txResult = await stargateBridgeAction.sgReceive(
      1, // the remote chainId sending the tokens
      dummyStargateRemoteBridgeAddr, // the remote Bridge address
      22, // stargate nonce
      inputAsset.address, // the token contract on the local chain
      inputAmount, // the qty of local _token contract tokens
      encodedWorkflow
    )
    // console.log('txResult', JSON.stringify(txResult, null, 4))
  })
})
