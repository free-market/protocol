import DepositFlow from '@component/DepositFlow'
import { DepostiFlowProps } from '@component/DepositFlow/DepositFlow'

export const ControlledDepositFlow = (props: DepostiFlowProps): JSX.Element => {
  return (
    <>
      <DepositFlow {...props} />
    </>
  )
}
