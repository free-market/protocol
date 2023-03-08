import type { EvmWorkflow, EvmWorkflowStep } from '@freemarket/evm'

export type EncodedWorkflow = EvmWorkflow // | SolanaWorkflow | SuiWorkflow

export type EncodedWorkflowStep = EvmWorkflowStep // | SolanaWorkflowStep etc
