[@fmp/sdk](../README.md) / [Exports](../modules.md) / CurveStepBuilderArgs

# Interface: CurveStepBuilderArgs<Symbols\>

Arguments for Curve workflow steps

## Type parameters

| Name | Description |
| :------ | :------ |
| `Symbols` | The allowable set of crypto symbols (as a string union) |

## Table of contents

### Properties

- [amount](CurveStepBuilderArgs.md#amount)
- [from](CurveStepBuilderArgs.md#from)
- [to](CurveStepBuilderArgs.md#to)

## Properties

### amount

• **amount**: [`MoneyAmount`](../modules.md#moneyamount)

the amount to swap (in term of the from token)

#### Defined in

sdk/src/steps/curve.ts:24

___

### from

• **from**: `Symbols`

the token the Curve workflow step will swap from

#### Defined in

sdk/src/steps/curve.ts:20

___

### to

• **to**: `Symbols`

the token the Curve workflow step will swap to

#### Defined in

sdk/src/steps/curve.ts:22
