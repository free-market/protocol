import BN from 'bn.js'
import Web3 from 'web3'
export interface AaveSupplyActionArgs {
  onBehalfOf: string
}

export function encodeAaveSupplyArgs(args: AaveSupplyActionArgs) {
  const web3 = new Web3()
  return web3.eth.abi.encodeParameters(['address'], [args.onBehalfOf])
}
