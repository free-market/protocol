import { ActionGroupName } from '@component/CoreProvider/CoreProvider'

export const headingMap: Record<ActionGroupName, { title: string; icon: { url: string } }> = {
  curve: { title: 'Curve', icon: { url: 'https://curve.fi/favicon-32x32.png' } },
  zksync: { title: 'zkSync', icon: { url: '/zksync.svg' } },
  aave: { title: 'Aave', icon: { url: 'https://app.aave.com/icons/tokens/aave.svg' } },
}
