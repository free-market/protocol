import DepositFlow from '@component/DepositFlow'
import { DepositFlowProps } from '@component/DepositFlow/DepositFlow'
import { useDepositFlowState } from '@component/DepositFlowStateProvider/useDepositFlowState'
import { useAccount, useConnect, useNetwork } from 'wagmi'

export const ControlledDepositFlow = (
  props: Omit<DepositFlowProps, 'walletState'>,
): JSX.Element => {
  const { chain } = useNetwork()
  const { isConnected: connected } = useAccount()
  const { connect, connectors } = useConnect()
  const vm = useDepositFlowState()

  const handleClick = (): void => {
    if (!connected) {
      connect({ connector: connectors[0] })
    }
  }

  return (
    <>
      <DepositFlow
        {...props}
        walletState={
          connected
            ? Number(vm.selectedChain.address) === chain?.id
              ? 'insufficient-balance'
              : 'network-mismatch'
            : 'unconnected'
        }
        onClick={handleClick}
      />
    </>
  )
}
