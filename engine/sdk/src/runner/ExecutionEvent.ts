enum ExecutionEventCode {
  Submitted,
  TransactionPending,
  WaitingForBridge,
  Completed,
}

export class ExecutionEvent {
  code: ExecutionEventCode
  args: Record<string, string>
  constructor(code: ExecutionEventCode, args: Record<string, string>) {
    this.code = code
    this.args = args
  }

  getMessage() {
    switch (this.code) {
      case ExecutionEventCode.Submitted:
        return `Workflow submitted to chain ${this.args.chain}`
      case ExecutionEventCode.TransactionPending:
        return `Waiting for transaction on chain ${this.args.chain}`
      case ExecutionEventCode.WaitingForBridge:
        return `Waiting for ${this.args.bridge} to bridge funds from ${this.args.source} to ${this.args.target}`
      case ExecutionEventCode.Completed:
        return `Workflow has completed successfully`
    }
  }
}

export type ExecutionEventHandler = (event: ExecutionEvent) => void | Promise<void>
