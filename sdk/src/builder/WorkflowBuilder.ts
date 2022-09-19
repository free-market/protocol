import { Workflow, WorkflowStep, WorkflowStepResult } from '../types'
import { curveThreePoolSwap, curveTriCryptoSwap } from '../steps/curve'
import { wormholeTokenTransfer } from '../steps/wormhole'
import { saberSwap } from '../steps/saber'
import { mangoDeposit, mangoWithdrawal } from '../steps/mango'
import { wethUnwrap, wethWrap } from '../steps/weth'

// TODO not sure exactly what transactions look like for these chains
export type EtheriumTransaction = any
export type SolanaTransaction = any

export type DoWhileCallback = (stepResult: WorkflowStepResult) => boolean | Promise<boolean>

export class WorkflowBuilder {
  private steps = [] as WorkflowStep[]

  // // callbacks to do signing (we don't need setKeyPair AND these signing callbacks)
  // signEtherium?: (transaction: EtheriumTransaction) => void | Promise<void>
  // signSolana?: (transaction: SolanaTransaction) => void | Promise<void>

  addSteps(...steps: WorkflowStep[]): WorkflowBuilder {
    this.steps = this.steps.concat(steps)
    return this
  }

  build(): Workflow {
    return { steps: this.steps }
  }
  // doWhile(steps: WorkflowStep[], callback: DoWhileCallback) => WorkflowBuilder
}

export const StepFactories = {
  weth: {
    wrap: wethWrap,
    unwrap: wethUnwrap,
  },

  curve: {
    threePool: {
      swap: curveThreePoolSwap,
      // addLiquidity: (from: ThreeCurveToken[], amount: MoneyAmount ) => WorkflowStep
    },
    triCrypto: {
      swap: curveTriCryptoSwap,
      //     addLiquidity: (from: TriCryptoToken[], amount: MoneyAmount ) => WorkflowStep
    },
  },

  wormhole: {
    transfer: wormholeTokenTransfer,
  },

  mango: {
    deposit: mangoDeposit,
    withdrawal: mangoWithdrawal,
  },

  saber: {
    swap: saberSwap,
  },
}
