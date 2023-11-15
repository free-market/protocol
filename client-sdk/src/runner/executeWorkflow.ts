import { EIP1193Provider } from 'eip1193-provider'
import { Chain, ChainOrStart, getChainFromProvider, assert } from '@freemarket/core'
import { Arguments, Workflow } from '../model'
import { WorkflowInstance } from './WorkflowInstance'
import { ExecutionEventHandler } from './ExecutionEvent'
import { EvmTransactionExecutor } from './EvmTransactionExecutor'
import { ExecutionLog } from './ExecutionLog'
type Providers = Record<Chain, EIP1193Provider> | EIP1193Provider

export type Executors = Partial<Record<ChainOrStart, EvmTransactionExecutor>> | EvmTransactionExecutor

function isProvider(provider: Providers): provider is EIP1193Provider {
  return (provider as EIP1193Provider).request !== undefined
}

export interface ExecuteWorkflowOptions {
  workflow: Workflow
  userAddress: string
  providers: Providers
  executors?: Executors
  handler?: ExecutionEventHandler | null
  args?: Arguments
  startChain?: Chain
}

export async function executeWorkflow(executeWorkflowOptions: ExecuteWorkflowOptions): Promise<ExecutionLog[]> {
  const { workflow, userAddress, providers, executors, handler, args, startChain } = executeWorkflowOptions
  const instance = new WorkflowInstance(workflow)
  let sc = startChain
  if (isProvider(providers)) {
    instance.setProvider('start-chain', providers)
    if (!sc) {
      sc = sc = await getChainFromProvider(providers)
    }
  } else {
    assert(sc !== undefined, 'A start chain must be provided when passing multiple providers')
    for (const chain in providers) {
      instance.setProvider(chain as ChainOrStart, providers[chain as Chain])
    }
  }
  if (executors !== undefined) {
    assert(sc !== undefined, 'A start chain must be provided when passing Executors(s)')
    if ('executeTransactions' in executors) {
      instance.setTransactionExecutor('start-chain', executors)
      instance.setTransactionExecutor(sc, executors)
    } else {
      for (const chain in executors) {
        const executor = executors[chain as Chain]
        if (executor) {
          instance.setTransactionExecutor(chain as Chain, executor)
          if (chain === sc) {
            instance.setTransactionExecutor('start-chain', executor)
          }
        }
      }
    }
  }
  const runner = await instance.getRunner(userAddress, args)
  handler && runner.addEventHandler(handler)
  return runner.execute()
}
