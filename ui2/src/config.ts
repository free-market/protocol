import { ActionGroupName } from '@component/CoreProvider/CoreProvider'

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
  curve: {
    name: 'curve',
    title: 'Curve',
    icon: { url: 'https://curve.fi/favicon-32x32.png' },
    actions: [
      {
        title: 'Swap',
        input: {
          asset: {
            label: '1INCH',
            icon: {
              url: 'https://app.aave.com/icons/tokens/1inch.svg',
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

  zksync: {
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
    ],
  },

  aave: {
    name: 'aave',
    title: 'Aave',
    icon: { url: 'https://app.aave.com/icons/tokens/aave.svg' },
    actions: [
      {
        title: 'Borrow',
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
    ],
  },
}
