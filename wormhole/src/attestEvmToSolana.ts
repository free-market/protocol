import { setDefaultWasm } from '@certusone/wormhole-sdk/lib/cjs/solana/wasm'
setDefaultWasm('node')

import * as ethers from 'ethers'

import { Connection, Keypair } from '@solana/web3.js'
import {
  attestFromEth,
  CHAIN_ID_ETH,
  createWrappedOnSolana,
  getEmitterAddressEth,
  getSignedVAAWithRetry,
  parseSequenceFromLogEth,
  postVaaSolana,
} from '@certusone/wormhole-sdk'
import { NodeHttpTransport } from '@improbable-eng/grpc-web-node-http-transport'
import bs58 from 'bs58'
import { ethConfig, ETH_TEST_WALLET_PRIVATE_KEY, WORMHOLE_RPC_HOSTS, SOLANA_PRIVATE_KEY, solConfig } from './config'

async function attestEtheriumTokenOnSolana(tokenAddress: string) {
  try {
    // create a signer for Eth
    const provider = new ethers.providers.WebSocketProvider(ethConfig.jsonRpcUrl)
    const signer = new ethers.Wallet(ETH_TEST_WALLET_PRIVATE_KEY, provider)
    // attest the test token
    const receipt = await attestFromEth(ethConfig.wormholeTokenBridgeAddress, signer, tokenAddress)
    // get the sequence from the logs (needed to fetch the vaa)
    const sequence = parseSequenceFromLogEth(receipt, ethConfig.wormholeCoreBridgeAddress)
    const emitterAddress = getEmitterAddressEth(ethConfig.wormholeTokenBridgeAddress)
    // poll until the guardian(s) witness and sign the vaa
    const { vaaBytes: signedVAA } = await getSignedVAAWithRetry(
      WORMHOLE_RPC_HOSTS,
      CHAIN_ID_ETH,
      emitterAddress,
      sequence,
      {
        transport: NodeHttpTransport(),
      }
    )
    // create a keypair for Solana
    const keypair = Keypair.fromSecretKey(bs58.decode(SOLANA_PRIVATE_KEY))
    const payerAddress = keypair.publicKey.toString()
    // post vaa to Solana
    const connection = new Connection(solConfig.jsonRpcUrl, 'confirmed')
    await postVaaSolana(
      connection,
      async (transaction) => {
        transaction.partialSign(keypair)
        return transaction
      },
      solConfig.wormholeCoreBridgeAddress,
      payerAddress,
      Buffer.from(signedVAA)
    )
    // create wormhole wrapped token (mint and metadata) on solana
    const transaction = await createWrappedOnSolana(
      connection,
      solConfig.wormholeCoreBridgeAddress,
      solConfig.wormholeTokenBridgeAddress,
      payerAddress,
      signedVAA
    )
    // sign, send, and confirm transaction
    try {
      transaction.partialSign(keypair)
      const txid = await connection.sendRawTransaction(transaction.serialize())
      await connection.confirmTransaction(txid)
    } catch (e) {
      console.log('possibly non fatal because token is already attested', (e as Error).stack)
      // this could fail because the token is already attested (in an unclean env)
    }
    provider.destroy()
  } catch (e) {
    console.error(e)
  }
}

async function go() {
  try {
    await attestEtheriumTokenOnSolana(ethConfig.wethAddress)
    console.log('success!')
  } catch (e) {
    console.log(e)
  }
}

void go()
