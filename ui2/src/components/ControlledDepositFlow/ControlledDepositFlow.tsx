import DepositFlow from '@component/DepositFlow'
import { DepositFlowProps } from '@component/DepositFlow/DepositFlow'
import { useDepositFlowState } from '@component/DepositFlowStateProvider/useDepositFlowState'
import { useAccount, useBalance, useConnect, useNetwork } from 'wagmi'

export const ControlledDepositFlow = (
  props: Omit<DepositFlowProps, 'walletState'>,
): JSX.Element => {
  const { chain } = useNetwork()
  const { address, isConnected: connected } = useAccount()
  const { connect, connectors } = useConnect()
  const vm = useDepositFlowState()

  const handleClick = (): void => {
    if (!connected) {
      connect({ connector: connectors[0] })
    }
  }

  const nativeAssetBalance = useBalance({
    chainId: Number(vm.selectedChain.address),
    address,
  })

  const tokenBalance = useBalance(
    vm.selectedToken.address !== '0x0'
      ? {
          address,
          token: vm.selectedToken.address as `0x${string}`,
        }
      : {},
  )

  let balanceState: DepositFlowProps['balanceState'] = 'hidden'
  let balance = ''

  // Ethereum mainnet
  if (vm.selectedChain.address === 1) {
    balanceState = 'loading'

    // Ether
    if (vm.selectedToken.address === '0x0') {
      if (nativeAssetBalance.data) {
        balanceState = 'displayed'
        balance = nativeAssetBalance.data.formatted
      }
    } else {
      if (tokenBalance.data) {
        balanceState = 'displayed'
        balance = tokenBalance.data.formatted
      }
    }
  }

  // Ethereum Goerli
  if (vm.selectedChain.address === 5) {
    balanceState = 'loading'

    // Ether
    if (vm.selectedToken.address === '0x0') {
      if (nativeAssetBalance.data) {
        balanceState = 'displayed'
        balance = nativeAssetBalance.data.formatted
      }
    } else {
      if (tokenBalance.data) {
        balanceState = 'displayed'
        balance = tokenBalance.data.formatted
      }
    }
  }

  return (
    <>
      <DepositFlow
        {...props}
        balanceState={balanceState}
        balance={balance}
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
