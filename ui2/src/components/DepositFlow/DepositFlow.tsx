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
import Confetti from 'react-confetti'

import { WalletState } from '@component/DepositFlowStateProvider/types'
import { useDepositFlowState } from '@component/DepositFlowStateProvider/useDepositFlowState'
import GenericExpandingSelector, {
  SelectorChoice,
} from '@component/GenericExpandingSelector'
import { GenericExpandingSelectorRef } from '@component/GenericExpandingSelector/GenericExpandingSelector'
import CrossChainJobCard from '@component/CrossChainJobCard'
import FeePreview from '@component/FeePreview'

type SourceNetworkAddress = 10 | 5

export type DepositFlowProps = {
  layout?: 'default' | 'iframe'
  networkChoices?: SelectorChoice[]
  walletState?: WalletState
  balanceState?: 'loading' | 'hidden' | 'displayed'
  balance?: string
  onClick?: () => void
  onAmountChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const defaultNetworkChoices: SelectorChoice[] = [
  {
    address: 1,
    symbol: 'Ethereum',
    title: 'Ethereum',
    icon: { url: 'https://app.aave.com/icons/tokens/eth.svg' },
  },
  {
    address: 0x38, // 56 in decimal
    symbol: 'BNB Smart Chain',
    title: 'BNB Smart Chain',
    icon: { url: 'https://app.aave.com/icons/tokens/busd.svg' },
  },
  {
    address: 43114,
    symbol: 'Avalanche',
    title: 'Avalanche',
    icon: {
      url: 'https://app.aave.com/icons/networks/avalanche.svg',
    },
  },
  {
    address: 137,
    symbol: 'Polygon Matic',
    title: 'Polygon Matic',
    icon: {
      url: 'https://app.aave.com/icons/networks/polygon.svg',
    },
  },
  {
    address: 42161,
    symbol: 'Arbitrum One',
    title: 'Arbitrum One',
    icon: {
      url: 'https://app.aave.com/icons/networks/arbitrum.svg',
    },
  },
  {
    address: 10,
    symbol: 'Optimism',
    title: 'Optimism',
    icon: {
      url: 'https://app.aave.com/icons/networks/optimism.svg',
    },
  },
  {
    address: 250,
    symbol: 'Fantom Opera',
    title: 'Fantom Opera',
    icon: { url: 'https://app.aave.com/icons/networks/fantom.svg' },
  },
]

export const DepositFlow = (props: DepositFlowProps): JSX.Element => {
  const {
    walletState = 'ready',
    balanceState = 'hidden',
    balance,
    onClick,
    onAmountChange = () => {
      // no-op
    },
    layout = 'default',
  } = props

  const depositButtonBackgroundControls = useAnimationControls()
  const depositButtonForegroundControls = useAnimationControls()
  const loadingBarControls = useAnimationControls()
  const loadingSpinnerControls = useAnimationControls()
  const chainSelectorButtonControls = useAnimationControls()
  const tokenSelectorButtonControls = useAnimationControls()

  const amountInputRef = useRef<HTMLInputElement>(null)
  const chainSelectorRef = useRef<GenericExpandingSelectorRef>(null)
  const chainSelectorClickableAreaRef = useRef<HTMLButtonElement>(null)
  const tokenSelectorRef = useRef<GenericExpandingSelectorRef>(null)
  const tokenSelectorClickableAreaRef = useRef<HTMLButtonElement>(null)
  const tokenSelectorContainerRef = useRef<HTMLDivElement>(null)
  const tokenSearchRef = useRef<HTMLInputElement>(null)
  const chainSelectorContainerRef = useRef<HTMLDivElement>(null)
  const chainSearchRef = useRef<HTMLInputElement>(null)
  const tokenSelectorResultsContainerRef = useRef<HTMLDivElement>(null)
  const chainSelectorResultsContainerRef = useRef<HTMLDivElement>(null)

  const handleDepositButtonHoverStart = useCallback(() => {
    depositButtonBackgroundControls.start({
      scale: 1,
    })
    depositButtonForegroundControls.start({
      scale: 1,
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
    if (chainSelectorClickableAreaRef.current) {
      chainSelectorClickableAreaRef.current.focus({ preventScroll: true })
    }
  }, [])

  const handleDepositButtonHoverEnd = useCallback(() => {
    depositButtonBackgroundControls.start({
      scale: 0.8,
    })
    depositButtonForegroundControls.start({
      scale: 0.8,
    })
  }, [])

  const vm = useDepositFlowState()

  const { formEditingMode, amountEditing, tokenSearchValue, dispatch } = vm

  const open = ['open', 'submitting', 'submitted'].includes(vm.flowStep)
  const loading = vm.flowStep === 'loading'

  const handleSelectorShadowClick = useCallback(async () => {
    // TODO(FMP-365):
    // - acquire ref to selector
    // - expose "closeSelector" with useImperativeHandle
    // - check if either token or chain selectors are open
    // - close them with closeSelector instead of emitting
    //   this action
    if (formEditingMode?.name === 'chain') {
      await chainSelectorRef.current?.close()
      dispatch({ name: 'SelectorShadowClicked' })
    }

    if (formEditingMode?.name === 'token') {
      await tokenSelectorRef.current?.close()
      dispatch({ name: 'SelectorShadowClicked' })
    }
  }, [formEditingMode, chainSearchRef, tokenSearchRef])

  const handleBackClick = useCallback(() => {
    dispatch({ name: 'BackButtonClicked' })
  }, [])

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

  const { amount = '0.00' } = vm

  const amountButton = (
    <motion.button
      className="w-full text-left bg-stone-600 p-2 rounded group hover:bg-stone-500/75 flex justify-between items-stretch active:bg-stone-500/50 focus:outline focus:outline-2 focus:outline-offset-[-4px] focus:outline-sky-600/50"
      onClick={startEditing}
    >
      <div className="space-y-2">
        <div className="text-xs text-stone-400 font-light group-hover:text-stone-300 group-active:text-stone-300/75">
          AMOUNT
        </div>

        <div className="flex items-center gap-2">
          <div className="text-stone-300 group-hover:text-stone-200 group-active:text-stone-200/75 font-bold leading-none py-1">
            {amount.length === 0 ? '0.00' : amount}
          </div>
        </div>
      </div>

      <div className="invisible relative pointer-events-none group-hover:pointer-events-auto group-hover:visible flex items-center gap-1">
        <div className="visible group-hover:invisible absolute right-0 top-0 bottom-0 text-stone-400 group-hover:text-stone-200 group-active:text-stone-200/75 font-medium text-xs leading-none flex items-end">
          <span className="leading-none py-1">${vm.amount ?? '0.00'}</span>
        </div>
        <div className="text-sm font-light text-stone-300 group-active:text-stone-300/75">
          click to edit
        </div>

        <PencilSquareIcon className="text-stone-300 group-active:text-stone-300/75 w-4 h-4" />
      </div>
    </motion.button>
  )

  const amountInput = (
    <div className="bg-stone-600 pt-2 rounded group hover:bg-stone-500/75">
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
        className="relative font-bold outline-none border-none flex-auto overflow-hidden overflow-ellipsis placeholder-low-emphesis focus:placeholder-primary focus:placeholder:text-low-emphesis focus:outline-2 flex-grow text-left bg-transparent placeholder:text-stone-400 text-stone-200 rounded px-2 pb-2 pt-8 -mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:!bg-transparent w-full focus:outline focus:outline-2 focus:outline-offset-[-4px] focus:outline-sky-600/50"
        onBlur={onBlur}
        onChange={onAmountChange}
      />
    </div>
  )

  const buttonNames: Record<WalletState, string> = {
    'ready': 'Start',
    'insufficient-balance': 'Insufficient Balance',
    'unconnected': 'Connect Wallet',
    'network-mismatch': 'Switch Network',
  }

  const networkChoices = props.networkChoices ?? defaultNetworkChoices

  const formCard = (
    <motion.div
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
      <AnimatePresence mode="wait">
        {(formEditingMode?.name === 'token' ||
          formEditingMode?.name === 'chain') &&
          formEditingMode.recently !== 'closed' && (
            <motion.div
              onClick={handleSelectorShadowClick}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="bg-stone-700/75 absolute inset-0 p-2 group cursor-pointer z-10 !transform-none"
            ></motion.div>
          )}
        {vm.flowStep === 'submitted' ? (
          <motion.div
            key="submitted"
            layout="position"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="bg-stone-700/75 absolute inset-0 p-2 group cursor-pointer z-40 flex items-center justify-center"
          >
            <motion.span
              initial={{ scale: 5 }}
              animate={{
                scale: 1,
              }}
              exit={{ scale: 5 }}
              transition={{ duration: 0.1 }}
              className="rounded-full"
            >
              <motion.div>
                <motion.div
                  className="flex flex-col items-center justify-center bg-stone-700"
                  style={{
                    boxShadow: 'rgb(68 64 60 / 75%) 0px 0px 20px 20px',
                  }}
                >
                  <motion.svg
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    viewBox="0 0 50 50"
                    className="stroke-emerald-400/90 w-16 h-16"
                  >
                    <motion.path
                      className="stroke-emerald-400/90"
                      fill="none"
                      strokeWidth="3"
                      d="M 0, 20 a 20, 20 0 1,0 40,0 a 20, 20 0 1,0 -40,0"
                      style={{ translateX: 5, translateY: 4 }}
                    />
                    <motion.path
                      className="stroke-emerald-400/90"
                      fill="none"
                      strokeWidth="3"
                      initial={{ pathLength: 0.2 }}
                      animate={{
                        pathLength: 1,
                      }}
                      transition={{ duration: 0.5 }}
                      d="M14,26 L 22,33 L 35,16"
                    />
                  </motion.svg>
                  <motion.div
                    initial={{ y: '50%', opacity: 0 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        delay: 0.5,
                        duration: 0.5,
                        ease: 'easeOut',
                      },
                    }}
                    className="text-emerald-400/90 font-medium text-xl"
                  >
                    Success!
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.span>

            <Confetti
              colors={[
                '#fb923c',
                '#facc15',
                '#a3e635',
                '#38bdf8',
                '#4ade80',
                '#fbbf24',
              ]}
              recycle={false}
              width={384}
              height={224}
              drawShape={(context) => {
                context.fillRect(-5 / 6, -4, 2.5, 8)
              }}
            />
          </motion.div>
        ) : vm.flowStep === 'submitting' ? (
          <motion.div
            key="submitting"
            layout="position"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="bg-stone-700/50 absolute inset-0 p-2 group cursor-pointer z-40 flex items-center justify-center"
          ></motion.div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        <motion.div className="space-y-2">
          <GenericExpandingSelector
            key="chain"
            transition={{
              ...baseCardTransition,
              delay: baseCardDelay + baseCardStaggerSpeed,
            }}
            label="CHAIN"
            name="chain"
            {...{ formEditingMode, searchValue: tokenSearchValue, dispatch }}
            ref={chainSelectorRef}
            refs={{
              clickableArea: chainSelectorClickableAreaRef,
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
                clickableArea: tokenSelectorClickableAreaRef,
              },
              controls: tokenSelectorButtonControls,
            }}
            choices={networkChoices}
            selectedChoice={vm.selectedChain}
          />

          <GenericExpandingSelector
            key="token"
            extraContent={
              {
                displayed: `Balance: ${balance}`,
                hidden: null,
                loading: (
                  <div className="rounded-full h-3 w-[60px] bg-stone-500/50 overflow-hidden shimmer relative after:absolute after:inset-0 after:translate-x-[-100%] after:animate-wave after:content-[''] after:bg-shimmer-gradient"></div>
                ),
              }[balanceState]
            }
            transition={{
              ...baseCardTransition,
              delay: baseCardDelay + baseCardStaggerSpeed * 2,
            }}
            label="TOKEN"
            name="token"
            {...{ formEditingMode, searchValue: tokenSearchValue, dispatch }}
            ref={tokenSelectorRef}
            refs={{
              clickableArea: tokenSelectorClickableAreaRef,
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
            selectedChoice={vm.selectedToken}
            choices={
              vm.selectedChain.address === 10
                ? [
                    {
                      address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
                      symbol: 'USDC',
                      title: 'USDC',
                      icon: {
                        url: 'https://app.aave.com/icons/tokens/usdc.svg',
                      },
                    },
                  ]
                : [
                    {
                      address: '0xDf0360Ad8C5ccf25095Aa97ee5F2785c8d848620',
                      symbol: 'USDC',
                      title: 'USD Coin',
                      icon: {
                        url: 'https://app.aave.com/icons/tokens/usdc.svg',
                      },
                    },
                  ]
            }
          />

          <motion.div
            key="amount"
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

  const buttonDisabled =
    vm.flowStep === 'submitting' ||
    walletState === 'insufficient-balance' ||
    (walletState === 'ready' && vm.amount == null)

  const feePreview = (
    <motion.div
      key="fee-preview"
      initial={{ opacity: 0 }}
      animate={
        vm.flowStep === 'submitted'
          ? { opacity: 0, transition: { duration: 0.5 } }
          : {
              opacity: 1,
              transition: {
                delay: baseDelay + 0.6,
                duration: 1,
              },
            }
      }
      className="px-2 max-w-xs mx-auto relative"
    >
      <FeePreview />
    </motion.div>
  )

  const cta = (
    <motion.div
      key="cta"
      initial={{ opacity: 0 }}
      animate={
        vm.flowStep === 'submitted'
          ? { opacity: 0, transition: { duration: 0.5 } }
          : {
              opacity: 1,
              transition: {
                delay: baseDelay + 0.75,
                duration: 1,
              },
            }
      }
      className="px-2 max-w-xs mx-auto relative"
    >
      <button
        onClick={onClick}
        className={cx(
          'w-full text-stone-100 font-bold bg-sky-600 rounded p-2 text-xl flex justify-center items-center overflow-hidden hover:bg-sky-500/75 active:bg-sky-500/[.55] focus:outline focus:outline-2 focus:outline-offset-[-4px] focus:outline-sky-400/25 shadow-md',
          {
            'cursor-not-allowed opacity-50': buttonDisabled,
          },
        )}
      >
        <div className="h-8">
          <div
            className="transition-all h-8"
            style={{
              marginTop: vm.flowStep === 'submitting' ? -77 : 2,
              height: 'max-content',
            }}
          >
            <div className="flex items-center">{buttonNames[walletState]}</div>
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
  )

  if (
    vm.flowStep === 'started' ||
    vm.flowStep === 'complete' ||
    (open && !loading)
  ) {
    return (
      <div
        className={cx(
          layout === 'iframe' ? 'min-h-508px' : 'min-h-[556px]',
          'h-full relative px-2',
        )}
      >
        {layout === 'default' && (
          <motion.div className="absolute left-0 right-0 mx-5 py-2 flex items-center gap-2 justify-between">
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
              {open && !loading && (
                <motion.button
                  key="button"
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
              )}
            </AnimatePresence>
          </motion.div>
        )}

        <div className="pb-8">
          <AnimatePresence mode="wait">
            {vm.flowStep === 'started' || vm.flowStep === 'complete' ? (
              <motion.div
                key="foo"
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: -20 }}
                className="h-full flex items-center justify-center"
              >
                <div className="mt-32">
                  <CrossChainJobCard
                    sourceNetwork={({5: 'ethereum', 10: 'optimism'} as Record<SourceNetworkAddress, 'optimism' | 'ethereum' | 'avalanche'>)[vm.selectedChain.address as SourceNetworkAddress]}
                    spinnerLocation="status"
                    status={
                      vm.flowStep === 'complete' ? 'completed' : 'sending'
                    }
                    cardTitle="Aave Arbitrum Market V3"
                    sourceTransaction={vm.sourceTransaction}
                    destinationTransaction={vm.destinationTransaction}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="bar"
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex items-start justify-center"
              >
                <div
                  className={cx(
                    'space-y-4',
                    layout === 'iframe' ? 'mt-4' : 'mt-16',
                  )}
                >
                  <AnimatePresence>
                    <motion.h2
                      key={0}
                      initial={{ opacity: 0 }}
                      animate={
                        vm.flowStep === 'submitted'
                          ? { opacity: 0, transition: { duration: 0.5 } }
                          : {
                              opacity: 1,
                              transition: {
                                delay: baseDelay + 0.2,
                                duration: 2,
                              },
                            }
                      }
                      className="text-stone-600 text-2xl font-medium max-w-sm mx-auto my-0 text-center"
                    >
                      Start a deposit
                    </motion.h2>

                    <motion.h4
                      key={1}
                      initial={{ opacity: 0 }}
                      animate={
                        vm.flowStep === 'submitted'
                          ? { opacity: 0, transition: { duration: 0.5 } }
                          : {
                              opacity: 1,
                              transition: {
                                delay: baseDelay + 0.4,
                                duration: 2,
                              },
                            }
                      }
                      className="text-stone-500 text-sm max-w-sm mx-auto my-0 text-center font-medium"
                    >
                      When you start a deposit, Free Market will move your funds
                      across chains automatically.
                    </motion.h4>

                    {formCard}

                    {feePreview}

                    {cta}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cx(
        layout === 'iframe' ? 'min-h-[508px]' : 'min-h-[556px]',
        'flex items-center h-full relative',
      )}
    >
      {layout === 'default' && (
        <motion.div className="absolute left-0 right-0 top-0 mx-5 p-2 flex items-center gap-2 justify-around">
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
        </motion.div>
      )}
      <div className="w-fit mx-auto" style={{ transform: 'scale(1.25)' }}>
        <div className="flex items-center justify-center">
          <motion.button
            layout
            onHoverStart={loading ? undefined : handleDepositButtonHoverStart}
            onHoverEnd={loading ? undefined : handleDepositButtonHoverEnd}
            whileTap={
              { '--fmp-extra-scale': loading ? 0.9 : 0.3 } as Record<
                `--${string}`,
                string | number
              >
            }
            initial={
              { '--fmp-extra-scale': 1 } as Record<
                `--${string}`,
                string | number
              >
            }
            onClick={handleDepositButtonClick}
            className="w-72 h-72 relative rounded-full"
            tabIndex={-1}
          >
            <div style={{ transform: 'scale(var(--fmp-extra-scale))' }}>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={depositButtonForegroundControls}
                className="absolute font-medium text-stone-300 w-72 h-72 flex items-center justify-center z-10 pointer-events-none user-select-none overflow-hidden rounded-full"
              >
                <AnimatePresence mode="wait" initial>
                  {loading && (
                    <motion.div
                      key="loading"
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
                      key="deposit"
                      className="user-select-none"
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
                      <Icon />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
              <motion.button
                layout
                layoutId="foo"
                className={cx(
                  'bg-stone-600 w-72 h-72 text-stone-300 font-medium shadow-md',
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
                initial={{ borderRadius: loading ? '100%' : '24%', scale: 0.8 }}
                animate={depositButtonBackgroundControls}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                }}
              ></motion.button>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function Icon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 5112 1700"
      className="w-64 mx-auto pt-10"
    >
      <mask
        id="mask0_2_13"
        style={{ maskType: 'luminance' }}
        width="2029"
        height="512"
        x="0"
        y="1074"
        maskUnits="userSpaceOnUse"
      >
        <path
          fill="rgb(245 245 244)"
          d="M2028.15 1074H0v512h2028.15v-512z"
        ></path>
      </mask>
      <g>
        <path
          fill="rgb(245 245 244)"
          d="M683.028 1374.51h44.555c0 15.08 7.541 24.9 36.047 24.9 25.873 0 35.052-7.54 35.052-19.34 0-5.89-2.95-10.47-11.462-12.43-8.524-1.97-21.623-3.28-37.685-4.6-23.252-1.97-41.28-5.56-51.101-12.45-9.178-6.55-15.406-18.34-15.406-31.77 0-35.05 36.032-54.39 80.919-54.39 53.079 0 77.324 20.33 77.324 58H797.37c-.329-17.05-8.184-25.89-32.757-25.89-22.278 0-32.113 7.53-32.113 18.68 0 6.87 2.624 12.11 11.802 14.41 8.183 1.96 22.595 3.28 39.968 4.91 19.983 1.97 34.065 3.94 46.182 10.82 10.49 5.89 18.03 18.02 18.03 32.1 0 34.07-29.163 54.06-84.535 54.06-57.001 0-80.919-24.24-80.919-57.01zM884.183 1373.21v-67.48h-23.915v-38.67h19.328c7.54 0 10.161-4.25 11.144-14.08l2.296-22.6h40.951v36.68h51.755v38.67h-51.755v64.86c0 16.72 7.854 21.95 27.508 21.95 6.886 0 17.047-.98 22.61-2.3v37.68c-4.262.98-18.019 3.62-31.448 3.62-50.455 0-68.474-22.28-68.474-58.33z"
        ></path>
        <path
          fill="rgb(245 245 244)"
          fillRule="evenodd"
          d="M1000.15 1382.38c0-26.54 19-45.87 61.92-45.87h52.73v-10.8c0-19.67-11.13-27.54-34.06-27.54-18.67 0-29.49 7.87-29.49 20.97 0 .98 0 3.62.33 6.88h-45.86c-.34-2.61-.67-6.21-.67-9.49 0-32.76 28.84-52.1 77.98-52.1 51.43 0 81.58 22.94 81.58 66.18v98.28h-49.81c.99-8.18 2.3-22.93 2.3-32.75h-.33c-4.92 22.93-23.26 35.38-52.74 35.38-37.68 0-63.88-16.39-63.88-49.14zm114.66-15.72v-3.27h-48.15c-13.44 0-21.62 6.21-21.62 15.39 0 12.44 10.8 19 28.82 19 25.88 0 40.95-11.46 40.95-31.12z"
          clipRule="evenodd"
        ></path>
        <path
          fill="rgb(245 245 244)"
          d="M1187.85 1267.05h49.79l-1.96 46.2h.65c6.88-30.8 24.25-48.82 56.03-48.82 33.09 0 52.43 21.3 52.43 63.23 0 9.18-.99 23.59-1.65 32.11h-45.21c.65-7.86.99-16.05.99-20.96 0-23.59-9.51-33.09-25.23-33.09-21.3 0-36.05 17.35-36.05 53.39v69.78h-49.79v-161.84z"
        ></path>
        <path
          fill="rgb(245 245 244)"
          fillRule="evenodd"
          d="M1537.75 1442.34c0 37.02-33.1 56.68-89.12 56.68-57 0-90.75-15.73-90.75-42.6 0-17.03 11.15-27.52 29.16-29.49v-.32c-9.83-6.22-15.08-15.07-15.08-26.54 0-15.39 7.87-24.89 20-30.47v-.33c-17.05-9.82-26.54-25.87-26.54-46.84 0-36.37 28.18-57.99 75.67-57.99 19 0 34.74 3.28 46.85 9.83l.33-.65c-6.55-5.9-9.49-12.46-9.49-18.36 0-13.42 13.43-21.28 34.07-21.28 8.85 0 13.43.65 18.01 1.64v31.44c-2.95-.65-6.23-.98-9.83-.98-10.48 0-15.4 4.59-15.4 12.11 0 3.94 1.31 8.85 3.61 14.76 5.24 8.18 7.86 18.01 7.86 29.48 0 36.37-28.17 57.65-76.01 57.65-9.82 0-18.66-.97-26.86-2.61-1.3 1.97-2.94 5.9-2.94 10.48 0 7.21 5.89 11.47 15.72 11.47h52.42c36.69 0 58.32 16.05 58.32 42.92zm-49.8 6.88c0-8.85-6.55-13.77-20.97-13.77h-38.33c-13.44 0-21.29 5.58-21.29 14.76 0 12.11 15.08 18.66 40.62 18.66 25.23 0 39.97-6.88 39.97-19.65zm-75.69-126.79c0 16.37 10.81 26.2 28.83 26.2 18.36 0 29.16-9.83 29.16-26.2 0-16.71-10.8-26.54-29.16-26.54-18.02 0-28.83 9.83-28.83 26.54zM1548.88 1382.38c0-26.54 18.99-45.87 61.91-45.87h52.74v-10.8c0-19.67-11.13-27.54-34.06-27.54-18.68 0-29.48 7.87-29.48 20.97 0 .98 0 3.62.31 6.88h-45.85c-.33-2.61-.67-6.21-.67-9.49 0-32.76 28.83-52.1 77.98-52.1 51.43 0 81.57 22.94 81.57 66.18v98.28h-49.8c.99-8.18 2.31-22.93 2.31-32.75h-.34c-4.92 22.93-23.26 35.38-52.74 35.38-37.67 0-63.88-16.39-63.88-49.14zm114.65-15.72v-3.27h-48.14c-13.44 0-21.63 6.21-21.63 15.39 0 12.44 10.81 19 28.82 19 25.89 0 40.95-11.46 40.95-31.12z"
          clipRule="evenodd"
        ></path>
        <path
          fill="rgb(245 245 244)"
          d="M1750.34 1373.21v-67.48h-23.91v-38.67h19.34c7.52 0 10.15-4.25 11.13-14.08l2.29-22.6h40.96v36.68h51.76v38.67h-51.76v64.86c0 16.72 7.86 21.95 27.52 21.95 6.88 0 17.03-.98 22.59-2.3v37.68c-4.25.98-18.02 3.62-31.44 3.62-50.46 0-68.48-22.28-68.48-58.33z"
        ></path>
        <path
          fill="rgb(245 245 244)"
          fillRule="evenodd"
          d="M2028.15 1357.48h-114.99c2.29 26.53 15.72 38 38 38 19.33 0 31.77-6.87 33.09-22.61h43.9c-.98 37.02-31.78 58.65-77.97 58.65-53.73 0-87.15-30.48-87.15-81.91 0-53.41 33.42-85.18 88.13-85.18 45.21 0 76.99 25.89 76.99 78.96v14.09zm-43.89-29.15c0-18.35-12.46-27.84-33.1-27.84-20.97 0-32.75 9.17-36.69 30.46h69.79v-2.62z"
          clipRule="evenodd"
        ></path>
        <mask
          id="mask1_2_13"
          style={{ maskType: 'luminance' }}
          width="513"
          height="512"
          x="0"
          y="1074"
          maskUnits="userSpaceOnUse"
        >
          <path
            fill="rgb(245 245 244)"
            d="M512.003 1074H0v512h512.003v-512z"
          ></path>
        </mask>
        <g style={{ transform: 'translate(116px,14px)' }}>
          <mask
            id="mask2_2_13"
            style={{ maskType: 'luminance' }}
            width="513"
            height="512"
            x="0"
            y="1074"
            maskUnits="userSpaceOnUse"
          >
            <path
              fill="rgb(245 245 244)"
              d="M512.003 1074H0v512h512.003v-512z"
            ></path>
          </mask>
          <g fill="rgb(168 162 158)">
            <path d="M306.775 1094.37l13.626 31.91A264.228 264.228 0 00459.72 1265.6l31.916 13.63c8.352 3.56 15.133 8.67 20.367 14.75-15.893-113.96-106.022-204.1-219.98-219.98 6.071 5.22 11.191 12.01 14.752 20.37zM20.368 1279.23l31.915-13.63a264.292 264.292 0 00139.332-139.32l13.612-31.91c3.574-8.36 8.683-15.15 14.753-20.37C106.023 1089.88 15.894 1180.02 0 1293.98c5.234-6.08 12.015-11.19 20.368-14.75zM491.636 1380.76l-31.916 13.63c-62.664 26.74-112.576 76.67-139.319 139.33l-13.626 31.9c-3.561 8.36-8.681 15.15-14.752 20.38 113.958-15.89 204.087-106.03 219.98-219.99-5.234 6.08-12.015 11.19-20.367 14.75zM205.227 1565.62l-13.612-31.9c-26.757-62.66-76.669-112.59-139.332-139.33l-31.915-13.63c-8.353-3.56-15.134-8.67-20.368-14.75 15.894 113.96 106.023 204.1 219.98 219.99-6.07-5.23-11.179-12.02-14.753-20.38z"></path>
          </g>
          <path
            fill="rgb(245 245 244)"
            d="M139.885 1304.97l15.729-6.72a130.247 130.247 0 0068.659-68.65l6.705-15.73c9.404-22.02 40.634-22.02 50.039 0l6.704 15.73a130.242 130.242 0 0068.66 68.65l15.726 6.72c22.031 9.4 22.031 40.62 0 50.02l-15.726 6.72a130.226 130.226 0 00-68.66 68.66l-6.704 15.71c-9.405 22.03-40.635 22.03-50.039 0l-6.705-15.71a130.231 130.231 0 00-68.659-68.66l-15.729-6.72c-22.028-9.4-22.028-40.62 0-50.02z"
          ></path>
        </g>
      </g>
      <path
        fill="rgb(168 162 158)"
        d="M2272.06 1462.55h71.68v-94.72h88.57v-67.07h-88.57v-94.21h-71.68v94.21h-88.58v67.07h88.58v94.72z"
      ></path>
      <path
        fill="rgb(245 245 244)"
        style={{ transform: 'translate(493px,195px) scale(0.84)' }}
        d="M3157.88 1471H3219v-153h36v-39h-36v-9.38c0-21.37 12.75-23.25 36-22.5V1204c-33-3.38-64.87.37-81.37 16.5-10.13 10.12-15.75 24.75-15.75 44.62V1279h-24.75v39h24.75v153zm116.48 0h61.13v-86.25c0-41.63 24-60 61.5-54.75h1.5v-52.5c-2.63-1.13-6.38-1.5-12-1.5-23.25 0-39 10.12-52.5 33h-1.13v-30h-58.5v192zm233.64 5.63c24.38 0 43.88-6.38 60-17.63 16.88-11.63 28.13-28.13 32.25-45.38h-59.62c-5.25 12-15.75 19.13-31.88 19.13-25.12 0-39.37-16.13-43.12-42h138c.37-39-10.88-72.38-33.75-93.38-16.5-15-38.25-24-65.63-24-58.5 0-98.62 43.88-98.62 101.26 0 58.12 39 102 102.37 102zm-42-122.26c4.13-22.87 16.13-37.5 39.38-37.5 19.87 0 34.12 14.63 36.37 37.5H3466zm251.84 122.26c24.38 0 43.88-6.38 60-17.63 16.88-11.63 28.13-28.13 32.25-45.38h-59.62c-5.25 12-15.75 19.13-31.88 19.13-25.12 0-39.37-16.13-43.12-42h138c.37-39-10.88-72.38-33.75-93.38-16.5-15-38.25-24-65.63-24-58.5 0-98.62 43.88-98.62 101.26 0 58.12 39 102 102.37 102zm-42-122.26c4.13-22.87 16.13-37.5 39.38-37.5 19.87 0 34.12 14.63 36.37 37.5h-75.75zM3833.93 1471h61.13v-107.63c0-22.87 11.25-39 30.37-39 18.38 0 27 12 27 32.63v114h61.13v-107.63c0-22.87 10.87-39 30.37-39 18.38 0 27 12 27 32.63v114h61.13v-124.88c0-43.12-21.75-72.75-65.25-72.75-24.75 0-45.38 10.5-60.38 33.75h-.75c-9.75-20.62-28.87-33.75-54-33.75-27.75 0-46.12 13.13-58.12 33h-1.13V1279h-58.5v192zm382.56 4.88c28.87 0 45.75-10.13 57-26.26h.75c1.5 9.75 3.37 17.25 6.37 21.38h59.25v-2.63c-5.25-3.37-6.75-12-6.75-27.37v-96.75c0-24-7.87-42.75-24.37-54.75-13.88-10.5-33.38-15.75-62.25-15.75-58.13 0-85.5 30.37-87 66h56.25c1.87-16.13 11.62-24.75 31.12-24.75 18.38 0 26.25 8.25 26.25 20.62 0 13.13-12.75 16.88-48.75 21.38-39.75 5.25-73.5 18-73.5 60.37 0 37.88 27.38 58.51 65.63 58.51zm19.5-39.01c-15 0-26.25-6-26.25-21.37 0-14.63 9.75-20.63 33.37-25.88 12.38-3 23.63-6 31.5-10.12v22.87c0 20.63-15.75 34.5-38.62 34.5zm126.75 34.13h61.13v-86.25c0-41.63 24-60 61.5-54.75h1.5v-52.5c-2.63-1.13-6.38-1.5-12-1.5-23.25 0-39 10.12-52.5 33h-1.13v-30h-58.5v192zm143.56 0h60.37v-58.88l18.38-19.5 46.12 78.38h70.88l-75.38-120 67.5-72h-70.5l-57 64.87v-141h-60.37V1471zm288.57 5.63c24.38 0 43.88-6.38 60-17.63 16.88-11.63 28.13-28.13 32.25-45.38h-59.62c-5.25 12-15.75 19.13-31.88 19.13-25.12 0-39.37-16.13-43.12-42h138c.37-39-10.88-72.38-33.75-93.38-16.5-15-38.25-24-65.63-24-58.5 0-98.62 43.88-98.62 101.26 0 58.12 39 102 102.37 102zm-42-122.26c4.13-22.87 16.13-37.5 39.38-37.5 19.87 0 34.12 14.63 36.37 37.5h-75.75zm230.55 118.88c16.5 0 28.13-1.5 33.38-3v-44.63c-2.25 0-8.25.38-13.5.38-13.13 0-21.38-3.75-21.38-18.75v-90h34.88V1279h-34.88v-60.75h-59.62V1279h-25.5v38.25h25.5v103.12c0 41.25 25.5 52.88 61.12 52.88z"
      ></path>
      <path
        stroke="rgb(168 162 158)"
        strokeWidth="58.835"
        d="M2821.82 1571.63c124.71 0 225.81-101.1 225.81-225.81 0-124.72-101.1-225.82-225.81-225.82-124.72 0-225.82 101.1-225.82 225.82 0 124.71 101.1 225.81 225.82 225.81z"
      ></path>
      <path
        stroke="rgb(245 245 244)"
        strokeWidth="58.709"
        d="M2753.12 1476.32c77.22-.82 64.81-63.04 64.11-130.79M2751.42 1335.08h140.79M2891.87 1215.32c-69.08 0-74.14 40.75-74.14 69.12 0 .39-.02 6.06-.02 6.46"
      ></path>
      <path
        fill="rgb(245 245 244)"
        d="M8.75 894h222.5L347.5 702.75h2.5L455 894h236.25l-217.5-338.75 190-301.25H450l-90 165h-2.5l-95-165H30l201.25 303.75L8.75 894z"
      ></path>
      <path
        fill="rgb(168 162 158)"
        d="M981.963 707.75v-522.5h132.497c138.75 0 217.5 105 217.5 267.5 0 163.75-75 255-220 255H981.963zM760.713 894h367.497c112.5 0 202.5-28.75 272.5-81.25 100-76.25 155-202.5 155-360C1555.71 179 1389.46.25 1141.96.25H760.713V894zm1181.347 18.75c81.25 0 146.25-21.25 200-58.75 56.25-38.75 93.75-93.75 107.5-151.25h-198.75c-17.5 40-52.5 63.75-106.25 63.75-83.75 0-131.25-53.75-143.75-140h460c1.25-130-36.25-241.25-112.5-311.25-55-50-127.5-80-218.75-80-195 0-328.75 146.25-328.75 337.5 0 193.75 130 340 341.25 340zm-140-407.5c13.75-76.25 53.75-125 131.25-125 66.25 0 113.75 48.75 121.25 125h-252.5zm526.96 600h203.75v-277.5h2.5c40 53.75 98.75 86.25 181.25 86.25 167.5 0 278.75-132.5 278.75-340 0-192.5-103.75-338.75-273.75-338.75-87.5 0-150 38.75-193.75 96.25h-3.75V254h-195v851.25zm335-348.75c-87.5 0-137.5-71.25-137.5-175s45-182.5 133.75-182.5c87.5 0 128.75 72.5 128.75 182.5 0 108.75-47.5 175-125 175zm712.37 12.5c-88.75 0-135-77.5-135-193.75s46.25-195 135-195 136.25 78.75 136.25 195S3465.14 769 3376.39 769zm1.25 145c206.25 0 341.25-146.25 341.25-338.75s-135-338.75-341.25-338.75c-205 0-342.5 146.25-342.5 338.75S3172.64 914 3377.64 914zm682.62 0c167.5 0 291.25-72.5 291.25-212.5 0-163.75-132.5-192.5-245-211.25-81.25-15-153.75-21.25-153.75-66.25 0-40 38.75-58.75 88.75-58.75 56.25 0 95 17.5 102.5 75h187.5c-10-126.25-107.5-205-288.75-205-151.25 0-276.25 70-276.25 205 0 150 118.75 180 230 198.75 85 15 162.5 21.25 162.5 78.75 0 41.25-38.75 63.75-100 63.75-67.5 0-110-31.25-117.5-95h-192.5c6.25 141.25 123.75 227.5 311.25 227.5zm357.39-20h203.75V254h-203.75v640zm0-728.75h203.75V.25h-203.75v165zm555.26 736.25c55 0 93.75-5 111.25-10V742.75c-7.5 0-27.5 1.25-45 1.25-43.75 0-71.25-12.5-71.25-62.5v-300h116.25V254h-116.25V51.5h-198.75V254h-85v127.5h85v343.75c0 137.5 85 176.25 203.75 176.25zM1457.85 1059.35h24.45v-33.3h.3c4.8 6.45 11.85 10.35 21.75 10.35 20.1 0 33.45-15.9 33.45-40.8 0-23.1-12.45-40.65-32.85-40.65-10.5 0-18 4.65-23.25 11.55h-.45v-9.3h-23.4v102.15zm40.2-41.85c-10.5 0-16.5-8.55-16.5-21s5.4-21.9 16.05-21.9c10.5 0 15.45 8.7 15.45 21.9 0 13.05-5.7 21-15 21zm85.48 1.5c-10.65 0-16.2-9.3-16.2-23.25s5.55-23.4 16.2-23.4c10.65 0 16.35 9.45 16.35 23.4s-5.7 23.25-16.35 23.25zm.15 17.4c24.75 0 40.95-17.55 40.95-40.65 0-23.1-16.2-40.65-40.95-40.65-24.6 0-41.1 17.55-41.1 40.65 0 23.1 16.5 40.65 41.1 40.65zm63.69-2.4h22.65l9.15-34.8c1.65-6 3.45-13.8 3.45-13.8h.3s1.65 7.8 3.3 13.8l9 34.8h22.95l23.55-76.8h-24.15l-8.55 31.8c-1.65 6.15-3.6 15-3.6 15h-.3s-1.95-8.85-3.6-15.45l-8.4-31.35h-20.7l-8.1 31.35c-1.65 6.45-3.45 15.3-3.45 15.3h-.3s-1.8-8.7-3.45-14.85l-8.4-31.8h-24.9l23.55 76.8zm134.65 2.25c9.75 0 17.55-2.55 24-7.05 6.75-4.65 11.25-11.25 12.9-18.15h-23.85c-2.1 4.8-6.3 7.65-12.75 7.65-10.05 0-15.75-6.45-17.25-16.8h55.2c.15-15.6-4.35-28.95-13.5-37.35-6.6-6-15.3-9.6-26.25-9.6-23.4 0-39.45 17.55-39.45 40.5 0 23.25 15.6 40.8 40.95 40.8zm-16.8-48.9c1.65-9.15 6.45-15 15.75-15 7.95 0 13.65 5.85 14.55 15h-30.3zm63.24 46.65h24.45v-34.5c0-16.65 9.6-24 24.6-21.9h.6v-21c-1.05-.45-2.55-.6-4.8-.6-9.3 0-15.6 4.05-21 13.2h-.45v-12h-23.4v76.8zm93.45 2.25c9.75 0 17.55-2.55 24-7.05 6.75-4.65 11.25-11.25 12.9-18.15h-23.85c-2.1 4.8-6.3 7.65-12.75 7.65-10.05 0-15.75-6.45-17.25-16.8h55.2c.15-15.6-4.35-28.95-13.5-37.35-6.6-6-15.3-9.6-26.25-9.6-23.4 0-39.45 17.55-39.45 40.5 0 23.25 15.6 40.8 40.95 40.8zm-16.8-48.9c1.65-9.15 6.45-15 15.75-15 7.95 0 13.65 5.85 14.55 15h-30.3zm93.39 49.05c10.05 0 18-4.8 22.65-12.75h.3V1034h23.4V926.75h-24.45v39.15h-.45c-4.5-6.45-10.65-10.95-21.45-10.95-19.8 0-33.6 16.65-33.6 40.65 0 25.65 13.95 40.8 33.6 40.8zm6.3-19.35c-9.45 0-15.15-8.4-15.15-21.75 0-12.9 5.7-21.9 15.45-21.9 10.65 0 15.9 9.3 15.9 22.2 0 12.6-6 21.45-16.2 21.45zm121.97 19.35c19.8 0 32.7-15.3 32.7-40.8 0-23.1-12.9-40.65-32.85-40.65-10.5 0-17.1 4.35-21.9 10.95h-.45v-39.15h-24.45V1034h23.4v-9.75h.3c4.8 7.95 13.05 12.15 23.25 12.15zm-6.9-19.35c-10.05 0-16.35-8.7-16.35-21.45 0-12.6 5.25-22.05 16.05-22.05 9.9 0 15.15 8.7 15.15 21.9 0 13.35-5.25 21.6-14.85 21.6zm47.46 42.3h15.9c15.45 0 22.8-6.3 28.95-24.3l26.55-77.85h-24.45l-10.05 32.7c-2.4 7.5-4.5 17.7-4.5 17.7h-.3s-2.4-10.2-4.8-17.7l-10.35-32.7h-25.8l22.65 59.1c3.15 8.1 4.65 12.6 4.65 15.9 0 5.25-2.85 8.1-10.05 8.1h-8.4v19.05z"
      ></path>
    </svg>
  )
}
