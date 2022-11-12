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
  const { stepCatalog = <StepCatalog/>, stepBuilder = <StepBuilder/>, workflow = <Workflow/> } = props

  return (
    <div className="sm:flex items-stretch max-h-full h-full overflow-hidden">
      <div className="p-3 border-r border-zinc-800">
        <Logo className="stroke-zinc-200 w-10 h-10"/>
      </div>
      <div className="text-zinc-200 max-w-xs px-3 sm:h-screen sm:overflow-y-auto">
        {stepCatalog}
      </div>
      <div className="sm:h-screen p-4 w-full">
        <div className="h-full p-2 rounded-xl bg-zinc-800 w-full sm:flex">
          <div className="h-full p-2 rounded-xl bg-zinc-900 max-w-sm grow basis-0">
            {stepBuilder}
          </div>
          <div className="h-full shrink min-w-xs p-2 basis-0 grow">
            {workflow}
          </div>
        </div>
      </div>
    </div>
  )
}
