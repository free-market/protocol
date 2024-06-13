import { expect } from 'chai'
import hardhat from 'hardhat'
import { ConfigManager, EternalStorage__factory, FrontDoor, WorkflowRunner, WorkflowRunner__factory } from '../typechain-types'
const { ethers, deployments, getNamedAccounts } = hardhat

const setup = deployments.createFixture(async () => {
  await deployments.fixture('WorkflowRunner')
  const { deployer, otherUser } = await getNamedAccounts()
  const contracts = {
    frontDoor: <FrontDoor>await ethers.getContract('FrontDoor'),
    workflowRunner: <WorkflowRunner>await ethers.getContract('WorkflowRunner'),
    configManager: <ConfigManager> await ethers.getContract('ConfigManager')
  }
  return {
    ...contracts,
    deployer,
    otherUser,
    provider: contracts.frontDoor.provider,
  }
})

describe('FrontDoor', async () => {
  it('deploys', async () => {
    const { frontDoor, workflowRunner, provider } = await setup()
    const storageAddress = await frontDoor.eternalStorageAddress()

    // ensure that the upstream of frontdoor is the deployed workflowRunner
    const frontDoorUpstreamAddress = await frontDoor.upstreamAddress()
    expect(frontDoorUpstreamAddress).equals(workflowRunner.address)
  })

  it('upgrades the WorkflowRunner', async () => {
    const { frontDoor, deployer, configManager, otherUser } = await setup()

    const deployerSigner = await ethers.getSigner(deployer)
    const factory = new WorkflowRunner__factory(deployerSigner)
    const newWorkflowRunner = await factory.deploy(frontDoor.address)

    // non owner cannot change the upstream
    const configManagerOtherUser = configManager.connect(await ethers.getSigner(otherUser))
    await expect(configManagerOtherUser.setUpstream(newWorkflowRunner.address)).to.be.reverted

    // change the upstream (as owner)
    await configManager.setUpstream(newWorkflowRunner.address)
    expect(await frontDoor.getUpstream()).to.equal(newWorkflowRunner.address)
  })

  it('allows the owner to change the address of the storage writer', async () => {
    const { frontDoor, deployer, otherUser } = await setup()
    const SOME_WRITER_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    const esAddr = await frontDoor.eternalStorageAddress()
    const deployerSigner = await ethers.getSigner(deployer)
    const es = EternalStorage__factory.connect(esAddr, deployerSigner)
    // non owner cannot set the writer
    const otherUserSigner = await ethers.getSigner(otherUser)
    const esOtherUser = es.connect(otherUserSigner)
    await expect(esOtherUser.setWriter(SOME_WRITER_ADDRESS)).to.be.reverted
    // owner sets the writer
    const oldWriter = await es.getWriter()
    await es.setWriter(SOME_WRITER_ADDRESS)
    const newWriter = await es.getWriter()
    expect(newWriter).is.equal(SOME_WRITER_ADDRESS)
    await es.setWriter(oldWriter)
  })
})
