import { DeployFunction } from 'hardhat-deploy/types'
import { STEP_TYPE_ID } from '../tslib/helper'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'

const SWAP_ROUTER_02_ADDRESS = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  return deployStep('UniswapExactInAction', STEP_TYPE_ID, hardhatRuntimeEnv, [SWAP_ROUTER_02_ADDRESS])
}

func.tags = ['UniswapExactInAction']
func.dependencies = ['WorkflowRunner']

export default func
