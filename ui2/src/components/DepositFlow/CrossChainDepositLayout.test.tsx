import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import DepositFlow from './'

describe('Component: CrossChainDepositLayout', () => {
  it('should render children', () => {
    const { asFragment } = render(<DepositFlow />)

    expect(asFragment()).toMatchInlineSnapshot()
  })
})
