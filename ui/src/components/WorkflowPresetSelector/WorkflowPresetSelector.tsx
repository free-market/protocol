import React from 'react'

import { WorkflowContext } from '../WorkflowProvider'
import GenericSelector from '../GenericSelector'

const PRESETS = [
  {name: 'basic', label: 'basic cross-chain workflow', text:
  `[
  wethWrap({ amount: '1000000000000000000' }),
  curveTriCryptoSwap({ from: 'WETH', to: 'USDT', amount: '100%' }),
  wormholeTokenTransfer({
    fromChain: 'Ethereum',
    fromToken: 'USDT',
    toChain: 'Solana',
    amount: '100%'
  }),
  serumSwap({ from: 'USDTet', to: 'USDT', amount: '100%' })
]`},
{name: 'ether-to-mango-to-marinaded-sol', label: 'ether → mango → mSOL', text:
  `[
  wethWrap({ amount: '10000000000000000000' }),
  curveTriCryptoSwap({ from: 'WETH', to: 'USDT' }),
  curveThreePoolSwap({ from: 'USDT', to: 'USDC' }),
  wormholeTokenTransfer({
    fromChain: 'Ethereum',
    fromToken: 'USDC',
    toChain: 'Solana'
  }),
  serumSwap({ from: 'USDCet', to: 'USDC' }),
  mangoDeposit({ symbol: 'USDC' }),
  mangoWithdrawal({ symbol: 'SOL' }),
  marinadeStake()
]`},

]

export const WorkflowPresetSelector = (props: Record<string, unknown>): JSX.Element => {
  const {chosenPresetName, choosePreset} = React.useContext(WorkflowContext)
  const onChoice = (presetName: string) => {
    const choice = PRESETS.find(({name}) => name === presetName)

    if (choice == null) {
      throw new Error('could not find preset choice')
    }

    choosePreset(presetName, choice.text)
  }

  return (
    <>
      <GenericSelector id="preset-selector" heading={'Choose your workflow:'} choiceName={chosenPresetName} choices={PRESETS} onChoice={onChoice} />
    </>
  )
}
