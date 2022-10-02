import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import cx from 'classnames'
import { InformationCircleIcon, ChevronDownIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { Asset, MoneyAmount, WorkflowStep, BLOCKCHAIN_INFO, WorkflowEventType, WorkflowEvent } from '@fmp/sdk'
import { formatMoney } from 'utils'
import { StepInfo } from './StepInfo'
import { Connector } from './Connector'

export const WorkflowAssetView = (props: {
  asset: Asset
  amount?: MoneyAmount
  status?: React.ReactNode
}): JSX.Element => {
  // console.log('amount', props.amount)
  const { amount } = props
  return (
    <div className="rounded-full flex py-1 px-6 items-center text-s-base0 dark:text-s-base00 space-x-5 min-w-[220px]">
      <div className="w-10 h-10 relative translate-y-1">
        <img className="absolute w-8 h-8 rounded-full" src={props.asset.info.iconUrl} />
        <div className="absolute w-4 h-4 rounded-md right-1 bottom-1 overflow-hidden flex items-center justify-center">
          <img className="w-4 h-4" src={BLOCKCHAIN_INFO[props.asset.blockChain].iconUrl} />
        </div>
      </div>
      <div className="flex flex-col">
        <div className="font-bold">
          {amount && formatMoney(amount, props.asset.info.decimals)} {props.asset.symbol}
        </div>
        {/* {props.message && <div className="text-s-base1 dark:text-s-base01">{props.message}</div>} */}
        {props.status}
      </div>
    </div>
  )
}
