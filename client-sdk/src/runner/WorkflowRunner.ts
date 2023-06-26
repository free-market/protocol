import type { ContractReceipt } from '@ethersproject/contracts'
import type { AddAssetInfo } from './AddAssetInfo'
import { createExecutionEvent, CreateExecutionEventArg, ExecutionEvent, ExecutionEventCode, ExecutionEventHandler } from './ExecutionEvent'
import type { IWorkflowInstance } from './IWorkflowInstance'
import type { IWorkflowRunner } from './IWorkflowRunner'
// import { IERC20__factory, BridgeBase__factory, WorkflowRunner__factory } from '@freemarket/evm'
import assert from '../utils/assert'
import type Big from 'big.js'
import type { Signer } from '@ethersproject/abstract-signer'
import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { getFreeMarketConfig } from '../config'
import { Wallet } from '@ethersproject/wallet'

import rootLogger from 'loglevel'
import { getStargateBridgeParamsEvent } from '../private/debug-utils'
import {
  ADDRESS_ZERO,
  Asset,
  AssetAmount,
  AssetReference,
  Chain,
  ContinuationInfo,
  EncodeContinuationResult,
  EncodedWorkflow,
  getEthersProvider,
  getEthersSigner,
  IERC20__factory,
  Memoize,
  PartialRecord,
} from '@freemarket/core'
import { WorkflowRunner__factory } from '@freemarket/runner'
import { WorkflowContinuingStep__factory } from '@freemarket/stargate-bridge'
import { HARDHAT_FORK_CHAIN } from './constants'
import { AssetAmountStructOutput, AssetStructOutput } from '@freemarket/core/typechain-types/contracts/IWorkflowRunner'
import { Workflow } from '../model/Workflow'
import { LogDescription } from '@ethersproject/abi'
import { Log } from '@ethersproject/providers'
import { MapWithDefault } from '../utils/MapWithDefault'
import {
  ExecutionLog,
  ExecutionLogAssetAmount,
  ExecutionLogContinuation,
  ExecutionLogRemainingAsset,
  ExecutionLogStep,
} from './ExecutionLog'
import { getPlatformInfos, StepInfo } from '../platform-infos'

const log = rootLogger.getLogger('WorkflowRunner')

export interface WaitForContinuationResult {
  transactionHash: string
  transactionReceipt: ContractReceipt
  assetAmounts: AssetAmountStructOutput[]
}

export class WorkflowRunner implements IWorkflowRunner {
  private startChainWorkflow: EncodedWorkflow
  private eventHandlers: ExecutionEventHandler[] = []
  private instance: IWorkflowInstance
  private startChain: Chain
  private addAssetInfo: AddAssetInfo
  private isDebug: boolean
  private signer?: Signer

  public debugFundsSourcePrivateKey?: string

  constructor(
    instance: IWorkflowInstance,
    startChainWorkflow: EncodedWorkflow,
    startChain: Chain,
    addAssetInfo: AddAssetInfo,
    isDebug: boolean
  ) {
    this.startChainWorkflow = startChainWorkflow
    this.instance = instance
    this.startChain = startChain
    this.addAssetInfo = addAssetInfo
    this.isDebug = isDebug
  }

  addEventHandler(handler: ExecutionEventHandler): void {
    this.eventHandlers.push(handler)
  }

  async execute(): Promise<void> {
    try {
      const stdProvider = this.instance.getProvider('start-chain')
      const startChainSigner = getEthersSigner(stdProvider)
      await this.doErc20Approvals(startChainSigner)
      await this.submitWorkflow(startChainSigner)
    } catch (e) {
      const s = e instanceof Error ? e.stack : (e as any)
      log.error(`Workflow unsuccessful: ${s}`)
      throw e
    }
  }

  async submitWorkflow(signer: Signer): Promise<ExecutionLog[]> {
    const events: ExecutionLog[] = []
    this.signer = signer
    const frontDoorAddr = await this.instance.getFrontDoorAddressForChain(this.startChain)
    const runner = WorkflowRunner__factory.connect(frontDoorAddr, signer)

    this.sendEvent({ code: 'WorkflowSubmitting', chain: this.startChain })
    const nativeAmount: string = this.addAssetInfo.native.toFixed(0)

    log.debug('estimating gas', await runner.signer.getAddress())
    const srcWorkflowGasEstimate = await runner.estimateGas.executeWorkflow(this.startChainWorkflow, { value: nativeAmount })
    const gasLimit = srcWorkflowGasEstimate.mul(15).div(10)
    log.debug(`submitting tx, gas estimate =${gasLimit.toString()}`)
    const txResponse = await runner.executeWorkflow(this.startChainWorkflow, { value: nativeAmount, gasLimit })
    log.debug(`tx submitted, hash=${txResponse.hash}`)
    this.sendEvent({ code: 'WorkflowSubmitted', chain: this.startChain })
    const txReceipt = await txResponse.wait(1)
    log.debug(`tx txReceipt, hash=${txReceipt.transactionHash}`)
    const logs = await this.toExecutionLogs(this.startChain, txReceipt.logs)
    this.sendEvent({ code: 'WorkflowConfirmed', chain: this.startChain, transactionHash: txReceipt.transactionHash, logs })
    const startChainEvents = WorkflowRunner.parseLogs(txReceipt.logs)
    events.push(...logs)

    const sourceChain = this.startChain

    // TODO do something here to support multiple bridges in one workflow
    // eslint-disable-next-line sonarjs/no-one-iteration-loop
    for (;;) {
      const continuationInfo = await this.getContinuationInfoFromEvents(startChainEvents, this.startChain)
      if (!continuationInfo) {
        break
      }

      this.sendEvent({
        code: 'WorkflowWaitingForBridge',
        stepType: continuationInfo.stepType,
        sourceChain,
        sourceChainTransactionHash: txReceipt.transactionHash,
        targetChain: continuationInfo.targetChain,
      })
      if (this.isDebug) {
        const continuationEvents = await this.continueDebugWorkflow(continuationInfo)
        events.push(...continuationEvents)
      } else {
        const continuationResult = await this.waitForContinuation(continuationInfo)
        const logs = await this.toExecutionLogs(continuationInfo.targetChain, continuationResult.transactionReceipt.logs)
        events.push(...logs)
      }
      // TODO get next txReceipt https://freemarket.atlassian.net/browse/CORE-24
      //  provider.getTransaction(transactionHash)

      break
    }

    const failureLog = events.find(log => log.type === 'continuation-failure')
    const success = !failureLog
    this.sendEvent({ code: 'WorkflowComplete', chain: this.startChain, transactionHash: txReceipt.transactionHash, events, success })

    return events
  }

  async getContinuationInfoFromEvents(events: LogDescription[], chain: Chain): Promise<ContinuationInfo | null> {
    const workflowBridgedEvent = events.find(e => e.name === 'WorkflowBridged')
    if (workflowBridgedEvent) {
      const { stepType, nonce, targetChain: targetChainId, continuationWorkflow } = workflowBridgedEvent.args
      // this block is correct-ish, but since we're not supporting relative minOut yet, the minOut will be the percent (100000 for 100%)
      //   const eventExpectedAssets: AssetAmountStructOutput[] = event.args.expectedAssets
      //   const expectedAssetsPromises: Promise<AssetAmount>[] = eventExpectedAssets.map(async a => {
      //     assert(a.asset.assetType === 1)
      //     const assetAddress = a.asset.assetAddress
      //     const asset = await this.instance.getFungibleTokenByChainAndAddress(chain, assetAddress)
      //     // TODO: we probably have to query the contract for symbol and decimals if we don't have it
      //     // for now just assert
      //     assert(asset)
      //     const ret: AssetAmount = {
      //       asset: {
      //         type: 'fungible-token',
      //         symbol: asset.symbol,
      //       },
      //       amount: a.amount.toString(),
      //     }
      //     return ret
      //   })
      //   const expectedAssets = await Promise.all(expectedAssetsPromises)
      //   const targetChain = WorkflowRunner.getChainFromCode(targetChainId)
      //   return { stepType, nonce, targetChain, expectedAssets, continuationWorkflow }
      // }

      // take 99% of the input amount for now
      const stepExecutionEvent = events.find(e => e.name === 'WorkflowStepExecution' && e.args.stepTypeId === 101)
      if (stepExecutionEvent) {
        const inputs = stepExecutionEvent.args.result.inputAssetAmounts
        const tokenInput = inputs.find((it: any) => it.asset.assetType === 1)
        if (tokenInput) {
          const amount = tokenInput.amount as BigNumber
          const minOut = amount.mul(99).div(100)
          const asset = await this.instance.getFungibleTokenByChainAndAddress(chain, tokenInput.asset.assetAddress)
          assert(asset)
          const expectedAssets: AssetAmount[] = [
            {
              asset: {
                type: 'fungible-token',
                symbol: asset.symbol,
              },
              amount: minOut.toString(),
            },
          ]
          const targetChain = WorkflowRunner.getChainFromCode(targetChainId)
          return { stepType, nonce, targetChain, expectedAssets, continuationWorkflow }
        }
      }
    }

    return null
  }

  private sendEvent(eventArg: CreateExecutionEventArg) {
    const event = createExecutionEvent(eventArg)
    for (const handler of this.eventHandlers) {
      handler(event)
    }
  }

  private async doErc20Approvals(signer: Signer) {
    const symbols = [] as string[]
    for (const [symbol, amounts] of this.addAssetInfo.erc20s) {
      if (amounts.currentAllowance.lt(amounts.requiredAllowance)) {
        symbols.push(symbol)
      }
    }
    if (symbols.length === 0) {
      return
    }

    this.sendEvent({ code: 'Erc20ApprovalsSubmitting', symbols })

    const promises: Promise<ContractReceipt>[] = []
    for (const symbol of symbols) {
      const amounts = this.addAssetInfo.erc20s.get(symbol)
      assert(amounts)
      const amount = amounts.requiredAllowance
      this.sendEvent({ code: 'Erc20ApprovalSubmitting', symbol, amount: amount.toFixed(0) })
      promises.push(this.doErc20Approval(signer, symbol, amount))
    }
    const results = await Promise.all(promises)
    for (let i = 0; i < results.length; ++i) {
      const symbol = symbols[i]
      const txReceipt = results[i]
      this.sendEvent({ code: 'Erc20ApprovalConfirmed', symbol, transactionHash: txReceipt.transactionHash })
    }
    this.sendEvent({ code: 'Erc20ApprovalsConfirmed', symbols })
  }

  private async doErc20Approval(signer: Signer, symbol: string, amount: Big) {
    const frontDoorAddress = await this.instance.getFrontDoorAddressForChain(this.startChain)
    const fungi = await this.instance.getFungibleToken(symbol)
    assert(fungi)
    const chain = this.startChain === 'hardhat' ? HARDHAT_FORK_CHAIN : this.startChain
    const addr = fungi.chains[chain]?.address
    assert(addr)
    log.debug(`approving ${symbol}<${addr}>  amount=${amount.toFixed(0)} to ${frontDoorAddress}`)
    const erc20 = IERC20__factory.connect(addr, signer)
    const response = await erc20.approve(frontDoorAddress, amount.toFixed(0), { gasLimit: 1000000 })
    return await response.wait(1)
  }

  private static getChainFromCode(chainId: number): Chain {
    switch (chainId) {
      case 101:
        return 'ethereum'
      case 102:
        return 'binance'
      case 106:
        return 'avalanche'
      case 109:
        return 'polygon'
      case 110:
        return 'arbitrum'
      case 111:
        return 'optimism'
      case 112:
        return 'fantom'
      // testnets
      case 10121:
        return 'ethereum'
      case 10143:
        return 'arbitrum'
      case 10132:
        return 'optimism'
      case 10102:
        return 'binance'
      case 10106:
        return 'avalanche'
      case 10109:
        return 'polygon'
      case 10112:
        return 'fantom'

      default:
        throw new Error('unknown chainId ' + chainId)
    }
  }

  waitForContinuation(continuationInfo: ContinuationInfo): Promise<WaitForContinuationResult> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<WaitForContinuationResult>(async (resolve, reject) => {
      try {
        const { nonce, targetChain } = continuationInfo
        const frontDoorAddr = await this.instance.getFrontDoorAddressForChain(targetChain)

        const ethersProvider = getEthersProvider(this.instance.getProvider(targetChain))
        ethersProvider.addListener
        const runner = WorkflowRunner__factory.connect(frontDoorAddr, ethersProvider)
        const expectedNonce = BigNumber.from(nonce)
        const filter = runner.filters.WorkflowContinuation(null, null, null)

        const { bridgeTimeoutSeconds } = getFreeMarketConfig()

        const timeout = setTimeout(() => {
          log.warn(`did not see WorkflowContinuation event after ${bridgeTimeoutSeconds} seconds, timing out`)
          runner.removeAllListeners() // cancels the subscription
          reject('timeout')
        }, bridgeTimeoutSeconds * 1000)

        log.debug(`watching for nonce ${nonce}`)
        runner.on(filter, async (nonce, _userAddress, startingAssets, event) => {
          log.debug('got WorkflowContinuation')
          if (nonce.eq(expectedNonce)) {
            log.debug(`saw expected nonce ${nonce}`)
            runner.removeAllListeners()
            clearTimeout(timeout)
            const txReceipt = await event.getTransactionReceipt()
            resolve({
              transactionHash: txReceipt.transactionHash,
              transactionReceipt: txReceipt,
              assetAmounts: startingAssets,
            })
          }
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  async continueDebugWorkflow(continuationInfo: ContinuationInfo): Promise<ExecutionLog[]> {
    assert(this.debugFundsSourcePrivateKey)

    const helper = this.instance.getStepHelper(continuationInfo.targetChain, continuationInfo.stepType)
    const encoded = await helper.encodeContinuation(continuationInfo)
    await this.prepareContinuationAssets(continuationInfo, encoded)
    const provider = this.instance.getProvider(continuationInfo.targetChain)
    const nativeAmount = encoded.startAssets
      .filter(a => a.address === ADDRESS_ZERO)
      .reduce((sum, a) => sum.add(a.amount), BigNumber.from(0))
      .toHexString()
    log.debug('invoking execute_debug_transaction')
    log.debug('  toAddress', encoded.toAddress)
    log.debug('  fromAddress', encoded.fromAddress)
    log.debug('  callData', encoded.callData)
    log.debug('  nativeAmount', nativeAmount)

    const result: any = await provider.request({
      method: 'execute_debug_transaction',
      params: [encoded.toAddress, encoded.fromAddress, encoded.callData, nativeAmount],
    })

    return this.toExecutionLogs(continuationInfo.targetChain, result.logs as any)
  }

  async prepareContinuationAssets(continuationInfo: ContinuationInfo, encoded: EncodeContinuationResult): Promise<void> {
    const helper = this.instance.getStepHelper(continuationInfo.targetChain, 'uniswap-exact-in') as any
    const provider = this.instance.getProvider(continuationInfo.targetChain)
    assert((<any>provider).vm)
    const ethersProvider = getEthersProvider(provider)
    assert(this.debugFundsSourcePrivateKey)
    const fundsSourceWallet = new Wallet(this.debugFundsSourcePrivateKey, ethersProvider)
    const sourceAsset = { type: 'native' }
    for (const expectedAsset of continuationInfo.expectedAssets) {
      await helper.doSwap(fundsSourceWallet, encoded.toAddress, sourceAsset, expectedAsset.asset, 'exactOut', expectedAsset.amount)
    }
  }

  private static parseLogs(logs: Array<Log>): LogDescription[] {
    const ret: LogDescription[] = []
    const contractInterfaces = [WorkflowContinuingStep__factory.createInterface(), WorkflowRunner__factory.createInterface()]
    for (const log of logs) {
      for (const iface of contractInterfaces) {
        try {
          const event = iface.parseLog(log)
          ret.push(event)
        } catch (e) {
          // ignore
        }
      }
    }
    return ret
  }

  @Memoize()
  static getStepInfoByIdMap(): Map<number, StepInfo> {
    const ret = new Map<number, StepInfo>()
    const platforms = getPlatformInfos()
    for (const platform of platforms) {
      for (const step of platform.stepInfos) {
        ret.set(step.stepTypeId, step)
      }
    }
    return ret
  }

  @Memoize()
  static getStepInfoMap(): Map<string, StepInfo> {
    const ret = new Map<string, StepInfo>()
    const platforms = getPlatformInfos()
    for (const platform of platforms) {
      for (const step of platform.stepInfos) {
        ret.set(step.stepType, step)
      }
    }
    return ret
  }

  private async toAsset(chain: Chain, evmAsset: AssetStructOutput): Promise<Asset | undefined> {
    if (evmAsset.assetType === 0) {
      const assetRef: AssetReference = { type: 'native' }
      return await this.instance.dereferenceAsset(assetRef, chain)
    }
    return this.instance.getFungibleTokenByChainAndAddress(chain, evmAsset.assetAddress)
  }

  private async toExecutionLogAssetAmount(chain: Chain, aa: AssetAmountStructOutput): Promise<ExecutionLogAssetAmount> {
    const asset = await this.toAsset(chain, aa.asset)
    return {
      asset,
      address: aa.asset.assetAddress,
      amount: aa.amount.toString(),
    }
  }

  private async toExecutionLog(chain: Chain, log: LogDescription): Promise<ExecutionLog | undefined> {
    switch (log.name) {
      case 'WorkflowStepExecution': {
        const inputPromise = log.args.result.inputAssetAmounts.map((a: AssetAmountStructOutput) => this.toExecutionLogAssetAmount(chain, a))
        const outputPromise = log.args.result.outputAssetAmounts.map((a: AssetAmountStructOutput) =>
          this.toExecutionLogAssetAmount(chain, a)
        )
        const inputs = await Promise.all(inputPromise)
        const outputs = await Promise.all(outputPromise)
        const stepInfo = WorkflowRunner.getStepInfoByIdMap().get(log.args.stepTypeId)
        assert(stepInfo)
        const executionStepLog: ExecutionLogStep = {
          chain,
          type: 'step',
          stepInfo,
          inputs,
          outputs,
        }
        return executionStepLog
      }
      case 'RemainingAsset': {
        const asset = await this.toAsset(chain, log.args.asset)
        const remainingAssetLog: ExecutionLogRemainingAsset = {
          chain,
          type: 'remaining-asset',
          assetAmount: { asset, amount: log.args.totalAmount.toString(), address: log.args.asset.assetAddress },
          userAmount: log.args.userAmount.toString(),
          feeAmount: log.args.feeAmount.toString(),
        }
        return remainingAssetLog
      }
      case 'WorkflowBridged': {
        const assetAmountPromises = log.args.expectedAssets.map((it: any) => this.toExecutionLogAssetAmount(chain, it))
        const assetAmounts = await Promise.all(assetAmountPromises)
        const stepInfo = WorkflowRunner.getStepInfoMap().get(log.args.stepType)
        assert(stepInfo)
        const continuationLog: ExecutionLogContinuation = {
          chain,
          type: 'continuation',
          stepInfo,
          toChain: WorkflowRunner.getChainFromCode(log.args.targetChain),
          assetAmounts,
        }
        return continuationLog
      }
      case 'ContinuationSuccess':
        return {
          chain,
          type: 'continuation-success',
        }
      case 'ContinuationFailure':
        return {
          chain,
          type: 'continuation-failure',
          reason: log.args.reason,
        }
    }
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  async toExecutionLogs(chain: Chain, events: Array<Log>): Promise<ExecutionLog[]> {
    const ret: ExecutionLog[] = []
    const logs = WorkflowRunner.parseLogs(events)
    for (const log of logs) {
      const executionLog = await this.toExecutionLog(chain, log)
      if (executionLog) {
        ret.push(executionLog)
      }
    }

    return ret
  }
}

// function logDescriptionToOnChainEvent(logDescription: LogDescription): OnChainEvent {
//   const { name, signature, args } = logDescription
//   const outArgs: Record<string, string> = {}
//   for (const key of Object.keys(args)) {
//     // skip numeric keys (they are array indices
//     if (parseInt(key).toString() !== key) {
//       outArgs[key] = args[key].toString()
//     }
//   }
//   return { name, signature, args: outArgs }
// }
