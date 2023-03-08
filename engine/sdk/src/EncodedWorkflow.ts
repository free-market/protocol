import { EvmWorkflow, EvmWorkflowStep } from '@freemarket/evm'

export type ChainType = 'evm' // | 'solana' | 'sui

export type EncodedWorkflow = EvmWorkflow // | SolanaWorkflow | SuiWorkflow

export type EncodedWorkflowStep = EvmWorkflowStep // | SolanaWorkflowStep etc
