[@fmp/sdk](../README.md) / [Exports](../modules.md) / SerumSwapStep

# Interface: SerumSwapStep

A parameterized workflow step.
 This is a common base class, subclasses can add step-specific parameters unique to their step.

## Hierarchy

- [`WorkflowStep`](WorkflowStep.md)

  ↳ **`SerumSwapStep`**

## Table of contents

### Properties

- [info](SerumSwapStep.md#info)
- [inputAmount](SerumSwapStep.md#inputamount)
- [inputAsset](SerumSwapStep.md#inputasset)
- [outputAsset](SerumSwapStep.md#outputasset)
- [stepId](SerumSwapStep.md#stepid)

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

### outputAsset

• **outputAsset**: [`Asset`](Asset.md) \| ``"none"``

#### Inherited from

[WorkflowStep](WorkflowStep.md).[outputAsset](WorkflowStep.md#outputasset)

#### Defined in

sdk/src/types.ts:54

___

### stepId

• **stepId**: `string`

#### Inherited from

[WorkflowStep](WorkflowStep.md).[stepId](WorkflowStep.md#stepid)

#### Defined in

sdk/src/types.ts:51
