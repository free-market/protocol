/* eslint-disable no-console */
import { expect } from 'chai'
import hardhat from 'hardhat'
import {
  ConfigManager,
  ConfigManager__factory,
  FrontDoor,
  FrontDoor__factory,
  WorkflowRunner,
  WorkflowRunner__factory,
} from '../typechain-types'
const { ethers, deployments, getNamedAccounts } = hardhat

const setup = deployments.createFixture(async () => {
  const deploymentResult = await deployments.fixture('ConfigManager')
  const users = await getNamedAccounts()
  const frontDoor = <FrontDoor>await ethers.getContract('FrontDoor')
  const signer = await ethers.getSigner(users.deployer)
  const configManager = ConfigManager__factory.connect(deploymentResult.ConfigManager.address, signer)
  const contracts = {
    frontDoor,
    configManager,
  }
  return {
    contracts,
    users,
    provider: contracts.frontDoor.provider,
  }
})

describe('WorkflowRunner', async () => {
  const someAddress = '0x9ef1dcd8af14ed2bdd16fef0ae2775e2ee8ff604'

  it('deploys', async () => {
    const {
      contracts: { frontDoor, configManager },
    } = await setup()
    const frontDoorStorageAddress = await frontDoor.eternalStorageAddress()
    const configManagerStorageAddress = await configManager.eternalStorageAddress()
    expect(configManagerStorageAddress).is.eq(frontDoorStorageAddress)
  })

  it('manages step addresses', async () => {
    const {
      contracts: { frontDoor, configManager },
    } = await setup()
    let count = await configManager.getStepCount()
    expect(count).to.eq(0)
    const response = await configManager.setStepAddress(1000, someAddress)
    await response.wait()
    count = await configManager.getStepCount()
    expect(count).to.eq(1)
    const stepInfo = await configManager.getStepInfoAt(0)
    expect(stepInfo.stepTypeId).to.eq(1000)
    expect(stepInfo.latest.toLowerCase()).to.eq(someAddress)
  })

  it('manages the default fee', async () => {
    const {
      contracts: { configManager },
    } = await setup()
    let fee = await configManager.getDefaultFee()
    expect(fee[0]).to.eq(0)
    expect(fee[1]).to.be.false

    await (await configManager.setDefaultFee(1, false)).wait()
    fee = await configManager.getDefaultFee()
    expect(fee[0]).to.eq(1)
    expect(fee[1]).to.be.false

    await (await configManager.setDefaultFee(2, true)).wait()
    fee = await configManager.getDefaultFee()
    expect(fee[0]).to.eq(2)
    expect(fee[1]).to.be.true
  })

  it('manages a step fee', async () => {
    const {
      contracts: { configManager },
    } = await setup()
    let fee = await configManager.getStepFee(99)
    expect(fee[0]).to.eq(0)
    expect(fee[1]).to.be.false

    const feeArg = {
      stepTypeId: '99',
      fee: '1',
      feeIsPercent: false,
    }

    await (await configManager.setStepFees([feeArg])).wait()
    fee = await configManager.getStepFee(99)
    expect(fee[0]).to.eq(1)
    expect(fee[1]).to.be.false

    feeArg.fee = '2'
    feeArg.feeIsPercent = true
    await (await configManager.setStepFees([feeArg])).wait()
    fee = await configManager.getStepFee(99)
    expect(fee[0]).to.eq(2)
    expect(fee[1]).to.be.true
  })
})
