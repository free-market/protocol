[@fmp/sdk](../README.md) / [Exports](../modules.md) / WormholeStep

# Interface: WormholeStep

A parameterized workflow step.
 This is a common base class, subclasses can add step-specific parameters unique to their step.

## Hierarchy

- [`WorkflowStep`](WorkflowStep.md)

  ↳ **`WormholeStep`**

## Table of contents

### Properties

- [info](WormholeStep.md#info)
- [inputAmount](WormholeStep.md#inputamount)
- [inputAsset](WormholeStep.md#inputasset)
- [outputAsset](WormholeStep.md#outputasset)
- [sourceChain](WormholeStep.md#sourcechain)
- [stepId](WormholeStep.md#stepid)
- [targetChain](WormholeStep.md#targetchain)

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

### sourceChain

• **sourceChain**: [`BlockChain`](../enums/BlockChain.md)

#### Defined in

sdk/src/steps/wormhole.ts:5

___

### stepId

• **stepId**: `string`

#### Inherited from

[WorkflowStep](WorkflowStep.md).[stepId](WorkflowStep.md#stepid)

#### Defined in

sdk/src/types.ts:51

___

### targetChain

• **targetChain**: [`BlockChain`](../enums/BlockChain.md)

#### Defined in

sdk/src/steps/wormhole.ts:6
