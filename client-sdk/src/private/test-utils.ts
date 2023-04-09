import type { Signer } from '@ethersproject/abstract-signer'
import { HDNode } from '@ethersproject/hdnode'
import { JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
import { createStandardProvider } from '@freemarket/core'
import type { ExecutionContext } from 'ava'

export function shouldRunE2e() {
  return process.env['INCLUDE_E2E'] === 'true'
}

export function mapToRecord<V>(map: Map<string, V>): Record<string, V> {
  const rv: Record<string, V> = {}
  for (const [key, val] of map) {
    rv[key] = val
  }
  return rv
}

export function assert(t: ExecutionContext<unknown>, value: unknown, message?: string): asserts value {
  t.assert(value, message)
}

export function throws(t: ExecutionContext<unknown>, fn: () => void) {
  try {
    fn()
    t.fail('was supposed to throw')
  } catch (e) {
    t.snapshot(e)
  }
}

export async function throwsAsync(t: ExecutionContext<unknown>, fn: () => Promise<void>) {
  try {
    await fn()
    t.fail('was supposed to throw')
  } catch (e) {
    t.snapshot(e)
  }
}

export function getStandardProvider(envVar = 'ETHEREUM_GOERLI_URL', mnemonic?: string) {
  const providerUrl = process.env[envVar]
  const ethersProvider = new JsonRpcProvider(providerUrl)
  let signer: Signer | undefined = undefined
  if (mnemonic) {
    const account = HDNode.fromMnemonic(mnemonic).derivePath(`m/44'/60'/0'/0/0`)
    signer = new Wallet(account, ethersProvider)
  }
  return createStandardProvider(ethersProvider, signer)
}

export function getStandardWebSocketProvider(envVar = 'ETHEREUM_GOERLI_WS_URL', mnemonic?: string) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const providerUrl = process.env[envVar]!
  const ethersProvider = new WebSocketProvider(providerUrl)
  let signer: Signer | undefined = undefined
  if (mnemonic) {
    const account = HDNode.fromMnemonic(mnemonic).derivePath(`m/44'/60'/0'/0/0`)
    signer = new Wallet(account, ethersProvider)
  }
  return createStandardProvider(ethersProvider, signer)
}
