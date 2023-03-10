import type { EvmWorkflow, EvmWorkflowStep } from '@freemarket/evm'

export type EncodedWorkflow = EvmWorkflow // | SolanaWorkflow | SuiWorkflow etc

export type EncodedWorkflowStep = Omit<EvmWorkflowStep, 'nextStepIndex'> // | SolanaWorkflowStep etc
