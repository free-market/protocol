import React from 'react'
import { AnimatePresence } from 'framer-motion'

import { WorkflowContext } from '../WorkflowProvider'

export const VisualizerLayout = (props: {
  editor?: React.ReactNode
  children: React.ReactNode
}): JSX.Element => {
  const {status} = React.useContext(WorkflowContext)

  return (
    <div className="flex flex-col space-y-5 max-w-4xl mx-auto">
      {props.editor}

      <AnimatePresence>
        {!['editing', 'preparing'].includes(status) && props.children}
      </AnimatePresence>
    </div>
  )
}
