import { setDefaultWasm } from '@certusone/wormhole-sdk/lib/cjs/solana/wasm'
setDefaultWasm('node')
import log from 'loglevel'
import {
  attestFromEth,
  ChainId,
  CHAINS,
  CHAIN_ID_ETH,
  CHAIN_ID_ETHEREUM_ROPSTEN,
  CHAIN_ID_SOLANA,
  createWrappedOnSolana,
  getEmitterAddressEth,
  getForeignAssetSolana,
  getIsTransferCompletedSolana,
  getSignedVAAWithRetry,
  parseSequenceFromLogEth,
  postVaaSolana,
  redeemOnSolana,
  transferFromEth,
  tryNativeToUint8Array,
  tryNativeToHexString,
  createNonce,
} from '@certusone/wormhole-sdk'

import { Connection, Keypair, PublicKey, TokenAccountsFilter, Transaction } from '@solana/web3.js'
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import dotenv from 'dotenv'
import bs58 from 'bs58'
import * as ethers from 'ethers'
import { ethConfig, solConfig, WorkflowEventType, WORMHOLE_RPC_HOSTS } from '@fmp/sdk'

import { Weth__factory } from '@fmp/evm'
import { NodeHttpTransport } from '@improbable-eng/grpc-web-node-http-transport'
import { StatusCallback } from '@fmp/sdk/dist/engine/StepImpl'
import { Asset, WorkflowStep } from '@fmp/sdk'

export async function transferEthereumToSolana(
  signer: ethers.Signer,
  inputAsset: Asset,
  amountToTransfer: ethers.BigNumber,
  connection: Connection,
  keypair: Keypair,
  statusCallback: StatusCallback,
  step: WorkflowStep
) {
  // TODO where does the ERC20 contract address come from
  const token = Weth__factory.connect(ethConfig.wethAddress, signer)

  // const connection = new Connection(solConfig.jsonRpcUrl, 'confirmed')
  // const keypair = Keypair.fromSecretKey(bs58.decode(SOLANA_PRIVATE_KEY))
  const payerAddress = keypair.publicKey.toString()

  statusCallback(WorkflowEventType.StatusUpdate, 'Processing transfer parameters', [step])
  const SolanaForeignAsset = await getForeignAssetSolana(
    connection,
    solConfig.wormholeTokenBridgeAddress,
    ethConfig.wormholeChainId,
    tryNativeToUint8Array(ethConfig.wethAddress, ethConfig.wormholeChainId)
  )

  // TODO null check

  const solanaMintKey = new PublicKey(SolanaForeignAsset!)
  const recipient = getAssociatedTokenAddressSync(solanaMintKey, keypair.publicKey)
  const DECIMALS = 18

  // approve the bridge to spend tokens
  statusCallback(WorkflowEventType.StatusUpdate, 'Approving token bridge', [step])
  const approveTxResult = await token.approve(ethConfig.wormholeTokenBridgeAddress, amountToTransfer)
  const asdf = await approveTxResult.wait(1)

  statusCallback(WorkflowEventType.StatusUpdate, 'Calling the bridge', [step])

  // transfer tokens
  const transferFromEthReceipt = await transferFromEth(
    ethConfig.wormholeTokenBridgeAddress,
    signer,
    ethConfig.wethAddress, // TODO remove hard coding
    amountToTransfer,
    CHAIN_ID_SOLANA,
    tryNativeToUint8Array(recipient.toString(), CHAIN_ID_SOLANA),
    undefined,
    { gasLimit: 2_000_000 }
  )

  // printGasFromReceipt(receipt, 'wh.transferFromEth')
  // get the sequence from the logs (needed to fetch the vaa)
  log.debug('bridge called')
  const sequence = parseSequenceFromLogEth(transferFromEthReceipt, ethConfig.wormholeCoreBridgeAddress)
  log.debug('sequence', sequence)
  const emitterAddress = getEmitterAddressEth(ethConfig.wormholeTokenBridgeAddress)
  log.debug('emitterAddress', emitterAddress)
  // poll until the guardian(s) witness and sign the vaa
  log.debug('waiting for VAA')
  const { vaaBytes: signedVAA } = await getSignedVAAWithRetry(WORMHOLE_RPC_HOSTS, ethConfig.wormholeChainId, emitterAddress, sequence, {
    transport: NodeHttpTransport(),
  })
  log.debug('got VAA, postVaaSolana')
  // post vaa to Solana
  await postVaaSolana(
    connection,
    async transaction => {
      transaction.partialSign(keypair)
      return transaction
    },
    solConfig.wormholeCoreBridgeAddress,
    payerAddress,
    Buffer.from(signedVAA)
  )
  log.debug('posted to solana')
  // expect(
  //   await getIsTransferCompletedSolana(
  //     SOLANA_TOKEN_BRIDGE_ADDRESS,
  //     signedVAA,
  //     connection
  //   )
  // ).toBe(false);
  // redeem tokens on solana
  // should be false
  log.debug('sending redeemOnSolana')
  const erasemeIsTransferComplete = await getIsTransferCompletedSolana(solConfig.wormholeTokenBridgeAddress, signedVAA, connection)
  const transaction = await redeemOnSolana(
    connection,
    solConfig.wormholeCoreBridgeAddress,
    solConfig.wormholeTokenBridgeAddress,
    payerAddress,
    signedVAA
  )
  // sign, send, and confirm transaction
  transaction.partialSign(keypair)
  const txid = await connection.sendRawTransaction(transaction.serialize())
  await connection.confirmTransaction(txid)
  // should be true
  log.debug('basck from redeemOnSolana')
  const erasemeIsTransferComplete2 = await getIsTransferCompletedSolana(solConfig.wormholeTokenBridgeAddress, signedVAA, connection)
  // expect(
  //   await getIsTransferCompletedSolana(
  //     SOLANA_TOKEN_BRIDGE_ADDRESS,
  //     signedVAA,
  //     connection
  //   )
  // ).toBe(true);

  // Get the final wallet balance of ERC20 on Eth
  const signerAddress = await signer.getAddress()
  const finalErc20BalOnEth = await token.balanceOf(signerAddress)
  // const finalErc20BalOnEthFormatted = formatUnits(finalErc20BalOnEth._hex, DECIMALS)
  // expect(
  //   parseInt(initialErc20BalOnEthFormatted) -
  //   parseInt(finalErc20BalOnEthFormatted) ===
  //   1
  // ).toBe(true);

  // Get final balance on Solana
  // results = await connection.getParsedTokenAccountsByOwner(keypair.publicKey, tokenFilter)
  // let finalSolanaBalance = 0
  // for (const item of results.value) {
  //   const tokenInfo = item.account.data.parsed.info
  //   const address = tokenInfo.mint
  //   const amount = tokenInfo.tokenAmount.uiAmount
  //   if (tokenInfo.mint === SolanaForeignAsset) {
  //     finalSolanaBalance = amount
  //   }
  // }
  log.debug('leaving step')
  return '99'
}
