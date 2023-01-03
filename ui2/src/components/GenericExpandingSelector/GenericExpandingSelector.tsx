/**
 * GenericExpandingSelector
 *
 * !!! DISCLAIMER !!!
 *
 * This is not actually a generic selector yet.
 * It is still only configured to be used as the
 * chain selector. This component is WORK IN PROGRESS.
 *
 * Thank you.
 */

import { PencilSquareIcon } from '@heroicons/react/24/solid'
import {
  forwardRef,
  RefObject,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react'
import cx from 'classnames'
import { AnimationControls, motion, Transition } from 'framer-motion'
import '../Layout/super-shadow.css'
import { Action } from '@component/CrossChainDepositLayout/types'

const MAX_SELECTOR_HEIGHT = 240

// use this to debug the editing state
// TODO: when this is 'true', the search button is not usable because the input becomes blurred
const STOP_EDITING_ON_BLUR = true

export type WalletState = 'ready' | 'insufficient-balance' | 'unconnected'

export type EditingMode = {
  name: 'token' | 'chain'
  recently?: 'opened' | 'closed'
}

export interface TokenSelectorMenuRef {
  getExpandedHeight: () => number
}

export const GenericExpandingSelector = forwardRef(
  (
    props: {
      refs: {
        chainSelector: RefObject<HTMLButtonElement>
        tokenSelector: RefObject<HTMLButtonElement>
        tokenSelectorContainer: RefObject<HTMLDivElement>
        tokenSearch: RefObject<HTMLInputElement>
        chainSelectorContainer: RefObject<HTMLDivElement>
        chainSearch: RefObject<HTMLInputElement>
        chainSelectorResultsContainer: RefObject<HTMLDivElement>
      }
      controls: {
        chainSelectorButton: AnimationControls
        tokenSelectorButton: AnimationControls
      }
      formEditingMode?: EditingMode
      tokenSearchValue: string
      dispatch: (action: Action) => void
    },
    ref: React.Ref<TokenSelectorMenuRef>,
  ): JSX.Element => {
    const { formEditingMode, tokenSearchValue, dispatch, refs, controls } =
      props

    const url = 'https://app.aave.com/icons/tokens/eth.svg'

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
      refs.tokenSelectorContainer.current?.scrollHeight ?? 0
    useImperativeHandle(
      ref,
      () => ({
        getExpandedHeight: getExpandedHeightForTokenSelector,
      }),
      [tokenSearchValue],
    )

    const [chainSelectorOverflow, setChainSelectorOverflow] = useState(
      tokenSelectorSearchResults.length > 5,
    )

    const getExpandedHeightForChainSelector = () =>
      refs.chainSelectorContainer.current?.scrollHeight ?? 0
    useImperativeHandle(
      ref,
      () => ({
        getExpandedHeight: getExpandedHeightForChainSelector,
      }),
      [tokenSearchValue],
    )

    const getExpandedHeightForChainSelectorResults = () =>
      refs.chainSelectorResultsContainer.current?.scrollHeight ?? 0
    useImperativeHandle(
      ref,
      () => ({
        getExpandedHeight: getExpandedHeightForChainSelectorResults,
      }),
      [tokenSearchValue],
    )

    const baseCardDelay = 0.25
    const baseCardStaggerSpeed = 0.15
    const baseCardTransition: Transition = {
      type: 'spring',
      damping: 20,
      duration: 0.1,
      stiffness: 150,
      bounce: 1,
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
        dispatch({
          name: 'SelectorRecentlyOpened',
          selector: { name: 'chain' },
        })

        await Promise.all([
          new Promise((resolve) => setTimeout(resolve, 300)),
          controls.chainSelectorButton.start(
            {
              height: Math.min(
                getExpandedHeightForChainSelectorResults() + 68,
                MAX_SELECTOR_HEIGHT,
              ),
            },
            { ease: 'anticipate' },
          ),
        ])

        dispatch({ name: 'SelectorOpened', selector: { name: 'chain' } })

        if (refs.chainSearch.current) {
          refs.chainSearch.current.focus()
        }
      }
    }

    const handleChainSelectorInputBlur = async () => {
      if (STOP_EDITING_ON_BLUR && formEditingMode?.recently !== 'closed') {
        dispatch({
          name: 'SelectorRecentlyClosed',
          selector: { name: 'chain' },
        })

        await Promise.all([
          new Promise((resolve) => setTimeout(resolve, 300)),
          await controls.chainSelectorButton.start({
            height: 48,
          }),
        ])

        dispatch({ name: 'SelectorClosed', selector: { name: 'chain' } })
      }
    }

    const handleChainSelectorInputKeyPress = async (
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (event.code === 'Enter' && formEditingMode?.recently !== 'closed') {
        if (refs.tokenSelector.current) {
          refs.tokenSelector.current.focus()
        }

        dispatch({
          name: 'SelectorRecentlyClosed',
          selector: { name: 'chain' },
        })

        await Promise.all([
          new Promise((resolve) => setTimeout(resolve, 300)),
          controls.chainSelectorButton.start({
            height: 48,
          }),
        ])

        await new Promise((resolve) => setTimeout(resolve, 300))
        dispatch({
          name: 'SelectorRecentlyOpened',
          selector: { name: 'token' },
        })

        await Promise.all([
          new Promise((resolve) => setTimeout(resolve, 300)),
          controls.tokenSelectorButton.start(
            {
              height: Math.min(
                getExpandedHeightForChainSelectorResults() + 68,
                MAX_SELECTOR_HEIGHT,
              ),
            },
            { ease: 'anticipate' },
          ),
        ])

        dispatch({ name: 'SelectorOpened', selector: { name: 'token' } })

        if (refs.tokenSearch.current) {
          refs.tokenSearch.current.focus()
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
        dispatch({
          name: 'SelectorInputChanged',
          selector: { name: 'chain' },
          value: newValue,
        })

        // Maybe requestAnimationFrame?
        await new Promise((resolve) => setTimeout(resolve, 10))

        await controls.chainSelectorButton.start(
          {
            height: Math.min(
              getExpandedHeightForChainSelectorResults() + 68,
              MAX_SELECTOR_HEIGHT,
            ),
          },
          { ease: 'anticipate' },
        )
      }
    }

    const focusChainSearch = useCallback(() => {
      refs.chainSearch.current?.focus()
    }, [refs.chainSearch])

    const handleLastElementViewportEnter = useCallback(() => {
      setChainSelectorOverflow(false)
    }, [])

    const handleLastElementViewportLeave = useCallback(() => {
      setChainSelectorOverflow(true)
    }, [])

    const tokenSelectorSearchResultElements = tokenSelectorSearchResults.map(
      ({ symbol, title }, index) => (
        <>
          <motion.div
            className={cx('flex items-center gap-2 rounded-xl px-2', {
              'bg-stone-500': index === 0,
            })}
            key={`${symbol}${index}`}
          >
            <div className="rounded-full overflow-hidden w-4 h-4 bg-stone-500">
              <img className="w-full h-full" src={url} />
            </div>
            <div className="text-stone-300">
              <span className="font-medium">{symbol}</span>{' '}
              <span className="text-stone-400">
                <span className="text-sm">{title}</span>
              </span>
            </div>
          </motion.div>
          {index === tokenSelectorSearchResults.length - 1 && (
            <motion.div
              key="foo"
              onViewportEnter={handleLastElementViewportEnter}
              onViewportLeave={handleLastElementViewportLeave}
            />
          )}
        </>
      ),
    )

    const chainSelectorElement = (
      <motion.div
        initial={{ opacity: 0, scale: 0, y: 200 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          ...baseCardTransition,
          delay: baseCardDelay + baseCardStaggerSpeed,
        }}
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
          ref={refs.chainSelector}
          onClick={handleChainSelectorClick}
          className={cx(
            'w-full text-left bg-stone-600 p-2 rounded-xl group relative flex flex-col focus:outline focus:outline-offset-[-4px] focus:outline-2 focus:outline-sky-600/50',
            {
              'z-30': formEditingMode?.name === 'chain',
              'hover:bg-stone-500/75 active:bg-stone-500/50 cursor-pointer':
                formEditingMode?.name !== 'chain' ||
                formEditingMode.recently === 'closed',
            },
          )}
        >
          <motion.div
            ref={refs.chainSelectorContainer}
            initial={{ height: 48 }}
            animate={controls.chainSelectorButton}
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
                  <div className="text-xs text-stone-400 font-light group-hover:text-stone-300 group-active:text-stone-300/75">
                    CHAIN
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="rounded-full overflow-hidden w-4 h-4 bg-stone-500 group-hover:bg-stone-400 group-active:bg-stone-400/75">
                      <img
                        className="w-full h-full group-hover:opacity-[0.95] group-active:opacity-75"
                        src={url}
                      />
                    </div>

                    <div className="text-stone-300 group-hover:text-stone-200 group-active:text-stone-200/75 font-medium">
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
                  <div className="text-sm font-light text-stone-300 group-active:text-stone-300/75 user-select-none">
                    click to edit
                  </div>

                  <PencilSquareIcon className="text-stone-300 group-active:text-stone-300/75 w-4 h-4" />
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
                <div className="text-xs text-stone-200 font-light">
                  SELECT CHAIN
                </div>

                <motion.div
                  className="w-full flex items-stretch bg-stone-500/25 rounded-md overflow-hidden"
                  onClick={focusChainSearch}
                >
                  <motion.input
                    ref={refs.chainSearch}
                    type="text"
                    placeholder="Search chain..."
                    className="relative font-bold border-none flex-auto overflow-hidden overflow-ellipsis placeholder-low-emphesis focus:placeholder-primary focus:placeholder:text-low-emphesis focus:outline focus:outline-2 focus:outline-offset-[-4px] focus:outline-sky-600/50 flex-grow text-left bg-transparent placeholder:text-stone-400 text-stone-200 rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:!bg-transparent w-10/12 px-1 mx-1 rounded-md"
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
                      'w-1/6 flex rounded bg-stone-500/50 mx-2 my-1 items-center justify-center hover:bg-stone-500/[0.4] active:opacity-75',
                    )}
                    animate={{
                      scale: tokenSearchValue ? 0 : 1,
                      marginRight: tokenSearchValue ? '-16.666667%' : '8px',
                      marginLeft: tokenSearchValue ? 0 : '8px',
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="inline-block w-6 h-6 rounded-full bg-stone-500/25 text-stone-400/50"
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
                <motion.div className="box-content pl-2 pr-6 -mr-5 flex items-start w-[calc(100%-1.5rem)] pb-5">
                  <div
                    className="w-full"
                    ref={refs.chainSelectorResultsContainer}
                  >
                    {tokenSelectorSearchResultElements}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.button>
      </motion.div>
    )

    return chainSelectorElement
  },
)
