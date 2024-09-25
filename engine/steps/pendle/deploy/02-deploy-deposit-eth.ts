import { DeployFunction } from 'hardhat-deploy/types'
import { deployStep } from '@freemarket/step-sdk/tslib/deploy-step'
import { MAINNET_STETH_ADDRESS } from '../../lido/tslib'
import { STEP_TYPE_ID_LIDO_ETH_TO_STETH } from '@freemarket/core/tslib/step-ids'

const func: DeployFunction = async function (hardhatRuntimeEnv) {
  return deployStep('DepositEthForStEthAction', STEP_TYPE_ID_LIDO_ETH_TO_STETH, hardhatRuntimeEnv, [MAINNET_STETH_ADDRESS])
}

func.tags = ['DepositEthForStEthAction']
func.dependencies = ['ConfigManager']

export default func
