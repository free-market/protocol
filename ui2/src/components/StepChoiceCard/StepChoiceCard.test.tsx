import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import CoreProvider from '@component/CoreProvider'
import StepChoiceCard from './'
import { catalog } from 'config'

describe('Component: StepChoiceCard', () => {
  it('should render children', () => {
    const { asFragment } = render(
      <CoreProvider>
        <StepChoiceCard action={catalog.curve.actions[0]} />
      </CoreProvider>,
    )

    expect(asFragment()).toMatchInlineSnapshot()
  })
})
