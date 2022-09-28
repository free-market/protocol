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
- [CurveStep](interfaces/CurveStep.md)
- [CurveStepBuilderArgs](interfaces/CurveStepBuilderArgs.md)
- [MangoBuilderArg](interfaces/MangoBuilderArg.md)
- [SerumSwapStep](interfaces/SerumSwapStep.md)
- [Workflow](interfaces/Workflow.md)
- [WorkflowStep](interfaces/WorkflowStep.md)
- [WorkflowStepInfo](interfaces/WorkflowStepInfo.md)
- [WorkflowStepResult](interfaces/WorkflowStepResult.md)
- [WormholeStep](interfaces/WormholeStep.md)

### Type Aliases

- [Address](modules.md#address)
- [ChainName](modules.md#chainname)
- [DoWhileCallback](modules.md#dowhilecallback)
- [EthereumSymbol](modules.md#ethereumsymbol)
- [MangoTokenSymbol](modules.md#mangotokensymbol)
- [MoneyAmount](modules.md#moneyamount)
- [SerumTokenSymbol](modules.md#serumtokensymbol)
- [SolanaSymbol](modules.md#solanasymbol)
- [ThreePoolTokenSymbol](modules.md#threepooltokensymbol)
- [TokenConfig](modules.md#tokenconfig)
- [TokenSymbol](modules.md#tokensymbol)
- [TriCryptoTokenSymbol](modules.md#tricryptotokensymbol)

### Variables

- [ETHEREUM\_TOKENS](modules.md#ethereum_tokens)
- [SOLANA\_TOKENS](modules.md#solana_tokens)
- [TOKENS](modules.md#tokens)

### Functions

- [curveThreePoolSwap](modules.md#curvethreepoolswap)
- [curveTriCryptoSwap](modules.md#curvetricryptoswap)
- [getAccountAsset](modules.md#getaccountasset)
- [getEthereumAsset](modules.md#getethereumasset)
- [getSolanaAsset](modules.md#getsolanaasset)
- [getTestWallet](modules.md#gettestwallet)
- [getTokenAsset](modules.md#gettokenasset)
- [getWormholeTargetSymbol](modules.md#getwormholetargetsymbol)
- [mangoDeposit](modules.md#mangodeposit)
- [mangoWithdrawal](modules.md#mangowithdrawal)
- [serumSwap](modules.md#serumswap)
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

### EthereumSymbol

Ƭ **EthereumSymbol**: keyof typeof [`ETHEREUM_TOKENS`](modules.md#ethereum_tokens)

#### Defined in

sdk/src/assetInfo.ts:115

___

### MangoTokenSymbol

Ƭ **MangoTokenSymbol**: ``"SOL"`` \| ``"USDC"``

#### Defined in

sdk/src/steps/mango.ts:4

___

### MoneyAmount

Ƭ **MoneyAmount**: `bigint` \| `string` \| `number`

Represents an integer or a percentage such as "100%"

#### Defined in

sdk/src/types.ts:2

___

### SerumTokenSymbol

Ƭ **SerumTokenSymbol**: ``"USDCet"`` \| ``"USDC"`` \| ``"USDT"`` \| ``"USDTet"``

#### Defined in

sdk/src/steps/serum.ts:4

___

### SolanaSymbol

Ƭ **SolanaSymbol**: keyof typeof [`SOLANA_TOKENS`](modules.md#solana_tokens)

#### Defined in

sdk/src/assetInfo.ts:116

___

### ThreePoolTokenSymbol

Ƭ **ThreePoolTokenSymbol**: ``"DAI"`` \| ``"USDT"`` \| ``"USDC"``

the set of tokens than can be swapped by Curve 3Pool

#### Defined in

sdk/src/steps/curve.ts:5

___

### TokenConfig

Ƭ **TokenConfig**: `Object`

#### Index signature

▪ [symbol: `string`]: [`Asset`](interfaces/Asset.md)

#### Defined in

sdk/src/assetInfo.ts:3

___

### TokenSymbol

Ƭ **TokenSymbol**: [`EthereumSymbol`](modules.md#ethereumsymbol) \| [`SolanaSymbol`](modules.md#solanasymbol)

Symbols of supported tokens

#### Defined in

sdk/src/assetInfo.ts:119

___

### TriCryptoTokenSymbol

Ƭ **TriCryptoTokenSymbol**: ``"WETH"`` \| ``"WBTC"`` \| ``"USDT"``

the set of tokens than can be swapped by Curve TriCrypto

#### Defined in

sdk/src/steps/curve.ts:8

## Variables

### ETHEREUM\_TOKENS

• `Const` **ETHEREUM\_TOKENS**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `DAI` | { `blockChain`: [`BlockChain`](enums/BlockChain.md) = BlockChain.Ethereum; `info`: { `decimals`: `number` = 18; `fullName`: `string` = 'Dai' } ; `symbol`: `string` = 'DAI'; `type`: [`AssetType`](enums/AssetType.md) = AssetType.token } |
| `DAI.blockChain` | [`BlockChain`](enums/BlockChain.md) |
| `DAI.info` | { `decimals`: `number` = 18; `fullName`: `string` = 'Dai' } |
| `DAI.info.decimals` | `number` |
| `DAI.info.fullName` | `string` |
| `DAI.symbol` | `string` |
| `DAI.type` | [`AssetType`](enums/AssetType.md) |
| `ETH` | { `blockChain`: [`BlockChain`](enums/BlockChain.md) = BlockChain.Ethereum; `info`: { `decimals`: `number` = 18; `fullName`: `string` = 'Ethereum' } ; `symbol`: `string` = 'ETH'; `type`: [`AssetType`](enums/AssetType.md) = AssetType.token } |
| `ETH.blockChain` | [`BlockChain`](enums/BlockChain.md) |
| `ETH.info` | { `decimals`: `number` = 18; `fullName`: `string` = 'Ethereum' } |
| `ETH.info.decimals` | `number` |
| `ETH.info.fullName` | `string` |
| `ETH.symbol` | `string` |
| `ETH.type` | [`AssetType`](enums/AssetType.md) |
| `USDC` | { `blockChain`: [`BlockChain`](enums/BlockChain.md) = BlockChain.Ethereum; `info`: { `decimals`: `number` = 18; `fullName`: `string` = 'USDC (Ethereum)' } ; `symbol`: `string` = 'USDC'; `type`: [`AssetType`](enums/AssetType.md) = AssetType.token } |
| `USDC.blockChain` | [`BlockChain`](enums/BlockChain.md) |
| `USDC.info` | { `decimals`: `number` = 18; `fullName`: `string` = 'USDC (Ethereum)' } |
| `USDC.info.decimals` | `number` |
| `USDC.info.fullName` | `string` |
| `USDC.symbol` | `string` |
| `USDC.type` | [`AssetType`](enums/AssetType.md) |
| `USDT` | { `blockChain`: [`BlockChain`](enums/BlockChain.md) = BlockChain.Ethereum; `info`: { `decimals`: `number` = 18; `fullName`: `string` = 'Tether USD' } ; `symbol`: `string` = 'USDT'; `type`: [`AssetType`](enums/AssetType.md) = AssetType.token } |
| `USDT.blockChain` | [`BlockChain`](enums/BlockChain.md) |
| `USDT.info` | { `decimals`: `number` = 18; `fullName`: `string` = 'Tether USD' } |
| `USDT.info.decimals` | `number` |
| `USDT.info.fullName` | `string` |
| `USDT.symbol` | `string` |
| `USDT.type` | [`AssetType`](enums/AssetType.md) |
| `WBTC` | { `blockChain`: [`BlockChain`](enums/BlockChain.md) = BlockChain.Ethereum; `info`: { `decimals`: `number` = 18; `fullName`: `string` = 'Wrapped Bitcoin' } ; `symbol`: `string` = 'WBTC'; `type`: [`AssetType`](enums/AssetType.md) = AssetType.token } |
| `WBTC.blockChain` | [`BlockChain`](enums/BlockChain.md) |
| `WBTC.info` | { `decimals`: `number` = 18; `fullName`: `string` = 'Wrapped Bitcoin' } |
| `WBTC.info.decimals` | `number` |
| `WBTC.info.fullName` | `string` |
| `WBTC.symbol` | `string` |
| `WBTC.type` | [`AssetType`](enums/AssetType.md) |
| `WETH` | { `blockChain`: [`BlockChain`](enums/BlockChain.md) = BlockChain.Ethereum; `info`: { `decimals`: `number` = 18; `fullName`: `string` = 'Wrapped Ethereum' } ; `symbol`: `string` = 'WETH'; `type`: [`AssetType`](enums/AssetType.md) = AssetType.token } |
| `WETH.blockChain` | [`BlockChain`](enums/BlockChain.md) |
| `WETH.info` | { `decimals`: `number` = 18; `fullName`: `string` = 'Wrapped Ethereum' } |
| `WETH.info.decimals` | `number` |
| `WETH.info.fullName` | `string` |
| `WETH.symbol` | `string` |
| `WETH.type` | [`AssetType`](enums/AssetType.md) |

#### Defined in

sdk/src/assetInfo.ts:5

___

### SOLANA\_TOKENS

• `Const` **SOLANA\_TOKENS**: [`TokenConfig`](modules.md#tokenconfig)

#### Defined in

sdk/src/assetInfo.ts:62

___

### TOKENS

• `Const` **TOKENS**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Ethereum` | { `DAI`: { `blockChain`: [`BlockChain`](enums/BlockChain.md) = BlockChain.Ethereum; `info`: { `decimals`: `number` = 18; `fullName`: `string` = 'Dai' } ; `symbol`: `string` = 'DAI'; `type`: [`AssetType`](enums/AssetType.md) = AssetType.token } ; `ETH`: { `blockChain`: [`BlockChain`](enums/BlockChain.md) = BlockChain.Ethereum; `info`: { `decimals`: `number` = 18; `fullName`: `string` = 'Ethereum' } ; `symbol`: `string` = 'ETH'; `type`: [`AssetType`](enums/AssetType.md) = AssetType.token } ; `USDC`: { `blockChain`: [`BlockChain`](enums/BlockChain.md) = BlockChain.Ethereum; `info`: { `decimals`: `number` = 18; `fullName`: `string` = 'USDC (Ethereum)' } ; `symbol`: `string` = 'USDC'; `type`: [`AssetType`](enums/AssetType.md) = AssetType.token } ; `USDT`: { `blockChain`: [`BlockChain`](enums/BlockChain.md) = BlockChain.Ethereum; `info`: { `decimals`: `number` = 18; `fullName`: `string` = 'Tether USD' } ; `symbol`: `string` = 'USDT'; `type`: [`AssetType`](enums/AssetType.md) = AssetType.token } ; `WBTC`: { `blockChain`: [`BlockChain`](enums/BlockChain.md) = BlockChain.Ethereum; `info`: { `decimals`: `number` = 18; `fullName`: `string` = 'Wrapped Bitcoin' } ; `symbol`: `string` = 'WBTC'; `type`: [`AssetType`](enums/AssetType.md) = AssetType.token } ; `WETH`: { `blockChain`: [`BlockChain`](enums/BlockChain.md) = BlockChain.Ethereum; `info`: { `decimals`: `number` = 18; `fullName`: `string` = 'Wrapped Ethereum' } ; `symbol`: `string` = 'WETH'; `type`: [`AssetType`](enums/AssetType.md) = AssetType.token }  } |
| `Ethereum.DAI` | { `blockChain`: [`BlockChain`](enums/BlockChain.md) = BlockChain.Ethereum; `info`: { `decimals`: `number` = 18; `fullName`: `string` = 'Dai' } ; `symbol`: `string` = 'DAI'; `type`: [`AssetType`](enums/AssetType.md) = AssetType.token } |
| `Ethereum.DAI.blockChain` | [`BlockChain`](enums/BlockChain.md) |
| `Ethereum.DAI.info` | { `decimals`: `number` = 18; `fullName`: `string` = 'Dai' } |
| `Ethereum.DAI.info.decimals` | `number` |
| `Ethereum.DAI.info.fullName` | `string` |
| `Ethereum.DAI.symbol` | `string` |
| `Ethereum.DAI.type` | [`AssetType`](enums/AssetType.md) |
| `Ethereum.ETH` | { `blockChain`: [`BlockChain`](enums/BlockChain.md) = BlockChain.Ethereum; `info`: { `decimals`: `number` = 18; `fullName`: `string` = 'Ethereum' } ; `symbol`: `string` = 'ETH'; `type`: [`AssetType`](enums/AssetType.md) = AssetType.token } |
| `Ethereum.ETH.blockChain` | [`BlockChain`](enums/BlockChain.md) |
| `Ethereum.ETH.info` | { `decimals`: `number` = 18; `fullName`: `string` = 'Ethereum' } |
| `Ethereum.ETH.info.decimals` | `number` |
| `Ethereum.ETH.info.fullName` | `string` |
| `Ethereum.ETH.symbol` | `string` |
| `Ethereum.ETH.type` | [`AssetType`](enums/AssetType.md) |
| `Ethereum.USDC` | { `blockChain`: [`BlockChain`](enums/BlockChain.md) = BlockChain.Ethereum; `info`: { `decimals`: `number` = 18; `fullName`: `string` = 'USDC (Ethereum)' } ; `symbol`: `string` = 'USDC'; `type`: [`AssetType`](enums/AssetType.md) = AssetType.token } |
| `Ethereum.USDC.blockChain` | [`BlockChain`](enums/BlockChain.md) |
| `Ethereum.USDC.info` | { `decimals`: `number` = 18; `fullName`: `string` = 'USDC (Ethereum)' } |
| `Ethereum.USDC.info.decimals` | `number` |
| `Ethereum.USDC.info.fullName` | `string` |
| `Ethereum.USDC.symbol` | `string` |
| `Ethereum.USDC.type` | [`AssetType`](enums/AssetType.md) |
| `Ethereum.USDT` | { `blockChain`: [`BlockChain`](enums/BlockChain.md) = BlockChain.Ethereum; `info`: { `decimals`: `number` = 18; `fullName`: `string` = 'Tether USD' } ; `symbol`: `string` = 'USDT'; `type`: [`AssetType`](enums/AssetType.md) = AssetType.token } |
| `Ethereum.USDT.blockChain` | [`BlockChain`](enums/BlockChain.md) |
| `Ethereum.USDT.info` | { `decimals`: `number` = 18; `fullName`: `string` = 'Tether USD' } |
| `Ethereum.USDT.info.decimals` | `number` |
| `Ethereum.USDT.info.fullName` | `string` |
| `Ethereum.USDT.symbol` | `string` |
| `Ethereum.USDT.type` | [`AssetType`](enums/AssetType.md) |
| `Ethereum.WBTC` | { `blockChain`: [`BlockChain`](enums/BlockChain.md) = BlockChain.Ethereum; `info`: { `decimals`: `number` = 18; `fullName`: `string` = 'Wrapped Bitcoin' } ; `symbol`: `string` = 'WBTC'; `type`: [`AssetType`](enums/AssetType.md) = AssetType.token } |
| `Ethereum.WBTC.blockChain` | [`BlockChain`](enums/BlockChain.md) |
| `Ethereum.WBTC.info` | { `decimals`: `number` = 18; `fullName`: `string` = 'Wrapped Bitcoin' } |
| `Ethereum.WBTC.info.decimals` | `number` |
| `Ethereum.WBTC.info.fullName` | `string` |
| `Ethereum.WBTC.symbol` | `string` |
| `Ethereum.WBTC.type` | [`AssetType`](enums/AssetType.md) |
| `Ethereum.WETH` | { `blockChain`: [`BlockChain`](enums/BlockChain.md) = BlockChain.Ethereum; `info`: { `decimals`: `number` = 18; `fullName`: `string` = 'Wrapped Ethereum' } ; `symbol`: `string` = 'WETH'; `type`: [`AssetType`](enums/AssetType.md) = AssetType.token } |
| `Ethereum.WETH.blockChain` | [`BlockChain`](enums/BlockChain.md) |
| `Ethereum.WETH.info` | { `decimals`: `number` = 18; `fullName`: `string` = 'Wrapped Ethereum' } |
| `Ethereum.WETH.info.decimals` | `number` |
| `Ethereum.WETH.info.fullName` | `string` |
| `Ethereum.WETH.symbol` | `string` |
| `Ethereum.WETH.type` | [`AssetType`](enums/AssetType.md) |
| `solana` | [`TokenConfig`](modules.md#tokenconfig) |

#### Defined in

sdk/src/assetInfo.ts:110

## Functions

### curveThreePoolSwap

▸ **curveThreePoolSwap**(`args`): [`WorkflowStep`](interfaces/WorkflowStep.md)

define a workflow step that does a token swap using Curve 3Pool

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CurveStepBuilderArgs`](interfaces/CurveStepBuilderArgs.md)<[`ThreePoolTokenSymbol`](modules.md#threepooltokensymbol)\> |

#### Returns

[`WorkflowStep`](interfaces/WorkflowStep.md)

#### Defined in

sdk/src/steps/curve.ts:45

___

### curveTriCryptoSwap

▸ **curveTriCryptoSwap**(`args`): [`WorkflowStep`](interfaces/WorkflowStep.md)

define a workflow step that does a token swap using Curve 3Pool

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CurveStepBuilderArgs`](interfaces/CurveStepBuilderArgs.md)<[`TriCryptoTokenSymbol`](modules.md#tricryptotokensymbol)\> |

#### Returns

[`WorkflowStep`](interfaces/WorkflowStep.md)

#### Defined in

sdk/src/steps/curve.ts:59

___

### getAccountAsset

▸ **getAccountAsset**(`chainName`, `exchange`, `tokenSymbol`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `chainName` | ``"Ethereum"`` \| ``"Solana"`` |
| `exchange` | `string` |
| `tokenSymbol` | [`TokenSymbol`](modules.md#tokensymbol) |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `blockChain` | [`BlockChain`](enums/BlockChain.md) |
| `info` | { `decimals`: `number` ; `decimals2?`: `number` ; `fullName`: `string`  } |
| `info.decimals` | `number` |
| `info.decimals2?` | `number` |
| `info.fullName` | `string` |
| `symbol` | `string` |
| `type` | [`AssetType`](enums/AssetType.md) |

#### Defined in

sdk/src/assetInfo.ts:139

___

### getEthereumAsset

▸ **getEthereumAsset**(`symbol`): [`Asset`](interfaces/Asset.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `symbol` | ``"ETH"`` \| ``"WETH"`` \| ``"USDT"`` \| ``"USDC"`` \| ``"DAI"`` \| ``"WBTC"`` |

#### Returns

[`Asset`](interfaces/Asset.md)

#### Defined in

sdk/src/assetInfo.ts:130

___

### getSolanaAsset

▸ **getSolanaAsset**(`symbol`): [`Asset`](interfaces/Asset.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `symbol` | `string` \| `number` |

#### Returns

[`Asset`](interfaces/Asset.md)

#### Defined in

sdk/src/assetInfo.ts:134

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

### getTokenAsset

▸ **getTokenAsset**(`chainName`, `tokenSymbol`): [`Asset`](interfaces/Asset.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `chainName` | ``"Ethereum"`` \| ``"Solana"`` |
| `tokenSymbol` | [`TokenSymbol`](modules.md#tokensymbol) |

#### Returns

[`Asset`](interfaces/Asset.md)

#### Defined in

sdk/src/assetInfo.ts:121

___

### getWormholeTargetSymbol

▸ **getWormholeTargetSymbol**(`sourceChain`, `sourceToken`, `targetChain`): [`TokenSymbol`](modules.md#tokensymbol)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sourceChain` | ``"Ethereum"`` \| ``"Solana"`` |
| `sourceToken` | [`TokenSymbol`](modules.md#tokensymbol) |
| `targetChain` | ``"Ethereum"`` \| ``"Solana"`` |

#### Returns

[`TokenSymbol`](modules.md#tokensymbol)

#### Defined in

sdk/src/steps/wormhole.ts:23

___

### mangoDeposit

▸ **mangoDeposit**(`arg`): [`WorkflowStep`](interfaces/WorkflowStep.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | [`MangoBuilderArg`](interfaces/MangoBuilderArg.md) |

#### Returns

[`WorkflowStep`](interfaces/WorkflowStep.md)

#### Defined in

sdk/src/steps/mango.ts:31

___

### mangoWithdrawal

▸ **mangoWithdrawal**(`arg`): [`WorkflowStep`](interfaces/WorkflowStep.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | [`MangoBuilderArg`](interfaces/MangoBuilderArg.md) |

#### Returns

[`WorkflowStep`](interfaces/WorkflowStep.md)

#### Defined in

sdk/src/steps/mango.ts:42

___

### serumSwap

▸ **serumSwap**(`arg`): [`WorkflowStep`](interfaces/WorkflowStep.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | `SerumSwapBuilderArg` |

#### Returns

[`WorkflowStep`](interfaces/WorkflowStep.md)

#### Defined in

sdk/src/steps/serum.ts:25

___

### wethUnwrap

▸ **wethUnwrap**(`arg`): [`WorkflowStep`](interfaces/WorkflowStep.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | `WethBuilderArg` |

#### Returns

[`WorkflowStep`](interfaces/WorkflowStep.md)

#### Defined in

sdk/src/steps/weth.ts:37

___

### wethWrap

▸ **wethWrap**(`arg`): [`WorkflowStep`](interfaces/WorkflowStep.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | `WethBuilderArg` |

#### Returns

[`WorkflowStep`](interfaces/WorkflowStep.md)

#### Defined in

sdk/src/steps/weth.ts:26

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
