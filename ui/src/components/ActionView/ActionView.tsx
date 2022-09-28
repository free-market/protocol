import React from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { Asset, MoneyAmount, WorkflowStep, BLOCKCHAIN_INFO } from '@fmp/sdk'
import { formatMoney } from 'utils'

const BalanceCard = (props: {
  asset: Asset
  amount: MoneyAmount
}): JSX.Element => (
  <div className="rounded-full bg-sky-700 py-2 px-6 inline-flex items-center text-sky-200 space-x-5">
    <div className="w-10 h-10 relative translate-y-1">
      <img
        className="absolute w-8 h-8 rounded-full"
        src={props.asset.info.iconUrl}
      />
      <div className="absolute w-4 h-4 rounded-md right-1 bottom-1 overflow-hidden flex items-center justify-center">
        <img
          className="w-4 h-4"
          src={BLOCKCHAIN_INFO[props.asset.blockChain].iconUrl}
        />
      </div>
    </div>
    <div className="flex flex-col">
      <div className="font-bold">
        {formatMoney(props.amount, props.asset.info.decimals)}{' '}
        {props.asset.symbol}
      </div>
      <div className="text-sky-300">on {props.asset.blockChain}</div>
    </div>
  </div>
)

export const ActionView = (props: {
  step: WorkflowStep
  children?: React.ReactNode
}): JSX.Element => {
  const snippets = ['1/3 Transaction', 'No Fee', '~15m']

  const snippetEls = snippets.map((snippet, index) => (
    <div
      key={index}
      className="inline-flex items-center text-slate-400 space-x-1 bg-slate-200 first:rounded-tl-lg last:rounded-br-lg border-l border-slate-300 first:border-l-0 px-2 py-1 text-sm"
    >
      <InformationCircleIcon className="w-5 h-5" />
      <span>{snippet}</span>
    </div>
  ))

  return (
    <>
      {/* snippetEls */}
      <div className="max-w-4xl rounded-full bg-sky-900 flex justify-between items-center w-full">
        <BalanceCard
          asset={props.step.inputAsset}
          amount={props.step.inputAmount}
        />
        <div className="border-t-4 border-dashed border-sky-600 flex grow shrink mx-5" />
        <div className="rounded-full p-2 bg-sky-700 text-sky-300 font-bold flex items-center space-x-2">
          <img
            className="inline w-6 h-6 rounded-full"
            src={props.step.info.iconUrl}
          />
          <div className="inline">{props.step.info.name}</div>
        </div>
        <div className="border-t-4 border-dashed border-sky-600 flex grow shrink mx-5" />
        <BalanceCard asset={props.step.outputAsset} amount="" />
        {props.children}
      </div>
    </>
  )
}
