import { field, vec } from '@dao-xyz/borsh'
import BN from 'bn.js'
import { BorshPubkey } from './BorshPubkey'

export class WorkflowStep {
  constructor(init: WorkflowStep) {
    // Object.assign(this, init)
    this.stepId = init.stepId
    // this.fromToken = init.fromToken
    this.amount = init.amount
    this.amountIsPercent = init.amountIsPercent
    this.stepArgs = init.stepArgs
  }

  @field({ type: 'u16' })
  stepId: number
  // @field(BorshPubkey)
  // fromToken: string
  @field({ type: 'u64' })
  amount: BN
  @field({ type: 'bool' })
  amountIsPercent: boolean
  @field({ type: vec('u8') })
  stepArgs: Uint8Array
}
