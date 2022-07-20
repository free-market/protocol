import { setDefaultWasm } from '@certusone/wormhole-sdk/lib/cjs/solana/wasm'
setDefaultWasm('node')
import { Connection, Keypair, PublicKey, TokenAccountsFilter } from '@solana/web3.js'
import { ethConfig, ETH_TEST_WALLET_PRIVATE_KEY, WORMHOLE_RPC_HOSTS, SOLANA_PRIVATE_KEY, solConfig } from './config'
import bs58 from 'bs58'
import {
  attestFromSolana,
  CHAIN_ID_ETH,
  CHAIN_ID_SOLANA,
  createWrappedOnEth,
  getEmitterAddressSolana,
  getForeignAssetEth,
  getForeignAssetSolana,
  getIsTransferCompletedEth,
  getSignedVAAWithRetry,
  hexToUint8Array,
  parseSequenceFromLogSolana,
  redeemOnEth,
  TokenImplementation__factory,
  transferFromSolana,
  tryNativeToHexString,
  tryNativeToUint8Array,
} from '@certusone/wormhole-sdk'
import * as ethers from 'ethers'
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { NodeHttpTransport } from '@improbable-eng/grpc-web-node-http-transport'
import { formatUnits, parseUnits } from '@ethersproject/units'

async function transferSolanaToEtherium() {
  // create a signer for Eth
  const provider = new ethers.providers.WebSocketProvider(ethConfig.jsonRpcUrl)
  const signer = new ethers.Wallet(ETH_TEST_WALLET_PRIVATE_KEY, provider)
  const targetAddress = await signer.getAddress()
  // create a keypair for Solana
  const keypair = Keypair.fromSecretKey(bs58.decode(SOLANA_PRIVATE_KEY))
  const payerAddress = keypair.publicKey.toString()

  const connection = new Connection(solConfig.jsonRpcUrl, 'confirmed')

  const SolanaForeignAsset = await getForeignAssetSolana(
    connection,
    solConfig.wormholeTokenBridgeAddress,
    ethConfig.wormholeChainId,
    tryNativeToUint8Array(ethConfig.wethAddress, ethConfig.wormholeChainId)
  )

  if (!SolanaForeignAsset) {
    throw new Error('could not find whweth')
  }

  // find the associated token account
  const fromAddress = (
    await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      new PublicKey(SolanaForeignAsset),
      keypair.publicKey
    )
  ).toString()

  // Get the initial solana token balance
  const tokenFilter: TokenAccountsFilter = {
    programId: TOKEN_PROGRAM_ID,
  }
  let results = await connection.getParsedTokenAccountsByOwner(keypair.publicKey, tokenFilter)
  let initialSolanaBalance: number = 0
  for (const item of results.value) {
    const tokenInfo = item.account.data.parsed.info
    const address = tokenInfo.mint
    const amount = tokenInfo.tokenAmount.uiAmount
    if (tokenInfo.mint === SolanaForeignAsset) {
      initialSolanaBalance = amount
    }
  }

  // Get the initial wallet balance on Eth
  // const ETH_TEST_WALLET_PUBLIC_KEY = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
  const originAssetHex = tryNativeToHexString(SolanaForeignAsset, CHAIN_ID_SOLANA)
  if (!originAssetHex) {
    throw new Error('originAssetHex is null')
  }
  let foreignAsset = await getForeignAssetEth(
    ethConfig.wormholeTokenBridgeAddress,
    provider,
    CHAIN_ID_SOLANA,
    hexToUint8Array(originAssetHex)
  )
  // not sure what zero really means here, it might mean the input to above was a wormhole wrapped
  if (foreignAsset === '0x0000000000000000000000000000000000000000') {
    foreignAsset = ethConfig.wethAddress
  }
  if (!foreignAsset) {
    throw new Error('foreignAsset is null')
    foreignAsset = ethConfig.wethAddress
  }
  let token = TokenImplementation__factory.connect(foreignAsset, signer)
  const initialBalOnEth = await token.balanceOf(signer.address)
  const initialBalOnEthFormatted = formatUnits(initialBalOnEth._hex, 9)

  // transfer the test token
  // const amount = parseUnits('1', 9).toBigInt()
  const amount = parseUnits('1', 1).toBigInt()
  const transaction = await transferFromSolana(
    connection,
    solConfig.wormholeCoreBridgeAddress,
    solConfig.wormholeTokenBridgeAddress,
    payerAddress,
    fromAddress,
    SolanaForeignAsset,
    amount,
    tryNativeToUint8Array(targetAddress, CHAIN_ID_ETH),
    CHAIN_ID_ETH,
    // the next 2 args are required when transfering an asset that is 'non-native' on the from chain
    tryNativeToUint8Array(ethConfig.wethAddress, ethConfig.wormholeChainId),
    CHAIN_ID_ETH
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
    CHAIN_ID_SOLANA,
    emitterAddress,
    sequence,
    {
      transport: NodeHttpTransport(),
    }
  )
  // expect(await getIsTransferCompletedEth(ethConfig.wormholeTokenBridgeAddress, provider, signedVAA)).toBe(false)
  const foo1 = await getIsTransferCompletedEth(ethConfig.wormholeTokenBridgeAddress, provider, signedVAA)
  // expect(await getIsTransferCompletedEth(ethConfig.wormholeTokenBridgeAddress, provider, signedVAA)).toBe(false)
  const foo2 = await getIsTransferCompletedEth(ethConfig.wormholeTokenBridgeAddress, provider, signedVAA)
  await redeemOnEth(ethConfig.wormholeTokenBridgeAddress, signer, signedVAA)
  const foo3 = await getIsTransferCompletedEth(ethConfig.wormholeTokenBridgeAddress, provider, signedVAA)

  // Get final balance on Solana
  results = await connection.getParsedTokenAccountsByOwner(keypair.publicKey, tokenFilter)
  let finalSolanaBalance: number = 0
  for (const item of results.value) {
    const tokenInfo = item.account.data.parsed.info
    const address = tokenInfo.mint
    const amount = tokenInfo.tokenAmount.uiAmount
    if (tokenInfo.mint === SolanaForeignAsset) {
      finalSolanaBalance = amount
    }
  }
  // expect(initialSolanaBalance - finalSolanaBalance).toBeCloseTo(1)

  // Get the final balance on Eth
  const finalBalOnEth = await token.balanceOf(signer.address)
  const finalBalOnEthFormatted = formatUnits(finalBalOnEth._hex, 9)
  // expect(parseInt(finalBalOnEthFormatted) - parseInt(initialBalOnEthFormatted) === 1).toBe(true)
  const foo4 = parseInt(finalBalOnEthFormatted) - parseInt(initialBalOnEthFormatted) === 1
  provider.destroy()
}

void transferSolanaToEtherium()
