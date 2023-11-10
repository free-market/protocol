/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-console */
import rootLogger from 'loglevel'
rootLogger.setLevel('debug')
initLogger()
import fs from 'fs'
import chalk from 'chalk'
import type { ExecutionEvent } from '../runner/ExecutionEvent'
import { WorkflowInstance } from '../runner/WorkflowInstance'
import { HDNode } from '@ethersproject/hdnode'
import { Wallet } from '@ethersproject/wallet'
import { JsonRpcProvider, Provider, WebSocketProvider } from '@ethersproject/providers'
import assert from '../utils/assert'
import type { Signer } from '@ethersproject/abstract-signer'
import { createStandardProvider, initLogger } from '@freemarket/core'

import dotenv from 'dotenv'
import os from 'os'
import path from 'path'

dotenv.config({ path: path.join(os.homedir(), '.env') })

const log = rootLogger.getLogger('execute-workflow')

if (process.argv.length != 5) {
  console.log('usage: node execute-workflow.js <workflow-filename> <arguments.filename> <source-chain> ')
}

const workflowFileName = process.argv[2]
const argumentsFileName = process.argv[3]
const sourceChain = process.argv[4]

function myEventListener(event: ExecutionEvent) {
  log.info(`${chalk.cyan('Workflow Event')} ${chalk.yellow(event.code)} ${event.message}`)
}

function getEthersSigner(mnemonic: string, ethersProvider: Provider): Signer {
  const account = HDNode.fromMnemonic(mnemonic).derivePath(`m/44'/60'/0'/0/0`)
  return new Wallet(account, ethersProvider)
}

async function go() {
  const flowJson = JSON.parse(fs.readFileSync(workflowFileName).toString())
  const instance = new WorkflowInstance(flowJson)
  const argsJson = JSON.parse(fs.readFileSync(argumentsFileName).toString())
  log.debug('workflow validated')
  instance.validateArguments(argsJson)
  log.debug('arguments validated')

  // TODO where will the user address come from?
  const userAddress = '0x242b2eeCE36061FF84EC0Ea69d4902373858fB2F'

  const sourceChainProviderUrl = process.env['ETHEREUM_GOERLI_URL']!
  const sourceChainProviderEthers = new JsonRpcProvider(sourceChainProviderUrl)
  const mnemonic = process.env['WALLET_MNEMONIC']
  assert(mnemonic)
  const signer = getEthersSigner(mnemonic, sourceChainProviderEthers)
  const sourceChainProvider = createStandardProvider(sourceChainProviderEthers, signer)

  const targetChainProviderUrl = process.env['ARBITRUM_GOERLI_WS_URL']!
  const targetChainProviderEthers = new WebSocketProvider(targetChainProviderUrl)
  const targetChainProvider = createStandardProvider(targetChainProviderEthers)

  instance.setProvider('start-chain', sourceChainProvider)
  instance.setProvider('arbitrum', targetChainProvider)
  const runner = await instance.getRunner(userAddress, argsJson)
  runner.addEventHandler(myEventListener)
  log.debug('runner created')
  await runner.execute()
  log.debug('execution finished')

  await targetChainProviderEthers.destroy()
}

void go()
