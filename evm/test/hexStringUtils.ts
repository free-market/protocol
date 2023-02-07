export function remove0x(s: string) {
  if (s.startsWith('0x')) {
    return s.slice(2)
  }
  return s
}

export function hexByteLength(hex: string): number {
  return remove0x(hex).length / 2
}

export function concatHex(hex1: string, hex2: string): string {
  return '0x' + remove0x(hex1) + remove0x(hex2)
}
