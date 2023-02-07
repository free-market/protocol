import DepositFlowStateProvider from '@component/DepositFlowStateProvider'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { ControlledDepositFlow as Component } from './ControlledDepositFlow'
import { State } from '@component/DepositFlowStateProvider/types'
import SharedWagmiConfig from '@component/SharedWagmiConfig'

export default {
  title: 'Example/ControlledDepositFlow',
  component: Component,
  decorators: [
    (Story) => (
      <SharedWagmiConfig>
        <Story />
      </SharedWagmiConfig>
    ),
  ],

  parameters: {
    backgrounds: {
      default: 'light',
      values: [{ name: 'light', value: '#f4f4f5' }],
    },
  },

  argTypes: {
    step: { control: 'switch', defaultValue: 'closed' },
  },
} as ComponentMeta<typeof Component>

export const ControlledDepositFlow: ComponentStory<typeof Component> = (
  props,
) => (
  <DepositFlowStateProvider
    initialStep={(props as { initialStep?: State['flowStep'] }).initialStep}
  >
    <Component {...props} />
  </DepositFlowStateProvider>
)
ControlledDepositFlow.args = {}
