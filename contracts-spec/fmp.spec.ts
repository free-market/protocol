import * as ethers from 'ethers'
import FreeMarket from '@fmp/contracts/build/contracts/FreeMarket.json'
import TricryptoPool from '@fmp/contracts/TricryptoPool.json'
import ThreePool from '@fmp/contracts/ThreePool.json'
import WrappedEther from '@fmp/contracts/WrappedEther.json'
import Parser from 'gherkin/dist/src/Parser'
import AstBuilder from 'gherkin/dist/src/AstBuilder'
import { IdGenerator } from '@cucumber/messages'
import { readFileSync } from 'fs'

jest.setTimeout(30 * 1000)

const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')

const mnemonic = process.env.FMP_GANACHE_MNEMONIC

if (mnemonic == null) {
  throw new Error('missing FMP_GANACHE_MNEMONIC')
}

const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic)

const account = new ethers.Wallet(
  hdNode.derivePath("m/44'/60'/0'/0/1").privateKey,
  provider
)

const contractFactory = new ethers.ContractFactory(
  FreeMarket.abi,
  FreeMarket.bytecode,
  account
)

const tricrypto = new ethers.Contract(
  '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46',
  TricryptoPool as any,
  account
)

    const THREEPOOL_ADDRESS = '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7'
      const threePool = new ethers.Contract(
        THREEPOOL_ADDRESS,
        ThreePool as any,
        account
    )

const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const weth = new ethers.Contract(WETH_ADDRESS, WrappedEther, account)

const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const usdt = new ethers.Contract(USDT_ADDRESS, WrappedEther, account)

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const usdc = new ethers.Contract(USDC_ADDRESS, WrappedEther.filter(({name}) => name === 'balanceOf'), account)

const astBuilder = new AstBuilder(IdGenerator.incrementing())

const parser = new Parser(astBuilder)

const { feature } = parser.parse(
  readFileSync(`${__dirname}/fmp.feature`, 'utf8').toString()
)

describe('FreeMarket contract', () => {
  for (const { scenario } of feature.children) {
    it(scenario.name, async () => {
      const contract = await contractFactory.deploy()
      await contract.deployed()

      for (const step of scenario.steps) {
        if (step.text === 'I exchange some WETH for USDT') {

          const wethBalance = await weth.balanceOf(account.address)
            const [expected] = await tricrypto.functions.get_dy(2, 0, wethBalance, { gasLimit: 100000} )
          const approvalTx = await weth['approve'](
            tricrypto.address,
            wethBalance,
          )
          const approvalReceipt = await approvalTx.wait()
          const tx = await tricrypto['exchange(uint256,uint256,uint256,uint256,bool)'](
            2, // weth
            0, // usdt
            wethBalance,
            1,
            false
          )
          await tx.wait()

        } else if (step.text === 'I exchange some USDT for USDC') {
          const usdtBalance = await usdt.balanceOf(account.address)
            const [expected] = await threePool.functions.get_dy(2, 1, usdtBalance, {gasLimit: 100000})
            console.log('expected usdc', expected.toString())
          const approvalTx = await usdt.approve(
            threePool.address,
            expected,
          )
          const approvalReceipt = await approvalTx.wait()
          const tx = await threePool.exchange(
            2, // usdt
            1, // usdc
            expected,
            1
          )
          await tx.wait()
        } else if (step.text === 'I exchange some ETH for WETH') {
          const tx = await weth.functions.deposit({ value: '100000000000000000' })
          await tx.wait()
          const wethBalance = (await weth.balanceOf(account.address)).toString()
          expect(wethBalance).not.toBe('0')
          // expect(wethBalance).toBe('10000000000000000')
        } else if (step.text === 'I should have some USDT') {
          const balance = await usdt.balanceOf(account.address)
          expect(balance.toString()).not.toBe('0')
        } else if (step.text === 'I should have some USDC') {
          const balance = await usdc.balanceOf(account.address)
          expect(balance.toString()).not.toBe('0')
        }
      }
    })
  }
})
