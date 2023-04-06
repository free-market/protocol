import { expect } from 'chai'
import hardhat from 'hardhat'
import { EternalStorage__factory, FrontDoor, WorkflowRunner, WorkflowRunner__factory } from '../typechain-types'
const { ethers, deployments, getNamedAccounts } = hardhat

const setup = deployments.createFixture(async () => {
  await deployments.fixture('FrontDoor')
  await deployments.fixture('WorkflowRunner')
  const { deployer, otherUser } = await getNamedAccounts()
  const contracts = {
    frontDoor: <FrontDoor>await ethers.getContract('FrontDoor'),
    workflowRunner: <WorkflowRunner>await ethers.getContract('WorkflowRunner'),
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

    // ensure that the 'writer' of storage is the front door
    const storage = EternalStorage__factory.connect(storageAddress, provider)
    const storageWriterAddress = await storage.getWriter()
    expect(storageWriterAddress).equals(frontDoor.address)

    // ensure that the upstream of frontdoor is the deployed workflowRunner
    const frontDoorUpstreamAddress = await frontDoor.upstreamAddress()
    expect(frontDoorUpstreamAddress).equals(workflowRunner.address)
  })

  it('changes owners', async () => {
    const { frontDoor, deployer, otherUser } = await setup()
    let currentOwner = await frontDoor.owner()
    expect(currentOwner).to.equal(deployer)

    const frontDoorOtherUser = frontDoor.connect(await ethers.getSigner(otherUser))
    // non owner cannot change the owner
    await expect(frontDoorOtherUser.setOwner(otherUser)).to.be.reverted
    // change the owner to NOT_OWNER
    await frontDoor.setOwner(otherUser)
    currentOwner = await frontDoor.owner()
    expect(currentOwner).to.equal(otherUser)
    // now original owner cannot change owner
    await expect(frontDoor.setOwner(deployer)).to.be.reverted
    // change owner back to the original owner
    await frontDoorOtherUser.setOwner(deployer)
    currentOwner = await frontDoor.owner()
    expect(currentOwner).to.equal(deployer)
  })

  it('upgrades the WorkflowRunner', async () => {
    const { frontDoor, deployer, otherUser } = await setup()

    const deployerSigner = await ethers.getSigner(deployer)
    const factory = new WorkflowRunner__factory(deployerSigner)
    const newWorkflowRunner = await factory.deploy(frontDoor.address)

    // non owner cannot change the upstream
    const frontDoorOtherUser = frontDoor.connect(await ethers.getSigner(otherUser))
    await expect(frontDoorOtherUser.setUpstream(newWorkflowRunner.address)).to.be.reverted

    // change the upstream (as owner)
    await frontDoor.setUpstream(newWorkflowRunner.address)
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
