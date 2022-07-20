import { setDefaultWasm } from '@certusone/wormhole-sdk/lib/cjs/solana/wasm'
setDefaultWasm('node')
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { ethConfig, ETH_TEST_WALLET_PRIVATE_KEY, WORMHOLE_RPC_HOSTS, SOLANA_PRIVATE_KEY, solConfig } from './config'
import bs58 from 'bs58'
import {
  attestFromSolana,
  createWrappedOnEth,
  getEmitterAddressSolana,
  getForeignAssetSolana,
  getSignedVAAWithRetry,
  parseSequenceFromLogSolana,
  tryNativeToUint8Array,
} from '@certusone/wormhole-sdk'
import * as ethers from 'ethers'
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { NodeHttpTransport } from '@improbable-eng/grpc-web-node-http-transport'

async function getWormholeWrappedErc20Spl(connection: Connection, erc20Address: string) {
  const SolanaForeignAsset = await getForeignAssetSolana(
    connection,
    solConfig.wormholeTokenBridgeAddress,
    ethConfig.wormholeChainId,
    tryNativeToUint8Array(erc20Address, ethConfig.wormholeChainId)
  )
  // const SolanaForeignAsset = await getForeignAssetSolana(
  //   connection,
  //   SOLANA_TOKEN_BRIDGE_ADDRESS,
  //   ethConfig.wormholeChainId,
  //   tryNativeToUint8Array(ethConfig.wethAddress, ethConfig.wormholeChainId)
  // )

  const solanaMintKey = new PublicKey(SolanaForeignAsset!)
  // const recipient = await Token.getAssociatedTokenAddress(
  //   ASSOCIATED_TOKEN_PROGRAM_ID,
  //   TOKEN_PROGRAM_ID,
  //   solanaMintKey,
  //   keypair.publicKey
  // )
  return solanaMintKey.toString()
}

async function attestSolanaToEvm(erc20Address: string) {
  try {
    // create a keypair for Solana
    const keypair = Keypair.fromSecretKey(bs58.decode(SOLANA_PRIVATE_KEY))
    const payerAddress = keypair.publicKey.toString()
    // attest the test token
    const connection = new Connection(solConfig.jsonRpcUrl, 'confirmed')
    const splAddress = await getWormholeWrappedErc20Spl(connection, erc20Address)

    const transaction = await attestFromSolana(
      connection,
      solConfig.wormholeCoreBridgeAddress,
      solConfig.wormholeTokenBridgeAddress,
      payerAddress,
      splAddress // TEST_SOLANA_TOKEN
    )

    // sign, send, and confirm transaction
    transaction.partialSign(keypair)
    const txid = await connection.sendRawTransaction(transaction.serialize())
    await connection.confirmTransaction(txid)
    const info = await connection.getTransaction(txid)
    if (!info) {
      throw new Error('An error occurred while fetching the transaction info')
    }
    // get the sequence from the logs (needed to fetch the vaa)
    const sequence = parseSequenceFromLogSolana(info)
    const emitterAddress = await getEmitterAddressSolana(solConfig.wormholeTokenBridgeAddress)
    // poll until the guardian(s) witness and sign the vaa
    const { vaaBytes: signedVAA } = await getSignedVAAWithRetry(
      WORMHOLE_RPC_HOSTS,
      solConfig.wormholeChainId,
      emitterAddress,
      sequence,
      {
        transport: NodeHttpTransport(),
      }
    )
    // create a signer for Eth
    const provider = new ethers.providers.WebSocketProvider(ethConfig.jsonRpcUrl)
    const wallet = new ethers.Wallet(ETH_TEST_WALLET_PRIVATE_KEY, provider)

    try {
      await createWrappedOnEth(ethConfig.wormholeTokenBridgeAddress, wallet, signedVAA)
    } catch (e) {
      // this could fail because the token is already attested (in an unclean env)
      console.log(e)
    }
    provider.destroy()
  } catch (e) {
    console.error(e)
  }
}

async function go() {
  await attestSolanaToEvm(ethConfig.wethAddress)
}

void go()
