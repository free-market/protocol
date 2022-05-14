import web3 from 'web3'
import axios from 'axios'
import fs, { mkdirSync } from 'fs'
import { runTypeChain, glob } from 'typechain'
import { promisify } from 'util'

const sleep = promisify(setTimeout)

const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const CURVE_TRICRYPTO_ADDRESS = '0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5'

const ABI_DIR = 'build/contracts'

function mkdir(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }

}

async function downloadAbi(name: string, address: string) {
  mkdir(ABI_DIR)
  const x = await axios.get(`https://api.etherscan.io/api?module=contract&action=getabi&address=${address}`)
  const s = x.data
  const abi = JSON.parse(s.result)
  const obj = {
    contractName: name,
    abi
  }
  const jsonStr = JSON.stringify(obj, null, 2)
  const fileName = `${ABI_DIR}/${name}.json`
  fs.writeFileSync(fileName, jsonStr)
  return fileName
}

async function generateClients(allFiles: string[]) {
  const cwd = process.cwd()
  // find all files matching the glob
  // const allFiles = glob(cwd, [`${ABI_DIR}/*.json`])

  const result = await runTypeChain({
    cwd,
    filesToProcess: allFiles,
    allFiles,
    outDir: 'types/asdf',
    target: 'truffle-v5',
  })
}

async function main() {
  const fileNames = [] as string[]
  fileNames.push(await downloadAbi('Weth', WETH_ADDRESS))
  await sleep(1000)
  fileNames.push(await downloadAbi('TriCrypto', CURVE_TRICRYPTO_ADDRESS))
  await generateClients(fileNames)
}

void main()