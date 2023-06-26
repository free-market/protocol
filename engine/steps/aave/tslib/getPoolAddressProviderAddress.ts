export function getPoolAddressProviderAddress(chainId: string) {
  switch (chainId) {
    // ethereum
    case '1':
    case '31337':
      return '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e'
    // avalanche
    case '43114':
      return '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb'
    // polygon
    case '137':
      return '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb'
    // arbitrum
    case '42161':
      return '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb'
    // optimism
    case '10':
      return '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb'
    // fantom
    case '250':
      return '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb'
  }
  throw new Error(`getPoolAddressProviderAddress: unknown chainId ${chainId}`)
}
