// written from scratch to be browser friendly
export default function assert(value: unknown, message?: string | Error): asserts value {
  if (!value) {
    if (typeof message === 'string') {
      throw new Error(message)
    }
    throw message
  }
}
