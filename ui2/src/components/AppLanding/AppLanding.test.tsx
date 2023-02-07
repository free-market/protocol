import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import AppLanding from './'

describe('Component: AppLanding', () => {
  it('should render children', () => {
    const { asFragment } = render(<AppLanding />)

    expect(asFragment()).toMatchInlineSnapshot()
  })
})
