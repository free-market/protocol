import { AssetType } from './AssetType'
import { EvmWorkflow } from './EvmWorkflow'
import { ethers } from 'ethers'
import { randomHex } from 'web3-utils'
const abiCoder = ethers.utils.defaultAbiCoder
import createKeccakHash from 'keccak'

const AssetSchema = `
  tuple(
    uint8 assetType,
    address assetAddress
  )
`
// const AssetArrayAbi = `${AssetAbi}[]`
// // const x = abiCoder.encode([AssetArrayAbi], [[]])
const InputAssetSchema = `
  tuple(
    ${AssetSchema} asset,
    uint256 amount,
    bool amountIsPercent
  )`

const WorkflowStepSchema = `
  tuple(
    uint16 actionId,
    address actionAddress,
    ${InputAssetSchema}[] inputAssets,
    ${AssetSchema}[] outputAssets,
    bytes data,
    int16 nextStepIndex
  )
`

const WorkflowSchema = `
  tuple(
    ${WorkflowStepSchema}[] steps
  )
`

const BridgePayloadSchema = `
  tuple(
    address userAddress,
    uint256 nonce,
    ${WorkflowSchema} workflow
  )
`

export function toChecksumAddress(address: number | string) {
  let addr = typeof address === 'number' ? address.toString(16) : address.toLowerCase().replace('0x', '')
  addr = addr.padStart(40, '0')
  var hash = createKeccakHash('keccak256').update(addr).digest('hex')
  var ret = '0x'

  for (var i = 0; i < addr.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += addr[i].toUpperCase()
    } else {
      ret += addr[i]
    }
  }

  return ret
}

export function getBridgePayload(userAddress: string, workflow: EvmWorkflow) {
  const nonce = randomHex(32)
  const encodedWorkflow = abiCoder.encode([BridgePayloadSchema], [{ userAddress, nonce, workflow }])
  return {
    encodedWorkflow,
    nonce,
  }
}

// const asset = {
//   assetType: AssetType.ERC20,
//   assetAddress: '0x6aAd876244E7A1Ad44Ec4824Ce813729E5B6C291',
// }
// const inputAsset = {
//   asset,
//   amount: '1',
//   amountIsPercent: true,
// }

// const workflowStep = {
//   actionId: 1,
//   actionAddress: '0x6aAd876244E7A1Ad44Ec4824Ce813729E5B6C291',
//   inputAssets: [inputAsset],
//   outputAssets: [asset],
//   data: '0xdeadbeef',
//   nextStepIndex: -1,
// }

// const workflow: EvmWorkflow = { steps: [workflowStep] }

// // const xx = abiCoder.encode([WorkflowSchema], [workflow])

// console.log(JSON.stringify(getBridgePayload('0x6aAd876244E7A1Ad44Ec4824Ce813729E5B6C291', workflow)))
