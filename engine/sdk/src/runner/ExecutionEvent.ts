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

export class ExecutionEvent {
  code: ExecutionEventCode
  args: Record<string, any>
  transactionHash?: string
  constructor(code: ExecutionEventCode, args: Record<string, any>, transactionHash?: string) {
    this.code = code
    this.args = args
    this.transactionHash = transactionHash
  }

  getMessage() {
    switch (this.code) {
      case ExecutionEventCode.Erc20ApprovalsSubmittingAll:
        return `Submitting approvals for ERC20: ${this.args.symbols.join(', ')}`
      case ExecutionEventCode.Erc20ApprovalsSubmitting:
        return `Submitting approvals for ERC20 '${this.args.symbol}' amount=${this.args.amount} `
      case ExecutionEventCode.Erc20ApprovalsConfirmed:
        return `Approvals for ${this.args.symbol} confirmed, tx=${this.transactionHash}`
      case ExecutionEventCode.Erc20ApprovalsConfirmedAll:
        return `All approvals for ERC20s confirmed`
      case ExecutionEventCode.WorkflowSubmitting:
        return `Submitting workflow to ${this.args.chain}`
      case ExecutionEventCode.WorkflowSubmitted:
        return `Workflow submitted, waiting for confirmation`
      case ExecutionEventCode.WorkflowConfirmed:
        return `Workflow confirmed on ${this.args.chain} tx=${this.args.transactionHash}`
      case ExecutionEventCode.WaitingForBridge:
        return `Waiting for ${this.args.bridge} to bridge funds from ${this.args.source} to ${this.args.target}`
      case ExecutionEventCode.Completed:
        return `Workflow has completed successfully`
    }
  }
}

export type ExecutionEventHandler = (event: ExecutionEvent) => void | Promise<void>
