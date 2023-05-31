import type Big from 'big.js'

export interface Erc20Info {
  balance: Big
  currentAllowance: Big
  requiredAllowance: Big
  decimals: number
}

export interface AddAssetInfo {
  native: Big
  erc20s: Map<string, Erc20Info>
}
