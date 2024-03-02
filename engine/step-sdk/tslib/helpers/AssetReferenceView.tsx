import * as React from 'react'
import type { AssetReference as AssetRef } from '@freemarket/core'

interface Props {
  assetRef: AssetRef
}

export default function AssetReferenceView({ assetRef }: Props): JSX.Element {
  if (typeof assetRef === 'string') {
    return <span>{assetRef}</span>
  } else {
    if (assetRef.type === 'native') {
      return <span>Native</span>
    }
    return <span>{assetRef.symbol}</span>
  }
}
