import React from 'react'

export const VisualizerLayout = (props: {
  editor?: React.ReactNode
  children: React.ReactNode
}): JSX.Element => {
  return (
    <div className="flex flex-col space-y-5 max-w-4xl mx-auto">
      {props.editor}
      {props.children}
    </div>
  )
}
