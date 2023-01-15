import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import CoreProvider from '@component/CoreProvider'
import CrossChainJobCard from './'

describe('Component: CrossChainJobCard', () => {
  it('should render children', () => {
    const { asFragment } = render(
      <CoreProvider>
        <CrossChainJobCard />
      </CoreProvider>,
    )

    expect(asFragment()).toMatchInlineSnapshot()
  })
})
