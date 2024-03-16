import type { Asset, Chain, StepBase, FungibleToken, Percent as FmPercent } from '@freemarket/core'
import {
  assert,
  ADDRESS_ZERO,
  AssetReference,
  getEthersProvider,
  TEN_BIG,
  ONE_BIG,
  Memoize,
  TWO_BIG,
  translateChain,
  getLogger,
} from '@freemarket/core'
import { AbstractStepHelper, Weth__factory } from '@freemarket/step-sdk'
import type { SwapOptionsSwapRouter02, SwapRoute } from '@uniswap/smart-order-router'
import type { BaseProvider } from '@ethersproject/providers'
export const QUOTER_CONTRACT_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
import Big from 'big.js'
import { BigNumber, utils } from 'ethers'

import { IERC20__factory, IV3SwapRouter__factory } from '../typechain-types'
import type { Signer } from '@ethersproject/abstract-signer'

const logger = getLogger('UniswapExactInHelper')

const SWAP_ROUTER_02_ADDRESS = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'
//                             1         2         3         4         5         6
//                    1234567890123456789012345678901234567890123456789012345678901234
const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

const gasLimit = 30_000_000

export const UniswapRouteSchema = `
  tuple(
    bytes encodedPath,
    int256 portion
  )`

export interface UniswapRoute {
  encodedPath: string
  portion: string
}

const TWO_TO_THE_128 = TWO_BIG.pow(128)
export abstract class UniswapBaseHelper<T extends StepBase> extends AbstractStepHelper<T> {
  @Memoize((fromAssetRef: AssetReference, toAssetRef: AssetReference, type: 'exactIn' | 'exactOut') => {
    return `${JSON.stringify(fromAssetRef)}-${JSON.stringify(toAssetRef)}-${type}`
  })
  async getRoute(fromAssetRef: AssetReference, toAssetRef: AssetReference, type: 'exactIn' | 'exactOut', amount?: string) {
    const { SwapType } = await import('@uniswap/smart-order-router')
    const { TradeType, CurrencyAmount, Percent } = await import('@uniswap/sdk-core')
    const { Protocol } = await import('@uniswap/router-sdk')
    assert(typeof fromAssetRef === 'object' && typeof toAssetRef === 'object')
    // assert(fromAssetRef.type === 'fungible-token')
    // assert(toAssetRef.type === 'fungible-token')
    logger.debug(`getRoute(${JSON.stringify(fromAssetRef)}, ${JSON.stringify(toAssetRef)}, ${amount})`)

    const chainId = await this.getChainId()

    // if it's hardhat, assume it's forked ethereum during a test (auto router doesn't work with forks for some unknown reason)
    const chainIdForUniswap = chainId === 31337 ? 1 : chainId
    const chain = await this.getChain()

    const fromAsset = await this.instance.dereferenceAsset(UniswapBaseHelper.toWrappedTokenRef(fromAssetRef), chain)
    const toAsset = await this.instance.dereferenceAsset(UniswapBaseHelper.toWrappedTokenRef(toAssetRef), chain)
    // console.log('fromAsset', fromAsset)
    // console.log('toAsset', toAsset)
    assert(fromAsset.type === 'fungible-token')
    assert(toAsset.type === 'fungible-token')
    // const fromAmount = amount && !amount.endsWith('%') ? amount : await this.getTokenAmountInUsd(1000, fromAsset, chain)
    const routeAmount = await this.getRouteAmount(amount, fromAsset, chain)
    logger.debug('routeAmount for getRoute', routeAmount)
    const uniswapFromToken = await UniswapBaseHelper.toUniswapToken(chain, chainIdForUniswap, fromAsset)
    const uniswapToToken = await UniswapBaseHelper.toUniswapToken(chain, chainIdForUniswap, toAsset)
    // console.log('uniswapFromToken', uniswapFromToken)
    // console.log('uniswapToToken', uniswapToToken)

    const router = await this.getRouter(chainId)
    const options: SwapOptionsSwapRouter02 = {
      type: SwapType.SWAP_ROUTER_02,
      recipient: ADDRESS_ZERO,
      slippageTolerance: new Percent(1, 100),
      deadline: Math.floor(Date.now() / 1000 + 1800),
    }

    const { numerator, denominator } = this.getUniswapFraction(fromAsset, chain, routeAmount)
    const route = await router.route(
      CurrencyAmount.fromFractionalAmount(uniswapFromToken, numerator, denominator),
      uniswapToToken,
      type === 'exactIn' ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
      options,
      { protocols: [Protocol.V3] }
    )
    return { route, amountUsedForRoute: routeAmount }
  }

  private async getRouteAmount(amount: string | undefined, asset: Asset, chain: Chain) {
    if (amount && !amount.endsWith('%')) {
      const c = translateChain(chain)
      const decimals = asset.type === 'native' ? 18 : asset.chains[c]?.decimals
      assert(decimals)
      return new Big(amount).mul(TEN_BIG.pow(decimals)).toFixed(0)
    }
    return this.getTokenAmountInUsd(1000, asset, chain)
  }

  private getUniswapFraction(asset: FungibleToken, chain: Chain, amount: string) {
    const amountBig = new Big(amount)
    // router was finding no route for < 1
    const amountForRouter = amountBig.lt(ONE_BIG) ? ONE_BIG : amountBig
    const decimals = asset.chains[chain]?.decimals || 18
    const numerator = amountForRouter.mul(TEN_BIG.pow(decimals)).toFixed(0)
    const denominator = TEN_BIG.pow(decimals).toString()
    return { numerator, denominator }
  }

  private static toWrappedTokenRef(ref: AssetReference): AssetReference {
    assert(typeof ref === 'object')
    if (ref.type === 'native') {
      return {
        type: 'fungible-token',
        symbol: 'WETH',
      }
    }
    return ref
  }

  async getTokenAmountInUsd(usdAmount: number, asset: Asset, chain: Chain) {
    assert(asset.type === 'fungible-token')
    const c = translateChain(chain)
    const assetChainInfo = asset.chains[c]
    assert(assetChainInfo)
    const oneToken = new Big(10).pow(assetChainInfo.decimals)
    if (!assetChainInfo.usd) {
      return oneToken.toFixed(0)
    }
    const oneDollarsWorthOfToken = oneToken.div(assetChainInfo.usd)
    return oneDollarsWorthOfToken.mul(usdAmount).toFixed(0)
  }

  static async toUniswapToken(chain: Chain, chainId: number, asset: Asset) {
    assert(asset.type === 'fungible-token')
    const c = translateChain(chain)
    const assetChainInfo = asset.chains[c]
    assert(assetChainInfo)
    const { Token } = await import('@uniswap/sdk-core')

    return new Token(chainId, assetChainInfo.address, assetChainInfo.decimals)
  }

  @Memoize()
  protected async getRouter(chainId: number) {
    const { AlphaRouter } = await import('@uniswap/smart-order-router')
    logger.debug('getting router for chain', chainId)
    const chainIdForUniswap = chainId === 31337 ? 1 : chainId
    const chain = chainId === 31337 ? 'local' : await this.getChain()
    const stdProvider = this.instance.getNonForkedProvider(chain) || this.instance.getProvider(chain)
    // console.log('stdProvider', stdProvider)
    const provider = getEthersProvider(stdProvider)
    // const provider = this.ethersProvider
    // console.log('provider', provider)
    // assert(provider)
    const router = new AlphaRouter({
      chainId: chainIdForUniswap,
      provider: provider as BaseProvider,
    })
    return router
  }

  static async encodeRoute(route: SwapRoute): Promise<UniswapRoute[]> {
    const { Protocol } = await import('@uniswap/router-sdk')
    const encodedPaths: UniswapRoute[] = []
    for (const route2 of route.route) {
      const tokenPath = route2.tokenPath.map(it => it.address)
      let tokenPathIndex = 0
      assert(route2.route.protocol === Protocol.V3)
      let encodedPath = tokenPath[tokenPathIndex]
      for (const pool of route2.route.pools) {
        const fromToken = tokenPath[tokenPathIndex]
        assert(fromToken === pool.token0.address || fromToken === pool.token1.address)
        const toToken = tokenPath[tokenPathIndex + 1]
        assert(toToken === pool.token0.address || toToken === pool.token1.address)
        const feeHex = utils.hexlify(pool.fee)
        const paddedHexFee = utils.hexZeroPad(feeHex, 3).slice(2)
        logger.debug('paddedHexFee', paddedHexFee)
        encodedPath += paddedHexFee
        encodedPath += toToken.slice(2)
        ++tokenPathIndex
      }
      const portion = new Big(route2.percent).div(100)

      encodedPaths.push({
        encodedPath,
        portion: this.to128x128(portion),
      })
    }
    return encodedPaths
  }

  static to128x128(n: Big) {
    // logger.debug('encoding to128x128', n.toFixed())
    const shifted = n.mul(TWO_TO_THE_128)
    const ret = BigNumber.from(shifted.toFixed(0)).toHexString()
    // logger.debug('to128x128 ret', ret, ret.length)
    return ret
  }

  static getSlippageTolerancePercent(slippageTolerance?: FmPercent): number {
    let slippageTolerancePct = slippageTolerance?.toString() || '100'
    return parseFloat(
      slippageTolerancePct.endsWith('%') ? (slippageTolerancePct = slippageTolerancePct.slice(0, -1)) : slippageTolerancePct
    )
  }

  static getExchangeRateFromQuote(fromAmount: string, quote: any): Big {
    const quoteNumerator = new Big(quote.numerator.toString())
    const quoteDenominator = new Big(quote.denominator.toString())
    const endAmount = quoteNumerator.div(quoteDenominator)
    const exchangeRate = endAmount.div(fromAmount)
    return exchangeRate
  }

  // utility currently only used in the debugger
  async doSwap(
    signer: Signer,
    recipientAddress: string,
    fromAssetRef: AssetReference,
    toAssetRef: AssetReference,
    type: 'exactIn' | 'exactOut',
    amount: string
  ) {
    const { SwapType } = await import('@uniswap/smart-order-router')
    const { TradeType, CurrencyAmount, Percent } = await import('@uniswap/sdk-core')
    const { Protocol } = await import('@uniswap/router-sdk')
    assert(typeof fromAssetRef === 'object' && typeof toAssetRef === 'object')
    const chainId = await this.getChainId()
    const chain = await this.getChain()

    const fromAsset = await this.instance.dereferenceAsset(UniswapBaseHelper.toWrappedTokenRef(fromAssetRef), chain)
    const toAsset = await this.instance.dereferenceAsset(UniswapBaseHelper.toWrappedTokenRef(toAssetRef), chain)
    assert(fromAsset.type === 'fungible-token' && toAsset.type === 'fungible-token')

    // if the caller is starting with native, wrap if necessary
    if (fromAssetRef.type === 'native') {
      const nativeBalance = await signer.getBalance()
      const oneEth = BigNumber.from(10).pow(18)
      if (nativeBalance.gt(oneEth)) {
        const toWrap = nativeBalance.sub(oneEth)
        const fromAssetChainInfo = fromAsset.chains[chain]
        assert(fromAssetChainInfo)
        const weth = Weth__factory.connect(fromAssetChainInfo.address, signer)
        await (await weth.deposit({ value: toWrap, gasLimit })).wait()
      }
    }

    // approve uniswap router to spend the from input asset
    const fromAssetChainInfo = fromAsset.chains[chain]
    assert(fromAssetChainInfo)
    const token = IERC20__factory.connect(fromAssetChainInfo.address, signer)
    await (await token.approve(SWAP_ROUTER_02_ADDRESS, MAX_UINT256, { gasLimit })).wait()

    // ask uniswap sdk for the route
    const uniswapAmountToken = await UniswapBaseHelper.toUniswapToken(chain, chainId, fromAsset)
    const uniswapQuoteToken = await UniswapBaseHelper.toUniswapToken(chain, chainId, toAsset)
    const router = await this.getRouter(chainId)
    const options: SwapOptionsSwapRouter02 = {
      type: SwapType.SWAP_ROUTER_02,
      recipient: ADDRESS_ZERO,
      slippageTolerance: new Percent(1, 100),
      deadline: Math.floor(Date.now() / 1000 + 1800),
    }

    const { numerator, denominator } = this.getUniswapFraction(toAsset, chain, amount)
    const route = await router.route(
      CurrencyAmount.fromFractionalAmount(uniswapAmountToken, numerator, denominator),
      uniswapQuoteToken,
      type === 'exactIn' ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
      options,
      { protocols: [Protocol.V3] }
    )

    const swapRouter = IV3SwapRouter__factory.connect(SWAP_ROUTER_02_ADDRESS, signer)
    assert(route)
    const encodedRoute = await UniswapBaseHelper.encodeRoute(route)
    const firstRoute = encodedRoute[0]

    if (type === 'exactOut') {
      const txResult = await swapRouter.exactOutput(
        {
          path: firstRoute.encodedPath,
          recipient: recipientAddress,
          amountOut: amount,
          amountInMaximum: MAX_UINT256,
        },
        { gasLimit }
      )
      await txResult.wait()
    } else {
      const txResult = await swapRouter.exactInput(
        {
          path: firstRoute.encodedPath,
          recipient: recipientAddress,
          amountIn: amount,
          amountOutMinimum: 1,
        },
        { gasLimit }
      )
      await txResult.wait()
    }

    // if the caller is starting with native, unwrap whatever is left
    if (fromAssetRef.type === 'native') {
      const fromAssetChainInfo = fromAsset.chains[chain]
      assert(fromAssetChainInfo)
      const weth = Weth__factory.connect(fromAssetChainInfo.address, signer)
      const signerAddress = await signer.getAddress()
      const wethBalance = await weth.balanceOf(signerAddress)
      if (wethBalance.gt(0)) {
        await (await weth.withdraw(wethBalance, { gasLimit })).wait()
      }
    }

    // log out the target asset balance
    const toAssetChainInfo = toAsset.chains[chain]
    assert(toAssetChainInfo)
    const targetAsset = IERC20__factory.connect(toAssetChainInfo.address, signer)
    const targetAssetBalance = await targetAsset.balanceOf(recipientAddress)
    logger.debug('targetAssetBalance', targetAssetBalance.toString())
  }
}
