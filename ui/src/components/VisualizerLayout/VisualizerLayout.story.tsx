import { ComponentStory, ComponentMeta } from '@storybook/react'

import { WorkflowProvider } from '../WorkflowProvider'
import { VisualizerLayout as Component } from './VisualizerLayout'
import { ScriptEditor } from '../ScriptEditor/ScriptEditor.story'
import { ActionView } from '../ActionView/ActionView.story'
import { buildWorkflow } from '../../utils'

export default {
  title: 'Example/VisualizerLayout',
  component: Component,
  decorators: [
    (Story) => (
      <WorkflowProvider>
        <Story />
      </WorkflowProvider>
    )
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

export const VisualizerLayout: ComponentStory<typeof Component> = (args) => (
  <Component {...args} />
)

const workflow = buildWorkflow()

VisualizerLayout.args = {
  editor: (
    <ScriptEditor
      children={ScriptEditor.args?.children}
      snippet={ScriptEditor.args!.snippet!}
    />
  ),
  children: (
    <>
      {workflow.steps.map((it, index) => (
        <ActionView {...ActionView.args} step={it} stepIndex={index} />
      ))}
    </>
  ),
}
