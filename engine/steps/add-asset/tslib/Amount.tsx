import * as React from 'react'
import type { Amount } from '@freemarket/core'

interface Props {
  amount: Amount
}

export default function Amount({ amount }: Props): JSX.Element {
  return <span>{amount.toString()}</span>
}
