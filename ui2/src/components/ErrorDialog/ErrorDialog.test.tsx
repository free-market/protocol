import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import ErrorDialog from './'

describe('Component: ErrorDialog', () => {
  it('should render children', () => {
    const { asFragment } = render(<ErrorDialog />)

    expect(asFragment()).toMatchInlineSnapshot()
  })
})
