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
  // transferFromSolana,
  tryNativeToHexString,
  tryNativeToUint8Array,
} from '@certusone/wormhole-sdk'
import { getBridgeFee, transferFromSolana } from './wormhole-sdk-fork'
import * as ethers from 'ethers'
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { NodeHttpTransport } from '@improbable-eng/grpc-web-node-http-transport'
import { formatUnits, parseUnits } from '@ethersproject/units'

async function transferSolanaToEtherium() {
  // create a signer for Eth
  const ethProvider = new ethers.providers.WebSocketProvider(ethConfig.jsonRpcUrl)
  const ethSigner = new ethers.Wallet(ETH_TEST_WALLET_PRIVATE_KEY, ethProvider)
  const ethWalletAddress = await ethSigner.getAddress()
  // create a keypair for Solana
  const solUserAcctKeypair = Keypair.fromSecretKey(bs58.decode(SOLANA_PRIVATE_KEY))
  const solUserAcctAddress = solUserAcctKeypair.publicKey.toString()

  const solConnection = new Connection(solConfig.jsonRpcUrl, 'confirmed')

  // this is actually the address of a 'mint' (noun form)
  const solForeignAssetMintAddress = await getForeignAssetSolana(
    solConnection,
    solConfig.wormholeTokenBridgeAddress,
    ethConfig.wormholeChainId,
    tryNativeToUint8Array(ethConfig.wethAddress, ethConfig.wormholeChainId)
  )

  if (!solForeignAssetMintAddress) {
    throw new Error('could not find mint')
  }

  // find the associated token account
  const solUserTokenAddress = (
    await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      new PublicKey(solForeignAssetMintAddress),
      solUserAcctKeypair.publicKey
    )
  ).toString()

  // Get the initial solana token balance
  // const tokenFilter: TokenAccountsFilter = {
  //   programId: TOKEN_PROGRAM_ID,
  // }
  // const results = await solConnection.getParsedTokenAccountsByOwner(solUserAcctKeypair.publicKey, tokenFilter)

  // let initialSolanaBalance = 0
  // for (const item of results.value) {
  //   const tokenInfo = item.account.data.parsed.info
  //   const address = tokenInfo.mint
  //   const amount = tokenInfo.tokenAmount.uiAmount
  //   if (tokenInfo.mint === solForeignAssetMintAddress) {
  //     initialSolanaBalance = amount
  //   }
  // }

  const solInitialTokenBalance = await getSplTokenBalance(solConnection, solUserAcctKeypair.publicKey, solForeignAssetMintAddress)

  // Get the initial wallet balance on Eth
  // const ETH_TEST_WALLET_PUBLIC_KEY = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
  const originAssetHex = tryNativeToHexString(solForeignAssetMintAddress, CHAIN_ID_SOLANA)
  if (!originAssetHex) {
    throw new Error('originAssetHex is null')
  }
  let wormholeWrappedEthTokenAddress = await getForeignAssetEth(
    ethConfig.wormholeTokenBridgeAddress,
    ethProvider,
    CHAIN_ID_SOLANA,
    hexToUint8Array(originAssetHex)
  )
  // assuming 0x000 means it's wormhole wrapped on solana side
  if (wormholeWrappedEthTokenAddress === '0x0000000000000000000000000000000000000000') {
    wormholeWrappedEthTokenAddress = ethConfig.wethAddress
  }
  if (!wormholeWrappedEthTokenAddress) {
    throw new Error('wormholeWrappedEthTokenAddress is null')
  }

  // this logic isn't really necessary, we should know if we're dealing with a wh wrapped token or not
  const ethTokenAddress =
    wormholeWrappedEthTokenAddress === ethers.constants.AddressZero ? ethConfig.wethAddress : wormholeWrappedEthTokenAddress

  const ethToken = TokenImplementation__factory.connect(ethTokenAddress, ethSigner)
  const ethInitialTokenBalance = await ethToken.balanceOf(ethSigner.address)

  const bridgeFee = await getBridgeFee(solConnection, solConfig.wormholeCoreBridgeAddress)
  console.log(`bridgeFee that we're not paying: ${bridgeFee} lamparts`)
  // transfer the test token
  // const amount = parseUnits('1', 9).toBigInt()
  const amount = parseUnits('1', 1).toBigInt()
  const transaction = await transferFromSolana(
    solConnection,
    solConfig.wormholeCoreBridgeAddress,
    solConfig.wormholeTokenBridgeAddress,
    solUserAcctAddress,
    solUserTokenAddress,
    solForeignAssetMintAddress,
    amount,
    tryNativeToUint8Array(ethWalletAddress, CHAIN_ID_ETH),
    CHAIN_ID_ETH,
    // the next 2 args are required when transfering an asset that is 'non-native' on the from chain
    tryNativeToUint8Array(ethTokenAddress, ethConfig.wormholeChainId),
    CHAIN_ID_ETH
  )
  // sign, send, and confirm transaction
  transaction.partialSign(solUserAcctKeypair)
  console.log('submitting solana transaction')
  let startTime = Date.now()
  const txid = await solConnection.sendRawTransaction(transaction.serialize())
  await solConnection.confirmTransaction(txid)
  console.log(`solana transaction confirmed in ${Date.now() - startTime}ms`)

  const info = await solConnection.getTransaction(txid)
  if (!info) {
    throw new Error('An error occurred while fetching the transaction info')
  }
  // get the sequence from the logs (needed to fetch the vaa)
  const sequence = parseSequenceFromLogSolana(info)
  const emitterAddress = await getEmitterAddressSolana(solConfig.wormholeTokenBridgeAddress)
  // poll until the guardian(s) witness and sign the vaa

  console.log('calling getSignedVAAWithRetry')
  startTime = Date.now()
  const { vaaBytes: signedVAA } = await getSignedVAAWithRetry(WORMHOLE_RPC_HOSTS, CHAIN_ID_SOLANA, emitterAddress, sequence, {
    transport: NodeHttpTransport(),
  })
  console.log(`getSignedVAAWithRetry completed in ${Date.now() - startTime}ms`)
  // // expect(await getIsTransferCompletedEth(ethConfig.wormholeTokenBridgeAddress, provider, signedVAA)).toBe(false)
  // const foo1 = await getIsTransferCompletedEth(ethConfig.wormholeTokenBridgeAddress, ethProvider, signedVAA)
  // // expect(await getIsTransferCompletedEth(ethConfig.wormholeTokenBridgeAddress, provider, signedVAA)).toBe(false)
  // const foo2 = await getIsTransferCompletedEth(ethConfig.wormholeTokenBridgeAddress, ethProvider, signedVAA)
  console.log('calling redeemOnEth')
  startTime = Date.now()
  await redeemOnEth(ethConfig.wormholeTokenBridgeAddress, ethSigner, signedVAA)
  console.log(`redeemOnEth completed in ${Date.now() - startTime}ms`)
  // const foo3 = await getIsTransferCompletedEth(ethConfig.wormholeTokenBridgeAddress, ethProvider, signedVAA)

  // Get final balance on Solana
  // results = await solConnection.getParsedTokenAccountsByOwner(solUserAcctKeypair.publicKey, tokenFilter)
  // let finalSolanaBalance = 0
  // for (const item of results.value) {
  //   const tokenInfo = item.account.data.parsed.info
  //   const address = tokenInfo.mint
  //   const amount = tokenInfo.tokenAmount.uiAmount
  //   if (tokenInfo.mint === solForeignAssetMintAddress) {
  //     finalSolanaBalance = amount
  //   }
  // }
  // expect(initialSolanaBalance - finalSolanaBalance).toBeCloseTo(1)
  const solFinalTokenBalance = await getSplTokenBalance(solConnection, solUserAcctKeypair.publicKey, solForeignAssetMintAddress)

  // Get the final balance on Eth
  const ethFinalTokenBalance = await ethToken.balanceOf(ethSigner.address)
  // const finalBalOnEthFormatted =
  // expect(parseInt(finalBalOnEthFormatted) - parseInt(initialBalOnEthFormatted) === 1).toBe(true)
  // const foo4 = parseInt(finalBalOnEthFormatted) - parseInt(initialTokenBalOnEthFormatted) === 1

  console.log('initial balance sol ' + solInitialTokenBalance)
  console.log('final   balance sol ' + solFinalTokenBalance)
  console.log('initial balance eth ' + formatUnits(ethInitialTokenBalance._hex, 9))
  console.log('final   balance eth ' + formatUnits(ethFinalTokenBalance._hex, 9))

  ethProvider.destroy()
}

async function getSplTokenBalance(solConnection: Connection, owner: PublicKey, splTokenMintAddr: string) {
  const tokenFilter: TokenAccountsFilter = {
    programId: TOKEN_PROGRAM_ID,
  }
  const results = await solConnection.getParsedTokenAccountsByOwner(owner, tokenFilter)
  let balance = 0
  for (const item of results.value) {
    const tokenInfo = item.account.data.parsed.info
    const amount = tokenInfo.tokenAmount.uiAmount
    if (tokenInfo.mint === splTokenMintAddr) {
      balance = amount
    }
  }
  return balance
}

async function go() {
  try {
    await transferSolanaToEtherium()
  } catch (e) {
    console.error(e)
  }
}

void go()
