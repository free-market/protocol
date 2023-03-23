export function getPoolAddress(chainId: string) {
  switch (chainId) {
    // ethereum
    case '1':
      return '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2'
    // avalanche
    case '43114':
      return '0x794a61358D6845594F94dc1DB02A252b5b4814aD'
    // polygon
    case '137':
      return '0x794a61358D6845594F94dc1DB02A252b5b4814aD'
    // arbitrum
    case '42161':
      return '0x794a61358D6845594F94dc1DB02A252b5b4814aD'
    // optimism
    case '10':
      return '0x794a61358D6845594F94dc1DB02A252b5b4814aD'
    // fantom
    case '250':
      return '0x794a61358D6845594F94dc1DB02A252b5b4814aD'
  }
  return null
}
