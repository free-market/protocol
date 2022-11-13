import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import CoreProvider from '@component/CoreProvider'
import StepChoiceEditorCard from './'

describe('Component: StepChoiceEditorCard', () => {
  it('should render children', () => {
    const { asFragment } = render(
      <CoreProvider>
        <StepChoiceEditorCard />
      </CoreProvider>,
    )

    expect(asFragment()).toMatchInlineSnapshot()
  })
})
