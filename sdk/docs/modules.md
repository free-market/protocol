[@fmp/sdk](README.md) / Exports

# @fmp/sdk

Free Market Protocol SDK

## Table of contents

### Enumerations

- [AssetType](enums/AssetType.md)
- [BlockChain](enums/BlockChain.md)

### Classes

- [WorkflowBuilder](classes/WorkflowBuilder.md)

### Interfaces

- [Asset](interfaces/Asset.md)
- [AssetBalance](interfaces/AssetBalance.md)
- [AssetInfo](interfaces/AssetInfo.md)
- [Workflow](interfaces/Workflow.md)
- [WorkflowStep](interfaces/WorkflowStep.md)
- [WorkflowStepInfo](interfaces/WorkflowStepInfo.md)
- [WorkflowStepResult](interfaces/WorkflowStepResult.md)

### Type Aliases

- [Address](modules.md#address)
- [ChainName](modules.md#chainname)
- [DoWhileCallback](modules.md#dowhilecallback)
- [MoneyAmount](modules.md#moneyamount)

### Functions

- [curveThreePoolSwap](modules.md#curvethreepoolswap)
- [curveTriCryptoSwap](modules.md#curvetricryptoswap)
- [getTestWallet](modules.md#gettestwallet)
- [mangoDeposit](modules.md#mangodeposit)
- [mangoWithdrawal](modules.md#mangowithdrawal)
- [saberSwap](modules.md#saberswap)
- [wethUnwrap](modules.md#wethunwrap)
- [wethWrap](modules.md#wethwrap)
- [wormholeTokenTransfer](modules.md#wormholetokentransfer)

## Type Aliases

### Address

Ƭ **Address**: `string`

Address of a wallet/account/contract.  Usually is a base58 encoding of a byte array, but exact specs for this string very by blockchain.

#### Defined in

sdk/src/types.ts:5

___

### ChainName

Ƭ **ChainName**: keyof typeof [`BlockChain`](enums/BlockChain.md)

The names of blockchains as a string union.

#### Defined in

sdk/src/types.ts:14

___

### DoWhileCallback

Ƭ **DoWhileCallback**: (`stepResult`: [`WorkflowStepResult`](interfaces/WorkflowStepResult.md)) => `boolean` \| `Promise`<`boolean`\>

#### Type declaration

▸ (`stepResult`): `boolean` \| `Promise`<`boolean`\>

A callback implelemented by the integrator to determine when to exit a workflow loop based on WorkflowStepResult

##### Parameters

| Name | Type |
| :------ | :------ |
| `stepResult` | [`WorkflowStepResult`](interfaces/WorkflowStepResult.md) |

##### Returns

`boolean` \| `Promise`<`boolean`\>

#### Defined in

sdk/src/builder/WorkflowBuilder.ts:9

___

### MoneyAmount

Ƭ **MoneyAmount**: `bigint` \| `string` \| `number`

Represents an integer or a percentage such as "100%"

#### Defined in

sdk/src/types.ts:2

## Functions

### curveThreePoolSwap

▸ **curveThreePoolSwap**(`args`): [`WorkflowStep`](interfaces/WorkflowStep.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `CurveStepBuilderArgs`<`ThreePoolTokenSymbol`\> |

#### Returns

[`WorkflowStep`](interfaces/WorkflowStep.md)

#### Defined in

sdk/src/steps/curve.ts:35

___

### curveTriCryptoSwap

▸ **curveTriCryptoSwap**(`args`): [`WorkflowStep`](interfaces/WorkflowStep.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `CurveStepBuilderArgs`<`TriCryptoTokenSymbol`\> |

#### Returns

[`WorkflowStep`](interfaces/WorkflowStep.md)

#### Defined in

sdk/src/steps/curve.ts:47

___

### getTestWallet

▸ **getTestWallet**(`testAccountIndex`, `provider`): `ethers.Wallet`

#### Parameters

| Name | Type |
| :------ | :------ |
| `testAccountIndex` | `number` |
| `provider` | `Provider` |

#### Returns

`ethers.Wallet`

#### Defined in

evm/utils/ganachUtils.ts:22

___

### mangoDeposit

▸ **mangoDeposit**(`arg`): [`WorkflowStep`](interfaces/WorkflowStep.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | `MangoBuilderArg` |

#### Returns

[`WorkflowStep`](interfaces/WorkflowStep.md)

#### Defined in

sdk/src/steps/mango.ts:35

___

### mangoWithdrawal

▸ **mangoWithdrawal**(`arg`): [`WorkflowStep`](interfaces/WorkflowStep.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | `MangoBuilderArg` |

#### Returns

[`WorkflowStep`](interfaces/WorkflowStep.md)

#### Defined in

sdk/src/steps/mango.ts:46

___

### saberSwap

▸ **saberSwap**(`arg`): [`WorkflowStep`](interfaces/WorkflowStep.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | `SaberSwapBuilderArg` |

#### Returns

[`WorkflowStep`](interfaces/WorkflowStep.md)

#### Defined in

sdk/src/steps/saber.ts:25

___

### wethUnwrap

▸ **wethUnwrap**(`arg`): `WethStep`

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | `WethBuilderArg` |

#### Returns

`WethStep`

#### Defined in

sdk/src/steps/weth.ts:41

___

### wethWrap

▸ **wethWrap**(`arg`): `WethStep`

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | `WethBuilderArg` |

#### Returns

`WethStep`

#### Defined in

sdk/src/steps/weth.ts:30

___

### wormholeTokenTransfer

▸ **wormholeTokenTransfer**(`args`): [`WorkflowStep`](interfaces/WorkflowStep.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `WormholeTokenTransferBuilderArgs` |

#### Returns

[`WorkflowStep`](interfaces/WorkflowStep.md)

#### Defined in

sdk/src/steps/wormhole.ts:47
