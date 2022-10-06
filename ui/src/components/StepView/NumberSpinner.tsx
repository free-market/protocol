import { ListBulletIcon } from '@heroicons/react/24/outline'
import React, { useMemo, useState } from 'react'
import { style, keyframes } from 'typestyle'
import { keyframes as muiKeyframes } from '@emotion/react'
import { makeStyles, withStyles } from 'tss-react/mui'

const flashKeyFrames = keyframes({
  from: {
    color: 'rgba(255, 255, 0, 0.61)',
  },
  to: {
    color: 'inherit',
  },
  // to: { transform: `translateY(-1000%)` },
})
const flash = style({
  animationDuration: '.5s',
  animationName: flashKeyFrames,
})

// const useStylesFlash = makeStyles()({
//   animationDuration: '.5s',
//   animationName: flashKeyFrames,
// })

// const flipNumberKeyframes2 = [...Array(10).keys()].map((n) =>
//   muiKeyframes({
//     from: { transform: 'translateY(0%)' },
//     to: { transform: `translateY(-${n * 100}%)` },
//     // to: { transform: `translateY(-1000%)` },
//   }),
// )

const flipNumberKeyframes = [...Array(10).keys()].map((n) =>
  keyframes({
    from: { transform: 'translateY(0%)' },
    to: { transform: `translateY(-${n * 100}%)` },
    // to: { transform: `translateY(-1000%)` },
  }),
)

const MAX_ANIMATION_TIME = 2.5
const MIN_ANIMATION_TIME = 0.5
const numberSpinnerStyles = [...Array(10).keys()].map((n) =>
  style({
    //   // padding: 10,
    //   // backgroundColor: 'blue',
    // fontFamily: 'monospace',
    // all: 'initial',
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-block',
    // fontSize: 12,
    backgroundColor: '0',
    color: 'inherit',
    textAlign: 'center',
    width: 7,

    $nest: {
      '&::before': {
        content: 'a',
        display: 'block',
        color: 'transparent',
      },
      '&::after': {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        // content: `'0\\A 1\\A 2\\A 3\\A 4\\A 5\\A 6\\A 7\\A 8\\A 9\\A X'`,
        content: `'${[...Array(n + 1).keys()].join('\\A ')}'`,
        display: 'block',
        whiteSpace: 'pre-line',
        textAlign: 'center',
        animation: `${flipNumberKeyframes[n]} cubic-bezier(.12,.78,.52,1)  1 ${Math.min(
          (MAX_ANIMATION_TIME / 10) * n,
          MIN_ANIMATION_TIME,
        )}s`,
        animationFillMode: 'forwards',
        willChange: 'transform',
        animationDelay: '0s',
      },
    },
  }),
)

// const useStylesNumberSpinner = [...Array(10).keys()].map((n) =>
//   makeStyles()({
//     //   // padding: 10,
//     //   // backgroundColor: 'blue',
//     // fontFamily: 'monospace',
//     // all: 'initial',
//     spinNumbers: {
//       'position': 'relative',
//       'overflow': 'hidden',
//       'display': 'inline-block',
//       // fontSize: 12,
//       'backgroundColor': '0',
//       'color': 'inherit',
//       'textAlign': 'center',
//       'width': 10,

//       '&:before': {
//         content: 'a',
//         display: 'block',
//         color: 'transparent',
//       },
//       '&:after': {
//         position: 'absolute',
//         width: '100%',
//         height: '100%',
//         top: 0,
//         left: 0,
//         // content: `'0\\A 1\\A 2\\A 3\\A 4\\A 5\\A 6\\A 7\\A 8\\A 9\\A X'`,
//         content: `'${[...Array(n + 1).keys()].join('\\A ')}'`,
//         display: 'block',
//         whiteSpace: 'pre-line',
//         textAlign: 'center',
//         animation: `${flipNumberKeyframes[n]} cubic-bezier(.12,.78,.52,1)  1 ${Math.min(
//           (MAX_ANIMATION_TIME / 10) * n,
//           MIN_ANIMATION_TIME,
//         )}s`,
//         animationFillMode: 'forwards',
//         willChange: 'transform',
//         animationDelay: '0s',
//       },
//     },
//   }),
// )

// const numberSpinnerClasses = useStylesNumberSpinner.map((it) => it())

export const NumberSpinner = (props: { numbers: string; minWidth?: number; classNames?: string }): JSX.Element => {
  const [currentNumbers, setCurrentNumbers] = useState('')
  let { numbers } = props
  let numbersChanged = false
  if (numbers != currentNumbers) {
    numbersChanged = true
    numbers = props.numbers
    setCurrentNumbers(numbers)
  }
  const elements: JSX.Element[] = []
  for (let i = 0; i < numbers.length; ++i) {
    const c = props.numbers[i]
    const n = parseInt(c)
    if (c === '.') {
      elements.push(
        <div>
          <span>.</span>
        </div>,
      )
    } else {
      elements.push(
        <div id={`numspinner-${i}`} className={numberSpinnerStyles[n]}>
          <span>&nbsp;</span>
        </div>,
      )
    }
  }

  return (
    <div
      // className={flash}
      style={{ color: 'inherit', font: 'inherit', display: 'inline-block', minWidth: props.minWidth }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{elements}</div>
    </div>
  )
}
