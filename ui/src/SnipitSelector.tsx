/* eslint-disable @typescript-eslint/no-explicit-any */
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { useState } from 'react'

export interface SampleWorkflow {
  triggerType: string
  snippit: string
}

interface Props {
  onChange?: (workflow: SampleWorkflow) => void
}

const WORKFLOWS: SampleWorkflow[] = [
  {
    triggerType: 'Manual',
    snippit: `[
    oneInchSwap({ chain: 'ZkSync', from: 'WBTC', to: 'USDC', amount: '240000000' }),
    zkSyncBridge({ fromChain: 'ZkSync', token: 'USDC' }),
    aaveStake({ chain: 'Ethereum', token: 'USDC' }),
    aaveBorrow({ chain: 'Ethereum', token: 'WETH' }),
    zkSyncBridge({ fromChain: 'Ethereum', token: 'WETH' })
  ]`,
  },
  {
    triggerType: 'xNFT',
    snippit: `[
  wethWrap({ amount: '10000000000000000000' }),
  curveTriCryptoSwap({ chain: 'Ethereum', from: 'WETH', to: 'USDT' }),
  curveThreePoolSwap({ chain: 'Ethereum', from: 'USDT', to: 'USDC' }),
  wormholeTokenTransfer({ fromAsset: 'Ethereum.USDC', toChain: 'Solana' }),
  serumSwap({ from: 'USDCet', to: 'USDC' }),
  mangoDeposit({ symbol: 'USDC' }),
  mangoWithdrawal({ symbol: 'SOL' }),
  marinadeStake({})
]`,
  },
  {
    triggerType: 'Market',
    snippit: `[
  wethWrap({ amount: '1000000000000000000' }),
  curveTriCryptoSwap({ chain: 'Ethereum', from: 'WETH', to: 'USDT', amount: '100%' }),
  curveThreePoolSwap({ chain: 'Ethereum', from: 'USDT', to: 'USDC', amount: '100%' }),
  wormholeTokenTransfer({
    fromAsset: 'Ethereum.USDC',
    toChain: 'Solana',
    amount: '100%'
  }),
  serumSwap({ from: 'USDCet', to: 'USDC', amount: '100%' })
]`,
  },
]

const INITIAL_VALUE = '0'
export const INITIAL_WORKFLOW = WORKFLOWS[0]

export const SnipitSelector = (props: Props): JSX.Element => {
  const [value, setValue] = useState(INITIAL_VALUE)
  const { onChange } = props

  function handleChange(event: SelectChangeEvent<any>) {
    const newVal = event.target.value
    if (onChange) {
      const i = parseInt(newVal)
      onChange(WORKFLOWS[i])
    }

    setValue(newVal)
  }

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
      <InputLabel id="snipit-selector">Workflow</InputLabel>
      <Select labelId="demo-select-small" id="demo-select-small" value={value} label="Workflow Code" onChange={handleChange}>
        <MenuItem value={0}>Basic Cross-chain asset movement</MenuItem>
        <MenuItem value={1}>ETH through Mango to Marinaded SOL</MenuItem>
      </Select>
    </FormControl>
  )
}
