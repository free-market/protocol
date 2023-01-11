import DepositFlow from '@component/DepositFlow'
import { DepostiFlowProps } from '@component/DepositFlow/DepositFlow'
import { useAccount, useConnect } from 'wagmi'

export const ControlledDepositFlow = (
  props: Omit<DepostiFlowProps, 'walletState'>,
): JSX.Element => {
  const { isConnected: connected } = useAccount()
  const { connect, connectors } = useConnect()

  const handleClick = (): void => {
    if (!connected) {
      connect({ connector: connectors[0] })
    }
  }

  return (
    <>
      <DepositFlow
        {...props}
        walletState={connected ? 'insufficient-balance' : 'unconnected'}
        onClick={handleClick}
      />
    </>
  )
}
