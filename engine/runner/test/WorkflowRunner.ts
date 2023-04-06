/* eslint-disable no-console */
import { expect } from 'chai'
import hardhat from 'hardhat'
import { FrontDoor, WorkflowRunner, WorkflowRunner__factory } from '../typechain-types'
const { ethers, deployments, getNamedAccounts } = hardhat

const setup = deployments.createFixture(async () => {
  await deployments.fixture('FrontDoor')
  await deployments.fixture('WorkflowRunner')
  const users = await getNamedAccounts()
  const frontDoor = <FrontDoor>await ethers.getContract('FrontDoor')
  const signer = await ethers.getSigner(users.deployer)
  const workflowRunner = WorkflowRunner__factory.connect(frontDoor.address, signer)
  const contracts = {
    frontDoor,
    workflowRunner,
  }
  return {
    contracts,
    users,
    provider: contracts.frontDoor.provider,
  }
})

describe('WorkflowRunner', async () => {
  it('deploys', async () => {
    const {
      contracts: { frontDoor, workflowRunner },
    } = await setup()
    const frontDoorStorageAddress = await frontDoor.eternalStorageAddress()
    const workflowRunnerStorageAddress = await workflowRunner.eternalStorageAddress()
    expect(workflowRunnerStorageAddress).is.eq(frontDoorStorageAddress)
  })

  it('manages step addresses', async () => {
    const {
      contracts: { frontDoor, workflowRunner },
    } = await setup()
    let count = await workflowRunner.getStepCount()
    expect(count).to.eq(0)
    const someAddress = '0x9ef1dcd8af14ed2bdd16fef0ae2775e2ee8ff604'
    const response = await workflowRunner.setStepAddress(1000, someAddress)
    await response.wait()
    count = await workflowRunner.getStepCount()
    expect(count).to.eq(1)
    const stepInfo = await workflowRunner.getStepInfoAt(0)
    expect(stepInfo.stepTypeId).to.eq(1000)
    expect(stepInfo.latest.toLowerCase()).to.eq(someAddress)
  })

  it('determines ')
})
