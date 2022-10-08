import React from 'react'

import { WorkflowContext } from '../WorkflowProvider'
import GenericSelector from '../GenericSelector'

export const ThemeSelector = (props: Record<string, unknown>): JSX.Element => {
  const { theme, setTheme } = React.useContext(WorkflowContext)

  const onChoice = (theme: string) => {
    setTheme(theme as 'light' | 'dark' | 'poppy')
  }

  return (
    <>
      <GenericSelector id="theme-selector" heading={'Theme:'} choiceName={theme} choices={[{name: 'light', label: 'Light'}, {name: 'dark', label: 'Dark'}, {name: 'poppy', label: 'Poppy'}]} onChoice={onChoice} oneline />
    </>
  )
}
