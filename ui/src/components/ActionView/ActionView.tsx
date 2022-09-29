import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import cx from 'classnames'
import {
  InformationCircleIcon,
  ChevronDownIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'
import { Asset, MoneyAmount, WorkflowStep, BLOCKCHAIN_INFO } from '@fmp/sdk'
import { formatMoney } from 'utils'

const BalanceCard = (props: {
  asset: Asset
  amount: MoneyAmount
}): JSX.Element => (
  <div className="rounded-full py-2 px-6 inline-flex items-center text-s-base0 dark:text-s-base00 space-x-5">
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
      <div className="text-s-base1 dark:text-s-base01">
        on {props.asset.blockChain}
      </div>
    </div>
  </div>
)

export const ActionView = (props: {
  step: WorkflowStep
  stepIndex: number
  children?: React.ReactNode
}): JSX.Element => {
  const [expanded, setExpanded] = React.useState(false)

  const snippets = ['1/3 Transaction', 'No Fee', '~15m']

  const snippetEls = snippets.map((snippet, index) => (
    <div
      key={index}
      className="inline-flex items-center text-s-base1 space-x-1 first:rounded-tl-lg last:rounded-br-lg border-l border-s-base2 first:border-l-0 px-2 py-1 text-sm first:ml-5"
    >
      <InformationCircleIcon className="w-5 h-5" />
      <span>{snippet}</span>
    </div>
  ))

  const toggle = () => {
    setExpanded((state) => !state)
  }

  const bridgeBlock = (
    <div className="group">
      <a
        key={0}
        className="inline-block text-s-base1 dark:text-s-base01 border-l-2 border-s-base1 dark:border-s-base01 ml-7 px-5 max-w-prose group-hover:translate-x-2 transition group-hover:bg-s-base2/25 dark:group-hover:bg-s-base02"
        target="_blank"
        href="https://etherscan.io/address/0x0000000000000000000000000000000000000000"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm">Bridge:&nbsp;</span>
            <span className="text-s-base0 dark:text-s-base00 flex items-center">
              {props.step.info.name}
            </span>
          </div>
          <ArrowTopRightOnSquareIcon className="w-4 h-4 text-s-base1 dark:text-s-base01" />
        </div>
        <div>
          <span className="text-sm">Contract Address:</span>&nbsp;
          <span className="text-s-base0 dark:text-s-base00 underline">
            0x0000000000000000000000000000000000000000
          </span>
        </div>
      </a>
    </div>
  )

  const inputBlock = (
    <div className="group">
      <a
        key={1}
        className="inline-block text-s-base1 dark:text-s-base01 border-l-2 border-s-base1 dark:border-s-base01 ml-7 px-5 max-w-prose group-hover:translate-x-2 transition group-hover:bg-s-base2/25 dark:group-hover:bg-s-base02"
        target="_blank"
        href="https://etherscan.io/address/0x0000000000000000000000000000000000000000"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm">Input Asset:&nbsp;</span>
            <span className="text-s-base0 dark:text-s-base00 flex items-center">
              {props.step.inputAsset.info.fullName} (
              <code className="font-mono">{props.step.inputAsset.symbol}</code>){' '}
            </span>
          </div>
          <ArrowTopRightOnSquareIcon className="w-4 h-4 text-s-base1 dark:text-s-base01" />
        </div>
        <div>
          <span className="text-sm">Contract Address:</span>&nbsp;
          <span className="text-s-base0 underline">
            0x0000000000000000000000000000000000000000
          </span>
        </div>
      </a>
    </div>
  )

  const outputBlock = (
    <div className="group">
      <a
        key={2}
        className="inline-block text-s-base1 dark:text-s-base01 border-l-2 border-s-base1 dark:border-s-base01 ml-7 px-5 max-w-prose group-hover:translate-x-2 transition group-hover:bg-s-base2/25 dark:group-hover:bg-s-base02"
        target="_blank"
        href="https://etherscan.io/address/0x0000000000000000000000000000000000000000"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm">Output Asset:&nbsp;</span>
            <span className="text-s-base0 dark:text-s-base00 flex items-center">
              {props.step.outputAsset.info.fullName} (
              <code className="font-mono">{props.step.outputAsset.symbol}</code>
              ){' '}
            </span>
          </div>
          <ArrowTopRightOnSquareIcon className="w-4 h-4 text-s-base1 dark:text-s-base01" />
        </div>
        <div>
          <span className="text-sm">Contract Address:</span>&nbsp;
          <span className="text-s-base0 underline">
            0x0000000000000000000000000000000000000000
          </span>
        </div>
      </a>
    </div>
  )

  const paragraphs = [bridgeBlock, inputBlock, outputBlock]

  const descriptions = (
    <motion.div
      className="flex flex-col justify-start items-start space-y-5"
      initial={{ opacity: 0, x: -10, y: -10 }}
      exit={{ opacity: 0, x: -10, y: -10, transition: { duration: 0.05 } }}
      animate={{ opacity: 1, x: 0, y: 0 }}
    >
      {paragraphs}
    </motion.div>
  )

  return (
    <>
      <motion.div initial={{opacity: 0, y: 10, scale: 0.9}} animate={{opacity: 1, y: 0, scale: 1, transition: {delay: props.stepIndex * 0.1}}}>
        <div>{/* snippetEls */}</div>
        <div
          className={cx(
            'group max-w-4xl rounded-full border border-s-base2 dark:border-s-base02 flex justify-between items-center w-full cursor-pointer transition transition-100',
            'active:bg-s-base1/25 active:transition-none hover:bg-s-base2/25 dark:hover:bg-s-base02/25',
          )}
          onClick={toggle}
        >
          <ChevronDownIcon
            className={cx(
              'text-s-base2 dark:text-s-base02 w-8 h-8 translate-x-3 transition transition-100 group-hover:text-s-base1 group-hover:text-s-base01',
              { '-rotate-90': !expanded },
            )}
          />
          <BalanceCard
            asset={props.step.inputAsset}
            amount={props.step.inputAmount}
          />
          <div className="border-t-4 border-dashed border-s-base2 dark:border-s-base02 flex grow shrink mx-5 group-hover:border-s-base1/25" />
          <div className="rounded-full p-2 bg-s-base2 dark:bg-s-base02 text-s-base0 dark:text-s-base00 font-bold flex items-center space-x-2 transition group-hover:bg-s-base2 dark:group-hover:bg-s-base02">
            <img
              className="inline w-6 h-6 rounded-full"
              src={props.step.info.iconUrl}
            />
            <div className="inline">{props.step.info.name}</div>
          </div>
          <div className="border-t-4 border-dashed border-s-base2 dark:border-s-base02 flex grow shrink mx-5 group-hover:border-s-base1/25" />
          <BalanceCard asset={props.step.outputAsset} amount="" />
          {props.children}
        </div>
      </motion.div>
      <AnimatePresence>{expanded && descriptions}</AnimatePresence>
    </>
  )
}
