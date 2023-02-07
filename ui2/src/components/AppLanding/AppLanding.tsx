import { motion } from 'framer-motion'
import ControlledDepositFlow from '@component/ControlledDepositFlow'
import SharedWagmiConfig from '@component/SharedWagmiConfig'
import DepositFlowStateProvider from '@component/DepositFlowStateProvider'

export const AppLanding = (): JSX.Element => {
  return (
    <>
      <div className="w-full min-h-screen relative bg-stone-200">
        <div className="max-w-6xl mx-auto flex items-start justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
            }}
            className="bg-stone-100 rounded-xl shadow-md flex items-center justify-center relative z-10 w-full basis-1/2 pt-5 m-10 max-w-md"
          >
            <SharedWagmiConfig>
              <DepositFlowStateProvider>
                <ControlledDepositFlow includeDeveloperNetworks />
              </DepositFlowStateProvider>
            </SharedWagmiConfig>
          </motion.div>

          <motion.div className="grow flex flex-col items-stretch">
            <div className="mx-4 saturate-[0.9] rounded-full bg-[#627eea] flex justify-between items-center relative overflow-hidden p-2 mt-20 mx-20">
              <div className="grow flex items-center rounded-full bg-stone-600 px-2 py-2">
                <div className="w-full font-mono font-bold text-stone-500 flex items-center gap-2 justify-between px-2">
                  <span className="text-xs">destination</span>
                  <span>
                    <img
                      src="https://staging.aave.com/aaveLogo.svg"
                      className="inline w-14"
                    />{' '}
                    <span className="font-normal text-stone-400">
                      Ethereum Market V3
                    </span>
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
                    src="https://app.aave.com/icons/networks/ethereum.svg"
                  />
                </div>
              </div>
            </div>

            <div className="max-w-2xl inline-block border border-stone-400/90 bg-stone-100/90 font-mono text-stone-600 m-20">
              <div className="flex flex-col items-center p-5 gap-5">
                <span className="flex gap-10">
                  <p className="space-y-4">
                    <div>Announcing xDeposit!</div>

                    <ul className="pl-2 list-disc list-inside space-y-4">
                      <li>Send your funds on a direct flight.</li>
                      <li>Save costs, eliminate extra steps.</li>
                    </ul>

                    <div>Built with:</div>

                    <ul className="pl-2 list-disc list-inside space-y-4">
                      <li>
                        <a
                          className="text-cyan-600 underline cursor-pointer"
                          target="_blank"
                          href="https://stargate.finance/"
                        >
                          Stargate
                        </a>
                      </li>
                      <li>
                        <a
                          className="text-cyan-600 underline cursor-pointer"
                          target="_blank"
                          href="https://fmprotocol.com/"
                        >
                          Free Market Protocol
                        </a>
                      </li>
                    </ul>
                  </p>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
