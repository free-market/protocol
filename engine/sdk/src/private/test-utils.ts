export function shouldRunE2e() {
  return process.env['INCLUDE_E2E'] === 'true'
}

export function mapToRecord<V>(map: Map<string, V>): Record<string, V> {
  const rv: Record<string, V> = {}
  for (const [key, val] of map) {
    rv[key] = val
  }
  return rv
}
