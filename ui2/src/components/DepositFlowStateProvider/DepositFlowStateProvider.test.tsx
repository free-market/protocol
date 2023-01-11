import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import DepositFlowStateProvider from './'

describe('Component: DepositFlowStateProvider', () => {
  it('should render children', () => {
    const { asFragment } = render(<DepositFlowStateProvider />)

    expect(asFragment()).toMatchInlineSnapshot()
  })
})
