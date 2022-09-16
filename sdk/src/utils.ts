// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stringifyBigInt(key: any, value: any): string {
  if (typeof value === 'bigint') {
    return value.toString()
  }
  return value
}
