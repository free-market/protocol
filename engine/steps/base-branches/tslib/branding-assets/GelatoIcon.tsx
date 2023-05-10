import { IconProps } from '@freemarket/step-sdk'
import * as React from 'react'
import { SVGProps } from 'react'
const SvgGelato = (props: SVGProps<SVGSVGElement> & IconProps) => {
  const { dark, ...rest } = props
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="none" viewBox="0 0 134 134" {...rest}>
      <g clipPath="url(#gelato_svg__a)">
        <rect width={134} height={134} fill="#FB43FF" rx={67} />
        <rect width={134} height={134} fill="url(#gelato_svg__b)" rx={67} />
        <rect width={134} height={134} fill="url(#gelato_svg__c)" rx={67} />
        <path
          fill="url(#gelato_svg__d)"
          d="M91.337 53.338c-.007 1.155-1.075 1.972-2.23 1.851a38.06 38.06 0 0 0-7.936-.02c-5.337.552-9.772 2.189-13.86 3.697l-.01.003-.738.273c-4.341 1.596-8.342 2.969-13.088 3.077-1.893.044-3.933-.114-6.18-.563-1.926-.386-3.465-1.847-3.847-3.765a24.042 24.042 0 0 1-.46-4.698c0-13.282 10.823-24.048 24.174-24.048 13.352 0 24.175 10.766 24.175 24.048v.145Z"
        />
        <path
          fill="url(#gelato_svg__e)"
          d="M45.137 65.289c-1.815-.434-3.472 1.506-2.578 3.137l23.73 43.276a1.01 1.01 0 0 0 1.769 0l26.19-47.766c.93-1.694.036-3.816-1.867-4.194-4.138-.822-7.664-.91-10.803-.586-4.815.499-8.815 1.973-12.967 3.502l-.66.244c-4.347 1.598-8.909 3.2-14.393 3.325-2.606.06-5.383-.212-8.42-.938Z"
        />
        <path
          fill="url(#gelato_svg__f)"
          d="M67.162 64.026c0-.502.315-.95.788-1.124l.662-.244c4.152-1.53 8.151-3.003 12.967-3.502 3.138-.325 6.664-.236 10.803.586 1.902.378 2.796 2.5 1.867 4.194l-26.191 47.766a.998.998 0 0 1-.896.522V64.026Z"
        />
      </g>
      <defs>
        <linearGradient id="gelato_svg__b" x1={26.663} x2={86.143} y1={15.725} y2={123.745} gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9FB2" />
          <stop offset={1} stopColor="#A3C9FF" />
        </linearGradient>
        <linearGradient id="gelato_svg__c" x1={32.998} x2={78.39} y1={0} y2={170.682} gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD1A8" />
          <stop offset={0.999} stopColor="#FF7284" />
        </linearGradient>
        <linearGradient id="gelato_svg__e" x1={68.464} x2={68.464} y1={60.249} y2={112.225} gradientUnits="userSpaceOnUse">
          <stop stopColor="#866767" />
          <stop offset={0.469} stopColor="#180208" />
          <stop offset={1} stopColor="#2E1015" />
        </linearGradient>
        <linearGradient id="gelato_svg__f" x1={80.891} x2={80.891} y1={58.98} y2={115.686} gradientUnits="userSpaceOnUse">
          <stop stopColor="#A77874" />
          <stop offset={1} stopColor="#090404" />
        </linearGradient>
        <radialGradient
          id="gelato_svg__d"
          cx={0}
          cy={0}
          r={1}
          gradientTransform="rotate(149.973 36.06 29.051) scale(42.0168 50.2117)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset={0.117} stopColor="#846C6B" />
          <stop offset={0.734} stopColor="#1C0008" />
          <stop offset={1} stopColor="#5F4A48" />
        </radialGradient>
        <clipPath id="gelato_svg__a">
          <rect width={134} height={134} fill="#fff" rx={67} />
        </clipPath>
      </defs>
    </svg>
  )
}
export default SvgGelato
