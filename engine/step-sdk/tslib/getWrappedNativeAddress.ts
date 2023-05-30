export function getWrappedNativeAddress(chainId: string) {
  switch (chainId) {
    // ethereum
    case '1':
    case '31337':
      return '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    // arbitrum
    case '42161':
      return '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
      return
    case '137':
      return '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
    // avalanche
    case '43114':
      return '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
    // optimism
    case '10':
      return '0x4200000000000000000000000000000000000006'
    // fantom
    case '250':
      return '0x74b23882a30290451A17c44f4F05243b6b58C76d'
    // ethereum goerli
    case '5':
      return '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'
  }
  throw new Error('unknown chainId: ' + chainId)
}
