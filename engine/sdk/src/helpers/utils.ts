import type { Provider } from '@ethersproject/providers'
import type { Signer } from '@ethersproject/abstract-signer'
import { VoidSigner } from '@ethersproject/abstract-signer'
import type { AbsoluteAmount } from '../model'
import type { EIP1193Provider } from 'eip1193-provider'
import { Eip1193Bridge } from '@ethersproject/experimental'

export function absoluteAmountToString(amount: AbsoluteAmount) {
  if (typeof amount === 'number') {
    return `${amount.toFixed(0)}`
  }
  if (typeof amount === 'bigint') {
    return `${amount}`
  }
  return amount
}

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

export function createStandardProvider(provider: Provider, signer?: Signer): EIP1193Provider {
  const s = signer ?? new VoidSigner(ADDRESS_ZERO)
  return new Eip1193Bridge(s, provider)
}
