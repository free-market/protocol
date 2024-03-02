import { TransactionReceipt } from '@ethersproject/providers'
import { EvmTransactionExecutor, TransactionParams } from './EvmTransactionExecutor'
import { Signer } from '@ethersproject/abstract-signer'

import { getLogger } from '@freemarket/core'
const logger = getLogger('WorkflowRunner')

export class EthersTransactionExecutor implements EvmTransactionExecutor {
  signer: Signer

  constructor(signer: Signer) {
    this.signer = signer
  }

  async executeTransactions(transactionParamsArray: TransactionParams[]): Promise<TransactionReceipt[]> {
    const ret: TransactionReceipt[] = []
    // doing this sequentially to avoid nonce issues, and erc20 approvals must come first
    logger.debug(`executing ${transactionParamsArray.length} transactions`)
    for (let i = 0; i < transactionParamsArray.length; ++i) {
      const transactionParams = transactionParamsArray[i]
      logger.debug(`  executing ${i + 1} of ${transactionParamsArray.length} transactions`)
      const txResponse = await this.signer.sendTransaction({ ...transactionParams })
      ret.push(await txResponse.wait())
      logger.debug(`  confirmed ${i + 1} of ${transactionParamsArray.length} transactions`)
    }
    return ret
  }
}
