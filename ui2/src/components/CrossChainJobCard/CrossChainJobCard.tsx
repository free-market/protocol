import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/20/solid'
import cx from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useState } from 'react'

type NetworkName = 'optimism' | 'avalanche' | 'ethereum'

export const CrossChainJobCard = (props: {
  status?: 'completed' | 'sending'
  transactionView?: 'tall' | 'compact'
  spinnerLocation?: 'status' | 'transaction'
  pulseBehavior?: 'gradient' | 'pulse'
  layoutId?: string
  cardTitle?: string
  sourceNetwork?: NetworkName
  sourceTransaction?: { hash: string }
  destinationTransaction?: { hash: string }
}): JSX.Element => {
  const {
    status = 'completed',
    transactionView = 'compact',
    spinnerLocation = 'transaction',
    pulseBehavior = 'pulse',
    cardTitle = 'Transfer',
    sourceNetwork = 'ethereum',
    sourceTransaction,
    destinationTransaction,
  } = props

  const [clicked, setClicked] = useState(false)

  const handleClick = useCallback(() => {
    setClicked(!clicked)
  }, [clicked])

  const transactionSpinner = (
    <div className="inline-flex items-center relative z-30">
      <svg
        className="inline mx-1 w-3 h-3 text-transparent animate-spin fill-stone-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />

        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>

      <span className="sr-only">Loading...</span>
    </div>
  )

  const transactionGradient = (
    <motion.div
      className="absolute -inset-4 rounded z-20 opacity-75"
      initial={{ '--rotate': '0deg' } as Record<string, unknown>}
      animate={{
        ['--rotate' as string]: '359deg',
        transition: {
          repeat: Infinity,
          repeatType: 'loop',
          duration: 3,
        },
      }}
      style={{
        backgroundImage:
          'linear-gradient(var(--rotate), #5ddcff99, #3c67e399 43%, #4e00c299)',
        backgroundPosition: '0 -10px',
      }}
    />
  )

  const transactionPulse = (
    <motion.div
      initial={{
        opacity: 0.5,
      }}
      animate={{
        opacity: 1,
        transition: {
          repeat: Infinity,
          repeatType: 'reverse',
          duration: 1,
        },
      }}
      className="absolute -inset-4 rounded z-20 bg-stone-200/50"
    />
  )

  const currentTransactionIndicator = (
    <div
      className={cx('rounded border-2 border-stone-300 h-3', {
        'animate-pulse': pulseBehavior !== 'pulse',
      })}
    ></div>
  )

  const avalanchePill = (
    <div className="rounded bg-[#E84142] w-[calc(100%-2rem)] h-4 flex justify-between relative overflow-hidden border border-stone-600">
      {spinnerLocation === 'transaction' && transactionSpinner}

      {spinnerLocation === 'status' && <div></div>}

      <div className="">
        <div className="h-4 mx-4 overflow-hidden flex items-center">
          <div className="w-6 h-6 relative">
            <motion.img
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: 1.3 },
              }}
              className="w-full h-full"
              src="https://app.aave.com/icons/networks/avalanche.svg"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const optimismPill = (
    <div className="rounded bg-[#FF0421] w-[calc(100%-2rem)] h-4 flex justify-between relative overflow-hidden border border-stone-600">
      {spinnerLocation === 'transaction' && transactionSpinner}

      {spinnerLocation === 'status' && <div></div>}

      <div className="">
        <div className="h-4 mx-4 overflow-hidden flex items-center">
          <div className="w-6 h-6 relative">
            <motion.img
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: 1.3 },
              }}
              className="w-full h-full"
              src="https://app.aave.com/icons/networks/optimism.svg"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const ethereumPill = (
    <div className="rounded bg-[#627eea] w-[calc(100%-2rem)] h-4 flex justify-between relative overflow-hidden border border-stone-600">
      <div></div>

      <div className="">
        <div className="h-4 mx-4 overflow-hidden flex items-center">
          <div className="w-6 h-6 relative">
            <motion.img
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: 1.3 },
              }}
              className="w-full h-full"
              src="https://app.aave.com/icons/networks/ethereum.svg"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const arbitrumPill = (
    <div className="rounded bg-[#399fe7] w-[calc(100%-2rem)] h-4 flex justify-between relative overflow-hidden border border-stone-600">
      <div></div>

      <div className="">
        <div className="h-4 mx-4 overflow-hidden flex items-center">
          <div className="w-6 h-6 relative">
            <motion.img
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: 1.3 },
              }}
              className="w-full h-full"
              src="https://app.aave.com/icons/networks/arbitrum.svg"
            />
          </div>
        </div>
      </div>

      {pulseBehavior === 'gradient' && transactionGradient}

      {pulseBehavior === 'pulse' && status === 'sending' && transactionPulse}
    </div>
  )

  const pills: Record<NetworkName, React.ReactNode> = {
    ethereum: ethereumPill,
    avalanche: avalanchePill,
    optimism: optimismPill,
  }

  const compactTransactionView = (
    <>
      <div className={cx('flex', 'flex-col gap-1')}>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 flex items-center"></div>

          <div className="pl-2 flex items-center gap-2">
            {pills[sourceNetwork]}

            <AnimatePresence>
              <motion.svg
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                viewBox="0 0 50 50"
                className="stroke-emerald-400/90 w-4 h-4"
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
            </AnimatePresence>
          </div>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 flex items-center">
            {status === 'sending' && currentTransactionIndicator}
          </div>

          <div className="pl-2 flex items-center gap-2">
            {arbitrumPill}

            <AnimatePresence>
              {status === 'completed' && (
                <motion.svg
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  viewBox="0 0 50 50"
                  className="stroke-emerald-400/90 w-4 h-4"
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
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <motion.div
        layout={props.layoutId != null}
        initial={{
          ...({
            '--fmp-scale': 0,
          } as Record<string, unknown>),
        }}
        whileHover={{
          ...({ '--fmp-scale': 1 } as Record<string, unknown>),
          transition: {
            type: 'spring',
            stiffness: 250,
            damping: 15,
          },
        }}
        whileTap={{
          ...({ '--fmp-scale': 0.9 } as Record<string, unknown>),
          transition: {
            type: 'spring',
            stiffness: 250,
            damping: 15,
          },
        }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 250,
          damping: 15,
        }}
        onClick={handleClick}
        className="min-w-[20rem] w-full !rounded-xl shadow-md text-stone-200 font-medium p-2 max-w-xs mx-auto space-y-2 overflow-hidden cursor-pointer group relative"
      >
        <div className="absolute inset-0 pointer-events-none group-hover:bg-stone-900/10 group-active:bg-stone-900/25 z-50"></div>
        <motion.div
          layoutId={props.layoutId}
          className="absolute inset-0 -top-2 pointer-events-none bg-stone-600 z-10"
        ></motion.div>

        <div className="relative flex justify-between !my-2 z-20">
          <div className="text-lg leading-none">{cardTitle}</div>

          <div className="w-6 h-6 rounded-full">
            <ChevronUpDownIcon
              style={{ transform: 'scale(var(--fmp-scale))' }}
              className="text-stone-400 w-5 h-5"
            />
          </div>
        </div>

        <div className="!m-0 relative z-20">
          <AnimatePresence>
            {clicked && (
              <motion.div
                className="h-[20rem]"
                initial={{ opacity: 0, marginBottom: '-20rem', y: 10 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  marginBottom: 0,
                  transition: {
                    //default: { ease: 'anticipate', duration: 0.5 },
                    default: {
                      type: 'spring',
                      duration: 0.1,
                      stiffness: 200,
                      mass: 1,
                      damping: 15,
                    },
                    opacity: {
                      type: 'spring',
                      duration: 0.5,
                      delay: 0.5,
                    },
                    y: {
                      type: 'spring',
                      duration: 0.5,
                      delay: 0.5,
                    },
                  },
                }}
                exit={{
                  opacity: 0,
                  marginBottom: '-20rem',
                  y: 0,
                  transition: {
                    default: {
                      type: 'spring',
                      duration: 0.1,
                      mass: 1,
                      damping: 20,
                    },
                    opacity: {
                      type: 'spring',
                      duration: 0.5,
                    },
                    y: {
                      type: 'spring',
                      duration: 0.5,
                    },
                  },
                }}
              >
                <div className="space-y-2 pt-2">
                  <div
                    className={cx(
                      'mx-4 saturate-[0.9] rounded-md relative overflow-hidden p-2 flex flex-col gap-2',
                      {
                        'bg-[#E84142]': sourceNetwork === 'avalanche',
                        'bg-[#627eea]': sourceNetwork === 'ethereum',
                        'bg-[#FF0421]': sourceNetwork === 'optimism',
                      },
                    )}
                  >
                    <div className="w-full flex items-center justify-between relative h-9">
                      <div className="grow flex items-center rounded bg-stone-600 px-2 h-9">
                        <div className="font-mono font-bold text-stone-500 flex items-center">
                          <span className="text-xs">01 /</span>{' '}
                          <span className="text-stone-400 font-[Inter] font-bold pl-2">
                            {
                              {
                                avalanche: 'Avalanche',
                                ethereum: 'Ethereum',
                                optimism: 'Optimism',
                              }[sourceNetwork]
                            }
                          </span>
                        </div>
                      </div>
                      <div className="h-8 mx-4 overflow-hidden flex items-center justify-end">
                        <div className="w-8 h-8 relative">
                          <motion.img
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: 1,
                              transition: { delay: 1.3 },
                            }}
                            className="w-full h-full"
                            src={`https://app.aave.com/icons/networks/${sourceNetwork}.svg`}
                          />
                        </div>
                      </div>
                    </div>
                    <a
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                      href={`https://layerzeroscan.com/tx/${sourceTransaction?.hash}`}
                      target="_blank"
                      className="w-full rounded p-2 bg-stone-600 flex items-center text-stone-400 hover:underline"
                    >
                      <div className="font-mono font-bold overflow-ellipsis truncate basis-0 grow">
                        TX {sourceTransaction?.hash}
                      </div>
                      <ArrowTopRightOnSquareIcon className="basis-6 w-6 h-6 inline-block" />
                    </a>
                  </div>
                  <div className="mx-4 saturate-[0.9] bg-[#399fe7] rounded-md relative overflow-hidden p-2 flex flex-col gap-2">
                    <div className="w-full flex items-center justify-between relative h-9">
                      <div className="grow flex items-center rounded bg-stone-600 px-2 h-9">
                        <div className="font-mono font-bold text-stone-500 flex items-center">
                          <span className="text-xs">02 /</span>{' '}
                          <span className="text-stone-400 font-[Inter] font-bold pl-2">
                            Arbitrum
                          </span>
                        </div>
                      </div>
                      <div className="h-8 mx-4 overflow-hidden flex items-center justify-end">
                        <div className="w-8 h-8 relative">
                          <motion.img
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: 1,
                              transition: { delay: 1.3 },
                            }}
                            className="w-full h-full"
                            src={`https://app.aave.com/icons/networks/arbitrum.svg`}
                          />
                        </div>
                      </div>
                    </div>
                    <a
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                      href={
                        destinationTransaction
                          ? `https://layerzeroscan.com/tx/${destinationTransaction?.hash}`
                          : undefined
                      }
                      target="_blank"
                      className="w-full rounded p-2 bg-stone-600 flex items-center text-stone-400 hover:underline"
                    >
                      <div className="font-mono font-bold overflow-ellipsis truncate basis-0 grow">
                        {destinationTransaction ? (
                          <>TX {destinationTransaction.hash}</>
                        ) : (
                          <>sending...</>
                        )}
                      </div>
                      {destinationTransaction && (
                        <ArrowTopRightOnSquareIcon className="basis-6 w-6 h-6 inline-block" />
                      )}
                    </a>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs px-4 border border-transparent text-stone-300 font-light">
                      <div>Slippage</div>
                      <div>0.5%</div>
                    </div>
                    <div className="flex items-center justify-between text-xs px-4 border border-transparent text-stone-300 font-light">
                      <div>Gas on destination</div>
                      <div>0.00235148 ETH</div>
                    </div>
                    <div className="flex items-center justify-between text-xs px-4 border border-transparent text-stone-400 font-light">
                      <div>Fee</div>
                      <div className="flex items-center gap-1">
                        $3.00{' '}
                        <svg
                          className="w-4 h-4 fill-stone-400"
                          focusable="false"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs px-4 border border-transparent text-stone-400 font-light">
                      <div>Gas cost</div>
                      <div>1.435278 AVAX</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-stretch gap-2 pt-2 !mt-0 relative z-20">
          <div className="basis-1/2 space-y-2 flex flex-col">
            <div className="text-xs font-light leading-none text-left">
              STATUS
            </div>

            <div className="grow flex items-end h-3 leading-none">
              {status === 'completed' ? (
                status
              ) : (
                <>
                  {spinnerLocation === 'status' && (
                    <div role="status">
                      <svg
                        aria-hidden="true"
                        className="mr-2 w-8 h-8 text-stone-600 animate-spin fill-stone-200"
                        viewBox="0 0 100 101"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />

                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill"
                        />
                      </svg>

                      <span className="sr-only">Loading...</span>
                    </div>
                  )}

                  <div>sending...</div>
                </>
              )}
            </div>
          </div>

          <div className="basis-1/2 space-y-2">
            <div className="text-xs font-light leading-none text-left">
              TRANSACTION
            </div>
            <div className="flex flex-col justify-end gap-1">
              {transactionView === 'tall' && (
                <div className="flex items-stretch gap-2">
                  <div className="">
                    <div className="rounded bg-stone-500 flex flex-col items-center gap-1 justify-center p-2">
                      <div className="text-stone-300">1/2</div>
                      <div className="relative rounded-full w-10 h-10 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-stone-400 z-10" />

                        <div>
                          <div className="w-8 h-8 relative z-20">
                            <motion.img
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1, transition: { delay: 1 } }}
                              className="w-full h-full"
                              src="https://app.aave.com/icons/networks/ethereum.svg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="inline-flex items-center">
                    <div className="text-stone-400 leading-none text-3xl">
                      <ArrowRightIcon className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="">
                    <div className="flex flex-col items-center gap-1 justify-center p-2">
                      <div className="text-stone-400">2/2</div>
                      <div className="relative rounded-full w-10 h-10 flex items-center justify-center">
                        <div>
                          <div className="w-8 h-8 relative z-20">
                            <motion.img
                              initial={{ opacity: 0 }}
                              animate={{
                                opacity: 1,
                                transition: { delay: 1.3 },
                              }}
                              className="w-full h-full"
                              src="https://app.aave.com/icons/networks/avalanche.svg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {transactionView === 'compact' && compactTransactionView}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
