import type { EvmBeforeAfter, EvmWorkflow } from '../evm/EvmWorkflow'
import type { EvmWorkflowStep } from '../evm/EvmWorkflowStep'

export type EncodedWorkflow = EvmWorkflow // | SolanaWorkflow | SuiWorkflow etc

export type EncodedWorkflowStep = Omit<EvmWorkflowStep, 'nextStepIndex'> & { nextStepIndex?: string | number } // | SolanaWorkflowStep etc

export type EncodedBeforeAfter = EvmBeforeAfter
