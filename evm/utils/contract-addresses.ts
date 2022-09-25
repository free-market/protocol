const ADDRESSES = {
  mainnet: {
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    curve3Pool: '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7',
    curveTriCrypto: '0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5',
    wormholeChainName: 'ethereum',
    wormholeCoreBridge: '0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B',
    wormholeTokenBridge: '0x3ee18B2214AFF97000D974cf647E7C347E8fa585',
  },
  goerli: {
    WETH: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
    USDC: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
    USDT: '0x509Ee0d083DdF8AC028f2a56731412edD63223B9',
    curve3Pool: '',
    curveTriCrypto: '',
    wormholeChainName: 'ethereum',
    wormholeCoreBridge: '0x706abc4E45D419950511e474C7B9Ed348A4a716c',
    wormholeTokenBridge: '0xF890982f9310df57d00f659cf4fd87e65adEd8d7',
  },
}

export type EvmNetworkName = 'mainnet' | 'goerli' | 'testnet'

/** @ignore */
export function getEthConfig(network: EvmNetworkName) {
  // default testnet to goerli
  const n = network === 'testnet' ? 'goerli' : network
  return ADDRESSES[n]
}
