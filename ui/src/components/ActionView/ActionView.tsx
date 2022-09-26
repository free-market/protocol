import React from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

const BalanceCard = (props: {
  ticker: string
  amount: string
  chain: string
}): JSX.Element => (
  <div className="rounded-full bg-sky-700 py-2 px-6 inline-flex items-center text-sky-200 space-x-5">
    <div className="w-10 h-10 relative translate-y-1">
      <img className="absolute w-8 h-8 rounded-full" src="/ethereum-eth.svg" />
      <div className="absolute w-4 h-4 rounded-md right-1 bottom-1 overflow-hidden flex items-center justify-center">
        <img className="w-4 h-4" src="/ethereum-chain.svg" />
      </div>
    </div>
    <div className="flex flex-col">
      <div className="font-bold">
        {props.amount} {props.ticker}
      </div>
      <div className="text-sky-300">on {props.chain}</div>
    </div>
  </div>
)

export const ActionView = (props: {
  children: React.ReactNode
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
        <BalanceCard ticker="ETH" amount="0.0030" chain="Ethereum" />
        <div className="border-t-4 border-dashed border-sky-600 flex grow shrink mx-5" />
        <div className="rounded-full p-2 bg-sky-700 text-sky-300 font-bold flex items-center space-x-2">
          <img
            className="inline w-6 h-6 rounded-full"
            src="/ethereum-eth.svg"
          />
          <div className="inline">WETH Contract </div>
        </div>
        <div className="border-t-4 border-dashed border-sky-600 flex grow shrink mx-5" />
        <BalanceCard ticker="WETH" amount="0.0030" chain="Ethereum" />
        {props.children}
      </div>
    </>
  )
}
