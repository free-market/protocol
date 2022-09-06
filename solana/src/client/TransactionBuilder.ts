import { createApproveInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
  AccountMeta,
} from '@solana/web3.js'
import { SplTokenTransferArgs } from './transferSplTokens'
import { Workflow } from './Workflow'
import { WorkflowStep } from './WorkflowStep'
import { serialize as borshSerialize } from '@dao-xyz/borsh'
import BN from 'bn.js'

export class TransactionBuilder {
  // private PDA = new PublicKey('5AiKsyTdjKUZkDmHjJBo6nkzBgztpbsd88TToxkBrcaS')
  static DELEGATE_PDA = new PublicKey('GeTAkCEtPkbtqkKQ36i99rqoamFGn5hbirknGVDdYL6M')

  private caller: Keypair
  private accounts: AccountMeta[] = []
  private instructions: TransactionInstruction[] = []
  private workflowSteps: WorkflowStep[] = []
  private programId: PublicKey

  constructor(programId: PublicKey, caller: Keypair) {
    this.caller = caller
    this.programId = programId
    this.accounts.push({ pubkey: caller.publicKey, isSigner: true, isWritable: false })
    this.accounts.push({ pubkey: programId, isSigner: false, isWritable: false })
    this.accounts.push({ pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false })
    this.accounts.push({ pubkey: TransactionBuilder.DELEGATE_PDA, isSigner: false, isWritable: false })
  }

  splTokenApprove(fromOwner: PublicKey, fromTokenAccount: PublicKey, amount: number | bigint): TransactionBuilder {
    // this.addAccount(fromOwner, false)
    // this.addAccount(fromTokenAccount, true)
    // this.addAccount(this.PDA, false)
    this.instructions.push(createApproveInstruction(fromTokenAccount, TransactionBuilder.DELEGATE_PDA, fromOwner, amount))
    return this
  }

  splTokenTransferWorkflowStep(
    // mintAddress: PublicKey,
    from: PublicKey,
    to: PublicKey,
    amount: number | bigint,
    amountIsPercent: boolean
  ): TransactionBuilder {
    // void this.accounts.push({ pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false })
    const fromAddressIndex = this.addAccount(from, true)
    const toAddressIndex = this.addAccount(to, true)
    const transferArgs = new SplTokenTransferArgs({ fromAddressIndex, toAddressIndex })
    const transferStep = new WorkflowStep({
      stepId: 1,
      // fromToken: mintAddress.toString(),
      amount: this.toBn(amount),
      amountIsPercent,
      stepArgs: borshSerialize(transferArgs),
    })
    this.workflowSteps.push(transferStep)
    return this
  }

  executeTransaction(connection: Connection): Promise<string> {
    const tx = new Transaction()
    this.instructions.forEach(ix => tx.add(ix))
    tx.add(this.workflowInstruction(this.programId))
    return sendAndConfirmTransaction(connection, tx, [this.caller])
  }

  private workflowInstruction(programId: PublicKey) {
    const workflow = new Workflow({
      steps: this.workflowSteps,
    })
    const workflowData = borshSerialize(workflow)
    const operationId = Buffer.from([1])
    const ixData = Buffer.concat([operationId, workflowData])
    const workflowIx = new TransactionInstruction({
      keys: this.accounts,
      programId,
      data: ixData,
    })
    return workflowIx
  }

  private toBn(amount: number | bigint) {
    if (typeof amount === 'bigint') {
      return new BN(amount.toString())
    }
    return new BN(amount)
  }

  private addAccount(pubkey: PublicKey, isWritable: boolean): number {
    let index = this.accounts.findIndex(it => it.pubkey.equals(pubkey))
    if (index === -1) {
      index = this.accounts.length
      this.accounts.push({ pubkey, isSigner: false, isWritable })
    } else {
      this.accounts[index].isWritable = this.accounts[index].isWritable || isWritable
    }
    return index
  }
}
