import React, { useMemo, useState } from 'react'
import { WorkflowStepView } from '../ActionView/WorkflowStepView.story'
import { motion, AnimatePresence } from 'framer-motion'
import cx from 'classnames'
import { InformationCircleIcon, ChevronDownIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { Asset, MoneyAmount, WorkflowStep, BLOCKCHAIN_INFO, Workflow, WorkflowEvent, WorkflowEventType } from '@fmp/sdk'
import { executeWorkflow, formatMoney } from 'utils'

export const WorkflowView = (props: { workflow: Workflow; children?: React.ReactNode }): JSX.Element => {
  const [lastEvent, setLastEvent] = useState<WorkflowEvent | undefined>(undefined)
  const [lastEvents, setLastEvents] = useState<Map<WorkflowStep, WorkflowEvent>>(new Map())

  const events = lastEvents

  // const completedStepsState = useState<WorkflowStep[]>([])
  // let completedSteps = completedStepsState[0]
  // const setCompletedSteps = completedStepsState[1]

  function myWorkflowEventHandler(event: WorkflowEvent) {
    console.log('received event', event)
    setLastEvent(event)
    if (event.type === WorkflowEventType.Completed) {
      // completedSteps = completedSteps.concat(event.steps)
      // setCompletedSteps(completedSteps)
    }
    event.steps.forEach((it) => events.set(it, event))
    setLastEvents(events)

    if (event.type === 'Completed') {
      console.log(
        `event: ${event.type} ${event.statusMessage} gasCost=${event.result!.gasCost},  ${
          event.steps[0].outputAsset.symbol
        } ${formatMoney(event.result!.outputAmount, event.steps[0].outputAsset.info.decimals)}`,
      )
    } else if (event.type === 'Starting') {
      console.log(`event: ${event.type} ${event.steps[0].info.name}`)
    } else {
      console.log(`event: ${event.type} ${event.statusMessage}`)
    }
  }

  return (
    <>
      <div className="flex">
        <div
          className="mt-8 bg-s-base2 dark:bg-s-base02  px-5 py-3 flex justify-center items-center cursor-pointer rounded-2xl font-bold text-lg text-s-base1 dark:text-s-base01 hover:bg-s-base2 dark:hover:bg-s-base02 active:bg-s-base2/50 dark:active:bg-s-base02/50 active:text-s-base1/50 dark:active:text-s-base01/50 select-none"
          onClick={() => {
            events.clear()
            setLastEvents(events)
            executeWorkflow(props.workflow, myWorkflowEventHandler)
          }}
        >
          Execute Workflow
        </div>
      </div>
      {props.workflow.steps.map((step, i) => {
        const event = events.get(step)
        console.log('a step', step)
        console.log('event', event)
        return (
          <WorkflowStepView
            key={`workflowStep-${i}`}
            {...WorkflowStepView.args}
            step={step}
            // completed={completedSteps.includes(it)}
            lastEvent={event}
          />
        )
      })}
    </>
  )
}
