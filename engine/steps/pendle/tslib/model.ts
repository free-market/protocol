
import { ADDRESS_ZERO } from '@freemarket/core';
import { ADDRCONFIG } from 'dns';
import { BigNumberish } from 'ethers';
import { AbiCoder } from 'ethers/lib/utils';
import pendleMarkets from './markets.json';
const defaultAbiCoder: AbiCoder = new AbiCoder();
/*
  struct PendleSwapTokenParams {
    address market;
    uint minTokenOutput;
  }
*/
function encodePendleSwapTokenParams(market: string, minToReceive: BigNumberish): string {
  return defaultAbiCoder.encode(["address", "uint256"], [market, minToReceive])
}

/*
there are multiple markets for each token listed by API. Pendle frontend seems to direct to this one

*/
function getOldestNonexpiredMarket(symbol: string) : string {
  const candidates = pendleMarkets.results.filter((res) => { 
    return  new Date(res.expiry) > new Date() &&  (res.accountingAsset.symbol == symbol || res.underlyingAsset.symbol == symbol) 
  })
  var earliestDate = candidates[0].expiry
  for(let i=1; i< candidates.length;i++) {
    const date = new Date(candidates[i].expiry)
    if(date < new Date(earliestDate)) {
      earliestDate = candidates[i].expiry
    }
  }
  return candidates.filter((res) => {return res.expiry == earliestDate})[0].address
}

console.log(getOldestNonexpiredMarket("stETH"))

export { encodePendleSwapTokenParams, getOldestNonexpiredMarket }
