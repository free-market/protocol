import 'source-map-support/register'
import { initLogger } from '../utils'
import log from 'loglevel'
import stringLogger from 'not-a-log'
import { Connection, Keypair, PublicKey, TokenAccountsFilter, Transaction } from '@solana/web3.js'
import {
  Workflow,
  WorkflowBuilder,
  wethWrap,
  curveTriCryptoSwap,
  curveThreePoolSwap,
  wormholeTokenTransfer,
  BlockchainEnvironment,
  OffChainEngineParams,
  OffChainWorkflowEngine,
  WorkflowEvent,
  formatMoney,
  AssetBalance,
} from '../index'
import * as ethers from 'ethers'
import { ethJsonRpcUrl, ETHEREUM_WALLET_PRIVATE_KEY, SOLANA_WALLET_PRIVATE_KEY, solJsonRpcUrl } from './config'
import bs58 from 'bs58'

initLogger()

// const ONE_ETH =       '1000000000000000000'
const ETH_INPUT_AMOUNT = '1000000000000000' // 1/1000 th of an ETH

function buildWorkflow(): Workflow {
  const workflow = new WorkflowBuilder()
    .addSteps(
      // wethWrap({ amount: ETH_INPUT_AMOUNT }),
      wormholeTokenTransfer({ fromChain: 'Ethereum', fromToken: 'WETH', toChain: 'Solana', amount: ETH_INPUT_AMOUNT })
    )
    .build()
  return workflow
}

function getEngineParameters() {
  log.info('ethJsonRpcUrl', ethJsonRpcUrl)
  log.info('solJsonRpcUrl', solJsonRpcUrl)
  log.info('ETHEREUM_WALLET_PRIVATE_KEY', ETHEREUM_WALLET_PRIVATE_KEY)
  log.info('SOLANA_WALLET_PRIVATE_KEY', SOLANA_WALLET_PRIVATE_KEY)
  const ethProvider = new ethers.providers.WebSocketProvider(ethJsonRpcUrl)
  const ethSigner = new ethers.Wallet(ETHEREUM_WALLET_PRIVATE_KEY, ethProvider)
  const solConnection = new Connection(solJsonRpcUrl, 'confirmed')
  const solUserAccount = Keypair.fromSecretKey(bs58.decode(SOLANA_WALLET_PRIVATE_KEY))

  const engineParams: OffChainEngineParams = {
    eventHandler: workflowEventHandler,
    blockchainEnvironment: BlockchainEnvironment.Test,
    evm: {
      ethereum: {
        provider: ethProvider,
        signer: ethSigner,
      },
    },
    solana: {
      connection: solConnection,
      userAccount: solUserAccount,
    },
  }

  return engineParams
}

function workflowEventHandler(event: WorkflowEvent): void {
  if (event.type === 'Completed') {
    log.info(
      `✔ event: ${event.type} ${event.steps[0].info.name} |${event.statusMessage}| gasCost=${event.result!.gasCost},  ${
        event.steps[0].outputAsset.symbol
      } ${formatMoney(event.result!.outputAmount, event.steps[0].outputAsset.info.decimals, 4)}`
    )
    printBalances(event.balances)
  } else if (event.type === 'Starting') {
    log.info(`🌈 event: ${event.type} ${event.steps[0].info.name}`)
  } else {
    log.info(`🔗 event: ${event.type} ${event.statusMessage}`)
  }
}

function printBalances(balances: AssetBalance[]) {
  log.debug(
    stringLogger.table(
      balances.map(it => ({
        asset: `${it.asset.symbol} (${it.asset.blockChain})`,
        balance: formatMoney(it.balance, it.asset.info.decimals, 4),
      }))
    )
  )
}

async function executeWorkflow() {
  initLogger()
  log.debug('hi debug')
  log.info('hi info')
  log.warn('hi warn')
  log.error('hi error')
  log.debug('hi debug2')
  log.error('hi error2')
  const workflow = buildWorkflow()
  const engine = new OffChainWorkflowEngine(getEngineParameters())
  await engine.execute(workflow)
  log.debug('done')
}

void executeWorkflow()
