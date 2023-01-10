import DepositFlow from '@component/DepositFlow'
import { DepostiFlowProps } from '@component/DepositFlow/DepositFlow'
import { useAccount } from 'wagmi'

export const ControlledDepositFlow = (
  props: Omit<DepostiFlowProps, 'walletState'>,
): JSX.Element => {
  const { isConnected: connected } = useAccount()

  return (
    <>
      <DepositFlow
        {...props}
        walletState={connected ? 'insufficient-balance' : 'unconnected'}
      />
    </>
  )
}
