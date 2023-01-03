import {
  initialState,
  useViewModel,
} from '@component/CrossChainDepositLayout/useViewModel'
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
  const vm = useViewModel(initialState)
  const { formEditingMode, tokenSearchValue, dispatch } = vm
  const chainSelectorButtonControls = useAnimationControls()
  const tokenSelectorButtonControls = useAnimationControls()

  const chainSelectorRef = useRef<HTMLButtonElement>(null)
  const tokenSelectorRef = useRef<HTMLButtonElement>(null)
  const tokenSelectorContainerRef = useRef<HTMLDivElement>(null)
  const tokenSearchRef = useRef<HTMLInputElement>(null)
  const chainSelectorContainerRef = useRef<HTMLDivElement>(null)
  const chainSearchRef = useRef<HTMLInputElement>(null)
  const chainSelectorResultsContainerRef = useRef<HTMLDivElement>(null)

  return (
    <Component
      {...{ formEditingMode, tokenSearchValue, dispatch }}
      refs={{
        chainSelector: chainSelectorRef,
        tokenSelector: tokenSelectorRef,
        tokenSelectorContainer: tokenSelectorContainerRef,
        tokenSearch: tokenSearchRef,
        chainSelectorContainer: chainSelectorContainerRef,
        chainSearch: chainSearchRef,
        chainSelectorResultsContainer: chainSelectorResultsContainerRef,
      }}
      controls={{
        chainSelectorButton: chainSelectorButtonControls,
        tokenSelectorButton: tokenSelectorButtonControls,
      }}
    />
  )
}

GenericExpandingSelector.args = {}
