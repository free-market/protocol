import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Layout from './'

describe('Component: Layout', () => {
  it('should render children', () => {
    render(<Layout stepBuilder={'sentinel value'} />)

    expect(screen.getByText('sentinel value')).toBeInTheDocument()
  })
})
