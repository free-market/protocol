import { TransactionReceipt } from '@ethersproject/providers'

export { TransactionReceipt } from '@ethersproject/providers'

export type BigIntIsh = bigint | number | string

export type TransactionParams = {
  to: string
  value?: BigIntIsh
  data?: string
  gasLimit?: BigIntIsh
}

export interface EvmTransactionExecutor {
  executeTransactions(transactionParamsArray: TransactionParams[]): Promise<TransactionReceipt[]>
}
