import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import NewLanding from './'

describe('Component: NewLanding', () => {
  it('should render children', () => {
    const { asFragment } = render(<NewLanding />)

    expect(asFragment()).toMatchInlineSnapshot()
  })
})
