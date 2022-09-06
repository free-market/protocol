/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import os from 'os'
import fs from 'mz/fs'
import path from 'path'
import yaml from 'yaml'
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { GREETING_SIZE } from './hello_world'

/**
 * Path to program files
 */
const PROGRAM_PATH = path.resolve(__dirname, '../../dist/program')

/**
 * Path to program shared object file which should be deployed on chain.
 * This file is created when running either:
 *   - `npm run build:program-c`
 *   - `npm run build:program-rust`
 */
export const PROGRAM_SO_PATH = path.join(PROGRAM_PATH, 'helloworld.so')

/**
 * Path to the keypair of the deployed program.
 * This file is created when running `solana program deploy dist/program/helloworld.so`
 */
// export const PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, 'helloworld-keypair.json')
export const PROGRAM_KEYPAIR_PATH = path.join('.', 'fmpFA4XgySc6xKec4y5iW8LbQaRpJfhw8Zq9g5LZNvv.json')

export async function establishConnection(): Promise<Connection> {
  const rpcUrl = await getRpcUrl()
  const connection = new Connection(rpcUrl, 'confirmed')
  const version = await connection.getVersion()
  console.log('Connection to cluster established:', rpcUrl, version)
  return connection
}

/**
 * Establish an account to pay for everything
 */
export async function establishPayer(connection: Connection): Promise<Keypair> {
  let fees = 0
  const { feeCalculator } = await connection.getRecentBlockhash()

  console.log(GREETING_SIZE)
  // Calculate the cost to fund the greeter account
  fees += await connection.getMinimumBalanceForRentExemption(GREETING_SIZE)

  // Calculate the cost of sending transactions
  fees += feeCalculator.lamportsPerSignature * 100 // wag

  const payer = await getPayer()

  let lamports = await connection.getBalance(payer.publicKey)
  if (lamports < fees) {
    // If current balance is not enough to pay for fees, request an airdrop
    const sig = await connection.requestAirdrop(payer.publicKey, fees - lamports)
    await connection.confirmTransaction(sig)
    lamports = await connection.getBalance(payer.publicKey)
  }

  console.log('Using account', payer.publicKey.toBase58(), 'containing', lamports / LAMPORTS_PER_SOL, 'SOL to pay for fees')
  return payer
}

/**
 * Check if the hello world BPF program has been deployed
 */
export async function checkProgram(connection: Connection): Promise<PublicKey> {
  // Read program id from keypair file
  try {
    const programKeypair = await createKeypairFromFile(PROGRAM_KEYPAIR_PATH)
    const programId = programKeypair.publicKey
    // Check if the program has been deployed
    const programInfo = await connection.getAccountInfo(programId)
    if (programInfo === null) {
      if (fs.existsSync(PROGRAM_SO_PATH)) {
        throw new Error('Program needs to be deployed with `solana program deploy dist/program/helloworld.so`')
      } else {
        throw new Error('Program needs to be built and deployed')
      }
    } else if (!programInfo.executable) {
      throw new Error(`Program is not executable`)
    }
    console.log(`Using program ${programId.toBase58()}`)

    // // Derive the address (public key) of a greeting account from the program so that it's easy to find later.
    // const GREETING_SEED = 'hello'
    // const greetedPubkey = await PublicKey.createWithSeed(payer.publicKey, GREETING_SEED, programId)

    // // Check if the greeting account has already been created
    // const greetedAccount = await connection.getAccountInfo(greetedPubkey)
    // if (greetedAccount === null) {
    //   console.log('Creating account', greetedPubkey.toBase58(), 'to say hello to')
    //   const lamports = await connection.getMinimumBalanceForRentExemption(GREETING_SIZE)

    //   const transaction = new Transaction().add(
    //     SystemProgram.createAccountWithSeed({
    //       fromPubkey: payer.publicKey,
    //       basePubkey: payer.publicKey,
    //       seed: GREETING_SEED,
    //       newAccountPubkey: greetedPubkey,
    //       lamports,
    //       space: GREETING_SIZE,
    //       programId,
    //     })
    //   )
    //   await sendAndConfirmTransaction(connection, transaction, [payer])
    // }
    // return { greetedPubkey, programId }
    return programId
  } catch (err) {
    const errMsg = (err as Error).message
    throw new Error(
      `Failed to read program keypair at '${PROGRAM_KEYPAIR_PATH}' due to error: ${errMsg}. Program may need to be deployed with \`solana program deploy dist/program/helloworld.so\``
    )
  }
}

/**
 * @private
 */
async function getConfig(): Promise<any> {
  // Path to Solana CLI config file
  const CONFIG_FILE_PATH = path.resolve(os.homedir(), '.config', 'solana', 'cli', 'config.yml')
  const configYml = await fs.readFile(CONFIG_FILE_PATH, { encoding: 'utf8' })
  return yaml.parse(configYml)
}

/**
 * Load and parse the Solana CLI config file to determine which RPC url to use
 */
export async function getRpcUrl(): Promise<string> {
  try {
    const config = await getConfig()
    if (!config.json_rpc_url) throw new Error('Missing RPC URL')
    return config.json_rpc_url
  } catch (err) {
    console.warn('Failed to read RPC url from CLI config file, falling back to localhost')
    return 'http://127.0.0.1:8899'
  }
}

/**
 * Load and parse the Solana CLI config file to determine which payer to use
 */
export async function getPayer(): Promise<Keypair> {
  try {
    const config = await getConfig()
    if (!config.keypair_path) throw new Error('Missing keypair path')
    return await createKeypairFromFile(config.keypair_path)
  } catch (err) {
    console.warn('Failed to create keypair from CLI config file, falling back to new random keypair')
    return Keypair.generate()
  }
}

/**
 * Create a Keypair from a secret key stored in file as bytes' array
 */
export async function createKeypairFromFile(filePath: string): Promise<Keypair> {
  const secretKeyString = await fs.readFile(filePath, { encoding: 'utf8' })
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString))
  return Keypair.fromSecretKey(secretKey)
}
