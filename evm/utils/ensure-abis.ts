import axios from 'axios'
import fs, { mkdirSync } from 'fs'
import { runTypeChain, glob } from 'typechain'
import { promisify } from 'util'

const sleep = promisify(setTimeout)

const CONTRACTS: any = [
  // {
  //   name: 'CurveTriCrypto2',
  //   address: '0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5',
  // },
  // {
  //   name: 'Weth',
  //   address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  // },
  // {
  //   name: 'CurveTriCrypto',
  //   address: '0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5',
  // },
  // {
  //   name: 'Curve3Pool',
  //   address: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
  // },
  // {
  //   name: 'CurveTokenV2',
  //   address: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
  // },
]

const ABI_DIR = 'abis'
const OUT_DIR = 'build/contracts'

function mkdirs(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true })
  }
}

async function downloadAbi(name: string, address: string) {
  const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}`
  console.log(`downloading ${name} abi from ${url}`)
  const x = await axios.get(url)
  const s = x.data
  const abi = JSON.parse(s.result)
  for (const method of abi) {
    if (method.gas && typeof method.gas === 'number') {
      method.gas = '' + method.gas
    }
  }
  const obj = {
    contractName: name,
    abi,
  }
  const jsonStr = JSON.stringify(obj, null, 2)
  fs.writeFileSync(getAbiPathName(name), jsonStr)
}

function getAbiPathName(name: string) {
  return `${ABI_DIR}/${name}.json`
}

function cp(from: string, to: string) {
  console.log(`copying file: ${from} -> ${to}`)
  fs.copyFileSync(from, to)
}

async function main() {
  mkdirs(ABI_DIR)
  mkdirs(OUT_DIR)

  // cp(`node_modules/@openzeppelin/contracts/build/contracts/IERC20.json`, `${OUT_DIR}/IERC20.json`)
  // fs.copyFileSync(`node_modules/@openzeppelin/contracts/build/contracts/IERC20.json`, `${OUT_DIR}/IERC20.json`)

  let needSleep = false
  for (const contract of CONTRACTS) {
    const abiPathName = getAbiPathName(contract.name)
    if (!fs.existsSync(abiPathName)) {
      if (needSleep) {
        await sleep(1000)
      }
      await downloadAbi(contract.name, contract.address)
      needSleep = true
    }
    fs.copyFileSync(abiPathName, `${OUT_DIR}/${contract.name}.json`)
  }
}

void main()
