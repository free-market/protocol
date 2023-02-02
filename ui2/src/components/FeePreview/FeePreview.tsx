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
  const {
    showImage = false,
    assetAmount = '0.00',
    assetSymbol = 'USDC',
    destinationGasAmount = '0.00235148',
    destinationGasSymbol = 'ETH',
    feeAmount = '3.00',
    sourceGasAmount = '1.435278',
    sourceGasSymbol = 'AVAX',
  } = props

  const [clicked, setClicked] = useState(false)

  const handleClick = useCallback(() => {
    setClicked(!clicked)
  }, [clicked])

  const url = 'https://app.aave.com/icons/tokens/usdc.svg'

  return (
    <>
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
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 250,
          damping: 15,
        }}
        onClick={handleClick}
        className="max-w-xs mx-auto rounded-xl overflow-hidden cursor-pointer group relative"
      >
        <div className="max-w-xs mx-auto">
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
                <span>{assetAmount}</span>
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
        </div>

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
                      <div>0.5%</div>
                    </div>
                    <div className="flex items-center justify-between text-xs px-4 border border-transparent text-stone-400 font-light">
                      <div>Gas on destination</div>
                      <div>
                        {destinationGasAmount} {destinationGasSymbol}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs px-4 border border-transparent text-stone-500 font-light">
                      <div>Fee</div>
                      <div className="flex items-center gap-1">
                        ${feeAmount}{' '}
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
                    <div className="flex items-center justify-between text-xs px-4 border border-transparent text-stone-500 font-light">
                      <div>Gas cost</div>
                      <div>
                        {sourceGasAmount} {sourceGasSymbol}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )
}
