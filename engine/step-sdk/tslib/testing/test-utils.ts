import { FrontDoor, WorkflowRunner, WorkflowRunner__factory } from '@freemarket/runner'
import merge from 'lodash.merge'
import { expect } from 'chai'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { Signer } from 'ethers'

// export const createBaseFixture = async () => {
//   console.log('aaaaaaaaaaaaaaaaa')
//   const [_frontDoorDeployment, _workflowRunnerDeployment, users] = await Promise.all([
//     deployments.fixture('FrontDoor'),
//     deployments.fixture('WorkflowRunner'),
//     getNamedAccounts(),
//   ])
//   const frontDoor = <FrontDoor>await ethers.getContract('FrontDoor')
//   const [deployerSigner, otherUserSigner] = await Promise.all([ethers.getSigner(users.deployer), ethers.getSigner(users.otherUser)])
//   const workflowRunner = WorkflowRunner__factory.connect(frontDoor.address, deployerSigner)

//   const signers = {
//     deployer: deployerSigner,
//     otherUser: otherUserSigner,
//   }
//   const contracts = {
//     frontDoor,
//     workflowRunner,
//   }
//   return {
//     contracts,
//     users,
//     signers,
//   } as const
// }

interface BaseTestFixture {
  contracts: {
    frontDoor: FrontDoor
    workflowRunner: WorkflowRunner
    userWorkflowRunner: WorkflowRunner
  }
  users: {
    deployer: string
    otherUser: string
  }
  signers: Record<string, Signer>
}

export function getTestFixture<T>(hardhat: HardhatRuntimeEnvironment, localFunc: (baseFixture: BaseTestFixture) => Promise<T>) {
  const { ethers, deployments, getNamedAccounts } = hardhat
  return deployments.createFixture(async () => {
    {
      const [_dep, users] = await Promise.all([deployments.fixture('WorkflowRunner'), getNamedAccounts()])
      const [frontDoor, deployerSigner, otherUserSigner] = await Promise.all([
        <Promise<FrontDoor>>ethers.getContract('FrontDoor'),
        ethers.getSigner(users.deployer),
        ethers.getSigner(users.otherUser),
      ])
      const workflowRunner = WorkflowRunner__factory.connect(frontDoor.address, deployerSigner)
      const userWorkflowRunner = WorkflowRunner__factory.connect(frontDoor.address, otherUserSigner)

      const baseFixture: BaseTestFixture = {
        signers: { deployer: deployerSigner, otherUser: otherUserSigner },
        contracts: { frontDoor, workflowRunner, userWorkflowRunner },
        users: { deployer: users.deployer, otherUser: users.otherUser },
      }

      const localResult = await localFunc(baseFixture)
      const rv = merge({}, baseFixture, localResult)
      return rv
    }
  })
}

export async function validateAction(runner: WorkflowRunner, stepId: number, stepAddress: string) {
  // should be there when you ask for the address directly
  const registeredAddress = await runner.getStepAddress(stepId)
  expect(registeredAddress).to.equal(stepAddress)

  // should be present in the enumeration
  let found = false
  const actionCount = (await runner.getStepCount()).toNumber()
  for (let i = 0; i < actionCount; ++i) {
    const actionInfo = await runner.getStepInfoAt(i)
    if (Number(actionInfo.stepId) === stepId) {
      expect(actionInfo.whitelist.includes(stepAddress)).to.be.true
      found = true
      break
    }
  }
  expect(found).to.be.true
}
