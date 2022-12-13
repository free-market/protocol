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
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { ChevronLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import '../Layout/super-shadow.css'

const MAX_SELECTOR_HEIGHT = 264

// use this to debug the editing state
// TODO: when this is 'true', the search button is not usable because the input becomes blurred
const STOP_EDITING_ON_BLUR = false

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
      hollow?: boolean
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

    const [amountEditing, setAmountEditing] = useState(false)
    const [tokenSearchValue, setTokenSearchValue] = useState('')
    const tokenSelectorContainerRef = useRef<HTMLDivElement>(null)
    const tokenSearchRef = useRef<HTMLInputElement>(null)

    const tokenSelectorSearchResults = [
      { symbol: 'ETH', title: 'Ether' },
      { symbol: 'WETH', title: 'Wrapped Ether' },
      { symbol: 'USDC', title: 'USD Coin' },
      { symbol: 'DAI', title: 'Dai Stablecoin' },
      { symbol: 'USDT', title: 'Tether USD' },
      { symbol: 'wBTC', title: 'WBTC' },
      { symbol: 'YFI', title: 'yearn.finance' },
      { symbol: 'AAVE', title: 'Aave Token' },
      { symbol: 'GRT', title: 'Graph Token' },
      { symbol: 'UNI', title: 'Uniswap' },
    ].filter(
      ({ symbol, title }) =>
        symbol.toLowerCase().includes(tokenSearchValue.toLowerCase()) ||
        title.toLowerCase().includes(tokenSearchValue.toLowerCase()),
    )

    const getExpandedHeightForTokenSelector = () =>
      tokenSelectorContainerRef.current?.scrollHeight ?? 0
    useImperativeHandle(
      ref,
      () => ({
        getExpandedHeight: getExpandedHeightForTokenSelector,
      }),
      [tokenSearchValue],
    )

    // const [chainSearchValue , setChainSearchValue] = useState('')

    const [chainSelectorOverflow, setChainSelectorOverflow] = useState(
      tokenSelectorSearchResults.length > 5,
    )
    const [tokenSelectorOverflow, setTokenSelectorOverflow] = useState(
      tokenSelectorSearchResults.length > 5,
    )
    const chainSelectorContainerRef = useRef<HTMLDivElement>(null)
    const chainSearchRef = useRef<HTMLInputElement>(null)

    const getExpandedHeightForChainSelector = () =>
      chainSelectorContainerRef.current?.scrollHeight ?? 0
    useImperativeHandle(
      ref,
      () => ({
        getExpandedHeight: getExpandedHeightForChainSelector,
      }),
      [tokenSearchValue],
    )

    const tokenSelectorResultsContainerRef = useRef<HTMLDivElement>(null)
    const chainSelectorResultsContainerRef = useRef<HTMLDivElement>(null)

    const getExpandedHeightForChainSelectorResults = () =>
      chainSelectorResultsContainerRef.current?.scrollHeight ?? 0
    useImperativeHandle(
      ref,
      () => ({
        getExpandedHeight: getExpandedHeightForChainSelectorResults,
      }),
      [tokenSearchValue],
    )

    const chainSelectorButtonControls = useAnimationControls()
    const tokenSelectorButtonControls = useAnimationControls()

    const startEditing = useCallback(() => {
      setAmountEditing(true)
    }, [])

    const onBlur = useCallback(() => {
      setAmountEditing(false)
    }, [])

    const amountButton = (
      <button
        className="w-full text-left bg-zinc-600 p-2 rounded-xl group hover:bg-zinc-500/75 flex justify-between items-stretch active:bg-zinc-500/50 focus:outline focus:outline-2 focus:outline-offset-[-4px] focus:outline-sky-600/50"
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

        <div className="invisible pointer-events-none group-hover:pointer-events-auto group-hover:visible flex items-center gap-1">
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
          className="relative font-bold outline-none border-none flex-auto overflow-hidden overflow-ellipsis placeholder-low-emphesis focus:placeholder-primary focus:placeholder:text-low-emphesis focus:outline-2 flex-grow text-left bg-transparent placeholder:text-zinc-400 text-zinc-200 rounded-xl px-2 pb-2 pt-8 -mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:!bg-transparent w-full focus:outline focus:outline-2 focus:outline-offset-[-4px] focus:outline-sky-600/50"
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
      } else if (formEditingMode === undefined) {
        setFormEditingMode({ name: 'token', recently: 'opened' })
        setTokenSearchValue('')

        await Promise.all([
          new Promise((resolve) => setTimeout(resolve, 300)),
          tokenSelectorButtonControls.start(
            {
              height: Math.min(
                getExpandedHeightForChainSelectorResults() + 72,
                MAX_SELECTOR_HEIGHT,
              ),
            },
            { ease: 'anticipate' },
          ),
        ])

        setFormEditingMode({ name: 'token', recently: undefined })

        if (tokenSearchRef.current) {
          tokenSearchRef.current.focus()
        }
      }
    }

    const handleChainSelectorClick = async () => {
      if (
        formEditingMode?.name === 'chain' &&
        formEditingMode.recently !== 'opened'
      ) {
        // no-op
        // setFormEditingMode({ name: 'chain', recently: 'closed' })
        // await new Promise((resolve) => setTimeout(resolve, 300))
        // setFormEditingMode(undefined)
      } else if (
        formEditingMode === undefined ||
        formEditingMode.recently === 'closed'
      ) {
        setFormEditingMode({ name: 'chain', recently: 'opened' })
        setTokenSearchValue('')

        await Promise.all([
          new Promise((resolve) => setTimeout(resolve, 300)),
          chainSelectorButtonControls.start(
            {
              height: Math.min(
                getExpandedHeightForChainSelectorResults() + 72,
                MAX_SELECTOR_HEIGHT,
              ),
            },
            { ease: 'anticipate' },
          ),
        ])

        setFormEditingMode({ name: 'chain', recently: undefined })

        if (chainSearchRef.current) {
          chainSearchRef.current.focus()
        }
      }
    }

    const handleTokenSelectorInputBlur = async () => {
      if (STOP_EDITING_ON_BLUR && formEditingMode?.recently !== 'closed') {
        setFormEditingMode({ name: 'token', recently: 'closed' })

        await Promise.all([
          new Promise((resolve) => setTimeout(resolve, 300)),
          await tokenSelectorButtonControls.start({
            height: 48,
          }),
        ])

        setTokenSearchValue('')
        setFormEditingMode(undefined)
      }
    }

    const handleTokenSelectorInputKeyPress = async (
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (event.code === 'Enter' && formEditingMode?.recently !== 'closed') {
        setFormEditingMode({ name: 'token', recently: 'closed' })

        await Promise.all([
          new Promise((resolve) => setTimeout(resolve, 300)),
          await tokenSelectorButtonControls.start({
            height: 48,
          }),
        ])

        setFormEditingMode(undefined)
        setTokenSearchValue('')
        startEditing()
      }
    }

    const handleTokenSelectorInputChange = async (
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
        await new Promise((resolve) => setTimeout(resolve, 10))

        await tokenSelectorButtonControls.start(
          {
            height: Math.min(
              getExpandedHeightForChainSelectorResults() + 72,
              MAX_SELECTOR_HEIGHT,
            ),
          },
          { ease: 'anticipate' },
        )
      }
    }

    const handleChainSelectorInputBlur = async () => {
      if (STOP_EDITING_ON_BLUR && formEditingMode?.recently !== 'closed') {
        setFormEditingMode({ name: 'chain', recently: 'closed' })

        await Promise.all([
          new Promise((resolve) => setTimeout(resolve, 300)),
          await chainSelectorButtonControls.start({
            height: 48,
          }),
        ])

        setTokenSearchValue('')
        setFormEditingMode(undefined)
      }
    }

    const handleChainSelectorInputKeyPress = async (
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (event.code === 'Enter' && formEditingMode?.recently !== 'closed') {
        setFormEditingMode({ name: 'chain', recently: 'closed' })
        setTokenSearchValue('')

        await Promise.all([
          new Promise((resolve) => setTimeout(resolve, 300)),
          chainSelectorButtonControls.start({
            height: 48,
          }),
        ])

        await new Promise((resolve) => setTimeout(resolve, 300))
        setFormEditingMode({ name: 'token', recently: 'opened' })

        await Promise.all([
          new Promise((resolve) => setTimeout(resolve, 300)),
          tokenSelectorButtonControls.start(
            {
              height: Math.min(
                getExpandedHeightForChainSelectorResults() + 72,
                MAX_SELECTOR_HEIGHT,
              ),
            },
            { ease: 'anticipate' },
          ),
        ])

        setFormEditingMode({ name: 'token', recently: undefined })

        if (tokenSearchRef.current) {
          tokenSearchRef.current.focus()
        }
      }
    }

    const handleChainSelectorInputChange = async (
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

        // Maybe requestAnimationFrame?
        await new Promise((resolve) => setTimeout(resolve, 10))

        await chainSelectorButtonControls.start(
          {
            height: Math.min(
              getExpandedHeightForChainSelectorResults() + 72,
              MAX_SELECTOR_HEIGHT,
            ),
          },
          { ease: 'anticipate' },
        )
      }
    }

    const focusChainSearch = useCallback(() => {
      chainSearchRef.current?.focus()
    }, [chainSearchRef])

    const focusTokenSearch = useCallback(() => {
      tokenSearchRef.current?.focus()
    }, [tokenSearchRef])

    const handleLastElementViewportEnter = useCallback(() => {
      setChainSelectorOverflow(false)
    }, [])

    const handleLastElementViewportLeave = useCallback(() => {
      setChainSelectorOverflow(true)
    }, [])

    const tokenSelectorSearchResultElements = tokenSelectorSearchResults.map(
      ({ symbol, title }, index) => (
        <motion.div
          onViewportEnter={
            index === tokenSelectorSearchResults.length
              ? handleLastElementViewportEnter
              : undefined
          }
          onViewportLeave={
            index === tokenSelectorSearchResults.length
              ? handleLastElementViewportLeave
              : undefined
          }
          className={cx('flex items-center gap-2 rounded-xl px-2', {
            'bg-zinc-500': index === 0,
          })}
          key={`${symbol}${index}`}
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
        </motion.div>
      ),
    )

    const formCard = (
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
          <div
            className={cx(
              'relative max-h-64 overflow-hidden rounded-xl transition-shadow',
              {
                'super-shadow-2':
                  formEditingMode?.name === 'chain' &&
                  formEditingMode.recently !== 'closed' &&
                  tokenSelectorSearchResults.length > 5 &&
                  chainSelectorOverflow,
              },
            )}
          >
            <motion.button
              onClick={handleChainSelectorClick}
              className={cx(
                'w-full text-left bg-zinc-600 p-2 rounded-xl group relative flex flex-col focus:outline focus:outline-offset-[-4px] focus:outline-2 focus:outline-sky-600/50',
                {
                  'z-30': formEditingMode?.name === 'chain',
                  'hover:bg-zinc-500/75 active:bg-zinc-500/50 cursor-pointer':
                    formEditingMode?.name !== 'chain' ||
                    formEditingMode.recently === 'closed',
                },
              )}
            >
              <motion.div
                ref={chainSelectorContainerRef}
                initial={{ height: 48 }}
                animate={chainSelectorButtonControls}
                className={'w-full'}
              >
                <div className="h-0 relative">
                  <motion.div
                    className={cx(
                      'w-full absolute flex justify-between pointer-events-none',
                      {
                        'group-hover:pointer-events-auto': !(
                          formEditingMode?.name === 'chain' &&
                          formEditingMode.recently !== 'closed'
                        ),
                      },
                    )}
                    animate={{
                      opacity:
                        formEditingMode?.name === 'chain' &&
                        formEditingMode.recently !== 'closed'
                          ? 0
                          : 1,
                    }}
                    transition={{
                      duration: 0.1,
                      delay:
                        formEditingMode?.name === 'chain' &&
                        formEditingMode.recently === 'closed'
                          ? 0.1
                          : 0,
                    }}
                  >
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

                        <div className="text-zinc-300 group-hover:text-zinc-200 group-active:text-zinc-200/75 font-medium">
                          Ethereum
                        </div>
                      </div>
                    </div>

                    <div
                      className={cx(
                        'invisible pointer-events-none group-hover:visible flex items-center gap-1',
                        {
                          'group-hover:pointer-events-auto': !(
                            formEditingMode?.name === 'chain' &&
                            formEditingMode.recently !== 'closed'
                          ),
                        },
                      )}
                    >
                      <div className="text-sm font-light text-zinc-300 group-active:text-zinc-300/75 user-select-none">
                        click to edit
                      </div>

                      <PencilSquareIcon className="text-zinc-300 group-active:text-zinc-300/75 w-4 h-4" />
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  className=""
                  animate={{
                    opacity:
                      formEditingMode?.name === 'chain' &&
                      formEditingMode.recently !== 'closed'
                        ? 1
                        : 0,
                  }}
                  transition={{
                    duration: 0.1,
                    delay:
                      formEditingMode?.name === 'chain' &&
                      formEditingMode.recently === 'opened'
                        ? 0.1
                        : 0,
                  }}
                >
                  <div className="space-y-2 w-full mb-2">
                    <div className="text-xs text-zinc-200 font-light">
                      SELECT CHAIN
                    </div>

                    <motion.div
                      className="w-full flex items-stretch bg-zinc-500/25 rounded-md overflow-hidden"
                      onClick={focusChainSearch}
                    >
                      <motion.input
                        ref={chainSearchRef}
                        type="text"
                        placeholder="Search chain..."
                        className="relative font-bold border-none flex-auto overflow-hidden overflow-ellipsis placeholder-low-emphesis focus:placeholder-primary focus:placeholder:text-low-emphesis focus:outline focus:outline-2 focus:outline-offset-[-4px] focus:outline-sky-600/50 flex-grow text-left bg-transparent placeholder:text-zinc-400 text-zinc-200 rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:!bg-transparent w-10/12 px-1 mx-1 rounded-md"
                        onBlur={handleChainSelectorInputBlur}
                        onKeyPress={handleChainSelectorInputKeyPress}
                        onChange={handleChainSelectorInputChange}
                        tabIndex={
                          formEditingMode?.name !== 'chain' ? -1 : undefined
                        }
                        value={tokenSearchValue}
                        transition={{ ease: 'anticipate' }}
                      />

                      <motion.button
                        tabIndex={
                          formEditingMode?.name === 'chain' &&
                          formEditingMode.recently !== 'closed'
                            ? undefined
                            : -1
                        }
                        className={cx(
                          'w-1/6 flex rounded bg-zinc-500/50 mx-2 my-1 items-center justify-center hover:bg-zinc-500/[0.4] active:opacity-75',
                        )}
                        animate={{
                          scale: tokenSearchValue ? 0 : 1,
                          marginRight: tokenSearchValue ? '-16.666667%' : '8px',
                          marginLeft: tokenSearchValue ? 0 : '8px',
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="inline-block w-6 h-6 rounded-full bg-zinc-500/25 text-zinc-400/50"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.button>
                    </motion.div>
                  </div>

                  {/* TODO: move controls to bigger container */}
                  {/* TODO: offset height to include height of search box and label */}
                  <motion.div className="w-[calc(100%_+_2rem)] max-h-[192px] overflow-y-scroll pr-5 -mr-5">
                    <motion.div className="box-content pl-2 pr-6 -mr-5 flex items-start w-[calc(100%-1rem)] pb-5">
                      <div
                        className="w-full"
                        ref={chainSelectorResultsContainerRef}
                      >
                        {tokenSelectorSearchResultElements}
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.button>
          </div>

          <div
            className={cx(
              'relative max-h-64 overflow-hidden rounded-xl transition-shadow',
              {
                'super-shadow-2':
                  formEditingMode?.name === 'token' &&
                  formEditingMode.recently !== 'closed' &&
                  tokenSelectorSearchResults.length > 5 &&
                  tokenSelectorOverflow,
              },
            )}
          >
            <motion.button
              onClick={handleTokenSelectorClick}
              className={cx(
                'w-full text-left bg-zinc-600 p-2 rounded-xl group relative flex flex-col focus:outline focus:outline-offset-[-4px] focus:outline-2 focus:outline-sky-600/50',
                {
                  'z-30': formEditingMode?.name === 'token',
                  'hover:bg-zinc-500/75 active:bg-zinc-500/50 cursor-pointer':
                    formEditingMode?.name !== 'token' ||
                    formEditingMode.recently === 'closed',
                },
              )}
            >
              <motion.div
                ref={tokenSelectorContainerRef}
                initial={{ height: 48 }}
                animate={tokenSelectorButtonControls}
                className={'w-full'}
              >
                <div className="h-0 relative">
                  <motion.div
                    className={cx(
                      'w-full absolute flex justify-between pointer-events-none',
                      {
                        'group-hover:pointer-events-auto': !(
                          formEditingMode?.name === 'token' &&
                          formEditingMode.recently !== 'closed'
                        ),
                      },
                    )}
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
                          Ethereum
                        </div>
                      </div>
                    </div>

                    <div
                      className={cx(
                        'invisible pointer-events-none group-hover:visible flex items-center gap-1',
                        {
                          'group-hover:pointer-events-auto': !(
                            formEditingMode?.name === 'token' &&
                            formEditingMode.recently !== 'closed'
                          ),
                        },
                      )}
                    >
                      <div className="text-sm font-light text-zinc-300 group-active:text-zinc-300/75 user-select-none">
                        click to edit
                      </div>

                      <PencilSquareIcon className="text-zinc-300 group-active:text-zinc-300/75 w-4 h-4" />
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  className=""
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
                  <div className="space-y-2 w-full mb-2">
                    <div className="text-xs text-zinc-200 font-light">
                      SELECT TOKEN
                    </div>

                    <motion.div
                      className="w-full flex items-stretch bg-zinc-500/25 rounded-md overflow-hidden"
                      onClick={focusTokenSearch}
                    >
                      <motion.input
                        ref={tokenSearchRef}
                        type="text"
                        placeholder="Search token or address..."
                        className="relative font-bold border-none flex-auto overflow-hidden overflow-ellipsis placeholder-low-emphesis focus:placeholder-primary focus:placeholder:text-low-emphesis focus:outline focus:outline-2 focus:outline-offset-[-4px] focus:outline-sky-600/50 flex-grow text-left bg-transparent placeholder:text-zinc-400 text-zinc-200 rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:!bg-transparent w-10/12 px-1 mx-1 rounded-md"
                        onBlur={handleTokenSelectorInputBlur}
                        onKeyPress={handleTokenSelectorInputKeyPress}
                        onChange={handleTokenSelectorInputChange}
                        tabIndex={
                          formEditingMode?.name !== 'token' ? -1 : undefined
                        }
                        value={tokenSearchValue}
                        transition={{ ease: 'anticipate' }}
                      />

                      <motion.button
                        tabIndex={
                          formEditingMode?.name === 'token' &&
                          formEditingMode.recently !== 'closed'
                            ? undefined
                            : -1
                        }
                        className={cx(
                          'w-1/6 flex rounded bg-zinc-500/50 mx-2 my-1 items-center justify-center hover:bg-zinc-500/[0.4] active:opacity-75',
                        )}
                        animate={{
                          scale: tokenSearchValue ? 0 : 1,
                          marginRight: tokenSearchValue ? '-16.666667%' : '8px',
                          marginLeft: tokenSearchValue ? 0 : '8px',
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="inline-block w-6 h-6 rounded-full bg-zinc-500/25 text-zinc-400/50"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.button>
                    </motion.div>
                  </div>

                  {/* TODO: move controls to bigger container */}
                  {/* TODO: offset height to include height of search box and label */}
                  <motion.div className="w-[calc(100%_+_2rem)] max-h-[192px] overflow-y-scroll pr-5 -mr-5">
                    <motion.div className="box-content pl-2 pr-6 -mr-5 flex items-start w-[calc(100%-1rem)] pb-5">
                      <div
                        className="w-full"
                        ref={tokenSelectorResultsContainerRef}
                      >
                        {tokenSelectorSearchResultElements}
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.button>
          </div>

          {amountEditing ? amountInput : amountButton}
        </div>
      </div>
    )

    return (
      <>
        <div className="mx-5 p-2 flex items-center gap-2 justify-between">
          <a
            href="https://fmprotocol.com"
            target="_blank"
            className="p-2 group relative overflow-hidden rounded"
            title="Free Market Protocol"
          >
            <div className="absolute top-0 bottom-0 left-0 right-0 invisible group-hover:visible bg-zinc-800/[0.1] group-active:visible group-active:bg-zinc-800/[0.15] z-10" />
            <Logo className="stroke-zinc-600 w-8 h-8 bg-zinc-100" />
          </a>

          <div className="font-medium text-sm text-zinc-500 flex items-center rounded hover:bg-zinc-800/[0.1] active:bg-zinc-800/[0.15] px-3 cursor-pointer h-8">
            <ChevronLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-zinc-600 text-2xl font-medium max-w-sm mx-auto my-0 text-center">
            Start a deposit
          </h2>

          <h4 className="text-zinc-500 text-sm max-w-sm mx-auto my-0 text-center font-medium">
            When you start a deposit, Free Market will move your funds across
            chains automatically.
          </h4>

          {formCard}

          <div className="px-2 max-w-xs mx-auto relative overflow-hidden">
            <button
              className={cx(
                'w-full text-zinc-200 font-bold bg-sky-600 rounded-xl p-2 text-xl flex justify-center items-center overflow-hidden hover:bg-sky-500/75 active:bg-sky-500/[.55] focus:outline focus:outline-2 focus:outline-offset-[-4px] focus:outline-sky-400/25 shadow-md',
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
