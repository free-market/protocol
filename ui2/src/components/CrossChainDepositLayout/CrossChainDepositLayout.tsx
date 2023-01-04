import Logo from '@component/Logo'
import { PencilSquareIcon } from '@heroicons/react/24/solid'
import { useCallback, useRef } from 'react'
import cx from 'classnames'
import {
  AnimatePresence,
  motion,
  Transition,
  useAnimationControls,
} from 'framer-motion'
import { ChevronLeftIcon } from '@heroicons/react/20/solid'
import '../Layout/super-shadow.css'

import { EditingMode, WalletState } from './types'
import { initialState, useViewModel } from './useViewModel'
import GenericExpandingSelector from '@component/GenericExpandingSelector'

export interface TokenSelectorMenuRef {
  getExpandedHeight: () => number
}

export const CrossChainDepositLayout = (props: {
  submitting?: boolean
  empty?: boolean
  walletState?: WalletState
  initialFormEditingMode?: EditingMode
  initiallyOpen?: boolean
  loadingAllowed?: boolean
}): JSX.Element => {
  const {
    submitting = false,
    empty = false,
    walletState = 'ready',
    initialFormEditingMode,
    initiallyOpen = initialState.open,
    loadingAllowed = initialState.loadingAllowed,
  } = props

  const depositButtonBackgroundControls = useAnimationControls()
  const depositButtonForegroundControls = useAnimationControls()
  const loadingBarControls = useAnimationControls()
  const loadingSpinnerControls = useAnimationControls()
  const chainSelectorButtonControls = useAnimationControls()
  const tokenSelectorButtonControls = useAnimationControls()

  const handleDepositButtonHoverStart = useCallback(() => {
    depositButtonBackgroundControls.start({
      scale: 1.2,
    })
    depositButtonForegroundControls.start({
      scale: 1.2,
    })
  }, [])

  const handleDepositButtonClick = useCallback(async () => {
    dispatch({ name: 'DepositButtonClicked' })
    // setOpen(true)
    // setLoading(true)
    await depositButtonBackgroundControls.start({
      borderRadius: '100%',
    })

    const barAppearance = loadingBarControls.start(
      {
        opacity: 1,
        scale: 1,
        y: 0,
      },
      {
        type: 'spring',
        damping: 20,
        duration: 0.1,
        stiffness: 150,
        bounce: 1,
      },
    )

    void Promise.all([
      barAppearance,
      loadingSpinnerControls.start(
        { rotate: 360 * 2 },
        { ease: [0, 0.4, 0.6, 1], duration: 1.5 },
      ),
    ])

    await barAppearance

    await Promise.all([
      loadingBarControls.start({
        opacity: 0,
        scale: 0.8,
      }),
      depositButtonBackgroundControls.start(
        {
          borderRadius: '12px',
          backgroundColor: '#4b5563',
        },
        {
          ease: 'easeInOut',
          duration: 0.5,
        },
      ),
    ])

    dispatch({ name: 'FormLoaded' })
    // setLoading(false)
    await delay(1000)

    if (chainSelectorRef.current) {
      chainSelectorRef.current.focus({ preventScroll: true })
    }
  }, [])

  const handleDepositButtonHoverEnd = useCallback(() => {
    depositButtonBackgroundControls.start({
      scale: 1,
    })
    depositButtonForegroundControls.start({
      scale: 1,
    })
  }, [])

  const handleBackClick = useCallback(() => {
    dispatch({ name: 'BackButtonClicked' })
    // setOpen(false)
  }, [])

  const vm = useViewModel({
    ...initialState,
    loadingAllowed,
    open: initiallyOpen,
    formEditingMode: initialFormEditingMode,
  })

  const {
    open,
    loading,
    formEditingMode,
    amountEditing,
    tokenSearchValue,
    dispatch,
  } = vm

  const amountInputRef = useRef<HTMLInputElement>(null)
  const chainSelectorRef = useRef<HTMLButtonElement>(null)
  const tokenSelectorRef = useRef<HTMLButtonElement>(null)
  const tokenSelectorContainerRef = useRef<HTMLDivElement>(null)
  const tokenSearchRef = useRef<HTMLInputElement>(null)
  const chainSelectorContainerRef = useRef<HTMLDivElement>(null)
  const chainSearchRef = useRef<HTMLInputElement>(null)
  const tokenSelectorResultsContainerRef = useRef<HTMLDivElement>(null)
  const chainSelectorResultsContainerRef = useRef<HTMLDivElement>(null)

  const startEditing = useCallback(() => {
    dispatch({ name: 'EditingStarted' })
  }, [])

  const onBlur = useCallback(() => {
    dispatch({ name: 'EditingStopped' })
  }, [])

  const baseCardDelay = 0.25
  const baseCardStaggerSpeed = 0.15
  const baseCardTransition: Transition = {
    type: 'spring',
    damping: 20,
    duration: 0.1,
    stiffness: 150,
    bounce: 1,
  }

  const amountButton = (
    <motion.button
      className="w-full text-left bg-stone-600 p-2 rounded-xl group hover:bg-stone-500/75 flex justify-between items-stretch active:bg-stone-500/50 focus:outline focus:outline-2 focus:outline-offset-[-4px] focus:outline-sky-600/50"
      onClick={startEditing}
    >
      <div className="space-y-2">
        <div className="text-xs text-stone-400 font-light group-hover:text-stone-300 group-active:text-stone-300/75">
          AMOUNT
        </div>

        <div className="flex items-center gap-2">
          <div className="text-stone-300 group-hover:text-stone-200 group-active:text-stone-200/75 font-bold">
            10.00
          </div>
        </div>
      </div>

      <div className="invisible pointer-events-none group-hover:pointer-events-auto group-hover:visible flex items-center gap-1">
        <div className="text-sm font-light text-stone-300 group-active:text-stone-300/75">
          click to edit
        </div>

        <PencilSquareIcon className="text-stone-300 group-active:text-stone-300/75 w-4 h-4" />
      </div>
    </motion.button>
  )

  const amountInput = (
    <div className="bg-stone-600 pt-2 rounded-xl group hover:bg-stone-500/75">
      <div className="text-xs text-stone-200 font-light ml-2 group-hover:text-stone-300">
        AMOUNT
      </div>

      <input
        ref={amountInputRef}
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
        className="relative font-bold outline-none border-none flex-auto overflow-hidden overflow-ellipsis placeholder-low-emphesis focus:placeholder-primary focus:placeholder:text-low-emphesis focus:outline-2 flex-grow text-left bg-transparent placeholder:text-stone-400 text-stone-200 rounded-xl px-2 pb-2 pt-8 -mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:!bg-transparent w-full focus:outline focus:outline-2 focus:outline-offset-[-4px] focus:outline-sky-600/50"
        onBlur={onBlur}
      />
    </div>
  )

  const buttonNames: Record<WalletState, string> = {
    'ready': 'Start',
    'insufficient-balance': 'Insufficient Balance',
    'unconnected': 'Connect Wallet',
  }

  const formCard = (
    <motion.div
      layout
      layoutId="foo"
      transition={{
        ease: 'anticipate',
        duration: 1,
        bounce: 1,
        damping: 20,
        stiffness: 100,
      }}
      animate={{ borderRadius: '12px' }}
      className="bg-stone-700 rounded-xl p-2 max-w-sm mx-auto shadow-md relative overflow-hidden"
    >
      <AnimatePresence>
        {formEditingMode?.name === 'token' &&
          formEditingMode.recently !== 'closed' && (
            <motion.div
              layout="position"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="bg-stone-700/75 absolute top-0 right-0 left-0 bottom-0 p-2 group cursor-pointer"
            ></motion.div>
          )}
      </AnimatePresence>
      <AnimatePresence>
        <motion.div className="space-y-2">
          <GenericExpandingSelector
            transition={{
              ...baseCardTransition,
              delay: baseCardDelay + baseCardStaggerSpeed,
            }}
            label="CHAIN"
            name="chain"
            {...{ formEditingMode, tokenSearchValue, dispatch }}
            refs={{
              clickableArea: chainSelectorRef,
              container: chainSelectorContainerRef,
              input: chainSearchRef,
              resultsContainer: chainSelectorResultsContainerRef,
            }}
            controls={{
              selector: chainSelectorButtonControls,
            }}
            nextSelector={{
              type: 'controllable',
              name: 'token',
              refs: {
                input: tokenSearchRef,
              },
              controls: tokenSelectorButtonControls,
            }}
          />

          <GenericExpandingSelector
            transition={{
              ...baseCardTransition,
              delay: baseCardDelay + baseCardStaggerSpeed * 2,
            }}
            label="TOKEN"
            name="token"
            {...{ formEditingMode, tokenSearchValue, dispatch }}
            refs={{
              clickableArea: tokenSelectorRef,
              container: tokenSelectorContainerRef,
              input: tokenSearchRef,
              resultsContainer: tokenSelectorResultsContainerRef,
            }}
            controls={{
              selector: tokenSelectorButtonControls,
            }}
            nextSelector={{
              type: 'focusable',
              focus: startEditing,
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0, y: 200 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              ...baseCardTransition,
              delay: baseCardDelay + baseCardStaggerSpeed * 3,
            }}
          >
            {amountEditing ? amountInput : amountButton}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )

  const baseDelay = 1

  if (open && !loading) {
    return (
      <div className="h-full relative">
        <motion.div className="absolute left-0 right-0 mx-5 p-2 flex items-center gap-2 justify-between">
          <motion.a
            layoutId="link"
            href="https://fmprotocol.com"
            target="_blank"
            className="p-2 group relative overflow-hidden rounded"
            title="Free Market Protocol"
          >
            <div className="absolute top-0 bottom-0 left-0 right-0 invisible group-hover:visible bg-stone-800/[0.1] group-active:visible group-active:bg-stone-800/[0.15] z-10" />
            <Logo className="stroke-stone-600 w-8 h-8" />
          </motion.a>

          <AnimatePresence>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                y: -20,
                transition: {
                  ease: 'anticipate',
                  bounce: 1,
                  stiffness: 500,
                  velocity: 500,
                },
              }}
              transition={{ delay: baseDelay }}
              className="font-medium text-sm text-stone-500 flex items-center rounded hover:bg-stone-800/[0.1] active:bg-stone-800/[0.15] px-3 cursor-pointer h-8 user-select-none"
              onClick={handleBackClick}
            >
              <ChevronLeftIcon className="w-5 h-5" />
              <span>Back</span>
            </motion.button>
          </AnimatePresence>
        </motion.div>

        <div className="min-h-[512px] pb-8">
          <div className="h-full flex items-start justify-center">
            <div className="space-y-4 mt-16">
              <AnimatePresence>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: baseDelay + 0.2, duration: 2 }}
                  className="text-stone-600 text-2xl font-medium max-w-sm mx-auto my-0 text-center"
                >
                  Start a deposit
                </motion.h2>

                <motion.h4
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: baseDelay + 0.4, duration: 2 }}
                  className="text-stone-500 text-sm max-w-sm mx-auto my-0 text-center font-medium"
                >
                  When you start a deposit, Free Market will move your funds
                  across chains automatically.
                </motion.h4>

                {formCard}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: baseDelay + 0.6, duration: 1 }}
                  className="px-2 max-w-xs mx-auto relative"
                >
                  <button
                    className={cx(
                      'w-full text-stone-100 font-bold bg-sky-600 rounded-xl p-2 text-xl flex justify-center items-center overflow-hidden hover:bg-sky-500/75 active:bg-sky-500/[.55] focus:outline focus:outline-2 focus:outline-offset-[-4px] focus:outline-sky-400/25 shadow-md',
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
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full relative">
      <motion.div className="absolute left-0 right-0 mx-5 p-2 flex items-center gap-2 justify-between">
        <motion.a
          layoutId="link"
          href="https://fmprotocol.com"
          target="_blank"
          className="p-2 group relative overflow-hidden rounded"
          title="Free Market Protocol"
        >
          <div className="absolute top-0 bottom-0 left-0 right-0 invisible group-hover:visible bg-stone-800/[0.1] group-active:visible group-active:bg-stone-800/[0.15] z-10" />
          <Logo
            className="stroke-stone-600 w-8 h-8"
            preserveAspectRatio="xMidYMid meet"
          />
        </motion.a>

        <AnimatePresence />
      </motion.div>
      <div className="min-h-[512px] flex items-center justify-center">
        <motion.button
          layout
          onHoverStart={loading ? undefined : handleDepositButtonHoverStart}
          onHoverEnd={loading ? undefined : handleDepositButtonHoverEnd}
          whileTap={{ scale: loading ? 0.9 : 0.8 }}
          onClick={handleDepositButtonClick}
          className="w-24 h-24 relative rounded-full"
          tabIndex={-1}
        >
          <motion.div
            animate={depositButtonForegroundControls}
            className="absolute font-medium text-stone-300 w-24 h-24 flex items-center justify-center z-10 pointer-events-none user-select-none overflow-hidden rounded-full"
          >
            <AnimatePresence mode="wait" initial>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, y: 50 }}
                  animate={loadingBarControls}
                  transition={{
                    type: 'spring',
                    damping: 20,
                    duration: 0.1,
                    stiffness: 150,
                    bounce: 1,
                  }}
                >
                  <div className="w-[5.25rem] h-[5.25rem] rounded-full bg-stone-500 flex items-center justify-center rotate-45">
                    <AnimatePresence>
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={loadingSpinnerControls}
                        className="border-2 border-transparent inline-block w-[4.5rem] h-[4.5rem] border-[6px] rounded-full border-l-stone-400"
                      />
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {!loading && (
                <motion.span
                  className="user-select-none"
                  key="deposit"
                  layout="position"
                  initial={{ opacity: 0, scale: 1, y: 30 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: { delay: 0.3 },
                  }}
                  exit={{ opacity: 0, scale: 0, y: 30 }}
                  transition={{ ease: 'anticipate' }}
                >
                  Deposit
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
          <motion.button
            layout
            layoutId="foo"
            className={cx(
              'bg-stone-600 h-24 w-24 text-stone-300 font-medium shadow-md',
              loading ? 'cursor-progress' : 'cursor-pointer',
            )}
            whileHover={
              loading
                ? undefined
                : {
                    // scale: 1.2,
                    rotate: 90,
                  }
            }
            whileTap={
              loading
                ? undefined
                : {
                    // scale: 0.8,
                    rotate: -90,
                    borderRadius: '100%',
                  }
            }
            initial={{ borderRadius: loading ? '100%' : '24%' }}
            animate={depositButtonBackgroundControls}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
          ></motion.button>
        </motion.button>
      </div>
    </div>
  )
}

function delay(d: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, d))
}
