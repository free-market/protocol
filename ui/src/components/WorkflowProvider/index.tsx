import React from 'react'

export type WorkflowContextShape = {
  status: 'editing' | 'preparing' | 'prepared' | 'ready-to-execute'
  prepare: () => void | Promise<void>
}

export const WorkflowContext = React.createContext<WorkflowContextShape>({
  status: 'editing',
  prepare: () => {
    // do nothing
  },
})

export const WorkflowProvider = (props: {
  children: React.ReactNode
}): JSX.Element => {
  const [status, setStatus] =
    React.useState<WorkflowContextShape['status']>('editing')

  const prepare = async () => {
    setStatus('preparing')
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setStatus('prepared')
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setStatus('ready-to-execute')
  }

  return (
    <WorkflowContext.Provider value={{ status, prepare }}>
      {props.children}
    </WorkflowContext.Provider>
  )
}
