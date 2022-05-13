import * as ethers from 'ethers'
import FreeMarket from '@fmp/contracts/build/contracts/FreeMarket.json'

const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')

const mnemonic = process.env.FMP_GANACHE_MNEMONIC

if (mnemonic == null) {
  throw new Error('missing FMP_GANACHE_MNEMONIC')
}

const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic)

const account = new ethers.Wallet(hdNode.derivePath("m/44'/60'/0'/0/1").privateKey, provider)

const contractFactory = new ethers.ContractFactory(FreeMarket.abi, FreeMarket.bytecode, account)

describe('FreeMarket contract', () => {
  it('should should deploy', async () => {
    const contract = await contractFactory.deploy()
    await contract.deployed()
  })
})
