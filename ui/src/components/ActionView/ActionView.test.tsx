import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ActionView from './'

describe('Component: ActionView', () => {
  it('should render children', () => {
    render(<ActionView>sentinel value</ActionView>)

    expect(screen.getByText('sentinel value')).toBeInTheDocument()
  })
})
