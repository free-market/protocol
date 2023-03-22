import type { ChainOrStart } from '@freemarket/core'

export interface WorkflowSegment {
  chains: ChainOrStart[]
  stepIds: string[]
}
