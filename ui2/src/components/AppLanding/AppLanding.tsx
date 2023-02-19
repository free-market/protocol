import { AnimatePresence, motion } from 'framer-motion'
import ControlledDepositFlow from '@component/ControlledDepositFlow'
import SharedWagmiConfig from '@component/SharedWagmiConfig'
import DepositFlowStateProvider from '@component/DepositFlowStateProvider'
import { useCallback, useState } from 'react'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'
import { useQueryParam, StringParam } from 'use-query-params'
import cx from 'classnames'
import { Helmet } from 'react-helmet'

export const AppLanding = (): JSX.Element => {
  const [accepted, setAccepted] = useState(false)
  const [viewing, setViewing] = useState(false)
  const [layout] = useQueryParam('layout', StringParam)

  const toggleCopy = useCallback(() => {
    setViewing(!viewing)
  }, [viewing, setViewing])

  const handleClick = useCallback(() => {
    setAccepted(true)
  }, [setAccepted])

  const embedded = layout === 'iframe'

  return (
    <>
      {embedded && (
        <Helmet>
          <style type="text/css">
            {'html, body { background-color: transparent !important }'}
          </style>
        </Helmet>
      )}
      <div
        className={cx('w-full min-h-screen relative', {
          'bg-stone-200': !embedded,
        })}
      >
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center px-2">
          <div className="relative z-10 w-full saturate-[0.9] rounded-xl bg-[#399fe7] relative overflow-hidden p-2 m-2 xl:m-20 shadow-md max-w-md space-y-2">
            <div>
              <div className="leading-none text-stone-200 flex justify-between tracking-tight items-center">
                <span className="font-light px-2">DESTINATION:</span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://aave-xdeposit-demo-a4xy.vercel.app/?marketName=proto_arbitrum_v3"
                    target="_blank"
                    className="rounded bg-stone-200 text-stone-600 px-2 py-1 flex gap-2 items-center cursor-pointer relative group"
                  >
                    <div className="absolute inset-0 bg-stone-800/10 invisible group-hover:visible group-active:bg-stone-800/25" />
                    <img
                      src="https://staging.aave.com/aaveLogo.svg"
                      className="inline h-3"
                    />{' '}
                    <span className="font-medium group-hover:underline">
                      Arbitrum Market V3
                    </span>
                    <div className="w-4 h-4 relative">
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
                    <ArrowTopRightOnSquareIcon className="w-5 h-5 inline-block" />
                  </a>

                  <button
                    onClick={toggleCopy}
                    className="p-2 group flex justify-center items-center cursor-pointer rounded-full hover:bg-stone-100/25"
                  >
                    <svg
                      className="w-5 h-5 fill-stone-200 group-hover:fill-stone-200/90 group-active:fill-stone-200/75"
                      focusable="false"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {viewing && (
                  <motion.div
                    className="h-[10rem]"
                    initial={{ opacity: 0, marginBottom: '-10rem', y: 10 }}
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
                      marginBottom: '-10rem',
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
                        <div className="flex items-center justify-between text-xs px-2 border border-transparent text-stone-400 font-light">
                          <div className="text-stone-200 space-y-2">
                            <div>Announcing xDeposit!</div>

                            <ul className="pl-2 list-disc list-inside space-y-2">
                              <li>Send your funds on a direct flight.</li>
                              <li>Save costs, eliminate extra steps.</li>
                            </ul>

                            <div>Built with:</div>

                            <ul className="pl-2 list-disc list-inside space-y-2">
                              <li>
                                <a
                                  className="underline cursor-pointer"
                                  target="_blank"
                                  href="https://stargate.finance/"
                                >
                                  Stargate
                                </a>
                              </li>
                              <li>
                                <a
                                  className="underline cursor-pointer"
                                  target="_blank"
                                  href="https://fmprotocol.com/"
                                >
                                  Free Market Protocol
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
              }}
              className="bg-stone-100 rounded-lg flex items-center justify-center relative z-10 w-full max-w-md"
            >
              <SharedWagmiConfig>
                <DepositFlowStateProvider>
                  <ControlledDepositFlow includeDeveloperNetworks />
                </DepositFlowStateProvider>
              </SharedWagmiConfig>
            </motion.div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        <div
          className="relative z-10"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <AnimatePresence>
            {!accepted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { ease: 'easeOut', duration: 0.3 },
                }}
                exit={{
                  opacity: 0,
                  transition: { ease: 'easeIn', duration: 0.3 },
                }}
                className="fixed inset-0 bg-stone-800/75"
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!accepted && (
              <>
                <div className="fixed inset-0 z-10 overflow-y-auto">
                  <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    {/*
  Modal panel, show/hide based on modal state.

  Entering: "ease-out duration-300"
    From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    To: "opacity-100 translate-y-0 sm:scale-100"
  Leaving: "ease-in duration-200"
    From: "opacity-100 translate-y-0 sm:scale-100"
    To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
*/}
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { ease: 'easeOut', duration: 0.3 },
                      }}
                      exit={{
                        opacity: 0,
                        y: 4,
                        scale: 0.95,
                        transition: { ease: 'easeIn', duration: 0.2 },
                      }}
                      className="relative overflow-hidden rounded-lg bg-white text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg"
                    >
                      <div className="w-full bg-red-600 px-4 py-3 flex px-6 justify-center">
                        <div className="inline-block bg-stone-50 text-stone-900 font-mono px-2 rounded-2xl font-bold text-3xl sm:text-6xl my-2">
                          DISCLAIMER
                        </div>
                      </div>
                      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            {/* Heroicon name: outline/exclamation-triangle */}
                            <svg
                              className="h-6 w-6 text-red-600"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                              />
                            </svg>
                          </div>
                          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left sm:pr-10">
                            <h3
                              className="text-lg font-medium leading-6 text-stone-900"
                              id="modal-title"
                            >
                              THIS SOFTWARE IS PROVIDED AS-IS WITHOUT A
                              WARRANTY. PROCEED AT YOUR OWN RISK.
                            </h3>
                            <div className="mt-2 space-y-2">
                              <p className="text-sm text-stone-500">
                                This software is part of a MAINNET ALPHA
                                release.
                              </p>
                              <p className="text-sm text-stone-500">
                                It may contain mistakes, defects and your funds
                                may be lost.
                              </p>
                              <p className="text-sm text-stone-500">
                                Free Market Labs, Inc. is not liable for any
                                funds lost during the operation of this
                                software.
                              </p>
                              <p className="text-sm text-stone-500">
                                In no event shall Free Market Labs, Inc. be
                                liable for any claim, damages or other
                                liability, whether in an action of contract,
                                tort or otherwise, arising from, out of or in
                                connection with the software or the use or other
                                dealings in the software.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-stone-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                          onClick={handleClick}
                          type="button"
                          className="relative inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm group"
                          autoFocus
                        >
                          <div className="absolute inset-0 rounded-md bg-stone-800/25 invisible group-hover:visible group-active:bg-stone-800/50" />
                          <span>I understand</span>
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </>
            )}
          </AnimatePresence>
        </div>
      </AnimatePresence>
    </>
  )
}

function Icon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 5112 1700"
      className="max-w-sm mx-auto pt-10"
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
        <path fill="#fff" d="M2028.15 1074H0v512h2028.15v-512z"></path>
      </mask>
      <g>
        <path
          fill="#57534e"
          d="M683.028 1374.51h44.555c0 15.08 7.541 24.9 36.047 24.9 25.873 0 35.052-7.54 35.052-19.34 0-5.89-2.95-10.47-11.462-12.43-8.524-1.97-21.623-3.28-37.685-4.6-23.252-1.97-41.28-5.56-51.101-12.45-9.178-6.55-15.406-18.34-15.406-31.77 0-35.05 36.032-54.39 80.919-54.39 53.079 0 77.324 20.33 77.324 58H797.37c-.329-17.05-8.184-25.89-32.757-25.89-22.278 0-32.113 7.53-32.113 18.68 0 6.87 2.624 12.11 11.802 14.41 8.183 1.96 22.595 3.28 39.968 4.91 19.983 1.97 34.065 3.94 46.182 10.82 10.49 5.89 18.03 18.02 18.03 32.1 0 34.07-29.163 54.06-84.535 54.06-57.001 0-80.919-24.24-80.919-57.01zM884.183 1373.21v-67.48h-23.915v-38.67h19.328c7.54 0 10.161-4.25 11.144-14.08l2.296-22.6h40.951v36.68h51.755v38.67h-51.755v64.86c0 16.72 7.854 21.95 27.508 21.95 6.886 0 17.047-.98 22.61-2.3v37.68c-4.262.98-18.019 3.62-31.448 3.62-50.455 0-68.474-22.28-68.474-58.33z"
        ></path>
        <path
          fill="#57534e"
          fillRule="evenodd"
          d="M1000.15 1382.38c0-26.54 19-45.87 61.92-45.87h52.73v-10.8c0-19.67-11.13-27.54-34.06-27.54-18.67 0-29.49 7.87-29.49 20.97 0 .98 0 3.62.33 6.88h-45.86c-.34-2.61-.67-6.21-.67-9.49 0-32.76 28.84-52.1 77.98-52.1 51.43 0 81.58 22.94 81.58 66.18v98.28h-49.81c.99-8.18 2.3-22.93 2.3-32.75h-.33c-4.92 22.93-23.26 35.38-52.74 35.38-37.68 0-63.88-16.39-63.88-49.14zm114.66-15.72v-3.27h-48.15c-13.44 0-21.62 6.21-21.62 15.39 0 12.44 10.8 19 28.82 19 25.88 0 40.95-11.46 40.95-31.12z"
          clipRule="evenodd"
        ></path>
        <path
          fill="#57534e"
          d="M1187.85 1267.05h49.79l-1.96 46.2h.65c6.88-30.8 24.25-48.82 56.03-48.82 33.09 0 52.43 21.3 52.43 63.23 0 9.18-.99 23.59-1.65 32.11h-45.21c.65-7.86.99-16.05.99-20.96 0-23.59-9.51-33.09-25.23-33.09-21.3 0-36.05 17.35-36.05 53.39v69.78h-49.79v-161.84z"
        ></path>
        <path
          fill="#57534e"
          fillRule="evenodd"
          d="M1537.75 1442.34c0 37.02-33.1 56.68-89.12 56.68-57 0-90.75-15.73-90.75-42.6 0-17.03 11.15-27.52 29.16-29.49v-.32c-9.83-6.22-15.08-15.07-15.08-26.54 0-15.39 7.87-24.89 20-30.47v-.33c-17.05-9.82-26.54-25.87-26.54-46.84 0-36.37 28.18-57.99 75.67-57.99 19 0 34.74 3.28 46.85 9.83l.33-.65c-6.55-5.9-9.49-12.46-9.49-18.36 0-13.42 13.43-21.28 34.07-21.28 8.85 0 13.43.65 18.01 1.64v31.44c-2.95-.65-6.23-.98-9.83-.98-10.48 0-15.4 4.59-15.4 12.11 0 3.94 1.31 8.85 3.61 14.76 5.24 8.18 7.86 18.01 7.86 29.48 0 36.37-28.17 57.65-76.01 57.65-9.82 0-18.66-.97-26.86-2.61-1.3 1.97-2.94 5.9-2.94 10.48 0 7.21 5.89 11.47 15.72 11.47h52.42c36.69 0 58.32 16.05 58.32 42.92zm-49.8 6.88c0-8.85-6.55-13.77-20.97-13.77h-38.33c-13.44 0-21.29 5.58-21.29 14.76 0 12.11 15.08 18.66 40.62 18.66 25.23 0 39.97-6.88 39.97-19.65zm-75.69-126.79c0 16.37 10.81 26.2 28.83 26.2 18.36 0 29.16-9.83 29.16-26.2 0-16.71-10.8-26.54-29.16-26.54-18.02 0-28.83 9.83-28.83 26.54zM1548.88 1382.38c0-26.54 18.99-45.87 61.91-45.87h52.74v-10.8c0-19.67-11.13-27.54-34.06-27.54-18.68 0-29.48 7.87-29.48 20.97 0 .98 0 3.62.31 6.88h-45.85c-.33-2.61-.67-6.21-.67-9.49 0-32.76 28.83-52.1 77.98-52.1 51.43 0 81.57 22.94 81.57 66.18v98.28h-49.8c.99-8.18 2.31-22.93 2.31-32.75h-.34c-4.92 22.93-23.26 35.38-52.74 35.38-37.67 0-63.88-16.39-63.88-49.14zm114.65-15.72v-3.27h-48.14c-13.44 0-21.63 6.21-21.63 15.39 0 12.44 10.81 19 28.82 19 25.89 0 40.95-11.46 40.95-31.12z"
          clipRule="evenodd"
        ></path>
        <path
          fill="#57534e"
          d="M1750.34 1373.21v-67.48h-23.91v-38.67h19.34c7.52 0 10.15-4.25 11.13-14.08l2.29-22.6h40.96v36.68h51.76v38.67h-51.76v64.86c0 16.72 7.86 21.95 27.52 21.95 6.88 0 17.03-.98 22.59-2.3v37.68c-4.25.98-18.02 3.62-31.44 3.62-50.46 0-68.48-22.28-68.48-58.33z"
        ></path>
        <path
          fill="#57534e"
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
          <path fill="#fff" d="M512.003 1074H0v512h512.003v-512z"></path>
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
            <path fill="#fff" d="M512.003 1074H0v512h512.003v-512z"></path>
          </mask>
          <g fill="#78716C">
            <path d="M306.775 1094.37l13.626 31.91A264.228 264.228 0 00459.72 1265.6l31.916 13.63c8.352 3.56 15.133 8.67 20.367 14.75-15.893-113.96-106.022-204.1-219.98-219.98 6.071 5.22 11.191 12.01 14.752 20.37zM20.368 1279.23l31.915-13.63a264.292 264.292 0 00139.332-139.32l13.612-31.91c3.574-8.36 8.683-15.15 14.753-20.37C106.023 1089.88 15.894 1180.02 0 1293.98c5.234-6.08 12.015-11.19 20.368-14.75zM491.636 1380.76l-31.916 13.63c-62.664 26.74-112.576 76.67-139.319 139.33l-13.626 31.9c-3.561 8.36-8.681 15.15-14.752 20.38 113.958-15.89 204.087-106.03 219.98-219.99-5.234 6.08-12.015 11.19-20.367 14.75zM205.227 1565.62l-13.612-31.9c-26.757-62.66-76.669-112.59-139.332-139.33l-31.915-13.63c-8.353-3.56-15.134-8.67-20.368-14.75 15.894 113.96 106.023 204.1 219.98 219.99-6.07-5.23-11.179-12.02-14.753-20.38z"></path>
          </g>
          <path
            fill="#57534e"
            d="M139.885 1304.97l15.729-6.72a130.247 130.247 0 0068.659-68.65l6.705-15.73c9.404-22.02 40.634-22.02 50.039 0l6.704 15.73a130.242 130.242 0 0068.66 68.65l15.726 6.72c22.031 9.4 22.031 40.62 0 50.02l-15.726 6.72a130.226 130.226 0 00-68.66 68.66l-6.704 15.71c-9.405 22.03-40.635 22.03-50.039 0l-6.705-15.71a130.231 130.231 0 00-68.659-68.66l-15.729-6.72c-22.028-9.4-22.028-40.62 0-50.02z"
          ></path>
        </g>
      </g>
      <path
        fill="#78716C"
        d="M2272.06 1462.55h71.68v-94.72h88.57v-67.07h-88.57v-94.21h-71.68v94.21h-88.58v67.07h88.58v94.72z"
      ></path>
      <path
        fill="#57534e"
        style={{ transform: 'translate(493px,195px) scale(0.84)' }}
        d="M3157.88 1471H3219v-153h36v-39h-36v-9.38c0-21.37 12.75-23.25 36-22.5V1204c-33-3.38-64.87.37-81.37 16.5-10.13 10.12-15.75 24.75-15.75 44.62V1279h-24.75v39h24.75v153zm116.48 0h61.13v-86.25c0-41.63 24-60 61.5-54.75h1.5v-52.5c-2.63-1.13-6.38-1.5-12-1.5-23.25 0-39 10.12-52.5 33h-1.13v-30h-58.5v192zm233.64 5.63c24.38 0 43.88-6.38 60-17.63 16.88-11.63 28.13-28.13 32.25-45.38h-59.62c-5.25 12-15.75 19.13-31.88 19.13-25.12 0-39.37-16.13-43.12-42h138c.37-39-10.88-72.38-33.75-93.38-16.5-15-38.25-24-65.63-24-58.5 0-98.62 43.88-98.62 101.26 0 58.12 39 102 102.37 102zm-42-122.26c4.13-22.87 16.13-37.5 39.38-37.5 19.87 0 34.12 14.63 36.37 37.5H3466zm251.84 122.26c24.38 0 43.88-6.38 60-17.63 16.88-11.63 28.13-28.13 32.25-45.38h-59.62c-5.25 12-15.75 19.13-31.88 19.13-25.12 0-39.37-16.13-43.12-42h138c.37-39-10.88-72.38-33.75-93.38-16.5-15-38.25-24-65.63-24-58.5 0-98.62 43.88-98.62 101.26 0 58.12 39 102 102.37 102zm-42-122.26c4.13-22.87 16.13-37.5 39.38-37.5 19.87 0 34.12 14.63 36.37 37.5h-75.75zM3833.93 1471h61.13v-107.63c0-22.87 11.25-39 30.37-39 18.38 0 27 12 27 32.63v114h61.13v-107.63c0-22.87 10.87-39 30.37-39 18.38 0 27 12 27 32.63v114h61.13v-124.88c0-43.12-21.75-72.75-65.25-72.75-24.75 0-45.38 10.5-60.38 33.75h-.75c-9.75-20.62-28.87-33.75-54-33.75-27.75 0-46.12 13.13-58.12 33h-1.13V1279h-58.5v192zm382.56 4.88c28.87 0 45.75-10.13 57-26.26h.75c1.5 9.75 3.37 17.25 6.37 21.38h59.25v-2.63c-5.25-3.37-6.75-12-6.75-27.37v-96.75c0-24-7.87-42.75-24.37-54.75-13.88-10.5-33.38-15.75-62.25-15.75-58.13 0-85.5 30.37-87 66h56.25c1.87-16.13 11.62-24.75 31.12-24.75 18.38 0 26.25 8.25 26.25 20.62 0 13.13-12.75 16.88-48.75 21.38-39.75 5.25-73.5 18-73.5 60.37 0 37.88 27.38 58.51 65.63 58.51zm19.5-39.01c-15 0-26.25-6-26.25-21.37 0-14.63 9.75-20.63 33.37-25.88 12.38-3 23.63-6 31.5-10.12v22.87c0 20.63-15.75 34.5-38.62 34.5zm126.75 34.13h61.13v-86.25c0-41.63 24-60 61.5-54.75h1.5v-52.5c-2.63-1.13-6.38-1.5-12-1.5-23.25 0-39 10.12-52.5 33h-1.13v-30h-58.5v192zm143.56 0h60.37v-58.88l18.38-19.5 46.12 78.38h70.88l-75.38-120 67.5-72h-70.5l-57 64.87v-141h-60.37V1471zm288.57 5.63c24.38 0 43.88-6.38 60-17.63 16.88-11.63 28.13-28.13 32.25-45.38h-59.62c-5.25 12-15.75 19.13-31.88 19.13-25.12 0-39.37-16.13-43.12-42h138c.37-39-10.88-72.38-33.75-93.38-16.5-15-38.25-24-65.63-24-58.5 0-98.62 43.88-98.62 101.26 0 58.12 39 102 102.37 102zm-42-122.26c4.13-22.87 16.13-37.5 39.38-37.5 19.87 0 34.12 14.63 36.37 37.5h-75.75zm230.55 118.88c16.5 0 28.13-1.5 33.38-3v-44.63c-2.25 0-8.25.38-13.5.38-13.13 0-21.38-3.75-21.38-18.75v-90h34.88V1279h-34.88v-60.75h-59.62V1279h-25.5v38.25h25.5v103.12c0 41.25 25.5 52.88 61.12 52.88z"
      ></path>
      <path
        stroke="#78716C"
        strokeWidth="58.835"
        d="M2821.82 1571.63c124.71 0 225.81-101.1 225.81-225.81 0-124.72-101.1-225.82-225.81-225.82-124.72 0-225.82 101.1-225.82 225.82 0 124.71 101.1 225.81 225.82 225.81z"
      ></path>
      <path
        stroke="#57534e"
        strokeWidth="58.709"
        d="M2753.12 1476.32c77.22-.82 64.81-63.04 64.11-130.79M2751.42 1335.08h140.79M2891.87 1215.32c-69.08 0-74.14 40.75-74.14 69.12 0 .39-.02 6.06-.02 6.46"
      ></path>
      <path
        fill="#57534e"
        d="M8.75 894h222.5L347.5 702.75h2.5L455 894h236.25l-217.5-338.75 190-301.25H450l-90 165h-2.5l-95-165H30l201.25 303.75L8.75 894z"
      ></path>
      <path
        fill="#78716C"
        d="M981.963 707.75v-522.5h132.497c138.75 0 217.5 105 217.5 267.5 0 163.75-75 255-220 255H981.963zM760.713 894h367.497c112.5 0 202.5-28.75 272.5-81.25 100-76.25 155-202.5 155-360C1555.71 179 1389.46.25 1141.96.25H760.713V894zm1181.347 18.75c81.25 0 146.25-21.25 200-58.75 56.25-38.75 93.75-93.75 107.5-151.25h-198.75c-17.5 40-52.5 63.75-106.25 63.75-83.75 0-131.25-53.75-143.75-140h460c1.25-130-36.25-241.25-112.5-311.25-55-50-127.5-80-218.75-80-195 0-328.75 146.25-328.75 337.5 0 193.75 130 340 341.25 340zm-140-407.5c13.75-76.25 53.75-125 131.25-125 66.25 0 113.75 48.75 121.25 125h-252.5zm526.96 600h203.75v-277.5h2.5c40 53.75 98.75 86.25 181.25 86.25 167.5 0 278.75-132.5 278.75-340 0-192.5-103.75-338.75-273.75-338.75-87.5 0-150 38.75-193.75 96.25h-3.75V254h-195v851.25zm335-348.75c-87.5 0-137.5-71.25-137.5-175s45-182.5 133.75-182.5c87.5 0 128.75 72.5 128.75 182.5 0 108.75-47.5 175-125 175zm712.37 12.5c-88.75 0-135-77.5-135-193.75s46.25-195 135-195 136.25 78.75 136.25 195S3465.14 769 3376.39 769zm1.25 145c206.25 0 341.25-146.25 341.25-338.75s-135-338.75-341.25-338.75c-205 0-342.5 146.25-342.5 338.75S3172.64 914 3377.64 914zm682.62 0c167.5 0 291.25-72.5 291.25-212.5 0-163.75-132.5-192.5-245-211.25-81.25-15-153.75-21.25-153.75-66.25 0-40 38.75-58.75 88.75-58.75 56.25 0 95 17.5 102.5 75h187.5c-10-126.25-107.5-205-288.75-205-151.25 0-276.25 70-276.25 205 0 150 118.75 180 230 198.75 85 15 162.5 21.25 162.5 78.75 0 41.25-38.75 63.75-100 63.75-67.5 0-110-31.25-117.5-95h-192.5c6.25 141.25 123.75 227.5 311.25 227.5zm357.39-20h203.75V254h-203.75v640zm0-728.75h203.75V.25h-203.75v165zm555.26 736.25c55 0 93.75-5 111.25-10V742.75c-7.5 0-27.5 1.25-45 1.25-43.75 0-71.25-12.5-71.25-62.5v-300h116.25V254h-116.25V51.5h-198.75V254h-85v127.5h85v343.75c0 137.5 85 176.25 203.75 176.25zM1457.85 1059.35h24.45v-33.3h.3c4.8 6.45 11.85 10.35 21.75 10.35 20.1 0 33.45-15.9 33.45-40.8 0-23.1-12.45-40.65-32.85-40.65-10.5 0-18 4.65-23.25 11.55h-.45v-9.3h-23.4v102.15zm40.2-41.85c-10.5 0-16.5-8.55-16.5-21s5.4-21.9 16.05-21.9c10.5 0 15.45 8.7 15.45 21.9 0 13.05-5.7 21-15 21zm85.48 1.5c-10.65 0-16.2-9.3-16.2-23.25s5.55-23.4 16.2-23.4c10.65 0 16.35 9.45 16.35 23.4s-5.7 23.25-16.35 23.25zm.15 17.4c24.75 0 40.95-17.55 40.95-40.65 0-23.1-16.2-40.65-40.95-40.65-24.6 0-41.1 17.55-41.1 40.65 0 23.1 16.5 40.65 41.1 40.65zm63.69-2.4h22.65l9.15-34.8c1.65-6 3.45-13.8 3.45-13.8h.3s1.65 7.8 3.3 13.8l9 34.8h22.95l23.55-76.8h-24.15l-8.55 31.8c-1.65 6.15-3.6 15-3.6 15h-.3s-1.95-8.85-3.6-15.45l-8.4-31.35h-20.7l-8.1 31.35c-1.65 6.45-3.45 15.3-3.45 15.3h-.3s-1.8-8.7-3.45-14.85l-8.4-31.8h-24.9l23.55 76.8zm134.65 2.25c9.75 0 17.55-2.55 24-7.05 6.75-4.65 11.25-11.25 12.9-18.15h-23.85c-2.1 4.8-6.3 7.65-12.75 7.65-10.05 0-15.75-6.45-17.25-16.8h55.2c.15-15.6-4.35-28.95-13.5-37.35-6.6-6-15.3-9.6-26.25-9.6-23.4 0-39.45 17.55-39.45 40.5 0 23.25 15.6 40.8 40.95 40.8zm-16.8-48.9c1.65-9.15 6.45-15 15.75-15 7.95 0 13.65 5.85 14.55 15h-30.3zm63.24 46.65h24.45v-34.5c0-16.65 9.6-24 24.6-21.9h.6v-21c-1.05-.45-2.55-.6-4.8-.6-9.3 0-15.6 4.05-21 13.2h-.45v-12h-23.4v76.8zm93.45 2.25c9.75 0 17.55-2.55 24-7.05 6.75-4.65 11.25-11.25 12.9-18.15h-23.85c-2.1 4.8-6.3 7.65-12.75 7.65-10.05 0-15.75-6.45-17.25-16.8h55.2c.15-15.6-4.35-28.95-13.5-37.35-6.6-6-15.3-9.6-26.25-9.6-23.4 0-39.45 17.55-39.45 40.5 0 23.25 15.6 40.8 40.95 40.8zm-16.8-48.9c1.65-9.15 6.45-15 15.75-15 7.95 0 13.65 5.85 14.55 15h-30.3zm93.39 49.05c10.05 0 18-4.8 22.65-12.75h.3V1034h23.4V926.75h-24.45v39.15h-.45c-4.5-6.45-10.65-10.95-21.45-10.95-19.8 0-33.6 16.65-33.6 40.65 0 25.65 13.95 40.8 33.6 40.8zm6.3-19.35c-9.45 0-15.15-8.4-15.15-21.75 0-12.9 5.7-21.9 15.45-21.9 10.65 0 15.9 9.3 15.9 22.2 0 12.6-6 21.45-16.2 21.45zm121.97 19.35c19.8 0 32.7-15.3 32.7-40.8 0-23.1-12.9-40.65-32.85-40.65-10.5 0-17.1 4.35-21.9 10.95h-.45v-39.15h-24.45V1034h23.4v-9.75h.3c4.8 7.95 13.05 12.15 23.25 12.15zm-6.9-19.35c-10.05 0-16.35-8.7-16.35-21.45 0-12.6 5.25-22.05 16.05-22.05 9.9 0 15.15 8.7 15.15 21.9 0 13.35-5.25 21.6-14.85 21.6zm47.46 42.3h15.9c15.45 0 22.8-6.3 28.95-24.3l26.55-77.85h-24.45l-10.05 32.7c-2.4 7.5-4.5 17.7-4.5 17.7h-.3s-2.4-10.2-4.8-17.7l-10.35-32.7h-25.8l22.65 59.1c3.15 8.1 4.65 12.6 4.65 15.9 0 5.25-2.85 8.1-10.05 8.1h-8.4v19.05z"
      ></path>
    </svg>
  )
}
