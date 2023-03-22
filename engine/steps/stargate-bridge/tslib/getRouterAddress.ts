export function getRouterAddress(chainId: string) {
  switch (chainId) {
    // ethereum
    case '1':
      return '0x8731d54E9D02c286767d56ac03e8037C07e01e98'
    // binance
    case '56':
      return '0x4a364f8c717cAAD9A442737Eb7b8A55cc6cf18D8'
    // avalanche
    case '43114':
      return '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd'
    // polygon
    case '137':
      return '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd'
    // arbitrum
    case '42161':
      return '0x53Bf833A5d6c4ddA888F69c22C88C9f356a41614'
    // optimism
    case '10':
      return '0xB0D502E938ed5f4df2E681fE6E419ff29631d62b'
    // fantom
    case '250':
      return '0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6'
    // metis
    case '1088':
      return '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590'
    // ethereum goerli
    case '5':
      return '0x7612aE2a34E5A363E137De748801FB4c86499152'
    // arbitrum goerli
    case '421613':
      return '0xb850873f4c993Ac2405A1AdD71F6ca5D4d4d6b4f'
    // optimism goerli
    case '420':
      return '0x95461eF0e0ecabC049a5c4a6B98Ca7B335FAF068'
    // binance goerli
    case '97':
      return '0xbB0f1be1E9CE9cB27EA5b0c3a85B7cc3381d8176'
    // avalanche goerli
    case '43113':
      return '0x13093E05Eb890dfA6DacecBdE51d24DabAb2Faa1'
    // polygon goerli
    case '80001':
      return '0x817436a076060D158204d955E5403b6Ed0A5fac0'
    // fantom goerli
    case '4002':
      return '0xa73b0a56B29aD790595763e71505FCa2c1abb77f'
    // metis goerli
    case '599':
      return '0x62273145f80EB808EeF539Ed3ea21f4440CEBB18'
  }
  throw new Error('unknown router address for chainId: ' + chainId)
}
