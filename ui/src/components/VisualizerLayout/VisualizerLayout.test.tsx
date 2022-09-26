import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import VisualizerLayout from './'

describe('Component: VisualizerLayout', () => {
  it('should render children', () => {
    render(<VisualizerLayout>sentinel value</VisualizerLayout>)

    expect(screen.getByText('sentinel value')).toBeInTheDocument()
  })
})
