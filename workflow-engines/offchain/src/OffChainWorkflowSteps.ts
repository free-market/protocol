import { BigNumber, ContractTransaction, ethers, Signer } from 'ethers'
import { EvmNetworkName, getEthConfig, Weth__factory } from '@fmp/evm'
import { transferEthereumToSolana } from './OffChainWormholeStep'
import { Provider as EthersProvider } from '@ethersproject/providers'
import { Connection, Keypair, PublicKey, TokenAccountsFilter, Transaction } from '@solana/web3.js'
import { WorkflowEventHandler, WorkflowStep, WorkflowStepResult } from '@fmp/sdk'
import { TokenStepImpl } from '@fmp/sdk/dist/engine/TokenStepImpl'
import { StatusCallback, StepImpl } from '@fmp/sdk/dist/engine/StepImpl'
import { StepImplFactory } from '@fmp/sdk/dist/engine/StepImplFactory'

export enum BlockchainEnvironment {
  Local,
  Test,
  Live,
}

export interface EvmParams {
  signer: Signer
  provider: EthersProvider
}
export interface SolanaParams {
  connection: Connection
  userAccount: Keypair
}

export type EvmConfigs = { [chain: string]: EvmParams }

export interface OffChainEngineParams {
  blockchainEnvironment: BlockchainEnvironment
  evm?: EvmConfigs
  solana?: SolanaParams
  eventHandler: WorkflowEventHandler
}

export abstract class OffChainStepImpl extends TokenStepImpl {
  // contractAddresses: ReturnType<typeof getEthConfig>
  params: OffChainEngineParams

  constructor(params: OffChainEngineParams) {
    super()
    this.params = params
    // this.contractAddresses = getEthConfig(params.networkName)
  }

  private getEthNetworkName(): EvmNetworkName {
    return this.params.blockchainEnvironment === BlockchainEnvironment.Test ? 'goerli' : 'mainnet'
  }

  protected getContractAddresses(chain: string) {
    switch (chain) {
      case 'ethereum':
        return getEthConfig(this.getEthNetworkName())
      case 'solana':
        throw new Error('not implemented')
      default:
        throw new Error('unknown chain: ' + chain)
    }
  }
}

class OffChainWethStepImpl extends OffChainStepImpl {
  async executeStep(step: WorkflowStep, amount: BigNumber, _statusCallback: StatusCallback): Promise<WorkflowStepResult> {
    const wethAddress = this.getContractAddresses('ethereum').WETH

    const signer = this.params.evm?.['ethereum'].signer
    if (!signer) {
      throw new Error('evm signer not provided')
    }
    const weth = Weth__factory.connect(wethAddress, signer)
    let resultTx: ContractTransaction
    if (step.stepId === 'weth.wrap') {
      resultTx = await weth.deposit({ value: amount })
    } else {
      resultTx = await weth.withdraw(amount)
    }
    const receipt = await resultTx.wait(1)

    const gasCost = receipt.gasUsed.mul(receipt.effectiveGasPrice)

    return {
      outputAmount: amount.toString(),
      gasCost: gasCost.toString() || '0',
      exchangeFee: '0',
    }
  }
}

class OffChainWormholeStepImpl extends OffChainStepImpl {
  async executeStep(step: WorkflowStep, amount: BigNumber, statusCallback: StatusCallback): Promise<WorkflowStepResult> {
    const signer = this.params.evm?.['ethereum'].signer
    if (!signer) {
      throw new Error('evm signer not provided')
    }

    if (!this.params.solana) {
      throw new Error('solana connection not provided')
    }
    const gasPrice = await transferEthereumToSolana(
      signer,
      step.inputAsset,
      amount,
      this.params.solana.connection,
      this.params.solana.userAccount,
      statusCallback,
      step
    )
    return {
      outputAmount: amount.toString(),
      gasCost: gasPrice,
      exchangeFee: '0',
    }
  }
}

export class OffChainStepsFactory implements StepImplFactory {
  params: OffChainEngineParams
  constructor(params: OffChainEngineParams) {
    this.params = params
  }

  getStep(stepId: string): StepImpl {
    let stepImpl: OffChainStepImpl
    switch (stepId) {
      case 'weth.wrap':
      case 'weth.unwrap':
        stepImpl = new OffChainWethStepImpl(this.params)
        break
      case 'wormhole.transfer':
        stepImpl = new OffChainWormholeStepImpl(this.params)
        break
      default:
        throw new Error('unknown stepId: ' + stepId)
    }
    // stepImpl.setNetwork(this.getEvmNetworkName())
    return stepImpl
  }
}
