import type { ExecutionContext } from 'ava'

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

export function assert(t: ExecutionContext<unknown>, value: unknown, message?: string): asserts value {
  t.assert(value, message)
}

export function throws(t: ExecutionContext<unknown>, fn: () => void) {
  try {
    fn()
    t.fail('was supposed to throw')
  } catch (e) {
    t.snapshot(e)
  }
}

export async function throwsAsync(t: ExecutionContext<unknown>, fn: () => Promise<void>) {
  try {
    await fn()
    t.fail('was supposed to throw')
  } catch (e) {
    t.snapshot(e)
  }
}
