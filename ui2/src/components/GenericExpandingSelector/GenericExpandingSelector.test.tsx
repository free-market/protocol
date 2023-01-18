import { useDepositFlowState } from '@component/DepositFlowStateProvider/useDepositFlowState'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { useAnimationControls } from 'framer-motion'
import { useRef } from 'react'
import GenericExpandingSelector from './'

describe('Component: GenericExpandingSelector', () => {
  it('should render children', () => {
    const vm = useDepositFlowState()
    const { formEditingMode, tokenSearchValue, dispatch } = vm
    const chainSelectorButtonControls = useAnimationControls()

    const chainSelectorRef = useRef<HTMLButtonElement>(null)
    const chainSelectorContainerRef = useRef<HTMLDivElement>(null)
    const chainSearchRef = useRef<HTMLInputElement>(null)
    const chainSelectorResultsContainerRef = useRef<HTMLDivElement>(null)

    const { asFragment } = render(
      <GenericExpandingSelector
        label="CHAIN"
        name="chain"
        transition={{}}
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
      />,
    )

    expect(asFragment()).toMatchInlineSnapshot()
  })
})
