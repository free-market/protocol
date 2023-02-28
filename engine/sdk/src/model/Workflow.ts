// /**
//  * A parameterized workflow step.
//  *  This is a common base class, subclasses can add step-specific parameters unique to their step.
//  */
// export interface WorkflowStep {
//   stepId: string
// }

// export interface WorkflowAction extends WorkflowStep {
//   actionId: string
//   inputAmount: AssetAmount
//   inputAsset: Asset
//   outputAsset: Asset
// }

// export interface WorkflowBranch extends WorkflowStep {
//   expression: string // TODO arbitrary expressions may be too expensive to implement on-chain
//   ifTrue: string
//   ifFalse: string
// }
