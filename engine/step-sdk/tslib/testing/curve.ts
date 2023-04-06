export function getCurveTriCrypto2Address(chainId: string | number) {
  switch (chainId.toString()) {
    // ethereum
    case '1':
    case '31337':
      return '0xd51a44d3fae010294c616388b506acda1bfaae46'
    // arbitrum
    case '42161':
      return '0x960ea3e3c7fb317332d990873d354e18d7645590'
    // optimism
    case '10':
      return '0x1337bedc9d22ecbe766df105c9623922a27963ec'
  }
  throw new Error('could not find tryCrypto2 address for chain: ' + chainId)
}
