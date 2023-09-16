import { expect } from 'chai'
import hardhat from 'hardhat'
import { IERC20, IERC20Metadata__factory, IERC20__factory, WorkflowRunner, WorkflowRunner__factory } from '@freemarket/runner'
import {
  assert,
  AssetInfoService,
  AssetReference,
  Chain,
  createStandardProvider,
  ExecutionEvent,
  ExecutionLogAssetAmount,
  formatNumber,
  getEthersProvider,
  IWorkflowInstance,
  NATIVE_ASSETS,
  translateChain,
  Workflow,
  WorkflowInstance,
} from '@freemarket/client-sdk'
const { ethers, deployments, getNamedAccounts } = hardhat
import { AaveSupplyAction__factory, IAaveV3Pool__factory } from '@freemarket/aave'
import frontDoorAddressesJson from '@freemarket/runner/deployments/front-doors.json'
const frontDoorAddresses: Record<string, string> = frontDoorAddressesJson
import { Signer } from '@ethersproject/abstract-signer'
import { Provider } from '@ethersproject/abstract-provider'
import { parseEther } from '@ethersproject/units'
import { shouldRunE2e } from './utils'

async function getErc20(symbol: string, chain: Chain, workflowInstance: IWorkflowInstance) {
  const assetRef: AssetReference = {
    type: 'fungible-token',
    symbol,
  }
  const asset = await workflowInstance.dereferenceAsset(assetRef, chain)
  assert(asset.type === 'fungible-token')
  const assetAddress = asset.chains[chain]!.address
  const stdProvider = workflowInstance.getProvider(chain)
  const ethersProvider = getEthersProvider(stdProvider)
  const erc20 = IERC20__factory.connect(assetAddress, ethersProvider)
  return erc20
}

async function getAaveAToken(token: IERC20, chain: string, runner: WorkflowRunner) {
  const aaveSupplyActionAddress = await runner.getStepAddress(102)
  const aaveSupplyAction = AaveSupplyAction__factory.connect(aaveSupplyActionAddress, runner.provider)
  const poolAddress = await aaveSupplyAction.poolAddress()
  const pool = IAaveV3Pool__factory.connect(poolAddress, runner.provider)
  const reserveData = await pool.getReserveData(token.address)
  const aTokenAddress = reserveData.aTokenAddress
  const aToken = IERC20__factory.connect(aTokenAddress, runner.provider)
  return aToken
}

async function getWorkflowInstance(workflow: Workflow, signer: Signer) {
  const instance = new WorkflowInstance(workflow)
  const stdProvider = createStandardProvider(signer.provider!, signer)
  let nonForkedProvider = stdProvider
  const network = await signer.provider!.getNetwork()
  const chainId = network.chainId
  if (chainId === 31337) {
    const ethereumConfig: any = hardhat.config.networks.ethereum
    const nonForkedEthersProvider = new ethers.providers.JsonRpcProvider(ethereumConfig.url)
    nonForkedProvider = createStandardProvider(nonForkedEthersProvider, signer)
  }
  instance.setProvider('start-chain', stdProvider, nonForkedProvider)
  instance.setProvider('ethereum', stdProvider, nonForkedProvider)
  return instance
}

const setup = deployments.createFixture(async () => {
  const { otherUser } = await getNamedAccounts()
  const otherUserSigner = await ethers.getNamedSigner('otherUser')
  const workflowRunner = WorkflowRunner__factory.connect(frontDoorAddresses['local'], otherUserSigner)

  return {
    workflowRunner,
    otherUser,
    otherUserSigner,
  }
})

if (shouldRunE2e()) {
  describe('supply USDC into aave', async () => {
    it('runs a basic single chain workflow', async () => {
      const { otherUser, workflowRunner, otherUserSigner } = await setup()

      const workflow: Workflow = {
        steps: [
          {
            type: 'uniswap-exact-in',
            inputAsset: {
              type: 'native',
            },
            inputAssetSource: 'caller',
            inputAmount: '1',
            outputAsset: {
              type: 'fungible-token',
              symbol: 'USDC',
            },
          },
          {
            type: 'aave-supply',
            asset: {
              type: 'fungible-token',
              symbol: 'USDC',
            },
            source: 'workflow',
            amount: '100%',
          },
        ],
      }
      const instance = await getWorkflowInstance(workflow, otherUserSigner)
      const runner = await instance.getRunner(otherUser)
      runner.addEventHandler(event => console.log(event.code, event.message))
      const usdc = await getErc20('USDC', 'ethereum', instance)
      const aToken = await getAaveAToken(usdc, 'ethereum', workflowRunner)
      const aTokenBalanceBefore = await aToken.balanceOf(otherUser)
      await runner.execute()
      const aTokenBalanceAfter = await aToken.balanceOf(otherUser)
      const delta = aTokenBalanceAfter.sub(aTokenBalanceBefore)
      console.log('delta', delta.toString())
      expect(delta).to.be.greaterThan(0)
    })
    it('creates a leveraged long WBTC position (2 rounds only)', async () => {
      const { otherUser, workflowRunner, otherUserSigner } = await setup()

      const workflow: Workflow = {
        steps: [
          {
            type: 'uniswap-exact-in',
            inputAsset: {
              type: 'native',
            },
            inputAssetSource: 'caller',
            inputAmount: '10',
            outputAsset: {
              type: 'fungible-token',
              symbol: 'WBTC',
            },
          },
          {
            type: 'aave-supply',
            asset: {
              type: 'fungible-token',
              symbol: 'WBTC',
            },
            source: 'workflow',
            amount: '100%',
          },
          {
            type: 'aave-borrow',
            asset: {
              type: 'fungible-token',
              symbol: 'USDC',
            },
            amount: '95%',
            interestRateMode: 'variable',
          },
          {
            type: 'uniswap-exact-in',
            inputAsset: {
              type: 'fungible-token',
              symbol: 'USDC',
            },
            inputAssetSource: 'workflow',
            inputAmount: '100%',
            outputAsset: {
              type: 'fungible-token',
              symbol: 'WBTC',
            },
            slippageTolerance: '20',
          },
          {
            type: 'aave-supply',
            asset: {
              type: 'fungible-token',
              symbol: 'WBTC',
            },
            source: 'workflow',
            amount: '100%',
          },
          {
            type: 'aave-borrow',
            asset: {
              type: 'fungible-token',
              symbol: 'USDC',
            },
            amount: '95%',
            interestRateMode: 'variable',
          },
          {
            type: 'uniswap-exact-in',
            inputAsset: {
              type: 'fungible-token',
              symbol: 'USDC',
            },
            inputAssetSource: 'workflow',
            inputAmount: '100%',
            outputAsset: {
              type: 'fungible-token',
              symbol: 'WBTC',
            },
            slippageTolerance: '95',
          },
          {
            type: 'aave-supply',
            asset: {
              type: 'fungible-token',
              symbol: 'WBTC',
            },
            source: 'workflow',
            amount: '100%',
          },
        ],
      }

      const instance = await getWorkflowInstance(workflow, otherUserSigner)
      const runner = await instance.getRunner(otherUser)
      const events: ExecutionEvent[] = []
      runner.addEventHandler(event => void events.push(event))

      const wbtc = await getErc20('WBTC', 'ethereum', instance)
      const wbtcBalanceBefore = await wbtc.balanceOf(otherUser)
      await runner.execute()
      const wbtcBalanceAfter = await wbtc.balanceOf(otherUser)
      const delta = wbtcBalanceAfter.sub(wbtcBalanceBefore)
      console.log('delta', delta.toString())
      // expect(delta).to.be.greaterThan(0)
      // await sleep(2000)
      for (const event of events) {
        console.log(event.code, event.message)
        if (event.code === 'WorkflowComplete') {
          for (const wfEvent of event.events) {
            console.log(`  ${wfEvent.chain} ${wfEvent.type}`)
            if (wfEvent.type === 'step') {
              console.log(`  ${wfEvent.stepInfo.name}`)
              await printAssetAmounts('inputs', wfEvent.inputs, wfEvent.chain, otherUserSigner)
              await printAssetAmounts('outputs', wfEvent.outputs, wfEvent.chain, otherUserSigner)
              await printAssetAmounts('outputs to user', wfEvent.outputsToUser, wfEvent.chain, otherUserSigner)
            }
          }
        }
      }
    })
  })
  it('does fees correctly', async () => {
    const { otherUser, workflowRunner, otherUserSigner } = await setup()
    const wrapAmount = '1'
    const wrapAmountString = parseEther(wrapAmount).toString()
    const workflow: Workflow = {
      steps: [
        {
          type: 'wrap-native',
          amount: wrapAmount,
          source: 'caller',
        },
      ],
    }
    const instance = await getWorkflowInstance(workflow, otherUserSigner)
    const runner = await instance.getRunner(otherUser)
    const weth = IERC20__factory.connect('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', workflowRunner.provider)
    const weth1 = await weth.balanceOf(otherUser)
    await runner.execute()
    const weth2 = await weth.balanceOf(otherUser)
    console.log('eth sent:     ', wrapAmountString)
    console.log('weth received:', weth2.sub(weth1).toString().padStart(wrapAmountString.length, ' '))
  })
}

async function printAssetAmounts(label: string, assetAmounts: ExecutionLogAssetAmount[], chain: Chain, provider?: Signer | Provider) {
  console.log(`    ${label}`)
  for (const assetAmount of assetAmounts) {
    const formattedAmount = await formatExecutionLogAssetAmount(assetAmount, chain, provider)
    console.log(`      ${formattedAmount.symbol} ${formattedAmount.amount}`)
  }
}

async function formatExecutionLogAssetAmount(assetAmount: ExecutionLogAssetAmount, chain: Chain, provider?: Signer | Provider) {
  const fractionalDigits = 6
  const { asset, address, amount } = assetAmount
  if (!asset) {
    let symbol: string
    let decimals: number
    if (provider) {
      const erc20 = IERC20Metadata__factory.connect(address, provider)
      const [s, d] = await Promise.all([erc20.symbol(), erc20.decimals()])
      symbol = s
      decimals = d
    } else {
      symbol = `0x${address.slice(0, 3)}...${address.slice(-3)}`
      decimals = 18
    }
    return {
      symbol,
      amount: formatNumber(amount, decimals, fractionalDigits),
    }
  }
  if (asset.type === 'native') {
    return {
      symbol: NATIVE_ASSETS[chain].symbol,
      amount: formatNumber(amount, 18, fractionalDigits),
    }
  }
  const c = translateChain(chain)
  const decimals = asset.chains[c]?.decimals || 18
  if (provider) {
    const erc20 = IERC20Metadata__factory.connect(address, provider)
    const [s, d] = await Promise.all([erc20.symbol(), erc20.decimals()])
    console.log(`known asset ${asset.symbol} ${decimals} ${s} ${d}}`)
  }
  return {
    symbol: asset.symbol,
    amount: formatNumber(amount, decimals, fractionalDigits),
  }
}
