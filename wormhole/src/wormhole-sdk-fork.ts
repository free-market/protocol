/* eslint-disable @typescript-eslint/ban-types */
import {
  ChainId,
  ChainName,
  CHAIN_ID_SOLANA,
  coalesceChainId,
  createNonce,
  importCoreWasm,
  // getBridgeFeeIx,
  importTokenWasm,
  ixFromRust,
} from '@certusone/wormhole-sdk'
import { Connection, Keypair, PublicKey, SystemProgram, Transaction as SolanaTransaction } from '@solana/web3.js'
import { AccountLayout, Token, TOKEN_PROGRAM_ID, u64 } from '@solana/spl-token'

export async function getBridgeFeeIx(connection: Connection, bridgeAddress: string, payerAddress: string) {
  const bridge = await importCoreWasm()
  const feeAccount = await bridge.fee_collector_address(bridgeAddress)
  const bridgeStatePK = new PublicKey(bridge.state_address(bridgeAddress))
  const bridgeStateAccountInfo = await connection.getAccountInfo(bridgeStatePK)
  if (bridgeStateAccountInfo?.data === undefined) {
    throw new Error('bridge state not found')
  }
  const bridgeState = bridge.parse_state(new Uint8Array(bridgeStateAccountInfo?.data))
  const transferIx = SystemProgram.transfer({
    fromPubkey: new PublicKey(payerAddress),
    toPubkey: new PublicKey(feeAccount),
    lamports: bridgeState.config.fee,
  })
  return transferIx
}

export async function getBridgeFee(connection: Connection, bridgeAddress: string) {
  const bridge = await importCoreWasm()
  const bridgeStatePK = new PublicKey(bridge.state_address(bridgeAddress))
  const bridgeStateAccountInfo = await connection.getAccountInfo(bridgeStatePK)
  if (bridgeStateAccountInfo?.data === undefined) {
    throw new Error('bridge state not found')
  }
  const bridgeState = bridge.parse_state(new Uint8Array(bridgeStateAccountInfo?.data))
  return bridgeState.config.fee
}

export async function transferFromSolana(
  connection: Connection,
  bridgeAddress: string,
  tokenBridgeAddress: string,
  payerAddress: string,
  fromAddress: string,
  mintAddress: string,
  amount: BigInt,
  targetAddress: Uint8Array,
  targetChain: ChainId | ChainName,
  originAddress?: Uint8Array,
  originChain?: ChainId | ChainName,
  fromOwnerAddress?: string,
  relayerFee: BigInt = BigInt(0)
) {
  const originChainId: ChainId | undefined = originChain ? coalesceChainId(originChain) : undefined
  const nonce = createNonce().readUInt32LE(0)
  const transferIx = await getBridgeFeeIx(connection, bridgeAddress, payerAddress)
  const { transfer_native_ix, transfer_wrapped_ix, approval_authority_address } = await importTokenWasm()
  const approvalIx = Token.createApproveInstruction(
    TOKEN_PROGRAM_ID,
    new PublicKey(fromAddress),
    new PublicKey(approval_authority_address(tokenBridgeAddress)),
    new PublicKey(fromOwnerAddress || payerAddress),
    [],
    new u64(amount.toString(16), 16)
  )
  const messageKey = Keypair.generate()
  const isSolanaNative = originChainId === undefined || originChainId === CHAIN_ID_SOLANA
  if (!isSolanaNative && !originAddress) {
    throw new Error('originAddress is required when specifying originChain')
  }
  const ix = ixFromRust(
    isSolanaNative
      ? transfer_native_ix(
          tokenBridgeAddress,
          bridgeAddress,
          payerAddress,
          messageKey.publicKey.toString(),
          fromAddress,
          mintAddress,
          nonce,
          amount.valueOf(),
          relayerFee.valueOf(),
          targetAddress,
          coalesceChainId(targetChain)
        )
      : transfer_wrapped_ix(
          tokenBridgeAddress,
          bridgeAddress,
          payerAddress,
          messageKey.publicKey.toString(),
          fromAddress,
          fromOwnerAddress || payerAddress,
          originChainId as number, // checked by isSolanaNative
          originAddress as Uint8Array, // checked by throw
          nonce,
          amount.valueOf(),
          relayerFee.valueOf(),
          targetAddress,
          coalesceChainId(targetChain)
        )
  )
  // const transaction = new SolanaTransaction().add(transferIx, approvalIx, ix)
  const transaction = new SolanaTransaction().add(approvalIx, ix)
  const { blockhash } = await connection.getRecentBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = new PublicKey(payerAddress)
  transaction.partialSign(messageKey)
  return transaction
}
