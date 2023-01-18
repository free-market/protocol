export type StepChoiceIndex = number

export type CatalogAsset = {
  label: string
  icon: { url: string }
  network: {
    label: string
    chain: {
      label: string
      icon: { url: string }
    }
  }
}

export type CatalogAction = {
  title: string
  input: { asset: CatalogAsset }
  output: { asset: CatalogAsset }
}

export type CatalogGroup = {
  name: 'curve' | 'zksync' | 'aave' | '1inch'
  title: string
  icon: { url: string }
  actions: CatalogAction[]
}

export type Catalog = Record<CatalogGroup['name'], CatalogGroup>

const chains: Record<'ethereum' | 'zksync', CatalogAsset['network']['chain']> =
  {
    ethereum: { label: 'Ethereum', icon: { url: '/ethereum-chain.svg' } },
    zksync: { label: 'zkSync', icon: { url: '/zksync.svg' } },
  }

const networks: Record<'ethereum' | 'zksync', CatalogAsset['network']> = {
  ethereum: { label: 'Mainnet', chain: chains.ethereum },
  zksync: { label: 'Mainnet', chain: chains.zksync },
}

export const catalog: Catalog = {
  'curve': {
    name: 'curve',
    title: 'Curve',
    icon: { url: '/curve.svg' },
    actions: [
      {
        title: 'Swap',
        input: {
          asset: {
            label: 'USDC',
            icon: {
              url: '/usdc.svg',
            },
            network: networks.ethereum,
          },
        },
        output: {
          asset: {
            label: 'USDT',
            icon: {
              url: 'https://app.aave.com/icons/tokens/usdt.svg',
            },
            network: networks.ethereum,
          },
        },
      },

      {
        title: 'Swap',
        input: {
          asset: {
            label: 'USDT',
            icon: {
              url: 'https://app.aave.com/icons/tokens/usdt.svg',
            },
            network: networks.ethereum,
          },
        },
        output: {
          asset: {
            label: 'USDC',
            icon: {
              url: '/usdc.svg',
            },
            network: networks.ethereum,
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
              url: '/usdc.svg',
            },
            network: networks.zksync,
          },
        },
        output: {
          asset: {
            label: 'USDC',
            icon: {
              url: '/usdc.svg',
            },
            network: networks.ethereum,
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
            network: networks.ethereum,
          },
        },
        output: {
          asset: {
            label: 'WETH',
            icon: {
              url: 'https://app.aave.com/icons/tokens/weth.svg',
            },
            network: networks.zksync,
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
        title: 'Supply',
        input: {
          asset: {
            label: 'USDC',
            icon: {
              url: '/usdc.svg',
            },
            network: networks.ethereum,
          },
        },
        output: {
          asset: {
            label: 'USDCaave',
            icon: {
              url: '/usdc.svg',
            },
            network: networks.ethereum,
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
            network: networks.ethereum,
          },
        },
        output: {
          asset: {
            label: 'WETH',
            icon: {
              url: 'https://app.aave.com/icons/tokens/weth.svg',
            },
            network: networks.ethereum,
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
            network: networks.zksync,
          },
        },
        output: {
          asset: {
            label: 'USDC',
            icon: {
              url: '/usdc.svg',
            },
            network: networks.zksync,
          },
        },
      },
    ],
  },
}
