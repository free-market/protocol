import {WorkflowAssetView} from '@component/StepView/AssetView'
import {NumberSpinner} from '@component/StepView/NumberSpinner'
import {formatMoney, WorkflowEvent, WorkflowStep} from '@fmp/sdk'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { InformationCircleIcon as SolidInformationCircleIcon } from '@heroicons/react/24/solid'

export const WorkflowStepCard = (props: { step: WorkflowStep, lastEvent?: WorkflowEvent }): JSX.Element => {
  const { step, lastEvent } = props

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

  const item = 'flex items-center text-sm text-s-base1 last:rounded-br-lg last:border-r border-l first:border-l-0 border-s-base3 bg-s-base2 px-2 py-1 border-b space-x-1'

  return (
    <div className="max-w-lg mx-auto border border-s-base1 rounded-xl overflow-hidden">
      <div className="flex items-center mb-2">
        <div className="flex items-center">
          <div className={item}>#1</div>
          <div className={item}>
            <InformationCircleIcon className="w-4 h-4 text-s-base1" />
            <div>
            $15 Fee
            </div>
          </div>
          <div className={item}>
            <InformationCircleIcon className="w-4 h-4 text-s-base1" />
            <div>
            ~1m
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="px-2 text-sm text-s-base1">compiled</div>
        </div>
      </div>

      <div className="flex space-x-2 items-center px-2">
        <img style={{ width: 24, height: 24 }} src={step.info.iconUrl} />
        <div className="text-lg text-s-base02">{step.info.name}</div>
        <InformationCircleIcon className="w-4 h-4 text-s-base1" />
      </div>
      <div className="py-1" />
      <div className="border-t border-s-base1 w-full" />
      <div className="grid grid-cols-2">
        <div className="px-2 py-1">
          <div className="text-sm text-s-base1">Input</div>

          <WorkflowAssetView
            asset={props.step.inputAsset}
            amount={props.step.inputAmount}
            status={<div className="text-s-base1 dark:text-s-base01">{inputAssetMessage}</div>}
          />
        </div>

        <div className="border-l border-s-base1 px-2 py-1">
          <div className="text-sm text-s-base1">Output</div>
          <WorkflowAssetView asset={props.step.outputAsset} status={outputAssetMessage} />
        </div>
      </div>
    </div>
  )
}
