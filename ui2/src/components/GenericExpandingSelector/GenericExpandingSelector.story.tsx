import {
  initialState,
  useViewModel,
} from '@component/CrossChainDepositLayout/useViewModel'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { GenericExpandingSelector as Component } from './GenericExpandingSelector'

export default {
  title: 'Example/GenericExpandingSelector',
  component: Component,
} as ComponentMeta<typeof Component>

export const GenericExpandingSelector: ComponentStory<
  typeof Component
> = () => {
  const vm = useViewModel(initialState)
  const { formEditingMode, tokenSearchValue, dispatch } = vm
  return <Component {...{ formEditingMode, tokenSearchValue, dispatch }} />
}

GenericExpandingSelector.args = {}
