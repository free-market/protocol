import Web3 from 'web3'
export interface AddAssetActionArgs {
  fromAddress: string
  amount: string | number
}

export function encodeAddAssetArgs(args: AddAssetActionArgs) {
  const web3 = new Web3()
  return web3.eth.abi.encodeParameters(['address', 'uint256'], [args.fromAddress, args.amount])
}
