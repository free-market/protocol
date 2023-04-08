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
  const deploymentResult = await deployments.fixture('WorkflowRunner')
  const users = await getNamedAccounts()
  const frontDoor = <FrontDoor>await ethers.getContract('FrontDoor')
  const signer = await ethers.getSigner(users.deployer)
  const workflowRunner = WorkflowRunner__factory.connect(deploymentResult.FrontDoor.address, signer)
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
})
