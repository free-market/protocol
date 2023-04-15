import * as React from 'react'
import { SVGProps } from 'react'
const StargateIcon = (props: SVGProps<SVGSVGElement> & { light?: boolean }) => {
  const fg = props.light ? '#fff' : '#000'

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="35px"
      height="35px"
      fill="none"
      className="stargate_svg__jss705"
      viewBox="0 0 35 35"
      {...props}
    >
      <g fill="#999" clipPath="url(#stargate_svg__c)">
        <path d="m19.968 1.664.887 2.077a17.2 17.2 0 0 0 9.067 9.067l2.077.887a3.59 3.59 0 0 1 1.326.96C32.291 7.238 26.425 1.372 19.008.338c.395.34.728.782.96 1.326ZM1.326 13.695l2.077-.887a17.203 17.203 0 0 0 9.068-9.067l.886-2.077a3.6 3.6 0 0 1 .96-1.326C6.9 1.372 1.034 7.238 0 14.655c.34-.396.782-.728 1.326-.96ZM32 20.304l-2.078.887a17.2 17.2 0 0 0-9.067 9.068l-.887 2.076a3.6 3.6 0 0 1-.96 1.327c7.417-1.035 13.283-6.901 14.317-14.318a3.59 3.59 0 0 1-1.326.96ZM13.357 32.335l-.886-2.076a17.204 17.204 0 0 0-9.068-9.068l-2.077-.887A3.59 3.59 0 0 1 0 19.344c1.034 7.417 6.9 13.283 14.317 14.318a3.61 3.61 0 0 1-.96-1.327Z" />
      </g>
      <path
        fill={fg}
        d="m9.103 15.371 1.023-.437a8.478 8.478 0 0 0 4.469-4.468l.436-1.024c.612-1.433 2.645-1.433 3.257 0l.436 1.024a8.478 8.478 0 0 0 4.469 4.468l1.024.437c1.433.612 1.433 2.644 0 3.256l-1.024.437a8.476 8.476 0 0 0-4.469 4.469l-.436 1.023c-.612 1.433-2.645 1.433-3.257 0l-.436-1.023a8.476 8.476 0 0 0-4.469-4.469l-1.023-.437c-1.434-.612-1.434-2.644 0-3.256Z"
      />
    </svg>
  )
}
export default StargateIcon
