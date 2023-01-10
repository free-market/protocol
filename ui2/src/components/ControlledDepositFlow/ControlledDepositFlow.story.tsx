import { ComponentStory, ComponentMeta } from '@storybook/react'

import { ControlledDepositFlow as Component } from './ControlledDepositFlow'

export default {
  title: 'Example/ControlledDepositFlow',
  component: Component,
} as ComponentMeta<typeof Component>

export const ControlledDepositFlow: ComponentStory<typeof Component> = () => (
  <Component />
)
ControlledDepositFlow.args = {}
