import {
  initialState,
  useViewModel,
} from '@component/CrossChainDepositLayout/useViewModel'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { useAnimationControls } from 'framer-motion'
import { useRef } from 'react'
import GenericExpandingSelector from './'

describe('Component: GenericExpandingSelector', () => {
  it('should render children', () => {
    const vm = useViewModel(initialState)
    const { formEditingMode, tokenSearchValue, dispatch } = vm
    const chainSelectorButtonControls = useAnimationControls()
    const tokenSelectorButtonControls = useAnimationControls()

    const chainSelectorRef = useRef<HTMLButtonElement>(null)
    const tokenSelectorRef = useRef<HTMLButtonElement>(null)
    const tokenSearchRef = useRef<HTMLInputElement>(null)
    const chainSelectorContainerRef = useRef<HTMLDivElement>(null)
    const chainSearchRef = useRef<HTMLInputElement>(null)
    const chainSelectorResultsContainerRef = useRef<HTMLDivElement>(null)

    const { asFragment } = render(
      <GenericExpandingSelector
        {...{ formEditingMode, tokenSearchValue, dispatch }}
        refs={{
          clickableArea: chainSelectorRef,
          nextClickableArea: tokenSelectorRef,
          container: chainSelectorContainerRef,
          input: chainSearchRef,
          resultsContainer: chainSelectorResultsContainerRef,
        }}
        controls={{
          selector: chainSelectorButtonControls,
        }}
        nextSelector={{
          refs: {
            clickableArea: tokenSelectorRef,
            input: tokenSearchRef,
          },
          controls: tokenSelectorButtonControls,
        }}
      />,
    )

    expect(asFragment()).toMatchInlineSnapshot()
  })
})
