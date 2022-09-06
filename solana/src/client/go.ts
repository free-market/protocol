import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js'

// import * as borsh from 'borsh'
import { checkProgram, establishConnection, establishPayer } from './utils'
import { createMint, getAccount, getMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import { TransactionBuilder } from './TransactionBuilder'

// interface Foo {
//   greetedPubkey: PublicKey
//   programId: PublicKey
// }

/**
 * The state of a greeting account managed by the hello world program
 */
// class GreetingAccount {
//   counter = 0
//   constructor(fields: { counter: number } | undefined = undefined) {
//     if (fields) {
//       this.counter = fields.counter
//     }
//   }
// }

/**
 * Borsh schema definition for greeting accounts
 */
// const GreetingSchema = new Map([[GreetingAccount, { kind: 'struct', fields: [['counter', 'u32']] }]])

export async function sayHello(): Promise<void> {
  const connection = await establishConnection()
  const payer = await establishPayer(connection)
  const programId = await checkProgram(connection)
  // console.log('Saying hello to', greetedPubkey.toBase58())
  // const instruction = new TransactionInstruction({
  //   keys: [
  //     { pubkey: greetedPubkey, isSigner: false, isWritable: true },
  //     { pubkey: payer.publicKey, isSigner: true, isWritable: false }, // writable gets overridden by the time it reaches the chain
  //   ],
  //   programId,
  //   data: Buffer.alloc(0), // All instructions are hellos
  // })
  // await sendAndConfirmTransaction(connection, new Transaction().add(instruction), [payer])

  // const dummyStep = new WorkflowStep({ amount: new BN(99), amountIsPercent: false, stepId: 66, stepArgs: new Uint8Array([1, 2, 3]) })
  // const dummyWorkflow = new Workflow({ steps: [dummyStep] })

  const user1 = Keypair.generate() // 'payer' in examples
  const user2 = Keypair.generate()
  const mintAuthority = Keypair.generate()
  const freezeAuthority = Keypair.generate()

  console.log(`user1=${user1.publicKey.toString()}`)
  console.log(`user2=${user2.publicKey.toString()}`)
  // const programKeypair = Keypair.generate()
  // log('before programId ' + programKeypair.publicKey.toBase58())

  const airdropSignature = await connection.requestAirdrop(user1.publicKey, LAMPORTS_PER_SOL)
  const latestBlockHash = await connection.getLatestBlockhash()
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: airdropSignature,
  })

  const mint = await createMint(
    connection,
    user1,
    mintAuthority.publicKey,
    freezeAuthority.publicKey,
    9 // We are using 9 to match the CLI decimal default exactly
  )
  console.log('mint address=' + mint.toBase58())

  let mintInfo = await getMint(connection, mint)
  console.log(`initial mint supply ${mintInfo.supply}`)

  const user1TokenAccount = await getOrCreateAssociatedTokenAccount(connection, user1, mint, user1.publicKey)
  console.log(`user1 tokenAccount address=${user1TokenAccount.address.toBase58()} owner=${user1TokenAccount.owner.toBase58()}`)

  const user2TokenAccount = await getOrCreateAssociatedTokenAccount(connection, user1, mint, user2.publicKey)
  console.log(`user2 tokenAccount address=${user2TokenAccount.address.toBase58()} owner=${user2TokenAccount.owner.toBase58()}`)

  let tokenAccountInfo = await getAccount(connection, user1TokenAccount.address)
  console.log(`user1 tokenAccountInfo.amount before minting = ${tokenAccountInfo.amount}`)

  await mintTo(
    connection,
    user1,
    mint,
    user1TokenAccount.address,
    mintAuthority,
    100000000000 // because decimals for the mint are set to 9
  )

  mintInfo = await getMint(connection, mint)
  console.log(`mintInfo.supply after minting ${mintInfo.supply}`)

  tokenAccountInfo = await getAccount(connection, user1TokenAccount.address)
  console.log(`user1 tokenAccountInfo.amount after minting =${tokenAccountInfo.amount}`)

  // const user1AccountInfo = await connection.getAccountInfo(user1.publicKey)
  // log(`user1 accountInfo: ` + JSON.stringify(wtf))

  // const programPubKey = !('F1EJHnyEDWfbTs1bM36an7szd8ftuXJZHL4oFw9mxaiZ')

  // const programAccountInfo = await connection.getAccountInfo(program.programId)
  // log(`program accountInfo: ` + JSON.stringify(programAccountInfo))

  // const additionalAccounts: AccountMeta[] = []

  // const transferArgs = new SplTokenTransferArgs({
  //   // from: user1TokenAccount.address.toBase58(),
  //   // to: user2TokenAccount.address.toBase58(),
  //   fromAddressIndex: additionalAccounts.length + 3, // index will be plus 2 because the 0th will be the signer (user) and 1st will be the program
  //   toAddressIndex: additionalAccounts.length + 4,
  // })

  // additionalAccounts.push({ pubkey: user1TokenAccount.address, isSigner: false, isWritable: true })
  // additionalAccounts.push({ pubkey: user2TokenAccount.address, isSigner: false, isWritable: true })

  console.log('\n---------------------------------------------\n')

  const fmpTokenAccount = await getOrCreateAssociatedTokenAccount(connection, user1, mint, TransactionBuilder.DELEGATE_PDA, true)

  tokenAccountInfo = await getAccount(connection, user1TokenAccount.address)
  console.log(`user1 tokenAccountInfo.amount before workflow=${tokenAccountInfo.amount}`)
  tokenAccountInfo = await getAccount(connection, user2TokenAccount.address)
  console.log(`user2 tokenAccountInfo.amount before workflow=${tokenAccountInfo.amount}`)

  const txBuilder = new TransactionBuilder(programId, user1)
    .splTokenApprove(user1.publicKey, user1TokenAccount.address, 100000000000)
    .splTokenTransferWorkflowStep(user1TokenAccount.address, fmpTokenAccount.address, 100000000000, false)
    .splTokenTransferWorkflowStep(fmpTokenAccount.address, user2TokenAccount.address, 100, true)
  const rv = await txBuilder.executeTransaction(connection)
  console.log('back from tx ' + rv)

  tokenAccountInfo = await getAccount(connection, user1TokenAccount.address)
  console.log(`user1 tokenAccountInfo.amount after workflow=${tokenAccountInfo.amount}`)
  tokenAccountInfo = await getAccount(connection, user2TokenAccount.address)
  console.log(`user2 tokenAccountInfo.amount after workflow=${tokenAccountInfo.amount}`)

  // const xferWorkflow = new Workflow({
  //   steps: [
  //     new WorkflowStep({
  //       stepId: 99,
  //       stepArgs: borshSerialize(transferArgs),
  //       amount: new BN(tokenAccountInfo.amount.toString()),
  //       amountIsPercent: false,
  //     }),
  //   ],
  // })

  // const execWorkflowIx =
  //   executeWorkflow()
  //   // { user_account_info: user1AccountInfo }
  //   // {}
  // const { blockhash } = await connection.getLatestBlockhash()
  // const tx = new Transaction()

  // // tx.recentBlockhash = blockhash
  // // tx.feePayer = user1.publicKey
  // tx.add(execWorkflowIx)
  // // const user1signer: Signer = { publicKey: user1.publicKey, secretKey: user1.secretKey }
  // // transaction.partialSign(user1)
  // // transaction.addSignature(user1)
  // // await anchorProvider.sendAndConfirm(transaction, [user1])

  // log(`about to send`)
  // const asdf = await mySendAndConfirmTransaction(connection, tx, [user1])
  // log(`result of sendAndConfirmTransaction ` + asdf)

  // await executeWorkflow(connection, programId, user1, xferWorkflow, additionalAccounts, user1TokenAccount.address, 100000000000)
  // const accountInfo = await connection.getAccountInfo(greetedPubkey)
  // if (accountInfo === null) {
  //   throw 'Error: cannot find the greeted account'
  // }
  // const greeting = borsh.deserialize(GreetingSchema, GreetingAccount, accountInfo.data)
  // console.log(greetedPubkey.toBase58(), 'has been greeted', greeting.counter, 'time(s)')
}

void sayHello()
// asdf()
