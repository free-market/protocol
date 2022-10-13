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
} from '@fmp/sdk'
import ethers from 'ethers'
import { ethJsonRpcUrl, ETHEREUM_WALLET_PRIVATE_KEY, SOLANA_WALLET_PRIVATE_KEY, solJsonRpcUrl } from './config'
import bs58 from 'bs58'

const ONE_ETH = '1000000000000000000'

function buildWorkflow(): Workflow {
  const workflow = new WorkflowBuilder()
    .addSteps(wethWrap({ amount: ONE_ETH }), wormholeTokenTransfer({ fromChain: 'Ethereum', fromToken: 'WETH', toChain: 'Solana' }))
    .build()
  return workflow
}

function getEngineParameters() {
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
  // asdf
}

async function executeWorkflow() {
  const workflow = buildWorkflow()
  const engine = new OffChainWorkflowEngine(getEngineParameters())
  await engine.execute(workflow)
}

void executeWorkflow()
