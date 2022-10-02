declare module 'react-flip-numbers' {
  import * as React from 'react'
  export type FlipNumbersProps = {
    numbers: string | Array<string>
    nonNumberStyle?: { [key: string]: string | number }
    height: number
    width: number
    color: string
    background?: string
    perspective?: number
    duration?: number
    delay?: number
    animate?: boolean
    play?: boolean
    numberStyle?: { [key: string]: string | number }
  }

  class FlipNumbers extends React.Component<FlipNumbersProps> {}
}
