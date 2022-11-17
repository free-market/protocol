import { ActionGroupName } from '@component/CoreProvider/CoreProvider'

export type CatalogAction = {
  title: string
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
    actions: [{ title: 'Swap' }],
  },

  zksync: {
    name: 'zksync',
    title: 'zkSync',
    icon: { url: '/zksync.svg' },
    actions: [{ title: 'Bridge' }],
  },

  aave: {
    name: 'aave',
    title: 'Aave',
    icon: { url: 'https://app.aave.com/icons/tokens/aave.svg' },
    actions: [{ title: 'Borrow' }],
  },
}
