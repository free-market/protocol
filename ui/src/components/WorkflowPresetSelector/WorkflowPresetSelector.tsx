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
    label: 'Cross Chain Deposit',
    triggerType: 'Manual',
    text: `[
    oneInchSwap({ chain: 'ZkSync', from: 'WBTC', to: 'USDC', amount: '240000000' })
  
  }),
  serumSwap({ from: 'USDTet', to: 'USDT', amount: '100%' })
]`,
  },
  {
    name: 'ether-to-mango-to-marinaded-sol',
    label: 'Ether → Mango → mSOL',
    triggerType: 'xNFT',
    text: `[
  wethWrap({ amount: '10000000000000000000' }),
  curveTriCryptoSwap({ chain: 'Ethereum', from: 'WETH', to: 'USDT' }),
  curveThreePoolSwap({ chain: 'Ethereum', from: 'USDT', to: 'USDC' }),
  wormholeTokenTransfer({
      fromAsset: 'Ethereum.USDC',
      toChain: 'Solana'
  }),
  serumSwap({ from: 'USDCet', to: 'USDC' }),
  mangoDeposit({ symbol: 'USDC' }),
  mangoWithdrawal({ symbol: 'SOL' }),
  marinadeStake({})
]`,
  },
  {
    name: 'pool-rebalance',
    triggerType: 'Market',
    label: 'AMM Pool Rebalancing',
    text: `[
      serumSwap({ from: 'USDC', to: 'USDCet', amount: 1_000_000_000000 }), // $1M USDC
      wormholeTokenTransfer({
          fromAsset: 'Solana.USDCet',
          toChain: 'Ethereum' }),
      curveThreePoolSwap({ from: 'Ethereum.USDC', to: 'Ethereum.USDT' }),
      wormholeTokenTransfer({
          fromAsset: 'Ethereum.USDT',
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

    choosePreset(presetName, choice.text, choice.triggerType)
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
