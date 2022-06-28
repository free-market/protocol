import { setDefaultWasm } from '@certusone/wormhole-sdk/lib/cjs/solana/wasm'
setDefaultWasm('node')

import * as ethers from 'ethers'
import { formatUnits } from '@ethersproject/units'
import dotenv from 'dotenv'
import { Connection, Keypair, PublicKey, TokenAccountsFilter, Transaction } from '@solana/web3.js'
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
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
} from '@certusone/wormhole-sdk'
import { Weth__factory } from './ethers-contracts/abi'
import { NodeHttpTransport } from '@improbable-eng/grpc-web-node-http-transport'
import bs58 from 'bs58'
import { Provider, TransactionReceipt } from '@ethersproject/providers'

import { IUserProxyManager__factory, ensureEthBalance, ADDRESS_ZERO, IWorkflowRunner__factory } from '@fmp/evm'

dotenv.config()

const FRONT_DOOR_ADDRESS = process.env.FRONT_DOOR_ADDRESS!

const ETH_TEST_WALLET_PRIVATE_KEY = '18eb753b59d97a6ab5e2c4f7f35f68303508ef9e652b7a14030a80f96e20c02a'
const ETH_TEST_WALLET_ADDRESS = '0xeCb31e9CEd20959C7A87D5B5f3D1BC5419cD1f90'
const SOLANA_PRIVATE_KEY = 'GR4HndXZHhi1sV77G7yupFgvNbxjXzgQ6R18diuXmYkDciuKZ9Xvodw9PfrtG8Nb261bPsRuvUt9JECpMK7TMR6'
const WORMHOLE_RPC_HOSTS = ['https://wormhole-v2-testnet-api.certus.one']
export const TEST_ERC20 = '0x2D8BE6BF0baA74e0A907016679CaE9190e80dD0A'

interface WormholeBaseConfig {
  jsonRpcUrl: string
  wormholeChainId: ChainId
  wormholeCoreBridgeAddress: string
  wormholeTokenBridgeAddress: string
}

interface EtheriumConfig extends WormholeBaseConfig {
  wethAddress: string
}

interface SolanaConfig extends WormholeBaseConfig {}

const etheriumGoerliConfig: EtheriumConfig = {
  jsonRpcUrl: `wss://eth-goerli.alchemyapi.io/v2/${process.env['ALCHEMY_URL_KEY_TEST']}`,
  wethAddress: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  wormholeChainId: CHAIN_ID_ETH,
  wormholeCoreBridgeAddress: '0x706abc4E45D419950511e474C7B9Ed348A4a716c',
  wormholeTokenBridgeAddress: '0xF890982f9310df57d00f659cf4fd87e65adEd8d7',
}

const etheriumRopstenConfig: EtheriumConfig = {
  jsonRpcUrl: `wss://eth-ropsten.alchemyapi.io/v2/${process.env['ALCHEMY_URL_KEY_TEST']}`,
  wethAddress: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
  wormholeChainId: CHAIN_ID_ETHEREUM_ROPSTEN,
  wormholeCoreBridgeAddress: '0x210c5F5e2AF958B4defFe715Dc621b7a3BA888c5',
  wormholeTokenBridgeAddress: '0xF174F9A837536C449321df1Ca093Bb96948D5386',
}

const etheriumMainnetConfig: EtheriumConfig = {
  jsonRpcUrl: `wss://eth-mainnet.alchemyapi.io/v2/${process.env['ALCHEMY_URL_KEY_MAIN']}`,
  wethAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  wormholeChainId: CHAIN_ID_ETH,
  wormholeCoreBridgeAddress: '0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B',
  wormholeTokenBridgeAddress: '0x3ee18B2214AFF97000D974cf647E7C347E8fa585',
}

const solanaDevnetConfig: SolanaConfig = {
  jsonRpcUrl: 'https://api.devnet.solana.com',
  wormholeChainId: CHAIN_ID_SOLANA,
  wormholeCoreBridgeAddress: '3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5',
  wormholeTokenBridgeAddress: 'DZnkkTmCiFWfYTfT41X3Rd1kDgozqzxWaHqsw6W4x2oe',
}

// https://api.mainnet-beta.solana.com - Solana-hosted api node cluster, backed by a load balancer; rate-limited
// https://solana-api.projectserum.com - Project Serum-hosted api node
const solanaMainnetConfig: SolanaConfig = {
  jsonRpcUrl: 'https://api.mainnet-beta.solana.com',
  wormholeChainId: CHAIN_ID_SOLANA,
  wormholeCoreBridgeAddress: 'worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth',
  wormholeTokenBridgeAddress: 'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb',
}

const ethConfig = etheriumGoerliConfig
const solConfig = solanaDevnetConfig

async function printGasFromTransaction(provider: Provider, tx: ethers.ContractTransaction, message: string) {
  const txReceipt = await provider.getTransactionReceipt(tx.hash)
  printGasFromReceipt(txReceipt, message)
}
function printGasFromReceipt(txReceipt: ethers.ContractReceipt, message: string) {
  console.log(`${message}: ${txReceipt.gasUsed}`)
}

async function transferWethToSol() {
  const connection = new Connection(solConfig.jsonRpcUrl, 'confirmed')
  // const eraseme = base64ToUint8Array(SOLANA_PRIVATE_KEY)
  // const keypair = Keypair.fromSecretKey(base64ToUint8Array(SOLANA_PRIVATE_KEY))
  const keypair = Keypair.fromSecretKey(bs58.decode(SOLANA_PRIVATE_KEY))
  const payerAddress = keypair.publicKey.toString()

  const SolanaForeignAsset = await getForeignAssetSolana(
    connection,
    solConfig.wormholeTokenBridgeAddress,
    ethConfig.wormholeChainId,
    tryNativeToUint8Array(ethConfig.wethAddress, ethConfig.wormholeChainId)
  )
  // const SolanaForeignAsset = await getForeignAssetSolana(
  //   connection,
  //   SOLANA_TOKEN_BRIDGE_ADDRESS,
  //   ethConfig.wormholeChainId,
  //   tryNativeToUint8Array(ethConfig.wethAddress, ethConfig.wormholeChainId)
  // )

  const solanaMintKey = new PublicKey(SolanaForeignAsset!)
  const recipient = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    solanaMintKey,
    keypair.publicKey
  )
  // create the associated token account if it doesn't exist
  const associatedAddressInfo = await connection.getAccountInfo(recipient)
  if (!associatedAddressInfo) {
    const transaction = new Transaction().add(
      await Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        solanaMintKey,
        recipient,
        keypair.publicKey, // owner
        keypair.publicKey // payer
      )
    )
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = keypair.publicKey
    // sign, send, and confirm transaction
    transaction.partialSign(keypair)
    const txid = await connection.sendRawTransaction(transaction.serialize())
    // TODO what are the correct set of args here?
    await connection.confirmTransaction(txid)
  }
  // create a signer for Eth
  const provider = new ethers.providers.WebSocketProvider(ethConfig.jsonRpcUrl)
  const signer = new ethers.Wallet(ETH_TEST_WALLET_PRIVATE_KEY, provider)
  const DECIMALS = 18
  // const amount = parseUnits("1", DECIMALS);

  const amountToTransfer = ethers.BigNumber.from(10).pow(16)

  const token = Weth__factory.connect(ethConfig.wethAddress, signer)
  const initialErc20BalOnEth = await token.balanceOf(ETH_TEST_WALLET_ADDRESS)

  let x: TransactionReceipt
  // weth specific here - deposit required amount
  const amountToDeposit = amountToTransfer.sub(initialErc20BalOnEth)
  if (!amountToDeposit.isZero() && !amountToDeposit.isNegative()) {
    const wethDepositResult = await token.deposit({ from: signer.address, value: amountToDeposit })
    await printGasFromTransaction(provider, wethDepositResult, 'weith.deposit')
    const balanceAfterDeposit = await token.balanceOf(signer.address)
    if (!balanceAfterDeposit.sub(amountToDeposit).isZero()) {
      throw new Error('problem setting up token balance')
    }
  }

  // Get the initial balance on Solana
  const tokenFilter: TokenAccountsFilter = {
    programId: TOKEN_PROGRAM_ID,
  }
  let results = await connection.getParsedTokenAccountsByOwner(keypair.publicKey, tokenFilter)
  let initialSolanaBalance = 0
  for (const item of results.value) {
    const tokenInfo = item.account.data.parsed.info
    const address = tokenInfo.mint
    const amount = tokenInfo.tokenAmount.uiAmount
    if (tokenInfo.mint === SolanaForeignAsset) {
      initialSolanaBalance = amount
    }
  }

  // // approve the bridge to spend tokens
  // const approveTxResult = await token.approve(ethConfig.wormholeTokenBridgeAddress, amountToTransfer)
  // const asdf = await approveTxResult.wait(1)
  // await printGasFromTransaction(provider, approveTxResult, 'weith.approve')
  // // transfer tokens
  // const receipt = await transferFromEth(
  //   ethConfig.wormholeTokenBridgeAddress,
  //   signer,
  //   ethConfig.wethAddress,
  //   amountToTransfer,
  //   CHAIN_ID_SOLANA,
  //   tryNativeToUint8Array(recipient.toString(), CHAIN_ID_SOLANA),
  //   undefined,
  //   { gasLimit: 2_000_000 }
  // )
  const userProxyManager = IUserProxyManager__factory.connect(FRONT_DOOR_ADDRESS, signer)
  let userProxyAddress = await userProxyManager.getUserProxy()
  if (userProxyAddress === ADDRESS_ZERO) {
    console.log('creating user proxy')
    const txResult = await userProxyManager.createUserProxy()
    const txReceipt = await provider.getTransactionReceipt(txResult.hash)
    console.log('user proxy created, gas: ' + txReceipt.gasUsed.toString())
    userProxyAddress = await userProxyManager.getUserProxy()
  }
  console.log('user proxy address', userProxyAddress)

  const workflowRunner = IWorkflowRunner__factory.connect(userProxyAddress, signer)

  printGasFromReceipt(receipt, 'wh.transferFromEth')
  // get the sequence from the logs (needed to fetch the vaa)
  const sequence = parseSequenceFromLogEth(receipt, ethConfig.wormholeCoreBridgeAddress)
  const emitterAddress = getEmitterAddressEth(ethConfig.wormholeTokenBridgeAddress)
  // poll until the guardian(s) witness and sign the vaa
  const { vaaBytes: signedVAA } = await getSignedVAAWithRetry(
    WORMHOLE_RPC_HOSTS,
    ethConfig.wormholeChainId,
    emitterAddress,
    sequence,
    {
      transport: NodeHttpTransport(),
    }
  )
  // post vaa to Solana
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
  // expect(
  //   await getIsTransferCompletedSolana(
  //     SOLANA_TOKEN_BRIDGE_ADDRESS,
  //     signedVAA,
  //     connection
  //   )
  // ).toBe(false);
  // redeem tokens on solana
  // should be false
  const erasemeIsTransferComplete = await getIsTransferCompletedSolana(
    solConfig.wormholeTokenBridgeAddress,
    signedVAA,
    connection
  )
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
  const erasemeIsTransferComplete2 = await getIsTransferCompletedSolana(
    solConfig.wormholeTokenBridgeAddress,
    signedVAA,
    connection
  )
  // expect(
  //   await getIsTransferCompletedSolana(
  //     SOLANA_TOKEN_BRIDGE_ADDRESS,
  //     signedVAA,
  //     connection
  //   )
  // ).toBe(true);

  // Get the final wallet balance of ERC20 on Eth
  const finalErc20BalOnEth = await token.balanceOf(ETH_TEST_WALLET_ADDRESS)
  const finalErc20BalOnEthFormatted = formatUnits(finalErc20BalOnEth._hex, DECIMALS)
  // expect(
  //   parseInt(initialErc20BalOnEthFormatted) -
  //   parseInt(finalErc20BalOnEthFormatted) ===
  //   1
  // ).toBe(true);

  // Get final balance on Solana
  results = await connection.getParsedTokenAccountsByOwner(keypair.publicKey, tokenFilter)
  let finalSolanaBalance = 0
  for (const item of results.value) {
    const tokenInfo = item.account.data.parsed.info
    const address = tokenInfo.mint
    const amount = tokenInfo.tokenAmount.uiAmount
    if (tokenInfo.mint === SolanaForeignAsset) {
      finalSolanaBalance = amount
    }
  }
  // expect(finalSolanaBalance - initialSolanaBalance === 1).toBe(true);
  provider.destroy()
}

async function go() {
  try {
    await transferWethToSol()
  } catch (e) {
    console.log(e)
  }
}

void go()
