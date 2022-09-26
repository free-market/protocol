import { ComponentStory, ComponentMeta } from '@storybook/react'

import { VisualizerLayout as Component } from './VisualizerLayout'
import { ScriptEditor } from '../ScriptEditor/ScriptEditor.story'
import { ActionView } from '../ActionView/ActionView.story'

export const story = {
  title: 'Example/VisualizerLayout',
  component: Component,
}

export default story as ComponentMeta<typeof Component>

export const VisualizerLayout: ComponentStory<typeof Component> = (args) => (
  <Component {...args} />
)

VisualizerLayout.args = {
  editor: <ScriptEditor {...ScriptEditor.args} />,
  children: (
    <>
      <ActionView {...ActionView.args} />
      <ActionView {...ActionView.args} />
      <ActionView {...ActionView.args} />
    </>
  ),
}
