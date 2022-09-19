// 'Sign every step' needs every address of everything we interact with.
export const ADDRESSES = {
  test: {
    Ethereum: {
      eth: '', // use empty string to represent the native coin
      wbtc: 'wbtcAddrOnTestNet',
      weth: 'wethAddrOnTestnet',
      usdc: 'usdcOnTestNet',
      usdt: 'usdtOnTestNet',
      dai: 'daiOnTestNet',
    },
    solanan: {
      sol: '', // use empty string to denote the native coin
      usdc: 'usdcOnTestNet',
      usdcet: 'usdcetOnTestNet',
    },
  },

  main: {
    Ethereum: {
      eth: '', // use empty string to represent the native coin
      wbtc: 'wbtcAddrOnMainNet',
      weth: 'wethAddrOnMainet',
      usdc: 'usdcOnMainNet',
      usdt: 'usdtOnMainNet',
      dai: 'daiOnMainNet',
    },
    solanan: {
      sol: '', // use empty string to denote the native coin
      usdc: 'usdcOnMainNet',
      usdcet: 'usdcetOnMainNet',
    },
  },
}
