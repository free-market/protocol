import { ComponentStory, ComponentMeta } from '@storybook/react'

import { ScriptEditor as Component } from './ScriptEditor'

export const story = {
  title: 'Example/ScriptEditor',
  component: Component,
}

export default story as ComponentMeta<typeof Component>

export const ScriptEditor: ComponentStory<typeof Component> = (args) => (
  <Component {...args} />
)
ScriptEditor.args = {
  snippet: `module.exports = [
  wethWrap({ amount: '1000000000000000000' }),
  curveTriCryptoSwap({ from: 'WETH', to: 'USDT', amount: '100%' }),
  wormholeTokenTransfer({
    fromChain: 'Ethereum',
    fromToken: 'USDT',
    toChain: 'Solana',
    amount: '100%'
  }),
  saberSwap({ from: 'USDTet', to: 'USDT', amount: '100%' })
]`,
}
