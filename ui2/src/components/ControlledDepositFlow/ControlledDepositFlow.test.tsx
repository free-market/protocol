import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import ControlledDepositFlow from './'

describe('Component: ControlledDepositFlow', () => {
  it('should render children', () => {
    const { asFragment } = render(<ControlledDepositFlow />)

    expect(asFragment()).toMatchInlineSnapshot()
  })
})
