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
import { WorkflowStruct } from '../typechain-types/contracts/WorkflowRunner'
import { ADDRESS_ZERO, IERC20__factory } from '@freemarket/core'
const { ethers, deployments, getNamedAccounts } = hardhat

const setup = deployments.createFixture(async () => {
  const deploymentResult = await deployments.fixture('WorkflowRunner')
  const users = await getNamedAccounts()
  const frontDoor = <FrontDoor>await ethers.getContract('FrontDoor')
  const configManager = <ConfigManager>await ethers.getContract('ConfigManager')
  const signer = await ethers.getSigner(users.deployer)
  const workflowRunner = WorkflowRunner__factory.connect(deploymentResult.FrontDoor.address, signer)
  const contracts = {
    frontDoor,
    configManager,
    workflowRunner,
  }
  return {
    contracts,
    users,
    provider: contracts.frontDoor.provider,
    signer,
  }
})

describe('WorkflowRunner', async () => {
  it('deploys', async () => {
    const {
      contracts: { frontDoor, workflowRunner, configManager },
    } = await setup()
    const frontDoorStorageAddress = await frontDoor.eternalStorageAddress()
    const workflowRunnerStorageAddress = await workflowRunner.eternalStorageAddress()
    expect(workflowRunnerStorageAddress).is.eq(frontDoorStorageAddress)
    // get the real runner not the one pointing to frontDoor
    const runnerAddresses = await configManager.getRunnerAddresses()
    const realRunner = await ethers.getContract('WorkflowRunner')
    expect(runnerAddresses).to.deep.eq([realRunner.address])
  })
  it('executes an empty workflow', async () => {
    const {
      contracts: { frontDoor, workflowRunner },
    } = await setup()

    const workflow: WorkflowStruct = {
      workflowRunnerAddress: ADDRESS_ZERO,
      steps: [],
      beforeAll: [],
      afterAll: [],
    }
    await (await workflowRunner.executeWorkflow(workflow)).wait()
  })
  it('executes when a frozen runner address is provided', async () => {
    const {
      contracts: { frontDoor, workflowRunner, configManager },
      signer,
    } = await setup()

    const runnersBefore = await configManager.getRunnerAddresses()
    expect(runnersBefore.length).to.eq(1)
    const originalRunnerAddress = runnersBefore[0]

    const workflow: WorkflowStruct = {
      workflowRunnerAddress: ADDRESS_ZERO,
      steps: [],
      beforeAll: [],
      afterAll: [],
    }
    await (await workflowRunner.executeWorkflow(workflow)).wait()

    // deploy a new runner
    const factory = new WorkflowRunner__factory(signer)
    const newRunner = await factory.deploy(frontDoor.address)
    await newRunner.deployed()
    await (await configManager.setUpstream(newRunner.address)).wait()
    await (await configManager.addRunnerAddress(newRunner.address)).wait()

    // sanity check the deployment
    const upstream = await frontDoor.getUpstream()
    expect(upstream).to.eq(newRunner.address)
    const runnersAfter = await configManager.getRunnerAddresses()
    expect(runnersAfter.length - 1).to.eq(runnersBefore.length)
    expect(runnersAfter).to.include(newRunner.address)

    // execute a workflow with the old and new runner
    workflow.workflowRunnerAddress = originalRunnerAddress
    await (await workflowRunner.executeWorkflow(workflow)).wait()
    workflow.workflowRunnerAddress = newRunner.address
    await (await workflowRunner.executeWorkflow(workflow)).wait()

    // expect a revert with an invalid address
    workflow.workflowRunnerAddress = '0x0000000000000000000000000000000000000123'
    await expect(workflowRunner.executeWorkflow(workflow)).to.be.revertedWith('provided upstream not whitelisted')

    // remove the old runner
    await (await configManager.removeRunnerAddress(originalRunnerAddress)).wait()
    const runnersAfterRemoval = await configManager.getRunnerAddresses()
    expect(runnersAfterRemoval.length).to.eq(runnersAfter.length - 1)
    expect(runnersAfterRemoval).to.not.include(originalRunnerAddress)

    // old runner should now revert
    workflow.workflowRunnerAddress = originalRunnerAddress
    await expect(workflowRunner.executeWorkflow(workflow)).to.be.revertedWith('provided upstream not whitelisted')

    // new runner should still work
    workflow.workflowRunnerAddress = newRunner.address
    await (await workflowRunner.executeWorkflow(workflow)).wait()

    // and still should work with the zero address
    workflow.workflowRunnerAddress = ADDRESS_ZERO
    await (await workflowRunner.executeWorkflow(workflow)).wait()
  })
})
