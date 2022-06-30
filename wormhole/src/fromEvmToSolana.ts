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
  tryNativeToHexString,
  createNonce,
} from '@certusone/wormhole-sdk'
import { Weth__factory } from './ethers-contracts/abi'
import { NodeHttpTransport } from '@improbable-eng/grpc-web-node-http-transport'
import bs58 from 'bs58'
import { Provider, TransactionReceipt } from '@ethersproject/providers'

import {
  IUserProxyManager__factory,
  ADDRESS_ZERO,
  IWorkflowRunner__factory,
  getEthBalanceShortfall,
  STEPID,
  getTestWallet,
} from '@fmp/evm'
import { ethConfig, solConfig } from './config'
import { assert } from 'chai'

dotenv.config()

const FRONT_DOOR_ADDRESS = process.env.FRONT_DOOR_ADDRESS!

const ETH_TEST_WALLET_PRIVATE_KEY = '18eb753b59d97a6ab5e2c4f7f35f68303508ef9e652b7a14030a80f96e20c02a'
const ETH_TEST_WALLET_ADDRESS = '0xeCb31e9CEd20959C7A87D5B5f3D1BC5419cD1f90'
const SOLANA_PRIVATE_KEY = 'GR4HndXZHhi1sV77G7yupFgvNbxjXzgQ6R18diuXmYkDciuKZ9Xvodw9PfrtG8Nb261bPsRuvUt9JECpMK7TMR6'
const WORMHOLE_RPC_HOSTS = ['https://wormhole-v2-testnet-api.certus.one']
export const TEST_ERC20 = '0x2D8BE6BF0baA74e0A907016679CaE9190e80dD0A'

async function printGasFromTransaction(provider: Provider, tx: ethers.ContractTransaction, message: string) {
  const txReceipt = await provider.getTransactionReceipt(tx.hash)
  printGasFromReceipt(txReceipt, message)
}
function printGasFromReceipt(txReceipt: ethers.ContractReceipt, message: string) {
  console.log(`${message}: ${txReceipt.gasUsed}`)
}

async function getUserProxyAddress(signer: ethers.Signer) {
  const userProxyManager = IUserProxyManager__factory.connect(FRONT_DOOR_ADDRESS, signer)
  let userProxyAddress = await userProxyManager.getUserProxy()
  if (userProxyAddress === ADDRESS_ZERO) {
    console.log('creating user proxy')
    const txResult = await userProxyManager.createUserProxy()
    // const txReceipt = await signer.provider!.getTransactionReceipt(txResult.hash)
    const txReceipt = await txResult.wait(1)
    console.log('user proxy created, gas: ' + txReceipt.gasUsed.toString())
    userProxyAddress = await userProxyManager.getUserProxy()
  }
  console.log('user proxy address', userProxyAddress)
  return userProxyAddress
}

async function ensureWeth(fromWallet: ethers.Wallet, toAddress: string, wethTargetAmount: ethers.BigNumber) {
  console.log(`ensuring weth balance, target amount is ${ethers.utils.formatEther(wethTargetAmount)}`)
  const workflowRunner = IWorkflowRunner__factory.connect(toAddress, fromWallet)
  const weth = Weth__factory.connect(ethConfig.wethAddress, fromWallet)

  // get current weth balance
  let tokenBalance = await weth.balanceOf(toAddress)
  const wethShortfall = wethTargetAmount.sub(tokenBalance)
  if (!wethShortfall.isNegative() && !wethShortfall.isZero()) {
    // get amount of eth required to send
    const ethToTransfer = await getEthBalanceShortfall(wethTargetAmount, fromWallet.provider, toAddress)
    const args = [
      {
        stepId: STEPID.ETH_WETH,
        amount: wethShortfall,
        amountIsPercent: false,
        fromToken: '0',
        args: [],
      },
    ]
    const asdf = await workflowRunner.estimateGas.executeWorkflow(args, { value: ethToTransfer, gasLimit: 1_000_000 })
    const tx = await workflowRunner.executeWorkflow(args, { value: ethToTransfer, gasLimit: 1_000_000 })
    let receipt = await tx.wait(1)
    printGasFromReceipt(receipt, 'ethToWeth')
    tokenBalance = await weth.balanceOf(toAddress)
    assert.equal(tokenBalance.toString(), wethTargetAmount.toString())
  }
}

async function transferWethToSol() {
  // create a signer for Eth
  const provider = new ethers.providers.WebSocketProvider(ethConfig.jsonRpcUrl)
  const wallet = new ethers.Wallet(ETH_TEST_WALLET_PRIVATE_KEY, provider)
  // const provider = new ethers.providers.JsonRpcProvider(ethConfig.jsonRpcUrl)
  // const signer = getTestWallet(1, provider)
  const userProxyAddress = await getUserProxyAddress(wallet)
  const wethTargetAmount = ethers.utils.parseEther('0.01')

  await ensureWeth(wallet, userProxyAddress, wethTargetAmount)

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

  const DECIMALS = 18
  // // const amount = parseUnits("1", DECIMALS);

  // const amountToTransfer = ethers.BigNumber.from(10).pow(16)

  // const initialErc20BalOnEth = await token.balanceOf(ETH_TEST_WALLET_ADDRESS)

  // let x: TransactionReceipt
  // // weth specific here - deposit required amount
  // const amountToDeposit = amountToTransfer.sub(initialErc20BalOnEth)
  // if (!amountToDeposit.isZero() && !amountToDeposit.isNegative()) {
  //   const wethDepositResult = await token.deposit({ from: signer.address, value: amountToDeposit })
  //   await printGasFromTransaction(provider, wethDepositResult, 'weith.deposit')
  //   const balanceAfterDeposit = await token.balanceOf(signer.address)
  //   if (!balanceAfterDeposit.sub(amountToDeposit).isZero()) {
  //     throw new Error('problem setting up token balance')
  //   }
  // }

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

  const tokenTransferRecipientHex = '0x' + tryNativeToHexString(recipient.toString(), CHAIN_ID_SOLANA)
  // const tokenTransferRecipient = BigNumber.from(tokenTransferRecipientHex)

  const chainIdBn = ethers.BigNumber.from(CHAIN_ID_SOLANA)
  const tokenTransferRecipientBn = ethers.BigNumber.from(tokenTransferRecipientHex)
  const nonceBn = ethers.BigNumber.from(Math.floor(Math.random() * 1_000_000))

  const workflowRunner = IWorkflowRunner__factory.connect(userProxyAddress, wallet)
  const tx = await workflowRunner.executeWorkflow(
    [
      {
        stepId: STEPID.WORMHOLE,
        amount: wethTargetAmount,
        amountIsPercent: false,
        fromToken: ethConfig.wethAddress,
        args: [chainIdBn, tokenTransferRecipientBn, nonceBn],
      },
    ],
    { gasLimit: 1_000_000 }
  )
  // const tx2= await tx.wait(1)
  // let receipt = await provider.getTransactionReceipt(tx.hash)
  let receipt = await tx.wait(1)
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
  const weth = Weth__factory.connect(ethConfig.wethAddress, wallet)
  const finalErc20BalOnEth = await weth.balanceOf(ETH_TEST_WALLET_ADDRESS)
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
  // provider.destroy()
}

async function go() {
  try {
    await transferWethToSol()
  } catch (e) {
    console.log(e)
  }
}

void go()
