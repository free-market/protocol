import CoreProvider from '@component/CoreProvider'
import StepBuilder from '@component/StepBuilder'
import StepHeading from '@component/StepHeading'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { useCallback, useState } from 'react'

export const Landing = (): JSX.Element => {
  const [firstStepButtonActive, setFirstStepButtonActive] = useState(false)
  const [firstStepClicked, setFirstStepClicked] = useState(false)
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
          delay: titleDelay + titleTextDelay + titleSpeed * i,
        },
        color: {
          type: 'spring',
          damping: 50,
          stiffness: 50,
          duration: 0,
          delay: titleDelay + titleTextDelay + titleSpeed * 2 * i + 0.5,
        },
        scale: {
          type: 'spring',
          damping: 20,
          stiffness: 150,
          bounce: 1,
          delay: titleDelay + titleTextDelay + titleSpeed * i,
          ease: [0, 0.71, 0.2, 1.5],
        },
        rotate: {
          type: 'spring',
          damping: 100,
          stiffness: 1000,
          bounce: 1,
          delay: titleDelay + titleTextDelay + titleSpeed * i,
          mass: 10,
        },
      },
    }),
  }

  const baseHeroDelay = 2.8

  const startFirstFakeClick = useCallback(() => {
    setTimeout(() => {
      setFirstStepButtonActive(false)
      setFirstStepButtonActive(true)
      setTimeout(() => {
        setFirstStepButtonActive(false)
        setFirstStepClicked(true)
      }, 150)
    }, 500)
  }, [])

  return (
    <>
      <div className="bg-stone-700 min-h-[38rem]">
        <div className="md:flex items-center px-8 max-w-7xl mx-auto">
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
                      delay: titleDelay + titleSpeed * 3.5,
                    },
                    x: {
                      type: 'spring',
                      damping: 50,
                      duration: 0.1,
                      stiffness: 450,
                      bounce: 1,
                      delay: titleDelay + titleSpeed * 3.5,
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
                      delay: titleDelay + titleSpeed * 2.5,
                    },
                    x: {
                      type: 'spring',
                      damping: 50,
                      duration: 0.1,
                      stiffness: 450,
                      bounce: 1,
                      delay: titleDelay + titleSpeed * 2.5,
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
                      delay: titleDelay + titleSpeed * 1.5,
                    },
                    x: {
                      type: 'spring',
                      damping: 50,
                      duration: 0.1,
                      stiffness: 450,
                      bounce: 1,
                      delay: titleDelay + titleSpeed * 1.5,
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
                      automation
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
                  <span className="italic">easy</span>.
                </motion.span>
              </motion.div>
            </div>
          </div>
        </div>
        <div className="flex justify-evenly">
          {/*
          <div className="h-96 max-w-6xl mx-auto rounded-xl shadow-md overflow-hidden">
            <CoreProvider initialCatalog="open" initialTriggerStep='hidden'>
              {' '}
              <Layout
                background='transparent'
                height="auto"
                gutter="hidden"
                stepBuilder={
                  <StepBuilder
                    empty={
                      <StepCatalog
                        content={
                          <>
                            <div className="pt-2 pb-1 space-y-2">

          <StepHeading actionGroupName="curve" />
          <StepHeading actionGroupName="1inch" />
          <StepHeading actionGroupName="zksync" />
                            <StepHeading actionGroupName="aave" />
                            </div>
                          </>
                        }
                      />
                    }
                  />
                }
                stepCatalog={null}
              />{' '}
            </CoreProvider>
          </div>
            */}
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
            className="h-96 w-[calc(33%_-_4rem)] bg-stone-800 rounded-xl shadow-md flex items-center justify-center relative"
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
                className="absolute top-0 right-0 left-0 bottom-0 flex items-center justify-center z-20 user-select-none"
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
            className="h-96 w-[calc(33%_-_4rem)] bg-stone-800 rounded-xl shadow-md flex items-center justify-center relative"
          >
            <CoreProvider>
              <div className="absolute top-0 right-0 left-0 bottom-0 flex items-center justify-center z-20 opacity-0 pointer-events-none">
                <img src="/pointinghand.svg" />
              </div>
              <motion.div className="h-96 grow basis-0 max-w-sm rounded-xl relative super-shadow overflow-hidden">
                <div className="h-full p-2 rounded-xl bg-stone-900 max-w-sm grow basis-0 space-y-5 overflow-y-auto relative">
                  <AnimatePresence mode="wait">
                    <StepBuilder
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
            className="h-96 w-[calc(33%_-_4rem)] bg-stone-800 rounded-xl shadow-md flex items-center justify-center relative"
          >
            <CoreProvider>
              <div className="absolute top-0 right-0 left-0 bottom-0 flex items-center justify-center z-20 opacity-0">
                <img src="/pointinghand.svg" />
              </div>
            </CoreProvider>
          </motion.div>
        </div>
      </div>
    </>
  )
}
