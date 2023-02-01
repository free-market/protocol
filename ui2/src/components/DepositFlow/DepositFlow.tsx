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

export type DepositFlowProps = {
  networkChoices?: SelectorChoice[]
  walletState?: WalletState
  balanceState?: 'loading' | 'hidden' | 'displayed'
  balance?: string
  onClick?: () => void
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
          <div className="text-stone-300 group-hover:text-stone-200 group-active:text-stone-200/75 font-bold leading-none py-1">
            {vm.amount ?? '0.00'}
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

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    dispatch({ name: 'AmountChanged', value })
  }

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
        onChange={handleAmountChange}
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
              layout="position"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="bg-stone-700/75 absolute inset-0 p-2 group cursor-pointer z-10"
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
              vm.selectedChain.address !== 5
                ? undefined
                : [
                    {
                      address: '0x0',
                      symbol: 'ETH',
                      title: 'Ether',
                      icon: {
                        url: 'https://app.aave.com/icons/tokens/eth.svg',
                      },
                    },
                    {
                      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                      symbol: 'WETH',
                      title: 'Wrapped Ether',
                      icon: {
                        url: 'https://app.aave.com/icons/tokens/weth.svg',
                      },
                    },
                    {
                      address: '0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43',
                      symbol: 'USDC',
                      title: 'USD Coin',
                      icon: {
                        url: 'https://app.aave.com/icons/tokens/usdc.svg',
                      },
                    },
                    {
                      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
                      symbol: 'DAI',
                      title: 'Dai Stablecoin',
                      icon: {
                        url: 'https://app.aave.com/icons/tokens/dai.svg',
                      },
                    },
                    {
                      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                      symbol: 'USDT',
                      title: 'Tether USD',
                      icon: {
                        url: 'https://app.aave.com/icons/tokens/usdt.svg',
                      },
                    },
                    {
                      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
                      symbol: 'wBTC',
                      title: 'Wrapped BTC',
                      icon: {
                        url: 'https://app.aave.com/icons/tokens/wbtc.svg',
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
      key={2}
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
      key={2}
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
          'w-full text-stone-100 font-bold bg-sky-600 rounded-xl p-2 text-xl flex justify-center items-center overflow-hidden hover:bg-sky-500/75 active:bg-sky-500/[.55] focus:outline focus:outline-2 focus:outline-offset-[-4px] focus:outline-sky-400/25 shadow-md',
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

  if (vm.flowStep === 'started' || (open && !loading)) {
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

        <div className="min-h-[512px] pb-8">
          <AnimatePresence mode="wait">
            {vm.flowStep === 'started' ? (
              <motion.div
                key="foo"
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: -20 }}
                className="h-full flex items-center justify-center"
              >
                <div className="mt-32">
                  <CrossChainJobCard
                    spinnerLocation="status"
                    status="sending"
                    cardTitle="Deposit"
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
                <div className="space-y-4 mt-16">
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
      </motion.div>
      <div style={{ transform: 'scale(1.25)' }}>
        <div className="min-h-[512px] flex items-center justify-center">
          <motion.button
            layout
            onHoverStart={loading ? undefined : handleDepositButtonHoverStart}
            onHoverEnd={loading ? undefined : handleDepositButtonHoverEnd}
            whileTap={
              { '--fmp-extra-scale': loading ? 0.9 : 0.8 } as Record<
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
            className="w-24 h-24 relative rounded-full"
            tabIndex={-1}
          >
            <div style={{ transform: 'scale(var(--fmp-extra-scale))' }}>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={depositButtonForegroundControls}
                className="absolute font-medium text-stone-300 w-24 h-24 flex items-center justify-center z-10 pointer-events-none user-select-none overflow-hidden rounded-full"
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
