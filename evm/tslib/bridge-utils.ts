import { BigNumber } from '@ethersproject/bignumber'
import { Web3Provider } from '@ethersproject/providers'
import { EIP1193Provider } from 'eip1193-provider'
import log from 'loglevel'
import { IERC20__factory, WorkflowRunner, WorkflowRunner__factory } from '../types/ethers-contracts'
import { ActionIds } from './actionIds'

interface WaitForBridgeNonceLoggingArgs {
  dstBridgeTokenAddr: string
  aTokenAddr: string
  userAddr: string
}

export interface WaitForBridgeNonceArgs {
  provider: EIP1193Provider
  frontDoorAddress: string
  nonce: string
  timeoutMillis: number
  loggingArgs?: WaitForBridgeNonceLoggingArgs
}

export interface WaitForContinuationResult {
  transactionHash: string
  assetAmount: string
}

export function waitForBridgeNonce(args: WaitForBridgeNonceArgs): Promise<WaitForContinuationResult> {
  return new Promise<WaitForContinuationResult>(async (resolve, reject) => {
    const ethersProvider = new Web3Provider(args.provider)
    const runner = WorkflowRunner__factory.connect(args.frontDoorAddress, ethersProvider)
    const expectedNonce = BigNumber.from(args.nonce)
    const filter = runner.filters.WorkflowContinuation(null, null, null)
    const updaterInterval = args.loggingArgs && (await waitForBridgeNonceLogging(args.loggingArgs, runner))

    const timeout = setTimeout(() => {
      runner.removeAllListeners() // canceles the subscription
      updaterInterval && clearInterval(updaterInterval)
      reject('timeout')
    }, args.timeoutMillis)

    log.debug(`watching for nonce ${args.nonce}`)
    runner.on(filter, async (nonce, _userAddress, startingAsset, event) => {
      log.debug('got WorkflowContinuation', JSON.stringify(event, null, 4))
      if (nonce.eq(expectedNonce)) {
        log.debug(`saw expected nonce ${args.nonce}`)
        runner.removeAllListeners()
        updaterInterval && clearInterval(updaterInterval)
        clearTimeout(timeout)
        const txReceipt = await event.getTransactionReceipt()
        resolve({
          transactionHash: txReceipt.transactionHash,
          assetAmount: startingAsset.amount.toString(),
        })
      }
    })
  })
}

async function waitForBridgeNonceLogging(args: WaitForBridgeNonceLoggingArgs, runner: WorkflowRunner) {
  if (args) {
    const { dstBridgeTokenAddr, aTokenAddr: dstATokenAddr, userAddr: dstUserAddr } = args
    const dstBridgeToken = IERC20__factory.connect(dstBridgeTokenAddr, runner.provider)
    const dstAToken = IERC20__factory.connect(dstATokenAddr, runner.provider)
    const dstActionAddr = await runner.getActionAddress(ActionIds.aaveSupply)
    let elapsedSeconds = 0
    const intervalSeconds = 10
    return setInterval(async () => {
      elapsedSeconds += intervalSeconds
      const [actionUsdc, userUsdc, userAToken] = await Promise.all([
        dstBridgeToken.balanceOf(dstActionAddr),
        dstBridgeToken.balanceOf(dstUserAddr),
        dstAToken.balanceOf(dstUserAddr),
      ])

      log.debug(`elapsed=${elapsedSeconds} | action usdc=${actionUsdc} | user usdc=${userUsdc} | user aToken=${userAToken}`)
    }, intervalSeconds * 1000)
  }
  return null
}
