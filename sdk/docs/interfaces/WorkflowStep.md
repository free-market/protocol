[@fmp/sdk](../README.md) / [Exports](../modules.md) / WorkflowStep

# Interface: WorkflowStep

A parameterized workflow step.
 This is a common base class, subclasses can add step-specific parameters unique to their step.

## Hierarchy

- **`WorkflowStep`**

  ↳ [`CurveStep`](CurveStep.md)

  ↳ [`SerumSwapStep`](SerumSwapStep.md)

  ↳ [`WormholeStep`](WormholeStep.md)

## Table of contents

### Properties

- [info](WorkflowStep.md#info)
- [inputAmount](WorkflowStep.md#inputamount)
- [inputAsset](WorkflowStep.md#inputasset)
- [outputAsset](WorkflowStep.md#outputasset)
- [stepId](WorkflowStep.md#stepid)

## Properties

### info

• **info**: [`WorkflowStepInfo`](WorkflowStepInfo.md)

#### Defined in

sdk/src/types.ts:55

___

### inputAmount

• **inputAmount**: [`MoneyAmount`](../modules.md#moneyamount)

#### Defined in

sdk/src/types.ts:52

___

### inputAsset

• **inputAsset**: [`Asset`](Asset.md)

#### Defined in

sdk/src/types.ts:53

___

### outputAsset

• **outputAsset**: [`Asset`](Asset.md) \| ``"none"``

#### Defined in

sdk/src/types.ts:54

___

### stepId

• **stepId**: `string`

#### Defined in

sdk/src/types.ts:51
