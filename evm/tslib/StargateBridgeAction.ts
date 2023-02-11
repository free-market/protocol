import { concatHex, hexByteLength } from '../e2e/hexStringUtils'
import { EIP1193Provider } from 'eip1193-provider'
import frontDoorArtifact from '../build/contracts/FrontDoor.json'
import workflowRunnerArtifact from '../build/contracts/WorkflowRunner.json'
import { ActionIds } from '../utils/actionIds'
const truffleContract = require('@truffle/contract')
const FrontDoor = truffleContract(frontDoorArtifact)
const WorkflowRunner = truffleContract(workflowRunnerArtifact)
import { FrontDoorInstance } from '../types/truffle-contracts/FrontDoor'
import { WorkflowRunnerInstance } from '../types/truffle-contracts/WorkflowRunner'
import Web3 from 'web3'
import { Provider, WebSocketProvider } from '@ethersproject/providers'
import { IERC20__factory, StargateBridgeAction__factory, WorkflowRunner__factory } from '../types/ethers-contracts'
import { BigNumber } from 'ethers'
import log from 'loglevel'
import { BridgePayloadStructOutput, WorkflowStepStructOutput } from '../types/ethers-contracts/StargateBridgeAction'

export interface StargateBridgeActionArgs {
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

export function encodeStargateBridgeArgs(args: StargateBridgeActionArgs) {
  const web3 = new Web3()
  const stargateSwapParams = web3.eth.abi.encodeParameters(
    ['address', 'address', 'uint16', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bool'],
    [
      args.dstActionAddress,
      args.dstUserAddress,
      args.dstChainId,
      args.srcPoolId,
      args.dstPoolId,
      args.dstGasForCall,
      args.dstNativeAmount,
      args.minAmountOut,
      args.minAmountOutIsPercent,
    ]
  )

  const lengthPrefix = web3.eth.abi.encodeParameters(['uint256'], [hexByteLength(stargateSwapParams)])
  return concatHex(lengthPrefix, concatHex(stargateSwapParams, args.dstWorkflow))
}

// untested ethers impl
// export async function getStargateBridgeActionAddress(frontDoorAddress: string, provider: EIP1193Provider): Promise<string> {
//   const ethersProvider = new Web3Provider(provider)
//   const runner = WorkflowRunner__factory.connect(frontDoorAddress, ethersProvider)
//   const sgBridgeAddress = await runner.getActionAddress(ActionIds.stargateBridge)
//   return sgBridgeAddress
// }

export async function getStargateBridgeActionAddress(provider: EIP1193Provider): Promise<string> {
  FrontDoor.setProvider(provider)
  WorkflowRunner.setProvider(provider)
  const frontDoor = (await FrontDoor.deployed()) as FrontDoorInstance
  const runner = (await WorkflowRunner.at(frontDoor.address)) as WorkflowRunnerInstance
  const stargateBridgeActionAddress = await runner.getActionAddress(ActionIds.stargateBridge)
  return stargateBridgeActionAddress
}

// TODO this will change to the generic bridge continuation event
export function waitForNonceOld(
  webSocketProviderUrl: string,
  stargateBridgeActionAddress: string,
  assetAddress: string,
  _nonce: string,
  timeoutMillis: number
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    console.log('sgba', stargateBridgeActionAddress)
    const provider = new WebSocketProvider(webSocketProviderUrl)
    const sba = StargateBridgeAction__factory.connect(stargateBridgeActionAddress, provider)
    // const expectedNonce = BigNumber.from(nonce)
    const asset = IERC20__factory.connect(assetAddress, provider)

    let x = 0
    const updaterInterval = setInterval(async () => {
      x += 10
      log.debug('elapsed: ' + x)
      const bal = await asset.balanceOf(stargateBridgeActionAddress)
      console.log(`elapsed seconds: ${x}  ${bal.toString()}`)
    }, 10_000)

    const timeout = setTimeout(() => {
      sba.removeAllListeners() // canceles the subscription
      clearInterval(updaterInterval)
      reject()
    }, timeoutMillis)
    // const filter = sba.filters.SgReceiveCalled(null)
    // const asdf = sba.on(filter, (bridgePayload, _event) => {
    //   if (bridgePayload.nonce.eq(expectedNonce)) {
    //     sba.removeAllListeners()
    //     clearTimeout(timeout)
    //     clearInterval(updaterInterval)
    //     resolve()
    //   }
    // })
    const filter = sba.filters.SgReceiveCalled(null)
    sba.on(filter, (tokenAddr, amount, x: BridgePayloadStructOutput, _event) => {
      const steps: WorkflowStepStructOutput[] = x.workflow.steps

      console.log('omg workflow', tokenAddr, amount, JSON.stringify(steps.length))
      for (const step of steps) {
        console.log(`step:
  actionId=${step.actionId}
  actionAddress=${step.actionAddress}
  inputAssets=${JSON.stringify(step.inputAssets)}
  inputAssets=${JSON.stringify(step.outputAssets)}
  data=${step.data}
  nextStepIndex=${step.nextStepIndex}
        `)
      }
      sba.removeAllListeners()
      clearTimeout(timeout)
      clearInterval(updaterInterval)
      resolve()
    })
  })
}
export async function waitForNonce(
  webSocketProviderUrl: string,
  frontDoorAddress: string,
  nonce: string,
  timeoutMillis: number,
  dstUsdcAddr: string,
  dstATokenAddr: string,
  dstUserAddr: string,
  dstActionAddr: string
): Promise<string> {
  const provider = new WebSocketProvider(webSocketProviderUrl)
  const result = await waitForNonceWithProvider(provider, frontDoorAddress, nonce, timeoutMillis, dstUsdcAddr, dstATokenAddr, dstUserAddr, dstActionAddr)
return result.amount
}

export function waitForNonceWithProvider(
  provider: Provider,
  frontDoorAddress: string,
  nonce: string,
  timeoutMillis: number,
  dstUsdcAddr: string,
  dstATokenAddr: string,
  dstUserAddr: string,
  dstActionAddr: string
): Promise<{transaction: { hash: string }, amount: string }> {
  return new Promise((resolve, reject) => {
    const runner = WorkflowRunner__factory.connect(frontDoorAddress, provider)
    const expectedNonce = BigNumber.from(nonce)
    const filter = runner.filters.WorkflowContinuation(null, null, null)

    const dstUsdc = IERC20__factory.connect(dstUsdcAddr, provider)
    const dstAToken = IERC20__factory.connect(dstATokenAddr, provider)

    let x = 0
    const updaterInterval = setInterval(async () => {
      x += 10
      // log.debug('elapsed: ' + x)
      const [actionUsdc, userUsdc, userAToken] = await Promise.all([
        dstUsdc.balanceOf(dstActionAddr),
        dstUsdc.balanceOf(dstUserAddr),
        dstAToken.balanceOf(dstUserAddr),
      ])

      console.log(`elapsed=${x} | action usdc=${actionUsdc} | user usdc=${userUsdc} | user aToken=${userAToken}`)
    }, 10_000)

    const timeout = setTimeout(() => {
      runner.removeAllListeners() // canceles the subscription
      clearInterval(updaterInterval)
      reject('timeout')
    }, timeoutMillis)
    runner.on(filter, (nonce, _userAddress, startingAsset, _event) => {
      if (nonce.eq(expectedNonce)) {
        _event.transactionHash
        runner.removeAllListeners()
        clearInterval(updaterInterval)
        clearTimeout(timeout)
        console.log('success')
        resolve({
          amount: startingAsset.amount.toString(),
          transaction: { hash: _event.transactionHash }
        })
      }
    })
  })
}

// const StargatePoolIdsByChain: Record<string, number[]> = {
//   Ethereum: [1, 2, 3, 7, 11, 13, 14, 15, 16, 17, 19],
//   BSC: [2, 5, 11, 16, 17, 19],
//   Avalanche: [1, 2, 7, 16, 19],
//   Polygon: [1, 2, 3, 16],
//   Arbitrum: [1, 2, 7, 13, 15, 16],
//   Optimism: [1, 3, 7, 13, 14, 15, 16],
//   Fantom: [1],
//   Metis: [17, 19],
// }
