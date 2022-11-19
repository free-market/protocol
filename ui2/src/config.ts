export type ActionGroupName = 'curve' | 'zksync' | 'aave' | '1inch'

export type StepChoiceName = 'curve/swap' | 'zksync/bridge' | 'aave/borrow'

export type CatalogAsset = {
  label: string
  icon: { url: string }
}

export type CatalogAction = {
  title: string
  input: { asset: CatalogAsset }
  output: { asset: CatalogAsset }
}

export type CatalogGroup = {
  name: ActionGroupName
  title: string
  icon: { url: string }
  actions: CatalogAction[]
}

export type Catalog = Record<ActionGroupName, CatalogGroup>

export const catalog: Catalog = {
  'curve': {
    name: 'curve',
    title: 'Curve',
    icon: { url: 'https://curve.fi/favicon-32x32.png' },
    actions: [
      {
        title: 'Swap',
        input: {
          asset: {
            label: 'USDC',
            icon: {
              url: 'https://res.cloudinary.com/sushi-cdn/image/fetch/w_48,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/icons/master/token/usdc.jpg',
            },
          },
        },
        output: {
          asset: {
            label: 'USDT',
            icon: {
              url: 'https://cdn.jsdelivr.net/gh/curvefi/curve-assets/images/assets/0xdac17f958d2ee523a2206206994597c13d831ec7.png',
            },
          },
        },
      },

      {
        title: 'Swap',
        input: {
          asset: {
            label: 'USDT',
            icon: {
              url: 'https://cdn.jsdelivr.net/gh/curvefi/curve-assets/images/assets/0xdac17f958d2ee523a2206206994597c13d831ec7.png',
            },
          },
        },
        output: {
          asset: {
            label: 'USDC',
            icon: {
              url: 'https://res.cloudinary.com/sushi-cdn/image/fetch/w_48,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/icons/master/token/usdc.jpg',
            },
          },
        },
      },
    ],
  },

  'zksync': {
    name: 'zksync',
    title: 'zkSync',
    icon: { url: '/zksync.svg' },
    actions: [
      {
        title: 'Bridge',
        input: {
          asset: {
            label: 'USDC',
            icon: {
              url: 'https://res.cloudinary.com/sushi-cdn/image/fetch/w_48,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/icons/master/token/usdc.jpg',
            },
          },
        },
        output: {
          asset: {
            label: 'USDC',
            icon: {
              url: 'https://res.cloudinary.com/sushi-cdn/image/fetch/w_48,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/icons/master/token/usdc.jpg',
            },
          },
        },
      },
      {
        title: 'Bridge',
        input: {
          asset: {
            label: 'WETH',
            icon: {
              url: 'https://app.aave.com/icons/tokens/weth.svg',
            },
          },
        },
        output: {
          asset: {
            label: 'WETH',
            icon: {
              url: 'https://app.aave.com/icons/tokens/weth.svg',
            },
          },
        },
      },
    ],
  },

  'aave': {
    name: 'aave',
    title: 'Aave',
    icon: { url: 'https://app.aave.com/icons/tokens/aave.svg' },
    actions: [
      {
        title: 'Stake',
        input: {
          asset: {
            label: 'USDC',
            icon: {
              url: 'https://res.cloudinary.com/sushi-cdn/image/fetch/w_48,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/icons/master/token/usdc.jpg',
            },
          },
        },
        output: {
          asset: {
            label: 'USDC',
            icon: {
              url: 'https://res.cloudinary.com/sushi-cdn/image/fetch/w_48,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/icons/master/token/usdc.jpg',
            },
          },
        },
      },
      {
        title: 'Borrow',
        input: {
          asset: {
            label: 'WETHaave',
            icon: {
              url: 'https://app.aave.com/icons/tokens/weth.svg',
            },
          },
        },
        output: {
          asset: {
            label: 'WETH',
            icon: {
              url: 'https://app.aave.com/icons/tokens/weth.svg',
            },
          },
        },
      },
    ],
  },

  '1inch': {
    name: '1inch',
    title: '1INCH',
    icon: { url: 'https://app.aave.com/icons/tokens/1inch.svg' },
    actions: [
      {
        title: 'Swap',
        input: {
          asset: {
            label: 'WBTC',
            icon: {
              url: 'https://app.aave.com/icons/tokens/wbtc.svg',
            },
          },
        },
        output: {
          asset: {
            label: 'USDC',
            icon: {
              url: 'https://res.cloudinary.com/sushi-cdn/image/fetch/w_48,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/icons/master/token/usdc.jpg',
            },
          },
        },
      },
    ],
  },
}
