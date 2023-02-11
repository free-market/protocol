import { PencilSquareIcon } from '@heroicons/react/24/solid'
import {
  forwardRef,
  RefObject,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import cx from 'classnames'
import { AnimationControls, motion, Transition } from 'framer-motion'
import '../Layout/super-shadow.css'
import { Action, EditingMode } from '@component/DepositFlowStateProvider/types'
import { useDepositFlowState } from '@component/DepositFlowStateProvider/useDepositFlowState'

const ANIMATE_HIGHLIGHT = false

const MAX_SELECTOR_HEIGHT = 240

// use this to debug the editing state
// TODO: when this is 'true', the search button is not usable because the input becomes blurred
const STOP_EDITING_ON_BLUR = false

export interface GenericExpandingSelectorRef {
  close: () => Promise<void>
}

export type SelectorChoice = {
  address: string | number
  symbol: string
  title: string
  icon: {
    url: string
  }
}

const SearchResult = (props: {
  closeParent: () => Promise<void>
  results: SelectorChoice[]
  selector: { name: string }
  index: number
  address: string | number
}): JSX.Element => {
  const {
    dispatch,
    highlightedSelectorResult: highlightedChoice,
    formEditingMode,
    selectorRecentlyChanged,
  } = useDepositFlowState()
  const { closeParent, index, address, selector, results } = props

  const {
    symbol,
    title,
    icon: { url },
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  } = results.find((r) => r.address === address)!

  const handleHoverStart = useCallback(() => {
    if (formEditingMode?.recently === undefined) {
      dispatch({
        name: 'SelectorResultHoverStarted',
        selector,
        result: { address },
      })
    }
  }, [dispatch, formEditingMode?.recently])

  const handleClick = useCallback(async () => {
    dispatch({
      name: 'SelectorResultClicked',
      selector,
      result: { address },
    })

    await closeParent()
  }, [dispatch, closeParent])

  return (
    <>
      <motion.button
        tabIndex={-1}
        onHoverStart={handleHoverStart}
        onClick={handleClick}
        className={cx(
          'flex items-center gap-2 rounded-full px-2 w-full relative hover:bg-stone-400/25 group',
        )}
        key={`${symbol}${index}`}
      >
        {(formEditingMode?.recently === undefined ||
          !selectorRecentlyChanged) &&
        ANIMATE_HIGHLIGHT
          ? formEditingMode?.name === selector.name &&
            (highlightedChoice
              ? highlightedChoice.address === address
              : index === 0) && (
              <motion.div
                layout={
                  formEditingMode.recently === undefined
                    ? 'position'
                    : undefined
                }
                layoutId={`${selector.name}-highlight`}
                transition={{ duration: 0.1 }}
                id="fmp-selector-highlight"
                className="absolute inset-0 rounded-full bg-stone-500 group-active:bg-stone-500/50"
              />
            )
          : formEditingMode?.name === selector.name &&
            (highlightedChoice
              ? highlightedChoice.address === address
              : index === 0) && (
              <div className="absolute inset-0 rounded-full bg-stone-500 group-active:bg-stone-500/50" />
            )}
        <div className="rounded-full overflow-hidden w-4 h-4 bg-stone-500 relative z-20">
          <img className="w-full h-full" src={url} />
        </div>
        <div className="text-stone-300 relative z-20">
          <span className="font-medium">{symbol}</span>{' '}
          <span className="text-stone-400">
            <span className="text-sm">{title}</span>
          </span>
        </div>
      </motion.button>
    </>
  )
}

export const GenericExpandingSelector = forwardRef(
  (
    props: {
      extraContent?: React.ReactNode
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
              clickableArea: RefObject<HTMLButtonElement>
            }
          }
        | { type: 'focusable'; focus: () => void }
      formEditingMode?: EditingMode
      searchValue: string
      dispatch: (action: Action) => void
      transition: Transition
      selectedChoice?: { address: string | number }
      choices?: SelectorChoice[]
    },
    ref: React.Ref<GenericExpandingSelectorRef>,
  ): JSX.Element => {
    const { highlightedSelectorResult: highlightedChoice, selectedChain } =
      useDepositFlowState()

    const {
      extraContent,
      label,
      name,
      formEditingMode,
      searchValue,
      dispatch,
      refs,
      controls,
      nextSelector,
      transition,
      choices = [
        {
          address: '0x0',
          symbol: 'ETH',
          title: 'Ether',
          icon: { url: 'https://app.aave.com/icons/tokens/eth.svg' },
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          symbol: 'WETH',
          title: 'Wrapped Ether',
          icon: { url: 'https://app.aave.com/icons/tokens/weth.svg' },
        },
        {
          address:
            selectedChain.address === 43113
              ? '0x4A0D1092E9df255cf95D72834Ea9255132782318'
              : '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          symbol: 'USDC',
          title: 'USD Coin',
          icon: { url: 'https://app.aave.com/icons/tokens/usdc.svg' },
        },
        {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          symbol: 'DAI',
          title: 'Dai Stablecoin',
          icon: { url: 'https://app.aave.com/icons/tokens/dai.svg' },
        },
        {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          symbol: 'USDT',
          title: 'Tether USD',
          icon: { url: 'https://app.aave.com/icons/tokens/usdt.svg' },
        },
        {
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          symbol: 'wBTC',
          title: 'Wrapped BTC',
          icon: { url: 'https://app.aave.com/icons/tokens/wbtc.svg' },
        },
      ],
      selectedChoice = { address: choices[0].address },
    } = props

    let expandedSelectedChoice = choices.find(
      (c) => c.address === selectedChoice.address,
    )

    if (expandedSelectedChoice == null) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expandedSelectedChoice = choices[0]!
    }

    const selectorSearchResults = choices.filter(
      ({ symbol, title }) =>
        symbol.toLowerCase().includes(searchValue.toLowerCase()) ||
        title.toLowerCase().includes(searchValue.toLowerCase()),
    )

    const [selectorOverflow, setSelectorOverflow] = useState(true)

    const getExpandedHeightForSelectorResults = () =>
      refs.resultsContainer.current?.scrollHeight ?? 0

    const scrollableRef = useRef<HTMLDivElement>(null)

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
          selector: { name, highlightedResult: choices[0] },
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

        if (scrollableRef.current) {
          scrollableRef.current.scrollTop = 0
        }

        dispatch({
          name: 'SelectorRecentlyOpened',
          selector: { name, highlightedResult: choices[0] },
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
              type: 'spring',
              duration: 0.1,
              stiffness: 200,
              mass: 1,
              damping: 15,
              // type: 'inertia',
              // velocity: 1000,
              // bounceStiffness: 500,
              // power: 1,
              // bounceDamping: 15,
              // restDelta: 0.5,
              // max: MAX_SELECTOR_HEIGHT,
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

    const makeSelection = async () => {
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
          if (nextSelector.refs.clickableArea?.current) {
            nextSelector.refs.clickableArea.current.focus({
              preventScroll: true,
            })
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
          dispatch({ name: 'SelectorClosed', selector: { name } })
        }
      } else {
        dispatch({ name: 'SelectorClosed', selector: { name } })
      }
    }

    useImperativeHandle(
      ref,
      () => ({
        close: makeSelection,
      }),
      [dispatch, nextSelector],
    )

    const handleSelectorInputKeyPress = async (
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (event.code === 'Enter' && formEditingMode?.recently !== 'closed') {
        if (highlightedChoice) {
          dispatch({
            name: 'SelectorResultClicked',
            selector: { name },
            result: highlightedChoice,
          })
        }

        await makeSelection()
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

      // TODO(FMP-368): check for up arrow and down arrow
      if (event.code === 'Tab') {
        event.preventDefault()

        const tmpResults = choices.filter(
          ({ symbol, title }) =>
            symbol.toLowerCase().includes(searchValue.toLowerCase()) ||
            title.toLowerCase().includes(searchValue.toLowerCase()),
        )

        const currentHighlightIndex = tmpResults.findIndex(
          (r) => r.address === highlightedChoice?.address,
        )

        let nextResult: { address: string | number } | undefined

        if (!event.shiftKey) {
          nextResult = tmpResults[currentHighlightIndex + 1]
        } else {
          nextResult = tmpResults[currentHighlightIndex - 1]
        }

        if (nextResult) {
          dispatch({
            name: 'HighlightMoved',
            selector: {
              name,
              highlightedResult: { address: nextResult.address },
            },
          })

          await delay(200)

          const highlight: HTMLDivElement | null = document.querySelector(
            '#fmp-selector-highlight',
          )

          const scrollable = scrollableRef.current

          if (highlight == null || scrollable == null) {
            return
          }

          const offset = (highlight?.parentElement?.offsetTop ?? 0) - 72

          const scrollTop = scrollable.scrollTop ?? 0

          if (
            event.shiftKey
              ? offset < scrollable.scrollHeight - 200
              : offset > 100 && scrollTop < scrollable.scrollHeight - 200
          ) {
            scrollable.scrollTop = offset
          }
        }
      }
    }

    const handleSelectorInputChange = async (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const oldValue = searchValue
      let newValue: string

      if (event.target.value.trim() === '') {
        newValue = ''
      } else {
        newValue = event.target.value
      }

      if (oldValue !== newValue) {
        const tmpResults = choices.filter(
          ({ symbol, title }) =>
            symbol.toLowerCase().includes(newValue.toLowerCase()) ||
            title.toLowerCase().includes(newValue.toLowerCase()),
        )

        const highlightChanges = !tmpResults.some(
          (r) => r.address === highlightedChoice?.address,
        )

        dispatch({
          name: 'SelectorInputRecentlyChanged',
          selector: {
            name,
            highlightedResult: highlightChanges ? tmpResults[0] : undefined,
          },
          value: newValue,
        })

        // Maybe requestAnimationFrame?
        await delay(10)

        setSelectorOverflow(tmpResults.length > 5)

        await controls.selector.start(
          {
            height: Math.min(
              getExpandedHeightForSelectorResults() + 68,
              MAX_SELECTOR_HEIGHT,
            ),
          },
          { ease: 'anticipate' },
        )

        dispatch({
          name: 'SelectorInputChanged',
        })
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

    const tokenSelectorSearchResultElements = selectorSearchResults.map(
      ({ symbol, title, address }, index) => (
        <>
          <SearchResult
            closeParent={makeSelection}
            key={address}
            selector={{ name }}
            results={selectorSearchResults}
            {...{ symbol, title, index, address }}
          />
          {index === selectorSearchResults.length - 1 && (
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
          'relative max-h-64 overflow-hidden rounded transition-shadow',
          {
            'super-shadow-2':
              formEditingMode?.name === name &&
              formEditingMode.recently !== 'closed' &&
              selectorSearchResults.length > 5 &&
              selectorOverflow,
          },
        )}
      >
        <motion.div
          className={cx(
            'absolute inset-0 w-full text-left bg-stone-600 p-2 rounded group relative flex flex-col focus:outline focus:outline-offset-[-4px] focus:outline-2 focus:outline-sky-600/50',
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
            <div
              className={cx('absolute inset-0', {
                'z-30':
                  nextSelector?.type === 'controllable' &&
                  formEditingMode?.name === nextSelector.name,
              })}
            >
              <motion.button
                ref={refs.clickableArea}
                onClick={handleSelectorClick}
                className={cx(
                  'w-full absolute flex justify-between text-left cursor-pointer items-stretch focus:outline focus:outline-offset-[-4px] focus:outline-2 focus:outline-sky-600/50 p-2 inset-0',
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
                        src={expandedSelectedChoice.icon.url}
                      />
                    </div>

                    <div className="text-stone-300 group-hover:text-stone-200 group-active:text-stone-200/75 font-medium">
                      {expandedSelectedChoice.title}
                    </div>
                  </div>
                </div>

                <div
                  className={cx(
                    'invisible relative pointer-events-none group-hover:visible flex items-center gap-1',
                    {
                      'group-hover:pointer-events-auto': !(
                        formEditingMode?.name === name &&
                        formEditingMode.recently !== 'closed'
                      ),
                    },
                  )}
                >
                  <div className="visible group-hover:invisible absolute right-0 top-0 bottom-0 text-stone-400 group-hover:text-stone-200 group-active:text-stone-200/75 font-medium text-xs leading-none flex items-end">
                    <span className="leading-none py-1 min-w-[10em] text-right">
                      {extraContent}
                    </span>
                  </div>
                  <div className="text-sm font-light text-stone-300 group-active:text-stone-300/75 user-select-none">
                    click to edit
                  </div>

                  <PencilSquareIcon className="text-stone-300 group-active:text-stone-300/75 w-4 h-4" />
                </div>
              </motion.button>
            </div>

            <motion.div
              className={cx('relative', {
                'z-20': formEditingMode?.name === name,
              })}
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
                    tabIndex={-1}
                    value={searchValue}
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
                      scale: searchValue ? 0 : 1,
                      marginRight: searchValue ? '-16.666667%' : '8px',
                      marginLeft: searchValue ? 0 : '8px',
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
              <motion.div
                ref={scrollableRef}
                id={`fmp-selector-scrollable-${name}`}
                className="w-[calc(100%_+_2rem)] max-h-[192px] overflow-y-scroll pr-5 -mr-5"
              >
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
