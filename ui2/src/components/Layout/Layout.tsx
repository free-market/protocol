import { AnimatePresence } from 'framer-motion'
import React from 'react'

import Logo from '../Logo'
import StepCatalog from '../StepCatalog'
import StepBuilder from '../StepBuilder'
import Workflow from '../Workflow'

import './super-shadow.css'
import { useCore } from '@component/CoreProvider'

export const Layout = (props: {
  stepCatalog?: React.ReactNode
  stepBuilder?: React.ReactNode
  workflow?: React.ReactNode
}): JSX.Element => {
  const {
    stepCatalog = <StepCatalog />,
    stepBuilder = <StepBuilder />,
    workflow = <Workflow />,
  } = props
  const core = useCore()

  return (
    <div className="sm:flex items-stretch max-h-full h-full overflow-hidden bg-zinc-900">
      <div className="w-14 shrink-0 box-content sm:h-screen overflow-hidden">
        <div
          className="p-3 border-b sm:border-b-0 border-zinc-800 select-none bg-repeat bg-[length:70px_70px] w-full sm:h-screen bg-[url('/fmp-logo-repeat.svg')] "
          style={{
            backgroundPosition: '20px -5px',
            boxShadow: '#18181b 0px 0px 30vh 0px inset',
          }}
        >
          <Logo className="stroke-zinc-200 w-8 h-8" />
        </div>
      </div>
      <div className="text-zinc-200 w-96 px-3 sm:h-screen sm:overflow-y-auto shrink grow-0 space-y-2">
        {stepCatalog}
      </div>
      <div className="sm:h-screen p-4 w-full grow">
        <div className="h-full p-2 rounded-xl bg-zinc-800 w-full sm:flex gap-2">
          <div className="h-full grow basis-0 max-w-sm rounded-xl relative super-shadow overflow-hidden">
            <div
              className="h-full p-2 rounded-xl bg-zinc-900 max-w-sm grow basis-0 space-y-5 overflow-y-auto relative"
              key={core.selectedActionGroup?.name}
            >
              <AnimatePresence mode="wait">{stepBuilder}</AnimatePresence>
            </div>
          </div>
          <div className="h-full shrink min-w-xs basis-0 grow overflow-y-auto">
            {workflow}
          </div>
        </div>
      </div>
    </div>
  )
}
