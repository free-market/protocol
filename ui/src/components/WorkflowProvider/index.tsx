import React from 'react'

const initialTheme = 'poppy'

type WorkflowTheme = 'light' | 'dark' | 'poppy'

export type WorkflowContextShape = {
  status: 'editing' | 'preparing' | 'prepared' | 'ready-to-execute'
  prepare: () => void | Promise<void>
  theme: WorkflowTheme
  setTheme: (theme: WorkflowTheme) => void
  chosenPresetName: string
  choosePreset: (presetName: string, text: string, triggerType: string) => void
}

export const WorkflowContext = React.createContext<WorkflowContextShape>({
  status: 'editing',
  prepare: () => {
    // do nothing
  },
  theme: 'poppy',
  setTheme: () => {
    // do nothing
  },
  chosenPresetName: 'basic',
  choosePreset: () => {
    // do nothing
  },
})

export const WorkflowProvider = (props: {
  onWorkflowTextChange?: (text: string) => void
  onWorkflowTriggerChanged?: (text: string) => void
  children: React.ReactNode
}): JSX.Element => {
  const [status, setStatus] = React.useState<WorkflowContextShape['status']>('editing')

  const [theme, setTheme] = React.useState<'light' | 'dark' | 'poppy'>(initialTheme)

  const [chosenPresetName, setChosenPresetName] = React.useState<string>('basic')

  const prepare = async () => {
    setStatus('preparing')
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setStatus('prepared')
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setStatus('ready-to-execute')
  }

  const className = theme === 'light' ? '' : theme === 'dark' ? 'dark' : 'fmp-poppy'

  const choosePreset = (presetName: string, text: string, triggerType: string) => {
    setChosenPresetName(presetName)
    if (props.onWorkflowTextChange) {
      props.onWorkflowTextChange(text)
    }
    if (props.onWorkflowTriggerChanged) {
      props.onWorkflowTriggerChanged(triggerType)
    }
  }

  return (
    <WorkflowContext.Provider value={{ status, prepare, theme, setTheme, choosePreset, chosenPresetName }}>
      <div className={className}>
        <div className="bg-s-base3 dark:bg-s-base03 poppy:bg-zinc-900 space-y-5">{props.children}</div>
      </div>
    </WorkflowContext.Provider>
  )
}
