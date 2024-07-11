import { DeployFunction } from 'hardhat-deploy/types'
import { FrontDoor, WorkflowRunner__factory } from '@freemarket/runner'
import { STEP_TYPE_ID_ADD_ASSET } from '../../step-ids'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  return deployStep('AddAssetAction', STEP_TYPE_ID_ADD_ASSET, hardhatRuntimeEnv)
}

func.tags = ['AddAssetAction']
func.dependencies = ['ConfigManager']

export default func
