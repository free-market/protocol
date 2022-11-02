import { Workflow } from './types'
import { BigNumber } from 'ethers'
import log from 'loglevel'
import bs58 from 'bs58'

export function initLogger() {
  const originalFactory = log.methodFactory
  log.methodFactory = function (methodName, logLevel, loggerName) {
    const rawMethod = originalFactory(methodName, logLevel, loggerName)
    return function (message) {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      const millis = String(now.getMilliseconds()).padStart(2, '0')
      const timeStr = `${hours}:${minutes}:${seconds}.${millis} `
      rawMethod(timeStr + message)
    }
  }
  // must call setLevel after patching: log.setLevel(log.getLevel())
  log.setLevel('debug')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stringifyBigNumber(key: any, value: any): string {
  if (value instanceof BigNumber) {
    return value.toString()
  }
  return value
}

function indent(n: number) {
  let rv = ''
  for (let i = 0; i < n; ++i) {
    rv += ' '
  }
  return rv
}

// <blockquote>
//   <details>
//     <summary>Hello</summary>
//     <blockquote>
//       <details>
//         <summary>World</summary>
//         <blockquote>:smile:</blockquote>
//       </details>
//     </blockquote>
//   </details>
// </blockquote>

export function randomInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive)
}

const BASE58_CHARS = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

const SHORT_RANDOM_LENGTH = 17

export function randomString() {
  const bytes = new Uint8Array(SHORT_RANDOM_LENGTH)
  for (let i = 0; i < SHORT_RANDOM_LENGTH; ++i) {
    bytes[i] = randomInt(256)
  }
  let s = bs58.encode(bytes)
  if (s.length === 23) {
    s += BASE58_CHARS[randomInt(58)]
  }
  return s
}

export function toHtml(element: any, label: string, i = 0) {
  const hasChildren = typeof element !== 'string' && Object.keys(element).length > 0
  let html = indent(i) + '<blockquote>\n'
  i += 2
  if (hasChildren) {
    html += indent(i) + '<details>\n'
    i += 2
    html += indent(i) + '<summary>\n'
    i += 2
  }
  html += indent(i) + label
  if (!hasChildren) {
    html += ': ' + element.toString()
  }
  html += '\n'
  i -= 2
  if (hasChildren) {
    html += indent(i) + '</summary>\n'
    i -= 2

    for (const key in element) {
      const obj = element[key]
      html += toHtml(obj, key, i + 2)
    }

    html += indent(i) + '</details>\n'
    i -= 2
  }
  html += indent(i) + '</blockquote>\n'
  i -= 2

  return html
}
