// import { BigNumber } from 'ethers'
import Big from 'big.js'

// https://docs.alchemy.com/docs/how-to-send-transactions-with-eip-1559#what-is-the-difference-between-effectivegasprice-cumulativegasused-and-gasused
// https://www.liquity.org/blog/how-eip-1559-changes-the-transaction-fees-of-ethereum

const WEI_PER_ETH = Big(10).pow(18)

function gasToDollars(gasUsed: string, effectiveGasPrice: string, ethUsd: string) {
  const gasCostWei = Big(gasUsed).mul(Big(effectiveGasPrice))
  const gasCostEth = gasCostWei.div(WEI_PER_ETH)
  const gasCostDollars = gasCostEth.mul(Big(ethUsd))
  return gasCostDollars.toFixed(2)
}

const ethUsd = '1260'
const gasUsed = '294835'
const effectiveGasPrice = '2595066319'

console.log(gasToDollars(gasUsed, effectiveGasPrice, ethUsd))
