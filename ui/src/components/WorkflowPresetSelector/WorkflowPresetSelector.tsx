import React from 'react'

import { WorkflowContext } from '../WorkflowProvider'
import GenericSelector from '../GenericSelector'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

const PRESETS = [
  {
    name: 'basic',
    label: 'basic cross-chain workflow',
    text: `[
  wethWrap({ amount: '1000000000000000000' }),
  curveTriCryptoSwap({ from: 'WETH', to: 'USDT', amount: '100%' }),
  wormholeTokenTransfer({
    fromChain: 'Ethereum',
    fromToken: 'USDT',
    toChain: 'Solana',
    amount: '100%'
  }),
  serumSwap({ from: 'USDTet', to: 'USDT', amount: '100%' })
]`,
  },
  {
    name: 'ether-to-mango-to-marinaded-sol',
    label: 'ether → mango → mSOL',
    text: `[
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
]`,
  },
  {
    name: 'pool-rebalance',
    label: 'AMM Pool Rebalancing',
    text: `[
      serumSwap({ from: 'USDC', to: 'USDCet', amount: 1_000_000_000000 }), // $1M USDC
      wormholeTokenTransfer({ 
          fromChain: 'Solana', 
          fromToken: 'USDCet', 
          toChain: 'Ethereum' }),
      curveThreePoolSwap({ from: 'USDC', to: 'USDT' }),
      wormholeTokenTransfer({ 
          fromChain: 'Ethereum', 
          fromToken: 'USDT', 
          toChain: 'Solana' }),
      serumSwap({ from: 'USDTet', to: 'USDT' })
]`,
  },
]

interface Props {
  onWorkflowChanged: () => void
}

export const WorkflowPresetSelector = (props: Record<string, unknown>): JSX.Element => {
  const { chosenPresetName, choosePreset } = React.useContext(WorkflowContext)
  const onChoice = (presetName: string) => {
    const choice = PRESETS.find(({ name }) => name === presetName)

    if (choice == null) {
      throw new Error('could not find preset choice')
    }

    choosePreset(presetName, choice.text)
  }

  return (
    <>
      <GenericSelector
        id="preset-selector"
        heading={'Choose your workflow:'}
        choiceName={chosenPresetName}
        choices={PRESETS}
        onChoice={onChoice}
      />
    </>
  )
}
