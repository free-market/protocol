import { IconProps } from '@freemarket/step-sdk'
import * as React from 'react'
import { SVGProps } from 'react'
const SvgPulsex = (props: SVGProps<SVGSVGElement> & IconProps) => {
  const p: any = { ...props }
  delete p.dark
  return (
    <svg viewBox="0 0 551 655" width="24px" height="24px" color="text" xmlns="http://www.w3.org/2000/svg">
      <g id="Artboard" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="Group-4-Copy-4">
          <path
            d="M350.607,412.346 L471,622 L334.596159,622 C325.647006,622 317.380432,617.21648 312.921058,609.457529 L312.921058,609.457529 L274.985,543.451 L350.607,412.346 Z M136.67325,65 C145.625727,65 153.894842,69.7870435 158.352984,77.550536 L158.352984,77.550536 L236.655,213.908 L160.983,345.098 L0,65 Z"
            id="Combined-Shape-Copy"
            fill="url(#linearGradient-1)"
          ></path>
          <path
            d="M186.068261,630.060049 L551,0 L551,0 L427.299604,0 C409.442016,-3.2246751e-14 392.940022,9.52392606 384.006301,24.9862061 L20,655 L20,655 L142.801715,655 C160.640215,655 177.127587,645.496254 186.068261,630.060049 Z"
            id="Path-4-Copy-2"
            fill="url(#linearGradient-2)"
          ></path>
        </g>
      </g>
      <defs>
        <linearGradient x1="14.2479105%" y1="0%" x2="68.77279%" y2="111.597742%" id="linearGradient-1">
          <stop stop-color="#FF0000" offset="0.0863882212%"></stop>
          <stop stop-color="#FF0033" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="82.8606725%" y1="0%" x2="31.5206006%" y2="107.068238%" id="linearGradient-2">
          <stop stop-color="#00FF99" offset="0%"></stop>
          <stop stop-color="#00FF55" offset="100%"></stop>
        </linearGradient>
      </defs>
    </svg>
  )
}
export default SvgPulsex
