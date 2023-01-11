import { useContext } from 'react'
import { DepositFlowStateContext } from './DepositFlowStateProvider'
import { ViewModel } from './types'

export const useDepositFlowState = (): ViewModel => {
  return useContext(DepositFlowStateContext)
}
