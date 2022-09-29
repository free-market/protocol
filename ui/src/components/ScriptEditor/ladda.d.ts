import React from 'react'

const LaddaButton: (props: {
  loading?: boolean
  progress?: number
  onClick?: () => void | Promise<void>
  size?: string
  style?: string
  spinnerSize?: number
  spinnerColor?: string
  spinnerLines?: number
  className?: string
  children?: React.ReactNode
}) => JSX.Element

export default LaddaButton

export const S: string
export const XS: string
export const L: string
export const XL: string
export const CONTRACT: string
export const CONTRACT_OVERLAY: string
export const EXPAND_LEFT: string
export const EXPAND_RIGHT: string
export const EXPAND_UP: string
export const EXPAND_DOWN: string
export const SLIDE_LEFT: string
export const SLIDE_RIGHT: string
export const SLIDE_UP: string
export const SLIDE_DOWN: string
export const ZOOM_IN: string
export const ZOOM_OUT: string
