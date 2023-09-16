import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers'
import { EvmTransactionExecutor, TransactionParams } from './EvmTransactionExecutor'
import { Signer } from '@ethersproject/abstract-signer'

export class EthersTransactionExecutor implements EvmTransactionExecutor {
  signer: Signer

  constructor(signer: Signer) {
    this.signer = signer
  }

  async executeTransactions(transactionParamsArray: TransactionParams[]): Promise<TransactionReceipt[]> {
    const ret: TransactionReceipt[] = []
    // doing this sequentially to avoid nonce issues, and erc20 approvals must come first
    for (const transactionParams of transactionParamsArray) {
      const txResponse = await this.signer.sendTransaction({ ...transactionParams })
      ret.push(await txResponse.wait())
    }
    return ret
  }
}
