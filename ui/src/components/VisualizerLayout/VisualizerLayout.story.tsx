import { ComponentStory, ComponentMeta } from '@storybook/react'

import { WorkflowProvider } from '../WorkflowProvider'
import { VisualizerLayout as Component } from './VisualizerLayout'
import { ScriptEditor } from '../ScriptEditor/ScriptEditor.story'
// import { WorkflowStepView } from '../ActionView/WorkflowStepView.story'
import { buildWorkflow } from '../../utils'
import { WorkflowView } from './WorkflowView'

export default {
  title: 'Example/VisualizerLayout',
  component: Component,
  decorators: [
    (Story) => (
      <WorkflowProvider>
        <Story />
      </WorkflowProvider>
    ),
  ],
  parameters: {
    backgrounds: {
      default:
        window &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light',
      values: [
        { name: 'dark', value: '#002b36' },
        { name: 'light', value: '#fdf6e3' },
      ],
    },
  },
} as ComponentMeta<typeof Component>

export const VisualizerLayout: ComponentStory<typeof Component> = (args) => {
  return <div className='dark'><Component {...args} /></div>
}

const workflow = buildWorkflow()

VisualizerLayout.args = {
  editor: <ScriptEditor children={ScriptEditor.args?.children} snippet={ScriptEditor.args!.snippet!} />,
  children: <WorkflowView workflow={workflow} />,
}
