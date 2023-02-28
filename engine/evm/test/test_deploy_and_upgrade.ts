import { ADDRESS_ZERO } from '../tslib/contract-addresses'
import { FrontDoorInstance, WorkflowRunnerInstance } from '../types/truffle-contracts'

const FrontDoor = artifacts.require('FrontDoor')
const WorkflowRunner = artifacts.require('WorkflowRunner')
const EternalStorage = artifacts.require('EternalStorage')
import { ActionIds } from '../tslib/actionIds'
import { expectRejection } from './test-utilities'

contract('deploy and upgrade', function (accounts: string[]) {
  const OWNER = accounts[0]
  const NOT_OWNER = accounts[1]
  let frontDoor: FrontDoorInstance

  // console.log('OWNER ' + OWNER)
  // console.log('NOT_OWNER ' + NOT_OWNER)

  async function ensureWorkflowRunnerDeployed() {
    let workflowRunnerAddress = await frontDoor.getUpstream()
    if (workflowRunnerAddress === ADDRESS_ZERO) {
      const workflowRunner = await WorkflowRunner.new(frontDoor.address)
      workflowRunnerAddress = workflowRunner.address
      await frontDoor.setUpstream(workflowRunner.address)
    }
    const etStorAddr = await frontDoor.eternalStorageAddress()
    const etStor = await EternalStorage.at(etStorAddr)
    await etStor.setWriter(workflowRunnerAddress)
    const x = await WorkflowRunner.at(workflowRunnerAddress)
    return x
    // return withRetries(x)
  }

  before(async () => {
    frontDoor = await FrontDoor.new()
  })

  it('bootstraps correctly', async () => {
    // grab the deployed frontdoor
    const frontDoor = await FrontDoor.deployed()
    const storageAddress = await frontDoor.eternalStorageAddress()

    // ensure that the 'writer' of storeage is the frontdoor
    const storage = await EternalStorage.at(storageAddress)
    const storageWriterAddress = await storage.getWriter()
    expect(storageWriterAddress).equals(frontDoor.address)

    // ensure that the upstream of frontdoor is the deployed workflowRunner
    const frontDoorUpstreamAddress = await frontDoor.upstreamAddress()
    const deployedWorkflowRunner = await WorkflowRunner.deployed()
    expect(frontDoorUpstreamAddress).equals(deployedWorkflowRunner.address)
  })

  it('changes owners', async () => {
    let currentOwner = await frontDoor.owner()
    expect(currentOwner).to.equal(OWNER)

    // non owner cannot change the owner
    await expectRejection(frontDoor.setOwner(NOT_OWNER, { from: NOT_OWNER }))

    // change the owner to NOT_OWNER
    await frontDoor.setOwner(NOT_OWNER, { from: OWNER })
    currentOwner = await frontDoor.owner()
    expect(currentOwner).to.equal(NOT_OWNER)

    // now original owner cannot change owner
    await expectRejection(frontDoor.setOwner(OWNER, { from: OWNER }))

    // change owner back to the original owner
    await frontDoor.setOwner(OWNER, { from: NOT_OWNER })
    currentOwner = await frontDoor.owner()
    expect(currentOwner).to.equal(OWNER)
  })

  it('upgrades the WorkflowRunner', async () => {
    const workflowRunner = await WorkflowRunner.new(frontDoor.address)

    // non owner cannot change the upstream
    await expectRejection(frontDoor.setUpstream(workflowRunner.address, { from: NOT_OWNER }))

    // change the upstream (as owner)
    await frontDoor.setUpstream(workflowRunner.address)
    expect(await frontDoor.getUpstream()).to.equal(workflowRunner.address)

    // upgrade
    const newWorkflowRunner = await WorkflowRunner.new(frontDoor.address)
    await frontDoor.setUpstream(newWorkflowRunner.address)
    expect(await frontDoor.getUpstream()).to.equal(newWorkflowRunner.address)
  })

  it('allows the owner to change the address of the storage writer', async () => {
    const SOME_WRITER_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    const esAddr = await frontDoor.eternalStorageAddress()
    const es = await EternalStorage.at(esAddr)
    const oldWriter = await es.getWriter()
    // non owner cannot set the writer
    expectRejection(es.setWriter(SOME_WRITER_ADDRESS, { from: NOT_OWNER }))
    // owner sets the writer
    await es.setWriter(SOME_WRITER_ADDRESS)
    const newWriter = await es.getWriter()
    expect(newWriter).is.equal(SOME_WRITER_ADDRESS)
    await es.setWriter(oldWriter)
  })

  it('adds and upgrades workflow actions', async () => {
    const workflowRunner = await ensureWorkflowRunnerDeployed()

    // helper function that loops through all actions and make sure that the contract for a given actionId  is pointing to the correct contract
    const expectActionAddress = async (actionId: number, expectedAddress: string) => {
      const numActions = (await workflowRunner.getActionCount()).toNumber()
      let i = 0
      for (; i < numActions; ++i) {
        const actionInfo = await workflowRunner.getActionInfoAt(i)
        if (actionInfo.actionId.toString() === actionId.toString()) {
          expect(actionInfo.whitelist.includes(expectedAddress)).to.be.true
          break
        }
      }
      expect(i).to.not.equal(numActions, `actionId ${ActionIds.wrapEther} not found`)
    }

    // deploy an action
    const WrapEther = artifacts.require('WrapEther')
    const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    const wrapEther = await WrapEther.new(WETH_ADDRESS)

    // non owner cannot add a workflow step
    await expectRejection(workflowRunner.setActionAddress(ActionIds.wrapEther, wrapEther.address, { from: NOT_OWNER }))

    //  owner adds the action
    await workflowRunner.setActionAddress(ActionIds.wrapEther, wrapEther.address)
    await expectActionAddress(ActionIds.wrapEther, wrapEther.address)

    // owner upgrades the action
    const wrapEtherUpgraded = await WrapEther.new(WETH_ADDRESS)
    await workflowRunner.setActionAddress(ActionIds.wrapEther, wrapEtherUpgraded.address)
    await expectActionAddress(ActionIds.wrapEther, wrapEtherUpgraded.address)

    // workflow actions are iterable
    const actionCount = await workflowRunner.getActionCount()
    expect(actionCount.toNumber()).to.equal(1)
    const actionInfo = await workflowRunner.getActionInfoAt(0)
    expect(actionInfo.actionId.toString()).to.equal('' + ActionIds.wrapEther)
    expect(actionInfo.whitelist.includes(wrapEtherUpgraded.address)).to.be.true
  })
})
