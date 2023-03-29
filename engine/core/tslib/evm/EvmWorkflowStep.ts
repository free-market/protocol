import type { EvmInputAsset } from './EvmInputAsset'
import type { EvmAsset } from './EvmAsset'
/**
 * A workflow step structure expected by the EVM workflow engine.
 */
export interface EvmWorkflowStep {
  /** The type of step. */
  stepTypeId: number | string
  /** Select a specific version of a step. The address must be a current or previous version of the step specified by stepTypeId. */
  stepAddress: string
  /** Assets paired with amounts, where amounts are either absolute or relative */
  inputAssets: EvmInputAsset[]
  /** The arguments for the step.  Args are first ABI encoded then hex encoded. */
  argData: string
  /** The index of the next step in the workflow.  */
  nextStepIndex: string | number
}
