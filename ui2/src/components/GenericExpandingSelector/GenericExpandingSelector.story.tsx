import { useDepositFlowState } from '@component/DepositFlowStateProvider/useDepositFlowState'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { useAnimationControls } from 'framer-motion'
import { useRef } from 'react'

import { GenericExpandingSelector as Component } from './GenericExpandingSelector'

export default {
  title: 'Example/GenericExpandingSelector',
  component: Component,
} as ComponentMeta<typeof Component>

export const GenericExpandingSelector: ComponentStory<
  typeof Component
> = () => {
  const vm = useDepositFlowState()
  const { formEditingMode, tokenSearchValue, dispatch } = vm
  const chainSelectorButtonControls = useAnimationControls()

  const chainSelectorRef = useRef<HTMLButtonElement>(null)
  const chainSelectorContainerRef = useRef<HTMLDivElement>(null)
  const chainSearchRef = useRef<HTMLInputElement>(null)
  const chainSelectorResultsContainerRef = useRef<HTMLDivElement>(null)

  return (
    <Component
      transition={{}}
      label="CHAIN"
      name="chain"
      {...{ formEditingMode, searchValue: tokenSearchValue, dispatch }}
      refs={{
        clickableArea: chainSelectorRef,
        container: chainSelectorContainerRef,
        input: chainSearchRef,
        resultsContainer: chainSelectorResultsContainerRef,
      }}
      controls={{
        selector: chainSelectorButtonControls,
      }}
    />
  )
}

GenericExpandingSelector.args = {}
