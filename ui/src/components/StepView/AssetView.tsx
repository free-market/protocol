import React from 'react'
import Box from '@mui/system/Box'
import cx from 'classnames'
import { Asset, AssetAmount, BLOCKCHAIN_INFO, formatMoney, getAssetInfo } from '@fmp/sdk'

export const WorkflowAssetView = (props: {
  asset: Asset
  amount?: AssetAmount
  status?: React.ReactNode
  useLegacyWidth?: boolean
  reverse?: boolean
}): JSX.Element => {
  // console.log('amount', props.amount)
  const { amount, useLegacyWidth = false, reverse = false } = props
  const assetInfo = getAssetInfo(props.asset)
  if (!assetInfo) {
    console.log('--------------------------------------')
    console.log(JSON.stringify(assetInfo))
  }
  const assetIconUrl = assetInfo.iconUrl
  const chainIconUrl = BLOCKCHAIN_INFO[props.asset.chain].iconUrl
  // console.log(`chainIconUrl=${chainIconUrl} assetIconUrl=${assetIconUrl}`)
  return (
    <div
      className={cx('rounded-full flex py-1 items-center text-s-base0 dark:text-s-base00 poppy:text-zinc-500 min-w-[220px]', {
        'min-w-[220px] px-6': useLegacyWidth,
        'flex-row-reverse': reverse,
      })}
    >
      <div className="w-10 h-10 relative translate-y-1">
        <img className="absolute w-8 h-8 rounded-full" src={assetIconUrl} />
        <div className="absolute w-4 h-4 rounded-md right-1 bottom-1 overflow-hidden flex items-center justify-center">
          <img className="w-4 h-4" src={chainIconUrl} />
        </div>
      </div>
      <div className="mx-2">
        <div className="font-bold">
          {amount && formatMoney(amount, assetInfo.decimals, 4)} {props.asset.symbol}
        </div>
        <Box sx={{ fontSize: 12 }}>{props.status}</Box>
      </div>
    </div>
  )
}
