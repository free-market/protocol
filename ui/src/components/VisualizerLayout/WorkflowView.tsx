import React, { useMemo, useState } from 'react'
import { WorkflowStepView } from '../StepView/WorkflowStepView'
import WorkflowStepCard from '../WorkflowStepCard'
import { motion, AnimatePresence } from 'framer-motion'
import cx from 'classnames'
import { InformationCircleIcon, ChevronDownIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { Asset, MoneyAmount, WorkflowStep, BLOCKCHAIN_INFO, Workflow, WorkflowEvent, WorkflowEventType } from '@fmp/sdk'
import { executeWorkflow } from 'utils'

type WorkflowCompletedCallback = () => void

interface Props {
  legacyStepView?: boolean
  workflow: Workflow
  onWorkflowCompleted?: WorkflowCompletedCallback
  run?: boolean
}

interface State {
  lastEvents: Map<WorkflowStep, WorkflowEvent>
  isRunning: boolean
}

export class WorkflowView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      lastEvents: new Map<WorkflowStep, WorkflowEvent>(),
      isRunning: false,
    }
  }

  // const [lastEvent, setLastEvent] = useState<WorkflowEvent | undefined>(undefined)
  // const [lastEvents, setLastEvents] = useState<Map<WorkflowStep, WorkflowEvent>>(new Map())

  // const events = lastEvents

  // const completedStepsState = useState<WorkflowStep[]>([])
  // let completedSteps = completedStepsState[0]
  // const setCompletedSteps = completedStepsState[1]

  myWorkflowEventHandler = (event: WorkflowEvent) => {
    console.log('received event', event, this.state.lastEvents)
    // TODO for on-chain workflows were event.steps.length>1, we need to see max-index being completed
    // this.props.workflow.steps.findIndex(event.steps[0])
    const newMap = new Map(this.state.lastEvents)
    event.steps.forEach((it) => newMap.set(it, event))
    this.setState({
      ...this.state,
      lastEvents: newMap,
    })
    // TODO really need workflow-complete event type
    const finalStep = this.props.workflow.steps[this.props.workflow.steps.length - 1]
    if (event.type === WorkflowEventType.Completed && event.steps.includes(finalStep)) {
      if (this.props.onWorkflowCompleted) {
        this.props.onWorkflowCompleted()
        this.setState({
          ...this.state,
          isRunning: false,
        })
      }
    }
  }

  componentDidUpdate(_prevProps: Readonly<Props>, _prevState: Readonly<State>, _snapshot?: any): void {
    if (this.props.run && !this.state.isRunning) {
      this.setState({
        ...this.state,
        lastEvents: new Map(),
        isRunning: true,
      })
      executeWorkflow(this.props.workflow, this.myWorkflowEventHandler)
    }
  }

  render() {
    const { legacyStepView = false } = this.props

    if (legacyStepView) {
    return (
      <div>
        {this.props.workflow.steps.map((step, i) => {
          const event = this.state.lastEvents.get(step)
          // console.log('a step', step)
          console.log('steps event ' + step.stepId, event)
          return (
            <WorkflowStepView
              key={`workflowStep-${i}`}
              step={step}
              // completed={completedSteps.includes(it)}
              lastEvent={event}
            />
          )
        })}
      </div>
    )
    }

    return (
      <div>
        {this.props.workflow.steps.map((step, i) => {
          const event = this.state.lastEvents.get(step)
          // console.log('a step', step)
          console.log('steps event ' + step.stepId, event)
          return (
            <WorkflowStepCard
              key={`workflowStep-${i}`}
              step={step}
              // completed={completedSteps.includes(it)}
              lastEvent={event}
            />
          )
        })}
      </div>
    )
  }
}
