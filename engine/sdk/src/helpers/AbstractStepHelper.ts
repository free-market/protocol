import assert from '../utils/assert'
import { Memoize } from 'typescript-memoize'
import { Provider, Web3Provider } from '@ethersproject/providers'
import { WORKFLOW_END_STEP_ID } from '../runner/constants'
import type { EIP1193Provider } from 'eip1193-provider'
import type { BridgeTarget, EncodingContext, IStepHelper, NextSteps } from './IStepHelper'
import type { AssetAmount, Chain, StepBase } from '../model'
import type { IWorkflowInstance } from '../runner/IWorkflowInstance'

import type { EncodedWorkflowStep } from '../EncodedWorkflow'
export abstract class AbstractStepHelper<T extends StepBase> implements IStepHelper<T> {
  protected standardProvider?: EIP1193Provider
  protected ethersProvider?: Provider
  protected instance: IWorkflowInstance

  constructor(runner: IWorkflowInstance, provider?: EIP1193Provider) {
    this.instance = runner
    this.standardProvider = provider
    if (provider) {
      this.ethersProvider = new Web3Provider(provider)
    }
  }
  setProvider(provider: EIP1193Provider): void {
    this.standardProvider = provider
    this.ethersProvider = new Web3Provider(provider)
  }

  abstract encodeWorkflowStep(context: EncodingContext<T>): Promise<EncodedWorkflowStep>

  protected async getChain(): Promise<Chain> {
    const chainId = await this.getChainId()
    switch (chainId) {
      case 1:
      case 5:
        return 'ethereum'
      case 56:
      case 97:
        return 'binance'
      case 42161:
      case 421613:
        return 'arbitrum'
      case 137:
      case 80001:
        return 'polygon'
      case 43114:
      case 43113:
        return 'avalanche'
      case 10:
      case 420:
        return 'optimism'
      case 250:
      case 4002:
        return 'fantom'
      default:
        throw new Error('unknown chainId: ' + chainId)
    }
  }

  @Memoize()
  protected async isTestNet(): Promise<boolean> {
    const chainId = await this.getChainId()
    switch (chainId) {
      case 1:
      case 56:
      case 42161:
      case 137:
      case 43114:
      case 10:
      case 250:
        return false
      case 5:
      case 97:
      case 421613:
      case 80001:
      case 43113:
      case 420:
      case 4002:
        return true

      default:
        throw new Error('unknown chainId: ' + chainId)
    }
  }

  @Memoize()
  protected async getFrontDoorAddress(): Promise<string> {
    const chain = await this.getChain()
    return this.getFrontDoorAddressForChain(chain)
  }

  @Memoize()
  protected async getFrontDoorAddressForChain(chain: Chain): Promise<string> {
    if (await this.isTestNet()) {
      switch (chain) {
        case 'ethereum':
          return '0xF29547aF5D9545886c5e616c8Ec954b27C75bEdD'
        case 'arbitrum':
          return '0xeFE6E1708b058D35d79f39cd94833fa89304B96B'
        default:
          throw new Error(`freemarket is not deployed on ${chain} testnet`)
      }
    } else {
      switch (chain) {
        case 'arbitrum':
          return '0x6Bd12615CDdE14Da29641C9e90b11091AD39B299'
        case 'avalanche':
          return '0xADA59A35A302E3AC5d6d4862BEb51aE473DD3ee7'
        case 'optimism':
          return '0x6Bd12615CDdE14Da29641C9e90b11091AD39B299'
        default:
          throw new Error(`freemarket is not deployed on ${chain} mainnet`)
      }
    }
  }

  @Memoize()
  protected async getChainId(): Promise<number> {
    assert(this.ethersProvider)
    const network = await this.ethersProvider.getNetwork()
    return network.chainId
  }

  protected static async getChainIdFromProvider(provider: Provider): Promise<number> {
    const network = await provider.getNetwork()
    return network.chainId
  }

  requiresRemittance(_stepConfig: T) {
    return false
  }

  getRemittance(_stepConfig: T): Promise<AssetAmount | null> {
    return Promise.resolve(null)
  }

  getBridgeTarget(_stepConfig: T): BridgeTarget | null {
    return null
  }

  getPossibleNextSteps(stepConfig: T): NextSteps | null {
    assert(stepConfig.nextStepId)
    if (stepConfig.nextStepId === WORKFLOW_END_STEP_ID) {
      return null
    }
    return {
      sameChain: [stepConfig.nextStepId],
    }
  }
}
