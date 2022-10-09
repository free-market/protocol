import cx from 'classnames'
import {WorkflowAssetView} from '@component/StepView/AssetView'
import {NumberSpinner} from '@component/StepView/NumberSpinner'
import {formatMoney, WorkflowEvent, WorkflowEventType, WorkflowStep} from '@fmp/sdk'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { ArrowLongRightIcon } from '@heroicons/react/24/solid'

export const WorkflowStepCard = (props: { step: WorkflowStep, lastEvent?: WorkflowEvent, count?: number }): JSX.Element => {
  const { step, lastEvent, count = 1 } = props

  let inputAssetMessage = <span>{'on ' + props.step.inputAsset.blockChain}</span>
  let outputAssetMessage = <span>{'on ' + props.step.outputAsset.blockChain}</span>
  // let outputAmount = ''
  // if (props.step.stepId.includes('weth')) {
  //   console.log('last event', lastEvent)
  // }
  if (lastEvent?.absoluteInputAmount) {
    const message = 'Sent'
    const formattedMoney = formatMoney(lastEvent.absoluteInputAmount, props.step.inputAsset.info.decimals, 4)
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
        <NumberSpinner numbers={formatMoney(lastEvent.result.outputAmount, props.step.outputAsset.info.decimals, 4)} />
      </div>
    )
  }

  const item = 'flex items-center text-sm text-s-base1 dark:text-s-base01 poppy:text-zinc-500 first:rounded-bl-lg first:border-l border-r last:border-r-0 border-s-base3 dark:border-s-base03 poppy:border-zinc-700 bg-s-base2 dark:bg-s-base02 poppy:bg-zinc-800 px-2 py-1 border-b space-x-1'

  const active =
                (!!lastEvent && lastEvent?.type === WorkflowEventType.Submitted) ||
                lastEvent?.type === WorkflowEventType.StatusUpdate

  return (
    <div className="w-full max-w-4xl mx-auto border border-s-base2 dark:border-s-base02 poppy:border-zinc-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="pl-2 text-sm text-s-base1 dark:text-s-base01 poppy:text-zinc-500">#{count}</div>
          <div className="px-2 text-sm text-s-base1 dark:text-s-base01 poppy:text-zinc-500">
              {props.lastEvent?.statusMessage}
            </div>
        </div>
        <div className="flex items-center">
          <div className="flex items-center">
            <div className={item}>
              <InformationCircleIcon className="w-4 h-4 text-s-base1 dark:text-s-base01 poppy:text-zinc-500" />
              <div>
              $15 Fee
              </div>
            </div>
            <div className={item}>
              <InformationCircleIcon className="w-4 h-4 text-s-base1 dark:text-s-base01 poppy:text-zinc-500" />
              <div>
              ~1m
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="px-2 py-1 basis-0">
          <WorkflowAssetView
            asset={props.step.inputAsset}
            amount={props.step.inputAmount}
            status={<div className="text-s-base1 dark:text-s-base01 poppy:text-zinc-500">{inputAssetMessage}</div>}
          />
        </div>
        <ArrowLongRightIcon className="w-12 h-12 text-s-base2 dark:text-s-base02 poppy:text-zinc-700"/>

        <div className={cx('transition flex items-center space-x-2 min-w-[270px] p-1 rounded-full', {'bg-[linear-gradient(var(--rotate),#3f3f46,#27272a,#52525b)] animate-[magicspin_2s_linear_infinite]': active})}>
          <div className={cx('transition p-2 flex items-center space-x-2 min-w-[270px] rounded-full', {'bg-s-base2 dark:bg-s-base02 poppy:bg-zinc-700': active})}>
        <img style={{ width: 24, height: 24 }} src={step.info.iconUrl} />
          <div className="text-lg text-s-base02 dark:text-s-base1 poppy:text-zinc-300">{step.info.name}</div>
          <InformationCircleIcon className="w-4 h-4 text-s-base1 dark:text-s-base01 poppy:text-zinc-500" />
          </div>
        </div>
        <ArrowLongRightIcon className="w-12 h-12 text-s-base2 dark:text-s-base02 poppy:text-zinc-700"/>

        <div className="px-2 py-1 basis-0">
          <WorkflowAssetView asset={props.step.outputAsset} status={outputAssetMessage} reverse/>
        </div>
      </div>
    </div>
  )
}
