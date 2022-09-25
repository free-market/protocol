import { getEthConfig } from '@fmp/sdk'
import * as ethers from 'ethers'
import { Weth__factory, IWorkflowRunner__factory, getEthBalanceShortfall, STEPID, getTestWallet, printGasFromReceipt } from '@fmp/evm'

const EVM_CONFIG = getEthConfig('goerli')

// async function ensureWeth(fromWallet: ethers.Wallet, toAddress: string, wethTargetAmount: ethers.BigNumber) {
//   console.log(`ensuring weth balance, target amount is ${ethers.utils.formatEther(wethTargetAmount)}`)
//   const workflowRunner = IWorkflowRunner__factory.connect(toAddress, fromWallet)
//   const weth = Weth__factory.connect(EVM_CONFIG.weth, fromWallet)

//   // get current weth balance
//   let tokenBalance = await weth.balanceOf(toAddress)
//   const wethShortfall = wethTargetAmount.sub(tokenBalance)
//   if (!wethShortfall.isNegative() && !wethShortfall.isZero()) {
//     // get amount of eth required to send
//     const ethToTransfer = await getEthBalanceShortfall(wethTargetAmount, fromWallet.provider, toAddress)
//     const args = [
//       {
//         stepId: STEPID.ETH_WETH,
//         amount: wethShortfall,
//         amountIsPercent: false,
//         fromToken: '0',
//         args: [],
//       },
//     ]
//     const asdf = await workflowRunner.estimateGas.executeWorkflow(args, { value: ethToTransfer, gasLimit: 1_000_000 })
//     const tx = await workflowRunner.executeWorkflow(args, { value: ethToTransfer, gasLimit: 1_000_000 })
//     let receipt = await tx.wait(1)
//     printGasFromReceipt(receipt, 'ethToWeth')
//     tokenBalance = await weth.balanceOf(toAddress)
//     return tokenBalance
//   }
// }

