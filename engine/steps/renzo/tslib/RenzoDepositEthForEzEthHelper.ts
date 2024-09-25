import { ADDRESS_ZERO, amountToBigint, coinAmountToBigint, EncodedWorkflowStep, EncodingContext, EvmInputAsset, sdkAssetAndAmountToEvmInputAmount, StepBase } from '@freemarket/core';
import { STEP_TYPE_ID_RENZO_ETH_TO_EZETH } from '@freemarket/core/tslib/step-ids';
import { AbstractStepHelper } from '@freemarket/step-sdk';
import { RenzoDepositEthForEzEth } from './model';
import { defaultAbiCoder } from '@ethersproject/abi';
import { BigNumberish } from 'ethers';


export class RenzoDepositEthForEzEthHelper extends AbstractStepHelper<RenzoDepositEthForEzEth> {
    async encodeWorkflowStep(context: EncodingContext<RenzoDepositEthForEzEth>): Promise<EncodedWorkflowStep> {

        const evmInputAmount = await sdkAssetAndAmountToEvmInputAmount(
            { type: 'native' },
            context.stepConfig.ethToTrade,
            context.chain,
            this.instance,
            context.stepConfig.source === 'caller'
        )
        const minReturn = await sdkAssetAndAmountToEvmInputAmount(
            { type: 'native' },
            context.stepConfig.minEzEthToReceive,
            context.chain,
            this.instance,
            context.stepConfig.source === 'caller'
        )
        

        return {
            stepTypeId: STEP_TYPE_ID_RENZO_ETH_TO_EZETH,
            stepAddress: ADDRESS_ZERO,
            inputAssets: [evmInputAmount],
            argData: encodeDepositEthForEzEthParams(minReturn.amount.toString())
          }
    }        
}


function encodeDepositEthForEzEthParams(minEzEthToReceive: BigNumberish): string {
    return defaultAbiCoder.encode(["uint256"], [minEzEthToReceive])
}
  
export { encodeDepositEthForEzEthParams }