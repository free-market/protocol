import { ComponentStory, ComponentMeta } from '@storybook/react'

import { VisualizerLayout as Component } from './VisualizerLayout'
import { ScriptEditor } from '../ScriptEditor/ScriptEditor.story'
// import { WorkflowStepView } from '../ActionView/WorkflowStepView.story'
import { buildWorkflow } from '../../utils'
import { WorkflowView } from './WorkflowView'

export const story = {
  title: 'Example/VisualizerLayout',
  component: Component,
  parameters: {
    backgrounds: {
      default: 'dark',
        // window && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      values: [
        { name: 'dark', value: '#101010' },
        { name: 'light', value: '#fdf6e3' },
      ],
    },
  },
}

export default story as ComponentMeta<typeof Component>

export const VisualizerLayout: ComponentStory<typeof Component> = (args) => {
  return <div className='dark'><Component {...args} /></div>
}

const workflow = buildWorkflow()

VisualizerLayout.args = {
  editor: <ScriptEditor children={ScriptEditor.args?.children} snippet={ScriptEditor.args!.snippet!} />,
  children: <WorkflowView workflow={workflow} />,
}
