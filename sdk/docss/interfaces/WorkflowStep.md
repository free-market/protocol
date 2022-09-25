[@fmp/sdk](../docs/README.md) / [Exports](../modules.md) / WorkflowStep

# Interface: WorkflowStep

A parameterized workflow step.
 This is a common base class, subclasses can add step-specific parameters unique to their step.

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

[sdk/src/types.ts:55](https://github.com/free-market/platform/blob/c18767c/sdk/src/types.ts#L55)

___

### inputAmount

• **inputAmount**: [`MoneyAmount`](../modules.md#moneyamount)

#### Defined in

[sdk/src/types.ts:52](https://github.com/free-market/platform/blob/c18767c/sdk/src/types.ts#L52)

___

### inputAsset

• **inputAsset**: [`Asset`](Asset.md)

#### Defined in

[sdk/src/types.ts:53](https://github.com/free-market/platform/blob/c18767c/sdk/src/types.ts#L53)

___

### outputAsset

• **outputAsset**: [`Asset`](Asset.md) \| ``"none"``

#### Defined in

[sdk/src/types.ts:54](https://github.com/free-market/platform/blob/c18767c/sdk/src/types.ts#L54)

___

### stepId

• **stepId**: `string`

#### Defined in

[sdk/src/types.ts:51](https://github.com/free-market/platform/blob/c18767c/sdk/src/types.ts#L51)
