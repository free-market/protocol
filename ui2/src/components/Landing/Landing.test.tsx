import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import Landing from './'

describe('Component: Landing', () => {
  it('should render children', () => {
    const { asFragment } = render(<Landing />)

    expect(asFragment()).toMatchInlineSnapshot()
  })
})
