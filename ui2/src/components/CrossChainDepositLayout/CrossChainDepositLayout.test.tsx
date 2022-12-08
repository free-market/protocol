import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import CrossChainDepositLayout from './'

describe('Component: CrossChainDepositLayout', () => {
  it('should render children', () => {
    const { asFragment } = render(<CrossChainDepositLayout />)

    expect(asFragment()).toMatchInlineSnapshot()
  })
})
