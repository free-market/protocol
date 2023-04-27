import * as React from 'react'
import { AssetReference as AssetRef } from '@freemarket/core'
import { ReactNode } from 'react'

interface Props {
  assetRef: AssetRef
}

export default function AssetReferenceView({ assetRef }: Props): JSX.Element {
  let s: string
  if (typeof assetRef === 'string') {
    return <span>{assetRef}</span>
  } else {
    if (assetRef.type === 'native') {
      return <span>Native</span>
    }
    return <span>{assetRef.symbol}</span>
  }
}
