import { ComponentStory, ComponentMeta } from '@storybook/react'

import { DepositFlowStateProvider as Component } from './DepositFlowStateProvider'

export default {
  title: 'Example/DepositFlowStateProvider',
  component: Component,
} as ComponentMeta<typeof Component>

export const DepositFlowStateProvider: ComponentStory<
  typeof Component
> = () => <Component />
DepositFlowStateProvider.args = {}
