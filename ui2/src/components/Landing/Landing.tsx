import CoreProvider from '@component/CoreProvider'
import { CoreContext } from '@component/CoreProvider/CoreProvider'
import StepBuilder from '@component/StepBuilder'
import StepHeading from '@component/StepHeading'
import {
  AnimatePresence,
  motion,
  Transition,
  useAnimationControls,
  Variants,
} from 'framer-motion'
import { useCallback, useState } from 'react'
import cx from 'classnames'
import { CheckCircleIcon } from '@heroicons/react/20/solid'
import Logo from '@component/Logo'
import CrossChainJobCard from '@component/CrossChainJobCard'
import DepositFlow from '@component/DepositFlow'

const USE_DELAY = 0

export const Landing = (): JSX.Element => {
  const [firstStepButtonActive, setFirstStepButtonActive] = useState(false)
  const [firstStepClicked, setFirstStepClicked] = useState(false)
  const [secondStepHovered, setSecondStepHovered] = useState(false)
  const [secondStepButtonActive, setSecondStepButtonActive] = useState(false)
  const [secondStepClicked, setSecondStepClicked] = useState(false)
  const [secondStepRecentlyClicked, setSecondStepRecentlyClicked] =
    useState(false)
  const [secondStepPartTwoHovered, setSecondStepPartTwoHovered] =
    useState(false)

  const secondStepMouseControls = useAnimationControls()

  const titleDelay = 0
  const titleTextDelay = 1
  const titleSpeed = 0.15
  const titleTextVariants: Variants = {
    hidden: {
      opacity: 0,
      x: -100,
      rotate: -45,
      scale: 0,
      color: 'rgb(214 211 209)',
    },
    visible: (i: number) => ({
      color: 'rgb(68 64 60)',
      opacity: 1,
      x: 0,
      rotate: 0,
      scale: 1,
      transition: {
        default: {
          type: 'spring',
          damping: 26,
          stiffness: 450,
          bounce: 1,
          delay: USE_DELAY * (titleDelay + titleTextDelay + titleSpeed * i),
        },
        color: {
          type: 'spring',
          damping: 50,
          stiffness: 50,
          duration: 0,
          delay: USE_DELAY * (titleDelay + titleTextDelay + titleSpeed * 2 * i + 0.5),
        },
        scale: {
          type: 'spring',
          damping: 20,
          stiffness: 150,
          bounce: 1,
          delay: USE_DELAY * (titleDelay + titleTextDelay + titleSpeed * i),
          ease: [0, 0.71, 0.2, 1.5],
        },
        rotate: {
          type: 'spring',
          damping: 100,
          stiffness: 1000,
          bounce: 1,
          delay: USE_DELAY * (titleDelay + titleTextDelay + titleSpeed * i),
          mass: 10,
        },
      },
    }),
  }

  const baseHeroDelay = 2.8

  const startSecondFakeClick = useCallback(() => {
    setSecondStepRecentlyClicked(true)
    setTimeout(() => {
      setSecondStepHovered(true)
      setTimeout(() => {
        setSecondStepButtonActive(true)
        setTimeout(() => {
          setSecondStepButtonActive(false)
          setSecondStepHovered(false)
          setSecondStepClicked(true)
          setTimeout(() => {
            setSecondStepRecentlyClicked(false)
            setTimeout(async () => {
              await secondStepMouseControls.start(
                {
                  opacity: 1,
                  x: 0,
                  y: 110,
                },
                {
                  type: 'tween',
                  duration: 0.5,
                },
              )
              setSecondStepPartTwoHovered(true)
            }, 500)
          }, 300)
        }, 150)
      }, 500)
    }, 1200)
  }, [])

  const startFirstFakeClick = useCallback(() => {
    setTimeout(() => {
      setFirstStepButtonActive(true)
      setTimeout(() => {
        setFirstStepButtonActive(false)
        setFirstStepClicked(true)
        setTimeout(async () => {
          await secondStepMouseControls.start({ opacity: 1, x: 0, y: -50 })
          startSecondFakeClick()
        }, 1000)
      }, 150)
    }, 500)
  }, [])

  return (
    <>
      <div className="min-w-[70rem]">
        <div className="w-full overflow-hidden min-w-[70rem]">
          <div className="bg-stone-700">
            <div className="h-12"></div>
            <div className="md:flex items-center px-8 max-w-7xl mx-auto">
              {/* TODO(FMP-343): extract this */}
              <motion.div className="px-8 pb-8 pt-8">
                <motion.svg
                  className="w-[calc(150px*0.4)] h-[calc(240px*0.4)] stroke-stone-300"
                  viewBox="0 0 750 1200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <g id="layer1" transform="translate(0,147.63784)">
                    <motion.path
                      initial={{ scale: 0, x: -100 }}
                      animate={{ scale: 1, x: 0 }}
                      transition={{
                        scale: {
                          type: 'spring',
                          damping: 50,
                          duration: 0.1,
                          stiffness: 450,
                          bounce: 1,
                          delay: USE_DELAY * (titleDelay + titleSpeed * 3.5),
                        },
                        x: {
                          type: 'spring',
                          damping: 50,
                          duration: 0.1,
                          stiffness: 450,
                          bounce: 1,
                          delay: USE_DELAY * (titleDelay + titleSpeed * 3.5),
                        },
                      }}
                      style={{
                        fill: 'none',
                        fillRule: 'evenodd',
                        strokeWidth: 220,
                        strokeLinecap: 'butt',
                        strokeLinejoin: 'miter',
                        strokeMiterlimit: 4,
                        strokeDasharray: 'none',
                        strokeOpacity: 1,
                      }}
                      d="M 118.93994,944.93135 C 408.3018,941.88962 361.81792,708.72632 359.17669,454.84232"
                      id="path4467"
                    />
                    <motion.path
                      initial={{ scale: 0, x: -100 }}
                      animate={{ scale: 1, x: 0 }}
                      transition={{
                        scale: {
                          type: 'spring',
                          damping: 50,
                          duration: 0.1,
                          stiffness: 450,
                          bounce: 1,
                          delay: USE_DELAY * (titleDelay + titleSpeed * 2.5),
                        },
                        x: {
                          type: 'spring',
                          damping: 50,
                          duration: 0.1,
                          stiffness: 450,
                          bounce: 1,
                          delay: USE_DELAY * (titleDelay + titleSpeed * 2.5),
                        },
                      }}
                      id="path4469"
                      d="m 112.56614,415.69241 527.59454,4e-5"
                      style={{
                        fill: 'none',
                        fillRule: 'evenodd',
                        strokeWidth: 220,
                        strokeLinecap: 'butt',
                        strokeLinejoin: 'miter',
                        strokeMiterlimit: 4,
                        strokeDasharray: 'none',
                        strokeOpacity: 1,
                      }}
                    />
                    <motion.path
                      initial={{ scale: 0, x: -100 }}
                      animate={{ scale: 1, x: 0 }}
                      transition={{
                        scale: {
                          type: 'spring',
                          damping: 50,
                          duration: 0.1,
                          stiffness: 450,
                          bounce: 1,
                          delay: USE_DELAY * (titleDelay + titleSpeed * 1.5),
                        },
                        x: {
                          type: 'spring',
                          damping: 50,
                          duration: 0.1,
                          stiffness: 450,
                          bounce: 1,
                          delay: USE_DELAY * (titleDelay + titleSpeed * 1.5),
                        },
                      }}
                      id="path4471"
                      d="m 638.86492,-33.109346 c -258.86492,0 -277.82254,152.733086 -277.82254,259.020506 0,1.46169 -0.048,22.72491 -0.0478,24.20899"
                      style={{
                        fill: 'none',
                        fillRule: 'evenodd',
                        strokeWidth: 220,
                        strokeLinecap: 'butt',
                        strokeLinejoin: 'miter',
                        strokeMiterlimit: 4,
                        strokeDasharray: 'none',
                        strokeOpacity: 1,
                      }}
                    />
                  </g>
                </motion.svg>
              </motion.div>

              {/* TODO(FMP-343): extract this */}
              <div className="inline-block flex flex-col items-start text-stone-700 text-4xl space-y-1 select-none font-light py-8">
                <motion.div
                  variants={titleTextVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0}
                  className="bg-stone-300 px-2"
                >
                  Free
                </motion.div>
                <motion.div
                  variants={titleTextVariants}
                  initial="hidden"
                  animate="visible"
                  custom={1}
                  className="bg-stone-300 px-2"
                >
                  Market
                </motion.div>
                <motion.div
                  variants={titleTextVariants}
                  initial="hidden"
                  animate="visible"
                  custom={2}
                  className="bg-stone-300 px-2"
                >
                  Protocol
                </motion.div>
              </div>

              <div className="grow flex justify-center">
                <div className="px-8 py-8 text-stone-300 font-semibold text-[3.5rem] leading-none space-y-4">
                  <div className="lg:flex space-y-4 lg:space-y-0">
                    <div>
                      <motion.div
                        initial={{ rotateX: 270 }}
                        animate={{ rotateX: 360 }}
                        transition={{ duration: 1, delay: baseHeroDelay - 1.4 }}
                        className="inline-block bg-stone-600"
                      >
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            duration: 0.1,
                            delay: baseHeroDelay + 0,
                          }}
                        >
                          on-chain
                        </motion.span>
                      </motion.div>
                    </div>
                    <div className="hidden lg:inline-block">&nbsp;</div>
                    <div>
                      <motion.div
                        initial={{ rotateX: 270 }}
                        animate={{ rotateX: 360 }}
                        transition={{ duration: 1, delay: baseHeroDelay - 1.2 }}
                        className="inline-block bg-stone-600"
                      >
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            duration: 0.1,
                            delay: baseHeroDelay + 0.4,
                          }}
                        >
                          automation,
                        </motion.span>
                      </motion.div>
                    </div>
                  </div>
                  <motion.div
                    initial={{ rotateX: 270 }}
                    animate={{ rotateX: 360 }}
                    transition={{ duration: 1, delay: baseHeroDelay - 1 }}
                    className="inline-block bg-stone-600"
                  >
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.1,
                        delay: baseHeroDelay + 0.8,
                      }}
                    >
                      made
                    </motion.span>
                  </motion.div>{' '}
                  <motion.div
                    initial={{ rotateX: 270 }}
                    animate={{ rotateX: 360 }}
                    transition={{ duration: 1, delay: baseHeroDelay - 0.6 }}
                    className="inline-block bg-stone-600"
                  >
                    <motion.span
                      initial={{ opacity: 0, color: '#22c55e' }}
                      animate={{ opacity: 1, color: '#d6d3d1' }}
                      transition={{
                        color: {
                          duration: 1,
                          delay: baseHeroDelay + 1.6,
                        },
                        opacity: {
                          type: 'tween',
                          duration: 1,
                          delay: baseHeroDelay + 1.2,
                        },
                      }}
                    >
                      <span className="italic font-bold">easy</span>.
                    </motion.span>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="flex justify-evenly overflow-hidden h-[17rem] max-w-7xl mx-auto" />

            <div className="relative h-0 z-50">
              <div className="flex justify-evenly max-w-7xl mx-auto transform -translate-y-[17rem]">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    duration: 0.5,
                    stiffness: 250,
                    damping: 100,
                    delay: baseHeroDelay + 2.5,
                  }}
                  className="h-96 w-[calc(33%_-_4rem)] bg-stone-800 rounded-xl shadow-md flex items-center justify-center relative z-10"
                >
                  <CoreProvider>
                    <motion.div
                      initial={{ opacity: 0, x: 15, y: 15 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      transition={{
                        default: {
                          delay: baseHeroDelay + 4,
                        },
                      }}
                      onAnimationComplete={startFirstFakeClick}
                      className="absolute top-0 right-0 left-0 bottom-0 flex items-center justify-center z-40 user-select-none"
                    >
                      <img src="/pointinghand.svg" />
                    </motion.div>

                    <StepHeading
                      actionGroupName="aave"
                      forceHover
                      forceActive={firstStepButtonActive}
                    />
                  </CoreProvider>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    duration: 0.5,
                    stiffness: 250,
                    damping: 100,
                    delay: baseHeroDelay + 2.6,
                  }}
                  className="h-96 w-[calc(33%_-_4rem)] bg-stone-800 rounded-xl shadow-md flex items-center justify-center relative z-10"
                >
                  <CoreProvider>
                    <CoreContext.Consumer>
                      {(core) =>
                        core && (
                          <CoreContext.Provider
                            value={{
                              ...core,
                              selectedStepChoice: secondStepClicked
                                ? {
                                    index: 0,
                                    recentlySelected: secondStepRecentlyClicked,
                                    recentlyClosed: false,
                                  }
                                : null,
                            }}
                          >
                            {firstStepClicked && (
                              <motion.div
                                initial={{ opacity: 0, x: 15, y: 15 }}
                                animate={secondStepMouseControls}
                                className="absolute top-0 right-0 left-0 bottom-0 flex items-center justify-center z-50"
                              >
                                {/* TODO(FMP-344): finish animating the cursor */}
                                {secondStepClicked &&
                                !secondStepPartTwoHovered ? (
                                  <img src="/pointer.svg" />
                                ) : (
                                  <img src="/pointinghand.svg" />
                                )}
                              </motion.div>
                            )}

                            <motion.div className="h-96 grow basis-0 max-w-sm rounded-xl relative overflow-hidden">
                              <div className="h-full p-2 rounded-xl bg-stone-800 max-w-sm grow basis-0 space-y-5 overflow-y-auto relative">
                                <AnimatePresence mode="wait">
                                  <StepBuilder
                                    forceHoverIndex={secondStepHovered ? 0 : -1}
                                    forceActiveIndex={
                                      secondStepButtonActive ? 0 : -1
                                    }
                                    forceHoverSubmit={secondStepPartTwoHovered}
                                    overrideSelectedActionGroup={
                                      firstStepClicked
                                        ? {
                                            name: 'aave',
                                            recentlySelected: true,
                                          }
                                        : undefined
                                    }
                                  />
                                </AnimatePresence>
                              </div>
                            </motion.div>
                          </CoreContext.Provider>
                        )
                      }
                    </CoreContext.Consumer>
                  </CoreProvider>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    duration: 0.5,
                    stiffness: 250,
                    damping: 100,
                    delay: baseHeroDelay + 2.7,
                  }}
                  className="h-96 w-[calc(33%_-_4rem)] bg-stone-800 rounded-xl shadow-md flex items-center justify-center relative z-10"
                >
                  <CoreProvider>
                    <div className="absolute top-0 right-0 left-0 bottom-0 flex items-center justify-center z-20 opacity-0">
                      <img src="/pointinghand.svg" />
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                        transition: { duration: 2, delay: baseHeroDelay + 4 },
                      }}
                      className="w-full h-full flex items-center justify-center text-stone-300 font-extrabold"
                    >
                      <img
                        width="300"
                        src="https://uploads.linear.app/a8bd35f5-1139-41bb-a211-7b001e6bd001/be58d1ad-2cf1-4c04-9669-2098e5c1f0cd/e142f407-6386-43de-9ee7-3031fe32ba8b"
                      />
                    </motion.div>
                  </CoreProvider>
                </motion.div>
              </div>
            </div>

            <div className={cx('h-[32rem] w-full relative bg-stone-200')}>
              <div className="relative max-w-5xl mx-auto z-20 pt-48 flex justify-between">
                <div className="space-y-8">
                  <div className="relative text-stone-700 space-y-4 text-[3.5rem] leading-none select-none">
                    <div className="absolute inset-0 left-auto -translate-y-6 text-stone-700 space-y-4 text-[3.5rem] leading-none opacity-50 z-20">
                      <div className="inline-block font-semibold border border-stone-400/90 bg-stone-200/90">
                        multi-chain,
                      </div>{' '}
                      <div className="inline-block text-stone-800/90 font-bold border border-stone-400/90 bg-stone-200/90 italic">
                        solved.
                      </div>
                    </div>
                    <div className="absolute inset-0 left-auto -translate-y-16 text-stone-700 space-y-4 text-[3.5rem] leading-none z-10 opacity-25">
                      <div className="inline-block font-semibold border border-stone-400/90 bg-stone-200/90">
                        bridges,
                      </div>{' '}
                      <div className="inline-block text-stone-800/90 font-bold border border-stone-400/90 bg-stone-200/90 italic">
                        solved.
                      </div>
                    </div>
                    <div className="absolute inset-0 left-auto -translate-y-[5.5rem] text-stone-700 space-y-4 text-[3.5rem] leading-none z-10 opacity-[0.225]">
                      <div className="inline-block font-semibold border border-stone-400/90 bg-stone-200/90">
                        layer 2,
                      </div>{' '}
                      <div className="inline-block text-stone-800/90 font-bold border border-stone-400/90 bg-stone-200/90 italic">
                        solved.
                      </div>
                    </div>
                    <div className="absolute inset-0 left-auto -translate-y-[7rem] text-stone-700 space-y-4 text-[3.5rem] leading-none z-10 opacity-[.1125]">
                      <div className="inline-block font-semibold border border-stone-400/90 bg-stone-200/90">
                        fees,
                      </div>{' '}
                      <div className="inline-block text-stone-800/90 font-bold border border-stone-400/90 bg-stone-200/90 italic">
                        solved.
                      </div>
                    </div>
                    <div className="relative inline-block font-semibold border border-stone-400/90 bg-stone-200/90 z-30">
                      cross-chain,
                    </div>{' '}
                    <div className="relative inline-block text-stone-800/90 font-bold border border-stone-400/90 bg-stone-200/90 italic z-30">
                      solved.
                    </div>
                  </div>
                  <div className="text-stone-700 space-y-4 pl-10 text-base max-w-lg">
                    <div className="border border-stone-400/90 bg-stone-200/90 pr-8 py-1">
                      <ul className="list-disc m-0 pl-6 space-y-4">
                        <li>
                          Free Market is{' '}
                          <span className="font-semibold">
                            batteries-included
                          </span>
                          . Venture new chains with 0 prep required.
                        </li>
                        <li>
                          Only 1 transaction needed. Start your workflows from
                          your web wallet in a single click.
                        </li>
                        <li>
                          Bridge assets effortlessly. Free Market transfers
                          across chains automatically.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    duration: 0.5,
                    stiffness: 250,
                    damping: 100,
                  }}
                  className="h-96 w-96 bg-stone-800 rounded-xl shadow-md flex items-start justify-stretch relative z-10 self-end text-stone-200"
                >
                  <p className="text-center font-medium w-full my-10">
                    <CrossChainJobCard
                      status="sending"
                      transactionView="compact"
                      spinnerLocation="status"
                      pulseBehavior="pulse"
                    />
                  </p>
                </motion.div>
              </div>
              <div className="absolute bg-stone-200 bg-clip-text max-w-7xl mx-auto -rotate-45 -translate-y-[40rem] translate-x-[4rem]">
                <div className="w-[100rem] relative">
                  <div className="absolute -inset-[40rem] border-b-[20rem] border-l-[20rem] border-stone-800/25 z-50"></div>
                  <div className="bg-repeat bg-[length:50px_50px] w-full bg-[url('/fmp-logo-repeat-2.svg')] flex flex-col items-start justify-center bg-clip-text opacity-90">
                    <div className="text-[20rem] leading-none font-extrabold text-transparent">
                      FREE
                    </div>
                    <div className="text-[20rem] leading-none font-extrabold text-transparent">
                      MARKET
                    </div>
                    <div className="text-[20rem] leading-none font-extrabold text-transparent">
                      PROTOCOL
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[70rem]">
              <div className="h-[30rem]">
                <div className="max-w-3xl mx-auto pt-20 relative z-20 space-y-4">
                  <div className="inline-block border border-stone-400/90 bg-stone-200/90 font-mono text-stone-600"></div>

                  <div className="w-full max-w-2xl inline-block border border-stone-400/90 bg-stone-200/90 font-mono text-stone-600">
                    <div className="flex p-5 gap-5">
                      <button className="inline-block border border-stone-400/90 p-2 min-w-[10rem] text-center font-bold underline bg-stone-400/75 hover:bg-stone-400/90 active:bg-stone-500/75">
                        chains
                      </button>
                      <button className="inline-block border border-stone-400/90 p-2 min-w-[10rem] text-center underline hover:bg-stone-400/90 active:bg-stone-500/75">
                        dapps
                      </button>
                      <button className="inline-block border border-stone-400/90 p-2 min-w-[10rem] text-center underline hover:bg-stone-400/90 active:bg-stone-500/75">
                        triggers
                      </button>
                    </div>
                    <div className="flex justify-center">
                      <span className="flex gap-10 p-5">
                        <table className="table-fixed">
                          <tbody>
                            <tr>
                              <td className="space-x-2 p-5">
                                <div className="inline-flex items-center gap-2">
                                  <img
                                    src="https://app.aave.com/icons/networks/ethereum.svg"
                                    className="w-5 h-5"
                                  />
                                  Ethereum
                                </div>
                              </td>

                              <td className="space-x-2 p-5">
                                <div className="inline-flex items-center gap-2">
                                  <img
                                    src="https://app.aave.com/icons/networks/arbitrum.svg"
                                    className="w-5 h-5"
                                  />
                                  Arbitrum
                                </div>
                              </td>
                            </tr>

                            <tr>
                              <td className="space-x-2 p-5">
                                <div className="inline-flex items-center gap-2">
                                  <img
                                    src="https://app.aave.com/icons/tokens/busd.svg"
                                    className="w-5 h-5"
                                  />
                                  Binance Smart Chain
                                </div>
                              </td>

                              <td className="space-x-2 p-5">
                                <div className="inline-flex items-center gap-2">
                                  <img
                                    src="https://app.aave.com/icons/networks/optimism.svg"
                                    className="w-5 h-5"
                                  />
                                  Optimism
                                </div>
                              </td>
                            </tr>

                            <tr>
                              <td className="space-x-2 p-5">
                                <div className="inline-flex items-center gap-2">
                                  <img
                                    src="https://app.aave.com/icons/networks/polygon.svg"
                                    className="w-5 h-5"
                                  />
                                  Polygon
                                </div>
                              </td>

                              <td className="space-x-2 p-5">
                                <div className="inline-flex items-center gap-2">
                                  <img
                                    src="https://app.aave.com/icons/networks/fantom.svg"
                                    className="w-5 h-5"
                                  />
                                  Fantom
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="max-w-5xl mx-auto flex justify-between items-center">
                <div className="basis-1/2 flex justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      type: 'spring',
                      duration: 0.5,
                      stiffness: 250,
                      damping: 100,
                    }}
                    className="relative z-10 border border-stone-400/90 bg-stone-100/90 inline-flex items-center p-8"
                  >
                    <ul className="inline-block m-0 space-y-8 text-stone-600 font-medium text-lg">
                      <motion.li
                        initial={{ opacity: 0, x: 30 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: { delay: 0.5 },
                        }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircleIcon className="w-5 h-5 text-lime-500/90" />{' '}
                        no-code automation
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, x: 30 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: { delay: 0.7 },
                        }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircleIcon className="w-5 h-5 text-lime-500/90" />{' '}
                        workflow engine
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, x: 30 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: { delay: 0.9 },
                        }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircleIcon className="w-5 h-5 text-lime-500/90" />{' '}
                        cross-chain
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, x: 30 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: { delay: 1.1 },
                        }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircleIcon className="w-5 h-5 text-lime-500/90" />{' '}
                        cross-protocol
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, x: 30 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: { delay: 1.3 },
                        }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircleIcon className="w-5 h-5 text-lime-500/90" />{' '}
                        developer SDK
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, x: 30 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: { delay: 1.5 },
                        }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircleIcon className="w-5 h-5 text-lime-500/90" />{' '}
                        ready-to-use UI
                      </motion.li>
                    </ul>
                  </motion.div>
                </div>

                <motion.div
                  initial={
                    {
                      'borderColor': '#292524',
                      '--fmp-logo-color': '#292524',
                    } as {
                      borderColor: string
                    }
                  }
                  whileInView={
                    {
                      'borderColor': '#57534e',
                      '--fmp-logo-color': '#57534e',
                      'transition': { delay: 1, duration: 1 },
                    } as { borderColor: string; transition: Transition }
                  }
                  className="grow ml-32 border-[0.5rem] border-stone-600 p-16 relative"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Logo
                      className="w-full h-full"
                      style={{ stroke: 'var(--fmp-logo-color)' }}
                    />
                  </div>

                  <div className="flex flex-col items-center text-stone-300 font-semibold text-[3.5rem] leading-none space-y-32">
                    <motion.div
                      className="inline-block relative"
                      style={{ transformStyle: 'preserve-3d' }}
                      initial={{ rotateX: 0 }}
                      whileInView={{
                        rotateX: -90,
                        transition: {
                          delay: 0.5,
                        },
                      }}
                    >
                      <div
                        style={{ transform: 'translateZ(2.5rem)' }}
                        className="absolute inset-0 bg-stone-800"
                      ></div>
                      <div
                        style={{
                          transform: 'rotateX(90deg) translateZ(2.5rem)',
                        }}
                        className="bg-stone-600"
                      >
                        everything
                      </div>
                    </motion.div>

                    <motion.div
                      className="inline-block relative"
                      style={{ transformStyle: 'preserve-3d' }}
                      initial={{ rotateX: 0 }}
                      whileInView={{ rotateX: -90 }}
                      transition={{
                        delay: 0.7,
                      }}
                    >
                      <div
                        style={{ transform: 'translateZ(2.5rem)' }}
                        className="absolute inset-0 bg-stone-800"
                      ></div>
                      <div
                        style={{
                          transform: 'rotateX(90deg) translateZ(2.5rem)',
                        }}
                        className="bg-stone-600"
                      >
                        you
                      </div>
                    </motion.div>

                    <motion.div
                      className="inline-block relative"
                      style={{ transformStyle: 'preserve-3d' }}
                      initial={{ rotateX: 0 }}
                      whileInView={{ rotateX: -90 }}
                      transition={{
                        delay: 0.9,
                      }}
                    >
                      <div
                        style={{ transform: 'translateZ(2.5rem)' }}
                        className="absolute inset-0 bg-stone-800"
                      ></div>
                      <div
                        style={{
                          transform: 'rotateX(90deg) translateZ(2.5rem)',
                        }}
                        className="bg-stone-600"
                      >
                        need.
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
            <div className="h-[32rem] w-full relative bg-stone-200">
              <div className="max-w-6xl mx-auto flex items-start justify-between">
                <motion.div
                  initial={{ opacity: 0, y: 0 }}
                  whileInView={{
                    opacity: 1,
                    y: -100,
                    transition: {
                      type: 'spring',
                      duration: 0.5,
                      stiffness: 250,
                      damping: 100,
                    },
                  }}
                  className="h-[45rem] bg-stone-100 rounded-xl shadow-md flex items-center justify-center relative z-10 -translate-y-32 w-full basis-1/2 pt-5 m-10"
                >
                  {/* TODO(FMP-345): animate cross chain deposit demo */}
                  <DepositFlow />
                </motion.div>

                <motion.div className="grow flex flex-col items-stretch">
                  <motion.div className="flex-col justify-between text-[3.5rem] leading-none text-stone-600 max-w-[40%] relative z-10 border border-stone-400/90 bg-stone-100/90 inline-flex pl-4 pt-4 pr-8 pb-8 mt-20 mx-20 space-y-8 justify-end">
                    <p className="relative overflow-x-visible">
                      <div className="relative">
                        <div className="relative z-40">give</div>
                        <motion.p
                          initial={{
                            width: '0%',
                          }}
                          whileInView={{
                            width: 'calc(100% + 6rem)',
                          }}
                          className="bg-stone-600/[0.1] absolute inset-0"
                        ></motion.p>
                      </div>
                    </p>
                    <p className="relative overflow-x-visible">
                      <div className="relative">
                        <div className="relative z-40">customers</div>
                        <motion.p
                          initial={{
                            width: '0%',
                          }}
                          whileInView={{
                            width: 'calc(100% + 6rem)',
                          }}
                          className="bg-stone-600/[0.2] absolute inset-0"
                        ></motion.p>
                      </div>
                    </p>
                    <p className="h-0 relative overflow-x-visible">
                      <div className="relative text-stone-200">
                        <div className="relative z-40">freedom.</div>
                        <motion.p
                          initial={{
                            width: '0%',
                          }}
                          whileInView={{
                            width: 'calc(100% + 6rem)',
                            transition: { delay: 0.4 },
                          }}
                          className="bg-stone-600/[0.6] absolute inset-0"
                        ></motion.p>
                      </div>
                    </p>
                  </motion.div>

                  <div className="max-w-2xl inline-block border border-stone-400/90 bg-stone-100/90 font-mono text-stone-600 m-20">
                    <div className="flex flex-col items-center p-5 gap-5">
                      <span className="flex gap-10">
                        <p>
                          Free Market enables potential customers from a variety
                          of chains. Deploy your app on{' '}
                          <span className="font-semibold">one chain</span>, and
                          use Free Market to rapidly support a cross-chain
                          experience for your customers.
                        </p>
                      </span>

                      <div className="flex items-center">
                        <div className="font-serif italic font-bold text-lg px-5">
                          Sign up for our cross-chain deposit beta.
                        </div>

                        <form className="flex flex-col gap-2">
                          <input
                            type="email"
                            placeholder="your email address"
                            className="border border-stone-400/90 text-stone-700"
                          />

                          <button
                            type="submit"
                            className="w-sm p-2 text-center border border-stone-400/90 bg-stone-300/90 text-stone-600/90 font-bold underline hover:opacity-90 active:opacity-75"
                          >
                            Sign Up
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
            <div className="h-[48rem] w-full">
              <div className="h-full flex items-center justify-center">
                <div className="inline-block border border-stone-400/90 bg-stone-100/90 font-mono text-stone-600 max-w-xl">
                  <div className="flex flex-col items-center p-5 gap-5">
                    <span className="flex flex-col gap-5">
                      <div className="font-serif italic font-bold text-[2rem] leading-none">
                        Subscribe to our newsletter!
                      </div>
                      <p className="text-stone-500/90">
                        Subscribe to stay updated on the latest products from
                        Free Market.
                      </p>
                    </span>

                    <div className="w-full flex items-center justify-end">
                      <form className="inline-flex flex-col gap-2">
                        <input
                          type="email"
                          placeholder="your email address"
                          className="border border-stone-400/90 text-stone-700"
                        />

                        <button
                          type="submit"
                          className="w-sm p-2 text-center border border-stone-400/90 bg-stone-300/90 text-stone-600/90 font-bold underline hover:opacity-90 active:opacity-75"
                        >
                          Subscribe
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[4rem] w-full">
              <div className="h-full w-full flex items-center justify-center text-stone-300/90 font-medium">
                &copy; 2022 Free Market Labs, Inc. All Rights Reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
