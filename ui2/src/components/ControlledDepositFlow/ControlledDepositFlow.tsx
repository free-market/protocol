import DepositFlow from '@component/DepositFlow'
import {
  defaultNetworkChoices,
  DepositFlowProps,
} from '@component/DepositFlow/DepositFlow'
import { useDepositFlowState } from '@component/DepositFlowStateProvider/useDepositFlowState'
import {
  useAccount,
  useBalance,
  useConnect,
  useNetwork,
  useSwitchNetwork,
} from 'wagmi'

export const ControlledDepositFlow = (
  props: Omit<DepositFlowProps, 'walletState' | 'networkChoices'> & {
    includeDeveloperNetworks?: boolean
  },
): JSX.Element => {
  const { chain } = useNetwork()
  const { address, isConnected: connected } = useAccount()
  const { connect, connectors } = useConnect()
  const vm = useDepositFlowState()
  const { switchNetwork } = useSwitchNetwork()

  const handleClick = async (): Promise<void> => {
    if (!connected) {
      connect({ connector: connectors[0] })
    } else if (vm.flowStep === 'open') {
      if (networkMatches) {
        if (walletState === 'ready' && vm.amount != null) {
          vm.dispatch({ name: 'WorkflowSubmissionStarted' })
          await delay(2000)
          vm.dispatch({ name: 'WorkflowSubmissionFinished' })
          await delay(3000)
          vm.dispatch({ name: 'WorkflowStarted' })
        }
      } else if (vm.selectedChain.address != null) {
        switchNetwork?.(Number(vm.selectedChain.address))
      }
    }
  }

  const result = useBalance({
    chainId: Number(vm.selectedChain.address),
    address,
    token: (vm.selectedToken.address === '0x0'
      ? undefined
      : vm.selectedToken.address) as `0x${string}`,
  })

  const { data: balanceData } = result

  let balanceState: DepositFlowProps['balanceState'] = 'hidden'
  let balance = ''

  const networkMatches = Number(vm.selectedChain.address) === chain?.id

  // Ethereum mainnet, Ethereum Goerli, and Avalanche Fuji
  if (
    [1, 5, 43113].includes(vm.selectedChain.address as number) &&
    connected &&
    networkMatches
  ) {
    balanceState = 'loading'

    if (balanceData) {
      balanceState = 'displayed'
      balance = balanceData.formatted.replace(
        /\.(\d{7}).*$/,
        (_, lastSeven) => `.${lastSeven}`,
      )
    }
  }

  const { includeDeveloperNetworks = false, ...rest } = props

  const walletState = connected
    ? networkMatches
      ? balance === '0.00'
        ? 'insufficient-balance'
        : 'ready'
      : 'network-mismatch'
    : 'unconnected'

  return (
    <>
      <DepositFlow
        {...rest}
        balanceState={balanceState}
        balance={balance}
        walletState={walletState}
        onClick={handleClick}
        networkChoices={
          includeDeveloperNetworks
            ? [
                {
                  address: 5,
                  symbol: 'Ethereum Goerli',
                  title: 'Ethereum Goerli',
                  icon: { url: 'https://app.aave.com/icons/tokens/eth.svg' },
                },
                {
                  // rpc url: https://api.avax-test.network/ext/bc/C/rpc
                  address: 43113,
                  symbol: 'Avalanche Fuji',
                  title: 'Avalanche Fuji C-Chain',
                  icon: {
                    url: 'https://app.aave.com/icons/networks/avalanche.svg',
                  },
                },
                ...defaultNetworkChoices,
              ]
            : undefined
        }
      />
    </>
  )
}

function delay(time: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, time))
}
