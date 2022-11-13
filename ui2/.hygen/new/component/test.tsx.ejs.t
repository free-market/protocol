---
to: src/components/<%= component_name %>/<%= component_name %>.test.tsx
---
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import <%= component_name %> from './'

describe('Component: <%= component_name %>', () => {
  it('should render children', () => {
    render(<<%= component_name %>>sentinel value</<%= component_name %>>)

    expect(screen.getByText('sentinel value')).toBeInTheDocument()
  })
})
