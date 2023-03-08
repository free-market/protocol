import type { Chain } from '../model'

export type ChainOrStart = Chain | 'start-chain'

export interface WorkflowSegment {
  chains: ChainOrStart[]
  stepIds: string[]
}
