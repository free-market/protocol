import type { Chain, PartialRecord } from '@freemarket/core'

export enum ExecutionEventCode {
  Erc20ApprovalsSubmitting = 'Erc20ApprovalsSubmitting',
  Erc20ApprovalsSubmittingAll = 'Erc20ApprovalsSubmittingAll',
  Erc20ApprovalsConfirmed = 'Erc20ApprovalsConfirmed',
  Erc20ApprovalsConfirmedAll = 'Erc20ApprovalsConfirmedAll',
  WorkflowSubmitting = 'WorkflowSubmitting',
  WorkflowSubmitted = 'WorkflowSubmitted',
  WorkflowConfirmed = 'WorkflowConfirmed',
  WaitingForBridge = 'WaitingForBridge',
  Completed = 'Completed',
}

export interface ExecutionEventBase {
  code: string
  // message: string
}

export interface Erc20ApprovalsSubmitting {
  code: 'Erc20ApprovalsSubmitting'
  symbols: string[]
}
export interface Erc20ApprovalsConfirmed {
  code: 'Erc20ApprovalsConfirmed'
  symbols: string[]
}

export interface Erc20ApprovalSubmitting {
  code: 'Erc20ApprovalSubmitting'
  symbol: string
  amount: string
}
export interface Erc20ApprovalConfirmed {
  code: 'Erc20ApprovalConfirmed'
  symbol: string
  transactionHash: string
}

export interface WorkflowSubmitting {
  code: 'WorkflowSubmitting'
  chain: Chain
}

export interface WorkflowSubmitted {
  code: 'WorkflowSubmitted'
  chain: Chain
}

export interface WorkflowConfirmed {
  code: 'WorkflowConfirmed'
  chain: Chain
  transactionHash: string
}

export interface WorkflowWaitingForContinuation {
  code: 'WorkflowWaitingForBridge'
  stepType: string
  sourceChain: Chain
  sourceChainTransactionHash: string
  targetChain: Chain
}

export interface OnChainEvent {
  name: string
  signature: string
  args: Record<string, any>
}

export interface ExecutionEvents {
  chain: Chain
  events: OnChainEvent[]
}

export interface WorkflowComplete {
  code: 'WorkflowComplete'
  chain: Chain
  transactionHash: string
  events: ExecutionEvents[]
}

export type CreateExecutionEventArg =
  | Erc20ApprovalsSubmitting
  | Erc20ApprovalSubmitting
  | Erc20ApprovalsConfirmed
  | Erc20ApprovalConfirmed
  | WorkflowSubmitting
  | WorkflowSubmitted
  | WorkflowConfirmed
  | WorkflowWaitingForContinuation
  | WorkflowComplete

export type ExecutionEvent = CreateExecutionEventArg & { message: string }

export function createExecutionEvent(event: CreateExecutionEventArg): ExecutionEvent {
  switch (event.code) {
    case 'Erc20ApprovalsSubmitting':
      return { ...event, message: `Submitting approvals for ERC20: ${event.symbols.join(', ')}` }
    case 'Erc20ApprovalSubmitting':
      return { ...event, message: `Submitting approval for ERC20 '${event.symbol}' amount=${event.amount}` }

    case 'Erc20ApprovalConfirmed':
      return { ...event, message: `Approval for ${event.symbol} confirmed, tx=${event.transactionHash}` }
    case 'Erc20ApprovalsConfirmed':
      return { ...event, message: `All approvals for ERC20s confirmed` }
    case 'WorkflowSubmitting':
      return { ...event, message: `Submitting workflow to ${event.chain}` }
    case 'WorkflowSubmitted':
      return { ...event, message: `Workflow submitted, waiting for confirmation` }
    case 'WorkflowConfirmed':
      return { ...event, message: `Workflow confirmed on ${event.chain} tx=${event.transactionHash}` }
    case 'WorkflowWaitingForBridge':
      return { ...event, message: `Waiting for ${event.stepType} to bridge funds from ${event.sourceChain} to ${event.targetChain}` }
    case 'WorkflowComplete':
      return { ...event, message: `Workflow has completed successfully` }
  }
}

export type ExecutionEventHandler = (event: ExecutionEvent) => void | Promise<void>
