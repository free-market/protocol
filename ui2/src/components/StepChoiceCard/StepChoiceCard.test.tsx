import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import CoreProvider from '@component/CoreProvider'
import StepChoiceCard from './'

describe('Component: StepChoiceCard', () => {
  it('should render children', () => {
    const { asFragment } = render(
      <CoreProvider>
        <StepChoiceCard/>
      </CoreProvider>
    )

    expect(asFragment()).toMatchInlineSnapshot()
  })
})
