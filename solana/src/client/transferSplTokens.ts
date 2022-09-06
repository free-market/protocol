import { field } from '@dao-xyz/borsh'

export class SplTokenTransferArgs {
  constructor(init?: SplTokenTransferArgs) {
    if (init) {
      Object.assign(this, init)
    }
  }
  @field({ type: 'u16' })
  fromAddressIndex!: number

  @field({ type: 'u16' })
  toAddressIndex!: number
}
