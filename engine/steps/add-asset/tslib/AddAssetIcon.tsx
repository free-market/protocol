import type { IconProps } from '@freemarket/step-sdk'
import * as React from 'react'
import type { SVGProps } from 'react'
const AddAssetIcon = (props: SVGProps<SVGSVGElement> & IconProps) => {
  const { dark, ...rest } = props
  const plusColor = dark ? '#090' : '#0f0'
  return (
    <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" width="24px" height="24px" viewBox="0 0 512 512" {...rest}>
      <path
        style={{ fill: 'currentColor' }}
        d="M336 111.797c8.844 0 16 7.156 16 16s-7.156 16-16 16H176c-8.844 0-16-7.156-16-16s7.156-16 16-16h160zm9.25 48H166.734C87.469 217.609 32 340.141 32 417.953c0 104.656 100.281 93.5 224 93.5s224 11.156 224-93.5c0-77.812-55.469-200.344-134.75-258.156zm-178.516-64H345.25S416 34.078 384 7.078s-103 30-128 28c-25 2-96-55-128-28s38.734 88.719 38.734 88.719z"
      />
      <path
        d="M233.199 215.158h43.17v240.601h-43.17z"
        style={{
          fill: plusColor,
          fillOpacity: 1,
          stroke: 'none',
          strokeWidth: 5.42941809,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeMiterlimit: 4,
          strokeDasharray: 'none',
          strokeDashoffset: 0,
          strokeOpacity: 0.31372549,
          paintOrder: 'markers fill stroke',
        }}
      />
      <path
        d="M311.339-376.516h43.17v240.601h-43.17z"
        style={{
          fill: plusColor,
          fillOpacity: 1,
          stroke: 'none',
          strokeWidth: 5.42941809,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeMiterlimit: 4,
          strokeDasharray: 'none',
          strokeDashoffset: 0,
          strokeOpacity: 0.31372549,
          paintOrder: 'markers fill stroke',
        }}
        transform="rotate(90)"
      />
    </svg>
  )
}
export default AddAssetIcon
