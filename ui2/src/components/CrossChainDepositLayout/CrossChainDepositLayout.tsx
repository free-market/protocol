import Logo from '@component/Logo'
import { PencilSquareIcon } from '@heroicons/react/24/solid'
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import cx from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import '../Layout/super-shadow.css'

export type WalletState = 'ready' | 'insufficient-balance' | 'unconnected'

export type EditingMode = {
  name: 'token' | 'chain'
  recently?: 'opened' | 'closed'
}

export interface TokenSelectorMenuRef {
  getExpandedHeight: () => number
}

export const CrossChainDepositLayout = forwardRef(
  (
    props: {
      submitting?: boolean
      empty?: boolean
      walletState?: WalletState
      initialFormEditingMode?: EditingMode
    },
    ref: React.Ref<TokenSelectorMenuRef>,
  ): JSX.Element => {
    const {
      submitting = false,
      empty = false,
      walletState = 'ready',
      initialFormEditingMode,
    } = props

    const [formEditingMode, setFormEditingMode] = useState(
      initialFormEditingMode,
    )

    const url = 'https://app.aave.com/icons/tokens/eth.svg'

    const [tokenSearchValue, setTokenSearchValue] = useState('')
    const [amountEditing, setAmountEditing] = useState(false)
    const [tokenSearchDebounce, setTokenSearchDebounce] = useState<
      number | null
    >(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const tokenSearchRef = useRef<HTMLInputElement>(null)

    const getExpandedHeight = () => containerRef.current?.scrollHeight ?? 0
    useImperativeHandle(ref, () => ({ getExpandedHeight }), [
      tokenSearchValue,
      tokenSearchDebounce,
    ])

    const startEditing = useCallback(() => {
      setAmountEditing(true)
    }, [])

    const onBlur = useCallback(() => {
      setAmountEditing(false)
    }, [])

    const amountButton = (
      <button
        className="w-full text-left bg-zinc-600 p-2 rounded-xl group hover:bg-zinc-500/75 flex justify-between active:bg-zinc-500/50 focus:outline focus:outline-2 focus:outline-offset-[-4px] focus:outline-sky-600/25"
        onClick={startEditing}
      >
        <div className="space-y-2">
          <div className="text-xs text-zinc-400 font-light group-hover:text-zinc-300 group-active:text-zinc-300/75">
            AMOUNT
          </div>
          <div className="flex items-center gap-2">
            <div className="text-zinc-300 group-hover:text-zinc-200 group-active:text-zinc-200/75 font-bold">
              10.00
            </div>
          </div>
        </div>
        <div className="invisible group-hover:visible flex items-center gap-1">
          <div className="text-sm font-light text-zinc-300 group-active:text-zinc-300/75">
            click to edit
          </div>
          <PencilSquareIcon className="text-zinc-300 group-active:text-zinc-300/75 w-4 h-4" />
        </div>
      </button>
    )

    const amountInput = (
      <div className="bg-zinc-600 pt-2 rounded-xl group hover:bg-zinc-500/75">
        <div className="text-xs text-zinc-200 font-light ml-2 group-hover:text-zinc-300">
          AMOUNT
        </div>
        <input
          inputMode="decimal"
          step="0.00000001"
          title="Token Amount"
          autoComplete="off"
          autoCorrect="off"
          type="text"
          pattern="^\d*(\.\d{0,2})?$"
          placeholder="0.00"
          min="0"
          minLength={1}
          maxLength={79}
          spellCheck={false}
          autoFocus
          className="relative font-bold outline-none border-none flex-auto overflow-hidden overflow-ellipsis placeholder-low-emphesis focus:placeholder-primary focus:placeholder:text-low-emphesis focus:outline-2 flex-grow text-left bg-transparent placeholder:text-zinc-400 text-zinc-200 rounded-xl px-2 pb-2 pt-8 -mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:!bg-transparent w-full focus:outline focus:outline-2 focus:outline-offset-[-4px] focus:outline-sky-600/25"
          onBlur={onBlur}
        />
      </div>
    )

    const buttonNames: Record<WalletState, string> = {
      'ready': 'Start',
      'insufficient-balance': 'Insufficient Balance',
      'unconnected': 'Connect Wallet',
    }

    const handleTokenSelectorClick = async () => {
      if (
        formEditingMode?.name === 'token' &&
        formEditingMode.recently !== 'opened'
      ) {
        // no-op
        // setFormEditingMode({ name: 'token', recently: 'closed' })
        // await new Promise((resolve) => setTimeout(resolve, 300))
        // setFormEditingMode(undefined)
      } else if (
        formEditingMode === undefined ||
        formEditingMode.recently === 'closed'
      ) {
        setFormEditingMode({ name: 'token', recently: 'opened' })
        setTokenSearchValue('')
        setTokenSearchDebounce(null)
        await new Promise((resolve) => setTimeout(resolve, 300))
        setFormEditingMode({ name: 'token', recently: undefined })
        if (tokenSearchRef.current) {
          tokenSearchRef.current.focus()
        }
      }
    }

    const handleTokenSelectorInputBlur = async () => {
      /*
      setFormEditingMode({ name: 'token', recently: 'closed' })
      await new Promise((resolve) => setTimeout(resolve, 300))
      setFormEditingMode(undefined)
       */
    }

    const handleTokenSelectorInputKeyPress = async (
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (event.code === 'Enter') {
        setFormEditingMode({ name: 'token', recently: 'closed' })
        await new Promise((resolve) => setTimeout(resolve, 300))
        setFormEditingMode(undefined)
        setTokenSearchValue('')
        setTokenSearchDebounce(null)
        startEditing()
      }
    }

    const handleTokenSelectorInputChange = (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const oldValue = tokenSearchValue
      let newValue
      if (event.target.value.trim() === '') {
        newValue = ''
      } else {
        newValue = event.target.value
      }

      if (oldValue !== newValue) {
        setTokenSearchValue(newValue)
        if (tokenSearchDebounce) {
          clearTimeout(tokenSearchDebounce)
        }
        const timeout = setTimeout(() => {
          setTokenSearchDebounce(null)
        }, 1)
        setTokenSearchDebounce(timeout as unknown as number)
      }
    }

    const tokenSelectorSearchResults = [
      { symbol: 'ETH', title: 'Ether' },
      { symbol: 'WETH', title: 'Wrapped Ether' },
      { symbol: 'USDC', title: 'USD Coin' },
      { symbol: 'DAI', title: 'Dai Stablecoin' },
      { symbol: 'USDT', title: 'Tether USD' },
      { symbol: 'wBTC', title: 'WBTC' },
      { symbol: 'WBTC', title: 'Wrapped BTC' },
      { symbol: 'sUSD', title: 'Synth sUSD' },
    ].filter(
      ({ symbol, title }) =>
        symbol.toLowerCase().includes(tokenSearchValue.toLowerCase()) ||
        title.toLowerCase().includes(tokenSearchValue.toLowerCase()),
    )

    const tokenSelectorSearchResultElements = tokenSelectorSearchResults.map(
      ({ symbol, title }, index) => (
        <div
          className={cx('flex items-center gap-2 rounded-xl px-2', {
            'bg-zinc-500': index === 0,
          })}
          key={symbol}
        >
          <div className="rounded-full overflow-hidden w-4 h-4 bg-zinc-500">
            <img className="w-full h-full" src={url} />
          </div>
          <div className="text-zinc-300">
            <span className="font-medium">{symbol}</span>{' '}
            <span className="text-zinc-400">
              <span className="text-sm">{title}</span>
            </span>
          </div>
        </div>
      ),
    )

    return (
      <>
        <div className="max-w-sm mx-auto p-2 flex items-center gap-2">
          <Logo className="stroke-zinc-300 w-6 h-6 rounded-full bg-zinc-800 p-1" />
          <div className="font-light text-md">ccd.fmprotocol.com</div>
        </div>

        <div className="bg-zinc-700 rounded-xl p-2 max-w-sm mx-auto shadow-md relative overflow-hidden">
          <AnimatePresence>
            {formEditingMode?.name === 'token' &&
              formEditingMode.recently !== 'closed' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="bg-zinc-700/75 absolute top-0 right-0 left-0 bottom-0 p-2 group cursor-pointer"
                ></motion.div>
              )}
          </AnimatePresence>
          <div className="space-y-2">
            <button className="w-full text-left bg-zinc-600 p-2 rounded-xl group hover:bg-zinc-500/75 flex justify-between items-stretch active:bg-zinc-500/50 focus:outline focus:outline-offset-[-4px] focus:outline-2 focus:outline-sky-600/25">
              <div className="space-y-2">
                <div className="text-xs text-zinc-400 font-light group-hover:text-zinc-300 group-active:text-zinc-300/75">
                  CHAIN
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-full overflow-hidden w-4 h-4 bg-zinc-500 group-hover:bg-zinc-400 group-active:bg-zinc-400/75">
                    <img
                      className="w-full h-full group-hover:opacity-[0.95] group-active:opacity-75"
                      src={url}
                    />
                  </div>
                  <div className="text-zinc-300 group-hover:text-zinc-200 group-active:text-zinc-200/75">
                    Ethereum
                  </div>
                </div>
              </div>
              <div className="invisible group-hover:visible flex items-center gap-1">
                <div className="text-sm font-light text-zinc-300 group-active:text-zinc-300/75">
                  click to edit
                </div>
                <PencilSquareIcon className="text-zinc-300 group-active:text-zinc-300/75 w-4 h-4" />
              </div>
            </button>

            <div
              className={cx('relative max-h-64 overflow-hidden rounded-xl', {
                'super-shadow-2':
                  formEditingMode?.name === 'token' &&
                  tokenSelectorSearchResults.length > 5,
              })}
            >
              <motion.button
                onClick={handleTokenSelectorClick}
                className={cx(
                  'box-content w-full text-left bg-zinc-600 p-2 rounded-xl group overflow-y-scroll relative max-h-64 -mr-5 flex flex-col focus:outline focus:outline-offset-[-4px] focus:outline-2 focus:outline-sky-600/25',
                  {
                    'z-30': formEditingMode?.name === 'token',
                    'hover:bg-zinc-500/75 active:bg-zinc-500/50':
                      formEditingMode?.name !== 'token' ||
                      formEditingMode.recently === 'closed',
                  },
                )}
                initial={{ height: 48 }}
                animate={{
                  height:
                    formEditingMode?.name === 'token' &&
                    formEditingMode.recently !== 'closed'
                      ? tokenSearchDebounce
                        ? 0
                        : getExpandedHeight()
                      : 48,
                }}
                transition={{
                  delay: formEditingMode?.name === 'token' ? 0 : 0.2,
                }}
              >
                <div
                  ref={containerRef}
                  className={cx('w-full', {
                    'pb-5':
                      formEditingMode?.name === 'token' &&
                      tokenSelectorSearchResults.length > 5,
                  })}
                >
                  <div className="h-0 relative">
                    <motion.div
                      className="w-full absolute flex justify-between"
                      animate={{
                        opacity:
                          formEditingMode?.name === 'token' &&
                          formEditingMode.recently !== 'closed'
                            ? 0
                            : 1,
                      }}
                      transition={{
                        duration: 0.1,
                        delay:
                          formEditingMode?.name === 'token' &&
                          formEditingMode.recently === 'closed'
                            ? 0.1
                            : 0,
                      }}
                    >
                      <div className="space-y-2">
                        <div className="text-xs text-zinc-400 font-light group-hover:text-zinc-300 group-active:text-zinc-300/75">
                          TOKEN
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="rounded-full overflow-hidden w-4 h-4 bg-zinc-500 group-hover:bg-zinc-400 group-active:bg-zinc-400/75">
                            <img
                              className="w-full h-full group-hover:opacity-[0.95] group-active:opacity-75"
                              src={url}
                            />
                          </div>
                          <div className="text-zinc-300 group-hover:text-zinc-200 group-active:text-zinc-200/75 font-medium">
                            ETH
                          </div>
                        </div>
                      </div>
                      <div className="invisible group-hover:visible flex items-center gap-1">
                        <div className="text-sm font-light text-zinc-300 group-active:text-zinc-300/75">
                          click to edit
                        </div>
                        <PencilSquareIcon className="text-zinc-300 group-active:text-zinc-300/75 w-4 h-4" />
                      </div>
                    </motion.div>
                  </div>
                  <motion.div
                    className="flex justify-between"
                    animate={{
                      opacity:
                        formEditingMode?.name === 'token' &&
                        formEditingMode.recently !== 'closed'
                          ? 1
                          : 0,
                    }}
                    transition={{
                      duration: 0.1,
                      delay:
                        formEditingMode?.name === 'token' &&
                        formEditingMode.recently === 'opened'
                          ? 0.1
                          : 0,
                    }}
                  >
                    <div className="space-y-2 w-full">
                      <div className="text-xs text-zinc-400 font-light">
                        SELECT TOKEN
                      </div>

                      <div className="w-full flex items-center bg-zinc-500/25 rounded-md overflow-hidden">
                        <input
                          ref={tokenSearchRef}
                          type="text"
                          placeholder="Search address or name..."
                          className="relative font-bold border-none flex-auto overflow-hidden overflow-ellipsis placeholder-low-emphesis focus:placeholder-primary focus:placeholder:text-low-emphesis focus:outline focus:outline-2 focus:outline-offset-[-4px] focus:outline-sky-600/25 flex-grow text-left bg-transparent placeholder:text-zinc-400 text-zinc-200 rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:!bg-transparent w-10/12 px-2 rounded-md"
                          onBlur={handleTokenSelectorInputBlur}
                          onKeyPress={handleTokenSelectorInputKeyPress}
                          onChange={handleTokenSelectorInputChange}
                          tabIndex={
                            formEditingMode?.name !== 'token' ? -1 : undefined
                          }
                          value={tokenSearchValue}
                        />
                        <div
                          className={cx('w-1/6 text-right', {
                            hidden: tokenSearchValue,
                          })}
                        >
                          <MagnifyingGlassIcon className="inline-block w-5 h-5 text-zinc-400" />
                        </div>
                      </div>

                      {tokenSelectorSearchResultElements}
                    </div>
                  </motion.div>
                </div>
              </motion.button>
            </div>

            {amountEditing ? amountInput : amountButton}

            <button
              className={cx(
                'w-full text-zinc-200 font-bold bg-sky-600 rounded-xl p-2 text-xl flex justify-center items-center overflow-hidden hover:bg-sky-500/75 active:bg-sky-500/[.7] focus:outline focus:outline-2 focus:outline-offset-[-4px] focus:outline-sky-400/25',
                {
                  'cursor-not-allowed': submitting || empty,
                  'opacity-50': empty,
                },
              )}
            >
              <div className="h-8">
                <div
                  className="transition-all h-8"
                  style={{
                    marginTop: submitting ? -77 : 2,
                    height: 'max-content',
                  }}
                >
                  <div className="flex items-center">
                    {buttonNames[walletState]}
                  </div>
                </div>
                <div className="transition-all h-8 mt-12">
                  <span
                    className="border-2 border-transparent animate-spin inline-block w-8 h-8 border-4 rounded-full"
                    style={{ borderLeftColor: 'rgb(231 229 228)' }}
                  />
                </div>
              </div>
            </button>
          </div>
        </div>
      </>
    )
  },
)
