import type { EncodingContext, EncodedWorkflowStep } from '@freemarket/core'
import { AbstractStepHelper } from '@freemarket/step-sdk'

export class StubHelper extends AbstractStepHelper<any> {
  encodeWorkflowStep(_context: EncodingContext<any>): Promise<EncodedWorkflowStep> {
    throw new Error('Method not implemented.')
  }
}
