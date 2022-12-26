// // import { FrontDoorInstance, WorkflowRunnerInstance } from '../types/truffle-contracts'
// import { IWorkflowRunner__factory, IERC20__factory, IWorkflowRunner } from '../types/ethers-contracts'
// import { ethers, Wallet, BigNumber } from 'ethers'

// import { ADDRESS_ZERO } from '../utils/ethers-utils'

// import BN from 'bn.js'

// import { promisify } from 'util'
// import { FrontDoorInstance, WorkflowRunnerInstance } from '../types/truffle-contracts'
// import { getTestWallet } from '../utils/ganachUtils'
// import { WorkflowStruct } from '../types/ethers-contracts/contracts/IWorkflowRunner'
// const sleep = promisify(setTimeout)

// const TEST_WALLET_INDEX = 1
// const FrontDoor = artifacts.require('FrontDoor')
// const WorkflowRunner = artifacts.require('WorkflowRunner')
// const WrapEther = artifacts.require('WrapEther')
// const UnwrapEther = artifacts.require('UnwrapEther')

// contract('FreeMarket', function (accounts: string[]) {
//   const OWNER = accounts[0]
//   const USER_ACCOUNT = accounts[2]
//   const TEST_WALLET_INDEX = 2
//   let frontDoor: FrontDoorInstance
//   // let workflowRunner: WorkflowRunnerInstance
//   const WRAP_ETHER_ACTIONID = 1
//   const UNWRAP_ETHER_ACTIONID = 2
//   const WETH_TOKEN_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
//   const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')

//   async function ensureWorkflowRunnerDeployed() {
//     const upstream = await frontDoor.getUpstream()
//     if (upstream === ADDRESS_ZERO) {
//       // TODO deploy everything needed for the test etc
//     }
//     const userWallet = getTestWallet(TEST_WALLET_INDEX, provider)
//     return IWorkflowRunner__factory.connect(frontDoor.address, userWallet)
//   }

//   before(async () => {
//     frontDoor = await FrontDoor.deployed()
//     // workflowRunner = await WorkflowRunner.at(frontDoor.address)
//     // const workflowRunnerInstance = await WorkflowRunner.new()
//     // await sleep(1100)
//     // await frontDoor.setUpstream(workflowRunnerInstance.address)
//     // await sleep(1100)
//     // const wrapEther = await WrapEther.new()
//     // await sleep(1100)
//     // await workflowRunnerInstance.setActionAddress(WRAP_ETHER_ACTIONID, wrapEther.address)
//     // await sleep(1100)
//     // const unwrapEther = await WrapEther.new()
//     // await workflowRunner.setActionAddress(UNWRAP_ETHER_ACTIONID, unwrapEther.address)
//   })

//   it.skip('executes a workflow that wraps ether', async () => {
//     const amount = '1000000000000000000'
//     // const amount = new BN('0')

//     const workflowRunner = await ensureWorkflowRunnerDeployed()
//     const workflow = {
//       steps: [
//         {
//           actionId: WRAP_ETHER_ACTIONID,
//           fromAsset: WETH_TOKEN_ADDRESS,
//           amount,
//           amountIsPercent: false,
//           args: [],
//           nextStepIndex: 0,
//         },
//       ],
//     }
//     try {
//       const result = await workflowRunner.executeWorkflow(workflow, [], { gasLimit: 1_000_000 })
//       console.log(result)
//     } catch (e) {
//       console.log('err', e)
//     }
//   })
// })
