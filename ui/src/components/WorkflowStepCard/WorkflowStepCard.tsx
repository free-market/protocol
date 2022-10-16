import cx from 'classnames'
import { WorkflowAssetView } from '@component/StepView/AssetView'
import { NumberSpinner } from '@component/StepView/NumberSpinner'
import { formatMoney, WorkflowEvent, WorkflowEventType, WorkflowStep } from '@fmp/sdk'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { ArrowLongRightIcon } from '@heroicons/react/24/solid'
import { motion, AnimatePresence } from 'framer-motion'
import Popup from 'Popup'

export const WorkflowStepCard = (props: { step: WorkflowStep; lastEvent?: WorkflowEvent; count?: number }): JSX.Element => {
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

  const item =
    'flex items-center text-sm text-s-base1 dark:text-s-base01 poppy:text-zinc-500 first:rounded-bl-lg first:border-l border-r last:border-r-0 border-s-base3 dark:border-s-base03 poppy:border-zinc-800 bg-s-base2 dark:bg-s-base02 poppy:bg-zinc-800 px-2 py-1 border-b space-x-1'

  const active = (!!lastEvent && lastEvent?.type === WorkflowEventType.Submitted) || lastEvent?.type === WorkflowEventType.StatusUpdate

  const middle = (
    <Popup
      popup={
        <div className="poppy:bg-zinc-700 poppy:text-zinc-200 bg-s-base2 text-s-base01 dark:bg-s-base02 dark:text-s-base1 max-w-prose">
          <div className="flex items-center space-x-2 px-5 pt-5 pb-3">
            <img style={{ width: 24, height: 24 }} src={step.info.iconUrl} />
            <div className="font-bold text-lg">{props.step.info.name}</div>
          </div>
          <div className="">
            <div className="text-sm px-5 pb-5">{props.step.info.description}</div>
            <div className="px-5 text-sm">
              <span>url:</span>{' '}
              <a href={props.step.info.webSiteUrl} rel="noreferrer" target="_blank" className="text-s-blue underline cursor-pointer">
                {props.step.info.webSiteUrl}
              </a>
            </div>
            <div className="px-5 pb-5 text-sm">
              <span>contract:</span>{' '}
              <a
                href="https://etherscan.io/address/0x0000000000000000000000000000000000000000"
                rel="noreferrer"
                target="_blank"
                className="text-s-blue underline cursor-pointer"
              >
                <span className="underline">0x0000000000000000000000000000000000000000</span>
              </a>
            </div>
          </div>
        </div>
      }
    >
      <div
        className={cx('transition flex items-center space-x-2 min-w-[270px] p-1 rounded-full', {
          'bg-[linear-gradient(var(--rotate),#268bd2,#cb4b16,#859900)] poppy:bg-[linear-gradient(var(--rotate),#5ddcff,#3c67e3_43%,#4e00c2)] animate-[magicspin_2s_linear_infinite]':
            active,
        })}
      >
        <div
          className={cx('transition p-2 flex items-center space-x-2 min-w-[270px] rounded-full', {
            'bg-s-base2 dark:bg-s-base02 poppy:bg-zinc-700': active,
          })}
        >
          <img style={{ width: 24, height: 24 }} src={step.info.iconUrl} />
          <div className="text-lg text-s-base02 dark:text-s-base1 poppy:text-zinc-300">{step.info.name}</div>
          {/* <InformationCircleIcon className="w-4 h-4 text-s-base1 dark:text-s-base01 poppy:text-zinc-500" /> */}
        </div>
      </div>
    </Popup>
  )

  return (
    <div className="w-full max-w-4xl mx-auto border border-s-base2 dark:border-s-base02 poppy:border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="pl-2 text-sm text-s-base1 dark:text-s-base01 poppy:text-zinc-500 flex items-center">#{count}</div>
          <div className="px-2 text-sm text-s-base1 dark:text-s-base01 poppy:text-zinc-500 flex items-center">
            <AnimatePresence>
              {active && (
                <motion.div
                  role="status"
                  initial={{ width: 0, marginRight: 0 }}
                  exit={{ width: 0, marginRight: 0 }}
                  animate={{ width: 16, marginRight: 5 }}
                >
                  <svg
                    className="inline mr-2 w-3 h-3 text-transparent animate-spin fill-s-base1"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence exitBeforeEnter>
              {props.lastEvent?.statusMessage && (
                <motion.div
                  key={props.lastEvent.statusMessage}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                >
                  {props.lastEvent?.statusMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex items-center">
            <div className={item}>
              {/* <InformationCircleIcon className="w-4 h-4 text-s-base1 dark:text-s-base01 poppy:text-zinc-500" /> */}
              <div>$15 Fee</div>
            </div>
            <div className={item}>
              {/* <InformationCircleIcon className="w-4 h-4 text-s-base1 dark:text-s-base01 poppy:text-zinc-500" /> */}
              <div>~1m</div>
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
        <ArrowLongRightIcon className="w-12 h-12 text-s-base2 dark:text-s-base02 poppy:text-zinc-700" />

        {middle}
        <ArrowLongRightIcon className="w-12 h-12 text-s-base2 dark:text-s-base02 poppy:text-zinc-700" />

        <div className="px-2 py-1 basis-0">
          <WorkflowAssetView asset={props.step.outputAsset} status={outputAssetMessage} reverse />
        </div>
      </div>
    </div>
  )
}
