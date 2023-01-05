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
import { Action, EditingMode } from '@component/CrossChainDepositLayout/types'

const MAX_SELECTOR_HEIGHT = 240

// use this to debug the editing state
// TODO: when this is 'true', the search button is not usable because the input becomes blurred
const STOP_EDITING_ON_BLUR = true

export interface TokenSelectorMenuRef {
  getExpandedHeight: () => number
}

export const GenericExpandingSelector = forwardRef(
  (
    props: {
      label: string
      name: EditingMode['name']
      refs: {
        clickableArea: RefObject<HTMLButtonElement>
        input: RefObject<HTMLInputElement>
        container: RefObject<HTMLDivElement>
        resultsContainer: RefObject<HTMLDivElement>
      }
      controls: {
        selector: AnimationControls
      }
      nextSelector?:
        | {
            type: 'controllable'
            controls: AnimationControls
            name: EditingMode['name']
            refs: {
              input: RefObject<HTMLInputElement>
            }
          }
        | { type: 'focusable'; focus: () => void }
      formEditingMode?: EditingMode
      tokenSearchValue: string
      dispatch: (action: Action) => void
      transition: Transition
    },
    ref: React.Ref<TokenSelectorMenuRef>,
  ): JSX.Element => {
    const {
      label,
      name,
      formEditingMode,
      tokenSearchValue,
      dispatch,
      refs,
      controls,
      nextSelector,
      transition,
    } = props

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

    const [selectorOverflow, setSelectorOverflow] = useState(
      tokenSelectorSearchResults.length > 5,
    )

    const getExpandedHeightForSelector = () =>
      refs.container.current?.scrollHeight ?? 0
    useImperativeHandle(
      ref,
      () => ({
        getExpandedHeight: getExpandedHeightForSelector,
      }),
      [tokenSearchValue],
    )

    const getExpandedHeightForSelectorResults = () =>
      refs.resultsContainer.current?.scrollHeight ?? 0
    useImperativeHandle(
      ref,
      () => ({
        getExpandedHeight: getExpandedHeightForSelectorResults,
      }),
      [tokenSearchValue],
    )

    const handleSelectorClick = async () => {
      if (
        formEditingMode?.name === name &&
        formEditingMode.recently !== 'opened'
      ) {
        if (refs.clickableArea.current) {
          refs.clickableArea.current.focus({ preventScroll: true })
        }

        dispatch({
          name: 'SelectorRecentlyClosed',
          selector: { name },
        })

        await Promise.all([
          controls.selector.start({
            height: 48,
          }),
        ])

        dispatch({ name: 'SelectorClosed', selector: { name } })
      } else if (
        nextSelector?.type === 'controllable' &&
        formEditingMode?.name === nextSelector.name
      ) {
        if (refs.input.current) {
          refs.input.current.focus({ preventScroll: true })
        }

        dispatch({
          name: 'SelectorRecentlyOpened',
          selector: { name },
        })

        await Promise.all([
          nextSelector.controls.start({
            height: 48,
          }),

          controls.selector.start({
            height: Math.min(
              getExpandedHeightForSelectorResults() + 68,
              MAX_SELECTOR_HEIGHT,
            ),
          }),

          dispatch({ name: 'SelectorOpened', selector: { name } }),
        ])
      } else if (
        formEditingMode === undefined ||
        formEditingMode.recently === 'closed'
      ) {
        if (refs.input.current) {
          refs.input.current.focus({ preventScroll: true })
        }

        dispatch({
          name: 'SelectorRecentlyOpened',
          selector: { name },
        })

        await Promise.all([
          controls.selector.start(
            {
              height: Math.min(
                getExpandedHeightForSelectorResults() + 68,
                MAX_SELECTOR_HEIGHT,
              ),
            },
            {
              type: 'inertia',
              velocity: 1000,
              bounceStiffness: 500,
              max: MAX_SELECTOR_HEIGHT,
              power: 1,
              bounceDamping: 15,
              restDelta: 0.5,
            },
          ),
        ])

        dispatch({ name: 'SelectorOpened', selector: { name } })
      }
    }

    const handleSelectorInputBlur = async () => {
      if (STOP_EDITING_ON_BLUR && formEditingMode?.recently !== 'closed') {
        if (nextSelector?.type === 'controllable') {
          // TODO: stop using magic number here
          await delay(10) // wait for the focus to change in case another element has been focused.

          // If the focus has moved to the next selector,
          // it is because the user pressed 'Enter'.
          //
          // There is no need to close the selector.
          if (document.activeElement === nextSelector.refs.input.current) {
            return
          }
        }

        if (refs.clickableArea.current) {
          refs.clickableArea.current.focus({ preventScroll: true })
        }

        dispatch({
          name: 'SelectorRecentlyClosed',
          selector: { name },
        })

        await Promise.all([
          await controls.selector.start({
            height: 48,
          }),
        ])

        dispatch({ name: 'SelectorClosed', selector: { name } })
      }
    }

    const handleSelectorInputKeyPress = async (
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (event.code === 'Enter' && formEditingMode?.recently !== 'closed') {
        if (nextSelector) {
          if (nextSelector.type === 'focusable') {
            nextSelector.focus()

            dispatch({
              name: 'SelectorRecentlyClosed',
              selector: { name },
            })

            await Promise.all([
              delay(300),
              controls.selector.start({
                height: 48,
              }),
            ])

            dispatch({
              name: 'SelectorClosed',
              selector: { name },
            })
          } else if (nextSelector.type === 'controllable') {
            if (nextSelector.refs.input?.current) {
              nextSelector.refs.input.current.focus({ preventScroll: true })
            }

            dispatch({
              name: 'SelectorRecentlyClosed',
              selector: { name },
            })

            await Promise.all([
              delay(300),
              controls.selector.start({
                height: 48,
              }),
            ])

            await delay(300)
            dispatch({
              name: 'SelectorRecentlyOpened',
              selector: { name: nextSelector.name },
            })

            await Promise.all([
              delay(300),
              nextSelector.controls?.start(
                {
                  height: Math.min(
                    getExpandedHeightForSelectorResults() + 68,
                    MAX_SELECTOR_HEIGHT,
                  ),
                },
                {
                  type: 'spring',
                  duration: 0.1,
                  stiffness: 200,
                  mass: 1,
                  damping: 15,
                },
              ),
            ])

            dispatch({ name: 'SelectorOpened', selector: { name: 'token' } })
          }
        } else {
          dispatch({ name: 'SelectorClosed', selector: { name } })
        }
      }
    }

    const handleSelectorInputKeyDown = async (
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (event.code === 'Escape') {
        alert('escape')
        if (refs.clickableArea.current) {
          refs.clickableArea.current.focus({ preventScroll: true })
        }

        dispatch({
          name: 'SelectorRecentlyClosed',
          selector: { name },
        })

        await Promise.all([
          await controls.selector.start({
            height: 48,
          }),
        ])

        dispatch({ name: 'SelectorClosed', selector: { name } })
      }
    }

    const handleSelectorInputChange = async (
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
          selector: { name },
          value: newValue,
        })

        // Maybe requestAnimationFrame?
        await delay(10)

        await controls.selector.start(
          {
            height: Math.min(
              getExpandedHeightForSelectorResults() + 68,
              MAX_SELECTOR_HEIGHT,
            ),
          },
          { ease: 'anticipate' },
        )
      }
    }

    const focusSearch = useCallback(() => {
      refs.input.current?.focus({ preventScroll: true })
    }, [refs.input])

    const handleLastElementViewportEnter = useCallback(() => {
      setSelectorOverflow(false)
    }, [])

    const handleLastElementViewportLeave = useCallback(() => {
      setSelectorOverflow(true)
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

    const selectorElement = (
      <motion.div
        initial={{ opacity: 0, scale: 0, y: 200 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={transition}
        style={{ overscrollBehavior: 'none' }}
        className={cx(
          'relative max-h-64 overflow-hidden rounded-xl transition-shadow',
          {
            'super-shadow-2':
              formEditingMode?.name === name &&
              formEditingMode.recently !== 'closed' &&
              tokenSelectorSearchResults.length > 5 &&
              selectorOverflow,
          },
        )}
      >
        <motion.div
          className={cx(
            'absolute inset-0 w-full text-left bg-stone-600 p-2 rounded-xl group relative flex flex-col focus:outline focus:outline-offset-[-4px] focus:outline-2 focus:outline-sky-600/50',
            {
              'z-30':
                formEditingMode?.name === name ||
                (nextSelector?.type === 'controllable' &&
                  formEditingMode?.name === nextSelector.name),
              'hover:bg-stone-500/75 active:bg-stone-500/50 cursor-pointer':
                formEditingMode?.name !== name ||
                formEditingMode.recently === 'closed',
            },
          )}
        >
          <motion.div
            ref={refs.container}
            initial={{ height: 48 }}
            animate={controls.selector}
            className={'w-full'}
          >
            <div className="absolute inset-0">
              <motion.button
                ref={refs.clickableArea}
                onClick={handleSelectorClick}
                className={cx(
                  'w-full absolute flex justify-between text-left cursor-pointer items-center focus:outline focus:outline-offset-[-4px] focus:outline-2 focus:outline-sky-600/50 p-2 inset-0',
                  {
                    'z-30': formEditingMode === undefined,
                    'z-10': formEditingMode?.name === name,
                    'group-hover:pointer-events-auto': !(
                      formEditingMode?.name === name &&
                      formEditingMode.recently !== 'closed'
                    ),
                  },
                )}
                animate={{
                  opacity:
                    formEditingMode?.name === name &&
                    formEditingMode.recently !== 'closed'
                      ? 0
                      : 1,
                }}
                transition={{
                  duration: 0.1,
                  delay:
                    formEditingMode?.name === name &&
                    formEditingMode.recently === 'closed'
                      ? 0.1
                      : 0,
                }}
              >
                <div className="space-y-2">
                  <div className="text-xs text-stone-400 font-light group-hover:text-stone-300 group-active:text-stone-300/75">
                    {label}
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
                        formEditingMode?.name === name &&
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
              </motion.button>
            </div>

            <motion.div
              className="relative z-20"
              animate={{
                opacity:
                  formEditingMode?.name === name &&
                  formEditingMode.recently !== 'closed'
                    ? 1
                    : 0,
              }}
              transition={{
                duration: 0.1,
                delay:
                  formEditingMode?.name === name &&
                  formEditingMode.recently === 'opened'
                    ? 0.1
                    : 0,
              }}
            >
              <div className="space-y-2 w-full mb-2">
                <div className="text-xs text-stone-200 font-light">
                  SELECT {label}
                </div>

                <motion.div
                  className="w-full flex items-stretch bg-stone-500/25 rounded-md overflow-hidden"
                  onClick={focusSearch}
                >
                  <motion.input
                    ref={refs.input}
                    type="text"
                    placeholder={`Search ${label.toLowerCase()}...`}
                    className="relative font-bold border-none flex-auto overflow-hidden overflow-ellipsis placeholder-low-emphesis focus:placeholder-primary focus:placeholder:text-low-emphesis focus:outline focus:outline-2 focus:outline-offset-[-4px] focus:outline-sky-600/50 flex-grow text-left bg-transparent placeholder:text-stone-400 text-stone-200 rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:!bg-transparent w-10/12 px-1 mx-1 rounded-md"
                    onBlur={handleSelectorInputBlur}
                    onKeyPress={handleSelectorInputKeyPress}
                    onKeyDown={handleSelectorInputKeyDown}
                    onChange={handleSelectorInputChange}
                    tabIndex={formEditingMode?.name !== name ? -1 : undefined}
                    value={tokenSearchValue}
                    transition={{ ease: 'anticipate' }}
                  />

                  <motion.button
                    tabIndex={
                      STOP_EDITING_ON_BLUR
                        ? -1
                        : formEditingMode?.name === name &&
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
                  <div className="w-full" ref={refs.resultsContainer}>
                    {tokenSelectorSearchResultElements}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    )

    return selectorElement
  },
)

function delay(d: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, d))
}
