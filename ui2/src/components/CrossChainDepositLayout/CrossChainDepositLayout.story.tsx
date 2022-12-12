import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { CrossChainDepositLayout as Component } from './CrossChainDepositLayout'
import ErrorDialog from '@component/ErrorDialog'

class ErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError(/* error: any */) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo)
  }

  handleClose = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
    }

    return (
      <>
        <ErrorDialog open={this.state.hasError} onClose={this.handleClose} />
        {this.props.children}
      </>
    )
  }
}

export default {
  parameters: {
    backgrounds: {
      default: 'light',
      values: [{ name: 'light', value: '#f4f4f5' }],
    },
  },
  title: 'Example/CrossChainDepositLayout',
  component: Component,
  decorators: [
    (Story) => (
      <ErrorBoundary>
        <Story />
      </ErrorBoundary>
    ),
  ],
} as ComponentMeta<typeof Component>

export const CrossChainDepositLayout: ComponentStory<typeof Component> = (
  props,
) => <Component {...props} />
CrossChainDepositLayout.args = {}
