import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import CoreProvider from '@component/CoreProvider'
import StepChoiceEditor from './'

describe('Component: StepChoiceEditor', () => {
  it('should render children', () => {
    const { asFragment } = render(
      <CoreProvider>
        <StepChoiceEditor />
      </CoreProvider>,
    )

    expect(asFragment()).toMatchInlineSnapshot()
  })
})
