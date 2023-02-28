import BN from 'bn.js'
import { Unit } from 'web3-utils'
import { AllEvents } from '../types/truffle-contracts/FrontDoor'
import { AssetType } from '../tslib/AssetType'
import createKeccakHash from 'keccak'

const FrontDoor = artifacts.require('FrontDoor')
const WorkflowRunner = artifacts.require('WorkflowRunner')

export function withRetries<T extends Object>(obj: T) {
  return new Proxy<T>(obj, {
    apply: (target, _thisArg, argumentsList) => {
      // the typing for target looks wrong, casting to a function
      const targetAsFunc = target as unknown as (...args: any[]) => any
      try {
        return targetAsFunc(...argumentsList)
      } catch (e) {
        console.log('caught and rethrowing ', (e as Error).stack)
        console.log('caught stringified  ', JSON.stringify(e))
        throw e
      }
    },
  })
}

export async function getWorkflowRunner() {
  const frontDoor = await FrontDoor.deployed()
  const runner = await WorkflowRunner.at(frontDoor.address)
  // return withRetries(runner)
  return runner
}

export async function validateAction(actionId: number, actionAddress: string) {
  const runner = await getWorkflowRunner()

  // should be there when you ask for the address directly
  const registeredAddress = await runner.getActionAddress(actionId)
  expect(registeredAddress).to.equal(actionAddress)

  // should be present in the enumeration
  let found = false
  let actionCount = (await runner.getActionCount()).toNumber()
  for (let i = 0; i < actionCount; ++i) {
    const actionInfo = await runner.getActionInfoAt(i)
    if (Number(actionInfo.actionId) === actionId) {
      expect(actionInfo.whitelist.includes(actionAddress)).to.be.true
      found = true
      break
    }
  }
  expect(found).to.be.true
}

export function formatEvent(log: Truffle.TransactionLog<any>) {
  const argKeys = Object.keys(log.args)
  const argsStr = argKeys
    .filter((k) => isNaN(parseInt(k)) && !k.startsWith('__'))
    .map((k) => {
      const v = log.args[k]
      return `${k}=${JSON.stringify(v)}`
    })
    .join(',')
  return `${log.event}(${argsStr})`
}

export function commify(x: string) {
  return x.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')
}

export function formatEthereum(s: string, unit?: Unit) {
  return commify(web3.utils.fromWei(s, unit))
}

export function encodeAsset(assetType: AssetType, assetAddress: string) {
  const twoToTheSixteen = new BN(2).pow(new BN(16))
  const addr = new BN(assetAddress.substring(2), 'hex').mul(twoToTheSixteen)
  const type: number = assetType
  return addr.add(new BN(type))
}

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

export const ETH_ASSET = {
  assetType: AssetType.Native,
  assetAddress: ADDRESS_ZERO,
}

const verboseLog = true

export function verbose(...s: string[]) {
  if (verboseLog) {
    console.log(...s)
  }
}

export function logEvents(txResponse: Truffle.TransactionResponse<any>) {
  verbose('Events:')
  for (const log of txResponse.logs) {
    verbose('  📌 ' + formatEvent(log))
  }
}

export function toBN(x: BN | string | number) {
  if (typeof x !== 'object') {
    return new BN(x)
  }
  return x
}

export async function expectRejection(promise: Promise<any>) {
  try {
    await promise
    assert.fail('promise did not reject')
  } catch (_) {
    // no op
  }
}

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
