import { EIP1193Provider } from 'eip1193-provider'
import { ChainOrStart } from '@freemarket/core'
import { Arguments, Workflow } from '../model'
import { WorkflowInstance } from './WorkflowInstance'
import { ExecutionEventHandler } from './ExecutionEvent'
type Providers = Record<string, EIP1193Provider> | EIP1193Provider

function isProvider(provider: Providers): provider is EIP1193Provider {
  return (provider as EIP1193Provider).request !== undefined
}

export async function executeWorkflow(
  workflow: Workflow,
  userAddress: string,
  providers: Providers,
  handler?: ExecutionEventHandler | null,
  args?: Arguments
): Promise<void> {
  const instance = new WorkflowInstance(workflow)
  if (isProvider(providers)) {
    instance.setProvider('start-chain', providers as EIP1193Provider)
  } else {
    for (const chain in providers) {
      instance.setProvider(chain as ChainOrStart, providers[chain])
    }
  }
  const runner = await instance.getRunner(userAddress, args)
  handler && runner.addEventHandler(handler)
  return runner.execute()
}
