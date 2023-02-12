import { useDepositFlowState } from '@component/DepositFlowStateProvider/useDepositFlowState'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useState } from 'react'

export const FeePreview = (props: {
  assetAmount?: string
  assetSymbol?: string
  showImage?: boolean
  destinationGasAmount?: string
  destinationGasSymbol?: string
  feeAmount?: string
  sourceGasAmount?: string
  sourceGasSymbol?: string
}): JSX.Element => {
  const vm = useDepositFlowState()

  const {
    showImage = false,
    assetSymbol = 'USDC',
    destinationGasSymbol = 'ETH',
    sourceGasSymbol = 'ETH',
  } = props

  const [clicked, setClicked] = useState(false)

  const handleClick = useCallback(() => {
    setClicked(!clicked)
  }, [clicked])

  const url = 'https://app.aave.com/icons/tokens/usdc.svg'

  return (
    <>
      <motion.div
        animate={{
          scale: vm.fee.status === 'unavailable' ? 0 : 1,
          transition: { duration: vm.fee.status === 'loading' ? 0 : 1 },
        }}
      >
        <motion.div
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
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 250,
            damping: 15,
          }}
          onClick={handleClick}
          className="max-w-xs mx-auto rounded-xl overflow-hidden cursor-pointer group relative"
        >
          <AnimatePresence mode="wait">
            {vm.fee.status === 'predicted' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="max-w-xs mx-auto"
                >
                  <div className="absolute inset-0 pointer-events-none group-hover:bg-stone-900/10 group-active:bg-stone-900/25 z-50"></div>
                  <div className="m-2 leading-none flex items-center justify-between">
                    <div className="p-2 leading-none flex items-center justify-between w-full group relative cursor-pointer">
                      <div className="flex items-center space-x-1 text-sm text-stone-500">
                        <span>You will deposit</span>
                        {showImage && (
                          <span>
                            <div className="rounded-full overflow-hidden w-3 h-3 bg-stone-500 relative z-20">
                              <img className="w-full h-full" src={url} />
                            </div>
                          </span>
                        )}
                        <span>
                          ~{Number(vm.fee.details.protocol.usd).toFixed(2)}
                        </span>
                        <span>{assetSymbol}</span>
                        <svg
                          className="w-4 h-4 fill-stone-500"
                          focusable="false"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
                        </svg>
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <ChevronUpDownIcon
                          style={{ transform: 'scale(var(--fmp-scale))' }}
                          className="text-stone-400 w-5 h-5"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="!m-0 relative z-20">
                  <AnimatePresence>
                    {clicked && (
                      <motion.div
                        className="h-[6.5rem]"
                        initial={{ opacity: 0, marginBottom: '-6.5rem', y: 10 }}
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
                              delay: 0.25,
                            },
                            y: {
                              type: 'spring',
                              duration: 0.5,
                              delay: 0.25,
                            },
                          },
                        }}
                        exit={{
                          opacity: 0,
                          marginBottom: '-6.5rem',
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
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs px-4 border border-transparent text-stone-400 font-light">
                              <div>Slippage</div>
                              <div>{vm.fee.details.slippage}</div>
                            </div>
                            <div className="flex items-center justify-between text-xs px-4 border border-transparent text-stone-400 font-light">
                              <div>Gas on destination</div>
                              <div>
                                {vm.fee.details.destination.gasPrice}{' '}
                                {destinationGasSymbol}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs px-4 border border-transparent text-stone-500 font-light">
                              <div>Fee</div>
                              <div className="flex items-center gap-1">
                                $
                                {Math.ceil(
                                  (Number(vm.amount) -
                                    Number(vm.fee.details.protocol.usd)) *
                                    100,
                                ) / 100}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs px-4 border border-transparent text-stone-500 font-light">
                              <div>Gas cost</div>
                              <div>
                                {vm.fee.details.source.gasPrice}{' '}
                                {sourceGasSymbol}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {vm.fee.status === 'loading' && (
              <div className="flex justify-center items-center h-[52px]">
                <svg
                  aria-hidden="true"
                  className="mr-2 w-8 h-8 text-transparent animate-spin fill-stone-300"
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
              </div>
            )}

            {vm.fee.status === 'unavailable' && (
              <div className="h-[52px]"> </div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  )
}
