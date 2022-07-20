import * as anchor from '@project-serum/anchor'
import { Program } from '@project-serum/anchor'
import { Fmp } from '../target/types/fmp'
import { Connection, Keypair, PublicKey, TokenAccountsFilter, Transaction } from '@solana/web3.js'
import bs58 from 'bs58'
import { executeWorkflow } from '../dist/instructions'
export const SOLANA_PRIVATE_KEY = 'GR4HndXZHhi1sV77G7yupFgvNbxjXzgQ6R18diuXmYkDciuKZ9Xvodw9PfrtG8Nb261bPsRuvUt9JECpMK7TMR6'

import { deserialize, serialize, field, variant, vec, OverrideType } from '@dao-xyz/borsh'
import BN from 'bn.js'

const wormholeCoreBridgeAddress = '3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5'
const fakeAddress1 = 'fake1UVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5'
const fakeAddress2 = 'fake2UVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5'
const fakeAddress3 = 'fake3UVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5'
const fakeAddress4 = 'fake4UVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5'
const fakeAddress5 = 'fake5UVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5'
const fakeAddress6 = 'fake6UVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5'
const fakeAddress7 = 'fake7UVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5'
const fakeAddress8 = 'fake8UVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5'
const fakeAddress9 = 'fake9UVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5'

function randomBytes(length: number) {
  const x = new Uint8Array(length)
  for (let i = 0; i < length; ++i) {
    x[i] = Math.floor(Math.random() * 256)
  }
  return x
}

function Base58(bytes: number): OverrideType<string> {
  return {
    serialize: (value: string, writer) => {
      writer.writeFixedArray(bs58.decode(value))
    },
    deserialize: (reader): string => {
      return bs58.encode(reader.readFixedArray(bytes))
    },
  }
}

const Base58_32 = Base58(32)
const Base58_64 = Base58(64)

class WormholeTransfer {
  constructor(init?: WormholeTransfer) {
    if (init) {
      Object.assign(this, init)
    }
  }

  @field({ type: 'u32' })
  nonce: number

  @field(Base58_32)
  program_id: string

  @field(Base58_32)
  bridge_id: string

  @field(Base58_32)
  payer: string

  @field(Base58_32)
  from: string // from address or mint address?

  // @field({ type: 'u256' })
  // target_address: BN

  // @field({ type: 'u16' })
  // target_chain: number

  // @field({ type: 'u256' })
  // token_address: BN

  // @field({ type: 'u16' })
  // token_chain: number

  // @field({ type: 'u256' })
  // from_owner: BN

  @field({ type: 'u64' })
  fee: BN
}

describe('fmp', () => {
  // Configure the client to use the local cluster.
  const anchorProvider = anchor.AnchorProvider.env()
  anchor.setProvider(anchorProvider)

  const program = anchor.workspace.Fmp as Program<Fmp>

  it('Is initialized!', async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc()
    console.log('Your transaction signature', tx)
    // const num = new anchor.BN.BN(123)
    // const tx2 = await program.methods.executeWorkflow('asdf').rpc()
    // // program.rpc
    // console.log('Your transaction signature', tx2)

    // const connection = new Connection('http://localhost:8899', 'confirmed')
    const keypair = Keypair.fromSecretKey(bs58.decode(SOLANA_PRIVATE_KEY))

    const x1 = new Uint8Array([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
    ])
    const x2 = new Uint8Array([
      10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128,
      129, 130, 131,
    ])

    const s1 = bs58.encode(x1)
    const s2 = bs58.encode(x2)
    // console.log(`s1 ${s1}`)
    // console.log(`s2 ${s2}`)

    const wh = new WormholeTransfer({
      nonce: 1,
      program_id: bs58.encode(randomBytes(32)),
      bridge_id: bs58.encode(randomBytes(32)),
      payer: bs58.encode(randomBytes(32)),
      from: bs58.encode(randomBytes(32)),
      // target_address: new BN('6'),
      // target_chain: 7,
      // token_address: new BN('8'),
      // token_chain: 9,
      // from_owner: new BN('10'),
      fee: new BN(2),
    })

    console.log(JSON.stringify(wh, null, 4))

    const whBits = serialize(wh)

    // const whBits = new Uint8Array(2)
    // whBits[0] = 42
    // whBits[1] = 66

    const execWfIx = executeWorkflow({
      steps: [
        {
          stepId: 99,
          data: whBits,
        },
      ],
    })

    const provider = anchor.getProvider()
    const connection = provider.connection
    const wallet = anchorProvider.wallet
    const { blockhash } = await connection.getLatestBlockhash()
    const transaction = new Transaction()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = keypair.publicKey
    transaction.add(execWfIx)
    // transaction.partialSign(signer)
    await anchorProvider.sendAndConfirm(transaction)
    // const txid = await connection.sendRawTransaction(transaction.serialize())
    // await connection.confirmTransaction(txid)
    // const info = await connection.getTransaction(txid)
    // if (!info) {
    //   throw new Error('An error occurred while fetching the transaction info')
    // } else {
    //   console.log('omg')
    // }
  })
})
