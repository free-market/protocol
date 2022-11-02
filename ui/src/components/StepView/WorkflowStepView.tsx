import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import cx from 'classnames'
import { InformationCircleIcon, ChevronDownIcon, ArrowTopRightOnSquareIcon, CheckIcon } from '@heroicons/react/24/outline'
import {
  Asset,
  AssetAmount,
  WorkflowStep,
  BLOCKCHAIN_INFO,
  WorkflowEventType,
  WorkflowEvent,
  formatMoney,
  getStepInfo,
  WorkflowActionInput,
  getAssetInfo,
  WorkflowAction,
} from '@fmp/sdk'

import { StepInfo } from './StepInfo'
import { Connector } from './Connector'
import { WorkflowAssetView } from './AssetView'
import { NumberSpinner } from './NumberSpinner'
import Box from '@mui/system/Box'

export const WorkflowStepView = (props: {
  step: WorkflowAction
  lastEvent?: WorkflowEvent
  // completed: boolean
  children?: React.ReactNode
}): JSX.Element => {
  const [expanded, setExpanded] = React.useState(false)

  // const [absoluteAmount, setAbsoluteAmount] = React.useState<string | undefined>(undefined)
  // console.log('lastEvent', props.lastEvent)

  const stepInfo = getStepInfo(props.step)
  const inputAssetInfo = getAssetInfo(props.step.inputAsset)
  const outputAssetInfo = getAssetInfo(props.step.outputAsset)
  const toggle = () => {
    setExpanded((state) => !state)
  }

  const bridgeBlock = (
    <div className="group">
      <a
        key={0}
        className="inline-block  text-s-base1 dark:text-s-base01 border-l-2 border-s-base1 dark:border-s-base01 ml-7 px-5 max-w-prose group-hover:translate-x-2 transition group-hover:bg-s-base2/25 dark:group-hover:bg-s-base02"
        target="_blank"
        href="https://etherscan.io/address/0x0000000000000000000000000000000000000000"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm">Bridge:&nbsp;</span>
            <span className="text-s-base0 dark:text-s-base00 flex items-center">{stepInfo.name}</span>
          </div>
          <ArrowTopRightOnSquareIcon className="w-4 h-4 text-s-base1 dark:text-s-base01" />
        </div>
        <div>
          <span className="text-sm">Contract Address:</span>&nbsp;
          <span className="text-s-base0 dark:text-s-base00 underline">0x0000000000000000000000000000000000000000</span>
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
              {inputAssetInfo.name} (<code className="font-mono">{inputAssetInfo.symbol}</code>){' '}
            </span>
          </div>
          <ArrowTopRightOnSquareIcon className="w-4 h-4 text-s-base1 dark:text-s-base01" />
        </div>
        <div>
          <span className="text-sm">Contract Address:</span>&nbsp;
          <span className="text-s-base0 underline">0x0000000000000000000000000000000000000000</span>
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
              {outputAssetInfo.name} (<code className="font-mono">{outputAssetInfo.symbol}</code>)
            </span>
          </div>
          <ArrowTopRightOnSquareIcon className="w-4 h-4 text-s-base1 dark:text-s-base01" />
        </div>
        <div>
          <span className="text-sm">Contract Address:</span>&nbsp;
          <span className="text-s-base0 underline">0x0000000000000000000000000000000000000000</span>
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

  let inputAssetMessage = <span>{'on ' + props.step.inputAsset.chain}</span>
  let outputAssetMessage = <span>{'on ' + props.step.outputAsset.chain}</span>
  // let outputAmount = ''
  const { lastEvent } = props
  // if (props.step.stepId.includes('weth')) {
  //   console.log('last event', lastEvent)
  // }
  if (lastEvent?.absoluteInputAmount) {
    const message = 'Sent'
    const formattedMoney = formatMoney(lastEvent.absoluteInputAmount, inputAssetInfo.decimals, 4)
    inputAssetMessage = (
      <>
        <span style={{ display: 'inline-block', marginRight: 6 }}>{message}</span>
        <NumberSpinner numbers={formattedMoney} />
      </>
    )
  }

  if (lastEvent?.result) {
    // outputAmount = lastEvent.result.outputAmount
    // console.log('outputAmountt', outputAmount)
    outputAssetMessage = (
      <div style={{ all: 'initial', color: 'inherit', font: 'inherit' }}>
        <span style={{ display: 'inline-block' }}>Received&nbsp;&nbsp;</span>
        <NumberSpinner numbers={formatMoney(lastEvent.result.outputAmount, outputAssetInfo.decimals, 4)} />
      </div>
    )
  }

  return (
    <>
      <Box py={1}>
        <Box
          sx={{ padding: 1 }}
          className={cx(
            'group max-w-4xl rounded-full text-s-base0 dark:text-s-base00 flex justify-between items-center w-full cursor-pointer transition transition-100',
            'active:bg-s-base1/25 active:transition-none hover:bg-s-base2/25 dark:hover:bg-s-base02/25 poppy:hover:bg-zinc-800',
          )}
          onClick={toggle}
        >
          <ChevronDownIcon
            className={cx(
              'text-s-base2 dark:text-s-base02 poppy:text-zinc-600 poppy:group-hover:text-zinc-500 w-8 h-8 translate-x-3 transition transition-100 group-hover:text-s-base1 group-hover:text-s-base01',
              { '-rotate-90': !expanded },
            )}
          />
          <Box sx={{ minWidth: 10 }} />
          <WorkflowAssetView
            useLegacyWidth
            asset={props.step.inputAsset}
            amount={props.step.inputAmount}
            status={<div className="text-s-base1 dark:text-s-base01">{inputAssetMessage}</div>}
          />
          <div className="grow" />
          {/*<Connector active={ props.stepStatus === WorkflowEventType.Starting} />*/}
          <Box>
            {props.lastEvent && <div style={{ textAlign: 'center' }}>&nbsp;</div>}
            <StepInfo
              step={props.step}
              active={
                (!!props.lastEvent && props.lastEvent?.type === WorkflowEventType.Submitted) ||
                props.lastEvent?.type === WorkflowEventType.StatusUpdate
              }
            />
            {props.lastEvent && (
              <Box sx={{ textAlign: 'center' }}>
                {props.lastEvent.type === WorkflowEventType.Completed && <span>✔️</span>}
                {props.lastEvent?.statusMessage}
              </Box>
            )}
          </Box>
          <div className="grow" />
          {/*<Connector active={false} />*/}
          <WorkflowAssetView asset={props.step.outputAsset} status={outputAssetMessage} useLegacyWidth />
          {props.children}
        </Box>
      </Box>
      <AnimatePresence>{expanded && descriptions}</AnimatePresence>
    </>
  )
}