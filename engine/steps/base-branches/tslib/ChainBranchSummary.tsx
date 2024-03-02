import * as React from 'react'
import type { SummaryPropsBase } from '@freemarket/step-sdk'
import type { ChainBranch } from './model'
import { capitalize } from '@freemarket/core'

type Props = SummaryPropsBase<ChainBranch>

export default function ChainBranchSummary({ labelColor, valueColor, step }: Props): JSX.Element {
  return (
    <>
      <span style={{ color: labelColor }}>Current chain is:&nbsp;</span>
      <span style={{ color: valueColor }}>{capitalize(step.currentChain)}</span>
    </>
  )
}
