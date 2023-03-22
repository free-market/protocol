import { DeployFunction } from 'hardhat-deploy/types'
import { FrontDoor, WorkflowRunner__factory } from '@freemarket/runner'
import { STEP_TYPE_ID } from '../tslib/helper'
import { deployStep } from '@freemarket/step-sdk'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  return deployStep('AddAssetAction', STEP_TYPE_ID, hardhatRuntimeEnv)
}

func.tags = ['AddAssetAction']
func.dependencies = ['WorkflowRunner']

export default func
