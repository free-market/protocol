import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { DepositFlow as Component, DepostiFlowProps } from './DepositFlow'
import ErrorDialog from '@component/ErrorDialog'
import DepositFlowStateProvider from '@component/DepositFlowStateProvider'

class ErrorBoundaryFoo extends React.Component {
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
        {!this.state.hasError && this.props.children}
      </>
    )
  }
}

export default {
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
      values: [{ name: 'light', value: '#f4f4f5' }],
    },
  },
  title: 'Example/DepositFlow',
  component: Component,
  argTypes: {
    loadingAllowed: { control: 'boolean' },
    initiallyOpen: { control: 'boolean' },
  },
} as ComponentMeta<typeof Component>

export const DepositFlow: ComponentStory<typeof Component> = (props) => {
  const { loadingAllowed, initiallyOpen, ...rest } =
    props as DepostiFlowProps & {
      loadingAllowed: boolean
      initiallyOpen: boolean
    }

  return (
    <ErrorBoundaryFoo>
      <DepositFlowStateProvider
        initiallyLoadingAllowed={loadingAllowed}
        initiallyOpen={initiallyOpen}
      >
        <Component {...rest} />
      </DepositFlowStateProvider>
    </ErrorBoundaryFoo>
  )
}

DepositFlow.args = {}
