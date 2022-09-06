import { createMint, getAccount, getMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import test from 'ava'
import { createSolanaUser } from './test-utils'
import { TransactionBuilder } from './TransactionBuilder'
import { checkProgram, establishConnection } from './utils'

let connection: Connection
let user1: Keypair
let user2: Keypair
let mint: PublicKey
let programId: PublicKey
const mintAuthority = Keypair.generate()
const freezeAuthority = Keypair.generate()
const TOKEN_AMOUNT = BigInt(100_000_000_000)
test.before(async t => {
  connection = await establishConnection()
  ;[user1, user2, programId] = await Promise.all([
    createSolanaUser(connection, LAMPORTS_PER_SOL),
    createSolanaUser(connection),
    checkProgram(connection),
  ])
  mint = await createMint(
    connection,
    user1,
    mintAuthority.publicKey,
    freezeAuthority.publicKey,
    9 // We are using 9 to match the CLI decimal default exactly
  )
  t.log(`program address=${programId.toBase58()}`)
  t.log(`mint address=${mint.toBase58()}`)
  t.log(`user1 address=${user1.publicKey.toBase58()}`)
  t.log(`user2 address=${user2.publicKey.toBase58()}`)
})

test('solana workflow engine', async t => {
  const [user1TokenAccount, user2TokenAccount] = await Promise.all([
    getOrCreateAssociatedTokenAccount(connection, user1, mint, user1.publicKey),
    getOrCreateAssociatedTokenAccount(connection, user1, mint, user2.publicKey),
  ])
  t.log(`user1 tokenAccount address=${user1TokenAccount.address.toBase58()} owner=${user1TokenAccount.owner.toBase58()}`)
  t.log(`user2 tokenAccount address=${user2TokenAccount.address.toBase58()} owner=${user2TokenAccount.owner.toBase58()}`)
  await mintTo(connection, user1, mint, user1TokenAccount.address, mintAuthority, TOKEN_AMOUNT)
  const mintInfo = await getMint(connection, mint)
  t.log(`mintInfo.supply ${mintInfo.supply}`)

  const fmpTokenAccount = await getOrCreateAssociatedTokenAccount(connection, user1, mint, TransactionBuilder.DELEGATE_PDA, true)
  const [fmpTokenAccountBefore, user1TokenAccountBefore, user2TokenAccountBefore] = await Promise.all([
    getAccount(connection, fmpTokenAccount.address),
    getAccount(connection, user1TokenAccount.address),
    getAccount(connection, user2TokenAccount.address),
  ])
  t.log(`fmp balance before workflow=${fmpTokenAccountBefore.amount}`)
  t.log(`user1 balance before workflow=${user1TokenAccountBefore.amount}`)
  t.log(`user2 balance before workflow=${user2TokenAccountBefore.amount}`)
  t.is(user1TokenAccountBefore.amount, TOKEN_AMOUNT)
  t.is(user2TokenAccountBefore.amount, BigInt(0))

  const txBuilder = new TransactionBuilder(programId, user1)
    .splTokenApprove(user1.publicKey, user1TokenAccount.address, TOKEN_AMOUNT)
    .splTokenTransferWorkflowStep(user1TokenAccount.address, fmpTokenAccount.address, TOKEN_AMOUNT, false)
    .splTokenTransferWorkflowStep(fmpTokenAccount.address, user2TokenAccount.address, 100, true)
  const rv = await txBuilder.executeTransaction(connection)
  t.log(`back from tx ${JSON.stringify(rv)}`)
  const [fmpTokenAccountAfter, user1TokenAccountAfter, user2TokenAccountAfter] = await Promise.all([
    getAccount(connection, fmpTokenAccount.address),
    getAccount(connection, user1TokenAccount.address),
    getAccount(connection, user2TokenAccount.address),
  ])
  t.log(`fmp balance after workflow=${fmpTokenAccountAfter.amount}`)
  t.log(`user1 balance after workflow=${user1TokenAccountAfter.amount}`)
  t.log(`user2 balance after workflow=${user2TokenAccountAfter.amount}`)
  t.is(user1TokenAccountAfter.amount, BigInt(0))
  t.is(user2TokenAccountAfter.amount, TOKEN_AMOUNT)
})
