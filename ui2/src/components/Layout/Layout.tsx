import { AnimatePresence } from 'framer-motion'
import React from 'react'

import Logo from '../Logo'
import StepCatalog from '../StepCatalog'
import StepBuilder from '../StepBuilder'
import Workflow from '../Workflow'

export const Layout = (props: {
  stepCatalog?: React.ReactNode
  stepBuilder?: React.ReactNode
  workflow?: React.ReactNode
}): JSX.Element => {
  const { stepCatalog = <StepCatalog />, stepBuilder = <StepBuilder />, workflow = <Workflow /> } = props

  return (
    <div className="sm:flex items-stretch max-h-full h-full overflow-hidden">
      <div className="p-3 border-b sm:border-b-0 sm:border-r border-zinc-800 select-none basis-0 grow-0">
        <Logo className="stroke-zinc-200 w-8 h-8" />
      </div>
      <div className="text-zinc-200 w-96 px-3 sm:h-screen sm:overflow-y-auto shrink grow-0 space-y-2">{stepCatalog}</div>
      <div className="sm:h-screen p-4 w-full grow">
        <div className="h-full p-2 rounded-xl bg-zinc-800 w-full sm:flex">
          <div className="h-full p-2 rounded-xl bg-zinc-900 max-w-sm grow basis-0 space-y-5 overflow-y-auto relative">
            <AnimatePresence mode="wait">{stepBuilder}</AnimatePresence>
          </div>
          <div className="h-full shrink min-w-xs p-2 basis-0 grow">{workflow}</div>
        </div>
      </div>
    </div>
  )
}
