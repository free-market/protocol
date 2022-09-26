import React from 'react'

export const VisualizerLayout = (props: {
  editor?: React.ReactNode
  children: React.ReactNode
}): JSX.Element => {
  return (
    <div className="flex-col space-y-5">
      {props.editor}
      {props.children}
    </div>
  )
}
