[@fmp/sdk](../README.md) / [Exports](../modules.md) / CurveStep

# Interface: CurveStep

A parameterized workflow step.
 This is a common base class, subclasses can add step-specific parameters unique to their step.

## Hierarchy

- [`WorkflowStep`](WorkflowStep.md)

  ↳ **`CurveStep`**

## Table of contents

### Properties

- [info](CurveStep.md#info)
- [inputAmount](CurveStep.md#inputamount)
- [inputAsset](CurveStep.md#inputasset)
- [inputIndex](CurveStep.md#inputindex)
- [outputAsset](CurveStep.md#outputasset)
- [outputIndex](CurveStep.md#outputindex)
- [stepId](CurveStep.md#stepid)

## Properties

### info

• **info**: [`WorkflowStepInfo`](WorkflowStepInfo.md)

#### Inherited from

[WorkflowStep](WorkflowStep.md).[info](WorkflowStep.md#info)

#### Defined in

sdk/src/types.ts:55

___

### inputAmount

• **inputAmount**: [`MoneyAmount`](../modules.md#moneyamount)

#### Inherited from

[WorkflowStep](WorkflowStep.md).[inputAmount](WorkflowStep.md#inputamount)

#### Defined in

sdk/src/types.ts:52

___

### inputAsset

• **inputAsset**: [`Asset`](Asset.md)

#### Inherited from

[WorkflowStep](WorkflowStep.md).[inputAsset](WorkflowStep.md#inputasset)

#### Defined in

sdk/src/types.ts:53

___

### inputIndex

• **inputIndex**: `number`

#### Defined in

sdk/src/steps/curve.ts:11

___

### outputAsset

• **outputAsset**: [`Asset`](Asset.md) \| ``"none"``

#### Inherited from

[WorkflowStep](WorkflowStep.md).[outputAsset](WorkflowStep.md#outputasset)

#### Defined in

sdk/src/types.ts:54

___

### outputIndex

• **outputIndex**: `number`

#### Defined in

sdk/src/steps/curve.ts:12

___

### stepId

• **stepId**: `string`

#### Inherited from

[WorkflowStep](WorkflowStep.md).[stepId](WorkflowStep.md#stepid)

#### Defined in

sdk/src/types.ts:51
